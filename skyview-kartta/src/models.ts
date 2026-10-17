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
  stone: new THREE.MeshLambertMaterial({ color: 0x55575c }), // altaan kiviverhous
  railGlass: new THREE.MeshLambertMaterial({ color: 0xd8eef2, transparent: true, opacity: 0.28, depthWrite: false }),
  // Iglun lasikupoli: läpikuultava, illalla lämmin hehku (sisustus näkyy läpi)
  domeGlass: new THREE.MeshLambertMaterial({ color: 0xcfe3e6, emissive: 0xffb25e, emissiveIntensity: 0, transparent: true, opacity: 0.32, depthWrite: false }),
  linen: new THREE.MeshLambertMaterial({ color: 0xf3f1ec, emissive: 0xffd9a8, emissiveIntensity: 0 }),
  linenDark: new THREE.MeshLambertMaterial({ color: 0x3a3c40 }),
  led: new THREE.MeshBasicMaterial({ color: 0xffa24a }),
  // Iglun olohuone (valokuvan mukaan); seinät ja kalusteet hehkuvat illalla lämpimästi
  woodPanel: new THREE.MeshLambertMaterial({ color: 0x7a4e2c, emissive: 0xffa860, emissiveIntensity: 0 }),
  woodDark: new THREE.MeshLambertMaterial({ color: 0x3a2416, emissive: 0xff9a50, emissiveIntensity: 0 }),
  floorDark: new THREE.MeshLambertMaterial({ color: 0x3a2a20, emissive: 0xff9a50, emissiveIntensity: 0 }),
  sofa: new THREE.MeshLambertMaterial({ color: 0x5a605c, emissive: 0xffb070, emissiveIntensity: 0 }),
  rug: new THREE.MeshLambertMaterial({ color: 0x8a827c, emissive: 0xffb070, emissiveIntensity: 0 }),
  winGlass: new THREE.MeshLambertMaterial({ color: 0xbcd2d8, transparent: true, opacity: 0.16, depthWrite: false }),
  dark: new THREE.MeshLambertMaterial({ color: 0x3a3f48 }),
  snow: new THREE.MeshLambertMaterial({ color: 0xf2f5fa }),
  glass: new THREE.MeshLambertMaterial({ color: 0x86aaa6, emissive: 0xffb15e, emissiveIntensity: 0, flatShading: true }),
  window: new THREE.MeshLambertMaterial({ color: 0x1c2733, emissive: 0xffc27a, emissiveIntensity: 0 }),
  pool: new THREE.MeshLambertMaterial({ color: 0x3a8b93, emissive: 0x5fe8e2, emissiveIntensity: 0 }),
  fire: new THREE.MeshBasicMaterial({ color: 0xffa040 }),
  reindeer: new THREE.MeshLambertMaterial({ color: 0x7a5236 }),
  reindeerLight: new THREE.MeshLambertMaterial({ color: 0xb8a68e }),
  antler: new THREE.MeshLambertMaterial({ color: 0x3a2f27 }),
  hoof: new THREE.MeshLambertMaterial({ color: 0x1a1612 }),
  car: new THREE.MeshLambertMaterial({ color: 0x4a515c }),
  carGlass: new THREE.MeshLambertMaterial({ color: 0x1a1f26 }),
};

/**
 * Piirretyt sisätilat ikkunoihin (kuten referenssissä: illalla näkee sisälle).
 * Kuva toistuu 8 m välein; päivällä himmeä heijastus, pimeällä hehkuu.
 */
type Interior = "restaurant" | "lounge" | "sauna";
const interiorMats: THREE.MeshLambertMaterial[] = [];
const interiorCache = new Map<Interior, THREE.MeshLambertMaterial>();
function interiorMat(kind: Interior) {
  let m = interiorCache.get(kind);
  if (m) return m;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  let seed = kind.length * 977;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grad = (stops: [number, string][]) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    for (const [o, col] of stops) gr.addColorStop(o, col);
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 256);
  };
  const glow = (x: number, y: number, r: number, col: string) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col);
    gr.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  if (kind === "sauna") {
    grad([[0, "#5a3416"], [0.5, "#b8702e"], [1, "#6a3a18"]]);
    g.fillStyle = "rgba(60,30,10,0.35)";
    for (let y = 8; y < 256; y += 14) g.fillRect(0, y, 512, 2); // paneelit
    g.fillStyle = "#d89650";
    g.fillRect(0, 120, 512, 22); // ylälaude
    g.fillRect(0, 175, 512, 24); // alalaude
    g.fillStyle = "#ffd27a";
    g.fillRect(0, 142, 512, 4); // LED-nauhat lauteiden alla
    g.fillRect(0, 199, 512, 4);
    g.fillStyle = "#7d7a78";
    g.fillRect(236, 196, 40, 50); // kiuas
    glow(256, 150, 160, "rgba(255,190,110,0.35)");
  } else {
    grad([[0, "#2a1a10"], [0.18, "#6e4526"], [0.6, "#9a6638"], [1, "#4a2e1a"]]);
    for (let x = 20; x < 512; x += 46) glow(x, 26, 22, "rgba(255,226,160,0.9)"); // kattovalot
    g.fillStyle = "rgba(40,24,14,0.55)";
    g.fillRect(0, 70, 512, 60); // takaseinä / baari
    for (let x = 0; x < 512; x += 64) {
      const tx = x + 32;
      if (kind === "restaurant") {
        g.fillStyle = "#c58a4c"; // pöytä ja tuolit
        g.beginPath();
        g.ellipse(tx, 190, 24, 8, 0, 0, Math.PI * 2);
        g.fill();
        for (const dx of [-30, 30]) {
          g.fillStyle = rnd() < 0.5 ? "#b2402c" : "#d2793a";
          g.fillRect(tx + dx - 9, 172, 18, 34);
        }
        if (rnd() < 0.6) {
          g.fillStyle = "#24160f"; // ruokailijat
          g.beginPath();
          g.arc(tx - 30, 160, 7, 0, Math.PI * 2);
          g.fill();
          g.fillRect(tx - 38, 166, 16, 22);
        }
      } else {
        g.fillStyle = "#5a6474"; // sohvat ja riipputuolit
        g.fillRect(tx - 26, 180, 52, 26);
        g.strokeStyle = "#d8b884";
        g.lineWidth = 3;
        g.beginPath();
        g.ellipse(tx + 4, 150, 12, 18, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }
    glow(256, 200, 240, "rgba(255,180,100,0.25)");
  }
  // Ikkunanpuitteet
  g.fillStyle = "#120d0a";
  for (let x = 0; x < 512; x += 128) g.fillRect(x, 0, 6, 256);
  g.fillRect(0, 0, 512, 6);
  g.fillRect(0, 250, 512, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  m = new THREE.MeshLambertMaterial({ color: 0x8a96a2, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0 });
  interiorCache.set(kind, m);
  interiorMats.push(m);
  return m;
}

/** Ikkunataso, jossa sisätilakuva toistuu leveyden mukaan (8 m / kuva). rotY: 0 = kohti +z. */
function interiorPane(kind: Interior, w: number, h: number, x: number, y: number, z: number, rotY: number) {
  const geo = new THREE.PlaneGeometry(w, h);
  const uv = geo.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (w / 8));
  geo.rotateY(rotY).translate(x, y + h / 2, z);
  return new THREE.Mesh(geo, interiorMat(kind));
}

export function setGlow(night: number) {
  for (const m of interiorMats) m.emissiveIntensity = 0.12 + night * 0.95;
  mats.glass.emissiveIntensity = night * 1.0;
  mats.domeGlass.emissiveIntensity = night * 0.4;
  mats.linen.emissiveIntensity = night * 0.55;
  mats.woodPanel.emissiveIntensity = night * 0.32;
  for (const m of [mats.woodDark, mats.floorDark, mats.sofa, mats.rug]) m.emissiveIntensity = night * 0.22;
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
    if (!(p.mat as THREE.MeshLambertMaterial).map) g.deleteAttribute("uv");
    byMat.set(p.mat, [...(byMat.get(p.mat) ?? []), g]);
  }
  return [...byMat].map(([mat, gs]) => ({ mat, geom: mergeGeometries(gs) }));
}

/** Puolikas kahdeksankulmio: litteä puoli tasossa x = 0, kaari +x-suuntaan. */
const halfOct = (rTop: number, rBot: number, h: number, y: number, open = false) =>
  new THREE.CylinderGeometry(rTop, rBot, h, 4, 1, open, 0, Math.PI).translate(0, y + h / 2, 0);

/** Seinä tasossa x = c tai z = c, valinnainen aukko [a0, a1, y0, y1] (ikkuna). */
function wall(axis: "x" | "z", c: number, a0: number, a1: number, y0: number, y1: number, hole: number[] | null, t: number, mat: THREE.Material): Part[] {
  const out: Part[] = [];
  const add = (b0: number, b1: number, h0: number, h1: number) => {
    if (b1 - b0 < 0.001 || h1 - h0 < 0.001) return;
    const len = b1 - b0, mid = (b0 + b1) / 2;
    out.push({ geom: axis === "x" ? box(t, h1 - h0, len, c, h0, mid) : box(len, h1 - h0, t, mid, h0, c), mat });
  };
  if (!hole) add(a0, a1, y0, y1);
  else {
    const [b0, b1, h0, h1] = hole;
    add(a0, b0, y0, y1);
    add(b1, a1, y0, y1);
    add(b0, b1, y0, h0);
    add(b0, b1, h1, y1);
  }
  return out;
}

/**
 * Iglun olohuone terassisiiven sisällä (valokuvan mukaan, kaikissa igluissa sama): kulmaikkunat
 * ulkokulmassa, tummat puupaneelit, harmaa sohva sisäseinää vasten, kaksi taljatuolia ikkunoiden
 * edessä, pyöreä pöytä, matto, taulu ja sarvikruunu. Huone x −3…3, z −5,8…−3, lattia F, katto L.
 */
function livingRoom(F: number, L: number): Part[] {
  const winX = [-5.55, -3.55, F + 0.3, F + 2.6]; // päätyikkuna (−x)
  const winZ = [-2.85, -0.65, F + 0.3, F + 2.6]; // ulkoseinän ikkuna (−z)
  const sheep = (x: number, z: number) => new THREE.SphereGeometry(0.4, 10, 6).scale(1, 0.32, 0.95).translate(x, F + 0.62, z);
  const chair = (x: number, z: number, backDx: number, backDz: number): Part[] => [
    { geom: box(0.7, 0.1, 0.7, x, F + 0.45, z), mat: mats.woodDark },
    ...[[-0.3, -0.3], [-0.3, 0.3], [0.3, -0.3], [0.3, 0.3]].map(([dx, dz]) => ({ geom: box(0.08, 0.45, 0.08, x + dx, F, z + dz), mat: mats.woodDark })),
    { geom: box(backDx ? 0.1 : 0.7, 0.55, backDz ? 0.1 : 0.7, x + backDx, F + 0.55, z + backDz), mat: mats.woodDark },
    { geom: sheep(x, z), mat: mats.linen },
  ];
  return [
    // Ulkoseinät (tumma verhous ulkona, puupaneeli sisällä), ikkunoissa lasi
    ...wall("x", -2.97, -5.8, -3, F, L, winX, 0.06, mats.clad),
    ...wall("x", -2.91, -5.74, -3.06, F, L, winX, 0.06, mats.woodPanel),
    ...wall("z", -5.77, -3, 3, F, L, winZ, 0.06, mats.clad),
    ...wall("z", -5.71, -2.94, 2.94, F, L, winZ, 0.06, mats.woodPanel),
    ...wall("x", 2.97, -5.8, -3, F, L, null, 0.06, mats.clad),
    ...wall("x", 2.91, -5.74, -3.06, F, L, null, 0.06, mats.woodPanel),
    ...wall("z", -3.06, -2.94, 2.94, F, L, null, 0.06, mats.woodPanel), // rungon puoleinen seinä
    { geom: box(0.02, winX[3] - winX[2], winX[1] - winX[0], -2.98, winX[2], (winX[0] + winX[1]) / 2), mat: mats.winGlass },
    { geom: box(winZ[1] - winZ[0], winZ[3] - winZ[2], 0.02, (winZ[0] + winZ[1]) / 2, winZ[2], -5.78), mat: mats.winGlass },
    // Lattia, katto, matto
    { geom: box(6, 0.08, 2.8, 0, F, -4.4), mat: mats.floorDark },
    { geom: box(5.9, 0.08, 2.7, 0, L - 0.1, -4.4), mat: mats.woodDark },
    { geom: box(2.6, 0.02, 1.7, -0.9, F + 0.08, -4.5), mat: mats.rug },
    // Sohva sisäseinää vasten, torkkupeitto ja taulu
    { geom: box(2.2, 0.42, 0.85, 1.5, F + 0.08, -3.55), mat: mats.sofa },
    { geom: box(2.2, 0.5, 0.22, 1.5, F + 0.5, -3.2), mat: mats.sofa },
    { geom: box(0.18, 0.62, 0.85, 0.4, F + 0.08, -3.55), mat: mats.sofa },
    { geom: box(0.18, 0.62, 0.85, 2.6, F + 0.08, -3.55), mat: mats.sofa },
    { geom: box(0.55, 0.06, 0.75, 2.15, F + 0.5, -3.6), mat: mats.linen },
    { geom: box(0.9, 0.62, 0.03, 1.5, F + 1.45, -3.1), mat: mats.linenDark },
    { geom: box(0.8, 0.52, 0.03, 1.5, F + 1.5, -3.12), mat: mats.linen },
    // Taljatuolit kulmaikkunoiden edessä ja pieni pöytä
    ...chair(-2.15, -4.4, 0.32, 0),
    ...chair(-1.6, -5.15, 0, 0.32),
    { geom: new THREE.CylinderGeometry(0.22, 0.22, 0.5, 12).translate(-2.4, F + 0.25, -5.35), mat: mats.woodDark },
    // Sarvikruunu: haarat ja kynttilävalot
    { geom: box(0.04, 0.4, 0.04, -0.9, L - 0.5, -4.5), mat: mats.woodDark },
    { geom: new THREE.CylinderGeometry(0.38, 0.32, 0.06, 10).translate(-0.9, L - 0.55, -4.5), mat: mats.woodDark },
    ...[0, 1, 2, 3, 4].map((k) => {
      const a = (k / 5) * Math.PI * 2;
      return { geom: box(0.05, 0.12, 0.05, -0.9 + Math.cos(a) * 0.34, L - 0.49, -4.5 + Math.sin(a) * 0.34), mat: mats.led };
    }),
  ];
}

/**
 * Sisäänkäynti (kuvien mukaan): ovi +z-seinässä kupolin puoleisessa kulmassa, ovella tasanne ja siitä
 * loiva luiska maahan; luiskan ulkoreuna samassa linjassa kupolin seinän (x = −3) kanssa.
 * Kaiteissa pystyrimat ja käsijohde.
 */
function entranceRamp(F: number): Part[] {
  const x0 = -2.97, x1 = -1.43, cx = (x0 + x1) / 2, w = x1 - x0;
  const deckY = F - 0.15; // tasanteen pinta
  const z0 = 3.0, z1 = 4.4; // tasanne
  const len = 5.0, z2 = z1 + len, endY = 0.05;
  const slope = Math.atan2(deckY - endY, len);
  const yAt = (z: number) => (z <= z1 ? deckY : deckY - ((z - z1) / len) * (deckY - endY));
  const parts: Part[] = [
    { geom: box(1.1, 2.1, 0.1, cx, F, 3.05), mat: mats.woodLight }, // ovi
    { geom: box(w, 0.15, z1 - z0, cx, deckY, (z0 + z1) / 2), mat: mats.deck },
    { geom: box(w, 0.12, len / Math.cos(slope), 0, 0, 0).translate(0, -0.06, 0).rotateX(slope).translate(cx, (deckY + endY) / 2 + 0.06, (z1 + z2) / 2), mat: mats.deck },
  ];
  for (const x of [x0 + 0.03, x1 - 0.03]) {
    // Käsijohde ja alajohde tasanteella ja luiskalla
    for (const [h, t] of [[0.95, 0.07], [0.12, 0.05]] as const) {
      parts.push({ geom: box(0.06, t, z1 - z0, x, deckY + h, (z0 + z1) / 2), mat: mats.deck });
      parts.push({ geom: box(0.06, t, len / Math.cos(slope), 0, 0, 0).rotateX(slope).translate(x, (deckY + endY) / 2 + h, (z1 + z2) / 2), mat: mats.deck });
    }
    // Pystyrimat
    for (let z = z0 + 0.1; z < z2; z += 0.18) parts.push({ geom: box(0.05, 0.9, 0.05, x, yAt(z) + 0.1, z), mat: mats.deck });
  }
  return parts;
}

/**
 * Ulokkeena leijuva lasikupolimakuuhuone: tumma umpikaide/pohja, matalat lasiseinät ja särmikäs
 * lasikupoli. Litteä puoli seinässä x = wx, kaari −x-suuntaan, keskikohta z, lattia korkeudella y.
 */
function glassPod(wx: number, y: number, z: number): Part[] {
  const at = (g: THREE.BufferGeometry) => g.rotateY(Math.PI).translate(wx, 0, z);
  const f = y + 0.35; // makuuhuoneen lattia
  return [
    { geom: at(halfOct(2.6, 2.4, 1.2, y - 0.95)), mat: mats.clad },
    { geom: at(halfOct(2.65, 2.65, 0.1, y + 0.25)), mat: mats.woodLight }, // lattia (näkyy lasin läpi)
    { geom: at(halfOct(2.38, 2.38, 0.04, y + 0.36, true)), mat: mats.led }, // lämmin valonauha reunassa
    { geom: at(halfOct(2.4, 2.4, 0.8, y + 0.3, true)), mat: mats.domeGlass },
    { geom: at(halfOct(0.55, 2.4, 1.8, y + 1.1, true)), mat: mats.domeGlass },
    { geom: at(halfOct(0.55, 0.55, 0.03, y + 2.9)), mat: mats.domeGlass },
    // Sänky: pääty rungon seinää vasten, jalkopää kohti lasia
    { geom: box(2.0, 0.45, 1.8, wx - 1.1, f, z), mat: mats.linen },
    { geom: box(0.6, 0.47, 1.84, wx - 1.6, f, z), mat: mats.linenDark }, // petauskaista
    { geom: box(0.3, 0.16, 0.7, wx - 0.3, f + 0.45, z - 0.45), mat: mats.linen }, // tyynyt
    { geom: box(0.3, 0.16, 0.7, wx - 0.3, f + 0.45, z + 0.45), mat: mats.linen },
    { geom: box(0.08, 0.9, 1.9, wx - 0.05, f, z), mat: mats.wood }, // sängynpääty
  ];
}

/**
 * SkyView-iglu (kaikki ulkoa samanlaisia; ilmakuvien ja arkkitehdin renderöintien mukaan).
 * Ylhäältä: neliön muotoinen kaksikerroksinen runko paalujen päällä, lasikupolimakuuhuone
 * ulokkeena yhden sivun keskellä (−x), viereisellä sivulla (−z) noin 3 m syvä yksikerroksinen osa,
 * jonka katolla terassi ja ulkoporeallas, ja vastakkaiselta sivulta (+z) pitkä sisäänkäyntisilta tielle.
 */
export function iglooParts(mirror = false): Part[] {
  const F = 0.8; // paalut
  const L = F + 3.0; // yläkerran lattia
  const H = F + 6.2; // katto
  const posts: Part[] = [];
  for (const x of [-2.7, 2.7]) for (const z of [-5.6, -2.7, 0, 2.7]) posts.push({ geom: box(0.22, F, 0.22, x, 0, z), mat: mats.clad });
  const parts = group([
    ...posts,
    // Kaksikerroksinen runko 6 × 6 m
    { geom: box(6, H - F, 6, 0, F), mat: mats.clad },
    { geom: box(6.2, 0.35, 6.2, 0, H), mat: mats.snow },
    // Alakerran ainoat ikkunat ovat terassisiiven olohuoneen kulmaikkunat (ks. livingRoom);
    // yläkerrassa vain makuuhuoneen lasikupoli.
    // Lasikupolimakuuhuone ulokkeena (−x-sivun keskellä)
    ...glassPod(-3, L + 0.55, 0),
    // Kapea yksikerroksinen osa (−z) rungon levyisenä, seinät samassa linjassa rungon kanssa;
    // katolla terassi säleaitoineen ja poreallas
    ...livingRoom(F, L),
    { geom: box(6.0, 0.12, 2.8, 0, L, -4.4), mat: mats.snow },
    { geom: box(6.0, 1.0, 0.08, 0, L, -5.76), mat: mats.deck },
    { geom: box(0.08, 1.0, 2.8, -2.96, L, -4.4), mat: mats.deck },
    { geom: box(0.08, 1.0, 2.8, 2.96, L, -4.4), mat: mats.deck },
    { geom: box(1.9, 0.8, 1.7, -0.9, L, -4.4), mat: mats.clad },
    { geom: box(1.65, 0.06, 1.45, -0.9, L + 0.8, -4.4), mat: mats.pool },
    // Sisäänkäynti (+z): ovi, tasanne ja luiska maahan kupolin puoleisessa kulmassa
    ...entranceRamp(F),
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
 * Itäpää: uloke, jonka alla valaistu puuseinä ja katolla Arctic Spa Cultan allasterassi
 * (allas pohjoiseen, kapea sauna sen päässä, kylpytynnyrit).
 * Etelä (+z, Safari Housen puoli): sisäänkäynti – tasainen kaksikerroksinen seinä, ovi sisäänvedettynä
 * lipan alla ja vieressä rimoitettu porrastorni.
 */
export function mainBuilding(): THREE.Group {
  const g = new THREE.Group();
  const add = (geom: THREE.BufferGeometry, mat: THREE.Material) => g.add(new THREE.Mesh(geom, mat));
  // --- Ravintola (länsi) ---
  add(box(17, 0.45, 5.6, -8.5, 0, -3.2), mats.clad); // sisäänvedetty sokkeli
  add(box(18, 3.6, 6.2, -8.5, 0.45, -3.2), mats.glass); // lasit pohjoiseen ja länteen
  g.add(interiorPane("restaurant", 18, 3.5, -8.5, 0.5, -6.32, Math.PI));
  g.add(interiorPane("restaurant", 6.2, 3.5, -17.52, 0.5, -3.2, -Math.PI / 2));
  add(box(18, 4.05, 5.6, -8.5, 0, 2.8), mats.clad); // sisäänkäynnin puoli umpinainen
  add(box(18.6, 1.4, 12, -8.5, 4.05, -0.3), mats.clad); // reunanauha / terassin kaide
  // --- Itäpää: Arctic Spa Culta ---
  // Ulokkeen alla sisäänvedetty, valaistu puuseinä
  add(box(11, 2.5, 8, 7.5, 0, 1.5), mats.wood);
  add(box(10, 0.15, 0.1, 7.5, 2.25, -2.55), mats.window); // valonauha
  add(box(1, 2.5, 8, 13, 0, 1.5), mats.clad);
  // Tumma uloke, jonka katolla allasterassi
  add(box(12.5, 2.1, 11.4, 7.25, 2.5, -0.3), mats.clad);
  add(box(12.5, 0.12, 11.4, 7.25, 4.6, -0.3), mats.snow);
  // Allas: lähtee saunan edestä pohjoiseen terassin reunaan asti; kiviseinät, vesi niiden välissä,
  // pohjoispäässä matalampi ylivuotoreuna ja sivuilla lumiset reunakivet
  add(box(0.3, 1.2, 6.7, 8.35, 4.6, -2.45), mats.stone);
  add(box(0.3, 1.2, 6.7, 11.65, 4.6, -2.45), mats.stone);
  add(box(3.6, 1.2, 0.3, 10, 4.6, 0.75), mats.stone);
  add(box(3.6, 1.1, 0.3, 10, 4.6, -5.65), mats.stone);
  add(box(3, 1, 6.1, 10, 4.6, -2.45), mats.pool);
  add(box(0.35, 0.15, 6.7, 8.03, 5.8, -2.45), mats.snow);
  add(box(0.35, 0.15, 6.7, 11.97, 5.8, -2.45), mats.snow);
  add(box(4.3, 0.15, 0.35, 10, 5.8, 0.92), mats.snow);
  // Kapea sauna altaan päässä: tumma pystylaudoitus, iso valaistu ikkuna altaalle
  add(box(5.5, 3.2, 4, 10, 4.6, 3.4), mats.clad);
  g.add(interiorPane("sauna", 3.4, 1.8, 10.3, 5.2, 1.38, Math.PI)); // saunan ikkuna
  add(box(1, 2.2, 0.12, 7.7, 4.6, 1.35), mats.door);
  add(box(5.7, 0.25, 4.2, 10, 7.8, 3.4), mats.snow);
  // Lasikaide terassin reunoilla
  add(box(0.06, 1, 11.4, 13.47, 4.72, -0.3), mats.railGlass);
  add(box(6.8, 1, 0.06, 4.6, 4.72, -5.97), mats.railGlass);
  add(box(1.7, 1, 0.06, 12.65, 4.72, -5.97), mats.railGlass);
  // Kaksi puista kylpytynnyriä terassilla altaan länsipuolella
  for (const z of [-4.4, -2.1]) {
    add(new THREE.CylinderGeometry(0.95, 0.95, 1, 16).translate(5.8, 4.6 + 0.5, z), mats.woodLight);
    add(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 16).translate(5.8, 5.6, z), mats.pool);
  }
  // --- Yläkerta ---
  add(box(17, 3.2, 9, -4.5, 5.45, 1.4), mats.clad);
  g.add(interiorPane("lounge", 13, 2.6, -5, 5.6, -3.13, Math.PI)); // lasinauha
  g.add(interiorPane("lounge", 6, 2.6, -13.03, 5.6, 1.4, -Math.PI / 2));
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

/** Lieriö pisteestä a pisteeseen b (sarvet, jalat). */
function limb(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1 = r0, seg = 6) {
  const d = b.clone().sub(a);
  const g = new THREE.CylinderGeometry(r1, r0, d.length(), seg).translate(0, d.length() / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  return g.translate(a.x, a.y, a.z);
}

let reindeerCache: Part[] | null = null;
/** Poro (kuvan mukaan): ruskea vartalo, vaalea kaula ja rinta, haaroittuneet sarvet. Keula +x, säkä ~1,1 m. */
export function reindeer(): THREE.Group {
  reindeerCache ??= (() => {
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const sph = (r: number, sx: number, sy: number, sz: number, x: number, y: number, z: number) =>
      new THREE.SphereGeometry(r, 12, 8).scale(sx, sy, sz).translate(x, y, z);
    const parts: Part[] = [
      { geom: sph(0.5, 1.45, 0.72, 0.6, 0, 1.02, 0), mat: mats.reindeer }, // vartalo
      { geom: sph(0.3, 1.1, 0.95, 0.85, 0.45, 1.05, 0), mat: mats.reindeerLight }, // rinta
      { geom: limb(v(0.5, 1.15, 0), v(0.85, 1.68, 0), 0.22, 0.15, 8), mat: mats.reindeerLight }, // kaula
      { geom: sph(0.16, 1.5, 1, 0.95, 0.95, 1.72, 0), mat: mats.reindeer }, // pää
      { geom: limb(v(1.05, 1.7, 0), v(1.28, 1.62, 0), 0.1, 0.06, 8), mat: mats.reindeer }, // kuono
      { geom: sph(0.05, 1, 1, 1, 1.3, 1.62, 0), mat: mats.hoof }, // kirsu
      { geom: sph(0.08, 1, 1, 1, -0.72, 1.12, 0), mat: mats.reindeerLight }, // häntä
    ];
    for (const s of [-1, 1]) {
      // Korvat
      parts.push({ geom: limb(v(0.88, 1.82, 0.1 * s), v(0.82, 1.95, 0.24 * s), 0.05, 0.015), mat: mats.reindeerLight });
      // Jalat: ylä- ja alaosa, sorkat
      for (const x of [-0.45, 0.42]) {
        const z = 0.17 * s;
        parts.push({ geom: limb(v(x, 0.9, z), v(x + 0.02, 0.45, z), 0.075, 0.06), mat: mats.reindeer });
        parts.push({ geom: limb(v(x + 0.02, 0.45, z), v(x, 0.07, z), 0.05, 0.045), mat: mats.reindeerLight });
        parts.push({ geom: limb(v(x, 0, z), v(x, 0.08, z), 0.055, 0.05), mat: mats.hoof });
      }
      // Sarvet: kaareva päähaara taakse-ylös-ulos ja piikit eteen-ylös
      const p0 = v(0.9, 1.85, 0.07 * s), p1 = v(0.84, 2.2, 0.26 * s), p2 = v(0.68, 2.55, 0.42 * s), p3 = v(0.52, 2.82, 0.4 * s);
      parts.push({ geom: limb(p0, p1, 0.04, 0.035), mat: mats.antler });
      parts.push({ geom: limb(p1, p2, 0.035, 0.03), mat: mats.antler });
      parts.push({ geom: limb(p2, p3, 0.03, 0.015), mat: mats.antler });
      parts.push({ geom: limb(v(0.88, 2.0, 0.15 * s), v(1.08, 2.18, 0.2 * s), 0.025, 0.01), mat: mats.antler });
      parts.push({ geom: limb(p1, v(0.95, 2.48, 0.32 * s), 0.025, 0.01), mat: mats.antler });
      parts.push({ geom: limb(p2, v(0.8, 2.85, 0.5 * s), 0.022, 0.008), mat: mats.antler });
      parts.push({ geom: limb(p3, v(0.62, 3.0, 0.32 * s), 0.015, 0.006), mat: mats.antler });
    }
    return group(parts);
  })();
  const g = new THREE.Group();
  for (const { geom, mat } of reindeerCache) g.add(new THREE.Mesh(geom, mat));
  g.scale.setScalar(0.85);
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

/**
 * Puut kuvatasoina (referenssin mukaan): korkeat hoikat puut, paljas runko alhaalla, ohuet
 * vaakasuorat oksakerrokset, huurre ja lumi oksien päällä. Neljä tyyppiä samassa kuvakartassa:
 * 0 tuuhea kuusi, 1 harva kuusi, 2 mänty, 3 nuori kuusi. Jokainen puu on kolme ristikkäistä tasoa.
 */
export const TREE_KINDS = [
  { h: 15, crown: 0.28, step: [14, 20], len: 108, needles: 1 },
  { h: 16, crown: 0.36, step: [22, 34], len: 96, needles: 0.7 },
  { h: 17, crown: 0.72, step: [0, 0], len: 70, needles: 1 },
  { h: 7, crown: 0.04, step: [12, 16], len: 116, needles: 1.1 },
];

let treeAtlas: THREE.CanvasTexture | null = null;
function treeTexture() {
  if (treeAtlas) return treeAtlas;
  const W = 256, H = 1024;
  const c = document.createElement("canvas");
  c.width = W * 4;
  c.height = H;
  const g = c.getContext("2d")!;
  let seed = 12345;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Huurteiset neulaset: harmaanvihreää, osa lähes valkoista (referenssin puut ovat huurteisia)
  const needleCols = ["#2a3d34", "#3a4f45", "#55685f", "#8c9a94", "#b9c4c2"];
  const tuft = (x: number, y: number, len: number, density: number) => {
    // Neulastupsu: lyhyitä vetoja alaspäin, päällä lunta
    const n = Math.round(len * 0.9 * density);
    for (let i = 0; i < n; i++) {
      const t = rnd();
      const px = x + (rnd() - 0.5) * len;
      const py = y + (rnd() - 0.3) * 6;
      g.strokeStyle = needleCols[(rnd() * needleCols.length) | 0];
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px + (rnd() - 0.5) * 6, py + 5 + rnd() * 7 * (1 - t * 0.3));
      g.stroke();
    }
    g.fillStyle = "rgba(240,245,251,0.95)";
    for (let i = 0; i < n * 0.85; i++) {
      const px = x + (rnd() - 0.5) * len * 0.95;
      g.beginPath();
      g.ellipse(px, y - 1 + rnd() * 4, 2.2 + rnd() * 3.2, 1.5 + rnd() * 1.6, 0, 0, Math.PI * 2);
      g.fill();
    }
  };
  TREE_KINDS.forEach((k, idx) => {
    g.save();
    g.translate(idx * W, 0);
    const cx = W / 2;
    const top = 18;
    const base = H;
    // Runko: kapenee ylöspäin, yläosa punertava (mänty selvemmin)
    const gr = g.createLinearGradient(0, base, 0, top);
    gr.addColorStop(0, "#22170f");
    gr.addColorStop(0.5, idx === 2 ? "#6e3d22" : "#3b2516");
    gr.addColorStop(1, idx === 2 ? "#9a5a32" : "#5a3720");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(cx - (idx === 3 ? 4 : 6), base);
    g.lineTo(cx + (idx === 3 ? 4 : 6), base);
    g.lineTo(cx + 1, top);
    g.lineTo(cx - 1, top);
    g.fill();
    const crownY = base - (base - top) * k.crown;
    if (idx === 2) {
      // Mänty: latvus muutamana epätasaisena tupsuryppäänä ylhäällä
      for (let i = 0; i < 9; i++) {
        const y = top + 30 + rnd() * (crownY - top - 40);
        const side = rnd() < 0.5 ? -1 : 1;
        const l = 30 + rnd() * k.len;
        g.strokeStyle = "#4a2c1a";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(cx, y + 10);
        g.lineTo(cx + side * l * 0.6, y);
        g.stroke();
        tuft(cx + side * l * 0.45, y, l * 0.8, 1.3);
      }
      tuft(cx, top + 20, 60, 1.4);
    } else {
      // Kuuset: oksakerrokset tyvestä latvaan, lyhenevät ylöspäin; oksat hieman roikkuvat
      let y = crownY;
      while (y > top + 8) {
        const f = Math.pow((y - top) / (crownY - top), 0.85);
        for (const side of [-1, 1]) {
          const l = k.len * f * (0.7 + rnd() * 0.45);
          if (l < 6) continue;
          const droop = l * (0.18 + rnd() * 0.12);
          g.strokeStyle = "#2a1d14";
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(cx, y);
          g.quadraticCurveTo(cx + side * l * 0.5, y - 3, cx + side * l, y + droop);
          g.stroke();
          for (let t = 0.25; t <= 1; t += 0.25) tuft(cx + side * l * t, y + droop * t * t, l * 0.32, k.needles);
        }
        y -= k.step[0] + rnd() * (k.step[1] - k.step[0]);
      }
      tuft(cx, top + 6, 14, 1.5); // latva
    }
    g.restore();
  });
  treeAtlas = new THREE.CanvasTexture(c);
  treeAtlas.colorSpace = THREE.SRGBColorSpace;
  treeAtlas.anisotropy = 4;
  return treeAtlas;
}

export const treeCardMaterial = () =>
  new THREE.MeshLambertMaterial({ map: treeTexture(), alphaTest: 0.42, side: THREE.DoubleSide });

/** Puutyypin geometria: kolme ristikkäistä tasoa (0°, 60°, 120°), normaalit ylöspäin = tasainen valaistus. */
export function treeCardGeometry(kind: number): THREE.BufferGeometry {
  const k = TREE_KINDS[kind];
  const w = k.h / 4;
  const parts = [0, 1, 2].map((i) => {
    const pg = new THREE.PlaneGeometry(w, k.h).translate(0, k.h / 2 - 0.15, 0).rotateY((i * Math.PI) / 3);
    const uv = pg.getAttribute("uv");
    for (let j = 0; j < uv.count; j++) uv.setX(j, (kind + uv.getX(j)) / 4);
    const n = pg.getAttribute("normal");
    for (let j = 0; j < n.count; j++) n.setXYZ(j, 0, 1, 0);
    return pg;
  });
  return mergeGeometries(parts);
}
