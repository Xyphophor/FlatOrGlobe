// Les onze dips lus depuis des hublots dans la statistique « l'air qu'il faut à chaque modèle » de l'onglet ref
// (2026-11-13). Ce fichier appartient à la contribution : l'onglet ref le charge par le registre sans la nommer.
//
// Pour un dip, seuls les deux bouts du rayon comptent (invariants de Bouguer et de Snell, onglet ref) : le sol de
// l'horizon (dans l'air du jour, zhA) et l'œil. L'indice qu'il faut à l'œil vient de l'indice au sol de l'horizon et
// du dip mesuré (lecture à l'écran + tilt de l'accélération) ; il devient une température à la pression et à la
// vapeur d'eau de GFS à l'œil (N = 79,01 P/T − 12,0 e/T, package refrac). Le gradient est (T_œil − T_horizon)/(h − zhA).
import { FD_POINTS } from "../../../data/presets/contrib-flightdip.js";
import { airRow, DAY_SD_K, signed } from "../../../core/air-need.js";

const R = 6371e3, D = Math.PI / 180;
/** La lecture de l'application (au dixième de degré) : ± 0,05°. */
export const READ_SD = 0.05;

/** Les onze lectures partagent un téléphone : une série, à laquelle on peut retirer un décalage constant. */
export const series = true;

/** L'indice qu'il faut à l'œil (N = (n − 1)·10⁶) pour un dip δ (degrés). */
export function flightNeye(model, p, dipDeg) {
  const n0 = 1 + p.nHz * 1e-6, c = Math.cos(dipDeg * D);
  return ((model === "flat" ? n0 / c : (n0 * (R + p.zhA)) / ((R + p.h) * c)) - 1) * 1e6;
}

/** Le dip (vrai dip = lecture + tilt) et sa fourchette (écran et EXIF, ± 0,05° de lecture et ± σ du tilt en
 * quadrature) ; b : décalage constant retiré (degrés). */
export function flightDips(p, b = 0) {
  const s = Math.hypot(READ_SD, p.sigTilt ?? 0), t = p.tilt ?? 0;
  return { dip: p.dip + t - b, lo: Math.min(p.dip, p.dipExif) + t - b - s, hi: Math.max(p.dip, p.dipExif) + t - b + s };
}

/** Un modèle : le gradient qu'il faut (K/m ; +∞ si l'indice qu'il faut est sous celui du vide) et l'écart réduit,
 * calculé sur l'indice à l'œil : la température qu'il représente part à l'infini quand N approche 0 aux basses
 * pressions de l'altitude ; l'indice est linéaire dans l'invariant. La marge du jour : DAY_SD_K à l'œil, |dN/dT| = N/T. */
function need(model, p, b) {
  const q = flightDips(p, b), dz = p.h - p.zhA, A = 79.01 * p.pEye - 12.0 * p.eEye;
  const T = (N) => (N > 0 ? A / N : Infinity), g = (N) => (T(N) - p.tHz) / dz;
  const Nn = flightNeye(model, p, q.dip), Na = flightNeye(model, p, q.lo), Nb = flightNeye(model, p, q.hi), Nd = p.nEye;
  const gap = Nn - Nd, sN = gap > 0 ? Nn - Math.min(Na, Nb) : Math.max(Na, Nb) - Nn, sD = (Nd / p.tEye) * DAY_SD_K;
  const gs = [g(Na), g(Nb)];
  return { grad: g(Nn), gLo: Math.min(...gs), gHi: Math.max(...gs), noAir: Nn <= 0, Teye: T(Nn) - 273.15, N: Nn, Nday: Nd,
    sdN: Math.hypot(sN, sD), z: -gap / Math.hypot(sN, sD) };   // un indice plus fort = un air plus froid : z < 0
}

/** Les onze lignes, un décalage par modèle retiré des lectures (b.globe, b.flat, degrés). */
export function rows({ b = { globe: 0, flat: 0 } } = {}) {
  return FD_POINTS.map((p) => {
    const dz = p.h - p.zhA, gd = (p.tEye - p.tHz) / dz;
    return airRow({ id: `fd${p.ft}`, kind: "dip", photo: +(/-(\d+)\.jpg$/.exec(p.src)?.[1] ?? 0), flight: p.flight, h: p.h, dz,
      day: { grad: gd, gLo: gd, gHi: gd }, globe: need("globe", p, b.globe), flat: need("flat", p, b.flat) });
  });
}

export const label = (r, lang, num) => (lang === "fr" ? `n° ${r.photo} vol ${r.flight}, ${num(Math.round(r.h / 10) * 10)} m` : `#${r.photo} flight ${r.flight}, ${num(Math.round(r.h / 10) * 10)} m`);

export const name = (lang) => (lang === "fr" ? "les onze dips qu'earthlyskeptic a lus depuis des hublots d'avion" : "the eleven dips earthlyskeptic read from airliner windows");

/** Son paragraphe dans la section de ref : résultats, décalage, limites. */
export function notes(lang, part) {
  const a = part.sum, s = part.sumShifted, o = part.off, nf = (x, d = 0) => (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const minF = Math.min(...part.shifted.map((r) => Math.abs(r.flat.z)));
  return lang === "fr"
    ? `<b>Les onze dips d'avion</b> (onglet des contributions ; numérotés comme là-bas, avec la hauteur de l'avion au-dessus de la mer). Lus tels qu'ils ont été faits, ils donnent au globe χ² = ${nf(a.globe.chi2)} (${a.globe.within2} sur 11 à moins de deux σ) et au plan ${nf(a.flat.chi2)} (${a.flat.within2} sur 11). Les écarts du globe penchent d'un côté, ${a.globe.colder} sur 11 vers un air plus froid : les lectures sont plus profondes que le globe dans l'air du jour, comme l'a trouvé la contribution. Le niveau d'un téléphone est rarement juste à quelques dixièmes de degré : retiré des onze lectures, le décalage constant le plus favorable à chaque modèle (globe ${nf(o.globe.b, 2)}°, plan ${nf(o.flat.b, 2)}°, les cercles de la figure) fait descendre le globe à ${nf(s.globe.chi2)} et le plan à ${nf(s.flat.chi2)}, sans aucune lecture du plan à moins de deux σ (la plus proche à ${nf(minF, 1)} σ). Le globe reste au-dessus de onze : les lectures se dispersent plus que les marges qu'on leur a données (0,05° de lecture, le tilt tiré du relevé de vol). Elles viennent d'un seul téléphone sur deux vols : ce ne sont pas onze tests indépendants. Et pour un dip, le plan garde une échappatoire que ce calcul ne couvre pas : un bord de brume à distance fixe au lieu d'un rayon rasant ; la contribution l'ajuste à ces onze lectures, où il fait presque aussi bien que le globe.`
    : `<b>The eleven aircraft dips</b> (contributions tab; numbered as there, with the aircraft's height above the sea). Taken as they were read, they give the globe χ² = ${nf(a.globe.chi2)} (${a.globe.within2} of 11 within two σ) and the plane ${nf(a.flat.chi2)} (${a.flat.within2} of 11). The globe's misses lean one way, ${a.globe.colder} of 11 towards colder air: the readings are deeper than the globe in the day's air, as the contribution found. A phone's level is rarely zero to a few tenths of a degree: removing from all eleven readings the constant offset most favourable to each model (globe ${nf(o.globe.b, 2)}°, plane ${nf(o.flat.b, 2)}°, the circles of the figure) brings the globe down to ${nf(s.globe.chi2)} and the plane to ${nf(s.flat.chi2)}, with no reading of the plane within two σ (its closest is ${nf(minF, 1)} σ away). The globe stays above eleven: the readings scatter more than the margins they were given (0.05° of reading, the tilt from the track log). They come from one phone on two flights, so they are not eleven independent tests. And for a dip the plane keeps a way out this calculation does not cover: a haze edge at a fixed distance instead of a grazing ray; the contribution fits it to these eleven readings, where it does nearly as well as the globe.`;
}
