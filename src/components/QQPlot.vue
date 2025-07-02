<script setup>

import { onMounted, ref } from 'vue';
import * as d3 from 'd3'
import _ from 'underscore'

const props = defineProps({
    data: {
        qq : {
            type : Object,
            required : true,
        },
        dimensions : {
            type: Array,
            required : false
        }
    },
});

const info = ref(null);
const qqPlotContainer = ref(null);
const gcLambdaText = ref(null)

onMounted(() => {
    info.value = props.data

    createQQPlot(info.value.qq, info.value.dimensions[0], info.value.dimensions[1])
    calculateGCLambda(info.value.qq)
});

function fmt(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
        return (typeof args[number] != 'undefined') ? args[number] : match;
    });
}

function calculateGCLambda(data){

    var gc = ''
    _.sortBy(_.pairs(data.overall.gc_lambda), function(d) {return -d[0];}).forEach(function(d, j) {
        var text = 'GC lambda ' + d[0] + ': ' + d[1].toFixed(3);
        if (j === 0) { text = '<b>' + text + '</b>'; }
        gc += '<br>' + text;
    });

    gcLambdaText.value = gc
}

function createQQPlot(data, height = null, width = null) {

    // id with different all data
    // var type = data.type.replace(/[ .]/g, "_")
    var qq_ci = data.ci;
    var maf_ranges = data.by_maf;    

    maf_ranges.forEach(function(maf_range, i) {
        maf_range.color = ['#e66101', '#fdb863', '#b2abd2', '#5e3c99'][i];
    })

    
    if (width == null){
        var exp_max = d3.max(maf_ranges, function(maf_range) {
            return maf_range.qq.max_exp_qval;
        });
    } else {
        var exp_max = width
    }

    if (height == null){
        // Note: we already removed all observed -log10(pval)s > ceil(exp_max*2) in python, so we can just use the max observed here.
        var obs_max = d3.max(maf_ranges, function(maf_range) {
            return d3.max(maf_range.qq.bins, function(bin) {
                return bin[1];
            });
        });
    } else {
        var obs_max = height
    }

    obs_max = Math.max(obs_max, exp_max);
    obs_max = Math.ceil(obs_max) + 0.01; // The 0.01 makes sure the integer tick will be shown.

    // Your D3 code to create the plot here, using svg_width
    var plot_margin = {
        'left': 30,
        'right': 30,
        'top': 10,
        'bottom': 140,
    };

    var svg_width = qqPlotContainer.value.clientWidth;
    var plot_width = svg_width - plot_margin.left - plot_margin.right;
    
    // Size the plot to make things square.  This way, x_scale and y_scale should be exactly equivalent.
    var plot_height = plot_width / exp_max * obs_max;
    var svg_height = plot_height + plot_margin.top + plot_margin.bottom;

    // Remove any previous SVGs to avoid duplication when the component is used multiple times
    d3.select(qqPlotContainer.value).selectAll("svg").remove();

    // TODO: use a clip path to keep qq_ci below the upper edge
    var qq_svg = d3.select(qqPlotContainer.value).append("svg")
        .attr('id', 'qq_svg')
        .attr("width", svg_width)
        .attr("height", svg_height)
        .style("display", "block")
        .style("margin", "auto");
        
    var qq_plot = qq_svg.append("g")
        .attr('id', 'qq_plot')
        .attr("transform", fmt("translate({0},{1})", plot_margin.left, plot_margin.top));

    var x_scale = d3.scaleLinear()
        .domain([0, exp_max])
        .range([0, plot_width]);
    var y_scale = d3.scaleLinear()
        .domain([0, obs_max])
        .range([plot_height, 0]);

    // "trumpet" CI path
    qq_plot.append('path')
        .attr('class', 'trumpet_ci')
        .datum(qq_ci)
        .attr("d", d3.area()
            .x( function(d) {
                return x_scale(d.x);
            }).y0( function(d) {
                return y_scale(d.y_max + .05)
            }).y1( function(d) {
                return y_scale(Math.max(0, d.y_min - .05));
            }))
        .style("fill", "lightgray");

    // points
    qq_plot.append('g')
        .selectAll('g.qq_points')
        .data(maf_ranges)
        .enter()
        .append('g')
        .attr('data-index', function(d, i) { return i; }) // make parent index available from DOM
        .attr('class', 'qq_points')
        .selectAll('circle.qq_point')
        .data(function(maf_range) { return maf_range.qq.bins })
        .enter()
        .append('circle')
        .attr('cx', function(d) { return x_scale(d[0]); })
        .attr('cy', function(d) { return y_scale(d[1]); })
        .attr('r', 1.5)
        .attr('fill', function (d, i) {
            // Nested selections, d3 v4 workaround
            var parent_index = +this.parentNode.getAttribute('data-index');
            return maf_ranges[parent_index].color;
        });

    var attempt_two_decimals = function(x) {
        if (x == 0) return '0';
        if (x >= 0.01) return x.toFixed(2);
        if (x >= 0.001) return x.toFixed(3);
        return x.toExponential(0);
    };

    // Legend
    qq_svg.append('g')
        .attr('transform', fmt('translate({0},{1})',
                            0,
                            plot_margin.top + plot_height + 80))
        .append('text')
        .attr('text-anchor', 'start')
        .attr('y', '-1em')
        .text('MAF ranges per quartile')
        .style('font-weight', 'bold');

    qq_svg.append('g')
        .attr('transform', fmt('translate({0},{1})',
                            0,
                            plot_margin.top + plot_height + 82))
        .selectAll('text.legend-items')
        .data(maf_ranges)
        .enter()
        .append('text')
        .attr('text-anchor', 'start')
        .attr('y', function(d,i) {
            return i + 'em';
        })
        .text(function(d) {
            return fmt('{0} ≤ MAF < {1} ({2})',
                    attempt_two_decimals(d.maf_range[0]),
                    attempt_two_decimals(d.maf_range[1]),
                    new Intl.NumberFormat('en-CA', { maximumSignificantDigits: 3 }).format(
                        d.count,
                    ));
        })
        .attr('fill', function(d) {
            return d.color;
        });

    // Axes
    var xAxis = d3.axisBottom(x_scale)
        .tickSizeInner(-plot_height) // this approach to a grid is taken from <http://bl.ocks.org/hunzy/11110940>
        .tickSizeOuter(0)
        .tickPadding(7)
        .tickFormat(d3.format("d")) //integers
        .tickValues(_.range(exp_max)); //prevent unlabeled, non-integer ticks.
    qq_plot.append("g")
        .attr("class", "x axis")
        .attr("transform", fmt("translate(0,{0})", plot_height))
        .call(xAxis);

    var y_axis = d3.axisLeft(y_scale)
        .tickSizeInner(-plot_width)
        .tickSizeOuter(0)
        .tickPadding(7)
        .tickFormat(d3.format("d")) //integers
        .tickValues(_.range(obs_max)); //prevent unlabeled, non-integer ticks.
    qq_plot.append("g")
        .attr("class", "y axis")
        .call(y_axis);

    qq_svg.append('text')
        .style('text-anchor', 'middle')
        .attr('transform', fmt('translate({0},{1})rotate(-90)',
                            plot_margin.left*.4,
                            plot_margin.top + plot_height/2))
        .text('observed -log\u2081\u2080(p)');

    qq_svg.append('text')
        .style('text-anchor', 'middle')
        .attr('transform', fmt('translate({0},{1})',
                            plot_margin.left + plot_width/2,
                            plot_margin.top + plot_height + 35))
        .text('expected -log\u2081\u2080(p)');

}

</script>


<template>
    <div>
        <div class="qq-chart" ref="qqPlotContainer"></div>
        <div class="gc-lambda" v-html="gcLambdaText"></div>
    </div>

</template>

<style lang="scss">
.qq-chart {
    width: 300px;
    // max-width: 400px; 
    // min-width: 250px; 
    // height:300px;
}
.qq-chart .axis path.domain {
    stroke: black;
    fill: none;
  }
.qq-chart g.tick line {
    stroke: #666;
    opacity: 0.3;
}
</style>