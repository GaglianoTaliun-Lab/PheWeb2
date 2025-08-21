<template >
  <v-app>
    <Navbar />
    <v-main class="centered-content">
        <v-card elevation="0">
          <img src="@/assets/CLSA_logo.png" class="img-fluid mb-3 custom-img" alt="clsa_logo">
          <h1 class="fw-bold">{{ VITE_APP_TITLE }}</h1>
          <small class="text-body-secondary">{{ VITE_APP_SUBTITLE1 }}</small>
        </v-card>

        <v-container class="centered-content" style="margin-top: 2%;">
          <SearchBox />
          <HomeInfo />
        </v-container>
        
        <Citations />

        <v-card elevation="0" variant="plain" style="position: relative; bottom: 5%; margin-top: 10%;" >
          <Acknowledge_Image />
        </v-card>
    </v-main>
  </v-app>
</template>
  

<script setup name="Home">
  import HomeInfo from '@/components/HomeInfo.vue';
  import SearchBox from '@/components/SearchBox.vue';
  import Acknowledge_Image from '@/components/AcknowledgeImage.vue';
  import Navbar from '@/components/Navbar.vue';
  import Citations from '@/components/Citations.vue';

  import { VITE_APP_SUBTITLE1, VITE_APP_TITLE } from "@/config";

  // const appTitle = ref(import.meta.env.VITE_APP_TITLE);
  // const appSubtitle = ref(import.meta.env.VITE_APP_SUBTITLE1);
</script>

   
<style>

.centered-content {
  max-width:fit-content;
  margin-inline: auto;
  text-align: center;
  padding: 2rem;
}

.custom-img {
  width: 200px; 
  height: auto; 
};
.fixed-bottom {
  position: fixed;
  padding-top: 50px;
  bottom: 0;
  width: 100%; 
  left: 0;
};

</style>