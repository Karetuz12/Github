import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap' });

export const metadata: Metadata = {
  title: `Northern lights photos – ${BRAND.name}`,
  description: 'Leave your email and we will send you the photos from your northern lights tour.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#07111f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
