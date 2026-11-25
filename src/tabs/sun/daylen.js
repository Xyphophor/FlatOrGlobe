// La durée du jour mesurée par les pyranomètres du BSRN (2026-10-28, epic34/UC03) : minutes par jour où le rayonnement
// global dépasse 5 W/m², à une quarantaine de stations de 79° N à 69° S, en mars, juin et décembre 2019
// (fog build sun-bsrn). À côté : le jour du globe (centre du Soleil au-dessus de −0,833°) et celui du meilleur projecteur
// sur la carte azimutale équidistante (rayon ρ ajusté par mois). Figure en SVG (FIG), une par formule.
import { FIG } from "../../core/fig.js";
import { axesStamp } from "../../core/formfigs.js";
import { DAYLEN, DAYLEN_RHO } from "../../data/presets/sun-daylen.js";

const C = FIG.C, D2R = Math.PI / 180, KM = 20015.1 / 180;
export const MONTHS = [["2019-03", "#0f766e"], ["2019-06", "#d97706"], ["2019-12", "#1e3a8a"]];
// déclinaison du Soleil le 15 du mois (formule courte de Cooper, assez pour tracer les courbes)
const decOf = (mo) => { const d = new Date(`${mo}-15T12:00:00Z`), n = Math.round((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 864e5) + 1; return 23.44 * Math.sin(2 * Math.PI * (284 + n) / 365) * D2R; };

/** Le jour du globe (heures) à la latitude lat (°) pour la déclinaison dec (rad) : centre du Soleil au-dessus de −0,833°. */
export function globeHours(lat, dec) {
  const c = (Math.sin(-0.833 * D2R) - Math.sin(lat * D2R) * Math.sin(dec)) / (Math.cos(lat * D2R) * Math.cos(dec));
  return c <= -1 ? 24 : c >= 1 ? 0 : 2 * Math.acos(c) / D2R / 15;
}
/** Le jour du projecteur plat (heures) : temps passé à moins de ρ km du point sous le Soleil, qui tourne autour du pôle. */
export function flatHours(lat, dec, rho) {
  const rs = (90 - lat) * KM, r = (90 - dec / D2R) * KM;
  let n = 0;
  for (let th = 0; th < 360; th += 0.25) if (Math.sqrt(rs * rs + r * r - 2 * rs * r * Math.cos(th * D2R)) <= rho) n++;
  return n / 1440 * 24;
}

export function daylenValues(lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const rms = (f) => Math.sqrt(DAYLEN.reduce((s, r) => s + f(r) ** 2, 0) / DAYLEN.length) / 60;
  const stations = new Set(DAYLEN.map((r) => r[1])).size;
  const north = Math.max(...DAYLEN.map((r) => r[2])), south = Math.min(...DAYLEN.map((r) => r[2]));
  const st = (name, mo) => DAYLEN.find((r) => r[1].startsWith(name) && r[0] === mo);
  const h = (m) => (m == null ? "–" : nf(m / 60, 1));
  return { dlN: String(stations), dlRows: String(DAYLEN.length), dlNorth: nf(north, 0), dlSouth: nf(-south, 0),
    dlGlobe: nf(rms((r) => r[4] - r[5]) * 60, 0), dlFlat: nf(rms((r) => r[4] - r[6]), 1),
    dlRhoJ: nf(DAYLEN_RHO["2019-06"]), dlRhoD: nf(DAYLEN_RHO["2019-12"]), dlRhoM: nf(DAYLEN_RHO["2019-03"]),
    dlNyJ: h(st("Ny", "2019-06")?.[4]), dlNyD: h(st("Ny", "2019-12")?.[4]), dlSyJ: h(st("Syowa", "2019-06")?.[4]), dlSyD: h(st("Syowa", "2019-12")?.[4]) };
}

function figDay(tr) {
  const f = FIG.make({ w: 380, h: 300, alt: tr("dl-fig-alt", "Hours of daylight measured at each BSRN station against its latitude, in March, June and December 2019: in March close to twelve hours everywhere, in June long in the north and short in the south, in December the mirror image; the globe's curves pass through the points, the best flat spotlight's dashed curves miss them in the south") });
  const X0 = 46, X1 = 368, Y0 = 250, Y1 = 26, x = (lat) => X0 + (lat + 90) / 180 * (X1 - X0), y = (hh) => Y0 - hh / 24 * (Y0 - Y1);
  for (const hh of [0, 6, 12, 18, 24]) { f.dash(X0, y(hh), X1, y(hh), { c: "#e7e3da" }); f.note(X0 - 4, y(hh) + 4, `${hh} h`, { anchor: "end", size: 9 }); }
  for (const lat of [-90, -45, 0, 45, 90]) f.note(x(lat), Y0 + 13, `${lat}°`, { anchor: "middle", size: 9.5 });
  for (const [mo, col] of MONTHS) {
    const dec = decOf(mo), g = [], fl = [];
    for (let lat = -90; lat <= 90; lat += 1) {
      g.push(`${g.length ? "L" : "M"}${x(lat).toFixed(1)} ${y(globeHours(Math.max(-89.9, Math.min(89.9, lat)), dec)).toFixed(1)}`);
      fl.push(`${fl.length ? "L" : "M"}${x(lat).toFixed(1)} ${y(flatHours(lat, dec, DAYLEN_RHO[mo])).toFixed(1)}`);
    }
    f.path(g.join(""), { c: col, w: 1.6 });
    f.path(fl.join(""), { c: col, w: 1.4, dash: "5 3" });
    for (const r of DAYLEN.filter((q) => q[0] === mo)) f.dot(x(r[2]), y(r[4] / 60), { r: 3, c: col });
  }
  const lx = x(-52);   // la légende dans le coin vide, entre la nuit polaire du sud et le jour polaire du nord
  f.note(lx, y(22.6), tr("dl-fig-1", "March"), { size: 9.5, c: MONTHS[0][1] });
  f.note(lx + 46, y(22.6), tr("dl-fig-2", "June"), { size: 9.5, c: MONTHS[1][1] });
  f.note(lx + 84, y(22.6), tr("dl-fig-3", "December 2019"), { size: 9.5, c: MONTHS[2][1] });
  f.note(lx, y(21.2), tr("dl-fig-4", "dots: measured · line: globe"), { size: 9.5 });
  f.note(lx, y(20.0), tr("dl-fig-6", "dashed: best flat spotlight"), { size: 9.5 });
  f.note(X1, 290, tr("dl-fig-5", "latitude of the station · hours of light per day"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("dl-fig-st", "BSRN, 2019"));
  return f;
}
export const DAYLEN_FIGS = { sunFigDay: figDay };
