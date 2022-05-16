import Highcharts from 'highcharts'
Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

export function drawChart(positions, div, title, fields) {
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