<template>
  <v-app-bar app fixed elevation="0" style="width: 100% " >
    <v-row align="center" justify="space-between">
      <!-- <v-row align="center" justify="start" style="margin-left: 1%" class="d-flex, width: 100%;"> -->
        <v-col cols="auto" style="margin-left:2%" class="align-center d-flex">
          <router-link :to="{ name: 'Home' }" tag="v-btn" icon="$vuetify">
                  <img src="@/assets/favicon.svg" alt="Icon" class="custom-icon">
          </router-link>
        </v-col>
        <!-- <v-col cols="auto" style="margin-left:2%" class="width: 150px;">
          <SearchBoxMenu />
        </v-col> -->
      <!-- </v-row> -->
      <v-row align="center" justify="end" style="margin-right:1%">
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text variant="plain" class="custom-btn" :to="{ name: 'Phenotypes' }">Phenotypes</v-btn>
        </v-col>
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text variant="plain" class="custom-btn" :to="{ name: 'Tophits' }">Top Hits</v-btn>
        </v-col>
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text variant="plain" class="custom-btn" @click="toRandom">Random</v-btn>
        </v-col>
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text variant="plain" class="custom-btn" :to="{ name: 'API' }">API</v-btn>
        </v-col>
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text variant="plain" class="custom-btn" :to="{ name: 'Github' }">
            <v-icon>mdi-github</v-icon>
            GitHub
          </v-btn>
        </v-col>
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text variant="plain" class="custom-btn" :to="{ name: 'About' }">About</v-btn>
        </v-col>
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text variant="plain" class="custom-btn" :to="{ name: 'Contact' }">Contact</v-btn>
        </v-col>
        <v-col cols="auto" class="d-flex d-md-none">
          <v-btn icon @click="sheet = true">
            <v-icon>mdi-menu</v-icon>
          </v-btn>

          <v-bottom-sheet v-model="sheet">
            <v-sheet height="100vh">
              <v-toolbar dark color="blue-lighten-3">
                <v-btn icon @click="sheet = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Pages</v-toolbar-title>
              </v-toolbar>

              <v-list class="text-center">
                <v-list-item link :to="{ name: 'Phenotypes' }">
                  <v-list-item-title text variant="plain" class="custom-btn2">Phenotypes</v-list-item-title>
                </v-list-item>
                <v-list-item link :to="{ name: 'Tophits' }">
                  <v-list-item-title text variant="plain" class="custom-btn2">Top Hits</v-list-item-title>
                </v-list-item>
                <v-list-item @click="toRandom">
                  <v-list-item-title text variant="plain" class="custom-btn2">Random</v-list-item-title>
                </v-list-item>
                <v-list-item link :to="{ name: 'API' }">
                  <v-list-item-title text variant="plain" class="custom-btn2">API</v-list-item-title>
                </v-list-item>
                <v-list-item link :to="{ name: 'Github' }">
                  <v-list-item-title text variant="plain" class="custom-btn2">
                    <v-icon>mdi-github</v-icon>
                    GitHub
                  </v-list-item-title>
                </v-list-item>
                <v-list-item link :to="{ name: 'About' }">
                  <v-list-item-title text variant="plain" class="custom-btn2">About</v-list-item-title>
                </v-list-item>
                <v-list-item link :to="{ name: 'Contact' }">
                  <v-list-item-title text variant="plain" class="custom-btn2">Contact Us</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-bottom-sheet>

        </v-col>
      </v-row>
    </v-row>
  </v-app-bar>
</template>

<script setup>
import axios from 'axios';
import {ref, onMounted} from 'vue';
import SearchBoxMenu from './SearchBoxMenu.vue';

const sheet = ref(false);

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const tophits = ref(null)
const hits_to_choose_from = ref([])

onMounted(() => {

  fetchTophits()

})

const fetchTophits = async () => {
  try{
    const response = await axios.get(`${api}/phenotypes/tophits`)

    tophits.value = response.data

    for (var hit of tophits.value){
      if (hit['pval'] < Number("5E-8")){
        hits_to_choose_from.value.push(hit)
      }
    }

  }
  catch (error) {
    console.error("There was an error fetching the sample data:", error);
  }
}

function toRandom() {

  // get tophits
  var random_value = Math.random()

  var hit = hits_to_choose_from.value[Math.floor(Math.random() * hits_to_choose_from.value.length)]

  console.log(hit)
  if (random_value < 0.4) {
    window.location.href = `${window.location.origin}/phenotypes/${hit['phenocode']}`;
  } else if (random_value < 0.8){
    window.location.href = `${window.location.origin}/variant/${hit['chrom']}-${hit['pos']}-${hit['ref']}-${hit['alt']}`;
  } else {
    var offset = Number("50E3")
    window.location.href = `${window.location.origin}/phenotypes/${hit['phenocode']}/region/${hit['chrom']}:${hit['pos']-offset}-${hit['pos']+offset}`;
  }

}
</script>

<style lang="scss" scoped>
.custom-btn {
  font-weight: bold; 
  font-size: 15px;   
  letter-spacing: .3px; 
//   width: 5%; 
}
.custom-icon {
  width: 30px;  
  height: auto; 
}
.v-col {
  margin-left: 1px; 
}
.custom-btn2 {
  font-weight: bold; 
  font-size: 20px;   
  letter-spacing: .3px; 
//   width: 5%; 
}
</style>