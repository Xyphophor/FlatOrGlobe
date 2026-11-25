// Krakatoa, 27 août 1883 : l'onde de pression aux ~50 barographes de 1883,
// d'après les tableaux de Strachey (rapport de la Royal Society, 1888),
// recopiés dans data/seis/krakatoa (epic05/UC06). Pur, testé dans
// krakatoalogic.test.js.
//
// Le rayon vient du TEMPS D'UN TOUR à une même station : III − I (vers les
// antipodes) et IV − II (en revenant). Il ne faut ni la position de la
// station ni l'heure de l'explosion -- celle-ci n'a d'ailleurs jamais été
// mesurée, Strachey la déduit des ondes. La moyenne des deux sens annule le
// vent au premier ordre (Strachey : « un courant d'ouest moyen de 14 milles
// à l'heure »). Les positions ne servent qu'à dessiner et au modèle plat.
import { RAD } from "../../core/math.js";
import { KRAK_VENT, KRAK_STATIONS } from "../../data/presets/seis-krakatoa.js";
import { seisDelta, seisAE, seisFlatKm, SEIS_KM_PER_DEG } from "../seis/logic.js";
import { TONGA_V, TONGA_V_MEASURED, looKeep } from "./tongalogic.js";
import { quart, statSE } from "../home/radii.js";

/** km/s : la même vitesse de Lamb que la section Tonga (Lindzen & Blake 1972), fixée d'avance. */
export const KRAK_V = TONGA_V;
const H = 3600;
const isT = (x) => typeof x === "number";

/** Angle au centre Krakatoa → station, en degrés (null sans coordonnées). Sert au dessin et aux modèles, pas au rayon. */
export function krakTheta(s) {
  return s.lat == null ? null : seisDelta(KRAK_VENT[0], KRAK_VENT[1], s.lat, s.lon);
}

/**
 * Les tours complets d'une station : out = III − I, V − III, VII − V (vers les
 * antipodes), back = IV − II, VI − IV (en revenant). queried : garder les
 * heures que Strachey a marquées d'un « ? ».
 */
export function krakLaps(s, queried = false) {
  const ok = (i) => isT(s.t[i]) && (queried || !s.q[i]);
  const lap = (a, b) => (ok(a) && ok(b) ? s.t[b] - s.t[a] : null);
  return { out: [lap(0, 2), lap(2, 4), lap(4, 6)], back: [lap(1, 3), lap(3, 5)] };
}

function stats(v) {
  const n = v.length, mean = v.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  const w = v.slice().sort((a, b) => a - b), med = n % 2 ? w[(n - 1) / 2] : (w[n / 2 - 1] + w[n / 2]) / 2;
  return { n, mean, sd, med };
}

/**
 * Un rayon par station, R = v·T/2π, T = moyenne d'un tour dans chaque sens.
 *   laps "first" : le premier tour de chaque sens (III − I et IV − II), le plus net ;
 *   laps "all"   : la moyenne de tous les tours de chaque sens.
 *   dir "both" (défaut), "out" ou "back" : un seul sens -- le vent n'est plus annulé.
 * Exclusion à 3 écarts-types des autres (looKeep), comme Tonga.
 */
export function krakRadii({ v = KRAK_V, queried = false, laps = "first", dir = "both", stations = KRAK_STATIONS } = {}) {
  const mean = (a) => { const b = a.filter(isT); return b.length ? b.reduce((s, x) => s + x, 0) / b.length : null; };
  const pick = (a) => (laps === "first" ? (isT(a[0]) ? a[0] : null) : mean(a));
  const rows = [];
  for (const s of stations) {
    const L = krakLaps(s, queried), To = pick(L.out), Tb = pick(L.back);
    const T = dir === "out" ? To : dir === "back" ? Tb : To != null && Tb != null ? (To + Tb) / 2 : null;
    if (T != null) rows.push({ id: s.id, theta: krakTheta(s), To, Tb, T, R: (v * H * T) / (2 * Math.PI) });
  }
  const keep = looKeep(rows.map((r) => r.R));
  return { rows, keep, ...stats(rows.filter((_, i) => keep[i]).map((r) => r.R)) };
}

/** Rayon du bord de la carte azimutale (pôle Sud = 180° du pôle Nord), km. */
export const KRAK_RIM = 180 * SEIS_KM_PER_DEG;

/** Plus court trajet Krakatoa → bord → station sur la carte plate (écho sur un bord de rayon rim km). */
export function krakRimPath(s, rim = KRAK_RIM, steps = 3600) {
  const S = seisAE(KRAK_VENT[0], KRAK_VENT[1]), P = seisAE(s.lat, s.lon), r = rim / SEIS_KM_PER_DEG;
  let best = Infinity;
  for (let i = 0; i < steps; i++) {
    const a = (2 * Math.PI * i) / steps, wx = r * Math.cos(a), wy = r * Math.sin(a);
    best = Math.min(best, Math.hypot(wx - S.x, wy - S.y) + Math.hypot(wx - P.x, wy - P.y));
  }
  return best * SEIS_KM_PER_DEG;
}

/** Les stations placées (coordonnées du tableau II) qui ont un intervalle I → II non douteux. */
function gapRows(stations = KRAK_STATIONS) {
  return stations.filter((s) => s.lat != null && isT(s.t[0]) && isT(s.t[1]) && !s.q[0] && !s.q[1])
    .map((s) => ({ s, id: s.id, theta: krakTheta(s), gap: s.t[1] - s.t[0], d: seisFlatKm(KRAK_VENT[0], KRAK_VENT[1], s.lat, s.lon) }));
}

/**
 * Moindres carrés par l'origine, y = b·x, en retirant un à un les points à plus
 * de 3 écarts-types des AUTRES (leave-one-out, même règle que looKeep).
 */
export function looLine0(x, y, k = 3) {
  const keep = x.map(() => true);
  const fit = (idx) => {
    const b = idx.reduce((s, i) => s + x[i] * y[i], 0) / idx.reduce((s, i) => s + x[i] * x[i], 0);
    return { b, sd: Math.sqrt(idx.reduce((s, i) => s + (y[i] - b * x[i]) ** 2, 0) / (idx.length - 1)) };
  };
  for (;;) {
    const idx = x.map((_, i) => i).filter((i) => keep[i]);
    let worst = -1, wz = k;
    for (const i of idx) {
      const f = fit(idx.filter((j) => j !== i)), z = Math.abs(y[i] - f.b * x[i]) / f.sd;
      if (z > wz) { worst = i; wz = z; }
    }
    if (worst < 0) return { ...fit(idx), keep };
    keep[worst] = false;
  }
}

/** Hauteurs de voûte essayées (km) : grille logarithmique de 10 à 100 000 km. */
export const KRAK_DOMES = Array.from({ length: 41 }, (_, i) => Math.round(10 * 10 ** (i / 10)));

/**
 * L'intervalle entre les deux premiers passages, I → II, à chaque station : un
 * écart entre deux heures d'une même horloge, donc sans heure d'explosion, et
 * sans décalage libre (deux passages de la même onde).
 *   globe0 : rien d'ajusté, (2π − 2θ)·R/v avec R = 6 371 km, v = 310 m/s ;
 *   globe  : gap = (2π − 2θ)·R/v, R/v libre (un paramètre) ;
 *   rim    : plan, I direct, II écho sur un bord de rayon rim : gap = (L₁ − d)/v, v libre ;
 *   dome   : plan, II rebond sur une voûte à la hauteur h : gap = (√(d² + 4h²) − d)/v, v et h libres.
 * sd = écart-type des résidus des gardés, en heures (règle 2 : chaque plan a sa vitesse).
 */
export function krakGapFits(stations = KRAK_STATIONS, rims = [KRAK_RIM, 25000, 40000, 60000, 100000], domes = KRAK_DOMES) {
  const g = gapRows(stations), y = g.map((r) => r.gap);
  const pack = (f, extra = {}) => ({ b: f.b, v: 1 / f.b / H, sd: f.sd, n: f.keep.filter(Boolean).length, of: g.length, keep: f.keep, ...extra });
  const res0 = g.map((r) => r.gap - (6371 * (2 * Math.PI - 2 * RAD(r.theta))) / KRAK_V / H), k0 = looKeep(res0);
  const kept0 = res0.filter((_, i) => k0[i]);
  const globe0 = { sd: Math.sqrt(kept0.reduce((s, x) => s + x * x, 0) / kept0.length), mean: kept0.reduce((s, x) => s + x, 0) / kept0.length, n: kept0.length, of: g.length };
  const gf = looLine0(g.map((r) => 2 * Math.PI - 2 * RAD(r.theta)), y);
  const globe = pack(gf, { R: gf.b * KRAK_V * H });
  const rim = rims.map((rw) => pack(looLine0(g.map((r) => krakRimPath(r.s, rw) - r.d), y), { rim: rw }));
  const dome = domes.map((h) => pack(looLine0(g.map((r) => Math.hypot(r.d, 2 * h) - r.d), y), { h }));
  const domeBest = dome.reduce((a, b) => (b.sd < a.sd ? b : a));
  return { rows: g, globe0, globe, rim, dome, domeBest };
}

/**
 * LE résultat de la section, celui que l'accueil reprend : médiane des rayons
 * par station (premier tour de chaque sens, heures douteuses écartées).
 * Alternatives (sys = le plus grand écart) : tous les tours, les heures
 * douteuses gardées, l'intervalle I → II ajusté sur θ (krakGapFits.globe), et
 * (otherR, lambsys.js) le rayon que donne l'autre éruption à la même vitesse.
 */
export function krakResult({ otherR = null } = {}) {
  const r = krakRadii(), v = r.rows.filter((_, i) => r.keep[i]).map((x) => x.R), q = quart(v);
  // epic17 (règle 10) : la vitesse de 2022 (mesurée avec des distances du globe) est citée, jamais dans
  // l'incertitude ; à sa place, la vitesse qu'exige l'autre éruption (lambsys.js)
  const alts = [{ k: "all-laps", R: krakRadii({ laps: "all" }).med }, { k: "queried", R: krakRadii({ queried: true }).med },
    { k: "gap-fit", R: krakGapFits().globe.R }, ...(otherR != null ? [{ k: "other-event", R: otherR }] : [])];
  const cited = [{ k: "v-measured", R: (q.med * TONGA_V_MEASURED) / KRAK_V, polluted: true }];
  const stat = statSE(v), sys = Math.max(...alts.map((a) => Math.abs(a.R - q.med))), sigma = Math.hypot(stat, sys);
  return { ...q, stat, sys, sigma, alts, cited, z: (q.med - 6371) / sigma, lo95: q.med - 1.96 * sigma, hi95: q.med + 1.96 * sigma };
}
