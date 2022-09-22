import { ref } from 'vue'
import { listVehicles } from './teslamate'
import { requestApi } from './teslamate'

import { vehicles as vehiclesInSettings, currentVehicle } from '../settings'

export const vehicles = ref([])

export async function getVehicles() {
  const vehicles = await listVehicles()
  if (vehicles && vehicles.length > 0) {
    vehiclesInSettings.value = vehicles
    if (!currentVehicle.value.id || !vehicles.find(v => v.id === currentVehicle.value.id)) currentVehicle.value = vehicles[0]
  }

  return vehicles
}

getVehicles()

export default {
  async getHomeData() {
    return currentVehicle.value.id && await requestApi('/home_data', { car_id: currentVehicle.value.id })
  },

  async getProjectedRange() {
    return requestApi('/projected_range', { car_id: currentVehicle.value.id })
  },

  async getUpdates() {
    return requestApi('/updates', { car_id: currentVehicle.value.id })
  }
}