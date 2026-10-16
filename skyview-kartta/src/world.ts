import * as THREE from "three";
import { RoadMask, SITE, heightAt, layout, rng, toWorld, type Pt } from "./geo";
import * as M from "./models";

export type Quality = "high" | "low";

export type WorldInfo = {
  /** Iglun / mökin sijainti ja suunta numerolla. */
  igloos: Map<number, THREE.Vector3>;
  cabins: Map<number, THREE.Vector3>;
  lamps: THREE.Points;
  smoke: THREE.Points;
};

const deg = Math.PI / 180;

export function buildWorld(scene: THREE.Scene, mask: RoadMask, roadsImage: HTMLImageElement, quality: Quality): WorldInfo {
  const rand = rng(7);

  // --- Maa: lumi + aurattu tiestö opastekartasta -------------------------------
  const roadTex = new THREE.Texture(roadsImage);
  roadTex.needsUpdate = true;
  roadTex.wrapS = roadTex.wrapT = THREE.ClampToEdgeWrapping;
  const groundGeo = new THREE.PlaneGeometry(9000, 9000, 220, 220).rotateX(-Math.PI / 2);
  const gp = groundGeo.getAttribute("position");
  for (let i = 0; i < gp.count; i++) gp.setY(i, heightAt(gp.getX(i), gp.getZ(i)));
  groundGeo.computeVertexNormals();
  const groundMat = new THREE.MeshLambertMaterial({ color: 0xf4f7fc });
  groundMat.onBeforeCompile = (sh) => {
    sh.uniforms.uRoads = { value: roadTex };
    sh.uniforms.uSite = { value: new THREE.Vector2(SITE.w, SITE.d) };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform vec2 uSite;\nvarying vec2 vRoadUv;\nvarying vec2 vXZ;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvec4 wp = modelMatrix * vec4(transformed, 1.0);\nvRoadUv = wp.xz / uSite + 0.5;\nvXZ = wp.xz;",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uRoads;\nvarying vec2 vRoadUv;\nvarying vec2 vXZ;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float road = texture2D(uRoads, vec2(vRoadUv.x, 1.0 - vRoadUv.y)).r;
        if (vRoadUv.x < 0.0 || vRoadUv.x > 1.0 || vRoadUv.y < 0.0 || vRoadUv.y > 1.0) road = 0.0;
        float tracks = 0.94 + 0.06 * sin(vXZ.x * 1.7 + vXZ.y * 0.9);
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.80, 0.82, 0.88) * tracks, road);
        // Kaukainen metsä: tummempi pohja horisonttiin (puut eivät ulotu sinne asti)
        float far = smoothstep(${quality === "high" ? "900.0, 1500.0" : "550.0, 900.0"}, length(vXZ));
        diffuseColor.rgb *= mix(1.0, 0.62, far);`,
      );
  };
  scene.add(new THREE.Mesh(groundGeo, groundMat));

  // --- Iglut, mökit ------------------------------------------------------------
  const igloos = new Map<number, THREE.Vector3>();
  const cabins = new Map<number, THREE.Vector3>();
  const occupied: { p: THREE.Vector3; r: number }[] = [];

  const instanced = (parts: { geom: THREE.BufferGeometry; mat: THREE.Material }[], mats: THREE.Matrix4[]) => {
    for (const { geom, mat } of parts) {
      const im = new THREE.InstancedMesh(geom, mat, mats.length);
      mats.forEach((m, i) => im.setMatrixAt(i, m));
      im.computeBoundingSphere();
      scene.add(im);
    }
  };
  const placeAll = (items: { n: number; pos: Pt }[], out: Map<number, THREE.Vector3>, r: number) =>
    items.map(({ n, pos }) => {
      const p = toWorld(pos);
      const face = mask.facingRoad(p.x, p.z) ?? 0;
      out.set(n, p);
      occupied.push({ p, r });
      return new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), face), new THREE.Vector3(1, 1, 1));
    });
  instanced(M.iglooParts(), placeAll(layout.igloos, igloos, 9));
  instanced(M.cabinParts(), placeAll(layout.cabins, cabins, 5));

  // --- Päärakennus, Safari House, kodat ----------------------------------------
  const B = layout.buildings;
  const put = (obj: THREE.Object3D, pos: Pt, angle = 0, r = 10) => {
    const p = toWorld(pos);
    obj.position.copy(p);
    obj.rotation.y = -angle * deg;
    scene.add(obj);
    occupied.push({ p, r });
    return obj;
  };
  put(M.mainBuilding(), B.reception.pos, 0, 26);
  put(M.safariHouse(B.safariHouse.size[0] * 0.25, B.safariHouse.size[1] * 0.25), B.safariHouse.pos, B.safariHouse.angle, 12);
  put(M.kota(3), B.hut.pos, 0, 6);
  put(M.shed(4.5, 3.5), B.hut2.pos, 0, 5);
  put(M.dome(3.2), layout.points.ovalDome, 0, 6);
  put(M.campfire(), layout.points.ovalFire, 0, 6);

  // Porot: idän aitaus päärakennuksen vieressä ja soikion keskellä
  const herd = (center: Pt, count: number, spread: number) => {
    const c = toWorld(center);
    occupied.push({ p: c, r: spread + 4 });
    for (let i = 0; i < count; i++) {
      const d = M.reindeer();
      d.position.set(c.x + (rand() - 0.5) * spread * 2, 0, c.z + (rand() - 0.5) * spread * 2);
      d.rotation.y = rand() * Math.PI * 2;
      scene.add(d);
    }
    // Aita
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 1.3, 0.15).translate(0, 0.65, 0), M.mats.woodLight, 40);
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      posts.setMatrixAt(i, new THREE.Matrix4().makeTranslation(c.x + Math.cos(a) * (spread + 3), 0, c.z + Math.sin(a) * (spread + 3)));
    }
    scene.add(posts);
  };
  herd(layout.points.reindeerEast, 6, 9);
  herd(layout.points.ovalReindeer, 4, 6);

  // Pysäköinti: yksi rivi autoja keula kohti lumivallia (opastekartan vinoviivoitettu alue)
  const bankA = toWorld(layout.points.snowbankA);
  const bankB = toWorld(layout.points.snowbankB);
  const along = bankB.clone().sub(bankA);
  const len = along.length();
  along.normalize();
  const normal = new THREE.Vector3(along.z, 0, -along.x); // vallin koillispuoli (tien puoli)
  const bank = new THREE.Mesh(new THREE.BoxGeometry(len, 1.1, 2.4).translate(0, 0.55, 0), M.mats.snow);
  bank.position.copy(bankA).add(bankB).multiplyScalar(0.5);
  bank.rotation.y = Math.atan2(-along.z, along.x);
  scene.add(bank);
  const slots = Math.floor(len / 2.8);
  for (let i = 0; i < slots; i++) {
    if (rand() < 0.3) continue; // vapaita paikkoja
    const c = M.car();
    c.position.copy(bankA).addScaledVector(along, (i + 0.5) * 2.8).addScaledVector(normal, 3.8);
    c.rotation.y = Math.atan2(-normal.z, normal.x) + Math.PI + (rand() - 0.5) * 0.06;
    scene.add(c);
  }

  // Soikion keskiosa on aukea (opastekartassa ei puita)
  const ring = layout.cabins.map((c) => toWorld(c.pos));
  const ringC = ring.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / ring.length);
  const inOval = (x: number, z: number) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i].clone().lerp(ringC, 0.12);
      const b = ring[j].clone().lerp(ringC, 0.12);
      if (a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) inside = !inside;
    }
    return inside;
  };

  // --- Metsä ---------------------------------------------------------------------
  const trees: THREE.Matrix4[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const addTree = (x: number, z: number, scale: number) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    s.set(scale * (0.85 + rand() * 0.3), scale, scale * (0.85 + rand() * 0.3));
    trees.push(m.compose(new THREE.Vector3(x, heightAt(x, z) - 0.2, z), q, s).clone());
  };
  const free = (x: number, z: number) => {
    if (mask.near(x, z, 4) > 0.15) return false;
    for (const o of occupied) if ((o.p.x - x) ** 2 + (o.p.z - z) ** 2 < o.r * o.r) return false;
    return !inOval(x, z);
  };
  const inSiteBox = (x: number, z: number) => Math.abs(x) < SITE.w / 2 + 20 && Math.abs(z) < SITE.d / 2 + 20;
  /** Ensimmäinen kierros (r0 = 0) kattaa alueen ja r1-säteen; seuraavat renkaat sen ulkopuolelta. */
  const scatter = (r0: number, r1: number, spacing: number, sizeMin: number, sizeMax: number) => {
    for (let x = -r1; x < r1; x += spacing)
      for (let z = -r1; z < r1; z += spacing) {
        const px = x + (rand() - 0.5) * spacing * 0.9;
        const pz = z + (rand() - 0.5) * spacing * 0.9;
        const r = Math.hypot(px, pz);
        const site = inSiteBox(px, pz);
        if (r0 === 0 ? !(site || r < r1) : site || r < r0 || r >= r1) continue;
        if (rand() < 0.12) continue; // pieniä aukkoja
        if (site && !free(px, pz)) continue;
        addTree(px, pz, sizeMin + rand() * (sizeMax - sizeMin));
      }
  };
  const hi = quality === "high";
  scatter(0, 260, hi ? 4.6 : 6, 0.55, 1.25); // alue ja lähiympäristö
  scatter(260, hi ? 700 : 520, hi ? 7 : 10, 0.7, 1.3);
  if (hi) scatter(700, 1300, 13, 0.9, 1.5);

  const treeMesh = new THREE.InstancedMesh(M.treeGeometry(), new THREE.MeshLambertMaterial({ vertexColors: true }), trees.length);
  trees.forEach((t, i) => treeMesh.setMatrixAt(i, t));
  treeMesh.computeBoundingSphere();
  scene.add(treeMesh);

  // --- Tievalot ----------------------------------------------------------------------
  const lampPts: number[] = [];
  const lampsAt: THREE.Vector3[] = [];
  for (let x = -SITE.w / 2; x < SITE.w / 2; x += 3)
    for (let z = -SITE.d / 2; z < SITE.d / 2; z += 3) {
      const v = mask.at(x, z);
      if (v < 0.3 || v > 0.7) continue; // tien reuna
      if (lampsAt.some((l) => (l.x - x) ** 2 + (l.z - z) ** 2 < 22 * 22)) continue;
      lampsAt.push(new THREE.Vector3(x, 0, z));
      lampPts.push(x, 3.2, z);
    }
  const lampGeo = new THREE.BufferGeometry();
  lampGeo.setAttribute("position", new THREE.Float32BufferAttribute(lampPts, 3));
  const lamps = new THREE.Points(
    lampGeo,
    new THREE.PointsMaterial({
      size: 7,
      map: glowSprite(),
      color: 0xffc98a,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0,
    }),
  );
  scene.add(lamps);
  const poles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 3.2, 0.12).translate(0, 1.6, 0), M.mats.dark, lampsAt.length);
  lampsAt.forEach((l, i) => poles.setMatrixAt(i, new THREE.Matrix4().makeTranslation(l.x, 0, l.z)));
  scene.add(poles);

  // --- Savu päärakennuksen piipusta ja kodasta ----------------------------------
  const smokeSrc = [toWorld(B.reception.pos).add(new THREE.Vector3(4, 10, -2)), toWorld(B.hut.pos).add(new THREE.Vector3(0, 4.8, 0))];
  const N = 40;
  const sp = new Float32Array(N * smokeSrc.length * 3);
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  smokeGeo.userData = { src: smokeSrc, n: N };
  const smoke = new THREE.Points(
    smokeGeo,
    new THREE.PointsMaterial({ size: 7, map: glowSprite(), color: 0xc8cdd8, transparent: true, depthWrite: false, opacity: 0.1 }),
  );
  smoke.frustumCulled = false;
  scene.add(smoke);

  return { igloos, cabins, lamps, smoke };
}

export function animateSmoke(smoke: THREE.Points, t: number) {
  const { src, n } = smoke.geometry.userData as { src: THREE.Vector3[]; n: number };
  const a = smoke.geometry.getAttribute("position") as THREE.BufferAttribute;
  src.forEach((s, k) => {
    for (let i = 0; i < n; i++) {
      const life = ((t * 0.12 + i / n) % 1 + 1) % 1;
      const j = k * n + i;
      a.setXYZ(j, s.x + life * 9 + Math.sin(i * 12.9 + t * 0.6) * life * 2, s.y + life * 14, s.z - life * 3 + Math.cos(i * 7.3) * life * 2);
    }
  });
  a.needsUpdate = true;
}

let sprite: THREE.Texture | null = null;
function glowSprite(): THREE.Texture {
  if (sprite) return sprite;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  sprite = new THREE.CanvasTexture(c);
  return sprite;
}
