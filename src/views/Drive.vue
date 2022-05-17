<template>
<navbar @on-click-back="$router.go(-1)" title="行程详情" class="navbar" />
<div class="page">
  <cell-group v-if="drive"
    :title="`行驶了${drive.duration_min}分钟 ${drive.distance_km.toFixed(1)}km 能耗${drive.consumption_kwh_km && drive.consumption_kwh_km.toFixed(0)}Wh/km ${drive.efficiency ? '' : '(*)'}`"
    :desc="`里程表: ${drive.start_km.toFixed(0)} - ${drive.end_km.toFixed(0)}km`"
  >
    <cell
      :title="drive.start_address"
      :desc="`电量: ${drive['% Start']}% ${drive.start_ideal_range_km.toFixed(0)}km `"
      :sub-title="`${new Date(drive.start_date_ts).toLocaleString()} 温度${drive.outside_temp_c}℃`"
    />
    <cell
      :title="drive.end_address"
      :desc="`电量: ${drive['% End']}% ${drive.end_ideal_range_km.toFixed(0)}km`"
      :sub-title="`${new Date(drive.end_date_ts).toLocaleString()} 温度${drive.outside_temp_c}℃`"
    />
  </cell-group>
  <cell-group title="">
    <line-chart title="速度&功率" :height="200" :data="positions"
      :fields="[['Speed [km/h]'], ['Power [kW]']]"
    />
    <line-chart title="电量&续航" :height="150" :data="positions"
      :fields="[['battery_level'], ['range']]"
      :series-options="[{ stickyTracking: false }]"
    />
    <line-chart title="海拔" :height="100" :data="positions" :fields="[['Elevation [m]']]" />
    <line-chart title="温度" :height="100" :data="positions" :fields="[[
      'Outside Temperature [°C]',
      'Inside Temperature [°C]',
      'Driver Temperature [°C]',
      'is_climate_on',
      'fan_status']]"
    />
  </cell-group>
</div>
</template>

<script>
export default {
  name: 'Drive'
}
</script>

<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import { getPositions } from '../api/position'
import { getDriveDetail } from '../api/drive'
import LineChart from '../components/LineChart.vue'

const route = useRoute()
const drive = ref()
const positions = ref()
getDriveDetail(route.query.drive_id).then(async res => {
  const { start_date_ts, end_date_ts } = drive.value = res[0]
  positions.value = await getPositions(start_date_ts, end_date_ts)
})
</script>