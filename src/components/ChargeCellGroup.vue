<template>
<cell-group v-if="charges && charges.length > 0" :title="`${title || ''} 充电${charges.length}次 ${sum(charges)}度`" :desc="`${sumDc(charges, 'dc')}${sumDcTime(charges)} ${sumAc(charges, 'ac')}`">
  <cell
    v-for="(c, i) of charges" :title="c.address"
    :to="{ name: 'Charge', query: { id: c.id, mode: c.mode, lat: c.latitude, lng: c.longitude, from: c.start_date_ts, to: c.end_date_ts }, params: c }"
    :desc="`充入${c.charge_energy_added}kwh`"
    :sub-title="`${new Date(c.start_date_ts).toLocaleDateString()} 用时${duration(c.duration_min * 60 * 1000 || 0)} ${c.distance && ('行驶' + Math.round(c.distance) + 'km') || ''}`"
    is-link
  />
</cell-group>
</template>

<script setup>
import { defineProps } from 'vue'
import { CellGroup, Cell } from '@nutui/nutui'
import { duration } from '../filters'

defineProps({ title: String, charges: Object })

function sum(charges, mode) {
  if (mode) charges = charges.filter(c => c.mode === mode)
  const total = charges.reduce((m, c) => m + c.charge_energy_added, 0)
  return total && total.toFixed(1)
}

function sumDc(charges) {
  const dc = sum(charges, 'dc')
  return dc ? `快充${dc}度` : ''
}

function sumDcTime(charges) {
  charges = charges.filter(c => c.mode === 'dc')
  const time = charges.reduce((m, c) => m + c.duration_min, 0) * 60 * 1000
  return time ? `用时${duration(time)}` : ''
}

function sumAc(charges) {
  const ac = sum(charges, 'ac')
  return ac ? `慢充${ac}度` : ''
}
</script>
