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
      hide-default-footer>

      <template v-slot:item.phenocode="{ item }">
        <router-link :to="`/phenotypes/${item.phenocode}`">{{ item.phenocode }}</router-link>
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
    data: [],
  });
  const currentPhenocode = ref(props.phenocode) ;

  const headers = ref([
    { title: 'Top p-value in gene', value: 'pval' },
    { title: 'Phenotype', value: 'phenocode' },
    { title: 'Ancestry', value: 'ancestry' },
    { title: 'Sex', value: 'sex' }
  ]);

  onMounted( () => {
    phenotypes.value = props.data.map(item => ({
        ...item,
        phenocode: item.phenocode.split('.').slice(0, 1).join('.') ,
        ancestry: `${item.stratification.ancestry}`, // TODO: don't hardcode these
        sex: `${item.stratification.sex}`,
      }));
  });

  watch(
    () => props.phenocode,
    (newPhenocode) => {
      currentPhenocode.value = newPhenocode;
    }
  );

</script>

<style scoped>
  .v-data-table-header th {
    font-weight: 800;
    font-size: 1.2rem; 
    color: #333; 
  }

</style>

