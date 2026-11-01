// Viivakuvakkeet (24 × 24). Väri tulee currentColor-arvosta.
const polut: Record<string, React.ReactNode> = {
  kerrokset: (
    <>
      <path d="M4 7h9" />
      <path d="M4 12h13" />
      <path d="M4 17h16" />
    </>
  ),
  selain: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
      <path d="M7 6.5h.01M10 6.5h.01" />
    </>
  ),
  kohde: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 12l7-7" />
    </>
  ),
  puhe: (
    <>
      <path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M17 9h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-4-3h-3" />
    </>
  ),
  mittari: (
    <>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l4-6" />
    </>
  ),
  salama: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  lomake: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  nuoli: <path d="M5 12h14M13 6l6 6-6 6" />,
  alas: <path d="M6 9l6 6 6-6" />,
  valikko: <path d="M4 7h16M4 12h16M4 17h16" />,
  sulje: <path d="M6 6l12 12M18 6L6 18" />,
  tarkistus: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  posti: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  puhelin: <path d="M6.6 3h2.6l1.6 4.4-2 1.4a12 12 0 0 0 6.4 6.4l1.4-2L21 14.8v2.6A2.6 2.6 0 0 1 18.4 20 15.4 15.4 0 0 1 4 5.6 2.6 2.6 0 0 1 6.6 3z" />,
  sijainti: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  kalenteri: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  kello: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 10.5V17M8 7.5v.01M12 17v-4a2.5 2.5 0 0 1 5 0v4M12 10.5V17" />
    </>
  ),
};

export function Kuvake({ nimi, koko = 22 }: { nimi: string; koko?: number }) {
  return (
    <svg width={koko} height={koko} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {polut[nimi] ?? polut.kerrokset}
    </svg>
  );
}
