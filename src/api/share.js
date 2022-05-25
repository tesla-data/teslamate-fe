import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function drive(drive_id) {
  return requestApi('/share/drive', { drive_id })
}
