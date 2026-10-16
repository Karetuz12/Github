import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Yksinkertaistetut rakennukset. Kun oikeat 3D-mallit (glTF) ovat valmiina,
// ne korvaavat nämä world.ts:ssä – sijainnit ja kohteet pysyvät samoina.

/** Materiaalit, joiden hehkua säädetään vuorokaudenajan mukaan. */
export const mats = {
  wood: new THREE.MeshLambertMaterial({ color: 0x5a4130 }),
  clad: new THREE.MeshLambertMaterial({ color: 0x38393e }), // SkyView'n tumma paanu/lautaverhous
  deck: new THREE.MeshLambertMaterial({ color: 0xc9a473 }),
  door: new THREE.MeshLambertMaterial({ color: 0x4a3a2c }),
  woodLight: new THREE.MeshLambertMaterial({ color: 0x6e5240 }),
  dark: new THREE.MeshLambertMaterial({ color: 0x3a3f48 }),
  snow: new THREE.MeshLambertMaterial({ color: 0xf2f5fa }),
  glass: new THREE.MeshLambertMaterial({ color: 0x86aaa6, emissive: 0xffb15e, emissiveIntensity: 0, flatShading: true }),
  window: new THREE.MeshLambertMaterial({ color: 0x1c2733, emissive: 0xffc27a, emissiveIntensity: 0 }),
  pool: new THREE.MeshLambertMaterial({ color: 0x3a8b93, emissive: 0x5fe8e2, emissiveIntensity: 0 }),
  fire: new THREE.MeshBasicMaterial({ color: 0xffa040 }),
  reindeer: new THREE.MeshLambertMaterial({ color: 0x5b4636 }),
  car: new THREE.MeshLambertMaterial({ color: 0x4a515c }),
  carGlass: new THREE.MeshLambertMaterial({ color: 0x1a1f26 }),
};

export function setGlow(night: number) {
  mats.glass.emissiveIntensity = night * 1.0;
  mats.window.emissiveIntensity = 0.1 + night * 0.75;
  mats.pool.emissiveIntensity = 0.35 + night * 0.6;
}

type Part = { geom: THREE.BufferGeometry; mat: THREE.Material };

const box = (w: number, h: number, d: number, x = 0, y = 0, z = 0) => new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z);

/** Harjakatto (kolmioprisma) pituussuunnassa x. */
function gable(w: number, d: number, h: number, x = 0, y = 0, z = 0) {
  const s = new THREE.Shape();
  s.moveTo(-d / 2, 0);
  s.lineTo(d / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false })
    .rotateY(Math.PI / 2)
    .translate(x - w / 2, y, z);
}

function group(parts: Part[]): Part[] {
  // Yhdistä saman materiaalin osat yhdeksi geometriaksi
  const byMat = new Map<THREE.Material, THREE.BufferGeometry[]>();
  for (const p of parts) {
    const g = p.geom.index ? p.geom.toNonIndexed() : p.geom;
    g.deleteAttribute("uv");
    byMat.set(p.mat, [...(byMat.get(p.mat) ?? []), g]);
  }
  return [...byMat].map(([mat, gs]) => ({ mat, geom: mergeGeometries(gs) }));
}

/** Puolikas kahdeksankulmio: litteä puoli tasossa x = 0, kaari +x-suuntaan. */
const halfOct = (rTop: number, rBot: number, h: number, y: number, open = false) =>
  new THREE.CylinderGeometry(rTop, rBot, h, 4, 1, open, 0, Math.PI).translate(0, y + h / 2, 0);

/**
 * Ulokkeena leijuva lasikupolimakuuhuone: tumma umpikaide/pohja, matalat lasiseinät ja särmikäs
 * lasikupoli. Litteä puoli seinässä x = wx, keskikohta z, lattia korkeudella y.
 */
function glassPod(wx: number, y: number, z: number): Part[] {
  const at = (g: THREE.BufferGeometry) => g.translate(wx, 0, z);
  return [
    { geom: at(halfOct(2.7, 2.45, 1.2, y - 0.95)), mat: mats.clad },
    { geom: at(halfOct(2.75, 2.75, 0.1, y + 0.25)), mat: mats.snow },
    { geom: at(halfOct(2.45, 2.45, 0.8, y + 0.3, true)), mat: mats.glass },
    { geom: at(halfOct(0.55, 2.45, 1.8, y + 1.1)), mat: mats.glass },
  ];
}

/**
 * SkyView-iglu (kaikki ulkoa samanlaisia; arkkitehdin renderöintien mukaan).
 * Paalujen päällä tumma alakerta. Yläkerran laatikko takana vasemmalla; sen oikeaan seinään
 * kiinnittyy lasikupolimakuuhuone, joka ulkonee rakennuksen ohi ja leijuu ilmassa.
 * Yläkerran edessä terassi säleaitoineen ja ulkoporealtaineen. Sisäänkäynti vasemmalta.
 * Edessä (+z) tie.
 */
export function iglooParts(): Part[] {
  const F = 0.8; // paalujen korkeus
  const L = F + 3.0; // yläkerran lattia
  const X0 = -3, X1 = 1.7; // alakerran leveys (lasihuone ulkonee tästä ~70 %)
  const U1 = 0.8; // yläkerran oikea seinä = lasihuoneen kiinnitys
  const posts: Part[] = [];
  for (const x of [X0 + 0.3, 0, X1 - 0.3]) for (const z of [-2.7, 2.7]) posts.push({ geom: box(0.22, F, 0.22, x, 0, z), mat: mats.clad });
  const W = X1 - X0;
  const UW = U1 - X0;
  return group([
    ...posts,
    // Alakerta: isot ikkunat edessä ja oikealla
    { geom: box(W, 3.0, 6, (X0 + X1) / 2, F), mat: mats.clad },
    { geom: box(1.7, 2.2, 0.08, -1.7, F + 0.35, 3.04), mat: mats.window },
    { geom: box(1.3, 2.2, 0.08, 0.5, F + 0.35, 3.04), mat: mats.window },
    { geom: box(0.08, 2.2, 1.5, X1 + 0.04, F + 0.35, 1.6), mat: mats.window },
    { geom: box(W + 0.1, 0.12, 6.1, (X0 + X1) / 2, L), mat: mats.snow },
    // Yläkerran laatikko takana
    { geom: box(UW, 3.0, 3.6, (X0 + U1) / 2, L, -1.2), mat: mats.clad },
    { geom: box(UW + 0.2, 0.3, 3.8, (X0 + U1) / 2, L + 3.0, -1.2), mat: mats.snow },
    { geom: box(0.9, 2.0, 0.08, -2.0, L + 0.1, 0.64), mat: mats.window },
    // Terassi yläkerran edessä, vain lasihuoneen vasemmalla puolella: säleaidat ja poreallas
    { geom: box(UW, 1.05, 0.08, (X0 + U1) / 2, L, 3.0), mat: mats.deck },
    { geom: box(0.08, 1.05, 2.4, X0, L, 1.8), mat: mats.deck },
    { geom: box(1.6, 0.85, 1.6, -1.8, L, 1.9), mat: mats.clad },
    { geom: box(1.35, 0.06, 1.35, -1.8, L + 0.86, 1.9), mat: mats.pool },
    // Lasikupolimakuuhuone ulokkeena oikealla
    ...glassPod(U1, L + 0.55, 0.3), // ulottuu alakerran etureunaan, terassi päättyy siihen
    // Sisäänkäynti: tasanne ja luiska vasemmalla
    { geom: box(0.08, 2.1, 1.0, X0 - 0.04, F, -1.4), mat: mats.door },
    { geom: box(1.6, 0.12, 2.8, X0 - 0.8, F - 0.12, -1.4), mat: mats.deck },
    { geom: box(0.08, 1.0, 2.8, X0 - 1.6, F, -1.4), mat: mats.deck },
    { geom: box(1.6, 0.5, 1.6, X0 - 0.8, 0, 0.8), mat: mats.deck },
  ]);
}

/** Aurora Cabin: pieni harjakattoinen mökki, lasipääty +z. */
export function cabinParts(): Part[] {
  const s = new THREE.Shape();
  s.moveTo(-2.3, 0);
  s.lineTo(2.3, 0);
  s.lineTo(0, 2.2);
  s.closePath();
  const gableGlass = new THREE.ShapeGeometry(s).translate(0, 3, 2.86);
  return group([
    { geom: box(4.6, 3, 5.6), mat: mats.clad },
    { geom: gable(6.2, 5.4, 2.4, 0, 3, 0).rotateY(Math.PI / 2), mat: mats.snow },
    { geom: gableGlass, mat: mats.glass },
    { geom: box(3.6, 2, 0.1, 0, 0.4, 2.85), mat: mats.glass },
  ]);
}

/** Päärakennus: vastaanotto, ravintola AURA ja Arctic Spa Culta (kattoallas). */
export function mainBuilding(): THREE.Group {
  const g = new THREE.Group();
  const add = (geom: THREE.BufferGeometry, mat: THREE.Material) => g.add(new THREE.Mesh(geom, mat));
  // Ravintolasiipi harjakatolla
  add(box(30, 5, 14, -3, 0, 0), mats.wood);
  add(gable(31, 15, 4.5, -3, 5, 0), mats.snow);
  add(box(28, 2.6, 0.2, -3, 1.2, 7.05), mats.window);
  add(box(28, 2.6, 0.2, -3, 1.2, -7.05), mats.window);
  // Vastaanoton pääty (länsi)
  add(box(8, 6.5, 10, -20, 0, 0), mats.woodLight);
  add(box(8.6, 0.4, 10.6, -20, 6.5, 0), mats.snow);
  add(box(0.2, 3, 4, -24.05, 0, 0), mats.window);
  // Spa-osa kattoaltaineen (itä)
  add(box(12, 8, 12, 17, 0, -1), mats.dark);
  add(box(10, 0.3, 9, 17, 8, -1), mats.pool);
  add(box(12.2, 1, 0.15, 17, 8, 5), mats.glass);
  add(box(12.2, 1, 0.15, 17, 8, -7), mats.glass);
  add(box(11, 5, 0.2, 17, 1.5, 5.05), mats.window);
  // Savupiippu (takka)
  add(box(1.2, 3, 1.2, 4, 7, -2), mats.dark);
  return g;
}

export function safariHouse(len: number, wid: number): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(box(len, 4, wid), mats.woodLight));
  g.add(new THREE.Mesh(gable(len + 0.8, wid + 1.4, 2.6, 0, 4, 0), mats.snow));
  g.add(new THREE.Mesh(box(len * 0.8, 2, 0.15, 0, 1, wid / 2 + 0.05), mats.window));
  return g;
}

/** Kota (tulisijallinen laavu/kota): kuusikulmainen kartio. */
export function kota(r = 3): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, r, 4.5, 6).translate(0, 2.25, 0), mats.wood));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, r * 0.55, 1.6, 6).translate(0, 3.9, 0), mats.snow));
  g.add(new THREE.Mesh(box(1, 1.8, 0.1, 0, 0, r * 0.88), mats.window));
  return g;
}

export function shed(w: number, d: number): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(box(w, 2.6, d), mats.wood));
  g.add(new THREE.Mesh(gable(w + 0.6, d + 1, 1.6, 0, 2.6, 0), mats.snow));
  return g;
}

/** Lasikupoli (karttamerkki soikion keskellä). */
export function dome(r = 3.2): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mats.glass);
}

export function campfire(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.1, 6).translate(0, 0.55, 0), mats.fire));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const bench = new THREE.Mesh(box(2.2, 0.45, 0.5), mats.woodLight);
    bench.position.set(Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2);
    bench.rotation.y = -a + Math.PI / 2;
    g.add(bench);
  }
  return g;
}

export function reindeer(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(box(1.4, 0.7, 0.55, 0, 0.75, 0), mats.reindeer));
  g.add(new THREE.Mesh(box(0.35, 0.7, 0.3, 0.75, 1.15, 0), mats.reindeer));
  for (const [x, z] of [[-0.5, -0.18], [-0.5, 0.18], [0.5, -0.18], [0.5, 0.18]])
    g.add(new THREE.Mesh(box(0.12, 0.75, 0.12, x, 0, z), mats.reindeer));
  g.add(new THREE.Mesh(box(0.9, 0.12, 0.5, 0.95, 1.55, 0), mats.reindeer));
  return g;
}

/** Henkilöauto, keula +x: matala konepelti edessä, ohjaamo keskellä-takana. */
export function car(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(box(4.5, 0.75, 1.8, 0, 0.3), mats.car));
  g.add(new THREE.Mesh(box(2.3, 0.62, 1.66, -0.45, 1.05), mats.carGlass));
  g.add(new THREE.Mesh(box(2.0, 0.1, 1.6, -0.5, 1.67), mats.snow));
  g.add(new THREE.Mesh(box(0.06, 0.18, 1.5, 2.25, 0.62), mats.window)); // ajovalot
  return g;
}

/** Lumipeitteinen kuusi kolmesta kartiosta; värit kärkien mukaan (lunta ylhäällä). */
export function treeGeometry(): THREE.BufferGeometry {
  const tiers = [
    { r: 1.55, h: 4.0, y: 0.8 },
    { r: 1.15, h: 3.6, y: 3.4 },
    { r: 0.7, h: 3.2, y: 5.8 },
  ];
  const geoms = tiers.map((t) => new THREE.ConeGeometry(t.r, t.h, 7, 1, true).translate(0, t.y + t.h / 2, 0).toNonIndexed());
  geoms.push(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 5, 1, true).translate(0, 0.6, 0).toNonIndexed());
  const g = mergeGeometries(geoms.map((x) => (x.deleteAttribute("uv"), x)));
  const pos = g.getAttribute("position");
  const col = new Float32Array(pos.count * 3);
  const dark = new THREE.Color(0x1d3328);
  const snow = new THREE.Color(0xe8eef6);
  const trunk = new THREE.Color(0x3b2b22);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // Jokaisen kerroksen alareuna jää tummaksi, yläosa lumiseksi (tykkylumi)
    const t = [...tiers].reverse().find((t) => y >= t.y - 0.01);
    if (!t || y < 0.79) c.copy(trunk);
    else c.copy(dark).lerp(snow, 0.66 + 0.34 * Math.min(1, (y - t.y) / t.h));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}
