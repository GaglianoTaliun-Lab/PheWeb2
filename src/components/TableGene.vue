<template>
  <v-row style="margin-top: 2px;" dense  align="center" class="align-end d-flex">
    <v-col cols="12" md="4">
      <v-card
        max-width="1210px"
        hover
        density="compact"
      >
        <v-row>
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
    <v-col cols="12" md="3">
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
    <v-spacer></v-spacer>
    <v-col cols="auto" class="d-flex md-5">
      <v-btn color="primary" @click="downloadCSV">Download CSV</v-btn>
    </v-col>
  </v-row>

  <v-card
    elevation="0"
    style="margin-top: 2px;"
  >
    <!-- <p>Phenotypes with the most-significant associations for this locus:</p> -->
    <v-data-table
      elevation="5"
      v-model="selectedItems"
      :loading="isLoading"
      :headers="headers"
      :items="filteredPhenotypes"
      item-value="phenocode"
      :items-per-page="4"
      :sort-by="sortBy"
      must-sort
      density="default"
      hover
      show-select
    >
      <template v-slot:header.data-table-select="{ allSelected, selectAll, someSelected }" >
        <div style="display: flex; align-items: center;">
          <v-checkbox-btn
          :indeterminate="someSelected && !allSelected"
          :model-value="allSelected"
          color="primary"
          @update:model-value="selectAll(!allSelected)"
          > </v-checkbox-btn>
          <span style="white-space: nowrap;">LZ plot(s)</span>
        </div>
      </template>

      <template v-slot:item.data-table-select="{ internalItem, isSelected, toggleSelect }">
        <div style="display: flex; align-items: center">
          <v-checkbox-btn
            :model-value="isSelected(internalItem)"
            color="primary"
            @update:model-value="toggleSelect(internalItem)"
          ></v-checkbox-btn>
        </div>
      </template>

      <template v-slot:item.abs_distance_to_true_start="{ item }" style="white-space: nowrap;">
        <span  v-if="item.abs_distance_to_true_start === 0">
          <v-icon medium color="success">mdi-check-outline</v-icon>
          within the gene
        </span>
        <span v-else>
          <v-row no-gutters >
            <v-col>
              <span v-if="item.distance_to_true_start<0" style="white-space: nowrap;">
                {{ item.distance_to_true_start }} bp
              </span>
              <v-progress-linear 
                v-if="item.distance_to_true_start<0"
                v-model="item.abs_distance_to_true_start"
                color="blue"
                :max="100000"
                reverse
              ></v-progress-linear>
            </v-col>
            <v-col>
              <span v-if="item.distance_to_true_start>0" style="white-space: nowrap;">
                {{ item.distance_to_true_start }} bp
              </span>
              <v-progress-linear 
                v-if="item.distance_to_true_start>0"
                v-model="item.abs_distance_to_true_start"
                color="blue"
                :max="100000"
              ></v-progress-linear>
            </v-col>
          </v-row>
          <div style="position: absolute; left: 50%; transform: translateX(-50%);">
            0
          </div>
          <div style="display: flex; justify-content: space-between">
            <span>-</span>
            <span>+</span>
          </div>
        </span>
      </template>

      <template v-slot:header.pval="{ column, isSorted, getSortIcon }">
        <div style="display: flex; ">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
            </template>
            <span style="white-space: normal;">
              P-value significant threshold: 5e-8 <br>
              green: significant <br>
              grey: unsignificant <br>
            </span>
          </v-tooltip>
          <template v-if="isSorted(column)">
            <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      <template v-slot:item.pval="{ item }">
        <div style="display: flex; align-items: center; ">
          <span>
            <v-chip v-if="item.pval !== 'NA'" :color="getColour(item.pval)">
                  {{ item.pval }}
                </v-chip>
          </span>
        </div>
      </template>

      <template v-slot:item.phenostring="{ item }">
        <span>
          <router-link :to="`/phenotypes/${item.phenocode_router}`">{{ item.phenostring }}</router-link>
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

      <template v-slot:item.num_samples="{ item }">
        <span>
          {{
            item.num_controls !== "" && item.num_cases !== ""
              ? `${item.num_cases} + ${item.num_controls}`
              : item.num_samples
          }}
        </span>
      </template>

      <template v-slot:loading>
        <v-skeleton-loader type="table-row@3"></v-skeleton-loader>
      </template>
      


    </v-data-table>
  </v-card>

</template>

<script setup>
  import { ref, onMounted, watch, computed, reactive, watchEffect} from 'vue';
  import { STRATIFICATION_CATEGORIES } from '@/config.js'

  // const phenotypes = ref(["CCC_MACDEG_COM.european.both"]);
  const phenotypes = ref([])
  const isLoading = ref(false);
  const props = defineProps({
    geneName: String,
    data: Array,
  });
  const currentPhenocode = ref(props.phenocode) ;
  const sortBy = ref([{ key: 'pval', order: 'asc' }]);
  // const chosenPhenocode = ref('')
  const selectedItems = ref([]);
  const emit = defineEmits(['updateChosenPheno']);

  const headers = ref([
  { title: 'Category', value: 'category' },
    { title: 'Phenotype', value: 'phenostring' },
    ...STRATIFICATION_CATEGORIES.map((cat) => ({
        title: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(), // e.g. 'Sex'
        key: cat.toLowerCase(),                            // e.g. 'sex'
      })),
    { title: '#Samples', value: 'num_samples' },
    { title: 'Top hit location', value: 'abs_distance_to_true_start', sortable: true },
    { title: 'Top p-value of phenotype in the range', value: 'pval', sortable: true, align: 'center' },
  ]);

  // data fetch
  const fetchData = async () => {
    isLoading.value = true;
    try {
      phenotypes.value = props.data.map(item => {
        const stratificationData = {};
        STRATIFICATION_CATEGORIES.forEach(cat => {
          stratificationData[cat.toLowerCase()] = item.stratification?.[cat.toLowerCase()] ?? '';
        });

        return {
          ...item,
          phenocode_router: item.phenocode.split('.').slice(0, 1).join('.'),
          ...stratificationData,
          abs_distance_to_true_start: item.is_in_real_range ? 0 : Math.abs(item.distance_to_true_start),
        };
      });
    } catch (error) {
      console.error("There was an error fetching the sample data:", error);
    } finally {
      isLoading.value = false;
    }
  };


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

  // filtering
  // const selectedSex = ref('All');
  //   const sexOptions = computed(() => {
  //     const sex = phenotypes.value.map(item => item.sex);
  //     return ['All', ...new Set(sex)];
  //   });

  //   const selectedAncestry = ref('All');
  //   const ancestryOptions = computed(() => {
  //     const ancestry = phenotypes.value.map(item => item.ancestry);
  //     return ['All', ...new Set(ancestry)];
  //   });

    const selectedCategory = ref();
    const categoryOptions = computed(() => {
      const categories = phenotypes.value.map(item => item.category);
      return ['All', ...[...new Set(categories)].sort((a, b) => a.localeCompare(b))];
    });

    const selectedPhenotype = ref();
    const phenotypeOptions = computed(() => {
      if (selectedCategory.value && selectedCategory.value !== 'All' ) {
        const phenos = phenotypes.value
          .filter(item => item.category === selectedCategory.value)
          .map(item => item.phenostring);
        return ['All', ...[...new Set(phenos)].sort((a, b) => a.localeCompare(b))];
      }

      const phenos = phenotypes.value.map(item => item.phenostring);
      return ['All', ...[...new Set(phenos)].sort((a, b) => a.localeCompare(b))];
    });

    const filteredPhenotypes = computed(() => {
      return phenotypes.value
        .filter(item => {
          const stratificationMatches = STRATIFICATION_CATEGORIES.every(cat => {
            const selectedValue = selectedFilters[cat.toLowerCase()]?.value;
            return !selectedValue || selectedValue === 'All' || item[cat.toLowerCase()] === selectedValue;
          });

          const categoryMatches =
            !selectedCategory.value ||
            selectedCategory.value === 'All' ||
            item.category === selectedCategory.value;

          const phenotypeMatches =
            !selectedPhenotype.value ||
            selectedPhenotype.value === 'All' ||
            item.phenostring === selectedPhenotype.value;

          return stratificationMatches && categoryMatches && phenotypeMatches;
        })
        .sort((a, b) => a.pval - b.pval);
    });
  
  // downloading
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
    link.download = `phenotypes_of_${props.geneName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  // p value colour
  const getColour = (pval) => {
    if (pval < 5e-8 && pval !== null) return 'green';
    else if (pval === "NA") return null;
    return '#grey';
  };

  onMounted( () => {
    fetchData();
    selectedItems.value = [filteredPhenotypes.value[0].phenocode];
  });

  watch(
    () => props.phenocode,
    (newPhenocode) => {
      currentPhenocode.value = newPhenocode;
    }
  );
  watch(
    () => props.data,
    (newValue) => {
      fetchData();
    },
  );
  watch(
    selectedItems,
    (newPhenocode) => {
      fetchData();
      emit('updateChosenPheno', selectedItems)
    }
  );

</script>

<style scoped>
  .v-data-table-header th {
    font-weight: 800;
    font-size: 1.2rem; 
    color: #333; 
  }
  .selected-row {
    background-color: #fab9d4; 
  }
  
</style>