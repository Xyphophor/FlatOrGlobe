// Onglet contrib, deuxième contribution (2026-10-14) : Bass Rock vu d'East Lomond Hill (Fife, 345 m), 9 août 2023,
// 5 h 28 BST. Géométrie pure : où l'horizon de la mer coupe le rocher.
//
// Le rocher (H m, à d m) est PLUS PRÈS que l'horizon : rien n'est caché, mais l'horizon de la mer passe devant lui.
// La mesure f = part du rocher, comptée depuis son pied, qui est sous l'horizon -- un rapport de deux longueurs lues sur
// la même photo, sans échelle. Comme pour Adélaïde, un seul paramètre de forme, la courbure APPARENTE c (rayons droits
// sur une surface de rayon R/c) : globe c = 1 − k, plan c = −k. Pour un c donné, l'image est la même dans les deux
// modèles ; ce qui les sépare, c'est l'air qu'il faut pour ce c (rayons tracés, tools/internal/build/lomond).
// Hauteurs en m au-dessus de l'eau du moment ; angles en radians.
export const R = 6371e3, K = 0.13;

/** Élévation apparente (rad) d'un point à h m au-dessus de l'eau, à dd m, œil à e m, courbure apparente c. */
export const elevL = (c, e, dd, h) => Math.atan((h - e) / dd - (c * dd) / (2 * R));

/** Distance de l'horizon (m), Infinity quand la surface apparente n'est pas convexe. */
export const horizonDistL = (c, e) => (c > 0 ? Math.sqrt((2 * e * R) / c) : Infinity);

/** Le haut de la mer vue (rad) : l'horizon s'il tombe avant dMax, sinon la mer à dMax (au-delà, la brume). */
export const horizonL = (c, e, dMax) => (horizonDistL(c, e) < dMax ? -Math.sqrt((2 * c * e) / R) : elevL(c, e, dMax, 0));

/** Le bord haut de la mer vue devant un objet à dd m : l'horizon s'il tombe avant, sinon l'eau à son pied. */
export const seaEdgeL = (c, e, dd, dMax) => (horizonDistL(c, e) < Math.min(dd, dMax) ? -Math.sqrt((2 * c * e) / R) : elevL(c, e, Math.min(dd, dMax), 0));

/** f : part du rocher (depuis son pied) sous l'horizon, pour une courbure apparente c. S = LOM_SITE. */
export function fraction(c, S) {
  const e = S.e, H = S.Hw, d = S.rock.d;
  const base = elevL(c, e, d, 0), top = elevL(c, e, d, H);
  return (horizonL(c, e, S.dMax) - base) / (top - base);
}

/** La courbure apparente pour laquelle fraction = f (bissection ; f décroît quand c croît). */
export function cForF(f, S) {
  let lo = 1e-6, hi = 5;
  for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (fraction(m, S) > f) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/** Le gradient moyen (K/m, de 2 m à l'œil) qu'il faut, d'après les rayons tracés, pour que le modèle donne f.
 * TR : [{shift, grad, globe, flat}] par gradient croissant ; f croît avec le gradient. null hors de la grille. */
export function gradFor(TR, model, f) {
  for (let i = 0; i + 1 < TR.length; i++) {
    const a = TR[i], b = TR[i + 1], fa = a[model], fb = b[model];
    if (fa == null || fb == null) continue;
    if ((fa - f) * (fb - f) <= 0 && fa !== fb) return a.grad + ((f - fa) / (fb - fa)) * (b.grad - a.grad);
  }
  return null;
}

/** La différence air − mer (K) qu'il faut pour que le modèle donne f, la colonne GFS gardée (fog : la mer seule plus
 * chaude ou plus froide sous le même air à 2 m). SA : [{dT, globe, flat}] par dT croissant ; première traversée ;
 * null si aucune valeur de la grille n'y arrive (le plan : f ne bouge presque pas). */
export function airSeaFor(SA, model, f) {
  for (let i = 0; i + 1 < SA.length; i++) {
    const a = SA[i], b = SA[i + 1], fa = a[model], fb = b[model];
    if (fa == null || fb == null) continue;
    if ((fa - f) * (fb - f) <= 0 && fa !== fb) return a.dT + ((f - fa) / (fb - fa)) * (b.dT - a.dT);
  }
  return null;
}

/** La même marge pour les deux modèles (2026-10-15, demande du propriétaire) : le gradient moyen qu'il faut sous
 * chacune des différences air − mer de TAS (fog : airSea = [la plus favorable au plan, bas de la fourchette des
 * modèles, GFS, ERA5, haut de la fourchette]). Rend { per: [gradient par air − mer], lo, hi : la fourchette sur les
 * air − mer des modèles (indices 1 à 4) et f ± σ, best : le plus proche de 0 sur toute la liste }. */
export function needAS(TR, TAS, model, f, fSd) {
  const rowsFor = (j) => TR.map((r, i) => ({ grad: r.grad, [model]: TAS[model][j][i] }));
  const per = TAS.airSea.map((_, j) => gradFor(rowsFor(j), model, f));
  const band = [];
  for (let j = 1; j < TAS.airSea.length; j++) for (const ff of [f - fSd, f, f + fSd]) { const g = gradFor(rowsFor(j), model, ff); if (g != null) band.push(g); }
  const ok = per.filter((g) => g != null);
  return { per, lo: band.length ? Math.min(...band) : null, hi: band.length ? Math.max(...band) : null,
    best: ok.length ? ok.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a)) : null };
}

/** f tracé pour un gradient donné (interpolation linéaire ; bornée aux bouts de la grille). */
export function fAtGrad(TR, model, g) {
  const ok = TR.filter((r) => r[model] != null);
  if (g <= ok[0].grad) return ok[0][model];
  for (let i = 0; i + 1 < ok.length; i++) {
    const a = ok[i], b = ok[i + 1];
    if (g <= b.grad) return a[model] + ((g - a.grad) / (b.grad - a.grad)) * (b[model] - a[model]);
  }
  return ok[ok.length - 1][model];
}

/** k d'un air uniforme de gradient g (K/m), pression P (hPa), température T (K) [Hirt 2010, éq. 2], et l'inverse. */
export const kFromGrad = (g, P, T) => (503 * P) / (T * T) * (0.0343 + g);
export const gradFromK = (k, P, T) => (k * T * T) / (503 * P) - 0.0343;
/** Gradient autoconvectif (K/m) : au-delà, l'air est plus dense en haut qu'en bas ; adiabatique sec. */
export const AUTOCONV = -0.0343, ADIABATIC = -0.0098;

/** Les nombres de la photo : la courbure qu'elle exige, k de chaque modèle, ce que donnent la lumière droite et
 * k = 0,13, et le gradient que chaque modèle exige d'après les rayons tracés (et sa fourchette pour f ± σ). */
export function lomNumbers(S, PH, AIR, TR, SA = [], TAS = null) {
  const f = PH.f, c = cForF(f, S);
  const need = (m) => ({ mid: gradFor(TR, m, f), lo: gradFor(TR, m, f - PH.fSd), hi: gradFor(TR, m, f + PH.fSd) });
  const needSA = (m) => ({ mid: airSeaFor(SA, m, f), lo: airSeaFor(SA, m, f - PH.fSd), hi: airSeaFor(SA, m, f + PH.fSd) });
  return {
    f, fSd: PH.fSd, c, kG: 1 - c, kF: -c, cLo: cForF(f + PH.fSd, S), cHi: cForF(f - PH.fSd, S),
    fStraight: fraction(1, S), fStd: fraction(1 - K, S), fFlatStraight: fraction(0, S), fFlatStd: fraction(-K, S),
    needG: need("globe"), needF: need("flat"), saG: needSA("globe"), saF: needSA("flat"),
    symG: TAS ? needAS(TR, TAS, "globe", f, PH.fSd) : null, symF: TAS ? needAS(TR, TAS, "flat", f, PH.fSd) : null,
    gradUniformG: gradFromK(1 - c, S.P, S.Tmid), gradUniformF: gradFromK(-c, S.P, S.Tmid),
    dayG: AIR.fGlobe, dayF: AIR.fFlat, dayGe: AIR.fGlobeEra, dayFe: AIR.fFlatEra,
    kDay: kFromGrad(AIR.grad, S.P, S.Tmid),
  };
}

/** Pixel (u, v) de la photo -> (azimut relatif au sommet, élévation) en rad, à la courbure c : l'échelle vient de la
 * hauteur du rocher (pxRad), l'inclinaison de l'horizon mesuré (horB) est retirée autour du sommet. */
export function photoToAnglesL(S, PH, c, u, v) {
  const du = u - PH.summitX, dv = v - PH.summitRow, s = PH.pxRad;
  const top = elevL(c, S.e, S.rock.d, S.Hw);
  return [(du + PH.horB * dv) / s, top - (dv - PH.horB * du) / s];
}

// ---- l'animation : une date, globe et plan côte à côte ----
// lumière droite → réfraction standard → la réfraction que chaque modèle exige (même image) → la photo se pose → retour.
const ease = (x) => x * x * (3 - 2 * x);
export const LSTEPS = [["straight", 1.2], ["toStd", 1.2], ["std", 0.6], ["toNeed", 1.6], ["photo", 6], ["toStraight", 1.4]];
export const LCYCLE = LSTEPS.reduce((s, [, d]) => s + d, 0);
export const lPhotoAt = () => LSTEPS.slice(0, LSTEPS.findIndex(([n]) => n === "photo")).reduce((s, [, d]) => s + d, 0) + 2.5;

/** État au temps t pour la courbure exigée c : { cG, cF (courbures apparentes), phase, since, photo }. */
export function ltimeline(t, c) {
  const x = ((t % LCYCLE) + LCYCLE) % LCYCLE;
  let u = x, k = 0;
  while (k < LSTEPS.length - 1 && u >= LSTEPS[k][1]) u -= LSTEPS[k++][1];
  const [phase, dur] = LSTEPS[k], f = ease(Math.min(1, u / dur));
  const G = { straight: 1, toStd: 1 - K * f, std: 1 - K, toNeed: 1 - K + (c - 1 + K) * f, photo: c, toStraight: c + (1 - c) * f };
  const F = { straight: 0, toStd: -K * f, std: -K, toNeed: -K + (c + K) * f, photo: c, toStraight: c * (1 - f) };
  return { cG: G[phase], cF: F[phase], phase, since: u, photo: phase === "photo" };
}

/** La vue décodée : par colonne d'azimut, les cellules visibles [distance (m), hauteur (m)] du plus proche au plus loin. */
export function decodeFanL(F) {
  const bin = typeof atob === "function" ? atob(F.b64) : Buffer.from(F.b64, "base64").toString("binary");
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const v = new Uint16Array(u8.buffer), cols = [];
  let p = 0;
  for (let j = 0; j < F.nAz; j++) {
    const n = v[p++], cells = [];
    for (let k = 0; k < n; k++) { cells.push([F.d[v[p]], v[p + 1] / F.q]); p += 2; }
    cols.push(cells);
  }
  return { ...F, cols, az: (j) => F.az0 + j * F.azStep };
}
