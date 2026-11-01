import type { NextConfig } from 'next';

// Tietoturvaotsakkeet kaikille sivuille. HSTS lisätään vasta tuotannossa, jotta esikatselut toimivat myös ilman HTTPS:ää paikallisesti.
const otsakkeet = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  ...(process.env.VERCEL_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Tyylit upotetaan HTML:ään: ei erillistä renderöinnin estävää CSS-pyyntöä
  experimental: { inlineCss: true },
  async headers() {
    return [
      { source: '/:path*', headers: otsakkeet },
      // Fontit ja buildin tiedostot ovat versioituja, joten ne voi välimuistittaa pitkään
      { source: '/_next/static/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
  // Vanhat osoitteet ohjataan uusille palvelusivuille pysyvästi
  async redirects() {
    return [
      { source: '/groundwork', destination: '/palvelut/groundwork', permanent: true },
      { source: '/sivustot', destination: '/palvelut/verkkosivut', permanent: true },
      { source: '/kumppanuus', destination: '/palvelut/mainonta', permanent: true },
      { source: '/sparraus', destination: '/palvelut/sparraus', permanent: true },
      { source: '/hinnasto', destination: '/hinnat', permanent: true },
    ];
  },
};

export default nextConfig;
