import { ImageResponse } from 'next/og';

export const ogKoko = { width: 1200, height: 630 };

// Jaettu Open Graph -kuva: tumma pohja, brändimerkki, otsikko ja alarivi. Käytetään etusivulla ja palvelusivuilla.
export function ogKuva({ ylaotsikko, otsikko, alarivi }: { ylaotsikko: string; otsikko: string; alarivi: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px',
          backgroundColor: '#0a0e1a',
          backgroundImage: 'radial-gradient(circle at 85% 10%, rgba(110,132,190,0.45), transparent 45%), radial-gradient(circle at 0% 100%, rgba(70,90,150,0.35), transparent 45%)',
          color: '#eef1f7', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 34, height: 12, borderRadius: 6, background: 'linear-gradient(90deg, #5d74b0, #a9b7dc)' }} />
            <div style={{ width: 46, height: 12, borderRadius: 6, background: '#f2f4f8' }} />
            <div style={{ width: 58, height: 12, borderRadius: 6, background: '#f2f4f8' }} />
          </div>
          <div style={{ display: 'flex', fontSize: 34, letterSpacing: -0.5 }}>
            <b>Pure</b>
            <span style={{ marginLeft: 6 }}>Groundwork</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#aebbdc', textTransform: 'uppercase', letterSpacing: 4 }}>{ylaotsikko}</div>
          <div style={{ display: 'flex', fontSize: 74, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2, maxWidth: 1000 }}>{otsikko}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#b9c3dc' }}>{alarivi}</div>
      </div>
    ),
    ogKoko,
  );
}
