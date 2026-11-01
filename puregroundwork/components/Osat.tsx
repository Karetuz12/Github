import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { Kuvake } from './Kuvakkeet';
import { Laskuri } from './Laskuri';
import { Valojuovat } from './Valojuovat';
import { BrandiKuvake } from './LogoNauha';
import { murupolkuJsonLd, ukkJsonLd } from '@/lib/seo';
import {
  asiakkaat, hinnatHuomautus, numerot, numerotHuomautus, palvelut, toimialat, varausOsoite, vertailu, type Palvelu,
} from '@/lib/sisalto';

/** Korostaa otsikosta yhden sanan brändin sinisellä liukuvärillä. */
export function Korostus({ teksti, sana }: { teksti: string; sana?: string }) {
  if (!sana || !teksti.includes(sana)) return <>{teksti}</>;
  const [ennen, ...loput] = teksti.split(sana);
  return (
    <>
      {ennen}
      <em className="korostus">{sana}</em>
      {loput.join(sana)}
    </>
  );
}

export function Osio({ id, ylaotsikko, otsikko, korostus, johdanto, children, keskitetty, luokka }: {
  id?: string; ylaotsikko?: string; otsikko?: string; korostus?: string; johdanto?: string; children?: React.ReactNode;
  keskitetty?: boolean; luokka?: string;
}) {
  return (
    <section id={id} className={`osio${luokka ? ` ${luokka}` : ''}`} aria-labelledby={otsikko && id ? `${id}-otsikko` : undefined}>
      <div className="sisalto">
        {(otsikko || ylaotsikko || johdanto) && (
          <header className={keskitetty ? 'osio-otsikko keskella ilmesty' : 'osio-otsikko ilmesty'}>
            {ylaotsikko && <p className="ylaotsikko">{ylaotsikko}</p>}
            {otsikko && (
              <h2 id={id ? `${id}-otsikko` : undefined}>
                <Korostus teksti={otsikko} sana={korostus} />
              </h2>
            )}
            {johdanto && <p className="johdanto">{johdanto}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function Murupolku({ polut }: { polut: { nimi: string; polku: string }[] }) {
  const kaikki = [{ nimi: 'Etusivu', polku: '/' }, ...polut];
  return (
    <>
      <nav aria-label="Murupolku" className="murupolku">
        <ol>
          {kaikki.map((p, i) => (
            <li key={p.polku}>
              {i < kaikki.length - 1 ? <Link href={p.polku}>{p.nimi}</Link> : <span aria-current="page">{p.nimi}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={murupolkuJsonLd(kaikki)} />
    </>
  );
}

export function SivunHero({ ylaotsikko, otsikko, korostus, teksti, polut, children, sivu }: {
  ylaotsikko: string; otsikko: string; korostus?: string; teksti: string; polut?: { nimi: string; polku: string }[];
  children?: React.ReactNode; sivu?: React.ReactNode;
}) {
  return (
    <section className="hero hero-sivu">
      <Valojuovat />
      <div className={sivu ? 'sisalto hero-ruudukko' : 'sisalto'}>
        <div className="hero-nousu">
          {polut && <Murupolku polut={polut} />}
          <p className="ylaotsikko">{ylaotsikko}</p>
          <h1>
            <Korostus teksti={otsikko} sana={korostus} />
          </h1>
          <p className="iso">{teksti}</p>
          {children}
        </div>
        {sivu && <div className="hero-nousu viive-b hero-sivuosa">{sivu}</div>}
      </div>
    </section>
  );
}

/** Väite, joka piirtyy näkyviin sana kerrallaan vierittäessä (Efektit.tsx). Ilman JavaScriptiä teksti näkyy kokonaan. */
export function TekstiPaljastus({ teksti }: { teksti: string }) {
  return (
    <section className="osio paljastus-osio vaalea" aria-label="Lähtökohta">
      <div className="sisalto">
        <span className="yhdysviiva" aria-hidden="true" />
        <p className="paljastus">
          {teksti.split(' ').map((s, i) => (
            <span key={i} className="sana">
              {s}{' '}
            </span>
          ))}
        </p>
        <span className="yhdysviiva ala" aria-hidden="true" />
      </div>
    </section>
  );
}

/** Sanat vaihtuvat CSS-animaationa. Ruudunlukija lukee kaikki sanat kerran. Avainkehykset lasketaan sanojen määrästä.
 *  Pisin sana on näkymättömänä mittana: se antaa laatikolle leveyden ja tekstin perusviivan. */
export function Sanakierto({ alku, sanat, kesto = 2.6 }: { alku: string; sanat: string[]; kesto?: number }) {
  const n = sanat.length;
  const pala = 100 / (n + 1);
  const kehykset = sanat
    .map((_, i) => `${((i / n) * 100).toFixed(2)}%,${(((i + 0.82) / n) * 100).toFixed(2)}%{transform:translateY(-${(i * pala).toFixed(3)}%)}`)
    .join('') + `100%{transform:translateY(-${(n * pala).toFixed(3)}%)}`;
  const pisin = sanat.reduce((a, b) => (b.length > a.length ? b : a), '');
  return (
    <>
      <p className="kierto-rivi">
        <span className="vain-ruudunlukija">
          {alku} {sanat.join(', ')}.
        </span>
        <span className="kierto-ruudukko" aria-hidden="true">
          <span className="kierto-alku">{alku}</span>
          <span className="kierto-oikea">
            <span className="kierto">
              <span className="kierto-mitta">{pisin}</span>
              <span className="kierto-rata" style={{ animationDuration: `${n * kesto}s` }}>
                {[...sanat, sanat[0]].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </span>
            </span>
          </span>
        </span>
      </p>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes kierto{${kehykset}}` }} />
    </>
  );
}

export function Numerot() {
  return (
    <>
      <ul className="numerot">
        {numerot.map((n, i) => (
          <li key={n.selite} className={`lasi ilmesty viive-${Math.min(i, 4)}`}>
            <strong>
              <span className="luku">
                <Laskuri arvo={n.arvo} ennen={n.ennen} jalkeen={n.jalkeen} />
              </span>
            </strong>
            <span className="selite">{n.selite}</span>
          </li>
        ))}
      </ul>
      <p className="hiljainen pieni" style={{ marginTop: 18 }}>
        {numerotHuomautus}
      </p>
    </>
  );
}

// ── Palveluiden pienoismallit ──
function MalliGroundwork() {
  const rivit = [['GA4 ja konversiot', 'ok'], ['Meta-pikseli ja CAPI', 'ok'], ['Mobiilinopeus', 'korjattu'], ['Yhteydenottopolku', 'korjattu']];
  return (
    <div className="malli lasi">
      <div className="malli-otsikko">Katselmus · 25 kohtaa</div>
      <ul className="malli-lista">
        {rivit.map(([t, s]) => (
          <li key={t} className={`tk-${s}`}>
            <span className="tk-merkki" />
            {t}
            <em>{s === 'ok' ? 'kunnossa' : 'korjattu'}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MalliSivusto() {
  return (
    <div className="malli malli-selain lasi">
      <div className="malli-selainpalkki">
        <i />
        <i />
        <i />
        <span>yritys.fi</span>
      </div>
      <div className="malli-sivu">
        <span className="luuranko levea" />
        <span className="luuranko" />
        <span className="luuranko lyhyt" />
        <span className="malli-nappi">Pyydä tarjous</span>
        <div className="malli-ruudut">
          <span />
          <span />
          <span />
        </div>
      </div>
      <span className="malli-merkki">PageSpeed 98</span>
    </div>
  );
}

function MalliMainonta() {
  const palkit = [34, 46, 41, 58, 63, 72, 86];
  return (
    <div className="malli lasi">
      <div className="malli-otsikko">
        Kuukausiraportti
        <span className="malli-ikonit">
          <BrandiKuvake nimi="Meta" koko={16} />
          <BrandiKuvake nimi="Google Ads" koko={16} />
        </span>
      </div>
      <div className="malli-palkit">
        {palkit.map((p, i) => (
          <span key={i} style={{ height: `${p}%`, ['--i' as string]: i }} />
        ))}
      </div>
      <div className="malli-rivi">
        <span>Liidit</span>
        <strong>↑ kuukaudesta toiseen</strong>
      </div>
    </div>
  );
}

function MalliSparraus() {
  return (
    <div className="malli lasi">
      <div className="malli-otsikko">Kuukausirytmi</div>
      <div className="malli-kalenteri">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} className={i === 9 ? 'paiva palaveri' : 'paiva'}>
            {i === 9 ? 'Palaveri' : ''}
          </span>
        ))}
      </div>
      <div className="malli-kupla">“Mitä jos siirretään budjettia hakuun ja testataan uusi laskeutumissivu?”</div>
    </div>
  );
}

const mallit: Record<string, () => React.ReactElement> = {
  groundwork: MalliGroundwork, verkkosivut: MalliSivusto, mainonta: MalliMainonta, sparraus: MalliSparraus,
};

export function PalveluMalli({ slug }: { slug: string }) {
  const M = mallit[slug] ?? MalliGroundwork;
  return (
    <div className="malli-alue tumma" aria-hidden="true">
      <M />
    </div>
  );
}

/** Palvelukortit, jotka pinoutuvat päällekkäin vierittäessä (position: sticky). */
export function PalveluPino({ otsikkoTaso = 3 }: { otsikkoTaso?: 2 | 3 }) {
  const Otsikko = otsikkoTaso === 2 ? 'h2' : 'h3';
  return (
    <div className="pino">
      {palvelut.map((p, i) => (
        <article key={p.slug} className="pino-kortti lasi" style={{ ['--i' as string]: i }}>
          <div className="pino-teksti">
            <span className="pino-numero">0{i + 1}</span>
            <Otsikko>{p.nimi}</Otsikko>
            <p>{p.kortti}</p>
            <ul className="tarkistus pieni-lista">
              {p.sisaltaa.slice(0, 3).map((s) => (
                <li key={s.otsikko}>
                  <strong>{s.otsikko}:</strong> {s.kohdat.slice(0, 2).join(', ').toLowerCase()}
                </li>
              ))}
            </ul>
            <div className="pino-ala">
              <span className="hintamerkki">{p.hintaAlkaen}</span>
              <Link className="linkki-nuoli" href={`/palvelut/${p.slug}`}>
                Tutustu <span className="vain-ruudunlukija">palveluun {p.nimi}</span> <Kuvake nimi="nuoli" koko={16} />
              </Link>
            </div>
          </div>
          <PalveluMalli slug={p.slug} />
        </article>
      ))}
    </div>
  );
}

export function Prosessi({ vaiheet }: { vaiheet: { otsikko: string; teksti: string; kesto?: string }[] }) {
  return (
    <ol className="prosessi ilmesty" style={{ ['--maara' as string]: vaiheet.length }}>
      {vaiheet.map((v, i) => (
        <li key={v.otsikko} className="prosessi-vaihe">
          <span className="prosessi-numero">{i + 1}</span>
          {v.kesto && <span className="prosessi-kesto">{v.kesto}</span>}
          <h3>{v.otsikko}</h3>
          <p>{v.teksti}</p>
        </li>
      ))}
    </ol>
  );
}

export function HintaKortit({ hinnat }: { hinnat: Palvelu['hinnat'] }) {
  return (
    <div className={`hintakortit maara-${hinnat.length}`}>
      {hinnat.map((h, i) => (
        <div key={h.nimi} className={`hintakortti lasi ilmesty viive-${i}${h.suosittu ? ' suosittu tumma' : ''}`}>
          {h.suosittu && <span className="merkki-pieni">Suosituin</span>}
          <h3>{h.nimi}</h3>
          <div className="hinta">{h.hinta}</div>
          <p>{h.teksti}</p>
          {h.kohdat && (
            <ul className="tarkistus">
              {h.kohdat.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          )}
          <a className={h.suosittu ? 'painike' : 'painike painike-lasi'} href={varausOsoite}>
            Aloitetaan <Kuvake nimi="nuoli" koko={16} />
          </a>
        </div>
      ))}
    </div>
  );
}

export function Vertailu() {
  return (
    <div className="vertailu lasi ilmesty" role="table" aria-label="Vertailu: tyypillinen toimisto ja Pure Groundwork">
      <div className="vertailu-rivi vertailu-otsikot" role="row">
        <span role="columnheader" />
        {vertailu.sarakkeet.map((s, i) => (
          <span key={s} role="columnheader" className={i === 1 ? 'pg' : ''}>
            {s}
          </span>
        ))}
      </div>
      {vertailu.rivit.map((r) => (
        <div key={r.asia} className="vertailu-rivi" role="row">
          <span role="rowheader" className="vertailu-asia">
            {r.asia}
          </span>
          <span role="cell" className="vertailu-toimisto">
            {r.toimisto}
          </span>
          <span role="cell" className="pg">
            <span className="vertailu-ok" aria-hidden="true" />
            {r.pg}
          </span>
        </div>
      ))}
    </div>
  );
}

export function KokemusBento() {
  return (
    <div className="bento">
      {toimialat.map((t, i) => (
        <div key={t.otsikko} className={`bento-pala lasi ilmesty viive-${Math.min(i, 4)}${t.koko === 'iso' ? ' iso' : ''}`}>
          <div className="bento-luku gradientti-teksti">{t.luku}</div>
          <h3>{t.otsikko}</h3>
          <p>{t.teksti}</p>
        </div>
      ))}
      {asiakkaat.length > 0 && (
        <div className="asiakkaat lasi ilmesty">
          <h3>Asiakkaita vuosien varrelta</h3>
          {asiakkaat.map((a) => (
            <span key={a} className="asiakas">
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function UKK({ kysymykset, jsonLd = true }: { kysymykset: { k: string; v: string }[]; jsonLd?: boolean }) {
  return (
    <>
      <div className="kysymykset">
        {kysymykset.map((q, i) => (
          <details key={q.k} className={`ilmesty viive-${Math.min(i, 4)}`}>
            <summary>
              <h3>{q.k}</h3>
            </summary>
            <p>{q.v}</p>
          </details>
        ))}
      </div>
      {jsonLd && <JsonLd data={ukkJsonLd(kysymykset)} />}
    </>
  );
}

export function KenelleLista({ kohdat }: { kohdat: string[] }) {
  return (
    <ul className="kenelle">
      {kohdat.map((k, i) => (
        <li key={k} className={`lasi ilmesty viive-${Math.min(i, 4)}`}>
          <span className="vertailu-ok" aria-hidden="true" />
          {k}
        </li>
      ))}
    </ul>
  );
}

export function CtaOsio({ otsikko = 'Laitetaan perusta kuntoon.', korostus = 'perusta', teksti = 'Aloitetaan 15 minuutin puhelulla. Kerron suoraan, kannattaako jatkaa – vai ei.' }: {
  otsikko?: string; korostus?: string; teksti?: string;
}) {
  return (
    <section className="osio cta-osio vaalea" aria-label="Yhteydenotto">
      <div className="sisalto">
        <div className="cta-kortti lasi tumma ilmesty">
          <Valojuovat pieni />
          <h2>
            <Korostus teksti={otsikko} sana={korostus} />
          </h2>
          <p>{teksti}</p>
          <div className="painikkeet keskella">
            <a className="painike" href={varausOsoite}>
              Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
            </a>
            <Link className="painike painike-lasi" href="/hinnat">
              Katso hinnasto
            </Link>
          </div>
          <p className="hiljainen pieni" style={{ marginTop: 18, marginBottom: 0 }}>
            {hinnatHuomautus}
          </p>
        </div>
      </div>
    </section>
  );
}
