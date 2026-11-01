// Pure Groundwork -merkki: kolme maakerrosta, joiden päällä kaikki muu rakennetaan.
// Korvataan oikealla logolla, kun logotiedostot ovat käytössä (public/logo.svg).
export function Merkki({ koko = 28 }: { koko?: number }) {
  return (
    <svg width={koko} height={koko} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="4" y="7" width="14" height="5" rx="2.5" fill="#8ea2d6" />
      <rect x="4" y="14" width="20" height="5" rx="2.5" fill="currentColor" />
      <rect x="4" y="21" width="26" height="5" rx="2.5" fill="currentColor" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <Merkki />
      <span className="logo-teksti">
        <strong>Pure</strong>Groundwork
      </span>
    </span>
  );
}
