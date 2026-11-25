// Pont JS <-> wasm Rust (raster/) : charge le module et lui passe le flux d'ordres d'une image
// (core/ctx-record.js). Interface C simple, sans wasm-bindgen : même .wasm pour la page, Node et Go.
const enc = new TextEncoder();

/** @param {BufferSource|Response|Promise<Response>} src octets du .wasm (Node) ou réponse de fetch (page) */
export async function loadRaster(src) {
  const inst = (src instanceof ArrayBuffer || ArrayBuffer.isView(src))
    ? (await WebAssembly.instantiate(src, {})).instance
    : (await WebAssembly.instantiateStreaming(src, {})).instance;
  const x = inst.exports;
  const put = (bytes) => {   // copie dans la mémoire wasm (re-lue à chaque fois : elle peut avoir grandi)
    const p = x.alloc(bytes.byteLength || 8);
    new Uint8Array(x.memory.buffer, p, bytes.byteLength).set(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
    return p;
  };
  const widths = new Map();
  return {
    /** measureText().width de `text` dans la police CSS `font` (mis en cache : les figures remesurent les mêmes textes). */
    measure(font, text) {
      const k = font + "\0" + text; let w = widths.get(k);
      if (w === undefined) {
        const f = enc.encode(font), t = enc.encode(text), pf = put(f), pt = put(t);
        w = x.measure(pf, f.length, pt, t.length); x.dealloc(pf, f.length || 8); x.dealloc(pt, t.length || 8);
        if (widths.size > 20000) widths.clear(); widths.set(k, w);
      }
      return w;
    },
    /** Pixels RGBA (Uint8Array w*h*4, copie) du flux `ops` ; frame = la table de chaînes, `used` = Map(numéro → ImageData) des images dessinées. */
    render(frame, ops, used, w, h, bg = 0xfbfaf7ff) {
      const o = Float64Array.from(ops);
      const parts = frame.strs.map((s) => enc.encode(s));
      const sb = new Uint8Array(parts.reduce((n, b) => n + 4 + b.length, 0));
      let i = 0; const dv = new DataView(sb.buffer);
      for (const b of parts) { dv.setUint32(i, b.length, true); sb.set(b, i + 4); i += 4 + b.length; }
      const ims = [...used.entries()], tab = new Float64Array(ims.length * 4), ib = new Uint8Array(ims.reduce((n, [, im]) => n + im.width * im.height * 4, 0));
      i = 0; ims.forEach(([id, im], k) => { tab.set([id, im.width, im.height, i], k * 4); ib.set(im.data, i); i += im.width * im.height * 4; });
      const po = put(o), ps = put(sb), pi = put(ib), pt = put(tab);
      const p = x.render(po, o.length, ps, sb.length, pi, ib.length, pt, ims.length, w, h, bg >>> 0);
      const out = p ? new Uint8Array(x.memory.buffer, p, w * h * 4).slice() : null;
      x.dealloc(po, o.byteLength || 8); x.dealloc(ps, sb.length || 8); x.dealloc(pi, ib.length || 8); x.dealloc(pt, tab.byteLength || 8);
      if (!out) throw new Error("raster: render failed");
      return out;
    },
  };
}
