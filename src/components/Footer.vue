<template>
  <footer class="footer">
    <p>Last updated: {{ lastUpdated }}</p>
  </footer>
</template>

<script>
import { VITE_APP_DATE } from "@/config";
export default {
  data() {
    return {
      lastUpdated: VITE_APP_DATE,  // Set the desired date here
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
