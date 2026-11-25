import test from "node:test";
import assert from "node:assert/strict";
import { cardVideoKey, prerenderedUrl, fetchPrerendered, _resetManifest } from "./prerendered.js";

const KEY = "sun/romer-card-square-en.mp4";
const mk = (manifest, files = {}) => async (u) => u.endsWith("manifest.json")
  ? (manifest ? { ok: true, json: async () => manifest } : { ok: false })
  : (files[u] ? { ok: true, blob: async () => "BLOB" } : { ok: false });
const spec = { tabKey: "sun", cardId: "romer", len: "card", format: "square", lang: "en", kind: "mp4" };

test("key", () => assert.equal(cardVideoKey("sun", "romer", "card", "square"), KEY));
test("listed English MP4: URL and blob", async () => {
  _resetManifest(); const f = mk({ [KEY]: { bytes: 1 } }, { ["/video/cards/" + KEY]: 1 });
  assert.equal(await prerenderedUrl(spec, f), "/video/cards/" + KEY);
  assert.equal(await fetchPrerendered(spec, f), "BLOB");
});
test("not English, not mp4, or not listed: null (computed in the browser)", async () => {
  _resetManifest(); const f = mk({ [KEY]: { bytes: 1 } });
  assert.equal(await prerenderedUrl({ ...spec, lang: "fr" }, f), null);
  assert.equal(await prerenderedUrl({ ...spec, kind: "gif" }, f), null);
  assert.equal(await prerenderedUrl({ ...spec, len: "mini" }, f), null);
});
test("no manifest or a missing file: null", async () => {
  _resetManifest(); assert.equal(await fetchPrerendered(spec, mk(null)), null);
  _resetManifest(); assert.equal(await fetchPrerendered(spec, mk({ [KEY]: {} })), null);
});

test("a video rendered with controls is served only while they are still at their initial value", async () => {
  _resetManifest(); const f = mk({ [KEY]: { bytes: 1, ctl: "abc" } }, { ["/video/cards/" + KEY]: 1 });
  assert.equal(await prerenderedUrl({ ...spec, ctl: "abc" }, f), "/video/cards/" + KEY);
  assert.equal(await prerenderedUrl({ ...spec, ctl: "xyz" }, f), null);   // the reader moved a control: computed in the browser
  assert.equal(await prerenderedUrl(spec, f), null);                       // no signature given = no controls, but the video was made with some
});
test("a video made without controls is not served once controls exist, and unpublished contributions are found under _unpublished/", async () => {
  _resetManifest(); const f = mk({ [KEY]: { bytes: 1 }, ["_unpublished/" + KEY.replace("sun/", "contrib/")]: { bytes: 1 } });
  assert.equal(await prerenderedUrl({ ...spec, ctl: "abc" }, f), null);
  assert.equal(await prerenderedUrl({ ...spec, tabKey: "contrib" }, f), "/video/cards/_unpublished/contrib/romer-card-square-en.mp4");
});
test("a card with a list has one video per option: the one whose control signature is the page's is served", async () => {
  const V = "sun/romer~3-card-square-en.mp4", O = "sun/romerx-card-square-en.mp4";
  _resetManifest(); const f = mk({ [KEY]: { bytes: 1, ctl: "a" }, [V]: { bytes: 1, ctl: "d" }, [O]: { bytes: 1, ctl: "z" } });
  assert.equal(await prerenderedUrl({ ...spec, ctl: "a" }, f), "/video/cards/" + KEY);
  assert.equal(await prerenderedUrl({ ...spec, ctl: "d" }, f), "/video/cards/" + V);
  assert.equal(await prerenderedUrl({ ...spec, ctl: "z" }, f), null);   // another card's video (romerx) is never taken
});
test("a showcase is served as a figure video (src/data/video-figs.js): <tab>/<canvas id>-fig-native-en.mp4, English MP4 only", async () => {
  const F = "rocket/rocketReel-fig-native-en.mp4";
  _resetManifest(); const f = mk({ [F]: { bytes: 1 } });
  const s = { tabKey: "rocket", cardId: "rocketReel", len: "fig", format: "native", lang: "en", kind: "mp4" };
  assert.equal(await prerenderedUrl(s, f), "/video/cards/" + F);
  assert.equal(await prerenderedUrl({ ...s, lang: "fr" }, f), null);
  assert.equal(await prerenderedUrl({ ...s, kind: "gif" }, f), null);
});
test("every showcase listed for pre-rendering exists in its tab", async () => {
  const { VIDEO_FIGS } = await import("../data/video-figs.js");
  const { readFileSync, readdirSync } = await import("node:fs");
  for (const [tab, ids] of Object.entries(VIDEO_FIGS)) {
    const src = [`src/tabs/${tab}`, "src/data/prose"].flatMap((d) => readdirSync(d).filter((n) => n.endsWith(".js") && (d.includes("prose") ? n === `${tab}.js` : true)).map((n) => readFileSync(`${d}/${n}`, "utf8"))).join("\n");
    for (const id of ids) assert.ok(src.includes(`id="${id}"`) || src.includes(`id=\\"${id}\\"`), `${tab}: ${id}`);
  }
});
