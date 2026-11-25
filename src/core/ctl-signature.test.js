import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { controlsSignature, cardControls, cardFileFig } from "./ctl-signature.js";

const page = (html) => parseHTML(`<html><body>${html}</body></html>`).document;
const card = { figs: ["cv"] };
const fig = (inner) => `<div class="fig"><canvas id="cv"></canvas>${inner}</div>`;

test("no controls, or only action buttons: empty signature (the video always serves)", () => {
  assert.equal(controlsSignature(card, page(fig(""))), "");
  assert.equal(controlsSignature(card, page(fig('<button id="p">pause</button>'))), "");
});
test("a preset button's state counts, its text does not", () => {
  const a = page(fig('<button id="m" aria-pressed="true">Fitted</button>')), b = page(fig('<button id="m" aria-pressed="false">Fitted</button>')), c = page(fig('<button id="m" aria-pressed="true">Autre texte</button>'));
  assert.notEqual(controlsSignature(card, a), "");
  assert.notEqual(controlsSignature(card, a), controlsSignature(card, b));
  assert.equal(controlsSignature(card, a), controlsSignature(card, c));
});
test("range, select and checkbox values change the signature; 50 and 50.0 are the same", () => {
  const r = (v) => page(fig(`<input type="range" id="r" value="${v}">`));
  assert.equal(controlsSignature(card, r("50")), controlsSignature(card, r("50.0")));
  assert.notEqual(controlsSignature(card, r("50")), controlsSignature(card, r("51")));
  const sel = (v) => page(fig(`<select id="s"><option value="a" ${v === "a" ? "selected" : ""}>A</option><option value="b" ${v === "b" ? "selected" : ""}>B</option></select>`));
  assert.notEqual(controlsSignature(card, sel("a")), controlsSignature(card, sel("b")));
  const ck = (on) => page(fig(`<input type="checkbox" id="c" ${on ? "checked" : ""}>`));
  assert.notEqual(controlsSignature(card, ck(true)), controlsSignature(card, ck(false)));
});
test("controls are looked for in the card's own figure blocks only", () => {
  const d = page(`${fig("")}<div class="fig"><canvas id="other"></canvas><input id="x" value="1"></div>`);
  assert.equal(cardControls(card, d).length, 0);
});
test("a card can name a control that lives outside its blocks (ctl); the chosen option goes into the file name", () => {
  const html = (v) => `<div class="preset-row"><select id="s"><option value="0" ${v === 0 ? "selected" : ""}>Gauss 1823 · 82.2 km sides</option><option value="1" ${v === 1 ? "selected" : ""}>Struve chain · 40 km sides</option></select></div>${fig("")}`;
  const c = { id: "tri", figs: ["cv"], ctl: ["s"] };
  assert.equal(cardControls(card, page(html(0))).length, 0);
  assert.equal(cardControls(c, page(html(0))).length, 1);
  assert.notEqual(controlsSignature(c, page(html(0))), controlsSignature(c, page(html(1))));
  assert.equal(cardFileFig(c, "card", page(html(1))), "tri-card-Struve chain");
  assert.equal(cardFileFig({ id: "x", figs: ["cv"] }, "mini", page(html(1))), "x-mini");
});
