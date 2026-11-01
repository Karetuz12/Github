import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { Osio, SivunHero, varausOsoite } from '@/components/Rakenne';
import { hinnasto, hinnatHuomautus, maksuehdot } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Hinnasto',
  description: 'Groundwork-katselmus 490 €, sivustot 1 000–4 000 €, kuukausikumppanuus 490–1 200 €/kk. Kaikki hinnat alv 0 %.',
  alternates: { canonical: '/hinnat' },
};

export default function Hinnat() {
  return (
    <>
      <SivunHero ylaotsikko="Hinnasto" otsikko="Selkeät hinnat."
        teksti="Kiinteät hinnat ja selkeä sisältö. Tarkka hinta sovitaan aina ennen aloitusta, eikä yllätyksiä tule.">
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Kysy tarjous <Kuvake nimi="nuoli" koko={18} />
          </a>
        </div>
      </SivunHero>

      <Osio>
        <div className="hinnasto">
          {hinnasto.map((ryhma, i) => (
            <section key={ryhma.ryhma} className={`hinnasto-ryhma lasi ilmesty viive-${Math.min(i, 4)}`}>
              <div>
                <h2>{ryhma.ryhma}</h2>
                <p className="hiljainen" style={{ margin: 0 }}>
                  {ryhma.kuvaus}
                </p>
              </div>
              <div className="hinnasto-rivit">
                {ryhma.rivit.map((r) => (
                  <div key={r.nimi} className="hinnasto-rivi">
                    <strong>
                      {r.nimi} {'suosittu' in r && r.suosittu && <span className="merkki-pieni" style={{ marginLeft: 8 }}>Aloita tästä</span>}
                    </strong>
                    <span className="hinta">{r.hinta}</span>
                    <p>{r.teksti}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="hiljainen" style={{ marginTop: 22 }}>
          {hinnatHuomautus} {maksuehdot}
        </p>
      </Osio>
    </>
  );
}
