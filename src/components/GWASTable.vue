<template>
  <h3>GWAS Table: </h3>
  <v-card elevation="5" class="pa-2">
    <v-row>
    <v-col :cols="selectedStratification2 !== 'None' ? 6 : 12">
      <h5>{{ props.selectedStratification1.split('.').slice(-2).join(', ') }}</h5>
      <h5>{{ pheno1 }}</h5>
      <v-data-table 
        :items="variants1" 
        :headers="headers" 
        :search="search" 
        height=500 
        fixed-header 
        :items-per-page="itemsPerPage"
        :sort-by="[{ key: 'pval', order: 'des' }]" 
        hover
        :loading="isTableLoading"
        :model-value="selectedVariantId"
        @click:row="onRowSelect"
        item-value="variantid"
        :page="currentPage1"
        @update:page="(page) => currentPage1 = page"
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

        <!-- <template v-slot:item.variantid="{ item }">
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

        <template v-slot:item.pval="{ item }">
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

      <!-- <template v-slot:item.variantid="{ item }">
        <router-link :to="`/variant/${item.variantid}`" style="white-space: nowrap;">{{ item.variantName
          }}</router-link>
      </template> -->

      <!-- <template v-slot:item.nearest_genes="{ item }">
        <span v-for="(gene, index) in item.nearest_genes" :key="index">
          <router-link :to="`/gene/${gene.trim()}/${props.phenocode}`"
            style="white-space: nowrap; font-style: italic;">
            {{ gene.trim() }}
          </router-link>
          <span v-if="index < item.nearest_genes.length - 1">, </span>
        </span>
      </template> -->

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
      <v-pagination
        v-model="currentPage2"
        :length="pageCount2"
      ></v-pagination>
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
        miamiData: Object
      });
      console.log(props.selectedStratification1, props.selectedStratification2);
      const tableInfo = ref(null);
      
  
      // main table
      const headers = ref([
        { title: 'Top Variant', key: 'variantid' },
        { title: 'Nearest Gene(s)', key: 'nearest_genes' },
        { title: 'AF', key: 'af' },
        { title: 'P-value', key: 'pval' },
        { title: 'Effect Size (se)', key: 'effect_size' },
      ]);
  
      const variants1 = ref([]);
      const variants2 = ref([]);
      const pheno1 = ref(null);
      const pheno2 = ref(null);
      const errorMessage = ref('');
      const search = ref('');
      const isTableLoading = ref(true);
      const currentPage1 = ref(1);
      const currentPage2 = ref(1);
      const itemsPerPage = 8; 
      
  
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
          tableInfo.value = props.miamiData;
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
  
  
  