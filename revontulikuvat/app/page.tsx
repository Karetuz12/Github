import SignupForm from '@/components/SignupForm';

// General link without a group: the customer types the group number.
export default function Home() {
  return <SignupForm group={null} />;
}
