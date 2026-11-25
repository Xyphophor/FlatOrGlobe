// Formules TeX peintes sur un canvas (2026-10-17, propriétaire : « toutes les animations qui expliquent une formule doivent être
// accompagnées de ladite formule dans la carte »). Le TeX passe par texToMathML (le même moteur que la page), puis cette mise en
// page en boîtes : fractions empilées, racines avec leur barre, indices et exposants, accents, couleurs \g{} \f{} de la page
// (palette claire des figures, figColor). Sans police mathématique garantie : la police serif du système, en italique pour les
// variables d'une lettre, comme la page sans MathML.
import { texToMathML } from "./tex-mathml.js";
import { figColor } from "./theme.js";

const SERIF = '"STIX Two Math", "Latin Modern Math", "Cambria Math", "DejaVu Serif", "Times New Roman", serif';
const SPACE_OP = { "=": 0.28, "≈": 0.28, "≡": 0.28, "⇒": 0.28, "⇔": 0.28, "→": 0.28, "<": 0.28, ">": 0.28, "∝": 0.28, "≤": 0.28, "≥": 0.28,
  "+": 0.22, "−": 0.22, "±": 0.22, "×": 0.22, "⋅": 0.16, "/": 0.06, ",": 0 };
const color = (c) => { if (!c) return null; const m = /^var\((--[\w-]+)\)$/.exec(c); return m ? figColor(m[1], "#151a21") : c; };
const kids = (n) => [...n.childNodes].filter((k) => k.nodeType === 1);

/** Boîte {w, a (au-dessus de la ligne de base), d (en dessous), paint(ctx, x, y)} d'un nœud MathML à la taille fs. */
function box(node, ctx, st) {
  const fs = st.fs, t = node.nodeName.toLowerCase(), K = kids(node), txt = node.textContent || "";
  const glyphs = (s, it, extraL = 0, extraR = 0) => {
    const font = `${st.bold ? "700 " : ""}${it ? "italic " : ""}${fs}px ${SERIF}`;
    ctx.font = font; const w = ctx.measureText(s).width;
    return { w: w + (extraL + extraR) * fs, a: fs * 0.74, d: fs * 0.24,
      paint(c, x, y) { c.font = font; c.fillStyle = st.fill; c.textBaseline = "alphabetic"; c.fillText(s, x + extraL * fs, y); } };
  };
  const row = (list, s2 = st) => {
    const bs = list.map((k) => box(k, ctx, s2));
    // les délimiteurs s'étirent à la hauteur de ce qu'ils entourent : ( et ) appariés ; un délimiteur seul, à la rangée
    const OPEN = "([{", CLOSE = ")]}", span = (i, j) => { const In = bs.slice(i, j).filter((b) => !b.fence); return [Math.max(0, ...In.map((b) => b.a)), Math.max(0, ...In.map((b) => b.d))]; };
    const stack = [], done = new Set();
    bs.forEach((b, i) => {
      if (!b.fence) return;
      if (OPEN.includes(b.ch)) stack.push(i);
      else if (CLOSE.includes(b.ch) && stack.length) { const o = stack.pop(), [A, D] = span(o + 1, i); bs[o].stretch(A, D); b.stretch(A, D); done.add(o); done.add(i); }
    });
    bs.forEach((b, i) => { if (b.fence && !done.has(i)) { const [A, D] = span(0, bs.length); b.stretch(A, D); } });
    return { w: bs.reduce((s, b) => s + b.w, 0), a: Math.max(fs * 0.5, ...bs.map((b) => b.a)), d: Math.max(fs * 0.1, ...bs.map((b) => b.d)),
      paint(c, x, y) { for (const b of bs) { b.paint(c, x, y); x += b.w; } } };
  };
  const smaller = (k = 0.72) => ({ ...st, fs: fs * k });
  switch (t) {
    case "math": case "mrow": case "semantics": case "mpadded": return row(K);
    case "mstyle": {
      const s2 = { ...st };
      if (/font-weight:\s*700/.test(node.getAttribute("style") || "")) s2.bold = true;
      if (node.getAttribute("mathcolor")) s2.fill = color(node.getAttribute("mathcolor"));
      return row(K, s2);
    }
    case "mi": {
      // un nom de fonction (sin, cos, atan2…) : un peu d'air devant, comme le fait MathML
      const fn = txt.length > 1 && /^[a-z]+\d?$/.test(txt) && node.getAttribute("mathvariant") !== "normal";
      return glyphs(txt, txt.length === 1 && /[A-Za-zα-ωϑφ]/.test(txt) && node.getAttribute("mathvariant") !== "normal", fn ? 0.17 : 0, 0);
    }
    case "mn": case "mtext": return glyphs(txt, false);
    case "mspace": { const w = parseFloat(node.getAttribute("width") || 0) * fs; return { w, a: 0, d: 0, paint() {} }; }
    case "mo": {
      if (txt === "⁡") return { w: 0.11 * fs, a: 0, d: 0, paint() {} };
      const sp = SPACE_OP[txt] ?? 0, l = node.getAttribute("lspace") !== null ? 0 : sp, r = node.getAttribute("rspace") !== null ? 0 : (txt === "," ? 0.15 : sp);
      const g = glyphs(txt, false, l, r);
      if (node.getAttribute("stretchy") === "true" && "()[]|{}".includes(txt)) {
        g.fence = true; g.ch = txt;
        g.stretch = (A, D) => {
          const k = Math.max(1, (A + D) / (fs * 0.98)); if (k === 1) return;
          const p0 = g.paint, mid = (A - D) / 2;   // centré sur le milieu de la rangée
          g.a = Math.max(g.a, A + fs * 0.04); g.d = Math.max(g.d, D + fs * 0.04); g.w *= 1 + (k - 1) * 0.15;
          g.paint = (c, x, y) => { c.save(); c.translate(x, y - mid); c.scale(1 + (k - 1) * 0.15, k); p0(c, 0, fs * 0.25); c.restore(); };
        };
      }
      return g;
    }
    case "mfrac": {
      const s2 = st.frac ? smaller(0.85) : { ...st, frac: true };
      const n = box(K[0], ctx, s2), dn = box(K[1], ctx, s2), w = Math.max(n.w, dn.w) + fs * 0.3, axis = fs * 0.3, gap = fs * 0.14;
      return { w: w + fs * 0.1, a: axis + gap + n.d + n.a, d: Math.max(0, gap + dn.a + dn.d - axis),
        paint(c, x, y) {
          n.paint(c, x + fs * 0.05 + (w - n.w) / 2, y - axis - gap - n.d);
          dn.paint(c, x + fs * 0.05 + (w - dn.w) / 2, y - axis + gap + dn.a);
          c.fillStyle = st.fill; c.fillRect(x + fs * 0.05, y - axis - fs * 0.03, w, Math.max(1, fs * 0.055));
        } };
    }
    case "msqrt": case "mroot": {
      const b = row(t === "mroot" ? [K[0]] : K), ix = t === "mroot" ? box(K[1], ctx, smaller(0.55)) : null, sw = fs * 0.55, pad = fs * 0.12;
      const a = b.a + pad + fs * 0.06, lx = ix ? Math.max(0, ix.w - sw * 0.45) : 0;
      return { w: lx + sw + b.w + fs * 0.1, a: a + fs * 0.04, d: b.d + fs * 0.04,
        paint(c, x, y) {
          const x0 = x + lx;
          c.strokeStyle = st.fill; c.lineWidth = Math.max(1, fs * 0.06); c.lineJoin = "round";
          c.beginPath(); c.moveTo(x0, y - b.a * 0.35); c.lineTo(x0 + sw * 0.3, y - b.a * 0.5); c.lineTo(x0 + sw * 0.6, y + b.d); c.lineTo(x0 + sw, y - a); c.lineTo(x0 + sw + b.w + fs * 0.08, y - a); c.stroke();
          if (ix) ix.paint(c, x, y - b.a * 0.55);
          b.paint(c, x0 + sw, y);
        } };
    }
    case "msub": case "msup": case "msubsup": {
      const base = box(K[0], ctx, st), s2 = smaller(), sub = t !== "msup" ? box(K[1], ctx, s2) : null, sup = t === "msup" ? box(K[1], ctx, s2) : t === "msubsup" ? box(K[2], ctx, s2) : null;
      const up = Math.max(fs * 0.4, base.a - s2.fs * 0.45), dn = Math.max(fs * 0.22, base.d * 0.6);
      const w = base.w + Math.max(sub?.w || 0, sup?.w || 0) + fs * 0.04;
      return { w, a: Math.max(base.a, sup ? up + sup.a : 0), d: Math.max(base.d, sub ? dn + sub.d : 0),
        paint(c, x, y) { base.paint(c, x, y); if (sup) sup.paint(c, x + base.w + fs * 0.02, y - up); if (sub) sub.paint(c, x + base.w + fs * 0.02, y + dn); } };
    }
    case "mover": case "munder": case "munderover": {
      const base = box(K[0], ctx, st), acc = node.getAttribute("accent") === "true";
      // \vec (2026-10-25, phys) : la flèche est centrée sur l'axe de son glyphe, pas en haut comme ˙ ¨ ¯ ^ -- plus petite et remontée
      const arrow = acc && t === "mover" && K[1]?.textContent === "→";
      const o = t !== "munder" ? box(t === "munderover" ? K[2] : K[1], ctx, acc && !arrow ? st : smaller()) : null, u = t !== "mover" ? box(K[1], ctx, smaller()) : null;
      const w = Math.max(base.w, o?.w || 0, u?.w || 0), oy = arrow ? base.a - fs * 0.02 : acc ? base.a - fs * 0.62 : base.a + fs * 0.08;
      return { w, a: base.a + (o ? (arrow ? fs * 0.32 : acc ? fs * 0.12 : o.a + o.d + fs * 0.08) : 0), d: base.d + (u ? u.a + u.d + fs * 0.08 : 0),
        paint(c, x, y) { base.paint(c, x + (w - base.w) / 2, y); if (o) o.paint(c, x + (w - o.w) / 2, y - oy - (acc ? 0 : o.d)); if (u) u.paint(c, x + (w - u.w) / 2, y + base.d + u.a + fs * 0.08); } };
    }
    default: return row(K);
  }
}

/** Mise en page d'une formule : {w, a, d, paint(ctx, x, yBase)} ; lève une erreur si le TeX n'est pas compris. */
export function texBox(ctx, tex, fs, fill = "#151a21") {
  // l'analyseur HTML du document (le navigateur comme linkedom en ont un ; DOMParser manque aux outils hors navigateur)
  const d = document.createElement("div"); d.innerHTML = texToMathML(tex, false);
  const root = d.firstElementChild; if (!root) throw new Error("bad MathML");
  return box(root, ctx, { fs, fill, bold: false, frac: false });
}

/** Repli sans TeX : le texte Unicode de la page, sur une ligne. */
export function plainBox(ctx, s, fs, fill = "#151a21") {
  const font = `${fs}px ${SERIF}`; ctx.font = font;
  return { w: ctx.measureText(s).width, a: fs * 0.74, d: fs * 0.24, paint(c, x, y) { c.font = font; c.fillStyle = fill; c.textBaseline = "alphabetic"; c.fillText(s, x, y); } };
}
