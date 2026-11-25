// Bouton « code · données » (2026-11-25, Xyphophor : « si quelqu'un arrive sur par exemple le cumul du temps des
// séismes pour calculer le rayon, il puisse avec un clic récupérer un lien vers le code et un lien vers les datas » ;
// « le maître mot c'est la transparence »). Sur chaque titre de section qu'un jeu de données nomme (sections de son
// dataset.json), un bouton ouvre un panneau : le jeu, ses fichiers (comment obtenus, d'où exactement, publiés dans le
// dépôt ou non et pourquoi), leurs .explain, le code qui en fait les nombres, les fichiers générés, les sources.
// Tout vient de src/data/provenance.js (fog build explain). Les liens visent le dépôt public (src/data/repo.js) ;
// tant qu'il n'a pas d'adresse, les chemins s'affichent sans lien.
import { PROVENANCE } from "../data/provenance.js";
import { REPO } from "../data/repo.js";
import { makeT } from "./i18n.js";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pageLang = () => (typeof document !== "undefined" && document.documentElement?.lang) || "en";

/** Les jeux de données d'une section « onglet/section », dans l'ordre de provenance.js. */
export function datasetsOf(tab, sec) {
  const key = `${tab}/${sec}`;
  return Object.entries(PROVENANCE).filter(([, d]) => d.sections.includes(key)).map(([id, d]) => ({ id, ...d }));
}

/** Lien vers un chemin du dépôt public (dossier : tree, fichier : blob), ou le chemin seul tant qu'il n'y a pas de dépôt. */
export function repoLink(p, { dir = false, label = null } = {}) {
  const txt = `<code>${esc(label ?? p)}</code>`;
  if (!REPO.url) return txt;
  const kind = dir || !/\.[a-z0-9]+$/i.test(p) ? "tree" : "blob";
  return `<a href="${esc(`${REPO.url.replace(/\/$/, "")}/${kind}/${REPO.ref}/${p}`)}" target="_blank" rel="noopener">${txt}</a>`;
}

/** Le panneau d'une section (HTML). */
export function provPanel(tab, sec, lang = pageLang()) {
  const t = makeT(lang, "evidence"), ds = datasetsOf(tab, sec);
  if (!ds.length) return "";
  const items = ds.map((d) => {
    const ins = d.inputs.map(([pat, how, origin, pub, why, n]) =>
      `<li>${repoLink(`${d.dir}/${pat}`, { label: pat })} <span class="prov-n">(${n} ${t(n === 1 ? "prov-file" : "prov-files")})</span> — ${esc(t(`prov-how-${how}`))}. ${esc(origin)}` +
      ` <span class="prov-pub prov-pub-${pub ? "y" : "n"}">${pub ? esc(t("prov-pub-yes")) : `${esc(t("prov-pub-no"))} ${esc(why || d.why)}`}</span></li>`).join("");
    const src = d.sources.map(([c, u]) => `<li>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(c)}</a>` : esc(c)}</li>`).join("");
    return `<div class="prov-ds"><p class="prov-title"><b>${esc(d.title)}</b> <span class="prov-id">${esc(d.id)}</span></p>` +
      `<p class="prov-row"><span class="prov-k">${esc(t("prov-data"))}</span> ${repoLink(d.dir + "/", { dir: true, label: d.dir + "/" })} — ${esc(t("prov-explain"))}</p><ul class="prov-in">${ins}</ul>` +
      `<p class="prov-row"><span class="prov-k">${esc(t("prov-code"))}</span> ${d.code.map((c) => repoLink(c)).join(" · ")}</p>` +
      `<p class="prov-row"><span class="prov-k">${esc(t("prov-out"))}</span> ${d.outputs.map((o) => repoLink(o)).join(" · ")}</p>` +
      `<details class="prov-src"><summary>${esc(t("prov-sources"))} (${d.sources.length})</summary><ul>${src}</ul></details></div>`;
  }).join("");
  const foot = REPO.url ? t("prov-redo") : `${t("prov-norepo")} ${t("prov-redo")}`;
  return `<div class="provpanel" role="region" aria-label="${esc(t("prov-btn"))}">${items}<p class="prov-foot">${esc(foot)}</p></div>`;
}

/** Ajoute le bouton aux titres de section d'un onglet monté ; un clic ouvre ou ferme le panneau sous le titre. */
export function addProvButtons(container, tab, lang = pageLang()) {
  const t = makeT(lang, "evidence");
  for (const h of container.querySelectorAll("h2[data-sec]")) {
    const sec = h.getAttribute("data-sec");
    if (!datasetsOf(tab, sec).length || h.querySelector(".provbtn")) continue;
    const b = h.ownerDocument.createElement("button");
    b.type = "button"; b.className = "provbtn"; b.textContent = t("prov-btn");
    b.setAttribute("aria-expanded", "false"); b.title = t("prov-tip");
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const open = b.getAttribute("aria-expanded") === "true";
      const next = h.nextElementSibling;
      if (open) { if (next?.classList.contains("provpanel")) next.remove(); b.setAttribute("aria-expanded", "false"); return; }
      h.insertAdjacentHTML("afterend", provPanel(tab, sec, lang));
      b.setAttribute("aria-expanded", "true");
    });
    h.appendChild(b);
  }
}
