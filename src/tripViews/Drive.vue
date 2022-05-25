<template>
<top-nav title="行程详情" :disableBack="!route.query.href" />
<div class="page">
  <drive-detail :drive="drive" :positions="positions" :track="track" />
</div>
</template>

<script>
export default {
  name: 'Drive'
}
</script>

<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'

import TopNav from '../components/TopNav.vue'
import DriveDetail from '../components/DriveDetail.vue'
import { get } from '../api/share'

const route = useRoute()
const drive = ref()
const positions = ref()
const track = ref()
get('/share/drive', route.query.hash, route.query.id).then(res => {
  drive.value = res.drive
  positions.value = res.positions
  track.value = positions.value.map(({ latitude, longitude }) => [latitude, longitude])
})
</script>