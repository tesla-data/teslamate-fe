<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <router-view />
</template>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  background-color: #f7f8fa;
}

.page {
  padding: 10px;
}

.navbar {
  position: fixed!important;;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;

  + .page {
    padding-top: 50px;
  }
}
</style>
