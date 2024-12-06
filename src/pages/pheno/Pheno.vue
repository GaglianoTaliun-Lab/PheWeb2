<script setup name="Pheno">

import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import '@fortawesome/fontawesome-free/css/all.css';

import Navbar2 from '../../components/Navbar2.vue';
import ManhattanPlot from '../../components/ManhattanPlot.vue';
import MiamiPlot from '../../components/MiamiPlot.vue';
import QQPlot from '../../components/QQPlot.vue';
import GWASTable from '../../components/GWASTable.vue';
import InteractionPlot from '../../components/InteractionPlot.vue'

import * as functions from './Pheno.js';

const route = useRoute();

const phenocode = route.params.phenocode;
const phenostring = ref(null);

const info = ref(null);
const linkUrl = ref(null)

const qqData = ref({});
const qqSubset = ref({});
const dimension = ref([0,0]);

const refreshKey = ref(0)
const qqRefreshKey = ref(0)

const allPlottingData = ref({})
const plottingData = ref({});
const interactionPlottingData = ref({})
const miamiData = ref({});
const manhattanData = ref({});

const selectedStratification1 = ref('');
const selectedStratification2 = ref('');

// Filtering information from child components
const minFreq = ref(0);
const maxFreq = ref(0.5);
const selectedType = ref('Both');

const sampleSizeLabel = ref({})

const miamiToggle = ref(true);

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const chosenVariant = ref('');

onMounted(async () => {
    try {
      const response = await axios.get(`${api}/phenotypes/phenotypes_list/` + phenocode);
      const response_interaction = await axios.get(`${api}/phenotypes/interaction_list/` + phenocode);

      info.value = response.data;
      if (response_interaction.data) {
        //info.value = info.value.concat(response_interaction.data)
        let pheno = response_interaction.data[0]
        try {
            const response = await axios.get(`${api}/phenotypes/` + pheno.phenocode + returnExtraInfoString(pheno));
            interactionPlottingData.value[pheno.phenocode] = response.data ; 
            console.log(interactionPlottingData.value)
        } catch (error) {
            console.log(`Error fetching interaction plotting data for ${phenocode}:`, error);
        }
      }

      // just take the first instance...they will all be the same
      phenostring.value = info.value[0].phenostring

      await generateQQs(info.value.map(pheno => pheno.phenocode + returnExtraInfoString(pheno) ));
      await fetchPlottingData(info.value.map(pheno => pheno.phenocode + returnExtraInfoString(pheno)  ));
      
      
      populateDataPreview(phenocode)
      
      //logic for choosing first two 
      var strats = chooseDefaultPhenos(info.value)

      selectedStratification1.value = strats[0].phenocode +returnExtraInfoString(strats[0])
      selectedStratification2.value = strats[1] ? strats[1].phenocode + returnExtraInfoString(strats[1]): "None"

      // set sample size labels (case controls, etc.) for future use
      info.value.forEach(pheno => {
        const key = pheno.phenocode + returnExtraInfoString(pheno);
        if (pheno.num_cases !== "" && pheno.num_controls !== "") {
          sampleSizeLabel.value[key] = `${new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format( pheno.num_cases )} cases, ${new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format( pheno.num_controls )} controls`;
        } else {
          sampleSizeLabel.value[key] = `${new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format( pheno.num_samples )} samples`;
        }
      });

      // call plotting function to populate plot
      handleRadioChange(); 
    }
    catch (error) {
      console.log(error);
    }
});

function updateFilteringParameters({ min, max, type}) {
      minFreq.value = min;
      maxFreq.value = max;
      selectedType.value = type;

}

function chooseDefaultPhenos(data){

  // TODO change to return phenos and not stratifications

  if (!data[0].stratification){
      return ['', null]  
  }

  var all_stratifications = data.map(pheno => {
    return pheno.stratification
  })

  if (all_stratifications.length == 1){
    return [pheno[0], null];
  }

  if (!all_stratifications[0].sex){
    return [pheno[0], pheno[1]];
  }

  var chosen_stratifications = [];
  var male = null;
  var female = null;
  var both = null;

  for (var item of all_stratifications){

    if (chosen_stratifications.length < 2){
      chosen_stratifications.push(item)
    }

    if ('female' === item.sex.toLowerCase()){
      female = item;
    }
    else if ('male' === item.sex.toLowerCase()){
      male = item;
    }
    else if ('both' === item.sex.toLowerCase()){
      both = item;
    }
  }

  if (female != null){
    chosen_stratifications[0] = female;
  }
  if (male != null){
    chosen_stratifications[1] = male;
  }

  if (!male && both != null){
    chosen_stratifications[1] = both;
  }
  if (!female && both != null){
    chosen_stratifications[0] = both;
  }

  // return phenos with those exact stratification

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
  if (selectedStratification2.value === "None" || selectedStratification1.value === selectedStratification2.value){
    manhattanData.value = {}
    miamiToggle.value = false;
    manhattanData.value[selectedStratification1.value] = allPlottingData.value[selectedStratification1.value];

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

function returnExtraInfoString(pheno) {
  let extraInfoString = "";

  if (pheno.interaction !== null && pheno.interaction !== undefined) {
    extraInfoString += ".inter-" + pheno.interaction;
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

  return extraInfoLabel;
}

const downloadAll = () => {
  var downloads = []

  // get all phenocodes api calls
  for (const pheno of info.value){
    var phenocode = stratificationsToKey(pheno.phenocode, pheno.stratification)
    var api_link = `${api}/sumstats/${phenocode}`;
    downloads.push({url:api_link, filename : phenocode})
  };

  //without slowing it down the website would jsut download the last of the list. maybe can use async await here
  downloads.forEach((file, index) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, index * 500);
  });
};

// TODO: change to streaming instead of backend call
const downloadCurrent = () => {
  var downloads = []
  
  downloads.push({url: `${api}/sumstats/${selectedStratification1.value}`, filename: selectedStratification1.value})
  if (selectedStratification2.value != "None"){
      downloads.push({url: `${api}/sumstats/${selectedStratification2.value}`, filename: selectedStratification2.value})
  }
  downloads.forEach((file, index) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, index * 500);
  });
}

const populateDataPreview = () => {
  try {
    var link = "https://datapreview.clsa-elcv.ca/mica/variable/com%3A"+phenocode+"%3ACollected#/"
    // just checking if it's working
    axios.get(link);
    linkUrl.value = link;
  }
  catch {
    console.log('Data preview portal is not reachable.');
  }
}

const stratificationsToLabel = (strats) => {
    return functions.stratificationToLabel(strats);
}

const stratificationsToKey = (phenocode, strats) => {
    return functions.stratificationToKey(phenocode, strats);
}

const keyToLabel = (phenoLabel) => {
  return functions.keyToLabel(phenoLabel);
}


function calculate_qq_dimension(combined_data){

  var height = 0
  var width = 0
  var dimensions = [height, width]

  for (var qqData of combined_data){
      qqData.by_maf.forEach(function(data){

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

async function generateQQs(phenocodes){
    var qqDataTemp = []; 

    for (const phenocode of phenocodes) {
        try {
            const response = await axios.get(`${api}/phenotypes/qq/` + phenocode);
            qqDataTemp.push(response.data); 
            qqData.value[phenocode] = response.data;
        } catch (error) {
            console.log(`Error fetching QQ data for ${phenocode}:`, error);
        }
    }
    dimension.value = calculate_qq_dimension(qqDataTemp);
}

async function fetchPlottingData(phenocodes){
    var pheno_data_temp = {}

    for (const phenocode of phenocodes) {
        try {
            const response = await axios.get(`${api}/phenotypes/` + phenocode);
            pheno_data_temp[phenocode] = response.data ; 
        } catch (error) {
            console.log(`Error fetching plotting data for ${phenocode}:`, error);
        }
    }
    allPlottingData.value = pheno_data_temp;

}

const updateChosenVariantMehod = (variant) => {
  console.log('Received chosen variant:', variant.value);
  chosenVariant.value = variant.value; 
  // console.log(chosenVariant.value);
};


</script>

<template>
    <v-app>
        <Navbar2 />
        <v-main class="pt-10">
            <h1 v-if="phenostring">{{phenocode}}: {{phenostring}}</h1>
            <h1 v-else>{{phenocode}}</h1>
            <a class="p-1" v-if="linkUrl" :href="linkUrl" target="_blank" rel="noopener noreferrer"><u><b>Data Preview Portal</b></u> <i class="fas fa-external-link-alt"></i></a>
            <div class="pheno-info col-12 mt-3">
                <div class="dropdown p-1" id="dropdown-data1">
                    <button class="btn btn-primary btn-drop" id="button-data1">{{keyToLabel(selectedStratification1) + " (" + sampleSizeLabel[selectedStratification1] + ")"}}<span class="arrow-container"><span class="arrow-down"></span></span></button>
                    <div class="dropdown-menu" id="dropdown-content-data1">
                        <label v-for="(pheno, index) in info">
                            <input 
                            :checked="index === 1" 
                            type="radio" 
                            :value="pheno.phenocode + returnExtraInfoString(pheno)" 
                            :name="pheno.phenocode + '1'" 
                            v-model="selectedStratification1"
                            @change="handleRadioChange">
                            {{ returnExtraInfoLabel(pheno) + " (" + sampleSizeLabel[pheno.phenocode + returnExtraInfoString(pheno)] + ")"}} 
                        </label> 
                    </div>
                  </div>
                  <div class="dropdown p-1" id="dropdown-data2">
                    <button v-if="selectedStratification2 == 'None'" class="btn btn-primary btn-drop" id="button-data2"> None <span class="arrow-container"><span class="arrow-down"></span></span></button>
                    <button v-else class="btn btn-primary btn-drop" id="button-data2"> {{keyToLabel(selectedStratification2) + " (" + sampleSizeLabel[selectedStratification2] + ")"}} <span class="arrow-container"><span class="arrow-down"></span></span></button>
                    <div class="dropdown-menu" id="dropdown-content-data2">
                        <label v-for="(pheno, index) in info" >
                            <input 
                            :checked="index === 2" 
                            type="radio" 
                            :value="pheno.phenocode + returnExtraInfoString(pheno)" 
                            :name="pheno.phenocode + '2'"
                            v-model="selectedStratification2"
                            @change="handleRadioChange"> 
                            {{ returnExtraInfoLabel(pheno) + " (" + sampleSizeLabel[pheno.phenocode + returnExtraInfoString(pheno)] + ")" }} 
                        </label>
                        <label v-if="info">
                            <input type="radio" value="None" :name="info[0].phenocode + '2'" v-model="selectedStratification2" @change="handleRadioChange"> None
                        </label>
                    </div>
                  </div>

                  <div class="dropdown float-right" id="dropdown-sumstats">
                    <button class="btn btn-primary btn-drop">  Download Summary Statistics  <span class="arrow-container"><span class="arrow-down"></span></span></button>
                    <div class="dropdown-menu dropdown-menu-right p-1" id="dropdown-content-sumstats">
                      <button class="btn btn-secondary w-100 mt-1 mb-1"  id="download-all-button" @click="downloadAll">Download All</button>
                      <button class="btn btn-secondary w-100 mt-1 mb-1"  id="download-current-button" @click="downloadCurrent">Download Current Selection</button>
                    </div>
                  </div>
            </div> 
            <div v-if="miamiToggle && Object.keys(miamiData).length > 0">
                <MiamiPlot :key="refreshKey" :data="miamiData" @updateFilteringParams="updateFilteringParameters" @updateChosenVariant="updateChosenVariantMehod"/>
            </div>
            <div v-else-if="!miamiToggle && Object.keys(manhattanData).length > 0">
                <ManhattanPlot :key="refreshKey" :data="manhattanData"  @updateFilteringParams="updateFilteringParameters"/>
            </div>
            <GWASTable 
              :selectedStratification1= "selectedStratification1"
              :selectedStratification2= "selectedStratification2"
              :phenocode= "phenocode"
              :minFreq="minFreq"
              :maxFreq="maxFreq"
              :selectedType= "selectedType"
              :miamiData="miamiData"
              :chosenVariant="chosenVariant"
            />
            <br>
            <div v-if="Object.keys(interactionPlottingData).length > 0" class="mt-5 mb-5">
              <h2>Genome-Wide SNPxSex Interaction</h2>
              <InteractionPlot :key="1" :data="interactionPlottingData" />
            </div>
            <div v-if="qqData && dimension" class="mt-10 mb-5"> 
                <h2> QQ Plot(s): </h2>
                <div class="qq-container">
                    <div :key="qqRefreshKey" class="qq" v-for="qq in Object.keys(qqSubset)" >
                        <p>{{ qq.split(".").slice(1).join(", ") }} </p>
                        <QQPlot :data="{
                            qq : qqSubset[qq],
                            dimensions : dimension
                        }" /> 
                    </div>
                </div>
            </div>
        </v-main>
    </v-app>
</template>

<style lang="scss" scoped>
.qq-container {
    position: relative;
    display: flex;
    justify-content: space-around; 
    justify-content: left;
    align-items: flex-end;
    flex-wrap: wrap; 
  }
  
  .qq-container div {
    margin: 10px 10px; 
    object-fit: contain; 
  }

  .qq p{
    font-size:20px;
    text-align:center;
    color: black;
    text-indent: 1%;
  }

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
  
  .dropdown-menu {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 200px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 12px 16px;
    z-index: 1;
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

</style>
