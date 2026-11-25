// Logique pure de l'onglet "twi" (aube et crépuscule), portée à
// l'identique du legacy (flat-or-globe-2.20.0.html, ~L23492-23680 formules
// et tableaux, ~L23940-23975 helpers du panneau "monde", ~L24235 lectures).
// Voir tasks/epic02/UC06.org.
//
// RÈGLES HÉRITÉES :
//  * aucun bouton utilisateur au-delà du calculateur d'expérience (directive
//    1 du propriétaire) : chaque tableau est CALCULÉ depuis les deux formules
//    que la prose dérive -- plafond d'ombre h = R(sec θ − 1), éclairement plat
//    E(d) = I H/(H² + d²)^{3/2} et la relation de taille E/E0 = (ϑ/ϑ0)³.
//  * la réfraction n'est PAS appliquée ici (le crépuscule fait 18° de
//    profondeur, le budget de réfraction à l'horizon est 34' : R_eff bougerait
//    ces nombres de bien moins d'un pour cent). Ne pas câbler k dans cet onglet.
//  * les durées utilisent le soleil moyen, lever à −0°50′ (centre du disque).
import { RAD, DEG } from "../../core/math.js";
import { sunDecl, sunEoT } from "../sun/logic.js";
import { makeAE } from "../../core/aeproj.js";

export const TWI_R = 6371; // km (le legacy lisait #radius de l'onglet sim ; défaut 6371)
export const TWI_RIM = 20000; // km, bord de la carte plate standard (même bord que grav/mag)
export const TWI_SD = 32.0; // arcmin, diamètre apparent du Soleil (valeur ronde ; 31.6'-32.7' sur l'année)
export const TWI_RATE = 15.041; // deg/h, un tour par jour sidéral (convention partagée avec dip)
export const TWI_SUNUP = -50 / 60; // deg, altitude conventionnelle du centre du Soleil au lever (−0°50′)
export const TWI_OBLIQ = 23.44; // deg
export const TWI_MOON = 384400; // km, distance Terre-Lune moyenne (échelle)
export const TWI_MEAS = 1e-8; // rapport jour/nuit mesuré de la lumière descendante, srep26756
export const TWI_HEIGHTS = [1000, 3000, 5000, 10000]; // km, hauteurs de Soleil plat proposées
export const TWI_STAGES = [
  { end: 0, key: "sunset" },
  { end: -6, key: "civil" },
  { end: -12, key: "naut" },
  { end: -18, key: "astro" },
];
export const TWI_PLACES = [
  { n: "Quito", p: -0.22 },
  { n: "Nice", p: 43.70 },
  { n: "Paris", p: 48.86 },
  { n: "London", p: 51.51 },
  { n: "Copenhagen", p: 55.68 },
  { n: "Saint Petersburg", p: 59.94 },
  { n: "Reykjavík", p: 64.13 },
  { n: "Ushuaia", p: -54.80 },
];

// ---- plafond d'ombre --------------------------------------------------------
export const twiSec = (d) => 1 / Math.cos(RAD(d));
/** Hauteur du plafond de l'ombre au-dessus de l'observateur, km. */
export const twiCeil = (R, thetaDeg) => R * (twiSec(Math.abs(thetaDeg)) - 1);

/** Clé de la couche atmosphérique (texte via i18n) suivant la hauteur CALCULÉE. */
export function twiLayerKey(hkm) {
  if (hkm < 1) return "layer-ground";
  if (hkm < 60) return "layer-strato";
  if (hkm < 200) return "layer-thermo";
  return "layer-iss";
}

// ---- modèle plat : éclairement au sol et taille apparente, relatifs à midi ---
export const twiFlatE = (H, d) => Math.pow(H / Math.hypot(H, d), 3);
export const twiFlatTh = (H, d) => H / Math.hypot(H, d);
/** Le H qui rendrait la nuit plate aussi sombre que la nuit mesurée, à distance d. */
export const twiFlatH = (ratio, d) => d / Math.sqrt(Math.pow(ratio, -2 / 3) - 1);
/** Inverse : distance sur le plan à laquelle la lumière tombe à une fraction donnée de midi. */
export const twiFlatD = (ratio, H) => H * Math.sqrt(Math.pow(ratio, -2 / 3) - 1);

// ---- astronomie sphérique : angles horaires, durées d'étapes, altitude de minuit
/**
 * Angle horaire (deg) auquel le Soleil est à l'altitude h, ou une sentinelle :
 *   "never"  -- le Soleil ne monte jamais si haut ce jour-là
 *   "always" -- le Soleil ne descend jamais si bas ce jour-là
 */
export function twiHA(hDeg, phi, dec) {
  const c = (Math.sin(RAD(hDeg)) - Math.sin(RAD(phi)) * Math.sin(RAD(dec))) / (Math.cos(RAD(phi)) * Math.cos(RAD(dec)));
  if (c > 1) return "never";
  if (c < -1) return "always";
  return DEG(Math.acos(c));
}
/** Durée (min) de l'étape entre les altitudes hi et lo (hi au-dessus de lo), ou { all } / { none }. */
export function twiSpan(phi, dec, hi, lo) {
  const a = twiHA(hi, phi, dec), b = twiHA(lo, phi, dec);
  if (b === "always") return { all: true };
  if (a === "never") return { none: true };
  if (b === "never") return { all: true };
  return { min: ((b - a) / TWI_RATE) * 60 };
}
export const twiMidnightAlt = (phi, dec) => Math.abs(phi + dec) - 90;
/** Latitude au-delà de laquelle une étape ne finit jamais, pour une déclinaison donnée. Sans rayon. */
export const twiThreshold = (stageDeg, dec) => 90 - Math.abs(stageDeg) - Math.abs(dec);

// ---- hauteur angulaire de l'ombre de la Terre dans le ciel oriental --------
// Dérivée, pas ajustée : sur une visée à altitude a, lumière au-delà de s si
//   s · sin(a − θ) > R (1 − cos θ).
export const TWI_SHADOW_H = [10, 15, 20]; // km, sommets effectifs de la couche diffusante
export const TWI_SHADOW_TH = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
/** Distance le long d'un rayon à altitude a à laquelle il atteint la hauteur H. */
export function twiRayToH(aDeg, H, R = TWI_R) {
  const Rs = R * Math.sin(RAD(aDeg));
  return -Rs + Math.sqrt(Rs * Rs + 2 * R * H + H * H);
}
/** Dépression du Soleil à laquelle l'ombre avale tout le ciel. */
export const twiThetaZ = (H, R = TWI_R) => DEG(Math.acos(1 / (1 + H / R)));
/** Altitude du sommet du segment sombre ; null une fois passé le zénith. */
export function twiShadowTop(thDeg, H, R = TWI_R) {
  const need = R * (1 - Math.cos(RAD(thDeg)));
  const f = (a) => twiRayToH(a, H, R) * Math.sin(RAD(a - thDeg)) - need;
  if (f(90) < 0) return null;
  let lo = thDeg + 1e-9, hi = 90;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
  return hi;
}

// ---- panneau "monde" : point subsolaire, carte AE, rampe de couleur ---------
/** Point subsolaire au jour N et à l'heure UTC t, depuis le jeu NOAA de l'onglet sun. */
export function twiwSubsolar(N, t) {
  const lat = DEG(sunDecl(N));
  let lon = 15 * (12 - t - sunEoT(N) / 60);
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;
  return { lat, lon };
}
export const twiwUnit = (lat, lon) => {
  const a = RAD(lat), b = RAD(lon);
  return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
};
/** Angle horaire auquel l'altitude h est atteinte à la latitude phi -- null si inatteignable. */
export function twiwHA(h, phi, dec) {
  const c = (Math.sin(RAD(h)) - Math.sin(RAD(phi)) * Math.sin(RAD(dec))) / (Math.cos(RAD(phi)) * Math.cos(RAD(dec)));
  return c > 1 || c < -1 ? null : DEG(Math.acos(c));
}
/**
 * Carte plate : azimutale équidistante polaire nord, en unités-degrés (rayon = colatitude). epic18 : délègue
 * au moteur commun (src/core/aeproj.js) ; même convention qu'avant (x = −r sin λ, y = −r cos λ), testée.
 */
const TWI_POLAR = makeAE();
export function twiAE(lat, lon) {
  const [x, y] = TWI_POLAR.fwd(lat, lon);
  return { x: -x, y };
}
export const TWI_KM_PER_DEG = (Math.PI * TWI_R) / 180; // 111.19 km par degré d'arc

export const TWIW_CAL = 45; // latitude à laquelle le modèle plat est calibré, en sa faveur
export const TWIW_H = 5000; // km, hauteur habituelle du Soleil plat (partagée avec le graphe de chute)
export const TWIW_PRESETS = { jul: { N: 189, utc: 11.25 }, eqx: { N: 80, utc: 12 }, dec: { N: 355, utc: 12 } };
const TWIW_STOPS = [
  [90, [255, 253, 246]], [0, [243, 236, 216]], [-6, [185, 195, 212]],
  [-12, [126, 139, 163]], [-18, [76, 86, 112]], [-30, [43, 49, 64]],
];
/** Rampe altitude du Soleil (deg) -> [r,g,b]. Lambert dans le jour, interpolation SCHÉMATIQUE dans le crépuscule. */
export function twiwColour(alt) {
  const S = TWIW_STOPS;
  if (alt >= S[0][0]) return S[0][1];
  for (let i = 0; i < S.length - 1; i++) {
    if (alt <= S[i][0] && alt >= S[i + 1][0]) {
      const f = (S[i][0] - alt) / (S[i][0] - S[i + 1][0]), a = S[i][1], b = S[i + 1][1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }
  }
  return S[S.length - 1][1];
}
/**
 * Rayons (unités-degrés sur la carte AE) des quatre anneaux du modèle plat
 * "ajusté" : chaque anneau est épinglé pour que le plan soit exactement juste
 * à TWIW_CAL° N à cet instant (le passage du soir ; le passage du matin est à
 * la même distance carte par symétrie de la projection).
 */
export function twiwZones(sub) {
  const Sm = twiAE(sub.lat, sub.lon);
  return [0, -6, -12, -18].map((a) => {
    const ha = twiwHA(a, TWIW_CAL, sub.lat);
    if (ha === null) return { a, r: null };
    const P = twiAE(TWIW_CAL, sub.lon + ha);
    return { a, r: Math.hypot(P.x - Sm.x, P.y - Sm.y) };
  });
}
/** Altitude "équivalente" du modèle plat ajusté à distance carte d (unités-degrés) du point subsolaire. */
export function twiwFitAlt(d, zones) {
  let alt = -30;
  for (let z = 0; z < zones.length; z++) {
    const cur = zones[z], nx = zones[z + 1];
    if (cur.r === null) continue;
    if (d <= cur.r) {
      const inner = z === 0 ? 0 : zones[z - 1].r;
      alt = z === 0 ? 90 * (1 - d / cur.r) : cur.a + (6 * (cur.r - d)) / (cur.r - (inner === null ? 0 : inner));
      break;
    }
    if (!nx || nx.r === null) alt = cur.a - 12;
  }
  return alt;
}

// ---- formats -----------------------------------------------------------------
export const twiNum = (n) => Math.round(n).toLocaleString("en-US").replace("-", "−");
export const twiDeg = (n) => n.toFixed(1).replace("-", "−") + "°";
export const twiwFmtLon = (v) => Math.abs(v).toFixed(1) + "° " + (v < 0 ? "W" : "E");
export const twiwFmtLat = (v) => Math.abs(v).toFixed(1) + "° " + (v < 0 ? "S" : "N");
export function twiwUTC(t) {
  const h = Math.floor(t), m = Math.round((t - h) * 60);
  return String(m === 60 ? h + 1 : h).padStart(2, "0") + ":" + String(m === 60 ? 0 : m).padStart(2, "0") + " UTC";
}

// ---- tableaux (données pures, le rendu HTML est dans index.js) --------------
export function twiHtRows(R = TWI_R) {
  return TWI_STAGES.map((s) => { const h = twiCeil(R, s.end); return { key: s.key, end: s.end, h, frac: (h / R) * 100, layer: twiLayerKey(h) }; });
}
export function twiFlatRows(d = TWI_RIM) {
  const row = (H, forced) => {
    const E = twiFlatE(H, d), th = twiFlatTh(H, d) * TWI_SD;
    return { H, d, E, th, shortBy: E / TWI_MEAS, forced };
  };
  return TWI_HEIGHTS.map((H) => row(H, false)).concat([row(twiFlatH(TWI_MEAS, d), true)]);
}
export function twiDurRows() {
  const dates = [{ key: "equinox", d: 0 }, { key: "june", d: TWI_OBLIQ }];
  const out = [];
  TWI_PLACES.forEach((pl) => dates.forEach((dt, i) => out.push({
    place: pl.n, lat: pl.p, first: i === 0, date: dt.key,
    civil: twiSpan(pl.p, dt.d, TWI_SUNUP, -6), naut: twiSpan(pl.p, dt.d, -6, -12), astro: twiSpan(pl.p, dt.d, -12, -18),
    midnight: twiMidnightAlt(pl.p, dt.d),
  })));
  return out;
}
export function twiShadowRows(R = TWI_R) {
  return TWI_SHADOW_TH.map((th) => ({ th, tops: TWI_SHADOW_H.map((H) => twiShadowTop(th, H, R)), a15: twiShadowTop(th, 15, R) }));
}
/** Sortie du calculateur d'expérience 1f. */
export function twiExperiment(phi, dec) {
  return {
    civil: twiSpan(phi, dec, TWI_SUNUP, -6), naut: twiSpan(phi, dec, -6, -12), astro: twiSpan(phi, dec, -12, -18),
    total: twiSpan(phi, dec, TWI_SUNUP, -18), midnight: twiMidnightAlt(phi, dec),
    thr18: twiThreshold(-18, dec), thr12: twiThreshold(-12, dec), thr6: twiThreshold(-6, dec),
  };
}
