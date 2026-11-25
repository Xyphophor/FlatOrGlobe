// Section « Telling the waves apart » de l'onglet seis (2026-10-30, `fog build seis-waves`) : les vrais
// enregistrements à trois composantes de Tōhoku 2011 à quatre stations du GSN, la nature du mouvement du sol
// fenêtre par fenêtre (sans table de temps de trajet), le mouvement du sol dans quatre fenêtres, puis la
// direction d'arrivée de l'onde P lue sur son propre mouvement, face au globe et aux cartes plates.
// Nombres : le pré-calcul ; ici on ne fait que dessiner.
import { setupCanvas } from "../../core/canvas.js";
import { SEIS_WAVES } from "../../data/presets/seis-waves.js";

const INK = "#151a21", SOFT = "#5b6470", TEAL = "#0f766e", AMBER = "#b45309";
// les classes de mouvement : linéaire dans le plan du trajet (P, SV), linéaire transverse (SH, Love),
// ellipse rétrograde dans le plan du trajet (Rayleigh), autre
export const WAVE_COL = { p: "#1d4ed8", t: "#7c3aed", r: "#be185d", m: "#d6dae0" };
const QCOL = { tohoku2011: "#1d4ed8", maule2010: "#be185d", nias2005: "#0f766e" };
const fs = (px, w = "") => `${w}${px}px system-ui, sans-serif`;
const num = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const diff = (a, b) => ((a - b + 540) % 360) - 180;

export const WAVE_STATIONS = Object.keys(SEIS_WAVES.shown);
const row = (q, sta) => SEIS_WAVES.stations.find((r) => r[0] === q && r[1] === sta);

/** La ligne de lecture d'une station : direction mesurée, globe, carte plate ; périodes. */
export function fillWaveRead(el, sta, t, lang) {
  if (!el) return;
  const r = row("tohoku2011", sta), S = SEIS_WAVES.shown[sta], P = S.wins.find((w) => w.kind === "P"), R = S.wins.find((w) => w.kind === "Rayleigh");
  el.innerHTML = `<span>${t("wv-read-p", "{s}: the P wave came from {b}° (measured from its motion)", { s: sta, b: num(lang, r[5]) })}</span>` +
    `<span class="g">${t("wv-read-g", "great circle to the epicentre: {g}°", { g: num(lang, r[10]) })}</span>` +
    `<span class="f">${t("wv-read-f", "straight line on the North Pole map: {f}°", { f: num(lang, r[11]) })}</span>` +
    `<span>${t("wv-read-per", "period: P {p} s, Rayleigh {r} s", { p: num(lang, P.period, 0), r: num(lang, R.period, 0) })}</span>`;
}

/** Les trois composantes (Z, R, T) d'une station, les bandes de classes de mouvement, les quatre fenêtres. */
export function drawWaveTraces(cv, sta, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const S = SEIS_WAVES.shown[sta], narrow = W < 500, pl = narrow ? 34 : 54, pr = 10, top = 34, stripH = 12, gapS = 16;
  const nb = S.Z.length / 2, dur = nb * S.bin, t0 = -S.onset;   // s after the P onset
  const tMin = -120, tMax = Math.min(dur + t0, 90 * 60);
  const X = (s) => pl + ((s - tMin) / (tMax - tMin)) * (W - pl - pr);
  const traceH = (H - top - 2 * stripH - gapS - 3 * 8 - 46) / 3, clip = 6;
  const comps = [["Z", t("wv-z", "Z vertical")], ["R", t("wv-r", "R radial, away from the source")], ["T", t("wv-t", "T transverse")]];
  comps.forEach(([k, name], ci) => {
    const y0 = top + ci * (traceH + 8), mid = y0 + traceH / 2, A = S[k];
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pl, mid); ctx.lineTo(W - pr, mid); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < nb; i++) { const s = t0 + i * S.bin; if (s < tMin || s > tMax) continue;
      const cl = (v) => Math.max(-1, Math.min(1, v * clip)), lo = cl(A[2 * i]), hi = cl(A[2 * i + 1]), x = X(s);
      ctx.moveTo(x, mid - hi * traceH / 2); ctx.lineTo(x, mid - lo * traceH / 2 + 0.5); }
    ctx.stroke();
    ctx.font = fs(narrow ? 9.5 : 10, "600 "); ctx.textAlign = "left"; const lab = narrow ? k : name;
    ctx.fillStyle = "rgba(253,253,252,.85)"; ctx.fillRect(pl + 1, y0, ctx.measureText(lab).width + 4, 12); ctx.fillStyle = SOFT; ctx.fillText(lab, pl + 3, y0 + 9);
  });
  // les bandes : la nature du mouvement, fenêtre par fenêtre
  const sy = top + 3 * (traceH + 8) + 2;
  const strip = (str, step, win, y, lab) => {
    for (let i = 0; i < str.length; i++) { const c = str[i]; if (c === ".") continue;
      const a = t0 + i * step + win / 2 - step / 2, b = a + step; if (b < tMin || a > tMax) continue;
      ctx.fillStyle = WAVE_COL[c]; ctx.fillRect(X(Math.max(tMin, a)), y, X(Math.min(tMax, b)) - X(Math.max(tMin, a)) + 0.5, stripH); }
    ctx.font = fs(9); ctx.fillStyle = SOFT; ctx.textAlign = "right"; ctx.fillText(lab, pl - 3, y + 9);
  };
  strip(S.body, S.bodyStep, 20, sy, narrow ? "2–20" : "2–20 s");
  strip(S.surf, S.surfStep, 120, sy + stripH + 4, narrow ? "25–100" : "25–100 s");
  // les quatre fenêtres de la figure suivante
  ctx.font = fs(10, "700 "); ctx.textAlign = "center"; let lastX = -1e9, alt = 0;
  for (const w of S.wins) { const a = Math.max(tMin, w.t0), b = Math.min(tMax, w.t0 + w.step * w.R.length), lab = t(`wv-k-${w.kind}`, w.kind), cx = (X(a) + X(b)) / 2;
    ctx.strokeStyle = "rgba(21,26,33,.55)"; ctx.lineWidth = 1; ctx.strokeRect(X(a), top - 2, X(b) - X(a), sy - top);
    alt = cx - lastX < ctx.measureText(lab).width + 8 ? 1 - alt : 0;   // deux fenêtres voisines : un libellé plus haut
    ctx.fillStyle = INK; ctx.fillText(lab, cx, top - 6 - alt * 11); lastX = cx; }
  // l'axe du temps : minutes après le début de l'onde P à cette station
  const ay = sy + 2 * stripH + gapS;
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "center";
  const st = narrow ? 20 : 10;
  for (let m = 0; m * 60 <= tMax; m += st) ctx.fillText(`${m}`, X(m * 60), ay);
  ctx.fillText(t("wv-x", "minutes after the P onset at this station"), (pl + W - pr) / 2, ay + 13);
  ctx.textAlign = "right"; ctx.fillText(t("wv-clip", "traces clipped at 1/{c} of the peak, to show the early waves", { c: clip }), W - pr, H - 4);
}

/** Le mouvement du sol dans les quatre fenêtres : P et Rayleigh dans le plan vertical du trajet (R, Z), S et Love vus de dessus (R, T). */
export function drawWaveHodo(cv, sta, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const S = SEIS_WAVES.shown[sta], narrow = W < 500, cols = narrow ? 2 : 4, rows = Math.ceil(S.wins.length / cols);
  const cw = W / cols, ch = H / rows;
  S.wins.forEach((w, i) => {
    const cx0 = (i % cols) * cw, cy0 = Math.floor(i / cols) * ch, side = Math.min(cw - 24, ch - 62), ox = cx0 + cw / 2, oy = cy0 + 30 + side / 2;
    const plane = w.kind === "P" || w.kind === "Rayleigh" || (w.kind === "S" && w.trans < 0.5);   // (R, Z) ; sinon (R, T) vu de dessus (S : selon qu'il est SV ou SH)
    const ys = plane ? w.Z : w.T;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.strokeRect(ox - side / 2, oy - side / 2, side, side);
    ctx.beginPath(); ctx.moveTo(ox - side / 2, oy); ctx.lineTo(ox + side / 2, oy); ctx.moveTo(ox, oy - side / 2); ctx.lineTo(ox, oy + side / 2); ctx.stroke();
    const col = WAVE_COL[w.kind === "Rayleigh" ? "r" : w.kind === "Love" || (w.kind === "S" && w.trans >= 0.5) ? "t" : "p"];
    ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath();
    w.R.forEach((r, k) => { const x = ox + (r * side) / 2, y = oy - (ys[k] * side) / 2; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke();
    // le sens de parcours, au milieu de la fenêtre
    const k = Math.floor(w.R.length / 2), x1 = ox + (w.R[k] * side) / 2, y1 = oy - (ys[k] * side) / 2, x2 = ox + (w.R[k + 1] * side) / 2, y2 = oy - (ys[k + 1] * side) / 2;
    const a = Math.atan2(y2 - y1, x2 - x1); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2 + 6 * Math.cos(a), y2 + 6 * Math.sin(a));
    ctx.lineTo(x2 + 6 * Math.cos(a + 2.5), y2 + 6 * Math.sin(a + 2.5)); ctx.lineTo(x2 + 6 * Math.cos(a - 2.5), y2 + 6 * Math.sin(a - 2.5)); ctx.fill();
    ctx.font = fs(11, "700 "); ctx.fillStyle = INK; ctx.textAlign = "center";
    ctx.fillText(w.kind === "S" ? t(plane ? "wv-k-SV" : "wv-k-SH", plane ? "S (SV)" : "S (SH)") : t(`wv-k-${w.kind}`, w.kind), ox, cy0 + 13);
    ctx.font = fs(9); ctx.fillStyle = SOFT;
    ctx.fillText(plane ? t("wv-plane-rz", "R across, Z up") : t("wv-plane-rt", "R across, T up (seen from above)"), ox, cy0 + 25);
    ctx.fillText(t("wv-hodo-per", "period {p} s · L {l}", { p: num(lang, w.period, 0), l: num(lang, w.L, 2) }), ox, oy + side / 2 + 13);
    ctx.fillText(w.kind === "Rayleigh" ? (w.retro ? t("wv-retro", "retrograde ellipse") : t("wv-pro", "prograde")) : t("wv-trans", "transverse share {s}", { s: num(lang, w.trans, 2) }), ox, oy + side / 2 + 25);
  });
}

/** La direction mesurée de l'onde P moins la direction prédite, pour chaque enregistrement : globe, carte du pôle Nord, une seule meilleure carte. */
export function drawWaveDirs(cv, t, lang) {
  const { ctx, W, H } = setupCanvas(cv); if (!W) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const narrow = W < 500, pl = narrow ? 22 : 170, pr = 22, top = narrow ? 40 : 26, lim = 180, bot = 42;
  const rowsDef = [["globe", 10, t("wv-d-g", "globe: great circle"), TEAL, SEIS_WAVES.rms.globe], ["pole", 11, t("wv-d-p", "flat: North Pole map"), AMBER, SEIS_WAVES.rms.pole],
    ["best", 12, t("wv-d-b", "flat: one best map"), AMBER, SEIS_WAVES.rms.best]];
  const bc = `${num(lang, Math.abs(SEIS_WAVES.best[0]))}° ${SEIS_WAVES.best[0] >= 0 ? "N" : "S"} ${num(lang, Math.abs(SEIS_WAVES.best[1]))}° ${SEIS_WAVES.best[1] >= 0 ? "E" : (lang === "fr" ? "O" : "W")}`;
  const rh = (H - top - bot) / rowsDef.length, X = (d) => pl + ((d + lim) / (2 * lim)) * (W - pl - pr);
  ctx.strokeStyle = "rgba(21,26,33,.4)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(0), top - 4); ctx.lineTo(X(0), H - bot + 4); ctx.stroke(); ctx.setLineDash([]);
  rowsDef.forEach(([k, ci, name, col, rms], ri) => {
    const y = top + ri * rh + rh / 2;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    SEIS_WAVES.stations.forEach((r, i) => { const d = diff(r[5], r[ci]); ctx.beginPath(); ctx.arc(X(d), y + (((i * 7) % 9) - 4) * Math.min(3, rh / 14), 3.2, 0, 7);
      ctx.fillStyle = QCOL[r[0]]; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; });
    ctx.font = fs(narrow ? 10 : 11, "600 "); ctx.fillStyle = col; ctx.textAlign = narrow ? "left" : "right";
    const sub = (k === "best" ? `(${bc}) · ` : "") + t("wv-d-rms", "{r}° rms", { r: num(lang, rms, 1) });
    if (narrow) ctx.fillText(`${name} ${sub}`, 8, y - rh / 2 + 11); else { ctx.fillText(name, pl - 8, y - 2); ctx.font = fs(10); ctx.fillText(sub, pl - 8, y + 11); }
  });
  ctx.font = fs(9.5); ctx.fillStyle = SOFT; ctx.textAlign = "center";
  for (const d of [-180, -90, 0, 90, 180]) ctx.fillText(`${d > 0 ? "+" : ""}${d}°`, X(d), H - bot + 14);
  ctx.fillText(narrow ? t("wv-d-x-n", "measured − predicted direction") : t("wv-d-x", "measured direction of the P wave minus the predicted direction of the epicentre"), (pl + W - pr) / 2, H - bot + 28);
  // la légende des séismes
  ctx.textAlign = "left"; ctx.font = fs(10, "600 "); let x = narrow ? 8 : pl;
  for (const q of SEIS_WAVES.quakes) { ctx.fillStyle = QCOL[q.key]; ctx.beginPath(); ctx.arc(x + 4, 12, 4, 0, 7); ctx.fill(); ctx.fillText(q.name, x + 11, 16); x += ctx.measureText(q.name).width + 28; if (narrow && x > W - 90) x = 8; }
}

/** Le tableau : séisme par séisme, puis tous. */
export function fillWaveTable(tb, t, lang) {
  if (!tb) return;
  const n = (k) => SEIS_WAVES.stations.filter((r) => r[0] === k).length;
  tb.innerHTML = SEIS_WAVES.quakes.map((q) => `<tr><td>${q.name}</td><td class="num">${n(q.key)}</td><td class="num">${num(lang, q.globe, 1)}°</td><td class="num">${num(lang, q.pole, 1)}°</td><td class="num">${num(lang, q.best, 1)}°</td><td class="num">${num(lang, q.own[2], 1)}°</td></tr>`).join("") +
    `<tr class="sum"><td>${t("wv-tab-all", "all three (rms)")}</td><td class="num">${SEIS_WAVES.stations.length}</td><td class="num">${num(lang, SEIS_WAVES.rms.globe, 1)}°</td><td class="num">${num(lang, SEIS_WAVES.rms.pole, 1)}°</td><td class="num">${num(lang, SEIS_WAVES.rms.best, 1)}°</td><td></td></tr>`;
}
