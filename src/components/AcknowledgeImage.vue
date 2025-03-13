<template>
    <div class="image-container" style="bottom: 0%; ">
        <img src="@/assets/200px-Universite_de_Montreal_logo.png" class="rounded" alt="@.">
        <img src="@/assets/mcgill_sig_red_logo.png" class="rounded" alt="@." style="height: 40px; width: auto;">
        <img src="@/assets/leaf-cihr-colour-en.jpg" class="rounded" alt="@." style="height: 90px; width: auto;">
        <img src="@/assets/alliance_logo.svg" class="rounded" alt="@." style="height: 50px; width: auto;">
        <img src="@/assets/Artboard-1-8-200x81.png" class="rounded" alt="@.">
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.image-container {
  position: relative;
  display: flex;
  justify-content: space-around; 
  justify-content: center;
  align-items: flex-end;
  flex-wrap: wrap; 

}

.image-container img {
  height: 70px; 
  width: auto; 
  margin: 0 10px; 
  object-fit: contain; 
}

@media (max-width: 900px) {
  .image-container {
    flex-direction: column;  
    align-items: center;  
  }

  .image-container img {
    margin: 10px 0;
  }
}
</style>