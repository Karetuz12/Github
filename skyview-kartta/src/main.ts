import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import roadsUrl from "./assets/roads.png";
import { CameraRig } from "./camera";
import { RoadMask } from "./geo";
import { setGlow } from "./models";
import { Sky, skyColors } from "./sky";
import { helsinkiDate, helsinkiMinutes, sunPosition } from "./sun";
import { UI } from "./ui";
import { animateDeer, animateSmoke, buildWorld, type Quality } from "./world";
import "./style.css";

const params = new URLSearchParams(location.search);
const coarse = matchMedia("(pointer: coarse)").matches || Math.min(innerWidth, innerHeight) < 600;
const quality: Quality = (params.get("q") as Quality) ?? (coarse ? "low" : "high");

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === "high", powerPreference: "high-performance", preserveDrawingBuffer: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, quality === "high" ? 1.75 : 1.3));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
if (quality === "high") {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

const scene = new THREE.Scene();
const fog = new THREE.FogExp2(0x0a1226, 0.00055);
scene.fog = fog;
const sky = new Sky();
scene.add(sky.mesh);

const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
const sun = new THREE.DirectionalLight(0xffffff, 1);
const moon = new THREE.DirectionalLight(0x8ea8ff, 0.3);
const ambient = new THREE.AmbientLight(0x3a52b0, 0);
moon.position.set(-0.5, 0.6, 0.6).multiplyScalar(700);
// Varjot alueelta: aurinko päivällä, kuu yöllä (vain tarkassa laadussa)
for (const l of [sun, moon]) {
  const c = l.shadow.camera;
  c.left = -240;
  c.right = 240;
  c.top = 270;
  c.bottom = -270;
  c.near = 10;
  c.far = 1600;
  l.shadow.mapSize.set(2048, 2048);
  l.shadow.bias = -0.0004;
  l.shadow.normalBias = 0.6;
}
scene.add(hemi, sun, moon, ambient);

const rig = new CameraRig(canvas);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, rig.camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.7, 0.5, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());
if (quality === "low") composer.setPixelRatio(Math.min(devicePixelRatio, 1.3));

// --- Vuorokaudenaika -------------------------------------------------------------------
let manualMinutes: number | null = params.get("time") ? parseTime(params.get("time")!) : null;
function parseTime(s: string) {
  const [h, m = "0"] = s.split(":");
  return (Number(h) * 60 + Number(m)) % 1440;
}

const { mask, image } = await RoadMask.load(roadsUrl);
const world = buildWorld(scene, mask, image, quality);

let nightFactor = 0;
let auroraLevel = 0;
const ui = new UI(rig, {
  setMinutes: (m) => {
    manualMinutes = m;
    applyTime();
  },
  snapshot: (p) => {
    try {
      composer.render();
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 360;
      // Rajaa kohteen ympäriltä (merkit eivät näy, ne ovat HTML:ää)
      const v = p.at.clone().project(rig.camera);
      const sw = Math.min(canvas.width, canvas.height * 1.4) * 0.55;
      const sh = (sw * 9) / 16;
      const cx = THREE.MathUtils.clamp((v.x * 0.5 + 0.5) * canvas.width, sw / 2, canvas.width - sw / 2);
      const cy = THREE.MathUtils.clamp((-v.y * 0.5 + 0.5) * canvas.height + sh * 0.15, sh / 2, canvas.height - sh / 2);
      c.getContext("2d")!.drawImage(canvas, cx - sw / 2, cy - sh / 2, sw, sh, 0, 0, 640, 360);
      return c.toDataURL("image/jpeg", 0.8);
    } catch {
      return null;
    }
  },
  onViewChange: () => applyTime(),
});

function applyTime() {
  const now = new Date();
  const minutes = manualMinutes ?? helsinkiMinutes(now);
  const date = helsinkiDate(now, minutes);
  const { elevation, azimuth } = sunPosition(date);
  // Atsimuutti pohjoisesta myötäpäivään → maailman suunta (pohjoinen = −z, itä = +x)
  const az = (azimuth * Math.PI) / 180;
  const el = (Math.max(elevation, -10) * Math.PI) / 180;
  const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
  const c = skyColors(elevation);

  nightFactor = THREE.MathUtils.smoothstep(-elevation, -1, 9); // 0 päivä … 1 yö
  const dark = THREE.MathUtils.smoothstep(-elevation, 7, 14);
  auroraLevel = ui.view.aurora ? dark : 0;

  const u = sky.uniforms;
  u.uZenith.value.copy(c.zenith);
  u.uHorizon.value.copy(c.horizon);
  u.uGlow.value.copy(c.glow);
  u.uSunDir.value.copy(dir);
  u.uStars.value = dark;
  u.uAurora.value = auroraLevel;

  fog.color.copy(c.horizon);
  sun.position.copy(dir).multiplyScalar(700);
  if (quality === "high") {
    sun.castShadow = elevation > 1;
    moon.castShadow = !sun.castShadow;
  }
  sun.intensity = THREE.MathUtils.smoothstep(elevation, -2, 10) * 2.2;
  sun.color.set(elevation < 6 ? 0xffd2a8 : 0xfff4e6);
  // Yöllä syvempi sininen sävy (referenssin mukaan)
  hemi.color.copy(c.zenith).lerp(new THREE.Color(0xffffff), THREE.MathUtils.lerp(0.35, 0.12, nightFactor)).lerp(new THREE.Color(0x3556c8), 0.55 * nightFactor);
  hemi.groundColor.copy(c.horizon).multiplyScalar(0.6).lerp(new THREE.Color(0x1a2a5c), 0.5 * nightFactor);
  hemi.intensity = THREE.MathUtils.lerp(2.4, 0.6, nightFactor);
  moon.intensity = 0.9 * nightFactor;
  ambient.intensity = 0.7 * nightFactor;
  // Revontulet valaisevat lunta hieman vihreäksi
  if (auroraLevel > 0) hemi.color.lerp(new THREE.Color(0x4fe0a0), 0.12 * auroraLevel);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(1.25, 1.2, nightFactor);
  fog.density = THREE.MathUtils.lerp(0.00036, 0.0006, nightFactor);

  setGlow(nightFactor);
  const lampMat = world.lamps.material as THREE.PointsMaterial;
  lampMat.opacity = THREE.MathUtils.smoothstep(nightFactor, 0.2, 0.7);
  (world.pools.material as THREE.MeshBasicMaterial).opacity = 0.55 * THREE.MathUtils.smoothstep(nightFactor, 0.2, 0.8);
  bloom.strength = THREE.MathUtils.lerp(0.2, 0.6, nightFactor);
  bloom.threshold = THREE.MathUtils.lerp(0.95, 0.7, nightFactor);

  ui.setClock(minutes, date, manualMinutes === null, nightFactor);
}

applyTime();
setInterval(() => manualMinutes === null && applyTime(), 30_000);

addEventListener("resize", () => {
  rig.resize();
  ui.fitCard();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
let lastT = 0;
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  sky.uniforms.uTime.value = t;
  sky.mesh.position.copy(rig.camera.position);
  animateSmoke(world.smoke, t);
  animateDeer(world.deer, t, Math.min(0.1, t - lastT));
  lastT = t;
  rig.update(performance.now());
  composer.render();
  ui.updatePins();
});

document.getElementById("loading")!.classList.add("done");
ui.openFromUrl();
// Testejä varten
Object.assign(window, { __map: { rig, ui, applyTime } });
