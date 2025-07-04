
<template>
  <v-app>
      <Navbar2 />
      <v-main class="responsive-main">
          <div>
            <h1 v-if="phenostring">{{phenocode}}: {{phenostring}}</h1>
            <h1 v-else>{{phenocode}}</h1>
            <!-- <v-progress-linear
              v-if="isLoading"
              indeterminate
              color="primary"
              height="5"
            ></v-progress-linear> -->
            <div class="links m-1 d-flex justify-space-between align-center text-center">
              
              <div class="d-none d-md-flex">
                  <div v-if="Object.keys(allInteractionPlottingData).length > 0">
                    <v-chip
                      size="x-large"
                      label
                      :color="isInteractionChecked ? 'primary' : 'default'"
                      filter
                      :filter-icon="isInteractionChecked ? 'mdi-check' : ''"
                      @click="isInteractionChecked = !isInteractionChecked; onInteractionCheckboxChange()"
                    >
                      Show Genotypes x Sex Interaction Results
                    </v-chip>
                  </div>
              </div>
              <div class="data-portal d-flex d-md-none justify-center align-center text-center">
                <div v-if="Object.keys(allInteractionPlottingData).length > 0">
                    <v-chip
                    size="x-large"
                    label
                    :color="isInteractionChecked ? 'primary' : 'default'"
                    filter
                    :filter-icon="isInteractionChecked ? 'mdi-check' : ''"
                    @click="isInteractionChecked = !isInteractionChecked; onInteractionCheckboxChange()"
                  >
                  Show Interaction
                  </v-chip>
                </div>
              </div>
              <div class="data-portal d-none d-md-flex">
                <a  v-if="linkUrl" :href="linkUrl" target="_blank" rel="noopener noreferrer"><u><b>Data Preview Portal</b></u> <i class="fas fa-external-link-alt"></i></a>
              </div>
              <div class="data-portal d-flex d-md-none justify-center align-center text-center">
                <a  v-if="linkUrl" :href="linkUrl" target="_blank" rel="noopener noreferrer"><u><b></b></u> <v-icon>mdi-printer-eye</v-icon></a>
              </div>
            </div>

          </div>


          <div v-if="!isInteractionChecked" class="non-interaction">
            <div class="pheno-info col-12 d-flex justify-left align-center text-center mt-0">
              <div class="dropdown p-1" id="dropdown-data1">
                  <button class="btn btn-primary btn-drop" id="button-data1">{{keyToLabel(selectedStratification1)+ " (" + sampleSizeLabel[selectedStratification1] + ")"}}<span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <div class="dropdown-menu" id="dropdown-content-data1">
                      <label v-for="(pheno, index) in info">
                          <input 
                          type="radio" 
                          :value="pheno.phenocode + returnExtraInfoString(pheno)" 
                          :name="pheno.phenocode + '1'" 
                          v-model="selectedStratification1"
                          @change="handleRadioChange">
                          {{ returnExtraInfoLabel(pheno).replace(/\b\w/g, l => l.toUpperCase()) + " (" + sampleSizeLabel[pheno.phenocode + returnExtraInfoString(pheno)] + ")"}} 
                      </label> 
                  </div>
                </div>
                <div class="dropdown p-1" id="dropdown-data2">
                  <button v-if="selectedStratification2 == 'No stratification'" class="btn btn-primary btn-drop" id="button-data2"> No stratification <span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <button v-else class="btn btn-primary btn-drop" id="button-data2"> {{keyToLabel(selectedStratification2) + " (" + sampleSizeLabel[selectedStratification2] + ")"}} <span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <div class="dropdown-menu" id="dropdown-content-data2">
                      <label v-for="(pheno, index) in info" >
                          <input 
                          type="radio" 
                          :value="pheno.phenocode + returnExtraInfoString(pheno)" 
                          :name="pheno.phenocode + '2'"
                          v-model="selectedStratification2"
                          @change="handleRadioChange"> 
                          {{ returnExtraInfoLabel(pheno).replace(/\b\w/g, l => l.toUpperCase()) + " (" + sampleSizeLabel[pheno.phenocode + returnExtraInfoString(pheno)] + ")" }} 
                      </label>
                      <label v-if="info">
                          <input type="radio" value="No stratification" :name="info[0].phenocode + '2'" v-model="selectedStratification2" @change="handleRadioChange"> No stratification
                      </label>
                  </div>
                </div>

                <div class="dropdown p-1 float-right" style="margin-left: auto;" id="dropdown-sumstats">
                  <div>
                    <button v-if="isLargeScreen" class="btn btn-primary btn-drop">
                      Download Summary Statistics
                      <span class="arrow-container"><span class="arrow-down"></span></span>
                    </button>

                    <button v-else class="btn btn-primary btn-drop">
                      <v-icon>mdi-download</v-icon>
                    </button>
                  </div>
                  <!-- <button class="btn btn-primary btn-drop d-none d-md-flex">  Download Summary Statistics  <span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <button class="btn btn-primary btn-drop d-flex d-md-none"><v-icon>mdi-download</v-icon></button> -->
                  <div class="dropdown-menu dropdown-menu-right p-1" id="dropdown-content-sumstats">
                    <button class="sec-button btn w-100 mt-1 mb-1"  id="download-all-button" @click="downloadAll">Download All</button>
                    <button class="sec-button btn w-100 mt-1 mb-1"  id="download-current-button" @click="downloadCurrent">Download Plotted Variants</button>
                  </div>
                </div>
          </div> 

          <IsLoading v-if="isLoading" :loadingText="loadingText" />
          <IsFailing v-if="isFailedPlotting" :isLoading="isLoading" :isFailed="isFailedPlotting" />
          
          <div v-if="miamiToggle && Object.keys(miamiData).length > 0 && !isFailedPlotting">
              <MiamiPlot :key="refreshKey" :data="miamiData" :hoverVariant="hoverVariant" @updateFilteringParams="updateFilteringParameters" @updateChosenVariant="updateChosenVariantMehod"/>
            </div>
          <div v-else-if="!miamiToggle && Object.keys(manhattanData).length > 0 && !isFailedPlotting">
              <ManhattanPlot :key="refreshKey" :data="manhattanData" :hoverVariant="hoverVariant"  @updateFilteringParams="updateFilteringParameters" @updateChosenVariant="updateChosenVariantMehod"/>
            </div>
          
          <br>
          <div v-if="!isInteractionChecked">
            <GWASTable
              :isInteractionChecked="isInteractionChecked"
              :selectedStratification1= "selectedStratification1"
              :selectedStratification2= "selectedStratification2"
              :phenocode= "phenocode"
              :minFreq="minFreq"
              :maxFreq="maxFreq"
              :selectedType= "selectedType"
              :chosenVariant="chosenVariant"
              @updateHoverVariant="updateHoverVariantMethod"
            />
          </div>
          
          <IsLoading v-if="isLoading" :loadingText="loadingTextQQ" />
          <IsFailing v-if="isFailedPlotting" :isLoading="isLoading" :isFailed="isFailedPlotting" />
          <div v-if="qqData && dimension" class="mt-10 mb-5"> 

            <!-- <h2> QQ Plot(s): </h2> -->
            <v-row align="start" justify="start" no-gutters>
              <v-col 
                v-for="qq in Object.keys(qqSubset)" 
                :key="qq + qqRefreshKey"
                cols="12" 
                sm="6" 
                lg="3"
                class="qq-col d-flex justify-left"
              >
                <div class="qq-plot-wrapper">
                  <p class="qq-title">{{ qq.split(".").slice(1).join(", ").replace(/\b\w/g, l => l.toUpperCase()) }}</p>
                  <QQPlot :data="{
                      qq : qqSubset[qq],
                      dimensions : dimension
                  }" /> 
                </div>
              </v-col>
            </v-row>
          </div>
          </div>
          <div v-else class="interaction">
            <div class="pheno-info col-12 mt-0">
                <div class="dropdown p-1" id="dropdown-data1">
                  <button class="btn btn-primary btn-drop" id="button-data1">{{keyToLabel(selectedInteractionStratification1).replace(/\b\w/g, l => l.toUpperCase()) + " (" + sampleSizeInteractionLabel[selectedInteractionStratification1] + ")"}}<span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <div class="dropdown-menu" id="dropdown-content-data1">
                      <label v-for="(pheno, index) in infoInteraction">
                          <input 
                          :checked="index === 1" 
                          type="radio" 
                          :value="pheno.phenocode + returnExtraInfoString(pheno)" 
                          :name="pheno.phenocode + '1'" 
                          v-model="selectedInteractionStratification1"
                          @change="handleInteractionRadioChange">
                          {{ returnExtraInfoLabel(pheno).replace(/\b\w/g, l => l.toUpperCase()) + " (" + sampleSizeInteractionLabel[pheno.phenocode + returnExtraInfoString(pheno)] + ")"}} 
                      </label> 
                  </div>
                </div>
                <div class="dropdown p-1" id="dropdown-data2">
                  <button v-if="selectedInteractionStratification2 == 'No stratification'" class="btn btn-primary btn-drop" id="button-data2"> No stratification <span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <button v-else class="btn btn-primary btn-drop" id="button-data2"> {{keyToLabel(selectedInteractionStratification2).replace(/\b\w/g, l => l.toUpperCase()) + " (" + sampleSizeInteractionLabel[selectedInteractionStratification2] + ")"}} <span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <div class="dropdown-menu" id="dropdown-content-data2">
                      <label v-for="(pheno, index) in infoInteraction" >
                          <input 
                          :checked="index === 2" 
                          type="radio" 
                          :value="pheno.phenocode + returnExtraInfoString(pheno)" 
                          :name="pheno.phenocode + '2'"
                          v-model="selectedInteractionStratification2"
                          @change="handleInteractionRadioChange"> 
                          {{ returnExtraInfoLabel(pheno).replace(/\b\w/g, l => l.toUpperCase()) + " (" + sampleSizeInteractionLabel[pheno.phenocode + returnExtraInfoString(pheno)] + ")" }} 
                      </label>
                      <label v-if="infoInteraction">
                          <input type="radio" value="No stratification" :name="infoInteraction[0].phenocode + '2'" v-model="selectedInteractionStratification2" @change="handleInteractionRadioChange"> No stratification
                      </label>
                  </div>
                </div>

                <div class="dropdown p-1 float-right" id="dropdown-sumstats">
                  <button class="btn btn-primary btn-drop">  Download Summary Statistics  <span class="arrow-container"><span class="arrow-down"></span></span></button>
                  <div class="dropdown-menu dropdown-menu-right p-1" id="dropdown-content-sumstats">
                    <button class="sec-button w-100 mt-1 mb-1"  id="download-all-button" @click="downloadAll">Download All</button>
                    <button class="sec-button w-100 mt-1 mb-1"  id="download-current-button" @click="downloadCurrent">Download Plotted Variants</button>
                  </div>
                </div>
          </div> 
          <div v-if="miamiInteractionToggle && Object.keys(miamiInteractionData).length > 0">
              <InteractionMiamiPlot :key="refreshKey" :data="miamiInteractionData" :hoverVariant="hoverVariant" @updateChosenVariant="updateChosenVariantMehod"/>
              <InteractionTable 
                :selectedStratification1= "selectedInteractionStratification1"
                :selectedStratification2= "selectedInteractionStratification2"
                :phenocode= "phenocode"
                :minFreq="minFreq"
                :maxFreq="maxFreq"
                :selectedType= "selectedType"
                :miamiData="miamiInteractionData"
                :chosenVariant="chosenVariant"
                @updateHoverVariant="updateHoverVariantMethod"
              />
          </div>
          <div v-else-if="!miamiInteractionToggle && Object.keys(manhattanInteractionData).length > 0">
              <InteractionManhattanPlot :key="refreshKey" :data="manhattanInteractionData" :hoverVariant="hoverVariant" @updateChosenVariant="updateChosenVariantMehod"/>
              <InteractionTable 
                :selectedStratification1= "selectedInteractionStratification1"
                :selectedStratification2= "selectedInteractionStratification2"
                :phenocode= "phenocode"
                :minFreq="minFreq"
                :maxFreq="maxFreq"
                :selectedType= "selectedType"
                :miamiData="manhattanInteractionData"
                :chosenVariant="chosenVariant"
                @updateHoverVariant="updateHoverVariantMethod"
              />
          </div>

            <div v-if="qqInteractionData && dimensionInteraction" class="mt-10 mb-5"> 

                <!-- <h2> QQ Plot(s): </h2> -->
                <v-row align="start" justify="start" no-gutters>
                  <v-col 
                    v-for="qq in Object.keys(qqInteractionSubset)" 
                    :key="qq + qqRefreshKey"
                    cols="12" 
                    sm="6" 
                    lg="3"
                    class="qq-col d-flex justify-left"
                  >
                    <div class="qq-plot-wrapper">
                      <p class="qq-title">{{ qq.split(".").slice(1).join(", ").replace(/\b\w/g, l => l.toUpperCase()) }}</p>
                      <QQPlot :data="{
                          qq : qqInteractionSubset[qq],
                          dimensions : dimensionInteraction
                      }" /> 
                    </div>
                  </v-col>
                </v-row>
            </div>
          </div>
      </v-main>
  </v-app>
</template>

<script setup name="Pheno">

import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import '@fortawesome/fontawesome-free/css/all.css';
import {isEqual} from 'lodash';

import Navbar2 from '@/components/Navbar.vue';
import ManhattanPlot from '@/components/ManhattanPlot.vue';
import MiamiPlot from '@/components/MiamiPlot.vue';
import QQPlot from '@/components/QQPlot.vue';
import GWASTable from '@/components/GWASTable.vue';
import InteractionManhattanPlot from '@/components/InteractionManhattanPlot.vue'
import InteractionMiamiPlot from '@/components/InteractionMiamiPlot.vue'
import InteractionTable from '@/components/InteractionTable.vue';
import IsFailing from '@/components/IsFailing.vue';
import IsLoading from '@/components/IsLoading.vue';

import * as functions from './Pheno.js';

const route = useRoute();

const phenocode = route.params.phenocode;
const url_query = route.query;
const phenostring = ref(null);

const info = ref(null);
const infoInteraction = ref(null)
const linkUrl = ref(null)

const qqData = ref({});
const qqSubset = ref({});

const qqInteractionData = ref({});
const qqInteractionSubset = ref({});

const dimension = ref([0,0]);
const dimensionInteraction = ref([0,0])

const refreshKey = ref(0)
const qqRefreshKey = ref(0)

const allPlottingData = ref({})
const allInteractionPlottingData = ref({})

const miamiData = ref({});
const manhattanData = ref({});
const miamiInteractionData = ref({})
const manhattanInteractionData = ref({})

const selectedStratification1 = ref('');
const selectedStratification2 = ref('');

const selectedInteractionStratification1 = ref('')
const selectedInteractionStratification2 = ref('')

// Filtering information from child components
const minFreq = ref(0);
const maxFreq = ref(0.5);
const selectedType = ref('Both');

const sampleSizeLabel = ref({})
const sampleSizeInteractionLabel = ref({})

const miamiToggle = ref(true);
const miamiInteractionToggle = ref(false)

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const chosenVariant = ref('');

const isInteractionChecked = ref(false);

const hoverVariant = ref([])
const updateHoverVariantMethod = (variant) => {
  hoverVariant.value = variant.value;
};

const isLoading = ref(false);
const isFailedPlotting = ref(false);
const isFailedInteractionPlotting = ref(false);
const loadingText = ref('Loading Miami / Manhattan plot... please wait');
const loadingTextQQ = ref('Loading QQ plot... please wait');

onMounted(async () => {
    try {
      // const response = await axios.get(`${api}/phenotypes/phenotypes_list/` + phenocode);
      // const responseInteraction = await axios.get(`${api}/phenotypes/interaction_list/` + phenocode);
      isLoading.value = true;
      const response = await axios.get(`${api}/phenotypes/${phenocode}/phenotypes_list`);

      let responseInteraction = {};
      try {
        responseInteraction = await axios.get(`${api}/phenotypes/${phenocode}/interaction_list`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn(`Interaction list not found for ${phenocode}`);
          responseInteraction.data = [];
          isFailedInteractionPlotting.value = true;
        } else {
          console.error("Unexpected error:", error);
          isFailedInteractionPlotting.value = true;
          throw error; // rethrow if it's not a 404
        }
      }

      info.value = response.data;

      //logic for choosing first two stratifications displayed on load
      // TODO: could likely improve speed here
      var strats = chooseDefaultPhenos(info.value, url_query)

      selectedStratification1.value = strats[0].phenocode +returnExtraInfoString(strats[0])
      selectedStratification2.value = strats[1] ? strats[1].phenocode + returnExtraInfoString(strats[1]): "No stratification"


      // just take the first instance...they will all be the same
      phenostring.value = info.value[0].phenostring

      for (let i = 0; i < info.value.length; i++) {
        const phenocode = info.value[i].phenocode;
        const extraInfo = returnExtraInfoString(info.value[i]);
        
        await generateQQs(phenocode, extraInfo);
        await fetchPlottingData(phenocode, extraInfo);

        // set sample size labels (case controls, etc.) for future use
        info.value.forEach(pheno => {
          const key = pheno.phenocode + returnExtraInfoString(pheno);
          if (pheno.num_cases !== "" && pheno.num_controls !== "") {
            sampleSizeLabel.value[key] = `${new Intl.NumberFormat('en-US').format( pheno.num_cases )} cases, ${new Intl.NumberFormat('en-US').format( pheno.num_controls )} controls`;
          } else {
            sampleSizeLabel.value[key] = `${new Intl.NumberFormat('en-US').format( pheno.num_samples )} samples`;
          }
        });
      }

      dimension.value = calculate_qq_dimension(qqData.value);

      // interaction processing
      // console.log(responseInteraction)
      
      infoInteraction.value = responseInteraction.data;

      if (infoInteraction.value.length > 0) {
        for (let i = 0; i < infoInteraction.value.length; i++) {
          const phenocode = infoInteraction.value[i].phenocode;
          const extraInfo = returnExtraInfoString(infoInteraction.value[i]);
          
          await generateInteractionQQs(phenocode, extraInfo);
          await fetchInteractionPlottingData(phenocode, extraInfo);
        }
        dimensionInteraction.value = calculate_qq_dimension(qqInteractionData.value);

        infoInteraction.value.forEach(pheno => {
          const key = pheno.phenocode + returnExtraInfoString(pheno);
          if (pheno.num_cases !== "" && pheno.num_controls !== "") {
            sampleSizeInteractionLabel.value[key] = `${new Intl.NumberFormat('en-US').format( pheno.num_cases )} cases, ${new Intl.NumberFormat('en-US').format( pheno.num_controls )} controls`;
          } else {
            sampleSizeInteractionLabel.value[key] = `${new Intl.NumberFormat('en-US').format( pheno.num_samples )} samples`;
          }
        });

      }

      populateDataPreview(phenocode)
      
      
      // call plotting function to populate plot
      handleRadioChange(); 
    }
    catch (error) {
      console.log(error);
      isFailedPlotting.value = true;
    }
    finally {
      isLoading.value = false; // Stop loading
    }
});

function updateFilteringParameters({ min, max, type}) {

      minFreq.value = min;
      maxFreq.value = max;
      selectedType.value = type;

}

function chooseDefaultPhenos(data, from_url = {}){

  if (!data[0].stratification){
      return ['', null]  
  }

  var chosen_stratifications = [];

  // if stratifications are passed from url it will adjust here
  if (Object.keys(from_url).length !== 0){
    chosen_stratifications.push(from_url)
  }

  var all_stratifications = data.map(pheno => {
    return pheno.stratification
  })

  if (all_stratifications.length == 1){
    return [data[0], null];
  }

  if (all_stratifications.length == 2){
    return [data[0], data[1]];
  }

  if (!all_stratifications[0].sex){
    return [data[0], data[1]];
  }

  var male = null;
  var female = null;

  for (var item of all_stratifications){

    if ('female' === item.sex.toLowerCase()){
      female = item;
    }
    else if ('male' === item.sex.toLowerCase()){
      male = item;
    }
  }

  if (female != null && isEqual(from_url, female) === false){
    chosen_stratifications.push(female);
  }
  if (male != null){
    chosen_stratifications.push(male);
  }

  while (chosen_stratifications.length < 2 ){
    chosen_stratifications.push(null)
  }

  // return phenos with those exact stratification
  return returnPhenoFromStratifications(data, chosen_stratifications)
}

// niche helper function for above
const returnPhenoFromStratifications = (data, chosen_stratifications) => {
  var chosen_phenos = [null, null]

  for (var pheno of data){
    if (JSON.stringify(pheno.stratification) === JSON.stringify(chosen_stratifications[0])){
      chosen_phenos[0] = pheno
    } else if (JSON.stringify(pheno.stratification) === JSON.stringify(chosen_stratifications[1])){
      chosen_phenos[1] = pheno
    }
  }

  return chosen_phenos

}

// this function will just change a value that determins if a manhattan or miami plot is generated
const handleRadioChange = () => {
  if (selectedStratification2.value === "No stratification" || selectedStratification1.value === selectedStratification2.value){
    manhattanData.value = {}
    miamiToggle.value = false;
    manhattanData.value[selectedStratification1.value] = allPlottingData.value[selectedStratification1.value];

    // console.log(allPlottingData.value[selectedStratification1.value])
    qqSubset.value = {};
    qqSubset.value[selectedStratification1.value] = qqData.value[selectedStratification1.value];
  } else {
    miamiToggle.value = true;
    miamiData.value = {}

    miamiData.value[selectedStratification1.value] = allPlottingData.value[selectedStratification1.value];
    miamiData.value[selectedStratification2.value] = allPlottingData.value[selectedStratification2.value];
    

    qqSubset.value = {};
    qqSubset.value[selectedStratification1.value] = qqData.value[selectedStratification1.value];
    qqSubset.value[selectedStratification2.value] = qqData.value[selectedStratification2.value];

  }

  refreshKey.value += 1;
  qqRefreshKey.value += 1;
};

const handleInteractionRadioChange = () => {
  if (selectedInteractionStratification2.value === "No stratification" || selectedInteractionStratification1.value === selectedInteractionStratification2.value){
    manhattanInteractionData.value = {}
    miamiInteractionToggle.value = false;
    manhattanInteractionData.value[selectedInteractionStratification1.value] = allInteractionPlottingData.value[selectedInteractionStratification1.value];

    qqInteractionSubset.value = {};
    qqInteractionSubset.value[selectedInteractionStratification1.value] = qqInteractionData.value[selectedInteractionStratification1.value];
  } else {
    miamiInteractionToggle.value = true;
    miamiInteractionData.value = {}

    miamiInteractionData.value[selectedInteractionStratification1.value] = allInteractionPlottingData.value[selectedInteractionStratification1.value];
    miamiInteractionData.value[selectedInteractionStratification2.value] = allInteractionPlottingData.value[selectedInteractionStratification2.value];

    qqInteractionSubset.value = {};
    qqInteractionSubset.value[selectedInteractionStratification1.value] = qqInteractionData.value[selectedInteractionStratification1.value];
    qqInteractionSubset.value[selectedInteractionStratification2.value] = qqInteractionData.value[selectedInteractionStratification2.value];

  }

  refreshKey.value += 1;
  qqRefreshKey.value += 1;
};

function returnExtraInfoString(pheno) {
  let extraInfoString = "";

  if (pheno.interaction !== null && pheno.interaction !== undefined) {
    extraInfoString += ".interaction-" + pheno.interaction;
  }

  if (pheno.stratification !== null && pheno.stratification !== undefined && typeof pheno.stratification === "object") {
    extraInfoString += "." + Object.values(pheno.stratification).join(".");
  }

  return extraInfoString;
}

function returnExtraInfoLabel(pheno) {
  let extraInfoLabel = "";

  if (pheno.interaction) {
    extraInfoLabel += "Interaction: " + pheno.interaction + ", ";
  }

  if (pheno.stratification && typeof pheno.stratification === "object") {
    extraInfoLabel += Object.values(pheno.stratification).join(", ");
  }

  return extraInfoLabel.replace(/\b\w/g, l => l.toUpperCase());
}


const downloadAll = () => {
  var downloads = []

  for (const pheno of info.value) {
    var phenocode = pheno.phenocode + returnExtraInfoString(pheno);
    var api_link = `${api}/phenotypes/${pheno.phenocode}/${returnExtraInfoString(pheno)}/download`;
    downloads.push({ url: api_link, filename: phenocode });
  }

  for (const pheno of infoInteraction.value) {
    var phenocode = pheno.phenocode + returnExtraInfoString(pheno);
    var api_link = `${api}/phenotypes/${pheno.phenocode}/${returnExtraInfoString(pheno)}/download`;
    downloads.push({ url: api_link, filename: phenocode });
  }

  // Open one download at a time with a slight delay
  let index = 0;
  function openNextDownload() {
    if (index < downloads.length) {
      const file = downloads[index];
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.filename;
      a.target = '_blank'; // Open in a new tab
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      index++;
      setTimeout(openNextDownload, 500); // Delay before opening the next one
    } else {
      console.log('All downloads have been triggered.');
    }
  }

  openNextDownload(); // Start the process
};

const downloadCurrent = async () => {
    const downloads = [];

    const buildUrl = (phenocode, suffix, interactionChecked) => {
        const base = `${api}/phenotypes/${phenocode}/${suffix}/download?`;
        const params = [
            `min_maf=${minFreq.value}`,
            `max_maf=${maxFreq.value}`,
        ];

        const snpIndelValue = selectedType.value;
        if (snpIndelValue === 'SNP' || snpIndelValue === 'Indel') {
            params.push(`indel=${snpIndelValue === 'Indel' ? 'true' : 'false'}`);
        }

        return base + params.join('&');
    };

    const addDownload = (codeValue, stratificationKey) => {
        if (codeValue !== "No stratification") {
            const code = codeValue.split(".");
            const phenocode = code[0];
            const suffix = "." + code.slice(1).join('.');
            const url = buildUrl(phenocode, suffix, stratificationKey === 'interaction');
            downloads.push({ url, filename: `${phenocode}${suffix}.tsv` });
        }
    };

    if (!isInteractionChecked.value) {
        addDownload(selectedStratification1.value, 'nonInteraction');
        addDownload(selectedStratification2.value, 'nonInteraction');
    } else {
        addDownload(selectedInteractionStratification1.value, 'interaction');
        addDownload(selectedInteractionStratification2.value, 'interaction');
    }

  let index = 0;
  function openNextDownload() {
    if (index < downloads.length) {
      const file = downloads[index];
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.filename;
      a.target = '_blank'; // Open in a new tab
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      index++;
      setTimeout(openNextDownload, 500); // Delay before opening the next one
    } else {
      console.log('All downloads have been triggered.');
    }
  }

  openNextDownload(); // Start the process
};


const populateDataPreview = () => {
  try {
    var link = "https://datapreview.clsa-elcv.ca/mica/variable/com%3A"+phenocode+"%3ACollected#/"
    // just checking if it's working
    //axios.get(link);
    linkUrl.value = link;
  }
  catch {
    console.log('Data preview portal is not reachable.');
  }
}

const keyToLabel = (phenoLabel) => {
  return functions.keyToLabel(phenoLabel);
}


function calculate_qq_dimension(combined_data){

  var height = 0
  var width = 0
  var dimensions = [height, width]

  for (var qqData of Object.keys(combined_data)){
      combined_data[qqData].by_maf.forEach(function(data){

          //the last one will always be the one to increase the figure size
          var max_height = data.qq.bins[data.qq.bins.length - 1][1]
          var max_width = data.qq.bins[data.qq.bins.length - 1][0]

          if (dimensions[0] < max_height)
              dimensions[0] = max_height;

          if (dimensions[1] < max_width)
              dimensions[1] = max_width;
      });

  }

  return dimensions
}

//TODO: change extraInfo to stratification

async function generateQQs(phenocode, extraInfo){

  try {
      const response = await axios.get(`${api}/phenotypes/${phenocode}/${extraInfo}/qq`);
      qqData.value[phenocode + extraInfo] = response.data;
  } catch (error) {
      console.log(`Error fetching QQ data for ${phenocode}:`, error);
  }
}

async function generateInteractionQQs(phenocode, extraInfo){

    try {
        const response = await axios.get(`${api}/phenotypes/${phenocode}/${extraInfo}/qq`);
        qqInteractionData.value[phenocode + extraInfo] = response.data;
    } catch (error) {
        console.log(`Error fetching QQ data for ${phenocode}:`, error);
    }
}

async function fetchPlottingData(phenocode, extraInfo){

  try {
    const response = await axios.get(`${api}/phenotypes/${phenocode}/${extraInfo}/manhattan`);
    allPlottingData.value[phenocode + extraInfo] = response.data ; 
  } catch (error) {
      console.log(`Error fetching plotting data for ${phenocode}:`, error);
      isFailedPlotting.value = true;
  }

}

async function fetchInteractionPlottingData(phenocode, extraInfo){

  try {
      const response = await axios.get(`${api}/phenotypes/${phenocode}/${extraInfo}/manhattan`);
      allInteractionPlottingData.value[phenocode + extraInfo] = response.data ; 
  } catch (error) {
      console.log(`Error fetching plotting data for ${phenocode}:`, error);
      isFailedInteractionPlotting.value = true;
  }

}

const updateChosenVariantMehod = (variant) => {
  chosenVariant.value = variant.value; 
};

function onInteractionCheckboxChange() {
  if (isInteractionChecked.value) {
    // console.log(infoInteraction.value)
    var strats = chooseDefaultPhenos(infoInteraction.value)
    // console.log(strats)
    selectedInteractionStratification1.value = strats[0].phenocode +returnExtraInfoString(strats[0])
    selectedInteractionStratification2.value = strats[1] ? strats[1].phenocode + returnExtraInfoString(strats[1]): "No stratification"
    handleInteractionRadioChange(); 

  } else {
    // console.log(info.value)
    var strats = chooseDefaultPhenos(info.value)
    selectedStratification1.value = strats[0].phenocode +returnExtraInfoString(strats[0])
    selectedStratification2.value = strats[1] ? strats[1].phenocode + returnExtraInfoString(strats[1]): "No stratification"
    handleRadioChange(); 
  }
}

const isLargeScreen = ref(window.innerWidth >= 1100);

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 1100;
};

onMounted(() => {
  window.addEventListener("resize", updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateScreenSize);
});

</script>


<style lang="scss" scoped>
  // .qq-container {
  //   position: relative;
  //   display: flex;
  //   // justify-content: space-around; 
  //   justify-content: center;
  //   align-items: flex-start;
  //   // flex-wrap: nowrap; 
  //   gap: 10px;
  // }
  
  // .qq-container div {
  //   // margin: 10px 10px; 
  //   object-fit: contain; 
  //   max-width: 45%;
  // }
  .qq-plot-wrapper {
    width: 100%;
    max-width: 600px;
    text-align: center;
  }
  .qq-title {
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 10px;
    color: #333;
  }

  // .qq p{
  //   font-size:20px;
  //   text-align:center;
  //   color: black;
  //   text-indent: 1%;
  // }

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
  
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .links{
    display: flex;
    justify-content: space-between; 
    align-items: center; 
  }

  .custom-checkbox {
    width: 20px;
    height: 20px; 
    cursor: pointer; 
  }
  
  .dropdown-menu {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 200px;
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

  .btn-primary {
    color: black;
    background-color: lightgrey;
    border: lightgrey;
  }

  .btn-primary:hover {
    background-color: darkgrey !important;
    color: black;
  }

  .sec-button {
    background-color:#0D47A1;
    color:white;
  }

  .sec-button:hover {
    background-color:#1565C0;
    color:white;
  }
  
  .responsive-main {
  padding-top: 4cap;
}

@media (max-width: 600px) {
  .responsive-main {
    padding-top: 6cap;
  }
}
</style>


