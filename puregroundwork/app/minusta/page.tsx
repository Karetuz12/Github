import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { LogoNauha } from '@/components/LogoNauha';
import { Muotokuva } from '@/components/Muotokuva';
import { CtaOsio, Korostus, Osio, SivunHero } from '@/components/Osat';
import { sivunMeta } from '@/lib/seo';
import { alustat, esittely, henkilo, lainaus, tyotapa, ura, varausOsoite } from '@/lib/sisalto';

export const metadata: Metadata = sivunMeta({
  polku: '/minusta',
  otsikko: `Minusta – ${henkilo.nimi}`,
  kuvaus: 'Yli kymmenen vuotta myyntiä, markkinointia ja verkkosivuja. Seitsemän vuotta omaa 25 hengen markkinointitoimistoa ja noin tuhat projektia.',
});

export default function Minusta() {
  return (
    <>
      <SivunHero ylaotsikko="Minusta" otsikko={`Hei, olen ${henkilo.etunimi}.`} korostus={henkilo.etunimi} teksti={henkilo.titteli}
        polut={[{ nimi: 'Minusta', polku: '/minusta' }]} sivu={<Muotokuva />}>
        {esittely.map((p) => (
          <p key={p.slice(0, 20)} className="teksti-2">
            {p}
          </p>
        ))}
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
          </a>
          {henkilo.linkedin && (
            <a className="painike painike-lasi" href={henkilo.linkedin} rel="me noopener" target="_blank">
              <Kuvake nimi="linkedin" koko={18} /> LinkedIn
            </a>
          )}
        </div>
      </SivunHero>

      <section className="osio vaalea" aria-label="Lainaus">
        <div className="sisalto">
          <blockquote className="iso-lainaus ilmesty">
            <p>
              <Korostus teksti={`“${lainaus}”`} sana="jokainen mainoseuro" />
            </p>
            <footer>— {henkilo.nimi}</footer>
          </blockquote>
        </div>
      </section>

      <Osio id="ura" ylaotsikko="Ura" otsikko="Koodista myyntiin, toimistosta omalle nimelle." korostus="omalle nimelle" luokka="vaalea">
        <ol className="aikajana">
          {ura.map((u, i) => (
            <li key={u.vaihe} className={`ilmesty viive-${Math.min(i % 3, 4)}`}>
              <span className="aikajana-piste" />
              <div className="lasi aikajana-kortti">
                <h3>{u.vaihe}</h3>
                <p>{u.teksti}</p>
              </div>
            </li>
          ))}
        </ol>
      </Osio>

      <Osio id="tyotapa" ylaotsikko="Työtapa" otsikko="Miten teen töitä." korostus="töitä" luokka="vaalea">
        <div className="hyodyt hyodyt-4">
          {tyotapa.map((t, i) => (
            <div key={t.otsikko} className={`hyoty lasi ilmesty viive-${i}`}>
              <span className="hyoty-numero">0{i + 1}</span>
              <h3>{t.otsikko}</h3>
              <p>{t.teksti}</p>
            </div>
          ))}
        </div>
      </Osio>

      <section className="nauha-osio vaalea" aria-label="Alustat ja työkalut">
        <p className="nauha-otsikko">Työkalut, joita käytän päivittäin</p>
        <LogoNauha nimet={alustat} />
      </section>

      <CtaOsio otsikko="Jutellaan 15 minuuttia." korostus="15 minuuttia" />
    </>
  );
}
