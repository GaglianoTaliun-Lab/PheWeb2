<template>
  <v-card elevation="5" class="">
    <v-row>
    <v-col :cols="selectedStratification2 !== 'None' ? 12 : 12">
      <v-data-table 
        :items="filteredMergedVariants" 
        :headers="headers" 
        :header-props="headerProps"
        :search="search" 
        height=500 
        fixed-header 
        :items-per-page="itemsPerPage"
        :sort-by.sync="sortBy"
        must-sort
        hover
        :loading="isTableLoading"
        @update:sort-by="updateSortBy"
        dense
        v-model:page="page"
        >

        <template v-slot:body="{ items }" >
          <!-- <tr v-for="item in items" :key="item.variantid" :class="{ 'selected-row': item.variantid === props.chosenVariant }"> -->
          <tr v-for="item in items" 
          :key="item.variantid" 
          :class="{ 'selected-row': item.variantid === props.chosenVariant }"
          @mouseover="hoveredVariantId = item.variantid"
          @mouseleave="hoveredVariantId = 'None' "
          >
            <td>
              <!-- variantid -->
              <a :href="`/variant/${item.variantid}`" style="white-space: pre-line;">{{ item.variantName }}</a>
            </td>
            <td>
              <!-- effect allele -->
              {{ item.ea }}
            </td>
            <td>
              <!-- nearest genes -->
              <span v-for="(gene, index) in item.nearest_genes" :key="index">
                <router-link :to="`/gene/${gene.trim()}/${props.phenocode}`"
                  style="white-space: nowrap; font-style: italic;">
                  {{ gene.trim() }}
                </router-link>
                <span v-if="index < item.nearest_genes.length - 1">, </span>
              </span>
            </td>
            <td>
              <!-- af1 -->
              {{ item.af_pheno1 }}
            </td>
            <td v-if="props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== 'No stratification'" style="border-right:thin dashed rgba(var(--v-border-color), var(--v-border-opacity));">
              <!-- af2 w/ divider-->
              {{ item.af_pheno2 }}
            </td>
            <td>
              <!-- pval1 -->
              <v-chip v-if="item.pval_pheno1 !== 'NA'" :color="getColour(item.pval_pheno1)">
                {{ item.pval_pheno1 }}
              </v-chip>
              <span v-else>
                {{ item.pval_pheno1 }}
              </span>
            </td>
            <td v-if="props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== 'No stratification'" style="border-right:thin dashed rgba(var(--v-border-color), var(--v-border-opacity));">
              <!-- pval2 w/ divider -->
              <v-chip v-if="item.pval_pheno2 !== 'NA'" :color="getColour(item.pval_pheno2)" >
                {{ item.pval_pheno2 }}
              </v-chip>
              <span v-else>
                {{ item.pval_pheno2 }}
              </span>
            </td>
            <td>
              <!-- effect size1 -->
              {{ item.effect_size_pheno1 }}
            </td>
            <td v-if="props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== 'No stratification'">
              <!-- effect size2 -->
              {{ item.effect_size_pheno2 }}
            </td>
          </tr>
        </template>

        <template v-slot:header.variantid="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip 
              location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                1) Chromosome <br>
                2) Position <br>
                3) Reference allele <br>
                4) Alternate allele <br> 
                5) rsid (if applicable)
              </span>
            </v-tooltip>
            <v-menu
              open-on-hover
              v-model="menu"
              :close-on-content-click="false"
              location="bottom"
              
            >
              <template v-slot:activator="{ props }">
                  <v-icon small color="primary" v-bind="props" class="ml-2" 
                  :icon="filteredVariant === 'All' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"></v-icon>
              </template>
              <v-card class="pa-3">
                <v-text-field
                  v-model="selectedVariant"
                  label="Enter variantID or rsID"
                  hint="Try 12-121779004-A-G or rs11553699"
                  style="width: 400px;"
                  variant="outlined"
                  density="compact"
                  elevation="2"
                  rounded
                  prepend-inner-icon="mdi-magnify"
                  @keydown.enter="filterVariants"
                ></v-text-field>

                <v-row justify="end">
                  <v-col cols="auto">
                    <v-btn 
                      @click="clearVariants" 
                      color="primary" 
                      class="mt-3"
                      variant="outlined"
                    >
                      Clear
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn 
                      @click="filterVariants" 
                      color="primary" 
                      class="mt-3"
                      variant="outlined"
                    >
                      Save
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </div>
        </template>

        <template v-slot:header.ea="{ column }">
          <div style="display: flex; align-items: center; justify-content: center; text-align: center;">
            <span style="white-space: nowrap;">{{ "EA" }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                Effect allele
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:header.nearest_genes="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip text="Head to internal page" location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
            </v-tooltip>
            <v-menu
              open-on-hover
              v-model="menu2"
              :close-on-content-click="false"
              location="bottom"
              
            >
              <template v-slot:activator="{ props }">
                  <v-icon small color="primary" v-bind="props" class="ml-2" 
                  :icon="filteredGene === 'All' ? 'mdi-feature-search-outline' : 'mdi-feature-search'"></v-icon>
              </template>
              <v-card class="pa-3">
                <v-text-field
                  v-model="selectedGene"
                  label="Enter gene name"
                  hint="Try RHOF"
                  style="width: 400px;"
                  variant="outlined"
                  density="compact"
                  elevation="2"
                  rounded
                  prepend-inner-icon="mdi-magnify"
                  @keydown.enter="filterGene"
                ></v-text-field>
                <v-row justify="end">
                  <v-col cols="auto">
                    <v-btn 
                      @click="clearGene" 
                      color="primary" 
                      class="mt-3"
                      variant="outlined"
                    >
                      Clear
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn 
                      @click="filterGene" 
                      color="primary" 
                      class="mt-3"
                      variant="outlined"
                    >
                      Save
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </div>
        </template>

        <template v-slot:header.af="{ column }">
          <div style="display: flex; align-items: center; justify-content: center; text-align: center;">
            <span style="white-space: nowrap;">{{ "EAF" }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                Effect allele frequency
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:header.af_pheno1="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.af_pheno2="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.pval="{ column }">
          <div style="display: flex; align-items: center; justify-content: center; text-align: center; ">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal;">
                P-value significant threshold: 5e-8 <br>
                green: significant <br>
                grey: unsignificant <br>
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:header.pval_pheno1="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.pval_pheno2="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.effect_size="{ column }">
          <div style="display: flex; align-items: center; justify-content: center; text-align: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon small color="primary" v-bind="props" class="ml-2">mdi-help-circle-outline</v-icon>
              </template>
              <span style="white-space: normal; max-width: 200px; display: block; word-wrap: break-word;">
                Effect size displayed with the standard error (shown in the bracket)
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:header.effect_size_pheno1="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.effect_size_pheno2="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

      </v-data-table>
    </v-col>
    </v-row>
  </v-card>

</template>
  
  <script setup>
      import { ref, onMounted, watch, computed } from 'vue';
      import axios from 'axios';
      import { useRoute } from 'vue-router';
  
      const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
      const route = useRoute();
      // const phenocode = route.params.phenocode;

      const props = defineProps({
        selectedStratification1: String,
        selectedStratification2: String,
        phenocode: String,
        minFreq: Number,
        maxFreq: Number,
        selectedType: String,
        miamiData: Object,
        chosenVariant: String,
      });
      const tableInfo = ref([]);
      
  
      // main table
      const variants1 = ref([]);
      const variants2 = ref([]);
      const mergedVariants = ref([]);
      const pheno1 = ref('');
      const pheno2 = ref('');
      const errorMessage = ref('');
      const search = ref('');
      const isTableLoading = ref(true);
      const page = ref(3);
      const hoveredVariantId = ref('None');
      const emit = defineEmits(['updateHoverVariant']);

      const itemsPerPage = 7; 
      const sortBy = ref([{ key: 'pval_pheno1', order: 'asc' }]);
      const updateSortBy = (newSort) => {
        sortBy.value = newSort; 
      };

      const headers = computed(() => [
        { title: 'Top Variant', key: 'variantid', sortable: false },
        { title: 'EA', key: 'ea', sortable: false },
        { title: 'Nearest Gene(s)', key: 'nearest_genes', sortable: false },
        { 
          title: 'AF', 
          key: 'af',
          children: [
            { title: pheno1.value.split('.').slice(-2).join(', '), key: 'af_pheno1' }, 
            ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "No stratification"
            ? [
                { title: pheno2.value.split('.').slice(-2).join(', '), key: 'af_pheno2' }, 
              ]
            : [])
          ],
          sortable: false
        },
        { 
          title: 'P-value', 
          children: [
            { title: pheno1.value.split('.').slice(-2).join(', '), 
            key: 'pval_pheno1',
            class: 'with-divider'
            }, 
            ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "No stratification"
            ? [
                { 
                  title: pheno2.value.split('.').slice(-2).join(', '), 
                  key: 'pval_pheno2'
                }
              ]
            : [])
          ],
          key: 'pval',
          sortable: false
        },
        { 
          title: 'Effect Size', 
          children: [
            { title: pheno1.value.split('.').slice(-2).join(', '), key: 'effect_size_pheno1' }, 
            ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "No stratification"
            ? [
                { title: pheno2.value.split('.').slice(-2).join(', '), key: 'effect_size_pheno2' }, 
              ]
            : [])
          ],
          key: 'effect_size',
          sortable: false
        },
      ]);
      
      const headerProps = {
        align: 'center', 
      };

  
      // data
      const fetchSampleData = async () => {
        isTableLoading.value = true;
        errorMessage.value = '';
        try {

          // instead of using API call, directly use plot data from parent page
          // console.log("start to fetch data")
          tableInfo.value = await props.miamiData;
          var keys = Object.keys(tableInfo.value)
          pheno1.value = keys[0];
          pheno2.value = keys[1] || keys[0];
          // console.log("pheno1&2", pheno1.value, pheno2.value);
          // TODO: make this more efficient when stratification2 is None 

          variants1.value = tableInfo.value[pheno1.value]?.unbinned_variants.map(item => ({
            ...item,
            variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
            variantName: item.rsids 
              ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
              : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
            nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
            effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) △`
                  : `${item.beta} (${item.sebeta}) ▽`
          }));
          
          if (props.selectedStratification2 !== "No stratification" && props.selectedStratification2 !== props.selectedStratification1){
            variants2.value = tableInfo.value[pheno2.value]?.unbinned_variants.map(item => ({
              ...item,
              variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
              variantName: item.rsids 
                ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
                : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
              nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
              effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) △`
                  : `${item.beta} (${item.sebeta}) ▽`
            }));
          } else {
            variants2.value = variants1.value
          }

          // merge two datasets using map
          const variants1Map = new Map(variants1.value.map(variant => [variant.variantid, variant]));
          const variants2Map = new Map(variants2.value.map(variant => [variant.variantid, variant]));

          if (props.selectedStratification2 !== "No stratification" && props.selectedStratification2 !== props.selectedStratification1 ){
            const unmatchedVariants = {
              [props.selectedStratification2]: variants1.value
                .filter(variant1 => !variants2Map.has(variant1.variantid))
                .map(variant1 => variant1.variantid)
                .sort((a, b) => a.localeCompare(b)),
              [props.selectedStratification1]: variants2.value
                .filter(variant2 => !variants1Map.has(variant2.variantid))
                .map(variant2 => variant2.variantid)
                .sort((a, b) => a.localeCompare(b))
            };

            // console.log(unmatchedVariants)
            const apiUrl_post = `${api}/phenotypes/variants`;
            const response = await axios.post(apiUrl_post, unmatchedVariants, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => {
              // console.log(response.data.data)
              // console.log("vairants1 #: ", variants1.value.length);
              // console.log("vairants2 #: ", variants2.value.length);
              const missingData1 = response.data.data[props.selectedStratification1].map(item => ({ 
                ...item,
                variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
                variantName: item.rsids 
                  ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
                  : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
                nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
                effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) △`
                  : `${item.beta} (${item.sebeta}) ▽`
              }));;
              const missingData2 = response.data.data[props.selectedStratification2].map(item => ({
                ...item,
                variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
                variantName: item.rsids 
                  ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
                  : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
                nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
                effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) △`
                  : `${item.beta} (${item.sebeta}) ▽`
              }));;

              if (missingData1 && Array.isArray(missingData1) && missingData2 && Array.isArray(missingData2)) {
                variants1.value.push(...missingData1);
                variants2.value.push(...missingData2);
              }
              // console.log("vairants1 after #: ", variants1.value.length);
              // console.log("vairants2 after #: ", variants2.value.length);
              // console.log(variants1)
              // console.log(variants2.value.filter(variant2 => !variants1.value.some(variant1 => variant1.variantid === variant2.variantid)))
              // console.log(variants1.value.filter(variant1 => !variants2.value.some(variant2 => variant1.variantid === variant2.variantid)))
              
            })
            .catch(error => {
              console.error("Error fetching missing GWAS data:", error);
            });
            // console.log(response.data.data)
          };
          const variants2Map2 = new Map(variants2.value.map(variant => [variant.variantid, variant]));
          mergedVariants.value = variants1.value.map(variant1 => {
            const variant2 = variants2Map2.get(variant1.variantid);
            return {
              variantid: variant1.variantid,
              ea: variant1.alt,
              variantName: variant1.variantName,
              rsids: variant1.rsids || "NA",
              nearest_genes: variant1.nearest_genes,
              af_pheno1: variant1.af || "NA",
              pval_pheno1: variant1.pval || "NA",
              effect_size_pheno1: variant1.effect_size || "NA",
              af_pheno2: variant2?.af || "NA",
              pval_pheno2: variant2?.pval || "NA",
              effect_size_pheno2: variant2?.effect_size || "NA",
              source: variant2 ? 'both' : 'pheno1',
            };
          }).concat(
            variants2.value.filter(variant2 => !variants1.value.some(variant1 => variant1.variantid === variant2.variantid))
              .map(variant2 => ({
                variantid: variant2.variantid,
                ea: variant2.alt,
                variantName: variant2.variantName,
                rsids: variant2.rsids || "NA",
                nearest_genes: variant2.nearest_genes,
                af_pheno1: "NA",
                pval_pheno1: "NA",
                effect_size_pheno1: "NA",
                af_pheno2: variant2.af || "NA",
                pval_pheno2: variant2.pval || "NA",
                effect_size_pheno2: variant2.effect_size || "NA",
                source: 'pheno2',
              }))
          );

        } catch (error) {
          console.error("There was an error fetching the sample data:", error);
          errorMessage.value = "Failed to load data. Please try again later.";
        } finally {
          isTableLoading.value = false;
        }
        
      };

      // in-table filters
      const selectedVariant = ref('');
      const selectedGene = ref('');
      const menu = ref(false);
      const menu2 = ref(false);
      // const variantSearchLoading = ref(true);
      const variantSearchLoading = computed(() => {
        if (selectedVariant.value != ''){
          return true;
        } else {
          return false;
        }
      });
      const filteredVariant = ref('All');
      const filteredGene = ref('All');
      const filterVariants = () => {
        // variantSearchLoading.value = false;
        filteredVariant.value = selectedVariant.value;
        // console.log(filteredVariant)
      };
      const filterGene = () => {
        filteredGene.value = selectedGene.value;
      };
      const clearVariants = () => {
        selectedVariant.value = '';
        filteredVariant.value = 'All';
      };
      const clearGene = () => {
        selectedGene.value = '';
        filteredGene.value = 'All';
      };
      const filteredMergedVariants = computed(() => {
        return mergedVariants.value.filter(item => {
          const variantMatches = !filteredVariant.value || filteredVariant.value === 'All' ||  item.rsids === filteredVariant.value || item.variantid === filteredVariant.value;
          const geneMatches = !filteredGene.value || filteredGene.value === 'All' ||   item.nearest_genes.includes(filteredGene.value.toUpperCase());
          return  variantMatches && geneMatches;
        });
      });
      // p value colours
      const getColour = (pval) => {
        if (pval < 5e-8 && pval !== null) return 'green';
        else if (pval === "NA") return null;
        return '#grey';
      };

      const chosenPage = computed(() => {
        const index = filteredMergedVariants.value.findIndex(
          (item) => item.variantid === props.chosenVariant
        );
        if (index === -1) return 1; 
        return Math.ceil((index + 1) / itemsPerPage);
      });


      // download
      const coverToCSV = (data) => {
        if (!data || data.length === 0) return '';
  
        const keys = Object.keys(data[0]);
        const rows = [];
  
        rows.push(keys.join(','));
  
        data.forEach((item) => {
          const values = keys.map((key) => item[key]);
          rows.push(values.join(','));
        });
  
        return rows.join('\n');
      };
  
      const downloadCSV = () => {
        const csvContent = coverToCSV(phenotypes.value);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'topLoci.csv';
        link.click();
        URL.revokeObjectURL(url);
      };
  
      onMounted(() => {
        // if (pheno1.value) {
        //   fetchSampleData();
        // }
        fetchSampleData();
      });

      watch(() => [props.selectedStratification1, props.selectedStratification2], (newSelectedStratification1, newSelectedStratification2) => {
        // console.log(`Selected value changed to: ${newSelectedStratification1}, ${newSelectedStratification2}`);
        // console.log(`here ${newChosenVariant}`)
        fetchSampleData();
        page.value = chosenPage.value;
        
        // const unbinnedVariants = props.miamiData[props.selectedStratification1]["unbinned_variants"];
        // console.log("Unbinned Variants:", unbinnedVariants);

      });
      watch(
        () => props.chosenVariant,
        (newValue) => {
          console.log(`Chosen Variant updated: ${newValue}`);
          page.value = chosenPage.value;
          // console.log(`Chosen Page updated: ${page.value}`);
          menu.value = true;
          selectedVariant.value = props.chosenVariant;
          filteredVariant.value = props.chosenVariant;
          // console.log(filteredMergedVariants)
          // fetchSampleData();
        },
        { deep: true }
      );
      watch(
        () => props.miamiData,
        (newValue) => {
          // console.log(`Chosen data updated: ${newValue}`);
          fetchSampleData();
        },
        // { deep: true }
      );
      watch(
        () => hoveredVariantId.value,
        (newValue) => {
          // console.log(`Hovered Variant updated`, hoveredVariantId.value.split('-').slice(0, 2));
          if (newValue != ''){
            // emit('updateHoverVariant', hoveredVariantId.value.split('-').slice(0, 2))
            // console.log(typeof hoveredVariantId); 
            // console.log(Array.isArray(hoveredVariantId));
            emit('updateHoverVariant', hoveredVariantId)
          }
        }
      );
  
  </script>
  
<style scoped>
.selected-row {
  background-color: #fab9d4; 
};

/* :deep() .v-table .v-table__wrapper > table > thead > tr > th:not(:nth-child(2), :nth-child(1), :nth-child(4), :nth-child(6)) {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
:deep() .v-table .v-table__wrapper > table > tbody > tr > td:not(:nth-child(2), :nth-child(1), :nth-child(4), :nth-child(6)), .v-table .v-table__wrapper > table > tbody > tr > th:not(:last-child) { 
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
} */
</style>
  
  
  