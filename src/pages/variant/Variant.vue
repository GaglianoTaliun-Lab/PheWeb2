<template>
  <v-app>
    <Navbar />
    <v-main class="responsive-main">
      <!-- Loading Bar -->
    <!-- <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      height="5"
    ></v-progress-linear> -->

      <div class="ml-4 mt-2">
        <h1 class="mb-0">{{ variantCodeToLabel(variantCode) }}</h1>
        <div class="pt-0" v-if="variant">
          <p class="mb-0"> Nearest gene(s): <i>{{ variant.nearest_genes.split(',').join(', ') }}</i></p>
          <p class="mb-0"> Effect allele: {{ effectAlleleToLabel(variantCode) }}</p>
          <p class="mb-0">
            View on
            <a
              :href="`http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg${HG_BUILD_NUMBER}&highlight=hg${HG_BUILD_NUMBER}.chr${variant.chrom}%3A${variant.pos}-${variant.pos}&position=chr${variant.chrom}%3A${variant.pos - 200000}-${variant.pos + 200000}`"
              target="_blank"
              rel="noopener noreferrer"
              class="variant-link"
            >
              <span class="d-flex align-center">
                UCSC
                <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
              </span>
            </a>,
            <a
              :href="`https://www.ncbi.nlm.nih.gov/snp/?term=${variant.chrom}%5BChromosome%5D+AND+${variant.pos}%5BCHRPOS%5D`"
              target="_blank"
              rel="noopener noreferrer"
              class="variant-link"
            >
              <span class="d-flex align-center">
                dbSNP
                <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
              </span>
            </a>,
            <a
              :href="`https://useast.ensembl.org/Homo_sapiens/Location/Variant/Table?r=${variant.chrom}:${variant.pos}-${variant.pos}`"
              target="_blank"
              rel="noopener noreferrer"
              class="variant-link"
            >
              <span class="d-flex align-center">
                Ensembl
                <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
              </span>
            </a>,
            <a
              :href="`https://genetics.opentargets.org/Variant/${variant.chrom}_${variant.pos}_${variant.ref}_${variant.alt}/associations`"
              target="_blank"
              rel="noopener noreferrer"
              class="variant-link"
            >
              <span class="d-flex align-center">
                Open Targets Genetics
                <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
              </span>
            </a>,
            <a
              :href="`https://gnomad.broadinstitute.org/variant/${variant.chrom}-${variant.pos}-${variant.ref}-${variant.alt}?dataset=gnomad_r4`"
              target="_blank"
              rel="noopener noreferrer"
              class="variant-link"
            >
              <span class="d-flex align-center">
                gnomAD
                <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
              </span>
            </a>

            <template v-if="rsids.length === 1">,
              <a               
              target="_blank"
              rel="noopener noreferrer"
              class="variant-link"
              :href="`https://www.ebi.ac.uk/gwas/search?query=${rsids[0]}`"
              >
                <span class="d-flex align-center">
                  GWAS Catalog
                  <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                </span>
              </a>
              <!-- <a
              target="_blank"
              rel="noopener noreferrer"
              class="variant-link"
                :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsids[0]}`"
                >dbSNP</a
              > -->
            </template>

            <template v-else>
              <span v-for="rsid in rsids" :key="rsid">, 
                <a 
                target="_blank"
                rel="noopener noreferrer"
                class="variant-link"
                :href="`https://www.ebi.ac.uk/gwas/search?query=${rsid}`"
                  >GWAS Catalog for {{ rsid }}</a
                >
                <!-- <a
                target="_blank"
                rel="noopener noreferrer"
                class="variant-link"
                  :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsid}`"
                  >dbSNP for {{ rsid }}</a
                > -->
              </span>
            </template>
            <span style="font-weight: bold" id="pubmed-link"></span>
            <span style="font-weight: bold" id="clinvar-link"></span>
          </p>
        </div>

        <div class="d-flex align-items-center col-12 mt-1">

            <!-- <div class="mb-1 d-none d-md-flex">
                <div >
                  <v-chip
                    :disabled="isLoading"
                    size="x-large"
                    label
                    :color="isDisplayAllChecked ? 'default' : 'primary'"
                    filter
                    :filter-icon="isDisplayAllChecked ? '' : 'mdi-check'"
                    @click="isDisplayAllChecked = !isDisplayAllChecked; onDisplayChoiceChange() "
                  >
                    Show All PheWAS
                  </v-chip>
                </div>
            </div> -->

            <!-- <div class="display-choice">
              <h3><label class="mr-2 mt-4" >Compare Two Stratifications</label>
                <input class="mr-4 custom-checkbox"
                type="checkbox"
                id="display-choice"
                v-model="isDisplayAllChecked"
                @change="onDisplayChoiceChange"
                />
              </h3>
            </div> -->

          </div>

          <div class="d-flex justify-content-md-between">
            <div>
              <div v-if="category_list && category_list.length > 0" class="dropdown mr-2" id="dropdown-data1">
                <button :disabled="isLoading" class="btn btn-primary btn-drop" id="button-data1">
                  Choose Categories <span class="arrow-container"><span class="arrow-down"></span></span>
                </button>
                <div class="dropdown-menu" id="dropdown-content-data1">
                    <label v-for="(category, index) in category_list">
                        <input  
                        type="checkbox" 
                        :value="category" 
                        :name="category" 
                        v-model="selectedCategories"
                        @change="handleCheckboxChange">
                        {{ category }} 
                    </label> 
                </div>
              </div>
              <div class="dropdown pt-1 pr-2" id="dropdown-data1">
                <button :disabled="isDisabled || isLoading" class="btn btn-primary btn-drop" id="button-data1">
                  {{ keyToLabel(selectedStratification1) }}
                  <span class="arrow-container"><span class="arrow-down"></span></span>
                </button>
                <div class="dropdown-menu" id="dropdown-content-data1">
                  <label v-for="(stratification, index) in stratification_list">
                      <input 
                      type="radio" 
                      :value="stratification" 
                      :name="stratification" 
                      v-model="selectedStratification1"
                      @change="onDisplayChoiceChange">
                      {{ keyToLabel(stratification) }} 
                  </label> 
                </div>
              </div>
              <div class="dropdown pt-1 pr-2" id="dropdown-data2">
                <button :disabled="isDisabled || isLoading" v-if="selectedStratification2 == 'No stratification'" class="btn btn-primary btn-drop" id="button-data2">
                  No stratification <span class="arrow-container"><span class="arrow-down"></span></span>
                </button>
                <button :disabled="isDisabled || isLoading" v-else class="btn btn-primary btn-drop" id="button-data2">
                  {{ keyToLabel(selectedStratification2) }} <span class="arrow-container"><span class="arrow-down"></span></span>
                </button>
                <div class="dropdown-menu" id="dropdown-content-data2">
                  <label v-for="(stratification, index) in stratification_list">
                      <input 
                      type="radio" 
                      :value="stratification" 
                      :name="stratification" 
                      v-model="selectedStratification2"
                      @change="onDisplayChoiceChange">
                      {{ keyToLabel(stratification) }} 
                  </label> 
                </div>
              </div>
              <v-chip
                :disabled="isLoading"
                size="large"
                label
                :color="isDisplayAllChecked ? 'default' : 'primary'"
                filter
                :filter-icon="isDisplayAllChecked ? '' : 'mdi-check'"
                @click="isDisplayAllChecked = !isDisplayAllChecked; onDisplayChoiceChange() "
              >
                <span v-if="isDisplayAllChecked" style="display: flex; align-items: center;">Show All Stratifications <v-icon>mdi-checkbox-blank-outline</v-icon></span>
                <span v-else style="display: flex; align-items: center;">Compare Two Stratifications <v-icon>mdi-checkbox-marked-outline</v-icon></span>
              </v-chip>
            </div>

            <div class="text-left; d-flex; pa-2"> 
              <v-row align="center" justify="space-between">
                <v-col cols="auto">
                </v-col>
                <v-col cols="auto">
                  <v-btn color="primary" @click="downloadTable"> Download CSV</v-btn>
                </v-col>
              </v-row>
            </div>  
          </div>
        <!-- <div v-if="chosen_variants.length > 0">
          <PhewasPlot :key="refreshKey" :variantList="chosen_variants" :uniqueCategoriesList="category_list"/>
        </div> -->
        <div v-if="selectedStratifications.length > 0">
          <div v-for="stratification in selectedStratifications" :key="stratification + '-' + refreshKey">
            <PhewasPlot2 :stratification="stratification" :categoryList="selectedCategories" />
          </div>
        </div>
        <IsLoading v-if="selectedStratifications.length <= 0" :loadingText="loadingTextPhewas" class="mt-10 mb-5"/>
        <IsFailing v-if="isFailedPlotting" :isLoading="isLoading" :isFailed="isFailedPlotting" class="mt-10 mb-5"/>
        
        <div v-if="variant_list.length > 0 && selectedStratifications.length > 0">
          <div v-if="!isDisplayAllChecked">
            <VariantTable class="mb-10" :key="refreshKey" :selectedStratifications="selectedStratifications" :variantList="variant_list" :categoryList="selectedCategories"></VariantTable>
          </div>
          <div v-else>
            <VariantCompareTable class="mb-10" :key="refreshKey" :selectedStratification1="selectedStratifications[0]" :selectedStratification2="selectedStratifications[1]" :variantList="variant_list" :categoryList="selectedCategories"></VariantCompareTable>
          </div>
        </div>
        <div v-else>
          <v-card elevation="5">
            <v-data-table :items="[]" :headers="headers" fixed-header hover :loading="true">
              <template v-slot:loading>
                <v-progress-circular indeterminate color="primary" class="mt-2"></v-progress-circular>
                <br>
                <span class="mt-2">Loading Data... please wait </span>
                <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
              </template>
            </v-data-table>
          </v-card>
        </div>

      </div>
    </v-main> 
  </v-app>
</template>

<script setup name="Variant">
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import { maf_range, keyToLabel } from './Variant.js';

import Navbar from '@/components/Navbar.vue';
import PhewasPlot from '@/components/PhewasPlot.vue';
import PhewasPlot2 from '@/components/PhewasPlot2.vue';
import VariantTable from '@/components/VariantTable.vue';
import VariantCompareTable from '@/components/VariantCompareTable.vue';
import IsLoading from '@/components/IsLoading.vue';
import IsFailing from '@/components/IsFailing.vue';

import { HG_BUILD_NUMBER, PRIORITY_STRATIFICATIONS, STRATIFICATION_CATEGORIES } from "@/config.js";

const route = useRoute();

const variantCode = route.params.variant_id;
const stratification_list = ref(null);
const selectedStratifications = ref([])
const selectedStratification1 = ref(PRIORITY_STRATIFICATIONS[0])
const selectedStratification2 = ref(PRIORITY_STRATIFICATIONS[1])

const category_list = ref(null);
const selectedCategories = ref([]);

const pheno_list = ref(null);

const chosen_variants = ref([]);
const variant = ref(null);
const rsids = ref(null);
const variant_list = ref([]);
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;

const isLoading = ref(false);
const refreshKey = ref(0)

const isDisplayAllChecked = ref(true);
const isDisabled = ref(false);

const loadingTextPhewas = ref("Loading PheWAS data...");
const isFailedPlotting = ref(false);

const isTableLoading = computed(() => {
  return variant_list.length > 0 && selectedStratifications.length > 0;
});

const headers = ref([
    { 
      title: 'Category', 
      key: 'category',
      sortable: false 
    },
    { 
      title: 'Phenotype', 
      key: 'phenostring',
      sortable: false 
    },
    { 
      title: 'P-value', 
      key: 'pval',
      sortable: true
    },
    { title: 'EAF',
      key: 'eaf',
      sortable: false
    },
    { 
      title: 'Effect Size (SE)', 
      key: 'beta_se',
      sortable: false 
    },
    { 
      title: '#Samples', 
      key: 'num_samples',
      sortable: false 
    },
  ]);

onMounted(async () => {
  try {
    const response_stratification = await axios.get(`${api}/variant/stratification_list`);
    const response_category = await axios.get(`${api}/variant/category_list`);
    const response_phenolist = await axios.get(`${api}/phenotypes/`)

    stratification_list.value = JSON.parse(JSON.stringify(response_stratification.data));
    category_list.value = JSON.parse(JSON.stringify(response_category.data))
    pheno_list.value = JSON.parse(JSON.stringify(response_phenolist.data))

    // set chosen variants to be male and female automatically
    selectedStratifications.value = [selectedStratification1.value, selectedStratification2.value];
    selectedCategories.value = category_list.value;

    // we need to map here to get rid of the proxy
    fetchPhewasPlottingData(
      stratification_list.value.map((stratification) => stratification)
    );

    handleCheckboxChange();
    onDisplayChoiceChange();
    
  } catch (error) {
    console.log(error);
    isFailedPlotting.value = true;
  } finally {
    isLoading.value = false; // Stop loading
  }
});

function onDisplayChoiceChange(){
  if (!isDisplayAllChecked.value){
    isDisabled.value = true;
    selectedStratifications.value = stratification_list.value;

  } else {
    isDisabled.value = false;
    selectedStratifications.value = [selectedStratification1.value, selectedStratification2.value];
  }
  handleCheckboxChange();
}

async function fetchPhewasPlottingData(stratification_list) {
  isLoading.value = true; // Start loading
  var temp_variant_list = [];
  let isFirst = true;

  for (var stratification of stratification_list) {
    var result;
    try {
      const response = await axios.get(
        `${api}/variant/${variantCode}/${stratification}`
      );
      result = response.data;
      result.stratification = '.' + stratification;

      if (isFirst) {
        // First iteration logic here
        console.log("This is the first iteration.");
        variant.value = result;
        rsids.value = result.rsids ?  result.rsids.split(',') : [];
        isFirst = false;
      }

      temp_variant_list.push(result);
    } catch (error) {
      console.log(
        `Error fetching plotting data with stratification ${stratification}:`,
        error
      );
    }
  }
  variant_list.value = temp_variant_list;



  isLoading.value = false; // Stop loading
  return variant_list.value;
}

const variantCodeToLabel = (variantCode) => {
  var label_list = variantCode.split("-")
  var returned_label = label_list[0] + ": " + new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(label_list[1]) + " " + label_list[2] + "/" + label_list[3]

  if (rsids.value && rsids.value.length === 1){
    returned_label = returned_label + " (" + rsids.value + ")"
  }
  return returned_label 
}

const effectAlleleToLabel = (variantCode) => {
  var label_list = variantCode.split("-")
  return label_list[3]
}

const handleCheckboxChange = () => {

  chosen_variants.value = JSON.parse(JSON.stringify(
  variant_list.value
    .filter((variant) => 
      selectedStratifications.value.includes(variant.stratification.slice(1))
    )
    .map((variant) => ({
      ...variant,
      phenos: variant.phenos.filter((pheno) => selectedCategories.value.includes(pheno.category))
    }))
  ));

  refreshKey.value += 1;
}

const formattedVariantList = computed(() => {
    return variant_list.value.flatMap((v) => {
        return v.phenos
            .filter((pheno) => pheno.pval > 0)
            .map((pheno) => {
                // Extract stratification fields dynamically
                const stratFields = Object.fromEntries(
                    STRATIFICATION_CATEGORIES.map((key) => [key, pheno.stratification[key]])
                );

                return {
                    category: pheno.category,
                    phenostring: pheno.phenostring,
                    ...stratFields, // dynamic stratification values
                    pval: pheno.pval,
                    eaf: pheno.af,
                    beta_se: `${pheno.beta} (${pheno.sebeta})`,
                    num_samples: pheno.num_samples,
                    cases: pheno.num_cases,
                    controls: pheno.num_controls,
                };
            });
    });
});


const downloadTable = () => {
  const headers = [
    'Category',
    'Phenotype',
    ...STRATIFICATION_CATEGORIES.map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    'P-value',
    'Effect Size (se)',
    'Number of Samples'
  ];

  const escapeForCSV = (value) => {
    const str = String(value ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const csvContent = [
    headers.map(escapeForCSV).join(','),
    ...formattedVariantList.value.map(item =>
      [
        item.category,
        item.phenostring,
        ...STRATIFICATION_CATEGORIES.map(key => item[key]),
        item.pval,
        item.beta_se,
        item.num_samples
      ].map(escapeForCSV).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'variant_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

</script>



<style lang="scss" scoped>
.responsive-main {
  padding-top: 4cap;
}

@media (max-width: 600px) {
  .responsive-main {
    padding-top: 6cap;
  }
}

.arrow-container {
  float: left;
  margin-right: 10px;
  margin-bottom: 0px;
  padding-top:3px
}

.arrow-up, .arrow-down {
  display: block;
  padding: 3px;
  margin-left: 0px;
  margin-right: 0px;
}
.arrow-down {
  border: solid black;
  border-width: 0px 2px 2px 0px;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
}

.arrow-container:hover {
  cursor: pointer;
  background-color: grey;
}

.custom-checkbox {
  width: 20px;
  height: 20px; 
  cursor: pointer; 
}

.pheno-info {
  align-items:center;
}

.display-choice {
  position: relative;
  display: inline-block;
}

.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  z-index: 5;
}

.dropdown.dropdown-disabled:hover .dropdown-menu {
  display: none !important;
  pointer-events: none;
  visibility: hidden;
}

.dropdown.dropdown-disabled .btn-drop {
  background-color: #e0e0e0;
  color: #888;              
  cursor: not-allowed;
  opacity: 0.7;
}

.dropdown-menu-right {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  z-index: 1;
  text-align: right; 
  right: 0; 
}

.dropdown-menu label {
  display: block;
}

.dropdown-menu-right a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  font-weight:bold;
}

.dropdown:hover .dropdown-menu {
  display: block;
  z-index: 5;
} 

.dropdown:hover .dropdown-menu-right {
  display: block;
}

.dropdown-menu-right a:hover {
  background-color: #ddd;
}

.btn-drop:disabled {
  background-color: #ccc; 
  cursor: not-allowed; 
  opacity: 0.6; 
}

.btn-drop:disabled + .dropdown-menu {
  display: none !important;
  pointer-events: none;
  visibility: hidden;
}


.btn-drop:disabled:hover {
  background-color: #ccc; 
}

.btn-primary {
  color: black;
  background-color: lightgrey;
  border: lightgrey;
}

.btn-primary:hover {
  background-color: darkgrey !important;
  color: black;
}

.variant-link {
  display: inline-block;
  color: #1e88e5;
  text-decoration: none;
}

.variant-link:hover {
  text-decoration: underline;
}
</style>