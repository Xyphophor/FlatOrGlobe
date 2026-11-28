// Les cinq méthodes appliquées à un plan et à une sphère (2026-11-27, propriétaire : « on prend des mesures planes et on
// essaie bêtement de calculer un rayon ; on commence avec une ou deux mesures qui ne se contredisent pas toujours, puis on
// multiplie les relevés et la corrélation s'effondre »). Une animation par méthode, la même mise en page : en haut ce que
// l'observateur mesure (schéma, plan à gauche, sphère à droite, le relevé courant) ; en bas les relevés y contre x, la
// droite par l'origine de chaque surface et ce qu'elle dit du rayon. Les relevés viennent de logic.js (survey, fitRadius) :
// même géométrie et même bruit sur les deux surfaces, graine fixe.
import { anim2d, text, disc, arrow, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER } from "../../core/anim2d.js";
import { METHODS, survey, fitRadius, fitSeries, singleRadius, countAt, ARCMIN, ARCSEC, DEG, FLAT_SUN_H } from "./logic.js";
import { tag, nfmt, clamp } from "./anims.js";

export const METHOD_SPAN = 30;
const TITLES = { dip: "The dip of the horizon: one radius from every height?", zenith: "Reciprocal zenith angles: one radius from every line?",
  triangle: "Angle sums of triangles: one radius from every size?", circle: "Circles round a post: one radius from every size?",
  erat: "Eratosthenes' shadows, flat Sun 5,000 km up: one radius everywhere?",
  travel: "Speed × time over angle (earthquakes, airliners): one radius for every route?" };

/** Comment chaque méthode s'affiche : y en unité lisible, l'axe des x avec ses graduations en grandeur lue. */
const VIEW = {
  dip: { yk: 1 / ARCMIN, yu: "′", ticks: [[0.1, "100 m"], [1, "1 km"], [4, "4 km"], [12, "12 km"]], xOf: (h) => Math.sqrt(2 * h) },
  zenith: { yk: 1 / ARCMIN, yu: "′", ticks: [[20, "20 km"], [60, "60 km"], [100, "100 km"]], xOf: (d) => d },
  triangle: { yk: 1 / ARCSEC, yu: "″", ticks: [[5000, "5,000 km²"], [10000, "10,000"], [15000, "15,000"]], xOf: (A) => A },
  circle: { yk: 1000, yu: " m", ticks: [[100, "r = 100 km"], [200, "200"], [300, "300"]], xOf: (r) => (Math.PI * r ** 3) / 3 },
  erat: { yk: 1 / DEG, yu: "°", ticks: [[500, "500 km"], [1000, "1,000"], [1500, "1,500"]], xOf: (d) => d },
  travel: { yk: 1, yu: "", ticks: [[30, "30°"], [60, "60°"], [90, "90°"], [120, "120°"]], xOf: (a) => a * DEG },
};
const AX = { dip: ["an-me-x-dip", "eye height h (axis: √2h)"], zenith: ["an-me-x-zen", "length of the line d"], triangle: ["an-me-x-tri", "area of the triangle A"], circle: ["an-me-x-cir", "radius walked r (axis: πr³/3)"], erat: ["an-me-x-era", "distance between the sticks d"], travel: ["an-me-x-trv", "angle θ from the two places' latitudes and longitudes"] };
const AY = { dip: ["an-me-y-dip", "dip δ"], zenith: ["an-me-y-zen", "z_A + z_B − 180°"], triangle: ["an-me-y-tri", "α₁ + α₂ + α₃ − 180°"], circle: ["an-me-y-cir", "2πr − C"], erat: ["an-me-y-era", "difference of shadow angles Δz"], travel: ["an-me-y-trv", "distance travelled v × t (km)"] };

/** Un rayon lisible : km, millions de km, ou « aucun ». */
export function fmtR(R, tr, nf) {
  if (R == null) return tr("an-me-noR", "none (slope below zero)");
  if (!isFinite(R)) return "∞";
  if (R >= 1e6) return `${nf(R / 1e6, R >= 1e7 ? 0 : 1)} ${tr("an-me-mkm", "million km")}`;
  return `${nf(R, 0)} km`;
}

/* ---- les schémas (pas à l'échelle) ---------------------------------------------------------------------------------- */
const GROUND = "#7a6a4f";
function sceneFrame(ctx, r, plane, tr, size) {
  ctx.fillStyle = plane ? "#fbf6ee" : "#f1f5fd"; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
}
/** Le sol : droite (plan) ou arc de cercle (sphère, rayon ρ en pixels, sommet en (cx, top)). */
function ground(ctx, r, plane, cx, gy, rho) {
  ctx.strokeStyle = GROUND; ctx.lineWidth = 2.2; ctx.beginPath();
  if (plane) { ctx.moveTo(r.x + 6, gy); ctx.lineTo(r.x + r.w - 6, gy); }
  else { const as = (x) => Math.asin(clamp((x - cx) / rho, -1, 1)); ctx.arc(cx, gy + rho, rho, -Math.PI / 2 + as(r.x + 2), -Math.PI / 2 + as(r.x + r.w - 2)); }
  ctx.stroke();
}
const SCENES = {
  dip(ctx, r, plane, raw, tr, nf, size) {
    const cx = r.x + r.w * 0.25, gy = r.y + r.h * 0.66, rho = r.w * 1.2, th = r.h * 0.32, ey = gy - th;
    ground(ctx, r, plane, cx, gy, rho);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, ey); ctx.stroke(); disc(ctx, cx, ey, 3.5, INK);
    ctx.strokeStyle = "rgba(202,138,4,.9)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, ey); ctx.lineTo(r.x + r.w - 8, ey); ctx.stroke(); ctx.setLineDash([]);
    if (plane) {
      ctx.strokeStyle = FLAT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx, ey); ctx.lineTo(r.x + r.w - 8, ey + 2); ctx.stroke();
    } else {
      // la tangente au cercle depuis l'œil
      const oy = gy + rho, d = oy - ey, a = Math.acos(rho / d), tx = cx + rho * Math.sin(a), ty = oy - rho * Math.cos(a);
      ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx, ey); ctx.lineTo(tx + (tx - cx) * 0.4, ty + (ty - ey) * 0.4); ctx.stroke();
      disc(ctx, tx, ty, 3, GLOBE);
      ctx.beginPath(); ctx.arc(cx, ey, 28, 0, Math.atan2(ty - ey, tx - cx)); ctx.stroke();
    }
    text(ctx, `h = ${raw.h < 1 ? nf(raw.h * 1000, 0) + " m" : nf(raw.h, 1) + " km"}`, cx + 6, (gy + ey) / 2 + 4, { size: size * 0.9, c: SOFT });
    tag(ctx, `δ = ${nf(raw.dip / ARCMIN, 1)}′`, r.x + r.w - 8, r.y + r.h - 6, { size, c: plane ? FLAT : GLOBE, align: "right" });
  },
  zenith(ctx, r, plane, raw, tr, nf, size) {
    const gy = r.y + r.h * 0.72, ax = r.x + r.w * 0.22, bx = r.x + r.w * 0.78, rho = r.w * 0.75, cx = (ax + bx) / 2, tw = r.h * 0.3;
    ground(ctx, r, plane, cx, gy, rho);
    const foot = (x) => (plane ? [x, gy, 0] : (() => { const a = Math.asin((x - cx) / rho); return [cx + rho * Math.sin(a), gy + rho - rho * Math.cos(a), a]; })());
    const A = foot(ax), B = foot(bx), up = (p) => [p[0] + tw * Math.sin(p[2]), p[1] - tw * Math.cos(p[2])];
    const At = up(A), Bt = up(B);
    for (const [p, q] of [[A, At], [B, Bt]]) { ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); disc(ctx, q[0], q[1], 3, INK); }
    // les verticales prolongées : parallèles sur le plan, qui se rejoignent au centre sur la sphère
    ctx.strokeStyle = "rgba(91,100,112,.6)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    for (const [p, q] of [[A, At], [B, Bt]]) { ctx.beginPath(); ctx.moveTo(q[0], q[1] - 0); ctx.lineTo(q[0] + (q[0] - p[0]) * 0.6, q[1] + (q[1] - p[1]) * 0.6); ctx.stroke(); }
    if (!plane) for (const p of [A, B]) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + (cx - p[0]) * 0.25, p[1] + (gy + rho - p[1]) * 0.25); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.strokeStyle = plane ? FLAT : GLOBE; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(At[0], At[1]); ctx.lineTo(Bt[0], Bt[1]); ctx.stroke();
    text(ctx, `d = ${nf(raw.d, 0)} km`, cx, gy + 15, { size: size * 0.9, c: SOFT, align: "center" });
    tag(ctx, `z_A + z_B = ${nf(raw.sum, 4)}°`, r.x + r.w - 8, r.y + r.h - 6, { size, c: plane ? FLAT : GLOBE, align: "right" });
  },
  triangle(ctx, r, plane, raw, tr, nf, size) {
    const cx = r.x + r.w / 2, cy = r.y + r.h * 0.58, s = Math.min(r.w * 0.3, r.h * 0.34);
    const P = [[cx, cy - s], [cx - s * 1.1, cy + s * 0.6], [cx + s * 1.1, cy + s * 0.6]];
    ctx.fillStyle = plane ? "rgba(180,83,9,.1)" : "rgba(29,78,216,.1)"; ctx.strokeStyle = plane ? FLAT : GLOBE; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = P[i], b = P[(i + 1) % 3];
      if (!i) ctx.moveTo(a[0], a[1]);
      if (plane) ctx.lineTo(b[0], b[1]);
      else { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ox = (mx - cx) * 0.22, oy = (my - (cy + s * 0.07)) * 0.22; ctx.quadraticCurveTo(mx + ox, my + oy, b[0], b[1]); }
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (!plane) { ctx.strokeStyle = "rgba(29,78,216,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, s * 1.55, 0, 2 * Math.PI); ctx.stroke(); }
    for (const p of P) disc(ctx, p[0], p[1], 3, INK);
    text(ctx, `A = ${nf(raw.A, 0)} km²`, cx, cy + s * 0.25, { size: size * 0.9, c: SOFT, align: "center" });
    tag(ctx, `α₁ + α₂ + α₃ = 180° ${raw.sum >= 180 ? "+" : "−"} ${nf(Math.abs(raw.sum - 180) * 3600, 2)}″`, r.x + r.w - 8, r.y + r.h - 6, { size, c: plane ? FLAT : GLOBE, align: "right", maxW: r.w - 16 });
  },
  circle(ctx, r, plane, raw, tr, nf, size) {
    const cx = r.x + r.w / 2, cy = r.y + r.h * 0.56, rx = Math.min(r.w * 0.36, r.h * 0.9), ry = rx * 0.32;
    if (!plane) { ctx.fillStyle = "rgba(29,78,216,.08)"; ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.2, rx * 1.15, rx * 0.55, 0, Math.PI, 2 * Math.PI); ctx.fill(); }
    ctx.strokeStyle = plane ? FLAT : GLOBE; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); ctx.stroke();
    const py = plane ? cy : cy - rx * 0.42;
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx, py - 14); ctx.stroke(); disc(ctx, cx, py, 2.5, INK);
    ctx.strokeStyle = SOFT; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, py);
    if (plane) ctx.lineTo(cx + rx, cy); else ctx.quadraticCurveTo(cx + rx * 0.6, py - rx * 0.05, cx + rx, cy);
    ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `r = ${nf(raw.r, 0)} km`, cx + rx * 0.45, (py + cy) / 2 - 6, { size: size * 0.9, c: SOFT, align: "center" });
    const def = (2 * Math.PI * raw.r - raw.C) * 1000;
    tag(ctx, `C = 2πr ${def >= 0 ? "−" : "+"} ${nf(Math.abs(def), 0)} m`, r.x + r.w - 8, r.y + r.h - 6, { size, c: plane ? FLAT : GLOBE, align: "right" });
  },
  erat(ctx, r, plane, raw, tr, nf, size) {
    const gy = r.y + r.h * 0.8, ax = r.x + r.w * (plane ? 0.36 : 0.3), bx = r.x + r.w * (plane ? 0.68 : 0.7), rho = r.w * 0.75, cx = r.x + r.w * (plane ? 0.2 : 0.5), st = r.h * 0.2;
    ground(ctx, r, plane, cx, gy, rho);
    const foot = (x) => (plane ? [x, gy, 0] : (() => { const a = Math.asin((x - cx) / rho); return [cx + rho * Math.sin(a), gy + rho - rho * Math.cos(a), a]; })());
    const sun = plane ? [cx, r.y + 22] : null;
    if (plane) disc(ctx, sun[0], sun[1], 7, "#fde68a", "#f59e0b", 1.2);
    for (const x of [ax, bx]) {
      const p = foot(x), q = [p[0] + st * Math.sin(p[2]), p[1] - st * Math.cos(p[2])];
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      // le rayon qui frôle le haut du bâton
      ctx.strokeStyle = "rgba(217,119,6,.85)"; ctx.lineWidth = 1.2; ctx.beginPath();
      if (plane) { ctx.moveTo(sun[0], sun[1]); const k = (gy - sun[1]) / (q[1] - sun[1]); ctx.lineTo(sun[0] + (q[0] - sun[0]) * k, gy); }
      else { const t = gy + 6 - q[1]; ctx.moveTo(q[0] - 0.35 * 50, q[1] - 50); ctx.lineTo(q[0] + 0.35 * t, q[1] + t); }   // rayons parallèles, direction (0,35 ; 1)
      ctx.stroke();
    }
    if (!plane) for (let i = 0; i < 3; i++) arrow(ctx, r.x + r.w * (0.1 + 0.3 * i), r.y + 14, r.x + r.w * (0.1 + 0.3 * i) + 9, r.y + 40, "rgba(217,119,6,.6)", 1.2, 6);
    text(ctx, `d = ${nf(raw.d, 0)} km`, (ax + bx) / 2, gy + 15, { size: size * 0.9, c: SOFT, align: "center" });
    if (plane) text(ctx, `H = ${nf(FLAT_SUN_H, 0)} km`, sun[0] + 12, sun[1] + 4, { size: size * 0.9, c: SOFT });
    tag(ctx, `Δz = ${nf(raw.z2 - raw.z1, 2)}°`, r.x + r.w - 8, r.y + size + 3, { size, c: plane ? FLAT : GLOBE, align: "right" });   // en haut : le bas porte d
  },
};

/* la méthode vitesse × temps : la carte azimutale du pôle (plan) et le globe, le trajet courant */
SCENES.travel = function (ctx, r, plane, raw, tr, nf, size) {
  const cx = r.x + r.w / 2, cy = r.y + r.h * 0.56, rad = Math.min(r.w * 0.36, r.h * 0.4), col = plane ? FLAT : GLOBE;
  const [f1, l1] = raw.p1, [f2, l2] = raw.p2;
  if (plane) {
    // le disque : le pôle au centre, l'équateur à mi-rayon, le bord au pôle Sud ; le trajet est une droite sur ce plan
    ctx.fillStyle = "rgba(180,83,9,.07)"; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx, cy, rad / 2, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    const P = (f, l) => { const q = (rad * (Math.PI / 2 - f)) / Math.PI; return [cx + q * Math.sin(l), cy + q * Math.cos(l)]; };
    const a = P(f1, l1), b = P(f2, l2); disc(ctx, cx, cy, 2, INK);
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    disc(ctx, a[0], a[1], 3.5, INK); disc(ctx, b[0], b[1], 3.5, INK);
  } else {
    // le globe vu de loin, le trajet sur le grand cercle, centré : un arc d'angle θ au bord
    ctx.fillStyle = "rgba(29,78,216,.07)"; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.fill(); ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.stroke();
    const th = raw.th * DEG, a0 = -Math.PI / 2 - th / 2;
    ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(cx, cy, rad, a0, a0 + th); ctx.stroke();
    ctx.strokeStyle = SOFT; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath();
    ctx.moveTo(cx + rad * Math.cos(a0), cy + rad * Math.sin(a0)); ctx.lineTo(cx, cy); ctx.lineTo(cx + rad * Math.cos(a0 + th), cy + rad * Math.sin(a0 + th)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, 14, a0, a0 + th); ctx.stroke();
    disc(ctx, cx + rad * Math.cos(a0), cy + rad * Math.sin(a0), 3.5, INK); disc(ctx, cx + rad * Math.cos(a0 + th), cy + rad * Math.sin(a0 + th), 3.5, INK);
  }
  tag(ctx, `θ = ${nf(raw.th, 0)}° · v t = ${nf(raw.d, 0)} km`, r.x + r.w - 8, r.y + r.h - 6, { size, c: col, align: "right", maxW: r.w - 16 });
};

/* ---- le graphique ---------------------------------------------------------------------------------------------------- */
function plot(ctx, r, id, PL, SP, N, fits, tr, lang, size) {
  const nf = nfmt(lang), v = VIEW[id];
  const all = [...PL, ...SP], xmax = Math.max(...all.map((p) => p.x)) * 1.05;
  let ylo = Math.min(0, ...all.map((p) => p.y * v.yk)), yhi = Math.max(0, ...all.map((p) => p.y * v.yk)); const pad = (yhi - ylo) * 0.08; ylo -= pad; yhi += pad;
  const x0 = r.x + 46, x1 = r.x + r.w - 8, y0 = r.y + r.h - 36, y1 = r.y + 20;
  const X = (x) => x0 + (x / xmax) * (x1 - x0), Y = (y) => y0 - ((y - ylo) / (yhi - ylo)) * (y0 - y1);
  ctx.fillStyle = PAPER; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  ctx.strokeStyle = "rgba(21,26,33,.35)"; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
  for (const [raw, s] of v.ticks) { const x = X(v.xOf(raw)); if (x > x1) continue; ctx.strokeStyle = FAINT; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 4); ctx.stroke(); text(ctx, s.replace(/,/g, lang === "en" ? "," : " "), x, y0 + 15, { size: size * 0.82, c: SOFT, align: "center" }); }
  const step = niceStep((yhi - ylo) / 4);
  for (let y = Math.ceil(ylo / step) * step; y <= yhi; y += step) text(ctx, `${nf(Math.abs(y) < step * 1e-6 ? 0 : y, step < 1 ? (step < 0.1 ? 2 : 1) : 0)}${v.yu}`, x0 - 4, Y(y) + 4, { size: size * 0.82, c: SOFT, align: "right" });
  text(ctx, tr(...AY[id]), x0 + 4, y1 - 6, { size: size * 0.9, c: INK, bold: true, maxW: r.w - 60 });
  text(ctx, tr(...AX[id]), x1, y0 + 29, { size: size * 0.82, c: SOFT, align: "right", maxW: r.w - 60 });
  // les droites par l'origine
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y1, x1 - x0, y0 - y1); ctx.clip();
  for (const [f, col] of [[fits.plane, FLAT], [fits.sphere, GLOBE]]) {
    if (!f) continue;
    ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(xmax), Y(f.c * xmax * v.yk)); ctx.stroke();
  }
  // les relevés (le plus récent cerclé)
  for (const [pts, col] of [[SP, GLOBE], [PL, FLAT]]) for (let i = 0; i < N; i++) { const p = pts[i]; disc(ctx, X(p.x), Y(p.y * v.yk), N > 60 ? 2.2 : 3.2, col); }
  for (const [pts, col] of [[SP, GLOBE], [PL, FLAT]]) { const p = pts[N - 1]; disc(ctx, X(p.x), Y(p.y * v.yk), 6.5, null, col, 1.6); }
  ctx.restore();
  // les relevés du plan, agrandis dans un encart, quand ils se perdent sur la ligne du zéro
  const A = Math.max(...PL.map((p) => Math.abs(p.y * v.yk))) * 1.15;
  if (A < 0.12 * (yhi - ylo)) {
    const iw = (x1 - x0) * 0.4, ih = (y0 - y1) * 0.34, ix = x0 + 10, iy = y1 + 6;
    const IX = (x) => ix + (x / xmax) * iw, IY = (y) => iy + ih / 2 - (y / A) * (ih / 2), mag = (ih / (2 * A)) / ((y0 - y1) / (yhi - ylo));
    ctx.fillStyle = "rgba(251,246,238,.96)"; ctx.fillRect(ix, iy, iw, ih); ctx.strokeStyle = FLAT; ctx.lineWidth = 1; ctx.strokeRect(ix + 0.5, iy + 0.5, iw - 1, ih - 1);
    ctx.strokeStyle = "rgba(21,26,33,.35)"; ctx.beginPath(); ctx.moveTo(ix, IY(0)); ctx.lineTo(ix + iw, IY(0)); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
    if (fits.plane) { ctx.strokeStyle = FLAT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(IX(0), IY(0)); ctx.lineTo(IX(xmax), IY(fits.plane.c * xmax * v.yk)); ctx.stroke(); }
    for (let i = 0; i < N; i++) { const p = PL[i]; disc(ctx, IX(p.x), IY(p.y * v.yk), N > 60 ? 1.8 : 2.6, FLAT); }
    { const p = PL[N - 1]; disc(ctx, IX(p.x), IY(p.y * v.yk), 5, null, FLAT, 1.4); }
    ctx.restore();
    text(ctx, `${tr("an-me-zoom", "plane only, vertical")} ×${nf(mag, 0)}`, ix + 4, iy + ih + size, { size: size * 0.82, c: FLAT, maxW: iw });
    text(ctx, `±${nf(A, A < 1 ? 2 : 1)}${v.yu}`, ix + iw - 4, iy + size, { size: size * 0.78, c: SOFT, align: "right" });
  }
}
function niceStep(x) { const e = Math.pow(10, Math.floor(Math.log10(x))), f = x / e; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e; }

/** L'évolution de r et de χ²/ν avec le nombre de relevés (2026-11-27, propriétaire) : deux panneaux, N en échelle log, un
 *  point par relevé ajouté, plan et sphère ; χ²/ν en échelle log avec la ligne 1 (dispersion = erreur de l'instrument). */
export function evolution(ctx, r, data, N, n, tr, lang, size) {
  const nf = nfmt(lang), gap = 14, w = (r.w - gap) / 2, A = { x: r.x, y: r.y, w, h: r.h }, B = { x: r.x + w + gap, y: r.y, w, h: r.h };
  const lx = (b, k) => b.x + 40 + (Math.log(k) - Math.log(2)) / (Math.log(n) - Math.log(2)) * (b.w - 48);
  const top = (b) => b.y + size + 10, bot = (b) => b.y + b.h - 20;
  const panel = (b, title, yOf, ticks, ref) => {
    ctx.fillStyle = PAPER; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.x + 40, top(b)); ctx.lineTo(b.x + 40, bot(b)); ctx.lineTo(b.x + b.w - 8, bot(b)); ctx.stroke();
    for (const [v, s] of ticks) { const y = yOf(v); text(ctx, s, b.x + 36, y + 4, { size: size * 0.8, c: SOFT, align: "right" }); ctx.strokeStyle = "rgba(21,26,33,.07)"; ctx.beginPath(); ctx.moveTo(b.x + 40, y); ctx.lineTo(b.x + b.w - 8, y); ctx.stroke(); }
    if (ref != null) { ctx.strokeStyle = "rgba(21,26,33,.45)"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(b.x + 40, yOf(ref)); ctx.lineTo(b.x + b.w - 8, yOf(ref)); ctx.stroke(); ctx.setLineDash([]); }
    for (const k of [2, 10, 100, n]) if (k <= n && (k === n || lx(b, n) - lx(b, k) > 28)) text(ctx, nf(k, 0), lx(b, k), bot(b) + 13, { size: size * 0.8, c: SOFT, align: "center" });
    text(ctx, title, b.x + 4, b.y + size, { size: size * 0.92, c: INK, bold: true, maxW: b.w - 8 });
  };
  const rY = (b) => (v) => bot(b) - ((v + 1) / 2) * (bot(b) - top(b));
  const lo = Math.log10(0.01), hi = Math.log10(3000), cY = (b) => (v) => bot(b) - ((Math.log10(Math.max(0.01, Math.min(3000, v))) - lo) / (hi - lo)) * (bot(b) - top(b));
  const wideT = w > 300;
  panel(A, wideT ? `${tr("an-me-ev-r", "correlation r")} · ${tr("an-me-ev-n", "against the number of readings")}` : tr("an-me-ev-r", "correlation r"), rY(A), [[-1, "−1"], [0, "0"], [1, "1"]], 0);
  panel(B, wideT ? `${tr("an-me-ev-chi", "scatter ÷ noise χ²/ν")} · ${tr("an-me-ev-log", "log scale")}` : "χ²/ν", cY(B), [[0.01, "0.01"], [1, "1"], [100, "100"]], 1);
  for (const [ser, col, lw] of [[data.serP, FLAT, 3.4], [data.serS, GLOBE, 1.5]]) {   // le plan d'abord, plus épais : visible sous la sphère quand ils coïncident
    for (const [b, key, Y] of [[A, "r", rY(A)], [B, "chi2nu", cY(B)]]) {
      const pts = ser.filter((e) => e.n <= N);
      if (!pts.length) continue;
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach((e, i) => { const x = lx(b, e.n), y = Y(e[key]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      const last = pts.at(-1); disc(ctx, lx(b, last.n), Y(last[key]), 3.5, col, PAPER, 1.2);
    }
  }
}

/** Les lectures d'une surface : le rayon d'un relevé, puis l'ajustement, la corrélation et χ²/ν. */
/** Le texte des deux encadrés du rayon et leur taille commune (2026-11-27, propriétaire : « des bords arrondis, des encadrés un
 *  peu plus petits et de la même taille ») : une police pour les deux valeurs, le même nombre de lignes d'étiquette. */
function radiusBoxes(ctx, w, N, PL, SP, fits, m, tr, lang, size) {
  const nf = nfmt(lang), out = {};
  for (const [key, pts, f, plane] of [["plane", PL, fits.plane, true], ["sphere", SP, fits.sphere, false]]) {
    const R = N === 1 ? singleRadius(pts[0], m.power) : f.R;
    out[key] = { R, big: R == null ? tr("an-me-noRbig", "no radius") : `R = ${fmtR(R, tr, nf)}`,
      label: plane ? tr("an-me-ifFlat", "If the Earth is flat") : tr("an-me-ifRound", "If the Earth is round"),
      sub: N === 1 ? tr("an-me-one1", "from one reading") : `${nf(N, 0)} ${tr("an-me-n", "readings")}` };
  }
  let fs = size * 1.6, two = false;
  for (const b of [out.plane, out.sphere]) {
    ctx.font = `600 ${fs}px system-ui, sans-serif`; const wb = ctx.measureText(b.big).width; if (wb > w - 20) fs *= (w - 20) / wb;
    ctx.font = `600 ${size * 0.85}px system-ui, sans-serif`; if (ctx.measureText(`${b.label} · ${b.sub}`).width > w - 14) two = true;
  }
  const lab = size * 0.85 * 1.25, bh = size * 0.7 + (two ? 2 : 1) * lab + fs * 1.4;   // assez bas pour la virgule des milliers (vitrine)
  return { ...out, fs, two, lab, bh };
}
/** Un rectangle aux coins arrondis (chemin seul). */
function rounded(ctx, x, y, w, h, r) {
  const P = Math.PI;   // arc plutôt qu'arcTo : l'enregistreur des vidéos et le rendu hors navigateur ne connaissent que arc
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -P / 2, 0); ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, P / 2); ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + h - r, r, P / 2, P); ctx.lineTo(x, y + r); ctx.arc(x + r, y + r, r, P, 1.5 * P); ctx.closePath();
}

function readouts(ctx, x, y, w, plane, N, pts, f, m, tr, lang, size, B) {
  const nf = nfmt(lang), col = plane ? FLAT : GLOBE, lh = size * 1.45, b = plane ? B.plane : B.sphere, R = b.R;
  // l'encadré du rayon (2026-11-27, propriétaire : « faire ressortir le rayon calculé si la Terre est plate et si elle est
  // ronde ») : même taille pour les deux, coins arrondis
  const bx = x - 4, by = y - size, bw = w + 4;
  rounded(ctx, bx, by, bw, B.bh, 8); ctx.fillStyle = plane ? "rgba(180,83,9,.09)" : "rgba(29,78,216,.08)"; ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
  const labs = B.two ? [b.label, b.sub] : [`${b.label} · ${b.sub}`];
  labs.forEach((l, i) => text(ctx, l, x + 4, y + 1 + i * B.lab, { size: size * 0.85, c: col, bold: true }));
  text(ctx, b.big, x + 4, by + B.bh - B.fs * 0.5, { size: B.fs, c: col, bold: true });
  const lines = [];
  if (N >= 2) {
    const lo = fmtR(f.Rlo, tr, nf), hi = fmtR(f.Rhi, tr, nf);
    if (R == null) lines.push([tr("an-me-slopeNeg", "(the slope is below zero)"), false]);
    lines.push([`${tr("an-me-range", "±1σ")}: ${f.R == null && f.Rhi === Infinity ? `${f.Rlo == null ? "—" : lo} … ∞` : `${lo} … ${hi}`}`, false]);
    lines.push([`${tr("an-me-r", "correlation")} r = ${nf(f.r, N > 2 ? 2 : 0)}${N === 2 ? ` (${tr("an-me-two", "as for any two readings")})` : ""}`, false]);
    if (N > 2) lines.push([`${tr("an-me-chi", "scatter ÷ noise")} χ²/ν = ${f.chi2nu > 100 ? nf(f.chi2nu, 0) : nf(f.chi2nu, 2)}`, false]);
  } else if (R == null) lines.push([`(${tr("an-me-noR1", "the reading points the wrong way")})`, false]);
  let yy = by + B.bh + size * 1.2;
  for (const [s2, b] of lines) { yy += text(ctx, s2, x, yy, { size: size * 0.92, c: col, bold: b, maxW: w }) * lh; }
  return yy;
}

export function drawMethod(ctx, W, H, u, id, tr, lang, data, { evo = true } = {}) {
  const m = METHODS[id], nf = nfmt(lang), size = W < 480 ? 10.5 : 12, narrow = W < 640, stack = W < 900, top = stack ? 50 : 22;   // titre sous le tampon sous 900 px   // téléphone : le titre sous le tampon
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  const N = countAt(u, m.n), PL = data.plane, SP = data.sphere;
  const fits = N >= 2 ? { plane: fitRadius(PL.slice(0, N), m), sphere: fitRadius(SP.slice(0, N), m) } : { plane: { c: PL[0].y / PL[0].x }, sphere: { c: SP[0].y / SP[0].x } };
  const wide = W >= 640;
  const eh = evo ? Math.max(110, (H - top) * (wide ? 0.27 : 0.2)) : 0;   // la bande de l'évolution, en bas
  H -= eh;
  const sh = wide ? (H - top) * 0.34 : (H - top) * 0.26;
  const s1 = { x: 4, y: top, w: W / 2 - 6, h: sh }, s2 = { x: W / 2 + 2, y: top, w: W / 2 - 6, h: sh };
  for (const [box, plane, pts] of [[s1, true, PL], [s2, false, SP]]) {
    sceneFrame(ctx, box, plane, tr, size);
    ctx.save(); ctx.beginPath(); ctx.rect(box.x + 1, box.y + 1, box.w - 2, box.h - 2); ctx.clip();
    SCENES[id](ctx, box, plane, pts[N - 1].raw, tr, nf, size); ctx.restore();
    tag(ctx, plane ? tr("an-me-plane", "plane") : tr("an-me-sphere", "sphere"), box.x + 6, box.y + size + 3, { size, c: plane ? FLAT : GLOBE });
  }
  if (wide) {
    const pr = { x: 0, y: top + sh + 4, w: W * 0.6, h: H - top - sh - 4 };
    plot(ctx, pr, id, PL, SP, N, fits, tr, lang, size);
    const rx = W * 0.6 + 12, rw = W * 0.4 - 18;
    const B = radiusBoxes(ctx, rw, N, PL, SP, fits, m, tr, lang, size);
    const yy = readouts(ctx, rx, pr.y + 22, rw, true, N, PL, fits.plane, m, tr, lang, size, B);
    readouts(ctx, rx, yy + 20, rw, false, N, SP, fits.sphere, m, tr, lang, size, B);
  } else {
    const rh = Math.min(170, (H - top) * 0.34);
    const pr = { x: 0, y: top + sh + 2, w: W, h: H - top - sh - rh - 2 };
    plot(ctx, pr, id, PL, SP, N, fits, tr, lang, size);
    const ry = pr.y + pr.h + size + 4;
    const B = radiusBoxes(ctx, W / 2 - 10, N, PL, SP, fits, m, tr, lang, size);
    readouts(ctx, 6, ry, W / 2 - 10, true, N, PL, fits.plane, m, tr, lang, size, B);
    readouts(ctx, W / 2 + 4, ry, W / 2 - 10, false, N, SP, fits.sphere, m, tr, lang, size, B);
  }
  if (evo) evolution(ctx, { x: 4, y: H + 4, w: W - 8, h: eh - 6 }, data, N, m.n, tr, lang, size);
  tag(ctx, tr(`an-me-t-${id}`, TITLES[id]), 8, stack ? 31 : 15, { size: size + 0.5, maxW: stack ? W - 16 : W - 270 });
  stamp2d(ctx, W, tr("an-me-st", "schematics not to scale; plot to scale"), true);
}

/** Les relevés d'une méthode, calculés une fois (logic.js). */
export function methodData(id) {
  const m = METHODS[id], plane = survey(id, "plane"), sphere = survey(id, "sphere");
  return { plane, sphere, serP: fitSeries(plane, m), serS: fitSeries(sphere, m) };
}

export function mountMethod(canvas, tr, lang, id) {
  const data = methodData(id);
  return anim2d(canvas, { span: METHOD_SPAN, u0: 0, draw: (ctx, W, H, u) => drawMethod(ctx, W, H, u, id, tr, lang, data) });
}

/* ---- les deux façons d'échouer (2026-11-27, propriétaire) : la scène de la vitrine ---- */
/** r et χ²/ν des triangles (r → 0, χ²/ν à 1) au-dessus de ceux d'Ératosthène (r reste, χ²/ν monte), f ∈ [0, 1] = avancement. */
export function drawFail(ctx, W, H, f, tr, lang, data) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  const size = W < 480 ? 10.5 : 12, narrow = W < 560, foot = narrow ? 34 : 22;   // téléphone : les deux mentions du bas sur deux lignes
  const rows = [["triangle", tr("ka-fail-tri", "Triangles: r falls to 0, χ²/ν stays at 1 (no curvature to find)")], ["erat", tr("ka-fail-era", "Eratosthenes, nearby Sun: r stays, χ²/ν climbs (no single radius)")]];
  rows.forEach(([id, title], i) => {
    const n = METHODS[id].n, N = Math.max(2, Math.round(2 * Math.pow(n / 2, f))), y0 = 8 + i * (H - foot) / 2, h = (H - foot) / 2 - 10;
    const ln = text(ctx, title, 8, y0 + 14, { size: size + 1, bold: true, c: INK, maxW: W - 16 }), th = 8 + ln * (size + 1) * 1.3;
    evolution(ctx, { x: 4, y: y0 + th, w: W - 8, h: h - th }, data[id], N, n, tr, lang, size);
  });
  text(ctx, tr("ka-fail-key", "amber: plane · blue: sphere"), W - 8, narrow ? H - 20 : H - 6, { size: size * 0.85, c: INK, align: "right" });
  text(ctx, tr("ka-fail-st", "simulated readings, same instrument on both surfaces"), 8, H - 6, { size: size * 0.85, c: SOFT, maxW: narrow ? W - 16 : W * 0.55 });
}
const FAIL_DATA = {};
export const failData = () => { FAIL_DATA.triangle ??= methodData("triangle"); FAIL_DATA.erat ??= methodData("erat"); return FAIL_DATA; };
