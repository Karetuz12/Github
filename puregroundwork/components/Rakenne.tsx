import Link from 'next/link';
import { Logo } from './Logo';
import { Kuvake } from './Kuvakkeet';
import { henkilo, palvelut, valikko, varausOsoite, yritys } from '@/lib/sisalto';

// Liikkuva "liquid"-tausta: pehmeät, vaimeat väripallot liukuvat hitaasti lasipintojen alla, päällä hienovarainen rae.
export function Tausta() {
  return (
    <div className="tausta" aria-hidden="true">
      <span className="pallo pallo-1" />
      <span className="pallo pallo-2" />
      <span className="pallo pallo-3" />
    </div>
  );
}

export function Alapalkki() {
  const vuosi = new Date().getFullYear();
  return (
    <footer className="alapalkki">
      <div className="sisalto">
        <div className="alapalkki-yla">
          <div className="alapalkki-brandi">
            <Link href="/" aria-label="PureGroundwork – etusivu" className="ylapalkki-logo">
              <Logo />
            </Link>
            <p>{yritys.kuvaus}</p>
            <a className="painike painike-pieni" href={varausOsoite}>
              Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={15} />
            </a>
          </div>
          <nav className="alapalkki-sarakkeet" aria-label="Alavalikko">
            <div>
              <p className="alapalkki-otsikko">Palvelut</p>
              <ul>
                {palvelut.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/palvelut/${p.slug}`}>{p.nimi}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/palvelut">Kaikki palvelut</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="alapalkki-otsikko">{yritys.brandi}</p>
              <ul>
                {valikko.map((v) => (
                  <li key={v.linkki}>
                    <Link href={v.linkki}>{v.nimi}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/tietosuoja">Tietosuoja</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="alapalkki-otsikko">Yhteystiedot</p>
              <ul className="alapalkki-yhteys">
                <li>
                  <Kuvake nimi="posti" koko={18} />
                  <a href={`mailto:${henkilo.sahkoposti}`}>{henkilo.sahkoposti}</a>
                </li>
                {henkilo.puhelin && (
                  <li>
                    <Kuvake nimi="puhelin" koko={18} />
                    <a href={`tel:${henkilo.puhelin.replace(/\s/g, '')}`}>{henkilo.puhelin}</a>
                  </li>
                )}
                {henkilo.linkedin && (
                  <li>
                    <Kuvake nimi="linkedin" koko={18} />
                    <a href={henkilo.linkedin} rel="me noopener" target="_blank">
                      LinkedIn
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>
        <p className="alapalkki-sana" aria-hidden="true">
          PureGroundwork
        </p>
        <div className="alapalkki-ala">
          <span>
            © {vuosi} {yritys.yhtio}
            {yritys.ytunnus ? ` · Y-tunnus ${yritys.ytunnus}` : ''}
          </span>
          <span>Tuotemerkit kuuluvat omistajilleen.</span>
        </div>
      </div>
    </footer>
  );
}
