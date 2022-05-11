import { ref } from 'vue'
import axios from 'axios'

const apiUrl = 'https://service-a0j9syyt-1303929337.bj.apigw.tencentcs.com/release'

const urlBaseKey = 'teslamate_api_urlbase'
export const urlBase = ref(localStorage.getItem(urlBaseKey) || '')

const apikeyKey = 'teslamate_apikey'
export const apikey = ref(localStorage.getItem(apikeyKey) || '')

export async function getTeslafi() {
  const { data } = await axios.get(apiUrl + '/teslafi')
  return data
}

export function updateSettings() {
  localStorage.setItem(urlBaseKey, urlBase.value)
  localStorage.setItem(apikeyKey, apikey.value)
}

async function query(queries, from, to) {
  if (!urlBase.value || !apikey.value) return
  if (from) from = from.toString()
  if (to) to = to.toString()

  const url = apiUrl + '/query';
  const payload = { from, to, queries: queries.map(({ refId, rawSql }) => ({ refId, datasourceId: 1, rawSql, format: 'table' })) }
  const { data: { results } } = await axios.post(url, payload, { params: { url: urlBase.value }, headers: { Authorization: `Bearer ${apikey.value}` } })

  const ret = queries.map(({ refId }) => {
    if (results[refId].tables) {
      return results[refId].tables[0].rows.map(r => r.reduce((m, v, i) => { m[results[refId].tables[0].columns[i].text] = v; return m }, {}));
    } else {
      return results[refId].frames[0].data.values[0].map((_, i) => results[refId].frames[0].schema.fields.reduce((m, v, fi) => { m[v.name] = results[refId].frames[0].data.values[fi][i]; return m }, {}));
    }
  })

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
          SELECT ${fields} FROM (
            (SELECT ${fields} FROM positions WHERE car_id = ${carId} AND usable_battery_level IS NOT NULL ORDER BY date DESC LIMIT 1) UNION
            (SELECT ${fields} FROM charges c JOIN charging_processes p ON p.id = c.charging_process_id WHERE p.car_id = ${carId} AND usable_battery_level IS NOT NULL ORDER BY date DESC LIMIT 1)
          ) AS data ORDER BY date DESC LIMIT 1;
        `
      }, {
        refId: 'vs2',
        rawSql: `SELECT odometer, inside_temp, driver_temp_setting, fan_status, is_climate_on, date FROM positions WHERE car_id = ${carId} ORDER BY date DESC LIMIT 1`
      }, {
        refId: 'charge',
        rawSql: `
          WITH charging_process AS (
            SELECT id AS cid, end_date
            FROM charging_processes
            WHERE car_id = ${carId}
            ORDER BY start_date DESC
            LIMIT 1
          )
          SELECT *
          FROM charges, charging_process
          WHERE charging_process.cid = charging_process_id
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
          SELECT $__timeGroup(date, '5s'), avg(battery_level) as "battery_level", convert_km(avg(ideal_battery_range_km), 'km') as "range"
          FROM positions
          WHERE date BETWEEN ($__timeFrom()::timestamp - interval '1 day') AND ($__timeTo()::timestamp + interval '1 day') AND car_id = ${carId}
          GROUP BY 1
        ) UNION ALL (
          SELECT $__timeGroup(date, '5s'), avg(battery_level) as "battery_level", convert_km(avg(ideal_battery_range_km), 'km') as "range"
          FROM charges c
          LEFT JOIN charging_processes p ON c.charging_process_id = p.id
          WHERE date BETWEEN ($__timeFrom()::timestamp - interval '1 day') AND ($__timeTo()::timestamp + interval '1 day') AND p.car_id = ${carId}
          GROUP BY 1
        )
        ORDER BY 1
      `
    }], from, to)
  },

  async getVehicleStats(carId, period = 'month', timezone = 'Asia/Shanghai', length_unit = 'km', temp_unit = 'C') {
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
            WHEN 'month' THEN to_char(local_period, 'YYYY Mon')
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
          range_diff * car_efficiency / distance * 1000 * CASE WHEN '${length_unit}' = 'km' THEN 1
                                                            WHEN '${length_unit}' = 'mi' THEN 1.60934
                                                          END
          AS consumption_kWh_${length_unit},
          CASE WHEN is_sufficiently_precise THEN distance / range_diff
               ELSE NULL
          END AS efficiency
      FROM data LIMIT 50;`
    }])
  },

  getVehicleProjectedRange(carId) {
    return query([{
      refId: 'projected_range',
      rawSql:`
        SELECT
          $__timeGroup(date, '6h') AS time,
          convert_km((sum(ideal_battery_range_km) / nullif(sum(coalesce(usable_battery_level,battery_level)),0) * 100)::numeric, 'km') AS "projected_range"
        FROM
          (
            select battery_level, usable_battery_level, date,
              rated_battery_range_km, ideal_battery_range_km, outside_temp
            from positions
            where
              car_id = ${carId} and $__timeFilter(date) and ideal_battery_range_km is not null
            union all
            select battery_level, coalesce(usable_battery_level,battery_level) as usable_battery_level, date,
              rated_battery_range_km, ideal_battery_range_km, outside_temp
            from charges c
            join
              charging_processes p ON p.id = c.charging_process_id 
            where
              $__timeFilter(date) and p.car_id = ${carId}
            ) as data
        
        GROUP BY
          1
        having convert_km((sum(ideal_battery_range_km) / nullif(sum(coalesce(usable_battery_level,battery_level)),0) * 100)::numeric, 'km') is not null
        ORDER BY
          1,2  DESC
      `
    }, {
      refId: 'mileage',
      rawSql: `
        SELECT
          $__timeGroup(date, '6h') AS time,
          convert_km(avg(odometer)::numeric, 'km') AS "mileage"
        FROM
          positions
        WHERE
          $__timeFilter(date) and
          car_id = ${carId}  and ideal_battery_range_km is not null
        GROUP BY
          1
        ORDER BY
          1,2  DESC;      
      `
    }], Date.now() - 86400 * 1000 * 365, Date.now())
  },

  async getVehicleCharges(carId) {
    return await query([{
      refId: 'charges',
      rawSql: `
        WITH data AS (
          SELECT
            (round(extract(epoch FROM start_date) - 10) * 1000) AS start_date_ts,
            (round(extract(epoch FROM end_date) + 10) * 1000) AS end_date_ts,
            start_date,
            end_date,
            CONCAT_WS(', ', COALESCE(addresses.name, nullif(CONCAT_WS(' ', addresses.road, addresses.house_number), '')), addresses.city) AS address,
            g.name as geofence_name,
            g.id as geofence_id,
            p.latitude,
            p.longitude,
            cp.charge_energy_added,
            cp.charge_energy_used,
            duration_min,
            start_battery_level,
            end_battery_level,
            start_ideal_range_km,
            end_ideal_range_km,
            outside_temp_avg,
            cp.id,
            lag(end_ideal_range_km) OVER (ORDER BY start_date) - start_ideal_range_km AS range_loss,
            p.odometer - lag(p.odometer) OVER (ORDER BY start_date) AS distance,
            cars.efficiency,
            cp.car_id,
            cost,
            max(c.charger_voltage) as max_charger_voltage
          FROM
            charging_processes cp
            LEFT JOIN charges c ON cp.id = c.charging_process_id
            LEFT JOIN positions p ON p.id = cp.position_id
            LEFT JOIN cars ON cars.id = cp.car_id
            LEFT JOIN addresses ON addresses.id = cp.address_id
            LEFT JOIN geofences g ON g.id = geofence_id
          WHERE 
            cp.car_id = ${carId} AND
            (cp.charge_energy_added IS NULL OR cp.charge_energy_added > 0)
          GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11,12,13,14,15,16,17,18,21,p.odometer
          ORDER BY
            start_date
        )
        SELECT
          start_date_ts,
          end_date_ts,
          CASE WHEN geofence_id IS NULL THEN CONCAT('new?lat=', latitude, '&lng=', longitude)
              WHEN geofence_id IS NOT NULL THEN CONCAT(geofence_id, '/edit')
          END as path,
          car_id,
          id,
          -- Columns
          start_date as start_date_km,
          end_date,
          COALESCE(geofence_name, address) as address,    
          duration_min,
          cost,
          charge_energy_added,
          charge_energy_used,
          CASE WHEN charge_energy_used IS NULL THEN NULL ELSE LEAST(charge_energy_added / NULLIF(charge_energy_used, 0), 1.0) END as charging_efficiency,
          convert_celsius(outside_temp_avg, 'c') AS outside_temp_avg,
          charge_energy_added * 60 / NULLIF (duration_min, 0) AS charge_energy_added_per_hour,
          convert_km((end_ideal_range_km - start_ideal_range_km) * 60 / NULLIF (duration_min, 0), 'km') AS range_added_per_hour_km,
          start_battery_level,
          end_battery_level,
          convert_km(distance::numeric, 'km') AS distance
        FROM
          data
        WHERE
          (distance >= 0 OR distance IS NULL) AND
          charge_energy_added > 0
        ORDER BY
          start_date DESC;        
      `
    }])
  },

  async getVehicleUpdates(carId) {
    return await query([{
      refId: 'updates',
      rawSql: `
        with u as (
          select *, coalesce(lag(start_date) over(order by start_date desc), now()) as next_start_date 
          from updates
          where car_id = ${carId}
        ),
        rng as (
          SELECT
            to_timestamp(floor(extract(epoch from date)/21600)*21600) AS date,
            (sum(ideal_battery_range_km) / sum(coalesce(usable_battery_level,battery_level)) * 100 ) AS "battery_rng"
          FROM (
            select battery_level, usable_battery_level, date, rated_battery_range_km, ideal_battery_range_km
            from positions
            where car_id = ${carId} and ideal_battery_range_km is not null
            union all
            select battery_level, coalesce(usable_battery_level,battery_level) as usable_battery_level, date, rated_battery_range_km, ideal_battery_range_km
            from charges c
            join charging_processes p ON p.id = c.charging_process_id 
            where p.car_id = ${carId}
          ) as data
          GROUP BY 1
        )
        
        select	
          u.start_date as time,
          extract(EPOCH FROM u.end_date - u.start_date) AS update_duration,
          extract(EPOCH FROM u.start_date - lag(u.start_date) OVER (ORDER BY u.start_date)) AS since_last_update,
          split_part(u.version, ' ', 1) as version,
          count(distinct cp.id) as chg_ct,
          convert_km(avg(r.battery_rng), 'km')::numeric(6,2) AS "avg_range"
        from u u
        left join charging_processes cp
          ON u.car_id = cp.car_id
          and cp.start_date between u.start_date and u.next_start_date
        left join rng r
          ON r.date between u.start_date and u.next_start_date
        group by u.car_id,
          u.start_date,
          u.end_date,
          next_start_date,
          split_part(u.version, ' ', 1)
        order by u.start_date desc
      `
    }])
  }
}