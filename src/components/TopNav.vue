<template>
<nut-navbar @on-click-back="$router.go(-1)" fixed :title="title" class="navbar">
  <template #right v-if="share">
    <nut-icon class="right" name="share" @click="$emit('share')"></nut-icon>
  </template>
</nut-navbar>
</template>

<script setup>
import { Navbar as NutNavbar } from '@nutui/nutui'

defineProps({
  title: { type: String, default: '' },
  share: { type: Boolean, default: false }
})

defineEmits(['share'])
</script>