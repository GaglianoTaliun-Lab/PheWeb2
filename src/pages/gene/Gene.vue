<template>
  <v-app>
    <Navbar /> 
    <v-main class="responsive-main"> 
      <div v-if="geneChrom && geneStart && geneStop">
        <h2 style="font-weight: bold;"><i>{{ geneName }}</i> ({{ geneChrom }}:{{ geneStart }}-{{ geneStop }})</h2>
      </div>
      <div v-else>
        <h2 style="font-weight: bold;"><i>{{ geneName }}</i></h2>
      </div>
      <!-- External links for the gene -->
      <div class="gene-links d-none d-md-flex">
        View on: 
        <a 
          :href="ncbiGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          <span class="d-flex align-center">
            NCBI
            <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
          </span>
        </a>,
        <a 
          :href="ensemblGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          <span class="d-flex align-center">
            Ensembl
            <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
          </span>
        </a>,
        <a 
          :href="opentargetGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          <span class="d-flex align-center">
            Open Targets
            <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
          </span>
        </a>,
        <a 
          :href="geneCardsUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          <span class="d-flex align-center">
            GeneCards
            <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
          </span>
        </a>,
        <a 
          :href="gwasCatalogUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          <span class="d-flex align-center">
            GWAS Catalog
            <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
          </span>
        </a>,
        <a 
          :href="gnomadUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          <span class="d-flex align-center">
            gnomAD v4
            <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
          </span>
        </a>, 
        <a 
          :href="gtExUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          <span class="d-flex align-center">
            GTEx  
            <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
          </span>
        </a>
        <!-- <a 
          :href="ukbTopmedUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          UKB-TOPMed (UMich)
        </a> -->
      </div>
      <!-- Mobile external links menu -->
      <div class="gene-links d-flex d-md-none justify-left align-center">
        <span>View on</span>
        <v-btn icon="mdi-link-variant" variant="plain" @click="drawer = true"></v-btn>

        <v-navigation-drawer
          v-model="drawer"
          location="right"
          floating
        >
          <v-list>
            <v-list-item>
              <v-list-item-title>
                <a :href="ncbiGeneUrl" target="_blank" rel="noopener noreferrer">
                  <span class="d-flex align-center">
                    NCBI
                    <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                  </span>
                </a>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <a :href="ensemblGeneUrl" target="_blank" rel="noopener noreferrer">
                  <span class="d-flex align-center">
                    Ensembl
                    <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                  </span>
                </a>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <a :href="opentargetGeneUrl" target="_blank" rel="noopener noreferrer">
                  <span class="d-flex align-center">
                    Open Targets
                    <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                  </span>
                </a>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <a :href="geneCardsUrl" target="_blank" rel="noopener noreferrer">
                  <span class="d-flex align-center">
                    GeneCards
                    <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                  </span>
                </a>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <a :href="gwasCatalogUrl" target="_blank" rel="noopener noreferrer">
                  <span class="d-flex align-center">
                    GWAS Catalog
                    <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                  </span>
                </a>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <a :href="gnomadUrl" target="_blank" rel="noopener noreferrer">
                  <span class="d-flex align-center">
                    gnomAD v4
                    <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                  </span>
                </a>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <a :href="gtExUrl" target="_blank" rel="noopener noreferrer">
                  <span class="d-flex align-center">
                    GTEx
                    <v-icon class="ml-0" size="17">mdi-open-in-new</v-icon>
                  </span>
                </a>
              </v-list-item-title>
            </v-list-item>
            <!-- <v-list-item>
              <v-list-item-title>
                <a :href="ukbTopmedUrl" target="_blank" rel="noopener noreferrer">UKB-TOPMed (UMich)</a>
              </v-list-item-title>
            </v-list-item> -->
          </v-list>
        </v-navigation-drawer>
      </div>


      <!-- Gene table component -->
      <div>
        <TableGene 
          :geneName="geneName"
          :data="geneData"
          :isLoading="isLoading"
          @updateChosenPheno="updateChosenPhenoMethod"
        />
      </div>
      <!-- <v-card elevation="5" class="pa-2" v-if="displayPlot">
        <div class="pt-2" v-if="plottingData && geneChrom && geneStart && geneStop">
          <RegionPlot :data="plottingData" :region="region"></RegionPlot>
        </div>
      </v-card> -->
      <!-- <v-card elevation="5" class="pa-2" v-if="displayPlot">
        <div class="pt-2" v-if="plottingData && geneChrom && geneStart && geneStop">
          <LZ :data="plottingData" :region="region"></LZ>
        </div>
      </v-card> -->
      <IsLoading v-if="isLoading" :loadingText="loadingText" />
      <IsFailing v-if="isFailed" :isLoading="isLoading" :isFailed="isFailed" />
      <v-card v-if="!isLoading && displayPlot" elevation="5" class="pa-2 mt-2">
        <div class="pt-2" v-if="plottingData && geneChrom && geneStart && geneStop">
          <LZ2 :data="plottingData" :region="region"></LZ2>
        </div>
      </v-card>
      <v-card v-if="!isLoading && !displayPlot" elevation="5" class="pa-2 mt-2 text-center">
        <span>No data selected to display LZ plot, please select a phenotype in the table above.</span>
      </v-card>

    </v-main>
  </v-app>
</template>

<script setup name="Gene">
import { ref, computed, watch} from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import TableGene from '../../components/TableGene.vue';
import IsLoading from '../../components/IsLoading.vue';
import IsFailing from '../../components/IsFailing.vue';

import RegionPlot from '../../components/LocusZoomRegion.vue';
import LZ from '../../components/LocusZoom.vue';
import LZ2 from '../../components/LocusZoom2.vue';
import { onMounted } from 'vue';
import axios from 'axios';

const drawer = ref(false);
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
const gnomadUrl = computed(() => `https://gnomad.broadinstitute.org/gene/${geneName}?dataset=gnomad_r4`);
const gtExUrl = computed(() => `https://www.gtexportal.org/home/gene/${geneName}`);
const ukbTopmedUrl = computed(() => `https://pheweb.org/UKB-TOPMed/gene/${geneName}`);
// const finngenUrl = computed(() => `https://r11.finngen.fi/gene/${geneName}`);

const chosenPheno = ref([]);
const currentChosenPheno = ref([]);
const newAddedPheno = ref([]);
const displayPlot = ref(true);
const updateChosenPhenoMethod = (pheno) => {
  // chosenPheno.value = pheno.value;
  chosenPheno.value = [...pheno.value];
  newAddedPheno.value = chosenPheno.value.filter(pheno => !currentChosenPheno.value.includes(pheno));
  currentChosenPheno.value = chosenPheno.value;
  // console.log(newAddedPheno.value)
  // console.log('Clicked pheno:', chosenPheno.value);
  // console.log(chosenPheno.value.length)
};
const isLoading = ref(false);
const loadingText = ref('Loading LZ Data... please wait');
const isFailed = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    const gene_response = await axios.get(`${api}/gene/${geneName}`);

    geneData.value = gene_response.data.data;
    // console.log(geneData.value)

    const genpos_response = await axios.get(`${api}/gene/${geneName}/gene_position`)

    geneChrom.value = genpos_response.data[0]
    geneStart.value = genpos_response.data[1]-100000
    geneStop.value = genpos_response.data[2]+100000

    region.value = geneChrom.value.toString() + ":" + geneStart.value.toString() + "-" + geneStop.value.toString()

  } catch (error) {
    console.log(error)
    isFailed.value = true;
  } finally {
    isLoading.value = false; // Stop loading
  }
}

// avoid sending multiple requests to the API
const updatePlotData = async () => {
  isLoading.value = true;
  if (!geneData.value) {
    displayPlot.value = false;
    plottingData.value = [];
    return;
  }

  // copy as to not override geneData when deleting stratification
  let tempData = JSON.parse(JSON.stringify(geneData.value));

  tempData.forEach((pheno) => {
    delete pheno.stratification
  })

  // console.log(chosenPheno.value.length)
  if (chosenPheno.value.length === 0) {
    displayPlot.value = false;
    if (tempData.length > 0) {
      const minPvalEntry = tempData.reduce((min, curr) => (curr.pval < min.pval ? curr : min), tempData[0]);
      plottingData.value = [minPvalEntry];
    } else {
      plottingData.value = [];
    }
  } else {
    displayPlot.value = true;
    // plottingData.value = tempData.filter((pheno) => pheno.phenocode === chosenPheno.value);
    plottingData.value = tempData.filter((pheno) => chosenPheno.value.includes(pheno.phenocode));
  }
  isLoading.value = false;
  // console.log(plottingData)
}

onMounted(async () => {
  await fetchData();
  updatePlotData();
});

watch(
  chosenPheno,
  (newPhenocode) => {
    updatePlotData();
  }
);

</script>

<style scoped>
.gene-links {
  margin-bottom: 0px;
}

.gene-link {
  display: inline-block;
  margin-left: 8px;
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
