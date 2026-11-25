// Contexte Canvas 2D ENREGISTREUR (epic25) : le même code de figure dessine dessus au lieu d'un canvas,
// chaque appel devient quelques nombres dans un flux, que le wasm Rust (raster/) rejoue en pixels.
// Une image = un appel au wasm (le flux entier), pas un appel par lineTo. Ni DOM ni Node ici : le
// même module sert la page (export) et les scripts de pré-rendu. Codes d'opération : raster/src/lib.rs.
const OP = { save: 0, restore: 1, setTransform: 2, transform: 3, translate: 4, scale: 5, rotate: 6, beginPath: 7, moveTo: 8, lineTo: 9,
  closePath: 10, rect: 11, arc: 12, ellipse: 13, quad: 14, bezier: 15, fill: 16, stroke: 17, clip: 18, fillRect: 19, strokeRect: 20, clearRect: 21,
  fillColor: 22, strokeColor: 23, fillGrad: 24, strokeGrad: 25, lineWidth: 26, dash: 27, alpha: 28, font: 29, align: 30, baseline: 31,
  fillText: 32, strokeText: 33, gradLinear: 34, gradRadial: 35, gradStop: 36, drawImage: 37, defImage: 38, cap: 39, join: 40, base: 41, reset: 42, layer: 43, endLayer: 44 };
const ALIGN = { left: 0, start: 0, center: 1, right: 2, end: 2 }, BASE = { alphabetic: 0, middle: 1, top: 2, hanging: 2, bottom: 3, ideographic: 3 };
const CAP = { butt: 0, round: 1, square: 2 }, JOIN = { miter: 0, round: 1, bevel: 2 };
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];

/** Ce que partagent les enregistreurs d'un export : table de chaînes (qui ne fait que grandir, les figures fixes réutilisent leurs ordres d'une image à l'autre), numéros de dégradés et d'images.
 *  Les images (RGBA) ne sont PAS gardées ici : chaque enregistreur retient celles qu'il dessine (`used`), la racine envoie au wasm
 *  celles de l'image en cours et pas une de plus (2026-10-15 : les garder toutes faisait croître la mémoire et chaque rendu). */
export class Frame {
  constructor(raster) { this.raster = raster; this.strs = []; this.map = new Map(); this.nGrad = 0; this.nImg = 0; this.imgId = new WeakMap(); }
  str(s) { s = String(s); let i = this.map.get(s); if (i === undefined) { i = this.strs.length; this.strs.push(s); this.map.set(s, i); } return i; }
  /** Un enregistreur de la taille donnée (pixels du canvas), `owner` = l'élément canvas qu'il remplace. */
  ctx(w, h, owner = null) { return new RecordingContext(this, w, h, owner); }
  /** Pixels RGBA (Uint8Array w*h*4) de l'enregistreur racine. */
  render(root, w, h, bg = 0xfbfaf7ff) { return this.raster.render(this, root.ops, root.used, w, h, bg); }
}

class Gradient {
  constructor(ctx, id) { this.ctx = ctx; this.id = id; }
  addColorStop(o, c) { this.ctx.ops.push(OP.gradStop, this.id, +o, this.ctx.f.str(c)); }
}

export class RecordingContext {
  constructor(frame, w, h, owner = null) {
    this.f = frame; this.ops = []; this.canvas = owner || { width: w, height: h };
    this.m = [1, 0, 0, 1, 0, 0]; this.stack = []; this.dash = []; this.used = new Map();
    this._s = { fillStyle: "#000000", strokeStyle: "#000000", lineWidth: 1, globalAlpha: 1, font: "10px sans-serif", textAlign: "start", textBaseline: "alphabetic", lineCap: "butt", lineJoin: "miter",
      imageSmoothingEnabled: true, filter: "none", globalCompositeOperation: "source-over", shadowBlur: 0, miterLimit: 10, lineDashOffset: 0 };
  }
  /** Nouvelle image : le flux repart de zéro mais l'état courant (couleurs, police…) est réémis, comme un vrai canvas qui le garde. */
  reset() {
    this.ops = []; this.m = [1, 0, 0, 1, 0, 0]; this.stack = []; this.used = new Map();
    const s = this._s, o = this.ops;
    if (typeof s.fillStyle === "string") o.push(OP.fillColor, this.f.str(s.fillStyle));
    if (typeof s.strokeStyle === "string") o.push(OP.strokeColor, this.f.str(s.strokeStyle));
    o.push(OP.lineWidth, s.lineWidth, OP.alpha, s.globalAlpha, OP.font, this.f.str(s.font), OP.align, ALIGN[s.textAlign], OP.baseline, BASE[s.textBaseline], OP.cap, CAP[s.lineCap], OP.join, JOIN[s.lineJoin], OP.dash, this.dash.length, ...this.dash);
  }
  get fillStyle() { return this._s.fillStyle; }
  set fillStyle(v) { if (typeof v === "string") this.ops.push(OP.fillColor, this.f.str(v)); else if (v instanceof Gradient) this.ops.push(OP.fillGrad, v.id); else return; this._s.fillStyle = v; }
  get strokeStyle() { return this._s.strokeStyle; }
  set strokeStyle(v) { if (typeof v === "string") this.ops.push(OP.strokeColor, this.f.str(v)); else if (v instanceof Gradient) this.ops.push(OP.strokeGrad, v.id); else return; this._s.strokeStyle = v; }
  get lineWidth() { return this._s.lineWidth; }
  set lineWidth(v) { if (v > 0 && Number.isFinite(+v)) { this._s.lineWidth = +v; this.ops.push(OP.lineWidth, +v); } }
  get globalAlpha() { return this._s.globalAlpha; }
  set globalAlpha(v) { this._s.globalAlpha = +v; this.ops.push(OP.alpha, +v); }
  get font() { return this._s.font; }
  set font(v) { this._s.font = String(v); this.ops.push(OP.font, this.f.str(v)); }
  get textAlign() { return this._s.textAlign; }
  set textAlign(v) { if (v in ALIGN) { this._s.textAlign = v; this.ops.push(OP.align, ALIGN[v]); } }
  get textBaseline() { return this._s.textBaseline; }
  set textBaseline(v) { if (v in BASE) { this._s.textBaseline = v; this.ops.push(OP.baseline, BASE[v]); } }
  get lineCap() { return this._s.lineCap; }
  set lineCap(v) { if (v in CAP) { this._s.lineCap = v; this.ops.push(OP.cap, CAP[v]); } }
  get lineJoin() { return this._s.lineJoin; }
  set lineJoin(v) { if (v in JOIN) { this._s.lineJoin = v; this.ops.push(OP.join, JOIN[v]); } }
  // propriétés lues par certaines figures mais sans effet ici (pas de flou, de filtre ni de composition)
  get imageSmoothingEnabled() { return this._s.imageSmoothingEnabled; } set imageSmoothingEnabled(v) { this._s.imageSmoothingEnabled = v; }
  get filter() { return this._s.filter; } set filter(v) { this._s.filter = v; }
  get globalCompositeOperation() { return this._s.globalCompositeOperation; } set globalCompositeOperation(v) { this._s.globalCompositeOperation = v; }
  get shadowBlur() { return this._s.shadowBlur; } set shadowBlur(v) { this._s.shadowBlur = v; }
  get miterLimit() { return this._s.miterLimit; } set miterLimit(v) { this._s.miterLimit = v; }
  get lineDashOffset() { return this._s.lineDashOffset; } set lineDashOffset(v) { this._s.lineDashOffset = v; }

  save() { this.stack.push({ m: this.m.slice(), s: { ...this._s }, dash: this.dash }); this.ops.push(OP.save); }
  restore() { const t = this.stack.pop(); if (t) { this.m = t.m; this._s = t.s; this.dash = t.dash; } this.ops.push(OP.restore); }
  setTransform(a, b, c, d, e, f) { this.m = typeof a === "object" ? [a.a, a.b, a.c, a.d, a.e, a.f] : [a, b, c, d, e, f]; this.ops.push(OP.setTransform, ...this.m); }
  resetTransform() { this.m = [1, 0, 0, 1, 0, 0]; this.ops.push(OP.reset); }
  transform(a, b, c, d, e, f) { this.m = mul(this.m, [a, b, c, d, e, f]); this.ops.push(OP.transform, a, b, c, d, e, f); }
  translate(x, y) { this.m = mul(this.m, [1, 0, 0, 1, x, y]); this.ops.push(OP.translate, x, y); }
  scale(x, y) { this.m = mul(this.m, [x, 0, 0, y, 0, 0]); this.ops.push(OP.scale, x, y); }
  rotate(a) { const c = Math.cos(a), s = Math.sin(a); this.m = mul(this.m, [c, s, -s, c, 0, 0]); this.ops.push(OP.rotate, a); }
  getTransform() { const [a, b, c, d, e, f] = this.m; return { a, b, c, d, e, f }; }

  beginPath() { this.ops.push(OP.beginPath); }
  moveTo(x, y) { this.ops.push(OP.moveTo, x, y); }
  lineTo(x, y) { this.ops.push(OP.lineTo, x, y); }
  closePath() { this.ops.push(OP.closePath); }
  rect(x, y, w, h) { this.ops.push(OP.rect, x, y, w, h); }
  arc(x, y, r, a0, a1, ccw = false) { this.ops.push(OP.arc, x, y, r, a0, a1, ccw ? 1 : 0); }
  ellipse(x, y, rx, ry, rot, a0, a1, ccw = false) { this.ops.push(OP.ellipse, x, y, rx, ry, rot, a0, a1, ccw ? 1 : 0); }
  quadraticCurveTo(a, b, x, y) { this.ops.push(OP.quad, a, b, x, y); }
  bezierCurveTo(a, b, c, d, x, y) { this.ops.push(OP.bezier, a, b, c, d, x, y); }
  roundRect(x, y, w, h, r = 0) {
    const R = Math.max(0, Math.min(Array.isArray(r) ? r[0] : r, Math.abs(w) / 2, Math.abs(h) / 2)), H = Math.PI / 2;
    this.moveTo(x + R, y); this.lineTo(x + w - R, y); this.arc(x + w - R, y + R, R, -H, 0);
    this.lineTo(x + w, y + h - R); this.arc(x + w - R, y + h - R, R, 0, H);
    this.lineTo(x + R, y + h); this.arc(x + R, y + h - R, R, H, 2 * H);
    this.lineTo(x, y + R); this.arc(x + R, y + R, R, 2 * H, 3 * H); this.closePath();
  }
  fill() { this.ops.push(OP.fill); }
  stroke() { this.ops.push(OP.stroke); }
  clip() { this.ops.push(OP.clip); }
  fillRect(x, y, w, h) { this.ops.push(OP.fillRect, x, y, w, h); }
  strokeRect(x, y, w, h) { this.ops.push(OP.strokeRect, x, y, w, h); }
  clearRect(x, y, w, h) { this.ops.push(OP.clearRect, x, y, w, h); }
  setLineDash(a) { this.dash = (a || []).map(Number); this.ops.push(OP.dash, this.dash.length, ...this.dash); }
  getLineDash() { return this.dash.slice(); }
  fillText(s, x, y, maxW) { this.ops.push(OP.fillText, this.f.str(s), x, y, maxW || 0); }
  strokeText(s, x, y, maxW) { this.ops.push(OP.strokeText, this.f.str(s), x, y, maxW || 0); }
  measureText(s) {
    const px = parseFloat(/(\d+(\.\d+)?)px/.exec(this._s.font)?.[1] || 10);
    return { width: this.f.raster.measure(this._s.font, String(s)), actualBoundingBoxAscent: px * 0.75, actualBoundingBoxDescent: px * 0.2, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 0 };
  }
  createLinearGradient(x0, y0, x1, y1) { const id = this.f.nGrad++; this.ops.push(OP.gradLinear, id, x0, y0, x1, y1); return new Gradient(this, id); }
  createRadialGradient(x0, y0, r0, x1, y1, r1) { const id = this.f.nGrad++; this.ops.push(OP.gradRadial, id, x0, y0, r0, x1, y1, r1); return new Gradient(this, id); }
  createPattern() { return null; }
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  putImageData(im) { this.canvas._img = im; }
  getImageData(x, y, w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  /** drawImage(im, dx, dy[, dw, dh]) ou (im, sx, sy, sw, sh, dx, dy, dw, dh) ; im = un canvas enregistré (`_rec`), un canvas hors écran (`_img`). */
  drawImage(im, ...a) {
    const sw0 = im._rec ? im.width : im._img?.width ?? im.naturalWidth, sh0 = im._rec ? im.height : im._img?.height ?? im.naturalHeight;
    if (!sw0 || !sh0) return;
    let sx = 0, sy = 0, sw = sw0, sh = sh0, dx, dy, dw, dh;
    if (a.length >= 8) [sx, sy, sw, sh, dx, dy, dw, dh] = a; else [dx, dy, dw = sw0, dh = sh0] = a;
    if (im._rec) {   // une figure enregistrée : ses ordres sont recopiés ici, dans un repère placé et recadré
      const o = this.ops;   // le canvas source est dessiné sur SA couche (fond transparent) puis posé ici : son clearRect n'efface pas la carte
      o.push(OP.save, OP.translate, dx, dy, OP.scale, dw / sw, dh / sh, OP.translate, -sx, -sy, OP.beginPath, OP.rect, sx, sy, sw, sh, OP.clip, OP.layer, im.width, im.height);
      for (const v of im._rec.ops) o.push(v);   // pas de spread : un flux peut dépasser la limite d'arguments
      for (const [k, v] of im._rec.used) this.used.set(k, v);
      o.push(OP.endLayer, OP.restore); return;
    }
    if (!im._img) return;
    let id = this.f.imgId.get(im._img);
    if (id === undefined) { id = this.f.nImg++; this.f.imgId.set(im._img, id); }
    this.used.set(id, im._img);
    this.ops.push(OP.drawImage, id, sx, sy, sw, sh, dx, dy, dw, dh);
  }
}
