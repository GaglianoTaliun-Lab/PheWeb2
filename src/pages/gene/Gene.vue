<template>
  <v-app>
    <Navbar2 />
    <v-main>      
      <div v-if="geneChrom && geneStart && geneStop">
        <h2 style="font-weight: bold;"><i>{{ geneName }}</i> ({{ geneChrom }}:{{ geneStart }}-{{ geneStop }})</h2>
      </div>
      <div v-else>
        <h2 style="font-weight: bold;"><i>{{ geneName }}</i></h2>
      </div>
      <!-- External links for the gene -->
      <div class="gene-links">
        <a 
          :href="ncbiGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          NCBI
        </a>
        <a 
          :href="ensemblGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          Ensembl
        </a>
        <a 
          :href="opentargetGeneUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          Open Targets
        </a>
      </div>

      <!-- Gene table component -->
      <div v-if="geneData">
        <TableGene 
          :geneName="geneName"
          :data="geneData"
        />
      </div>
      <div class="pt-5 pb-5" v-if="plottingData && geneChrom && geneStart && geneStop">
        <RegionPlot :data="plottingData" :region="region"></RegionPlot>
      </div>
    </v-main>
  </v-app>
</template>

<script setup name="Gene">
import { ref, computed } from 'vue';
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
const geneData = ref(null)
const plottingData = ref(null)

const geneChrom = ref(null);
const geneStart = ref(null);
const geneStop = ref(null);
const region = ref(null);

// Define URLs for external resources based on geneName
const ncbiGeneUrl = computed(() => `https://www.ncbi.nlm.nih.gov/gene/?term=${geneName}`);
const ensemblGeneUrl = computed(() => `https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${geneName}`);
const opentargetGeneUrl = computed(() => `https://platform.opentargets.org/search?q=${geneName}&page=1`);

onMounted(async () => {

  try {
    const gene_response = await axios.get(`${api}/gene/${geneName}`);

    geneData.value = gene_response.data.data

    // copy as to not override geneData when deleting stratification
    plottingData.value = JSON.parse(JSON.stringify(geneData.value));

    plottingData.value.forEach((pheno) => {
      delete pheno.stratification
    })

    console.log(plottingData)

    const genpos_response = await axios.get(`${api}/gene/gene_position/${geneName}`)

    geneChrom.value = genpos_response.data[0]
    geneStart.value = genpos_response.data[1]
    geneStop.value = genpos_response.data[2]

    region.value = geneChrom.value.toString() + ":" + geneStart.value.toString() + "-" + geneStop.value.toString()

  } catch (error) {
    console.log(error)
  }
})

</script>

<style>
.gene-links {
  margin-bottom: 16px;
}

.gene-link {
  display: inline-block;
  margin-right: 12px;
  color: #1e88e5;
  text-decoration: none;
}

.gene-link:hover {
  text-decoration: underline;
}
</style>
