<template>
<top-nav title="行程" />
<div class="page">
  <drive-cell-group v-for="dg of drivesGroups" :title="dg.date" :drives="dg.drives"/>
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import TopNav from '../components/TopNav.vue'

import { currentVehicle } from '../settings'
import DriveCellGroup from '../components/DriveCellGroup.vue'
import { getDrives, groupDrives } from '../api/drive'

let drives = []
const drivesGroups = ref([])

onActivated(() => {
  if (drives[0] && drives[0].car_id !== currentVehicle.value.id) drives = []

  const from = drives[0] && (drives[0].start_date_ts + 1000) || new Date().setHours(0, 0, 0, 0) - 30 * 86400 * 1000
  const to = Date.now()
  getDrives(from, to).then(res => {
    if (res.length === 0) return

    drives = [...res, ...drives]
    drivesGroups.value = groupDrives(drives).groups
  })
})

</script>