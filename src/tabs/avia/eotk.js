// Figure 8b (epic16/UC01) : tester la correction que le NGS a injectée.
// rms(k) : écart entre lignes voisines de sens contraires quand on garde la
// fraction k de la correction du globe (logic.kScan). k = 0 est la Terre
// plate immobile (aucune correction à faire), k = 1 la correction du NGS.
// Échelle verticale LOGARITHMIQUE (1 à 10 000 mGal), imprimée ; le minimum est
// marqué, la verticale tiretée orange est k = 0. Les deux tuiles du haut sont
// calculées, jamais écrites.
import { setupCanvas } from "../../core/canvas.js";
import { eotData } from "./eot.js";
import { colors, label, wrapLabel, dot, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

export function mountEotK(root, tr) {
  const cv = root.querySelector("#aviaEotK");
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv);
    const K = eotData().kscan;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    // deux tuiles
    const tw = (W - 24) / 2, th = 46, ty = 8;
    const tile = (x, big, small, col) => {
      ctx.fillStyle = "#f3f5f7"; ctx.fillRect(x, ty, tw, th);
      label(ctx, big, x + 8, ty + 18, { col, font: "600 18px system-ui, sans-serif" });
      wrapLabel(ctx, small, x + 8, ty + 33, tw - 12, { col: SOFT, font: "10.5px system-ui, sans-serif" });
    };
    tile(8, `${num(K.spread0)} mGal`, tr("ek-t0", "Correction east vs west"), flat);
    tile(16 + tw, `${num(K.rms1, 1)} mGal`, tr("ek-t1", "Lines still disagree by"), globe);
    const x0 = 50, x1 = W - 14, y0 = ty + th + 22, y1 = H - 36;
    const lo = 0, hi = 4;   // log10 mGal : 1 à 10 000
    const X = (k) => x0 + k / 2 * (x1 - x0), Y = (r) => y1 - (Math.log10(Math.max(1, r)) - lo) / (hi - lo) * (y1 - y0);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (let e = 0; e <= 4; e++) { const y = Y(10 ** e); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); label(ctx, num(10 ** e), x0 - 4, y, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" }); }
    for (const k of [0, 0.5, 1, 1.5, 2]) { ctx.beginPath(); ctx.moveTo(X(k), y0); ctx.lineTo(X(k), y1); ctx.stroke(); label(ctx, num(k, 1), X(k), y1 + 11, { al: "center", col: SOFT, font: "9.5px system-ui, sans-serif" }); }
    label(ctx, tr("ek-y", "mGal, logarithmic scale"), 8, y0 - 10, { al: "left", col: SOFT, font: "9.5px system-ui, sans-serif" });
    label(ctx, tr("ek-x", "fraction of globe rotation kept"), x1, y1 + 24, { al: "right", col: SOFT, font: "9.5px system-ui, sans-serif" });
    // k = 0 : plat, immobile
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = flat; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y1); ctx.stroke(); ctx.restore();
    label(ctx, tr("ek-flat", "flat, still"), X(0) + 5, y0 + 8, { col: flat, font: "600 10.5px system-ui, sans-serif", halo: true });
    ctx.strokeStyle = globe; ctx.lineWidth = 2; ctx.beginPath();
    K.curve.forEach(([k, r], i) => (i ? ctx.lineTo(X(k), Y(r)) : ctx.moveTo(X(k), Y(r))));
    ctx.stroke();
    dot(ctx, X(K.kStar), Y(K.rmsStar), 4.5, globe);
    label(ctx, `${tr("ek-min", "minimum")}: k = ${num(K.kStar, 4)} ± ${num(K.seK, 4)}`, X(K.kStar) + 8, Y(K.rmsStar) - 12, { col: globe, font: "600 10.5px system-ui, sans-serif", halo: true });
    label(ctx, `${num(K.rmsStar, 1)} mGal rms`, X(K.kStar) + 8, Y(K.rmsStar) - 1, { col: SOFT, font: "10px system-ui, sans-serif", halo: true });
  };
  return { draw, start() {}, stop() {} };
}
