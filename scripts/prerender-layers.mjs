// Calques vidéo pré-rendus (2026-11-18, core/layer-video.js, registre src/data/video-layers.js) : la partie coûteuse d'une
// animation, sans texte, rendue image par image par le wasm Rust (raster/) et encodée par ffmpeg, une fois pour toutes.
//   node --import ./scripts/smoke-register.mjs scripts/prerender-layers.mjs --out prerender [--ids a,b] [--force]
//   node scripts/prerender-layers.mjs --check     (make videos-check) : src/data/video-layers.json contre les empreintes
// Écrit <out>/layers/<id>.mp4 et <out>/layers/rendered.json ({ id: { file, fp, bytes, seconds, size, fps } }) ; la page lit
// layers/manifest.json, la même chose filtrée par empreinte (prerender-manifest-lib.mjs : serveur de dev, prerender-manifest.mjs).
// Encodage : 30 images/s, une image clé par seconde (la page se cale sur un instant au démarrage), crf 30, preset slow (2026-11-18 : 14 Mo à crf 23, ~6 à 30 sans perte visible ; lu dans la page,
// pas réenvoyé à X comme les cartes : moins d'octets).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { layerFingerprint } from "./prerender-fingerprint.mjs";
const rootDir = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const args = Object.fromEntries(process.argv.slice(2).join(" ").split(/\s*--/).filter(Boolean).map((a) => { const [k, ...v] = a.trim().split(/\s+/); return [k, v.join(" ") || true]; }));
const { VIDEO_LAYERS } = await import(path.join(rootDir, "src/data/video-layers.js"));
const VL = path.join(rootDir, "src/data/video-layers.json");
const recorded = existsSync(VL) ? JSON.parse(readFileSync(VL, "utf8")) : {};
const ids = args.ids && args.ids !== true ? String(args.ids).split(",") : Object.keys(VIDEO_LAYERS);
if (args.check) {
  let bad = 0;
  for (const id of Object.keys(VIDEO_LAYERS)) { const fp = layerFingerprint(VIDEO_LAYERS[id], rootDir);
    if (recorded[id] !== fp) { bad++; console.log(`STALE layer ${id}: rendu à ${recorded[id] || "jamais"}, code à ${fp} — relancer scripts/prerender-layers.mjs --ids ${id} --out prerender`); } }
  console.log(bad ? `${bad} calque(s) à refaire` : `video-layers.json à jour (${Object.keys(VIDEO_LAYERS).length} calque(s))`);
  process.exit(bad ? 1 : 0);
}
const out = args.out; if (!out || out === true) { console.error("--out <dossier> requis"); process.exit(2); }
const { frame } = await import("./prerender-env.mjs");
const dir = path.join(out, "layers"), RF = path.join(dir, "rendered.json"); mkdirSync(dir, { recursive: true });
const rendered = existsSync(RF) ? JSON.parse(readFileSync(RF, "utf8")) : {};
const FPS = 30;
const hex = (c) => (parseInt(c.slice(1), 16) * 256 + 255) >>> 0;
for (const id of ids) {
  const entry = VIDEO_LAYERS[id]; if (!entry) { console.log(`${id}: inconnu (src/data/video-layers.js)`); continue; }
  const fp = layerFingerprint(entry, rootDir), file = `${id}.mp4`, full = path.join(dir, file);
  if (!args.force && rendered[id]?.fp === fp && existsSync(full)) { console.log(`${id}: à jour (${fp})`); recorded[id] = fp; continue; }
  const { LAYER } = await import(path.join(rootDir, entry));
  const { PAPER } = await import(path.join(rootDir, "src/core/anim2d.js"));
  const S = LAYER.size, n = Math.round(LAYER.span * FPS), t0 = performance.now();
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${S}x${S}`, "-r", String(FPS), "-i", "-",
    "-threads", "2", "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-g", String(FPS), "-x264-params", "open-gop=0", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", full], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => { ff.on("exit", (c) => (c ? rej(new Error(`ffmpeg ${c}`)) : res())); ff.on("error", rej); });
  for (let i = 0; i < n; i++) {
    const ctx = frame.ctx(S, S); LAYER.paint(ctx, S, i / n);
    const px = frame.render(ctx, S, S, hex(PAPER));
    await new Promise((r) => (ff.stdin.write(px) ? r() : ff.stdin.once("drain", r)));
    if (i % 150 === 0) console.log(`${id}: ${i}/${n} images, ${((performance.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end(); await done;
  rendered[id] = { file, fp, bytes: statSync(full).size, seconds: +(n / FPS).toFixed(2), size: S, fps: FPS };
  writeFileSync(RF, JSON.stringify(rendered, null, 1)); recorded[id] = fp;
  console.log(`${id}: ${S}x${S} ${n} images ${((performance.now() - t0) / 1000).toFixed(0)} s ${(rendered[id].bytes / 1e6).toFixed(2)} Mo`);
}
writeFileSync(VL, JSON.stringify(Object.fromEntries(Object.keys(recorded).sort().map((k) => [k, recorded[k]])), null, 1) + "\n");
