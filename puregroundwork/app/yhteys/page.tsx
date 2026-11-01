import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { SivunHero } from '@/components/Osat';
import { YhteysLomake } from '@/components/YhteysLomake';
import { sivunMeta } from '@/lib/seo';
import { henkilo, varauslinkki, yhteysVaiheet } from '@/lib/sisalto';

export const metadata: Metadata = sivunMeta({
  polku: '/yhteys',
  otsikko: 'Yhteys – varaa 15 minuutin puhelu',
  kuvaus: 'Kerro tilanteesi parilla lauseella tai varaa 15 minuutin puhelu. Vastaan yleensä saman päivän aikana ja kerron suoraan, mitä tekisin.',
});

export default function Yhteys() {
  return (
    <>
      <SivunHero ylaotsikko="Yhteys" otsikko="Kerro tilanteesi. Saat suoran vastauksen." korostus="suoran"
        teksti="Pari lausetta riittää. Vastaan yleensä saman päivän aikana – ja kerron suoraan, kannattaako jatkaa vai ei."
        polut={[{ nimi: 'Yhteys', polku: '/yhteys' }]} />

      <section className="osio osio-tiivis" aria-label="Yhteydenotto">
        <div className="sisalto yhteys-ruudukko">
          <div className="yhteys-kortti lasi ilmesty">
            <h2>Lähetä viesti</h2>
            <YhteysLomake />
          </div>
          <aside className="yhteys-sivu ilmesty viive-1">
            {varauslinkki && (
              <a className="yhteys-varaus lasi" href={varauslinkki}>
                <span className="mega-kuvake">
                  <Kuvake nimi="kalenteri" />
                </span>
                <span>
                  <strong>Varaa 15 minuutin puhelu</strong>
                  <span className="hiljainen">Valitse sopiva aika kalenterista.</span>
                </span>
                <Kuvake nimi="nuoli" koko={18} />
              </a>
            )}
            <div className="lasi yhteys-tiedot">
              <h2>Yhteystiedot</h2>
              <ul>
                <li>
                  <Kuvake nimi="posti" />
                  <a href={`mailto:${henkilo.sahkoposti}`}>{henkilo.sahkoposti}</a>
                </li>
                {henkilo.puhelin && (
                  <li>
                    <Kuvake nimi="puhelin" />
                    <a href={`tel:${henkilo.puhelin.replace(/\s/g, '')}`}>{henkilo.puhelin}</a>
                  </li>
                )}
                {henkilo.linkedin && (
                  <li>
                    <Kuvake nimi="linkedin" />
                    <a href={henkilo.linkedin} rel="me noopener" target="_blank">
                      LinkedIn
                    </a>
                  </li>
                )}
                <li>
                  <Kuvake nimi="sijainti" />
                  <span>{henkilo.paikka}</span>
                </li>
                <li>
                  <Kuvake nimi="kello" />
                  <span>Vastaan yleensä saman päivän aikana</span>
                </li>
              </ul>
            </div>
            <div className="lasi yhteys-tiedot">
              <h2>Mitä tapahtuu seuraavaksi</h2>
              <ol className="seuraavaksi">
                {yhteysVaiheet.map((v, i) => (
                  <li key={v.otsikko}>
                    <span className="prosessi-numero">{i + 1}</span>
                    <div>
                      <strong>{v.otsikko}</strong>
                      <p>{v.teksti}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
