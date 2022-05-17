<template>
<navbar @on-click-back="$router.go(-1)" :title="`${route.query.display}行程`" class="navbar" />
  <div class="page">
  <cell-group title="">
    <range-soc-chart :data="positions" />
    <position-chart title="海拔" :data="positions" :fields="['Elevation [m]']" />
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
import { ref, onActivated } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { Navbar, CellGroup } from '@nutui/nutui'

import { stats } from '../api/stats'
import { getPositionsBig } from '../api/position'
import DriveCellGroup from '../components/DriveCellGroup.vue'
import ChargeCellGroup from '../components/ChargeCellGroup.vue'
import PositionChart from '../components/PositionChart.vue'
import RangeSocChart from '../components/RangeSocChart.vue'

const route = useRoute()

const tripStats = ref({})
const positions = ref()

onActivated(() => {
  const { from, to } = route.query
  if (from && to ) {
    stats(from, to).then(res => tripStats.value = res)
    getPositionsBig(from, to).then(res => positions.value = res)
  }
})

onBeforeRouteLeave(function (to) {
  if (to.name === 'Stats') {
    positions.value = []
    tripStats.value = {}
  }
})
</script>