<template>
    <v-app>
        <Navbar2 />
        <v-main class="responsive-main">
            <h2 style="font-weight: bold;">Phenotypes</h2>
            <!-- <p>{{ uniquePhenotypesCount }} of {{ totalPhenotypesCount }} phenotype(s) displayed</p> -->
            <div>
                <PhenotypesTable 
                    @updateUniquePhenotypesCount="updateUniquePhenotypesMethod"
                    :data="data"
                />
            </div>
        </v-main>
    </v-app>
</template>

<script setup name="Phenotypes">
    import Navbar2 from '../../components/Navbar2.vue';
    import { ref, onMounted } from 'vue'
    import PhenotypesTable from '../../components/PhenotypesTable.vue';
    import axios from 'axios';

    const uniquePhenotypesCount = ref(0);
    const totalPhenotypesCount = ref(0);
    const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
    const data = ref([]);
    const errorMessage = ref('');

    const fetchData = async () => {
      errorMessage.value = '';
      try {
        const response = await axios.get(`${api}/phenotypes`)
        data.value = response.data;
      } catch (error) {
        console.error("There was an error fetching the sample data:", error);
        errorMessage.value = "Failed to load data. Please try again later.";
      } 
      
    };

    function updateUniquePhenotypesMethod({ uniqueCount, totalCount }) {
        uniquePhenotypesCount.value = uniqueCount;
        totalPhenotypesCount.value = totalCount;
    };

    onMounted( () => {
        fetchData();
    });
</script>

<style scoped>
.responsive-main {
  padding-top: 4cap;
}

@media (max-width: 600px) {
  .responsive-main {
    padding-top: 6cap;
  }
}
</style>