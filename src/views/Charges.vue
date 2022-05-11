<template>
<navbar @on-click-back="$router.go(-1)" title="充电" class="navbar" />
<div class="page">
  <cell-group :title="cg.month + ' 充电' + cg.charges.length + '次'" v-for="cg of charges">
    <!-- {{charges && charges[0]}} -->
    <cell
      v-for="(c, i) of cg.charges" :title="c.address"
      :desc="`充入${c.charge_energy_added}kwh`"
      :sub-title="`${new Date(c.start_date_ts).toLocaleDateString()} 用时${duration(c.duration_min * 60 * 1000 || 0)} ${c.distance && ('行驶' + Math.round(c.distance) + 'km') || ''}`"
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'
import { duration } from '../filters'

import api from '../api/vehicle'

const charges = ref()
onActivated(() => {
  api.getCharges().then(res => charges.value = res.reduceRight((arr, c, i) => {
    if (i > 0) c.distance = res[i - 1].distance
    else delete c.distance

    const date = new Date(c.start_date_ts)
    const month = date.getFullYear() + '/' + (date.getMonth() + 1)

    if (arr.length > 0 && arr[0].month === month) {
      arr[0].charges.unshift(c)
    } else {
      arr.unshift({
        month,
        charges: [c]
      })
    }

    return arr
  }, []))
})
</script>