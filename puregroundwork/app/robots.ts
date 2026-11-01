import type { MetadataRoute } from 'next';
import { yritys } from '@/lib/sisalto';

export default function robots(): MetadataRoute.Robots {
  // Ennen julkaisua omalla domainilla esikatselut ja vercel.app-osoite pidetään pois hakukoneista
  const tuotantoOsoite = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? '';
  const julkinen = process.env.VERCEL_ENV === 'production' && !tuotantoOsoite.endsWith('.vercel.app');
  return {
    rules: julkinen ? { userAgent: '*', allow: '/', disallow: '/api/' } : { userAgent: '*', disallow: '/' },
    sitemap: `${yritys.osoite.replace(/\/$/, '')}/sitemap.xml`,
    host: yritys.osoite,
  };
}
