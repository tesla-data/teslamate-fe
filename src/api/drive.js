import { query } from './teslamate'
import { currentVehicle } from '../settings'

const defDriveTable = (carId = currentVehicle.value.id, length_unit = 'km') => `
WITH data AS (
  SELECT
    round(extract(epoch FROM start_date)) * 1000 AS start_date_ts,
    round(extract(epoch FROM end_date)) * 1000 AS end_date_ts,
    car.id as car_id,
    start_km,
    end_km,
    start_ideal_range_km,
    end_ideal_range_km,
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
`

export async function getDriveDetail(drive_id, length_unit = 'km', temp_unit = 'C') {
  return await query([{
    refId: 'drive',
    rawSql: `
      ${defDriveTable(currentVehicle.value.id, length_unit)}
      SELECT
        start_date_ts,
        end_date_ts,
        car_id,
        start_km,
        end_km,
        start_ideal_range_km,
        end_ideal_range_km,
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
      FROM data WHERE drive_id = ${drive_id};
    `
  }])
}
