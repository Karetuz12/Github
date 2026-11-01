import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '0 34px', background: '#040a1f' }}>
        <div style={{ width: 66, height: 24, borderRadius: 12, background: 'linear-gradient(90deg, #2f5bff, #8fb0ff)' }} />
        <div style={{ width: 92, height: 24, borderRadius: 12, background: '#eef1f7' }} />
        <div style={{ width: 114, height: 24, borderRadius: 12, background: '#eef1f7' }} />
      </div>
    ),
    size,
  );
}
