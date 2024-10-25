<template>
    <div class="text-right">
        <v-btn color="primary" @click="downloadCSV">Download CSV</v-btn>
    </div>
    <v-card elevation="5">
  
      <template v-slot:text>
        <v-text-field v-model="search" label="Try 'Diseases', 'Type 2 Diabetes', '12-121779004-A-G', etc."
          prepend-inner-icon="mdi-magnify" variant="outlined" hide-details single-line></v-text-field>
      </template>
  
      <v-data-table 
        :items="phenotypes" 
        :headers="headers" 
        :search="search" 
        height=700 
        fixed-header 
        :items-per-page="100"
        hover>
  
        <template v-slot:item.phenostring="{ item }">
          <router-link :to="`/pheno/${item.phenocode}`">{{ item.phenostring }}</router-link>
        </template>
        <template v-slot:item.variantid="{ item }">
          <router-link :to="`/variant/${item.variantid}`" style="white-space: nowrap;">{{ item.variantName }}</router-link>
        </template>
  
        <template v-slot:item.nearest_genes="{ item }">
          <span v-for="(gene, index) in item.nearest_genes" :key="index">
            <a :href="`https://www.ncbi.nlm.nih.gov/gene/?term=${gene.trim()}`" target="_blank">
              <span style="font-style: italic;">{{ gene.trim() }}</span> <!-- Italic style applied -->
            </a>
            <span v-if="index < item.nearest_genes.length - 1">, </span>
          </span>
        </template>
  
        <template v-slot:item.num_samples="{ item }">
          <span>
            {{
              item.num_controls !== "" && item.num_cases !== ""
                ? `${item.num_controls} + ${item.num_cases}`
                : item.num_samples
            }}
          </span>
        </template>
  
        <template v-slot:header.num_samples="{ column }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip text="# Control + # Cases" location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
            </v-tooltip>
          </div>
        </template>
  
        <template v-slot:header.num_peaks="{ column }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip text="#peaks" location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
            </v-tooltip>
          </div>
        </template>
  
        <template v-slot:header.nearest_genes="{ column }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip text="Head to external links" location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
            </v-tooltip>
          </div>
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
        // { title: 'Phenotype', key: 'phenostring' },
        { title: 'Phenotype', key: 'phenocode' },
        { title: 'Top Variant', key: 'variantid' },
        { title: 'P-value', key: 'pval' },
        { title: 'MAF', key: 'maf'},
        { title: 'Nearest Gene(s)', key: 'nearest_genes' },
      ]);
  
      const phenotypes = ref([]);
      const isLoading = ref(false);
      const errorMessage = ref('');
  
      const search = ref('');
  
      const fetchSampleData = async () => {
        isLoading.value = true;
        errorMessage.value = '';
        try {
          const response = await axios.get(`${api}/tophits`)
          console.log(response);
          phenotypes.value = response.data.map(item => ({
            ...item,
            category: item.category ? item.category.replace(/_/g, ' ') : '',
            variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
            variantName: `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`,
            // ancestry: `${item.stratification.ancestry}`,
            // sex: `${item.stratification.sex}`,
            maf: `${Number(item.af).toFixed(4)}`,
            num_controls: `${item.num_controls}`,
            num_num_cases: `${item.num_cases}`,
            nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [],  // Convert string to array
            
          }));
        } catch (error) {
          console.error("There was an error fetching the sample data:", error);
          errorMessage.value = "Failed to load data. Please try again later.";
        } finally {
          isLoading.value = false;
        }
        
      };
  
      const coverToCSV = (data) => {
        if (!data || data.length === 0) return '';
  
        const keys = Object.keys(data[0]);
        const rows = [];
  
        rows.push(keys.join(','));
  
        data.forEach((item) => {
          const values = keys.map((key) => item[key]);
          rows.push(values.join(','));
        });
  
        return rows.join('\n');
      };
  
      const downloadCSV = () => {
        const csvContent = coverToCSV(phenotypes.value);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tophits_data.csv';
        link.click();
        URL.revokeObjectURL(url);
      };
  
      onMounted(() => {
        fetchSampleData();
      });
  
  </script>
  
  
  
  
  