// La figure animée de la section laser (2026-10-31) : le test de Worthing–Brighton du 23 février 2019 (1 mrad, à niveau, 1 m
// au-dessus de l'eau, œil à 1 m, 15,3 km), sur le globe (en haut) et sur le plan (en bas), dans quatre airs tour à tour :
// lumière droite, l'air standard du site (k = 0,13), l'air mesuré ce soir-là au bout de Worthing, puis au bout de Brighton. Les rayons sont tracés (laser.js) ; d'un air au suivant, fondu entre deux tracés vrais (aucun air
// intermédiaire inventé). Règle 1 : une seule échelle de hauteur pour l'eau, le bombement et les rayons ; le facteur est
// imprimé (« hauteurs ×ex, planète ÷ex »).
// 2026-10-31 : générique (makeLaserAnim) pour l'onglet cases, qui y passe ses propres scènes ; ref garde ses quatre airs.
import { setupCanvas } from "../../core/canvas.js";
import { reducedMotion, frameStep, exportBusy } from "../../core/motion.js";
import { LAS, LAS_AIRS, lasBeam, lasK } from "./laser.js";
import { REF_R } from "./logic.js";

export const LAS_HOLD = 3.6, LAS_FADE = 0.9;
const COL = { beam: "#dc2626", water: "#0f766e", ink: "#151a21", soft: "#5b6470", faint: "#9aa1ab", globe: "#1d4ed8", flat: "#b45309", seen: "#15803d" };

/**
 * Une animation de faisceau : spec = { scenes: [{ key, air, S }] (S : le dispositif, même forme que LAS), name(sc, tr) (le
 * titre de la scène), foot(sc, tr) (le pied de figure), hmax (m, hauteur du cadre), kAt ([h…] m, les k de l'en-tête), still (s,
 * l'image montrée à l'arrêt) }. Renvoie { T, beams(i), phase(t), draw(ctx, W, H, t, tr), mount(canvas, reads, tr) }.
 */
export function makeLaserAnim(spec) {
  const SC = spec.scenes, T = SC.length * (LAS_HOLD + LAS_FADE), HMAX = spec.hmax ?? 14, kAt = spec.kAt ?? [0.25, 1, 1.75];
  const cache = new Map();
  /** Les deux faisceaux (globe, plan) d'une scène, tracés une fois. */
  const beams = (i) => {
    if (!cache.has(i)) { const sc = SC[i]; cache.set(i, { g: lasBeam(sc.air, true, 2, sc.S), p: lasBeam(sc.air, false, 2, sc.S) }); }
    return cache.get(i);
  };
  /** La scène à l'instant t : { i (affichée), j (suivante), f (part de la suivante dans le fondu) }. */
  const phase = (t) => {
    const per = LAS_HOLD + LAS_FADE, u = ((t % T) + T) % T, i = Math.floor(u / per), v = u - i * per;
    return { i, j: (i + 1) % SC.length, f: v < LAS_HOLD ? 0 : (v - LAS_HOLD) / LAS_FADE };
  };
  /** Une image, sur W × H. tr(clé, repli) = textes. */
  const draw = (ctx, W, H, t, tr) => {
    ctx.fillStyle = "#fbfaf7"; ctx.fillRect(0, 0, W, H);
    const { i, j, f } = phase(t), narrow = W < 520, fs = narrow ? 10.5 : 11.5, S0 = SC[i].S;
    const padL = 14, padR = narrow ? 14 : 18, padT = narrow ? 40 : 30, padB = narrow ? 34 : 22, gap = narrow ? 26 : 22;
    const ph = (H - padT - padB - gap) / 2, Wd = W - padL - padR;
    const sx = Wd / S0.D, sy = ph / HMAX, ex = sy / sx;
    // en-tête : la scène (fondu de l'une à l'autre)
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const hw = narrow ? W - padL - padR : (W - padL - padR) * 0.5;
    for (const [k, a] of [[i, 1 - f], [j, f]]) { if (a <= 0) continue; ctx.globalAlpha = a; ctx.fillStyle = COL.ink; fit(ctx, spec.name(SC[k], tr), padL, 13, hw, fs + 1, 700); }
    ctx.globalAlpha = 1;
    ctx.font = `${fs - 0.5}px system-ui, sans-serif`; ctx.fillStyle = COL.soft;
    const kTxt = (k) => tr("las-k-line", "k at 0.25 m: {a} · 1 m: {b} · 1.75 m: {c}").replace("{a}", fmtK(lasK(SC[k].air, kAt[0], SC[k].S), tr.lang)).replace("{b}", fmtK(lasK(SC[k].air, kAt[1], SC[k].S), tr.lang)).replace("{c}", fmtK(lasK(SC[k].air, kAt[2], SC[k].S), tr.lang));
    for (const [k, a] of [[i, 1 - f], [j, f]]) { if (a <= 0) continue; ctx.globalAlpha = a;
      if (narrow) fit(ctx, kTxt(k), padL, 28, hw, fs - 0.5); else { ctx.textAlign = "right"; fit(ctx, kTxt(k), W - padR, 13, hw - 10, fs - 0.5); ctx.textAlign = "left"; } }
    ctx.globalAlpha = 1;
    const P = { beams, SC, HMAX };
    panel(ctx, P, { x: padL, y: padT, w: Wd, h: ph }, true, i, j, f, sx, sy, fs, tr);
    panel(ctx, P, { x: padL, y: padT + ph + gap, w: Wd, h: ph }, false, i, j, f, sx, sy, fs, tr);
    ctx.textAlign = "left"; ctx.fillStyle = COL.faint; ctx.font = `${fs - 1.5}px system-ui, sans-serif`;
    const foot = spec.foot(SC[i], tr),
      exs = tr("las-foot-ex", "heights ×{ex}, planet ÷{ex}").split("{ex}").join(Math.round(ex).toLocaleString(tr.lang || "en"));
    if (narrow) { fit(ctx, foot, padL, H - 20, W - padL - padR, fs - 1.5); fit(ctx, exs, padL, H - 7, W - padL - padR, fs - 1.5); }
    else fit(ctx, `${foot} · ${exs}`, padL, H - 8, W - padL - padR, fs - 1.5);
    ctx.textBaseline = "alphabetic";
  };
  return { T, beams, phase, draw, mount: (canvas, reads, tr) => mountAnim({ T, beams, phase, draw, SC, spec }, canvas, reads, tr) };
}

/** Écrit txt sur une ligne, police réduite s'il le faut pour tenir dans maxW (le texte d'un canvas ne revient pas à la ligne). */
function fit(ctx, txt, x, y, maxW, size, weight = 400) {
  let f = size; ctx.font = `${weight} ${f}px system-ui, sans-serif`;
  while (f > 7 && ctx.measureText(txt).width > maxW) { f -= 0.5; ctx.font = `${weight} ${f}px system-ui, sans-serif`; }
  ctx.fillText(txt, x, y);
}

/** Trace les morceaux d'un rayon avant tout rebond (refl faux) ou après au moins un (refl vrai). */
function strokeRuns(ctx, pts, X, Y, refl) {
  ctx.beginPath(); let pen = false;
  for (const [x, h, n] of pts) { if ((n > 0) !== refl) { pen = false; continue; } pen ? ctx.lineTo(X(x), Y(x, h)) : ctx.moveTo(X(x), Y(x, h)); pen = true; }
  ctx.stroke();
}

const fmtK = (k, lang = "en") => (k < 0 ? "−" : "") + Math.abs(k).toLocaleString(lang, { minimumFractionDigits: Math.abs(k) >= 10 ? 0 : 2, maximumFractionDigits: Math.abs(k) >= 10 ? 0 : 2 });

function panel(ctx, P, b, globe, i, j, f, sx, sy, fs, tr) {
  const { beams: lasBeams, SC, HMAX } = P, { D, hL, hE } = SC[i].S;
  const bulge = (x) => (globe ? x * (D - x) / (2 * REF_R) : 0);
  const X = (x) => b.x + x * sx, Y = (x, h) => b.y + b.h - (bulge(x) + h) * sy;
  ctx.save(); ctx.beginPath(); ctx.rect(b.x - 2, b.y, b.w + 4, b.h + 2); ctx.clip();
  // ciel et eau
  ctx.fillStyle = globe ? "#eef2fb" : "#fbf3e8"; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.beginPath(); for (let k = 0; k <= 100; k++) { const x = D * k / 100; k ? ctx.lineTo(X(x), Y(x, 0)) : ctx.moveTo(X(x), Y(x, 0)); }
  ctx.lineTo(b.x + b.w, b.y + b.h + 2); ctx.lineTo(b.x, b.y + b.h + 2); ctx.closePath(); ctx.fillStyle = "#cfe5e1"; ctx.fill();
  ctx.strokeStyle = COL.water; ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = 0; k <= 100; k++) { const x = D * k / 100; k ? ctx.lineTo(X(x), Y(x, 0)) : ctx.moveTo(X(x), Y(x, 0)); } ctx.stroke();
  // les rayons : ceux de l'air affiché, puis ceux du suivant pendant le fondu
  for (const [k, a] of [[i, 1 - f], [j, f]]) {
    if (a <= 0) continue;
    const bm = lasBeams(k)[globe ? "g" : "p"];
    ctx.globalAlpha = a; ctx.lineWidth = 1;
    // direct (rouge) puis réfléchi par l'eau (plus pâle, pointillé) : on voit quels rayons arrivent grâce au seul miroir
    for (const refl of [false, true]) {
      ctx.strokeStyle = refl ? "rgba(220,38,38,.16)" : "rgba(220,38,38,.3)"; ctx.setLineDash(refl ? [3, 2] : []);
      for (const r of bm.rays) strokeRuns(ctx, r.pts, X, Y, refl);
    }
    // l'axe du faisceau, plus marqué
    const mid = bm.rays[bm.rays.length >> 1];
    ctx.strokeStyle = COL.beam; ctx.lineWidth = 1.6; ctx.setLineDash([]); strokeRuns(ctx, mid.pts, X, Y, false);
    ctx.strokeStyle = "rgba(220,38,38,.55)"; ctx.setLineDash([3, 2]); strokeRuns(ctx, mid.pts, X, Y, true); ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
  // laser et œil
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(X(0) + 1, Y(0, 0)); ctx.lineTo(X(0) + 1, Y(0, hL)); ctx.moveTo(X(D) - 1, Y(D, 0)); ctx.lineTo(X(D) - 1, Y(D, hE)); ctx.stroke();
  ctx.fillStyle = COL.beam; ctx.fillRect(X(0), Y(0, hL) - 3, 7, 6);
  ctx.restore();
  // verdict de l'œil, en fondu
  const vs = [[i, 1 - f], [j, f]], dy = b.w < 480 ? fs * 1.25 : 0;   // étroit : le verdict sous le titre du panneau
  ctx.textBaseline = "middle"; ctx.font = `700 ${fs}px system-ui, sans-serif`;
  ctx.fillStyle = globe ? COL.globe : COL.flat; ctx.textAlign = "left";
  ctx.fillText(globe ? tr("las-globe", "Globe") : tr("las-plane", "Plane, same air"), b.x + 6, b.y + fs);
  const nf1 = (x, d) => x.toLocaleString(tr.lang || "en", { minimumFractionDigits: d, maximumFractionDigits: d });
  // un fond clair derrière chaque ligne, pour qu'un faisceau qui passe dessous ne la rende pas illisible
  const plate = (txt, x, y, h) => { const w = ctx.measureText(txt).width; ctx.fillStyle = "rgba(251,250,247,.85)"; ctx.fillRect(x - w - 3, y - h * 0.62, w + 6, h * 1.24); };
  for (const [k, a] of vs) {
    if (a <= 0) continue; const bm = lasBeams(k)[globe ? "g" : "p"];
    ctx.globalAlpha = a; ctx.textAlign = "right";
    const l1 = !bm.seen ? tr("las-hidden", "the eye does not see it") : bm.direct ? tr("las-seen", "the eye sees the beam") : tr("las-seen-refl", "the eye sees it, by reflection only");
    plate(l1, b.x + b.w - 6, b.y + dy + fs, fs); ctx.fillStyle = bm.seen ? COL.seen : COL.soft; ctx.fillText(l1, b.x + b.w - 6, b.y + dy + fs);
    ctx.font = `${fs - 1}px system-ui, sans-serif`;
    const above = bm.lo > HMAX;
    const l2 = above ? tr("las-above", "whole beam {lo}–{hi} m up at the eye").replace("{lo}", nf1(bm.lo, 0)).replace("{hi}", nf1(bm.hi, 0))
      : tr("las-span", "light from {lo} to {hi} m at the eye").replace("{lo}", nf1(bm.lo, 1)).replace("{hi}", nf1(bm.hi, 1));
    plate(l2, b.x + b.w - 6, b.y + dy + fs * 2.3, fs - 1); ctx.fillStyle = COL.soft; ctx.fillText(l2, b.x + b.w - 6, b.y + dy + fs * 2.3);
    if (bm.bounced) { const l3 = tr("las-bounced", "{n} of {N} rays reflected by the water").replace("{n}", bm.bounced).replace("{N}", bm.rays.length);
      plate(l3, b.x + b.w - 6, b.y + dy + fs * 3.5, fs - 1); ctx.fillStyle = COL.soft; ctx.fillText(l3, b.x + b.w - 6, b.y + dy + fs * 3.5); }
    ctx.font = `700 ${fs}px system-ui, sans-serif`;
  }
  ctx.globalAlpha = 1;
  // l'œil
  const ey = Y(D, hE); ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(X(D) - 1, ey, 3.2, 0, 7); ctx.fill();
  if (globe) { ctx.font = `${fs - 1.5}px system-ui, sans-serif`; ctx.fillStyle = COL.water; ctx.textAlign = "center";
    ctx.fillText(tr("las-bulge", "bulge {m} m").replace("{m}", (D * D / (8 * REF_R)).toLocaleString(tr.lang || "en", { minimumFractionDigits: 1, maximumFractionDigits: 1 })), X(D / 2), Y(D / 2, 0) + fs * 0.9); }
}

/** Monte la figure : boucle visible, clic = pause, contrat __anim de l'export. reads = <p> des lectures. */
function mountAnim(A, canvas, reads, tr) {
  const { T: LAS_T, beams: lasBeams, phase: lasPhase, draw: drawLaser, SC, spec } = A;
  const st = { time: 0, playing: !reducedMotion(), vis: true, raf: null, last: 0, dead: false, shown: -1 };
  if (!st.playing) st.time = spec.still ?? 1;   // à l'arrêt : l'image parlante de la spec
  const readsAt = (t) => {
    if (!reads) return; const { i, f } = lasPhase(t), k = f > 0.5 ? (i + 1) % SC.length : i; if (k === st.shown) return; st.shown = k;
    const B = lasBeams(k), v = (bm) => (!bm.seen ? tr("las-r-hidden", "hidden") : bm.direct ? tr("las-r-seen", "seen") : tr("las-r-refl", "seen by reflection"));
    reads.innerHTML = `<span class="r"><b>${spec.name(SC[k], tr)}</b></span>` +
      `<span class="r"><span class="dot" style="background:${COL.globe}"></span>${tr("las-r-globe", "globe: {v}").replace("{v}", v(B.g))}</span>` +
      `<span class="r"><span class="dot" style="background:${COL.flat}"></span>${tr("las-r-plane", "plane: {v}").replace("{v}", v(B.p))}</span>`;
  };
  const paint = () => { const { ctx, W, H } = setupCanvas(canvas); if (!W) return; drawLaser(ctx, W, H, st.time, tr); readsAt(st.time); };
  const loop = () => {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (st.dead || !st.playing || !st.vis || exportBusy() || canvas.closest("[hidden]")) { st.last = 0; return; }
      const n = frameStep(st, ts);
      if (n) { st.time = (st.time + n / 60) % LAS_T; paint(); }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  };
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); });
  let saved = null;
  canvas.__anim = {
    duration: LAS_T,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(x) { st.time = x; paint(); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0, shown: -1 }); saved = null; paint(); if (st.playing) loop(); },
    readout: () => [...(reads?.querySelectorAll(".r") || [])].slice(1).map((r) => r.textContent.replace(/\s+/g, " ").trim()).join(" · "),
  };
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => { st.vis = es.some((x) => x.isIntersecting); if (st.vis) loop(); }) : null;
  io?.observe(canvas);
  return {
    start() { paint(); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
    dispose() { st.dead = true; io?.disconnect(); if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
  };
}

// ---- l'animation de l'onglet ref : quatre airs sur le dispositif du 23 février 2019 ----
export const REF_LASER = makeLaserAnim({
  scenes: LAS_AIRS.map((a) => ({ key: a.key, air: a, S: LAS })),
  name: (sc, tr) => tr(`las-air-${sc.key}`, sc.key),
  foot: (sc, tr) => tr("las-foot", "1 mrad beam, level, 1 m above the water · eye 1 m, 15.3 km away · 23 Feb 2019"),
  still: 2 * (LAS_HOLD + LAS_FADE) + 1,   // à l'arrêt : l'air mesuré à Worthing
});
export const LAS_T = REF_LASER.T;
export const lasBeams = REF_LASER.beams, lasPhase = REF_LASER.phase, drawLaser = REF_LASER.draw;
/** Monte la figure de ref (reads = <p> des lectures). */
export const mountLaserFig = (canvas, reads, tr) => REF_LASER.mount(canvas, reads, tr);
