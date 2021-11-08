<template>
<navbar @on-click-back="$router.go(-1)" title="软件升级" class="navbar" />
<div class="page">
  <cell-group title="统计结果">
    <cell
      v-for="u of updates" :title="u.version"
      :desc="`平均续航${(u.avg_range || 0).toFixed(0)}km`"
      :sub-title="`${new Date(u.time).toLocaleDateString()} 充电${u.chg_ct}次`"
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

import api from '../api/vehicle'

const updates = ref()
api.getUpdates().then(res => updates.value = res)
</script>