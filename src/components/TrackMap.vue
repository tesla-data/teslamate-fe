<template>
  <div ref="container" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { Map, LatLngBounds, TileLayer, Polyline, Marker, Icon, CircleMarker } from 'leaflet'

const container = ref()
const props = defineProps({ highlight: { type: Number, default: -1 }, height: { type: Number, default: 400 }, track: { type: Array, default: () => [] }, charges: { type: Array, default: () => [] } })

const icons = {
  ac: new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNyA1MCI+PHBhdGggZD0iTTM1LjM2NCAxNS41ODVBMTcuMDkgMTcuMDkgMCAwMDE4LjUwOSAxLjVhMTcuMDkgMTcuMDkgMCAwMC0xNi44NiAxNC4wODVjLS40NSAzLjI2LjExNSA2LjU4IDEuNjIgOS41MDVhNzQuNjM2IDc0LjYzNiAwIDAwNy45MyAxMi43N2MxLjkwNSAyLjU5NSAzLjk1IDUuMDcgNi4wMTUgNy41MTUuMzA1LjM4NS43NjUuNjE1IDEuMjU1LjYyNS40OS0uMDEuOTUtLjI0IDEuMjUtLjYyNSAyLjA3LTIuNTA1IDQuMTE1LTQuOTM1IDYuMDItNy41MTVhNzQuNjM5IDc0LjYzOSAwIDAwNy45My0xMi43NyAxNS45NjUgMTUuOTY1IDAgMDAxLjY5NS05LjV2LS4wMDV6IiBmaWxsPSIjNUM1RTYyIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOC4xNTkgNDdoLjFhMi45NyAyLjk3IDAgMDAyLjI4NS0xLjEgMTUyLjI4MiAxNTIuMjgyIDAgMDA2LjA0LTcuNTUgNzYuMDIgNzYuMDIgMCAwMDguMDMtMTIuOTg1IDE3LjAyNiAxNy4wMjYgMCAwMDEuNzEtMTAuMjI1QTE4LjM4IDE4LjM4IDAgMDAxOC4yNTkgMCAxOC4zOCAxOC4zOCAwIDAwLjE3NCAxNS4xNGExNy4wNjUgMTcuMDY1IDAgMDAxLjcxIDEwLjIyNSA3Ni4yNjYgNzYuMjY2IDAgMDA4LjAzIDEyLjk4NSAxNTguODEgMTU4LjgxIDAgMDA2LjA0IDcuNTY1QTIuOTcgMi45NyAwIDAwMTguMTU5IDQ3em0uNDE1LTIuNzdhLjQwOC40MDggMCAwMS0uMzE1LjE2bC0uMDItLjAxYS40MTguNDE4IDAgMDEtLjI2NS0uMTY1Yy0xLjk0NS0yLjMyNS00LjAxNS00LjgzLTUuOTM1LTcuNDI1YTczLjk3MiA3My45NzIgMCAwMS03Ljc2LTEyLjQ4NSAxNC42NjIgMTQuNjYyIDAgMDEtMS41MS04Ljc0IDE1Ljc2IDE1Ljc2IDAgMDEzMS4wMS4wMTVjLjQxIDMtLjExNyA2LjA1Mi0xLjUxIDguNzRhNzMuOTcgNzMuOTcgMCAwMS03Ljc2IDEyLjQ4Yy0xLjkyIDIuNi0zLjk4NSA1LjEwNS01LjkzNSA3LjQzeiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTguMjIxIDE2LjgxYzAgLjIwNy4xNjkuMzc1LjM3Ny4zNzVoNS41MjVjLjI5IDAgLjQ3MS4zMTQuMzI1LjU2NWwtNi40NiAxMS4wNjNjLS4xOTQuMzMxLS43MDMuMTk0LS43MDMtLjE5di03LjQyN2EuMzc2LjM3NiAwIDAwLS4zNzYtLjM3NmgtNS41MzJhLjM3Ni4zNzYgMCAwMS0uMzI1LS41NjRsNi40NjctMTEuMDY5Yy4xOTQtLjMzMS43MDItLjE5NC43MDIuMTl2Ny40MzN6IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
    iconSize: [20, 25], iconAnchor: [10, 24]
  }),
  dc: new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNyA1MCI+PHBhdGggZD0iTTM1LjM2NCAxNS41ODVBMTcuMDkgMTcuMDkgMCAwMDE4LjUwOSAxLjVhMTcuMDkgMTcuMDkgMCAwMC0xNi44NiAxNC4wODVjLS40NSAzLjI2LjExNSA2LjU4IDEuNjIgOS41MDVhNzQuNjM2IDc0LjYzNiAwIDAwNy45MyAxMi43N2MxLjkwNSAyLjU5NSAzLjk1IDUuMDcgNi4wMTUgNy41MTUuMzA1LjM4NS43NjUuNjE1IDEuMjU1LjYyNS40OS0uMDEuOTUtLjI0IDEuMjUtLjYyNSAyLjA3LTIuNTA1IDQuMTE1LTQuOTM1IDYuMDItNy41MTVhNzQuNjM5IDc0LjYzOSAwIDAwNy45My0xMi43NyAxNS45NjUgMTUuOTY1IDAgMDAxLjY5NS05LjV2LS4wMDV6IiBmaWxsPSIjQjc0MTM0Ii8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOC4xNTkgNDdoLjFhMi45NyAyLjk3IDAgMDAyLjI4NS0xLjEgMTUyLjI4MiAxNTIuMjgyIDAgMDA2LjA0LTcuNTUgNzYuMDIgNzYuMDIgMCAwMDguMDMtMTIuOTg1IDE3LjAyNiAxNy4wMjYgMCAwMDEuNzEtMTAuMjI1QTE4LjM4IDE4LjM4IDAgMDAxOC4yNTkgMCAxOC4zOCAxOC4zOCAwIDAwLjE3NCAxNS4xNGExNy4wNjUgMTcuMDY1IDAgMDAxLjcxIDEwLjIyNSA3Ni4yNjYgNzYuMjY2IDAgMDA4LjAzIDEyLjk4NSAxNTguODEgMTU4LjgxIDAgMDA2LjA0IDcuNTY1QTIuOTcgMi45NyAwIDAwMTguMTU5IDQ3em0uNDE1LTIuNzdhLjQwOC40MDggMCAwMS0uMzE1LjE2bC0uMDItLjAxYS40MTguNDE4IDAgMDEtLjI2NS0uMTY1Yy0xLjk0NS0yLjMyNS00LjAxNS00LjgzLTUuOTM1LTcuNDI1YTczLjk3MiA3My45NzIgMCAwMS03Ljc2LTEyLjQ4NSAxNC42NjIgMTQuNjYyIDAgMDEtMS41MS04Ljc0IDE1Ljc2IDE1Ljc2IDAgMDEzMS4wMS4wMTVjLjQxIDMtLjExNyA2LjA1Mi0xLjUxIDguNzRhNzMuOTcgNzMuOTcgMCAwMS03Ljc2IDEyLjQ4Yy0xLjkyIDIuNi0zLjk4NSA1LjEwNS01LjkzNSA3LjQzeiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTguMjIxIDE2LjgxYzAgLjIwNy4xNjkuMzc1LjM3Ny4zNzVoNS41MjVjLjI5IDAgLjQ3MS4zMTQuMzI1LjU2NWwtNi40NiAxMS4wNjNjLS4xOTQuMzMxLS43MDMuMTk0LS43MDMtLjE5di03LjQyN2EuMzc2LjM3NiAwIDAwLS4zNzYtLjM3NmgtNS41MzJhLjM3Ni4zNzYgMCAwMS0uMzI1LS41NjRsNi40NjctMTEuMDY5Yy4xOTQtLjMzMS43MDItLjE5NC43MDIuMTl2Ny40MzN6IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
    iconSize: [20, 25], iconAnchor: [10, 24]
  })
}

watch(() => container.value, lmap => {
  //container.value.map = new Map(lmap, { center: [0, 0], zoom: 0, layers: new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png') })
  container.value.map = new Map(lmap, { center: [0, 0], zoom: 0, layers: new TileLayer('https://maps.omniscale.net/v2/teslamateapp-5a5627a2/style.default/{z}/{x}/{y}.png?hq={hq}') })
  drawPolyline()
  drawCharges()
  setCenterAndZoom()
})

watch(() => [props.track, props.charges], ([track, charges]) => {
  delete container.value.map._size
  drawPolyline()
  drawCharges()
  setCenterAndZoom()
})

watch(() => props.highlight, (highlight) => {
  if (container.value.highlightLayer) {
    container.value.highlightLayer.remove()
    delete container.value.highlightLayer
  }
  const point = props.track[props.highlight]
  if (point) container.value.highlightLayer = new CircleMarker(point, { color: 'red', radius: 3, fill: true, fillOpacity: 1 }).addTo(container.value.map)
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
