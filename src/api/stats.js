import vehicle from './vehicle'
import { getDrives } from './drive'

export async function stats(from, to) {
  const [drives, charges] = await Promise.all([getDrives(from, to), vehicle.getCharges(from, to)])
  return {
    drives, charges
  }
}