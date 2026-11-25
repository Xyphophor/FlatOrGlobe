// Logique pure de l'onglet seis (sismologie), portée à l'identique du legacy
// (~L19238-19345, updateExpS ~L19628). La carte plate est l'azimutale
// équidistante centrée sur le pôle nord : les distances depuis le pôle sont
// exactes et tout le reste ne l'est pas -- c'est tout le contenu du test.
import { DEG, RAD } from "../../core/math.js";
import { SEIS_RADIUS_EVENTS, SEIS_ARRIVALS } from "../../data/presets/seis-radius.js";
import { makeAE } from "../../core/aeproj.js";

export const SEIS_R = 6371.0; // km
export const SEIS_V = 3.8; // km/s, vitesse de groupe de Rayleigh, 100-200 s
export const SEIS_KM_PER_DEG = (Math.PI * SEIS_R) / 180;
// Vitesse de groupe pour la bande Ms_20 (18-22 s), DISTINCTE de SEIS_V ci-dessus
// (100-200 s) -- une onde de Rayleigh de plus courte période échantillonne la
// croûte plutôt que le manteau et va donc plus lentement. Valeur ronde médiane
// de la plage habituellement citée pour cette bande (voir sources n13/n15 de
// l'onglet) ; PAS ajustée pour faire coller le résultat -- voir seisRadiusGroups.
export const SEIS_V20 = 3.5;
// Ocean/continent path correction (owner's proposal, 2026-09-19): a real Rayleigh
// wave at 18-22 s runs faster over ocean basins (thin crust, mantle sampled sooner)
// than over continental crust. Both values are independently published, from the
// SAME ISC-bulletin data family this tab's own 442 arrivals come from (source n16),
// NOT fitted here -- see seisRadiusCorrectedGroups.
export const SEIS_V_OCEAN = 3.6; // km/s, global oceanic average at ~20 s (Hearn 2024)
export const SEIS_V_CONTINENT = 2.97; // km/s, continental example Hearn 2024 endorses as ISC-consistent

export function seisDelta(la1, lo1, la2, lo2) {
  const p1 = RAD(la1), p2 = RAD(la2), dl = RAD(lo2 - lo1);
  const c = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  return DEG(Math.acos(Math.max(-1, Math.min(1, c))));
}
// epic18 : délègue au moteur commun (src/core/aeproj.js), même convention (x = −r sin λ, y = −r cos λ), testée
const SEIS_POLAR = makeAE();
export function seisAE(lat, lon) { const [x, y] = SEIS_POLAR.fwd(lat, lon); return { x: -x, y }; }
export function seisFlatKm(la1, lo1, la2, lo2) { const A = seisAE(la1, lo1), B = seisAE(la2, lo2); return Math.hypot(A.x - B.x, A.y - B.y) * SEIS_KM_PER_DEG; }
export function seisDirect(la1, lo1, az, d) {
  const p1 = RAD(la1), a = RAD(az), dd = RAD(d);
  const sp = Math.sin(p1) * Math.cos(dd) + Math.cos(p1) * Math.sin(dd) * Math.cos(a);
  const p2 = Math.asin(Math.max(-1, Math.min(1, sp)));
  const lo2 = lo1 + DEG(Math.atan2(Math.sin(a) * Math.sin(dd) * Math.cos(p1), Math.cos(dd) - Math.sin(p1) * sp));
  return { lat: DEG(p2), lon: ((lo2 + 540) % 360) - 180 };
}
export const seisHMS = (s) => { const m = Math.round(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} m` : `${m} min`; };

export const SEIS_EVENTS = {
  sum: { name: "Sumatra–Andaman, 26 Dec 2004, M9.1", lat: 3.316, lon: 95.854 },
  toh: { name: "Tōhoku, 11 Mar 2011, M9.1", lat: 38.297, lon: 142.373 },
  chi: { name: "Valdivia, Chile, 22 May 1960, M9.5", lat: -38.29, lon: -73.05 },
};
export const SEIS_STATIONS = [
  { c: "KONO", n: "Kongsberg, Norway", lat: 59.65, lon: 9.6 }, { c: "HRV", n: "Harvard, Massachusetts", lat: 42.51, lon: -71.56 },
  { c: "ANMO", n: "Albuquerque, New Mexico", lat: 34.95, lon: -106.46 }, { c: "CTAO", n: "Charters Towers, Australia", lat: -20.09, lon: 146.25 },
  { c: "SUR", n: "Sutherland, South Africa", lat: -32.38, lon: 20.81 }, { c: "PMSA", n: "Palmer Station, Antarctica", lat: -64.77, lon: -64.05 },
  { c: "SBA", n: "Scott Base, Antarctica", lat: -77.85, lon: 166.76 },
];
export function seisRows(ev) {
  return SEIS_STATIONS.map((s) => {
    const dg = seisDelta(ev.lat, ev.lon, s.lat, s.lon), kmG = dg * SEIS_KM_PER_DEG, kmF = seisFlatKm(ev.lat, ev.lon, s.lat, s.lon);
    return { s, dg, kmG, kmF, tG: kmG / SEIS_V, tF: kmF / SEIS_V, err: kmF / kmG - 1 };
  }).sort((a, b) => a.dg - b.dg);
}
export const SEIS_LAYERS = [
  { b: "Mohorovičić discontinuity (crust → mantle)", d: 24.4, w: "A near P arrival that overtakes the direct one — Mohorovičić, 1909" },
  { b: "Transition zone top (410 km)", d: 410, w: "Reflected and converted phases at regional distance" },
  { b: "Transition zone base (660 km)", d: 660, w: "The same, and the depth limit of ordinary earthquakes" },
  { b: "Core–mantle boundary (Gutenberg)", d: 2891, w: "No S beyond 103°, no direct P from 103° to 143° — Oldham 1906, Gutenberg 1913" },
  { b: "Inner core boundary (Lehmann)", d: 5149.5, w: "Faint P arrivals inside the shadow zone — Lehmann, 1936" },
  { b: "Centre", d: 6371, w: "Where the antipodal PKIKP paths all cross" },
];
/** Expérience 1e : une paire épicentre/station, les deux géométries. */
export function seisExp(la1, lo1, la2, lo2, v) {
  const dg = seisDelta(la1, lo1, la2, lo2), kmG = dg * SEIS_KM_PER_DEG, kmF = seisFlatKm(la1, lo1, la2, lo2);
  return { dg, kmG, kmF, tG: kmG / v, tF: kmF / v, err: kmG > 0 ? kmF / kmG - 1 : 0 };
}
/** Zone d'ombre P : 103°-143° sur le globe, à angle FIXE quel que soit l'épicentre. */
export const SEIS_SHADOW = [103, 143];

/** Moustaches de Tukey, 1,5 IQR, aberrants listés (même fonction que ct/surv). */
export function ctStats(a) {
  const v = a.slice().sort((x, y) => x - y), n = v.length;
  const q = (p) => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return v[lo] + (v[hi] - v[lo]) * (i - lo); };
  const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
  const lo = v.find((x) => x >= q1 - 1.5 * iqr), hi = v.filter((x) => x <= q3 + 1.5 * iqr).pop();
  return { n, q1, q3, med: q(0.5), lo, hi, out: v.filter((x) => x < lo || x > hi), mean: v.reduce((s, x) => s + x, 0) / n };
}

/** R = v·t / Δ(rad) pour une seule arrivée -- reverse-engineering non circulaire (Δ vient de seisDelta, pas d'ISC). */
export function seisRadiusOf(distanceDeg, travelTimeS, v = SEIS_V20) {
  return (v * travelTimeS) / RAD(distanceDeg);
}

/** Un groupe (rayon reconstruit) par séisme réel, puis les huit combinés -- même forme que svRadii/ctRadii. */
export function seisRadiusGroups(v = SEIS_V20) {
  const groups = SEIS_RADIUS_EVENTS.map((ev) => {
    const radii = SEIS_ARRIVALS[ev.key].map(([, , , d, t]) => seisRadiusOf(d, t, v));
    return [ev.name, radii, "globe"];
  });
  const all = groups.flatMap((g) => g[1]);
  groups.push(["all", all, "globe"]);
  return groups;
}

/** v pondérée par la portion océanique du trajet réel (ocean_frac, 0..1). Non ajustée à la donnée : v_ocean/v_continent viennent de la littérature (source n16), pas d'un fit sur ces 442 lignes. */
export function seisPathV(oceanFrac) {
  return oceanFrac * SEIS_V_OCEAN + (1 - oceanFrac) * SEIS_V_CONTINENT;
}

/** Même chose que seisRadiusGroups, mais v varie par ligne selon la fraction océanique du trajet réel. */
export function seisRadiusCorrectedGroups() {
  const groups = SEIS_RADIUS_EVENTS.map((ev) => {
    const radii = SEIS_ARRIVALS[ev.key].map(([, , , d, t, of]) => seisRadiusOf(d, t, seisPathV(of)));
    return [ev.name, radii, "globe"];
  });
  const all = groups.flatMap((g) => g[1]);
  groups.push(["all", all, "globe"]);
  return groups;
}

/**
 * Régression linéaire passant par l'origine (moindres carrés) sur le nuage
 * réel (distance grand-cercle en km, heure d'arrivée réelle) d'un séisme --
 * AUCUN v n'est supposé : la pente elle-même est l'estimation, v_fit = 1/pente.
 * C'est la même reconstruction que seisRadiusOf, vue comme un ajustement sur
 * le nuage plutôt qu'un calcul point par point avec un v choisi d'avance.
 */
export function seisRegressionFit(rows) {
  let sxy = 0, sxx = 0;
  for (const [, , , d, t] of rows) {
    const km = d * SEIS_KM_PER_DEG;
    sxy += km * t; sxx += km * km;
  }
  const slope = sxy / sxx; // s/km
  return { slope, vFit: 1 / slope };
}

/**
 * Ratio médian distance-carte-plate / distance-grand-cercle pour les vraies
 * stations d'un séisme. Chaque station a son propre ratio (biais azimutal de
 * la projection AE, voir le callout "Notice what the flat map gets right") ;
 * le médian est le résumé le plus robuste pour UNE seule ligne "attendue à
 * plat" représentative -- ce n'est pas un ajustement caché sur les données
 * cachées, c'est directement lisible depuis les coordonnées publiées.
 */
export function seisMedianFlatRatio(ev, rows) {
  const ratios = rows
    .map(([, staLat, staLon, d]) => seisFlatKm(ev.lat, ev.lon, staLat, staLon) / (d * SEIS_KM_PER_DEG))
    .sort((a, b) => a - b);
  const n = ratios.length, mid = (n - 1) / 2;
  return (ratios[Math.floor(mid)] + ratios[Math.ceil(mid)]) / 2;
}

/**
 * Tout ce qu'il faut pour le graphique d'un séisme réel : chaque arrivée
 * réelle porte DEUX positions en distance pour la MÊME heure réellement
 * enregistrée -- kmG (grand cercle, sa vraie distance) et kmF (ce que la
 * carte plate prétend pour les deux mêmes coordonnées) -- plus la pente
 * ajustée sur le nuage kmG seul (aucune vitesse supposée) et la pente de la
 * seule droite de vitesse qui a un sens ici, 1/v : un fait sur v, pas sur
 * quel modèle a raison. "Plat" n'a pas sa propre droite de vitesse -- c'est
 * justement le point : il n'a que des distances différentes aux MÊMES
 * points, visibles par l'écart horizontal entre les deux positions de
 * chaque arrivée, pas par une deuxième pente.
 */
export function seisRegressionData(ev, rows, v = SEIS_V20) {
  const points = rows.map(([, staLat, staLon, d, t]) => ({
    kmG: d * SEIS_KM_PER_DEG,
    kmF: seisFlatKm(ev.lat, ev.lon, staLat, staLon),
    t,
  }));
  const { slope, vFit } = seisRegressionFit(rows);
  const medianRatio = seisMedianFlatRatio(ev, rows);
  return { points, slopeFit: slope, vFit, slopeGlobe: 1 / v, medianRatio };
}

/**
 * Combien de vraies stations ont déjà reçu l'onde à l'instant simulé t : sur
 * le globe, l'heure RÉELLEMENT enregistrée (pas calculée) ; sur la carte
 * plate, l'heure que sa propre distance impliquerait à la même v (il n'existe
 * pas d'"heure plate observée" -- seule la comparaison géométrique a un sens).
 * Réplique testable de la logique de l'animation seis-legacy.js.
 */
export function seisRealAnimHits(ev, rows, tSim, v = SEIS_V20) {
  let hitG = 0, hitF = 0;
  for (const [, staLat, staLon, , travelTimeS] of rows) {
    if (travelTimeS <= tSim) hitG++;
    if (seisFlatKm(ev.lat, ev.lon, staLat, staLon) / v <= tSim) hitF++;
  }
  return { hitG, hitF, total: rows.length };
}

/**
 * "Lateness" moyenne (heure PRÉDITE moins heure RÉELLEMENT enregistrée, en
 * minutes) par bande de colatitude de la STATION (0 = pôle nord, 180 = pôle
 * sud -- la coordonnée radiale native de la carte AE, seisAE() : r = 90-lat),
 * pour le globe ET pour la carte plate, chacun comparé à la MÊME heure
 * réelle (pas l'un à l'autre -- demande explicite du propriétaire, "to be
 * fair"). Regroupé sur les neuf séismes réels : c'est une propriété de la
 * PROJECTION, pas d'un séisme particulier.
 */
export function seisLatenessBins(v = SEIS_V20, binWidth = 15) {
  const bins = new Map();
  for (const ev of SEIS_RADIUS_EVENTS) {
    for (const [, staLat, staLon, d, t] of SEIS_ARRIVALS[ev.key]) {
      const kmG = d * SEIS_KM_PER_DEG, kmF = seisFlatKm(ev.lat, ev.lon, staLat, staLon);
      const colat = 90 - staLat;
      const band = Math.floor(colat / binWidth) * binWidth;
      if (!bins.has(band)) bins.set(band, { g: [], f: [] });
      const b = bins.get(band);
      b.g.push(kmG / v - t);
      b.f.push(kmF / v - t);
    }
  }
  const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  return [...bins.keys()].sort((a, b) => a - b).map((lo) => {
    const { g, f } = bins.get(lo);
    return { lo, hi: lo + binWidth, n: g.length, globeMin: avg(g) / 60, flatMin: avg(f) / 60 };
  });
}
