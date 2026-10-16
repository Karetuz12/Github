import * as THREE from "three";

// Taivaskupu: väriliuku auringon korkeuden mukaan, tähdet ja revontulet.

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const frag = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform vec3 uSunDir;
uniform float uTime;
uniform float uStars;
uniform float uAurora;
varying vec3 vDir;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

vec3 aurora(vec3 dir) {
  if (dir.y < 0.01) return vec3(0.0);
  vec3 col = vec3(0.0);
  float T = uTime;
  float t = T * 0.09;
  const int N = 18;
  float jit = hash(gl_FragCoord.xy) / float(N); // häivyttää kerrosten porrastuksen
  for (int i = 0; i < N; i++) {
    float fi = float(i) / float(N) + jit;       // 0 = verhon alareuna, 1 = yläreuna
    float h = 0.35 + fi * 2.2;                 // kerroksen korkeus → verhon pystysuunta
    vec2 p = dir.xz / dir.y * h;
    // Verhon poimut liikkuvat sivusuunnassa ja muuttavat muotoaan
    float wave = sin(p.x * 0.35 + t * 2.0 + fbm(vec2(p.x * 0.15, t * 0.7)) * 4.0) * 0.9
               + fbm(vec2(p.x * 0.6 - t * 1.5, 1.7 + t * 0.3)) * 1.2;
    float d = p.y + 7.0 + wave;                 // pohjoisessa (−z) kulkeva vyö, matalalla horisontin yllä
    float band = exp(-d * d * 2.2);
    // Toinen, himmeämpi kaari korkeammalla
    float d2 = p.y + 11.5 + wave * 0.7 + sin(p.x * 0.22 - t * 1.3) * 0.8;
    float band2 = exp(-d2 * d2 * 1.6) * 0.3;
    // Säteet välkkyvät ja liukuvat vyötä pitkin
    float rays = 0.3 + fbm(vec2(p.x * 3.2 + wave - T * 0.35, T * 0.5)) * 1.4;
    // Kirkkaampia purkauksia kulkee vyön läpi
    float surge = 0.75 + 0.8 * smoothstep(0.35, 0.8, fbm(vec2(p.x * 0.12 - T * 0.06, T * 0.03)));
    // Sävy vaihtelee vyötä pitkin hitaasti liikkuen: vihreä → turkoosi → violetti
    float hue = fbm(vec2(p.x * 0.06 + T * 0.025, 4.0));
    vec3 c = mix(vec3(0.15, 1.0, 0.45), vec3(0.1, 0.9, 0.85), smoothstep(0.38, 0.55, hue));
    c = mix(c, vec3(0.75, 0.35, 1.3), smoothstep(0.6, 0.74, hue));
    // ...ja korkeuden mukaan: yläosa sinertävä ja violetti
    c = mix(c, vec3(0.4, 0.45, 1.2), smoothstep(0.3, 0.62, fi));
    c = mix(c, vec3(1.0, 0.3, 1.0), smoothstep(0.55, 0.95, fi));
    // Purkausten kohdalla alareunaan pinkki reunus
    c = mix(c, vec3(1.3, 0.3, 0.65), (1.0 - smoothstep(0.0, 0.2, fi)) * smoothstep(1.0, 1.4, surge) * 0.85);
    col += (c * band * surge + vec3(0.6, 0.3, 1.0) * band2) * rays * (1.0 - fi * 0.7);
  }
  float breathe = 0.85 + 0.15 * sin(T * 0.21);
  return col / float(N) * 2.9 * breathe * smoothstep(0.0, 0.12, dir.y);
}

void main() {
  vec3 dir = normalize(vDir);
  float y = max(dir.y, 0.0);
  vec3 col = mix(uHorizon, uZenith, pow(y, 0.55));
  // Auringon / hämärän hehku horisontissa auringon suunnassa
  float s = max(dot(normalize(vec3(dir.x, 0.0, dir.z)), normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0);
  col += uGlow * pow(s, 6.0) * exp(-y * 6.0);
  col += uGlow * 0.6 * pow(max(dot(dir, uSunDir), 0.0), 200.0);
  // Tähdet
  if (uStars > 0.0 && dir.y > 0.0) {
    vec3 cell = floor(dir * 420.0);
    float r = hash3(cell);
    float tw = 0.6 + 0.4 * sin(uTime * (1.0 + r * 3.0) + r * 40.0);
    col += vec3(0.85, 0.9, 1.0) * step(0.9965, r) * (r - 0.9965) * 280.0 * tw * uStars * smoothstep(0.02, 0.25, dir.y);
  }
  col += aurora(dir) * uAurora;
  // Horisontissa sama väri kuin sumussa, ettei maan ja taivaan väliin jää saumaa
  col = mix(uHorizon, col, smoothstep(0.0, 0.07, dir.y));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export class Sky {
  mesh: THREE.Mesh;
  uniforms = {
    uZenith: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uGlow: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uTime: { value: 0 },
    uStars: { value: 0 },
    uAurora: { value: 0 },
  };

  constructor() {
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: this.uniforms,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), mat);
    this.mesh.renderOrder = -1;
    this.mesh.frustumCulled = false;
  }
}

/** Taivaan värit auringon korkeuden (astetta) mukaan. */
const KEYS: { e: number; zenith: number; horizon: number; glow: number }[] = [
  { e: -18, zenith: 0x03060f, horizon: 0x0a1226, glow: 0x000000 },
  { e: -12, zenith: 0x060c1f, horizon: 0x131f3d, glow: 0x05070f },
  { e: -6, zenith: 0x14234a, horizon: 0x3c4c7e, glow: 0x2a1f3a },
  { e: -2, zenith: 0x2b4178, horizon: 0x8a8fbf, glow: 0x9a6a7a },
  { e: 1, zenith: 0x3f5f9c, horizon: 0xc3b8d0, glow: 0xf2a27a },
  { e: 6, zenith: 0x4f79b8, horizon: 0xcfd6e6, glow: 0xffc890 },
  { e: 20, zenith: 0x4a7fc6, horizon: 0xd4e2f2, glow: 0xfff0d0 },
];

export function skyColors(elevation: number) {
  const e = THREE.MathUtils.clamp(elevation, KEYS[0].e, KEYS[KEYS.length - 1].e);
  let i = 0;
  while (i < KEYS.length - 2 && e > KEYS[i + 1].e) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (e - a.e) / (b.e - a.e);
  const mix = (x: number, y: number) => new THREE.Color(x).lerp(new THREE.Color(y), t);
  return { zenith: mix(a.zenith, b.zenith), horizon: mix(a.horizon, b.horizon), glow: mix(a.glow, b.glow) };
}
