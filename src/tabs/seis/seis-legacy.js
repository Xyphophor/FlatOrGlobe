// Moteur de l'onglet seis, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html : bloc "Tab: seis"), y compris ses figures
// canvas animées et ses tables. Il cherche ses hôtes par id dans le
// document (flux verbatim src/data/prose/seis.js) ; n'expose que
// wire()/draw()/stop(). Les fonctions pures sont dupliquées, testées,
// dans src/tabs/seis/logic.js.
import { setupCanvas } from "../../core/canvas.js";
import { makeT } from "../../core/i18n.js";
import { FIG } from "../../core/fig.js";
import { SEIS_RADIUS_EVENTS, SEIS_ARRIVALS } from "../../data/presets/seis-radius.js";
import { drawSeisGlobe, wireSeisGlobe } from "./seis-globe.js";
import { reducedMotion } from "../../core/motion.js";
import { makeAE } from "../../core/aeproj.js";
import { drawAEMap } from "../../core/aemap.js";
import { seisAE as seisAEcore } from "./logic.js";
const SEIS_MAP = makeAE({ rot: 180 });   // = seisAE à l'écran (cx + x·S, cy + y·S)
const $ = (id) => document.getElementById(id);
const DEG = (r) => r * 180 / Math.PI;

// ---- Tab: seismology (key "seis") ---------------------------------------
// WHAT THIS TAB IS FOR. Every optical tab on this page can be argued with by
// arguing about the air. This one has no sightline at all: it measures surface
// DISTANCE between pairs of points, which is the exact quantity Gauss's theorem
// says a plane cannot reproduce from a sphere. There is nothing here for the
// refraction argument to attach itself to.
//
// THE ONE THING NOT TO DO. The arrival times drawn here are COMPUTED from the
// spherical model; this page ships no seismograms. The first callout says so in
// as many words. Never relabel a computed arrival as "observed" -- the tab's whole
// standing rests on the reader being told exactly which numbers are geometry (all
// of them here) and which would have to be downloaded (all of the traces).
const SEIS_R = 6371.0;                        // km
const SEIS_V = 3.8;                           // km/s, Rayleigh group velocity, 100-200 s
const SEIS_KM_PER_DEG = Math.PI * SEIS_R / 180;   // 111.19 km per degree of arc
// Group velocity for the Ms_20 band (18-22 s), DISTINCT from SEIS_V above (100-200 s):
// a shorter-period Rayleigh wave samples the crust rather than the mantle and runs
// slower. A round mid-range value for that band (sources n13/n15 below) -- NOT fitted
// to make the reconstruction below land closer to 6371 km, see seisRadiusOf.
const SEIS_V20 = 3.5;
const SRAD = d => d * Math.PI / 180;

// great-circle angle between two points, in degrees
function seisDelta(la1, lo1, la2, lo2){
  const p1 = SRAD(la1), p2 = SRAD(la2), dl = SRAD(lo2 - lo1);
  const c = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  return DEG(Math.acos(Math.max(-1, Math.min(1, c))));
}
// The flat-earth map: north-polar azimuthal equidistant. Radius from the centre is
// colatitude in degrees, so distance from the north pole is exact and everything
// else is not -- which is the entire content of the comparison this tab draws.
// East runs anticlockwise on screen, as on the printed maps; handedness cannot
// affect a distance, so the argument is unchanged either way.
// epic18 : la copie privée de seisAE délègue à logic.js (lui-même au moteur commun core/aeproj.js)
function seisAE(lat, lon){ return seisAEcore(lat, lon); }
function seisFlatKm(la1, lo1, la2, lo2){
  const A = seisAE(la1, lo1), B = seisAE(la2, lo2);
  return Math.hypot(A.x - B.x, A.y - B.y) * SEIS_KM_PER_DEG;
}
// direct spherical problem: where you land going distance d (deg) on azimuth az (deg)
function seisDirect(la1, lo1, az, d){
  const p1 = SRAD(la1), a = SRAD(az), dd = SRAD(d);
  const sp = Math.sin(p1) * Math.cos(dd) + Math.cos(p1) * Math.sin(dd) * Math.cos(a);
  const p2 = Math.asin(Math.max(-1, Math.min(1, sp)));
  const lo2 = lo1 + DEG(Math.atan2(Math.sin(a) * Math.sin(dd) * Math.cos(p1),
                                   Math.cos(dd) - Math.sin(p1) * sp));
  return { lat: DEG(p2), lon: ((lo2 + 540) % 360) - 180 };
}
const seisHMS = s => {
  const m = Math.round(s / 60);
  return m >= 60 ? Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0") + " m" : m + " min";
};

// The one worked case table 1 and the opening travel-time figure show --
// no switcher any more (removed 2026-09-19: redundant now that the
// animation and the box plots already let the reader pick among nine
// real earthquakes; this demo table only ever needed one fixed example).
const SEIS_DEMO_EV = { name: "Sumatra–Andaman, 26 Dec 2004, M9.1", lat: 3.316, lon: 95.854 };
// Global Seismographic Network stations, nominal coordinates. Rounded to 0.01 deg;
// a hundredth of a degree is about a kilometre and the disagreements below run to
// thousands, so the rounding is irrelevant to every claim made from this table.
const SEIS_STATIONS = [
  { c: "KONO", n: "Kongsberg, Norway",            lat:  59.65, lon:    9.60 },
  { c: "HRV",  n: "Harvard, Massachusetts",       lat:  42.51, lon:  -71.56 },
  { c: "ANMO", n: "Albuquerque, New Mexico",      lat:  34.95, lon: -106.46 },
  { c: "CTAO", n: "Charters Towers, Australia",   lat: -20.09, lon:  146.25 },
  { c: "SUR",  n: "Sutherland, South Africa",     lat: -32.38, lon:   20.81 },
  { c: "PMSA", n: "Palmer Station, Antarctica",   lat: -64.77, lon:  -64.05 },
  { c: "SBA",  n: "Scott Base, Antarctica",       lat: -77.85, lon:  166.76 },
];

function seisRows(ev){
  return SEIS_STATIONS.map(s => {
    const dg = seisDelta(ev.lat, ev.lon, s.lat, s.lon);
    const kmG = dg * SEIS_KM_PER_DEG;
    const kmF = seisFlatKm(ev.lat, ev.lon, s.lat, s.lon);
    return { s, dg, kmG, kmF, tG: kmG / SEIS_V, tF: kmF / SEIS_V, err: kmF / kmG - 1 };
  }).sort((a, b) => a.dg - b.dg);
}

// ---- table 1: the two geometries, station by station ----
function seisStationTable(){
  const tb = $("seisStationRows"); if(!tb) return;
  const rows = seisRows(SEIS_DEMO_EV);
  tb.innerHTML = rows.map(r => {
    const bad = Math.abs(r.err) > 0.25, mid = !bad && Math.abs(r.err) > 0.08;
    const cls = bad ? "cold" : (mid ? "" : "hot");
    const dt = r.tF - r.tG;
    return `<tr><td><b>${r.s.c}</b> <span style="color:var(--ink-soft)">· ${r.s.n}</span></td>` +
      `<td>${r.dg.toFixed(1)}°</td>` +
      `<td>${Math.round(r.kmG).toLocaleString("en-US")} km</td>` +
      `<td>${seisHMS(r.tG)}</td>` +
      `<td>${Math.round(r.kmF).toLocaleString("en-US")} km</td>` +
      `<td>${seisHMS(r.tF)}</td>` +
      `<td class="${cls}"><b>${r.err >= 0 ? "+" : "−"}${Math.abs(r.err * 100).toFixed(0)}%</b>` +
      ` <span style="color:var(--ink-soft)">${dt >= 0 ? "+" : "−"}${seisHMS(Math.abs(dt))}</span></td></tr>`;
  }).join("");
}

// ---- table 2: the interior, radii from PREM ----
const SEIS_LAYERS = [
  { b: "Mohorovičić discontinuity (crust → mantle)", d: 24.4,   w: "A near P arrival that overtakes the direct one — Mohorovičić, 1909" },
  { b: "Transition zone top (410 km)",               d: 410,    w: "Reflected and converted phases at regional distance" },
  { b: "Transition zone base (660 km)",              d: 660,    w: "The same, and the depth limit of ordinary earthquakes" },
  { b: "Core–mantle boundary (Gutenberg)",           d: 2891,   w: "No S beyond 103°, no direct P from 103° to 143° — Oldham 1906, Gutenberg 1913" },
  { b: "Inner core boundary (Lehmann)",              d: 5149.5, w: "Faint P arrivals inside the shadow zone — Lehmann, 1936" },
  { b: "Centre",                                     d: 6371,   w: "Where the antipodal PKIKP paths all cross" },
];
function seisLayerTable(){
  const tb = $("seisLayerRows"); if(!tb) return;
  tb.innerHTML = SEIS_LAYERS.map(L => {
    const rad = SEIS_R - L.d;
    const cls = /Gutenberg|Lehmann/.test(L.b) ? "cold" : "";
    return `<tr><td class="${cls}">${L.b}</td>` +
      `<td>${L.d.toLocaleString("en-US")} km</td>` +
      `<td>${rad.toLocaleString("en-US")} km</td>` +
      `<td>${(rad / SEIS_R).toFixed(3)}</td><td>${L.w}</td></tr>`;
  }).join("");
}

// ---- table 3 / figure: the reverse-engineered radius, from REAL arrival data ----
// 442 real (event, station) Rayleigh-wave arrivals, 7 real earthquakes 2004-2021,
// harvested from the ISC On-line Bulletin (data/seis/README.md). Unlike every other
// number on this tab, these arrival times are NOT computed from the spherical model --
// they are what instruments actually wrote down. distance_deg is still computed from
// the published coordinates with seisDelta(), never read off ISC's own distance
// column, so R = v·t/Δ cannot inherit whatever radius ISC's software assumed.
function ctStats(a){
  const v = a.slice().sort((x, y) => x - y), n = v.length;
  const q = p => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
                   return v[lo] + (v[hi] - v[lo]) * (i - lo); };
  const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
  const lo = v.find(x => x >= q1 - 1.5 * iqr), hi = v.filter(x => x <= q3 + 1.5 * iqr).pop();
  return { n:n, q1:q1, q3:q3, med:q(0.5), lo:lo, hi:hi,
           out:v.filter(x => x < lo || x > hi),
           mean:v.reduce((s, x) => s + x, 0) / n };
}
function seisRadiusOf(distanceDeg, travelTimeS, v = SEIS_V20){
  return v * travelTimeS / SRAD(distanceDeg);
}
function seisRadiusGroups(v = SEIS_V20){
  const groups = SEIS_RADIUS_EVENTS.map(ev => {
    const radii = SEIS_ARRIVALS[ev.key].map(([, , , d, t]) => seisRadiusOf(d, t, v));
    return [ev.name, radii, "globe"];
  });
  groups.push(["all", groups.flatMap(g => g[1]), "globe"]);
  return groups;
}
// Correction proposée par le propriétaire (2026-09-19) : une onde de Rayleigh à
// 18-22 s va réellement plus vite sous l'océan (croûte fine, manteau atteint
// vite) que sous un continent. v_ocean/v_continent viennent de la MÊME famille
// de données ISC que ces 442 arrivées (Hearn 2024, source n16) -- pas ajustées
// sur ce jeu de 442 lignes. ocean_frac (troisième valeur de chaque triplet) est
// la fraction du trajet réel, pas des extrémités, classée contre les polygones
// terrestres Natural Earth 1:50m (source n17) -- PAS coasts.js (décoratif, voir
// son propre commentaire d'en-tête).
const SEIS_V_OCEAN = 3.6, SEIS_V_CONTINENT = 2.97;
function seisPathV(oceanFrac){
  return oceanFrac * SEIS_V_OCEAN + (1 - oceanFrac) * SEIS_V_CONTINENT;
}
function seisRadiusCorrectedGroups(){
  const groups = SEIS_RADIUS_EVENTS.map(ev => {
    const radii = SEIS_ARRIVALS[ev.key].map(([, , , d, t, of]) => seisRadiusOf(d, t, seisPathV(of)));
    return [ev.name, radii, "globe"];
  });
  groups.push(["all", groups.flatMap(g => g[1]), "globe"]);
  return groups;
}
// Hauteur/positions calculées depuis S.length (pas de constante figée par
// nombre de lignes) : le nombre de séismes documentés change au fil des
// campagnes de `fog build seis-radius` (ex-scripts/build_seis_radius.py), sans toucher à cette fonction.
function seisRadiusFigGeneric(S, hostId, altSuffix, stampSuffix){
  const host = $(hostId); if(!host) return;
  const C = FIG.C;
  const rowH = 34, topY = 40, n = S.length;
  const lastY = topY + (n - 1) * rowH;
  const gridBottom = lastY + 22, lineBottom = lastY + 26;
  const tickY = gridBottom + 18, trueLabelY = tickY + 18, H = trueLabelY + 40;
  const f = FIG.make({ w:380, h:H,
    alt:`Earth radius reconstructed from real Rayleigh-wave arrivals, ${n - 1} earthquakes, plus all combined` + altSuffix });
  const ST = S.map(q => ctStats(q[1]));
  const VMAX = 10000, X0 = 108, X1 = 340;
  const bx = v => Math.max(X0 - 6, Math.min(X1 + 10, X0 + v / VMAX * (X1 - X0)));
  [0, 2500, 5000, 7500, 10000].forEach(v => {
    f.dash(bx(v), 22, bx(v), gridBottom, { c:"#e7e3da", dash:"3 3" });
    f.note(bx(v), tickY, (v / 1000).toFixed(1), { anchor:"middle" });
  });
  f.line(bx(6371), 18, bx(6371), lineBottom, { c:C.globe, w:1.6 });
  f.note(bx(6371) + 5, trueLabelY, "6371 km", { c:C.globe });
  S.forEach((q, i) => {
    const y = topY + i * rowH, last = i === S.length - 1;
    const col = last ? C.ink : C.globe, s = ST[i];
    const lbl = last ? t("sq-radius-all").replace("{k}", S.length - 1) : q[0];
    f.note(X0 - 10, y + 4, lbl, { anchor:"end", c: col });
    f.line(bx(s.lo), y, bx(s.hi), y, { c:col, w:1.2 });
    f.line(bx(s.lo), y-6, bx(s.lo), y+6, { c:col, w:1.2 });
    f.line(bx(s.hi), y-6, bx(s.hi), y+6, { c:col, w:1.2 });
    f.path(`M${bx(s.q1)} ${y-9} H${bx(s.q3)} V${y+9} H${bx(s.q1)} Z`, { c:col, w:last ? 2 : 1.4, fill:"none" });
    f.line(bx(s.med), y-9, bx(s.med), y+9, { c:col, w:2.6 });
    s.out.forEach(o => f.dot(bx(o), y, { r:2.2, c:col }));
  });
  f.note(4, trueLabelY, t("sq-radius-axis"));
  f.notToScale(ST[ST.length - 1].n + stampSuffix);
  f.mountIn(host);
}
// "n earthquakes, YYYY-YYYY" lu depuis SEIS_RADIUS_EVENTS (l'année finit
// toujours son "name", ex. "Kuril 2006") plutôt que codé en dur : le
// nombre de séismes documentés change avec data/seis/events.json.
function seisEventCountStamp(){
  const years = SEIS_RADIUS_EVENTS.map(ev => parseInt(ev.name.match(/\d{4}$/)[0], 10));
  return ` real arrivals, ${SEIS_RADIUS_EVENTS.length} earthquakes ${Math.min(...years)}–${Math.max(...years)}`;
}
function seisRadiusFig(){ seisRadiusFigGeneric(seisRadiusGroups(), "seisRadiusFig", "", seisEventCountStamp()); }
function seisRadiusFig2(){ seisRadiusFigGeneric(seisRadiusCorrectedGroups(), "seisRadiusFig2", ", ocean/continent path correction applied", " real arrivals, ocean/continent path correction applied"); }
function seisRadiusTableGeneric(S, tbodyId){
  const tb = $(tbodyId); if(!tb) return;
  tb.innerHTML = S.map((q, i) => {
    const s = ctStats(q[1]), last = i === S.length - 1;
    const lbl = last ? `<b>${t("sq-radius-all").replace("{k}", S.length - 1)}</b>` : q[0];
    const pc = (s.med - 6371) / 6371 * 100;
    return `<tr${last ? ' style="border-top:2px solid var(--ink-soft)"' : ""}><td>${lbl}</td><td>${s.n}</td>` +
      `<td><b>${Math.round(s.med).toLocaleString("en-US")} km</b></td>` +
      `<td>${Math.round(s.q1).toLocaleString("en-US")}–${Math.round(s.q3).toLocaleString("en-US")} km</td>` +
      `<td>${pc >= 0 ? "+" : "−"}${Math.abs(pc).toFixed(1)}%</td></tr>`;
  }).join("");
}
function seisRadiusTable(){ seisRadiusTableGeneric(seisRadiusGroups(), "seisRadiusRows"); }
function seisRadiusTable2(){ seisRadiusTableGeneric(seisRadiusCorrectedGroups(), "seisRadiusRows2"); }
function seisRadiusReadGeneric(S, elId){
  const el = $(elId); if(!el) return;
  const s = ctStats(S[S.length - 1][1]);
  const pc = (s.med - 6371) / 6371 * 100;
  el.innerHTML =
    `<span>${t("sq-radius-read-n").replace("{n}", s.n).replace("{k}", SEIS_RADIUS_EVENTS.length)}</span>` +
    `<span class="g">${t("sq-radius-read-med").replace("{v}", Math.round(s.med).toLocaleString("en-US")).replace("{pc}", (pc >= 0 ? "+" : "−") + Math.abs(pc).toFixed(1))}</span>` +
    `<span>${t("sq-radius-read-true")}</span>`;
}
function seisRadiusRead(){ seisRadiusReadGeneric(seisRadiusGroups(), "seisRadiusRead"); }
function seisRadiusRead2(){ seisRadiusReadGeneric(seisRadiusCorrectedGroups(), "seisRadiusRead2"); }

// ---- regression: real (distance, arrival time) cloud for ONE real earthquake,
// picked from a selector, against the theoretical globe and flat-map lines.
// The globe/flat lines use SEIS_V20 (the box plot's v) -- a geometry question,
// not a calibration exercise, so it deliberately does not use the ocean/
// continent-corrected v. No combined/all-events option: mixing nine different
// epicentres into one scatter would mix nine different flat-map distortions
// into one meaningless cloud, so the selector always shows exactly one.
let seisRegEv = SEIS_RADIUS_EVENTS[0].key;
function seisRegressionFit(rows){
  let sxy = 0, sxx = 0;
  for(const [, , , d, t] of rows){ const km = d * SEIS_KM_PER_DEG; sxy += km * t; sxx += km * km; }
  const slope = sxy / sxx;
  return { slope, vFit: 1 / slope };
}
function seisMedianFlatRatio(ev, rows){
  const ratios = rows.map(([, staLat, staLon, d]) => seisFlatKm(ev.lat, ev.lon, staLat, staLon) / (d * SEIS_KM_PER_DEG)).sort((a, b) => a - b);
  const n = ratios.length, mid = (n - 1) / 2;
  return (ratios[Math.floor(mid)] + ratios[Math.ceil(mid)]) / 2;
}
// Chaque arrivée réelle porte DEUX positions en distance pour la MÊME heure
// réellement enregistrée -- kmG (sa vraie distance grand-cercle) et kmF (ce
// que la carte plate prétend pour les deux mêmes coordonnées). "Plat" n'a
// pas sa propre droite de vitesse : c'est justement le point. La seule
// droite de vitesse tracée (t = km/v) est un fait sur v seul, pas sur quel
// modèle a raison -- les points globe devraient s'y aligner, les points
// plats s'en écartent horizontalement, pas par une pente différente.
function seisRegressionData(ev, rows, v = SEIS_V20){
  const points = rows.map(([, staLat, staLon, d, t]) => ({
    kmG: d * SEIS_KM_PER_DEG,
    kmF: seisFlatKm(ev.lat, ev.lon, staLat, staLon),
    t,
  }));
  const { slope, vFit } = seisRegressionFit(rows);
  const medianRatio = seisMedianFlatRatio(ev, rows);
  return { points, slopeFit: slope, vFit, slopeGlobe: 1 / v, medianRatio };
}
function seisSetRegEvent(k){ seisRegEv = k; seisRegFig(); seisRegRead(); }
function seisRegFig(){
  const host = $("seisRegFig"); if(!host) return;
  const C = FIG.C;
  const ev = SEIS_RADIUS_EVENTS.find(e => e.key === seisRegEv), rows = SEIS_ARRIVALS[seisRegEv];
  const rd = seisRegressionData(ev, rows);
  const maxKm = Math.max(...rd.points.flatMap(p => [p.kmG, p.kmF])) * 1.08;
  const maxMin = Math.max(
    ...rd.points.map(p => p.t / 60),
    maxKm * rd.slopeFit / 60, maxKm * rd.slopeGlobe / 60
  ) * 1.06;
  const W = 380, H = 260, padL = 50, padR = 14, padT = 16, padB = 32;
  const Wd = W - padL - padR, Hd = H - padT - padB;
  const X = km => padL + km / maxKm * Wd;
  const Y = min => padT + Hd - min / maxMin * Hd;
  const f = FIG.make({ w:W, h:H,
    alt:`Real arrivals for ${ev.name}, each plotted at both its globe and flat-map distance for the same real time, with a fitted regression line and the theoretical speed line` });
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const km = maxKm * frac;
    f.dash(X(km), padT, X(km), padT + Hd, { c:"#e7e3da", dash:"3 3" });
    f.note(X(km), padT + Hd + 14, (km / 1000).toFixed(1), { anchor:"middle" });
  });
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const mn = maxMin * frac;
    f.dash(padL, Y(mn), padL + Wd, Y(mn), { c:"#e7e3da", dash:"3 3" });
    f.note(padL - 6, Y(mn) + 3, Math.round(mn), { anchor:"end" });
  });
  // same real arrival, two distance claims -- the horizontal gap IS the argument
  rd.points.forEach(p => f.line(X(p.kmG), Y(p.t / 60), X(p.kmF), Y(p.t / 60), { c:"rgba(21,26,33,.18)", w:1 }));
  // the one speed line: t = km/v, a fact about v alone, not about which model is right
  f.line(X(0), Y(0), X(maxKm), Y(maxKm * rd.slopeGlobe / 60), { c:C.globe, w:1.8, dash:"6 4" });
  // least-squares fit through the globe-position cloud alone -- no v assumed
  f.line(X(0), Y(0), X(maxKm), Y(maxKm * rd.slopeFit / 60), { c:C.ink, w:2.4 });
  rd.points.forEach(p => f.dot(X(p.kmG), Y(p.t / 60), { r:2.6, c:C.ink }));
  rd.points.forEach(p => f.dot(X(p.kmF), Y(p.t / 60), { r:2.6, c:C.flat }));
  f.note(padL + Wd / 2, H - 4, t("sq-reg-x-axis"));
  f.note(4, padT + 8, t("sq-reg-y-axis"));
  f.notToScale(`${ev.name}, v_fit ${rd.vFit.toFixed(2)} km/s`);
  f.mountIn(host);
}
function seisRegRead(){
  const el = $("seisRegRead"); if(!el) return;
  const ev = SEIS_RADIUS_EVENTS.find(e => e.key === seisRegEv), rows = SEIS_ARRIVALS[seisRegEv];
  const rd = seisRegressionData(ev, rows);
  const pc = (rd.medianRatio - 1) * 100;
  el.innerHTML =
    `<span><span class="sub">${ev.name}</span></span>` +
    `<span class="g">${t("sq-reg-read-fit").replace("{v}", rd.vFit.toFixed(2)).replace("{n}", rows.length)}</span>` +
    `<span>${t("sq-reg-read-globe").replace("{v}", (1 / rd.slopeGlobe).toFixed(2))}</span>` +
    `<span class="f">${t("sq-reg-read-ratio").replace("{pc}", pc.toFixed(0))}</span>`;
}

// ---- the projection's fingerprint: average lateness by station colatitude ----
// "Lateness" = predicted arrival time minus the REAL recorded time, for BOTH
// models, each compared to the same real clock (never to each other -- the
// owner's "to be fair" point). Colatitude (0 = N pole, 180 = S pole) is the
// AE map's own radial coordinate (seisAE(): r = 90-lat), not station latitude
// as such. Pooled across all nine real earthquakes: this is a property of
// the projection, not of which quake.
function seisLatenessBins(v = SEIS_V20, binWidth = 15){
  const bins = new Map();
  for(const ev of SEIS_RADIUS_EVENTS){
    for(const [, staLat, staLon, d, t] of SEIS_ARRIVALS[ev.key]){
      const kmG = d * SEIS_KM_PER_DEG, kmF = seisFlatKm(ev.lat, ev.lon, staLat, staLon);
      const colat = 90 - staLat, band = Math.floor(colat / binWidth) * binWidth;
      if(!bins.has(band)) bins.set(band, { g:[], f:[] });
      const b = bins.get(band);
      b.g.push(kmG / v - t); b.f.push(kmF / v - t);
    }
  }
  const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
  return [...bins.keys()].sort((a, b) => a - b).map(lo => {
    const { g, f } = bins.get(lo);
    return { lo, hi: lo + binWidth, n:g.length, globeMin:avg(g) / 60, flatMin:avg(f) / 60 };
  });
}
function seisLatenessFig(){
  const host = $("seisLatenessFig"); if(!host) return;
  const C = FIG.C, bins = seisLatenessBins();
  const allVals = bins.flatMap(b => [b.globeMin, b.flatMin]);
  const minY = Math.min(0, ...allVals) * 1.1, maxY = Math.max(0, ...allVals) * 1.06;
  const W = 380, H = 240, padL = 46, padR = 14, padT = 16, padB = 30;
  const Wd = W - padL - padR, Hd = H - padT - padB;
  const X = colat => padL + colat / 180 * Wd;
  const Y = min => padT + Hd - (min - minY) / (maxY - minY) * Hd;
  const f = FIG.make({ w:W, h:H,
    alt:"Average arrival-time lateness against the real recorded time, globe versus flat map, by station colatitude from the north pole, pooled across all real arrivals" });
  [0, 30, 60, 90, 120, 150, 180].forEach(c => {
    f.dash(X(c), padT, X(c), padT + Hd, { c:"#e7e3da", dash:"3 3" });
    f.note(X(c), padT + Hd + 14, c, { anchor:"middle" });
  });
  f.line(padL, Y(0), padL + Wd, Y(0), { c:C.ink, w:1, dash:"2 2" });
  const series = (key, col) => {
    let prev = null;
    bins.forEach(b => {
      const x = X((b.lo + b.hi) / 2), y = Y(b[key]);
      if(prev) f.line(prev[0], prev[1], x, y, { c:col, w:2 });
      f.dot(x, y, { r:3, c:col });
      prev = [x, y];
    });
  };
  series("globeMin", C.globe);
  series("flatMin", C.flat);
  f.note(padL + Wd / 2, H - 4, t("sq-lat-x-axis"));
  f.note(4, padT + 8, t("sq-lat-y-axis"));
  f.notToScale(`${bins.reduce((s, b) => s + b.n, 0)} real arrivals, ${bins.length} colatitude bands`);
  f.mountIn(host);
}
function seisLatenessRead(){
  const el = $("seisLatenessRead"); if(!el) return;
  const bins = seisLatenessBins();
  const first = bins[0], last = bins[bins.length - 1];
  const maxGlobeAbs = Math.max(...bins.map(b => Math.abs(b.globeMin)));
  el.innerHTML =
    `<span>${t("sq-lat-read-n").replace("{n}", bins.reduce((s, b) => s + b.n, 0))}</span>` +
    `<span class="g">${t("sq-lat-read-globe").replace("{v}", maxGlobeAbs.toFixed(1))}</span>` +
    `<span class="f">${t("sq-lat-read-flat").replace("{v}", last.flatMin.toFixed(0)).replace("{lo}", last.lo).replace("{hi}", last.hi)}</span>`;
}

// ---- figure: travel time against distance, both metrics ----
function drawSeisTT(){
  const cv = $("seisTTCanvas"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  const narrow = W < 560;
  const padL = 54, padR = narrow ? 14 : 120, padT = 16, padB = 36;
  const Wd = W - padL - padR, Hd = H - padT - padB;
  const rows = seisRows(SEIS_DEMO_EV);
  const maxKm = 28000, maxT = maxKm / SEIS_V;
  const X = km => padL + km / maxKm * Wd;
  const Y = t => padT + Hd - t / maxT * Hd;
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = "rgba(21,26,33,.10)"; ctx.lineWidth = 1;
  for(let km = 0; km <= maxKm; km += 5000){
    ctx.beginPath(); ctx.moveTo(X(km), padT); ctx.lineTo(X(km), padT + Hd); ctx.stroke();
    ctx.fillStyle = "#8b93a0"; ctx.textAlign = "center";
    ctx.fillText((km / 1000) + "k", X(km), H - 20);
  }
  for(let t = 0; t <= maxT; t += 3600){
    ctx.beginPath(); ctx.moveTo(padL, Y(t)); ctx.lineTo(padL + Wd, Y(t)); ctx.stroke();
    ctx.fillStyle = "#8b93a0"; ctx.textAlign = "right";
    ctx.fillText((t / 3600) + " h", padL - 6, Y(t) + 4);
  }
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText(t("sq-cv-distance-model"), padL + Wd / 2, H - 5);
  // the line the globe puts every point on
  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(maxKm), Y(maxT)); ctx.stroke();
  rows.forEach(r => {
    // same arrival time, plotted at each model's distance
    ctx.strokeStyle = "rgba(21,26,33,.22)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(r.kmG), Y(r.tG)); ctx.lineTo(X(r.kmF), Y(r.tG)); ctx.stroke();
    ctx.fillStyle = "#b45309";
    ctx.beginPath(); ctx.arc(X(r.kmF), Y(r.tG), 4.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#0f766e";
    ctx.beginPath(); ctx.arc(X(r.kmG), Y(r.tG), 4.5, 0, 7); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.3; ctx.stroke();
    if(!narrow){
      ctx.fillStyle = "#5b6470"; ctx.textAlign = "left";
      ctx.fillText(r.s.c, X(r.kmG) + 8, Y(r.tG) - 6);
    }
  });
  if(!narrow){
    [["#0f766e", "great-circle distance"], ["#b45309", "flat-map distance"]].forEach((k, i) => {
      ctx.fillStyle = k[0];
      ctx.beginPath(); ctx.arc(padL + Wd + 14, padT + 14 + i * 18, 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#5b6470"; ctx.textAlign = "left";
      ctx.fillText(k[1], padL + Wd + 24, padT + 18 + i * 18);
    });
  }
  ctx.save(); ctx.translate(12, padT + Hd / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText(t("sq-cv-arrival-time"), 0, 0); ctx.restore();
}

// ---- figure: cross-section, shadow zone geometry ----
// Ray paths are SCHEMATIC -- a real one comes from integrating the ray parameter
// through PREM. What is exact here are the layer radii and the two shadow edges at
// 103 and 143 degrees, which is all the figure is claiming.
function drawSeisCore(){
  const cv = $("seisCoreCanvas"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 + 6, R = Math.min(W * 0.42, H * 0.42);
  const rCMB = R * 3480 / SEIS_R, rICB = R * 1221 / SEIS_R;
  const P = (ang, rad) => [cx + rad * Math.sin(SRAD(ang)), cy - rad * Math.cos(SRAD(ang))];
  // shells
  [[R, "rgba(122,106,79,.10)", "#7a6a4f"], [rCMB, "rgba(180,83,9,.13)", "#b45309"],
   [rICB, "rgba(109,40,217,.14)", "#6d28d9"]].forEach(([rr, fill, line]) => {
    ctx.fillStyle = fill; ctx.strokeStyle = line; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.fill(); ctx.stroke();
  });
  // the shadow band, 103 to 143 degrees each side
  ctx.fillStyle = "rgba(180,83,9,.16)";
  [1, -1].forEach(sgn => {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    for(let a = 103; a <= 143; a += 2){ const [x, y] = P(sgn * a, R * 1.13); ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fill();
  });
  // mantle P rays: turn back up, surfacing between 20 and 103 degrees
  ctx.lineWidth = 1.5;
  [20, 40, 60, 80, 103].forEach(d => {
    const depth = R * (0.30 + 0.62 * d / 103);           // schematic turning depth
    ctx.strokeStyle = d === 103 ? "#0f766e" : "rgba(15,118,110,.55)";
    ctx.beginPath();
    for(let i = 0; i <= 60; i++){
      const u = i / 60, a = d * u;
      const rr = R - (R - Math.max(depth, rCMB * 1.02)) * Math.sin(Math.PI * u);
      const [x, y] = P(a, rr); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  });
  // a core ray: refracted down at the CMB, out again past 143 degrees
  ctx.strokeStyle = "#6d28d9"; ctx.lineWidth = 1.8;
  ctx.beginPath();
  const seg = [[0, R], [26, rCMB], [90, rICB * 1.35], [154, rCMB], [180, R]];
  for(let i = 0; i <= 120; i++){
    const u = i / 120 * (seg.length - 1), j = Math.min(seg.length - 2, Math.floor(u)), f = u - j;
    const a = seg[j][0] + (seg[j + 1][0] - seg[j][0]) * f;
    const rr = seg[j][1] + (seg[j + 1][1] - seg[j][1]) * f;
    const [x, y] = P(a, rr); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  // Pdif (2026-10-25): a P ray grazing the core, bent along its surface, surfacing weakly inside the shadow
  ctx.strokeStyle = "#5b6470"; ctx.setLineDash([3, 2]); ctx.lineWidth = 1.5;
  ctx.beginPath();
  const dseg = [[0, R], [42, rCMB * 1.01], [96, rCMB * 1.01], [120, R]];
  for(let i = 0; i <= 90; i++){
    const u = i / 90 * (dseg.length - 1), j = Math.min(dseg.length - 2, Math.floor(u)), f = u - j;
    const a = -(dseg[j][0] + (dseg[j + 1][0] - dseg[j][0]) * f);
    const rr = dseg[j][1] + (dseg[j + 1][1] - dseg[j][1]) * f;
    const [x, y] = P(a, rr); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  // S ray, stopped dead at the boundary
  ctx.strokeStyle = "#b45309"; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.8;
  ctx.beginPath();
  for(let i = 0; i <= 40; i++){
    const u = i / 40, a = 30 * u, rr = R - (R - rCMB) * u;
    const [x, y] = P(a, rr); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  // epicentre and the two shadow edges
  ctx.fillStyle = "#151a21";
  const [ex, ey] = P(0, R); ctx.beginPath(); ctx.arc(ex, ey, 5, 0, 7); ctx.fill();
  ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
  ctx.fillStyle = "#5b6470"; ctx.fillText(t("sq-cv-quake"), ex, ey - 12);
  [[103, "103°"], [143, "143°"], [180, "180°"]].forEach(([a, lab]) => {
    [1, -1].forEach(sgn => {
      if(sgn < 0 && a === 180) return;
      const [x, y] = P(sgn * a, R * 1.20);
      ctx.fillStyle = a === 180 ? "#8b93a0" : "#b45309";
      ctx.fillText(lab, x, y + 4);
    });
  });
  ctx.textAlign = "left"; ctx.fillStyle = "#8b93a0";
  ctx.fillText(t("sq-cv-schem"), 8, H - 8);   // 2026-10-25 : le reste de l'ancienne note est dans la légende (figkey)
  ctx.fillStyle = "#6d28d9"; ctx.textAlign = "center";
  ctx.fillText(t("sq-cv-inner-core"), cx, cy + 4);
}

// ---- the animation: real epicentres, real stations, real recorded arrival times ----
// The two wavefronts are still COMPUTED geometry -- there is no way to draw a
// literal wavefront otherwise -- at the SAME 3.5 km/s (SEIS_V20) as the box plot
// and histograms above, not the demo's 3.8. What is REAL now is which station
// dot lights up and when: seisAnim.ev picks one of the 9 real earthquakes
// (SEIS_RADIUS_EVENTS) and each dot switches on at that station's own
// travel_time_s from data/seis (the ISC bulletin), never a computed kmG/v. The
// flat front's own "reached" count is still a computed comparison -- there is
// no such thing as an "observed flat arrival" to read off a real seismogram.
const seisAnim = { ev: SEIS_RADIUS_EVENTS[0].key, t: 0, running: true, last: 0, raf: 0, readAt: 0 };
const SEIS_TIMEX = 900;          // simulated seconds per real second

function seisSetEvent(k){
  seisAnim.ev = k; seisAnim.t = 0; seisAnim.last = 0;
  const sel = $("seisRealEvSel"); if(sel) sel.value = k;
}
function seisSetRunning(r){
  seisAnim.running = r;
  const el = $("seisPlay");
  if(el){ el.setAttribute("aria-pressed", String(r)); el.innerHTML = r ? "&#10073;&#10073;" : "&#9654;"; }
  if(r) seisAnimStart();
}
function seisAnimReads(){
  const el = $("seisAnimReads"); if(!el) return;
  const ev = SEIS_RADIUS_EVENTS.find(e => e.key === seisAnim.ev);
  const rows = SEIS_ARRIVALS[seisAnim.ev];
  const km = seisAnim.t * SEIS_V20;
  const { hitG, hitF, total } = seisRealAnimHits(ev, rows, seisAnim.t);
  el.innerHTML =
    `<span class="r"><span class="sub">${ev.name}</span></span>` +
    `<span class="r">t = <b>${seisHMS(seisAnim.t)}</b></span>` +
    `<span class="r"><span class="dot" style="background:#0f766e"></span>front at <b>${Math.round(km).toLocaleString("en-US")} km</b>` +
      ` = <b>${(km / SEIS_KM_PER_DEG).toFixed(0)}°</b></span>` +
    `<span class="r"><span class="dot" style="background:#0f766e"></span>reached <b>${hitG}/${total}</b> <span class="sub">real stations, real recorded time</span></span>` +
    `<span class="r"><span class="dot" style="background:#b45309"></span>reached <b>${hitF}/${total}</b> <span class="sub">flat map, computed</span></span>`;
}

function seisRealAnimHits(ev, rows, tSim, v = SEIS_V20){
  let hitG = 0, hitF = 0;
  for(const [, staLat, staLon, , travelTimeS] of rows){
    if(travelTimeS <= tSim) hitG++;
    if(seisFlatKm(ev.lat, ev.lon, staLat, staLon) / v <= tSim) hitF++;
  }
  return { hitG, hitF, total: rows.length };
}

function drawSeisAnim(){
  const cv = $("seisAnimCanvas"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  const ev = SEIS_RADIUS_EVENTS.find(e => e.key === seisAnim.ev);
  const rows = SEIS_ARRIVALS[seisAnim.ev];
  const cx = W / 2, cy = H / 2, S = Math.min(W, H) * 0.46 / 180;   // px per degree-unit
  const PT = p => [cx + p.x * S, cy + p.y * S];
  // the disc: the north-polar azimuthal-equidistant map with its continents (epic18 : core/aemap.js ;
  // seisAE = makeAE tournée de 180°, parité testée dans core/aeproj.test.js), graticule 30°, équateur appuyé
  drawAEMap(ctx, SEIS_MAP, { cx, cy, Rpx: 180 * S, grid: 30, colors: { rim: "#c9ced6" } });
  ctx.strokeStyle = "rgba(21,26,33,.28)"; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(cx, cy, 90 * S, 0, 7); ctx.stroke();
  ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.fillStyle = "#8b93a0"; ctx.textAlign = "center";
  ctx.fillText(t("sq-cv-n-pole"), cx, cy - 5);
  ctx.fillText(t("sq-cv-equator"), ...(() => { const p = PT(seisAE(0, 180)); return [p[0], p[1] - 6]; })());
  // the flat model's front: a plain circle on the map
  const degF = seisAnim.t * SEIS_V20 / SEIS_KM_PER_DEG;
  const E = seisAE(ev.lat, ev.lon);
  if(degF > 0){
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.arc(...PT(E), degF * S, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  }
  // the real front: constant great-circle distance, projected
  const degG = Math.min(180, seisAnim.t * SEIS_V20 / SEIS_KM_PER_DEG);
  if(degG > 0.5){
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.6; ctx.beginPath();
    for(let az = 0; az <= 360; az += 3){
      const q = seisDirect(ev.lat, ev.lon, az, degG);
      const [x, y] = PT(seisAE(q.lat, q.lon));
      az ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
  }
  // real stations -- dots only, up to 146 of them, no per-dot code label
  rows.forEach(([, staLat, staLon, , travelTimeS]) => {
    const [x, y] = PT(seisAE(staLat, staLon));
    const on = travelTimeS <= seisAnim.t;
    ctx.fillStyle = on ? "#0f766e" : "#fff";
    ctx.strokeStyle = on ? "#0f766e" : "#8b93a0"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(x, y, on ? 4 : 3, 0, 7); ctx.fill(); ctx.stroke();
  });
  // epicentre
  const [ex, ey] = PT(E);
  ctx.fillStyle = "#151a21";
  ctx.beginPath();
  for(let i = 0; i < 10; i++){
    const a = SRAD(i * 36 - 90), rr = i % 2 ? 3.5 : 8;
    const px = ex + rr * Math.cos(a), py = ey + rr * Math.sin(a);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8b93a0"; ctx.textAlign = "left"; ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.fillText(t("sq-cv-teal-orange").replace("{x}", SEIS_TIMEX), 8, H - 8);
  ctx.fillText(t("sq-cv-real-dots").replace("{n}", rows.length), 8, H - 22);
  ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#151a21";
  ctx.fillText(t("sq-cv-flat-title"), 8, 16);
  // le même instant sur le globe (seis-globe.js, 2026-09-24)
  drawSeisGlobe($("seisGlobeCanvas"), { ev, rows, t: seisAnim.t, v: SEIS_V20, kmPerDeg: SEIS_KM_PER_DEG, tr: t });
}

function seisAnimFrame(ts){
  seisAnim.raf = 0;
  if(!$("seisAnimCanvas") || $("tab-seis").hidden) return;
  const now = ts / 1000;
  const dt = seisAnim.last ? Math.min(0.08, now - seisAnim.last) : 0;
  seisAnim.last = now;
  if(seisAnim.running && dt > 0){
    seisAnim.t += dt * SEIS_TIMEX;
    if(seisAnim.t > 8400) seisAnim.t = 0;            // loop a little past 2 h
  }
  drawSeisAnim();
  if(now - seisAnim.readAt > 0.15){ seisAnimReads(); seisAnim.readAt = now; }
  if(seisAnim.running) seisAnimStart();
}
function seisAnimStart(){
  if(seisAnim.raf || !seisAnim.running) return;
  if(!$("seisAnimCanvas") || $("tab-seis").hidden) return;
  seisAnim.raf = requestAnimationFrame(seisAnimFrame);
}

// ---- experiment 1e: one pair of coordinates, two geometries ----

function drawSeis(){
  seisStationTable(); seisLayerTable();
  seisRadiusTable(); seisRadiusRead(); seisRadiusTable2(); seisRadiusRead2(); seisRegRead(); seisLatenessRead();
  if($("tab-seis").hidden) return;
  drawSeisTT(); drawSeisCore(); seisRadiusFig(); seisRadiusFig2(); seisRegFig(); seisLatenessFig();
  seisAnim.last = 0;
  drawSeisAnim(); seisAnimReads(); seisAnimStart();
}
function wireSeis(){
  const on = (id, fn) => { const el = $(id); if(el) el.addEventListener("click", fn); };
  /* LE GLOBE A CÔTÉ DE LA CARTE (2026-09-24). Le flux de prose est verbatim :
     le second canvas est inséré ici, et les deux vont dans une grille qui
     les met côte à côte sur écran large, l'un sous l'autre sur téléphone. */
  const flat = $("seisAnimCanvas");
  if(flat && !$("seisGlobeCanvas")){
    const pair = document.createElement("div"); pair.className = "seis-anim-pair";
    const glb = document.createElement("canvas"); glb.id = "seisGlobeCanvas";
    glb.setAttribute("role", "img"); glb.setAttribute("aria-label", "The same seismic wave on a globe: a circle that grows from the epicentre and closes on the antipode");
    flat.parentNode.insertBefore(pair, flat);
    pair.appendChild(glb); pair.appendChild(flat);
    wireSeisGlobe(glb);
  }
  // export (epic10/UC02) : l'onde rejouée à l'instant t, carte et globe ensemble ;
  // une boucle = 8 400 s simulées à ×SEIS_TIMEX. readout() : les lectures de la page.
  if(flat){
    let saved = null;
    const anim = {
      duration: 8400 / SEIS_TIMEX,
      begin(){ saved = { ...seisAnim }; if(seisAnim.raf){ cancelAnimationFrame(seisAnim.raf); seisAnim.raf = 0; } },
      frameAt(tt){ seisAnim.t = (tt * SEIS_TIMEX) % 8400; drawSeisAnim(); },
      end(){ if(saved) Object.assign(seisAnim, saved, { raf: 0, last: 0 }); saved = null; drawSeisAnim(); seisAnimReads(); if(seisAnim.running) seisAnimStart(); },
      readout(){
        const ev = SEIS_RADIUS_EVENTS.find(e => e.key === seisAnim.ev), rows = SEIS_ARRIVALS[seisAnim.ev];
        const km = seisAnim.t * SEIS_V20, { hitG, hitF, total } = seisRealAnimHits(ev, rows, seisAnim.t);
        return `${ev.name} · t = ${seisHMS(seisAnim.t)} · front ${Math.round(km).toLocaleString("en-US")} km = ${(km / SEIS_KM_PER_DEG).toFixed(0)}° · real stations reached ${hitG}/${total} · flat map ${hitF}/${total}`;
      },
    };
    flat.__anim = anim; if($("seisGlobeCanvas")) $("seisGlobeCanvas").__anim = anim;
  }
  const sel = $("seisRealEvSel");
  if(sel){
    sel.innerHTML = SEIS_RADIUS_EVENTS.map(ev => `<option value="${ev.key}">${ev.name}</option>`).join("");
    sel.value = seisAnim.ev;
    sel.addEventListener("change", () => { seisSetEvent(sel.value); drawSeisAnim(); seisAnimReads(); });
  }
  const regSel = $("seisRegEvSel");
  if(regSel){
    regSel.innerHTML = SEIS_RADIUS_EVENTS.map(ev => `<option value="${ev.key}">${ev.name}</option>`).join("");
    regSel.value = seisRegEv;
    regSel.addEventListener("change", () => seisSetRegEvent(regSel.value));
  }
  on("seisPlay", () => seisSetRunning(!seisAnim.running));
  on("seisReset", () => { seisAnim.t = 0; seisAnim.last = 0; drawSeisAnim(); seisAnimReads(); });
  // l'expérience 1e est dans falsify (exp.js, 2026-11-26)
}

let t = (k) => k;

export function wire(){
  t = makeT(document.documentElement.lang || "en", "seis");
  wireSeis();
  // prefers-reduced-motion (epic06/UC04) : l'onde attend le bouton lecture
  if(reducedMotion()) seisSetRunning(false);
}
export function draw(){ drawSeis(); }
/** teardown() du contrat d'onglet : coupe la boucle rAF sans attendre le prochain cadre. */
export function stop(){
  if(seisAnim.raf){ cancelAnimationFrame(seisAnim.raf); seisAnim.raf = 0; }
  seisAnim.last = 0;
}
