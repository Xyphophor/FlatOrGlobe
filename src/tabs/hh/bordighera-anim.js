// Animation « Bordighera depuis Antibes » (2026-10-06, photo du propriétaire) : la même scène sur
// le plan, puis sur le globe, puis avec la réfraction standard (géométrie : bordighera.js).
//   1. la vue de l'œil, à l'échelle angulaire VRAIE dans les deux sens : le terrain TINITALY en
//      anneaux (du plus loin au plus proche, voilés par la distance), les bâtiments OSM extrudés
//      à leur hauteur, puis la mer, dont le bord haut est l'horizon (globe) ou la côte (plan) ;
//      les deux lieux nommés gardent un contour pointillé quand la mer les cache ;
//   2. la coupe le long de la visée. Règle 1 : hauteurs × ex ET planète de rayon R/(c·ex), même
//      échelle dans les deux sens ; ex est imprimé. La réfraction y est dessinée comme on la
//      calcule : des rayons droits sur une Terre de rayon R/(1 − k).
// Aucun angle n'est lu sur le dessin ; les lectures viennent de bordighera.js.
import { setupCanvas } from "../../core/canvas.js";
import { reducedMotion, frameStep, exportBusy } from "../../core/motion.js";
import { keyClickable } from "../../core/a11y.js";
import { BORD_SITE, BORD_BUILDINGS, BORD_FAN } from "../../data/presets/hh-bordighera.js";
import { R, K, CYCLE, PHASES, stateAt, photoAlpha, decodeFan, elev, seaTop, hidden, buildingAngles, hiddenFraction, bordNumbers } from "./bordighera.js";
import { dipC } from "../../core/flatten.js";
import { BORD_PHOTO } from "../../data/presets/hh-bordighera-photo.js";

/** La scène de Bordighera (scènes de la liste : scenes.js). xhalfDeg : la photo fait 0,354° de large. */
export const BORD_SCENE = { site: BORD_SITE, buildings: BORD_BUILDINGS, fan: BORD_FAN, photo: BORD_PHOTO, xhalfDeg: 0.3 };

/** Calage de la photo (research/fit_bordighera_photo.py) à la courbure c : échelle s (px/rad, EXIF, la même
 * pour tous), azimut du centre (un seul : une direction ne dépend pas de la forme) et élévation de la rangée de l'horizon,
 * posée sur le haut de la mer du modèle (horizon du globe, côte sur le plan) : la photo est calée sur l'horizon. */
export function photoState(c, F, P = BORD_PHOTO, eye = BORD_SITE.eye) {
  const S = P.states, i = Math.max(0, S.findIndex((x, k) => k === S.length - 1 || S[k + 1].c >= c));
  const a = S[Math.min(i, S.length - 1)], b = S[Math.min(i + 1, S.length - 1)];
  const f = b.c > a.c ? Math.min(1, Math.max(0, (c - a.c) / (b.c - a.c))) : 0;
  const az = P.az, score = a.score + (b.score - a.score) * f;
  const j = Math.min(F.nAz - 1, Math.max(0, Math.round((az / D2R - F.az0) / F.azStep)));
  return { s: P.s, az, score, elH: seaTop(c, eye, F.coast[j]) };
}

/** Pixel (u, v) de la photo publiée (déjà redressée) -> (azimut, élévation) en rad à la courbure c. */
export function photoToAngles(u, v, c, F, P = BORD_PHOTO, eye = BORD_SITE.eye) {
  const ps = photoState(c, F, P, eye);
  return [ps.az + (u - P.w / 2) / ps.s, ps.elH + (P.horizon - v) / ps.s];
}

const D2R = Math.PI / 180;
const COL = {
  skyTop: "#d9e1e8", skyBot: "#eef0f0", haze: [214, 222, 229], land: [96, 122, 104], landFar: [128, 146, 150],
  sea: "#7f98ab", seaDeep: "#5f7a8f", seaLine: "#46647a", bld: [236, 230, 218], named: "#c2410c",
  ink: "#151a21", mute: "#5b6470", faint: "#697381", ray: "#0f766e", hidden: "#b45309", eye: "#8b93a0",
};
const mix = (a, b, f) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(",")})`;
const niceEx = (x) => { const p = 10 ** Math.floor(Math.log10(x)); const f = x / p; return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p; };

/**
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement|null} readsEl
 * @param {(k: string, fb: string, vars?: object) => string} t
 * @param {string} lang
 */
export function mountBordighera(canvas, readsEl, t, lang = "en", opEl = null, scene = BORD_SCENE) {
  const { site: SITE, buildings: BUILD, fan: FAN, photo: PH } = scene;
  const XHALF = (scene.xhalfDeg ?? 0.3) * D2R;  // demi-champ horizontal de la vue de l'œil (rad)
  const F = decodeFan(FAN), e = SITE.eye, N = bordNumbers(SITE);
  const dFront = SITE.dAim - 2000;              // le voile commence à s'épaissir 2 km avant la visée
  const num = (x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const arcmin = (rad) => `${num(Math.abs(rad) / D2R * 60, 1)}′`;
  // bâtiments du champ, triés plus tard par distance ; les nommés à part pour les contours
  const B = BUILD.filter((b) => b.v.some((v) => Math.abs(v[0] * 1e-6 * D2R) < XHALF * 1.05));
  const named = B.filter((b) => b.tag);
  const st = { time: 0, last: 0, raf: null, vis: true, playing: !reducedMotion(), key: "", op: opEl ? +opEl.value / 100 : 0.6 };
  // la photo du propriétaire, superposée : échelle de l'EXIF, calée sur l'horizon de chaque modèle
  let img = null;
  if (typeof Image === "function") { img = new Image(); img.onload = () => draw(true); img.src = "/" + PH.src; }
  // la réglette : si la photo est cachée à cet instant, on saute à la fin de sa révélation (globe réfracté, photo posée)
  if (opEl) opEl.addEventListener("input", () => {
    st.op = +opEl.value / 100;
    if (!photoAlpha(st.time, 1)) { st.time = Math.floor(st.time / CYCLE) * CYCLE + PHASES[4][1] - 0.3; st.playing = false; }
    draw(true);
  });
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); else draw(true); });
  keyClickable(canvas);

  // cadre vertical de la vue de l'œil, FIXE pendant tout le cycle : du dessous de l'horizon du globe
  // au haut du terrain du plan (le plus haut des deux), à la même échelle que l'horizontale
  const dipG = dipC(R, 1, e);

  function eyeView(ctx, P, c) {
    const s = P.w / (2 * XHALF);                                        // px par radian, les deux axes
    const yBot = -dipG - 0.12 * (P.h / s);                               // l'horizon du globe près du bas : le plan garde sa ville
    const X = (a) => P.x + P.w / 2 + a * s, Y = (a) => P.y + P.h - (a - yBot) * s;
    ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    const sky = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); sky.addColorStop(0, COL.skyTop); sky.addColorStop(1, COL.skyBot);
    ctx.fillStyle = sky; ctx.fillRect(P.x, P.y, P.w, P.h);
    // colonnes visibles du fan
    const j0 = Math.max(0, Math.floor((-XHALF / D2R - F.az0) / F.azStep) - 1), j1 = Math.min(F.nAz - 1, Math.ceil((XHALF / D2R - F.az0) / F.azStep) + 1);
    const xs = []; for (let j = j0; j <= j1; j++) xs.push(X(F.az(j) * D2R));
    // bâtiments en angles, triés du plus loin au plus proche
    const bs = B.map((b) => ({ b, a: buildingAngles(b, c, e) })).sort((p, q) => q.a.d - p.a.d);
    let bi = 0;
    const drawBuilding = ({ b, a }) => {
      const n = a.pts.length, fill = b.tag ? [246, 214, 190] : COL.bld;
      const hz = Math.min(0.55, Math.max(0, (a.d - dFront) / 9000)) * 0.55;
      // faces : de la plus lointaine à la plus proche (peintre dans le bâtiment)
      const faces = [];
      for (let i = 0; i < n; i++) {
        const p = a.pts[i], q = a.pts[(i + 1) % n];
        // orientation : normale de l'arête dans le plan local (x = travers en m, y = distance)
        const ex_ = (q.x - p.x) * a.d, ey = q.d - p.d, L = Math.hypot(ex_, ey) || 1;
        const facing = Math.abs(ex_ / L);                                  // face perpendiculaire à la visée → claire
        faces.push({ p, q, dm: (p.d + q.d) / 2, sh: 0.72 + 0.28 * facing });
      }
      faces.sort((u, v) => v.dm - u.dm);
      for (const f of faces) {
        ctx.fillStyle = mix(fill.map((v) => v * f.sh), COL.haze, hz);
        ctx.beginPath(); ctx.moveTo(X(f.p.x), Y(f.p.yb)); ctx.lineTo(X(f.q.x), Y(f.q.yb)); ctx.lineTo(X(f.q.x), Y(f.q.yt)); ctx.lineTo(X(f.p.x), Y(f.p.yt)); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = mix(fill.map((v) => v * 0.9), COL.haze, hz);       // toit (vu presque par la tranche)
      ctx.beginPath(); a.pts.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.yt)) : ctx.moveTo(X(p.x), Y(p.yt)))); ctx.closePath(); ctx.fill();
    };
    // terrain : anneaux du plus loin au plus proche, chacun rempli jusqu'au niveau de la mer à sa distance
    for (let i = F.nD - 1; i >= 0; i--) {
      const d = F.d(i);
      while (bi < bs.length && bs[bi].a.d >= d) drawBuilding(bs[bi++]);
      let any = false;
      for (let j = j0; j <= j1; j++) if (F.g[i * F.nAz + j] > 0.5) { any = true; break; }
      if (!any) continue;
      const base = Y(elev(c, e, d, 0)), f = Math.min(1, Math.max(0, (d - dFront) / 15000));
      ctx.fillStyle = mix(COL.land.map((v, k) => v + (COL.landFar[k] - v) * f), COL.haze, 0.25 + 0.55 * f);
      ctx.beginPath(); ctx.moveTo(xs[0], base);
      for (let j = j0; j <= j1; j++) ctx.lineTo(xs[j - j0], Y(elev(c, e, d, F.g[i * F.nAz + j])));
      ctx.lineTo(xs[xs.length - 1], base); ctx.closePath(); ctx.fill();
    }
    while (bi < bs.length) drawBuilding(bs[bi++]);
    // la mer, en dernier : son bord haut cache tout ce qui est au-dessous
    const tops = []; for (let j = j0; j <= j1; j++) tops.push(Y(seaTop(c, e, F.coast[j])));
    const g = ctx.createLinearGradient(0, Math.min(...tops), 0, P.y + P.h); g.addColorStop(0, COL.sea); g.addColorStop(1, COL.seaDeep);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(xs[0], P.y + P.h);
    tops.forEach((y, k) => ctx.lineTo(xs[k], y)); ctx.lineTo(xs[xs.length - 1], P.y + P.h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = COL.seaLine; ctx.lineWidth = 1; ctx.beginPath(); tops.forEach((y, k) => (k ? ctx.lineTo(xs[k], y) : ctx.moveTo(xs[k], y))); ctx.stroke();
    // la photo : transformation affine pixel -> écran (trois points suffisent), opacité choisie par le lecteur
    const alpha = photoAlpha(st.time, st.op);
    if (img && img.complete && img.naturalWidth && alpha > 0) {
      const toS = (u, v) => { const [x, y] = photoToAngles(u, v, c, F, PH, e); return [X(x), Y(y)]; };
      const o = toS(0, 0), ex_ = toS(1, 0), ey = toS(0, 1);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.transform(ex_[0] - o[0], ex_[1] - o[1], ey[0] - o[0], ey[1] - o[1], o[0], o[1]);
      ctx.drawImage(img, 0, 0); ctx.restore();
      const cs = [toS(0, 0), toS(PH.w, 0), toS(PH.w, PH.h), toS(0, PH.h)];
      ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.beginPath(); cs.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
    }
    // contours des lieux nommés : pointillés là où la mer les cache
    const labels = new Map();
    for (const b of named) {
      const a = buildingAngles(b, c, e);
      let xmin = Infinity, xmax = -Infinity, ytop = Infinity, ybot = -Infinity;
      for (const p of a.pts) { xmin = Math.min(xmin, X(p.x)); xmax = Math.max(xmax, X(p.x)); ytop = Math.min(ytop, Y(p.yt)); ybot = Math.max(ybot, Y(p.yb)); }
      ctx.strokeStyle = COL.named; ctx.lineWidth = 1.2; ctx.setLineDash([3, 2]); ctx.strokeRect(xmin, ytop, xmax - xmin, ybot - ytop); ctx.setLineDash([]);
      const L = labels.get(b.tag) || { xmin: Infinity, xmax: -Infinity, ytop: Infinity, frac: 0 };
      labels.set(b.tag, { xmin: Math.min(L.xmin, xmin), xmax: Math.max(L.xmax, xmax), ytop: Math.min(L.ytop, ytop), frac: Math.max(L.frac, hiddenFraction(b, c, e)) });
    }
    let row = 0;
    for (const [tag, L] of [...labels].sort((p, q) => p[1].xmin - q[1].xmin)) {
      const nm = SITE.named[tag].name, x = (L.xmin + L.xmax) / 2, y = Math.max(P.y + 14, L.ytop - 18 - 13 * row++);
      ctx.strokeStyle = COL.named; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.lineTo(x, L.ytop - 2); ctx.stroke();
      ctx.font = "600 10px ui-monospace, Menlo, monospace"; ctx.fillStyle = COL.named;
      const w = ctx.measureText(nm).width; const x0 = Math.min(Math.max(x - w / 2, P.x + 4), P.x + P.w - 4 - w);
      ctx.textAlign = "left"; ctx.fillText(nm, x0, y);
    }
    // échelle de hauteur à la distance de la visée (côté droit) et niveau de l'œil
    ctx.font = "9px ui-monospace, Menlo, monospace"; ctx.textAlign = "right";
    const xr = P.x + P.w - 6;
    for (const h of [0, 50, 100, 150, 200]) {
      const y = Y(elev(c, e, SITE.dAim, h));
      if (y < P.y + 8 || y > P.y + P.h - 4) continue;
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xr - 6, y); ctx.lineTo(xr, y); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.8)"; const lbl = `${h} m`; const w = ctx.measureText(lbl).width; ctx.fillRect(xr - 10 - w, y - 8, w + 3, 11);
      ctx.fillStyle = COL.ink; ctx.fillText(lbl, xr - 8, y + 2);
    }
    const y0 = Y(0);
    if (y0 > P.y && y0 < P.y + P.h) {
      ctx.setLineDash([5, 4]); ctx.strokeStyle = COL.eye; ctx.beginPath(); ctx.moveTo(P.x, y0); ctx.lineTo(P.x + P.w, y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign = "left"; ctx.fillStyle = COL.mute; ctx.fillText(t("bd-eye-level", "eye level"), P.x + 4, y0 - 4);
    }
    ctx.restore();
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.fillStyle = COL.faint;
    ctx.fillText(t("bd-eye-stamp", "eye view · true angles both ways · {w} wide", { w: `${num(2 * XHALF / D2R, 2)}°` }), P.x + 4, P.y + P.h + 12);
    ctx.strokeStyle = "rgba(21,26,33,.15)"; ctx.lineWidth = 1; ctx.strokeRect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1);
  }

  // ---- coupe le long de la visée ----
  const jc = Math.round(-F.az0 / F.azStep);
  const span = SITE.dAim + 2500;
  function sideView(ctx, P, c) {
    const padL = 10, padR = 10, padT = 14, padB = 8;
    const s = (P.w - padL - padR) / span, Vpx = P.h - padT - padB;
    let top = e; for (let i = 0; i < F.nD && F.d(i) <= span; i++) top = Math.max(top, F.g[i * F.nAz + jc]);
    const ex = niceEx((0.8 * Vpx / s) / (top + span * span / (2 * R)));
    const yb = P.y + padT + top * ex * s + 4, x0 = P.x + padL;
    const cc = Math.max(c, 1e-7), Rd = R / (cc * ex);
    const S = (Xm, Ym) => [x0 + Xm * s, yb - Ym * s];
    const at = (d, h) => { const th = d / Rd, r = Rd + h * ex; return S(r * Math.sin(th), r * Math.cos(th) - Rd); };
    ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    const sky = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); sky.addColorStop(0, COL.skyTop); sky.addColorStop(1, COL.skyBot);
    ctx.fillStyle = sky; ctx.fillRect(P.x, P.y, P.w, P.h);
    // mer puis terre de Bordighera (profil TINITALY dans l'azimut de la visée)
    ctx.fillStyle = COL.sea; ctx.beginPath(); ctx.moveTo(...at(0, 0));
    for (let i = 0; i <= 120; i++) ctx.lineTo(...at(span * 1.05 * i / 120, 0));
    ctx.lineTo(P.x + P.w, P.y + P.h); ctx.lineTo(P.x, P.y + P.h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = mix(COL.land, COL.haze, 0.2); ctx.beginPath(); ctx.moveTo(...at(F.d0, 0));
    for (let i = 0; i < F.nD && F.d(i) <= span * 1.05; i++) ctx.lineTo(...at(F.d(i), F.g[i * F.nAz + jc]));
    ctx.lineTo(...at(span * 1.05, 0)); ctx.closePath(); ctx.fill();
    // le balcon : le sol LiDAR et l'œil au-dessus
    const G = at(0, SITE.eyeGround), E = at(0, e);
    ctx.fillStyle = mix(COL.land, COL.haze, 0.1); ctx.beginPath(); ctx.moveTo(x0 - 12, at(0, 0)[1] + 2); ctx.lineTo(G[0] - 3, G[1]); ctx.lineTo(G[0] + 8, G[1]); ctx.lineTo(x0 + 26, at(1500, 0)[1] + 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#c9b79a"; ctx.fillRect(G[0] - 3, E[1], 6, G[1] - E[1]);
    // les lieux nommés : des barres à leur distance, du sol au toit
    for (const b of named) {
      const d = b.v.reduce((a, v) => a + v[1], 0) / b.v.length, g = Math.min(...b.v.map((v) => v[2]));
      const p = at(d, g), q = at(d, b.roof);
      ctx.strokeStyle = COL.named; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke();
    }
    // le rayon rasant (globe) ou la visée du pied (plan)
    const th0 = c > 0 ? Math.acos(Rd / (Rd + e * ex)) : 0;
    ctx.strokeStyle = COL.ray; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...E);
    if (c > 0 && Math.sqrt(2 * (R / cc) * e) < SITE.dAim) {
      const T = [x0 + Rd * Math.sin(th0) * s, yb - (Rd * Math.cos(th0) - Rd) * s];
      const dir = [T[0] - E[0], T[1] - E[1]], L = Math.hypot(...dir), far = 3 * P.w;
      ctx.lineTo(E[0] + dir[0] / L * far, E[1] + dir[1] / L * far); ctx.stroke();
      ctx.fillStyle = COL.ray; ctx.beginPath(); ctx.arc(T[0], T[1], 3, 0, 7); ctx.fill();
      // la hauteur cachée à la visée, en ambre
      const hid = hidden(c, e, SITE.dAim), A0 = at(SITE.dAim, 0), A1 = at(SITE.dAim, hid);
      ctx.strokeStyle = COL.hidden; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A0[0] + 7, A0[1]); ctx.lineTo(A1[0] + 7, A1[1]); ctx.stroke();
    } else {
      ctx.lineTo(...at(SITE.dAim, Object.values(SITE.named)[0].ground)); ctx.stroke();
    }
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(E[0], E[1], 3, 0, 7); ctx.fill();
    ctx.restore();
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.fillStyle = COL.faint;
    ctx.fillText(t("bd-side-stamp", "cross-section · heights ×{ex}, planet radius ÷{ex} · {km} km across", { ex: num(ex), km: num(span / 1000) }), P.x + 4, P.y + P.h + 12);
    ctx.strokeStyle = "rgba(21,26,33,.15)"; ctx.lineWidth = 1; ctx.strokeRect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1);
  }

  function title(S) {
    if (S.curv <= 0) return t("bd-st-plane", "plane: nothing can hide anything");
    if (S.refr <= 0) return t("bd-st-curv", "globe, curvature {pct} %, no refraction", { pct: Math.round(S.curv * 100) });
    return t("bd-st-refr", "globe + refraction, k = {k}", { k: num(K * S.refr, 3) });
  }

  // le toit du premier lieu nommé MESURÉ sur la photo, au-dessus de la ligne de mer : photo (fixe) et état courant
  const mKey = Object.keys(SITE.named).find((k) => PH.meas?.[k]);
  const mB = mKey && BUILD.find((b) => b.id === SITE.named[mKey].ids[0]), mv = mKey && PH.meas[mKey];
  const mD = mB ? mB.v.reduce((a, v) => a + v[1], 0) / mB.v.length : 0;
  function photoRead(c) {
    if (!mB) return "";
    const ps = photoState(c, F, PH, e), pred = (elev(c, e, mD, mB.roof) - ps.elH) * mD;
    return t("bd-photo-r", "{name} roof above the sea: photo {ph} · this model {mod} · buildings match {sc}",
      { name: SITE.named[mKey].short ?? SITE.named[mKey].name.split(" ")[0], ph: `${num(mv.m, 0)} m`,
        mod: pred < 0 ? `${num(pred, 0)} m (${t("bd-hidden", "hidden")})` : `${num(pred, 0)} m`, sc: num(ps.score, 2) });
  }

  function reads(S) {
    if (!readsEl) return;
    const r = (x) => `<span class="r">${x}</span>`, m = (x) => `${num(x)} m`, v = N.rows[0];
    const html = r(`${t("bd-r-now", "hidden at {name} now", { name: v.name })} <b>${m(hidden(S.c, e, v.d))}</b>`)
      + r(`${t("bd-globe", "globe")} ${m(v.globe)} <span class="sub">k = ${num(K, 2)} : ${m(v.refr)}</span>`)
      + r(`${t("bd-plane", "plane")} 0 m`)
      + r(`${t("bd-eye", "eye")} ${m(e)} · ${t("bd-dip", "sea horizon")} ${S.c > 0 ? "−" + arcmin(dipC(R, S.c, e)) : "—"}`)
      + (mB ? r(photoRead(S.c)) : "")
      + r(`<span class="sub">${st.playing ? t("bd-pause", "click: pause") : t("bd-play", "click: play")}</span>`);
    if (readsEl._last !== html) { readsEl.innerHTML = html; readsEl._last = html; }
  }

  function draw(force) {
    const w = canvas.getBoundingClientRect().width;
    if (!w) return;
    const hEye = Math.round(Math.min(w * 0.58, 540)), hSide = Math.round(Math.min(Math.max(w * 0.2, 120), 180));
    const want = 22 + hEye + 18 + hSide + 18;
    if (canvas._h !== want) { canvas.style.height = want + "px"; canvas._h = want; force = true; }
    const S = stateAt(st.time), key = `${S.c.toFixed(5)}|${S.curv}|${S.refr}|${st.playing}|${photoAlpha(st.time, st.op)}`;
    if (!force && key === st.key) return;
    st.key = key;
    const { ctx, W, H } = setupCanvas(canvas);
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    ctx.font = "600 12px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.fillStyle = COL.ink;
    ctx.fillText(title(S), 4, 15);
    const hA = Math.round(Math.min(W * 0.58, 540));
    eyeView(ctx, { x: 0, y: 22, w: W, h: hA }, S.c);
    sideView(ctx, { x: 0, y: 22 + hA + 18, w: W, h: H - 22 - hA - 2 * 18 }, S.c);
    reads(S);
  }

  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (st.dead || !st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      const n = frameStep(st, ts);
      if (n) { st.time += n / 60; draw(); }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  let saved = null;
  canvas.__anim = {
    duration: CYCLE,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(x) { st.time = x; draw(true); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(true); if (st.playing) loop(); },
  };
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => { st.vis = es.some((x) => x.isIntersecting); if (st.vis && !exportBusy()) loop(); }) : null;
  io?.observe(canvas);
  return {
    start() { draw(true); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
    draw: () => draw(true),
    seek(x) { st.time = x; draw(true); },
    // changement de scène : l'appelant remplace le canvas et la réglette par des copies neuves (sans écouteurs)
    dispose() { st.dead = true; io?.disconnect(); if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
  };
}
