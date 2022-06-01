import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function stats(period, from, to) {
  return requestApi('/stats', { car_id: currentVehicle.value.id, period, from, to })
}

export function statsDetail(from, to) {
  return requestApi('/stats_detail', { car_id: currentVehicle.value.id, from, to })
}