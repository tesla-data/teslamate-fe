export function km(v, digits = 0) {
  return v && ((v * 1).toFixed(digits) + 'km')
}