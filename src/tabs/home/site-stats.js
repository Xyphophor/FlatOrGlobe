// Les compteurs de la vitrine de l'accueil (epic37/UC05, 2026-11-19) : CALCULÉS sur les registres du site, jamais écrits à la
// main (propriétaire : « les intentions, le nombre de sources, la neutralité, la science »). Onglets : src/data/tabgroups.js ;
// verdicts écrits d'avance : src/data/falsify.js ; sections badgées : src/data/evidence.js ; sources : src/data/sources/<onglet>.js ;
// jeux de données : src/data/datasets.js (fog build datasets) ; rayon : le cumul des mesures pures (home/radii.js).
import { TAB_GROUPS } from "../../data/tabgroups.js";
import { FX_ROWS } from "../../data/falsify.js";
import { EVIDENCE, EV_CLASSES } from "../../data/evidence.js";
import { DATASETS } from "../../data/datasets.js";
import { loadRadii, splitStats } from "./radii.js";

export const allTabs = () => TAB_GROUPS.flatMap((g) => g.tabs);

/** Les comptes qui ne demandent aucun chargement. */
export function syncStats() {
  const cls = Object.fromEntries(EV_CLASSES.map((c) => [c, 0]));
  for (const tab of Object.values(EVIDENCE)) for (const e of Object.values(tab)) if (e?.cls in cls) cls[e.cls]++;
  const ds = Object.fromEntries(EV_CLASSES.map((c) => [c, DATASETS.filter((d) => d[3] === c).length]));
  return { tabs: allTabs().length, verdicts: FX_ROWS.length, sections: cls, datasets: DATASETS.length, datasetsBy: ds, datasetIds: [...new Set(DATASETS.map((d) => d[0]))] };
}

/** Tout, sources et rayon compris (chargements dynamiques) ; `exists` : les onglets montés. */
export async function siteStats(exists = () => true) {
  const S = syncStats();
  let sources = 0;
  for (const tab of allTabs()) {
    try { const m = await import(`../../data/sources/${tab}.js`); sources += (m.SOURCES || []).length; } catch { /* onglet sans liste de sources */ }
  }
  const rows = await loadRadii(exists), P = splitStats(rows).pure;
  const radius = { n: P.G.n, mean: P.G.mean, se: P.G.seScaled, methods: P.rows.map((r) => ({ key: r.key, med: r.med, sigma: r.sigma })) };
  return { ...S, sources, radius };
}
