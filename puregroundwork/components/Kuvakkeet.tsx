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
};

export function Kuvake({ nimi, koko = 22 }: { nimi: string; koko?: number }) {
  return (
    <svg width={koko} height={koko} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {polut[nimi] ?? polut.kerrokset}
    </svg>
  );
}
