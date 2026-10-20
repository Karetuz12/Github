// Book Lapland brand settings. Colours live in app/globals.css (:root).
export const BRAND = {
  name: 'Book Lapland',
  // Put the logo in public/ (e.g. public/logo.svg) and set the path here.
  // While null, the name is shown as a text wordmark.
  logo: null as string | null,
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || '',
  retentionDays: 30,
};
