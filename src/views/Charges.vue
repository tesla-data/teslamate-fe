<template>
<top-nav title="充电" />
<div class="page">
  <charge-cell-group v-for="cg of charges" :title="cg.month" :charges="cg.charges" />
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import TopNav from '../components/TopNav.vue'

import { getCharges } from '../api/charge'
import ChargeCellGroup from '../components/ChargeCellGroup.vue'

const charges = ref()
onActivated(() => {
  getCharges().then(res => charges.value = res.reduceRight((arr, c, i) => {
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