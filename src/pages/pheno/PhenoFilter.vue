<script setup>
    import axios from 'axios';
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import '@fortawesome/fontawesome-free/css/all.css';

    import Navbar2 from '../../components/Navbar2.vue';
    import ManhattanPlotFilter from '../../components/ManhattanPlotFilter.vue';
    import MiamiPlotFilter from '../../components/MiamiPlotFilter.vue';

    import * as functions from './Pheno.js';

    const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

    const route = useRoute();

    const phenocode = route.params.phenocode;
    const phenostring = ref(null);

    const info = ref(null);

    const selectedStratification1 = ref('');
    const selectedStratification2 = ref('');

    const linkUrl = ref(null)

    const refreshKey = ref(0)

    const allPlottingData = ref({})
    const plottingData = ref({});
    const miamiData = ref({});
    const manhattanData = ref({});

    const sampleSizeLabel = ref({})

    const miamiToggle = ref(true);

    onMounted(async () => {
        try {
            const response = await axios.get(`${api}/phenolist/` + phenocode);
            info.value = response.data;
            phenostring.value = info.value[0].phenostring
            
            // call plotting function
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
  } else {
    miamiToggle.value = true;
    miamiData.value = {}
    miamiData.value[selectedStratification1.value] = plottingData.value[selectedStratification1.value];
    miamiData.value[selectedStratification2.value] = plottingData.value[selectedStratification2.value];

  }

  refreshKey.value += 1;
};

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
    <v-main>
        <h1 v-if="phenostring">{{phenocode}}: {{phenostring}}</h1>
        <h1 v-else>{{phenocode}}</h1>
        <a class="p-1" v-if="linkUrl" :href="linkUrl" target="_blank" rel="noopener noreferrer"><u><b>Data Preview Portal</b></u> <i class="fas fa-external-link-alt"></i></a>
        <div class="pheno-info col-12 mt-3">
            <!-- TODO: needs to start on female male, not indices 2 and 1 -->
            <div class="dropdown p-1 mr-0" id="dropdown-data1">
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
            <div class="float-right d-flex align-items-center justify-content-right ml-2 mr-0" >
              <label class="mr-1" ><b>Minor Allele Freq Range:</b></label>
    
              <input 
                type="number" 
                v-model="minFreq" 
                class="form-control form-control-sm mr-1"
                style="border: 1px solid black; padding: 5px; color: black; font-size: 16px;" 
                :min="0" 
                :max="1" 
                :step="0.05" 
              />
              <span class="mr-1">-</span>
              <input 
                type="number" 
                v-model="maxFreq" 
                class="form-control form-control-sm mr-3" 
                style="border: 1px solid black; padding: 5px; color: black; font-size: 16px;"
                :min="0" 
                :max="1" 
                :step="0.05" 
              />
              
              <div class="btn-group mr-2">
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  :class="{ active: selectedType === 'SNP' }" 
                  @click="selectType('SNP')">
                  SNP
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  :class="{ active: selectedType === 'Indel' }" 
                  @click="selectType('Indel')">
                  Indel
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  :class="{ active: selectedType === 'Both' }" 
                  @click="selectType('Both')">
                  Both
                </button>
              </div>

              <button class="btn btn-primary blue-button" @click="applyFilter">Filter</button>
            </div>
        </div> 
        <div v-if="miamiToggle && Object.keys(miamiData).length > 0">
            <MiamiPlotFilter :key="refreshKey" :data="miamiData"/>
        </div>
        <div v-else-if="!miamiToggle && Object.keys(manhattanData).length > 0">
            <ManhattanPlotFilter :key="refreshKey" :data="manhattanData"/>
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

  .form-control-sm {
    width: 25%;
  }

  .blue-button {
    background-color:blue !important; 
    color:white !important;
  }
  .blue-button:hover{
    background-color:darkblue !important;
  }

  .d-flex{
    width : 44%;
    height: 45px
  }

  .d-flex label{
    align-items: center !important;
  }

  .d-flex input {
    width : 62px;
  }
</style>