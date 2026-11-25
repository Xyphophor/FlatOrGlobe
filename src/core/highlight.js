// Coloration syntaxique minimale (2026-10-16), sans dépendance : Python, C, Go et JavaScript, ce que le site montre en extraits
// (onglet rx). Un seul passage de gauche à droite : commentaires, chaînes, nombres, mots-clés, types et fonctions appelées.
// Rend du HTML (texte échappé) avec les classes tok-kw / tok-str / tok-com / tok-num / tok-fn / tok-type / tok-builtin, dont les
// couleurs viennent de theme.css (clair, sombre). Ce n'est pas un analyseur : une chaîne multiligne exotique ou une macro
// peut être mal colorée, jamais mal affichée (le texte reste celui du code).
const KW = {
  py: "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield",
  c: "auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while",
  go: "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var",
  js: "async await break case catch class const continue default delete do else export extends finally for from function if import in instanceof let new of return static super switch this throw try typeof var void while yield",
};
const TYPES = {
  py: "int float str bool list dict set tuple bytes complex object type",
  c: "void char short int long float double signed unsigned size_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t bool FILE",
  go: "bool byte rune string error int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 uintptr float32 float64 complex64 complex128 any",
  js: "Array Object Number String Boolean Map Set Promise Math JSON Date",
};
const BUILTIN = {
  py: "print range len sum min max abs zip enumerate map filter sorted reversed isinstance round open input math np self cls",
  c: "NULL printf fprintf sprintf snprintf scanf malloc calloc realloc free memcpy memset strlen M_PI EXIT_SUCCESS EXIT_FAILURE stdin stdout stderr",
  go: "true false nil iota make new len cap append copy delete panic recover print println fmt math os strings",
  js: "true false null undefined NaN Infinity console window document globalThis",
};
const set = (s) => new Set(s.split(" "));
const LANGS = Object.fromEntries(Object.keys(KW).map((l) => [l, { kw: set(KW[l]), type: set(TYPES[l]), builtin: set(BUILTIN[l]) }]));
const ALIAS = { python: "py", golang: "go", javascript: "js", mjs: "js", h: "c", cpp: "c" };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const span = (cls, s) => `<span class="tok-${cls}">${esc(s)}</span>`;

// ordre : commentaires, chaînes (les plus longues d'abord), directives C, nombres, identifiants
function rules(lang) {
  const line = lang === "py" ? "#[^\\n]*" : "//[^\\n]*";
  const block = lang === "py" ? null : "/\\*[\\s\\S]*?(?:\\*/|$)";
  const str = lang === "py" ? "[rRbBfFuU]{0,2}(?:\"\"\"[\\s\\S]*?(?:\"\"\"|$)|'''[\\s\\S]*?(?:'''|$)|\"(?:\\\\.|[^\"\\\\\\n])*\"?|'(?:\\\\.|[^'\\\\\\n])*'?)"
    : lang === "go" ? "`[^`]*`?|\"(?:\\\\.|[^\"\\\\\\n])*\"?|'(?:\\\\.|[^'\\\\\\n])*'?"
    : lang === "js" ? "`(?:\\\\.|[^`\\\\])*`?|\"(?:\\\\.|[^\"\\\\\\n])*\"?|'(?:\\\\.|[^'\\\\\\n])*'?"
    : "\"(?:\\\\.|[^\"\\\\\\n])*\"?|'(?:\\\\.|[^'\\\\\\n])*'?";
  const parts = [`(?<com>${[line, block].filter(Boolean).join("|")})`, `(?<str>${str})`];
  if (lang === "c") parts.push("(?<pre>^[ \\t]*#[ \\t]*[a-z]+)");
  parts.push("(?<num>\\b(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|\\d[\\d_]*(?:\\.\\d[\\d_]*)?(?:[eE][+-]?\\d+)?|\\.\\d+(?:[eE][+-]?\\d+)?)[fFlLuU]*\\b)", "(?<id>[A-Za-z_][A-Za-z_0-9]*)");
  return new RegExp(parts.join("|"), "gm");
}
const CACHE = {};

/** HTML coloré du code `src` écrit en `lang` (py, c, go, js ; autre : texte échappé tel quel). */
export function highlight(src, lang) {
  const l = ALIAS[String(lang).toLowerCase()] || String(lang).toLowerCase(), L = LANGS[l];
  src = String(src ?? "");
  if (!L) return esc(src);
  const re = (CACHE[l] ??= rules(l)); re.lastIndex = 0;
  let out = "", last = 0, m;
  while ((m = re.exec(src))) {
    if (m[0] === "") { re.lastIndex++; continue; }
    out += esc(src.slice(last, m.index)); last = m.index + m[0].length;
    const g = m.groups;
    if (g.com) out += span("com", m[0]);
    else if (g.str) out += span("str", m[0]);
    else if (g.pre) out += span("type", m[0]);
    else if (g.num) out += span("num", m[0]);
    else {
      const w = m[0];
      if (L.kw.has(w)) out += span("kw", w);
      else if (L.type.has(w)) out += span("type", w);
      else if (L.builtin.has(w)) out += span("builtin", w);
      else if (/^\s*\(/.test(src.slice(last, last + 8))) out += span("fn", w);   // identifiant suivi de « ( » : une fonction appelée ou définie
      else out += esc(w);
    }
  }
  return out + esc(src.slice(last));
}
