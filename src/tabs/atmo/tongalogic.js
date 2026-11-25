// Hunga Tonga, 15 janvier 2022 : l'onde de pression (onde de Lamb) aux 102
// baromètres ASOS de data/seis/tonga (epic05/UC05). Pur, testé dans
// tongalogic.test.js, qui redonne les nombres de `fog build seis-tonga` (ex-scripts/build_tonga_lamb.py).
//
// Temps en heures après 04:14:45 UTC (début de l'explosion principale, USGS).
// A1 = passage par le chemin court (angle θ), A2 = par le chemin long (2π − θ).
// Les pointés ne doivent rien au globe : θ n'est calculé qu'après coup.
import { RAD } from "../../core/math.js";
import { TONGA_EVENT, TONGA_STATIONS } from "../../data/presets/seis-tonga.js";
import { seisDelta, seisAE, seisFlatKm, SEIS_KM_PER_DEG } from "../seis/logic.js";
import { quart, statSE } from "../home/radii.js";

/** km/s, vitesse de l'onde de Lamb (Lindzen & Blake 1972, ~310 m/s, repris par Nishida et al. 2014). */
export const TONGA_V = 0.31;
const H = 3600;

/** Angle au centre volcan → station, en radians, recalculé depuis les coordonnées. */
export function tongaTheta(st) {
  return RAD(seisDelta(TONGA_EVENT.vent[0], TONGA_EVENT.vent[1], st.lat, st.lon));
}

/**
 * Exclusion des aberrants : on retire le pire point tant qu'il est à plus de
 * 3 écarts-types de la moyenne des AUTRES (leave-one-out), un à la fois.
 * Renvoie le masque des gardés (même règle que les autres onglets, pas de seuil en %).
 */
export function looKeep(vals, k = 3) {
  const keep = vals.map(() => true);
  for (;;) {
    let worst = -1, wz = k;
    for (let i = 0; i < vals.length; i++) {
      if (!keep[i]) continue;
      const o = vals.filter((_, j) => keep[j] && j !== i);
      const m = o.reduce((s, x) => s + x, 0) / o.length;
      const sd = Math.sqrt(o.reduce((s, x) => s + (x - m) ** 2, 0) / (o.length - 1));
      const z = Math.abs(vals[i] - m) / sd;
      if (z > wz) { worst = i; wz = z; }
    }
    if (worst < 0) return keep;
    keep[worst] = false;
  }
}

function stats(v) {
  const n = v.length, mean = v.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  const w = v.slice().sort((a, b) => a - b), med = n % 2 ? w[(n - 1) / 2] : (w[n / 2 - 1] + w[n / 2]) / 2;
  return { n, mean, sd, med, sem: sd / Math.sqrt(n) };
}

/**
 * Trois rayons par station, l'heure de l'éruption étant mesurée (t₀ = 0) :
 *   a1  : R = v·t₁/θ
 *   a2  : R = v·t₂/(2π − θ)
 *   lap : R = v·(t₁ + t₂)/2π  -- ne dépend ni de θ ni de la position de la station.
 * Chaque groupe : rows [{id, R}], keep (masque), stats des gardés.
 */
export function tongaRadii(v = TONGA_V, stations = TONGA_STATIONS) {
  const per = {
    a1: (s, th) => s.a1 != null ? (v * H * s.a1) / th : null,
    a2: (s, th) => s.a2 != null ? (v * H * s.a2) / (2 * Math.PI - th) : null,
    lap: (s) => s.a1 != null && s.a2 != null ? (v * H * (s.a1 + s.a2)) / (2 * Math.PI) : null,
  };
  const out = {};
  for (const [key, f] of Object.entries(per)) {
    const rows = stations.map((s) => ({ id: s.id, R: f(s, tongaTheta(s)) })).filter((r) => r.R != null);
    const keep = looKeep(rows.map((r) => r.R));
    out[key] = { rows, keep, ...stats(rows.filter((_, i) => keep[i]).map((r) => r.R)) };
  }
  return out;
}

/**
 * Droite y = a + b·x par moindres carrés, aberrants retirés comme looKeep mais sur les résidus.
 * Sommes cumulées (centrées pour la précision) : l'ajustement « sans le point i » se déduit des
 * sommes en O(1), donc une passe d'exclusion coûte O(n) et non O(n²).
 */
export function looLine(x, y, k = 3) {
  const N = x.length, x0 = x.reduce((s, v) => s + v, 0) / N, y0 = y.reduce((s, v) => s + v, 0) / N;
  const X = x.map((v) => v - x0), Y = y.map((v) => v - y0);
  const S = { n: N, x: 0, y: 0, xx: 0, xy: 0, yy: 0 };
  for (let i = 0; i < N; i++) { S.x += X[i]; S.y += Y[i]; S.xx += X[i] * X[i]; S.xy += X[i] * Y[i]; S.yy += Y[i] * Y[i]; }
  const fit = (n, sx, sy, sxx, sxy, syy) => {
    const mx = sx / n, my = sy / n, cxx = sxx - n * mx * mx, cxy = sxy - n * mx * my, cyy = syy - n * my * my;
    const b = cxy / cxx, s2 = Math.max(0, cyy - b * cxy) / (n - 2);
    return { b, a: my - b * mx, s2, cxx, mx, n };
  };
  const keep = x.map(() => true);
  for (;;) {
    let worst = -1, wz = k;
    for (let i = 0; i < N; i++) {
      if (!keep[i]) continue;
      const f = fit(S.n - 1, S.x - X[i], S.y - Y[i], S.xx - X[i] * X[i], S.xy - X[i] * Y[i], S.yy - Y[i] * Y[i]);
      const z = Math.abs(Y[i] - f.a - f.b * X[i]) / Math.sqrt(f.s2);
      if (z > wz) { worst = i; wz = z; }
    }
    if (worst < 0) {
      const f = fit(S.n, S.x, S.y, S.xx, S.xy, S.yy), a = f.a + y0 - f.b * x0, mxAbs = f.mx + x0;
      return { a, b: f.b, sd: Math.sqrt(f.s2), ea: Math.sqrt(f.s2 * (1 / f.n + mxAbs ** 2 / f.cxx)), eb: Math.sqrt(f.s2 / f.cxx), keep };
    }
    const w = worst; keep[w] = false;
    S.n--; S.x -= X[w]; S.y -= Y[w]; S.xx -= X[w] * X[w]; S.xy -= X[w] * Y[w]; S.yy -= Y[w] * Y[w];
  }
}

/**
 * Ce qu'on obtient si l'on laisse AUSSI t₀ libre (droite t = t₀ + (R/v)·X) :
 * avec les seules stations des États-Unis (θ ≈ 45-116°) le bras de levier est
 * trop court et les deux passages se contredisent. Limite affichée sur la page.
 * joint = les deux passages sur une même droite (X = θ ou 2π − θ).
 */
export function tongaFreeFits(v = TONGA_V, stations = TONGA_STATIONS) {
  const pts = { a1: [], a2: [] };
  for (const s of stations) {
    const th = tongaTheta(s);
    if (s.a1 != null) pts.a1.push([th, s.a1]);
    if (s.a2 != null) pts.a2.push([2 * Math.PI - th, s.a2]);
  }
  pts.joint = [...pts.a1, ...pts.a2];
  const out = {};
  for (const [k, p] of Object.entries(pts)) {
    const f = looLine(p.map((q) => q[0]), p.map((q) => q[1]));
    out[k] = { t0: f.a, et0: f.ea, R: f.b * v * H, eR: f.eb * v * H, sd: f.sd, n: f.keep.filter(Boolean).length, of: p.length };
  }
  return out;
}

/** Rayon du bord de la carte azimutale (pôle Sud = 180° du pôle Nord), km. */
export const TONGA_RIM = 180 * SEIS_KM_PER_DEG;

/** Plus court trajet volcan → bord → station sur la carte plate (réflexion sur le bord de rayon rim km). */
export function tongaRimPath(st, rim = TONGA_RIM, steps = 3600) {
  const S = seisAE(TONGA_EVENT.vent[0], TONGA_EVENT.vent[1]), P = seisAE(st.lat, st.lon);
  const r = rim / SEIS_KM_PER_DEG;
  let best = Infinity;
  for (let i = 0; i < steps; i++) {
    const a = (2 * Math.PI * i) / steps, wx = r * Math.cos(a), wy = r * Math.sin(a);
    best = Math.min(best, Math.hypot(wx - S.x, wy - S.y) + Math.hypot(wx - P.x, wy - P.y));
  }
  return best * SEIS_KM_PER_DEG;
}

/**
 * Le modèle plat, réglé en sa faveur (règle 2) : carte azimutale centrée sur le
 * pôle Nord, vitesse ET heure de départ libres.
 *  direct : A1 seul, t = t₀ + d/v (d = distance sur la carte).
 *  rim    : un plan n'a pas de chemin long ; on lui donne un écho sur le bord
 *           (« mur de glace »), A1 direct + A2 réfléchi sur la même droite,
 *           pour chaque rayon de bord de `rims` (km).
 * sd = écart-type des résidus des gardés, en heures, comparable à tongaFreeFits.
 */
export function tongaFlatFits(stations = TONGA_STATIONS, rims = [TONGA_RIM, 25000, 40000, 60000, 100000]) {
  const vent = TONGA_EVENT.vent;
  const s1 = stations.filter((s) => s.a1 != null), s2 = stations.filter((s) => s.a2 != null);
  const d1 = s1.map((s) => seisFlatKm(vent[0], vent[1], s.lat, s.lon));
  const pack = (f, of) => ({ t0: f.a, v: 1 / f.b / H, sd: f.sd, n: f.keep.filter(Boolean).length, of });
  const direct = pack(looLine(d1, s1.map((s) => s.a1)), s1.length);
  const rim = rims.map((rw) => {
    const x = [...d1, ...s2.map((s) => tongaRimPath(s, rw))], y = [...s1.map((s) => s.a1), ...s2.map((s) => s.a2)];
    return { rim: rw, ...pack(looLine(x, y), x.length) };
  });
  return { direct, rim };
}

/**
 * Le globe sans RIEN d'ajusté : R = 6 371 km, v = 310 m/s, t₀ = 0. Résidus
 * (observé − prédit, h) des deux passages, aberrants retirés comme ailleurs.
 */
export function tongaGlobeFixed(R = 6371, v = TONGA_V, stations = TONGA_STATIONS) {
  const res = [];
  for (const s of stations) {
    const th = tongaTheta(s);
    if (s.a1 != null) res.push(s.a1 - (R * th) / v / H);
    if (s.a2 != null) res.push(s.a2 - (R * (2 * Math.PI - th)) / v / H);
  }
  const keep = looKeep(res), k = res.filter((_, i) => keep[i]), st = stats(k);
  return { mean: st.mean, sd: Math.sqrt(k.reduce((s, x) => s + x * x, 0) / k.length), n: st.n, of: res.length };
}

/**
 * Second modèle plat : un rebond sur le dôme (firmament). Le second passage
 * monterait du volcan, se réfléchirait sur la voûte au-dessus de la carte et
 * redescendrait. Sur la région Tonga-États-Unis la voûte est prise plate, un
 * plafond à la hauteur h (km) : par la méthode du miroir, le trajet réfléchi
 * vaut L = √(d² + 4h²), d = distance sur la carte. (Le plus court trajet par la
 * BASE d'un dôme posé sur le bord est l'écho sur le bord, tongaFlatFits.rim.)
 */
export function tongaDomePath(st, h) {
  const d = seisFlatKm(TONGA_EVENT.vent[0], TONGA_EVENT.vent[1], st.lat, st.lon);
  return Math.hypot(d, 2 * h);
}

/** Hauteurs de voûte essayées (km), du plafond bas au dôme plus haut que la carte n'est large. */
export const TONGA_DOMES = [1, 10, 100, 1000, 3000, 5000, 10000, 20000, 50000];

/**
 * Le dôme, réglé en sa faveur : A1 direct sur la carte, A2 réfléchi sur la voûte,
 * une même droite t = t₀ + L/v, v et t₀ libres, pour chaque hauteur h ; best =
 * la hauteur qui disperse le moins. dLdd = pente du trajet réfléchi avec la
 * distance, d/√(d² + 4h²) > 0 pour TOUTE hauteur : l'écho arriverait d'autant
 * plus TARD que la station est loin. observed = la même pente mesurée sur t₂
 * (h par 1 000 km de carte) : elle est négative, le second passage arrive plus TÔT au loin.
 */
export function tongaDomeFits(stations = TONGA_STATIONS, domes = TONGA_DOMES) {
  const vent = TONGA_EVENT.vent, dist = (s) => seisFlatKm(vent[0], vent[1], s.lat, s.lon);
  const s1 = stations.filter((s) => s.a1 != null), s2 = stations.filter((s) => s.a2 != null);
  const d1 = s1.map(dist), d2 = s2.map(dist);
  // meilleure hauteur affinée en continu (section dorée sur log h, entre les voisines de la meilleure de la grille)
  const one = (h) => {
    const f = looLine([...d1, ...d2.map((d) => Math.hypot(d, 2 * h))], [...s1.map((s) => s.a1), ...s2.map((s) => s.a2)]);
    return { h, t0: f.a, v: 1 / f.b / H, sd: f.sd, n: f.keep.filter(Boolean).length, of: d1.length + d2.length,
      dLdd: Math.min(...d2.map((d) => d / Math.hypot(d, 2 * h))) };
  };
  const fits = domes.map(one);
  const ib = fits.reduce((k, f, i) => (f.sd < fits[k].sd ? i : k), 0);
  let lo = Math.log(domes[Math.max(0, ib - 1)]), hi = Math.log(domes[Math.min(domes.length - 1, ib + 1)]);
  const g = (Math.sqrt(5) - 1) / 2;
  for (let k = 0; k < 24; k++) {
    const m1 = hi - g * (hi - lo), m2 = lo + g * (hi - lo);
    if (one(Math.exp(m1)).sd < one(Math.exp(m2)).sd) hi = m2; else lo = m1;
  }
  const best = one(Math.round(Math.exp((lo + hi) / 2)));
  return { fits, best, observed: looLine(d2, s2.map((s) => s.a2)).b * 1000 };
}

/** km/s, vitesse de l'onde mesurée pendant l'événement (Wright et al. 2022) -- avec des distances du globe : alternative, jamais la valeur centrale. */
export const TONGA_V_MEASURED = 0.3182;

/**
 * LE résultat de la section, celui que l'accueil reprend (une seule source) :
 * R = v (t₁ + t₂)/2π, médiane des stations gardées ; stat = incertitude de la
 * médiane (même formule que l'accueil, statSE) ; sys = le plus grand écart des
 * autres réductions que la section présente (chaque passage seul, t₀ libre, la
 * vitesse mesurée) ; sigma = √(stat² + sys²) ; z = écart à 6 371 km en sigma ;
 * lo95/hi95 = ±1,96 sigma.
 */
export function tongaResult({ otherR = null } = {}) {
  const r = tongaRadii(), v = r.lap.rows.filter((_, i) => r.lap.keep[i]).map((x) => x.R), q = quart(v);
  // epic17 (règle 10) : la vitesse mesurée pendant l'événement l'a été avec des distances du globe -- citée,
  // jamais dans l'incertitude ; à sa place, la vitesse qu'exige l'AUTRE éruption (lambsys.js), un rapport de temps
  const alts = [{ k: "a1", R: r.a1.med }, { k: "a2", R: r.a2.med }, { k: "free-t0", R: tongaFreeFits().joint.R },
    ...(otherR != null ? [{ k: "other-event", R: otherR }] : [])];
  const cited = [{ k: "v-measured", R: (q.med * TONGA_V_MEASURED) / TONGA_V, polluted: true }];
  const stat = statSE(v), sys = Math.max(...alts.map((a) => Math.abs(a.R - q.med))), sigma = Math.hypot(stat, sys);
  return { ...q, stat, sys, sigma, alts, cited, z: (q.med - 6371) / sigma, lo95: q.med - 1.96 * sigma, hi95: q.med + 1.96 * sigma };
}
