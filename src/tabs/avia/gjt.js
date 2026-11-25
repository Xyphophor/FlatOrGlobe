// Figure 5 (epic14) : EI-GJT, 9 octobre 2018 (AAIB Bulletin 12/2019).
// Un accéléromètre de la centrale gauche se met à mentir (≈1,6 g vers
// l'avant) : la position calculée file vers le nord, passe à l'est du pôle et
// redescend de l'autre côté. Une centrale d'avion de ligne définit
// l'horizontale comme le plan tangent au globe À SA POSITION CALCULÉE : quand
// celle-ci est à un angle α de la vraie (mesuré au centre de la Terre),
// l'horizon artificiel affiché penche de α. La vitesse sol de la centrale est
// relevée sur la figure 3 du rapport (preset GJT) ; la trajectoire tracée est
// un décor (grand cercle vers le nord depuis le golfe de Gascogne).
import { setupCanvas } from "../../core/canvas.js";
import { gjtArc, destPoint, bearingGC, R_M } from "./logic.js";
import { GJT } from "../../data/presets/avia.js";
import { colors, label, wrapLabel, dot, orthoGlobe, strokeGlobe, makeLoop, INK, SOFT } from "./draw.js";
import { drawAI } from "./level.js";
import { num } from "../curv/fmt.js";

const R2D = 180 / Math.PI;
const T0 = GJT.gs[0][0], T1 = 61;          // minutes après 20:00
const hhmm = (m) => `20:${String(Math.floor(m)).padStart(2, "0")}`.replace("20:6", "21:0");

export function gjtState(m) {
  const arc = gjtArc(GJT.gs, GJT.vTrue);
  const aTrue = (GJT.vTrue * Math.max(0, m - T0) * 60 / R_M) * R2D;
  const a = arc(m);
  const truePos = destPoint(GJT.start[0], GJT.start[1], GJT.brg, aTrue);
  const irsPos = destPoint(GJT.start[0], GJT.start[1], GJT.brg, aTrue + a);
  const ahead = destPoint(GJT.start[0], GJT.start[1], GJT.brg, aTrue + a + 0.5);
  return { m, arc: a, km: (a / R2D) * R_M / 1000, truePos, irsPos, irsTrack: bearingGC(irsPos, ahead) };
}

export function mountGJT(root, tr) {
  const cv = root.querySelector("#aviaGJT"), btn = root.querySelector("#aviaGJTPlay"), inT = root.querySelector("#aviaGJTt");
  const st = { m: T0 };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv);
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W > 520, R = Math.min(wide ? W * 0.3 : W * 0.36, wide ? H * 0.43 : H * 0.34);
    const cx = wide ? W * 0.34 : W * 0.5, cy = wide ? H * 0.5 : H * 0.42;
    const G = orthoGlobe(cx, cy, R, 62, 10);
    G.draw(ctx, { ink: globe });
    const s = gjtState(st.m);
    // trajectoire vraie et trajectoire de la centrale depuis le début de la dérive
    const tPts = [], iPts = [];
    for (let m = T0; m <= st.m; m += 0.25) { const q = gjtState(m); tPts.push(q.truePos); iPts.push(q.irsPos); }
    strokeGlobe(ctx, G, iPts, { c: flat, w: 2 });
    strokeGlobe(ctx, G, tPts, { c: INK, w: 3 });
    const pN = G.ll(90, 0); dot(ctx, pN[0], pN[1], 3, INK); label(ctx, tr("gj-pole", "North Pole"), pN[0] + 5, pN[1] - 6, { halo: true, font: "10px system-ui, sans-serif" });
    const T = G.ll(...s.truePos), I = G.ll(...s.irsPos);
    dot(ctx, T[0], T[1], 5, INK);
    label(ctx, tr("gj-true", "true position"), T[0] + 7, T[1] + 8, { halo: true });
    if (I[2] > 0) { ctx.strokeStyle = flat; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(I[0], I[1], 6, 0, 2 * Math.PI); ctx.stroke();
      label(ctx, tr("gj-irs", "left IRS position"), I[0] + 8, I[1] - 8, { col: flat, halo: true }); }
    // horizon artificiel : assiette affichée = α (nez haut), plafonnée à 90° comme le dit le rapport
    const ax = wide ? W * 0.8 : W * 0.84, ay = wide ? H * 0.36 : H * 0.12, r = Math.min(40, W * 0.08);
    drawAI(ctx, ax, ay, r, Math.min(90, s.arc), flat, s.m >= GJT.invalid ? tr("gj-inv", "ATTITUDE INVALID") : tr("gj-pfd", "captain's attitude display"));
    const L = (t, y, c = INK) => label(ctx, t, wide ? W * 0.64 : 10, y, { col: c, halo: !wide });
    const y0 = wide ? H * 0.62 : H * 0.8;
    L(`${hhmm(st.m)} UTC`, y0, INK);
    L(`${tr("gj-arc", "IRS position ahead by")} ${num(s.km)} km = ${num(s.arc, 1)}°`, y0 + 16, flat);
    L(`${tr("gj-tilt", "so its “level” tilts by")} ${num(s.arc, 1)}°`, y0 + 32, flat);
    L(`${tr("gj-trk", "IRS track")} ${num((s.irsTrack + 360) % 360)}°`, y0 + 48, SOFT);
    wrapLabel(ctx, tr("gj-src", "IRS groundspeed read off AAIB Bulletin 12/2019, fig. 3; track drawn schematically"), 8, H - 8, W - 16, { col: SOFT, bl: "bottom", font: "10px system-ui, sans-serif", lh: 12 });
    if (inT) inT.value = st.m;
  };
  inT?.addEventListener("input", () => { st.m = +inT.value; draw(); });
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.m += n * 0.012; if (st.m > T1) st.m = T0; }, draw,
    anim: { duration: (T1 - T0) / 0.012 / 60, state: st, reset: () => { st.m = T0; } },
  });
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
