import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { CARD_TABS } from "../data/cards/index.js";
import { cardsForIds, cardText, figRef } from "./cards.js";
import { arrange } from "./export-card.js";
import { dictExtras } from "./i18n.js";

const LANGS = ["en", "fr", "es", "pt", "nl"];
const dicts = {};
for (const l of LANGS) {
  dicts[l] = {};
  for (const tab of Object.keys(CARD_TABS)) {
    const p = `src/i18n/${l}/${tab}-cards.json`;
    if (existsSync(p)) dicts[l][`${tab}-cards`] = JSON.parse(readFileSync(p, "utf8"));
  }
  // les cartes des contributions apportent leurs textes elles-mêmes (src/tabs/contrib/<clé>/i18n, core/i18n.js addDict)
  for (const [tab, obj] of Object.entries(dictExtras()[l] ?? {})) if (tab.endsWith("-cards")) dicts[l][tab] = { ...(dicts[l][tab] ?? {}), ...obj };
}
// tout le code et les données de src/, pour vérifier que les ids de figure existent
const srcText = (function all(d) {
  return readdirSync(d, { withFileTypes: true }).map((e) =>
    e.isDirectory() ? all(`${d}/${e.name}`) : /\.(js|json)$/.test(e.name) && !e.name.endsWith(".test.js") ? readFileSync(`${d}/${e.name}`, "utf8") : "").join("\n");
})("src");

// Cartes nouvelles pas encore traduites en es/pt/nl, à la demande du propriétaire
// (2026-10-01, epic15 : « pour l'instant que anglais/français ; on fera les autres
// langues avec Sonnet »). Retirer une entrée dès que sa traduction existe : le test
// redevient strict pour elle. en et fr restent toujours complets.
const PENDING = { rules: { langs: ["es", "pt", "nl"], ids: ["refr", "excl", "wmean"] }, persp: { langs: ["es", "pt", "nl"], ids: ["cubes", "lines", "sunset", "dip", "rays", "near", "anti", "zoom"] }, star: { langs: ["es", "pt", "nl"], ids: ["radec", "prec", "pm", "vis"] }, hh: { langs: ["es", "pt", "nl"], ids: ["bord"] }, avia: { langs: ["es", "pt", "nl"], ids: ["af1995", "bearings", "mesh", "fx-mesh"] }, map: { langs: ["es", "pt", "nl"], ids: ["small", "erat", "ptolemy", "mercator", "tissot", "ae", "centres", "gleason", "utm"] }, contrib: { langs: ["es", "pt", "nl"], ids: ["adl", "lom", "fd"] }, orb: { langs: ["es", "pt", "nl"], ids: ["kep", "fall", "cannon", "radar", "psr", "transit"] }, sat: { langs: ["es", "pt", "nl"], ids: ["pass", "ball", "radius", "kepler", "kepgm", "flat"] }, results: { langs: ["es", "pt", "nl"], ids: ["motion"] }, scale: { langs: ["es", "pt", "nl"], ids: ["clock", "zoom"] }, atmo: { langs: ["es", "pt", "nl"], ids: ["column", "radio", "heat", "rad", "tonga", "krakatoa"] }, seis: { langs: ["es", "pt", "nl"], ids: ["shadow", "mesh"] }, phys: { langs: ["es", "pt", "nl"], ids: ["angles", "kin", "vectors", "deriv", "galileo", "rotframe", "newton", "grav", "circ", "sidereal", "conserv", "kepler", "waves", "snell", "const", "sigma", "lsq", "sphere", "horizon", "forcetable", "pulleys", "kick", "isum", "frames", "magnetic", "ballistic", "demmesh"] }, aether: { langs: ["es", "pt", "nl"], ids: ["timeline", "maxwell", "aberr", "drag", "airy", "mm", "contract", "clock", "vadd", "gps", "sagnac", "bounds", "earth"] }, surv: { langs: ["es", "pt", "nl"], ids: ["tri", "angles"] }, rocket: { langs: ["es", "pt", "nl"], ids: ["box", "hole", "fill", "thrust", "air", "rs25", "joule", "free"] }, ref: { langs: ["es", "pt", "nl"], ids: ["layer", "caus", "zen", "zenhour", "igra", "beam", "laser"] }, cases: { langs: ["es", "pt", "nl"], ids: ["anim", "geom", "therm", "evenings"] }, grav: { langs: ["es", "pt", "nl"], ids: ["tide", "gauges", "tglobe", "seas"] }, sun: { langs: ["es", "pt", "nl"], ids: ["romerdata"] } };   // sun romerdata : 2026-11-25   // grav tide/gauges/tglobe/seas : 2026-11-14   // star radec/prec/pm/vis : 2026-11-11   // ref : 2026-10-31   // surv tri (texte qui suit le réseau) : 2026-10-28   // rocket : 2026-10-27   // aether : 2026-10-25   // phys : 2026-10-25   // seis shadow : 2026-10-25   // orb kep/fall : 2026-10-16   // onglets map et contrib, 2026-10-08 (lom : 2026-10-14)
const pending = (tab, l, key) => [].concat(PENDING[tab] ?? []).some((P) => P.langs.includes(l) && P.ids.includes(key.split(".")[0]));

// un texte de carte est lu HORS de la page : rien qui y renvoie
const PAGE_REF = /\b(see above|shown above|above this|below this|slider|this tab|this page|click|drag|scroll|the table|the simulator)\b/i;

for (const [tab, mod] of Object.entries(CARD_TABS)) {
  test(`cartes ${tab} : structure`, () => {
    const ids = mod.CARDS.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length, "ids uniques");
    for (const c of mod.CARDS) {
      assert.ok(c.figs.length, `${c.id} : au moins une figure`);
      for (const f of c.figs.map((r) => figRef(r).id)) assert.ok(srcText.includes(`id=\\"${f}\\"`) || srcText.includes(`id="${f}"`) || srcText.includes(`"${f}"`), `${c.id} : figure ${f} introuvable`);
      for (const s of c.src) assert.ok(mod.SOURCES[s], `${c.id} : source ${s} absente de SOURCES`);
    }
  });

  test(`cartes ${tab} : textes complets dans les ${LANGS.length} langues`, () => {
    const en = Object.keys(dicts.en[`${tab}-cards`] || {}).sort();
    for (const l of LANGS) {
      assert.deepEqual(Object.keys(dicts[l][`${tab}-cards`] || {}).sort(), en.filter((k) => !pending(tab, l, k)), `${l} : mêmes clés que l'anglais`);
      for (const c of mod.CARDS) {
        if (pending(tab, l, `${c.id}.`)) continue;
        const T = cardText(tab, c, l, dicts);
        for (const f of ["title", "mini", "text"]) assert.ok(T[f], `${l} ${c.id}.${f} vide`);
        assert.ok(T.mini.length <= 280, `${l} ${c.id}.mini : ${T.mini.length} caractères (> 280)`);
        assert.ok(T.mini.length < T.text.length, `${l} ${c.id} : mini plus court que la carte`);
        if (c.labels) assert.equal(T.labels.length, c.figs.length, `${l} ${c.id} : une étiquette par figure`);
        for (const f of ["title", "mini", "text", "verdict"]) {
          for (const m of T[f].matchAll(/\[(\d+)\]/g)) assert.ok(+m[1] >= 1 && +m[1] <= c.src.length, `${l} ${c.id}.${f} : [${m[1]}] sans source`);
        }
        if (l === "en") for (const f of ["mini", "text", "verdict"]) assert.doesNotMatch(T[f], PAGE_REF, `${c.id}.${f} renvoie à la page`);
      }
    }
  });
}

test("cardsForIds : figure seule vs ensemble", () => {
  const { own, sets } = cardsForIds("cnav", new Set(["g3d"]));
  assert.deepEqual(own.map((c) => c.id), ["fix-globe"]);
  assert.deepEqual(sets.map((c) => c.id), ["fix"]);
  assert.deepEqual(cardsForIds("nope", new Set(["g3d"])), { own: [], sets: [] });
});

test("arrange : rangée si large, colonne si haut, rien ne déborde", () => {
  const two = [{ w: 600, h: 340 }, { w: 600, h: 340 }];
  const row = arrange(two, 1000, Infinity, { gap: 20, lab: 30 });
  assert.equal(row.col, false);
  assert.ok(Math.abs(row.w - 1000) < 1e-9 && Math.abs(row.cells[0].h - 490 / (600 / 340)) < 1e-9);
  const col = arrange(two, 1000, 900, { gap: 20, lab: 30 });
  assert.equal(col.col, true);                        // carré : empilées, plus grandes
  assert.ok(col.h <= 900 + 1e-9 && col.w <= 1000 + 1e-9);
  assert.ok(col.cells[0].w > row.cells[0].w);
  const one = arrange([{ w: 400, h: 400 }], 1000, 500, { lab: 0 });
  assert.deepEqual([one.w, one.h], [500, 500]);
});

test("variantes : « id@v » désigne la même figure dans un autre modèle", () => {
  assert.deepEqual(figRef("df3d@cartesian"), { id: "df3d", v: "cartesian", crop: null });
  assert.deepEqual(figRef("dg3d"), { id: "dg3d", v: null, crop: null });
  assert.deepEqual(figRef("twiWorldCanvas@inv#flat"), { id: "twiWorldCanvas", v: "inv", crop: "flat" });
  assert.deepEqual(figRef("twiWorldCanvas#globe"), { id: "twiWorldCanvas", v: null, crop: "globe" });
  // le bloc qui contient df3d propose les cartes qui le montrent sous ses deux modèles
  const { own, sets } = cardsForIds("dist", new Set(["df3d"]));
  assert.ok(own.some((c) => c.id === "disk") && sets.some((c) => c.id === "pairs"));
  // une carte à variantes a une étiquette par image
  for (const [tab, mod] of Object.entries(CARD_TABS)) for (const c of mod.CARDS) {
    if (c.figs.some((f) => /[@#]/.test(f))) assert.ok(c.labels, `${tab} ${c.id} : variantes sans étiquettes`);
  }
});

test("arrange « side » : une figure à gauche, la pile à droite, même hauteur, rien ne déborde", () => {
  const g = { w: 300, h: 360 }, f = { w: 320, h: 360 };
  for (const [W, H] of [[1000, Infinity], [1000, 500], [600, 900]]) {
    const A = arrange([g, f, f], W, H, { gap: 20, lab: 30, side: true });
    assert.ok(A.w <= W + 1e-9 && A.h <= H + 1e-9, `${W}×${H}`);
    const [c0, c1, c2] = A.cells;
    assert.ok(Math.abs(c0.y + c0.h - (c2.y + c2.h)) < 1e-9, "bas alignés");
    assert.ok(Math.abs(c1.w - c2.w) < 1e-9 && c1.x === c2.x && c1.x > c0.x + c0.w, "pile à droite");
    assert.ok(Math.abs(c0.w / c0.h - g.w / g.h) < 1e-9 && Math.abs(c1.w / c1.h - f.w / f.h) < 1e-9, "rapports conservés");
  }
});

test("arrange « col » : colonne imposée, même avec une hauteur libre", () => {
  const wide = [{ w: 600, h: 300 }, { w: 600, h: 300 }, { w: 600, h: 300 }];
  const A = arrange(wide, 1000, Infinity, { gap: 10, lab: 20, col: true });
  assert.equal(A.col, true);
  assert.ok(A.cells.every((c) => c.x === 0 && Math.abs(c.w - 1000) < 1e-9));
  assert.ok(A.cells[1].y > A.cells[0].y + A.cells[0].h && A.cells[2].y > A.cells[1].y + A.cells[1].h);
  const B = arrange(wide, 1000, 900, { gap: 10, lab: 20, col: true });
  assert.ok(B.col && B.h <= 900 + 1e-9 && B.w <= 1000 + 1e-9);
});

test("arrange « rows » : trois figures en rangée, une dessous, rien ne déborde", () => {
  const b = [{ w: 300, h: 300 }, { w: 300, h: 300 }, { w: 300, h: 300 }, { w: 900, h: 200 }];
  for (const [W, H] of [[1000, Infinity], [1000, 700]]) {
    const A = arrange(b, W, H, { gap: 10, lab: 20, rows: [3, 1] });
    assert.ok(A.w <= W + 1e-9 && A.h <= H + 1e-9);
    const [c0, c1, c2, c3] = A.cells;
    assert.ok(Math.abs(c0.h - c1.h) < 1e-9 && Math.abs(c1.h - c2.h) < 1e-9, "même hauteur dans la rangée");
    assert.ok(c3.y > c0.y + c0.h, "la quatrième dessous");
  }
});
