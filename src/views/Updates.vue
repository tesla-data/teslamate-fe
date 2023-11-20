<template>
<top-nav title="软件版本" />
<div class="page">
  <cell-group title="统计结果">
    <cell v-if="!updates || updates.length === 0"  title="尚无软件升级数据" />
    <cell
      v-for="(u, i) of updates" v-if="u.version" :title="u.version"
      :desc="`平均续航${(u.avg_ideal_range_km || 0).toFixed(0)}km`"
      :sub-title="`${new Date(u.time).toLocaleDateString()} 使用${days(i > 0 ? updates[i - 1].since_last_update * 1000 : Date.now() - u.time )} 充电${u.chg_ct}次`"
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { CellGroup, Cell } from '@nutui/nutui'

import TopNav from '../components/TopNav.vue'

import { days } from '../filters'
import api from '../api/vehicle'

const updates = ref()
onActivated(() => {
  api.getUpdates().then(res => updates.value = res)
})
</script>