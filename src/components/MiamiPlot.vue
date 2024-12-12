<script setup>
import axios from 'axios';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import _ from 'underscore'

import * as utils from '../pages/pheno/Pheno.js'

const point_radius = 2.3;

const props = defineProps({
    data: {
        String : {String : Object, String : Object},
        String : {String : Object, String : Object}
    }
});

const info = ref(null);
const miamiPlotContainer = ref(null)

const showExpanded = ref(false);
const showExpandedClick = ref(false)
const minFreq = ref(0);
const maxFreq = ref(0.5);
const selectedType = ref('Both');
const hiddenToggle = ref(null);
const tooltip_showing = ref(false)

// Close tooltip function
const hideTooltip = () => {
    if (tooltip_showing.value) {
        point_tooltip.value.hide();
        tooltip_showing.value = false;
    }
};


const get_chrom_offsets_data1 = ref(null)
const get_chrom_offsets_data2 = ref(null)
const point_tooltip = ref(null)
const plot_width = ref(null)
const plot_height = ref(null)
const x_scale = ref(null)
const y_scale_data1 = ref(null)
const y_scale_data2 = ref(null)

const pheno1 = ref(null);
const pheno2 = ref(null);

const emit = defineEmits(['updateFilteringParams', 'updateChosenVariant']);

const chosenVariant = ref(null);
const toggleExpanded = () => {
  showExpandedClick.value = !showExpandedClick.value;

  if (showExpandedClick.value){
    hiddenToggle.value.style.backgroundColor = 'darkblue'
  } else {
    hiddenToggle.value.style.backgroundColor = 'blue'
  }
};

const selectType = (type) => {
  selectedType.value = type;
};

const createMiamis = (option) => {
    var keys = Object.keys(info.value)

    // this means that the same object was passed (eurofemale and eurofemale, for example)
    // (don't know why a user would want this... but it's better than crashing)
    pheno1.value = keys[0]
    pheno2.value = keys[1] || keys[0]

    create_miami_plot(
        info.value[pheno1.value]['variant_bins'], info.value[pheno1.value]['unbinned_variants'],
        info.value[pheno2.value]['variant_bins'], info.value[pheno2.value]['unbinned_variants'],
        pheno1.value, pheno2.value,
        option
    )

}

const cancelFilter = () => {
    createMiamis('all')
}

const applyFilter = () => {

  createMiamis('filtered');
  refilter();
};

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const route = useRoute();
const phenocode = route.params.phenocode;
// Add event listener to document to close tooltip when clicking outside
onMounted(() => {
    info.value = props.data;
    document.addEventListener('click', function(event) {
        if (tooltip_showing.value && !d3.select(event.target).classed('variant_point')) {
            // Hide the tooltip if clicking outside a variant point
            point_tooltip.value.hide();
            tooltip_showing.value = false;
        }
    });

    createMiamis('all');
});

const downloadSVG = () => {
  // svg to string
  const svg = miamiPlotContainer.value.querySelector('svg');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);

  // blob is a format that will allow it to be downloaded
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

  // Create a download link
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'image.svg';

  // hacky way to trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url); 
};

const downloadPNG = () => {
    // I can probably do when done calling createMiamiPlot so that I don't have to redo..
  const svg = miamiPlotContainer.value.querySelector('svg');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;
    const context = canvas.getContext('2d');

    context.drawImage(img, 0, 0);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'image.png';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url); 
  };

  img.src = url;
};

function get_link_to_LZ_data1(variant) {
    return utils.fmt(`${window.location.origin}` + '/phenotypes/{0}/region/{1}:{2}-{3}',
                phenocode,
                variant.chrom,
                Math.max(0, variant.pos - 200*1000),
                variant.pos + 200*1000);
}

function get_link_to_LZ_data2(variant) {
    return utils.fmt(`${window.location.origin}` + '/phenotypes/{0}/region/{1}:{2}-{3}',
                phenocode,
                variant.chrom,
                Math.max(0, variant.pos - 200*1000),
                variant.pos + 200*1000);
}

function create_miami_plot(variant_bins1, variant_unbinned1, variant_bins2, variant_unbinned2, label1 = "Data 1", label2 = "Data 2", variants = "filtered"){

    reset_for_miami_plot();

    // Order from weakest to strongest pvalue, so that the strongest variant will be on top (z-order) and easily hoverable
    // In the DOM, later siblings are displayed over top of (and occluding) earlier siblings.
    variant_unbinned1 = _.sortBy(variant_unbinned1, function(d){return -d.pval});
    variant_unbinned2 = _.sortBy(variant_unbinned2, function(d){return -d.pval})
    
    if (variant_bins1 != null){

        if (variant_bins1.length && typeof variant_bins1[0].qvals === "undefined") {
            // this json was generated by an old version of pheweb, so we'll manually fix things up.
            variant_bins1.forEach(function(bin) {
                bin.qvals = bin.neglog10_pvals;
                bin.qval_extents = bin.neglog10_pval_extents;
            });
        }
        get_chrom_offsets_data1.value = _.memoize(function() {
            var chrom_padding = 2e7;
            var chrom_extents = {};
    
            var update_chrom_extents = function(variant) {
                if (!(variant.chrom in chrom_extents)) {
                    chrom_extents[variant.chrom] = [variant.pos, variant.pos];
                } else if (variant.pos > chrom_extents[variant.chrom][1]) {
                    chrom_extents[variant.chrom][1] = variant.pos;
                } else if (variant.pos < chrom_extents[variant.chrom][0]) {
                    chrom_extents[variant.chrom][0] = variant.pos;
                }
            }
            variant_bins1.forEach(update_chrom_extents);
            variant_unbinned1.forEach(update_chrom_extents);
    
            var chroms = _.sortBy(Object.keys(chrom_extents), parseInt);
    
            var chrom_genomic_start_positions = {};
            chrom_genomic_start_positions[chroms[0]] = 0;
            for (var i=1; i<chroms.length; i++) {
                chrom_genomic_start_positions[chroms[i]] = chrom_genomic_start_positions[chroms[i-1]] + chrom_extents[chroms[i-1]][1] - chrom_extents[chroms[i-1]][0] + chrom_padding;
            }
    
            // chrom_offsets are defined to be the numbers that make `get_genomic_position()` work.
            // ie, they leave a gap of `chrom_padding` between the last variant on one chromosome and the first on the next.
            var chrom_offsets = {};
            Object.keys(chrom_genomic_start_positions).forEach(function(chrom) {
                chrom_offsets[chrom] = chrom_genomic_start_positions[chrom] - chrom_extents[chrom][0];
            });
    
            return {
                chrom_extents: chrom_extents,
                chroms: chroms,
                chrom_genomic_start_positions: chrom_genomic_start_positions,
                chrom_offsets: chrom_offsets,
            };
        });
    }

    if (variant_bins2 != null){
        if (variant_bins2.length && typeof variant_bins2[0].qvals === "undefined") {
            // this json was generated by an old version of pheweb, so we'll manually fix things up.
            variant_bins2.forEach(function(bin) {
                bin.qvals = bin.neglog10_pvals;
                bin.qval_extents = bin.neglog10_pval_extents;
            });
        }
    
        get_chrom_offsets_data2.value = _.memoize(function() {
            var chrom_padding = 2e7;
            var chrom_extents = {};
    
            var update_chrom_extents = function(variant) {
                if (!(variant.chrom in chrom_extents)) {
                    chrom_extents[variant.chrom] = [variant.pos, variant.pos];
                } else if (variant.pos > chrom_extents[variant.chrom][1]) {
                    chrom_extents[variant.chrom][1] = variant.pos;
                } else if (variant.pos < chrom_extents[variant.chrom][0]) {
                    chrom_extents[variant.chrom][0] = variant.pos;
                }
            }
            variant_bins2.forEach(update_chrom_extents);
            variant_unbinned2.forEach(update_chrom_extents);
    
            var chroms = _.sortBy(Object.keys(chrom_extents), parseInt);
    
            var chrom_genomic_start_positions = {};
            chrom_genomic_start_positions[chroms[0]] = 0;
            for (var i=1; i<chroms.length; i++) {
                chrom_genomic_start_positions[chroms[i]] = chrom_genomic_start_positions[chroms[i-1]] + chrom_extents[chroms[i-1]][1] - chrom_extents[chroms[i-1]][0] + chrom_padding;
            }
    
            // chrom_offsets are defined to be the numbers that make `get_genomic_position()` work.
            // ie, they leave a gap of `chrom_padding` between the last variant on one chromosome and the first on the next.
            var chrom_offsets = {};
            Object.keys(chrom_genomic_start_positions).forEach(function(chrom) {
                chrom_offsets[chrom] = chrom_genomic_start_positions[chrom] - chrom_extents[chrom][0];
            });
    
            return {
                chrom_extents: chrom_extents,
                chroms: chroms,
                chrom_genomic_start_positions: chrom_genomic_start_positions,
                chrom_offsets: chrom_offsets,
            };
        });
    }

    function get_y_axis_config(max_data_qval, plot_height, includes_pval0, direction) {

        var possible_ticks = [];
        if (max_data_qval <= 14) { possible_ticks = _.range(0, 14.1, 2); }
        else if (max_data_qval <= 28) { possible_ticks = _.range(0, 28.1, 4); }
        else if (max_data_qval <= 40) { possible_ticks = _.range(0, 40.1, 8); }
        else {
            possible_ticks = _.range(0, 20.1, 4);
            if (max_data_qval <= 70) { possible_ticks = possible_ticks.concat([30,40,50,60,70]); }
            else if (max_data_qval <= 120) { possible_ticks = possible_ticks.concat([40,60,80,100,120]); }
            else if (max_data_qval <= 220) { possible_ticks = possible_ticks.concat([60,100,140,180,220]); }
            else {
                var power_of_ten = Math.pow(10, Math.floor(Math.log10(max_data_qval)));
                var first_digit = max_data_qval / power_of_ten;
                var multipliers;
                if (first_digit <= 2) { multipliers = [0.5, 1, 1.5, 2]; }
                else if (first_digit <= 4) { multipliers = [1, 2, 3, 4]; }
                else { multipliers = [2, 4, 6, 8, 10]; }
                possible_ticks = possible_ticks.concat(multipliers.map(function(m) { return m * power_of_ten; }));
            }
        }
        // Include all ticks < qval.  Then also include the next tick.
        // That should mean we'll always have the largest tick >= the largest variant.
        var ticks = possible_ticks.filter(function(qval) { return qval < max_data_qval; });
        if (ticks.length < possible_ticks.length) { ticks.push(possible_ticks[ticks.length]); }

        // Use the largest tick for the top of our y-axis so that we'll have a tick nicely rendered right at the top.
        var max_plot_qval = ticks[ticks.length-1];
        // If we have any qval=inf (pval=0) variants, leave space for them.
        if (includes_pval0) { max_plot_qval *= 1.1 }
        var scale = d3.scaleLinear().clamp(true);

        if (direction === "upper"){
            if (max_plot_qval <= 40) {
                scale = scale
                    .domain([max_plot_qval, 0])
                    .range([0, plot_height/2 * 0.95]); // 0.95 to leave space for chromosome numbers
            } else {
                scale = scale
                    .domain([max_plot_qval, max_plot_qval / 7, 0]) // TODO: divided by 7 is best for BLD_MPV_COM, but need to find a way to be more dynamics
                    .range([0, plot_height/4, plot_height/2 * 0.95]); // divide by x2 for miami
            }
        } else if (direction === "lower"){
            if (max_plot_qval <= 40) {
                scale = scale
                    .domain([max_plot_qval, 0])
                    .range([plot_height, plot_height/2 * 1.05]); // divide by 2 for miami
            } else {
                scale = scale
                    .domain([max_plot_qval, max_plot_qval / 7, 0])
                    .range([plot_height, (plot_height/4) * 3, plot_height/2 * 1.05 ]); // divide by x2 for miami
            }
        }


        if (includes_pval0) { ticks.push(Infinity); }

        return {
            'scale': scale,
            'draw_break_at_20': !(max_plot_qval <= 40),
            'ticks': ticks,
        };
    }

        var svg_width = miamiPlotContainer.value.clientWidth;
        var svg_height = 550;
        var plot_margin = {
            'left': 70,
            'right': 30,
            'top': 20,
            'bottom': 20, 
        };
        plot_width.value = svg_width - plot_margin.left - plot_margin.right;
        plot_height.value = svg_height - plot_margin.top - plot_margin.bottom;

        var miami_svg = d3.select("#miami_svg")
            .attr("width", svg_width)
            .attr("height", svg_height)
            .style("display", "block")
            .style("margin", "auto");
        var miami_plot = d3.select('#miami_plot')
            .attr("transform", utils.fmt("translate({0},{1})", plot_margin.left, plot_margin.top));

        // Significance Threshold line
        var significance_threshold = 5e-8;
        var significance_threshold_tooltip = d3Tip()
            .attr('class', 'd3-tip')
            .html('Significance Threshold: 5E-8')
            .offset([-8,0]);
        miami_svg.call(significance_threshold_tooltip);


        // default to data1 if its available.
        if (variant_bins1 != null){
            
            var genomic_position_extent = (function() { 
                var extent1 = d3.extent(variant_bins1, get_genomic_position_data1);
                var extent2 = d3.extent(variant_unbinned1, get_genomic_position_data1);
                return d3.extent(extent1.concat(extent2));
            })();
        }
        else if ( variant_bins2 != null){
            var genomic_position_extent = (function() { 
                var extent1 = d3.extent(variant_bins2, get_genomic_position_data2);
                var extent2 = d3.extent(variant_unbinned2, get_genomic_position_data2);
                return d3.extent(extent1.concat(extent2));
            })();
        }


        x_scale.value = d3.scaleLinear()
            .domain(genomic_position_extent)
            .range([0, plot_width.value]);

        var includes_pval0 = _.any(variant_unbinned1, function(variant) { return variant.pval === 0; }) ||  _.any(variant_unbinned2, function(variant) { return variant.pval === 0; });

        //for y axis stuff, it will differ between data1 and data2, so we need to seperate them
        var highest_plot_qval_data1 = Math.max(
            -Math.log10(significance_threshold) + 0.5,
            (function() {
                var best_unbinned_qval = -Math.log10(d3.min(variant_unbinned1, function(d) {
                    return (d.pval === 0) ? 1 : d.pval;
                }));
                if (best_unbinned_qval !== undefined) return best_unbinned_qval;
                return d3.max(variant_bins1, function(bin) {
                    return d3.max(bin, _.property('qval'));
                });
            })());
        
        var highest_plot_qval_data2 = Math.max(
            -Math.log10(significance_threshold) + 0.5,
            (function() {
                var best_unbinned_qval = -Math.log10(d3.min(variant_unbinned2, function(d) {
                    return (d.pval === 0) ? 1 : d.pval;
                }));
                if (best_unbinned_qval !== undefined) return best_unbinned_qval;
                return d3.max(variant_bins2, function(bin) {
                    return d3.max(bin, _.property('qval'));
                });
            })());

        // get highest p-value between the 2 datasets
        if (!isNaN(highest_plot_qval_data2) && !isNaN(highest_plot_qval_data1)){
            var max_value = Math.max(highest_plot_qval_data2,highest_plot_qval_data1);
        } else if (isNaN(highest_plot_qval_data1)){
            var max_value = highest_plot_qval_data2
        } else if (isNaN(highest_plot_qval_data2)){
            var max_value = highest_plot_qval_data1
        }

        var y_axis_config_data1 = get_y_axis_config(max_value, plot_height.value, includes_pval0, "upper");
        y_scale_data1.value = y_axis_config_data1.scale;
        
        var y_axis_config_data2 = get_y_axis_config(max_value, plot_height.value, includes_pval0, "lower");
        y_scale_data2.value = y_axis_config_data2.scale;

        var y_axis_data1 = d3.axisLeft(y_scale_data1.value)
            .tickFormat(d3.format("d"))
            .tickValues(y_axis_config_data1.ticks);
        miami_plot.append("g")
            .attr("class", "y axis")
            .attr('transform', 'translate(-8,0)') 
            .call(y_axis_data1);

        var y_axis_data2 = d3.axisLeft(y_scale_data2.value)
            .tickFormat(d3.format("d"))
            .tickValues(y_axis_config_data2.ticks);
        miami_plot.append("g")
            .attr("class", "y axis")
            .attr('transform', 'translate(-8,0)') 
            .call(y_axis_data2);

        if (includes_pval0) {
            var y_axis_break_inf_offset_data1 = y_scale_data1.value(Infinity) + (y_scale_data1.value(0)-y_scale_data1.value(Infinity)) * 0.03
            miami_plot.append('line')
                .attr('x1', -8-7).attr('x2', -8+7)
                .attr('y1', y_axis_break_inf_offset_data1+6).attr('y2', y_axis_break_inf_offset_data1-6)
                .attr('stroke', '#666').attr('stroke-width', '3px');

            var y_axis_break_inf_offset_data2 = y_scale_data2.value(Infinity) + (y_scale_data2.value(0)-y_scale_data2.value(Infinity)) * 0.03
            miami_plot.append('line')
                .attr('x1', -8-7).attr('x2', -8+7)
                .attr('y1', y_axis_break_inf_offset_data2+6).attr('y2', y_axis_break_inf_offset_data2-6)
                .attr('stroke', '#666').attr('stroke-width', '3px')
        }
        if (y_axis_config_data1.draw_break_at_20) {
            var y_axis_break_20_offset = y_scale_data1.value(20);
            miami_plot.append('line')
                .attr('x1', -8-7).attr('x2', -8+7)
                .attr('y1', y_axis_break_20_offset+6).attr('y2', y_axis_break_20_offset-6)
                .attr('stroke', '#666').attr('stroke-width', '3px');
        }
        if (y_axis_config_data2.draw_break_at_20) {
            var y_axis_break_20_offset = y_scale_data2.value(20);
            miami_plot.append('line')
                .attr('x1', -8-7).attr('x2', -8+7)
                .attr('y1', y_axis_break_20_offset+6).attr('y2', y_axis_break_20_offset-6)
                .attr('stroke', '#666').attr('stroke-width', '3px')
        }

        //side log10(p-value)
        miami_svg.append('text')
            .style('text-anchor', 'middle')
            .attr('transform', utils.fmt('translate({0},{1})rotate(-90)',
                                    plot_margin.left*.4,
                                    plot_height.value/2 + plot_margin.top))
            .text('-log\u2081\u2080(p-value)'); // Unicode subscript "10"


        var stratification_label1 = label1.split(".")
        var stratification_label2 = label2.split(".")

        stratification_label1.shift()
        stratification_label2.shift()

        miami_svg.append('text')
            .style('text-anchor', 'middle')
            .attr('transform', utils.fmt('translate({0},{1})rotate(-90)',
                                    plot_margin.left*.4,
                                    plot_height.value / 4 + plot_margin.top))
            .text(stratification_label1.join(" ")); 

        
        miami_svg.append('text')
            .style('text-anchor', 'middle')
            .attr('transform', utils.fmt('translate({0},{1})rotate(-90)',
                                    plot_margin.left*.4,
                                    plot_height.value * 3 / 4 + plot_margin.top))
            .text(stratification_label2.join(" ")); 

        if ( variant_bins1 != null){
            var chroms_and_midpoints = (function() {
                var v = get_chrom_offsets_data1.value();
                return v.chroms.map(function(chrom) {
                    return {
                        chrom: chrom,
                        midpoint: v.chrom_genomic_start_positions[chrom] + (v.chrom_extents[chrom][1] - v.chrom_extents[chrom][0]) / 2,
                    };
                });
            })();
            if (variants === "filtered"){
                var color_by_chrom_dim = d3.scaleOrdinal()
                .domain(get_chrom_offsets_data1.value().chroms)
                .range(['rgb(221,221,237)', 'rgb(191,191,208)']);
            } else {
                var color_by_chrom_dim = d3.scaleOrdinal()
                .domain(get_chrom_offsets_data1.value().chroms)
                .range(['rgb(120,120,186)', 'rgb(0,0,66)']);
            }

        } else if ( variant_bins2 != null){
            var chroms_and_midpoints = (function() {
                var v = get_chrom_offsets_data2.value();
                return v.chroms.map(function(chrom) {
                    return {
                        chrom: chrom,
                        midpoint: v.chrom_genomic_start_positions[chrom] + (v.chrom_extents[chrom][1] - v.chrom_extents[chrom][0]) / 2,
                    };
                });
            })();
            if (variants === "filtered"){
                var color_by_chrom_dim = d3.scaleOrdinal()
                .domain(get_chrom_offsets_data1.value().chroms)
                .range(['rgb(221,221,237)', 'rgb(191,191,208)']);
            } else {
                var color_by_chrom_dim = d3.scaleOrdinal()
                .domain(get_chrom_offsets_data1.value().chroms)
                .range(['rgb(120,120,186)', 'rgb(0,0,66)']);
            }
        }

        //colors to maybe sample from later:
        //.range(['rgb(120,120,186)', 'rgb(0,0,66)', 'rgb(44,150,220)', 'rgb(40,60,80)', 'rgb(33,127,188)', 'rgb(143,76,176)']);

        miami_svg.selectAll('text.chrom_label')
            .data(chroms_and_midpoints)
            .enter()
            .append('text')
            .style('text-anchor', 'middle')
            .attr('transform', function(d) {
                return utils.fmt('translate({0},{1})',
                            plot_margin.left + x_scale.value(d.midpoint),
                            svg_height/2 + 5); // divide by two to have it midway // TODO : why do I need to +5 here to have it perfectly centered??
            })
            .text(function(d) {
                return d.chrom;
            })
            .style('fill', function(d) {
                return color_by_chrom_dim(d.chrom);
            });
        
        if (variant_bins1 != null){

            miami_plot.append('line')
            .attr('x1', 0)
            .attr('x2', plot_width.value)
            .attr('y1', y_scale_data1.value(-Math.log10(significance_threshold)))
            .attr('y2', y_scale_data1.value(-Math.log10(significance_threshold)))
            .attr('stroke-width', '5px')
            .attr('stroke', 'lightgray')
            .attr('stroke-dasharray', '10,10')
            .on('mouseover', significance_threshold_tooltip.show)
            .on('mouseout', significance_threshold_tooltip.hide);
        }

        if ( variant_bins2 != null){

            miami_plot.append('line')
                .attr('x1', 0)
                .attr('x2', plot_width.value)
                .attr('y1', y_scale_data2.value(-Math.log10(significance_threshold)))
                .attr('y2', y_scale_data2.value(-Math.log10(significance_threshold)))
                .attr('stroke-width', '5px')
                .attr('stroke', 'lightgray')
                .attr('stroke-dasharray', '10,10')
                .on('mouseover', significance_threshold_tooltip.show)
                .on('mouseout', significance_threshold_tooltip.hide)
        }

        // Points & labels
        var tooltip_template = _.template(
            utils.tooltip_underscoretemplate +
            "<% if(_.has(d, 'num_significant_in_peak') && d.num_significant_in_peak>1) { %>#significant variants in peak: <%= d.num_significant_in_peak %><br><% } %>" +
    
            // add link
            "<br>Region Plot: <a href='<%= `${window.location}/region/${d.chrom}:${Math.max(0, d.pos - 200 * 1000)}-${d.pos + 200 * 1000}` %>' target='_blank'>View</a>"
        );

            point_tooltip.value = d3Tip()
                .attr('class', 'd3-tip')
                .style('background-color', 'black')
                .html(function(d) {
                    return tooltip_template({d: d});
                })
                .offset([-6,0]);
        miami_svg.call(point_tooltip.value);

        // TODO: if the label touches any circles or labels, skip it?
        var variants_to_label_data1 = _.sortBy(_.where(variant_unbinned1, {peak: true}), _.property('pval'))
            .filter(function(d) { return d.pval < 5e-8; })
            .slice(0,7);

        var variants_to_label_data2 = _.sortBy(_.where(variant_unbinned2, {peak: true}), _.property('pval'))
            .filter(function(d) { return d.pval < 5e-8; })
            .slice(0,7);

        var genenames_data1 = miami_plot.append('g')
            .attr('class', 'genenames_data1')
            .selectAll('text.genenames_data1')
            .data(variants_to_label_data1)
            .enter()
            .append('text')
            .attr('class', 'genename_text')
            .style('font-style', 'italic')
            .attr('text-anchor', 'middle')
            .attr('transform', function(d) {
                return utils.fmt('translate({0},{1})',
                            x_scale.value(get_genomic_position_data1(d)),
                            y_scale_data1.value(-Math.log10(d.pval))-5);
            })
            .text(function(d) {
                if (d.nearest_genes.split(',').length <= 2) {
                    return d.nearest_genes;
                } else {
                    return d.nearest_genes.split(',').slice(0,2).join(',')+',...';
                }
            });
        
        var genenames_data2 = miami_plot.append('g')
            .attr('class', 'genenames_data2')
            .selectAll('text.genenames_data2')
            .data(variants_to_label_data2)
            .enter()
            .append('text')
            .attr('class', 'genename_text')
            .style('font-style', 'italic')
            .attr('text-anchor', 'middle')
            .attr('transform', function(d) {
                return utils.fmt('translate({0},{1})',
                            x_scale.value(get_genomic_position_data2(d)),
                            y_scale_data2.value(-Math.log10(d.pval)) + 20);
            })
            .text(function(d) {
                if (d.nearest_genes.split(',').length <= 2) {
                    return d.nearest_genes;
                } else {
                    return d.nearest_genes.split(',').slice(0,2).join(',')+',...';
                }
            })

        //these are where clickable points will be appended to the plot
    function pp2(flip) {
        if (flip) {
            d3.select('#variant_points_lower')
                .selectAll('a.variant_point')
                .data(variant_unbinned2)
                .enter()
                .append('a')
                .attr('class', 'variant_point') //.attr('xlink:href', get_link_to_LZ_data2)
                .style('cursor', 'pointer') // Add this line
                .append('circle')
                .attr('id', function (d) {
                    return utils.fmt('variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt);
                })
                .attr('cx', function (d) {
                    return x_scale.value(get_genomic_position_data2(d));
                })
                .attr('cy', function (d) {
                    return y_scale_data2.value(-Math.log10(d.pval));
                })
                .attr('r', 2.3)
                .style('fill', function (d) {
                    return color_by_chrom_dim(d.chrom);
                })
                .style('cursor', 'pointer') // Add this line to circles as well
                .on('mouseover', function (d) {
                    // Show the tooltip on hover
                    if (!tooltip_showing.value) {
                        point_tooltip.value.show(d, this);
                    }
                })
                .on('mouseout', function (d) {
                    // Only hide the tooltip on mouseout if it wasn't clicked to stay open
                    if (!tooltip_showing.value) {
                        point_tooltip.value.hide(d, this);
                    }
                })
                .on('click', function (d) {
                    d3.event.stopPropagation();
                    if (tooltip_showing.value) {
                        // Hide the tooltip if it’s already showing and was clicked again
                        point_tooltip.value.hide(d, this);
                        tooltip_showing.value = false;
                    } else {
                        // Show the tooltip and make it stay open
                        point_tooltip.value.show(d, this);
                        tooltip_showing.value = true;
                    }
                });

        } else if (!flip) {
            d3.select('#variant_points_upper')
                .selectAll('a.variant_point')
                .data(variant_unbinned1)
                .enter()
                .append('a')
                .attr('class', 'variant_point')//.attr('xlink:href', get_link_to_LZ_data1)
                .style('cursor', 'pointer') // Add this line
                .append('circle')
                .attr('id', function (d) {
                    return utils.fmt('variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt);
                })
                .attr('cx', function (d) {
                    return x_scale.value(get_genomic_position_data1(d));
                })
                .attr('cy', function (d) {
                    return y_scale_data1.value(-Math.log10(d.pval));
                })
                .attr('r', 2.3)
                .style('fill', function (d) {
                    return color_by_chrom_dim(d.chrom);
                })
                .style('cursor', 'pointer') // Add this line to circles as well
                .on('mouseover', function (d) {
                    // Show the tooltip on hover
                    if (!tooltip_showing.value) {
                        point_tooltip.value.show(d, this);
                    }
                })
                .on('mouseout', function (d) {
                    // Only hide the tooltip on mouseout if it wasn't clicked to stay open
                    if (!tooltip_showing.value) {
                        point_tooltip.value.hide(d, this);
                    }
                })
                .on('click', function (d) {
                    d3.event.stopPropagation();
                    if (tooltip_showing.value) {
                        // Hide the tooltip if it’s already showing and was clicked again
                        point_tooltip.value.hide(d, this);
                        tooltip_showing.value = false;
                    } else {
                        // Show the tooltip and make it stay open
                        point_tooltip.value.show(d, this);
                        tooltip_showing.value = true;
                    }
                });

        }
    }
        if ( variant_bins1 != null){
            pp2(false);
        }
        if ( variant_bins2 != null){
            pp2(true);
        }

        //this is where the non-clickable points will be
        function pp3(flip) { // drawing the ~60k binned variant circles takes ~500ms.  The (far fewer) unbinned variants take much less time.
            if(flip ) {
                var bins = d3.select('#variant_bins_lower')
                .selectAll('g.bin')
                .data(variant_bins2)
                .enter()
                .append('g')
                .attr('class', 'bin')
                .attr('data-index', function(d, i) { return i; }) // make parent index available from DOM
                .each(function(d) { //todo: do this in a forEach
                    d.x = x_scale.value(get_genomic_position_data2(d));
                    d.color = color_by_chrom_dim(d.chrom);
                });
            bins.selectAll('circle.binned_variant_point')
                .data(_.property('qvals'))
                .enter()
                .append('circle')
                .attr('class', 'binned_variant_point')
                .attr('cx', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins2[parent_i].x;
                })
                .attr('cy', function(qval) {
                    return y_scale_data2.value(qval);
                })
                .attr('r', 2.3)
                .style('fill', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins2[parent_i].color;
                })
            bins.selectAll('circle.binned_variant_line')
                .data(_.property('qval_extents'))
                .enter()
                .append('line')
                .attr('class', 'binned_variant_line')
                .attr('x1', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins2[parent_i].x;
                })
                .attr('x2', function(d, i) {
                    const parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins2[parent_i].x;
                })
                .attr('y1', function(d) { return y_scale_data2.value(d[0]); })
                .attr('y2', function(d) { return y_scale_data2.value(d[1]); })
                .style('stroke', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins2[parent_i].color;
                })
                .style('stroke-width', 4.6)
                .style('stroke-linecap', 'round')
            } else if (!flip ) {
                var bins = d3.select('#variant_bins_upper')
                .selectAll('g.bin')
                .data(variant_bins1)
                .enter()
                .append('g')
                .attr('class', 'bin')
                .attr('data-index', function(d, i) { return i; }) // make parent index available from DOM
                .each(function(d) { //todo: do this in a forEach
                    d.x = x_scale.value(get_genomic_position_data1(d));
                    d.color = color_by_chrom_dim(d.chrom);
                });
            bins.selectAll('circle.binned_variant_point')
                .data(_.property('qvals'))
                .enter()
                .append('circle')
                .attr('class', 'binned_variant_point')
                .attr('cx', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins1[parent_i].x;
                })
                .attr('cy', function(qval) {
                    return y_scale_data1.value(qval);
                })
                .attr('r', 2.3)
                .style('fill', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins1[parent_i].color;
                });
            bins.selectAll('circle.binned_variant_line')
                .data(_.property('qval_extents'))
                .enter()
                .append('line')
                .attr('class', 'binned_variant_line')
                .attr('x1', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins1[parent_i].x;
                })
                .attr('x2', function(d, i) {
                    const parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins1[parent_i].x;
                })
                .attr('y1', function(d) { return y_scale_data1.value(d[0]); })
                .attr('y2', function(d) { return y_scale_data1.value(d[1]); })
                .style('stroke', function(d, i) {
                    var parent_i = +this.parentNode.getAttribute('data-index');
                    return variant_bins1[parent_i].color;
                })
                .style('stroke-width', 4.6)
                .style('stroke-linecap', 'round');
            }
        }
        if ( variant_bins1 != null){
            pp3(false);
        }
        if (variant_bins2 != null){
            pp3(true);
        }

        function equalToEventTarget() {
            return this == d3.event.target;
        }

}

var miami_filter_view = {

    // TODO: these javascript selects need to be changed I think, getting error about y_scale_data1 not defined.
    clear: function() {
        d3.select('#filtered_variant_points_upper').selectAll('a.variant_point').data([]).exit().remove();
        d3.select('#filtered_variant_hover_rings_upper').selectAll('a.variant_hover_ring').data([]).exit().remove();
        d3.select('#filtered_variant_bins_upper').selectAll('g.bin').data([]).exit().remove();
        d3.select('#unchecked_variants_mask_upper').attr('y', 0).attr('height', 0);

        d3.select('#filtered_variant_points_lower').selectAll('a.variant_point').data([]).exit().remove();
        d3.select('#filtered_variant_hover_rings_lower').selectAll('a.variant_hover_ring').data([]).exit().remove();
        d3.select('#filtered_variant_bins_lower').selectAll('g.bin').data([]).exit().remove();
        d3.select('#unchecked_variants_mask_lower').attr('y', 0).attr('height', 0);

    },
    set_variants: function(variant_bins_upper, unbinned_variants_upper, weakest_pval_upper, variant_bins_lower, unbinned_variants_lower, weakest_pval_lower) {
        d3.select('#unchecked_variants_mask_upper')
            .attr('transform', `translate(${-point_radius},0)`) // move left by the radius of the variant points (3px)
            .attr('width', plot_width.value+point_radius*2) // widen by 2x the radius of the variant points
            .attr('y', y_scale_data1.value(-Math.log10(weakest_pval_upper))+point_radius)
            .attr('height', Math.abs(y_scale_data1.value(-Math.log10(weakest_pval_upper))-y_scale_data1.value(0)))
            .raise();

        d3.select('#unchecked_variants_mask_lower')
            .attr('transform', `translate(${-point_radius},0)`) // move left by the radius of the variant points (3px)
            .attr('width', plot_width.value+point_radius*2) // widen by 2x the radius of the variant points
            .attr('y', y_scale_data2.value(0) - point_radius) 
            .attr('height', Math.abs(y_scale_data2.value(0) - y_scale_data2.value(-Math.log10(weakest_pval_lower))) + point_radius)
            .raise();

        // Order from weakest to strongest pvalue, so that the strongest variant will be on top (z-order) and easily hoverable
        // In the DOM, later siblings are displayed over top of (and occluding) earlier siblings.
        unbinned_variants_upper = _.sortBy(unbinned_variants_upper, function(d){return -d.pval});
        unbinned_variants_lower = _.sortBy(unbinned_variants_lower, function(d){return -d.pval});

        var gwas_plot = d3.select("#miami_plot");
        var color_by_chrom = d3.scaleOrdinal()
            .domain(get_chrom_offsets_data1.value().chroms)
            .range(['rgb(120,120,186)', 'rgb(0,0,66)']);

        var point_selection_upper = d3.select('#filtered_variant_points_upper')
            .selectAll('a.variant_point_upper')
            .data(unbinned_variants_upper);
            

        point_selection_upper.exit().remove();
        point_selection_upper.enter()
            .append('a')
            .attr('class', 'variant_point')//.attr('xlink:href', get_link_to_LZ_data1)
            .append('circle')
            .attr('id', function(d) {
                return utils.fmt('filtered-variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt);
            })
            .attr('cx', function(d) {
                return x_scale.value(get_genomic_position_data1(d));
            })
            .attr('cy', function(d) {
                return y_scale_data1.value(-Math.log10(d.pval));
            })
            .attr('r', point_radius)
            .style('fill', function(d) {
                return color_by_chrom(d.chrom);
            })
            // .on('mouseover', function(d) {
            //     //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
            //     point_tooltip.value.show(d, this);
            // })
            // .on('mouseout', point_tooltip.value.hide)
            .on('click', function(d) {
                //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
                console.log(d)
                chosenVariant.value = `${d.chrom}-${d.pos}-${d.ref}-${d.alt}`;
                console.log(chosenVariant)
                console.log(tooltip_showing.value)

                if (tooltip_showing.value){
                    point_tooltip.value.hide;
                    tooltip_showing.value = false;
                } else {
                    point_tooltip.value.show(d, this);
                    tooltip_showing.value = true;
                }

                d3.event.stopPropagation()
                
            });

        var point_selection_lower = d3.select('#filtered_variant_points_lower')
            .selectAll('a.variant_point_lower')
            .data(unbinned_variants_lower)

        point_selection_lower.exit().remove();
        point_selection_lower.enter()
            .append('a')
            .attr('class', 'variant_point')//.attr('xlink:href', get_link_to_LZ_data2)
            .append('circle')
            .attr('id', function(d) {
                return utils.fmt('filtered-variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt);
            })
            .attr('cx', function(d) {
                return x_scale.value(get_genomic_position_data2(d));
            })
            .attr('cy', function(d) {
                return y_scale_data2.value(-Math.log10(d.pval));
            })
            .attr('r', point_radius)
            .style('fill', function(d) {
                return color_by_chrom(d.chrom);
            })
            // .on('mouseover', function(d) {
            //     //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
            //     point_tooltip.value.show(d, this);
            // })
            // .on('mouseout', point_tooltip.value.hide)
            .on('click', function(d) {
                //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
                console.log(d)
                chosenVariant.value = `${d.chrom}-${d.pos}-${d.ref}-${d.alt}`;
                console.log(chosenVariant)
                console.log(tooltip_showing.value)

                if (tooltip_showing.value){
                    point_tooltip.value.hide;
                    tooltip_showing.value = false;
                } else {
                    point_tooltip.value.show(d, this);
                    tooltip_showing.value = true;
                }

                d3.event.stopPropagation();

            });

        var hover_ring_selection_upper = d3.select('#filtered_variant_hover_rings_upper')
            .selectAll('a.variant_hover_ring_upper')
            .data(unbinned_variants_upper);

        var hover_ring_selection_lower = d3.select('#filtered_variant_hover_rings_lower')
            .selectAll('a.variant_hover_ring_lower')
            .data(unbinned_variants_lower);


        hover_ring_selection_upper.exit().remove();
        hover_ring_selection_upper.enter()
            .append('a')
            .attr('class', 'variant_hover_ring_lower')//.attr('xlink:href', get_link_to_LZ_data1)
            .append('circle')
            .attr('cx', function(d) {
                return x_scale.value(get_genomic_position_data1(d));
            })
            .attr('cy', function(d) {
                return y_scale_data1.value(-Math.log10(d.pval));
            })
            .attr('r', 7)
            .style('opacity', 0)
            .style('stroke-width', 1) /* why? */
            .on('mouseover', function(d) {
                //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
                var target_node = document.getElementById(utils.fmt('filtered-variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt));
                point_tooltip.value.show(d, target_node);
            })
            .on('mouseout', point_tooltip.value.hide)
            .on('click', function(d) {
                //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
                var target_node = document.getElementById(utils.fmt('filtered-variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt));
                point_tooltip.value.show(d, target_node);

                
            });
        
        hover_ring_selection_lower.exit().remove();
        hover_ring_selection_lower.enter()
            .append('a')
            .attr('class', 'variant_hover_ring_lower')//.attr('xlink:href', get_link_to_LZ_data2)
            .append('circle')
            .attr('cx', function(d) {
                return x_scale.value(get_genomic_position_data2(d));
            })
            .attr('cy', function(d) {
                return y_scale_data1.value(-Math.log10(d.pval));
            })
            .attr('r', 7)
            .style('opacity', 0)
            .style('stroke-width', 1) /* why? */
            .on('mouseover', function(d) {
                //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
                var target_node = document.getElementById(utils.fmt('filtered-variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt));
                point_tooltip.value.show(d, target_node);
            })
            .on('mouseout', point_tooltip.value.hide)
            .on('click', function(d) {
                //Note: once a tooltip has been explicitly placed once, it must be explicitly placed forever after.
                var target_node = document.getElementById(utils.fmt('filtered-variant-point-{0}-{1}-{2}-{3}', d.chrom, d.pos, d.ref, d.alt));
                point_tooltip.value.show(d, target_node);

                
            });

        var bin_selection_upper = d3.select('#filtered_variant_bins_upper')
            .selectAll('g.bin')
            .data(variant_bins_upper);
        bin_selection_upper.exit().remove();
        var bins = bin_selection_upper.enter()
            .append('g')
            .attr('class', 'bin')
            .attr('data-index', function(d, i) { return i; }) // make parent index available from DOM
            .each(function(d) { //todo: do this in a forEach
                d.x = x_scale.value(get_genomic_position_data1(d));
                d.color = color_by_chrom(d.chrom);
            });
        bins.selectAll('circle.binned_variant_point')
            .data(_.property('qvals'))
            .enter()
            .append('circle')
            .attr('class', 'binned_variant_point')
            .attr('cx', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_upper[parent_i].x;
            })
            .attr('cy', function(qval) {
                return y_scale_data1.value(qval);
            })
            .attr('r', point_radius)
            .style('fill', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_upper[parent_i].color;
            });
        bins.selectAll('line.binned_variant_line')
            .data(_.property('qval_extents'))
            .enter()
            .append('line')
            .attr('class', 'binned_variant_line')
            .attr('x1', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_upper[parent_i].x;
            })
            .attr('x2', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_upper[parent_i].x;
            })
            .attr('y1', function(d) { return y_scale_data1.value(d[0]); })
            .attr('y2', function(d) { return y_scale_data1.value(d[1]); })
            .style('stroke', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_upper[parent_i].color;
            })
            .style('stroke-width', 4.6)
            .style('stroke-linecap', 'round');

        var bin_selection_lower = d3.select('#filtered_variant_bins_lower')
            .selectAll('g.bin')
            .data(variant_bins_lower);

        bin_selection_lower.exit().remove();
        bins = bin_selection_lower.enter()
            .append('g')
            .attr('class', 'bin')
            .attr('data-index', function(d, i) { return i; }) // make parent index available from DOM
            .each(function(d) { //todo: do this in a forEach
                d.x = x_scale.value(get_genomic_position_data2(d));
                d.color = color_by_chrom(d.chrom);
            });
        bins.selectAll('circle.binned_variant_point')
            .data(_.property('qvals'))
            .enter()
            .append('circle')
            .attr('class', 'binned_variant_point')
            .attr('cx', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_lower[parent_i].x;
            })
            .attr('cy', function(qval) {
                return y_scale_data2.value(qval);
            })
            .attr('r', point_radius)
            .style('fill', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_lower[parent_i].color;
            });

        bins.selectAll('line.binned_variant_line')
            .data(_.property('qval_extents'))
            .enter()
            .append('line')
            .attr('class', 'binned_variant_line')
            .attr('x1', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_lower[parent_i].x;
            })
            .attr('x2', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_lower[parent_i].x;
            })
            .attr('y1', function(d) { return y_scale_data2.value(d[0]); })
            .attr('y2', function(d) { return y_scale_data2.value(d[1]); })
            .style('stroke', function(d, i) {
                var parent_i = +this.parentNode.getAttribute('data-index');
                return variant_bins_lower[parent_i].color;
            })
            .style('stroke-width', 4.6)
            .style('stroke-linecap', 'round');

    }
};

function get_genomic_position_data1(variant) {
    var chrom_offsets = get_chrom_offsets_data1.value().chrom_offsets;
    return chrom_offsets[variant.chrom] + variant.pos;
}

function get_genomic_position_data2(variant) {
    var chrom_offsets = get_chrom_offsets_data2.value().chrom_offsets;
    return chrom_offsets[variant.chrom] + variant.pos;
}

async function refilter() {
    //variant_table.clear();

    var phenocode_with_stratifications1 = pheno1.value
    var phenocode_with_stratifications2 = pheno2.value

    //remove any past filters
    miami_filter_view.clear();

    // get variants which pass the filters
    var url_base = `${api}/phenotypes/pheno-filter/${phenocode_with_stratifications1}/${phenocode_with_stratifications2}?`
    var get_params = [];
    get_params.push(utils.fmt("min_maf={0}", minFreq.value ));
    get_params.push(utils.fmt("max_maf={0}", maxFreq.value ));
    var snp_indel_value = selectedType.value;
    if (snp_indel_value=='SNP' || snp_indel_value=='Indel') {
        get_params.push(utils.fmt("indel={0}", (snp_indel_value=='Indel')?'true':'false'));
    }

    // we don't have this fonctionality implemented... probably never will

    // var csq_value = $('#csq input:radio:checked').val();
    // if (csq_value=='lof' || csq_value=='nonsyn') {
    //     get_params.push(utils.fmt("csq={0}", csq_value));
    // }
    
    var url = url_base + get_params.join('&');

    try {
        const response = await axios.get(url);
        var data = response.data ; 
        miami_filter_view.set_variants(data[0].variant_bins , data[0].unbinned_variants, data[0].weakest_pval , data[1].variant_bins , data[1].unbinned_variants , data[1].weakest_pval );

    } catch (error) {
        console.log(`Error fetching plotting with url ${url}:`, error);
    }
}

function reset_for_miami_plot() {
    if (miamiPlotContainer.value) {
        miamiPlotContainer.value.innerHTML = '';
    }
    miamiPlotContainer.value.innerHTML = `
    <svg id="miami_svg">
        <defs>
        <pattern id="pattern-stripe_upper" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <mask id="mask-stripe_upper"><rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" /></mask>

        <pattern id="pattern-stripe_lower" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <mask id="mask-stripe_lower"><rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" /></mask>
        </defs>

        <g id="miami_plot">
            <g id="genenames_upper"></g>
            <g id="variant_hover_rings_upper"></g>
            <g id="variant_points_upper"></g>
            <g id="variant_bins_upper"></g>
            <rect id="unchecked_variants_mask_upper" style="fill:gray; mask:url(#mask-stripe)" transform="translate(-3,0)"/>
            <g id="filtered_variant_hover_rings_upper"></g>
            <g id="filtered_variant_points_upper"></g>
            <g id="filtered_variant_bins_upper"></g>
            
            <g id="genenames_lower"></g>
            <g id="variant_hover_rings_lower"></g>
            <g id="variant_points_lower"></g>
            <g id="variant_bins_lower"></g>
            <rect id="unchecked_variants_mask_lower" style="fill:gray; mask:url(#mask-stripe)" transform="translate(-3,0)"/>
            <g id="filtered_variant_hover_rings_lower"></g>
            <g id="filtered_variant_points_lower"></g>
            <g id="filtered_variant_bins_lower"></g>
        </g>

    </svg>
    `
}

</script>


<template>
    <div class="shadow-sm border rounded mt-3 mb-3">
        <div class="container-fluid mt-2 ml-1 mr-2 d-flex justify-content-between">
  <!-- Left: Filter Button and Filter Options -->
  <div class="d-flex flex-grow-0 flex-shrink-0" style="width:75%;" @mouseleave="showExpanded = false">
    <button 
      class="btn btn-primary" 
      @click="toggleExpanded" 
      @mouseover="showExpanded = true" 
      ref="hiddenToggle"
    > 
      Filter Variants 
    </button>
  
    <transition name="slide-fade">
      <div v-if="showExpanded || showExpandedClick" class="expanded-content rounded">
        <label class="mr-1 ml-2"><b>Minor Allele Freq Range:</b></label>
  
        <input
          type="number"
          v-model="minFreq"
          class="form-control form-control-sm mr-1"
          style="width:70px; border: 1px solid black; color: black; font-size: 16px;"
          :min="0"
          :max="0.5"
          :step="0.05"
        />
        <span class="mr-1">-</span>
        <input
          type="number"
          v-model="maxFreq"
          class="form-control form-control-sm mr-3"
          style="width:70px; border: 1px solid black; color: black; font-size: 16px;"
          :min="0"
          :max="0.5"
          :step="0.05"
        />
  
        <div class="btn-group mr-2">
          <button
            type="button"
            class="btn btn-primary"
            style="color: white;"
            :class="{ active: selectedType === 'SNP' }"
            @click="selectType('SNP')"
          >
            SNP
          </button>
          <button
            type="button"
            class="btn btn-primary"
            style="color: white;"
            :class="{ active: selectedType === 'Indel' }"
            @click="selectType('Indel')"
          >
            Indel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            style="color: white;"
            :class="{ active: selectedType === 'Both' }"
            @click="selectType('Both')"
          >
            Both
          </button>
        </div>
        <button class="btn btn-primary blue-button mr-2" @click="applyFilter">
          Filter
        </button>
        <button class="btn btn-secondary" @click="cancelFilter()">
          Cancel
        </button>
      </div>
    </transition>
  </div>

  <!-- Right: Download Buttons -->
  <div class="button-container">
    <button 
      type="button" 
      class="btn btn-light border bg-body rounded"
      style="width:150px" 
      @click="downloadPNG"
    >
      Download PNG
    </button>
    <button 
      type="button" 
      class="btn btn-light border ml-2 bg-body rounded"
      style="width:150px" 
      @click="downloadSVG"
    >
      Download SVG
    </button>
  </div>
</div>
  
      <div class="miami" ref="miamiPlotContainer"></div>
    </div>
  </template>

<style lang="scss">

.btn-secondary:hover{
    background-color : grey
}

.miami div {
    min-width: 100%;
    max-width: 1rem;
}

.d3-tip {
    line-height: 1.5;
    padding: 8px;
    background-color: #333;
    color: #fff; 
    border-radius: 4px; 
    font-size: 12px;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3); 
    pointer-events: none;
}

.container-fluid {
    display: flex;
    width: 100%;
    max-height:40px;
}

.expanded-content {
    display: flex;
    align-items: center;
}


.btn-light:hover {
    background-color: #f0f0f0 !important;
}

.btn-primary:hover {
    background-color: darkblue !important;
}


.slide-fade-enter-active, .slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
    transform: translateX(-10px);
    opacity: 0;
}

.button-container {
  margin-left: auto; /* Pushes the button container to the far-right */
  display: flex;
  gap: 10px; /* Space between the buttons */
}

.container-fluid {
  align-items: center; /* Vertically center items */
}

.expanded-content {
  display: flex;
  align-items: center;
}

.btn-light:hover {
  background-color: #f0f0f0 !important;
}

.btn-primary:hover {
  background-color: darkblue !important;
}

</style>