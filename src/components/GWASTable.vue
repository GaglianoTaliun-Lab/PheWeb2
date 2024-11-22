<template>
  <h3>GWAS Table (Top vs. Bottom): </h3>
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

        <!-- <template v-slot:item="{ item }">
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
        </template> -->

        <template v-slot:item.variantid="{ item }">
          <router-link :to="`/variant/${item.variantid}`" style="white-space: nowrap;">{{ item.variantName
            }}</router-link>
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

        <!-- <template v-slot:item.pval="{ item }">
          <span style="white-space: nowrap;">
            {{ item.pval }}
          </span>
        </template> -->

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
          children: [
            { title: pheno1.value.split('.').slice(-2).join(', '), key: 'af_pheno1' }, 
            { title: pheno2.value.split('.').slice(-2).join(', '), key: 'af_pheno2' }, 
          ],
        },
        { 
          title: 'P-value', 
          children: [
            { title: pheno1.value.split('.').slice(-2).join(', '), 
            key: 'pval_pheno1',
            sort: (a, b) => { 
                const isDescending = sortBy.value.find((rule) => rule.key === 'pval_pheno1').order == "desc"
                // console.log(sortBy.value.find((rule) => rule.key === 'pval_pheno1').order);
                console.log(isDescending);
                if (a === null && b === null) return 0;
                if (a === null) return 1;  
                if (b === null) return -1; 
                return isDescending ? b - a : a - b; // 正常排序
              } 
            }, 
            { title: pheno2.value.split('.').slice(-2).join(', '), key: 'pval_pheno2' }, 
          ],
        },
        { 
          title: 'Effect Size (se)', 
          children: [
            { title: pheno1.value.split('.').slice(-2).join(', '), key: 'effect_size_pheno1' }, 
            { title: pheno2.value.split('.').slice(-2).join(', '), key: 'effect_size_pheno2' }, 
          ],
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
          pheno1.value = keys[0]
          pheno2.value = keys[1] || keys[0]
          console.log("pheno1&2", pheno1.value, pheno2.value);

          variants1.value = tableInfo.value[pheno1.value]?.unbinned_variants.map(item => ({
            ...item,
            variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
            variantName: item.rsids 
              ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
              : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
            nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
            effect_size: `${item.beta} (${item.sebeta})`
          }));
          
          variants2.value = tableInfo.value[pheno2.value]?.unbinned_variants.map(item => ({
            ...item,
            variantid: `${item.chrom}-${item.pos}-${item.ref}-${item.alt}`,
            variantName: item.rsids 
              ? `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt} (${item.rsids})`
              : `${item.chrom}: ${item.pos} ${item.ref} / ${item.alt}`,
            nearest_genes: item.nearest_genes ? item.nearest_genes.split(',') : [], 
            effect_size: `${item.beta} (${item.sebeta})`
          }));

          // console.log("Variants 1:", variants1);
          // console.log("Variants 2:", variants2);
          // console.log("Type of variants2:", typeof variants2.value);
          // console.log("Is Array:", Array.isArray(variants2.value));

          // merge two datasets using map
          const variants2Map = new Map(variants2.value.map(variant => [variant.variantid, variant]));

          mergedVariants.value = variants1.value.map(variant1 => {
            const variant2 = variants2Map.get(variant1.variantid);
            return {
              variantid: variant1.variantid,
              variantName: variant1.variantName,
              nearest_genes: variant1.nearest_genes,
              af_pheno1: variant1.af || null,
              pval_pheno1: variant1.pval || null,
              effect_size_pheno1: variant1.effect_size || null,
              af_pheno2: variant2?.af || null,
              pval_pheno2: variant2?.pval || null,
              effect_size_pheno2: variant2?.effect_size || null,
              source: variant2 ? 'both' : 'pheno1',
            };
          }).concat(
            variants2.value.filter(variant2 => !variants1.value.some(variant1 => variant1.variantid === variant2.variantid))
              .map(variant2 => ({
                variantid: variant2.variantid,
                variantName: variant2.variantName,
                nearest_genes: variant2.nearest_genes,
                af_pheno1: null,
                pval_pheno1: null,
                effect_size_pheno1: null,
                af_pheno2: variant2.af || null,
                pval_pheno2: variant2.pval || null,
                effect_size_pheno2: variant2.effect_size || null,
                source: 'pheno2',
              }))
          );
          // console.log("Merged Variants:", mergedVariants.value);
        } catch (error) {
          console.error("There was an error fetching the sample data:", error);
          errorMessage.value = "Failed to load data. Please try again later.";
        } finally {
          isTableLoading.value = false;
        }
        
      };


      const selectedVariantId = ref(null);
      function calculatePageIndex(data, variantId) {
        const index = data.findIndex(item => item.variantid === variantId);
        return index === -1 ? 1 : Math.floor(index / itemsPerPage) + 1;
      }
      function onRowSelect(item) {
        selectedVariantId.value = item.variantid;
        currentPage1.value = calculatePageIndex(variants1, item.variantid);  
        currentPage2.value = calculatePageIndex(variants2, item.variantid);
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
        
        fetchSampleData();
        // console.log("here",props.miamiData[props.selectedStratification1]);
        
        // console.log("here", tableInfo.value);
      });

      watch(() => [props.selectedStratification1, props.selectedStratification2, props.miamiData], (newSelectedStratification1, newSelectedStratification2, newData) => {
        console.log(`Selected value changed to: ${newSelectedStratification1}, ${newSelectedStratification2}`);
        // tableInfo.value = newData
        fetchSampleData();
        // const unbinnedVariants = props.miamiData[props.selectedStratification1]["unbinned_variants"];
        // console.log("Unbinned Variants:", unbinnedVariants);

      });
  
  </script>
  
<style scoped>
.selected-row {
  background-color: #fab9d4; 
}
</style>
  
  
  