<template>
<cell-group v-if="drives" :title="`${title || ''} ${sumComsuption(drives)}度电${sumDistance(drives)}km 均速${avgSpeed(drives)}Km/h 能耗${avgComsumption(drives)}Wh/km`">
  <cell
    v-for="d of drives" :title="d.start_address"
    :to="{ name: 'Drive', query: { drive_id: d.drive_id }, params: d }"
    :desc="`${d.duration_min}分钟 | ${d.distance_km.toFixed(0)}km`"
    :sub-title="`温度${d.outside_temp_c}℃ 能耗${d.consumption_kwh_km && d.consumption_kwh_km.toFixed(0)}Wh/km ${d.efficiency ? '' : '(*)'}`"
    is-link
  />
</cell-group>
</template>

<script setup>
import { defineProps } from 'vue'
import { CellGroup, Cell } from '@nutui/nutui'

defineProps({ drives: Object, title: String })

function sumComsuption(drives) {
  const total = drives.reduce((m, d) => m + d.consumption_kWh, 0)
  return total && total.toFixed(0)
}

function sumDistance(drives) {
  const total = drives.reduce((m, d) => m + d.distance_km, 0)
  return total && total.toFixed(0)
}

function avgComsumption(drives) {
  const comsumption = drives.reduce((m, d) => m + d.consumption_kWh, 0)
  const distance = drives.reduce((m, d) => m + d.distance_km, 0)
  return comsumption && distance && (comsumption / distance * 1000).toFixed(0)
}

function avgSpeed(drives) {
  const distance = drives.reduce((m, d) => m + d.distance_km, 0)
  const time = drives.reduce((m, d) => m + d.duration_min, 0) / 60
  return distance && time && (distance / time).toFixed(0)
}
</script>