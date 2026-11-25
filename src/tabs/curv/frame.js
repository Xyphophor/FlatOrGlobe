// Une image de caméra (epic13) : chaque pixel coloré par la direction qu'il
// vise (mer sous l'horizon réfracté, ciel au-dessus), puis les anneaux
// projetés point par point par logic.js. Projection vraie, aucune
// exagération (règle 1). Partagé par le simulateur (sim.js) et la figure
// des distorsions (tri.js).
import { figColor } from "../../core/theme.js";
import { pixelRatio } from "../../core/canvas.js";
import { dip, K_STD, makeCamera, projectCam, elevationAt, horizonPolyline, sagitta } from "./logic.js";

const D2R = Math.PI / 180;
export const REF_W = 4000;                // largeur de référence des lectures, en pixels

function cssVar(el, name, fb) { return figColor(name, fb); }

/**
 * o : { h, fov, lens, pitch (rad, positif = vers le bas) | pitchOf(cam0, dR) , grid, chord, labels: [[texte, coin]] }
 * Renvoie { pitch, dG, dR, ref(delta) -> flèche sur une photo de REF_W px } ou null si le canvas est masqué.
 */
export function paintFrame(cv, o) {
  const rect = cv.getBoundingClientRect();
  const Wc = rect.width, Hc = rect.height;
  if (!Wc || !Hc) return null;
  const dpr = pixelRatio(1.25);                   // un calcul par pixel : plafonné pour les machines lentes
  cv.width = Math.round(Wc * dpr); cv.height = Math.round(Hc * dpr);
  const ctx = cv.getContext("2d");
  const dG = dip(o.h), dR = dip(o.h, K_STD);
  const PW = cv.width, PH = cv.height;
  const cam0 = makeCamera({ W: PW, H: PH, fovH: o.fov, lens: o.lens, pitch: 0 });
  const pitch = o.pitchOf ? (o.pitchOf(cam0, dR) ?? 0) : (o.pitch || 0);
  const camAt = (W, H) => makeCamera({ W, H, fovH: o.fov, lens: o.lens, pitch });
  const cam = camAt(PW, PH);
  // fond calculé à demi-résolution puis agrandi ; les lignes sont tracées à pleine résolution
  const IW = Math.ceil(PW / 2), IH = Math.ceil(PH / 2), camI = camAt(IW, IH);
  const off = document.createElement("canvas"); off.width = IW; off.height = IH;
  const octx = off.getContext("2d"), img = octx.createImageData(IW, IH), px = img.data;
  const hi = Math.min(1, Math.log10(Math.max(1, o.h)) / 5);     // ciel plus sombre en altitude (cosmétique)
  for (let j = 0; j < IH; j++) {
    const v = IH / 2 - j - 0.5;
    for (let i = 0; i < IW; i++) {
      const u = i + 0.5 - IW / 2, e = elevationAt(camI, u, v), q = (j * IW + i) * 4;
      if (e == null) { px[q] = px[q + 1] = px[q + 2] = 40; px[q + 3] = 255; continue; }   // hors du cercle image
      if (e < -dR) {                                   // mer : un peu plus claire près de l'horizon
        const t = Math.min(1, (-dR - e) / (8 * D2R));
        px[q] = 70 - 34 * t; px[q + 1] = 104 - 44 * t; px[q + 2] = 128 - 44 * t;
      } else {
        const t = Math.min(1, (e + dR) / (35 * D2R));
        px[q] = 222 - (120 + 60 * hi) * t; px[q + 1] = 232 - (95 + 70 * hi) * t; px[q + 2] = 240 - (40 + 70 * hi) * t;
      }
      px[q + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, PW, PH);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const X = (u) => Wc / 2 + (u * Wc) / PW, Y = (v) => Hc / 2 - (v * Hc) / PH;   // pixels caméra -> pixels CSS
  const line = (segs, color, w, dash) => {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    for (const s of segs) { ctx.beginPath(); s.forEach(([u, v], n) => (n ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v)))); ctx.stroke(); }
    ctx.restore();
  };
  if (o.grid) line(gridLines(cam), "rgba(255,255,255,.55)", 0.8);
  const globe = cssVar(cv, "--globe", "#0f766e"), flat = cssVar(cv, "--flat", "#b45309");
  line(horizonPolyline(cam, 0), flat, 1.6, [7, 5]);                 // niveau de l'œil = horizon d'un plan infini
  line(horizonPolyline(cam, dG), "#ffffff", 1, [4, 3]);             // géométrique
  line(horizonPolyline(cam, dR), globe, 1.6);                       // réfracté
  const s = sagitta(cam, dR);
  if (o.chord !== false && s && s.inFrame) {                        // corde et flèche
    ctx.save(); ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1; ctx.setLineDash([1.5, 3]);
    ctx.beginPath(); ctx.moveTo(0, Y(s.vEdge)); ctx.lineTo(Wc, Y(s.vEdge)); ctx.stroke();
    ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(Wc / 2, Y(s.vEdge)); ctx.lineTo(Wc / 2, Y(s.vCentre)); ctx.stroke(); ctx.restore();
  }
  // axe optique
  ctx.strokeStyle = "rgba(21,26,33,.55)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(Wc / 2 - 6, Hc / 2); ctx.lineTo(Wc / 2 + 6, Hc / 2); ctx.moveTo(Wc / 2, Hc / 2 - 6); ctx.lineTo(Wc / 2, Hc / 2 + 6); ctx.stroke();
  const small = Wc < 260;
  const lab = (txt, corner, col = "#151a21") => {
    ctx.font = `${small ? 10 : 11}px system-ui, sans-serif`; ctx.textBaseline = "top";
    const right = corner.includes("r"), y = corner.includes("b") ? Hc - (small ? 16 : 18) : 6;
    const w = ctx.measureText(txt).width, x0 = right ? Wc - 6 - w : 6;
    ctx.fillStyle = "rgba(251,250,247,.82)"; ctx.fillRect(x0 - 3, y - 2, w + 6, small ? 14 : 15);
    ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(txt, x0, y);
  };
  for (const [txt, corner, isFlat] of o.labels || []) lab(txt, corner, isFlat ? flat : undefined);
  const ref = (delta) => sagitta(camAt(REF_W, (REF_W * Hc) / Wc), delta);
  return { pitch, dG, dR, ref };
}

/** Une feuille quadrillée tenue d'équerre devant l'objectif : des droites, que seul un objectif rectilinéaire rend droites. */
function gridLines(cam) {
  const a = Math.min((cam.fovH * D2R) / 2, 75 * D2R), s = Math.tan(a) / 4, n = 12, segs = [];
  const clipPush = (pts) => { let cur = [];
    for (const p of pts) { if (p && Math.abs(p[0]) <= cam.W / 2 + 2 && Math.abs(p[1]) <= cam.H / 2 + 2) cur.push(p); else if (cur.length) { segs.push(cur); cur = []; } }
    if (cur.length) segs.push(cur); };
  for (let i = -n; i <= n; i++) {
    const vert = [], hor = [];
    for (let k = -200; k <= 200; k++) { const t = (k / 200) * n * s;
      vert.push(projectCam(cam, [i * s, t, 1])); hor.push(projectCam(cam, [t, i * s, 1])); }
    clipPush(vert); clipPush(hor);
  }
  return segs;
}
