'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Kaksi kevyttä efektiä koko sivustolle:
// 1) .ilmesty-elementit liukuvat näkyviin, kun ne tulevat näkymään
// 2) .lasi-pinnoilla valo seuraa osoitinta (liquid glass -heijastus)
export function Efektit() {
  const polku = usePathname();
  useEffect(() => {
    const vahennaLiiketta = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elementit = Array.from(document.querySelectorAll<HTMLElement>('.ilmesty:not(.nakyvissa)'));
    let tarkkailija: IntersectionObserver | null = null;
    if (vahennaLiiketta || !('IntersectionObserver' in window)) {
      elementit.forEach((e) => e.classList.add('nakyvissa'));
    } else {
      tarkkailija = new IntersectionObserver((rivit) => {
        rivit.forEach((r) => {
          if (r.isIntersecting) {
            r.target.classList.add('nakyvissa');
            tarkkailija?.unobserve(r.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      elementit.forEach((e) => tarkkailija!.observe(e));
    }

    const liike = (e: PointerEvent) => {
      const kohde = (e.target as HTMLElement | null)?.closest<HTMLElement>('.lasi');
      if (!kohde) return;
      const r = kohde.getBoundingClientRect();
      kohde.style.setProperty('--mx', `${e.clientX - r.left}px`);
      kohde.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    if (!vahennaLiiketta) document.addEventListener('pointermove', liike, { passive: true });
    return () => {
      tarkkailija?.disconnect();
      document.removeEventListener('pointermove', liike);
    };
  }, [polku]);
  return null;
}
