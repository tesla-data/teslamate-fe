<template>
<popup position="left" style="background-color: #f7f8fa; width: 85%; height: 100%;" :z-index="10000" v-model:visible="show">
  <cell-group :title="`${title} 行驶了${data.reduce((m, s) => m + s.sum_distance_km, 0)}km`">
    <cell center
      v-for="s of data" :title="s.display"
      :desc="`${(s.sum_duration_h / 60).toFixed(0)}分钟 | ${s.sum_distance_km}km`"
      :sub-title="`气温${s.avg_outside_temp_c.toFixed(1)}℃ 能耗${(145 / s.efficiency).toFixed(0)}Wh/km`"
      :to="{ name: 'Trip', query: { display: s.display, from: s.date_from, to: s.date_to }, params: s }"
      is-link
    />
  </cell-group>
</popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Popup, CellGroup, Cell  } from '@nutui/nutui'

import { stats } from '../api/stats'

const props = defineProps({
  title: { type: String, default: '' },
  from: { type: Number, default: 0 },
  to: { type: Number, default: 0 },
  r: { type: Number, default: 0 }
})

const show = ref(false)
const data = ref([])
watch(() => [props.from, props.to, props.r], async ([from, to]) => {
  if (from > 0 && to > 0) {
    show.value = true
    data.value = await stats('day', from, to)
  } else {
    show.value = false
  }
})
</script>