// Navigation (propriétaire, 2026-10-04) : liens profonds vers un onglet ou une section, et
// table des matières à gauche qui suit la lecture.
//
// Adresse : #tab-<clé> (inchangée, les liens existants marchent) ou #tab-<clé>/<section>.
// <section> est la clé stable du titre (data-sec : la clé k de la prose, ou la clé i18n des
// onglets réécrits), donc la même dans toutes les langues ; à défaut, s<rang> (le n-ième h2).
// L'élément porte id="sec-<clé>-<section>".
import { makeT } from "./i18n.js";

export const secId = (tab, sec) => `sec-${tab}-${sec}`;
export const RENAMED = { sim: "elev" };   // 2026-09-25
// sections passées d'un onglet à un autre : les anciens liens (et les QR codes des images exportées) y mènent encore
export const MOVED = { "seis/tg-h1": "atmo", "seis/kr-h1": "atmo" };   // 2026-10-19 : Hunga Tonga et Krakatoa, de seis à atmo

/** Analyse le hash : { tab, sec } ou null. */
export function parseHash(hash) {
  const m = /^#tab-([a-z]+)(?:\/([A-Za-z0-9:_-]+))?$/.exec(hash || "");
  if (!m) return null;
  const tab = RENAMED[m[1]] || m[1], sec = m[2] || null;
  return { tab: (sec && MOVED[`${tab}/${sec}`]) || tab, sec };
}
export const hashOf = (tab, sec) => `#tab-${tab}${sec ? `/${sec}` : ""}`;

/** Adresse complète (sans schéma) d'un onglet ou d'une section, pour les cartes et le partage. */
export function linkOf(tab, sec) {
  const base = (typeof location !== "undefined" && location.origin !== "null") ? location.origin + location.pathname : "";
  return `${base}${hashOf(tab, sec)}`;
}

/** Les sections d'un panneau : titres h2 de premier niveau + Sources ; pose les ids. */
export function sectionsOf(container, tab) {
  const out = [];
  let i = 0;
  for (const h of container.querySelectorAll("h2.cnav-h2, section.srcs:not(.reading) > h2")) {
    if (h.closest("[hidden], details:not([open]) > :not(summary)")) continue;
    i++;
    const sec = h.dataset.sec || (h.closest("section.srcs") ? "sources" : `s${i}`);
    h.dataset.sec = sec;
    h.id ||= secId(tab, sec);
    const c = h.cloneNode(true);
    c.querySelectorAll(".ev, button, .seclink").forEach((e) => e.remove());
    out.push({ sec, id: h.id, el: h, text: c.textContent.replace(/\s+/g, " ").trim() });
  }
  return out;
}

/** Ajoute à chaque titre un petit lien « # » vers lui-même (copiable). */
export function addSectionLinks(list, tab, label) {
  for (const s of list) {
    if (s.el.querySelector(".seclink")) continue;
    const a = document.createElement("a");
    a.className = "seclink"; a.href = hashOf(tab, s.sec); a.textContent = "#";
    a.setAttribute("aria-label", `${label}: ${s.text}`);
    s.el.appendChild(a);
  }
}

/** Section courante : le dernier titre passé au-dessus du haut de la fenêtre (+ marge). */
export function currentSection(list, top = 90) {
  let cur = list[0] || null;
  for (const s of list) { if (s.el.getBoundingClientRect().top - top <= 0) cur = s; else break; }
  return cur;
}

/**
 * La table des matières : un <nav> à gauche (écrans larges), repliable en haut sur mobile.
 * render(tab, container) la reconstruit pour l'onglet actif ; le défilement met en évidence
 * la section courante.
 */
export function mountToc(nav) {
  const lang = () => document.documentElement.lang || "en";
  let list = [], tab = null, raf = 0;
  const t = (k, fb) => { const v = makeT(lang(), "nav")(k); return v && v !== k ? v : fb; };
  const mark = () => {
    raf = 0;
    const cur = currentSection(list);
    for (const a of nav.querySelectorAll("a[data-sec]")) {
      const on = cur && a.dataset.sec === cur.sec;
      a.classList.toggle("on", !!on);
      if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    }
  };
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-sec]"); if (!a) return;
    e.preventDefault();
    goTo(tab, a.dataset.sec);
    nav.querySelector("details")?.removeAttribute("open");
  });
  return {
    render(key, container, label) {
      tab = key;
      list = sectionsOf(container, key);
      addSectionLinks(list, key, t("link", "Link to this section"));
      nav.hidden = list.length < 2;
      nav.innerHTML = `<details class="toc-box" open><summary>${t("contents", "Contents")} · ${label}</summary><ol>` +
        list.map((s) => `<li><a href="${hashOf(key, s.sec)}" data-sec="${s.sec}">${s.text}</a></li>`).join("") + `</ol></details>`;
      if (window.matchMedia && !window.matchMedia("(min-width: 1100px)").matches) nav.querySelector("details")?.removeAttribute("open");
      mark();
    },
    refresh: mark,
  };
}

/** Fait défiler jusqu'à une section de l'onglet actif et inscrit l'adresse (sans recharger). */
export function goTo(tab, sec) {
  const el = document.getElementById(secId(tab, sec));
  if (el) { el.closest("details")?.setAttribute("open", ""); el.scrollIntoView({ block: "start" }); }
  try { history.replaceState(null, "", hashOf(tab, sec)); } catch { /* fichier local */ }
}
