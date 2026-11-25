// La mécanique de l'onglet phys (2026-10-27, propriétaire : « des animations pour expliquer comment on additionne des forces,
// poulies, billes en inertie qu'on frappe avec un angle, magnétisme… un exemple de balistique… un petit cours de physique
// accéléré qu'on peut utiliser comme référence »). Logique pure, testée (mechanics.test.js) : les animations (anims.js), les
// figures et la prose lisent les mêmes nombres. Les [n] renvoient à src/data/sources/phys.js.

export const G = 9.81;                         // m/s², pesanteur des exemples (la valeur exacte du lieu est dans les constantes)
export const MU0 = 1.25663706127e-6;           // N/A², CODATA 2022
export const Q_E = 1.602176634e-19, M_P = 1.67262192595e-27, M_E = 9.1093837139e-31;   // C, kg (CODATA 2022)
const DEG = Math.PI / 180;
const hyp = Math.hypot;

/* ---- 1. la table de forces : un anneau tiré par trois cordes qui passent sur des poulies et portent des masses ---------- */
// Les poulies sont fixes sur un cercle de rayon RT (m) ; chaque corde tire l'anneau vers sa poulie avec m g. L'anneau s'arrête
// là où la somme des trois forces est nulle. Masses 3, 4 et 5 kg : les forces 3-4-5 ferment un triangle rectangle.
export const TABLE = { masses: [3, 4, 5], angles: [90, 210, 330], R: 0.3 };
export function tableForces(p, T = TABLE) {
  return T.masses.map((m, i) => {
    const a = T.angles[i] * DEG, px = T.R * Math.cos(a), py = T.R * Math.sin(a), dx = px - p[0], dy = py - p[1], L = hyp(dx, dy) || 1;
    return [(m * G * dx) / L, (m * G * dy) / L];
  });
}
export const sumF = (F) => F.reduce((s, f) => [s[0] + f[0], s[1] + f[1]], [0, 0]);
/** Mouvement amorti de l'anneau depuis le centre (masse de l'anneau et frottement fictifs) : la trajectoire, pas à pas. */
export function tableRelax(T = TABLE, { steps = 900, dt = 0.01, m = 2, damp = 6 } = {}) {
  let p = [0, 0], v = [0, 0]; const path = [p.slice()];
  for (let i = 0; i < steps; i++) {
    const S = sumF(tableForces(p, T)), a = [(S[0] - damp * v[0]) / m, (S[1] - damp * v[1]) / m];
    v = [v[0] + a[0] * dt, v[1] + a[1] * dt]; p = [p[0] + v[0] * dt, p[1] + v[1] * dt]; path.push(p.slice());
  }
  return path;
}

/* ---- 2. les poulies ------------------------------------------------------------------------------------------------- */
/** Machine d'Atwood (1784) : deux masses de part et d'autre d'une poulie sans masse ni frottement. */
export function atwood(m1, m2, g = G) { const a = ((m1 - m2) * g) / (m1 + m2), T = (2 * m1 * m2 * g) / (m1 + m2); return { a, T, w1: m1 * g, w2: m2 * g }; }
export const ATWOOD = { m1: 3, m2: 2 };
/** Palan à n brins : la charge est tenue par n brins, chacun tendu de F = m g / n ; la corde tirée parcourt n fois la montée. */
export function tackle(m, n, g = G) { return { F: (m * g) / n, ratio: n }; }
export const TACKLE = { m: 40, n: 4 };

/* ---- 3. l'inertie, et les chocs en biais ------------------------------------------------------------------------------- */
/** Un palet qui glisse à v (vecteur, m/s) reçoit l'impulsion J (vecteur, N·s) : v′ = v + J/m. */
export const kick = (v, J, m) => [v[0] + J[0] / m, v[1] + J[1] / m];
export const KICK = { m: 0.17, v: [2, 0], J: 0.17 * 1.5, dir: 60 };   // un palet de 170 g à 2 m/s, coup de 0,255 N·s à 60°
export function kickResult(K = KICK) {
  const J = [K.J * Math.cos(K.dir * DEG), K.J * Math.sin(K.dir * DEG)], v1 = kick(K.v, J, K.m);
  return { J, dv: [J[0] / K.m, J[1] / K.m], v1, speed: hyp(...v1), angle: Math.atan2(v1[1], v1[0]) / DEG };
}
/**
 * La même bille déviée, vue de deux référentiels inertiels (2026-10-27) : le sol, et celui qui avançait avec la bille avant le
 * coup (à u = sa vitesse initiale). Changement de référentiel de Galilée : v′ = v − u. Les vitesses diffèrent, la variation de
 * vitesse, donc l'accélération et la force, est la même dans les deux.
 */
export const FRAMES = { v: [2, 0], dv: [0, 1.5] };
export function framesResult(F = FRAMES) {
  const vAfter = [F.v[0] + F.dv[0], F.v[1] + F.dv[1]], u = F.v;
  const inBall = { before: [F.v[0] - u[0], F.v[1] - u[1]], after: [vAfter[0] - u[0], vAfter[1] - u[1]] };
  return { ground: { before: F.v, after: vAfter }, inBall, dvGround: [vAfter[0] - F.v[0], vAfter[1] - F.v[1]], dvBall: [inBall.after[0] - inBall.before[0], inBall.after[1] - inBall.before[1]],
    angleGround: Math.atan2(vAfter[1], vAfter[0]) / DEG, speedGround: hyp(...vAfter), speedBall: hyp(...inBall.after) };
}
/**
 * Choc élastique de deux billes de même masse, la seconde au repos : la cible part le long de la ligne des centres, à φ de
 * la direction d'arrivée (sin φ = b / 2r, b le décalage), à v cos φ ; la bille qui frappe part à 90° de la cible, à v sin φ.
 */
export function billiard(v, offset) {
  const phi = Math.asin(offset);                 // offset = b / (2r)
  return { phi: phi / DEG, v2: [v * Math.cos(phi) * Math.cos(phi), -v * Math.cos(phi) * Math.sin(phi)], v1: [v * Math.sin(phi) * Math.sin(phi), v * Math.sin(phi) * Math.cos(phi)] };
}
export const BILLIARD = { v: 2, offset: 0.5 };   // b = r : φ = 30°

/* ---- 3 bis. un choc de billes en détail (2026-10-27, propriétaire : la vitrine du choc) -------------------------------- */
// La bille A (en mouvement légèrement en biais) frappe la bille B, au repos, de même masse. Pendant le contact, une force de
// contact F(t) agit le long de la ligne des centres n, en demi-sinusoïde de durée τ (une vraie bille de billard : ~0,2 ms ; ici
// étirée pour qu'on la voie) ; son impulsion J = m (v·n) fait un choc élastique : A garde sa composante perpendiculaire à n et
// perd celle le long de n, que B prend. Tout est analytique (positions par l'intégrale de la forme du créneau), dans le
// référentiel de la table ou dans un référentiel inertiel qui va à u : on y retranche u des vitesses, u t des positions.
// propriétaire (2026-10-27) : billes de 170 g (vraies boules de billard) à 2 m/s ; 57 mm de diamètre ; contact réel de 0,3 ms (mesuré pour des boules de
// billard : 0,25 à 0,3 ms, Sorokin ; 0,1 à 0,6 ms selon la vitesse, Marlow [29]), d'où une vraie force
export const COLL = { m: 0.17, r: 0.0286, speed: 2, dir: 12.3, phi: 38, t0: 1.2, tau: 0.5, tauReal: 3e-4 };
COLL.v = [COLL.speed * Math.cos(COLL.dir * DEG), COLL.speed * Math.sin(COLL.dir * DEG)];
export function collision(C = COLL) {
  const sp = hyp(...C.v), vh = [C.v[0] / sp, C.v[1] / sp], a = -C.phi * DEG;
  const n = [vh[0] * Math.cos(a) - vh[1] * Math.sin(a), vh[0] * Math.sin(a) + vh[1] * Math.cos(a)];   // ligne des centres au contact
  const vn = C.v[0] * n[0] + C.v[1] * n[1], J = C.m * vn, Fmax = (Math.PI / 2) * J / C.tau;               // ∫ F = J pour une demi-sinusoïde (durée d'écran)
  const FmaxReal = (Math.PI / 2) * J / C.tauReal, Fmean = J / C.tauReal, aMax = FmaxReal / C.m;           // la vraie force, pour un contact de 0,3 ms
  const Ac = [0, 0], B0 = [2 * C.r * n[0], 2 * C.r * n[1]], A0 = [-C.v[0] * C.t0, -C.v[1] * C.t0];
  const dvA = [-vn * n[0], -vn * n[1]], dvB = [vn * n[0], vn * n[1]];
  const S = (q) => (q <= 0 ? 0 : q >= C.tau ? 1 : (1 - Math.cos((Math.PI * q) / C.tau)) / 2);                // part de l'impulsion reçue
  const I = (q) => (q <= 0 ? 0 : q >= C.tau ? q - C.tau / 2 : (q - (C.tau / Math.PI) * Math.sin((Math.PI * q) / C.tau)) / 2);   // ∫ S
  /**
   * État à l'instant d'affichage t dans le référentiel qui va à u (m/s). Le contact dure en vrai ~0,2 ms : à l'écran il est
   * étiré sur τ et le mouvement y est arrêté (temps physique figé à t0) ; les vitesses, la force et l'énergie y évoluent.
   */
  function at(t, u = [0, 0]) {
    const q = t - C.t0, s = S(q), T = t < C.t0 ? t : t < C.t0 + C.tau ? C.t0 : t - C.tau, after = Math.max(0, T - C.t0);
    const vA = [C.v[0] + dvA[0] * s - u[0], C.v[1] + dvA[1] * s - u[1]], vB = [dvB[0] * s - u[0], dvB[1] * s - u[1]];
    const pA = [A0[0] + C.v[0] * T + dvA[0] * after - u[0] * T, A0[1] + C.v[1] * T + dvA[1] * after - u[1] * T];
    const pB = [B0[0] + dvB[0] * after - u[0] * T, B0[1] + dvB[1] * after - u[1] * T];
    const F = q > 0 && q < C.tau ? Fmax * Math.sin((Math.PI * q) / C.tau) : 0;   // force de B sur A, le long de −n (impulsion J sur τ)
    const Freal = F * (FmaxReal / Fmax);                                          // la même forme, à la vraie échelle
    const aA = [(-F * n[0]) / C.m, (-F * n[1]) / C.m];                            // la même dans tout référentiel inertiel
    const p = [C.m * (vA[0] + vB[0]), C.m * (vA[1] + vB[1])], E = 0.5 * C.m * (vA[0] ** 2 + vA[1] ** 2 + vB[0] ** 2 + vB[1] ** 2);
    return { pA, pB, vA, vB, F, Freal, aA, p, E, s, T, contact: q > 0 && q < C.tau };
  }
  return { n, vn, J, Fmax, FmaxReal, Fmean, aMax, dvA, dvB, at, vt: [C.v[0] - vn * n[0], C.v[1] - vn * n[1]], C };
}
/* ---- 3 ter. une même impulsion en un coup, en deux, ou continue (2026-10-28, propriétaire) ----------------------------- */
// Une bille de 170 g roule à 2 m/s contre le vent. Trois façons de lui retirer la même impulsion J = −0,17 N·s : un vent
// constant de −0,068 N pendant 2,5 s, deux coups de −0,085 N·s, un seul coup de −0,17 N·s. La vitesse finale est la même,
// v₀ + J/m = 1 m/s ; le chemin parcouru, lui, dépend du moment où la vitesse change. Le vent est pris constant (une vraie
// traînée dépend de la vitesse) : ce qui compte ici, c'est l'aire sous F(t).
export const ISUM = { m: 0.17, v0: 2, J: -0.17, wind: [0.5, 3.0], blows2: [0.8, 2.0], blow1: 2.6, T: 4.5, dt: 0.25 };
/** Les trois cas : force (N) à l'instant t, impulsion accumulée ∫F dt, vitesse, position. Les coups durent dt = 0,25 s (bien plus qu'un vrai coup : pour qu'on voie leur aire). */
export function impulseCases(I = ISUM) {
  const Fw = I.J / (I.wind[1] - I.wind[0]);
  const pulses = (times, Jeach) => (t) => times.reduce((f, t0) => f + (t >= t0 && t < t0 + I.dt ? Jeach / I.dt : 0), 0);
  const cases = { wind: (t) => (t >= I.wind[0] && t < I.wind[1] ? Fw : 0), two: pulses(I.blows2, I.J / 2), one: pulses([I.blow1], I.J) };
  const N = Math.round(I.T / 0.002), out = {};
  for (const [k, F] of Object.entries(cases)) {
    let J = 0, v = I.v0, x = 0; const rows = [];
    for (let i = 0; i <= N; i++) { const t = i * 0.002, f = F(t); rows.push({ t, F: f, J, v, x }); J += f * 0.002; v += (f / I.m) * 0.002; x += v * 0.002; }
    out[k] = rows;
  }
  return { Fw, cases: out, vEnd: I.v0 + I.J / I.m };
}
/* ---- 4. le magnétisme ------------------------------------------------------------------------------------------------- */
/** Force de Lorentz sur une charge q à la vitesse v dans un champ B perpendiculaire : F = q v B, rayon r = m v / (q B). */
export const lorentzR = (m, v, q, B) => (m * v) / (Math.abs(q) * B);
export const LORENTZ = { v: 1000, B: 50e-6 };   // 1 km/s dans 50 µT (l'ordre du champ terrestre)
/** Champ d'un fil droit (Ørsted 1820, Biot et Savart) : B = μ₀ I / (2π d) ; l'aiguille suit B_H + B_fil, déviée de δ. */
export const wireB = (I, d) => (MU0 * I) / (2 * Math.PI * d);
export const OERSTED = { I: 5, d: 0.05, BH: 20e-6 };
export const compassDeflection = (Bw, BH) => Math.atan2(Bw, BH) / DEG;

/* ---- 5. l'exemple de balistique ---------------------------------------------------------------------------------------- */
// Une boule d'acier de 5 cm de rayon (7 850 kg/m³) poussée par une force de 1 000 N dirigée à 30° au-dessus de l'horizontale,
// pendant 0,1 s, au ras du sol. Pendant la poussée, la boule subit la force ET son poids : c'est la somme qui l'accélère.
// Ensuite, son poids seul (vide), ou son poids et la traînée de l'air ½ ρ C_d A v² (C_d = 0,47 pour une sphère lisse à ces
// vitesses, ρ = 1,225 kg/m³). Intégration RK4 au pas de 1 ms.
export const BALL = { r: 0.05, rho: 7850, F: 1000, dt: 0.1, angle: 30, Cd: 0.47, rhoAir: 1.225 };
export const ballMass = (B = BALL) => B.rho * (4 / 3) * Math.PI * B.r ** 3;
function rk4(state, h, acc) {
  const f = (s) => { const a = acc(s); return [s[2], s[3], a[0], a[1]]; };
  const k1 = f(state), k2 = f(state.map((x, i) => x + (h / 2) * k1[i])), k3 = f(state.map((x, i) => x + (h / 2) * k2[i])), k4 = f(state.map((x, i) => x + h * k3[i]));
  return state.map((x, i) => x + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
/** Les étapes de l'exemple, et les trajectoires échantillonnées : { push, vac, air } ; chaque point { t, x, y, vx, vy }. */
export function ballistic(B = BALL, h = 0.001) {
  const m = ballMass(B), W = m * G, A = Math.PI * B.r ** 2, k = 0.5 * B.rhoAir * B.Cd * A, th = B.angle * DEG;
  const Fx = B.F * Math.cos(th), Fy = B.F * Math.sin(th);
  // la poussée : F + poids (on néglige l'air pendant 0,1 s) ; le sol porte la boule tant que Fy < poids (ici non)
  const aPush = [Fx / m, (Fy - W) / m];
  const vEnd = [aPush[0] * B.dt, aPush[1] * B.dt], pEnd = [0.5 * aPush[0] * B.dt ** 2, 0.5 * aPush[1] * B.dt ** 2];
  const naive = { v: (B.F * B.dt) / m, range: ((B.F * B.dt) / m) ** 2 * Math.sin(2 * th) / G };   // en oubliant le poids pendant la poussée
  const fly = (drag) => {
    let s = [pEnd[0], pEnd[1], vEnd[0], vEnd[1]], t = 0; const out = [{ t, x: s[0], y: s[1], vx: s[2], vy: s[3] }];
    const acc = (q) => { const v = hyp(q[2], q[3]), d = drag ? (k * v) / m : 0; return [-d * q[2], -G - d * q[3]]; };
    while (s[1] >= 0 && t < 30) { const n = rk4(s, h, acc); t += h; if (n[1] < 0) { const f = s[1] / (s[1] - n[1]); s = s.map((x, i) => x + f * (n[i] - x)); t -= h * (1 - f); out.push({ t, x: s[0], y: 0, vx: s[2], vy: s[3] }); break; } s = n; out.push({ t, x: s[0], y: s[1], vx: s[2], vy: s[3] }); }
    return out;
  };
  const vac = fly(false), air = fly(true);
  const top = (P) => P.reduce((a, b) => (b.y > a.y ? b : a));
  const v0 = hyp(...vEnd), a0 = Math.atan2(vEnd[1], vEnd[0]) / DEG;
  // portée du vide en formule fermée, depuis le point de fin de poussée (hauteur y₀) : vérifie l'intégration
  const vx = vEnd[0], vy = vEnd[1], y0 = pEnd[1], tf = (vy + Math.sqrt(vy * vy + 2 * G * y0)) / G;
  return { m, W, A, k, Fx, Fy, aPush, aPushN: hyp(...aPush), aPushAng: Math.atan2(aPush[1], aPush[0]) / DEG, vEnd, pEnd, v0, a0, naive,
    vac, air, closed: { tf, range: pEnd[0] + vx * tf, hmax: y0 + (vy * vy) / (2 * G) }, topVac: top(vac), topAir: top(air),
    dragStart: k * v0 * v0 };
}

/** Valeurs de la prose et des cartes (langue de la page). */
export function mechValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const at = atwood(ATWOOD.m1, ATWOOD.m2), tk = tackle(TACKLE.m, TACKLE.n), kr = kickResult(), bl = billiard(BILLIARD.v, BILLIARD.offset);
  const b = ballistic(), last = (P) => P[P.length - 1];
  const rP = lorentzR(M_P, LORENTZ.v, Q_E, LORENTZ.B), rE = lorentzR(M_E, LORENTZ.v, Q_E, LORENTZ.B), Bw = wireB(OERSTED.I, OERSTED.d);
  return {
    atA: nf(at.a, 2), atT: nf(at.T, 1), atW1: nf(at.w1, 1), atW2: nf(at.w2, 1), tkF: nf(tk.F, 0), tkW: nf(TACKLE.m * G, 0),
    kickDv: nf(hyp(...kr.dv), 1), kickV: nf(kr.speed, 2), kickAng: nf(kr.angle, 1), kickJ: nf(KICK.J, 3),
    isFw: nf(-ISUM.J / (ISUM.wind[1] - ISUM.wind[0]), 3), isJ: nf(-ISUM.J, 2), isVend: nf(ISUM.v0 + ISUM.J / ISUM.m, 1),
    frAng: nf(framesResult().angleGround, 1), frSpeed: nf(framesResult().speedGround, 2),
    ...(() => { const c = collision(); return { clV: nf(hyp(...c.C.v), 2), clAng: nf(Math.atan2(c.C.v[1], c.C.v[0]) / DEG, 1), clVx: nf(c.C.v[0], 2), clVy: nf(c.C.v[1], 2), clVn: nf(c.vn, 2), clVt: nf(hyp(...c.vt), 2), clJ: nf(c.J, 3), clPhi: nf(c.C.phi, 0), clM: nf(c.C.m * 1000, 0), clF: nf(c.FmaxReal, 0), clFm: nf(c.Fmean, 0), clAg: nf(c.aMax / G, 0), clA: nf(c.aMax, 0), clTc: nf(c.C.tauReal * 1000, 1), clE: nf(0.5 * c.C.m * (c.C.v[0] ** 2 + c.C.v[1] ** 2) * 1000, 0) }; })(),
    bilPhi: nf(bl.phi, 0), bilV2: nf(hyp(...bl.v2), 2), bilV1: nf(hyp(...bl.v1), 2),
    lorP: nf(rP * 100, 0), lorE: nf(rE * 1000, 2), wireB: nf(Bw * 1e6, 0), compass: nf(compassDeflection(Bw, OERSTED.BH), 0),
    bM: nf(b.m, 2), bW: nf(b.W, 1), bFx: nf(b.Fx, 0), bFy: nf(b.Fy, 0), bAp: nf(b.aPushN, 0), bApAng: nf(b.aPushAng, 1),
    bV0: nf(b.v0, 2), bA0: nf(b.a0, 1), bPx: nf(b.pEnd[0], 2), bPy: nf(b.pEnd[1], 2), bNaiveV: nf(b.naive.v, 2), bNaiveR: nf(b.naive.range, 1),
    bTf: nf(b.closed.tf, 2), bRange: nf(b.closed.range, 1), bHmax: nf(b.closed.hmax, 2), bRangeAir: nf(last(b.air).x, 1),
    bHmaxAir: nf(b.topAir.y, 2), bDrag: nf(b.dragStart, 2), bDragPct: nf((100 * b.dragStart) / b.W, 1), bLoss: nf(last(b.vac).x - last(b.air).x, 1),
    bA: nf(b.A * 1e4, 1),
  };
}
