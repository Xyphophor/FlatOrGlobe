// Calques vidéo (core/layer-video.js) : hors navigateur, rien ne se charge et la page dessine elle-même.
import { test } from "node:test";
import assert from "node:assert/strict";
import { layerVideo } from "./layer-video.js";
import { VIDEO_LAYERS } from "../data/video-layers.js";
import { existsSync } from "node:fs";

test("sans navigateur, le calque reste éteint", () => {
  const v = layerVideo({}, "gravAnimTideGlobe", { span: 46 });
  assert.equal(v.on, false); assert.equal(v.active(true, 0.3), false); v.pause(); v.attach();
});
test("chaque calque du registre existe et exporte LAYER", async () => {
  for (const [id, entry] of Object.entries(VIDEO_LAYERS)) {
    assert.ok(existsSync(entry), entry);
    const { LAYER } = await import("../../" + entry);
    assert.equal(LAYER.id, id); assert.ok(LAYER.span > 0 && LAYER.size % 2 === 0 && typeof LAYER.paint === "function");
  }
});
