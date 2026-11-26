// Les expériences « à faire soi-même », regroupées dans l'onglet falsify (2026-11-26, Xyphophor : « déménager toutes
// les expériences dans l'onglet dédié aux contre-arguments, en les remplaçant par des liens ; ça casse le flot de
// lecture ; en les regroupant on pourra voir s'il y a des déséquilibres ; un lecteur pourra faire ses courses » ;
// toutes sauf l'onglet rx, du groupe « Ensemble »).
//
// Le texte de chaque expérience reste dans la prose de son onglet (avec ses traductions), marqué `away: "<id>"` :
// l'onglet n'en montre plus qu'une ligne de lien (core/prose.js, expAwayLink). Son calculateur est dans
// src/tabs/<onglet>/exp.js, qui exporte EXP = { "<id>": { html(lang), wire?(host, lang) } } : html rend le bloc (proseExp
// pour une prose, son propre HTML pour sun et twi), wire branche les champs ; src/tabs/falsify/experiments.js les réunit.
import { TAB_GROUPS } from "../data/tabgroups.js";
import { renderProse } from "./prose.js";
import { getProseDict } from "./i18n.js";

/** Les expériences, dans l'ordre de leurs onglets : [id, onglet]. */
export const EXPERIMENTS = [
  ["xp-elev-1", "elev"], ["xp-hh-1b", "hh"], ["xp-cnav-2", "cnav"], ["xp-dip-4", "dip"], ["xp-dip-4b", "dip"],
  ["xp-twi-1", "twi"], ["xp-twi-2", "twi"], ["xp-azim-9", "azim"], ["xp-azim-9b", "azim"], ["xp-moon-par", "moon"],
  ["xp-dist-3", "dist"], ["xp-grav-1f", "grav"], ["xp-seis-1e", "seis"], ["xp-mag-5", "mag"], ["xp-gps-8", "gps"],
  ["xp-rot-sid", "rot"], ["xp-orb-gno", "orb"],
  ["xp-sun-6", "sun"], ["xp-sun-6b", "sun"], ["xp-star-2b", "star"], ["xp-fou-1d", "fou"],
  ["xp-ref-1c", "ref"], ["xp-surv-7", "surv"], ["xp-obs-sign", "obs"], ["xp-obs-th", "obs"], ["xp-ct-11", "ct"],
].map(([id, tab]) => ({ id, tab }));

/** Les expériences par groupe d'onglets (l'ordre de la barre) : [{ group, items }]. */
export function experimentsByGroup() {
  return TAB_GROUPS.map((g) => ({ group: g.id, items: EXPERIMENTS.filter((e) => g.tabs.includes(e.tab)) })).filter((g) => g.items.length);
}

/** Le HTML d'une expérience restée dans la prose de son onglet (avec la traduction de la langue). */
export function proseExp(tab, prose, id, lang) {
  return renderProse(tab, prose, { dict: getProseDict(lang, tab), only: id });
}
