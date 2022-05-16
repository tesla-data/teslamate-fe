<template>
<cell-group title="">
  <div ref="driveChart" style="height: 300px" />
  <div ref="elevationChart" style="height: 150px" />
  <div ref="temperatureChart" style="height: 150px" />
</cell-group>
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'
import { CellGroup } from '@nutui/nutui'
import { getPositions } from '../api/position'
import Highcharts from 'highcharts'

Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

const props = defineProps({ from: Number, to: Number })

const driveChart = ref()
const elevationChart = ref()
const temperatureChart = ref()
watch(() => [props.from, props.to], async ([from, to]) => {
  if (!from || !to) return

  const positions = await getPositions(from, to)
  console.log(positions[0])
  function drawChart(div, title, fields) {
    Highcharts.chart(div, {
      title: {
        text: title
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
        { title: { text: null }, alignTicks: false }
      ],

      legend: {
        enabled: false
      },

      series: fields.map(k =>({
        name: k,
        type: 'line',
        lineWidth: 1,
        connectNulls: true,
        data: positions.map(({ time, [k]: v }) => [time, v])
      }))
    }) // Highcharts
  }

  drawChart(driveChart.value, '驾驶数据', [
    'Speed [km/h]',
    'Power [kW]',
    'Range [km]',
    'SOC [%]'
  ])
  drawChart(elevationChart.value, '海拔', ['Elevation [m]'])
  drawChart(temperatureChart.value, '温度', [
    'Outside Temperature [°C]',
    'Inside Temperature [°C]',
    'Driver Temperature [°C]',
    'is_climate_on',
    'fan_status'
  ])
})
</script>