import { notFound } from 'next/navigation';
import SignupPage from '@/components/SignupPage';
import { normalizeGroup } from '@/lib/validate';

// QR card link, e.g. /7 – the group number comes from the address.
export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [{ group }, { lang }] = await Promise.all([params, searchParams]);
  const clean = normalizeGroup(decodeURIComponent(group));
  if (!clean) notFound();
  return <SignupPage group={clean} langParam={lang} />;
}
