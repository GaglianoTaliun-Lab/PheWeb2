<script setup name="Pheno">

import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Navbar2 from '../../components/Navbar2.vue';
import ManhattanPlot from '../../components/ManhattanPlot.vue';
import MiamiPlot from '../../components/MiamiPlot.vue';
import GwasTable from '../../components/GwasTable.vue';
import QQPlot from '../../components/QQPlot.vue'

const route = useRoute();

const phenocode = route.params.phenocode;

const info = ref(null);
const qq_data = ref(null);
const dimension = ref(null);

// TODO : call the API and use logic to determine whether to display miami or manhattan plot, pass through data
onMounted(async () => {
    try {
      const response = await axios.get("http://localhost:9099/phenolist/" + phenocode);
      info.value = response.data;
      await generateQQs(info.value.map(pheno => pheno.phenocode+"."+Object.values(pheno.stratification).join('.') )); 
    }
    catch (error) {
      console.log(error);
    }
});

async function generateQQs(phenocodes){
    const qq_data_temp = []; 

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

</script>

<template>
    <v-app>
        <Navbar2 />
        <v-main>
            <h1>{{phenocode}}</h1>
            <div>
                <p> Buttons here... </p>
            </div> 
            <MiamiPlot />
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


</style>