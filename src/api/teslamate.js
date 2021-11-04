import { ref } from 'vue'
import axios from 'axios'

const urlBaseKey = 'teslamate_api_urlbase'
export const urlBase = ref(localStorage.getItem(urlBaseKey) || '')

const apikeyKey = 'teslamate_apikey'
export const apikey = ref(localStorage.getItem(apikeyKey) || '')

export function updateSettings() {
  localStorage.setItem(urlBaseKey, urlBase.value)
  localStorage.setItem(apikeyKey, apikey.value)
}

async function query(queries, from, to) {
  if (!urlBase.value || !apikey.value) return
  if (from) from = from.toString()
  if (to) to = to.toString()

  const url = urlBase.value + '/api/tsdb/query'
  const payload = { from, to, queries: queries.map(({ refId, rawSql }) => ({ refId, datasourceId: 1, rawSql, format: 'table' })) }
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
          (SELECT ${fields} FROM positions WHERE car_id = ${carId} AND usable_battery_level IS NOT NULL ORDER BY date DESC LIMIT 1) UNION
          SELECT ${fields} FROM charges c JOIN charging_processes p ON p.id = c.charging_process_id WHERE p.car_id = ${carId} AND usable_battery_level IS NOT NULL ORDER BY date DESC LIMIT 1
        `
      }, {
        refId: 'vs2',
        rawSql: `SELECT odometer, inside_temp, driver_temp_setting, fan_status, is_climate_on, date FROM positions WHERE car_id = ${carId} ORDER BY date DESC LIMIT 1`
      }, {
        refId: 'charge',
        rawSql: `
          WITH charging_process AS (
            SELECT id, end_date
            FROM charging_processes
            WHERE car_id = ${carId}
            ORDER BY start_date DESC
            LIMIT 1
          )
          SELECT *
          FROM charges, charging_process
          WHERE charging_process.id = charging_process_id
          ORDER BY date DESC
          LIMIT 1;
        `
      }, {
        refId: 'update',
        rawSql: `SELECT * FROM updates WHERE car_id = ${carId} ORDER BY id DESC LIMIT 1;`
      }
    ])

    const charge = states[2][0].end_date ? null : states[2][0]
    const update = states[3][0]
    return { ...states[0][0], ...states[1][0], date: states[0][0].date > states[1][0].date ? states[0][0].date : states[1][0].date, charge, update }
  },

  async getVehicleStateHistory(carId, from = Date.now() - 86400 * 1000, to = Date.now()) {
    return await query([{
      refId: 'state',
      rawSql: `
        WITH states AS (
          SELECT
            unnest(ARRAY [start_date + interval '1 second', end_date]) AS date,
            unnest(ARRAY [2, 0]) AS state
          FROM charging_processes
          WHERE
            car_id = ${carId} AND 
            ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
            (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
          UNION
          SELECT
            unnest(ARRAY [start_date + interval '1 second', end_date]) AS date,
            unnest(ARRAY [1, 0]) AS state
          FROM drives
          WHERE
            car_id = ${carId} AND 
            ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
            (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
          UNION
          SELECT
            start_date AS date,
            CASE
              WHEN state = 'offline' THEN 3
              WHEN state = 'asleep' THEN 4
              WHEN state = 'online' THEN 5
            END AS state
          FROM states
          WHERE
            car_id = ${carId} AND 
            ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
            (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
          UNION
          SELECT
            unnest(ARRAY [start_date + interval '1 second', end_date]) AS date,
            unnest(ARRAY [6, 0]) AS state
          FROM updates
          WHERE
            car_id = ${carId} AND 
            ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
            (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
        )
        SELECT date AS "time", state
        FROM states
        WHERE 
          date IS NOT NULL AND
          ($__timeFrom() :: timestamp - interval '30 day') < date AND 
          date < ($__timeTo() :: timestamp + interval '30 day') 
        ORDER BY date ASC, state ASC;      
      `
    }, {
      refId: 'range_battery',
      rawSql: `
        (
          SELECT $__timeGroup(date, '5s'), avg(battery_level) as "battery level", convert_km(avg(ideal_battery_range_km), 'km') as "range"
          FROM positions
          WHERE date BETWEEN ($__timeFrom()::timestamp - interval '1 day') AND ($__timeTo()::timestamp + interval '1 day') AND car_id = ${carId}
          GROUP BY 1
        ) UNION ALL (
          SELECT $__timeGroup(date, '5s'), avg(battery_level) as "battery level", convert_km(avg(ideal_battery_range_km), 'km') as "range"
          FROM charges c
          LEFT JOIN charging_processes p ON c.charging_process_id = p.id
          WHERE date BETWEEN ($__timeFrom()::timestamp - interval '1 day') AND ($__timeTo()::timestamp + interval '1 day') AND p.car_id = ${carId}
          GROUP BY 1
        )
        ORDER BY 1
      `
    }], from, to)
  },

  async getVehicleStats(carId, period = 'day', timezone = 'Asia/Shanghai', length_unit = 'km', temp_unit = 'C') {
    return await query([{
      refId: 'stats',
      rawSql: `WITH data AS (
        SELECT
          duration_min > 1 AND
          distance > 1 AND
          ( 
            start_position.usable_battery_level IS NULL OR
            (end_position.battery_level - end_position.usable_battery_level) = 0 
          ) AS is_sufficiently_precise,
          NULLIF(GREATEST(start_ideal_range_km - end_ideal_range_km, 0), 0) AS range_diff,
          -- with Postgres 12:
          -- date_trunc('${period}', start_date::TIMESTAMP WITHOUT TIME ZONE, '${timezone}') as local_period,
          date_trunc('${period}', (start_date::TIMESTAMP WITHOUT TIME ZONE) AT TIME ZONE '${timezone}') as local_period,
          drives.*
        FROM drives
          LEFT JOIN positions start_position ON start_position_id = start_position.id
          LEFT JOIN positions end_position ON end_position_id = end_position.id)
        SELECT
          EXTRACT(EPOCH FROM date_trunc('${period}', local_period))*1000 AS date_from,
          EXTRACT(EPOCH FROM date_trunc('${period}', local_period + ('1 ' || '${period}')::INTERVAL))*1000 AS date_to,
          CASE '${period}'
            WHEN 'month' THEN to_char(local_period, 'YYYY Month')
            WHEN 'year' THEN to_char(local_period, 'YYYY')
            WHEN 'week' THEN 'week ' || to_char(local_period, 'WW') || ' starting ' || to_char(local_period, 'YYYY-MM-DD')
            ELSE to_char(local_period, 'YYYY-MM-DD')
          END AS display,
          local_period AS date,
          sum(duration_min)*60 AS sum_duration_h, 
          convert_km(max(end_km)::integer - min(start_km)::integer, '${length_unit}') AS sum_distance_${length_unit},
          convert_celsius(avg(outside_temp_avg), '${temp_unit}') AS avg_outside_temp_${temp_unit},
          count(*) AS cnt,
          sum(distance)/sum(range_diff) AS efficiency
        FROM data WHERE
          car_id = ${carId}
        GROUP BY date
        ORDER BY date DESC LIMIT 30`
    }])
  },

  async getVehicleDrives(carId, length_unit = 'km', temp_unit = 'C') {
    return await query([{
      refId: 'drives',
      rawSql: `WITH data AS (
        SELECT
          round(extract(epoch FROM start_date)) * 1000 AS start_date_ts,
          round(extract(epoch FROM end_date)) * 1000 AS end_date_ts,
          car.id as car_id,
          CASE WHEN start_geofence.id IS NULL THEN CONCAT('new?lat=', start_position.latitude, '&lng=', start_position.longitude)
               WHEN start_geofence.id IS NOT NULL THEN CONCAT(start_geofence.id, '/edit')
          END as start_path,
          CASE WHEN end_geofence.id IS NULL THEN CONCAT('new?lat=', end_position.latitude, '&lng=', end_position.longitude)
               WHEN end_geofence.id IS NOT NULL THEN CONCAT(end_geofence.id, '/edit')
          END as end_path,
          TO_CHAR((duration_min * INTERVAL '1 minute'), 'HH24:MI') as duration_str,
          drives.id as drive_id,
          -- Columns
          start_date,
          COALESCE(start_geofence.name, CONCAT_WS(', ', COALESCE(start_address.name, nullif(CONCAT_WS(' ', start_address.road, start_address.house_number), '')), start_address.city)) AS start_address,
          COALESCE(end_geofence.name, CONCAT_WS(', ', COALESCE(end_address.name, nullif(CONCAT_WS(' ', end_address.road, end_address.house_number), '')), end_address.city)) AS end_address,
          duration_min,
          distance,
          start_position.usable_battery_level as start_usable_battery_level,
          start_position.battery_level as start_battery_level,
          end_position.usable_battery_level as end_usable_battery_level,
          end_position.battery_level as end_battery_level,
         case when (start_position.battery_level != start_position.usable_battery_level OR end_position.battery_level != end_position.usable_battery_level) = true then true else false end  as reduced_range,
          duration_min > 1 AND distance > 1 AND ( 
            start_position.usable_battery_level IS NULL OR end_position.usable_battery_level IS NULL	OR
            (end_position.battery_level - end_position.usable_battery_level) = 0 
          ) as is_sufficiently_precise,
          NULLIF(GREATEST(start_ideal_range_km - end_ideal_range_km, 0), 0) as range_diff,
          car.efficiency as car_efficiency,
          outside_temp_avg,
          distance / NULLIF(duration_min, 0) * 60 AS avg_speed,
          power_max
        FROM drives
        LEFT JOIN addresses start_address ON start_address_id = start_address.id
        LEFT JOIN addresses end_address ON end_address_id = end_address.id
        LEFT JOIN positions start_position ON start_position_id = start_position.id
        LEFT JOIN positions end_position ON end_position_id = end_position.id
        LEFT JOIN geofences start_geofence ON start_geofence_id = start_geofence.id
        LEFT JOIN geofences end_geofence ON end_geofence_id = end_geofence.id
        LEFT JOIN cars car ON car.id = drives.car_id
        WHERE drives.car_id = ${carId} AND convert_km(distance::numeric, '${length_unit}') >= 1 AND convert_km(distance::numeric, '${length_unit}') / NULLIF(duration_min, 0) * 60 >= 5
        ORDER BY start_date DESC
      )
      SELECT
          start_date_ts,
          end_date_ts,
          car_id,
          start_path,
          end_path,
          duration_str,
          drive_id,
          -- Columns
          start_date as start_date_km,
          start_address,
          end_address,
          duration_min,
          convert_km(distance::numeric, '${length_unit}') AS distance_${length_unit},
          start_battery_level as "% Start",
          end_battery_level as "% End",
          convert_celsius(outside_temp_avg, '${temp_unit}') AS outside_temp_${temp_unit},
          convert_km(avg_speed::numeric, '${length_unit}') AS speed_avg_${length_unit},
          power_max,
          reduced_range as has_reduced_range,
          range_diff * car_efficiency as "consumption_kWh",
          CASE WHEN is_sufficiently_precise THEN range_diff * car_efficiency / distance * 1000 * CASE WHEN '${length_unit}' = 'km' THEN 1
                                                                                                      WHEN '${length_unit}' = 'mi' THEN 1.60934
                                                                                                 END
          END AS consumption_kWh_${length_unit},
          CASE WHEN is_sufficiently_precise THEN distance / range_diff
               ELSE NULL
          END AS efficiency
      FROM data LIMIT 50;`
    }])
  }
}