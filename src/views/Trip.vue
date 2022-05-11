<template>
<navbar @on-click-back="$router.go(-1)" :title="`${route.query.display}行程`" class="navbar" />
<div class="page">
<br/>
{{route.query}}
</div>
</template>

<script>
export default {
  name: 'Trip'
}
</script>

<script setup>
import { useRoute } from 'vue-router'
import { Navbar, CellGroup, Cell } from '@nutui/nutui'

const route = useRoute()
const params = route.params
</script>