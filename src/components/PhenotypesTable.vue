<template>
  <v-card elevation="5">
    <template v-slot:text>
      <v-text-field v-model="search" label="Try 'Diseases', 'Type 2 Diabetes', '12-121779004-A-G', etc."
        prepend-inner-icon="mdi-magnify" variant="outlined" hide-details single-line></v-text-field>
    </template>

    <v-data-table :items="phenotypes" :headers="headers" :search="search" height=700 fixed-header :items-per-page="100"
      hover>
      <template v-slot:item.phenostring="{ item }">
        <router-link :to="`/pheno/${item.phenocode}`">{{ item.phenostring }}</router-link>
      </template>
      <template v-slot:item.variantid="{ item }">
        <router-link :to="`/variant/${item.variantid}`">{{ item.variantid }}</router-link>
      </template>

      <template v-slot:item.nearest_genes="{ item }">
        <span v-for="(gene, index) in item.nearest_genes" :key="index">
          <a :href="`https://www.ncbi.nlm.nih.gov/gene/?term=${gene.trim()}`" target="_blank">
            <span style="font-style: italic;">{{ gene.trim() }}</span> <!-- Italic style applied -->
          </a>
          <span v-if="index < item.nearest_genes.length - 1">, </span>
        </span>
      </template>

      <template v-slot:item.rsids="{ item }">
        <a :href="`https://www.ncbi.nlm.nih.gov/snp/${item.rsids}`" target="_blank">{{ item.rsids }}</a>
      </template>
    </v-data-table>
  </v-card>

</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import axios from 'axios';

    const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

    const headers = ref([
      { title: 'Category', key: 'category' },
      { title: 'Phenotype', key: 'phenostring' },
      { title: '#Samples', key: 'num_samples' },
      { title: '#Loci < 5e-8', key: 'num_peaks' },
      { title: 'P-value', key: 'pval' },
      { title: 'Top Variant', key: 'variantid' },
      // { title: 'Top Variant rsid', key: 'rsids' },
      // { title: 'Chromosome', key: 'chrom' },
      // { title: 'Position', key: 'pos' },
      { title: '#Peaks', key: 'num_peaks'},
      { title: 'Nearest Genes', key: 'nearest_genes' },
      { title: 'Stratification',
        children: [
          { title: 'Ancestry', key:'ancestry' },
          { title: 'Sex', key: 'sex' },
        ]
      }
    ]);

    const phenotypes = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const search = ref('');

    const fetchSampleData = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      try {
        // const response = await axios.get('../../test_data/phenotypes.json');
        const response = await axios.get(`${api}/phenotypes`)
        // console.log(response);
        phenotypes.value = response.data.map(item => ({
          ...item,
          variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
          variantName: `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`,
          ancestry: `${item.stratification.ancestry}`,
          sex: `${item.stratification.sex}`,
          nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : []  // Convert string to array
        }));
      } catch (error) {
        console.error("There was an error fetching the sample data:", error);
        errorMessage.value = "Failed to load data. Please try again later.";
      } finally {
        isLoading.value = false;
      }
      
    };

    onMounted(() => {
      fetchSampleData();
    });

</script>




