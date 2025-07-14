<template>
    <div style="position:relative; max-width: 100%; align-content: center; justify-content: center; margin-bottom: 0%; padding: 0%;"> 
        <v-text-field 
          prepend-inner-icon="mdi-magnify"
          label="Search for a variant, gene, or phenotype"
          placeholder="non HDL"
          variant="underlined"
          clearable
          v-model="searchQuery"
          @input="handleInput"
          rounded
          hide-details
  
        >
        </v-text-field>
        <v-list
          v-if="showDropdown && suggestions.length && searchQuery"
          density="compact"
          max-height="300px"
        >
          <v-list-item
            v-for="(suggestion, index) in suggestions"
            :key="index"
            @click="handleSelection(suggestion)"
            @keydown.enter="handleSelection(suggestion)"
            class="suggestion-item"
            lines="two"
            align="start"
          >
            <template #prepend>
              <v-icon 
                :color="getSuggestionColor(suggestion)"
                size="small"
                class="mr-3"
              >
                {{ getSuggestionIcon(suggestion) }}
              </v-icon>
            </template>
            
            <v-list-item-title>
              <span v-if="suggestion.feature != 'gene'">
                {{ suggestion.title }}
              </span>
              <span v-else style="font-style: italic;">
                {{ suggestion.title }}
              </span>
            </v-list-item-title>
            
            <v-list-item-subtitle v-if="suggestion.subtitle" class="text-caption text-medium-emphasis">
              {{ suggestion.subtitle }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
    </div>
  </template>
  
  <script setup name="SearchBox">
  import { faSearch } from '@fortawesome/free-solid-svg-icons';
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  const router = useRouter()
  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
  const searchQuery = ref('');
  const suggestions = ref([]);
  const showDropdown = ref(false);
  
  
  const handleInput = async () => {
    if (!searchQuery.value.trim() || searchQuery.value.length < 3) {
      suggestions.value = []
      showDropdown.value = false
      return
    }
    // console.log('DEBUG: searchQuery', searchQuery.value)
    const response = await axios.get(`${api}/autocomplete?query=${encodeURIComponent(searchQuery.value.toUpperCase())}`)
    const processedItems = []
        
    try {
    response.data.suggestions.forEach(item => {
      if (item.feature === 'gene') {
        processedItems.push({
          ...item,
          title: item.gene,
          subtitle: `chr${item.chrom}:${item.start}-${item.stop}`,
          prependIcon: 'mdi-dna',
          feature: 'gene',
          value: item 
        })
      } else if (item.feature === 'pheno') {
        processedItems.push({
          ...item,
          title: `${item.phenostring.replace(/\uFFFD/g, "'")} (${item.phenocode})`,
          subtitle: '',
          prependIcon: 'mdi-heart-pulse',
          feature: 'pheno',
          phenocode: item.phenocode,
          phenostring: item.phenostring,
          value: item 
        })
        // processedItems.push({
        //   ...item,
        //   title: item.phenocode,
        //   subtitle: `phenotype: ${item.phenostring}`,
        //   prependIcon: 'mdi-heart-pulse',
        //   feature: 'pheno',
        //   phenocode: item.phenocode,
        //   phenostring: item.phenostring,
        //   value: item 
        // })
      } else if (item.feature === 'variant') {
        processedItems.push({
          ...item,
          title: item.variant_id + " (" + item.rsid + ")",
          subtitle: '',
          prependIcon: 'mdi-atom-variant',
          variant_id: item.variant_id,
          value: item 
        })
      }
      })
      suggestions.value = processedItems
      showDropdown.value = suggestions.value.length > 0
    } catch (error) {
      console.error('DEBUG: error', error)
    }
    // console.log('DEBUG: suggestions', suggestions.value)
    // axios.get(`${api}/autocomplete?query=${encodeURIComponent(searchQuery.value.toUpperCase())}`)
    //   .then(response => {
    //     suggestions.value = (
    //       response.data.suggestions
    //         .sort((a, b) => b.score - a.score)  
    //         .map(item => ({
    //           ...item,
    //           title: item.feature === 'gene'
    //             ? item.gene
    //             : (item.feature === 'pheno'
    //                 ? item.phenostring
    //                 : item.value),
    //           value: item.gene || item.phenostring,
    //           score: item.score
    //         }))
    //     ) || []
    //     suggestions.value.sort((a, b) => b.score - a.score)
    //     showDropdown.value = suggestions.value.length > 0
    //     console.log('DEBUG: suggestions', suggestions.value)
    //   })
    //   .catch(error => {
    //     suggestions.value = []
    //     showDropdown.value = false
    //     console.error('DEBUG: error', error)
    //   }
    // )
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
      router.push({ name: 'Variant', params: { variant_id: selectedItem.variant_id } })
    } else {
      console.log('DEBUG: Unknown feature type:', selectedItem.feature)
    }
    
  
    setTimeout(() => {
      searchQuery.value = ''
      suggestions.value = []
      showDropdown.value = false
    }, 100)
  }
  
  
  const getSuggestionIcon = (suggestion) => {
    switch (suggestion.feature) {
      case 'gene':
        return 'mdi-dna'
      case 'pheno':
        return 'mdi-heart-pulse'
      case 'variant':
        return 'mdi-dna'
      default:
        return 'mdi-magnify'
    }
  }
  
  const getSuggestionColor = (suggestion) => {
    switch (suggestion.feature) {
      case 'gene':
        return 'blue'
      case 'pheno':
        return 'green'
      case 'variant':
        return 'purple'
      default:
        return 'grey'
    }
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
  
  .suggestion-item {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .suggestion-item:hover {
    background-color: #f5f5f5;
  }
  
  .suggestions-list {
    border-radius: 0 0 12px 12px;
  }
  </style>
  <!-- <template>
    <v-autocomplete
      v-model="searchQuery"
      :items="suggestions"
      label="Search for a variant, gene, or phenotype"
      placeholder="Type 2 Diabetes"
      prepend-inner-icon="mdi-magnify"
      variant="solo"
      clearable
      :loading="loading"
      hide-no-data
      hide-selected
      @update:search-input="handleInput"
      @input="handleInput"
      item-title="label"
      item-value="value"
    >
      <template #item="{ item }">
        <span v-if="item.feature === 'gene'">🧬 {{ item.gene }}</span>
        <span v-else-if="item.feature === 'pheno'">🩺 {{ item.phenocode }} {{ item.phenostring }}</span>
      </template>
    </v-autocomplete>
  </template>
  
  <script setup name="SearchBox">
  import { ref, watch } from 'vue'
  import axios from 'axios'
  
  const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
  const searchQuery = ref('')
  const suggestions = ref([])
  const loading = ref(false)
  
  const handleInput = async (query) => {
    console.log('DEBUG: handleInput called with:', query)
    console.log('DEBUG: query type:', typeof query)
    
    // 提取实际的搜索文本
    let searchText = ''
    if (typeof query === 'string') {
      searchText = query
    } else if (query && typeof query === 'object') {
      console.log('DEBUG: query object keys:', Object.keys(query))
      // 可能是事件对象，尝试从 searchQuery.value 获取
      searchText = searchQuery.value || ''
    } else {
      searchText = searchQuery.value || ''
    }
    
    console.log('DEBUG: extracted searchText:', searchText)
    
    if (!searchText.trim()) {
      console.log('DEBUG: searchText is empty or whitespace only')
      suggestions.value = []
      return
    }
    
    loading.value = true
    try {
      console.log('DEBUG: making API call for searchText:', searchText)
      const response = await axios.get(`${api}/autocomplete?query=${encodeURIComponent(searchText)}`)
      suggestions.value = (response.data.suggestions || []).map(item => ({
        ...item,
        label: item.feature === 'gene'
          ? item.gene
          : (item.feature === 'pheno'
              ? `${item.phenocode} ${item.phenostring}`
              : item.value),
        value: item.gene || item.phenocode || item.value
      }))
      console.log('DEBUG: suggestions', suggestions.value)
    } catch (e) {
      console.error('DEBUG: API call error:', e)
      suggestions.value = []
    } finally {
      loading.value = false
    }
  }
  
  // 添加一个watch来监听searchQuery的变化
  // watch(searchQuery, (newValue) => {
  //   console.log('DEBUG: searchQuery changed to:', newValue)
  //   handleInput(newValue)
  // }, { immediate: false })
  
  </script> -->
  