<script setup name="Pheno">
import { useRoute } from 'vue-router';

import Navbar2 from '../../components/Navbar2.vue';
import ManhattanPlot from '../../components/ManhattanPlot.vue';
import MiamiPlot from '../../components/MiamiPlot.vue';
import GwasTable from '../../components/GwasTable.vue';
import QQPlot from '../../components/QQPlot.vue'

const route = useRoute();

const phenocode = route.params.phenocode;

// TODO : call the API and use logic to determine whether to display miami or manhattan plot, pass through data

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
            <!-- TODO: We will map out more than one qq plot here (1 per stratification)-->
            <h2> QQ Plot(s): </h2>
            <QQPlot />
            <QQPlot />
        </v-main>
    </v-app>
</template>