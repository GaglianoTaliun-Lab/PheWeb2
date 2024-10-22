<template>
    <v-app>
        <Navbar2 />
        <v-main>
            <h2 style="font-weight: bold;">Top Hits</h2>
            <span style="font-weight: bold;">This page shows only the peaks with a p-value < 10-6. 
                Variants are hidden if any variant within 500kb in the same phenotype has a smaller p-value.</span>
            <div style="margin-top: 2%;">
                <TopHitsTable />
            </div>
        </v-main>
    </v-app>
</template>

<script setup name="Tophits">
    import Navbar2 from '../../components/Navbar2.vue';
    import { ref } from 'vue'
    import TopHitsTable from '../../components/TopHitsTable.vue';

</script>

<style scoped>
</style>