import { query } from './teslamate'
import { currentVehicle } from '../settings'

export function getChargeDetail(id, length_unit = 'km', temp_unit = 'C') {
  return query([{
    refId: 'charge',
    rawSql: `
SELECT
  $__time(date),
  battery_level as "SOC [%]",
  charger_power as "Power [kW]",
  (case when battery_heater_on then 1 else 0 end) as "Battery heater",
  convert_km(ideal_battery_range_km, '${length_unit}') as "Range [${length_unit}]",
  charger_voltage as "Charging Voltage [V]",
  charger_phases as "Phases",
  charger_actual_current as "Current [A]",
  charger_pilot_current as "Current (pilot) [A]",
  convert_celsius(outside_temp, '${temp_unit}') as "Outdoor Temperature [°${temp_unit}]"
FROM
  charges c
join
  charging_processes p ON p.id = c.charging_process_id 
WHERE
  -- $__timeFilter(date)
  c.charging_process_id = ${id}
  AND p.car_id = ${currentVehicle.value.id}
ORDER BY
  date ASC
    `
  }])
}