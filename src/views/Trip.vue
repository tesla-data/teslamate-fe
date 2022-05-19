<template>
<navbar @on-click-back="$router.go(-1)" fixed :title="`${route.query.display}行程`" class="navbar" />
  <div class="page">
  <cell-group>
    <track-map
      v-if="positions.length > 0"
      :highlight="currentPointIndex"
      :track="track"
      :charges="charges"
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
import { useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { Navbar, CellGroup } from '@nutui/nutui'

import fieldsName from '../fields'
import { stats } from '../api/stats'
import { getPositionsBig } from '../api/position'
import DriveCellGroup from '../components/DriveCellGroup.vue'
import ChargeCellGroup from '../components/ChargeCellGroup.vue'
import TrackMap from '../components/TrackMap.vue'
import LineChart from '../components/LineChart.vue'
import RangeSocChart from '../components/RangeSocChart.vue'

const route = useRoute()

let lastLeave = 0, isKeepalive
const tripStats = ref({})
const positions = ref([])
const track = ref([])
const charges = ref([])
const currentPointIndex = ref()

onActivated(() => {
  const now = Date.now()
  const { from, to } = route.query
  if (from && to && !isKeepalive) {
    stats(from, to).then(res => {
      if (now > lastLeave) {
        tripStats.value = res
        charges.value = res.charges.map(({ latitude, longitude, mode }) => [latitude, longitude, mode])
      }
    })

    getPositionsBig(from, to).then(res => {
      if (now > lastLeave) {
        positions.value = res
        track.value = res.map(({ latitude, longitude }) => [latitude, longitude])
      }
    })
  } else {
    charges.value = [...charges.value]
  }
})

const noKeepAlivePages = ['Stats', 'Drives']
onBeforeRouteLeave(function (to) {
  lastLeave = Date.now()
  if (noKeepAlivePages.indexOf(to.name) >= 0) {
    positions.value = []
    tripStats.value = {}
    track.value = []
    charges.value = []
    isKeepalive = false
  } else {
    isKeepalive = true
  }
})
</script>