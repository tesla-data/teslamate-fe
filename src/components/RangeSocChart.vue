<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'
import { getChart } from './Charts'

const props = defineProps({ height: { type: Number, default: 150 }, isToday: { type: Boolean }, data: { type: Array, default: () => [] } })
const container = ref()
let chart

function updateExtremes(chart) {
  const min = Date.now() - 86400 * 1000
  const max = Date.now()
  chart.xAxis[0].setExtremes(min, max)
}

function getSeries(data) {
  return [{
    name: '电量',
    type: 'line',
    yAxis: 0,
    lineWidth: 1,
    connectNulls: true,
    tooltip: { valueSuffix: '%' },
    data: data.map(({ time, battery_level }) => [time, battery_level])
  }, {
    name: '里程',
    type: 'line',
    yAxis: 1,
    lineWidth: 1,
    connectNulls: true,
    tooltip: { valueSuffix: 'km' },
    data: data.map(({ time, range }) => [time, range])
  }]
}

watch(() => container.value, () => {
  chart = getChart(container.value, {
    title: '电量',
    xAxis: { min: Date.now() - 86400 * 1000 },
    yAxis: [
      { title: { text: null }, min: 0, max: 100, alignTicks: false },
      { title: { text: null }, min: 0, opposite: true, alignTicks: false }
    ],
    series: getSeries(props.data)
  })
  
  if (props.isToday) updateExtremes(chart)
})

watch(() => props.data, (data) => {
  getSeries(props.data).forEach((series, i) => chart.series[i].setData(series.data))
  if (props.isToday) updateExtremes(chart)
})
</script>