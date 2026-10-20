// Shared by the form (browser) and the API route (server).

const EMAIL = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const GROUP = /^[A-Za-z0-9-]{1,10}$/;

/** Trimmed, lower-cased email, or null if it is not a valid address. */
export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const email = input.trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return null;
  // A leading = + - would be read as a formula in Google Sheets
  if (/^[=+\-]/.test(email)) return null;
  return email;
}

/** Group number/code as typed by the guide, or null if invalid. */
export function normalizeGroup(input: unknown): string | null {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  const group = String(input).trim().toUpperCase();
  if (!GROUP.test(group) || /^-/.test(group)) return null;
  return group;
}

const COMMON_DOMAINS = [
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.it',
  'outlook.com', 'live.com', 'msn.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'icloud.com', 'me.com', 'aol.com', 'gmx.de', 'gmx.net', 'web.de', 't-online.de',
  'orange.fr', 'free.fr', 'libero.it', 'qq.com', '163.com', 'protonmail.com', 'proton.me',
];

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** "anna@gmial.com" → "anna@gmail.com". Null when the domain looks fine. */
export function suggestEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const domain = email.slice(at + 1);
  // Short domains are too easy to "correct" into a real but different one
  if (domain.length < 7 || !domain.includes('.') || COMMON_DOMAINS.includes(domain)) return null;
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const known of COMMON_DOMAINS) {
    const d = distance(domain, known);
    if (d < bestDistance) {
      best = known;
      bestDistance = d;
    }
  }
  const limit = domain.length >= 8 ? 2 : 1;
  return best && bestDistance <= limit ? email.slice(0, at + 1) + best : null;
}
