// Kaikki sivuston tekstit ja tiedot yhdessä paikassa. Sivut lukevat sisällön täältä.
// TÄYTÄ-merkityt kohdat odottavat oikeita tietoja.

export const henkilo = {
  nimi: 'Etunimi Sukunimi', // TÄYTÄ
  etunimi: 'Etunimi', // TÄYTÄ
  titteli: 'Markkinoinnin ja verkkosivujen kehittäjä',
  sahkoposti: 'hei@puregroundwork.fi', // TÄYTÄ, kun domain on valittu
  puhelin: '', // valinnainen, esim. '040 123 4567'
  linkedin: '', // TÄYTÄ
  kuva: '', // TÄYTÄ, esim. '/kuvat/muotokuva.jpg'
  paikka: 'Lappi ja koko Suomi etänä', // TARKISTA
};

export const yritys = {
  brandi: 'Pure Groundwork',
  yhtio: 'Yhtiö Oy', // TÄYTÄ: laskuttava yhtiö
  ytunnus: '', // TÄYTÄ
  osoite: 'https://puregroundwork.fi', // TÄYTÄ, kun domain on valittu
  kuvaus: 'Markkinoinnin perusta kuntoon: seurannat, mainostilit, sivuston nopeus ja yhteydenottopolut – kiinteällä hinnalla, yhden kokeneen tekijän kanssa.',
};

// Google-kalenterin ajanvaraussivu. Tyhjä = painikkeet vievät yhteydenottosivulle.
export const varauslinkki = '';
export const varausOsoite = varauslinkki || '/yhteys';

// Päävalikko ja alavalikko
export const valikko = [
  { nimi: 'Kokemus', linkki: '/kokemus' },
  { nimi: 'Hinnasto', linkki: '/hinnat' },
  { nimi: 'Minusta', linkki: '/minusta' },
  { nimi: 'Yhteys', linkki: '/yhteys' },
];

// ── Etusivu ──
export const hero = {
  ylaotsikko: 'Markkinointi · Verkkosivut · Meta & Google',
  otsikko: 'Puhdasta pohjatyötä markkinoinnille.',
  korostus: 'pohjatyötä',
  kiertoAlku: 'Laitan kuntoon',
  kiertavat: ['seurannat', 'mainostilit', 'sivuston nopeuden', 'yhteydenottopolut', 'hakukonenäkyvyyden'],
  teksti:
    'Ennen kuin mainontaan laitetaan euroakaan lisää, perustan pitää olla kunnossa. Yli kymmenen vuoden ja noin tuhannen projektin kokemus – ' +
    'nyt suoraan tekijältä, kiinteällä hinnalla ja ilman toimiston välikäsiä.',
  luvut: [
    { luku: '~1000', selite: 'projektia' },
    { luku: '~5 M€', selite: 'mainosbudjetteja' },
    { luku: '50+ M€', selite: 'mitattua myyntiä' },
  ],
};

export const vaite =
  'Useimmiten vika ei ole kampanjoissa. Se on niiden alla: seurannassa, joka mittaa väärin, sivussa, joka latautuu hitaasti, ja yhteydenotossa, joka on tehty vaikeaksi. Kampanjat eivät korjaa perustaa – siksi aloitan aina siitä.';

// Numerot lasketaan näkyviin animaationa: ennen + arvo + jälkeen
export const numerot = [
  { arvo: 10, ennen: '', jalkeen: '+', selite: 'vuotta myyntiä, markkinointia ja verkkosivuja' },
  { arvo: 1000, ennen: '~', jalkeen: '', selite: 'projektia: verkkosivuja, verkkokauppoja ja kampanjoita' },
  { arvo: 5, ennen: '~', jalkeen: ' M€', selite: 'asiakkaiden mainosbudjetteja Metassa ja Googlessa' },
  { arvo: 50, ennen: '', jalkeen: '+ M€', selite: 'mitattua myyntiä asiakkaille' },
  { arvo: 250000, ennen: '', jalkeen: '+', selite: 'liidiä eri toimialoille' },
];
export const numerotHuomautus = 'Luvut kertovat urani ja vetämäni markkinointitoimiston ajalta.';

export const vaiheet = [
  { otsikko: '15 minuutin puhelu', teksti: 'Kerrot tilanteen. Minä kerron, kannattaako katselmus, suoraan korjaukset – vai ei kumpikaan.', kesto: 'Maksuton' },
  { otsikko: 'Katselmus', teksti: 'Käyn tilit ja sivuston läpi. Saat listan: mitä korjataan, missä järjestyksessä ja mitä se maksaa.', kesto: '1 viikko' },
  { otsikko: 'Toteutus', teksti: 'Korjaukset tai uusi sivusto kiinteällä hinnalla. Toteutuksessa apuna kaksi kehittäjää, joiden kanssa olen tehnyt töitä vuosia.', kesto: '2–4 viikkoa' },
  { otsikko: 'Halutessasi kumppanuus', teksti: 'Kevyt kuukausimalli: raportti ja palaveri kerran kuussa. Ei viikkopalavereita, ei pitkiä sopimuksia.', kesto: 'Kuukausi kerrallaan' },
];

export const vertailu = {
  sarakkeet: ['Tyypillinen toimisto', 'Pure Groundwork'],
  rivit: [
    { asia: 'Kenen kanssa asioit', toimisto: 'Asiakkuuspäällikkö välittää viestin tekijöille', pg: 'Suoraan tekijän kanssa, joka on tehnyt tämän tuhat kertaa' },
    { asia: 'Hinnoittelu', toimisto: 'Tuntilaskutus, lopullinen summa selviää jälkikäteen', pg: 'Kiinteä hinta, sovitaan ennen aloitusta' },
    { asia: 'Palaverit', toimisto: 'Viikkopalaverit ja statuspäivitykset', pg: 'Kerran kuussa – silloin kun on asiaa' },
    { asia: 'Sopimus', toimisto: 'Usein 6–12 kuukauden sitoumus', pg: 'Ei pitkää sopimusta' },
    { asia: 'Aloitus', toimisto: 'Viikkojen kartoitus ja työpajat', pg: 'Katselmus valmis viikossa' },
  ],
};

export const esittely = [
  'Olen tehnyt myyntiä ja markkinointia yli kymmenen vuotta: ensin myynnin ja asiakashankinnan tiimejä vetäen, sitten seitsemän vuotta omaa ' +
    'markkinointitoimistoa, jossa oli parhaimmillaan 25 ihmistä. Teimme noin tuhat projektia – verkkosivuja, verkkokauppoja ja kampanjoita – ' +
    'pienille ja isoille yrityksille Suomessa ja kansainvälisesti, paljon myös matkailualalla.',
  'Nyt teen töitä omalla nimelläni. Asioit aina minun kanssani, ja toteutuksessa apuna on kaksi kehittäjää, joiden kanssa olen tehnyt ' +
    'töitä vuosia. Isoa toimistoa ei tarvita siihen, että perusta laitetaan kuntoon.',
];
export const lainaus = 'Kun perusta on kunnossa, jokainen mainoseuro tekee töitä. Kun se ei ole, paraskaan kampanja ei auta.';

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

export const tyotapa = [
  { otsikko: 'Asioit tekijän kanssa', teksti: 'Ei välikäsiä. Toteutuksessa apuna kaksi kehittäjää, joiden kanssa olen tehnyt töitä vuosia.' },
  { otsikko: 'Hinta etukäteen', teksti: 'Tiedät ennen aloitusta, mitä saat ja mitä se maksaa. Ei tuntilaskutuksen yllätyksiä.' },
  { otsikko: 'Kevyt rytmi', teksti: 'Kuukausikumppanuuksissa palaveri kerran kuussa ja raportti. Ei viikkopalavereita.' },
  { otsikko: 'Suora palaute', teksti: 'Kerron suoraan, jos jotain ei kannata tehdä – myös silloin, kun se tarkoittaa pienempää laskua.' },
];

// ── Kokemus ──
export const kokemusHyodyt = [
  { otsikko: 'Olen nähnyt saman ennenkin', teksti: 'Noin tuhannen projektin jälkeen useimmat ongelmat ovat tuttuja. Korjaus löytyy nopeasti, eikä sitä tarvitse keksiä uudelleen.', kuvake: 'kerrokset' },
  { otsikko: 'Mittaan myyntiä, en klikkauksia', teksti: 'Liidit, kaupat ja euroa per liidi. Raportissa on se, mikä näkyy kassassa – ei näyttökertoja.', kuvake: 'mittari' },
  { otsikko: 'Koodi ja markkinointi samassa päässä', teksti: 'Koska teen sivustot ja seurannat itse, mainonnan ja sivun välissä ei ole katkosta.', kuvake: 'selain' },
];

export const toimialat = [
  { luku: '25+', otsikko: 'autoliikettä', teksti: 'Markkinointia ja liidien hankintaa autokaupalle: kampanjat, laskeutumissivut ja seuranta niin, että myyjä tietää, mistä liidi tuli.', koko: 'iso' },
  { luku: '30–40', otsikko: 'suoramyyntiyritystä', teksti: 'Asiakashankintaa, jossa liidin hinta ja laatu mitataan joka viikko.', koko: 'iso' },
  { luku: '7 v', otsikko: 'oma markkinointitoimisto', teksti: 'Parhaimmillaan 25 ammattilaista: graafikoita, kuvaajia, koodareita ja myyjiä.', koko: 'normaali' },
  { luku: 'KV', otsikko: 'matkailu ja elämykset', teksti: 'Kansainvälistä markkinointia ja suoria varauksia matkailuun, myös Lapin kohteille.', koko: 'normaali' },
  { luku: 'B2C + B2B', otsikko: 'verkkokaupat ja palvelut', teksti: 'Brändimarkkinointia, verkkokauppamyyntiä ja liidejä kuluttaja- ja yritysmyyntiin.', koko: 'normaali' },
];

// Asiakkaita vuosien varrelta. TARKISTA: kirjoitusasu ja lupa nimen käyttöön.
export const asiakkaat = ['iSkates', 'X-Beeli'];

// Alustat, joilla olen tehnyt tulosta (simple-icons-kuvakkeet, ks. components/LogoNauha.tsx)
export const alustat = ['Meta', 'Facebook', 'Instagram', 'Google', 'Google Ads', 'Google Analytics', 'Google Tag Manager', 'Search Console',
  'WordPress', 'WooCommerce', 'Shopify', 'Elementor', 'Next.js', 'Vercel', 'TikTok', 'YouTube', 'Mailchimp', 'HubSpot', 'Brevo', 'Figma'];

// Referenssit näytetään vasta, kun lista ei ole tyhjä. Lisää vain asiakkaat, joiden nimen saa mainita.
export const referenssit: { nimi: string; kuvaus: string; tulos?: string }[] = [];

// ── Palvelut ──
export type Palvelu = {
  slug: string;
  nimi: string;
  lyhyt: string;
  kuvake: string;
  seoOtsikko: string;
  seoKuvaus: string;
  ylaotsikko: string;
  otsikko: string;
  korostus: string;
  ingressi: string;
  hintaAlkaen: string;
  kortti: string;
  kenelle: string[];
  ongelmat: { otsikko: string; teksti: string }[];
  sisaltaa: { otsikko: string; kohdat: string[] }[];
  prosessi: { otsikko: string; teksti: string; kesto?: string }[];
  hinnat: { nimi: string; hinta: string; teksti: string; kohdat?: string[]; suosittu?: boolean }[];
  ukk: { k: string; v: string }[];
};

export const palvelut: Palvelu[] = [
  {
    slug: 'groundwork',
    nimi: 'Pure Groundwork',
    lyhyt: 'Groundwork',
    kuvake: 'kerrokset',
    seoOtsikko: 'Groundwork – markkinoinnin perusta kuntoon',
    seoKuvaus: 'Seurannat, mainostilit, sivuston nopeus, SEO ja yhteydenottopolut kuntoon kiinteällä hinnalla. Groundwork-katselmus 490 €, valmis viikossa.',
    ylaotsikko: 'Groundwork',
    otsikko: 'Markkinoinnin perusta kuntoon.',
    korostus: 'perusta',
    ingressi: 'Käyn läpi seurannat, mainostilit, sivuston nopeuden, hakukonenäkyvyyden ja yhteydenottopolut – ja laitan ne kuntoon kiinteällä hinnalla. Sen jälkeen jokainen mainoseuro tekee töitä.',
    hintaAlkaen: 'alkaen 490 €',
    kortti: 'Seurannat, mainostilit, nopeus, SEO ja yhteydenottopolut kuntoon kiinteällä hinnalla.',
    kenelle: [
      'Mainostat, mutta et tiedä, mikä oikeasti tuottaa',
      'Liidejä tulee vähemmän kuin klikkauksista voisi odottaa',
      'Sivusto on hidas tai vanhentunut',
      'Seuranta rakennettiin vuosia sitten, eikä kukaan muista miten',
    ],
    ongelmat: [
      { otsikko: 'Seuranta mittaa väärin', teksti: 'Pikseli puuttuu, konversiot lasketaan tuplana tai lomakkeen lähetystä ei mitata. Silloin mainonta optimoi väärään suuntaan.' },
      { otsikko: 'Sivu on hidas', teksti: 'Puhelimella sivu latautuu viisi sekuntia, ja puolet kävijöistä on jo lähtenyt. Jokainen mainosklikki maksaa silti.' },
      { otsikko: 'Yhteydenotto on vaikeaa', teksti: 'Lomakkeessa on kymmenen kenttää, puhelinnumero on piilossa, eikä vastausta tule päivään. Kiinnostunut asiakas valitsee kilpailijan.' },
    ],
    sisaltaa: [
      { otsikko: 'Seuranta', kohdat: ['GA4 ja järkevästi nimetyt tapahtumat', 'Konversiot: lomake, puhelu, sähköposti ja osto', 'Meta-pikseli ja Conversions API', 'Google Ads -konversiot ja tehostetut konversiot', 'Tag Manager ja evästesuostumus'] },
      { otsikko: 'Mainostilit', kohdat: ['Kampanjarakenne tavoitteen mukaan', 'Kohdennus ja poissulut', 'Budjetti tuottavimpiin kampanjoihin', 'Mainos ja laskeutumissivu samaa kieltä', 'Turhat kulut pois'] },
      { otsikko: 'Nopeus ja SEO', kohdat: ['Mobiilinopeus ja Core Web Vitals', 'Kuvat ja skriptit kevyiksi', 'Otsikot ja kuvaustekstit jokaiselle sivulle', 'Rakenne ja sisäinen linkitys', 'Google-yritysprofiili'] },
      { otsikko: 'Liidielementit', kohdat: ['Yhteydenotto yhdellä painalluksella', 'Lyhyet lomakkeet', 'Nopea vastaus: kuittaus tai chat', 'Laskurit ja hinta-arviot', 'Luottamus: referenssit ja kasvot'] },
      { otsikko: 'Sivusto', kohdat: ['Viesti selviää viidessä sekunnissa', 'Omat sivut tärkeimmille palveluille', 'Toimii puhelimella yhtä hyvin kuin koneella', 'Tietosuoja ja evästeet kunnossa', 'Tarvittaessa uusi sivusto koodilla'] },
    ],
    prosessi: [
      { otsikko: '15 minuutin puhelu', teksti: 'Kerrot tilanteen, ja sovitaan, mistä aloitetaan.', kesto: 'Maksuton' },
      { otsikko: 'Katselmus', teksti: 'Käyn läpi 25 kohtaa ja kokoan korjauslistan tärkeysjärjestyksessä.', kesto: '1 viikko' },
      { otsikko: 'Kunnostus', teksti: 'Korjaan seurannat, tilit, nopeuden, SEO-perustan ja liidielementit.', kesto: '2–4 viikkoa' },
      { otsikko: 'Luovutus', teksti: 'Mittarit kunnossa, ohjeet tallessa. Halutessasi jatketaan kuukausimallilla.', kesto: 'Valmis' },
    ],
    hinnat: [
      { nimi: 'Groundwork-katselmus', hinta: '490 €', teksti: 'Tiedät viikossa, mikä on kunnossa ja mikä ei.', kohdat: ['25 kohdan läpikäynti', 'Korjauslista tärkeysjärjestyksessä', 'Läpikäyntipalaveri', 'Hyvitetään, jos kunnostus tehdään'], suosittu: true },
      { nimi: 'Groundwork-kunnostus', hinta: 'alkaen 1 900 €', teksti: 'Perusta kuntoon kiinteällä hinnalla.', kohdat: ['Seurannat ja konversiot', 'Mainostilien rakenne', 'Nopeus ja SEO-perusta', 'Lomakkeet, chat ja laskurit', 'Ohjeet ja dokumentaatio'] },
    ],
    ukk: [
      { k: 'Tarvitaanko uusi sivusto?', v: 'Ei aina. Usein korjaukset riittävät, ja katselmus kertoo sen.' },
      { k: 'Mitä tarvitset meiltä?', v: 'Pääsyn mainostileille, analytiikkaan ja sivustoon. Muuta ei tarvita.' },
      { k: 'Pitääkö meidän vaihtaa mainostoimistoa?', v: 'Ei. Katselmus sopii myös silloin, kun mainonnan hoitaa toimisto tai oma tiimi. Saat puolueettoman näkemyksen siitä, mikä toimii.' },
      { k: 'Kauanko kestää?', v: 'Katselmus valmistuu viikossa ja kunnostus 2–4 viikossa.' },
    ],
  },
  {
    slug: 'verkkosivut',
    nimi: 'Uusi verkkosivusto',
    lyhyt: 'Verkkosivut',
    kuvake: 'selain',
    seoOtsikko: 'Uusi verkkosivusto koodilla',
    seoKuvaus: 'Nopea, koodilla tehty verkkosivusto ja kevyt hallintapaneeli. Seurannat ja SEO-perusta valmiina. Pieni sivusto 1 000 €, valmis noin kahdessa viikossa.',
    ylaotsikko: 'Verkkosivut',
    otsikko: 'Uusi sivusto, joka on rakennettu myymään.',
    korostus: 'myymään',
    ingressi: 'Koodilla tehty, nopea sivusto ilman raskasta julkaisualustaa ja lisäosien päivitysrumbaa. Mukana kevyt hallintapaneeli, jolla päivität tekstit ja kuvat itse.',
    hintaAlkaen: 'alkaen 1 000 €',
    kortti: 'Koodilla tehty, nopea sivusto ja kevyt hallintapaneeli. Seurannat ja SEO-perusta valmiina.',
    kenelle: [
      'Nykyinen sivu on hidas tai näyttää vanhalta',
      'WordPress ja lisäosat vaativat jatkuvaa päivittämistä',
      'Sivu ei tuo yhteydenottoja',
      'Tarvitset uuden sivun nopeasti ja selkeällä hinnalla',
    ],
    ongelmat: [
      { otsikko: 'Hidas puhelimella', teksti: 'Raskas teema ja kymmenet lisäosat hidastavat sivua. Se näkyy sekä hakutuloksissa että mainonnan hinnassa.' },
      { otsikko: 'Päivitysrumba', teksti: 'Lisäosat pitää päivittää, ja ne rikkovat toisensa. Joku joutuu aina korjaamaan jotain.' },
      { otsikko: 'Ei ohjaa yhteydenottoon', teksti: 'Sivu kertoo yrityksestä, mutta ei kerro kävijälle, mitä seuraavaksi kannattaa tehdä.' },
    ],
    sisaltaa: [
      { otsikko: 'Suunnittelu', kohdat: ['Rakenne palveluiden ja hakusanojen mukaan', 'Selkeä viesti ja tekstien sparraus', 'Ilme brändin mukaan'] },
      { otsikko: 'Toteutus', kohdat: ['Koodilla tehty, nopea sivusto', 'Toimii puhelimella yhtä hyvin kuin koneella', 'Kevyt hallintapaneeli teksteille ja kuville'] },
      { otsikko: 'Valmiina myyntiin', kohdat: ['Seurannat: GA4, Tag Manager ja Meta-pikseli', 'SEO-perusta: otsikot, kuvaukset ja sivukartta', 'Yhteydenotto yhdellä painalluksella'] },
    ],
    prosessi: [
      { otsikko: 'Suunnittelupalaveri', teksti: 'Tavoitteet, kohderyhmä ja tärkeimmät palvelut.', kesto: '1 palaveri' },
      { otsikko: 'Rakenne ja sisältö', teksti: 'Sivukartta, tekstit ja ilme hyväksytään ennen toteutusta.', kesto: '1 viikko' },
      { otsikko: 'Toteutus', teksti: 'Sivusto koodilla, hallintapaneeli ja seurannat.', kesto: '1–4 viikkoa' },
      { otsikko: 'Julkaisu ja mittaus', teksti: 'Sivu julki, seurannat päälle ja ensimmäiset luvut läpi.', kesto: 'Valmis' },
    ],
    hinnat: [
      { nimi: 'Pieni sivusto', hinta: '1 000 €', teksti: '1–3 sivua, valmis noin kahdessa viikossa.', kohdat: ['Rakenne ja ilme', 'Hallintapaneeli', 'Seurannat ja SEO-perusta'] },
      { nimi: 'Keskikokoinen sivusto', hinta: '1 500–2 500 €', teksti: 'Pienemmille yrityksille.', kohdat: ['Palvelusivut', 'Yhteydenottopolut ja lomakkeet', 'Hallintapaneeli', 'Seurannat ja SEO-perusta'], suosittu: true },
      { nimi: 'Laaja sivusto', hinta: '3 000–4 000 €', teksti: 'Isommille yrityksille.', kohdat: ['Enemmän sivuja', 'Kieliversiot', 'Integraatiot', 'Seurannat ja SEO-perusta'] },
    ],
    ukk: [
      { k: 'Voinko päivittää sivua itse?', v: 'Kyllä. Kevyellä hallintapaneelilla päivität tekstit ja kuvat itse. Isommat muutokset teen minä.' },
      { k: 'Millä tekniikalla sivu tehdään?', v: 'Modernilla, koodilla tehdyllä tekniikalla ilman raskasta julkaisualustaa. Siksi sivu on nopea, turvallinen ja helppo ylläpitää.' },
      { k: 'Teetkö WordPress-sivuja?', v: 'Uusia en. Olemassa olevia WordPress-sivustoja ylläpidän ja kehitän tarvittaessa.' },
      { k: 'Kuka hoitaa hostingin?', v: 'Halutessasi Nordic Host. Hosting ja ylläpito alkaen 149 €/kk.' },
      { k: 'Kauanko projekti kestää?', v: 'Pieni sivusto noin kaksi viikkoa, laajempi 3–6 viikkoa.' },
    ],
  },
  {
    slug: 'mainonta',
    nimi: 'Mainonnan kumppanuus',
    lyhyt: 'Mainonta',
    kuvake: 'kohde',
    seoOtsikko: 'Meta- ja Google-mainonta kevyellä mallilla',
    seoKuvaus: 'Meta- ja Google-mainonnan hoito kuukausiraportilla ja palaverilla kerran kuussa. Ei viikkopalavereita, ei pitkiä sopimuksia. 490–990 €/kk.',
    ylaotsikko: 'Mainonta',
    otsikko: 'Mainonta, joka tekee tulosta ilman jatkuvaa säätöä.',
    korostus: 'tulosta',
    ingressi: 'Hoidan Meta- ja Google-mainonnan kevyellä kuukausimallilla: käyn tilit läpi, teen muutokset ja kokoan raportin, jonka pohjalta päätetään seuraava kuukausi.',
    hintaAlkaen: '490–990 €/kk',
    kortti: 'Meta- ja Google-mainonta kevyellä mallilla: kuukausiraportti ja palaveri kerran kuussa.',
    kenelle: [
      'Mainostat, mutta kenelläkään ei ole aikaa seurata tilejä',
      'Haluat kokeneen tekijän ilman toimiston palaverirumbaa',
      'Raportti kertoo klikkauksista, mutta et tiedä, mitä niistä seurasi',
    ],
    ongelmat: [
      { otsikko: 'Autopilotilla', teksti: 'Kampanjat pyörivät samoilla asetuksilla kuukaudesta toiseen, eikä kukaan kysy, toimivatko ne.' },
      { otsikko: 'Väärät mittarit', teksti: 'Raportissa on klikkauksia ja näyttökertoja – mutta ei sitä, montako kauppaa tai liidiä niistä tuli.' },
      { otsikko: 'Palaverit maksavat', teksti: 'Viikkopalaverit ja statuspäivitykset vievät aikaa ja näkyvät laskussa.' },
    ],
    sisaltaa: [
      { otsikko: 'Hoito', kohdat: ['Meta- ja Google-kampanjoiden rakenne ja optimointi', 'Kohdennus, mainokset ja budjetin jako', 'Konversioseurannan tarkistus'] },
      { otsikko: 'Raportointi', kohdat: ['Kuukausiraportti: mitä tehtiin, mitä tuli, mitä seuraavaksi', 'Palaveri kerran kuussa tai joka toinen kuukausi', 'Viestit tarpeen mukaan, noin 15 minuuttia viikossa'] },
      { otsikko: 'Rajaus', kohdat: ['Ei viikkopalavereita', 'Ei ad hoc -työtä kuukausimaksulla', 'Mediabudjetti maksetaan suoraan alustoille'] },
    ],
    prosessi: [
      { otsikko: 'Maksuton läpikäynti', teksti: 'Käyn tilit läpi ja kerron kolme asiaa, jotka muuttaisin.', kesto: 'Maksuton' },
      { otsikko: 'Perusta kuntoon', teksti: 'Seuranta ja tilien rakenne kuntoon tarvittaessa Groundworkilla.', kesto: '1–3 viikkoa' },
      { otsikko: 'Kuukausirytmi', teksti: 'Optimointi, raportti ja palaveri kerran kuussa.', kesto: 'Jatkuva' },
      { otsikko: 'Kehitys', teksti: 'Uudet kanavat, mainokset ja laskeutumissivut tulosten mukaan.', kesto: 'Tarpeen mukaan' },
    ],
    hinnat: [
      { nimi: 'Maksuton läpikäynti', hinta: '0 €', teksti: 'Kolme asiaa, jotka muuttaisin mainonnassasi.', kohdat: ['Tilien läpikäynti', 'Kolme korjausehdotusta', 'Ei sitoumuksia'] },
      { nimi: 'Mainonnan kumppanuus', hinta: '490–990 €/kk', teksti: 'Hinta kanavien ja mainosbudjetin mukaan.', kohdat: ['Meta- ja Google-mainonta', 'Kuukausiraportti', 'Palaveri kerran kuussa', 'Ei pitkää sopimusta'], suosittu: true },
    ],
    ukk: [
      { k: 'Sisältyykö mainosbudjetti hintaan?', v: 'Ei. Mediabudjetti maksetaan suoraan Metalle ja Googlelle, joten näet aina, mihin raha menee.' },
      { k: 'Kuinka pitkä sopimus on?', v: 'Pitkää sitoumusta ei ole. Kumppanuus jatkuu kuukausi kerrallaan.' },
      { k: 'Entä jos tilit ovat nyt toimistolla?', v: 'Tilit voidaan siirtää, tai käyn ne läpi ja annan näkemyksen nykyisen kumppanin tueksi.' },
      { k: 'Teetkö myös mainosmateriaalit?', v: 'Perusmainokset kuuluvat työhön. Isommat kuvaukset ja videot sovitaan erikseen.' },
    ],
  },
  {
    slug: 'sparraus',
    nimi: 'Markkinoinnin sparraus',
    lyhyt: 'Sparraus',
    kuvake: 'puhe',
    seoOtsikko: 'Markkinoinnin sparraus kuukausimallilla',
    seoKuvaus: 'Kokenut sparraaja markkinoinnista vastaavalle: palaveri kerran kuussa, katsaus lukuihin ja mainostileihin. 600–1 200 €/kk, ei pitkää sopimusta.',
    ylaotsikko: 'Sparraus',
    otsikko: 'Kokenut sparraaja markkinoinnin tueksi.',
    korostus: 'sparraaja',
    ingressi: 'Markkinoinnista vastaavalla on yleensä enemmän tekemistä kuin aikaa – ja harvoin ketään, jonka kanssa käydä ajatuksia läpi. Tuon ulkopuolisen näkemyksen yli kymmenen vuoden ja noin tuhannen projektin kokemuksella.',
    hintaAlkaen: '600–1 200 €/kk',
    kortti: 'Taustatukea markkinoinnista vastaavalle: palaveri kerran kuussa ja näkemys siihen, mistä saa enemmän irti.',
    kenelle: [
      'Markkinointipäällikkö tai -tiimi, joka haluaa toisen silmäparin',
      'Yrittäjä, joka hoitaa markkinoinnin itse',
      'Yritys, joka miettii, mitä kannattaa tehdä itse ja mitä ostaa',
    ],
    ongelmat: [
      { otsikko: 'Yksin päätösten kanssa', teksti: 'Kukaan ei kyseenalaista suunnitelmaa ennen kuin rahat on jo käytetty.' },
      { otsikko: 'Tekeminen hajoaa', teksti: 'Kanavia on liikaa, eikä mikään niistä saa tarpeeksi huomiota.' },
      { otsikko: 'Myynti ja markkinointi erikseen', teksti: 'Markkinointi tuo liidejä, myynti valittaa laadusta, eikä kukaan mittaa kokonaisuutta.' },
    ],
    sisaltaa: [
      { otsikko: 'Kuukausirytmi', kohdat: ['Palaveri kerran kuussa', 'Katsaus lukuihin, mainostileihin ja kampanjoihin', 'Kommentit ja priorisoidut toimenpiteet'] },
      { otsikko: 'Näkemys', kohdat: ['Liidien hankinta ja asiakaspolku', 'Myynnin ja markkinoinnin yhteistyö', 'Budjetin jako kanavien kesken'] },
      { otsikko: 'Tuki', kohdat: ['Viestit tarpeen mukaan', 'Kumppaneiden ja toimistojen töiden arviointi', 'Rekrytointien ja ostojen sparraus'] },
    ],
    prosessi: [
      { otsikko: 'Sparrauspalaveri', teksti: 'Kahden tunnin läpikäynti: missä ollaan ja mitä kannattaa tehdä ensin.', kesto: '2 tuntia' },
      { otsikko: 'Suunta ja prioriteetit', teksti: 'Kirjallinen yhteenveto ja tärkeimmät toimenpiteet.', kesto: '1 viikko' },
      { otsikko: 'Kuukausirytmi', teksti: 'Palaveri kerran kuussa, katsaus ja kommentit.', kesto: 'Jatkuva' },
    ],
    hinnat: [
      { nimi: 'Sparrauspalaveri', hinta: '790 €', teksti: 'Kertaluonteinen kahden tunnin läpikäynti.', kohdat: ['Nykytilan läpikäynti', 'Kirjallinen yhteenveto', 'Hyvitetään, jos jatketaan'] },
      { nimi: 'Markkinoinnin sparraus', hinta: '600–1 200 €/kk', teksti: 'Kevyt kuukausimalli.', kohdat: ['Palaveri kerran kuussa', 'Kuukausikatsaus ja kommentit', 'Viestit tarpeen mukaan', 'Ei pitkää sopimusta'], suosittu: true },
    ],
    ukk: [
      { k: 'Mitä eroa on sparrauksella ja mainonnan kumppanuudella?', v: 'Kumppanuudessa hoidan mainonnan. Sparrauksessa te teette, ja minä tuon näkemyksen ja varmistan suunnan.' },
      { k: 'Voiko aloittaa yhdellä palaverilla?', v: 'Kyllä. Sparrauspalaverin jälkeen tiedät, onko kuukausimallista hyötyä – ja hinta hyvitetään, jos jatketaan.' },
      { k: 'Toimiiko etänä?', v: 'Kyllä. Palaverit pidetään etänä tai sovitusti paikan päällä.' },
    ],
  },
];

export const haePalvelu = (slug: string) => palvelut.find((p) => p.slug === slug);

// ── Hinnasto (alv 0 %) ──
export const hinnasto = [
  { ryhma: 'Groundwork', kuvaus: 'Markkinoinnin perusta kuntoon.', linkki: '/palvelut/groundwork', rivit: palvelut[0].hinnat },
  { ryhma: 'Verkkosivut', kuvaus: 'Koodilla, hallintapaneelilla, kiinteällä hinnalla.', linkki: '/palvelut/verkkosivut', rivit: palvelut[1].hinnat },
  { ryhma: 'Mainonta', kuvaus: 'Meta ja Google kevyellä kuukausimallilla.', linkki: '/palvelut/mainonta', rivit: palvelut[2].hinnat },
  { ryhma: 'Sparraus', kuvaus: 'Taustatuki markkinoinnista vastaavalle.', linkki: '/palvelut/sparraus', rivit: palvelut[3].hinnat },
  {
    ryhma: 'Ylläpito ja lisätyöt',
    kuvaus: 'Kun sivu on valmis, se pysyy kunnossa.',
    linkki: '/yhteys',
    rivit: [
      { nimi: 'Hosting ja ylläpito', hinta: 'alkaen 149 €/kk', teksti: 'Hosting Nordic Hostilla, päivitykset ja kuukausiraportti.' },
      { nimi: 'Pikatyöt', hinta: 'alkaen 200 €', teksti: 'Pienet koodaus- ja sivutyöt, myös WordPressin ylläpito ja kehitys.' },
    ],
  },
];
export const hinnatHuomautus = 'Hinnat alv 0 %. Tarkka hinta sovitaan aina ennen aloitusta.';
export const maksuehdot = 'Sivustot ja kunnostukset laskutetaan 50 % aloituksesta ja 50 % valmistuttua. Kuukausikumppanuudet jatkuvat kuukausi kerrallaan.';

// ── Yleiset kysymykset (etusivu) ──
export const kysymykset = [
  { k: 'Miksi et ole toimisto?', v: 'Koska perustan kuntoon laittamiseen ei tarvita kymmentä ihmistä vaan yksi, joka on tehnyt sen tuhat kertaa. Toteutuksessa apuna on kaksi kehittäjää, joiden kanssa olen tehnyt töitä vuosia.' },
  { k: 'Mistä kannattaa aloittaa?', v: 'Yleensä Groundwork-katselmuksesta. Se kertoo viikossa, mikä on kunnossa, mikä ei ja missä järjestyksessä asiat kannattaa korjata.' },
  { k: 'Teetkö töitä koko Suomeen?', v: 'Kyllä. Suurin osa työstä tehdään etänä, ja palaverit pidetään verkossa tai sovitusti paikan päällä.' },
  { k: 'Mitä palvelut maksavat?', v: 'Katselmus 490 €, kunnostus alkaen 1 900 €, verkkosivut 1 000–4 000 € ja kuukausikumppanuudet 490–1 200 €/kk. Kaikki hinnat ovat hinnastossa.' },
  { k: 'Kuinka nopeasti pääsemme alkuun?', v: 'Yleensä saman viikon aikana. Ensimmäinen askel on 15 minuutin puhelu.' },
];

export const yhteysVaiheet = [
  { otsikko: 'Lähetä viesti tai varaa aika', teksti: 'Pari lausetta tilanteesta riittää. Liitä mukaan verkkosivusi osoite.' },
  { otsikko: 'Vastaan saman päivän aikana', teksti: 'Jos asia vaatii, sovitaan 15 minuutin puhelu.' },
  { otsikko: 'Saat suoran näkemyksen', teksti: 'Kerron, mitä tekisin ja mitä se maksaa – ilman sitoumuksia.' },
];

export const lomakePalvelut = ['Groundwork-katselmus', 'Groundwork-kunnostus', 'Uusi sivusto', 'Mainonta', 'Markkinoinnin sparraus', 'En tiedä vielä'];

// ── Megavalikko ──
export const megavalikko = palvelut.map((p) => ({ nimi: p.nimi, kuvake: p.kuvake, linkki: `/palvelut/${p.slug}`, teksti: p.kortti, hinta: p.hintaAlkaen }));
