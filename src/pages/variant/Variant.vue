<script setup name="Variant">
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  import {maf_range} from './Variant.js';
 
  import Navbar2 from '../../components/Navbar2.vue';
  import PhewasPlot from '../../components/PhewasPlot.vue';

  // TODO: remove this eventually, should be global
  var HG_BUILD_NUMBER = "38";

  const route = useRoute();

  const variantCode = route.params.variant_id;
  const info = ref(null);
  var maf_text = ref(null);
  var variant = ref(null);
  var rsids = ref(null);
  var variantList = ref(null);

  onMounted(async () => {
    try {
      const response = await axios.get("http://localhost:9099/variant/" + variantCode);
      info.value = response;
      variantList = info.val.data;

      maf_text = maf_range(info.value.data);
      variant = info.value.data[0];
      rsids = variant.rsids ? variant.rsids.split(',') : [];
    }
    catch (error) {
      console.log(error);
    }
  });

</script>

<template>
  <v-app>
    <Navbar2 />
    <v-main>
      <div  class="ml-4 mt-2">   
        <h1 class="mb-0">{{variantCode}}</h1>
        <div v-if="info">
          <p class="mb-0"> Nearest genes: {{variant.nearest_genes}}</p>
          <p class="mb-0"> {{maf_text}} </p>
          <p class="mb-0">
            View on
            <a :href="`http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg${HG_BUILD_NUMBER}&highlight=hg${HG_BUILD_NUMBER}.chr${variant.chrom}%3A${variant.pos}-${variant.pos}&position=chr${variant.chrom}%3A${variant.pos - 200000}-${variant.pos + 200000}`">UCSC</a>
            <template v-if="rsids.length === 1">
              , <a :href="`https://www.ebi.ac.uk/gwas/search?query=${rsids[0]}`">GWAS Catalog</a>
              , <a :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsids[0]}`">dbSNP</a>
            </template>
            <template v-else>
              <span v-for="rsid in rsids" :key="rsid">
                , <a :href="`https://www.ebi.ac.uk/gwas/search?query=${rsid}`">GWAS Catalog for {{ rsid }}</a>
                , <a :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsid}`">dbSNP for {{ rsid }}</a>
              </span>
            </template>
            <span style="font-weight:bold" id="pubmed-link"></span>
            <span style="font-weight:bold" id="clinvar-link"></span>
          </p>
        </div>
        <div v-if="variantList">
          <PhewasPlot :variantList=variantList />
        </div>
      </div>
      </v-main>
  </v-app>

</template>