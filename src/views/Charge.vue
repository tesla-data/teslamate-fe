<template>
<navbar @on-click-back="$router.go(-1)" title="充电详情" class="navbar" />
<div class="page">
  <cell-group title="充电曲线">
    <div ref="chargeDetailChart" style="height: 350px;" />
  </cell-group>
</div>
</template>

<script>
export default {
  name: 'Charge'
}
</script>

<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'
import Highcharts from 'highcharts'

import { getChargeDetail } from '../api/charge'

Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

const route = useRoute()
const params = route.params

const chargeDetailChart = ref()
getChargeDetail(route.query.id).then(res => {
  if (!res.length) return

  const keys = Object.keys(res[0]).filter(v => v !== 'time')
  Highcharts.chart(chargeDetailChart.value, {
    title: {
      text: null
    },

    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        millisecond: '%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%m-%d',
        week: '%m-%d',
        month: '%Y-%m',
        year: '%Y'
      }
    },

    tooltip: {
      shared: true,
      crosshairs: true
    },

    yAxis: [
      { title: { text: null }, alignTicks: false },
      { title: { text: null }, alignTicks: false, opposite: true }
    ],

    legend: {
      enabled: false
    },

    series: keys.map(k =>({
      name: k,
      type: 'line',
      lineWidth: 1,
      connectNulls: true,
      yAxis: k.indexOf('Voltage') >= 0 || k.indexOf('Range') >= 0 ? 1 : 0,
      data: res.map(({ time, [k]: v }) => [time, v])
    }))
  }) // Highcharts
})
</script>