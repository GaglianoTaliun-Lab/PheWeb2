<template>
  <h3>GWAS Table: </h3>
  <div class="text-left" style="width: 20%">
    <v-select v-model="selected" :items="options" label="Stratification" class="mb-4" variant="underlined"></v-select>
  </div>
  <!-- <div class="text-right">
        <v-btn color="primary" @click="downloadCSV">Download CSV</v-btn>
    </div> -->
  <v-card elevation="5">

    <template v-slot:text>
      <v-text-field v-model="search" label="TCF7L2', '12-121779004-A-G', etc." prepend-inner-icon="mdi-magnify"
        variant="outlined" hide-details single-line></v-text-field>
    </template>

    <v-data-table :items="variants" :headers="headers" :search="search" height=500 fixed-header :items-per-page="8"
      :sort-by="[{ key: 'pval', order: 'des' }]" hover>

      <template v-slot:item.variantid="{ item }">
        <router-link :to="`/variant/${item.variantid}`" style="white-space: nowrap;">{{ item.variantName
          }}</router-link>
      </template>

      <template v-slot:item.nearest_genes="{ item }">
        <span v-for="(gene, index) in item.nearest_genes" :key="index">
          <router-link :to="`/gene/${gene.trim()}?include=${item.chrom}-${item.pos}`"
            style="white-space: nowrap; font-style: italic;">
            {{ gene.trim() }}
          </router-link>
          <span v-if="index < item.nearest_genes.length - 1">, </span>
        </span>
      </template>

      <template v-slot:item.pval="{ item }">
        <span style="white-space: nowrap;">
          {{ item.pval }}
        </span>
      </template>

      <template v-slot:header.nearest_genes="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <v-tooltip text="Head to internal page" location="top">
            <template v-slot:activator="{ props }">
              <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
            </template>
          </v-tooltip>
          <template v-if="isSorted(column)">
            <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      <template v-slot:header.variantid="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
            </template>
            <span style="white-space: normal;">
              1) Chromosome <br>
              2) Position <br>
              3) Reference allele <br>
              4) Alternate allele <br>
              5) rsid (if applicable)
            </span>
          </v-tooltip>
          <template v-if="isSorted(column)">
            <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      <template v-slot:header.pval="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <template v-if="isSorted(column)">
            <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

    </v-data-table>
  </v-card>

</template>
  
  <script setup>
      import { ref, onMounted, watch, computed } from 'vue';
      import axios from 'axios';
      import { useRoute } from 'vue-router';
  
      const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
      const route = useRoute();
      const phenocode = route.params.phenocode;
  
      // main table
      const headers = ref([
        { title: 'Top Variant', key: 'variantid' },
        { title: 'Nearest Gene(s)', key: 'nearest_genes' },
        { title: 'MAF', key: 'af' },
        { title: 'P-value', key: 'pval' },
        { title: 'Effect Size (se)', key: 'effect_size' },
      ]);
  
      const variants = ref([]);
      const isLoading = ref(false);
      const errorMessage = ref('');
  
      const search = ref('');

      const selected = ref('European, Combined');

      const options = ref(['European, Combined', 'European, Male', 'European, Female']);

      const buildApiUrl = () => {
        const formattedSelected = selected.value.replace(', ', '.');
        return `${api}/phenotypes/${phenocode}.${formattedSelected}`;
      };
  
      // data
      const fetchSampleData = async () => {
        isLoading.value = true;
        errorMessage.value = '';
        try {
          const apiUrl = buildApiUrl();
          const response = await axios.get(apiUrl);
          console.log(apiUrl);
          console.log(response);
          variants.value = response.data.unbinned_variants.map(item => ({
            ...item,
            variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
            variantName: item.rsids 
              ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
              : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
            nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
            effect_size: `${item.beta} (${item.sebeta})`
          }));
        } catch (error) {
          console.error("There was an error fetching the sample data:", error);
          errorMessage.value = "Failed to load data. Please try again later.";
        } finally {
          isLoading.value = false;
        }
        
      };

      // download
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
        link.download = 'topLoci.csv';
        link.click();
        URL.revokeObjectURL(url);
      };
  
      onMounted(() => {
        fetchSampleData();
      });

      watch(selected, (newSelected) => {
        console.log(`Selected value changed to: ${newSelected}`);
        fetchSampleData();
      });
  
  </script>
  
  
  
  
  