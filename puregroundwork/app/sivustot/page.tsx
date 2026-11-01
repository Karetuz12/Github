import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { Osio, SivunHero, varausOsoite } from '@/components/Rakenne';
import { hinnatHuomautus, sivustot } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Uusi sivusto koodilla',
  description: 'Nopea, koodilla tehty sivusto ja kevyt hallintapaneeli. Pieni sivusto 1 000 €, noin kahdessa viikossa.',
  alternates: { canonical: '/sivustot' },
};

const etuKuvakkeet = ['salama', 'kerrokset', 'lomake', 'kohde'];

export default function Sivustot() {
  return (
    <>
      <SivunHero ylaotsikko="Sivustot" otsikko={sivustot.otsikko} teksti={sivustot.teksti}>
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Kysy arvio <Kuvake nimi="nuoli" koko={18} />
          </a>
        </div>
      </SivunHero>

      <Osio ylaotsikko="Miksi koodilla" otsikko="Nopea, kevyt ja valmiina myyntiin.">
        <div className="kortit">
          {sivustot.edut.map((e, i) => (
            <div key={e.otsikko} className={`kortti lasi ilmesty viive-${i}`}>
              <span className="kortti-kuvake">
                <Kuvake nimi={etuKuvakkeet[i]} />
              </span>
              <h3>{e.otsikko}</h3>
              <p style={{ margin: 0 }}>{e.teksti}</p>
            </div>
          ))}
        </div>
      </Osio>

      <Osio ylaotsikko="Koot ja hinnat" otsikko="Kolme kokoa, kiinteä hinta.">
        <div className="koot">
          {sivustot.koot.map((k, i) => (
            <div key={k.nimi} className={`palvelu lasi ilmesty viive-${i}${i === 1 ? ' suosittu' : ''}`}>
              {i === 1 && <span className="merkki-pieni">Yleisin</span>}
              <h3>{k.nimi}</h3>
              <div className="hinta">{k.hinta}</div>
              <p>{k.teksti}</p>
            </div>
          ))}
        </div>
        <p className="hiljainen" style={{ marginTop: 22 }}>
          {sivustot.maksu} {hinnatHuomautus}
        </p>
        <p className="korostus ilmesty">{sivustot.wordpress}</p>
      </Osio>
    </>
  );
}
