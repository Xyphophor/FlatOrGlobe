// Fumée de montage SANS navigateur ni Vite (la machine de dev ne supporte
// ni l'un ni l'autre confortablement -- voir NOTES.md) : monte chaque
// onglet dans un DOM linkedom avec un canvas factice, appelle render()
// puis teardown(), et imprime ce que le panneau contient (titres,
// formules, figures montées, tables remplies, mots) -- de quoi voir un
// onglet vide ou une exception de montage depuis le terminal.
//
// Usage : node --import ./scripts/smoke-register.mjs scripts/mount-smoke.mjs [clé ...]
//   --content : formules sans figure, figures sans légende, mots par section (content-audit.mjs)
//   --a11y : applique src/core/a11y.js puis liste les manques d'accessibilité
//   (scripts/a11y-checks.mjs) ; A11Y_NAMES=1 imprime le nom donné à chaque figure.
//
// Limites : pas de mise en page (getBoundingClientRect est simulé à
// 600x340 pour que les dessins s'exécutent), pas de WebGL (Three.js n'est
// jamais chargé : les scènes 3D restent sur leur repli 2D), pas de
// dictionnaire i18n (import.meta.glob est un objet Vite ; les clés
// s'affichent brutes -- ce n'est PAS un bug de l'onglet).
import { root, document, ctxCalls, ctxTexts } from "./dom-env.mjs";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";

const tabsDir = path.join(root, "src/tabs");
const A11Y = process.argv.includes("--a11y");          // epic06/UC03 : contrôles d'accessibilité
const { a11yCheck, duplicateIds } = A11Y ? await import("./a11y-checks.mjs") : {};
const { enhance } = A11Y ? await import(path.join(root, "src/core/a11y.js")) : {};
const CONTENT = process.argv.includes("--content");  // 2026-10-01 : formules/figures/légendes/poids du texte
const { contentAudit } = CONTENT ? await import("./content-audit.mjs") : {};
const { subscriptsIn } = CONTENT ? await import(path.join(root, "src/core/subscript.js")) : {};   // comme main.js : l'audit voit les indices posés
const wanted = process.argv.slice(2).filter((a) => a !== "--a11y" && a !== "--content");
const names = readdirSync(tabsDir, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name).filter((n) => existsSync(path.join(tabsDir, n, "index.js"))).filter((n) => !wanted.length || wanted.includes(n));

const tabbar = document.getElementById("tabbar"), panels = document.getElementById("tabpanels");
let failed = 0;
const mods = [];
for (const name of names) {
  try { mods.push(await import(path.join(tabsDir, name, "index.js"))); }
  catch (e) { failed++; console.log(`✗ ${name}: import failed -- ${e.stack.split("\n").slice(0, 3).join(" | ")}`); }
}
// barre d'onglets (tabLabel() lit les libellés dessus)
tabbar.innerHTML = mods.map((m) => `<button class="tab" id="tabbtn-${m.default.key}" role="tab">${m.default.label ?? m.default.key}</button>`).join("");

for (const m of mods) {
  const tab = m.default;
  const c = document.createElement("section"); c.id = `tab-${tab.key}`; c.className = "tabpanel"; panels.appendChild(c);
  const before = ctxCalls.n;
  ctxTexts.clear();
  const errs = [];
  const step = (what, fn) => { try { fn(); } catch (e) { errs.push(`${what}: ${e.stack.split("\n").slice(0, 3).join(" | ")}`); } };
  step("mount", () => tab.mount(c));
  if (tab.ready) { try { await tab.ready; } catch (e) { console.log(`  ${tab.key}: ready: ${e.message}`); } }   // onglets à chargement asynchrone
  step("render", () => tab.render());
  step("render#2", () => tab.render());
  step("teardown", () => tab.teardown());
  if (A11Y) { enhance(c); if (process.env.A11Y_NAMES) for (const g of c.querySelectorAll("canvas[role=img], svg[role=img]")) { const id = g.getAttribute("aria-labelledby"); const t = id ? document.getElementById(id)?.textContent : g.getAttribute("aria-label"); console.log(`    ${g.id || g.tagName} ← ${(t || "").replace(/\s+/g, " ").trim().slice(0, 70)}`); } const f = a11yCheck(c); const by = {}; for (const x of f) { const [k, ...r] = x.split(" "); (by[k] ??= []).push(r.join(" ")); }
    console.log(`  a11y ${tab.key}: ${f.length ? Object.entries(by).map(([k, v]) => `${k} ${v.length} (${v.slice(0, 6).join(", ")}${v.length > 6 ? "…" : ""})`).join(" · ") : "rien"}`); }
  if (CONTENT) { subscriptsIn(c); const a = contentAudit(c, ctxTexts);
    console.log(`  content ${tab.key}: formules ${a.nFormulas}, sans figure propre ${a.formulasNoFig.length} (dont voisine ${a.formulasNoFig.filter((x) => x.startsWith("(voisine)")).length}) · figures sans légende ${a.figsNoCap.length}`);
    for (const f of a.formulasNoFig) console.log(`    F ${f}`);
    for (const f of a.figsNoCap) console.log(`    L ${f}`);
    for (const f of a.texFail) console.log(`    TeX refusé : ${f.slice(0, 90)}`);
    for (const f of a.rawSub) console.log(`    indice brut : ${f}`);
    console.log("    mots/section : " + a.sections.filter((s) => s.w).map((s) => `${s.w} «${s.h.slice(0, 40)}»`).join(" | "));
    console.log(`    classes : mesure ${a.ev.measure} · validation ${a.ev.check} · prédiction ${a.ev.model} · sans badge ${a.ev.none.length}${a.ev.none.length ? ` (${a.ev.none.map((h) => `«${h}»`).join(", ")})` : ""}`); }
  const q = (s) => c.querySelectorAll(s).length;
  const words = c.textContent.replace(/\s+/g, " ").trim().split(" ").length;
  const figsym = [...c.querySelectorAll(".figsym")], emptyFig = figsym.filter((f) => !f.querySelector("svg")).map((f) => f.id);
  const tables = [...c.querySelectorAll("tbody")], emptyTb = tables.filter((t) => !t.children.length).map((t) => t.id || "?");
  const rawKeys = [...c.querySelectorAll("h1,h2,p,label")].filter((e) => /^[a-z0-9-]+$/.test(e.textContent.trim())).length;
  const line = `${errs.length ? "✗" : "✓"} ${tab.key.padEnd(7)} words ${String(words).padStart(5)}  h2 ${String(q("h2")).padStart(2)}  formulas ${String(q(".formula")).padStart(2)}  figsym ${figsym.length - emptyFig.length}/${figsym.length}  svg ${String(q("svg")).padStart(3)}  canvas ${String(q("canvas")).padStart(2)} (ctx calls ${ctxCalls.n - before})  tables ${tables.length}${emptyTb.length ? " EMPTY:" + emptyTb.join(",") : ""}  srcs ${q(".srcs li")}  xref ${q("a[data-xref]")}${rawKeys ? "  raw-i18n-keys " + rawKeys : ""}`;
  console.log(line);
  if (emptyFig.length) console.log(`    figsym without svg: ${emptyFig.join(", ")}`);
  for (const e of errs) { failed++; console.log("    " + e); }
}
if (A11Y) console.log(`  a11y ids en double (page entière) : ${duplicateIds(document).join(", ") || "aucun"}`);
process.exit(failed ? 1 : 0);
