<script setup name="Variant">
 import Navbar2 from '../../components/Navbar2.vue';
 //import {PhewasPlot, PhewasTable} from '../../components/Phewas.vue'

 var variantCode = "17: 29,406,577 A/G (rs7208552)"
 var nearestGene = "TAOK1"
 var afRange = [0.51, 0.52]
</script>

<template>
  <v-app >
    <Navbar2 />
    <v-main style="margin: 0; text-align:left; max-width:2000px;">
      <div class="container-fluid mb-3">
        <h1 class="fw-bold">{{variantCode}}</h1>
        <small class="text-body-primary"> Nearest gene: <i>{{nearestGene}}</i></small>
        <br>
        <small class="text-body-primary"> AF ranges from {{afRange[0]}} to {{afRange[1]}}</small>
        <br>
        <small class="text-body-primary"> View on <a href="/home">UCSC</a>, <a href="/home">GWAS Catalog</a>, <a href="/home">dbSNP</a></small>
      </div>
      <PhewasPlot />
      <PhewasTable />
    </v-main>
  </v-app>
</template>

<style scoped>
.my-card {
  background-color: #f0f0f0; /* Specific background for this card */
  padding: 2rem;
}
</style>