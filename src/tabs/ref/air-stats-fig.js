// Onglet ref, section « l'air qu'il faut, photo par photo » (2026-11-13) : la figure des écarts réduits, le schéma de
// la formule, le tableau et les nombres du texte. Les calculs sont dans air-stats.js.
import { setupCanvas } from "../../core/canvas.js";
import { FIG } from "../../core/fig.js";
import { stamp, drawFormulaFigs } from "../../core/formfigs.js";
import { airStats, loadContribAir } from "./air-stats.js";
import { signed } from "../../core/air-need.js";

const COL = { ink: "#151a21", mute: "#5b6470", faint: "#697381", globe: "#1d4ed8", flat: "#b45309", ok: "rgba(22,163,74,.13)", grid: "rgba(91,100,112,.25)" };
const SMALL = "9px ui-monospace, Menlo, monospace", LAB = "10px ui-monospace, Menlo, monospace", HEADF = "700 10px ui-monospace, Menlo, monospace";

let _S = null;
/** Les statistiques, avec les lignes des contributions publiées (chargées à la demande), calculées une fois. */
export const statsReady = () => (_S ||= loadContribAir().then((mods) => airStats(mods)));

/** L'échelle des écarts réduits : linéaire de −2 à 2, logarithmique au-delà (s(z) = signe · (1 + log₁₀(|z|/2)) · 2). */
export const zScale = (z) => (Math.abs(z) <= 2 ? z : Math.sign(z) * 2 * (1 + Math.log10(Math.abs(z) / 2)));

/** Le nom court d'une ligne, pour la figure et le tableau : celles des contributions viennent de leur module. */
export function rowName(r, S, t, num, lang) {
  if (r.id === "caus") return t("rs-caus", "Caussols dip");
  if (r.id === "bord") return t("rs-bord", "Bordighera");
  const p = S.parts.find((x) => x.key === r.src);
  return p ? p.m.label(r, lang, num) : r.id;
}

export function drawAirStats(canvas, t, lang, S) {
  const num = (x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const draw = () => {
    const wpx = canvas.getBoundingClientRect().width;
    if (!wpx) return;
    const narrow = wpx < 520, rowH = narrow ? 17 : 19, top = 44, n = S.rows.length;
    // le résumé, coupé en lignes avant de fixer la hauteur (9 px de chasse fixe ≈ 5,5 px par caractère)
    const A = S.all, G = S.indep, cap = Math.max(20, Math.floor((wpx - 8) / 5.5));
    const sum = [t("rs-sum1", "χ² over the {n}: globe {g}, plane {f} · independent photographs only ({m}): globe {gg}, plane {ff}",
      { n: String(A.globe.n), g: num(A.globe.chi2, 0), f: num(A.flat.chi2, 0), m: String(G.globe.n), gg: num(G.globe.chi2, 1), ff: num(G.flat.chi2, 0) }),
    ...(S.hasSeries ? [t("rs-sum2", "with each model's best offset on each series: globe {g}, plane {f}", { g: num(S.allShifted.globe.chi2, 0), f: num(S.allShifted.flat.chi2, 0) })] : [])]
      .flatMap((s) => { const out = []; let ln = ""; for (const w of s.split(" ")) { const x = ln ? ln + " " + w : w; if (ln && x.length > cap) { out.push(ln); ln = w; } else ln = x; } if (ln) out.push(ln); return out; });
    const H = top + n * rowH + 30 + 12 * sum.length;
    if (canvas._h !== H) { canvas.style.height = H + "px"; canvas._h = H; }
    const { ctx, W } = setupCanvas(canvas);
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const lx = narrow ? 104 : 140, x0 = lx + 8, x1 = W - 10, zMin = -80, zMax = 10;
    const X = (z) => x0 + ((zScale(Math.max(zMin, Math.min(zMax, z))) - zScale(zMin)) / (zScale(zMax) - zScale(zMin))) * (x1 - x0);
    const yB = top + n * rowH;
    // la bande |z| < 2 et les graduations
    ctx.fillStyle = COL.ok; ctx.fillRect(X(-2), top - 4, X(2) - X(-2), yB - top + 4);
    ctx.font = SMALL; ctx.textAlign = "center";
    for (const z of (narrow ? [-50, -10, -2, 0, 2, 10] : [-50, -20, -10, -5, -2, 0, 2, 5, 10])) {
      ctx.strokeStyle = z === 0 ? COL.faint : COL.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(z), top - 4); ctx.lineTo(X(z), yB); ctx.stroke();
      ctx.fillStyle = COL.faint; ctx.fillText(z > 0 ? `+${z}` : z < 0 ? `−${-z}` : "0", X(z), yB + 11);
    }
    ctx.textAlign = "left"; ctx.fillStyle = COL.mute;
    ctx.fillText(t("rs-ax", "z = (needed − day) / σ · colder ←  → warmer"), narrow ? 4 : x0, yB + 23);
    // la légende
    ctx.font = HEADF; ctx.textAlign = "left";
    const leg = (x, col, s, hollow) => { ctx.beginPath(); ctx.arc(x + 4, 13, 4, 0, 2 * Math.PI); if (hollow) { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); } ctx.fillStyle = col; ctx.fillText(s, x + 12, 17); return x + 12 + ctx.measureText(s).width + 12; };
    let lxp = 4; lxp = leg(lxp, COL.globe, t("rc-globe", "globe")); lxp = leg(lxp, COL.flat, t("rc-plane", "plane"));
    ctx.font = SMALL; ctx.fillStyle = COL.mute;
    const hollowTxt = S.hasSeries ? t("rs-leg-off", "hollow: a series, each model's best constant offset") : "";
    if (!hollowTxt) { /* pas de série */ } else if (narrow) { ctx.fillText(hollowTxt, 4, 31); } else { ctx.beginPath(); ctx.arc(lxp + 4, 13, 4, 0, 2 * Math.PI); ctx.strokeStyle = COL.faint; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillText(hollowTxt, lxp + 12, 17); }
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(22,120,60,.9)"; ctx.fillText(t("rs-leg-ok", "|z| < 2"), X(2) - 2, top + 6);
    // les lignes
    S.rows.forEach((r, i) => {
      const y = top + i * rowH + rowH / 2, sh = S.shifted[i];
      if (r.series && !S.rows[i - 1]?.series) { ctx.strokeStyle = COL.faint; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(4, y - rowH / 2); ctx.lineTo(x1, y - rowH / 2); ctx.stroke(); ctx.setLineDash([]); }
      ctx.font = LAB; ctx.fillStyle = COL.ink; ctx.textAlign = "left"; ctx.fillText(rowName(r, S, t, num, lang), 4, y + 3);
      for (const m of ["flat", "globe"]) {
        const col = m === "globe" ? COL.globe : COL.flat, z = r[m].z, zs = sh[m].z;
        if (z == null) continue;
        if (r.series && zs != null) {
          ctx.strokeStyle = col; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(z), y); ctx.lineTo(X(zs), y); ctx.stroke(); ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.arc(X(zs), y, 4, 0, 2 * Math.PI); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(X(z), y, 4.5, 0, 2 * Math.PI); ctx.fillStyle = col; ctx.fill();
        if (z < zMin) { ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(`${num(z, 0)}`, X(zMin) + 7, y + 3); }
      }
    });
    // le résumé
    ctx.font = SMALL; ctx.textAlign = "left"; ctx.fillStyle = COL.ink;
    sum.forEach((l, j) => ctx.fillText(l, 4, H - 6 - 12 * (sum.length - 1 - j)));
  };
  return draw;
}

/* La formule : deux fourchettes sur une même échelle de gradient, l'écart entre elles et son unité, σ. */
function figZ(tr) {
  const f = FIG.make({ w: 380, h: 150, alt: tr("rs-fx-alt", "A horizontal scale of temperature gradient. A black mark with a grey band is the gradient of the day's air and its uncertainty; a coloured mark with its band is the gradient a model needs for the photograph. The distance between the two marks, divided by the half-widths of the two bands facing each other, combined, is z.") });
  const C = FIG.C, y = 80;
  f.line(20, y, 360, y, { c: C.faint, w: 1 });
  f.path(`M250 ${y - 9}L320 ${y - 9}L320 ${y + 9}L250 ${y + 9}Z`, { c: C.soft, w: 1, fill: "rgba(21,26,33,.14)" });
  f.line(285, y - 16, 285, y + 16, { c: C.ink, w: 2 });
  f.note(285, y - 22, tr("rs-fx-day", "day"), { size: 10, anchor: "middle", c: C.ink });
  f.path(`M70 ${y - 7}L150 ${y - 7}L150 ${y + 7}L70 ${y + 7}Z`, { c: C.globe, w: 1, fill: "rgba(29,78,216,.16)" });
  f.line(105, y - 14, 105, y + 14, { c: C.globe, w: 2 });
  f.note(105, y - 20, tr("rs-fx-need", "needed"), { size: 10, anchor: "middle", c: C.globe });
  f.path(`M105 ${y + 30}L285 ${y + 30}`, { c: C.ink, w: 1.2, dash: "0" });
  f.note(195, y + 45, tr("rs-fx-gap", "gap = needed − day"), { size: 10, anchor: "middle", c: C.ink });
  f.note(128, y - 34, "σ₁", { size: 10, anchor: "middle", c: C.globe }); f.line(105, y - 30, 150, y - 30, { c: C.globe, w: 1 });
  f.note(267, y - 34, "σ₂", { size: 10, anchor: "middle", c: C.soft }); f.line(250, y - 30, 285, y - 30, { c: C.soft, w: 1 });
  f.note(20, y + 70 - 2, tr("rs-fx-cold", "← colder"), { size: 9, c: C.faint }); f.note(360, y + 68, tr("rs-fx-warm", "warmer →"), { size: 9, anchor: "end", c: C.faint });
  stamp(f, tr, tr("rs-fx-st", "a scheme"));
  return f;
}

export const STAT_FIGS = { rfStatFx: figZ };

/** Le tableau : une ligne par photo, les gradients en K/100 m et les écarts réduits (entre parenthèses pour une série :
 * avec le meilleur décalage de chaque modèle). */
export function statRowsHtml(S, t, lang) {
  const nf = (x, d = 1) => (x == null ? "—" : !isFinite(x) ? (x > 0 ? "+∞" : "−∞") : signed(x, d, lang));
  const num = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const g = (x) => nf(x == null ? null : x * 100, 2);
  return S.rows.map((r, i) => {
    const sh = S.shifted[i], ser = r.series;
    const need = (m) => `${g(r[m].grad)}${ser ? ` <span class="rs-off">(${g(sh[m].grad)})</span>` : ""}`;
    const zz = (m) => `<td class="${Math.abs(r[m].z) < 2 ? "" : "cold"}"><b>${nf(r[m].z, 1)}</b>${ser ? ` <span class="rs-off">(${nf(sh[m].z, 1)})</span>` : ""}</td>`;
    return `<tr><th scope="row">${rowName(r, S, t, num, lang)}</th><td>${num(r.h)} m</td><td>${g(r.day.grad)}</td><td>${need("globe")}</td><td>${need("flat")}</td>${zz("globe")}${zz("flat")}</tr>`;
  }).join("");
}

/** Monte la section : la formule tout de suite ; la figure, le tableau, les nombres du texte et les paragraphes des
 * contributions (#rfAirContrib) quand leurs lignes sont chargées. Renvoie la fonction de dessin. */
export function mountAirStats(container, t, lang) {
  drawFormulaFigs(container, STAT_FIGS, t, {}, "ref");
  const cv = container.querySelector("#rfStatFig");
  let draw = () => {};
  const ready = statsReady().then((S) => {
    const tb = container.querySelector("#rfStatRows");
    if (tb) tb.innerHTML = statRowsHtml(S, t, lang);
    const v = statValues(S, lang);
    container.querySelectorAll('span.cv[data-v^="rs"]').forEach((sp) => { const x = v[sp.dataset.v]; if (x != null) sp.textContent = x; });
    const host = container.querySelector("#rfAirContrib");
    if (host) host.innerHTML = S.parts.map((p) => `<div class="notes">${p.m.notes(lang, p)}</div>`).join("");
    if (cv) { draw = drawAirStats(cv, t, lang, S); draw(); }
    return S;
  });
  const f = () => draw();
  f.ready = ready;
  return f;
}

/** Les nombres du texte (span.cv[data-v^="rs"]). */
export function statValues(S, lang = "en") {
  const nf = (x, d = 0) => (x == null ? "—" : (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));
  const z = (id, m) => signed(S.rows.find((r) => r.id === id)[m].z, 1, lang);
  const ind = S.rows.filter((r) => !r.series), list = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")}${lang === "fr" ? " et " : " and "}${a.at(-1)}`);
  const names = S.parts.map((p) => p.m.name(lang));
  return {
    rsN: String(S.rows.length), rsNin: String(ind.length), rsContrib: names.length ? list(names) : (lang === "fr" ? "aucune pour l'instant" : "none yet"),
    rsZcG: z("caus", "globe"), rsZcF: z("caus", "flat"), rsZbG: z("bord", "globe"), rsZbF: z("bord", "flat"),
    rsZinG: list(ind.map((r) => signed(r.globe.z, 1, lang))), rsZinF: list(ind.map((r) => signed(r.flat.z, 1, lang))),
    rsChiG: nf(S.all.globe.chi2, 0), rsChiF: nf(S.all.flat.chi2, 0), rsChiInG: nf(S.indep.globe.chi2, 1), rsChiInF: nf(S.indep.flat.chi2, 0),
    rsChiAsG: nf(S.allShifted.globe.chi2, 0), rsChiAsF: nf(S.allShifted.flat.chi2, 0),
    rsIn2G: String(S.indep.globe.within2), rsIn2F: String(S.indep.flat.within2),
    rsMedZG: nf(S.all.globe.medZ, 1), rsMedZF: nf(S.all.flat.medZ, 1),
  };
}
