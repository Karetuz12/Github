import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { SITE } from "./geo";

export const HOME = { target: new THREE.Vector3(10, 0, -10), dist: 470, polar: 1.36, azim: 0.08 };

export class CameraRig {
  camera: THREE.PerspectiveCamera;
  controls: MapControls;
  private anim: { t0: number; dur: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3; done?: () => void } | null = null;

  constructor(dom: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 1, 12000);
    this.controls = new MapControls(this.camera, dom);
    const c = this.controls;
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.minDistance = 22;
    c.maxDistance = 900;
    c.minPolarAngle = 0.3;
    c.maxPolarAngle = 1.42;
    c.zoomToCursor = true;
    c.screenSpacePanning = false;
    c.addEventListener("start", () => (this.anim = null));
    this.jump(HOME.target, HOME.dist, HOME.polar, HOME.azim);
  }

  private dest(target: THREE.Vector3, dist: number, polar: number, azim: number) {
    return target.clone().add(new THREE.Vector3().setFromSphericalCoords(dist, polar, azim));
  }

  jump(target: THREE.Vector3, dist: number, polar: number, azim: number) {
    this.controls.target.copy(target);
    this.camera.position.copy(this.dest(target, dist, polar, azim));
    this.controls.update();
  }

  get azimuth() {
    return this.controls.getAzimuthalAngle();
  }

  get distance() {
    return this.camera.position.distanceTo(this.controls.target);
  }

  flyTo(target: THREE.Vector3, opts: { dist?: number; polar?: number; azim?: number; dur?: number } = {}, done?: () => void) {
    const t = target.clone().setY(Math.max(0, target.y - 6));
    const dist = opts.dist ?? 80;
    const polar = opts.polar ?? 1.0;
    const azim = opts.azim ?? this.azimuth;
    const toP = this.dest(t, dist, polar, azim);
    const span = this.camera.position.distanceTo(toP);
    this.anim = {
      t0: performance.now(),
      dur: opts.dur ?? THREE.MathUtils.clamp(900 + span * 3, 1200, 3200),
      fromP: this.camera.position.clone(),
      fromT: this.controls.target.clone(),
      toP,
      toT: t,
      done,
    };
  }

  home(done?: () => void) {
    this.flyTo(HOME.target.clone().setY(6), { dist: HOME.dist, polar: HOME.polar, azim: HOME.azim }, done);
  }

  /** Käännä pohjoinen ylös (kompassi). */
  north() {
    this.flyTo(this.controls.target.clone().setY(6), { dist: this.distance, polar: this.controls.getPolarAngle(), azim: 0, dur: 900 });
  }

  update(now: number) {
    const a = this.anim;
    if (a) {
      const k = Math.min(1, (now - a.t0) / a.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      // Kaari: noustaan hieman ylemmäs pitkillä siirroilla
      const lift = Math.sin(k * Math.PI) * Math.min(160, a.fromP.distanceTo(a.toP) * 0.25);
      this.controls.target.lerpVectors(a.fromT, a.toT, e);
      this.camera.position.lerpVectors(a.fromP, a.toP, e).y += lift;
      if (k >= 1) {
        this.anim = null;
        a.done?.();
      }
    }
    // Pidä katse alueen tuntumassa
    const tg = this.controls.target;
    const lim = { x: SITE.w / 2 + 120, z: SITE.d / 2 + 120 };
    const cx = THREE.MathUtils.clamp(tg.x, -lim.x, lim.x) - tg.x;
    const cz = THREE.MathUtils.clamp(tg.z, -lim.z, lim.z) - tg.z;
    if (cx || cz) {
      tg.x += cx;
      tg.z += cz;
      this.camera.position.x += cx;
      this.camera.position.z += cz;
    }
    if (this.camera.position.y < 8) this.camera.position.y = 8;
    this.controls.update();
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
