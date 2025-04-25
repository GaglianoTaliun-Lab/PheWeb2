<template>
  <v-card class="d-flex pa-2" variant="text">
    <v-row dense style="max-width: 1210px;">
      <v-col cols="12" md="6">
        <v-card
          max-width="600"
          hover
          density="compact"
        >
          <v-row class="d-flex">
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="selectedCategory"
                :items="categoryOptions"
                label="Select/Type a category"
                prepend-icon="mdi-shape-outline"
                class="ma-2 pa-2"
                variant="underlined"
                auto-select-first  
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="selectedPhenotype"
                :items="phenotypeOptions"
                label="Select/Type a phenotype"
                prepend-icon="mdi-heart-pulse"
                class="ma-2 pa-2"
                variant="underlined"
                auto-select-first  
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card
          max-width="500"
          hover
          density="compact"
        >  
          <v-row class="d-flex" dense>
            <template v-for="category in STRATIFICATION_CATEGORIES" :key="category">
              <v-col cols="12" sm="6">
                <v-select
                  v-model="selectedFilters[category.toLowerCase()]"
                  :items="filterOptions[category.toLowerCase()]"
                  :label="category.charAt(0).toUpperCase() + category.slice(1)"
                  prepend-icon="mdi-filter-variant"
                  class="ma-2 pa-2"
                  variant="underlined"
                ></v-select>
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
  
  <div class="text-left; d-flex; pa-2"> 
    <v-row align="center" justify="space-between">
      <v-col cols="auto">
        <p>{{ displayedUniquePhenotypesCount }} of {{ displayedTotalPhenotypesCount }} phenotype(s) displayed</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="downloadCSV">Download CSV</v-btn>
      </v-col>
    </v-row>
  </div>  

  <v-card elevation="5">

    <v-data-table 
      :items="filteredPhenotypes" 
      :headers="headers" 
      :search="search" 
      height=700 
      fixed-header 
      :items-per-page="100"
      :sort-by="[{ key: 'pval', order: 'asc' }]"
      :loading="isLoading"
      must-sort
      hover>

      <template v-slot:item.phenostring="{ item }">
        <router-link :to="`/phenotypes/${item.phenocode}`">{{ item.phenostring }}</router-link>
      </template>

      <template v-slot:item.variantid="{ item }">
        <a :href="`/variant/${item.variantid}`" style="white-space: pre-line;">{{ item.variantName }}</a>
      </template>

      <template v-slot:item.nearest_genes="{ item }">
        <span v-for="(gene, index) in item.nearest_genes" :key="index">
          <router-link 
            :to="`/gene/${gene.trim()}/${item.phenocode}`" 
            style="white-space: nowrap; font-style: italic;"
          >
            {{ gene.trim() }}
          </router-link>
          <span v-if="index < item.nearest_genes.length - 1">, </span>
        </span>
      </template>

      <template v-slot:item.num_samples="{ item }">
        <span>
          {{
            item.num_controls !== "" && item.num_cases !== ""
              ? `${item.num_cases} + ${item.num_controls}`
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
          <v-tooltip text="# Cases + # Controls" location="top">
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
          <v-tooltip text="# significant peaks" location="top">
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
          <v-tooltip text="Head to internal page" location="top">
            <template v-slot:activator="{ props }">
              <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
            </template>
          </v-tooltip>
          <v-menu
            open-on-hover
            v-model="menu2"
            :close-on-content-click="false"
            location="bottom"
            
          >
            <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2" 
                :icon="filteredGene === '' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"></v-icon>
            </template>
            <v-card class="pa-3">
              <v-text-field
                v-model="selectedGene"
                label="Enter gene name"
                hint="Try RHOF"
                style="width: 400px;"
                variant="outlined"
                density="compact"
                elevation="2"
                rounded
                prepend-inner-icon="mdi-magnify"
                @keydown.enter="filterGene"
              ></v-text-field>
              <v-row justify="end">
                <v-col cols="auto">
                  <v-btn 
                    @click="clearGene" 
                    color="primary" 
                    class="mt-3"
                    variant="outlined"
                  >
                    Clear
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn 
                    @click="filterGene" 
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
          <v-menu
            open-on-hover
            v-model="menu"
            :close-on-content-click="false"
            location="bottom"
            
          >
            <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2" 
                :icon="filteredVariant === '' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"></v-icon>
            </template>
            <v-card class="pa-3">
              <v-text-field
                v-model="selectedVariant"
                label="Enter variantID or rsID"
                hint="Try rs11553699 or 12-121779004-A-G"
                style="width: 400px;"
                variant="outlined"
                density="compact"
                elevation="2"
                rounded
                prepend-inner-icon="mdi-magnify"
                @keydown.enter="filterVariants"
              ></v-text-field>
              <!-- <v-autocomplete
                v-model="selectedVariant"
                :loading="variantSearchLoading"
                :items="variantOptions"
                label="Enter vairantID or rsID"
                placeholder="Try rs11553699 or 12-121779004-A-G"
                clearable
                style="width: 400px;"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"      
                density="compact"
                elevation="2"
                rounded
                item-props
                menu-icon=""
                auto-select-first
                filter-mode="some"
              ></v-autocomplete> -->
              <v-row justify="end">
                <v-col cols="auto">
                  <v-btn 
                    @click="clearVariants" 
                    color="primary" 
                    class="mt-3"
                    variant="outlined"
                  >
                    Clear
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn 
                    @click="filterVariants" 
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

      <template v-slot:header.pval="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      <template v-if="hasAF" v-slot:header.af="{ column }">
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

    </v-data-table>
  </v-card>

</template>

<script setup>
    import { ref, onMounted, computed, watch, reactive, watchEffect } from 'vue';
    import { STRATIFICATION_CATEGORIES} from '@/config.js'

    const props = defineProps({
      data: Array,
    });
    
    // main table
    // const headers = ref([
    //   { title: 'Category', key: 'category' },
    //   { title: 'Phenotype', key: 'phenostring' },
    //   { title: 'Sex', key: 'sex' },
    //   { title: 'Ancestry', key: 'ancestry' },
    //   { title: '#Samples', key: 'num_samples' },
    //   { title: '#Loci < 5e-8', key: 'num_peaks' },
    //   { title: 'P-value', key: 'pval' },
    //   { title: 'Top Variant', key: 'variantid', sortable: false },
    //   { title: 'Nearest Gene(s)', key: 'nearest_genes', sortable: false },
    // ]);
    
    const phenotypes = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const search = ref('');

    const fetchData = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      try {
        phenotypes.value = props.data.map(item => {
          const stratificationData = {};
          STRATIFICATION_CATEGORIES.forEach(cat => { // dynamically fetch based on constant (STRATIFICATION_CATEGORIES)
            stratificationData[cat.toLowerCase()] = item.stratification?.[cat.toLowerCase()] ?? '';
          });

          return {
            ...item,
            variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
            variantName: item.rsids 
              ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}\n(${item.rsids})`
              : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
            ...stratificationData,
            num_controls: `${item.num_controls}`,
            num_num_cases: `${item.num_cases}`,
            nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [],
            category: item.category ? item.category.replace(/_/g, ' ') : ''
          };
        });
      } catch (error) {
        console.error("There was an error fetching the sample data:", error);
        errorMessage.value = "Failed to load data. Please try again later.";
      } finally {
        isLoading.value = false;
      }
    };

    const baseHeaders = [
      { title: 'Category', key: 'category' },
      { title: 'Phenotype', key: 'phenostring' },
      ...STRATIFICATION_CATEGORIES.map((cat) => ({
        title: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(), // e.g. 'Sex'
        key: cat.toLowerCase(),                            // e.g. 'sex'
      })),
      { title: 'P-value', key: 'pval' },
      { title: 'Top Variant', key: 'variantid', sortable: false },
      { title: 'Nearest Gene(s)', key: 'nearest_genes', sortable: false },
    ];


    const hasAF = computed(() => props.data.some(item => item.hasOwnProperty('af')));
    const headers = computed(() => {
      const hasNumSamples = props.data.some(item => item.hasOwnProperty('num_samples'));
      const hasNumPeaks = props.data.some(item => item.hasOwnProperty('num_peaks'));
      // hasAF.value = props.data.some(item => item.hasOwnProperty('af'));
      const hasNumSignificantInPeak = props.data.some(item => item.hasOwnProperty('num_significant_in_peak'));

      let lociColumn = { title: '#Loci < 5e-8', key: hasNumPeaks ? 'num_peaks' : hasNumSignificantInPeak ? 'num_significant_in_peak' : '' };
      let updatedHeaders = [...baseHeaders];

      if (lociColumn.key) {
        updatedHeaders.splice(4, 0, lociColumn); 
      }

      if (hasNumSamples) {
        updatedHeaders.splice(4, 0, { title: '#Samples', key: 'num_samples' }); 
      }

      if (hasAF.value) {
        updatedHeaders.splice(6, 0, { title: 'EAF', key: 'af' }); 
      }

      return updatedHeaders;
    });

    // filters
    // const selectedSex = ref('All');
    // const sexOptions = computed(() => {
    //   const sex = phenotypes.value.map(item => item.sex);
    //   return ['All', ...new Set(sex)];
    // });

    // const selectedAncestry = ref('All');
    // const ancestryOptions = computed(() => {
    //   const ancestry = phenotypes.value.map(item => item.ancestry);
    //   return ['All', ...new Set(ancestry)];
    // });

    const selectedFilters = reactive({});
    const filterOptions = reactive({});

    STRATIFICATION_CATEGORIES.forEach(cat => {
      const key = cat.toLowerCase();
      selectedFilters[key] = 'All';

      watchEffect(() => {
        const values = phenotypes.value.map(item => item[key]).filter(Boolean);
        filterOptions[key] = ['All', ...new Set(values)];
      });
    });

    const selectedCategory = ref();
    const categoryOptions = computed(() => {
      const categories = phenotypes.value.map(item => item.category);
      return ['All', ...[...new Set(categories)].sort((a, b) => a.localeCompare(b))];
    });

    const selectedPhenotype = ref();
    const phenotypeOptions = computed(() => {
      const phenos = phenotypes.value.map(item => item.phenostring);
      return ['All', ...[...new Set(phenos)].sort((a, b) => a.localeCompare(b))];
    });

    // in-table filters
    const selectedVariant = ref('');
    const selectedGene = ref('');
    const menu = ref(false);
    const menu2 = ref(false);
    // const variantSearchLoading = ref(true);
    const variantSearchLoading = computed(() => {
      if (selectedVariant.value != ''){
        return true;
      } else {
        return false;
      }
    });
    const variantOptions = computed(() => {
      const variants = phenotypes.value
        .flatMap(item => [item.rsids, item.variantid]) 
        .filter(variant => variant !== undefined && variant !== '');
      return ['All', ...[...new Set(variants)].sort((a, b) => a.localeCompare(b))];
    });

    const filteredVariant = ref('');
    const filteredGene = ref('');
    const filterVariants = () => {
      variantSearchLoading.value = false;
      filteredVariant.value = selectedVariant.value;
    };
    const filterGene = () => {
      filteredGene.value = selectedGene.value;
    };
    const clearVariants = () => {
      selectedVariant.value = '';
      filteredVariant.value = '';
    };
    const clearGene = () => {
      selectedGene.value = '';
      filteredGene.value = '';
    };


    // maybe consider receiving the filtering options through API
    // since there will be a lot of data for the final table
    const filteredPhenotypes = computed(() => {
      return phenotypes.value.filter(item => {
        // Stratification filters
        const stratFiltersPass = STRATIFICATION_CATEGORIES.every(cat => {
          const key = cat.toLowerCase();
          const selected = selectedFilters[key];
          return selected === 'All' || item[key] === selected;
        });

        // Other filters
        const categoryMatches = !selectedCategory.value || selectedCategory.value === 'All' || item.category === selectedCategory.value;
        const phenotypeMatches = !selectedPhenotype.value || selectedPhenotype.value === 'All' || item.phenostring === selectedPhenotype.value;

        const variantMatches = !filteredVariant.value || filteredVariant.value === '' || 
          (item.rsids && item.rsids.includes(filteredVariant.value)) ||
          (item.variantid && item.variantid.includes(filteredVariant.value));

        const geneMatches = !filteredGene.value || filteredGene.value === '' ||
          (Array.isArray(item.nearest_genes) && item.nearest_genes.some(gene => 
            gene.toUpperCase().includes(filteredGene.value.toUpperCase()))
          );

        return stratFiltersPass && categoryMatches && phenotypeMatches && variantMatches && geneMatches;
      });
    });

    // unique phenotype displayed
    const displayedUniquePhenotypesCount = computed(() => {
      const uniquePhenotypes = new Set(filteredPhenotypes.value.map(item => item.phenostring));
      return uniquePhenotypes.size;
    });

    const displayedTotalPhenotypesCount = computed(() => {
      const totalPhenotypes = new Set(phenotypes.value.map(item => item.phenostring));
      return totalPhenotypes.size;
    });

    const emit = defineEmits(['updateUniquePhenotypesCount']) //emit('updateUniquePhenotypesCount', data) to parent

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
      fetchData();
    });

    watch(
      () => props.data,
      (newValue) => {
        fetchData();
      },
    );

    watch([displayedUniquePhenotypesCount, displayedTotalPhenotypesCount], ([newUniqueCount, newTotalCount]) => {
      emit('updateUniquePhenotypesCount', { uniqueCount: newUniqueCount, totalCount: newTotalCount });
    })

</script>