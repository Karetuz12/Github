import type { Metadata } from 'next';
import { Osio } from '@/components/Rakenne';
import { henkilo, yritys } from '@/lib/sisalto';

export const metadata: Metadata = {
  title: 'Tietosuoja',
  description: 'Miten Pure Groundwork käsittelee yhteydenottojen ja asiakkaiden tietoja.',
  alternates: { canonical: '/tietosuoja' },
};

// Tarkista teksti ennen julkaisua. Täydennä rekisterinpitäjän tiedot lib/sisalto.ts-tiedostoon.
export default function Tietosuoja() {
  return (
    <Osio>
      <div className="tekstisivu">
        <h1>Tietosuojaseloste</h1>
        <p className="hiljainen">Päivitetty marraskuussa 2026.</p>

        <h2>Rekisterinpitäjä</h2>
        <p>
          {yritys.yhtio}
          {yritys.ytunnus ? ` (Y-tunnus ${yritys.ytunnus})` : ''}, palvelunimi {yritys.brandi}.
          <br />
          Yhteyshenkilö: {henkilo.nimi}, <a href={`mailto:${henkilo.sahkoposti}`}>{henkilo.sahkoposti}</a>
        </p>

        <h2>Mitä tietoja käsittelen</h2>
        <p>
          Yrityksen ja yhteyshenkilön nimi, työsähköposti, puhelinnumero, yrityksen verkkosivu, rooli ja viestien sisältö. Yhteydenottolomakkeelta
          tallentuvat lomakkeelle kirjoittamasi tiedot.
        </p>

        <h2>Mihin tietoja käytetään ja millä perusteella</h2>
        <ul>
          <li>Yhteydenottoihin vastaaminen ja tarjousten tekeminen (sopimusta edeltävät toimet).</li>
          <li>Asiakassuhteen hoitaminen ja laskutus (sopimus ja lakisääteiset velvoitteet).</li>
          <li>
            Yritysten päättäjille lähetettävä yhteydenotto palveluista, jotka liittyvät heidän työtehtäviinsä (oikeutettu etu). Jokaisessa
            viestissä voi kieltäytyä jatkoviesteistä, ja kielto kirjataan heti.
          </li>
        </ul>

        <h2>Mistä tiedot saadaan</h2>
        <p>
          Sinulta itseltäsi sekä julkisista lähteistä, kuten yrityksen verkkosivuilta, yritysrekistereistä ja ammatillisista verkostoista.
        </p>

        <h2>Kuinka kauan tietoja säilytetään</h2>
        <p>
          Yhteydenottojen ja markkinoinnin tiedot poistetaan, kun niitä ei enää tarvita, viimeistään kahden vuoden kuluttua viimeisestä
          yhteydenpidosta. Asiakassuhteen tiedot säilytetään sopimuksen ajan ja kirjanpitolain edellyttämän ajan.
        </p>

        <h2>Kenelle tietoja luovutetaan</h2>
        <p>
          Tietoja ei myydä eikä luovuteta markkinointiin. Tiedot säilytetään Google Workspace -palvelussa, ja sivusto toimii Vercelin
          palvelimilla. Palveluntarjoajat käsittelevät tietoja vain palvelun tuottamiseksi.
        </p>

        <h2>Sinun oikeutesi</h2>
        <p>
          Voit pyytää tietojesi tarkastamista, korjaamista tai poistamista ja vastustaa tietojesi käyttöä markkinointiin. Lähetä pyyntö osoitteeseen{' '}
          <a href={`mailto:${henkilo.sahkoposti}`}>{henkilo.sahkoposti}</a>. Voit myös tehdä valituksen tietosuojavaltuutetulle (tietosuoja.fi).
        </p>

        <h2>Evästeet</h2>
        <p>
          Sivusto käyttää analytiikka- ja markkinointievästeitä vain, jos ne on otettu käyttöön ja olet hyväksynyt ne. Välttämättömät tekniset
          evästeet eivät tallenna henkilötietoja.
        </p>
      </div>
    </Osio>
  );
}
