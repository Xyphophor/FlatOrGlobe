// Bouton « exporter » sur chaque figure (epic10). Un menu : ce qu'on exporte -- l'image
// (PNG, JPG), l'animation (MP4, GIF) si la figure en est une, et les cartes
// autonomes (epic11 : texte écrit pour être lu hors de la page, mini ou
// complète) de cette figure ou de l'ensemble dont elle fait partie. Les modules lourds (encodeurs
// vidéo et GIF) ne sont chargés qu'au moment d'exporter. Plus de choix de taille (2026-10-24, propriétaire) : la figure
// sort à sa propre taille en HD, la carte au format « hd » taillé pour elle (export-card.js, planHd).
import { makeT } from "./i18n.js";
import { exportImage, creditInfo, withQr, sectionOfBlock, setActiveTab, fileName, save } from "./export.js";
import { fetchPrerendered } from "./prerendered.js";
import { controlsSignature, cardFileFig } from "./ctl-signature.js";
import { tabLabel } from "./tabs.js";
import { cardsForIds, cardText } from "./cards.js";

let menu = null, t = null;

/** Le bloc de figure exportable : .fig, un hôte .figsym hors .fig, ou un bloc marqué [data-xp-block] (une figure dans un .panel). */
function blocksIn(root) {
  const figs = [...root.querySelectorAll(".fig, .figopen, [data-xp-block]")].filter((f) => f.querySelector("canvas, svg, video") && !f.parentElement?.closest(".fig, .figopen"));
  const syms = [...root.querySelectorAll(".figsym")].filter((s) => s.querySelector("svg") && !s.closest(".fig"));
  return [...figs, ...syms];
}
/** Animation exportable (contrat UC02) : un canvas du bloc porte __anim = { duration, frameAt(t) }. */
export function animOf(block) {
  for (const c of block.querySelectorAll("canvas")) if (c.__anim) return c.__anim;
  return block.__anim || block.querySelector(".figsym")?.__anim || null;
}

function figName(block) {
  const c = block.querySelector("canvas[id], svg[id]") || block;
  return block.id || c.id || block.querySelector("[id]")?.id || "figure";
}

function closeMenu() { menu?.remove(); menu = null; }

async function openMenu(btn, block, tab) {
  closeMenu();
  t ??= makeT(document.documentElement.lang || "en", "export");
  // le lien de l'image est celui de la SECTION où est la figure, avec son QR code (2026-10-04)
  const info = await withQr(creditInfo(tab.key, tabLabel(tab.key), sectionOfBlock(block)));
  const anim = animOf(block);
  const ids = new Set([block.id, ...[...block.querySelectorAll("[id]")].map((e) => e.id)].filter(Boolean));
  const { own, sets } = cardsForIds(tab.key, ids);
  const cards = [...own.map((c) => [c, "card-this"]), ...sets.map((c) => [c, "card-set"])];
  const { cardAnim } = cards.length ? await import("./export-card.js") : {};
  const lang = document.documentElement.lang || "en";
  const moving = cards.map(([c]) => !!cardAnim(c));
  menu = document.createElement("div");
  menu.className = "xp-menu"; menu.setAttribute("role", "dialog"); menu.setAttribute("aria-label", t("title"));
  menu.innerHTML =
    `<div class="xp-row">` +
    `<button type="button" data-do="png">${t("png")}</button><button type="button" data-do="jpg">${t("jpg")}</button>` +
    (anim ? `<button type="button" data-do="mp4">${t("mp4")}</button><button type="button" data-do="gif">${t("gif")}</button>` : "") +
    `</div>` +
    (moving.some(Boolean) ? `<div class="xp-row" role="radiogroup" aria-label="${t("card-kind")}"><span class="xp-lab">${t("card-kind")}</span>` +
      ["png", "mp4", "gif"].map((k, i) => `<label><input type="radio" name="xp-card" value="${k}"${i ? "" : " checked"}> ${t("card-kind-" + k)}</label>`).join("") + `</div>` : "") +
    cards.map(([c, what], i) => `<div class="xp-row" role="group" aria-label="${t(what)}"><span class="xp-lab">${t(what)}${cards.length > 1 ? ` : <b>${cardText(tab.key, c, lang).title}</b>` : ""}</span>` +
      `<button type="button" data-do="card" data-card="${i}" data-len="mini">${t("card-mini")}</button>` +
      `<button type="button" data-do="card" data-card="${i}" data-len="card">${t("card-full")}</button></div>`).join("") +
    `<p class="xp-status" aria-live="polite"></p>`;
  const r = btn.getBoundingClientRect();
  menu.style.top = `${window.scrollY + r.bottom + 4}px`;
  menu.style.left = `${Math.max(8, Math.min(window.scrollX + r.right - 300, window.scrollX + document.documentElement.clientWidth - 308))}px`;
  document.body.appendChild(menu);
  const status = menu.querySelector(".xp-status");
  menu.addEventListener("click", async (e) => {
    const what = e.target.dataset?.do; if (!what) return;
    const format = what === "card" ? "hd" : "native";
    const buttons = menu.querySelectorAll("button"); buttons.forEach((b) => (b.disabled = true));
    status.textContent = t("working");
    try {
      setActiveTab(tab);
      if (what === "png" || what === "jpg") await exportImage(block, { format, type: what, info, figName: figName(block) });
      else if (what === "card") {
        const { exportCard } = await import("./export-card.js");
        const kind = menu.querySelector("input[name=xp-card]:checked")?.value || "png";
        const opts = { len: e.target.dataset.len, format, info, tabKey: tab.key, lang: document.documentElement.lang || "en" };
        const card = cards[+e.target.dataset.card][0];
        opts.name = cardFileFig(card, opts.len);
        if (kind === "png") await import("./export-card.js").then((m) => m.exportCard(card, opts));
        else {
          // MP4 déjà rendu (anglais ; contrôles encore à leur valeur initiale) : on le télécharge au lieu de le recalculer
          const ready = await fetchPrerendered({ tabKey: tab.key, cardId: card.id, len: opts.len, format, lang: opts.lang, kind, ctl: controlsSignature(card) });
          if (ready) { save(ready, fileName(tab.key, opts.name, format, "mp4")); status.textContent = t("done"); return; }
          const { exportCardVideo } = await import("./export-card.js");
          const r = await exportCardVideo(card, { ...opts, kind, onProgress: (p) => (status.textContent = `${t("working")} ${Math.round(p * 100)} %`) });
          if (r?.note) { status.textContent = t("note-" + r.note); return; }
        }
      }
      else {
        // une vitrine déjà rendue (src/data/video-figs.js ; anglais, MP4) : on la télécharge au lieu de la recalculer
        // la version téléphone (« portrait ») quand le canvas est plus haut que large au moment de l'export
        const cr = block.querySelector("canvas")?.getBoundingClientRect(), vfmt = cr && cr.height > cr.width ? "portrait" : format;
        const ready = what === "mp4" && await fetchPrerendered({ tabKey: tab.key, cardId: figName(block), len: "fig", format: vfmt, lang: document.documentElement.lang || "en", kind: "mp4" });
        if (ready) { save(ready, fileName(tab.key, figName(block), format, "mp4")); status.textContent = t("done"); return; }
        const { exportVideo } = await import("./export-video.js");
        const r = await exportVideo(block, anim, { kind: what, format, info, figName: figName(block), onProgress: (p) => (status.textContent = `${t("working")} ${Math.round(p * 100)} %`) });
        if (r?.note) { status.textContent = t("note-" + r.note); return; }
      }
      status.textContent = t("done");
    } catch (err) {
      console.error(err); status.textContent = `${t("failed")} ${err?.message || err}`;
    } finally { buttons.forEach((b) => (b.disabled = false)); if (menu) syncCards(); }
  });
  const syncCards = () => {
    if (!menu) return;
    const kind = menu.querySelector("input[name=xp-card]:checked")?.value || "png";
    menu.querySelectorAll("button[data-card]").forEach((b) => { b.disabled = kind !== "png" && !moving[+b.dataset.card]; });
  };
  menu.querySelectorAll("input[name=xp-card]").forEach((r) => r.addEventListener("change", syncCards));
  menu.querySelector("input")?.focus();
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
// e.isTrusted : le clic que save() fait sur son lien de téléchargement n'est pas un clic de l'utilisateur et ne doit pas fermer le menu
// (il le fermait, puis `syncCards` lisait un menu nul : « menu is null » après chaque export)
document.addEventListener("click", (e) => { if (e.isTrusted && menu && !menu.contains(e.target) && !e.target.closest(".xp-btn")) closeMenu(); });

/** Ajoute le bouton d'export aux figures du panneau (idempotent). */
export function addExportButtons(root, tab) {
  t ??= makeT(document.documentElement.lang || "en", "export");
  for (const b of blocksIn(root)) {
    if (b.dataset.xp) continue;
    b.dataset.xp = "1";
    if (getComputedStyle(b).position === "static") b.style.position = "relative";
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "xp-btn"; btn.textContent = "⤓";
    btn.setAttribute("aria-label", t("button")); btn.title = t("button");
    btn.addEventListener("click", (e) => { e.stopPropagation(); menu ? closeMenu() : openMenu(btn, b, tab); });
    b.appendChild(btn);
  }
}
