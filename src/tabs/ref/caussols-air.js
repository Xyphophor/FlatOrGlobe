// Onglet ref, exemple de la jauge de réfraction (2026-10-14, demande du propriétaire : « en exemple en utilisant
// Caussols dans réfraction ») : la dépression de l'horizon MESURÉE sur la photo de Caussols (onglet dip,
// src/data/presets/dip-caussols.js), et l'air que chaque modèle doit avoir pour la produire.
//
// Dans un air en couches, seuls comptent l'air au ras de la mer (indice n_mer) et l'air à l'œil (n_œil) :
//   globe (couches sphériques, invariant de Bouguer n·r·cos α) : n_mer·R = n_œil·(R + h)·cos δ ;
//   plan (couches planes, loi de Snell n·cos α)                 : n_mer = n_œil·cos δ.
// D'où l'indice qu'il faut à l'œil, puis sa température à la pression de l'œil (n − 1 = 79,01·10⁻⁶·P/T, Ciddor) ;
// la jauge montre le gradient moyen (T_œil − T_mer)/h qu'il faut à chaque modèle, face à celui du jour (ERA5, AROME).
// Aucun angle n'est lu sur le dessin.
import { setupCanvas } from "../../core/canvas.js";
import { drawGradGauge } from "../../core/refgauge.js";
import { FIG } from "../../core/fig.js";
import { stamp, drawFormulaFigs } from "../../core/formfigs.js";
import { DIP_CAUS } from "../../data/presets/dip-caussols.js";
import { DIP_ATMOS } from "../../data/presets/dip-atmos.js";

export const R = 6371e3;
const D = Math.PI / 180;
/** Indice de l'air sec pour la lumière visible (Ciddor 1996, comme l'onglet dip). */
export const nAir = (Tc, P) => 1 + 79.01e-6 * P / (Tc + 273.15);
/** Température (°C) d'un air d'indice n à la pression P (hPa). */
export const tFromN = (n, P) => 79.01e-6 * P / (n - 1) - 273.15;

/** L'indice qu'il faut à l'œil pour un dip δ (minutes d'arc), au-dessus d'une mer d'indice n0, œil à h m. */
export function nEyeNeeded(model, dipArcmin, n0, h = DIP_CAUS.h) {
  const c = Math.cos((dipArcmin / 60) * D);
  return model === "flat" ? n0 / c : (n0 * R) / ((R + h) * c);
}

/** Les nombres de l'exemple : l'air du jour (mer, œil ERA5, air libre AROME), et pour chaque modèle la température
 * qu'il faut à l'œil et le gradient moyen, pour le dip central et pour l'étendue des variantes de la mesure. */
export function causNumbers(C = DIP_CAUS, A = DIP_ATMOS) {
  const h = C.h, Tsea = A.sea.T, n0 = nAir(Tsea, A.sea.P), P = A.eye.P;
  const dips = C.fits.map((f) => f.dipArcmin), dip = dips[0], lo = Math.min(...dips), hi = Math.max(...dips);
  const g = (T) => (T - Tsea) / h;
  const need = (m) => {
    const T = tFromN(nEyeNeeded(m, dip, n0, h), P), Ta = tFromN(nEyeNeeded(m, lo, n0, h), P), Tb = tFromN(nEyeNeeded(m, hi, n0, h), P);
    return { T, Tlo: Math.min(Ta, Tb), Thi: Math.max(Ta, Tb), grad: g(T), gLo: g(Math.min(Ta, Tb)), gHi: g(Math.max(Ta, Tb)) };
  };
  const day = { Teye: A.eye.T, Tfree: A.freeAir.T, grad: g(A.eye.T), gFree: g(A.freeAir.T) };
  return { h, Tsea, Psea: A.sea.P, P, dip, dipLo: lo, dipHi: hi, n0, globe: need("globe"), flat: need("flat"), day,
    // l'air où l'œil a le même indice que la mer (lumière droite en moyenne) : dip du globe sans réfraction, plan sans dip
    Tsame: tFromN(n0, P) };
}

const COL = { ink: "#151a21", mute: "#5b6470", faint: "#697381", globe: "#1d4ed8", flat: "#b45309", cold: "#cfe0ef", warm: "#f3dccb",
  sea: "#7f98ab", grid: "rgba(91,100,112,.25)" };
const HEAD = "700 11px ui-monospace, Menlo, monospace", SMALL = "9px ui-monospace, Menlo, monospace", STAMP = "10px ui-monospace, Menlo, monospace";
const GW = 72, GAP = 10;

/** La figure : jauge du globe | les profils de température de la mer à l'œil | jauge du plan. */
export function drawCaussolsAir(canvas, t, lang) {
  const N = causNumbers();
  const num = (x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const sgn = (x, d = 1) => (Math.abs(x) < 0.5 * 10 ** -d ? num(0, d) : (x < 0 ? "−" : "+") + num(Math.abs(x), d));
  const g100 = (g) => sgn(g * 100, 1);
  const draw = () => {
    const wpx = canvas.getBoundingClientRect().width;
    if (!wpx) return;
    const H = Math.round(Math.min(420, Math.max(300, wpx * 0.5)));
    if (canvas._h !== H) { canvas.style.height = H + "px"; canvas._h = H; }
    const { ctx, W } = setupCanvas(canvas);
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const gLo = -0.13, gHi = 0.02;
    const gauge = (flat) => {
      const m = flat ? N.flat : N.globe, col = flat ? COL.flat : COL.globe;
      drawGradGauge(ctx, { x: flat ? W - GW : 0, y: 0, w: GW, h: H }, {
        flat, col, title: flat ? t("rc-PLANE", "PLANE") : t("rc-GLOBE", "GLOBE"), sub: "dT/dz", lo: gLo, hi: gHi,
        tick: 0.01, labelEvery: 4, fmt: (g, i) => (i === 0 ? "0" : g100(g).replace(/[.,]0$/, "")),
        day: N.day.grad, dayA: N.day.gFree, dayB: N.day.grad, dayOver: N.day.grad > gHi,
        need: { grad: m.grad, beyond: m.grad < gLo, gLo: m.gLo, gHi: m.gHi },
        marks: [{ g: -0.0098 }, { g: -0.0343 }],
        lines: [{ text: `${t("rc-need", "need")} ${g100(m.grad)}`, color: col, dy: 48 }, { text: `${g100(m.gLo)} … ${g100(m.gHi)}`, color: col, dy: 37 },
          { text: `${t("rc-day", "day")} ${g100(N.day.grad)}`, color: COL.ink, dy: 23 }, { text: `${g100(N.day.gFree)} … ${g100(N.day.grad)}`, color: COL.ink, dy: 12 },
          { text: t("rc-unit", "K/100 m"), color: COL.mute, dy: 1 }],
        C: { ink: COL.ink, mute: COL.mute, faint: COL.faint, warm: COL.warm, cold: COL.cold }, F: { head: HEAD, small: SMALL },
      });
    };
    gauge(false); gauge(true);
    // le panneau central : température (°C) en abscisse, hauteur (m) en ordonnée ; seuls les deux bouts comptent
    const narrow = W - 2 * (GW + GAP) < 420, P = { x: GW + GAP, y: 30, w: W - 2 * (GW + GAP), h: H - 30 - (narrow ? 46 : 34) };
    const t0 = Math.floor(Math.min(N.flat.Tlo, -120) / 20) * 20, t1 = 40;
    const X = (T) => P.x + 34 + ((T - t0) / (t1 - t0)) * (P.w - 44), Y = (z) => P.y + P.h - (z / N.h) * (P.h - 10);
    ctx.fillStyle = "rgba(127,152,171,.18)"; ctx.fillRect(P.x, Y(0), P.w, P.y + P.h + 6 - Y(0));
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.font = SMALL; ctx.fillStyle = COL.faint; ctx.textAlign = "center";
    for (let T = t0; T <= t1; T += narrow ? 40 : 20) { ctx.beginPath(); ctx.moveTo(X(T), P.y); ctx.lineTo(X(T), Y(0)); ctx.stroke(); ctx.fillText(`${sgn(T, 0).replace("+", "")}${narrow ? "" : " °C"}`, X(T), Y(0) + 12); }
    if (narrow) { ctx.textAlign = "left"; ctx.fillText("°C", P.x + 4, Y(0) + 12); }
    ctx.textAlign = "right";
    for (const z of [0, 600, 1210]) { ctx.beginPath(); ctx.moveTo(P.x + 34, Y(z)); ctx.lineTo(P.x + P.w, Y(z)); ctx.stroke(); ctx.fillText(`${num(z)} m`, P.x + 30, Y(z) + 3); }
    // les profils : du ras de la mer à l'œil, tracés droits (seuls les bouts comptent)
    const line = (Ta, Tb, col, w, dash) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(X(Ta), Y(0)); ctx.lineTo(X(Tb), Y(N.h)); ctx.stroke(); ctx.setLineDash([]); };
    const band = (Tlo, Thi, col) => { ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X(N.Tsea), Y(0)); ctx.lineTo(X(Tlo), Y(N.h)); ctx.lineTo(X(Thi), Y(N.h)); ctx.closePath(); ctx.fill(); ctx.restore(); };
    band(N.globe.Tlo, N.globe.Thi, COL.globe); band(N.flat.Tlo, N.flat.Thi, COL.flat);
    line(N.Tsea, N.Tsame, COL.faint, 1, [4, 3]);
    line(N.Tsea, N.day.Tfree, COL.ink, 1.2, [2, 2]); line(N.Tsea, N.day.Teye, COL.ink, 2);
    line(N.Tsea, N.globe.T, COL.globe, 2); line(N.Tsea, N.flat.T, COL.flat, 2);
    // étiquettes à l'œil
    const lab = (T, s, col, dy, align) => { ctx.font = "600 10px ui-monospace, Menlo, monospace"; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, X(T) + (align === "left" ? 5 : -5), Y(N.h) + dy); };
    lab(N.flat.T, `${t("rc-plane", "plane")} ${sgn(N.flat.T, 0)} °C`, COL.flat, -4, "left");
    lab(N.globe.T, `${t("rc-globe", "globe")} ${sgn(N.globe.T, 0)} °C`, COL.globe, narrow ? 28 : 14, "right");
    lab(N.day.Teye, `${t("rc-day-air", "that day")} ${sgn(N.day.Tfree, 0)}…${sgn(N.day.Teye, 0)} °C`, COL.ink, narrow ? 14 : -4, "right");
    ctx.font = SMALL; ctx.fillStyle = COL.mute; ctx.textAlign = "left";
    ctx.textAlign = "right"; ctx.fillText(t("rc-sea", "sea {T} °C, {P} hPa", { T: num(N.Tsea, 1), P: num(N.Psea, 0) }), X(N.Tsea) - 8, Y(0) - 4); ctx.textAlign = "left";
    ctx.fillText(t("rc-eye", "eye {h} m, {P} hPa · dip {d}′", { h: num(N.h), P: num(N.P, 0), d: num(N.dip, 1) }), P.x + 36, 11);
    ctx.font = STAMP; ctx.fillStyle = COL.faint; ctx.textAlign = "left";
    const words = t("rc-stamp", "temperature from the sea to the eye · only the two ends count, drawn straight · to scale of its axes").split(" "), rows = [];
    let ln = ""; for (const w of words) { const x = ln ? ln + " " + w : w; if (ln && ctx.measureText(x).width > P.w) { rows.push(ln); ln = w; } else ln = x; }
    if (ln) rows.push(ln);
    const rr = rows.slice(0, 2); rr.forEach((r, i) => ctx.fillText(r, P.x, H - 4 - 12 * (rr.length - 1 - i)));
  };
  return draw;
}

/* La formule : les deux invariants côte à côte. Un rayon qui rase la mer (α = 0) arrive à l'œil sous δ ;
 * globe : couches sphériques (r change), plan : couches planes. */
function figInvariants(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("rc-fx-alt", "Two cross-sections. Left, the globe: the air in spherical layers, a ray grazing the curved sea and reaching an eye high above it, tilted down by the dip; along it n times r times the cosine of its slope keeps the same value. Right, the plane: flat layers, a ray grazing the flat sea; along it n times the cosine of its slope keeps the same value, so the eye can see the sea below level only if its air has the higher index.") });
  const C = FIG.C;
  const panel = (x0, flat) => {
    const L = 160, base = 160, e = 80, d0 = 0.75, sx = (x) => x0 + x * L;
    const surf = (x) => (flat ? 0 : 60 * x * x);
    const hr = (x) => e * (1 - x / d0) ** 2;
    for (let i = 1; i <= 3; i++) {   // couches de l'air
      const pts = []; for (let k = 0; k <= 30; k++) { const x = (1.05 * k) / 30; pts.push(`${k ? "L" : "M"}${sx(x).toFixed(1)} ${(base + surf(x) - 24 * i).toFixed(1)}`); }
      f.path(pts.join(""), { c: C.faint, w: 1, dash: "3 3" });
    }
    const sea = []; for (let k = 0; k <= 30; k++) { const x = (1.05 * k) / 30; sea.push(`${k ? "L" : "M"}${sx(x).toFixed(1)} ${(base + surf(x)).toFixed(1)}`); }
    f.path(sea.join("") + `L${sx(1.05)} ${base + 60}L${sx(0)} ${base + 60}Z`, { c: C.sea, w: 1.6, fill: "#dcebf2" });
    const ray = []; for (let k = 0; k <= 30; k++) { const x = (d0 * k) / 30; ray.push(`${k ? "L" : "M"}${sx(x).toFixed(1)} ${(base + surf(x) - hr(x)).toFixed(1)}`); }
    f.path(ray.join(""), { c: flat ? C.flat : C.globe, w: 1.8, dash: "0" });
    f.dot(sx(0), base - e, { r: 3, c: C.ink }); f.dot(sx(d0), base + surf(d0), { r: 2.6, c: C.sea });
    f.note(sx(0) + 6, base - e - 6, "n_eye", { size: 10, c: C.ink }); f.note(sx(d0), base + surf(d0) + 15, "n_sea", { size: 10, anchor: "middle", c: C.sea });
    f.note(x0 + L / 2, 26, flat ? tr("rc-fx-f", "plane: n · cos α kept") : tr("rc-fx-g", "globe: n · r · cos α kept"), { size: 11, anchor: "middle", c: flat ? C.flat : C.globe });
  };
  panel(16, false); panel(204, true);
  stamp(f, tr, tr("rc-fx-st", "layers and curvature exaggerated"));
  return f;
}

export const CAUS_FIGS = { rfCausFx: figInvariants };

/** Monte l'exemple : la formule, la figure (redessinée à chaque activation) et les nombres du texte (span.cv[data-v^="rc"]). */
export function mountCaussolsAir(container, t, lang) {
  drawFormulaFigs(container, CAUS_FIGS, t, {}, "ref");
  const v = causValues(lang);
  container.querySelectorAll('span.cv[data-v^="rc"]').forEach((s) => { const x = v[s.dataset.v]; if (x != null) s.textContent = x; });
  const cv = container.querySelector("#rfCausAir");
  return cv ? drawCaussolsAir(cv, t, lang) : () => {};
}

/** Les nombres du texte (span.cv[data-v^="rc"]) et des cartes. */
export function causValues(lang = "en") {
  const N = causNumbers(), nf = (x, d = 0) => (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  return {
    rcDip: nf(N.dip, 1), rcDipLo: nf(N.dipLo, 1), rcDipHi: nf(N.dipHi, 1), rcH: nf(N.h, 0), rcP: nf(N.P, 0), rcPsea: nf(N.Psea, 0), rcTsea: nf(N.Tsea, 1),
    rcTeye: nf(N.day.Teye, 1), rcTfree: nf(N.day.Tfree, 1), rcTg: nf(N.globe.T, 0), rcTgLo: nf(N.globe.Tlo, 0), rcTgHi: nf(N.globe.Thi, 0),
    rcTf: nf(N.flat.T, 0), rcTfK: nf(N.flat.T + 273.15, 0), rcGg: nf(N.globe.grad * 100, 1), rcGf: nf(N.flat.grad * 100, 1), rcGd: nf(N.day.gFree * 100, 1), rcGd2: nf(N.day.grad * 100, 1),
    rcTsame: nf(N.Tsame, 0),
  };
}
