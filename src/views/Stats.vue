<template>
<navbar @on-click-back="$router.go(-1)" title="统计" class="navbar" />
<div class="page">
  <cell-group :title="st.year" v-for="st of stats">
    <cell
      v-for="s of st.stats" :title="s.display"
      :desc="`${(s.sum_duration_h / 60).toFixed(0)}分钟 | ${s.sum_distance_km}km`"
      :sub-title="`气温${s.avg_outside_temp_c.toFixed(1)}℃ 能耗${(145 / s.efficiency).toFixed(0)}Wh/km`"
      is-link
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import api from '../api/vehicle'

const stats = ref()
api.getStats().then(res => stats.value = res.reduce((arr, s) => {
  const year = s.display.split(' ')[0]
  if (arr.length > 0 && arr[arr.length - 1].year === year) {
    arr[arr.length - 1].stats.push(s)
  } else {
    arr.push({
      year,
      stats: [s]
    })
  }

  return arr
}, []))
</script>