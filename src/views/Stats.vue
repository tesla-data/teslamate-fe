<template>
<top-nav title="统计" />
<div class="page">
  <cell-group :title="`${st.year} 行驶了${st.stats.reduce((m, s) => m + s.sum_distance_km, 0)}km`" v-for="st of stats">
    <template v-slot:title>
      <router-link class="nut-cell-group__title" style="text-decoration: none;"
        :to="{ name: 'Trip', query: { display: st.year, from: Date.parse(st.year + '/1/1'), to: Date.parse((st.year * 1 + 1) + '/1/1') } }"
      >
        {{`${st.year} 行驶了${st.stats.reduce((m, s) => m + s.sum_distance_km, 0)}km`}} >
      </router-link>
    </template>

    <cell
      v-for="s of st.stats" :title="s.display"
      :desc="`${(s.sum_duration_h / 60).toFixed(0)}分钟 | ${s.sum_distance_km}km`"
      :sub-title="`气温${s.avg_outside_temp_c.toFixed(1)}℃ 能耗${(145 / s.efficiency).toFixed(0)}Wh/km`"
      :to="{ name: 'Trip', query: { display: s.display, from: s.date_from, to: s.date_to }, params: s }"
      is-link
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { CellGroup, Cell } from '@nutui/nutui'

import TopNav from '../components/TopNav.vue'
import { stats as getStats } from '../api/stats'

const stats = ref()
onActivated(() => {
  getStats().then(res => stats.value = res.reduce((arr, s) => {
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
})
</script>