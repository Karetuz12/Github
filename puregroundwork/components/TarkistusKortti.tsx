import { BrandiKuvake } from './LogoNauha';

// Heron lasikortti: Groundwork-tarkistus etenee rivi riviltä ja mittari nousee. Pelkkää CSS-animaatiota.
const rivit = [
  { teksti: 'GA4 ja konversiot', tila: 'ok' },
  { teksti: 'Meta-pikseli ja Conversions API', tila: 'ok' },
  { teksti: 'Google Ads -konversiot', tila: 'korjattu' },
  { teksti: 'Mobiilinopeus', tila: 'korjattu' },
  { teksti: 'Yhteydenotto yhdellä painalluksella', tila: 'korjattu' },
  { teksti: 'Kuvaustekstit ja otsikot', tila: 'ok' },
];

export function TarkistusKortti() {
  return (
    <div className="tarkistuskortti-alue" aria-hidden="true">
      <div className="tarkistuskortti lasi">
        <div className="tk-otsikko">
          <span className="tk-pallot">
            <i />
            <i />
            <i />
          </span>
          <span>Groundwork-tarkistus · yritys.fi</span>
        </div>
        <div className="tk-runko">
          <div className="tk-yla">
            <div className="tk-mittari">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="tk-mittari-pohja" />
                <circle cx="60" cy="60" r="50" className="tk-mittari-arvo" />
              </svg>
              <div className="tk-mittari-luku">
                <span className="tk-ennen">38</span>
                <span className="tk-jalkeen">96</span>
                <small>PageSpeed</small>
              </div>
            </div>
            <div className="tk-yla-teksti">
              <strong>Perusta kuntoon</strong>
              <span>Mobiilinopeus 38 → 96, seurannat mittaavat oikein ja yhteydenotto on yhden painalluksen päässä.</span>
            </div>
          </div>
          <ul className="tk-lista">
            {rivit.map((r, i) => (
              <li key={r.teksti} style={{ ['--i' as string]: i }} className={`tk-${r.tila}`}>
                <span className="tk-merkki" />
                <span>{r.teksti}</span>
                <span className="tk-tila">{r.tila === 'ok' ? 'kunnossa' : 'korjattu'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span className="leijuva leijuva-1 lasi"><BrandiKuvake nimi="Meta" /></span>
      <span className="leijuva leijuva-2 lasi"><BrandiKuvake nimi="Google Ads" /></span>
      <span className="leijuva leijuva-3 lasi"><BrandiKuvake nimi="Google Analytics" /></span>
      <span className="leijuva leijuva-4 lasi"><BrandiKuvake nimi="WordPress" /></span>
    </div>
  );
}
