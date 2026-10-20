# Kuvalomake – sähköpostit QR-koodilla

Asiakas skannaa oppaan QR-kortin. Ryhmänumero on valmiina, joten asiakas kirjoittaa vain sähköpostiosoitteensa.
Aamulla Google Sheetsin **Aamu**-välilehdellä ovat edellisen illan osoitteet ryhmittäin valmiina kopioitavaksi.

Skripti `kuvalomake.gs` luo kaiken kerralla omaan Drive-kansioon **Book Lapland – Kuvalomake**:

| Mitä | Missä |
|---|---|
| Asiakkaiden lomake (englanniksi) | Google Forms |
| Vastaukset ja aamun koonti | Google Sheets: välilehdet *Aamu* ja *Vastaukset* |
| QR-kortit ryhmille 1–20 ja yleiskortti ilman ryhmää | Google Docs, neljä korttia A4-sivulle |
| Automaattinen poisto | Joka yö klo 04 poistetaan yli 30 päivää vanhat osoitteet |

## Asennus (n. 5 min, kerran)

1. Kirjaudu Googleen tunnuksella **marketing@booklapland.fi** ja avaa **https://script.new**.
2. Poista editorissa valmiina oleva teksti. Liitä tilalle koko `kuvalomake.gs`:n sisältö ja tallenna (Ctrl+S). Nimeksi käy vaikka "Kuvalomake".
3. Valitse yläpalkin funktiovalikosta **asenna** ja paina **Suorita**.
4. Google kysyy käyttöoikeuksia: **Review permissions** → valitse tili.
   Jos tulee varoitus "Google hasn't verified this app", valitse **Advanced** → **Go to Kuvalomake (unsafe)** → **Allow**.
   Varoitus tulee, koska skripti on teidän oma eikä Googlen tarkastama. Se on normaalia.
5. Odota noin minuutti, kunnes alalaidan lokiin tulee **Valmis!** ja linkit.

Avaa lokin linkistä taulukko. Aamu-välilehden oikeasta reunasta löytyvät linkit lomakkeeseen, QR-kortteihin ja kansioon.

**Lopuksi:**
- Tulosta QR-kortit (Docs: Tiedosto → Tulosta), leikkaa ja laminoi. Jokaisella oppaalla on oman ryhmänsä kortti.
- Jaa taulukko kuvia lähettäville kollegoille (Jaa-painike). Lomaketta ei tarvitse jakaa.
- Kokeile kerran itse: skannaa kortti puhelimella, täytä lomake ja katso, että osoite näkyy *Vastaukset*-välilehdellä.

## Aamulla

1. Avaa taulukko → **Aamu**-välilehti. Se näyttää automaattisesti eilisen illan retket.
   - Klo 06 asti tulleet vastaukset lasketaan edellisen illan retkeen, joten revontuliretket puolenyön yli pysyvät kasassa.
   - Toisen päivän saat näkyviin kirjoittamalla päivämäärän keltaiseen soluun **B1**. Kun tyhjennät solun, eilinen palaa näkyviin.
2. Jokaisella ryhmällä on yksi rivi: osoitteiden määrä ja osoitteet pilkuilla eroteltuina. Saman osoitteen tuplat ja kirjainkoko on siivottu.
3. Kopioi ryhmän solu sähköpostin **piilokopio (BCC)** -kenttään ja lähetä linkki ryhmän kuviin, esim. jaettuun Drive-kansioon. Yksi viesti per ryhmä.
   Piilokopio on tärkeä, jottei asiakkaiden osoitteet näy toisilleen.

## Muutokset

Muutokset tehdään skriptin alussa olevaan `ASETUKSET`-kohtaan:

- **Ryhmiä enemmän tai vähemmän kuin 20:** muuta `ryhmia` ja aja funktio **teeQrKortit**. Uudet kortit tulevat kansioon ja vanha korttitiedosto siirtyy roskakoriin.
- **Tietosuojaselosteen linkki lomakkeeseen:** täytä `tietosuojaLinkki`. Lomakkeen tekstiä voi muokata myös suoraan Formsissa (linkki Aamu-välilehdellä).
- **Säilytysaika:** `sailytysPaivia`. Muuta tällöin myös lomakkeen tekstiä, jossa lukee "within 30 days".

`asenna`-funktiota ei voi ajaa toista kertaa, joten tuplia ei synny vahingossa.

## Tietosuoja lyhyesti

- Lomakkeessa kerrotaan, että osoitetta käytetään vain kuvien lähettämiseen ja se poistetaan 30 päivän kuluessa. Ajastettu poisto pitää lupauksen: se poistaa osoitteet sekä taulukosta että lomakkeen omista vastauksista.
- Uutiskirjeeseen näitä osoitteita **ei saa** lisätä. Jos uutiskirjelupa halutaan kerätä samalla, lomakkeeseen lisätään erillinen vapaaehtoinen ruksi, joka on oletuksena tyhjä.
- QR-kuvat tehdään quickchart.io-palvelussa (varalla api.qrserver.com). Sinne lähtee vain lomakkeen linkki, ei asiakastietoja.
