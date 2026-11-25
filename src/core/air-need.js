// L'air qu'il faut à chaque modèle, photo par photo (2026-11-13) : ce que partagent l'onglet ref (Caussols,
// Bordighera) et les contributions qui fournissent leurs propres lignes (src/tabs/contrib/<clé>/air.js), sans que ref
// ait à les nommer (une contribution non publiée doit disparaître avec son seul dossier).
//
// Une ligne = une photo : le gradient moyen de température dT/dz (K/m) entre le bas du rayon et l'œil, celui de l'air
// du jour et sa fourchette, et pour chaque modèle celui qu'il faut et sa fourchette (la marge de la mesure). L'écart
// réduit z = (il faut − jour)/σ, σ = les deux demi-fourchettes qui se font face, en quadrature ; mêmes marges aux deux
// modèles. Une ligne peut porter son z tout fait (calculé sur une autre échelle, ex. l'indice pour les avions).

/** L'incertitude minimale qu'on prête à l'air d'un modèle météo entre les deux bouts d'un dip (K). */
export const DAY_SD_K = 1;

/** Complète une ligne { id, kind, dz, floor?, day:{grad,gLo,gHi}, globe:{grad,gLo,gHi[,z]}, flat:{…} } de ses écarts. */
export function airRow(o) {
  const z = (m) => {
    const N = o[m];
    if (!N || N.grad == null) return { ...N, gap: null, z: null };
    const gap = N.grad - o.day.grad;
    if (N.z != null) return { ...N, gap };
    const up = gap < 0;   // le modèle demande plus froid : la fourchette du jour vers le bas, la sienne vers le haut
    const sN = up ? N.gHi - N.grad : N.grad - N.gLo, sD = Math.max(up ? o.day.grad - o.day.gLo : o.day.gHi - o.day.grad, (o.floor ?? 0) / o.dz);
    return { ...N, gap, sd: Math.hypot(sN, sD), z: gap / Math.hypot(sN, sD) };
  };
  return { ...o, globe: z("globe"), flat: z("flat") };
}

/** Le résumé de lignes, par modèle : χ² = Σ z², médianes de |écart| (K/m) et de |z|, combien à moins de 2 σ, combien
 * demandent un air plus froid que celui du jour. */
export function summarize(rows) {
  const out = {};
  const med = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[n >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
  for (const m of ["globe", "flat"]) {
    const r = rows.map((x) => x[m]).filter((x) => x && x.z != null);
    out[m] = { n: r.length, chi2: r.reduce((s, x) => s + x.z * x.z, 0), medGap: med(r.map((x) => Math.abs(x.gap))), medZ: med(r.map((x) => Math.abs(x.z))),
      within2: r.filter((x) => Math.abs(x.z) < 2).length, colder: r.filter((x) => x.gap < 0).length };
  }
  return out;
}

/** Le décalage constant (degrés) qui rend le χ² d'un modèle le plus petit sur une série de lectures faites avec le
 * même instrument (rowsAt(b) : les lignes de la série, décalage b retiré) ; balayage de −1° à +3° par 0,01°. La même
 * liberté pour les deux modèles. */
export function bestOffset(rowsAt, model) {
  let best = { b: 0, chi2: Infinity };
  for (let i = -100; i <= 300; i++) {
    const b = i / 100, chi2 = rowsAt(b).reduce((s, r) => s + (r[model].z ?? 0) ** 2, 0);
    if (chi2 < best.chi2) best = { b, chi2 };
  }
  return best;
}

/** Une valeur signée pour le texte (« + », « − »), à d décimales. */
export function signed(x, d, lang) {
  if (x == null) return "—";
  const s = Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  return Math.abs(x) < 0.5 * 10 ** -d ? s : (x < 0 ? "−" : "+") + s;
}
