# Ohjeet Claudelle tässä repossa

Lue ensin [JATKA-TASTA.md](JATKA-TASTA.md). Siinä on koko tilanne, tehdyt päätökset ja avoimet asiat.

## Käyttäjä ja tapa tehdä töitä

- Puhu ja kirjoita suomeksi. Koodin nimet, kommentit ja dokumentaatio ovat suomeksi.
- Käyttäjä haluaa, että asiat tehdään valmiiksi asti. Älä kysele turhaan. Kysy vain, jos päätös on oikeasti hänen.
- Älä keksi referenssejä, asiakaspalautteita tai lukuja. Käytä vain tiedostossa `puregroundwork/lib/sisalto.ts` olevia tietoja.
- Uusista sivustoista sanotaan "koodilla tehty". Tekniikkaa (Next.js tms.) ei mainita asiakkaille. Uusia WordPress-sivuja ei tehdä.
- Myynti tehdään sähköpostilla. Kylmäsoittoja ei tehdä.

## Projektit

| Kansio | Mikä |
|---|---|
| `laskutusmoottori/` | Google Sheets + Apps Script: tavoitteet, ennuste, kassa, viikkoseuranta ja sähköpostien automaatio. |
| `puregroundwork/` | Pure Groundwork -henkilöbrändin sivusto (Next.js 15, React 19, TypeScript). |
| Muut kansiot | Aiempia Book Lapland / Skyview -töitä. Älä muuta niitä, ellei pyydetä. |

## Komennot

```bash
# Laskutusmoottorin testit (repon juuressa)
node --test "laskutusmoottori/testit/*.test.js"

# Sivusto
cd puregroundwork
npm ci
npm run dev        # http://localhost:3000
npm test
npm run typecheck
npm run build
```

Aja aina testit, tyyppitarkistus ja build ennen committia. Ulkoasumuutokset tarkistetaan kuvakaappauksilla (ks. `puregroundwork/tyokalut/`).

## Sivuston rakenne lyhyesti

- **Kaikki tekstit, hinnat ja palvelut:** `puregroundwork/lib/sisalto.ts`. Palvelusivut syntyvät `palvelut`-listasta.
- **SEO-apurit:** `lib/seo.ts`. **Jaetut osiot:** `components/Osat.tsx`.
- **Tyylit:** `app/globals.css`. Värit ovat muuttujia tiedoston alussa. Teemat:
  - sivu on oletuksena tumma
  - `vaalea` tekee osiosta vaalean
  - `tumma` tekee elementistä tumman vaalean osion sisällä
- `TÄYTÄ`-merkinnät odottavat käyttäjän tietoja (nimi, kuva, yhtiö, domain).

## Git

- Työhaara: `claude/billing-growth-strategy-6qg1up`. Älä tee pull requestia, ellei käyttäjä pyydä.
- Selkeät commit-viestit. Älä laita commit-viesteihin tai koodiin mallin nimeä.
