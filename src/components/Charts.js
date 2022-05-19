import Highcharts from 'highcharts'
Highcharts.setOptions({ time: { timezoneOffset: new Date().getTimezoneOffset() }, credits: { enabled: false } })

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
    animation: false,
    formatter(tooltip) {
      const { x, points: [{ point: { index } }] } = this
      this.points = []
      for (const se of tooltip.chart.series) {
        let i = 0
        for (; i < 1000; i++) {
          const value = se.data[index + i].y || se.data[index - i].y
          if (value !== null && value !== undefined) break
          if (se.data[index + i].x - x > 60 * 1000 && x - se.data[index - i].x > 60 * 1000) break
        }

        if (se.data[index + i].y === null || se.data[index + i].y === undefined) i = -i
        if (se.data[index + i].y !== null && se.data[index + i].y !== undefined) {
          const point = se.points[index + i - se.points[0].index]
          const { color, colorIndex } = point
          this.points.push({
            key: x, point, series: se, color, colorIndex, x, y: se.data[index + i].y            
          })
        }
      }

      return tooltip.defaultFormatter.call(this, tooltip);
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