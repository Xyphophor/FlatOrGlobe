// Onglet orb : le canon de Newton à 400 km, en détail (2026-11-11, demande du propriétaire ; il s'AJOUTE à
// orbAnimFall, il ne le remplace pas). Huit tirs horizontaux, chacun réglé pour une portée au sol (0 m, 100 m,
// 100 km … 15 000 km), puis la vitesse circulaire : le boulet ne retombe plus. La vue principale suit le boulet,
// verticale locale en haut ; le petit cadre montre la Terre entière. Les deux vues sont à l'échelle vraie (règle 1).
// Les trajectoires viennent de cannon-logic.js (GM/r² seul : ni air ni rotation de la Terre, imprimé sur l'image).
import { anim2d, text, disc, arrow } from "../../core/anim2d.js";
import { FIG } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { shots, R_EARTH as R, R0, H_CANNON, GM, vCirc, vMiss, period, flatRange } from "./cannon-logic.js";

const TAU = 2 * Math.PI;
const K = { ink: "#e6ecf7", soft: "#9fb0cc", faint: "#5b6b8c", ball: "#fde68a", trail: "#fbbf24", old: "#fb923c", v: "#5eead4", g: "#f87171", sea: "#0c2f55", limb: "#60a5fa", warn: "#fbbf24", tower: "#cbd5e1" };
const clamp = (x) => Math.max(0, Math.min(1, x));
// quelques étoiles de décor, tirées une fois (générateur congruentiel : la même image à chaque rendu)
const STARS = (() => { let s = 20261111; const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; return Array.from({ length: 110 }, () => [r() * TAU, 0.08 + r() * 0.95, 0.4 + r() * 1.1]); })();

export const fmtDur = (s) => { s = Math.round(s); const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min` : `${m} min ${String(s % 60).padStart(2, "0")} s`; };

export function mountCannon(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const dist = (m) => (m < 1000 ? `${nf(m)} m` : `${nf(m / 1000)} km`);
  const S = shots(), DUR = S.map((s) => (s.orbit ? 10.8 : 4.6)), span = DUR.reduce((a, b) => a + b, 0);
  const at = (sh, k) => { const x = k * (sh.pts.length - 1), i = Math.min(sh.pts.length - 2, Math.floor(x)), f = x - i, a = sh.pts[i], b = sh.pts[i + 1], L = (p, q) => p + (q - p) * f;
    return { t: L(a.t, b.t), x: L(a.x, b.x), y: L(a.y, b.y), vx: L(a.vx, b.vx), vy: L(a.vy, b.vy) }; };
  return anim2d(canvas, { span, u0: 0.42, draw(ctx, W, H, u) {
    ctx.fillStyle = "#05070f"; ctx.fillRect(0, 0, W, H);
    let tt = u * span, i = 0; while (i < S.length - 1 && tt >= DUR[i]) { tt -= DUR[i]; i++; }
    const sh = S[i], f = tt / DUR[i], a0 = sh.orbit ? 0.05 : 0.1, a1 = sh.orbit ? 0.97 : 0.8, k = clamp((f - a0) / (a1 - a0)), done = f >= a1, P = at(sh, k);
    const narrow = W < 620, n1 = text(ctx, tr("can-title", "Newton's cannon, 400 km up: fired harder each time"), 10, 17, { c: K.ink, size: 12, bold: true, maxW: W - 20 });
    const n2 = text(ctx, tr("can-st", "true scale in both views · no air · the Earth's rotation left out"), 10, 17 + n1 * 16, { c: K.warn, size: 10, maxW: W - 20 });
    const top = 14 + n1 * 16 + n2 * 13, bot = narrow ? 104 : 66, vh = H - top - bot;
    const cx = narrow ? W * 0.56 : W * 0.57, cy = top + vh * 0.36, s = vh * 0.58 / (H_CANNON * 1.25);       // px par mètre
    const r = Math.hypot(P.x, P.y), up = [P.x / r, P.y / r], rt = [up[1], -up[0]], phi = Math.atan2(P.x, P.y);
    const M = (x, y) => { const dx = x - P.x, dy = y - P.y; return [cx + s * (dx * rt[0] + dy * rt[1]), cy - s * (dx * up[0] + dy * up[1])]; };
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, vh); ctx.clip();
    // étoiles : fixes dans l'espace, donc elles tournent quand la caméra suit le boulet autour de la Terre
    const big = Math.hypot(W, vh);
    for (const [a, rho, sz] of STARS) { const x = cx + big * rho * Math.cos(a + phi), y = cy + big * rho * Math.sin(a + phi); if (x > 0 && x < W && y > top && y < top + vh) { ctx.globalAlpha = 0.25 + 0.3 * sz / 1.5; ctx.fillStyle = "#cfe0ff"; ctx.fillRect(x, y, sz, sz); } }
    ctx.globalAlpha = 1;
    // la Terre, son air (100 km dessinés, non simulés), le sol gradué en distance depuis le pied du canon
    const C = M(0, 0), Rpx = R * s;
    ctx.strokeStyle = K.limb; ctx.globalAlpha = 0.16; ctx.lineWidth = 100e3 * s; ctx.beginPath(); ctx.arc(C[0], C[1], Rpx + 50e3 * s, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = K.sea; ctx.beginPath(); ctx.arc(C[0], C[1], Rpx, 0, TAU); ctx.fill();
    ctx.strokeStyle = K.limb; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(C[0], C[1], Rpx, 0, TAU); ctx.stroke();
    const halfKm = (W / s) / 1e3 * 0.75, here = phi < 0 ? (phi + TAU) * R / 1e3 : phi * R / 1e3, labEvery = 500e3 * s > 64 ? 500 : 1000;
    for (let d = Math.max(0, Math.ceil((here - halfKm) / 100) * 100); d <= here + halfKm && d < TAU * R / 1e3; d += 100) {
      const a = d * 1e3 / R, q1 = M(R * Math.sin(a), R * Math.cos(a)), q2 = M((R - 9 / s) * Math.sin(a), (R - 9 / s) * Math.cos(a)), major = d % labEvery === 0;
      ctx.strokeStyle = "#9cc4ff"; ctx.globalAlpha = major ? 0.9 : 0.4; ctx.lineWidth = major ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke();
      if (major) { const q3 = M((R - 22 / s) * Math.sin(a), (R - 22 / s) * Math.cos(a)); ctx.globalAlpha = 0.9; text(ctx, d ? `${nf(d)} km` : "0", q3[0], q3[1] + 4, { c: "#b9d4ff", size: 10, align: "center" }); }
    }
    ctx.globalAlpha = 1;
    // la tour et le canon
    const t0 = M(0, R), t1 = M(0, R0), near = (q) => q[0] > -2 * W && q[0] < 3 * W && q[1] > -2 * H && q[1] < 3 * H;   // rien n'est tracé très loin hors du cadre
    if (near(t0) || near(t1)) {
    ctx.strokeStyle = K.tower; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(t0[0], t0[1]); ctx.lineTo(t1[0], t1[1]); ctx.stroke(); ctx.globalAlpha = 1;
    { const e = M(16 / s, R0); ctx.strokeStyle = K.tower; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(t1[0], t1[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); }
    if (t1[0] > -40 && t1[0] < W + 40) text(ctx, tr("can-cannon", "cannon, 400 km"), t1[0] - 8, t1[1] - 8, { c: K.tower, size: 10, align: "right" });
    }
    // sans pesanteur : la droite du tir
    if (sh.v > 0 && k > 0) { const e = M(sh.v * P.t, R0), b0 = near(t1) ? t1 : M(sh.v * P.t - 2.5 * W / s, R0); if (near(e)) { ctx.setLineDash([5, 5]); ctx.strokeStyle = K.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b0[0], b0[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.setLineDash([]); }
      if (e[0] > 60 && e[0] < W - 10 && e[1] > top + 12) text(ctx, tr("can-straight", "without gravity"), e[0] - 6, e[1] - 6, { c: K.soft, size: 10, align: "right" }); }
    // la trajectoire parcourue
    ctx.strokeStyle = K.trail; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
    const last = Math.floor(k * (sh.pts.length - 1));
    let pen = false;
    for (let j = 0; j <= last; j++) { const q = M(sh.pts[j].x, sh.pts[j].y); if (!near(q)) { pen = false; continue; } if (pen) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); pen = true; } }
    if (pen) ctx.lineTo(cx, cy); ctx.stroke();
    // hauteur au-dessus du sol
    const gq = M(R * up[0], R * up[1]), hKm = (r - R) / 1e3;
    if (hKm > 12) { ctx.setLineDash([2, 4]); ctx.strokeStyle = K.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.lineTo(gq[0], gq[1]); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, `${nf(hKm)} km`, cx + 6, (cy + gq[1]) / 2 + 4, { c: K.soft, size: 10.5 }); }
    // vitesse et pesanteur
    const v = Math.hypot(P.vx, P.vy), g = GM / (r * r);
    if (!done || sh.orbit) {
      if (v > 0.5) { const L = 16 + 62 * v / 8000, ex = (P.vx * rt[0] + P.vy * rt[1]) / v, ey = (P.vx * up[0] + P.vy * up[1]) / v; arrow(ctx, cx, cy, cx + L * ex, cy - L * ey, K.v, 2, 7); text(ctx, "v", cx + L * ex + 5, cy - L * ey + 4, { c: K.v, size: 11, bold: true }); }
      const Lg = 36 * g / 9.82; arrow(ctx, cx, cy, cx, cy + Lg, K.g, 2, 7); text(ctx, "g", cx - 12, cy + Lg + 2, { c: K.g, size: 11, bold: true });
    }
    if (done && !sh.orbit) { const b = clamp((f - a1) / 0.08); ctx.strokeStyle = K.old; ctx.globalAlpha = 1 - 0.6 * b; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 6 + 18 * b, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    disc(ctx, cx, cy, 9, "rgba(253,230,138,0.22)"); disc(ctx, cx, cy, 4.2, K.ball, "#ffffff", 1);
    ctx.restore();
    // le petit cadre : la Terre entière, les tirs précédents, le tir en cours
    const bs = Math.round(Math.max(104, Math.min(W * 0.3, vh * 0.52, 230))), bx = 8, by = top + 6, Ri = bs * 0.36, ix = bx + bs / 2, iy = by + bs / 2 + 7, si = Ri / R, I = (x, y) => [ix + x * si, iy - y * si];
    ctx.fillStyle = "rgba(5,7,15,0.88)"; ctx.fillRect(bx, by, bs, bs); ctx.strokeStyle = "#33456f"; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bs - 1, bs - 1);
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bs, bs); ctx.clip();
    disc(ctx, ix, iy, Ri, K.sea, K.limb, 1.2);
    const path = (pts, n, col, w, a, dash) => { ctx.beginPath(); for (let j = 0; j <= n; j++) { const q = I(pts[j].x, pts[j].y); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.globalAlpha = a; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; };
    for (let j = 0; j < i; j++) path(S[j].pts, S[j].pts.length - 1, K.old, 1, 0.75);
    path(sh.pts, sh.pts.length - 1, K.trail, 1, 0.45, [2, 3]); path(sh.pts, last, K.trail, 1.8, 1);
    { const a = I(0, R), b = I(0, R0); ctx.strokeStyle = K.tower; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    { const q = I(P.x, P.y); disc(ctx, q[0], q[1], 2.8, K.ball, "#ffffff", 0.8); }
    ctx.restore();
    text(ctx, tr("can-inset", "whole Earth"), bx + 6, by + 13, { c: K.soft, size: 9.5 });
    // lectures
    const y0 = H - bot + 17, lh = 15;
    text(ctx, `${tr("can-shot", "Shot {i} of {n}").replace("{i}", i + 1).replace("{n}", S.length)} · ${sh.orbit ? tr("can-orbit", "orbit") : tr("can-range", "range {s}").replace("{s}", dist(sh.range))}`, 10, y0, { c: K.ink, size: 13, bold: true });
    const fl = DUR[i] * (a1 - a0);
    const l2 = text(ctx, tr("can-launch", "fired at {v} m/s ({k} km/h) · {T} of flight · shown {x} times faster").replace("{v}", nf(sh.v, sh.v < 10 ? 2 : 0)).replace("{k}", nf(sh.v * 3.6, sh.v < 10 ? 1 : 0)).replace("{T}", fmtDur(sh.tFlight)).replace("{x}", nf(sh.tFlight / fl)), 10, y0 + lh, { c: K.soft, size: 11, maxW: W - 20 });
    const live = done ? (sh.orbit ? tr("can-never", "never lands: the ground curves away as fast as the ball falls · one turn in {T} min").replace("{T}", nf(sh.tFlight / 60, 1))
      : tr("can-land", "lands {s} from the foot of the cannon · at {v} km/s").replace("{s}", dist(sh.range)).replace("{v}", nf(sh.vImpact / 1000, 2)))
      : tr("can-live", "t = {t} · altitude {h} km · speed {v} km/s · {d} along the ground").replace("{t}", fmtDur(P.t)).replace("{h}", nf(hKm)).replace("{v}", nf(v / 1000, 2)).replace("{d}", dist(Math.max(0, phi < 0 ? phi + TAU : phi) * R));
    text(ctx, live, 10, y0 + lh * (1 + l2), { c: done ? (sh.orbit ? K.v : K.old) : K.ball, size: 11, maxW: W - 20 });
  } });
}

/** Schéma de la formule : le boulet part de l'apogée d'une ellipse ; il touche le sol à l'angle θ. */
function figCan(tr) {
  const C = FIG.C, f = FIG.make({ w: 380, h: 240, alt: tr("fx-can-alt", "The Earth, a cannon at distance r zero from its centre firing sideways, and the ball's path, an ellipse whose farthest point is the cannon. The path meets the ground at the angle theta from the cannon, seen from the Earth's centre; the range is the arc R times theta.") });
  const cx = 170, cy = 150, Rr = 84, r0 = 108, th = 62 * Math.PI / 180;
  f.circle(cx, cy, Rr, { c: C.sea, w: 1.6 });
  f.line(cx, cy, cx, cy - r0, { c: C.soft, w: 1.2 }); f.dot(cx, cy, { r: 3 }); f.dot(cx, cy - r0, { r: 4, c: C.ink });
  const ix = cx + Rr * Math.sin(th), iy = cy - Rr * Math.cos(th);
  f.line(cx, cy, ix, iy, { c: C.soft, w: 1.2 });
  f.path(`M${cx} ${cy - r0} Q${cx + 62} ${cy - r0} ${ix} ${iy}`, { c: C.globe, w: 2 });
  f.arrow(cx, cy - r0, cx + 46, cy - r0, { c: C.globe, w: 1.4 }); f.note(cx + 50, cy - r0 - 5, "v", { c: C.globe, size: 12 });
  f.angle(cx, cy, 26, 90 - 62, 90, { label: "θ", tex: "\\theta", c: C.ink });
  f.note(cx - 8, cy - r0 / 2 - 8, "r₀", { anchor: "end", size: 12 }); f.note(cx + Rr * 0.5 * Math.sin(th) + 8, cy - Rr * 0.5 * Math.cos(th) + 12, "R", { size: 12 });
  f.path(`M${cx} ${cy - Rr} A${Rr} ${Rr} 0 0 1 ${ix} ${iy}`, { c: C.flat, w: 3.2 });
  f.note(ix + 8, iy - 22, tr("fx-can-s", "range s = R θ"), { c: C.flat, size: 10.5 });
  f.note(cx - 12, cy - r0 - 8, tr("fx-can-apo", "cannon = farthest point of the ellipse"), { anchor: "middle", size: 9.5 });
  f.note(8, 232, tr("fx-can-n", "faster: θ grows · past half a turn the ball misses the ground"), { size: 9.5, c: C.soft });
  stamp(f, tr, tr("fx-can-st", "height of the cannon enlarged"));
  return f;
}
export function drawCannonFig(root, tr) { return drawAll(root, { orbFxCan: figCan }, tr, {}, "orb"); }

/** Tableau : portée, vitesse de tir, durée, vitesse à l'impact, et le même tir sur un plan à pesanteur uniforme. */
export function fillCannonTable(root, tr, lang = "en") {
  const tb = root.querySelector("#orbTabCannon"); if (!tb) return;
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }), dist = (m) => (m < 1000 ? `${nf(m)} m` : `${nf(m / 1000)} km`);
  const head = [tr("can-th-range", "Range on the globe"), tr("can-th-v", "Launch speed"), tr("can-th-t", "Flight"), tr("can-th-vi", "Speed at impact"), tr("can-th-flat", "Same shot over a plane, uniform g")];
  const row = (label, v, T, vi, cls = "") => `<tr${cls}><td>${label}</td><td class="num">${nf(v, v < 10 ? 2 : 0)} m/s</td><td class="num">${T}</td><td class="num">${vi}</td><td class="num f">${tr("can-td-flat", "lands at {s}").replace("{s}", dist(flatRange(v)))}</td></tr>`;
  const S = shots(), vm = vMiss();
  tb.innerHTML = `<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
    S.filter((s) => !s.orbit).map((s) => row(dist(s.range), s.v, fmtDur(s.tFlight), `${nf(s.vImpact / 1000, 2)} km/s`)).join("") +
    row(tr("can-td-miss", "first shot that misses the ground (grazes it half a turn away)"), vm, "—", "—") +
    row(`<b>${tr("can-td-orbit", "circular orbit: never lands")}</b>`, vCirc(), tr("can-td-turn", "{T} min a turn").replace("{T}", nf(period() / 60, 1)), "—", ' class="g"') + `</tbody>`;
}
