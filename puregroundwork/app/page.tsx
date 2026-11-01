import type { Metadata } from 'next';
import Link from 'next/link';
import { Kuvake } from '@/components/Kuvakkeet';
import { LogoNauha } from '@/components/LogoNauha';
import { Muotokuva } from '@/components/Muotokuva';
import { Valojuovat } from '@/components/Valojuovat';
import {
  CtaOsio, KokemusBento, Korostus, Numerot, Osio, PalveluPino, Prosessi, Sanakierto, TekstiPaljastus, UKK, Vertailu,
} from '@/components/Osat';
import { sivunMeta } from '@/lib/seo';
import {
  alustat, esittely, henkilo, hero, kysymykset, lainaus, palvelut, vaiheet, vaite, varausOsoite, yritys,
} from '@/lib/sisalto';

const meta = sivunMeta({
  polku: '/',
  otsikko: `${yritys.brandi} – markkinoinnin perusta ja verkkosivut`,
  kuvaus: 'Seurannat, Meta- ja Google-mainonta, nopeat verkkosivut ja yhteydenottopolut kuntoon kiinteällä hinnalla. Yli 10 vuoden ja noin 1000 projektin kokemus.',
});
export const metadata: Metadata = { ...meta, title: { absolute: `${yritys.brandi} – markkinoinnin perusta ja verkkosivut` } };

export default function Etusivu() {
  return (
    <>
      <section className="hero hero-etusivu">
        <Valojuovat />
        <div className="sisalto">
          <div className="hero-teksti">
            <p className="ylaotsikko hero-nousu">{hero.ylaotsikko}</p>
            <h1 className="hero-nousu viive-a">
              <Korostus teksti={hero.otsikko} sana={hero.korostus} />
            </h1>
            <div className="hero-nousu viive-b">
              <Sanakierto alku={hero.kiertoAlku} sanat={hero.kiertavat} />
            </div>
            <p className="iso hero-nousu viive-b">{hero.teksti}</p>
            <div className="painikkeet keskella hero-nousu viive-c">
              <a className="painike painike-iso" href={varausOsoite}>
                Varaa 15 minuutin puhelu <Kuvake nimi="nuoli" koko={18} />
              </a>
              <Link className="painike painike-lasi painike-iso" href="/palvelut">
                Katso palvelut
              </Link>
            </div>
          </div>
          <div className="hero-numerot hero-nousu viive-c">
            <Numerot laskuri={false} />
          </div>
        </div>
      </section>

      <section className="nauha-osio" aria-label="Alustat ja työkalut">
        <div className="sisalto">
          <div className="luottamuskortti lasi">
            <p className="nauha-otsikko">Alustat ja työkalut, joilla teen töitä päivittäin</p>
            <LogoNauha nimet={alustat} />
          </div>
        </div>
      </section>

      <TekstiPaljastus teksti={vaite} />

      <Osio id="palvelut" ylaotsikko="Palvelut" otsikko="Neljä tapaa laittaa perusta kuntoon." korostus="perusta" luokka="vaalea"
        johdanto="Aloita katselmuksella, rakenna uusi sivusto tai ulkoista mainonta kevyellä kuukausimallilla. Jokainen palvelu toimii yksinään – ja yhdessä vielä paremmin.">
        <PalveluPino />
      </Osio>

      <Osio id="kokemus" ylaotsikko="Kokemus" otsikko="Toimialat, joilla olen tehnyt tulosta." korostus="tulosta"
        johdanto="Seitsemän vuotta oman markkinointitoimiston vetämistä ja yli kymmenen vuotta myyntiä ja markkinointia.">
        <KokemusBento />
        <p className="osio-linkki ilmesty">
          <Link className="linkki-nuoli" href="/kokemus">
            Lue lisää kokemuksesta <Kuvake nimi="nuoli" koko={16} />
          </Link>
        </p>
      </Osio>

      <Osio id="miksi" ylaotsikko="Miksi Pure Groundwork" otsikko="Kokeneen tekijän ote ilman toimiston raskautta." korostus="ote" luokka="vaalea"
        johdanto="Sama osaaminen kuin isossa toimistossa – mutta asioit suoraan tekijän kanssa ja tiedät hinnan etukäteen.">
        <Vertailu />
      </Osio>

      <Osio id="prosessi" ylaotsikko="Prosessi" otsikko="Neljä askelta selkeään lopputulokseen." korostus="selkeään" luokka="vaalea"
        johdanto="Ei viikkojen kartoituksia eikä työpajoja. Ensimmäisen viikon jälkeen tiedät, mitä korjataan ja mitä se maksaa.">
        <Prosessi vaiheet={vaiheet} />
      </Osio>

      <section className="osio vaalea" aria-labelledby="esittely-otsikko">
        <div className="sisalto esittely">
          <div className="ilmesty">
            <Muotokuva />
          </div>
          <div className="ilmesty viive-1">
            <p className="ylaotsikko">Kuka tekee</p>
            <h2 id="esittely-otsikko">
              Hei, olen <Korostus teksti={henkilo.etunimi} sana={henkilo.etunimi} />.
            </h2>
            <blockquote className="lainaus">
              <p>“{lainaus}”</p>
            </blockquote>
            {esittely.map((p) => (
              <p key={p.slice(0, 24)} className="teksti-2">
                {p}
              </p>
            ))}
            <div className="painikkeet">
              <Link className="painike painike-lasi" href="/minusta">
                Lue tarinani <Kuvake nimi="nuoli" koko={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Osio id="hinnat" ylaotsikko="Hinnat" otsikko="Selkeät hinnat ennen aloitusta." korostus="Selkeät" luokka="vaalea"
        johdanto="Ei tuntilaskutusta eikä yllätyksiä. Tarkka hinta sovitaan aina ennen kuin työ alkaa.">
        <div className="hintanostot">
          {palvelut.map((p, i) => (
            <Link key={p.slug} href={`/palvelut/${p.slug}`} className={`hintanosto lasi ilmesty viive-${i}`}>
              <span className="mega-kuvake">
                <Kuvake nimi={p.kuvake} />
              </span>
              <strong>{p.nimi}</strong>
              <span className="hintanosto-hinta">{p.hintaAlkaen}</span>
              <span className="hiljainen">{p.kortti}</span>
              <span className="linkki-nuoli">
                Lue lisää <Kuvake nimi="nuoli" koko={16} />
              </span>
            </Link>
          ))}
        </div>
        <p className="osio-linkki ilmesty">
          <Link className="linkki-nuoli" href="/hinnat">
            Koko hinnasto <Kuvake nimi="nuoli" koko={16} />
          </Link>
        </p>
      </Osio>

      <Osio id="kysymykset" ylaotsikko="Kysymykset" otsikko="Usein kysyttyä." korostus="kysyttyä" luokka="osio-ukk vaalea">
        <UKK kysymykset={kysymykset} />
      </Osio>

      <CtaOsio />
    </>
  );
}
