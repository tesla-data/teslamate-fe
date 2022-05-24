import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function getPositions(from, to) {
  return requestApi('/positions', { car_id: currentVehicle.value.id, from, to })
}

export function getPositionsBig(from, to) {
  return requestApi('/positions', { car_id: currentVehicle.value.id, from, to })
}