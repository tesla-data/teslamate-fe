import Highcharts from 'highcharts'
Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

function formatVal(val, { valueDecimals = 2, valueSuffix = '', valuePrefix = '' } = {}) {
  return valuePrefix + val.toFixed(valueDecimals) + valueSuffix
}

export const getChartOptions = ({ title, xAxis, yAxis = [{ title: { text: null }, alignTicks: false }], series }) => ({
  title: {
    text: title,
    align: 'center',
    verticalAlign: 'top',
    floating: true,
    style: { 'font-size': '13px' }
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
    },
    ...xAxis
  },

  tooltip: {
    shared: true,
    crosshairs: true,
    formatter(s) {
      const { x, points: [{ point: { index } }] } = this
      let tooltip = (s.chart.xAxis[0].options.type === 'datetime' ? new Date(x).toLocaleString() : x) + '<br/>'
      for (const se of s.chart.series) {
        let value
        for (let i = 0; i < 1000; i++) {
          value = se.data[index + i].y || se.data[index - i].y
          if (value !== null && value !== undefined) break
          if (se.data[index + i].x - x > 60 * 1000 && x - se.data[index - i].x > 60 * 1000) break
        }

        tooltip += `<span style="color: ${se.color}">${se.name}</span>: ${value && formatVal(value, se.options.tooltip)}<br/>`
      }
      return tooltip
    }
  },

  yAxis,

  legend: {
    enabled: false
  },

  series
})

export function getChart(div, { title, xAxis, yAxis = [{ title: { text: null }, alignTicks: false }], series = [] }) {
  return Highcharts.chart(div, getChartOptions({ title, xAxis, yAxis, series }))
}