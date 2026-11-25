// Vitrine de l'accueil (epic37/UC05, 2026-11-19, propriétaire : « une animation vitrine du site en général : les intentions,
// le nombre de sources, la neutralité, la science »). Pas une méthode de plus : la DÉMARCHE du site. Deux modèles, les
// mêmes règles ; le verdict écrit d'avance ; trois classes de preuves ; le modèle plat défendu au mieux ; les comptes ; tout
// refaisable ; le rayon par les seules mesures ; ce qui nous ferait changer d'avis. Tous les nombres sont CALCULÉS sur les
// registres du site (site-stats.js) ; les dessins sont schématiques. Moteur : core/reel.js (comme les vitrines de results).
import { makeReel, clamp, ease, easeOut, label, REEL_COL, REEL_MONO } from "../../core/reel.js";
import { syncStats, siteStats } from "./site-stats.js";

const TAU = 2 * Math.PI, MEAS = "#1d4ed8", CHECK = "#7c3aed", MODEL = "#6b7280", GOOD = "#15803d", BAD = "#b91c1c";
let STATS = syncStats();                         // complété par siteStats() au montage (sources, rayon)
const fmt = (x, T, d = 0) => x.toLocaleString(T.lang || "en", { minimumFractionDigits: d, maximumFractionDigits: d });

export const SCENES = [
  { key: "intro", d: 4, num: false }, { key: "advance", d: 6 }, { key: "classes", d: 6.5 }, { key: "steel", d: 6.5 },
  { key: "counts", d: 6 }, { key: "redo", d: 6 }, { key: "radius", d: 6.5 }, { key: "outro", d: 4.5, num: false },
];

/** Le globe et le plan, côte à côte (décor). */
function twoModels(ctx, b, k = 1) {
  const r = Math.min(b.w * 0.17, b.h * 0.3), y = b.y + b.h * 0.48, xg = b.x + b.w * 0.28, xf = b.x + b.w * 0.72;
  ctx.globalAlpha = k;
  ctx.fillStyle = "#bfd3ee"; ctx.beginPath(); ctx.arc(xg, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = MEAS; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#dbe7f7"; ctx.beginPath(); ctx.arc(xg - r * 0.3, y - r * 0.3, r * 0.45, 0, TAU); ctx.fill();   // un reflet, sans dégradé (le rendu des vidéos n'en a pas)
  ctx.strokeStyle = "rgba(29,78,216,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(xg, y, r, r * 0.35, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = "#f6ecdc"; ctx.beginPath(); ctx.ellipse(xf, y, r * 1.15, r * 0.38, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = REEL_COL.flat; ctx.stroke();
  ctx.globalAlpha = 1;
  return { xg, xf, y, r };
}

const draw = {
  intro(ctx, b, u, d, T, fs) {
    const m = twoModels(ctx, b, ease(u / 0.6));
    // une balance : le même fléau pour les deux
    const a = ease((u - 0.8) / 1), ty = m.y - m.r - fs * 1.6;
    ctx.globalAlpha = a; ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(m.xg, ty); ctx.lineTo(m.xf, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((m.xg + m.xf) / 2, ty); ctx.lineTo((m.xg + m.xf) / 2, ty - fs * 1.2); ctx.stroke();
    for (const x of [m.xg, m.xf]) { ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x, m.y - m.r - 4); ctx.stroke(); }
    label(ctx, T("hreel-same"), (m.xg + m.xf) / 2, ty - fs * 1.9, { size: fs * 0.62, col: REEL_COL.ink });
    ctx.globalAlpha = 1;
  },
  advance(ctx, b, u, d, T, fs) {
    // une table qui se remplit : l'expérience, ce qui donnerait raison au globe, ce qui donnerait raison au plan
    const n = STATS.verdicts, rows = Math.min(9, n), rh = Math.min(b.h / (rows + 2.2), fs * 1.5), x0 = b.x + b.w * 0.06, w = b.w * 0.88, y0 = b.y + b.h * 0.08;
    const c1 = x0 + w * 0.48, c2 = x0 + w * 0.76;
    label(ctx, T("hreel-adv-g"), (c1 + c2) / 2 - w * 0.02, y0, { size: fs * 0.55, col: MEAS });
    label(ctx, T("hreel-adv-f"), c2 + w * 0.12, y0, { size: fs * 0.55, col: REEL_COL.flat });
    for (let i = 0; i < rows; i++) {
      const a = ease((u - 0.4 - i * 0.32) / 0.4); if (a <= 0) continue;
      const y = y0 + (i + 1) * rh; ctx.globalAlpha = a;
      ctx.fillStyle = i % 2 ? "rgba(21,26,33,.035)" : "rgba(21,26,33,.07)"; ctx.fillRect(x0, y - rh * 0.45, w, rh * 0.9);
      ctx.fillStyle = REEL_COL.soft; ctx.fillRect(x0 + w * 0.02, y - fs * 0.12, w * (0.25 + 0.15 * ((i * 37) % 7) / 7), fs * 0.24);
      ctx.fillStyle = "rgba(29,78,216,.5)"; ctx.fillRect(c1, y - fs * 0.1, w * 0.2, fs * 0.2);
      ctx.fillStyle = "rgba(180,83,9,.5)"; ctx.fillRect(c2, y - fs * 0.1, w * 0.2, fs * 0.2);
      ctx.globalAlpha = 1;
    }
    const k = Math.round(n * clamp((u - 0.4) / (d * 0.65)));
    label(ctx, T("hreel-adv-n").replace("{n}", fmt(k, T)), b.x + b.w / 2, y0 + (rows + 1.4) * rh, { size: fs * 0.8, col: REEL_COL.ink, weight: 800 });
  },
  classes(ctx, b, u, d, T, fs) {
    const S = STATS.sections, items = [["measure", MEAS], ["check", CHECK], ["model", MODEL]], max = Math.max(...items.map(([c]) => S[c]));
    const x0 = b.x + b.w * 0.32, w = b.w * 0.6, bh = Math.min(b.h * 0.16, fs * 1.6);
    items.forEach(([c, col], i) => {
      const y = b.y + b.h * (0.22 + i * 0.26), a = ease((u - 0.3 - i * 0.7) / 0.9);
      label(ctx, T(`hreel-cls-${c}`), x0 - fs * 0.5, y, { size: fs * 0.66, col, align: "right", weight: 800 });
      ctx.fillStyle = "rgba(21,26,33,.06)"; ctx.fillRect(x0, y - bh / 2, w, bh);
      ctx.fillStyle = col; ctx.fillRect(x0, y - bh / 2, w * (S[c] / max) * a, bh);
      if (a > 0) label(ctx, fmt(Math.round(S[c] * a), T), x0 + w * (S[c] / max) * a + fs * 0.3, y, { size: fs * 0.7, col: REEL_COL.ink, align: "left", weight: 800 });
      label(ctx, T(`hreel-cls-${c}-d`), x0, y + bh * 0.95, { size: fs * 0.45, col: REEL_COL.soft, align: "left", weight: 500 });
    });
    label(ctx, T("hreel-cls-unit"), b.x + b.w * 0.62, b.y + b.h * 0.94, { size: fs * 0.5, col: REEL_COL.soft, weight: 500 });
  },
  steel(ctx, b, u, d, T, fs) {
    // un paramètre libre du modèle plat (la hauteur de son Soleil) balayé : l'écart aux mesures descend, touche un minimum, ne
    // passe jamais à zéro ; schématique (chaque onglet donne ses nombres)
    const X0 = b.x + b.w * 0.12, X1 = b.x + b.w * 0.94, Y0 = b.y + b.h * 0.82, Y1 = b.y + b.h * 0.12;
    ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X0, Y1); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
    label(ctx, T("hreel-steel-x"), (X0 + X1) / 2, Y0 + fs * 0.8, { size: fs * 0.5, col: REEL_COL.soft, weight: 500 });
    ctx.save(); ctx.translate(X0 - fs * 0.6, (Y0 + Y1) / 2); ctx.rotate(-Math.PI / 2); label(ctx, T("hreel-steel-y"), 0, 0, { size: fs * 0.5, col: REEL_COL.soft, weight: 500 }); ctx.restore();
    const f = (x) => 0.28 + 2.6 * (x - 0.42) ** 2, X = (x) => X0 + x * (X1 - X0), Y = (v) => Y0 - v / 1.2 * (Y0 - Y1);
    const sweep = clamp((u - 0.4) / (d * 0.55));
    ctx.strokeStyle = REEL_COL.flat; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i <= 100 * sweep; i++) { const x = i / 100; i ? ctx.lineTo(X(x), Y(f(x))) : ctx.moveTo(X(x), Y(f(x))); } ctx.stroke();
    if (sweep > 0) { const x = sweep; ctx.fillStyle = REEL_COL.flat; ctx.beginPath(); ctx.arc(X(x), Y(f(x)), fs * 0.22, 0, TAU); ctx.fill(); }
    // la ligne des erreurs de mesure : ce que le modèle devrait atteindre
    ctx.strokeStyle = MEAS; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X0, Y(0.06)); ctx.lineTo(X1, Y(0.06)); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, T("hreel-steel-noise"), X1, Y(0.06) - fs * 0.5, { size: fs * 0.5, col: MEAS, align: "right", weight: 600 });
    const ab = ease((u - d * 0.7) / 0.5);
    if (ab > 0) { ctx.globalAlpha = ab; ctx.strokeStyle = REEL_COL.flat; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(0.42), Y(f(0.42)) + fs * 0.4); ctx.lineTo(X(0.42), Y(0.06)); ctx.stroke();
      label(ctx, T("hreel-steel-best"), X(0.42) + fs * 0.4, Y(f(0.42)) - fs * 0.7, { size: fs * 0.58, col: REEL_COL.flat, align: "left", weight: 800 }); ctx.globalAlpha = 1; }
  },
  counts(ctx, b, u, d, T, fs) {
    const items = [[STATS.tabs, "hreel-n-tabs"], [STATS.sources, "hreel-n-src"], [STATS.datasets, "hreel-n-ds"], [STATS.verdicts, "hreel-n-ver"]];
    const cols = b.w > b.h * 1.2 ? 2 : 1, rows = Math.ceil(items.length / cols);
    items.forEach(([n, key], i) => {
      const cx = b.x + b.w * (cols === 2 ? (i % 2 ? 0.74 : 0.26) : 0.5), cy = b.y + b.h * ((Math.floor(i / cols) + 0.5) / rows);
      const a = easeOut((u - 0.3 - i * 0.45) / 1.6), v = Math.round((n || 0) * clamp(a));
      label(ctx, fmt(v, T), cx, cy - fs * 0.35, { size: fs * 2.1, col: i === 1 ? MEAS : REEL_COL.ink, weight: 800 });
      label(ctx, T(key), cx, cy + fs * 1.05, { size: fs * 0.6, col: REEL_COL.soft, weight: 600 });
    });
  },
  redo(ctx, b, u, d, T, fs) {
    // un terminal : chaque jeu de données se refait à partir de ses fichiers bruts
    const x0 = b.x + b.w * 0.04, w = b.w * 0.92, y0 = b.y + b.h * 0.06, h = b.h * 0.86, lh = fs * 0.95;
    ctx.fillStyle = "#15191f"; ctx.fillRect(x0, y0, w, h);
    for (const [i, c] of ["#ef4444", "#f59e0b", "#22c55e"].entries()) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x0 + fs * (0.7 + i * 0.7), y0 + fs * 0.6, fs * 0.2, 0, TAU); ctx.fill(); }
    const ids = STATS.datasetIds, shown = Math.floor(clamp((u - 0.3) / (d * 0.85)) * ids.length);
    const maxLines = Math.floor((h - fs * 1.6) / (lh * 2)), start = Math.max(0, shown - maxLines);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 + fs * 1.1, w, h - fs * 1.2); ctx.clip();
    for (let k = start; k <= Math.min(shown, ids.length - 1); k++) {
      const y = y0 + fs * 1.8 + (k - start) * lh * 2;
      label(ctx, `$ fog build ${ids[k]}`, x0 + fs * 0.6, y, { size: fs * 0.52, col: "#e5e7eb", align: "left", font: REEL_MONO, weight: 500 });
      if (k < shown) label(ctx, `  ✓ ${T("hreel-redo-ok")}`, x0 + fs * 0.6, y + lh, { size: fs * 0.48, col: "#86efac", align: "left", font: REEL_MONO, weight: 500 });
    }
    ctx.restore();
  },
  radius(ctx, b, u, d, T, fs) {
    const R = STATS.radius; if (!R?.methods?.length) return;
    const lo = 6250, hi = 6500, X0 = b.x + b.w * 0.08, X1 = b.x + b.w * 0.92, X = (v) => X0 + (clamp(v, lo, hi) - lo) / (hi - lo) * (X1 - X0);
    const n = R.methods.length, y0 = b.y + b.h * 0.12, rh = (b.h * 0.6) / n;
    for (const v of [6250, 6300, 6350, 6400, 6450, 6500]) { ctx.strokeStyle = "rgba(21,26,33,.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(v), y0 - rh * 0.4); ctx.lineTo(X(v), y0 + n * rh); ctx.stroke();
      label(ctx, fmt(v, T), X(v), y0 + n * rh + fs * 0.6, { size: fs * 0.48, col: REEL_COL.soft, weight: 500 }); }
    R.methods.forEach((m, i) => {
      const a = ease((u - 0.3 - i * 0.35) / 0.5); if (a <= 0) return;
      const y = y0 + (i + 0.5) * rh; ctx.globalAlpha = a;
      ctx.strokeStyle = MEAS; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(m.med - m.sigma), y); ctx.lineTo(X(m.med + m.sigma), y); ctx.stroke();
      ctx.fillStyle = MEAS; ctx.beginPath(); ctx.arc(X(m.med), y, fs * 0.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    });
    const a = ease((u - 0.3 - n * 0.35) / 0.6);
    if (a > 0) { ctx.globalAlpha = a; ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(R.mean), y0 - rh * 0.5); ctx.lineTo(X(R.mean), y0 + n * rh); ctx.stroke();
      label(ctx, `${fmt(R.mean, T)} ± ${fmt(R.se, T)} km`, X(R.mean), y0 + n * rh + fs * 1.7, { size: fs * 0.9, col: REEL_COL.ink, weight: 800 }); ctx.globalAlpha = 1; }
    label(ctx, T("hreel-rad-flat"), b.x + b.w / 2, b.y + b.h * 0.98, { size: fs * 0.5, col: REEL_COL.flat, weight: 600 });
  },
  outro(ctx, b, u, d, T, fs) {
    const m = twoModels(ctx, b, 1 - 0.6 * ease(u / 1.2));
    const a = ease((u - 0.8) / 0.8);
    ctx.globalAlpha = a; label(ctx, "?", (m.xg + m.xf) / 2, m.y, { size: fs * 3.2, col: REEL_COL.ink, weight: 800 }); ctx.globalAlpha = 1;
  },
};

const reel = makeReel({ scenes: SCENES, draw, prefix: "hreel", still: 17 });
export const REEL_TOTAL = reel.total;

/** Monte la vitrine ; renvoie aussi `ready`, la promesse des comptes chargés (sources, rayon) pour l'export et le pré-rendu. */
export function mountSiteReel(canvas, T, exists) {
  const r = reel.mountReel(canvas, T);
  const ready = siteStats(exists).then((S) => { STATS = S; r.start?.(); }).catch((e) => console.warn("vitrine : comptes", e));
  return { ...r, ready };
}
