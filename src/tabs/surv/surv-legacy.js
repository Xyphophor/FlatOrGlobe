// Moteur de l'onglet surv, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html L17783-18018) par research/port_legacy_js.py :
// figures canvas, tables, expérience, écouteurs. Il cherche ses hôtes par
// id dans le document (flux verbatim src/data/prose/surv.js) et n'expose
// que wire()/draw()/stop(). Le legacy lisait #radius/#kcoef/#refr (le
// formulaire global de l'onglet sim) : ici ces lectures retombent sur les
// valeurs par défaut de la page (R = 6371 km, k = 0.13) quand l'élément
// n'existe pas -- voir legacy-helpers.js.
import { setupCanvas, niceLen } from "../../core/canvas.js";
import { $, DEG, RAD, fillPresetSelect, fmtAngle, fmtDist, fmtDiff, expNum, dipSetRate, dipHm } from "../../core/legacy-helpers.js";
import { FIG } from "../../core/fig.js";
import { norm3, addS } from "../../core/camera3d.js";
import { magRot, magPoly, magPanelBox, magLat2r, magSgn } from "../mag/shared.js";
import { drawGlobe25, globeVec } from "../../core/globe25d.js";
import { makeT } from "../../core/i18n.js";
const TD = Math.PI / 180;

let t = (k) => k;
export function setSurvLang(lang) { t = makeT(lang, "surv"); }

// ---- Tab 7: geodetic surveying ----
const SURV = { lvl: 0, tri: 0 };
const SURV_LVL = [
  { name: "NGS practice", d: 0.06, mode: "balanced", capKey: "lvl-cap-ngs" },
  { name: "Bedford Level", d: 9.7, mode: "wallace", capKey: "lvl-cap-bedford" },
  { name: "Pontchartrain", d: 38.4, mode: "chord", capKey: "lvl-cap-pontchartrain" },
  { name: "Rainy Lake 2018", d: 9.46, mode: "wallace", capKey: "lvl-cap-rainylake" },
  { name: "Suez Canal", d: 162, mode: "chord", capKey: "lvl-cap-suez" },
  { name: "LIGO Hanford arm", d: 4, mode: "chord", capKey: "lvl-cap-ligo" },
];
// lat/lon (2026-10-28) : où le triangle est posé sur le globe (avant : 25° N 0° E pour
// tous, en plein Sahara, ce que les côtes remises sur le globe rendaient visible).
// Vérifié sur sources, pas de mémoire :
//  Gauss : centroïde Brocken 51,8006° N 10,6172° E, Hoher Hagen 51,4752° N 9,7646° E,
//    Großer Inselsberg 50,8511° N 10,4658° E (Wikipédia en/de ; côtés 69/85/106 km) ;
//  Struve : observatoire de Dorpat/Tartu, 58,3788° N 26,7201° E, premier point de l'arc ;
//  OSGB : centre de la Grande-Bretagne selon l'Ordnance Survey, 54,0037° N 2,5479° W ;
//  GTS : milieu du Grand Arc, cap Comorin 8,0883° N 77,5385° E – Dehra Dun 30,345° N 78,029° E ;
//  Cassini : méridienne de Paris 2,3372° E, à mi-course Dunkerque 51,038° N – Collioure 42,521° N ;
//  Espagne–Algérie : centre du quadrilatère Mulhacén 37,0533° N 3,3118° W, Tetica 37,2533° N
//    2,4132° W, Filhaoussen 35,0097° N 1,6905° W, M'Sabiha 35,6603° N 0,8492° W (coordonnées
//    de 1879 rapportées aux méridiens de Madrid et de Paris, blog « La Murga de Nito », 2011 ;
//    Mulhacén et Tetica recoupent Wikipédia à 0,001° près ; quatre stations : Reclus, Africa) ;
//  Corse : milieu de Coudon 43,1603° N 6,0083° E – Monte Cinto 42,3797° N 8,9458° E (255,0 km) ;
//  échelle continentale : illustrative, posée sur l'Europe (aucun réseau réel).
const SURV_TRI = [
  { name: "Gauss 1823 · Brocken–Hohehagen–Inselsberg", side: 82.2, lat: 51.376, lon: 10.283,
    extraKey: "tri-extra-gauss", measuredKey: "tri-measured-gauss" },
  { name: "Struve chain triangle (typical)", side: 40, lat: 58.379, lon: 26.720, extraKey: "tri-extra-struve" },
  { name: "OSGB retriangulation, primary (typical)", side: 60, lat: 54.004, lon: -2.548, extraKey: "tri-extra-osgb" },
  { name: "Great Trigonometrical Survey (typical long side)", side: 75, lat: 19.217, lon: 77.784, extraKey: "tri-extra-gts" },
  { name: "Continental scale (illustrative)", side: 1000, lat: 48.0, lon: 10.0, extraKey: "tri-extra-continental" },
  { name: "Cassini's Paris meridian (typical side)", side: 35, lat: 46.780, lon: 2.337, extraKey: "tri-extra-cassini" },
  { name: "Spain–Algeria junction 1879 (Mulhacén side)", side: 270, lat: 36.244, lon: -2.066, extraKey: "tri-extra-spain" },
  { name: "Corsica–mainland junction 1925 (Coudon–Cinto)", side: 255.6, lat: 42.770, lon: 7.477, extraKey: "tri-extra-corsica" },
];
const SURVC = { yaw: -0.5, pitch: 0.5, spin: 0, spinning: true, drag: false, lx: 0, ly: 0 };
const SURV_R = 6371, SURV_K = 0.13;

const survDrop = dkm => dkm*dkm/(2*SURV_R)*1000;                 // m, geometric
const survCR   = dkm => (1-SURV_K)*dkm*dkm/(2*SURV_R)*1000;     // m, with standard refraction
// equilateral spherical triangle of side s (km): vertex angle & excess
function survExcess(skm){
  const sig = skm/SURV_R;
  const ang = Math.acos(Math.cos(sig)/(1 + Math.cos(sig)));     // vertex angle, rad
  const sum = 3*ang/TD;                                          // degrees
  return { ang, sum, excArc: (sum - 180)*3600 };                 // arcseconds
}

// Taille DESSINÉE du triangle (2026-10-28). Avant, tout côté < 2 230 km était
// dessiné à la même taille (0,55 rad ici, 0,35 rad dans la scène Three.js) :
// les huit préréglages donnaient le même dessin. Ici l'angle au centre dessiné
// croît avec le côté (logarithmiquement, 30 km -> 0,22 rad, 1 000 km -> 0,55 rad),
// jamais sous la taille réelle ; le facteur ×ex (sphère réduite à R/ex, règle 1)
// est imprimé sur le canvas.
function survDrawnSigma(skm){
  const sigTrue = skm/SURV_R;
  const f = Math.max(0, Math.min(1, Math.log(skm/30)/Math.log(1000/30)));
  return Math.max(sigTrue, 0.22 + 0.33*f);
}

// -- 01: levelling — three documented scenes ---------------------------------
function drawSurvLevel(){
  const cv = $("survLevel"); if(!cv || $("tab-surv").hidden) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0,0,W,H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0,0,W,H);
  const PRE = SURV_LVL[SURV.lvl], d = PRE.d;
  const ML = 56, MR = 40, baseY = H*0.44;
  const xOf = km => ML + (W-ML-MR)*km/d;
  const sag = d*d/(8*SURV_R)*1000;                          // mid-span bulge, m
  const drop = survDrop(d), cr = survCR(d);
  const bulgePx = Math.min(H*0.30, Math.max(30, H*0.26));
  ctx.font = "600 10.5px ui-monospace, Menlo, monospace"; ctx.textAlign = "left";
  if(PRE.mode === "balanced"){
    const ex = bulgePx/Math.max(drop, 1e-12);
    const yLev = km => baseY + ((km - d/2)*(km - d/2)/(2*SURV_R)*1000)*ex;  // tangent at the instrument (mid)
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2; ctx.beginPath();
    for(let i = 0; i <= 80; i++){ const km = d*i/80; i ? ctx.lineTo(xOf(km), yLev(km)) : ctx.moveTo(xOf(km), yLev(km)); }
    ctx.stroke();
    ctx.strokeStyle = "#151a21"; ctx.setLineDash([6,5]); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(xOf(0), baseY); ctx.lineTo(xOf(d), baseY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#151a21"; ctx.fillRect(xOf(d/2)-3, baseY-16, 6, 16);
    [[0, t("back-sight")], [d, t("fore-sight")]].forEach(([km, nm]) => {
      ctx.strokeStyle = "#b45309"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(xOf(km), yLev(km)); ctx.lineTo(xOf(km), baseY - 14); ctx.stroke();
      ctx.fillStyle = "#5b6470"; ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(nm, xOf(km), baseY + 8);
    });
    ctx.fillStyle = "#151a21"; ctx.font = "600 10.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(t("lvl-balanced-note1").replace("{v}", (survDrop(0.06)*1000).toFixed(2)), ML, 10);
    ctx.fillStyle = "#0f766e"; ctx.fillText(t("lvl-balanced-note2"), ML, 26);
  } else {
    // wallace / chord: level water arc above the chord between the endpoints
    const ex = bulgePx/sag;
    const yWater = km => baseY + bulgePx - (km*(d - km)/(2*SURV_R)*1000)*ex;   // bulge above the chord
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2; ctx.beginPath();
    for(let i = 0; i <= 90; i++){ const km = d*i/90; i ? ctx.lineTo(xOf(km), yWater(km)) : ctx.moveTo(xOf(km), yWater(km)); }
    ctx.stroke();
    ctx.strokeStyle = "#151a21"; ctx.setLineDash([6,5]); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(xOf(0), baseY + bulgePx); ctx.lineTo(xOf(d), baseY + bulgePx); ctx.stroke();
    ctx.setLineDash([]);
    if(PRE.mode === "wallace"){
      [0, d/2, d].forEach(km => {
        ctx.strokeStyle = "#b45309"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(xOf(km), yWater(km)); ctx.lineTo(xOf(km), yWater(km) - 18); ctx.stroke();
        ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.arc(xOf(km), yWater(km) - 18, 3, 0, 7); ctx.fill();
      });
      ctx.strokeStyle = "#39414c"; ctx.setLineDash([3,4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(xOf(0), yWater(0) - 18); ctx.lineTo(xOf(d), yWater(d) - 18); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#b91c1c"; ctx.lineWidth = 1.4;
      const ym = yWater(d/2) - 18, yl = baseY + bulgePx - 18;
      ctx.beginPath(); ctx.moveTo(xOf(d/2)+9, yl); ctx.lineTo(xOf(d/2)+9, ym); ctx.stroke();
      ctx.fillStyle = "#b91c1c"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
      ctx.fillText(t("lvl-wallace-gap").replace("{sag}", sag.toFixed(2)).replace("{refr}", (sag*0.87).toFixed(1)), xOf(d/2)+14, (yl+ym)/2);
      ctx.fillStyle = "#151a21"; ctx.textBaseline = "top";
      ctx.fillText(t("lvl-wallace-note"), ML, 10);
    } else {
      ctx.strokeStyle = "#b91c1c"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(xOf(d/2), baseY + bulgePx); ctx.lineTo(xOf(d/2), yWater(d/2)); ctx.stroke();
      ctx.fillStyle = "#b91c1c"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(t("lvl-chord-gap").replace("{sag}", sag.toFixed(1)), xOf(d/2)+8, (baseY + bulgePx + yWater(d/2))/2);
      ctx.fillStyle = "#151a21"; ctx.textBaseline = "top";
      ctx.fillText(t("lvl-chord-note").replace("{d}", d.toFixed(1)), ML, 10);
    }
    ctx.fillStyle = "#b45309"; ctx.font = "10.5px ui-monospace, Menlo, monospace"; ctx.textBaseline = "top";
    ctx.fillText(t("lvl-flat-pred"), ML, 26);
    ctx.fillStyle = "#7d848f"; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textBaseline = "bottom";
    ctx.fillText(t("lvl-exagg").replace("{ex}", Math.round(ex*1000).toLocaleString("en")), ML, H-8);
  }
}

// -- 02: spherical-excess triangle in 3D ------------------------------------
const survSlerp = (a, b, t) => {
  const w = Math.acos(Math.max(-1, Math.min(1, a[0]*b[0]+a[1]*b[1]+a[2]*b[2])));
  if(w < 1e-9) return a.slice();
  const s1 = Math.sin((1-t)*w)/Math.sin(w), s2 = Math.sin(t*w)/Math.sin(w);
  return [a[0]*s1+b[0]*s2, a[1]*s1+b[1]*s2, a[2]*s1+b[2]*s2];
};
// tourne le globe pour que le triangle choisi soit face à la vue (sélection, montage)
function survFace(){
  const PRE = SURV_TRI[SURV.tri];
  SURVC.spin = -PRE.lon*TD - Math.PI/2 - SURVC.yaw;
}
function drawSurvTri(){
  const cv = $("survTri"); if(!cv || $("tab-surv").hidden) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0,0,W,H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0,0,W,H);
  const sc = Math.min(W, H)*0.34, cx = W/2, cy = H/2 + 18;
  const P = p => { const q = magRot(SURVC, p); return [cx + q[0]*sc, cy - q[1]*sc, q[2]]; };
  const poly = (pts,c,w,d,cu,a) => magPoly(ctx,P,pts,c,w,d,cu,a);
  // sphère ombrée + graticule + côtes + atmosphère (globe25d). Les côtes, retirées
  // le 2026-09-24, reviennent le 2026-10-28 (propriétaire : garder le fond de carte
  // de l'ancienne scène Three.js) ; le triangle est posé sur son réseau (SURV_TRI lat/lon).
  drawGlobe25(ctx, P, sc);
  // triangle: true angular size if visible, else enlarged WITH label (never silently)
  const PRE = SURV_TRI[SURV.tri];
  const ex = survExcess(PRE.side);
  const sigTrue = PRE.side/SURV_R;
  const sig = survDrawnSigma(PRE.side);
  const exTri = sig/sigTrue, enlarged = exTri > 1.001;
  const rho = Math.acos(Math.sqrt((2*Math.cos(sig) + 1)/3));     // circumradius of the drawn triangle
  const C = globeVec(PRE.lat, PRE.lon);                          // centre: the network's region
  const U0 = norm3([-C[1], C[0], 0]);
  const verts = [0, 1, 2].map(i => {
    const t = 2*Math.PI*i/3 + Math.PI/2;
    const dir = addS(U0, norm3([C[1]*U0[2]-C[2]*U0[1], C[2]*U0[0]-C[0]*U0[2], C[0]*U0[1]-C[1]*U0[0]]),
                     Math.cos(t), Math.sin(t));
    return norm3(addS(C, dir, Math.cos(rho), Math.sin(rho)));
  });
  for(let i = 0; i < 3; i++){
    const a = verts[i], b = verts[(i+1)%3], pts = [];
    for(let j = 0; j <= 40; j++) pts.push(survSlerp(a, b, j/40));
    poly(pts, "#6d28d9", 2.2, null, true, .95);
  }
  verts.forEach((v, i) => {
    const q = P([v[0]*1.0, v[1]*1.0, v[2]*1.0]);
    if(q[2] < 0.02) return;
    ctx.fillStyle = "#6d28d9"; ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, 7); ctx.fill();
    ctx.font = "600 10px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(["A","B","C"][i], q[0], q[1]-6);
  });
  // readout
  const lines = [
    ["#6d28d9", PRE.name.length > 34 ? PRE.name.slice(0, 33) + "…" : PRE.name],
    ["#6d28d9", t("tri-sides-angle").replace("{side}", PRE.side).replace("{ang}", (ex.ang/TD).toFixed(4))],
    ["#0f766e", t("tri-angle-sum").replace("{sum}", ex.sum.toFixed(4)).replace("{exc}", ex.excArc.toFixed(1))],
    ["#b45309", PRE.measuredKey ? t("tri-measured-agree").replace("{measured}", t(PRE.measuredKey)) : t("tri-flat-pred")],
    enlarged ? ["#b91c1c", t("tri-drawn-x").replaceAll("{ex}", Math.round(exTri).toLocaleString("en"))]
             : ["#7d848f", t("tri-true-scale")],
  ];
  magPanelBox(ctx, lines, W < 520 ? 9.5 : 11, W < 520 ? 13 : 16);
  ctx.fillStyle = "#7d848f"; ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.textAlign = "left"; ctx.textBaseline = "bottom";
  ctx.fillText(t("drag-orbit"), 10, H-8);
}
function survTables(){
  if($("tab-surv").hidden) return;
  const rows = [
    { nm: "Snellius 1615 (first chain)", s: 30, who: "" },
    { nm: "Gauss Hanover 1821–25", s: 82.2, who: t("who-measured") },
    { nm: "Struve Arc 1816–55", s: 40, who: "" },
    { nm: "OSGB retriangulation 1936–62", s: 60, who: "" },
    { nm: "GTS India 1802–71", s: 75, who: "" },
    { nm: "Continental 1,000 km (illustrative)", s: 1000, who: "" },
  ];
  $("survRows").innerHTML = rows.map(r => {
    const e = survExcess(r.s);
    return `<tr><td style="text-align:left">${r.nm}</td><td>~${r.s} km</td>` +
      `<td class="hot" data-i18n="b812af72">${e.excArc < 120 ? e.excArc.toFixed(1) + "″" : (e.excArc/3600).toFixed(2) + "°"}${r.who}</td></tr>`;
  }).join("");
  const PRE = SURV_TRI[SURV.tri], e = survExcess(PRE.side);
  const excStr = e.excArc < 120 ? e.excArc.toFixed(1) + "″" : (e.excArc/3600).toFixed(2) + "°";
  $("survTriCap").innerHTML = t("tricap-tpl")
    .replace("{name}", PRE.name).replace("{ang}", (e.ang/TD).toFixed(4)).replace("{exc}", excStr)
    .replace("{measured}", PRE.measuredKey ? t("tricap-measured-gauss") : ".")
    .replace("{extra}", t(PRE.extraKey));
  // l'expérience 7 est dans falsify (exp.js, 2026-11-26)
}
function drawSurvey(){
  if($("tab-surv").hidden) return;
  drawSurvLevel(); drawSurvTri(); survTables();
}


/* ---- Angles zénithaux réciproques (legacy L28599-28700) + ctStats (L28873) ---- */
const SV_ZEN = [
  { z1:"91 08 09", z2:"89 07 44", d:32139, h:2273 },
  { z1:"91 03 44", z2:"89 15 34", d:39476, h:2188 },
  { z1:"90 50 01", z2:"89 35 13", d:52518, h:2269 },
  { z1:"91 09 00", z2:"89 22 35", d:66128, h:2043 },
  { z1:"90 49 49", z2:"89 45 41", d:74362, h:2209 },
  { z1:"90 40 36", z2:"89 56 32", d:76957, h:2308 },
  { z1:"90 32 21", z2:"90 12 12", d:92882, h:2421 },
];
function svDms(s){ const p = s.split(" ").map(Number); return p[0] + p[1]/60 + p[2]/3600; }
function svTabZen(){
  const host = $("sv-tabZen"); if(!host) return;
  const R = 6371000, cap = host.querySelector("caption").outerHTML;
  let r = `<tr><th>${t("sv-th-line")}</th><th>\u03b6\u2081 + \u03b6\u2082 \u2212 180\u00b0</th>`
        + `<th class="g">${t("sv-th-globek")}</th><th class="f">${t("sv-th-planek")}</th>`
        + `<th class="f">${t("sv-th-planedt")}</th></tr>`;
  SV_ZEN.forEach(o => {
    const a = (180 - (svDms(o.z1) + svDms(o.z2))) * Math.PI / 180;
    const kG = (2 * (o.d/(2*R) + a/2) / o.d) * R;
    const cF = a / o.d, kF = cF * R;
    const T = 288.15 - 0.0065*o.h;
    const P = 1013.25 * Math.pow((288.15 - 0.0065*o.h)/288.15, 5.26);
    const dT = (12660 * cF * T*T / P - 0.0343) * 1000;
    r += `<tr><td>${(o.d/1000).toFixed(1)} km</td>`
       + `<td>+${(-a * 180/Math.PI * 60).toFixed(1)}\u2032</td>`
       + `<td class="g">${kG.toFixed(3)}</td><td class="f">${kF.toFixed(3)}</td>`
       + `<td class="f">${dT.toFixed(0)} \u00b0C/km</td></tr>`;
  });
  host.innerHTML = r + cap;
}

const SV_TRI = [
  [34.163,90.089167,90.187556],[30.701,89.877139,90.384667],[35.218,90.269472,90.015028],
  [156.762,90.144972,91.082194],[65.696,89.075806,91.440417],[38.546,88.799778,91.501500],
  [33.063,90.358333,89.895806],[41.044,90.159778,90.158889],[28.391,91.535528,88.680611],
  [18.647,92.303278,87.842722],[18.670,92.284528,87.862861],[41.775,89.994528,90.343944],
  [33.840,90.226944,90.046167],[69.422,88.299111,92.249556],[41.982,89.684361,90.654028],
  [47.805,90.502000,89.883000],[28.354,89.639056,90.595028],[59.102,89.742667,90.734722],
  [87.142,91.355333,89.342222],[82.966,89.912806,90.755694],[110.377,90.201250,90.689778],
  [123.697,90.461667,90.525028],[108.825,90.519806,90.331972],[122.287,90.140250,90.827722],
  [112.907,89.990417,90.914944],
];
function svRadii(){
  const raw = [];
  SV_TRI.forEach(t => raw.push(t[0] / ((t[1] + t[2] - 180) * Math.PI / 180)));
  SV_ZEN.forEach(o => raw.push((o.d/1000) / ((svDms(o.z1) + svDms(o.z2) - 180) * Math.PI / 180)));
  return [[t("sv-no-correction"), raw, "flat"],
          ["k = 0.13", raw.map(x => 0.87 * x), "globe"]];
}
function svFigR(){
  const C = FIG.C, S = svRadii();
  const f = FIG.make({ w:380, h:176,
    alt:"Earth radius from 32 reciprocal zenith angle pairs, uncorrected and with standard refraction" });
  const ST = S.map(q => ctStats(q[1]));
  const VMAX = 8000, X0 = 116, X1 = 340;
  const bx = v => Math.max(X0 - 6, Math.min(X1 + 10, X0 + v / VMAX * (X1 - X0)));
  [0, 2000, 4000, 6000, 8000].forEach(v => {
    f.dash(bx(v), 26, bx(v), 118, { c:"#e7e3da", dash:"3 3" });
    f.note(bx(v), 136, (v/1000).toFixed(0), { anchor:"middle" });
  });
  f.line(bx(6371), 30, bx(6371), 120, { c:C.globe, w:1.6 });
  f.note(bx(6371) + 5, 156, "6371 km", { c:C.globe });
  S.forEach((q, i) => {
    const y = 48 + i * 40, col = q[2] === "flat" ? C.flat : C.globe, s = ST[i];
    f.note(X0 - 10, y + 4, q[0], { anchor:"end" });
    f.line(bx(s.lo), y, bx(s.hi), y, { c:col, w:1.2 });
    f.line(bx(s.lo), y-6, bx(s.lo), y+6, { c:col, w:1.2 });
    f.line(bx(s.hi), y-6, bx(s.hi), y+6, { c:col, w:1.2 });
    f.path(`M${bx(s.q1)} ${y-9} H${bx(s.q3)} V${y+9} H${bx(s.q1)} Z`, { c:col, w:1.4, fill:"none" });
    f.line(bx(s.med), y-9, bx(s.med), y+9, { c:col, w:2.6 });
    s.out.forEach(o => f.dot(bx(o), y, { r:2.2, c:col }));
  });
  f.note(4, 156, t("sv-fig-radius-axis"));
  f.notToScale(ST[0].n + " reciprocal pairs");
  f.mountIn($("sv-figR"));
}
function svReadR(){
  const S = svRadii(), a = ctStats(S[0][1]), b = ctStats(S[1][1]);
  const pc = m => ((m - 6371) / 6371 * 100).toFixed(1);
  $("sv-readR").innerHTML =
    `<span>${t("sv-read-pairs").replace("{n}", a.n)}</span>` +
    `<span class="f">${t("sv-read-uncorrected").replace("{v}", a.med.toFixed(0)).replace("{pc}", pc(a.med))}</span>` +
    `<span class="g">${t("sv-read-k").replace("{v}", b.med.toFixed(0)).replace("{pc}", pc(b.med))}</span>` +
    `<span>${t("sv-read-infinity")}</span>`;
}
function ctStats(a){
  const v = a.slice().sort((x, y) => x - y), n = v.length;
  const q = p => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
                   return v[lo] + (v[hi] - v[lo]) * (i - lo); };
  const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
  /* MOUSTACHES DE TUKEY, 1,5 IQR, et les points au-dela dessines un par un.
     Sans cela un seul cas rate a 126' etirerait l'axe et ecraserait les quatre
     boites : on ne verrait plus rien, et surtout pas les aberrants, qui sont
     la partie interessante. */
  const lo = v.find(x => x >= q1 - 1.5 * iqr), hi = v.filter(x => x <= q3 + 1.5 * iqr).pop();
  return { n:n, q1:q1, q3:q3, med:q(0.5), lo:lo, hi:hi,
           out:v.filter(x => x < lo || x > hi),
           mean:v.reduce((s, x) => s + x, 0) / n };
}

export { svTabZen, svFigR, svReadR, svRadii, SV_ZEN, SV_TRI, ctStats, SURV, SURV_LVL, SURV_TRI, SURVC, survFace, survExcess, survDrawnSigma, survCR, drawSurvLevel, drawSurvTri, survTables };
