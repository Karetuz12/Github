import { z } from "zod";
import { REQUEST_KINDS, ROOM_SLUGS, SECTION_KINDS, type Content, type ContentKey } from "./types";

// Hallinnan tallennukset tarkistetaan näillä ennen tietokantaan vientiä.

const rooms = z.array(z.enum(ROOM_SLUGS));
const opt = z.string().optional();

const action = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("request"), request: z.enum(REQUEST_KINDS), label: z.string().min(1), preset: opt }),
  z.object({ kind: z.literal("link"), href: z.string().min(1), label: z.string().min(1) }),
  z.object({ kind: z.literal("embed"), href: z.string().min(1), label: z.string().min(1) }),
  z.object({ kind: z.literal("call"), phone: z.string().min(1), label: z.string().min(1) }),
  z.object({ kind: z.literal("whatsapp"), label: z.string().min(1), text: opt }),
  z.object({ kind: z.literal("wifi"), label: z.string().min(1) }),
]);

const item = z.object({
  id: z.string().min(1),
  eyebrow: opt,
  title: z.string(),
  meta: opt,
  metaNote: opt,
  body: z.string(),
  actions: z.array(action).optional(),
});

const section = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "Tunniste: pienet kirjaimet, numerot ja väliviivat"),
  kind: z.enum(SECTION_KINDS),
  nav: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  intro: opt,
  image: opt,
  items: z.array(item),
  footnote: opt,
  bokunProducts: z.array(z.object({ bokunId: z.string().regex(/^\d+$/, "Bokun-ID on numero"), label: z.string().min(1), note: opt, group: opt, exclusive: z.boolean().optional() })).optional(),
  rooms,
  visible: z.boolean(),
  check: opt,
});

const room = z.object({
  slug: z.enum(ROOM_SLUGS),
  name: z.string().min(1),
  official: z.string(),
  noun: z.string().min(1),
  title: z.string().min(1),
  intro: z.string(),
  facts: z.string(),
  heroImage: z.string(),
  cardImage: z.string(),
  floorPlan: opt,
  check: opt,
});

const time = z.string().regex(/^\d{2}:\d{2}$/, "Kellonaika muodossa 18:00");

const settings = z.object({
  receptionCall: z.string().min(5),
  whatsapp: z.string().regex(/^\+?[\d\s]{7,}$/, "WhatsApp-numero muodossa +358 40 …"),
  receptionHours: z.string(),
  wifiNetwork: z.string(),
  wifiPassword: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  breakfastHours: z.string(),
  breakfastPrice: z.coerce.number().min(0),
  breakfastWindow: z.string(),
  breakfastCutoff: time,
  auraHours: z.string(),
  auraFrom: time,
  auraTo: time,
  lightsOff: z.string(),
  quietHours: z.string(),
  auraPhone: z.string(),
  cultaPhone: z.string(),
  safariPhone: z.string(),
  auraUrl: z.string(),
  auraBookingUrl: z.string(),
  cultaUrl: z.string(),
  appIos: z.string(),
  appAndroid: z.string(),
  address: z.string(),
  notice: z.string(),
  noticeTone: z.enum(["info", "alert"]),
  rideRooms: rooms,
  checks: z.record(z.string(), z.string()),
});

const programme = z.object({
  eyebrow: z.string(),
  title: z.string(),
  intro: z.string(),
  noBooking: z.string(),
  entries: z.array(
    z.object({
      id: z.string().min(1),
      days: z.string(),
      daysShort: z.string(),
      time: z.string(),
      duration: z.string(),
      title: z.string().min(1),
      body: z.string(),
      location: z.string(),
    }),
  ),
  notes: z.string(),
  selfGuided: item,
  season: opt,
  comingSoon: z.boolean().optional(),
  comingSoonText: opt,
  rooms,
  visible: z.boolean(),
  check: opt,
});

const activities = z.object({
  eyebrow: z.string(),
  title: z.string(),
  intro: z.string(),
  note: z.string(),
  items: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      body: z.string(),
      duration: opt,
      priceFrom: opt,
      image: opt,
      bokunId: z.string().regex(/^\d*$/, "Bokun-ID on numero").optional(),
      rooms,
      visible: z.boolean(),
    }),
  ),
  rooms,
  visible: z.boolean(),
});

export const contentSchemas = {
  settings,
  rooms: z.array(room).length(ROOM_SLUGS.length),
  sections: z.array(section),
  programme,
  activities,
} satisfies Record<ContentKey, z.ZodType>;

export function parseDoc<K extends ContentKey>(key: K, data: unknown): { ok: true; data: Content[K] } | { ok: false; error: string } {
  const r = contentSchemas[key].safeParse(data);
  if (r.success) return { ok: true, data: r.data as Content[K] };
  const first = r.error.issues[0];
  return { ok: false, error: `${first.path.join(" › ") || "Tieto"}: ${first.message}` };
}
