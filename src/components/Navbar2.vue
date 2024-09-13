<template>
    <v-app-bar app fixed elevation="0" style="width: 95%; margin-left: 2%;" >
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
            <router-link :to="{ name: 'Home' }" tag="v-btn" icon="$vuetify">
                    <img src="../assets/favicon.svg" alt="Icon" class="custom-icon">
            </router-link>
        </v-col>
        <v-row align="center" justify="end">
          <v-col cols="auto">
            <v-btn text variant="plain" class="custom-btn" :to="{ name: 'Phenotypes' }">Phenotypes</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn text variant="plain" class="custom-btn" :to="{ name: 'Tophits' }">Top Hits</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn text variant="plain" class="custom-btn" :to="{ name: 'Random' }">Random</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn text variant="plain" class="custom-btn" :to="{ name: 'About' }">About</v-btn>
          </v-col>
        </v-row>
      </v-row>
    </v-app-bar>
  </template>

<script setup>

</script>

<style lang="scss" scoped>
.custom-btn {
  font-weight: bold; 
  font-size: 15px;   
  letter-spacing: .3px; 
//   width: 5%; 

}
.custom-icon {
  width: 30px;  
  height: auto; 
}
.v-col {
  margin-left: 1px; 
}
</style>