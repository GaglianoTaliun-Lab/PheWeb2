<template >
  <v-app >
    <Navbar2 />
    <v-main class="home">
      <div>
        <img src="../../assets/CLSA_logo.png" class="img-fluid mb-3 custom-img" alt="...">
        <div class="container-fluid mb-3">
          <h1 class="fw-bold">{{appTitle}}</h1>
          <small class="text-body-secondary">{{appSubtitle}}</small>
        </div>
        <div>
          <SearchBox />
          <Home_info />
        </div>
        <v-card elevation="0" variant="plain" style="position: relative; bottom: 5%; margin-top: 10%;" >
          <Acknowledge_Image />
        </v-card>
      </div>
    </v-main>
  </v-app>
</template>
  

<script setup name="Home">
  import { ref } from 'vue'
  import Home_info from '../../components/HomeInfo.vue';
  import SearchBox from '../../components/SearchBox.vue';
  import Acknowledge_Image from '../../components/AcknowledgeImage.vue';
  import Navbar2 from '../../components/Navbar2.vue';

  const appTitle = ref(import.meta.env.VITE_APP_TITLE);
  const appSubtitle = ref(import.meta.env.VITE_APP_SUBTITLE1);
  // console.log(appTitle.value);
</script>

   
<style scoped>
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