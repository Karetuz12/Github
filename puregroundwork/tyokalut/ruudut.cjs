// Ottaa näkymäkuvia vierittäen (kiinteä tausta, sticky-pino ja animaatiot kuten oikeassa selaimessa)
const { chromium } = require('playwright');
const [,, polku = '/', leveys = '1440', nimi = 'etusivu', askel = '900'] = process.argv;
(async () => {
  const b = await chromium.launch();
  const korkeus = +leveys < 700 ? 844 : 900;
  const p = await b.newPage({ viewport: { width: +leveys, height: korkeus } });
  const virheet = [];
  p.on('console', (m) => m.type() === 'error' && virheet.push(m.text()));
  p.on('pageerror', (e) => virheet.push(e.message));
  await p.goto('http://localhost:3100' + polku, { waitUntil: 'networkidle' });
  await p.waitForTimeout(4200);
  const kok = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 0, y = 0;
  while (true) {
    await p.screenshot({ path: `${nimi}-r${String(i).padStart(2, '0')}.png` });
    if (y + korkeus >= kok) break;
    for (let k = 0; k < +askel; k += 150) { await p.mouse.wheel(0, 150); await p.waitForTimeout(40); }
    await p.waitForTimeout(900);
    y = await p.evaluate(() => window.scrollY); i++;
    if (i > 40) break;
  }
  const yli = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(JSON.stringify({ polku, leveys, kok, kuvia: i + 1, vaakavieritys: yli, virheet }));
  await b.close();
})();
