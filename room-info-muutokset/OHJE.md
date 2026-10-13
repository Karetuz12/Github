# Room Info – muutokset 13.10.2026

Tehty pilvikeskustelussa projektin zip-kopiosta. Build ja testit (22/22) menevät läpi.
Julkaisu Verceliin pitää tehdä koneelta, jossa projekti on (`C:\Users\kparn\Desktop\skyview-room-info`).

## Mitä muuttui

| Kohta | Muutos | Huoneet |
|---|---|---|
| Keittiö | Hot plate ja air fryer pois vakiovarusteista. Lisätty: "A hot plate and an air fryer are available on request – just ask reception." | King, Suite (Cabinin keittiötekstissä niitä ei ollut) |
| Ikkunalämmitys | "Please note: the window heating does not work while the sauna is on." lisätty sekä *Heating, windows & lighting*- että *Your private sauna* -kohtaan | King, Suite (Cabinissa ei ikkunalämmitystä) |
| Revontulet | Oma hälytin (Aurora outlook + Notify me) poistettu vierassivulta. Tilalle kortti *Northern lights alerts*: suositus Northern Lights Alert -sovelluksesta (App Store / Google Play) + "kysy respalta" -WhatsApp-nappi. Taustakoodi ja hallinnan hälytystyökalu jätetty paikalleen. | Kaikki |

Tiedostot: `lib/content/defaults.ts`, `components/site/blocks.tsx`, `app/(site)/[room]/page.tsx`.

## Tehtävänanto koneen Claude Code -keskustelulle

Liitä tämä keskusteluun, joka on auki kansiossa `C:\Users\kparn\Desktop\skyview-room-info`:

```
Ota käyttöön Room Info -muutokset tiedostosta room-info-2026-10-13.patch (liitteenä / polku: ___).
1. Tarkista git status. Jos Culta-widgetin keskeneräisiä muutoksia on yhä tallentamatta, älä sotke niitä: tee tämä erillisessä puhtaassa kopiossa kuten taksimuutoksessa.
2. Aja `git apply --check` ja sitten `git apply` (tai kopioi tiedostot/-kansion 3 tiedostoa päälle, jos patch ei mene). Commitoi.
3. Tarkista tietokannasta (content_doc, key = 'sections'), onko osiot tallennettu hallinnasta. Jos on, tallennus ohittaa koodin oletukset: tee samat tekstimuutokset myös tallennettuun dokumenttiin (keittiö, ikkunalämmitys + sauna, revontulikortti "app" ensimmäiseksi).
4. npm test + npm run build, julkaise Verceliin ja tarkista /king, /suite ja /aurora-cabin.
5. Safarit: vertaa sivun retket (activities, lib/content/defaults.ts + mahdollinen tallennettu 'activities'-dokumentti) skyviewigloos.comin safarisivuihin – nimet, kestot, kuvaukset, "from"-hinnat ja mitä hintaan sisältyy. Tarkista samalla Bokunista, että tuotteiden 1294560, 1294556, 1295117 ja 1294558 hinnat täsmäävät. Näytä ristiriidat taulukkona ennen kuin muutat mitään.
```
