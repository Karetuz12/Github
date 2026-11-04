import type { Metadata } from 'next';
import GuideForm from '@/components/GuideForm';

export const metadata: Metadata = {
  title: 'Guides – Northern lights photos',
  robots: { index: false, follow: false },
};

// Guides log tonight's group, their name and camera here. Not linked from the customer pages.
export default function GuidePage() {
  return <GuideForm />;
}
