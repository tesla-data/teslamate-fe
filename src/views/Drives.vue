<template>
<navbar @on-click-back="$router.go(-1)" title="统计" />
<div class="page" style="margin-top: -40px;">
  <cell-group title="统计结果">
    <!-- <cell
      v-for="s of stats" :title="s.display"
      :desc="`${(s.sum_duration_h / 60).toFixed(0)}分钟 | ${s.sum_distance_km}km`"
      :sub-title="`气温${s.avg_outside_temp_c.toFixed(1)}℃ 能耗${(145 / s.efficiency).toFixed(0)}Wh/km`"
      is-link
    /> -->
  </cell-group>
  {{drives}}
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import api from '../api/vehicles'

const drives = ref()
api.getDrives().then(res => drives.value = res)
</script>