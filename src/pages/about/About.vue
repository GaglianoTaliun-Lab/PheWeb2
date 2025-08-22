<template>
    <v-app>
        <Navbar />
        <v-main>
            <v-btn :icon="drawer ? 'mdi-menu-down' : 'mdi-menu-right'"  @click="drawer = !drawer"></v-btn>
            <v-navigation-drawer v-model="drawer" app :width="200" align="left" location="left"> 
                <v-list-item link variant="plain" @click="selectContent('Overview')" title="Overview"></v-list-item>
                <v-divider></v-divider>
                <v-list-item link variant="plain" @click="selectContent('GenotypeData')" title="1. Genotype Data"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('LiftOver')" title="2. LiftOver"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('Pre-LiftOver')" subtitle="2.1 Sample-level and variant-level filters"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('LiftOverGRCh38')" subtitle="2.2 LiftOver to GRCh38"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('HweRuth')" subtitle="2.3. Ancestry-adjusted HWE filters"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('TOPMedImputation')" title="3. TOPMed Imputation"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('PhenotypeAssociation')" title="4. Phenotype Association"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('AncestryEuro')" subtitle="4.1 Ancestry Check and European Subset"></v-list-item>
                <!-- <v-list-item link variant="plain" @click="selectContent('BinaryPhenotype')" subtitle="4.2 Selecting Binary Phenotypes"></v-list-item> -->
                <v-list-item link variant="plain" @click="selectContent('ContinuousPhenotype')" subtitle="4.2 Selecting Continuous Phenotype"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('Regenie')" subtitle="4.3 Association Model (Regenie)"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('PheWeb')" title="5. PheWeb"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('UpdateHistory')" title="6. Update History"></v-list-item>
            </v-navigation-drawer>
            <div  align="left" style="padding: 2%;">
                <!-- OVERVIEW SECTION -->
                <div v-if="selectedContent === 'Overview'" id="Overview"> 
                <div>
                    <h2 class="text-center">About CLSA PheWeb</h2>
                </div>
                <hr>
                <p> This platform presents multiple analyses conducted using CLSA data to the scientific community as well as the public at large. The <a href="https://www.clsa-elcv.ca/" target="_blank">CLSA</a> cohort is specific to Canada. </p>
                <p> This platform displays genome-wide association (GWAS) and phenome-wide association (PheWAS) results from the CLSA cohort (i.e., statistical associations between individuals' trait information and genomic variations across the available traits in the cohort). </p>
                </div>
                
                <!-- DATA DESCRIPTION -->
                <div v-if="selectedContent === 'GenotypeData'" id="GenotypeData">
                    <h2 class="text-center">Genotype Data</h2>
                    <hr>
                    <p>Original non-imputed CLSA genotype data (v3) has 794,409 variants for 26,622 participants.</p>
                    <p>Participants were genotyped using the Affrymetrix UK Biobank Axiom array.</p>
                    <p>Originally, all genomic positions were reported in reference to human genome build GRCh37.</p>
                    <p>More information can be found on the <a href="https://bmjopen.bmj.com/content/12/3/e059021" target="_blank">official genomic cohort profile paper</a>.</p>
                </div>

                <!-- LiftOver and CLSA filtering Overview -->
                <div v-if="selectedContent === 'LiftOver'" id="LiftOver">
                    <h2 class="text-center">LiftOver</h2>
                    <hr>
                    <p>We performed liftOver to convert genomic positions from GRCh37 to GRCh38, as described in the following sections.</p>
                </div>
                    
                <div v-if="selectedContent === 'Pre-LiftOver'" id="Pre-LiftOver">
                    <h3>Sample-level and variant-level filters</h3>
                    <hr>
                    <p>CLSA flagged variants that may have low quality due to:</p>
                    <ol>
                        <li>Batch Discordance (14,753 variants)</li>
                        <li>Hardy-Weinberg Discordance (7,790 variants, with p < 3.15e-10)</li>
                        <li>Control Genotype Discordance (27,937 variants)</li>
                        <li>Sex Discordance (248 variants)</li>
                    </ol>
                    <p>Before liftOver, we removed these flagged variants. This filter removed 37,706 variants, resulting in 756,703 kept.</p>
                    <p>With regard to sample quality control, we removed samples:</p>
                    <ol>
                        <li>Identified as an outlier in relation to heterozygosity or genotype missingness (15 samples)</li>
                        <li>Differing reported sex versus chromosomal sex (48 samples)</li>
                        <li>Missing self-reported sex (0 samples)</li>
                        <li>Missing chromosomal sex (15 samples)</li>
                    </ol>
                    <p>These filters removed 63 samples, keeping 26,563.</p>
                    <p>Finally, we excluded monomorphic variants which resulted from sample exclusions. This removed an additional 14,682 variants, such that 742,021 remained.</p>

                </div>

                <div v-if="selectedContent === 'LiftOverGRCh38'" id="LiftOverGRCh38" >
                    <h3>LiftOver to GRCh38 Reference</h3>
                    <hr>
                    <p>We converted genotype array data for assessed SNPs from genome build GRCh37 to GRCh38 aligned to the "+" strand using LiftOver. The conversion included the following steps:</p>
                    <ol>
                        <li>We lifted genetic positions from GRCh37 to GRCh38 using the UCSC LiftOver tool and the corresponding chain files.</li>
                        <li>We excluded variants that did not map to GRCh38, mapped to alternate contigs in GRCh38, or located on the mitochondrial chromosome.</li>
                        <li>We aligned A1/A2 alleles in the original PLINK files to the REF/ALT alleles on the "+" strand using the plink2reference.py script.</li>
                        <li>We excluded palindromic variants (A/T and G/C), variants for which A1/A2 alleles didn't match REF/ALT, and for which A1/A2 alleles were not A, C, G, or T.</li>
                        <li>We renamed all variants to follow the CHR:POS:REF:ALT notation.</li>
                    </ol>
                    <p>We started with 742,021 variants (GRCh37) and following these steps, ended up with 682,192 variants (GRCh38) successfully lifted over.</p>
                    <br>
                    <p> Table 1. Distribution of SNPs per chromosome after liftOver steps.</p>
                    <v-data-table-virtual
                        :items="SNPdistribution" 
                        :headers="headers"
                        height="300"
                        >
                        <template v-slot:item.snp="{ value }">
                            <v-chip>
                                {{ value }}
                            </v-chip>
                        </template>
                    </v-data-table-virtual>
                </div>

                <div v-if="selectedContent === 'HweRuth'" id='HweRuth'>
                    <h3>Ancestry-adjusted HWE filters</h3>
                    <hr>
                    <p>Using Robust Unified Hardy-Weinberg Equilibrium Test (<a href="https://github.com/statgen/ruth" target = "_blank" >RUTH</a>), we confirmed the CLSA's hardy-weinberg equilibrium exclusion criteria.</p>
                    <p>We ran RUTH on the results from step 2.2 using the 20 first PCs using the likelihood-ratio test with max lambda parameter of 0, using the GT field. We used seed 101.</p>
                    <p>No additional variants were excluded using this test.</p>
                </div> 

                <!-- TOPMed Imputation -->
                <div v-if="selectedContent === 'TOPMedImputation'" id='TOPMedImputation'>
                    <h2 class="text-center">TOPMed Imputation</h2>
                    <hr>
                    <p>Genotype imputation is a computational method to infer genotypes at genetic variants that are not directly capture by the genotype array, but are present in reference whole-genome sequences.</p>
                    <p>Genotype imputation was carried out by the CLSA, and <a href="https://www.nhlbi.nih.gov/science/trans-omics-precision-medicine-topmed-program" target="_blank"></a>TOPMed version r2 was used as a reference panel.</p>
                    <p>As input to the imputation process, the CLSA team used all 26,622 participants and 716,347 genotyped variants that:</p>
                    <ol>
                        <li>Pass all tests (no discordance from genotype frequency, no departure form HWE, no discordance from controls, no discordance in genotype frequency between males and females).</li>
                        <li>Genotype missingness of < 0.05</li>
                        <li>MAF > 0.0001</li>
                    </ol>
                    <p>The TOPMed reference panel version r2, contains 97,256 reference samples belonging to diverse genetic ancestries and 308,107,085 genetic variants. EAGLE2 and Minimac where used to pre-phase and impute the genotyping data. </p>
                </div>

                    <!-- TOPMed Imputation -->
                    <div v-if="selectedContent === 'TOPMedImputation'" id='TOPMedImputation'>
                        <h2 class="text-center">TOPMed Imputation</h2>
                        <hr>
                        <p>Genotype imputation is a computational method to infer genotypes at genetic variants that are not directly capture by the genotype array, but are present in reference whole-genome sequences.</p>
                        <p>Genotype imputation was carried out by the CLSA, and <a href="https://www.nhlbi.nih.gov/science/trans-omics-precision-medicine-topmed-program" target="_blank"></a>TOPMed version r2 was used as a reference panel.</p>
                        <p>As input to the imputation process, the CLSA team used all 26,622 participants and 716,347 genotyped variants that:</p>
                        <ol>
                            <li>Pass all tests (no discordance from genotype frequency, no departure form HWE, no discordance from controls, no discordance in genotype frequency between males and females).</li>
                            <li>Genotype missingness of < 0.05</li>
                            <li>MAF > 0.0001</li>
                        </ol>
                        <p>The TOPMed reference panel version r3, contains 133,597 reference samples belonging to diverse genetic ancestries and 445,600,184 genetic variants. EAGLE v2.4 and Minimac v2.0.0-beta3 were used to pre-phase and impute the genotyping data. </p>
                    </div>

                    <!-- Ancestry Check and European Subset  -->
                    <div v-if="selectedContent === 'AncestryEuro'" id='AncestryEuro'>
                        <h2 class="text-center">Subsetting the European sub-population</h2>
                        <hr>
                        <p>We ran our own ancestry check and filtering using a custom pipeline implementing methods seen <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9900804/" target="_blank">here</a>. The pipeline can be found <a href="https://github.com/CERC-Genomic-Medicine/HGDP_1KG_ancestry_inference" target="_blank">here</a></p>
                        <p>We subset individuals of predicted European genetic ancestry. For ancestry prediction we followed the following steps:</p>
                        <ol>
                            <li>We used <a href="https://csg.sph.umich.edu/chaolong/LASER/TRACE_Manual.pdf" target = "_blank">TRACE</a> to project principal components onto Human Genome Diversity Project (HGDP) and 1000 Genomes Project (1KG) combined references (Figure 1). We removed individuals that had a Z score of <span>&#177;</span>5.</li>
                            <li>Using the projection results, we used a RandomForestModel to calculate probabilities of ancestry group.</li>
                            <li>We used 0.79 probability as the inclusion threshold for the European subset.</li>
                        </ol>
                        <p>These steps resulted in 24,505 individuals in the European subset for analysis.</p>
                        <br/>
                        <!-- Insert the image here -->
                        <v-card>
                            <img src="@/assets/eur_vs_reference_square_pcs.png" alt="Figure 1 - PCA Projection" class="img-fluid mt-3" />
                            <b>Figure 1.</b>CLSA samples with inferred European ancestry projected onto the HGDP and 1KG's PCA space.
                        </v-card>
                        <v-card>
                            <img src="@/assets/incrfont_top3pcs_eur_subset_square_title.png" alt="Figure 2 - Top 3 Principal Components" class="img-fluid mt-3" />
                            <b>Figure 2.</b>Top 3 principal components of CLSA samples with inferred European ancestry (N=24505).
                        </v-card>
                        
                    </div>

                    <!-- <div v-if="selectedContent === 'BinaryPhenotype'" id = 'BinaryPhenotype'>
                        <h3>Selecting Binary Phenotypes</h3>
                        <hr></hr>
                        <p>Binary phenotypes were selected with the following criteria (Figure 2):</p>
                        <ol>
                            <li>The variable is binary (2 choices)</li>
                            <li>The variable has more than 1000 cases</li>
                            <li>The variable has GWAS relevance</li>
                        </ol>
                        <p>The final number of continuous phenotypes was 348.</p>
                        <br>
                        <v-card>
                            <b>Figure 2.</b>Flow chart of filtering criteria for binary variables.
                            <img src="@/assets/binary_diagram.png" alt="Figure 2 - Binary Diagram" class="img-fluid mt-3" />
                        </v-card>
                    </div> -->

                    <div v-if="selectedContent === 'ContinuousPhenotype'" id="ContinuousPhenotype">
                        <h3>Selecting Continuous Phenotypes</h3>
                        <hr></hr>
                        <p>Continous phenotypes were selected with the following criteria (Figure 3):</p>
                        <ol>
                            <li>Removed outliers <span>&#177;</span>5 standard deviations from the mean</li>
                            <li>The variable has more than 20 uniques numeric values, as to remove semi-quantitative variables that are not modeled correctly in linear regression.</li>
                            <li>The variable has more than 1000 total numeric values</li>
                            <li>The variable has does not have one value which accounts for more than 10% of all values</li>
                            <li>The variable has GWAS relevance</li>
                        </ol>
                        <p>The final number of continuous phenotypes was 225 for combined, 211 for the female stratification and 207 for the male stratification</p>
                        <br>
                        <v-card>
                            <b>Figure 3.</b>Flow chart of filtering criteria for continuous variables.
                            <img src="@/assets/Continuous_Diagram225.drawio.png" alt="Figure 3 - Continuous Diagram" class="img-fluid mt-3" />
                        </v-card>
                    </div>

                    <div v-if="selectedContent === 'Regenie'" id="Regenie">
                        <h3>Regenie</h3>
                        <hr></hr>
                        <p>Association testing was performed using <a href="https://rgcgithub.github.io/regenie/" target="_blank">Regenie</a> v3.2.1, which handles unbalanced case-control ratios and accounts for population structure and relatedness. Our automated Nextflow pipeline for executing Regenie in a highly parallel way is available <a href="https://github.com/CERC-Genomic-Medicine/Regenie_nextflow" target = "_blank" >here</a>.</p>
                        <p>After filtering european sub-population, we proceeded to further filter common non-imputed variants for step 1 of Regenie.</p>
                        <p>We performed the following:</p>
                        <ol>
                            <li>Removed variants with sample missingness of > 0.1</li>
                            <li>Removed samples with genotype missingness of > 0.1</li>
                            <li>Variants departing from Hardy-Weinberg equilibrium with a p-value less than 1e-15</li>
                            <li>Linkage disequilibrium pruning of correlated variants with window size of 1000, step size of 100 and Rsq threshold of 0.9</li>
                        </ol>
                        <p>At the end, we had this distribution of variants per chromosome for 24,505 individuals:</p>
                        <v-data-table-virtual
                            :items="SNPdistribution_regenie" 
                            :headers="headers"
                            height="300"
                            >
                            <template v-slot:item.snp="{ value }">
                                <v-chip>
                                    {{ value }}
                                </v-chip>
                            </template>
                        </v-data-table-virtual>
                        <p>For a total of 338,706 SNPs.</p>
                        <p>For both binary and continuous variables, we used a block size of 1000, leave-one-out cross validation</p>
                        <p>For binary variables, the firth approximation was used for variants with p-value less than 0.05 for both steps.</p>
                        <p>For continuous variables, rank inverse normal transformation was used for both steps.</p>
                        <p>For both steps, we used the covariates of: genotyping batch (1-5), sex, age, age<sup>2</sup>, 1-20 PCs</p>
                    </div>
                    
                    <div v-if="selectedContent === 'PheWeb'" id="PheWeb"> 
                        <p>The CLSA PheWeb is built on the Vue.js platform</p>
                    </div>
                    <div v-if="selectedContent === 'UpdateHistory'" id='UpdateHistory'>
                        <h2 class="text-center">Update History</h2>
                        <hr>
                        <ul>
                            <li>Added external links for gene page: link to NCBI, Emsemble and Open Targets (11/07/2024); </li>
                            <li>Added filtering in phenotypes page (11/01/2024);</li>
                            <li>Added support for Miami plot and Manhattan plot filtering (10/23/2024);</li>
                            <li>Enabled selecting sex from the GWAS table (10/23/2024);</li>
                            <li>Enabled filtering functionality by sex (10/22/2024);</li>
                            <li>Enabled displaying tophits table & download functionality for the phenotypes table (10/22/2024);</li>
                            <li>The rsid and nearest genes columns now features clickable rsid/gene names, allowing users to easily access detailed information on external databases (10/17/2024);</li>
                            <li>Enabled sorting and searching functionalities in the phenotypes table (10/10/2024);</li>
                            <li>Added support to download Manhattan plot and Miami plot in PNG and SVG format (10/10/2024);</li>
                            <li>Added LocusZoom panels for all stratifications in LocusZoom region plots (09/07/2024);</li>
                            <li>Added LocusZoom panels for all stratification combinations in LocusZoom PheWAS plots (09/07/2024);</li>
                            <li>Added functionality to MAF filtering for Miami plot (07/29/2024);</li>
                            <li>Added buttons to order 'category', 'phenotype', '# samples', '# Loci&lt;5e-8' and 'P-value' in all phenotypes page (07/19/2024);</li>
                            <li>Added stratification, ancestry and interaction term columns to tables (07/18/2024);</li>
                            <li>Added functionality to allow multiple of same phenotype names, if they have unique stratification combination (07/03/2024);</li>
                            <li>Added Miami plot functionality: allow users to choose 'male' and 'female' on page loading, if it exists (05/23/2024);</li>
                            <li>Added drop downs, where users can alternate data on top and bottom plots, or generate simple Manhattan plot (05/20/2024);</li>
                            <li>Added stratifications to 'all phenotypes' table as columns in all phenotypes page (05/03/2024);</li>    
                            <li>Download button now includes stratification in all phenotypes page (04/30/2024);</li>
                            <li>Added functionality to show all QQ plots (04/18/2024).</li>
                        </ul>    
                    </div>
            </div>
        </v-main>
    </v-app>
</template>

<script setup name="About">
    import Navbar from '@/components/Navbar.vue';
    import { ref } from 'vue'

    const selectedContent = ref('Overview');
    const drawer = ref(true);
    function selectContent(content) {
        selectedContent.value = content; 
    }

    const headers = [
        { title: 'Chromosome', value: 'chr'},
        { title: 'Number of SNPs', value: 'snp'}
    ]

    const SNPdistribution = [
        { chr: 1, snp: 53930 },
        { chr: 2, snp: 52913 },
        { chr: 3, snp: 44421 },
        { chr: 4, snp: 41180 },
        { chr: 5, snp: 39271 },
        { chr: 6, snp: 46142 },
        { chr: 7, snp: 36114 },
        { chr: 8, snp: 33217 },
        { chr: 9, snp: 29276 },
        { chr: 10, snp: 33078 },
        { chr: 11, snp: 34050 },
        { chr: 12, snp: 31926 },
        { chr: 13, snp: 22317 },
        { chr: 14, snp: 21693 },
        { chr: 15, snp: 20925 },
        { chr: 16, snp: 23932 },
        { chr: 17, snp: 23306 },
        { chr: 18, snp: 19146 },
        { chr: 19, snp: 20563 },
        { chr: 20, snp: 17244 },
        { chr: 21, snp: 9807 },
        { chr: 22, snp: 10890 },
        { chr: 'X', snp: 15549 }
    ]

    const SNPdistribution_regenie = [
        { chr: 1, snp: 26319 },
        { chr: 2, snp: 26537 },
        { chr: 3, snp: 21961},
        { chr: 4, snp: 20823},
        { chr: 5, snp: 20043},
        { chr: 6, snp: 19441},
        { chr: 7, snp: 18494},
        { chr: 8, snp: 16440},
        { chr: 9, snp: 15021},
        { chr: 10, snp: 17505},
        { chr: 11, snp: 16159},
        { chr: 12, snp: 15601},
        { chr: 13, snp: 11919},
        { chr: 14, snp: 11202},
        { chr: 15, snp: 10768},
        { chr: 16, snp: 11953},
        { chr: 17, snp: 11463},
        { chr: 18, snp: 10701},
        { chr: 19, snp: 8816},
        { chr: 20, snp: 8675},
        { chr: 21, snp: 5338},
        { chr: 22, snp: 5667},
        { chr: 'X', snp: 7860}
    ]


</script>

<style scoped>
</style>

