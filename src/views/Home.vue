<template>
<div v-if="currentVehicle" class="vehice-state">
  <h4>{{currentVehicle.name}}</h4>
  <div v-if="state">
    <span>{{state.battery_level}}%</span>
    <span v-if="state.battery_level - state.usable_battery_level > 0">({{state.battery_level - state.usable_battery_level}}%)</span>
    <span style="margin-left: 10px;">{{km(state.ideal_battery_range_km)}}|{{km(state.ideal_battery_range_km * 100 / state.usable_battery_level)}}</span>
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
import { ref, watch } from 'vue'
import { Cell, CellGroup } from '@nutui/nutui'

import vehicle from '../api/vehicles'
import { currentVehicle } from '../api/vehicles'
import { km } from '../filters'

const state = ref(null)

watch(currentVehicle, async ({ id: carId }) => {
  if (carId) {
    state.value = await vehicle.getState()
  }
})
</script>

<style lang="scss">
.home-footer {
  text-align: center;

  p {
    margin: 0;
  }
}
</style>