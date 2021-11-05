<template>
<div ref="stateChart" />
<div ref="rangeChart" />
</template>

<script setup>
import { ref } from 'vue'
import Highcharts from 'highcharts'
import api from '../api/vehicles'

const stateChart = ref(null)
const rangeChart = ref(null)

api.getStateHistory().then(([stateHistory, rangeHistory]) => {
  Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() } })

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
      // categories: rangeHistory.map(({ time }) => new Date(time))
    },

    legend: {
        enabled: false,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
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