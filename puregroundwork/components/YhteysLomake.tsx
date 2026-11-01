'use client';

import { useState } from 'react';
import { henkilo, lomakePalvelut } from '@/lib/sisalto';
import { virheteksti } from '@/lib/lomake';

type Tila = 'valmis' | 'lahetetaan' | 'kiitos' | 'virhe';

export function YhteysLomake() {
  const [tila, setTila] = useState<Tila>('valmis');
  const [virhe, setVirhe] = useState('');

  async function laheta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTila('lahetetaan');
    setVirhe('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/yhteys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const vastaus = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (vastaus.ok) {
        setTila('kiitos');
        return;
      }
      setVirhe(virheteksti[vastaus.error ?? 'server'] ?? virheteksti.server);
    } catch {
      setVirhe(virheteksti.server);
    }
    setTila('virhe');
  }

  if (tila === 'kiitos') {
    return (
      <div className="kiitos" role="status">
        <h3>Kiitos, viesti tuli perille.</h3>
        <p>Vastaan yleensä saman päivän aikana. Jos asia on kiireellinen, laita sähköpostia: {henkilo.sahkoposti}</p>
      </div>
    );
  }

  return (
    <form className="lomake" onSubmit={laheta} noValidate>
      <div className="lomake-rivi">
        <label>
          Nimi *
          <input name="nimi" autoComplete="name" required />
        </label>
        <label>
          Sähköposti *
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <div className="lomake-rivi">
        <label>
          Yritys
          <input name="yritys" autoComplete="organization" />
        </label>
        <label>
          Verkkosivu
          <input name="sivusto" inputMode="url" placeholder="esim. yritys.fi" />
        </label>
      </div>
      <label>
        Mikä kiinnostaa?
        <select name="palvelu" defaultValue="">
          <option value="">Valitse</option>
          {lomakePalvelut.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        Mikä mietityttää?
        <textarea name="viesti" rows={4} placeholder="Kerro lyhyesti tilanteesta – riittää pari lausetta." />
      </label>
      {/* Botit täyttävät tämän, ihmiset eivät näe sitä */}
      <input className="piilo" name="kotisivu" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {virhe && (
        <p className="virhe" role="alert">
          {virhe}
        </p>
      )}
      <button className="painike" type="submit" disabled={tila === 'lahetetaan'}>
        {tila === 'lahetetaan' ? 'Lähetetään…' : 'Lähetä'}
      </button>
      <p className="hiljainen pieni">
        Käytän tietoja vain yhteydenottoosi vastaamiseen. <a href="/tietosuoja">Tietosuoja</a>
      </p>
    </form>
  );
}
