import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { LogoNauha } from '@/components/LogoNauha';
import { Osio, SivunHero, varausOsoite } from '@/components/Rakenne';
import { hinnatHuomautus, kysymykset, palvelut, pohjatyo } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Groundwork – markkinoinnin perusta kuntoon',
  description: 'Tarkistuslista: seuranta, mainostilit, nopeus ja SEO, liidielementit ja sivusto. Katselmus 490 €, kunnostus kiinteällä hinnalla.',
  alternates: { canonical: '/groundwork' },
};

export default function Groundwork() {
  const [katselmus, kunnostus] = palvelut;
  return (
    <>
      <SivunHero ylaotsikko="Groundwork" otsikko="Markkinoinnin perusta kuntoon."
        teksti="25 asiaa viiden otsikon alla. Käyn ne läpi, kerron, mikä on kunnossa ja mikä ei, ja laitan puutteet kuntoon kiinteällä hinnalla.">
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
          </a>
        </div>
      </SivunHero>

      <section className="osio" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <LogoNauha nimet={['Google Analytics', 'Google Tag Manager', 'Meta', 'Google Ads', 'Search Console', 'WordPress', 'Shopify', 'Next.js']} nopeus={30} />
      </section>

      <Osio ylaotsikko="Tarkistuslista" otsikko="Mitä katselmus käy läpi.">
        <div className="kortit kortit-5">
          {pohjatyo.map((p, i) => (
            <div key={p.otsikko} className={`kortti lasi lista-ryhma ilmesty viive-${Math.min(i, 4)}`}>
              <h3>
                <span className="kortti-numero">{i + 1}</span>
                {p.otsikko}
              </h3>
              <p>{p.teksti}</p>
              <ul className="tarkistus">
                {p.kohdat.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Osio>

      <Osio ylaotsikko="Hinnat" otsikko="Kaksi tapaa aloittaa.">
        <div className="kaksi">
          {[katselmus, kunnostus].map((p, i) => (
            <div key={p.nimi} className={`palvelu lasi ilmesty viive-${i}${i === 0 ? ' suosittu' : ''}`}>
              {i === 0 && <span className="merkki-pieni">Aloita tästä</span>}
              <h3>{p.nimi}</h3>
              <div className="hinta">{p.hinta}</div>
              <div className="kesto">{p.kesto}</div>
              <p>{p.teksti}</p>
            </div>
          ))}
        </div>
        <p className="hiljainen pieni" style={{ marginTop: 18 }}>
          {hinnatHuomautus}
        </p>
      </Osio>

      <Osio ylaotsikko="Usein kysyttyä" otsikko="Kysymyksiä ja vastauksia.">
        <div className="kysymykset">
          {kysymykset.map((q) => (
            <details key={q.k} className="lasi">
              <summary>{q.k}</summary>
              <p>{q.v}</p>
            </details>
          ))}
        </div>
      </Osio>
    </>
  );
}
