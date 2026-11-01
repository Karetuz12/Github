import type { Metadata } from 'next';
import { Merkki } from '@/components/Logo';
import { Osio, varausOsoite } from '@/components/Rakenne';
import { hinnatHuomautus, sivustot } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Uusi sivusto koodilla',
  description: 'Nopea, koodilla tehty sivusto ja kevyt hallintapaneeli. Pieni sivusto 1 000 €, noin kahdessa viikossa.',
  alternates: { canonical: '/sivustot' },
};

export default function Sivustot() {
  return (
    <>
      <section className="hero">
        <div className="sisalto">
          <p className="ylaotsikko">
            <Merkki koko={18} /> Sivustot
          </p>
          <h1>{sivustot.otsikko}</h1>
          <p className="iso">{sivustot.teksti}</p>
          <div className="painikkeet">
            <a className="painike" href={varausOsoite}>
              Kysy arvio
            </a>
          </div>
        </div>
      </section>

      <Osio otsikko="Miksi koodilla">
        <div className="kortit">
          {sivustot.edut.map((e) => (
            <div key={e.otsikko} className="kortti">
              <h3>{e.otsikko}</h3>
              <p>{e.teksti}</p>
            </div>
          ))}
        </div>
      </Osio>

      <Osio otsikko="Koot ja hinnat" tumma>
        <div className="koot">
          {sivustot.koot.map((k) => (
            <div key={k.nimi} className="palvelu koko">
              <h3>{k.nimi}</h3>
              <div className="hinta">{k.hinta}</div>
              <p>{k.teksti}</p>
            </div>
          ))}
        </div>
        <p className="hiljainen" style={{ marginTop: 22 }}>
          {sivustot.maksu} {hinnatHuomautus}
        </p>
      </Osio>

      <Osio>
        <p className="korostus" style={{ marginTop: 0 }}>
          {sivustot.wordpress}
        </p>
      </Osio>
    </>
  );
}
