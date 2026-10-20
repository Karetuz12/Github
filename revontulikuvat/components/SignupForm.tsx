'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/brand';
import { STRINGS as t, fill } from '@/lib/strings';
import { normalizeEmail, normalizeGroup, suggestEmail } from '@/lib/validate';
import Wordmark from './Wordmark';

type Status = 'idle' | 'sending' | 'done';

export default function SignupForm({ group: fixedGroup }: { group: string | null }) {
  const [group, setGroup] = useState(fixedGroup ?? '');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<'email' | 'group' | 'server' | null>(null);
  const [sentTo, setSentTo] = useState('');
  const suggestion = email.includes('@') ? suggestEmail(email) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanGroup = normalizeGroup(group);
    const cleanEmail = normalizeEmail(email);
    if (!cleanGroup) return setError('group');
    if (!cleanEmail) return setError('email');
    setError(null);
    setStatus('sending');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: cleanGroup, email: cleanEmail, website }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.ok) {
        setError(data?.error === 'email' || data?.error === 'group' ? data.error : 'server');
        setStatus('idle');
        return;
      }
      setSentTo(cleanEmail);
      setStatus('done');
    } catch {
      setError('server');
      setStatus('idle');
    }
  }

  function again() {
    setEmail('');
    setStatus('idle');
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
            <h1>{t.doneTitle}</h1>
            <p className="lead">
              {t.doneText.split('{email}').map((part, i) => (
                <span key={i}>
                  {i > 0 && <strong className="sent-to">{sentTo}</strong>}
                  {part}
                </span>
              ))}
            </p>
            <button type="button" className="button secondary" onClick={again}>
              {t.again}
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">{t.tour}</p>
            <h1>{t.title}</h1>
            <p className="lead">{t.lead}</p>

            <form onSubmit={submit} noValidate>
              {fixedGroup ? (
                <p className="group-chip">
                  {t.group} <strong>{fixedGroup}</strong>
                </p>
              ) : (
                <div className="field">
                  <label htmlFor="group">{t.groupInput}</label>
                  <input
                    id="group"
                    name="group"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={10}
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    aria-invalid={error === 'group'}
                    aria-describedby="group-help"
                  />
                  <p id="group-help" className="help">
                    {error === 'group' ? <span className="error">{t.errGroup}</span> : t.groupHelp}
                  </p>
                </div>
              )}

              <div className="field">
                <label htmlFor="email">{t.email}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error === 'email'}
                  aria-describedby="email-help"
                />
                <p id="email-help" className="help">
                  {error === 'email' && <span className="error">{t.errEmail} </span>}
                  {suggestion && (
                    <button type="button" className="suggestion" onClick={() => setEmail(suggestion)}>
                      {fill(t.didYouMean, { email: suggestion })}
                    </button>
                  )}
                </p>
              </div>

              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              {error === 'server' && <p className="error form-error">{t.errServer}</p>}

              <button type="submit" className="button" disabled={status === 'sending'}>
                {status === 'sending' ? t.sending : t.submit}
              </button>
            </form>
          </>
        )}
      </section>

      <footer className="foot">
        <p>
          {fill(t.privacy, { days: BRAND.retentionDays })}
          {BRAND.privacyUrl && (
            <>
              {' '}
              <a href={BRAND.privacyUrl} target="_blank" rel="noopener noreferrer">
                {t.privacyLink}
              </a>
            </>
          )}
        </p>
      </footer>
    </main>
  );
}
