// Rendu et encodage d'une carte animée (epic25) : tout ce qui décide des pixels et de l'encodage d'une vidéo.
// Le fichier compte dans l'empreinte des vidéos (prerender-fingerprint.mjs) : le modifier les périme toutes.
import { spawn } from "node:child_process";
import { frame } from "./prerender-env.mjs";
const MAXS = +(process.env.PRERENDER_MAX || 50);   // 50 s (propriétaire, 2026-11-21 ; avertissement au-delà de 45 s dans prerender-cards.mjs)

/** Rend la boucle de la carte à W×H (px de sortie) et pousse chaque image RGBA dans `sink` ; max : durée plafond (s). */
export async function frames(P, W, H, fps, sink, max = MAXS) {
  const n = Math.max(1, Math.round(Math.min(P.anim.duration, max) * fps));
  P.anim.begin?.();
  try {
    for (let i = 0; i < n; i++) {
      for (const cv of document.querySelectorAll("canvas")) cv._rec?.reset();
      const ctx = frame.ctx(W, H); ctx.scale(W / P.W, H / P.H);
      await P.paint(ctx, i / fps);
      await sink(frame.render(ctx, W, H));
    }
  } finally { P.anim.end?.(); }
  return n;
}
// x264 « veryfast » (2026-10-20, au lieu de medium) : 2 à 3 fois moins de calcul, un peu plus d'octets à qualité égale (crf 22) ;
// le cœur ainsi libéré sert à un second lot de rendu en parallèle. 2026-10-23 : crf 18 et une image clé par seconde
// (GOP fermé, ce que X exige) -- X ré-encode tout envoi, le détail des textes fins tient mieux d'une source plus riche
export function ffmpeg(W, H, fps, file) {
  const args = ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(fps), "-i", "-",
    "-threads", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-g", String(fps), "-x264-params", "rc-lookahead=10:sync-lookahead=0:threads=2:open-gop=0", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", file];
  const p = spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => { p.on("exit", (c) => (c ? rej(new Error(`ffmpeg ${c}`)) : res())); p.on("error", rej); });
  return { write: (px) => new Promise((r) => (p.stdin.write(px) ? r() : p.stdin.once("drain", r))), end: () => { p.stdin.end(); return done; } };
}
