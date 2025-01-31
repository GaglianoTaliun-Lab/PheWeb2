<script setup>
import LocusZoom from 'locuszoom';
import 'locuszoom/dist/locuszoom.css';
import * as d3 from 'd3'
import _ from 'underscore'
import { onMounted, ref } from 'vue';

// TODO : This works for our purposes, but we need to investigate why it was passed as a variable in the pheweb v1.
var lz_template = `{{#if rsid}}<strong>{{rsid}}</strong><br>{{/if}}\n
{{#if consequence}}consequence: <strong>{{consequence}}</strong><br>{{/if}}\n
{{#if pvalue|is_numeric}}P-value: <strong>{{pvalue|scinotation}}</strong><br>{{/if}}\n
{{#if pval|is_numeric}}P-value: <strong>{{pval|scinotation}}</strong><br>{{/if}}\n
{{#if beta}}Beta: <strong>{{beta}}</strong>{{#if sebeta|is_numeric}} (se:<strong>{{sebeta}}</strong>){{/if}}<br>{{/if}}\n
{{#if or}}Odds Ratio: <strong>{{or}}</strong><br>{{/if}}\n
{{#if maf}}MAF: <strong>{{maf|percent}}</strong><br>{{/if}}\n
{{#if af}}AF: <strong>{{af|percent}}</strong><br>{{/if}}\n
{{#if case_af}}AF among cases: <strong>{{case_af|percent}}</strong><br>{{/if}}\n
{{#if control_af}}AF among controls: <strong>{{control_af|percent}}</strong><br>{{/if}}\n
{{#if ac}}AC: <strong>{{ac}}</strong><br>{{/if}}\n
{{#if r2}}R2: <strong>{{r2}}</strong><br>{{/if}}\n
{{#if tstat}}Tstat: <strong>{{tstat}}</strong><br>{{/if}}\n
{{#if num_cases}}#cases: <strong>{{num_cases}}</strong><br>{{/if}}\n
{{#if num_controls}}#controls: <strong>{{num_controls}}</strong><br>{{/if}}\n
{{#if num_samples}}#samples: <strong>{{num_samples}}</strong><br>{{/if}}\n`

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;
const plot = ref(null)

const props = defineProps({
    variantList: {
        type : Array,
        required : true,
    },
    
});

function custom_LocusZoom_Layouts_get(layout_type, layout_name, customizations) {
    // Similar to `LocusZoom.Layouts.get` but also accepts keys like "axes.x.ticks"
    var layout = LocusZoom.Layouts.get(layout_type, layout_name);
    Object.keys(customizations).forEach(function(key) {
        var value = customizations[key];
        if (!key.includes(".")) {
            layout[key] = value;
        } else {
            var key_parts = key.split(".");
            var obj = layout;
            for (var i=0; i < key_parts.length-1; i++) {
                obj = obj[key_parts[i]];
            }
            obj[key_parts[key_parts.length-1]] = value;
        }
    });
    return layout;
}

function reorderListByValues(dictList, orderedValues, key ) {
    const dictMap = dictList.reduce((map, obj) => {
        map[obj[key]] = obj;
        return map;
    }, {});

    return orderedValues.map(value => dictMap[value]);
}

function generatePlot(variant_list){


    variant_list = JSON.parse(JSON.stringify(variant_list))

    // TODO: accept an argument for order of plots maybe, right now assume : Combined, Female, Male:
    // var order = ['.European.Combined', '.European.Female', '.European.Male']

    var order = []

    variant_list.forEach((variant) => {
        order.push(variant.stratification)
    });

    console.log(order)

    console.log("0 : ", variant_list);

    variant_list = reorderListByValues(variant_list, order, 'stratification')

    console.log("1 : ", variant_list)

    var best_neglog10_pval = 0;

    variant_list.forEach(variant => {
        var value = d3.max(variant.phenos.map(function(x) { return LocusZoom.TransformationFunctions.get('neglog10')(x.pval); }));
        if (value > best_neglog10_pval){
            best_neglog10_pval = value
        }
    })

    console.log("2 : ", variant_list)

    var neglog10_handle0 = function(x) {
        if (x === 0) return best_neglog10_pval * 1.1;
        return -Math.log(x) / Math.LN10;
    };

    if (!LocusZoom.TransformationFunctions._items.has("neglog10_handle0")){
        LocusZoom.TransformationFunctions.add("neglog10_handle0", neglog10_handle0);

    }


    var global_panels = [];

    // Define data sources object
    // TODO: Can this be replaced with StaticSource + deepcopy?
    if(LocusZoom.Adapters._items.has('PheWebSource')){
        LocusZoom.Adapters._items.delete('PheWebSource');
    }

    LocusZoom.Adapters.extend('PheWASLZ', 'PheWebSource', {
        getData: function(state, fields, outnames, trans) {

            var list = Object.keys(state);

            var panels = list.slice(0, list.indexOf("variant"))

            if (global_panels.length == 0){
              global_panels = global_panels.concat(panels)
            } 
            var panel = global_panels.shift();


            // Override all parsing, namespacing, and field extraction mechanisms, and load data embedded within the page
            trans = trans || [];

            var panel_int = +panel;

            var data = JSON.parse(JSON.stringify(variant_list[panel_int].phenos)); //otherwise LZ adds attributes I don't want to the original data.
            data.forEach(function(d, i) {
                data[i].x = i;
                data[i].id = i.toString();
                trans.forEach(function(transformation, t){
                    if (typeof transformation === "function"){
                        data[i][outnames[t]] = transformation(data[i][fields[t]]);
                    }
                });
            });
            return function(chain) {
                return {header: chain.header || {}, body: data};
            }.bind(this);

        }
    });

    var neglog10_significance_threshold_list = []

    variant_list.forEach(variant => {
        neglog10_significance_threshold_list.push(-Math.log10(0.05 / variant.phenos.length))
    })

    var panel_list = []
    var unique_categories_list = []

    variant_list.forEach(variant => {
        // sort phenotypes
        if (_.any(variant.phenos.map(function(d) { return d.phenocode; }).map(parseFloat).map(isNaN))) {
            variant.phenos = _.sortBy(variant.phenos, function(d) { return d.phenocode; });
        } else {
            variant.phenos = _.sortBy(variant.phenos, function(d) { return parseFloat(d.phenocode); });
        }
    })

    var first_of_each_category_list = []

    variant_list.forEach(variant => {
      first_of_each_category_list.push(
        (function() {
          var categories_seen = {};
          return variant.phenos.filter(function(pheno) {
              if (categories_seen.hasOwnProperty(pheno.category)) {
                  return false;
              } else {
                  categories_seen[pheno.category] = 1;
                  return true;
              }
          });
      })()
      )
    })

    var category_order_list = []

    variant_list.forEach((variant, j) => {      
      category_order_list.push(
        (function() {
            var rv = {};
            first_of_each_category_list[j].forEach(function(pheno, i) {
                rv[pheno.category] = i;
            });
            return rv;
        })()
      )
    })

    // _.sortBy is a stable sort, so we just sort by category_order and we're good.
    variant_list.forEach((variant, i) => {
        variant.phenos = _.sortBy(variant.phenos, function(d) {
          return category_order_list[i][d.category];
      });
    })

    var unique_categories_list = []

    variant_list.forEach((variant, i) => {
      unique_categories_list.push(
        d3.set(variant.phenos.map(_.property('category'))).values()
      )
    })
    const category20 = d3.schemeCategory10.concat(d3.schemeCategory10);  /* d3 removed category20, so I make this terrible version */

    var largest_number_of_categories = unique_categories_list.reduce((a, b) => (b.length > a.length ? b : a));
    var color_by_category_all = d3.scaleOrdinal((largest_number_of_categories.length > 10) ? category20 : d3.schemeCategory10).domain(largest_number_of_categories)

    variant_list.forEach((variant, j) => {
      variant.phenos.forEach(function(d, i) {
          d.phewas_code = d.phenocode;
          d.phewas_string = (d.phenostring || d.phenocode);
          d.category_name = d.category;
          d.color = color_by_category_all(d.category);
          d.idx = i;
      });
    })

    var data_sources = new LocusZoom.DataSources()
    .add("phewas", ["PheWebSource", {url: '/this/is/not/used'}])

    variant_list.forEach((variant,i) => {

        panel_list.push(
            
            custom_LocusZoom_Layouts_get('panel', 'phewas', {
                title: { 
                    text: variant_list[i].stratification.split('.').slice(1).join(', '),
                    x: 50
                },
                id: i.toString(),
                min_width: 640, // feels reasonable to me
                margin: { top: 40, right: 40, bottom: 80, left: 50 },
                data_layers: [
                    LocusZoom.Layouts.get('data_layer', 'significance', {
                        unnamespaced: true,
                        offset: neglog10_significance_threshold_list[i],
                    }),
                    custom_LocusZoom_Layouts_get('data_layer', 'phewas_pvalues', {
                        unnamespaced: true,
                        id_field: 'idx',
                        type: 'scatter',
                        color: {
                            field: "category_name",
                            scale_function: "categorical_bin",
                            parameters: {
                                categories: unique_categories_list[i],
                                values: unique_categories_list[i].map(function(cat) { return color_by_category_all(cat); }),
                            },
                        },
                        point_shape: [
                            {
                                scale_function: 'effect_direction',
                                parameters: {
                                    '+': 'triangle',
                                    '-': 'triangledown'
                                }
                            },
                            'circle'
                        ],
                        "y_axis.field": 'pval|neglog10_handle0',  // handles pval=0 a little better
                        "y_axis.upper_buffer": 0.1,

                        "y_axis.min_extent": [0, best_neglog10_pval*1.05], // always show sig line

                        "x_axis.min_extent": [-1, variant_list[i].phenos.length], // a little x-padding so that no points intersect the edge

                        "tooltip.closable": false,
                        "tooltip.html": ("<div><strong>{{phewas_string}}</strong></div>\n" +
                                          "<div><strong style='color:{{color}}'>{{category_name}}</strong></div>\n" +
                                          lz_template),
    
                        // Show labels that are: in the top 10, and (by neglog10) >=75% of sig threshold, and >=25% of best
                        "label.text": "{{phewas_string}}",
                        "label.filters": (function() {
                            var ret = [
                                {field:"pval|neglog10_handle0", operator:">", value:neglog10_significance_threshold_list[i] * 3/4},
                                {field:"pval|neglog10_handle0", operator:">", value:best_neglog10_pval / 4}
                            ];
                            if (variant_list[0].phenos.length > 10) {
                                ret.push({field:"pval", operator:"<", value:_.sortBy(variant_list[i].phenos.map(_.property('pval')))[10]});
                            }
                            return ret;
                        })(),
                        "behaviors.onclick": [{action:"link", href:api+"/pheno/{{phewas_code}}"}],
                    }),
                ],
    
                // Use categories as x ticks.
                "axes.x.ticks": first_of_each_category_list[i].map(function(pheno) {
                    return {
                        style: {fill: pheno.color, "font-size":"11px", "font-weight":"bold", "text-anchor":"start"},
                        transform: "translate(15, 0) rotate(50)",
                        text: pheno.category,
                        x: pheno.idx
                    };
                }),
    
                "axes.y1.label": "-log\u2081\u2080(p-value)",
            }),
        )
    });

    var layout = {
        state: {
            variant: ['chrom', 'pos', 'ref', 'alt'].map(function(d) { return variant_list[0][d];}).join("-"),
        },
        dashboard: {
            components: [
                {type: "download", position: "right"},
                {type: "download_png", position: "right"},
            ],
        },
        min_height: 400,
        responsive_resize: true,
        mouse_guide: false,
        panels: panel_list,
    };

    plot.value = LocusZoom.populate("#phewas_plot_container", data_sources, layout);

    return;
}

onMounted(() => {

    if (!LocusZoom.TransformationFunctions._items.has("percent")){
        LocusZoom.TransformationFunctions.add("percent", function(x) {
            if (x === 1) { return "100%"; }
            x = (x * 100).toPrecision(2);
            if (x.indexOf('.') !== -1) { x = x.replace(/0+$/, ''); }
            if (x.endsWith('.')) { x = x.substr(0, x.length-1); }
            return x + '%';
        });
    }

    if (!LocusZoom.ScaleFunctions._items.has("effect_direction")){
        LocusZoom.ScaleFunctions.add("effect_direction", function(parameters, input){
        if (typeof input === "undefined"){
            return null;
        } else if (!isNaN(input.beta)) {
            if (!isNaN(input.sebeta)) {
                if      (input.beta - 2*input.sebeta > 0) { return parameters['+'] || null; }
                else if (input.beta + 2*input.sebeta < 0) { return parameters['-'] || null; }
            } else {
                if      (input.beta > 0) { return parameters['+'] || null; }
                else if (input.beta < 0) { return parameters['-'] || null; }
            }
        } else if (!isNaN(input.or)) {
            if      (input.or > 0) { return parameters['+'] || null; }
            else if (input.or < 0) { return parameters['-'] || null; }
        }
        return null;
    });
    }

    generatePlot(props.variantList)
});

</script>

<template>
    <div id="phewas_plot_container"></div>
</template>