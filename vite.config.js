// Configuration Vite (2026-10-15) : les réglages par défaut, le greffon des contributions publiées
// (scripts/contrib-build.mjs, src/tabs/contrib/registry.js) et, en développement seulement, le manifeste des vidéos de cartes
// pré-rendues recalculé à chaque demande (scripts/prerender-manifest-lib.mjs, epic25).
import { defineConfig } from "vite";
import path from "node:path";
import { contribPlugin } from "./scripts/contrib-build.mjs";
import { currentManifest, currentLayers } from "./scripts/prerender-manifest-lib.mjs";

/** /video/cards/manifest.json en dev : seules les vidéos dont l'empreinte est celle du code d'AUJOURD'HUI (sinon la page calcule). */
function videoCardsDev() {
  let memo = null;   // les empreintes lisent des centaines de fichiers : une seconde de répit entre deux demandes
  return {
    name: "video-cards-manifest-dev",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root, dir = path.resolve(root, process.env.PRERENDER_DIR || "prerender");
      server.middlewares.use("/video/cards/manifest.json", (_req, res) => {
        if (!memo || Date.now() - memo.t > 1000) memo = { t: Date.now(), body: JSON.stringify(currentManifest(dir, root).out) };
        res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(memo.body);
      });
      // les calques vidéo (core/layer-video.js, 2026-11-18) : même règle, layers/rendered.json filtré par empreinte
      let memoL = null;
      server.middlewares.use("/video/cards/layers/manifest.json", async (_req, res) => {
        if (!memoL || Date.now() - memoL.t > 1000) memoL = { t: Date.now(), body: JSON.stringify(await currentLayers(dir, root)) };
        res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(memoL.body);
      });
    },
  };
}

export default defineConfig({
  plugins: [contribPlugin(), videoCardsDev()],
});
