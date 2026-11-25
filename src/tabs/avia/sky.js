// Le ciel de la figure des forces (epic17) : les mêmes étoiles autour du globe
// et derrière chaque avion, de vraies constellations connues (Orion, la Grande
// Ourse, Cassiopée, la Croix du Sud), positions du catalogue du site (J2000).
// Les motifs sont dessinés lisibles (nord en haut, jamais tournés, même taille) ;
// seule leur position suit le ciel. Positions vues d'un axe du ciel (RA 330°, dec +5°, choisi pour que ces quatre figures
// tombent toutes loin de l'axe, donc visibles autour du globe), en projection
// azimutale équidistante : la distance à l'axe est la vraie distance angulaire,
// l'angle autour de l'axe est le vrai ; le dessin met le rayon à l'échelle de
// la place disponible (non à l'échelle, dit dans la légende). Les étoiles sont
// fixes dans l'espace ; dans le repère de l'avion elles tournent de −θ.
import { STARS } from "../../data/star-catalog.js";

const D2R = Math.PI / 180;
const BY = Object.fromEntries(STARS.map((s) => [s.hr, s]));
const unit = (ra, de) => [Math.cos(de * D2R) * Math.cos(ra * D2R), Math.cos(de * D2R) * Math.sin(ra * D2R), Math.sin(de * D2R)];
const AXIS = unit(330, 5);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const E1 = (() => { const z = [0, 0, 1], d = dot(z, AXIS), e = [z[0] - d * AXIS[0], z[1] - d * AXIS[1], z[2] - d * AXIS[2]], n = Math.hypot(...e); return e.map((x) => x / n); })();
const E2 = [AXIS[1] * E1[2] - AXIS[2] * E1[1], AXIS[2] * E1[0] - AXIS[0] * E1[2], AXIS[0] * E1[1] - AXIS[1] * E1[0]];

/** Constellations : traits (paires de numéros HR) et nom affiché. */
export const CONS = [
  { n: "Orion", lines: [[2061, 1790], [2061, 1948], [1790, 1852], [1852, 1903], [1903, 1948], [1948, 2004], [1852, 1713], [2004, 1713]] },
  { n: "Big Dipper", lines: [[4301, 4295], [4295, 4554], [4554, 4660], [4660, 4301], [4660, 4905], [4905, 5054], [5054, 5191]] },
  { n: "Cassiopeia", lines: [[21, 168], [168, 264], [264, 403], [403, 542]] },
  { n: "Southern Cross", lines: [[4730, 4763], [4853, 4656]] },
];
const IN_CONS = new Set(CONS.flatMap((c) => c.lines.flat()));

/** Position polaire (θ : distance à l'axe, degrés ; φ : angle autour) d'une étoile du catalogue. */
function polar(s) {
  const v = unit(s.ra, s.de);
  return { th: Math.acos(Math.max(-1, Math.min(1, dot(v, AXIS)))) / D2R, phi: Math.atan2(dot(v, E2), dot(v, E1)) };
}
const P = Object.fromEntries(STARS.map((s) => [s.hr, { ...polar(s), v: s.v }]));
const TH0 = 45, TH1 = 135;

/**
 * Chaque constellation, vue du dehors du dessin, « vers nous » : un motif rigide,
 * nord en haut, est à gauche (le ciel vu de la Terre ; « east » du code est l'ouest, d'où le signe +), à la même taille (size px
 * pour la plus grande dimension) et jamais tourné ; seul son centre suit la
 * position polaire de la constellation. Cela n'a pas de sens physique (chaque
 * motif est vu d'un autre point) : c'est pour la lisibilité, dit dans la légende.
 */
function glyph(c) {
  const hrs = [...new Set(c.lines.flat())], vs = hrs.map((h) => { const s = BY[h]; return { h, v: unit(s.ra, s.de) }; });
  const m = vs.reduce((p, q) => [p[0] + q.v[0], p[1] + q.v[1], p[2] + q.v[2]], [0, 0, 0]), n = Math.hypot(...m), ctr = m.map((x) => x / n);
  const z = [0, 0, 1], d = dot(z, ctr), up0 = [z[0] - d * ctr[0], z[1] - d * ctr[1], z[2] - d * ctr[2]], un = Math.hypot(...up0), up = up0.map((x) => x / un);
  const east = [ctr[1] * up[2] - ctr[2] * up[1], ctr[2] * up[0] - ctr[0] * up[2], ctr[0] * up[1] - ctr[1] * up[0]];
  const pos = {}; let ext = 0;
  for (const { h, v } of vs) { const g = dot(v, ctr); pos[h] = [dot(v, east) / g, -dot(v, up) / g]; ext = Math.max(ext, Math.abs(pos[h][0]), Math.abs(pos[h][1])); }
  const th0 = Math.acos(Math.max(-1, Math.min(1, dot(ctr, AXIS)))) / D2R;
  const phi = Math.atan2(dot(ctr, E2), dot(ctr, E1));
  return { c, pos, ext, th: th0, phi };
}
const GLYPHS = CONS.map(glyph);

/**
 * Le ciel mis à l'échelle de l'anneau [rIn, rOut] (px), centré en (cx, cy),
 * tourné de rot (radians) pour les POSITIONS ; les motifs des constellations,
 * eux, ne tournent pas (voir glyph). Renvoie { stars: [{x, y, m, con}],
 * lines: [[x0, y0, x1, y1]], labels: [{n, x, y}] }, m = taille (px) selon la magnitude.
 */
export function sky(cx, cy, rIn, rOut, rot = 0, size = 46) {
  const at = (p) => { const r = rIn + (p.th - TH0) / (TH1 - TH0) * (rOut - rIn); return [cx + r * Math.cos(p.phi + rot), cy + r * Math.sin(p.phi + rot)]; };
  const stars = [];
  for (const s of STARS) { const p = P[s.hr]; if (IN_CONS.has(s.hr) || p.th < TH0 || p.th > TH1) continue; const [x, y] = at(p); stars.push({ x, y, m: Math.max(0.9, 2.2 - 0.5 * s.v), con: false }); }
  const lines = [], labels = [];
  for (const g of GLYPHS) {
    const [ox, oy] = at(g), k = size / 2 / g.ext, xy = (h) => [ox + g.pos[h][0] * k, oy + g.pos[h][1] * k];
    for (const [a, b] of g.c.lines) { const A = xy(a), B = xy(b); lines.push([A[0], A[1], B[0], B[1]]); }
    for (const h of Object.keys(g.pos)) { const [x, y] = xy(+h); stars.push({ x, y, m: Math.max(1.2, 2.6 - 0.5 * BY[h].v), con: true }); }
    labels.push({ n: g.c.n, x: ox, y: oy - size / 2 - 3 });
  }
  return { stars, lines, labels };
}

/** Dessine le ciel ; labels : écrire les noms (autour du globe seulement). */
export function drawSky(ctx, S, { labels = false, label = null, tr = (k, f) => f } = {}) {
  ctx.save();
  ctx.strokeStyle = "rgba(160,190,255,0.38)"; ctx.lineWidth = 0.9;
  ctx.beginPath(); for (const [a, b, c, d] of S.lines) { ctx.moveTo(a, b); ctx.lineTo(c, d); } ctx.stroke();
  for (const s of S.stars) { ctx.fillStyle = s.con ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.arc(s.x, s.y, s.m * 0.8, 0, 2 * Math.PI); ctx.fill(); }
  ctx.restore();
  if (labels && label) for (const l of S.labels) label(ctx, tr(`sk-${l.n}`, l.n), Math.max(l.x, 4 + 3.1 * tr(`sk-${l.n}`, l.n).length), Math.max(l.y, 8), { al: "center", col: "rgba(190,210,255,0.8)", font: "9.5px system-ui, sans-serif" });
}
