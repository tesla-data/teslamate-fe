<template>
<navbar @on-click-back="$router.go(-1)" :title="`${route.query.display}行程`" class="navbar" />
<div class="page">
  <charge-cell-group :charges="tripStats.charges" />
  <drive-cell-group :drives="tripStats.drives" />
  <!-- <div v-if="tripStats.charges && tripStats.drives">
    {{tripStats.drives[0]}}<br/>
    {{tripStats.charges[0]}}
  </div> -->
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
import { Navbar } from '@nutui/nutui'

import { stats } from '../api/stats'
import DriveCellGroup from '../components/DriveCellGroup.vue'
import ChargeCellGroup from '../components/ChargeCellGroup.vue'

const tripStats = ref({})
const route = useRoute()
// const params = route.params

const { from, to } = route.query
if (from && to ) stats(from, to).then(res => tripStats.value = res)
</script>