<template>
    <div v-if="formattedVariantList.length > 0" class="mt-4">
      <!-- Previous template code remains the same until the category search field -->
      <v-card elevation="5">
        <v-data-table
          :items="filteredVariantList"
          :headers="headers"
          height="700"
          fixed-header
          :items-per-page="100"
          hover
          :sort-by="[{ key: 'pval', order: 'asc' }]"
        >
          <!-- Top slot remains the same -->
          <template v-slot:top>
            <div class="d-flex justify-end px-4 mt-2">
              <span class="px-2 py-1 rounded font-weight-bold text-white" style="background-color: #337bb7;">
                {{ filteredVariantList.length }} {{ filteredVariantList.length === 1 ? 'result' : 'results' }}
              </span>
            </div>
          </template>
  
          <template v-slot:header.category="{ column }">
            <div style="display: flex; align-items: center;">
              <span style="white-space: nowrap;">{{ column.title }}</span>
              <v-menu
                open-on-hover
                v-model="categoryMenu"
                :close-on-content-click="false"
                location="bottom"
              >
                <template v-slot:activator="{ props }">
                  <v-icon 
                    small 
                    color="primary" 
                    v-bind="props" 
                    class="ml-2"
                    :icon="filteredCategory === 'All' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"
                  ></v-icon>
                </template>
                <v-card class="pa-3">
                  <v-text-field
                    v-model="selectedCategory"
                    label="Enter category"
                    :hint="firstCategory"
                    style="width: 400px;"
                    variant="outlined"
                    density="compact"
                    elevation="2"
                    rounded
                    prepend-inner-icon="mdi-magnify"
                    @keydown.enter="filterCategory"
                  ></v-text-field>
                  <v-row justify="end">
                    <v-col cols="auto">
                      <v-btn 
                        @click="clearCategory" 
                        color="primary" 
                        class="mt-3"
                        variant="outlined"
                      >
                        Clear
                      </v-btn>
                    </v-col>
                    <v-col cols="auto">
                      <v-btn 
                        @click="filterCategory" 
                        color="primary" 
                        class="mt-3"
                        variant="outlined"
                      >
                        Save
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
              <v-menu
                open-on-hover
                v-model="phenoMenu"
                :close-on-content-click="false"
                location="bottom"
              >
                <template v-slot:activator="{ props }">
                  <v-icon 
                    small 
                    color="primary" 
                    v-bind="props" 
                    class="ml-2"
                    :icon="filteredPheno === 'All' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"
                  ></v-icon>
                </template>
                <v-card class="pa-3">
                  <v-text-field
                    v-model="selectedPheno"
                    label="Enter phenotype"
                    :hint="firstPhenotype"
                    style="width: 400px;"
                    variant="outlined"
                    density="compact"
                    elevation="2"
                    rounded
                    prepend-inner-icon="mdi-magnify"
                    @keydown.enter="filterPheno"
                  ></v-text-field>
                  <v-row justify="end">
                    <v-col cols="auto">
                      <v-btn 
                        @click="clearPheno" 
                        color="primary" 
                        class="mt-3"
                        variant="outlined"
                      >
                        Clear
                      </v-btn>
                    </v-col>
                    <v-col cols="auto">
                      <v-btn 
                        @click="filterPheno" 
                        color="primary" 
                        class="mt-3"
                        variant="outlined"
                      >
                        Save
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-menu>
            </div>
          </template>
  
          <!-- Other template slots remain the same -->
          <template v-slot:item.phenostring="{ item }">
            <router-link :to="`/phenotypes/${item.phenocode}`">{{ item.phenostring }}</router-link>
          </template>
  
          <template v-slot:item.pval="{ item }">
            <span style="white-space: nowrap;">{{ item.pval }}</span>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    selectedStratifications: Object,
    variantList: Object,
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
    { 
      title: 'Sex', 
      key: 'sex',
      sortable: false 
    },
    { 
      title: 'Ancestry', 
      key: 'ancestry',
      sortable: false 
    },
    { 
      title: 'P-value', 
      key: 'pval',
      sortable: true
    },
    { 
      title: 'Effect Size (se)', 
      key: 'beta_se',
      sortable: false 
    },
    { 
      title: 'Number of Samples', 
      key: 'num_samples',
      sortable: false 
    },
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
  
      return v.phenos.map((pheno) => ({
        category: pheno.category,
        phenocode: pheno.phenocode,
        phenostring: pheno.phenostring,
        sex: pheno.stratification.sex,
        ancestry: pheno.stratification.ancestry,
        pval: pheno.pval,
        beta_se: `${pheno.beta} (${pheno.sebeta})`,
        num_samples: pheno.num_samples,
      }));
    }) || [];
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
  </script>
  
  <style scoped>
  .v-data-table {
    width: 100%;
  }
  </style>