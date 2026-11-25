// Maquette « pourquoi pas une éclipse chaque mois » (epic09/UC03), canvas 2D.
//
// PAS À L'ÉCHELLE, et c'est écrit sur la figure (règle 1) : tailles et
// distances comprimées, inclinaison de l'orbite lunaire dessinée ×3 (vraie :
// 5,145°) -- à l'échelle, elle serait invisible. Tout le RESTE est réel : le
// temps parcourt 2027 avec les éléments moyens de Meeus (logic.js) -- la
// position du Soleil, l'élongation D de la Lune, son argument de latitude F et
// le nœud ascendant Ω, qui recule d'environ 19° par an. Le verdict « éclipse »
// à chaque syzygie est le critère de Meeus (|sin F| < 0,36), calculé avec la
// VRAIE inclinaison, jamais lu sur le dessin.
import { exportBusy } from "../../core/motion.js";
import { meanElements, syzygies, jdOf, dateOf, MOON_INCL } from "./logic.js";
import { pixelRatio, fillTextFit } from "../../core/canvas.js";

const R = Math.PI / 180;
const EXAG = 3;                          // inclinaison dessinée ×3
const RM = 0.3, RE = 0.035, RMOON = 0.013;
const DAYS_PER_S = 10;                   // 2027 défile en ~36 s
const MONTHS_EN = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec";

export function mountNodes(canvas, readsEl, tr) {
  const MONTHS = tr("months", MONTHS_EN).split(",");
  const JD0 = jdOf(2027, 1, 1), JD1 = jdOf(2028, 1, 1);
  const SYZ = syzygies(JD0, JD1);
  const st = { jd: JD0 + 20, playing: true, last: 0, raf: null, vis: true, yaw: -0.5, pitch: 0.55, drag: null };
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { st.playing = false; st.jd = jdOf(2027, 8, 2); }

  // caméra orbitale propre (pas la V3D partagée de dist/cnav)
  const rot = (p) => {
    const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
  };
  canvas.style.touchAction = "none"; canvas.style.cursor = "grab";
  canvas.addEventListener("pointerdown", (e) => { st.drag = { x: e.clientX, y: e.clientY, moved: false }; canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!st.drag) return;
    const dx = e.clientX - st.drag.x, dy = e.clientY - st.drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) st.drag.moved = true;
    st.yaw += dx * 0.008; st.pitch = Math.max(-1.3, Math.min(1.45, st.pitch + dy * 0.008));
    st.drag.x = e.clientX; st.drag.y = e.clientY; if (!st.playing) draw();
  });
  const up = () => { if (st.drag && !st.drag.moved) { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); } st.drag = null; };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", () => { st.drag = null; });
  // clavier (epic06/UC03) : Entrée/Espace = pause, comme un clic sans glisser
  canvas.setAttribute("tabindex", "0");
  canvas.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; e.preventDefault(); st.playing = !st.playing; st.last = 0; if (st.playing) loop(); });

  function draw() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dpr = pixelRatio(2);
    if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = r.width, H = r.height, stripH = 46;
    const sc = Math.min(W * 0.38, (H - stripH - 30) * 0.62), cx = W / 2, cy = (H - stripH) / 2 + 6;
    const P = (p) => { const q = rot(p); return [cx + q[0] * sc, cy - q[1] * sc, q[2]]; };
    ctx.fillStyle = "#0e1320"; ctx.fillRect(0, 0, W, H);

    const m = meanElements(st.jd);
    const lamE = m.sunLon + 180, E = [Math.cos(lamE * R), 0, -Math.sin(lamE * R)];
    const iD = MOON_INCL * EXAG * R;
    const moonAt = (u) => {                                     // u = argument de latitude (rad)
      const lam = m.node * R + Math.atan2(Math.cos(iD) * Math.sin(u), Math.cos(u)), b = Math.asin(Math.sin(iD) * Math.sin(u));
      return [E[0] + RM * Math.cos(b) * Math.cos(lam), RM * Math.sin(b), E[2] - RM * Math.cos(b) * Math.sin(lam)];
    };
    const line = (pts, col, w, dash) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath();
      pts.forEach((p, i) => { const q = P(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.setLineDash([]); };

    // plan de l'écliptique (disque translucide) et orbite de la Terre
    const ecl = []; for (let k = 0; k <= 120; k++) { const a = (2 * Math.PI * k) / 120; ecl.push([1.25 * Math.cos(a), 0, -1.25 * Math.sin(a)]); }
    ctx.fillStyle = "rgba(120,150,200,0.07)"; ctx.beginPath(); ecl.forEach((p, i) => { const q = P(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.fill();
    const orb = []; for (let k = 0; k <= 180; k++) { const a = (2 * Math.PI * k) / 180; orb.push([Math.cos(a), 0, -Math.sin(a)]); }
    line(orb, "rgba(160,180,210,0.35)", 1);
    // le Soleil
    const S = P([0, 0, 0]);
    const g = ctx.createRadialGradient(S[0], S[1], 0, S[0], S[1], 30);
    g.addColorStop(0, "#fff3c4"); g.addColorStop(0.3, "#f7b733"); g.addColorStop(1, "rgba(247,183,51,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(S[0], S[1], 30, 0, 7); ctx.fill();

    // orbite de la Lune (inclinée, dessinée ×3) : moitié nord pleine, moitié sud pointillée
    const north = [], south = [];
    for (let k = 0; k <= 96; k++) { const u = (2 * Math.PI * k) / 96; (Math.sin(u) >= 0 ? north : south).push(moonAt(u)); }
    line(north, "rgba(200,210,230,0.8)", 1.2);
    line(south, "rgba(200,210,230,0.45)", 1.2, [3, 3]);
    // ligne des nœuds, prolongée : quand elle pointe vers le Soleil, c'est la saison des éclipses
    const nd = [Math.cos(m.node * R), 0, -Math.sin(m.node * R)];
    line([[E[0] - nd[0] * 0.55, 0, E[2] - nd[2] * 0.55], [E[0] + nd[0] * 0.55, 0, E[2] + nd[2] * 0.55]], "#e0a52a", 1.2, [6, 4]);
    // étiquette à droite du point, ou à gauche si elle sortirait du canvas (téléphone)
    const lab = (p, txt, col) => { const q = P(p); ctx.fillStyle = col; ctx.font = "11px ui-monospace, Menlo, monospace"; const right = q[0] + 5 + ctx.measureText(txt).width > W - 4; ctx.textAlign = right ? "right" : "left"; ctx.fillText(txt, right ? q[0] - 5 : q[0] + 5, Math.max(q[1] - 5, W < 480 ? 60 : 48)); ctx.textAlign = "left"; };   // sous le tampon du haut
    lab([E[0] + nd[0] * 0.55, 0, E[2] + nd[2] * 0.55], tr("nodes-asc", "☊ ascending node"), "#e0a52a");
    lab([E[0] - nd[0] * 0.55, 0, E[2] - nd[2] * 0.55], tr("nodes-desc", "☋ descending node"), "#e0a52a");

    // la Lune, et son ombre (ou celle de la Terre) près des syzygies
    const Mo = moonAt(m.F * R), EM = P(E), MM = P(Mo);
    const near = SYZ.find((s) => Math.abs(s.jd - st.jd) < 1.2);
    if (near) {
      const from = near.kind === "new" ? Mo : E, dir = [from[0], from[1], from[2]], L = Math.hypot(...dir);
      const tip = [from[0] + (dir[0] / L) * 0.42, from[1] + (dir[1] / L) * 0.42, from[2] + (dir[2] / L) * 0.42];
      const a = P(from), b = P(tip);
      const shade = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
      shade.addColorStop(0, near.eclipse ? "rgba(255,120,90,0.55)" : "rgba(170,180,200,0.35)"); shade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = shade; ctx.lineWidth = near.kind === "new" ? 5 : 9; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.lineCap = "butt";
      if (near.eclipse) {
        const d = dateOf(near.jd);
        ctx.fillStyle = "#ff9a7a"; ctx.font = "600 12px ui-monospace, Menlo, monospace";
        const t = `${near.kind === "new" ? tr("nodes-solar", "solar eclipse") : tr("nodes-lunar", "lunar eclipse")} · ${d.d} ${MONTHS[d.m - 1]}`;
        // canvas étroit (téléphone) : en haut à droite, sur la ligne de la date ; sinon près de la Lune
        if (W < 480) { ctx.textAlign = "right"; ctx.fillText(t, W - 6, 18); ctx.textAlign = "left"; }
        else ctx.fillText(t, Math.min(EM[0] + 12, W - 6 - ctx.measureText(t).width), EM[1] + 26);
      }
    }
    const ball = (q, rad, c0, c1) => { const gr = ctx.createRadialGradient(q[0] - rad * 0.4, q[1] - rad * 0.4, rad * 0.1, q[0], q[1], rad);
      gr.addColorStop(0, c0); gr.addColorStop(1, c1); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(q[0], q[1], rad, 0, 7); ctx.fill(); };
    // ordre de profondeur Terre / Lune
    const drawE = () => ball(EM, RE * sc, "#9cc9ff", "#1d4ed8"), drawM = () => ball(MM, RMOON * sc, "#f2f2f2", "#8b93a0");
    if (MM[2] < EM[2]) { drawM(); drawE(); } else { drawE(); drawM(); }

    // bandeau du temps : l'année, les nouvelles lunes (ronds) et les pleines (points), éclipses marquées
    const x0 = 14, x1 = W - 14, ys = H - stripH + 14, X = (jd) => x0 + ((jd - JD0) / (JD1 - JD0)) * (x1 - x0);
    ctx.strokeStyle = "rgba(200,210,230,0.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ys); ctx.lineTo(x1, ys); ctx.stroke();
    ctx.fillStyle = "rgba(200,210,230,0.6)"; ctx.font = "9px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
    for (let k = 0; k < 12; k++) { const xm = X(jdOf(2027, k + 1, 15)); ctx.fillText(MONTHS[k], xm, ys + 26); }
    for (const s of SYZ) {
      const x = X(s.jd);
      ctx.beginPath(); ctx.arc(x, ys, s.kind === "new" ? 4 : 2.5, 0, 7);
      if (s.eclipse) { ctx.fillStyle = s.kind === "new" ? "#ff9a7a" : "#c9a0a0"; ctx.fill(); }
      else { ctx.strokeStyle = "rgba(200,210,230,0.55)"; ctx.stroke(); }
    }
    const xc = X(st.jd); ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(xc, ys - 9); ctx.lineTo(xc, ys + 9); ctx.stroke();
    ctx.textAlign = "left";

    // tampon d'honnêteté (règle 1) et date
    const d = dateOf(st.jd);
    ctx.fillStyle = "#e8e3d6"; ctx.font = "600 12px ui-monospace, Menlo, monospace";
    ctx.fillText(`${d.d} ${MONTHS[d.m - 1]} ${d.y}`, 10, 18);
    ctx.fillStyle = "#e0a52a"; ctx.font = "10px ui-monospace, Menlo, monospace";
    fillTextFit(ctx, tr("nodes-stamp", `not to scale · Moon's tilt drawn ×${EXAG} (true ${MOON_INCL}°)`), 10, 32, W - 20, { lineH: 12 });

    if (readsEl) {
      let sn = ((m.sunLon - m.node) % 180 + 180) % 180; if (sn > 90) sn = 180 - sn;   // angle Soleil–ligne des nœuds
      const next = SYZ.find((s) => s.eclipse && s.jd > st.jd);
      const nd2 = next ? dateOf(next.jd) : null;
      const html = `<span>${tr("nodes-read-angle", "Sun–node-line angle")} <b>${sn.toFixed(0)}°</b></span>` +
        `<span class="${sn < 21 ? "g" : ""}">${sn < 21 ? tr("nodes-read-season", "eclipse season: a syzygy here can eclipse") : tr("nodes-read-off", "off season: the shadow passes above or below")}</span>` +
        (nd2 ? `<span>${tr("nodes-read-next", "next")}: ${next.kind === "new" ? tr("nodes-solar", "solar eclipse") : tr("nodes-lunar", "lunar eclipse")} ${nd2.d} ${MONTHS[nd2.m - 1]}</span>` : "") +
        `<span>${tr("nodes-read-click", "click: pause · drag: turn")}</span>`;
      if (readsEl._last !== html) { readsEl.innerHTML = html; readsEl._last = html; }
    }
  }

  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      if (st.last && ts - st.last < 32) { st.raf = requestAnimationFrame(step); return; }
      if (st.last) { st.jd += ((ts - st.last) / 1000) * DAYS_PER_S; if (st.jd > JD1) st.jd = JD0; }
      st.last = ts; draw();
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);

  // export (epic10/UC02) : l'animation rejouée à l'instant t, puis remise en état
  let saved = null;
  canvas.__anim = {
    duration: (JD1 - JD0) / DAYS_PER_S,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(t) { st.jd = JD0 + t * DAYS_PER_S; draw(); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(); if (st.playing) loop(); },
  };
  return {
    start() { draw(); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
  };
}
