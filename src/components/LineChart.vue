<template>
  <div
    style="position: relative;"
    @touchstart="touchstart = Date.now()"
    @mousemove="touchstart = 0"
    @touchmove="e => { if (Date.now() - touchstart > 100 && e.cancelable) e.preventDefault() }"
  >
    <div v-if="tooltips.display" :style="{ position: 'absolute', 'z-index': 999, top: '10px', [tooltips.display]: '30px' }">
      <table style="border: 1px solid #888; background-color: rgba(255, 255, 255, 0.9); font-size: 11px;">
        <tr><td colspan="2">{{tooltips.title}}</td></tr>
        <tr v-if="showOffset === 'stats'">
          <td colspan="2">
            行驶 {{tooltips.offset.odometer.toFixed(0)}}km
          </td>
        </tr>
        <tr v-if="showOffset === 'drive'">
          <td colspan="2">
            行驶{{duration(tooltips.offset.time)}} {{tooltips.offset.odometer.toFixed(0)}}km
          </td>
        </tr>
        <tr v-if="showOffset === 'charge' && tooltips.offset.time > 0">
          <td colspan="2">
            充电{{duration(tooltips.offset.time)}}
          </td>
        </tr>
        <tr v-if="showOffset === 'charge' && tooltips.offset.time > 0">
          <td colspan="2">
            <span v-if="tooltips.offset.data.kwhAdded > 0">+{{tooltips.offset.data.kwhAdded.toFixed(0)}}Kwh</span>
            +{{tooltips.offset.data.rangeAdded.toFixed(0)}}km
          </td>
        </tr>
        <tr v-for="tt of tooltips.tooltips"><td><span :style="{ color: tt.color }">●</span> {{tt.name}}</td><td style="text-align: right;">{{tt.value}}</td></tr>
      </table>
    </div>
    <div ref="container" :style="{ height: height + 'px' }" />
  </div>
</template>

<script setup>
import _ from 'lodash'
import { ref, watch, onUnmounted } from 'vue'

import { duration } from '../filters'
import { getChart } from './Charts'

const emit = defineEmits(['update:current'])

const props = defineProps({
  showOffset: { type: String, default: '' },
  current: { type: Number, default: -1 },
  isTimeSeries: { type: Boolean, default: true },
  title: { type: String, default: '' },
  height: { type: Number, default: 150 },
  data: { type: Array, default: () => [] },
  xField: { type: String, default: 'time' },
  fields: { type: Array, default: () => [] },
  fieldsName: { type: Object, default: () => ({}) },
  xAxis: { type: Object, default: () => ({}) },
  yAxis: { type: Array, default: () => [] },
  seriesOptions: { type: Array, default: () => [] },
  extremes: { type: Object, default: () => ({}) }
})

const container = ref()
const touchstart = ref(0)
const tooltips = ref({ tooltips: [] })
let chart

function getSeries(data) {
  let dataIdx = 0
  return props.fields.map((fields, i) => fields.map(k =>({
    name: props.fieldsName[k] || k,
    states: { hover: { enabled: false }, inactive: { enabled: false } },
    type: 'line',
    marker: false,
    lineWidth: 1,
    yAxis: i,
    connectNulls: true,
    turboThreshold: 0,
    data: data.map(({ [props.xField]: x, [k]: y }, i) => ({ x, y, i })),
    tooltip: { valueDecimals: 0 },
    ...props.seriesOptions[dataIdx++]
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
      ...props.xAxis,
      ...props.extremes
    },
    yAxis,
    series: getSeries(props.data),
    tooltip: {
      shared: true,
      crosshairs: true,
      animation: false,
      style: { display: 'none' },
      positioner(_, __, { plotX }) {
        tooltips.value.display = plotX / container.value.clientWidth > 0.5 ? 'left' : 'right'
        return { x: 0, y: 0, plotX }
      },
      formatter(tooltip) {
        hideTooltip()

        emit('update:current', this.points[0].point.options.i)
        const { x, points: [{ point: { index } }] } = this
        const { chart: { xAxis: [{ dataMax, dataMin }] } } = tooltip
        const durThreshold = Math.max(30 * 1000, (dataMax - dataMin) / container.value.clientWidth * 5)
        tooltips.value = {
          title: tooltip.chart.xAxis[0].options.type === 'datetime' ? new Date(x).toLocaleString() : x,
          display: tooltips.value.display,
          tooltips: [],
          offset: props.showOffset && {
            data: props.data[this.points[0].point.options.i],
            time: this.points[0].point.options.x - tooltip.chart.series[0].data[0].x,
            odometer: props.data[this.points[0].point.options.i].odometer - props.data[0].odometer
          }
        }

        for (const se of tooltip.chart.series) {
          let i = 0
          for (; i < 1000; i++) {
            const value = (se.data[index + i] || {}).y || (se.data[index - i] || {}).y
            if ((se.data[index + i] || {}).x - x > durThreshold && x - (se.data[index - i] || {}).x > durThreshold) break
            if (value !== null && value !== undefined) {
              tooltips.value.tooltips.push({ color: se.color, name: se.name, value: formatVal(value, se.options.tooltip) })
              break
            }
          }
        }
      }
    }
  })
})

function formatVal(val, { valueDecimals = 2, valueSuffix = '', valuePrefix = '' } = {}) {
  return valuePrefix + val.toFixed(valueDecimals) + valueSuffix
}

const hideTooltip = _.debounce(() => {
  tooltips.value = { tooltips: [] }
  emit('update:current', -1)
}, 2000)

function setData(data, min, max) {
  getSeries(data).forEach((series, i) => chart.series[i].setData(series.data))
  if (min || max) chart.xAxis[0].setExtremes(min, max)
}

watch(() => [props.data, props.extremes], ([data, { min, max }]) => {
  if (data.length > 1024) setTimeout(() => setData(data, min, max), 10)
  else setData(data, min, max)
})

onUnmounted(() => chart.destroy())
</script>