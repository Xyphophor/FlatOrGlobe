// Logique pure de l'onglet grav (gravité et niveau), portée à l'identique du
// legacy (flat-or-globe-2.20.0.html, ~L23028-23494 pour les formules/tables,
// drawGravPair ~L30279 pour l'ouverture -- NON portée, voir index.js).
// Séparée de index.js pour rester testable sous node:test sans DOM/canvas
// (voir tasks/epic02/UC04.org).
//
// RÉUTILISATION D'HELPERS D'UN AUTRE ONGLET : vérifié dans le legacy (grep
// sur "mag" dans tout le bloc drawGrav()/sous-fonctions, ~L23028-23494) --
// aucune fonction de mag n'est appelée ici. Une seule CONSTANTE est
// partagée conceptuellement (GRV_DISC_A = 20 000 km, le même rayon de
// disque que l'onglet magnétisme utilise pour sa propre carte), pas de
// code. grav est donc autonome ; rien n'est dupliqué depuis mag/.
import { DEG } from "../../core/math.js";

export const GRV_BIGG = 6.6743e-11; // CODATA, constante gravitationnelle
export const GRV_R = 6371000; // m, rayon moyen utilisé par cette page
export const GRV_G0 = 9.80665; // m/s^2, gravité normale
export const GRV_RHO = 5514; // kg/m^3, densité moyenne de la Terre (NASA fact sheet)
export const GRV_OM = 7.292115e-5; // rad/s, vitesse de rotation terrestre
export const GRV_DISC_A = 20000e3; // m, pôle -> bord de la carte plate (= onglet magnétisme)

/**
 * Formule internationale de gravité (GRS80 / IGF 1980) : un AJUSTEMENT sur
 * la gravimétrie mondiale, pas une prédiction de la sphère de cette page --
 * voir le callout "The limit of a sphere, admitted" (section 04) : la
 * rotation seule n'explique qu'environ les deux tiers de l'écart
 * pôle-équateur, le tiers manquant vient du renflement équatorial que
 * cette page ne modélise pas ailleurs.
 */
export function grvIGF(phiDeg) {
  const s = Math.pow(Math.sin((phiDeg * Math.PI) / 180), 2);
  return 9.7803267715 * (1 + 0.0052790414 * s + 0.0000232718 * s * s + 0.0000001262 * s ** 3 + 0.0000000007 * s ** 4);
}

/** Globe : g décroît en 1/(R+h)^2 avec l'altitude. */
export function grvSphere(h) {
  return GRV_G0 * Math.pow(GRV_R / (GRV_R + h), 2);
}

/** m/s^2 -> mGal (1 mGal = 1e-5 m/s^2), l'unité de la gravimétrie de terrain. */
export const grvMGal = (a) => a * 1e5;

/** |dg/dh| à la surface de la sphère -- section 03, "the rate IS the radius". */
export const GRV_GRAD0 = (2 * GRV_G0) / GRV_R;

/** σ (kg/m²) d'une dalle infinie qui produit g0 -- le steel-man de la section 02. */
export const GRV_SIGMA = GRV_G0 / (2 * Math.PI * GRV_BIGG);

/** Masse et densité moyenne de la planète, tirées de g, R et G -- la boucle
 * de Cavendish (section 05), fermée avec les mêmes constantes que le reste
 * de la page. */
export const GRV_MASS = (GRV_G0 * GRV_R * GRV_R) / GRV_BIGG;
export const GRV_DENSITY = GRV_MASS / ((4 / 3) * Math.PI * Math.pow(GRV_R, 3));

/**
 * Épaisseur (m) d'un disque de rayon GRV_DISC_A et de densité GRV_RHO qui
 * produit exactement GRV_G0 au centre de sa face supérieure. Forme fermée
 * pour un cylindre sur son axe : g = 2πGρ(t + a − √(a²+t²)). Résolue par
 * bissection, comme le legacy (90 itérations) ; calculée une fois au
 * chargement du module (déterministe, bon marché : pas besoin de la refaire
 * à chaque rendu).
 */
export const GRV_DISC_T = (() => {
  const f = (t) => 2 * Math.PI * GRV_BIGG * GRV_RHO * (t + GRV_DISC_A - Math.hypot(GRV_DISC_A, t)) - GRV_G0;
  let lo = 1e3, hi = 4e7;
  for (let i = 0; i < 90; i++) {
    const m = 0.5 * (lo + hi);
    if (f(m) < 0) lo = m; else hi = m;
  }
  return 0.5 * (lo + hi);
})();

// Trig hoisté une fois (les mêmes 480 angles à chaque appel) -- port direct
// de l'optimisation legacy (`grvDiscField.trig`, propriété attachée à la
// fonction). Ici un module-scope cache plutôt qu'une propriété de fonction,
// même effet, plus idiomatique en ESM.
let discTrig = null;
function getDiscTrig(NP) {
  if (!discTrig || discTrig.NP !== NP) {
    const cp = new Float64Array(NP), sp = new Float64Array(NP);
    const dph = Math.PI / NP;
    for (let j = 0; j < NP; j++) {
      const ph = (j + 0.5) * dph;
      cp[j] = Math.cos(ph);
      sp[j] = Math.sin(ph);
    }
    discTrig = { NP, cp, sp };
  }
  return discTrig;
}

/**
 * Champ de gravité (gx horizontal, gz vertical, m/s²) sur la face
 * supérieure du disque, à distance s de l'axe. MÉTHODE (identique au
 * legacy) : le point de champ est SUR le corps, donc 1/r² diverge -- au
 * lieu d'une grille directe sur tout le volume, on calcule
 *     disque = dalle infinie − tout ce qui est hors du rayon a
 * Le terme de dalle est exact (2πGρt, tout droit vers le bas) et le terme
 * extérieur a sa matière la plus proche à (a − s), donc lisse. L'intégrale
 * en PROFONDEUR est en forme fermée (retire toute une boucle et l'essentiel
 * de l'erreur) ; seuls le rayon (grille log, 200 pas) et l'azimut (480 pas,
 * une moitié de cercle -- le facteur 2 dans `w` compte l'autre moitié par
 * symétrie miroir) restent à sommer.
 *
 * GRILLE VÉRIFIÉE (ne pas réduire sans revalider) : ce calcul rend 7.347°
 * à s = 0.2286·a (= la distance de Paris sur la carte) et 26.411° à
 * s = 0.6884·a (= Sydney), contre 7.351°/26.432° pour une intégrale
 * volumique brute 600×100×1200 dans le legacy -- écart < 0.01°, sous la
 * précision affichée par les tableaux (2 décimales). Une version qui
 * sommait la profondeur numériquement prenait ~2 s au premier rendu et
 * gelait l'onglet dans le legacy ; ne pas y revenir.
 */
export function grvDiscField(s) {
  const a = GRV_DISC_A, t = GRV_DISC_T, rho = GRV_RHO;
  const NR = 200, NP = 480, RMAX = a * 1e4;
  const gzSlab = -2 * Math.PI * GRV_BIGG * rho * t;
  const lr0 = Math.log(a), dlr = (Math.log(RMAX) - lr0) / NR, dph = Math.PI / NP;
  const { cp, sp } = getDiscTrig(NP);
  const t2 = t * t;
  let gx = 0, gz = 0;
  for (let i = 0; i < NR; i++) {
    const rA = Math.exp(lr0 + i * dlr), rB = Math.exp(lr0 + (i + 1) * dlr);
    const r = 0.5 * (rA + rB), w = 2 * GRV_BIGG * rho * r * (rB - rA) * dph;
    for (let j = 0; j < NP; j++) {
      const x = r * cp[j] - s, y = r * sp[j];
      const u2 = x * x + y * y, u = Math.sqrt(u2), q = Math.sqrt(u2 + t2);
      gx += (w * x * t) / (u2 * q); // horizontal
      gz -= w * (1 / u - 1 / q); // vertical, positif vers le bas
    }
  }
  return { gx: -gx, gz: gzSlab - gz };
}

/**
 * Cache mémoïsé de l'inclinaison / intensité du champ du disque, clé sur la
 * distance arrondie au mètre -- STRATÉGIE IDENTIQUE au legacy (une Map ;
 * ~0.1 M termes par point, et la courbe + les tableaux en redemandent la
 * même trentaine de distances). Exporté (pas privé) pour que le test de
 * performance/mémoïsation puisse observer sa taille sans chronométrer
 * `grvDiscField` directement -- voir logic.test.js.
 */
export const GRV_TILT_CACHE = new Map();
export function grvTilt(s) {
  const key = Math.round(s);
  if (!GRV_TILT_CACHE.has(key)) {
    const f = grvDiscField(s);
    GRV_TILT_CACHE.set(key, { tilt: Math.atan2(Math.abs(f.gx), Math.abs(f.gz)), g: Math.hypot(f.gx, f.gz) });
  }
  return GRV_TILT_CACHE.get(key);
}

/** Distance du centre de la carte plate à l'anneau qui porte une latitude
 * donnée -- convention azimutale-équidistante que le modèle plat publie,
 * 20 000 km pour 180°. */
export const grvMapR = (latDeg) => ((90 - latDeg) * GRV_DISC_A) / 180;

// Points de la table 2 (gvDiscTable), identiques au legacy GRV_STATIONS.
// Noms non traduits (comme dans le legacy : ce ne sont pas des data-i18n).
export const GRV_STATIONS = [
  { n: "North Pole", lat: 90 },
  { n: "Reykjavík", lat: 64.1 },
  { n: "Paris", lat: 48.85 },
  { n: "Cairo", lat: 30 },
  { n: "Equator", lat: 0 },
  { n: "Sydney", lat: -33.9 },
  { n: "Ushuaia", lat: -54.8 },
];

// ---- Tableau 1 : angle entre deux verticales (gvVertTable) ----
export const GRV_VERT_DISTANCES = [1e3, 1e4, 111200, 5e5, 1e6, 4.572e6];

export function gvVertRow(d) {
  const globeDeg = DEG(d / GRV_R);
  const discDeg = DEG(grvTilt(Math.min(d, 0.95 * GRV_DISC_A)).tilt);
  return { d, globeDeg, flatDeg: 0, discDeg, measuredDeg: globeDeg };
}

// ---- Tableau 2 : le disque pesé contre lui-même (gvDiscTable) ----
export function gvDiscRow(station) {
  const r = grvMapR(station.lat);
  const T = grvTilt(Math.min(r, 0.95 * GRV_DISC_A));
  return { name: station.n, r, tiltDeg: DEG(T.tilt), slopePct: 100 * Math.tan(T.tilt) };
}

// ---- Tableau 3 : perte de g avec l'altitude (gvHeightTable) ----
export const GRV_HEIGHT_ROWS = [
  [3, "one floor of a building"],
  [276, "Eiffel Tower, top platform"],
  [828, "Burj Khalifa"],
  [4808, "Mont Blanc"],
  [11000, "airliner at cruise"],
];

export function gvHeightRow(h) {
  const dMgal = grvMGal(GRV_G0 - grvSphere(h));
  return { h, dMgal, timesNoise: dMgal / 0.01 };
}

// ---- Tableau 4 : g par latitude (gvLatTable) ----
export const GRV_LAT_ROWS = [90, 60, 48.85, 30, 4.94, 0];

export function gvLatRow(latDeg) {
  const gPar = grvIGF(48.85), gPole = grvIGF(90);
  const g = grvIGF(latDeg);
  const rateSec = 86400 * (1 - Math.sqrt(g / gPar)); // s/jour qu'une horloge réglée à Paris perd
  return { latDeg, g, diffFromPoleMs2: (g - gPole) * 1000, rateSec };
}

/** Écart entre la mesure de Richer (148 s/jour à Cayenne, 1672) et la
 * prédiction de la formule internationale moderne. */
export function gvRicherCheck() {
  const gPar = grvIGF(48.85), gCay = grvIGF(4.94);
  const pred = 86400 * (1 - Math.sqrt(gCay / gPar));
  const observed = 148; // 2 min 28 s
  return { pred, observed, overshootPct: 100 * (observed / pred - 1) };
}

// ---- Tableau 5 : trois modèles plats contre trois mesures (gvModelTable) ----
// Contenu statique -- pas de calcul, ce sont les verdicts déjà établis par
// les sections 01-04 ci-dessus. Gardé comme donnée (plutôt que codé en dur
// dans le HTML) pour rester vérifiable par test (nombre de lignes,
// cohérence globe = tout vrai).
export const GRV_MODEL_ROWS = [
  { model: "Globe, radius 6,371 km", tilts: "yes, d/R", falls: "yes, 2g/R", varies: "yes, sin²φ", ok: [true, true, true] },
  { model: "Flat: infinite slab of matter", tilts: "no", falls: "no", varies: "no", ok: [false, false, false] },
  { model: "Flat: disc, rim at 20,000 km", tilts: "yes, but wrong way", falls: "weakly, wrong sign", varies: "no", ok: [false, false, false] },
  { model: "Flat: disc accelerating at 9.8 m/s²", tilts: "no", falls: "no", varies: "no", ok: [false, false, false] },
  { model: "Density and buoyancy only", tilts: "no prediction", falls: "no prediction", varies: "no prediction", ok: [null, null, null] },
];

// ---- Expérience 1f : pesée ou pendule à deux latitudes (updateExpGv) ----
export function gravExp(latA, latB, pendulumLen, mass) {
  const gA = grvIGF(latA), gB = grvIGF(latB);
  const dg = gB - gA, rel = dg / gA;
  const TA = 2 * Math.PI * Math.sqrt(pendulumLen / gA);
  const TB = 2 * Math.PI * Math.sqrt(pendulumLen / gB);
  const n100 = 100 * Math.abs(TA - TB);
  const dGrams = 1000 * mass * Math.abs(rel);
  const resolvable = n100 > 0.05 || dGrams > 0.5;
  return { gA, gB, dgMgal: Math.abs(dg) * 1e5, relPct: Math.abs(rel) * 100, TA, TB, n100, dGrams, resolvable };
}
