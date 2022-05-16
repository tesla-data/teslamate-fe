<template>
<navbar @on-click-back="$router.go(-1)" title="充电" class="navbar" />
<div class="page">
  <charge-cell-group v-for="cg of charges" :title="cg.month" :charges="cg.charges" />
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { Navbar } from '@nutui/nutui'

import api from '../api/vehicle'
import ChargeCellGroup from '../components/ChargeCellGroup.vue'

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