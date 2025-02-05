<template>
  <v-card
    elevation="0"
    class="mt-4"
  >
    <!-- <p>Phenotypes with the most-significant associations for this locus:</p> -->
    <v-data-table
      v-model="selectedItems"
      :loading="isLoading"
      :headers="headers"
      :items="phenotypes"
      item-value="phenocode"
      :items-per-page="5"
      :sort-by="sortBy"
      must-sort
      dense
      hover
      show-select
    >
      <!-- <template v-slot:body="{ items, isSelected, toggleSelect, internalItem }"> 
        <tr v-for="item in items"

        >
          <td>
            <v-checkbox-btn
              :model-value="isSelected(item)"
              color="primary"
              @update:model-value="toggleSelect(item)"
            ></v-checkbox-btn>
          </td>

          <td style="white-space: nowrap;">
            <span v-if="item.is_in_real_range === true">
              <v-icon medium color="success" class="ml-2">mdi-check-outline</v-icon>
              within the gene
            </span>
            <span v-else>
              <v-row no-gutters >
                <v-col>
                  <span v-if="item.distance_to_true_start<0">
                    {{ item.distance_to_true_start }} bp
                  </span>
                  <v-progress-linear 
                    v-if="item.distance_to_true_start<0"
                    v-model="item.pos_distance"
                    color="blue"
                    :max="100000"
                    reverse
                  ></v-progress-linear>
                </v-col>
                <v-col>
                  <span v-if="item.distance_to_true_start>0">
                    {{ item.distance_to_true_start }} bp
                  </span>
                  <v-progress-linear 
                    v-if="item.distance_to_true_start>0"
                    v-model="item.distance_to_true_start"
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
          </td>
          <td>
            {{ item.pval }}
          </td>
          <td>
            <router-link :to="`/phenotypes/${item.phenocode_router}`">{{ item.phenostring }}</router-link>
          </td>
          <td>
            {{ item.ancestry }}
          </td>
          <td>
            {{ item.sex}}
          </td>
        </tr>
      </template> -->
      <template v-slot:header.data-table-select="{ allSelected, selectAll, someSelected }">
        <v-checkbox-btn
          :indeterminate="someSelected && !allSelected"
          :model-value="allSelected"
          color="primary"
          @update:model-value="selectAll(!allSelected)"
        ></v-checkbox-btn>
      </template>

      <template v-slot:item.data-table-select="{ internalItem, isSelected, toggleSelect }">
        <v-checkbox-btn
          :model-value="isSelected(internalItem)"
          color="primary"
          @update:model-value="toggleSelect(internalItem)"
        ></v-checkbox-btn>
      </template>

      <template v-slot:item.is_in_real_range="{ item }" style="white-space: nowrap;">
        <span  v-if="item.is_in_real_range === true">
          <v-icon medium color="success" class="ml-2">mdi-check-outline</v-icon>
          within the gene
        </span>
        <span v-else>
          <v-row no-gutters >
            <v-col>
              <span v-if="item.distance_to_true_start<0">
                {{ item.distance_to_true_start }} bp
              </span>
              <v-progress-linear 
                v-if="item.distance_to_true_start<0"
                v-model="item.pos_distance"
                color="blue"
                :max="100000"
                reverse
              ></v-progress-linear>
            </v-col>
            <v-col>
              <span v-if="item.distance_to_true_start>0">
                {{ item.distance_to_true_start }} bp
              </span>
              <v-progress-linear 
                v-if="item.distance_to_true_start>0"
                v-model="item.distance_to_true_start"
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
        <span>
          <v-chip v-if="item.pval !== 'NA'" :color="getColour(item.pval)">
                {{ item.pval }}
              </v-chip>
        </span>
      </template>

      <template v-slot:item.phenostring="{ item }">
        <span>
          <router-link :to="`/phenotypes/${item.phenocode_router}`">{{ item.phenostring }}</router-link>
        </span>
      </template>

      <template v-slot:loading>
        <v-skeleton-loader type="table-row@3"></v-skeleton-loader>
      </template>


    </v-data-table>
  </v-card>

</template>

<script setup>
  import { ref, onMounted, watch} from 'vue';

  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
  const phenotypes = ref([]);
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
    { title: 'Top hit location', value: 'is_in_real_range' },
    { title: 'Top p-value of phenotype in the range', value: 'pval' },
    { title: 'Phenotype', value: 'phenostring' },
    { title: 'Ancestry', value: 'ancestry' },
    { title: 'Sex', value: 'sex' }
  ]);

  const fetchData = async () => {
    // console.log(props.data)
    phenotypes.value = props.data.map(item => ({
        ...item,
        phenocode_router: item.phenocode.split('.').slice(0, 1).join('.') ,
        ancestry: `${item.stratification.ancestry}`, // TODO: don't hardcode these
        sex: `${item.stratification.sex}`,
        pos_distance: -item.distance_to_true_start
      }));
  }

  const getColour = (pval) => {
    if (pval < 5e-8 && pval !== null) return 'green';
    else if (pval === "NA") return null;
    return '#grey';
  };

  onMounted( () => {
    fetchData();
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
      // console.log(`Chosen data updated: ${newValue}`);
      fetchData();
    },
    // { deep: true }
  );
  watch(
    selectedItems,
    (newPhenocode) => {
      // console.log(newPhenocode)
      fetchData();
      emit('updateChosenPheno', selectedItems)
      // if (newPhenocode != []){
      //       emit('updateChosenPheno', selectedItems)
      //     }
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