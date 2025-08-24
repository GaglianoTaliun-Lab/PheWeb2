<template>
    <v-app>
        <Navbar />
        <v-main>
            <!-- <h2 style="font-weight: bold;">PheWeb 2.0 API</h2> -->
            <v-alert
                density="compact"
                title="API Usage Warning"
                type="info"
                show-icon
                variant="tonal"

            >
                Dear User, <br>
                This is an <strong>open-source API</strong> designed for <strong>small-scale scientific requests</strong>. 
                To ensure fair access and maintain system performance, please adhere to the following guidelines: <br>
                <ul>
                    <li>
                        <strong>Intended Use:</strong> This API is meant for <strong>lightweight queries</strong> in research. <br>
                    </li>
                    <li>
                        <strong>Rate Limits:</strong> A maximum of ... requests per minute/hour is allowed. <br>
                    </li>
                    <li>
                        <strong>Data Download:</strong> If you need to download datasets, please use the official download feature on our website instead of making bulk API requests. <br>
                    </li>
                    <li>
                        <strong>Responsible Usage:</strong> Please implement proper request handling, caching, and retries to avoid unnecessary API calls. <br>
                    </li>
                    <li>
                        <strong>Abuse Prevention:</strong> Excessive or automated high-frequency requests may lead to temporary rate limiting or permanent access restrictions. <br>
                    </li>
                </ul>
                Your responsible use helps keep this resource available for the scientific community. If you have any questions or need extended access, please contact us at <router-link :to="{ name: 'Contact' }">Contact Us</router-link> <br>
                <br>
                Thank you for your cooperation!<br>
                <br>
                <strong>The CLSA PheWeb Team</strong>
            </v-alert>
            <!-- <span class="d-flex justify-center align-center mt-10" style="font-weight: bold;">
                <v-icon class="mr-2">mdi-file-document-outline</v-icon>
                Click the button below to access the API documentation
            </span> -->
            <div class="d-flex justify-center mt-10">
                <v-btn @click="jumpToAPI"> 
                    <v-icon class="mr-2">mdi-file-document-outline</v-icon> 
                    PheWeb 2 API Documentation
                    <v-icon class="ml-2">mdi-open-in-new</v-icon>
                </v-btn>
            </div>
        </v-main>
    </v-app>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from '../../components/Navbar.vue';

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL

const jumpToAPI = () => {
    const base = api.replace(/\/+$/, '');
    window.open(`${base}/docs`, '_blank');
}

</script>

<style scoped>
.custom-icon {
    width: 30px;
    height: auto;
    margin-right: 10px;
}
</style>
