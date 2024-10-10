<template>
  <footer class="footer">
    <p>Last updated: {{ lastUpdated }}</p>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      // Manually set the last updated date here
      lastUpdated: '2024-10-10',  // Set the desired date here
    };
  },
};
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 10px 0;
  font-size: 0.9rem;
  color: #666;
}
</style>