// « code · données » (2026-11-25) : chaque section qu'un jeu de données nomme existe dans la page, et le panneau la décrit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { PROVENANCE } from "../data/provenance.js";
import { datasetsOf, provPanel } from "./provenance.js";

const filesOf = (d) => existsSync(d) ? readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? filesOf(p) : p.endsWith(".js") ? [p] : []; }) : [];
const textOf = (tab) => [...filesOf(`src/tabs/${tab}`), `src/data/prose/${tab}.js`].filter(existsSync).map((p) => readFileSync(p, "utf8")).join("\n");

test("every section named by a dataset is a section of its tab", () => {
  for (const [id, d] of Object.entries(PROVENANCE)) for (const s of d.sections) {
    const [tab, sec] = s.split("/");
    const txt = textOf(tab), q = sec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const found = new RegExp(`data-sec="${q}"|data-sec=\\\\"${q}\\\\"|k: "${q}"|"k": "${q}"|h2: "${q}"|"${q}-h2"|"${q}"`).test(txt);
    assert.ok(found, `${id}: ${s} not found`);
  }
});

test("the panel lists the data, the code and the generated files", () => {
  assert.ok(datasetsOf("sun", "romer-m-h2").some((d) => d.id === "sun-romer"));
  const h = provPanel("sun", "romer-m-h2", "fr");
  for (const s of ["data/sun/romer", "tools/internal/build/romer", "src/data/presets/sun-romer.js", "prov-pub-n"]) assert.ok(h.includes(s), s);
  assert.equal(provPanel("sun", "an-h2", "en"), "");
});

test("no unpublished contribution reaches the page", () => {
  const pub = JSON.parse(readFileSync("src/data/contrib/published.json", "utf8"));
  for (const [k, v] of Object.entries(pub)) if (!v) assert.ok(!PROVENANCE[`contrib-${k}`], k);
});
