<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'
import { getChart } from './Charts'

const props = defineProps({
  title: { type: String, default: '' },
  height: { type: Number, default: 150 },
  data: { type: Array, default: () => [] },
  fields: { type: Array, default: () => [] }
})

const container = ref()
let chart

function getSeries(data) {
  return props.fields.map(k =>({
    name: k,
    type: 'line',
    lineWidth: 1,
    connectNulls: true,
    data: data.map(({ time, [k]: v }) => [time, v])
  }))
}

watch(() => container.value, () => {
  chart = getChart(container.value, {
    title: props.title,
    series: getSeries(props.data)
  })
})

watch(() => props.data, (data) => {
  getSeries(data).forEach((series, i) => chart.series[i].setData(series.data))
})
</script>