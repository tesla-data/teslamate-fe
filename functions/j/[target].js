
export async function onRequest(context) {
  const resp = await fetch(`https://reurl.cc/${context.params.target}`)
  const reurl = resp.headers.get('target')
  return Response.redirect(reurl, 301)
}