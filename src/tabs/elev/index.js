// Onglet "elev" (clé "sim" jusqu'au 2026-09-25) (angles d'élévation), l'onglet d'origine du site. Passé au
// flux VERBATIM (rattrapage UC11, 2026-09-16) : panneau legacy mot pour
// mot (src/data/prose/elev.js, sections 01-08) + moteur porté verbatim
// (src/tabs/elev/elev-legacy.js -- render()/applyPreset()/PRESETS,
// drawPanel()/drawPerspective() avec la vue perspective ET son zoom
// #pzoom, updateReverse() (trois méthodes de reconstruction), updateRecip(),
// le calculateur d'expérience 1, la silhouette DEM du Viériou en figure
// FIG plutôt qu'en canvas). Voir tasks/epic02/UC01.org (portée d'origine)
// et UC11.org (rattrapage). PAS PORTÉ : tanLoop()/TAN3, le
// globe-rapporteur tournant -- décision explicite epic03/UC06.org.
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { wire, render as draw, stop } from "./elev-legacy.js";
import { PROSE } from "../../data/prose/elev.js";
import { SOURCES } from "../../data/sources/elev.js";
import { mountFlatten } from "../../core/flatten.js";
import { FLATTEN_CASES } from "../../data/presets/flatten.js";
import { mountLandscape } from "../../core/landscape.js";
import { makeT } from "../../core/i18n.js";
import { PRESETS, ELEV_PHOTO, ELEV_ARG, ELEV_SCHNEE, ELEV_CAUS } from "../../data/presets/elev.js";
import "./style.css";

const KEY = "elev";

// un paysage LiDAR (src/core/landscape.js) monté sur les éléments « <id>… »
// de la prose : <id> (canvas), <id>GlobeK/Globe/Flat (boutons), <id>Reads,
// <id>Photo, <id>OpLbl/<id>Opacity (s'il y a une photo calée)
function landBlock(container, id, load, make) {
  const q = (s) => container.querySelector("#" + id + s);
  const canvas = q(""); if (!canvas) return null;
  const tl = makeT(document.documentElement.lang || "en", "landscape");
  const btn = { globeK: q("GlobeK"), globe: q("Globe"), flat: q("Flat") };
  btn.globeK.textContent = tl("m-globeK").replace("{k}", 0.13); btn.globe.textContent = tl("m-globe"); btn.flat.textContent = tl("m-flat");
  if (q("OpLbl")) q("OpLbl").textContent = tl("photo-opacity");
  const cfg = make(tl, q), block = { land: null, canvas };
  load().then(([p, l]) => {
    block.land = mountLandscape(canvas, { ...cfg, profile: p.default || p, layers: l.default || l, buttons: btn, reads: q("Reads") });
    if (!container.hidden && !canvas.closest("[hidden]")) block.land.start();
  }).catch(() => {});
  return block;
}

export default {
  key: KEY,
  label: "Elevation angles",
  mount(container) {
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(document.documentElement.lang || "en", KEY) });
    wire();
    // paysages LiDAR (2026-09-25) : le Sommet de Viériou, et le point de vue
    // du propriétaire vers l'Argentera ; données chargées à la demande
    const V = PRESETS.vieriou, AZ0 = 267.33;   // azimut vrai du Castellaras depuis le sommet (o[0].az = 0 au centre du legacy)
    const COLS = ["#1d4ed8", "#c2410c", "#6d28d9"];
    this._lands = [
      landBlock(container, "elevLand", () => Promise.all([import("../../data/dem/vieriou-view.json"), import("../../data/dem/vieriou-view-layers.json")]), (tl, q) => {
        // sous le rendu : la photo telle que prise (sans recalage), pour la voir entière
        const slot = q("Photo");
        if (slot) { slot.classList.add("has-photo"); slot.innerHTML = `<img src="${ELEV_PHOTO.src}" alt="${tl("photo-caption")}"><p class="cap">${tl("photo-caption")}</p>`; }
        return {
          eye: V.eye, R: V.radius * 1000, k: 0.13,
          targets: V.o.map((t, i) => ({ name: V.names[i].s, d: t.d * 1000, h: t.h, az: AZ0 + t.az, color: COLS[i] })),
          // le cadre de la photo elle-même : centre, largeur, ligne de l'œil du globe k
          view: { az: ELEV_PHOTO.azCenter, alt: (ELEV_PHOTO.models.globeK.eyeRow - (ELEV_PHOTO.h - 1) / 2) / ELEV_PHOTO.pxPerDeg, fovDeg: ELEV_PHOTO.w / ELEV_PHOTO.pxPerDeg },
          photo: ELEV_PHOTO, opacity: q("Opacity"),
        };
      }),
      landBlock(container, "elevArg", () => Promise.all([import("../../data/dem/argentera2-view.json"), import("../../data/dem/argentera2-view-layers.json")]), (tl, q) => {
        const A = ELEV_ARG, slot = q("Photo");
        if (slot) { slot.classList.add("has-photo"); slot.innerHTML = `<img src="${A.photo.src}" alt="${tl("photo-caption-arg")}"><p class="cap">${tl("photo-caption-arg")}</p>`; }
        return { eye: A.eye, R: 6371e3, k: 0.13, targets: A.targets, view: A.view, photo: A.photo, opacity: q("Opacity") };
      }),
      // la photo d'un lecteur, Vienne → le Schneeberg (2026-09-26) : terrain BEV (Autriche) ;
      // photo de deprojected (X), publiée avec son autorisation le 2026-10-06
      landBlock(container, "elevSchnee", () => Promise.all([import("../../data/dem/schneeberg-view.json"), import("../../data/dem/schneeberg-view-layers.json")]), (tl, q) => {
        const A = ELEV_SCHNEE, slot = q("Photo");
        if (slot && A.photo) { slot.classList.add("has-photo"); slot.innerHTML = `<img src="${A.photo.src}" alt="${tl("photo-caption-schnee")}"><p class="cap">${tl("photo-caption-schnee")}</p>`; }
        return { eye: A.eye, R: 6371e3, k: 0.13, targets: A.targets, view: A.view, photo: A.photo, opacity: q("Opacity"), stamp: tl("stamp-bev"), stampShort: tl("stamp-bev-short") };
      }),
      // le plateau de Caussols (2026-09-27) : la mer et son horizon, le Mont Agel dessus ou dessous
      landBlock(container, "elevCaus", () => Promise.all([import("../../data/dem/caussols-view.json"), import("../../data/dem/caussols-view-layers.json")]), (tl, q) => {
        const A = ELEV_CAUS, slot = q("Photo");
        if (slot && A.photo) { slot.classList.add("has-photo"); slot.innerHTML = `<img src="${A.photo.src}" alt="${tl("photo-caption-caus")}"><p class="cap">${tl("photo-caption-caus")}</p>`; }
        return { eye: A.eye, R: 6371e3, k: 0.13, targets: A.targets, view: A.view, photo: A.photo, opacity: q("Opacity"), sea: true, stamp: tl("stamp-cop"), stampShort: tl("stamp-cop-short") };
      }),
    ];
    // UN paysage visible à la fois, celui de l'exemple choisi dans la liste
    // (Viériou ou l'Argentera) ; un exemple sans paysage LiDAR le cache ;
    // des valeurs modifiées à la main (liste vide) gardent le dernier montré.
    const LAND_OF = { vieriou: "elevLand", argentera: "elevArg", schneeberg: "elevSchnee", caussols: "elevCaus" };
    const showLand = (key) => {
      if (key === "") return;
      for (const id of Object.values(LAND_OF)) {
        const fig = container.querySelector("#" + id)?.closest(".fig.elev-land");
        const on = LAND_OF[key] === id;
        if (fig) { fig.hidden = !on; if (fig.nextElementSibling?.matches(".fcap")) fig.nextElementSibling.hidden = !on; }
      }
      const b = this._lands?.[Object.values(LAND_OF).indexOf(LAND_OF[key])];
      for (const x of this._lands || []) if (x && x !== b) x.land?.stop();
      if (b && !container.hidden) b.land?.start();
    };
    const sel = container.querySelector("#presetSel");
    sel?.addEventListener("change", () => showLand(sel.value));
    showLand(sel?.value || "vieriou");
    // « aplatir la Terre » (epic06/UC04) : figure animée partagée avec dip
    const fl = container.querySelector("#simFlatten");
    this._flat = fl ? mountFlatten(fl, container.querySelector("#simFlattenReads"), FLATTEN_CASES.elev) : null;
    drawSymbols(KEY);
  },
  render() { draw(); this._flat?.start(); for (const b of this._lands || []) if (b?.land && !b.canvas.closest("[hidden]")) b.land.start(); },
  teardown() { stop(); this._flat?.stop(); for (const b of this._lands || []) b.land?.stop(); },
};
