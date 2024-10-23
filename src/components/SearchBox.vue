<template>
    <v-text-field 
      prepend-inner-icon="mdi-magnify"
      label="Search for a variant, gene, or phenotype"
      placeholder="Type 2 Diabetes"
      variant="solo"
      clearable
    >
    </v-text-field>
</template>

<script setup name="SearchBox">
import { faSearch } from '@fortawesome/free-solid-svg-icons';
</script>
