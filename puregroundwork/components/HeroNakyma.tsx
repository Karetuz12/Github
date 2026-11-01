import { BrandiKuvake } from './LogoNauha';
import { Kuvake } from './Kuvakkeet';

// Etusivun havainnekuva: Groundwork-näkymä, joka kallistuu paikalleen ja täyttyy rivi riviltä. Pelkkää CSS-animaatiota.
const rivit = [
  { teksti: 'GA4 ja konversiot', tila: 'ok' },
  { teksti: 'Meta-pikseli ja Conversions API', tila: 'korjattu' },
  { teksti: 'Google Ads -konversiot', tila: 'korjattu' },
  { teksti: 'Mobiilinopeus', tila: 'korjattu' },
  { teksti: 'Yhteydenotto yhdellä painalluksella', tila: 'korjattu' },
  { teksti: 'Otsikot ja kuvaustekstit', tila: 'ok' },
];

const palkit = [22, 30, 26, 38, 44, 52, 61, 70, 78, 92];

export function HeroNakyma() {
  return (
    <div className="hn" aria-hidden="true">
      <div className="hn-kehys lasi">
        <div className="hn-palkki">
          <span className="tk-pallot">
            <i />
            <i />
            <i />
          </span>
          <span className="hn-osoite">Groundwork · yritys.fi</span>
          <span className="hn-live">
            <span className="pulssi" /> Seuranta päällä
          </span>
        </div>
        <div className="hn-ruudukko">
          <div className="hn-kortti hn-mittarikortti">
            <span className="hn-label">Mobiilinopeus</span>
            <div className="tk-mittari">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="tk-mittari-pohja" />
                <circle cx="60" cy="60" r="50" className="tk-mittari-arvo" />
              </svg>
              <div className="tk-mittari-luku">
                <span className="tk-ennen">38</span>
                <span className="tk-jalkeen">96</span>
              </div>
            </div>
            <span className="hn-pieni">PageSpeed, mobiili</span>
          </div>
          <div className="hn-kortti hn-kaavio">
            <div className="hn-kaavio-yla">
              <span className="hn-label">Yhteydenotot kuukausittain</span>
              <span className="hn-kanavat">
                <BrandiKuvake nimi="Meta" koko={14} />
                <BrandiKuvake nimi="Google Ads" koko={14} />
                <BrandiKuvake nimi="Google Analytics" koko={14} />
              </span>
            </div>
            <div className="hn-palkit">
              {palkit.map((h, i) => (
                <span key={i} style={{ ['--h' as string]: `${h}%`, ['--i' as string]: i }} />
              ))}
            </div>
            <svg className="hn-viiva" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path d="M0 82 C 30 78, 50 74, 75 70 S 120 62, 150 52 S 210 36, 240 26 S 285 10, 300 6" pathLength={1} />
            </svg>
          </div>
          <div className="hn-kortti hn-listakortti">
            <span className="hn-label">Katselmus · 25 kohtaa</span>
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
      </div>
      <span className="hn-siru hn-siru-1 lasi">
        <BrandiKuvake nimi="Meta" koko={18} /> Conversions API <b>käytössä</b>
      </span>
      <span className="hn-siru hn-siru-2 lasi">
        <BrandiKuvake nimi="Google Tag Manager" koko={18} /> Konversiot <b>mitataan</b>
      </span>
      <span className="hn-siru hn-siru-3 lasi">
        <Kuvake nimi="salama" koko={18} /> Latautuu <b>1,1 s</b>
      </span>
    </div>
  );
}
