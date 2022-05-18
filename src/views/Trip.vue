<template>
<navbar @on-click-back="$router.go(-1)" fixed :title="`${route.query.display}行程`" class="navbar" />
  <div class="page">
  <cell-group>
    <track-map
      v-if="positions.length > 0"
      :track="positions.map(({ latitude, longitude }) => [latitude, longitude])"
      :charges="positions.length > 0 && positions.length > 0 && tripStats.charges && tripStats.charges.map(({ latitude, longitude, mode }) => [latitude, longitude, mode]) || []"
    />
    <range-soc-chart :data="positions" />
    <line-chart title="海拔" :height="100" :data="positions" :fields="[['Elevation [m]']]" />
  </cell-group>
  <charge-cell-group v-if="tripStats.charges && tripStats.charges.length > 0" :charges="tripStats.charges" />
  <drive-cell-group v-if="tripStats.drives && tripStats.drives.length > 0" :drives="tripStats.drives" />
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
import TrackMap from '../components/TrackMap.vue'
import LineChart from '../components/LineChart.vue'
import RangeSocChart from '../components/RangeSocChart.vue'

const route = useRoute()

let lastLeave = 0
const tripStats = ref({})
const positions = ref([])

onActivated(() => {
  const now = Date.now()
  const { from, to } = route.query
  if (from && to ) {
    stats(from, to).then(res => { if(now > lastLeave) tripStats.value = res })
    getPositionsBig(from, to).then(res => { if (now > lastLeave) positions.value = res })
  }
})

const noKeepAlivePages = ['Stats', 'Drives']
onBeforeRouteLeave(function (to) {
  lastLeave = Date.now()
  if (noKeepAlivePages.indexOf(to.name) >= 0) {
    positions.value = []
    tripStats.value = {}
  }
})
</script>