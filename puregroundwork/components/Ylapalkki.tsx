'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { Kuvake } from './Kuvakkeet';
import { megavalikko, varauslinkki } from '@/lib/sisalto';

const varaus = varauslinkki || '/#yhteys';

export function Ylapalkki() {
  const [mega, setMega] = useState(false);
  const [mobiili, setMobiili] = useState(false);
  const [vieritetty, setVieritetty] = useState(false);
  const polku = usePathname();
  const juuri = useRef<HTMLDivElement>(null);

  // Sulje valikot sivun vaihtuessa
  useEffect(() => {
    setMega(false);
    setMobiili(false);
  }, [polku]);

  useEffect(() => {
    const vieritys = () => setVieritetty(window.scrollY > 8);
    const nappain = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMega(false);
        setMobiili(false);
      }
    };
    const klikkaus = (e: MouseEvent) => {
      if (juuri.current && !juuri.current.contains(e.target as Node)) setMega(false);
    };
    vieritys();
    window.addEventListener('scroll', vieritys, { passive: true });
    window.addEventListener('keydown', nappain);
    document.addEventListener('click', klikkaus);
    return () => {
      window.removeEventListener('scroll', vieritys);
      window.removeEventListener('keydown', nappain);
      document.removeEventListener('click', klikkaus);
    };
  }, []);

  return (
    <header className={vieritetty || mobiili ? 'ylapalkki vieritetty' : 'ylapalkki'} ref={juuri}>
      <div className="sisalto ylapalkki-rivi">
        <Link href="/" aria-label="Pure Groundwork – etusivu" className="ylapalkki-logo">
          <Logo />
        </Link>

        <nav aria-label="Päävalikko" className="valikko">
          <div className="mega-kaari" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
            <button type="button" className="valikko-linkki" aria-expanded={mega} aria-controls="megavalikko"
              onClick={() => setMega((v) => !v)}>
              Palvelut <Kuvake nimi="alas" koko={16} />
            </button>
            <div id="megavalikko" className={mega ? 'mega lasi auki' : 'mega lasi'} role="region" aria-label="Palvelut">
              <div className="mega-palvelut">
                {megavalikko.map((m) => (
                  <Link key={m.nimi} href={m.linkki} className="mega-kohta">
                    <span className="mega-kuvake">
                      <Kuvake nimi={m.kuvake} />
                    </span>
                    <span>
                      <strong>{m.nimi}</strong>
                      <span>{m.teksti}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link href="/groundwork" className="mega-nosto">
                <span className="merkki-pieni">Aloita tästä</span>
                <strong>Groundwork-katselmus</strong>
                <span className="mega-hinta">490 €</span>
                <span>Korjauslista viikossa. Hyvitetään, jos korjaukset tehdään.</span>
                <span className="mega-linkki">
                  Lue lisää <Kuvake nimi="nuoli" koko={16} />
                </span>
              </Link>
            </div>
          </div>
          <Link href="/#kokemus" className="valikko-linkki">
            Kokemus
          </Link>
          <Link href="/hinnat" className="valikko-linkki">
            Hinnasto
          </Link>
          <Link href="/minusta" className="valikko-linkki">
            Minusta
          </Link>
        </nav>

        <div className="ylapalkki-toiminnot">
          <a className="painike painike-pieni" href={varaus}>
            Varaa 15 min
          </a>
          <button type="button" className="valikko-nappi" aria-label={mobiili ? 'Sulje valikko' : 'Avaa valikko'} aria-expanded={mobiili}
            onClick={() => setMobiili((v) => !v)}>
            <Kuvake nimi={mobiili ? 'sulje' : 'valikko'} />
          </button>
        </div>
      </div>

      {mobiili && (
        <div className="mobiilivalikko lasi">
          <div className="sisalto">
            {megavalikko.map((m) => (
              <Link key={m.nimi} href={m.linkki} className="mega-kohta">
                <span className="mega-kuvake">
                  <Kuvake nimi={m.kuvake} />
                </span>
                <span>
                  <strong>{m.nimi}</strong>
                  <span>{m.teksti}</span>
                </span>
              </Link>
            ))}
            <div className="mobiili-linkit">
              <Link href="/#kokemus">Kokemus</Link>
              <Link href="/hinnat">Hinnasto</Link>
              <Link href="/minusta">Minusta</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
