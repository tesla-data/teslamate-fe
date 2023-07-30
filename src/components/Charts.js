import Highcharts from 'highcharts'
Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

export const getChartOptions = ({ tooltip, title, xAxis, yAxis = [{ title: { text: null }, alignTicks: false }], series }) => ({
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

  tooltip,
  yAxis,

  legend: {
    enabled: false
  },

  series
})

export function getChart(div, { tooltip, title, xAxis, yAxis = [{ title: { text: null }, alignTicks: false }], series = [] }) {
  return Highcharts.chart(div, getChartOptions({ tooltip, title, xAxis, yAxis, series }))
}