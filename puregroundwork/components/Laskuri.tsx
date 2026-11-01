'use client';

import { useEffect, useRef, useState } from 'react';

const muoto = (n: number) => Math.round(n).toLocaleString('fi-FI');

// Luku laskee nollasta tavoitteeseen, kun se tulee näkyviin. Ilman JavaScriptiä näkyy suoraan lopullinen luku.
export function Laskuri({ arvo, ennen = '', jalkeen = '' }: { arvo: number; ennen?: string; jalkeen?: string }) {
  const [naytetty, setNaytetty] = useState(arvo);
  const viite = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = viite.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    setNaytetty(0);
    let kehys = 0;
    const tarkkailija = new IntersectionObserver(([r]) => {
      if (!r.isIntersecting) return;
      tarkkailija.disconnect();
      const alku = performance.now();
      const kesto = 1400;
      const askel = (nyt: number) => {
        const t = Math.min(1, (nyt - alku) / kesto);
        setNaytetty(arvo * (1 - Math.pow(1 - t, 3)));
        if (t < 1) kehys = requestAnimationFrame(askel);
      };
      kehys = requestAnimationFrame(askel);
    }, { threshold: 0.4 });
    tarkkailija.observe(el);
    return () => {
      tarkkailija.disconnect();
      cancelAnimationFrame(kehys);
    };
  }, [arvo]);

  return (
    <span ref={viite}>
      <span className="vain-ruudunlukija">{`${ennen}${muoto(arvo)}${jalkeen}`}</span>
      <span aria-hidden="true">
        {ennen}
        {muoto(naytetty)}
        {jalkeen}
      </span>
    </span>
  );
}
