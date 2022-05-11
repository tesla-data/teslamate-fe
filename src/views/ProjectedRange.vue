<template>
<navbar @on-click-back="$router.go(-1)" title="满电续航" class="navbar" />
<div class="page" style="margin-top: 40px;">
  <div ref="projectedRangeChart" style="height: 350px;" />
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { Navbar } from '@nutui/nutui'
import Highcharts from 'highcharts'

import api from '../api/vehicle'

Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

const projectedRangeChart = ref(null)
onActivated(() => {
  api.getProjectedRange().then(([projectedRange, mileage]) => {
    Highcharts.chart(projectedRangeChart.value, {
      title: {
        text: null
      },

      yAxis: [
        { title: { text: null }, alignTicks: false }
      ],

      legend: {
        enabled: false
      },

      series: [{
        name: '续航',
        type: 'line',
        lineWidth: 1,
        connectNulls: true,
        tooltip: { valueDecimals: 0, valueSuffix: 'km' },
        data: projectedRange.map(({ projected_range }, i) => i < mileage.length && [Math.round(mileage[i].mileage), projected_range]).filter(v => !!v)
      }]
    })

  }) // Highcharts
})
</script>