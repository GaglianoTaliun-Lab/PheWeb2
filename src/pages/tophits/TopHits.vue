<template>
    <v-app>
        <Navbar />
        <v-main>
            <h2 style="font-weight: bold;">Top Hits</h2>
            <span style="font-weight: bold;">This page shows only the peaks with a p-value < 10-6. 
                Variants are hidden if any variant within 500kb in the same phenotype has a more significant p-value.</span>
            <div style="margin-top: 2%;">
                <!-- <TopHitsTable/> -->
                <PhenotypesTable 
                    :data="data"
                />
            </div>
        </v-main>
    </v-app>
</template>

<script setup name="Tophits">
    import Navbar from '@/components/Navbar.vue';
    import { ref, onMounted} from 'vue'
    import TopHitsTable from '@/components/TopHitsTable.vue';
    import PhenotypesTable from '@/components/PhenotypesTable.vue';
    import axios from 'axios';
    const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
    const data = ref([]);
    const errorMessage = ref('');

    const fetchData = async () => {
      errorMessage.value = '';
      try {
        const response = await axios.get(`${api}/phenotypes/tophits`)
        data.value = response.data;
      } catch (error) {
        console.error("There was an error fetching the sample data:", error);
        errorMessage.value = "Failed to load data. Please try again later.";
      } 
      
    };

    onMounted( () => {
        fetchData();
    });
</script>

<style scoped>
</style>