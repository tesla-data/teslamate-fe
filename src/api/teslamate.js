import { ref } from 'vue'
import axios from 'axios'
import { Notify } from '@nutui/nutui'

const apiUrl = 'https://service-a0j9syyt-1303929337.bj.apigw.tencentcs.com/release'
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

export async function requestPublicApi(path, params) {
  try {
    const { data } = await axios.get(apiUrl + path, { params })
    return data
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

export async function requestApi(path, params) {
  try {
    if (!urlBase.value || !apikey.value) return
    const { data } = await axios.get(apiUrl + path, { params: { url: urlBase.value, ...params }, headers: { Authorization: `Bearer ${apikey.value}` } })
    return data.results ? parseGrafanaResults(data.results) : data
  } catch(e) {
    Notify.danger('网络错误' + e.message)
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