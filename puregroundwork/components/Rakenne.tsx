import Link from 'next/link';
import { Logo } from './Logo';
import { henkilo, varauslinkki, yritys } from '@/lib/sisalto';

export const varausOsoite = varauslinkki || '/#yhteys';

// Liikkuva "liquid"-tausta: pehmeät väripallot liukuvat hitaasti lasipintojen alla
export function Tausta() {
  return (
    <div className="tausta" aria-hidden="true">
      <span className="pallo pallo-1" />
      <span className="pallo pallo-2" />
      <span className="pallo pallo-3" />
      <span className="tausta-ruudukko" />
    </div>
  );
}

export function Alapalkki() {
  return (
    <footer className="alapalkki">
      <div className="sisalto alapalkki-rivi">
        <div>
          <Logo />
          <p className="hiljainen">
            {henkilo.nimi} · {henkilo.titteli}
          </p>
        </div>
        <nav className="alapalkki-linkit" aria-label="Alavalikko">
          <Link href="/groundwork">Groundwork</Link>
          <Link href="/sivustot">Sivustot</Link>
          <Link href="/kumppanuus">Kumppanuus</Link>
          <Link href="/hinnat">Hinnasto</Link>
          <Link href="/minusta">Minusta</Link>
          <Link href="/tietosuoja">Tietosuoja</Link>
        </nav>
        <div className="alapalkki-linkit">
          <a href={`mailto:${henkilo.sahkoposti}`}>{henkilo.sahkoposti}</a>
          {henkilo.puhelin && <a href={`tel:${henkilo.puhelin.replace(/\s/g, '')}`}>{henkilo.puhelin}</a>}
          {henkilo.linkedin && <a href={henkilo.linkedin}>LinkedIn</a>}
        </div>
        <p className="hiljainen pieni">
          {yritys.brandi} on {yritys.yhtio}:n palvelu{yritys.ytunnus ? ` · Y-tunnus ${yritys.ytunnus}` : ''}. Tuotemerkit kuuluvat
          omistajilleen.
        </p>
      </div>
    </footer>
  );
}

export function Osio({ id, otsikko, ylaotsikko, johdanto, children, keskitetty }: {
  id?: string; otsikko?: string; ylaotsikko?: string; johdanto?: string; children: React.ReactNode; keskitetty?: boolean;
}) {
  return (
    <section id={id} className="osio">
      <div className="sisalto">
        {(otsikko || ylaotsikko || johdanto) && (
          <div className={keskitetty ? 'osio-otsikko keskella ilmesty' : 'osio-otsikko ilmesty'}>
            {ylaotsikko && <p className="ylaotsikko">{ylaotsikko}</p>}
            {otsikko && <h2>{otsikko}</h2>}
            {johdanto && <p className="johdanto">{johdanto}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function SivunHero({ ylaotsikko, otsikko, teksti, children }: {
  ylaotsikko: string; otsikko: string; teksti: string; children?: React.ReactNode;
}) {
  return (
    <section className="hero hero-sivu">
      <div className="sisalto ilmesty">
        <p className="ylaotsikko">{ylaotsikko}</p>
        <h1>{otsikko}</h1>
        <p className="iso">{teksti}</p>
        {children}
      </div>
    </section>
  );
}
