import type { Metadata } from 'next';
import { Kuvake } from '@/components/Kuvakkeet';
import { BrandiKuvake } from '@/components/LogoNauha';
import { CtaOsio, KokemusBento, Numerot, Osio, SivunHero } from '@/components/Osat';
import { sivunMeta } from '@/lib/seo';
import { alustat, kokemusHyodyt, saavutukset, varausOsoite } from '@/lib/sisalto';

export const metadata: Metadata = sivunMeta({
  polku: '/kokemus',
  otsikko: 'Kokemus – noin 1000 projektia',
  kuvaus: 'Seitsemän vuotta omaa markkinointitoimistoa, noin 1000 projektia, 5 M€ mainosbudjetteja, 250 000+ liidiä ja 50+ M€ mitattua myyntiä asiakkaille.',
});

export default function Kokemus() {
  return (
    <>
      <SivunHero ylaotsikko="Kokemus" otsikko="Noin tuhat projektia. Yksi tekijä." korostus="tuhat"
        teksti="Olen tehnyt myyntiä ja markkinointia yli kymmenen vuotta, siitä seitsemän vuotta omaa markkinointitoimistoa vetäen. Sama kokemus on nyt käytössäsi ilman toimiston välikäsiä."
        polut={[{ nimi: 'Kokemus', polku: '/kokemus' }]}>
        <div className="painikkeet">
          <a className="painike" href={varausOsoite}>
            Varaa 15 minuuttia <Kuvake nimi="nuoli" koko={18} />
          </a>
        </div>
      </SivunHero>

      <Osio id="luvut" ylaotsikko="Luvuissa" otsikko="Mitä vuosien varrelta on kertynyt." korostus="kertynyt">
        <Numerot />
      </Osio>

      <Osio id="hyodyt" ylaotsikko="Mitä se tarkoittaa sinulle" otsikko="Kokemus lyhentää matkaa tulokseen." korostus="lyhentää" luokka="vaalea">
        <div className="hyodyt">
          {kokemusHyodyt.map((h, i) => (
            <div key={h.otsikko} className={`hyoty lasi ilmesty viive-${i}`}>
              <span className="mega-kuvake">
                <Kuvake nimi={h.kuvake} />
              </span>
              <h3>{h.otsikko}</h3>
              <p>{h.teksti}</p>
            </div>
          ))}
        </div>
      </Osio>

      <Osio id="toimialat" ylaotsikko="Toimialat" otsikko="Toimialat, joilla olen tehnyt tulosta." korostus="tulosta">
        <KokemusBento />
      </Osio>

      <Osio id="saavutukset" ylaotsikko="Ura" otsikko="Mitä olen tehnyt." korostus="tehnyt" luokka="vaalea">
        <ol className="saavutuslista">
          {saavutukset.map((s, i) => (
            <li key={s.slice(0, 24)} className={`ilmesty viive-${Math.min(i % 4, 4)}`}>
              <span className="saavutus-numero">{String(i + 1).padStart(2, '0')}</span>
              <p>{s}</p>
            </li>
          ))}
        </ol>
      </Osio>

      <Osio id="alustat" ylaotsikko="Työkalut" otsikko="Alustat, jotka tunnen läpikotaisin." korostus="läpikotaisin" luokka="vaalea">
        <ul className="alustaruudukko">
          {alustat.map((a, i) => (
            <li key={a} className={`lasi ilmesty viive-${i % 4}`}>
              <BrandiKuvake nimi={a} koko={28} />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </Osio>

      <CtaOsio otsikko="Käytetään kokemus sinun hyväksesi." korostus="kokemus" />
    </>
  );
}
