// Logique pure de l'onglet surv (nivellement / géodésie), portée du legacy
// (drawSurvey ~L18015, svTabZen/svRadii ~L28610-28680). Tout est
// documenté et sans curseur utilisateur : ces fonctions ne font que
// recomputer ce que les tableaux publiés affirment.
import { DEG, RAD } from "../../core/math.js";

export const SURV_R = 6371, SURV_K = 0.13; // km ; k standard de la page

/** Flèche (bulge) d'une corde de longueur d (km) : d²/8R, en mètres. */
export const sagittaM = (dKm, Rkm = SURV_R) => ((dKm * dKm) / (8 * Rkm)) * 1000;
/** Correction de courbure d'une visée de longueur d (km) : d²/2R, en mètres ; refracted -> R/(1-k). */
export const dropM = (dKm, Rkm = SURV_R, refracted = false) => ((dKm * dKm) / (2 * (refracted ? Rkm / (1 - SURV_K) : Rkm))) * 1000;

/**
 * Excès sphérique d'un triangle équilatéral de côté s (km) sur une sphère de
 * rayon R : forme close du legacy, cos A = cos σ / (1 + cos σ), σ = s/R.
 * Retour en secondes d'arc. Gauss (82,2 km équivalent) -> 14,86″.
 */
export function equilateralExcessArcsec(sideKm, Rkm = SURV_R) {
  const sigma = sideKm / Rkm;
  const A = Math.acos(Math.cos(sigma) / (1 + Math.cos(sigma)));
  return DEG(3 * A - Math.PI) * 3600;
}
/** Approximation aire/R² pour comparaison : ε ≈ (√3/4) s² / R², en secondes d'arc. */
export const excessAreaArcsec = (sideKm, Rkm = SURV_R) => DEG(((Math.sqrt(3) / 4) * sideKm * sideKm) / (Rkm * Rkm)) * 3600;

/** "91 08 09" -> degrés décimaux. */
export function dms(s) { const p = s.split(" ").map(Number); return p[0] + p[1] / 60 + p[2] / 3600; }

/**
 * Une ligne du tableau des angles zénithaux réciproques NGS 1977 (svTabZen)
 * : excès de la somme sur 180°, k déduit sur un globe, k qu'exigerait un
 * plan, et le gradient de température que ce k plan impliquerait.
 */
export function zenRow(o) {
  const R = SURV_R * 1000;
  const a = RAD(180 - (dms(o.z1) + dms(o.z2))); // rad, négatif quand la somme dépasse 180
  const kG = ((2 * (o.d / (2 * R) + a / 2)) / o.d) * R;
  const cF = a / o.d, kF = cF * R;
  const T = 288.15 - 0.0065 * o.h;
  const P = 1013.25 * Math.pow((288.15 - 0.0065 * o.h) / 288.15, 5.26);
  const dT = ((12660 * cF * T * T) / P - 0.0343) * 1000;
  return { dKm: o.d / 1000, excessArcmin: -DEG(a) * 60, kGlobe: kG, kPlane: kF, dTPlane: dT };
}

/** Rayon apparent de chaque couple : d / (ζ₁ + ζ₂ − 180°), puis corrigé (1−k). */
export function radiiFromPairs(SV_TRI, SV_ZEN) {
  const raw = [];
  for (const t of SV_TRI) raw.push(t[0] / RAD(t[1] + t[2] - 180));
  for (const o of SV_ZEN) raw.push(o.d / 1000 / RAD(dms(o.z1) + dms(o.z2) - 180));
  return { raw, corrected: raw.map((x) => (1 - SURV_K) * x) };
}

/** Statistiques de boîte à moustaches (ctStats du legacy). */
export function stats(values) {
  const v = values.slice().sort((a, b) => a - b), n = v.length;
  const q = (p) => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return v[lo] + (v[hi] - v[lo]) * (i - lo); };
  const q1 = q(0.25), med = q(0.5), q3 = q(0.75), iqr = q3 - q1;
  const inl = v.filter((x) => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr);
  return { n, q1, med, q3, lo: inl[0], hi: inl[inl.length - 1], out: v.filter((x) => x < q1 - 1.5 * iqr || x > q3 + 1.5 * iqr), mean: v.reduce((a, b) => a + b, 0) / n };
}

/**
 * Rayon apparent d'une paire réciproque, sans k (2026-10-04) : la sphère dont les
 * normales s'écartent de ε = ζ₁ + ζ₂ − 180° et sur laquelle la corde entre les deux
 * stations (altitudes h₁, h₂ en m) vaut la distance EDM s (m). Loi des cosinus résolue
 * par dichotomie ; renvoie ρ en km. Entrées : une longueur mesurée au sol, deux angles
 * locaux, deux altitudes -- le rayon n'entre nulle part. Proche de s/ε − h̄.
 */
export function apparentRadiusKm(s, epsRad, h1 = 0, h2 = 0) {
  let lo = 1e3, hi = 1e10;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2, a = m + h1, b = m + h2;
    if (Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(epsRad)) > s) hi = m; else lo = m;
  }
  return lo / 1000;
}
const excess = (z1, z2) => RAD(dms(z1) + dms(z2) - 180);

/** Les sept lignes McDonald 1977 : distance EDM, excès, rayon apparent, EDM − corde des coordonnées. */
export function mcdRows(MCD, hBaldyFt, FT) {
  return MCD.map((o) => {
    const eps = excess(o.z1, o.z2);
    return { to: o.to, sKm: o.s / 1000, epsArcsec: DEG(eps) * 3600, R: apparentRadiusKm(o.s, eps, hBaldyFt * FT, o.hFt * FT), dEdm: o.s - o.xyz };
  });
}

/** Les lignes de Kozlowski mesurées à la station totale : distance (m), excès (″), rayon apparent (km). */
export function kozRows(KOZ) {
  const out = [];
  for (const g of KOZ) for (const [d, u, z1, z2] of g.lines) {
    const s = d * u, eps = excess(z1, z2);
    out.push({ p: g.p, date: g.date, s, epsArcsec: DEG(eps) * 3600, R: s / eps / 1000 });
  }
  return out;
}

/** Pente ε = s/ρ ajustée à l'origine (moindres carrés, erreur d'angle égale partout) : ρ en km. */
export const fitThroughOrigin = (rows) => rows.reduce((a, r) => a + r.s * r.s, 0) / rows.reduce((a, r) => a + r.s * RAD(r.epsArcsec / 3600), 0) / 1000;
