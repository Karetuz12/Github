# Jatka tästä

Yhteenveto pilvikeskustelusta "Laskutuksen kasvattaminen 15 000 euroon" (1.11.2026). Tämän avulla uusi keskustelu jatkaa suoraan siitä, mihin jäätiin.

## Tavoite

Laskutus vakaasti **15 000 €/kk** ja sen jälkeen yli. Keinot:

1. **Laskutusmoottori** (`laskutusmoottori/`). Kuukausitavoitteet, ennuste, kassan ajoitus, viikoittaiset kauppatavoitteet ja sähköpostien automaatio, joka kiihdyttää tahtia, kun ollaan jäljessä.
2. **Myynti sähköpostilla.** Kolme kulmaa, 5 + 5 + 5 viestiä päivässä, ja Sparraus varalla:
   - WordPress → uusi sivusto koodilla
   - Groundwork
   - Mainonta
3. **Pure Groundwork -henkilöbrändi** (`puregroundwork/`). Oma sivusto, joka myy konsultointia ja sivustoja ja tukee kylmäviestejä.

Tausta:
- **Nykyiset tulot:** Book Lapland / Skyview / hosting noin 8 000 €/kk, Markkinointiboosti-provisio noin 2 000 €, yksi konsultointiasiakas 1 000 € ja verkkosivuprojekteja.
- **Kehitys:** kaksi kehittäjää tekee toteutukset, ja käyttäjä myy ja suunnittelee.
- **Booking engine** on mahdollinen isompi tuote, 5 000–10 000 €/kk asiakasta kohden.

## Laskutusmoottori: valmis

- **Toiminnot:**
  - Apps Script Google Sheetsissä, kaikki yhdessä tiedostossa `laskutusmoottori.gs`
  - kaupan maksuerät (50/50, kolmessa osassa, käsin)
  - viikkoseuranta ja kumulatiivinen näkymä
  - kalenterin palaverit
  - PageSpeed- ja sivuanalyysi (WordPress, pikselit, GA4, GTM)
  - segmenttikohtaiset viestipohjat ja jatkoviestit samassa ketjussa
  - verkkosivun lomake (`doPost`) liidiksi
- **Ohjeet:** `OHJE.md`, `STRATEGIA.md` ja `viestipohjat/VIESTIPOHJAT.md` (testi pitää pohjat synkassa koodin kanssa).
- **Testit:** `node --test "laskutusmoottori/testit/*.test.js"`, 50/50 menee läpi.
- **Kesken:** nerot.fi-ilmoitusten automaatio (Chrome-haku kolmen päivän välein ja tarjousluonnos). Tarvitaan esimerkki ilmoitussähköpostista.

## Pure Groundwork -sivusto: tila

Next.js 15.5, React 19 ja TypeScript. Kaikki sivut ovat staattisia.

- **Sivut:** `/` · `/palvelut` · `/palvelut/{groundwork, verkkosivut, mainonta, sparraus}` · `/hinnat` · `/kokemus` · `/minusta` · `/yhteys` · `/tietosuoja` · 404.
- **SEO:**
  - jokaisella sivulla title (≤ ~60 merkkiä), description, canonical, Open Graph ja Twitter
  - yksi H1 per sivu
  - JSON-LD: ProfessionalService, Person, WebSite, Service/Offer, FAQPage ja BreadcrumbList
  - sitemap, robots (esikatselut piilossa, tuotanto näkyvissä), manifest, ikonit ja automaattiset jakokuvat
- **Nopeus (Lighthouse, mobiili):** etusivu 94 ja palvelusivu 96. Saavutettavuus, parhaat käytännöt ja SEO 100 tuotantotilassa. CLS 0.
- **Lomake** `/api/yhteys` → Laskutusmoottorin `doPost`. Vercelin ympäristömuuttujat ovat `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` ja valinnainen `NEXT_PUBLIC_GTM_ID`.

### Ilme ja käyttäjän palaute (tärkeä)

| Versio | Palaute |
|---|---|
| v1–v2: tumma lasi, oranssi korostus | "Liian basic." |
| v3: premium-konsultointitemplatejen taso | Kelpasi pohjaksi. |
| Nordic Host -ilme: sähkönsininen, valojuovat, valkoiset osiot | "Värit liian räikeät", "liquid glass on jees", "ei liian SaaS-mainen". |
| **Nykyinen: hillitty** | Käyttäjä ei ole vielä kommentoinut. Jos värit ovat vieläkin liikaa, vaimenna lisää. |

Nykyisessä hillityssä versiossa:
- **Värit:** vaimea muste-navy (`#0a0e1a`), harmaansininen korostus (`#5d74b0` / `#aebbdc`) ja luonnonvalkoiset sisältöosiot (`#f5f5f2`).
- **Liquid glass** tummilla alueilla: taustasumennus ja valoreunus.
- **Pois:** kojelautakuvat, UI-mallit, vihreät checkboxit ja hehkut.
- **Luvut:** saavutusluvut heron lasipaneelissa.
- **Palvelut:** palvelukorteissa faktapaneelit (hinta, kesto, lopputulos ja sopimus).
- **Fontti:** Inter optisella koolla, kuten Nordic Hostilla.

Benchmarkit ovat **nordichost.fi** (käyttäjän oma yritys: brändi-ilme on tärkeä, mutta kuvat eivät saa olla IT- tai palvelinmaisia) ja **nordicgrowthmedia.fi**. Kuvat käyttäjä lähetti puhelimesta. Pilvi-istunnon verkko esti näiden sivujen haun.

### Sisältö

- **Saavutukset:**
  - noin 1 000 projektia
  - noin 5 M€ mainosbudjetteja
  - 50+ M€ mitattua myyntiä
  - 250 000+ liidiä
  - 25+ autoliikettä ja 30–40 suoramyyntiyritystä
  - oma toimisto 7 vuotta, parhaimmillaan 25 henkeä
- **Asiakkaat:** iSkates ja X-Beeli. Kirjoitusasu ja nimen käyttölupa pitää tarkistaa.
- **Hinnat:**
  - Groundwork-katselmus 490 €
  - kunnostus alkaen 1 900 €
  - sivustot 1 000 / 1 500–2 500 / 3 000–4 000 €
  - mainonta 490–990 €/kk
  - sparraus 600–1 200 €/kk
  - sparrauspalaveri 790 €
  - ylläpito alkaen 149 €/kk
  - pikatyöt alkaen 200 €

## Avoimet asiat

1. **Käyttäjältä tarvitaan** (`TÄYTÄ` tiedostossa `puregroundwork/lib/sisalto.ts`):
   - nimi
   - muotokuva (`public/kuvat/muotokuva.jpg`)
   - LinkedIn
   - yhtiö ja Y-tunnus
   - domain
   - ajanvarauslinkki
   - logot (Google Drivessa)
2. **Vercel:** Claude-liittimellä ei ollut oikeutta luoda projektia (403). Käyttäjä tekee sen itse: Vercel → **Add New → Project → Import** repo `Karetuz12/Github`. Root Directory on `puregroundwork` ja tuotantohaara `claude/billing-growth-strategy-6qg1up` (tai main yhdistämisen jälkeen).
3. **Nordic Hostin tarkat brändivärit**, jos käyttäjä haluaa ne. Värit vaihtuvat `app/globals.css`:n alusta.
4. **nerot.fi-automaatio:** odottaa esimerkkiä ilmoitussähköpostista.
5. **Videot ja mainoskuvat:** suunnitelma on tiedostossa `puregroundwork/MARKKINOINTI.md`.

## Ulkoasun tarkistaminen

Kansiossa `puregroundwork/tyokalut/` on skriptit, jotka ottavat kuvakaappaukset vierittäen ja tarkistavat SEO-tiedot. Ne vaativat Playwrightin (`npm i -D playwright && npx playwright install chromium`) ja käynnissä olevan tuotantopalvelimen portissa 3100:

```bash
cd puregroundwork
npm run build && npx next start -p 3100 &
node tyokalut/ruudut.cjs / 1440 etusivu 900       # työpöytä
node tyokalut/ruudut.cjs / 390 mobiili 760        # mobiili
node tyokalut/seo-tarkistus.mjs                   # title, description, H1, JSON-LD
```
