// Onglet ref (2026-11-13, demande du propriétaire : « la même analyse de réfraction qu'à Caussols, mais pour le balcon
// à Antibes ») : la photo de Bordighera de l'onglet hh (49 km de mer, œil à 41,6 m) et l'air qu'il faut à chaque modèle
// pour cacher les 44,8 m que la photo cache à la Villa Regina Margherita.
//
// Ici, ce n'est pas un dip : la forme du profil compte, pas seulement ses deux bouts. Les rayons sont tracés par fog
// (fog build ref-bordighera, package refbord) dans l'air du jour (ERA5 + mer d'Open-Meteo, couche de surface de
// Monin-Obukhov, package refrac), sur une sphère de 6 371 km et sur un plan, pour des différences air − mer de −10 à
// +4 K : le vent, l'humidité et la mer restent ceux du jour, seule la température de l'air change, la même pour les
// deux modèles. La figure montre les profils de température de la mer à l'œil, la jauge le gradient moyen entre 0,5 m
// et l'œil. Aucun angle n'est lu sur le dessin.
import { setupCanvas } from "../../core/canvas.js";
import { drawGradGauge } from "../../core/refgauge.js";
import { FIG } from "../../core/fig.js";
import { axesStamp, drawFormulaFigs } from "../../core/formfigs.js";
import { RB_AIR, RB_TRACED } from "../../data/presets/ref-bordighera.js";
import { bordNumbers, bordProfile } from "./air-stats.js";

const COL = { ink: "#151a21", mute: "#5b6470", faint: "#697381", globe: "#1d4ed8", flat: "#b45309", cold: "#cfe0ef", warm: "#f3dccb",
  sea: "#7f98ab", grid: "rgba(91,100,112,.25)" };
const HEAD = "700 11px ui-monospace, Menlo, monospace", SMALL = "9px ui-monospace, Menlo, monospace", STAMP = "10px ui-monospace, Menlo, monospace";
const GW = 72, GAP = 10;

/** La figure : jauge du globe | les profils de température de la mer à l'œil | jauge du plan. */
export function drawBordAir(canvas, t, lang) {
  const N = bordNumbers();
  const num = (x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const sgn = (x, d = 1) => (Math.abs(x) < 0.5 * 10 ** -d ? num(0, d) : (x < 0 ? "−" : "+") + num(Math.abs(x), d));
  const g100 = (g) => sgn(g * 100, 1);
  const zs = [0, ...N.zs], prof = (T) => [N.sst, ...T];   // la mer à z = 0, puis le profil de 0,5 m à l'œil
  const draw = () => {
    const wpx = canvas.getBoundingClientRect().width;
    if (!wpx) return;
    const H = Math.round(Math.min(420, Math.max(300, wpx * 0.5)));
    if (canvas._h !== H) { canvas.style.height = H + "px"; canvas._h = H; }
    const { ctx, W } = setupCanvas(canvas);
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const gLo = -0.04, gHi = 0.01;
    const gauge = (flat) => {
      const m = flat ? N.flat : N.globe, col = flat ? COL.flat : COL.globe;
      drawGradGauge(ctx, { x: flat ? W - GW : 0, y: 0, w: GW, h: H }, {
        flat, col, title: flat ? t("rc-PLANE", "PLANE") : t("rc-GLOBE", "GLOBE"), sub: "dT/dz", lo: gLo, hi: gHi,
        tick: 0.005, labelEvery: 2, fmt: (g) => (Math.abs(g) < 1e-9 ? "0" : g100(g).replace(/[.,]0$/, "")),
        day: N.day.grad, dayA: N.day.gLo, dayB: N.day.gHi, dayOver: N.day.grad > gHi,
        need: { grad: m ? m.grad : null, beyond: !m, gLo: m?.gLo, gHi: m?.gHi },
        marks: [{ g: -0.0098 }, { g: -0.0343 }],
        lines: [{ text: `${t("rc-need", "need")} ${m ? g100(m.grad) : "—"}`, color: col, dy: 48 }, { text: m ? `${sgn(m.dT, 2)} K ${t("rb-as", "air−sea")}` : "", color: col, dy: 37 },
          { text: `${t("rc-day", "day")} ${g100(N.day.grad)}`, color: COL.ink, dy: 23 }, { text: `${g100(N.day.gLo)} … ${g100(N.day.gHi)}`, color: COL.ink, dy: 12 },
          { text: t("rc-unit", "K/100 m"), color: COL.mute, dy: 1 }],
        C: { ink: COL.ink, mute: COL.mute, faint: COL.faint, warm: COL.warm, cold: COL.cold }, F: { head: HEAD, small: SMALL },
      });
    };
    gauge(false); gauge(true);
    // le panneau central : température (°C) en abscisse, hauteur (m) en ordonnée, les profils entiers
    const narrow = W - 2 * (GW + GAP) < 420, P = { x: GW + GAP, y: 30, w: W - 2 * (GW + GAP), h: H - 30 - (narrow ? 46 : 34) };
    const all = [N.day.Tlo, N.day.Thi, N.globe?.T, N.flat?.T].filter(Boolean).flat().concat([N.sst]);
    const t0 = Math.floor(Math.min(...all) - 0.5), t1 = Math.ceil(Math.max(...all) + 0.5);
    const X = (T) => P.x + 34 + ((T - t0) / (t1 - t0)) * (P.w - 44), Y = (z) => P.y + P.h - (z / N.eye) * (P.h - 10);
    ctx.fillStyle = "rgba(127,152,171,.18)"; ctx.fillRect(P.x, Y(0), P.w, P.y + P.h + 6 - Y(0));
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.font = SMALL; ctx.fillStyle = COL.faint; ctx.textAlign = "center";
    const step = (t1 - t0) > 8 && narrow ? 2 : 1;
    for (let T = t0; T <= t1; T += step) { ctx.beginPath(); ctx.moveTo(X(T), P.y); ctx.lineTo(X(T), Y(0)); ctx.stroke(); ctx.fillText(`${num(T)}${narrow ? "" : " °C"}`, X(T), Y(0) + 12); }
    if (narrow) { ctx.textAlign = "left"; ctx.fillText("°C", P.x + 4, Y(0) + 12); }
    ctx.textAlign = "right";
    for (const z of [0, 10, 20, 30, N.eye]) { ctx.beginPath(); ctx.moveTo(P.x + 34, Y(z)); ctx.lineTo(P.x + P.w, Y(z)); ctx.stroke(); ctx.fillText(`${num(z, z % 1 ? 1 : 0)} m`, P.x + 30, Y(z) + 3); }
    const curve = (T, col, w, dash) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); prof(T).forEach((x, i) => (i ? ctx.lineTo(X(x), Y(zs[i])) : ctx.moveTo(X(x), Y(zs[i])))); ctx.stroke(); ctx.setLineDash([]); };
    // la bande de l'air du jour (± dTsd sur l'air − mer)
    ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = COL.ink; ctx.beginPath();
    prof(N.day.Tlo).forEach((x, i) => (i ? ctx.lineTo(X(x), Y(zs[i])) : ctx.moveTo(X(x), Y(zs[i]))));
    [...prof(N.day.Thi)].reverse().forEach((x, i) => ctx.lineTo(X(x), Y(zs[zs.length - 1 - i])));
    ctx.closePath(); ctx.fill(); ctx.restore();
    curve(N.day.T, COL.ink, 2);
    if (N.globe) curve(N.globe.T, COL.globe, 2);
    if (N.flat) curve(N.flat.T, COL.flat, 2);
    const lab = (T, s, col, dy, align) => { ctx.font = "600 10px ui-monospace, Menlo, monospace"; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, X(T) + (align === "left" ? 5 : -5), Y(N.eye) + dy); };
    if (N.flat) lab(N.flat.T.at(-1), `${t("rc-plane", "plane")} ${num(N.flat.T.at(-1), 1)} °C`, COL.flat, narrow ? 28 : 14, "left");
    if (N.globe) lab(N.globe.T.at(-1), `${t("rc-globe", "globe")} ${num(N.globe.T.at(-1), 1)} °C`, COL.globe, -4, "left");
    lab(N.day.T.at(-1), `${t("rc-day-air", "that day")} ${num(N.day.T.at(-1), 1)} °C`, COL.ink, narrow ? 14 : -4, "right");
    ctx.font = SMALL; ctx.fillStyle = COL.mute; ctx.textAlign = "left";
    const seaTxt = t("rb-sea", "sea {T} °C · Bordighera {d} km", { T: num(N.sst, 1), d: num(N.d / 1000, 0) });
    const sw = ctx.measureText(seaTxt).width, ys = Y(0) - (narrow ? 16 : 4);   // étroit : au-dessus des textes des jauges
    if (X(N.sst) + 6 + sw > P.x + P.w) ctx.fillText(seaTxt, Math.max(P.x + 36, X(N.sst) - 6 - sw), ys);
    else ctx.fillText(seaTxt, X(N.sst) + 6, ys);
    ctx.fillText(t("rb-eye", "eye {h} m · {H} ± {s} m hidden", { h: num(N.eye, 1), H: num(N.H, 1), s: num(N.Hsd, 0) }), P.x + 36, 11);
    ctx.font = STAMP; ctx.fillStyle = COL.faint; ctx.textAlign = "left";
    const words = t("rb-stamp", "temperature, sea to eye · surface-layer profiles · to scale of its axes").split(" "), rows = [];
    let ln = ""; for (const w of words) { const x = ln ? ln + " " + w : w; if (ln && ctx.measureText(x).width > P.w) { rows.push(ln); ln = w; } else ln = x; }
    if (ln) rows.push(ln);
    const rr = rows.slice(0, 2); rr.forEach((r, i) => ctx.fillText(r, P.x, H - 4 - 12 * (rr.length - 1 - i)));
  };
  return draw;
}

/* La formule : le profil de la couche de surface, une famille de courbes tirées des airs tracés (les vrais nombres du
 * 28 mars) ; plus l'air est froid sur la mer, plus la température chute dans les premiers mètres. */
function figProfiles(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("rb-fx-alt", "Temperature against height from the sea to 41.6 m, for five airs over the same sea at 14.6 °C, with the wind and humidity of 28 March 2026: the air at 2 m three, two and one kelvin colder than the sea, as warm as the sea, and half a kelvin warmer. The colder the air, the faster the temperature falls in the lowest metres; above about ten metres every curve falls slowly.") });
  const C = FIG.C, x0 = 46, x1 = 360, y0 = 190, y1 = 30, zs = [0, ...RB_AIR.zs], e = RB_AIR.eye;
  const dTs = [-3, -2, -1, 0, 0.5], all = dTs.flatMap((d) => bordProfile(d, RB_TRACED)).concat([RB_AIR.sst]);
  const t0 = Math.floor(Math.min(...all)), t1 = Math.ceil(Math.max(...all));
  const X = (T) => x0 + ((T - t0) / (t1 - t0)) * (x1 - x0), Y = (z) => y0 - (z / e) * (y0 - y1);
  f.line(x0, y0, x1, y0, { c: C.faint, w: 1 }); f.line(x0, y0, x0, y1, { c: C.faint, w: 1 });
  for (let T = t0; T <= t1; T += 1) f.note(X(T), y0 + 13, `${T}`, { size: 9, anchor: "middle", c: C.faint });
  f.note(x1, y0 + 26, "°C", { size: 9, anchor: "end", c: C.faint });
  for (const z of [0, 20, e]) f.note(x0 - 4, Y(z) + 3, `${z} m`, { size: 9, anchor: "end", c: C.faint });
  dTs.forEach((d, j) => {
    const T = [RB_AIR.sst, ...bordProfile(d, RB_TRACED)];
    f.path(T.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(zs[i]).toFixed(1)}`).join(""), { c: j === 3 ? C.ink : C.soft, w: j === 3 ? 1.8 : 1.2, dash: "0" });
    f.note(X(T.at(-1)), Y(e) - 5, `${d > 0 ? "+" : ""}${d} K`, { size: 9, anchor: "middle", c: C.soft });
  });
  f.note(X(RB_AIR.sst) + 4, y0 - 4, tr("rb-fx-sea", "sea"), { size: 9, c: C.sea });
  axesStamp(f, tr, tr("rb-fx-st", "air − sea at 2 m"));
  return f;
}

export const BORD_FIGS = { rfBordFx: figProfiles };

/** Monte l'exemple : la formule, la figure (redessinée à chaque activation). Les nombres du texte viennent de
 * bordValues (span.cv[data-v^="rb"], remplis par l'onglet). */
export function mountBordAir(container, t, lang) {
  drawFormulaFigs(container, BORD_FIGS, t, {}, "ref");
  const cv = container.querySelector("#rfBordAir");
  return cv ? drawBordAir(cv, t, lang) : () => {};
}

/** Les nombres du texte (span.cv[data-v^="rb"]) et des cartes. */
export function bordValues(lang = "en") {
  const N = bordNumbers(), nf = (x, d = 0) => (x == null ? "—" : (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));
  const sg = (x, d = 1) => (x == null ? "—" : (x < 0 ? "−" : "+") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));
  return {
    rbEye: nf(N.eye, 1), rbD: nf(N.d / 1000, 0), rbH: nf(N.H, 1), rbHsd: nf(N.Hsd, 0), rbSst: nf(N.sst, 1), rbT2: nf(N.t2, 1), rbU: nf(N.u, 1),
    rbAs: sg(N.day.dT, 1), rbAsSd: nf(N.dTsd, 1), rbHg: nf(N.hiddenGlobe, 0), rbHf: nf(N.hiddenFlat, 0),
    rbGd: sg(N.day.grad * 100, 2), rbGdLo: sg(N.day.gLo * 100, 2), rbGdHi: sg(N.day.gHi * 100, 2),
    rbAsG: sg(N.globe?.dT, 2), rbAsF: sg(N.flat?.dT, 2), rbGg: sg(N.globe && N.globe.grad * 100, 2), rbGf: sg(N.flat && N.flat.grad * 100, 2),
    rbTg: nf(N.globe?.T.at(-1), 1), rbTf: nf(N.flat?.T.at(-1), 1), rbTd: nf(N.day.T.at(-1), 1),
    rbDg: sg(N.globe && N.globe.dT - N.day.dT, 1), rbDf: sg(N.flat && N.flat.dT - N.day.dT, 1),
  };
}
