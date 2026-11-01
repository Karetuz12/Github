import Link from 'next/link';
import { Logo } from './Logo';
import { henkilo, varauslinkki, yritys } from '@/lib/sisalto';

export const varausOsoite = varauslinkki || '/#yhteys';

export function Ylapalkki() {
  return (
    <header className="ylapalkki">
      <div className="sisalto ylapalkki-rivi">
        <Link href="/" aria-label="Pure Groundwork – etusivu">
          <Logo />
        </Link>
        <nav aria-label="Päävalikko" className="valikko">
          <Link href="/groundwork">Groundwork</Link>
          <Link href="/sivustot">Sivustot</Link>
          <Link href="/minusta">Minusta</Link>
          <a className="painike painike-pieni" href={varausOsoite}>
            Varaa 15 min
          </a>
        </nav>
      </div>
    </header>
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
        <div className="alapalkki-linkit">
          <a href={`mailto:${henkilo.sahkoposti}`}>{henkilo.sahkoposti}</a>
          {henkilo.puhelin && <a href={`tel:${henkilo.puhelin.replace(/\s/g, '')}`}>{henkilo.puhelin}</a>}
          {henkilo.linkedin && <a href={henkilo.linkedin}>LinkedIn</a>}
          <Link href="/tietosuoja">Tietosuoja</Link>
        </div>
        <p className="hiljainen pieni">
          {yritys.brandi} on {yritys.yhtio}:n palvelu{yritys.ytunnus ? ` · Y-tunnus ${yritys.ytunnus}` : ''}
        </p>
      </div>
    </footer>
  );
}

export function Osio({ id, otsikko, johdanto, tumma, children }: {
  id?: string; otsikko?: string; johdanto?: string; tumma?: boolean; children: React.ReactNode;
}) {
  return (
    <section id={id} className={tumma ? 'osio osio-tumma' : 'osio'}>
      <div className="sisalto">
        {otsikko && <h2>{otsikko}</h2>}
        {johdanto && <p className="johdanto">{johdanto}</p>}
        {children}
      </div>
    </section>
  );
}
