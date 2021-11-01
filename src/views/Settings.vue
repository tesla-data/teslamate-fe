<template>
<navbar @on-click-back="$router.go(-1)" title="设置" />
<div class="page" style="margin-top: -40px;">
  <cell-group title="TeslaMate设置">
    <nut-input label="URL" v-model="urlBase" />
    <nut-input label="ApiKey" v-model="apikey" />
  </cell-group>
  <div style="text-align: center;">
    <nut-button type="primary" @click="updateSettings">保存</nut-button>
  </div>
</div>
</template>

<script setup>
import { urlBase, apikey, updateSettings } from '../api/teslamate'
import { Navbar, CellGroup, Input as NutInput, Button as NutButton } from '@nutui/nutui'
</script>