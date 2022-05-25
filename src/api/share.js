import { requestApi, requestPublicApi } from './teslamate'
import { currentVehicle } from '../settings'

export function get(path, hash, id) {
  return requestPublicApi('/share/get', { path, hash, id })
}

export function drive(drive_id) {
  return requestApi('/share/drive', { drive_id })
}
