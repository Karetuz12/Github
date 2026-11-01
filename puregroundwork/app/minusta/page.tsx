import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { Laskuri } from '@/components/Laskuri';
import { LogoNauha } from '@/components/LogoNauha';
import { Muotokuva } from '@/components/Muotokuva';
import { Osio, varausOsoite } from '@/components/Rakenne';
import { alustat, asiakkaat, esittely, henkilo, numerot, numerotHuomautus, saavutukset, toimialat, ura } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Minusta',
  description: 'Yli kymmenen vuotta myyntiä, markkinointia ja verkkosivuja. Seitsemän vuotta omaa markkinointitoimistoa, noin tuhat projektia.',
  alternates: { canonical: '/minusta' },
};

export default function Minusta() {
  return (
    <>
      <section className="hero hero-sivu">
        <div className="sisalto hero-ruudukko">
          <div className="ilmesty">
            <p className="ylaotsikko">Minusta</p>
            <h1>{henkilo.nimi}</h1>
            <p className="iso">{henkilo.titteli}</p>
            {esittely.map((p) => (
              <p key={p.slice(0, 20)} style={{ color: 'var(--teksti-2)' }}>
                {p}
              </p>
            ))}
            <div className="painikkeet">
              <a className="painike" href={varausOsoite}>
                Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
              </a>
              {henkilo.linkedin && (
                <a className="painike painike-lasi" href={henkilo.linkedin}>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
          <div className="ilmesty viive-2">
            <Muotokuva />
          </div>
        </div>
      </section>

      <Osio>
        <ul className="numerot">
          {numerot.map((n, i) => (
            <li key={n.selite} className={`lasi ilmesty viive-${Math.min(i, 4)}`}>
              <strong>
                <span className="luku">
                  <Laskuri arvo={n.arvo} ennen={n.ennen} jalkeen={n.jalkeen} />
                </span>
              </strong>
              <span className="selite">{n.selite}</span>
            </li>
          ))}
        </ul>
        <p className="hiljainen pieni" style={{ marginTop: 18 }}>
          {numerotHuomautus}
        </p>
      </Osio>

      <Osio ylaotsikko="Ura" otsikko="Mitä olen tehnyt.">
        <div className="esittely">
          <ol className="ura ilmesty">
            {ura.map((u) => (
              <li key={u.vaihe}>
                <strong>{u.vaihe}</strong>
                <span>{u.teksti}</span>
              </li>
            ))}
          </ol>
          <ul className="saavutukset ilmesty viive-1">
            {saavutukset.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </Osio>

      <Osio ylaotsikko="Toimialat" otsikko="Missä olen tehnyt tulosta.">
        <div className="bento">
          {toimialat.map((t, i) => (
            <div key={t.otsikko} className={`bento-pala lasi ilmesty viive-${Math.min(i, 4)}${t.koko === 'iso' ? ' iso' : ''}`}>
              <div className="bento-luku gradientti-teksti">{t.luku}</div>
              <h3>{t.otsikko}</h3>
              <p>{t.teksti}</p>
            </div>
          ))}
          {asiakkaat.length > 0 && (
            <div className="asiakkaat lasi ilmesty">
              <h3>Asiakkaita vuosien varrelta</h3>
              {asiakkaat.map((a) => (
                <span key={a} className="asiakas">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </Osio>

      <section className="osio" style={{ paddingTop: 0 }}>
        <LogoNauha nimet={alustat} />
      </section>

      <Osio ylaotsikko="Työtapa" otsikko="Miten teen töitä.">
        <ul className="saavutukset ilmesty" style={{ maxWidth: '48em' }}>
          <li>Asioit aina minun kanssani. Toteutuksessa apuna on kaksi kehittäjää, joiden kanssa olen tehnyt töitä vuosia.</li>
          <li>Hinta sovitaan etukäteen. Tiedät ennen aloitusta, mitä saat ja mitä se maksaa.</li>
          <li>Kuukausikumppanuuksissa palaveri kerran kuussa ja raportti. Ei viikkopalavereita, ei pitkiä sopimuksia.</li>
          <li>Kerron suoraan, jos jotain ei kannata tehdä – myös silloin, kun se tarkoittaa pienempää laskua.</li>
        </ul>
      </Osio>
    </>
  );
}
