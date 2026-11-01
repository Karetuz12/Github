// Kaikki sivuston tekstit ja tiedot yhdessä paikassa. Muokkaa tätä tiedostoa – sivut lukevat sisällön täältä.
// TÄYTÄ-merkityt kohdat odottavat oikeita tietoja.

export const henkilo = {
  nimi: 'Etunimi Sukunimi', // TÄYTÄ
  etunimi: 'Etunimi', // TÄYTÄ
  titteli: 'Markkinoinnin ja verkkosivujen kehittäjä',
  sahkoposti: 'hei@puregroundwork.fi', // TÄYTÄ, kun domain on valittu
  puhelin: '', // valinnainen, esim. '040 123 4567'
  linkedin: '', // TÄYTÄ, esim. 'https://www.linkedin.com/in/...'
  kuva: '', // TÄYTÄ, esim. '/kuvat/muotokuva.jpg' (tiedosto kansioon public/kuvat)
};

export const yritys = {
  brandi: 'Pure Groundwork',
  yhtio: 'Yhtiö Oy', // TÄYTÄ: laskuttava yhtiö (holding)
  ytunnus: '', // TÄYTÄ
  osoite: 'https://puregroundwork.fi', // TÄYTÄ, kun domain on valittu
};

// Google-kalenterin ajanvaraussivu. Tyhjä = painikkeet vievät yhteydenottolomakkeelle.
export const varauslinkki = '';

export const hero = {
  ylaotsikko: 'Pure Groundwork',
  otsikko: 'Puhdasta pohjatyötä markkinoinnille.',
  teksti:
    'Laitan seurannat, mainostilit, sivuston nopeuden ja yhteydenottopolut kuntoon – ennen kuin mainontaan laitetaan euroakaan lisää. ' +
    'Yksi kokenut tekijä, ei toimistoa.',
};

// Numerot lasketaan näkyviin animaationa: ennen + arvo + jälkeen
export const numerot = [
  { arvo: 10, ennen: '', jalkeen: '+', selite: 'vuotta myyntiä, markkinointia ja verkkosivuja' },
  { arvo: 1000, ennen: '~', jalkeen: '', selite: 'projektia: verkkosivuja, verkkokauppoja ja kampanjoita' },
  { arvo: 5, ennen: '~', jalkeen: ' M€', selite: 'asiakkaiden mainosbudjetteja Metassa ja Googlessa' },
  { arvo: 50, ennen: '', jalkeen: '+ M€', selite: 'mitattua myyntiä asiakkaille' },
  { arvo: 250000, ennen: '', jalkeen: '+', selite: 'liidiä eri toimialoille' },
];
export const numerotHuomautus = 'Luvut kertovat urani ja vetämäni markkinointitoimiston ajalta.';

export const ongelmat = [
  {
    otsikko: 'Seuranta mittaa väärin',
    teksti: 'Pikseli puuttuu, konversiot lasketaan tuplana tai lomakkeen lähetystä ei mitata. Silloin mainonta optimoi väärään suuntaan.',
  },
  {
    otsikko: 'Sivu on hidas',
    teksti: 'Puhelimella sivu latautuu viisi sekuntia, ja puolet kävijöistä on jo lähtenyt. Jokainen mainosklikki maksaa silti.',
  },
  {
    otsikko: 'Yhteydenotto on tehty vaikeaksi',
    teksti: 'Lomakkeessa on kymmenen kenttää, puhelinnumero on piilossa, eikä vastausta tule päivään. Kiinnostunut asiakas valitsee kilpailijan.',
  },
];

export type Elementti = { otsikko: string; teksti: string; kohdat: string[] };

export const pohjatyo: Elementti[] = [
  {
    otsikko: 'Seuranta',
    teksti: 'Mainonnasta tiedetään, mikä oikeasti tuottaa.',
    kohdat: [
      'GA4 asennettu ja tapahtumat nimetty järkevästi',
      'Konversiot mitataan: lomake, puhelu, sähköposti ja osto',
      'Meta-pikseli ja palvelinpuolen Conversions API',
      'Google Ads -konversiot ja tehostetut konversiot',
      'Tag Manager siistinä ja evästesuostumus kunnossa',
    ],
  },
  {
    otsikko: 'Mainostilit',
    teksti: 'Meta ja Google rakennetaan tavoitteen ympärille.',
    kohdat: [
      'Kampanjarakenne vastaa tavoitteita',
      'Kohdennus ja poissulut kunnossa',
      'Budjetti tuottavimpiin kampanjoihin',
      'Mainos ja laskeutumissivu puhuvat samaa kieltä',
      'Turhat kulut pois: hakusanat ja sijoittelut',
    ],
  },
  {
    otsikko: 'Nopeus ja SEO',
    teksti: 'Sivu latautuu nopeasti ja löytyy hausta.',
    kohdat: [
      'Mobiilinopeus ja Core Web Vitals',
      'Kuvat ja skriptit kevyiksi',
      'Otsikot ja kuvaustekstit jokaiselle sivulle',
      'Rakenne ja sisäinen linkitys',
      'Google-yritysprofiili ajan tasalla',
    ],
  },
  {
    otsikko: 'Liidielementit',
    teksti: 'Yhteydenotto on helppoa ja vastaus nopea.',
    kohdat: [
      'Yhteydenotto yhdellä painalluksella puhelimella',
      'Lyhyet lomakkeet, vain tarpeelliset kentät',
      'Nopea vastaus: automaattinen kuittaus tai chat',
      'Laskurit ja hinta-arviot, jotka tuovat kyselyjä',
      'Luottamus: referenssit, arviot ja kasvot',
    ],
  },
  {
    otsikko: 'Sivusto',
    teksti: 'Tarvittaessa uusi, koodilla tehty sivusto.',
    kohdat: [
      'Viesti selviää viidessä sekunnissa',
      'Omat sivut tärkeimmille palveluille',
      'Toimii puhelimella yhtä hyvin kuin koneella',
      'Kevyt hallintapaneeli tekstejä ja kuvia varten',
      'Tietosuoja ja evästeet kunnossa',
    ],
  },
];

export type Palvelu = { nimi: string; hinta: string; kesto: string; teksti: string; linkki: string };

export const palvelut: Palvelu[] = [
  {
    nimi: 'Groundwork-katselmus',
    hinta: '490 €',
    kesto: 'Valmis viikossa',
    teksti:
      'Käyn läpi seurannat, mainostilit, nopeuden, hakukonenäkyvyyden ja yhteydenottopolut. Saat korjauslistan tärkeysjärjestyksessä. ' +
      'Hinta hyvitetään, jos korjaukset tehdään.',
    linkki: '/groundwork',
  },
  {
    nimi: 'Groundwork-kunnostus',
    hinta: 'alkaen 1 900 €',
    kesto: '2–4 viikkoa',
    teksti:
      'Perusta kuntoon kiinteällä hinnalla: Meta-pikseli, Tag Manager, GA4 ja konversiot, mainostilien rakenne, nopeus ja SEO-perusta ' +
      'sekä lomakkeet, chat ja laskurit.',
    linkki: '/groundwork',
  },
  {
    nimi: 'Uusi sivusto',
    hinta: '1 000–4 000 €',
    kesto: 'Pieni sivusto noin 2 viikossa',
    teksti:
      'Koodilla tehty, nopea sivusto ja kevyt hallintapaneeli, jolla päivität tekstit ja kuvat itse. Seurannat ja SEO-perusta valmiina.',
    linkki: '/sivustot',
  },
  {
    nimi: 'Kuukausikumppanuus',
    hinta: '490–1 200 €/kk',
    kesto: 'Ei pitkää sopimusta',
    teksti:
      'Mainonnan hoito tai markkinoinnin sparraus kevyellä mallilla: palaveri kerran kuussa, kuukausiraportti ja viestit tarpeen mukaan. ' +
      'Ei viikkopalavereita.',
    linkki: '/kumppanuus',
  },
];
export const hinnatHuomautus = 'Hinnat alv 0 %. Tarkka hinta sovitaan aina ennen aloitusta.';

export const vaiheet = [
  { otsikko: '15 minuutin puhelu', teksti: 'Kerrot tilanteen. Minä kerron, kannattaako katselmus vai suoraan korjaukset – tai ei kumpikaan.' },
  { otsikko: 'Katselmus', teksti: 'Käyn tilit ja sivuston läpi. Saat listan siitä, mitä korjataan, missä järjestyksessä ja mitä se maksaa.' },
  {
    otsikko: 'Toteutus',
    teksti: 'Korjaukset tai uusi sivusto kiinteällä hinnalla. Toteutuksessa apuna on kaksi kehittäjää, joiden kanssa olen tehnyt töitä vuosia.',
  },
  { otsikko: 'Halutessasi kumppanuus', teksti: 'Kevyt kuukausimalli: raportti ja palaveri kerran kuussa. Ei viikkopalavereita, ei pitkiä sopimuksia.' },
];

export const esittely = [
  'Olen tehnyt myyntiä ja markkinointia yli kymmenen vuotta: ensin myynnin ja asiakashankinnan tiimejä vetäen, sitten seitsemän vuotta omaa ' +
    'markkinointitoimistoa, jossa oli parhaimmillaan 25 ihmistä. Teimme noin tuhat projektia – verkkosivuja, verkkokauppoja ja kampanjoita – ' +
    'pienille ja isoille yrityksille Suomessa ja kansainvälisesti, paljon myös matkailualalla.',
  'Nyt teen töitä omalla nimelläni. Asioit aina minun kanssani, ja toteutuksessa apuna on kaksi kehittäjää, joiden kanssa olen tehnyt ' +
    'töitä vuosia. Isoa toimistoa ei tarvita siihen, että perusta laitetaan kuntoon.',
];

export const saavutukset = [
  'Rakensin ja vedin myynti- ja asiakashankintatiimejä ja koulutin myyjiä sekä kuluttaja- että yritysmyyntiin.',
  'Pyöritin seitsemän vuotta omaa markkinointitoimistoa. Parhaimmillaan meitä oli 25: graafikoita, kuvaajia, koodareita, sisällöntuottajia, markkinoijia ja myyjiä.',
  'Teimme asiakkaille noin tuhat projektia: verkkosivuja, verkkokauppoja, kampanjoita ja markkinoinnin konsultointia pienille ja isoille yrityksille.',
  'Tiimini hallinnoi seitsemässä vuodessa asiakkaiden mainosbudjetteja noin viiden miljoonan euron edestä, pääosin Metassa ja Googlessa.',
  'Keräsimme asiakkaille noin 250 000–300 000 liidiä eri toimialoille. Suurin osa oli suomalaista kuluttajakauppaa, mukana myös yritysmyyntiä ja kansainvälistä matkailua.',
  'Urani aikana olen ollut tuomassa asiakkaille mitatusti reilut 50 miljoonaa euroa myyntiä.',
  'Matkailualalla olen toiminut operatiivisena johtajana: resortti, ravintola, aktiviteetit ja lyhytvuokraus.',
  'Olen koodannut 15-vuotiaasta asti ja teen sitä edelleen itse.',
];

export const ura = [
  { vaihe: 'Koodaus', teksti: 'Koodaamista 15-vuotiaasta, koodarikoulu.' },
  { vaihe: 'Asiakashankinta ja myynti', teksti: 'Kuluttaja- ja yritysmyyntiä, tiimien rakentamista ja myyjien kouluttamista.' },
  { vaihe: 'Myynnin ja projektien johtaminen', teksti: 'Myynnin johtamista, projektinhallintaa ja projektijohtamista.' },
  { vaihe: 'Oma markkinointitoimisto, 7 vuotta', teksti: 'Parhaimmillaan 25 ihmistä, noin tuhat projektia, mainosbudjetteja noin 5 M€.' },
  { vaihe: 'Matkailuala', teksti: 'Operatiivinen johto: resortti, ravintola, aktiviteetit ja lyhytvuokraus.' },
  { vaihe: 'Pure Groundwork', teksti: 'Markkinoinnin perusta kuntoon omalla nimellä.' },
];

// Referenssit näytetään vasta, kun lista ei ole tyhjä. Lisää vain asiakkaat, joiden nimen saa mainita.
// Esim. { nimi: 'Yritys Oy', kuvaus: 'Verkkokauppa ja Meta-mainonta', tulos: 'Liidien hinta −40 % kolmessa kuukaudessa' }
export const referenssit: { nimi: string; kuvaus: string; tulos?: string }[] = [];

export const sivustot = {
  otsikko: 'Uusi sivusto koodilla.',
  teksti: 'Nopea, kevyt ja helppo päivittää. Ei raskasta julkaisualustaa eikä lisäosien päivitysrumbaa – ja mukana kevyt hallintapaneeli, jolla päivität tekstit ja kuvat itse.',
  edut: [
    { otsikko: 'Nopea', teksti: 'Sivu latautuu puhelimella hetkessä. Se näkyy sekä hakutuloksissa että mainonnan hinnassa.' },
    { otsikko: 'Ei päivitysrumbaa', teksti: 'Ei lisäosia, jotka pitää päivittää ja jotka rikkovat toisensa.' },
    { otsikko: 'Päivität itse', teksti: 'Kevyt hallintapaneeli tekstejä ja kuvia varten. Isommat muutokset teen minä.' },
    { otsikko: 'Valmiina myyntiin', teksti: 'Seurannat, SEO-perusta ja yhteydenottopolut ovat kunnossa julkaisupäivänä.' },
  ],
  koot: [
    { nimi: 'Pieni', hinta: '1 000 €', teksti: '1–3 sivua, valmis noin kahdessa viikossa.' },
    { nimi: 'Keskikokoinen', hinta: '1 500–2 500 €', teksti: 'Pienemmille yrityksille: palvelusivut, yhteydenottopolut ja hallintapaneeli.' },
    { nimi: 'Laaja', hinta: '3 000–4 000 €', teksti: 'Isommille yrityksille: enemmän sivuja, kieliversiot ja integraatiot.' },
  ],
  maksu: 'Laskutus 50 % aloituksesta ja 50 % julkaisusta.',
  wordpress: 'Onko sivustosi WordPressillä? Ylläpidän ja kehitän tarvittaessa myös olemassa olevia WordPress-sivustoja.',
};

export const kysymykset = [
  { k: 'Tarvitaanko uusi sivusto?', v: 'Ei aina. Usein korjaukset riittävät, ja katselmus kertoo sen.' },
  {
    k: 'Teetkö mainonnan puolestamme?',
    v: 'Halutessasi kevyellä kuukausimallilla. Perusta on kuitenkin kunnossa myös ilman sitä, ja voitte jatkaa omalla tiimillä.',
  },
  { k: 'Mitä tarvitset meiltä?', v: 'Pääsyn mainostileille, analytiikkaan ja sivustoon. Muuta ei tarvita.' },
  { k: 'Kauanko kestää?', v: 'Katselmus valmistuu viikossa, kunnostus 2–4 viikossa ja pieni sivusto noin kahdessa viikossa.' },
  { k: 'Miksi et ole toimisto?', v: 'Koska perustan kuntoon laittamiseen ei tarvita kymmentä ihmistä vaan yksi, joka on tehnyt sen tuhat kertaa.' },
];

export const lomakePalvelut = ['Groundwork-katselmus', 'Groundwork-kunnostus', 'Uusi sivusto', 'Mainonta', 'Markkinoinnin sparraus', 'En tiedä vielä'];

// ── Kokemus: toimialat ja asiakkaat ──
export const toimialat = [
  { luku: '25+', otsikko: 'autoliikettä', teksti: 'Markkinointia ja liidien hankintaa autokaupalle.', koko: 'iso' },
  { luku: '30–40', otsikko: 'suoramyyntiyritystä', teksti: 'Asiakashankintaa, jossa jokainen liidi lasketaan.', koko: 'iso' },
  { luku: '7 v', otsikko: 'oma markkinointitoimisto', teksti: 'Parhaimmillaan 25 ammattilaista: graafikoita, kuvaajia, koodareita ja myyjiä.', koko: 'normaali' },
  { luku: 'KV', otsikko: 'matkailu ja elämykset', teksti: 'Kansainvälistä markkinointia matkailuun, myös Lapin kohteille.', koko: 'normaali' },
  { luku: 'B2C + B2B', otsikko: 'verkkokaupat ja palvelut', teksti: 'Brändimarkkinointia, verkkokauppamyyntiä ja liidejä.', koko: 'normaali' },
];

// Asiakkaita vuosien varrelta. TÄYTÄ / TARKISTA: kirjoitusasu ja lupa nimen käyttöön.
export const asiakkaat = ['iSkates', 'X-Beeli'];

// Alustat, joilla olen tehnyt tulosta (simple-icons-kuvakkeet, ks. components/LogoNauha.tsx)
export const alustat = ['Meta', 'Facebook', 'Instagram', 'Google', 'Google Ads', 'Google Analytics', 'Google Tag Manager', 'Search Console',
  'WordPress', 'WooCommerce', 'Shopify', 'Elementor', 'Next.js', 'Vercel', 'TikTok', 'YouTube', 'Mailchimp', 'HubSpot', 'Brevo', 'Figma'];

// ── Megavalikko ──
export const megavalikko = [
  { nimi: 'Groundwork', kuvake: 'kerrokset', linkki: '/groundwork', teksti: 'Seurannat, mainostilit, nopeus ja yhteydenottopolut kuntoon.' },
  { nimi: 'Uusi sivusto', kuvake: 'selain', linkki: '/sivustot', teksti: 'Koodilla tehty, nopea sivusto ja kevyt hallintapaneeli.' },
  { nimi: 'Mainonnan kumppanuus', kuvake: 'kohde', linkki: '/kumppanuus#mainonta', teksti: 'Meta ja Google kevyellä kuukausimallilla.' },
  { nimi: 'Markkinoinnin sparraus', kuvake: 'puhe', linkki: '/kumppanuus#sparraus', teksti: 'Taustatuki markkinoinnista vastaavalle.' },
];

// ── Hinnasto (alv 0 %) ──
export const hinnasto = [
  {
    ryhma: 'Groundwork',
    kuvaus: 'Markkinoinnin perusta kuntoon.',
    rivit: [
      { nimi: 'Groundwork-katselmus', hinta: '490 €', teksti: 'Korjauslista tärkeysjärjestyksessä. Hyvitetään, jos korjaukset tehdään.', suosittu: true },
      { nimi: 'Groundwork-kunnostus', hinta: 'alkaen 1 900 €', teksti: 'Seurannat, mainostilit, nopeus, SEO-perusta ja liidielementit kuntoon.' },
    ],
  },
  {
    ryhma: 'Sivustot',
    kuvaus: 'Koodilla, hallintapaneelilla, kiinteällä hinnalla.',
    rivit: [
      { nimi: 'Pieni sivusto', hinta: '1 000 €', teksti: '1–3 sivua, valmis noin kahdessa viikossa.' },
      { nimi: 'Keskikokoinen sivusto', hinta: '1 500–2 500 €', teksti: 'Palvelusivut, yhteydenottopolut ja hallintapaneeli.' },
      { nimi: 'Laaja sivusto', hinta: '3 000–4 000 €', teksti: 'Enemmän sivuja, kieliversiot ja integraatiot.' },
    ],
  },
  {
    ryhma: 'Kuukausikumppanuus',
    kuvaus: 'Palaveri kerran kuussa, raportti ja viestit tarpeen mukaan.',
    rivit: [
      { nimi: 'Mainonnan kumppanuus', hinta: '490–990 €/kk', teksti: 'Meta- ja Google-mainonta, kuukausiraportti. Hinta mainosbudjetin mukaan.' },
      { nimi: 'Markkinoinnin sparraus', hinta: '600–1 200 €/kk', teksti: 'Taustatuki markkinoinnista vastaavalle tai tiimille.' },
      { nimi: 'Sparrauspalaveri', hinta: '790 €', teksti: 'Kertaluonteinen 2 tunnin läpikäynti. Hyvitetään, jos jatketaan.' },
    ],
  },
  {
    ryhma: 'Ylläpito ja lisätyöt',
    kuvaus: 'Kun sivu on valmis, se pysyy kunnossa.',
    rivit: [
      { nimi: 'Hosting ja ylläpito', hinta: 'alkaen 149 €/kk', teksti: 'Hosting Nordic Hostilla, päivitykset ja kuukausiraportti.' },
      { nimi: 'Pikatyöt', hinta: 'alkaen 200 €', teksti: 'Pienet koodaus- ja sivutyöt, myös WordPressin ylläpito ja kehitys.' },
    ],
  },
];
export const maksuehdot = 'Sivustot ja kunnostukset laskutetaan 50 % aloituksesta ja 50 % valmistuttua. Kuukausikumppanuudet ilman pitkää sitoumusta.';

// ── Kumppanuus ──
export const kumppanuus = {
  mainonta: {
    otsikko: 'Mainonnan kumppanuus',
    hinta: '490–990 €/kk',
    teksti: 'Hoidan Meta- ja Google-mainonnan kevyellä mallilla. Käyn tilit läpi kuukausittain, teen tarvittavat muutokset ja kokoan raportin, jonka pohjalta päätetään seuraava kuukausi.',
    sisaltaa: ['Meta- ja Google-tilien hoito', 'Kuukausiraportti: mitä tehtiin, mitä tuli, mitä seuraavaksi', 'Palaveri kerran kuussa tai joka toinen kuukausi', 'Viestit tarpeen mukaan, noin 15 minuuttia viikossa'],
  },
  sparraus: {
    otsikko: 'Markkinoinnin sparraus',
    hinta: '600–1 200 €/kk',
    teksti: 'Taustatukea markkinoinnista vastaavalle. Käymme kerran kuussa läpi luvut, mainostilit ja tulevat kampanjat, ja tuon ulkopuolisen näkemyksen siitä, mistä saa enemmän irti.',
    sisaltaa: ['Palaveri kerran kuussa', 'Kuukausikatsaus ja kommentit mainostileihin ja kampanjoihin', 'Näkemys liidien hankintaan ja myynnin ja markkinoinnin yhteistyöhön', 'Viestit tarpeen mukaan'],
  },
  ei: ['Ei viikkopalavereita', 'Ei pitkiä sopimuksia', 'Ei ad hoc -työtä kuukausimaksulla – lisätyöt sovitaan ja hinnoitellaan erikseen'],
};
