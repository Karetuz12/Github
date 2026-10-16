# SkyView – 3D-aluekartta

Selaimessa pyörivä 3D-kartta SkyView Igloo Resortista omaan osoitteeseen (esim. `kartta.skyviewigloos.com`).
Idea mapmystay.co:n tyyliin, mutta oma toteutus: three.js + Vite, ei taustapalvelinta.

**Mitä siinä on**

- Koko alue metsineen, teineen ja rakennuksineen. Tiestö ja kaikkien 50 iglun + 31 mökin paikat
  luettu suoraan opastekartasta (`2026_09_24_skyview-opastecombot.pdf`).
- Vetäminen kääntää näkymää, oikea nappi tai kaksi sormea siirtää, rulla tai nipistys zoomaa.
- Iglut kahtena tyyppinä valokuvien mukaan: musta torni + kahdeksankulmainen lasihuone, ja kattoterassimalli poreammeineen.
- Vuorokaudenaika: liukusäädin + "Now". Valaistus lasketaan auringon oikeasta paikasta Rovaniemellä
  (sinihetki, hämärä, yö), iglut ja tievalot syttyvät pimeällä, yöllä tähdet ja revontulet (kuvitus).
- Kohteet kortteineen: vastaanotto, AURA, Culta, Safari House, kota, porot, pysäköinti, kokoontumispaikka,
  iglut, mökit. Napit soittavat, avaavat WhatsAppin tai sivun (samat numerot kuin Room Infossa).
- **Find your igloo**: haku numerolla tai nimellä (esim. `9` tai `Lyra`) → lento iglulle.
- Opastettu kierros (Tour), Explore-lista, tasot (View), kompassi, kotinäkymä.
- Toimii puhelimella (kevyempi metsä ja grafiikka automaattisesti).

**Suorat linkit** (QR-koodeihin, Room Infoon, varausvahvistuksiin):

| Linkki | Avaa |
|---|---|
| `/?igloo=9` | Iglu 9 (Lyra) |
| `/?cabin=12` | Mökki 12 |
| `/?place=culta` | Kohde id:llä (`reception`, `aura`, `culta`, `safari-house`, `hut`, `reindeer`, `parking`, `assembly`, `igloos`, `cabins`) |
| `/?tour` | Käynnistää kierroksen |
| `/?time=22:00` | Tietty kellonaika (testaukseen / esittelyyn) |

## Käyttö

```bash
npm install
npm run dev            # kehityspalvelin
npm run build          # dist/ → julkaisu (Vercel: Framework "Vite", output "dist")
npm run build:single   # dist-single/index.html: koko kartta yhtenä tiedostona esikatseluun
```

## Mistä mitäkin muutetaan

| Mitä | Missä |
|---|---|
| Kohteiden tekstit, napit, kuvat, kierros | `src/places.ts` |
| Rakennusten muodot (väliaikaiset) | `src/models.ts` |
| Metsä, tiet, valot, sijoittelu | `src/world.ts` |
| Taivas ja revontulet | `src/sky.ts` |
| Ulkoasu | `src/style.css` |
| Sijainnit opastekartasta | `npm run extract-layout -- <opastekartta.pdf>` → `src/layout.json` + `src/assets/roads.png` |

**Kuvat korteille:** kopioi Room Infon `public/images/` tähän projektiin `public/images/`.
Käytössä nyt `king-hero-sm.webp`, `cabin-hero-sm.webp`, `culta.webp` ja `aura.webp`. Jos kuvaa ei ole,
kortti näyttää kohteen kartalta.

## Vahvistettavaa (näkyy koodissa `check`-kenttinä)

1. **Iglu 50 puuttuu** opastekartasta (numerot 1–49 ja 51). Tarkoituksella?
2. Iglu 25 on kartalla **"Centarius"**. Tähdistö kirjoitetaan *Centaurus*.
3. Nimet on otettu uudemmasta (vaaleasta) kartasta: 8 = **Sagitta**, 13 = **Auriga**. Opaste-PDF:ssä
   on vielä vanhat (8 Sagittarius, joka on myös iglu 18, ja 13 Capella).
4. Mitkä iglut ovat kumpaakin tyyppiä: **torni** (lasihuone ulokkeella) vai **kattoterassi** (poreallas katolla)?
   Ja kumpi on King Igloo, kumpi Igloo Suite? Lista täytetään `src/geo.ts`:n `IGLOO_TYPES`-kohtaan.
   Siihen asti tyypit vaihtelevat kuvituksena.
5. Ovatko soikion 31 mökkiä Aurora Cabinit? Mitä soikion keskellä on (kupoli, nuotio, porot)?
6. Onko päärakennuksen viereinen "Hut with a fireplace" sama kuin Aurora Campin Aurora Kota?
7. Missä sähköautojen latauspisteet ovat?
8. Mittakaava on arvio (1 pt ≈ 0,25 m: päärakennus ~36 m arkkitehdin piirustuksessa). Sijainnit ovat
   opastekartan tarkkuudella, eivät mitattuja.

## Seuraava taso: oikea malli alueesta

Nyt rakennukset ovat yksinkertaisia palikoita, ja maasto ja metsä on generoitu. Kartan toiminnot
(kohteet, haku, kortit, kierros, aika) pysyvät samoina, kun maisema vaihdetaan tarkempaan:

1. **Droonikuvaus** koko tontista, kun rakennukset ovat valmiit. Ilmakuvat (ortokuva) kohdistavat sijainnit
   tarkasti. Riittävän monesta kuvasta saa myös 3D-mallin (fotogrammetria / Gaussian splatting).
2. **Rakennusten 3D-mallit**: päärakennus on suunniteltu ArchiCADilla (Vertti & Co). Pyydä 3D-vienti
   **glTF/GLB**-, OBJ- tai IFC-muodossa. Sama iglusta ja mökistä, jos niistä on mallit (valmistaja).
   Mallit ladataan `world.ts`:ssä palikoiden tilalle.
3. **Maasto**: Maanmittauslaitoksen avoin korkeusmalli (2 m) ja laserkeilausaineisto ovat ilmaisia.
   Niistä saa oikeat korkeuserot ja jopa puiden sijainnit ja korkeudet.
4. **Julkaisu**: Vercel tai mikä tahansa staattinen palvelin + oma aliverkkotunnus.
