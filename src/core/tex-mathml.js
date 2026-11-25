/* ============================================================================
   TeX -> MathML, porté à l'identique du legacy (flat-or-globe-2.20.0.html,
   second <script>, v60). Pas de librairie, pas de CDN, pas de police web :
   c'est le moteur MathML du navigateur qui fait le rendu. Chaque span
   [data-tex] garde son ancien texte Unicode comme contenu -- on ne
   l'écrase que si MathML est disponible ET que la source parse. Toute
   commande inconnue lève une erreur et l'appelant garde le texte
   existant, donc une formule mal écrite dégrade proprement au lieu de
   produire une ligne vide.
   Affichage uniquement pour les formules en bloc (.formula .big) --
   les maths inline dans la prose taguée [data-i18n] ne passent jamais par
   ici : ajouter un élément y changerait le compte de nœuds texte et
   ferait retomber la traduction sur l'anglais.

   Voir tasks/epic07/UC02.org : l'audit TeX doit extraire SYM/OP/TIGHT/
   SPACE/FUNC et les cas du switch de CE fichier, jamais les dupliquer à
   la main -- c'est exactement l'incident qui a coûté la régression v126
   dans le legacy (voir CLAUDE.md).
   ========================================================================== */

/** Convertit une chaîne TeX (sous-ensemble supporté par cette page) en MathML. */
export function texToMathML(src, display) {
  const SYM = {
    alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε", zeta: "ζ", eta: "η",
    theta: "θ", vartheta: "ϑ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π",
    rho: "ρ", sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
    Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
  };
  const OP = {
    approx: "≈", equiv: "≡", neq: "≠", ne: "≠", leq: "≤", le: "≤", geq: "≥", ge: "≥", ll: "≪", gg: "≫",
    sim: "∼", propto: "∝", gt: ">", lt: "<", times: "×", cdot: "⋅", div: "÷", pm: "±", mp: "∓",
    to: "→", rightarrow: "→", leftarrow: "←", Rightarrow: "⇒", implies: "⇒", Leftrightarrow: "⇔", iff: "⇔",
    leftrightarrow: "↔", partial: "∂", infty: "∞", in: "∈", cdots: "⋯", ldots: "…",
    langle: "⟨", rangle: "⟩", lvert: "|", rvert: "|",
    sum: "∑", oplus: "⊕", odot: "⊙",   // 2026-10-01 (epic15) : formules de méthode d'ecl
    int: "∫", nabla: "∇",   // 2026-10-25 : onglet phys (notations des dérivées)
    oint: "∮", perp: "⊥",   // 2026-10-27 : onglet rocket (somme des poussées, vitesse normale)
  };
  // marques postfixes : pas d'espace devant, elles collent au nombre
  const TIGHT = { deg: "°", arcmin: "′", arcsec: "″", prime: "′", dprime: "″", percent: "%" };
  const FUNC = ["arcsin", "arccos", "arctan", "arccot", "sinh", "cosh", "tanh",
    "sin", "cos", "tan", "cot", "sec", "csc", "log", "ln", "exp", "min", "max", "atan"];
  const SPACE = { ",": "0.167em", ":": "0.222em", ";": "0.278em", " ": "0.25em",
    quad: "1em", qquad: "2em" };
  const COLORS = { globe: "var(--globe)", flat: "var(--flat)", obj1: "var(--obj1)",
    obj2: "var(--obj2)", soft: "var(--ink-soft)" };

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  let i = 0;
  const s = src;
  const err = (m) => { throw new Error(m + " at " + i + " in: " + src); };

  const ws = () => { while (i < s.length && /\s/.test(s[i])) i++; };

  // lit un groupe {...}, ou un seul token, et renvoie son MathML
  function arg() {
    ws();
    if (s[i] === "{") {
      i++;
      const out = list("}");
      if (s[i] !== "}") err("unclosed {");
      i++;
      return out.length === 1 ? out[0] : "<mrow>" + out.join("") + "</mrow>";
    }
    // un argument sans accolades est UN caractère en TeX : \tfrac12 = ½, x^23 = x²3 (2026-10-17 : « 12 » au lieu de ½)
    if (/[0-9]/.test(s[i] || "")) return "<mn>" + s[i++] + "</mn>";
    const out = atom();
    if (out == null) err("missing argument");
    return out;
  }
  // lit un groupe {...} en texte brut (pour \text, \color)
  function rawArg() {
    ws();
    if (s[i] !== "{") err("expected {");
    i++;
    let d = 1, out = "";
    while (i < s.length && d > 0) {
      if (s[i] === "{") d++;
      else if (s[i] === "}") { d--; if (!d) { i++; return out; } }
      out += s[i++];
    }
    err("unclosed {");
  }
  function cmdName() {
    let n = "";
    while (i < s.length && /[A-Za-z]/.test(s[i])) n += s[i++];
    return n;
  }
  const fence = (d) => '<mo stretchy="true">' + esc(d) + "</mo>";

  function atom() {
    ws();
    if (i >= s.length) return null;
    const c = s[i];

    if (c === "}") return null;

    if (c === "\\") {
      i++;
      const one = s[i];
      if (one && !/[A-Za-z]/.test(one)) { // \, \; \{ \} \| \%
        i++;
        if (SPACE[one]) return '<mspace width="' + SPACE[one] + '"/>';
        if (one === "%") return '<mo lspace="0" rspace="0">%</mo>';
        if ("{}|".includes(one)) return "<mo>" + esc(one) + "</mo>";
        err("unknown \\" + one);
      }
      const n = cmdName();
      if (SYM[n]) return "<mi>" + SYM[n] + "</mi>";
      if (OP[n]) return "<mo>" + OP[n] + "</mo>";
      if (TIGHT[n]) return '<mo lspace="0" rspace="0">' + TIGHT[n] + "</mo>";
      if (SPACE[n]) return '<mspace width="' + SPACE[n] + '"/>';
      if (FUNC.includes(n)) return "<mi>" + n + '</mi><mo lspace="0.11em" rspace="0">&#x2061;</mo>';
      switch (n) {
        case "frac": case "dfrac": case "tfrac": { const a = arg(), b = arg(); return "<mfrac>" + a + b + "</mfrac>"; }
        // accents (2026-10-01, epic15 : ρ̄ de grav)
        case "bar": case "overline": { const a = arg(); return '<mover accent="true">' + a + '<mo>¯</mo></mover>'; }
        case "hat": { const a = arg(); return '<mover accent="true">' + a + '<mo>^</mo></mover>'; }
        // dérivée par rapport au temps (2026-10-16 : θ̇ de Kepler, onglet orb)
        case "dot": { const a = arg(); return '<mover accent="true">' + a + '<mo>˙</mo></mover>'; }
        case "ddot": { const a = arg(); return '<mover accent="true">' + a + '<mo>¨</mo></mover>'; }
        case "lim": return "<mi>lim</mi>";   // sans l'application de fonction : l'indice _{Δt→0} s'y accroche
        case "vec": { const a = arg(); return '<mover accent="true">' + a + '<mo>→</mo></mover>'; }   // 2026-10-25 : onglet phys
        case "sqrt": {
          ws();
          if (s[i] === "[") {
            i++;
            const idx = list("]");
            i++;
            return "<mroot>" + arg() + "<mrow>" + idx.join("") + "</mrow></mroot>";
          }
          return "<msqrt>" + arg() + "</msqrt>";
        }
        case "text": return "<mtext>" + esc(rawArg()).replace(/ /g, " ") + "</mtext>";
        case "mathbf": { const t = rawArg(); return '<mi mathvariant="bold">' + esc(t) + "</mi>"; }
        case "mathrm": return '<mi mathvariant="normal">' + esc(rawArg()) + "</mi>";
        case "operatorname": return "<mi>" + esc(rawArg()) + "</mi>";
        case "color": {
          const k = rawArg(), body = arg();
          if (!COLORS[k]) err("unknown colour " + k);
          return '<mstyle mathcolor="' + COLORS[k] + '">' + body + "</mstyle>";
        }
        // sémantique de la page : \g{} emphase globe, \f{} emphase plan, \soft{} aparté
        case "g": return '<mstyle mathcolor="var(--globe)" style="font-weight:700">' + arg() + "</mstyle>";
        case "f": return '<mstyle mathcolor="var(--flat)" style="font-weight:700">' + arg() + "</mstyle>";
        case "soft": return '<mstyle mathcolor="var(--ink-soft)">' + arg() + "</mstyle>";
        case "bold": return '<mstyle style="font-weight:700">' + arg() + "</mstyle>";
        case "left": {
          const d = s[i++];
          const inner = list("\\right");
          if (s.slice(i, i + 6) !== "\\right") err("missing \\right");
          i += 6;
          const e = s[i++];
          return "<mrow>" + (d === "." ? "" : fence(d)) + inner.join("") +
            (e === "." ? "" : fence(e)) + "</mrow>";
        }
        case "right": err("stray \\right");
      }
      err("unknown command \\" + n);
    }

    if (/[0-9]/.test(c)) { // nombre, en gardant les séparateurs , .
      let t = "";
      while (i < s.length && /[0-9.,]/.test(s[i])) {
        if (s[i] === "," && !/[0-9]/.test(s[i + 1] || "")) break;
        t += s[i++];
      }
      return "<mn>" + t + "</mn>";
    }
    // Lettres latines, accentuées comprises (ex. "û" dans l'onglet star).
    if (/[A-Za-zÀ-ɏ]/.test(c)) { i++; return "<mi>" + c + "</mi>"; }
    if ("°′″".includes(c)) { i++; return '<mo lspace="0" rspace="0">' + c + "</mo>"; }
    if ("()[]".includes(c)) { i++; return fence(c); }
    if (c === "|") { i++; return fence("|"); }
    if (/[+\-*=<>/!,;:.·×⋅≈≡→⇒⇔±]/.test(c)) {
      i++;
      const m = { "-": "−", "*": "⋅" };
      return "<mo>" + esc(m[c] || c) + "</mo>";
    }
    err("unexpected character '" + c + "'");
  }

  function list(stop) {
    const out = [];
    for (;;) {
      ws();
      if (i >= s.length) break;
      if (stop === "}" && s[i] === "}") break;
      if (stop === "]" && s[i] === "]") break;
      if (stop === "\\right" && s.slice(i, i + 6) === "\\right") break;
      if (s[i] === "_" || s[i] === "^") {
        const sup = s[i] === "^";
        i++;
        const scr = arg();
        const base = out.pop() || "<mrow/>";
        // second exposant/indice sur la même base -> msubsup
        const m = /^<msub>([\s\S]*)<\/msub>$/.exec(base);
        if (sup && m) { out.push("<msubsup>" + m[1] + scr + "</msubsup>"); continue; }
        out.push((sup ? "<msup>" : "<msub>") + base + scr + (sup ? "</msup>" : "</msub>"));
        continue;
      }
      const a = atom();
      if (a == null) break;
      out.push(a);
    }
    return out;
  }

  const body = list(null).join("");
  if (i < s.length) err("trailing input");
  return '<math xmlns="http://www.w3.org/1998/Math/MathML"' +
    (display ? ' display="block"' : "") + "><mrow>" + body + "</mrow></math>";
}

/* ---- Libellés de figure SVG : même TeX, composé en <tspan> natifs --------
   Les coordonnées des figures ont été calées par un générateur qui n'existe
   plus, donc rien ici ne déplace un glyphe : chaque <text> tagué garde son
   x/y/anchor et seul son CONTENU est reconstruit. Les fractions restent en
   ligne (a/b) -- les empiler demanderait une hauteur que ces libellés n'ont
   pas. Un garde-fou de largeur par figure revient à la version précédente
   si un libellé grossit, parce qu'une figure moitié dans une police et
   moitié dans une autre est pire qu'une figure inchangée. */

/** Doit survivre à une console dégradée (certains clients mail/preview
 * n'exposent que .log, ou rien de callable). Seul canal utilisé ; ne lève
 * jamais. La version machine-lisible reste sur window.__texReport. */
export function say(m) {
  try {
    const c = window.console;
    if (c && typeof c.info === "function") c.info(m);
    else if (c && typeof c.log === "function") c.log(m);
  } catch (e) { /* noop */ }
}

export const TEX_REPORT = {
  mathml: null, formulas: 0, formulaErrors: 0, figures: 0,
  figuresReverted: [], figuresMono: [], labels: [],
};

const SVG_MATHFONT = '"Latin Modern Math","STIX Two Math","Cambria Math",' +
  '"DejaVu Math TeX Gyre",math,serif';
const SVG_TOL = 1.06; // un libellé mesuré peut grossir de 6% ...
const SVG_SLACK = 2.5; // ...plus 2.5 px de marge absolue
const SVG_MINLEN = 4; // les libellés plus courts sont exemptés -- voir renderSvgMath

function svgMathRuns(node, st, out) {
  const t = node.nodeName;
  const kids = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].nodeType === 1) kids.push(node.childNodes[i]);
  }
  const txt = node.textContent || "";

  const push = (s, o) => {
    if (s === "") return;
    out.push({ t: s, it: !!o.it, bold: st.bold, fill: st.fill, shift: st.shift, size: st.size, dx: o.dx || 0 });
  };
  const each = (list, s2) => { for (let j = 0; j < list.length; j++) svgMathRuns(list[j], s2, out); };
  const span = (list, s2) => { // entoure de parenthèses si non atomique
    if (list.length === 1 && /^m[ino]$|^mtext$/.test(list[0].nodeName)) { each(list, s2); return; }
    push("(", {}); each(list, s2); push(")", {});
  };

  switch (t) {
    case "math": case "mrow": case "semantics": each(kids, st); return;
    case "mi": push(txt, { it: txt.length === 1 && /[A-Za-zα-ωϑφ]/.test(txt) }); return;
    case "mn": push(txt, {}); return;
    case "mtext": push(txt, {}); return;
    case "mspace":
      out.push({ t: "", dx: parseFloat(node.getAttribute("width") || 0), shift: st.shift,
        size: st.size, fill: st.fill, bold: st.bold, em: true });
      return;
    case "mo": {
      if (txt === "⁡") {
        out.push({ t: "", dx: 0.11, em: true, shift: st.shift, size: st.size, fill: st.fill, bold: st.bold });
        return;
      }
      const L = { "=": 0.28, "≈": 0.28, "≡": 0.28, "⇒": 0.28, "⇔": 0.28, "→": 0.28, "<": 0.28, ">": 0.28,
        "+": 0.22, "−": 0.22, "±": 0.22, "×": 0.22, "⋅": 0.16, "/": 0.06 };
      const ls = node.getAttribute("lspace") !== null ? 0 : (L[txt] || 0);
      out.push({ t: txt, dx: ls, em: true, shift: st.shift, size: st.size, fill: st.fill, bold: st.bold });
      const rs = node.getAttribute("rspace") !== null ? 0 : (L[txt] || (txt === "," ? 0.15 : 0));
      if (rs) out.push({ t: "", dx: rs, em: true, shift: st.shift, size: st.size, fill: st.fill, bold: st.bold });
      return;
    }
    case "mfrac": span([kids[0]], st); push("/", { dx: 0.06 }); span([kids[1]], st); return;
    case "msqrt": push("√", {}); span(kids, st); return;
    case "mroot": push("√", {}); span([kids[0]], st); return;
    case "msub": case "msup": case "msubsup": {
      svgMathRuns(kids[0], st, out);
      const mk = (k, up) => {
        svgMathRuns(k, { bold: st.bold, fill: st.fill, size: st.size * 0.72,
          shift: st.shift + (up ? -0.42 : 0.30) * st.size }, out);
      };
      if (t === "msub") mk(kids[1], false);
      else if (t === "msup") mk(kids[1], true);
      else { mk(kids[1], false); mk(kids[2], true); }
      return;
    }
    case "mstyle": {
      const s2 = { bold: st.bold, fill: st.fill, size: st.size, shift: st.shift };
      if (/font-weight:\s*700/.test(node.getAttribute("style") || "")) s2.bold = true;
      if (node.getAttribute("mathcolor")) s2.fill = node.getAttribute("mathcolor");
      each(kids, s2);
      return;
    }
    default: each(kids, st); return;
  }
}

/**
 * Une formule TeX en suite de morceaux à peindre sur un canvas (cartes d'export, 2026-10-17) :
 * [{t, it, bold, fill, shift, size, dx, em}] comme pour les libellés SVG (fractions à plat a/b,
 * indices et exposants décalés). Lève une erreur si le TeX n'est pas compris.
 */
export function texRuns(tex) {
  const xml = new DOMParser().parseFromString(texToMathML(tex, false), "application/xml");
  if (xml.getElementsByTagName("parsererror").length) throw new Error("bad MathML");
  const runs = [];
  svgMathRuns(xml.documentElement, { bold: false, fill: null, size: 1, shift: 0 }, runs);
  return runs;
}

function texIntoSvgText(el, tex, fs) {
  const xml = new DOMParser().parseFromString(texToMathML(tex, false), "application/xml");
  if (xml.getElementsByTagName("parsererror").length) throw new Error("bad MathML");
  const runs = [];
  svgMathRuns(xml.documentElement, { bold: false, fill: null, size: 1, shift: 0 }, runs);

  const NS = "http://www.w3.org/2000/svg";
  const frag = document.createDocumentFragment();
  let cur = 0, pend = 0;
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    pend += (r.em ? r.dx : r.dx) * fs;
    if (r.t === "") continue;
    const ts = document.createElementNS(NS, "tspan");
    ts.textContent = r.t;
    if (pend) { ts.setAttribute("dx", pend.toFixed(2)); pend = 0; }
    if (r.shift !== cur) { ts.setAttribute("dy", ((r.shift - cur) * fs).toFixed(2)); cur = r.shift; }
    if (r.size !== 1) ts.setAttribute("font-size", (r.size * fs).toFixed(2));
    if (r.it) ts.setAttribute("font-style", "italic");
    if (r.bold) ts.setAttribute("font-weight", "700");
    if (r.fill) ts.setAttribute("fill", r.fill);
    frag.appendChild(ts);
  }
  if (cur !== 0) { // retour à la ligne de base
    const z = document.createElementNS(NS, "tspan");
    z.setAttribute("dy", (-cur * fs).toFixed(2));
    z.textContent = "";
    frag.appendChild(z);
  }
  el.textContent = "";
  el.appendChild(frag);
}

// getComputedTextLength() somme les avances de glyphe et ignore l'espacement
// dx émis par ce moteur, donc sous-estimerait la nouvelle largeur. getBBox()
// est la vraie question de recouvrement.
function svgWidth(el) {
  if (el.getBBox) { const b = el.getBBox(); if (b && b.width) return b.width; }
  return el.getComputedTextLength();
}

function figName(svg) {
  return svg.getAttribute("aria-label") || svg.id || "(unlabelled)";
}

export function renderSvgMath(svg) {
  if (svg.getAttribute("data-mathdone")) return;
  const els = svg.querySelectorAll("text[data-tex]");
  if (!els.length) { svg.setAttribute("data-mathdone", "1"); return; }

  const saved = [];
  let el, w0;
  for (let j = 0; j < els.length; j++) {
    el = els[j];
    // Auto-guérison : si un <math> a déjà été écrit dans ce label SVG, on
    // remet le texte d'origine avant de mesurer, sinon le garde lit une
    // largeur nulle et abandonne pour de bon.
    if (el.querySelector("math") && el.getAttribute("data-tex-fallback")) {
      el.innerHTML = el.getAttribute("data-tex-fallback");
      el.removeAttribute("data-tex-fallback");
    }
    try { w0 = svgWidth(el); } catch (e) { return; }
    if (!w0) return; // figure pas encore mise en page -- réessayer plus tard
    saved.push({ el, html: el.innerHTML, w: w0,
      txt: (el.textContent || "").trim(),
      fs: parseFloat(getComputedStyle(el).fontSize) || 10 });
  }
  svg.setAttribute("data-mathdone", "1");

  const restore = () => {
    for (const item of saved) { item.el.innerHTML = item.html; item.el.style.fontFamily = ""; }
  };

  // Une passe pour une police donnée. Renvoie null si ok, sinon le libellé qui a grossi.
  const attempt = (font, mode) => {
    for (const item of saved) {
      try { texIntoSvgText(item.el, item.el.getAttribute("data-tex"), item.fs); }
      catch (e) { say("svg tex: " + e.message); return { txt: item.txt, reason: "parse" }; }
      item.el.style.fontFamily = font;
    }
    for (const item of saved) {
      let w1 = 0;
      try { w1 = svgWidth(item.el); } catch (e) { /* noop */ }
      // Seuls les libellés jugés sont enregistrés ; les exemptés (1-2 glyphes)
      // ne peuvent pas provoquer de retour arrière.
      if (item.txt.length >= SVG_MINLEN) {
        TEX_REPORT.labels.push({ fig: figName(svg), mode, txt: item.txt,
          before: +item.w.toFixed(1), after: +w1.toFixed(1) });
      }
      if (item.txt.length < SVG_MINLEN) continue;
      if (w1 > item.w * SVG_TOL + SVG_SLACK) {
        return { txt: item.txt, before: +item.w.toFixed(1), after: +w1.toFixed(1), reason: "width" };
      }
    }
    return null;
  };

  // Deux essais avant d'abandonner : "revenir au texte brut" perd aussi les
  // indices/exposants et l'italique. Le passage 2 garde la police monospace
  // d'origine de la figure, dont les avances ont servi à caler les
  // coordonnées -- sûr par construction, avec x_E, d_0, d^2 et italiques réels.
  let grew = attempt(SVG_MATHFONT, "math");
  if (grew) {
    restore();
    grew = attempt("", "mono");
    if (grew) {
      restore();
      TEX_REPORT.figuresReverted.push({ fig: figName(svg), grew });
      say('svg math reverted, figure left as plain text: "' + grew.txt + '"' +
        (grew.before ? " " + grew.before + " -> " + grew.after + " px" : "") +
        " [" + figName(svg) + "]");
    } else {
      TEX_REPORT.figuresMono.push(figName(svg));
      say("svg math set in the figure's own monospace (serif was too wide): [" + figName(svg) + "]");
    }
  }
}

export function renderAllSvgMath(root = document) {
  const f = root.querySelectorAll("svg");
  TEX_REPORT.figures = f.length;
  for (let i = 0; i < f.length; i++) {
    try { renderSvgMath(f[i]); } catch (e) { say("svg figure skipped: " + e.message); }
  }
}

/**
 * Convertit tout `span[data-tex]` et toute figure SVG SOUS `root`. Contrairement
 * au legacy (page statique entière au chargement), les onglets de cette
 * réécriture montent leur DOM à l'activation (tasks/epic01/UC03) -- chaque
 * module d'onglet doit donc appeler `renderTexIn(container)` à la fin de son
 * `mount()`, pour les formules qu'il vient d'injecter. `initTexPass()` reste
 * responsable de la passe initiale sur la coquille et du rattrapage des
 * figures SVG révélées après coup (largeur nulle tant qu'un panneau est
 * display:none).
 */
export function renderTexIn(root = document) {
  const ok = "MathMLElement" in window;
  // span[data-tex] et PAS les <text data-tex> des figures SVG : mettre du
  // innerHTML sur un <text> SVG parse dans le namespace SVG, où <math> ne
  // rend rien du tout (régression v62 du legacy).
  const spans = root.querySelectorAll("span[data-tex]");
  let bad = 0;
  for (const el of spans) {
    const tex = el.getAttribute("data-tex");
    if (!el.getAttribute("data-tex-fallback")) el.setAttribute("data-tex-fallback", el.innerHTML);
    if (!ok) continue;
    try { el.innerHTML = texToMathML(tex, false); }
    catch (e) { bad++; say("texToMathML: " + e.message); }
  }
  TEX_REPORT.mathml = ok;
  TEX_REPORT.formulas += spans.length;
  TEX_REPORT.formulaErrors += bad;
  if (!ok) say("No MathML support here: formulas left as Unicode text.");
  if (bad) say(bad + " formula(s) failed to parse and kept their fallback text.");
  renderAllSvgMath(root); // <text data-tex> est traité ici, et seulement ici
  return { ok, formulas: spans.length, bad };
}

/**
 * Initialise la passe TeX -> MathML : traite la coquille chargée au départ,
 * puis observe #tabpanels (subtree) pour rattraper toute figure SVG révélée
 * après coup par un changement de l'attribut `hidden` -- ce qui couvre aussi
 * les panneaux montés dynamiquement plus tard (un MutationObserver en mode
 * subtree observe les attributs des descendants futurs sans réenregistrement).
 * Port adapté de l'IIFE `renderTex` du legacy. Rien ici ne doit faire planter
 * le reste de la page : c'est de la présentation, jamais un chemin critique.
 * NOTE : le rattrapage des <details class="fold"> (utilisés par les onglets
 * sim/hh) n'est pas encore câblé ici -- à faire quand ces onglets seront
 * portés (epic02/UC01), voir tasks/epic02/UC01.org.
 */
export function initTexPass() {
  const run = () => {
    renderTexIn(document);
    if (window.MutationObserver) {
      const obs = new MutationObserver((ms) => {
        for (const m of ms) {
          if (m.target.nodeType === 1 && !m.target.hidden) {
            for (const svg of m.target.querySelectorAll("svg")) renderSvgMath(svg);
          }
        }
      });
      const panelsRoot = document.getElementById("tabpanels") || document.body;
      obs.observe(panelsRoot, { attributes: true, attributeFilter: ["hidden"], subtree: true });
    }
  };
  const guarded = () => {
    try { run(); } catch (e) { say("tex pass aborted: " + (e && e.message)); }
    try { window.__texReport = TEX_REPORT; } catch (e) { /* noop */ }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", guarded);
  else guarded();
}
