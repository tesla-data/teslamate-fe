<template>
  <cell-group v-if="drive"
    :title="`行驶了${duration(drive.duration_min * 60 * 1000)} ${drive.distance_km.toFixed(1)}km 能耗${drive.consumption_kwh_km && drive.consumption_kwh_km.toFixed(0)}Wh/km ${drive.is_sufficiently_precise ? '' : '(*)'}`"
    :desc="`最大功率${drive.power_max}Kw 均速${(drive.distance_km / drive.duration_min * 60).toFixed(0)}km/h 里程表: ${drive.start_km.toFixed(0)} - ${drive.end_km.toFixed(0)}km`"
  >
    <cell
      :title="drive.start_address || '-'"
      :desc="`电量: ${drive['% Start']}% ${drive.start_ideal_range_km.toFixed(0)}km `"
      :sub-title="`${new Date(drive.start_date_ts).toLocaleString()}`"
    />
    <cell
      :title="drive.end_address || '-'"
      :desc="`电量: ${drive['% End']}% ${drive.end_ideal_range_km.toFixed(0)}km`"
      :sub-title="`${new Date(drive.end_date_ts).toLocaleString()}`"
    />
  </cell-group>
  <cell-group title="">
    <track-map v-if="track" :track="track" :highlight="currentPointIndex" />

    <line-chart title="" :height="505" :data="positions" show-offset="drive"
      v-model:current="currentPointIndex"
      :fieldsName="fieldsName"
      :series-options="[{ zIndex: 1 }, {}, { zIndex: 1 }, { type: 'area' }, { type: 'area' }]"
      :yAxis="[
        { name: '速度', opposite: false, top: 10, height: 80 },
        { name: '能耗', top: 0, opposite: true, top: 100, height: 80, startOnTick: false }, 
        { name: '功率', top: 0, opposite: false, top: 100, height: 80 }, 
        { name: '海拔', opposite: false, top: 190, height: 75 },
        { name: '温度', opposite: false, top: 280, height: 75 },
        { name: 'SOC', opposite: false, top: 370, height: 90 }, { name: '表显续航', opposite: true, top: 370, height: 90 }
      ]"
      :fields="[
        ['Speed [km/h]', 'avgSpeed'],
        ['consumption'],
        ['Power [kW]'],
        ['Elevation [m]'],
        [
          'Outside Temperature [°C]',
          'Inside Temperature [°C]',
          'Driver Temperature [°C]',
          'is_climate_on',
          'fan_status'
        ],
        ['battery_level'], ['range']
      ]"
    />
  </cell-group>
</template>

<script setup>
import { ref } from 'vue'
import { CellGroup, Cell } from '@nutui/nutui'

import TrackMap from '../components/TrackMap.vue'
import LineChart from '../components/LineChart.vue'

import { duration } from '../filters'
import fieldsName from '../fields'

const currentPointIndex = ref()
defineProps({
  drive: {
    type: Object,
    default: () => null
  },
  positions: {
    type: Array,
    default: () => []
  },
  track: {
    type: Array,
    default: () => null
  }
})
</script>