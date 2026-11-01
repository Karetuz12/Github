import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { CtaOsio, Osio, PalveluPino, Prosessi, SivunHero, Vertailu } from '@/components/Osat';
import { sivunMeta } from '@/lib/seo';
import { vaiheet, varausOsoite } from '@/lib/sisalto';

export const metadata: Metadata = sivunMeta({
  polku: '/palvelut',
  otsikko: 'Palvelut – Groundwork, sivustot ja mainonta',
  kuvaus: 'Markkinoinnin perusta kuntoon, uusi verkkosivusto koodilla, Meta- ja Google-mainonta tai sparraus kuukausimallilla. Kiinteät hinnat, ei pitkiä sopimuksia.',
});

export default function Palvelut() {
  return (
    <>
      <SivunHero ylaotsikko="Palvelut" otsikko="Kaikki, mitä markkinointi tarvitsee alleen." korostus="alleen"
        teksti="Neljä palvelua, yksi periaate: ensin perusta, sitten kasvu. Valitse se, mistä on eniten hyötyä nyt – tai kysy, niin kerron suoraan."
        polut={[{ nimi: 'Palvelut', polku: '/palvelut' }]}>
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
          </a>
        </div>
      </SivunHero>

      <section className="osio osio-tiivis vaalea" aria-label="Palvelut">
        <div className="sisalto">
          <PalveluPino otsikkoTaso={2} />
        </div>
      </section>

      <Osio id="prosessi" ylaotsikko="Prosessi" otsikko="Näin yhteistyö etenee." korostus="etenee" luokka="vaalea">
        <Prosessi vaiheet={vaiheet} />
      </Osio>

      <Osio id="miksi" ylaotsikko="Miksi Pure Groundwork" otsikko="Toimiston osaaminen ilman toimiston raskautta." korostus="ilman" luokka="vaalea">
        <Vertailu />
      </Osio>

      <CtaOsio />
    </>
  );
}
