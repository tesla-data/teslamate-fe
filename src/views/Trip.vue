<template>
<navbar @on-click-back="$router.go(-1)" :title="`${route.query.display}行程`" class="navbar" />
<div class="page">
  <charge-cell-group :charges="tripStats.charges" />
  <cell-group v-if="tripStats.drives" title="驾驶纪录">
    <cell
      v-for="d of tripStats.drives" :title="d.start_address"
      :to="{ name: 'Drive', query: { drive_id: d.drive_id }, params: d }"
      :desc="`${d.duration_min}分钟 | ${d.distance_km.toFixed(0)}km`"
      :sub-title="`温度${d.outside_temp_c}℃ 能耗${d.consumption_kwh_km && d.consumption_kwh_km.toFixed(0)}Wh/km ${d.efficiency ? '' : '(*)'}`"
      is-link
    />
  </cell-group>
  <div v-if="tripStats.charges && tripStats.drives">
    {{tripStats.drives[0]}}<br/>
    {{tripStats.charges[0]}}
  </div>
</div>
</template>

<script>
export default {
  name: 'Trip'
}
</script>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import { stats } from '../api/stats'
import ChargeCellGroup from '../components/ChargeCellGroup.vue'

const tripStats = ref({})
const route = useRoute()
// const params = route.params

const { from, to } = route.query
if (from && to ) stats(from, to).then(res => tripStats.value = res)
</script>