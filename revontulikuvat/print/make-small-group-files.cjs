/**
 * Print files for the Small Group QR codes, matching the existing bus group files in
 * Drive (Valokuvien lähetys / QR-koodit painoon):
 *   - A4 posters 210 × 297 mm with 3 mm bleed (PDF 216 × 303 mm), one file per group
 *   - business cards 85 × 55 mm with 3 mm bleed (PDF 91 × 61 mm), one file per group
 *   - all A4 posters in one file without bleed, for office printing
 * Small Group files are violet so they don't get mixed up with the dark blue/green bus group files.
 *
 * Usage (from revontulikuvat/): node print/make-small-group-files.cjs [outDir] [from] [to]
 * Needs Playwright with Chromium and the Inter font installed.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const QRCode = require('qrcode');

const SITE = 'photos.booklapland.com';
const outDir = path.resolve(process.argv[2] || 'print/out/SMALL GROUP');
const from = Number(process.argv[3] || 1);
const to = Number(process.argv[4] || 25);

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')));
}

const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'bl-logo.png')).toString('base64');
const pad = (n) => String(n).padStart(2, '0');

async function qrSvg(url) {
  return QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#130a33', light: '#ffffff' } });
}

const base = `
  @page { margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Inter', sans-serif; color: #fff; }
  .bg {
    position: absolute; inset: 0; overflow: hidden;
    background:
      radial-gradient(55% 35% at 18% 0%, rgba(168, 120, 255, .55), transparent 70%),
      radial-gradient(45% 30% at 92% 8%, rgba(236, 100, 210, .32), transparent 70%),
      linear-gradient(180deg, #2a1360 0%, #170b3b 55%, #0e0726 100%);
  }
  .qr-box { background: #fff; display: grid; place-items: center; }
  .qr-box svg { width: 100%; height: 100%; display: block; }
`;

function poster(n, svg, bleed) {
  const b = bleed ? 3 : 0;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
    @page { size: ${210 + 2 * b}mm ${297 + 2 * b}mm; }
    html, body { background: #0e0726; }
    body { width: ${210 + 2 * b}mm; height: ${297 + 2 * b}mm; position: relative; overflow: hidden; }
    .page { position: absolute; inset: ${b}mm; display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 14mm; }
    .logo { width: 44mm; }
    .band {
      position: absolute; left: 0; right: 0; top: ${49 + b}mm; height: 30mm;
      background: linear-gradient(90deg, #5a35e6, #9b6bff 55%, #d06ce8);
      display: grid; place-items: center;
    }
    .band span { font-size: 50pt; font-weight: 800; letter-spacing: .08em; line-height: 1; }
    .number { margin-top: 42mm; font-size: 100pt; font-weight: 800; line-height: .9; }
    .label { margin-top: 5mm; font-size: 12pt; font-weight: 700; letter-spacing: .2em; color: #cbbcff; }
    .qr-box { margin-top: 7mm; width: 92mm; height: 92mm; padding: 8.5mm; border-radius: 6mm; }
    .cta { margin-top: 9mm; font-size: 24pt; font-weight: 800; color: #d4c6ff; }
    .sub { margin-top: 2.5mm; font-size: 12.5pt; color: #e7e1ff; }
    .url { margin-top: 3.5mm; font-size: 11pt; color: #b9acf0; letter-spacing: .02em; }
    .foot { position: absolute; bottom: 9mm; left: 0; right: 0; font-size: 7.5pt; color: #9a8fcf; }
  </style></head><body>
    <div class="bg"></div>
    <div class="band"><span>SMALL GROUP</span></div>
    <div class="page">
      <img class="logo" src="${logo}" alt="Book Lapland">
      <div class="number">${n}</div>
      <div class="label">YOUR NORTHERN LIGHTS PHOTOS</div>
      <div class="qr-box">${svg}</div>
      <div class="cta">Scan &amp; leave your email</div>
      <div class="sub">We'll send you the photos from tonight's tour.</div>
      <div class="url">${SITE}/S${n}</div>
      <div class="foot">We use your email only to send you the photos from this tour and delete it within 30 days.</div>
    </div>
  </body></html>`;
}

function card(n, svg) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
    @page { size: 91mm 61mm; }
    html, body { background: #0e0726; }
    body { width: 91mm; height: 61mm; position: relative; overflow: hidden; }
    .page { position: absolute; inset: 3mm; display: flex; align-items: center; gap: 4.5mm; padding: 0 4mm 0 4.5mm; }
    .qr-box { flex: none; width: 37mm; height: 37mm; padding: 3.2mm; border-radius: 2.5mm; }
    .text { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
    .logo { width: 17mm; margin-bottom: 1.5mm; }
    .tag {
      background: linear-gradient(90deg, #6a45f0, #b06cff); border-radius: 1.2mm;
      padding: .9mm 1.8mm; font-size: 8.5pt; font-weight: 800; letter-spacing: .1em; line-height: 1;
    }
    .number { margin-top: .8mm; font-size: 30pt; font-weight: 800; line-height: 1; }
    .cta { margin-top: 1.5mm; font-size: 7.5pt; font-weight: 800; color: #d4c6ff; }
    .url { margin-top: .6mm; font-size: 5.6pt; color: #b9acf0; }
  </style></head><body>
    <div class="bg"></div>
    <div class="page">
      <div class="qr-box">${svg}</div>
      <div class="text">
        <img class="logo" src="${logo}" alt="Book Lapland">
        <div class="tag">SMALL GROUP</div>
        <div class="number">${n}</div>
        <div class="cta">Scan &amp; leave your email</div>
        <div class="url">${SITE}/S${n}</div>
      </div>
    </div>
  </body></html>`;
}

(async () => {
  const postersDir = path.join(outDir, 'A4 julisteet');
  const cardsDir = path.join(outDir, 'Käyntikortit 85x55');
  fs.mkdirSync(postersDir, { recursive: true });
  fs.mkdirSync(cardsDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (html, file, width, height) => {
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: file, width, height, printBackground: true, preferCSSPageSize: true });
  };

  const office = [];
  for (let n = from; n <= to; n++) {
    const svg = await qrSvg(`https://${SITE}/S${n}`);
    await render(poster(n, svg, true), path.join(postersDir, `BL-A4-small-group-${pad(n)}.pdf`), '216mm', '303mm');
    await render(card(n, svg), path.join(cardsDir, `BL-QR-small-group-${pad(n)}.pdf`), '91mm', '61mm');
    office.push(poster(n, svg, false).match(/<body>([\s\S]*)<\/body>/)[1]);
  }

  // All posters in one file, plain A4 without bleed, for office printers
  const style = poster(from, '', false).match(/<style>([\s\S]*?)<\/style>/)[1];
  const all = `<!doctype html><html><head><meta charset="utf-8"><style>${style}
    body { height: auto; overflow: visible; } .sheet { width: 210mm; height: 297mm; position: relative; overflow: hidden; break-after: page; }
  </style></head><body>${office.map((b) => `<div class="sheet">${b}</div>`).join('')}</body></html>`;
  await render(all, path.join(outDir, '_KAIKKI-A4-small-group-toimistotulostus.pdf'), '210mm', '297mm');

  await browser.close();
  console.log(`Done: ${to - from + 1} posters and cards in ${outDir}`);
})();
