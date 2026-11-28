// Calculs de l'animation « maillage » de l'onglet math (phys jusqu'au 2026-11-27 ; 2026-11-25, section Terrain models) : un relief INVENTÉ (un sommet
// pointu), échantillonné sur des grilles de 5 à 40 m, lu par interpolation bilinéaire comme le font les scripts du site
// (research/lidar_horizon.py, tools/internal/dem). Puis un trou dans la grille fine, comblé par un autre modèle plus grossier
// et décalé (comme le RGE ALTI dans le trou du LiDAR HD au Mont Agel). Rien de mesuré : l'animation montre le mécanisme.

export const HALF = 120;                     // m : le carré de terrain va de −120 à +120 m
export const PEAK = [6.3, -3.7];             // m : le sommet, hors des nœuds de toutes les grilles
export const STEPS = [5, 10, 20, 40];        // m : chaque grille contient les nœuds de la suivante
export const HOLE = { x0: -20, x1: 40, y0: -40, y1: 20 };   // m : le trou, aligné sur la grille de 20 m
export const FILL = { step: 20, bias: 8 };   // l'autre modèle : 20 m, moyenne de case, 8 m plus haut (inventé)

/** Le « vrai » sol (m) : un dôme, une crête, une pointe rocheuse de 10 m et 5 m de large au sommet. */
export function ground(x, y) {
  const dx = x - PEAK[0], dy = y - PEAK[1], r2 = dx * dx + dy * dy;
  const dome = 80 / (1 + r2 / (42 * 42));
  const ridge = 18 * Math.exp(-((dy - 0.45 * dx) ** 2) / (2 * 14 * 14)) * Math.exp(-(dx * dx) / (2 * 70 * 70));
  const spike = 10 * Math.exp(-r2 / (5 * 5));
  return 1000 + dome + ridge + spike;
}

/** Le sommet du vrai sol, cherché sur 0,1 m autour du pic. */
export function trueSummit() {
  let best = -Infinity;
  for (let i = -40; i <= 40; i++) for (let j = -40; j <= 40; j++) best = Math.max(best, ground(PEAK[0] + i * 0.1, PEAK[1] + j * 0.1));
  return best;
}

export const nodes1d = (step) => { const a = []; for (let v = -HALF; v <= HALF + 1e-9; v += step) a.push(v); return a; };

/** Grille : chaque nœud prend l'altitude du sol en son point. z[i][j] avec x = xs[i], y = ys[j]. */
export function sampleGrid(step, f = ground) {
  const xs = nodes1d(step);
  return { step, xs, ys: xs, z: xs.map((x) => xs.map((y) => f(x, y))) };
}

/** Interpolation bilinéaire : z = (1−u)(1−v) z00 + u(1−v) z10 + (1−u) v z01 + u v z11. */
export function bilinear(g, x, y) {
  const n = g.xs.length - 1, fi = (x - g.xs[0]) / g.step, fj = (y - g.ys[0]) / g.step;
  const i = Math.max(0, Math.min(n - 1, Math.floor(fi))), j = Math.max(0, Math.min(n - 1, Math.floor(fj)));
  const u = fi - i, v = fj - j, z = g.z;
  return (1 - u) * (1 - v) * z[i][j] + u * (1 - v) * z[i + 1][j] + (1 - u) * v * z[i][j + 1] + u * v * z[i + 1][j + 1];
}

export const gridMax = (g, keep = () => true) => {
  let m = -Infinity;
  g.xs.forEach((x, i) => g.ys.forEach((y, j) => { if (keep(x, y)) m = Math.max(m, g.z[i][j]); }));
  return m;
};

/** Le nœud est-il strictement dans le trou ? (les nœuds du bord restent : c'est là que les deux modèles se touchent) */
export const inHole = (x, y) => x > HOLE.x0 + 1e-9 && x < HOLE.x1 - 1e-9 && y > HOLE.y0 + 1e-9 && y < HOLE.y1 - 1e-9;

/** L'autre modèle : grille de 20 m sur le trou, chaque nœud = moyenne du sol sur sa case (1 m), plus le biais. */
export function fillGrid() {
  const { step, bias } = FILL, xs = [], ys = [];
  for (let x = HOLE.x0; x <= HOLE.x1 + 1e-9; x += step) xs.push(x);
  for (let y = HOLE.y0; y <= HOLE.y1 + 1e-9; y += step) ys.push(y);
  const z = xs.map((x) => ys.map((y) => {
    let s = 0, n = 0;
    for (let a = -step / 2 + 0.5; a < step / 2; a += 1) for (let b = -step / 2 + 0.5; b < step / 2; b += 1) { s += ground(x + a, y + b); n++; }
    return s / n + bias;
  }));
  return { step, xs, ys, z };
}

export function bilinearFill(g, x, y) {
  const fi = (x - g.xs[0]) / g.step, fj = (y - g.ys[0]) / g.step, ni = g.xs.length - 1, nj = g.ys.length - 1;
  const i = Math.max(0, Math.min(ni - 1, Math.floor(fi))), j = Math.max(0, Math.min(nj - 1, Math.floor(fj)));
  const u = fi - i, v = fj - j, z = g.z;
  return (1 - u) * (1 - v) * z[i][j] + u * (1 - v) * z[i + 1][j] + (1 - u) * v * z[i][j + 1] + u * v * z[i + 1][j + 1];
}

/** Les grilles, une fois pour toutes. */
export function demModel() {
  const grids = STEPS.map((s) => sampleGrid(s)), fill = fillGrid(), top = trueSummit();
  return { grids, fill, top, maxes: grids.map((g) => gridMax(g)),
    holeMax: gridMax(grids[0], (x, y) => !inHole(x, y)), fillMax: Math.max(gridMax(grids[0], (x, y) => !inHole(x, y)), ...fill.z.flat()) };
}

// Le déroulé (s). « morph » : de la grille a vers la grille b ; les nœuds qui partent descendent sur la surface de la grille
// grossière (ou en remontent quand ils reviennent). « hole » : les nœuds du trou disparaissent ; « fill » : l'autre modèle apparaît.
export const SPAN = 24;
export const TIMELINE = [
  { t0: 0, t1: 2.5, kind: "hold", a: 0 },
  { t0: 2.5, t1: 4, kind: "morph", a: 0, b: 1 },
  { t0: 4, t1: 5.5, kind: "hold", a: 1 },
  { t0: 5.5, t1: 7, kind: "morph", a: 1, b: 2 },
  { t0: 7, t1: 8.5, kind: "hold", a: 2 },
  { t0: 8.5, t1: 10, kind: "morph", a: 2, b: 3 },
  { t0: 10, t1: 12, kind: "hold", a: 3 },
  { t0: 12, t1: 13.5, kind: "morph", a: 3, b: 0 },
  { t0: 13.5, t1: 14.5, kind: "hold", a: 0 },
  { t0: 14.5, t1: 16, kind: "hole", a: 0 },
  { t0: 16, t1: 17.5, kind: "fill", a: 0 },
  { t0: 17.5, t1: 21.5, kind: "filled", a: 0 },
  { t0: 21.5, t1: 23, kind: "unfill", a: 0 },
  { t0: 23, t1: 24, kind: "hold", a: 0 },
];
export function phaseAt(t) {
  const tt = ((t % SPAN) + SPAN) % SPAN, p = TIMELINE.find((q) => tt >= q.t0 && tt < q.t1) || TIMELINE[TIMELINE.length - 1];
  const f = Math.min(1, Math.max(0, (tt - p.t0) / (p.t1 - p.t0)));
  return { ...p, f, e: f * f * (3 - 2 * f) };   // e : adouci
}

/**
 * Le maillage affiché à l'instant t : la grille dessinée (fine pendant un morph, pour que les nœuds qui partent se voient
 * descendre), la hauteur de chaque nœud, son opacité, l'opacité de l'autre modèle et le sommet lu sur ce maillage.
 */
export function meshAt(M, t) {
  const p = phaseAt(t), G = M.grids;
  let g = G[p.a], coarse = null, w = 0;
  if (p.kind === "morph") {
    const fine = p.a < p.b ? p.a : p.b, crs = p.a < p.b ? p.b : p.a;
    g = G[fine]; coarse = G[crs]; w = p.a < p.b ? p.e : 1 - p.e;      // w = 1 : posé sur la grille grossière
  }
  const z = g.xs.map((x, i) => g.ys.map((y, j) => coarse ? g.z[i][j] * (1 - w) + bilinear(coarse, x, y) * w : g.z[i][j]));
  // un nœud « partant » : absent de la grille grossière
  const leaving = (x, y) => !!coarse && (Math.abs(x / coarse.step - Math.round(x / coarse.step)) > 1e-6 || Math.abs(y / coarse.step - Math.round(y / coarse.step)) > 1e-6);
  let holeA = 0, fillA = 0;
  if (p.kind === "hole") holeA = p.e; else if (p.kind === "fill" || p.kind === "filled") { holeA = 1; fillA = p.kind === "fill" ? p.e : 1; }
  else if (p.kind === "unfill") { holeA = 1 - p.e; fillA = 1 - p.e; }
  const alpha = (x, y) => (holeA && inHole(x, y) ? 1 - holeA : 1);
  let top = -Infinity;
  g.xs.forEach((x, i) => g.ys.forEach((y, j) => { if (alpha(x, y) > 0.5) top = Math.max(top, z[i][j]); }));
  if (fillA > 0.5) top = Math.max(top, ...M.fill.z.flat());
  const step = coarse ? (w > 0.5 ? coarse.step : g.step) : g.step;
  const count = coarse ? (w > 0.5 ? coarse.xs.length ** 2 : g.xs.length ** 2) : g.xs.length ** 2 - (holeA > 0.5 ? holeCount(g) : 0) + (fillA > 0.5 ? M.fill.xs.length * M.fill.ys.length : 0);
  return { p, g, z, leaving, w, holeA, fillA, alpha, top, step, count };
}
export const holeCount = (g) => { let n = 0; g.xs.forEach((x) => g.ys.forEach((y) => { if (inHole(x, y)) n++; })); return n; };

/** La coupe par le sommet (y = PEAK[1]) : le maillage affiché, lu en bilinéaire, et l'autre modèle là où il comble le trou. */
export function profileAt(M, mesh, x) {
  const y = PEAK[1], { g, z } = mesh;
  const gz = { step: g.step, xs: g.xs, ys: g.ys, z };
  const inside = x > HOLE.x0 && x < HOLE.x1 && y > HOLE.y0 && y < HOLE.y1;
  return { mesh: bilinear(gz, x, y), fill: inside ? bilinearFill(M.fill, x, y) : null, inside };
}
