/**
 * Laskutusmoottori – kuukausitavoitteet, ennuste ja itseään säätävä asiakashankinta
 *
 * Yksi Google Sheets -taulukko, johon kirjataan tavoitteet, toistuvat tulot, kaupat, laskut ja liidit.
 * Kojelauta laskee joka muutoksen jälkeen, paljonko kuukaudesta puuttuu, ja kääntää vajeen
 * kontaktimääräksi: vaje → kauppoja → palavereja → kontakteja → kontakteja per arkipäivä.
 * Joka aamu kone lähettää (tai luonnostelee) juuri sen verran uusia viestejä, hoitaa jatkoviestit,
 * merkitsee vastaukset ja lähettää sinulle päivän koosteen sekä LinkedIn- ja soittolistan.
 *
 * Asennus: avaa uusi taulukko (sheets.new) → Laajennukset → Apps Script → liitä tämä tiedosto,
 * lisää palvelu Gmail API ja aja `asenna`. Tarkemmat ohjeet: OHJE.md.
 */

// ───────────────────────────── Välilehdet ja sarakkeet ─────────────────────────────

const V = {
  kojelauta: 'Kojelauta',
  kaupat: 'Kaupat',
  liidit: 'Liidit',
  laskut: 'Laskut',
  toistuvat: 'Toistuvat',
  tavoitteet: 'Tavoitteet',
  pohjat: 'Viestipohjat',
  asetukset: 'Asetukset',
  loki: 'Loki',
};

// Skripti etsii sarakkeet otsikon perusteella: sarakkeita saa siirtää ja lisätä, mutta otsikoita ei saa muuttaa.
const SAR = {
  [V.tavoitteet]: { kk: 'Kuukausi', tavoite: 'Tavoite € (alv 0)', muistiinpano: 'Muistiinpano' },
  [V.toistuvat]: {
    lahde: 'Tulolähde', laskutettava: 'Laskutettava', summa: '€ / kk (alv 0)',
    alkaa: 'Alkaa', paattyy: 'Päättyy', muistiinpano: 'Muistiinpano',
  },
  [V.kaupat]: {
    asiakas: 'Asiakas', kuvaus: 'Kuvaus', lahde: 'Lähde', vaihe: 'Vaihe', tod: 'Tod. %',
    kerta: 'Kertatulo €', lasku1: '1. lasku kk', lasku2: 'Loppulasku kk',
    kk: 'Kk-tulo €', kkAlkaa: 'Kk-tulo alkaa', kkPaattyy: 'Kk-tulo päättyy',
    seuraava: 'Seuraava askel', seuraavaPvm: 'Seuraava pvm', yhteys: 'Yhteyshenkilö',
    muistiinpano: 'Muistiinpanot', luotu: 'Luotu',
  },
  [V.laskut]: {
    kk: 'Kuukausi', laskutettava: 'Laskutettava', kuvaus: 'Kuvaus', summa: 'Summa € (alv 0)',
    tila: 'Tila', pvm: 'Laskun pvm', tunniste: 'Tunniste',
  },
  [V.liidit]: {
    yritys: 'Yritys', etunimi: 'Etunimi', sukunimi: 'Sukunimi', rooli: 'Rooli', email: 'Sähköposti',
    puhelin: 'Puhelin', linkedin: 'LinkedIn', sivusto: 'Verkkosivu', segmentti: 'Segmentti',
    paikkakunta: 'Paikkakunta', havainto: 'Havainto', ehdotus: 'Ehdotettu havainto',
    signaalit: 'Sivuston signaalit', tila: 'Tila', vaihe: 'Vaihe', aloitettu: 'Aloitettu',
    viimeksi: 'Viimeksi lähetetty', seuraava: 'Seuraava viesti', vastausPvm: 'Vastasi pvm',
    ketju: 'Gmail-ketju', luonnos: 'Luonnos', liTila: 'LinkedIn-tila', soitto: 'Soitto',
    muistiinpano: 'Muistiinpanot', lisatty: 'Lisätty',
  },
  [V.pohjat]: { vaihe: 'Vaihe', segmentti: 'Segmentti', odota: 'Odota arkipäivää', aihe: 'Aihe', viesti: 'Viesti' },
  [V.loki]: { aika: 'Aika', toiminto: 'Toiminto', kohde: 'Kohde', tulos: 'Tulos' },
};

// [avain, otsikko Asetukset-välilehdellä, oletus, selite, muoto]
const ASETUSRIVIT = [
  ['tila', 'Tila', 'TESTI', 'TESTI = viestit tulevat vain esikatseluna sinulle. LUONNOS = viestit menevät Gmailin luonnoksiin ja lähetät ne itse. LÄHETÄ = kone lähettää.'],
  ['nimi', 'Nimesi', '', 'Lähettäjän nimi ja {{nimi}} viesteissä.'],
  ['allekirjoitus', 'Allekirjoitus', '', 'Viestien {{allekirjoitus}}: nimi, yritys, puhelin, verkkosivu. Rivinvaihto solun sisällä: Ctrl+Enter.'],
  ['referenssi', 'Referenssilause', 'Viimeisimpiä töitäni ovat Book Lapland ja SkyView Igloo Resort.', '{{referenssi}} viesteissä. Varmista, että saat käyttää nimiä.'],
  ['raportti', 'Raporttien osoite', '', 'Päivän kooste ja maanantain viikkoraportti tulevat tähän osoitteeseen.'],
  ['alias', 'Lähetysosoite (alias)', '', 'Tyhjä = tämän Google-tilin osoite. Muun osoitteen pitää olla Gmailissa lähetysosoitteena (Asetukset → Tilit).'],
  ['keskikauppa', 'Keskikauppa €', 2500, 'Yhden projektin keskimääräinen arvo (alv 0). Tällä lasketaan, montako kauppaa vaje vaatii.', 'eur'],
  ['kp', 'Kontakti → palaveri', 0.04, 'Montako prosenttia kontaktoiduista päätyy palaveriin. Kone vaihtaa toteutuneeseen, kun dataa on tarpeeksi.', 'pct'],
  ['pk', 'Palaveri → kauppa', 0.3, 'Montako prosenttia palavereista johtaa kauppaan.', 'pct'],
  ['kynnys', 'Toteutuneet käyttöön, kun kontakteja vähintään', 60, 'Tätä ennen laskelma käyttää oletuksia.'],
  ['min', 'Uusia kontakteja / päivä, vähintään', 3, 'Kone pitää vähintään tämän tahdin, vaikka kuukausi olisi jo katettu.'],
  ['max', 'Uusia kontakteja / päivä, enintään', 20, 'Katto toimitettavuuden takia. Uudella postilaatikolla aloita 10:llä.'],
  ['yhteensa', 'Viestejä yhteensä / päivä, enintään', 40, 'Uudet viestit ja jatkoviestit yhteensä.'],
  ['loppuOdotus', 'Odota viimeisen viestin jälkeen (arkipäivää)', 5, 'Tämän jälkeen liidin tilaksi tulee Ei vastausta.'],
  ['vaadiHavainto', 'Vaadi havainto', true, 'Ensimmäinen viesti lähtee vain liidille, jolla on havainto (täsmäisku).'],
  ['autoHavainto', 'Hyväksy ehdotetut havainnot automaattisesti', false, 'Kyllä = jos Havainto on tyhjä, kone käyttää sivustotarkistuksen ehdotusta.'],
  ['li', 'LinkedIn-tehtäviä / päivä', 5, 'Kone ei käytä LinkedIniä itse. Saat listan profiileista ja valmiin viestin.'],
  ['soitot', 'Soittoja / päivä', 3, 'Liidit, joilla on puhelinnumero ja kaksi viestiä ilman vastausta.'],
  ['arkisin', 'Lähetä vain arkipäivinä', true, 'Viikonloppuisin ja arkipyhinä kone tarkistaa vain vastaukset.'],
  ['kooste', 'Päivittäinen kooste sähköpostiin', true, 'Ei = vain maanantain viikkoraportti (ja kooste, kun joku on vastannut).'],
  ['ajo', 'Ajo klo', 7, 'Muutoksen jälkeen: valikko Laskutusmoottori → Asenna ajastus uudelleen.'],
];

const VAIHEET_OLETUS = [
  ['Liidi', 0.1],
  ['Palaveri sovittu', 0.25],
  ['Tarjous lähetetty', 0.5],
  ['Neuvottelu', 0.75],
  ['Voitettu', 1],
  ['Hävitty', 0],
];
const VOITETTU = 'Voitettu';
const HAVITTY = 'Hävitty';

const LAHTEET = ['Verkosto', 'Olemassa oleva asiakas', 'Sähköposti', 'LinkedIn', 'Puhelin', 'Suositus',
  'Markkinointiboosti', 'Nordic Host', 'Muu'];
const LASKUTILAT = ['Laskuttamatta', 'Lähetetty', 'Maksettu', 'Peruttu'];
const LASKUTETTU = ['Lähetetty', 'Maksettu'];
const LIIDITILAT = ['Uusi', 'Luonnos', 'Sekvenssissä', 'Vastasi', 'Palaveri', 'Kauppa', 'Ei kiinnosta',
  'Ei vastausta', 'Pomppasi', 'Älä ota yhteyttä', 'Tauko', 'Tupla'];
const VASTANNEET = ['Vastasi', 'Palaveri', 'Kauppa', 'Ei kiinnosta', 'Älä ota yhteyttä'];
const PALAVERIT = ['Palaveri', 'Kauppa'];
// Kun joku yrityksestä on näissä tiloissa, samaan yritykseen (domainiin) ei lähetetä toista avausta.
const ESTAA_DOMAININ = ['Luonnos', 'Sekvenssissä', 'Vastasi', 'Palaveri', 'Kauppa', 'Ei kiinnosta', 'Älä ota yhteyttä'];
const LI_TILAT = ['Tehtävälistalla', 'Kutsuttu', 'Yhdistetty', 'Viesti lähetetty', 'Ei LinkedInissä'];
const SOITTOTILAT = ['Soittolistalla', 'Ei vastannut', 'Palaveri sovittu', 'Ei kiinnosta', 'Soita myöhemmin'];
const SEGMENTIT = ['Matkailu', 'Yleinen'];
const TILAT = ['TESTI', 'LUONNOS', 'LÄHETÄ'];
const YLEISET_DOMAINIT = ['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'hotmail.fi', 'live.com',
  'live.fi', 'msn.com', 'yahoo.com', 'icloud.com', 'me.com', 'luukku.com', 'suomi24.fi', 'kolumbus.fi',
  'saunalahti.fi', 'elisanet.fi', 'welho.com', 'dnainternet.net', 'netti.fi', 'anvianet.fi', 'pp.inet.fi', 'protonmail.com'];

const KUUKAUDET = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu',
  'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];
const VIIKONPAIVAT = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];

// Kojelaudan kiinteä asettelu (kaavio lukee kuukausitaulukkoa riveiltä KL.kk..KL.kk+KL.kkRiveja)
const KL = { kpi: 3, huomiot: 13, huomioRiveja: 6, kk: 21, kkRiveja: 24, askeleet: 47, askelRiveja: 10 };

const POHJAT_OLETUS = [
  [1, 'Matkailu', '', '{{yritys}} / sivut ja varaukset',
    'Hei {{etunimi}},\n\n' +
    'kävin läpi sivujanne ({{sivusto}}) ja huomasin, että {{havainto}}.\n\n' +
    'Matkailussa sivusto on usein se kohta, jossa asiakas päättää, varaako suoraan teiltä vai välityspalvelun kautta.\n\n' +
    'Teen matkailuyrityksille sivustoja ja suoria varauspolkuja. {{referenssi}} Tyypillinen projekti valmistuu 2–3 viikossa kiinteällä hinnalla.\n\n' +
    'Sopisiko 15 minuutin puhelu ensi viikolla? Kerron kolme asiaa, jotka korjaisin sivuillanne ensimmäisenä – maksutta, vaikka ette lähtisi projektiin.\n\n' +
    '{{allekirjoitus}}\n\n' +
    'P.S. Jos aihe ei ole nyt ajankohtainen, vastaa "ei kiitos", niin en laita enempää viestejä.'],
  [1, '', '', '{{yritys}} / verkkosivut',
    'Hei {{etunimi}},\n\n' +
    'kävin läpi sivujanne ({{sivusto}}) ja huomasin, että {{havainto}}.\n\n' +
    'Sivusto on usein se kohta, jossa asiakas päättää, ottaako yhteyttä vai jatkaako etsimistä.\n\n' +
    'Teen yrityksille verkkosivuja, jotka on rakennettu tuomaan yhteydenottoja. {{referenssi}} Tyypillinen projekti valmistuu 2–3 viikossa kiinteällä hinnalla.\n\n' +
    'Sopisiko 15 minuutin puhelu ensi viikolla? Kerron kolme asiaa, jotka korjaisin sivuillanne ensimmäisenä – maksutta, vaikka ette lähtisi projektiin.\n\n' +
    '{{allekirjoitus}}\n\n' +
    'P.S. Jos aihe ei ole nyt ajankohtainen, vastaa "ei kiitos", niin en laita enempää viestejä.'],
  [2, '', 3, '',
    'Hei {{etunimi}},\n\n' +
    'nostan tämän vielä esiin. Jos puhelu tuntuu isolta askeleelta, voin lähettää ne kolme korjausehdotusta suoraan sähköpostilla. Laitanko?\n\n' +
    '{{nimi}}'],
  [3, 'Matkailu', 5, '',
    'Hei {{etunimi}},\n\n' +
    'en halua täyttää postilaatikkoanne, joten tämä on viimeinen viestini aiheesta. Jos sivut tai suorat varaukset tulevat ajankohtaisiksi vaikka sesongin jälkeen, vastaa tähän viestiin, niin jatketaan siitä.\n\n' +
    'Hyvää sesonkia!\n{{nimi}}'],
  [3, '', 5, '',
    'Hei {{etunimi}},\n\n' +
    'en halua täyttää postilaatikkoanne, joten tämä on viimeinen viestini aiheesta. Jos sivujen uudistus tulee ajankohtaiseksi myöhemmin, vastaa tähän viestiin, niin jatketaan siitä.\n\n' +
    'Kiitos ja hyvää jatkoa!\n{{nimi}}'],
  ['LinkedIn', '', '', '',
    'Hei {{etunimi}}, kiitos kun hyväksyit kutsun! Kävin läpi sivujanne ja huomasin, että {{havainto}}. ' +
    'Jos aihe kiinnostaa, katsotaan 15 minuutissa, mitä korjaisin ensimmäisenä.'],
];

// ───────────────────────────── Asennus ─────────────────────────────

/** Rakentaa välilehdet, lähtötiedot ja päivittäisen ajastuksen. Ajetaan kerran. */
function asenna() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Avaa skripti taulukon kautta: Laajennukset → Apps Script.');
  if (ss.getSheetByName(V.kojelauta)) {
    throw new Error('Laskutusmoottori on jo asennettu tähän taulukkoon. Päivitä koodi liittämällä uusi versio – asennusta ei ajeta uudelleen.');
  }
  if (typeof Gmail === 'undefined') {
    throw new Error('Lisää ensin Gmail API: editorin vasemmasta reunasta Palvelut (Services) + → Gmail API → Lisää. Aja sitten asenna uudelleen.');
  }

  ss.setSpreadsheetLocale('fi_FI');
  ss.setSpreadsheetTimeZone('Europe/Helsinki');
  const vanhat = ss.getSheets();

  const tanaan = tanaanAvain();
  const nyt = tanaan.slice(0, 7);

  // Välilehdet tässä järjestyksessä. Asetukset rakennetaan ensin, koska muut viittaavat siihen.
  const kojelauta = ss.insertSheet(V.kojelauta, 0);
  const sh = {};
  [V.kaupat, V.liidit, V.laskut, V.toistuvat, V.tavoitteet, V.pohjat, V.asetukset, V.loki]
    .forEach((n, i) => { sh[n] = ss.insertSheet(n, i + 1); });
  vanhat.forEach((s) => ss.deleteSheet(s));
  rakennaAsetukset(sh[V.asetukset]);
  rakennaKaupat(sh[V.kaupat], nyt);
  rakennaLiidit(sh[V.liidit]);
  rakennaLaskut(sh[V.laskut]);
  rakennaToistuvat(sh[V.toistuvat], nyt);
  rakennaTavoitteet(sh[V.tavoitteet], nyt);
  rakennaPohjat(sh[V.pohjat]);
  rakennaLoki(sh[V.loki]);

  // Tod. % -sarake Kaupat-välilehdelle (nimetty alue VAIHEET on nyt olemassa)
  const kaupat = sh[V.kaupat];
  const k = SAR[V.kaupat];
  const otsikot = Object.values(k);
  const todSar = otsikot.indexOf(k.tod) + 1;
  const vaiheSar = sarakeKirjain(otsikot.indexOf(k.vaihe) + 1);
  kaupat.getRange(1, todSar).setFormula(
    '={"' + k.tod + '";ARRAYFORMULA(IF(' + vaiheSar + '2:' + vaiheSar + '="",,IFERROR(VLOOKUP(' +
    vaiheSar + '2:' + vaiheSar + ',VAIHEET,2,FALSE),0)))}');

  kojelauta.setColumnWidth(1, 270).setColumnWidth(2, 120).setColumnWidth(3, 120).setColumnWidth(4, 270)
    .setColumnWidth(5, 120).setColumnWidth(6, 120).setColumnWidth(7, 200)
    .setColumnWidths(8, 3, 110);
  kojelauta.setHiddenGridlines(true);

  luoLaskutuslista(nyt);
  PropertiesService.getScriptProperties().setProperty('LASKUTUSLISTA_KK', nyt);
  paivitaKojelauta();
  luoKaavio(kojelauta);
  asennaAjastus();
  ss.setActiveSheet(kojelauta);

  loki('Asennus', ss.getName(), 'Valmis');
  Logger.log('Valmis! Päivitä taulukon sivu, niin valikko Laskutusmoottori ilmestyy.\n' + ss.getUrl());
}

/** Päivittäinen ajo Ajo klo -asetuksen mukaan. Aja uudelleen, jos muutat kellonaikaa. */
function asennaAjastus() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'paivittainen')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  const a = lueAsetukset();
  const tunti = Math.min(23, Math.max(0, Math.round(luku(a.ajo)) || 7));
  ScriptApp.newTrigger('paivittainen').timeBased().everyDays(1).atHour(tunti)
    .inTimezone(tz()).create();
  ilmoita('Päivittäinen ajo asennettu klo ' + tunti + '.');
}

function rakennaOtsikot(sh, nimi, leveydet) {
  const otsikot = Object.values(SAR[nimi]);
  sh.getRange(1, 1, 1, otsikot.length).setValues([otsikot])
    .setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff').setWrap(true)
    .setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 34);
  (leveydet || []).forEach((w, i) => { if (w) sh.setColumnWidth(i + 1, w); });
  const ylim = sh.getMaxColumns();
  if (ylim > otsikot.length + 2) sh.deleteColumns(otsikot.length + 3, ylim - otsikot.length - 2);
  return otsikot;
}

function sarakeRange(sh, nimi, avain, rivit) {
  const sar = Object.keys(SAR[nimi]).indexOf(avain) + 1;
  return sh.getRange(2, sar, rivit || sh.getMaxRows() - 1, 1);
}

function lista(arvot, salliMuut) {
  return SpreadsheetApp.newDataValidation().requireValueInList(arvot, true)
    .setAllowInvalid(!!salliMuut).build();
}

function paivamaara() {
  return SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false)
    .setHelpText('Kirjoita päivämäärä, esim. 1.12.2026').build();
}

function rakennaKaupat(sh, nyt) {
  rakennaOtsikot(sh, V.kaupat, [200, 200, 140, 140, 70, 100, 100, 100, 90, 100, 100, 220, 100, 160, 240, 90]);
  const n = V.kaupat;
  sarakeRange(sh, n, 'vaihe').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(SpreadsheetApp.getActive().getRange(V.asetukset + '!E2:E20'), true).build());
  sarakeRange(sh, n, 'lahde').setDataValidation(lista(LAHTEET, true));
  ['kerta', 'kk'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('#,##0 "€"'));
  sarakeRange(sh, n, 'tod').setNumberFormat('0%');
  ['lasku1', 'lasku2', 'kkAlkaa', 'kkPaattyy'].forEach((s) =>
    sarakeRange(sh, n, s).setNumberFormat('mm/yyyy').setDataValidation(paivamaara()));
  ['seuraavaPvm', 'luotu'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('d.m.yyyy'));
  sarakeRange(sh, n, 'seuraavaPvm').setDataValidation(paivamaara());

  const muistiot = {
    vaihe: 'Liidi 10 %, Palaveri sovittu 25 %, Tarjous lähetetty 50 %, Neuvottelu 75 %, Voitettu 100 %, Hävitty 0 %. Todennäköisyydet: Asetukset-välilehti.',
    kerta: 'Projektin kertahinta alv 0.',
    lasku1: 'Kuukausi, jona ensimmäinen lasku lähtee. Mikä tahansa kuun päivä käy.\nJos Loppulasku kk on täytetty, kertatulo jaetaan 50/50 näille kuukausille.',
    lasku2: 'Valinnainen. Esim. 50 % tilauksesta, 50 % julkaisusta.',
    kk: 'Kuukausittainen tulo kaupasta: ylläpito, hosting, markkinointi tai booking engine -tilaus.',
    kkAlkaa: 'Ensimmäinen kuukausi, jolta kk-tulo laskutetaan. Tyhjä = Loppulasku kk, sen puuttuessa 1. lasku kk.',
    tod: 'Täyttyy automaattisesti vaiheen mukaan. Älä kirjoita tähän sarakkeeseen.',
  };
  Object.keys(muistiot).forEach((s) => {
    sh.getRange(1, Object.keys(SAR[n]).indexOf(s) + 1).setNote(muistiot[s]);
  });

  // Lähtötilanne: marraskuun verkkosivuprojekti
  kirjoitaRivi(sh, n, 2, {
    asiakas: 'Verkkosivuasiakas', kuvaus: 'Verkkosivuprojekti', lahde: 'Muu', vaihe: VOITETTU,
    kerta: 1000, lasku1: pvmSolu(nyt + '-01'), seuraava: 'Laskuta', seuraavaPvm: pvmSolu(tanaanAvain()),
    muistiinpano: 'Vaihda asiakkaan nimi.', luotu: new Date(),
  });
}

function rakennaLiidit(sh) {
  rakennaOtsikot(sh, V.liidit, [180, 100, 110, 120, 200, 110, 140, 160, 100, 110, 300, 300, 260, 110,
    55, 90, 120, 100, 90, 120, 100, 110, 110, 200, 90]);
  const n = V.liidit;
  sarakeRange(sh, n, 'tila').setDataValidation(lista(LIIDITILAT));
  sarakeRange(sh, n, 'segmentti').setDataValidation(lista(SEGMENTIT, true));
  sarakeRange(sh, n, 'liTila').setDataValidation(lista(LI_TILAT));
  sarakeRange(sh, n, 'soitto').setDataValidation(lista(SOITTOTILAT, true));
  ['aloitettu', 'viimeksi', 'vastausPvm', 'lisatty'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('d.m.yyyy'));
  sarakeRange(sh, n, 'seuraava').setNumberFormat('d.m.yyyy');
  ['havainto', 'ehdotus', 'signaalit'].forEach((s) => sarakeRange(sh, n, s).setWrap(true));
  ['ketju', 'luonnos', 'vaihe', 'aloitettu', 'viimeksi', 'seuraava', 'vastausPvm', 'ehdotus', 'signaalit']
    .forEach((s) => sh.getRange(1, Object.keys(SAR[n]).indexOf(s) + 1).setBackground('#4b5563'));

  const muistiot = {
    yritys: 'Pakollinen. Näkyy viestin aiheessa: "{{yritys}} / verkkosivut".',
    email: 'Yrityksen työosoite, joka liittyy vastaanottajan rooliin. Kun liität rivejä, Tila ja Lisätty täyttyvät itsestään.',
    segmentti: 'Matkailu tai Yleinen. Viestipohja valitaan tämän mukaan (tyhjä = Yleinen).',
    havainto: 'Täsmäiskun ydin: yksi havainto yrityksen omalta sivulta. Kirjoita pienellä alkukirjaimella ja ilman pistettä, koska se jatkaa lausetta "huomasin, että …".\n\nEsim. "varaukset ohjautuvat sivuilta Booking.comiin, jolloin jokaisesta varauksesta lähtee välityspalkkio"',
    ehdotus: 'Sivustotarkistuksen ehdotus. Kopioi Havainto-sarakkeeseen, kun olet tarkistanut sen sivulta itse.',
    signaalit: 'Valikko Laskutusmoottori → Tarkista sivustot. Kone tarkistaa myös itse jonon seuraavat sivustot joka aamu.',
    tila: 'Kone päivittää: Uusi → Luonnos → Sekvenssissä → Vastasi / Ei vastausta / Pomppasi.\nSinä päivität: Palaveri, Kauppa, Ei kiinnosta, Älä ota yhteyttä, Tauko.',
    vaihe: 'Montako viestiä on lähtenyt. Kone päivittää.',
    liTila: 'Kone merkitsee "Tehtävälistalla", kun profiili on päivän LinkedIn-listalla. Päivitä itse, kun olet lähettänyt kutsun.',
    soitto: 'Kone merkitsee "Soittolistalla". Päivitä soiton tulos itse.',
  };
  Object.keys(muistiot).forEach((s) => sh.getRange(1, Object.keys(SAR[n]).indexOf(s) + 1).setNote(muistiot[s]));
}

function rakennaLaskut(sh) {
  rakennaOtsikot(sh, V.laskut, [110, 200, 300, 120, 120, 100, 260]);
  const n = V.laskut;
  sarakeRange(sh, n, 'kk').setNumberFormat('mm/yyyy').setDataValidation(paivamaara());
  sarakeRange(sh, n, 'summa').setNumberFormat('#,##0 "€"');
  sarakeRange(sh, n, 'tila').setDataValidation(lista(LASKUTILAT));
  sarakeRange(sh, n, 'pvm').setNumberFormat('d.m.yyyy');
  sh.getRange(1, 1).setNote('Kone lisää joka kuun 1. päivä kuun laskutettavat rivit (toistuvat tulot ja voitetut kaupat), tilana Laskuttamatta.\n\nKun lasku on lähtenyt, vaihda tila Lähetetty ja korjaa summa toteutuneeksi. Vain Lähetetty ja Maksettu lasketaan laskutetuksi.\n\nKertaluonteiset laskut voit lisätä omina riveinään.');
  sh.getRange(1, Object.keys(SAR[n]).indexOf('tunniste') + 1).setNote('Koneen tunniste, jolla sama rivi ei synny kahdesti. Omille riveille jätä tyhjäksi.');
}

function rakennaToistuvat(sh, nyt) {
  rakennaOtsikot(sh, V.toistuvat, [340, 200, 120, 100, 100, 420]);
  const n = V.toistuvat;
  sarakeRange(sh, n, 'summa').setNumberFormat('#,##0 "€"');
  ['alkaa', 'paattyy'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('mm/yyyy').setDataValidation(paivamaara()));
  sh.getRange(1, 1).setNote('Sopimuspohjaiset kuukausitulot. Päättyy tyhjä = toistaiseksi voimassa.\nVoitetuista kaupoista tuleva kk-tulo kirjataan Kaupat-välilehdelle, ei tänne.');
  const alku = pvmSolu(nyt + '-01');
  const rivit = [
    ['Book Lapland / SkyView / hosting – kehitys ja markkinointi', 'Book Lapland', 8000, alku, '', 'Päivätyö.'],
    ['Markkinointiboosti Oy – myyntiprovisio', 'Markkinointiboosti Oy', 2000, alku, '', 'Vaihtelee 2 000–3 000 €. Korjaa toteuma Laskut-välilehdelle laskutettaessa.'],
    ['Konsultointi, kuukausisopimus', 'Konsultointiasiakas', 1000, alku, '', 'Toistaiseksi voimassa. Vaihda asiakkaan nimi.'],
    ['Nordic Host – ei nostoja', 'Nordic Host', 0, alku, '', 'Kaikki kasvuun 2–3 vuotta. Varaventtiili: 1 000–1 500 €/kk olisi mahdollista nostaa.'],
  ];
  sh.getRange(2, 1, rivit.length, rivit[0].length).setValues(rivit);
}

function rakennaTavoitteet(sh, nyt) {
  rakennaOtsikot(sh, V.tavoitteet, [120, 150, 480]);
  const n = V.tavoitteet;
  sarakeRange(sh, n, 'kk').setNumberFormat('mm/yyyy').setDataValidation(paivamaara());
  sarakeRange(sh, n, 'tavoite').setNumberFormat('#,##0 "€"');
  const portaat = { '2026-11': 15000, '2026-12': 15000, '2027-01': 15000, '2027-02': 15000, '2027-03': 16000,
    '2027-04': 17000, '2027-05': 18000, '2027-06': 19000 };
  const selitteet = {
    '2026-11': 'Pohja 11 000 € + verkkosivuprojekti 1 000 € → puuttuu 3 000 €.',
    '2027-01': 'Booking engine julkaistu, markkinointi käyntiin.',
    '2027-03': 'Ensimmäiset booking engine -asiakkaat.',
    '2027-07': 'Tavoitetaso 20 000 €/kk.',
  };
  const rivit = [];
  for (let i = 0; i < 14; i++) {
    const kk = kkLisaa(nyt, i);
    rivit.push([pvmSolu(kk + '-01'), portaat[kk] || (kk > '2027-06' ? 20000 : 15000), selitteet[kk] || '']);
  }
  sh.getRange(2, 1, rivit.length, 3).setValues(rivit);
  sh.getRange(1, 1).setNote('Yksi rivi per kuukausi. Lisää rivejä sitä mukaa kuin suunnitelma tarkentuu.');
}

function rakennaPohjat(sh) {
  rakennaOtsikot(sh, V.pohjat, [80, 100, 90, 260, 720]);
  sh.getRange(2, 1, POHJAT_OLETUS.length, 5).setValues(POHJAT_OLETUS);
  sh.getRange(2, 5, POHJAT_OLETUS.length, 1).setWrap(true);
  sh.getRange(2, 1, POHJAT_OLETUS.length, 5).setVerticalAlignment('top');
  sh.getRange(1, 1).setNote('Vaihe 1 = avausviesti, 2 ja 3 = jatkoviestit samaan ketjuun. LinkedIn = viesti päivän LinkedIn-listalle.\n\nSegmentti: tyhjä = oletuspohja kaikille. Jos liidin segmentille on oma pohja, käytetään sitä.');
  sh.getRange(1, 3).setNote('Montako arkipäivää edellisestä viestistä odotetaan ennen tätä viestiä.');
  sh.getRange(1, 4).setNote('Vain vaihe 1. Jatkoviestit lähtevät samaan ketjuun aiheella "Re: …".');
  sh.getRange(1, 5).setNote('Muuttujat: {{etunimi}} {{sukunimi}} {{yritys}} {{rooli}} {{sivusto}} {{paikkakunta}} {{havainto}} {{nimi}} {{allekirjoitus}} {{referenssi}}\n\nJos etunimi puuttuu, "Hei {{etunimi}}," muuttuu muotoon "Hei,".');
}

function rakennaAsetukset(sh) {
  sh.getRange(1, 1, 1, 3).setValues([['Asetus', 'Arvo', 'Selite']]);
  sh.getRange(1, 5, 1, 2).setValues([['Kaupan vaihe', 'Todennäköisyys']]);
  [sh.getRange(1, 1, 1, 3), sh.getRange(1, 5, 1, 2)].forEach((r) =>
    r.setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff'));
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 300).setColumnWidth(2, 320).setColumnWidth(3, 560).setColumnWidth(4, 30)
    .setColumnWidth(5, 160).setColumnWidth(6, 120);

  const oma = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  const rivit = ASETUSRIVIT.map(([avain, otsikko, oletus, selite]) =>
    [otsikko, avain === 'raportti' ? oma : oletus, selite]);
  sh.getRange(2, 1, rivit.length, 3).setValues(rivit).setVerticalAlignment('top');
  sh.getRange(2, 3, rivit.length, 1).setWrap(true).setFontColor('#6b7280');
  sh.getRange(2, 2, rivit.length, 1).setWrap(true).setBackground('#fffbea');

  ASETUSRIVIT.forEach(([avain, , oletus, , muoto], i) => {
    const solu = sh.getRange(i + 2, 2);
    if (avain === 'tila') solu.setDataValidation(lista(TILAT)).setFontWeight('bold');
    if (typeof oletus === 'boolean') solu.insertCheckboxes().setValue(oletus);
    if (muoto === 'pct') solu.setNumberFormat('0.0%');
    if (muoto === 'eur') solu.setNumberFormat('#,##0 "€"');
  });

  sh.getRange(2, 5, VAIHEET_OLETUS.length, 2).setValues(VAIHEET_OLETUS);
  sh.getRange(2, 6, 19, 1).setNumberFormat('0%');
  SpreadsheetApp.getActive().setNamedRange('VAIHEET', sh.getRange('E2:F20'));
  sh.getRange(1, 5).setNote('Voitettu ja Hävitty ovat koneelle erityisiä – älä nimeä niitä uudelleen. Muita vaiheita voit lisätä alle.');
}

function rakennaLoki(sh) {
  rakennaOtsikot(sh, V.loki, [150, 180, 260, 520]);
  sarakeRange(sh, V.loki, 'aika').setNumberFormat('d.m.yyyy HH:mm');
}

function luoKaavio(sh) {
  try {
    const alku = KL.kk;
    const loppu = KL.kk + KL.kkRiveja;
    const kaavio = sh.newChart()
      .asComboChart()
      .addRange(sh.getRange(alku, 1, loppu - alku + 1, 2)) // Kuukausi + Tavoite
      .addRange(sh.getRange(alku, 7, loppu - alku + 1, 2)) // Ennuste + Laskutettu
      .setNumHeaders(1)
      .setOption('title', 'Tavoite, ennuste ja laskutettu')
      .setOption('seriesType', 'bars')
      .setOption('series', { 0: { type: 'line', color: '#111827', lineWidth: 3 }, 1: { color: '#93c5fd' }, 2: { color: '#16a34a' } })
      .setOption('legend', { position: 'bottom' })
      .setOption('width', 760)
      .setOption('height', 340)
      .setPosition(KL.kpi, 12, 0, 0)
      .build();
    sh.insertChart(kaavio);
  } catch (e) {
    Logger.log('Kaavion luonti ei onnistunut: ' + e.message);
  }
}

// ───────────────────────────── Valikko ja muokkaukset ─────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Laskutusmoottori')
    .addItem('Päivitä kojelauta', 'paivitaKojelauta')
    .addItem('Esikatsele tämän päivän viestit', 'esikatsele')
    .addItem('Tarkista sivustot', 'tarkistaSivustot')
    .addItem('Siirrä valittu liidi kauppoihin', 'siirraKauppoihin')
    .addSeparator()
    .addItem('Aja päivän kierros nyt', 'paivittainen')
    .addItem('Lähetä viikkoraportti nyt', 'lahetaViikkoraportti')
    .addItem('Luo tämän kuun laskutuslista', 'valikkoLaskutuslista')
    .addItem('Asenna ajastus uudelleen', 'asennaAjastus')
    .addToUi();
}

/** Yksinkertainen muokkaustriggeri: täyttää oletukset ja pitää kojelaudan ajan tasalla. */
function onEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  const nimi = sh.getName();
  if (nimi === V.kojelauta || nimi === V.loki) return;
  try {
    if (nimi === V.liidit) taytaLiidienOletukset(sh, e.range);
    if (nimi === V.kaupat) taytaKaupanOletukset(sh, e.range);
    paivitaKojelauta();
  } catch (err) {
    // Puuttuva sarake tms. – näytetään, mutta ei kaadeta muokkausta
    e.source.toast(err.message, 'Laskutusmoottori', 8);
  }
}

function taytaLiidienOletukset(sh, range) {
  const t = otsikkoIndeksit(sh, V.liidit);
  const alku = Math.max(2, range.getRow());
  const loppu = range.getLastRow();
  if (loppu < alku) return;
  const alue = sh.getRange(alku, 1, loppu - alku + 1, t.leveys);
  const arvot = alue.getValues();
  let muuttui = false;
  arvot.forEach((r) => {
    if (!teksti(r[t.idx.email]) && !teksti(r[t.idx.yritys])) return;
    if (teksti(r[t.idx.email]) && !teksti(r[t.idx.tila])) { r[t.idx.tila] = 'Uusi'; muuttui = true; }
    if (!r[t.idx.lisatty]) { r[t.idx.lisatty] = new Date(); muuttui = true; }
    if (r[t.idx.vaihe] === '') { r[t.idx.vaihe] = 0; muuttui = true; }
  });
  if (muuttui) {
    // Kirjoitetaan vain koneen sarakkeet, jotta käyttäjän juuri liittämät arvot pysyvät koskemattomina
    ['tila', 'lisatty', 'vaihe'].forEach((s) => {
      sh.getRange(alku, t.idx[s] + 1, arvot.length, 1).setValues(arvot.map((r) => [r[t.idx[s]]]));
    });
  }
}

function taytaKaupanOletukset(sh, range) {
  const t = otsikkoIndeksit(sh, V.kaupat);
  const alku = Math.max(2, range.getRow());
  const loppu = range.getLastRow();
  if (loppu < alku) return;
  const asiakkaat = sh.getRange(alku, t.idx.asiakas + 1, loppu - alku + 1, 1).getValues();
  const luodut = sh.getRange(alku, t.idx.luotu + 1, loppu - alku + 1, 1).getValues();
  let muuttui = false;
  luodut.forEach((r, i) => {
    if (teksti(asiakkaat[i][0]) && !r[0]) { r[0] = new Date(); muuttui = true; }
  });
  if (muuttui) sh.getRange(alku, t.idx.luotu + 1, luodut.length, 1).setValues(luodut);
}

/** Valikko: siirtää aktiivisen rivin liidin Kaupat-välilehdelle vaiheeseen Palaveri sovittu. */
function siirraKauppoihin() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  if (sh.getName() !== V.liidit) throw new Error('Valitse ensin rivi Liidit-välilehdeltä.');
  const rivi = sh.getActiveRange().getRow();
  if (rivi < 2) throw new Error('Valitse liidin rivi.');
  const t = lueTaulu(V.liidit);
  const l = t.rivit.find((r) => r._rivi === rivi);
  if (!l) throw new Error('Rivillä ei ole liidiä.');
  const a = lueAsetukset();
  const kaupat = ss.getSheetByName(V.kaupat);
  const k = lueTaulu(V.kaupat);
  const uusiRivi = k.rivit.reduce((m, r) => Math.max(m, r._rivi), 1) + 1;
  kirjoitaRivi(kaupat, V.kaupat, uusiRivi, {
    asiakas: teksti(l.yritys) || teksti(l.email),
    kuvaus: 'Verkkosivuprojekti',
    lahde: luku(l.vaihe) >= 1 ? 'Sähköposti' : (teksti(l.liTila) ? 'LinkedIn' : 'Muu'),
    vaihe: 'Palaveri sovittu',
    kerta: luku(a.keskikauppa) || 2500,
    lasku1: pvmSolu(kkLisaa(tanaanAvain().slice(0, 7), 1) + '-01'),
    seuraava: 'Palaveri',
    seuraavaPvm: pvmSolu(lisaaArkipaivia(tanaanAvain(), 2)),
    yhteys: [teksti(l.etunimi), teksti(l.sukunimi), teksti(l.email), teksti(l.puhelin)].filter(String).join(' '),
    muistiinpano: teksti(l.havainto),
    luotu: new Date(),
  });
  tallenna(t, rivi, { tila: 'Kauppa' });
  loki('Siirretty kauppoihin', teksti(l.yritys), 'Kaupat rivi ' + uusiRivi);
  paivitaKojelauta();
  ss.setActiveSheet(kaupat);
  kaupat.setActiveRange(kaupat.getRange(uusiRivi, 1));
  ilmoita('Siirretty Kaupat-välilehdelle. Tarkista arvo ja laskutuskuukausi.');
}

function valikkoLaskutuslista() {
  const n = luoLaskutuslista(tanaanAvain().slice(0, 7));
  paivitaKojelauta();
  ilmoita(n ? n + ' riviä lisätty Laskut-välilehdelle.' : 'Kaikki tämän kuun rivit olivat jo listalla.');
}

// ───────────────────────────── Päivittäinen kierros ─────────────────────────────

/** Ajastettu joka aamu: kojelauta, laskutuslista, vastaukset, viestit, tehtävät ja kooste. */
function paivittainen() {
  const lukko = LockService.getScriptLock();
  if (!lukko.tryLock(20000)) return;
  try {
    const tanaan = tanaanAvain();
    const nyt = tanaan.slice(0, 7);
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty('LASKUTUSLISTA_KK') !== nyt) {
      const n = luoLaskutuslista(nyt);
      props.setProperty('LASKUTUSLISTA_KK', nyt);
      loki('Laskutuslista', kkNimi(nyt), n + ' riviä');
    }

    let d = lueKaikki();
    const a = d.malli.asetukset;
    const raportti = { lahetetyt: [], luonnokset: [], jatkot: [], vastaukset: [], pomput: [], loppuneet: [],
      tuplat: [], virheet: [], esikatselu: [], linkedin: [], soitot: [], tarkistetut: 0 };

    tarkistaKetjut(d, raportti);
    tarkistaJononSivustot(20, 120);

    d = lueKaikki();
    let tulos = laske(d.malli, tanaan);
    const lahetyspaiva = !a.arkisin || onArkipaiva(tanaan);
    if (lahetyspaiva) {
      const suunnitelma = suunnittele(d.malli, tulos.kone.kiintio, tanaan, a.tila === 'TESTI');
      toteuta(suunnitelma, d, raportti);
      const tehtavat = valitseTehtavat(d.malli);
      merkitseTehtavat(tehtavat, d, raportti, a.tila === 'TESTI');
    }

    d = lueKaikki();
    tulos = laske(d.malli, tanaan);
    kirjoitaKojelauta(tulos);

    const maanantai = viikonpaiva(tanaan) === 1;
    const sisaltoa = raportti.vastaukset.length || raportti.pomput.length ||
      (lahetyspaiva && (raportti.lahetetyt.length || raportti.luonnokset.length || raportti.jatkot.length ||
        raportti.linkedin.length || raportti.soitot.length || raportti.esikatselu.length));
    // Virheet ja vastaukset tulevat aina tietoon, vaikka päivittäinen kooste olisi pois päältä
    if (maanantai || raportti.vastaukset.length || raportti.virheet.length || (a.kooste && sisaltoa)) {
      lahetaKooste(tulos, raportti, a, maanantai);
    }
    siivoaLoki();
  } finally {
    lukko.releaseLock();
  }
}

function lahetaViikkoraportti() {
  const d = lueKaikki();
  const tulos = laske(d.malli, tanaanAvain());
  kirjoitaKojelauta(tulos);
  lahetaKooste(tulos, tyhjaRaportti(), d.malli.asetukset, true);
  ilmoita('Viikkoraportti lähetetty osoitteeseen ' + raporttiOsoite(d.malli.asetukset) + '.');
}

function tyhjaRaportti() {
  return { lahetetyt: [], luonnokset: [], jatkot: [], vastaukset: [], pomput: [], loppuneet: [], tuplat: [],
    virheet: [], esikatselu: [], linkedin: [], soitot: [], tarkistetut: 0 };
}

/** Valikko: näyttää, mitä tänään lähtisi – ei lähetä eikä muuta mitään. */
function esikatsele() {
  const d = lueKaikki();
  const tanaan = tanaanAvain();
  const tulos = laske(d.malli, tanaan);
  const s = suunnittele(d.malli, tulos.kone.kiintio, tanaan, true);
  const kaikki = s.jatkot.concat(s.uudet);
  let html = '<div style="font:14px/1.5 Arial,sans-serif;color:#111">' +
    '<p><b>Tila: ' + esc(d.malli.asetukset.tila) + '</b> · kiintiö tänään ' + tulos.kone.kiintio +
    ' uutta kontaktia · jonossa ' + tulos.kone.jonossa + ' · odottaa havaintoa ' + tulos.kone.odottaaHavaintoa + '</p>';
  if (!kaikki.length) {
    html += '<p>Tänään ei lähtisi yhtään viestiä. Lisää Liidit-välilehdelle liidejä, joilla on sähköposti ja havainto.</p>';
  }
  html += viestitHtml(kaikki) + '</div>';
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(860).setHeight(640), 'Tämän päivän viestit (' + kaikki.length + ')');
}

/** Toteuttaa suunnitelman tilan mukaan. TESTI: vain esikatselu koosteeseen. */
function toteuta(s, d, raportti) {
  const a = d.malli.asetukset;
  const liidit = d.taulut.lii;
  s.tuplat.forEach((l) => {
    tallenna(liidit, l._rivi, { tila: 'Tupla' });
    raportti.tuplat.push(l);
  });
  s.loppuneet.forEach((l) => {
    tallenna(liidit, l._rivi, { tila: 'Ei vastausta', seuraava: '' });
    raportti.loppuneet.push(l);
  });
  s.ohitetut.forEach((x) => raportti.virheet.push('Ohitettu ' + x.liidi.yritys + ' <' + x.liidi.email + '>: ' + x.syy));
  const kaikki = s.jatkot.concat(s.uudet);
  if (a.tila === 'TESTI') {
    raportti.esikatselu = kaikki;
    return;
  }
  if (!teksti(a.nimi)) {
    raportti.virheet.push('Täytä Asetukset-välilehdelle Nimesi – viestejä ei lähetetty.');
    return;
  }
  const omat = omatOsoitteet(a);
  const lahettaja = teksti(a.alias) || Session.getEffectiveUser().getEmail();
  const tanaan = tanaanAvain();
  kaikki.forEach((item) => {
    const l = item.liidi;
    try {
      if (item.tyyppi === 'uusi') {
        const mime = rakennaMime({ to: l.email, fromName: a.nimi, fromEmail: lahettaja, subject: item.aihe, body: item.viesti });
        if (a.tila === 'LUONNOS') {
          const luonnos = Gmail.Users.Drafts.create({ message: { raw: Utilities.base64EncodeWebSafe(mime) } }, 'me');
          tallenna(liidit, l._rivi, { tila: 'Luonnos', luonnos: luonnos.id, ketju: luonnos.message.threadId });
          raportti.luonnokset.push(item);
          loki('Luonnos', l.yritys + ' <' + l.email + '>', 'Vaihe 1');
        } else {
          const viesti = Gmail.Users.Messages.send({ raw: Utilities.base64EncodeWebSafe(mime) }, 'me');
          tallenna(liidit, l._rivi, {
            tila: 'Sekvenssissä', vaihe: 1, aloitettu: new Date(), viimeksi: new Date(), ketju: viesti.threadId,
            seuraava: pvmSolu(seuraavaLahetys(d.malli.pohjat, l.segmentti, 1, tanaan, a)),
          });
          raportti.lahetetyt.push(item);
          loki('Lähetetty', l.yritys + ' <' + l.email + '>', 'Vaihe 1');
        }
      } else {
        const ketju = GmailApp.getThreadById(l.ketju);
        if (!ketju) throw new Error('Gmail-ketjua ei löytynyt');
        const omatViestit = ketju.getMessages().filter((m) => !m.isDraft() && onOma(m.getFrom(), omat));
        if (!omatViestit.length) throw new Error('Ketjussa ei ole lähetettyä viestiä');
        const viitteet = omatViestit.map((m) => m.getHeader('Message-ID')).filter(String);
        const mime = rakennaMime({
          to: l.email, fromName: a.nimi, fromEmail: lahettaja,
          subject: 'Re: ' + omatViestit[0].getSubject().replace(/^((re|vs|sv|aw)\s*:\s*)+/i, ''),
          body: item.viesti, inReplyTo: viitteet[viitteet.length - 1], references: viitteet.join(' '),
        });
        const raw = Utilities.base64EncodeWebSafe(mime);
        if (a.tila === 'LUONNOS') {
          const luonnos = Gmail.Users.Drafts.create({ message: { raw: raw, threadId: l.ketju } }, 'me');
          tallenna(liidit, l._rivi, { luonnos: luonnos.id });
          raportti.luonnokset.push(item);
          loki('Luonnos', l.yritys + ' <' + l.email + '>', 'Vaihe ' + item.vaihe);
        } else {
          Gmail.Users.Messages.send({ raw: raw, threadId: l.ketju }, 'me');
          tallenna(liidit, l._rivi, {
            vaihe: item.vaihe, viimeksi: new Date(),
            seuraava: pvmSolu(seuraavaLahetys(d.malli.pohjat, l.segmentti, item.vaihe, tanaan, a)),
          });
          raportti.jatkot.push(item);
          loki('Lähetetty', l.yritys + ' <' + l.email + '>', 'Vaihe ' + item.vaihe);
        }
      }
    } catch (e) {
      raportti.virheet.push(l.yritys + ' <' + l.email + '>: ' + e.message);
      loki('Virhe', l.yritys + ' <' + l.email + '>', e.message);
    }
  });
}

/** Tarkistaa lähetettyjen ja luonnosteltujen ketjujen tilan: vastaukset, pomput ja lähetetyt luonnokset. */
function tarkistaKetjut(d, raportti) {
  const a = d.malli.asetukset;
  const liidit = d.taulut.lii;
  const omat = omatOsoitteet(a);
  d.malli.liidit.forEach((l) => {
    if (l.tila !== 'Luonnos' && l.tila !== 'Sekvenssissä') return;
    if (!l.ketju && !l.luonnos) return;
    try {
      let ketju = haeKetju(l.ketju);
      let viestit = ketju ? ketju.getMessages() : [];

      if (l.luonnos && !luonnosOlemassa(l.luonnos)) {
        let lahetetyt = viestit.filter((m) => !m.isDraft() && onOma(m.getFrom(), omat));
        if (lahetetyt.length <= l.vaihe) {
          const loydetty = etsiLahetettyKetju(l.email);
          if (loydetty) {
            ketju = loydetty;
            viestit = ketju.getMessages();
            lahetetyt = viestit.filter((m) => !m.isDraft() && onOma(m.getFrom(), omat));
          }
        }
        if (lahetetyt.length > l.vaihe) {
          const viimeinen = lahetetyt[lahetetyt.length - 1].getDate();
          const muutos = {
            luonnos: '', tila: 'Sekvenssissä', vaihe: lahetetyt.length, viimeksi: viimeinen, ketju: ketju.getId(),
            seuraava: pvmSolu(seuraavaLahetys(d.malli.pohjat, l.segmentti, lahetetyt.length, pvAvain(viimeinen), a)),
          };
          if (!l.aloitettu) muutos.aloitettu = lahetetyt[0].getDate();
          tallenna(liidit, l._rivi, muutos);
          Object.assign(l, { tila: 'Sekvenssissä', vaihe: lahetetyt.length });
          loki('Luonnos lähetetty', l.yritys + ' <' + l.email + '>', 'Vaihe ' + lahetetyt.length);
        } else {
          tallenna(liidit, l._rivi, { luonnos: '', tila: 'Tauko', muistiinpano: lisaaMuistiinpano(l.muistiinpano, 'Luonnos poistettu ' + suomiPvm(tanaanAvain())) });
          loki('Luonnos poistettu', l.yritys + ' <' + l.email + '>', 'Tila Tauko');
          return;
        }
      }

      for (const m of viestit) {
        if (m.isDraft() || onOma(m.getFrom(), omat)) continue;
        const luokka = luokitteleVastaus(m.getFrom(), m.getSubject(), m.getHeader('Auto-Submitted'));
        if (luokka === 'automaattinen') continue;
        poistaLuonnos(l.luonnos);
        if (luokka === 'pomppu') {
          tallenna(liidit, l._rivi, { tila: 'Pomppasi', seuraava: '', luonnos: '' });
          raportti.pomput.push(l);
          loki('Pomppasi', l.yritys + ' <' + l.email + '>', m.getSubject());
        } else {
          tallenna(liidit, l._rivi, { tila: 'Vastasi', vastausPvm: m.getDate(), seuraava: '', luonnos: '' });
          raportti.vastaukset.push({ liidi: l, linkki: ketju.getPermalink(), ote: lyhenna(m.getPlainBody(), 400) });
          loki('Vastasi', l.yritys + ' <' + l.email + '>', lyhenna(m.getPlainBody(), 120));
        }
        break;
      }
    } catch (e) {
      raportti.virheet.push('Ketjun tarkistus ' + l.yritys + ': ' + e.message);
    }
  });
}

function haeKetju(id) {
  if (!id) return null;
  try {
    return GmailApp.getThreadById(String(id));
  } catch (e) {
    return null;
  }
}

function luonnosOlemassa(id) {
  try {
    Gmail.Users.Drafts.get('me', String(id), { format: 'minimal' });
    return true;
  } catch (e) {
    return false;
  }
}

function poistaLuonnos(id) {
  if (!id) return;
  try {
    Gmail.Users.Drafts.remove('me', String(id));
  } catch (e) {
    // luonnos on jo lähetetty tai poistettu
  }
}

function etsiLahetettyKetju(email) {
  const ketjut = GmailApp.search('in:sent to:' + email + ' newer_than:60d', 0, 1);
  return ketjut.length ? ketjut[0] : null;
}

function omatOsoitteet(a) {
  const osoitteet = [Session.getEffectiveUser().getEmail(), teksti(a.alias)];
  try {
    GmailApp.getAliases().forEach((x) => osoitteet.push(x));
  } catch (e) {
    // ei aliaksia
  }
  return new Set(osoitteet.filter(String).map((x) => x.toLowerCase()));
}

function merkitseTehtavat(t, d, raportti, testi) {
  const liidit = d.taulut.lii;
  const a = d.malli.asetukset;
  const liPohja = haePohja(d.malli.pohjat, 'LinkedIn', '');
  t.li.forEach((l) => {
    const viesti = liPohja ? renderoiViesti(liPohja, l, a, true).viesti : '';
    raportti.linkedin.push({ liidi: l, viesti: viesti });
    if (!testi) tallenna(liidit, l._rivi, { liTila: 'Tehtävälistalla' });
  });
  t.soitot.forEach((l) => {
    raportti.soitot.push({ liidi: l });
    if (!testi) tallenna(liidit, l._rivi, { soitto: 'Soittolistalla' });
  });
}

// ───────────────────────────── Laskutuslista ─────────────────────────────

/** Lisää kuun laskutettavat rivit Laskut-välilehdelle. Palauttaa lisättyjen rivien määrän. */
function luoLaskutuslista(kk) {
  const d = lueKaikki();
  const olemassa = new Set(d.malli.laskut.map((l) => l.tunniste).filter(String));
  const uudet = laskutusrivit(d.malli, kk).filter((r) => !olemassa.has(r.tunniste));
  if (!uudet.length) return 0;
  const sh = d.taulut.las.sh;
  const t = d.taulut.las;
  const rivit = uudet.map((r) => {
    const rivi = new Array(t.leveys).fill('');
    rivi[t.idx.kk] = pvmSolu(r.kk + '-01');
    rivi[t.idx.laskutettava] = r.laskutettava;
    rivi[t.idx.kuvaus] = r.kuvaus;
    rivi[t.idx.summa] = r.summa;
    rivi[t.idx.tila] = 'Laskuttamatta';
    rivi[t.idx.tunniste] = r.tunniste;
    return rivi;
  });
  const alku = Math.max(sh.getLastRow(), 1) + 1;
  sh.getRange(alku, 1, rivit.length, t.leveys).setValues(rivit);
  return rivit.length;
}

// ───────────────────────────── Sivustotarkistus ─────────────────────────────

/** Valikko: tarkistaa sivustot liideiltä, joilta tarkistus puuttuu. */
function tarkistaSivustot() {
  const n = tarkistaJononSivustot(40, 300);
  paivitaKojelauta();
  ilmoita(n.tarkistettu + ' sivustoa tarkistettu.' + (n.jaljella ? ' Jäljellä ' + n.jaljella + ' – aja uudelleen.' : ''));
}

/** Tarkistaa enintään `maara` sivustoa tai `sekunnit` sekuntia. Jonon kärki ensin. */
function tarkistaJononSivustot(maara, sekunnit) {
  const t = lueTaulu(V.liidit);
  const jono = t.rivit.filter((r) => teksti(r.sivusto) && !teksti(r.signaalit) &&
    ['Uusi', ''].includes(teksti(r.tila)));
  const alku = Date.now();
  const vuosi = Number(tanaanAvain().slice(0, 4));
  let tarkistettu = 0;
  for (const r of jono) {
    if (tarkistettu >= maara || Date.now() - alku > sekunnit * 1000) break;
    const sivu = haeSivu(teksti(r.sivusto));
    const tulos = analysoiSivu(sivu.html || '', sivu, teksti(r.segmentti), vuosi);
    const muutos = { signaalit: tulos.signaalit };
    if (!teksti(r.ehdotus)) muutos.ehdotus = tulos.havainto;
    tallenna(t, r._rivi, muutos);
    tarkistettu++;
  }
  return { tarkistettu: tarkistettu, jaljella: Math.max(0, jono.length - tarkistettu) };
}

function haeSivu(osoite) {
  let url = normalisoiUrl(osoite);
  if (!url) return { virhe: 'osoite puuttuu' };
  const alku = Date.now();
  const hae = (u) => UrlFetchApp.fetch(u, {
    followRedirects: false, muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Laskutusmoottori/1.0)', 'Accept-Language': 'fi,en;q=0.8' },
  });
  let vastaus;
  try {
    vastaus = hae(url);
  } catch (e) {
    if (/^https:/i.test(url) && !/^https?:\/\//i.test(String(osoite).trim())) {
      url = url.replace(/^https:/i, 'http:');
      try {
        vastaus = hae(url);
      } catch (e2) {
        return { virhe: lyhenna(e2.message, 80) };
      }
    } else {
      return { virhe: lyhenna(e.message, 80) };
    }
  }
  for (let hyppy = 0; hyppy < 6; hyppy++) {
    const koodi = vastaus.getResponseCode();
    if (koodi < 300 || koodi >= 400) break;
    const otsakkeet = vastaus.getHeaders();
    const sijainti = otsakkeet.Location || otsakkeet.location;
    if (!sijainti) break;
    url = absoluuttinen(url, String(sijainti));
    try {
      vastaus = hae(url);
    } catch (e) {
      return { virhe: lyhenna(e.message, 80), url: url };
    }
  }
  const koodi = vastaus.getResponseCode();
  if (koodi >= 400) return { virhe: 'HTTP ' + koodi, url: url };
  return { html: vastaus.getContentText(), url: url, https: /^https:/i.test(url), ms: Date.now() - alku,
    tavut: vastaus.getContent().length };
}

// ───────────────────────────── Kojelauta ─────────────────────────────

/** Lukee kaiken, laskee ja kirjoittaa kojelaudan. Ajetaan jokaisen muokkauksen jälkeen. */
function paivitaKojelauta() {
  const d = lueKaikki();
  const tulos = laske(d.malli, tanaanAvain());
  kirjoitaKojelauta(tulos);
  return tulos;
}

function kirjoitaKojelauta(t) {
  const sh = valilehti(V.kojelauta);
  const leveys = 10;
  sh.getRange(1, 1, KL.askeleet + KL.askelRiveja + 2, leveys).clear();
  const r = t.nyt;
  const a = t.asetukset;

  sh.getRange(1, 1, 1, 2).setValues([['Laskutusmoottori', 'Päivitetty ' + Utilities.formatDate(new Date(), tz(), 'd.M.yyyy HH.mm')]]);
  sh.getRange(1, 1).setFontSize(18).setFontWeight('bold');
  sh.getRange(1, 2).setFontColor('#6b7280');

  const kpi = [
    [kkNimi(r.kk).toUpperCase(), ''],
    ['Tavoite', r.tavoite],
    ['Laskutettu (lähetetyt laskut)', r.laskutettu],
    ['Varmistettu (toistuvat + voitetut)', r.varmistettu],
    ['Putki, painotettu', r.putki],
    ['Ennuste', r.ennuste],
    ['Vaje tavoitteeseen', r.vaje],
    ['Laskuttamatta (rästit)', t.laskuttamatta.summa],
    ['Suurimman asiakkaan osuus', t.keskittyma.osuus],
  ];
  const kone = [
    ['MYYNTIKONE', ''],
    ['Avoin vaje (tämä + ensi kk)', t.kone.avoinVaje],
    ['Tarvittavat kaupat', t.kone.kaupat],
    ['Tarvittavat palaverit', t.kone.palaverit],
    ['Tarvittavat kontaktit', t.kone.kontaktit],
    ['Jo kesken sekvenssissä', t.kone.kesken],
    ['Arkipäiviä ensi kuun loppuun', t.kone.arkipaivat],
    ['Kiintiö: uusia kontakteja / arkipäivä', t.kone.kiintio],
    ['Liidejä jonossa', t.kone.jonossa],
  ];
  const tai = (x) => (x === null || x === undefined ? '–' : x);
  const konv = [
    ['KONVERSIOT', 'Oletus', 'Toteutunut', 'Käytössä'],
    ['Kontakti → palaveri', a.kp, tai(t.konv.kpTot), t.konv.kp],
    ['Palaveri → kauppa', a.pk, tai(t.konv.pkTot), t.konv.pk],
    ['Keskikauppa', a.keskikauppa, tai(t.konv.keskikauppaTot), a.keskikauppa],
    ['Kontaktoitu yhteensä', '', t.konv.kontaktoidut, ''],
    ['Vastanneet', '', t.konv.vastanneet, ''],
    ['Palaverit', '', t.konv.palaverit, ''],
    ['Odottaa havaintoa', '', t.kone.odottaaHavaintoa, ''],
    ['', '', '', ''],
  ];
  sh.getRange(KL.kpi, 1, kpi.length, 2).setValues(kpi);
  sh.getRange(KL.kpi, 4, kone.length, 2).setValues(kone);
  sh.getRange(KL.kpi, 7, konv.length, 4).setValues(konv);

  [sh.getRange(KL.kpi, 1, 1, 2), sh.getRange(KL.kpi, 4, 1, 2), sh.getRange(KL.kpi, 7, 1, 4)]
    .forEach((x) => x.setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff'));
  sh.getRange(KL.kpi + 1, 2, 7, 1).setNumberFormat('#,##0 "€"');
  sh.getRange(KL.kpi + 8, 2).setNumberFormat('0%');
  sh.getRange(KL.kpi + 5, 1, 1, 2).setFontWeight('bold');
  sh.getRange(KL.kpi + 6, 2).setBackground(r.vaje > 0 ? '#fee2e2' : '#dcfce7').setFontWeight('bold');
  sh.getRange(KL.kpi + 7, 2).setBackground(t.laskuttamatta.summa > 0 ? '#fef3c7' : null);
  sh.getRange(KL.kpi + 8, 2).setBackground(t.keskittyma.osuus > 0.5 ? '#fef3c7' : null);
  sh.getRange(KL.kpi + 1, 5).setNumberFormat('#,##0 "€"');
  sh.getRange(KL.kpi + 2, 5, 3, 1).setNumberFormat('0.0');
  sh.getRange(KL.kpi + 7, 4, 1, 2).setFontWeight('bold').setFontSize(12);
  sh.getRange(KL.kpi + 7, 5).setBackground(t.kone.rajoitettu ? '#fee2e2' : '#dbeafe');
  sh.getRange(KL.kpi + 1, 8, 2, 3).setNumberFormat('0.0%');
  sh.getRange(KL.kpi + 3, 8, 1, 3).setNumberFormat('#,##0 "€"');
  sh.getRange(KL.kpi, 2, kpi.length, 1).setHorizontalAlignment('right');
  sh.getRange(KL.kpi, 5, kone.length, 1).setHorizontalAlignment('right');
  sh.getRange(KL.kpi, 8, konv.length, 3).setHorizontalAlignment('right');

  sh.getRange(KL.huomiot, 1).setValue('HUOMIOT').setFontWeight('bold');
  const huomiot = t.huomiot.slice(0, KL.huomioRiveja);
  if (huomiot.length) sh.getRange(KL.huomiot + 1, 1, huomiot.length, 1).setValues(huomiot.map((h) => [h]));

  const kkOtsikot = ['Kuukausi', 'Tavoite', 'Toistuvat', 'Voitetut kaupat', 'Varmistettu', 'Putki (painotettu)',
    'Ennuste', 'Laskutettu', 'Vaje', 'Tila'];
  sh.getRange(KL.kk, 1, 1, leveys).setValues([kkOtsikot])
    .setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff');
  const nytIdx = t.kuukaudet.findIndex((m) => m.kk === r.kk);
  const alkuIdx = Math.max(0, Math.min(nytIdx - 6, t.kuukaudet.length - KL.kkRiveja));
  const kkRivit = t.kuukaudet.slice(alkuIdx, alkuIdx + KL.kkRiveja);
  if (kkRivit.length) {
    const arvot = kkRivit.map((m) => [kkNimi(m.kk), m.tavoite, m.toistuvat, m.voitetut, m.varmistettu, m.putki,
      m.ennuste, m.laskutettu, m.vaje, m.tila]);
    sh.getRange(KL.kk + 1, 1, arvot.length, leveys).setValues(arvot);
    sh.getRange(KL.kk + 1, 2, arvot.length, 8).setNumberFormat('#,##0 "€"');
    kkRivit.forEach((m, i) => {
      const vari = m.kk === r.kk ? '#eff6ff' : null;
      sh.getRange(KL.kk + 1 + i, 1, 1, leveys).setBackground(vari);
      const merkki = m.tila.charAt(0);
      sh.getRange(KL.kk + 1 + i, leveys).setFontColor(merkki === '✓' ? '#15803d' : merkki === '–' ? '#6b7280' : '#b91c1c');
      if (m.kk === r.kk) sh.getRange(KL.kk + 1 + i, 1, 1, leveys).setFontWeight('bold');
    });
  }

  sh.getRange(KL.askeleet, 1).setValue('SEURAAVAT ASKELEET (KAUPAT)').setFontWeight('bold');
  sh.getRange(KL.askeleet + 1, 1, 1, 5).setValues([['Pvm', 'Asiakas', 'Seuraava askel', 'Vaihe', 'Arvo']])
    .setFontWeight('bold').setBackground('#e5e7eb');
  const askeleet = t.askeleet.slice(0, KL.askelRiveja).map((k) =>
    [k.seuraavaPvm ? suomiPvm(k.seuraavaPvm) : 'puuttuu', k.asiakas, k.seuraava || '– ei seuraavaa askelta –', k.vaihe, k.kerta + k.kk]);
  if (askeleet.length) {
    sh.getRange(KL.askeleet + 2, 1, askeleet.length, 5).setValues(askeleet);
    sh.getRange(KL.askeleet + 2, 5, askeleet.length, 1).setNumberFormat('#,##0 "€"');
  } else {
    sh.getRange(KL.askeleet + 2, 1).setValue('Ei avoimia kauppoja.').setFontColor('#6b7280');
  }
}

// ───────────────────────────── Kooste sähköpostiin ─────────────────────────────

function raporttiOsoite(a) {
  return teksti(a.raportti) || Session.getEffectiveUser().getEmail();
}

function lahetaKooste(tulos, raportti, a, viikko) {
  const k = rakennaKooste(tulos, raportti, a, viikko, SpreadsheetApp.getActiveSpreadsheet().getUrl());
  GmailApp.sendEmail(raporttiOsoite(a), k.aihe, k.teksti, { htmlBody: k.html, name: 'Laskutusmoottori' });
}

function rakennaKooste(t, r, a, viikko, taulukkoUrl) {
  const n = t.nyt;
  const pv = t.tanaan;
  const aihe = 'Laskutusmoottori ' + VIIKONPAIVAT[viikonpaiva(pv)] + ' ' + suomiPvm(pv) + ': ' + kkNimi(n.kk) +
    ' ' + eur(n.ennuste) + ' / ' + eur(n.tavoite) + (n.vaje > 0 ? ' (vaje ' + eur(n.vaje) + ')' : ' ✓') +
    (r.vastaukset.length ? ' · ' + r.vastaukset.length + ' vastausta' : '');
  const h = [];
  const osio = (otsikko) => h.push('<h3 style="margin:24px 0 8px;font-size:15px">' + esc(otsikko) + '</h3>');
  h.push('<div style="font:14px/1.5 Arial,sans-serif;color:#111;max-width:720px">');
  h.push('<table style="border-collapse:collapse">' + [
    ['Tavoite', eur(n.tavoite)], ['Laskutettu', eur(n.laskutettu)], ['Varmistettu', eur(n.varmistettu)],
    ['Putki (painotettu)', eur(n.putki)], ['Ennuste', eur(n.ennuste)], ['Vaje', eur(n.vaje)],
    ['Kiintiö', t.kone.kiintio + ' uutta kontaktia / arkipäivä'],
  ].map(([x, y]) => '<tr><td style="padding:2px 16px 2px 0;color:#6b7280">' + x + '</td><td><b>' + esc(y) + '</b></td></tr>').join('') +
    '</table>');

  if (r.virheet.length) {
    osio('⚠ Virheet');
    h.push('<ul>' + r.virheet.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>');
  }
  if (t.huomiot.length) {
    osio('Huomiot');
    h.push('<ul>' + t.huomiot.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>');
  }
  if (r.vastaukset.length) {
    osio('Vastaukset – reagoi tänään (' + r.vastaukset.length + ')');
    r.vastaukset.forEach((v) => h.push('<p><b>' + esc(v.liidi.yritys) + '</b> – ' + esc(nimi(v.liidi)) +
      ' · <a href="' + esc(v.linkki) + '">avaa Gmailissa</a><br><span style="color:#4b5563">' + esc(v.ote) + '</span></p>'));
  }
  if (r.lahetetyt.length || r.jatkot.length) {
    osio('Lähetetty tänään: ' + r.lahetetyt.length + ' avausta, ' + r.jatkot.length + ' jatkoviestiä');
    h.push('<p style="color:#4b5563">' + esc(r.lahetetyt.concat(r.jatkot).map((x) => x.liidi.yritys).join(', ')) + '</p>');
  }
  if (r.luonnokset.length) {
    osio('Luonnokset odottavat lähetystä (' + r.luonnokset.length + ')');
    h.push('<p>Lue ja lähetä Gmailin <a href="https://mail.google.com/mail/u/0/#drafts">luonnoksista</a>: ' +
      esc(r.luonnokset.map((x) => x.liidi.yritys + ' (' + x.vaihe + ')').join(', ')) + '</p>');
  }
  if (r.pomput.length) {
    osio('Pomppasi (' + r.pomput.length + ')');
    h.push('<p style="color:#4b5563">' + esc(r.pomput.map((l) => l.yritys + ' <' + l.email + '>').join(', ')) + '</p>');
  }
  if (r.linkedin.length) {
    osio('LinkedIn tänään (' + r.linkedin.length + ')');
    h.push('<p style="color:#4b5563">Lähetä kutsu ilman viestiä. Kun kutsu on hyväksytty, lähetä viesti ja päivitä LinkedIn-tila.</p>');
    r.linkedin.forEach((x) => h.push('<p><a href="' + esc(x.liidi.linkedin) + '">' + esc(nimi(x.liidi)) + '</a> – ' +
      esc(x.liidi.yritys) + '<br><span style="color:#4b5563">' + esc(x.viesti) + '</span></p>'));
  }
  if (r.soitot.length) {
    osio('Soita tänään (' + r.soitot.length + ')');
    r.soitot.forEach((x) => h.push('<p><b>' + esc(x.liidi.yritys) + '</b> – ' + esc(nimi(x.liidi)) + ' · <a href="tel:' +
      esc(String(x.liidi.puhelin).replace(/\s/g, '')) + '">' + esc(x.liidi.puhelin) + '</a><br><span style="color:#4b5563">' +
      'Avaus: "Laitoin sähköpostia sivuistanne – huomasin, että ' + esc(x.liidi.havainto || '…') + '. Onko teillä tämä jo työn alla?"</span></p>'));
  }
  if (r.esikatselu.length) {
    osio('TESTI-tila: nämä viestit lähtisivät (' + r.esikatselu.length + ')');
    h.push('<p style="color:#4b5563">Kun viestit näyttävät hyviltä, vaihda Asetukset → Tila: LUONNOS tai LÄHETÄ.</p>');
    h.push(viestitHtml(r.esikatselu));
  }
  if (viikko) {
    osio('Viikkoraportti: kuukaudet');
    h.push('<table style="border-collapse:collapse;font-size:13px"><tr>' +
      ['Kuukausi', 'Tavoite', 'Ennuste', 'Laskutettu', 'Vaje', 'Tila'].map((x) =>
        '<th style="text-align:left;padding:4px 10px;border-bottom:1px solid #ddd">' + x + '</th>').join('') + '</tr>' +
      t.kuukaudet.filter((m) => m.kk >= kkLisaa(n.kk, -2) && m.kk <= kkLisaa(n.kk, 6)).map((m) =>
        '<tr' + (m.kk === n.kk ? ' style="font-weight:bold"' : '') + '>' +
        [kkNimi(m.kk), eur(m.tavoite), eur(m.ennuste), eur(m.laskutettu), eur(m.vaje), m.tila].map((x) =>
          '<td style="padding:4px 10px;border-bottom:1px solid #eee">' + esc(x) + '</td>').join('') + '</tr>').join('') +
      '</table>');
    osio('Viikkoraportti: myyntikone');
    h.push('<p>Kontaktoitu ' + t.konv.kontaktoidut + ' · vastanneet ' + t.konv.vastanneet + ' · palaverit ' + t.konv.palaverit +
      '<br>Kontakti → palaveri: oletus ' + pct(a.kp) + ', toteutunut ' + (t.konv.kpTot === null ? '–' : pct(t.konv.kpTot)) +
      '<br>Palaveri → kauppa: oletus ' + pct(a.pk) + ', toteutunut ' + (t.konv.pkTot === null ? '–' : pct(t.konv.pkTot)) +
      '<br>Keskikauppa: oletus ' + eur(a.keskikauppa) + ', toteutunut ' + (t.konv.keskikauppaTot === null ? '–' : eur(t.konv.keskikauppaTot)) + '</p>');
  }
  if (taulukkoUrl) h.push('<p style="margin-top:24px"><a href="' + esc(taulukkoUrl) + '">Avaa Laskutusmoottori</a></p>');
  h.push('</div>');
  const html = h.join('\n');
  const tekstiversio = html.replace(/<br>/g, '\n').replace(/<\/(td|th)>/g, ' ').replace(/<\/(p|li|h3|tr)>/g, '\n').replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n');
  return { aihe: aihe, html: html, teksti: tekstiversio };
}

function viestitHtml(lista) {
  return lista.map((x) => '<div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin:10px 0">' +
    '<div style="color:#6b7280;font-size:12px">' + (x.tyyppi === 'uusi' ? 'Avaus' : 'Jatkoviesti ' + x.vaihe) +
    ' → ' + esc(nimi(x.liidi)) + ' &lt;' + esc(x.liidi.email) + '&gt; · ' + esc(x.liidi.yritys) + '</div>' +
    (x.aihe ? '<div style="margin:4px 0"><b>' + esc(x.aihe) + '</b></div>' : '<div style="margin:4px 0;color:#6b7280">Re: (sama ketju)</div>') +
    '<pre style="white-space:pre-wrap;font:13px/1.5 Arial,sans-serif;margin:0">' + esc(x.viesti) + '</pre></div>').join('');
}

// ───────────────────────────── Laskenta (puhtaat funktiot) ─────────────────────────────

/**
 * Laskee kuukausitaulukon, tämän kuun tunnusluvut ja myyntikoneen tahdin.
 * m = lueKaikki().malli, tanaan = 'YYYY-MM-DD'.
 */
function laske(m, tanaan) {
  const a = m.asetukset;
  const nyt = tanaan.slice(0, 7);
  const ensi = kkLisaa(nyt, 1);
  const tavoite = {};
  m.tavoitteet.forEach((t) => { tavoite[t.kk] = t.tavoite; });
  const kuukaudet = Array.from(new Set(m.tavoitteet.map((t) => t.kk).concat([nyt, ensi]))).sort();

  const rivit = kuukaudet.map((kk) => {
    const toistuvat = summa(m.toistuvat.filter((t) => aktiivinen(t.alkaa, t.paattyy, kk)).map((t) => t.summa));
    let voitetut = 0;
    let putki = 0;
    m.kaupat.forEach((k) => {
      const e = kauppaKuussa(k, kk);
      if (!e) return;
      if (k.vaihe === VOITETTU) voitetut += e;
      else if (k.vaihe !== HAVITTY) putki += e * k.tod;
    });
    const varmistettu = toistuvat + voitetut;
    const ennuste = varmistettu + putki;
    const laskutettu = summa(m.laskut.filter((l) => l.kk === kk && LASKUTETTU.includes(l.tila)).map((l) => l.summa));
    const tav = tavoite[kk] || 0;
    const vaje = Math.max(0, tav - ennuste);
    let tila;
    if (kk < nyt) tila = laskutettu >= tav ? '✓ Saavutettu' : '✗ Jäi ' + eur(tav - laskutettu);
    else if (!tav) tila = '– ei tavoitetta';
    else if (varmistettu >= tav) tila = '✓ Varmistettu';
    else if (ennuste >= tav) tila = '✓ Ennuste riittää';
    else tila = '⚠ Vaje ' + eur(vaje);
    return { kk, tavoite: tav, toistuvat, voitetut, varmistettu, putki, ennuste, laskutettu, vaje, tila };
  });
  const rNyt = rivit.find((r) => r.kk === nyt);
  const rEnsi = rivit.find((r) => r.kk === ensi);

  // Konversiot
  const lid = m.liidit;
  const kontaktoidut = lid.filter((l) => l.vaihe >= 1).length;
  const vastanneet = lid.filter((l) => VASTANNEET.includes(l.tila)).length;
  const palaverit = lid.filter((l) => PALAVERIT.includes(l.tila)).length;
  const voitetutKaupat = m.kaupat.filter((k) => k.vaihe === VOITETTU);
  const suljetut = voitetutKaupat.length + m.kaupat.filter((k) => k.vaihe === HAVITTY).length;
  const kpTot = kontaktoidut ? palaverit / kontaktoidut : null;
  const pkTot = suljetut ? voitetutKaupat.length / suljetut : null;
  const kertaKaupat = voitetutKaupat.filter((k) => k.kerta > 0);
  const keskikauppaTot = kertaKaupat.length ? summa(kertaKaupat.map((k) => k.kerta)) / kertaKaupat.length : null;
  const kp = kontaktoidut >= a.kynnys && a.kynnys > 0 ? Math.max(kpTot, 0.005) : a.kp;
  const pk = suljetut >= 5 ? Math.max(pkTot, 0.05) : a.pk;

  // Myyntikone: vaje → kaupat → palaverit → kontaktit → kontaktia / arkipäivä
  const vajeKk = (r) => Math.max(0, r.tavoite - r.varmistettu - r.putki);
  const avoinVaje = vajeKk(rNyt) + vajeKk(rEnsi);
  const kaupat = a.keskikauppa > 0 ? avoinVaje / a.keskikauppa : 0;
  const palaveritTarve = pk > 0 ? kaupat / pk : 0;
  const kontaktit = kp > 0 ? palaveritTarve / kp : 0;
  const kesken = lid.filter((l) => l.tila === 'Sekvenssissä' || l.tila === 'Luonnos').length;
  const jaljella = Math.max(0, Math.ceil(kontaktit - 1e-9) - kesken);
  const arkipaivat = arkipaiviaValilla(tanaan, kkViimeinen(ensi));
  const laskettu = Math.ceil((arkipaivat ? jaljella / arkipaivat : jaljella) - 1e-9);
  const kiintio = avoinVaje <= 0 ? a.min : Math.min(a.max, Math.max(a.min, laskettu));
  const rajoitettu = avoinVaje > 0 && laskettu > a.max;
  const jonossa = lid.filter((l) => (l.tila === 'Uusi' || l.tila === '') && onEmail(l.email)).length;
  const odottaaHavaintoa = lid.filter((l) => (l.tila === 'Uusi' || l.tila === '') && onEmail(l.email) &&
    !l.havainto && !(a.autoHavainto && l.ehdotus)).length;

  // Laskuttamatta tämän ja aiempien kuukausien osalta
  const rastit = m.laskut.filter((l) => l.tila === 'Laskuttamatta' && l.kk && l.kk <= nyt);
  const laskuttamatta = { summa: summa(rastit.map((l) => l.summa)), maara: rastit.length };

  // Keskittymä: suurimman laskutettavan osuus tämän kuun varmistetusta
  const ryhmat = {};
  m.toistuvat.filter((t) => aktiivinen(t.alkaa, t.paattyy, nyt) && t.summa > 0).forEach((t) => {
    const k = t.laskutettava || t.nimi;
    ryhmat[k] = (ryhmat[k] || 0) + t.summa;
  });
  voitetutKaupat.forEach((k) => {
    const e = kauppaKuussa(k, nyt);
    if (e) ryhmat[k.asiakas] = (ryhmat[k.asiakas] || 0) + e;
  });
  const suurin = Object.keys(ryhmat).sort((x, y) => ryhmat[y] - ryhmat[x])[0] || '';
  const keskittyma = { nimi: suurin, osuus: rNyt.varmistettu > 0 && suurin ? ryhmat[suurin] / rNyt.varmistettu : 0 };

  // Kaupat, jotka tarvitsevat huomiota
  const avoimet = m.kaupat.filter((k) => k.vaihe && k.vaihe !== VOITETTU && k.vaihe !== HAVITTY);
  const raja = lisaaPaivia(tanaan, 7);
  const askeleet = avoimet.filter((k) => !k.seuraavaPvm || !k.seuraava || k.seuraavaPvm <= raja)
    .sort((x, y) => (x.seuraavaPvm || '0000') < (y.seuraavaPvm || '0000') ? -1 : 1);
  const myohassa = avoimet.filter((k) => !k.seuraava || !k.seuraavaPvm || k.seuraavaPvm < tanaan).length;
  const ilmanKuukautta = avoimet.filter((k) => (k.kerta > 0 && !k.lasku1 && !k.lasku2) ||
    (k.kk > 0 && !k.kkAlkaa && !k.lasku1 && !k.lasku2)).length;

  const huomiot = [];
  if (!rNyt.tavoite) huomiot.push('Kuukaudelle ' + kkNimi(nyt) + ' ei ole tavoitetta – lisää rivi Tavoitteet-välilehdelle.');
  else if (rNyt.varmistettu >= rNyt.tavoite) huomiot.push('✓ ' + cap(kkNimi(nyt)) + ' on varmistettu: ' + eur(rNyt.varmistettu) + ' / ' + eur(rNyt.tavoite) + '.');
  else if (rNyt.ennuste >= rNyt.tavoite) huomiot.push('✓ ' + cap(kkNimi(nyt)) + ' riittää ennusteen mukaan, mutta ' + eur(rNyt.tavoite - rNyt.varmistettu) + ' on vielä putkessa. Vie kaupat maaliin.');
  else huomiot.push('Vaje ' + eur(rNyt.vaje) + ' (' + kkNimi(nyt) + '). Tämän kuun vaje katetaan lämpimällä verkostolla ja ennakkolaskuilla – kylmä kontakti ehtii yleensä vasta ensi kuulle.');
  if (laskuttamatta.summa > 0) huomiot.push('Laskuttamatta ' + eur(laskuttamatta.summa) + ' (' + laskuttamatta.maara + ' riviä) – laskuta Laskut-välilehdeltä ja vaihda tila Lähetetty.');
  if (rajoitettu) huomiot.push('Tarvittava tahti ' + laskettu + ' kontaktia/pv ylittää katon ' + a.max + '. Pelkkä volyymi ei riitä: terävöitä havaintoja, nosta keskikauppaa (paketti + kk-palvelu) tai lisää lämpimiä kontakteja.');
  if (odottaaHavaintoa > 0) huomiot.push(odottaaHavaintoa + ' liidiä odottaa havaintoa – kopioi ehdotus tai kirjoita oma Havainto-sarakkeeseen.');
  const valmiitJonossa = jonossa - odottaaHavaintoa;
  if (valmiitJonossa < kiintio * 5) huomiot.push('Valmiita liidejä jonossa ' + valmiitJonossa + ' (riittää ' + Math.floor(valmiitJonossa / Math.max(1, kiintio)) + ' arkipäivää). Lisää vähintään ' + Math.max(0, kiintio * 10 - valmiitJonossa) + ' liidiä.');
  const vastasi = lid.filter((l) => l.tila === 'Vastasi').length;
  if (vastasi) huomiot.push(vastasi + ' vastausta odottaa – vastaa ja päivitä tila (Palaveri / Ei kiinnosta).');
  if (myohassa) huomiot.push(myohassa + ' avointa kauppaa ilman seuraavaa askelta tai askel myöhässä.');
  if (ilmanKuukautta) huomiot.push(ilmanKuukautta + ' avointa kauppaa ilman laskutuskuukautta – ne eivät näy ennusteessa.');
  if (keskittyma.osuus > 0.5) huomiot.push('Suurin asiakas (' + keskittyma.nimi + ') on ' + pct(keskittyma.osuus) + ' laskutuksesta. Tavoite: alle 50 %.');

  return {
    tanaan, asetukset: a, kuukaudet: rivit, nyt: rNyt, ensi: rEnsi,
    konv: { kontaktoidut, vastanneet, palaverit, kpTot, pkTot, keskikauppaTot, kp, pk },
    kone: { avoinVaje, kaupat, palaverit: palaveritTarve, kontaktit, kesken, arkipaivat, laskettu, kiintio, rajoitettu, jonossa, odottaaHavaintoa },
    laskuttamatta, keskittyma, askeleet, huomiot,
  };
}

/** Kaupan euromäärä kuukaudelle kk (painottamaton). */
function kauppaKuussa(k, kk) {
  let e = 0;
  const l1 = k.lasku1 ? k.lasku1.slice(0, 7) : null;
  const l2 = k.lasku2 ? k.lasku2.slice(0, 7) : null;
  if (k.kerta) {
    if (l1 && l2) {
      if (l1 === kk) e += k.kerta / 2;
      if (l2 === kk) e += k.kerta / 2;
    } else if ((l1 || l2) === kk) {
      e += k.kerta;
    }
  }
  if (k.kk) {
    const alku = k.kkAlkaa || k.lasku2 || k.lasku1;
    if (alku && aktiivinen(alku, k.kkPaattyy, kk)) e += k.kk;
  }
  return e;
}

function aktiivinen(alkaa, paattyy, kk) {
  return (!alkaa || alkaa.slice(0, 7) <= kk) && (!paattyy || paattyy.slice(0, 7) >= kk);
}

/** Laskutuslistan rivit kuukaudelle kk. */
function laskutusrivit(m, kk) {
  const rivit = [];
  m.toistuvat.forEach((t) => {
    if (t.summa > 0 && aktiivinen(t.alkaa, t.paattyy, kk)) {
      rivit.push({ kk, laskutettava: t.laskutettava || t.nimi, kuvaus: t.nimi + ' ' + kkNimi(kk), summa: t.summa,
        tunniste: 'T|' + t.nimi + '|' + kk });
    }
  });
  m.kaupat.filter((k) => k.vaihe === VOITETTU).forEach((k) => {
    const l1 = k.lasku1 ? k.lasku1.slice(0, 7) : null;
    const l2 = k.lasku2 ? k.lasku2.slice(0, 7) : null;
    const perusta = 'K|' + k.asiakas + '|' + k.kuvaus + '|';
    if (k.kerta) {
      if (l1 && l2) {
        if (l1 === kk) rivit.push({ kk, laskutettava: k.asiakas, kuvaus: k.kuvaus + ' – 1. lasku (50 %)', summa: k.kerta / 2, tunniste: perusta + 'L1|' + kk });
        if (l2 === kk) rivit.push({ kk, laskutettava: k.asiakas, kuvaus: k.kuvaus + ' – loppulasku (50 %)', summa: k.kerta / 2, tunniste: perusta + 'L2|' + kk });
      } else if ((l1 || l2) === kk) {
        rivit.push({ kk, laskutettava: k.asiakas, kuvaus: k.kuvaus, summa: k.kerta, tunniste: perusta + 'L|' + kk });
      }
    }
    const alku = k.kkAlkaa || k.lasku2 || k.lasku1;
    if (k.kk && alku && aktiivinen(alku, k.kkPaattyy, kk)) {
      rivit.push({ kk, laskutettava: k.asiakas, kuvaus: k.kuvaus + ' – kuukausimaksu ' + kkNimi(kk), summa: k.kk, tunniste: perusta + 'KK|' + kk });
    }
  });
  return rivit;
}

// ───────────────────────────── Sekvenssit (puhtaat funktiot) ─────────────────────────────

/**
 * Päättää, mitä tänään lähetetään: erääntyneet jatkoviestit ensin, sitten uudet avaukset kiintiön verran.
 * Ei muuta mitään.
 */
function suunnittele(m, kiintio, tanaan, esikatselu) {
  const a = m.asetukset;
  const jatkot = [];
  const uudet = [];
  const tuplat = [];
  const loppuneet = [];
  const ohitetut = [];
  const lid = m.liidit;

  lid.forEach((l) => {
    if (l.tila !== 'Sekvenssissä' || l.luonnos || !l.ketju || !l.seuraava || l.seuraava > tanaan) return;
    const vaihe = l.vaihe + 1;
    const pohja = haePohja(m.pohjat, vaihe, l.segmentti);
    if (!pohja) { loppuneet.push(l); return; }
    const v = renderoiViesti(pohja, l, a, esikatselu);
    if (v.virhe) { ohitetut.push({ liidi: l, syy: v.virhe }); return; }
    jatkot.push({ tyyppi: 'jatko', liidi: l, vaihe, aihe: '', viesti: v.viesti });
  });

  const tilaa = Math.max(0, a.yhteensa - jatkot.length);
  let maara = Math.min(kiintio, tilaa);
  if (a.tila === 'LUONNOS' && !esikatselu) {
    maara = Math.max(0, maara - lid.filter((l) => l.tila === 'Luonnos' && l.vaihe === 0).length);
  }

  const kaytetyt = new Set();
  const varatut = new Set();
  lid.forEach((l) => {
    if (!l.email || l.tila === 'Uusi' || l.tila === '') return;
    kaytetyt.add(l.email);
    const d = domain(l.email);
    if (d && !YLEISET_DOMAINIT.includes(d) && ESTAA_DOMAININ.includes(l.tila)) varatut.add(d);
  });

  for (const l of lid) {
    if (uudet.length >= maara) break;
    if (l.tila !== 'Uusi' && l.tila !== '') continue;
    if (!onEmail(l.email)) continue;
    if (kaytetyt.has(l.email)) { tuplat.push(l); continue; }
    const d = domain(l.email);
    const yleinen = !d || YLEISET_DOMAINIT.includes(d);
    if (!yleinen && varatut.has(d)) continue;
    const pohja = haePohja(m.pohjat, 1, l.segmentti);
    if (!pohja) continue;
    const havainto = l.havainto || (a.autoHavainto ? l.ehdotus : '');
    const tarvitsee = /\{\{\s*havainto\s*\}\}/i.test(pohja.aihe + pohja.viesti);
    if (!havainto && (a.vaadiHavainto || tarvitsee)) continue;
    const v = renderoiViesti(pohja, Object.assign({}, l, { havainto }), a, esikatselu);
    if (v.virhe) { ohitetut.push({ liidi: l, syy: v.virhe }); continue; }
    uudet.push({ tyyppi: 'uusi', liidi: l, vaihe: 1, aihe: v.aihe, viesti: v.viesti });
    kaytetyt.add(l.email);
    if (!yleinen) varatut.add(d);
  }
  return { jatkot, uudet, tuplat, loppuneet, ohitetut };
}

/** LinkedIn- ja soittolista päivän koosteeseen. */
function valitseTehtavat(m) {
  const a = m.asetukset;
  const ohita = ['Älä ota yhteyttä', 'Ei kiinnosta', 'Pomppasi', 'Tupla', 'Kauppa', 'Palaveri', 'Vastasi', 'Tauko'];
  const li = m.liidit.filter((l) => /linkedin\.com\//i.test(l.linkedin) && !l.liTila && !ohita.includes(l.tila))
    .sort((x, y) => (y.vaihe >= 1) - (x.vaihe >= 1) || ((x.aloitettu || '9') < (y.aloitettu || '9') ? -1 : 1))
    .slice(0, Math.max(0, a.li));
  const soitot = m.liidit.filter((l) => l.puhelin && !l.soitto &&
    ((l.tila === 'Sekvenssissä' && l.vaihe >= 2) || l.tila === 'Ei vastausta'))
    .slice(0, Math.max(0, a.soitot));
  return { li, soitot };
}

function haePohja(pohjat, vaihe, segmentti) {
  const seg = String(segmentti || '').trim().toLowerCase();
  const sama = (p) => String(p.vaihe).toLowerCase() === String(vaihe).toLowerCase();
  return pohjat.find((p) => sama(p) && seg && p.segmentti.toLowerCase() === seg && p.viesti) ||
    pohjat.find((p) => sama(p) && !p.segmentti && p.viesti) || null;
}

/** Seuraavan viestin päivä, kun vaihe `vaihe` lähti päivänä `pvm`. */
function seuraavaLahetys(pohjat, segmentti, vaihe, pvm, a) {
  const seuraava = haePohja(pohjat, vaihe + 1, segmentti);
  return lisaaArkipaivia(pvm, seuraava ? (seuraava.odota || 3) : (a.loppuOdotus || 5));
}

// Näiden pitää olla täytetty, muuten viesti jätetään lähettämättä. Muut saavat olla tyhjiä.
const PAKOLLISET_MUUTTUJAT = ['yritys', 'sivusto', 'havainto', 'nimi', 'allekirjoitus'];

/** Täyttää pohjan muuttujat. esikatselu = puuttuvat asetukset näytetään paikkamerkkeinä. */
function renderoiViesti(pohja, l, a, esikatselu) {
  const arvot = {
    etunimi: teksti(l.etunimi), sukunimi: teksti(l.sukunimi), yritys: teksti(l.yritys), rooli: teksti(l.rooli),
    sivusto: lyhytDomain(l.sivusto), paikkakunta: teksti(l.paikkakunta), havainto: siistiHavainto(l.havainto),
    nimi: teksti(a.nimi), allekirjoitus: teksti(a.allekirjoitus) || teksti(a.nimi), referenssi: teksti(a.referenssi),
  };
  let virhe = '';
  const korvaa = (s, aiheessa) => String(s || '').replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (koko, nimi) => {
    const k = nimi.toLowerCase();
    if (!(k in arvot)) { virhe = virhe || 'Tuntematon muuttuja ' + koko; return koko; }
    if (arvot[k]) return arvot[k];
    if (esikatselu) return '[' + k + ' puuttuu]';
    if (aiheessa || PAKOLLISET_MUUTTUJAT.includes(k)) virhe = virhe || 'Tyhjä {{' + k + '}}';
    return '';
  });
  const siivoa = (s) => s.replace(/[ \t]+([,.!?])/g, '$1').replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n').trim();
  const aihe = siivoa(korvaa(pohja.aihe, true));
  const viesti = siivoa(korvaa(pohja.viesti, false));
  return { aihe, viesti, virhe };
}

/** Havainto jatkaa lausetta "huomasin, että …", joten lopun piste poistetaan. */
function siistiHavainto(h) {
  return teksti(h).replace(/[.\s]+$/, '');
}

/** Luokittelee ketjun vieraan viestin: vastaus, pomppu tai automaattinen. */
function luokitteleVastaus(lahettaja, aihe, autoSubmitted) {
  const f = String(lahettaja || '');
  const s = String(aihe || '');
  if (/mailer-daemon|postmaster|mail delivery (subsystem|system)/i.test(f) ||
    /undeliverable|delivery status notification|mail delivery failed|returned mail|delivery has failed|toimitus epäonnistui|viestiä ei voitu toimittaa|ei voitu toimittaa/i.test(s)) {
    return 'pomppu';
  }
  if (/auto-(replied|generated)/i.test(String(autoSubmitted || '')) ||
    /automaattinen vastaus|automatic reply|auto(matic)?[- ]?reply|out of (the )?office|poissa toimistolta|lomavastaaja|autosvar|abwesenheit/i.test(s)) {
    return 'automaattinen';
  }
  return 'vastaus';
}

function onOma(lahettaja, omat) {
  const m = String(lahettaja || '').match(/<([^>]+)>/);
  return omat.has((m ? m[1] : String(lahettaja)).trim().toLowerCase());
}

// ───────────────────────────── Sivuston analyysi (puhdas funktio) ─────────────────────────────

const MATKAILU_RE = /matka|majoit|ohjelma|elämys|safari|hotel|mökki|mokki|glamp|iglu|igloo|tour|travel|ravintola|kahvila|leirintä|camping|resort|lapland|lappi/i;
const VARAUSMOOTTORI_RE = /bokun|bókun|fareharbor|rezdy|checkfront|regiondo|bookingkit|bookeo|trekksoft|ventrata|turitop|peek\.com|sirvoy|\bmews\b|nethotelbooking|hotellinx|smoobu|lodgify|beds24|hostaway|guesty|cloudbeds|littlehotelier|simplybook|timma\.fi|vello\.fi|tickettailor|eventbrite|booking-?engine|bookingwidget/i;
const ALUSTAT = [
  ['WordPress', /wp-content|wp-includes/i], ['Wix', /wixstatic|wix\.com|_wixCIDX/i], ['Squarespace', /squarespace/i],
  ['Webflow', /data-wf-page|webflow\./i], ['Shopify', /cdn\.shopify|myshopify/i], ['Kotisivukone', /kotisivukone/i],
  ['Sivuviidakko', /sivuviidakko/i], ['Joomla', /joomla/i], ['Drupal', /drupal/i],
];

function analysoiSivu(html, meta, segmentti, vuosi) {
  if (meta.virhe) return { signaalit: 'Ei auennut: ' + meta.virhe + ' – tarkista käsin', havainto: '' };
  const h = String(html || '');
  const matkailu = MATKAILU_RE.test(segmentti || '') || (!segmentti && MATKAILU_RE.test(h.slice(0, 20000)));
  const s = [];
  const https = !!meta.https;
  s.push(https ? 'https ✓' : 'ei https');
  const viewport = /<meta[^>]+name\s*=\s*["']?viewport/i.test(h);
  s.push(viewport ? 'mobiili ✓' : 'ei mobiilinäkymää');

  let vuosiMax = 0;
  const re = /(?:©|&copy;|&#169;|copyright)[^0-9<]{0,25}((?:19|20)\d{2})(?:\s*(?:-|–|&ndash;|&#8211;)\s*((?:19|20)\d{2}))?/gi;
  let osuma;
  while ((osuma = re.exec(h))) vuosiMax = Math.max(vuosiMax, Number(osuma[1]), Number(osuma[2] || 0));
  if (vuosiMax) s.push('© ' + vuosiMax);

  const ota = [];
  if (/href\s*=\s*["'][^"']*booking\.com/i.test(h)) ota.push('Booking.com');
  if (/href\s*=\s*["'][^"']*airbnb\./i.test(h)) ota.push('Airbnb');
  if (/href\s*=\s*["'][^"']*expedia\./i.test(h)) ota.push('Expedia');
  const moottori = (h.match(VARAUSMOOTTORI_RE) || [])[0];
  const varaussana = /\b(varaa|varaus|varaukset|book now|book online|reserve|online booking)\b/i.test(h.replace(/<script[\s\S]*?<\/script>/gi, ''));
  if (matkailu) {
    if (moottori) s.push('varausjärjestelmä: ' + moottori);
    else if (ota.length) s.push('ohjaa: ' + ota.join(', '));
    else s.push(varaussana ? 'varauslinkki, ei järjestelmää' : 'ei suoraa varausta');
  }

  const htmlLang = ((h.match(/<html[^>]*\blang\s*=\s*["']?([a-z]{2})/i) || [])[1] || '').toLowerCase();
  const englanti = htmlLang === 'en' || /hreflang\s*=\s*["']?en/i.test(h) ||
    /href\s*=\s*["'][^"']*\/(en|en-gb|en-us)(\/|["'?#])/i.test(h) || /[?&]lang=en\b/i.test(h) ||
    />\s*(english|in english|eng|en)\s*</i.test(h);
  s.push(englanti ? 'EN ✓' : 'ei englantia');

  const kuvaus = /<meta[^>]+name\s*=\s*["']?description["']?[^>]+content\s*=\s*["'][^"']{20,}/i.test(h) ||
    /<meta[^>]+content\s*=\s*["'][^"']{20,}["'][^>]+name\s*=\s*["']?description/i.test(h);
  if (!kuvaus) s.push('ei meta-kuvausta');
  if (meta.ms) s.push((meta.ms / 1000).toFixed(1).replace('.', ',') + ' s');
  if (meta.tavut) s.push(Math.round(meta.tavut / 1024) + ' kt');
  const alusta = ALUSTAT.find(([, re2]) => re2.test(h));
  if (alusta) s.push(alusta[0]);

  const taivutus = { 'Booking.com': 'Booking.comiin', Airbnb: 'Airbnb:hen', Expedia: 'Expediaan' };
  let havainto = '';
  if (!https) havainto = 'sivuilla ei ole suojattua yhteyttä (https), joten selain näyttää kävijälle "Ei turvallinen" -merkinnän';
  else if (!viewport) havainto = 'sivusto ei skaalaudu puhelimen näytölle';
  else if (matkailu && ota.length && !moottori) havainto = 'varaukset ohjautuvat sivuilta ' + taivutus[ota[0]] + ', jolloin jokaisesta varauksesta lähtee välityspalkkio';
  else if (matkailu && !moottori && !varaussana) havainto = 'sivuilta ei näytä pääsevän varaamaan suoraan';
  else if (matkailu && !englanti) havainto = 'sivuilta ei löydy englanninkielistä versiota';
  else if (vuosiMax && vuosiMax <= vuosi - 2) havainto = 'sivujen alalaidassa lukee vielä © ' + vuosiMax;
  else if (meta.ms > 3000) havainto = 'etusivun lataus kesti minulla yli ' + Math.floor(meta.ms / 1000) + ' sekuntia';
  else if (!kuvaus) havainto = 'sivuilta puuttuu hakutuloksissa näkyvä kuvausteksti, joten Google arvaa sen itse';
  return { signaalit: s.join(' · '), havainto };
}

function normalisoiUrl(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '');
}

function absoluuttinen(perusta, sijainti) {
  if (/^https?:\/\//i.test(sijainti)) return sijainti;
  const m = perusta.match(/^(https?:)\/\/([^/]+)(\/[^?#]*)?/i);
  if (!m) return sijainti;
  if (sijainti.indexOf('//') === 0) return m[1] + sijainti;
  if (sijainti.charAt(0) === '/') return m[1] + '//' + m[2] + sijainti;
  const polku = (m[3] || '/').replace(/[^/]*$/, '');
  return m[1] + '//' + m[2] + polku + sijainti;
}

function lyhytDomain(u) {
  return teksti(u).replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/[/?#].*$/, '').toLowerCase();
}

// ───────────────────────────── Sähköpostin rakentaminen ─────────────────────────────

function rakennaMime(o) {
  const otsakkeet = [
    'From: ' + (o.fromName ? koodaaNimi(o.fromName) + ' ' : '') + '<' + o.fromEmail + '>',
    'To: ' + o.to,
    'Subject: ' + koodaaOtsake(o.subject),
  ];
  if (o.inReplyTo) {
    otsakkeet.push('In-Reply-To: ' + o.inReplyTo);
    otsakkeet.push('References: ' + (o.references || o.inReplyTo));
  }
  otsakkeet.push('MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64');
  const runko = Utilities.base64Encode(String(o.body).replace(/\r?\n/g, '\r\n'), Utilities.Charset.UTF_8)
    .replace(/(.{76})/g, '$1\r\n').replace(/\r\n$/, '');
  return otsakkeet.join('\r\n') + '\r\n\r\n' + runko;
}

function koodaaOtsake(s) {
  const t = String(s || '');
  if (/^[\x20-\x7e]*$/.test(t)) return t;
  const palat = [];
  for (let i = 0; i < t.length; i += 20) palat.push('=?UTF-8?B?' + Utilities.base64Encode(t.slice(i, i + 20), Utilities.Charset.UTF_8) + '?=');
  return palat.join('\r\n ');
}

function koodaaNimi(s) {
  const t = String(s || '');
  return /^[\x20-\x7e]*$/.test(t) ? '"' + t.replace(/(["\\])/g, '\\$1') + '"' : koodaaOtsake(t);
}

// ───────────────────────────── Taulukon luku ja kirjoitus ─────────────────────────────

function valilehti(nimi) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nimi);
  if (!sh) throw new Error('Välilehti ' + nimi + ' puuttuu. Onko asenna ajettu?');
  return sh;
}

function otsikkoIndeksit(sh, nimi) {
  const leveys = sh.getLastColumn();
  const otsikot = sh.getRange(1, 1, 1, leveys).getValues()[0].map((x) => String(x).trim());
  const idx = {};
  Object.keys(SAR[nimi]).forEach((k) => {
    const i = otsikot.indexOf(SAR[nimi][k]);
    if (i < 0) throw new Error('Välilehdeltä ' + nimi + ' puuttuu sarake "' + SAR[nimi][k] + '". Palauta otsikko.');
    idx[k] = i;
  });
  return { idx, leveys };
}

function lueTaulu(nimi) {
  const sh = valilehti(nimi);
  const { idx, leveys } = otsikkoIndeksit(sh, nimi);
  const viimeinen = sh.getLastRow();
  const arvot = viimeinen > 1 ? sh.getRange(2, 1, viimeinen - 1, leveys).getValues() : [];
  const rivit = [];
  arvot.forEach((rivi, i) => {
    if (rivi.every((v) => v === '' || v === null)) return;
    const o = { _rivi: i + 2 };
    Object.keys(idx).forEach((k) => { o[k] = rivi[idx[k]]; });
    rivit.push(o);
  });
  return { sh, nimi, idx, leveys, rivit };
}

/**
 * Kirjoittaa muutokset riville. Lukee muutettavien sarakkeiden välin juuri ennen kirjoitusta,
 * jotta käyttäjän samaan aikaan tekemät muokkaukset muissa soluissa säilyvät.
 * Käytetään Liidit-välilehdellä (Kaupat-välilehden Tod. % -kaavaa ei saa kirjoittaa yli).
 */
function tallenna(taulu, rivi, muutokset) {
  const sarakkeet = Object.keys(muutokset).map((k) => taulu.idx[k]);
  const alku = Math.min.apply(null, sarakkeet);
  const loppu = Math.max.apply(null, sarakkeet);
  const alue = taulu.sh.getRange(rivi, alku + 1, 1, loppu - alku + 1);
  const arvot = alue.getValues()[0];
  Object.keys(muutokset).forEach((k) => { arvot[taulu.idx[k] - alku] = muutokset[k]; });
  alue.setValues([arvot]);
}

/** Kirjoittaa uuden rivin avain–arvo-pareina. Tod. % -sarake ohitetaan, koska se on kaava. */
function kirjoitaRivi(sh, nimi, rivi, arvot) {
  const avaimet = Object.keys(SAR[nimi]);
  const otsikot = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map((x) => String(x).trim());
  Object.keys(arvot).forEach((k) => {
    if (k === 'tod' || avaimet.indexOf(k) < 0) return;
    const sar = otsikot.indexOf(SAR[nimi][k]) + 1 || avaimet.indexOf(k) + 1;
    sh.getRange(rivi, sar).setValue(arvot[k]);
  });
}

function lueAsetukset() {
  const sh = valilehti(V.asetukset);
  const arvot = sh.getRange(2, 1, Math.max(1, sh.getLastRow() - 1), 2).getValues();
  const otsikosta = {};
  arvot.forEach(([o, v]) => { otsikosta[String(o).trim()] = v; });
  const a = {};
  ASETUSRIVIT.forEach(([avain, otsikko, oletus, , muoto]) => {
    const raaka = otsikko in otsikosta ? otsikosta[otsikko] : '';
    let v = raaka === '' || raaka === null ? oletus : raaka;
    if (typeof oletus === 'number') {
      v = luku(v);
      if (muoto === 'pct' && v > 1) v = v / 100;
    } else if (typeof oletus === 'boolean') {
      v = v === true || /^(true|kyllä|tosi|x|1)$/i.test(String(v).trim());
    } else {
      v = teksti(v);
    }
    a[avain] = v;
  });
  a.tila = TILAT.includes(String(a.tila).toUpperCase()) ? String(a.tila).toUpperCase() : 'TESTI';
  if (a.max < a.min) a.max = a.min;
  return a;
}

function lueVaiheet() {
  const sh = valilehti(V.asetukset);
  const arvot = sh.getRange('E2:F20').getValues();
  const v = {};
  arvot.forEach(([nimi, tod]) => {
    if (teksti(nimi)) v[teksti(nimi)] = Math.min(1, Math.max(0, luku(tod) > 1 ? luku(tod) / 100 : luku(tod)));
  });
  v[VOITETTU] = 1;
  v[HAVITTY] = 0;
  return v;
}

/** Lukee kaikki välilehdet ja muuntaa ne laskennan malliksi (päivämäärät 'YYYY-MM-DD'-avaimina). */
function lueKaikki() {
  const asetukset = lueAsetukset();
  const vaiheet = lueVaiheet();
  const taulut = {
    tav: lueTaulu(V.tavoitteet), tois: lueTaulu(V.toistuvat), kau: lueTaulu(V.kaupat),
    las: lueTaulu(V.laskut), lii: lueTaulu(V.liidit), poh: lueTaulu(V.pohjat),
  };
  const malli = {
    asetukset,
    tavoitteet: taulut.tav.rivit.map((r) => ({ kk: kkAvain(r.kk), tavoite: luku(r.tavoite) })).filter((r) => r.kk),
    toistuvat: taulut.tois.rivit.map((r) => ({
      nimi: teksti(r.lahde), laskutettava: teksti(r.laskutettava), summa: luku(r.summa),
      alkaa: pvAvain(r.alkaa), paattyy: pvAvain(r.paattyy),
    })),
    kaupat: taulut.kau.rivit.map((r) => {
      const vaihe = teksti(r.vaihe);
      return {
        _rivi: r._rivi, asiakas: teksti(r.asiakas), kuvaus: teksti(r.kuvaus), vaihe,
        tod: vaihe in vaiheet ? vaiheet[vaihe] : 0, kerta: luku(r.kerta), lasku1: pvAvain(r.lasku1),
        lasku2: pvAvain(r.lasku2), kk: luku(r.kk), kkAlkaa: pvAvain(r.kkAlkaa), kkPaattyy: pvAvain(r.kkPaattyy),
        seuraava: teksti(r.seuraava), seuraavaPvm: pvAvain(r.seuraavaPvm),
      };
    }),
    laskut: taulut.las.rivit.map((r) => ({
      kk: kkAvain(r.kk), summa: luku(r.summa), tila: teksti(r.tila), laskutettava: teksti(r.laskutettava),
      tunniste: teksti(r.tunniste),
    })),
    liidit: taulut.lii.rivit.map((r) => ({
      _rivi: r._rivi, yritys: teksti(r.yritys), etunimi: teksti(r.etunimi), sukunimi: teksti(r.sukunimi),
      rooli: teksti(r.rooli), email: teksti(r.email).toLowerCase(), puhelin: teksti(r.puhelin),
      linkedin: teksti(r.linkedin), sivusto: teksti(r.sivusto), segmentti: teksti(r.segmentti),
      paikkakunta: teksti(r.paikkakunta), havainto: teksti(r.havainto), ehdotus: teksti(r.ehdotus),
      tila: teksti(r.tila), vaihe: Math.max(0, Math.round(luku(r.vaihe))), aloitettu: pvAvain(r.aloitettu),
      seuraava: pvAvain(r.seuraava), ketju: teksti(r.ketju), luonnos: teksti(r.luonnos),
      liTila: teksti(r.liTila), soitto: teksti(r.soitto), muistiinpano: teksti(r.muistiinpano),
    })),
    pohjat: taulut.poh.rivit.map((r) => ({
      vaihe: pohjanVaihe(r.vaihe), segmentti: teksti(r.segmentti), odota: luku(r.odota),
      aihe: teksti(r.aihe), viesti: teksti(r.viesti),
    })),
  };
  return { malli, taulut };
}

function pohjanVaihe(v) {
  if (typeof v === 'number') return v;
  const s = teksti(v);
  return /^\d+$/.test(s) ? Number(s) : s;
}

function loki(toiminto, kohde, tulos) {
  try {
    valilehti(V.loki).appendRow([new Date(), toiminto, kohde || '', tulos || '']);
  } catch (e) {
    Logger.log(toiminto + ' ' + kohde + ' ' + tulos);
  }
}

function siivoaLoki() {
  const sh = valilehti(V.loki);
  if (sh.getLastRow() > 6000) sh.deleteRows(2, 1000);
}

function ilmoita(viesti) {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(viesti, 'Laskutusmoottori', 6);
  } catch (e) {
    Logger.log(viesti);
  }
  Logger.log(viesti);
}

// ───────────────────────────── Päivämäärät ─────────────────────────────

let _tz = null;
function tz() {
  if (!_tz) {
    try {
      _tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    } catch (e) {
      _tz = null;
    }
    _tz = _tz || 'Europe/Helsinki';
  }
  return _tz;
}

function tanaanAvain() {
  return Utilities.formatDate(new Date(), tz(), 'yyyy-MM-dd');
}

/** Solun arvo → 'YYYY-MM-DD' taulukon aikavyöhykkeellä, tai null. */
function pvAvain(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return isNaN(v.getTime()) ? null : Utilities.formatDate(v, tz(), 'yyyy-MM-dd');
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3] || 1);
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) return m[3] + '-' + pad(m[2]) + '-' + pad(m[1]);
  m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return m[2] + '-' + pad(m[1]) + '-01';
  return null;
}

function kkAvain(v) {
  const k = pvAvain(v);
  return k ? k.slice(0, 7) : null;
}

/** 'YYYY-MM-DD' → Date klo 12 UTC, joka näkyy oikeana päivänä kaikilla Euroopan aikavyöhykkeillä. */
function pvmSolu(k) {
  if (!k) return '';
  const [y, m, d] = k.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d || 1, 12));
}

function pad(n) { return String(n).padStart(2, '0'); }
function avainUTC(k) { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d || 1); }
function utcAvain(t) { const d = new Date(t); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
function lisaaPaivia(k, n) { return utcAvain(avainUTC(k) + n * 864e5); }
function viikonpaiva(k) { return new Date(avainUTC(k)).getUTCDay(); }

function kkLisaa(kk, n) {
  let [y, m] = kk.split('-').map(Number);
  m += n;
  y += Math.floor((m - 1) / 12);
  m = (((m - 1) % 12) + 12) % 12 + 1;
  return y + '-' + pad(m);
}

function kkViimeinen(kk) { return lisaaPaivia(kkLisaa(kk, 1) + '-01', -1); }

function paasiainen(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const kk = Math.floor((h + l - 7 * m + 114) / 31), pv = ((h + l - 7 * m + 114) % 31) + 1;
  return y + '-' + pad(kk) + '-' + pad(pv);
}

const _pyhat = {};
/** Suomen arkipyhät, jotka osuvat arkipäiville (myös vappu, juhannusaatto ja jouluaatto). */
function arkipyhat(y) {
  if (_pyhat[y]) return _pyhat[y];
  const p = paasiainen(y);
  let juhannusaatto = '';
  for (let d = 19; d <= 25; d++) if (viikonpaiva(y + '-06-' + pad(d)) === 5) juhannusaatto = y + '-06-' + pad(d);
  _pyhat[y] = new Set([y + '-01-01', y + '-01-06', lisaaPaivia(p, -2), lisaaPaivia(p, 1), y + '-05-01',
    lisaaPaivia(p, 39), juhannusaatto, y + '-12-06', y + '-12-24', y + '-12-25', y + '-12-26']);
  return _pyhat[y];
}

function onArkipaiva(k) {
  const vp = viikonpaiva(k);
  return vp >= 1 && vp <= 5 && !arkipyhat(Number(k.slice(0, 4))).has(k);
}

function arkipaiviaValilla(alku, loppu) {
  let n = 0;
  for (let k = alku; k <= loppu; k = lisaaPaivia(k, 1)) if (onArkipaiva(k)) n++;
  return n;
}

function lisaaArkipaivia(k, n) {
  let x = k;
  let jaljella = Math.max(0, Math.round(n));
  while (jaljella > 0) {
    x = lisaaPaivia(x, 1);
    if (onArkipaiva(x)) jaljella--;
  }
  return x;
}

function kkNimi(kk) {
  return KUUKAUDET[Number(kk.slice(5, 7)) - 1] + ' ' + kk.slice(0, 4);
}

function suomiPvm(k) {
  return Number(k.slice(8, 10)) + '.' + Number(k.slice(5, 7)) + '.' + k.slice(0, 4);
}

// ───────────────────────────── Pienet apurit ─────────────────────────────

function teksti(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function luku(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v || '').replace(/[\s\u00a0€]/g, '').replace(',', '.').replace(/%$/, '');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

function summa(lista) { return lista.reduce((x, y) => x + (y || 0), 0); }

function eur(n) {
  const s = String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  return s + '\u00a0€';
}

function pct(x) { return (Math.round((x || 0) * 1000) / 10).toString().replace('.', ',') + ' %'; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function onEmail(s) { return /^[^\s@<>(),;:]+@[^\s@<>(),;:]+\.[a-z]{2,}$/i.test(String(s || '')); }
function domain(s) { const m = String(s || '').toLowerCase().match(/@([^@\s>]+)$/); return m ? m[1] : ''; }

function nimi(l) { return [teksti(l.etunimi), teksti(l.sukunimi)].filter(String).join(' ') || teksti(l.email); }

function esc(s) {
  return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function lyhenna(s, n) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

function lisaaMuistiinpano(vanha, uusi) { return teksti(vanha) ? teksti(vanha) + ' · ' + uusi : uusi; }

function sarakeKirjain(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
