<template>
<top-nav title="充电详情" :share="share" />
<div class="page">
  <charge-detail :detail="chargeDetail" :position="position" />
  <drive-cell-group title="本次充电后" :drives="drives"/>
</div>
</template>

<script>
export default {
  name: 'Charge'
}
</script>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Dialog } from '@nutui/nutui'

import { getChargeDetail } from '../api/charge'
import { getDrives } from '../api/drive'
import { charge as shareCharge } from '../api/share'

import TopNav from '../components/TopNav.vue'
import ChargeDetail from '../components/ChargeDetail.vue'
import DriveCellGroup from '../components/DriveCellGroup.vue'

const route = useRoute()
const chargeDetail = ref()
const position = ref(route.query.lat && route.query.lng && [[route.query.lat * 1, route.query.lng * 1, route.query.mode]])
const drives = ref()

getChargeDetail(route.query.id, route.query.car_id, route.query.from, route.query.to).then(async ([cd, info]) => {
  const nextChargeTs = info?.[0]?.start_date || Date.now()
  chargeDetail.value = cd
  drives.value = await getDrives(route.query.to, nextChargeTs)
})

async function share() {
  const { hash, id } = await shareCharge(route.query.id, route.query.from, route.query.to)
  Dialog({ content: `分享成功，<a target="_blank" href="/trip.html#/charge?id=${id}&hash=${hash}">点此查看</a>`, noCancelBtn: true })
}
</script>