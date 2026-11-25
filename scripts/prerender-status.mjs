// Avancement d'un rendu de vidéos de cartes lancé avec --daemon (ou --socket) : interroge les sockets de TOUS ses lots
// (<out>/.prerender[-<lot>].sock ; 2026-10-20, rendu en parallèle) et affiche, par onglet, les vidéos faites, le pourcentage
// (en images), le temps passé, la taille et la durée vidéo cumulées, puis le total et une estimation de la fin. Un lot qui ne
// répond plus est lu dans son dernier état enregistré (<out>/.prerender[-<lot>].status.json).
//   node scripts/prerender-status.mjs [<dossier de sortie> | --socket <chemin>] [--watch [s]] [--json]
import net from "node:net";
import path from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const argv = process.argv.slice(2), opt = (k) => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true; };
const dir = argv[0] && !argv[0].startsWith("--") ? argv[0] : "prerender";
const watch = opt("--watch"), every = typeof watch === "string" ? +watch : 10;

const ask = (sock) => new Promise((res, rej) => {
  let buf = "";
  const c = net.createConnection(sock);
  c.on("data", (d) => { buf += d; }); c.on("end", () => { try { res(JSON.parse(buf)); } catch (e) { rej(e); } }); c.on("error", rej);
});
const dur = (ms) => { const s = Math.round(ms / 1000); if (s < 60) return `${s} s`; const m = Math.round(s / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };
const vlen = (s) => (s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, "0")} s`);
const mo = (b) => `${(b / 1e6).toFixed(1)} Mo`;
const pct = (a, b) => { if (!b) return "—"; const x = (a / b) * 100; return x < 10 && x > 0 ? `${(Math.floor(x * 10) / 10).toFixed(1)} %` : `${Math.floor(x)} %`; };   // une décimale sous 10 % : le début ne paraît pas figé
const STATE = { waiting: "attente", running: "en cours", done: "fini", error: "ERREUR", incomplete: "INCOMPLET" };
const hhmm = (t) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Les lots : chaque socket du dossier (ou celle donnée), et le dernier état enregistré de ceux qui ne répondent pas. */
async function lots() {
  const socks = typeof opt("--socket") === "string" ? [opt("--socket")] : existsSync(dir) ? readdirSync(dir).filter((n) => /^\.prerender(-[\w.]+)?\.sock$/.test(n)).map((n) => path.join(dir, n)) : [];
  const out = [], seen = new Set();
  for (const s of socks) { try { const S = await ask(s); S.live = true; out.push(S); seen.add(S.tag || ""); } catch { /* socket restée d'un rendu arrêté */ } }
  if (existsSync(dir)) for (const n of readdirSync(dir).filter((x) => /^\.prerender(-[\w.]+)?\.status\.json$/.test(x))) {
    const S = JSON.parse(readFileSync(path.join(dir, n), "utf8")); if (seen.has(S.tag || "")) continue;
    let alive = false; try { process.kill(S.pid, 0); alive = true; } catch { /* fini */ }
    S.live = false; S.alive = alive; out.push(S);
  }
  // un ancien rendu sans lot, terminé, n'a rien à faire dans le récapitulatif d'un rendu en lots en cours
  return out.some((S) => S.live) ? out.filter((S) => S.live || S.alive || (S.tag && S.phase !== "done") || out.every((x) => !x.live)) : out;
}

function show(L) {
  const now = Math.max(...L.map((S) => S.now)), tabs = {};
  for (const S of L) for (const [k, t] of Object.entries(S.tabs)) {
    if (!t.videos) continue;
    const a = (tabs[k] ??= { state: t.state, videos: 0, todo: 0, done: 0, skipped: 0, framesTodo: 0, framesDone: 0, ms: 0, bytes: 0, seconds: 0 });
    for (const f of ["videos", "todo", "done", "skipped", "framesTodo", "framesDone", "ms", "bytes", "seconds"]) a[f] += t[f];
    if (["running", "error", "incomplete"].includes(t.state)) a.state = t.state;
  }
  const T = Object.entries(tabs).sort(([a], [b]) => a.localeCompare(b));
  const tot = T.reduce((s, [, t]) => ({ todo: s.todo + t.todo, done: s.done + t.done, skip: s.skip + t.skipped, fT: s.fT + t.framesTodo, fD: s.fD + t.framesDone, ms: s.ms + t.ms, b: s.b + t.bytes, sec: s.sec + t.seconds }), { todo: 0, done: 0, skip: 0, fT: 0, fD: 0, ms: 0, b: 0, sec: 0 });
  const started = Math.min(...L.map((S) => S.started)), rStarted = Math.min(...L.map((S) => S.renderStarted || S.started));
  const allDone = L.every((S) => S.phase === "done"), planning = L.some((S) => S.phase === "plan");
  const out = [];
  out.push(`Rendu des vidéos de cartes — ${L.length} lot(s), ${dir}, lancé il y a ${dur(now - started)}${planning ? " · planification en cours" : allDone ? ` · TERMINÉ en ${dur(Math.max(...L.map((S) => S.finished || S.now)) - started)}` : ""}`);
  const row = (a) => a.map((x, i) => (i > 1 ? String(x).padStart([0, 0, 11, 6, 10, 10, 13][i]) : String(x).padEnd(i ? 9 : 8))).join(" ");
  out.push(row(["onglet", "état", "vidéos", "%", "temps", "taille", "durée vidéo"]));
  for (const [k, t] of T) out.push(row([k, STATE[t.state] || t.state, `${t.done}/${t.todo}${t.skipped ? `+${t.skipped}` : ""}`, pct(t.framesDone, t.framesTodo), t.ms ? dur(t.ms) : "", t.bytes ? mo(t.bytes) : "", t.seconds ? vlen(t.seconds) : ""]));
  out.push(row(["total", "", `${tot.done}/${tot.todo}`, pct(tot.fD, tot.fT), dur(tot.ms), mo(tot.b), vlen(tot.sec)]));
  if (tot.skip) out.push(`(+n : vidéos déjà à jour, sautées : ${tot.skip})`);
  if (!allDone && !planning && tot.fD) {
    const el = now - rStarted, rest = (el / tot.fD) * (tot.fT - tot.fD);
    out.push(`reste ≈ ${dur(rest)} (fin vers ${hhmm(now + rest)}), au rythme moyen de ${(tot.fD / (el / 1000)).toFixed(1)} images/s, tous lots ensemble`);
  }
  for (const S of L) {
    const who = `lot ${S.tag || "(unique)"} · PID ${S.pid}`;
    if (!S.live) out.push(`${who} : ${S.phase === "done" ? "terminé" : S.alive ? "ne répond pas (vivant)" : "arrêté"}, état du ${new Date(S.now).toLocaleString("fr-FR")}`);
    else if (S.current?.key) out.push(`${who} : ${S.current.key}, image ${S.current.frame}/${S.current.frames} (${S.current.w}×${S.current.h})`);
    else out.push(`${who} : ${S.phase === "plan" ? "planification" : S.phase}`);
  }
  return out.join("\n");
}

async function once() {
  const L = await lots();
  if (!L.length) { console.log(`aucun rendu trouvé dans ${dir} (ni socket ni état enregistré)`); return false; }
  console.log(opt("--json") ? JSON.stringify(L, null, 1) : show(L));
  return L.some((S) => S.live && S.phase !== "done");
}
if (watch) { for (;;) { process.stdout.write("\x1b[2J\x1b[H"); if (!(await once())) break; await new Promise((r) => setTimeout(r, every * 1000)); } }
else await once();
