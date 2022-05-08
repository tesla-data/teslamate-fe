import { ref, watch } from 'vue'

export const hideFullVin = ref(localStorage.getItem('hideFullVin') === 'true')
watch(hideFullVin, (value) => { localStorage.setItem('hideFullVin', value) })