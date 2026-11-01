import type { MetadataRoute } from 'next';
import { yritys } from '@/lib/sisalto';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: yritys.brandi,
    short_name: 'Groundwork',
    description: yritys.kuvaus,
    start_url: '/',
    display: 'browser',
    background_color: '#0a0e1a',
    theme_color: '#0a0e1a',
    lang: 'fi',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
