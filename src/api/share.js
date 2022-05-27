import { requestApi, requestPublicApi } from './teslamate'
import { currentVehicle } from '../settings'

export async function get(path, hash, id) {
  const result = await requestPublicApi('/share/get', { path, hash, id })

  const { positions } = result
  if (positions) {
    const p0 = positions.find(p => p.range && p.odometer)
    positions.forEach((p, i) => { if (p.odometer - p0.odometer > 1 && p.range) p.consumption = (p0.range - p.range) / (p.odometer - p0.odometer) * 144 })
  }

  return result
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