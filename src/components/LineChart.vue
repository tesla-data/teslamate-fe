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
  fields: { type: Array, default: () => [] },
  yAxis: { type: Array, default: () => [] },
  seriesOptions: { type: Array, default: () => [] }
})

const container = ref()
let chart

function getSeries(data) {
  return props.fields.map((fields, i) => fields.map(k =>({
    name: k,
    type: 'line',
    marker: false,
    lineWidth: 1,
    yAxis: i,
    connectNulls: true,
    data: data.map(({ time, [k]: v }) => [time, v]),
    ...props.seriesOptions[i]
  }))).reduce((m, arr) => [...m, ...arr], [])
}

watch(() => container.value, () => {
  chart = getChart(container.value, {
    title: props.title,
    yAxis: props.fields.map((_, i) => ({ title: { text: null }, alignTicks: true, opposite: props.fields.length > 1 && i >= props.fields.length / 2, ...props.yAxis[i] })),
    series: getSeries(props.data)
  })
})

watch(() => props.data, (data) => {
  getSeries(data).forEach((series, i) => chart.series[i].setData(series.data))
})
</script>