import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Kuvake } from '@/components/Kuvakkeet';
import { CtaOsio, HintaKortit, KenelleLista, Osio, PalveluMalli, Prosessi, SivunHero, UKK } from '@/components/Osat';
import { palveluJsonLd, sivunMeta } from '@/lib/seo';
import { haePalvelu, hinnatHuomautus, maksuehdot, palvelut, varausOsoite } from '@/lib/sisalto';

type Parametrit = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return palvelut.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Parametrit): Promise<Metadata> {
  const p = haePalvelu((await params).slug);
  if (!p) return {};
  return sivunMeta({ polku: `/palvelut/${p.slug}`, otsikko: p.seoOtsikko, kuvaus: p.seoKuvaus, kuva: `/palvelut/${p.slug}/opengraph-image` });
}

export default async function PalveluSivu({ params }: Parametrit) {
  const p = haePalvelu((await params).slug);
  if (!p) notFound();
  const muut = palvelut.filter((m) => m.slug !== p.slug);

  return (
    <>
      <SivunHero ylaotsikko={p.ylaotsikko} otsikko={p.otsikko} korostus={p.korostus} teksti={p.ingressi}
        polut={[{ nimi: 'Palvelut', polku: '/palvelut' }, { nimi: p.lyhyt, polku: `/palvelut/${p.slug}` }]}
        sivu={<PalveluMalli slug={p.slug} />}>
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
          </a>
          <a className="painike painike-lasi" href="#hinnat">
            Hinnat <span className="hintamerkki">{p.hintaAlkaen}</span>
          </a>
        </div>
      </SivunHero>

      <Osio id="kenelle" ylaotsikko="Kenelle" otsikko="Sopii sinulle, jos…" korostus="sinulle" luokka="vaalea">
        <KenelleLista kohdat={p.kenelle} />
      </Osio>

      <Osio id="ongelmat" ylaotsikko="Tunnistatko nämä?" otsikko="Kolme syytä, miksi tulosta ei synny." korostus="syytä" luokka="vaalea">
        <div className="ongelmat">
          {p.ongelmat.map((o, i) => (
            <div key={o.otsikko} className={`ongelma lasi ilmesty viive-${i}`}>
              <span className="ongelma-numero">0{i + 1}</span>
              <h3>{o.otsikko}</h3>
              <p>{o.teksti}</p>
            </div>
          ))}
        </div>
      </Osio>

      <Osio id="sisalto" ylaotsikko="Mitä teen" otsikko="Mitä palvelu sisältää." korostus="sisältää">
        <div className={`sisaltaa maara-${p.sisaltaa.length}`}>
          {p.sisaltaa.map((s, i) => (
            <div key={s.otsikko} className={`sisaltaa-kortti lasi ilmesty viive-${Math.min(i, 4)}`}>
              <h3>{s.otsikko}</h3>
              <ul className="tarkistus">
                {s.kohdat.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Osio>

      <Osio id="prosessi" ylaotsikko="Prosessi" otsikko="Näin edetään." korostus="edetään" luokka="vaalea">
        <Prosessi vaiheet={p.prosessi} />
      </Osio>

      <Osio id="hinnat" ylaotsikko="Hinnat" otsikko="Selkeä hinta etukäteen." korostus="etukäteen" johdanto={maksuehdot} luokka="vaalea">
        <HintaKortit hinnat={p.hinnat} />
        <p className="hiljainen pieni osio-huom">{hinnatHuomautus}</p>
      </Osio>

      <Osio id="kysymykset" ylaotsikko="Kysymykset" otsikko="Usein kysyttyä." korostus="kysyttyä" luokka="osio-ukk vaalea">
        <UKK kysymykset={p.ukk} />
      </Osio>

      <Osio id="muut" ylaotsikko="Muut palvelut" otsikko="Tarvitsetko jotain muuta?" korostus="muuta" luokka="vaalea">
        <div className="muut-palvelut">
          {muut.map((m, i) => (
            <Link key={m.slug} href={`/palvelut/${m.slug}`} className={`muu-palvelu lasi ilmesty viive-${i}`}>
              <span className="mega-kuvake">
                <Kuvake nimi={m.kuvake} />
              </span>
              <span>
                <strong>{m.nimi}</strong>
                <span className="hiljainen">{m.hintaAlkaen}</span>
              </span>
              <Kuvake nimi="nuoli" koko={18} />
            </Link>
          ))}
        </div>
      </Osio>

      <CtaOsio />
      <JsonLd data={palveluJsonLd(p)} />
    </>
  );
}
