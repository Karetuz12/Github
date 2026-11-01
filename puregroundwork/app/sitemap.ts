import type { MetadataRoute } from 'next';
import { yritys } from '@/lib/sisalto';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/groundwork', '/sivustot', '/kumppanuus', '/hinnat', '/minusta', '/tietosuoja'].map((polku) => ({
    url: yritys.osoite + polku,
    changeFrequency: 'monthly',
    priority: polku === '' ? 1 : 0.7,
  }));
}
