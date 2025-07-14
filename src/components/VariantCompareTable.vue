<template>
  <div v-if="formattedVariantList.length > 0" class="mt-1">
    <!-- Previous template code remains the same until the category search field -->
    <v-card elevation="5">
      <v-data-table :items="filteredVariantList" :headers="headers" fixed-header :items-per-page="10"
        hover :sort-by="[{ key: 'pval', order: 'asc' }]">
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

        <template v-slot:header.num_samples="{ column, isSorted, getSortIcon, }">
          <div style="display: flex; align-items: center; justify-content: center; text-align: center;">
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
          <div style="display: flex; align-items: center; justify-content: center; text-align: center;">
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
          <div style="display: flex; align-items: center; justify-content: center; text-align: center;">
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

        <template v-slot:header.pval="{ column }">
          <div style="display: flex; align-items: center; justify-content: center; text-align: center; ">
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
          </div>
        </template>

        <!-- Other template slots remain the same -->
        <template v-slot:item.phenostring="{ item }">
          <router-link :to="`/phenotypes/${item.phenocode_variant1 ?? item.phenocode_variant2}`">{{ item.phenostring }}</router-link>
        </template>

        <template v-slot:item.pval_variant1="{ item }">
          <!-- <span style="white-space: nowrap;">{{ item.pval }}</span> -->
          <v-chip v-if="item.pval_variant1 !== 'NA'" :color="getColour(item.pval_variant1)">
            {{ formatScientific(item.pval_variant1) }}
          </v-chip>
          <span v-else>NA</span>
        </template>

        <template v-slot:item.pval_variant2="{ item }">
          <!-- <span style="white-space: nowrap;">{{ item.pval }}</span> -->
          <v-chip v-if="item.pval_variant2 !== 'NA'" :color="getColour(item.pval_variant2)">
            {{ formatScientific(item.pval_variant2) }}
          </v-chip>
          <span v-else>NA</span>
        </template>

      </v-data-table>
    </v-card>
  </div>
</template>
  
<script setup>
import { onMounted } from 'vue';
import { ref, computed } from 'vue';

import { STRATIFICATION_CATEGORIES } from "@/config.js";


//   // Add this function in your script setup
//   const downloadTable = () => {
//   // Convert all data to CSV format (using formattedVariantList instead of filteredVariantList)

//   const variant1 = ref('');
//   const variant2 = ref('');

//   const csv_headers = [
//     'Category',
//     'Phenotype',
//     'Sex',
//     'Ancestry',
//     'P-value',
//     'Effect Allele Frequency',
//     'Effect Size (se)',
//     'Number of Samples',
//     'Number of Cases',
//     'Number of Controls'
//   ];
  
//   const csvContent = [
//     csv_headers.join(','),
//     ...formattedVariantList.value.map(item => [
//       item.category,
//       item.phenostring,
//       item.sex,
//       item.ancestry,
//       item.af,
//       item.pval,
//       item.beta_se,
//       item.num_samples,
//       item.num_cases,
//       item.num_controls,
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
    selectedStratification1 : Object,
    selectedStratification2 : Object,
    variantList: Object,
    categoryList: Object
  });

  onMounted(() => {

    headers.value = [{ 
      title: 'Category', 
      key: 'category_variant1',
      sortable: false 
    },
    { 
      title: 'Phenotype', 
      key: 'phenostring',
      sortable: false 
    },
    { 
      title: 'P-value', 
      key: 'pval',
      children: [
        { title: props.selectedStratification1.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'pval_variant1' }, 
        ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "No stratification"
        ? [
            { title: props.selectedStratification2.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'pval_variant2' }, 
          ]
        : [])
      ],
      sortable: false
    },
    { title: 'Effect Allele Frequency',
      key: 'eaf',
      children: [
        { title: props.selectedStratification1.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'eaf_variant1' }, 
        ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "No stratification"
        ? [
            { title: props.selectedStratification2.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'eaf_variant2' }, 
          ]
        : [])
      ],
      sortable: false
    },
    { 
      title: 'Effect Size (SE)', 
      key: 'beta_se',
      children: [
        { title: props.selectedStratification1.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'beta_se_variant1' }, 
        ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "No stratification"
        ? [
            { title: props.selectedStratification2.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'beta_se_variant2' }, 
          ]
        : [])
      ],
      sortable: false 
    },
    { 
      title: '#Samples', 
      key: 'num_samples',
      children: [
        { title: props.selectedStratification1.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'num_samples_variant1' }, 
        ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "No stratification"
        ? [
            { title: props.selectedStratification2.split('.').slice(-2).join(', ').replace(/\b\w/g, l => l.toUpperCase()), key: 'num_samples_variant2' }, 
          ]
        : [])
      ],
      sortable: false    }];

      formattedVariantList.value = computeFormattedVariantList();

  })

  
  // ... Previous header definitions and other refs remain the same ...
  const headers = ref([]); 
  const categoryMenu = ref(false);
  const phenoMenu = ref(false);
  const selectedCategory = ref('');
  const selectedPheno = ref('');
  const filteredCategory = ref('All');
  const filteredPheno = ref('All');
  const formattedVariantList = ref([]);



  // Format variant list (same as before)
  function computeFormattedVariantList() {
    if (!props.variantList) return [];

    // Flatten and filter phenos
    const phenos = props.variantList.flatMap((v) => {
      const strat = v.stratification.slice(1); // e.g., '.AFR' or similar

      if (
          !props.selectedStratification1.includes(strat) &&
          !props.selectedStratification2.includes(strat)
      ) return [];

      return v.phenos
          .filter(pheno => props.categoryList.includes(pheno.category))
          .map(pheno => {
              const isPvalNegative = pheno.pval === -1;

              const stratFields = Object.fromEntries(
                  STRATIFICATION_CATEGORIES.map(key => [
                      key,
                      isPvalNegative ? "NA" : pheno.stratification[key]
                  ])
              );

              return {
                  category: pheno.category,
                  phenostring: pheno.phenostring,
                  phenocode: pheno.phenocode,
                  stratification: strat,
                  ...stratFields,
                  pval: isPvalNegative ? "NA" : pheno.pval,
                  eaf: isPvalNegative ? "NA" : pheno.af,
                  beta_se: isPvalNegative ? "NA" : pheno.beta > 0
                  ? `${pheno.beta} (${pheno.sebeta}) △`
                  : `${pheno.beta} (${pheno.sebeta}) ▽`,
                  num_samples: isPvalNegative ? "NA" : pheno.num_samples,
                  cases: isPvalNegative ? "NA" : pheno.num_cases,
                  controls: isPvalNegative ? "NA" : pheno.num_controls
              };
          })
          .filter(item => {
            const keysToIgnore = new Set(["category", "phenostring", "phenocode"]);
            return Object.entries(item)
              .some(([key, value]) => !keysToIgnore.has(key) && value !== "NA");
          });
    });

    // Group by phenostring
    const grouped = {};
    phenos.forEach((pheno) => {
        if (!grouped[pheno.phenostring]) {
            grouped[pheno.phenostring] = { phenostring: pheno.phenostring, variants: [] };
        }
        grouped[pheno.phenostring].variants.push(pheno);
    });

    // Process groups, ensuring stratification order
    const formattedList = Object.values(grouped).map(group => {
        const sortedVariants = group.variants.sort((a, b) => {
            return props.selectedStratification1.includes(a.stratification) ? -1 : 1;
        });

        const merged = { phenostring: group.phenostring };

        sortedVariants.forEach((pheno, index) => {
            const variantNum = `_variant${index + 1}`;
            for (const [key, value] of Object.entries(pheno)) {
                if (key !== 'phenostring' && key !== 'stratification') {
                    merged[`${key}${variantNum}`] = value;
                }
            }
        });

        // Ensure missing variants are filled with empty values
        const baseKeys = Object.keys(merged).filter(k => k !== "phenostring").map(k => k.replace(/_variant[12]$/, ''));
        [...new Set(baseKeys)].forEach(key => {
            if (!merged.hasOwnProperty(`${key}_variant1`)) merged[`${key}_variant1`] = "";
            if (!merged.hasOwnProperty(`${key}_variant2`)) merged[`${key}_variant2`] = "";
        });

        return merged;
    });

    return formattedList;
  };
  
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
