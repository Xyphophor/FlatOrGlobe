// Le gaz de billes des animations de l'onglet rocket (2026-10-27), sur le modèle de la colonne d'air de atmo : des billes
// de même masse, des vitesses tirées d'une loi de Maxwell, AUCUN choc entre billes (un gaz très raréfié ; dans un vrai
// moteur elles se heurtent sans cesse, ce qui aligne le jet, mais le bilan de quantité de mouvement est le même), des chocs
// élastiques sur des parois en segments. Chaque choc donne à la paroi 2 m vₙ : la somme de ces coups, par seconde et par
// longueur, EST la pression ; rien d'autre n'est ajouté. Le bilan est exact à chaque choc : ce que reçoit la fusée plus ce
// que portent les billes est conservé (troisième loi de Newton).
//
// Déterministe : une graine, un pas fixe ; at(t) avance jusqu'à t et repart de zéro si t recule (boucle, export vidéo), de
// sorte qu'une image ne dépend que de t. Coordonnées du modèle, y vers le haut ; m = 1.
//
//   const g = makeGas({ walls, box, sides, init, source, body, inside, exitY });
//   g.at(t); g.balls; g.force("top"); g.bodyForce(); g.count(); g.flowOut(); …

export const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
export const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
/** Flux de billes à travers une ligne, dans un sens, par unité de longueur (gaz 2D) : n σ / √(2π). */
export const flux2d = (n, sigma) => (n * sigma) / Math.sqrt(2 * Math.PI);
/** Pression d'un gaz 2D (force par unité de longueur) : n m ⟨vₓ²⟩ = n σ². */
export const press2d = (n, sigma) => n * sigma * sigma;

/**
 * walls : [{ x1, y1, x2, y2, group, until?, only? }] (until : la paroi disparaît à cet instant ; only : elle ne renvoie que
 * les billes de ce tag -- le plan de sortie que le jet ferme à l'air, voir JET_WALL) ;
 * (init : exact = ⟨vₓ²⟩ = ⟨v_y²⟩ = σ² exactement ; zero = quantité de mouvement nulle)
 * box : { x0, x1, y0, y1 } ; sides : { left, right, bottom, top } = "wall" | "open" | { n, sigma } (réservoir d'air : la bille
 * qui sort est perdue, il en entre au flux n σ/√(2π)) ; init : [{ x0, x1, y0, y1, count, sigma, tag, keep? }] ;
 * source : { x0, x1, y0, y1, rate (billes/s, injectées par paires opposées : quantité de mouvement nulle), sigma, until? } ;
 * body : groupes de parois qui font la fusée ; inside(x, y) : la chambre (compteur) ; exitY : plan de sortie (débit sortant) ;
 * events : [{ t, fn(balls) }] appelés une fois quand le temps passe t (ex. chauffer le gaz).
 */
export function makeGas(cfg) {
  const dt = cfg.dt ?? 1 / 120, body = new Set(cfg.body ?? []);
  const walls = cfg.walls.map((w) => {
    const dx = w.x2 - w.x1, dy = w.y2 - w.y1, L = Math.hypot(dx, dy);
    return { ...w, dx, dy, L, nx: -dy / L, ny: dx / L, bx0: Math.min(w.x1, w.x2), bx1: Math.max(w.x1, w.x2), by0: Math.min(w.y1, w.y2), by1: Math.max(w.y1, w.y2) };
  });
  const groups = [...new Set(walls.map((w) => w.group))];
  let st;

  function reset() {
    const r = rng(cfg.seed ?? 1), balls = [];
    for (const z of cfg.init ?? []) {
      let made = 0, tries = 0;
      while (made < z.count && tries++ < z.count * 50) {
        const x = z.x0 + r() * (z.x1 - z.x0), y = z.y0 + r() * (z.y1 - z.y0);
        if (z.keep && !z.keep(x, y)) continue;
        balls.push({ x, y, vx: gauss(r) * z.sigma, vy: gauss(r) * z.sigma, tag: z.tag ?? "gas" }); made++;
      }
      // exact : sans chocs entre billes, chaque |vₓ| et |v_y| est gardé pour toujours ; on ramène le tirage à ⟨vₓ²⟩ = ⟨v_y²⟩ = σ²
      // pour que les quatre parois d'une boîte fermée reçoivent la même pression (sinon ~10 % d'écart avec 200 billes)
      // zero : quantité de mouvement totale nulle au départ (le bilan exact de l'animation de la poussée part de zéro)
      if (z.zero) {
        const mine = balls.slice(-made), mx = mine.reduce((s, b) => s + b.vx, 0) / made, my = mine.reduce((s, b) => s + b.vy, 0) / made;
        for (const b of mine) { b.vx -= mx; b.vy -= my; }
      }
      if (z.exact) {
        const mine = balls.slice(-made), sx = Math.sqrt(mine.reduce((s, b) => s + b.vx * b.vx, 0) / made) / z.sigma, sy = Math.sqrt(mine.reduce((s, b) => s + b.vy * b.vy, 0) / made) / z.sigma;
        for (const b of mine) { b.vx /= sx; b.vy /= sy; }
      }
    }
    st = { t: 0, r, balls, acc: {}, J: Object.fromEntries(groups.map((g) => [g, { x: 0, y: 0, n: 0 }])), gone: { x: 0, y: 0, n: 0 },
      out: { y: 0, n: 0 }, born: 0, hist: [], srcAcc: 0 };
    snap();
  }

  function snap() {
    let jy = 0, jx = 0;
    for (const g of body) { jx += st.J[g].x; jy += st.J[g].y; }
    const row = { t: st.t, bx: jx, by: jy, out: st.out.y, outN: st.out.n, born: st.born, n: cfg.inside ? st.balls.reduce((s, b) => s + (b.tag === "gas" && cfg.inside(b.x, b.y) ? 1 : 0), 0) : 0 };
    for (const g of groups) { row["gx:" + g] = st.J[g].x; row["gy:" + g] = st.J[g].y; row["gn:" + g] = st.J[g].n; }
    st.hist.push(row);
  }

  // une bille avance de h, en rebondissant sur les parois actives (au plus 4 rebonds par pas)
  function move(b, h) {
    let rem = h;
    for (let k = 0; k < 4 && rem > 0; k++) {
      const dx = b.vx * rem, dy = b.vy * rem;
      const px0 = Math.min(b.x, b.x + dx), px1 = Math.max(b.x, b.x + dx), py0 = Math.min(b.y, b.y + dy), py1 = Math.max(b.y, b.y + dy);
      let best = null, sBest = 1;
      for (const w of walls) {
        if ((w.until != null && st.t >= w.until) || (w.only && w.only !== b.tag)) continue;
        if (px1 < w.bx0 || px0 > w.bx1 || py1 < w.by0 || py0 > w.by1) continue;
        const den = dx * w.dy - dy * w.dx; if (Math.abs(den) < 1e-14) continue;
        const ax = w.x1 - b.x, ay = w.y1 - b.y;
        const s = (ax * w.dy - ay * w.dx) / den, q = (ax * dy - ay * dx) / den;
        if (s > 1e-9 && s <= sBest && q >= 0 && q <= 1) { sBest = s; best = w; }
      }
      if (!best) { b.x += dx; b.y += dy; return; }
      b.x += dx * sBest; b.y += dy * sBest;
      const vn = b.vx * best.nx + b.vy * best.ny, side = vn > 0 ? 1 : -1;
      const ox = b.vx, oy = b.vy;
      if (best.diffuse) {
        // paroi rugueuse (loi en cosinus de Knudsen) : la bille repart du même côté, à la même vitesse, dans une direction
        // tirée au hasard (sin θ uniforme sur [−1, 1] autour de la normale) ; elle oublie d'où elle venait
        const sp = Math.hypot(ox, oy), sn = 2 * st.r() - 1, cn = Math.sqrt(1 - sn * sn);
        b.vx = sp * (-side * cn * best.nx + sn * best.ny); b.vy = sp * (-side * cn * best.ny - sn * best.nx);
      } else { b.vx -= 2 * vn * best.nx; b.vy -= 2 * vn * best.ny; }
      const J = st.J[best.group]; J.x += ox - b.vx; J.y += oy - b.vy; J.n++;   // ce que perd la bille, la paroi le reçoit
      b.x -= side * best.nx * 1e-7; b.y -= side * best.ny * 1e-7;
      rem *= 1 - sBest;
    }
  }

  function inject(n, side, amb) {
    const { x0, x1, y0, y1 } = cfg.box, r = st.r;
    for (let i = 0; i < n; i++) {
      const vn = amb.sigma * Math.sqrt(-2 * Math.log(1 - r() + 1e-12)), vt = gauss(r) * amb.sigma, a = r(), e = r() * vn * dt;
      const b = side === "left" ? { x: x0 + e, y: y0 + a * (y1 - y0), vx: vn, vy: vt } : side === "right" ? { x: x1 - e, y: y0 + a * (y1 - y0), vx: -vn, vy: vt }
        : side === "bottom" ? { x: x0 + a * (x1 - x0), y: y0 + e, vx: vt, vy: vn } : { x: x0 + a * (x1 - x0), y: y1 - e, vx: vt, vy: -vn };
      b.tag = "air"; st.balls.push(b);
    }
  }

  function step() {
    for (const e of cfg.events ?? []) if (st.t <= e.t && e.t < st.t + dt) e.fn(st.balls);
    const r = st.r, { x0, x1, y0, y1 } = cfg.box, S = cfg.sides ?? {};
    // la flamme : des paires de billes de vitesses opposées (le carburant brûlé n'apporte aucune quantité de mouvement)
    const src = cfg.source;
    if (src && (src.until == null || st.t < src.until)) {
      st.srcAcc += (src.rate * dt) / 2;
      while (st.srcAcc >= 1) {
        st.srcAcc -= 1;
        const x = src.x0 + r() * (src.x1 - src.x0), y = src.y0 + r() * (src.y1 - src.y0), vx = gauss(r) * src.sigma, vy = gauss(r) * src.sigma;
        st.balls.push({ x, y, vx, vy, tag: "gas" }, { x, y, vx: -vx, vy: -vy, tag: "gas" }); st.born += 2;
      }
    }
    // l'air qui entre par les bords ouverts sur un réservoir
    for (const side of ["left", "right", "bottom", "top"]) {
      const amb = S[side]; if (!amb || typeof amb !== "object") continue;
      const L = side === "left" || side === "right" ? y1 - y0 : x1 - x0;
      st.acc[side] = (st.acc[side] ?? 0) + flux2d(amb.n, amb.sigma) * L * dt;
      const k = Math.floor(st.acc[side]); st.acc[side] -= k; inject(k, side, amb);
    }
    const ey = cfg.exitY;
    const keep = [];
    for (const b of st.balls) {
      const yPrev = b.y;
      move(b, dt);
      if (ey != null && b.tag === "gas") {
        if (yPrev >= ey && b.y < ey) { st.out.y += b.vy; st.out.n++; } else if (yPrev < ey && b.y >= ey) { st.out.y -= b.vy; st.out.n--; }
      }
      // les bords du domaine : paroi (rebond), ou ouvert (la bille s'en va, avec sa quantité de mouvement)
      let gone = false;
      for (const [side, out, wallAt, comp] of [["left", b.x < x0, x0, "vx"], ["right", b.x > x1, x1, "vx"], ["bottom", b.y < y0, y0, "vy"], ["top", b.y > y1, y1, "vy"]]) {
        if (!out) continue;
        if ((S[side] ?? "wall") === "wall") { b[comp] = -b[comp]; if (comp === "vx") b.x = 2 * wallAt - b.x; else b.y = 2 * wallAt - b.y; }
        else gone = true;
      }
      if (gone) { st.gone.x += b.vx; st.gone.y += b.vy; st.gone.n++; } else keep.push(b);
    }
    st.balls = keep;
    st.t += dt;
    snap();
  }

  const row = (t) => { const H = st.hist, i = Math.max(0, Math.min(H.length - 1, Math.round(t / dt))); return H[i]; };
  /** Moyenne sur la fenêtre w (s) de la dérivée d'une grandeur cumulée (clé de l'historique). */
  const rate = (key, w = 1.5) => { const a = row(st.t - w), b = row(st.t); const d = b.t - a.t; return d > 0 ? (b[key] - a[key]) / d : 0; };
  reset();
  return {
    dt,
    get t() { return st.t; },
    get balls() { return st.balls; },
    get hist() { return st.hist; },
    at(t) { if (t < st.t - 1e-9) reset(); while (st.t + dt <= t + 1e-9) step(); return this; },
    /** Force moyenne reçue par un groupe de parois : { x, y } (unités du modèle). */
    force(g, w) { return { x: rate("gx:" + g, w), y: rate("gy:" + g, w) }; },
    /** Force moyenne reçue par la fusée (somme des groupes body). */
    bodyForce(w) { return { x: rate("bx", w), y: rate("by", w) }; },
    /** Quantité de mouvement emportée par seconde à travers le plan de sortie (vers le bas : négative). */
    flowOut(w) { return rate("out", w); },
    /** Billes qui sortent par seconde, billes créées par seconde. */
    outRate(w) { return rate("outN", w); },
    bornRate(w) { return rate("born", w); },
    /** Billes de gaz dans la chambre maintenant. */
    count() { return st.hist.at(-1).n; },
    /** Cumuls exacts : coup total reçu par la fusée, quantité de mouvement des billes présentes et parties. */
    ledger() {
      const h = st.hist.at(-1); let px = 0, py = 0;
      for (const b of st.balls) { px += b.vx; py += b.vy; }
      return { body: { x: h.bx, y: h.by }, gas: { x: px, y: py }, gone: { x: st.gone.x, y: st.gone.y } };
    },
    hits(g) { return st.J[g]?.n ?? 0; },
    wallsAt(t) { return walls.filter((w) => w.until == null || t < w.until); },
  };
}

/* ---- la fusée du modèle : chambre, convergent, col, divergent (tuyère vers le bas) ---------------------------------- */
// Demi-largeur de la chambre 0,3 ; haut à 1, convergent de 0,35 à 0,2 vers le col (demi-largeur hT), divergent jusqu'au plan
// de sortie y = −0,1 (demi-largeur hE). Les parois n'ont pas d'épaisseur : l'air du dehors frappe leur face extérieure.
export const ROCKET = { w: 0.3, top: 1, yConv: 0.35, yThroat: 0.2, hT: 0.1, yExit: -0.1, hE: 0.22 };
export function rocketWalls(R = ROCKET, { nozzle = true, diffuse = true } = {}) {
  const W = [
    { x1: -R.w, y1: R.top, x2: R.w, y2: R.top, group: "top" },
    { x1: -R.w, y1: R.top, x2: -R.w, y2: R.yConv, group: "left" },
    { x1: R.w, y1: R.top, x2: R.w, y2: R.yConv, group: "right" },
    { x1: -R.w, y1: R.yConv, x2: -R.hT, y2: R.yThroat, group: "conv" },
    { x1: R.w, y1: R.yConv, x2: R.hT, y2: R.yThroat, group: "conv" },
  ];
  if (nozzle) W.push({ x1: -R.hT, y1: R.yThroat, x2: -R.hE, y2: R.yExit, group: "bell" }, { x1: R.hT, y1: R.yThroat, x2: R.hE, y2: R.yExit, group: "bell" });
  // des parois rugueuses : sans chocs entre billes, une bille lancée presque à l'horizontale rebondirait entre les flancs
  // pendant des minutes ; la paroi rugueuse fait ce que font les chocs dans un vrai gaz, elle mélange les directions
  if (diffuse) for (const w of W) if (w.group !== "bell") w.diffuse = true;   // la tuyère reste lisse
  return W;
}
export const ROCKET_BODY = ["top", "left", "right", "conv", "bell"];
// Dans un vrai moteur, le jet sort plus dense que l'air ambiant et le repousse : l'air n'entre pas dans la tuyère et ne presse
// que sur la peau extérieure de la fusée (d'où −pₐ Aₑ dans l'équation de la poussée). Nos billes ne se heurtent pas entre
// elles : sans cette ligne, l'air entrerait dans la chambre comme dans une boîte ouverte. Le plan de sortie renvoie donc
// l'air (« le jet »), et ce qu'il reçoit n'est PAS compté sur la fusée.
export const jetWall = (R = ROCKET) => ({ x1: -R.hE, y1: R.yExit, x2: R.hE, y2: R.yExit, group: "jet", only: "air" });
/** La chambre et le convergent (au-dessus du col). */
export function inChamber(x, y, R = ROCKET) {
  if (y > R.top || y < R.yThroat) return false;
  if (y >= R.yConv) return Math.abs(x) < R.w;
  const f = (y - R.yThroat) / (R.yConv - R.yThroat);
  return Math.abs(x) < R.hT + f * (R.w - R.hT);
}
/** Dans la fusée (chambre ou tuyère) : l'air n'y est pas placé au départ. */
export function inRocket(x, y, R = ROCKET) {
  if (inChamber(x, y, R)) return true;
  if (y < R.yExit || y > R.yThroat) return false;
  const f = (R.yThroat - y) / (R.yThroat - R.yExit);
  return Math.abs(x) < R.hT + f * (R.hE - R.hT);
}
/** Aire de la chambre (au-dessus du col), pour la densité. */
export const chamberArea = (R = ROCKET) => 2 * R.w * (R.top - R.yConv) + (R.w + R.hT) * (R.yConv - R.yThroat);
