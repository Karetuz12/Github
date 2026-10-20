# Revontulikuvat – sähköpostit QR-koodilla

Revontuliretken asiakas skannaa oppaan QR-kortin ja päätyy Book Laplandin omalle sivulle.
Ryhmänumero on sivulla valmiina, joten asiakas kirjoittaa vain sähköpostiosoitteensa.
Osoitteet tallentuvat Google Sheetsiin. Aamulla **Aamu**-välilehdellä ovat edellisen illan osoitteet ryhmittäin
valmiina kopioitavaksi piilokopio (BCC) -kenttään.

```
Asiakkaan puhelin ──► kuvat.booklapland.fi/7 (Next.js, Vercel) ──► Google Apps Script ──► Google Sheets
                                                                                            ├─ Vastaukset (kaikki rivit)
Oppaan QR-kortti ◄── kuvat.booklapland.fi/kortit (tulostettava A4)                         └─ Aamu (eilinen ryhmittäin)
```

## Mitä sivulla on

- **Asiakassivu** `/7`, `/12` jne. Numero tulee QR-kortista. Pelkällä osoitteella `/` asiakas kirjoittaa ryhmänumeron itse.
  - Tumma revontuli-ilme. Tumma myös siksi, ettei kirkas näyttö pilaa pimeänäköä retkellä.
  - Kielet: englanti, suomi, saksa, ranska, espanja, italia ja kiina. Kieli valitaan puhelimen kielen mukaan, ja
    asiakas voi vaihtaa sitä.
  - Kirjoitusvirheiden tunnistus: `anna@gmial.com` → "Did you mean anna@gmail.com?"
  - Kiitosnäkymä, josta voi lisätä toisen osoitteen (esim. perheen muut jäsenet).
  - Tietosuojateksti: osoite poistetaan 30 päivän kuluessa, ja ajastettu poisto huolehtii siitä.
- **QR-kortit** `/kortit`: ryhmät 1–20 ja yleiskortti, neljä A4-sivulle. Tulosta-painike on sivun ylälaidassa.
  - Muut ryhmät: `/kortit?alku=21&loppu=40` tai nimetyt ryhmät `/kortit?ryhmat=A1,A2,B1`.
- **Roskapostisuoja**: piilokenttä botteja varten. Lisäksi Google Sheetsiin pääsee kirjoittamaan vain salasanalla.

## Käyttöönotto (kerran, n. 20 min)

### 1. Google Sheets ja Apps Script (marketing@booklapland.fi)

1. Avaa **https://script.new** ja anna projektille nimi, esim. "Revontulikuvat".
2. Liitä editoriin koko `apps-script/backend.gs` olemassa olevan tekstin tilalle ja tallenna (Ctrl+S).
3. Valitse funktiovalikosta **asenna** ja paina **Suorita**. Hyväksy käyttöoikeudet. Jos tulee varoitus "Google hasn't verified
   this app", valitse **Advanced → Go to Revontulikuvat (unsafe) → Allow**. Varoitus tulee, koska skripti on teidän oma.
4. Lokiin tulee taulukon linkki ja **APPS_SCRIPT_SECRET**-salasana. Kopioi salasana talteen.
   Jos salasana katoaa, aja funktio `naytaSalasana`.
5. Paina oikealta ylhäältä **Ota käyttöön → Uusi käyttöönotto** (Deploy → New deployment).
   - Tyyppi (rataskuvake): **Verkkosovellus / Web app**
   - Suorita käyttäjänä: **Minä** (marketing@booklapland.fi)
   - Kenellä on käyttöoikeus: **Kuka tahansa / Anyone**
   - Paina **Ota käyttöön** ja kopioi **verkkosovelluksen URL** (päättyy `/exec`).

   "Kuka tahansa" on välttämätön, koska Vercel lähettää ilmoittautumiset ilman Google-kirjautumista.
   Ilman salasanaa kirjoitus ei silti onnistu, eikä tällä osoitteella pääse lukemaan mitään.

### 2. Vercel

1. Vercel → **Add New → Project** → valitse repo **Karetuz12/Github**.
2. **Root Directory**: `revontulikuvat`. Framework tunnistuu automaattisesti (Next.js).
3. **Environment Variables**:
   | Nimi | Arvo |
   |---|---|
   | `APPS_SCRIPT_URL` | vaiheen 1.5 osoite (`…/exec`) |
   | `APPS_SCRIPT_SECRET` | vaiheen 1.4 salasana |
   | `SITE_URL` | sivun lopullinen osoite, esim. `https://kuvat.booklapland.fi` (QR-kortteja varten) |
   | `NEXT_PUBLIC_PRIVACY_URL` | tietosuojaselosteen osoite (vapaaehtoinen, näkyy sivun alalaidassa) |
4. **Deploy**.
5. Repossa ei ole `main`-haaraa, joten tarkista: Settings → Git → **Production Branch** = `claude/hopeful-bohr-f21rsr`.

### 3. Oma osoite (tärkeä)

Teidän Vercel-tiimissä on päällä **Vercel Authentication**, joka kysyy `*.vercel.app`-osoitteissa Vercel-kirjautumista.
Asiakkaat eivät pääse sen ohi. Oma osoite ohittaa suojauksen, ja se näyttää asiakkaalle muutenkin virallisemmalta:

1. Vercel-projekti → Settings → **Domains** → lisää esim. `kuvat.booklapland.fi`.
2. Lisää domainin DNS-asetuksiin Vercelin näyttämä tietue (yleensä CNAME `kuvat` → `cname.vercel-dns.com`).
3. Aseta `SITE_URL` = `https://kuvat.booklapland.fi` ja tee Redeploy.

### 4. Testaa ennen ensimmäistä retkeä

1. Avaa `https://kuvat.booklapland.fi/7` puhelimella, täytä oma osoitteesi ja lähetä.
2. Tarkista, että rivi tuli taulukon **Vastaukset**-välilehdelle.
3. Avaa `https://kuvat.booklapland.fi/kortit`, tulosta, leikkaa ja laminoi kortit.
4. Skannaa yksi tulostettu kortti ja tarkista, että sivu aukeaa oikealla ryhmänumerolla.

## Aamulla

1. Avaa taulukko → **Aamu**. Siinä näkyvät eilisen illan retket.
   - Klo 06 asti tulleet lasketaan edellisen illan retkeen, joten puolenyön yli menevät retket pysyvät yhdessä.
   - Toisen päivän saat näkyviin kirjoittamalla päivämäärän keltaiseen soluun **B1**. Tyhjennä solu palataksesi eiliseen.
2. Kopioi ryhmän rivin osoitteet sähköpostin **piilokopio (BCC)** -kenttään ja lähetä linkki ryhmän kuviin.
   Piilokopio on tärkeä, jottei asiakkaiden osoitteet näy toisilleen.

Taulukon voi jakaa kuvia lähettäville kollegoille (Jaa-painike).

## Muokkaaminen

| Mitä | Missä |
|---|---|
| Brändivärit | `app/globals.css`, ylin `:root`-lohko (`--bl-brand` = painikkeen vihreä jne.) |
| Logo | Lisää tiedosto `public/logo.svg` (tai .png) ja aseta `lib/brand.ts` → `logo: '/logo.svg'`. Siihen asti logon paikalla on tekstilogo "BOOK LAPLAND". |
| Tekstit ja kielet | `lib/i18n.ts`. Uusi kieli lisätään `LANGS`-listaan ja `STRINGS`-taulukkoon. |
| Säilytysaika | `lib/brand.ts` (`retentionDays`, näkyy asiakkaalle) **ja** `apps-script/backend.gs` (`sailytysPaivia`, itse poisto) |
| QR-korttien ulkoasu | `app/kortit/page.tsx` ja `app/kortit/kortit.css` |

Muutokset sivuun julkaistaan pushaamalla repoon, jolloin Vercel julkaisee ne automaattisesti.
Jos `backend.gs` muuttuu, liitä uusi versio Apps Script -editoriin ja valitse **Ota käyttöön → Hallinnoi käyttöönottoja →
muokkaa (kynä) → Versio: Uusi versio → Ota käyttöön**. Osoite pysyy samana.

## Kehitys omalla koneella

```bash
cd revontulikuvat
npm install
cp .env.example .env.local   # täytä APPS_SCRIPT_URL ja APPS_SCRIPT_SECRET
npm run dev                  # http://localhost:3000/7
npm test                     # sähköpostin, ryhmän ja kielen tunnistuksen testit
```

## Huomioita

- Kansiossa `kuvalomake/` on aiempi Google Forms -versio. Sitä ei tarvita, jos tämä otetaan käyttöön.
- Kuvien lähetyksen voisi myöhemmin automatisoida: aamulla liitetään ryhmän kuvalinkki ja sivu lähettää jokaiselle asiakkaalle
  oman Book Lapland -tyylisen sähköpostin hänen omalla kielellään. Silloin BCC-kopiointia ei tarvita.
