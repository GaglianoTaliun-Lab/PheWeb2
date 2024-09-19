<template>
    <div class="container-fluid p-2 mb-3">
            <form class="search-box" role="search">
                <div class="input-group">
                    <input class="form-control custom-input" type="search" placeholder="Search for a variant, gene, or phenotype" aria-label="Search">
                    <!-- <button class="" type="submit">
                        <font-awesome-icon :icon="faSearch"></font-awesome-icon>
                    </button> -->
                </div>
            </form>

    </div>
</template>

<script setup name="SearchBox">
import { faSearch } from '@fortawesome/free-solid-svg-icons';
</script>

<style lang="scss" scoped>

.custom-input {
  transition: box-shadow 0.3s ease, border-color 0.3s ease; 
  box-shadow: none; 
}

.custom-input:hover,
.custom-input:focus {
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.5); 
  border-color: #007bff; 
  outline: none; 
}
</style>