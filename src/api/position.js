import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export async function getPositions(from, to) {
  const positions = await requestApi('/positions', { car_id: currentVehicle.value.id, from, to })
  const p0 = positions.find(p => p.range && p.odometer)
  positions.forEach((p, i) => {
    if (p.odometer - p0.odometer > 1 && p.range) {
      p.avgSpeed = (p.odometer - p0.odometer) / (p.time - p0.time) * 3600 * 1000
      p.consumption = (p0.range - p.range) / (p.odometer - p0.odometer) * 144
    }
  })
  return positions
}