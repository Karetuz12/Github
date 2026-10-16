import * as THREE from "three";
import type { CameraRig } from "./camera";
import { icon } from "./icons";
import { CATEGORIES, PLACES, TOUR, byId, type Category, type Place } from "./places";

export type ViewState = {
  aurora: boolean;
  cats: Record<Category, boolean>;
};

type Hooks = {
  setMinutes: (m: number | null) => void; // null = seuraa kelloa
  snapshot: (p: Place) => string | null; // kuva kohteesta kartalta (kortin varakuva)
  onViewChange: () => void;
};

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export class UI {
  view: ViewState = { aurora: true, cats: { stay: true, eat: true, activities: true, services: true } };
  private pins = new Map<string, HTMLButtonElement>();
  private active: Place | null = null;
  private tour: { i: number; playing: boolean; timer: number } | null = null;
  private v = new THREE.Vector3();

  constructor(
    private rig: CameraRig,
    private hooks: Hooks,
  ) {
    this.buildChrome();
    this.buildPins();
    this.buildSearch();
    this.buildExplore();
    this.buildViewPop();
    this.showHint();
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeAll();
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        this.openSearch();
      }
    });
  }

  // --- Yläpalkki, alapalkki ja sivupainikkeet -------------------------------------
  private buildChrome() {
    $("btn-search").innerHTML = `${icon("search", 18)}<span>Find your igloo</span>`;
    $("btn-search").onclick = () => this.openSearch();
    $("btn-explore").innerHTML = `${icon("list", 19)}<span>Explore</span>`;
    $("btn-explore").onclick = () => this.toggle("explore");
    $("btn-tour").innerHTML = `${icon("route", 19)}<span>Tour</span>`;
    $("btn-tour").onclick = () => (this.tour ? this.stopTour() : this.startTour());
    $("btn-view").innerHTML = `${icon("layers", 19)}<span>View</span>`;
    $("btn-view").onclick = () => this.toggle("viewpop");
    $("btn-north").innerHTML = icon("compass", 20);
    $("btn-north").onclick = () => this.rig.north();
    $("btn-home").innerHTML = icon("home", 20);
    $("btn-home").onclick = () => {
      this.closeCard();
      this.rig.home();
    };
    $("btn-info").innerHTML = icon("info", 20);
    $("btn-info").onclick = () => ($("about").hidden = false);
    $("search-icon").innerHTML = icon("search", 18);
    for (const o of document.querySelectorAll<HTMLElement>(".overlay"))
      o.addEventListener("click", (e) => {
        if (e.target === o || (e.target as HTMLElement).closest("[data-close]")) o.hidden = true;
      });
    const range = $<HTMLInputElement>("time");
    range.addEventListener("input", () => this.hooks.setMinutes(Number(range.value)));
    $("btn-now").onclick = () => this.hooks.setMinutes(null);
  }

  private showHint() {
    const touch = matchMedia("(pointer: coarse)").matches;
    const el = $("hint");
    el.textContent = touch ? "Drag to turn · two fingers to move and zoom" : "Drag to turn · right-drag to move · scroll to zoom";
    el.hidden = false;
    const hide = () => el.classList.add("out");
    setTimeout(hide, 6000);
    $("scene").addEventListener("pointerdown", hide, { once: true });
  }

  setClock(minutes: number, date: Date, live: boolean, night: number) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    $("clock").textContent = `${hh}:${mm}`;
    $("date").textContent = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Helsinki" }).format(date);
    const range = $<HTMLInputElement>("time");
    if (document.activeElement !== range) range.value = String(minutes);
    $("btn-now").classList.toggle("on", live);
    const ic = night > 0.5 ? "moon" : "sun";
    if ($("tl-icon").dataset.ic !== ic) {
      $("tl-icon").dataset.ic = ic;
      $("tl-icon").innerHTML = icon(ic, 18);
    }
  }

  private toggle(id: "explore" | "viewpop") {
    const el = $(id);
    const open = el.hidden;
    $("explore").hidden = $("viewpop").hidden = true;
    el.hidden = !open;
    $("btn-explore").classList.toggle("on", id === "explore" && open);
    $("btn-view").classList.toggle("on", id === "viewpop" && open);
  }

  private closeAll() {
    for (const o of document.querySelectorAll<HTMLElement>(".overlay, .pop, .sheet")) o.hidden = true;
    $("btn-explore").classList.remove("on");
    $("btn-view").classList.remove("on");
    this.closeCard();
  }

  // --- Merkit ----------------------------------------------------------------------
  private buildPins() {
    const root = $("pins");
    for (const p of PLACES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `pin ${p.unit ? "unit" : ""} cat-${p.cat}`;
      b.innerHTML = p.unit
        ? `<span class="dot">${esc(p.id.split("-")[1])}</span><span class="label">${esc(p.title)}</span>`
        : `<span class="bubble">${icon(p.icon, 18)}</span><span class="stem"></span><span class="label">${esc(p.title)}</span>`;
      b.setAttribute("aria-label", `${p.eyebrow} – ${p.title}`);
      b.onclick = (e) => {
        e.stopPropagation();
        this.select(p);
      };
      root.appendChild(b);
      this.pins.set(p.id, b);
    }
  }

  /** Kutsutaan joka ruudulla: merkit kameran mukaan. */
  updatePins() {
    const cam = this.rig.camera;
    const w = innerWidth;
    const h = innerHeight;
    const dist = this.rig.distance;
    for (const p of PLACES) {
      const el = this.pins.get(p.id)!;
      let show = this.view.cats[p.cat];
      if (p.unit) show &&= dist < 190 || this.active?.id === p.id;
      else if (p.id === "igloos" || p.id === "cabins") show &&= dist > 150;
      else if (p.maxDist) show &&= dist < p.maxDist || this.active?.id === p.id;
      if (show) {
        this.v.copy(p.at).project(cam);
        show = this.v.z < 1 && Math.abs(this.v.x) < 1.1 && Math.abs(this.v.y) < 1.1;
      }
      if (!show) {
        if (!el.hidden) el.hidden = true;
        continue;
      }
      el.hidden = false;
      const x = (this.v.x * 0.5 + 0.5) * w;
      const y = (-this.v.y * 0.5 + 0.5) * h;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.zIndex = String(Math.round((1 - this.v.z) * 100000));
      el.classList.toggle("active", this.active?.id === p.id);
    }
  }

  // --- Kortti -------------------------------------------------------------------------
  select(p: Place, opts: { fly?: boolean } = {}) {
    this.active = p;
    $("explore").hidden = true;
    $("btn-explore").classList.remove("on");
    if (opts.fly !== false) this.rig.flyTo(p.at, { dist: p.view?.dist, polar: p.view?.polar, azim: p.view?.azim });
    this.renderCard(p);
    const url = new URL(location.href);
    url.searchParams.set("place", p.id);
    history.replaceState(null, "", url);
  }

  private renderCard(p: Place) {
    const card = $("card");
    const facts = p.facts?.length ? `<ul class="facts">${p.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : "";
    const actions = (p.actions ?? [])
      .map(
        (a) =>
          `<a class="btn ${a.primary ? "primary" : ""}" href="${esc(a.href)}" ${a.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(a.label)}${a.href.startsWith("http") ? icon("external", 15) : ""}</a>`,
      )
      .join("");
    card.innerHTML = `
      <div class="card-media"><span class="card-cat">${icon(p.icon, 16)}${esc(CATEGORIES.find((c) => c.id === p.cat)!.label)}</span>
        <button class="card-close" type="button" aria-label="Close">${icon("close", 18)}</button></div>
      <div class="card-body">
        <p class="eyebrow">${esc(p.eyebrow)}</p>
        <h2>${esc(p.title)}</h2>
        <p class="text">${esc(p.body)}</p>
        ${facts}
        <div class="actions">${actions}</div>
      </div>`;
    card.hidden = false;
    this.fitCard();
    card.querySelector<HTMLButtonElement>(".card-close")!.onclick = () => this.closeCard();
    const media = card.querySelector<HTMLElement>(".card-media")!;
    const fallback = () => {
      // Kuva kohteesta kartalta, kun kamera on perillä
      setTimeout(() => {
        if (this.active !== p) return;
        const shot = this.hooks.snapshot(p);
        if (shot) media.style.backgroundImage = `url(${shot})`;
      }, 1900);
    };
    if (p.image) {
      const img = new Image();
      img.onload = () => (media.style.backgroundImage = `url(${p.image})`);
      img.onerror = fallback;
      img.src = p.image;
    } else fallback();
  }

  /** Puhelimella kortti on alhaalla, isolla näytöllä oikealla: siirrä kohde näkyvälle alueelle. */
  fitCard() {
    const card = $("card");
    if (card.hidden) return this.rig.setInset(0, 0);
    const r = card.getBoundingClientRect();
    if (r.left > innerWidth / 2) this.rig.setInset(innerWidth - r.left, 0);
    else this.rig.setInset(0, innerHeight - r.top);
  }

  closeCard() {
    this.active = null;
    $("card").hidden = true;
    this.rig.setInset(0, 0);
    const url = new URL(location.href);
    url.searchParams.delete("place");
    history.replaceState(null, "", url);
  }

  // --- Haku ---------------------------------------------------------------------------
  private openSearch() {
    $("search").hidden = false;
    const input = $<HTMLInputElement>("search-input");
    input.value = "";
    this.renderResults("");
    setTimeout(() => input.focus(), 30);
  }

  private buildSearch() {
    const input = $<HTMLInputElement>("search-input");
    input.addEventListener("input", () => this.renderResults(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("search-results").querySelector<HTMLButtonElement>("button")?.click();
    });
  }

  private renderResults(q: string) {
    const s = q.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    let list: Place[];
    if (!s) list = PLACES.filter((p) => !p.unit);
    else if (/^\d+$/.test(s)) list = PLACES.filter((p) => p.unit && p.id.endsWith(`-${s}`));
    else
      list = PLACES.filter((p) => norm(`${p.title} ${p.eyebrow}`).includes(s)).sort(
        (a, b) => Number(!norm(a.title).startsWith(s)) - Number(!norm(b.title).startsWith(s)),
      );
    $("search-results").innerHTML = list.length
      ? list
          .slice(0, 30)
          .map(
            (p) =>
              `<li><button type="button" data-id="${p.id}"><span class="ri">${icon(p.icon, 18)}</span><span><b>${esc(p.title)}</b><small>${esc(p.eyebrow)}</small></span>${icon("chevron", 16)}</button></li>`,
          )
          .join("")
      : `<li class="empty">No igloo or place matches “${esc(q)}”.</li>`;
    for (const b of $("search-results").querySelectorAll<HTMLButtonElement>("button[data-id]"))
      b.onclick = () => {
        $("search").hidden = true;
        this.select(byId.get(b.dataset.id!)!);
      };
  }

  // --- Explore-lista ------------------------------------------------------------------
  private buildExplore() {
    const el = $("explore");
    el.innerHTML =
      `<div class="sheet-head"><h3>Explore SkyView</h3><button type="button" class="icon-btn" data-x aria-label="Close">${icon("close", 18)}</button></div>` +
      CATEGORIES.map(
        (c) =>
          `<section><h4>${esc(c.label)}</h4>${PLACES.filter((p) => p.cat === c.id && !p.unit)
            .map((p) => `<button type="button" class="row" data-id="${p.id}"><span class="ri">${icon(p.icon, 18)}</span><span><b>${esc(p.title)}</b><small>${esc(p.eyebrow)}</small></span>${icon("chevron", 16)}</button>`)
            .join("")}</section>`,
      ).join("");
    el.querySelector<HTMLButtonElement>("[data-x]")!.onclick = () => this.toggle("explore");
    for (const b of el.querySelectorAll<HTMLButtonElement>("button[data-id]")) b.onclick = () => this.select(byId.get(b.dataset.id!)!);
  }

  // --- Näkymäasetukset ----------------------------------------------------------------
  private buildViewPop() {
    const el = $("viewpop");
    const row = (id: string, label: string, ic: string, on: boolean) =>
      `<label class="toggle"><span class="ri">${icon(ic, 18)}</span><span>${esc(label)}</span><input type="checkbox" data-k="${id}" ${on ? "checked" : ""}/><i></i></label>`;
    const catIcon: Record<Category, string> = { stay: "igloo", eat: "dining", activities: "reindeer", services: "bell" };
    el.innerHTML =
      `<h4>Sky</h4>${row("aurora", "Northern lights", "aurora", true)}<h4>On the map</h4>` +
      CATEGORIES.map((c) => row(c.id, c.label, catIcon[c.id], true)).join("");
    el.addEventListener("change", (e) => {
      const t = e.target as HTMLInputElement;
      const k = t.dataset.k!;
      if (k === "aurora") this.view.aurora = t.checked;
      else this.view.cats[k as Category] = t.checked;
      this.hooks.onViewChange();
    });
  }

  // --- Opastettu kierros --------------------------------------------------------------
  startTour() {
    this.closeAll();
    this.tour = { i: -1, playing: true, timer: 0 };
    $("btn-tour").classList.add("on");
    const bar = $("tourbar");
    bar.hidden = false;
    bar.innerHTML = `
      <div class="tour-text"><small id="tour-step"></small><b id="tour-title"></b><span id="tour-desc"></span></div>
      <div class="tour-ctrl">
        <button type="button" data-a="prev" aria-label="Previous">${icon("back", 18)}</button>
        <button type="button" data-a="pause" aria-label="Pause">${icon("pause", 18)}</button>
        <button type="button" data-a="next" aria-label="Next">${icon("chevron", 18)}</button>
        <button type="button" data-a="stop" aria-label="End tour">${icon("close", 18)}</button>
      </div>`;
    bar.onclick = (e) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-a]")?.dataset.a;
      if (!a || !this.tour) return;
      if (a === "stop") return this.stopTour();
      if (a === "pause") {
        this.tour.playing = !this.tour.playing;
        (e.target as HTMLElement).closest("button")!.innerHTML = icon(this.tour.playing ? "pause" : "play", 18);
        clearTimeout(this.tour.timer);
        if (this.tour.playing) this.tourStep(this.tour.i + 1);
        return;
      }
      this.tourStep(this.tour.i + (a === "next" ? 1 : -1));
    };
    this.tourStep(0);
  }

  private tourStep(i: number) {
    const t = this.tour;
    if (!t) return;
    clearTimeout(t.timer);
    if (i >= TOUR.length) {
      this.stopTour();
      this.rig.home();
      return;
    }
    t.i = Math.max(0, i);
    const stop = TOUR[t.i];
    const p = byId.get(stop.id)!;
    $("tour-step").textContent = `${t.i + 1} / ${TOUR.length}`;
    $("tour-title").textContent = p.title;
    $("tour-desc").textContent = stop.text;
    this.active = p;
    this.rig.flyTo(p.at, { dist: (p.view?.dist ?? 80) * 1.15, polar: p.view?.polar ?? 1.05, azim: this.rig.azimuth + 0.35, dur: 3000 }, () => {
      if (this.tour === t && t.playing) t.timer = window.setTimeout(() => this.tourStep(t.i + 1), 4200);
    });
  }

  stopTour() {
    if (this.tour) clearTimeout(this.tour.timer);
    this.tour = null;
    this.active = null;
    $("tourbar").hidden = true;
    $("btn-tour").classList.remove("on");
  }

  /** Aloitusnäkymä osoitteesta: ?place=reception, ?igloo=9, ?cabin=12, ?tour */
  openFromUrl() {
    const q = new URLSearchParams(location.search);
    const id = q.get("place") ?? (q.get("igloo") ? `igloo-${q.get("igloo")}` : q.get("cabin") ? `cabin-${q.get("cabin")}` : null);
    const p = id ? byId.get(id) : undefined;
    if (p) setTimeout(() => this.select(p), 600);
    else if (q.has("tour")) setTimeout(() => this.startTour(), 900);
  }
}
