<template>
  <v-app>
    <Navbar2 /> 
    <v-main class="responsive-main"> 
      <v-progress-linear
        v-if="isLoading"
        indeterminate
        color="primary"
        height="5"
      ></v-progress-linear>
      <div v-if="geneChrom && geneStart && geneStop">
        <h2 style="font-weight: bold;"><i>{{ geneName }}</i> ({{ geneChrom }}:{{ geneStart }}-{{ geneStop }})</h2>
      </div>
      <div v-else>
        <h2 style="font-weight: bold;"><i>{{ geneName }}</i></h2>
      </div>
      <!-- External links for the gene -->
      <div class="gene-links">
        View on
        <a 
          :href="ncbiGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          NCBI
        </a>,
        <a 
          :href="ensemblGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          Ensembl
        </a>,
        <a 
          :href="opentargetGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          Open Targets
        </a>,
        <a 
          :href="geneCardsUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          GeneCards
        </a>,
        <a 
          :href="gwasCatalogUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          GWAS Catalog
        </a>
      </div>

      <!-- Gene table component -->
      <div v-if="geneData">
        <TableGene 
          :geneName="geneName"
          :data="geneData"
          @updateChosenPheno="updateChosenPhenoMethod"
        />
      </div>
      <div class="pb-5" v-if="plottingData && geneChrom && geneStart && geneStop">
        <RegionPlot :data="plottingData" :region="region"></RegionPlot>
      </div>
    </v-main>
  </v-app>
</template>

<script setup name="Gene">
import { ref, computed, watch} from 'vue';
import { useRoute } from 'vue-router';
import Navbar2 from '../../components/Navbar2.vue';
import TableGene from '../../components/TableGene.vue';

import RegionPlot from '../../components/LocusZoomRegion.vue';
import { onMounted } from 'vue';
import axios from 'axios';


const route = useRoute();
const geneName = route.params.gene;
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;
const phenocode = computed(() => route.params.phenocode);
const geneData = ref(null);
const plottingData = ref(null);

const geneChrom = ref(null);
const geneStart = ref(null);
const geneStop = ref(null);
const region = ref(null);

// Define URLs for external resources based on geneName
const ncbiGeneUrl = computed(() => `https://www.ncbi.nlm.nih.gov/gene/?term=${geneName}`);
const ensemblGeneUrl = computed(() => `https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${geneName}`);
const opentargetGeneUrl = computed(() => `https://platform.opentargets.org/search?q=${geneName}&page=1`);
const geneCardsUrl = computed(() => `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${geneName}`);
const gwasCatalogUrl = computed(() => `https://www.ebi.ac.uk/gwas/genes/${geneName}`);

const chosenPheno = ref([]);
const updateChosenPhenoMethod = (pheno) => {
  // chosenPheno.value = pheno.value;
  chosenPheno.value = [...pheno.value];
  // console.log('Clicked pheno:', chosenPheno.value);
  // console.log(chosenPheno.value.length)
};
const isLoading = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    const gene_response = await axios.get(`${api}/gene/${geneName}`);

    geneData.value = gene_response.data.data;
    // console.log(geneData)

    // copy as to not override geneData when deleting stratification
    let tempData = JSON.parse(JSON.stringify(geneData.value));

    tempData.forEach((pheno) => {
      delete pheno.stratification
    })

    // console.log(chosenPheno.value.length)
    if (chosenPheno.value.length === 0) {
      if (tempData.length > 0) {
        const minPvalEntry = tempData.reduce((min, curr) => (curr.pval < min.pval ? curr : min), tempData[0]);
        plottingData.value = [minPvalEntry];
      } else {
        plottingData.value = [];
      }
    } else {
      // plottingData.value = tempData.filter((pheno) => pheno.phenocode === chosenPheno.value);
      plottingData.value = tempData.filter((pheno) => chosenPheno.value.includes(pheno.phenocode));
    }

    // console.log(plottingData)

    const genpos_response = await axios.get(`${api}/gene/${geneName}/gene_position`)

    geneChrom.value = genpos_response.data[0]
    geneStart.value = genpos_response.data[1]-100000
    geneStop.value = genpos_response.data[2]+100000

    region.value = geneChrom.value.toString() + ":" + geneStart.value.toString() + "-" + geneStop.value.toString()

  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false; // Stop loading
  }
}

onMounted( () => {
  fetchData();
});

watch(
  chosenPheno,
  (newPhenocode) => {
    fetchData();
  }
);

</script>

<style scoped>
.gene-links {
  margin-bottom: 0px;
}

.gene-link {
  display: inline-block;
  /* margin-right: 12px; */
  color: #1e88e5;
  text-decoration: none;
}

.gene-link:hover {
  text-decoration: underline;
}

.responsive-main {
  padding-top: 4cap;
}

@media (max-width: 600px) {
  .responsive-main {
    padding-top: 6cap;
  }
}
</style>
