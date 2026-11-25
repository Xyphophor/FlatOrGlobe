// Figure 1 (epic14) : ce que veut dire « voler à niveau ». Un avion de ligne
// fait le tour d'une Terre dessinée PLUS PETITE (règle 1 : R/ex à échelle
// uniforme, ex imprimé) pour que l'altitude se voie. L'avion bleu garde son
// altitude : son nez tourne par rapport aux étoiles exactement de l'arc
// parcouru, et son horizon artificiel (asservi à la verticale) reste à 0.
// Le fantôme gris a le nez bloqué par rapport aux étoiles : il s'en va le long
// de la tangente. Toutes les deux heures de vol, le fantôme repart de l'avion.
// 2026-10-01 (propriétaire : « on a l'impression que l'avion lutte pour ne pas
// aller dans l'espace ; fais un parallèle avec un objet tenu par une corde ») :
// un panneau « pierre sur une corde » tourne en même temps (un tour en 6 s) ;
// tous les 45°, une pierre grise part tout droit comme si la corde était coupée. Côté avion, la corde est
// dessinée : la gravité, du centre de la Terre à l'avion.
import { setupCanvas } from "../../core/canvas.js";
import { levelFlight, R_KM } from "./logic.js";
import { CRUISE } from "../../data/presets/avia.js";
import { colors, label, wrapLabel, dot, plane, makeLoop } from "./draw.js";
import { num } from "../curv/fmt.js";

const MIN_PER_FRAME = 0.5;           // 60 cadres/s -> 30 min de vol par seconde
const SLING_S = 6;                   // la pierre fait un tour en 6 s d'animation (12 h de vol)
const CUT = Math.PI / 4;             // une pierre grise « corde coupée » repart tous les 45° : elle reste dans son cadre
const GHOST_MIN = 120;               // le fantôme (et la pierre grise) repart toutes les deux heures de vol : 16°, assez pour le voir s'écarter
const ROPE = "#f5b301";

/** Horizon artificiel : assiette p (degrés, + = nez haut), rayon r. */
export function drawAI(ctx, x, y, r, p, globe, title) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.clip();
  const off = Math.max(-1.5 * r, Math.min(1.5 * r, (p / 20) * r));       // 20° = un rayon
  ctx.fillStyle = "#7fb4de"; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.fillStyle = "#a07b4f"; ctx.fillRect(x - r, y + off, 2 * r, 2 * r);
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x - r, y + off); ctx.lineTo(x + r, y + off); ctx.stroke();
  ctx.lineWidth = 0.8;
  for (const d of [-10, 10]) { const yy = y + off - (d / 20) * r; ctx.beginPath(); ctx.moveTo(x - r * 0.25, yy); ctx.lineTo(x + r * 0.25, yy); ctx.stroke(); }
  ctx.restore();
  // maquette fixe
  ctx.strokeStyle = "#f5b301"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x - r * 0.6, y); ctx.lineTo(x - r * 0.2, y); ctx.lineTo(x - r * 0.1, y + r * 0.1);
  ctx.moveTo(x + r * 0.6, y); ctx.lineTo(x + r * 0.2, y); ctx.lineTo(x + r * 0.1, y + r * 0.1); ctx.stroke();
  dot(ctx, x, y, 2.2, "#f5b301");
  ctx.strokeStyle = globe; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke();
  if (title) label(ctx, title, x, y + r + 12, { al: "center", font: "11px system-ui, sans-serif" });
}

export function mountLevel(root, tr) {
  const cv = root.querySelector("#aviaLevel"), btn = root.querySelector("#aviaLevelPlay");
  const f = levelFlight(CRUISE.v, CRUISE.h);
  const st = { tMin: 0, ghost: 0 };       // minutes de vol ; minute de départ du fantôme
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe } = colors(cv);
    ctx.fillStyle = "#0e1726"; ctx.fillRect(0, 0, W, H);
    // étoiles fixes (repère inertiel)
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 70; i++) ctx.fillRect((i * 97.3) % W, (i * 53.7) % H, 1.2, 1.2);
    const wide = W > 520;
    const cx = wide ? W * 0.45 : W * 0.5, cy = wide ? H * 0.52 : H * 0.38;
    const Rpx = Math.min(wide ? W * 0.22 : W * 0.32, H * (wide ? 0.34 : 0.22));
    const hpx = 16, ex = (hpx / Rpx) * (R_KM / (CRUISE.h / 1000));          // Terre dessinée ex fois plus petite
    const ro = Rpx + hpx;
    ctx.fillStyle = "#1d4f61"; ctx.beginPath(); ctx.arc(cx, cy, Rpx, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = globe; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); ctx.setLineDash([2, 4]); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, ro, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
    // l'avion à niveau : angle = arc parcouru (sens horaire depuis le haut)
    const th = f.w * st.tMin * 60;                       // radians parcourus
    const ang = -Math.PI / 2 + th;
    const px = cx + ro * Math.cos(ang), py = cy + ro * Math.sin(ang);
    // la corde de l'avion : la gravité, du centre de la Terre à l'avion
    ctx.save(); ctx.strokeStyle = ROPE; ctx.lineWidth = 1.6; ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.restore();
    dot(ctx, cx, cy, 2.5, ROPE);
    const mx = cx + 0.5 * ro * Math.cos(ang), my = cy + 0.5 * ro * Math.sin(ang);
    label(ctx, tr("lv-rope", "gravity = the rope"), mx + (Math.cos(ang) >= 0 ? 6 : -6), my, { al: Math.cos(ang) >= 0 ? "left" : "right", col: ROPE, font: "600 11px system-ui, sans-serif" });
    // fantôme : nez figé au départ, ligne droite (tangente) à la même vitesse
    const g0 = f.w * st.ghost * 60, ga = -Math.PI / 2 + g0;
    const gx0 = cx + ro * Math.cos(ga), gy0 = cy + ro * Math.sin(ga);
    const dir = ga + Math.PI / 2;                         // tangente, sens du vol
    const dth = th - g0;                                   // même vitesse : même longueur, en ligne droite
    const gx = gx0 + Math.cos(dir) * ro * dth, gy = gy0 + Math.sin(dir) * ro * dth;
    ctx.save(); ctx.strokeStyle = "rgba(200,200,210,0.6)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx, gy); ctx.stroke(); ctx.restore();
    plane(ctx, gx, gy, dir, "rgba(210,214,222,0.9)", 1);
    // flèche « nez au départ » (fixe par rapport aux étoiles) à côté de l'avion à niveau
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 34 * Math.cos(dir), py + 34 * Math.sin(dir)); ctx.stroke(); ctx.restore();
    plane(ctx, px, py, ang + Math.PI / 2, "#7fe3d4", 1.15);

    // la pierre sur une corde : un tour en SLING_S secondes, une pierre grise « corde coupée » tous les 45°
    const sx = wide ? W * 0.13 : W * 0.2, sy = wide ? H * 0.6 : H * 0.78, rs = wide ? Math.min(W * 0.075, H * 0.15) : Math.min(W * 0.08, 30);
    const pad = wide ? 12 : 8, bx0 = sx - rs - pad - 6, bw = 2 * (rs + pad + 6), by0 = sy - rs - pad, bh = 2 * (rs + pad);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1; ctx.strokeRect(bx0, by0, bw, bh);
    ctx.beginPath(); ctx.rect(bx0, by0, bw, bh); ctx.clip();
    ctx.setLineDash([2, 4]); ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.arc(sx, sy, rs, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    const turn = 2 * Math.PI * (st.tMin / (60 * MIN_PER_FRAME)) / SLING_S;      // angle parcouru par la pierre (st.tMin/30 = secondes d'animation)
    const sa = -Math.PI / 2 + turn, rel = Math.floor(turn / CUT) * CUT, sgA = -Math.PI / 2 + rel;
    const bx = sx + rs * Math.cos(sa), byy = sy + rs * Math.sin(sa);
    const gbx0 = sx + rs * Math.cos(sgA), gby0 = sy + rs * Math.sin(sgA), sdir = sgA + Math.PI / 2, sl = rs * (turn - rel);
    ctx.strokeStyle = "rgba(200,200,210,0.6)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(gbx0, gby0); ctx.lineTo(gbx0 + Math.cos(sdir) * sl, gby0 + Math.sin(sdir) * sl); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, gbx0 + Math.cos(sdir) * sl, gby0 + Math.sin(sdir) * sl, 4.5, "rgba(210,214,222,0.9)");
    ctx.strokeStyle = ROPE; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, byy); ctx.stroke();
    dot(ctx, sx, sy, 4, "#e8edf2");
    dot(ctx, bx, byy, 5.5, "#7fe3d4");
    ctx.restore();
    wrapLabel(ctx, tr("lv-sling", "a stone on a rope"), bx0, by0 - 6, wide ? W * 0.26 : W * 0.45, { bl: "bottom", col: "#e8edf2", font: "600 11px system-ui, sans-serif", lh: 13 });
    wrapLabel(ctx, tr("lv-sling2", "grey: the rope cut, it goes straight on"), bx0, by0 + bh + 13, wide ? W * 0.26 : W * 0.4, { col: "#c7ccd4", font: "10px system-ui, sans-serif", lh: 12 });

    // lectures
    // vrais nombres du fantôme : s = v·t en ligne droite depuis R + h
    const Rh = 6371000 + CRUISE.h, sM = CRUISE.v * (st.tMin - st.ghost) * 60;
    const pitchHeld = 0, pitchGhost = Math.atan(sM / Rh) * 180 / Math.PI;
    const riseM = Math.hypot(Rh, sM) - Rh;
    const climbFpm = CRUISE.v * Math.sin(Math.atan(sM / Rh)) / 0.3048 * 60;
    const hrs = st.tMin / 60, dist = CRUISE.v * st.tMin * 60 / 1000;
    const ax = wide ? W * 0.84 : W * 0.6, ay = wide ? H * 0.3 : H * 0.78, r = wide ? Math.min(34, W * 0.07) : Math.min(24, W * 0.065);
    drawAI(ctx, ax, ay, r, pitchHeld, globe, null);
    const bx2 = wide ? W * 0.84 : W * 0.86, by2 = wide ? H * 0.68 : H * 0.78;
    drawAI(ctx, bx2, by2, r, pitchGhost, "#c7ccd4", null);
    const aiW = wide ? W * 0.28 : W * 0.25;
    wrapLabel(ctx, tr("lv-ai1", "altitude held"), ax, ay + r + 12, aiW, { col: "#e8edf2", font: "10px system-ui, sans-serif", lh: 12, al: "center" });
    wrapLabel(ctx, tr("lv-ai2", "nose locked to the stars"), bx2, by2 + r + 12, aiW, { col: "#c7ccd4", font: "10px system-ui, sans-serif", lh: 12, al: "center" });
    const L = (t, x, y, c = "#e8edf2") => label(ctx, t, x, y, { col: c, font: "11px system-ui, sans-serif" });
    const tx = 10;
    L(`${tr("lv-t", "flight time")} ${num(hrs, 1)} h · ${num(dist)} km · ${num(CRUISE.v * 3.6)} km/h`, tx, 14);
    L(`${tr("lv-nose", "nose turned against the stars")}: ${num(th * 180 / Math.PI, 1)}° (${num(f.degPerMin, 3)}°/min)`, tx, 30, "#7fe3d4");
    L(`${tr("lv-ghost", "locked nose, after")} ${num((st.tMin - st.ghost), 0)} min: +${num(riseM)} m, ${num(climbFpm)} ft/min`, tx, 46, "#c7ccd4");
    wrapLabel(ctx, `${tr("lv-scale", "Earth drawn")} ×${num(ex)} ${tr("lv-scale2", "smaller than the altitude (R/ex, uniform scale); numbers are the real ones")}`,
      8, H - 8, W - 16, { col: "#9aa6b4", font: "10px system-ui, sans-serif", bl: "bottom", lh: 12 });
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.tMin += n * MIN_PER_FRAME; if (st.tMin - st.ghost >= GHOST_MIN) st.ghost = st.tMin; if (st.tMin > 44.5 * 60) { st.tMin = 0; st.ghost = 0; } },
    draw, anim: { duration: 12, state: st, reset: () => { st.tMin = 0; st.ghost = 0; } },   // export : six heures de vol
  });
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
