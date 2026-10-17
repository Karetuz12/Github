import * as THREE from "three";
import { IGLOO_ENTRY, RoadMask, SITE, heightAt, layout, rng, surfaceAt, toWorld, type Pt } from "./geo";
import * as M from "./models";

export type Quality = "high" | "low";

export type WorldInfo = {
  /** Iglun / mökin sijainti ja suunta numerolla. */
  igloos: Map<number, THREE.Vector3>;
  cabins: Map<number, THREE.Vector3>;
  lamps: THREE.Points;
  smoke: THREE.Points;
  /** Lyhtyjen ja iglujen lämmin valo lumella (näkyy pimeällä). */
  pools: THREE.InstancedMesh;
  /** Aitauksissa liikkuvat porot. */
  deer: Deer[];
};

/** Poro aitauksessaan: kävelee uuteen kohtaan, kääntyy kulkusuuntaan ja laiduntaa välillä. */
export type Deer = {
  g: THREE.Object3D;
  pick: () => { x: number; z: number };
  tx: number;
  tz: number;
  wait: number;
  speed: number;
  phase: number;
};

const deg = Math.PI / 180;

export function buildWorld(scene: THREE.Scene, mask: RoadMask, roadsImage: HTMLImageElement, quality: Quality): WorldInfo {
  const rand = rng(7);
  const deer: Deer[] = [];
  const shadows = quality === "high";
  const shade = (o: THREE.Object3D, cast = true, receive = true) => {
    if (!shadows) return o;
    o.traverse((m) => {
      m.castShadow = cast;
      m.receiveShadow = receive;
    });
    return o;
  };

  // --- Maa: lumi + aurattu tiestö opastekartasta -------------------------------
  const roadTex = new THREE.Texture(roadsImage);
  roadTex.needsUpdate = true;
  roadTex.wrapS = roadTex.wrapT = THREE.ClampToEdgeWrapping;
  const groundGeo = new THREE.PlaneGeometry(9000, 9000, 220, 220).rotateX(-Math.PI / 2);
  const gp = groundGeo.getAttribute("position");
  // Alueen kohdalla karkea pohjamaa painetaan alas; sen päälle tulee tiheämpi alueverkko
  const inner = (x: number, z: number) => Math.abs(x) < SITE.w / 2 + 90 && Math.abs(z) < SITE.d / 2 + 90;
  for (let i = 0; i < gp.count; i++) gp.setY(i, heightAt(gp.getX(i), gp.getZ(i)) - (inner(gp.getX(i), gp.getZ(i)) ? 12 : 0));
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
      .replace("#include <common>", "#include <common>\nuniform sampler2D uRoads;\nuniform vec2 uSite;\nvarying vec2 vRoadUv;\nvarying vec2 vXZ;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec2 ruv = vec2(vRoadUv.x, 1.0 - vRoadUv.y);
        bool inSite = vRoadUv.x >= 0.0 && vRoadUv.x <= 1.0 && vRoadUv.y >= 0.0 && vRoadUv.y <= 1.0;
        float road = inSite ? texture2D(uRoads, ruv).r : 0.0;
        // Etäisyys tien reunaan naapuripisteistä (maski on lähes kaksiarvoinen):
        // lo = pienin arvo r metrin säteellä (tien sisällä reunan lähellä), hi = suurin (tien ulkopuolella)
        float lo1 = 1.0, lo2 = 1.0, hi = 0.0;
        if (inSite) {
          for (int k = 0; k < ${quality === "high" ? 8 : 6}; k++) {
            float a = float(k) * ${quality === "high" ? "0.7854" : "1.0472"};
            vec2 dir = vec2(cos(a), sin(a)) / uSite;
            lo1 = min(lo1, texture2D(uRoads, ruv + dir * 1.3).r);
            lo2 = min(lo2, texture2D(uRoads, ruv + dir * 1.75).r);
            hi = max(hi, texture2D(uRoads, ruv + dir * 1.8).r);
          }
        }
        // Aurattu tie: hieman tummempi ja sinertävä
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.85, 0.87, 0.93), road);
        // Renkaanjäljet: kaksi tummaa uraa noin 1,5 m tien reunoista
        float rut = road * step(0.5, lo1) * (1.0 - step(0.5, lo2));
        diffuseColor.rgb *= 1.0 - 0.12 * rut;
        // Reunavalli: kirkas lumiharja heti tien ulkopuolella, varjoviiva reunassa
        float bank = (1.0 - road) * hi;
        diffuseColor.rgb *= 1.0 + 0.1 * bank;
        // Kaukainen metsä: tummempi pohja horisonttiin (puut eivät ulotu sinne asti)
        float far = smoothstep(${quality === "high" ? "900.0, 1500.0" : "550.0, 900.0"}, length(vXZ));
        diffuseColor.rgb *= mix(1.0, 0.62, far);`,
      );
  };
  scene.add(new THREE.Mesh(groundGeo, groundMat));

  // Alueen tarkka maasto (rinne päärakennukselta pohjoiseen); ulottuu painetun pohjamaan yli.
  // Reunimmat metrit painuvat pohjamaan alle, jotta saumassa ei välky.
  const siteW = SITE.w + 280;
  const siteD = SITE.d + 280;
  const siteGeo = new THREE.PlaneGeometry(siteW, siteD, Math.round(siteW / 2.5), Math.round(siteD / 2.5)).rotateX(-Math.PI / 2);
  const sp0 = siteGeo.getAttribute("position");
  for (let i = 0; i < sp0.count; i++) {
    const x = sp0.getX(i);
    const z = sp0.getZ(i);
    const edge = Math.min(siteW / 2 - Math.abs(x), siteD / 2 - Math.abs(z));
    sp0.setY(i, surfaceAt(x, z) - 0.4 * (1 - THREE.MathUtils.smoothstep(edge, 0, 8)));
  }
  siteGeo.computeVertexNormals();
  scene.add(shade(new THREE.Mesh(siteGeo, groundMat), false, true));
  const hc = toWorld(layout.buildings.reception.pos);

  // --- Iglut, mökit ------------------------------------------------------------
  const igloos = new Map<number, THREE.Vector3>();
  const cabins = new Map<number, THREE.Vector3>();
  const occupied: { p: THREE.Vector3; r: number }[] = [];

  const instanced = (parts: { geom: THREE.BufferGeometry; mat: THREE.Material }[], mats: THREE.Matrix4[]) => {
    for (const { geom, mat } of parts) {
      const im = new THREE.InstancedMesh(geom, mat, mats.length);
      mats.forEach((m, i) => im.setMatrixAt(i, m));
      im.computeBoundingSphere();
      scene.add(shade(im));
    }
  };
  const placeAll = (items: { n: number; pos: Pt }[], out: Map<number, THREE.Vector3>, r: number) =>
    items.map(({ n, pos }) => {
      const p = toWorld(pos);
      p.y = surfaceAt(p.x, p.z);
      const face = mask.facingRoad(p.x, p.z) ?? 0;
      out.set(n, p);
      occupied.push({ p, r });
      return new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), face), new THREE.Vector3(1, 1, 1));
    });
  // Iglut: lasikupoli aina pohjoiseen (paikallinen −x → −z). Silta osoittaa itään tai länteen
  // sen mukaan, kummalla puolella tie on; itään päin olevat ovat peilikuvia (terassi länteen).
  const northFacing = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
  const toWest: THREE.Matrix4[] = [];
  const toEast: THREE.Matrix4[] = [];
  for (const { n, pos } of layout.igloos) {
    const p = toWorld(pos);
    p.y = surfaceAt(p.x, p.z);
    igloos.set(n, p);
    occupied.push({ p, r: 9 });
    const face = mask.facingRoad(p.x, p.z) ?? 0;
    const east = IGLOO_ENTRY[n] ? IGLOO_ENTRY[n] === "east" : Math.sin(face) > 0;
    (east ? toEast : toWest).push(new THREE.Matrix4().compose(p, northFacing, new THREE.Vector3(1, 1, 1)));
  }
  instanced(M.iglooParts(false), toWest);
  instanced(M.iglooParts(true), toEast);
  instanced(M.cabinParts(), placeAll(layout.cabins, cabins, 5));

  // --- Päärakennus, Safari House, kodat ----------------------------------------
  const B = layout.buildings;
  const put = (obj: THREE.Object3D, pos: Pt, angle = 0, r = 10) => {
    const p = toWorld(pos);
    p.y = surfaceAt(p.x, p.z);
    obj.position.copy(p);
    obj.rotation.y = -angle * deg;
    scene.add(shade(obj));
    occupied.push({ p, r });
    return obj;
  };
  put(M.mainBuilding(), B.reception.pos, 0, 26);
  put(M.safariHouse(B.safariHouse.size[0] * 0.25, B.safariHouse.size[1] * 0.25), B.safariHouse.pos, B.safariHouse.angle, 12);
  put(M.kota(3), B.hut.pos, 0, 9);
  put(M.shed(4.5, 3.5), B.hut2.pos, 0, 5);
  put(M.dome(3.2), layout.points.ovalDome, 0, 6);
  put(M.campfire(), layout.points.ovalFire, 0, 6);

  // Lumisia kiviä rinteessä päärakennuksen pohjoispuolella (renderöinneissä mäen kyljessä)
  for (let i = 0, tries = 0; i < 16 && tries < 400; tries++) {
    const x = hc.x + (rand() - 0.5) * 60;
    const z = hc.z - 10 - rand() * 16;
    if (mask.near(x, z, 3) > 0.15) continue;
    const r = 0.6 + rand() * 1.1;
    const rock = M.rock(r, rand);
    rock.position.set(x, surfaceAt(x, z) - r * 0.35, z);
    rock.rotation.y = rand() * Math.PI * 2;
    scene.add(rock);
    occupied.push({ p: new THREE.Vector3(x, 0, z), r: r + 1.5 });
    i++;
  }

  // Porot: idän aitaus päärakennuksen vieressä ja soikion keskellä
  /**
   * Poroaitaus: soikio, jonka pitkä akseli (puoliakselit a, b metreinä) on kulmassa `angle`
   * (astetta, 0 = itä, 90 = etelä). `egg` > 0 leventää akselin suunnan vastaista päätä.
   */
  const herd = (center: Pt, count: number, a: number, b = a, angle = 0, egg = 0) => {
    const c = toWorld(center);
    const ca = Math.cos(angle * deg);
    const sa = Math.sin(angle * deg);
    const edge = (t: number, k = 1) => {
      const w = 1 - egg * Math.cos(t);
      const u = Math.cos(t) * a * k;
      const v = Math.sin(t) * b * k * w;
      return { x: c.x + u * ca - v * sa, z: c.z + u * sa + v * ca };
    };
    // Raivaa metsä aitauksen muodon mukaan
    for (let t = -1; t <= 1; t += 0.5) occupied.push({ p: new THREE.Vector3(c.x + t * (a - b) * ca, 0, c.z + t * (a - b) * sa), r: b * (1 + egg) + 3 });
    const pick = () => edge(Math.random() * Math.PI * 2, 0.15 + Math.random() * 0.65);
    for (let i = 0; i < count; i++) {
      const d = M.reindeer();
      const e = edge(rand() * Math.PI * 2, 0.25 + rand() * 0.5);
      d.position.set(e.x, surfaceAt(e.x, e.z), e.z);
      d.rotation.y = rand() * Math.PI * 2;
      scene.add(shade(d, true, false));
      deer.push({ g: d, pick, tx: e.x, tz: e.z, wait: rand() * 6, speed: 0.5 + rand() * 0.4, phase: rand() * 10 });
    }
    // Aita: tolpat ~1,5 m välein
    const per = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
    const n = Math.round(per / 1.5);
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 1.3, 0.15).translate(0, 0.65, 0), M.mats.woodLight, n);
    for (let i = 0; i < n; i++) {
      const e = edge((i / n) * Math.PI * 2);
      posts.setMatrixAt(i, new THREE.Matrix4().makeTranslation(e.x, surfaceAt(e.x, e.z), e.z));
    }
    scene.add(posts);
  };
  // Päärakennuksen pohjoispuolen aitaus: pitkänomainen soikio, pohjoispää kallistuu länteen ja on leveämpi (käyttäjän piirros 16.10.2026)
  herd(layout.points.reindeerEast, 6, 14, 7, 66, 0.15);
  herd(layout.points.ovalReindeer, 4, 9);

  // Pysäköinti: yksi rivi autoja keula lumivalliin päin (opastekartan vinoviivoitettu alue)
  const bankA = toWorld(layout.points.snowbankA);
  const bankB = toWorld(layout.points.snowbankB);
  const along = bankB.clone().sub(bankA);
  const len = along.length();
  along.normalize();
  const normal = new THREE.Vector3(along.z, 0, -along.x); // vallin koillispuoli (tien puoli)
  const bank = new THREE.Mesh(new THREE.BoxGeometry(len, 1.1, 2.4).translate(0, 0.55, 0), M.mats.snow);
  bank.position.copy(bankA).add(bankB).multiplyScalar(0.5);
  bank.position.y = surfaceAt(bank.position.x, bank.position.z);
  bank.rotation.y = Math.atan2(-along.z, along.x);
  scene.add(bank);
  const slots = Math.floor(len / 2.8);
  for (let i = 0; i < slots; i++) {
    if (rand() < 0.3) continue; // vapaita paikkoja
    const c = M.car();
    c.position.copy(bankA).addScaledVector(along, (i + 0.5) * 2.8).addScaledVector(normal, 3.8);
    c.position.y = surfaceAt(c.position.x, c.position.z);
    c.rotation.y = Math.atan2(-normal.z, normal.x) + Math.PI + (rand() - 0.5) * 0.06; // keula valliin päin
    scene.add(shade(c, true, false));
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
  const pines: THREE.Matrix4[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const addTree = (x: number, z: number, scale: number) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    s.set(scale * (0.85 + rand() * 0.3), scale, scale * (0.85 + rand() * 0.3));
    // Osa puista mäntyjä; kuuset kapeita ja korkeuden vaihtelu suurta
    const pine = rand() < 0.12;
    if (!pine) s.x = s.z = s.x * 0.7;
    else s.y *= 0.9 + rand() * 0.3;
    (pine ? pines : trees).push(m.compose(new THREE.Vector3(x, surfaceAt(x, z) - 0.2, z), q, s).clone());
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
        if (rand() < 0.18) continue; // pieniä aukkoja
        if (site && !free(px, pz)) continue;
        addTree(px, pz, sizeMin + rand() * (sizeMax - sizeMin));
      }
  };
  const hi = quality === "high";
  scatter(0, 260, hi ? 6.2 : 7.5, 0.6, 1.35); // alue ja lähiympäristö: harva, jotta lunta näkyy välistä
  scatter(260, hi ? 700 : 520, hi ? 7.5 : 10, 0.7, 1.35);
  if (hi) scatter(700, 1300, 13, 0.9, 1.5);

  const treeMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  for (const [geo, list] of [
    [M.treeGeometry(), trees],
    [M.pineGeometry(), pines],
  ] as const) {
    const mesh = new THREE.InstancedMesh(geo, treeMat, list.length);
    list.forEach((t, i) => mesh.setMatrixAt(i, t));
    mesh.computeBoundingSphere();
    scene.add(shade(mesh, true, false));
  }

  // --- Tievalot ----------------------------------------------------------------------
  const lampPts: number[] = [];
  const lampsAt: THREE.Vector3[] = [];
  for (let x = -SITE.w / 2; x < SITE.w / 2; x += 3)
    for (let z = -SITE.d / 2; z < SITE.d / 2; z += 3) {
      const v = mask.at(x, z);
      if (v < 0.3 || v > 0.7) continue; // tien reuna
      if (lampsAt.some((l) => (l.x - x) ** 2 + (l.z - z) ** 2 < 22 * 22)) continue;
      const y = surfaceAt(x, z);
      lampsAt.push(new THREE.Vector3(x, y, z));
      lampPts.push(x, y + 3.2, z);
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
  lampsAt.forEach((l, i) => poles.setMatrixAt(i, new THREE.Matrix4().makeTranslation(l.x, l.y, l.z)));
  scene.add(poles);

  // --- Savu päärakennuksen piipusta ja kodasta ----------------------------------
  const smokeAt = (pos: Pt, off: THREE.Vector3) => {
    const p = toWorld(pos).add(off);
    p.y += surfaceAt(p.x, p.z);
    return p;
  };
  const smokeSrc = [smokeAt(B.reception.pos, new THREE.Vector3(-8, 11.6, 3)), smokeAt(B.hut.pos, new THREE.Vector3(0, 4.8, 0))];
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

  // --- Lämmin valo lumella: lyhtyjen alla ja iglujen lasikupolien edessä ---------------
  const poolAt: { p: THREE.Vector3; r: number }[] = [
    ...lampsAt.map((l) => ({ p: l, r: 7 })),
    ...[...igloos.values()].map((p) => ({ p: p.clone().add(new THREE.Vector3(0, 0, -5.5)), r: 6 })),
    ...[...cabins.values()].map((p) => ({ p, r: 5 })),
  ];
  const pools = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: glowSprite(),
      color: 0xffb066,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
    poolAt.length,
  );
  poolAt.forEach(({ p, r }, i) => {
    const y = surfaceAt(p.x, p.z) + 0.08;
    pools.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(p.x, y, p.z), new THREE.Quaternion(), new THREE.Vector3(r, 1, r)));
  });
  pools.renderOrder = 1;
  scene.add(pools);

  return { igloos, cabins, lamps, smoke, pools, deer };
}

export function animateDeer(list: Deer[], t: number, dt: number) {
  for (const d of list) {
    const p = d.g.position;
    const dx = d.tx - p.x;
    const dz = d.tz - p.z;
    const dist = Math.hypot(dx, dz);
    if (d.wait > 0) {
      // Laiduntaa: pää alhaalla (koko poro kallistuu hieman eteen)
      d.wait -= dt;
      d.g.rotation.z = THREE.MathUtils.lerp(d.g.rotation.z, -0.22 + 0.03 * Math.sin(t * 2 + d.phase), 0.05);
      if (d.wait <= 0) {
        const n = d.pick();
        d.tx = n.x;
        d.tz = n.z;
      }
    } else if (dist < 0.2) {
      d.wait = 3 + Math.random() * 9;
    } else {
      const step = Math.min(dist, d.speed * dt);
      p.x += (dx / dist) * step;
      p.z += (dz / dist) * step;
      p.y = surfaceAt(p.x, p.z) + Math.abs(Math.sin(t * 6 + d.phase)) * 0.04;
      // Käänny pehmeästi kulkusuuntaan (keula +x)
      const want = Math.atan2(-dz, dx);
      let diff = want - d.g.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      d.g.rotation.y += diff * Math.min(1, dt * 3);
      d.g.rotation.z = THREE.MathUtils.lerp(d.g.rotation.z, 0, 0.1);
    }
  }
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
