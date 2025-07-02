<template>
  <div style="position:relative; max-width: 100%; align-content: center; justify-content: center; margin-bottom: 0%;"> 
    <v-text-field 
      append-inner-icon="mdi-magnify"
      @click:append-inner="search"
      label="Search for a variant, gene, or phenotype"
      placeholder="non HDL"
      variant="solo"
      clearable
      v-model="searchQuery"
      @input="handleInput"
    >
    </v-text-field>
    <v-list
      v-if="showDropdown && suggestions.length"
      dense
      :items="suggestions"
      item-title="title"
      item-value="value"
      border="sm"
      style="
        margin-top: 0%;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        z-index: 10;
        background: white;
        border: 1px solid #eee;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        max-height: 250px;
        overflow-y: auto;
      "
    >
    </v-list>
  </div>
</template>

<script setup name="SearchBox">
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';
import axios from 'axios';

const api = import.meta.env.VITE_APP_CLSA_PHEWEB_API_URL
const searchQuery = ref('');
const suggestions = ref([]);
const showDropdown = ref(false);


const handleInput = () => {
  if (!searchQuery.value.trim()) {
    suggestions.value = []
    showDropdown.value = false
    return
  }
  console.log('DEBUG: searchQuery', searchQuery.value)
  axios.get(`${api}/autocomplete?query=${encodeURIComponent(searchQuery.value.toUpperCase())}`)
    .then(response => {
      suggestions.value = (
        response.data.suggestions
          .sort((a, b) => b.score - a.score)  
          .map(item => ({
            ...item,
            title: item.feature === 'gene'
              ? item.gene
              : (item.feature === 'pheno'
                  ? item.phenostring
                  : item.value),
            value: item.gene || item.phenostring,
            score: item.score
          }))
      ) || []
      suggestions.value.sort((a, b) => b.score - a.score)
      showDropdown.value = suggestions.value.length > 0
      console.log('DEBUG: suggestions', suggestions.value)
    })
    .catch(error => {
      suggestions.value = []
      showDropdown.value = false
      console.error('DEBUG: error', error)
    }
  )
}

</script>
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
