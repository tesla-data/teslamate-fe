import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function getCharges(from, to) {
  return requestApi('/charges', { car_id: currentVehicle.value.id, from, to })
}

export async function getChargeDetail(charge_id, from, to) {
  const detail = await requestApi('/charge_detail', { charge_id, from, to })
  const r0 = detail[0][0]['Range [km]']
  const t0 = detail[0][0].time
  let maxPow = detail[0][0]['Power [kW]']
  detail[0].forEach((c, i) => {
    maxPow = Math.max(maxPow, c['Power [kW]'])
    c.rangeAdded = c['Range [km]'] - r0
    if (currentVehicle.value.efficiency) {
      c.kwhAdded = c.rangeAdded * currentVehicle.value.efficiency
      if (c.time > t0) c.avgPower = Math.min(maxPow, c.kwhAdded / (c.time - t0) * 3600 * 1000)
    }
  })

  return detail
}