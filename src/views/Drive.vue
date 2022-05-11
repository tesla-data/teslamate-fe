<template>
<navbar @on-click-back="$router.go(-1)" title="行程详情" class="navbar" />
<div class="page">
<br/>
{{params}}
</div>
</template>

<script>
export default {
  name: 'Drive'
}
</script>

<script setup>
import { useRoute } from 'vue-router'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

const route = useRoute()
const params = route.params
</script>