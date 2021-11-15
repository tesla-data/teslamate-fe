<template>
<navbar @on-click-back="$router.go(-1)" title="充电" class="navbar" />
<div class="page">
  <cell-group title="统计结果">
    {{charges && charges[0]}}
    <cell
      v-for="(c, i) of charges" :title="c.address"
      :desc="`充入${c.charge_energy_added}kwh`"
      :sub-title="`${new Date(c.start_date_ts).toLocaleDateString()} 用时${duration(c.duration_min * 60 * 1000 || 0)} 行驶${(i > 0 ? (charges[i - 1].distance || 0) : 0).toFixed(0)}km`"
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'
import { duration } from '../filters'

import api from '../api/vehicle'

const charges = ref()
api.getCharges().then(res => charges.value = res)
</script>