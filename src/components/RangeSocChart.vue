<template>
  <line-chart title="电量&续航" :height="150" :data="data"
    :yAxis="[{ max: 100, min: 0 }, { min: 0 }]"
    :fields="[['battery_level'], ['range']]"
    :series-options="[{ stickyTracking: false, tooltip: { valueSuffix: '%' } }]"
    :fields-name="{ battery_level: '电量', range: '里程' }"
    :extremes="extremes"
  />
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'

import LineChart from './LineChart.vue'

const props = defineProps({ height: { type: Number, default: 150 }, isToday: { type: Boolean }, data: { type: Array, default: () => [] } })
const extremes = ref(props.isToday ? { min: Date.now() - 24 * 60 * 60 * 1000, max: Date.now() } : {})

watch(() => props.data, (data) => {
  if (props.isToday) extremes.value = { min: Date.now() - 24 * 60 * 60 * 1000, max: Date.now() }
})
</script>