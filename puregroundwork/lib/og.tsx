import { ImageResponse } from 'next/og';

export const ogKoko = { width: 1200, height: 630 };

// Jaettu Open Graph -kuva: tumma pohja, brändimerkki, otsikko ja alarivi. Käytetään etusivulla ja palvelusivuilla.
export function ogKuva({ ylaotsikko, otsikko, alarivi }: { ylaotsikko: string; otsikko: string; alarivi: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px',
          backgroundColor: '#06080f',
          backgroundImage: 'radial-gradient(circle at 85% 10%, rgba(255,138,76,0.38), transparent 45%), radial-gradient(circle at 0% 100%, rgba(91,140,255,0.32), transparent 45%)',
          color: '#f2f4f8', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 34, height: 12, borderRadius: 6, background: 'linear-gradient(90deg, #ff8a4c, #ffc35a)' }} />
            <div style={{ width: 46, height: 12, borderRadius: 6, background: '#f2f4f8' }} />
            <div style={{ width: 58, height: 12, borderRadius: 6, background: '#f2f4f8' }} />
          </div>
          <div style={{ display: 'flex', fontSize: 34, letterSpacing: -0.5 }}>
            Pure <b style={{ marginLeft: 8 }}>Groundwork</b>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#ffc35a', textTransform: 'uppercase', letterSpacing: 4 }}>{ylaotsikko}</div>
          <div style={{ display: 'flex', fontSize: 74, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2, maxWidth: 1000 }}>{otsikko}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#b4bccb' }}>{alarivi}</div>
      </div>
    ),
    ogKoko,
  );
}
