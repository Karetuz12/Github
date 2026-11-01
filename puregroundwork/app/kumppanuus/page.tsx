import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { Osio, SivunHero, varausOsoite } from '@/components/Rakenne';
import { hinnatHuomautus, kumppanuus } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Kuukausikumppanuus – mainonta ja sparraus',
  description: 'Meta- ja Google-mainonta tai markkinoinnin sparraus kevyellä mallilla: palaveri kerran kuussa ja raportti. 490–1 200 €/kk.',
  alternates: { canonical: '/kumppanuus' },
};

export default function Kumppanuus() {
  const { mainonta, sparraus, ei } = kumppanuus;
  return (
    <>
      <SivunHero ylaotsikko="Kuukausikumppanuus" otsikko="Kokenut kumppani taustalle."
        teksti="Hyvä kumppani varmistaa, että mainonta ja markkinointi kehittyvät – ilman viikkopalavereita ja jatkuvaa säätöä. Palaveri kerran kuussa, raportti ja viestit tarpeen mukaan.">
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
          </a>
        </div>
      </SivunHero>

      <Osio>
        <div className="kaksi">
          {[{ id: 'mainonta', ...mainonta, kuvake: 'kohde' }, { id: 'sparraus', ...sparraus, kuvake: 'puhe' }].map((k, i) => (
            <div key={k.id} id={k.id} className={`palvelu lasi ilmesty viive-${i}`} style={{ scrollMarginTop: 100 }}>
              <span className="kortti-kuvake">
                <Kuvake nimi={k.kuvake} />
              </span>
              <h2 style={{ fontSize: '1.7rem', marginBottom: 4 }}>{k.otsikko}</h2>
              <div className="hinta">{k.hinta}</div>
              <p style={{ flex: 'none' }}>{k.teksti}</p>
              <ul className="saavutukset" style={{ marginTop: 8 }}>
                {k.sisaltaa.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="hiljainen pieni" style={{ marginTop: 18 }}>
          {hinnatHuomautus}
        </p>
      </Osio>

      <Osio ylaotsikko="Rajaus" otsikko="Mitä kuukausimaksuun ei kuulu.">
        <div className="kortti lasi ilmesty" style={{ maxWidth: '48em' }}>
          <ul className="saavutukset ei-lista">
            {ei.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p style={{ marginTop: 18, marginBottom: 0 }}>
            Kevyt malli toimii, kun molemmat tietävät, mitä sovittiin. Siksi se on kirjattu sopimukseen – ja siksi hinta pysyy kohtuullisena.
          </p>
        </div>
      </Osio>
    </>
  );
}
