<template>
<navbar @on-click-back="$router.go(-1)" title="软件版本" class="navbar" />
<div class="page">
  <div style="position: absolute; top: 76px; right: 15px;"><a style="font-size: 13px; color: #666;" href="#/teslafi">Teslafi版本统计</a></div>
  <cell-group title="统计结果">
    <cell
      v-for="(u, i) of updates" :title="u.version"
      :desc="`平均续航${(u.avg_range || 0).toFixed(0)}km`"
      :sub-title="`${new Date(u.time).toLocaleDateString()} 使用${days(i > 0 ? updates[i - 1].since_last_update * 1000 : Date.now() - u.time )} 充电${u.chg_ct}次`"
    />
  </cell-group>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'
import { days } from '../filters'

import api from '../api/vehicle'

const updates = ref()
api.getUpdates().then(res => updates.value = res)
</script>