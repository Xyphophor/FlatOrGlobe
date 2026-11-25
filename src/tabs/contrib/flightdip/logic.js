// Contribution « dips mesurés en avion » (earthlyskeptic, application Theodolite, 2 vols, septembre 2025 ; 2026-10-15).
// Géométrie pure des figures : la dépression de l'horizon pour une hauteur h' au-dessus du relief de l'horizon,
// sur une sphère (rayon R, lumière droite) ou sur un plan dont le bord se perd dans la brume à D ; le décalage
// constant b d'un instrument. La réfraction de l'air du jour (rayons tracés), les hauteurs (transpondeur) et les
// accélérations viennent de fog (tools/internal/build/flightdip), par photo.
export const R0 = 6371e3;
const D2R = Math.PI / 180;

/** Dip (degrés) d'une sphère de rayon R vue de h' m au-dessus de sa surface : cos δ = R/(R + h'). */
export const dipGlobe = (h, R = R0) => Math.acos(R / (R + h)) / D2R;
/** Dip (degrés) d'un plan dont le bord se perd à D m : atan(h'/D) ; D infini : 0. */
export const dipPlane = (h, D = Infinity) => (Number.isFinite(D) ? Math.atan(h / D) / D2R : 0);
/** Le rayon (m) qu'un dip seul donne : R = h' cos δ / (1 − cos δ). */
export const radiusFrom = (h, dipDeg) => { const c = Math.cos(dipDeg * D2R); return (h * c) / (1 - c); };
/** La distance (m) du point tangent sur la sphère : √(2Rh'). */
export const tangentDist = (h, R = R0) => Math.sqrt(2 * R * h);

/** Hauteur au-dessus du relief de l'horizon (m) : lumière droite, ou l'horizon trouvé dans l'air du jour. */
export const hEff = (p, air = false) => p.h - (air ? p.zhA : p.zh);

/** La lecture une fois retirée l'accélération de l'avion (null quand le journal ne la résout pas). */
export const dipCorrected = (p) => (p.unresolved ? null : p.dip + p.tilt);

/** Les nombres d'un point : ce que prédisent la sphère (relief compris, lumière droite et air du jour), le plan, le
 * rayon qu'il donne seul. */
export function pointNumbers(p) {
  const he = hEff(p);
  return { he, Rself: radiusFrom(he, p.dip) / 1000, RselfExif: radiusFrom(he, p.dipExif) / 1000, globe: p.globeDip, globeA: p.globeDipA,
    corr: dipCorrected(p), flatD: p.flatD / 1000, flatEsc: p.flatEsc, tangent: tangentDist(he) / 1000, gap: p.dip - p.globeDipA };
}

/** La variante d'ajustement par son nom (FD_FITS). */
export const fitNamed = (fits, name) => fits.find((f) => f.name === name);

/** Lignes de visée pour la figure de l'enveloppe, à l'exagération ex (règle 1 : hauteurs × ex, planète ÷ ex, même
 * échelle dans les deux sens) : une ligne part de (0, h'·ex) et touche le cercle de rayon R_δ/ex centré en
 * (0, −R_δ/ex), R_δ = le rayon que ce dip donne seul ; l'angle dessiné est donc cos a = (R_δ/ex)/(R_δ/ex + h'·ex),
 * exact. Des dips qui s'accordent sur un rayon R touchent tous le même cercle R/ex : l'enveloppe. */
export function sightline(he, dipDeg, ex) {
  const Rd = radiusFrom(he, dipDeg) / ex, y0 = he * ex, a = Math.acos(Rd / (Rd + y0));
  return { y0, a, slope: -Math.tan(a), xTangent: Rd * Math.sin(a), yTangent: Rd * Math.cos(a) - Rd };
}
