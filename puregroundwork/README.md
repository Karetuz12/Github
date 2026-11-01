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
