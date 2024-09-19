<script setup name="Variant">
 import Navbar2 from '../../components/Navbar2.vue';
 //import {PhewasPlot, PhewasTable} from '../../components/Phewas.vue'

 var variantCode = "17: 29,406,577 A/G (rs7208552)"
 var nearestGene = "TAOK1"
 var afRange = [0.51, 0.52]
</script>

<template>
  <div class="container-fluid mb-3">
    <h1 class="fw-bold">{{variantCode}}</h1>
    <small class="text-body-primary"> Nearest gene: <i>{{nearestGene}}</i></small>
    <br>
    <small class="text-body-primary"> AF ranges from {{afRange[0]}} to {{afRange[1]}}</small>
    <br>
    <small class="text-body-primary"> View on <a href="/home">UCSC</a>, <a href="/home">GWAS Catalog</a>, <a href="/home">dbSNP</a></small>
  </div>
</template>