// PureGroundwork-merkki: kolme maakerrosta. Käytetään vain muotokuvan paikkamerkkinä.
export function Merkki({ koko = 28 }: { koko?: number }) {
  return (
    <svg width={koko} height={koko} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="4" y="7" width="14" height="5" rx="2.5" fill="#8ea2d6" />
      <rect x="4" y="14" width="20" height="5" rx="2.5" fill="currentColor" />
      <rect x="4" y="21" width="26" height="5" rx="2.5" fill="currentColor" />
    </svg>
  );
}

// Virallinen logo (public/logo-valkoinen.png tummalle, logo-musta.png vaalealle pohjalle).
export function Logo({ vari = 'valkoinen' }: { vari?: 'valkoinen' | 'musta' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="logo" src={`/logo-${vari}.png`} alt="PureGroundwork" width={958} height={96} />
  );
}
