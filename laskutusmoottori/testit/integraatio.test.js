// Ajaa koko polun (asennus → liidit → aamuajo → vastaus → jatkoviesti → luonnos → kauppa)
// muistinvaraista Sheets- ja Gmail-jäljitelmää vasten. Aja: node --test "laskutusmoottori/testit/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// ───────── Sheets-jäljitelmä ─────────
const kirjain = (s) => s.split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
function a1(s) {
  const m = s.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
  if (!m) throw new Error('A1 ' + s);
  const r = Number(m[2]);
  const c = kirjain(m[1]);
  return m[3] ? [r, c, Number(m[4]) - r + 1, kirjain(m[3]) - c + 1] : [r, c, 1, 1];
}

class Range {
  constructor(sh, r, c, nr, nc) {
    if (r < 1 || c < 1 || nr < 1 || nc < 1) throw new Error(`Virheellinen alue ${r},${c},${nr},${nc}`);
    Object.assign(this, { sh, r, c, nr, nc });
  }
  getValues() {
    const out = [];
    for (let i = 0; i < this.nr; i++) {
      const row = [];
      for (let j = 0; j < this.nc; j++) row.push(this.sh.get(this.r + i, this.c + j));
      out.push(row);
    }
    return out;
  }
  getValue() { return this.sh.get(this.r, this.c); }
  setValues(v) {
    if (v.length !== this.nr) throw new Error(`Rivimäärä ${v.length} ≠ alueen ${this.nr}`);
    v.forEach((row, i) => {
      if (row.length !== this.nc) throw new Error(`Sarakemäärä ${row.length} ≠ alueen ${this.nc}`);
      row.forEach((x, j) => this.sh.set(this.r + i, this.c + j, x));
    });
    return this;
  }
  setValue(x) { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sh.set(this.r + i, this.c + j, x); return this; }
  setFormula(f) {
    const m = String(f).match(/^=\{"([^"]+)";/);
    this.sh.set(this.r, this.c, m ? m[1] : '#KAAVA');
    this.sh.kaavat[this.r + ',' + this.c] = f;
    return this;
  }
  clear() { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sh.set(this.r + i, this.c + j, ''); return this; }
  insertCheckboxes() { return this.setValue(false); }
  getRow() { return this.r; }
  getLastRow() { return this.r + this.nr - 1; }
  getSheet() { return this.sh; }
}
['setFontWeight', 'setBackground', 'setFontColor', 'setWrap', 'setVerticalAlignment', 'setHorizontalAlignment',
  'setNumberFormat', 'setDataValidation', 'setNote', 'setFontSize'].forEach((m) => { Range.prototype[m] = function () { return this; }; });

class Sheet {
  constructor(ss, name) { Object.assign(this, { ss, name, solut: new Map(), maxRows: 1000, maxCols: 26, kaaviot: [], kaavat: {}, aktiivinen: null }); }
  get(r, c) { const v = this.solut.get(r + ',' + c); return v === undefined ? '' : v; }
  set(r, c, v) {
    if (c > this.maxCols) throw new Error(`${this.name}: sarake ${c} > ${this.maxCols}`);
    if (v === '' || v === null || v === undefined) this.solut.delete(r + ',' + c); else this.solut.set(r + ',' + c, v);
  }
  getName() { return this.name; }
  getRange(r, c, nr, nc) {
    if (typeof r === 'string') return new Range(this, ...a1(r));
    return new Range(this, r, c, nr || 1, nc || 1);
  }
  getLastRow() { let m = 0; for (const k of this.solut.keys()) m = Math.max(m, Number(k.split(',')[0])); return m; }
  getLastColumn() { let m = 0; for (const k of this.solut.keys()) m = Math.max(m, Number(k.split(',')[1])); return m; }
  getMaxRows() { return this.maxRows; }
  getMaxColumns() { return this.maxCols; }
  deleteColumns(alku, n) { this.maxCols -= n; for (const k of [...this.solut.keys()]) if (Number(k.split(',')[1]) >= alku) this.solut.delete(k); }
  deleteRows(alku, n) {
    const uusi = new Map();
    for (const [k, v] of this.solut) {
      const [r, c] = k.split(',').map(Number);
      if (r < alku) uusi.set(k, v); else if (r >= alku + n) uusi.set((r - n) + ',' + c, v);
    }
    this.solut = uusi;
  }
  appendRow(rivi) { const r = this.getLastRow() + 1; rivi.forEach((v, j) => this.set(r, j + 1, v)); return this; }
  newChart() {
    const b = { kaavio: true };
    ['asComboChart', 'addRange', 'setNumHeaders', 'setOption', 'setPosition'].forEach((m) => { b[m] = () => b; });
    b.build = () => b;
    return b;
  }
  insertChart(k) { this.kaaviot.push(k); }
  getActiveRange() { return this.aktiivinen; }
  setActiveRange(r) { this.aktiivinen = r; return r; }
}
['setFrozenRows', 'setRowHeight', 'setColumnWidth', 'setColumnWidths', 'setHiddenGridlines'].forEach((m) => { Sheet.prototype[m] = function () { return this; }; });

class Spreadsheet {
  constructor() { this.sheets = [new Sheet(this, 'Taulukko1')]; this.nimetyt = {}; this.aktiivinen = this.sheets[0]; this.toastit = []; }
  getSheetByName(n) { return this.sheets.find((s) => s.name === n) || null; }
  insertSheet(n, i) { const s = new Sheet(this, n); this.sheets.splice(i, 0, s); return s; }
  getSheets() { return this.sheets.slice(); }
  deleteSheet(s) { this.sheets = this.sheets.filter((x) => x !== s); }
  getRange(s) { const [n, r] = s.split('!'); return this.getSheetByName(n).getRange(r); }
  setNamedRange(n, r) { this.nimetyt[n] = r; }
  getSpreadsheetTimeZone() { return 'Europe/Helsinki'; }
  setSpreadsheetTimeZone() {}
  setSpreadsheetLocale() {}
  toast(m) { this.toastit.push(m); }
  getUrl() { return 'https://docs.google.com/spreadsheets/d/testi'; }
  getName() { return 'Laskutusmoottori'; }
  setActiveSheet(s) { this.aktiivinen = s; return s; }
  getActiveSheet() { return this.aktiivinen; }
}

// ───────── Gmail-jäljitelmä ─────────
function uusiGmail(oma, kello) {
  const ketjut = new Map();
  const luonnokset = new Map();
  const lahetetytKoosteet = [];
  let n = 0;
  const viesti = (o) => ({
    o,
    getFrom: () => o.from, getDate: () => o.date, isDraft: () => !!o.draft, getSubject: () => o.subject,
    getHeader: (h) => (o.headers || {})[h] || '', getPlainBody: () => o.body,
  });
  const ketju = (id) => {
    if (!ketjut.has(id)) ketjut.set(id, []);
    return { getId: () => id, getMessages: () => ketjut.get(id).map(viesti), getPermalink: () => 'https://mail.google.com/mail/#all/' + id };
  };
  const pura = (raw) => {
    const mime = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const [ots, runko] = mime.split('\r\n\r\n');
    const h = {};
    ots.replace(/\r\n /g, ' ').split('\r\n').forEach((r) => { const i = r.indexOf(':'); h[r.slice(0, i)] = r.slice(i + 1).trim(); });
    const sana = (s) => s.split(' ').map((p) => (/^=\?UTF-8\?B\?/.test(p) ? Buffer.from(p.slice(10, -2), 'base64').toString('utf8') : p)).join(/=\?UTF-8/.test(s) ? '' : ' ');
    return { headers: h, to: h.To, subject: sana(h.Subject), body: Buffer.from(runko.replace(/\r\n/g, ''), 'base64').toString('utf8').replace(/\r\n/g, '\n') };
  };
  const lisaa = (resurssi, draft) => {
    const p = pura(resurssi.raw || resurssi.message.raw);
    const tid = resurssi.threadId || (resurssi.message && resurssi.message.threadId) || 't' + (++n);
    const o = { id: 'm' + (++n), from: 'Myyjä <' + oma + '>', to: p.to, subject: p.subject, body: p.body, draft,
      date: new Date(kello.t), headers: Object.assign({}, p.headers, { 'Message-ID': '<m' + n + '@mail>' }) };
    ketju(tid);
    ketjut.get(tid).push(o);
    return { o, tid };
  };
  return {
    ketjut, luonnokset, lahetetytKoosteet,
    vastaa(tid, from, subject, body, headers) {
      ketjut.get(tid).push({ id: 'v' + (++n), from, subject, body, date: new Date(kello.t), headers: headers || {} });
    },
    lahetaLuonnos(id) { const o = luonnokset.get(id); o.draft = false; o.date = new Date(kello.t); luonnokset.delete(id); },
    Gmail: {
      Users: {
        Messages: { send: (r) => { const { o, tid } = lisaa(r, false); return { id: o.id, threadId: tid }; } },
        Drafts: {
          create: (r) => { const { o, tid } = lisaa(r, true); const id = 'r' + (++n); luonnokset.set(id, o); return { id, message: { id: o.id, threadId: tid } }; },
          get: (u, id) => { if (!luonnokset.has(id)) throw new Error('404'); return { id }; },
          remove: (u, id) => { const o = luonnokset.get(id); if (o) { luonnokset.delete(id); for (const l of ketjut.values()) { const i = l.indexOf(o); if (i >= 0) l.splice(i, 1); } } },
        },
      },
    },
    GmailApp: {
      getThreadById: (id) => (ketjut.has(id) ? ketju(id) : null),
      search: (q) => {
        const to = (q.match(/to:(\S+)/) || [])[1];
        for (const [id, l] of ketjut) if (l.some((o) => !o.draft && o.to === to)) return [ketju(id)];
        return [];
      },
      getAliases: () => [],
      sendEmail: (to, subject, body, opts) => lahetetytKoosteet.push({ to, subject, body, html: opts.htmlBody }),
    },
  };
}

function ymparisto() {
  const koodi = fs.readFileSync(path.join(__dirname, '..', 'laskutusmoottori.gs'), 'utf8');
  const ss = new Spreadsheet();
  const oma = 'mina@booklapland.fi';
  const kello = { t: Date.now() };
  const gm = uusiGmail(oma, kello);
  const props = {};
  const triggerit = [];
  const dialogit = [];
  const sivut = {};
  const muoto = (d, tz, f) => {
    const o = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).forEach((p) => { o[p.type] = p.value; });
    return f.replace('yyyy', o.year).replace('MM', o.month).replace('dd', o.day)
      .replace('d.M', Number(o.day) + '.' + Number(o.month)).replace('HH', o.hour).replace('mm', o.minute);
  };
  const validointi = () => { const b = {}; ['requireValueInList', 'requireValueInRange', 'setAllowInvalid', 'requireDate', 'setHelpText'].forEach((m) => { b[m] = () => b; }); b.build = () => ({}); return b; };
  const ctx = {
    console,
    Logger: { log: () => {} },
    Utilities: {
      Charset: { UTF_8: 'UTF-8' },
      formatDate: muoto,
      base64Encode: (s) => Buffer.from(String(s), 'utf8').toString('base64'),
      base64EncodeWebSafe: (s) => Buffer.from(String(s), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss, getActive: () => ss, newDataValidation: validointi,
      getUi: () => {
        const ui = { createMenu: () => ui, addItem: () => ui, addSeparator: () => ui, addToUi: () => ui, showModalDialog: (h, t) => dialogit.push({ html: h.html, t }) };
        return ui;
      },
    },
    HtmlService: { createHtmlOutput: (html) => { const o = { html, setWidth: () => o, setHeight: () => o }; return o; } },
    Session: { getActiveUser: () => ({ getEmail: () => oma }), getEffectiveUser: () => ({ getEmail: () => oma }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = v; } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    ScriptApp: {
      getProjectTriggers: () => triggerit.slice(),
      deleteTrigger: (t) => triggerit.splice(triggerit.indexOf(t), 1),
      newTrigger: (fn) => { const b = { tunti: null }; b.timeBased = () => b; b.everyDays = () => b; b.atHour = (h) => { b.tunti = h; return b; }; b.inTimezone = () => b; b.create = () => { triggerit.push({ getHandlerFunction: () => fn, tunti: b.tunti }); }; return b; },
    },
    UrlFetchApp: {
      fetch: (url) => {
        const s = sivut[url];
        if (!s) throw new Error('DNS error: ' + url);
        return { getResponseCode: () => s.koodi || 200, getHeaders: () => s.otsakkeet || {}, getContentText: () => s.html || '', getContent: () => Buffer.from(s.html || '') };
      },
    },
    Gmail: gm.Gmail,
    GmailApp: gm.GmailApp,
  };
  vm.createContext(ctx);
  vm.runInContext(`
    const __OikeaDate = Date;
    globalThis.__nyt = null;
    globalThis.Date = class extends __OikeaDate {
      constructor(...a) { if (a.length) super(...a); else super(globalThis.__nyt === null ? __OikeaDate.now() : globalThis.__nyt); }
      static now() { return globalThis.__nyt === null ? __OikeaDate.now() : globalThis.__nyt; }
    };`, ctx);
  vm.runInContext(koodi, ctx, { filename: 'laskutusmoottori.gs' });
  const aika = (iso) => { ctx.__nyt = Date.parse(iso); kello.t = ctx.__nyt; };
  const solu = (nimi, a1s) => ss.getSheetByName(nimi).getRange(a1s).getValue();
  const taulu = (nimi) => {
    const sh = ss.getSheetByName(nimi);
    const arvot = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), sh.getLastColumn()).getValues();
    const ots = arvot[0];
    return arvot.slice(1).map((r) => Object.fromEntries(ots.map((o, i) => [o, r[i]])));
  };
  const asetus = (otsikko, arvo) => {
    const sh = ss.getSheetByName('Asetukset');
    for (let r = 2; r <= sh.getLastRow(); r++) if (sh.get(r, 1) === otsikko) { sh.set(r, 2, arvo); return; }
    throw new Error('asetus ' + otsikko);
  };
  const liita = (rivit) => {
    const sh = ss.getSheetByName('Liidit');
    const ots = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const alku = sh.getLastRow() + 1;
    rivit.forEach((o, i) => Object.keys(o).forEach((k) => {
      const c = ots.indexOf(k);
      if (c < 0) throw new Error('sarake ' + k);
      sh.set(alku + i, c + 1, o[k]);
    }));
    const range = sh.getRange(alku, 1, rivit.length, ots.length);
    ctx.onEdit({ range, source: ss });
    return alku;
  };
  return { ctx, ss, gm, props, triggerit, dialogit, sivut, aika, solu, taulu, asetus, liita };
}

test('koko polku: asennus, aamuajo, vastaus, jatkoviesti, luonnos ja kauppa', () => {
  const y = ymparisto();
  y.aika('2026-11-01T13:00:00Z'); // sunnuntai
  y.ctx.asenna();

  // Välilehdet ja lähtötilanne
  assert.deepEqual(y.ss.getSheets().map((s) => s.name),
    ['Kojelauta', 'Kaupat', 'Liidit', 'Laskut', 'Toistuvat', 'Tavoitteet', 'Viestipohjat', 'Asetukset', 'Loki']);
  assert.equal(y.solu('Kojelauta', 'A3'), 'MARRASKUU 2026');
  assert.equal(y.solu('Kojelauta', 'B4'), 15000);
  assert.equal(y.solu('Kojelauta', 'B6'), 12000);
  assert.equal(y.solu('Kojelauta', 'B9'), 3000);
  assert.equal(y.solu('Kojelauta', 'A22'), 'marraskuu 2026');
  assert.equal(y.solu('Kojelauta', 'E22'), 12000);
  assert.equal(y.solu('Kaupat', 'E1'), 'Tod. %');
  assert.match(y.ss.getSheetByName('Kaupat').kaavat['1,5'], /VLOOKUP\(D2:D,VAIHEET,2,FALSE\)/);
  assert.ok(y.ss.nimetyt.VAIHEET);
  assert.equal(y.ss.getSheetByName('Kojelauta').kaaviot.length, 1);
  assert.deepEqual(y.taulu('Laskut').map((r) => r['Summa € (alv 0)']), [8000, 2000, 1000, 1000]);
  assert.ok(y.taulu('Laskut').every((r) => r.Tila === 'Laskuttamatta'));
  assert.equal(y.triggerit.length, 1);
  assert.equal(y.triggerit[0].tunti, 7);
  assert.equal(y.taulu('Asetukset').find((r) => r.Asetus === 'Raporttien osoite').Arvo, 'mina@booklapland.fi');
  assert.throws(() => y.ctx.asenna(), /jo asennettu/);

  // Liidien liittäminen täyttää tilan ja päivämäärän
  y.asetus('Nimesi', 'Myyjä Testinen');
  y.asetus('Allekirjoitus', 'Myyjä Testinen\nYritys Oy');
  y.asetus('Tila', 'LÄHETÄ');
  y.liita([
    { Yritys: 'Revontuli Oy', Etunimi: 'Anna', Sähköposti: 'anna@revontuli.fi', Verkkosivu: 'revontuli.fi', Segmentti: 'Matkailu',
      Havainto: 'varaukset ohjautuvat sivuilta Booking.comiin', LinkedIn: 'https://www.linkedin.com/in/anna', Puhelin: '040 111 2222' },
    { Yritys: 'Rakennus Oy', Etunimi: 'Ben', Sähköposti: 'ben@rakennus.fi', Verkkosivu: 'rakennus.fi', Havainto: 'sivusto ei skaalaudu puhelimelle' },
    { Yritys: 'Rakennus Oy', Etunimi: 'Cecilia', Sähköposti: 'cecilia@rakennus.fi', Havainto: 'sama yritys' },
    { Yritys: 'Mökki Oy', Etunimi: 'Dan', Sähköposti: 'dan@mokki.fi', Verkkosivu: 'mokki.fi', Segmentti: 'Matkailu' },
  ]);
  let liidit = y.taulu('Liidit');
  assert.deepEqual(liidit.map((l) => l.Tila), ['Uusi', 'Uusi', 'Uusi', 'Uusi']);
  assert.ok(liidit.every((l) => l['Lisätty'] && l.Vaihe === 0));

  // Sivustotarkistus täyttää signaalit ja ehdotuksen
  y.sivut['https://mokki.fi'] = { koodi: 301, otsakkeet: { Location: 'https://www.mokki.fi/' } };
  y.sivut['https://www.mokki.fi/'] = { html: '<html lang="fi"><meta name="viewport" content="x"><a href="https://www.airbnb.fi/rooms/1">Varaa</a> © 2018</html>' };
  y.sivut['https://revontuli.fi'] = { html: '<html lang="fi"></html>' };
  y.sivut['https://rakennus.fi'] = { koodi: 403 };
  y.ctx.tarkistaSivustot();
  liidit = y.taulu('Liidit');
  assert.match(liidit[3]['Sivuston signaalit'], /ohjaa: Airbnb/);
  assert.equal(liidit[3]['Ehdotettu havainto'], 'varaukset ohjautuvat sivuilta Airbnb:hen, jolloin jokaisesta varauksesta lähtee välityspalkkio');
  assert.equal(liidit[3].Havainto, '');
  assert.match(liidit[1]['Sivuston signaalit'], /Ei auennut: HTTP 403/);

  // Esikatselu ei lähetä mitään
  y.ctx.esikatsele();
  assert.equal(y.dialogit.length, 1);
  assert.match(y.dialogit[0].html, /Revontuli Oy \/ sivut ja varaukset/);
  assert.equal(y.gm.ketjut.size, 0);

  // Maanantaiaamu: kaksi avausta (Cecilia odottaa saman yrityksen vuoroa, Dan havaintoa)
  y.aika('2026-11-02T05:00:00Z');
  y.ctx.paivittainen();
  liidit = y.taulu('Liidit');
  assert.deepEqual(liidit.map((l) => l.Tila), ['Sekvenssissä', 'Sekvenssissä', 'Uusi', 'Uusi']);
  assert.deepEqual(liidit.map((l) => l.Vaihe), [1, 1, 0, 0]);
  assert.equal(y.gm.ketjut.size, 2);
  const annaKetju = liidit[0]['Gmail-ketju'];
  const avaus = y.gm.ketjut.get(annaKetju)[0];
  assert.equal(avaus.to, 'anna@revontuli.fi');
  assert.equal(avaus.subject, 'Revontuli Oy / sivut ja varaukset');
  assert.match(avaus.body, /^Hei Anna,\n\nkävin läpi sivujanne \(revontuli\.fi\) ja huomasin, että varaukset ohjautuvat sivuilta Booking\.comiin\./);
  assert.match(avaus.body, /Myyjä Testinen\nYritys Oy/);
  assert.equal(y.ctx.pvAvain(liidit[0]['Seuraava viesti']), '2026-11-05');
  // Maanantain kooste: viikkoraportti ja LinkedIn-tehtävä
  assert.equal(y.gm.lahetetytKoosteet.length, 1);
  const kooste = y.gm.lahetetytKoosteet[0];
  assert.equal(kooste.to, 'mina@booklapland.fi');
  assert.match(kooste.subject, /^Laskutusmoottori ma 2\.11\.2026: marraskuu 2026/);
  assert.match(kooste.html, /LinkedIn tänään \(1\)/);
  assert.match(kooste.html, /Viikkoraportti/);
  assert.equal(y.taulu('Liidit')[0]['LinkedIn-tila'], 'Tehtävälistalla');
  assert.equal(y.taulu('Loki').filter((r) => r.Toiminto === 'Lähetetty').length, 2);

  // Torstai: Anna vastasi, Ben saa jatkoviestin samaan ketjuun, automaattivastaus ei katkaise
  y.aika('2026-11-04T10:00:00Z');
  y.gm.vastaa(annaKetju, 'Anna <anna@revontuli.fi>', 'Re: Revontuli Oy / sivut ja varaukset', 'Kiinnostaa, soitellaan!');
  const benKetju = liidit[1]['Gmail-ketju'];
  y.gm.vastaa(benKetju, 'Ben <ben@rakennus.fi>', 'Automaattinen vastaus: Rakennus Oy / verkkosivut', 'Olen lomalla', { 'Auto-Submitted': 'auto-replied' });
  y.aika('2026-11-05T05:00:00Z');
  y.ctx.paivittainen();
  liidit = y.taulu('Liidit');
  assert.equal(liidit[0].Tila, 'Vastasi');
  assert.equal(liidit[1].Tila, 'Sekvenssissä');
  assert.equal(liidit[1].Vaihe, 2);
  const jatko = y.gm.ketjut.get(benKetju).filter((o) => o.from.includes('mina@')).pop();
  assert.equal(jatko.subject, 'Re: Rakennus Oy / verkkosivut');
  assert.equal(jatko.headers['In-Reply-To'], y.gm.ketjut.get(benKetju)[0].headers['Message-ID']);
  assert.match(jatko.body, /^Hei Ben,\n\nnostan tämän vielä esiin/);
  assert.equal(y.ctx.pvAvain(liidit[1]['Seuraava viesti']), '2026-11-12');
  const torstai = y.gm.lahetetytKoosteet.pop();
  assert.match(torstai.subject, /1 vastausta/);
  assert.match(torstai.html, /Kiinnostaa, soitellaan!/);

  // Luonnostila: Danille hyväksytään ehdotettu havainto, luonnos lähetetään käsin
  y.asetus('Tila', 'LUONNOS');
  y.asetus('Hyväksy ehdotetut havainnot automaattisesti', true);
  y.aika('2026-11-06T05:00:00Z');
  y.ctx.paivittainen();
  liidit = y.taulu('Liidit');
  assert.equal(liidit[3].Tila, 'Luonnos');
  assert.ok(liidit[3].Luonnos);
  const luonnosId = liidit[3].Luonnos;
  y.gm.lahetaLuonnos(luonnosId);
  y.aika('2026-11-09T05:00:00Z');
  y.ctx.paivittainen();
  liidit = y.taulu('Liidit');
  assert.equal(liidit[3].Tila, 'Sekvenssissä');
  assert.equal(liidit[3].Vaihe, 1);
  assert.equal(liidit[3].Luonnos, '');

  // Siirto kauppoihin
  const sh = y.ss.getSheetByName('Liidit');
  y.ss.setActiveSheet(sh);
  sh.setActiveRange(sh.getRange(2, 1));
  y.ctx.siirraKauppoihin();
  const kaupat = y.taulu('Kaupat');
  assert.equal(kaupat.length, 2);
  assert.equal(kaupat[1].Asiakas, 'Revontuli Oy');
  assert.equal(kaupat[1].Vaihe, 'Palaveri sovittu');
  assert.equal(kaupat[1]['Kertatulo €'], 2500);
  assert.equal(kaupat[1]['Tod. %'], '', 'Tod. % -sarake jää kaavalle');
  assert.equal(y.taulu('Liidit')[0].Tila, 'Kauppa');
  // Avoin kauppa näkyy joulukuun putkessa (2 500 × 25 %)
  assert.equal(y.solu('Kojelauta', 'F23'), 625);
});

test('kuun vaihtuessa uusi laskutuslista ja pomppu tunnistetaan', () => {
  const y = ymparisto();
  y.aika('2026-11-01T13:00:00Z');
  y.ctx.asenna();
  y.asetus('Nimesi', 'Myyjä');
  y.asetus('Tila', 'LÄHETÄ');
  y.liita([{ Yritys: 'Väärä Oy', Sähköposti: 'ei@vaara.fi', Verkkosivu: 'vaara.fi', Havainto: 'testi' }]);
  y.aika('2026-11-02T05:00:00Z');
  y.ctx.paivittainen();
  const ketju = y.taulu('Liidit')[0]['Gmail-ketju'];
  y.gm.vastaa(ketju, 'Mail Delivery Subsystem <mailer-daemon@googlemail.com>', 'Delivery Status Notification (Failure)', 'Address not found');
  y.aika('2026-12-01T05:00:00Z');
  y.ctx.paivittainen();
  assert.equal(y.taulu('Liidit')[0].Tila, 'Pomppasi');
  const joulukuu = y.taulu('Laskut').filter((r) => y.ctx.kkAvain(r.Kuukausi) === '2026-12');
  assert.deepEqual(joulukuu.map((r) => r['Summa € (alv 0)']), [8000, 2000, 1000]);
  assert.equal(y.props.LASKUTUSLISTA_KK, '2026-12');
  assert.equal(y.solu('Kojelauta', 'A3'), 'JOULUKUU 2026');
});

test('ilman nimeä ei lähetetä mitään ja virhe näkyy koosteessa', () => {
  const y = ymparisto();
  y.aika('2026-11-01T13:00:00Z');
  y.ctx.asenna();
  y.asetus('Tila', 'LÄHETÄ');
  y.liita([{ Yritys: 'A Oy', Sähköposti: 'a@a.fi', Verkkosivu: 'a.fi', Havainto: 'testi' }]);
  y.aika('2026-11-03T05:00:00Z');
  y.ctx.paivittainen();
  assert.equal(y.gm.ketjut.size, 0);
  assert.equal(y.taulu('Liidit')[0].Tila, 'Uusi');
  assert.match(y.gm.lahetetytKoosteet.pop().html, /Nimesi|nimi/);
});
