// Figures 2 et 3 (epic14) : les gyroscopes au sol.
//  - aviaDG : trois conservateurs de cap libres, avion arrêté face au nord,
//    à Tromsø, Singapour et Sydney ; le temps est accéléré (1 s = 10 min),
//    remise à zéro toutes les heures. Modèle au choix : globe (−Ω sin φ),
//    plan immobile (0), disque tournant (−Ω partout, même signe).
//  - aviaGC : ce que lisent trois gyroscopes laser immobiles (centrale
//    inertielle en alignement) : la rotation terrestre décomposée à
//    l'aéroport, le nord et la latitude qu'on en tire.
import { setupCanvas } from "../../core/canvas.js";
import { dgDrift, dgDriftFlat, earthRate, earthRateFlat, OMEGA_DEG_H } from "./logic.js";
import { DG_SITES } from "../../data/presets/avia.js";
import { colors, label, dot, orthoGlobe, makeLoop, INK, SOFT } from "./draw.js";
import { num } from "../curv/fmt.js";

const D2R = Math.PI / 180;
const MIN_PER_FRAME = 10 / 60;         // 1 s d'animation = 10 min

/** Carte de cap : lecture `hdg` (degrés) sous le repère du haut. */
function drawCard(ctx, x, y, r, hdg, ink) {
  ctx.save();
  ctx.fillStyle = "#1b2027"; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
  ctx.translate(x, y); ctx.rotate(-hdg * D2R);
  ctx.strokeStyle = "#e8edf2"; ctx.fillStyle = "#e8edf2";
  for (let d = 0; d < 360; d += 5) {
    const long = d % 30 === 0, a = d * D2R, r1 = r * (long ? 0.78 : 0.86);
    ctx.lineWidth = long ? 1.4 : 0.8;
    ctx.beginPath(); ctx.moveTo(r1 * Math.sin(a), -r1 * Math.cos(a)); ctx.lineTo(0.95 * r * Math.sin(a), -0.95 * r * Math.cos(a)); ctx.stroke();
    if (long) {
      const t = { 0: "N", 90: "E", 180: "S", 270: "W" }[d] ?? String(d / 10);
      ctx.save(); ctx.rotate(a); ctx.font = `${d % 90 === 0 ? 600 : 400} ${Math.round(r * 0.2)}px system-ui, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, 0, -r * 0.62); ctx.restore();
    }
  }
  ctx.restore();
  // repère fixe (le nez de l'avion) et maquette
  ctx.fillStyle = "#f5b301"; ctx.beginPath(); ctx.moveTo(x, y - r * 0.98); ctx.lineTo(x - 5, y - r * 0.8); ctx.lineTo(x + 5, y - r * 0.8); ctx.fill();
  ctx.strokeStyle = "#f5b301"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - r * 0.35); ctx.lineTo(x, y + r * 0.3); ctx.moveTo(x - r * 0.25, y); ctx.lineTo(x + r * 0.25, y); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke();
}

export function mountDG(root, tr) {
  const cv = root.querySelector("#aviaDG"), sel = root.querySelector("#aviaDGModel"), btn = root.querySelector("#aviaDGPlay");
  const st = { tMin: 0, model: "globe" };
  const rate = (lat) => st.model === "globe" ? dgDrift(lat) : dgDriftFlat[st.model](lat);
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv), ink = st.model === "globe" ? globe : flat;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const n = DG_SITES.length, cw = W / n, r = Math.min(cw * 0.36, H * 0.3);
    DG_SITES.forEach((s, i) => {
      const x = cw * (i + 0.5), y = H * 0.44;
      const k = rate(s.lat), err = k * st.tMin / 60;
      drawCard(ctx, x, y, r, (360 + err) % 360, ink);
      label(ctx, `${tr(`dg-site-${s.k}`, s.n)} ${num(Math.abs(s.lat), 1)}°${s.lat >= 0 ? "N" : "S"}`, x, y + r + 16, { al: "center", font: "600 12px system-ui, sans-serif" });
      label(ctx, `${k === 0 ? "0" : (k > 0 ? "+" : "−") + num(Math.abs(k), 1)}°/h · ${tr("dg-now", "now")} ${err >= 0 ? "+" : "−"}${num(Math.abs(err), 1)}°`, x, y + r + 32, { al: "center", col: ink });
    });
    label(ctx, `${tr("dg-t", "time since the gyro was set to 000")}: ${num(st.tMin, 0)} min (${tr("dg-fast", "1 s = 10 min")})`, 10, 14, { col: SOFT });
    const m = { globe: tr("dg-m-globe", "globe: −15.04°·sin φ per hour"), still: tr("dg-m-still", "motionless plane: nothing turns, no drift"), disc: tr("dg-m-disc", "disc turning under the sky: −15.04°/h everywhere") }[st.model];
    label(ctx, m, 10, H - 10, { col: ink, bl: "bottom" });
  };
  sel?.addEventListener("change", () => { st.model = sel.value; st.tMin = 0; draw(); });
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.tMin += n * MIN_PER_FRAME; if (st.tMin >= 60) st.tMin = 0; }, draw,
    anim: { duration: 6, state: st, reset: () => { st.tMin = 0; } },          // une heure
  });
  cv.__variant = { get: () => st.model, set: (m) => { st.model = m; if (sel) sel.value = m; draw(); } };
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}

export function mountGC(root, tr) {
  const cv = root.querySelector("#aviaGC"), inLat = root.querySelector("#aviaGCLat"), outLat = root.querySelector("#aviaGCLatv");
  const sel = root.querySelector("#aviaGCModel"), reads = root.querySelector("#aviaGCReads"), btn = root.querySelector("#aviaGCPlay");
  const st = { lat: 51.5, model: "globe", spin: 0 };
  const writeReads = () => {
    if (!reads) return;
    const e = st.model === "globe" ? earthRate(st.lat) : earthRateFlat(st.model);
    const rows = [
      `${tr("gc-h", "horizontal component (points to true north)")}: <b>${num(e.h, 2)}°/h</b>`,
      `${tr("gc-v", "vertical component")}: <b>${num(e.v, 2)}°/h</b> · ${tr("gc-tot", "total")} ${num(e.total, 2)}°/h`,
    ];
    if (st.model === "globe") rows.push(`${tr("gc-lat", "latitude read from the two")}: atan(${num(e.v, 2)}/${num(e.h, 2)}) = <b>${num(e.lat, 1)}°</b> · ${tr("gc-north", "north found from the horizontal part")}${Math.abs(st.lat) > 82.5 ? ` — <b>${tr("gc-polar", "too weak: beyond 82.5°, no alignment")}</b>` : ""}`);
    else if (st.model === "still") rows.push(`<b>${tr("gc-still", "nothing to measure: no north, no latitude — the unit could never align")}</b>`);
    else rows.push(`<b>${tr("gc-disc", "all vertical, everywhere: no north anywhere, and the “latitude” is 90° at every airport")}</b>`);
    reads.innerHTML = rows.map((r) => `<div>${r}</div>`).join("");
  };
  const draw = () => {
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv);
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const wide = W > 520, R = Math.min(wide ? W * 0.24 : W * 0.3, H * 0.34);
    const cx = wide ? W * 0.3 : W * 0.5, cy = wide ? H * 0.52 : H * 0.4;
    const lonSite = 0;
    if (st.model === "globe") {
      // la Terre tourne vers l'est : vue d'un point fixe, le centre de la vue recule en longitude
      const G = orthoGlobe(cx, cy, R, 18, lonSite + 50 - st.spin);
      G.draw(ctx, { ink: globe });
      // axe de rotation (y du repère de globe25d = axe des pôles)
      const n = G.P([0, 1.45, 0]), s = G.P([0, -1.45, 0]);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(n[0], n[1]); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, `Ω = ${num(OMEGA_DEG_H, 2)}°/h`, n[0] + 6, n[1] + 4, { col: INK });
      // l'aéroport : verticale locale U, nord local N ; Ω·U = sin φ, Ω·N = cos φ
      const p = st.lat * D2R, l = lonSite * D2R;
      const U = [Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l)];
      const N = [-Math.sin(p) * Math.cos(l), Math.cos(p), Math.sin(p) * Math.sin(l)];
      const S = G.P(U);
      if (S[2] > 0) {
        const e = earthRate(st.lat), k = 0.55 / OMEGA_DEG_H;          // longueur monde par °/h
        const at = (w) => G.P([U[0] + w[0], U[1] + w[1], U[2] + w[2]]);
        const arrow = (w, c, t, lw = 2) => {
          const q = at(w), dx = q[0] - S[0], dy = q[1] - S[1];
          if (Math.hypot(dx, dy) < 2) return;
          ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = lw;
          ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
          const a = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - 7 * Math.cos(a - 0.4), q[1] - 7 * Math.sin(a - 0.4)); ctx.lineTo(q[0] - 7 * Math.cos(a + 0.4), q[1] - 7 * Math.sin(a + 0.4)); ctx.fill();
          if (t) label(ctx, t, q[0] + 5, q[1] - 5, { col: c, halo: true });
        };
        const sc = (v, c) => v.map((x) => x * c);
        arrow(sc(U, k * e.v), "#6d28d9", tr("gc-av", "Ω sin φ"), 1.8);
        arrow(sc(N, k * e.h), "#1d4ed8", tr("gc-ah", "Ω cos φ → north"), 1.8);
        arrow([0, k * OMEGA_DEG_H, 0], INK, "Ω", 2.2);
        dot(ctx, S[0], S[1], 4, "#f5b301");
      } else label(ctx, tr("gc-hidden", "(airport on the far side)"), cx, cy + R + 14, { al: "center", col: SOFT });
      if (wide) label(ctx, tr("gc-scale", "decomposition drawn at the airport; arrows to scale with each other"), 8, H - 8, { col: SOFT, bl: "bottom", font: "10px system-ui, sans-serif" });
    } else {
      // plan : disque vu de biais, rotation nulle ou verticale partout
      ctx.fillStyle = "#f6efe4"; ctx.beginPath(); ctx.ellipse(cx, cy + R * 0.3, R * 1.2, R * 0.42, 0, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = flat; ctx.lineWidth = 1.4; ctx.stroke();
      const sites = [[-0.6, 0.25], [0.1, 0.45], [0.7, 0.2], [0, 0.05]];
      for (const [u, v] of sites) {
        const x = cx + u * R, y = cy + R * 0.3 + (v - 0.25) * R * 0.6;
        dot(ctx, x, y, 3.5, flat);
        if (st.model === "disc") {
          ctx.strokeStyle = flat; ctx.fillStyle = flat; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - R * 0.5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y - R * 0.5); ctx.lineTo(x - 4, y - R * 0.5 + 8); ctx.lineTo(x + 4, y - R * 0.5 + 8); ctx.fill();
        }
      }
      label(ctx, st.model === "disc" ? tr("gc-discl", "Ω vertical at every airport") : tr("gc-stilll", "Ω = 0 at every airport"), cx, cy - R * 0.55, { al: "center", col: flat, font: "600 12px system-ui, sans-serif" });
    }
    // barres : ce que lisent les trois gyroscopes
    const e = st.model === "globe" ? earthRate(st.lat) : earthRateFlat(st.model);
    const bx = wide ? W * 0.62 : W * 0.1, by = wide ? H * 0.2 : H * 0.8, bw = wide ? W * 0.3 : W * 0.8, bh = 14;
    const bars = [[tr("gc-bn", "north gyro"), e.h, "#1d4ed8"], [tr("gc-be", "east gyro"), 0, SOFT], [tr("gc-bu", "vertical gyro"), e.v, "#6d28d9"]];
    bars.forEach(([t, v, c], i) => {
      const y = by + i * (bh + (wide ? 22 : 6));
      if (wide) label(ctx, `${t}: ${num(v, 2)}°/h`, bx, y - 7, { col: c });
      ctx.fillStyle = "#e8ecf0"; ctx.fillRect(bx, y, bw, bh);
      ctx.fillStyle = c; ctx.fillRect(bx, y, (Math.abs(v) / OMEGA_DEG_H) * bw, bh);
      if (!wide) label(ctx, `${t} ${num(v, 1)}`, bx + 4, y + bh / 2, { col: "#fff", font: "10px system-ui, sans-serif" });
    });
  };
  const sync = () => { if (inLat) inLat.value = st.lat; if (outLat) outLat.textContent = `${num(Math.abs(st.lat), 1)}°${st.lat >= 0 ? "N" : "S"}`; writeReads(); };
  inLat?.addEventListener("input", () => { st.lat = +inLat.value; sync(); draw(); });
  sel?.addEventListener("change", () => { st.model = sel.value; sync(); draw(); });
  sync();
  const loop = makeLoop(cv, {
    button: btn, playLabel: tr("play", "▶ play"), pauseLabel: tr("pause", "❚❚ pause"),
    tick: (n) => { st.spin = (st.spin + n * 0.25) % 360; }, draw,
    anim: { duration: 24, state: st, reset: () => { st.spin = 0; }, readout: () => reads?.textContent || "" },   // un tour
  });
  cv.__variant = { get: () => st.model, set: (m) => { st.model = m; if (sel) sel.value = m; sync(); draw(); } };
  return { draw, start: () => loop.start(), stop: () => loop.stop() };
}
