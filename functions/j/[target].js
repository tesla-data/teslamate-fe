
export async function onRequest({ params: target }) {
  const resp = await fetch(`https://reurl.cc/${target}`)
  const reurl = resp.headers.get('target')
  return Response.redirect(reurl, 301)
}