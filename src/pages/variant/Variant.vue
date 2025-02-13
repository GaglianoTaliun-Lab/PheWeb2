<script setup name="Variant">
import DownloadButton from '../../components/DownloadButton.vue'; 
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import { maf_range } from './Variant.js';

import Navbar2 from '../../components/Navbar2.vue';
import PhewasPlot from '../../components/PhewasPlot.vue';
import VariantTable from '../../components/VariantTable.vue';

import { HG_BUILD_NUMBER, PRIORITY_STRATIFICATIONS } from "../../config.js";

const route = useRoute();

const variantCode = route.params.variant_id;
const stratification_list = ref(null);
const selectedStratifications = ref([])

const chosen_variants = ref([]);
const variant = ref(null);
const rsids = ref(null);
const variant_list = ref([]);
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;

const isLoading = ref(false);
const refreshKey = ref(0)


onMounted(async () => {
  try {
    const response = await axios.get(`${api}/variant/stratification_list`);

    stratification_list.value = JSON.parse(JSON.stringify(response.data));

    // we need to map here to get rid of the proxy
    await fetchPhewasPlottingData(
      stratification_list.value.map((stratification) => stratification)
    );

    console.log(stratification_list.value)

    //maf_text.value = maf_range(variant_list.value).replace(/\n/g, "<br>");
    variant.value = variant_list.value[0];
    rsids.value = variant.value.rsids ? variant.value.rsids.split(',') : [];

    // set chosen variants to be male and female automatically
    selectedStratifications.value = PRIORITY_STRATIFICATIONS

    handleCheckboxChange();
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false; // Stop loading
  }
});

const maf_text = computed(() => {
    return maf_range(chosen_variants.value).replace(/\n/g, "<br>");
});

async function fetchPhewasPlottingData(stratification_list) {
  isLoading.value = true; // Start loading
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
  isLoading.value = false; // Stop loading
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

</script>

<template>
  <v-app>
    <Navbar2 />
    <v-main>
      <!-- Loading Bar -->
    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      height="5"
    ></v-progress-linear>

    <!-- Add this div for the download button -->
    <div class="d-flex justify-end px-4 pt-2">
        <DownloadButton />
    </div>


      <div class="ml-4 mt-2">
        <h1 class="mb-0">{{ variantCode }}</h1>
        <!-- why does variant_list here work but not variantList ???-->
        <div v-if="variant">
          <p class="mb-0"> Nearest genes: <i>{{ variant.nearest_genes }}</i></p>
          <p class="mb-0" v-html="maf_text"></p>
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

        <VariantTable :key="refreshKey" :selectedStratifications="selectedStratifications" :variantList="variant_list"></VariantTable>

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