<template>
<navbar @on-click-back="$router.go(-1)" title="充电详情" class="navbar" />
<div class="page">
  <cell-group title="充电曲线">
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
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import { getChargeDetail } from '../api/charge'
import LineChart from '../components/LineChart.vue'

const route = useRoute()
const chargeDetail = ref()

getChargeDetail(route.query.id).then(res => chargeDetail.value = res)
</script>