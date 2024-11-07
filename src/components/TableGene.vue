<template>
  <v-card
    elevation="0"
    class="mt-4"
  >
    <p>Phenotypes with the most-significant associations for this locus:</p>
    <v-data-table
      :loading="isLoading"
      :headers="headers"
      :items="phenotypes"
      hover
      hide-default-footer
    >
      <template v-slot:item="{ item, index }">
        <tr 
          :class="currentPhenocode === item.phenocode ? 'bg-info' : '' "
          @click="navigateToRegion(item)"
        >
          <td>{{ item.pval }}</td>
          <td>{{ item.phenocode }}</td>
          <td>{{ item.ancestry }}</td>
          <td>{{ item.sex }}</td>
        </tr>
      </template>
      <template v-slot:loading>
        <v-skeleton-loader type="table-row@3"></v-skeleton-loader>
      </template>
    </v-data-table>
  </v-card>

</template>

<script setup>
  import { ref, onMounted, watch} from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';

  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
  const phenotypes = ref([]);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const router = useRouter();
  const props = defineProps({
    geneName: String,
    phenocode: String,
  });
  const currentPhenocode = ref(props.phenocode) ;


  const region = ref(null);

  const headers = ref([
    { title: 'Top p-value in gene', value: 'pval' },
    { title: 'Phenotype', value: 'phenocode' },
    { title: 'Ancestry', value: 'ancestry' },
    { title: 'Sex', value: 'sex' }
    // { title: 'test', value: 'phenocodeFull'}
  ]);

  const fetchData = async () => {
    isLoading.value = true;
    try{
      const response = await axios.get(`${api}/gene/${props.geneName}`);

      // The response should have the phenocode, and region so we 
      region.value = response.data.data.region

      // TODO: drop region so it doesn't appear in the table?


      phenotypes.value = response.data.data.map(item => ({
        ...item,
        phenocode: item.phenocode.split('.').slice(0, 1).join('.') ,
        ancestry: `${item.stratification.ancestry}`,
        sex: `${item.stratification.sex}`,
      })); //replace phenostring with actual phenotype string
    } catch (error) {
      console.error("There was an error fetching the sample data:", error);
      errorMessage.value = "Failed to load data. Please try again later.";
    } finally {
      isLoading.value = false;
    }
  };

  function navigateToRegion(item) {
    //TODO: fix item.region
    router.push(`/phenotypes/${item.phenocode}/region/${region.value}`);
  };

  onMounted( () => {
    fetchData();
  });

  watch(
    () => props.phenocode,
    (newPhenocode) => {
      console.log('Updated phenocode:', newPhenocode);
      currentPhenocode.value = newPhenocode;
      // fetchData();
    }
  );

</script>

<style scoped>
  .v-data-table-header th {
    font-weight: 800; /* Use 700 or 800 for extra bold */
    font-size: 1.2rem; /* Increase font size slightly */
    color: #333; /* Optionally, set a darker color for contrast */
  }

  /* Target the table rows */
  .v-data-table tbody tr:nth-child(odd) {
    background-color: #f9f9f9; /* Light grey for odd rows */
  }
  .v-data-table tbody tr:nth-child(even) {
    background-color: #ffffff; /* White for even rows */
  }
</style>

