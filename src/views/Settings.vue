<template>
<navbar @on-click-back="$router.go(-1)" title="设置" class="navbar" />
<div class="page">
  <cell-group title="设置">
    <cell title="隐藏完整车辆识别码">
      <template v-slot:link>
        <nut-switch v-model="hideFullVin" />
      </template>
    </cell>
  </cell-group>

  <cell-group title="TeslaMate设置">
    <nut-input label="URL" v-model="urlBaseValue" />
    <nut-input label="ApiKey" v-model="apikeyValue" />
  </cell-group>
  <div style="text-align: center;">
    <nut-button :loading="loading" type="primary" @click="saveSettings">保存</nut-button>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { urlBase, apikey, updateSettings } from '../api/teslamate'
import { getVehicles } from '../api/vehicle'
import { Navbar, CellGroup, Input as NutInput, Button as NutButton, Cell, Switch as NutSwitch } from '@nutui/nutui'
import { hideFullVin } from '../settings'

const router = useRouter()

const loading = ref(false)
const urlBaseValue = ref(urlBase.value)
const apikeyValue = ref(apikey.value)

async function saveSettings () {
  try {
    loading.value = true

    urlBase.value = urlBaseValue.value
    apikey.value = apikeyValue.value

    const vehicles = await getVehicles()
    if (vehicles && vehicles.length > 0) {
      updateSettings()
      router.replace('/')
    } else {
      throw new Error('No vehicles found')
    }
  } catch(e) {
    alert('配置错误')
    console.error(e)
    urlBase.value = ''
    apikey.value = ''
  } finally {
    loading.value = false
  }
}
</script>