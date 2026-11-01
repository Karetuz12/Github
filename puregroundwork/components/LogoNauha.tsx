import {
  siBrevo, siElementor, siFacebook, siFigma, siGoogle, siGoogleads, siGoogleanalytics, siGooglesearchconsole, siGoogletagmanager,
  siHubspot, siInstagram, siMailchimp, siMeta, siNextdotjs, siShopify, siTiktok, siVercel, siWoocommerce, siWordpress, siYoutube,
} from 'simple-icons';

type Ikoni = { path: string; hex: string };

const kuvakkeet: Record<string, Ikoni> = {
  Meta: siMeta, Facebook: siFacebook, Instagram: siInstagram, Google: siGoogle, 'Google Ads': siGoogleads,
  'Google Analytics': siGoogleanalytics, 'Google Tag Manager': siGoogletagmanager, 'Search Console': siGooglesearchconsole,
  WordPress: siWordpress, WooCommerce: siWoocommerce, Shopify: siShopify, Elementor: siElementor, 'Next.js': siNextdotjs,
  Vercel: siVercel, TikTok: siTiktok, YouTube: siYoutube, Mailchimp: siMailchimp, HubSpot: siHubspot, Brevo: siBrevo, Figma: siFigma,
};

export function BrandiKuvake({ nimi, koko = 22 }: { nimi: string; koko?: number }) {
  const k = kuvakkeet[nimi];
  if (!k) return null;
  return (
    <svg width={koko} height={koko} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ ['--brandi' as string]: `#${k.hex}` }}>
      <path d={k.path} fill="currentColor" />
    </svg>
  );
}

// Loputtomasti liikkuva nauha. Lista toistetaan kahdesti, jotta liike jatkuu saumattomasti.
export function LogoNauha({ nimet, nopeus = 48 }: { nimet: string[]; nopeus?: number }) {
  const rivi = nimet.filter((n) => kuvakkeet[n]);
  return (
    <div className="nauha" style={{ ['--kesto' as string]: `${nopeus}s` }}>
      <ul className="nauha-rata" aria-label="Alustat ja työkalut">
        {[...rivi, ...rivi].map((n, i) => (
          <li key={`${n}-${i}`} className="nauha-pala" aria-hidden={i >= rivi.length}>
            <BrandiKuvake nimi={n} />
            <span>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
