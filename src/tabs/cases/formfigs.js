// Figures de l'onglet cases (2026-10-31) : l'étude Worthing–Brighton. La coupe (ce qu'il faut au globe), leurs thermomètres
// face au gradient requis, les deux soirs (2 et 23 février 2019) côte à côte. Montées par index.js avant renderTexIn.
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { CASE_P2P } from "../../data/presets/cases-pier2pier.js";
import { trialRows, eveningAt } from "./logic.js";

const C = FIG.C;
const pts = (a) => a.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

/* La coupe : la mer bombe entre les deux sites ; la ligne qui rase la mer depuis la caméra passe bien au-dessus du laser. */
function figGeom(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("p2p-fg-alt", "A cross-section of the 15.2 km of sea between Worthing and Brighton: the water bulges 4.5 m in the middle. A camera 1 m above the water on the left; the line from it that grazes the sea at its horizon, 3.6 km away, passes 10.7 m above the water at Brighton, so a laser 1 m above the water there is hidden. Light bending with k = 0.78 follows a flatter arc and reaches it.") });
  const x0 = 24, x1 = 356, base = 176, sx = (u) => x0 + u * (x1 - x0);
  const bul = (u) => 4 * u * (1 - u) * 34;   // le bombement (4,5 m) dessiné à 34 px
  const sea = []; for (let i = 0; i <= 50; i++) { const u = i / 50; sea.push([sx(u), base - bul(u)]); }
  f.path(pts(sea) + `L${x1} ${base + 30}L${x0} ${base + 30}Z`, { c: C.sea, w: 1.6, fill: "#dcebf2" });
  const m = 7.5;   // 1 m = 7,5 px
  f.line(sx(0), base, sx(0), base - m, { c: C.ink, w: 2.4 }); f.line(sx(1), base, sx(1), base - m, { c: C.ink, w: 2.4 });
  f.dot(sx(0), base - m, { r: 3, c: C.ink }); f.dot(sx(1), base - m, { r: 3.2, c: "#dc2626" });
  // la ligne droite qui rase l'horizon (tangente à 3,6/15,2 du trajet), prolongée jusqu'à Brighton
  const ut = 3.6 / 15.2, yt = base - bul(ut), slope = (yt - (base - m)) / (sx(ut) - sx(0));
  f.line(sx(0), base - m, sx(1), base - m + slope * (sx(1) - sx(0)), { c: C.faint, w: 1.4, dash: "5 3" });
  const yHid = base - m + slope * (sx(1) - sx(0));
  f.seg(sx(1) + 10, base, sx(1) + 10, yHid, { label: "10.7 m", c: C.flat, side: -24 });
  // la lumière courbée (k = 0,78) : un arc plus plat qui relie les deux
  const arc = []; for (let i = 0; i <= 50; i++) { const u = i / 50; arc.push([sx(u), base - m - bul(u) * 1.12]); }
  f.path(pts(arc), { c: C.globe, w: 2 });
  f.note(sx(0.5), base - bul(0.5) - 34, tr("p2p-fg-1", "light with k = 0.78"), { size: 10, anchor: "middle", c: C.globe });
  f.note(sx(0.5), base - bul(0.5) + 16, tr("p2p-fg-2", "bulge 4.5 m"), { size: 10, anchor: "middle", c: C.sea });
  f.note(sx(0) + 4, base + 18, "Worthing, 1 m", { size: 9.5, c: C.ink });
  f.note(sx(1) - 4, base + 18, tr("p2p-fg-3", "laser, Brighton, 1 m"), { size: 9.5, c: "#dc2626", anchor: "end" });
  f.note(sx(0) + 40, yt - 30, tr("p2p-fg-4", "straight light, grazing the sea"), { size: 9.5, c: C.soft });
  const ex = Math.round(m / ((x1 - x0) / CASE_P2P.dist.wb) / 10) * 10;   // 1 m de hauteur contre 1 m de longueur, dessinés
  stamp(f, tr, tr("p2p-fg-st", "heights ×{ex}, planet ÷{ex}").replace(/\{ex\}/g, ex));
  return f;
}

/* Leurs thermomètres : la température contre la hauteur, à Worthing (A et B) et à Brighton, ±0,25 °C ; en pointillé, l'air qu'il
 * faut au globe pour le premier essai (+0,084 °C/m depuis la lecture la plus basse). */
function figTherm(tr) {
  const f = FIG.make({ w: 380, h: 260, alt: tr("p2p-ft-alt", "Air temperature against height above the water, as read by the operators' two thermometers, with their stated precision of plus or minus 0.25 °C. At Worthing both warm with height, by about 1.5 °C between the water and 2 m. At Brighton the readings stay within 7.0 to 7.5 °C. Dashed, from each lowest reading, the warming the globe needs for the laser to be seen, 0.17 °C over 2 m: it lies inside the error bars at Brighton, and well below what Worthing measured.") });
  const X0 = 46, X1 = 366, Y0 = 220, Y1 = 30, t0 = 6.25, t1 = 9.75, h1 = 2.2;
  const x = (T) => X0 + (T - t0) / (t1 - t0) * (X1 - X0), y = (h) => Y0 - h / h1 * (Y0 - Y1);
  for (const h of [0, 0.5, 1, 1.5, 2]) { f.dash(X0, y(h), X1, y(h), { c: "#e7e3da" }); f.note(X0 - 4, y(h) + 4, `${String(h).replace(".", tr("fx-dec", "."))} m`, { anchor: "end", size: 9 }); }
  for (const T of [6.5, 7, 7.5, 8, 8.5, 9, 9.5]) f.note(x(T), Y0 + 13, String(T).replace(".", tr("fx-dec", ".")), { anchor: "middle", size: 9 });
  const g = trialRows()[1].gNeed;
  const series = (rows, col, c, dx) => {
    const p = rows.filter((r) => r[col] != null);
    for (const r of p) { f.line(x(r[col] - 0.25) + dx, y(r[0]), x(r[col] + 0.25) + dx, y(r[0]), { c, w: 1 }); f.dot(x(r[col]) + dx, y(r[0]), { r: 2.8, c }); }
    f.path(pts(p.map((r) => [x(r[col]) + dx, y(r[0])])), { c, w: 1.6 });
    const b = p[0]; f.line(x(b[col]) + dx, y(b[0]), x(b[col] + g * (2 - b[0])) + dx, y(2), { c, w: 1.2, dash: "3 3" });
  };
  const W = CASE_P2P.therm.worthing, B = CASE_P2P.therm.brighton;
  series(W, 1, "#1e3a8a", 0); series(W, 2, "#3b82f6", 0); series(B, 1, "#d97706", 2); series(B, 2, "#f59e0b", 2);
  f.note(x(8.9), y(2.12), tr("p2p-ft-1", "Worthing A, B"), { size: 9.5, c: "#1e3a8a", anchor: "end" });
  f.note(x(6.35), y(1.95), tr("p2p-ft-2", "Brighton A, B"), { size: 9.5, c: "#d97706" });
  f.note(X1, 252, tr("p2p-ft-3", "°C · dashed: what the globe needs (+0.17 °C over 2 m)"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("p2p-ft-st", "their tables, 23 Feb 2019"));
  return f;
}

/* Les deux soirs : l'air à 2 m (ERA5, mer) heure par heure contre la mer (OISST), le vent, et ce qui a été vu. */
function figEvenings(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("p2p-fe-alt", "Two panels, 2 and 23 February 2019, from 17 to 22 h: the air temperature 2 m above the sea from ERA5 and the sea's temperature from OISST. On 2 February the air was 6 °C colder than the sea under a 34 km/h wind from the land: the laser was not seen. On 23 February the air was as warm as the sea offshore, the wind light: the laser was seen.") });
  const panels = [["2019-02-02", 18, false], ["2019-02-23", 200, true]], t0 = 0, t1 = 12, Y0 = 186, Y1 = 40;
  const y = (T) => Y0 - (T - t0) / (t1 - t0) * (Y0 - Y1);
  for (const T of [0, 4, 8, 12]) f.note(14, y(T) + 3, `${T}`, { size: 9, anchor: "end" });
  for (const [d, ox, seen] of panels) {
    const E = CASE_P2P.evenings[d], X = (h) => ox + (h - 17) / 5 * 160;
    f.line(ox, Y0, ox + 160, Y0, { c: C.faint, w: 1 });
    for (const T of [4, 8]) f.dash(ox, y(T), ox + 160, y(T), { c: "#e7e3da" });
    const sst = E.sst.reduce((s, v) => s + v, 0) / E.sst.length;
    f.line(X(17), y(sst), X(22), y(sst), { c: C.sea, w: 2, dash: "5 3" });
    f.path(pts(E.era5.map((r) => [X(r[0]), y(r[1])])), { c: C.ink, w: 2 });
    for (const h of [17, 19, 21]) f.note(X(h), Y0 + 12, `${h} h`, { size: 9, anchor: "middle" });
    const e = eveningAt(d);
    f.note(ox + 80, 22, d === "2019-02-02" ? tr("p2p-fe-1", "2 Feb: not seen") : tr("p2p-fe-2", "23 Feb: seen"), { size: 11, anchor: "middle", c: seen ? C.globe : C.flat });
    f.note(ox + 80, 34, tr("p2p-fe-3", "wind {w} km/h").replace("{w}", Math.round(e.wind)), { size: 9.5, anchor: "middle" });
  }
  f.note(18, 214, tr("p2p-fe-4", "solid: air at 2 m (ERA5) · dashed: sea (OISST) · °C"), { size: 9.5 });
  axesStamp(f, tr, tr("p2p-fe-st", "ERA5 sea cell, OISST"));
  return f;
}

export const FORMULA_FIGS = { p2pFxGeom: figGeom, p2pFxTherm: figTherm, p2pFigEvenings: figEvenings };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "cases"); }
