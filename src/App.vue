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
  
  -webkit-touch-callout:none;
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
  -webkit-tap-highlight-color:rgba(0,0,0,0);
}

.page {
  padding: 10px;
}

.navbar {
  height: 72px;

  .nut-navbar--fixed {
    padding-top: 26px!important;
    padding-bottom: 26px!important;
    z-index: 1999!important;
  }

  .nut-navbar__title .title {
    width: inherit;
  }

  + .page {
    margin-top: 0;

    .nut-cell-group:first-child {
      .nut-cell-group__title {
        margin-top: 0;
      }
    }
  }
}
</style>
