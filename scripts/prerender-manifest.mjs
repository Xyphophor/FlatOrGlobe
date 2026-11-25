// Réunit les manifestes des lots de scripts/prerender-cards.mjs (manifest-<langue>[-<lot>].json) en UN manifest.json,
// celui que la page lit (core/prerendered.js), SANS les contributions non publiées (_unpublished/). Seules y figurent les vidéos présentes ET à l'empreinte du code actuel
// (prerender-fingerprint.mjs) : une vidéo périmée n'est jamais annoncée, la page la recalcule elle-même.
//   node scripts/prerender-manifest.mjs <dossier>      puis      deploy/media.sh put-dir <dossier>
import { writeFileSync } from "node:fs";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { currentManifest, currentLayers } from "./prerender-manifest-lib.mjs";
const dir = process.argv[2]; if (!dir) { console.error("dossier requis"); process.exit(2); }
const { out, stale } = currentManifest(dir, process.cwd(), { publish: true });
writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(out, null, 1));
const n = Object.keys(out);
console.log(`${n.length} vidéos à jour, ${(n.reduce((s, k) => s + out[k].bytes, 0) / 1e6).toFixed(1)} Mo`);
for (const [tab, ks] of Object.entries(stale)) console.log(`  PÉRIMÉ ${tab}: ${ks.length} vidéo(s) exclue(s) (code changé depuis le rendu, ou jamais adoptées : --adopt)`);
// les calques vidéo à jour (core/layer-video.js) : <dossier>/layers/manifest.json
const L = await currentLayers(dir, process.cwd()); mkdirSync(path.join(dir, "layers"), { recursive: true });
writeFileSync(path.join(dir, "layers", "manifest.json"), JSON.stringify(L, null, 1));
console.log(`${Object.keys(L).length} calque(s) vidéo à jour`);
