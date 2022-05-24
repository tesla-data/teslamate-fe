import { requestApi } from './teslamate'

export function getChargeDetail(charge_id, from, to) {
  return requestApi('/charge_detail', { charge_id, from, to })
}