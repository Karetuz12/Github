// Yhteydenottolomakkeen tarkistus. Sama logiikka palvelimella ja testeissä.

export type Yhteydenotto = {
  nimi: string;
  email: string;
  yritys: string;
  sivusto: string;
  palvelu: string;
  viesti: string;
};

const pituus = { nimi: 120, email: 200, yritys: 160, sivusto: 300, palvelu: 80, viesti: 3000 };

function siisti(v: unknown, max: number): string {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function tarkistaYhteydenotto(raaka: Record<string, unknown>): { ok: true; data: Yhteydenotto } | { ok: false; virhe: string } {
  const data: Yhteydenotto = {
    nimi: siisti(raaka.nimi, pituus.nimi),
    email: siisti(raaka.email, pituus.email).toLowerCase(),
    yritys: siisti(raaka.yritys, pituus.yritys),
    sivusto: siisti(raaka.sivusto, pituus.sivusto),
    palvelu: siisti(raaka.palvelu, pituus.palvelu),
    viesti: String(raaka.viesti ?? '').trim().slice(0, pituus.viesti),
  };
  if (!data.nimi) return { ok: false, virhe: 'nimi' };
  if (!/^[^\s@<>(),;:]+@[^\s@<>(),;:]+\.[a-z]{2,}$/i.test(data.email)) return { ok: false, virhe: 'email' };
  return { ok: true, data };
}

export const virheteksti: Record<string, string> = {
  nimi: 'Kirjoita nimesi.',
  email: 'Tarkista sähköpostiosoite.',
  server: 'Lähetys ei onnistunut. Lähetä viesti suoraan sähköpostilla, niin vastaan pian.',
};
