import { NextResponse } from 'next/server';
import { groupCode, normalizeText } from '@/lib/validate';

// A guide logs which group they took and which camera they used.
// Stored on the Guides sheet through the same Apps Script web app as the sign-ups.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const group = groupCode(body.type === 'small' ? 'small' : 'bus', body.number);
  const guide = normalizeText(body.guide, 40);
  const camera = normalizeText(body.camera, 20);
  if (!group || !guide || !camera) {
    return NextResponse.json({ ok: false, error: !group ? 'group' : !guide ? 'guide' : 'camera' }, { status: 400 });
  }

  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) {
    console.error('APPS_SCRIPT_URL or APPS_SCRIPT_SECRET is not set');
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, kind: 'guide', group, guide, camera }),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!data?.ok) {
      console.error('Apps Script rejected the guide log', res.status, data?.error);
      return NextResponse.json({ ok: false, error: 'server' }, { status: 502 });
    }
  } catch (err) {
    console.error('Apps Script request failed', err);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
