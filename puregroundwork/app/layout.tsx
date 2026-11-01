import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Alapalkki, Tausta } from '@/components/Rakenne';
import { Efektit } from '@/components/Efektit';
import { Ylapalkki } from '@/components/Ylapalkki';
import { henkilo, hero, yritys } from '@/lib/sisalto';

// Brändifontit. Vaihda Nordic Hostin fontteihin tässä – muuttujat --fontti-otsikko ja --fontti-teksti hoitavat loput.
const otsikkoFontti = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--fontti-otsikko', display: 'swap' });
const tekstiFontti = Inter({ subsets: ['latin'], variable: '--fontti-teksti', display: 'swap' });

const kuvaus = 'Seurannat, mainostilit, sivuston nopeus ja yhteydenottopolut kuntoon – ennen kuin mainontaan laitetaan euroakaan lisää.';

export const metadata: Metadata = {
  metadataBase: new URL(yritys.osoite),
  title: { default: `${yritys.brandi} – ${hero.otsikko.replace(/\.$/, '')}`, template: `%s – ${yritys.brandi}` },
  description: kuvaus,
  openGraph: { title: yritys.brandi, description: kuvaus, locale: 'fi_FI', type: 'website', siteName: yritys.brandi },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { themeColor: '#05070d', width: 'device-width', initialScale: 1, colorScheme: 'dark' };

// Seurannat: aseta Vercelissä NEXT_PUBLIC_GTM_ID (esim. GTM-XXXXXXX). Tyhjä = ei seurantaa.
const gtm = process.env.NEXT_PUBLIC_GTM_ID;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: yritys.brandi,
  url: yritys.osoite,
  description: kuvaus,
  areaServed: 'FI',
  founder: { '@type': 'Person', name: henkilo.nimi, jobTitle: henkilo.titteli, sameAs: henkilo.linkedin ? [henkilo.linkedin] : [] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className={`${otsikkoFontti.variable} ${tekstiFontti.variable}`}>
      <head>
        {/* Animaatiot piilottavat sisältöä vain, kun JavaScript on käytössä */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {gtm && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
        )}
        <a className="ohita" href="#paasisalto">
          Siirry sisältöön
        </a>
        <Tausta />
        <Ylapalkki />
        <main id="paasisalto">{children}</main>
        <Alapalkki />
        <Efektit />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
