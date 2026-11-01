import type { Metadata } from 'next';
import { Merkki } from '@/components/Logo';
import { Muotokuva } from '@/components/Muotokuva';
import { Osio, varausOsoite } from '@/components/Rakenne';
import { esittely, henkilo, numerot, numerotHuomautus, saavutukset, ura } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Minusta',
  description: 'Yli kymmenen vuotta myyntiä, markkinointia ja verkkosivuja. Seitsemän vuotta omaa markkinointitoimistoa, noin tuhat projektia.',
  alternates: { canonical: '/minusta' },
};

export default function Minusta() {
  return (
    <>
      <section className="hero">
        <div className="sisalto hero-ruudukko">
          <div>
            <p className="ylaotsikko">
              <Merkki koko={18} /> Minusta
            </p>
            <h1>{henkilo.nimi}</h1>
            <p className="iso">{henkilo.titteli}</p>
            {esittely.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <div className="painikkeet">
              <a className="painike" href={varausOsoite}>
                Varaa 15 minuuttia
              </a>
              {henkilo.linkedin && (
                <a className="painike painike-toissijainen" href={henkilo.linkedin}>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
          <Muotokuva />
        </div>
      </section>

      <Osio tumma>
        <ul className="numerot">
          {numerot.map((n) => (
            <li key={n.luku}>
              <strong>{n.luku}</strong>
              <span>{n.selite}</span>
            </li>
          ))}
        </ul>
        <p className="hiljainen pieni" style={{ marginTop: 28 }}>
          {numerotHuomautus}
        </p>
      </Osio>

      <Osio otsikko="Mitä olen tehnyt">
        <div className="esittely">
          <ol className="ura">
            {ura.map((u) => (
              <li key={u.vaihe}>
                <strong>{u.vaihe}</strong>
                <span className="hiljainen">{u.teksti}</span>
              </li>
            ))}
          </ol>
          <ul className="saavutukset">
            {saavutukset.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </Osio>

      <Osio otsikko="Miten teen töitä">
        <ul className="saavutukset" style={{ maxWidth: '46em' }}>
          <li>Asioit aina minun kanssani. Toteutuksessa apuna on kaksi kehittäjää, joiden kanssa olen tehnyt töitä vuosia.</li>
          <li>Hinta sovitaan etukäteen. Tiedät ennen aloitusta, mitä saat ja mitä se maksaa.</li>
          <li>Kuukausikumppanuuksissa palaveri kerran kuussa ja raportti. Ei viikkopalavereita, ei pitkiä sopimuksia.</li>
          <li>Kerron suoraan, jos jotain ei kannata tehdä – myös silloin, kun se tarkoittaa pienempää laskua.</li>
        </ul>
      </Osio>
    </>
  );
}
