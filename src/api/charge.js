import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function getCharges(from, to) {
  return requestApi('/charges', { car_id: currentVehicle.value.id, from, to })
}

export async function getChargeDetail(charge_id, from, to) {
  const detail = await requestApi('/charge_detail', { charge_id, from, to })
  const r0 = detail[0][0]['Range [km]']
  const t0 = detail[0][0].time
  detail[0].forEach((c, i) => {
    c.rangeAdded = c['Range [km]'] - r0
    if (currentVehicle.value.efficiency) {
      c.kwAdded = c.rangeAdded * currentVehicle.value.efficiency
      c.avgPower = c.kwAdded / (c.time - t0) * 1000
    }
  })

  return detail
}