<template>
</template>

<script setup>
// import highcharts from 'highcharts'
import api from '../api/vehicles'

api.getStateHistory().then(console.log)
</script>