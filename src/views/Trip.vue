<template>
  <top-nav :title="`${route.query.display}行程`" :share="share" />
  <div class="page">
    <trip-detail :drives="tripStats.drives" :charges="tripStats.charges" :positions="positions" :track="track" :chargeMarkers="charges" />
  </div>
</template>

<script>
export default {
  name: 'Trip'
}
</script>

<script setup>
import { ref, onActivated } from 'vue'
import { useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

import { statsDetail } from '../api/stats'
import { getPositionsBig } from '../api/position'
import { trip as shareTrip } from '../api/share'

import TopNav from '../components/TopNav.vue'
import TripDetail from '../components/TripDetail.vue'

const route = useRoute()

let lastLeave = 0, isKeepalive
const tripStats = ref({})
const positions = ref([])
const track = ref([])
const charges = ref([])

onActivated(() => {
  const now = Date.now()
  const { from, to } = route.query
  if (from && to && !isKeepalive) {
    statsDetail(from, to).then(res => {
      if (now > lastLeave) {
        tripStats.value = res
        charges.value = res.charges.map(({ latitude, longitude, mode }) => [latitude, longitude, mode])
      }
    })

    getPositionsBig(from, to).then(res => {
      if (now > lastLeave) {
        positions.value = res
        track.value = res.map(({ latitude, longitude }) => [latitude, longitude])
      }
    })
  } else {
    charges.value = [...charges.value]
  }
})

const noKeepAlivePages = ['Stats', 'Drives']
onBeforeRouteLeave(function (to) {
  lastLeave = Date.now()
  if (noKeepAlivePages.indexOf(to.name) >= 0) {
    positions.value = []
    tripStats.value = {}
    track.value = []
    charges.value = []
    isKeepalive = false
  } else {
    isKeepalive = true
  }
})

async function share() {
  const { hash, id } = await shareTrip(route.query.from, route.query.to)
  console.log(hash, id)
}
</script>