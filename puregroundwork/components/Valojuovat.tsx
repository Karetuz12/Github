// Nordic Hostin tunnusmerkki: sinisiä valojuovia, jotka kaartuvat taustalla.
// Staattinen SVG, jota liikutetaan vain transformilla (kompositori), joten liike ei kuormita selainta.
const juovat = [
  'M-120 520 C 220 380, 520 300, 820 330 S 1320 470, 1620 300',
  'M-120 560 C 240 430, 560 360, 860 380 S 1340 500, 1620 360',
  'M-120 610 C 260 500, 600 430, 900 440 S 1360 540, 1620 430',
  'M-120 470 C 200 320, 480 240, 780 270 S 1300 420, 1620 220',
  'M-120 680 C 300 600, 660 540, 960 540 S 1400 600, 1620 520',
  'M-120 420 C 180 260, 440 180, 740 210 S 1280 360, 1620 150',
];

export function Valojuovat({ pieni = false }: { pieni?: boolean }) {
  // Sama sivu voi sisältää heron ja CTA:n juovat, joten tunnisteet erotetaan koon mukaan
  const viiva = pieni ? 'vj-viiva-p' : 'vj-viiva';
  const hehku = pieni ? 'vj-hehku-p' : 'vj-hehku';
  return (
    <div className={pieni ? 'valojuovat pieni' : 'valojuovat'} aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id={viiva} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2f5bff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#3b6cff" stopOpacity="0.9" />
            <stop offset="0.6" stopColor="#c9d8ff" stopOpacity="1" />
            <stop offset="0.85" stopColor="#3b6cff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#2f5bff" stopOpacity="0" />
          </linearGradient>
          <filter id={hehku} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <g className="vj-hehku" filter={`url(#${hehku})`} stroke={`url(#${viiva})`} fill="none" strokeWidth="10" opacity="0.55">
          {juovat.slice(0, 3).map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g stroke={`url(#${viiva})`} fill="none" strokeLinecap="round">
          {juovat.map((d, i) => (
            <path key={d} d={d} strokeWidth={i < 3 ? 2.2 : 1.2} opacity={i < 3 ? 1 : 0.55} />
          ))}
        </g>
      </svg>
    </div>
  );
}
