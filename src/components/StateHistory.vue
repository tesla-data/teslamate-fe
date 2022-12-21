<template>
<br/>
<div ref="stateChart" style="height: 80px;" />
<range-soc-chart :data="rangeHistoryRef" is-today />
</template>

<script setup>
import { ref, watch } from 'vue'

import Highcharts from 'highcharts'
import xrange from 'highcharts/modules/xrange'

import { duration } from '../filters'
import RangeSocChart from './RangeSocChart.vue'

Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })
xrange(Highcharts)

const stateChart = ref(null)
const props = defineProps({ history: { type: Array, required: true } })

const stateDesc = [
  { state: '在线', color: '#86cede' },
  { state: '行驶', color: '#8445b2' },
  { state: '充电', color: '#edcc47' },
  { state: '离线', color: '#f4b567' },
  { state: '休眠', color: '#6aa356' },
  { state: '在线', color: '#86cede' },
  { state: '升级', color: 'red' }
]

function convertStateHistory(stateHistory) {
  return {
    // borderColor: 'gray',
    pointWidth: 40,
    data: stateHistory.map(({ time, state }, i) => ({
      x: time,
      x2: (stateHistory[i + 1] || { time: Date.now() }).time,
      y: 0,
      ...stateDesc[state]
    })),
    dataLabels: {
      enabled: true
    }
  }
}

const rangeHistoryRef = ref(props.history[1] || [])
watch(() => props.history, ([stateHistory, rangeHistory]) => {
  rangeHistoryRef.value = rangeHistory
  stateChart.value.chart.series[0].setData(convertStateHistory(stateHistory).data)

  const min = Date.now() - 86400 * 1000
  const max = Date.now()
  stateChart.value.chart.xAxis[0].setExtremes(min, max)
})

watch(stateChart, async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  stateChart.value.chart = Highcharts.chart(stateChart.value, {
    chart: {
      type: 'xrange'
    },

    title: {
      text: null
    },

    xAxis: {
      type: 'datetime',
      min: Date.now() - 86400 * 1000,
      max: Date.now()
    },

    tooltip: {
      formatter: function () {
        const desc = stateDesc.find(item => item.color === this.color)
        return `${desc.state} ${duration(this.x2 - this.x)}`
      }
    },

    yAxis: {
      title: {
        text: ''
      },
      categories: ['State'],
      labels: {
        enabled: false
      },
      gridLineWidth: 0
    },

    legend: {
      enabled: false
    },

    plotOptions: {
      series: {
        borderRadius: 0,
        animation: false
      },
      xrange: {
        borderWidth: 1e-4
      }
    },

    series: [convertStateHistory(props.history[0])]
  })
})
</script>