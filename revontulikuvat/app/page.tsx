import SignupPage from '@/components/SignupPage';

// General link without a group: the customer types the group number.
export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  return <SignupPage group={null} langParam={lang} />;
}
