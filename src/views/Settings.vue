<template>
<top-nav title="设置" />
<div class="page">
  <cell-group title="设置" v-if="vehicles.length > 0">
    <cell title="隐藏完整车辆识别码">
      <template v-slot:link>
        <nut-switch v-model="hideFullVin" />
      </template>
    </cell>
    <cell :title="'当前车辆: ' + currentVehicle.name" desc="切换" @click="() => { showPicker = true;}" />
    <nut-picker
      v-model:visible="showPicker"
      title="选择车辆"
      :columns="vehiclesColumns"
      @confirm="vehicleChange"
    />
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { urlBase, apikey, updateSettings } from '../api/teslamate'
import { getVehicles } from '../api/vehicle'
import { CellGroup, Input as NutInput, Button as NutButton, Cell, Switch as NutSwitch } from '@nutui/nutui'
import TopNav from '../components/TopNav.vue'
import { hideFullVin, currentVehicle, vehicles } from '../settings'

const router = useRouter()

const showPicker = ref(false)
const loading = ref(false)
const urlBaseValue = ref(urlBase.value)
const apikeyValue = ref(apikey.value)

const vehiclesColumns = computed(() => vehicles.value.map(v => ({ text: v.name, value: v.id })))
const vehicleChange = ({ selectedValue }) => {
  const vehicle = vehicles.value.find(v => v.id == selectedValue)
  if (vehicle) currentVehicle.value = vehicle
}

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