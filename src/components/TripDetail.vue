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

  <drive-cell-group v-if="!group || drivesGroups.groups.length === 1" :drives="drives" />
  <cell-group class="stats" v-if="group && drivesGroups.groups.length > 1"
    :title="`累计行驶${km(drivesGroups.totalDistance)} 消耗${drivesGroups.totalComsuption.toFixed(1)}度电`"
    :desc="`累计用时${duration(drivesGroups.totalDuration * 60 * 1000)} 均速${km(drivesGroups.avgSpeed)}/h 能耗${drivesGroups.comsumption.toFixed(0)}Wh/km`"
  />
  <drive-cell-group class="dg" v-if="group && drivesGroups.groups.length > 1" v-for="dg of drivesGroups.groups" :title="dg.date.replace(/^20/, '')" :drives="dg.drives" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { CellGroup } from '@nutui/nutui'

import DriveCellGroup from './DriveCellGroup.vue'
import ChargeCellGroup from './ChargeCellGroup.vue'
import TrackMap from './TrackMap.vue'
import LineChart from './LineChart.vue'

import { groupDrives } from '../api/drive'
import { km, duration } from '../filters'
import fieldsName from '../fields'

const currentPointIndex = ref()

const props = defineProps({
  group: { type: Boolean, default: false },
  drives: { type: Array, default: () => [] },
  charges: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] },
  track: { type: Array, default: () => [] },
  chargeMarkers: { type: Array, default: () => [] },
})

const drivesGroups = computed(() => groupDrives(props.drives))
</script>

<style  scoped>
.stats :deep(.nut-cell-group__title) {
  font-size: 16px;
}

.dg :deep(.nut-cell-group__title) {
  margin-top: 10px;
}
</style>