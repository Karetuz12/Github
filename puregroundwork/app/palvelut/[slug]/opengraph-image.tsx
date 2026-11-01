import { ogKoko, ogKuva } from '@/lib/og';
import { haePalvelu, palvelut } from '@/lib/sisalto';

export const alt = 'Pure Groundwork – palvelu';
export const size = ogKoko;
export const contentType = 'image/png';

export function generateStaticParams() {
  return palvelut.map((p) => ({ slug: p.slug }));
}

export default async function Kuva({ params }: { params: Promise<{ slug: string }> }) {
  const p = haePalvelu((await params).slug) ?? palvelut[0];
  return ogKuva({ ylaotsikko: p.lyhyt, otsikko: p.otsikko, alarivi: `${p.nimi} · ${p.hintaAlkaen}` });
}
