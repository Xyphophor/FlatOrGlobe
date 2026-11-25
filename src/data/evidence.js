// Classes de preuve (epic17/UC01, 2026-10-03, demande du propriétaire). LA source de
// vérité : un titre de section (clé `k` de la prose, ou clé i18n des onglets réécrits)
// porte au plus une classe. Règle stricte (CLAUDE.md, règle 10) :
//   measure : courbure ou rayon tirés de données où le rayon n'est JAMAIS entré --
//             temps, angles locaux, longueurs mesurées au sol, hauteurs mesurées,
//             latitudes/longitudes prises comme ANGLES (GPS compris), constantes de labo,
//             catalogues d'étoiles ;
//   check   : données réelles comparées au globe, ou produites un jour avec un modèle du
//             globe : une distance en km tirée de coordonnées, d'une carte ou d'un MNT, des
//             éphémérides de satellites (WGS84), GRS80, IGRF, une vitesse établie avec des
//             distances du globe -- même « nettoyées » après ;
//   model   : calculs du modèle, sans donnée mesurée.
// epic19 (2026-10-04) : la même règle vaut pour la rotation Ω et l'unité astronomique -- mesure
// quand la grandeur donnée n'est jamais entrée dans les données (onglets rot, orb, moon).
// Une section d'explication, d'histoire, d'objections ou de modèle plat n'a pas de badge.
// Une section qui mêle deux natures prend la plus prudente ; `enters` (clé de
// src/i18n/<lang>/evidence.json) dit alors où le rayon entre.
import { CONTRIBUTIONS } from "../tabs/contrib/registry.js";

export const EV_CLASSES = ["measure", "check", "model"];

const M = "measure", C = "check", P = "model";
const c = (tab, k) => ({ cls: C, enters: `enters-${tab}-${k}` });

export const EVIDENCE = {
  avia: { "avia-h2eo": c("avia", "eot"), "avia-h2c": { cls: P }, "avia-h2e": { cls: P }, "avia-h2g": c("avia", "gc"), "avia-h2rf": { cls: M }, "avia-h2m": { cls: M }, "avia-h2i": { cls: P } },
  azim: { "az-h2a": { cls: P }, "az-h2b": { cls: P }, "az-h2c": c("azim", "ecl"), "az-h2f": { cls: P } },
  cnav: { c974926c: { cls: P }, "405078b5": { cls: P } },
  ct: { "ct-h2b": { cls: P }, "ct-h2g": c("ct", "stars"), "ct-h2h": c("ct", "crest") },
  curv: { "curv-h2z": c("curv", "map"), "curv-h2a": { cls: P }, "curv-h2b": { cls: P }, "curv-h2d": { cls: P } },
  dip: { e711563d: { cls: P }, bfb8cbb7: { cls: P }, "84acea2b": { cls: M }, "dip-own-h2": c("dip", "own"), "dp-h1": { cls: P }, "ml-h1": c("dip", "mlo") },
  dist: { "dist-h2a": { cls: P }, "dist-h2b": { cls: P }, "dist-h2c": { cls: P }, "115dab3c": { cls: P } },
  ecl: { "ecl-h23": { cls: P }, "ecl-h2sel": { cls: P }, "ecl-h26": { cls: P } },
  elev: { "3e969c47": { cls: P }, "x:2c10dc42": { cls: P }, bb6b4bd0: { cls: P }, "2f1430f7": { cls: P } },
  fou: { "fp-h4": { cls: P }, "fp-h5": c("fou", "lat") },
  gps: { "64c2b4b4": { cls: P }, "4686ca1f": { cls: P }, "gps-raw-h2": c("gps", "eph") },
  grav: { "gv-h1": c("grav", "arc"), "gv-h3": { cls: P }, "gv-h3b": c("grav", "tower"), "gv-h4": c("grav", "richer"), "gv-h5": c("grav", "mass"), "gv-h7": { cls: P }, "gv-h7b": c("grav", "tides"), "gv-h7c": c("grav", "tides"), "gv-h7d": c("grav", "tides") },
  // contrib : une entrée par contribution publiée (src/tabs/contrib/registry.js), son texte dans <clé>/i18n
  contrib: Object.fromEntries(CONTRIBUTIONS.map((x) => [x.h2, c("contrib", x.enters)])),
  hh: { "hh-calch": { cls: P }, "hh-vh": { cls: P }, "hh-tabh": c("hh", "map"), "bd-h2": c("hh", "bord") },
  mag: { "28e313cb": { cls: P }, "mg-obs-h": c("mag", "igrf"), "mg-obs-hF": c("mag", "igrf") },
  obs: { "obs-h2theo": { cls: P }, "obs-6": { cls: P }, "obs-10": { cls: P }, "obs-21": { cls: P }, "obs-30": c("obs", "lidar") },
  ref: { "rf-h6": c("ref", "k"), "rf-hsp4": { cls: M }, "rf-higra": c("ref", "igra"), "rf-hlas": { cls: P }, "rf-hair": c("ref", "air") },
  cases: { "p2p-h": c("cases", "p2p") },
  rx: { "rx-h2-2": c("rx", "eph"), "rx-h2-4": c("rx", "eph"), "rx-h2-b": c("rx", "eph"), "rx-h2-m": { cls: P } },
  seis: { "sq-h2": { cls: P }, "sq-h4": { cls: P }, "sq-h7": c("seis", "v"), "sq-h8": c("seis", "v"), "sq-h9": c("seis", "v"), "sq-h10": c("seis", "v"),
    "rl-h1": c("seis", "label"), "rl-h2": c("seis", "label"), "sh-h1": c("seis", "shadow"), "wv-h1": c("seis", "waves"), "ms-h2": c("seis", "mesh") },
  // ondes de pression des éruptions, venues de seis (2026-10-19)
  atmo: { "tg-h1": { cls: M }, "kr-h1": { cls: M }, "lp-h1": { cls: M } },
  rot: { "rot-h2ring": { cls: M }, "rot-h2fall": { cls: M }, "rot-h2sid": { cls: P } },
  orb: { "orb-h2ab": { cls: M }, "orb-h2transit": c("orb", "transit"), "orb-h2radar": c("orb", "radar"), "orb-h2psr": c("orb", "psr"), "orb-h2sun": c("orb", "sdo"), "orb-h2dop": c("orb", "dop"), "orb-h2star": c("orb", "star"), "orb-h2par": { cls: M }, "orb-h2gno": { cls: P } },
  sat: { "sat-h2res": { cls: M }, "sat-h2fit": { cls: M }, "sat-h2ball": { cls: M }, "sat-h2kep": { cls: M } },
  moon: { "moon-h2llr": c("moon", "llr"), "moon-h2par": { cls: P }, "moon-h2ecl": c("moon", "ecl"), "moon-h2shape": { cls: M } },
  star: { "sky-h2c": { cls: P }, "st-h2a": { cls: P }, "st-h2b": { cls: P }, "st-h2e": { cls: P }, "st-h2f": { cls: P } },
  surv: { cab55d9e: c("surv", "lvl"), "11ef0793": c("surv", "tri"), "sv-h2laser": c("surv", "red"), "sv-h2rapp": { cls: M }, "sv-h2tri": { cls: M } },
  // onglets réécrits : clés i18n des titres (src/tabs/<tab>/index.js)
  sun: { "romer-h2": { cls: P }, "romer-m-h2": { cls: M }, "an-h2": c("sun", "alm"), "daily-h2": { cls: P }, "dial-h2": { cls: P }, "dl-h2": { cls: M } },
  twi: { "tw-h1": { cls: P }, "tw2-h2": { cls: P }, "tw-h2": { cls: P }, "tw-h6": { cls: P }, "tw-h3": { cls: P } },
};

/** Les classes présentes dans un onglet, dans l'ordre measure, check, model. */
export function tabClasses(tab) {
  const s = new Set(Object.values(EVIDENCE[tab] || {}).map((e) => e.cls));
  return EV_CLASSES.filter((x) => s.has(x));
}
