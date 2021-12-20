<template>
<navbar @on-click-back="$router.go(-1)" title="行程" class="navbar" />
<div class="page">
  <cell-group v-for="dg of drivesGroups" :title="`${dg.date} 行驶了${dg.drives.reduce((m, d) => m + d.distance_km, 0).toFixed(0)}km`">
    <cell
      v-for="d of dg.drives" :title="d.start_address"
      :desc="`${d.duration_min}分钟 | ${d.distance_km.toFixed(0)}km`"
      :sub-title="`温度${d.outside_temp_c}℃ 能耗${d.consumption_kwh_km && d.consumption_kwh_km.toFixed(0)}Wh/km ${d.efficiency ? '' : '(*)'}`"
      is-link
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import api from '../api/vehicle'

const drivesGroups = ref()
api.getDrives().then(res => {
  drivesGroups.value = res.reduce((arr, drive) => {
    const date = new Date(drive.start_date_ts).toLocaleDateString()
    if (arr.length > 0 && arr[arr.length - 1].date === date) {
      arr[arr.length - 1].drives.push(drive)
    } else {
      arr.push({
        date,
        drives: [drive]
      })
    }

    return arr
  }, [])
})
</script>