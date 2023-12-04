import { ref } from 'vue'
import { Notify } from '@nutui/nutui'

const apiUrl = 'https://teslamate-proxy-teslamate-proxy-drgkzdyqcg.cn-beijing.fcapp.run'
// const apiUrl = 'http://localhost:9000'

const urlBaseKey = 'teslamate_api_urlbase'
export const urlBase = ref(localStorage.getItem(urlBaseKey) || '')

const apikeyKey = 'teslamate_apikey'
export const apikey = ref(localStorage.getItem(apikeyKey) || '')

export async function getTeslafi() {
  return await requestPublicApi('/teslafi')
}

export function updateSettings() {
  localStorage.setItem(urlBaseKey, urlBase.value)
  localStorage.setItem(apikeyKey, apikey.value)
}

function toUrlSearch(params) {
  params = params && Object.keys(params).reduce((m, k) => { if (params[k] !== undefined) m[k] = params[k]; return m }, {})
  return params && Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '' 
}

export async function requestPublicApi(path, params) {
  try {
    const res = await fetch(`${apiUrl}${path}${toUrlSearch(params)}`)
    return await res.json()
  } catch (e) {
    Notify.danger('网络错误' + e.message)
  }
}

function parseGrafanaResults(results) {
  const ret = Object.keys(results).map(refId => {
    if (results[refId].tables) {
      return results[refId].tables[0].rows.map(r => r.reduce((m, v, i) => { m[results[refId].tables[0].columns[i].text] = v; return m }, {}));
    } else {
      return results[refId].frames[0].data.values[0].map((_, i) => results[refId].frames[0].schema.fields.reduce((m, v, fi) => { m[v.name] = results[refId].frames[0].data.values[fi][i]; return m }, {}));
    }
  })

  return ret.length === 1 ? ret[0] : ret
}

export async function requestApi(path, params, isRetry) {
  try {
    if (!urlBase.value || !apikey.value) return
    const res = await fetch(`${apiUrl}${path}${toUrlSearch({ url: urlBase.value, ...params })}`, { headers: { Authorization: `Bearer ${apikey.value}` } })
    if (res.status !== 200) throw new Error('Status code: ' + res.status)
    
    const data = await res.json()
    return data.results ? parseGrafanaResults(data.results) : data
  } catch(e) {
    if (isRetry) {
      Notify.danger('网络错误' + e.message)
    } else {
      return await requestApi(path, params, true)
    }
  }
}

// export async function query(queries, from, to) {
//   if (!urlBase.value || !apikey.value) return
//   if (from) from = from.toString()
//   if (to) to = to.toString()

//   const url = apiUrl + '/query';
//   const payload = { from, to, queries: queries.map(({ refId, rawSql }) => ({ refId, datasourceId: 1, rawSql, format: 'table' })) }
//   const { data: { results } } = await axios.post(url, payload, { params: { url: urlBase.value }, headers: { Authorization: `Bearer ${apikey.value}` } })

//   return parseGrafanaResults(results)
// }

export async function listVehicles() {
  return await requestApi('/list_vehicles')
}