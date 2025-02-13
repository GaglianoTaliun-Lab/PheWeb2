// DownloadButton.vue
<template>
  <v-btn
    color="primary"
    class="ma-2"
    @click="downloadFiles"
    :loading="isLoading"
    :disabled="isLoading"
  >
    <v-icon left>mdi-download</v-icon>
    Download All
  </v-btn>
</template>

<script setup>
import { ref } from 'vue';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';  // Added this import

const isLoading = ref(false);

const downloadFiles = async () => {
  isLoading.value = true;
  try {
    const zip = new JSZip();
    
    // Get the PheWAS plot
    const phewasPlot = document.getElementById('phewas_plot_container');
    if (!phewasPlot) {
      console.error('PheWAS plot container not found');
      return;
    }
    
    // Create PNG version
    const canvas = await html2canvas(phewasPlot, {
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true
    });
    const pngData = canvas.toDataURL('image/png').split(',')[1];
    zip.file('phewas_plot.png', pngData, {base64: true});
    
    // Get SVG version
    const svgElement = phewasPlot.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      zip.file('phewas_plot.svg', svgData);
    }
    
    // Get table data as CSV
    const tableData = getTableData();
    zip.file('variant_data.csv', tableData);
    
    // Generate and download zip file
    const content = await zip.generateAsync({type: 'blob'});
    saveAs(content, 'variant_analysis_data.zip');
    
  } catch (error) {
    console.error('Error generating zip file:', error);
  } finally {
    isLoading.value = false;
  }
};

const getTableData = () => {
  // Access the formatted variant list data
  const variantTable = document.querySelector('.v-data-table');
  if (!variantTable) return '';
  
  // Get headers
  const headers = Array.from(variantTable.querySelectorAll('th'))
    .map(th => th.textContent.trim())
    .filter(header => header !== '');
  
  // Get rows
  const rows = Array.from(variantTable.querySelectorAll('tbody tr'))
    .map(row => Array.from(row.querySelectorAll('td'))
      .map(cell => cell.textContent.trim())
    );
  
  // Convert to CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};
</script>