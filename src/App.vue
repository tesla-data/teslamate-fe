<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
<router-view v-slot="{ Component }">
  <keep-alive :exclude="['Charge', 'Drive']">
    <component :is="Component" />
  </keep-alive>
</router-view>
</template>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  background-color: #f7f8fa;
}

.page {
  padding: 0 10px;
}

.navbar {
  padding-top: 26px!important;
  padding-bottom: 26px!important;
}

.navbar {
  position: fixed!important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;

  + .page {
    padding-top: 50px;
  }
}
</style>
