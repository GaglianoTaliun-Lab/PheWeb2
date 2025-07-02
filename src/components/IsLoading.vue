<template>
  <v-card class="d-flex flex-column align-center justify-center mb-5" style="height: 10%;">
    <v-progress-linear
      indeterminate
      color="primary"
      height="5"
    ></v-progress-linear>
    <v-progress-circular indeterminate color="primary" class="mt-2"></v-progress-circular>
    <span class="text-center" >{{ loadingText }}</span>
  </v-card>
</template>

<script setup>
  const props = defineProps({
    isLoading: Boolean,
    loadingText: String,
  });
</script>