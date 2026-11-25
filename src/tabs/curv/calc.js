// Calculateur (epic13) : une caméra (réelle ou décrite) + largeur d'image ->
// hauteur à partir de laquelle la flèche de l'horizon atteint un seuil.
// Horizon centré, horizon net (hypothèses écrites dans le texte). Globe
// géométrique et réfracté côte à côte (règle 3) ; le plan : 0.0 littéral
// (règle 7). Caméras : cameras.js (caractéristiques publiées).
import { LENSES } from "../../core/lenses.js";
import { K_STD, heightForSagitta, sagittaAt, sagitta, makeCamera, pitchForHorizonAt } from "./logic.js";
import { LYNCH_PHOTO, LYNCH_REPORTS } from "../../data/presets/curv.js";
import { CAMERAS, camera, fovFromEq, fovFromFocalLaw, GOPRO_K } from "./cameras.js";
import { fmtH, fmtPx, fmtPct, num } from "./fmt.js";

const GROUPS = ["phone", "action", "sensor", "other"];
const ref = (n) => `<sup class="ref"><a href="#s-curv-n${n}">[${n}]</a></sup>`;

/** Flèche de la photo de Lynch, en fraction de la largeur (réfractée) : le repère « subtile mais discernable ». */
export function lynchFrac() {
  return sagittaAt(LYNCH_PHOTO.h, { fovH: LYNCH_PHOTO.fovH, k: K_STD }).frac;
}

/** Réglage effectif d'une caméra : { fov, lens, aspect } (null si la saisie est invalide). */
export function resolveCamera(c, { focal, law, fov }) {
  if (c.kind === "sensor") { const v = focal > 0 ? fovFromFocalLaw(focal, c.w, law) : null; return v && v < 179 ? { fov: v, lens: law, aspect: c.aspect } : null; }
  if (c.kind === "eq") return focal > 0 ? { fov: fovFromEq(focal, c.aspect), lens: c.lens, aspect: c.aspect } : null;
  if (c.kind === "fov") return fov > 0 && fov < 170 ? { fov, lens: c.lens, aspect: c.aspect } : null;
  return { fov: c.fov, lens: c.lens, aspect: c.aspect };
}

/** Flèche d'un horizon PLAT placé à mi-chemin entre le centre et le bord haut : ce que l'objectif fabrique seul. */
export function lensBend({ fov, lens, aspect }, W) {
  const H = W * aspect, c0 = makeCamera({ W, H, fovH: fov, lens });
  const p = pitchForHorizonAt(c0, 0, H / 4);
  return p == null ? null : sagitta(makeCamera({ W, H, fovH: fov, lens, pitch: p }), 0);
}

export function mountCalc(root, tr, { toSim } = {}) {
  const $ = (id) => root.querySelector(`#${id}`);
  const inCam = $("curvCam"), inF = $("curvF"), labF = $("curvFLab"), inLaw = $("curvLaw"), inFov = $("curvCfov");
  const inPx = $("curvPx"), inThr = $("curvThr"), sum = $("curvCamSum"), btn = $("curvToSim");
  const out = $("curvCalcOut"), tb = $("curvCalcTb");
  const listeners = [];
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); listeners.push([el, ev, fn]); };

  inCam.innerHTML = GROUPS.map((g) => `<optgroup label="${tr(`cam-g-${g}`, g)}">` +
    CAMERAS.filter((c) => c.group === g).map((c) => `<option value="${c.id}">${tr(`cam-${c.id}`, c.id)}</option>`).join("") + "</optgroup>").join("");
  inLaw.innerHTML = LENSES.map((L) => `<option value="${L.k}">${tr(`law-${L.k}`, L.k)}</option>`).join("");
  inCam.value = "ip16p-1x"; inLaw.value = "r35";

  // n'affiche que les champs utiles à la caméra choisie
  function fields(c) {
    root.querySelectorAll(".curv-calc [data-for]").forEach((el) => { el.hidden = !el.dataset.for.split(" ").includes(c.kind || "fixed"); });
    if (c.kind === "sensor") labF.textContent = tr("lab-focal", "Focal length (mm)");
    if (c.kind === "eq") labF.textContent = tr("lab-eq", "35 mm-equivalent focal length (mm)");
    if ((c.kind === "sensor" || c.kind === "eq") && !(+inF.value > 0)) inF.value = 24;
    if (c.kind === "fov" && !(+inFov.value > 0)) inFov.value = 60;
    inPx.value = c.W;
  }

  let cur = null;
  function render() {
    const c = camera(inCam.value);
    const W = Math.max(100, +inPx.value || c.W), thr = Math.max(0.1, +inThr.value || 2);
    cur = resolveCamera(c, { focal: +inF.value, law: inLaw.value, fov: +inFov.value });
    btn.disabled = !cur;
    if (!cur) { sum.textContent = ""; out.textContent = tr("c-bad", "This focal length or field of view is outside what the lens can take."); tb.innerHTML = ""; return; }
    const { fov, lens, aspect } = cur;
    const kindTxt = lens === "gopro7w" ? `${tr("sum-gopro", "GoPro Wide: projection r = tan(kθ)/k, k fitted to GoPro's published fields")} (k = ${num(GOPRO_K, 3)})`
      : c.group === "phone" ? tr("sum-soft", "ordinary lens, corrected in software")
      : c.kind === "sensor" ? tr(`law-${lens}`, lens) : tr("sum-rect", "ordinary lens");
    const aspTxt = aspect === 3 / 4 ? "4:3" : aspect === 9 / 16 ? "16:9" : aspect === 2 / 3 ? "3:2" : `${num(1 / aspect, 2)}:1`;
    sum.innerHTML = `<b>${num(fov, 1)}°</b> ${tr("sum-across", "across")} · ${aspTxt} · ${kindTxt}${c.src ? ref(c.src) : ""}${c.dfov ? ` · ${tr("sum-dfov", "published diagonal field")} ${c.dfov}°` : ""}`;
    const both = (target, unit) => [0, K_STD].map((k) => heightForSagitta(target, { fovH: fov, W, aspect, lens, k, unit }));
    const hs = ([g, r]) => `<span class="g">${r ? fmtH(r) : "—"}</span> ${tr("refr", "refracted")} · ${g ? fmtH(g) : "—"} ${tr("geom", "geometric")}`;
    const lf = lynchFrac();
    const bend = lensBend(cur, W), jet = sagittaAt(LYNCH_PHOTO.h, { fovH: fov, W, aspect, lens, k: K_STD });
    const chk = !bend || Math.abs(bend.px) < 0.5 ? tr("chk-rect", "Lens check: this lens keeps a flat horizon straight anywhere in the frame.")
      : tr("chk-dist", "Lens check: with this lens a perfectly flat horizon placed halfway between the centre and the top edge bends by {px} ({pct}) — {x} times the globe's sag from 35,000 ft with this camera. Only a horizon through the centre can be measured.")
        .replace("{px}", fmtPx(bend.px)).replace("{pct}", fmtPct(bend.frac)).replace("{x}", jet ? num(bend.px / jet.px, 1) : "—");
    out.innerHTML =
      `<div>${tr("c-thr", "Sagitta reaches")} ${num(thr, thr % 1 ? 1 : 0)} px ${tr("c-at", "from")}: ${hs(both(thr, "px"))}</div>` +
      `<div>${tr("c-lynch", "Sagitta reaches the bend of Lynch's photo")} (${fmtPct(lf)}) ${tr("c-at", "from")}: ${hs(both(lf, "frac"))}</div>` +
      `<div>${tr("c-flat", "Plane")}: <span class="f">${tr("c-never", "never — sagitta 0.0 px at every height")}</span></div>` +
      `<div class="chk">${chk}</div>`;
    tb.innerHTML = LYNCH_REPORTS.map((r) => {
      const g = sagittaAt(r.h, { fovH: fov, W, aspect, lens }), q = sagittaAt(r.h, { fovH: fov, W, aspect, lens, k: K_STD });
      const cell = (s) => s ? `${fmtPx(s.px)} (${fmtPct(s.frac)})` : "—";
      return `<tr><td class="num">${fmtH(r.h)}</td><td>${tr(r.k, r.k)}</td><td class="g num">${cell(g)} / ${cell(q)}</td><td class="f num">${fmtPx(0)}</td></tr>`;
    }).join("");
  }
  on(inCam, "change", () => { fields(camera(inCam.value)); render(); });
  for (const el of [inF, inFov, inPx, inThr]) on(el, "input", render);
  on(inLaw, "change", render);
  on(btn, "click", () => { if (cur && toSim) toSim({ fov: cur.fov, lens: cur.lens }); });
  fields(camera(inCam.value));
  render();
  return { dispose() { for (const [el, ev, fn] of listeners) el.removeEventListener(ev, fn); } };
}
