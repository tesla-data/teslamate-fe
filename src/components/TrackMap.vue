<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'
import { Map, LatLngBounds, TileLayer, Polyline, Marker } from 'leaflet'

const container = ref()
const props = defineProps({ height: { type: Number, default: 300 }, points: { type: Array, default: () => [] } })

watch(() => container.value, lmap => {
  container.value.map = new Map(lmap).addLayer(new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'))
  drawPolyline()
})

watch(() => props.points, points => {
  if (!points || points.length === 0) {
    container.value.polyline.remove()
  } else {
    drawPolyline()
  }
})

function drawPolyline() {
  const bounds = new LatLngBounds(props.points)
  if (bounds.isValid) {
    if (props.points.length > 2) {
      container.value.polyline = new Polyline(props.points)
      container.value.map.fitBounds(bounds).addLayer(container.value.polyline)
    } else {
      const point = props.points[0]
      container.value.polyline = new Marker(point)
      container.value.map.setView(point, 15).addLayer(container.value.polyline)
    }
  }
}
</script>