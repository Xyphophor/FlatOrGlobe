// Onglet "phys" (2026-10-25, demande du propriétaire) : les bases de physique dont le reste du site se sert. Rien n'y est
// mesuré : des définitions, des constantes et les ordres de grandeur qu'elles donnent pour la Terre. Les valeurs sont ici,
// calculées une fois, pour que la prose (span.cv[data-v]), les tableaux et les figures disent les mêmes nombres.

// Les sept constantes qui définissent le SI depuis le 20 mai 2019 (brochure du BIPM, sources [1] de l'onglet) : exactes par définition.
// La gravitation G est mesurée (CODATA 2022, [2]) ; GM, ω, R et g sont propres à la Terre (IERS, GRS80, CGPM 1901 : [11] [12] [16]).
export const CONSTANTS = [
  { id: "c", sym: "c", value: "299 792 458", unit: "m/s", cls: "defined", src: 1 },
  { id: "h", sym: "h", value: "6.626 070 15 × 10⁻³⁴", unit: "J·s", cls: "defined", src: 1 },
  { id: "e", sym: "e", value: "1.602 176 634 × 10⁻¹⁹", unit: "C", cls: "defined", src: 1 },
  { id: "k", sym: "k_B", value: "1.380 649 × 10⁻²³", unit: "J/K", cls: "defined", src: 1 },
  { id: "na", sym: "N_A", value: "6.022 140 76 × 10²³", unit: "mol⁻¹", cls: "defined", src: 1 },
  { id: "cs", sym: "Δν_Cs", value: "9 192 631 770", unit: "Hz", cls: "defined", src: 1 },
  { id: "kcd", sym: "K_cd", value: "683", unit: "lm/W", cls: "defined", src: 1 },
  { id: "G", sym: "G", value: "6.674 30(15) × 10⁻¹¹", unit: "m³ kg⁻¹ s⁻²", cls: "measured", src: 2 },
  { id: "gm", sym: "GM⊕", value: "3.986 004 418 × 10¹⁴", unit: "m³/s²", cls: "earth", src: 11 },
  { id: "omega", sym: "ω⊕", value: "7.292 115 × 10⁻⁵", unit: "rad/s", cls: "earth", src: 11 },
  { id: "req", sym: "R_eq", value: "6 378 137", unit: "m", cls: "earth", src: 12 },
  { id: "geq", sym: "g_eq", value: "9.780 33", unit: "m/s²", cls: "earth", src: 12 },
  { id: "gpole", sym: "g_pole", value: "9.832 19", unit: "m/s²", cls: "earth", src: 12 },
  { id: "gn", sym: "g_n", value: "9.806 65", unit: "m/s²", cls: "convention", src: 16 },
];

export const C_LIGHT = 299792458;           // m/s, exacte
export const G_NEWTON = 6.6743e-11;         // m³ kg⁻¹ s⁻², CODATA 2022
export const GM_EARTH = 3.986004418e14;     // m³/s², IERS 2010
export const OMEGA_EARTH = 7.292115e-5;     // rad/s, IERS 2010
export const R_EQ = 6378137;                // m, GRS80
export const R_MEAN = 6371000;              // m, rayon moyen arrondi (IUGG : 6 371,0088 km)
export const G_EQ = 9.7803267715, G_POLE = 9.8321863685;   // m/s², pesanteur normale GRS80 (Moritz 2000)
export const MOON_A = 384400e3;             // m, demi-grand axe (NASA fact sheet)
export const MOON_T = 27.321661 * 86400;    // s, période sidérale
export const MOON_MASS_RATIO = 1 / 81.3006; // M_Lune / M_Terre
export const DAY_SOL = 86400, YEAR_TROP = 365.24219;

export const DEG = Math.PI / 180;
export const radToDeg = (r) => r / DEG;

/** Erreur relative de l'approximation des petits angles tan θ ≈ θ (θ en degrés). */
export const smallAngleError = (deg) => (Math.tan(deg * DEG) - deg * DEG) / Math.tan(deg * DEG);

/** Accélération centripète a = ω² r (m/s²). */
export const centripetal = (omega, r) => omega * omega * r;
/** Pesanteur d'une sphère sans rotation g = GM/r². */
export const gravityAt = (r, gm = GM_EARTH) => gm / (r * r);
/** g ≈ GM/R² − ω² R cos² φ : sphère qui tourne, sans l'aplatissement (φ en degrés). */
export const gSphereRot = (latDeg, r = R_MEAN) => gravityAt(r) - centripetal(OMEGA_EARTH, r) * Math.cos(latDeg * DEG) ** 2;
/** Coriolis horizontale 2 ω v sin φ (m/s²). */
export const coriolis = (v, latDeg) => 2 * OMEGA_EARTH * v * Math.sin(latDeg * DEG);
/** Période d'une orbite de demi-grand axe a (3ᵉ loi de Kepler) ; gm = G(M+m). */
export const keplerPeriod = (a, gm = GM_EARTH) => 2 * Math.PI * Math.sqrt(a ** 3 / gm);
/** Jour sidéral depuis le jour solaire et l'année : 1/T_sid = 1/T_sol + 1/T_an. */
export const siderealDay = (sol = DAY_SOL, year = YEAR_TROP * DAY_SOL) => 1 / (1 / sol + 1 / year);
/** Le test de la Lune de Newton : l'accélération de la Lune sur son orbite, et g affaibli en 1/r². */
export function moonTest() {
  const orbit = 4 * Math.PI ** 2 * MOON_A / MOON_T ** 2;
  const fromG = gravityAt(R_MEAN) * (R_MEAN / MOON_A) ** 2;
  return { orbit, fromG, fromGpair: fromG * (1 + MOON_MASS_RATIO), ratio: orbit / fromG };
}

// Exemple de mesure (nombres INVENTÉS pour l'exemple, dits tels dans la page) : douze chronométrages de la période d'un pendule
// de 1 m, à la main, et cinq longueurs avec leur T² pour l'ajustement par moindres carrés.
export const PENDULUM_T = [2.01, 1.99, 2.02, 2.00, 2.01, 2.03, 1.98, 2.00, 2.01, 2.02, 1.99, 2.01];
export const PENDULUM_FIT = [[0.2, 0.82], [0.4, 1.59], [0.6, 2.43], [0.8, 3.20], [1.0, 4.04]];   // [L (m), T² (s²)]

/** Moyenne, écart-type de l'échantillon (N − 1) et incertitude de la moyenne σ/√N. */
export function stats(xs) {
  const n = xs.length, mean = xs.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1));
  return { n, mean, sd, sem: sd / Math.sqrt(n) };
}

/** Droite des moindres carrés y = a + b x (poids égaux) ; renvoie a, b, l'incertitude de b et les résidus. */
export function lineFit(pts) {
  const n = pts.length, sx = pts.reduce((s, p) => s + p[0], 0), sy = pts.reduce((s, p) => s + p[1], 0);
  const mx = sx / n, my = sy / n, sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0), sxy = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
  const b = sxy / sxx, a = my - b * mx, res = pts.map((p) => p[1] - (a + b * p[0]));
  const s2 = res.reduce((s, r) => s + r * r, 0) / (n - 2);
  return { a, b, sb: Math.sqrt(s2 / sxx), res };
}

/** g d'après le pendule : T = 2π √(L/g) ⇒ g = 4π² L / T² (et, pour la pente de T² en fonction de L, g = 4π²/pente). */
export const gFromPendulum = (L, T) => 4 * Math.PI ** 2 * L / (T * T);

/** Toutes les valeurs que la prose et les figures affichent. */
export function physValues(lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const mt = moonTest(), st = stats(PENDULUM_T), fit = lineFit(PENDULUM_FIT);
  const gSt = gFromPendulum(1, st.mean), gStErr = gSt * 2 * st.sem / st.mean, gFit = 4 * Math.PI ** 2 / fit.b, gFitErr = gFit * fit.sb / fit.b;
  return {
    nf,
    tSid: nf(2 * Math.PI / OMEGA_EARTH, 0), tSidCalc: nf(siderealDay(), 1),
    aEq: nf(centripetal(OMEGA_EARTH, R_EQ), 4), aEqPct: nf(100 * centripetal(OMEGA_EARTH, R_EQ) / G_EQ, 2),
    gSph: nf(gravityAt(R_MEAN), 3), gEqSph: nf(gSphereRot(0), 3), gPoleSph: nf(gSphereRot(90), 3), gEq: nf(G_EQ, 3), gPole: nf(G_POLE, 3),
    cor: nf(coriolis(250, 45), 4), corPct: nf(100 * coriolis(250, 45) / 9.81, 2),
    moonOrbit: nf(mt.orbit * 1000, 3), moonG: nf(mt.fromG * 1000, 3), moonGpair: nf(mt.fromGpair * 1000, 3), moonPct: nf(100 * (mt.ratio - 1), 1),
    tMoon: nf(keplerPeriod(MOON_A) / 86400, 2), tMoonPair: nf(keplerPeriod(MOON_A, GM_EARTH * (1 + MOON_MASS_RATIO)) / 86400, 2), tMoonObs: nf(MOON_T / 86400, 2),
    tGps: nf(keplerPeriod(26560e3) / 3600, 2),
    sa1: nf(100 * smallAngleError(1), 3), sa5: nf(100 * smallAngleError(5), 2), sa10: nf(100 * smallAngleError(10), 1),
    arcsecRad: nf(DEG / 3600 * 1e6, 3),
    stMean: nf(st.mean, 3), stSd: nf(st.sd, 3), stSem: nf(st.sem, 3), stN: st.n, gSt: nf(gSt, 2), gStErr: nf(gStErr, 2),
    fitB: nf(fit.b, 3), fitSb: nf(fit.sb, 3), gFit: nf(gFit, 2), gFitErr: nf(gFitErr, 2),
  };
}
