// Onglet "home" -- page d'accueil : dix-sept mesures (quatorze au legacy, + ecl, curv, avia), une forme commune,
// plus quatre onglets qui répondent aux objections. Porté du legacy
// (panneau id="tab-home" ~L6830, buildHomeSoon ~L24519). Les cartes sont
// construites depuis HOME_CARDS ; un onglet pas encore migré est affiché
// grisé (pas caché : la page doit être honnête sur son propre état).
// Vignettes : le legacy clonait le SVG/canvas d'ouverture de chaque onglet
// (buildHome) ; ici chaque carte DESSINE sa figure avec le même générateur
// FIG (src/core/symbols.js drawHomeFig -- rattrapage UC11). Le schéma
// d'ouverture de ct (ctFigOpen) vit dans son moteur porté, importé ici.
import { makeT } from "../../core/i18n.js";
import { groupTabs } from "../../data/tabgroups.js";
import { tabLabel, tabExists } from "../../core/tabs.js";
import { drawHomeFig } from "../../core/symbols.js";
import { evChip } from "../../core/evidence.js";
import { tabClasses, EV_CLASSES } from "../../data/evidence.js";
import { mountSiteReel } from "./reel.js";
import "./style.css";

const KEY = "home";
// 2026-10-04 (propriétaire) : l'accueil sépare la géométrie (forme, taille) des mouvements
// (rotation, orbite) ; les onglets qui mêlent les deux ont leur propre groupe.
// 2026-10-25 : la géométrie est coupée en deux groupes (ciel et horizon, sol et distances), deux sous-titres ici
export const HOME_SKY = groupTabs("sky");
export const HOME_GROUND = groupTabs("ground");
export const HOME_GEOMETRY = [...HOME_SKY, ...HOME_GROUND];
export const HOME_MOTION = groupTabs("motion");
export const HOME_BOTH = groupTabs("both");
export const HOME_MEASURES = [...HOME_GEOMETRY, ...HOME_MOTION, ...HOME_BOTH];
// 2026-10-04 : les cumuls ont leur onglet ; sa carte ouvre l'accueil
export const HOME_TOP = ["results", "phys", "rules"];   // 2026-10-25 : les bases de physique à côté des résultats
export const HOME_ANSWERS = groupTabs("answers");
// modules collaboratifs (propriétaire, 2026-10-03) : ni démonstration ni outil -- chacun mesure seul, puis on met en commun
export const HOME_COLLAB = groupTabs("collab");

export default {
  key: KEY,
  label: "Home",

  mount(container) {
    const t = makeT(document.documentElement.lang || "en", KEY);
    this._t = t;
    const tn = makeT(document.documentElement.lang || "en", "nav");
    container.innerHTML = `
      <p class="eyebrow">${t("eyebrow")}</p>
      <h1>${t("h1")}</h1>
      <p class="cnav-lead">${t("lead")}</p>
      <div class="fig"><canvas id="homeReel" class="home-reel" role="img" aria-label="${t("hreel-alt")}"></canvas><div class="fcap">${t("hreel-cap")}</div></div>
      <div class="homegrid home-top" id="homeTop"></div>
      ${this._legend()}
      <h2 class="cnav-h2" data-sec="geometry">${t("geo-h2")}</h2>
      <p class="notes">${t("geo-lead")}</p>
      <h3 class="home-h3">${tn("group-sky")}</h3>
      <div class="homegrid" id="homeSky"></div>
      <h3 class="home-h3">${tn("group-ground")}</h3>
      <div class="homegrid" id="homeGround"></div>
      <h2 class="cnav-h2" data-sec="motion">${t("mov-h2")}</h2>
      <p class="notes">${t("mov-lead")}</p>
      <div class="homegrid" id="homeMov"></div>
      <h2 class="cnav-h2" data-sec="both">${t("both-h2")}</h2>
      <p class="notes">${t("both-lead")}</p>
      <div class="homegrid" id="homeBoth"></div>
      <h2 class="cnav-h2" data-sec="answers">${t("answers-h2")}</h2>
      <p class="notes">${t("answers-lead")}</p>
      <div class="homegrid" id="homeAnswers"></div>
      <h2 class="cnav-h2" data-sec="collab">${t("collab-h2")}</h2>
      <p class="notes">${t("collab-lead")}</p>
      <div class="homegrid" id="homeCollab"></div>
      <p class="notes">${t("falsify-link")}</p>
    `;
    this._g = { homeTop: HOME_TOP, homeSky: HOME_SKY, homeGround: HOME_GROUND, homeMov: HOME_MOTION, homeBoth: HOME_BOTH };
    this._grids = Object.fromEntries(Object.keys(this._g).map((id) => [id, container.querySelector("#" + id)]));
    this._a = container.querySelector("#homeAnswers");
    this._c = container.querySelector("#homeCollab");
  },

  render() {
    const t = this._t;
    // la vitrine du site (epic37/UC05, 2026-11-19) : ses comptes se chargent une fois (ready, attendu par le pré-rendu)
    if (!this._reel) { const cv = document.getElementById("homeReel"); if (cv) { this._reel = mountSiteReel(cv, Object.assign((k) => t(k), { lang: document.documentElement.lang || "en" }), tabExists); this.ready = this._reel.ready; } }
    this._reel?.start();
    const card = (key) => {
      const ok = tabExists(key);
      return `<a class="homecard${ok ? "" : " pending"}" href="#tab-${key}" ${ok ? `data-xref="${key}"` : ""} data-home="${key}">
        <span class="homefig"></span>
        <b class="homeh">${ok ? tabLabel(key) : key}</b>
        <span class="homeev">${tabClasses(key).map((c) => evChip(c)).join("")}</span>
        <span class="homedo">${t(`do-${key}`)}</span>
        <span class="homego">${ok ? t("go") : t("pending")}</span></a>`;
    };
    for (const [id, keys] of Object.entries(this._g)) this._grids[id].innerHTML = keys.map(card).join("");
    this._a.innerHTML = HOME_ANSWERS.map(card).join("");
    this._c.innerHTML = HOME_COLLAB.map(card).join("");
    const cards = [...Object.values(this._grids).flatMap((g) => [...g.children]), ...this._a.children, ...this._c.children];
    for (const c of cards) drawHomeFig(c.getAttribute("data-home"), c.querySelector(".homefig"), this._extra || {});
    // vignettes qui vivent dans le module de leur onglet (ct : son schéma d'ouverture ; obs : le vrai
    // coucher du 24 novembre, profil LiDAR et éphémérides) -- chargées à la demande
    // epic19 : rot, orb, moon dessinent une de leurs propres figures (modules chargés à la demande)
    if (!this._extra) Promise.all([import("../ct/ct-legacy.js"), import("../obs/homefig.js"), import("../rot/formfigs.js"), import("../orb/formfigs.js"), import("../moon/formfigs.js"), import("../map/formfigs.js"), import("../sat/formfigs.js"), import("../scale/formfigs.js"), import("../atmo/formfigs.js"), import("../phys/formfigs.js"), import("../aether/formfigs.js"), import("../rocket/formfigs.js"), import("../cases/formfigs.js"), import("../persp/formfigs.js"), import("../rules/formfigs.js")]).then(([ct, obs, rot, orb, moon, map, sat, scale, atmo, phys, aether, rocket, cases, persp, rules]) => {
      const lang = document.documentElement.lang || "en";
      const fig = (mod, tab, name, id) => () => { const tt = makeT(lang, tab); mod.FORMULA_FIGS[name]((k, fb) => { const v = tt(k); return v && v !== k ? v : fb; }).mountIn(document.getElementById(id)); };
      this._extra = { ct: ct.ctFigOpen, obs: obs.drawObsHome, rot: fig(rot, "rot", "rotFigRing", "rotHomeFig"), orb: fig(orb, "orb", "orbFigSun", "orbHomeFig"), moon: fig(moon, "moon", "moonFxLlr", "moonHomeFig"), map: fig(map, "map", "mapFxAE", "mapHomeFig"), sat: fig(sat, "sat", "satFigBall", "satHomeFig"), scale: fig(scale, "scale", "scaleFigLadder", "scaleHomeFig"), atmo: fig(atmo, "atmo", "atmoFigProfile", "atmoHomeFig"), phys: fig(phys, "phys", "physFxRotFrame", "physHomeFig"), aether: fig(aether, "aether", "aetherFxMM", "aetherHomeFig"), rocket: fig(rocket, "rocket", "rocketFxThrust", "rocketHomeFig"), cases: fig(cases, "cases", "p2pFxGeom", "casesHomeFig"), persp: fig(persp, "persp", "persFxRays", "perspHomeFig"), rules: fig(rules, "rules", "rulesFxExcl", "rulesHomeFig") };
      for (const k of ["ct", "obs", "rot", "orb", "moon", "map", "sat", "scale", "atmo", "phys", "aether", "rocket", "cases", "persp", "rules"]) for (const c of cards) if (c.getAttribute("data-home") === k) drawHomeFig(k, c.querySelector(".homefig"), this._extra);
    });
  },

  /** Légende des classes de preuve (epic17) : textes de src/i18n/<lang>/evidence.json. */
  _legend() {
    const lang = document.documentElement.lang || "en", te = makeT(lang, "evidence");
    return `<section class="ev-legend" id="homeLegend"><h2>${te("legend-h")}</h2><p>${te("legend-p")}</p><ul>` +
      EV_CLASSES.map((c) => `<li>${evChip(c, lang).trim()} ${te(`legend-${c}`)}</li>`).join("") + `</ul><p>${te("legend-none")}</p></section>`;
  },

  teardown() { this._reel?.stop(); },
};
