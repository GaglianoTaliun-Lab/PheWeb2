<template>
    <div v-if="formattedVariantList.length > 0" class="mt-4">
        <v-card elevation="5">
            <div class="d-flex justify-space-between align-center px-4 mt-2">
                <v-text-field
                    v-model="search"
                    label="Search... 'diabetes', 'laboratory'"
                    variant="outlined"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    class="mr-4"
                    style="max-width: 50%;"
                ></v-text-field>
                <span class="px-2 py-1 rounded font-weight-bold text-white" style="background-color: #337bb7;">
                    {{ search ? `${matchingCodes} matching codes` : `${totalCodes} total codes` }}
                </span>
            </div>
                    
            <!-- Updated Table with Search -->
            <v-data-table
                v-model:search="search"
                :items="formattedVariantList"
                :headers="headers"
                height="700"
                fixed-header
                :items-per-page="100"
                hover
                :sort-by="[{ key: 'pval', order: 'asc' }]"
            >
                <template v-slot:item.phenostring="{ item }">
                    <router-link :to="`/phenotypes/${item.phenocode}`">{{ item.phenostring }}</router-link>
                </template>

                <template v-slot:item.pval="{ item }">
                    <span style="white-space: nowrap;">{{ item.pval }}</span>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>
    
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    selectedStratifications: Object,
    variantList: Object,
    categoryList : Object,
});

const headers = ref([
    { title: 'Category', key: 'category' },
    { title: 'Phenotype', key: 'phenostring' },
    { title: 'Sex', key: 'sex' },
    { title: 'Ancestry', key: 'ancestry' },
    { title: 'P-value', key: 'pval' },
    { title: 'Effect Size (se)', key: 'beta_se' },
    { title: 'Number of Samples', key: 'num_samples' },
]);

const search = ref('');

const totalCodes = ref(0);
const matchingCodes = computed(() => {
  if (!search.value) return totalCodes.value;
  return props.variantList.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.value.toLowerCase())
    )
  ).length;
});



const formattedVariantList = computed(() => {
    return props.variantList?.flatMap((v) => {

        if (!props.selectedStratifications.includes(v.stratification.slice(1))) return [];


        var phenos = v.phenos
            .filter((pheno) => props.categoryList.includes(pheno.category))
            .filter((pheno) => pheno.pval < 1)
            .map((pheno) => ({
                category: pheno.category,
                phenostring: pheno.phenostring,
                sex: pheno.stratification.sex,
                ancestry: pheno.stratification.ancestry,
                pval: pheno.pval,
                beta_se: `${pheno.beta} (${pheno.sebeta})`,
                num_samples: pheno.num_samples,
            }));

        totalCodes.value = totalCodes.value + phenos.length;

        return phenos
    })
});

</script>

<style scoped>
</style>
