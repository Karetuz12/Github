import Link from 'next/link';
import { Kuvake } from '@/components/Kuvakkeet';
import { Laskuri } from '@/components/Laskuri';
import { LogoNauha } from '@/components/LogoNauha';
import { Muotokuva } from '@/components/Muotokuva';
import { Osio, varausOsoite } from '@/components/Rakenne';
import { TarkistusKortti } from '@/components/TarkistusKortti';
import { YhteysLomake } from '@/components/YhteysLomake';
import {
  alustat, asiakkaat, esittely, hero, henkilo, hinnatHuomautus, numerot, numerotHuomautus, ongelmat, palvelut, pohjatyo, referenssit,
  saavutukset, toimialat, vaiheet,
} from '@/lib/sisalto';

const ongelmaKuvakkeet = ['mittari', 'salama', 'lomake'];
const pohjatyoKuvakkeet = ['mittari', 'kohde', 'salama', 'lomake', 'selain'];

export default function Etusivu() {
  return (
    <>
      <section className="hero">
        <div className="sisalto hero-ruudukko">
          <div className="ilmesty">
            <p className="ylaotsikko">{hero.ylaotsikko} · markkinoinnin perusta</p>
            <h1>
              Puhdasta <span className="gradientti-teksti">pohjatyötä</span> markkinoinnille.
            </h1>
            <p className="iso">{hero.teksti}</p>
            <div className="painikkeet">
              <a className="painike" href={varausOsoite}>
                Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
              </a>
              <Link className="painike painike-lasi" href="/groundwork">
                Katso, mitä tarkistan
              </Link>
            </div>
            <p className="luottamus">
              <span>
                <strong>10+</strong> vuotta
              </span>
              <span>
                <strong>~1 000</strong> projektia
              </span>
              <span>
                <strong>50+ M€</strong> mitattua myyntiä asiakkaille
              </span>
            </p>
          </div>
          <div className="ilmesty viive-2">
            <TarkistusKortti />
          </div>
        </div>
      </section>

      <section className="osio" style={{ paddingTop: 10, paddingBottom: 40 }}>
        <LogoNauha nimet={alustat} />
        <p className="hiljainen pieni nauha-huom">Alustat ja työkalut, joilla olen tehnyt tulosta asiakkaille.</p>
      </section>

      <Osio>
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
      </Osio>

      <Osio id="kokemus" ylaotsikko="Kokemus" otsikko="Kokemus, jonka voi laskea."
        johdanto="Pieniä ja isoja yrityksiä, kuluttaja- ja yritysmyyntiä, Suomessa ja kansainvälisesti. Suurin osa on ollut asiakashankintaa, jossa jokainen liidi mitataan.">
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
      </Osio>

      <Osio ylaotsikko="Miksi mainonta ei tuota?" otsikko="Vika on harvoin kampanjoissa."
        johdanto="Useimmiten ongelma on niiden alla. Nämä kolme näen lähes joka katselmuksessa.">
        <div className="kortit kortit-3">
          {ongelmat.map((o, i) => (
            <div key={o.otsikko} className={`kortti lasi ilmesty viive-${i}`}>
              <span className="kortti-kuvake">
                <Kuvake nimi={ongelmaKuvakkeet[i]} />
              </span>
              <h3>{o.otsikko}</h3>
              <p style={{ margin: 0 }}>{o.teksti}</p>
            </div>
          ))}
        </div>
        <p className="korostus ilmesty">Kampanjat eivät korjaa perustaa. Siksi aloitan aina siitä.</p>
      </Osio>

      <Osio ylaotsikko="Pure Groundwork" otsikko="Mitä pohjatyö tarkoittaa."
        johdanto="Viisi asiaa, jotka laitan kuntoon ennen kuin mainontaan laitetaan euroakaan lisää.">
        <div className="kortit kortit-5">
          {pohjatyo.map((p, i) => (
            <div key={p.otsikko} className={`kortti lasi ilmesty viive-${Math.min(i, 4)}`}>
              <span className="kortti-kuvake">
                <Kuvake nimi={pohjatyoKuvakkeet[i]} />
              </span>
              <h3>{p.otsikko}</h3>
              <p style={{ margin: 0 }}>{p.teksti}</p>
              <ul>
                {p.kohdat.slice(0, 3).map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 26 }}>
          <Link className="linkki-nuoli" href="/groundwork">
            Koko tarkistuslista <Kuvake nimi="nuoli" koko={16} />
          </Link>
        </p>
      </Osio>

      <Osio ylaotsikko="Palvelut" otsikko="Kiinteät hinnat. Selkeä sisältö."
        johdanto="Tiedät ennen aloitusta, mitä saat ja mitä se maksaa.">
        <div className="palvelut">
          {palvelut.map((p, i) => (
            <div key={p.nimi} className={`palvelu lasi ilmesty viive-${i}${i === 0 ? ' suosittu' : ''}`}>
              {i === 0 && <span className="merkki-pieni">Aloita tästä</span>}
              <h3>{p.nimi}</h3>
              <div className="hinta">{p.hinta}</div>
              <div className="kesto">{p.kesto}</div>
              <p>{p.teksti}</p>
              <Link className="linkki-nuoli" href={p.linkki}>
                Lue lisää <Kuvake nimi="nuoli" koko={16} />
              </Link>
            </div>
          ))}
        </div>
        <p className="hiljainen pieni" style={{ marginTop: 18 }}>
          {hinnatHuomautus} <Link href="/hinnat">Koko hinnasto →</Link>
        </p>
      </Osio>

      <Osio ylaotsikko="Työtapa" otsikko="Näin työskentelen.">
        <ol className="vaiheet">
          {vaiheet.map((v, i) => (
            <li key={v.otsikko} className={`lasi ilmesty viive-${i}`}>
              <h3>{v.otsikko}</h3>
              <p>{v.teksti}</p>
            </li>
          ))}
        </ol>
        <p className="korostus ilmesty">Asioit aina minun kanssani.</p>
      </Osio>

      <Osio ylaotsikko="Kuka tekee" otsikko={henkilo.nimi}>
        <div className="esittely">
          <div className="ilmesty">
            <Muotokuva />
          </div>
          <div className="ilmesty viive-1">
            {esittely.map((p) => (
              <p key={p.slice(0, 20)} style={{ color: 'var(--teksti-2)' }}>
                {p}
              </p>
            ))}
            <h3 style={{ marginTop: 28 }}>Mitä olen tehnyt</h3>
            <ul className="saavutukset">
              {saavutukset.slice(1, 6).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p style={{ marginTop: 24 }}>
              <Link className="linkki-nuoli" href="/minusta">
                Koko tausta <Kuvake nimi="nuoli" koko={16} />
              </Link>
            </p>
          </div>
        </div>
      </Osio>

      {referenssit.length > 0 && (
        <Osio ylaotsikko="Referenssit" otsikko="Tuloksia asiakkaille.">
          <div className="referenssit">
            {referenssit.map((r) => (
              <div key={r.nimi} className="kortti lasi referenssi ilmesty">
                <h3>{r.nimi}</h3>
                <p>{r.kuvaus}</p>
                {r.tulos && <p className="tulos">{r.tulos}</p>}
              </div>
            ))}
          </div>
        </Osio>
      )}

      <Osio id="yhteys">
        <div className="yhteys-kortti lasi ilmesty">
          <div>
            <p className="ylaotsikko">Yhteys</p>
            <h2>Aloitetaan 15 minuutin puhelulla.</h2>
            <p className="johdanto">
              Kerro lyhyesti tilanteesta. Vastaan yleensä saman päivän aikana ja kerron suoraan, kannattaako jatkaa – vai ei.
            </p>
            <p style={{ marginTop: 22, color: 'var(--teksti-2)' }}>
              Sähköposti: <a href={`mailto:${henkilo.sahkoposti}`}>{henkilo.sahkoposti}</a>
              {henkilo.puhelin && (
                <>
                  <br />
                  Puhelin: <a href={`tel:${henkilo.puhelin.replace(/\s/g, '')}`}>{henkilo.puhelin}</a>
                </>
              )}
            </p>
          </div>
          <YhteysLomake />
        </div>
      </Osio>
    </>
  );
}
