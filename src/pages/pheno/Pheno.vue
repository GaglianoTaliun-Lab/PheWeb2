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
const miamiData = ref({});
const manhattanData = ref({});

const selectedStratification1 = ref('');
const selectedStratification2 = ref('');

const sampleSizeLabel = ref({})

const miamiToggle = ref(true);

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

onMounted(async () => {
    try {
      const response = await axios.get(`${api}/phenolist/` + phenocode);
      info.value = response.data;
      phenostring.value = info.value[0].phenostring
      await generateQQs(info.value.map(pheno => pheno.phenocode+"."+Object.values(pheno.stratification).join('.') ));
      await fetchPlottingData(info.value.map(pheno => pheno.phenocode+"."+Object.values(pheno.stratification).join('.') ));
      
      populateDataPreview(phenocode)
      // is this appropriate to do here?
      // again, needs to be male or female here, not 2 or 1
      selectedStratification1.value = stratificationsToKey(info.value[1].phenocode, info.value[1].stratification)
      selectedStratification2.value = stratificationsToKey(info.value[1].phenocode, info.value[2].stratification)

      // set sample size labels (case controls, etc.) for future use
      info.value.forEach(pheno => {
        const key = stratificationsToKey(pheno.phenocode, pheno.stratification);
        if (pheno.num_cases !== "" && pheno.num_controls !== "") {
          sampleSizeLabel.value[key] = `${new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format( pheno.num_cases )} cases, ${new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format( pheno.num_controls )} controls`;
        } else {
          sampleSizeLabel.value[key] = `${new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format( pheno.num_samples )} samples`;
        }
      });

      // call plotting function
      handleRadioChange(); 
    }
    catch (error) {
      console.log(error);
    }
});

// this function will just change a value that determins if a manhattan or miami plot is generated
const handleRadioChange = () => {
  if (selectedStratification2.value === "None"){
    miamiToggle.value = false;
    manhattanData.value = plottingData.value[selectedStratification1.value];

    qqSubset.value = {};
    qqSubset.value[selectedStratification1.value] = qqData.value[selectedStratification1.value];
  } else {
    miamiToggle.value = true;
    miamiData.value = {}
    miamiData.value[selectedStratification1.value] = plottingData.value[selectedStratification1.value];
    miamiData.value[selectedStratification2.value] = plottingData.value[selectedStratification2.value];

    qqSubset.value = {};
    qqSubset.value[selectedStratification1.value] = qqData.value[selectedStratification1.value];
    qqSubset.value[selectedStratification2.value] = qqData.value[selectedStratification2.value];

  }

  refreshKey.value += 1;
  qqRefreshKey.value += 1;
};

const downloadAll = () => {
  var downloads = []

  // get all phenocodes api calls
  for (const pheno of info.value){
    console.log(pheno)
    var phenocode = stratificationsToKey(pheno.phenocode, pheno.stratification)
    var api_link = `${api}/sumstats/${phenocode}`;
    downloads.push({url:api_link, filename : phenocode})
  };

  console.log("downloads: ", downloads)

  //without slowing it down the website would jsut download the last of the list. maybe can use async await here
  downloads.forEach((file, index) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.filename;
      console.log(a);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, index * 500);
  });
};

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
      console.log(a);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, index * 500);
  });
}

const populateDataPreview = () => {
  try {
    var link = "https://datapreview.clsa-elcv.ca/mica/variable/com%3A"+phenocode+"%3ACollected#/"
    console.log(link)
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
            const response = await axios.get(`${api}/qq/` + phenocode);
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
            const response = await axios.get(`${api}/pheno/` + phenocode);
            pheno_data_temp[phenocode] = response.data ; 
        } catch (error) {
            console.log(`Error fetching plotting data for ${phenocode}:`, error);
        }
    }
    allPlottingData.value = pheno_data_temp;
    plottingData.value = pheno_data_temp;

}


</script>

<template>
    <v-app>
        <Navbar2 />
        <v-main class="pt-10">
            <h1 v-if="phenostring">{{phenocode}}: {{phenostring}}</h1>
            <h1 v-else>{{phenocode}}</h1>
            <a class="p-1" v-if="linkUrl" :href="linkUrl" target="_blank" rel="noopener noreferrer"><u><b>Data Preview Portal</b></u> <i class="fas fa-external-link-alt"></i></a>
            <div class="pheno-info col-12 mt-3">
                <!-- TODO: needs to start on female male, not indices 2 and 1 -->
                <div class="dropdown p-1" id="dropdown-data1">
                    <button class="btn btn-primary btn-drop" id="button-data1">{{keyToLabel(selectedStratification1) + " (" + sampleSizeLabel[selectedStratification1] + ")"}}<span class="arrow-container"><span class="arrow-down"></span></span></button>
                    <div class="dropdown-menu" id="dropdown-content-data1">
                        <label v-for="(pheno, index) in info" >
                            <input 
                            :checked="index === 1" 
                            type="radio" 
                            :value="stratificationsToKey(pheno.phenocode, pheno.stratification)" 
                            :name="pheno.phenocode + '1'" 
                            v-model="selectedStratification1"
                            @change="handleRadioChange">
                            {{ stratificationsToLabel(pheno.stratification) + " (" + sampleSizeLabel[stratificationsToKey(pheno.phenocode, pheno.stratification)] + ")"}} 
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
                            :value="stratificationsToKey(pheno.phenocode, pheno.stratification)" 
                            :name="pheno.phenocode + '2'"
                            v-model="selectedStratification2"
                            @change="handleRadioChange"> 
                            {{ stratificationsToLabel(pheno.stratification) + " (" + sampleSizeLabel[stratificationsToKey(pheno.phenocode, pheno.stratification)] + ")" }} 
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
                <MiamiPlot :key="refreshKey" :data="miamiData"/>
            </div>
            <div v-else-if="!miamiToggle && Object.keys(manhattanData).length > 0">
                <ManhattanPlot :key="refreshKey" :data="manhattanData"/>
            </div>
            <br>
            <GWASTable />
            <br>
            <div v-if="qqData && dimension"> 
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
    background-color:grey;
    color: black;
  }

</style>
