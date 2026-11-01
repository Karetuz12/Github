# Laskutusmoottori – asennus ja käyttö

Yksi Google Sheets -taulukko, joka pitää kirjaa laskutuksesta ja hoitaa asiakashankinnan. Siihen kirjataan
kuukausitavoitteet, toistuvat tulot, kaupat ja laskut. Kojelauta kertoo joka muokkauksen jälkeen, paljonko
kuukaudesta puuttuu. Joka aamu kone lähettää juuri sen verran uusia viestejä kuin vaje vaatii, hoitaa
jatkoviestit ja merkitsee vastaukset. Kalenteriin varatut palaverit siirtyvät itsestään kauppoihin. Lopuksi saat päivän koosteen.

Strategia, jonka varaan kone on rakennettu: [STRATEGIA.md](STRATEGIA.md). Valmiit viestit kolmeen kulmaan: [viestipohjat/VIESTIPOHJAT.md](viestipohjat/VIESTIPOHJAT.md).

| Välilehti | Mitä siellä on | Kuka kirjoittaa |
|---|---|---|
| **Kojelauta** | Tämä kuu, myyntikoneen tahti, konversiot, huomiot, kuukausitaulukko (laskutus ja kassa), kaavio ja seuraavat askeleet | Kone (älä kirjoita tänne) |
| **Viikot** | Viikkoseuranta: tuliko kauppa, kontaktit, vastaukset ja mihin kuukausiin voitettujen kauppojen laskutus osuu | Kone |
| **Kaupat** | Avoimet ja voitetut kaupat: tuote, arvo, vaihe, tilauspäivä, kk-tulo | Sinä |
| **Tuotteet** | Tuotteet hintoineen ja laskutusaikatauluineen (esim. 50 % aloituksesta, 50 % julkaisusta) | Sinä |
| **Liidit** | Asiakashankinnan lista: yritys, yhteystiedot, havainto, sarjan tila | Sinä + kone |
| **Laskut** | Kuukauden laskutuslista ja toteuma | Kone luo rivit, sinä merkitset lähetetyiksi |
| **Toistuvat** | Sopimuspohjaiset kuukausitulot | Sinä |
| **Tavoitteet** | Tavoite jokaiselle kuukaudelle | Sinä |
| **Viestipohjat** | Kolmen viestin sähköpostisarja ja LinkedIn-viesti | Sinä |
| **Asetukset** | Tila, nimi, allekirjoitus, tahdin rajat, konversio-oletukset, kaupan vaiheet | Sinä |
| **Loki** | Kaikki mitä kone on tehnyt | Kone |

## Asennus (n. 10 min, kerran)

1. Kirjaudu Googleen sillä tilillä, josta viestien on tarkoitus lähteä, ja avaa **https://sheets.new**. Nimeä taulukko vaikka "Laskutusmoottori".
2. Valitse **Laajennukset → Apps Script**. Poista editorissa valmiina oleva teksti, liitä tilalle koko `laskutusmoottori.gs` ja tallenna (Ctrl+S).
3. Valitse editorin vasemmasta reunasta **Palvelut (Services) +** → **Gmail API** → **Lisää**.
4. Valitse yläpalkin funktiovalikosta **asenna** ja paina **Suorita**.
   Google kysyy käyttöoikeuksia: **Review permissions** → valitse tili. Jos tulee varoitus "Google hasn't verified this app",
   valitse **Advanced** → **Go to … (unsafe)** → **Allow**. Varoitus tulee, koska skripti on oma eikä Googlen tarkastama.
5. Palaa taulukkoon ja päivitä sivu. Yläpalkkiin ilmestyy valikko **Laskutusmoottori**.
6. Täytä **Asetukset**-välilehdeltä **Nimesi** ja **Allekirjoitus**. Tarkista myös **Referenssilause**: saatko käyttää Book Laplandin ja SkyView'n nimiä? **Tila** jää arvoon **TESTI**.
7. Vaihda **Toistuvat**-välilehdellä konsultointiasiakkaan nimi ja **Kaupat**-välilehdellä marraskuun verkkosivuasiakkaan nimi.

Asennus luo kaikki välilehdet ja lisää valmiiksi lähtötilanteen. Lisäksi se ajastaa päivittäisen ajon klo 7. Lähtötilanteessa ovat:

- tavoitteet marraskuusta 2026 joulukuuhun 2027 (viikkotavoite marras–joulukuussa 0, tammikuusta 1)
- toistuvat tulot
- marraskuun verkkosivuprojekti 1 000 €
- käynnissä olevan projektin loppulaskutus: 2 000 € marraskuussa ja 1 000 € joulukuussa
- marraskuun laskutuslista

Marraskuun ennuste on siis 14 000 €. Tarkista summat ja päivät Kaupat-välilehden *Erät käsin* -sarakkeesta.

## Käyttöönotto kolmessa vaiheessa

1. **TESTI (1–3 päivää).** Lisää 10–20 liidiä ja valitse valikosta **Tarkista sivustot**. Lue ehdotetut havainnot, kopioi hyvät Havainto-sarakkeeseen ja valitse **Esikatsele tämän päivän viestit**. Aamun koosteessa näet viestit, jotka lähtisivät. Mitään ei lähetetä.
2. **LUONNOS (1–2 viikkoa).** Kone tekee viestit Gmailin luonnoksiin. Sinä luet, muokkaat ja lähetät ne itse. Seuraavana aamuna kone huomaa lähetyksen ja jatkaa sarjaa. Jos poistat luonnoksen, liidin tilaksi tulee Tauko.
3. **LÄHETÄ.** Kone lähettää itse. Aloita uudella postilaatikolla enintään 10 uudella viestillä päivässä (Asetukset: *Uusia kontakteja / päivä, enintään*) ja nosta rajaa parin viikon välein.

## Liidien lisääminen

Liitä rivit Liidit-välilehdelle. Tila (Uusi), Vaihe (0) ja Lisätty täyttyvät itsestään.

- **Pakolliset:** Sähköposti. Kylmille liideille lisäksi Yritys ja Havainto. Verkkosivu tarvitaan sivustotarkistukseen ja muuttujaan `{{sivusto}}`.
- **Segmentti** valitsee viestisarjan:
  - *WordPress*: uusi sivusto koodilla WordPress-sivustojen omistajille. Tyhjän segmentin WordPress-sivusto siirtyy tähän sivustotarkistuksessa itse.
  - *Groundwork*: markkinoinnin perusta kuntoon (seurannat, mainostilit, nopeus, SEO ja yhteydenottopolut).
  - *Mainonta*: Meta- ja Google-mainonnan kevyt kumppanuus.
  - *Sparraus*: markkinoinnista vastaavan taustatuki.
  - *Matkailu*: matkailun pohjat.
  - *Yleinen* tai tyhjä: yleiset pohjat.
  - *Verkosto*: tutut ihmiset. Kaksi henkilökohtaista viestiä, jotka pyytävät suosittelua. Havaintoa tai yritystä ei tarvita.
  - *Vanha asiakas*: vanhat projekti- ja markkinointiasiakkaat. Kaksi viestiä: yhteinen historia, havainto nykyisestä sivusta ja maksuton kuntotarkastus.
    ⚠ Tarkista ennen lähettämistä mainostoimiston kauppakirjasta, koskeeko kilpailu- tai houkuttelukielto toimiston entisiä asiakkaita.

  Jos segmentillä on omia pohjia, sen liidit käyttävät vain niitä. Kustakin segmentistä lähtee enintään viisi avausta päivässä
  (Asetukset → *Avauksia / segmentti / päivä, enintään*). Kolme kulmaa × 5 = 15 täsmäiskua päivässä.
- **Havainto** on täsmäiskun ydin: yksi asia yrityksen omalta sivulta. Se jatkaa lausetta *"kävin läpi sivujanne ja huomasin, että …"*,
  joten kirjoita se pienellä alkukirjaimella ja ilman pistettä. Esimerkkejä:
  - *varaukset ohjautuvat sivuilta Booking.comiin, jolloin jokaisesta varauksesta lähtee välityspalkkio*
  - *sivuilta ei löydy englanninkielistä versiota, vaikka asiakkaistanne iso osa tulee ulkomailta*
  - *revontuliretken hinta ja aikataulu löytyvät vasta PDF-esitteestä*
- **Ehdotettu havainto** on sivustotarkistuksen ehdotus. Tarkista se sivulta itse ennen kuin hyväksyt sen. Jos asetus
  *Hyväksy ehdotetut havainnot automaattisesti* on päällä, kone käyttää ehdotusta, kun Havainto on tyhjä.
- Samaan yritykseen (sama sähköpostidomain) lähtee vain yksi avaus kerrallaan. Samasta osoitteesta tehty toinen rivi merkitään *Tupla*.

Claude voi koota liidit puolestasi: pyydä esim. *"etsi 40 lappilaista ohjelmapalveluyritystä, joiden sivuilta ei voi varata suoraan, ja anna ne Liidit-välilehden sarakkeissa"*.

## Mitä kone tekee joka aamu klo 7

1. Kuun ensimmäisenä päivänä se luo kuun laskutuslistan Laskut-välilehdelle: toistuvat tulot ja voitetut kaupat tilalla *Laskuttamatta*.
2. Se tarkistaa lähetetyt ketjut. Vastanneet merkitään *Vastasi* ja niiden sarja pysähtyy. Pomput merkitään *Pomppasi*. Automaattiset poissaoloviestit eivät pysäytä sarjaa. Lähetetyt luonnokset siirtyvät tilaan *Sekvenssissä*.
3. Se tarkistaa kalenterin. Jos liidin sähköposti on tapahtuman vieraana tai järjestäjänä seuraavan 60 päivän aikana, liidi siirtyy kauppoihin vaiheeseen *Palaveri sovittu*. Palaverin päivä tulee kaupan seuraavaksi askeleeksi.
4. Se tarkistaa jonon seuraavien 20 liidin sivustot. Tarkistus kattaa alustan (esim. WordPress), sivunrakentajan (esim. Elementor), seurantakoodit (Meta-pikseli, Google Ads, GA4, GTM), https-yhteyden, mobiilinäkymän ja latausajan. Jos PageSpeed-avain on asetettu, se mittaa myös mobiilinopeuden.
5. Arkipäivinä se lähettää ensin erääntyneet jatkoviestit samaan ketjuun ja sitten uudet avaukset kiintiön verran. Kiintiö näkyy kojelaudalla.
6. Se valitsee päivän LinkedIn-listan (5 kpl, valinnainen). Soittolista on oletuksena pois päältä.
7. Se lähettää koosteen *Raporttien osoite* -asetuksen osoitteeseen. Maanantaisin mukana on viikkoraportti. Vastaukset ja virheet tulevat aina tietoon.

Sarja: **avaus → 3 arkipäivän päästä muistutus → 5 arkipäivän päästä lopetusviesti → 5 arkipäivän päästä tila *Ei vastausta***.
Odotusajat ja tekstit voi muuttaa Viestipohjat-välilehdellä.

## Mitä sinä teet (20–30 min päivässä)

- **Vastaukset:** vastaa Gmailissa ja päivitä liidin tila (*Palaveri*, *Ei kiinnosta* tai *Älä ota yhteyttä*). Kun palaveri on sovittu, valitse liidin rivi ja valikosta **Siirrä valittu liidi kauppoihin**.
- **Palaverit:** luo Google-kalenteriin ajanvaraussivu (Kalenteri → Luo → Ajanvarausaikataulu; vaatii Google Workspacen) ja liitä sen linkki Asetuksiin kohtaan *Ajanvarauslinkki*.
  Linkki lisätään jatkoviesteihin. Varattu palaveri siirtää liidin kauppoihin ilman käsityötä. Sama toimii, kun lähetät kutsun itse ja liidi on vieraana.
- **LinkedIn-lista (valinnainen):** lähetä kutsu ilman viestiä. Kun kutsu on hyväksytty, lähetä koosteen valmis viesti ja päivitä *LinkedIn-tila*. Lista pois: *LinkedIn-tehtäviä / päivä* = 0.
- **Kaupat:** kirjoita asiakas. Tuote (oletus Verkkosivuprojekti), vaihe (Liidi) ja luontipäivä täyttyvät itsestään. Pidä *Vaihe*, *Seuraava askel* ja *Seuraava pvm* ajan tasalla.
  Kun kauppa on voitettu, vaihda vaiheeksi *Voitettu* ja kirjaa **Tilauspvm**. Avoimelle kaupalle Tilauspvm on arvio. Katso tarkemmin kohta *Laskutusaikataulut ja viikkoseuranta*.
- **Laskut:** *Laskutetaan*-sarake kertoo, milloin rivi pitää laskuttaa. Kun lasku on lähtenyt, vaihda tilaksi *Lähetetty* ja korjaa summa toteutuneeksi, esim. Markkinointiboostin provisio.
  Vain *Lähetetty* ja *Maksettu* lasketaan laskutetuksi. Kojelauta muistuttaa riveistä, joiden laskutuspäivä on mennyt.

## Kojelaudan luvut

| Luku | Mitä se tarkoittaa |
|---|---|
| Varmistettu | Toistuvat tulot ja voitetut kaupat, jotka laskutetaan tässä kuussa |
| Putki, painotettu | Avoimet kaupat kerrottuna vaiheen todennäköisyydellä (Liidi 10 % … Neuvottelu 75 %) |
| Ennuste | Varmistettu + putki |
| Laskutettu | Laskut-välilehden *Lähetetty*- ja *Maksettu*-rivit |
| Avoin vaje | Tämän ja ensi kuun vaje putken jälkeen. Kylmä kontakti ehtii laskutukseen yleensä vasta ensi kuussa, siksi mukana on kaksi kuukautta. |
| Tahti vajeesta | Avoin vaje ÷ keskikauppa ÷ palaveri→kauppa ÷ kontakti→palaveri, josta vähennetään jo kesken olevat ja joka jaetaan arkipäivillä ensi kuun loppuun |
| Tahti viikkotavoitteesta | Kauppoja / viikko ÷ palaveri→kauppa ÷ kontakti→palaveri ÷ 5. Esim. 1 kauppa viikossa = 17 kontaktia päivässä. |
| Kiintiö | Isompi kahdesta tahdista, kuitenkin minimin ja maksimin välissä |
| Kassaan (ennuste) | Milloin rahat ovat tilillä: laskun päivä + maksuaika. Avoimet kaupat painotettuina. |
| Kassa kumulatiivinen | Kassaan tulevat rahat yhteensä tästä kuusta eteenpäin |
| Konversiot | Oletukset 4 % ja 30 % vaihtuvat toteutuneisiin, kun kontakteja on 60 ja suljettuja kauppoja 5 |

Arkipäivistä on jätetty pois viikonloput ja Suomen arkipyhät: vappu, juhannusaatto ja jouluaatto lasketaan myös pyhiksi.

## Laskutusaikataulut ja viikkoseuranta

**Tuote määrää, miten kauppa laskutetaan.** Tuotteet-välilehdellä on jokaiselle tuotteelle hinta ja enintään kolme erää. Jokaisella erällä on
osuus ja tieto siitä, montako päivää tilauksesta lasku lähtee. Lisäksi tuotteella on maksuaika.

| Tuote | Hinta | Erät | Maksuaika |
|---|---:|---|---|
| Verkkosivuprojekti | 2 500 € | 50 % 7 pv + 50 % 35 pv tilauksesta | 14 pv |
| Iso projekti (3 erää) | 6 000 € | 30 % 7 pv + 40 % 35 pv + 30 % 63 pv | 14 pv |
| Korjauspaketti | 1 500 € | 100 % 14 pv | 14 pv |
| Pikatyö | 300 € | 100 % 3 pv | 14 pv |
| Ylläpito ja hosting | 149 €/kk | kuukausimaksu tilauskuusta | 14 pv |
| Kertalasku | – | 100 % tilauspäivänä | 14 pv |

Muuta luvut omiksesi ja lisää omat tuotteesi, esimerkiksi booking engine, kun hinnoittelu on lukittu.

**Kaupalla riittää kolme tietoa:** Tuote, Vaihe ja Tilauspvm. Jos Kertatulo on tyhjä, käytetään tuotteen hintaa. Jos hinta on muu, kirjoita se sarakkeeseen.

- **Voitettu kauppa:** Tilauspvm on oikea tilauspäivä. Erät menevät laskutukseen ja kassaan sen mukaan.
- **Avoin kauppa:** Tilauspvm on arvio. Tyhjä arvio = luontipäivä + myyntisykli (Asetukset, 21 pv). Jos arvio on mennyt ohi, ennuste
  siirtää kaupan tälle päivälle ja huomauttaa siitä. Avoimet kaupat painotetaan vaiheen todennäköisyydellä.

Esimerkki: 2 000 € verkkosivuprojekti tilataan 15.11. Puolet laskutetaan 22.11. ja ne ovat tilillä 6.12. Toinen puoli laskutetaan 20.12.
ja se on tilillä 3.1. Kun 1.12. tulee toinen samanlainen kauppa, joulukuun laskutukseen kertyy 2 000 € ja joulukuun kassaan 2 000 €.
Kojelaudan kuukausitaulukko näyttää sekä laskutuksen että kassan. *Kassa kumulatiivinen* kertoo, paljonko rahaa on tulossa yhteensä.

**Erät käsin** on poikkeuksia varten: kolmessa osassa, kerralla tai jo sovittu työ. Kirjoita summat ja päivät, esim.
`2000 € 30.11.2026; 1000 € 15.12.2026` tai `50 % 1.12.2026; 50 % 15.1.2027`. Erät käsin ohittavat tuotteen aikataulun.
Jos kyse on jo sovitusta työstä, kuten vanhan projektin loppulaskutuksesta, jätä Tilauspvm tyhjäksi. Silloin sitä ei lasketa viikon uudeksi kaupaksi.

**Viikot-välilehti** vastaa viikko kerrallaan kysymykseen: tuliko kauppa? Siinä näkyvät kahdeksan mennyttä viikkoa, kuluva viikko ja neljä tulevaa:

- kontaktit, vastaukset, uudet kaupat ja voitetut kaupat
- kuun kaupat yhteensä
- ✓ tai ✗ viikkotavoitteeseen nähden. Tavoite on kuukausikohtainen: Tavoitteet → *Kauppoja / vk*, valmiina 0 marras–joulukuussa ja 1 tammikuusta. Tyhjä = Asetukset → *Kauppoja / viikko, tavoite*.
- mihin kuukausiin voitettujen kauppojen laskutus osuu, esim. *marras 1 000 € · joulu 1 000 €*

Voitettu kauppa lasketaan sille viikolle, jolle sen Tilauspvm osuu. Kooste kertoo joka aamu tämän viikon kaupat.
Maanantain viikkoraportissa on viiden viikon seuranta.

## Liidin tilat

| Tila | Merkitys | Kuka asettaa |
|---|---|---|
| Uusi | Jonossa, avaus lähtee kun vuoro tulee | Kone (liittäessä) |
| Luonnos | Avaus on Gmailin luonnoksissa | Kone |
| Sekvenssissä | Sarja käynnissä | Kone |
| Vastasi | Vastasi – reagoi | Kone |
| Palaveri / Kauppa | Palaveri sovittu / siirretty kauppoihin | Sinä / valikko |
| Ei kiinnosta, Älä ota yhteyttä | Ei enää viestejä tähän osoitteeseen eikä samaan yritykseen | Sinä |
| Ei vastausta | Sarja loppui ilman vastausta | Kone |
| Pomppasi, Tupla | Osoite ei toimi / sama osoite on jo listalla | Kone |
| Tauko | Sarja pysäytetty (myös kun poistat luonnoksen) | Sinä / kone |

## Verkkosivun lomake

Pure Groundwork -sivuston yhteydenottolomake kirjoittaa kyselyt suoraan Liidit-välilehdelle segmentillä *Inbound* ja tilalla *Vastasi*,
ja saat kyselystä heti sähköpostin. Käyttöönotto: valikko **Laskutusmoottori → Asenna verkkosivun lomake** ja sen ohjeet
(ks. myös [../puregroundwork/README.md](../puregroundwork/README.md)). Jos kyselyn lähettäjä on jo liidinä, hänen sarjansa pysähtyy ja viesti kirjataan muistiinpanoihin.

## Toimitettavuus ja pelisäännöt

- **Erillinen lähetysdomain.** Kylmät viestit kannattaa lähettää omasta domainista ja postilaatikosta, ei päädomainista. Asenna moottori sen tilin taulukkoon. Laita domainille SPF, DKIM ja DMARC kuntoon ja lämmitä laatikkoa 2–3 viikkoa ennen kuin tahti nousee yli 10 viestin päivässä.
- **Pelkkä teksti.** Pohjat on kirjoitettu ilman linkkejä ja liitteitä, koska ne heikentävät avausviestin perillemenoa.
- **PageSpeed-avain (valinnainen, ilmainen):** Google Cloud Console → ota käyttöön *PageSpeed Insights API* → Credentials → *API key*.
  Liitä avain Asetuksiin. Yksi mittaus kestää 10–30 sekuntia, joten aamuajo mittaa muutaman sivuston kerrallaan. Valikon *Tarkista sivustot* ehtii enemmän.
- **Tarkista valmis lista ennen tuontia.** Kerätyissä listoissa on vanhentuneita osoitteita, ja pomput heikentävät lähetysdomainin mainetta.
  Aja lista osoitteentarkistuspalvelun läpi ennen kuin liität sen Liidit-välilehdelle.
- **Kerätyt yhteystiedot ja GDPR.** Kun tiedot on kerätty muualta kuin henkilöltä itseltään, hänelle pitää kertoa tietojen lähde ja käsittely.
  Täytä Asetukset → *Tietosuojalause*, esim. *"Löysin yhteystietosi yrityksenne verkkosivuilta. Tietosuojaseloste: …"*.
  Lause lisätään jokaisen avausviestin loppuun muuttujalla `{{tietosuoja}}`.
- **B2B-pelisäännöt.** Lähetä vain yritysten työosoitteisiin, ja viestin pitää liittyä vastaanottajan työtehtävään. Jokaisessa avauksessa on helppo tapa kieltäytyä ("vastaa ei kiitos"). Kun joku kieltäytyy, aseta tilaksi *Älä ota yhteyttä*.
- **LinkedIn pysyy käsityönä.** Kone ei koske LinkedIniin, koska LinkedInin käyttöehdot kieltävät automaation ja tili voidaan jäädyttää. Kone antaa listan ja tekstin, sinä klikkaat.
- **Määrät.** Asetusten katto on 40 viestiä päivässä (uudet ja jatkoviestit yhteensä). Se on selvästi Googlen päivärajojen alla.

## Muutokset

- Sarakkeita saa siirtää ja lisätä. **Otsikoita ei saa nimetä uudelleen**, koska kone etsii sarakkeet niiden perusteella.
- Kojelauta kirjoitetaan uudelleen joka muokkauksella, joten älä kirjoita sinne. Kaupat-välilehden *Tod. %* on kaava.
- Uusi koodiversio: avaa Apps Script, korvaa koodi ja tallenna. Valitse taulukon valikosta **Laskutusmoottori → Päivitä taulukon rakenne**.
  Se lisää puuttuvat välilehdet, sarakkeet ja asetukset koskematta dataan. **asenna-funktiota ei ajeta uudelleen.**
- Ajon kellonaika: muuta *Ajo klo* ja valitse valikosta **Asenna ajastus uudelleen**.
- Kaupan vaiheita voi lisätä Asetukset-välilehden E–F-sarakkeisiin. *Voitettu* ja *Hävitty* pitää säilyttää nimillään.

## Kehittäjälle

- Laskenta, sekvenssien päätökset, sivustoanalyysi, viestien muodostus ja kooste ovat puhtaita funktioita
  (`laske`, `kaupanAikataulu`, `viikkoseuranta`, `palaveritKalenterista`, `puraPageSpeed`, `suunnittele`, `valitseTehtavat`, `analysoiSivu`, `renderoiViesti`, `rakennaMime`,
  `rakennaKooste`, `laskutusrivit`).
  Google-palveluja kutsuvat vain ohuet kääreet niiden ympärillä.
- Testit: `node --test "laskutusmoottori/testit/*.test.js"`. Yksikkötestit kattavat puhtaat funktiot. Integraatiotesti ajaa asennuksen,
  aamuajot, vastauksen, jatkoviestin, luonnostilan ja kauppaan siirron muistinvaraista Sheets- ja Gmail-jäljitelmää vasten.
- Gmail-viestit lähtevät Gmail API:n kautta (`Gmail.Users.Messages.send` ja `Drafts.create` `threadId`:llä ja In-Reply-To-otsakkeella),
  jotta jatkoviestit pysyvät samassa ketjussa myös vastaanottajalla.
