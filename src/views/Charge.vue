<template>
<top-nav title="充电详情" :share="true" @share="share" />
<div class="page">
  <cell-group title="">
    <track-map v-if="chargeDetail" :charges="position" />
    <line-chart title="充电曲线" :height="360" :data="chargeDetail"
      :fieldsName="fieldsName"
      :yAxis="[
        { name: '功率 & SOC[%]', softMax: 100, min: 0, top: 10, height: 250 }, { name: '表显续航', min: 0, top: 10, height: 250, opposite: true },
        { name: '温度', top: 270, height: 50, opposite: false }
      ]"
      :fields="[
        ['SOC [%]', 'Power [kW]', 'Battery heater'], ['Range [km]'],
        ['Outdoor Temperature [°C]']
      ]"
    />
    <line-chart v-if="chargeDetail && chargeDetail.find(c => c['Current [A]'])" title="电压电流" :height="150" :data="chargeDetail"
      :fieldsName="fieldsName"
      :fields="[['Charging Voltage [V]'], ['Current [A]', 'Current (pilot) [A]']]"
      :yAxis="[{ tickAmount: 4, min: 0 }, { tickAmount: 4, min: 0 }]"
    />
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
import { CellGroup } from '@nutui/nutui'

import fieldsName from '../fields'
import { getChargeDetail } from '../api/charge'
import { getDrives } from '../api/drive'
import { charge as shareCharge } from '../api/share'

import TopNav from '../components/TopNav.vue'
import TrackMap from '../components/TrackMap.vue'
import LineChart from '../components/LineChart.vue'
import DriveCellGroup from '../components/DriveCellGroup.vue'

const route = useRoute()
const chargeDetail = ref()
const position = ref(route.query.lat && route.query.lng && [[route.query.lat * 1, route.query.lng * 1, route.query.mode]])
const drives = ref()

getChargeDetail(route.query.id, route.query.from, route.query.to).then(async ([cd, [{ start_date: nextChargeTs = Date.now() } = {}]]) => {
  chargeDetail.value = cd
  drives.value = await getDrives(route.query.to, nextChargeTs)
})

async function share() {
  const { hash, id } = shareCharge(route.query.id)
  console.log({ hash, id })
}
</script>