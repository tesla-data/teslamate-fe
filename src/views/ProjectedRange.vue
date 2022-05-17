<template>
<navbar @on-click-back="$router.go(-1)" fixed title="满电续航" class="navbar" />
<div class="page" style="margin-top: 40px;">
  <line-chart title="里程 - 续航" :height="350" :data="projectedRange" :is-time-series="false" xField="mileage" :fields="[['projected_range']]" :fields-name="{ projected_range: '满电续航' }" :series-options="[{ tooltip: { valueDecimals: 1, valueSuffix: 'km' } }]" />
  <line-chart title="时间 - 续航" :height="350" :data="projectedRange" :fields="[['projected_range'], ['mileage']]" :fields-name="{ projected_range: '满电续航', mileage: '里程表' }" :series-options="[{ tooltip: { valueDecimals: 1, valueSuffix: 'km' } }, { tooltip: { valueDecimals: 0, valueSuffix: 'km' } }]" />
</div>
</template>

<script setup>
import { ref, onActivated } from 'vue'
import { Navbar } from '@nutui/nutui'

import api from '../api/vehicle'
import LineChart from '../components/LineChart.vue'

const projectedRange = ref()
onActivated(() => api.getProjectedRange().then((res) => projectedRange.value = res))
</script>