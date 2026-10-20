import { BRAND } from '@/lib/brand';

export default function Wordmark({ className = '' }: { className?: string }) {
  if (BRAND.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={BRAND.logo} alt={BRAND.name} className={`logo ${className}`} />;
  }
  const [first, ...rest] = BRAND.name.toUpperCase().split(' ');
  return (
    <span className={`wordmark ${className}`}>
      <span>{first}</span>
      {rest.length > 0 && <span className="wordmark-accent">{rest.join(' ')}</span>}
    </span>
  );
}
