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
}, muut || {});

const pohjat = () => [
  { vaihe: 1, segmentti: 'Matkailu', odota: 0, aihe: '{{yritys}} / sivut ja varaukset', viesti: 'Hei {{etunimi}},\n\nhuomasin, että {{havainto}}. M\n\n{{allekirjoitus}}' },
  { vaihe: 1, segmentti: '', odota: 0, aihe: '{{yritys}} / verkkosivut', viesti: 'Hei {{etunimi}},\n\nkävin ({{sivusto}}) ja huomasin, että {{havainto}}. {{referenssi}}\n\n{{allekirjoitus}}' },
  { vaihe: 2, segmentti: '', odota: 3, aihe: '', viesti: 'Hei {{etunimi}}, nostan.\n{{nimi}}' },
  { vaihe: 3, segmentti: '', odota: 5, aihe: '', viesti: 'Viimeinen.\n{{nimi}}' },
  { vaihe: 'LinkedIn', segmentti: '', odota: 0, aihe: '', viesti: 'Hei {{etunimi}}, {{havainto}}.' },
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
    { asiakas: 'Verkkosivuasiakas', kuvaus: 'Verkkosivuprojekti', vaihe: 'Voitettu', tod: 1, kerta: 1000,
      lasku1: '2026-11-01', lasku2: null, kk: 0, kkAlkaa: null, kkPaattyy: null, seuraava: 'Laskuta', seuraavaPvm: '2026-11-02' },
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

test('putki, 50/50-laskutus ja kk-tulo', () => {
  const m = malli();
  m.kaupat.push({ asiakas: 'Matkailu Oy', kuvaus: 'Sivusto', vaihe: 'Tarjous lähetetty', tod: 0.5, kerta: 3000,
    lasku1: '2026-11-15', lasku2: '2026-12-10', kk: 150, kkAlkaa: null, kkPaattyy: null, seuraava: 'Soita', seuraavaPvm: '2026-11-05' });
  const t = g.laske(m, '2026-11-02');
  assert.equal(t.nyt.putki, 750); // 1500 × 0,5
  assert.equal(t.ensi.putki, 825); // (1500 + 150) × 0,5
  const tammi = t.kuukaudet.find((r) => r.kk === '2027-01');
  assert.equal(tammi.putki, 75);
  assert.equal(g.kauppaKuussa({ kerta: 2000, lasku1: '2026-11-01', lasku2: null, kk: 0 }, '2026-11'), 2000);
  assert.equal(g.kauppaKuussa({ kerta: 0, lasku1: '2026-11-01', lasku2: null, kk: 200, kkAlkaa: '2027-01-01', kkPaattyy: '2027-03-01' }, '2027-04'), 0);
  assert.equal(g.kauppaKuussa({ kerta: 0, lasku1: '2026-11-01', lasku2: null, kk: 200, kkAlkaa: '2027-01-01', kkPaattyy: '2027-03-01' }, '2027-03'), 200);
});

test('kuukausi katettu → kiintiö minimissä', () => {
  const m = malli();
  m.kaupat.push({ asiakas: 'Iso', kuvaus: 'Projekti', vaihe: 'Voitettu', tod: 1, kerta: 8000, lasku1: '2026-11-01', lasku2: '2026-12-01', kk: 0 });
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
  assert.match(g.renderoiViesti({ aihe: '', viesti: '{{tuntematon}}' }, liidi(), a, false).virhe, /Tuntematon/);
});

test('segmentin oma pohja ja oletuspohja', () => {
  assert.equal(g.haePohja(pohjat(), 1, 'matkailu').segmentti, 'Matkailu');
  assert.equal(g.haePohja(pohjat(), 1, 'Yleinen').segmentti, '');
  assert.equal(g.haePohja(pohjat(), 3, 'Matkailu').viesti.startsWith('Viimeinen'), true);
  assert.equal(g.haePohja(pohjat(), 4, ''), null);
  assert.equal(g.haePohja(pohjat(), 'LinkedIn', '').vaihe, 'LinkedIn');
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

test('laskutuslista: toistuvat ja voitetut kaupat', () => {
  const m = malli();
  m.kaupat.push({ asiakas: 'Matkailu Oy', kuvaus: 'Sivusto', vaihe: 'Voitettu', tod: 1, kerta: 3000,
    lasku1: '2026-11-15', lasku2: '2026-12-10', kk: 150, kkAlkaa: '2027-01-01', kkPaattyy: null });
  m.kaupat.push({ asiakas: 'Auki Oy', kuvaus: 'Sivusto', vaihe: 'Tarjous lähetetty', tod: 0.5, kerta: 3000, lasku1: '2026-11-15' });
  const marras = g.laskutusrivit(m, '2026-11');
  assert.deepEqual(arr(marras.map((r) => r.summa)), [8000, 2000, 1000, 1000, 1500]);
  assert.equal(new Set(marras.map((r) => r.tunniste)).size, marras.length);
  assert.deepEqual(arr(g.laskutusrivit(m, '2027-01').map((r) => r.summa)), [8000, 2000, 1000, 150]);
});

test('laskutettu lasketaan vain lähetetyistä ja maksetuista', () => {
  const m = malli({ laskut: [
    { kk: '2026-10', summa: 9000, tila: 'Maksettu' },
    { kk: '2026-11', summa: 8000, tila: 'Lähetetty' }, { kk: '2026-11', summa: 2000, tila: 'Laskuttamatta' },
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
