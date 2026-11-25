// Coordonnées du ciel (onglet star, sections « sky-* », 2026-11-11) : ascension droite et
// déclinaison, ce qui les fait changer au fil des siècles (précession, mouvement propre) et ce
// qu'une latitude laisse voir. Fonctions pures, testées dans radec-logic.test.js.
//
// Données : Hipparcos (ESA 1997), tel que publié (src/data/presets/star-hip.js, `fog build star-hip`).
//  - mouvement propre : le vecteur unitaire de la position du catalogue avance en ligne droite,
//    u(t) = normalise(u0 + t (μα* eα + μδ eδ)), vitesse radiale prise nulle (ESA SP-1200, vol. 1, § 1.5.5,
//    sans son terme radial) ;
//  - précession : rotation autour du pôle de l'écliptique de J2000 à p = 5 028,796195″ par siècle
//    (Capitaine, Wallace & Chapront 2003, A&A 412, 567), obliquité tenue à 23,4392911° (Lieske et al. 1977).
//    Sur quelques siècles elle rejoint la série de Lieske de core/ephemeris.js (test) ; sur le tour
//    entier de 25 772 ans c'est une illustration (l'écliptique bouge aussi, le taux dérive) -- la page le dit.
import { HIP_EPOCH, HIP_BRIGHT, HIP_FAST } from "../../data/presets/star-hip.js";

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
export const OBLIQUITY = 23.4392911;            // degrés, J2000
export const PRECESSION = 50.28796195;          // secondes d'arc par an, en longitude
export const PRECESSION_PERIOD = 360 * 3600 / PRECESSION;   // ans : 25 772
const MAS = D2R / 3.6e6;                         // 1 mas en radians

export const vec = (raDeg, decDeg) => { const a = raDeg * D2R, d = decDeg * D2R; return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)]; };
export const radec = (v) => ({ ra: ((Math.atan2(v[1], v[0]) * R2D) % 360 + 360) % 360, dec: Math.asin(Math.max(-1, Math.min(1, v[2]))) * R2D });
export const sepDeg = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * R2D;

/** Ligne du catalogue [HIP, ra, dec, pmra, pmde, V, B−V] -> objet. */
const row = (r) => ({ hip: r[0], ra: r[1], dec: r[2], pmra: r[3], pmde: r[4], v: r[5], bv: r[6] });
export const BRIGHT = HIP_BRIGHT.map(row);
export const FAST = HIP_FAST.map(row);
const BY_HIP = new Map([...BRIGHT, ...FAST].map((s) => [s.hip, s]));
export const star = (hip) => BY_HIP.get(hip);

/** Direction de l'étoile (repère équatorial ICRS/J2000) à l'année donnée, par son seul mouvement propre. */
export function moved(s, year) {
  const dt = year - HIP_EPOCH, a = s.ra * D2R, d = s.dec * D2R;
  const u = vec(s.ra, s.dec), ea = [-Math.sin(a), Math.cos(a), 0], ed = [-Math.sin(d) * Math.cos(a), -Math.sin(d) * Math.sin(a), Math.cos(d)];
  const ka = s.pmra * MAS * dt, kd = s.pmde * MAS * dt;
  const v = [u[0] + ka * ea[0] + kd * ed[0], u[1] + ka * ea[1] + kd * ed[1], u[2] + ka * ea[2] + kd * ed[2]];
  const L = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / L, v[1] / L, v[2] / L];
}
/** Mouvement propre total, secondes d'arc par an. */
export const pmTotal = (s) => Math.hypot(s.pmra, s.pmde) / 1000;

const ce = Math.cos(OBLIQUITY * D2R), se = Math.sin(OBLIQUITY * D2R);
// rotation de l'angle psi (degrés) autour du pôle de l'écliptique, vecteur donné et rendu en équatorial
function rotEcl(v, psiDeg) {
  const x = v[0], y = v[1] * ce + v[2] * se, z = -v[1] * se + v[2] * ce;
  const c = Math.cos(psiDeg * D2R), s = Math.sin(psiDeg * D2R);
  const x2 = x * c - y * s, y2 = x * s + y * c;
  return [x2, y2 * ce - z * se, y2 * se + z * ce];
}
/** Angle de précession depuis J2000, degrés. */
export const precAngle = (year) => (year - 2000) * PRECESSION / 3600;
/** Un vecteur J2000 exprimé dans l'équateur et l'équinoxe de l'année (les longitudes écliptiques croissent). */
export const toDate = (v, year) => rotEcl(v, precAngle(year));
/** Le pôle nord céleste de l'année, dans le repère J2000 (il recule sur son cercle). */
export const poleAt = (year) => rotEcl([0, 0, 1], -precAngle(year));
/** Le point vernal (ascension droite zéro) de l'année, dans le repère J2000. */
export const equinoxAt = (year) => rotEcl([1, 0, 0], -precAngle(year));
/** Ascension droite et déclinaison d'une étoile dans le repère de l'année, mouvement propre compris ou non. */
export function coordsAt(s, year, { pm = true, prec = true } = {}) {
  const v = pm ? moved(s, year) : moved(s, 2000);
  return radec(prec ? toDate(v, year) : v);
}
/** Pôle de l'écliptique (repère J2000). */
export const ECL_POLE = [0, -se, ce];

/* ---- ce qu'une latitude laisse voir ----------------------------------------------------- */
/** Hauteur d'une étoile à son passage au méridien, degrés (négative : elle ne se lève jamais). */
export const maxAlt = (lat, dec) => 90 - Math.abs(lat - dec);
/** Hauteur à son passage inférieur (positive : elle ne se couche jamais). */
export const minAlt = (lat, dec) => Math.abs(lat + dec) - 90;
export const cls = (lat, dec) => (maxAlt(lat, dec) <= 0 ? "never" : minAlt(lat, dec) >= 0 ? "always" : "rises");
/** Part de la sphère céleste qui passe au-dessus de l'horizon d'une latitude : (1 + cos φ)/2. */
export const skyFraction = (lat) => (1 + Math.cos(lat * D2R)) / 2;
/** Déclinaison limite : tout ce qui est au-delà (vers le pôle caché) ne se lève jamais. */
export const decLimit = (lat) => (lat >= 0 ? lat - 90 : lat + 90);

/** 101,29° -> { h: 6, m: 45 } (une heure d'ascension droite = 15°). */
export function hm(raDeg) { let t = Math.round(((raDeg % 360) + 360) % 360 * 4); if (t >= 1440) t -= 1440; return { h: Math.floor(t / 60), m: t % 60 }; }

/* ---- les étoiles nommées et les astérismes (numéros HIP ; vérifiés contre le catalogue de Yale de l'onglet, test) ---- */
export const NAMED = {
  polaris: 11767, vega: 91262, arcturus: 69673, capella: 24608, betelgeuse: 27989, rigel: 24436, sirius: 32349,
  canopus: 30438, acrux: 60718, rigilkent: 71683, thuban: 68756, spica: 65474, achernar: 7588, aldebaran: 21421,
  deneb: 102098, kochab: 72607, alderamin: 105199, dubhe: 54061, alkaid: 67301, barnard: 87937, kapteyn: 24186, groombridge: 57939, cyg61: 104214,
};
export const NAMES = {
  polaris: "Polaris", vega: "Vega", arcturus: "Arcturus", capella: "Capella", betelgeuse: "Betelgeuse", rigel: "Rigel", sirius: "Sirius",
  canopus: "Canopus", acrux: "Acrux", rigilkent: "α Centauri", thuban: "Thuban", spica: "Spica", achernar: "Achernar", aldebaran: "Aldebaran",
  deneb: "Deneb", kochab: "Kochab", alderamin: "Alderamin", dubhe: "Dubhe", alkaid: "Alkaid", barnard: "Barnard's star", kapteyn: "Kapteyn's star", groombridge: "Groombridge 1830", cyg61: "61 Cygni",
};
export const named = (k) => star(NAMED[k]);
const chain = (...h) => h.slice(1).map((b, i) => [h[i], b]);
export const ASTERISMS = {
  dipper: chain(54061, 53910, 58001, 59774, 54061).concat(chain(59774, 62956, 65378, 67301)),   // Dubhe Merak Phecda Megrez · Alioth Mizar Alkaid
  orion: chain(27989, 25336, 25930, 24436, 27366, 26727, 27989).concat(chain(25930, 26311, 26727)),
  crux: [[60718, 61084], [62434, 59747]],
  cassiopeia: chain(746, 3179, 4427, 6686, 8886),
};
export const DIPPER = [54061, 53910, 58001, 59774, 62956, 65378, 67301];

/** Les six lieux de l'animation des latitudes (ceux de l'onglet, Natural Earth) et les étoiles citées pour chacun. */
export const VIS_SPOTS = [
  { n: "Tromsø", lat: 69.6351, ex: ["sirius", "canopus", "acrux"] },
  { n: "Paris", lat: 48.8686, ex: ["sirius", "canopus", "acrux"] },
  { n: "Cairo", lat: 30.0519, ex: ["sirius", "canopus", "acrux"] },
  { n: "Quito", lat: -0.2130, ex: ["polaris", "vega", "acrux"] },
  { n: "Melbourne", lat: -37.8181, ex: ["arcturus", "vega", "polaris"] },
  { n: "Ushuaia", lat: -54.79, ex: ["arcturus", "vega", "polaris"] },
];
export const VIS_STARS = ["polaris", "capella", "vega", "arcturus", "betelgeuse", "sirius", "canopus", "rigilkent", "acrux"];
