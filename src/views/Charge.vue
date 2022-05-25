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
import { useRoute } from 'vue-router'
import { ref } from 'vue'

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

getChargeDetail(route.query.id, route.query.from, route.query.to).then(async ([cd, [{ start_date: nextChargeTs = Date.now() } = {}]]) => {
  chargeDetail.value = cd
  drives.value = await getDrives(route.query.to, nextChargeTs)
})

async function share() {
  const { hash, id } = await shareCharge(route.query.id)
  console.log(hash, id)
}
</script>