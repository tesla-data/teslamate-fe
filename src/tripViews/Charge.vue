<template>
<top-nav title="充电详情" :disableBack="!route.query.href" />
<div class="page">
  <charge-detail :position="position" :detail="chargeDetail" />
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

import TopNav from '../components/TopNav.vue'
import ChargeDetail from '../components/ChargeDetail.vue'
import { get } from '../api/share'

const route = useRoute()
const position = ref()
const chargeDetail = ref()
get('/share/charge', route.query.hash, route.query.id).then(({ charge: { latitude: lat, longitude: lng, mode }, detail }) => {
  position.value = [[lat, lng, mode]]
  chargeDetail.value = detail
})
</script>