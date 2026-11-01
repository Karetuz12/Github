import Link from 'next/link';
import { Merkki } from '@/components/Logo';
import { Muotokuva } from '@/components/Muotokuva';
import { Osio, varausOsoite } from '@/components/Rakenne';
import { YhteysLomake } from '@/components/YhteysLomake';
import {
  esittely, hero, henkilo, hinnatHuomautus, numerot, numerotHuomautus, ongelmat, palvelut, pohjatyo, referenssit, saavutukset, vaiheet,
} from '@/lib/sisalto';

export default function Etusivu() {
  return (
    <>
      <section className="hero">
        <div className="sisalto hero-ruudukko">
          <div>
            <p className="ylaotsikko">
              <Merkki koko={18} /> {hero.ylaotsikko}
            </p>
            <h1>{hero.otsikko}</h1>
            <p className="iso">{hero.teksti}</p>
            <div className="painikkeet">
              <a className="painike" href={varausOsoite}>
                Varaa 15 minuuttia
              </a>
              <Link className="painike painike-toissijainen" href="/groundwork">
                Katso, mitä tarkistan
              </Link>
            </div>
          </div>
          <Muotokuva />
        </div>
      </section>

      <Osio tumma>
        <ul className="numerot">
          {numerot.map((n) => (
            <li key={n.luku}>
              <strong>{n.luku}</strong>
              <span>{n.selite}</span>
            </li>
          ))}
        </ul>
        <p className="hiljainen pieni" style={{ marginTop: 28 }}>
          {numerotHuomautus}
        </p>
      </Osio>

      <Osio otsikko="Miksi mainonta ei tuota?" johdanto="Useimmiten vika ei ole kampanjoissa vaan niiden alla. Nämä kolme näen lähes joka katselmuksessa.">
        <div className="kortit">
          {ongelmat.map((o) => (
            <div key={o.otsikko} className="ongelma">
              <h3>{o.otsikko}</h3>
              <p className="hiljainen">{o.teksti}</p>
            </div>
          ))}
        </div>
        <p className="korostus">Kampanjat eivät korjaa perustaa. Siksi aloitan aina siitä.</p>
      </Osio>

      <Osio otsikko="Mitä pohjatyö tarkoittaa" johdanto="Viisi asiaa, jotka laitan kuntoon ennen kuin mainontaan laitetaan euroakaan lisää.">
        <div className="kortit kortit-5">
          {pohjatyo.map((p, i) => (
            <div key={p.otsikko} className="kortti">
              <span className="kortti-numero">{i + 1}</span>
              <h3>{p.otsikko}</h3>
              <p>{p.teksti}</p>
              <ul>
                {p.kohdat.slice(0, 3).map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24 }}>
          <Link href="/groundwork">Koko tarkistuslista →</Link>
        </p>
      </Osio>

      <Osio otsikko="Palvelut ja hinnat" johdanto="Kiinteät hinnat ja selkeä sisältö. Tiedät ennen aloitusta, mitä saat ja mitä se maksaa.">
        <div className="palvelut">
          {palvelut.map((p) => (
            <div key={p.nimi} className="palvelu">
              <h3>{p.nimi}</h3>
              <div className="hinta">{p.hinta}</div>
              <div className="kesto">{p.kesto}</div>
              <p>{p.teksti}</p>
              <Link href={p.linkki}>Lue lisää →</Link>
            </div>
          ))}
        </div>
        <p className="hiljainen pieni" style={{ marginTop: 18 }}>
          {hinnatHuomautus}
        </p>
      </Osio>

      <Osio otsikko="Näin työskentelen">
        <ol className="vaiheet">
          {vaiheet.map((v) => (
            <li key={v.otsikko}>
              <h3>{v.otsikko}</h3>
              <p className="hiljainen">{v.teksti}</p>
            </li>
          ))}
        </ol>
        <p className="korostus">Asioit aina minun kanssani.</p>
      </Osio>

      <Osio otsikko={`Kuka tekee: ${henkilo.nimi}`}>
        <div className="esittely">
          <Muotokuva />
          <div>
            {esittely.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <h3 style={{ marginTop: 28 }}>Mitä olen tehnyt</h3>
            <ul className="saavutukset">
              {saavutukset.slice(1, 6).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p style={{ marginTop: 22 }}>
              <Link href="/minusta">Koko tausta →</Link>
            </p>
          </div>
        </div>
      </Osio>

      {referenssit.length > 0 && (
        <Osio otsikko="Referenssit">
          <div className="referenssit">
            {referenssit.map((r) => (
              <div key={r.nimi} className="kortti referenssi">
                <h3>{r.nimi}</h3>
                <p>{r.kuvaus}</p>
                {r.tulos && <p className="tulos">{r.tulos}</p>}
              </div>
            ))}
          </div>
        </Osio>
      )}

      <Osio id="yhteys" tumma>
        <div className="yhteys">
          <div>
            <h2>Aloitetaan 15 minuutin puhelulla.</h2>
            <p className="johdanto">
              Kerro lyhyesti tilanteesta. Vastaan yleensä saman päivän aikana ja kerron suoraan, kannattaako jatkaa – vai ei.
            </p>
            <p>
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
