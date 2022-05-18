<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, defineProps, watch, onBeforeUnmount } from 'vue'
import { Map, LatLngBounds, TileLayer, Polyline, Marker } from 'leaflet'

const container = ref()
const props = defineProps({ height: { type: Number, default: 300 }, track: { type: Array, default: () => [] }, charges: { type: Array, default: () => [] } })

watch(() => container.value, lmap => {
  container.value.map = new Map(lmap, { center: [0, 0], zoom: 0, layers: new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png') })
  drawPolyline()
  drawCharges()
  setCenterAndZoom()
})

watch(() => [props.track, props.charges], ([track, charges]) => {
  drawPolyline()
  drawCharges()
  setCenterAndZoom()
})

function setCenterAndZoom() {
  const { track, charges } = props
  const boundsPoints = [track, charges].find(arr => arr.length >= 2)
  const center = [track, charges].find(arr => arr.length === 1)
  if (boundsPoints) {
    const bounds = new LatLngBounds(boundsPoints)
    container.value.map.fitBounds(bounds)
  } else if (center) {
    container.value.map.setView(center[0], 15)
  }
}

function drawPolyline() {
  container.value.map.eachLayer(l => { if (l instanceof Polyline) l.remove() })
  if (props.track.length > 0) container.value.map.addLayer(new Polyline(props.track))
}

function drawCharges() {
  container.value.map.eachLayer(l => { if (l instanceof Marker) l.remove() })
  for (const c of props.charges) {
    container.value.map.addLayer(new Marker(c))
  }
}

onBeforeUnmount(() => container.value.map.remove())
</script>