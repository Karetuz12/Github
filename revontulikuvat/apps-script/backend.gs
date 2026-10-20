/**
 * Book Lapland – revontulikuvat: Google Sheets -taustapalvelu
 *
 * Verkkosivu (Vercel) lähettää jokaisen ilmoittautumisen tänne. Skripti
 * tallentaa sen Vastaukset-välilehdelle, ja Aamu-välilehti kokoaa edellisen
 * illan osoitteet ryhmittäin. Yli 30 päivää vanhat rivit poistuvat yöllä.
 *
 * Asennus: ks. revontulikuvat/OHJE.md.
 */

const ASETUKSET = {
  sailytysPaivia: 30,     // sähköpostit poistetaan automaattisesti tämän jälkeen
  paivanVaihtoTunti: 6,   // klo 06 asti tulleet kuuluvat edellisen illan retkeen
  aamunRiveja: 50,        // montako ryhmää Aamu-välilehti näyttää yhdeltä päivältä
  taulukonNimi: 'Book Lapland – Revontulikuvat',
};

/** Luo taulukon, aamun koonnin ja yöllisen poiston. Ajetaan kerran. */
function asenna() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) {
    throw new Error('Taustapalvelu on jo asennettu: ' +
      SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getUrl());
  }

  const taulukko = SpreadsheetApp.create(ASETUKSET.taulukonNimi);
  taulukko.setSpreadsheetTimeZone('Europe/Helsinki');
  taulukko.setSpreadsheetLocale('fi_FI');

  const aamu = taulukko.getSheets()[0].setName('Aamu');
  const vastaukset = taulukko.insertSheet('Vastaukset');
  vastaukset.getRange('A1:D1').setValues([['Aika', 'Ryhmä', 'Sähköposti', 'Kieli']]).setFontWeight('bold');
  vastaukset.setFrozenRows(1);
  vastaukset.getRange('A2:A').setNumberFormat('d.m.yyyy H:mm');
  vastaukset.setColumnWidth(1, 140);
  vastaukset.setColumnWidth(3, 280);

  rakennaAamu(taulukko);
  taulukko.setActiveSheet(aamu);

  const salasana = Utilities.getUuid().replace(/-/g, '');
  props.setProperties({ SHEET_ID: taulukko.getId(), SECRET: salasana });
  asennaPoistoajastus();

  Logger.log('Valmis!\n\nTaulukko: ' + taulukko.getUrl() +
    '\n\nAPPS_SCRIPT_SECRET (kopioi Verceliin):\n' + salasana +
    '\n\nSeuraavaksi: Ota käyttöön → Uusi käyttöönotto → Verkkosovellus (ohje OHJE.md:ssä).');
}

/** Näyttää salasanan uudelleen, jos se katosi. */
function naytaSalasana() {
  Logger.log(PropertiesService.getScriptProperties().getProperty('SECRET'));
}

/** Verkkosivun ilmoittautumiset tulevat tänne. */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    if (!data || data.secret !== props.getProperty('SECRET')) return vastaa({ ok: false, error: 'forbidden' });

    const email = String(data.email || '').trim().toLowerCase();
    const ryhma = String(data.group || '').trim().toUpperCase();
    const kieli = String(data.lang || '').slice(0, 5);
    // Samat tarkistukset kuin sivulla; = + - alku tulkittaisiin kaavaksi
    if (!/^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email) || /^[=+\-]/.test(email)) {
      return vastaa({ ok: false, error: 'email' });
    }
    if (!/^[A-Z0-9][A-Z0-9-]{0,9}$/.test(ryhma)) return vastaa({ ok: false, error: 'group' });

    const lukko = LockService.getScriptLock();
    lukko.waitLock(15000);
    try {
      const vastaukset = SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName('Vastaukset');
      // Numeroryhmät numeroina, jotta Aamu-välilehti järjestää 2 ennen 10:tä
      vastaukset.appendRow([new Date(), /^\d+$/.test(ryhma) ? Number(ryhma) : ryhma, email, kieli]);
    } finally {
      lukko.releaseLock();
    }
    return vastaa({ ok: true });
  } catch (err) {
    console.error(err);
    return vastaa({ ok: false, error: 'server' });
  }
}

/** Selaimella avattuna kertoo, että palvelu on päällä. */
function doGet() {
  return vastaa({ ok: true, service: 'revontulikuvat' });
}

/** Poistaa yli sailytysPaivia vanhat rivit. Ajetaan joka yö. */
function poistaVanhat() {
  const raja = new Date(Date.now() - ASETUKSET.sailytysPaivia * 24 * 3600 * 1000);
  const vanha = (arvo) => arvo instanceof Date && arvo < raja;

  const vastaukset = SpreadsheetApp
    .openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'))
    .getSheetByName('Vastaukset');
  const viimeinen = vastaukset.getLastRow();
  if (viimeinen < 2) return;
  // Taulukkoon jätetään aina tyhjä rivi, koska kaikkia rivejä ei voi poistaa
  if (vastaukset.getMaxRows() === viimeinen) vastaukset.insertRowAfter(viimeinen);

  const ajat = vastaukset.getRange(2, 1, viimeinen - 1, 1).getValues();
  // Poistetaan alhaalta ylöspäin yhtenäisinä pätkinä
  let i = ajat.length - 1;
  while (i >= 0) {
    if (!vanha(ajat[i][0])) {
      i--;
      continue;
    }
    let alku = i;
    while (alku > 0 && vanha(ajat[alku - 1][0])) alku--;
    vastaukset.deleteRows(alku + 2, i - alku + 1);
    i = alku - 1;
  }
}

function asennaPoistoajastus() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'poistaVanhat')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('poistaVanhat').timeBased().everyDays(1).atHour(4).create();
}

function rakennaAamu(taulukko) {
  const s = taulukko.getSheetByName('Aamu');
  const aika = 'Vastaukset!$A$2:$A';
  const ryhma = 'Vastaukset!$B$2:$B';
  const email = 'Vastaukset!$C$2:$C';
  const paivalla = `${aika}<>"",INT(${aika}-${ASETUKSET.paivanVaihtoTunti}/24)=$B$2`;

  s.getRange('A1:A3').setValues([
    ['Valitse päivä (tyhjä = eilinen):'],
    ['Näytetään retkipäivä:'],
    [''],
  ]);
  s.getRange('B1:B2').setNumberFormat('d.m.yyyy');
  s.getRange('B1').setBackground('#fff8c5');
  s.getRange('B2').setFormula('=IF(B1="",TODAY()-1,B1)').setFontWeight('bold');
  s.getRange('A3').setFormula(
    `="Sähköposteja yhteensä: "&IFERROR(ROWS(FILTER(${email},${paivalla})),0)`);

  s.getRange('A5:C5')
    .setValues([['Ryhmä', 'Osoitteita', 'Sähköpostit – kopioi piilokopio (BCC) -kenttään']])
    .setFontWeight('bold')
    .setBackground('#e8eef7');
  s.getRange('A6').setFormula(`=IFERROR(SORT(UNIQUE(FILTER(${ryhma},${paivalla}))),"")`);

  const kaavat = [];
  for (let r = 6; r < 6 + ASETUKSET.aamunRiveja; r++) {
    const osoitteet = `UNIQUE(LOWER(TRIM(FILTER(${email},${paivalla},${ryhma}=$A${r}))))`;
    kaavat.push([
      `=IF($A${r}="","",ARRAYFORMULA(COUNTA(${osoitteet})))`,
      `=IF($A${r}="","",ARRAYFORMULA(TEXTJOIN(", ",TRUE,${osoitteet})))`,
    ]);
  }
  s.getRange(6, 2, ASETUKSET.aamunRiveja, 2).setFormulas(kaavat).setVerticalAlignment('top');
  s.getRange('A6:A').setHorizontalAlignment('left').setVerticalAlignment('top');
  s.getRange('C6:C').setWrap(true);

  s.setColumnWidth(1, 220);
  s.setColumnWidth(2, 110);
  s.setColumnWidth(3, 560);
  s.setFrozenRows(5);
}

function vastaa(olio) {
  return ContentService.createTextOutput(JSON.stringify(olio)).setMimeType(ContentService.MimeType.JSON);
}
