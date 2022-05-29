<template>
  <cell-group title="">
    <track-map v-if="position" :charges="position" :height="300" />
    <line-chart title="充电曲线" :height="310" :data="detail"
      :fieldsName="fieldsName"
      showOffset="charge"
      :yAxis="[
        { name: '功率 & SOC[%]', softMax: 100, min: 0, top: 10, height: 200 }, { name: '表显续航', min: 0, top: 10, height: 200, opposite: true },
        { name: '温度', top: 220, height: 50, opposite: false }
      ]"
      :fields="[
        ['SOC [%]', 'Power [kW]', 'avgPower', 'Battery heater'], ['Range [km]'],
        ['Outdoor Temperature [°C]']
      ]"
    />
    <line-chart v-if="detail && detail.find(c => c['Current [A]'])" title="电压电流" :height="120" :data="detail"
      :fieldsName="fieldsName"
      :fields="[['Charging Voltage [V]'], ['Current [A]', 'Current (pilot) [A]']]"
      :yAxis="[{ tickAmount: 4, min: 0 }, { tickAmount: 4, min: 0 }]"
    />
  </cell-group>
</template>

<script setup>
import { CellGroup } from '@nutui/nutui'
import TrackMap from '../components/TrackMap.vue'
import LineChart from '../components/LineChart.vue'

import fieldsName from '../fields'

defineProps({
  position: { type: Array, default: () => [] },
  detail: { type: Array, default: () => [] }
})
</script>