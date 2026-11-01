# Pure Groundwork – sivusto

Next.js-sivusto. Kaikki tekstit, saavutukset, hinnat ja yhteystiedot ovat yhdessä tiedostossa: [`lib/sisalto.ts`](lib/sisalto.ts).
Suunnitelma: [SUUNNITELMA.md](SUUNNITELMA.md). Markkinointi, videot ja mainoskuvat: [MARKKINOINTI.md](MARKKINOINTI.md).

## Täytettävät tiedot

Tiedostossa `lib/sisalto.ts` on merkintä `TÄYTÄ` seuraavissa kohdissa:

- **Henkilö:** nimi, etunimi, sähköposti ja LinkedIn
- **Muotokuva:** tallenna kuva nimellä `public/kuvat/muotokuva.jpg` ja aseta `kuva: '/kuvat/muotokuva.jpg'`.
  Ilman kuvaa työpöydällä näkyy merkki ja mobiilissa ei mitään.
- **Yritys:** laskuttava yhtiö, Y-tunnus ja sivuston osoite
- **Ajanvarauslinkki** (`varauslinkki`): Google-kalenterin ajanvaraussivu. Tyhjänä painikkeet vievät yhteydenottolomakkeelle.
- **Referenssit:** lisää vain asiakkaat, joiden nimen saa mainita. Osio näkyy vasta, kun listassa on jotain.
- **Logo:** väliaikainen merkki (kolme maakerrosta) on tiedostossa `components/Logo.tsx`. Oikean logon voi tallentaa nimellä `public/logo.svg` ja vaihtaa komponenttiin.

## Ilme

- **Nordic Hostin brändi-ilme** (nordichost.fi): Inter-fontti tiiviillä display-otsikoilla, tumma navy ja sähkönsininen korostus,
  valkoiset pillipainikkeet, siniset valojuovat heron taustalla, lasikortit tummalla ja vaaleat sisältöosiot. Muita tunnusmerkkejä:
  - yhdysviiva ympyrällä väitteen ympärillä
  - UKK-haitari jakoviivoin ja pyöreillä +-painikkeilla
  - logo, jossa ensimmäinen sana on lihavoitu (**Pure**Groundwork, kuten **Nordic**Host)
- **Premium-elementit:**
  - kelluva lasiyläpalkki ja megavalikko
  - kallistuva havainnekuva, vaihtuva sana ja vierityksen mukana syttyvä väite
  - pinoutuvat palvelukortit, vertailu, prosessi animoidulla viivalla ja bento-ruudukko
  - iso CTA ja alapalkin jättiteksti
- **Teemat:** sivu on oletuksena tumma. Osio saa vaalean teeman luokalla `vaalea`, ja elementti tumman teeman vaalean osion sisällä luokalla `tumma`.
  Kaikki värit ovat muuttujia tiedoston `app/globals.css` alussa, joten väri vaihdetaan yhdestä paikasta.
- Animaatiot pysähtyvät, jos kävijä on pyytänyt laitteeltaan vähemmän liikettä. Ilman JavaScriptiä kaikki sisältö näkyy.
- **Alustojen logot** tulevat `simple-icons`-paketista (`components/LogoNauha.tsx`). Lista on tiedostossa `lib/sisalto.ts` (`alustat`).
- **Asiakkaat** (`asiakkaat`) näkyvät tekstilogoina. Tarkista kirjoitusasu ja nimen käyttölupa.
- **Kaikki tekstit** ovat tiedostossa `lib/sisalto.ts`. Palvelusivut syntyvät `palvelut`-listasta: uusi palvelu listaan = uusi sivu, valikkokohta,
  sivukarttarivi ja jakokuva automaattisesti.

## Sivut

| Polku | Sisältö |
|---|---|
| `/` | Hero, logonauha, väite, palvelupino, luvut, vertailu, prosessi, toimialat, esittely, hinnat, UKK, CTA |
| `/palvelut` | Kaikki palvelut, prosessi ja vertailu |
| `/palvelut/groundwork` · `/verkkosivut` · `/mainonta` · `/sparraus` | Kenelle, ongelmat, sisältö, prosessi, hinnat, UKK, muut palvelut |
| `/hinnat` | Koko hinnasto ja maksuehdot |
| `/kokemus` | Luvut, hyödyt, toimialat, ura ja alustat |
| `/minusta` | Esittely, lainaus, aikajana ja työtapa |
| `/yhteys` | Lomake, yhteystiedot ja seuraavat askeleet |
| `/tietosuoja` | Tietosuojaseloste |

Vanhat osoitteet (`/groundwork`, `/sivustot`, `/kumppanuus`, `/sparraus`, `/hinnasto`) ohjataan pysyvästi (308) uusille sivuille (`next.config.ts`).

## SEO ja nopeus

- **Metatiedot:** jokaisella sivulla oma title (enintään noin 60 merkkiä), meta description (130–155 merkkiä), kanoninen osoite, Open Graph ja Twitter-kortti (`lib/seo.ts`).
- **Otsikkorakenne:** yksi H1 per sivu, H2 osioille ja H3 korteille ilman tasohyppyjä.
- **Rakenteinen data (JSON-LD):** ProfessionalService, Person, WebSite (kaikilla sivuilla), Service ja Offer (palvelusivut), FAQPage (UKK-osiot) ja BreadcrumbList (murupolut).
- **Sivukartta** `/sitemap.xml`, **robots** `/robots.txt` (esikatselut piilossa, tuotanto näkyvissä), **manifest**, **favicon** ja **Apple-ikoni**.
- **Jakokuvat** (1200 × 630) syntyvät automaattisesti: etusivulle ja jokaiselle palvelusivulle oma (`app/opengraph-image.tsx`, `lib/og.tsx`).
- **Nopeus:**
  - kaikki sivut staattisia
  - CSS upotettu HTML:ään
  - yksi fonttiperhe (Inter) omalta palvelimelta
  - animaatiot pelkällä CSS:llä, raskaat taustasumennukset vain yläpalkissa ja valikossa
  - LCP-teksti näkyy heti ensimmäisessä piirrossa
  - CLS 0
- **Tietoturvaotsakkeet:** nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy ja tuotannossa HSTS.

Lighthouse (mobiili, tuotantotila, paikallinen palvelin):

| Sivu | Suorituskyky | Saavutettavuus | Parhaat käytännöt | SEO |
|---|---|---|---|---|
| Etusivu | 93 | 100 | 100 | 100 |
| Palvelusivu (Groundwork) | 95 | 100 | 100 | 100 |
| Hinnasto | 97 | 100 | 100 | 100 |
| Yhteys | 97 | 100 | 100 | 100 |

## Yhteydenottolomake → Laskutusmoottori

1. Valitse Laskutusmoottorin taulukossa **Laskutusmoottori → Asenna verkkosivun lomake**. Saat salaisuuden ja ohjeen.
2. Apps Scriptissä: **Ota käyttöön → Uusi käyttöönotto → Verkkosovellus**. Valitse *Suorita käyttäjänä: Minä* ja *Käyttöoikeus: Kuka tahansa*. Kopioi web-osoite.
3. Vercel → projekti **puregroundwork** → Settings → Environment Variables:
   - `APPS_SCRIPT_URL` = web-osoite
   - `APPS_SCRIPT_SECRET` = salaisuus
   - `NEXT_PUBLIC_GTM_ID` = Tag Manager -tunnus (valinnainen, esim. `GTM-XXXXXXX`)

   Tallenna ja julkaise uudelleen.

Kysely tulee Liidit-välilehdelle segmentillä *Inbound* ja tilalla *Vastasi*, joten se ei saa kylmää sarjaa. Lisäksi saat siitä heti sähköpostin.

## Kehitys

```bash
cd puregroundwork
npm ci
npm run dev        # http://localhost:3000
npm test           # lomakkeen tarkistus
npm run typecheck
npm run build
```

## Julkaisu

Vercel-projekti **puregroundwork**, jonka Root Directory on `puregroundwork`. Jokainen push tekee esikatseluversion.

Kun domain on hankittu:

1. Lisää domain kohdassa Vercel → Domains.
2. Aseta `yritys.osoite` tiedostoon `lib/sisalto.ts`.
3. Aseta tuotantohaara.

Esikatselut ovat hakukoneilta piilossa (`robots.txt`). Tuotanto näkyy hakukoneille.
