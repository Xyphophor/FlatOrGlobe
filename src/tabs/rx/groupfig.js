// Bloc « le même rayon, à plusieurs » (panneau GPS brut, epic16/UC05).
// Le code du visiteur est fabriqué ICI à partir de sa propre solution (youfig.js), à
// l'arrondi qu'il choisit ; il le copie et l'envoie lui-même. Les codes des autres sont
// collés dans un champ texte. Aucun appel réseau, aucun stockage (pas même localStorage) :
// fermer la page efface tout. Tous les participants, le visiteur compris, entrent dans
// l'ajustement par leur position ARRONDIE, telle qu'elle est dans leur code : deux pages
// qui ont les mêmes codes donnent donc exactement les mêmes nombres.
import { drawFitBox, fitBoxHeight } from "../../core/fitbox.js";
import { setupCanvas } from "../../core/canvas.js";
import { coastLines } from "../../core/globe25d.js";
import { encodeCode, decodeCode, groupFit, bulge, heightCorr } from "./grouplogic.js";
import { geodetic } from "./userlogic.js";
import { colors, label, wrapLabel, dot, SOFT } from "../avia/draw.js";
import { num } from "../curv/fmt.js";

const FONT = "10px system-ui, sans-serif";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const latlon = (x) => { const g = geodetic(x); return `${num(Math.abs(g.lat), 1)}° ${g.lat >= 0 ? "N" : "S"}, ${num(Math.abs(g.lon), 1)}° ${g.lon >= 0 ? "E" : "W"}`; };

export function mountGpsGroup(root, tr) {
  const q = (id) => root.querySelector(`#${id}`);
  const stepSel = q("rxCodeStep"), nameIn = q("rxCodeName"), out = q("rxCodeOut"), copy = q("rxCodeCopy"), reveal = q("rxCodeReveal");
  const codesIn = q("rxCodesIn"), status = q("rxGroupStatus"), table = q("rxGroupTable"), fig = q("rxGroupFig"), cv = q("rxGroupCanvas");
  if (!stepSel || !codesIn || !cv) return { setYou() {}, draw() {} };
  let you = null, mine = null, state = null;

  /** Le code du visiteur, refait à chaque changement d'arrondi ou de nom. */
  const makeMine = () => {
    mine = null;
    if (!you) { out.value = ""; copy.disabled = true; reveal.textContent = tr("gq-nocode", "Solve your own log above to get your code."); return; }
    const step = Number(stepSel.value), r = you.r;
    const code = encodeCode({ name: nameIn.value, date: you.d.iso, x: r.x, step, rms: r.resid.rms, n: r.n, systems: r.systems });
    mine = decodeCode(code);
    out.value = code; copy.disabled = false;
    // ce que le code révèle, en clair, avant qu'il soit copié
    reveal.textContent = `${tr("gq-reveal", "This code tells whoever receives it")}: ${latlon(mine.x)} ${step >= 1000 ? `(± ${num(step / 2000, 1)} km ${tr("gq-axis", "on each axis")})` : tr("gq-exact", "(to the metre)")}, ${tr("gq-reveal2", "the day")} ${mine.date}, ${tr("gq-reveal3", "and the quality of your fix")}${mine.name ? `, ${tr("gq-reveal4", "under the name")} « ${mine.name} »` : ""}.`;
  };

  /** Tous les participants : le visiteur (s'il a résolu) + les codes collés, sans doublon. */
  const refit = () => {
    const parts = [], seen = new Set(), bad = [];
    if (mine) { parts.push({ ...mine, own: true }); seen.add(mine.code); }
    // les codes sont repérés n'importe où dans le texte collé (un message entier convient) ;
    // le nom peut contenir des espaces, pas les autres champs
    (codesIn.value.match(/FOG1\|[^|\n]*(?:\|[^|\s]*){9}/g) || []).forEach((line, i) => {
      try { const p = decodeCode(line); if (!seen.has(p.code)) { seen.add(p.code); parts.push(p); } }
      catch (e) { bad.push(`${i + 1} (${e.message === "checksum" ? tr("gq-bad-chk", "check digits wrong: a copying error?") : tr("gq-bad-fmt", "not a FOG1 code")})`); }
    });
    // deux participants au même endroit n'apportent qu'un point : on le signale, l'ajustement les garde
    const G = groupFit(parts);
    state = G ? { parts, G, B: bulge(parts, G) } : null;
    const msg = [];
    if (bad.length) msg.push(`${tr("gq-bad", "Ignored lines")}: ${bad.join(", ")}.`);
    if (!G) msg.push(`${num(parts.length)} ${tr("gq-count", "participant(s); a sphere needs at least 4 (centre and radius are free), better 5 or more, a few thousand kilometres apart.")}`);
    else {
      msg.push(`${num(G.n)} ${tr("gq-n", "participants")}: R = ${num(G.R / 1000, 1)} ± ${num(G.sigmaR / 1000, 1)} km.`);
      if (G.scatter == null) msg.push(tr("gq-four", "With exactly four, the sphere passes through every point and nothing measures the real scatter: the uncertainty shown is that of the rounding only. A fifth participant gives the real one."));
      if (G.spanKm < 500) msg.push(tr("gq-close", "The group spans less than 500 km: the bulge is small and the radius loose. Participants farther apart tighten it."));
    }
    status.textContent = msg.join(" ");
    drawTable(parts, G);
    fig.hidden = !G;
    draw();
  };

  const drawTable = (parts, G) => {
    if (!parts.length) { table.innerHTML = ""; return; }
    const head = ["", tr("gq-c-name", "name"), tr("gq-c-where", "where (rounded)"), tr("gq-c-day", "day"), tr("gq-c-step", "rounding"), tr("gq-c-fix", "fix residuals"), tr("gq-c-ep", "epochs"), tr("gq-c-res", "off the group's sphere")];
    const rows = parts.map((p, i) => `<tr${p.own ? ' class="own"' : ""}><td>${i + 1}</td><td>${esc(p.name || (p.own ? tr("gu-you", "you") : "—"))}</td><td>${latlon(p.x)}</td><td>${p.date}</td><td>${p.step >= 1000 ? `${num(p.step / 1000)} km` : `${num(p.step)} m`}</td><td>${num(p.rms, 1)} m</td><td>${num(p.n)}</td><td>${G ? `${num(G.res[i] / 1000, 2)} km` : "—"}</td></tr>`);
    table.innerHTML = `<table class="cnav-table"><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;
  };

  const draw = () => {
    if (!state || fig.hidden) return;
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv), { parts, G, B } = state, wide = W > 560;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    const tiles = [
      [null, null, globe, { R: `${num(G.R / 1000, 1)} km`, range: `± ${num(G.sigmaR / 1000, 1)} km`, r: heightCorr(state.parts.map((p) => p.x), G.c, G.R), rOf: tr("gq-rof", "height, sphere"), scatter: `${num(G.rms / 1000, 2)} km rms`, chi2nu: null, title: `${tr("gq-t1", "sphere through the group alone")} (${num(G.n)})` }],
      [`${num(G.planeRms / 1000, 1)} km rms`, tr("gq-t2", "left by the best plane through the same points"), flat],
      [`${num(G.spanKm)} km`, `${tr("gq-t3", "largest distance in the group; bulge of the sphere over it")} ${num(G.sagKm)} km`, globe],
    ];
    const cols = wide ? 3 : 1, tw = (W - 8 - 8 * cols) / cols, bsz = wide ? 10 : 9.5, th = Math.max(wide ? 52 : 40, ...tiles.filter((t) => t[3]).map((t) => fitBoxHeight({ ...t[3], size: bsz })));   // l'encadré de la sphère (core/fitbox.js)
    tiles.forEach(([big, small, col, box], k) => {
      const x = 8 + (k % cols) * (tw + 8), y = 8 + Math.floor(k / cols) * (th + 6);
      if (box) { drawFitBox(ctx, x, y, { ...box, col, size: bsz, maxW: tw }); return; }
      ctx.fillStyle = "#f3f5f7"; ctx.fillRect(x, y, tw, th);
      label(ctx, big, x + 8, y + 15, { col, font: "600 15px system-ui, sans-serif" });
      wrapLabel(ctx, small, x + 8, y + 30, tw - 12, { col: SOFT, font: FONT, lh: 11 });
    });
    const top = 8 + Math.ceil(tiles.length / cols) * (th + 6) + 12;
    // carte cadrée sur le groupe (plate, seulement pour situer) : au moins 30° × 20°, marge de 15 %
    const G0 = parts.map((p) => geodetic(p.x));
    let la0 = Math.min(...G0.map((g) => g.lat)), la1 = Math.max(...G0.map((g) => g.lat)), lo0 = Math.min(...G0.map((g) => g.lon)), lo1 = Math.max(...G0.map((g) => g.lon));
    const padLo = Math.max(30 - (lo1 - lo0), 0) / 2 + (lo1 - lo0) * 0.15, padLa = Math.max(20 - (la1 - la0), 0) / 2 + (la1 - la0) * 0.15;
    lo0 = Math.max(-180, lo0 - padLo); lo1 = Math.min(180, lo1 + padLo); la0 = Math.max(-90, la0 - padLa); la1 = Math.min(90, la1 + padLa);
    const m = wide ? { x0: 8, x1: W * 0.42, y0: top, y1: H - 10 } : { x0: 8, x1: W - 8, y0: top, y1: top + (W - 16) * 0.6 };
    const X = (lon) => m.x0 + (lon - lo0) / (lo1 - lo0) * (m.x1 - m.x0), Y = (lat) => m.y1 - (lat - la0) / (la1 - la0) * (m.y1 - m.y0);
    ctx.fillStyle = "#eef3f7"; ctx.fillRect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0);
    ctx.save(); ctx.beginPath(); ctx.rect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0); ctx.clip();
    ctx.strokeStyle = "#c3ccd6"; ctx.lineWidth = 0.7;
    for (const line of coastLines()) {
      ctx.beginPath(); let pen = false;
      for (const p of line) { if (!p) { pen = false; continue; } const x = X(p[1]), y = Y(p[0]); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; }
      ctx.stroke();
    }
    ctx.restore();
    G0.forEach((g, i) => { const own = parts[i].own; dot(ctx, X(g.lon), Y(g.lat), own ? 4 : 3.2, own ? flat : globe); label(ctx, String(i + 1), X(g.lon) + 5, Y(g.lat) - 6, { col: own ? flat : "#39414c", font: "600 9.5px system-ui, sans-serif", halo: true }); });
    // coupe : hauteur au-dessus du meilleur plan selon la distance à l'axe de la sphère
    const p = wide ? { x0: W * 0.42 + 48, x1: W - 14, y0: top + 16, y1: H - 32 } : { x0: 46, x1: W - 12, y0: m.y1 + 34, y1: H - 32 };
    const rmax = Math.max(...B.pts.map((t) => t.rho)) * 1.08 || 1;
    const ys = B.pts.map((t) => t.y).concat([0, B.curve(0), B.curve(rmax)]), ymin = Math.min(...ys), ymax = Math.max(...ys), yr = (ymax - ymin) * 1.15 || 1;
    const PX = (r) => p.x0 + r / rmax * (p.x1 - p.x0), PY = (y) => p.y1 - (y - (ymin - yr * 0.07)) / yr * (p.y1 - p.y0);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    const ticks = (lo, hi, k) => { const s = 10 ** Math.floor(Math.log10((hi - lo) / k)), st = [1, 2, 5, 10].map((f) => f * s).find((v) => (hi - lo) / v <= k); const a = []; for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) a.push(v); return a; };
    for (const v of ticks(ymin - yr * 0.07, ymin + yr * 0.93, 5)) { ctx.beginPath(); ctx.moveTo(p.x0, PY(v)); ctx.lineTo(p.x1, PY(v)); ctx.stroke(); label(ctx, num(v), p.x0 - 4, PY(v), { al: "right", col: SOFT, font: FONT }); }
    for (const v of ticks(0, rmax, wide ? 5 : 4)) label(ctx, num(v), PX(v), p.y1 + 11, { al: "center", col: SOFT, font: FONT });
    label(ctx, tr("gq-y", "height above the best plane (km)"), p.x0, p.y0 - 8, { col: SOFT, font: FONT });
    label(ctx, tr("gq-x", "distance from the sphere's axis (km)"), p.x1, p.y1 + 24, { al: "right", col: SOFT, font: FONT });
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = flat; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.x0, PY(0)); ctx.lineTo(p.x1, PY(0)); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = globe; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let k = 0; k <= 60; k++) { const r = rmax * k / 60, x = PX(r), y = PY(B.curve(r)); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    B.pts.forEach((t, i) => { const own = parts[i].own; dot(ctx, PX(t.rho), PY(t.y), own ? 4.2 : 3.4, own ? flat : globe); label(ctx, String(i + 1), PX(t.rho) + 5, PY(t.y) - 7, { col: own ? flat : "#39414c", font: "600 9.5px system-ui, sans-serif", halo: true }); });
    // règle 1 : axes à des échelles différentes, ce n'est pas un dessin de la Terre ; on le dit sur la figure
    wrapLabel(ctx, tr("gq-scales", "a chart, not a drawing: heights and distances have their own scales"), p.x1, PY(0) + 6, (p.x1 - p.x0) * 0.6, { al: "right", col: SOFT, font: "italic 9.5px system-ui, sans-serif", lh: 11, bl: "top" });
  };

  stepSel.addEventListener("change", () => { makeMine(); refit(); });
  nameIn.addEventListener("input", () => { makeMine(); refit(); });
  codesIn.addEventListener("input", refit);
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(out.value); copy.textContent = tr("gq-copied", "Copied"); }
    catch { out.select(); copy.textContent = tr("gq-select", "Selected: Ctrl+C"); }
    setTimeout(() => { copy.textContent = tr("gq-copy", "Copy my code"); }, 2000);
  });
  makeMine();

  return {
    /** Appelé par youfig.js quand la solution du visiteur change (null : plus de solution). */
    setYou(res) { you = res; makeMine(); refit(); },
    draw,
  };
}
