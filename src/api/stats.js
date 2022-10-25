import { requestApi } from './teslamate'
import { mergeCharges } from './charge'
import { currentVehicle } from '../settings'

export function stats(period, from, to) {
  return requestApi('/stats', { car_id: currentVehicle.value.id, period, from, to })
}

export async function statsDetail(from, to) {
  const { charges, drives } = await requestApi('/stats_detail', { car_id: currentVehicle.value.id, from, to })
  return { charges: mergeCharges(charges), drives }
}