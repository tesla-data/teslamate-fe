<template>
<top-nav title="行程详情" :share="share" />
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

import { getPositions } from '../api/position'
import { getDriveDetail } from '../api/drive'
import { drive as shareDrive } from '../api/share'

import TopNav from '../components/TopNav.vue'
import DriveDetail from '../components/DriveDetail.vue'

const route = useRoute()
const drive = ref()
const positions = ref()
const track = ref()
getDriveDetail(route.query.drive_id).then(async res => {
  const { start_date_ts, end_date_ts } = drive.value = res[0]
  positions.value = await getPositions(start_date_ts, end_date_ts)
  track.value = positions.value.map(({ latitude, longitude }) => [latitude, longitude])
})

async function share() {
  const { hash, id } = await shareDrive(route.query.drive_id)
  console.log(hash, id)
}
</script>