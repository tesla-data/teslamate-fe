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
    <div ref="driveChart" style="height: 200px" />
    <div ref="batteryChart" style="height: 150px" />
    <div ref="elevationChart" style="height: 150px" />
    <div ref="temperatureChart" style="height: 150px" />
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
import { drawChart } from '../components/PositionChart'

const route = useRoute()
const drive = ref()
const driveChart = ref()
const batteryChart = ref()
const elevationChart = ref()
const temperatureChart = ref()
getDriveDetail(route.query.drive_id).then(async res => {
  const { start_date_ts, end_date_ts } = drive.value = res[0]
  const positions = await getPositions(start_date_ts, end_date_ts)
  drawChart(positions, driveChart.value, '驾驶数据', [
    'Speed [km/h]',
    'Power [kW]'
  ])
  drawChart(positions, batteryChart.value, '电池数据', [
    'Range [km]',
    // 'SOC [%]'
  ])
  drawChart(positions, elevationChart.value, '海拔', ['Elevation [m]'])
  drawChart(positions, temperatureChart.value, '温度', [
    'Outside Temperature [°C]',
    'Inside Temperature [°C]',
    'Driver Temperature [°C]',
    'is_climate_on',
    'fan_status'
  ])
})
</script>