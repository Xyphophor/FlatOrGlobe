// Animations de l'onglet scale (epic28, 2026-10-17).
//
// 1. L'horloge (mountClock) : à l'heure de l'ordinateur, chaque aiguille au vrai angle du mouvement qu'elle représente
//    (logic.js, armAngle : une droite dans le temps). RIEN N'EST ACCÉLÉRÉ. Sur le cadran, même l'aiguille la plus rapide
//    ne bouge que de 0,25° par minute ; pour que le mouvement se voie, chaque aiguille a aussi une réglette graduée dans
//    son propre angle (secondes d'arc, ou microsecondes d'arc pour les plus lentes) qui défile à la vitesse vraie, et le
//    chiffre de l'angle, assez long pour que les dernières décimales changent à chaque image.
// 2. Le zoom des puissances de dix (mountZoom) : de la Terre à Andromède, chaque image à l'échelle (une échelle par image,
//    imprimée), les objets à leurs vraies distances (logic.js, RUNGS).
import { text, disc, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { reducedMotion, exportBusy } from "../../core/motion.js";
import { keyClickable } from "../../core/a11y.js";
import { pixelRatio } from "../../core/canvas.js";
import { ARMS, armAngle, arcsecPerSecond, turnedArcsec, RUNGS, AU_KM, PC_KM } from "./logic.js";

export const ARM_STYLE = {
  // tick : une graduation de la réglette, en secondes d'arc ; unit : l'unité des compteurs ; dec : décimales de l'angle
  spin: { c: "#1d4ed8", len: 0.95, w: 3.2, tick: 1, unit: "″", dec: 5, name: "The Earth's rotation" },
  orbit: { c: "#0f766e", len: 0.8, w: 3, tick: 0.01, unit: "″", dec: 7, name: "The Earth around the Sun" },
  axis: { c: "#6d28d9", len: 0.66, w: 2.6, tick: 1e-6, unit: "µas", dec: 10, name: "Precession of the axis" },
  perihelion: { c: "#c2410c", len: 0.52, w: 2.4, tick: 1e-7, unit: "µas", dec: 11, name: "Precession of the orbit" },
  galaxy: { c: "#151a21", len: 0.38, w: 2.2, tick: 1e-10, unit: "nas", dec: 14, name: "The Sun around the Galaxy" },
};
const UNIT = { "″": 1, "µas": 1e6, "nas": 1e9 };   // secondes d'arc -> unité affichée

/** Durée lisible d'une période (s). */
export function periodText(s, tr, lang) {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }), Y = 365.25 * 86400;
  if (s < 2 * 86400) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return `${h} h ${m} min ${nf(s % 60, 1)} s`; }
  if (s < 2 * Y) return `${nf(s / 86400, 3)} ${tr("u-days", "days")}`;
  if (s < 1e6 * Y) return `${nf(Math.round(s / Y / 10) * 10, 0)} ${tr("u-years", "years")}`;
  return `${nf(s / Y / 1e6, 0)} ${tr("u-myears", "million years")}`;
}

export function mountClock(canvas, tr, lang = "en") {
  const st = { raf: null, vis: true, t0: Date.now(), exporting: false, fixed: null, playing: !reducedMotion() };
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const paint = (ms = Date.now()) => {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dpr = pixelRatio(2), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, r.width, r.height, ms);
  };
  function draw(ctx, W, H, ms) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const narrow = W < 620, dial = narrow ? [0, 0, W, Math.min(W, H * 0.42)] : [0, 0, W * 0.42, H];
    const R = Math.min(dial[2], dial[3]) * 0.4, cx = dial[0] + dial[2] / 2, cy = dial[1] + dial[3] / 2 + 6;
    // le cadran : 24 graduations, sens direct vu du nord
    disc(ctx, cx, cy, R * 1.04, "#f2f0ea", "#d7d3c8", 1);
    for (let k = 0; k < 24; k++) { const a = k / 24 * 2 * Math.PI, l = k % 6 ? 0.04 : 0.09; ctx.strokeStyle = SOFT; ctx.lineWidth = k % 6 ? 1 : 1.6; ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); ctx.lineTo(cx + R * (1 - l) * Math.cos(a), cy - R * (1 - l) * Math.sin(a)); ctx.stroke(); }
    text(ctx, "0°", cx + R * 1.08, cy + 4, { size: 9.5, c: SOFT });
    for (const arm of [...ARMS].reverse()) {
      const s = ARM_STYLE[arm.id], a = (armAngle(arm, ms) * Math.PI) / 180;
      ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * s.len * Math.cos(a), cy - R * s.len * Math.sin(a)); ctx.stroke();
      disc(ctx, cx + R * s.len * Math.cos(a), cy - R * s.len * Math.sin(a), 3, s.c);
    }
    ctx.lineCap = "butt"; disc(ctx, cx, cy, 4, INK);
    text(ctx, `${tr("clk-dial", "true angles, now, counted counterclockwise as seen from the north")} · ${tr("clk-open", "open for")} ${nf((ms - st.t0) / 1000, 0)} s · ${tr("clk-nofast", "nothing sped up")}`, dial[0] + 8, dial[1] + dial[3] - 8, { size: 10, c: SOFT, maxW: dial[2] - 16, up: true });
    // les lignes : nom, un tour, angle actuel, et la réglette qui défile à la vitesse vraie
    const P = narrow ? [8, dial[3] + 4, W - 16, H - dial[3] - 10] : [W * 0.44, 10, W * 0.56 - 12, H - 20];
    const rh = P[3] / ARMS.length, since = (ms - st.t0) / 1000;
    ARMS.forEach((arm, i) => {
      const s = ARM_STYLE[arm.id], y = P[1] + rh * i, deg = armAngle(arm, ms);
      text(ctx, tr(`arm-${arm.id}`, s.name), P[0], y + 14, { size: 12, bold: true, c: s.c, maxW: P[2] * 0.62 });
      text(ctx, `${tr("clk-turn", "one turn")} ${periodText(arm.period, tr, lang)}`, P[0] + P[2], y + 14, { size: 10.5, c: SOFT, align: "right" });
      text(ctx, `${nf(deg, s.dec)}°`, P[0], y + 32, { size: 12, mono: true });
      const turned = turnedArcsec(arm, st.t0, ms), shown = turned * UNIT[s.unit];
      text(ctx, `${tr("clk-since", "since the page opened")} +${nf(shown, arm.id === "spin" ? 1 : 3)} ${s.unit}`, P[0] + P[2], y + 32, { size: 10.5, c: SOFT, align: "right" });
      // la réglette : une graduation = s.tick secondes d'arc, 12 px ; elle glisse vers la gauche de turned/tick graduations
      const ty = y + 44, th = Math.min(16, rh - 50), x0 = P[0], x1 = P[0] + P[2], px = 12, steps = turned / s.tick;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, ty, x1 - x0, th + 12); ctx.clip();
      ctx.fillStyle = "#f2f0ea"; ctx.fillRect(x0, ty, x1 - x0, th);
      const first = Math.floor(steps), off = (steps - first) * px;
      for (let k = 0; k * px < x1 - x0 + px; k++) {
        const n = first + k, x = x0 + k * px - off, big = n % 5 === 0;
        ctx.strokeStyle = s.c; ctx.lineWidth = big ? 1.4 : 0.8; ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x, ty + (big ? th : th * 0.55)); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0 + 1, ty - 2); ctx.lineTo(x0 + 1, ty + th + 2); ctx.stroke();
      const tickTxt = s.unit === "″" ? `${s.tick}″` : `${nf(s.tick * UNIT[s.unit], 1)} ${s.unit}`;
      text(ctx, `${tr("clk-tape", "one graduation")} = ${tickTxt} · ${nf(arcsecPerSecond(arm) / s.tick, arcsecPerSecond(arm) / s.tick < 10 ? 2 : 0)} ${tr("clk-persec", "per second")}`, x1, ty + th + 11, { size: 9.5, c: SOFT, align: "right" });
    });
  }
  const loop = () => {
    if (st.raf || st.exporting || typeof requestAnimationFrame !== "function") return;
    let last = 0;
    const step = (ts) => {
      st.raf = null;
      if (!st.vis || canvas.closest("[hidden]")) return;
      // pas plus de 30 images/s ; une par seconde si l'utilisateur a demandé moins d'animations
      if (ts - last >= (st.playing ? 33 : 1000)) { last = ts; paint(); }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  };
  keyClickable(canvas);
  canvas.addEventListener("click", () => { st.playing = !st.playing; });
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);
  // export vidéo : 20 s en temps réel, à partir de l'instant de l'export
  let tExp = 0;
  canvas.__anim = {
    duration: 20,
    begin() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.exporting = true; tExp = Date.now(); },
    frameAt(t) { paint(tExp + t * 1000); },
    end() { st.exporting = false; paint(); loop(); },
  };
  return { start() { paint(); loop(); }, stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; }, redraw: () => paint() };
}

/* ---- 2. puissances de dix : de la Terre à Andromède ---------------------------------------------------------------- */
// La Terre au centre de chaque image ; chaque objet à sa vraie distance de nous (logic.js, RUNGS), dans sa propre direction,
// avec son cercle de distance tracé et nommé dès qu'il est assez grand pour se voir. Le champ s'élargit d'un facteur 10
// environ toutes les 1,4 s ; chaque image a son échelle (barre imprimée). Les disques sont à l'échelle quand ils dépassent
// 2 px (le Soleil, la Galaxie, Andromède), sinon un point.
export function mountZoom(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const km = (id) => RUNGS.find((r) => r.id === id).km, LY = 299792.458 * 31557600;   // année-lumière julienne
  const L0 = Math.log10(2e4), L1 = Math.log10(4e19), SPAN = 26;
  const obj = [
    { id: "moon", d: km("moon"), ang: 20, r: 1737.4, c: SOFT, name: "Moon" },
    { id: "sun", d: AU_KM, ang: 60, r: 696000, c: "#ca8a04", name: "Sun" },
    { id: "neptune", d: km("neptune"), ang: 100, r: 24622, c: SEA, name: "Neptune" },
    { id: "proxima", d: km("proxima"), ang: 150, r: 107000, c: FLAT, name: "Proxima Centauri" },
    { id: "gc", d: km("gc"), ang: 200, r: 15e3 * PC_KM, c: "#6d28d9", name: "Galactic centre", disc: "rgba(109,40,217,.10)" },
    { id: "m31", d: km("m31"), ang: 330, r: 20e3 * PC_KM, c: INK, name: "Andromeda", disc: "rgba(21,26,33,.08)" },
  ];
  const dist = (x) => (x < 1e7 ? `${nf(x, 0)} km` : x < 1e12 ? `${nf(x / 1e6, x < 1e9 ? 1 : 0)} ${tr("u-mkm", "million km")}` : `${nf(x / LY, x < 1e14 ? 2 : 0)} ${tr("u-ly", "light-years")}`);
  let st = { u: 0, raf: null, playing: !reducedMotion(), last: 0, vis: true, exporting: false };
  const paint = () => {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dpr = pixelRatio(2), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawZoom(ctx, r.width, r.height, st.u);
  };
  function drawZoom(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2 + 10, half = Math.min(W, H - 60) * 0.46;
    const f = Math.min(1, u / 0.85), Lh = L0 + (L1 - L0) * f, halfKm = 10 ** Lh, k = half / halfKm;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 30, W, H - 60); ctx.clip();
    // la Terre
    const re = 6371 * k; if (re > 2) disc(ctx, cx, cy, re, "#dbeafe", GLOBE, 1.4); else disc(ctx, cx, cy, 2.8, GLOBE);
    if (re > 6 || Lh < 5.5) text(ctx, tr("z-earth", "Earth"), cx + Math.max(re, 3) + 5, cy + 14, { size: 10.5, c: GLOBE });
    // notre Galaxie : son disque (15 kpc de rayon) autour du centre galactique, dès qu'il se voit
    { const g = obj.find((o) => o.id === "gc"), a = (g.ang * Math.PI) / 180, rr = g.r * k;
      if (rr > 2 && g.d * k < 6) { disc(ctx, cx + g.d * k * Math.cos(a), cy - g.d * k * Math.sin(a), rr, g.disc, g.c, 1); text(ctx, tr("z-mw", "the Milky Way"), cx + rr * 0.72, cy - rr * 0.72 - 4, { size: 11, bold: true, c: g.c }); } }
    for (const o of obj) {
      const rho = o.d * k; if (rho < 6 || rho > 3 * W) continue;
      const a = (o.ang * Math.PI) / 180, x = cx + rho * Math.cos(a), y = cy - rho * Math.sin(a);
      ctx.strokeStyle = o.c; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, rho, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      const rr = o.r * k;
      if (rr > 2) disc(ctx, x, y, rr, o.disc || o.c + "33", o.c, 1.2); else disc(ctx, x, y, 3, o.c);
      if (rho > 22) { text(ctx, tr(`z-${o.id}`, o.name), x + Math.max(rr, 3) + 5, y - 3, { size: 11, bold: true, c: o.c }); text(ctx, dist(o.d), x + Math.max(rr, 3) + 5, y + 11, { size: 10, c: SOFT }); }
    }
    ctx.restore();
    // le dernier objet dépassé et le suivant : les images vides le sont parce que l'espace l'est
    { const inside = obj.filter((o) => o.d < halfKm).at(-1), next = obj.find((o) => o.d >= halfKm);
      const msg = [inside ? `${tr("z-passed", "passed")}: ${tr(`z-${inside.id}`, inside.name)} (${dist(inside.d)})` : "", next ? `${tr("z-next", "next")}: ${tr(`z-${next.id}`, next.name)} (${dist(next.d)})` : ""].filter(Boolean).join(" · ");
      text(ctx, msg, W / 2, H - 40, { size: 10.5, c: SOFT, align: "center", maxW: W - 20, up: true }); }
    // l'échelle de l'image et le temps de lumière d'un demi-champ
    const e = Math.floor(Math.log10(halfKm * 0.6)), barKm = 10 ** e, barPx = barKm * k, sup = (n) => String(n).split("").map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[ch] || ch).join("");
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(12, H - 20); ctx.lineTo(12 + barPx, H - 20); ctx.moveTo(12, H - 24); ctx.lineTo(12, H - 16); ctx.moveTo(12 + barPx, H - 24); ctx.lineTo(12 + barPx, H - 16); ctx.stroke();
    text(ctx, `10${sup(e)} km`, 18 + barPx, H - 16, { size: 11, mono: true });
    const lt = halfKm / 299792.458, ltTxt = lt < 120 ? `${nf(lt, 1)} s` : lt < 7200 ? `${nf(lt / 60, 0)} min` : lt < 2 * 86400 ? `${nf(lt / 3600, 0)} h` : lt < 2 * 31557600 ? `${nf(lt / 86400, 0)} ${tr("u-days", "days")}` : `${nf(lt / 31557600, 0)} ${tr("u-years", "years")}`;
    text(ctx, `${tr("z-field", "from the centre to the edge")}: ${dist(halfKm)}${halfKm < 1e12 ? ` · ${tr("z-light", "light takes")} ${ltTxt}` : ""}`, 10, 20, { size: 12, bold: true, maxW: W - 20 });
    text(ctx, tr("z-st", "each frame to scale (bar) · dots: too small to see at that scale"), W - 6, H - 6, { size: 9.5, c: SOFT, align: "right", maxW: W * 0.55, up: true });
  }
  const loop = () => {
    if (st.raf || st.exporting || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      if (st.last && ts - st.last < 32) { st.raf = requestAnimationFrame(step); return; }
      if (st.last) st.u = (st.u + Math.min(0.2, (ts - st.last) / 1000) / SPAN) % 1;
      st.last = ts; paint(); st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  };
  keyClickable(canvas);
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); else paint(); });
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);
  let saved = null;
  canvas.__anim = { duration: SPAN, begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.exporting = true; }, frameAt(t) { st.u = (t / SPAN) % 1; paint(); }, end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); st.exporting = false; paint(); if (st.playing) loop(); } };
  return { start() { paint(); if (st.playing) loop(); }, stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; }, redraw: paint };
}
