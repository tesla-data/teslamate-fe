import { ref } from 'vue'
import axios from 'axios'

const urlBaseKey = 'teslamate_api_urlbase'
export const urlBase = ref(localStorage.getItem(urlBaseKey) || '')

const apikeyKey = 'teslamate_apikey'
export const apikey = ref(localStorage.getItem(apikeyKey) || '')

async function query(queries) {
  const url = urlBase.value + '/api/tsdb/query'
  const payload = { queries: queries.map(({ refId, rawSql }) => ({ refId, datasourceId: 1, rawSql, format: 'table' })) }
  const { data: { results } } = await axios.post(url, payload, { headers: { Authorization: `Bearer ${apikey.value}` } })
  const ret = queries.map(({ refId }) => results[refId].tables[0].rows.map(r => r.reduce((m, v, i) => { m[results[refId].tables[0].columns[i].text] = v; return m }, {})))
  return ret.length === 1 ? ret[0] : ret
}

export default {
  async getVehicles() {
    return await query([{ refId: 'car_id', rawSql: 'SELECT * FROM cars ORDER BY display_priority ASC, name ASC;' }])
  },

  async getVehicleState(carId) {
    const fields = 'battery_heater, battery_heater_on, battery_heater_no_power, outside_temp, ideal_battery_range_km, battery_level, usable_battery_level, date'
    const states = await query([
      {
        refId: 'vs1',
        rawSql: `
          (SELECT ${fields} FROM positions WHERE car_id = ${carId} ORDER BY date DESC LIMIT 1) UNION
          SELECT ${fields} FROM charges c JOIN charging_processes p ON p.id = c.charging_process_id WHERE $__timeFilter(date) AND p.car_id = ${carId} ORDER BY date DESC LIMIT 1
        `
      }, {
        refId: 'vs2',
        rawSql: `SELECT odometer, inside_temp, driver_temp_setting, fan_status, is_climate_on, date FROM positions WHERE car_id = ${carId} ORDER BY date DESC LIMIT 1`
      }
    ])

    return { ...states[0][0], ...states[1][0], date: states[0][0].date > states[1][0].date ? states[0][0].date : states[1][0].date }
  }
}