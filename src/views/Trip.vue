<template>
<navbar @on-click-back="$router.go(-1)" :title="`${route.query.display}行程`" class="navbar" />
  <div class="page">
  <cell-group title="">
    <div ref="driveChart" style="height: 300px" />
    <div ref="elevationChart" style="height: 150px" />
  </cell-group>
  <charge-cell-group :charges="tripStats.charges" />
  <drive-cell-group :drives="tripStats.drives" />
  <!-- <div v-if="tripStats.charges && tripStats.drives">
    {{tripStats.drives[0]}}<br/>
    {{tripStats.charges[0]}}
  </div> -->
</div>
</template>

<script>
export default {
  name: 'Trip'
}
</script>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Navbar, CellGroup } from '@nutui/nutui'

import { stats } from '../api/stats'
import { getPositionsBig } from '../api/position'
import { drawChart } from '../components/PositionChart'
import DriveCellGroup from '../components/DriveCellGroup.vue'
import ChargeCellGroup from '../components/ChargeCellGroup.vue'

const tripStats = ref({})
const route = useRoute()

const driveChart = ref()
const elevationChart = ref()
const { from, to } = route.query
if (from && to ) {
  stats(from, to).then(res => tripStats.value = res)
  getPositionsBig(from, to).then(positions => {
    drawChart(positions, driveChart.value, '驾驶数据', [
      'Range [km]',
      'SOC [%]'
    ])
    drawChart(positions, elevationChart.value, '海拔', ['Elevation [m]'])
  })
}
</script>