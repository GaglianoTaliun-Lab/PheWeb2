<!-- components/Citations.vue -->
<template>
  <v-card elevation="0" class="citation-card" outlined>
    <v-card-text>
      <h5 class="citation-heading"><strong>Please Cite:</strong></h5>
      <ul>
        <li>
          Bellavance, J., Xiao, H., Chang, L. et al. Exploring and visualizing stratified GWAS results with PheWeb2.
          <em>Nature Genetics</em>, 58, 233–235 (2026).
          <a href="https://doi.org/10.1038/s41588-025-02469-8" target="_blank">https://doi.org/10.1038/s41588-025-02469-8</a>
        </li>
        <li>
          Gagliano Taliun, S. A., VandeHaar, P., Boughton, A. P., Welch, R. P., Taliun, D., Schmidt, E. M., Zhou, W., Nielsen, J. B., Willer, C. J., Lee, S., Fritsche, L. G., Boehnke, M., & Abecasis, G. R. (2020). Exploring and visualizing large-scale genetic associations by using PheWeb. 
          <em>Nature Genetics</em>, 52(6), 550–552. 
          <a href="https://doi.org/10.1038/s41588-020-0622-5" target="_blank">https://doi.org/10.1038/s41588-020-0622-5</a>
        </li>
      </ul>
    </v-card-text>
  </v-card>
</template>

<script setup>
// No need for script logic since this is static content.
</script>

<style scoped>
.citation-card {
  margin-top: 5rem;
  max-width: 1200px;
  margin-inline: auto;
  text-align: left;
}

.citation-heading {
  text-align: center; /* Centers the "Please Cite" heading */
  margin-bottom: 1rem; /* Adds space below the heading */
}

p {
  text-align: left; /* Ensures citations stay left-aligned */
}
</style>
