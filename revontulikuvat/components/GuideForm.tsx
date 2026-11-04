'use client';

import { useEffect, useState } from 'react';
import { groupCode, groupLabel, normalizeText, type TourType } from '@/lib/validate';
import Wordmark from './Wordmark';

const SAVED = 'bl-guide'; // the phone remembers the guide's name and camera

type Status = 'idle' | 'sending' | 'done';
type Field = 'group' | 'guide' | 'camera' | 'server';

export default function GuideForm() {
  const [type, setType] = useState<TourType>('bus');
  const [number, setNumber] = useState('');
  const [guide, setGuide] = useState('');
  const [camera, setCamera] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Field | null>(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVED) || '{}');
      if (typeof stored.guide === 'string') setGuide(stored.guide);
      if (typeof stored.camera === 'string') setCamera(stored.camera);
      if (stored.type === 'small' || stored.type === 'bus') setType(stored.type);
    } catch {
      // private mode or blocked storage: start empty
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = groupCode(type, number);
    const cleanGuide = normalizeText(guide, 40);
    const cleanCamera = normalizeText(camera, 20);
    if (!code) return setError('group');
    if (!cleanGuide) return setError('guide');
    if (!cleanCamera) return setError('camera');
    setError(null);
    setStatus('sending');
    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, number, guide: cleanGuide, camera: cleanCamera }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.ok) {
        setError(['group', 'guide', 'camera'].includes(data?.error) ? data.error : 'server');
        setStatus('idle');
        return;
      }
      try {
        localStorage.setItem(SAVED, JSON.stringify({ guide: cleanGuide, camera: cleanCamera, type }));
      } catch {
        // not remembered next time, nothing else breaks
      }
      setSaved(`${groupLabel(code)} · ${cleanGuide} · Camera ${cleanCamera}`);
      setStatus('done');
    } catch {
      setError('server');
      setStatus('idle');
    }
  }

  return (
    <main className="page">
      <div className="sky" aria-hidden="true">
        <div className="stars" />
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
      </div>

      <header className="top">
        <Wordmark />
      </header>

      <section className="card" aria-live="polite">
        {status === 'done' ? (
          <div className="done">
            <div className="check" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1>Saved</h1>
            <p className="lead">
              <strong className="sent-to">{saved}</strong>
              <br />
              The photo team will see this next to the group&apos;s emails. Have a great tour!
            </p>
            <button type="button" className="button secondary" onClick={() => { setNumber(''); setStatus('idle'); }}>
              Log another group
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">For guides</p>
            <h1>Tonight&apos;s tour</h1>
            <p className="lead">Log your group and camera so the photos go to the right customers.</p>

            <form onSubmit={submit} noValidate>
              <div className="field">
                <span className="label" id="type-label">Tour type</span>
                <div className="segmented" role="radiogroup" aria-labelledby="type-label">
                  {(['bus', 'small'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={type === value}
                      className={type === value ? 'active' : ''}
                      onClick={() => setType(value)}
                    >
                      {value === 'bus' ? 'Bus Group' : 'Small Group'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="number">Group number</label>
                <input
                  id="number"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={3}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  aria-invalid={error === 'group'}
                />
                {error === 'group' && <p className="help error">Enter the group number (e.g. 7).</p>}
              </div>

              <div className="field">
                <label htmlFor="guide">Your name</label>
                <input
                  id="guide"
                  autoComplete="name"
                  maxLength={40}
                  value={guide}
                  onChange={(e) => setGuide(e.target.value)}
                  aria-invalid={error === 'guide'}
                />
                {error === 'guide' && <p className="help error">Enter your name.</p>}
              </div>

              <div className="field">
                <label htmlFor="camera">Camera</label>
                <input
                  id="camera"
                  autoComplete="off"
                  maxLength={20}
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  aria-invalid={error === 'camera'}
                />
                {error === 'camera' && <p className="help error">Enter the camera number or name.</p>}
              </div>

              {error === 'server' && <p className="error form-error">Could not save. Please try again in a moment.</p>}

              <button type="submit" className="button" disabled={status === 'sending'}>
                {status === 'sending' ? 'Saving…' : 'Save'}
              </button>
            </form>
          </>
        )}
      </section>

      <footer className="foot">
        <p>Your name and camera are remembered on this phone for next time.</p>
      </footer>
    </main>
  );
}
