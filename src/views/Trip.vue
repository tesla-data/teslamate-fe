<template>
  <top-nav :title="`${route.query.display}行程`" :share="timeRange < 86400 * 1000 * 7 ? share : null" />
  <div class="page">
    <trip-detail :group="true" :drives="tripStats.drives" :charges="tripStats.charges" :positions="positions" :track="track" :chargeMarkers="charges" />
  </div>
</template>

<script>
export default {
  name: 'Trip'
}
</script>

<script setup>
import { ref, onActivated } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { Dialog } from '@nutui/nutui'

import { statsDetail } from '../api/stats'
import { getPositions } from '../api/position'
import { trip as shareTrip } from '../api/share'

import TopNav from '../components/TopNav.vue'
import TripDetail from '../components/TripDetail.vue'

const route = useRoute()

let lastLeave = 0, isKeepalive
const tripStats = ref({})
const positions = ref([])
const track = ref([])
const charges = ref([])
const timeRange = ref(0)

onActivated(() => {
  const now = Date.now()
  const { from, to } = route.query
  timeRange.value = to - from

  if (from && to && !isKeepalive) {
    statsDetail(from, to).then(res => {
      if (now > lastLeave) {
        tripStats.value = res
        charges.value = res.charges.map(({ latitude, longitude, mode }) => [latitude, longitude, mode])
      }
    })

    getPositions(from, to).then(res => {
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
  Dialog({ content: `分享成功，<a target="_blank" href="/trip.html#/?id=${id}&hash=${hash}&display=${route.query.display}">点此查看</a>`, noCancelBtn: true })
}
</script>