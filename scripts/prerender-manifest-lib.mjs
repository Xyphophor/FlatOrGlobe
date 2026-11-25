// Le manifeste des vidéos de cartes à jour : les entrées des lots (manifest-<langue>[-<lot>].json) dont le fichier existe et
// dont l'empreinte est celle du code actuel. Partagé par scripts/prerender-manifest.mjs (fichier publié) et par le serveur
// de dev (vite.config.js : le manifeste est recalculé à chaque demande, une vidéo périmée disparaît dès la sauvegarde).
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fingerprints } from "./prerender-fingerprint.mjs";

const tabOf = (k) => k.replace(/^_unpublished\//, "").split("/")[0];

/**
 * @param {{publish?: boolean}} opts publish : le manifeste qu'on envoie, SANS les contributions non publiées (_unpublished/) ;
 *   sinon (serveur de dev) tout ce qui existe en local.
 * @returns {{out: object, stale: Object<string,string[]>}} out = manifeste ; stale = clés exclues, par onglet
 */
export function currentManifest(dir, root = process.cwd(), { publish = false } = {}) {
  // plusieurs lots (manifest-<langue>-<lot>.json) peuvent avoir la même clé, une ancienne entrée périmée dans l'un, la nouvelle dans
  // l'autre (2026-10-20) : on garde, pour chaque clé, l'entrée à l'empreinte actuelle s'il y en a une
  const lots = existsSync(dir) ? readdirSync(dir).filter((n) => /^manifest-.+\.json$/.test(n)).map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"))) : [];
  const keys = [...new Set(lots.flatMap((m) => Object.keys(m)))].filter((k) => k.endsWith(".mp4") && existsSync(path.join(dir, k)) && !(publish && k.startsWith("_unpublished/"))).sort();
  const now = fingerprints([...new Set(keys.map(tabOf))], root);
  const all = Object.fromEntries(keys.map((k) => { const c = lots.map((m) => m[k]).filter(Boolean); return [k, c.find((e) => e.fp && e.fp === now[tabOf(k)]) || c[c.length - 1]]; }));
  const out = {}, stale = {};
  for (const k of keys) { const tab = tabOf(k); if (all[k].fp && all[k].fp === now[tab]) out[k] = all[k]; else (stale[tab] ??= []).push(k); }
  return { out, stale };
}

/** Les calques vidéo à jour (core/layer-video.js) : <dir>/layers/rendered.json, sans les entrées dont l'empreinte n'est plus
 *  celle du code (prerender-fingerprint.mjs, layerFingerprint) ni celles dont le fichier manque. { id: entrée } */
export async function currentLayers(dir, root = process.cwd()) {
  const RF = path.join(dir, "layers", "rendered.json"); if (!existsSync(RF)) return {};
  const { VIDEO_LAYERS } = await import(path.join(root, "src/data/video-layers.js"));
  const { layerFingerprint } = await import("./prerender-fingerprint.mjs");
  const all = JSON.parse(readFileSync(RF, "utf8")), out = {};
  for (const [id, e] of Object.entries(all)) if (VIDEO_LAYERS[id] && e.fp === layerFingerprint(VIDEO_LAYERS[id], root) && existsSync(path.join(dir, "layers", e.file))) out[id] = e;
  return out;
}
