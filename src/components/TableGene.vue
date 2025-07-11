<template class="d-flex">
  <v-row style="margin-top: 2px;" dense  align="center" class="align-end d-flex">
    <v-col cols="12" md="3">
      <v-card
        max-width="600px"
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
        max-width="600"
        hover
        density="compact"
      >  
        <v-row class="d-flex" dense>
          <v-col cols="12" sm="6">
            <v-select
                v-model="selectedSex"
                :items="sexOptions"
                label="Sex"
                prepend-icon="mdi-gender-male-female"
                class="ma-2 pa-2"
                variant="underlined"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
                v-model="selectedAncestry"
                :items="ancestryOptions"
                label="Ancestry"
                prepend-icon="mdi-account-group-outline"
                class="ma-2 pa-2"
                variant="underlined"
            ></v-select>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-spacer></v-spacer>
    <v-col cols="auto" class="d-flex md-5">
      <v-btn color="primary" @click="downloadCSV">Download CSV</v-btn>
    </v-col>
  </v-row>

  <v-card
    elevation="5"
    style="margin-top: 5px; margin-bottom: 5px;"
    class="d-flex"
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
                {{ formatScientific(item.distance_to_true_start) }} bp
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
                {{ formatScientific(item.distance_to_true_start) }} bp
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
              {{ formatScientific(item.pval) }}
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
          <v-tooltip text="Sample size" location="top">
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
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <span class="mt-2">Loading Data... please wait </span>
        <v-skeleton-loader type="table-row@3"></v-skeleton-loader>
      </template>
      
    </v-data-table>
  </v-card>

</template>

<script setup>
  import { ref, onMounted, watch, computed} from 'vue';
  import axios from 'axios';

  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
  const phenotypes = ref([]);
  const geneData = ref(null);
  const isLoading = ref(false);
  const props = defineProps({
    geneName: String,
    data: Array,
    isLoading: Boolean,
  });
  const currentPhenocode = ref(props.phenocode) ;
  const sortBy = ref([{ key: 'pval', order: 'asc' }]);
  // const chosenPhenocode = ref('')
  const selectedItems = ref([]);
  const emit = defineEmits(['updateChosenPheno']);
  // scientific notation
  const formatScientific = (num) => {
    if (!num || isNaN(num)) return 'N/A';  
    return Number(num).toExponential(2);  
  };

  const headers = ref([
  { title: 'Category', value: 'category' },
    { title: 'Phenotype', value: 'phenostring' },
    { title: 'Ancestry', value: 'ancestry' },
    { title: 'Sex', value: 'sex' },
    { title: '#Samples', value: 'num_samples' },
    { title: 'Top hit location', value: 'abs_distance_to_true_start', sortable: true },
    { title: 'Top p-value of phenotype in the range', value: 'pval', sortable: true, align: 'center' },
  ]);

  // data fetch
  const fetchData = async () => {
    try {
      isLoading.value = true;
      // console.log(props.data)
      const gene_response = await axios.get(`${api}/gene/${props.geneName}`);
      geneData.value = gene_response.data.data;
      phenotypes.value = geneData.value.map(item => ({
          ...item,
          phenocode_router: item.phenocode.split('.').slice(0, 1).join('.') ,
          ancestry: `${item.stratification.ancestry.replace(/\b\w/g, l => l.toUpperCase())}`, // TODO: don't hardcode these
          sex: `${item.stratification.sex.replace(/\b\w/g, l => l.toUpperCase())}`,
          abs_distance_to_true_start: item.is_in_real_range ? 0 : Math.abs(item.distance_to_true_start),
          category: item.category ? String(item.category).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
        }));
      // phenotypes.value = props.data.map(item => ({
      //     ...item,
      //     phenocode_router: item.phenocode.split('.').slice(0, 1).join('.') ,
      //     ancestry: `${item.stratification.ancestry.replace(/\b\w/g, l => l.toUpperCase())}`, // TODO: don't hardcode these
      //     sex: `${item.stratification.sex.replace(/\b\w/g, l => l.toUpperCase())}`,
      //     abs_distance_to_true_start: item.is_in_real_range ? 0 : Math.abs(item.distance_to_true_start),
      //     category: item.category ? String(item.category).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
      //   }));
    } catch (error) {
      console.error('Error fetching data for gene table:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // filtering
  const selectedSex = ref('All results');
  const sexOptions = computed(() => {
    const sex = phenotypes.value.map(item => item.sex);
    return ['All results', ...new Set(sex)];
  });

  const selectedAncestry = ref('All results');
  const ancestryOptions = computed(() => {
    const ancestry = phenotypes.value.map(item => item.ancestry);
    return ['All results', ...new Set(ancestry)];
  });

  const selectedCategory = ref();
  const categoryOptions = computed(() => {
    const categories = phenotypes.value.map(item => item.category);
    return ['All results', ...[...new Set(categories)].sort((a, b) => a.localeCompare(b))];
  });

  const selectedPhenotype = ref();
  const phenotypeOptions = computed(() => {
    if (selectedCategory.value && selectedCategory.value !== 'All results' ) {
      const phenos = phenotypes.value
        .filter(item => item.category === selectedCategory.value)
        .map(item => item.phenostring);
      return ['All results', ...[...new Set(phenos)].sort((a, b) => a.localeCompare(b))];
    }

    const phenos = phenotypes.value.map(item => item.phenostring);
    return ['All results', ...[...new Set(phenos)].sort((a, b) => a.localeCompare(b))];
  });

  const filteredPhenotypes = computed(() => {
    return phenotypes.value.filter(item => {
      const sexMatches = selectedSex.value === 'All results' || item.sex === selectedSex.value;
      const ancestryMatches = selectedAncestry.value === 'All results' || item.ancestry === selectedAncestry.value;
      const categoryMatches = !selectedCategory.value || selectedCategory.value === 'All results' || item.category === selectedCategory.value;
      const phenotypeMatches = !selectedPhenotype.value || selectedPhenotype.value === 'All results' || item.phenostring === selectedPhenotype.value;
      return sexMatches && ancestryMatches && categoryMatches && phenotypeMatches;
    })
    .sort((a, b) => a.pval - b.pval);;
  });
  
  // downloading
  const coverToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const keys = Object.keys(data[0]);

    const escapeForCSV = (value) => {
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      const str = String(value ?? '');
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const rows = [];

    rows.push(keys.map(escapeForCSV).join(','));

    data.forEach((item) => {
      const values = keys.map((key) => escapeForCSV(item[key]));
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

  onMounted( async () => {
    await fetchData();
    if (filteredPhenotypes.value.length > 0) {
      selectedItems.value = [filteredPhenotypes.value[0].phenocode];
    }
    // console.log(filteredPhenotypes)
    // console.log(typeof filteredPhenotypes)
    // selectedItems.value = [filteredPhenotypes.value[0].phenocode];
  });

  watch(
    () => props.phenocode,
    (newPhenocode) => {
      currentPhenocode.value = newPhenocode;
    }
  );
  // watch(
  //   () => props.data,
  //   (newValue) => {
  //     fetchData();
  //   },
  // );
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