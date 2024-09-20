<template>
    <v-app>
        <Navbar2 />
        <v-main>
            <h2 style="font-weight: bold;">All Phenotypes</h2>
            <div style="margin-top: 2%;">
                <PhenotypesTable />
            </div>
        </v-main>
    </v-app>
</template>

<script setup name="Phenotypes">
    import Navbar2 from '../../components/Navbar2.vue';
    import { ref } from 'vue'
    import PhenotypesTable from '../../components/PhenotypesTable.vue';

</script>

<style scoped>
</style>