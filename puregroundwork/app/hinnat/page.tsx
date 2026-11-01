import type { Metadata } from 'next';
import Link from 'next/link';
import { Kuvake } from '@/components/Kuvakkeet';
import { CtaOsio, Osio, SivunHero, UKK } from '@/components/Osat';
import { sivunMeta } from '@/lib/seo';
import { hinnasto, hinnatHuomautus, kysymykset, maksuehdot, varausOsoite } from '@/lib/sisalto';

export const metadata: Metadata = sivunMeta({
  polku: '/hinnat',
  otsikko: 'Hinnasto – kiinteät hinnat ilman yllätyksiä',
  kuvaus: 'Groundwork-katselmus 490 €, verkkosivut 1 000–4 000 €, mainonta 490–990 €/kk ja sparraus 600–1 200 €/kk. Kiinteät hinnat, alv 0 %, ei pitkiä sopimuksia.',
});

const hintaKysymykset = kysymykset.filter((k) => /maksa|aloit|alkuun/i.test(k.k));

export default function Hinnat() {
  return (
    <>
      <SivunHero ylaotsikko="Hinnasto" otsikko="Selkeät hinnat. Ei yllätyksiä." korostus="Selkeät"
        teksti="Kiinteät hinnat ja selkeä sisältö. Tarkka hinta sovitaan aina ennen aloitusta – tuntilaskutuksen yllätyksiä ei tule."
        polut={[{ nimi: 'Hinnasto', polku: '/hinnat' }]}>
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Kysy tarjous <Kuvake nimi="nuoli" koko={18} />
          </a>
        </div>
      </SivunHero>

      <section className="osio osio-tiivis vaalea" aria-label="Hinnasto">
        <div className="sisalto">
          <div className="hinnasto">
            {hinnasto.map((ryhma, i) => (
              <section key={ryhma.ryhma} className={`hinnasto-ryhma lasi ilmesty viive-${Math.min(i, 4)}`} aria-labelledby={`ryhma-${i}`}>
                <div className="hinnasto-ryhma-otsikko">
                  <h2 id={`ryhma-${i}`}>{ryhma.ryhma}</h2>
                  <p className="hiljainen">{ryhma.kuvaus}</p>
                  <Link className="linkki-nuoli" href={ryhma.linkki}>
                    {ryhma.linkki === '/yhteys' ? 'Kysy lisää' : 'Palvelun sisältö'} <Kuvake nimi="nuoli" koko={16} />
                  </Link>
                </div>
                <div className="hinnasto-rivit">
                  {ryhma.rivit.map((r) => (
                    <div key={r.nimi} className="hinnasto-rivi">
                      <h3>
                        {r.nimi}
                        {'suosittu' in r && r.suosittu && <span className="merkki-pieni">Suosituin</span>}
                      </h3>
                      <span className="hinta">{r.hinta}</span>
                      <p>{r.teksti}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="maksuehdot lasi ilmesty">
            <Kuvake nimi="kalenteri" />
            <p>
              <strong>{hinnatHuomautus}</strong> {maksuehdot}
            </p>
          </div>
        </div>
      </section>

      <Osio id="kysymykset" ylaotsikko="Kysymykset" otsikko="Kysyttyä hinnoista." korostus="hinnoista" luokka="osio-ukk vaalea">
        <UKK kysymykset={hintaKysymykset} />
      </Osio>

      <CtaOsio otsikko="Kysy tarjous – tiedät hinnan ennen aloitusta." korostus="ennen" />
    </>
  );
}
