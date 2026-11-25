// Onglet "rocket" (2026-10-27, demande du propriétaire : « j'ai besoin d'expliquer les fusées ») : comment une pression
// existe dans une chambre fermée, pourquoi un trou la déséquilibre, pourquoi l'atmosphère ne sert à rien (elle gêne), et la
// conservation de la quantité de mouvement. Logique pure, testée ; les [n] renvoient à src/data/sources/rocket.js.
import { ussa, K_B } from "../atmo/logic.js";

export const G0 = 9.80665;          // m/s², pesanteur conventionnelle (définition de l'impulsion spécifique)
export const P_ATM = 101325;        // Pa, atmosphère normale
export const LBF = 4.4482216152605; // N par livre-force
export const FT = 0.3048, INCH = 0.0254;

// Le RS-25 (moteur principal de la navette, puis du SLS) à 109 % : poussées de la fiche NASA [8], impulsions spécifiques du
// constructeur [9], pression de chambre, débit et diamètres de la tuyère [10] ; température de fonctionnement maximale de la
// fiche NASA, +6 000 °F [8].
export const RS25 = {
  fVacLbf: 512300, fSlLbf: 416300, ispVac: 452.3, ispSl: 366, pc: 20.64e6, mdot: 514.49,
  exitD: 90.7 * INCH, throatD: 10.3 * INCH, tMaxF: 6000,
};

/** Poussée F = ṁ vₑ + (pₑ − pₐ) Aₑ (Sutton [7]) : ce que l'air change, c'est le seul terme pₐ Aₑ. */
export const thrust = ({ mdot, ve, pe, pa, Ae }) => mdot * ve + (pe - pa) * Ae;

/** Les nombres du RS-25 recalculés une fois : poussées en N, la différence vide − sol, et ce que donne pₐ × aire de sortie. */
export function rs25() {
  const R = RS25, fVac = R.fVacLbf * LBF, fSl = R.fSlLbf * LBF, diff = fVac - fSl;
  const Ae = Math.PI * (R.exitD / 2) ** 2, At = Math.PI * (R.throatD / 2) ** 2;
  const aeFromDiff = diff / P_ATM, dFromDiff = 2 * Math.sqrt(aeFromDiff / Math.PI);
  const cVac = R.ispVac * G0, cSl = R.ispSl * G0;   // vitesses d'éjection effectives F/ṁ
  const mdotIsp = fVac / cVac;                        // le débit que donnent la poussée et l'impulsion spécifique
  const cStar = (R.pc * At) / R.mdot;                 // vitesse caractéristique p_c A_t / ṁ
  const Tc = (R.tMaxF - 32) * 5 / 9 + 273.15;
  const nC = R.pc / (K_B * Tc), sea = ussa(0);
  return { fVac, fSl, diff, gain: fVac / fSl - 1, Ae, At, paAe: P_ATM * Ae, aeFromDiff, dFromDiff, cVac, cSl, mdotIsp, cStar,
    pcAtm: R.pc / P_ATM, Tc, nC, nSea: sea.n, nRatio: nC / sea.n, hitsSea: (sea.n * sea.v) / 4 };
}

// Goddard, Clark University, 1915-1916, publié en 1919 [11] : poudre sans fumée brûlée dans une chambre d'acier à tuyère de
// Laval, en l'air puis dans un réservoir vidé entre 7,6 et 0,5 mm de mercure ; le recul de la chambre donne la vitesse
// d'éjection. « Une tendance générale des vitesses dans le vide à être plus grandes que dans l'air » ; +22 % pour la poudre
// Infallible et la tuyère moyenne ; la plus haute vitesse sûre dans le vide, 2,34 km/s (7 680 ft/s).
export const GODDARD = { mmHgHi: 7.6, mmHgLo: 0.5, gainPct: 22, vVac: 2.34e3, vVacFt: 7680 };
export const mmHgToAtm = (mm) => mm / 760;

/** Pression cinétique (Bernoulli 1738, Maxwell 1860 [4][5]) : p = n k T = ⅓ ρ ⟨v²⟩ ; en 2D (les animations) p = n m ⟨v²⟩/2. */
export const kineticP = (n, T) => n * K_B * T;
/** Choc d'une bille sur une paroi : elle repart avec la composante normale inversée, la paroi reçoit 2 m vₙ. */
export const wallKick = (m, vn) => 2 * m * Math.abs(vn);

/** Débit sortant d'une chambre à col sonique (Sutton [7]) : ṁ = p_c A_t / c* ; à l'équilibre, p_c = ṁ c* / A_t. */
export const chamberP = (mdot, cStar, At) => (mdot * cStar) / At;
/** Remplissage d'une chambre : dN/dt = Ṅ_in − N/τ  ⇒  N(t) = Ṅ_in τ (1 − e^(−t/τ)). */
export const fill = (t, nIn, tau) => nIn * tau * (1 - Math.exp(-t / tau));

/** Équation de Tsiolkovski (1903 [13]) : Δv = u ln(m₀/m₁). */
export const deltaV = (u, m0, m1) => u * Math.log(m0 / m1);
/** Le rapport de masses qu'il faut pour Δv à la vitesse d'éjection u. */
export const massRatio = (dv, u) => Math.exp(dv / u);

/**
 * Une fusée de masse M₀ qui jette n boulettes de masse dm à la vitesse relative u, dans l'espace vide, partie au repos : sa
 * vitesse après k jets est exacte (chaque jet conserve la quantité de mouvement), et le centre de masse de la fusée et de
 * toutes les boulettes reste immobile. Sert à l'animation et à vérifier que la limite continue redonne Tsiolkovski.
 */
export function pellets(M0, dm, u, k) {
  let M = M0, v = 0; const out = [];
  for (let i = 0; i < k; i++) {
    // la boulette part à v − u' où u' est tel que la vitesse RELATIVE après le jet vaille u : (M − dm)(v + dv) + dm (v + dv − u) = M v
    const dv = (dm * u) / M; M -= dm; v += dv; out.push({ i, v, M, pv: v - u });
  }
  return { v, M, out };
}

export const ORBIT_V = 7.9e3;   // m/s, vitesse d'une orbite rasante (onglet orb)

/** Valeurs de la prose, des figures et des cartes, dans la langue de la page. */
export function rocketValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const r = rs25(), mr = massRatio(ORBIT_V, r.cVac);
  const sci = (x, d = 1) => { const e = Math.floor(Math.log10(x)); return `${nf(x / 10 ** e, d)} × 10${String(e).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]).join("")}`; };
  return {
    fVac: nf(r.fVac / 1e3), fSl: nf(r.fSl / 1e3), diff: nf(r.diff / 1e3), gain: nf(r.gain * 100), paAe: nf(r.paAe / 1e3),
    ae: nf(r.Ae, 2), aeDiff: nf(r.aeFromDiff, 2), dDiff: nf(r.dFromDiff, 2), exitD: nf(RS25.exitD, 2), throatD: nf(RS25.throatD, 2),
    cVac: nf(r.cVac / 1e3, 2), cSl: nf(r.cSl / 1e3, 2), mdot: nf(RS25.mdot), cStar: nf(r.cStar / 1e3, 1), pcBar: nf(RS25.pc / 1e5),
    pcAtm: nf(r.pcAtm), Tc: nf(r.Tc), TcC: nf(Math.round((r.Tc - 273.15) / 100) * 100), nC: sci(r.nC), nSea: sci(r.nSea), nRatio: nf(r.nRatio),
    hitsSea: sci(r.hitsSea / 1e4), gHi: `1/${nf(1 / mmHgToAtm(GODDARD.mmHgHi))}`, gLo: `1/${nf(1 / mmHgToAtm(GODDARD.mmHgLo))}`,
    gGain: nf(GODDARD.gainPct), gV: nf(GODDARD.vVac / 1e3, 2), mrOrb: nf(mr, 1), propOrb: nf((1 - 1 / mr) * 100), lang,
  };
}
