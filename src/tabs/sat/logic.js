// Onglet sat (epic27, 2026-10-16) : grandeurs tirées de la solution Doppler (fog build sat-doppler).
// Logique pure, testée. Les valeurs « acceptées » ne servent qu'à COMPARER.

export const GM_IERS = 3.986004418;   // 1e14 m³/s², IERS Conventions 2010 (sources [8])
export const OM_IERS = 7.292115;      // 1e-5 rad/s, idem
export const WGS84 = { a: 6378.137, invF: 298.257223563 }; // [9]

const med = (v) => { const s = v.slice().sort((a, b) => a - b), n = s.length; return n % 2 ? s[n >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const sd = (v) => { const m = v.reduce((a, x) => a + x, 0) / v.length; return Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / (v.length - 1)); };

/** Les stations gardées (non exclues). */
export const keptStations = (D) => D.stations.filter((s) => !s.drop);
/** Les satellites gardés (au moins un point). */
export const keptSats = (D) => D.sats.filter((s) => !s.drop);

/** Moindres carrés r = a(1 − f sin²φ) sur les stations gardées (le même ajustement que fog). */
export function ellipse(stations) {
  const n = stations.length; let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const s of stations) { const x = Math.sin(s.lat * Math.PI / 180) ** 2; sx += x; sy += s.r; sxx += x * x; sxy += x * s.r; }
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx), a = (sy - b * sx) / n, f = -b / a;
  const rms = Math.sqrt(stations.reduce((acc, s) => acc + (s.r - a * (1 - f * Math.sin(s.lat * Math.PI / 180) ** 2)) ** 2, 0) / n);
  return { a, f, invF: 1 / f, rms };
}

/**
 * J₂ et aplatissement par Clairaut (premier ordre, corps fluide en équilibre) :
 * J₂ = μ_J/(GM a²), q = Ω² a³/GM, f ≈ 3/2 J₂ + q/2. a en km (celui de l'ellipse ajustée).
 */
export function clairaut(D, aKm) {
  const GM = D.gm * 1e14, muJ = D.muj * 1e25, om = D.om * 1e-5, a = aKm * 1e3;
  const J2 = muJ / (GM * a * a), q = (om * om * a ** 3) / GM, f = 1.5 * J2 + q / 2;
  return { J2, q, f, invF: 1 / f };
}

/** Écarts relatifs aux valeurs adoptées (ppm pour GM, ppb pour Ω). */
export const dGMppm = (D) => (D.gm / GM_IERS - 1) * 1e6;
export const dOmppb = (D) => (D.om / OM_IERS - 1) * 1e9;
/** Durée d'un tour (s) à la rotation Ω (1e-5 rad/s). */
export const turn = (om) => (2 * Math.PI) / (om * 1e-5);

/** Kepler III testée : GM de chaque satellite, médianes par constellation, dispersion (ppm). */
export function keplerStats(D) {
  const S = keptSats(D), all = S.map((s) => s.gm);
  const m = med(all), by = {};
  for (const sys of ["G", "E", "R"]) {
    const g = S.filter((s) => s.id[0] === sys);
    by[sys] = { n: g.length, gm: med(g.map((s) => s.gm)), a: med(g.map((s) => s.a)), sdPpm: (sd(g.map((s) => s.gm)) / m) * 1e6 };
  }
  const meds = Object.values(by).map((x) => x.gm);
  return { n: S.length, gm: m, sdPpm: (sd(all) / m) * 1e6, sysPpm: ((Math.max(...meds) - Math.min(...meds)) / m) * 1e6, by };
}

/** Le plus grand |vitesse| mesuré à la station d'exemple (m/s). */
export const maxRate = (D) => Math.max(...Object.values(D.passes).flat().map((p) => Math.abs(p[1])));

/**
 * L'exemple chiffré de la section « comment » (2026-10-17) : une orbite circulaire du GPS au demi-grand axe médian de la
 * solution. Vitesse v = √(GM/a), mouvement moyen n = √(GM/a³) = v/a, période T = 2π/n ; et l'inverse, GM = v³/n, ce que le
 * Doppler donne quand il a mesuré v et n. Vitesse d'un récepteur emporté par la rotation : Ω r cos φ.
 */
export function worked(D, sys = "G") {
  const a = keplerStats(D).by[sys].a * 1e3, GM = D.gm * 1e14, om = D.om * 1e-5;
  const v = Math.sqrt(GM / a), n = v / a, T = (2 * Math.PI) / n;
  const carry = (id) => { const s = D.stations.find((x) => x.id === id); return om * s.r * 1e3 * Math.cos((s.lat * Math.PI) / 180); };
  return { a, v, n, T, gmBack: v ** 3 / n, vEq: om * ellipse(keptStations(D)).a * 1e3, vW: carry(D.example), latW: D.stations.find((x) => x.id === D.example).lat };
}
