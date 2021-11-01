import { ref } from 'vue'
import teslamate from './teslamate'

export const vehicles = ref([])
export const currentVehicle = ref()
export const currentVehicleState = ref(null)

teslamate.getVehicles().then(vehicles => {
  if (vehicles.length > 0) {
    currentVehicle.value = vehicles[0]
  }
})

export default {
  async getState() {
    return currentVehicle.value && await teslamate.getVehicleState(currentVehicle.value.id)
  },

  async getStats() {
    return currentVehicle.value && await teslamate.getVehicleStats(currentVehicle.value.id)
  }
}