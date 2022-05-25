<template>
<nut-navbar @on-click-back="$router.go(-1)" fixed :title="title" class="navbar" :left-show="!disableBack">
  <template #right v-if="share">
    <nut-icon v-if="!loading" class="right" name="share" @click="onShare"></nut-icon>
    <nut-icon v-if="loading" class="right" name="loading"></nut-icon>
  </template>
</nut-navbar>
</template>

<script setup>
import { ref } from 'vue'
import { Navbar as NutNavbar } from '@nutui/nutui'

const props = defineProps({
  disableBack: { type: Boolean, default: false },
  title: { type: String, default: '' },
  share: { type: Function, default: null }
})

const loading = ref(false)
async function onShare() {
  if (loading.value) return

  try {
    loading.value = true
    await props.share()
  } finally {
    loading.value = false
  }
}
</script>