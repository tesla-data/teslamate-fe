<template>
<navbar @on-click-back="$router.go(-1)" fixed title="Teslafi Firmware统计" class="navbar" />
<div class="page" style="padding-top: 80px; overflow: scroll;">
  <table v-if="teslafi">
    <thead>
      <tr><th v-for="h of teslafi.latestUpdates.head">{{h || '⇩'}}</th></tr>
    </thead>
    <tbody>
      <tr v-for="v of teslafi.latestUpdates.versions">
        <td v-for="(d, i) in v">
          <div v-if="i !== 1">{{d}}</div>
          <a v-else target="_blank" :href="`https://www.notateslaapp.com/software-updates/version/${getVersionParts(d)[0]}/release-notes`">
            <div>{{getVersionParts(d)[0]}}</div>
            <div v-if="getVersionParts(d)[1]">FSD{{getVersionParts(d)[1]}}</div>
          </a>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { Navbar } from '@nutui/nutui'
import { getTeslafi } from '../api/teslamate'

const teslafi = ref()
onActivated(() => {
  getTeslafi().then(res => teslafi.value = res)
})

function getVersionParts(v) {
  return v.trim().split(/\s+/)
}
</script>

<style scoped lang="scss">
table {
  text-align: center;
  border-collapse: collapse;
  border-spacing:0px;
  
  td, th {
    border-bottom: 1px solid #ccc;
    padding: 10px 5px;

    a {
      color: #07a;
    }
  }
}
</style>