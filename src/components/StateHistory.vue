<template>
<br/>
<div ref="stateChart" style="height: 80px;" />
<div ref="rangeChart" style="height: 150px;" />
</template>

<script setup>
import { ref, defineProps } from 'vue'

import Highcharts from 'highcharts'
import xrange from 'highcharts/modules/xrange'
xrange(Highcharts)

import { duration } from '../filters'
import api from '../api/vehicle'

const stateChart = ref(null)
const rangeChart = ref(null)
const props = defineProps({ history: { type: Array, required: true } })
console.log(props.history)

api.getStateHistory().then(([stateHistory, rangeHistory]) => {
  Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

  const stateDesc = [
    { state: '在线', color: '#86cede' },
    { state: '行驶', color: '#8445b2' },
    { state: '充电', color: '#edcc47' },
    { state: '离线', color: '#f4b567' },
    { state: '休眠', color: '#6aa356' },
    { state: '在线', color: '#86cede' },
    { state: '升级', color: 'red' }
  ]

  Highcharts.chart(stateChart.value, {
    chart: {
      type: 'xrange'
    },

    title: {
      text: null
    },

    xAxis: {
      type: 'datetime',
      min: Date.now() - 86400 * 1000
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
        borderRadius: 0
      }
    },

    series: [{
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
    }]
  })

  Highcharts.chart(rangeChart.value, {
    title: {
      text: null
    },

    tooltip: {
      shared: true
    },

    yAxis: [
      { title: { text: null }, min: 0, max: 100, alignTicks: false },
      { title: { text: null }, min: 0, opposite: true, alignTicks: false }
    ],

    xAxis: {
      type: 'datetime',
      min: Date.now() - 86400 * 1000,
      max: Date.now()
      // categories: rangeHistory.map(({ time }) => new Date(time))
    },

    legend: {
        enabled: false
    },

    series: [{
      name: '电量',
      type: 'line',
      yAxis: 0,
      lineWidth: 1,
      connectNulls: true,
      tooltip: { valueSuffix: '%' },
      data: rangeHistory.map(({ time, battery_level }) => [time, battery_level])
    }, {
      name: '里程',
      type: 'line',
      yAxis: 1,
      lineWidth: 1,
      connectNulls: true,
      tooltip: { valueSuffix: 'km' },
      data: rangeHistory.map(({ time, range }) => [time, range])
    }]
  })
})
</script>