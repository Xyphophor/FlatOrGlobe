// Onglet avia (epic14) -- calculs purs, sans DOM, testés par logic.test.js.
// Tout nombre du texte ou d'une figure de l'onglet vient d'ici.
//
//   A. voler « à niveau » : suivre la courbure à v/R ;
//   B. gyroscopes : dérive du conservateur de cap, composantes de la
//      rotation terrestre (gyrocompas des centrales inertielles), période
//      de Schuler et centrale inertielle sur un plan ;
//   C. EI-GJT : l'écart d'arc entre la vraie position et celle d'une
//      centrale en panne (vitesse sol relevée sur la figure 3 de l'AAIB) ;
//   D. vols long-courriers : distances globe / carte plate, vitesses
//      impliquées, cap au départ, meilleure carte plane ajustée (steel-man).
import { distGC, distAE } from "../dist/logic.js";
import { makeAE } from "../../core/aeproj.js";

export const R_KM = 6371;
export const R_M = R_KM * 1000;
export const G0 = 9.80665;
/** Rotation sidérale de la Terre (rad/s) et en °/h : 360° en 23 h 56 min 4 s. */
export const OMEGA = 7.2921159e-5;
export const OMEGA_DEG_H = (OMEGA * 180 / Math.PI) * 3600;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

export { distGC, distAE };

/* ---------- A. voler à niveau ---------- */

/**
 * Suivre la courbure à la vitesse v (m/s), à l'altitude h (m) : le nez
 * tourne (par rapport aux étoiles) de v/(R+h). Si le pilote gardait
 * l'assiette fixe par rapport aux étoiles, le vario monterait de
 * v·sin(ωt) et l'avion s'écarterait de la surface de d²/2R.
 */
export function levelFlight(v, h = 10668) {
  const w = v / (R_M + h);                        // rad/s
  return {
    w,
    degPerMin: w * R2D * 60,
    degPerHour: w * R2D * 3600,
    /** vitesse verticale (m/s) après t secondes d'assiette figée */
    climbAfter: (t) => v * Math.sin(w * t),
    /** écart (m) à la surface après t secondes en ligne droite (tangente) */
    riseAfter: (t) => (R_M + h) * (1 / Math.cos(w * t) - 1),
    /** poids apparent réduit de v²/(R+h) : la fraction de g */
    centripetalFrac: (v * v) / (R_M + h) / G0,
    /** minutes pour tourner d'un angle donné (degrés) */
    minutesFor: (deg) => deg / (w * R2D * 60),
  };
}

/** Pression (hPa) de l'atmosphère standard (ISA, troposphère) à l'altitude h (m) : la « couche de pression » que suit l'altimètre. */
export const isaPressure = (h) => 1013.25 * (1 - 2.25577e-5 * h) ** 5.25588;

/**
 * Les forces sur un avion en vol à niveau, rapportées au poids mg (epic17) :
 * poids W = 1 (vers le centre de la Terre), portance L = 1 − v²/(g(R+h)),
 * traînée D et poussée T = D = W/finesse. Dans le repère de l'avion, ces
 * nombres ne changent pas avec le temps : l'avion tourne avec la verticale.
 */
export function levelForces(v, h, finesse = 18) {
  const c = (v * v) / (R_M + h) / G0;
  return { W: 1, L: 1 - c, c, T: 1 / finesse, D: 1 / finesse, finesse, p: isaPressure(h) };
}

/** Rotation totale (degrés) du nez par rapport aux étoiles sur un trajet de d km : l'arc parcouru. */
export const turnOver = (dKm) => (dKm / R_KM) * R2D;

/* ---------- B. gyroscopes ---------- */

/**
 * Dérive apparente d'un conservateur de cap libre posé au sol (°/h) :
 * −Ω·sin φ. Négatif = le cap affiché DIMINUE (hémisphère nord),
 * positif = il augmente (hémisphère sud) : le signe change à l'équateur.
 */
export const dgDrift = (latDeg) => -OMEGA_DEG_H * Math.sin(latDeg * D2R);

/** Les deux plans possibles : immobile (rien à mesurer) ou disque tournant autour du pôle (axe vertical partout). */
export const dgDriftFlat = { still: () => 0, disc: () => -OMEGA_DEG_H };

/**
 * Ce que mesurent trois gyroscopes immobiles au sol (°/h) : la rotation
 * terrestre, décomposée en une composante horizontale dirigée vers le
 * nord géographique (Ω cos φ) et une composante verticale (Ω sin φ).
 * Le rapport des deux redonne la latitude ; l'horizontale donne le nord.
 */
export function earthRate(latDeg) {
  const p = latDeg * D2R;
  const h = OMEGA_DEG_H * Math.cos(p), v = OMEGA_DEG_H * Math.sin(p);
  return { h, v, total: Math.hypot(h, v), lat: Math.atan2(v, h) * R2D };
}

/** Les mêmes gyroscopes sur un plan : immobile -> rien ; disque tournant -> tout vertical, partout. */
export function earthRateFlat(model) {
  return model === "disc" ? { h: 0, v: OMEGA_DEG_H, total: OMEGA_DEG_H, lat: 90 } : { h: 0, v: 0, total: 0, lat: NaN };
}

/** Période de Schuler (s) : 2π√(R/g) -- celle d'un pendule long comme le rayon de la Terre. */
export const schulerPeriod = (R = R_M, g = G0) => 2 * Math.PI * Math.sqrt(R / g);

/**
 * Une centrale inertielle programmée pour le globe (elle incline son
 * « niveau » de v/R pendant le vol), mais montée dans un avion qui vole
 * en ligne droite sur un plan. Le repère calculé penche de x_c/R, la
 * gravité fuit dans l'horizontale : x_c'' = a − (g/R)·x_c. À vitesse
 * constante (a = 0 après le départ, x_c(0) = 0, x_c'(0) = v), la position
 * calculée oscille : x_c = (v/ω)·sin ωt, ω = √(g/R), sans jamais
 * s'éloigner de plus de v/ω du départ. La vraie position est v·t.
 */
export function irsOnPlane(v, t, R = R_M, g = G0) {
  const w = Math.sqrt(g / R);
  const xc = (v / w) * Math.sin(w * t), x = v * t;
  return { x, xc, err: x - xc, amp: v / w };
}

/* ---------- C. EI-GJT (AAIB Bulletin 12/2019) ---------- */

/**
 * Écart d'arc (degrés) entre la vraie position et la position de la
 * centrale gauche, en intégrant (vitesse sol de la centrale − vitesse
 * vraie) sur le temps. pts = [[minutes UTC depuis 20:00, m/s], ...]
 * relevés à l'œil sur la figure 3 ; vTrue = vitesse sol vraie (m/s).
 * Renvoie une fonction du temps (minutes depuis 20:00), linéaire par
 * morceaux entre les points, 0 avant le début de la dérive.
 */
export function gjtArc(pts, vTrue) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const dt = (pts[i][0] - pts[i - 1][0]) * 60;
    cum.push(cum[i - 1] + dt * ((pts[i][1] + pts[i - 1][1]) / 2 - vTrue));
  }
  const at = (m) => {
    if (m <= pts[0][0]) return 0;
    for (let i = 1; i < pts.length; i++) {
      if (m <= pts[i][0]) {
        const f = (m - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
        const g0 = pts[i - 1][1] - vTrue, g1 = pts[i][1] - vTrue;
        const dt = f * (pts[i][0] - pts[i - 1][0]) * 60;
        const d = cum[i - 1] + dt * (g0 + (g0 + (g1 - g0) * f)) / 2;
        return (d / R_M) * R2D;
      }
    }
    return (cum[cum.length - 1] / R_M) * R2D;
  };
  return at;
}

/** Point atteint en partant de (lat, lon) au cap initial brg (°) sur un arc de a degrés (grand cercle). */
export function destPoint(lat, lon, brg, a) {
  const p = lat * D2R, l = lon * D2R, b = brg * D2R, d = a * D2R;
  const p2 = Math.asin(Math.sin(p) * Math.cos(d) + Math.cos(p) * Math.sin(d) * Math.cos(b));
  const l2 = l + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p), Math.cos(d) - Math.sin(p) * Math.sin(p2));
  return [p2 * R2D, ((l2 * R2D + 540) % 360) - 180];
}

/* ---------- D. vols long-courriers ---------- */

const ll = (ap) => [ap.lat, ap.lon];

/** Cap initial (°, depuis le nord vrai) du grand cercle a -> b. */
export function bearingGC(a, b) {
  const p1 = a[0] * D2R, p2 = b[0] * D2R, dl = (b[1] - a[1]) * D2R;
  const y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}

/** Carte azimutale équidistante centrée sur le pôle nord (le « disque plat ») : (lat, lon) -> (x, y) en km, est dans le sens direct. */
// epic18 : délègue au moteur commun (carte polaire tournée de 90°, × π·R_KM/180 km par degré), testé
const AVIA_POLAR = makeAE({ rot: 90 });
export function aeXY([lat, lon]) {
  const [x, y] = AVIA_POLAR.fwd(lat, lon), k = D2R * R_KM;
  return [x * k, y * k];
}
/** (x, y) km -> (lat, lon) sur le disque. */
export function aeLL([x, y]) {
  return [90 - Math.hypot(x, y) / (D2R * R_KM), Math.atan2(y, x) * R2D];
}

/**
 * Cap de départ de la ligne droite a -> b sur le disque, lu comme sur une
 * boussole posée sur ce disque (nord = vers le centre, est = sens direct),
 * et latitude la plus au nord que traverse cette droite.
 */
export function flatLine(a, b) {
  const A = aeXY(a), B = aeXY(b);
  const d = [B[0] - A[0], B[1] - A[1]], r = Math.hypot(A[0], A[1]);
  const N = [-A[0] / r, -A[1] / r], E = [-Math.sin(a[1] * D2R), Math.cos(a[1] * D2R)];
  const brg = (Math.atan2(d[0] * E[0] + d[1] * E[1], d[0] * N[0] + d[1] * N[1]) * R2D + 360) % 360;
  const L2 = d[0] * d[0] + d[1] * d[1];
  const u = Math.max(0, Math.min(1, -(A[0] * d[0] + A[1] * d[1]) / L2));
  const rmin = Math.hypot(A[0] + u * d[0], A[1] + u * d[1]);
  return { brg, maxLat: 90 - rmin / (D2R * R_KM), len: Math.sqrt(L2) };
}

/** Latitude la plus haute (en valeur absolue, avec son signe) atteinte par le grand cercle a -> b. */
export function gcExtremeLat(a, b, n = 400) {
  let best = a[0];
  const u = gv(a), v = gv(b), om = Math.acos(Math.max(-1, Math.min(1, dot(u, v))));
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = Math.sin(om);
    const k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
    const p = [u[0] * k1 + v[0] * k2, u[1] * k1 + v[1] * k2, u[2] * k1 + v[2] * k2];
    const lat = Math.asin(Math.max(-1, Math.min(1, p[2]))) * R2D;
    if (Math.abs(lat) > Math.abs(best)) best = lat;
  }
  return best;
}
const gv = ([lat, lon]) => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Point du grand cercle a -> b à la fraction t (0..1). */
export function gcPoint(a, b, t) {
  const u = gv(a), v = gv(b), om = Math.acos(Math.max(-1, Math.min(1, dot(u, v))));
  if (om < 1e-9) return a;
  const s = Math.sin(om), k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
  const p = [u[0] * k1 + v[0] * k2, u[1] * k1 + v[1] * k2, u[2] * k1 + v[2] * k2];
  return [Math.asin(Math.max(-1, Math.min(1, p[2]))) * R2D, Math.atan2(p[1], p[0]) * R2D];
}

const median = (xs) => { const s = [...xs].sort((p, q) => p - q), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };
export { median };

/**
 * Une route : distances, temps de vol médians dans chaque sens, moyenne
 * aller-retour (le vent, qui aide un sens et freine l'autre, s'annule au
 * premier ordre), vitesses sol impliquées sur chaque modèle.
 */
export function routeStats(r, AP) {
  const a = ll(AP[r.a]), b = ll(AP[r.b]);
  const gc = distGC(a, b), ae = distAE(a, b);
  const hAB = median(r.ab), hBA = median(r.ba);
  const both = Number.isFinite(hAB) && Number.isFinite(hBA);
  const h = both ? (hAB + hBA) / 2 : Number.isFinite(hAB) ? hAB : hBA;
  const fl = flatLine(a, b);
  return {
    key: `${r.a}-${r.b}`, a: r.a, b: r.b, south: !!r.south, both,
    gc, ae, ratio: ae / gc, hAB, hBA, h, n: r.ab.length + r.ba.length,
    vGlobe: gc / h, vFlat: ae / h,
    brgGlobe: bearingGC(a, b), brgFlat: fl.brg, flatMaxLat: fl.maxLat, gcLat: gcExtremeLat(a, b),
    tas: r.plan?.tas ? r.plan.tas * 1.852 : null, type: r.plan?.type || null, wpt: r.plan?.wpt || [], planFrom: r.plan?.from,
  };
}

/** Moindres carrés t = t0 + d/v sur les routes aller-retour : renvoie {t0, v, rms (fraction), res[]}. */
export function fitTime(stats, dist) {
  const S = stats.filter((s) => s.both);
  const xs = S.map(dist), ys = S.map((s) => s.h), n = S.length;
  const mx = xs.reduce((p, q) => p + q, 0) / n, my = ys.reduce((p, q) => p + q, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  const k = sxy / sxx, t0 = my - k * mx;
  const res = S.map((s, i) => ({ key: s.key, pred: t0 + k * xs[i], obs: ys[i], rel: (ys[i] - (t0 + k * xs[i])) / ys[i] }));
  const rms = Math.sqrt(res.reduce((p, q) => p + q.rel ** 2, 0) / n);
  return { t0, v: 1 / k, rms, res };
}

/** Inverse d'une matrice carrée (Gauss-Jordan, pivot partiel) -- n ≤ quelques dizaines. */
function inverse(M) {
  const n = M.length, A = M.map((r, i) => [...r, ...r.map((_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c];
    for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; if (f) for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j]; }
  }
  return A.map((r) => r.slice(n));
}

/**
 * Steel-man du plan : chaque aéroport est posé OÙ L'ON VEUT sur un plan
 * (2 nombres libres par aéroport), pour que les distances planes
 * s'accordent au mieux avec d = v·(t − t0) -- même modèle horaire que le
 * globe, t0 et v repris de son ajustement. On minimise l'erreur RELATIVE
 * Σ ((d − δ)/δ)² par SMACOF pondéré (majorisation : l'erreur ne peut que
 * baisser à chaque pas), en partant du disque azimutal puis de départs
 * perturbés ; on garde le meilleur. Le globe, lui, n'a AUCUN nombre libre
 * de position : les aéroports y sont à leurs coordonnées.
 *
 * Départs : le disque azimutal, puis des perturbations de ±jitter/2 km
 * (40 × 600 pas retrouvent le même minimum, 8,1 % au 2026-09-28, quelle que
 * soit la graine). opts.init (positions de départ, dans l'ordre de keys) :
 * un seul départ, rejoué pas à pas par opts.onStep(X, it) pour l'animation.
 * Renvoie { rms, res[], pos: {code: [x, y] km}, init, keys, edges, dof }.
 */
export function fitFlat(stats, AP, { t0, v, iters = 600, starts = 40, seed = 1, jitter = 30000, init = null, onStep = null } = {}) {
  const S = stats.filter((s) => s.both);
  const keys = [...new Set(S.flatMap((s) => [s.a, s.b]))];
  const n = keys.length, idx = Object.fromEntries(keys.map((k, i) => [k, i]));
  const E = S.map((s) => ({ i: idx[s.a], j: idx[s.b], t: v * (s.h - t0), key: s.key }));
  E.forEach((e) => { e.w = 1 / (e.t * e.t); });
  const V = keys.map(() => new Array(n).fill(0));
  for (const e of E) { V[e.i][e.j] -= e.w; V[e.j][e.i] -= e.w; V[e.i][e.i] += e.w; V[e.j][e.j] += e.w; }
  const Vp = inverse(V.map((r) => r.map((x) => x + 1 / n))).map((r) => r.map((x) => x - 1 / n));
  let rnd = seed;
  const rand = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647 - 0.5; };
  const measure = (X) => {
    const res = E.map((e) => { const d = Math.hypot(X[e.i][0] - X[e.j][0], X[e.i][1] - X[e.j][1]); return { key: e.key, target: e.t, d, rel: (d - e.t) / e.t }; });
    return { res, rms: Math.sqrt(res.reduce((p, q) => p + q.rel ** 2, 0) / res.length) };
  };
  let best = null;
  for (let st = 0; st < starts; st++) {
    let X = init && st === 0 ? init.map((p) => [...p]) : keys.map((k) => { const p = aeXY(ll(AP[k])); return st ? [p[0] + jitter * rand(), p[1] + jitter * rand()] : p; });
    if (init && st > 0) break;
    const X0 = X.map((p) => [...p]);
    for (let it = 0; it < iters; it++) {
      const B = keys.map(() => new Array(n).fill(0));
      for (const e of E) {
        const d = Math.hypot(X[e.i][0] - X[e.j][0], X[e.i][1] - X[e.j][1]) || 1e-9;
        const b = e.w * e.t / d;
        B[e.i][e.j] -= b; B[e.j][e.i] -= b; B[e.i][e.i] += b; B[e.j][e.j] += b;
      }
      const BX = B.map((r) => [r.reduce((p, q, k) => p + q * X[k][0], 0), r.reduce((p, q, k) => p + q * X[k][1], 0)]);
      X = Vp.map((r) => [r.reduce((p, q, k) => p + q * BX[k][0], 0), r.reduce((p, q, k) => p + q * BX[k][1], 0)]);
      if (onStep && st === 0) onStep(X, it);
    }
    const m = measure(X);
    if (!best || m.rms < best.rms) best = { ...m, init: X0, pos: Object.fromEntries(keys.map((k, i) => [k, X[i]])) };
  }
  return { ...best, keys, edges: E.length, dof: 2 * n - 3 };
}

/**
 * Caps sur la meilleure carte plane, comparés aux vrais (grand cercle). La carte ajustée n'a ni nord ni orientation : on la pose
 * sur le disque azimutal par le calage le plus favorable à elle (règle 2) : le pôle (point vers lequel est le nord) cherché sur une grille, plus la symétrie éventuelle. Pour chaque route : cap réel au départ, cap lu sur la carte ajustée,
 * écart signé (°, dans ]−180, 180]), dans les deux sens. Renvoie { rows[{key, a, b, real, flat, diff}], rms, pole, reflected }. calib = {pole, refl} : calage déjà trouvé (animation : celui de la carte finale, gardé à chaque pas).
 */
export function bearingFit(stats, AP, pos, calib = null) {
  const S = stats.filter((s) => s.both), keys = Object.keys(pos);
  const pairs = [];
  for (const s of S) for (const [a, b] of [[s.a, s.b], [s.b, s.a]]) pairs.push({ key: `${a}-${b}`, a, b, real: bearingGC(ll(AP[a]), ll(AP[b])) });
  const xs = keys.map((k) => pos[k][0]), ys = keys.map((k) => pos[k][1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = Math.max(x1 - x0, y1 - y0);
  // cap sur la carte : nord = vers le pôle P, est = sens direct autour de P (sens inversé si la carte est retournée)
  const read = (A, B, P, refl) => {
    const rx = A[0] - P[0], ry = A[1] - P[1], r = Math.hypot(rx, ry) || 1e-9;
    const N = [-rx / r, -ry / r], E = [-refl * N[1] * -1, refl * N[0] * -1];
    const d = [B[0] - A[0], B[1] - A[1]];
    return (Math.atan2(d[0] * E[0] + d[1] * E[1], d[0] * N[0] + d[1] * N[1]) * R2D + 360) % 360;
  };
  const wrap = (d) => ((d + 540) % 360 + 360) % 360 - 180;
  const score = (P, refl) => {
    let sq = 0;
    const rows = pairs.map((q) => { const f = read(pos[q.a], pos[q.b], P, refl), diff = wrap(f - q.real); sq += diff * diff; return { ...q, flat: f, diff }; });
    return { sq, rows, pole: P, refl };
  };
  if (calib) { const c = score(calib.pole, calib.refl); return { rows: c.rows, rms: Math.sqrt(c.sq / pairs.length), pole: c.pole, reflected: c.refl < 0, refl: c.refl }; }
  let best = null;
  for (const refl of [1, -1]) {
    let cur = null;
    for (let i = 0; i <= 24; i++) for (let j = 0; j <= 24; j++) {
      const c = score([x0 - w * 0.5 + (w * 2 * i) / 24, y0 - w * 0.5 + (w * 2 * j) / 24], refl);
      if (!cur || c.sq < cur.sq) cur = c;
    }
    for (let step = w / 12; step > 5; step /= 2) {
      for (let moved = true, g = 0; moved && g < 40; g++) {
        moved = false;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = score([cur.pole[0] + dx * step, cur.pole[1] + dy * step], refl); if (c.sq < cur.sq) { cur = c; moved = true; } }
      }
    }
    if (!best || cur.sq < best.sq) best = cur;
  }
  return { rows: best.rows, rms: Math.sqrt(best.sq / pairs.length), pole: best.pole, reflected: best.refl < 0, refl: best.refl };
}

/** Erreur relative rms des distances du disque azimutal lui-même contre d = v·(t − t0). */
export function aeResiduals(stats, { t0, v }) {
  const S = stats.filter((s) => s.both);
  const res = S.map((s) => ({ key: s.key, rel: (s.ae - v * (s.h - t0)) / (v * (s.h - t0)) }));
  return { rms: Math.sqrt(res.reduce((p, q) => p + q.rel ** 2, 0) / res.length), res };
}

/* ---------- E. tour du monde par les deux pôles ---------- */

/** Longueur (km) d'un circuit [[lat,lon],...] sur le globe et sur le disque, étapes en ligne droite de chaque modèle. */
export function circuit(pts) {
  let g = 0, f = 0;
  for (let i = 1; i < pts.length; i++) { g += distGC(pts[i - 1], pts[i]); f += distAE(pts[i - 1], pts[i]); }
  return { g, f };
}

/**
 * Sur le disque, le pôle sud n'est pas un point : c'est tout le bord. Passer
 * « par le pôle sud » de a à b, au mieux pour le plan (règle 2) : deux
 * cordes droites qui touchent le bord en UN point, choisi pour que le total
 * soit le plus court. Renvoie {km, lon} (longitude du point de bord choisi).
 */
export function flatViaRim(a, b) {
  const A = aeXY(a), B = aeXY(b), Rr = Math.PI * R_KM;
  let best = { km: Infinity, lon: 0 };
  for (let i = 0; i < 3600; i++) {
    const t = (i / 10) * D2R, P = [Rr * Math.cos(t), Rr * Math.sin(t)];
    const km = Math.hypot(P[0] - A[0], P[1] - A[1]) + Math.hypot(P[0] - B[0], P[1] - B[1]);
    if (km < best.km) best = { km, lon: i / 10 > 180 ? i / 10 - 360 : i / 10 };
  }
  return best;
}

/**
 * Le tour du monde par les deux pôles (preset OMO) sur chaque modèle :
 * globe = arcs de grand cercle par les pôles ; disque = cordes droites, le
 * pôle nord au centre, le pôle sud touché au bord au mieux (flatViaRim).
 */
export function polarCircuit(pts) {
  let g = 0, f = 0;
  const legs = [];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i];
    g += distGC(p.ll, q.ll);
    if (q.pole && q.ll[0] < 0) continue;                 // le pôle sud est compté avec l'étape suivante
    if (p.pole && p.ll[0] < 0) { const r = flatViaRim(pts[i - 2].ll, q.ll); f += r.km; legs.push({ from: pts[i - 2].k, to: q.k, rimLon: r.lon, km: r.km }); continue; }
    const d = distAE(p.ll, q.ll); f += d; legs.push({ from: p.k, to: q.k, km: d });
  }
  return { g, f, legs };
}

/* ---------- E bis. tours du monde, est-ouest et nord-sud ---------- */

/**
 * Longueur (km) du parallèle de latitude lat : sur le globe 2πR·cos φ ; sur le
 * disque (pôle nord au centre, distances vraies le long des méridiens), un cercle
 * de rayon R·(π/2 − φ), donc 2πR·(π/2 − φ). Égales au pôle nord seulement.
 */
export function parallelLength(lat, R = R_KM) {
  const p = lat * D2R;
  return { g: 2 * Math.PI * R * Math.cos(p), f: 2 * Math.PI * R * (Math.PI / 2 - p) };
}

/** Un anneau de vols réguliers ([codes], le dernier = le premier) : temps médian mesuré de chaque étape dans CE sens. */
export function ringTimes(ring, routes) {
  const legs = [];
  for (let i = 1; i < ring.length; i++) {
    const a = ring[i - 1], b = ring[i];
    const r = routes.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (!r) throw new Error(`ringTimes: no route ${a}-${b}`);
    const xs = r.a === a ? r.ab : r.ba;
    legs.push({ a, b, h: median(xs), n: xs.length });
  }
  return { legs, h: legs.reduce((p, q) => p + q.h, 0), n: legs.reduce((p, q) => p + q.n, 0) };
}

/**
 * Un tour du monde (preset WORLD) sur chaque modèle : km globe (arcs de grand
 * cercle, par les pôles s'il le faut), km disque (cordes droites ; pôle sud
 * touché au bord au meilleur point, flatViaRim), heures. Anneau de vols
 * réguliers : heures MESURÉES en vol, moyenne des deux sens (hE, hW gardés) ;
 * vol record : heures ÉCOULÉES publiées, escales comprises.
 */
export function worldTrip(T, { AP, routes, omo }) {
  if (T.ring) {
    const pts = T.ring.map((k) => ({ k, ll: [AP[k].lat, AP[k].lon] }));
    const c = circuit(pts.map((p) => p.ll));
    const E = ringTimes(T.ring, routes), W = ringTimes([...T.ring].reverse(), routes);
    return { k: T.k, dir: T.dir, g: c.g, f: c.f, h: (E.h + W.h) / 2, hE: E.h, hW: W.h, nFlights: E.n + W.n, kind: "airborne", pts };
  }
  const P = T.omo ? omo.pts : T.pts, h = T.omo ? omo.hours : T.hours;
  const c = P.some((p) => p.pole) ? polarCircuit(P) : circuit(P.map((p) => p.ll));
  const pub = T.omo ? omo.km : T.km ?? (T.avg ? T.avg * h : null);
  return { k: T.k, dir: T.dir, g: c.g, f: c.f, h, kind: "elapsed", pub, vmax: T.vmax, vmaxKind: T.vmaxKind, pts: P };
}

/* ---------- F. Eötvös : le poids d'un avion dépend de sa route ---------- */

/**
 * Correction d'Eötvös (mGal, 1 mGal = 1e-5 m/s²) d'un appareil qui se
 * déplace à ve (vers l'est) et vn (vers le nord), m/s, à la latitude lat et
 * à la hauteur h : 2Ω·ve·cos φ (la rotation de la Terre, signe de ve) +
 * v²/(R + h) (la courbure : suivre la surface, quelle que soit la route).
 * Un gravimètre embarqué lit g MOINS cette quantité ; la chaîne de
 * traitement la rajoute (Harlan 1968, sphère ici). opts.rot = false retire
 * le terme de rotation, opts.R = Infinity le terme de courbure (un plan).
 */
export function eotvos(ve, vn, lat, h = 0, { rot = true, R = R_M, ellipsoid = false } = {}) {
  const c = rot ? 2 * OMEGA * ve * Math.cos(lat * D2R) : 0;
  let k = Number.isFinite(R) ? (ve * ve + vn * vn) / (R + h) : 0;
  if (ellipsoid) {   // rayons de courbure de l'ellipsoïde GRS80 : nord-sud M, est-ouest N (variante de reconstruction)
    const a = 6378137, e2 = 0.00669438002290, s2 = Math.sin(lat * D2R) ** 2;
    const N = a / Math.sqrt(1 - e2 * s2), M = a * (1 - e2) / (1 - e2 * s2) ** 1.5;
    k = vn * vn / (M + h) + ve * ve / (N + h);
  }
  return (c + k) * 1e5;
}

/** Formule internationale de gravité (GRS80), mGal -- celle de l'onglet grav, réécrite ici en mGal. */
export function normalGravity(lat) {
  const s = Math.sin(lat * D2R) ** 2;
  return 978032.67715 * (1 + 0.0052790414 * s + 0.0000232718 * s * s + 0.0000001262 * s ** 3 + 0.0000000007 * s ** 4);
}

/**
 * Lignes d'un bloc GRAV-D (preset avia-gravd.js) -> résumé par ligne
 * (latitude moyenne, sens est/ouest, vitesse sol, Eötvös moyen) et paires
 * de points en vis-à-vis sur deux lignes VOISINES volées en sens
 * contraires (même longitude, pas de 0,05°) : [a, b, "ligne/ligne"]. Chaque point garde ce qu'il
 * faut pour recalculer la correction avec un autre modèle.
 */
export function gravdPairs(lines, step = 0.05) {
  const L = lines.map((l) => {
    const n = l.pts.length, ve = l.pts.reduce((p, q) => p + q[4], 0) / n, vn = l.pts.reduce((p, q) => p + q[5], 0) / n;
    const lat = l.pts.reduce((p, q) => p + q[1], 0) / n;
    const E = l.pts.reduce((p, q) => p + eotvos(q[4], q[5], q[1], q[2]), 0) / n;
    const pts = [...l.pts].sort((p, q) => p[0] - q[0]);
    return { id: l.id, lat, east: ve > 0, gs: Math.hypot(ve, vn), hdg: (Math.atan2(ve, vn) * R2D + 360) % 360, E, pts };
  }).sort((p, q) => p.lat - q.lat);
  const at = (pts, lon) => {
    let i = 1;
    while (i < pts.length && pts[i][0] < lon) i++;
    if (i >= pts.length || pts[i - 1][0] > lon) return null;
    const a = pts[i - 1], b = pts[i], w = (lon - a[0]) / (b[0] - a[0] || 1);
    return a.map((x, j) => x + (b[j] - x) * w);
  };
  const pairs = [];
  for (let i = 1; i < L.length; i++) {
    const p = L[i - 1], q = L[i];
    if (p.east === q.east) continue;
    const lo0 = Math.max(p.pts[0][0], q.pts[0][0]), lo1 = Math.min(p.pts.at(-1)[0], q.pts.at(-1)[0]);
    for (let lon = Math.ceil(lo0 / step) * step; lon <= lo1; lon += step) {
      const a = at(p.pts, lon), b = at(q.pts, lon);
      if (a && b) pairs.push([a, b, `${p.id}/${q.id}`]);
    }
  }
  return { lines: L, pairs };
}

/**
 * Ce qu'a LU le gravimètre en un point : la gravité publiée moins la
 * correction que la chaîne de traitement y a ajoutée (Harlan, rayon réel).
 * Puis la même lecture corrigée par un autre modèle, réduite à une
 * hauteur et une latitude communes (gradient à l'air libre 0,3086 mGal/m,
 * gravité normale) pour comparer deux lignes voisines.
 */
export const meterReading = (p, recon = {}) => p[3] - eotvos(p[4], p[5], p[1], p[2], recon);
export function reduced(p, model = {}, recon = {}) {
  const E = model.none ? 0 : eotvos(p[4], p[5], p[1], p[2], model);
  return meterReading(p, recon) + E + 0.3086 * p[2] - normalGravity(p[1]);
}

/** Écart rms (mGal) entre lignes voisines de sens contraires, pour un modèle de correction. */
export function pairRms(pairs, model = {}) {
  let s = 0;
  for (const [a, b] of pairs) { const d = reduced(a, model) - reduced(b, model); s += d * d; }
  return Math.sqrt(s / pairs.length);
}

/**
 * Rayon qui rend les lignes voisines les plus cohérentes. L'écart d'une
 * paire vaut A + B·u, avec A l'écart sans terme de courbure, B la
 * différence des v² (×1e5 : mGal) et u = 1/(R + h̄) (h̄ = hauteur moyenne ;
 * ses variations, ~100 m sur 6 400 km, sont négligeables) : l'écart rms²
 * est un trinôme en u, minimum en u* = −<AB>/<B²>. recon = {ellipsoid: true} : les lectures
 * du gravimètre reconstituées avec les rayons de courbure de l'ellipsoïde (comme le fait le
 * traitement du NGS, Harlan) au lieu de la sphère -- l'alternative de reconstruction. Renvoie { km, rms,
 * curve: [[km, rms]...] (1 000 à 30 000 km) }.
 */
export function fitRadius(pairs, recon = {}) {
  let hs = 0, sAA = 0, sAB = 0, sBB = 0, sA = 0, sB = 0;
  for (const [a, b] of pairs) {
    const A = reduced(a, { R: Infinity }, recon) - reduced(b, { R: Infinity }, recon);
    const B = (a[4] ** 2 + a[5] ** 2 - b[4] ** 2 - b[5] ** 2) * 1e5;
    sAA += A * A; sAB += A * B; sBB += B * B; hs += (a[2] + b[2]) / 2; sA += A; sB += B;
  }
  const n = pairs.length, hbar = hs / n;
  const rmsAt = (km) => { const u = 1 / (km * 1000 + hbar); return Math.sqrt(Math.max(0, (sAA + 2 * u * sAB + u * u * sBB) / n)); };
  const u = -sAB / sBB, km = (1 / u - hbar) / 1000;
  const curve = [];
  for (let k = 1000; k <= 30000; k += 250) curve.push([k, rmsAt(k)]);
  // 2026-11-27 (règle de l'onglet courbure) : −A = u·B est une droite par zéro ; r de Pearson de −A contre B
  const corr = -(sAB - (sA * sB) / n) / Math.sqrt((sAA - (sA * sA) / n) * (sBB - (sB * sB) / n));
  return { km, rms: rmsAt(km), curve, rmsAt, corr, n };
}

/**
 * Test de la correction injectée par le NGS (epic16/UC01). La lecture brute
 * est g_publiée − E (E : la correction du NGS, rotation + courbure, refaite
 * ici avec recon) ; on la corrige avec k·E, k = fraction de la correction du
 * globe gardée : d_k = A + k·ΔE par paire (A : l'écart brut, ΔE : la différence
 * de correction entre les deux lignes), donc rms²(k) est un trinôme, minimum en
 * k* = −<A·ΔE>/<ΔE²>. k = 0 est la Terre plate immobile (rien à corriger),
 * k = 1 la correction du NGS. Soustraire une valeur ne peut pas rapprocher deux
 * lignes de sens contraires : si Ω ou la taille étaient faux, k* serait loin de 1.
 * Jackknife par paire de lignes pour l'erreur type de k*. Renvoie { kStar, seK,
 * rms0, rms1, rmsStar, spread0 (écart est-ouest de la correction, rms mGal),
 * curve: [[k, rms]...] (0 à 2, pas 0,01), rmsAt }.
 */
export function kScan(pairs, recon = { ellipsoid: true }) {
  const rows = pairs.map(([a, b, key]) => {
    const E = (p) => eotvos(p[4], p[5], p[1], p[2], recon);
    return { key, A: reduced(a, { none: true }, recon) - reduced(b, { none: true }, recon), D: E(a) - E(b) };
  });
  const sums = (rs) => { let aa = 0, ad = 0, dd = 0; for (const r of rs) { aa += r.A * r.A; ad += r.A * r.D; dd += r.D * r.D; } return { aa, ad, dd, n: rs.length }; };
  const S = sums(rows);
  const rmsOf = (s, k) => Math.sqrt(Math.max(0, (s.aa + 2 * k * s.ad + k * k * s.dd) / s.n));
  const rmsAt = (k) => rmsOf(S, k);
  const kStar = -S.ad / S.dd;
  const keys = [...new Set(rows.map((r) => r.key))], n = keys.length;
  const jk = keys.map((k) => { const s = sums(rows.filter((r) => r.key !== k)); return -s.ad / s.dd; });
  const mk = jk.reduce((p, q) => p + q, 0) / n;
  const seK = Math.sqrt(((n - 1) / n) * jk.reduce((p, q) => p + (q - mk) ** 2, 0));
  const curve = [];
  for (let i = 0; i <= 200; i++) curve.push([i / 100, rmsAt(i / 100)]);
  return { kStar, seK, rms0: rmsAt(0), rms1: rmsAt(1), rmsStar: rmsAt(kStar), spread0: Math.sqrt(S.dd / S.n), nPairs: rows.length, nGroups: n, curve, rmsAt };
}

/**
 * Les deux réductions tirées du globe, remplacées par des valeurs MESURÉES sur les
 * mêmes paires (demande du propriétaire, 2026-10-03). reduced() ramène les deux lignes
 * à une hauteur commune avec le gradient à l'air libre du GRS80 (0,3086 mGal/m, lui-même
 * ≈ 2g/R) et à une latitude commune avec la gravité normale du GRS80. Ici l'écart d'une
 * paire vaut C + u·B + Γ·Δh − G·Δy (C : lectures + rotation, sans réduction ; Δh en m,
 * Δy vers le nord en km) et Γ, G sont ajustés avec u = 1/(R + h̄), moindres carrés sans
 * constante, erreurs par jackknife sur les paires de lignes. Renvoie, pour chaque variante
 * (fa : Γ ajusté, gravité normale gardée ; lat : G ajusté, Γ = 0,3086 gardé ; both : les
 * deux ajustés), { km, seKm, fa, seFa, lat, seLat, rms }, et grs80 : { fa: 0,3086, lat }
 * (gradient nord-sud de la gravité normale à la latitude moyenne, mGal/km).
 */
export function fitGradients(pairs, recon = {}) {
  const KM_DEG = 111.2;
  const raw = (q) => meterReading(q, recon) + 2 * OMEGA * q[4] * Math.cos(q[1] * D2R) * 1e5;   // lecture + rotation, sans réduction
  const rows = pairs.map(([a, b, key]) => ({ key, C0: raw(a) - raw(b), B: (a[4] ** 2 + a[5] ** 2 - b[4] ** 2 - b[5] ** 2) * 1e5,
    dh: a[2] - b[2], dy: (a[1] - b[1]) * KM_DEG, gam: normalGravity(a[1]) - normalGravity(b[1]), h: (a[2] + b[2]) / 2 }));
  const hbar = rows.reduce((p, r) => p + r.h, 0) / rows.length;
  const solve = (rs, C, cols) => {   // min Σ (C + Σ x_k·col_k)², élimination de Gauss
    const n = cols.length, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
    for (const r of rs) { const c = cols.map((f) => f(r)), y = C(r); for (let i = 0; i < n; i++) { A[i][n] -= c[i] * y; for (let j = 0; j < n; j++) A[i][j] += c[i] * c[j]; } }
    for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) if (k !== i) { const f = A[k][i] / A[i][i]; for (let j = i; j <= n; j++) A[k][j] -= f * A[i][j]; }
    const x = A.map((row, i) => row[n] / row[i]);
    return { x, rms: Math.sqrt(rs.reduce((p, r) => p + (C(r) + cols.reduce((t, f, k) => t + x[k] * f(r), 0)) ** 2, 0) / rs.length) };
  };
  const keys = [...new Set(rows.map((r) => r.key))], n = keys.length;
  const variant = (C, cols, ifa, ilat) => {
    const F = solve(rows, C, cols), jk = keys.map((k) => solve(rows.filter((r) => r.key !== k), C, cols).x);
    const se = (f) => { const v = jk.map(f), m = v.reduce((p, q) => p + q, 0) / n; return Math.sqrt(((n - 1) / n) * v.reduce((p, q) => p + (q - m) ** 2, 0)); };
    const km = (x) => (1 / x[0] - hbar) / 1000;
    return { km: km(F.x), seKm: se(km), fa: ifa != null ? F.x[ifa] : 0.3086, seFa: ifa != null ? se((x) => x[ifa]) : 0,
      lat: ilat != null ? -F.x[ilat] : null, seLat: ilat != null ? se((x) => -x[ilat]) : 0, rms: F.rms };
  };
  const U = (r) => r.B, FA = (r) => r.dh, LAT = (r) => r.dy;
  const lat0 = pairs.reduce((p, [a, b]) => p + (a[1] + b[1]) / 2, 0) / pairs.length;
  return {
    grs: variant((r) => r.C0 + 0.3086 * r.dh - r.gam, [U]),
    fa: variant((r) => r.C0 - r.gam, [U, FA], 1),
    lat: variant((r) => r.C0 + 0.3086 * r.dh, [U, LAT], null, 1),
    both: variant((r) => r.C0, [U, FA, LAT], 1, 2),
    grs80: { fa: 0.3086, lat: (normalGravity(lat0 + 0.05) - normalGravity(lat0 - 0.05)) / (0.1 * KM_DEG) },
  };
}

/** Le rayon ajusté sur chaque paire de lignes voisines prise seule (dispersion honnête de l'estimation). */
export function fitRadiusByPair(pairs, minPts = 30) {
  const g = {};
  for (const p of pairs) (g[p[2]] ??= []).push(p);
  return Object.entries(g).filter(([, v]) => v.length >= minPts).map(([k, v]) => ({ key: k, km: fitRadius(v).km, n: v.length }));
}

/** Moindres carrés sans constante sur les lignes {C, X, B} : C + Ω·X + u·B minimum. */
function solveRotRadius(rows) {
  let xx = 0, xb = 0, bb = 0, xc = 0, bc = 0, hs = 0;
  for (const r of rows) { xx += r.X * r.X; xb += r.X * r.B; bb += r.B * r.B; xc += r.X * r.C; bc += r.B * r.C; hs += r.h; }
  const det = xx * bb - xb * xb, om = -(bb * xc - xb * bc) / det, u = -(xx * bc - xb * xc) / det;
  let s = 0;
  for (const r of rows) { const d = r.C + om * r.X + u * r.B; s += d * d; }
  return { om: om / OMEGA, km: (1 / u - hs / rows.length) / 1000, rms: Math.sqrt(s / rows.length), corr: xb / Math.sqrt(xx * bb) };
}

/**
 * La rotation ET le rayon tirés des mêmes paires. L'écart d'une paire vaut
 * C + Ω·X + u·B : C l'écart sans aucune correction, X = Δ(2·v_E·cos φ)·1e5,
 * B = Δ(v²)·1e5, u = 1/(R + h̄) -- linéaire en (Ω, u), moindres carrés à deux
 * inconnues, sans constante. Les deux colonnes se ressemblent : à vitesse
 * propre a et vent w constants, l'écart est-ouest vaut 4a(Ω cos φ + w/R) et
 * seule cette combinaison se lirait ; ce sont les variations de vent et de
 * vitesse d'une ligne à l'autre qui séparent Ω de R (corr le chiffre).
 * Erreurs types par jackknife sur les paires de lignes (les résidus sont
 * corrélés le long d'une ligne : l'erreur type formelle serait trop
 * optimiste). flat : R = ∞ imposé et Ω laissé libre -- le terme de rotation
 * du globe sur un plan, un hybride (un disque qui tourne autour d'un axe
 * vertical ne donne, lui, aucun terme vertical). Renvoie { om (Ω/Ω₀), km, rms,
 * corr, dayH (tour sidéral, h), seOm, seKm, seDayH, cov (om·km), per: [{key, om, km, n}]
 * (chaque paire de lignes seule, ≥ minPts points), termOm / termR (mGal : taille moyenne
 * des termes de rotation et de courbure dans l'écart d'une paire), flat: {om, rms} }.
 */
export function fitRotRadius(pairs, recon = {}, minPts = 30) {
  const rows = pairs.map(([a, b, key]) => ({
    key,
    C: reduced(a, { none: true }, recon) - reduced(b, { none: true }, recon),
    X: 2 * (a[4] * Math.cos(a[1] * D2R) - b[4] * Math.cos(b[1] * D2R)) * 1e5,
    B: (a[4] ** 2 + a[5] ** 2 - b[4] ** 2 - b[5] ** 2) * 1e5,
    h: (a[2] + b[2]) / 2,
  }));
  const F = solveRotRadius(rows);
  const keys = [...new Set(rows.map((r) => r.key))], n = keys.length;
  const jk = keys.map((k) => solveRotRadius(rows.filter((r) => r.key !== k)));
  const mo = jk.reduce((p, q) => p + q.om, 0) / n, mk = jk.reduce((p, q) => p + q.km, 0) / n;
  const f = (n - 1) / n;
  const seOm = Math.sqrt(f * jk.reduce((p, q) => p + (q.om - mo) ** 2, 0));
  const seKm = Math.sqrt(f * jk.reduce((p, q) => p + (q.km - mk) ** 2, 0));
  const cov = f * jk.reduce((p, q) => p + (q.om - mo) * (q.km - mk), 0);
  const per = keys.map((k) => { const g = rows.filter((r) => r.key === k); return g.length >= minPts ? { key: k, n: g.length, ...solveRotRadius(g) } : null; }).filter(Boolean);
  let xx = 0, xc = 0;
  for (const r of rows) { xx += r.X * r.X; xc += r.X * r.C; }
  const omF = -xc / xx;
  const rmsF = Math.sqrt(rows.reduce((p, r) => p + (r.C + omF * r.X) ** 2, 0) / rows.length);
  const dayH = 2 * Math.PI / (F.om * OMEGA) / 3600;
  // la taille des deux termes dans l'écart d'une paire (valeurs vraies) : rotation, courbure
  const hbar = rows.reduce((p, r) => p + r.h, 0) / rows.length;
  const termOm = rows.reduce((p, r) => p + Math.abs(OMEGA * r.X), 0) / rows.length;
  const termR = rows.reduce((p, r) => p + Math.abs(r.B), 0) / rows.length / (R_M + hbar);
  // 2026-11-27 (règle de l'onglet courbure) : le coefficient de corrélation multiple, r de −C contre ce que l'ajustement à deux
  // paramètres prédit (a·X + b·B, moindres carrés sans constante)
  let sxx = 0, sxb = 0, sbb = 0, sxy = 0, sby = 0;
  for (const r of rows) { sxx += r.X * r.X; sxb += r.X * r.B; sbb += r.B * r.B; sxy += -r.C * r.X; sby += -r.C * r.B; }
  const det = sxx * sbb - sxb * sxb, ca = (sxy * sbb - sby * sxb) / det, cb = (sby * sxx - sxy * sxb) / det;
  const yv = rows.map((r) => -r.C), pv = rows.map((r) => ca * r.X + cb * r.B), my = yv.reduce((p, q) => p + q, 0) / yv.length, mp = pv.reduce((p, q) => p + q, 0) / pv.length;
  let c1 = 0, c2 = 0, c3 = 0; for (let i = 0; i < yv.length; i++) { c1 += (yv[i] - my) * (pv[i] - mp); c2 += (yv[i] - my) ** 2; c3 += (pv[i] - mp) ** 2; }
  const multR = c1 / Math.sqrt(c2 * c3);
  return { ...F, dayH, seOm, seKm, seDayH: dayH * seOm / F.om, cov, nGroups: n, per, termOm, termR, flat: { om: omF / OMEGA, rms: rmsF }, multR };
}

/**
 * La balance (figure simple de la section Eötvös) : par ligne, ce qu'a lu le
 * gravimètre, ramené à une hauteur et une latitude communes (mGal), et ce
 * que le globe prévoit (−E, la correction moyenne de la ligne, au signe de
 * la lecture). Zéro des deux : leur moyenne sur toutes les lignes, sans
 * modèle. Un plan prévoit la même lecture sur toutes les lignes : 0.
 * grams(mGal, kg) : la même chose pour un passager de kg kilos.
 */
export function lineWeights(lines) {
  const L = lines.map((l) => ({
    id: l.id, lat: l.lat, east: l.east, gs: l.gs,
    meas: l.pts.reduce((p, q) => p + reduced(q, { none: true }), 0) / l.pts.length,
    pred: -l.E,
  }));
  const m0 = L.reduce((p, l) => p + l.meas, 0) / L.length, p0 = L.reduce((p, l) => p + l.pred, 0) / L.length;
  for (const l of L) { l.meas -= m0; l.pred -= p0; }
  const avg = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
  const E = L.filter((l) => l.east), W = L.filter((l) => !l.east);
  const gap = avg(W.map((l) => l.meas)) - avg(E.map((l) => l.meas)), gapPred = avg(W.map((l) => l.pred)) - avg(E.map((l) => l.pred));
  return { lines: L, gap, gapPred, east: avg(E.map((l) => l.meas)), west: avg(W.map((l) => l.meas)) };
}
export const grams = (mgal, kg = 70) => kg * 1000 * mgal * 1e-5 / G0;

/* ---------- G. le rayon de la Terre tiré des temps de vol ---------- */

/**
 * Comme seis avec la vitesse des ondes : ici la vitesse connue d'avance est
 * la vitesse propre (TAS) déposée dans chaque plan de vol, mesurée par
 * rapport à l'air, sans rien supposer de la forme de la Terre. Sur le globe
 * t = t0 + θ·R/TAS (θ = arc en radians entre les aéroports, lu sur leurs
 * coordonnées) : moindres carrés sur x = θ/TAS -> pente R, ordonnée t0.
 * Routes aller-retour avec un plan de vol seulement. Renvoie aussi le
 * rayon de chaque route (t0 commun) et l'erreur type de la pente.
 * Les biais connus poussent tous vers le HAUT (détours, vent au second
 * ordre, vitesse de croisière prévue) : dit dans le texte.
 */
export function radiusFromFlights(stats) {
  const S = stats.filter((s) => s.both && s.tas);
  const xs = S.map((s) => s.gc / R_KM / s.tas), ys = S.map((s) => s.h), n = S.length;
  const mx = xs.reduce((p, q) => p + q, 0) / n, my = ys.reduce((p, q) => p + q, 0) / n;
  let sxy = 0, sxx = 0;
  xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
  const R = sxy / sxx, t0 = my - R * mx;
  const res = ys.map((y, i) => y - (t0 + R * xs[i]));
  const se = Math.sqrt(res.reduce((p, q) => p + q * q, 0) / (n - 2) / sxx);
  const per = S.map((s) => ({ key: s.key, gc: s.gc, R: s.tas * (s.h - t0) / (s.gc / R_KM) }));
  // 2026-11-27 (règle de kappa) : r de Pearson du temps contre θ/v, et l'écart type des résidus (h) ; pas de χ²/ν, aucune
  // erreur n'est déposée pour chaque vol
  const syy = ys.reduce((p, y) => p + (y - my) ** 2, 0), r = sxy / Math.sqrt(sxx * syy), scatter = Math.sqrt(res.reduce((p, q) => p + q * q, 0) / (n - 2));
  return { R, se, t0, n, per, r, scatter };
}
