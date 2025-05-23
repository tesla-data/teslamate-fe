<template>
<div class="page">
  <div style="display: flex;">
    <h4 v-if="currentVehicle">{{currentVehicle.name}} <nut-icon v-if="loading" size="11" name="loading" /></h4>
    <div style="flex-grow: 1;" />
    <router-link to="settings" style="color: #333;"><nut-icon size="18" name="setting" /></router-link>
  </div>
  <div v-if="currentVehicle" class="vehice-state" @click="updateVehicleState">
    <div v-if="currentVehicleState" style="display: flex; align-items: center;">
      <battery style="margin-right: 8px;" :percent="currentVehicleState.battery_level" />
      <div>
        <span v-if="currentVehicleState.battery_heater" style="color: red;">⌇</span>
        <span>{{currentVehicleState.battery_level}}%</span>
        <span v-if="currentVehicleState.battery_level - currentVehicleState.usable_battery_level > 0">(<span style="font-size: 15px;">❄️</span>{{currentVehicleState.battery_level - currentVehicleState.usable_battery_level}}%)</span>
        <span style="margin-left: 10px;" v-if="currentVehicleState.battery_level > 0">
          {{currentVehicleState.ideal_battery_range_km.toFixed(0)}}/{{km(currentVehicleState.ideal_battery_range_km * 100 / currentVehicleState.usable_battery_level)}}
        </span>
        <span style="margin-left: 10px;" v-else>
          {{currentVehicleState.ideal_battery_range_km.toFixed(0)}}km
        </span>
      </div>
    </div>
    <div v-if="currentVehicleState && currentVehicleState.charge">
      ⚡ +{{currentVehicleState.charge.charge_energy_added.toFixed(1)}}Kwh {{currentVehicleState.charge.charger_power}}Kw
      <span v-if="currentVehicleState.charge.charger_actual_current">
        {{currentVehicleState.charge.charger_voltage}}V
        {{currentVehicleState.charge.charger_actual_current}}/{{currentVehicleState.charge.charger_pilot_current}}A
      </span>
    </div>
    <div v-if="currentVehicleState && !currentVehicleState.update.end_date">
      正在更新{{currentVehicleState.update.version}}
    </div>
  </div>

  <state-history v-if="currentVehicleStateHistory?.[0]" :history="currentVehicleStateHistory" />

  <cell-group v-if="currentVehicle">
    <cell v-if="currentVehicleState" title="温度" :sub-title="currentVehicleState.is_climate_on && `空调设置${currentVehicleState.driver_temp_setting}℃` || ''" :desc="`外部:${currentVehicleState.outside_temp}℃ 内部:${currentVehicleState.inside_temp}℃`" />
    <cell title="续航" icon="find" to="/projected-range" is-link />
    <cell title="充电" icon="order" to="/charges" is-link />
    <cell title="行程" icon="footprint" to="/drives" is-link />
    <cell title="统计" icon="horizontal" to="/stats" is-link />
    <cell title="软件版本" icon="top" to="/updates" is-link />
    <cell title="Teslafi版本统计" icon="more-x" to="/teslafi" is-link />
  </cell-group>
  <div v-if="currentVehicle" class="home-footer" @click="copyVin">
    <p>Model {{currentVehicle.model}} {{currentVehicle.trim_badging}}</p>
    <p>{{hideFullVin ? currentVehicle.vin.replace(/.{6}$/, '******') : currentVehicle.vin}}</p>
    <p v-if="currentVehicleState">{{currentVehicleState.update.version}}</p>
    <p v-if="currentVehicleState">{{km(currentVehicleState.odometer)}}</p>
  </div>
</div>
</template>

<script setup>
import { ref, watch, onActivated, onDeactivated } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Cell, CellGroup, Toast } from '@nutui/nutui'

import { hideFullVin } from '../settings'
import Battery from '../components/Battery.vue'
import StateHistory from '../components/StateHistory.vue'

import { currentVehicle } from '../settings'
import vehicle from '../api/vehicle'
import { urlBase } from '../api/teslamate'
import { km } from '../filters'

const router = useRouter()
if (!urlBase.value) router.push('/settings')

const currentVehicleState = ref(null)
const currentVehicleStateHistory = ref([])

let lastLoad = 0, refreshInterval
const loading = ref(false)
async function updateVehicleState () {
  if (loading.value) return

  loading.value = true
  try {
    const { state, stateHistory } = await vehicle.getHomeData()
    currentVehicleState.value = state
    currentVehicleStateHistory.value = stateHistory
    lastLoad = Date.now()
  } finally {
    loading.value = false
  }
}

async function copyVin() {
  await navigator.clipboard.writeText(currentVehicle.value.vin)
  Toast.text(`车辆vin已复制`)
}

watch(currentVehicle, updateVehicleState)
onActivated(() => {
  document.title = `车辆首页 - ${currentVehicle.value.name || ''}`

  if (refreshInterval) clearInterval(refreshInterval)
  if (Date.now() - lastLoad > 30 * 1000) updateVehicleState()
  refreshInterval = setInterval(updateVehicleState, 30 * 1000)
})

onDeactivated(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = null
})
</script>

<style lang="scss">
h4 {
  margin: 0;
}

.home-footer {
  text-align: center;

  p {
    margin: 0;
  }
}
</style>