'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Kevyet efektit koko sivustolle:
// 1) .ilmesty-elementit liukuvat näkyviin, kun ne tulevat näkymään
// 2) .lasi-pinnoilla valo seuraa osoitinta (liquid glass -heijastus)
// 3) .paljastus-tekstin sanat syttyvät vierityksen mukana
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

    // Sanat syttyvät sitä mukaa, kun teksti kulkee näkymän läpi
    const paljastukset = Array.from(document.querySelectorAll<HTMLElement>('.paljastus'));
    let kehys = 0;
    const paivita = () => {
      kehys = 0;
      const korkeus = window.innerHeight;
      paljastukset.forEach((p) => {
        const r = p.getBoundingClientRect();
        const edistys = Math.min(1, Math.max(0, (korkeus * 0.85 - r.top) / (r.height + korkeus * 0.35)));
        const sanat = p.querySelectorAll('.sana');
        const raja = Math.round(edistys * sanat.length);
        sanat.forEach((s, i) => {
          s.classList.toggle('paalla', i < raja);
          s.classList.toggle('karki', i < raja && i >= raja - 3 && edistys < 1);
        });
        p.closest<HTMLElement>('.paljastus-osio')?.style.setProperty('--edistys', edistys.toFixed(3));
      });
    };
    const vieritys = () => {
      if (!kehys) kehys = requestAnimationFrame(paivita);
    };
    if (paljastukset.length) {
      if (vahennaLiiketta) paljastukset.forEach((p) => p.querySelectorAll('.sana').forEach((s) => s.classList.add('paalla')));
      else {
        document.documentElement.classList.add('paljastus-kaytossa');
        paivita();
        window.addEventListener('scroll', vieritys, { passive: true });
        window.addEventListener('resize', vieritys, { passive: true });
      }
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
      window.removeEventListener('scroll', vieritys);
      window.removeEventListener('resize', vieritys);
      if (kehys) cancelAnimationFrame(kehys);
    };
  }, [polku]);
  return null;
}
