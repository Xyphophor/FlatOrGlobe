// Le saros sur un globe (epic09/UC04), canvas 2D.
//
// TOUT CE QUI EST DESSINÉ EST PUBLIÉ : les bandes de totalité de 2009, 2027 et
// 2045 (limites nord/sud et ligne centrale toutes les 2 min) et les points de
// plus grande éclipse des 71 membres de la série 136 (NASA, Espenak ;
// src/data/presets/ecl.js). La page ne calcule rien pour cette figure ; elle
// tourne le globe. La caméra suit le point de plus grande éclipse d'un membre
// au suivant : le mouvement de la caméra EST le décalage vers l'ouest.
// Projection orthographique d'un globe (globe25d), rien d'étiré.
import { exportBusy } from "../../core/motion.js";
import { drawGlobe25, globeVec } from "../../core/globe25d.js";
import { ECL_PATHS, SAROS136 } from "../../data/presets/ecl.js";
import { keyClickable } from "../../core/a11y.js";
import { pixelRatio, fillTextFit } from "../../core/canvas.js";

const R = Math.PI / 180;
const MEMBERS = [["2009", 1, "#6d9eeb"], ["2027", 2, "#ff9a7a"], ["2045", 3, "#9be08a"]];
const T_RUN = 2.6, T_HOLD = 1.6, T_TURN = 2.6, T_ALL = T_RUN + T_HOLD + T_TURN;

export function mountSaros(canvas, readsEl, tr) {
  // "2027 Aug 02" (catalogue NASA) -> "2 Aug 2027", mois traduit
  const MON = tr("months", "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec").split(",");
  const EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fd = (s) => { const [y, m, d] = s.split(" "); return `${+d} ${MON[EN.indexOf(m)]} ${y}`; };
  const byRel = Object.fromEntries(SAROS136.map((r) => [r.rel, r]));
  const st = { time: 0, playing: true, last: 0, raf: null, vis: true };
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { st.playing = false; st.time = T_ALL + T_RUN; }
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); });
  keyClickable(canvas); // clavier : Entrée/Espace = pause (epic06/UC03)

  const wrap = (a) => ((a + 540) % 360) - 180;
  function draw() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dpr = pixelRatio(2);
    if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = r.width, H = r.height;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);

    // étape courante : membre k (0,1,2), phase dans le cycle
    const cyc = st.time % (3 * T_ALL), k = Math.floor(cyc / T_ALL), ph = cyc - k * T_ALL;
    const [yr, rel, col] = MEMBERS[k], ge = byRel[rel], next = byRel[MEMBERS[(k + 1) % 3][1]];
    // caméra : sur le maximum du membre, puis rotation vers le suivant pendant T_TURN
    const u = ph <= T_RUN + T_HOLD ? 0 : (ph - T_RUN - T_HOLD) / T_TURN, e = u * u * (3 - 2 * u);
    const lon0 = ge.lon + wrap(next.lon - ge.lon) * e, lat0 = 18 + (ge.lat + (next.lat - ge.lat) * e - 18) * 0.5;
    const f = globeVec(lat0, lon0), ev = [-Math.sin(lon0 * R), 0, -Math.cos(lon0 * R)];
    const nv = [f[1] * ev[2] - f[2] * ev[1], f[2] * ev[0] - f[0] * ev[2], f[0] * ev[1] - f[1] * ev[0]];
    const sc = Math.min(W * 0.4, H * 0.42), cx = W / 2, cy = H / 2 + 8;
    const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const P = (p) => [cx + dot3(p, ev) * sc, cy - dot3(p, nv) * sc, dot3(p, f)];
    const LL = (la, lo) => P(globeVec(la, lo));
    drawGlobe25(ctx, P, sc, {});

    // les 71 maxima de la série, du plus ancien (pâle) au plus récent
    SAROS136.forEach((m, i) => {
      const q = LL(m.lat, m.lon); if (q[2] < 0.05) return;
      ctx.fillStyle = `rgba(90,100,115,${(0.2 + 0.5 * i / SAROS136.length).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(q[0], q[1], 1.8, 0, 7); ctx.fill();
    });
    // les bandes : membres déjà passés en entier, le courant jusqu'à la fraction courue
    const band = (rows, color, frac) => {
      const pts = rows.filter((x) => x.t !== "Limits"), n = Math.max(2, Math.round(pts.length * frac));
      for (let i = 0; i < n - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const q = [LL(...a.n), LL(...b.n), LL(...b.s), LL(...a.s)];
        if (q.some((p) => p[2] < 0.02)) continue;
        ctx.fillStyle = color; ctx.globalAlpha = 0.55; ctx.beginPath(); q.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.beginPath(); let pen = false;
      for (let i = 0; i < n; i++) { const q = LL(...pts[i].c); if (q[2] < 0.02) { pen = false; continue; } pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; }
      ctx.stroke();
      const q = LL(...pts[n - 1].c);                                   // l'ombre, en tête
      if (frac < 1 && q[2] > 0.02) { ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, 7); ctx.fill(); }
    };
    for (let j = 0; j <= k; j++) band(ECL_PATHS[MEMBERS[j][0]], MEMBERS[j][2], j < k ? 1 : Math.min(1, ph / T_RUN));
    // flèche vers l'ouest pendant la rotation
    if (u > 0) {
      const a = LL(ge.lat, ge.lon), b = LL(next.lat, next.lon);
      if (a[2] > 0 && b[2] > 0) { ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]); }
    }
    // textes
    ctx.fillStyle = "#151a21"; ctx.font = "600 13px ui-monospace, Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText(u > 0 ? `${fd(ge.date)} → ${fd(next.date)}` : fd(ge.date), 10, 18);
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#5b6470";
    fillTextFit(ctx, u > 0 ? tr("saros-turn", "+ 1 saros: 6,585 d 7 h 43 min — the Earth turns the extra 7 h 43 min") : tr("saros-path", "published path of totality (NASA)"), 10, 33, W - 20);
    fillTextFit(ctx, tr("saros-stamp", "orthographic globe · paths and points as published · click: pause"), 10, H - 8, W - 20, { dir: -1 });

    if (readsEl) {
      const shift = (a, b) => wrap(b.lon - a.lon);
      const html = MEMBERS.map(([y, rl, c], j) => {
        const m = byRel[rl], prev = byRel[rl - 1];
        return `<span${j === k ? ' style="font-weight:700"' : ""}><span class="dot" style="background:${c}"></span>${fd(m.date)} · ${m.lat.toFixed(1)}° ${m.lon >= 0 ? m.lon.toFixed(1) + "° " + tr("east", "E") : (-m.lon).toFixed(1) + "° " + tr("west", "W")} · ${tr("saros-shift", "shift")} ${shift(prev, m).toFixed(1)}°</span>`;
      }).join("");
      if (readsEl._last !== html) { readsEl.innerHTML = html; readsEl._last = html; }
    }
  }

  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      if (st.last && ts - st.last < 32) { st.raf = requestAnimationFrame(step); return; }
      if (st.last) st.time += (ts - st.last) / 1000;
      st.last = ts; draw();
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);

  // export (epic10/UC02) : l'animation rejouée à l'instant t, puis remise en état
  let saved = null;
  canvas.__anim = {
    duration: 3 * T_ALL,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(t) { st.time = t; draw(); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(); if (st.playing) loop(); },
  };
  return {
    start() { draw(); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
  };
}
