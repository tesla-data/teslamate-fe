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
  z-index: 9999;

  .nut-navbar__title .title {
    width: inherit;
  }

  + .page {
    padding-top: 50px;
  }
}
</style>
