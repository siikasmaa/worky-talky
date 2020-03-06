addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'GET') {
    const requestURL = new URL(request.url)
    const [text, language, region, locale] = [
      'text',
      'lang',
      'region',
      'locale',
    ].map(param => requestURL.searchParams.get(param))
    return await serveSound(text, language, region, locale)
  } else if (request.method === 'POST') {
    const { text, language, region, locale } = await request.json()
    return await serveSound(text, language, region, locale)
  }
}

const serveSound = (text = 'hello world', language, region, locale) => {
  let lang, country
  if (typeof locale === 'string' && locale.match(/^[A-Za-z]{2}-[A-Za-z]{2}$/)) {
    const localeParams = locale.split('-')
    lang = localeParams[0]
    region = localeParams[1]
  } else {
    lang = typeof language === 'string' ? language.substring(0, 2) : 'en'
    country = typeof region === 'string' ? region : lang === 'en' ? 'gb' : lang
  }
  return fetch(
    `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang.toLowerCase()}-${country.toUpperCase()}&client=tw-ob&q=${encodeURI(
      text,
    )}`,
  )
    .then(
      res =>
        new Response(res.body, {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
        }),
    )
    .catch(
      () =>
        new Response('Bad request', {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }),
    )
}
