import type { Metadata } from 'next';
import Link from 'next/link';
import { Kuvake } from '@/components/Kuvakkeet';
import { Valojuovat } from '@/components/Valojuovat';
import { megavalikko } from '@/lib/sisalto';

export const metadata: Metadata = { title: 'Sivua ei löytynyt', robots: { index: false } };

export default function EiLoytynyt() {
  return (
    <section className="hero hero-sivu">
      <Valojuovat />
      <div className="sisalto keskella-teksti">
        <p className="ylaotsikko">404</p>
        <h1>
          Tämä sivu jäi <em className="korostus">pohjatyön</em> alle.
        </h1>
        <p className="iso">Osoite on vaihtunut tai sivua ei ole. Tästä pääset jatkamaan:</p>
        <div className="painikkeet keskella">
          <Link className="painike" href="/">
            Etusivulle <Kuvake nimi="nuoli" koko={18} />
          </Link>
          <Link className="painike painike-lasi" href="/yhteys">
            Ota yhteyttä
          </Link>
        </div>
        <ul className="muut-palvelut ei-loytynyt">
          {megavalikko.map((m) => (
            <li key={m.linkki}>
              <Link href={m.linkki} className="muu-palvelu lasi">
                <span className="mega-kuvake">
                  <Kuvake nimi={m.kuvake} />
                </span>
                <span>
                  <strong>{m.nimi}</strong>
                  <span className="hiljainen">{m.hinta}</span>
                </span>
                <Kuvake nimi="nuoli" koko={18} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
