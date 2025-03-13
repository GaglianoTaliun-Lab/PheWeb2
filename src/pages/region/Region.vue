<script setup name="Region">
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import '@fortawesome/fontawesome-free/css/all.css';

import Navbar from '../../components/Navbar.vue';
import LocusZoomRegion from '../../components/LocusZoomRegion.vue'

import * as functions from './Region.js';

const route = useRoute();
const phenocode = route.params.phenocode;
const region = route.params.region;
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const phenostring = ref(null);
const info = ref(null)

const allPlottingData = ref({})

onMounted(async () => {
    try {
      const response = await axios.get(`${api}/phenotypes/${phenocode}/phenotypes_list`);

      info.value = response.data;
      phenostring.value = info.value[0].phenostring

    }
    catch (error) {
      console.log(error);
    }
})

</script>

<template>
    
    <v-app>
        <Navbar />
        <v-main class="pt-10">
            <h1 v-if="phenostring">{{phenocode}}: {{phenostring}}</h1>
            <h1 v-else>{{phenocode}}</h1>

            <div class="row">
                <div v-if="info" class="col-xs-12">
                    <!-- Unlike pheno, pass in all the data at once in order to ensure that the plots are linked. -->
                    <LocusZoomRegion :data="info"></LocusZoomRegion>
                </div>
            </div>
        </v-main>
    </v-app>
    
</template>

<style lang="scss" scoped>

</style>