<!-- components/Citations.vue -->
<template>
  <v-card elevation="0" class="citation-card" outlined>
    <v-card-text>
      <h5 class="citation-heading"><strong>Please Cite:</strong></h5>
      <ul>
	<li>
	  Preprint: Bellavance, J., Xiao, H., Chang, L., Kazemi, M., Wickramasinghe, S., Mayhew, A.J., Raina, P., VandeHaar, P., Taliun, D., & Gagliano Taliun, S.A. (2025). Exploring and visualizing stratified genome-wide association study results with PheWeb 2.
        </li>
        <li>
          Gagliano Taliun, S. A., VandeHaar, P., Boughton, A. P., Welch, R. P., Taliun, D., Schmidt, E. M., Zhou, W., Nielsen, J. B., Willer, C. J., Lee, S., Fritsche, L. G., Boehnke, M., & Abecasis, G. R. (2020). Exploring and visualizing large-scale genetic associations by using PheWeb. 
          <em>Nature Genetics</em>, 52(6), 550–552. 
          <a href="https://doi.org/10.1038/s41588-020-0622-5" target="_blank">https://doi.org/10.1038/s41588-020-0622-5</a>
        </li>
        <li>
          Forgetta, V., Li, R., Darmond-Zwaig, C., Belisle, A., Balion, C., Roshandel, D., Wolfson, C., Lettre, G., Pare, G., Paterson, A. D., Griffith, L. E., Verschoor, C., Lathrop, M., Kirkland, S., Raina, P., Richards, J. B., & Ragoussis, J. (2022). Cohort profile: genomic data for 26,622 individuals from the Canadian Longitudinal Study on Aging (CLSA). 
          <em>BMJ Open</em>, 12(3), e059021. 
          <a href="https://doi.org/10.1136/bmjopen-2021-059021" target="_blank">https://doi.org/10.1136/bmjopen-2021-059021</a>
        </li>
        <li>
          Raina, P., Wolfson, C., Kirkland, S., Griffith, L. E., Balion, C., Cossette, B., Dionne, I., Hofer, S., Hogan, D., van den Heuvel, E. R., Liu-Ambrose, T., Menec, V., Mugford, G., Patterson, C., Payette, H., Richards, B., Shannon, H., Sheets, D., Taler, V., Thompson, M., … Young, L. (2019). Cohort Profile: The Canadian Longitudinal Study on Aging (CLSA). 
          <em>International Journal of Epidemiology</em>, 48(6), 1752–1753j. 
          <a href="https://doi.org/10.1093/ije/dyz173" target="_blank">https://doi.org/10.1093/ije/dyz173</a>
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
