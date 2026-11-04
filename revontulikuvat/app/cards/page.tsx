import { headers } from 'next/headers';
import QRCode from 'qrcode';
import type { Metadata } from 'next';
import Wordmark from '@/components/Wordmark';
import PrintButton from './PrintButton';
import { groupLabel, normalizeGroup } from '@/lib/validate';
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
 * /cards?from=1&to=20 (bus groups, default 1–20), /cards?type=small (small groups, default 1–25)
 * or /cards?groups=A1,A2,B1 for named groups.
 */
export default async function Cards({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; groups?: string; type?: string }>;
}) {
  const params = await searchParams;
  const base = await siteUrl();

  const small = params.type === 'small';
  let groups: (string | null)[];
  if (params.groups) {
    groups = params.groups.split(',').map((g) => normalizeGroup(g)).filter((g): g is string => !!g);
  } else {
    const start = toInt(params.from, 1);
    const end = Math.max(start, toInt(params.to, small ? 25 : 20));
    groups = Array.from({ length: end - start + 1 }, (_, i) => (small ? 'S' : '') + (start + i));
  }
  groups = groups.slice(0, MAX_CARDS);
  if (!small) groups.push(null); // null = general card without a group
  const groupCount = groups.filter(Boolean).length;

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
          <strong>QR cards</strong> – {groupCount} {small ? 'Small Group' : 'Bus Group'} cards
          {groupCount < cards.length && ' + 1 general card'}. Print on A4, cut along the dashed lines and laminate.
          <br />
          <span className="hint">
            <a href="/cards">Bus Groups 1–20</a> · <a href="/cards?type=small">Small Groups 1–25</a> · other ranges:{' '}
            <code>?from=21&amp;to=40</code>, <code>?type=small&amp;from=26&amp;to=30</code>. Cards point to{' '}
            <code>{base}</code>. Guides log their name and camera at <a href="/guide">{base}/guide</a>.
          </span>
        </div>
        <PrintButton />
      </div>

      <div className="sheet">
        {cards.map(({ group, url, svg }) => {
          // Small Group cards look clearly different so they don't get mixed up with bus group cards
          const smallNumber = group?.match(/^S(\d+)$/)?.[1];
          return (
          <article className={`qr-card${smallNumber ? ' small' : ''}`} key={group ?? 'general'}>
            {smallNumber ? (
              <>
                <div className="small-band">
                  <span className="small-band-label">SMALL GROUP</span>
                  <span className="small-band-brand">Book Lapland · Northern lights photos</span>
                </div>
                <p className="small-number">{smallNumber}</p>
              </>
            ) : (
              <>
                <div className="qr-card-top">
                  <Wordmark className="dark" />
                </div>
                <p className="qr-card-title">Your northern lights photos</p>
                <p className="qr-card-group">{group ? groupLabel(group).toUpperCase() : 'TOUR PHOTOS'}</p>
              </>
            )}
            <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="qr-card-cta">Scan &amp; leave your email</p>
            <p className="qr-card-sub">We&apos;ll send you the photos from tonight&apos;s tour.</p>
            <p className="qr-card-url">{url.replace(/^https?:\/\//, '')}</p>
          </article>
          );
        })}
      </div>
    </div>
  );
}
