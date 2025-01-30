<script setup name="Variant">
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import { maf_range } from './Variant.js';

import Navbar2 from '../../components/Navbar2.vue';
import PhewasPlot from '../../components/PhewasPlot.vue';

// TODO: remove this eventually, should be global or only 38 allowed, or something.
import { HG_BUILD_NUMBER, PRIORITY_STRATIFICATIONS } from "../../config.js";

const route = useRoute();

const variantCode = route.params.variant_id;
const stratification_list = ref(null);
const selectedStratifications = ref([])

const chosen_variants = ref([]);
const maf_text = ref(null);
const variant = ref(null);
const rsids = ref(null);
const variant_list = ref([]);
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;

const isLoading = ref(false);
const errorMessage = ref('');
const refreshKey = ref(0)


const headers = ref([
  { title: 'Category', key: 'category' },
  { title: 'Phenotype', key: 'phenostring' },
  { title: 'Sex', key: 'sex' },
  { title: 'Ancestry', key: 'ancestry' },
  { title: 'P-value', key: 'pval' },
  { title: 'Effect Size (se)', key: 'beta_se' },
  { title: 'Number of Samples', key: 'num_samples' },
]);

onMounted(async () => {
  try {
    const response = await axios.get(`${api}/variant/stratification_list`);

    stratification_list.value = JSON.parse(JSON.stringify(response.data));

    // we need to map here to get rid of the proxy
    await fetchPhewasPlottingData(
      stratification_list.value.map((stratification) => stratification)
    );

    console.log(stratification_list.value)

    maf_text.value = maf_range(variant_list.value); // TODO only taking the first one here, should be some kind of combination of all stratifications
    variant.value = variant_list.value[0];
    rsids.value = variant.value.rsids ? variant.value.rsids.split(',') : [];

    // set chosen variants to be male and female automatically
    selectedStratifications.value = PRIORITY_STRATIFICATIONS

    handleCheckboxChange();
  } catch (error) {
    console.log(error);
  }
});

async function fetchPhewasPlottingData(stratification_list) {
  var temp_variant_list = [];
  for (var stratification of stratification_list) {
    var result;
    try {
      const response = await axios.get(
        `${api}/variant/${variantCode}/${stratification}`
      );
      result = response.data;
      result.stratification = '.' + stratification;
      temp_variant_list.push(result);
    } catch (error) {
      console.log(
        `Error fetching plotting data with stratification ${stratification}:`,
        error
      );
    }
  }
  variant_list.value = temp_variant_list;

  console.log(variant_list.value)
  //console.log(variant_list.value)
  return variant_list.value;
}

const keyToLabel = (stratification) => {
  var label = stratification.split(".").join(", ")
  return label
}

const handleCheckboxChange = () => {
  console.log("checkbox change")
  console.log(selectedStratifications.value)
  console.log(variant_list.value)

  chosen_variants.value = JSON.parse(JSON.stringify(
  variant_list.value.filter((variant) => 
    selectedStratifications.value.includes(variant.stratification.slice(1)) // remove first period
  )
));


  console.log(chosen_variants.value)

  refreshKey.value += 1;
}

const formattedVariantList = computed(() =>
  variant_list.value.flatMap((v) =>
    v.phenos.map((pheno) => ({
      category: pheno.category,
      phenostring: pheno.phenostring,
      sex: pheno.stratification.sex,
      ancestry: pheno.stratification.ancestry,
      pval: pheno.pval,
      beta_se: `${pheno.beta} (${pheno.sebeta})`,
      num_samples: pheno.num_samples,
    }))
  )
);

</script>

<template>
  <v-app>
    <Navbar2 />
    <v-main>
      <div class="ml-4 mt-2">
        <h1 class="mb-0">{{ variantCode }}</h1>
        <!-- why does variant_list here work but not variantList ???-->
        <div v-if="variant">
          <p class="mb-0"> Nearest genes: {{ variant.nearest_genes }}</p>
          <p class="mb-0"> {{ maf_text }} </p>
          <p class="mb-0">
            View on
            <a
              :href="`http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg${HG_BUILD_NUMBER}&highlight=hg${HG_BUILD_NUMBER}.chr${variant.chrom}%3A${variant.pos}-${variant.pos}&position=chr${variant.chrom}%3A${variant.pos - 200000}-${variant.pos + 200000}`"
              target="_blank"
              rel="noopener noreferrer"
              >UCSC</a
            >,
            <a
              :href="`https://www.ncbi.nlm.nih.gov/snp/?term=${variant.chrom}%5BChromosome%5D+AND+${variant.pos}%5BCHRPOS%5D`"
              target="_blank"
              rel="noopener noreferrer"
              >dbSNP</a
            >,
            <a
              :href="`https://useast.ensembl.org/Homo_sapiens/Location/Variant/Table?r=${variant.chrom}:${variant.pos}-${variant.pos}`"
              target="_blank"
              rel="noopener noreferrer"
              >Ensembl</a
            >,
            <a
              :href="`https://genetics.opentargets.org/Variant/${variant.chrom}_${variant.pos}_${variant.ref}_${variant.alt}/associations`"
              target="_blank"
              rel="noopener noreferrer"
              >Open Targets Genetics</a
            >,
            <a
              :href="`https://gnomad.broadinstitute.org/variant/${variant.chrom}-${variant.pos}-${variant.ref}-${variant.alt}?dataset=gnomad_r4`"
              target="_blank"
              rel="noopener noreferrer"
              >gnomAD</a
            >

            <template v-if="rsids.length === 1">
              , <a :href="`https://www.ebi.ac.uk/gwas/search?query=${rsids[0]}`"
                >GWAS Catalog</a
              >,
              <a
                :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsids[0]}`"
                >dbSNP</a
              >
            </template>

            <template v-else>
              <span v-for="rsid in rsids" :key="rsid">
                , <a :href="`https://www.ebi.ac.uk/gwas/search?query=${rsid}`"
                  >GWAS Catalog for {{ rsid }}</a
                >,
                <a
                  :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsid}`"
                  >dbSNP for {{ rsid }}</a
                >
              </span>
            </template>
            <span style="font-weight: bold" id="pubmed-link"></span>
            <span style="font-weight: bold" id="clinvar-link"></span>
          </p>
        </div>
        

        <!-- buttons go here ... -->
        <div>
          <div class="pheno-info col-12 mt-0">
            <div v-if="stratification_list && stratification_list.length > 0" class="dropdown pt-4" id="dropdown-data1">
                <button class="btn btn-primary btn-drop" id="button-data1"> Choose Displayed Stratifications <span class="arrow-container"><span class="arrow-down"></span></span></button>
                <div class="dropdown-menu" id="dropdown-content-data1">
                    <label v-for="(stratification, index) in stratification_list">
                        <input 
                        type="checkbox" 
                        :value="stratification" 
                        :name="stratification" 
                        v-model="selectedStratifications"
                        @change="handleCheckboxChange">
                        {{ keyToLabel(stratification) }} 
                    </label> 
                </div>
              </div>
            </div>
        </div> 


        <div v-if="chosen_variants.length > 0">
          <PhewasPlot :key="refreshKey" :variantList="chosen_variants" />
        </div>

        <!-- Updated Table -->
        <div v-if="formattedVariantList.length > 0" class="mt-4">
          <v-card elevation="5">
            <v-data-table
              :items="formattedVariantList"
              :headers="headers"
              height="700"
              fixed-header
              :items-per-page="100"
              :loading="isLoading"
              hover
            >
              <template v-slot:item.phenostring="{ item }">
                <router-link :to="`/phenotypes/${item.phenocode}`">{{ item.phenostring }}</router-link>
              </template>

              <template v-slot:item.pval="{ item }">
                <span style="white-space: nowrap;">{{ item.pval }}</span>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>

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

.btn-primary {
  color: black;
  background-color: lightgrey;
  border: lightgrey;
}

.btn-primary:hover {
  background-color: darkgrey !important;
  color: black;
}
</style>