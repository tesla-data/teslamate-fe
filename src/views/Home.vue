<template>
<div class="page">
  <div style="display: flex;">
    <h4 v-if="currentVehicle">{{currentVehicle.name}}</h4>
    <div style="flex-grow: 1;" />
    <router-link to="settings" style="color: #333;"><nut-icon size="18" name="setting" /></router-link>
  </div>
  <div v-if="currentVehicle" class="vehice-state">
    <div v-if="currentVehicleState" style="display: flex; align-items: center;">
      <battery style="margin-right: 8px;" :percent="currentVehicleState.battery_level" />
      <div>
        <span>{{currentVehicleState.battery_level}}%</span>
        <span v-if="currentVehicleState.battery_level - currentVehicleState.usable_battery_level > 0">(<span style="font-size: 15px;">❄️</span>{{currentVehicleState.battery_level - currentVehicleState.usable_battery_level}}%)</span>
        <span style="margin-left: 10px;">{{km(currentVehicleState.ideal_battery_range_km)}}|{{km(currentVehicleState.ideal_battery_range_km * 100 / currentVehicleState.usable_battery_level)}}</span>
      </div>
    </div>
  </div>
  <cell-group v-if="currentVehicle">
    <cell v-if="currentVehicleState" title="温度" :sub-title="currentVehicleState.is_climate_on && `空调设置${currentVehicleState.driver_temp_setting}℃`" :desc="`外部:${currentVehicleState.outside_temp}℃ 内部:${currentVehicleState.inside_temp}℃`" />
    <cell title="续航" icon="find" is-link />
    <cell title="充电" icon="order" is-link />
    <cell title="行程" icon="footprint" is-link />
    <cell title="统计" icon="horizontal" to="stats" is-link />
  </cell-group>
  <div v-if="currentVehicle" class="home-footer">
    <p>Model {{currentVehicle.model}} {{currentVehicle.trim_badging}}</p>
    <p>{{currentVehicle.vin}}</p>
    <p v-if="currentVehicleState">{{km(currentVehicleState.odometer)}}</p>
  </div>
</div>
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Cell, CellGroup } from '@nutui/nutui'

import Battery from '../components/Battery.vue'
import vehicle from '../api/vehicles'
import { currentVehicle, currentVehicleState } from '../api/vehicles'
import { km } from '../filters'

vehicle.getState().then(state => currentVehicleState.value = state)
watch(currentVehicle, async ({ id: carId }) => {
  if (carId) {
    currentVehicleState.value = await vehicle.getState()
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