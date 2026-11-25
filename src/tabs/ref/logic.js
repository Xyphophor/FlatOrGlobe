// Logique pure de l'onglet ref (réfraction), portée à l'identique du
// legacy (flat-or-globe-2.20.0.html, ~L18319-18608 : les deux tables et le
// calculateur d'angles zénithaux réciproques). Séparée de index.js pour
// rester testable sans DOM/canvas (voir tasks/epic02/UC09.org).
//
// NOTE : cette page a UN k partagé entre onglets (toggle standard, borné à
// (0,1)), porté dans core/math.js comme `effectiveRadius`. La table de CET
// onglet balaie volontairement des k hors de cette plage (k = -1 et k = 1,
// pour montrer les deux limites), donc elle ne peut pas réutiliser
// `effectiveRadius` telle quelle -- k = -1 y renverrait R au lieu de R/2.
// D'où `refEffR` ci-dessous, qui suit exactement `Reff = k>=1 ? null :
// REF_R/(1-k)` du legacy plutôt que le garde-fou (0,1) de la fonction
// partagée.
import { DEG, horizonDist, hiddenHeight } from "../../core/math.js";

export const REF_R = 6371000; // m, le rayon moyen de la page
export const REF_P = 1013; // hPa, niveau de la mer
export const REF_T = 288; // K

/** Torge / Baselga : k = 503 (P/T²)(0.0342 + dT/dh), dT/dh en K/m. */
export const refK = (dTdh, P = REF_P, T = REF_T) => 503 * (P / (T * T)) * (0.0342 + dTdh);

/** Rayon effectif SANS le garde-fou (0,1) -- voir la note en tête de fichier. */
export const refEffR = (k) => (k >= 1 ? Infinity : REF_R / (1 - k));

const fmtKm = (m) => `${(m / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} km`;

// ---- table 1 : ce que coûte chaque k (rf-cap1 / #refKRows) ----
// Rangées documentées, pas un balayage lisse : chacune est un nombre que
// quelqu'un utilise vraiment.
export const REF_KS = [
  { k: 0, t: "ks-vacuum" },
  { k: 0.13, t: "ks-gauss" },
  { k: 0.143, t: "ks-716" },
  { k: 0.17, t: "ks-icao" },
  { k: 0.25, t: "ks-43earth" },
  { k: 0.34, t: "ks-max" },
  { k: 1, t: "ks-duct" },
  { k: -1, t: "ks-hotground" },
];

/** Une ligne de la table 1 : e = 2 m d'œil, d = 20 km de cible, comme le legacy. */
export function refKRow({ k, t }, e = 2, d = 20000) {
  const rho = k === 0 ? null : REF_R / k;
  const Reff = k >= 1 ? null : refEffR(k);
  const horizon = Reff === null ? "∞" : fmtKm(horizonDist(Reff, e));
  const hidden = Reff === null ? "0 m" : `${hiddenHeight(Reff, e, d).toFixed(0)} m`;
  return {
    k,
    t,
    rhoStr: rho === null ? "∞" : `${rho < 0 ? "−" : ""}${fmtKm(Math.abs(rho))}`,
    ratioStr: rho === null ? "∞" : `${(REF_R / rho).toFixed(2).replace("-", "−")}×`,
    reffStr: Reff === null ? "∞" : (Reff / REF_R).toFixed(3),
    horizon,
    hidden,
  };
}

// ---- table 2 : k depuis la météo (rf-cap2 / #refCondRows) ----
// dT/dh en K/m ; k est CALCULÉ par refK(), jamais tapé en dur -- c'est tout
// l'intérêt de la table : la même formule d'une ligne va du mirage au
// conduit sans jamais être réajustée.
export const REF_COND = [
  { dt: -0.2, c: "cond-c-asphalt", s: "cond-s-asphalt" },
  { dt: -0.0342, c: "cond-c-autoconv", s: "cond-s-autoconv" },
  { dt: -0.0179, c: "cond-c-sunny", s: "cond-s-sunny" },
  { dt: -0.0098, c: "cond-c-adiabatic", s: "cond-s-adiabatic" },
  { dt: -0.0065, c: "cond-c-icao", s: "cond-s-icao" },
  { dt: 0, c: "cond-c-isothermal", s: "cond-s-isothermal" },
  { dt: 0.02, c: "cond-c-night", s: "cond-s-night" },
  { dt: 0.129, c: "cond-c-inversion", s: "cond-s-inversion" },
];

export function refCondRow(row) {
  const k = refK(row.dt);
  return { ...row, k };
}

/**
 * Calculateur "expérience 1c" : deux angles zénithaux réciproques
 * simultanés + la longueur de ligne -> k. Réplique exacte d'`updateExpR()`
 * (legacy ~L18578).
 */
export function reciprocalK(zADeg, zBDeg, sKm) {
  const s = sKm * 1000;
  const gammaDeg = DEG(s / REF_R);
  const sum = zADeg + zBDeg;
  const exc = sum - 180;
  const k = 1 - exc / gammaDeg;
  const Reff = k < 1 ? refEffR(k) : Infinity;
  return { gammaDeg, sum, exc, k, Reff };
}

/**
 * Angle entre les normales de deux points donnés en latitude/longitude géodésiques
 * (″). Pour la Route 206 (2026-10-04) : la « divergence des verticales » γ d'une ligne
 * courte, lue sur des coordonnées GNSS. Ces directions sont celles des positions vues du
 * centre de masse (repère des satellites), corrigées de l'aplatissement : γ ≈ s/|r|, |r|
 * donné par les éphémérides -- le rayon entre ici (check), à toute distance.
 */
export function normalAngleArcsec([la1, lo1], [la2, lo2]) {
  const r = Math.PI / 180;
  const n = (la, lo) => [Math.cos(la * r) * Math.cos(lo * r), Math.cos(la * r) * Math.sin(lo * r), Math.sin(la * r)];
  const a = n(la1, lo1), b = n(la2, lo2);
  const c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  return (Math.atan2(Math.hypot(...c), a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / r) * 3600;
}
const dmsDeg = ([d, m, s]) => Math.sign(d) * (Math.abs(d) + m / 60 + s / 3600);
const zDeg = (z) => { const p = z.split(" ").map(Number); return p[0] + p[1] / 60 + p[2] / 3600; };

/** Route 206 MP 27-28, chaque session : excès mesuré ε, γ des coordonnées, k = 1 − ε/γ. */
export function r206Rows(R206, MARKS) {
  return R206.map((o) => {
    const [A, B] = MARKS[o.marks].map((m) => [dmsDeg(m.slice(0, 3)), dmsDeg(m.slice(3))]);
    const gamma = normalAngleArcsec(A, B), eps = (zDeg(o.z1) + zDeg(o.z2) - 180) * 3600;
    return { date: o.date, time: o.time || "", eps, gamma, k: 1 - eps / gamma };
  });
}
