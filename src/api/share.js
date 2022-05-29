import { requestApi, requestPublicApi } from './teslamate'
import { currentVehicle } from '../settings'

export async function get(path, hash, id) {
  const result = await requestPublicApi('/share/get', { path, hash, id })

  const { positions } = result
  if (positions) {
    const p0 = positions.find(p => p.range && p.odometer)
    positions.forEach((p, i) => {
      if (p.odometer - p0.odometer > 1 && p.range) {
        p.avgSpeed = (p.odometer - p0.odometer) / (p.time - p0.time) * 3600 * 1000
        if (currentVehicle.value.efficiency) p.consumption = (p0.range - p.range) / (p.odometer - p0.odometer) * currentVehicle.value.efficiency * 1000
      }
    })
  }

  const { charge, detail } = result
  if (charge && detail) {
    const r0 = detail[0]['Range [km]']
    const t0 = detail[0].time
    let maxPow = detail[0]['Power [kW]']
    detail.forEach((c, i) => {
      maxPow = Math.max(maxPow, c['Power [kW]'])
      c.rangeAdded = c['Range [km]'] - r0
      if (currentVehicle.value.efficiency) {
        c.kwhAdded = c.rangeAdded * currentVehicle.value.efficiency
        if (c.time > t0) c.avgPower = Math.min(maxPow, c.kwhAdded / (c.time - t0) * 3600 * 1000)
      }
    })
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