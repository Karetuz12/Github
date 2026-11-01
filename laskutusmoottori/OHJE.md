# Laskutusmoottori – asennus ja käyttö

Yksi Google Sheets -taulukko, joka pitää kirjaa laskutuksesta ja hoitaa asiakashankinnan. Siihen kirjataan
kuukausitavoitteet, toistuvat tulot, kaupat ja laskut. Kojelauta kertoo joka muokkauksen jälkeen, paljonko
kuukaudesta puuttuu. Joka aamu kone lähettää juuri sen verran uusia viestejä kuin vaje vaatii, hoitaa
jatkoviestit ja merkitsee vastaukset. Sen jälkeen saat koosteen sekä LinkedIn- ja soittolistan.

Strategia, jonka varaan kone on rakennettu: [STRATEGIA.md](STRATEGIA.md).

| Välilehti | Mitä siellä on | Kuka kirjoittaa |
|---|---|---|
| **Kojelauta** | Tämä kuu, myyntikoneen tahti, konversiot, huomiot, kuukausitaulukko, kaavio ja seuraavat askeleet | Kone (älä kirjoita tänne) |
| **Kaupat** | Avoimet ja voitetut kaupat: arvo, vaihe, laskutuskuukaudet, kk-tulo | Sinä |
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

Asennus luo kaikki välilehdet ja lisää valmiiksi lähtötilanteen: tavoitteet marraskuusta 2026 joulukuuhun 2027,
toistuvat tulot, marraskuun verkkosivuprojektin ja marraskuun laskutuslistan. Lisäksi se ajastaa päivittäisen ajon klo 7.

## Käyttöönotto kolmessa vaiheessa

1. **TESTI (1–3 päivää).** Lisää 10–20 liidiä ja valitse valikosta **Tarkista sivustot**. Lue ehdotetut havainnot, kopioi hyvät Havainto-sarakkeeseen ja valitse **Esikatsele tämän päivän viestit**. Aamun koosteessa näet viestit, jotka lähtisivät. Mitään ei lähetetä.
2. **LUONNOS (1–2 viikkoa).** Kone tekee viestit Gmailin luonnoksiin. Sinä luet, muokkaat ja lähetät ne itse. Seuraavana aamuna kone huomaa lähetyksen ja jatkaa sarjaa. Jos poistat luonnoksen, liidin tilaksi tulee Tauko.
3. **LÄHETÄ.** Kone lähettää itse. Aloita uudella postilaatikolla enintään 10 uudella viestillä päivässä (Asetukset: *Uusia kontakteja / päivä, enintään*) ja nosta rajaa parin viikon välein.

## Liidien lisääminen

Liitä rivit Liidit-välilehdelle. Tila (Uusi), Vaihe (0) ja Lisätty täyttyvät itsestään.

- **Pakolliset:** Yritys, Sähköposti ja Havainto. Verkkosivu tarvitaan sivustotarkistukseen ja muuttujaan `{{sivusto}}`.
- **Segmentti:** *Matkailu* saa matkailun viestipohjan. Tyhjä tai *Yleinen* saa yleisen pohjan.
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
3. Se tarkistaa jonon seuraavien 20 liidin sivustot.
4. Arkipäivinä se lähettää ensin erääntyneet jatkoviestit samaan ketjuun ja sitten uudet avaukset kiintiön verran. Kiintiö näkyy kojelaudalla.
5. Se valitsee päivän LinkedIn-listan (5 kpl) ja soittolistan (3 kpl).
6. Se lähettää koosteen *Raporttien osoite* -asetuksen osoitteeseen. Maanantaisin mukana on viikkoraportti. Vastaukset ja virheet tulevat aina tietoon.

Sarja: **avaus → 3 arkipäivän päästä muistutus → 5 arkipäivän päästä lopetusviesti → 5 arkipäivän päästä tila *Ei vastausta***.
Odotusajat ja tekstit voi muuttaa Viestipohjat-välilehdellä.

## Mitä sinä teet (20–30 min päivässä)

- **Vastaukset:** vastaa Gmailissa ja päivitä liidin tila (*Palaveri*, *Ei kiinnosta* tai *Älä ota yhteyttä*). Kun palaveri on sovittu, valitse liidin rivi ja valikosta **Siirrä valittu liidi kauppoihin**.
- **LinkedIn-lista:** lähetä kutsu ilman viestiä. Kun kutsu on hyväksytty, lähetä koosteen valmis viesti ja päivitä *LinkedIn-tila*.
- **Soittolista:** soita ja kirjaa tulos *Soitto*-sarakkeeseen.
- **Kaupat:** pidä *Vaihe*, *Seuraava askel* ja *Seuraava pvm* ajan tasalla. Kun kauppa on voitettu, täytä **1. lasku kk**.
  Jos laskutetaan 50 % tilauksesta ja 50 % julkaisusta, täytä myös **Loppulasku kk**. Kuukausimaksu kirjataan **Kk-tulo €** -sarakkeeseen.
- **Laskut:** kun lasku on lähtenyt, vaihda tilaksi *Lähetetty* ja korjaa summa toteutuneeksi, esim. Markkinointiboostin provisio. Vain *Lähetetty* ja *Maksettu* lasketaan laskutetuksi.

## Kojelaudan luvut

| Luku | Mitä se tarkoittaa |
|---|---|
| Varmistettu | Toistuvat tulot ja voitetut kaupat, jotka laskutetaan tässä kuussa |
| Putki, painotettu | Avoimet kaupat kerrottuna vaiheen todennäköisyydellä (Liidi 10 % … Neuvottelu 75 %) |
| Ennuste | Varmistettu + putki |
| Laskutettu | Laskut-välilehden *Lähetetty*- ja *Maksettu*-rivit |
| Avoin vaje | Tämän ja ensi kuun vaje putken jälkeen. Kylmä kontakti ehtii laskutukseen yleensä vasta ensi kuussa, siksi mukana on kaksi kuukautta. |
| Kiintiö | Avoin vaje ÷ keskikauppa ÷ palaveri→kauppa ÷ kontakti→palaveri ÷ arkipäivät ensi kuun loppuun, josta vähennetään jo kesken olevat. Pysyy minimin ja maksimin välissä. |
| Konversiot | Oletukset 4 % ja 30 % vaihtuvat toteutuneisiin, kun kontakteja on 60 ja suljettuja kauppoja 5 |

Arkipäivistä on jätetty pois viikonloput ja Suomen arkipyhät: vappu, juhannusaatto ja jouluaatto lasketaan myös pyhiksi.

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

## Toimitettavuus ja pelisäännöt

- **Erillinen lähetysdomain.** Kylmät viestit kannattaa lähettää omasta domainista ja postilaatikosta, ei päädomainista. Asenna moottori sen tilin taulukkoon. Laita domainille SPF, DKIM ja DMARC kuntoon ja lämmitä laatikkoa 2–3 viikkoa ennen kuin tahti nousee yli 10 viestin päivässä.
- **Pelkkä teksti.** Pohjat on kirjoitettu ilman linkkejä ja liitteitä, koska ne heikentävät avausviestin perillemenoa.
- **B2B-pelisäännöt.** Lähetä vain yritysten työosoitteisiin, ja viestin pitää liittyä vastaanottajan työtehtävään. Jokaisessa avauksessa on helppo tapa kieltäytyä ("vastaa ei kiitos"). Kun joku kieltäytyy, aseta tilaksi *Älä ota yhteyttä*.
- **LinkedIn pysyy käsityönä.** Kone ei koske LinkedIniin, koska LinkedInin käyttöehdot kieltävät automaation ja tili voidaan jäädyttää. Kone antaa listan ja tekstin, sinä klikkaat.
- **Määrät.** Asetusten katto on 40 viestiä päivässä (uudet ja jatkoviestit yhteensä). Se on selvästi Googlen päivärajojen alla.

## Muutokset

- Sarakkeita saa siirtää ja lisätä. **Otsikoita ei saa nimetä uudelleen**, koska kone etsii sarakkeet niiden perusteella.
- Kojelauta kirjoitetaan uudelleen joka muokkauksella, joten älä kirjoita sinne. Kaupat-välilehden *Tod. %* on kaava.
- Uusi koodiversio: avaa Apps Script, korvaa koodi ja tallenna. **asenna-funktiota ei ajeta uudelleen.**
- Ajon kellonaika: muuta *Ajo klo* ja valitse valikosta **Asenna ajastus uudelleen**.
- Kaupan vaiheita voi lisätä Asetukset-välilehden E–F-sarakkeisiin. *Voitettu* ja *Hävitty* pitää säilyttää nimillään.

## Kehittäjälle

- Laskenta, sekvenssien päätökset, sivustoanalyysi, viestien muodostus ja kooste ovat puhtaita funktioita
  (`laske`, `suunnittele`, `valitseTehtavat`, `analysoiSivu`, `renderoiViesti`, `rakennaMime`, `rakennaKooste`, `laskutusrivit`).
  Google-palveluja kutsuvat vain ohuet kääreet niiden ympärillä.
- Testit: `node --test "laskutusmoottori/testit/*.test.js"`. Yksikkötestit kattavat puhtaat funktiot. Integraatiotesti ajaa asennuksen,
  aamuajot, vastauksen, jatkoviestin, luonnostilan ja kauppaan siirron muistinvaraista Sheets- ja Gmail-jäljitelmää vasten.
- Gmail-viestit lähtevät Gmail API:n kautta (`Gmail.Users.Messages.send` ja `Drafts.create` `threadId`:llä ja In-Reply-To-otsakkeella),
  jotta jatkoviestit pysyvät samassa ketjussa myös vastaanottajalla.
