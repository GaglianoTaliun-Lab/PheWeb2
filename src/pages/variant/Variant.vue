<script setup name="Variant">
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import { maf_range } from './Variant.js';

import Navbar2 from '../../components/Navbar2.vue';
import PhewasPlot from '../../components/PhewasPlot.vue';

// TODO: remove this eventually, should be global or only 38 allowed, or something.
var HG_BUILD_NUMBER = "38";

const route = useRoute();

const variantCode = route.params.variant_id;
const stratification_list = ref(null);
const variantList = ref([]); // TODO: fix this (self-made) mess... why are there two variantLists??
const maf_text = ref(null);
const variant = ref(null);
const rsids = ref(null);
const variant_list = ref([]);
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;

const isLoading = ref(false);
const errorMessage = ref('');
const search = ref('');

const totalCodes = computed(() => formattedVariantList.value.length);
const matchingCodes = computed(() => {
  if (!search.value) return totalCodes.value;
  return formattedVariantList.value.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.value.toLowerCase())
    )
  ).length;
});


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
    variantList.value = await fetchPhewasPlottingData(
      stratification_list.value.map((stratification) => stratification)
    );

    maf_text.value = maf_range(variantList.value); // TODO only taking the first one here, should be some kind of combination of all stratifications
    variant.value = variantList.value[0];
    rsids.value = variant.value.rsids ? variant.value.rsids.split(',') : [];
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false; // Stop loading
  }
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
  isLoading.value = false; // Stop loading
  //console.log(variant_list.value)
  return variant_list.value;
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
      <!-- Loading Bar -->
    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      height="5"
    ></v-progress-linear>


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
        <div v-if="variant_list.length > 0">
          <PhewasPlot :variantList="variant_list" />
        </div>

<!-- Updated Table -->
<div v-if="formattedVariantList.length > 0" class="mt-4">
  <v-card elevation="5">
  <!-- 🔍 Search & Row Count Indicator -->
  <div class="d-flex justify-space-between align-center px-4 mt-2">
    <v-text-field
      v-model="search"
      label="Search... 'diabetes', 'laboratory'"
      variant="outlined"
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mr-4"
      style="max-width: 50%;"
    ></v-text-field>

    <!-- Row Count Indicator -->
  <span
    class="px-2 py-1 rounded font-weight-bold text-white"
    style="background-color: #337bb7;"
  >
    {{ search ? `${matchingCodes} matching codes` : `${totalCodes} total codes` }}
  </span>
</div>

            
            <!-- Updated Table with Search -->
            <v-data-table
              v-model:search="search"
              :items="formattedVariantList"
              :headers="headers"
              height="700"
              fixed-header
              :items-per-page="100"
              :loading="isLoading"
              hover
              :sort-by="[{ key: 'pval', order: 'asc' }]" 
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