// Figure 8 (2026-11-23, demande du propriétaire) : les caps de la meilleure carte plane. Même descente que springs.js (springFit,
// SMACOF depuis le départ stocké) ; à gauche le maillage des routes, à droite un disque-compas : sur l'anneau extérieur le cap réel
// de chaque route (grand cercle, au premier aéroport : ce que le globe donne sans rien ajuster), sur l'anneau intérieur le cap que
// la carte plane en train de se former lui donne à l'itération courante, un trait reliant les deux (radial = le cap colle). Le nord
// et le sens de la carte ajustée n'existent pas : on garde le calage le plus favorable à la carte FINALE (logic.bearingFit, règle 2).
// Quelques routes notables (les plus fausses à la fin) ont chacune une couleur et leur nom hors du disque.
import { setupCanvas } from "../../core/canvas.js";
import { bearingFit } from "./logic.js";
import { AIRPORTS } from "../../data/presets/avia-flights.js";
import { springFit } from "./springs.js";
import { colors, label, wrapLabel, dot, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

export const NOTABLE_COLORS = ["#7c3aed", "#be185d", "#1d4ed8", "#15803d"];
let cache = null;
/** { calib, notable[{key,a,b,col}], rowsAt(i) -> rows } : calage et exemples tirés de la dernière image, lignes calculées à la demande. */
export function bearingAnim() {
  if (cache) return cache;
  const { stats, best, frames } = springFit();
  const posOf = (X) => Object.fromEntries(best.keys.map((k, i) => [k, X[i]]));
  const fin = bearingFit(stats, AIRPORTS, posOf(frames[frames.length - 1]));
  const calib = { pole: fin.pole, refl: fin.refl };
  const seen = new Set(), notable = [];
  for (const r of [...fin.rows].sort((p, q) => Math.abs(q.diff) - Math.abs(p.diff))) {
    const id = [r.a, r.b].sort().join("-");
    if (seen.has(id)) continue;
    seen.add(id); notable.push({ key: r.key, a: r.a, b: r.b, col: NOTABLE_COLORS[notable.length] });
    if (notable.length === NOTABLE_COLORS.length) break;
  }
  const memo = new Map();
  const rowsAt = (i) => { if (!memo.has(i)) memo.set(i, bearingFit(stats, AIRPORTS, posOf(frames[i]), calib)); return memo.get(i); };
  return (cache = { calib, notable, rowsAt, frames, best, stats });
}

const rad = Math.PI / 180;
export function mountBearings(root, tr) {
  const cv = root.querySelector("#aviaBearings"), btn = root.querySelector("#aviaBearingsPlay");
  const st = { f: 0 };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv);
    const { notable, rowsAt, frames, best } = bearingAnim();
    const fi = Math.min(frames.length - 1, Math.floor(st.f)), X = frames[fi], B = rowsAt(fi);
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W >= 620, top = 34, foot = wide ? 34 : 70;
    const A = wide ? [0, top, W * 0.46, H - top - foot] : [0, top, W, (H - top - foot) * 0.36];
    const D = wide ? [W * 0.46, top, W * 0.54, H - top - foot] : [0, top + A[3], W, (H - top - foot) * 0.64];
    const nOf = (k) => notable.find((q) => q.key === k);
    label(ctx, `${tr("bd-rms", "heading error of the flat map")}: ${num(B.rms, 0)}° rms · ${tr("sp-it", "step")} ${Math.min(frames.length, fi + 1) * 2}`, 8, 12, { col: flat, font: "600 12px system-ui, sans-serif" });
    label(ctx, `${tr("bd-globe", "globe: headings are the great circles, nothing fitted")}`, 8, 28, { col: globe, font: "600 12px system-ui, sans-serif" });
    // A. le maillage (même plan que springs.js), routes notables en couleur
    const keys = best.keys, idx = Object.fromEntries(keys.map((k, i) => [k, i])), fin = frames[frames.length - 1];
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of fin) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const pad = 26, s = Math.min((A[2] - 2 * pad) / (x1 - x0), (A[3] - 2 * pad) / (y1 - y0));
    const ox = A[0] + A[2] / 2 - s * (x0 + x1) / 2, oy = A[1] + A[3] / 2 + s * (y0 + y1) / 2;
    const P = (p) => [ox + s * p[0], oy - s * p[1]];
    ctx.strokeStyle = "#8b8478"; ctx.globalAlpha = 0.22; ctx.lineWidth = 0.8;
    for (const r of B.rows) if (r.a < r.b) { const a = P(X[idx[r.a]]), b = P(X[idx[r.b]]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.globalAlpha = 1;
    keys.forEach((k, i) => { const p = P(X[i]); dot(ctx, p[0], p[1], 2.6, INK); });
    const tags = [];
    for (const n of notable) {
      const a = P(X[idx[n.a]]), b = P(X[idx[n.b]]);
      ctx.strokeStyle = n.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      dot(ctx, a[0], a[1], 4.2, n.col); dot(ctx, b[0], b[1], 3, n.col);
      for (const [q, k] of [[a, n.a], [b, n.b]]) {
        let y = Math.min(q[1] - 7, A[1] + A[3] - 16);
        while (tags.some((t) => Math.abs(t[0] - q[0]) < 26 && Math.abs(t[1] - y) < 11)) y += 11;
        tags.push([q[0], y]);
        label(ctx, k, q[0] + 5, y, { col: n.col, halo: true, font: "700 10px system-ui, sans-serif" });
      }
    }
    if (wide) label(ctx, tr("bd-a", "the airports slide on a plane to fit the flight times (as before)"), A[0] + 8, A[1] + A[3] - 4, { bl: "bottom", col: SOFT, font: "10px system-ui, sans-serif" });
    // B. le disque-compas : anneau extérieur = cap réel, anneau intérieur = cap sur la carte en cours
    const lab = wide ? 92 : 70;
    const R = Math.max(40, Math.min(D[2] / 2 - lab, D[3] / 2 - 18)), cx = D[0] + D[2] / 2, cy = D[1] + D[3] / 2;
    const R1 = R, R0 = R * 0.62;
    const at = (deg, r) => [cx + r * Math.sin(deg * rad), cy - r * Math.cos(deg * rad)];
    ctx.strokeStyle = "#cfc9bc"; ctx.lineWidth = 1;
    for (const r of [R1, R0]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke(); }
    for (let d = 0; d < 360; d += 30) { const p = at(d, R1), q = at(d, R1 + (d % 90 ? 4 : 8)); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    for (const [d, t] of [[0, "N"], [90, "E"], [180, "S"], [270, "W"]]) { const q = at(d, R1 + 17); label(ctx, t, q[0], q[1], { al: "center", col: SOFT, font: "700 11px system-ui, sans-serif" }); }
    const plain = B.rows.filter((r) => !nOf(r.key) && r.a < r.b);
    ctx.lineWidth = 0.8;
    for (const r of plain) { const p = at(r.real, R1), q = at(r.flat, R0); ctx.strokeStyle = "#8b8478"; ctx.globalAlpha = Math.min(0.5, 0.1 + Math.abs(r.diff) / 360); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    ctx.globalAlpha = 1;
    for (const r of plain) { const p = at(r.real, R1), q = at(r.flat, R0); dot(ctx, p[0], p[1], 1.8, globe); dot(ctx, q[0], q[1], 1.8, flat); }
    const notes = [];
    for (const n of notable) {
      const r = B.rows.find((q) => q.key === n.key), p = at(r.real, R1), q = at(r.flat, R0);
      ctx.strokeStyle = n.col; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      dot(ctx, p[0], p[1], 4.4, n.col); ctx.fillStyle = "#fdfdfc"; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 2 * Math.PI); ctx.fill(); ctx.strokeStyle = n.col; ctx.lineWidth = 2; ctx.stroke();
      notes.push({ n, r, ang: r.real });
    }
    // noms des routes notables à l'extérieur du disque, à l'angle du cap réel, écartés d'au moins 22° les uns des autres
    notes.sort((p, q) => p.ang - q.ang);
    for (let i = 1; i < notes.length; i++) if (notes[i].ang - notes[i - 1].ang < 22) notes[i].ang = notes[i - 1].ang + 22;
    for (const { n, r, ang } of notes) {
      const near = [0, 90, 180, 270, 360].some((c) => Math.abs(ang - c) < 11), e = at(ang, R1 + (near ? 50 : 30)), right = Math.sin(ang * rad) >= 0;
      ctx.strokeStyle = n.col; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; const j = at(r.real, R1 + 8), k = at(ang, R1 + (near ? 46 : 26)); ctx.beginPath(); ctx.moveTo(j[0], j[1]); ctx.lineTo(k[0], k[1]); ctx.stroke(); ctx.globalAlpha = 1;
      label(ctx, `${n.a}→${n.b}`, e[0] + (right ? 2 : -2), e[1] - 6, { al: right ? "left" : "right", col: n.col, font: "700 11px system-ui, sans-serif", halo: true });
      label(ctx, `${num(r.real, 0)}° → ${num(r.flat, 0)}°`, e[0] + (right ? 2 : -2), e[1] + 6, { al: right ? "left" : "right", col: n.col, font: "10px ui-monospace, monospace", halo: true });
    }
    label(ctx, `● ${tr("bd-real", "real heading")}`, cx, cy - 8, { al: "center", col: globe, font: "600 10px system-ui, sans-serif" });
    label(ctx, `○ ${tr("bd-plane", "heading on the map")}`, cx, cy + 8, { al: "center", col: flat, font: "600 10px system-ui, sans-serif" });
    wrapLabel(ctx, tr("bd-key", "outer ring: the great circle's heading at the first airport · inner ring: the heading the map gives it now · a radial line = the heading agrees · colours: the routes the final map gets most wrong"), 8, H - 6, W - 16, { col: SOFT, bl: "bottom", font: "10px system-ui, sans-serif", lh: 12 });
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { const N = bearingAnim().frames.length; st.f += n * 0.5; if (st.f > N + 90) st.f = 0; }, draw,
    anim: { duration: () => (bearingAnim().frames.length + 60) / 0.5 / 60, state: st, reset: () => { st.f = 0; } },
  });
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
