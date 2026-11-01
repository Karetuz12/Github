const reitit = ['/', '/palvelut', '/palvelut/groundwork', '/palvelut/verkkosivut', '/palvelut/mainonta', '/palvelut/sparraus', '/hinnat', '/kokemus', '/minusta', '/yhteys', '/tietosuoja', '/ei-ole'];
const pura = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
for (const r of reitit) {
  const res = await fetch('http://localhost:3100' + r);
  const h = await res.text();
  const title = pura(h.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const desc = pura(h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  const canon = h.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '-';
  const og = h.match(/<meta property="og:image" content="([^"]*)"/)?.[1] ?? '-';
  const robots = h.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  const otsikot = [...h.matchAll(/<h([1-6])[^>]*>/g)].map((m) => +m[1]);
  let hyppy = false;
  for (let i = 1; i < otsikot.length; i++) if (otsikot[i] > otsikot[i - 1] + 1) hyppy = true;
  const ld = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => {
    const j = JSON.parse(m[1]);
    return j['@graph'] ? j['@graph'].map((g) => g['@type']).join('+') : j['@type'];
  });
  console.log(`${res.status} ${r}\n  title (${title.length}): ${title}\n  desc (${desc.length}): ${desc}\n  canonical: ${canon}  og:image: ${og.replace(/\?.*/, '')} ${robots}\n  H1=${otsikot.filter((x) => x === 1).length} headings=${otsikot.join('')} ${hyppy ? 'HYPPY!' : 'ok'}  JSON-LD: ${ld.join(', ')}`);
}
