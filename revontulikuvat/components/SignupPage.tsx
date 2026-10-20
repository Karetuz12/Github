import { headers } from 'next/headers';
import { detectLang, isLang } from '@/lib/i18n';
import SignupForm from './SignupForm';

/** Server wrapper: picks the starting language from ?lang= or the browser. */
export default async function SignupPage({ group, langParam }: { group: string | null; langParam?: string }) {
  const lang = isLang(langParam) ? langParam : detectLang((await headers()).get('accept-language'));
  return <SignupForm group={group} initialLang={lang} />;
}
