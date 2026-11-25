// Figure 8a (epic14, demande du propriétaire du 2026-09-30 : « l'animation des
// stats d'Eötvös est très bien mais peu accessible pour un platiste ; il faut
// un petit truc simple »). La même donnée que eot.js (NOAA GRAV-D, bloc EN02),
// dite avec une balance : un passager de 70 kg, une barre par ligne du levé,
// en grammes. Deux afficheurs de pèse-personne (moyenne des lignes vers l'est,
// vers l'ouest) ; les barres tombent une à une, du sud au nord, et les
// afficheurs suivent. Tiret noir : la formule du globe pour la vitesse de la
// ligne ; tirets orange : un modèle plat (la même lecture partout, 0 g).
import { setupCanvas } from "../../core/canvas.js";
import { grams } from "./logic.js";
import { eotData } from "./eot.js";
import { colors, label, wrapLabel, plane, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

const EAST = "#1d4ed8", WEST = "#6d28d9", KG = 70;

/** Afficheur de pèse-personne : cadre, flèche de cap, lecture en kg. */
function scaleFace(ctx, x, y, w, h, { east, kg, text }) {
  const col = east ? EAST : WEST;
  ctx.save();
  ctx.fillStyle = "#eef1f5"; ctx.strokeStyle = col; ctx.lineWidth = 1.6;
  const rr = (a, b, c, d, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(a, b, c, d, r) : ctx.rect(a, b, c, d); };
  rr(x, y, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#1c2733"; rr(x + 10, y + 24, w - 20, h - 34, 5); ctx.fill();
  ctx.restore();
  plane(ctx, east ? x + w - 18 : x + 18, y + 13, east ? 0 : Math.PI, col, 0.9);
  label(ctx, text, east ? x + 10 : x + 32, y + 13, { col, font: "600 11px system-ui, sans-serif" });
  label(ctx, `${num(kg, 2)} kg`, x + w / 2, y + 24 + (h - 34) / 2, { al: "center", col: "#7ef0c8", font: "600 20px ui-monospace, monospace" });
}

export function mountEotScale(root, tr) {
  const cv = root.querySelector("#aviaEotScale"), btn = root.querySelector("#aviaEotScalePlay");
  const st = { k: 0 };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { flat } = colors(cv);
    const D = eotData(), S = D.weights, L = S.lines;   // du sud au nord (gravdPairs trie par latitude)
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W > 520, n = Math.min(L.length, Math.floor(st.k));
    // titre
    const nt = wrapLabel(ctx, tr("sc-title", "A 70 kg passenger on a bathroom scale, in the survey aircraft"), 8, 12, W - 16, { col: INK, font: "600 12px system-ui, sans-serif", lh: 15 });
    // afficheurs : moyenne des lignes déjà tombées, dans chaque sens
    const shown = L.slice(0, n), avg = (east) => { const g = shown.filter((l) => l.east === east); return g.length ? g.reduce((p, l) => p + l.meas, 0) / g.length : 0; };
    const fw = wide ? W * 0.3 : (W - 26) / 2, fh = 66;
    const fy = 12 + nt * 15;
    const fx = [8, wide ? 8 : 18 + fw], fyy = [fy, wide ? fy + fh + 12 : fy];
    scaleFace(ctx, fx[0], fyy[0], fw, fh, { east: true, kg: KG + grams(avg(true), KG) / 1000, text: tr("sc-east", "flying east") });
    scaleFace(ctx, fx[1], fyy[1], fw, fh, { east: false, kg: KG + grams(avg(false), KG) / 1000, text: tr("sc-west", "flying west") });
    const gap = grams(avg(false), KG) - grams(avg(true), KG);
    const ty = wide ? fyy[1] + fh + 18 : fy + fh + 14, tw = wide ? fw : W - 16;
    let ny = wrapLabel(ctx, `${tr("sc-gap", "gap")}: ${num(gap)} g · ${tr("sc-globe", "globe formula")}: ${num(grams(S.gapPred, KG))} g · ${tr("sc-flat", "flat Earth")}: 0 g`, 8, ty, tw, { col: SOFT, font: "11px system-ui, sans-serif" });
    if (wide) wrapLabel(ctx, tr("sc-zero", "70.00 kg: the average of all the lines"), 8, ty + ny * 13 + 4, tw, { col: SOFT, font: "10px system-ui, sans-serif" });
    // barres : une par ligne, en grammes
    const bx0 = wide ? W * 0.3 + 58 : 44, bx1 = W - 10, by0 = wide ? fy + 4 : ty + ny * 13 + 14, by1 = H - 38;
    const gMax = 150, Y = (g) => (by0 + by1) / 2 - g / gMax * (by1 - by0) / 2;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (let g = -150; g <= 150; g += 50) {
      ctx.beginPath(); ctx.moveTo(bx0, Y(g)); ctx.lineTo(bx1, Y(g)); ctx.stroke();
      label(ctx, `${g > 0 ? "+" : g < 0 ? "−" : ""}${num(Math.abs(g))} g`, bx0 - 4, Y(g), { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    }
    label(ctx, tr("sc-heavier", "heavier ↑"), bx0 + 2, Y(gMax) + 8, { col: SOFT, font: "9.5px system-ui, sans-serif" });
    label(ctx, tr("sc-lighter", "lighter ↓"), bx0 + 2, Y(-gMax) - 8, { col: SOFT, font: "9.5px system-ui, sans-serif" });
    const step = (bx1 - bx0) / L.length, bw = Math.max(2, step * 0.62);
    for (let i = 0; i < n; i++) {
      const l = L[i], x = bx0 + (i + 0.5) * step, g = grams(l.meas, KG), p = grams(l.pred, KG);
      ctx.fillStyle = l.east ? EAST : WEST; ctx.globalAlpha = 0.8;
      ctx.fillRect(x - bw / 2, Math.min(Y(0), Y(g)), bw, Math.abs(Y(g) - Y(0)));
      ctx.globalAlpha = 1; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - bw / 2 - 2, Y(p)); ctx.lineTo(x + bw / 2 + 2, Y(p)); ctx.stroke();
    }
    if (n < L.length && n >= 0) plane(ctx, bx0 + (n + 0.5) * step, L[n].east ? Y(-gMax) + 22 : Y(gMax) - 22, L[n].east ? 0 : Math.PI, L[n].east ? EAST : WEST, 0.9);
    ctx.save(); ctx.strokeStyle = flat; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(bx0, Y(0)); ctx.lineTo(bx1, Y(0)); ctx.stroke(); ctx.restore();
    label(ctx, tr("sc-flatline", "flat Earth: the same on every line"), bx1, Y(0) - 8, { al: "right", col: flat, font: "600 10px system-ui, sans-serif", halo: true });
    label(ctx, `← S`, bx0, by1 + 10, { col: SOFT, font: "9.5px system-ui, sans-serif" });
    label(ctx, tr("sc-lines", "one bar per survey line"), (bx0 + bx1) / 2, by1 + 10, { al: "center", col: SOFT, font: "9.5px system-ui, sans-serif" });
    label(ctx, `N →`, bx1, by1 + 10, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    const leg = [[`■ ${tr("eo-east", "flown east")}`, EAST], [`■ ${tr("eo-west", "flown west")}`, WEST], [`▬ ${tr("sc-pred", "globe formula")}`, INK]];
    ctx.font = "10px system-ui, sans-serif";
    let lx = wide ? bx0 : 8;
    for (const [t, c] of leg) { label(ctx, t, lx, by1 + 26, { col: c, font: "10px system-ui, sans-serif" }); lx += ctx.measureText(t).width + 14; }
  };
  const total = () => eotData().weights.lines.length;
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.k += n * 0.04; if (st.k > total() + 5) st.k = 0; }, draw,
    anim: { duration: () => (total() + 3) / 0.04 / 60, state: st, reset: () => { st.k = 0; } },
  });
  // sans animation (préférence « réduire les animations »), tout est affiché
  if (!loop.playing) st.k = 1e9;
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
