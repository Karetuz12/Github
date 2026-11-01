import type { MetadataRoute } from 'next';
import { yritys } from '@/lib/sisalto';

export default function robots(): MetadataRoute.Robots {
  // Ennen julkaisua omalla domainilla esikatselut pidetään pois hakukoneista
  const julkinen = process.env.VERCEL_ENV === 'production';
  return {
    rules: julkinen ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' },
    sitemap: `${yritys.osoite}/sitemap.xml`,
  };
}
