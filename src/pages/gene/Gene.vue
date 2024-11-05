<template>
  <v-app>
    <Navbar2 />
    <v-main>
      <h2 style="font-weight: bold;">{{geneName}}</h2>
      <div>
        <TableGene 
          :geneName="geneName"
          :phenocode="phenocode"
        />
      </div>
    </v-main>
  </v-app>
</template>

<script setup name="Gene">
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import Navbar2 from '../../components/Navbar2.vue';
  import TableGene from '../../components/TableGene.vue';


  const route = useRoute();
  const geneName = route.params.gene;
  console.log(geneName);
  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;
  // const phenocode = route.params.phenocode;
  const phenocode = computed(
    () => route.params.phenocode
  );


    
</script>

<style>
    
</style>

