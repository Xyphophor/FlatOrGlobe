// Calculs de l'onglet kappa (2026-11-27, demande du propriétaire : « un onglet curvature à côté de basics : la notion de
// courbure en mathématique, des tangentes qui se déplacent, le passage en 3D, le plan à 0 et la sphère à 1/R (1/R²) ; puis
// comment détecter la courbure, et surtout comment calculer un rayon sur un plan échoue : des mesures planes, un rayon
// calculé bêtement, une ou deux mesures qui ne se contredisent pas, puis beaucoup, et la corrélation s'effondre »).
// Tout est pur et testé (logic.test.js) : la courbure d'une courbe, celle d'une surface, les relevés simulés sur un plan
// et sur une sphère avec le même bruit d'instrument, et l'ajustement qui en tire un rayon.

export const R_EARTH = 6371;                 // km, rayon moyen (IUGG)
export const DEG = Math.PI / 180, ARCMIN = DEG / 60, ARCSEC = DEG / 3600;
export const FLAT_SUN_H = 5000;              // km : le Soleil plat de l'onglet persp (Britannica 5 500 km, TFES 4 828 km)

/* ---- 1. la courbure d'une courbe ----------------------------------------------------------------------------------------- */

/** Courbure signée d'un graphe y(x) : κ = y″ / (1 + y′²)^{3/2} (positive quand la courbe tourne à gauche). */
export const graphCurvature = (d1, d2) => d2 / Math.pow(1 + d1 * d1, 1.5);

/** Courbure de trois points (Menger) : 1 / rayon du cercle qui passe par eux = 4 · aire / (a b c), signée. */
export function mengerCurvature(p, q, r) {
  const a = Math.hypot(q[0] - p[0], q[1] - p[1]), b = Math.hypot(r[0] - q[0], r[1] - q[1]), c = Math.hypot(r[0] - p[0], r[1] - p[1]);
  const cross = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);   // 2 × aire signée
  return a && b && c ? (2 * cross) / (a * b * c) : 0;
}

/** Échantillonne une courbe paramétrée (fonction t → [x, y], t ∈ [0, 1]) par abscisse curviligne : points, angle de la
 *  tangente θ (déroulé, sans saut de 2π), longueur s cumulée et courbure κ = dθ/ds. */
export function sampleCurve(fn, n = 400) {
  const P = []; for (let i = 0; i <= n; i++) P.push(fn(i / n));
  const s = [0]; for (let i = 1; i <= n; i++) s.push(s[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const th = [];
  for (let i = 0; i <= n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n, i + 1)];
    let t = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (i) { while (t - th[i - 1] > Math.PI) t -= 2 * Math.PI; while (t - th[i - 1] < -Math.PI) t += 2 * Math.PI; }
    th.push(t);
  }
  const k = th.map((_, i) => {
    const a = Math.max(0, i - 1), b = Math.min(n, i + 1);
    return s[b] - s[a] ? (th[b] - th[a]) / (s[b] - s[a]) : 0;
  });
  return { P, s, th, k, L: s[n] };
}

/** Le point d'une courbe échantillonnée à l'abscisse curviligne s (interpolé) : { x, y, th, k }. */
export function atArc(c, s) {
  s = Math.max(0, Math.min(c.L, s));
  let lo = 0, hi = c.s.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c.s[m] <= s) lo = m; else hi = m; }
  const f = c.s[hi] > c.s[lo] ? (s - c.s[lo]) / (c.s[hi] - c.s[lo]) : 0, L = (a, b) => a + (b - a) * f;
  return { x: L(c.P[lo][0], c.P[hi][0]), y: L(c.P[lo][1], c.P[hi][1]), th: L(c.th[lo], c.th[hi]), k: L(c.k[lo], c.k[hi]) };
}

/** La courbe ondulée de l'animation (une route vue d'en haut, en mètres), x de −60 à 60 m. */
export const WAVY = { x0: -60, x1: 60, y: (x) => 9 * Math.sin(x / 11) + 4 * Math.sin(x / 5.3 + 1),
  d1: (x) => (9 / 11) * Math.cos(x / 11) + (4 / 5.3) * Math.cos(x / 5.3 + 1),
  d2: (x) => -(9 / 121) * Math.sin(x / 11) - (4 / 28.09) * Math.sin(x / 5.3 + 1) };
export const CIRCLE_R = 20;                  // m : le rond-point de l'animation

/* ---- 2. la courbure d'une surface ---------------------------------------------------------------------------------------- */

/** Courbure de Gauss K = κ₁ κ₂ (produit des courbures principales) et courbure moyenne H = (κ₁ + κ₂)/2. */
export const gaussK = (k1, k2) => k1 * k2;
export const SURFACES = (R) => ({
  plane: { k1: 0, k2: 0 }, sphere: { k1: 1 / R, k2: 1 / R }, cylinder: { k1: 1 / R, k2: 0 }, saddle: { k1: 1 / R, k2: -1 / R },
});

/** Excès d'un triangle géodésique sur une surface de courbure K constante : ε = K · A (Girard, Gauss). */
export const excessOf = (A, K) => K * A;
/** Circonférence d'un cercle de rayon r (mesuré sur la surface) sur une sphère de rayon R : 2πR sin(r/R). */
export const sphereCircumference = (r, R) => 2 * Math.PI * R * Math.sin(r / R);
/** La courbure tirée d'un cercle (Bertrand, Diguet, Puiseux, 1848) : K ≈ 3 (2πr − C) / (π r³). */
export const kFromCircle = (r, C) => (3 * (2 * Math.PI * r - C)) / (Math.PI * r ** 3);

/* ---- 3. les relevés simulés : un plan et une sphère, le même instrument ------------------------------------------------- */

/** Générateur pseudo-aléatoire reproductible (mulberry32) et loi normale (Box-Muller). */
export function rng(seed) {
  let a = seed >>> 0;
  const u = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let spare = null;
  const g = () => { if (spare != null) { const s = spare; spare = null; return s; } let x, y, r; do { x = 2 * u() - 1; y = 2 * u() - 1; r = x * x + y * y; } while (!r || r >= 1); const m = Math.sqrt((-2 * Math.log(r)) / r); spare = y * m; return x * m; };
  return { u, g };
}

/* lieux et angles (méthode travel) : [φ, λ] en radians */
/** Un lieu tiré au hasard, uniforme en surface entre 60° S et 75° N (là où sont les stations et les aéroports). */
export function randLatLon(r) { const a = Math.sin(-60 * DEG), b = Math.sin(75 * DEG); return [Math.asin(a + (b - a) * r.u()), Math.PI * (2 * r.u() - 1)]; }
/** L'angle au centre entre deux lieux (formule des cosinus, sous forme haversine). */
export function centralAngle([f1, l1], [f2, l2]) { const h = Math.sin((f2 - f1) / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin((l2 - l1) / 2) ** 2; return 2 * Math.asin(Math.min(1, Math.sqrt(h))); }
/** Le lieu à l'angle th et au cap az d'un autre, sur la sphère. */
export function destination([f, l], th, az) { const f2 = Math.asin(Math.sin(f) * Math.cos(th) + Math.cos(f) * Math.sin(th) * Math.cos(az)); return [f2, l + Math.atan2(Math.sin(az) * Math.sin(th) * Math.cos(f), Math.cos(th) - Math.sin(f) * Math.sin(f2))]; }
/** La distance droite entre deux lieux sur la carte azimutale équidistante du pôle Nord (rayon de la carte R (π/2 − φ)). */
export function aeDistance([f1, l1], [f2, l2], R = R_EARTH) { const r1 = R * (Math.PI / 2 - f1), r2 = R * (Math.PI / 2 - f2); return Math.sqrt(r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(l2 - l1)); }

/**
 * Les six méthodes, chacune écrite y = c · x : la sphère de rayon R donne c = R^(−power) (1/R, 1/R² ou 1/√R), le plan c = 0.
 * x et y sont ce que l'observateur calcule de ses relevés, sans rien supposer de la forme ; seul le bruit de l'instrument
 * (sigma) est commun aux deux surfaces. Le Soleil d'Ératosthène est à l'infini sur la sphère et à FLAT_SUN_H au-dessus du
 * plan (le Soleil des modèles plats ; à l'infini le plan donnerait y = 0 exactement, comme les quatre autres).
 *   gen(surface, u) → { x, y, raw } ; raw = les grandeurs lues, pour l'affichage.
 */
export const METHODS = {
  dip: {
    power: 0.5, sigma: 1 * ARCMIN, xUnit: "√km", yUnit: "rad", n: 200,
    // hauteur de l'œil de 50 m à 12 km (côte, collines, avion), uniforme en log ; δ lu à 1′ près ; y = δ ≈ √(2h) / √R,
    // donc c = 1/√R et R = 1/c² (power 0.5)
    gen(surf, r, R = R_EARTH) {
      const h = 0.05 * Math.pow(240, r.u()), d0 = surf === "sphere" ? Math.acos(R / (R + h)) : 0, d = d0 + this.sigma * r.g();
      return { x: Math.sqrt(2 * h), y: d, raw: { h, dip: d } };
    },
  },
  zenith: {
    power: 1, s1: 10 * ARCSEC, get sigma() { return Math.SQRT2 * this.s1; }, xUnit: "km", yUnit: "rad", n: 200,
    // lignes de 10 à 120 km ; deux distances zénithales lues à 10″ près ; y = z_A + z_B − 180° = d/R (sans air)
    gen(surf, r, R = R_EARTH) {
      const d = 10 + 110 * r.u(), e = surf === "sphere" ? d / R : 0, sA = this.s1 * r.g(), sB = this.s1 * r.g();
      return { x: d, y: e + sA + sB, raw: { d, sum: 180 + (e + sA + sB) / DEG } };
    },
  },
  triangle: {
    power: 2, s1: 0.7 * ARCSEC, get sigma() { return Math.sqrt(3) * this.s1; }, xUnit: "km²", yUnit: "rad", n: 300,
    // aires de 50 à 15 000 km² (uniformes en log), trois angles lus à 0,7″ près ; y = α₁ + α₂ + α₃ − 180° = A/R²
    gen(surf, r, R = R_EARTH) {
      const A = 50 * Math.pow(300, r.u()), e = surf === "sphere" ? A / (R * R) : 0;
      let n = 0; for (let i = 0; i < 3; i++) n += this.s1 * r.g();
      return { x: A, y: e + n, raw: { A, sum: 180 + (e + n) / DEG } };
    },
  },
  circle: {
    power: 2, sigma: 1e-5, xUnit: "km³", yUnit: "km", n: 200,
    // un cercle parcouru autour d'un piquet, de 20 à 300 km de rayon (mesuré au sol), sa circonférence mesurée à 10⁻⁵ près ;
    // y = 2πr − C = π r³ / (3R²) (au premier ordre, exact dans le test) ; sigma relatif à C
    gen(surf, r, R = R_EARTH) {
      const rr = 20 + 280 * r.u(), C0 = surf === "sphere" ? sphereCircumference(rr, R) : 2 * Math.PI * rr, C = C0 * (1 + this.sigma * r.g());
      return { x: (Math.PI * rr ** 3) / 3, y: 2 * Math.PI * rr - C, raw: { r: rr, C }, s: this.sigma * C0 };
    },
  },
  erat: {
    power: 1, s1: 0.1 * DEG, get sigma() { return Math.SQRT2 * this.s1; }, xUnit: "km", yUnit: "rad", n: 200,
    // deux bâtons sur la ligne qui mène sous le Soleil, le premier de 0 à 8 000 km de ce point, le second 200 à 1 500 km plus
    // loin ; l'angle de l'ombre lu à 0,1° près ; y = Δz = d/R sur la sphère, arctan(r₂/H) − arctan(r₁/H) sur le plan
    gen(surf, r, R = R_EARTH, H = FLAT_SUN_H) {
      const r1 = 8000 * r.u(), d = 200 + 1300 * r.u(), r2 = r1 + d;
      const z1 = surf === "sphere" ? r1 / R : Math.atan(r1 / H), z2 = surf === "sphere" ? r2 / R : Math.atan(r2 / H);
      const n1 = this.s1 * r.g(), n2 = this.s1 * r.g();
      return { x: d, y: z2 + n2 - (z1 + n1), raw: { r1, d, z1: (z1 + n1) / DEG, z2: (z2 + n2) / DEG } };
    },
  },
  travel: {
    power: -1, rel: 0.015, abs: 20, xUnit: "rad", yUnit: "km", n: 200,
    // (2026-11-27, propriétaire : « la méthode vitesse × temps de trajet / angle, utilisée pour les séismes et les avions »)
    // deux lieux donnés par leurs latitude et longitude (des angles lus sur le ciel), une onde ou un avion de vitesse connue
    // qui va de l'un à l'autre : y = v t (km), x = θ, l'angle au centre que donnent les deux coordonnées (formule de la
    // sphère : c'est le pas « qui suppose le globe »), pente R. Sur la sphère v t = R θ. Sur le plan, les mêmes coordonnées
    // posées sur la carte azimutale du pôle des modèles plats (un degré de latitude = πR/180, leur convention), v t est la
    // distance droite sur cette carte. Erreur : 1,5 % du trajet + 20 km (vent, détours, vitesse connue à quelques % près).
    gen(surf, r, R = R_EARTH) {
      const p1 = randLatLon(r), th = (10 + 110 * r.u()) * DEG, az = 2 * Math.PI * r.u(), p2 = destination(p1, th, az);
      const d0 = surf === "sphere" ? R * th : aeDistance(p1, p2, R), s = this.rel * d0 + this.abs, d = d0 + s * r.g();
      return { x: centralAngle(p1, p2), y: d, s, raw: { p1, p2, th: centralAngle(p1, p2) / DEG, d } };
    },
  },
};
export const METHOD_IDS = ["dip", "zenith", "triangle", "circle", "erat", "travel"];
export const SEEDS = { dip: 11, zenith: 23, triangle: 37, circle: 41, erat: 53, travel: 67 };

/** Les relevés d'une méthode sur une surface : les n premiers d'une suite reproductible. Plan et sphère partagent les
 *  tirages de géométrie et de bruit (même graine) : seul le modèle diffère. */
export function survey(id, surf, n = METHODS[id].n, seed = SEEDS[id]) {
  const m = METHODS[id], r = rng(seed), out = [];
  for (let i = 0; i < n; i++) out.push(m.gen(surf, r));
  return out;
}

/**
 * L'ajustement naïf : la droite y = c x par l'origine (moindres carrés pondérés par le bruit connu), puis le rayon
 * R = c^(−1/power). Renvoie aussi l'erreur sur c, la corrélation r de Pearson entre x et y, et χ²/ν (dispersion autour de
 * la droite divisée par le bruit de l'instrument : 1 si le modèle « y proportionnel à x » tient, beaucoup plus sinon).
 *   R : null quand c ≤ 0 (pas de rayon réel) ; Rlo/Rhi : R pour c ± σ_c (Infinity quand c − σ_c ≤ 0).
 */
export function fitRadius(pts, { power = 1, sigma = 1 } = {}) {
  const n = pts.length; if (!n) return null;
  let sxx = 0, sxy = 0;
  for (const p of pts) { const w = 1 / (p.s ?? sigma) ** 2; sxx += w * p.x * p.x; sxy += w * p.x * p.y; }
  const c = sxy / sxx, sc = 1 / Math.sqrt(sxx);
  let chi = 0; for (const p of pts) chi += ((p.y - c * p.x) / (p.s ?? sigma)) ** 2;
  const nu = n - 1, chi2nu = nu > 0 ? chi / nu : null;
  let r = null;
  if (n >= 2) {
    const mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
    let a = 0, b = 0, d = 0; for (const p of pts) { a += (p.x - mx) * (p.y - my); b += (p.x - mx) ** 2; d += (p.y - my) ** 2; }
    r = b && d ? a / Math.sqrt(b * d) : 0;
  }
  const toR = (cc) => (cc > 0 ? Math.pow(cc, -1 / power) : null);
  let R = toR(c), Rlo = toR(c + sc), Rhi = c - sc > 0 ? toR(c - sc) : Infinity;
  if (power < 0 && Rlo != null) [Rlo, Rhi] = [toR(c - sc) ?? 0, Rlo];   // R = c : la borne basse vient de c − σ
  return { n, c, sc, R, Rlo, Rhi, r, chi2nu, z: c / sc };
}

/** L'évolution de la corrélation r et de χ²/ν quand les relevés s'ajoutent un à un (2026-11-27, propriétaire : « à chaque
 *  mesure supplémentaire, un point dans le graphe ») : [{ n, r, chi2nu }] pour n = 2 … pts.length, sommes cumulées. */
export function fitSeries(pts, { sigma = 1 } = {}) {
  const out = []; let n = 0, sxx = 0, sxy = 0, syy = 0, ux = 0, uy = 0, uxx = 0, uyy = 0, uxy = 0;
  for (const p of pts) {
    const w = 1 / (p.s ?? sigma) ** 2; n++;
    sxx += w * p.x * p.x; sxy += w * p.x * p.y; syy += w * p.y * p.y;   // pondérées : la droite par zéro et χ²
    ux += p.x; uy += p.y; uxx += p.x * p.x; uyy += p.y * p.y; uxy += p.x * p.y;   // brutes : r de Pearson
    if (n < 2) continue;
    const c = sxy / sxx, chi = syy - 2 * c * sxy + c * c * sxx;           // Σ w (y − c x)²
    const cov = uxy - (ux * uy) / n, vx = uxx - (ux * ux) / n, vy = uyy - (uy * uy) / n;
    out.push({ n, r: vx > 0 && vy > 0 ? cov / Math.sqrt(vx * vy) : 0, chi2nu: chi / (n - 1) });
  }
  return out;
}

/** Le rayon d'UN relevé seul : R = (x/y)^(1/power) ; null si y ≤ 0 (la surface semblerait creuse). */
export const singleRadius = (p, power = 1) => (p.y > 0 ? Math.pow(p.x / p.y, 1 / power) : null);

/** Le nombre de relevés montrés à l'instant u ∈ [0, 1) de l'animation : 1, puis 2 (chacun tenu), puis une montée
 *  géométrique jusqu'à n, tenue à la fin. */
export function countAt(u, n) {
  if (u < 0.12) return 1;
  if (u < 0.26) return 2;
  if (u < 0.34) return 3;
  const f = Math.min(1, (u - 0.34) / 0.5);
  return Math.max(3, Math.min(n, Math.round(3 * Math.pow(n / 3, f))));
}

/** Les cinq ajustements à N relevés, plan et sphère : ce que dit la page et le tableau. */
export function summary(N) {
  const out = {};
  for (const id of METHOD_IDS) {
    const m = METHODS[id], n = N ?? m.n;
    out[id] = { plane: fitRadius(survey(id, "plane", n), m), sphere: fitRadius(survey(id, "sphere", n), m) };
  }
  return out;
}

/* ---- 4. les nombres de la prose ----------------------------------------------------------------------------------------- */

const fmt = (lang, d = 0) => (x) => (x == null ? "—" : !isFinite(x) ? "∞" : x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));

/** Les valeurs citées par la prose et les cartes (span.cv[data-v], {{clé}}). */
export function kappaValues(lang = "en") {
  const f0 = fmt(lang, 0), f1 = fmt(lang, 1), f2 = fmt(lang, 2), f3 = fmt(lang, 3);
  const v = {};
  v.R = f0(R_EARTH);
  v.kEarth = (1 / R_EARTH).toExponential(3).replace("e-4", " × 10⁻⁴").replace(".", lang === "en" ? "." : ",");
  v.KEarth = (1 / R_EARTH ** 2).toExponential(2).replace("e-8", " × 10⁻⁸").replace(".", lang === "en" ? "." : ",");
  v.circleR = f0(CIRCLE_R);
  // un tour de terrain de football (100 m) sur la Terre : de combien il tourne
  v.turn100 = f2((0.1 / R_EARTH) / ARCSEC);                 // ″ par 100 m
  v.turn1km = f1((1 / R_EARTH) / ARCSEC);
  v.turnDeg = f0((Math.PI / 180) * R_EARTH);                  // km par degré
  // excès : un triangle de 1 000 km² et celui de Gauss (aire ~ 2 900 km²)
  v.exc1000 = f2((1000 / R_EARTH ** 2) / ARCSEC);
  v.excPerArcsec = f0(R_EARTH ** 2 * ARCSEC);                // km² par seconde d'arc
  // cercle de 100 km : sa circonférence manque
  v.circ100 = f0(1000 * (2 * Math.PI * 100 - sphereCircumference(100, R_EARTH)));   // m
  v.circ10 = f1(1000 * 1000 * (2 * Math.PI * 10 - sphereCircumference(10, R_EARTH)));  // mm
  // Soleil plat : Ératosthène près du point sous le Soleil donne R ≈ H
  v.sunH = f0(FLAT_SUN_H);
  v.eratNear = f0(FLAT_SUN_H);
  v.eratFar = f0((FLAT_SUN_H ** 2 + 8000 ** 2) / FLAT_SUN_H);   // R apparent à 8 000 km du point sous le Soleil : (H² + r²)/H
  // refraction sur un plan : la somme des distances zénithales réciproques passe sous 180°
  v.k = f2(0.13);
  v.rho = f0(R_EARTH / 0.13);
  v.planeAir100 = f1((100 / (R_EARTH / 0.13)) / ARCMIN);       // ′ sous 180° à 100 km
  // les ajustements
  const S = summary();
  for (const id of METHOD_IDS) {
    const m = METHODS[id], p = S[id].plane, s = S[id].sphere;
    v[`${id}N`] = f0(m.n);
    v[`${id}SphR`] = f0(s.R); v[`${id}SphLo`] = f0(s.Rlo); v[`${id}SphHi`] = f0(s.Rhi);
    v[`${id}SphRr`] = f3(s.r); v[`${id}SphChi`] = f2(s.chi2nu);
    v[`${id}PlR`] = p.R == null ? "—" : f0(p.R); v[`${id}PlRr`] = f2(p.r); v[`${id}PlChi`] = p.chi2nu > 100 ? f0(p.chi2nu) : f2(p.chi2nu);
    v[`${id}PlZ`] = f1(Math.abs(p.z));
    // le premier et le deuxième relevé du plan, seuls
    const P = survey(id, "plane", 2), s1 = singleRadius(P[0], m.power), s2 = singleRadius(P[1], m.power);
    v[`${id}Pl1`] = s1 == null ? "—" : f0(s1); v[`${id}Pl2`] = s2 == null ? "—" : f0(s2);
    const f2p = fitRadius(P, m); v[`${id}Pl2fit`] = f2p.R == null ? "—" : f0(f2p.R);
  }
  // Ératosthène sur le plan : moitié proche (r₁ < 2 000 km) contre moitié lointaine (r₁ > 6 000 km)
  { const m = METHODS.erat, all = survey("erat", "plane"), near = all.filter((p) => p.raw.r1 < 2000), far = all.filter((p) => p.raw.r1 > 6000);
    v.eratPlNear = f0(fitRadius(near, m).R); v.eratPlFar = f0(fitRadius(far, m).R); v.eratNearN = f0(near.length); v.eratFarN = f0(far.length);
    const sn = all.filter((p) => p.raw.r1 < 2000), sAll = survey("erat", "sphere"), sNear = sAll.filter((p, i) => all[i].raw.r1 < 2000), sFar = sAll.filter((p, i) => all[i].raw.r1 > 6000);
    v.eratSphNear = f0(fitRadius(sNear, m).R); v.eratSphFar = f0(fitRadius(sFar, m).R); void sn; }
  // vitesse × temps sur le plan : trajets de l'hémisphère nord contre trajets du sud
  { const m = METHODS.travel, P = survey("travel", "plane"), S = survey("travel", "sphere");
    const north = (p) => p.raw.p1[0] > 15 * DEG && p.raw.p2[0] > 15 * DEG, south = (p) => p.raw.p1[0] < -10 * DEG && p.raw.p2[0] < -10 * DEG;
    v.travPlNorth = f0(fitRadius(P.filter(north), m).R); v.travPlSouth = f0(fitRadius(P.filter(south), m).R);
    v.travSphNorth = f0(fitRadius(S.filter((p, i) => north(P[i])), m).R); v.travSphSouth = f0(fitRadius(S.filter((p, i) => south(P[i])), m).R);
    v.travNorthN = f0(P.filter(north).length); v.travSouthN = f0(P.filter(south).length); }
  return v;
}
