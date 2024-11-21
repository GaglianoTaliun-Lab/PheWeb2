<template>
  <v-app>
    <Navbar2 />
    <v-main>
      <h2 style="font-weight: bold;">{{ geneName }}</h2>
      
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
        <a 
          :href="geneCardsUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="gene-link"
        >
          GeneCards
        </a>
      </div>

      <!-- Gene table component -->
      <div>
        <TableGene 
          :geneName="geneName"
          :phenocode="phenocode"
        />
      </div>
    </v-main>
  </v-app>
</template>

<script setup name="Gene">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar2 from '../../components/Navbar2.vue';
import TableGene from '../../components/TableGene.vue';

const route = useRoute();
const geneName = route.params.gene;
console.log(geneName);
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;
const phenocode = computed(() => route.params.phenocode);

// Define URLs for external resources based on geneName
const ncbiGeneUrl = computed(() => `https://www.ncbi.nlm.nih.gov/gene/?term=${geneName}`);
const ensemblGeneUrl = computed(() => `https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${geneName}`);
const opentargetGeneUrl = computed(() => `https://platform.opentargets.org/search?q=${geneName}&page=1`);
const geneCardsUrl = computed(() => `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${geneName}`);


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
