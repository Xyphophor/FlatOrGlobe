import { test } from "node:test";
import assert from "node:assert/strict";
import { fitRect, wrapText, fileName, layout, FORMATS } from "./export.js";

test("fitRect : contenu, centré, rapport conservé", () => {
  const r = fitRect(200, 100, 0, 0, 100, 100);
  assert.deepEqual([r.x, r.y, r.w, r.h], [0, 25, 100, 50]);
});

test("wrapText : largeur respectée, mots entiers", () => {
  const m = (s) => s.length * 10;
  const lines = wrapText("un deux trois quatre cinq", 100, m);
  assert.ok(lines.every((l) => m(l) <= 100 || !l.includes(" ")));
  assert.equal(lines.join(" "), "un deux trois quatre cinq");
  assert.deepEqual(wrapText("anticonstitutionnellement", 50, m), ["anticonstitutionnellement"]);
});

test("fileName : parlant et sans accents", () => {
  assert.equal(fileName("Élévation angles", "Viériou landscape", "square", "png", new Date(2026, 8, 25, 23, 30)),
    "flat-or-globe_elevation-angles_vieriou-landscape_square_2026-09-25.png");
});

test("layout : formats réseaux exacts, bandeau sous le dessin, dimensions paires", () => {
  for (const f of ["square", "landscape", "portrait"]) {
    const L = layout(f, 640, 360);
    assert.deepEqual([L.W, L.H], FORMATS[f]);
    assert.ok(L.fig.y + L.fig.h <= L.band.y);
  }
  const N = layout("native", 333, 187);
  assert.ok(N.W >= 1080 && N.W % 2 === 0 && N.H % 2 === 0);
  assert.ok(N.fig.h <= N.band.y);
});

test("videoNote : prévient seulement quand la vidéo n'est pas du H.264", async () => {
  const { videoNote } = await import("./export-video.js");
  assert.deepEqual(videoNote("mp4", { codec: "avc", ext: "mp4" }), {});
  assert.deepEqual(videoNote("mp4", { codec: "vp9", ext: "mp4" }), { note: "notH264" });
  assert.deepEqual(videoNote("mp4", { codec: "webm", ext: "webm" }), { note: "webm" });
  assert.deepEqual(videoNote("gif", { ext: "gif" }), {});
});

test("layout : les lectures d'une animation ont leur bande SOUS le dessin, au-dessus du crédit, jamais dessus", async () => {
  const { videoLayout } = await import("./export-video.js");
  for (const f of ["native", "square", "landscape", "portrait"]) {
    for (const L of [layout(f, 640, 360, () => 57), videoLayout(f, 640, 360, "gif", () => 57)]) {
      assert.ok(L.ro.h > 0 && L.ro.y >= L.fig.y + L.fig.h - 1e-9, f);
      assert.ok(L.ro.y + L.ro.h <= L.band.y + 1e-9, f);
    }
    const V = videoLayout(f, 640, 360, "mp4", () => 57);
    assert.ok(V.W % 2 === 0 && V.H % 2 === 0, f);
    const Z = layout(f, 640, 360);
    assert.equal(Z.ro.h, 0);
  }
});

test("resolveVars : un SVG exporté n'a plus de var(--…), couleurs de la palette claire", async () => {
  const { parseHTML } = await import("linkedom");
  const { document } = parseHTML("<svg><line stroke=\"var(--line)\"/><path style=\"stroke:var(--flat);fill:var(--nope, #123456)\"/></svg>");
  const { resolveVars } = await import("./export.js");
  const svg = document.querySelector("svg");
  resolveVars(svg, null);
  assert.equal(svg.querySelector("line").getAttribute("stroke"), "#d7d3c8");
  assert.equal(svg.querySelector("path").getAttribute("style"), "stroke:#b45309;fill:#123456");
});

test("resolveVars : variable inconnue sans repli -> attribut retiré, comme le navigateur", async () => {
  const { parseHTML } = await import("linkedom");
  const { document } = parseHTML("<svg><polyline stroke=\"var(--horizon)\"/></svg>");
  const { resolveVars } = await import("./export.js");
  const svg = document.querySelector("svg");
  resolveVars(svg, null);
  assert.equal(svg.querySelector("polyline").hasAttribute("stroke"), false);
});

test("format hd : la vidéo tient dans 1920 × 1080 (niveau H.264 4.0, accepté par X), paire", async () => {
  const { hdSize } = await import("./export-card.js");
  assert.deepEqual(hdSize({ W: 1080, H: 2134 }), { W: 972, H: 1920 });     // haute : grand côté 1920
  assert.deepEqual(hdSize({ W: 1080, H: 1602 }), { W: 1080, H: 1602 });    // trapue : petit côté 1080 (pas 1294 × 1920)
  assert.deepEqual(hdSize({ W: 1080, H: 700 }), { W: 1666, H: 1080 });
  const { videoLayout } = await import("./export-video.js");
  const V = videoLayout("native", 400, 1800, "mp4", () => 0);
  assert.ok(Math.max(V.W, V.H) <= 1920 && Math.min(V.W, V.H) <= 1080 && V.W % 2 === 0 && V.H % 2 === 0, `${V.W}×${V.H}`);
});
