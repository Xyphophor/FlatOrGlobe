// Simulateur (epic13) : ce qu'enregistre le capteur pour une hauteur, un
// champ, un objectif (les huit lois de src/core/lenses.js) et une visée.
// Le dessin lui-même est frame.js ; ici les contrôles et les lectures.
import { LENSES, lens as lensOf, maxFov } from "../../core/lenses.js";
import { K_STD, horizonRadius } from "./logic.js";
import { paintFrame } from "./frame.js";
import { fmtH, fmtAng, fmtPx, fmtPct } from "./fmt.js";
export { num, fmtH, fmtLen, fmtAng, fmtPx, fmtPct } from "./fmt.js";

const D2R = Math.PI / 180;
const H_MIN = 0.5, H_MAX = 1e6;           // curseur logarithmique
export const hFromSlider = (s) => H_MIN * (H_MAX / H_MIN) ** (s / 1000);
export const sliderFromH = (h) => Math.round((1000 * Math.log(h / H_MIN)) / Math.log(H_MAX / H_MIN));

/** Champ maximal proposé pour un objectif : la loi le permet, et au-delà de 150° un rectilinéaire n'a plus de sens. */
export const fovCap = (k, aspect = 2 / 3) => { const L = lensOf(k); return Math.min(maxFov(L, aspect), L.rect ? 150 : 180); };

/** Remplit un <select> avec les huit objectifs (libellés du dictionnaire star, via tr). */
export function fillLensSelect(sel, tr, value) {
  sel.innerHTML = LENSES.map((L) => `<option value="${L.k}">${tr(`lens-${L.k}`, L.k)}</option>`).join("");
  sel.value = value;
}

export function mountSim(root, tr) {
  const $ = (id) => root.querySelector(`#${id}`);
  const cv = $("curvSim"), reads = $("curvSimReads");
  const inH = $("curvH"), inHn = $("curvHn"), inF = $("curvFov"), inFn = $("curvFovn");
  const inLens = $("curvLens"), inAim = $("curvAim"), inP = $("curvPitch"), outP = $("curvPitchv");
  const st = { h: 10668, fov: 62.7, lens: "r35", aim: "level", pitch: 0 };
  const listeners = [];
  let raf = 0;
  let onChange = null;
  fillLensSelect(inLens, tr, st.lens);

  const sync = () => {
    inH.value = sliderFromH(st.h); inHn.value = +st.h.toPrecision(5);
    inF.max = inFn.max = fovCap(st.lens);
    if (st.fov > +inF.max) st.fov = +inF.max;
    inF.value = st.fov; inFn.value = st.fov;
    inP.disabled = st.aim !== "custom";
    outP.textContent = st.aim === "custom" ? `${st.pitch > 0 ? "↓" : st.pitch < 0 ? "↑" : ""} ${Math.abs(st.pitch)}°` : "";
  };
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); listeners.push([el, ev, fn]); };
  const upd = () => { sync(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); onChange?.(st.h); };
  on(inH, "input", () => { st.h = +hFromSlider(+inH.value).toPrecision(4); upd(); });
  on(inHn, "change", () => { const v = +inHn.value; if (v > 0) st.h = Math.min(H_MAX, Math.max(H_MIN, v)); upd(); });
  on(inF, "input", () => { st.fov = +inF.value; upd(); });
  on(inFn, "change", () => { const v = +inFn.value; if (v >= 5) st.fov = Math.min(+inF.max, v); upd(); });
  on(inLens, "change", () => { st.lens = inLens.value; upd(); });
  on(inAim, "change", () => { st.aim = inAim.value; upd(); });
  on(inP, "input", () => { st.pitch = +inP.value; upd(); });
  root.querySelectorAll("#curvPresets [data-h]").forEach((b) => on(b, "click", () => { st.h = +b.dataset.h; upd(); }));
  const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  if (typeof window !== "undefined") window.addEventListener("resize", onResize);

  function draw() {
    const f = paintFrame(cv, {
      h: st.h, fov: st.fov, lens: st.lens,
      pitchOf: (cam0, dR) => (st.aim === "centre" ? dR : st.aim === "custom" ? st.pitch * D2R : 0),
      labels: [[`h = ${fmtH(st.h)} · ${st.fov}° · ${tr(`lsh-${st.lens}`, st.lens)}`, "tl"],
        [tr("true-proj", "true projection · no exaggeration"), "br"], [tr("eye-level", "eye level = a plane's horizon"), "bl", true]],
    });
    if (!f) return;
    const sR = f.ref(f.dR), sG = f.ref(f.dG), sF = f.ref(0);
    const sag = (q) => q ? `${fmtPx(q.px)} · ${fmtPct(q.frac)} · ${fmtAng(q.rad)}${q.inFrame ? "" : " " + tr("off-frame", "(ends off the frame)")}` : tr("no-edge", "the whole ring is inside the frame");
    reads.innerHTML =
      `<div>${tr("r-dip", "Dip of the horizon")}: <span class="g">${fmtAng(f.dR)}</span> ${tr("refr", "refracted")} · ${fmtAng(f.dG)} ${tr("geom", "geometric")}</div>` +
      `<div>${tr("r-ring", "Horizon ring, radius along the ground")}: ${fmtH(horizonRadius(st.h, K_STD))} (${fmtH(horizonRadius(st.h))} ${tr("geom", "geometric")})</div>` +
      `<div>${tr("r-sag", "Globe sagitta on a 4,000-px photo")}: <span class="g">${sag(sR)}</span> ${tr("refr", "refracted")}</div>` +
      `<div class="sub">${tr("geom", "geometric")}: ${sag(sG)}</div>` +
      `<div>${tr("r-flat", "Plane (eye-level horizon)")}: <span class="f">${sF ? fmtPx(sF.px) : "—"}</span>${st.lens !== "r35" && sF && Math.abs(sF.px) >= 0.5 ? ` — ${tr("r-flat-lens", "all of it lens distortion: a flat horizon bent by the lens")}` : ""}</div>`;
  }

  sync();
  return {
    draw,
    get h() { return st.h; },
    onHeight(fn) { onChange = fn; },
    /** Reprend la caméra du calculateur (champ, loi), horizon centré, et amène le simulateur à l'écran. */
    setCamera({ fov, lens }) {
      if (!inLens.querySelector(`option[value="${lens}"]`)) inLens.insertAdjacentHTML("beforeend", `<option value="${lens}">${tr(`lsh-${lens}`, lens)}</option>`);
      st.lens = lens; st.fov = +fov.toFixed(1); st.aim = "centre";
      inLens.value = lens; inAim.value = "centre"; upd();
      cv.scrollIntoView?.({ block: "center", behavior: "smooth" });
    },
    stop() { cancelAnimationFrame(raf); },
    dispose() { for (const [el, ev, fn] of listeners) el.removeEventListener(ev, fn); if (typeof window !== "undefined") window.removeEventListener("resize", onResize); },
  };
}
