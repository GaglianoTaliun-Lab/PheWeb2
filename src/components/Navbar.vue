<template>
    <div class="container" style="position: fixed; top:3%; right: 5%; width: 100%; height: 60px; z-index: 1000;">
        <v-row align="center" justify="space-between">
            <v-col cols="auto"  style="position: fixed; left: 2%">
                <router-link :to="{ name: 'Home' }" tag="v-btn" icon="$vuetify">
                    <img src="../assets/favicon.svg" alt="Icon" class="custom-icon">
                </router-link>
            </v-col>
            <v-row align="center" justify="end">
                <v-col cols="auto">
                    <v-btn variant="plain" density="compact" class="custom-btn" :to="{ name: 'Phenotypes' }">Phenotypes</v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-btn variant="plain" density="compact" class="custom-btn" :to="{ name: 'Tophits' }">Top Hits</v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-btn variant="plain" density="compact" class="custom-btn" :to="{ name: 'Random' }">Random</v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-btn variant="plain" density="compact" class="custom-btn" :to="{ name: 'About' }">About</v-btn>
                </v-col>
            </v-row>
        </v-row>
    </div>
</template>

<script setup name="Navbar">

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