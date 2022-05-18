import { query } from './teslamate'
import { currentVehicle } from '../settings'

export function getPositions(from, to, length_unit = 'km', temp_unit = 'C', alternative_length_unit = 'm') {
  return query([{
    refId: 'positions',
    rawSql: `
SELECT
	$__time(date),
  ROUND(convert_m(elevation, '${alternative_length_unit}')) AS "Elevation [${alternative_length_unit}]",
  latitude,
  longitude,
	convert_km(speed::numeric, '${length_unit}') AS "Speed [${length_unit}/h]",
	power AS "Power [kW]",
	battery_heater::integer*100 AS "Preconditioning",
	convert_km(ideal_battery_range_km, '${length_unit}') AS "range",
	--convert_km(est_battery_range_km, '${length_unit}') AS "Range (est.) [${length_unit}]",
	battery_level,
	usable_battery_level,
  convert_celsius(outside_temp, '${temp_unit}') AS "Outside Temperature [°${temp_unit}]",
	convert_celsius(inside_temp, '${temp_unit}') AS "Inside Temperature [°${temp_unit}]",
	convert_celsius(driver_temp_setting, '${temp_unit}') as "Driver Temperature [°${temp_unit}]",
	convert_celsius(passenger_temp_setting, '${temp_unit}') as "Passenger Temperature [°${temp_unit}]",
  is_climate_on::integer,
	fan_status
FROM
	positions
WHERE
 car_id = ${currentVehicle.value.id} AND
 $__timeFilter(date)
ORDER BY
	date ASC
    `
  }], from, to)
}

export function getPositionsBig(from, to, length_unit = 'km', temp_unit = 'C', alternative_length_unit = 'm') {
  const dur = (to - from) / 1000 / 86400
  const tg = dur <= 7 ? 5 : dur <= 14 ? 10 : dur < 35 ? 15 : dur < 180 ? 30 : 60
  return query([{
    refId: 'positions',
    rawSql: `
SELECT
	$__timeGroup(date, '${tg}s'),
  ROUND(convert_m(avg(elevation), '${alternative_length_unit}')) AS "Elevation [${alternative_length_unit}]",
  avg(latitude) AS latitude,
  avg(longitude) AS longitude,
	convert_km(avg(speed::numeric), '${length_unit}') AS "Speed [${length_unit}/h]",
	avg(power) AS "Power [kW]",
	avg(battery_heater::integer*100) AS "Preconditioning",
	convert_km(avg(ideal_battery_range_km), '${length_unit}') AS "range",
	avg(battery_level) AS "battery_level",
	avg(usable_battery_level) AS "usable_battery_level"
  --convert_celsius(avg(outside_temp), '${temp_unit}') AS "Outside Temperature [°${temp_unit}]",
	--convert_celsius(avg(inside_temp), '${temp_unit}') AS "Inside Temperature [°${temp_unit}]",
	--convert_celsius(avg(driver_temp_setting), '${temp_unit}') as "Driver Temperature [°${temp_unit}]",
	--convert_celsius(avg(passenger_temp_setting), '${temp_unit}') as "Passenger Temperature [°${temp_unit}]",
  --avg(is_climate_on::integer),
	--avg(fan_status)
FROM
	positions
WHERE
 car_id = ${currentVehicle.value.id} AND
 $__timeFilter(date)
GROUP BY
 1
ORDER BY
 1 ASC
    `
  }], from, to)
}