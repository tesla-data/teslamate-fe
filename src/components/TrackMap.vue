<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, defineProps, watch, onBeforeUnmount } from 'vue'
import { Map, LatLngBounds, TileLayer, Polyline, Marker, Icon, icon } from 'leaflet'

const container = ref()
const props = defineProps({ height: { type: Number, default: 300 }, track: { type: Array, default: () => [] }, charges: { type: Array, default: () => [] } })

const icons = {
  dc: new Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSI+PGNpcmNsZSBjeD0iMTAuNSIgY3k9IjEwLjUiIHI9IjEwLjUiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxMC41IiBjeT0iMTAuNSIgcj0iOSIgZmlsbD0iI0I3NDEzNCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNzM2IDkuNDA1YzAgLjEwNC4wODQuMTg4LjE4OC4xODhoMi43NjNjLjE0NSAwIC4yMzUuMTU3LjE2Mi4yODJsLTMuMjMgNS41MzFjLS4wOTcuMTY2LS4zNTEuMDk4LS4zNTEtLjA5NHYtMy43MTRhLjE4OC4xODggMCAwMC0uMTg5LS4xODhINy4zMTRhLjE4OC4xODggMCAwMS0uMTYzLS4yODJsMy4yMzQtNS41MzRjLjA5Ny0uMTY2LjM1LS4wOTguMzUuMDk0djMuNzE3eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==' }),
  ac: new Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSI+PGNpcmNsZSBjeD0iMTAuNSIgY3k9IjEwLjUiIHI9IjEwLjUiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxMC41IiBjeT0iMTAuNSIgcj0iOSIgZmlsbD0iIzVDNUU2MiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNzM2IDkuNDA1YzAgLjEwNC4wODQuMTg4LjE4OC4xODhoMi43NjNjLjE0NSAwIC4yMzUuMTU3LjE2Mi4yODJsLTMuMjMgNS41MzFjLS4wOTcuMTY2LS4zNTEuMDk4LS4zNTEtLjA5NHYtMy43MTRhLjE4OC4xODggMCAwMC0uMTg5LS4xODhINy4zMTRhLjE4OC4xODggMCAwMS0uMTYzLS4yODJsMy4yMzQtNS41MzRjLjA5Ny0uMTY2LjM1LS4wOTguMzUuMDk0djMuNzE3eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==' })
}

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
    container.value.map.addLayer(new Marker(c, { icon: icons[c[2]] }))
  }
}

onBeforeUnmount(() => container.value.map.remove())
</script>