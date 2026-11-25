// Schémas des formules de l'onglet dip (2026-10-01, revue de toute la page,
// epic15/UC03 : « les formules doivent avoir des figures »). Montés par
// index.js après drawSymbols, avant renderTexIn. Schématiques, tamponnés.
import { FIG, polar } from "../../core/fig.js";
import { stamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";

const C = FIG.C;

/** L'invariant de Bouguer : n·r·cos β garde la même valeur tout le long du rayon, de l'œil au point rasant. */
function figBouguer(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-bg-alt", "An eye at height h above the sea, at distance R + h from the Earth's centre, where the air has index n_eye; the ray to the horizon leaves δ below the eye's horizontal and grazes the sea at distance R from the centre, where the index is n_sea. Along the ray, n times r times the cosine of its angle with the horizontal stays the same") });
  const cx = 200, cy = 520, R = 420, hE = 40, aE = 112;
  f.path(`M${polar(cx, cy, R, 118).join(" ")}A${R} ${R} 0 0 1 ${polar(cx, cy, R, 66).join(" ")}`, { c: C.sea, w: 2.4 });
  const E0 = polar(cx, cy, R, aE), E = polar(cx, cy, R + hE, aE);
  const tg = Math.acos(R / (R + hE)) * 180 / Math.PI, G = polar(cx, cy, R, aE - tg);
  f.line(...E0, ...E, { c: C.ink, w: 1.4 });
  f.txt(E[0] - 16, (E[1] + E0[1]) / 2 + 12, "h", { tex: "h", c: C.ink });
  // horizontale de l'œil, rayon (légèrement courbé vers le bas par la réfraction)
  const Hz = polar(E[0], E[1], 170, aE - 90);
  f.dash(...E, ...Hz, { c: C.soft });
  const mx = (E[0] + G[0]) / 2, my = (E[1] + G[1]) / 2 - 6;
  f.path(`M${E[0]} ${E[1]}Q${mx} ${my} ${G[0]} ${G[1]}`, { c: C.globe, w: 2 });
  f.angle(E[0], E[1], 58, aE - 90 - tg, aE - 90, { label: "δ", tex: "\\delta", c: C.flat, pad: 12 });
  f.dot(...E, { r: 4 }); f.dot(...G, { r: 3.5, c: C.globe });
  // les deux rayons vers le centre (hors cadre)
  const Ec = polar(E[0], E[1], 150, aE + 180), Gc = polar(G[0], G[1], 95, aE - tg + 180);
  f.dash(...E, ...Ec, { c: C.faint }); f.dash(...G, ...Gc, { c: C.faint });
  f.txt(Ec[0] + 6, Ec[1] - 4, "r = R + h", { tex: "r = R + h", c: C.soft, size: 11 });
  f.txt(Gc[0] + 6, Gc[1] - 4, "r = R", { tex: "r = R", c: C.soft, size: 11 });
  f.txt(E[0] - 4, E[1] - 12, "n_eye", { tex: "n_{\\text{eye}}", c: C.ink, size: 11 });
  f.txt(G[0] + 4, G[1] - 12, "n_sea", { tex: "n_{\\text{sea}}", c: C.globe, size: 11 });
  f.note(10, 212, tr("fx-bg-1", "along the ray, n · r · cos β never changes (Bouguer):"), { size: 9.5 });
  f.note(10, 225, tr("fx-bg-2", "at the eye n_eye (R + h) cos δ, at the sea n_sea R"), { size: 9.5 });
  stamp(f, tr, tr("fx-bg-s", "curvature and dip enlarged"));
  return f;
}

/** Le dernier rayon : il rase la mer au point T, à l'arc φ de l'œil, puis se courbe encore de ρ₀ ; le centre du Soleil est s plus bas. */
function figMlo(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-ml-alt", "An eye on a mountain at height h above the sea. The last ray of sunlight that reaches it grazes the sea at the tangent point T, an arc φ away seen from the Earth's centre, and bends a further ρ₀ in the air beyond T on its way from the Sun. When the Sun's upper edge is on that ray, its centre is s lower still: the true altitude of the centre is −(φ + ρ₀ + s), below the eye's horizontal") });
  const cx = 230, cy = 560, R = 470, aM = 92, aT = 112, hM = 34;
  f.path(`M${polar(cx, cy, R, 125).join(" ")}A${R} ${R} 0 0 1 ${polar(cx, cy, R, 70).join(" ")}`, { c: C.sea, w: 2.4 });
  const M0 = polar(cx, cy, R, aM), M = polar(cx, cy, R + hM, aM), T = polar(cx, cy, R, aT);
  // la montagne, schématique
  f.path(`M${polar(cx, cy, R, aM + 7).join(" ")}L${M.join(" ")}L${polar(cx, cy, R, aM - 6).join(" ")}`, { c: "#7d6f55", w: 1.2, fill: "#d8ccb4" });
  // horizontale de l'œil
  const Hz = polar(M[0], M[1], 230, aM - 90 + 180);
  f.dash(...M, ...Hz, { c: C.soft });
  // le rayon : de l'œil au point de tangence (courbé), puis au-delà, encore courbé de ρ₀
  const qx = (M[0] + T[0]) / 2, qy = (M[1] + T[1]) / 2 - 5;
  f.path(`M${M[0]} ${M[1]}Q${qx} ${qy} ${T[0]} ${T[1]}`, { c: "#d39b00", w: 2.2 });
  const tan = aT - 90 + 180, far = polar(T[0], T[1], 90, tan - 6), mid = polar(T[0], T[1], 55, tan - 1);
  f.path(`M${T[0]} ${T[1]}Q${mid[0]} ${mid[1]} ${far[0]} ${far[1]}`, { c: "#d39b00", w: 2.2 });
  f.dash(...T, ...polar(T[0], T[1], 92, tan), { c: C.faint });
  f.circle(far[0] - 6, far[1] - 4, 9, { c: "#d39b00", w: 1.4, fill: "#ffe7a3" });
  f.dot(...M, { r: 4 }); f.dot(...T, { r: 3.5, c: C.sea });
  f.txt(M[0] + 8, M[1] - 2, "h", { tex: "h", c: C.ink });
  f.txt(T[0] - 6, T[1] + 16, "T", { c: C.sea, anchor: "middle" });
  // l'arc φ, vu du centre (rayons vers le centre, hors cadre)
  const Mc = polar(M0[0], M0[1], 120, aM + 180), Tc = polar(T[0], T[1], 120, aT + 180);
  f.dash(...M0, ...Mc, { c: C.faint }); f.dash(...T, ...Tc, { c: C.faint });
  const a1 = polar(cx, cy, R - 70, aM), a2 = polar(cx, cy, R - 70, aT);
  f.path(`M${a1.join(" ")}A${R - 70} ${R - 70} 0 0 1 ${a2.join(" ")}`.replace("0 0 1", "0 0 0"), { c: C.globe, w: 1.4 });
  const am = polar(cx, cy, R - 84, (aM + aT) / 2);
  f.txt(am[0], am[1], "φ", { tex: "\\varphi", c: C.globe, anchor: "middle" });
  f.txt(far[0] + 8, far[1] + 18, "ρ₀", { tex: "\\rho_0", c: "#b07d00" });
  f.txt(far[0] - 6, far[1] - 18, "s", { tex: "s", c: "#b07d00", anchor: "middle" });
  f.note(12, 226, tr("fx-ml-1", "true altitude of the Sun's centre at the last flash: −(φ + ρ₀ + s)"), { size: 9.5 });
  stamp(f, tr, tr("fx-ml-s", "curvature, height and angles enlarged"));
  return f;
}

export const FORMULA_FIGS = { dipFxBouguer: figBouguer, dipFxMlo: figMlo };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "dip"); }
