import type { MetadataRoute } from 'next';
import { yritys } from '@/lib/sisalto';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: yritys.brandi,
    short_name: 'Groundwork',
    description: yritys.kuvaus,
    start_url: '/',
    display: 'browser',
    background_color: '#040a1f',
    theme_color: '#040a1f',
    lang: 'fi',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
