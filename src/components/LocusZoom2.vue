<template>
    <div id="lz" class="lz-container-responsive" :data-region="region"></div>
</template>

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
const phenocode_list = ref(null)

const route = useRoute();
const phenocode = route.params.phenocode;
const currentPhenoList = ref(null);
const link_to_pheno = ref(null);

var region = route.params.region;

var max_y_value = 10;

if (!route.params.region){
    region = props.region;
} else {
    link_to_pheno.value = {
        type: 'link',
        title: 'Go to Pheno Page',
        text:' Miami / Manhattan Plot',
        url: window.location.origin + '/phenotypes/' + phenocode,
        position: 'left',
    };  
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
const fetchData = async () => {
    
    // console.log(phenocode_list.value)
    var remoteBase = "https://portaldev.sph.umich.edu/api/v1/";
    data_sources_new.value = new LocusZoom.DataSources()
        .add("catalog", ["GwasCatalogLZ", {url: remoteBase + 'annotation/gwascatalog/results/', params: { build: "GRCh38" }}])
        .add("ld", ["LDServer", { url: "https://portaldev.sph.umich.edu/ld/",
            params: { source: '1000G', build: 'GRCh38', population: 'ALL' }
        }])
        .add("gene", ["GeneLZ", { url: remoteBase + "annotation/genes/", params: {build: 'GRCh38'} }])
        .add("recomb", ["RecombLZ", { url: remoteBase + "annotation/recomb/results/", params: {build:'GRCh38'} }]);
    
    getPhenoData();
    phenocode_list.value.forEach( function (phenocode, i){
        // console.log("phenocode", phenocode)
        var phenocode_list = phenocode.split("0")
        var stratification = '.' + phenocode_list.slice(-2).join('.')
        console.log("stratification", stratification)
        if (!data_sources_new.value.has(phenocode)){
            data_sources_new.value.add(phenocode, ["AssociationPheWeb", {url: api + "/phenotypes/"+ phenocode_list[0] +"/"+ stratification + "/region/", source: i+1}])
        }
    });
}
const getPhenoData = () => {
    if (props.data.length === 0 || !props.data){
        return;
    }
    info.value = props.data

    if (info.value[0].stratification){
        phenocode_list.value = info.value.map((pheno) => {return pheno.phenocode + "." + Object.values(pheno.stratification).join('.')})
    } else {
        phenocode_list.value = info.value.map((pheno) => {
            // console.log("pheno", pheno)
            return pheno.phenocode.replace(/\./g, "0");
        })
    }
    console.log(data_sources_new.value)
}

const all_panels = ref([])
function createAssociationPanel(phenocode, template) {
    return LocusZoom.Layouts.get("panel", "association_catalog", {
        namespace: { assoc: phenocode },
        id: phenocode,
        height: 200,
        min_height: 200,
        margin: { top: 20 },
        title: { 
            text: phenocode.split('0').join(', '),
            style: {'font-size': '14px'},
            y: 15,
            x: 50,
        },
        y_index: -1,
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
                    button_html: "Display options...",
                    button_title: "Control how plot items are displayed",
                    layer_name: "associationpvaluescatalog",
                    default_config_display_name: "No catalog labels (default)",
                    options: [
                        {
                            match: { send: '{{namespace[assoc]}}id', receive: '{{namespace[assoc]}}id' },
                            display_name: "Label catalog traits",
                            display: {
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
            (() => {
                const layer = LocusZoom.Layouts.get("data_layer", "association_pvalues_catalog", {
                    unnamespaced: true,
                    fields: [
                        "{{namespace[assoc]}}all",
                        "{{namespace[assoc]}}id",
                        "{{namespace[assoc]}}position",
                        "{{namespace[assoc]}}pvalue|neglog10_or_323",
                        "{{namespace[ld]}}state", "{{namespace[ld]}}isrefvar",
                        "{{namespace[catalog]}}rsid", "{{namespace[catalog]}}trait", "{{namespace[catalog]}}log_pvalue"
                    ],
                    id_field: "{{namespace[assoc]}}id",
                    tooltip: {
                        closable: true,
                        show: {
                            or: ["highlighted", "selected"]
                        },
                        hide: {
                            or: ["unhighlighted", "unselected", "mouseout"]
                        },
                        html: "<strong>{{{{namespace[assoc]}}id}}</strong><br><br>" +
                            template +
                            "<br>" +
                            `<a href="${window.location.origin}/variant/{{{{namespace[assoc]}}chr}}-{{{{namespace[assoc]}}position}}-{{{{namespace[assoc]}}ref}}-{{{{namespace[assoc]}}alt}}">Go to PheWAS</a>` +
                            `{{#if {{namespace[catalog]}}rsid}}<br><a href="https://www.ebi.ac.uk/gwas/search?query={{{{namespace[catalog]}}rsid}}}" target="_new">See hits in GWAS catalog</a>{{/if}}` +
                            `<br>{{#if {{namespace[ld]}}isrefvar}}<strong>LD Reference Variant</strong>{{#else}}<a href="javascript:void(0);" onclick="var data = this.parentNode.__data__;data.getDataLayer().makeLDReference(data);">Make LD Reference</a>{{/if}}<br>`
                    },
                    x_axis: { field: "{{namespace[assoc]}}position" },
                    y_axis: {
                        axis: 1,
                        field: "{{namespace[assoc]}}pvalue|neglog10_or_323",
                        floor: 0,
                        upper_buffer: 0.1,
                        min_extent: [0, max_y_value]
                    }
                });

                layer.behaviors.onctrlclick = [{
                    action: "link",
                    href: `${window.location.origin}/variant/{{{{namespace[assoc]}}chr}}-{{{{namespace[assoc]}}position}}-{{{{namespace[assoc]}}ref}}-{{{{namespace[assoc]}}alt}}`
                }];

                return layer;
            })()
        ]
    });
}

const getPanels = () => {
    all_panels.value.push(
            function() {
                var base = LocusZoom.Layouts.get("panel", "annotation_catalog", {
                    namespace: { assoc: phenocode_list.value[0]},
                    height: 60, min_height: 52,
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
    all_panels.value.push(
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
    );
    phenocode_list.value.forEach( function (phenocode, i){
        
        let dynamicPart = phenocode

        var template = utils.tooltip_lztemplate.replace(/{{/g, `{{${dynamicPart}:`)
                            .replace(new RegExp(`{{${dynamicPart}:#if `, 'g'), `{{#if ${dynamicPart}:`)
                            .replace(new RegExp(`{{${dynamicPart}:\\/if}}`, 'g'), "{{/if}}");

        all_panels.value.push(
            createAssociationPanel(phenocode, template)
        )
    });
    console.log("all_panels", all_panels.value)
}

const layout_new = ref(null)
const getLayout = () => {
    layout_new.value = LocusZoom.Layouts.get('plot', 'association_catalog', { // Override select fields of a pre-made layout 
        namespace: { assoc: phenocode_list.value[0]},
        width: 800,
        // height: 550,
        responsive_resize: true,
        max_region_scale: 500e3,
        toolbar: {
            widgets: [
            link_to_pheno.value,
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
        panels: all_panels.value, 
    });
    if (!LocusZoom.TransformationFunctions._items.has("neglog10_or_323")){
        LocusZoom.TransformationFunctions.add("neglog10_or_323", function(x) {
            if (x === 0) return 323;
            return -Math.log(x) / Math.LN10;
        });
    }
    console.log(layout_new.value)
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
}

const addNewPanel = () => {
    getPhenoData();
    phenocode_list.value.forEach(function (phenocode, i){
        console.log("phenocode", phenocode)
        var phenocode_list = phenocode.split("0")
        var stratification = '.' + phenocode_list.slice(-2).join('.')
        if (!data_sources_new.value.has(phenocode)){
            console.log("adding new panel", phenocode)
            let dynamicPart = phenocode

            var template = utils.tooltip_lztemplate.replace(/{{/g, `{{${dynamicPart}:`)
                                .replace(new RegExp(`{{${dynamicPart}:#if `, 'g'), `{{#if ${dynamicPart}:`)
                                .replace(new RegExp(`{{${dynamicPart}:\\/if}}`, 'g'), "{{/if}}");

            var extra_panel_layout = createAssociationPanel(phenocode, template)
            data_sources_new.value.add(phenocode, ["AssociationPheWeb", {url: api + "/phenotypes/"+ phenocode_list[0] +"/"+ stratification + "/region/", source: i+1}])
            plot.value.addPanel(extra_panel_layout);
        }
    })
    // loop through data_sources_new.value to check if the phenocode is one of the keys
    const builtIns = ['catalog', 'ld', 'gene', 'recomb'];
    const customKeys = [...data_sources_new.value._items.keys()].filter(k => !builtIns.includes(k));
    // console.log(customKeys);
    console.log(typeof(phenocode_list.value))
    console.log(phenocode_list.value)
    customKeys.forEach(key => {
        if (!phenocode_list.value.includes(key)){
            console.log("removing panel", key)
            plot.value.removePanel(key);
            if (data_sources_new.value._items.has(key)) {
                data_sources_new.value._items.delete(key);
            }
        }
    })
}




onMounted(() => {
    fetchData();
    getPanels();
    getLayout();

    console.log(props.data)
    plot.value = LocusZoom.populate("#lz", data_sources_new.value, layout_new.value);
})

watch(
    () => props.data,
    (newValue) => {
        addNewPanel();
        // 
        // plot.value = LocusZoom.populate("#lz", data_sources_new.value, layout_new.value);
        // plot.value = LocusZoom.populate("#lz", data_sources_new.value, layout.value);
    },
);


</script>

<style scoped>

</style>