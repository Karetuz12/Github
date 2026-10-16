import * as THREE from "three";
import layoutJson from "./layout.json";

// Sijainnit tulevat opastekartasta (tools/extract_layout.py) PDF-pisteinä.
// 1 pt ≈ 0.25 m: päärakennus on piirustuksissa ~36 m pitkä, iglu ~8 m.
export const M_PER_PT = 0.25;

export type Pt = [number, number];
export const layout = layoutJson as unknown as {
  size: Pt;
  igloos: { n: number; name: string; pos: Pt }[];
  cabins: { n: number; pos: Pt }[];
  buildings: Record<string, { pos: Pt; size: Pt; angle: number }>;
  points: Record<string, Pt>;
};

/** Alueen koko metreinä (opastekartan rajaus). Pohjoinen = −z. */
export const SITE = { w: layout.size[0] * M_PER_PT, d: layout.size[1] * M_PER_PT };

export function toWorld(p: Pt, y = 0): THREE.Vector3 {
  return new THREE.Vector3((p[0] - layout.size[0] / 2) * M_PER_PT, y, (p[1] - layout.size[1] / 2) * M_PER_PT);
}

/** Tiemaski (valkoinen = tie) luettavaksi metrikoordinaateilla. */
export class RoadMask {
  constructor(
    private data: Uint8ClampedArray,
    private w: number,
    private h: number,
  ) {}

  static async load(url: string): Promise<{ mask: RoadMask; image: HTMLImageElement }> {
    const image = new Image();
    image.src = url;
    await image.decode();
    const c = document.createElement("canvas");
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(image, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    return { mask: new RoadMask(d, c.width, c.height), image };
  }

  /** 0…1, 0 alueen ulkopuolella. */
  at(x: number, z: number): number {
    const u = x / SITE.w + 0.5;
    const v = z / SITE.d + 0.5;
    if (u < 0 || u >= 1 || v < 0 || v >= 1) return 0;
    const i = (Math.floor(v * this.h) * this.w + Math.floor(u * this.w)) * 4;
    return this.data[i] / 255;
  }

  /** Suurin maskiarvo r metrin säteellä (karkea, 8 suuntaa). */
  near(x: number, z: number, r: number): number {
    let m = this.at(x, z);
    for (let a = 0; a < 8 && m < 1; a++) {
      const t = (a / 8) * Math.PI * 2;
      m = Math.max(m, this.at(x + Math.cos(t) * r, z + Math.sin(t) * r));
    }
    return m;
  }

  /** Suunta lähimmälle tielle (radiaanit, three.js y-kierto), tai null. */
  facingRoad(x: number, z: number, maxR = 30): number | null {
    for (let r = 4; r <= maxR; r += 2) {
      let best = -1;
      let bestA = 0;
      for (let a = 0; a < 24; a++) {
        const t = (a / 24) * Math.PI * 2;
        const m = this.at(x + Math.cos(t) * r, z + Math.sin(t) * r);
        if (m > best) {
          best = m;
          bestA = t;
        }
      }
      if (best > 0.5) return Math.atan2(Math.cos(bestA), Math.sin(bestA));
    }
    return null;
  }
}

/** Toistettava satunnaisluku (sama metsä joka latauksella). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Maaston korkeus: alue tasainen, ympärillä loivia vaaroja. */
export function heightAt(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const far = THREE.MathUtils.smoothstep(r, 420, 1600);
  const n =
    Math.sin(x * 0.0021 + 1.3) * Math.cos(z * 0.0017 - 0.4) * 0.6 +
    Math.sin(x * 0.0053 - z * 0.0041) * 0.3 +
    Math.sin(x * 0.011 + z * 0.013) * 0.1;
  // Pohjoisessa (−z) korkeampi vaara horisontissa
  const north = THREE.MathUtils.smoothstep(-z, 600, 2400) * 70;
  return far * (n * 45 + 20 + north);
}


/**
 * Iglut, joiden sisäänkäyntisilta osoittaa eri suuntaan kuin lähimmän tien perusteella päättelisi.
 * Lasikupoli on aina pohjoisessa; silta itään tai länteen, terassi vastakkaisella puolella.
 */
export const IGLOO_ENTRY: Record<number, "east" | "west"> = {
  2: "west", // Scorpio (tarkistettu kartalta 16.10.2026)
};
