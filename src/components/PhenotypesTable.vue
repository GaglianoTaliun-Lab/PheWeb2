<template>
    <v-card 
    elevation="5" 
    > 
        <template v-slot:text>
            <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            single-line
            ></v-text-field>
        </template>

        <v-data-table
          :items="phenotypes" 
          :headers="headers"
          :search="search"
          height="800"
          fixed-header
          :items-per-page="100"
          hover
        >   
        <template v-slot:item.phenocode="{ item }">
            <a :href="`/pheno/${item.phenocode}`" target="_blank">{{ item.phenocode }}</a>
        </template>
        </v-data-table>
    </v-card>

</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import axios from 'axios';

    const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URI

    const headers = ref([
      { title: 'Category', key: 'category' },
      { title: 'Phenotype', key: 'phenocode' },
      { title: '# Samples', key: 'num_samples' },
      { title: 'Nearest Genes', key: 'nearest_genes' },
      { title: 'P-value', key: 'pval' },
      { title: 'Chromosome', key: 'chrom' },
      { title: 'Position', key: 'pos' },
      { title: '# Loci < 5e-8', key: 'num_peaks' },
      { title: 'Top Variant', key: 'rsids' },
      { title: '# Peaks', key: 'num_peaks'},
      { title: 'Stratification', key: 'stratification'}
    ]);

    const phenotypes = ref([]);

    const search = ref('');

    const fetchSampleData = async () => {
      try {
        // const response = await axios.get('../../test_data/phenotypes.json');
        const response = await axios.get(`${api}/phenotypes`)
        phenotypes.value = response.data;
      } catch (error) {
        console.error("There was an error fetching the sample data:", error);
      }
      
    };

    onMounted(() => {
      fetchSampleData();
    });

</script>

