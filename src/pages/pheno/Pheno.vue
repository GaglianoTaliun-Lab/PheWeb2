<script setup name="Pheno">

import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Navbar2 from '../../components/Navbar2.vue';
import ManhattanPlot from '../../components/ManhattanPlot.vue';
import MiamiPlot from '../../components/MiamiPlot.vue';
import GwasTable from '../../components/GwasTable.vue';
import QQPlot from '../../components/QQPlot.vue';

import * as functions from './Pheno.js';

const route = useRoute();

const phenocode = route.params.phenocode;

const info = ref(null);

const qq_data = ref(null);
const dimension = ref(null);

const refreshKey = ref(0)

const plottingData = ref({});
const miamiData = ref([]);
const manhattanData = ref({});

const selectedStratification1 = ref('');
const selectedStratification2 = ref('');

const sampleSizeLabel = ref({})

const miamiToggle = ref(true);


// TODO : call the API and use logic to determine whether to display miami or manhattan plot, pass through data
onMounted(async () => {
    try {
      const response = await axios.get("http://localhost:9099/phenolist/" + phenocode);
      info.value = response.data;
      await generateQQs(info.value.map(pheno => pheno.phenocode+"."+Object.values(pheno.stratification).join('.') ));
      
      await fetchPlottingData(info.value.map(pheno => pheno.phenocode+"."+Object.values(pheno.stratification).join('.') ));
      // is this appropriate to do here?
      // again, needs to be male or female here, not 2 or 1
      selectedStratification1.value = stratificationsToKey(info.value[1].phenocode, info.value[1].stratification)
      selectedStratification2.value = stratificationsToKey(info.value[1].phenocode, info.value[2].stratification)

      // set sample size labels (case controls, etc.) for future use
      info.value.forEach(pheno => {
        const key = stratificationsToKey(pheno.phenocode, pheno.stratification);
        if (pheno.num_cases !== "" && pheno.num_controls !== "") {
          sampleSizeLabel.value[key] = `${pheno.num_cases} cases, ${pheno.num_controls} controls`;
        } else {
          sampleSizeLabel.value[key] = `${pheno.num_samples} samples`;
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
    manhattanData.value = plottingData.value[selectedStratification1.value]
  } else {
    miamiToggle.value = true;
    miamiData.value = [plottingData.value[selectedStratification1.value], plottingData.value[selectedStratification2.value]]
  }

  refreshKey.value += 1
};

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
  for (var qq_data of combined_data){
      qq_data.by_maf.forEach(function(data){

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
    var qq_data_temp = []; 

    for (const phenocode of phenocodes) {
        try {
            const response = await axios.get("http://localhost:9099/qq/" + phenocode);
            qq_data_temp.push(response.data); 
        } catch (error) {
            console.log(`Error fetching QQ data for ${phenocode}:`, error);
        }
    }
    dimension.value = calculate_qq_dimension(qq_data_temp);
    qq_data.value = qq_data_temp;
}

async function fetchPlottingData(phenocodes){
    var pheno_data_temp = {}

    for (const phenocode of phenocodes) {
        try {
            const response = await axios.get("http://localhost:9099/pheno/" + phenocode);
            pheno_data_temp[phenocode] = response.data ; 
        } catch (error) {
            console.log(`Error fetching plotting data for ${phenocode}:`, error);
        }
    }

    plottingData.value = pheno_data_temp;
}


</script>

<template>
    <v-app>
        <Navbar2 />
        <v-main>
            <h1>{{phenocode}}</h1>
            <div class="pheno-info col-12">
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
                            {{ stratificationsToLabel(pheno.stratification) + " (" + sampleSizeLabel[selectedStratification1] + ")"}} 
                        </label> 
                    </div>
                  </div>
                  <div class="dropdown p-1" id="dropdown-data2">
                    <button class="btn btn-primary btn-drop" id="button-data2"> {{keyToLabel(selectedStratification2) + " (" + sampleSizeLabel[selectedStratification2] + ")"}} <span class="arrow-container"><span class="arrow-down"></span></span></button>
                    <div class="dropdown-menu" id="dropdown-content-data2">
                        <label v-for="(pheno, index) in info" >
                            <input 
                            :checked="index === 2" 
                            type="radio" 
                            :value="stratificationsToKey(pheno.phenocode, pheno.stratification)" 
                            :name="pheno.phenocode + '2'"
                            v-model="selectedStratification2"
                            @change="handleRadioChange"> 
                            {{ stratificationsToLabel(pheno.stratification) + " (" + sampleSizeLabel[selectedStratification2] + ")" }} 
                        </label>
                        <label v-if="info">
                            <input type="radio" value="None" :name="info[0].phenocode + '2'" @change="handleRadioChange"> None
                        </label>
                    </div>
                  </div>
                  <span class="float-right ml-3 mr-3" >
                    <a class="btn btn-secondary" href="{{ url_for('.pheno_filter_page', phenocode=phenocode) }}">Filter Variants</a>
                  </span>
                  <div class="dropdown float-right" id="dropdown-sumstats">
                    <button class="btn btn-primary btn-drop">  Download Summary Statistics  <span class="arrow-container"><span class="arrow-down"></span></span></button>
                    <div class="dropdown-menu dropdown-menu-right p-1" id="dropdown-content-sumstats">
                      <button class="btn btn-secondary w-100 mt-1 mb-1"  id="download-all-button">Download All</button>
                      <button class="btn btn-secondary w-100 mt-1 mb-1"  id="download-current-button">Download Current Selection</button>
                    </div>
                  </div>
            </div> 
            <div v-if="miamiToggle && miamiData.length != []">
                <MiamiPlot :key="refreshKey" :data="miamiData"/>
            </div>
            <div v-else-if="!miamiToggle && manhattanData != {}">
                <ManhattanPlot :key="refreshKey" :data="manhattanData"/>
            </div>
            <br>
            <h2> Top Loci: </h2>
            <GwasTable /> 
            <br>
            <div v-if="qq_data && dimension"> 
                <h2> QQ Plot(s): </h2>
                <div class="qq-container">
                    <div class="qq" v-for="(qq, index) in qq_data" :key="index">
                        <p>{{ Object.values(info[index].stratification).join(", ") }} </p>
                        <QQPlot :data="{
                            qq : qq,
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
    margin-right: 10px; /* Adjust spacing as needed */
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