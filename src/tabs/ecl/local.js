// Circonstances locales (epic09/UC05) : calculateur + carte + contrôles EN
// DIRECT. Deux routes indépendantes, toutes deux sur un globe :
//  1. les éléments besséliens publiés (NASA) et la méthode de Meeus
//     (logic.js : localCircumstances), observateur sur l'ellipsoïde ;
//  2. les éphémérides propres du site (src/core/ephemeris.js, Meeus 25/47,
//     celles d'obs et d'azim) : Soleil et Lune topocentriques, séparation
//     minimale, et la Lune agrandie par sa distance au LIEU (et non au centre
//     de la Terre) -- sans cette correction la totalité de Louxor tombe de
//     380 à 295 s.
// Les écarts de la route 1 aux ~100 points publiés de la ligne centrale sont
// recalculés au montage : aucun chiffre de validation n'est écrit en dur.
import { ECL_2027, ECL_PATHS } from "../../data/presets/ecl.js";
import { localCircumstances, hhmm, pathLimits } from "./logic.js";
import { OBS } from "../../core/ephemeris.js";
import { coastLines } from "../../core/globe25d.js";
import { pixelRatio, fillTextFit } from "../../core/canvas.js";

export const ECL_PLACES = [
  ["Tarifa", 36.0128, -5.6048, 10], ["Cádiz", 36.5297, -6.2927, 10], ["Tangier", 35.7595, -5.834, 20],
  ["Luxor", 25.6872, 32.6396, 76], ["Jeddah", 21.4858, 39.1925, 10], ["Marseille", 43.2965, 5.3698, 20], ["Paris", 48.8566, 2.3522, 35],
];
const hms = (h) => { if (h == null) return "—"; const s = Math.round(h * 3600); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, "0")).join(":"); };

/** Pires écarts de la route 1 contre la ligne centrale publiée. */
export function centreLineCheck() {
  let t = 0, d = 0, a = 0, z = 0, n = 0;
  for (const r of ECL_PATHS["2027"]) {
    if (r.t === "Limits" || r.alt < 5) continue;
    const l = localCircumstances(ECL_2027, r.c[0], r.c[1]);
    t = Math.max(t, Math.abs(l.max - hhmm(r.t)) * 3600); d = Math.max(d, Math.abs(l.duration - r.dur));
    a = Math.max(a, Math.abs(l.alt - r.alt)); if (r.alt < 85) z = Math.max(z, Math.abs(((l.az - r.az + 540) % 360) - 180)); n++;
  }
  return { n, t, d, a, z };
}

/** Limites calculées (logic.js : pathLimits) pour chaque instant de la table, et leur pire écart à la ligne publiée. */
let LIMITS = null;
export function computedLimits() {
  if (LIMITS) return LIMITS;
  const rows = ECL_PATHS["2027"].filter((q) => q.t !== "Limits");
  const toLine = (p, key) => { let best = 1e9;
    for (let i = 0; i < rows.length - 1; i++) { const a = rows[i][key], b = rows[i + 1][key], k = Math.cos(p[0] * Math.PI / 180) * 111.195;
      const ax = (a[1] - p[1]) * k, ay = (a[0] - p[0]) * 111.195, bx = (b[1] - p[1]) * k, by = (b[0] - p[0]) * 111.195;
      const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy)); }
    return best; };
  const north = [], south = []; let worst = 0;
  for (const r of rows) {
    const L = pathLimits(ECL_2027, hhmm(r.t)); if (!L) continue;
    const [n, s] = L.left[0] > L.right[0] ? [L.left, L.right] : [L.right, L.left];
    north.push(n); south.push(s);
    if (r.alt >= 15) worst = Math.max(worst, toLine(n, "n"), toLine(s, "s"));   // aux bouts la ligne publiée s'arrête
  }
  return (LIMITS = { north, south, worst });
}

/** Route 2 : éphémérides propres, séparation topocentrique, Lune agrandie ou non. */
export function ownEphemeris(lat, lon, h, guessUT) {
  const Y = 2027, M = 8, D = 2, jd0 = OBS.jdFromUTC(Y, M, D, 0, 0, 0) + guessUT / 24;
  const v = (az, al) => { const a = az * Math.PI / 180, b = al * Math.PI / 180; return [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)]; };
  let best = { sep: 1e9 }, tin = { geo: null, topo: null }, tout = { geo: null, topo: null };
  for (let s = -900; s <= 900; s += 2) {
    const jd = jd0 + s / 86400;
    const S = OBS.bodyAt("sun", jd, lat, lon, h, { refraction: false }), Mo = OBS.bodyAt("moon", jd, lat, lon, h, { refraction: false });
    const p = v(S.az, S.altTrue), q = v(Mo.az, Mo.altTrue);
    const sep = Math.acos(Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])) * 180 / Math.PI;
    if (sep < best.sep) best = { sep, s };
    const dTopo = Math.sqrt(Mo.distKM ** 2 + 6371 ** 2 - 2 * Mo.distKM * 6371 * Math.sin(Mo.altTrue * Math.PI / 180));
    for (const [k, sdM] of [["geo", Mo.sd], ["topo", Mo.sd * Mo.distKM / dTopo]]) {
      if (sdM - S.sd - sep > 0) { if (tin[k] === null) tin[k] = s; tout[k] = s; }
    }
  }
  return { max: guessUT + best.s / 3600, geo: tin.geo === null ? null : tout.geo - tin.geo + 2, topo: tin.topo === null ? null : tout.topo - tin.topo + 2 };
}

export function mountLocal(root, tr) {
  const $ = (id) => root.querySelector("#" + id);
  const map = $("eclMap"), out = $("eclLocalOut"), chk = $("eclCheck"), own = $("eclOwn");
  const lat = $("eclLat"), lon = $("eclLon"), alt = $("eclAlt"), btns = $("eclPlaces");
  btns.innerHTML = ECL_PLACES.map(([n], i) => `<button type="button" class="presetbtn" data-i="${i}">${tr("place-" + n, n)}</button>`).join("");
  btns.addEventListener("click", (e) => { const i = e.target.dataset?.i; if (i == null) return; const p = ECL_PLACES[+i]; lat.value = p[1]; lon.value = p[2]; alt.value = p[3]; run(); });
  for (const el of [lat, lon, alt]) el.addEventListener("change", run);
  // la carte : plate carrée régionale, bande publiée, point choisi ; clic = choisir
  const V = { lon0: -32, lon1: 52, lat0: 2, lat1: 52 };
  map.style.cursor = "crosshair";
  map.addEventListener("click", (e) => {
    const r = map.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    lon.value = (V.lon0 + fx * (V.lon1 - V.lon0)).toFixed(3); lat.value = (V.lat1 - fy * (V.lat1 - V.lat0)).toFixed(3); alt.value = 0; run();
  });
  let lastOwnKey = null;
  function drawMap(pla, plo) {
    const r = map.getBoundingClientRect(); if (!r.width) return;
    const dpr = pixelRatio(2);
    map.width = Math.round(r.width * dpr); map.height = Math.round(r.height * dpr);
    const ctx = map.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = r.width, H = r.height, X = (lo) => ((lo - V.lon0) / (V.lon1 - V.lon0)) * W, Y = (la) => ((V.lat1 - la) / (V.lat1 - V.lat0)) * H;
    ctx.fillStyle = "#eef5f7"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(15,118,110,.55)"; ctx.lineWidth = 0.8;
    for (const line of coastLines()) { ctx.beginPath(); let pen = false; for (const q of line) { if (!q) { pen = false; continue; } pen ? ctx.lineTo(X(q[1]), Y(q[0])) : ctx.moveTo(X(q[1]), Y(q[0])); pen = true; } ctx.stroke(); }
    const rows = ECL_PATHS["2027"];
    ctx.fillStyle = "rgba(255,120,90,.35)"; ctx.beginPath();
    rows.forEach((q, i) => (i ? ctx.lineTo(X(q.n[1]), Y(q.n[0])) : ctx.moveTo(X(q.n[1]), Y(q.n[0]))));
    [...rows].reverse().forEach((q) => ctx.lineTo(X(q.s[1]), Y(q.s[0]))); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#c2410c"; ctx.lineWidth = 1.2; ctx.beginPath(); rows.forEach((q, i) => (i ? ctx.lineTo(X(q.c[1]), Y(q.c[0])) : ctx.moveTo(X(q.c[1]), Y(q.c[0])))); ctx.stroke();
    // limites CALCULÉES par la page, en pointillé sur la bande publiée
    const lim = computedLimits();
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    for (const line of [lim.north, lim.south]) { ctx.beginPath(); line.forEach((q, i) => (i ? ctx.lineTo(X(q[1]), Y(q[0])) : ctx.moveTo(X(q[1]), Y(q[0])))); ctx.stroke(); }
    ctx.setLineDash([]);
    for (const [n, la, lo] of ECL_PLACES) { ctx.fillStyle = "#5b6470"; ctx.beginPath(); ctx.arc(X(lo), Y(la), 2, 0, 7); ctx.fill(); }
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(X(plo), Y(pla), 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
    fillTextFit(ctx, tr("local-map", "shaded: published path (NASA) · dashed: limits computed here · click to choose a place"), 8, H - 8, W - 16, { dir: -1 });
  }
  function run() {
    const la = +lat.value, lo = +lon.value, h = +alt.value || 0;
    if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90) return;
    const l = localCircumstances(ECL_2027, la, lo, h);
    const up = (a) => (a == null ? "" : a < 0 ? ` <span class="sub">(${tr("local-below", "Sun below the horizon")})</span>` : "");
    out.innerHTML = !l.eclipse
      ? `<tr><td colspan="2">${tr("local-none", "No eclipse here: the penumbra misses this place.")}</td></tr>`
      : [[tr("local-c1", "first contact (partial begins)"), hms(l.c1) + up(l.c1alt)],
         [tr("local-c2", "second contact (totality begins)"), hms(l.c2) + up(l.c2alt)],
         [tr("local-max", "maximum"), `${hms(l.max)} · ${tr("local-mag", "magnitude")} ${l.mag.toFixed(3)}`],
         [tr("local-c3", "third contact (totality ends)"), hms(l.c3) + up(l.c3alt)],
         [tr("local-c4", "fourth contact (partial ends)"), hms(l.c4) + up(l.c4alt)],
         [tr("local-dur", "duration of totality"), l.duration ? `<b>${Math.floor(l.duration / 60)} min ${(l.duration % 60).toFixed(1)} s</b>` : tr("local-partial", "— partial only")],
         [tr("local-sun", "Sun at maximum"), `${tr("local-alt", "altitude")} ${l.alt.toFixed(1)}° · ${tr("local-az", "azimuth")} ${l.az.toFixed(1)}°`]]
          .map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`).join("") + `<tr><td colspan="2" class="sub">UT · ${la.toFixed(3)}°, ${lo.toFixed(3)}°, ${h} m</td></tr>`;
    drawMap(la, lo);
    // route 2, seulement là où il y a une totalité (coût : ~900 couples de positions)
    const key = `${la}|${lo}|${h}`;
    if (key !== lastOwnKey) {
      lastOwnKey = key;
      if (l.eclipse && l.duration) {
        const o = ownEphemeris(la, lo, h, l.max);
        own.innerHTML = `<span>${tr("own-title", "Second route, the site's own Sun and Moon")}:</span>` +
          `<span>${tr("own-max", "maximum")} <b>${hms(o.max)}</b> (${((o.max - l.max) * 3600 >= 0 ? "+" : "") + ((o.max - l.max) * 3600).toFixed(0)} s)</span>` +
          `<span>${tr("own-geo", "totality with the Moon's size seen from the Earth's centre")} <b>${o.geo ?? "—"} s</b></span>` +
          `<span class="g">${tr("own-topo", "…seen from this place")} <b>${o.topo ?? "—"} s</b> (${tr("own-vs", "Besselian")} ${l.duration.toFixed(0)} s)</span>`;
      } else own.innerHTML = `<span>${tr("own-none", "The second route is run where there is totality.")}</span>`;
    }
  }
  let checked = false;
  return {
    start() {
      if (!checked) {
        checked = true;
        const c = centreLineCheck();
        chk.innerHTML = `<span>${tr("chk-title", "Checked now, against NASA's centre line")} (${c.n} ${tr("chk-points", "points")}):</span>` +
          `<span>${tr("chk-time", "time of maximum")} ≤ <b>${c.t.toFixed(1)} s</b></span><span>${tr("chk-dur", "duration")} ≤ <b>${c.d.toFixed(2)} s</b></span>` +
          `<span>${tr("chk-alt", "Sun's altitude")} ≤ <b>${c.a.toFixed(2)}°</b></span><span>${tr("chk-az", "azimuth")} ≤ <b>${c.z.toFixed(2)}°</b></span>` +
          `<span>${tr("chk-lim", "limits of totality, computed (dashed on the map)")} ≤ <b>${computedLimits().worst.toFixed(1)} km</b></span>` +
          `<span class="sub">${tr("chk-note", "the table gives altitude and azimuth to the whole degree")}</span>`;
        const p = ECL_PLACES[0]; lat.value = p[1]; lon.value = p[2]; alt.value = p[3];
      }
      run();
    },
    stop() {},
  };
}
