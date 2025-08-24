<template>
    <v-app>
        <Navbar />
        <v-main>
            <v-btn :icon="drawer ? 'mdi-menu-down' : 'mdi-menu-right'"  @click="drawer = !drawer"></v-btn>
            <v-navigation-drawer v-model="drawer" app :width="200" align="left" location="left"> 
                <v-list-item link variant="plain" @click="selectContent('Overview')" title="Introduction"></v-list-item>
                <v-divider></v-divider>
                <v-list-item link variant="plain" @click="selectContent('GenotypeData')" title="1. Genotype Data"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('Filtering')" subtitle="1.1. Filtering"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('LiftOverGRCh38')" subtitle="1.2. Converting to GRCh38"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('TOPMedImputation')" title="2. Genotype Imputation"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('AncestryEuro')" title="3. Genetic Ancestries"></v-list-item>
                <!-- <v-list-item link variant="plain" @click="selectContent('BinaryPhenotype')" subtitle="4.2 Selecting Binary Phenotypes"></v-list-item> -->
                <v-list-item link variant="plain" @click="selectContent('ContinuousPhenotype')" title="4. Continuous Phenotypes"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('SingleVariant')" title="5. Single Variant Association"></v-list-item>
                <v-list-item link variant="plain" @click="selectContent('LD')" subtitle="5.1. Relatedness and Population Structure"></v-list-item>
		<v-list-item link variant="plain" @click="selectContent('Regenie')" subtitle="5.2. Regression Model"></v-list-item>
		<v-list-item link variant="plain" @click="selectContent('PheWeb')" subtitle="6. PheWeb2 Data"></v-list-item>

		<!--<v-list-item link variant="plain" @click="selectContent('PheWeb')" title="5. PheWeb"></v-list-item>
		<v-list-item link variant="plain" @click="selectContent('UpdateHistory')" title="6. Update History"></v-list-item>-->
            </v-navigation-drawer>
            <div  align="left" style="padding: 2%;">
                <!-- OVERVIEW SECTION -->
                <div v-if="selectedContent === 'Overview'" id="Overview"> 
                <div>
                    <h2 class="text-center">About Canadian Longitudinal Study on Aging PheWeb</h2>
                </div>
                <hr>
	            <p>This platform presents genome-wide association (GWAS) and phenome-wide association (PheWAS) results from the  <a href="https://www.clsa-elcv.ca/" target="_blank">Canadian Longitudinal Study on Aging (CLSA) cohort</a>, showing statistical associations between various traits and genetic variations collected and assessed by the cohort.</p>

		    <p>The following sections of the About page offer a brief description of the data preparation and analytical pipeline. If you have any specific questions or require more detailed information, please feel free to reach out. Our contact information is available on the <a href="contact">Contact page</a>.</p>
		</div>
                
                <!-- DATA DESCRIPTION -->
                <div v-if="selectedContent === 'GenotypeData'" id="GenotypeData">
                    <h2>1. Genotype Data</h2>
                    <hr>
		    <p>The original non-imputed CLSA genotype data (v3) comprises 794,409 variants from 26,622 participants. Participants were genotyped using the Affymetrix UK Biobank Axiom array, with all genomic positions reported based on the human genome build GRCh37. For further details, please refer to the <a href="https://bmjopen.bmj.com/content/12/3/e059021" target="_blank">official genomic cohort profile paper</a>.
		    </p>
                </div>
                   
                <div v-if="selectedContent === 'Filtering'" id="Filtering">
                    <h3>1.1. Filtering</h3>
                    <hr>
		    <p>The CLSA flagged genetic data that did not meet individual-level and variant-level quality control criteria, as detailed in the <a href="https://bmjopen.bmj.com/content/12/3/e059021" target="_blank">official profile paper</a>.</p>
		    <p>First, we removed genetic variants flagged by CLSA that did not pass the following quality control criteria:</p>
		    <ol>
			<li><b>Genotyping batch discordance</b>: 14,753 variants</li>
			<li><b>Hardy-Weinberg discordance</b>: 7,790 variants</li>
			<li><b>Control genotype discordance</b>: 27,937 variants</li>
			<li><b>Sex discordance</b>: 248 variants</li>
                    </ol>
		    <p>A total of 756,703 variants were retained after applying variant-level quality control filters that removed 37,706 variants.</p>
                    <p>Second, we removed samples flagged by CLSA that did not meet the following quality control criteria:</p>
                    <ol>
			<li><b>Identified as an outlier in relation to heterozygosity or genotype missingness</b>: 15 samples</li>
			<li><b>Discrepancy between reported sex and chromosomal sex</b>: 48 samples</li>
			<li><b>Missing self-reported sex</b>: 0 samples</li>
			<li><b>Unresolved chromosomal sex</b>: 15 samples</li>
                    </ol>
		    <p>The filters removed 63 samples, resulting in a total of 26,563 samples retained.</p>
		    <p>Finally, we excluded monomorphic variants that resulted from sample exclusions, leading to the removal of an additional 14,682 variants. Consequently, we were left with 742,021 variants.</p>

		    <p>Note: Using the <a href="https://github.com/statgen/ruth" target = "_blank" >Robust Unified Hardy-Weinberg Equilibrium Test (RUTH)</a>, we confirmed the CLSA's exclusion criteria for Hardy-Weinberg equilibrium. We ran RUTH utilizing the first 20 principal components with a likelihood-ratio test and a maximum lambda parameter of 0, focusing on the GT field. Seed 101 was used, and no additional variants were excluded based on this test.</p>
                </div>

                <div v-if="selectedContent === 'LiftOverGRCh38'" id="LiftOverGRCh38" >
                    <h3>1.2. Converting to GRCh38</h3>
                    <hr>
                    <p>We converted genotype array data from the original genome build GRCh37 to GRCh38 (both aligned to the "+" strand), following these steps:</p>
                    <ol>
			    <li>Lifted genetic positions from GRCh37 to GRCh38 using the <a href="https://genome.ucsc.edu/cgi-bin/hgLiftOver" target="_blank">UCSC LiftOver tool</a> and corresponding chain files.</li>
                        <li>Excluded variants that did not map to GRCh38, mapped to alternate contigs in GRCh38, or were located on the mitochondrial chromosome.</li>
			<li>Aligned A1/A2 alleles in the original PLINK files to the REF/ALT alleles on the "+" strand using the <a href="https://github.com/CERC-Genomic-Medicine/scripts/blob/master/plink2reference.py" target="_blank">plink2reference.py script</a>.</li>
                        <li>Excluded palindromic variants (A/T and G/C), variants where A1/A2 alleles didn't match REF/ALT, and those where A1/A2 alleles were not A, C, G, or T.</li>
                        <li>Renamed all variants to follow the CHR:POS:REF:ALT notation.</li>
                    </ol>
		    <p>Starting with 742,021 variants from GRCh37, we successfully lifted over 682,192 variants to GRCh38 after applying these steps.</p>
                    <br>
		    <p><b>Table 1.</b> Number of variants per chromosome after converting to GRCh38.</p>
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

                <!-- TOPMed Imputation -->
                <div v-if="selectedContent === 'TOPMedImputation'" id='TOPMedImputation'>
                    <h2>2. Genotype Imputation</h2>
                    <hr>
                    <p>Genotype imputation is a computational method used to infer genotypes at genetic variants that are not directly captured by genotype arrays, but are present in reference whole-genome sequences.</p>

		    <p>We used the TOPMed r3 panel to impute the filtered genotype array data on the GRCh38 build via the <a href="https://imputation.biodatacatalyst.nhlbi.nih.gov/" target="_blank">TOPMed Imputation Server</a>. This panel comprises 133,597 deeply genotyped samples and 445,600,184 unique variants across the autosomes and chromosome X.</p>
		    <p>To prepare the data for imputation, we divided it into two overlapping batches, each with 25,000 randomly allocated individuals, and imputed (including phasing) them separately. After imputation, we merged the batches using <a href="https://github.com/statgen/hds-util.git" target="_blank">hds-util</a>. Specifically, we utilized the imputed genotype dosages for 25,000 individuals from the first batch and the remaining 1,563 individuals from the second batch. For males in the non-pseudo-autosomal regions of chromosome X, we represented genotype dosages as haploids (i.e., imputed genotype dosage ≤ 1).</p>
		    <p>As a result of this imputation process, we obtained a total of 445,125,610 variants across the autosomes and chromosome X, with 138,546,712 variants remaining after filtering for imputation quality (r2≥0.3).</p>
                </div>

                    <!-- Ancestry Check and European Subset  -->
                    <div v-if="selectedContent === 'AncestryEuro'" id='AncestryEuro'>
                        <h2>3. Genetic Ancestries</h2>
                        <hr>                
			<p>
			The majority (>90%) of the CLSA participants are individuals of European genetic ancestry as was descirbed in the <a href="https://bmjopen.bmj.com/content/12/3/e059021" target="_blank">official cohort profile paper</a>.
			We selected individuals for our European genetic ancestry stratification using the following steps:
			</p>
			<ol>
			    <li><b>Principal Component Projection</b>: We used <a href="https://www.cell.com/ajhg/fulltext/S0002-9297(15)00155-X" target="_blank">TRACE</a> to project principal components onto combined references from <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9900804/" target="_blank">the Human Genome Diversity Project (HGDP) and the 1000 Genomes Project (1KG)</a> (see <b>Figure 1</b>). Individuals with a Z score of ±5 were removed from consideration.</li>
			    <li><b>Ancestry Group Probability Calculation</b>: Using the projection results, we employed a <a href="https://github.com/CERC-Genomic-Medicine/HGDP_1KG_ancestry_inference" target="_blank">RandomForestModel</a> to calculate the probabilities of ancestry groups.</li>
			    <li><b>Inclusion Threshold</b>: We set the inclusion threshold for the European subset at a probability of 0.79.</li>
                        </ol>
			<p>These steps resulted in a total of 24,505 individuals in the European genetic ancestry subset for association analysis (see <b>Figure 2</b>).</p>
                        <br/>
                        <!-- Insert the image here -->
                        <v-card class="pa-4">
                            <img src="@/assets/eur_vs_reference_square_pcs.png" alt="Figure 1 - PCA Projection" class="img-fluid mt-3" />
                            <br>
                            <span>
                              <b>Figure 1.</b>CLSA samples with inferred European genetic ancestry projected onto the HGDP and 1KG's PCA space.
                            </span>
                        </v-card>
                        <v-card class="pa-4">
                            <img src="@/assets/incrfont_top3pcs_eur_subset_square_title.png" alt="Figure 2 - Top 3 Principal Components" class="img-fluid mt-3" />
                            <br>
                            <span>
                            <b>Figure 2.</b>Top 3 principal components of CLSA samples with inferred European genetic ancestry (N=24,505).
                            </span>
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
                        <h2>4. Continuous Phenotypes</h2>
                        <hr></hr>
			<p>The criteria for selecting continuous phenotypes for association analysis are as follows (see <b>Figure 1</b>):</p>
			<ol>
			    <li>Outlier values beyond ±5 standard deviations from the mean were removed.</li>
			    <li>Only phenotypes with more than 20 unique numeric values were retained to exclude semi-quantitative variables that do not model correctly in linear regression.</li>
			    <li>Phenotypes with more than 1000 non-missing numeric values were kept.</li>
			    <li>Phenotypes where any single value accounts for more than 10% of all values were dropped.</li>
			    <li>Only phenotypes with GWAS relevance were included.</li>
                        </ol>
			<p>As a result, the final count of continuous phenotypes was 225 for the combined dataset, 211 for females, and 207 for males.</p>
                        <br>
                        <v-card>
                            <b>Figure 1</b>. Flow chart of filtering criteria for continuous variables.
                            <img src="@/assets/Continuous_Diagram225.drawio.png" alt="Figure 3 - Continuous Diagram" class="img-fluid mt-3" />
                        </v-card>
                    </div>

                    <div v-if="selectedContent === 'SingleVariant'" id="SingleVariant">
                        <h2>5. Single Variant Association</h2>
                        <hr></hr>
			<p>
			To conduct single variant association tests, we utilized <a href="https://rgcgithub.github.io/regenie/" target="_blank">Regenie v4.1</a>, which performs linear regression while accounting for population structure and relatedness. To streamline our analyses across hundreds of traits, we developed a Nextflow pipeline that executes Regenie in a highly parallelized manner. This pipeline is available <a href="https://github.com/CERC-Genomic-Medicine/Regenie_nextflow" target = "_blank" >here</a>.
			</p>
		    </div>
		    
		    <div v-if="selectedContent === 'LD'" id="LD">
		        <h3>5.1. Relatedness and Population Structure</h3>
			<p>To model population structure and relatedness, we applied linkage disequilibrium (LD) pruning to the filtered GRCh38 genotyping data to select only  common independent genetic variants.</p>
			<p>For each stratification, we conducted LD pruning as follows:</p>
			<ol>
			<li>We selected only biallelic SNPs with minor allele frequency (MAF) >1%, Hardy-Weinberg test p < 10e-15, per-variant and per-sample missing genotype frequencies < 10%. </li>
			<li>We further pruned SNPs based on LD using the PLINK2 <i>–-indeppairwise</i> option with the window size of 1,000 kbp, step size of 100 SNPs, and r2 LD threshold of 0.9 (i.e. two `SNPs with r2 > 0.9 were considered in LD).</li>
			<li>We also removed SNPs in known <a href="https://doi.org/10.1038/nprot.2010.116" target="_blank">long-range LD regions</a> and low-complexity regions defined in the UCSC Genome Browser (RepeatMasker and WM+SDust tracks).</li>
			</ol>
			<p>This process resulted in 339,020 independent SNPs for all 26,563 individuals and 338,934 independent SNPs for the 24,505 individuals in the European genetic ancestry stratification.</p>
			
			<p>We conducted principal component analyses (PCA) on pruned genotyping array data using the PLINK2 <i>--pca</i> option for each stratification separately.</p>

		    </div>
                      
		     <div v-if="selectedContent === 'Regenie'" id="Regenie">
			<h3>5.2. Regression Model</h3>
			<p>We tested the additive effect of the genetic variant on the phenotype within each stratification using linear regression. Specifically, we:</p>
			<ul>
			<li>Applied a rank inverse normal transformation for all continuous traits using the built-in Regenie option during polygenic effect estimation and association testing.</li>
			<li>Utilized pruned genotyping array data corresponding to the stratification to estimate polygenic effects.</li>
			<li>Included several covariates: the first 20 principal components related to stratification, genotyping batch (1-5), sex, participant age at the data collection site visit, and age squared to account for potential non-linear relationships. Note that in sex-stratified analyses, sex was not included as a covariate.</li>
			<li>Estimated genotype-by-sex interaction effects for sex-combined analyses using Regenie's built-in <i>--interaction</i> option.</li>
			<li>Excluded variants with a minor allele count (MAC) of less than 5 from the single variant association tests, as recommended in Regenie’s documentation.</li>
			<li>Excluded individuals with missing information for a trait from the analysis, leading to slight variations in sample sizes across tested traits.</li>
			</ul>

		    </div>

		    <div v-if="selectedContent === 'PheWeb'" id="PheWeb">
			<h2>6. PheWeb2 Data</h2>
			<p>The CLSA GWAS/PheWas generated terabytes of summary statistics. Before loading these data into CLSA PheWeb, we applied the following best-practice filters:</p>
			<ol>
				<li><b>Genotype Imputation Quality</b>: Only include genotype-phenotype association results for variants with a genotype imputation quality (r² > 0.3)</li>
				<li><b>Sex-by-Genotype Interaction</b>: Incorporate interaction results only for genetic variants that had at least 160 alleles in the study population.</li>
			</ol>
          	   </div>          
                                        <!-- <div v-if="selectedContent === 'UpdateHistory'" id='UpdateHistory'>
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
		    </div> -->
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

