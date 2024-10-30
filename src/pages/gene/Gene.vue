<template>
  <v-app>
    <Navbar2 />
    <v-main>
      <h2 style="font-weight: bold;">{{geneName}}</h2>
      <div style="margin-top: 2%;">

      </div>
    </v-main>
  </v-app>
</template>

<script setup name="Gene">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import Navbar2 from '../../components/Navbar2.vue';


  const route = useRoute();
  const geneName = route.params.gene;
  console.log(geneName);
  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL;
  const phenocode = route.params.phenocode;


    
</script>

<style>
    
</style>

