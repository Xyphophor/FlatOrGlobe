// Figure 4 (epic14) : une centrale inertielle d'avion de ligne est
// programmée pour un globe -- elle incline son « niveau » de v/R en vol,
// d'où ses erreurs bornées de période 84,4 min (Schuler). Montée dans un
// avion qui volerait en ligne droite sur un PLAN, les mêmes équations
// feraient osciller la position calculée à ±v/ω du départ (logic.irsOnPlane) :
// après une heure, elle se tromperait de plus de mille kilomètres, contre
// 2 NM/h (3,7 km/h) exigés. Temps accéléré : 1 s = 5 min, boucle de 3 h.
import { setupCanvas } from "../../core/canvas.js";
import { irsOnPlane, schulerPeriod } from "./logic.js";
import { CRUISE } from "../../data/presets/avia.js";
import { colors, label, dot, plane, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

const T_END = 3 * 3600, S_PER_FRAME = 5;       // 5 s de vol par cadre à 60 Hz = 5 min par seconde
const NM2H = 2 * 1852;                          // 2 NM/h, en mètres par heure

export function mountSchuler(root, tr) {
  const cv = root.querySelector("#aviaSchuler"), btn = root.querySelector("#aviaSchulerPlay");
  const st = { t: 0 };
  const v = CRUISE.v, Ts = schulerPeriod();
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const tt = Math.min(st.t, T_END);
    const { globe, flat } = colors(cv);
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const x0 = 36, x1 = W - 16, kmMax = v * T_END / 1000, sx = (x1 - x0) / kmMax;
    // piste : départ, vraie position, position calculée
    const yT = H * 0.2;
    ctx.strokeStyle = "#c9ced6"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(x1, yT); ctx.stroke();
    for (let km = 0; km <= kmMax; km += 500) { const x = x0 + km * sx; ctx.beginPath(); ctx.moveTo(x, yT - 3); ctx.lineTo(x, yT + 3); ctx.stroke(); label(ctx, `${num(km)}`, x, yT + 12, { al: "center", col: SOFT, font: "9.5px system-ui, sans-serif" }); }
    label(ctx, "km", x1, yT + 24, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    const r = irsOnPlane(v, tt);
    const xs = x0 + (r.x / 1000) * sx, xc = x0 + (r.xc / 1000) * sx;
    // bande ±v/ω autour du départ : tout ce que la centrale croirait possible
    ctx.fillStyle = "rgba(180,83,9,0.10)"; ctx.fillRect(x0 - r.amp / 1000 * sx, yT - 12, 2 * r.amp / 1000 * sx, 24);
    dot(ctx, x0, yT, 4, INK);
    plane(ctx, xs, yT, 0, INK, 1.1);
    ctx.strokeStyle = flat; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xc, yT, 7, 0, 2 * Math.PI); ctx.stroke();
    label(ctx, tr("sc-true", "true position"), xs, yT - 16, { al: "center", col: INK });
    label(ctx, tr("sc-irs", "computed by a globe-programmed unit"), Math.max(xc, x0 + 4), yT - 30, { col: flat, al: "left" });
    // courbe d'erreur
    const cy0 = H * 0.45, cy1 = H - 26, errMax = irsOnPlane(v, T_END).err;
    const ey = (e) => cy1 - (e / errMax) * (cy1 - cy0);
    const tx = (t) => x0 + (t / T_END) * (x1 - x0);
    ctx.strokeStyle = "#dfe3e8"; ctx.lineWidth = 1;
    for (let h = 0; h <= 3; h++) { ctx.beginPath(); ctx.moveTo(tx(h * 3600), cy0); ctx.lineTo(tx(h * 3600), cy1); ctx.stroke(); label(ctx, `${h} h`, tx(h * 3600), cy1 + 11, { al: "center", col: SOFT, font: "9.5px system-ui, sans-serif" }); }
    ctx.beginPath(); ctx.moveTo(x0, cy1); ctx.lineTo(x1, cy1); ctx.stroke();
    ctx.strokeStyle = flat; ctx.lineWidth = 2; ctx.beginPath();
    for (let t = 0; t <= tt; t += 60) { const e = irsOnPlane(v, t).err; t ? ctx.lineTo(tx(t), ey(e)) : ctx.moveTo(tx(t), ey(e)); }
    ctx.stroke();
    // limite certifiée : 2 NM par heure (invisible à cette échelle : une ligne sur l'axe)
    ctx.strokeStyle = globe; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, cy1); ctx.lineTo(tx(tt), ey(NM2H * tt / 3600)); ctx.stroke();
    label(ctx, `${tr("sc-err", "position error")}: ${num(r.err / 1000)} km`, tx(Math.min(tt, T_END * 0.55)) + 6, ey(r.err) - 8, { col: flat, halo: true });
    label(ctx, `${tr("sc-cert", "allowed for a real unit, 2 NM/h")}: ${num(NM2H * tt / 3600 / 1000, 1)} km`, x0 + 4, cy1 - 10, { col: globe, halo: true });
    label(ctx, `${num(tt / 60)} min · ${tr("sc-per", "Schuler period")} 2π√(R/g) = ${num(Ts / 60, 1)} min · ${tr("sc-amp", "swing")} ±${num(r.amp / 1000)} km`, 8, 12, { col: SOFT, font: W < 480 ? "10px system-ui, sans-serif" : "11px system-ui, sans-serif" });
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.t += n * S_PER_FRAME; if (st.t > T_END + 600) st.t = 0; }, draw,
    anim: { duration: T_END / S_PER_FRAME / 60, state: st, reset: () => { st.t = 0; } },
  });
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
