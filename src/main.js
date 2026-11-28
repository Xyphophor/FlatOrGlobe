// Registre de navigation, remplace TABLIST + activateTab() du legacy par
// une table construite depuis la liste des modules d'onglet importés.
// Voir tasks/epic01/UC03.org et ARCHITECTURE.md §6.
import "./core/theme.css";
import "./core/layout.css";
import "./core/legacy.css";
import { initTexPass, renderTexIn } from "./core/tex-mathml.js";
import { watchSubscripts } from "./core/subscript.js";
import { enhance } from "./core/a11y.js";
import { wireVideos } from "./core/video.js";
import { addExportButtons } from "./core/export-ui.js";
import { addProvButtons } from "./core/provenance.js";
import { setActiveTab } from "./core/export.js";
import { getStoredLang, setStoredLang, availableLangs, DEFAULT_LANG } from "./core/i18n.js";
import { parseHash, hashOf, goTo, mountToc } from "./core/nav.js";
import { TAB_GROUPS } from "./data/tabgroups.js";
import { makeT } from "./core/i18n.js";
import { tabLabel } from "./core/tabs.js";
import { mountThemeSelect } from "./core/theme.js";

// La langue mémorisée doit être posée AVANT qu'un onglet ne monte (chaque
// t()/getProseDict() lit document.documentElement.lang au montage) --
// epic04/UC01, voir ce fichier pour pourquoi un changement de langue
// recharge la page plutôt que de remonter les onglets à chaud.
const storedLang = getStoredLang();
if (storedLang) document.documentElement.lang = storedLang;

// Noms affichés dans le sélecteur ; une langue sans entrée ici (un ajout
// futur, epic04/UC05) s'affiche sous son code brut plutôt que de bloquer.
const LANG_NAMES = { en: "English", fr: "Français", de: "Deutsch", it: "Italiano", es: "Español", pt: "Português", nl: "Nederlands" };

import tabHome from "./tabs/home/index.js";
import tabElev from "./tabs/elev/index.js";
import tabHh from "./tabs/hh/index.js";
import tabRef from "./tabs/ref/index.js";
import tabCnav from "./tabs/cnav/index.js";
import tabStar from "./tabs/star/index.js";
import tabDist from "./tabs/dist/index.js";
import tabDip from "./tabs/dip/index.js";
import tabCurv from "./tabs/curv/index.js";
import tabGrav from "./tabs/grav/index.js";
import tabFou from "./tabs/fou/index.js";
import tabSeis from "./tabs/seis/index.js";
import tabMag from "./tabs/mag/index.js";
import tabSun from "./tabs/sun/index.js";
import tabTwi from "./tabs/twi/index.js";
import tabAzim from "./tabs/azim/index.js";
import tabEcl from "./tabs/ecl/index.js";
import tabRot from "./tabs/rot/index.js";
import tabOrb from "./tabs/orb/index.js";
import tabSat from "./tabs/sat/index.js";
import tabScale from "./tabs/scale/index.js";
import tabMath from "./tabs/math/index.js";
import tabPhys from "./tabs/phys/index.js";
import tabKappa from "./tabs/kappa/index.js";
import tabRules from "./tabs/rules/index.js";
import tabAtmo from "./tabs/atmo/index.js";
import tabMoon from "./tabs/moon/index.js";
import tabMap from "./tabs/map/index.js";
import tabAether from "./tabs/aether/index.js";
import tabRocket from "./tabs/rocket/index.js";
import tabPersp from "./tabs/persp/index.js";
import tabContrib from "./tabs/contrib/index.js";
import tabCases from "./tabs/cases/index.js";
import tabSurv from "./tabs/surv/index.js";
import tabCt from "./tabs/ct/index.js";
import tabGps from "./tabs/gps/index.js";
import tabRx from "./tabs/rx/index.js";
import tabAvia from "./tabs/avia/index.js";
import tabObs from "./tabs/obs/index.js";
import tabFalsify from "./tabs/falsify/index.js";
import tabResults from "./tabs/results/index.js";

// Chaque tâche de migration de l'epic02 ajoute son import ici, dans
// l'ordre où l'onglet doit apparaître dans la barre (ordre du TABLIST du
// legacy : home, sim (renommé elev le 2026-09-25), hh, ref, cnav, star, dist, dip, grav, fou, seis, mag,
// sun, twi, azim, surv, ct, gps, obs, falsify) -- aucun autre endroit du
// code n'a besoin d'être modifié pour ajouter un onglet. L'onglet gabarit
// src/tabs/_example/ n'est plus enregistré : il reste comme référence du
// contrat (et npm run check le vérifie toujours).
const TABS = [tabHome, tabRules, tabMath, tabKappa, tabPhys, tabElev, tabHh, tabRef, tabCnav, tabStar, tabDist, tabDip, tabCurv, tabGrav, tabFou, tabSeis, tabMag, tabSun, tabTwi, tabAzim, tabEcl, tabRot, tabOrb, tabSat, tabScale, tabMoon, tabMap, tabAether, tabPersp, tabSurv, tabCt, tabAtmo, tabRocket, tabCases, tabContrib, tabGps, tabRx, tabAvia, tabObs, tabResults, tabFalsify];

const HOME_KEY = "home";
const tabbar = document.getElementById("tabbar");
const panelsRoot = document.getElementById("tabpanels");

const tocNav = document.getElementById("toc");
const toc = tocNav ? mountToc(tocNav) : null;   // 2026-10-04 : table des matières à gauche
const mountedKeys = new Set();
const containers = new Map();
let activeKey = null;

/**
 * Sélecteur de langue (epic04/UC01) : liste availableLangs() (un fichier
 * src/i18n/<lang>/*.json au moins) + "en" toujours en premier même sans
 * fichier (c'est la source, jamais dupliquée dans un dictionnaire).
 * Changer de langue persiste le choix (src/core/i18n.js) puis recharge :
 * voir le commentaire en tête de ce fichier pour pourquoi.
 */
function buildLangBar() {
  const sel = document.getElementById("langsel");
  const note = document.getElementById("langnote");
  if (!sel) return;
  const langs = [DEFAULT_LANG, ...availableLangs().filter((l) => l !== DEFAULT_LANG).sort()];
  sel.innerHTML = langs.map((l) => `<option value="${l}">${LANG_NAMES[l] || l}</option>`).join("");
  sel.value = document.documentElement.lang || DEFAULT_LANG;
  if (!langs.includes(sel.value)) sel.value = DEFAULT_LANG; // langue stockée retirée depuis -- retombe proprement
  const syncNote = () => {
    if (!note) return;
    const isEn = sel.value === DEFAULT_LANG;
    note.hidden = isEn;
    if (!isEn) note.textContent = "Traduction partielle : le reste du site reste en anglais tant qu'il n'est pas traduit (epic04).";
  };
  syncNote();
  sel.addEventListener("change", () => {
    setStoredLang(sel.value);
    location.reload();
  });
}

/** Sélecteur de thème (auto / clair / sombre), à côté de la langue. */
function buildThemeBar() {
  mountThemeSelect(document.getElementById("themesel"), makeT(document.documentElement.lang || "en", "nav"));
}

// 2026-10-25 : 33 onglets ne tiennent plus sur une barre. Grand écran : deux niveaux, les groupes de
// src/data/tabgroups.js puis les onglets du groupe ouvert (ouvrir un groupe ne change pas d'onglet).
// Téléphone (≤ 700 px, layout.css) : un seul bouton « groupe › onglet ▾ » qui déplie la liste complète,
// groupe par groupe. Les boutons .tab gardent leurs ids tabbtn-<clé> (core/tabs.js y lit les noms).
let tabOrder = [];             // onglets hors accueil, dans l'ordre des groupes (précédent / suivant)
const groupOf = new Map();     // clé d'onglet -> id de groupe
let openGroup = () => {}, syncMenu = () => {};

function buildTabBar() {
  const tn = makeT(document.documentElement.lang || "en", "nav"), lab = (id) => { const v = tn(`group-${id}`); return v && v !== `group-${id}` ? v : id; };
  const byKey = new Map(TABS.map((t) => [t.key, t])), placed = new Set(), groups = [];
  for (const g of TAB_GROUPS) {
    const ts = g.tabs.filter((k) => k !== HOME_KEY).map((k) => byKey.get(k)).filter(Boolean); if (!ts.length) continue;
    ts.forEach((t) => placed.add(t.key));
    groups.push({ id: g.id, label: lab(g.id), tabs: ts });
  }
  const rest = TABS.filter((t) => !placed.has(t.key) && t.key !== HOME_KEY);   // un onglet hors groupe : groupe « other » à la fin
  if (rest.length) groups.push({ id: "other", label: lab("other"), tabs: rest });
  for (const g of groups) for (const t of g.tabs) { groupOf.set(t.key, g.id); tabOrder.push(t.key); }
  const name = (t) => t.label ?? t.key;
  const btn = (t, g) => `<button class="tab" id="tabbtn-${t.key}" data-group="${g.id}" role="tab" aria-controls="tab-${t.key}" aria-selected="false" tabindex="-1" hidden>${name(t)}</button>`;
  tabbar.innerHTML =
    `<button type="button" class="tabmenu-btn" aria-expanded="false" aria-controls="tabmenu"><span class="tm-txt"><span class="tm-grp"></span><b class="tm-tab"></b></span><span class="tm-ico" aria-hidden="true"></span></button>` +
    `<div class="tabgroups">${groups.map((g) => `<button type="button" class="tabgrp" data-group="${g.id}" aria-expanded="false">${g.label}</button>`).join("")}</div>` +
    `<div class="tabrow" role="tablist" aria-label="${tn("menu")}">${groups.map((g) => g.tabs.map((t) => btn(t, g)).join("")).join("")}</div>` +
    `<div class="tabmenu" id="tabmenu" hidden>${groups.map((g) => `<section><h3>${g.label}</h3><div>${g.tabs.map((t) => `<button type="button" class="tabmenu-item" data-key="${t.key}">${name(t)}</button>`).join("")}</div></section>`).join("")}</div>`;
  const menuBtn = tabbar.querySelector(".tabmenu-btn"), menu = tabbar.querySelector(".tabmenu");
  openGroup = (id) => {
    for (const b of tabbar.querySelectorAll(".tabgrp")) b.setAttribute("aria-expanded", String(b.dataset.group === id));
    for (const b of tabbar.querySelectorAll(".tab")) b.hidden = b.dataset.group !== id;
  };
  syncMenu = (key) => {
    const g = groups.find((x) => x.id === groupOf.get(key));
    menuBtn.querySelector(".tm-grp").textContent = g ? g.label : "";
    menuBtn.querySelector(".tm-tab").textContent = name(byKey.get(key) || { key });
    for (const b of tabbar.querySelectorAll(".tabgrp")) b.classList.toggle("has-active", b.dataset.group === g?.id);
    for (const b of menu.querySelectorAll(".tabmenu-item")) b.toggleAttribute("aria-current", b.dataset.key === key);
  };
  const setMenu = (open) => {
    menu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open));
    if (open) (menu.querySelector("[aria-current]") || menu.querySelector("button"))?.focus();
  };
  menuBtn.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => {
    const b = e.target.closest(".tabmenu-item"); if (!b) return;
    setMenu(false); activateTab(b.dataset.key); window.scrollTo({ top: 0, behavior: "instant" });
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("click", (e) => { if (!menu.hidden && !tabbar.contains(e.target)) setMenu(false); });
  for (const b of tabbar.querySelectorAll(".tabgrp")) b.addEventListener("click", () => openGroup(b.dataset.group));
  openGroup(groups[0]?.id);
  for (const t of TABS) {
    if (t.key !== HOME_KEY) document.getElementById(`tabbtn-${t.key}`).addEventListener("click", () => activateTab(t.key));
  }
  // 2026-10-04 : l'accueil n'est plus un onglet mais un bouton fixe, visible partout sauf sur l'accueil.
  // Il garde l'id tabbtn-home : core/tabs.js y lit le nom de l'onglet pour les liens croisés.
  const home = byKey.get(HOME_KEY);
  if (home) {
    const hb = document.createElement("button");
    hb.type = "button"; hb.id = `tabbtn-${HOME_KEY}`; hb.className = "homebtn"; hb.hidden = true;
    hb.innerHTML = `<span aria-hidden="true">⌂</span> ${home.label ?? HOME_KEY}`;
    hb.addEventListener("click", () => { activateTab(HOME_KEY); window.scrollTo({ top: 0, behavior: "instant" }); });
    document.body.appendChild(hb);
  }
  // Navigation clavier : flèches gauche/droite comme le legacy, plus Début/Fin
  // (motif ARIA des onglets, epic06/UC03), parmi les onglets du groupe ouvert. Seul l'onglet actif
  // est dans l'ordre de tabulation (tabindex 0, les autres -1).
  tabbar.querySelector(".tabrow").addEventListener("keydown", (e) => {
    const btns = Array.from(tabbar.querySelectorAll(".tab:not([hidden])"));
    const i = btns.indexOf(document.activeElement);
    if (i === -1) return;
    const j = e.key === "ArrowRight" ? (i + 1) % btns.length : e.key === "ArrowLeft" ? (i + btns.length - 1) % btns.length
      : e.key === "Home" ? 0 : e.key === "End" ? btns.length - 1 : -1;
    if (j === -1) return;
    e.preventDefault();
    btns[j].focus();
    btns[j].click();
  });
}

// « ← précédent / suivant → » en bas de chaque onglet, dans l'ordre des groupes (2026-10-25) ; des liens
// data-xref, activés par l'écouteur délégué plus bas. Remis si render() a refait le panneau.
function addPrevNext(container, key) {
  if (key === HOME_KEY || container.querySelector(":scope > .tabnext")) return;
  const i = tabOrder.indexOf(key); if (i === -1) return;
  const tn = makeT(document.documentElement.lang || "en", "nav");
  const link = (k, dir) => k ? `<a class="tabnext-${dir}" href="#tab-${k}" data-xref="${k}"><small>${tn(dir)}</small><span>${dir === "prev" ? "← " : ""}${tabLabel(k)}${dir === "next" ? " →" : ""}</span></a>` : "<span></span>";
  const nav = document.createElement("nav");
  nav.className = "tabnext"; nav.setAttribute("aria-label", tn("menu"));
  nav.innerHTML = link(tabOrder[i - 1], "prev") + link(tabOrder[i + 1], "next");
  container.appendChild(nav);
}

function ensureMounted(tab) {
  if (mountedKeys.has(tab.key)) return containers.get(tab.key);
  const container = document.createElement("section");
  container.id = `tab-${tab.key}`;
  container.className = "tabpanel";
  container.setAttribute("role", "tabpanel");
  container.setAttribute("aria-labelledby", `tabbtn-${tab.key}`);
  container.hidden = true;
  panelsRoot.appendChild(container);
  tab.mount(container);
  // Convertit les formules [data-tex] que ce module vient d'injecter --
  // initTexPass() ne traite que la coquille chargée au départ, pas le
  // contenu monté après coup (voir src/core/tex-mathml.js).
  renderTexIn(container);
  enhance(container); // epic06/UC03 : noms accessibles, libellés, puces « voir aussi »
  addExportButtons(container, tab); // epic10 : bouton d'export sur chaque figure
  addProvButtons(container, tab.key); // 2026-11-25 : « code · données » sur les sections qu'un jeu de données nomme
  mountedKeys.add(tab.key);
  containers.set(tab.key, container);
  return container;
}

// bouton d'onglet actif ou non ; le bouton fixe de l'accueil se cache sur l'accueil au lieu d'être « sélectionné »
function markBtn(key, on) {
  const b = document.getElementById(`tabbtn-${key}`); if (!b) return;
  if (key === HOME_KEY) { b.hidden = on; return; }
  b.setAttribute("aria-selected", String(on)); b.setAttribute("tabindex", on ? "0" : "-1");
  if (on) openGroup(groupOf.get(key));
}

// Animation de chargement (2026-10-25) : le premier affichage d'un onglet monte tout son panneau d'un bloc (des
// secondes sur une machine lente). Le bouton et l'animation changent tout de suite ; le montage attend qu'elle soit
// peinte. Elle n'anime que transform/opacity, que le navigateur continue d'animer pendant que le montage bloque.
// La même est dans index.html pendant le chargement de la page.
const loader = document.getElementById("tabloader");
let loadSeq = 0;
function setLoading(on) { if (loader) loader.hidden = !on; }

function activateTab(key, sec = null) {
  if (activeKey === key) { if (sec) goTo(key, sec); return; }
  const tab = TABS.find((t) => t.key === key);
  if (!tab) return;
  const prev = TABS.find((t) => t.key === activeKey);
  if (prev && mountedKeys.has(prev.key)) { prev.teardown?.(); containers.get(prev.key).hidden = true; }
  if (prev) markBtn(prev.key, false);
  markBtn(key, true);
  syncMenu(key);
  activeKey = key;
  const seq = ++loadSeq;
  if (mountedKeys.has(key)) { setLoading(false); showTab(tab, sec); return; }
  setLoading(true);
  // après la peinture de l'animation ; le délai de secours sert quand rAF ne vient pas (page en arrière-plan)
  let done = false;
  const go = () => {
    if (done) return; done = true;
    if (seq !== loadSeq) return;   // un autre onglet a été demandé entre-temps
    try { showTab(tab, sec); } finally { setLoading(false); }
  };
  requestAnimationFrame(() => setTimeout(go, 0));
  setTimeout(go, 120);
}

function showTab(tab, sec) {
  const key = tab.key;
  const container = ensureMounted(tab);
  container.hidden = false;
  tab.render();
  addPrevNext(container, key);
  enhance(container); // render() peut recréer des figures
  addExportButtons(container, tab);
  setActiveTab(tab);
  toc?.render(key, container, tab.label ?? key);
  // l'adresse suit l'onglet (partageable) ; une section demandée est atteinte une fois le panneau dessiné
  if (sec) requestAnimationFrame(() => goTo(key, sec));
  else try { history.replaceState(null, "", hashOf(key)); } catch { /* fichier local */ }
}

// vidéos de démonstration : la façade se remplace par le lecteur au clic (core/video.js)
wireVideos();

// Navigation croisée entre onglets (chips "see also", table falsify, cartes
// de l'accueil) : un lien <a data-xref="key"> active l'onglet au lieu de
// sauter vers un panneau masqué -- même écouteur délégué que le legacy.
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-xref]");
  if (!a) return;
  const key = a.getAttribute("data-xref"), sec = a.getAttribute("data-sec");
  if (!TABS.some((t) => t.key === key)) return;
  e.preventDefault();
  activateTab(key, sec);
  if (key !== HOME_KEY) document.getElementById(`tabbtn-${key}`)?.scrollIntoView({ block: "nearest", inline: "center" });
  if (!sec) window.scrollTo({ top: 0, behavior: "instant" });
});

// Lien profond : #tab-<clé> ouvre directement cet onglet (au chargement
// et sur changement de hash). Le legacy ne le faisait pas ; c'est aussi ce
// qui permet de capturer un onglet précis en navigateur headless
// (scripts/screenshot.sh) puisqu'aucun clic n'est possible là.
// #tab-<clé>/<section> (2026-10-04) : la section est atteinte après le montage ; les anciennes
// clés renommées (sim -> elev) sont traduites par src/core/nav.js.
function fromHash() {
  const h = parseHash(location.hash);
  return h && TABS.some((t) => t.key === h.tab) ? h : null;
}
buildTabBar();
buildLangBar();
buildThemeBar();
// mode IA (epic20) : le résumé statique d'index.html sert aux lecteurs sans JavaScript ; la ligne
// « For AI assistants » de l'en-tête reste, traduite (le Markdown, lui, reste en anglais)
document.getElementById("static-summary")?.remove();
{ const v = makeT(document.documentElement.lang || "en", "nav")("loading"); if (loader && v !== "loading") loader.querySelector(".tl-txt").textContent = v; }
{ const el = document.getElementById("ai-note"), v = makeT(document.documentElement.lang || "en", "nav")("ai-note"); if (el && v !== "ai-note") el.innerHTML = v; }
{ const h = fromHash(); if (TABS.length) activateTab(h?.tab || TABS[0].key, h?.sec || null); }
window.addEventListener("hashchange", () => { const h = fromHash(); if (h) activateTab(h.tab, h.sec); });
// un lien « # » de titre ou de la table des matières : défilement doux sans recharger
document.addEventListener("click", (e) => {
  const a = e.target.closest("a.seclink"); if (!a) return;
  const h = parseHash(a.getAttribute("href")); if (!h) return;
  e.preventDefault(); activateTab(h.tab, h.sec);
  navigator.clipboard?.writeText(a.href).catch(() => {});
});
initTexPass();
watchSubscripts(panelsRoot);   // « x_t » hors TeX (prose, sorties, libellés SVG) : le vrai indice, aussi après chaque mise à jour
