<template>
<navbar @on-click-back="$router.go(-1)" title="行程" class="navbar" />
<div class="page">
  <drive-cell-group v-for="dg of drivesGroups" :title="dg.date" :drives="dg.drives"/>
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { Navbar } from '@nutui/nutui'

import DriveCellGroup from '../components/DriveCellGroup.vue'
import { getDrives } from '../api/drive'

let drives = []
const drivesGroups = ref([])

onActivated(() => {
  const from = drives[0] && (drives[0].start_date_ts + 1000) || new Date().setHours(0, 0, 0, 0) - 30 * 86400 * 1000
  const to = Date.now()
  getDrives(from, to).then(res => {
    if (res.length === 0) return

    drives = [...res, ...drives]
    drivesGroups.value = drives.reduce((arr, drive) => {
      const date = new Date(drive.start_date_ts).toLocaleDateString()
      if (arr.length > 0 && arr[arr.length - 1].date === date) {
        arr[arr.length - 1].drives.push(drive)
      } else {
        arr.push({
          date,
          drives: [drive]
        })
      }

      return arr
    }, [])
  })
})

</script>