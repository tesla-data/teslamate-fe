import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function getDrives(from, to, carId = currentVehicle.value.id) {
  return requestApi('/drives', { car_id: carId, from, to })
}

export function getDriveDetail(drive_id) {
  return requestApi('/drive_detail', { drive_id })
}
