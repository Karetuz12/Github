import { layout, toWorld, type Pt } from "./geo";
import type * as THREE from "three";

// Kartan kohteet. Tekstit Room Infon oletussisällöstä (lib/content/defaults.ts, 13.10.2026).
// `check` = vahvistettava asia, ei näy vieraalle.

export const CONTACT = {
  receptionCall: "+358 20 767 1010",
  whatsapp: "+358 40 130 5588",
  auraPhone: "+358 40 661 2146",
  cultaPhone: "+358 40 661 2537",
  safariPhone: "+358 40 661 2117",
  auraUrl: "https://skyviewigloos.com/restaurant-aura/",
  cultaUrl: "https://skyviewigloos.com/arctic-spa-culta/",
  address: "Olleronvaarantie 66, 96100 Rovaniemi",
};

export type Category = "stay" | "eat" | "activities" | "services";
export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "stay", label: "Stay" },
  { id: "eat", label: "Dining & spa" },
  { id: "activities", label: "Activities" },
  { id: "services", label: "Services" },
];

export type Action = { label: string; href: string; primary?: boolean };

export type Place = {
  id: string;
  cat: Category;
  icon: IconName;
  title: string;
  eyebrow: string;
  body: string;
  facts?: string[];
  actions?: Action[];
  image?: string; // /images/… (sama kuvapankki kuin Room Infossa); puuttuessa kortti näyttää kohdan kartalta
  at: THREE.Vector3; // merkin paikka (y = korkeus maasta)
  view?: { dist: number; azim?: number; polar?: number };
  /** Yksittäinen iglu tai mökki: merkki näkyy vain lähellä. */
  unit?: boolean;
  /** Merkki näkyy vasta, kun kamera on tätä lähempänä (m) – vähentää päällekkäisyyttä kokonaiskuvassa. */
  maxDist?: number;
  check?: string;
};

export type IconName = "igloo" | "cabin" | "bell" | "dining" | "spa" | "safari" | "fire" | "reindeer" | "parking" | "assembly" | "dome";

const wa = (text: string) => `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;
const at = (p: Pt, y: number, dx = 0, dz = 0) => toWorld(p, y).add({ x: dx, y: 0, z: dz } as THREE.Vector3);

const B = layout.buildings;
const P = layout.points;

export const PLACES: Place[] = [
  {
    id: "reception",
    cat: "services",
    icon: "bell",
    eyebrow: "Main building · open 24 hours",
    title: "Reception",
    body: "Check-in is from 16:00 and check-out by 12:00. Our team is here around the clock – for directions, a resort ride, taxis or anything else during your stay.",
    facts: ["Check-in 16:00", "Check-out 12:00", "Reception 24 h"],
    actions: [
      { label: "Message reception", href: wa("Hi! "), primary: true },
      { label: "Call reception", href: tel(CONTACT.receptionCall) },
    ],
    at: at(B.reception.pos, 8, -20, 0),
    view: { dist: 75 },
  },
  {
    id: "aura",
    maxDist: 380,
    cat: "eat",
    icon: "dining",
    eyebrow: "Main building",
    title: "Restaurant AURA",
    body: "Breakfast is included in your stay and served every morning. In the evening AURA serves dinner with Lapland's flavours – booking ahead is recommended.",
    facts: ["Breakfast 07:00–11:00", "Dinner 17:00–23:00"],
    actions: [
      { label: "Menu & booking", href: CONTACT.auraUrl, primary: true },
      { label: "Call AURA", href: tel(CONTACT.auraPhone) },
    ],
    image: "/images/aura.webp",
    at: at(B.reception.pos, 11, -3, 0),
    view: { dist: 80 },
  },
  {
    id: "culta",
    maxDist: 380,
    cat: "eat",
    icon: "spa",
    eyebrow: "Main building · rooftop",
    title: "Arctic Spa Culta",
    body: "Lapland's only heated rooftop infinity pool and a panoramic Finnish sauna. A shared spa for up to sixteen guests at a time – bathrobes, towels and slippers are provided.",
    facts: ["Additional experience", "Up to 16 guests"],
    actions: [
      { label: "Spa details & booking", href: CONTACT.cultaUrl, primary: true },
      { label: "Call CULTA", href: tel(CONTACT.cultaPhone) },
    ],
    image: "/images/culta.webp",
    at: at(B.reception.pos, 12, 17, -1),
    view: { dist: 70, polar: 0.85 },
  },
  {
    id: "safari-house",
    cat: "activities",
    icon: "safari",
    eyebrow: "Safaris & guest programme",
    title: "SkyView Safari House",
    body: "Northern Lights tours, husky and snowmobile safaris and reindeer experiences depart from the Safari House. The complimentary guest programme starts here too.",
    actions: [
      { label: "Call Safari House", href: tel(CONTACT.safariPhone), primary: true },
      { label: "Ask about safaris", href: wa("Hi! I'd like to know more about the safaris.") },
    ],
    at: at(B.safariHouse.pos, 8),
    view: { dist: 70 },
  },
  {
    id: "hut",
    maxDist: 380,
    cat: "activities",
    icon: "fire",
    eyebrow: "Next to the main building",
    title: "Hut with a fireplace",
    body: "A traditional Lappish kota with an open fire – a warm place to sit down, dry your mittens and wait for the northern lights.",
    at: at(B.hut.pos, 7),
    view: { dist: 45 },
    check: "Onko tämä Aurora Camp -ohjelman Aurora Kota? Aukioloajat?",
  },
  {
    id: "reindeer",
    cat: "activities",
    icon: "reindeer",
    eyebrow: "At your own pace · complimentary",
    title: "Reindeer enclosure",
    body: "Visit our reindeer throughout your stay. Follow the feeding instructions at the enclosure and ask our team where to find suitable reindeer feed.",
    actions: [{ label: "Ask about the reindeer", href: wa("Hi! I'd like to know more about visiting the reindeer.") }],
    at: at(P.reindeerEast, 5),
    view: { dist: 50 },
  },
  {
    id: "cabin-yard",
    cat: "activities",
    icon: "dome",
    eyebrow: "Aurora Cabins",
    title: "Campfire & reindeer yard",
    body: "The open yard in the middle of the Aurora Cabins, with a campfire, a glass dome and reindeer.",
    at: at(P.ovalFire, 6),
    view: { dist: 70 },
    check: "Mitä soikion keskellä tarkalleen on (kupoli, nuotio, porot)? Kupolin nimi ja käyttö?",
  },
  {
    id: "parking",
    maxDist: 260,
    cat: "services",
    icon: "parking",
    eyebrow: "Arrival",
    title: "Parking & EV charging",
    body: "Guest parking next to the main building. Ask reception about EV charging.",
    at: at(P.parking, 4),
    view: { dist: 60 },
    check: "Latauspisteiden sijainti ja käyttö.",
  },
  {
    id: "assembly",
    maxDist: 260,
    cat: "services",
    icon: "assembly",
    eyebrow: "Safety",
    title: "Emergency assembly point",
    body: `In an emergency, call 112 and gather here. Our address is ${CONTACT.address}. Give your igloo or cabin number when asking for help.`,
    actions: [{ label: "Call 112", href: "tel:112", primary: true }],
    at: at(P.assembly, 4),
    view: { dist: 50 },
  },
  {
    id: "igloos",
    cat: "stay",
    icon: "igloo",
    eyebrow: `${layout.igloos.length} glass-roof igloos`,
    title: "SkyView Igloos",
    body: "Two-floor glass-roof igloos with a private sauna and hot tub. Each igloo is named after a constellation – find yours with the search.",
    facts: ["King Igloo 60 m²", "Igloo Suite 50 m²", "Up to 5 guests"],
    image: "/images/king-hero-sm.webp",
    at: at(layout.igloos.find((i) => i.n === 9)!.pos, 12),
    view: { dist: 230, polar: 0.95 },
  },
  {
    id: "cabins",
    cat: "stay",
    icon: "cabin",
    eyebrow: `${layout.cabins.length} cabins`,
    title: "Aurora Cabins",
    body: "Cosy cabins for two with a glass gable, private sauna and terrace hot tub, around a quiet yard of their own.",
    facts: ["25 m²", "Up to 2 guests", "Sauna & hot tub"],
    image: "/images/cabin-hero-sm.webp",
    at: at(P.ovalDome, 10),
    view: { dist: 170, polar: 0.95 },
    check: "Ovatko soikion 31 mökkiä Aurora Cabinit?",
  },
  ...layout.igloos.map<Place>((i) => ({
    id: `igloo-${i.n}`,
    cat: "stay",
    icon: "igloo",
    unit: true,
    eyebrow: `Igloo ${i.n}`,
    title: i.name,
    body: "Your glass-roof igloo with a private sauna and hot tub. Need a lift to dinner, the spa or the Safari House? Our team can pick you up.",
    actions: [
      { label: "Request a resort ride", href: wa(`Hi! I'm in igloo ${i.n} (${i.name}) and would like a ride to: `), primary: true },
      { label: "Directions", href: wa(`Hi! Could you give me directions to igloo ${i.n} (${i.name})?`) },
    ],
    at: toWorld(i.pos, 8),
    view: { dist: 75, polar: 0.95 },
  })),
  ...layout.cabins.map<Place>((c) => ({
    id: `cabin-${c.n}`,
    cat: "stay",
    icon: "cabin",
    unit: true,
    eyebrow: "Aurora Cabin",
    title: `Cabin ${c.n}`,
    body: "Your cabin with a private sauna and terrace hot tub. Need a lift to dinner, the spa or the Safari House? Our team can pick you up.",
    actions: [{ label: "Request a resort ride", href: wa(`Hi! I'm in Aurora Cabin ${c.n} and would like a ride to: `), primary: true }],
    at: toWorld(c.pos, 6),
    view: { dist: 65, polar: 0.95 },
  })),
];

export const byId = new Map(PLACES.map((p) => [p.id, p]));

/** Opastettu kierros: kohteet järjestyksessä + lyhyt teksti. */
export const TOUR: { id: string; text: string }[] = [
  { id: "reception", text: "Welcome to SkyView. Reception is open around the clock in the main building." },
  { id: "aura", text: "Breakfast and dinner at Restaurant AURA, under the same roof." },
  { id: "culta", text: "Up on the roof: Arctic Spa Culta and its heated infinity pool." },
  { id: "hut", text: "Warm up by the open fire in the kota." },
  { id: "safari-house", text: "Safaris and the guest programme depart from the Safari House." },
  { id: "reindeer", text: "Say hello to our reindeer." },
  { id: "igloos", text: "Fifty glass-roof igloos in the forest, each named after a constellation." },
  { id: "cabins", text: "The Aurora Cabins circle a quiet yard of their own." },
];
