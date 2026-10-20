import { notFound } from 'next/navigation';
import SignupForm from '@/components/SignupForm';
import { normalizeGroup } from '@/lib/validate';

// QR card link, e.g. /7 – the group number comes from the address.
export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const clean = normalizeGroup(decodeURIComponent(group));
  if (!clean) notFound();
  return <SignupForm group={clean} />;
}
