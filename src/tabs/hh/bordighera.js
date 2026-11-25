// Bordighera vue d'un balcon près d'Antibes, 49 km de mer (2026-10-06, photo du propriétaire,
// Nikon P900). Géométrie pure de l'animation bordighera-anim.js : plan -> globe -> globe réfracté.
//
// Un seul paramètre de forme, la courbure APPARENTE c : 0 = plan, 1 = globe de rayon R sans
// réfraction, 1 − k = globe avec la réfraction standard (rayons droits sur une Terre de rayon
// R/(1 − k), règle 3 : k = 0,13, globe seulement, toujours affiché à côté de la valeur brute).
// Les angles viennent de elevC/dipC/hiddenC (src/core/flatten.js), la vraie géométrie, jamais
// le dessin. Positions : (azimut relatif à la visée, distance de grand cercle sur la sphère de
// 6 371 km, hauteur), cuites par research/build_bordighera.py ; le plan reçoit les MÊMES
// distances (steel-man : aucune carte plate n'a à s'accorder avec autre chose).
import { dipC, elevC, hiddenC } from "../../core/flatten.js";
import { revealAlpha, REVEAL_T } from "../../core/motion.js";

export const R = 6371e3, K = 0.13;
const D2R = Math.PI / 180;

/** Courbure apparente au temps t (s) : plan 2 s, courbure 3 s, globe 2 s, réfraction 2,5 s, tenue (la photo
 * s'y révèle, photoAlpha) 0,5 s + REVEAL_T, retour 2 s. */
const HOLD = 9.5, REV0 = HOLD + 0.5, BACK = REV0 + REVEAL_T;
export const CYCLE = BACK + 2;
export const PHASES = [[0, 2], [2, 5], [5, 7], [7, HOLD], [HOLD, BACK], [BACK, CYCLE]];
export function stateAt(t, k = K) {
  const u = ((t % CYCLE) + CYCLE) % CYCLE, ease = (x) => x * x * (3 - 2 * x);
  if (u < 2) return { c: 0, curv: 0, refr: 0 };
  if (u < 5) { const s = ease((u - 2) / 3); return { c: s, curv: s, refr: 0 }; }
  if (u < 7) return { c: 1, curv: 1, refr: 0 };
  if (u < HOLD) { const s = ease((u - 7) / 2.5); return { c: 1 - k * s, curv: 1, refr: s }; }
  if (u < BACK) return { c: 1 - k, curv: 1, refr: 1 };
  const s = ease((u - BACK) / 2); return { c: (1 - k) * (1 - s), curv: 1 - s, refr: 1 - s };
}

/** Opacité de la photo au temps t : nulle tant que le modèle change, puis fondu jusqu'à `peak` et clignotement
 * tout-ou-rien (core/motion.js) pendant la tenue sur le globe réfracté. */
export function photoAlpha(t, peak = 1) {
  const u = ((t % CYCLE) + CYCLE) % CYCLE;
  return u >= REV0 && u < BACK ? revealAlpha(u - REV0, peak) : 0;
}

/** Le fan de terrain décodé : g[i*nAz + j] (m), anneau i à d0 + i·dStep (i < n1, TINITALY), puis tous les dStep2
 * (Copernicus, jusqu'à ~95 km : les crêtes du fond de la photo) ; azimut az0 + j·azStep (° relatifs). */
export function decodeFan(F) {
  const bin = typeof atob === "function" ? atob(F.b64) : Buffer.from(F.b64, "base64").toString("binary");
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const v = new Uint16Array(u.buffer), g = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) g[i] = v[i] / F.q;
  // distance de la côte par colonne (premier anneau de terre) : le bord lointain de la mer sur le plan
  const coast = new Float32Array(F.nAz);
  for (let j = 0; j < F.nAz; j++) {
    let i = 0; while (i < F.nD && g[i * F.nAz + j] <= 0.5) i++;
    coast[j] = F.d0 + Math.min(i, F.nD - 1) * F.dStep;
  }
  const n1 = F.n1 ?? F.nD, dEnd = F.d0 + (n1 - 1) * F.dStep;
  return { ...F, g, coast, az: (j) => F.az0 + j * F.azStep, d: (i) => (i < n1 ? F.d0 + i * F.dStep : dEnd + (i - n1 + 1) * F.dStep2) };
}

/** Élévation (rad) d'un point (d m, h m) pour un œil à e m, courbure apparente c. */
export const elev = (c, e, d, h) => elevC(R, c, e, d, h);

/** Haut de la mer (rad) dans une colonne dont la côte est à dc : l'horizon s'il tombe avant la côte, sinon la ligne de côte. */
export function seaTop(c, e, dc) {
  if (c > 0) {
    const d0 = Math.sqrt(2 * (R / c) * e);
    if (d0 < dc) return -dipC(R, c, e);
  }
  return elev(c, e, dc, 0);
}

/** Hauteur cachée (m) à distance d : 0 sur le plan, géométrique, ou réfractée selon c. */
export const hidden = (c, e, d) => hiddenC(R, c, e, d);

/** Un bâtiment en angles : sommets (x = azimut relatif en rad, yb/yt = pied/toit en rad) et distance moyenne. */
export function buildingAngles(b, c, e) {
  const n = b.v.length;
  const out = { d: 0, pts: new Array(n) };
  for (let i = 0; i < n; i++) {
    const [daz, d, g] = b.v[i];
    out.d += d / n;
    out.pts[i] = { x: daz * 1e-6 * D2R, yb: elev(c, e, d, g), yt: elev(c, e, d, b.roof), d };
  }
  return out;
}

/** Fraction (0..1) de la hauteur d'un bâtiment cachée par la mer, au plus bas de ses sommets. */
export function hiddenFraction(b, c, e) {
  let worst = 0;
  for (const [, d, g] of b.v) {
    const H = hidden(c, e, d), top = b.roof;
    worst = Math.max(worst, Math.min(1, Math.max(0, (H - g) / Math.max(top - g, 1e-6))));
  }
  return worst;
}

/** Les nombres de la section : hauteur cachée à la distance de chaque lieu nommé, plan / globe / globe réfracté. */
export function bordNumbers(site, k = K) {
  const e = site.eye;
  const rows = Object.entries(site.named).map(([key, n]) => ({
    key, name: n.name, d: n.d, ground: n.ground,
    plane: 0, globe: hidden(1, e, n.d), refr: hidden(1 - k, e, n.d),
  }));
  return {
    e, d0: Math.sqrt(2 * R * e), d0r: Math.sqrt(2 * R / (1 - k) * e),
    dip: dipC(R, 1, e), dipR: dipC(R, 1 - k, e), rows,
  };
}
