import type { Metadata } from 'next';
import { henkilo, yritys, type Palvelu } from './sisalto';

// Sivukohtaiset metatiedot: otsikko (title-pohja lisää brändin perään), kuvaus, kanoninen osoite, Open Graph ja Twitter.
// Jakokuva on oletuksena etusivun kuva (app/opengraph-image.tsx). Palvelusivut antavat oman kuvansa (kuva-parametri).
export function sivunMeta({ polku, otsikko, kuvaus, kuva = '/opengraph-image' }: { polku: string; otsikko: string; kuvaus: string; kuva?: string }): Metadata {
  const koko = otsikko.includes(yritys.brandi) ? otsikko : `${otsikko} | ${yritys.brandi}`;
  const jakokuva = { url: kuva, width: 1200, height: 630, alt: koko };
  return {
    title: otsikko,
    description: kuvaus,
    alternates: { canonical: polku },
    openGraph: { title: koko, description: kuvaus, url: polku, siteName: yritys.brandi, locale: 'fi_FI', type: 'website', images: [jakokuva] },
    twitter: { card: 'summary_large_image', title: koko, description: kuvaus, images: [jakokuva.url] },
  };
}

const url = (polku: string) => yritys.osoite.replace(/\/$/, '') + polku;

export const organisaatioId = url('/#organisaatio');
export const henkiloId = url('/#henkilo');

export function organisaatioJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': organisaatioId,
        name: yritys.brandi,
        url: url('/'),
        description: yritys.kuvaus,
        email: henkilo.sahkoposti,
        ...(henkilo.puhelin ? { telephone: henkilo.puhelin } : {}),
        areaServed: { '@type': 'Country', name: 'Suomi' },
        priceRange: '490–4000 €',
        founder: { '@id': henkiloId },
        knowsAbout: ['Markkinointi', 'Verkkosivut', 'Meta-mainonta', 'Google Ads', 'Konversioseuranta', 'Hakukoneoptimointi', 'Liidien hankinta'],
      },
      {
        '@type': 'Person',
        '@id': henkiloId,
        name: henkilo.nimi,
        jobTitle: henkilo.titteli,
        worksFor: { '@id': organisaatioId },
        ...(henkilo.linkedin ? { sameAs: [henkilo.linkedin] } : {}),
      },
      { '@type': 'WebSite', '@id': url('/#sivusto'), url: url('/'), name: yritys.brandi, inLanguage: 'fi', publisher: { '@id': organisaatioId } },
    ],
  };
}

export function palveluJsonLd(p: Palvelu) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: p.nimi,
    serviceType: p.lyhyt,
    description: p.seoKuvaus,
    url: url(`/palvelut/${p.slug}`),
    provider: { '@id': organisaatioId },
    areaServed: { '@type': 'Country', name: 'Suomi' },
    offers: p.hinnat.map((h) => ({
      '@type': 'Offer',
      name: h.nimi,
      description: h.teksti,
      priceCurrency: 'EUR',
      price: (h.hinta.match(/\d[\d\s]*/)?.[0] ?? '0').replace(/\s/g, ''),
    })),
  };
}

export function ukkJsonLd(kysymykset: { k: string; v: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: kysymykset.map((q) => ({ '@type': 'Question', name: q.k, acceptedAnswer: { '@type': 'Answer', text: q.v } })),
  };
}

export function murupolkuJsonLd(polut: { nimi: string; polku: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: polut.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.nimi, item: url(p.polku) })),
  };
}
