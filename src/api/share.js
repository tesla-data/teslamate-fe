import { requestApi, requestPublicApi } from './teslamate'
import { currentVehicle } from '../settings'

export function get(path, hash, id) {
  return requestPublicApi('/share/get', { path, hash, id })
}

export function drive(drive_id) {
  return requestApi('/share/drive', { drive_id })
}

export function charge(charge_id) {
  return requestApi('/share/charge', { car_id: currentVehicle.value.id, charge_id })
}

export function trip(from, to) {
  return requestApi('/share/trip', { car_id: currentVehicle.value.id, from, to })
}