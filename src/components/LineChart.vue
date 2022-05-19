<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, defineProps, watch, onUnmounted } from 'vue'
import { getChart } from './Charts'

const props = defineProps({
  isTimeSeries: { type: Boolean, default: true },
  title: { type: String, default: '' },
  height: { type: Number, default: 150 },
  data: { type: Array, default: () => [] },
  xField: { type: String, default: 'time' },
  fields: { type: Array, default: () => [] },
  fieldsName: { type: Object, default: () => ({}) },
  yAxis: { type: Array, default: () => [] },
  seriesOptions: { type: Array, default: () => [] },
  extremes: { type: Object, default: () => ({}) }
})

const container = ref()
let chart

function getSeries(data) {
  return props.fields.map((fields, i) => fields.map(k =>({
    name: props.fieldsName[k] || k,
    states: { hover: { enabled: false }, inactive: { enabled: false } },
    type: 'line',
    marker: false,
    lineWidth: 1,
    yAxis: i,
    connectNulls: true,
    data: data.map(({ [props.xField]: x, [k]: v }) => [x, v]),
    tooltip: { valueDecimals: 0 },
    ...props.seriesOptions[i]
  }))).reduce((m, arr) => [...m, ...arr], [])
}

watch(() => container.value, () => {
  const yAxis = props.fields.map((_, i) => ({
    title: { text: props.yAxis[i] && props.yAxis[i].name, margin: 10, reserveSpace: false },
    alignTicks: true, opposite: props.fields.length > 1 && i >= props.fields.length / 2, ...props.yAxis[i]
  }))
  for (const y of yAxis) {
    if (!y.labels) {
      y.labels = {
        reserveSpace: false,
        align: y.opposite ? 'right' : 'left',
        x: y.opposite ? -8 : 0,
        y: 3
      }
    }
  }

  chart = getChart(container.value, {
    title: props.title,
    xAxis: {
      type: props.isTimeSeries ? 'datetime' : 'linear',
      ...props.extremes
    },
    yAxis,
    series: getSeries(props.data)
  })
})

watch(() => [props.data, props.extremes], ([data, { min, max }]) => {
  getSeries(data).forEach((series, i) => chart.series[i].setData(series.data))
  if (min || max) chart.xAxis[0].setExtremes(min, max)
})

onUnmounted(() => chart.destroy())
</script>