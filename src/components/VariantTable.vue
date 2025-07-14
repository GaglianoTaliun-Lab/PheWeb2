<template>
  <div v-if="formattedVariantList.length > 0" class="mt-1">
    <!-- Previous template code remains the same until the category search field -->

    <v-card elevation="5">
      <v-data-table 
        :items="filteredVariantList" 
        :headers="headers" 
        fixed-header 
        :items-per-page="10"
        hover 
        :sort-by="[{ key: 'pval', order: 'asc' }]"
        :search="search"
        :loading="isTableLoading"
      >
        <!-- Top slot remains the same -->

        <template v-slot:header.category="{ column }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-menu open-on-hover v-model="categoryMenu" :close-on-content-click="false" location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2"
                  :icon="filteredCategory === 'All' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"></v-icon>
              </template>
              <v-card class="pa-3">
                <v-text-field v-model="selectedCategory" label="Enter category" :hint="firstCategory"
                  style="width: 400px;" variant="outlined" density="compact" elevation="2" rounded
                  prepend-inner-icon="mdi-magnify" @keydown.enter="filterCategory"></v-text-field>
                <v-row justify="end">
                  <v-col cols="auto">
                    <v-btn @click="clearCategory" color="primary" class="mt-3" variant="outlined">
                      Clear
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn @click="filterCategory" color="primary" class="mt-3" variant="outlined">
                      Apply
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </div>
        </template>

        <template v-slot:header.phenostring="{ column }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-menu open-on-hover v-model="phenoMenu" :close-on-content-click="false" location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2"
                  :icon="filteredPheno === 'All' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"></v-icon>
              </template>
              <v-card class="pa-3">
                <v-text-field v-model="selectedPheno" label="Enter phenotype" :hint="firstPhenotype"
                  style="width: 400px;" variant="outlined" density="compact" elevation="2" rounded
                  prepend-inner-icon="mdi-magnify" @keydown.enter="filterPheno"></v-text-field>
                <v-row justify="end">
                  <v-col cols="auto">
                    <v-btn @click="clearPheno" color="primary" class="mt-3" variant="outlined">
                      Clear
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn @click="filterPheno" color="primary" class="mt-3" variant="outlined">
                      Apply
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </div>
        </template>

        <template v-slot:header.ancestry="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: left; justify-content: left; text-align: left;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                Genetic ancestries included in analysis
              </span>
            </v-tooltip>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.sex="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: left; justify-content: left; text-align: left;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                Sexes included in analysis
              </span>
            </v-tooltip>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.pval="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: left; justify-content: left; text-align: left;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                Most significant association P-value <br>
                <span>Green</span>: genome-wide significant (5×10<sup>-8</sup>) <br>
                <span>Grey</span>: not significant <br>
              </span>
            </v-tooltip>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

	      <template v-slot:header.num_samples="{ column, isSorted, getSortIcon, }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                Number of samples with non-missing data
              </span>
            </v-tooltip>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.eaf="{ column }">
          <div style="display: flex; align-items: start; justify-content: start; text-align: start;">
            <span style="white-space: nowrap;">{{ "EAF" }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                Effect allele frequency
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:header.beta_se="{ column }">
          <div style="display: flex; align-items: start; justify-content: start; text-align: start;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal; max-width: 200px; display: block; word-wrap: break-word;">
                Effect size (Standard Error)
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:item.phenostring="{ item }">
          <router-link :to="`/phenotypes/${item.phenocode}`">{{ item.phenostring }}</router-link>
        </template>

        <template v-slot:item.pval="{ item }">
          <v-chip v-if="item.pval !== 'NA'" :color="getColour(item.pval)">
            {{ formatScientific(item.pval) }}
          </v-chip>
          <span v-else>NA</span> 
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { STRATIFICATION_CATEGORIES } from '@/config.js'
  
//   // Add this function in your script setup
//   const downloadTable = () => {
//   // Convert all data to CSV format (using formattedVariantList instead of filteredVariantList)
//   const headers = [
//     'Category',
//     'Phenotype',
//     'Sex',
//     'Ancestry',
//     'P-value',
//     'Effect Size (se)',
//     'Number of Samples'
//   ];
  
//   const csvContent = [
//     headers.join(','),
//     ...formattedVariantList.value.map(item => [
//       item.category,
//       item.phenostring,
//       item.sex,
//       item.ancestry,
//       item.pval,
//       item.beta_se,
//       item.num_samples
//     ].join(','))
//   ].join('\n');

//   // Create and trigger download
//   const blob = new Blob([csvContent], { type: 'text/csv' });
//   const url = window.URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', 'variant_data.csv');
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   window.URL.revokeObjectURL(url);
// };  

  const props = defineProps({
    selectedStratifications: Object,
    variantList: Object,
    categoryList: Object,
    isTableLoading: Boolean,
  });
  
  // ... Previous header definitions and other refs remain the same ...
  const headers = ref([
    { 
      title: 'Category', 
      key: 'category',
      sortable: false 
    },
    { 
      title: 'Phenotype', 
      key: 'phenostring',
      sortable: false 
    },
    ...STRATIFICATION_CATEGORIES.map((cat) => ({
        title: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
        key: cat.toLowerCase(),                           
        sortable: false
    })),
    // { 
    //   title: 'Sex', 
    //   key: 'sex',
    //   sortable: false 
    // },
    // { 
    //   title: 'Ancestry', 
    //   key: 'ancestry',
    //   sortable: false 
    // },
    { 
      title: 'P-value', 
      key: 'pval',
      sortable: true
    },
    { title: 'EAF',
      key: 'eaf',
      sortable: false
    },
    { 
      title: 'Effect Size (SE)', 
      key: 'beta_se',
      sortable: false 
    },
    { 
      title: '#Samples', 
      key: 'num_samples',
      sortable: false 
    },
    //{ title: 'Number of Cases',
    //  key: 'cases',
    //  sortable: false
    //},
    //{ title: 'Number of Controls',
    //  key: 'controls',
    //  sortable: false
    //},
  ]);
  
  const categoryMenu = ref(false);
  const phenoMenu = ref(false);
  const selectedCategory = ref('');
  const selectedPheno = ref('');
  const filteredCategory = ref('All');
  const filteredPheno = ref('All');
  
  // Format variant list (same as before)
  const formattedVariantList = computed(() => {
    return props.variantList?.flatMap((v) => {
      if (!props.selectedStratifications.includes(v.stratification.slice(1))) return [];

      return v.phenos
        .filter((pheno) => props.categoryList.includes(pheno.category))
        .filter((pheno) => pheno.pval > 0)
        .map((pheno) => {
          const stratifications = Object.fromEntries(
            STRATIFICATION_CATEGORIES.map((cat) => [
              cat.toLowerCase(),
              pheno.stratification?.[cat.toLowerCase()]?.replace(/\b\w/g, l => l.toUpperCase()) || '',
            ])
          );

          return {
            category: pheno.category,
            phenostring: pheno.phenostring,
            phenocode: pheno.phenocode,
            ...stratifications,
            pval: pheno.pval,
            eaf: pheno.af,
            beta_se: pheno.beta > 0
                  ? `${pheno.beta} (${pheno.sebeta}) △`
                  : `${pheno.beta} (${pheno.sebeta}) ▽`,
            num_samples: pheno.num_samples,
            cases: pheno.num_cases,
            controls: pheno.num_controls,
          };
        });
    });
  });

  
  // New computed properties for dynamic hints
  const firstCategory = computed(() => {
    const firstItem = formattedVariantList.value[0];
    return firstItem ? `Try "${firstItem.category}"` : 'Enter category';
  });
  
  const firstPhenotype = computed(() => {
    const firstItem = formattedVariantList.value[0];
    return firstItem ? `Try "${firstItem.phenostring}"` : 'Enter phenotype';
  });
  
  // Filter functions remain the same
  const filterCategory = () => {
    filteredCategory.value = selectedCategory.value;
    categoryMenu.value = false;
  };
  
  const filterPheno = () => {
    filteredPheno.value = selectedPheno.value;
    phenoMenu.value = false;
  };
  
  const clearCategory = () => {
    selectedCategory.value = '';
    filteredCategory.value = 'All';
    categoryMenu.value = false;
  };
  
  const clearPheno = () => {
    selectedPheno.value = '';
    filteredPheno.value = 'All';
    phenoMenu.value = false;
  };
  
  // Filtered list computation remains the same
  const filteredVariantList = computed(() => {
    return formattedVariantList.value.filter(item => {
      const categoryMatch = filteredCategory.value === 'All' || 
        item.category.toLowerCase().includes(filteredCategory.value.toLowerCase());
      const phenoMatch = filteredPheno.value === 'All' || 
        item.phenostring.toLowerCase().includes(filteredPheno.value.toLowerCase());
      return categoryMatch && phenoMatch;
    });
  });

   // p value colours
   const getColour = (pval) => {
    if (pval < 5e-8 && pval !== null) return 'green';
    else if (pval === "NA") return null;
    return '#grey';
  };

  const formatScientific = (num) => {
    if (!num || isNaN(num)) return 'NA';  
    return Number(num).toExponential(2);  
  };

  </script>
  
  <style scoped>
  .v-data-table {
    width: 100%;
  }
  </style>
