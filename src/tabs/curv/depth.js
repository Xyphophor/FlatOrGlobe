// Animation « en profondeur, pas de gauche à droite » (epic13 UC05, demande du
// propriétaire du 2026-09-30). Cas documenté : la Turning Torso (Malmö) filmée
// de l'autre côté de l'Øresund par Mathias Kp, sept prises de 25 à 47,9 km
// puis une montée à 17,6 m (presets TORSO) ; on continue ensuite jusqu'à 400 km
// pour que la courbure de l'horizon finisse par se voir. Deux vues d'un même instant :
// - à gauche, ce que filme la caméra : perspective VRAIE (logic.js, objectif
//   rectilinéaire), aucune exagération. Le téléobjectif garde la tour lisible
//   pendant l'éloignement ; pendant la montée le champ s'ouvre à 90° et
//   l'horizon est centré (règle de Lynch) ;
// - à droite, le profil : maquette à échelle uniforme (règle 1) où la Terre est
//   ex fois plus petite et les distances au sol ≈ √ex fois plus courtes, si bien
//   que les hauteurs -- œil, tour, partie cachée -- sont les vraies (modelDist).
// Tout est géométrique (sans réfraction) ; la hauteur cachée réfractée est
// imprimée à côté (règle 3), avec la mesure de l'auteur pendant l'arrêt sur
// chaque prise. Le plan : rien de caché, horizon au niveau de l'œil.
// Pas de Soleil : Malmö est à l'est de la côte danoise, un coucher derrière la tour est impossible.
import { figColor } from "../../core/theme.js";
import { setupCanvas } from "../../core/canvas.js";
import { DEPTH, TORSO } from "../../data/presets/curv.js";
import { R_EARTH, K_STD, dip, makeCamera, project, horizonPolyline, pitchForHorizonAt, sagitta,
  depthAt, depthDuration, hiddenBoth, modelScale, modelDist } from "./logic.js";
import { fmtH, fmtAng, fmtPx, num } from "./fmt.js";
import { label, wrapLabel, makeLoop } from "../avia/draw.js";

const D2R = Math.PI / 180;
const INK = "#151a21", SOFT = "#5b6470";
function cssVar(el, name, fb) { return figColor(name, fb); }
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
const NB = "\u00a0";                                   // les unités ne se séparent pas du nombre
const fmtM = (m) => `${num(m, m < 10 && m > 0 ? 1 : 0)}${NB}m`;
const fmtKm = (m) => `${num(m / 1000, m >= 100000 ? 0 : 1)}${NB}km`;
const nb = (t) => String(t).replace(/(\d) (m|km|px|°)\b/g, `$1${NB}$2`);

const towerW = () => TORSO.width;
/** Hauteurs (m au-dessus de la mer) des joints entre les neuf segments, socle compris. */
const JOINTS = Array.from({ length: TORSO.nSeg + 1 }, (_, i) => TORSO.ground + TORSO.base + i * TORSO.seg);
const S = TORSO.shots;

/** Champ vertical (rad) et position de l'horizon à l'instant donné. */
function framing(s) {
  const tele = Math.max(2.6 * Math.atan(DEPTH.tower / s.d), 0.5 * D2R);          // tour lisible
  const w = ease(Math.log(Math.max(1, s.h / 300)) / Math.log(20000 / 300));       // s'ouvre entre 300 m et 20 km
  return { tele, w };
}

/** Vue caméra dans la boîte b = { x, y, w, h }. */
function drawPov(ctx, b, s, tr, col) {
  const { h, d } = s;
  const dG = dip(h);
  const { tele, w } = framing(s);
  const aspect = b.w / b.h;
  const fovTele = 2 * Math.atan(Math.tan(tele / 2) * aspect) / D2R;
  const fovH = Math.exp(Math.log(fovTele) + (Math.log(90) - Math.log(fovTele)) * w);
  const cam0 = makeCamera({ W: b.w, H: b.h, fovH });
  const pitch = pitchForHorizonAt(cam0, dG, -0.22 * b.h * (1 - w)) ?? dG;
  const cam = makeCamera({ W: b.w, H: b.h, fovH, pitch });
  const X = (u) => b.x + b.w / 2 + u, Y = (v) => b.y + b.h / 2 - v;
  ctx.save();
  ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();

  // ciel : brume de jour, noir de l'espace en montant (cosmétique)
  const pc = project(cam, [0, Math.cos(dG), -Math.sin(dG)]);
  const yh = pc ? Y(pc[1]) : b.y + b.h;
  const space = clamp01(Math.log(Math.max(1, h / 5000)) / Math.log(80));
  const g = ctx.createLinearGradient(0, yh - b.h, 0, yh);
  g.addColorStop(0, space > 0.5 ? "#05070d" : "#5f7fa6"); g.addColorStop(0.7, space > 0.5 ? "#1b2d52" : "#a9bccd"); g.addColorStop(1, space > 0.5 ? "#5d8fc9" : "#d5dde3");
  ctx.fillStyle = g; ctx.fillRect(b.x, b.y, b.w, b.h);

  // mer sous l'horizon géométrique (l'anneau projeté point par point)
  const segs = horizonPolyline(cam, dG, 4, 0.1);
  const seg = segs.reduce((a, c) => (c.length > (a?.length || 0) ? c : a), null);
  const sea = ctx.createLinearGradient(0, yh, 0, b.y + b.h);
  sea.addColorStop(0, "#35607a"); sea.addColorStop(1, "#152c3d");
  ctx.fillStyle = sea; ctx.beginPath();
  if (seg && seg.length > 1) {
    seg.forEach(([u, v], n) => (n ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v))));
    ctx.lineTo(b.x + b.w + 5, b.y + b.h + 5); ctx.lineTo(b.x - 5, b.y + b.h + 5); ctx.closePath(); ctx.fill();
  } else if (yh < b.y) { ctx.fillRect(b.x, b.y, b.w, b.h); }

  // la tour sur le globe : on en voit de la hauteur cachée au sommet
  const R = R_EARTH, phi = d / R, top = DEPTH.tower;
  const dirAt = (x, z) => [x, (R + z) * Math.sin(phi), (R + z) * Math.cos(phi) - (R + h)];
  const H = hiddenBoth(h, d);
  const outline = (dirf, z0, z1) => {
    const L = [], Rt = [];
    for (let i = 0; i <= 12; i++) { const z = z0 + (z1 - z0) * i / 12; L.push(project(cam, dirf(-towerW(z) / 2, z))); Rt.push(project(cam, dirf(towerW(z) / 2, z))); }
    return L.concat(Rt.reverse());
  };
  const path = (pts) => { ctx.beginPath(); pts.forEach((p, n) => p && (n ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])))); ctx.closePath(); };
  const across = (dirf, z, ext, c, lw) => {
    const a = project(cam, dirf(-towerW(z) / 2 - ext, z)), e = project(cam, dirf(towerW(z) / 2 + ext, z));
    if (!a || !e) return null;
    ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.lineTo(X(e[0]), Y(e[1])); ctx.stroke();
    return [X(e[0]), Y(e[1]), Math.abs(e[0] - a[0])];
  };
  // fantôme du plan : la tour entière, pied au ras du niveau des yeux (s'efface pendant la montée)
  const ghostA = 1 - clamp01(Math.log(Math.max(1, h / 150)) / Math.log(20));
  if (ghostA > 0.02) {
    const flatDir = (x, z) => [x, d, z - h];
    ctx.save(); ctx.globalAlpha = ghostA; ctx.strokeStyle = col.flat; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]);
    path(outline(flatDir, TORSO.ground, top)); ctx.stroke(); ctx.restore();
  }
  const z0 = Math.max(TORSO.ground, H.geo);
  if (z0 < top) {
    ctx.fillStyle = "#e9ecef"; path(outline(dirAt, z0, top)); ctx.fill();
    ctx.strokeStyle = "rgba(90,100,112,.8)"; ctx.lineWidth = 1; ctx.stroke();
    for (const z of JOINTS) if (z > z0 && z < top) { const r = across(dirAt, z, 0, "#5a6470", 1.2); if (r && r[2] < 3) break; }
  }
  // mesure de l'auteur pendant l'arrêt sur une prise : trait rouge à la hauteur cachée mesurée
  const shot = s.shot;
  if (shot) {
    const r = across(dirAt, shot.hid, TORSO.width * 0.8, "#e0413a", 2);
    if (r) label(ctx, `${tr("dp-meas-s", "measured")} ${shot.id}`, r[0] + 4, r[1], { col: "#ff6b62", font: "bold 11px system-ui, sans-serif" });
  }
  // niveau de l'œil (horizon d'un plan) et horizon du globe
  const line = (sg, c, lw, dash) => { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.setLineDash(dash || []);
    for (const q of sg) { ctx.beginPath(); q.forEach(([u, v], n) => (n ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v)))); ctx.stroke(); } ctx.restore(); };
  line(horizonPolyline(cam, 0, 2, 0.2), col.flat, 1.4, [7, 5]);
  line(segs, col.globeL, 1.4);

  // lectures
  const ref = sagitta(makeCamera({ W: 4000, H: 4000 / aspect, fovH, pitch }), dG);
  const s90 = sagitta(makeCamera({ W: 4000, H: 4000 * 2 / 3, fovH: 90, pitch: dG }), dG);
  const refr = tr("refr-s", "refr.");
  const hid = H.geo >= top ? tr("dp-all", "the whole tower is hidden")
    : `${fmtM(H.geo)} ${tr("dp-hidden", "hidden")} (${fmtM(Math.min(H.refr, top))} ${refr})`;
  const small = b.w < 330, font = `${small ? 10 : 11}px system-ui, sans-serif`, lh = small ? 12 : 13;
  const rows = [
    [`${tr("dp-eye", "eye")} ${nb(fmtH(h))} · ${tr("dp-at", "Turning Torso at")} ${fmtKm(d)} · ${tr("dp-fov", "field")} ${num(fovH, fovH < 10 ? 2 : 0)}°`, "#e8edf2"],
    [`${tr("dp-depth", "In depth — globe:")} ${hid} · ${nb(tr("dp-plane", "plane: 0 m"))}`, col.globeL],
    shot ? [`${tr("dp-meas", "Measured, shot")} ${shot.id} (26/02/2016): ${fmtM(shot.hid)} ${tr("dp-hidden", "hidden")}`, "#ff8d86"] : null,
    [`${tr("dp-lr", "Left to right: the horizon bends")} ${ref ? nb(fmtPx(ref.px)) : "—"} ${tr("dp-of", "on a 4,000-px frame")}${w < 0.99 ? ` (${tr("dp-90", "90° lens")}: ${s90 ? nb(fmtPx(s90.px)) : "—"})` : ""}`, "#ffd98a"],
  ].filter(Boolean);
  let y = b.y + 6;
  ctx.font = font;
  const boxH = rows.reduce((n, [t]) => n + Math.ceil(ctx.measureText(t).width / (b.w - 14)) * lh, 0) + 6;
  ctx.fillStyle = "rgba(10,14,20,.62)"; ctx.fillRect(b.x, b.y, b.w, boxH + 2);
  for (const [t, c] of rows) y += lh * wrapLabel(ctx, t, b.x + 6, y + lh / 2, b.w - 14, { col: c, font, lh });
  // étape, hauteurs nommées
  const mark = s.phase === 1 && !shot ? DEPTH.marks.find((m) => Math.abs(Math.log(h / m.h)) < 0.35) : null;
  const foot = [
    s.phase === 0 ? tr("dp-p0", "1 · moving away, eye 2 to 4 m above the Øresund") : tr("dp-p1", "2 · climbing straight up"),
    mark ? tr(mark.k, "") : "",
  ].filter(Boolean).join(" · ");
  const lines = [foot, tr("dp-true", "true perspective, nothing exaggerated · no refraction drawn")];
  ctx.fillStyle = "rgba(10,14,20,.55)"; ctx.fillRect(b.x, b.y + b.h - 2 * lh - 12, b.w, 2 * lh + 12);
  wrapLabel(ctx, lines[0], b.x + 6, b.y + b.h - lh - 8, b.w - 12, { col: "#e8edf2", font, lh, bl: "bottom" });
  label(ctx, lines[1], b.x + 6, b.y + b.h - 7, { col: "#9aa6b4", font: `${small ? 9 : 10}px system-ui, sans-serif`, bl: "bottom" });
  ctx.restore();
  return { fovH, H, dG };
}

/** Profil : maquette à échelle uniforme, hauteurs vraies. */
function drawProfile(ctx, b, s, tr, col) {
  const { h, d } = s;
  const sc = modelScale(h, DEPTH), Rm = sc.R;
  const dm = modelDist(d, h, Rm), dmFit = modelDist(DEPTH.d1, h, Rm);
  const dipM = Math.acos(Rm / (Rm + h));
  const E = [0, Rm + h];
  const at = (arc, z) => [(Rm + z) * Math.sin(arc / Rm), (Rm + z) * Math.cos(arc / Rm)];
  const Pp = [Rm * Math.sin(dipM), Rm * Math.cos(dipM)], Pm = [-Pp[0], Pp[1]];
  // cadrage : œil, deux points d'horizon, tour à la dernière prise (fixe pendant l'éloignement : pas de zoom qui bouge)
  const pts = [E, Pp, Pm, at(dmFit, DEPTH.tower), at(dmFit, 0), [0, Rm]];
  const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  const top = 26, bot = 34;
  const k = Math.min((b.w - 24) / (x1 - x0), (b.h - top - bot) / Math.max(y1 - y0, 1e-9));
  const cxm = (x0 + x1) / 2, cym = (y0 + y1) / 2;
  const P = ([x, y]) => [b.x + b.w / 2 + (x - cxm) * k, b.y + top + (b.h - top - bot) / 2 - (y - cym) * k];
  ctx.save();
  ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(b.x, b.y, b.w, b.h);
  // la Terre (maquette)
  const C = P([0, 0]);
  ctx.beginPath(); ctx.arc(C[0], C[1], Rm * k, 0, 2 * Math.PI); ctx.fillStyle = "#dcefec"; ctx.fill();
  ctx.strokeStyle = col.globe; ctx.lineWidth = 1.4; ctx.stroke();
  // niveau de l'œil : l'horizon d'un plan, rien de caché
  const e = P(E);
  ctx.save(); ctx.strokeStyle = col.flat; ctx.setLineDash([7, 5]); ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(b.x + 6, e[1]); ctx.lineTo(b.x + b.w - 6, e[1]); ctx.stroke(); ctx.restore();
  // tour : partie cachée hachurée, partie visible pleine
  const Hm = Math.min(DEPTH.tower, hiddenBoth(h, dm, Rm).geo);
  const poly = (z0, z1) => { const q = [];
    for (let i = 0; i <= 8; i++) { const z = z0 + (z1 - z0) * i / 8; q.push(at(dm - towerW(z) / 2, z)); }
    for (let i = 8; i >= 0; i--) { const z = z0 + (z1 - z0) * i / 8; q.push(at(dm + towerW(z) / 2, z)); }
    ctx.beginPath(); q.map(P).forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
  const tw = Math.max(2, TORSO.width * k);
  const tb = P(at(dm, 0)), tt = P(at(dm, DEPTH.tower)), th = P(at(dm, Hm));
  const bar = (p, q, c, dash) => { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = tw; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore(); };
  if (TORSO.width * k >= 3) {
    if (Hm > 0) { poly(0, Hm); ctx.fillStyle = "rgba(200,60,60,.35)"; ctx.fill(); ctx.strokeStyle = "#c83c3c"; ctx.lineWidth = 1; ctx.stroke(); }
    if (Hm < DEPTH.tower) { poly(Hm, DEPTH.tower); ctx.fillStyle = INK; ctx.fill(); }
  } else {
    if (Hm > 0) bar(tb, th, "#c83c3c", [3, 2]);
    if (Hm < DEPTH.tower) bar(th, tt, INK);
  }
  // lignes de visée tangentes (l'anneau d'horizon vu par la tranche) et visée vers la tour
  ctx.strokeStyle = col.globe; ctx.lineWidth = 1.2;
  const pP = P(Pp), pM = P(Pm);
  ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(pM[0], pM[1]); ctx.stroke();
  const ext = Hm > 0 ? th : pP;
  ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(pP[0], pP[1]); ctx.lineTo(ext[0], ext[1]); ctx.stroke();
  for (const p of [pP, pM]) { ctx.fillStyle = col.globe; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 2 * Math.PI); ctx.fill(); }
  // mesure de l'auteur (prise affichée) : trait rouge à la hauteur cachée mesurée
  if (s.shot) {
    const m = P(at(dm - TORSO.width, s.shot.hid)), n = P(at(dm + TORSO.width, s.shot.hid)), wpx = Math.max(10, n[0] - m[0]);
    ctx.strokeStyle = "#e0413a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo((m[0] + n[0]) / 2 - wpx / 2, m[1]); ctx.lineTo((m[0] + n[0]) / 2 + wpx / 2, n[1]); ctx.stroke();
  }
  // caméra
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(e[0], e[1], 3.5, 0, 2 * Math.PI); ctx.fill();
  // étiquettes (hauteurs et angles VRAIS)
  const small = b.w < 330, f = `${small ? 10 : 11}px system-ui, sans-serif`;
  const H = hiddenBoth(h, d);
  label(ctx, `${tr("dp-hid-s", "hidden")}: ${H.geo >= DEPTH.tower ? `${fmtM(DEPTH.tower)}+` : fmtM(H.geo)}`, Math.min(tt[0] + 6, b.x + b.w - 4), Math.max(b.y + top + 6, Math.min(tb[1], b.y + b.h - bot - 6)),
    { al: tt[0] + 90 > b.x + b.w ? "right" : "left", col: "#b83232", font: f, halo: true });
  label(ctx, `h = ${fmtH(h)} · δ = ${fmtAng(dip(h))} (${fmtAng(dip(h, K_STD))} ${tr("refr-s", "refr.")})`, b.x + 8, b.y + 12, { col: INK, font: f });
  label(ctx, tr("dp-eyelvl", "eye level: a plane hides nothing"), b.x + 8, Math.max(b.y + 26, e[1] - 9), { col: col.flat, font: f, halo: true });
  const exTxt = sc.ex > 1.005
    ? `${tr("dp-ex1", "Earth")} ÷${num(sc.ex, sc.ex >= 100 ? 0 : 1)} · ${tr("dp-ex2", "distances")} ÷${num(Math.sqrt(sc.ex), 1)} · ${tr("dp-ex3", "heights true, uniform scale; true angles printed")}`
    : tr("dp-true2", "true scale; angles printed are true");
  wrapLabel(ctx, exTxt, b.x + 8, b.y + b.h - 6, b.w - 16, { col: SOFT, font: `${small ? 9 : 10}px system-ui, sans-serif`, bl: "bottom", lh: small ? 11 : 12 });
  ctx.restore();
}

export function mountDepth(root, tr) {
  const cv = root.querySelector("#curvDepth"), btn = root.querySelector("#curvDepthPlay");
  const st = { t: 0 };
  const T = depthDuration(DEPTH, S);
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const col = { globe: cssVar(cv, "--globe", "#0f766e"), flat: cssVar(cv, "--flat", "#b45309"), globeL: "#7fe3d4" };
    const s = depthAt(st.t, DEPTH, S);
    const wide = W >= 560, gap = 6;
    const a = wide ? { x: 0, y: 0, w: W * 0.56 - gap / 2, h: H } : { x: 0, y: 0, w: W, h: H * 0.54 - gap / 2 };
    const b = wide ? { x: W * 0.56 + gap / 2, y: 0, w: W * 0.44 - gap / 2, h: H } : { x: 0, y: H * 0.54 + gap / 2, w: W, h: H * 0.46 - gap / 2 };
    ctx.fillStyle = "#0e131a"; ctx.fillRect(0, 0, W, H);
    drawPov(ctx, a, s, tr, col);
    drawProfile(ctx, b, s, tr, col);
  };
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.t += n / 60; if (st.t > T) st.t = 0; },
    draw, anim: { duration: T, state: st, reset: () => { st.t = 0; } },
  });
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
