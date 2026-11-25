// Distorsions (epic13, rapatrié de star §4) : la même scène, le même
// objectif, trois cadrages -- horizon près du haut, par le centre, près du
// bas -- comme les photos de Lynch (2008, fig. 3). La grille est une feuille
// tenue d'équerre devant l'objectif : des droites. L'horizon est placé par
// le calcul (logic.js : pitchForHorizonAt), pas à l'œil.
import { pitchForHorizonAt } from "./logic.js";
import { paintFrame } from "./frame.js";
import { fillLensSelect, fovCap } from "./sim.js";
import { fmtPx, fmtPct } from "./fmt.js";

/** Place du milieu de l'horizon dans l'image, en fraction de la demi-hauteur (vers le haut). */
export const TRI_POS = [0.62, 0, -0.62];

export function mountTri(root, tr) {
  const $ = (id) => root.querySelector(`#${id}`);
  const cvs = [0, 1, 2].map((i) => $(`curvTri${i}`)), outs = [0, 1, 2].map((i) => $(`curvTriR${i}`));
  const inLens = $("curvTriLens"), inF = $("curvTriFov"), outF = $("curvTriFovv"), inH = $("curvTriH"), inG = $("curvTriGrid");
  const st = { lens: "r14", fov: 100, h: 2, grid: true };
  const listeners = [];
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); listeners.push([el, ev, fn]); };
  let raf = 0;
  fillLensSelect(inLens, tr, st.lens);
  const sync = () => {
    inF.max = fovCap(st.lens); if (st.fov > +inF.max) st.fov = +inF.max;
    inF.value = st.fov; outF.textContent = `${st.fov}°`; inH.value = String(st.h); inG.checked = st.grid;
  };
  const upd = () => { sync(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  on(inLens, "change", () => { st.lens = inLens.value; upd(); });
  on(inF, "input", () => { st.fov = +inF.value; upd(); });
  on(inH, "change", () => { st.h = +inH.value; upd(); });
  on(inG, "change", () => { st.grid = inG.checked; upd(); });

  function draw() {
    cvs.forEach((cv, i) => {
      const f = paintFrame(cv, { h: st.h, fov: st.fov, lens: st.lens, grid: st.grid, chord: false,
        pitchOf: (cam0, dR) => pitchForHorizonAt(cam0, dR, TRI_POS[i] * cam0.H / 2),
        labels: [] });
      if (!f) return;
      const p = f.ref(0), g = f.ref(f.dR);
      const val = (s) => s ? `${fmtPx(s.px)} (${fmtPct(s.frac)})` : "—";
      outs[i].innerHTML = `<span class="f">${tr("t-plane", "plane")} ${val(p)}</span><br><span class="g">${tr("t-globe", "globe")} ${val(g)}</span>`;
    });
  }
  sync();
  return { draw, stop() { cancelAnimationFrame(raf); },
    dispose() { for (const [el, ev, fn] of listeners) el.removeEventListener(ev, fn); } };
}
