import { headers } from 'next/headers';
import QRCode from 'qrcode';
import type { Metadata } from 'next';
import Wordmark from '@/components/Wordmark';
import PrintButton from './PrintButton';
import { normalizeGroup } from '@/lib/validate';
import './kortit.css';

export const metadata: Metadata = { title: 'QR-kortit – Book Lapland' };

const MAX_CARDS = 80;

async function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function toInt(value: string | undefined, fallback: number) {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Printable QR cards, four per A4 page.
 * /kortit?alku=1&loppu=20 (default 1–20), or /kortit?ryhmat=A1,A2,B1 for named groups.
 */
export default async function Cards({
  searchParams,
}: {
  searchParams: Promise<{ alku?: string; loppu?: string; ryhmat?: string }>;
}) {
  const params = await searchParams;
  const base = await siteUrl();

  let groups: (string | null)[];
  if (params.ryhmat) {
    groups = params.ryhmat.split(',').map((g) => normalizeGroup(g)).filter((g): g is string => !!g);
  } else {
    const start = toInt(params.alku, 1);
    const end = Math.max(start, toInt(params.loppu, 20));
    groups = Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
  }
  groups = [...groups.slice(0, MAX_CARDS), null]; // null = general card without a group

  const cards = await Promise.all(
    groups.map(async (group) => {
      const url = group ? `${base}/${encodeURIComponent(group)}` : base;
      const svg = await QRCode.toString(url, {
        type: 'svg',
        margin: 0,
        errorCorrectionLevel: 'M',
        color: { dark: '#07111f', light: '#ffffff' },
      });
      return { group, url, svg };
    }),
  );

  return (
    <div className="cards-page">
      <div className="toolbar">
        <div>
          <strong>QR-kortit</strong> – {cards.length - 1} ryhmäkorttia + yleiskortti. Tulosta A4:lle, leikkaa
          katkoviivoja pitkin ja laminoi.
          <br />
          <span className="hint">
            Muut ryhmät osoitteella <code>/kortit?alku=21&amp;loppu=40</code> tai <code>/kortit?ryhmat=A1,A2</code>.
            Kortit osoittavat sivulle <code>{base}</code>.
          </span>
        </div>
        <PrintButton />
      </div>

      <div className="sheet">
        {cards.map(({ group, url, svg }) => (
          <article className="qr-card" key={group ?? 'general'}>
            <div className="qr-card-top">
              <Wordmark className="dark" />
            </div>
            <p className="qr-card-title">Your northern lights photos</p>
            <p className="qr-card-group">{group ? `GROUP ${group}` : 'TOUR PHOTOS'}</p>
            <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="qr-card-cta">Scan &amp; leave your email</p>
            <p className="qr-card-sub">We&apos;ll send you the photos from tonight&apos;s tour.</p>
            <p className="qr-card-url">{url.replace(/^https?:\/\//, '')}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
