<template>
  <cell-group>
    <track-map
      v-if="positions.length > 0"
      :highlight="currentPointIndex"
      :track="track"
      :charges="chargeMarkers"
    />
    <line-chart :x-axis="{ ordinal: true }" title="" :height="210" :data="positions" v-model:current="currentPointIndex"
      :fieldsName="fieldsName"
      :series-options="[{ type: 'area' }]"
      :yAxis="[
        { name: '海拔', opposite: false, top: 10, height: 70, opposite: false },
        { name: 'SOC', softMax: 100, min: 0, opposite: false, top: 90, height: 90 }, { name: '表显续航', min: 0, opposite: true, top: 90, height: 90 }
      ]"
      :fields="[
        ['Elevation [m]'],
        ['battery_level'], ['range']
      ]"
    />
  </cell-group>

  <charge-cell-group :charges="charges" />
  <drive-cell-group :drives="drives" />
</template>

<script setup>
import { ref } from 'vue'
import { CellGroup } from '@nutui/nutui'

import DriveCellGroup from './DriveCellGroup.vue'
import ChargeCellGroup from './ChargeCellGroup.vue'
import TrackMap from './TrackMap.vue'
import LineChart from './LineChart.vue'

import fieldsName from '../fields'

const currentPointIndex = ref()

function isOrdinal(positions) {
  return positions.length > 0 && (positions[positions.length - 1].time - positions[0].time > 1000)
}

defineProps({
  drives: { type: Array, default: () => [] },
  charges: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] },
  track: { type: Array, default: () => [] },
  chargeMarkers: { type: Array, default: () => [] },
})
</script>