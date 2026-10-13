// Sivuston koko sisältö. Oletukset: defaults.ts. Hallinta tallentaa kunkin
// avaimen (settings, rooms, sections, programme, activities) kokonaisena
// JSON-dokumenttina tietokantaan, ja tallennettu versio ohittaa oletuksen.

export const ROOM_SLUGS = ["king", "suite", "aurora-cabin"] as const; // järjestys = valintasivun järjestys
export type RoomSlug = (typeof ROOM_SLUGS)[number];

export const isRoomSlug = (s: string): s is RoomSlug => (ROOM_SLUGS as readonly string[]).includes(s);

/** Pyyntötyypit avaavat valmiin WhatsApp-viestin vastaanottoon (lib/requests.ts). */
export const REQUEST_KINDS = ["breakfast", "aura", "culta", "activity", "taxi", "ride", "general"] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];

/** Painike kohteen alla. Yksi per kohde riittää; useampi = rivissä. */
export type Action =
  | { kind: "request"; request: RequestKind; label: string; preset?: string }
  | { kind: "link"; href: string; label: string }
  | { kind: "embed"; href: string; label: string } // varausikkuna sivun päälle (ResDiary)
  | { kind: "call"; phone: string; label: string }
  | { kind: "whatsapp"; label: string; text?: string }
  | { kind: "wifi"; label: string };

export type Item = {
  id: string;
  eyebrow?: string; // pieni yläotsikko kortissa, esim. "INCLUDED IN YOUR STAY"
  title: string;
  meta?: string; // iso aika/tieto, esim. "07:00–11:00"
  metaNote?: string; // pieni teksti metan alla, esim. "every morning"
  body: string; // kappaleet erotetaan tyhjällä rivillä
  actions?: Action[];
};

/**
 * Osion ulkoasu. Sisältökentät ovat kaikille samat; kind määrää vain, miten
 * ne piirretään (kortit, haitari, tumma kaista…).
 */
export const SECTION_KINDS = ["cards", "accordion", "feature", "programme", "activities", "aurora", "help"] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];

/** Saman group-nimen liput varataan yhdessä ikkunassa ja maksetaan kerralla (esim. naisten + miesten lippu). */
// exclusive = varaa koko tilan (esim. Private spa): näkyy vapaana vain kun muut saman osion liput ovat täysin vapaina, ja estää muiden myynnin.
export type BokunTicket = { bokunId: string; label: string; note?: string; group?: string; exclusive?: boolean };

export type Section = {
  id: string; // ankkuri, esim. "dining"
  kind: SectionKind;
  nav: string; // lyhyt nimi sivun pikavalikossa
  eyebrow: string;
  title: string; // rivinvaihto \n
  intro?: string;
  image?: string; // /images/… (feature-osio)
  items: Item[];
  footnote?: string;
  bokunProducts?: BokunTicket[]; // varattavat Bokun-tuotteet osiossa (esim. Cultan liput)
  rooms: RoomSlug[]; // millä huonesivuilla osio näkyy
  visible: boolean;
  check?: string; // hallinnan muistiinpano: mitä pitää vielä vahvistaa (ei näy vieraalle)
};

export type Room = {
  slug: RoomSlug;
  name: string; // "King Igloo"
  official: string; // "Signature Igloo Suite King"
  noun: string; // "igloo" / "cabin" – korvaa {{room}} teksteissä
  title: string; // "Your King Igloo."
  intro: string;
  facts: string; // "60 m² · up to 5 guests · two floors"
  heroImage: string;
  cardImage: string;
  floorPlan?: string;
  check?: string;
};

export type ProgrammeEntry = {
  id: string;
  days: string; // "Monday & Thursday"
  daysShort: string; // "Mon & Thu"
  time: string; // "10:00–10:30"
  duration: string; // "30 minutes"
  title: string;
  body: string;
  location: string;
};

export type Programme = {
  eyebrow: string;
  title: string;
  intro: string;
  noBooking: string;
  entries: ProgrammeEntry[];
  notes: string; // "Before you join" -kappaleet
  selfGuided: Item;
  season?: string; // esim. "1 Dec 2026 – 15 Apr 2027"; tyhjä = ei näytetä
  comingSoon?: boolean; // true = ohjelmakortit piiloon, tilalla comingSoonText (omatoimiset näkyvät)
  comingSoonText?: string;
  rooms: RoomSlug[];
  visible: boolean;
  check?: string;
};

export type Activity = {
  id: string;
  title: string; // näkyy myös pyyntölomakkeen valikossa
  body: string;
  duration?: string;
  priceFrom?: string; // "€169" (näytetään jos Bokun ei anna hintaa)
  image?: string;
  bokunId?: string; // Bokun-tuotteen ID; tyhjä = vain WhatsApp-pyyntö
  rooms: RoomSlug[];
  visible: boolean;
};

export type Activities = {
  eyebrow: string;
  title: string;
  intro: string;
  note: string;
  items: Activity[];
  rooms: RoomSlug[];
  visible: boolean;
};

export type Settings = {
  receptionCall: string; // "+358 20 767 1010"
  whatsapp: string; // "+358 40 130 5588"
  receptionHours: string; // "24 hours"
  wifiNetwork: string;
  wifiPassword: string;
  checkIn: string;
  checkOut: string;
  breakfastHours: string;
  breakfastPrice: number; // € / hlö, huoneeseen toimitus
  breakfastWindow: string; // "08:00–08:30"
  breakfastCutoff: string; // "18:00" edellisenä päivänä
  auraHours: string; // "17:00–23:00"
  auraFrom: string; // pyyntölomakkeen aikaväli
  auraTo: string;
  lightsOff: string; // "21:30"
  quietHours: string; // "23:00–07:00"
  auraPhone: string;
  cultaPhone: string;
  safariPhone: string;
  auraUrl: string;
  auraBookingUrl: string; // ResDiary-widget
  cultaUrl: string;
  appIos: string;
  appAndroid: string;
  address: string;
  notice: string; // ilmoituspalkki; tyhjä = ei näytetä
  noticeTone: "info" | "alert";
  rideRooms: RoomSlug[]; // millä sivuilla resort ride -pyyntö näkyy
  checks: Record<string, string>; // kenttäkohtaiset "vahvista"-muistiinpanot
};

export type Content = {
  settings: Settings;
  rooms: Room[];
  sections: Section[]; // järjestys = sivun järjestys (programme/activities sijoittuvat kindin mukaan)
  programme: Programme;
  activities: Activities;
};

export type ContentKey = keyof Content;
