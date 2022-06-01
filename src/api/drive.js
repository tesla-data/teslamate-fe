import { requestApi } from './teslamate'
import { currentVehicle } from '../settings'

export function groupDrives(drives) {
  const groups = drives.reduce((arr, drive) => {
    const date = new Date(drive.start_date_ts).toLocaleDateString()
    if (arr.length > 0 && arr[arr.length - 1].date === date) {
      arr[arr.length - 1].drives.push(drive)
    } else {
      arr.push({
        date,
        drives: [drive]
      })
    }

    return arr
  }, [])

  for (const g of groups) {
    g.totalComsuption = g.drives.reduce((total, drive) => total + drive.consumption_kWh, 0)
    g.totalDistance = g.drives.reduce((total, drive) => total + drive.distance_km, 0)
    g.totalDuration = g.drives.reduce((total, drive) => total + drive.duration_min, 0)
    g.comsumption = g.totalComsuption / g.totalDistance * 1000
    g.avgSpeed = g.totalDistance / g.totalDuration * 60
  }

  const ret = {
    groups,
    totalComsuption: groups.reduce((total, group) => total + group.totalComsuption, 0),
    totalDistance: groups.reduce((total, group) => total + group.totalDistance, 0),
    totalDuration: groups.reduce((total, group) => total + group.totalDuration, 0)
  }

  ret.comsumption = ret.totalComsuption / ret.totalDistance * 1000
  ret.avgSpeed = ret.totalDistance / ret.totalDuration * 60

  return ret
}

export function getDrives(from, to, carId = currentVehicle.value.id) {
  return requestApi('/drives', { car_id: carId, from, to })
}

export function getDriveDetail(drive_id) {
  return requestApi('/drive_detail', { drive_id })
}
