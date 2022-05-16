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
  <position-chart :from="from" :to="to" />
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

import { getDriveDetail } from '../api/drive'
import PositionChart from '../components/PositionChart.vue'

const route = useRoute()
const drive = ref()
const from = ref()
const to = ref()
getDriveDetail(route.query.drive_id).then(async res => {
  const { start_date_ts, end_date_ts } = drive.value = res[0]
  from.value = start_date_ts
  to.value = end_date_ts
  // positions.value = await getPositions(start_date_ts, end_date_ts)
})
</script>