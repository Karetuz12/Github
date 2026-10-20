/**
 * Book Lapland – kuvalomake
 *
 * Asiakas skannaa QR-koodin, kirjoittaa sähköpostinsa (ryhmänumero tulee
 * valmiiksi QR-koodista), ja aamulla Aamu-välilehdellä on edellisen illan
 * osoitteet ryhmittäin valmiina kopioitavaksi BCC-kenttään.
 *
 * Asennus: liitä tämä tiedosto osoitteessa https://script.new, tallenna ja
 * aja funktio `asenna`. Tarkemmat ohjeet: OHJE.md.
 */

const ASETUKSET = {
  ryhmia: 20,             // QR-kortit ryhmille 1..ryhmia
  sailytysPaivia: 30,     // sähköpostit poistetaan automaattisesti tämän jälkeen
  paivanVaihtoTunti: 6,   // klo 06 asti tulleet vastaukset kuuluvat edellisen illan retkeen
  tietosuojaLinkki: '',   // esim. 'https://...' – näytetään lomakkeessa, jos täytetty
  kansionNimi: 'Book Lapland – Kuvalomake',
  aamunRiveja: 50,        // montako ryhmää Aamu-välilehti näyttää yhdeltä päivältä
};

// Asiakkaille näkyvät tekstit
const TEKSTIT = {
  otsikko: 'Your tour photos – Book Lapland',
  kuvaus: () =>
    "Leave your email and we'll send you the photos from your tour.\n\n" +
    'We use your email address only to send you the photos, and we delete it within ' +
    ASETUKSET.sailytysPaivia + ' days.' +
    (ASETUKSET.tietosuojaLinkki ? '\nPrivacy policy: ' + ASETUKSET.tietosuojaLinkki : ''),
  kiitos: "Thank you! We'll send the photos from your tour to your email.",
  ryhma: 'Group number',
  ryhmaOhje: 'Ask your guide if you are not sure.',
  email: 'Email',
  emailVirhe: 'Please check your email address.',
  kortinTeksti1: 'Scan to get the photos from your tour',
  kortinTeksti2: "Leave your email – we'll send the photos to you.",
};

/** Luo lomakkeen, vastaustaulukon, QR-kortit ja automaattisen poiston. Ajetaan kerran. */
function asenna() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('FORM_ID')) {
    throw new Error('Kuvalomake on jo asennettu: ' +
      SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getUrl());
  }

  const kansio = DriveApp.createFolder(ASETUKSET.kansionNimi);

  const lomake = FormApp.create(TEKSTIT.otsikko)
    .setDescription(TEKSTIT.kuvaus())
    .setConfirmationMessage(TEKSTIT.kiitos)
    .setCollectEmail(false)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setShowLinkToRespondAgain(false)
    .setProgressBar(false);
  try {
    lomake.setRequireLogin(false); // Workspace-tileillä lomake on muuten vain oman organisaation käytössä
  } catch (e) {
    // tavallisella Google-tilillä asetusta ei ole
  }
  if (typeof lomake.setPublished === 'function') lomake.setPublished(true);

  const ryhmaKysymys = lomake.addTextItem()
    .setTitle(TEKSTIT.ryhma)
    .setHelpText(TEKSTIT.ryhmaOhje)
    .setRequired(true);
  lomake.addTextItem()
    .setTitle(TEKSTIT.email)
    .setRequired(true)
    .setValidation(FormApp.createTextValidation()
      .setHelpText(TEKSTIT.emailVirhe)
      .requireTextIsEmail()
      .build());

  let taulukko = SpreadsheetApp.create('Book Lapland – Kuvalomakkeen vastaukset');
  taulukko.setSpreadsheetTimeZone('Europe/Helsinki');
  taulukko.setSpreadsheetLocale('fi_FI');
  taulukko.getSheets()[0].setName('Aamu');
  lomake.setDestination(FormApp.DestinationType.SPREADSHEET, taulukko.getId());
  odotaVastausValilehti(taulukko.getId()).setName('Vastaukset');

  props.setProperties({
    FORM_ID: lomake.getId(),
    SHEET_ID: taulukko.getId(),
    GROUP_ITEM_ID: String(ryhmaKysymys.getId()),
    FOLDER_ID: kansio.getId(),
  });

  taulukko = SpreadsheetApp.openById(taulukko.getId());
  rakennaAamu(taulukko);
  const aamu = taulukko.getSheetByName('Aamu');
  taulukko.setActiveSheet(aamu);
  taulukko.moveActiveSheet(1);

  DriveApp.getFileById(lomake.getId()).moveTo(kansio);
  DriveApp.getFileById(taulukko.getId()).moveTo(kansio);

  teeQrKortit();
  asennaPoistoajastus();

  Logger.log('Valmis!\nVastaukset ja aamun koonti: ' + taulukko.getUrl() +
    '\nKaikki tiedostot kansiossa: ' + kansio.getUrl());
}

/**
 * Tekee QR-kortit uudelleen (esim. kun ryhmien määrää on muutettu ylhäältä).
 * Vanha korttitiedosto siirtyy roskakoriin.
 */
function teeQrKortit() {
  const props = PropertiesService.getScriptProperties();
  const lomake = FormApp.openById(props.getProperty('FORM_ID'));
  const ryhmaKysymys = lomake.getItemById(Number(props.getProperty('GROUP_ITEM_ID'))).asTextItem();

  const kortit = [];
  for (let n = 1; n <= ASETUKSET.ryhmia; n++) {
    const url = lomake.createResponse()
      .withItemResponse(ryhmaKysymys.createResponse(String(n)))
      .toPrefilledUrl();
    kortit.push({ otsikko: 'GROUP ' + n, url: lyhenna(lomake, url) });
  }
  // Yleiskortti ilman ryhmänumeroa
  kortit.push({ otsikko: 'TOUR PHOTOS', url: lyhenna(lomake, lomake.getPublishedUrl()) });

  const doc = DocumentApp.create('Book Lapland – QR-kortit ryhmille');
  const body = doc.getBody()
    .setPageWidth(595.28).setPageHeight(841.89) // A4
    .setMarginTop(36).setMarginBottom(36).setMarginLeft(36).setMarginRight(36);

  // Neljä korttia A4-sivulle, leikataan reunaviivoja pitkin
  for (let i = 0; i < kortit.length; i += 4) {
    if (i > 0) body.appendPageBreak();
    const taulu = body.appendTable().setBorderColor('#bbbbbb');
    for (let r = i; r < Math.min(i + 4, kortit.length); r += 2) {
      const rivi = taulu.appendTableRow();
      for (let k = r; k < r + 2; k++) {
        const solu = rivi.appendTableCell().setWidth(261)
          .setPaddingTop(24).setPaddingBottom(24);
        if (kortit[k]) taytaKortti(solu, kortit[k]);
      }
    }
  }
  doc.saveAndClose();

  const kansio = DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
  DriveApp.getFileById(doc.getId()).moveTo(kansio);
  const vanha = props.getProperty('QR_DOC_ID');
  if (vanha) {
    try {
      DriveApp.getFileById(vanha).setTrashed(true);
    } catch (e) {
      // vanha tiedosto on jo poistettu
    }
  }
  props.setProperty('QR_DOC_ID', doc.getId());

  kirjoitaLinkit(SpreadsheetApp.openById(props.getProperty('SHEET_ID')), lomake, doc, kansio);
  Logger.log('QR-kortit: ' + doc.getUrl());
}

/** Poistaa yli sailytysPaivia vanhat vastaukset lomakkeelta ja taulukosta. Ajetaan joka yö. */
function poistaVanhat() {
  const props = PropertiesService.getScriptProperties();
  const raja = new Date(Date.now() - ASETUKSET.sailytysPaivia * 24 * 3600 * 1000);
  const vanha = (arvo) => arvo instanceof Date && arvo < raja;

  const lomake = FormApp.openById(props.getProperty('FORM_ID'));
  lomake.getResponses().forEach((v) => {
    if (vanha(v.getTimestamp())) lomake.deleteResponse(v.getId());
  });

  const vastaukset = haeVastausValilehti(SpreadsheetApp.openById(props.getProperty('SHEET_ID')));
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
  s.setColumnWidth(5, 170);
  s.setColumnWidth(6, 420);
  s.setFrozenRows(5);
}

function kirjoitaLinkit(taulukko, lomake, doc, kansio) {
  const s = taulukko.getSheetByName('Aamu');
  s.getRange('E1:F4').setValues([
    ['Asiakkaiden lomake', lyhenna(lomake, lomake.getPublishedUrl())],
    ['Lomakkeen muokkaus', lomake.getEditUrl()],
    ['QR-kortit (tulosta)', doc.getUrl()],
    ['Kansio', kansio.getUrl()],
  ]);
  s.getRange('E1:E4').setFontWeight('bold');
}

function lyhenna(lomake, url) {
  try {
    return lomake.shortenFormUrl(url);
  } catch (e) {
    return url;
  }
}

function taytaKortti(solu, kortti) {
  const keskelle = DocumentApp.HorizontalAlignment.CENTER;

  solu.setText(kortti.otsikko);
  solu.getChild(0).asParagraph().setAlignment(keskelle)
    .editAsText().setFontSize(30).setBold(true);

  const kuva = solu.appendImage(qrKuva(kortti.url)).setWidth(190).setHeight(190);
  kuva.getParent().asParagraph().setAlignment(keskelle);

  solu.appendParagraph(TEKSTIT.kortinTeksti1).setAlignment(keskelle)
    .editAsText().setFontSize(13).setBold(true);
  solu.appendParagraph(TEKSTIT.kortinTeksti2).setAlignment(keskelle)
    .editAsText().setFontSize(10).setBold(false);
  solu.appendParagraph('Book Lapland').setAlignment(keskelle)
    .editAsText().setFontSize(9).setBold(false).setForegroundColor('#777777');
}

function qrKuva(url) {
  const palvelut = [
    'https://quickchart.io/qr?size=600&margin=2&ecLevel=M&text=' + encodeURIComponent(url),
    'https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=8&data=' + encodeURIComponent(url),
  ];
  for (const osoite of palvelut) {
    try {
      const vastaus = UrlFetchApp.fetch(osoite, { muteHttpExceptions: true });
      if (vastaus.getResponseCode() === 200) return vastaus.getBlob().setName('qr.png');
    } catch (e) {
      // kokeillaan seuraavaa palvelua
    }
  }
  throw new Error('QR-koodin luonti epäonnistui. Kokeile ajaa teeQrKortit uudelleen hetken päästä.');
}

function haeVastausValilehti(taulukko) {
  return taulukko.getSheets().find((s) => s.getFormUrl()) || null;
}

function odotaVastausValilehti(id) {
  for (let i = 0; i < 20; i++) {
    SpreadsheetApp.flush();
    const s = haeVastausValilehti(SpreadsheetApp.openById(id));
    if (s) return s;
    Utilities.sleep(1000);
  }
  throw new Error('Lomakkeen vastausvälilehteä ei löytynyt taulukosta.');
}
