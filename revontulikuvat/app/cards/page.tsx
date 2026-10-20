import { headers } from 'next/headers';
import QRCode from 'qrcode';
import type { Metadata } from 'next';
import Wordmark from '@/components/Wordmark';
import PrintButton from './PrintButton';
import { normalizeGroup } from '@/lib/validate';
import './cards.css';

export const metadata: Metadata = { title: 'QR cards – Book Lapland' };

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
 * /cards?from=1&to=20 (default 1–20), or /cards?groups=A1,A2,B1 for named groups.
 */
export default async function Cards({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; groups?: string }>;
}) {
  const params = await searchParams;
  const base = await siteUrl();

  let groups: (string | null)[];
  if (params.groups) {
    groups = params.groups.split(',').map((g) => normalizeGroup(g)).filter((g): g is string => !!g);
  } else {
    const start = toInt(params.from, 1);
    const end = Math.max(start, toInt(params.to, 20));
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
          <strong>QR cards</strong> – {cards.length - 1} group cards + 1 general card. Print on A4, cut along the
          dashed lines and laminate.
          <br />
          <span className="hint">
            Other groups: <code>/cards?from=21&amp;to=40</code> or <code>/cards?groups=A1,A2</code>. The cards
            point to <code>{base}</code>.
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
