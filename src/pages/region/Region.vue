<script setup name="Region">
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import '@fortawesome/fontawesome-free/css/all.css';

import Navbar from '@/components/Navbar.vue';
import LocusZoomRegion from '@/components/LocusZoomRegion.vue'

import { stratificationsToLabel, keyToLabel } from './Region.js';

const route = useRoute();
const phenocode = route.params.phenocode;
const region = route.params.region;
const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const phenostring = ref(null);
const info = ref(null)
const refreshKey = ref(0)

const chosenPlottingData = ref({})
const stratification_list = ref(null);
const selectedStratifications = ref([])

onMounted(async () => {
    try {
      const response = await axios.get(`${api}/phenotypes/${phenocode}/phenotypes_list`);
      const response_stratification = await axios.get(`${api}/variant/stratification_list`);

      stratification_list.value = response_stratification.data.sort((a, b) => a.localeCompare(b));
      selectedStratifications.value = [...stratification_list.value];

      info.value = response.data;
      phenostring.value = info.value[0].phenostring;

      onDisplayChoiceChange();
    }
    catch (error) {
      console.log(error);
    }
})

function onDisplayChoiceChange() {
  chosenPlottingData.value = selectedStratifications.value
    .map(strat => {
      return info.value.find(i =>
        stratificationsToLabel(i.stratification) === strat
      );
    })
    .filter(Boolean);
  refreshKey.value += 1;
}

//uncheck removed panel from list
function handlePanelRemoval(panelPhenocode){

  selectedStratifications.value = selectedStratifications.value.filter(strat => strat !== panelPhenocode.substring(panelPhenocode.indexOf('.') + 1))

}
</script>

<template>
    
    <v-app>
        <Navbar />
        <v-main class="pt-10">
            <h1 v-if="phenostring">{{phenocode}}: {{phenostring}}</h1>
            <h1 v-else>{{phenocode}}</h1>



            <div class="d-flex align-items-center col-12 mt-1 mb-3">    
              <div class="dropdown pt-1 pr-2" id="dropdown-data1">
                <button :disabled="isDisabled" class="btn btn-primary btn-drop" id="button-data1">
                  Select stratifications <span class="arrow-container"><span class="arrow-down"></span></span>
                </button>
                <div class="dropdown-menu" id="dropdown-content-data1">
                  <label 
                    v-for="strat in stratification_list" 
                    :key="strat"
                    class="d-flex justify-content-between align-items-center mb-1" 
                    style="width: 100%;"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <input 
                        type="checkbox" 
                        :value="strat" 
                        v-model="selectedStratifications"
                        @change="onDisplayChoiceChange"
                      >
                      {{ keyToLabel(strat) }}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="row">
                <div v-if="info" class="col-xs-12">
                    <!-- Unlike pheno, pass in all the data at once in order to ensure that the plots are linked. -->
                    <LocusZoomRegion :key="refreshKey" :data="chosenPlottingData" @panelRemoved="handlePanelRemoval"></LocusZoomRegion>
                </div>
            </div>
        </v-main>
    </v-app>
    
</template>

<style lang="scss" scoped>
.arrow-container {
    float: left;
    margin-right: 10px;
    margin-bottom: 0px;
    padding-top:3px
  }
  
  .arrow-up, .arrow-down {
    display: block;
    padding: 3px;
    margin-left: 0px;
    margin-right: 0px;
  }
  .arrow-down {
    border: solid black;
    border-width: 0px 2px 2px 0px;
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
  }
  
  .arrow-container:hover {
    cursor: pointer;
    background-color: grey;
  }
  
  .custom-checkbox {
    width: 20px;
    height: 20px; 
    cursor: pointer; 
  }
  
  .pheno-info {
    align-items:center;
  }
  
  .display-choice {
    position: relative;
    display: inline-block;
  }
  
  .dropdown {
    position: relative;
    display: inline-block;
  }
  .dropdown-menu {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 225px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 12px 16px;
    z-index: 5;
  }
  
  .dropdown-menu-right {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 200px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 12px 16px;
    z-index: 1;
    text-align: right; 
    right: 0; 
  }
  
  .dropdown-menu label {
    display: block;
  }
  
  .dropdown-menu-right a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    font-weight:bold;
  }
  
  .dropdown:hover .dropdown-menu {
    display: block;
    z-index: 5;
  } 
  
  .dropdown:hover .dropdown-menu-right {
    display: block;
  }
  
  .dropdown-menu-right a:hover {
    background-color: #ddd;
  }

  .btn-drop:disabled {
    background-color: #ccc; 
    cursor: not-allowed; 
    opacity: 0.6; 
  }
  
  .btn-drop:disabled + .dropdown-menu {
    display: none !important;
    pointer-events: none;
    visibility: hidden;
  }
  
  
  .btn-drop:disabled:hover {
    background-color: #ccc; 
  }
  
  .btn-primary {
    color: black;
    background-color: lightgrey;
    border: lightgrey;
  }
  
  .btn-primary:hover {
    background-color: darkgrey !important;
    color: black;
  }

  .drag-handle {
    padding-left: 8px;
    color: #555;
  }
  
</style>