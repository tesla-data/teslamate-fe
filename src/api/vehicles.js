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
    return await teslamate.getVehicleState(currentVehicle.value.id)
  }
}