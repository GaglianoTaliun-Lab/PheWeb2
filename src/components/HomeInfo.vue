<template>
    <!-- <div class="container-fluid p-2">
        <div class="alert alert-info text-start" role="alert">
            <strong>Important!</strong> 
            This tool aims to provide the research community with an overview of GWAS/PheWAS results 
            derived from the <a href="https://www.clsa-elcv.ca/">CLSA comprehensive cohort</a>. 
            The association results presented  are constantly being improved. 
            Please exercise caution when interpreting these results and using them for downstream analyses. 
            See the <a href="about">About page</a> for details on the QC and analytical pipeline. 
            If you have suggestions or see something that should be improved, please let us know!
            </div>
    </div> -->

    <v-alert
        text=""
        title="Important!"
        type="info"
        show-icon
        variant="tonal"
        closable
        density="compact"
        class="text-start"
        border="top"
    >
    This tool is designed to provide the community with a comprehensive overview of GWAS and PheWAS results from our genomic atlas of imaging phenotypes, including cardiac MRI, DXA-derived adiposity, and DXA-derived bone traits. For detailed information on phenotype definitions, data quality control, and analytical pipelines, please refer to our paper. We welcome suggestions and feedback to help improve this resource, so please feel free to reach out using the contact details provided on our <a href="contact">Contact page</a>.
    </v-alert>

</template>

<script setup name="HomeInfo">

</script>

<style lang="scss" scoped>
    .container-fluid {
        max-width: 1280px; /* Set the max width */
        width: 100%;       /* Responsive width */
        margin: 0 auto;    /* Center it horizontally */
        padding: 1rem;     /* Add padding for some space around the container */
    }
</style>
