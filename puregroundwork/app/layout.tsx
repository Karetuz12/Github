import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Alapalkki, Tausta } from '@/components/Rakenne';
import { Efektit } from '@/components/Efektit';
import { JsonLd } from '@/components/JsonLd';
import { Ylapalkki } from '@/components/Ylapalkki';
import { organisaatioJsonLd } from '@/lib/seo';
import { henkilo, yritys } from '@/lib/sisalto';

// Nordic Hostin brändifontti: Inter. Optinen koko (opsz) tekee isoista otsikoista tiiviin display-leikkauksen automaattisesti.
const fontti = Inter({ subsets: ['latin'], axes: ['opsz'], variable: '--fontti', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(yritys.osoite),
  title: { default: `${yritys.brandi} – markkinoinnin perusta ja verkkosivut`, template: `%s | ${yritys.brandi}` },
  description: yritys.kuvaus,
  applicationName: yritys.brandi,
  authors: [{ name: henkilo.nimi }],
  creator: henkilo.nimi,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: yritys.brandi, locale: 'fi_FI', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#040a1f', width: 'device-width', initialScale: 1, colorScheme: 'dark' };

// Seurannat: aseta Vercelissä NEXT_PUBLIC_GTM_ID (esim. GTM-XXXXXXX). Tyhjä = ei seurantaa.
const gtm = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className={fontti.variable}>
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
        <JsonLd data={organisaatioJsonLd()} />
      </body>
    </html>
  );
}
