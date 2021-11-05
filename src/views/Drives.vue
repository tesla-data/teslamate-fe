<template>
<navbar @on-click-back="$router.go(-1)" title="行程" />
<div class="page" style="margin-top: -40px;">
  <!-- {{drives[0]}} -->

  <cell-group title="行程">
    <cell
      v-for="d of drives" :title="d.start_address"
      :desc="`${d.duration_min}分钟 | ${d.distance_km.toFixed(0)}km`"
      :sub-title="`温度${d.outside_temp_c}℃ 能耗${d.consumption_kwh_km && d.consumption_kwh_km.toFixed(0)}Wh/km`"
      is-link
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import api from '../api/vehicle'

const drives = ref()
api.getDrives().then(res => drives.value = res)
</script>