<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'
import { getChart } from './Charts'

const props = defineProps({ height: { type: Number, default: 150 }, isToday: { type: Boolean }, data: { type: Array, default: () => [] } })
const container = ref()
let chart
watch(() => container.value, () => {
  chart = getChart(container.value, {
    title: '电量',
    xAxis: { min: Date.now() - 86400 * 1000 },
    yAxis: [
      { title: { text: null }, min: 0, max: 100, alignTicks: false },
      { title: { text: null }, min: 0, opposite: true, alignTicks: false }
    ],
    series: [{
      name: '电量',
      type: 'line',
      yAxis: 0,
      lineWidth: 1,
      connectNulls: true,
      tooltip: { valueSuffix: '%' },
      data: props.data.map(({ time, battery_level }) => [time, battery_level])
    }, {
      name: '里程',
      type: 'line',
      yAxis: 1,
      lineWidth: 1,
      connectNulls: true,
      tooltip: { valueSuffix: 'km' },
      data: props.data.map(({ time, range }) => [time, range])
    }]
  })
  
  if (props.isToday) {
    const min = Date.now() - 86400 * 1000
    const max = Date.now()
    chart.xAxis[0].setExtremes(min, max)
  }
})

watch(() => props.data, (data) => {
  chart.series[0].setData(data.map(({ time, battery_level }) => [time, battery_level]))
  chart.series[1].setData(data.map(({ time, range }) => [time, range]))
  if (props.isToday) {
    const min = Date.now() - 86400 * 1000
    const max = Date.now()
    chart.xAxis[0].setExtremes(min, max)
  }
})
</script>