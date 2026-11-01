import type { MetadataRoute } from 'next';
import { palvelut, yritys } from '@/lib/sisalto';

// Kaikki julkiset sivut. Palvelusivut tulevat suoraan sisällöstä, joten uusi palvelu päätyy sivukarttaan automaattisesti.
export default function sitemap(): MetadataRoute.Sitemap {
  const juuri = yritys.osoite.replace(/\/$/, '');
  const paivitetty = new Date();
  const sivut: { polku: string; prioriteetti: number; tiheys: 'weekly' | 'monthly' | 'yearly' }[] = [
    { polku: '', prioriteetti: 1, tiheys: 'weekly' },
    { polku: '/palvelut', prioriteetti: 0.9, tiheys: 'monthly' },
    ...palvelut.map((p) => ({ polku: `/palvelut/${p.slug}`, prioriteetti: 0.9, tiheys: 'monthly' as const })),
    { polku: '/hinnat', prioriteetti: 0.8, tiheys: 'monthly' },
    { polku: '/kokemus', prioriteetti: 0.7, tiheys: 'monthly' },
    { polku: '/minusta', prioriteetti: 0.7, tiheys: 'monthly' },
    { polku: '/yhteys', prioriteetti: 0.6, tiheys: 'yearly' },
    { polku: '/tietosuoja', prioriteetti: 0.2, tiheys: 'yearly' },
  ];
  return sivut.map((s) => ({ url: juuri + (s.polku || '/'), lastModified: paivitetty, changeFrequency: s.tiheys, priority: s.prioriteetti }));
}
