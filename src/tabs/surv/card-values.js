// Chiffres de la carte « tri » (2026-10-28) : ils suivent le réseau choisi dans #survTriSel ({{clé}} des textes
// src/i18n/<langue>/surv-cards.json, voir cardText dans core/cards.js). Avant, le texte parlait toujours de Gauss.
// Seul le cas de Gauss cite une mesure (14,85″, source [1] de la carte) ; les autres donnent la loi de l'aire.
import { makeT } from "../../core/i18n.js";
import { SURV, SURV_TRI, survExcess } from "./surv-legacy.js";

const TD = Math.PI / 180;

export function triValueLookup(lang) {
  const t = makeT(lang, "surv-cards"), PRE = SURV_TRI[SURV.tri], e = survExcess(PRE.side);
  const num = (x, d) => { const s = x.toFixed(d); return lang === "en" ? s : s.replace(".", ","); };
  const V = {
    // le réseau dans une phrase (« un triangle typique de la chaîne de Struve ») ; repli : le nom du menu
    name: (() => { const k = `tri.net-${PRE.extraKey.replace("tri-extra-", "")}`, v = t(k); return v === k ? PRE.name : v; })(),
    side: PRE.side % 1 ? num(PRE.side, 1) : PRE.side.toLocaleString(lang === "en" ? "en" : "fr").replace(/\u202f/g, " "),
    ang: num(e.ang / TD, 4),
    exc: e.excArc < 100 ? num(e.excArc, 1) + "″" : e.excArc < 1000 ? num(e.excArc, 0) + "″" : num(e.excArc / 3600, 2) + "°",
  };
  const fill = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => V[k] ?? "");
  const which = PRE.measuredKey ? "gauss" : PRE.extraKey === "tri-extra-continental" ? "illus" : "real";
  V.case = fill(t(`tri.case-${which}`));
  V.mcase = fill(t(`tri.mcase-${which}`));
  return (k) => V[k] ?? "";
}

// Carte « angles » (2026-10-28) : le rayon des onze cents triangles de Schott, lu dans le fichier généré.
import { SURV_EXCESS } from "../../data/presets/surv-excess.js";
export function excessValueLookup(lang) {
  const nf = (x) => Math.round(x).toLocaleString(lang === "en" ? "en" : "fr").replace(/ /g, " ");
  const f = SURV_EXCESS.fit, V = { R: nf(f.R), lo: nf(f.lo), hi: nf(f.hi), n: nf(f.n), np: Math.round((1 - SURV_EXCESS.flatNP.lo) * 100), npHi: Math.round((SURV_EXCESS.flatNP.hi - 1) * 100) };
  return (k) => String(V[k] ?? "");
}
