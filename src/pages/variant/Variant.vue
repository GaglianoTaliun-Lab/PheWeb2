<script setup name="Variant">
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  import {maf_range} from './Variant.js';
 
  import Navbar2 from '../../components/Navbar2.vue';
  import PhewasPlot from '../../components/PhewasPlot.vue';

  // TODO: remove this eventually, should be global or only 38 allowed, or something.
  var HG_BUILD_NUMBER = "38";

  const route = useRoute();

  const variantCode = route.params.variant_id;
  const stratification_list = ref(null)
  const variantList = ref([]); // TODO: fix this (self-made) mess... why are there two variantLists??
  const maf_text = ref(null);
  const variant = ref(null);
  const rsids = ref(null);
  const variant_list = ref([]);
  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;

  onMounted(async () => {
    try {
      const response = await axios.get(`${api}/variant/stratification_list`)

      stratification_list.value = JSON.parse(JSON.stringify(response.data));

      console.log(stratification_list.value)

      // we need to map here to get rid of the proxy
      variantList.value = await fetchPhewasPlottingData(stratification_list.value.map(stratification => stratification))

      maf_text.value = maf_range(variantList.value); // TODO only taking the first one here, should be some kind of combination of all stratifications
      variant.value = variantList.value[0];
      rsids.value = variant.value.rsids ? variant.value.rsids.split(',') : [];
    }
    catch (error) {
      console.log(error);
    }
  });
  
  async function fetchPhewasPlottingData(stratification_list){
    var temp_variant_list = []
    for (var stratification of stratification_list){
      var result;
      try {
          const response = await axios.get(`${api}/variant/${variantCode}/${stratification}`)
          result = response.data
          
          result.stratification = "." + stratification.toLowerCase();
          temp_variant_list.push(result)

          console.log(result)
      } catch (error) {
        console.log(`Error fetching plotting data with stratification ${stratification}:`, error);
      }
    }
    variant_list.value = temp_variant_list;
    return(variant_list.value)
  }
  
</script>

<template>
  <v-app>
    <Navbar2 />
    <v-main>
      <div class="ml-4 mt-2">
        <h1 class="mb-0">{{variantCode}}</h1>
        <!-- why does variant_list here work but not variantList ???-->
        <div v-if="variant">
          <p class="mb-0"> Nearest genes: {{variant.nearest_genes}}</p>
          <p class="mb-0"> {{maf_text}} </p>
          <p class="mb-0">
            View on
            <a :href="`http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg${HG_BUILD_NUMBER}&highlight=hg${HG_BUILD_NUMBER}.chr${variant.chrom}%3A${variant.pos}-${variant.pos}&position=chr${variant.chrom}%3A${variant.pos - 200000}-${variant.pos + 200000}`"
              target="_blank" rel="noopener noreferrer">UCSC</a>,
            <a :href="`https://www.ncbi.nlm.nih.gov/snp/?term=${variant.chrom}%5BChromosome%5D+AND+${variant.pos}%5BCHRPOS%5D`"
              target="_blank" rel="noopener noreferrer">dbSNP</a>,
            <a :href="`https://useast.ensembl.org/Homo_sapiens/Location/Variant/Table?r=${variant.chrom}:${variant.pos}-${variant.pos}`"
              target="_blank" rel="noopener noreferrer">Ensembl</a>,
            <a :href="`https://genetics.opentargets.org/Variant/${variant.chrom}_${variant.pos}_${variant.ref}_${variant.alt}/associations`"
              target="_blank" rel="noopener noreferrer">Open Targets Genetics</a>,
            <a :href="`https://gnomad.broadinstitute.org/variant/${variant.chrom}-${variant.pos}-${variant.ref}-${variant.alt}?dataset=gnomad_r4`"
              target="_blank" rel="noopener noreferrer">gnomAD</a>

            <template v-if="rsids.length === 1">
              , <a :href="`https://www.ebi.ac.uk/gwas/search?query=${rsids[0]}`">GWAS Catalog</a>
              , <a
                :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsids[0]}`">dbSNP</a>
            </template>

            <template v-else>
              <span v-for="rsid in rsids" :key="rsid">
                , <a :href="`https://www.ebi.ac.uk/gwas/search?query=${rsid}`">GWAS Catalog for {{ rsid }}</a>
                , <a
                  :href="`http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsid}`">dbSNP
                  for {{ rsid }}</a>
              </span>
            </template>
            <span style="font-weight:bold" id="pubmed-link"></span>
            <span style="font-weight:bold" id="clinvar-link"></span>
          </p>
        </div>
        <div v-if="variant_list.length > 0">
          <PhewasPlot :variantList="variant_list" />
        </div>
      </div>
    </v-main>
  </v-app>

</template>