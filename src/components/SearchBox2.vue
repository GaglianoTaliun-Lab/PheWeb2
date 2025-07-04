<template>
    <div style="position:relative; max-width: 100%; align-content: center; justify-content: center; margin-bottom: 0%;"> 
      <v-autocomplete
        v-model="selectedValue"
        :search="searchText"
        :items="items"
        :item-props="true"
        item-value="value"
        item-subtitle="subtitle"
        item-title="title"
        class="mx-auto"
        density="comfortable"
        menu-icon=""
        label="Search for phenotype, gene, or variant"
        placeholder="non HDL"
        prepend-inner-icon="mdi-magnify"
        theme="light"
        variant="outlined"
        auto-select-first
        underline
        rounded
        hide-no-data
        @update:search="handleInput"
        @update:model-value="handleSelection"
        persistent-hint
        clearable
        autofocus
  
      >
      </v-autocomplete>
     
    </div>
    <div>
      <span>
        Examples:
        <router-link class="custom-link" :to="{ name: 'Pheno', params: { phenocode: 'BLD_nonHDL_COM' } }">non HDL</router-link>,
        <router-link class="custom-link" :to="{ name: 'Gene', params: { gene: 'APOE' } }">APOE</router-link>,
        <router-link class="custom-link" :to="{ name: 'Variant', params: { variant_id: '19-44908822-C-T' } }">19-44908822-C-T</router-link>,
        <router-link class="custom-link" :to="{ name: 'Variant', params: { variant_id: '19-44908822-C-T' } }">rs7412</router-link>
      </span>
    </div>
  </template>
  
  <script setup name="SearchBox">
  import { faSearch } from '@fortawesome/free-solid-svg-icons';
  import { ref, watch } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
  const router = useRouter()
  const selectedValue = ref(null);  // 选中的值
  const searchText = ref('');       // 搜索文本
  const suggestions = ref([]);
  const showDropdown = ref(false);
  const items = ref([]);
  
  const handleInput = async (inputText) => {
    console.log('DEBUG: handleInput called with:', inputText)
    console.log('DEBUG: searchText.value:', searchText.value)
    
    // 更新搜索文本
    searchText.value = inputText
    
    if (!inputText || !inputText.trim() || inputText.length < 3) {
      items.value = []
      return
    }
    
    try {
      const response = await axios.get(`${api}/autocomplete?query=${encodeURIComponent(inputText.toUpperCase())}`)
      console.log('DEBUG: response.data.suggestions:', response.data.suggestions)
      const processedItems = []
      
           response.data.suggestions.forEach(item => {
         if (item.feature === 'gene') {
           processedItems.push({
             ...item,
             title: item.gene,
             subtitle: `${item.chrom}:${item.start}-${item.stop}`,
             prependIcon: 'mdi-dna',
             feature: 'gene',
             value: item 
           })
         } else if (item.feature === 'pheno') {
           processedItems.push({
             ...item,
             title: item.phenostring,
             subtitle: `Code: ${item.phenocode}`,
             prependIcon: 'mdi-heart-pulse',
             feature: 'pheno',
             phenocode: item.phenocode,
             phenostring: item.phenostring,
             value: item 
           })
           processedItems.push({
             ...item,
             title: item.phenocode,
             subtitle: item.phenostring,
             prependIcon: 'mdi-heart-pulse',
             feature: 'pheno',
             phenocode: item.phenocode,
             phenostring: item.phenostring,
             value: item 
           })
         } else {
           processedItems.push({
             ...item,
             title: item.value || '',
             subtitle: '',
             prependIcon: 'mdi-atom-variant',
             value: item 
           })
         }
       })
      
      items.value = processedItems
  
    } catch (error) {
      console.error('DEBUG: API call error:', error)
      items.value = []
    }
  }
  
  const handleSelection = (selectedItem) => {
    console.log('DEBUG: handleSelection called with:', selectedItem)
    
    if (!selectedItem) return
    
    if (selectedItem.feature === 'gene') {
      console.log('DEBUG: Navigating to gene:', selectedItem.gene)
      router.push({ name: 'Gene', params: { gene: selectedItem.gene } })
    } else if (selectedItem.feature === 'pheno') {
      console.log('DEBUG: Navigating to pheno:', selectedItem.phenocode)
      router.push({ name: 'Pheno', params: { phenocode: selectedItem.phenocode } })
    } else if (selectedItem.feature === 'variant') {
      console.log('DEBUG: Navigating to variant:', selectedItem.value)
      router.push({ name: 'Variant', params: { variant_id: selectedItem.value } })
    } else {
      console.log('DEBUG: Unknown feature type:', selectedItem.feature)
    }
    
    setTimeout(() => {
      selectedValue.value = null
      searchText.value = ''
      items.value = []
    }, 100)
  }
  
  
  </script>
  
  <style scoped>
  .custom-link {
    color: #3d7554;
    text-decoration: none;
    &:hover {
      color: #78b243;
      text-decoration: underline;
    }
  }
  </style>
  