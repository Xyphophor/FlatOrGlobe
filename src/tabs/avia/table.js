// Table des vols (epic14) : une ligne par route, les durées mesurées dans
// chaque sens, les distances des deux modèles et la vitesse sol qu'il
// faudrait tenir sur chacun. Le sud d'abord, du plus fort écart au plus faible.
import { routeStats } from "./logic.js";
import { ROUTES, AIRPORTS } from "../../data/presets/avia-flights.js";
import { CITY } from "../../data/presets/avia.js";
import { num } from "../curv/fmt.js";

export function tableRows() {
  return ROUTES.map((r) => routeStats(r, AIRPORTS)).filter((s) => s.both)
    .sort((p, q) => (q.south - p.south) || (q.ratio - p.ratio));
}

export function fillTable(tb, tr = (k, fb) => fb) {
  if (!tb) return;
  const rows = tableRows();
  tb.innerHTML = rows.map((s) => `<tr${s.south ? ' class="south"' : ""}>` +
    `<td>${tr(`city-${s.a}`, CITY[s.a])} – ${tr(`city-${s.b}`, CITY[s.b])}</td>` +
    `<td class="num">${s.n}</td>` +
    `<td class="num">${num(s.hAB, 1)} / ${num(s.hBA, 1)}</td>` +
    `<td class="num g">${num(s.gc)}</td><td class="num f">${num(s.ae)}</td>` +
    `<td class="num g">${num(s.vGlobe)}</td><td class="num f">${num(s.vFlat)}</td>` +
    `<td class="num">${s.tas ? num(s.tas) : "—"}</td></tr>`).join("");
}

// 2026-11-25 (propriétaire : « le tableau des vols qu'on utilise est long, je propose de le remplacer par un lien qui télécharge
// le fichier csv ») : une ligne par vol gardé, avec les nombres de sa route ; fabriqué dans la page depuis le même fichier.
const csvCell = (v) => (v == null || (typeof v === "number" && !Number.isFinite(v)) ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const r3 = (x) => Math.round(x * 1000) / 1000;
export function flightsCsv() {
  const head = ["from", "to", "from_name", "to_name", "airborne_h", "route_median_h_this_way", "route_mean_h_both_ways", "globe_km", "flat_disc_km", "filed_cruise_kmh", "southern"];
  const out = [head.join(",")];
  for (const r of ROUTES) {
    const s = routeStats(r, AIRPORTS);
    for (const [o, d, hs, med] of [[r.a, r.b, r.ab, s.hAB], [r.b, r.a, r.ba, s.hBA]])
      for (const h of hs) out.push([o, d, AIRPORTS[o].n, AIRPORTS[d].n, h, r3(med), s.both ? r3(s.h) : null, Math.round(s.gc), Math.round(s.ae), s.tas ? Math.round(s.tas) : null, s.south ? 1 : 0].map(csvCell).join(","));
  }
  return out.join("\n") + "\n";
}
/** Le lien de téléchargement : un Blob fabriqué au premier clic. */
export function mountCsv(a) {
  if (!a) return;
  a.addEventListener("click", () => {
    if (a.dataset.ready || typeof Blob === "undefined" || !globalThis.URL?.createObjectURL) return;
    a.href = URL.createObjectURL(new Blob([flightsCsv()], { type: "text/csv" })); a.dataset.ready = "1";
  });
}
