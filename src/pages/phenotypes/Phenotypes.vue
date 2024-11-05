<template>
    <v-app>
        <Navbar2 />
        <v-main>
            <h2 style="font-weight: bold;">Phenotypes</h2>
            <p>{{ uniquePhenotypesCount }} of {{ totalPhenotypesCount }} phenotype(s) displayed</p>
            <div style="margin-top: 2%;">
                <PhenotypesTable 
                    @updateUniquePhenotypesCount="updateUniquePhenotypesMethod"
                />
            </div>
        </v-main>
    </v-app>
</template>

<script setup name="Phenotypes">
    import Navbar2 from '../../components/Navbar2.vue';
    import { ref } from 'vue'
    import PhenotypesTable from '../../components/PhenotypesTable.vue';

    const uniquePhenotypesCount = ref(0);
    const totalPhenotypesCount = ref(0);

    function updateUniquePhenotypesMethod({ uniqueCount, totalCount }) {
        uniquePhenotypesCount.value = uniqueCount;
        totalPhenotypesCount.value = totalCount;
    }
</script>

<style scoped>
</style>