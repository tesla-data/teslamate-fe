<template>
<navbar @on-click-back="$router.go(-1)" fixed title="充电详情" class="navbar" />
<div class="page">
  <cell-group title="">
    <track-map v-if="position" :points="position" />
    <line-chart title="充电曲线" :height="250" :data="chargeDetail"
      :fields="[['SOC [%]', 'Power [kW]', 'Battery heater'], ['Range [km]']]"
      :yAxis="[{ softMax: 100, min: 0 }, { min: 0 }]"
    />
    <line-chart v-if="chargeDetail && chargeDetail.find(c => c['Current [A]'])" title="电压电流" :height="150" :data="chargeDetail"
      :fields="[['Charging Voltage [V]'], ['Current [A]', 'Current (pilot) [A]']]"
      :yAxis="[{ tickAmount: 4, min: 0 }, { tickAmount: 4, min: 0 }]"
    />
    <line-chart title="温度" :height="100" :data="chargeDetail" :fields="[['Outdoor Temperature [°C]']]" />
  </cell-group>
  <drive-cell-group title="本次充电后" :drives="drives"/>

</div>
</template>

<script>
export default {
  name: 'Charge'
}
</script>

<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { Navbar, CellGroup } from '@nutui/nutui'

import { getChargeDetail } from '../api/charge'
import { getDrives } from '../api/drive'
import TrackMap from '../components/TrackMap.vue'
import LineChart from '../components/LineChart.vue'
import DriveCellGroup from '../components/DriveCellGroup.vue'

const route = useRoute()
const chargeDetail = ref()
const position = ref(route.query.lat && route.query.lng && [[route.query.lat * 1, route.query.lng * 1]])
const drives = ref()

getChargeDetail(route.query.id, route.query.from, route.query.to).then(async ([cd, [{ start_date: nextChargeTs = Date.now() } = {}]]) => {
  chargeDetail.value = cd
  drives.value = await getDrives(route.query.to, nextChargeTs)
})
</script>