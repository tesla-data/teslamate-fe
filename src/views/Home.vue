<template>
<div v-if="currentVehicle" class="vehice-state">
  <div style="display: flex;">
    <h4>{{currentVehicle.name}}</h4>
    <div style="flex-grow: 1;" />
    <router-link to="settings" style="color: #333;"><nut-icon size="18" name="setting" /></router-link>
  </div>
  <div v-if="state" style="display: flex; align-items: center;">
    <battery style="margin-right: 8px;" :percent="state.battery_level" />
    <div>
      <span>{{state.battery_level}}%</span>
      <span v-if="state.battery_level - state.usable_battery_level > 0">(<span style="font-size: 15px;">❄️</span>{{state.battery_level - state.usable_battery_level}}%)</span>
      <span style="margin-left: 10px;">{{km(state.ideal_battery_range_km)}}|{{km(state.ideal_battery_range_km * 100 / state.usable_battery_level)}}</span>
    </div>
  </div>
</div>
<cell-group v-if="currentVehicle">
  <cell v-if="state" title="温度" :sub-title="state.is_climate_on && `空调设置${state.driver_temp_setting}℃`" :desc="`外部:${state.outside_temp}℃ 内部:${state.inside_temp}℃`" />
  <cell title="电池与充电" icon="order" is-link />
  <cell title="行程" icon="footprint" is-link />
</cell-group>
<div v-if="currentVehicle" class="home-footer">
  <p>Model {{currentVehicle.model}} {{currentVehicle.trim_badging}}</p>
  <p>{{currentVehicle.vin}}</p>
  <p v-if="state">{{km(state.odometer)}}</p>
</div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Cell, CellGroup } from '@nutui/nutui'

import Battery from '../components/Battery.vue'
import vehicle from '../api/vehicles'
import { currentVehicle } from '../api/vehicles'
import { km } from '../filters'

const state = ref(null)

onMounted(async () => {
  if (currentVehicle.value) {
    state.value = await vehicle.getState()
  }
})

watch(currentVehicle, async ({ id: carId }) => {
  if (carId) {
    state.value = await vehicle.getState()
  }
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