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
        <template v-slot:item.phenostring="{ item }">
            <a :href="`/phenotypes/${item.phenostring}`" target="_blank">{{ item.phenostring }}</a>
        </template>
        </v-data-table>
    </v-card>

</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import axios from 'axios';

    const headers = ref([
      { title: 'Category', key: 'category' },
      { title: 'Phenotype', value: 'phenostring' },
      { title: '# Samples', value: 'num_samples' },
      { title: 'Nearest Genes', value: 'nearest_genes' },
      { title: 'P-value', value: 'pval' },
      { title: 'Chromosome', value: 'chrom' },
      { title: 'Position', value: 'pos' },
      { title: '# Loci < 5e-8', value: 'num_peaks' },
      { title: 'Top Variant', value: 'rsids' }
    ]);

    const phenotypes = ref([]);

    const search = ref('');

    const fetchSampleData = async () => {
      try {
        const response = await axios.get('../../test_data/phenotypes.json');
        phenotypes.value = response.data;
      } catch (error) {
        console.error("There was an error fetching the sample data:", error);
      }
      
    };

    onMounted(() => {
      fetchSampleData();
    });

</script>

