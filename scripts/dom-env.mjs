// DOM factice partagé (linkedom, canvas absorbant, dictionnaires i18n chargés à la main) :
// sorti de scripts/mount-smoke.mjs le 2026-10-06 pour servir aussi à scripts/build_ai.mjs.
// À importer AVANT tout module d'onglet (ils lisent document au chargement).
import { parseHTML } from "linkedom";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const { window, document, HTMLElement, customElements } = parseHTML(readFileSync(path.join(root, "index.html"), "utf8"));
Object.assign(globalThis, { window, document, HTMLElement, customElements, navigator: { language: "en" }, location: { hash: "" } });
window.devicePixelRatio = 1;
window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
globalThis.requestAnimationFrame = window.requestAnimationFrame; globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.matchMedia = window.matchMedia;
window.scrollTo = () => {};
globalThis.ResizeObserver ??= class { observe() {} disconnect() {} unobserve() {} };
globalThis.MutationObserver ??= class { observe() {} disconnect() {} };

// canvas factice : tout appel de méthode est absorbé, measureText mesure ~6px/caractère
export const ctxCalls = { n: 0 };
export const ctxTexts = new Set();   // textes écrits par fillText/strokeText (content-audit : indices TeX restés bruts)
const fakeCtx = new Proxy({}, {
  get(_, k) {
    if (k === "measureText") return (s) => ({ width: 6 * String(s).length });
    if (k === "canvas") return null;
    if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop() {} });
    if (k === "getImageData" || k === "createImageData") return (a, b, c, d) => { const w = typeof a === "object" ? a.width : (c ?? a), h = typeof a === "object" ? a.height : (d ?? b); return { width: w, height: h, data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)) }; };
    if (k === "fillText" || k === "strokeText") return (t) => { ctxCalls.n++; ctxTexts.add(String(t)); };
    return (..._a) => { ctxCalls.n++; };
  },
  set() { return true; },
});
HTMLElement.prototype.getContext = function (kind) { return kind === "2d" ? fakeCtx : null; };
const CanvasProto = Object.getPrototypeOf(document.createElement("canvas"));
CanvasProto.getContext = HTMLElement.prototype.getContext;
HTMLElement.prototype.getBoundingClientRect = function () { return { width: 600, height: 340, left: 0, top: 0, right: 600, bottom: 340, x: 0, y: 0 }; };
Object.defineProperty(HTMLElement.prototype, "clientWidth", { get: () => 600, configurable: true });
Object.defineProperty(HTMLElement.prototype, "clientHeight", { get: () => 340, configurable: true });
Object.defineProperty(HTMLElement.prototype, "offsetWidth", { get: () => 600, configurable: true });
Object.defineProperty(HTMLElement.prototype, "offsetHeight", { get: () => 340, configurable: true });
HTMLElement.prototype.setPointerCapture ??= () => {};
window.getComputedStyle = () => ({ getPropertyValue: () => "" });
globalThis.getComputedStyle = window.getComputedStyle;
// linkedom : <select>.value n'a qu'un getter -- on le rend assignable (sélectionne l'option)
const SelectProto = Object.getPrototypeOf(document.createElement("select"));
Object.defineProperty(SelectProto, "value", { configurable: true,
  get() { return (this.querySelector("option[selected]") || this.querySelector("option"))?.value ?? ""; },
  set(v) { for (const o of this.querySelectorAll("option")) { if (String(o.value) === String(v)) o.setAttribute("selected", ""); else o.removeAttribute("selected"); } } });
Object.defineProperty(SelectProto, "selectedIndex", { configurable: true,
  get() { const os = [...this.querySelectorAll("option")]; const i = os.findIndex((o) => o.hasAttribute("selected")); return i; },
  set(i) { [...this.querySelectorAll("option")].forEach((o, j) => j === i ? o.setAttribute("selected", "") : o.removeAttribute("selected")); } });
// dictionnaires i18n : import.meta.glob n'existe pas sous Node, on les charge à la main
const { _setDicts } = await import(path.join(root, "src/core/i18n.js"));
{ const dicts = {}; const i18nDir = path.join(root, "src/i18n");
  for (const lang of readdirSync(i18nDir)) { dicts[lang] = {}; for (const f of readdirSync(path.join(i18nDir, lang))) if (f.endsWith(".json")) dicts[lang][f.slice(0, -5)] = JSON.parse(readFileSync(path.join(i18nDir, lang, f), "utf8")); }
  _setDicts(dicts); }
HTMLElement.prototype.scrollIntoView ??= () => {};
document.documentElement.lang = process.env.L || "en";   // L=fr : monter les onglets en français (comme .render-tab-canvas)
