'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { Kuvake } from './Kuvakkeet';
import { megavalikko, valikko, varausOsoite } from '@/lib/sisalto';

// Kelluva lasipalkki: megavalikko työpöydällä, koko ruudun valikko puhelimella.
export function Ylapalkki() {
  const [mega, setMega] = useState(false);
  const [mobiili, setMobiili] = useState(false);
  const [vieritetty, setVieritetty] = useState(false);
  const polku = usePathname();
  const juuri = useRef<HTMLElement>(null);

  useEffect(() => {
    setMega(false);
    setMobiili(false);
  }, [polku]);

  useEffect(() => {
    const vieritys = () => setVieritetty(window.scrollY > 12);
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

  useEffect(() => {
    document.documentElement.classList.toggle('valikko-auki', mobiili);
  }, [mobiili]);

  const aktiivinen = (linkki: string) => (polku === linkki || polku.startsWith(`${linkki}/`) ? 'page' : undefined);

  return (
    <header className={`ylapalkki${vieritetty || mobiili || mega ? ' vieritetty' : ''}${mobiili ? ' mobiili-auki' : ''}`} ref={juuri}>
      <div className="ylapalkki-kehys">
        <div className="ylapalkki-rivi">
          <Link href="/" aria-label="PureGroundwork – etusivu" className="ylapalkki-logo">
            <Logo />
          </Link>

          <nav aria-label="Päävalikko" className="valikko">
            <div className="mega-kaari" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
              <button type="button" className="valikko-linkki" aria-expanded={mega} aria-controls="megavalikko"
                aria-current={aktiivinen('/palvelut')} onClick={() => setMega((v) => !v)}>
                Palvelut <Kuvake nimi="alas" koko={16} />
              </button>
              <div id="megavalikko" className={mega ? 'mega auki' : 'mega'}>
                <div className="mega-palvelut">
                  {megavalikko.map((m) => (
                    <Link key={m.linkki} href={m.linkki} className="mega-kohta">
                      <span className="mega-kuvake">
                        <Kuvake nimi={m.kuvake} />
                      </span>
                      <span className="mega-teksti">
                        <strong>{m.nimi}</strong>
                        <span>{m.teksti}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="mega-sivu">
                  <Link href="/palvelut/groundwork" className="mega-nosto">
                    <span className="merkki-pieni">Aloita tästä</span>
                    <strong>Groundwork-katselmus</strong>
                    <span>Korjauslista viikossa. Hyvitetään, jos korjaukset tehdään.</span>
                    <span className="mega-linkki">
                      Lue lisää <Kuvake nimi="nuoli" koko={16} />
                    </span>
                  </Link>
                  <Link href="/palvelut" className="mega-kaikki">
                    Kaikki palvelut <Kuvake nimi="nuoli" koko={16} />
                  </Link>
                </div>
              </div>
            </div>
            {valikko.map((v) => (
              <Link key={v.linkki} href={v.linkki} className="valikko-linkki" aria-current={aktiivinen(v.linkki)}>
                {v.nimi}
              </Link>
            ))}
          </nav>

          <div className="ylapalkki-toiminnot">
            <a className="painike painike-pieni" href={varausOsoite}>
              Varaa 15 min <Kuvake nimi="nuoli" koko={15} />
            </a>
            <button type="button" className="valikko-nappi" aria-label={mobiili ? 'Sulje valikko' : 'Avaa valikko'} aria-expanded={mobiili}
              aria-controls="mobiilivalikko" onClick={() => setMobiili((v) => !v)}>
              <Kuvake nimi={mobiili ? 'sulje' : 'valikko'} />
            </button>
          </div>
        </div>

        {mobiili && (
          <div id="mobiilivalikko" className="mobiilivalikko">
            <p className="mobiili-otsikko">Palvelut</p>
            {megavalikko.map((m) => (
              <Link key={m.linkki} href={m.linkki} className="mega-kohta">
                <span className="mega-kuvake">
                  <Kuvake nimi={m.kuvake} />
                </span>
                <span className="mega-teksti">
                  <strong>{m.nimi}</strong>
                </span>
              </Link>
            ))}
            <div className="mobiili-linkit">
              <Link href="/palvelut">Kaikki palvelut</Link>
              {valikko.map((v) => (
                <Link key={v.linkki} href={v.linkki}>
                  {v.nimi}
                </Link>
              ))}
            </div>
            <a className="painike" href={varausOsoite}>
              Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={16} />
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
