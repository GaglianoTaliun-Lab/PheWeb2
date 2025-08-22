<template>
    <v-app>
        <Navbar />
        <v-main >
            <!-- <h2 style="font-weight: bold;">PheWeb 2.0 GitHub</h2> -->
            <v-alert
                density="compact"
                title="Our GitHub Repository"
                type="info"
                show-icon
                variant="tonal"
                style="padding-bottom: 5%; "
            >
                Please visit our GitHub repository: <br>
                <div class="d-flex justify-center mt-5">
                    <v-btn @click="jumpToGithub"> 
                        <v-icon class="mr-2">mdi-github</v-icon> 
                        PheWeb 2 GitHub 
                        <v-icon class="ml-2">mdi-open-in-new</v-icon>
                    </v-btn>
                </div>
                <div class="d-flex justify-center mt-5">
                    <v-btn @click="jumpToAPI"> 
                        <v-icon class="mr-2">mdi-github</v-icon> 
                        PheWeb 2 API GitHub
                        <v-icon class="ml-2">mdi-open-in-new</v-icon>
                    </v-btn>
                </div>
            </v-alert>
            <!-- <span class="d-flex justify-center align-center mt-10" style="font-weight: bold;">
                <v-icon class="mr-2">mdi-file-document-outline</v-icon>
                Click the button below to access the API documentation
            </span> -->
            
        </v-main>
    </v-app>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from '../../components/Navbar.vue';

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const jumpToGithub = () => {
    window.open('https://github.com/GaglianoTaliun-Lab/PheWeb2', '_blank');
}

const jumpToAPI = () => {
    window.open('https://github.com/GaglianoTaliun-Lab/PheWeb2-API', '_blank');
}

</script>

<style scoped>

</style>
