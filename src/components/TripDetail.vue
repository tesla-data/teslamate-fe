<template>
  <cell-group>
    <track-map
      v-if="positions.length > 0"
      :highlight="currentPointIndex"
      :track="track"
      :charges="chargeMarkers"
    />
    <line-chart title="" :height="220" :data="positions" v-model:current="currentPointIndex"
      :fieldsName="fieldsName"
      :yAxis="[
        { name: '海拔', opposite: false, top: 10, height: 70, opposite: false },
        { name: 'SOC', softMax: 100, min: 0, opposite: false, top: 90, height: 100 }, { name: '表显续航', min: 0, opposite: true, top: 90, height: 100 }
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

defineProps({
  drives: { type: Array, default: () => [] },
  charges: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] },
  track: { type: Array, default: () => [] },
  chargeMarkers: { type: Array, default: () => [] },
})
</script>