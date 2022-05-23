<template>
<cell-group v-if="drives && drives.length > 0" :title="`${title || ''} 行驶${sumDistance(drives)}Km 消耗${sumComsuption(drives)}度电`" :desc="`用时${sumTime(drives)} 均速${avgSpeed(drives)}Km/h 能耗${avgComsumption(drives)}Wh/km`">
  <template v-slot:title>
    <router-link v-if="dateRange" class="nut-cell-group__title" style="text-decoration: none;"
      :to="{ name: 'Trip', query: { display: title, from: dateRange.from, to: dateRange.to } }"
    >
      {{`${title || ''} 行驶${sumDistance(drives)}Km 消耗${sumComsuption(drives)}度电`}} >
    </router-link>
    <div v-else  class="nut-cell-group__title">{{`${title || ''} 行驶${sumDistance(drives)}Km 消耗${sumComsuption(drives)}度电`}}</div>
  </template>
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
import { computed } from 'vue'
import { CellGroup, Cell } from '@nutui/nutui'
import { duration } from '../filters'

const props = defineProps({ drives: Object, title: String })

const dateRange = computed(() => {
  const d = new Date(props.title)
  return d.getTime() && { from: d.getTime(), to: d.getTime() + 24 * 60 * 60 * 1000 }
})

function sumComsuption(drives) {
  const total = drives.reduce((m, d) => m + d.consumption_kWh, 0)
  return total && total.toFixed(1)
}

function sumDistance(drives) {
  const total = drives.reduce((m, d) => m + d.distance_km, 0)
  return total && total.toFixed(1)
}

function sumTime(drives) {
  const total = drives.reduce((m, d) => m + d.duration_min, 0) * 60 * 1000
  return total && duration(total)
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