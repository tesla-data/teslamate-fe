<template>
<top-nav :title="`${route.query.display || ''}行程详情`" :disable-back="true" />
<div class="page">
  <trip-detail :drives="drives" :charges="charges" :positions="positions" :track="track" :chargeMarkers="chargeMarkers" />
</div>
</template>

<script>
export default {
  name: 'Trip'
}
</script>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import TopNav from '../components/TopNav.vue'
import TripDetail from '../components/TripDetail.vue'

import { get } from '../api/share'

const route = useRoute()
const drives = ref()
const charges = ref()
const positions = ref()
const track = ref()
const chargeMarkers = ref()
get('/share/trip', route.query.hash, route.query.id).then(({ drives: d, charges: c, positions: p }) => {
  drives.value = d
  charges.value = c
  positions.value = p
  track.value = p.map(({ latitude, longitude }) => [latitude, longitude])
  chargeMarkers.value = c.map(({ latitude, longitude, mode }) => [latitude, longitude, mode])
})
</script>