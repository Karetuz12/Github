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
  rock: new THREE.MeshLambertMaterial({ color: 0x6b6f78, flatShading: true }),
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
 * lasikupoli. Litteä puoli seinässä x = wx, kaari −x-suuntaan, keskikohta z, lattia korkeudella y.
 */
function glassPod(wx: number, y: number, z: number): Part[] {
  const at = (g: THREE.BufferGeometry) => g.rotateY(Math.PI).translate(wx, 0, z);
  return [
    { geom: at(halfOct(2.6, 2.4, 1.2, y - 0.95)), mat: mats.clad },
    { geom: at(halfOct(2.65, 2.65, 0.1, y + 0.25)), mat: mats.snow },
    { geom: at(halfOct(2.4, 2.4, 0.8, y + 0.3, true)), mat: mats.glass },
    { geom: at(halfOct(0.55, 2.4, 1.8, y + 1.1)), mat: mats.glass },
  ];
}

/**
 * SkyView-iglu (kaikki ulkoa samanlaisia; ilmakuvien ja arkkitehdin renderöintien mukaan).
 * Ylhäältä: neliön muotoinen kaksikerroksinen runko paalujen päällä, lasikupolimakuuhuone
 * ulokkeena yhden sivun keskellä (−x), viereisellä sivulla (−z) kapea yksikerroksinen osa,
 * jonka katolla terassi ja ulkoporeallas, ja vastakkaiselta sivulta (+z) pitkä sisäänkäyntisilta tielle.
 */
export function iglooParts(mirror = false): Part[] {
  const F = 0.8; // paalut
  const L = F + 3.0; // yläkerran lattia
  const H = F + 6.2; // katto
  const posts: Part[] = [];
  for (const x of [-2.7, 2.7]) for (const z of [-4.5, -2.7, 0, 2.7]) posts.push({ geom: box(0.22, F, 0.22, x, 0, z), mat: mats.clad });
  const parts = group([
    ...posts,
    // Kaksikerroksinen runko 6 × 6 m
    { geom: box(6, H - F, 6, 0, F), mat: mats.clad },
    { geom: box(6.2, 0.35, 6.2, 0, H), mat: mats.snow },
    // Alakerran isot ikkunat lasihuoneen alla ja sillan puolella
    { geom: box(0.08, 2.2, 1.6, -3.04, F + 0.35, 1.2), mat: mats.window },
    { geom: box(0.08, 0.6, 0.6, -3.04, F + 1.6, -1.0), mat: mats.window },
    { geom: box(1.6, 2.2, 0.08, -1.4, F + 0.35, 3.04), mat: mats.window },
    { geom: box(0.08, 2.0, 1.4, 3.04, L + 0.4, 0), mat: mats.window },
    // Lasikupolimakuuhuone ulokkeena (−x-sivun keskellä)
    ...glassPod(-3, L + 0.55, 0),
    // Kapea yksikerroksinen osa (−z), katolla terassi säleaitoineen ja poreallas
    { geom: box(5.0, 3.0, 1.9, 0.2, F, -3.95), mat: mats.clad },
    { geom: box(5.0, 0.12, 1.9, 0.2, L, -3.95), mat: mats.snow },
    { geom: box(5.0, 1.0, 0.08, 0.2, L, -4.9), mat: mats.deck },
    { geom: box(0.08, 1.0, 1.9, -2.3, L, -3.95), mat: mats.deck },
    { geom: box(0.08, 1.0, 1.9, 2.7, L, -3.95), mat: mats.deck },
    { geom: box(1.7, 0.8, 1.5, -0.6, L, -3.95), mat: mats.clad },
    { geom: box(1.45, 0.06, 1.25, -0.6, L + 0.8, -3.95), mat: mats.pool },
    // Sisäänkäyntisilta (+z) tielle, ovi sillan päässä
    { geom: box(1.0, 2.1, 0.08, 1.2, F, 3.04), mat: mats.door },
    { geom: box(1.6, 0.15, 7, 1.2, F - 0.15, 6.5), mat: mats.deck },
    { geom: box(0.08, 1.0, 7, 0.4, F, 6.5), mat: mats.deck },
    { geom: box(0.08, 1.0, 7, 2.0, F, 6.5), mat: mats.deck },
  ]);
  return mirror ? parts.map((p) => ({ ...p, geom: flipZ(p.geom) })) : parts;
}

/** Peilikuva z-akselin suhteen (kolmioiden kiertosuunta korjataan, ettei pintoja karsita). */
function flipZ(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const out = g.clone().scale(1, 1, -1);
  const pos = out.getAttribute("position") as THREE.BufferAttribute;
  const nor = out.getAttribute("normal") as THREE.BufferAttribute;
  for (const a of [pos, nor])
    for (let t = 0; t < a.count; t += 3)
      for (let k = 0; k < 3; k++) {
        const v1 = a.getComponent(t + 1, k);
        a.setComponent(t + 1, k, a.getComponent(t + 2, k));
        a.setComponent(t + 2, k, v1);
      }
  return out;
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

/**
 * Päärakennus arkkitehdin renderöintien ja valokuvan mukaan: tumma pystylaudoitus, tasakatot.
 * Paikallisesti x = itä, −z = pohjoinen (julkisivu revontulien suuntaan).
 * Länsipää: ravintola AURA lasiseinin matalan sokkelin päällä, yllä paksu reunanauha.
 * Yläkerta: sisäänvedetty lasinauha, valaistu räystään alapinta ja reilusti ulkoneva kattolaatta.
 * Itäpää: alhaalla sisäänvedetty pylväikkö, sen päällä kaide, jossa Arctic Spa Cultan allas näkyy
 * lasi-ikkunana, ja takana matalampi siipi.
 * Etelä (+z, Safari Housen puoli): sisäänkäynti – tasainen kaksikerroksinen seinä, ovi sisäänvedettynä
 * lipan alla ja vieressä rimoitettu porrastorni.
 */
export function mainBuilding(): THREE.Group {
  const g = new THREE.Group();
  const add = (geom: THREE.BufferGeometry, mat: THREE.Material) => g.add(new THREE.Mesh(geom, mat));
  const N = -6; // pohjoisjulkisivu
  // --- Ravintola (länsi) ---
  add(box(17, 0.45, 5.6, -8.5, 0, -3.2), mats.clad); // sisäänvedetty sokkeli
  add(box(18, 3.6, 6.2, -8.5, 0.45, -3.2), mats.glass); // lasit pohjoiseen ja länteen
  add(box(18, 4.05, 5.6, -8.5, 0, 2.8), mats.clad); // sisäänkäynnin puoli umpinainen
  add(box(18.6, 1.4, 12, -8.5, 4.05, -0.3), mats.clad); // reunanauha / terassin kaide
  // --- Itäpää ---
  add(box(15, 2.5, 7.5, 9.5, 0, 1.5), mats.dark); // pylväikön takaseinä
  for (const x of [2.6, 6.5, 10.5, 14.5]) add(box(0.4, 2.5, 0.4, x, 0, N + 0.4), mats.clad);
  add(box(17, 2.1, 11.4, 9.5, 2.5, -0.3), mats.clad); // kaide
  add(box(5, 1.1, 0.12, 7, 3.2, N + 0.24), mats.pool); // altaan lasi-ikkuna
  add(box(3, 1.2, 0.12, 15, 3.1, N + 0.24), mats.window);
  add(box(8, 0.2, 4.2, 7.5, 4.5, N + 3), mats.pool); // vedenpinta kaiteen tasolla
  add(box(16, 4.5, 6, 9.5, 2.5, 2.4), mats.clad); // matalampi siipi takana
  add(box(14, 0.18, 0.1, 9.5, 6.2, -0.65), mats.window); // valolista
  add(box(16.4, 0.25, 6.4, 9.5, 7, 2.4), mats.snow);
  // --- Yläkerta ---
  add(box(17, 3.2, 9, -4.5, 5.45, 1.4), mats.clad);
  add(box(13, 2.6, 0.12, -5, 5.6, -3.15), mats.window); // lasinauha
  add(box(0.12, 2.6, 6, -13.05, 5.6, 1.4), mats.window);
  add(box(20, 0.15, 11.5, -5.5, 8.65, 0.4), mats.deck); // valaistu räystään alapinta
  add(box(20, 1, 11.5, -5.5, 8.8, 0.4), mats.clad); // kattolaatta
  add(box(20.2, 0.25, 11.7, -5.5, 9.8, 0.4), mats.snow);
  add(box(18.6, 0.2, 3, -8.5, 5.45, -4.8), mats.snow); // terassin lumi ravintolan katolla
  // --- Sisäänkäynti (etelä) ---
  add(box(3.2, 2.5, 0.1, -3, 0, 5.62), mats.window); // lasiovet
  add(box(9, 0.9, 1.6, -1.5, 2.6, 6.2), mats.clad); // lippa
  add(box(9.2, 0.15, 1.8, -1.5, 3.5, 6.2), mats.snow);
  add(box(2.2, 8.2, 1.4, -12, 0, 6.2), mats.clad); // porrastorni
  add(box(1.2, 5, 0.1, -12, 1.5, 6.92), mats.dark); // rimoitus
  add(box(1.2, 1.5, 0.1, -8, 5.8, 5.92), mats.window); // yläkerran ikkunat
  add(box(0.6, 1.5, 0.1, -5.5, 5.8, 5.92), mats.window);
  // Savupiippu (takka)
  add(box(0.8, 1.6, 0.8, -8, 9.8, 3), mats.dark);
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

/** Lumipeitteinen kivi: epäsäännöllinen monitahokas. */
export function rock(r: number, rand: () => number): THREE.Group {
  const geo = new THREE.DodecahedronGeometry(r, 0);
  const p = geo.getAttribute("position");
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.8 + rand() * 0.5), p.getY(i) * (0.55 + rand() * 0.3), p.getZ(i) * (0.8 + rand() * 0.5));
  geo.computeVertexNormals();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mats.rock));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.85, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.05, 0.45, 1.05), mats.snow);
  cap.position.y = r * 0.25;
  g.add(cap);
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
