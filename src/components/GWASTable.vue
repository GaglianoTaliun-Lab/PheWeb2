<template>
  <h3 v-if="props.selectedStratification1 !== props.selectedStratification2 && props.selectedStratification2 !== 'None'">
    GWAS Table ({{props.selectedStratification1.split('.').slice(-2).join(', ')}} vs. {{props.selectedStratification2.split('.').slice(-2).join(', ')}}): 
  </h3>
  <h3 v-else>
    GWAS Table ({{props.selectedStratification1.split('.').slice(-2).join(', ')}}): 
  </h3>
  <v-card elevation="5" class="pa-2">
    <v-row>
    <v-col :cols="selectedStratification2 !== 'None' ? 12 : 12">
      <!-- <h5>{{ props.selectedStratification1.split('.').slice(-2).join(', ') }}</h5>
      <h5>{{ pheno1 }}</h5> -->
      <v-data-table 
        :items="mergedVariants" 
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
        >

        <template v-slot:item.variantid="{ item }">
          <router-link :to="`/variant/${item.variantid}`" style="white-space: nowrap;">
            {{ item.variantName}}
          </router-link>
        </template>

        <template v-slot:item.nearest_genes="{ item }">
            <span v-for="(gene, index) in item.nearest_genes" :key="index">
              <router-link :to="`/gene/${gene.trim()}/${props.phenocode}`"
                style="white-space: nowrap; font-style: italic;">
                {{ gene.trim() }}
              </router-link>
              <span v-if="index < item.nearest_genes.length - 1">, </span>
            </span>
        </template>

        <template v-slot:header.variantid="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center; ">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <v-tooltip location="top">
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
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>

        <template v-slot:header.nearest_genes="{ column }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
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

        <template v-slot:item.af_pheno2="{ value }">
          <div style="border-right:thin dashed rgba(var(--v-border-color), var(--v-border-opacity));">
            <span>
              {{ value }}
            </span>
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

        <template v-slot:item.pval_pheno1="{ value }">
          <v-chip v-if="value !== 'NA'" :color="getColour(value)">
            {{ value }}
          </v-chip>
          <span v-else>
            {{ value }}
          </span>
        </template>

        

        <template v-slot:header.pval_pheno2="{ column, isSorted, getSortIcon }">
          <div style="display: flex; align-items: center;">
            <span style="white-space: nowrap;">{{ column.title }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </div>
        </template>
        
        <template v-slot:item.pval_pheno2="{ value }">
          <div style="border-right:thin dashed rgba(var(--v-border-color), var(--v-border-opacity));">
            <v-chip v-if="value !== 'not tested'" :color="getColour(value)">
              {{ value }}
            </v-chip>
            <span v-else>
              {{ value }}
            </span>
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

        <!-- <template v-slot:item.effect_size_pheno1="{ value }">
          <div v-if="item.beta > 0">
            <span>
              {{ value }}
            </span>
            <v-icon :icon="arrowUpThin"></v-icon>
          </div>
        </template> -->

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
<!-- 
    <v-divider vertical></v-divider>

    <v-col v-if="selectedStratification2 !== 'None'" cols="6">
      <h5>{{ props.selectedStratification2.split('.').slice(-2).join(', ') }}</h5>
      <h5>{{ pheno2 }}</h5>

      <v-data-table
      :items="variants2" 
      :headers="headers" 
      :search="search" 
      height=500 
      fixed-header 
      :items-per-page="itemsPerPage"
      :sort-by="[{ key: 'pval', order: 'des' }]" 
      hover
      :loading="isTableLoading"
      item-value="variantid"
      v-model:page="currentPage2"
      :page.sync="currentPage2"
      >

      <template v-slot:item="{ item }">
        <tr
         :class="{ 'selected-row': item.variantid === selectedVariantId }"
         @click="onRowSelect(item)"
         >
          <td>
            <router-link :to="`/variant/${item.variantid}`" style="white-space: nowrap;">
              {{ item.variantName }}
            </router-link>
          </td>
          <td>
            <span v-for="(gene, index) in item.nearest_genes" :key="index">
              <router-link :to="`/gene/${gene.trim()}/${props.phenocode}`"
                style="white-space: nowrap; font-style: italic;">
                {{ gene.trim() }}
              </router-link>
              <span v-if="index < item.nearest_genes.length - 1">, </span>
            </span>
          </td>
          <td>
            {{ Number(item.af).toFixed(3) }}
          </td>
          <td>
            <span style="white-space: nowrap;">
              {{ item.pval }}
            </span>
          </td>
          <td>
            {{ item.effect_size }}
          </td>

        </tr>
      </template>

      <template v-slot:header.variantid="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <v-tooltip location="top">
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
          <template v-if="isSorted(column)">
            <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      <template v-slot:header.pval="{ column, isSorted, getSortIcon }">
        <div style="display: flex; align-items: center;">
          <span style="white-space: nowrap;">{{ column.title }}</span>
          <template v-if="isSorted(column)">
            <v-icon :icon="getSortIcon(column)"></v-icon>
          </template>
        </div>
      </template>

      </v-data-table>
      <v-pagination
        v-model="currentPage2"
        :length="pageCount2"
      ></v-pagination>
    </v-col> -->
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
        miamiData: Object
      });
      console.log(props.selectedStratification1, props.selectedStratification2);
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
      const currentPage1 = ref(1);
      const currentPage2 = ref(1);
      const itemsPerPage = 7; 
      const sortBy = ref([{ key: 'pval_pheno1', order: 'asc' }]);
      const updateSortBy = (newSort) => {
        // console.log("SortBy updated:", newSort); // 打印更新的排序状态
        sortBy.value = newSort; // 更新 sortBy
      };

      const headers = computed(() => [
        { title: 'Top Variant', key: 'variantid', sortable: false },
        { title: 'Nearest Gene(s)', key: 'nearest_genes', sortable: false },
        { 
          title: 'AF', 
          key: 'af',
          children: [
            { title: pheno1.value.split('.').slice(-2).join(', '), key: 'af_pheno1' }, 
            ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "None"
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
            ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "None"
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
            ...(props.selectedStratification2 !== props.selectedStratification1 && props.selectedStratification2 !== "None"
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
          // const apiUrl = `${api}/phenotypes/${props.selectedStratification1}`;
          // const response = await axios.get(apiUrl);
          // console.log(apiUrl);
          // console.log(response);

          // variants.value = response.data.unbinned_variants.map(item => ({
          //   ...item,
          //   variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
          //   variantName: item.rsids 
          //     ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
          //     : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
          //   nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
          //   effect_size: `${item.beta} (${item.sebeta})`
          // }));

          // instead of using API call, directly use plot data from parent page
          tableInfo.value = await props.miamiData;
          var keys = Object.keys(tableInfo.value)
          pheno1.value = keys[0];
          pheno2.value = keys[1] || keys[0];
          console.log("pheno1&2", pheno1.value, pheno2.value);
          // TODO: make this more efficient when stratification2 is None 

          variants1.value = tableInfo.value[pheno1.value]?.unbinned_variants.map(item => ({
            ...item,
            variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
            variantName: item.rsids 
              ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
              : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
            nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
            effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) ↑`
                  : `${item.beta} (${item.sebeta}) ↓`
          }));
          
          if (props.selectedStratification2 !== "None" && props.selectedStratification2 !== props.selectedStratification1){
            variants2.value = tableInfo.value[pheno2.value]?.unbinned_variants.map(item => ({
              ...item,
              variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
              variantName: item.rsids 
                ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
                : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
              nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
              effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) ↑`
                  : `${item.beta} (${item.sebeta}) ↓`
            }));
          } else {
            variants2.value = variants1.value
          }

          // merge two datasets using map
          const variants1Map = new Map(variants1.value.map(variant => [variant.variantid, variant]));
          const variants2Map = new Map(variants2.value.map(variant => [variant.variantid, variant]));

          // const variant1Only = variants1.value
          //   .filter(variant1 => !variants2Map.has(variant1.variantid))
          //   .map(variant1 => variant1.variantid)
          //   .sort((a, b) => a.localeCompare(b));
          // const variant2Only = variants2.value
          //   .filter(variant2 => !variants1Map.has(variant2.variantid))
          //   .map(variant2 => variant2.variantid)
          //   .sort((a, b) => a.localeCompare(b));

          
          // const unmatchedVariants = {
          //   variant1Only,
          //   variant2Only
          // };
          if (props.selectedStratification2 !== "None" && props.selectedStratification2 !== props.selectedStratification1 ){
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

            console.log(unmatchedVariants)
            const apiUrl_post = `${api}/phenotypes/gwas.missing`;
            const response = await axios.post(apiUrl_post, unmatchedVariants, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => {
              console.log(response.data.data)
              console.log("vairants1 #: ", variants1.value.length);
              console.log("vairants2 #: ", variants2.value.length);
              const missingData1 = response.data.data[Object.keys(response.data.data)[0]].map(item => ({
                ...item,
                variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
                variantName: item.rsids 
                  ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
                  : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
                nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
                effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) ↑`
                  : `${item.beta} (${item.sebeta}) ↓`
              }));;
              const missingData2 = response.data.data[Object.keys(response.data.data)[1]].map(item => ({
                ...item,
                variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
                variantName: item.rsids 
                  ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
                  : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
                nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
                effect_size: item.beta > 0
                  ? `${item.beta} (${item.sebeta}) ↑`
                  : `${item.beta} (${item.sebeta}) ↓`
              }));;

              if (missingData1 && Array.isArray(missingData1) && missingData2 && Array.isArray(missingData2)) {
                variants1.value.push(...missingData1);
                variants2.value.push(...missingData2);
              }
              console.log("vairants1 after #: ", variants1.value.length);
              console.log("vairants2 after #: ", variants2.value.length);
              // console.log(variants1)

              console.log(variants2.value.filter(variant2 => !variants1.value.some(variant1 => variant1.variantid === variant2.variantid)))
              console.log(variants1.value.filter(variant1 => !variants2.value.some(variant2 => variant1.variantid === variant2.variantid)))
              
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
              variantName: variant1.variantName,
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
                variantName: variant2.variantName,
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


      // const selectedVariantId = ref(null);
      // function calculatePageIndex(data, variantId) {
      //   const index = data.findIndex(item => item.variantid === variantId);
      //   return index === -1 ? 1 : Math.floor(index / itemsPerPage) + 1;
      // }
      // function onRowSelect(item) {
      //   selectedVariantId.value = item.variantid;
      //   currentPage1.value = calculatePageIndex(variants1, item.variantid);  
      //   currentPage2.value = calculatePageIndex(variants2, item.variantid);
      // }
      // p value colours
      const getColour = (pval) => {
        // if (pval < 5e-100 && pval !== null) return 'red';
        if (pval < 5e-8 && pval !== null) return 'green';
        else if (pval === "NA") return null;
        return '#grey';
      }


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
        if (pheno1.value) {
          fetchSampleData();
        }
      });

      watch(() => [props.selectedStratification1, props.selectedStratification2, props.miamiData], (newSelectedStratification1, newSelectedStratification2, newData) => {
        console.log(`Selected value changed to: ${newSelectedStratification1}, ${newSelectedStratification2}`);
        fetchSampleData();
        
        // const unbinnedVariants = props.miamiData[props.selectedStratification1]["unbinned_variants"];
        // console.log("Unbinned Variants:", unbinnedVariants);

      });
  
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
  
  
  