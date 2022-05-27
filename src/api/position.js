import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export async function getPositions(from, to) {
  const positions = await requestApi('/positions', { car_id: currentVehicle.value.id, from, to })
  const p0 = positions.find(p => p.range && p.odometer)
  positions.forEach((p, i) => { if (p.odometer - p0.odometer > 5 && p.range) p.consumption = (p0.range - p.range) / (p.odometer - p0.odometer) * 144 })
  return positions
}