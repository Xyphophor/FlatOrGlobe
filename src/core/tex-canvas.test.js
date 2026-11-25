// Formules des cartes (2026-10-17) : TeX → MathML → boîtes peintes sur un canvas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
const { document } = parseHTML("<html><body></body></html>");
globalThis.document = document;
const { texToMathML } = await import("./tex-mathml.js");
const { texBox } = await import("./tex-canvas.js");
// un contexte qui mesure 0,5 em par caractère et note ce qu'on lui fait écrire
const ctx = () => { const said = []; return { said, font: "10px serif", measureText(s) { return { width: s.length * 0.5 * parseFloat(/(\d+(\.\d+)?)px/.exec(this.font)[1]) }; },
  fillText(s, x, y) { said.push({ s, x, y }); }, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, save() {}, restore() {}, translate() {}, scale() {} }; };

test("un argument sans accolades est un seul chiffre : \\tfrac12 = 1 sur 2", () => {
  assert.match(texToMathML("\\tfrac12", false), /<mfrac><mn>1<\/mn><mn>2<\/mn><\/mfrac>/);
  assert.match(texToMathML("x^{23}", false), /<mn>23<\/mn>/);
});

test("une fraction s'empile : plus haute qu'une ligne, numérateur au-dessus du dénominateur", () => {
  const c = ctx(), line = texBox(c, "a + b", 20), frac = texBox(c, "\\frac{dT}{dt}", 20);
  assert.ok(frac.a + frac.d > 1.5 * (line.a + line.d));
  frac.paint(c, 0, 100);
  const T = c.said.find((x) => x.s === "T"), t = c.said.find((x) => x.s === "t");
  assert.ok(T.y < 100 && t.y > 100, `numérateur ${T.y}, dénominateur ${t.y}`);
});

test("indice plus bas et plus petit que la base ; TeX inconnu refusé", () => {
  const c = ctx(); texBox(c, "P_{\\text{in}}", 20).paint(c, 0, 50);
  const P = c.said.find((x) => x.s === "P"), sub = c.said.find((x) => x.s === "in");
  assert.ok(sub.y > P.y && sub.x > P.x);
  assert.throws(() => texBox(c, "\\nosuchcommand{x}", 20));
});
