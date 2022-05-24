import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function getCharges(from, to) {
  return requestApi('/charges', { car_id: currentVehicle.value.id, from, to })
}

export function getChargeDetail(charge_id, from, to) {
  return requestApi('/charge_detail', { charge_id, from, to })
}