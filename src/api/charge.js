import _ from 'lodash'
import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export async function getCharges(from, to) {
  const charges = await requestApi('/charges', { car_id: currentVehicle.value.id, from, to })
  return charges.reduce((arr, v) => {
    const last = _.last(arr)
    if (last &&
        last.address === v.address && last.car_id === v.car_id && last.mode === v.mode &&
        last.latitude === v.latitude && last.longitude === v.longitude &&
        v.end_date_ts + 10 * 60 * 1000 < last.start_date_ts
    ) {
      last.duration_min += v.duration_min
      last.charge_energy_added += v.charge_energy_added
      last.start_date = v.start_date
      last.start_date_ts = v.start_date_ts
    } else {
      arr.push(v)
    }
    return arr
  }, [])
}

export async function getChargeDetail(charge_id, car_id, from, to) {
  const detail = await requestApi('/charge_detail', { charge_id, car_id, from, to })
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