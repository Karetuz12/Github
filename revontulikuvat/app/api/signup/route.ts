import { NextResponse } from 'next/server';
import { normalizeEmail, normalizeGroup } from '@/lib/validate';

// Sign-ups are stored in Google Sheets through the Apps Script web app
// (apps-script/backend.gs). The secret keeps others from writing to the sheet.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  // Hidden field that only bots fill in: pretend success, store nothing
  if (body.website) return NextResponse.json({ ok: true });

  const group = normalizeGroup(body.group);
  const email = normalizeEmail(body.email);
  if (!group || !email) {
    return NextResponse.json({ ok: false, error: !group ? 'group' : 'email' }, { status: 400 });
  }

  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) {
    console.error('APPS_SCRIPT_URL or APPS_SCRIPT_SECRET is not set');
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }

  try {
    // Apps Script answers a POST with a redirect to the result; fetch follows it
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, group, email }),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!data?.ok) {
      console.error('Apps Script rejected the sign-up', res.status, data?.error);
      return NextResponse.json({ ok: false, error: 'server' }, { status: 502 });
    }
  } catch (err) {
    console.error('Apps Script request failed', err);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
