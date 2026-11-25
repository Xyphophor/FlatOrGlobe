// Les triangles des levés (2026-10-28) : la courbure lue dans les sommes d'angles observées de Schott (USC&GS SP 4 et
// SP 7), Delambre et Méchain, Maclear, Roy et Struve (notre transcription ; tools/internal/build/survexcess, `fog build
// surv-excess`).
// Ici, seulement l'affichage : la lecture, le nuage excès/aire, le schéma de la formule, et les triangles posés
// sur le globe et sur la carte plate azimutale (positions imprimées, pour le dessin seulement).
import { FIG } from "../../core/fig.js";
import { stamp, axesStamp } from "../../core/formfigs.js";
import { setupCanvas } from "../../core/canvas.js";
import { drawGlobe25, globeVec } from "../../core/globe25d.js";
import { makeAE } from "../../core/aeproj.js";
import { drawAEMap } from "../../core/aemap.js";
import { magRot, magOrbitInit } from "../mag/shared.js";
import { SURV_EXCESS as X, SURV_EXCESS_TRI as TRI, SURV_EXCESS_ST as ST } from "../../data/presets/surv-excess.js";

const C = FIG.C, SEC = Math.PI / 648000, TD = Math.PI / 180;
// dans l'ordre de SURV_EXCESS.pubs : SP 4, SP 7, Delambre, Maclear, Roy, Struve
const PUB_COL = ["#6d28d9", "#0f766e", "#b91c1c", "#a16207", "#4b5563", "#db2777"];
const PUB_NAME = {
  sp4: ["39th parallel, USA (Schott 1900)", "39e parallèle, États-Unis (Schott 1900)"],
  sp7: ["Eastern Oblique Arc, USA (Schott 1902)", "arc oblique de l'Est, États-Unis (Schott 1902)"],
  delambre: ["Dunkirk–Barcelona (Delambre & Méchain)", "Dunkerque–Barcelone (Delambre et Méchain)"],
  maclear: ["Cape of Good Hope (Maclear 1866)", "cap de Bonne-Espérance (Maclear 1866)"],
  roy: ["Greenwich–Paris (Roy 1790)", "Greenwich–Paris (Roy 1790)"],
  struve: ["Struve arc, Baltic to Danube (1860)", "arc de Struve, Baltique–Danube (1860)"],
};
export const pubName = (id, lang) => PUB_NAME[id]?.[lang === "fr" ? 1 : 0] ?? id;

/** La lecture sous la formule. */
export function fillTri(root, tr, lang = "en") {
  const host = root.querySelector("#sv-readTri"); if (!host) return;
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const f = X.fit;
  host.innerHTML =
    `<span>${tr("sv-tri-read-n", "{n} triangles, {m} misprints set aside, {d} beyond 3σ").replace("{n}", nf(f.n)).replace("{m}", X.misprints).replace("{d}", f.dropped)}</span>` +
    `<span class="g"><b>${tr("sv-tri-read-r", "R = {r} km (16–84 %: {lo} – {hi})").replace("{r}", nf(f.R)).replace("{lo}", nf(f.lo)).replace("{hi}", nf(f.hi))}</b></span>` +
    `<span class="g">${tr("sv-tri-read-b", "with a constant offset of {b}″: {r} km").replace("{b}", nf(f.bias, 2).replace("-", "−")).replace("{r}", nf(f.Rbias))}</span>` +
    `<span class="f">${tr("sv-tri-read-f", "plane, best offset {o}″: residuals {fs}″ against {gs}″").replace("{o}", "+" + nf(f.flatOffset, 1)).replace("{fs}", nf(f.flatScatter, 1)).replace("{gs}", nf(f.scatter, 2))}</span>`;
  const tb = root.querySelector("#sv-tbTri"); if (!tb) return;
  const R = (x) => (x == null ? "∞" : nf(x));
  tb.innerHTML = X.pubs.map((p, i) => { const q = p.fit; return `<tr><td style="text-align:left"><span style="color:${PUB_COL[i]}">●</span> ${pubName(p.id, lang)}</td>` +
    `<td>${nf(q.n)}</td><td class="g"><b>${R(q.R)} km</b></td><td>${R(q.lo)} – ${R(q.hi)}</td><td class="f">× ${nf(q.chi2Ratio, 1)}</td></tr>`; }).join("") +
    `<tr><td style="text-align:left"><b>${tr("sv-tri-all", "all together")}</b></td><td>${nf(f.n)}</td><td class="g"><b>${R(f.R)} km</b></td><td>${R(f.lo)} – ${R(f.hi)}</td><td class="f">× ${nf(f.chi2Ratio, 1)}</td></tr>`;
}

/** Schéma : sur le plan la somme fait 180° ; sur la sphère 180° plus l'aire divisée par R². */
export function figFxTri(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-tri-alt", "Left, a triangle on a plane: its three angles add up to exactly 180 degrees. Right, a triangle of the same size on a sphere: its sides bow outward along the surface and its angles add up to 180 degrees plus the area divided by the square of the radius") });
  // plan
  const A = [24, 160], B = [164, 160], P = [92, 52];
  f.path(`M${A[0]} ${A[1]}L${B[0]} ${B[1]}L${P[0]} ${P[1]}Z`, { c: C.flat, w: 2 });
  f.angleAt(...A, 20, B, P, { label: "α₁", c: C.flat, pad: 9 });
  f.angleAt(...B, 20, P, A, { label: "α₂", c: C.flat, pad: 9 });
  f.angleAt(...P, 20, A, B, { label: "α₃", c: C.flat, pad: 9 });
  f.note(94, 186, tr("fx-tri-1", "plane: α₁ + α₂ + α₃ = 180°"), { anchor: "middle", size: 10, c: C.flat });
  // sphère : les côtés bombés vers l'extérieur
  const cx = 290, cy = 112, r = 86;
  f.circle(cx, cy, r, { c: C.sea, w: 1.4 });
  const a = [228, 150], b = [352, 150], p = [290, 46];
  f.path(`M${a[0]} ${a[1]}Q290 172 ${b[0]} ${b[1]}Q335 92 ${p[0]} ${p[1]}Q245 92 ${a[0]} ${a[1]}Z`, { c: C.globe, w: 2 });
  f.note(a[0] + 8, a[1] - 10, "α₁", { c: C.globe, size: 10 });
  f.note(b[0] - 20, b[1] - 10, "α₂", { c: C.globe, size: 10 });
  f.note(p[0] - 6, p[1] + 22, "α₃", { c: C.globe, size: 10 });
  f.note(cx, cy + 4, "A", { anchor: "middle", c: C.globe, size: 11 });
  f.note(cx, 214, tr("fx-tri-2", "sphere: 180° + A/R²"), { anchor: "middle", size: 10, c: C.globe });
  stamp(f, tr, tr("fx-tri-st", "the excess exaggerated"));
  return f;
}

/** Les triangles : excès observé contre √aire (à peu près le côté). La courbe du globe ajustée, le meilleur décalage du plan. */
export function figTriData(tr) {
  const f = FIG.make({ w: 380, h: 270, alt: tr("fx-trid-alt", "Observed excess of each survey triangle against the square root of its area. The points rise along a parabola, the excess growing with the area as on a sphere; the dashed horizontal line, the flat model's best constant offset, misses both the small and the large triangles") });
  const X0 = 46, X1 = 364, Y0 = 228, Y1 = 30, XMAX = 125, YMIN = -6, YMAX = 80;
  const px = (s) => X0 + (s / XMAX) * (X1 - X0), py = (e) => Y0 - ((e - YMIN) / (YMAX - YMIN)) * (Y0 - Y1);
  for (const v of [0, 20, 40, 60, 80]) { f.dash(X0, py(v), X1, py(v), { c: "#e7e3da", dash: "3 3" }); f.note(X0 - 5, py(v) + 4, `${v}″`, { anchor: "end" }); }
  for (const v of [0, 25, 50, 75, 100, 125]) { f.dash(px(v), Y0, px(v), Y1, { c: "#e7e3da", dash: "3 3" }); f.note(px(v), Y0 + 14, String(v), { anchor: "middle" }); }
  for (const t of TRI) f.dot(px(Math.sqrt(t[3])), py(Math.max(YMIN, Math.min(YMAX, t[2]))), { r: 1.5, c: PUB_COL[t[0]] });
  // globe : ε = K·A, A en m², K en 1/m² -> secondes
  let d = ""; for (let s = 0; s <= XMAX; s += 2) { const e = (X.fit.K * s * s * 1e6) / SEC; if (e > YMAX) break; d += `${d ? "L" : "M"}${px(s).toFixed(1)} ${py(e).toFixed(1)}`; }
  f.path(d, { c: C.globe, w: 2 });
  f.dash(X0, py(X.fit.flatOffset), X1, py(X.fit.flatOffset), { c: C.flat, w: 1.8, dash: "6 4" });
  f.note(px(62), py(46), tr("fx-trid-1", "globe: ε = A/R²"), { c: C.globe, size: 10 });
  f.note(X1, py(X.fit.flatOffset) - 6, tr("fx-trid-2", "plane, best constant offset"), { c: C.flat, size: 10, anchor: "end" });
  const short = { sp4: tr("fx-trid-3", "39th parallel"), sp7: tr("fx-trid-4", "Eastern Oblique Arc"), delambre: "Delambre", maclear: "Maclear", roy: "Roy", struve: "Struve" };
  X.pubs.forEach((p, i) => { const x = X0 + 8 + (i % 2) * 112, y = Y1 + 4 + Math.floor(i / 2) * 13; f.dot(x, y, { r: 3, c: PUB_COL[i] }); f.note(x + 6, y + 4, short[p.id] ?? p.id, { size: 9.5, c: PUB_COL[i] }); });
  f.note(4, 262, tr("fx-trid-5", "excess ε (″) against √area (km)"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-trid-st", "x = √area"));
  return f;
}

// --------------------------------------------------------------- les triangles sur le globe et sur la carte plate
const TRIC = { yaw: -0.5, pitch: 0.42, spin: 0, spinning: false, drag: false, lx: 0, ly: 0 };
// face à l'Atlantique (30° W) : l'Amérique du Nord, l'Europe et le Cap à la fois
const faceAtlantic = () => { TRIC.spin = 30 * TD - Math.PI / 2 - TRIC.yaw; };
faceAtlantic();
const placed = () => TRI.filter((t) => t[5] >= 0 && t[6] >= 0 && t[7] >= 0);

/** Le globe : les triangles à leur vraie taille (à l'échelle), tournant ; glisser pour orbiter. */
export function drawTriGlobe(t_) {
  const cv = document.getElementById("svTriGlobe"); if (!cv) return;
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  const tr = t_ || ((k, fb) => fb);
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const sc = Math.min(W, H) * 0.46, cx = W / 2, cy = H / 2 + 6;
  const P = (p) => { const q = magRot(TRIC, p); return [cx + q[0] * sc, cy - q[1] * sc, q[2]]; };
  drawGlobe25(ctx, P, sc);
  ctx.lineWidth = 1;
  for (const t of placed()) {
    const v = [t[5], t[6], t[7]].map((i) => P(globeVec(ST[i][0], ST[i][1])));
    if (v.some((q) => q[2] < 0)) continue;
    ctx.strokeStyle = PUB_COL[t[0]];
    ctx.beginPath(); ctx.moveTo(v[0][0], v[0][1]); ctx.lineTo(v[1][0], v[1][1]); ctx.lineTo(v[2][0], v[2][1]); ctx.closePath(); ctx.stroke();
  }
  ctx.font = "600 10.5px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillStyle = C.globe; ctx.fillText(tr("sv-tri-globe-1", "globe: every side as measured"), 10, 10);
  ctx.fillStyle = "#7d848f"; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textBaseline = "bottom";
  ctx.fillText(tr("sv-tri-globe-2", "true scale · drag to orbit"), 10, H - 8);
}

const NP = makeAE({ lat0: 90, lon0: -95 });
// couleur d'un côté : carte ÷ mesure, bleu trop court, rouge trop long, échelle logarithmique saturée à ×0,8 et ×1,25
function ratioColor(r) {
  const u = Math.max(-1, Math.min(1, Math.log(r) / Math.log(1.25)));
  const a = Math.abs(u), mix = (c0, c1) => Math.round(c0 + (c1 - c0) * a);
  return u >= 0 ? `rgb(${mix(150, 185)},${mix(150, 28)},${mix(150, 28)})` : `rgb(${mix(150, 37)},${mix(150, 99)},${mix(150, 235)})`;
}

/** La carte plate azimutale centrée sur le pôle Nord, à la meilleure échelle : chaque côté coloré par carte ÷ mesure. */
export function drawTriFlat(t_) {
  const cv = document.getElementById("svTriFlat"); if (!cv) return;
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  const tr = t_ || ((k, fb) => fb);
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  // tout le disque, le pôle au centre, le méridien 95° W vers le bas (comme les cartes de la Terre plate, à une rotation près)
  const Rpx = Math.min(W, H - 50) / 2 - 6, cx = W / 2, cy = 26 + Rpx;
  const { project } = drawAEMap(ctx, NP, { cx, cy, Rpx, grid: 30 });
  const kmpd = X.flatNP.kmPerDeg;
  ctx.lineWidth = 1.2;
  for (const t of placed()) {
    const v = [t[5], t[6], t[7]].map((i) => ST[i]);
    const sp = v.map((q) => project(q[0], q[1]));
    for (let i = 0; i < 3; i++) {
      const a = v[(i + 1) % 3], b = v[(i + 2) % 3];
      // un côté non imprimé (ou mal imprimé, donc non utilisé) : gris
      ctx.strokeStyle = t[8 + i] > 0 ? ratioColor((NP.dist(a, b) * kmpd) / t[8 + i]) : "#9aa1aa";
      ctx.beginPath(); ctx.moveTo(...sp[(i + 1) % 3]); ctx.lineTo(...sp[(i + 2) % 3]); ctx.stroke();
    }
  }
  // légende
  ctx.font = "600 10.5px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillStyle = C.flat; ctx.fillText(tr("sv-tri-flat-1", "flat map, pole at the centre, best scale"), 10, 6);
  const bx = 10, by = H - 22, bw = Math.min(160, W - 20);
  for (let i = 0; i <= bw; i++) { ctx.fillStyle = ratioColor(Math.exp(Math.log(0.8) + (Math.log(1.25 / 0.8) * i) / bw)); ctx.fillRect(bx + i, by, 1.5, 8); }
  ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textBaseline = "top";
  ctx.fillText("×0.8", bx, by + 10); ctx.textAlign = "center"; ctx.fillText("1", bx + bw / 2, by + 10); ctx.textAlign = "right"; ctx.fillText("×1.25", bx + bw, by + 10);
  ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillStyle = "#7d848f";
  ctx.fillText(tr("sv-tri-flat-2", "side on the map ÷ side measured"), 10, by - 3);
}

/** Montage des deux vues : orbite à la souris sur le globe, export (un tour en 20 s). */
export function initTriMaps(tr) {
  const g = document.getElementById("svTriGlobe"); if (!g) return;
  magOrbitInit(g, TRIC, () => drawTriGlobe(tr));
  let saved = null;
  g.__anim = {
    duration: 20,
    begin: () => { saved = { spin: TRIC.spin }; },
    frameAt: (t) => { TRIC.spin = saved.spin + (2 * Math.PI * t) / 20; drawTriGlobe(tr); },
    end: () => { Object.assign(TRIC, saved); saved = null; drawTriGlobe(tr); },
  };
}
