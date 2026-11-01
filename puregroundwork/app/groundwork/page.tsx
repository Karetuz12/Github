import type { Metadata } from 'next';
import { Merkki } from '@/components/Logo';
import { Osio, varausOsoite } from '@/components/Rakenne';
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
      <section className="hero">
        <div className="sisalto">
          <p className="ylaotsikko">
            <Merkki koko={18} /> Groundwork
          </p>
          <h1>Markkinoinnin perusta kuntoon.</h1>
          <p className="iso">
            25 asiaa viiden otsikon alla. Käyn ne läpi, kerron, mikä on kunnossa ja mikä ei, ja laitan puutteet kuntoon kiinteällä hinnalla.
          </p>
          <div className="painikkeet">
            <a className="painike" href={varausOsoite}>
              Varaa 15 minuuttia
            </a>
          </div>
        </div>
      </section>

      <Osio otsikko="Tarkistuslista">
        <div className="kortit kortit-5">
          {pohjatyo.map((p, i) => (
            <div key={p.otsikko} className="kortti lista-ryhma">
              <h3>
                <span className="kortti-numero" style={{ margin: 0 }}>
                  {i + 1}
                </span>
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

      <Osio otsikko="Kaksi tapaa aloittaa" tumma>
        <div className="palvelut" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {[katselmus, kunnostus].map((p) => (
            <div key={p.nimi} className="palvelu">
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

      <Osio otsikko="Usein kysyttyä">
        <div className="kysymykset">
          {kysymykset.map((q) => (
            <details key={q.k}>
              <summary>{q.k}</summary>
              <p>{q.v}</p>
            </details>
          ))}
        </div>
      </Osio>
    </>
  );
}
