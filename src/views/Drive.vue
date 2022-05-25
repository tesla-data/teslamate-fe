<template>
<top-nav title="行程详情" :share="true" @share="share" />
<div class="page">
  <cell-group v-if="drive"
    :title="`行驶了${drive.duration_min}分钟 ${drive.distance_km.toFixed(1)}km 能耗${drive.consumption_kwh_km && drive.consumption_kwh_km.toFixed(0)}Wh/km ${drive.efficiency ? '' : '(*)'}`"
    :desc="`最大功率${drive.power_max}Kw 里程表: ${drive.start_km.toFixed(0)} - ${drive.end_km.toFixed(0)}km`"
  >
    <cell
      :title="drive.start_address"
      :desc="`电量: ${drive['% Start']}% ${drive.start_ideal_range_km.toFixed(0)}km `"
      :sub-title="`${new Date(drive.start_date_ts).toLocaleString()}`"
    />
    <cell
      :title="drive.end_address"
      :desc="`电量: ${drive['% End']}% ${drive.end_ideal_range_km.toFixed(0)}km`"
      :sub-title="`${new Date(drive.end_date_ts).toLocaleString()}`"
    />
  </cell-group>
  <cell-group title="">
    <track-map v-if="positions" :track="track" :highlight="currentPointIndex" />

    <line-chart title="" :height="560" :data="positions"
      v-model:current="currentPointIndex"
      :fieldsName="fieldsName"
      :yAxis="[
        { name: '功率', top: 0, opposite: true, top: 10, height: 200 }, { name: '速度', opposite: false, top: 10, height: 200 },
        { name: '海拔', opposite: false, top: 230, height: 75 },
        { name: '温度', opposite: false, top: 325, height: 75 },
        { name: 'SOC', opposite: false, top: 420, height: 100 }, { name: '表显续航', opposite: true, top: 420, height: 100 }
      ]"
      :fields="[
        ['Power [kW]'], ['Speed [km/h]'],
        ['Elevation [m]'],
        [
          'Outside Temperature [°C]',
          'Inside Temperature [°C]',
          'Driver Temperature [°C]',
          'is_climate_on',
          'fan_status'
        ],
        ['battery_level'], ['range']
      ]"
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
import { CellGroup, Cell } from '@nutui/nutui'

import fieldsName from '../fields'
import { getPositions } from '../api/position'
import { getDriveDetail } from '../api/drive'
import { drive as shareDrive } from '../api/share'

import TopNav from '../components/TopNav.vue'
import TrackMap from '../components/TrackMap.vue'
import LineChart from '../components/LineChart.vue'

const route = useRoute()
const drive = ref()
const positions = ref()
const currentPointIndex = ref()
const track = ref()
getDriveDetail(route.query.drive_id).then(async res => {
  const { start_date_ts, end_date_ts } = drive.value = res[0]
  positions.value = await getPositions(start_date_ts, end_date_ts)
  track.value = positions.value.map(({ latitude, longitude }) => [latitude, longitude])
})

async function share() {
  const { hash, id } = await shareDrive(route.query.drive_id)
  console.log(hash, id)
}
</script>