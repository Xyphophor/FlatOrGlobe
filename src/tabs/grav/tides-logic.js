// Onglet grav, section des marées (epic37/UC01, 2026-11-13). Calculs purs, testés (tides-logic.test.js) :
// la marée vue comme la DIFFÉRENCE entre l'attraction de la Lune en un point et au centre de la Terre, ce que
// Kepler III dit du rapport Soleil/Lune sans aucune distance, les périodes, et le meilleur modèle plat (une Lune
// proche qui attire l'eau d'un plan). Les marégraphes : src/data/presets/grav-tides.js (fog build grav-tides).
import { TIDE_GAUGES } from "../../data/presets/grav-tides.js";

// Périodes publiées (NASA NSSDCA, Moon Fact Sheet) : mois sidéral, année sidérale, rapport des masses, excentricité.
export const T_MONTH = 27.3217, T_YEAR = 365.2564, T_SYN = 29.5306, T_TROP = 27.3216, T_ANOM = 27.5546;
export const MASS_RATIO = 81.3006;            // M_Terre / M_Lune
export const E_MOON = 0.0549;                 // excentricité de l'orbite de la Lune
export const D_MOON = 60.27;                  // distance moyenne de la Lune, en rayons terrestres (dessin seulement)

// Vitesses (°/h) des raies, Schureman 1958, table 1 (les mêmes que fog build grav-tides).
export const SPEED = { M2: 28.9841042, S2: 30.0, N2: 28.4397295, K2: 30.0821373, K1: 15.0410686, O1: 13.9430356 };
export const periodH = (name) => 360 / SPEED[name];
/** Battement de deux raies (jours) : vives-eaux/mortes-eaux pour M2/S2, cycle tropique pour K1/O1. */
export const beatDays = (a, b) => 360 / Math.abs(SPEED[a] - SPEED[b]) / 24;

// Coefficients du potentiel générateur (Cartwright & Tayler 1971, table 4) : la marée d'équilibre de chaque raie.
export const EQUI = { M2: 0.63194, S2: 0.29400, N2: 0.12099, K2: 0.07996, K1: 0.36878, O1: 0.26221, P1: 0.12203, Q1: 0.05020 };
export const equiRatio = (a, b) => EQUI[a] / EQUI[b];

/**
 * Kepler III : GM/d³ = (2π/T)². La marée d'un astre va comme GM/d³ ; pour la Lune, G(M_T + M_L)/d³ = (2π/T_mois)²,
 * dont la part de la Lune est M_L/(M_T + M_L). Rapport Soleil/Lune = (T_mois/T_an)² × (1 + M_T/M_L) : aucune distance.
 */
export function keplerRatio(tm = T_MONTH, ty = T_YEAR, q = MASS_RATIO) { return (tm / ty) ** 2 * (1 + q); }

/** Kepler I : la Lune sur son ellipse, 1/d³ ≈ (1/a³)(1 + 3e cos M) et l'équation du centre 2e sin M donnent N2/M2 = 7e/2. */
export const ellipseN2 = (e = E_MOON) => 3.5 * e;

/**
 * Attraction différentielle (marée) en un point de la surface, Terre de rayon 1, Lune à distance D sur l'axe +x,
 * en unités de GM_L/D² (l'attraction au centre vaut 1). Exact : a = d/|d|³ − D/D³, renvoyée × D².
 */
export function tidalAccel(theta, D = D_MOON) {
  const px = Math.cos(theta), py = Math.sin(theta), dx = D - px, dy = -py, r3 = Math.hypot(dx, dy) ** 3;
  const ax = (dx / r3) * D * D, ay = (dy / r3) * D * D;
  return { pull: [ax, ay], tide: [ax - 1, ay] };
}

/** Hauteur d'équilibre (forme seule) : (3 cos² θ − 1)/2, θ angle au point sous la Lune. Deux bosses, à 0 et à 180°. */
export const equiShape = (theta) => (3 * Math.cos(theta) ** 2 - 1) / 2;

/**
 * Le meilleur modèle plat : une Lune ponctuelle à la hauteur H (km) au-dessus d'un plan, l'eau suit le potentiel de
 * son attraction, h(x) ∝ 1/√(x² + H²) (x distance au point sous la Lune). Une seule bosse, sous la Lune, quels que
 * soient H et la masse : le niveau ne fait que baisser quand on s'éloigne. Renvoyé normalisé à 1 sous la Lune.
 */
export const flatShape = (x, H) => H / Math.hypot(x, H);

/**
 * Hauteur en un port, en unités de la bosse de la Lune : la Lune et le Soleil à angle horaire H_L, H_S (rad), la
 * déclinaison de la Lune δ (rad), la latitude φ. Marée d'équilibre complète (P₂), sans retard ni bassin : c'est
 * ce que le globe prédit au premier ordre, avant que la mer ne réponde à sa manière.
 */
export function portHeight(HL, HS, phi, dec = 0, sunRatio = keplerRatio(), decS = 0) {
  const cz = (H, d) => Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
  const p2 = (c) => (3 * c * c - 1) / 2;
  return p2(cz(HL, dec)) + sunRatio * p2(cz(HS, decS));
}

/** Les cinq marégraphes, avec leurs rapports et leur forme (UHSLC 2018, fog build grav-tides). */
export function gaugeRows() {
  return TIDE_GAUGES.map((g) => {
    const H = (n) => g.cs[n][0], F = g.form;
    const kind = F < 0.25 ? "semi" : F < 1.5 ? "mixsemi" : F <= 3 ? "mixdiur" : "diur";
    return { key: g.key, name: g.name, kind, form: F, M2: H("M2"), S2: H("S2"), K1: H("K1"), O1: H("O1"),
      s2m2: H("S2") / H("M2"), n2m2: H("N2") / H("M2"), k1o1: H("K1") / H("O1"),
      pSemiH: 24 / g.fSemi, pDiurH: 24 / g.fDiur, pRange: g.pRange, age: g.age, explained: g.explained, rms: g.rms, n: g.n };
  });
}

/* ---- prédire la marée d'un marégraphe à partir de ses constantes (UC06, 2026-11-14) ----------------------------
   Le même calcul que tools/internal/tide (Arg, Astro, Nodal) : arguments d'équilibre par les nombres de Doodson et
   les longitudes moyennes de Meeus, corrections nodales de Schureman/Foreman. Les phases g de grav-ticon sont
   écrites dans cette convention (fog build grav-ticon). */
const DOODSON = { M2: [[2, 0, 0, 0, 0, 0], "M2"], S2: [[2, 2, -2, 0, 0, 0], "1"], N2: [[2, -1, 0, 1, 0, 0], "M2"], K2: [[2, 2, 0, 0, 0, 0], "K2"],
  K1: [[1, 1, 0, 0, 0, 0], "K1"], O1: [[1, -1, 0, 0, 0, 0], "O1"], P1: [[1, 1, -2, 0, 0, 0], "1"], Q1: [[1, -2, 0, 1, 0, 0], "O1"] };
/** τ, s, h, p, N, p₁ (degrés) à un temps Unix (s) : Meeus 1998, 47.1-47.7 et 25.3, premiers termes ; τ = 15° × TU + 180° + h − s. */
export function astro(ts) {
  const T = (ts / 86400 + 2440587.5 - 2451545.0) / 36525;
  const s = 218.3165 + 481267.8813 * T, h = 280.4661 + 36000.7698 * T, p = 83.3535 + 4069.0137 * T, N = 125.0445 - 1934.1363 * T, p1 = 282.9384 + 1.7195 * T;
  return [15 * ((((ts / 3600) % 24) + 24) % 24) + 180 + h - s, s, h, p, N, p1];
}
/** (f, u en degrés) d'une classe nodale (Schureman 1958, table 14 ; Foreman 1977, annexe 2). */
export function nodal(cls, N) {
  const n = N * Math.PI / 180, c = Math.cos, s = Math.sin;
  switch (cls) {
    case "1": return [1, 0];
    case "M2": return [1.0004 - 0.0373 * c(n) + 0.0002 * c(2 * n), -2.14 * s(n)];
    case "K1": return [1.0060 + 0.1150 * c(n) - 0.0088 * c(2 * n), -8.86 * s(n) + 0.68 * s(2 * n) - 0.07 * s(3 * n)];
    case "O1": return [1.0089 + 0.1871 * c(n) - 0.0147 * c(2 * n), 10.8 * s(n) - 1.34 * s(2 * n) + 0.19 * s(3 * n)];
    case "K2": return [1.0241 + 0.2863 * c(n) + 0.0083 * c(2 * n), -17.74 * s(n) + 0.68 * s(2 * n) - 0.04 * s(3 * n)];
  }
  throw new Error("nodal class " + cls);
}
/** Pour chaque raie : [f, V + u en radians] à l'instant ts ; calculé une fois par image, servi à toutes les stations. */
export function args(ts, names = Object.keys(DOODSON)) {
  const a = astro(ts), x = [a[0], a[1], a[2], a[3], -a[4], a[5]], out = {};
  for (const n of names) { const [d, cls] = DOODSON[n]; let V = 0; for (let i = 0; i < 6; i++) V += d[i] * x[i]; const [f, u] = nodal(cls, a[4]); out[n] = [f, (V + u) * Math.PI / 180]; }
  return out;
}
/** Hauteur (mêmes unités que H) : Σ f H cos(V + u − g). cs = { nom: [H, g en degrés] }. */
export function predict(cs, A) {
  let h = 0; for (const n in A) { const c = cs[n]; if (c) h += A[n][0] * c[0] * Math.cos(A[n][1] - c[1] * Math.PI / 180); }
  return h;
}

/* ---- marée d'équilibre en un point, Lune et Soleil à leurs positions (scène du globe) ------------------------- */
const M_SUN = 332946.0487;        // M_Soleil / M_Terre (IAU 2015)
/** Hauteur d'équilibre (m) : Σ (M/M_T)(R/d)³ R (3cos²z − 1)/2 ; cos z par la déclinaison et l'angle horaire (rad). */
export function equiHeight(lat, cosHL, decL, dKm, cosHS = null, decS = 0, dAU = 1) {
  const R = 6371.0, sl = Math.sin(lat), cl = Math.cos(lat), p2 = (c) => (3 * c * c - 1) / 2;
  let h = (1 / MASS_RATIO) * (R / dKm) ** 3 * R * 1000 * p2(sl * Math.sin(decL) + cl * Math.cos(decL) * cosHL);
  if (cosHS !== null) h += M_SUN * (R / (dAU * 149597870.7)) ** 3 * R * 1000 * p2(sl * Math.sin(decS) + cl * Math.cos(decS) * cosHS);
  return h;
}
