<script setup>
import LocusZoom from 'locuszoom';
import {onMounted, ref, watch} from 'vue'
import { useRoute } from 'vue-router';


import * as utils from '../pages/region/Region.js'

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const props = defineProps({
    data: Array,
    region:{
        type : String
    },
});

const plot = ref(null)
const info = ref(null)

const route = useRoute();
const phenocode = route.params.phenocode;
const currentPhenoList = ref(null);

var region = route.params.region;

var max_y_value = 10;

if (!route.params.region){
    region = props.region;
}

//need to check if it already exists incase user presses the back arrow
if (!LocusZoom.Adapters._items.has('AssociationPheWeb')){

    // replace the .extend method with ES6 class
    class AssociationPheWeb extends LocusZoom.Adapters.get('AssociationLZ') {
        getURL(state, chain, fields) {
            return this.url + state.chr + ":" + state.start + "-" + state.end;
        }
        
        // Although the layout fields array is useful for specifying transforms, this source will magically re-add
        //  any data that was not explicitly requested
        extractFields(data, fields, outnames, trans) {
            // The field "all" has a special meaning, and only exists to trigger a request to this source.
            // We're not actually trying to request a field by that name.

            var has_all = fields.indexOf("all");
            if (has_all !== -1) {
                fields.splice(has_all, 1);
                outnames.splice(has_all, 1);
                trans.splice(has_all, 1);
            }
            // Find all fields that have not been requested (sans transforms), and add them back to the fields array

            if (data.length) {
                var fieldnames = Object.keys(data[0]);
                var ns = this.source_id + ":"; // ensure that namespacing is applied to the fields
                fieldnames.forEach(function(item) {
                    var ref = fields.indexOf(item);
                    if (ref === -1 || trans[ref]) {
                        fields.push(item);
                        outnames.push(ns + item);
                        trans.push(null);
                    }
                });
            }
            return super.extractFields(data, fields, outnames, trans);
        }

        normalizeResponse(data) {
            // The PheWeb region API has a fun quirk where if there is no data, there are also no keys
            //   (eg data = {} instead of  {assoc:[]} etc. Explicitly detect and handle the edge case in PheWeb;
            //   we won't handle this in LZ core because we don't want squishy-blob API schemas to catch on.
            if (!Object.keys(data).length) {
                return [];
            }

            // console.log("given_max : ", data.max_log10p)
            if (data.max_log10p > max_y_value){
                max_y_value = Math.ceil(data.max_log10p);
                // console.log(plot.refresh())
            }
            // console.log(max_y_value)

            delete data.max_log10p

            return super.normalizeResponse(data);
        }
    }
    
    // register the adapter to LocusZoom
    LocusZoom.Adapters._items.set('AssociationPheWeb', AssociationPheWeb);
}

if (!LocusZoom.TransformationFunctions._items.has('percent')){
    LocusZoom.TransformationFunctions.add("percent", function(x) {
        if (x === 1) { return "100%"; }
        x = (x * 100).toPrecision(2);
        if (x.indexOf('.') !== -1) { x = x.replace(/0+$/, ''); }
        if (x.endsWith('.')) { x = x.substr(0, x.length-1); }
        return x + '%';
    });
}

const data_sources_new = ref(null)
const phenocode_list = ref(null)
const fetchData = async () => {
    if (props.data.length === 0 || !props.data){
        return;
    }
    
    info.value = props.data

    if (info.value[0].stratification){
        phenocode_list.value = info.value.map((pheno) => {return pheno.phenocode + "." + Object.values(pheno.stratification).join('.')})
    } else {
        phenocode_list.value = info.value.map((pheno) => {return pheno.phenocode})
    }

    currentPhenoList.value = phenocode_list;

    var remoteBase = "https://portaldev.sph.umich.edu/api/v1/";

    data_sources_new.value = new LocusZoom.DataSources()
        .add("catalog", ["GwasCatalogLZ", {url: remoteBase + 'annotation/gwascatalog/results/', params: { build: "GRCh38" }}])
        .add("ld", ["LDServer", { url: "https://portaldev.sph.umich.edu/ld/",
            params: { source: '1000G', build: 'GRCh38', population: 'ALL' }
        }])
        .add("gene", ["GeneLZ", { url: remoteBase + "annotation/genes/", params: {build: 'GRCh38'} }])
        .add("recomb", ["RecombLZ", { url: remoteBase + "annotation/recomb/results/", params: {build:'GRCh38'} }]);

    phenocode_list.value.forEach( function (phenocode, i){
        var phenocode_list = phenocode.split(".")
        var stratification = '.' + phenocode_list.slice(1).join('.')
        data_sources_new.value.add(utils.fmt("assoc_study{0}",i+1), ["AssociationPheWeb", {url: api + "/phenotypes/"+ phenocode_list[0] +"/"+ stratification + "/region/", source: i+1}])

    });


    var all_panels = []

    all_panels.push(
            function() {
                var base = LocusZoom.Layouts.get("panel", "annotation_catalog", {
                    namespace: { assoc: 'assoc_study1'},
                    height: 52, min_height: 52,
                    margin: { top: 30, bottom: 13 },
                    toolbar: { widgets: [] },
                    axes: {
                        // FIXME: Can be removed after 0.13.1 bugfix release (render: false was missing)
                        x: { render: false, extent: 'state' }
                    },
                    title: {
                        text: 'Hits in GWAS Catalog',
                        style: {'font-size': '14px'},
                        x: 50,
                    },
                });
                var anno_layer = base.data_layers[0];
                anno_layer.id_field = "{{namespace[assoc]}}id";
                anno_layer.fields = [  // Tell annotation track the field names as used by PheWeb
                    "{{namespace[assoc]}}id",
                    "{{namespace[assoc]}}chr", "{{namespace[assoc]}}position",
                    "{{namespace[catalog]}}variant", "{{namespace[catalog]}}rsid", "{{namespace[catalog]}}trait", "{{namespace[catalog]}}log_pvalue"
                ];
                anno_layer.hit_area_width = 50;
                return base;
            }()
    );

    phenocode_list.value.forEach( function (phenocode, i){
        
        let dynamicPart = utils.fmt("assoc_study{0}", i + 1);

        var template = utils.tooltip_lztemplate.replace(/{{/g, `{{${dynamicPart}:`)
                            .replace(new RegExp(`{{${dynamicPart}:#if `, 'g'), `{{#if ${dynamicPart}:`)
                            .replace(new RegExp(`{{${dynamicPart}:\\/if}}`, 'g'), "{{/if}}");

        all_panels.push(
            function() {
                var base = LocusZoom.Layouts.get("panel", "association_catalog", {
                    namespace: { assoc: dynamicPart },
                    height: 200, min_height: 200,
                    margin: { top: 20 },
                    id: dynamicPart,
                    title: { 
                        text: phenocode.split('.').join(', '),
                        style: {'font-size': '14px'},
                        y : 15,
                        x : 50,
                    },
                    toolbar: {
                        widgets: [
                            {
                                type: "toggle_legend",
                                position: "right",
                                color: "green"
                            },
                            {
                                type: "display_options",
                                position: "right",
                                color: "blue",
                                // Below: special config specific to this widget
                                button_html: "Display options...",
                                button_title: "Control how plot items are displayed",

                                layer_name: "associationpvaluescatalog",
                                default_config_display_name: "No catalog labels (default)", // display name for the default plot color option (allow user to revert to plot defaults)

                                options: [
                                    {
                                        match: { send: '{{namespace[assoc]}}id', receive: '{{namespace[assoc]}}id' },
                                        // First dropdown menu item
                                        display_name: "Label catalog traits",  // Human readable representation of field name
                                        display: {  // Specify layout directives that control display of the plot for this option
                                            label: {
                                                text: "{{{{namespace[catalog]}}trait}}",
                                                spacing: 6,
                                                lines: {
                                                    style: {
                                                        "stroke-width": "2px",
                                                        "stroke": "#333333",
                                                        "stroke-dasharray": "2px 2px"
                                                    }
                                                },
                                                filters: [
                                                    // Only label points if they are significant for some trait in the catalog, AND in high LD
                                                    //  with the top hit of interest
                                                    {
                                                        field: "{{namespace[catalog]}}trait",
                                                        operator: "!=",
                                                        value: null
                                                    },
                                                    {
                                                        field: "{{namespace[catalog]}}log_pvalue",
                                                        operator: ">",
                                                        value: 7.301
                                                    },
                                                    {
                                                        field: "{{namespace[ld]}}state",
                                                        operator: ">",
                                                        value: 0.4
                                                    },
                                                ],
                                                style: {
                                                    "font-size": "10px",
                                                    "font-weight": "bold",
                                                    "fill": "#333333"
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    data_layers: [
                        LocusZoom.Layouts.get("data_layer", "significance", { unnamespaced: true }),
                        LocusZoom.Layouts.get("data_layer", "recomb_rate", { unnamespaced: true }),
                        function() {
                            var l = LocusZoom.Layouts.get("data_layer", "association_pvalues_catalog", {
                                unnamespaced: true,
                                fields: [
                                    "{{namespace[assoc]}}all", // special mock value for the custom source
                                    "{{namespace[assoc]}}id",
                                    "{{namespace[assoc]}}position",
                                    "{{namespace[assoc]}}pvalue|neglog10_or_323",
                                    "{{namespace[ld]}}state", "{{namespace[ld]}}isrefvar",
                                    "{{namespace[catalog]}}rsid", "{{namespace[catalog]}}trait", "{{namespace[catalog]}}log_pvalue"
                                ],
                                id_field: "{{namespace[assoc]}}id",
                                // tooltip: {
                                //     closable: true,
                                //     show: {
                                //         "or": ["highlighted", "selected"]
                                //     },
                                //     hide: {
                                //         "and": ["unhighlighted", "unselected"]
                                //     },
                                //     html: "<strong>{{{{namespace[assoc]}}id}}</strong><br><br>" +
                                //         template +
                                //         "<br>" +
                                //         "<a href=\"" + window.location.origin+ "/variant/{{{{namespace[assoc]}}chr}}-{{{{namespace[assoc]}}position}}-{{{{namespace[assoc]}}ref}}-{{{{namespace[assoc]}}alt}}\"" + ">Go to PheWAS</a>" +
                                //         "{{#if {{namespace[catalog]}}rsid}}<br><a href=\"https://www.ebi.ac.uk/gwas/search?query={{{{namespace[catalog]}}rsid}}\" target=\"_new\">See hits in GWAS catalog</a>{{/if}}" +
                                //         "<br>{{#if {{namespace[ld]}}isrefvar}}<strong>LD Reference Variant</strong>{{#else}}<a href=\"javascript:void(0);\" onclick=\"var data = this.parentNode.__data__;data.getDataLayer().makeLDReference(data);\">Make LD Reference</a>{{/if}}<br>"
                                // },
                                tooltip: {
                                    closable: true,
                                    show: {
                                        "or": ["highlighted", "selected"]
                                    },
                                    hide: {
                                        "or": ["unhighlighted", "unselected", "mouseout"] // Add "mouseout" to close tooltip when moving the mouse out
                                    },
                                    html: "<strong>{{{{namespace[assoc]}}id}}</strong><br><br>" +
                                        template +
                                        "<br>" +
                                        "<a href=\"" + window.location.origin + "/variant/{{{{namespace[assoc]}}chr}}-{{{{namespace[assoc]}}position}}-{{{{namespace[assoc]}}ref}}-{{{{namespace[assoc]}}alt}}\"" + ">Go to PheWAS</a>" +
                                        "{{#if {{namespace[catalog]}}rsid}}<br><a href=\"https://www.ebi.ac.uk/gwas/search?query={{{{namespace[catalog]}}rsid}}\" target=\"_new\">See hits in GWAS catalog</a>{{/if}}" +
                                        "<br>{{#if {{namespace[ld]}}isrefvar}}<strong>LD Reference Variant</strong>{{#else}}<a href=\"javascript:void(0);\" onclick=\"var data = this.parentNode.__data__;data.getDataLayer().makeLDReference(data);\">Make LD Reference</a>{{/if}}<br>"
                                },
                                x_axis: { field: "{{namespace[assoc]}}position" },
                                y_axis: {
                                    axis: 1,
                                    field: "{{namespace[assoc]}}pvalue|neglog10_or_323",
                                    floor: 0,
                                    upper_buffer: 0.1,
                                    min_extent: [0, max_y_value] // TODO: get the highest value of the list and put here.
                                }
                            });
                            l.behaviors.onctrlclick = [{
                                action: "link",
                                href: window.location.origin+"/variant/{{{{namespace[assoc]}}chr}}-{{{{namespace[assoc]}}position}}-{{{{namespace[assoc]}}ref}}-{{{{namespace[assoc]}}alt}}"
                            }];
                            return l;
                        }()
                    ],
                });
                base.legend.origin.y = 15;
                return base;
            }(),
        )
    });

    all_panels.push(
        LocusZoom.Layouts.get("panel", "genes", {
            unnamespaced: true,
            // proportional_height: 0.5,
            toolbar: {
                widgets: [{
                    type: "resize_to_data",
                    position: "right",
                    color: "blue"
                }, LocusZoom.Layouts.get('toolbar_widgets', 'gene_selector_menu')]
            },
            data_layers: [
                LocusZoom.Layouts.get("data_layer", "genes_filtered", {
                    unnamespaced: true,
                    fields: ["{{namespace[gene]}}all"],
                    tooltip: {
                        html: ("<h4><strong><i>{{gene_name}}</i></strong></h4>" +
                                "<div>Gene ID: <strong>{{gene_id}}</strong></div>" +
                                "<div>Transcript ID: <strong>{{transcript_id}}</strong></div>" +
                                "<div style=\"clear: both;\"></div>" +
                                "<table width=\"100%\"><tr><td style=\"text-align: right;\"><a href=\"http://gnomad.broadinstitute.org/gene/{{gene_id}}\" target=\"_new\">More data on gnomAD/ExAC</a> and <a href=\"http://bravo.sph.umich.edu/freeze5/hg38/gene/{{gene_id}}\" target=\"_new\">Bravo</a></td></tr></table>")
                    },

                })
            ],
        })
    )

    // if location is gene page, don't have this option.
    var link_to_pheno;
    if (route.params.region){
        link_to_pheno = {
            type: 'link',
            title: 'Go to Pheno Page',
            text:' Miami / Manhattan Plot',
            url: window.location.origin + '/phenotypes/' + phenocode,
            position: 'left',
        };    
    }



    // This outer call to Layouts.get() will ensure that namespaces are applied, and the returned result is a concrete 
    //   layout ready for use in drawing a plot with specific data sets. 
    var layout_new = LocusZoom.Layouts.get('plot', 'association_catalog', { // Override select fields of a pre-made layout 
        namespace: { assoc: 'assoc_study1'},
        width: 800,
        // height: 550,
        responsive_resize: true,
        max_region_scale: 500e3,
        toolbar: {
            widgets: [
            link_to_pheno,
            {
                type: 'move',
                text: '<<',
                title: 'Shift view 1/4 to the left',
                direction: -0.75,
                group_position: "start"
            }, {
                type: 'move',
                text: '<',
                title: 'Shift view 1/4 to the left',
                direction: -0.25,
                group_position: "middle"
            }, {
                type: 'zoom_region',
                button_html: 'z+',
                title: 'zoom in 2x',
                step: -0.5,
                group_position: "middle"
            }, {
                type: 'zoom_region',
                button_html: 'z-',
                title: 'zoom out 2x',
                step: 1,
                group_position: "middle"
            }, {
                type: 'move',
                text: '>',
                title: 'Shift view 1/4 to the right',
                direction: 0.25,
                group_position: "middle"
            }, {
                type: 'move',
                text: '>>',
                title: 'Shift view 3/4 to the right',
                direction: 0.75,
                group_position: "end"
            }, {
                type: 'download',
                position: 'right',
            }, {
                type: 'download_png',
                position: 'right',
            }, LocusZoom.Layouts.get('toolbar_widgets', 'ldlz2_pop_selector')]
        },
        panels: all_panels, 
    });
    if (!LocusZoom.TransformationFunctions._items.has("neglog10_or_323")){
        LocusZoom.TransformationFunctions.add("neglog10_or_323", function(x) {
            if (x === 0) return 323;
            return -Math.log(x) / Math.LN10;
        });
    }

    // Toolbar Widgets
    function add_toolbar_button(name, click_handler) {
        if (!LocusZoom.Widgets._items.has(name)){

            // use ES6 class instead of .extend method
            class CustomWidget extends LocusZoom.Widgets.get('BaseWidget') {
                update() {
                    if (this.button)
                        return this;
                    this.button = new (LocusZoom.Widgets.get('_Button'))(this)
                        .setColor(this.layout.color)
                        .setHtml(this.layout.text)
                        .setTitle(this.layout.title)
                        .setOnclick(click_handler.bind(this));
                    this.button.show();
                    return this.update();
                }
            }
            
            // register the widget to LocusZoom
            LocusZoom.Widgets._items.set(name, CustomWidget);
        }
    }

    add_toolbar_button('link', function() {
        window.location.href = this.layout.url;
    });

    add_toolbar_button('move', function() {
        // FIXME: Replace with the LocusZoom widget`shift_region` (after adding a stepsize mode for relative region widths)
        var start = this.parent_plot.state.start;
        var end = this.parent_plot.state.end;
        var shift = Math.floor(end - start) * this.layout.direction;
        this.parent_plot.applyState({
            chr: this.parent_plot.state.chr,
            start: start + shift,
            end: end + shift
        });
    });


    plot.value = LocusZoom.populate("#lz", data_sources_new.value, layout_new);

    // Handle double-click on a variant point
    var doubleclick_delay_ms = 400;
    var previous_data, previous_milliseconds = 0;
    Object.keys(plot.value.panels).forEach(function(key, i) {
        //all but first and last panel
        if (i != 0 && i != Object.keys(plot.value.panels).length - 1) {
            plot.value.panels[key].on('element_clicked', function(obj) {
                var data = obj.data, milliseconds = Date.now();
                if ((data === previous_data) && (milliseconds - previous_milliseconds < doubleclick_delay_ms)) {
                    window.location.href = (window.location.origin + "/variant/" +
                                            data["assoc:chr"] + "-" + data["assoc:position"] + "-" +
                                            data["assoc:ref"] + "-" + data["assoc:alt"]);
                }
                previous_data = data;
                previous_milliseconds = milliseconds;
            });
        }
    })
}

onMounted(() => {
    fetchData();
})
watch(
    () => props.data,
    (newValue) => {
        fetchData();
    },
);

</script>

<template>
    <div id="lz" class="lz-container-responsive" :data-region="region"></div>
</template>

<style lang="scss" scoped>

.lz-toolbar.lz-plot-toolbar {
    text-align: center;
}
.lz-toolbar-left, .lz-toolbar-right {
    display: inline-block;
}
.lz-toolbar-group-start, .lz-toolbar-group-middle, .lz-toolbar-group-end {
    float: none !important;
}

</style>