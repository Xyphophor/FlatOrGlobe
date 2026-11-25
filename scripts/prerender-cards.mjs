// Pré-rendu des cartes animées SANS contrôle (epic25/UC02) : rend chaque boucle image par image avec le wasm Rust
// (raster/) et l'encode avec ffmpeg, aux mêmes dimensions que l'export de la page (MP4 ≤ 1920 px).
//   node --import ./scripts/smoke-register.mjs scripts/prerender-cards.mjs --out <dossier> [options]
//   --tabs a,b      onglets (défaut : tous)        --cards id,id   cartes (défaut : toutes celles sans contrôle)
//   --lang en       UNE langue par exécution       --len mini,card --format hd (défaut ; ou native,square,landscape,portrait)
//   --max 50 (s, coupure ; avertissement au-delà de 45 s)  --site-url <https://…> (crédit et QR ; sans lui, lien de section sans hôte et pas de QR)
//   --tag <nom> (manifeste d'un lot parallèle)  --list (inventaire seul)  --force (refait même les vidéos à jour)
//   Les vitrines (src/data/video-figs.js, 2026-10-27) sont rendues seules, comme l'export « MP4 » de la figure : clé
//             <onglet>/<id>-fig-native-<langue>.mp4, jusqu'à 60 s (pas de carte, pas de texte ajouté).
//   --check   compare src/data/video-cards.json aux empreintes du code (prerender-fingerprint.mjs) : STALE = code changé
//             depuis le rendu, code de sortie 1 ; ne rend rien (c'est ce que lance `make videos-check`)
//   --restamp (2026-10-25) remplace l'empreinte consignée d'un onglet par l'actuelle, sur les vidéos qui portaient l'ancienne
//             (manifestes de <out> et src/data/video-cards.json). Seulement quand le code a bougé SANS changer le rendu des cartes
//             (ex. le registre des badges, importé par tous les onglets, que les cartes n'affichent pas) ; ne rend rien
//   --adopt   pose l'empreinte actuelle sur des vidéos déjà rendues sans empreinte (à ne faire que si le code n'a pas bougé
//             depuis leur rendu) et complète src/data/video-cards.json
// MP4 seulement (GIF abandonné le 2026-10-15 : qualité médiocre). Écrit <out>/<onglet>/<carte>-<len>-<format>-<langue>.mp4
// et <out>/manifest-<langue>[-<tag>].json (octets, durée, taille).
// Les animations à contrôles sont rendues dans leur état INITIAL ; le manifeste garde la signature de ces contrôles (`ctl`, core/ctl-signature.js)
// et la page ne sert la vidéo que s'ils sont encore à cette valeur (--no-controls : seulement les cartes sans contrôle).
// Les contributions non publiées (published.json) sont rangées sous <out>/_unpublished/ : jamais publiées ni envoyées à Garage.
//   --socket <chemin>  sert l'avancement sur une socket Unix (JSON, une ligne par connexion ; défaut <out>/.prerender.sock
//                      en mode daemon) : node scripts/prerender-status.mjs [<out> | --socket <chemin>] l'affiche.
//   --daemon           (2026-10-19) se détache du terminal : relance ce script en arrière-plan (journal <out>/.prerender.log,
//                      PID dans <out>/.prerender.pid), avec la socket, et rend la main aussitôt.
// Avant de rendre, une passe de planification monte chaque onglet et compte les vidéos et les images à faire, pour l'avancement.
import { spawn } from "node:child_process";
import net from "node:net";
import { openSync, unlinkSync } from "node:fs";
import { readdirSync, existsSync, mkdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fingerprints } from "./prerender-fingerprint.mjs";
const args = Object.fromEntries(process.argv.slice(2).join(" ").split(/\s*--/).filter(Boolean).map((a) => { const [k, ...v] = a.trim().split(/\s+/); return [k, v.join(" ") || true]; }));
const list = (k, d) => (args[k] && args[k] !== true ? String(args[k]).split(",") : d);
const lang = args.lang || "en"; process.env.L = lang; process.env.CONTRIB_ALL = "1";   // toutes les contributions : les non publiées sont rangées à part

const rootDir = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const VC = path.join(rootDir, "src/data/video-cards.json");
const recorded = () => (existsSync(VC) ? JSON.parse(readFileSync(VC, "utf8")) : {});
if (args.check) {
  const rec = recorded(), now = fingerprints(Object.keys(rec), rootDir); let bad = 0;
  for (const [tab, fp] of Object.entries(rec)) if (now[tab] !== fp) { bad++; console.log(`STALE ${tab}: vidéos rendues à ${fp}, code à ${now[tab]} — relancer scripts/prerender-cards.mjs --tabs ${tab}`); }
  console.log(bad ? `${bad} onglet(s) à refaire` : `video-cards.json à jour (${Object.keys(rec).length} onglets)`);
  process.exit(bad ? 1 : 0);
}
const outDir = args.out; if (!outDir && !args.list) { console.error("--out <dossier> requis"); process.exit(2); }
if (args.restamp) {
  const rec = recorded(), tabsR = list("tabs", Object.keys(rec)), now = fingerprints(tabsR, rootDir), moved = {};
  for (const f of readdirSync(outDir).filter((n) => /^manifest-.+\.json$/.test(n))) {
    const m = JSON.parse(readFileSync(path.join(outDir, f), "utf8")); let n = 0;
    for (const [k, e] of Object.entries(m)) {
      const tab = k.replace(/^_unpublished\//, "").split("/")[0];
      if (tabsR.includes(tab) && e.fp && e.fp === rec[tab] && now[tab] !== rec[tab]) { e.fp = now[tab]; n++; moved[tab] = (moved[tab] || 0) + 1; }
    }
    if (n) writeFileSync(path.join(outDir, f), JSON.stringify(m, null, 1));
  }
  for (const tab of Object.keys(moved)) rec[tab] = now[tab];
  writeFileSync(VC, JSON.stringify(Object.fromEntries(Object.keys(rec).sort().map((k) => [k, rec[k]])), null, 1) + "\n");
  console.log(`${Object.keys(moved).length} onglet(s) réétiquetés, ${Object.values(moved).reduce((a, b) => a + b, 0)} vidéo(s)`);
  process.exit(0);
}
if (args.daemon) {
  mkdirSync(outDir, { recursive: true });
  // un lot (--tag t) a ses propres fichiers : .prerender-t.sock, .log, .pid, .status.json ; prerender-status.mjs les lit tous
  const base = `.prerender${args.tag && args.tag !== true ? "-" + args.tag : ""}`;
  const sock = args.socket && args.socket !== true ? args.socket : path.join(outDir, `${base}.sock`), log = path.join(outDir, `${base}.log`);
  const rest = process.argv.slice(2).filter((a) => a !== "--daemon");
  if (!rest.includes("--socket")) rest.push("--socket", sock);
  const fd = openSync(log, "a");
  const child = spawn(process.execPath, [...process.execArgv, new URL(import.meta.url).pathname, ...rest], { detached: true, stdio: ["ignore", fd, fd], cwd: process.cwd(), env: process.env });
  child.unref();
  writeFileSync(path.join(outDir, `${base}.pid`), String(child.pid));
  console.log(`rendu lancé en arrière-plan : PID ${child.pid}\n  journal   ${log}\n  socket    ${sock}\n  avancement : node scripts/prerender-status.mjs ${outDir}`);
  process.exit(0);
}
if (args.max) process.env.PRERENDER_MAX = args.max;
const SITE = args["site-url"] || process.env.SITE_URL || "";
const { root } = await import("./prerender-env.mjs");
const { frames, ffmpeg } = await import("./prerender-encode.mjs");
const { cardsOf } = await import(path.join(root, "src/core/cards.js"));
const { controlsSignature, cardControls, cardBlocks, listVariants } = await import(path.join(root, "src/core/ctl-signature.js"));
const { ALL: CONTRIBUTIONS } = await import(path.join(root, "src/tabs/contrib/registry.js"));
const PUBLISHED = JSON.parse(readFileSync(path.join(root, "src/data/contrib/published.json"), "utf8"));
const { planCard, cardAnim, hdSize } = await import(path.join(root, "src/core/export-card.js"));
const { setActiveTab, creditInfo, withQr, sectionOfBlock } = await import(path.join(root, "src/core/export.js"));
const { tabLabel } = await import(path.join(root, "src/core/tabs.js"));
const { videoLayout, figureFrame } = await import(path.join(root, "src/core/export-video.js"));
const { VIDEO_FIGS, VIDEO_FIG_PHONE } = await import(path.join(root, "src/data/video-figs.js"));
if (SITE) { const u = new URL(SITE); location.origin = u.origin; location.pathname = u.pathname; } else { location.origin = ""; location.pathname = ""; }
const tabs = list("tabs", readdirSync(path.join(root, "src/tabs")).filter((n) => !n.startsWith("_") && existsSync(path.join(root, "src/tabs", n, "index.js"))));
const lens = list("len", ["mini", "card"]), formats = list("format", ["hd"]);   // 2026-10-23 : un format par carte, adapté (export-card.js, planHd)
const only = args.cards && args.cards !== true ? new Set(list("cards")) : null;

const dim = (v) => Math.round(v / 2) * 2;
const FP = args.list ? {} : fingerprints(tabs, rootDir);
const tagName = args.tag ? "-" + args.tag : "";
const mfile = outDir && path.join(outDir, `manifest-${lang}${tagName}.json`);
const manifest = mfile && existsSync(mfile) ? JSON.parse(readFileSync(mfile, "utf8")) : {};
/** Toutes les entrées de tous les lots du dossier (un onglet peut avoir été rendu par un autre lot). */
// pour une même clé, l'entrée d'un lot à l'empreinte actuelle l'emporte sur une ancienne d'un autre lot (2026-10-20)
const entries = () => { const out = {}; for (const m of readdirSync(outDir).filter((n) => /^manifest-.+\.json$/.test(n)).map((n) => JSON.parse(readFileSync(path.join(outDir, n), "utf8")))) for (const [k, e] of Object.entries(m)) { const tab = k.replace(/^_unpublished\//, "").split("/")[0]; if (!out[k] || (e.fp && e.fp === FP[tab])) out[k] = e; } return out; };
const saveRecorded = (tab, fp) => { const r = recorded(); r[tab] = fp; writeFileSync(VC, JSON.stringify(Object.fromEntries(Object.keys(r).sort().map((k) => [k, r[k]])), null, 1) + "\n"); };
let nOut = 0, tAll = performance.now();
// propriétaire, 2026-11-21 : une carte est coupée au-delà de 50 s, et signalée (avertissement) au-delà de 45 s
const MAXS = +(process.env.PRERENDER_MAX || 50), WARNS = 45, FPS = 30;
const FIG_MAX = 60;   // une vitrine entière, comme l'export de la figure dans la page (export-video.js : 60 s au plus)
// l'avancement servi sur la socket : par onglet, les vidéos et les images prévues et faites, le temps, les octets, la durée vidéo
const ST = { pid: process.pid, out: outDir, tag: args.tag && args.tag !== true ? args.tag : "", started: Date.now(), phase: "plan", current: null, tabs: Object.fromEntries(tabs.map((t) => [t, { state: "waiting", videos: 0, todo: 0, done: 0, skipped: 0, framesTodo: 0, framesDone: 0, ms: 0, bytes: 0, seconds: 0 }])) };
let server = null;
if (args.socket && args.socket !== true) {
  try { unlinkSync(args.socket); } catch { /* pas de socket restée d'un rendu précédent */ }
  server = net.createServer((c) => { c.end(JSON.stringify({ ...ST, now: Date.now() }) + "\n"); }).listen(args.socket);
  const bye = () => { try { server.close(); unlinkSync(args.socket); } catch { /* déjà fermée */ } };
  process.on("exit", bye); process.on("SIGINT", () => process.exit(130)); process.on("SIGTERM", () => process.exit(143));
}
// le même état, écrit dans <out>/.prerender.status.json toutes les 30 s et à la fin : le récapitulatif reste lisible après coup
const snap = () => { if (outDir && !args.list) try { writeFileSync(path.join(outDir, `.prerender${tagName}.status.json`), JSON.stringify({ ...ST, now: Date.now() })); } catch { /* dossier absent */ } };
const snapTimer = setInterval(snap, 30000); snapTimer.unref?.();
process.on("exit", snap);
const plan = !args.list && !args.adopt;
async function pass(mode) {
for (const name of tabs) {
  const TS = ST.tabs[name];
  if (mode === "render") { TS.state = "running"; ST.current = { tab: name }; }
  const tab = (await import(path.join(root, "src/tabs", name, "index.js"))).default;
  const c = document.createElement("section"); c.id = `tab-${tab.key}`; c.className = "tabpanel"; document.getElementById("tabpanels").appendChild(c);
  try { tab.mount(c); for (const v of Object.values(tab)) if (v instanceof Promise) await v; tab.render(); } catch (e) { console.log(`${name}: MOUNT ${e.message}`); TS.state = "error"; continue; }
  // certaines animations s'attachent après un chargement (dip, « caus ») : on attend que leur nombre ne bouge plus 1,5 s (8 s au plus)
  { const nAnim = () => [...c.querySelectorAll("canvas, svg, .figsym, .fig")].filter((e) => e.__anim).length;
    let n = nAnim(), still = 0; for (let t = 0; t < 8000 && still < 1500; t += 250) { await new Promise((r) => setTimeout(r, 250)); const m = nAnim(); if (m === n) still += 250; else { n = m; still = 0; } } }
  setActiveTab(tab);
  const expected = [];
  for (const card of cardsOf(tab.key)) {
    if (only && !only.has(card.id)) continue;
    let a = null; try { a = cardAnim(card); } catch { continue; }
    if (!a) continue;
    const blocks = cardBlocks(card), nCtl = cardControls(card).length;
    // une carte à liste simple (listVariants) : une vidéo par option, « <carte>~<n> » ; l'option initiale garde la clé nue
    const LV = listVariants(card), v0 = LV ? LV.sel.value : null, i0 = LV ? Math.max(0, LV.values.indexOf(v0)) : 0;
    const variants = LV && !args["no-lists"] ? [i0, ...LV.values.map((_, i) => i).filter((i) => i !== i0)] : [null];
    const choose = (i) => { if (i == null || LV.sel.value === LV.values[i]) return; LV.sel.value = LV.values[i]; const E = globalThis.window?.Event || Event; LV.sel.dispatchEvent(new E("change", { bubbles: true })); };
    if (nCtl && args["no-controls"]) { if (args.list) console.log(`${name}/${card.id}: ${nCtl} contrôle(s), ignorée (--no-controls)`); continue; }
    const owner = name === "contrib" ? CONTRIBUTIONS.find((c) => c.cards.includes(card)) : null, prefix = owner && PUBLISHED[owner.key] !== true ? "_unpublished/" : "";
    if (args.list) { const ctl = controlsSignature(card); console.log(`${name}/${card.id}: ${a.duration.toFixed(1)} s${nCtl ? `, ${nCtl} contrôle(s), état initial${ctl ? ` (${ctl})` : ""}` : ""}${LV ? `, liste de ${LV.values.length} options : une vidéo par option` : ""}${prefix ? ", NON PUBLIÉE" : ""}${a.duration > MAXS ? ` > ${MAXS} s : TRONQUÉE` : a.duration > WARNS ? ` > ${WARNS} s : avertissement` : ""}`); continue; }
    const ci = mode === "plan" ? null : creditInfo(tab.key, tabLabel(tab.key), blocks[0] && sectionOfBlock(blocks[0])), info = mode === "plan" ? null : SITE ? await withQr(ci) : ci;
    try {
      for (const vi of variants) {
        choose(vi);
        if (tab.ready instanceof Promise) await tab.ready;
        const ctl = controlsSignature(card), sfx = vi == null || vi === i0 ? "" : `~${vi}`;
        for (const len of lens) for (const format of formats) {
          const key = `${prefix}${name}/${card.id}${sfx}-${len}-${format}-${lang}.mp4`, file = path.join(outDir, key);
          if (args.adopt) {   // la vidéo existe déjà : on lui pose l'empreinte du code actuel
            expected.push(key);
            if (manifest[key] && !manifest[key].fp && existsSync(file)) { manifest[key].fp = FP[name]; if (ctl) manifest[key].ctl = ctl; nOut++; }
            continue;
          }
          const fresh = !args.force && manifest[key]?.fp === FP[name] && (manifest[key].ctl || "") === ctl && existsSync(file);   // à jour (empreinte identique)
          if (mode === "plan") {          // planification : on compte, on ne rend rien
            const nf = Math.max(1, Math.round(Math.min(a.duration, MAXS) * FPS));
            TS.videos++; if (fresh) TS.skipped++; else { TS.todo++; TS.framesTodo += nf; }
            continue;
          }
          const P = planCard(card, { len, format, lang, tabKey: tab.key, video: true, info });
          if (!P?.anim) continue;
          expected.push(key);
          if (fresh) continue;
          const sc = Math.min(1, 1920 / P.W), { W, H } = format === "hd" ? hdSize(P) : { W: dim(P.W * sc), H: dim(P.H * sc) }, fps = FPS;
          mkdirSync(path.dirname(file), { recursive: true });
          const enc = ffmpeg(W, H, fps, file), t0 = performance.now(), nPlan = Math.max(1, Math.round(Math.min(P.anim.duration, MAXS) * fps));
          ST.current = { tab: name, key, frame: 0, frames: nPlan, w: W, h: H };
          if (P.anim.duration > WARNS) console.log(`${key}: ${P.anim.duration.toFixed(1)} s > ${WARNS} s${P.anim.duration > MAXS ? `, coupée à ${MAXS} s` : " (avertissement)"}`);
          const n = await frames(P, W, H, fps, (px) => { ST.current.frame++; TS.framesDone++; return enc.write(px); }, MAXS); await enc.end();
          manifest[key] = { bytes: statSync(file).size, seconds: +(n / fps).toFixed(2), w: W, h: H, fps, fp: FP[name], ...(ctl ? { ctl } : {}) };
          writeFileSync(mfile, JSON.stringify(manifest, null, 1)); nOut++;
          TS.done++; TS.ms += performance.now() - t0; TS.bytes += manifest[key].bytes; TS.seconds += n / fps;
          if (n !== nPlan) TS.framesTodo += n - nPlan;   // la durée prévue était celle de l'option initiale
          console.log(`${key}  ${W}x${H} ${n} images  ${((performance.now() - t0) / 1000).toFixed(0)} s  ${(manifest[key].bytes / 1e6).toFixed(2)} Mo`);
        }
      }
    } finally { if (LV) choose(i0); }
  }
  // les figures animées pré-rendues seules (src/data/video-figs.js) : l'export « MP4 » de la figure, sans carte
  for (const id of (VIDEO_FIGS[name] || []).filter((id) => !args.cards || only?.has(id))) {   // --cards peut nommer une vitrine (2026-10-28)
    const cv = c.querySelector(`#${id}`), block = cv?.closest(".fig, .figopen, [data-xp-block]") || cv, anim = cv?.__anim;
    if (!anim) { console.log(`${name}/${id}: figure introuvable ou sans animation`); continue; }
    if (args.list) { console.log(`${name}/${id}: figure seule, ${anim.duration.toFixed(1)} s, paysage et téléphone`); continue; }
    // deux versions : celle du bureau (« native », la mise en page de la page à 1280 px) et celle du téléphone (« portrait » :
    // le canvas à 600 px de large aux proportions qu'il prend sous 560 px, VIDEO_FIG_PHONE) ; la page sert celle qui a la forme
    // du canvas au moment de l'export ; height:auto (2026-11-18) : un canvas dont la hauteur est en ligne (gravAnimTide, clamp) prend
    // lui aussi les proportions données
    const style0 = cv.getAttribute("style");
    for (const [fmt, ar] of [["native", null], ["portrait", VIDEO_FIG_PHONE[id]]]) {
    if (fmt === "portrait" && !ar) continue;
    if (ar) { cv.setAttribute("style", `${style0 ? style0 + ";" : ""}width:600px;height:auto;aspect-ratio:${ar}`); cv._rec = null; }
    try {
    const key = `${name}/${id}-fig-${fmt}-${lang}.mp4`, file = path.join(outDir, key);
    const fresh = !args.force && manifest[key]?.fp === FP[name] && existsSync(file);
    if (mode === "plan") { TS.videos++; if (fresh) TS.skipped++; else { TS.todo++; TS.framesTodo += Math.max(1, Math.round(Math.min(anim.duration, FIG_MAX) * FPS)); } continue; }
    if (args.adopt) { expected.push(key); if (manifest[key] && !manifest[key].fp && existsSync(file)) { manifest[key].fp = FP[name]; nOut++; } continue; }
    expected.push(key);
    if (fresh) continue;
    const ci = creditInfo(tab.key, tabLabel(tab.key), sectionOfBlock(block)), info = SITE ? await withQr(ci) : ci;
    const F = figureFrame(block, anim, { format: "native", kind: "mp4", info }), W = F.L.W, H = F.L.H;
    const P = { W, H, anim, paint: F.paint };
    mkdirSync(path.dirname(file), { recursive: true });
    const enc = ffmpeg(W, H, FPS, file), t0 = performance.now(), nPlan = Math.max(1, Math.round(Math.min(anim.duration, FIG_MAX) * FPS));
    ST.current = { tab: name, key, frame: 0, frames: nPlan, w: W, h: H };
    const n = await frames(P, W, H, FPS, (px) => { ST.current.frame++; TS.framesDone++; return enc.write(px); }, FIG_MAX); await enc.end();
    manifest[key] = { bytes: statSync(file).size, seconds: +(n / FPS).toFixed(2), w: W, h: H, fps: FPS, fp: FP[name] };
    writeFileSync(mfile, JSON.stringify(manifest, null, 1)); nOut++;
    TS.done++; TS.ms += performance.now() - t0; TS.bytes += manifest[key].bytes; TS.seconds += n / FPS;
    console.log(`${key}  ${W}x${H} ${n} images  ${((performance.now() - t0) / 1000).toFixed(0)} s  ${(manifest[key].bytes / 1e6).toFixed(2)} Mo`);
    } finally { if (ar) { if (style0 == null) cv.removeAttribute("style"); else cv.setAttribute("style", style0); cv._rec = null; } }
    }
  }
  if (mode === "plan") { try { tab.teardown(); } catch {} c.remove(); continue; }
  if (args.adopt && nOut) writeFileSync(mfile, JSON.stringify(manifest, null, 1));
  if (!args.list && expected.length && !only) {   // tous les fichiers attendus de l'onglet sont là et à l'empreinte du code : on le consigne
    const all = entries();
    if (expected.every((k) => all[k]?.fp === FP[name] && existsSync(path.join(outDir, k)))) { saveRecorded(name, FP[name]); console.log(`${name}: complet (empreinte ${FP[name]})`); }
  }
  try { tab.teardown(); } catch {}
  if (mode === "render") {
    const miss = TS.videos - TS.done - TS.skipped;
    TS.state = miss > 0 ? "incomplete" : "done";
    if (miss > 0) console.log(`ATTENTION ${name} : ${miss} vidéo(s) prévue(s) par la planification non rendue(s)`);
  }
}
}
if (args["plan-only"]) {
  // processus de planification (lancé par le rendu, 2026-10-20) : un onglet monté deux fois dans le même processus peut ne pas
  // recréer ses animations (cnav, dist : les scènes 3D) ; la planification se fait donc ici, et le rendu monte chaque onglet une fois
  await pass("plan");
  process.stdout.write("\n__PLAN__" + JSON.stringify(ST.tabs) + "\n");
  process.exit(0);
}
if (plan) {
  const rest = process.argv.slice(2).filter((a, i, A) => a !== "--daemon" && a !== "--socket" && A[i - 1] !== "--socket");
  const txt = await new Promise((res, rej) => {
    const ch = spawn(process.execPath, [...process.execArgv, new URL(import.meta.url).pathname, ...rest, "--plan-only"], { stdio: ["ignore", "pipe", "inherit"], cwd: process.cwd(), env: process.env });
    let o = ""; ch.stdout.on("data", (d) => { o += d; }); ch.on("exit", (code) => (code ? rej(new Error(`planification : code ${code}`)) : res(o))); ch.on("error", rej);
  });
  const line = txt.split("\n").find((l) => l.startsWith("__PLAN__"));
  for (const l of txt.split("\n")) if (l && !l.startsWith("__PLAN__")) console.log(l);   // ses messages (MOUNT…)
  Object.assign(ST.tabs, JSON.parse(line.slice(8)));
  const T = Object.values(ST.tabs).reduce((s, t) => ({ v: s.v + t.todo, f: s.f + t.framesTodo }), { v: 0, f: 0 });
  console.log(`planifié : ${T.v} vidéo(s) à rendre, ${T.f} images`);
  ST.phase = "render"; ST.renderStarted = Date.now();
}
await pass(plan ? "render" : "once");
ST.phase = "done"; ST.current = null; ST.finished = Date.now();
if (!args.list) console.log(`${nOut} fichier(s), ${((performance.now() - tAll) / 60000).toFixed(1)} min`);
if (server) server.close();
