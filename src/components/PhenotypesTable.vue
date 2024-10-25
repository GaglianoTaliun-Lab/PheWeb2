<template>
  <div class="text-left" style="width: 20%"> 
      <v-select
          v-model="selectedSex"
          :items="sexOptions"
          label="Sex Stratification"
          prepend-icon="mdi-gender-male-female"
          class="mb-4"
          variant="underlined"
          hint="Choose the stratification filter"
          persistent-hint
      ></v-select>
  </div>  
  <div class="text-right">
      <v-btn color="primary" @click="downloadCSV">Download CSV</v-btn>
  </div>
  <v-card elevation="5">

    <template v-slot:text>
      <v-text-field v-model="search" label="Try 'Diseases', 'Type 2 Diabetes', '12: 121779004 A/G', etc."
        prepend-inner-icon="mdi-magnify" variant="outlined" hide-details single-line></v-text-field>
    </template>

    <v-data-table 
      :items="filteredPhenotypes" 
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

      <template v-slot:item.pval="{ item }">
        <span style="white-space: nowrap;">
          {{ item.pval }}
        </span>
      </template>

      <template v-slot:header.num_samples="{ column, isSorted, getSortIcon, }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <v-tooltip text="# Control + # Cases" location="top">
            <template v-slot:activator="{ props }">
              <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
            </template>
          </v-tooltip>
          <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      <template v-slot:header.num_peaks="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <v-tooltip text="# peaks" location="top">
            <template v-slot:activator="{ props }">
              <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
            </template>
          </v-tooltip>
          <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      <template v-slot:header.nearest_genes="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <v-tooltip text="Head to external links" location="top">
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
          <v-tooltip 

            location="top">
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


      <template v-slot:item.rsids="{ item }">
        <a :href="`https://www.ncbi.nlm.nih.gov/snp/${item.rsids}`" target="_blank">{{ item.rsids }}</a>
      </template>
    </v-data-table>
  </v-card>

</template>

<script setup>
    import { ref, onMounted, computed } from 'vue';
    import axios from 'axios';

    const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
    

    // main table
    const headers = ref([
      { title: 'Category', key: 'category' },
      { title: 'Phenotype', key: 'phenostring' },
      { title: '#Samples', key: 'num_samples' },
      { title: '#Loci < 5e-8', key: 'num_peaks' },
      { title: 'P-value', key: 'pval' },
      { title: 'Top Variant', key: 'variantid' },
      { title: 'Nearest Genes', key: 'nearest_genes' },
      { title: 'Stratification',
        children: [
          { title: 'Sex', key: 'sex' }
        ]
      },
    ]);

    const phenotypes = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const search = ref('');

    // data
    const fetchSampleData = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      try {
        const response = await axios.get(`${api}/phenotypes`)
        console.log(response);
        phenotypes.value = response.data.map(item => ({
          ...item,
          variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
          variantName: item.rsids 
            ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
            : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
          ancestry: `${item.stratification.ancestry}`,
          sex: `${item.stratification.sex}`,
          num_controls: `${item.num_controls}`,
          num_num_cases: `${item.num_cases}`,
          nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [],  // Convert string to array
          category: item.category ? item.category.replace(/_/g, ' ') : ''
        }));
      } catch (error) {
        console.error("There was an error fetching the sample data:", error);
        errorMessage.value = "Failed to load data. Please try again later.";
      } finally {
        isLoading.value = false;
      }
      
    };

    // stratification filter
    const selectedSex = ref('All');
    const sexOptions = ref(['All', 'Combined', 'Male', 'Female']);

    const filteredPhenotypes = computed(() => {
      if (selectedSex.value === 'All') {
        return phenotypes.value;
      }
      return phenotypes.value.filter(item => item.sex === selectedSex.value);
    });


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
      link.download = 'phenotype_data.csv';
      link.click();
      URL.revokeObjectURL(url);
    };

    onMounted(() => {
      fetchSampleData();
    });

</script>




