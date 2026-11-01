import { NextResponse } from 'next/server';
import { tarkistaYhteydenotto } from '@/lib/lomake';

// Yhteydenotot menevät Laskutusmoottorin Liidit-välilehdelle Apps Scriptin web-osoitteen kautta
// (laskutusmoottori.gs: doPost). Salaisuus estää muita kirjoittamasta taulukkoon.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'server' }, { status: 400 });
  }

  // Piilokenttä, jonka vain botit täyttävät: näytetään onnistuminen, ei tallenneta mitään
  if (body.kotisivu) return NextResponse.json({ ok: true });

  const tulos = tarkistaYhteydenotto(body);
  if (!tulos.ok) return NextResponse.json({ ok: false, error: tulos.virhe }, { status: 400 });

  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) {
    console.error('APPS_SCRIPT_URL tai APPS_SCRIPT_SECRET puuttuu');
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }

  try {
    // Apps Script vastaa POSTiin uudelleenohjauksella tulokseen; fetch seuraa sitä
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, lahde: 'puregroundwork', ...tulos.data }),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!data?.ok) {
      console.error('Apps Script hylkäsi yhteydenoton', res.status, data?.error);
      return NextResponse.json({ ok: false, error: 'server' }, { status: 502 });
    }
  } catch (err) {
    console.error('Apps Script -pyyntö epäonnistui', err);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
