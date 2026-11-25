// Vitrine des éruptions de l'onglet atmo (propriétaire, 2026-11-21 : « une animation vitrine pour les éruptions volcaniques
// déclenchant les barographes sur le globe, une mesure PURE de la courbure »). Six scènes et une fin, toutes tirées des
// enregistrements de la page, rien d'inventé : Hunga Tonga 2022 qui allume les 102 baromètres à leur heure enregistrée ; leurs
// traces côte à côte (la figure en V) ; le tour complet t₁ + t₂ = 2πR/v, un rayon par station, sans distance ni carte ; le
// modèle plat réglé au mieux sur les mêmes traces ; Krakatoa 1883, les barographes de Strachey qui s'allument à chaque passage ;
// les deux éruptions face à face. Mesure pure : seules entrent les heures et la vitesse de Lamb (310 m/s, fixée d'avance par
// la température de l'air). L'anneau qui s'étend dans la première scène est dessiné à 310 m/s sur la sphère de 6 371 km
// (illustration, dit sur l'image) ; les stations, elles, s'allument à leur heure mesurée. Cadre : core/reel.js.
import { makeReel, label, REEL_COL, ease, clamp } from "../../core/reel.js";
import { coastLines } from "../../core/globe25d.js";
import { TONGA_EVENT, TONGA_STATIONS } from "../../data/presets/seis-tonga.js";
import { KRAK_VENT, KRAK_STATIONS } from "../../data/presets/seis-krakatoa.js";
import { seisFlatKm } from "../seis/logic.js";
import { TONGA_V, tongaRadii, tongaFlatFits, tongaGlobeFixed, tongaDomeFits } from "./tongalogic.js";
import { krakRadii } from "./krakatoalogic.js";
import { lambPair } from "./lambsys.js";
import { lambPool, tsarLaps } from "./lambpool.js";
import { TSAR_SITE, TSAR_STATIONS } from "../../data/presets/atmo-tsar.js";

const TEAL = "#0f766e", AMBER = REEL_COL.flat, D2R = Math.PI / 180, R0 = 6371, H = 3600;

const EN = {
  "er-schem": "real records; globes to scale; first ring drawn at 310 m/s",
  "er-blast-k": "Hunga Tonga, 2022",
  "er-blast-a": "One explosion, and the whole atmosphere rang.",
  "er-blast-b": "A pressure pulse left the volcano at 04:14:45 UTC. {{n}} weather-station barometers in the United States wrote down when it passed.",
  "er-trace-k": "Twice",
  "er-trace-a": "Every barometer saw the pulse twice.",
  "er-trace-b": "The first pass comes later the farther the station. The second comes EARLIER the farther it is: it came the other way round.",
  "er-lap-k": "Once around",
  "er-lap-a": "Add the two times: the wave has gone once around the Earth.",
  "er-lap-b": "R = v (t₁ + t₂) / 2π needs no distance and no map, only clocks and the speed of the wave: {{tR}} km, from {{tn}} barometers.",
  "er-flat-k": "The flat map",
  "er-flat-a": "On a flat map there is no other way round.",
  "er-flat-b": "Given its own speed and start time, a flat map misses the first pass by {{fd}} min. An echo off the nearest rim, or off a dome, comes later the farther you are: the second pass came earlier.",
  "er-krak-k": "Krakatoa, 1883",
  "er-krak-a": "139 years earlier, the same ringing, on paper.",
  "er-krak-b": "{{kall}} barographs from Strachey's 1888 report recorded up to seven passes, three and a half times around. One lap, timed at the same station, gives {{kR}} km from {{kn}} of them.",
  "er-tsar-k": "Novaya Zemlya, 1961",
  "er-tsar-a": "The largest bomb ever exploded rang the air the same way.",
  "er-tsar-b": "Japanese microbarographs saw its wave three times: the short way, the long way, then the short way again after a full circuit. Third minus first is a lap: 35 hours at every station.",
  "er-pool-k": "Every lap",
  "er-pool-a": "Three explosions, three centuries of instruments, one size.",
  "er-pool-b": "{{pn}} laps, each timed at a single station: {{pR}} ± {{pS}} km, against 6,371 km. The sets differ by the wind along their routes, and that is the uncertainty.",
  "er-end-k": "",
  "er-end-a": "The wave came back the other way.",
  "er-end-b": "Only a closed surface has another way round. Clocks alone measured its size, in 1883, 1961 and 2022.",
  "er-utc": "h after the eruption", "er-gmt": "h GMT, 27 August 1883", "er-short": "short way (t₁)", "er-long": "long way (t₂)",
  "er-globe": "globe, nothing fitted", "er-flat": "flat map, speed and start free", "er-dome": "dome bounce, best height",
  "er-km": "km", "er-st": "stations", "er-pass": "passes recorded", "er-tgmt": "h GMT from 30 Oct 1961, 0 h", "er-lap1": "lap",
  "er-set-tonga": "Tonga 2022, t₁ + t₂", "er-set-tonga-lap": "Tonga 2022, A4 − A2", "er-set-krak": "Krakatoa 1883", "er-set-tsar": "Novaya Zemlya 1961", "er-all": "all together",
  "er-alt": "Animation: the Hunga Tonga pressure wave lighting 102 US barometers at their recorded times; their band-passed traces side by side, two bands of pulses crossing; the short way and the long way around the globe adding up to one lap, and the radius from each barometer; the best flat-map predictions against the same traces; the Krakatoa barographs of 1883 lighting at each of up to seven passes; the three wave trains of the 1961 explosion at eight Japanese microbarographs, with the lap between the first and the third; every lap of the three events on one ruler and the radius from all of them; a summary",
};

const nf = (lang, x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// ---- les nombres, calculés une fois ----
let N = null;
function numbers() {
  if (N) return N;
  const radii = tongaRadii(), lap = radii.lap, P = lambPair();
  const kr = krakRadii();
  N = { lap, kr, P, flat: tongaFlatFits(), fixed: tongaGlobeFixed(), dome: tongaDomeFits(),
    st: [...TONGA_STATIONS].sort((a, b) => a.theta - b.theta), kst: KRAK_STATIONS.filter((s) => s.lat != null) };
  return N;
}
export function reelValues(lang) {
  const { P, lap, kr, flat } = numbers();
  return { n: nf(lang, TONGA_STATIONS.length), tR: nf(lang, P.tonga.med), tS: nf(lang, P.tonga.sigma), tn: nf(lang, lap.keep.filter(Boolean).length),
    kR: nf(lang, P.krak.med), kS: nf(lang, P.krak.sigma), kn: nf(lang, kr.keep.filter(Boolean).length), kall: nf(lang, KRAK_STATIONS.length), fd: nf(lang, flat.direct.sd * 60),
    zT: `${nf(lang, Math.min(...tsarLaps().T), 2)}–${nf(lang, Math.max(...tsarLaps().T), 2)} h`,
    pn: nf(lang, lambPool().n), pR: nf(lang, lambPool().med), pS: nf(lang, lambPool().sigma) };
}

// ---- le globe orthographique (une vue de la vraie sphère : rien n'est étiré, règle 1) ----
const vec = (la, lo) => [Math.cos(la * D2R) * Math.cos(lo * D2R), Math.cos(la * D2R) * Math.sin(lo * D2R), Math.sin(la * D2R)];
function ortho(lat0, lon0, cx, cy, r) {
  const c = vec(lat0, lon0), e = [-Math.sin(lon0 * D2R), Math.cos(lon0 * D2R), 0], n = [c[1] * e[2] - c[2] * e[1], c[2] * e[0] - c[0] * e[2], c[0] * e[1] - c[1] * e[0]];
  return (la, lo) => { const p = vec(la, lo), z = p[0] * c[0] + p[1] * c[1] + p[2] * c[2];
    return [cx + r * (p[0] * e[0] + p[1] * e[1] + p[2] * e[2]), cy - r * (p[0] * n[0] + p[1] * n[1] + p[2] * n[2]), z > 0]; };
}
function direct(lat, lon, az, d) {
  const p1 = lat * D2R, t = az * D2R, s = d * D2R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(s) + Math.cos(p1) * Math.sin(s) * Math.cos(t));
  return [p2 / D2R, lon + Math.atan2(Math.sin(t) * Math.sin(s) * Math.cos(p1), Math.cos(s) - Math.sin(p1) * Math.sin(p2)) / D2R];
}
function globe(ctx, P, cx, cy, r) {
  ctx.fillStyle = "#eef6f4"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = "rgba(15,118,110,.35)"; ctx.lineWidth = 0.8;
  for (const line of coastLines()) { ctx.beginPath(); let pen = false;
    for (const pt of line) { if (!pt) { pen = false; continue; } const [x, y, v] = P(pt[0], pt[1]); if (!v) { pen = false; continue; } if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; }
    ctx.stroke(); }
  ctx.strokeStyle = "rgba(21,26,33,.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
}
function ring(ctx, P, lat, lon, d, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); let pen = false;
  for (let az = 0; az <= 360; az += 3) { const [a, o] = direct(lat, lon, az, d), [x, y, v] = P(a, o); if (!v) { pen = false; continue; } if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; }
  ctx.stroke();
}
function star(ctx, x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * D2R, rr = i % 2 ? r * 0.45 : r; ctx[i ? "lineTo" : "moveTo"](x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fill();
}
function stationDot(ctx, x, y, on, fs, col = TEAL) {
  ctx.beginPath(); ctx.arc(x, y, on ? fs * 0.13 : fs * 0.09, 0, 2 * Math.PI); ctx.fillStyle = on ? col : "#fff"; ctx.fill();
  ctx.strokeStyle = on ? col : "#8b93a0"; ctx.lineWidth = 0.7; ctx.stroke();
}

// ---- les scènes ----
function sceneBlast(ctx, b, u, d, T, fs) {
  const r = Math.min(b.w, b.h) * 0.44, cx = b.x + b.w / 2, cy = b.y + b.h / 2 - fs * 0.3;
  const [vl, vo] = TONGA_EVENT.vent, P = ortho(5 + 15 * (u / d), -165 + 15 * (u / d), cx, cy, r);
  globe(ctx, P, cx, cy, r);
  const h = 12.5 * ease((u - 0.4) / (d * 0.8)), deg = (TONGA_V * H * h) / R0 / D2R;   // l'anneau : 310 m/s sur 6 371 km (dessin)
  let on = 0;
  for (const s of TONGA_STATIONS) { const lit = h > 0 && s.a1 != null && h >= s.a1; if (lit) on++; const [x, y, v] = P(s.lat, s.lon); if (v) stationDot(ctx, x, y, lit, fs); }
  if (deg > 0.3) ring(ctx, P, vl, vo, deg, "rgba(15,118,110,.8)", Math.max(2, fs * 0.12));
  const [ex, ey, ev] = P(vl, vo); if (ev) star(ctx, ex, ey, fs * 0.45, REEL_COL.ink);
  label(ctx, `${nf(T.lang, h, 1)} ${T("er-utc")} · ${on} / ${TONGA_STATIONS.length}`, cx, cy + r + fs * 0.75, { size: fs * 0.55, col: REEL_COL.soft });
}

/** La figure en V : une trace par station à la hauteur de son angle θ, temps en abscisse ; jusqu'à l'heure hMax. */
function traces(ctx, b, fs, hMax, T) {
  const x0 = b.x + fs * 2, x1 = b.x + b.w - fs * 0.4, y0 = b.y + fs * 1.5, y1 = b.y + b.h - fs * 1.4, T1 = 40, th0 = 40, th1 = 120;
  const X = (h) => x0 + (h / T1) * (x1 - x0), Y = (th) => y0 + ((th - th0) / (th1 - th0)) * (y1 - y0), G = (y1 - y0) / 80 * 0.9;   // px par hPa
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
  for (const h of [0, 10, 20, 30, 40]) label(ctx, `${h}`, X(h), y1 + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  for (const th of [60, 90, 120]) label(ctx, `${th}°`, x0 - fs * 0.35, Y(th), { size: fs * 0.42, col: REEL_COL.soft, align: "right", weight: 500 });
  label(ctx, T("er-utc"), (x0 + x1) / 2, y1 + fs * 1.05, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  const { from, step } = TONGA_EVENT.trace;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, b.y, X(Math.min(T1, hMax)) - x0, b.h); ctx.clip();
  ctx.strokeStyle = "rgba(21,26,33,.6)"; ctx.lineWidth = Math.max(0.6, fs * 0.03);
  for (const s of TONGA_STATIONS) {
    const yb = Y(s.theta); ctx.beginPath(); let pen = false;
    s.trace.forEach((v, i) => { const h = from + i * step; if (h < 0 || h > T1 || v == null) { pen = false; return; }
      const y = yb - clamp((v / 100) * G * 6, -fs * 0.5, fs * 0.5); if (pen) ctx.lineTo(X(h), y); else ctx.moveTo(X(h), y); pen = true; });
    ctx.stroke();
  }
  ctx.restore();
  return { X, Y, x0, x1, y0, y1 };
}

function sceneTrace(ctx, b, u, d, T, fs) { traces(ctx, b, fs, 40 * ease((u - 0.3) / (d * 0.75)), T); }

function sceneLap(ctx, b, u, d, T, fs) {
  const { lap, P: PR } = numbers(), half = b.w / 2, r = Math.min(half, b.h) * 0.42, cx = b.x + half / 2, cy = b.y + b.h / 2;
  // la station gardée dont le rayon est le plus proche de la médiane : le chemin court et le chemin long, le même grand cercle
  const kept = lap.rows.filter((_, i) => lap.keep[i]), rep = kept.reduce((p, q) => (Math.abs(q.R - PR.tonga.med) < Math.abs(p.R - PR.tonga.med) ? q : p));
  const s = TONGA_STATIONS.find((x) => x.id === rep.id);
  const [vl, vo] = TONGA_EVENT.vent, mid = [(vl + s.lat) / 2, (vo + s.lon + (s.lon - vo > 180 ? -360 : 0)) / 2];
  const P = ortho(mid[0] * 0.3, mid[1] + 40, cx, cy, r);
  globe(ctx, P, cx, cy, r);
  const gc = (f, n = 90) => { const a = vec(vl, vo), c = vec(s.lat, s.lon), om = s.theta * D2R, k = (2 * Math.PI) / om;   // f > 1 : on continue au-delà
    const out = []; for (let i = 0; i <= n; i++) { const t = (i / n) * f * om, s1 = Math.sin(om - t) / Math.sin(om), s2 = Math.sin(t) / Math.sin(om);
      const p = [a[0] * s1 + c[0] * s2, a[1] * s1 + c[1] * s2, a[2] * s1 + c[2] * s2]; out.push([Math.asin(clamp(p[2], -1, 1)) / D2R, Math.atan2(p[1], p[0]) / D2R]); } return out; };
  // face visible en trait plein, face cachée en pâle (le chemin long passe derrière le globe)
  const draw = (pts, col, w) => { for (const front of [false, true]) { ctx.save(); ctx.globalAlpha = front ? 1 : 0.28; ctx.strokeStyle = col; ctx.lineWidth = front ? w : w * 0.7; ctx.beginPath(); let pen = false;
    for (const q of pts) { const [x, y, v] = P(q[0], q[1]); if (v !== front) { pen = false; continue; } if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; } ctx.stroke(); ctx.restore(); } };
  const k1 = ease((u - 0.3) / 1.2), k2 = ease((u - 1.5) / 1.8), lw = Math.max(2, fs * 0.12);
  if (k1 > 0) draw(gc(k1), TEAL, lw);
  if (k2 > 0) { const all = gc(2 * Math.PI / (s.theta * D2R), 360), n0 = Math.round((360 * s.theta) / 360), n1 = n0 + Math.round((360 - n0) * k2); draw(all.slice(n0, n1 + 1), "#7c3aed", lw); }
  const [ex, ey, ev] = P(vl, vo); if (ev) star(ctx, ex, ey, fs * 0.4, REEL_COL.ink);
  const [sx, sy, sv] = P(s.lat, s.lon); if (sv) stationDot(ctx, sx, sy, true, fs, REEL_COL.ink);
  label(ctx, `${nf(T.lang, s.a1, 1)} h`, cx - fs * 2.6, cy + r + fs * 0.7, { size: fs * 0.5, col: TEAL, weight: 800 });
  label(ctx, "+", cx - fs * 1.3, cy + r + fs * 0.7, { size: fs * 0.5, col: REEL_COL.ink, weight: 800 });
  label(ctx, `${nf(T.lang, s.a2, 1)} h`, cx, cy + r + fs * 0.7, { size: fs * 0.5, col: "#7c3aed", weight: 800 });
  label(ctx, `= ${nf(T.lang, s.a1 + s.a2, 1)} h`, cx + fs * 2.4, cy + r + fs * 0.7, { size: fs * 0.5, col: REEL_COL.ink, weight: 800 });
  label(ctx, `${T("er-short")} · ${T("er-long")}`, cx, cy + r + fs * 1.35, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  // un rayon par baromètre, sur une échelle de rayons
  const x0 = b.x + half + fs * 0.8, x1 = b.x + b.w - fs * 0.3, rLo = 6200, rHi = 6600, X = (R) => x0 + ((clamp(R, rLo, rHi) - rLo) / (rHi - rLo)) * (x1 - x0);
  const yA = b.y + b.h * 0.72;
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yA); ctx.lineTo(x1, yA); ctx.stroke();
  for (const R of [6200, 6400, 6600]) label(ctx, nf(T.lang, R), X(R), yA + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  ctx.setLineDash([fs * 0.2, fs * 0.15]); ctx.strokeStyle = REEL_COL.ink; ctx.beginPath(); ctx.moveTo(X(R0), yA); ctx.lineTo(X(R0), b.y + b.h * 0.15); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, "6 371", X(R0), b.y + b.h * 0.15 - fs * 0.4, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  const rows = lap.rows.filter((_, i) => lap.keep[i]).sort((p, q) => p.R - q.R), n = Math.round(rows.length * ease((u - 2.5) / (d * 0.45)));
  const bins = new Map(), rr = Math.max(1.8, fs * 0.1);
  for (let i = 0; i < n; i++) { const bx = Math.round(X(rows[i].R) / (rr * 2.2)); const k = bins.get(bx) || 0; bins.set(bx, k + 1);
    ctx.fillStyle = TEAL; ctx.beginPath(); ctx.arc(bx * rr * 2.2, yA - rr * 1.3 - k * rr * 2.2, rr, 0, 2 * Math.PI); ctx.fill(); }
  if (n === rows.length) { ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2, fs * 0.1); ctx.beginPath(); ctx.moveTo(X(PR.tonga.med), yA + 2); ctx.lineTo(X(PR.tonga.med), b.y + b.h * 0.25); ctx.stroke();
    label(ctx, `${nf(T.lang, PR.tonga.med)} ${T("er-km")}`, X(PR.tonga.med) + fs * 0.3, b.y + b.h * 0.3, { size: fs * 0.6, col: TEAL, align: "left", weight: 800 }); }
}

function sceneFlat(ctx, b, u, d, T, fs) {
  const { flat, dome, fixed } = numbers(), [vl, vo] = TONGA_EVENT.vent;
  const A = traces(ctx, b, fs, 40, T);
  const k1 = ease((u - 0.3) / 1), k2 = ease((u - d * 0.4) / 1.2);
  // le globe, rien d'ajusté : R = 6 371 km, v = 310 m/s, t₀ = 0
  const tg = (a) => (R0 * a) / TONGA_V / H;
  ctx.save(); ctx.globalAlpha = k1; ctx.strokeStyle = TEAL; ctx.lineWidth = Math.max(2, fs * 0.1); ctx.setLineDash([fs * 0.3, fs * 0.2]);
  for (const f of [(th) => tg(th * D2R), (th) => tg(2 * Math.PI - th * D2R)]) { ctx.beginPath(); for (let th = 44; th <= 117; th++) ctx[th === 44 ? "moveTo" : "lineTo"](A.X(f(th)), A.Y(th)); ctx.stroke(); }
  ctx.restore();
  // le plan, réglé au mieux : premier passage direct ; second passage par le dôme à sa meilleure hauteur
  if (k2 > 0) {
    ctx.globalAlpha = k2; const dm = dome.best, rr = Math.max(1.6, fs * 0.09);
    for (const s of TONGA_STATIONS) {
      const dk = seisFlatKm(vl, vo, s.lat, s.lon), h1 = flat.direct.t0 + dk / flat.direct.v / H, h2 = dm.t0 + Math.hypot(dk, 2 * dm.h) / dm.v / H;
      ctx.fillStyle = AMBER; if (h1 >= 0 && h1 <= 40) { ctx.beginPath(); ctx.arc(A.X(h1), A.Y(s.theta), rr, 0, 2 * Math.PI); ctx.fill(); }
      ctx.strokeStyle = AMBER; ctx.lineWidth = 1; if (h2 >= 0 && h2 <= 40) { ctx.beginPath(); ctx.arc(A.X(h2), A.Y(s.theta), rr * 1.2, 0, 2 * Math.PI); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  const m = (x) => `${nf(T.lang, x * 60)} min`;
  label(ctx, `${T("er-globe")}: ${m(fixed.sd)}`, A.x0 + fs * 0.3, b.y + fs * 0.05, { size: fs * 0.5, col: TEAL, align: "left", weight: 800 });
  if (k2 > 0) { ctx.globalAlpha = k2;
    label(ctx, `● ${T("er-flat")}: ${m(flat.direct.sd)}`, A.x0 + fs * 0.3, b.y + fs * 0.58, { size: fs * 0.45, col: AMBER, align: "left", weight: 700 });
    label(ctx, `○ ${T("er-dome")}: ${m(dome.best.sd)}`, A.x0 + fs * 0.3, b.y + fs * 1.08, { size: fs * 0.45, col: AMBER, align: "left", weight: 700 });
    ctx.globalAlpha = 1; }
}

function sceneKrak(ctx, b, u, d, T, fs) {
  const { kst } = numbers(), r = Math.min(b.w, b.h) * 0.44, cx = b.x + b.w / 2, cy = b.y + b.h / 2 - fs * 0.3;
  const P = ortho(10, 60 + 80 * (u / d), cx, cy, r);
  globe(ctx, P, cx, cy, r);
  const t = 2 + 76 * ease((u - 0.3) / (d * 0.85));   // heures GMT depuis le 27 août 0 h
  let nPass = 0;
  for (const s of kst) {
    const past = s.t.filter((x) => typeof x === "number" && x <= t); nPass += past.length;
    const last = past.length ? Math.max(...past) : null, flash = last != null && t - last < 2.5;
    const [x, y, v] = P(s.lat, s.lon); if (!v) continue;
    stationDot(ctx, x, y, past.length > 0, fs, flash ? AMBER : TEAL);
    if (flash) { ctx.strokeStyle = AMBER; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, fs * (0.2 + 0.25 * (t - last) / 2.5), 0, 2 * Math.PI); ctx.stroke(); }
  }
  const [ex, ey, ev] = P(KRAK_VENT[0], KRAK_VENT[1]); if (ev) star(ctx, ex, ey, fs * 0.45, REEL_COL.ink);
  label(ctx, `${nf(T.lang, t, 0)} ${T("er-gmt")} · ${nPass} ${T("er-pass")}`, cx, cy + r + fs * 0.75, { size: fs * 0.55, col: REEL_COL.soft });
}

/** Nouvelle-Zemble 1961 : le grand cercle vers le Japon sur le globe ; à droite, une ligne par station et ses trois trains
 *  aux heures publiées (Murayama 1962), le tour III − I en accolade. Rien n'est supposé de l'heure de l'explosion. */
function sceneTsar(ctx, b, u, d, T, fs) {
  const half = b.w * 0.42, r = Math.min(half, b.h) * 0.44, cx = b.x + half / 2, cy = b.y + b.h / 2;
  const P = ortho(52, 100, cx, cy, r);
  globe(ctx, P, cx, cy, r);
  const t = 12 + 39 * ease((u - 0.4) / (d * 0.75));   // heures GMT depuis le 30 octobre 0 h
  const st = TSAR_STATIONS.filter((s) => s.t[0] != null && s.lon > 100);
  for (const s of st) { const [x, y, v] = P(s.lat, s.lon); if (!v) continue; const n = s.t.filter((x) => x != null && x <= t).length, last = Math.max(...s.t.filter((x) => x != null && x <= t), -99);
    stationDot(ctx, x, y, n > 0, fs, t - last < 1.2 ? AMBER : TEAL); }
  const [ex, ey, ev] = P(TSAR_SITE[0], TSAR_SITE[1]); if (ev) star(ctx, ex, ey, fs * 0.45, REEL_COL.ink);
  // les trois trains, station par station
  const x0 = b.x + half + fs * 4.2, x1 = b.x + b.w - fs * 0.3, t0 = 12, t1 = 50, X = (h) => x0 + ((h - t0) / (t1 - t0)) * (x1 - x0);
  const rows = st.length, y0 = b.y + fs * 1.2, rh = Math.min(fs * 1.25, (b.h - fs * 2.6) / rows);
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + rows * rh); ctx.lineTo(x1, y0 + rows * rh); ctx.stroke();
  for (const h of [12, 24, 36, 48]) label(ctx, `${h}`, X(h), y0 + rows * rh + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  label(ctx, T("er-tgmt"), (x0 + x1) / 2, y0 + rows * rh + fs * 1.05, { size: fs * 0.4, col: REEL_COL.soft, weight: 500 });
  st.forEach((s, i) => {
    const y = y0 + i * rh + rh / 2;
    label(ctx, s.id, x0 - fs * 0.3, y, { size: fs * 0.42, col: REEL_COL.ink, align: "right", weight: 600 });
    s.t.forEach((h, k) => { if (h == null || h > t) return; const col = k === 1 ? "#7c3aed" : TEAL;
      ctx.fillStyle = col; ctx.globalAlpha = s.q[k] ? 0.45 : 1; ctx.fillRect(X(h) - fs * 0.07, y - rh * 0.32, fs * 0.14, rh * 0.64); ctx.globalAlpha = 1; });
    if (s.t[2] != null && s.t[2] <= t) { ctx.strokeStyle = REEL_COL.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(s.t[0]), y + rh * 0.38); ctx.lineTo(X(s.t[2]), y + rh * 0.38); ctx.stroke();
      label(ctx, `${nf(T.lang, s.t[2] - s.t[0], 2)} h`, (X(s.t[0]) + X(s.t[2])) / 2, y, { size: fs * 0.4, col: s.q[0] || s.q[2] ? REEL_COL.faint : REEL_COL.ink, weight: 700 }); }
  });
}

/** Tous les tours : une ligne par lot (ses rayons, sa médiane), puis le résultat commun. */
function scenePool(ctx, b, u, d, T, fs) {
  const P = lambPool(), x0 = b.x + fs * 0.6, x1 = b.x + b.w - fs * 0.6, lo = 5900, hi = 6900, X = (R) => x0 + ((clamp(R, lo, hi) - lo) / (hi - lo)) * (x1 - x0);
  const rows = P.sets.length + 1, top = b.y + fs * 1.4, rh = (b.h - fs * 2.8) / rows, yA = top + rows * rh;
  ctx.strokeStyle = REEL_COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yA); ctx.lineTo(x1, yA); ctx.stroke();
  for (let R = 6000; R <= 6800; R += 200) label(ctx, nf(T.lang, R), X(R), yA + fs * 0.5, { size: fs * 0.42, col: REEL_COL.soft, weight: 500 });
  ctx.setLineDash([fs * 0.25, fs * 0.18]); ctx.strokeStyle = REEL_COL.ink; ctx.beginPath(); ctx.moveTo(X(R0), top - fs * 0.4); ctx.lineTo(X(R0), yA); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, "6 371 km", X(R0), top - fs * 0.85, { size: fs * 0.48, col: REEL_COL.ink, weight: 700 });
  P.sets.forEach((s, i) => {
    const k = ease((u - 0.3 - i * 0.7) / 0.9); if (k <= 0) return;
    const y = top + i * rh + rh * 0.62, col = s.dirs === 2 ? TEAL : "#7c3aed";
    ctx.globalAlpha = k;
    label(ctx, `${T(`er-set-${s.key}`)} · ${s.n}`, x0, y - rh * 0.42, { size: fs * 0.45, col: REEL_COL.ink, align: "left", weight: 700 });
    const used = [];
    for (const R of [...s.R].sort((a, c) => a - c)) { const x = X(R); let lane = 0; while (used.some((q) => q.lane === lane && Math.abs(q.x - x) < fs * 0.2)) lane++; used.push({ x, lane });
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y + ((lane % 3) - 1) * fs * 0.17, Math.max(1.3, fs * 0.07), 0, 2 * Math.PI); ctx.fill(); }
    ctx.fillStyle = REEL_COL.ink; ctx.fillRect(X(s.med) - 1.5, y - rh * 0.25, 3, rh * 0.5);
    ctx.globalAlpha = 1;
  });
  const k = ease((u - 0.3 - P.sets.length * 0.7) / 1); if (k <= 0) return;
  const y = top + P.sets.length * rh + rh * 0.55;
  ctx.globalAlpha = k;
  ctx.fillStyle = "rgba(15,118,110,.18)"; ctx.fillRect(X(P.lo95), y - fs * 0.3, X(P.hi95) - X(P.lo95), fs * 0.6);
  ctx.fillStyle = "rgba(15,118,110,.35)"; ctx.fillRect(X(P.med - P.sigma), y - fs * 0.3, X(P.med + P.sigma) - X(P.med - P.sigma), fs * 0.6);
  ctx.fillStyle = TEAL; ctx.beginPath(); ctx.arc(X(P.med), y, fs * 0.22, 0, 2 * Math.PI); ctx.fill();
  label(ctx, `${T("er-all")} · ${nf(T.lang, P.n)} · ${nf(T.lang, P.med)} ± ${nf(T.lang, P.sigma)} km`, x0, y - rh * 0.45, { size: fs * 0.52, col: TEAL, align: "left", weight: 800 });
  ctx.globalAlpha = 1;
}

function sceneEnd(ctx, b, u, d, T, fs) {
  const r = Math.min(b.w, b.h) * 0.4, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const [vl, vo] = TONGA_EVENT.vent, P = ortho(-10, -175 + 40 * (u / d), cx, cy, r);
  globe(ctx, P, cx, cy, r);
  // l'onde qui fait le tour : sortie (court) puis retour par l'autre côté, en boucle sur la scène (dessin)
  const f = ((u / d) * 1.6) % 1, deg = f * 360, a = deg <= 180 ? deg : 360 - deg;
  ring(ctx, P, vl, vo, Math.max(0.5, a), deg <= 180 ? TEAL : "#7c3aed", Math.max(2, fs * 0.12));
  const [ex, ey, ev] = P(vl, vo); if (ev) star(ctx, ex, ey, fs * 0.45, REEL_COL.ink);
}

export const ERUPT_SCENES = [{ key: "blast", d: 7 }, { key: "trace", d: 6.5 }, { key: "lap", d: 8 }, { key: "flat", d: 7 }, { key: "krak", d: 7.5 }, { key: "tsar", d: 7.5 }, { key: "pool", d: 7.5 }, { key: "end", d: 4.5, num: false }];
export const ERUPT_DRAW = { blast: sceneBlast, trace: sceneTrace, lap: sceneLap, flat: sceneFlat, krak: sceneKrak, tsar: sceneTsar, pool: scenePool, end: sceneEnd };
const REEL = makeReel({ scenes: ERUPT_SCENES, draw: ERUPT_DRAW, prefix: "er", still: 7 + 6.5 + 7.5 });   // à l'arrêt : le tour, les rayons tombés
export const ERUPT_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet, repli anglais ici ; {{clé}} = reelValues. */
export function mountEruptReel(canvas, tr, lang) {
  const vals = reelValues(lang);
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("er-alt"));
  return REEL.mountReel(canvas, T);
}
