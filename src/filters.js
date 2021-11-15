export function duration(d) {
  d = Math.round(d / 1000)
  return d < 60 ? d + '秒' :
    d < 3600 ? Math.round(d / 60) + '分' :
    d < 86400 ? Math.floor(d / 3600) + '小时' + Math.round((d % 3600) / 60) + '分' :
    Math.floor(d / 86400) + '天' + Math.round((d % 86400) / 3600) + '小时'
}

export function days(d) {
  d = Math.round(d / 1000)
  return d < 60 ? d + '秒' :
    d < 3600 ? Math.round(d / 60) + '分' :
    d < 86400 ? Math.round(d / 3600) + '小时' :
    Math.round(d / 86400) + '天'
}


export function km(v, digits = 0) {
  return v && ((v * 1).toFixed(digits) + 'km')
}