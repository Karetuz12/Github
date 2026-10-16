# SkyView 3D-kartta – jatko-ohje (handoff)

Tämä on muistio uutta Claude-keskustelua varten. Liitä tämä tiedosto tai sen polku uuteen
keskusteluun, joka on auki omalla koneella repon `Karetuz12/Github` kopiossa.

## Tavoite

Oma 3D-aluekartta SkyView Igloo Resortille omaan osoitteeseen (esim. `kartta.skyviewigloos.com`),
mapmystay.co:n tyyliin: vieras näkee koko alueen, voi kääntää ja zoomata näkymää ja avata kohteita.

## Nykytila (16.10.2026)

- Koodi: kansio `skyview-kartta/` (three.js + Vite + TypeScript, ei taustapalvelinta). Käyttö ja
  muokkaus: `skyview-kartta/README.md`.
- Haarat: työ tehty haarassa `claude/magical-maxwell-tyu97i`, yhdistetty repon oletushaaraan
  `claude/hopeful-bohr-f21rsr` (PR #1). Repossa ei ole `main`-haaraa.
- Vercel: projekti **skyviewkartta** (tiimi "marketing-4208's projects"), tuotanto seuraa haaraa
  `claude/hopeful-bohr-f21rsr`. Ensimmäinen julkaisu näytti 404, koska Root Directory jäi repon
  juureen. Korjaus: repon juuren `vercel.json` rakentaa `skyview-kartta`-kansion
  (`installCommand`/`buildCommand`/`outputDirectory`). Jos sivu näyttää vielä 404:
  Vercel → skyviewkartta → Settings → Build and Deployment → Root Directory = `skyview-kartta`,
  Framework = Vite → Save → Deployments → Redeploy.
- Pilvi-istunnon Vercel-yhteydellä ei ollut oikeutta luoda projektia eikä nähdä sitä (403/404).
  Omalta koneelta: `npx vercel login` → `npx vercel link` → `npx vercel --prod` toimii omilla oikeuksilla.

## Mitä kartassa on

- Tiestö ja kaikkien 50 iglun + 31 mökin sijainnit luettu opastekartta-PDF:stä
  (`tools/extract_layout.py` → `src/layout.json`, `src/assets/roads.png`). 1 pt ≈ 0,25 m.
- Iglut (`src/models.ts`, `iglooParts`): kaikki ulkoa samanlaisia. Neliön muotoinen 6 × 6 m
  kaksikerroksinen runko paalujen päällä, lasikupolimakuuhuone ulokkeena yhden sivun keskellä,
  viereisellä sivulla kapea yksikerroksinen osa, jonka katolla terassi + ulkoporeallas, ja
  vastakkaiselta sivulta pitkä sisäänkäyntisilta.
- **Kaikki lasikupolit osoittavat pohjoiseen** (käyttäjä vahvisti). Silta osoittaa itään tai länteen
  lähimmän tien mukaan; poikkeukset `src/geo.ts` → `IGLOO_ENTRY` (nyt iglu 2 = länteen).
- Mökit (soikio vasemmalla) ovat eri malli, yksikerroksisia – käyttäjän mukaan ok.
- Pysäköinti: yksi rivi autoja keula lumivalliin päin (vallin kohta opastekartan vinoviivoitus).
  Pysäköinnin ja kokoontumispaikan merkit ovat opastekartassa toisinpäin – korjattu.
- Vuorokaudenaika auringon todellisen paikan mukaan (Rovaniemi), yöllä tähdet ja revontulet.
- Vetäminen kääntää, oikea nappi / kaksi sormea siirtää, rulla / nipistys zoomaa.
- Kohdekortit (tekstit Room Infosta), haku numerolla/nimellä, opastettu kierros, suorat linkit
  `?igloo=9`, `?cabin=12`, `?place=culta`, `?tour`, `?time=22:00`.

## Käyttäjän palaute, jota on jo noudatettu

- Iglujen muoto: renderöinnit ja ilmakuvat (lasikupoli leijuu ulokkeena, ei alakerran päällä;
  terassi ei jatku lasikupolin viereen).
- "Hiotaan myöhemmin": parkkipaikan tarkka muoto ja iglujen yksityiskohdat ok karkeina toistaiseksi.

## Avoimet kysymykset / seuraavat askeleet

1. Varmista, että https://skyviewkartta.vercel.app näyttää kartan (ks. Vercel yllä). Lisää oma
   domain: Settings → Domains.
2. Kuvat korteille: kopioi Room Infon `public/images/` → `skyview-kartta/public/images/`
   (`king-hero-sm.webp`, `cabin-hero-sm.webp`, `culta.webp`, `aura.webp`).
3. Vahvistettavaa (README:n lista): iglu 50 puuttuu kartasta, "Centarius" (Centaurus?), King vs
   Suite -iglut, soikion keskiosan kohteet, kota = Aurora Kota?, latauspisteet.
4. Iglujen siltojen suunnat kannattaa tarkistaa droonikuvasta ja lisätä poikkeukset `IGLOO_ENTRY`:iin.
5. Myöhemmin: droonikuvaus tontista, päärakennuksen 3D-malli (ArchiCAD, Vertti & Co → glTF/IFC),
   Maanmittauslaitoksen korkeusmalli maastoon.

## Lähdeaineistot (käyttäjän lähettämät)

- Opastekartta: `2026_09_24_skyview-opastecombot.pdf` (sivu 1 = aluekartta). Uudempi vaalea
  kartta: igluissa 8 = Sagitta, 13 = Auriga.
- Iglujen valokuvat, arkkitehdin renderöinnit ja ilmakuvat ylhäältä (keskustelussa).
- Drive: "1) Ravintola + Spa" → AURA → Piirrustuksia (päärakennuksen pohjapiirustus, ~36 m).

## Testaus

`npm run build` (tsc + vite) ja kuvakaappaukset Playwrightilla (`?time=…&place=…`).
Yhden tiedoston esikatselu: `npm run build:single` → `dist-single/index.html`.
