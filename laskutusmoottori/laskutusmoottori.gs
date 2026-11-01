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
  tuotteet: 'Tuotteet',
  viikot: 'Viikot',
  pohjat: 'Viestipohjat',
  asetukset: 'Asetukset',
  loki: 'Loki',
};

// Skripti etsii sarakkeet otsikon perusteella: sarakkeita saa siirtää ja lisätä, mutta otsikoita ei saa muuttaa.
const SAR = {
  [V.tavoitteet]: { kk: 'Kuukausi', tavoite: 'Tavoite € (alv 0)', kauppojaVk: 'Kauppoja / vk', muistiinpano: 'Muistiinpano' },
  [V.toistuvat]: {
    lahde: 'Tulolähde', laskutettava: 'Laskutettava', summa: '€ / kk (alv 0)',
    alkaa: 'Alkaa', paattyy: 'Päättyy', muistiinpano: 'Muistiinpano',
  },
  [V.kaupat]: {
    asiakas: 'Asiakas', kuvaus: 'Kuvaus', tuote: 'Tuote', lahde: 'Lähde', vaihe: 'Vaihe', tod: 'Tod. %',
    kerta: 'Kertatulo €', tilauspvm: 'Tilauspvm', eratKasin: 'Erät käsin',
    kk: 'Kk-tulo €', kkAlkaa: 'Kk-tulo alkaa', kkPaattyy: 'Kk-tulo päättyy',
    seuraava: 'Seuraava askel', seuraavaPvm: 'Seuraava pvm', yhteys: 'Yhteyshenkilö',
    muistiinpano: 'Muistiinpanot', luotu: 'Luotu',
  },
  [V.laskut]: {
    kk: 'Kuukausi', ajankohta: 'Laskutetaan', laskutettava: 'Laskutettava', kuvaus: 'Kuvaus', summa: 'Summa € (alv 0)',
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
  [V.tuotteet]: {
    tuote: 'Tuote', hinta: 'Hinta €', kk: 'Kk-tulo €', e1: '1. erä %', p1: '1. erä pv', e2: '2. erä %', p2: '2. erä pv',
    e3: '3. erä %', p3: '3. erä pv', maksuaika: 'Maksuaika pv', selite: 'Selite',
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
  ['kauppojaViikossa', 'Kauppoja / viikko, tavoite', 1, 'Viikkoseurannan oletustavoite. Kuukauden oma tavoite: Tavoitteet → Kauppoja / vk. Kone pitää vähintään tämän vaatiman lähetystahdin (0 = tahti vain vajeen mukaan).'],
  ['myyntisykli', 'Myyntisykli (pv)', 21, 'Avoimen kaupan arvioitu tilauspäivä, jos Tilauspvm on tyhjä: luontipäivä + tämä.'],
  ['maksuaika', 'Maksuaika pv (toistuvat)', 14, 'Toistuvat laskut lähtevät kuun 1. päivä, rahat tulevat tämän jälkeen. Tuotteilla on oma maksuaikansa.'],
  ['oletusTuote', 'Oletustuote', 'Verkkosivuprojekti', 'Uudelle kaupalle valittava tuote (Tuotteet-välilehti).'],
  ['keskikauppa', 'Keskikauppa €', 2500, 'Yhden projektin keskimääräinen arvo (alv 0). Tällä lasketaan, montako kauppaa vaje vaatii.', 'eur'],
  ['kp', 'Kontakti → palaveri', 0.04, 'Montako prosenttia kontaktoiduista päätyy palaveriin. Kone vaihtaa toteutuneeseen, kun dataa on tarpeeksi.', 'pct'],
  ['pk', 'Palaveri → kauppa', 0.3, 'Montako prosenttia palavereista johtaa kauppaan.', 'pct'],
  ['kynnys', 'Toteutuneet käyttöön, kun kontakteja vähintään', 60, 'Tätä ennen laskelma käyttää oletuksia.'],
  ['min', 'Uusia kontakteja / päivä, vähintään', 3, 'Kone pitää vähintään tämän tahdin, vaikka kuukausi olisi jo katettu.'],
  ['max', 'Uusia kontakteja / päivä, enintään', 20, 'Katto toimitettavuuden takia. Uudella postilaatikolla aloita 10:llä.'],
  ['yhteensa', 'Viestejä yhteensä / päivä, enintään', 40, 'Uudet viestit ja jatkoviestit yhteensä.'],
  ['segmenttiMax', 'Avauksia / segmentti / päivä, enintään', 5, 'Esim. kolme kulmaa × 5 = 15 avausta päivässä. 0 = ei rajaa.'],
  ['loppuOdotus', 'Odota viimeisen viestin jälkeen (arkipäivää)', 5, 'Tämän jälkeen liidin tilaksi tulee Ei vastausta.'],
  ['autoHavainto', 'Hyväksy ehdotetut havainnot automaattisesti', false, 'Kyllä = jos Havainto on tyhjä, kone käyttää sivustotarkistuksen ehdotusta.'],
  ['tietosuoja', 'Tietosuojalause', '', '{{tietosuoja}} avausviestin loppuun. Jos lista on kerätty julkisista lähteistä, kerro lähde ja linkki tietosuojaselosteeseen.'],
  ['li', 'LinkedIn-tehtäviä / päivä', 5, 'Kone ei käytä LinkedIniä itse. Saat listan profiileista ja valmiin viestin.'],
  ['soitot', 'Soittoja / päivä', 0, '0 = ei soittolistaa. Muuten liidit, joilla on puhelinnumero ja kaksi viestiä ilman vastausta.'],
  ['varauslinkki', 'Ajanvarauslinkki', '', 'Esim. Google-kalenterin ajanvaraussivu. Lisätään jatkoviestiin muuttujalla {{varauslinkki}}. Jos kenttä on tyhjä, rivi jätetään pois.'],
  ['kalenteri', 'Palaverit kalenterista', true, 'Kone etsii kalenterista tapahtumat, joissa liidin sähköposti on vieraana tai järjestäjänä, ja siirtää liidin kauppoihin (Palaveri sovittu).'],
  ['pagespeed', 'PageSpeed API -avain', '', 'Valinnainen ilmainen Google-avain (PageSpeed Insights API). Kun avain on täytetty, sivustotarkistus mittaa mobiilinopeuden 0–100.'],
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
  'Markkinointiboosti', 'Nordic Host', 'nerot.fi', 'Muu'];
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
const SEGMENTIT = ['Inbound', 'WordPress', 'Groundwork', 'Mainonta', 'Sparraus', 'Matkailu', 'Yleinen', 'Verkosto', 'Vanha asiakas'];
const TILAT = ['TESTI', 'LUONNOS', 'LÄHETÄ'];
const YLEISET_DOMAINIT = ['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'hotmail.fi', 'live.com',
  'live.fi', 'msn.com', 'yahoo.com', 'icloud.com', 'me.com', 'luukku.com', 'suomi24.fi', 'kolumbus.fi',
  'saunalahti.fi', 'elisanet.fi', 'welho.com', 'dnainternet.net', 'netti.fi', 'anvianet.fi', 'pp.inet.fi', 'protonmail.com'];

const KUUKAUDET = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu',
  'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];
const VIIKONPAIVAT = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];

// Kojelaudan kiinteä asettelu (kaavio lukee kuukausitaulukkoa riveiltä KL.kk..KL.kk+KL.kkRiveja)
const KL = { kpi: 3, kpiRiveja: 10, huomiot: 14, huomioRiveja: 6, kk: 22, kkRiveja: 24, askeleet: 48, askelRiveja: 10,
  segmentit: 61, segmenttiRiveja: 8, leveys: 12 };

// [tuote, hinta, kk-tulo, 1. erä %, pv, 2. erä %, pv, 3. erä %, pv, maksuaika, selite] – pv = päiviä tilauksesta laskuun
const TUOTTEET_OLETUS = [
  ['Verkkosivuprojekti', 2500, '', 0.5, 7, 0.5, 35, '', '', 14, '50 % aloituksesta, 50 % julkaisusta noin neljän viikon päästä.'],
  ['Iso projekti (3 erää)', 6000, '', 0.3, 7, 0.4, 35, 0.3, 63, 14, '30 / 40 / 30 %: aloitus, välitoimitus, julkaisu.'],
  ['Korjauspaketti', 1500, '', 1, 14, '', '', '', '', 14, 'Kerralla valmistuttua.'],
  ['Pikatyö', 300, '', 1, 3, '', '', '', '', 14, 'Pienet koodaus- ja sivutyöt, myös WordPress-ylläpito ja -kehitys (esim. nerot.fi). Kerralla valmistuttua.'],
  ['Ylläpito ja hosting', '', 149, '', '', '', '', '', '', 14, 'Pelkkä kuukausimaksu, alkaa tilauskuusta.'],
  ['Sivusto S', 1000, '', 0.5, 0, 0.5, 14, '', '', 14, '1–3 sivua koodilla + kevyt hallintapaneeli. Noin 2 viikkoa, omaa aikaa 3–4 h.'],
  ['Sivusto M', 2000, '', 0.5, 7, 0.5, 28, '', '', 14, 'Pienemmät yritykset, 1 500–2 500 €. Koodilla + hallintapaneeli.'],
  ['Sivusto L', 3500, '', 0.5, 7, 0.5, 42, '', '', 14, 'Isommat yritykset, 3 000–4 000 €. Koodilla + hallintapaneeli.'],
  ['Groundwork-katselmus', 490, '', 1, 7, '', '', '', '', 14, 'Seurannat, mainostilit, nopeus, SEO ja yhteydenottopolut → korjauslista. Hyvitetään, jos korjaukset tehdään.'],
  ['Groundwork-kunnostus', 1900, '', 0.5, 7, 0.5, 28, '', '', 14, 'Perusta kuntoon: Meta-pikseli, GTM, GA4 ja konversiot, nopeus, SEO-perusta, lomakkeet, chat ja laskurit.'],
  ['Mainonnan kumppanuus', '', 690, '', '', '', '', '', '', 14, '490–990 €/kk: kuukausiraportti, palaveri kerran kuussa tai joka toinen kuukausi, viestit noin 15 min/vk. Ei ad hoc -työtä.'],
  ['Markkinoinnin sparraus', '', 900, '', '', '', '', '', '', 14, '600–1 200 €/kk: markkinoinnista vastaavan taustatuki, palaveri kerran kuussa, katsaus ja kommentit.'],
  ['Sparrauspalaveri', 790, '', 1, 0, '', '', '', '', 14, 'Kertaluonteinen 2 h läpikäynti. Hyvitetään, jos jatketaan sparraukseen.'],
  ['Booking engine', '', 5000, '', '', '', '', '', '', 14, 'Arvio 5 000–10 000 €/kk asiakasta kohden. Tarkenna, kun hinnoittelu on lukittu.'],
  ['Kertalasku', '', '', 1, 0, '', '', '', '', 14, 'Koko summa laskutetaan tilauspäivänä.'],
];

const VIIKKO_OTSIKOT = ['Viikko', 'Ajalla', 'Kontaktit', 'Vastaukset', 'Uudet kaupat', 'Voitetut kaupat',
  'Voitettu € (kerta)', 'Kk-tulo €', 'Kuun kaupat yht.', 'Tavoite / vk', 'Tila', 'Laskutus osuu kuukausille'];

const OPTOUT = 'P.S. Jos aihe ei ole nyt ajankohtainen, vastaa "ei kiitos", niin en laita enempää viestejä.';

const POHJAT_OLETUS = [
  // ── Kulma 1: WordPress-sivujen uudistus ──
  [1, 'WordPress', '', '{{yritys}} / verkkosivujen uudistus',
    'Hei {{etunimi}},\n\n' +
    'kävin läpi sivujanne ({{sivusto}}) ja huomasin, että {{havainto}}.\n\n' +
    'WordPress-sivustoille käy usein niin, että lisäosia kertyy, päivitykset jäävät ja sivu hidastuu vuosi vuodelta. ' +
    'Jossain vaiheessa korjaaminen maksaa lähes saman kuin uusi sivusto.\n\n' +
    'Teen uudet sivustot koodilla, ilman raskasta julkaisualustaa ja lisäosia. Sivu on nopea, ja mukana on kevyt hallintapaneeli, ' +
    'jolla päivität tekstit ja kuvat itse. Hinta sovitaan etukäteen, ja tyypillinen projekti valmistuu parissa viikossa.\n\n' +
    'Taustaksi: olen tehnyt verkkosivuja ja markkinointia yli kymmenen vuotta, ja projekteja on takana noin tuhat.\n\n' +
    'Kannattaisiko katsoa 15 minuutissa, mitä teidän sivuillanne kannattaisi tehdä?\n\n' +
    '{{allekirjoitus}}\n\n' + OPTOUT + '\n\n{{tietosuoja}}'],
  [2, 'WordPress', 3, '',
    'Hei {{etunimi}},\n\n' +
    'nostan tämän vielä esiin. Suuntaa antavasti: uusi sivusto maksaa koosta riippuen 1 000–4 000 € (alv 0), ' +
    'ja tarkka hinta sovitaan ennen aloitusta.\n\n' +
    'Jos puhelu tuntuu turhan isolta askeleelta, voin lähettää lyhyen arvion sähköpostilla: mitä uusi sivusto teidän kohdallanne sisältäisi, ' +
    'kauanko se kestäisi ja mitä se maksaisi. Laitanko?\n\n' +
    'Voit myös varata ajan suoraan kalenteristani: {{varauslinkki}}\n\n' +
    '{{nimi}}'],
  [3, 'WordPress', 5, '',
    'Hei {{etunimi}},\n\n' +
    'tämä on viimeinen viestini aiheesta, en halua täyttää postilaatikkoanne. Jos uusi sivusto tulee ajankohtaiseksi myöhemmin – ' +
    'vaikka ennen seuraavaa kampanjaa tai sesonkia – vastaa tähän viestiin, niin jatketaan siitä.\n\n' +
    'Hyvää jatkoa!\n{{nimi}}'],
  // ── Kulma: Pure Groundwork – markkinoinnin perusta kuntoon ──
  [1, 'Groundwork', '', '{{yritys}} / markkinoinnin perusta',
    'Hei {{etunimi}},\n\n' +
    'kävin läpi sivujanne ({{sivusto}}) ja huomasin, että {{havainto}}.\n\n' +
    'Tämä on yllättävän yleistä: mainontaan käytetään rahaa, mutta perusta sen alla ontuu. Seuranta ei mittaa oikeita asioita, ' +
    'sivu latautuu hitaasti tai yhteydenotto on tehty vaikeaksi. Silloin mainonta ei voi toimia, vaikka kampanjat olisivat hyviä.\n\n' +
    'Teen tähän kiinteähintaisen kokonaisuuden: käyn läpi seurannat, mainostilit, sivuston nopeuden, hakukonenäkyvyyden ja yhteydenottopolut, ' +
    'ja laitan ne kuntoon.\n\n' +
    'Taustaksi: olen tehnyt markkinointia, myyntiä ja verkkosivuja yli kymmenen vuotta. Tiimini kanssa hallinnoimme asiakkaiden ' +
    'mainosbudjetteja noin viiden miljoonan euron edestä.\n\n' +
    'Sopisiko, että kerron 15 minuutissa, mitä teidän perustassanne korjaisin ensimmäisenä?\n\n' +
    '{{allekirjoitus}}\n\n' + OPTOUT + '\n\n{{tietosuoja}}'],
  [2, 'Groundwork', 3, '',
    'Hei {{etunimi}},\n\n' +
    'nostan tämän vielä esiin. Voimme aloittaa myös pelkällä katselmuksella: käyn läpi seurannat, mainostilit, nopeuden ja yhteydenottopolut ' +
    'ja annan korjauslistan tärkeysjärjestyksessä. Katselmus maksaa 490 €, ja se hyvitetään, jos korjaukset tehdään.\n\n' +
    'Kiinnostaisiko?\n\n' +
    'Voit myös varata ajan suoraan kalenteristani: {{varauslinkki}}\n\n' +
    '{{nimi}}'],
  [3, 'Groundwork', 5, '',
    'Hei {{etunimi}},\n\n' +
    'tämä on viimeinen viestini aiheesta. Jos mainonnan tulokset tai sivuston toimivuus alkavat mietityttää myöhemmin, ' +
    'vastaa tähän viestiin, niin katsotaan perusta kuntoon silloin.\n\n' +
    'Hyvää jatkoa!\n{{nimi}}'],
  // ── Kulma 2: Meta- ja Google-mainonta kevyellä mallilla ──
  [1, 'Mainonta', '', '{{yritys}} / mainonnan tulokset',
    'Hei {{etunimi}},\n\n' +
    'huomasin, että {{havainto}}.\n\n' +
    'Autan pieniä ja keskisuuria yrityksiä saamaan Meta- ja Google-mainonnasta enemmän irti kevyellä mallilla: käyn mainostilit läpi kuukausittain, ' +
    'teen tarvittavat muutokset ja kokoan raportin, jonka pohjalta päätetään seuraava kuukausi. Palaveri kerran kuussa riittää.\n\n' +
    'Taustaksi: tiimini kanssa hallinnoimme seitsemässä vuodessa asiakkaiden mainosbudjetteja noin viiden miljoonan euron edestä, ' +
    'suurimmaksi osaksi liidien hankintaan.\n\n' +
    'Sopisiko, että katson mainontanne läpi ja kerron kolme asiaa, joita muuttaisin? Siitä ei tule kuluja.\n\n' +
    '{{allekirjoitus}}\n\n' + OPTOUT + '\n\n{{tietosuoja}}'],
  [2, 'Mainonta', 3, '',
    'Hei {{etunimi}},\n\n' +
    'nostan tämän vielä esiin ja kerron samalla suoraan, miten malli toimii: kuukausiraportti, palaveri kerran kuussa ja viestit tarpeen mukaan. ' +
    'Hinta on 490–990 € kuussa mainosbudjetin koosta riippuen, ilman pitkää sitoumusta.\n\n' +
    'Ensimmäinen läpikäynti on maksuton. Kiinnostaisiko?\n\n' +
    'Voit myös varata ajan suoraan kalenteristani: {{varauslinkki}}\n\n' +
    '{{nimi}}'],
  [3, 'Mainonta', 5, '',
    'Hei {{etunimi}},\n\n' +
    'en laita tästä enempää viestejä. Jos mainonnan tulokset alkavat mietityttää myöhemmin, vastaa tähän viestiin – ' +
    'katson silloin mielelläni, mitä tileiltä löytyy.\n\n' +
    'Hyvää jatkoa!\n{{nimi}}'],
  // ── Kulma 3: markkinoinnista vastaavan sparraus ──
  [1, 'Sparraus', '', '{{yritys}} / markkinoinnin sparraus',
    'Hei {{etunimi}},\n\n' +
    'huomasin, että {{havainto}}.\n\n' +
    'Markkinoinnista vastaavalla on yleensä enemmän tekemistä kuin aikaa, ja harvoin ketään, jonka kanssa käydä ajatuksia läpi. ' +
    'Siihen tarjoan taustatukea: käymme kerran kuussa läpi luvut, mainostilit ja tulevat kampanjat, ja tuon ulkopuolisen näkemyksen siitä, ' +
    'mistä saa enemmän irti.\n\n' +
    'Taustaksi: olen tehnyt markkinointia ja myyntiä yli kymmenen vuotta, siitä seitsemän omassa toimistossa. ' +
    'Urani aikana olen ollut tuomassa asiakkaille mitatusti reilut 50 miljoonaa euroa myyntiä.\n\n' +
    'Olisiko tästä hyötyä teillä? Kerron 15 minuutissa, miten se käytännössä toimii.\n\n' +
    '{{allekirjoitus}}\n\n' + OPTOUT + '\n\n{{tietosuoja}}'],
  [2, 'Sparraus', 3, '',
    'Hei {{etunimi}},\n\n' +
    'nostan tämän vielä esiin. Käytännössä malli on kevyt: palaveri kerran kuussa, kuukausikatsaus ja viestit väliin tarpeen mukaan. ' +
    'Hinta on 600–1 200 € kuussa ilman pitkää sitoumusta.\n\n' +
    'Voimme aloittaa myös yhdellä läpikäyntipalaverilla, jonka jälkeen tiedätte, onko tästä teille hyötyä.\n\n' +
    'Ajan voit varata suoraan kalenteristani: {{varauslinkki}}\n\n' +
    '{{nimi}}'],
  [3, 'Sparraus', 5, '',
    'Hei {{etunimi}},\n\n' +
    'tämä on viimeinen viestini aiheesta. Jos ulkopuoliselle näkemykselle tulee tarvetta myöhemmin – vaikka budjettisuunnittelun ' +
    'tai uuden kampanjan alla – vastaa tähän viestiin, niin jatketaan siitä.\n\n' +
    'Hyvää jatkoa!\n{{nimi}}'],
  // ── Matkailu, yleinen, verkosto ja vanhat asiakkaat ──
  [1, 'Matkailu', '', '{{yritys}} / sivut ja varaukset',
    'Hei {{etunimi}},\n\n' +
    'kävin läpi sivujanne ({{sivusto}}) ja huomasin, että {{havainto}}.\n\n' +
    'Matkailussa sivusto on usein se kohta, jossa asiakas päättää, varaako suoraan teiltä vai välityspalvelun kautta.\n\n' +
    'Teen matkailuyrityksille sivustoja ja suoria varauspolkuja. {{referenssi}} Tyypillinen projekti valmistuu 2–3 viikossa kiinteällä hinnalla.\n\n' +
    'Sopisiko 15 minuutin puhelu ensi viikolla? Kerron kolme asiaa, jotka korjaisin sivuillanne ensimmäisenä – maksutta, vaikka ette lähtisi projektiin.\n\n' +
    '{{allekirjoitus}}\n\n' +
    'P.S. Jos aihe ei ole nyt ajankohtainen, vastaa "ei kiitos", niin en laita enempää viestejä.\n\n{{tietosuoja}}'],
  [1, '', '', '{{yritys}} / verkkosivut',
    'Hei {{etunimi}},\n\n' +
    'kävin läpi sivujanne ({{sivusto}}) ja huomasin, että {{havainto}}.\n\n' +
    'Sivusto on usein se kohta, jossa asiakas päättää, ottaako yhteyttä vai jatkaako etsimistä.\n\n' +
    'Teen yrityksille verkkosivuja, jotka on rakennettu tuomaan yhteydenottoja. {{referenssi}} Tyypillinen projekti valmistuu 2–3 viikossa kiinteällä hinnalla.\n\n' +
    'Sopisiko 15 minuutin puhelu ensi viikolla? Kerron kolme asiaa, jotka korjaisin sivuillanne ensimmäisenä – maksutta, vaikka ette lähtisi projektiin.\n\n' +
    '{{allekirjoitus}}\n\n' +
    'P.S. Jos aihe ei ole nyt ajankohtainen, vastaa "ei kiitos", niin en laita enempää viestejä.\n\n{{tietosuoja}}'],
  [2, '', 3, '',
    'Hei {{etunimi}},\n\n' +
    'nostan tämän vielä esiin. Jos puhelu tuntuu isolta askeleelta, voin lähettää ne kolme korjausehdotusta suoraan sähköpostilla. Laitanko?\n\n' +
    'Voit myös varata ajan suoraan kalenteristani: {{varauslinkki}}\n\n' +
    '{{nimi}}'],
  [2, 'Matkailu', 3, '',
    'Hei {{etunimi}},\n\n' +
    'nostan tämän vielä esiin. Jos puhelu tuntuu isolta askeleelta, voin lähettää ne kolme korjausehdotusta suoraan sähköpostilla. Laitanko?\n\n' +
    'Voit myös varata ajan suoraan kalenteristani: {{varauslinkki}}\n\n' +
    '{{nimi}}'],
  [3, 'Matkailu', 5, '',
    'Hei {{etunimi}},\n\n' +
    'en halua täyttää postilaatikkoanne, joten tämä on viimeinen viestini aiheesta. Jos sivut tai suorat varaukset tulevat ajankohtaisiksi vaikka sesongin jälkeen, vastaa tähän viestiin, niin jatketaan siitä.\n\n' +
    'Hyvää sesonkia!\n{{nimi}}'],
  [3, '', 5, '',
    'Hei {{etunimi}},\n\n' +
    'en halua täyttää postilaatikkoanne, joten tämä on viimeinen viestini aiheesta. Jos sivujen uudistus tulee ajankohtaiseksi myöhemmin, vastaa tähän viestiin, niin jatketaan siitä.\n\n' +
    'Kiitos ja hyvää jatkoa!\n{{nimi}}'],
  [1, 'Verkosto', '', 'Pieni kysymys',
    'Moi {{etunimi}},\n\n' +
    'pitkästä aikaa! Olen nyt rakentanut omaa kokonaisuutta verkkosivujen, varausjärjestelmien ja markkinoinnin ympärille, ' +
    'ja minulla on lähiviikoille tilaa parille uudelle projektille.\n\n' +
    'Tuleeko mieleen joku – oma yritys, asiakas tai tuttu – jonka sivut tai varauspolku kaipaisivat uudistusta? ' +
    'Pelkkä nimi riittää, hoidan loput.\n\n' +
    'Kiitos jo etukäteen!\n{{nimi}}'],
  [2, 'Verkosto', 5, '',
    'Moi {{etunimi}},\n\n' +
    'nostan tämän vielä – jos joku tulee mieleen, vinkkaa vaikka pelkällä nimellä. Kiitos!\n\n' +
    '{{nimi}}'],
  [1, 'Vanha asiakas', '', '{{yritys}} / sivujen kuntotarkastus',
    'Moi {{etunimi}},\n\n' +
    'teimme aikanaan yhteistyötä, ja kävin nyt sivunne ({{sivusto}}) läpi. Huomasin, että {{havainto}}.\n\n' +
    'Muutamassa vuodessa verkossa ehtii muuttua paljon: hakukoneet, mobiilikäyttö ja asiakkaiden odotukset. ' +
    'Vanhoille asiakkaille teen nyt sivujen kuntotarkastuksen maksutta ja päivityksen kiinteällä hinnalla.\n\n' +
    'Sopisiko 15 minuutin puhelu, jossa käyn läpi, mitä päivittäisin ensimmäisenä?\n\n' +
    '{{allekirjoitus}}\n\n' +
    'P.S. Jos tämä ei ole nyt ajankohtaista, kuittaa vain lyhyesti, niin en vaivaa enempää.'],
  [2, 'Vanha asiakas', 4, '',
    'Moi {{etunimi}},\n\n' +
    'nostan tämän vielä esiin. Kuntotarkastus on vanhoille asiakkaille maksuton eikä sido mihinkään. Laitanko havainnot sähköpostilla?\n\n' +
    'Voit myös varata ajan suoraan kalenteristani: {{varauslinkki}}\n\n' +
    '{{nimi}}'],
  ['LinkedIn', '', '', '',
    'Hei {{etunimi}}, kiitos kun hyväksyit kutsun! Kävin läpi sivujanne ja huomasin, että {{havainto}}. ' +
    'Jos aihe kiinnostaa, katsotaan 15 minuutissa, mitä korjaisin ensimmäisenä.'],
];

function oletusPohjat() { return POHJAT_OLETUS; }

// ───────────────────────────── Asennus ─────────────────────────────

/** Rakentaa välilehdet, lähtötiedot ja päivittäisen ajastuksen. Ajetaan kerran. */
function asenna() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Avaa skripti taulukon kautta: Laajennukset → Apps Script.');
  if (ss.getSheetByName(V.kojelauta)) {
    throw new Error('Laskutusmoottori on jo asennettu tähän taulukkoon. Uuden version jälkeen aja paivitaRakenne – asennusta ei ajeta uudelleen.');
  }
  if (typeof Gmail === 'undefined') {
    throw new Error('Lisää ensin Gmail API: editorin vasemmasta reunasta Palvelut (Services) + → Gmail API → Lisää. Aja sitten asenna uudelleen.');
  }

  ss.setSpreadsheetLocale('fi_FI');
  ss.setSpreadsheetTimeZone('Europe/Helsinki');
  const vanhat = ss.getSheets();
  const nyt = tanaanAvain().slice(0, 7);

  // Välilehdet tässä järjestyksessä. Asetukset ja Tuotteet rakennetaan ensin, koska muut viittaavat niihin.
  const kojelauta = ss.insertSheet(V.kojelauta, 0);
  const sh = {};
  [V.viikot, V.kaupat, V.liidit, V.laskut, V.toistuvat, V.tavoitteet, V.tuotteet, V.pohjat, V.asetukset, V.loki]
    .forEach((n, i) => { sh[n] = ss.insertSheet(n, i + 1); });
  vanhat.forEach((s) => ss.deleteSheet(s));
  rakennaAsetukset(sh[V.asetukset]);
  rakennaTuotteet(sh[V.tuotteet]);
  rakennaKaupat(sh[V.kaupat], nyt);
  rakennaLiidit(sh[V.liidit]);
  rakennaLaskut(sh[V.laskut]);
  rakennaToistuvat(sh[V.toistuvat], nyt);
  rakennaTavoitteet(sh[V.tavoitteet], nyt);
  rakennaPohjat(sh[V.pohjat]);
  rakennaViikot(sh[V.viikot]);
  rakennaLoki(sh[V.loki]);
  asetaTodKaava(sh[V.kaupat]);

  muotoileKojelauta(kojelauta);
  luoLaskutuslista(nyt);
  PropertiesService.getScriptProperties().setProperty('LASKUTUSLISTA_KK', nyt);
  paivitaKojelauta();
  luoKaavio(kojelauta);
  asennaAjastus();
  ss.setActiveSheet(kojelauta);

  loki('Asennus', ss.getName(), 'Valmis');
  Logger.log('Valmis! Päivitä taulukon sivu, niin valikko Laskutusmoottori ilmestyy.\n' + ss.getUrl());
}

/**
 * Tuo vanhemmalla versiolla asennetun taulukon ajan tasalle: lisää puuttuvat välilehdet, sarakkeet ja asetukset.
 * Aja tämä aina, kun olet liittänyt uuden koodiversion. Olemassa olevaan dataan ei kosketa.
 */
function paivitaRakenne() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const muutokset = [];
  if (!ss.getSheetByName(V.tuotteet)) {
    rakennaTuotteet(ss.insertSheet(V.tuotteet, ss.getSheets().length));
    muutokset.push('välilehti Tuotteet');
  }
  if (!ss.getSheetByName(V.viikot)) {
    rakennaViikot(ss.insertSheet(V.viikot, 1));
    muutokset.push('välilehti Viikot');
  }
  Object.keys(SAR).forEach((nimi) => {
    const sh = ss.getSheetByName(nimi);
    if (!sh) return;
    const otsikot = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map((x) => String(x).trim());
    Object.values(SAR[nimi]).filter((o) => otsikot.indexOf(o) < 0).forEach((o) => {
      const sar = sh.getLastColumn() + 1;
      if (sar > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), sar - sh.getMaxColumns());
      sh.getRange(1, sar).setValue(o).setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff').setWrap(true);
      muutokset.push(nimi + ': ' + o);
    });
  });

  const kaupat = ss.getSheetByName(V.kaupat);
  if (kaupat) {
    kaupanValidoinnit(kaupat);
    // Edellisen version "1. lasku kk" → Tilauspvm, jos Tilauspvm on tyhjä
    const t = otsikkoIndeksit(kaupat, V.kaupat);
    const ots = kaupat.getRange(1, 1, 1, kaupat.getLastColumn()).getValues()[0].map((x) => String(x).trim());
    const vanha = ots.indexOf('1. lasku kk');
    if (vanha >= 0 && kaupat.getLastRow() > 1) {
      const n = kaupat.getLastRow() - 1;
      const vanhat = kaupat.getRange(2, vanha + 1, n, 1).getValues();
      const tilaus = kaupat.getRange(2, t.idx.tilauspvm + 1, n, 1);
      const arvot = tilaus.getValues();
      let siirretty = 0;
      arvot.forEach((r, i) => { if (!r[0] && vanhat[i][0]) { r[0] = vanhat[i][0]; siirretty++; } });
      if (siirretty) {
        tilaus.setValues(arvot);
        muutokset.push(siirretty + ' kaupan 1. lasku kk → Tilauspvm');
      }
    }
  }

  // Uudet viestipohjat segmenteille, joilla ei vielä ole yhtään pohjaa, ja uudet tuotteet nimen perusteella
  const pohjat = ss.getSheetByName(V.pohjat);
  if (pohjat) {
    const pt = otsikkoIndeksit(pohjat, V.pohjat);
    const olevat = new Set(lueTaulu(V.pohjat).rivit.map((r) => teksti(r.segmentti).toLowerCase()));
    const uudet = POHJAT_OLETUS.filter((p) => p[1] && !olevat.has(String(p[1]).toLowerCase()));
    if (uudet.length) {
      const alku = Math.max(pohjat.getLastRow(), 1) + 1;
      uudet.forEach((p, i) => {
        const rivi = new Array(pt.leveys).fill('');
        ['vaihe', 'segmentti', 'odota', 'aihe', 'viesti'].forEach((k, j) => { rivi[pt.idx[k]] = p[j]; });
        pohjat.getRange(alku + i, 1, 1, pt.leveys).setValues([rivi]);
      });
      pohjat.getRange(alku, pt.idx.viesti + 1, uudet.length, 1).setWrap(true);
      muutokset.push('viestipohjat: ' + Array.from(new Set(uudet.map((p) => p[1]))).join(', '));
    }
  }
  const tuoteSh = ss.getSheetByName(V.tuotteet);
  if (tuoteSh) {
    const nimet = new Set(lueTaulu(V.tuotteet).rivit.map((r) => teksti(r.tuote).toLowerCase()));
    const uudet = TUOTTEET_OLETUS.filter((p) => !nimet.has(String(p[0]).toLowerCase()));
    if (uudet.length) {
      tuoteSh.getRange(Math.max(tuoteSh.getLastRow(), 1) + 1, 1, uudet.length, uudet[0].length).setValues(uudet);
      muutokset.push('tuotteet: ' + uudet.map((p) => p[0]).join(', '));
    }
  }
  const liiditSh = ss.getSheetByName(V.liidit);
  if (liiditSh) sarakeRange(liiditSh, V.liidit, 'segmentti').setDataValidation(lista(SEGMENTIT, true));

  const as = valilehti(V.asetukset);
  const olemassa = as.getRange(1, 1, as.getLastRow(), 1).getValues().map((r) => String(r[0]).trim());
  let viimeinen = olemassa.reduce((m, x, i) => (x ? i + 1 : m), 1);
  ASETUSRIVIT.forEach(([avain, otsikko, oletus, selite, muoto]) => {
    if (olemassa.indexOf(otsikko) >= 0) return;
    viimeinen++;
    as.getRange(viimeinen, 1, 1, 3).setValues([[otsikko, typeof oletus === 'boolean' ? '' : oletus, selite]]);
    muotoileAsetus(as.getRange(viimeinen, 2), avain, oletus, muoto);
    muutokset.push('asetus ' + otsikko);
  });

  const kl = valilehti(V.kojelauta);
  kl.getCharts().forEach((c) => kl.removeChart(c));
  muotoileKojelauta(kl);
  paivitaKojelauta();
  luoKaavio(kl);
  loki('Rakenne päivitetty', '', muutokset.join(', ') || 'ei muutoksia');
  ilmoita(muutokset.length ? 'Lisätty: ' + muutokset.join(', ') : 'Rakenne oli jo ajan tasalla.');
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
  const otsikot = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map((x) => String(x).trim());
  const sar = otsikot.indexOf(SAR[nimi][avain]) + 1;
  if (!sar) throw new Error('Välilehdeltä ' + nimi + ' puuttuu sarake "' + SAR[nimi][avain] + '"');
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
  rakennaOtsikot(sh, V.kaupat, [200, 200, 170, 160, 140, 70, 100, 100, 230, 90, 100, 100, 220, 100, 160, 240, 90]);
  const n = V.kaupat;
  kaupanValidoinnit(sh);
  const muistiot = {
    tuote: 'Tuote määrää hinnan ja laskutusaikataulun (Tuotteet-välilehti). Tyhjä Kertatulo / Kk-tulo = tuotteen hinta.',
    vaihe: 'Liidi 10 %, Palaveri sovittu 25 %, Tarjous lähetetty 50 %, Neuvottelu 75 %, Voitettu 100 %, Hävitty 0 %. Todennäköisyydet: Asetukset-välilehti.',
    kerta: 'Projektin hinta alv 0. Tyhjä = tuotteen hinta.',
    tilauspvm: 'Voitettu kauppa: tilauspäivä. Avoin kauppa: arvioitu tilauspäivä.\nTyhjä = luontipäivä + myyntisykli (Asetukset). Jos arvio on mennyt ohi, ennuste siirtää sen tälle päivälle.\n\nLaskutuserät lasketaan tästä tuotteen aikataululla.',
    eratKasin: 'Poikkeusaikataulu, joka ohittaa tuotteen erät. Esim.\n2000 € 30.11.2026; 1000 € 15.12.2026\ntai\n50 % 1.12.2026; 50 % 15.1.2027\n\nKäytä myös jo sovitulle työlle (vanhan projektin loppulaskutus): jätä silloin Tilauspvm tyhjäksi, niin kauppaa ei lasketa viikon uudeksi kaupaksi.',
    kk: 'Kuukausittainen tulo kaupasta: ylläpito, hosting, markkinointi tai booking engine. Tyhjä = tuotteen kk-tulo.',
    kkAlkaa: 'Ensimmäinen kuukausi, jolta kk-tulo laskutetaan. Tyhjä = viimeisen erän kuukausi.',
    tod: 'Täyttyy automaattisesti vaiheen mukaan. Älä kirjoita tähän sarakkeeseen.',
    asiakas: 'Kun kirjoitat asiakkaan, Tuote (oletustuote), Vaihe (Liidi) ja Luotu täyttyvät itsestään.',
  };
  const t = otsikkoIndeksit(sh, n);
  Object.keys(muistiot).forEach((s) => sh.getRange(1, t.idx[s] + 1).setNote(muistiot[s]));

  // Lähtötilanne: jo sovittu työ. Tilauspvm jää tyhjäksi, jotta näitä ei lasketa viikkoseurannassa uusiksi kaupoiksi.
  const pv = (kk, paiva) => paiva + '.' + Number(kk.slice(5, 7)) + '.' + kk.slice(0, 4);
  kirjoitaRivi(sh, n, 2, {
    asiakas: 'Verkkosivuasiakas', kuvaus: 'Verkkosivuprojekti', lahde: 'Olemassa oleva asiakas', vaihe: VOITETTU,
    kerta: 1000, eratKasin: '1000 € ' + pv(nyt, 16), seuraava: 'Laskuta', seuraavaPvm: pvmSolu(tanaanAvain()),
    muistiinpano: 'Vaihda asiakkaan nimi.',
  });
  kirjoitaRivi(sh, n, 3, {
    asiakas: 'Käynnissä oleva projekti', kuvaus: 'Loppulaskutus', lahde: 'Olemassa oleva asiakas', vaihe: VOITETTU,
    kerta: 3000, eratKasin: '2000 € ' + pv(nyt, 30) + '; 1000 € ' + pv(kkLisaa(nyt, 1), 15),
    seuraava: 'Laskuta 2 000 €', seuraavaPvm: pvmSolu(nyt + '-30'),
    muistiinpano: 'Vaihda asiakkaan nimi ja tarkista erien summat ja päivät.',
  });
}

function kaupanValidoinnit(sh) {
  const n = V.kaupat;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sarakeRange(sh, n, 'vaihe').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(ss.getRange(V.asetukset + '!E2:E20'), true).build());
  sarakeRange(sh, n, 'tuote').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(ss.getRange(V.tuotteet + '!A2:A50'), true).setAllowInvalid(false).build());
  sarakeRange(sh, n, 'lahde').setDataValidation(lista(LAHTEET, true));
  ['kerta', 'kk'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('#,##0 "€"'));
  sarakeRange(sh, n, 'tod').setNumberFormat('0%');
  ['kkAlkaa', 'kkPaattyy'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('mm/yyyy').setDataValidation(paivamaara()));
  ['tilauspvm', 'seuraavaPvm'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('d.m.yyyy').setDataValidation(paivamaara()));
  sarakeRange(sh, n, 'luotu').setNumberFormat('d.m.yyyy');
}

/** Tod. % -sarake Kaupat-välilehdelle: vaiheen todennäköisyys nimetystä alueesta VAIHEET. */
function asetaTodKaava(sh) {
  const t = otsikkoIndeksit(sh, V.kaupat);
  const v = sarakeKirjain(t.idx.vaihe + 1);
  sh.getRange(1, t.idx.tod + 1).setFormula('={"' + SAR[V.kaupat].tod + '";ARRAYFORMULA(IF(' + v + '2:' + v + '="",,IFERROR(VLOOKUP(' +
    v + '2:' + v + ',VAIHEET,2,FALSE),0)))}');
}

function rakennaTuotteet(sh) {
  rakennaOtsikot(sh, V.tuotteet, [200, 100, 100, 80, 80, 80, 80, 80, 80, 100, 420]);
  const n = V.tuotteet;
  sh.getRange(2, 1, TUOTTEET_OLETUS.length, TUOTTEET_OLETUS[0].length).setValues(TUOTTEET_OLETUS);
  ['hinta', 'kk'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('#,##0 "€"'));
  ['e1', 'e2', 'e3'].forEach((s) => sarakeRange(sh, n, s).setNumberFormat('0%'));
  sh.getRange(1, 1).setNote('Tuote = hinta + laskutusaikataulu. Kaupat-välilehden Tuote-sarake valitsee rivin täältä.\n\nErä % ja pv: osuus hinnasta ja montako päivää tilauksesta lasku lähtee. Esim. 50 % / 7 pv + 50 % / 35 pv.\nMaksuaika pv: montako päivää laskusta rahat ovat tilillä.\n\nLisää omia tuotteita alle (esim. Booking engine, kun hinnoittelu on lukittu).');
}

function rakennaViikot(sh) {
  sh.getRange(1, 1, 1, VIIKKO_OTSIKOT.length).setValues([VIIKKO_OTSIKOT])
    .setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff').setWrap(true).setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 34);
  [70, 110, 80, 90, 90, 100, 120, 90, 100, 90, 110, 380].forEach((w, i) => sh.setColumnWidth(i + 1, w));
  sh.getRange(1, 1).setNote('Kone kirjoittaa tämän välilehden. Voitettu kauppa lasketaan sille viikolle, jolle sen Tilauspvm osuu.\n\nTila: ✓ = viikon kauppatavoite täyttyi, ✗ = jäi. Tavoite: Asetukset → Kauppoja / viikko, tavoite.');
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
  rakennaOtsikot(sh, V.laskut, [110, 110, 200, 300, 120, 120, 100, 260]);
  const n = V.laskut;
  sarakeRange(sh, n, 'kk').setNumberFormat('mm/yyyy').setDataValidation(paivamaara());
  sarakeRange(sh, n, 'ajankohta').setNumberFormat('d.m.yyyy');
  sh.getRange(1, 2).setNote('Suunniteltu laskutuspäivä: toistuvat kuun 1. päivä, kauppojen erät aikataulun mukaan. Laskuttamatta-rivi on rästi, kun tämä päivä on ohitettu.');
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
  rakennaOtsikot(sh, V.tavoitteet, [120, 150, 110, 520]);
  const n = V.tavoitteet;
  sarakeRange(sh, n, 'kk').setNumberFormat('mm/yyyy').setDataValidation(paivamaara());
  sarakeRange(sh, n, 'tavoite').setNumberFormat('#,##0 "€"');
  const portaat = { '2026-11': 15000, '2026-12': 15000, '2027-01': 15000, '2027-02': 15000, '2027-03': 16000,
    '2027-04': 17000, '2027-05': 18000, '2027-06': 19000 };
  const selitteet = {
    '2026-11': 'Pohja 11 000 € + verkkosivuprojekti 1 000 € + käynnissä olevasta projektista 2 000 € → ennuste 14 000 €. Verkostoviestit.',
    '2026-12': 'Käynnissä olevan projektin loppuerä 1 000 €. Lähetysdomainin lämmitys, oma lista sisään, kone LUONNOS-tilassa.',
    '2027-01': 'Kone käyntiin (LÄHETÄ). Booking engine -kampanja. Tavoite 1 kauppa viikossa.',
    '2027-03': 'Ensimmäiset booking engine -asiakkaat.',
    '2027-07': 'Tavoitetaso 20 000 €/kk.',
  };
  const rivit = [];
  for (let i = 0; i < 14; i++) {
    const kk = kkLisaa(nyt, i);
    rivit.push([pvmSolu(kk + '-01'), portaat[kk] || (kk > '2027-06' ? 20000 : 15000), kk < '2027-01' ? 0 : 1, selitteet[kk] || '']);
  }
  sh.getRange(2, 1, rivit.length, 4).setValues(rivit);
  sh.getRange(1, 1).setNote('Yksi rivi per kuukausi. Lisää rivejä sitä mukaa kuin suunnitelma tarkentuu.');
  sh.getRange(1, 3).setNote('Kauppatavoite viikossa tälle kuulle. 0 = ei viikkotavoitetta (ei ✓/✗-merkintöjä eikä tahtia viikkotavoitteesta). Tyhjä = Asetukset → Kauppoja / viikko, tavoite.');
}

function rakennaPohjat(sh) {
  rakennaOtsikot(sh, V.pohjat, [80, 100, 90, 260, 720]);
  sh.getRange(2, 1, POHJAT_OLETUS.length, 5).setValues(POHJAT_OLETUS);
  sh.getRange(2, 5, POHJAT_OLETUS.length, 1).setWrap(true);
  sh.getRange(2, 1, POHJAT_OLETUS.length, 5).setVerticalAlignment('top');
  sh.getRange(1, 1).setNote('Vaihe 1 = avausviesti, 2 ja 3 = jatkoviestit samaan ketjuun. LinkedIn = viesti päivän LinkedIn-listalle.\n\nSegmentti: tyhjä = oletuspohjat. Jos segmentillä on omia pohjia, sen liidit käyttävät vain niitä, ja sarja loppuu segmentin viimeiseen vaiheeseen (esim. Verkosto: 2 viestiä).\n\nJos avausviestissä on {{havainto}}, viesti lähtee vain liidille, jolla on havainto.');
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

  ASETUSRIVIT.forEach(([avain, , oletus, , muoto], i) => muotoileAsetus(sh.getRange(i + 2, 2), avain, oletus, muoto));

  sh.getRange(2, 5, VAIHEET_OLETUS.length, 2).setValues(VAIHEET_OLETUS);
  sh.getRange(2, 6, 19, 1).setNumberFormat('0%');
  SpreadsheetApp.getActive().setNamedRange('VAIHEET', sh.getRange('E2:F20'));
  sh.getRange(1, 5).setNote('Voitettu ja Hävitty ovat koneelle erityisiä – älä nimeä niitä uudelleen. Muita vaiheita voit lisätä alle.');
}

function muotoileAsetus(solu, avain, oletus, muoto) {
  solu.setWrap(true).setBackground('#fffbea');
  if (avain === 'tila') solu.setDataValidation(lista(TILAT)).setFontWeight('bold');
  if (typeof oletus === 'boolean') solu.insertCheckboxes().setValue(oletus);
  if (muoto === 'pct') solu.setNumberFormat('0.0%');
  if (muoto === 'eur') solu.setNumberFormat('#,##0 "€"');
}

function rakennaLoki(sh) {
  rakennaOtsikot(sh, V.loki, [150, 180, 260, 520]);
  sarakeRange(sh, V.loki, 'aika').setNumberFormat('d.m.yyyy HH:mm');
}

function luoKaavio(sh) {
  try {
    const rivit = KL.kkRiveja + 1;
    const kaavio = sh.newChart()
      .asComboChart()
      .addRange(sh.getRange(KL.kk, 1, rivit, 2)) // Kuukausi + Tavoite
      .addRange(sh.getRange(KL.kk, 7, rivit, 2)) // Ennuste + Laskutettu
      .setNumHeaders(1)
      .setOption('title', 'Tavoite, ennuste ja laskutettu')
      .setOption('seriesType', 'bars')
      .setOption('series', { 0: { type: 'line', color: '#111827', lineWidth: 3 }, 1: { color: '#93c5fd' }, 2: { color: '#16a34a' } })
      .setOption('legend', { position: 'bottom' })
      .setOption('width', 760)
      .setOption('height', 340)
      .setPosition(KL.kpi, KL.leveys + 2, 0, 0)
      .build();
    sh.insertChart(kaavio);
  } catch (e) {
    Logger.log('Kaavion luonti ei onnistunut: ' + e.message);
  }
}

function muotoileKojelauta(sh) {
  sh.setColumnWidth(1, 270).setColumnWidth(2, 120).setColumnWidth(3, 110).setColumnWidth(4, 290)
    .setColumnWidth(5, 120).setColumnWidth(6, 120).setColumnWidth(7, 200)
    .setColumnWidths(8, 5, 110);
  sh.setHiddenGridlines(true);
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
    .addItem('Päivitä taulukon rakenne (uuden version jälkeen)', 'paivitaRakenne')
    .addItem('Asenna verkkosivun lomake', 'asennaLomake')
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
  const sar = t.idx.asiakas + 1;
  if (range.getColumn() > sar || range.getColumn() + range.getNumColumns() - 1 < sar) return;
  const alku = Math.max(2, range.getRow());
  const loppu = range.getLastRow();
  if (loppu < alku) return;
  const oletusTuote = lueAsetukset().oletusTuote;
  const alue = sh.getRange(alku, 1, loppu - alku + 1, t.leveys);
  const arvot = alue.getValues();
  const muuttuneet = {};
  arvot.forEach((r) => {
    if (!teksti(r[t.idx.asiakas])) return;
    if (!r[t.idx.luotu]) { r[t.idx.luotu] = new Date(); muuttuneet.luotu = true; }
    if (!teksti(r[t.idx.tuote]) && oletusTuote) { r[t.idx.tuote] = oletusTuote; muuttuneet.tuote = true; }
    if (!teksti(r[t.idx.vaihe])) { r[t.idx.vaihe] = 'Liidi'; muuttuneet.vaihe = true; }
  });
  // Kirjoitetaan vain koneen sarakkeet: Tod. % on kaava, jota ei saa kirjoittaa yli
  Object.keys(muuttuneet).forEach((s) => {
    sh.getRange(alku, t.idx[s] + 1, arvot.length, 1).setValues(arvot.map((r) => [r[t.idx[s]]]));
  });
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
  const kaupat = ss.getSheetByName(V.kaupat);
  const uusiRivi = luoKauppaLiidista(t, l, lueAsetukset(), lisaaArkipaivia(tanaanAvain(), 2), '');
  paivitaKojelauta();
  ss.setActiveSheet(kaupat);
  kaupat.setActiveRange(kaupat.getRange(uusiRivi, 1));
  ilmoita('Siirretty Kaupat-välilehdelle. Tarkista tuote, hinta ja arvioitu tilauspäivä.');
}

/**
 * Lisää liidistä kaupan vaiheeseen Palaveri sovittu ja merkitsee liidin tilaan Kauppa.
 * liidit = lueTaulu(V.liidit), l = sen rivi (raaka tai malli), palaveri = 'YYYY-MM-DD'. Palauttaa Kaupat-rivin numeron.
 */
function luoKauppaLiidista(liidit, l, a, palaveri, lisatieto) {
  const kaupat = valilehti(V.kaupat);
  const t = otsikkoIndeksit(kaupat, V.kaupat);
  const asiakkaat = kaupat.getLastRow() > 1 ? kaupat.getRange(2, t.idx.asiakas + 1, kaupat.getLastRow() - 1, 1).getValues() : [];
  const uusiRivi = asiakkaat.reduce((m, r, i) => (teksti(r[0]) ? i + 2 : m), 1) + 1;
  const sahkoposti = teksti(l.email).toLowerCase();
  kirjoitaRivi(kaupat, V.kaupat, uusiRivi, {
    asiakas: teksti(l.yritys) || [teksti(l.etunimi), teksti(l.sukunimi)].filter(String).join(' ') || sahkoposti,
    kuvaus: a.oletusTuote || 'Verkkosivuprojekti',
    tuote: a.oletusTuote,
    lahde: teksti(l.segmentti) === 'Verkosto' ? 'Verkosto' : teksti(l.segmentti) === 'Vanha asiakas' ? 'Olemassa oleva asiakas' :
      luku(l.vaihe) >= 1 ? 'Sähköposti' : (teksti(l.liTila) ? 'LinkedIn' : 'Muu'),
    vaihe: 'Palaveri sovittu',
    seuraava: 'Palaveri',
    seuraavaPvm: pvmSolu(palaveri),
    yhteys: [teksti(l.etunimi), teksti(l.sukunimi), sahkoposti, teksti(l.puhelin)].filter(String).join(' '),
    muistiinpano: [teksti(l.havainto), lisatieto].filter(String).join(' · '),
    luotu: new Date(),
  });
  poistaLuonnos(teksti(l.luonnos));
  tallenna(liidit, l._rivi, { tila: 'Kauppa', luonnos: '', seuraava: '' });
  loki('Siirretty kauppoihin', teksti(l.yritys) || sahkoposti, 'Kaupat rivi ' + uusiRivi + (lisatieto ? ' · ' + lisatieto : ''));
  return uusiRivi;
}

/** Kalenterin palaverit: liidi, jonka sähköposti on tapahtuman vieraana tai järjestäjänä, siirtyy kauppoihin. */
function tarkistaKalenteri(d, raportti) {
  const a = d.malli.asetukset;
  if (!a.kalenteri) return;
  let tapahtumat;
  try {
    const nyt = Date.now();
    tapahtumat = CalendarApp.getDefaultCalendar().getEvents(new Date(nyt - 7 * 864e5), new Date(nyt + 60 * 864e5)).map((t) => ({
      alku: pvAvain(t.getStartTime()), aika: Utilities.formatDate(t.getStartTime(), tz(), 'd.M. HH.mm'), otsikko: t.getTitle(),
      osallistujat: t.getGuestList().map((g) => g.getEmail()).concat(t.getCreators ? t.getCreators() : []),
    }));
  } catch (e) {
    raportti.virheet.push('Kalenterin luku ei onnistunut: ' + e.message);
    return;
  }
  palaveritKalenterista(d.malli.liidit, tapahtumat).forEach(({ liidi, tapahtuma }) => {
    try {
      luoKauppaLiidista(d.taulut.lii, liidi, a, tapahtuma.alku, 'Palaveri ' + tapahtuma.aika + ' (kalenteri)');
      raportti.palaverit.push({ liidi, tapahtuma });
    } catch (e) {
      raportti.virheet.push('Palaverin kirjaus ' + (liidi.yritys || liidi.email) + ': ' + e.message);
    }
  });
}

const KALENTERIIN_KELPAAVAT = ['', 'Uusi', 'Luonnos', 'Sekvenssissä', 'Vastasi', 'Palaveri', 'Ei vastausta', 'Tauko'];

/** Puhdas: yhdistää kalenterin tapahtumat liideihin sähköpostin perusteella. Liidille aikaisin tapahtuma. */
function palaveritKalenterista(liidit, tapahtumat) {
  const sahkopostista = {};
  liidit.forEach((l) => {
    if (l.email && KALENTERIIN_KELPAAVAT.includes(l.tila) && !sahkopostista[l.email]) sahkopostista[l.email] = l;
  });
  const loydot = {};
  tapahtumat.slice().sort((x, y) => (x.alku < y.alku ? -1 : 1)).forEach((t) => {
    t.osallistujat.map((x) => String(x || '').trim().toLowerCase()).forEach((email) => {
      const l = sahkopostista[email];
      if (l && !loydot[email]) loydot[email] = { liidi: l, tapahtuma: t };
    });
  });
  return Object.keys(loydot).map((k) => loydot[k]);
}

function valikkoLaskutuslista() {
  const n = luoLaskutuslista(tanaanAvain().slice(0, 7));
  paivitaKojelauta();
  ilmoita(n ? n + ' riviä lisätty Laskut-välilehdelle.' : 'Kaikki tämän kuun rivit olivat jo listalla.');
}

// ───────────────────────────── Verkkosivun lomake ─────────────────────────────

/**
 * Luo salaisuuden verkkosivun lomakkeelle ja kertoo, miten web-osoite otetaan käyttöön.
 * Sivuston /api/yhteys lähettää kyselyt tänne (doPost) salaisuuden kanssa.
 */
function asennaLomake() {
  const props = PropertiesService.getScriptProperties();
  let salaisuus = props.getProperty('LOMAKE_SALAISUUS');
  if (!salaisuus) {
    salaisuus = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('LOMAKE_SALAISUUS', salaisuus);
  }
  const ohje = 'APPS_SCRIPT_SECRET = ' + salaisuus + '\n\n' +
    'Ota web-osoite käyttöön: Apps Script → Ota käyttöön (Deploy) → Uusi käyttöönotto → Verkkosovellus.\n' +
    'Suorita käyttäjänä: Minä. Käyttöoikeus: Kuka tahansa. Kopioi web-osoite.\n\n' +
    'Vercel → projekti puregroundwork → Settings → Environment Variables:\n' +
    'APPS_SCRIPT_URL = web-osoite\nAPPS_SCRIPT_SECRET = yllä oleva salaisuus';
  Logger.log(ohje);
  try {
    SpreadsheetApp.getUi().alert('Verkkosivun lomake', ohje, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // ajettu editorista: ohje näkyy lokissa
  }
  return salaisuus;
}

/** Verkkosivun yhteydenotto: POST { secret, nimi, email, yritys, sivusto, palvelu, viesti } → Liidit, tila Vastasi. */
function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return jsonVastaus({ ok: false, error: 'json' });
  }
  const salaisuus = PropertiesService.getScriptProperties().getProperty('LOMAKE_SALAISUUS');
  if (!salaisuus || data.secret !== salaisuus) return jsonVastaus({ ok: false, error: 'auth' });
  const tanaan = tanaanAvain();
  const uusi = lomakeLiidiksi(data, tanaan);
  if (uusi.virhe) return jsonVastaus({ ok: false, error: uusi.virhe });

  const lukko = LockService.getScriptLock();
  lukko.waitLock(20000);
  try {
    const t = lueTaulu(V.liidit);
    const olemassa = t.rivit.find((r) => teksti(r.email).toLowerCase() === uusi.email);
    if (olemassa) {
      // Tuttu liidi otti itse yhteyttä: sarja pysähtyy ja viesti kirjataan
      poistaLuonnos(teksti(olemassa.luonnos));
      tallenna(t, olemassa._rivi, { tila: 'Vastasi', vastausPvm: pvmSolu(tanaan), seuraava: '', luonnos: '',
        muistiinpano: lisaaMuistiinpano(olemassa.muistiinpano, 'Sivuston lomake ' + suomiPvm(tanaan) + ': ' + uusi.muistiinpano) });
    } else {
      const rivi = new Array(t.leveys).fill('');
      Object.keys(uusi).forEach((k) => { if (k in t.idx) rivi[t.idx[k]] = uusi[k]; });
      rivi[t.idx.vastausPvm] = pvmSolu(tanaan);
      rivi[t.idx.lisatty] = new Date();
      t.sh.getRange(Math.max(t.sh.getLastRow(), 1) + 1, 1, 1, t.leveys).setValues([rivi]);
    }
    loki('Yhteydenotto sivustolta', (uusi.yritys || uusi.etunimi) + ' <' + uusi.email + '>', uusi.muistiinpano.slice(0, 120));
    try {
      const a = lueAsetukset();
      GmailApp.sendEmail(raporttiOsoite(a), 'Uusi yhteydenotto sivustolta: ' + [uusi.etunimi, uusi.sukunimi].filter(String).join(' ') +
        (uusi.yritys ? ', ' + uusi.yritys : ''),
        [uusi.etunimi + ' ' + uusi.sukunimi, uusi.yritys, uusi.email, uusi.sivusto, '', uusi.muistiinpano, '',
          'Liidi on Liidit-välilehdellä tilassa Vastasi. Kun palaveri on sovittu, siirrä se kauppoihin.',
          SpreadsheetApp.getActiveSpreadsheet().getUrl()].filter((x) => x !== undefined).join('\n'),
        { name: 'Laskutusmoottori', replyTo: uusi.email });
    } catch (err) {
      loki('Virhe', 'Yhteydenoton ilmoitus', err.message);
    }
    paivitaKojelauta();
  } finally {
    lukko.releaseLock();
  }
  return jsonVastaus({ ok: true });
}

function jsonVastaus(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Puhdas: lomakkeen tiedot Liidit-rivin kentiksi. Palauttaa { virhe } tai kentät. */
function lomakeLiidiksi(d, tanaan) {
  const s = (v, max) => String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
  const email = s(d.email, 200).toLowerCase();
  const nimi = s(d.nimi, 120);
  if (!nimi) return { virhe: 'nimi' };
  if (!onEmail(email)) return { virhe: 'email' };
  const osat = nimi.split(' ');
  const palvelu = s(d.palvelu, 80);
  const viesti = String(d.viesti === undefined || d.viesti === null ? '' : d.viesti).trim().slice(0, 3000);
  return {
    yritys: s(d.yritys, 160), etunimi: osat[0], sukunimi: osat.slice(1).join(' '), email, sivusto: s(d.sivusto, 300),
    segmentti: 'Inbound', tila: 'Vastasi', vaihe: 0,
    muistiinpano: [palvelu ? '[' + palvelu + ']' : '', viesti].filter(String).join(' ') || '(ei viestiä)',
  };
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
    const raportti = { palaverit: [], lahetetyt: [], luonnokset: [], jatkot: [], vastaukset: [], pomput: [], loppuneet: [],
      tuplat: [], virheet: [], esikatselu: [], linkedin: [], soitot: [], tarkistetut: 0 };

    tarkistaKetjut(d, raportti);
    tarkistaKalenteri(lueKaikki(), raportti);
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
    const sisaltoa = raportti.vastaukset.length || raportti.pomput.length || raportti.palaverit.length ||
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
  return { palaverit: [], lahetetyt: [], luonnokset: [], jatkot: [], vastaukset: [], pomput: [], loppuneet: [], tuplat: [],
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
  const uudet = laskutusrivit(d.malli, kk, tanaanAvain()).filter((r) => !olemassa.has(r.tunniste));
  if (!uudet.length) return 0;
  const sh = d.taulut.las.sh;
  const t = d.taulut.las;
  const rivit = uudet.map((r) => {
    const rivi = new Array(t.leveys).fill('');
    rivi[t.idx.kk] = pvmSolu(r.kk + '-01');
    rivi[t.idx.ajankohta] = pvmSolu(r.ajankohta);
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
  const avain = lueAsetukset().pagespeed;
  let tarkistettu = 0;
  for (const r of jono) {
    if (tarkistettu >= maara || Date.now() - alku > sekunnit * 1000) break;
    const sivu = haeSivu(teksti(r.sivusto));
    if (avain && !sivu.virhe) {
      const ps = haePageSpeed(sivu.url, avain);
      if (ps) Object.assign(sivu, { pagespeed: ps.pisteet, lcp: ps.lcp });
    }
    const tulos = analysoiSivu(sivu.html || '', sivu, teksti(r.segmentti), vuosi);
    const muutos = { signaalit: tulos.signaalit };
    if (!teksti(r.ehdotus)) muutos.ehdotus = tulos.havainto;
    if (!teksti(r.segmentti) && /(^| · )WordPress( · |$)/.test(tulos.signaalit)) muutos.segmentti = 'WordPress';
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

/** Google PageSpeed Insights, mobiili. Palauttaa { pisteet 0–100, lcp sekunteina } tai null. Kestää 10–30 s. */
function haePageSpeed(url, avain) {
  try {
    const vastaus = UrlFetchApp.fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=' +
      encodeURIComponent(url) + '&key=' + encodeURIComponent(avain), { muteHttpExceptions: true });
    if (vastaus.getResponseCode() !== 200) return null;
    return puraPageSpeed(JSON.parse(vastaus.getContentText()));
  } catch (e) {
    return null;
  }
}

function puraPageSpeed(json) {
  const lh = json && json.lighthouseResult;
  const score = lh && lh.categories && lh.categories.performance && lh.categories.performance.score;
  if (typeof score !== 'number') return null;
  const lcp = lh.audits && lh.audits['largest-contentful-paint'] && lh.audits['largest-contentful-paint'].numericValue;
  return { pisteet: Math.round(score * 100), lcp: typeof lcp === 'number' ? lcp / 1000 : null };
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
  const leveys = KL.leveys;
  sh.getRange(1, 1, KL.segmentit + KL.segmenttiRiveja + 2, leveys).clear();
  const r = t.nyt;
  const a = t.asetukset;
  const vk = t.tamaViikko || { viikko: '', voitetut: 0, tavoite: 0 };

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
    ['Laskuttamatta, laskutuspäivä ohi', t.laskuttamatta.summa],
    ['Kassaan tässä kuussa (ennuste)', r.kassa],
    ['Suurimman asiakkaan osuus', t.keskittyma.osuus],
  ];
  const kone = [
    ['MYYNTIKONE', ''],
    ['Avoin vaje (tämä + ensi kk)', t.kone.avoinVaje],
    ['Tarvittavat kaupat', t.kone.kaupat],
    ['Tarvittavat palaverit', t.kone.palaverit],
    ['Tarvittavat kontaktit (kesken ' + t.kone.kesken + ')', t.kone.kontaktit],
    ['Tahti vajeesta / arkipäivä', t.kone.tahtiVajeesta],
    ['Tahti viikkotavoitteesta / arkipäivä', t.kone.tahtiViikosta],
    ['Kiintiö: uusia kontakteja / arkipäivä', t.kone.kiintio],
    ['Liidejä jonossa', t.kone.jonossa],
    ['Kauppoja vk ' + vk.viikko + ' / tavoite', vk.voitetut + ' / ' + vk.tavoite + ' · kuussa ' + t.kuunKaupat],
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
    ['', '', '', ''],
  ];
  sh.getRange(KL.kpi, 1, kpi.length, 2).setValues(kpi);
  sh.getRange(KL.kpi, 4, kone.length, 2).setValues(kone);
  sh.getRange(KL.kpi, 7, konv.length, 4).setValues(konv);

  [sh.getRange(KL.kpi, 1, 1, 2), sh.getRange(KL.kpi, 4, 1, 2), sh.getRange(KL.kpi, 7, 1, 4)]
    .forEach((x) => x.setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff'));
  sh.getRange(KL.kpi + 1, 2, 8, 1).setNumberFormat('#,##0 "€"');
  sh.getRange(KL.kpi + 9, 2).setNumberFormat('0%');
  sh.getRange(KL.kpi + 5, 1, 1, 2).setFontWeight('bold');
  sh.getRange(KL.kpi + 6, 2).setBackground(r.vaje > 0 ? '#fee2e2' : '#dcfce7').setFontWeight('bold');
  sh.getRange(KL.kpi + 7, 2).setBackground(t.laskuttamatta.summa > 0 ? '#fef3c7' : null);
  sh.getRange(KL.kpi + 9, 2).setBackground(t.keskittyma.osuus > 0.5 ? '#fef3c7' : null);
  sh.getRange(KL.kpi + 1, 5).setNumberFormat('#,##0 "€"');
  sh.getRange(KL.kpi + 2, 5, 3, 1).setNumberFormat('0.0');
  sh.getRange(KL.kpi + 7, 4, 1, 2).setFontWeight('bold').setFontSize(12);
  sh.getRange(KL.kpi + 7, 5).setBackground(t.kone.rajoitettu ? '#fee2e2' : '#dbeafe');
  sh.getRange(KL.kpi + 9, 5).setBackground(vk.tavoite > 0 && vk.voitetut >= vk.tavoite ? '#dcfce7' : null);
  sh.getRange(KL.kpi + 1, 8, 2, 3).setNumberFormat('0.0%');
  sh.getRange(KL.kpi + 3, 8, 1, 3).setNumberFormat('#,##0 "€"');
  sh.getRange(KL.kpi, 2, kpi.length, 1).setHorizontalAlignment('right');
  sh.getRange(KL.kpi, 5, kone.length, 1).setHorizontalAlignment('right');
  sh.getRange(KL.kpi, 8, konv.length, 3).setHorizontalAlignment('right');

  sh.getRange(KL.huomiot, 1).setValue('HUOMIOT').setFontWeight('bold');
  const huomiot = t.huomiot.slice(0, KL.huomioRiveja);
  if (huomiot.length) sh.getRange(KL.huomiot + 1, 1, huomiot.length, 1).setValues(huomiot.map((h) => [h]));

  const kkOtsikot = ['Kuukausi', 'Tavoite', 'Toistuvat', 'Voitetut kaupat', 'Varmistettu', 'Putki (painotettu)',
    'Ennuste', 'Laskutettu', 'Vaje', 'Tila', 'Kassaan (ennuste)', 'Kassa kumulatiivinen'];
  sh.getRange(KL.kk, 1, 1, leveys).setValues([kkOtsikot])
    .setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff').setWrap(true);
  const nytIdx = t.kuukaudet.findIndex((m) => m.kk === r.kk);
  const alkuIdx = Math.max(0, Math.min(nytIdx - 6, t.kuukaudet.length - KL.kkRiveja));
  const kkRivit = t.kuukaudet.slice(alkuIdx, alkuIdx + KL.kkRiveja);
  if (kkRivit.length) {
    const arvot = kkRivit.map((m) => [kkNimi(m.kk), m.tavoite, m.toistuvat, m.voitetut, m.varmistettu, m.putki,
      m.ennuste, m.laskutettu, m.vaje, m.tila, m.kassa, m.kassaKumul]);
    sh.getRange(KL.kk + 1, 1, arvot.length, leveys).setValues(arvot);
    sh.getRange(KL.kk + 1, 2, arvot.length, 8).setNumberFormat('#,##0 "€"');
    sh.getRange(KL.kk + 1, 11, arvot.length, 2).setNumberFormat('#,##0 "€"');
    kkRivit.forEach((m, i) => {
      const vari = m.kk === r.kk ? '#eff6ff' : null;
      sh.getRange(KL.kk + 1 + i, 1, 1, leveys).setBackground(vari);
      const merkki = m.tila.charAt(0);
      sh.getRange(KL.kk + 1 + i, 10).setFontColor(merkki === '✓' ? '#15803d' : merkki === '–' ? '#6b7280' : '#b91c1c');
      if (m.kk === r.kk) sh.getRange(KL.kk + 1 + i, 1, 1, leveys).setFontWeight('bold');
    });
  }

  sh.getRange(KL.askeleet, 1).setValue('SEURAAVAT ASKELEET (KAUPAT)').setFontWeight('bold');
  sh.getRange(KL.askeleet + 1, 1, 1, 6).setValues([['Pvm', 'Asiakas', 'Seuraava askel', 'Vaihe', 'Arvo', 'Arvioitu tilaus']])
    .setFontWeight('bold').setBackground('#e5e7eb');
  const askeleet = t.askeleet.slice(0, KL.askelRiveja).map((k) =>
    [k.seuraavaPvm ? suomiPvm(k.seuraavaPvm) : 'puuttuu', k.asiakas, k.seuraava || '– ei seuraavaa askelta –', k.vaihe,
      (k.kerta || 0) + (k.kk || 0), k._at.tilaus ? suomiPvm(k._at.tilaus) : '']);
  if (askeleet.length) {
    sh.getRange(KL.askeleet + 2, 1, askeleet.length, 6).setValues(askeleet);
    sh.getRange(KL.askeleet + 2, 5, askeleet.length, 1).setNumberFormat('#,##0 "€"');
  } else {
    sh.getRange(KL.askeleet + 2, 1).setValue('Ei avoimia kauppoja.').setFontColor('#6b7280');
  }

  sh.getRange(KL.segmentit, 1).setValue('KULMAT (SEGMENTIT)').setFontWeight('bold');
  sh.getRange(KL.segmentit + 1, 1, 1, 7).setValues([['Segmentti', 'Jonossa', 'Kontaktoitu', 'Vastanneet', 'Vastaus-%', 'Palaverit', 'Palaveri-%']])
    .setFontWeight('bold').setBackground('#e5e7eb');
  const seg = (t.segmentit || []).slice(0, KL.segmenttiRiveja).map((x) => [x.segmentti, x.jonossa, x.kontaktoidut, x.vastanneet,
    x.vastausPct === null ? '–' : x.vastausPct, x.palaverit, x.palaveriPct === null ? '–' : x.palaveriPct]);
  if (seg.length) {
    sh.getRange(KL.segmentit + 2, 1, seg.length, 7).setValues(seg);
    sh.getRange(KL.segmentit + 2, 5, seg.length, 1).setNumberFormat('0.0%');
    sh.getRange(KL.segmentit + 2, 7, seg.length, 1).setNumberFormat('0.0%');
  } else {
    sh.getRange(KL.segmentit + 2, 1).setValue('Ei liidejä vielä.').setFontColor('#6b7280');
  }
  kirjoitaViikot(t);
}

/** Viikot-välilehti: tuliko kauppa ja mihin kuukausiin sen laskutus osuu. */
function kirjoitaViikot(t) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(V.viikot);
  if (!sh) return;
  const n = VIIKKO_OTSIKOT.length;
  sh.getRange(2, 1, 30, n).clear();
  const arvot = t.viikot.map((v) => ['vk ' + v.viikko, Number(v.alku.slice(8, 10)) + '.' + Number(v.alku.slice(5, 7)) + '.–' +
    suomiPvm(v.loppu).replace(/\.\d{4}$/, '.'), v.kontaktit, v.vastaukset, v.uudetKaupat, v.voitetut, v.voitettuEur, v.kkTulo,
    v.kuunKaupat, v.tavoite, v.tila, v.osuu]);
  sh.getRange(2, 1, arvot.length, n).setValues(arvot);
  sh.getRange(2, 7, arvot.length, 2).setNumberFormat('#,##0 "€"');
  t.viikot.forEach((v, i) => {
    const rivi = sh.getRange(2 + i, 1, 1, n);
    if (v.nykyinen) rivi.setBackground('#eff6ff').setFontWeight('bold');
    else if (v.alku > t.tanaan) rivi.setFontColor('#9ca3af');
    const merkki = v.tila.charAt(0);
    if (merkki === '✓') sh.getRange(2 + i, 11).setFontColor('#15803d');
    if (merkki === '✗') sh.getRange(2 + i, 11).setFontColor('#b91c1c');
  });
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
    ['Kassaan tässä kuussa', eur(n.kassa)],
    ['Kauppoja tällä viikolla', (t.tamaViikko ? t.tamaViikko.voitetut + ' / tavoite ' + t.tamaViikko.tavoite : '0') + ' · ' + kkNimi(n.kk) + ': ' + t.kuunKaupat],
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
  if (r.palaverit && r.palaverit.length) {
    osio('Uudet palaverit kalenterista (' + r.palaverit.length + ')');
    h.push('<p>Siirretty Kaupat-välilehdelle vaiheeseen Palaveri sovittu: ' + esc(r.palaverit.map((x) =>
      (x.liidi.yritys || nimi(x.liidi)) + ' ' + x.tapahtuma.aika).join(', ')) + '</p>');
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
      ['Kuukausi', 'Tavoite', 'Ennuste', 'Laskutettu', 'Vaje', 'Tila', 'Kassaan', 'Kassa kumul.'].map((x) =>
        '<th style="text-align:left;padding:4px 10px;border-bottom:1px solid #ddd">' + x + '</th>').join('') + '</tr>' +
      t.kuukaudet.filter((m) => m.kk >= kkLisaa(n.kk, -2) && m.kk <= kkLisaa(n.kk, 6)).map((m) =>
        '<tr' + (m.kk === n.kk ? ' style="font-weight:bold"' : '') + '>' +
        [kkNimi(m.kk), eur(m.tavoite), eur(m.ennuste), eur(m.laskutettu), eur(m.vaje), m.tila, eur(m.kassa),
          m.kassaKumul === '' ? '' : eur(m.kassaKumul)].map((x) =>
          '<td style="padding:4px 10px;border-bottom:1px solid #eee">' + esc(x) + '</td>').join('') + '</tr>').join('') +
      '</table>');
    osio('Viikkoraportti: viikot');
    h.push('<table style="border-collapse:collapse;font-size:13px"><tr>' +
      ['Viikko', 'Kontaktit', 'Vastaukset', 'Uudet kaupat', 'Voitetut', 'Voitettu €', 'Tila', 'Laskutus osuu'].map((x) =>
        '<th style="text-align:left;padding:4px 10px;border-bottom:1px solid #ddd">' + x + '</th>').join('') + '</tr>' +
      t.viikot.filter((v) => v.alku <= pv && v.loppu >= lisaaPaivia(pv, -35)).map((v) =>
        '<tr' + (v.nykyinen ? ' style="font-weight:bold"' : '') + '>' +
        ['vk ' + v.viikko, v.kontaktit, v.vastaukset, v.uudetKaupat, v.voitetut, eur(v.voitettuEur), v.tila, v.osuu].map((x) =>
          '<td style="padding:4px 10px;border-bottom:1px solid #eee">' + esc(x) + '</td>').join('') + '</tr>').join('') +
      '</table>');
    if (t.segmentit && t.segmentit.length) {
      osio('Viikkoraportti: kulmat');
      h.push('<table style="border-collapse:collapse;font-size:13px"><tr>' +
        ['Segmentti', 'Jonossa', 'Kontaktoitu', 'Vastanneet', 'Vastaus-%', 'Palaverit', 'Palaveri-%'].map((x) =>
          '<th style="text-align:left;padding:4px 10px;border-bottom:1px solid #ddd">' + x + '</th>').join('') + '</tr>' +
        t.segmentit.map((x) => '<tr>' + [x.segmentti, x.jonossa, x.kontaktoidut, x.vastanneet,
          x.vastausPct === null ? '–' : pct(x.vastausPct), x.palaverit, x.palaveriPct === null ? '–' : pct(x.palaveriPct)].map((y) =>
          '<td style="padding:4px 10px;border-bottom:1px solid #eee">' + esc(y) + '</td>').join('') + '</tr>').join('') +
        '</table><p style="color:#4b5563">Vertaa kulmia, kun kullakin on noin 100 kontaktia. Muuta kerrallaan vain yhtä asiaa: aihetta, avausta tai tarjousta.</p>');
    }
    osio('Viikkoraportti: myyntikone');
    h.push('<p>Tahti: vajeesta ' + t.kone.tahtiVajeesta + ' / pv, viikkotavoitteesta ' + t.kone.tahtiViikosta + ' / pv → kiintiö ' + t.kone.kiintio + ' / pv' +
      (t.kone.rajoitettu ? ' (katto)' : '') + '</p>');
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
 * Laskee kuukausitaulukon (laskutus ja kassa), tämän kuun tunnusluvut, viikkoseurannan ja myyntikoneen tahdin.
 * m = lueKaikki().malli, tanaan = 'YYYY-MM-DD'.
 */
function laske(m, tanaan) {
  const a = m.asetukset;
  const nyt = tanaan.slice(0, 7);
  const ensi = kkLisaa(nyt, 1);
  const tavoite = {};
  m.tavoitteet.forEach((t) => { tavoite[t.kk] = t.tavoite; });
  const kuukaudet = Array.from(new Set(m.tavoitteet.map((t) => t.kk).concat([nyt, ensi]))).sort();
  const kaupat = m.kaupat.map((k) => Object.assign({}, k, { _at: kaupanAikataulu(k, tanaan, a) }));
  const vkTavoitteet = {};
  m.tavoitteet.forEach((t) => { if (t.kauppojaVk !== null && t.kauppojaVk !== undefined) vkTavoitteet[t.kk] = t.kauppojaVk; });
  const kauppojaVk = (kk) => (kk in vkTavoitteet ? vkTavoitteet[kk] : a.kauppojaViikossa);

  const rivit = kuukaudet.map((kk) => {
    let toistuvat = 0;
    let kassa = 0;
    m.toistuvat.forEach((t) => {
      if (aktiivinen(t.alkaa, t.paattyy, kk)) toistuvat += t.summa;
      kassa += kkTulonKassa(t.alkaa, t.paattyy, t.summa, a.maksuaika, kk);
    });
    let voitetut = 0;
    let putki = 0;
    kaupat.forEach((k) => {
      if (k.vaihe === HAVITTY) return;
      const e = kaupanKuukausi(k, kk);
      const paino = k.vaihe === VOITETTU ? 1 : k.tod;
      if (k.vaihe === VOITETTU) voitetut += e.laskutus;
      else putki += e.laskutus * paino;
      kassa += e.kassa * paino;
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
    return { kk, tavoite: tav, toistuvat, voitetut, varmistettu, putki, ennuste, laskutettu, vaje, tila, kassa, kassaKumul: '' };
  });
  let kumul = 0;
  rivit.forEach((r) => { if (r.kk >= nyt) { kumul += r.kassa; r.kassaKumul = kumul; } });
  const rNyt = rivit.find((r) => r.kk === nyt);
  const rEnsi = rivit.find((r) => r.kk === ensi);

  // Konversiot
  const lid = m.liidit;
  const kontaktoidut = lid.filter((l) => l.vaihe >= 1).length;
  const vastanneet = lid.filter((l) => VASTANNEET.includes(l.tila)).length;
  const palaverit = lid.filter((l) => PALAVERIT.includes(l.tila)).length;
  const voitetutKaupat = kaupat.filter((k) => k.vaihe === VOITETTU);
  const suljetut = voitetutKaupat.length + kaupat.filter((k) => k.vaihe === HAVITTY).length;
  const kpTot = kontaktoidut ? palaverit / kontaktoidut : null;
  const pkTot = suljetut ? voitetutKaupat.length / suljetut : null;
  const kertaKaupat = voitetutKaupat.filter((k) => k.kerta > 0);
  const keskikauppaTot = kertaKaupat.length ? summa(kertaKaupat.map((k) => k.kerta)) / kertaKaupat.length : null;
  const kp = kontaktoidut >= a.kynnys && a.kynnys > 0 ? Math.max(kpTot, 0.005) : a.kp;
  const pk = suljetut >= 5 ? Math.max(pkTot, 0.05) : a.pk;

  // Kulmat: mikä segmentti tuottaa vastauksia ja palavereja
  const segRyhmat = {};
  lid.forEach((l) => {
    const nimiSeg = l.segmentti || 'Yleinen';
    const r = segRyhmat[nimiSeg] || (segRyhmat[nimiSeg] = { segmentti: nimiSeg, jonossa: 0, kontaktoidut: 0, vastanneet: 0, palaverit: 0 });
    if ((l.tila === 'Uusi' || l.tila === '') && onEmail(l.email)) r.jonossa++;
    if (l.vaihe >= 1) r.kontaktoidut++;
    if (VASTANNEET.includes(l.tila)) r.vastanneet++;
    if (PALAVERIT.includes(l.tila)) r.palaverit++;
  });
  const segmentit = Object.keys(segRyhmat).map((k) => segRyhmat[k]).map((r) => Object.assign(r, {
    vastausPct: r.kontaktoidut ? r.vastanneet / r.kontaktoidut : null,
    palaveriPct: r.kontaktoidut ? r.palaverit / r.kontaktoidut : null,
  })).sort((x, y) => y.kontaktoidut - x.kontaktoidut || y.jonossa - x.jonossa);

  // Viikkoseuranta
  const viikot = viikkoseuranta(m, kaupat, tanaan, kauppojaVk);
  const tamaViikko = viikot.find((v) => v.nykyinen);
  const kuunKaupat = voitetutKaupat.filter((k) => k._at.tilaus && k._at.tilaus.slice(0, 7) === nyt).length;

  // Myyntikone: vaje → kaupat → palaverit → kontaktit → kontaktia / arkipäivä
  const vajeKk = (r) => Math.max(0, r.tavoite - r.varmistettu - r.putki);
  const avoinVaje = vajeKk(rNyt) + vajeKk(rEnsi);
  const kauppojaTarve = a.keskikauppa > 0 ? avoinVaje / a.keskikauppa : 0;
  const palaveritTarve = pk > 0 ? kauppojaTarve / pk : 0;
  const kontaktit = kp > 0 ? palaveritTarve / kp : 0;
  const kesken = lid.filter((l) => l.tila === 'Sekvenssissä' || l.tila === 'Luonnos').length;
  const jaljella = Math.max(0, Math.ceil(kontaktit - 1e-9) - kesken);
  const arkipaivat = arkipaiviaValilla(tanaan, kkViimeinen(ensi));
  const tahtiVajeesta = avoinVaje > 0 ? Math.ceil((arkipaivat ? jaljella / arkipaivat : jaljella) - 1e-9) : 0;
  const vkNyt = kauppojaVk(nyt);
  const tahtiViikosta = vkNyt > 0 && pk > 0 && kp > 0 ? Math.ceil(vkNyt / pk / kp / 5 - 1e-9) : 0;
  const laskettu = Math.max(tahtiVajeesta, tahtiViikosta);
  const kiintio = Math.min(a.max, Math.max(a.min, laskettu));
  const rajoitettu = laskettu > a.max;
  const jonossa = lid.filter((l) => (l.tila === 'Uusi' || l.tila === '') && onEmail(l.email)).length;
  const odottaaHavaintoa = lid.filter((l) => (l.tila === 'Uusi' || l.tila === '') && onEmail(l.email) &&
    !l.havainto && !(a.autoHavainto && l.ehdotus) && tarvitseeHavainnon(haePohja(m.pohjat || [], 1, l.segmentti))).length;

  // Laskuttamatta: rivit, joiden laskutuspäivä on ohitettu (päivätön rivi: kuukausi alkanut)
  const rastit = m.laskut.filter((l) => l.tila === 'Laskuttamatta' &&
    (l.ajankohta ? l.ajankohta <= tanaan : !!l.kk && l.kk <= nyt));
  const laskuttamatta = { summa: summa(rastit.map((l) => l.summa)), maara: rastit.length };

  // Keskittymä: suurimman laskutettavan osuus tämän kuun varmistetusta
  const ryhmat = {};
  m.toistuvat.filter((t) => aktiivinen(t.alkaa, t.paattyy, nyt) && t.summa > 0).forEach((t) => {
    const k = t.laskutettava || t.nimi;
    ryhmat[k] = (ryhmat[k] || 0) + t.summa;
  });
  voitetutKaupat.forEach((k) => {
    const e = kaupanKuukausi(k, nyt).laskutus;
    if (e) ryhmat[k.asiakas] = (ryhmat[k.asiakas] || 0) + e;
  });
  const suurin = Object.keys(ryhmat).sort((x, y) => ryhmat[y] - ryhmat[x])[0] || '';
  const keskittyma = { nimi: suurin, osuus: rNyt.varmistettu > 0 && suurin ? ryhmat[suurin] / rNyt.varmistettu : 0 };

  // Kaupat, jotka tarvitsevat huomiota
  const avoimet = kaupat.filter((k) => k.vaihe && k.vaihe !== VOITETTU && k.vaihe !== HAVITTY);
  const raja = lisaaPaivia(tanaan, 7);
  const askeleet = avoimet.filter((k) => !k.seuraavaPvm || !k.seuraava || k.seuraavaPvm <= raja)
    .sort((x, y) => ((x.seuraavaPvm || '0000') < (y.seuraavaPvm || '0000') ? -1 : 1));
  const myohassa = avoimet.filter((k) => !k.seuraava || !k.seuraavaPvm || k.seuraavaPvm < tanaan).length;
  const arvioOhi = avoimet.filter((k) => k.tilauspvm && k.tilauspvm < tanaan).length;
  const ilmanPaivaa = voitetutKaupat.filter((k) => !k._at.tilaus && !k._at.kasin && (k.kerta || k.kk)).length;
  const kasinVirheet = kaupat.filter((k) => k.kasinVirhe).map((k) => k.asiakas + ': ' + k.kasinVirhe);
  const tuntematon = kaupat.filter((k) => !k.tuoteLoytyi).map((k) => k.tuote);

  const huomiot = [];
  if (!rNyt.tavoite) huomiot.push('Kuukaudelle ' + kkNimi(nyt) + ' ei ole tavoitetta – lisää rivi Tavoitteet-välilehdelle.');
  else if (rNyt.varmistettu >= rNyt.tavoite) huomiot.push('✓ ' + cap(kkNimi(nyt)) + ' on varmistettu: ' + eur(rNyt.varmistettu) + ' / ' + eur(rNyt.tavoite) + '.');
  else if (rNyt.ennuste >= rNyt.tavoite) huomiot.push('✓ ' + cap(kkNimi(nyt)) + ' riittää ennusteen mukaan, mutta ' + eur(rNyt.tavoite - rNyt.varmistettu) + ' on vielä putkessa. Vie kaupat maaliin.');
  else huomiot.push('Vaje ' + eur(rNyt.vaje) + ' (' + kkNimi(nyt) + '). Tämän kuun vaje katetaan lämpimällä verkostolla ja ensimmäisen erän laskuilla – kylmä kontakti ehtii yleensä vasta ensi kuulle.');
  const edellinen = viikot.find((v) => v.loppu < tanaan && lisaaPaivia(v.loppu, 7) >= tanaan);
  if (edellinen && edellinen.tila === '✗') {
    huomiot.push('Viikko ' + edellinen.viikko + ': ' + edellinen.voitetut + ' kauppaa (tavoite ' + edellinen.tavoite + '). ' +
      cap(kkNimi(nyt)) + ' tähän mennessä ' + kuunKaupat + ' kauppaa.');
  }
  if (laskuttamatta.summa > 0) huomiot.push('Laskutuspäivä ohi, laskuttamatta ' + eur(laskuttamatta.summa) + ' (' + laskuttamatta.maara + ' riviä) – laskuta Laskut-välilehdeltä ja vaihda tila Lähetetty.');
  if (rajoitettu) huomiot.push('Tarvittava tahti ' + laskettu + ' kontaktia/pv ylittää katon ' + a.max + '. Pelkkä volyymi ei riitä: terävöitä havaintoja, nosta keskikauppaa (paketti + kk-palvelu) tai lisää lämpimiä kontakteja.');
  if (odottaaHavaintoa > 0) huomiot.push(odottaaHavaintoa + ' liidiä odottaa havaintoa – kopioi ehdotus tai kirjoita oma Havainto-sarakkeeseen.');
  const valmiitJonossa = jonossa - odottaaHavaintoa;
  if (valmiitJonossa < kiintio * 5) huomiot.push('Valmiita liidejä jonossa ' + valmiitJonossa + ' (riittää ' + Math.floor(valmiitJonossa / Math.max(1, kiintio)) + ' arkipäivää). Lisää vähintään ' + Math.max(0, kiintio * 10 - valmiitJonossa) + ' liidiä.');
  const vastasi = lid.filter((l) => l.tila === 'Vastasi').length;
  if (vastasi) huomiot.push(vastasi + ' vastausta odottaa – vastaa ja päivitä tila (Palaveri / Ei kiinnosta).');
  if (myohassa) huomiot.push(myohassa + ' avointa kauppaa ilman seuraavaa askelta tai askel myöhässä.');
  if (arvioOhi) huomiot.push(arvioOhi + ' avoimen kaupan arvioitu tilauspäivä on mennyt – ennuste siirtää ne tälle päivälle. Päivitä arvio tai vaihe.');
  if (ilmanPaivaa) huomiot.push(ilmanPaivaa + ' voitettua kauppaa ilman tilauspäivää – ne eivät näy laskutuksessa.');
  if (kasinVirheet.length) huomiot.push('Erät käsin -sarakkeessa virhe – ' + kasinVirheet.join(' · ') + '. Muoto: 2000 € 30.11.2026; 1000 € 15.12.2026');
  if (tuntematon.length) huomiot.push('Tuntematon tuote Kaupat-välilehdellä: ' + Array.from(new Set(tuntematon)).join(', ') + ' – lisää se Tuotteet-välilehdelle.');
  if (keskittyma.osuus > 0.5) huomiot.push('Suurin asiakas (' + keskittyma.nimi + ') on ' + pct(keskittyma.osuus) + ' laskutuksesta. Pitkän aikavälin tavoite alle 50 %: booking engine, Nordic Host ja oma putki.');

  return {
    tanaan, asetukset: a, kuukaudet: rivit, nyt: rNyt, ensi: rEnsi, viikot, tamaViikko, kuunKaupat, segmentit,
    konv: { kontaktoidut, vastanneet, palaverit, kpTot, pkTot, keskikauppaTot, kp, pk },
    kone: { avoinVaje, kaupat: kauppojaTarve, palaverit: palaveritTarve, kontaktit, kesken, arkipaivat, tahtiVajeesta,
      tahtiViikosta, laskettu, kiintio, rajoitettu, jonossa, odottaaHavaintoa },
    laskuttamatta, keskittyma, askeleet, huomiot,
  };
}

/**
 * Kaupan tilauspäivä. Voitettu: Tilauspvm (tai luontipäivä). Avoin: arvioitu Tilauspvm tai luontipäivä + myyntisykli,
 * kuitenkin aikaisintaan tänään – avointa kauppaa ei voi tilata menneisyydessä.
 */
function tilausPaiva(k, tanaan, a) {
  if (k.vaihe === VOITETTU || k.vaihe === HAVITTY) return k.tilauspvm || k.luotu || null;
  const arvio = k.tilauspvm || lisaaPaivia(k.luotu || tanaan, a.myyntisykli || 0);
  return arvio < tanaan ? tanaan : arvio;
}

/** Kaupan laskutusaikataulu: erät laskutus- ja maksupäivineen sekä kk-tulon alkukuukausi. */
function kaupanAikataulu(k, tanaan, a) {
  const tilaus = tilausPaiva(k, tanaan, a);
  const maksu = k.maksuaika === null || k.maksuaika === undefined ? a.maksuaika : k.maksuaika;
  if (k.kasin && k.kasin.length) {
    const yhteensa = summa(k.kasin.map((e) => e.summa)) || 1;
    const erat = k.kasin.map((e, i) => ({ nro: i + 1, n: k.kasin.length, osuus: e.summa / yhteensa, summa: e.summa,
      pvm: e.pvm, kassa: lisaaPaivia(e.pvm, maksu || 0) })).filter((e) => e.summa);
    return { tilaus, erat, kkAlkaa: k.kkAlkaa || k.kasin[k.kasin.length - 1].pvm, maksuaika: maksu, kasin: true };
  }
  if (!tilaus) return { tilaus: null, erat: [], kkAlkaa: k.kkAlkaa || null, maksuaika: maksu };
  const pohja = k.erat && k.erat.length ? k.erat : [{ osuus: 1, pv: 0 }];
  const yht = summa(pohja.map((e) => e.osuus)) || 1;
  const erat = pohja.map((e, i) => {
    const pvm = lisaaPaivia(tilaus, e.pv || 0);
    return { nro: i + 1, n: pohja.length, osuus: e.osuus / yht, summa: (k.kerta || 0) * e.osuus / yht, pvm, kassa: lisaaPaivia(pvm, maksu || 0) };
  }).filter((e) => e.summa);
  const viimeinen = lisaaPaivia(tilaus, Math.max.apply(null, pohja.map((e) => e.pv || 0)));
  return { tilaus, erat, kkAlkaa: k.kkAlkaa || viimeinen, maksuaika: maksu };
}

/** Kaupan laskutus ja kassaan tuleva raha kuukaudelle kk (painottamaton). k._at = kaupanAikataulu(). */
function kaupanKuukausi(k, kk) {
  const at = k._at;
  let laskutus = 0;
  let kassa = 0;
  at.erat.forEach((e) => {
    if (e.pvm.slice(0, 7) === kk) laskutus += e.summa;
    if (e.kassa.slice(0, 7) === kk) kassa += e.summa;
  });
  if (k.kk && at.kkAlkaa) {
    if (aktiivinen(at.kkAlkaa, k.kkPaattyy, kk)) laskutus += k.kk;
    kassa += kkTulonKassa(at.kkAlkaa, k.kkPaattyy, k.kk, at.maksuaika, kk);
  }
  return { laskutus, kassa };
}

/** Kuukausittain laskutettavan summan kassaan tulo kuukaudelle kk (lasku kuun 1. päivä + maksuaika). */
function kkTulonKassa(alkaa, paattyy, summaKk, maksuaika, kk) {
  if (!summaKk) return 0;
  let e = 0;
  for (let i = -3; i <= 0; i++) {
    const m = kkLisaa(kk, i);
    if (aktiivinen(alkaa, paattyy, m) && lisaaPaivia(m + '-01', maksuaika || 0).slice(0, 7) === kk) e += summaKk;
  }
  return e;
}

function aktiivinen(alkaa, paattyy, kk) {
  return (!alkaa || alkaa.slice(0, 7) <= kk) && (!paattyy || paattyy.slice(0, 7) >= kk);
}

/** Viikkoseuranta: 8 mennyttä viikkoa, kuluva ja 4 tulevaa. Voitettu kauppa kuuluu Tilauspvm:n viikolle. */
function viikkoseuranta(m, kaupat, tanaan, kauppojaVk) {
  const tamaMa = lisaaPaivia(tanaan, -((viikonpaiva(tanaan) + 6) % 7));
  // Seuranta alkaa ensimmäisestä tavoitekuukaudesta: sitä aiemmille viikoille ei merkitä ✓/✗
  const alkaa = m.tavoitteet.length ? m.tavoitteet.map((t) => t.kk).sort()[0] + '-01' : '';
  const rivit = [];
  for (let i = -8; i <= 4; i++) {
    const alku = lisaaPaivia(tamaMa, 7 * i);
    const loppu = lisaaPaivia(alku, 6);
    const sisalla = (k) => !!k && k >= alku && k <= loppu;
    const voitetut = kaupat.filter((k) => k.vaihe === VOITETTU && sisalla(k._at.tilaus));
    const osuu = {};
    voitetut.forEach((k) => {
      k._at.erat.forEach((e) => { const kk = e.pvm.slice(0, 7); osuu[kk] = (osuu[kk] || 0) + e.summa; });
      if (k.kk && k._at.kkAlkaa) { const kk = k._at.kkAlkaa.slice(0, 7); osuu[kk] = (osuu[kk] || 0) + k.kk; }
    });
    const kuu = lisaaPaivia(alku, 3).slice(0, 7); // ISO-viikko kuuluu torstainsa kuukauteen
    const kuunKaupat = kaupat.filter((k) => k.vaihe === VOITETTU && k._at.tilaus &&
      k._at.tilaus.slice(0, 7) === kuu && k._at.tilaus <= loppu).length;
    const nykyinen = alku <= tanaan && tanaan <= loppu;
    const tavoite = alkaa && kuu < alkaa.slice(0, 7) ? 0 : kauppojaVk(kuu);
    const taysi = tavoite > 0 && voitetut.length >= tavoite;
    let tila = '';
    if (nykyinen) tila = taysi ? '✓ käynnissä' : 'käynnissä';
    else if (loppu < tanaan && tavoite > 0) tila = taysi ? '✓' : '✗';
    rivit.push({
      alku, loppu, viikko: isoViikko(alku), nykyinen, tila, tavoite,
      kontaktit: m.liidit.filter((l) => sisalla(l.aloitettu)).length,
      vastaukset: m.liidit.filter((l) => sisalla(l.vastausPvm)).length,
      uudetKaupat: kaupat.filter((k) => sisalla(k.luotu)).length,
      voitetut: voitetut.length,
      voitettuEur: summa(voitetut.map((k) => k.kerta || 0)),
      kkTulo: summa(voitetut.map((k) => k.kk || 0)),
      kuunKaupat,
      osuu: Object.keys(osuu).sort().map((kk) => lyhytKk(kk) + ' ' + eur(osuu[kk])).join(' · '),
    });
  }
  return rivit;
}

/** Laskutuslistan rivit kuukaudelle kk: toistuvat, voitettujen kauppojen erät ja kuukausimaksut. */
function laskutusrivit(m, kk, tanaan) {
  const a = m.asetukset;
  const rivit = [];
  m.toistuvat.forEach((t) => {
    if (t.summa > 0 && aktiivinen(t.alkaa, t.paattyy, kk)) {
      rivit.push({ kk, ajankohta: kk + '-01', laskutettava: t.laskutettava || t.nimi, kuvaus: t.nimi + ' ' + kkNimi(kk),
        summa: t.summa, tunniste: 'T|' + t.nimi + '|' + kk });
    }
  });
  m.kaupat.filter((k) => k.vaihe === VOITETTU).forEach((k) => {
    const at = kaupanAikataulu(k, tanaan, a);
    const nimi = k.kuvaus || k.tuote || 'Kauppa';
    const perusta = 'K|' + k.asiakas + '|' + nimi + '|';
    at.erat.filter((e) => e.pvm.slice(0, 7) === kk).forEach((e) => {
      const era = e.n > 1 ? ' – erä ' + e.nro + '/' + e.n + ' (' + Math.round(e.osuus * 100) + ' %)' : '';
      rivit.push({ kk, ajankohta: e.pvm, laskutettava: k.asiakas, kuvaus: nimi + era, summa: e.summa,
        tunniste: perusta + 'E' + e.nro + '|' + kk });
    });
    if (k.kk && at.kkAlkaa && aktiivinen(at.kkAlkaa, k.kkPaattyy, kk)) {
      rivit.push({ kk, ajankohta: kk + '-01', laskutettava: k.asiakas, kuvaus: nimi + ' – kuukausimaksu ' + kkNimi(kk), summa: k.kk,
        tunniste: perusta + 'KK|' + kk });
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

  const segmenttiMax = a.segmenttiMax > 0 ? a.segmenttiMax : Infinity;
  const segmentilla = {};
  for (const l of lid) {
    if (uudet.length >= maara) break;
    if (l.tila !== 'Uusi' && l.tila !== '') continue;
    if (!onEmail(l.email)) continue;
    const seg = (l.segmentti || 'Yleinen').toLowerCase();
    if ((segmentilla[seg] || 0) >= segmenttiMax) continue;
    if (kaytetyt.has(l.email)) { tuplat.push(l); continue; }
    const d = domain(l.email);
    const yleinen = !d || YLEISET_DOMAINIT.includes(d);
    if (!yleinen && varatut.has(d)) continue;
    const pohja = haePohja(m.pohjat, 1, l.segmentti);
    if (!pohja) continue;
    const havainto = l.havainto || (a.autoHavainto ? l.ehdotus : '');
    if (!havainto && tarvitseeHavainnon(pohja)) continue;
    const v = renderoiViesti(pohja, Object.assign({}, l, { havainto }), a, esikatselu);
    if (v.virhe) { ohitetut.push({ liidi: l, syy: v.virhe }); continue; }
    uudet.push({ tyyppi: 'uusi', liidi: l, vaihe: 1, aihe: v.aihe, viesti: v.viesti });
    segmentilla[seg] = (segmentilla[seg] || 0) + 1;
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

/**
 * Pohja vaiheelle. Jos segmentillä on omia numeroituja pohjia, sen liidit käyttävät vain niitä – sarja
 * loppuu, kun segmentin vaiheet loppuvat. Muuten käytetään oletuspohjia (segmentti tyhjä).
 */
function haePohja(pohjat, vaihe, segmentti) {
  const seg = String(segmentti || '').trim().toLowerCase();
  const sama = (p) => String(p.vaihe).toLowerCase() === String(vaihe).toLowerCase();
  const omat = seg ? pohjat.filter((p) => p.viesti && p.segmentti.toLowerCase() === seg) : [];
  const oma = omat.find(sama);
  if (oma) return oma;
  if (typeof vaihe === 'number' && omat.some((p) => typeof p.vaihe === 'number')) return null;
  return pohjat.find((p) => sama(p) && !p.segmentti && p.viesti) || null;
}

function tarvitseeHavainnon(pohja) {
  return !!pohja && /\{\{\s*havainto\s*\}\}/i.test(pohja.aihe + pohja.viesti);
}

/** Seuraavan viestin päivä, kun vaihe `vaihe` lähti päivänä `pvm`. */
function seuraavaLahetys(pohjat, segmentti, vaihe, pvm, a) {
  const seuraava = haePohja(pohjat, vaihe + 1, segmentti);
  return lisaaArkipaivia(pvm, seuraava ? (seuraava.odota || 3) : (a.loppuOdotus || 5));
}

// Näiden pitää olla täytetty, muuten viesti jätetään lähettämättä. Muut saavat olla tyhjiä.
const PAKOLLISET_MUUTTUJAT = ['yritys', 'sivusto', 'havainto', 'nimi', 'allekirjoitus'];
// Jos nämä ovat tyhjiä, koko rivi jätetään viestistä pois
const RIVIN_POISTO = ['varauslinkki', 'tietosuoja'];

/** Täyttää pohjan muuttujat. esikatselu = puuttuvat asetukset näytetään paikkamerkkeinä. */
function renderoiViesti(pohja, l, a, esikatselu) {
  const arvot = {
    etunimi: teksti(l.etunimi), sukunimi: teksti(l.sukunimi), yritys: teksti(l.yritys), rooli: teksti(l.rooli),
    sivusto: lyhytDomain(l.sivusto), paikkakunta: teksti(l.paikkakunta), havainto: siistiHavainto(l.havainto),
    nimi: teksti(a.nimi), allekirjoitus: teksti(a.allekirjoitus) || teksti(a.nimi), referenssi: teksti(a.referenssi),
    tietosuoja: teksti(a.tietosuoja), varauslinkki: teksti(a.varauslinkki),
  };
  let virhe = '';
  const korvaa = (s, aiheessa) => String(s || '').replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (koko, nimi) => {
    const k = nimi.toLowerCase();
    if (!(k in arvot)) { virhe = virhe || 'Tuntematon muuttuja ' + koko; return koko; }
    if (arvot[k]) return arvot[k];
    if (esikatselu && PAKOLLISET_MUUTTUJAT.includes(k)) return '[' + k + ' puuttuu]';
    if (aiheessa || PAKOLLISET_MUUTTUJAT.includes(k)) virhe = virhe || 'Tyhjä {{' + k + '}}';
    return '';
  });
  const siivoa = (s) => s.replace(/[ \t]+([,.!?])/g, '$1').replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n').trim();
  // Rivi, jossa on tyhjä linkkimuuttuja, jätetään kokonaan pois ("Voit varata ajan: " ilman linkkiä)
  const runko = String(pohja.viesti || '').split('\n').filter((rivi) => !RIVIN_POISTO.some((k) =>
    new RegExp('\\{\\{\\s*' + k + '\\s*\\}\\}', 'i').test(rivi) && !arvot[k])).join('\n');
  const aihe = siivoa(korvaa(pohja.aihe, true));
  const viesti = siivoa(korvaa(runko, false));
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
const RAKENTAJAT = [
  ['Elementor', /elementor/i], ['Divi', /et_pb_|\/themes\/divi/i], ['WPBakery', /vc_row|wpb_wrapper|js_composer/i],
  ['Avada', /fusion-builder|\/themes\/avada/i], ['Beaver Builder', /fl-builder/i],
];
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
  const ps = typeof meta.pagespeed === 'number' ? meta.pagespeed : null;
  if (ps !== null) s.push('PageSpeed mobiili ' + ps + '/100' + (meta.lcp ? ', LCP ' + meta.lcp.toFixed(1).replace('.', ',') + ' s' : ''));
  const alusta = ALUSTAT.find(([, re2]) => re2.test(h));
  if (alusta) s.push(alusta[0]);
  const rakentaja = RAKENTAJAT.find(([, re2]) => re2.test(h));
  if (rakentaja) s.push(rakentaja[0]);
  const seuranta = {
    meta: /connect\.facebook\.net\/[^"']*fbevents\.js|fbq\(\s*['"]init/i.test(h),
    ads: /googleadservices\.com|['"]AW-\d{6,}/i.test(h),
    ga4: /gtag\/js\?id=G-|['"]G-[A-Z0-9]{6,}['"]/i.test(h),
    gtm: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/i.test(h),
  };
  const seurannat = [['Meta-pikseli', seuranta.meta], ['Google Ads', seuranta.ads], ['GA4', seuranta.ga4], ['GTM', seuranta.gtm]]
    .filter(([, on]) => on).map(([n]) => n);
  s.push(seurannat.length ? seurannat.join(', ') : 'ei seurantakoodeja');
  const mainonta = /mainon|ads|markkinoin|groundwork/i.test(segmentti || '');

  const taivutus = { 'Booking.com': 'Booking.comiin', Airbnb: 'Airbnb:hen', Expedia: 'Expediaan' };
  let havainto = '';
  // GTM voi ladata pikselit, joten puuttuvasta seurannasta päätellään vain, kun GTM:ää ei ole
  if (mainonta && !seuranta.gtm && !seuranta.meta && !seuranta.ga4 && !seuranta.ads) {
    havainto = 'sivuilta ei löydy Google Analyticsia eikä Metan pikseliä, joten mainonnan tulosta on vaikea mitata';
  } else if (mainonta && !seuranta.gtm && seuranta.meta && !seuranta.ads) {
    havainto = 'sivuillanne on Metan pikseli, mutta Google Ads -seurantaa ei näytä olevan';
  } else if (!https) havainto = 'sivuilla ei ole suojattua yhteyttä (https), joten selain näyttää kävijälle "Ei turvallinen" -merkinnän';
  else if (!viewport) havainto = 'sivusto ei skaalaudu puhelimen näytölle';
  else if (ps !== null && ps < 50) {
    havainto = 'sivujen mobiilinopeus on Googlen PageSpeed-mittauksessa vain ' + ps + '/100' +
      (meta.lcp > 4 ? ' ja etusivu latautuu puhelimella noin ' + Math.round(meta.lcp) + ' sekunnissa' : '');
  }
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
    if (i < 0) throw new Error('Välilehdeltä ' + nimi + ' puuttuu sarake "' + SAR[nimi][k] + '". Palauta otsikko tai aja valikosta Päivitä taulukon rakenne.');
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
    tav: lueTaulu(V.tavoitteet), tois: lueTaulu(V.toistuvat), kau: lueTaulu(V.kaupat), las: lueTaulu(V.laskut),
    lii: lueTaulu(V.liidit), poh: lueTaulu(V.pohjat), tuo: lueTaulu(V.tuotteet),
  };
  const osuus = (v) => { const x = luku(v); return x > 1 ? x / 100 : x; };
  const tuotteet = taulut.tuo.rivit.filter((r) => teksti(r.tuote)).map((r) => ({
    tuote: teksti(r.tuote), hinta: luku(r.hinta), kk: luku(r.kk), maksuaika: r.maksuaika === '' ? null : luku(r.maksuaika),
    erat: [[r.e1, r.p1], [r.e2, r.p2], [r.e3, r.p3]].filter(([e]) => osuus(e) > 0).map(([e, p]) => ({ osuus: osuus(e), pv: luku(p) })),
  }));
  const malli = {
    asetukset,
    tuotteet,
    tavoitteet: taulut.tav.rivit.map((r) => ({
      kk: kkAvain(r.kk), tavoite: luku(r.tavoite), kauppojaVk: r.kauppojaVk === '' ? null : luku(r.kauppojaVk),
    })).filter((r) => r.kk),
    toistuvat: taulut.tois.rivit.map((r) => ({
      nimi: teksti(r.lahde), laskutettava: teksti(r.laskutettava), summa: luku(r.summa),
      alkaa: pvAvain(r.alkaa), paattyy: pvAvain(r.paattyy),
    })),
    kaupat: taulut.kau.rivit.map((r) => kaupanMalli({
      _rivi: r._rivi, asiakas: teksti(r.asiakas), kuvaus: teksti(r.kuvaus), tuote: teksti(r.tuote), vaihe: teksti(r.vaihe),
      kerta: r.kerta === '' ? null : luku(r.kerta), tilauspvm: pvAvain(r.tilauspvm), eratKasin: teksti(r.eratKasin),
      kk: r.kk === '' ? null : luku(r.kk),
      kkAlkaa: pvAvain(r.kkAlkaa), kkPaattyy: pvAvain(r.kkPaattyy), seuraava: teksti(r.seuraava),
      seuraavaPvm: pvAvain(r.seuraavaPvm), luotu: pvAvain(r.luotu),
    }, tuotteet, vaiheet)),
    laskut: taulut.las.rivit.map((r) => ({
      kk: kkAvain(r.kk), ajankohta: pvAvain(r.ajankohta), summa: luku(r.summa), tila: teksti(r.tila), laskutettava: teksti(r.laskutettava),
      tunniste: teksti(r.tunniste),
    })),
    liidit: taulut.lii.rivit.map((r) => ({
      _rivi: r._rivi, yritys: teksti(r.yritys), etunimi: teksti(r.etunimi), sukunimi: teksti(r.sukunimi),
      rooli: teksti(r.rooli), email: teksti(r.email).toLowerCase(), puhelin: teksti(r.puhelin),
      linkedin: teksti(r.linkedin), sivusto: teksti(r.sivusto), segmentti: teksti(r.segmentti),
      paikkakunta: teksti(r.paikkakunta), havainto: teksti(r.havainto), ehdotus: teksti(r.ehdotus),
      tila: teksti(r.tila), vaihe: Math.max(0, Math.round(luku(r.vaihe))), aloitettu: pvAvain(r.aloitettu),
      seuraava: pvAvain(r.seuraava), vastausPvm: pvAvain(r.vastausPvm), ketju: teksti(r.ketju), luonnos: teksti(r.luonnos),
      liTila: teksti(r.liTila), soitto: teksti(r.soitto), muistiinpano: teksti(r.muistiinpano),
    })),
    pohjat: taulut.poh.rivit.map((r) => ({
      vaihe: pohjanVaihe(r.vaihe), segmentti: teksti(r.segmentti), odota: luku(r.odota),
      aihe: teksti(r.aihe), viesti: teksti(r.viesti),
    })),
  };
  return { malli, taulut };
}

/**
 * Täydentää kaupan tuotteen tiedoilla: tyhjä hinta / kk-tulo = tuotteen, erät ja maksuaika tuotteelta.
 * kerta ja kk ovat null, jos solu oli tyhjä.
 */
function kaupanMalli(k, tuotteet, vaiheet) {
  const t = tuotteet.find((x) => x.tuote.toLowerCase() === String(k.tuote || '').toLowerCase()) || null;
  let kerta = k.kerta === null || k.kerta === undefined ? (t ? t.hinta : 0) : k.kerta;
  const kasin = puraErat(k.eratKasin, kerta);
  if (kasin && kasin.erat) kerta = summa(kasin.erat.map((e) => e.summa));
  return Object.assign({}, k, {
    kerta,
    kasin: kasin && kasin.erat ? kasin.erat : null,
    kasinVirhe: kasin && kasin.virhe ? kasin.virhe : '',
    kk: k.kk === null || k.kk === undefined ? (t ? t.kk : 0) : k.kk,
    erat: t && t.erat.length ? t.erat : [{ osuus: 1, pv: 0 }],
    maksuaika: t ? t.maksuaika : null,
    tod: k.vaihe in vaiheet ? vaiheet[k.vaihe] : 0,
    tuoteLoytyi: !k.tuote || !!t,
  });
}

/**
 * Erät käsin: "2000 € 30.11.2026; 1000 € 15.12.2026" tai "50 % 1.12.2026; 50 % 15.1.2027".
 * Palauttaa { erat: [{ pvm, summa }] }, { virhe } tai null, jos teksti on tyhjä.
 */
function puraErat(teksti, kerta) {
  const s = String(teksti || '').trim();
  if (!s) return null;
  const erat = [];
  const osat = s.split(/[;\n]+/).map((x) => x.trim()).filter(String);
  for (const osa of osat) {
    const p = osa.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (!p) return { virhe: 'päivämäärä puuttuu kohdasta "' + osa + '"' };
    const m = osa.replace(p[0], ' ').match(/(\d[\d \u00a0]*(?:[.,]\d+)?)\s*(%)?/);
    if (!m) return { virhe: 'summa puuttuu kohdasta "' + osa + '"' };
    const arvo = luku(m[1]);
    if (m[2] && !(kerta > 0)) return { virhe: 'prosenttierät tarvitsevat kertatulon' };
    erat.push({ pvm: p[3] + '-' + pad(p[2]) + '-' + pad(p[1]), summa: m[2] ? kerta * arvo / 100 : arvo });
  }
  erat.sort((x, y) => (x.pvm < y.pvm ? -1 : 1));
  return { erat };
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

/** ISO-viikon numero (ma–su, viikko kuuluu torstainsa vuoteen). */
function isoViikko(k) {
  const t = avainUTC(k);
  const torstai = t + (3 - ((new Date(t).getUTCDay() + 6) % 7)) * 864e5;
  const vuosi = new Date(torstai).getUTCFullYear();
  const tammi4 = Date.UTC(vuosi, 0, 4);
  const ekaTorstai = tammi4 + (3 - ((new Date(tammi4).getUTCDay() + 6) % 7)) * 864e5;
  return 1 + Math.round((torstai - ekaTorstai) / (7 * 864e5));
}

function lyhytKk(kk) {
  return KUUKAUDET[Number(kk.slice(5, 7)) - 1].replace(/kuu$/, '');
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
