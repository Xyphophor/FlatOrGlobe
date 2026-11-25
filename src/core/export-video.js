// Export d'une animation (epic10/UC03) : une boucle complète, aux réglages
// courants, rendue IMAGE PAR IMAGE via le contrat anim = { duration, frameAt(t) }
// (UC02) -- jamais une capture en temps réel, qui saccaderait sur une machine
// lente. MP4 par WebCodecs + mp4-muxer (H.264, sinon VP9) ; à défaut de
// WebCodecs, WebM par MediaRecorder. GIF par gifenc (256 couleurs : les
// dégradés sont tramés -- dit dans le menu). Modules chargés à la demande.
import { layout, drawBlock, drawCredit, drawReadout, readoutOf, readoutHeight, fileName, save, mediaOf, holdRenderScale } from "./export.js";
import { setExportBusy } from "./motion.js";

const PAPER = "#fbfaf7";

function blockSize(block) {
  const rects = mediaOf(block).map((m) => m.getBoundingClientRect());
  return [Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left)),
          Math.max(...rects.map((r) => r.bottom)) - Math.min(...rects.map((r) => r.top))];
}

/** Géométrie : la sortie vidéo/GIF, bornée (GIF ≤ 720 px de large ; MP4 dans 1920 × 1080 ou 1080 × 1920), dimensions paires. */
// 2026-10-24 : au-delà de 1080 px de petit côté, H.264 passe au niveau 5 et X refuse la vidéo (dip/mlo, contrib)
export function videoLayout(format, bw, bh, kind, roH) {
  const L = layout(format, bw, bh, roH);
  const s0 = kind === "gif" ? 720 / L.W : Math.min(1920 / Math.max(L.W, L.H), 1080 / Math.min(L.W, L.H));
  if (s0 >= 1 && L.W % 2 === 0 && L.H % 2 === 0) return L;
  // paires même sans réduction : le format paysage fait 1200 × 675, et H.264 refuse une hauteur impaire
  const s = Math.min(1, s0), even = (v) => Math.round(v * s / 2) * 2;
  return { W: even(L.W), H: even(L.H), fig: { x: L.fig.x * s, y: L.fig.y * s, w: L.fig.w * s, h: L.fig.h * s }, band: { y: L.band.y * s, h: L.band.h * s },
    ro: { x: L.ro.x * s, y: L.ro.y * s, w: L.ro.w * s, h: L.ro.h * s } };
}

/** Instants des images : n = durée × cadence, t = i / cadence. */
export function frameTimes(duration, fps) {
  const n = Math.max(1, Math.round(duration * fps));
  return Array.from({ length: n }, (_, i) => i / fps);
}

// `paint(ctx, t)` dessine une image complète à l'instant t (figure seule, ou carte, epic11)
// readBack : le GIF relit chaque image (getImageData) ; le MP4 non, son canvas peut rester accéléré
async function renderFrames(anim, L, paint, fps, eachFrame, onProgress, readBack = true) {
  const out = document.createElement("canvas"); out.width = L.W; out.height = L.H;
  const ctx = out.getContext("2d", readBack ? { willReadFrequently: true } : {});
  const times = frameTimes(Math.min(anim.duration, 60), fps);
  anim.begin?.();
  setExportBusy(true); holdRenderScale(true);   // les boucles de la page ne repartent pas, le canvas garde sa définition
  try {
    for (let i = 0; i < times.length; i++) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, L.W, L.H);
      await paint(ctx, times[i]);
      await eachFrame(out, ctx, i, times.length);
      onProgress?.((i + 1) / times.length);
    }
  } finally { holdRenderScale(false); setExportBusy(false); anim.end?.(); }
  return times.length;
}

// Un encodeur réellement essayé : isConfigSupported peut répondre « oui » et
// l'encodage échouer ensuite (Firefox sans le greffon OpenH264, par exemple :
// « The given encoding is not supported »). On configure et on encode une image.
async function encoderWorks(cfg) {
  try { if (!(await VideoEncoder.isConfigSupported(cfg)).supported) return false; } catch { return false; }
  let bad = false;
  const enc = new VideoEncoder({ output: () => {}, error: () => { bad = true; } });
  try {
    enc.configure(cfg);
    const c = document.createElement("canvas"); c.width = cfg.width; c.height = cfg.height;
    const vf = new VideoFrame(c, { timestamp: 0 }); enc.encode(vf, { keyFrame: true }); vf.close();
    await enc.flush();
    return !bad;
  } catch { return false; } finally { try { enc.close(); } catch { /* déjà fermé */ } }
}

async function mp4(anim, L, paint, onProgress) {
  const fps = 30;
  if (typeof VideoEncoder === "undefined") return webm(anim, L, paint, onProgress);
  // H.264 d'abord (ce que les réseaux attendent), puis VP9 et AV1 (MP4 valides, moins bien acceptés)
  const cands = [["avc1.640028", "avc"], ["avc1.4d0028", "avc"], ["avc1.42001f", "avc"], ["vp09.00.10.08", "vp9"], ["av01.0.08M.08", "av1"]];
  let pick = null;
  for (const [codec, mux] of cands) {
    const cfg = { codec, width: L.W, height: L.H, bitrate: 6_000_000, framerate: fps };
    if (codec.startsWith("avc")) cfg.avc = { format: "avc" };
    if (await encoderWorks(cfg)) { pick = [cfg, mux]; break; }
  }
  if (!pick) return webm(anim, L, paint, onProgress);
  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: pick[1], width: L.W, height: L.H }, fastStart: "in-memory" });
  let failure = null, sent = 0, done = 0, wake = null;
  // contre-pression sur les images RÉELLEMENT encodées (2026-10-17, « rapide au début, ralentit vers 18 % ») : encodeQueueSize
  // ne compte que la file d'entrée, et un encodeur logiciel peut tout accepter puis garder des centaines d'images de 8 Mo dans
  // son propre tampon -- la mémoire monte jusqu'à faire swapper la machine. On attend la sortie de chaque morceau.
  const enc = new VideoEncoder({ output: (chunk, meta) => { muxer.addVideoChunk(chunk, meta); done++; wake?.(); }, error: (e) => { failure = e; wake?.(); } });
  enc.configure(pick[0]);
  let inflight = 4;                                    // grandit jusqu'à la profondeur d'anticipation de l'encodeur
  await renderFrames(anim, L, paint, fps, async (out, _ctx, i) => {
    if (failure) throw failure;
    const vf = new VideoFrame(out, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
    enc.encode(vf, { keyFrame: i % (fps * 2) === 0 }); vf.close(); sent++;
    // un encodeur qui anticipe ne rend rien avant d'avoir reçu sa profondeur d'anticipation : tant qu'AUCUN morceau n'est sorti,
    // la limite suit (plafond 64 images) ; ensuite elle ne bouge plus, et un encodeur lent fait attendre le dessin, pas la mémoire
    while (!failure && sent - done > inflight) {
      await new Promise((r) => { wake = r; setTimeout(r, 40); }); wake = null;
      if (done === 0 && enc.encodeQueueSize === 0 && sent < 64) { inflight = sent; break; }
    }
  }, onProgress, false);
  await enc.flush(); enc.close();
  if (failure) throw failure;
  muxer.finalize();
  return { blob: new Blob([target.buffer], { type: "video/mp4" }), ext: "mp4", codec: pick[1] };
}

// repli sans encodeur WebCodecs utilisable : MediaRecorder, en essayant chaque
// format pour de bon (un constructeur ou un start() qui refuse passe au suivant)
async function webm(anim, L, paint, onProgress) {
  const fps = 30, out = document.createElement("canvas"); out.width = L.W; out.height = L.H;
  const stream = out.captureStream(0), track = stream.getVideoTracks()[0];
  let rec = null, mime = null;
  for (const m of ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", ""]) {
    if (m && MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported(m)) continue;
    try { rec = new MediaRecorder(stream, m ? { mimeType: m, videoBitsPerSecond: 6_000_000 } : {}); rec.start(); mime = rec.mimeType || m || "video/webm"; break; }
    catch { rec = null; }
  }
  if (!rec) throw new Error("no video encoder in this browser");
  const parts = [];
  rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
  const done = new Promise((r) => (rec.onstop = r));
  const octx = out.getContext("2d");
  await renderFrames(anim, L, paint, fps, async (src) => {
    octx.drawImage(src, 0, 0); track.requestFrame?.();
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }, onProgress);
  rec.stop(); await done;
  const isMp4 = mime.startsWith("video/mp4");
  return { blob: new Blob(parts, { type: isMp4 ? "video/mp4" : "video/webm" }), ext: isMp4 ? "mp4" : "webm", codec: isMp4 ? "avc" : "webm" };
}

async function gif(anim, L, paint, onProgress) {
  // gifenc : exports nommés en ESM, sous « default » quand c'est la version CommonJS qui est servie
  const m = await import("gifenc"), G = m.GIFEncoder ? m : m.default;
  const { GIFEncoder, quantize, applyPalette } = G;
  const fps = 12, g = GIFEncoder();
  let palette = null;
  await renderFrames(anim, L, paint, fps, async (_out, ctx, i) => {
    const { data } = ctx.getImageData(0, 0, L.W, L.H);
    // la quantification (256 couleurs) est le plus lent : une palette par seconde d'animation suffit,
    // les figures changent peu de couleurs d'une image à l'autre (2026-10-07)
    if (!palette || i % fps === 0) palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    g.writeFrame(index, L.W, L.H, { palette, delay: Math.round(1000 / fps) });
    await new Promise((r) => setTimeout(r, 0));          // laisse respirer la page
  }, onProgress);
  g.finish();
  return { blob: new Blob([g.bytes()], { type: "image/gif" }), ext: "gif" };
}

/**
 * Encode une boucle de `anim` en MP4 (repli WebM) ou GIF ; L = { W, H } paires,
 * paint(ctx, t) dessine l'image entière. Renvoie { blob, ext, codec }.
 */
export async function encodeAnim(kind, anim, L, paint, onProgress) {
  return kind === "gif" ? gif(anim, L, paint, onProgress) : mp4(anim, L, paint, onProgress);
}

/** Note à afficher quand le MP4 n'est pas du H.264 (ou est un WebM). */
export function videoNote(kind, r) {
  return kind !== "gif" && r.codec !== "avc" ? { note: r.ext === "webm" ? "webm" : "notH264" } : {};
}

/** La mise en page et le dessin d'une image de l'export d'une figure animée (partagé avec le pré-rendu, scripts/prerender-cards.mjs). */
export function figureFrame(block, anim, { kind, format, info }) {
  const [bw, bh] = blockSize(block);
  const ro = readoutOf(block, anim);                     // bande réservée au-dessus du dessin, à la taille des lectures actuelles
  const L = { ...videoLayout(format, bw, bh, kind, (W, w) => readoutHeight(W, w, ro)), info };
  const paint = async (ctx, t) => {
    await drawBlock(ctx, block, L.fig, () => anim.frameAt(t));
    drawReadout(ctx, L.ro, L.W, readoutOf(block, anim));
    drawCredit(ctx, L.W, L.band, L.info);
  };
  return { L, paint };
}

export async function exportVideo(block, anim, { kind, format, info, figName, onProgress }) {
  const { L, paint } = figureFrame(block, anim, { kind, format, info });
  const r = await encodeAnim(kind, anim, L, paint, onProgress);
  save(r.blob, fileName(info.tab, figName, format, r.ext));
  // pas de H.264 dans ce navigateur : le dire, avec la façon d'obtenir un MP4 que les réseaux acceptent
  return videoNote(kind, r);
}
