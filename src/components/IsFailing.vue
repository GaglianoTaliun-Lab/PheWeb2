<template>
  <v-card v-if="isFailed && !isLoading" class="d-flex flex-column align-center justify-center mb-5" style="height: 10%;">
    <v-icon color="error" size="large">mdi-alert-circle</v-icon>
    <span class="mt-2">Failed to load data. Please try again later.</span>
  </v-card>
</template>

<script setup>
  const props = defineProps({
    isFailed: Boolean,
    isLoading: Boolean,
  });
</script>