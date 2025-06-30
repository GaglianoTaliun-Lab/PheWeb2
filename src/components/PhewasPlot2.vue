<script setup>
import LocusZoom from 'locuszoom';
import 'locuszoom/dist/locuszoom.css';
import * as d3 from 'd3'
import _ from 'underscore'
import { onMounted, ref, watch} from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import * as utils from '@/pages/variant/Variant.js'

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;

const props = defineProps({
    key : {
        type : String
    },
    stratification: {
        type: String
    },
    categoryList : {
        type: Array,
        required : false,
    }
});

const plot = ref(null)
const data = ref(null)
const route = useRoute();
const variantCode = route.params.variant_id;

const fetchData = async () => {

    var result = [];
    try {
      const response = await axios.get(
        `${api}/variant/${variantCode}/${props.stratification}`
      );
      result.push(response.data);
      result[0].stratification = '.' + props.stratification;
    } catch (error) {
      console.log(
        `Error fetching plotting data with stratification ${props.stratification}:`,
        error
      );
    }

    data.value = result

}

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

    var order = []

    variant_list.forEach((variant) => {
        order.push(variant.stratification)
    });

    variant_list = reorderListByValues(variant_list, order, 'stratification')

    var best_neglog10_pval = 0;

    variant_list.forEach(variant => {
        var value = d3.max(variant.phenos.map(function(x) { return LocusZoom.TransformationFunctions.get('neglog10')(x.pval); }));
        if (value > best_neglog10_pval){
            best_neglog10_pval = value
        }
    })

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


    variant_list.forEach(variant => {
        // sort phenotypes
        if (_.any(variant.phenos.map(function(d) { return d.phenocode; }).map(parseFloat).map(isNaN))) {
            variant.phenos = _.sortBy(variant.phenos, function(d) { return d.phenocode; });
        } else {
            variant.phenos = _.sortBy(variant.phenos, function(d) { return parseFloat(d.phenocode); });
        }
    })

    // Build global list of unique categories from all variants or props
    let global_unique_categories = [];

    if (!props.categoryList) {
        const all_categories = new Set();
        variant_list.forEach(variant => {
            variant.phenos.forEach(pheno => {
                all_categories.add(pheno.category);
            });
        });
        global_unique_categories = Array.from(all_categories);
    } else {
        global_unique_categories = [...props.categoryList];
    }

    // Use the same global category list for each variant
    const unique_categories_list = variant_list.map(() =>
        JSON.parse(JSON.stringify(global_unique_categories))
    );

    // Build global, stable category-to-color mapping
    const category_palette = d3.schemeCategory10.concat(d3.schemeCategory10); // 20 fixed colors
    const color_by_category_all = d3.scaleOrdinal()
        .domain(global_unique_categories)
        .range(category_palette.slice(0, global_unique_categories.length));

    const first_of_each_category_list = variant_list.map((variant, j) => {
    const seen = {};
    const allowed_categories = new Set(unique_categories_list[j]);
    return variant.phenos.filter(pheno => {
        if (!allowed_categories.has(pheno.category)) return false;
        if (seen[pheno.category]) return false;
        seen[pheno.category] = true;
        return true;
    });
    });

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



    // const category20 = d3.schemeCategory10.concat(d3.schemeCategory10);  /* d3 removed category20, so I make this terrible version */

    // var largest_number_of_categories = unique_categories_list.reduce((a, b) => (b.length > a.length ? b : a));
    // var color_by_category_all = d3.scaleOrdinal((largest_number_of_categories.length > 10) ? category20 : d3.schemeCategory10).domain(largest_number_of_categories)

    variant_list.forEach((variant, j) => {
        // remove variants which do not belong to unique_categories_list (unchecked categories)
        variant.phenos = variant.phenos.filter(pheno => unique_categories_list[j].includes(pheno.category));

        variant.phenos.forEach(function(d, i) {
            d.phewas_code = d.phenocode;
            d.phewas_string = (d.phenostring || d.phenocode);
            d.category_name = d.category;
            d.color = color_by_category_all(d.category);
            d.idx = i;
        });
    });

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
                min_height : 200,
                height : 260,
                margin: { top: 40, right: 40, bottom: 20, left: 50 },
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
                                          utils.lz_template + "<br>" + 
                                          "<a href=\"" + window.location.origin + "/phenotypes/{{phewas_code}}\"" + ">Go to Pheno Page</a>"),
                        // Show labels that are: in the top 10, and (by neglog10) >=75% of sig threshold, and >=25% of best
                        "label.text": "{{phewas_string}}",
                        "label.filters": (function() {
                            var ret = [
                                {field:"pval|neglog10_handle0", operator:">", value:neglog10_significance_threshold_list[i] * 3/4},
                                {field:"pval|neglog10_handle0", operator:">", value:best_neglog10_pval / 4}
                            ];
                            if (variant_list[0].phenos.length > 10) { // TODO: instead of first 60, we need to first 10 per trait.
                                ret.push({field:"pval", operator:"<", value:_.sortBy(variant_list[i].phenos.map(_.property('pval')))[100]});
                            }
                            return ret;
                        })(),
                        //"behaviors.onclick": [{action:"link", href:window.location.origin+"/phenotypes/{{phewas_code}}"}],
                    }),
                ],

                "axes.y1.label": "-log\u2081\u2080(p-value)",
            }),
        )
    });

    // add x axis labels to last panel
    panel_list[panel_list.length -1]["axes"]["x"]["ticks"] = first_of_each_category_list[panel_list.length -1].map(function(pheno) {
                    return {
                        style: {fill: pheno.color, "font-size":"11px", "font-weight":"bold", "text-anchor":"start"},
                        transform: "translate(15, 0) rotate(50)",
                        text: pheno.category,
                        x: pheno.idx
                    };
                })

    panel_list[panel_list.length -1]['margin']['bottom'] = 100
    panel_list[panel_list.length -1]['height'] += 100

    var layout = {
        state: {
            variant: ['chrom', 'pos', 'ref', 'alt'].map(function(d) { return variant_list[0][d];}).join("-"),
        },
        dashboard: {
            components: [
                {
                        type: 'remove_panel',          
                        id: 'remove_panel',  
                        title: 'Remove Panel',   
                        label: 'Remove Panel', 
                        position: "right",
                        color: 'red',
                        suppress_confirm : 'true'
                },
                {type: "download", position: "right"},
                {type: "download_png", position: "right"},
            ],
        },
        responsive_resize: true,
        mouse_guide: false,
        panels: panel_list,
    };

    plot.value = LocusZoom.populate("#" + sanitizeId(props.stratification), data_sources, layout);

    return;
}

onMounted(async () => {

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

    await fetchData();
    generatePlot(data.value)
});

function sanitizeId(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/gi, '-') // replace anything not a-z, 0-9, - or _ with a dash
    .replace(/-+/g, '-')           // collapse multiple dashes
}

</script>

<template>
    <div :id="sanitizeId(props.stratification)"></div>
</template>