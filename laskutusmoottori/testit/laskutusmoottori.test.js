// Testaa laskutusmoottori.gs:n puhtaat funktiot Nodessa ilman Google-palveluita.
// Aja: node --test "laskutusmoottori/testit/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function lataa() {
  const koodi = fs.readFileSync(path.join(__dirname, '..', 'laskutusmoottori.gs'), 'utf8');
  const muoto = (d, tz, f) => {
    const osat = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).forEach((p) => { osat[p.type] = p.value; });
    return f.replace('yyyy', osat.year).replace('MM', osat.month).replace('dd', osat.day)
      .replace('d.M', Number(osat.day) + '.' + Number(osat.month)).replace('HH', osat.hour).replace('mm', osat.minute);
  };
  const ctx = {
    console,
    Utilities: {
      Charset: { UTF_8: 'UTF-8' },
      formatDate: muoto,
      base64Encode: (s) => Buffer.from(String(s), 'utf8').toString('base64'),
      base64EncodeWebSafe: (s) => Buffer.from(String(s), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
    },
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSpreadsheetTimeZone: () => 'Europe/Helsinki' }) },
  };
  vm.createContext(ctx);
  vm.runInContext(koodi, ctx, { filename: 'laskutusmoottori.gs' });
  return ctx;
}

const g = lataa();
// vm-kontekstin taulukot ovat eri realmista, joten ne kopioidaan ennen deepEqual-vertailua
const arr = (x) => Array.from(x);

const asetukset = (muut) => Object.assign({
  tila: 'LÄHETÄ', nimi: 'Testi Myyjä', allekirjoitus: 'Testi Myyjä\nYritys Oy', referenssi: 'Referenssi.',
  raportti: '', alias: '', keskikauppa: 2500, kp: 0.04, pk: 0.3, kynnys: 60, min: 3, max: 20, yhteensa: 40,
  loppuOdotus: 5, vaadiHavainto: true, autoHavainto: false, li: 5, soitot: 3, arkisin: true, kooste: true, ajo: 7,
  kauppojaViikossa: 0, myyntisykli: 21, maksuaika: 14, oletusTuote: 'Verkkosivuprojekti', tietosuoja: '',
}, muut || {});

const VERKKOSIVU = [{ osuus: 0.5, pv: 7 }, { osuus: 0.5, pv: 35 }];
const kauppa = (muut) => Object.assign({
  asiakas: 'Asiakas', kuvaus: 'Verkkosivuprojekti', tuote: 'Verkkosivuprojekti', vaihe: 'Voitettu', tod: 1, kerta: 2000,
  tilauspvm: '2026-11-01', kk: 0, kkAlkaa: null, kkPaattyy: null, erat: VERKKOSIVU, maksuaika: 14, seuraava: '', seuraavaPvm: null,
  luotu: '2026-11-01', tuoteLoytyi: true,
}, muut || {});

const pohjat = () => [
  { vaihe: 1, segmentti: 'Matkailu', odota: 0, aihe: '{{yritys}} / sivut ja varaukset', viesti: 'Hei {{etunimi}},\n\nhuomasin, että {{havainto}}. M\n\n{{allekirjoitus}}' },
  { vaihe: 1, segmentti: '', odota: 0, aihe: '{{yritys}} / verkkosivut', viesti: 'Hei {{etunimi}},\n\nkävin ({{sivusto}}) ja huomasin, että {{havainto}}. {{referenssi}}\n\n{{allekirjoitus}}' },
  { vaihe: 2, segmentti: '', odota: 3, aihe: '', viesti: 'Hei {{etunimi}}, nostan.\n{{nimi}}' },
  { vaihe: 3, segmentti: '', odota: 5, aihe: '', viesti: 'Viimeinen.\n{{nimi}}' },
  { vaihe: 'LinkedIn', segmentti: '', odota: 0, aihe: '', viesti: 'Hei {{etunimi}}, {{havainto}}.' },
  { vaihe: 1, segmentti: 'Verkosto', odota: 0, aihe: 'Pieni kysymys', viesti: 'Moi {{etunimi}}, tiedätkö jonkun?\n{{nimi}}' },
  { vaihe: 2, segmentti: 'Verkosto', odota: 5, aihe: '', viesti: 'Moi {{etunimi}}, nostan.\n{{nimi}}' },
];

const liidi = (muut) => Object.assign({
  _rivi: 2, yritys: 'Yritys Oy', etunimi: 'Anna', sukunimi: 'A', rooli: '', email: 'anna@yritys.fi', puhelin: '',
  linkedin: '', sivusto: 'https://www.yritys.fi/', segmentti: '', paikkakunta: '', havainto: 'sivusto ei skaalaudu puhelimelle',
  ehdotus: '', tila: 'Uusi', vaihe: 0, aloitettu: null, seuraava: null, ketju: '', luonnos: '', liTila: '', soitto: '', muistiinpano: '',
}, muut || {});

// Käyttäjän lähtötilanne marraskuussa 2026
const malli = (muut) => Object.assign({
  asetukset: asetukset(),
  tavoitteet: [
    { kk: '2026-11', tavoite: 15000 }, { kk: '2026-12', tavoite: 15000 }, { kk: '2027-01', tavoite: 15000 },
  ],
  toistuvat: [
    { nimi: 'Book Lapland', laskutettava: 'Book Lapland', summa: 8000, alkaa: '2026-11-01', paattyy: null },
    { nimi: 'MB provisio', laskutettava: 'Markkinointiboosti Oy', summa: 2000, alkaa: '2026-11-01', paattyy: null },
    { nimi: 'Konsultointi', laskutettava: 'Konsultointiasiakas', summa: 1000, alkaa: '2026-11-01', paattyy: null },
    { nimi: 'Nordic Host', laskutettava: 'Nordic Host', summa: 0, alkaa: '2026-11-01', paattyy: null },
  ],
  kaupat: [
    kauppa({ asiakas: 'Verkkosivuasiakas', tuote: 'Kertalasku', kerta: 1000, erat: [{ osuus: 1, pv: 0 }], seuraava: 'Laskuta', seuraavaPvm: '2026-11-02' }),
  ],
  laskut: [],
  liidit: [],
  pohjat: pohjat(),
}, muut || {});

test('pääsiäinen ja arkipyhät', () => {
  assert.equal(g.paasiainen(2025), '2025-04-20');
  assert.equal(g.paasiainen(2026), '2026-04-05');
  assert.equal(g.paasiainen(2027), '2027-03-28');
  const p26 = g.arkipyhat(2026);
  ['2026-04-03', '2026-04-06', '2026-05-14', '2026-06-19', '2026-12-24', '2026-12-25'].forEach((k) => assert.ok(p26.has(k), k));
  assert.ok(g.arkipyhat(2027).has('2027-06-25'));
  assert.equal(g.onArkipaiva('2026-12-24'), false);
  assert.equal(g.onArkipaiva('2026-11-02'), true);
  assert.equal(g.onArkipaiva('2026-11-07'), false);
});

test('arkipäivälaskenta', () => {
  assert.equal(g.arkipaiviaValilla('2026-11-02', '2026-11-30'), 21);
  assert.equal(g.arkipaiviaValilla('2026-12-01', '2026-12-31'), 21);
  assert.equal(g.lisaaArkipaivia('2026-11-06', 3), '2026-11-11');
  assert.equal(g.lisaaArkipaivia('2026-12-23', 1), '2026-12-28');
  assert.equal(g.kkLisaa('2026-11', 2), '2027-01');
  assert.equal(g.kkLisaa('2027-01', -1), '2026-12');
  assert.equal(g.kkViimeinen('2027-02'), '2027-02-28');
});

test('päivämäärät luetaan taulukon aikavyöhykkeellä', () => {
  // Helsingin keskiyö 1.12.2026 = 30.11.2026 klo 22 UTC
  assert.equal(g.pvAvain(new Date(Date.UTC(2026, 10, 30, 22))), '2026-12-01');
  assert.equal(g.pvAvain('1.12.2026'), '2026-12-01');
  assert.equal(g.pvAvain('12/2026'), '2026-12-01');
  assert.equal(g.pvAvain(''), null);
  assert.equal(g.pvAvain(g.pvmSolu('2027-03-01')), '2027-03-01');
});

test('marraskuun vaje ja myyntikoneen tahti lähtötilanteesta', () => {
  const t = g.laske(malli(), '2026-11-02');
  assert.equal(t.nyt.toistuvat, 11000);
  assert.equal(t.nyt.voitetut, 1000);
  assert.equal(t.nyt.varmistettu, 12000);
  assert.equal(t.nyt.vaje, 3000);
  assert.equal(t.ensi.varmistettu, 11000);
  assert.equal(t.kone.avoinVaje, 7000);
  assert.ok(Math.abs(t.kone.kaupat - 2.8) < 1e-9);
  assert.equal(t.kone.arkipaivat, 42);
  // 7000 / 2500 / 0,3 / 0,04 = 233,3 → 234 kontaktia / 42 arkipäivää → 6 / pv
  assert.equal(t.kone.kiintio, 6);
  assert.equal(t.kone.rajoitettu, false);
  assert.ok(Math.abs(t.keskittyma.osuus - 8000 / 12000) < 1e-9);
  assert.equal(t.keskittyma.nimi, 'Book Lapland');
  assert.ok(t.huomiot.some((h) => h.includes('Vaje') && h.includes('3')));
  assert.ok(t.huomiot.some((h) => h.includes('Suurin asiakas')));
});

test('putki: erät, kk-tulo ja kassa painotettuna', () => {
  const m = malli();
  m.kaupat.push(kauppa({ asiakas: 'Matkailu Oy', vaihe: 'Tarjous lähetetty', tod: 0.5, kerta: 3000, tilauspvm: '2026-11-10', kk: 150 }));
  const t = g.laske(m, '2026-11-02');
  assert.equal(t.nyt.putki, 750); // erä 1 17.11. → 1 500 × 0,5
  assert.equal(t.ensi.putki, 825); // erä 2 15.12. + kk-tulo joulukuusta → (1 500 + 150) × 0,5
  const tammi = t.kuukaudet.find((r) => r.kk === '2027-01');
  assert.equal(tammi.putki, 75);
  // Kassa: toistuvat ja marraskuun kertalasku tulevat marraskuussa, putken erät joulukuussa (maksuaika 14 pv)
  assert.equal(t.nyt.kassa, 12000);
  assert.equal(t.ensi.kassa, 11000 + 1500 + 75);
  assert.equal(t.nyt.kassaKumul, 12000);
  assert.equal(t.ensi.kassaKumul, 24575);
});

test('kaksi 2 000 € kauppaa: marraskuun puolivälissä ja joulukuun alussa → kassa kumuloituu', () => {
  const m = malli({ kaupat: [kauppa({ asiakas: 'A', tilauspvm: '2026-11-15' }), kauppa({ asiakas: 'B', tilauspvm: '2026-12-01' })] });
  const t = g.laske(m, '2026-11-02');
  const kk = (x) => t.kuukaudet.find((r) => r.kk === x);
  // Laskutus: A erä 1 22.11., A erä 2 20.12., B erä 1 8.12., B erä 2 5.1.
  assert.equal(kk('2026-11').voitetut, 1000);
  assert.equal(kk('2026-12').voitetut, 2000);
  assert.equal(kk('2027-01').voitetut, 1000);
  // Kassa: A:n 1. erä ja B:n 1. erä joulukuussa, toiset erät tammikuussa
  assert.equal(kk('2026-11').kassa, 11000);
  assert.equal(kk('2026-12').kassa, 11000 + 2000);
  assert.equal(kk('2027-01').kassa, 11000 + 2000);
  const at = g.kaupanAikataulu(m.kaupat[0], '2026-11-02', asetukset());
  assert.deepEqual(arr(at.erat.map((e) => [e.pvm, e.kassa, e.summa])), [['2026-11-22', '2026-12-06', 1000], ['2026-12-20', '2027-01-03', 1000]]);
});

test('avoimen kaupan arvioitu tilauspäivä', () => {
  const a = asetukset();
  assert.equal(g.tilausPaiva(kauppa({ vaihe: 'Liidi', tilauspvm: null, luotu: '2026-11-02' }), '2026-11-05', a), '2026-11-23');
  assert.equal(g.tilausPaiva(kauppa({ vaihe: 'Liidi', tilauspvm: '2026-11-03' }), '2026-11-05', a), '2026-11-05');
  assert.equal(g.tilausPaiva(kauppa({ vaihe: 'Voitettu', tilauspvm: '2026-10-20' }), '2026-11-05', a), '2026-10-20');
  assert.equal(g.tilausPaiva(kauppa({ vaihe: 'Voitettu', tilauspvm: null, luotu: null }), '2026-11-05', a), null);
  const t = g.laske(malli({ kaupat: [kauppa({ vaihe: 'Tarjous lähetetty', tod: 0.5, tilauspvm: '2026-11-01' })] }), '2026-11-10');
  assert.ok(t.huomiot.some((h) => h.includes('arvioitu tilauspäivä on mennyt')));
});

test('erät käsin: summat, prosentit ja virheet', () => {
  const e = g.puraErat('2000 € 30.11.2026; 1 000 € 15.12.2026', null);
  assert.deepEqual(arr(e.erat.map((x) => [x.pvm, x.summa])), [['2026-11-30', 2000], ['2026-12-15', 1000]]);
  assert.deepEqual(arr(g.puraErat('50 % 15.1.2027\n50% 1.12.2026', 3000).erat.map((x) => [x.pvm, x.summa])),
    [['2026-12-01', 1500], ['2027-01-15', 1500]]);
  assert.equal(g.puraErat('', 1000), null);
  assert.match(g.puraErat('2000 €', 1000).virhe, /päivämäärä/);
  assert.match(g.puraErat('50 % 1.12.2026', null).virhe, /kertatulon/);
});

test('käynnissä oleva projekti erät käsin: marraskuu 14 000, loppuerä joulukuulle, ei viikon kauppa', () => {
  const v = { Voitettu: 1 };
  const vanha = g.kaupanMalli({ asiakas: 'Vanha', tuote: '', vaihe: 'Voitettu', kerta: 3000, kk: null, tilauspvm: null, luotu: null,
    eratKasin: '2000 € 30.11.2026; 1000 € 15.12.2026' }, [], v);
  const m = malli({ asetukset: asetukset({ kauppojaViikossa: 1 }) });
  m.kaupat.push(vanha);
  const t = g.laske(m, '2026-11-02');
  assert.equal(t.nyt.varmistettu, 14000);
  assert.equal(t.nyt.vaje, 1000);
  assert.equal(t.ensi.voitetut, 1000);
  assert.equal(t.ensi.kassa, 11000 + 2000 + 1000); // 30.11. lasku → 14.12. tilillä
  assert.ok(t.viikot.every((w) => w.voitetut <= 1));
  assert.ok(!t.huomiot.some((h) => h.includes('ilman tilauspäivää')));
  const rivit = g.laskutusrivit(malli({ kaupat: [vanha] }), '2026-11', '2026-11-02');
  const viim = rivit.pop();
  assert.equal(viim.kuvaus, 'Kauppa – erä 1/2 (67 %)');
  assert.equal(viim.ajankohta, '2026-11-30');
  const virhe = g.kaupanMalli({ asiakas: 'X', vaihe: 'Voitettu', kerta: 100, kk: null, eratKasin: '100 €' }, [], v);
  assert.ok(g.laske(malli({ kaupat: [virhe] }), '2026-11-02').huomiot.some((h) => h.includes('Erät käsin')));
});

test('kuukauden oma viikkotavoite: marras–joulu 0, tammikuusta 1', () => {
  const tavoitteet = [{ kk: '2026-11', tavoite: 15000, kauppojaVk: 0 }, { kk: '2026-12', tavoite: 15000, kauppojaVk: 0 },
    { kk: '2027-01', tavoite: 15000, kauppojaVk: 1 }];
  const m = malli({ tavoitteet, asetukset: asetukset({ kauppojaViikossa: 1 }) });
  const marras = g.laske(m, '2026-11-18');
  assert.equal(marras.kone.tahtiViikosta, 0);
  assert.ok(marras.viikot.filter((w) => w.alku < '2026-12-28').every((w) => !w.tila.includes('✗')));
  assert.ok(!marras.huomiot.some((h) => h.startsWith('Viikko ')));
  const tammi = g.laske(m, '2027-01-13');
  assert.equal(tammi.kone.tahtiViikosta, 17);
  assert.equal(tammi.viikot.find((w) => w.viikko === 1).tila, '✗');
  assert.equal(tammi.tamaViikko.tavoite, 1);
});

test('kauppa saa hinnan ja aikataulun tuotteelta', () => {
  const tuotteet = [{ tuote: 'Verkkosivuprojekti', hinta: 2500, kk: 0, maksuaika: 14, erat: VERKKOSIVU },
    { tuote: 'Ylläpito ja hosting', hinta: 0, kk: 149, maksuaika: 14, erat: [] }];
  const v = { Voitettu: 1, Liidi: 0.1 };
  const k = g.kaupanMalli({ tuote: 'verkkosivuprojekti', kerta: null, kk: null, vaihe: 'Liidi' }, tuotteet, v);
  assert.equal(k.kerta, 2500);
  assert.equal(k.tod, 0.1);
  assert.equal(k.erat.length, 2);
  assert.equal(g.kaupanMalli({ tuote: 'Verkkosivuprojekti', kerta: 1800, kk: null, vaihe: 'Liidi' }, tuotteet, v).kerta, 1800);
  const yp = g.kaupanMalli({ tuote: 'Ylläpito ja hosting', kerta: null, kk: null, vaihe: 'Voitettu', tilauspvm: '2026-11-20' }, tuotteet, v);
  assert.equal(yp.kk, 149);
  yp._at = g.kaupanAikataulu(yp, '2026-11-02', asetukset());
  assert.equal(g.kaupanKuukausi(yp, '2026-11').laskutus, 149);
  assert.equal(g.kaupanKuukausi(yp, '2026-10').laskutus, 0);
  assert.equal(g.kaupanMalli({ tuote: 'Tuntematon', kerta: null, kk: null, vaihe: 'Liidi' }, tuotteet, v).tuoteLoytyi, false);
});

test('viikkoseuranta: tuliko kauppa ja mihin kuukausiin se osuu', () => {
  const m = malli({ kaupat: [
    kauppa({ asiakas: 'A', tilauspvm: '2026-11-04', luotu: '2026-11-02' }),
    kauppa({ asiakas: 'B', tilauspvm: '2026-11-17', kerta: 300, erat: [{ osuus: 1, pv: 3 }] }),
    kauppa({ asiakas: 'C', vaihe: 'Tarjous lähetetty', tod: 0.5, luotu: '2026-11-10', tilauspvm: null }),
  ], liidit: [liidi({ aloitettu: '2026-11-03', vaihe: 1, tila: 'Sekvenssissä' }), liidi({ aloitettu: '2026-11-11', vastausPvm: '2026-11-12', vaihe: 1, tila: 'Vastasi' })],
  asetukset: asetukset({ kauppojaViikossa: 1 }) });
  const t = g.laske(m, '2026-11-18');
  const vk = (n) => t.viikot.find((v) => v.viikko === n);
  assert.equal(t.viikot.length, 13);
  assert.equal(vk(45).voitetut, 1);
  assert.equal(vk(45).tila, '✓');
  assert.equal(vk(45).kontaktit, 1);
  assert.equal(vk(45).uudetKaupat, 1); // A (B luotu 1.11. = vk 44, C vk 46)
  assert.equal(vk(46).uudetKaupat, 1);
  assert.equal(vk(45).osuu, 'marras 1\u00a0000\u00a0€ · joulu 1\u00a0000\u00a0€');
  assert.equal(vk(46).voitetut, 0);
  assert.equal(vk(46).tila, '✗');
  assert.equal(vk(46).vastaukset, 1);
  assert.equal(vk(47).nykyinen, true);
  assert.equal(vk(47).tila, '✓ käynnissä');
  assert.equal(vk(47).kuunKaupat, 2); // A + B (tässä mallissa ei ole lähtötilanteen kauppaa)
  assert.equal(vk(45).kuunKaupat, 1);
  assert.equal(t.kuunKaupat, 2);
  assert.ok(t.huomiot.some((h) => h.startsWith('Viikko 46: 0 kauppaa')));
});

test('ISO-viikot', () => {
  assert.equal(g.isoViikko('2026-01-01'), 1);
  assert.equal(g.isoViikko('2026-11-02'), 45);
  assert.equal(g.isoViikko('2026-12-31'), 53);
  assert.equal(g.isoViikko('2027-01-01'), 53);
  assert.equal(g.isoViikko('2027-01-04'), 1);
  assert.equal(g.lyhytKk('2026-11'), 'marras');
});

test('viikkotavoite pitää tahdin vähintään 1 kauppa / vk -tasolla', () => {
  const t = g.laske(malli({ asetukset: asetukset({ kauppojaViikossa: 1 }) }), '2026-11-02');
  assert.equal(t.kone.tahtiVajeesta, 6);
  assert.equal(t.kone.tahtiViikosta, 17); // 1 / 0,3 / 0,04 / 5 = 16,7
  assert.equal(t.kone.kiintio, 17);
  const kk = g.laske(malli({ asetukset: asetukset({ kauppojaViikossa: 2 }) }), '2026-11-02');
  assert.equal(kk.kone.kiintio, 20);
  assert.equal(kk.kone.rajoitettu, true);
});

test('kuukausi katettu → kiintiö minimissä', () => {
  const m = malli();
  m.kaupat.push(kauppa({ asiakas: 'Iso', kerta: 8000, erat: [{ osuus: 0.5, pv: 0 }, { osuus: 0.5, pv: 30 }] }));
  const t = g.laske(m, '2026-11-02');
  assert.equal(t.kone.avoinVaje, 0);
  assert.equal(t.kone.kiintio, 3);
  assert.ok(t.huomiot[0].startsWith('✓'));
});

test('iso vaje lyhyellä ajalla → katto ja huomio', () => {
  const m = malli({ tavoitteet: [{ kk: '2026-12', tavoite: 60000 }] });
  const t = g.laske(m, '2026-12-28');
  assert.equal(t.kone.kiintio, 20);
  assert.equal(t.kone.rajoitettu, true);
  assert.ok(t.huomiot.some((h) => h.includes('ylittää katon')));
});

test('toteutuneet konversiot otetaan käyttöön kynnyksen jälkeen', () => {
  const liidit = [];
  for (let i = 0; i < 60; i++) liidit.push(liidi({ email: 'x' + i + '@a' + i + '.fi', tila: i < 3 ? 'Palaveri' : 'Ei vastausta', vaihe: 3 }));
  const t = g.laske(malli({ liidit }), '2026-11-02');
  assert.equal(t.konv.kontaktoidut, 60);
  assert.ok(Math.abs(t.konv.kp - 0.05) < 1e-9);
  const t2 = g.laske(malli({ liidit: liidit.slice(0, 59) }), '2026-11-02');
  assert.equal(t2.konv.kp, 0.04);
});

test('viestin muuttujat', () => {
  const a = asetukset();
  const p = pohjat()[1];
  const v = g.renderoiViesti(p, liidi({ etunimi: '', havainto: 'sivusto ei skaalaudu puhelimelle.' }), a, false);
  assert.equal(v.virhe, '');
  assert.equal(v.aihe, 'Yritys Oy / verkkosivut');
  assert.ok(v.viesti.startsWith('Hei,\n\nkävin (yritys.fi) ja huomasin, että sivusto ei skaalaudu puhelimelle. Referenssi.'));
  assert.ok(v.viesti.endsWith('Testi Myyjä\nYritys Oy'));
  assert.match(g.renderoiViesti(p, liidi({ havainto: '' }), a, false).virhe, /havainto/);
  assert.match(g.renderoiViesti(p, liidi(), asetukset({ nimi: '', allekirjoitus: '' }), false).virhe, /allekirjoitus/);
  assert.match(g.renderoiViesti(p, liidi(), asetukset({ nimi: '', allekirjoitus: '' }), true).viesti, /\[allekirjoitus puuttuu\]/);
  assert.equal(g.renderoiViesti(p, liidi(), asetukset({ referenssi: '' }), false).virhe, '');
  const ts = { aihe: 'x', viesti: 'Viesti.\n\n{{tietosuoja}}' };
  assert.equal(g.renderoiViesti(ts, liidi(), a, false).viesti, 'Viesti.');
  assert.equal(g.renderoiViesti(ts, liidi(), asetukset({ tietosuoja: 'Tietosuoja: x.fi/ts' }), false).viesti, 'Viesti.\n\nTietosuoja: x.fi/ts');
  assert.equal(g.renderoiViesti(ts, liidi(), a, true).viesti, 'Viesti.');
  assert.match(g.renderoiViesti({ aihe: '', viesti: '{{tuntematon}}' }, liidi(), a, false).virhe, /Tuntematon/);
});

test('segmentin omat pohjat ja oletuspohjat', () => {
  assert.equal(g.haePohja(pohjat(), 1, 'matkailu').segmentti, 'Matkailu');
  assert.equal(g.haePohja(pohjat(), 1, 'Yleinen').segmentti, '');
  assert.equal(g.haePohja(pohjat(), 3, 'Yleinen').viesti.startsWith('Viimeinen'), true);
  // Segmentillä on omia pohjia → sarja käyttää vain niitä ja loppuu niiden viimeiseen vaiheeseen
  assert.equal(g.haePohja(pohjat(), 3, 'Matkailu'), null);
  assert.equal(g.haePohja(pohjat(), 2, 'Verkosto').segmentti, 'Verkosto');
  assert.equal(g.haePohja(pohjat(), 3, 'Verkosto'), null);
  assert.equal(g.haePohja(pohjat(), 4, ''), null);
  assert.equal(g.haePohja(pohjat(), 'LinkedIn', '').vaihe, 'LinkedIn');
  assert.equal(g.tarvitseeHavainnon(g.haePohja(pohjat(), 1, 'Verkosto')), false);
  assert.equal(g.tarvitseeHavainnon(g.haePohja(pohjat(), 1, '')), true);
});

test('verkostoviesti lähtee ilman havaintoa ja yritystä, sarja loppuu kahteen viestiin', () => {
  const lid = [liidi({ _rivi: 2, yritys: '', email: 'ville@gmail.com', havainto: '', segmentti: 'Verkosto', etunimi: 'Ville' }),
    liidi({ _rivi: 3, email: 'kylma@x.fi', havainto: '' }),
    liidi({ _rivi: 4, email: 'tuttu@y.fi', segmentti: 'Verkosto', tila: 'Sekvenssissä', vaihe: 2, ketju: 't', seuraava: '2026-11-05' })];
  const s = g.suunnittele(malli({ liidit: lid }), 10, '2026-11-05', false);
  assert.deepEqual(arr(s.uudet.map((x) => x.liidi._rivi)), [2]);
  assert.equal(s.uudet[0].aihe, 'Pieni kysymys');
  assert.equal(s.uudet[0].viesti, 'Moi Ville, tiedätkö jonkun?\nTesti Myyjä');
  assert.deepEqual(arr(s.loppuneet.map((x) => x._rivi)), [4]);
  const t = g.laske(malli({ liidit: lid }), '2026-11-05');
  assert.equal(t.kone.odottaaHavaintoa, 1); // vain kylmä liidi
});

test('päivän suunnitelma: jatkot, uudet, tuplat ja yksi kontakti per yritys', () => {
  const lid = [
    liidi({ _rivi: 2, email: 'jo@kesken.fi', tila: 'Sekvenssissä', vaihe: 1, ketju: 't1', seuraava: '2026-11-05' }),
    liidi({ _rivi: 3, email: 'eiviela@kesken.fi', tila: 'Sekvenssissä', vaihe: 1, ketju: 't2', seuraava: '2026-11-09' }),
    liidi({ _rivi: 4, email: 'loppu@x.fi', tila: 'Sekvenssissä', vaihe: 3, ketju: 't3', seuraava: '2026-11-04' }),
    liidi({ _rivi: 5, email: 'toinen@kesken.fi' }), // sama yritys kuin rivi 2 → ohitetaan
    liidi({ _rivi: 6, email: 'uusi1@a.fi' }),
    liidi({ _rivi: 7, email: 'uusi1@a.fi' }), // sama osoite → tupla
    liidi({ _rivi: 8, email: 'eihavaintoa@b.fi', havainto: '', ehdotus: 'ehdotus tästä' }),
    liidi({ _rivi: 9, email: 'gmail1@gmail.com' }),
    liidi({ _rivi: 10, email: 'gmail2@gmail.com' }), // yleinen domain ei estä
    liidi({ _rivi: 11, email: 'matka@c.fi', segmentti: 'Matkailu' }),
    liidi({ _rivi: 12, email: 'ei-osoite' }),
  ];
  const s = g.suunnittele(malli({ liidit: lid }), 10, '2026-11-05', false);
  assert.deepEqual(arr(s.jatkot.map((x) => x.liidi._rivi)), [2]);
  assert.equal(s.jatkot[0].vaihe, 2);
  assert.deepEqual(arr(s.loppuneet.map((x) => x._rivi)), [4]);
  assert.deepEqual(arr(s.uudet.map((x) => x.liidi._rivi)), [6, 9, 10, 11]);
  assert.deepEqual(arr(s.tuplat.map((x) => x._rivi)), [7]);
  assert.equal(s.uudet[3].aihe, 'Yritys Oy / sivut ja varaukset');

  const auto = g.suunnittele(malli({ liidit: lid, asetukset: asetukset({ autoHavainto: true }) }), 10, '2026-11-05', false);
  assert.ok(auto.uudet.some((x) => x.liidi._rivi === 8 && x.viesti.includes('ehdotus tästä')));

  const kiintio2 = g.suunnittele(malli({ liidit: lid }), 2, '2026-11-05', false);
  assert.equal(kiintio2.uudet.length, 2);
  const katto = g.suunnittele(malli({ liidit: lid, asetukset: asetukset({ yhteensa: 2 }) }), 10, '2026-11-05', false);
  assert.equal(katto.uudet.length, 1);
});

test('luonnostilassa odottavat luonnokset vähennetään kiintiöstä', () => {
  const lid = [liidi({ _rivi: 2, email: 'a@1.fi', tila: 'Luonnos', vaihe: 0 }), liidi({ _rivi: 3, email: 'b@2.fi' }),
    liidi({ _rivi: 4, email: 'c@3.fi' })];
  const s = g.suunnittele(malli({ liidit: lid, asetukset: asetukset({ tila: 'LUONNOS' }) }), 2, '2026-11-05', false);
  assert.equal(s.uudet.length, 1);
});

test('LinkedIn- ja soittolista', () => {
  const lid = [
    liidi({ _rivi: 2, linkedin: 'https://www.linkedin.com/in/a', tila: 'Uusi' }),
    liidi({ _rivi: 3, linkedin: 'https://www.linkedin.com/in/b', tila: 'Sekvenssissä', vaihe: 1, aloitettu: '2026-11-02' }),
    liidi({ _rivi: 4, linkedin: 'https://www.linkedin.com/in/c', tila: 'Vastasi', vaihe: 1 }),
    liidi({ _rivi: 5, puhelin: '040 1', tila: 'Sekvenssissä', vaihe: 2 }),
    liidi({ _rivi: 6, puhelin: '040 2', tila: 'Sekvenssissä', vaihe: 1 }),
  ];
  const t = g.valitseTehtavat(malli({ liidit: lid }));
  assert.deepEqual(arr(t.li.map((l) => l._rivi)), [3, 2]);
  assert.deepEqual(arr(t.soitot.map((l) => l._rivi)), [5]);
});

test('ajanvarauslinkin rivi jätetään pois, jos linkkiä ei ole', () => {
  const p = { aihe: '', viesti: 'Hei {{etunimi}},\n\nnostan.\n\nVoit myös varata ajan: {{varauslinkki}}\n\n{{nimi}}' };
  assert.equal(g.renderoiViesti(p, liidi(), asetukset(), false).viesti, 'Hei Anna,\n\nnostan.\n\nTesti Myyjä');
  assert.equal(g.renderoiViesti(p, liidi(), asetukset({ varauslinkki: 'https://cal.example/x' }), false).viesti,
    'Hei Anna,\n\nnostan.\n\nVoit myös varata ajan: https://cal.example/x\n\nTesti Myyjä');
});

test('vanha asiakas: oma kahden viestin sarja havainnolla', () => {
  const vanha = { vaihe: 1, segmentti: 'Vanha asiakas', odota: 0, aihe: '{{yritys}} / sivujen kuntotarkastus', viesti: 'Moi {{etunimi}}, teimme yhteistyötä. Huomasin, että {{havainto}}.' };
  const pp = pohjat().concat([vanha, { vaihe: 2, segmentti: 'Vanha asiakas', odota: 4, aihe: '', viesti: 'Moi, nostan.' }]);
  assert.equal(g.haePohja(pp, 1, 'Vanha asiakas'), vanha);
  assert.equal(g.haePohja(pp, 3, 'Vanha asiakas'), null);
  const s = g.suunnittele(malli({ pohjat: pp, liidit: [liidi({ segmentti: 'Vanha asiakas', havainto: 'sivujen alalaidassa lukee vielä © 2019' })] }), 5, '2026-11-05', false);
  assert.equal(s.uudet[0].aihe, 'Yritys Oy / sivujen kuntotarkastus');
  assert.equal(s.uudet[0].viesti, 'Moi Anna, teimme yhteistyötä. Huomasin, että sivujen alalaidassa lukee vielä © 2019.');
});

test('kalenterin palaverit yhdistetään liideihin', () => {
  const lid = [liidi({ _rivi: 2, email: 'anna@yritys.fi', tila: 'Vastasi' }), liidi({ _rivi: 3, email: 'ben@b.fi', tila: 'Kauppa' }),
    liidi({ _rivi: 4, email: 'cec@c.fi', tila: 'Sekvenssissä' }), liidi({ _rivi: 5, email: 'dan@d.fi', tila: 'Älä ota yhteyttä' })];
  const tap = [
    { alku: '2026-11-20', otsikko: 'Palaveri', osallistujat: ['Anna@Yritys.fi', 'mina@x.fi'] },
    { alku: '2026-11-12', otsikko: 'Aiempi', osallistujat: ['anna@yritys.fi'] },
    { alku: '2026-11-13', otsikko: 'X', osallistujat: ['ben@b.fi', 'dan@d.fi'] },
    { alku: '2026-11-14', otsikko: 'Y', osallistujat: ['cec@c.fi'] },
  ];
  const l = g.palaveritKalenterista(lid, tap);
  assert.deepEqual(arr(l.map((x) => [x.liidi._rivi, x.tapahtuma.alku])), [[2, '2026-11-12'], [4, '2026-11-14']]);
});

test('PageSpeed: purku ja havainto', () => {
  const json = { lighthouseResult: { categories: { performance: { score: 0.34 } }, audits: { 'largest-contentful-paint': { numericValue: 7800 } } } };
  assert.deepEqual(Object.assign({}, g.puraPageSpeed(json)), { pisteet: 34, lcp: 7.8 });
  assert.equal(g.puraPageSpeed({}), null);
  const html = '<meta name="viewport" content="x"><meta name="description" content="Hyvä kuvaus yrityksestämme tässä">';
  const t = g.analysoiSivu(html, { https: true, pagespeed: 34, lcp: 7.8 }, 'Yleinen', 2026);
  assert.match(t.signaalit, /PageSpeed mobiili 34\/100, LCP 7,8 s/);
  assert.equal(t.havainto, 'sivujen mobiilinopeus on Googlen PageSpeed-mittauksessa vain 34/100 ja etusivu latautuu puhelimella noin 8 sekunnissa');
  assert.equal(g.analysoiSivu(html, { https: true, pagespeed: 82 }, 'Yleinen', 2026).havainto, '');
});

test('vastausten luokittelu', () => {
  assert.equal(g.luokitteleVastaus('Mail Delivery Subsystem <mailer-daemon@googlemail.com>', 'Delivery Status Notification (Failure)', ''), 'pomppu');
  assert.equal(g.luokitteleVastaus('Anna <anna@yritys.fi>', 'Automaattinen vastaus: Yritys Oy / verkkosivut', ''), 'automaattinen');
  assert.equal(g.luokitteleVastaus('Anna <anna@yritys.fi>', 'Re: Yritys Oy / verkkosivut', 'auto-replied'), 'automaattinen');
  assert.equal(g.luokitteleVastaus('Anna <anna@yritys.fi>', 'Re: Yritys Oy / verkkosivut', ''), 'vastaus');
  assert.equal(g.onOma('"Minä" <Mina@Booklapland.fi>', new Set(['mina@booklapland.fi'])), true);
  assert.equal(g.onOma('anna@yritys.fi', new Set(['mina@booklapland.fi'])), false);
});

test('sivuston analyysi: matkailusivu ohjaa Booking.comiin', () => {
  const html = '<html lang="fi"><head><meta name="viewport" content="width=device-width">' +
    '<meta name="description" content="Revontuliretket ja mökit Lapissa ympäri vuoden"></head>' +
    '<body><a href="https://www.booking.com/hotel/fi/x.html">Varaa</a><footer>© 2019 Mökit Oy</footer>' +
    '<link href="/wp-content/themes/x.css"></body></html>';
  const t = g.analysoiSivu(html, { https: true, ms: 1200, tavut: 50000 }, 'Matkailu', 2026);
  assert.match(t.signaalit, /ohjaa: Booking\.com/);
  assert.match(t.signaalit, /© 2019/);
  assert.match(t.signaalit, /ei englantia/);
  assert.match(t.signaalit, /WordPress/);
  assert.equal(t.havainto, 'varaukset ohjautuvat sivuilta Booking.comiin, jolloin jokaisesta varauksesta lähtee välityspalkkio');
});

test('sivuston analyysi: järjestys https → mobiili → vuosi', () => {
  assert.match(g.analysoiSivu('<html></html>', { https: false }, 'Yleinen', 2026).havainto, /https/);
  assert.equal(g.analysoiSivu('<html></html>', { https: true }, 'Yleinen', 2026).havainto, 'sivusto ei skaalaudu puhelimen näytölle');
  const vanha = '<meta name="viewport" content="x"><meta name="description" content="Hyvä kuvaus yrityksestämme tässä"><p>Copyright 2017–2021 Firma</p>';
  assert.equal(g.analysoiSivu(vanha, { https: true }, 'Yleinen', 2026).havainto, 'sivujen alalaidassa lukee vielä © 2021');
  const bokun = '<html lang="en"><meta name="viewport" content="x"><meta name="description" content="Northern lights tours in Rovaniemi"><script src="https://widgets.bokun.io/x.js"></script>© 2026</html>';
  const b = g.analysoiSivu(bokun, { https: true, ms: 500 }, 'Matkailu', 2026);
  assert.match(b.signaalit, /varausjärjestelmä: bokun/);
  assert.equal(b.havainto, '');
  assert.match(g.analysoiSivu('', { virhe: 'HTTP 403' }, '', 2026).signaalit, /Ei auennut: HTTP 403/);
});

test('osoitteiden käsittely', () => {
  assert.equal(g.normalisoiUrl('yritys.fi'), 'https://yritys.fi');
  assert.equal(g.lyhytDomain('https://www.Yritys.fi/fi/etusivu?x=1'), 'yritys.fi');
  assert.equal(g.absoluuttinen('https://a.fi/fi/sivu', '/en/'), 'https://a.fi/en/');
  assert.equal(g.absoluuttinen('http://a.fi/fi/sivu', 'https://b.fi/'), 'https://b.fi/');
  assert.equal(g.absoluuttinen('https://a.fi/fi/sivu', 'toinen'), 'https://a.fi/fi/toinen');
  assert.equal(g.absoluuttinen('https://a.fi', '//cdn.a.fi/x'), 'https://cdn.a.fi/x');
  assert.equal(g.onEmail('anna@yritys.fi'), true);
  assert.equal(g.onEmail('anna@yritys'), false);
  assert.equal(g.domain('Anna@Yritys.FI'), 'yritys.fi');
});

test('MIME-viesti: ääkköset ja ketjutus', () => {
  const mime = g.rakennaMime({ to: 'anna@yritys.fi', fromName: 'Myyjä Määttä', fromEmail: 'mina@x.fi',
    subject: 'Yritys Oy / sivut ja varaukset – kysymys', body: 'Hei,\n\nhyvää päivää äö.', inReplyTo: '<abc@mail>', references: '<abc@mail>' });
  const [otsakkeet, runko] = mime.split('\r\n\r\n');
  assert.match(otsakkeet, /^From: =\?UTF-8\?B\?/);
  assert.match(otsakkeet, /\r\nTo: anna@yritys\.fi\r\n/);
  assert.match(otsakkeet, /In-Reply-To: <abc@mail>/);
  assert.equal(/[^\x00-\x7f]/.test(mime), false);
  const aihe = otsakkeet.match(/Subject: ([\s\S]*?)\r\nIn-Reply-To/)[1].split('\r\n ')
    .map((p) => Buffer.from(p.replace(/^=\?UTF-8\?B\?|\?=$/g, ''), 'base64').toString('utf8')).join('');
  assert.equal(aihe, 'Yritys Oy / sivut ja varaukset – kysymys');
  assert.equal(Buffer.from(runko.replace(/\r\n/g, ''), 'base64').toString('utf8'), 'Hei,\r\n\r\nhyvää päivää äö.');
  assert.ok(runko.split('\r\n').every((r) => r.length <= 76));
  assert.match(g.rakennaMime({ to: 'a@b.fi', fromName: 'Ascii Name', fromEmail: 'm@x.fi', subject: 'Hi', body: 'x' }), /^From: "Ascii Name" <m@x\.fi>/);
});

test('laskutuslista: toistuvat, voitettujen kauppojen erät ja kuukausimaksut', () => {
  const m = malli();
  m.kaupat.push(kauppa({ asiakas: 'Matkailu Oy', kuvaus: 'Sivusto', kerta: 3000, tilauspvm: '2026-11-10', kk: 150, kkAlkaa: '2027-01-01' }));
  m.kaupat.push(kauppa({ asiakas: 'Auki Oy', vaihe: 'Tarjous lähetetty', tod: 0.5, kerta: 3000, tilauspvm: '2026-11-10' }));
  const marras = g.laskutusrivit(m, '2026-11', '2026-11-02');
  assert.deepEqual(arr(marras.map((r) => r.summa)), [8000, 2000, 1000, 1000, 1500]);
  assert.equal(marras[4].kuvaus, 'Sivusto – erä 1/2 (50 %)');
  assert.equal(marras[4].ajankohta, '2026-11-17');
  assert.equal(marras[3].kuvaus, 'Verkkosivuprojekti');
  assert.equal(marras[0].ajankohta, '2026-11-01');
  assert.equal(new Set(marras.map((r) => r.tunniste)).size, marras.length);
  assert.deepEqual(arr(g.laskutusrivit(m, '2026-12', '2026-11-02').map((r) => r.summa)), [8000, 2000, 1000, 1500]);
  assert.deepEqual(arr(g.laskutusrivit(m, '2027-01', '2026-11-02').map((r) => r.summa)), [8000, 2000, 1000, 150]);
});

test('laskutettu lasketaan vain lähetetyistä ja maksetuista', () => {
  const m = malli({ laskut: [
    { kk: '2026-10', summa: 9000, tila: 'Maksettu' },
    { kk: '2026-11', summa: 8000, tila: 'Lähetetty' }, { kk: '2026-11', summa: 2000, tila: 'Laskuttamatta', ajankohta: '2026-11-01' },
    { kk: '2026-11', summa: 3000, tila: 'Laskuttamatta', ajankohta: '2026-11-30' },
    { kk: '2026-11', summa: 500, tila: 'Peruttu' },
  ], tavoitteet: [{ kk: '2026-10', tavoite: 15000 }, { kk: '2026-11', tavoite: 15000 }] });
  const t = g.laske(m, '2026-11-20');
  assert.equal(t.nyt.laskutettu, 8000);
  assert.equal(t.laskuttamatta.summa, 2000);
  const loka = t.kuukaudet.find((r) => r.kk === '2026-10');
  assert.match(loka.tila, /^✗ Jäi 6/);
});

test('kooste rakentuu ja aiheessa on tilanne', () => {
  const t = g.laske(malli(), '2026-11-02');
  const raportti = { lahetetyt: [], luonnokset: [], jatkot: [], vastaukset: [{ liidi: liidi(), linkki: 'https://mail.google.com/x', ote: 'Kiinnostaa <kyllä>' }],
    pomput: [], loppuneet: [], tuplat: [], virheet: [], esikatselu: [], linkedin: [], soitot: [{ liidi: liidi({ puhelin: '040 123 4567' }) }], tarkistetut: 0 };
  const k = g.rakennaKooste(t, raportti, asetukset(), true, 'https://docs.google.com/x');
  assert.match(k.aihe, /^Laskutusmoottori ma 2\.11\.2026: marraskuu 2026 12 000 € \/ 15 000 € \(vaje 3 000 €\) · 1 vastausta$/);
  assert.match(k.html, /Kiinnostaa &lt;kyllä&gt;/);
  assert.match(k.html, /tel:0401234567/);
  assert.match(k.html, /Viikkoraportti: kuukaudet/);
  assert.doesNotMatch(k.teksti, /<\/?(p|div|h3|table|tr|td|th|ul|li|a|br|span|b)[ >]/);
  assert.match(k.teksti, /Kiinnostaa <kyllä>/);
  assert.match(k.teksti, /Tavoite 15\u00a0000\u00a0€/);
});

test('luvut ja muotoilut', () => {
  assert.equal(g.luku('2 500,50 €'), 2500.5);
  assert.equal(g.luku('4%'), 4);
  assert.equal(g.luku(''), 0);
  assert.equal(g.eur(15000), '15 000 €');
  assert.equal(g.pct(0.045), '4,5 %');
  assert.equal(g.kkNimi('2026-11'), 'marraskuu 2026');
  assert.equal(g.sarakeKirjain(4), 'D');
  assert.equal(g.sarakeKirjain(28), 'AB');
});
