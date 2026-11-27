// Environnement de pré-rendu (epic25) : linkedom + enregistreurs Canvas (core/ctx-record.js) + wasm Rust (raster/).
// Importé par prerender-cards.mjs, .prerender-wasm.mjs et .anim-inventory.mjs ; L=<langue> choisit la langue.
import { parseHTML } from "linkedom";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { Frame } = await import(path.join(root, "src/core/ctx-record.js"));
const { loadRaster } = await import(path.join(root, "src/core/raster.js"));
const raster = await loadRaster(readFileSync(path.join(root, "raster/target/wasm32-unknown-unknown/release/raster.wasm")));
export const frame = new Frame(raster);
export { root, lang, raster };
const lang = process.env.L || "en";
const { window, document, HTMLElement, customElements } = parseHTML(readFileSync(path.join(root, "index.html"), "utf8"));
Object.assign(globalThis, { window, document, HTMLElement, customElements, navigator: { language: lang }, location: { hash: "", origin: "http://x", pathname: "/" } });
window.devicePixelRatio = 1; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
globalThis.requestAnimationFrame = window.requestAnimationFrame; globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
window.matchMedia = globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.ResizeObserver ??= class { observe() {} disconnect() {} unobserve() {} };
globalThis.MutationObserver ??= class { observe() {} disconnect() {} };
// Tailles et positions : une mise en page minimale d'écran de bureau (1280 px ; .wrap 1060 → figure ~1000 px), lue dans les
// vraies feuilles de style : width / max-width / height / min-height / aspect-ratio (clamp, calc, px, vw évalués) et les
// grilles `display: grid` en colonnes `fr` ; le reste s'empile en bloc. Sans cascade complète (pas de spécificité, les
// règles plus tardives l'emportent, @media évalués à 1280 px). Les positions ne servent qu'à garder la disposition
// RELATIVE des médias d'un bloc (core/export.js drawMedia).
const FW = 1000, VW = 1280;
const evalLen = (e) => { e = String(e).trim(); let m;
  if ((m = /^clamp\((.*)\)$/.exec(e))) { const parts = []; let d = 0, cur = ""; for (const ch of m[1]) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && !d) { parts.push(cur); cur = ""; } else cur += ch; } parts.push(cur);
    const [x, y, z] = parts.map(evalLen); return Math.min(z, Math.max(x, y)); }
  if ((m = /^calc\((.*)\)$/.exec(e))) { try { return Function(`return ${m[1].replace(/([\d.]+)px/g, "$1").replace(/([\d.]+)vw/g, `($1*${VW}/100)`)}`)(); } catch { return NaN; } }
  if ((m = /^([\d.]+)px$/.exec(e))) return +m[1]; if ((m = /^([\d.]+)vw$/.exec(e))) return +m[1] * VW / 100; return NaN; };
// -- feuilles de style
const cssFiles = [path.join(root, "src/core/theme.css"), path.join(root, "src/core/legacy.css"), path.join(root, "src/core/layout.css"),
  ...readdirSync(path.join(root, "src/tabs"), { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((d) => { const f = path.join(root, "src/tabs", d.name, "style.css"); return existsSync(f) ? [f] : []; })];
const mediaOk = (cond) => cond.split(/\band\b/).every((c) => { const m = /\(\s*(min|max)-width:\s*(\d+)px\s*\)/.exec(c); return m ? (m[1] === "min" ? VW >= +m[2] : VW <= +m[2]) : false; });
function parseCss(text, out = []) {
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i); if (open < 0) break;
    const head = text.slice(i, open).trim(); let d = 1, j = open + 1;
    while (j < text.length && d) { if (text[j] === "{") d++; else if (text[j] === "}") d--; j++; }
    const body = text.slice(open + 1, j - 1); i = j;
    if (head.startsWith("@media")) { if (mediaOk(head.slice(6))) parseCss(body, out); continue; }
    if (head.startsWith("@")) continue;
    const decl = {}; for (const part of body.split(/;(?![^(]*\))/)) { const k = part.indexOf(":"); if (k > 0) decl[part.slice(0, k).trim().toLowerCase()] = part.slice(k + 1).replace(/!important/, "").trim(); }
    for (const sel of head.split(/,(?![^(]*\))/)) out.push({ sel: sel.trim(), decl });
  }
  return out;
}
const RULES = cssFiles.flatMap((f) => parseCss(readFileSync(f, "utf8")));
const ruleCache = new WeakMap();   // les règles des feuilles de style ne changent pas ; le style EN LIGNE, si : les figures le posent en JS en dessinant (canvas.style.height)
const styleOf = (el) => {
  let st = ruleCache.get(el);
  if (!st) {
    st = {};
    if (el.matches) { for (const r of RULES) { let ok = false; try { ok = el.matches(r.sel); } catch { ok = false; } if (ok) Object.assign(st, r.decl); } }
    ruleCache.set(el, st);
  }
  const inline = el.getAttribute?.("style"); if (!inline) return st;
  const out = { ...st };
  for (const part of inline.split(";")) { const k = part.indexOf(":"); if (k > 0) out[part.slice(0, k).trim().toLowerCase()] = part.slice(k + 1).trim(); }
  return out;
};
const isMedia = (el) => /^(canvas|svg|video)$/i.test(el.tagName || "");
const hasMedia = (el) => isMedia(el) || !!el.querySelector?.("canvas, svg, video");
const gridOf = (el) => { const st = styleOf(el); if (!/grid/.test(st.display || "")) return null;
  const t = st["grid-template-columns"] || ""; let n = (t.match(/(\d*\.?\d*)fr/g) || []).length; const rep = /repeat\(\s*(\d+)/.exec(t); if (rep) n = +rep[1];
  return n > 1 ? { n, gap: evalLen(st["column-gap"] || st.gap?.split(/\s+/).pop() || "0") || 0, rgap: evalLen(st["row-gap"] || st.gap?.split(/\s+/)[0] || "0") || 0 } : null; };
const kids = (el) => [...el.children].filter((c) => !c.hasAttribute?.("hidden") && !/^(script|style)$/i.test(c.tagName));
/** Largeur disponible pour les enfants de `el` : la sienne (px déclaré, max-width) ou celle de son parent. */
function availW(el) {
  if (!el || !el.parentElement || el.id?.startsWith("tab-")) return FW;
  const st = styleOf(el); let w = availW(el.parentElement); const g = gridOf(el.parentElement);
  if (g) w = (availW(el.parentElement) - g.gap * (g.n - 1)) / g.n;
  const dw = evalLen(st.width || ""), mw = evalLen(st["max-width"] || "");
  if (Number.isFinite(dw)) w = dw; if (Number.isFinite(mw)) w = Math.min(w, mw); return w;
}
function sizeOf(el) {
  const tag = (el.tagName || "").toLowerCase(), st = styleOf(el); let w = availW(el);
  const mw = evalLen(st["max-width"] || ""); if (Number.isFinite(mw)) w = Math.min(w, mw);
  if (tag === "svg") {
    const vb = (el.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    return { w, h: vb.length === 4 && vb[2] > 0 ? Math.round(w * vb[3] / vb[2]) : Math.round(w * 0.6) };
  }
  if (tag === "video") { const v = videoInfo(el); if (v) return { w, h: Math.round(w * v.height / v.width) }; }
  let h = evalLen(st.height || "");
  if (!Number.isFinite(h)) { const ar = /([\d.]+)\s*(?:\/\s*([\d.]+))?/.exec(st["aspect-ratio"] || ""); h = ar ? w / (+ar[1] / (+ar[2] || 1)) : 340; }
  const mh = evalLen(st["min-height"] || ""); if (Number.isFinite(mh)) h = Math.max(h, mh);
  return { w, h: Math.round(h) };
}
/** Hauteur / largeur occupées par un élément dans son parent (médias : leur taille ; conteneurs : empilement de leurs médias). */
function boxOf(el) {
  if (isMedia(el)) return sizeOf(el);
  const ks = kids(el).filter(hasMedia); if (!ks.length) return { w: 0, h: 0 };
  const g = gridOf(el), bs = ks.map(boxOf);
  if (g) { const rows = []; bs.forEach((b, i) => { const r = Math.floor(i / g.n); rows[r] = Math.max(rows[r] || 0, b.h); }); return { w: availW(el), h: rows.reduce((a, b) => a + b, 0) + g.rgap * (rows.length - 1) }; }
  return { w: Math.max(...bs.map((b) => b.w)), h: bs.reduce((a, b) => a + b.h, 0) };
}
/** Position de `el` dans l'onglet : grille (colonnes égales) ou empilement en bloc. */
function posOf(el) {
  const P = el.parentElement; if (!P || P.id?.startsWith("tab-")) return { x: 0, y: 0 };
  const base = posOf(P), sibs = kids(P), i = sibs.indexOf(el), g = gridOf(P);
  if (g) {
    const cw = (availW(P) + 0 - g.gap * (g.n - 1)) / g.n, r = Math.floor(i / g.n), c = i % g.n;
    let y = 0; for (let k = 0; k < r; k++) y += Math.max(...sibs.slice(k * g.n, k * g.n + g.n).map((s) => boxOf(s).h)) + g.rgap;
    return { x: base.x + c * (cw + g.gap), y: base.y + y };
  }
  let y = 0; for (let k = 0; k < i; k++) y += boxOf(sibs[k]).h;
  return { x: base.x, y: base.y + y };
}
const rectOf = (el) => { const { w, h } = sizeOf(el), { x, y } = posOf(el); return { left: x, top: y, right: x + w, bottom: y + h, width: w, height: h, x, y }; };
const CP = Object.getPrototypeOf(document.createElement("canvas"));
CP.getContext = function (k) {
  if (k !== "2d") return null;
  if (!this._rec) { const z = sizeOf(this); this.width ||= z.w; this.height ||= z.h; this._rec = frame.ctx(+this.width, +this.height, this); }
  return this._rec;
};
HTMLElement.prototype.getContext = CP.getContext;
const SVGP = Object.getPrototypeOf(Object.getPrototypeOf(document.createElementNS("http://www.w3.org/2000/svg", "svg")));
HTMLElement.prototype.getBoundingClientRect = function () { return rectOf(this); };
SVGP.getBoundingClientRect = function () { return rectOf(this); };
for (const p of ["clientWidth", "offsetWidth"]) Object.defineProperty(HTMLElement.prototype, p, { get() { return sizeOf(this).w; }, configurable: true });
for (const p of ["clientHeight", "offsetHeight"]) Object.defineProperty(HTMLElement.prototype, p, { get() { return sizeOf(this).h; }, configurable: true });
HTMLElement.prototype.setPointerCapture ??= () => {}; HTMLElement.prototype.scrollIntoView ??= () => {};
window.getComputedStyle = globalThis.getComputedStyle = () => ({ getPropertyValue: () => "", position: "relative" });
const SP = Object.getPrototypeOf(document.createElement("select"));
Object.defineProperty(SP, "value", { configurable: true, get() { return (this.querySelector("option[selected]") || this.querySelector("option"))?.value ?? ""; }, set(v) { for (const o of this.querySelectorAll("option")) String(o.value) === String(v) ? o.setAttribute("selected", "") : o.removeAttribute("selected"); } });
Object.defineProperty(SP, "selectedIndex", { configurable: true, get() { return [...this.querySelectorAll("option")].findIndex((o) => o.hasAttribute("selected")); }, set(i) { [...this.querySelectorAll("option")].forEach((o, j) => j === i ? o.setAttribute("selected", "") : o.removeAttribute("selected")); } });
const i18n = await import(path.join(root, "src/core/i18n.js"));
{ const d = {}; for (const l of readdirSync(path.join(root, "src/i18n"))) { d[l] = {}; for (const f of readdirSync(path.join(root, "src/i18n", l))) d[l][f.slice(0, -5)] = JSON.parse(readFileSync(path.join(root, "src/i18n", l, f), "utf8")); } i18n._setDicts(d); }
document.documentElement.lang = lang;
// Images : un SVG (core/export.js svgImage, via un Blob) est rastérisé par resvg-wasm, une photo/tuile par ffmpeg ;
// le résultat (RGBA) est posé sur `_img`, que le contexte enregistreur envoie au wasm.
const { initWasm, Resvg } = await import(path.join(root, "node_modules/@resvg/resvg-wasm/index.mjs"));
await initWasm(readFileSync(path.join(root, "node_modules/@resvg/resvg-wasm/index_bg.wasm")));
const fonts = readdirSync("/usr/share/fonts/truetype/dejavu").map((f) => readFileSync("/usr/share/fonts/truetype/dejavu/" + f));
const blobs = new Map(); let blobN = 0;
globalThis.URL.createObjectURL = (b) => { const u = `blob:${++blobN}`; blobs.set(u, b); return u; };
globalThis.URL.revokeObjectURL = (u) => { blobs.delete(u); };
globalThis.XMLSerializer = class { serializeToString(n) { return n.outerHTML; } };
const photoCache = new Map();
function photo(file) {   // JPEG/PNG -> RGBA par ffmpeg (mis en cache)
  if (!photoCache.has(file)) {
    const probe = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]).toString().trim().split(",").map(Number);
    const data = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { maxBuffer: 1 << 30 });
    photoCache.set(file, { width: probe[0], height: probe[1], data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length) });
  }
  return photoCache.get(file);
}
globalThis.Image = class {
  constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
  set src(u) {
    this._src = u;
    this._p = (async () => {
      await new Promise((r) => setTimeout(r, 0));   // onload jamais synchrone : le module qui pose src n'a pas fini de s'initialiser
      try {
        if (u.startsWith("blob:") || u.startsWith("data:image/svg")) {
          const svg = u.startsWith("blob:") ? await blobs.get(u).text() : decodeURIComponent(u.slice(u.indexOf(",") + 1));
          const r = new Resvg(svg, { font: { fontBuffers: fonts, loadSystemFonts: false, defaultFontFamily: "DejaVu Sans" } }).render();
          this._img = { width: r.width, height: r.height, data: new Uint8ClampedArray(r.pixels) };
        } else this._img = photo(path.join(root, "public", u.replace(/^\//, "")));
        this.naturalWidth = this._img.width; this.naturalHeight = this._img.height; this.complete = true;
      } catch (e) { this.error = e; }
      this.onload?.();
    })();
  }
  get src() { return this._src; }
  decode() { return this._p; }
  // comme un navigateur (2026-11-27 : maps.js attend le manuscrit de Ptolémée par addEventListener)
  addEventListener(type, fn) { if (type === "load") { const prev = this.onload; this.onload = () => { prev?.(); fn(); }; } }
  removeEventListener() {}
};

// <video> (obs/jan10) : durée et image lues par ffprobe/ffmpeg ; poser currentTime décode l'image voulue (posée sur `_img`, que le
// contexte enregistreur dessine) puis émet « seeked », comme un navigateur.
const videoMeta = new Map(), frameCache = new Map();
function videoFile(el) { const src = el.getAttribute?.("src"); return src ? path.join(root, "public", src.replace(/^\//, "")) : null; }
function videoInfo(el) {
  const f = videoFile(el); if (!f || !existsSync(f)) return null;
  if (!videoMeta.has(f)) {
    const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-show_entries", "format=duration", "-of", "json", f]).toString());
    videoMeta.set(f, { width: j.streams[0].width, height: j.streams[0].height, duration: +j.format.duration });
  }
  return videoMeta.get(f);
}
const isVideo = (el) => (el.tagName || "").toUpperCase() === "VIDEO";
Object.defineProperties(HTMLElement.prototype, {
  duration: { configurable: true, get() { return isVideo(this) ? (videoInfo(this)?.duration ?? NaN) : undefined; } },
  videoWidth: { configurable: true, get() { return isVideo(this) ? videoInfo(this)?.width ?? 0 : undefined; } },
  videoHeight: { configurable: true, get() { return isVideo(this) ? videoInfo(this)?.height ?? 0 : undefined; } },
  paused: { configurable: true, get() { return isVideo(this) ? true : undefined; } },
  readyState: { configurable: true, get() { return isVideo(this) ? 4 : undefined; } },
  currentTime: {
    configurable: true,
    get() { return isVideo(this) ? this._ct || 0 : undefined; },
    set(t) {
      if (!isVideo(this)) { this._ct = t; return; }
      const f = videoFile(this), info = videoInfo(this); this._ct = t; if (!info) return;
      const k = `${f}@${t.toFixed(3)}`;
      if (!frameCache.has(k)) {
        const data = execFileSync("ffmpeg", ["-v", "error", "-ss", String(t), "-i", f, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { maxBuffer: 1 << 28 });
        if (frameCache.size > 4) frameCache.delete(frameCache.keys().next().value);
        frameCache.set(k, { width: info.width, height: info.height, data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length) });
      }
      this._img = frameCache.get(k);
      setTimeout(() => this.dispatchEvent(new window.Event("seeked")), 0);
    },
  },
});
HTMLElement.prototype.pause = function () {}; HTMLElement.prototype.play = function () { return Promise.resolve(); };

