// Moteur de l'onglet azim, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html L25631-26322) par research/port_legacy_js.py :
// figures canvas, tables, expérience, écouteurs. Il cherche ses hôtes par
// id dans le document (flux verbatim src/data/prose/azim.js) et n'expose
// que wire()/draw()/stop(). Le legacy lisait #radius/#kcoef/#refr (le
// formulaire global de l'onglet sim) : ici ces lectures retombent sur les
// valeurs par défaut de la page (R = 6371 km, k = 0.13) quand l'élément
// n'existe pas -- voir legacy-helpers.js.
import { setupCanvas, niceLen } from "../../core/canvas.js";
import { $, DEG, RAD, fillPresetSelect, fmtAngle, fmtDist, fmtDiff, expNum, dipSetRate, dipHm } from "../../core/legacy-helpers.js";
import { OBS } from "../../core/ephemeris.js";
import { seisAE, seisDelta, SEIS_STATIONS, SEIS_KM_PER_DEG } from "../seis/logic.js";
import { COASTS } from "../../data/coasts.js";
import { twiwUnit } from "../twi/logic.js";
import { makeT } from "../../core/i18n.js";
import { makeAE } from "../../core/aeproj.js";
import { drawAEMap } from "../../core/aemap.js";
const AZIM_MAP = makeAE({ rot: 180 });   // = seisAE à l'écran (cx + x·sc, cy + y·sc)
const SRAD = (d) => d * Math.PI / 180;

let t = (k) => k;

const AZIM_CASES = {
  dec: { btn:"azimCaseDec", Y:2026, M:12, D:21, h:12, mi:0,  s:0,
         label:"21 December 2026, 12:00:00 UTC" },
  jun: { btn:"azimCaseJun", Y:2026, M:6,  D:21, h:12, mi:0,  s:0,
         label:"21 June 2026, 12:00:00 UTC" },
  ecl: { btn:"azimCaseEcl", Y:2026, M:8,  D:12, h:17, mi:45, s:53.3,
         label:"12 August 2026, 17:45:53.3 UTC" },
};
const AZIM = { case:"dec", body:"sun", t:0, playing:false, last:0 };
// PUBLISHED, not computed. Espenak, greatest eclipse of 2026 Aug 12 [3].
const AZIM_ECL_PUB = {
  lat: 65 + 13.4/60, lon: -(25 + 13.7/60),
  alt: 25.8, az: 248.4, sunDec: 14 + 48/60 + 4.5/3600, moonDec: 15 + 36/60 + 58.5/3600,
  Y:2026, M:8, D:12, h:17, mi:45, s:53.3, dT: 72.4,
};
// One colour per station, matched between the two canvases and the readout strip.
const AZIM_COL = ["#1d4ed8","#c2410c","#6d28d9","#0f766e","#a16207","#be185d","#0369a1"];
const AZIM_MON = ["mon-jan","mon-feb","mon-mar","mon-apr","mon-may","mon-jun","mon-jul","mon-aug","mon-sep","mon-oct","mon-nov","mon-dec"];

const azimWrap180 = d => ((d + 540) % 360) - 180;
const azimLat = v => `${Math.abs(v).toFixed(2)}\u00b0 ${t(v < 0 ? "compass-S" : "compass-N")}`;
const azimLon = v => `${Math.abs(v).toFixed(2)}\u00b0 ${t(v < 0 ? "compass-W" : "compass-E")}`;
const azimKm  = v => Math.round(v).toLocaleString("en-US") + " km";

// JD -> calendar, Meeus 7. Seconds are FLOORED, not rounded: rounding shows a
// ":60" once a minute, and this readout is a clock, not a measurement.
function azimFromJD(jd){
  const z = Math.floor(jd + 0.5), f = jd + 0.5 - z;
  let A = z;
  if(z >= 2299161){ const al = Math.floor((z - 1867216.25)/36524.25); A = z + 1 + al - Math.floor(al/4); }
  const B = A + 1524, C = Math.floor((B - 122.1)/365.25), Dd = Math.floor(365.25*C),
        E = Math.floor((B - Dd)/30.6001);
  const day = B - Dd - Math.floor(30.6001*E) + f;
  const M = E < 14 ? E - 1 : E - 13, Y = M > 2 ? C - 4716 : C - 4715;
  const d = Math.floor(day), hr = (day - d)*24, h = Math.floor(hr);
  const mi = Math.floor((hr - h)*60), s = Math.floor(((hr - h)*60 - mi)*60);
  return `${d} ${t(AZIM_MON[M-1])} ${Y}, ${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}` +
         `:${String(s).padStart(2,"0")} UTC`;
}

/* -- small 3-D helpers, local to this tab. twiwUnit is shared with twi. -- */
const azimDot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const azimCross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const azimNorm = v => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0]/L, v[1]/L, v[2]/L]; };

// Direction, on the seisAE map, of a bearing measured from that map's OWN north.
// See the handedness note in the header block above.
function azimMapDir(lat, lon, azDeg){
  const P = seisAE(lat, lon), L = Math.hypot(P.x, P.y) || 1;
  const nx = -P.x/L, ny = -P.y/L, ex = -ny, ey = nx;
  const a = SRAD(azDeg);
  return { x: nx*Math.cos(a) + ex*Math.sin(a), y: ny*Math.cos(a) + ey*Math.sin(a) };
}

function azimTriangle(rows){
  const up = rows.filter(r => r.up);
  if(up.length < 3) return null;
  let best = null;
  for(let i = 0; i < up.length; i++)
    for(let j = i+1; j < up.length; j++)
      for(let k = j+1; k < up.length; k++){
        const s = seisDelta(up[i].lat, up[i].lon, up[j].lat, up[j].lon)
                + seisDelta(up[j].lat, up[j].lon, up[k].lat, up[k].lon)
                + seisDelta(up[i].lat, up[i].lon, up[k].lat, up[k].lon);
        if(!best || s > best.s) best = { s, t:[up[i], up[j], up[k]] };
      }
  const T = best.t.map(r => ({ r, p: seisAE(r.lat, r.lon), d: azimMapDir(r.lat, r.lon, r.az) }));
  const V = [];
  for(let i = 0; i < 3; i++){
    const A = T[i], B = T[(i+1) % 3];
    const den = A.d.x*B.d.y - A.d.y*B.d.x;
    if(Math.abs(den) < 1e-9) return null;                 // parallel: no vertex
    const t = ((B.p.x - A.p.x)*B.d.y - (B.p.y - A.p.y)*B.d.x) / den;
    V.push({ x: A.p.x + t*A.d.x, y: A.p.y + t*A.d.y });
  }
  const sides = V.map((v, i) => {
    const w = V[(i+1) % 3];
    return Math.hypot(v.x - w.x, v.y - w.y) * SEIS_KM_PER_DEG;
  });
  return { T, V, sides, max: Math.max(...sides), offMap: V.some(v => Math.hypot(v.x, v.y) > 180) };
}

function azimState(){
  const C = AZIM_CASES[AZIM.case];
  const jd = OBS.jdFromUTC(C.Y, C.M, C.D, C.h, C.mi, C.s) + AZIM.t/24;
  const yr = 2000 + (jd - 2451545.0) / 365.25;
  const jdTT = jd + OBS.deltaT(yr) / 86400;
  const gs = OBS.sun(jdTT), gm = OBS.moon(jdTT);
  const subS = OBS.subPoint(gs.ra, gs.dec, jd);       // geocentric, as the theorem requires
  const subM = OBS.subPoint(gm.ra, gm.dec, jd);
  const moon = AZIM.body === "moon";
  const sub = moon ? subM : subS;
  const rows = SEIS_STATIONS.map((st, i) => {
    // topocentric Moon, geocentric Sun: the solar parallax is 8.8", which is below
    // anything this tab prints, while the lunar one is a degree
    const mtp = OBS.topocentric(gm.ra, gm.dec, gm.parallax, st.lat, st.lon, jd, 0);
    const mt = OBS.altaz(mtp.ra, mtp.dec, st.lat, st.lon, jd);
    const mg = OBS.altaz(gm.ra, gm.dec, st.lat, st.lon, jd);
    const hz = moon ? mt : OBS.altaz(gs.ra, gs.dec, st.lat, st.lon, jd);
    return Object.assign({}, st, {
      col: AZIM_COL[i % AZIM_COL.length],
      alt: hz.alt, az: hz.az, up: hz.alt > 0,
      bearing: OBS.greatCircle(st.lat, st.lon, sub.lat, sub.lon).az,
      flat: OBS.flatAzimuth(st.lat, st.lon, sub.lat, sub.lon),
      mAlt: mt.alt, mDAlt: mt.alt - mg.alt, mDAz: azimWrap180(mt.az - mg.az),
      mBear: OBS.greatCircle(st.lat, st.lon, subM.lat, subM.lon).az, mUp: mt.alt > 0,
    });
  });
  rows.forEach(r => { r.diff = azimWrap180(r.flat - r.bearing); });
  // the body's real distance, in EARTH RADII. Everything the globe panel draws --
  // ray directions, sight-line directions, the terminator -- is computed from this
  // rather than from a parallel-ray assumption, so the near-parallelism the reader
  // sees is a RESULT and not a drawing convention. Sun ~23,500 R, Moon ~60 R.
  const distR = (moon ? gm.distKM : gs.distAU * 149597870.7) / 6371;
  return { C, jd, moon, sub, subS, subM, rows, distR, gm, gs, tri: azimTriangle(rows),
           label: azimFromJD(jd), running: Math.abs(AZIM.t) > 1e-9,
           subGap: OBS.greatCircle(subS.lat, subS.lon, subM.lat, subM.lon).d };
}

/* L'état d'azimState pour UN observateur et un instant (grille du 10 janvier
   d'obs, 2026-09-27) : le Soleil, son point subsolaire géocentrique, sa
   hauteur et son azimut vus de l'observateur, les mêmes calculs qu'ici. */
export function azimObserverState(jd, obs){
  if(t("glyph-globe") === "glyph-globe") t = makeT(document.documentElement.lang || "en", "azim");   // azim pas encore monté
  const yr = 2000 + (jd - 2451545.0) / 365.25, jdTT = jd + OBS.deltaT(yr) / 86400;
  const gs = OBS.sun(jdTT), sub = OBS.subPoint(gs.ra, gs.dec, jd);
  const hz = OBS.altaz(gs.ra, gs.dec, obs.lat, obs.lon, jd);
  const row = Object.assign({}, obs, { col: obs.col || AZIM_COL[0], alt: hz.alt, az: hz.az, up: obs.up ?? hz.alt > 0,
    bearing: OBS.greatCircle(obs.lat, obs.lon, sub.lat, sub.lon).az, flat: OBS.flatAzimuth(obs.lat, obs.lon, sub.lat, sub.lon) });
  return { jd, moon: false, sub, subS: sub, rows: [row], distR: gs.distAU * 149597870.7 / 6371, gs, tri: null };
}

/* ---- a Sun or a Moon glyph, in canvas coordinates ---- */
function azimGlyph(ctx, x, y, r, moon){
  ctx.save();
  if(moon){
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
    ctx.fillStyle = "#dfe3e8"; ctx.fill();
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + r*0.6, y - r*0.25, r*0.8, 0, 7);
    ctx.fillStyle = "#475569"; ctx.globalAlpha = 0.35; ctx.fill();
  } else {
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.4;
    for(let i = 0; i < 8; i++){
      const a = i*Math.PI/4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a)*r*1.4, y + Math.sin(a)*r*1.4);
      ctx.lineTo(x + Math.cos(a)*r*2.0, y + Math.sin(a)*r*2.0);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
    ctx.fillStyle = "#f7c948"; ctx.fill();
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.3; ctx.stroke();
  }
  ctx.restore();
}

/* Ombrage exact du globe d'azim (2026-09-24) : un pixel par point de la face
   visible, éclairé si P·s > 1/d. Tampon réutilisé, taille CSS (pas DPR). */
let azimBuf = null;
function azimShade(ctx, cx, cy, R, e, n, k, s, distR, moon){
  const D = Math.max(2, Math.round(2*R));
  if(!azimBuf || azimBuf.width !== D){ azimBuf = document.createElement("canvas"); azimBuf.width = azimBuf.height = D; }
  const b = azimBuf.getContext("2d"); if(!b || !b.createImageData) return;
  const img = b.createImageData(D, D), px = img.data, lim = 1/distR;
  const day = moon ? [242, 244, 247] : [253, 248, 236], night = moon ? [150, 160, 176] : [168, 176, 190];
  for(let j = 0; j < D; j++){
    const bb = 1 - 2*(j + 0.5)/D;
    for(let i = 0; i < D; i++){
      const a = 2*(i + 0.5)/D - 1, qq = a*a + bb*bb, o = (j*D + i)*4;
      if(qq > 1){ px[o+3] = 0; continue; }
      const c = Math.sqrt(1 - qq);
      const Px = a*e[0] + bb*n[0] + c*k[0], Py = a*e[1] + bb*n[1] + c*k[1], Pz = a*e[2] + bb*n[2] + c*k[2];
      const lit = Math.max(0, Math.min(1, (Px*s[0] + Py*s[1] + Pz*s[2] - lim)/0.015 + 0.5));
      const limb = 0.82 + 0.18*c;                          // assombrissement vers le bord
      for(let q = 0; q < 3; q++) px[o+q] = (night[q] + (day[q] - night[q])*lit)*limb;
      px[o+3] = 255;
    }
  }
  b.putImageData(img, 0, 0);
  const g = ctx.createRadialGradient(cx, cy, R*0.98, cx, cy, R*1.09);
  g.addColorStop(0, "rgba(106,169,216,0.45)"); g.addColorStop(1, "rgba(106,169,216,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R*1.09, 0, 7); ctx.arc(cx, cy, R, 0, 7, true); ctx.fill();
  ctx.drawImage(azimBuf, cx - R, cy - R, 2*R, 2*R);
}

/* ---- panel A: the globe from the side, with the rays drawn ---- */
// cv0 : un autre canvas (la grille du 10 janvier d'obs, 2026-09-27) ; sans lui, celui de l'onglet
export function drawAzimGlobe(S, cv0){
  const cv = cv0 || $("azimGlobe"); if(!cv || (!cv0 && $("tab-azim").hidden)) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const top = 28, bot = H - 10;
  const R = Math.max(18, Math.min((W - 30)/3.1, (bot - top)/2));
  const cx = W - R - 14, cy = (top + bot)/2;          // globe right, beam coming in from the left
  // Camera 58 deg round from the sub-point and tilted a little north of it, so the
  // sub-point sits inside the left half of the visible disc and the sphere reads as
  // a sphere rather than as a circle. Nothing in the argument depends on the choice.
  const camLat = Math.max(-40, Math.min(40, S.sub.lat*0.35 + 12));
  const camLon = S.sub.lon + 58;
  const k = twiwUnit(camLat, camLon);
  const e = [-Math.sin(SRAD(camLon)), Math.cos(SRAD(camLon)), 0];
  const n = azimCross(k, e);
  const P2 = V => ({ x: cx + azimDot(V, e)*R, y: cy - azimDot(V, n)*R, front: azimDot(V, k) > 0 });
  const s = twiwUnit(S.sub.lat, S.sub.lon);
  let ax = azimCross(k, s);
  if(Math.hypot(ax[0], ax[1], ax[2]) < 1e-6) ax = azimCross(k, [0, 0, 1]);
  const a1 = azimNorm(ax), a2 = azimCross(s, a1);
  // the terminator: the great circle P.s = 0, exact, no photometry
  const termPath = () => {
    ctx.beginPath();
    for(let i = 0; i <= 180; i++){
      const w = i/180*2*Math.PI;
      const P = [a1[0]*Math.cos(w) + a2[0]*Math.sin(w),
                 a1[1]*Math.cos(w) + a2[1]*Math.sin(w),
                 a1[2]*Math.cos(w) + a2[2]*Math.sin(w)];
      const q = P2(P); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
    }
    ctx.closePath();
  };
  const spq = P2(s);
  // JOUR ET NUIT, EXACTS (2026-09-24). Le legacy refusait tout ombrage : la
  // région éclairée d'une sphère vue de biais est bornée par la moitié avant de
  // l'ellipse du terminateur ET un arc de la silhouette, et tout remplissage bon
  // marché (ellipse, demi-plan) est faux à certaines positions -- une figure
  // « convaincante tout en étant fausse ». La règle tient : ici l'ombrage est
  // calculé PIXEL PAR PIXEL, comme dans twi, avec le vrai terminateur d'un
  // astre à distance finie (éclairé si P·s > 1/d, le petit cercle décrit plus
  // bas -- un degré de décalage pour la Lune). Assombrissement vers le bord et
  // liseré d'atmosphère : décor, rien ne se lit dessus.
  azimShade(ctx, cx, cy, R, e, n, k, s, S.distR, S.moon);
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
  if(typeof COASTS !== "undefined"){
    ctx.strokeStyle = "rgba(21,26,33,.40)"; ctx.lineWidth = 0.8;
    for(const L of COASTS){
      let x = L[0], y = L[1], prev = P2(twiwUnit(y/10, x/10)), open = false;
      ctx.beginPath();
      for(let i = 2; i < L.length; i += 2){
        x += L[i]; y += L[i+1];
        const p = P2(twiwUnit(y/10, x/10));
        if(p.front && prev.front){
          if(open) ctx.lineTo(p.x, p.y);
          else { ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); open = true; }
        } else open = false;
        prev = p;
      }
      ctx.stroke();
    }
  }
  // the terminator: the great circle P.s = 0, front half only. Exact.
  ctx.strokeStyle = "rgba(90,80,60,.6)"; ctx.lineWidth = 1.1; ctx.setLineDash([4,3]);
  // The true terminator of a body at finite distance is P.s = 1/d, a small circle
  // of angular radius arccos(1/d) about the sub-point -- not the great circle
  // P.s = 0. Measured: the terminator's angular radius is 89.9975 deg for the Sun
  // and 89.00 deg for the Moon, so the Moon's is a full degree off the great circle
  // -- not nothing, and computed rather than assumed.
  const gTerm = Math.acos(Math.max(-1, Math.min(1, 1/S.distR)));
  const cgT = Math.cos(gTerm), sgT = Math.sin(gTerm);
  let tOpen = false; ctx.beginPath();
  for(let i = 0; i <= 240; i++){
    const w = i/240*2*Math.PI;
    const P = [cgT*s[0] + sgT*(a1[0]*Math.cos(w) + a2[0]*Math.sin(w)),
               cgT*s[1] + sgT*(a1[1]*Math.cos(w) + a2[1]*Math.sin(w)),
               cgT*s[2] + sgT*(a1[2]*Math.cos(w) + a2[2]*Math.sin(w))];
    const q = P2(P);
    if(q.front){ tOpen ? ctx.lineTo(q.x, q.y) : (ctx.moveTo(q.x, q.y), tOpen = true); }
    else tOpen = false;
  }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7);
  ctx.strokeStyle = "#8a7f63"; ctx.lineWidth = 1.4; ctx.stroke();

  // ---- the rays. Parallel in 3-D; orthographic projection keeps them parallel on
  // the screen exactly. The u = 0 ray lands on the sub-point by construction.
  const rayCol = S.moon ? "#64748b" : "#e0a52a";
  const BODY = [s[0]*S.distR, s[1]*S.distR, s[2]*S.distR];      // real position, Earth radii
  [-0.92, -0.66, -0.4, -0.14, 0.14, 0.4, 0.66, 0.92].forEach(u => {
    const hz = Math.sqrt(Math.max(0, 1 - u*u));
    const end = [a1[0]*u + s[0]*hz, a1[1]*u + s[1]*hz, a1[2]*u + s[2]*hz];
    // the ray is the line from the BODY to that point, not a parallel offset. For
    // the Sun the fan is ~18" wide across the planet and looks parallel because it
    // is; for the Moon it reaches ~2 deg and you can just see it converge.
    const d = azimNorm([BODY[0]-end[0], BODY[1]-end[1], BODY[2]-end[2]]);
    const start = [end[0] + d[0]*2.6, end[1] + d[1]*2.6, end[2] + d[2]*2.6];
    const A = P2(start), B = P2(end);
    ctx.strokeStyle = rayCol; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx/L, uy = dy/L, px = -uy, py = ux;
    ctx.beginPath();
    ctx.moveTo(B.x, B.y);
    ctx.lineTo(B.x - ux*7 + px*3.2, B.y - uy*7 + py*3.2);
    ctx.lineTo(B.x - ux*7 - px*3.2, B.y - uy*7 - py*3.2);
    ctx.closePath(); ctx.fillStyle = rayCol; ctx.fill();
  });
  // the central ray continued through the globe: ray, sub-point and centre in one
  // straight line, which IS the theorem
  ctx.setLineDash([5,4]); ctx.strokeStyle = "#8a7f63"; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(spq.x, spq.y); ctx.lineTo(cx, cy); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(cx, cy, 2.6, 0, 7); ctx.fillStyle = "#8a7f63"; ctx.fill();

  // ---- great-circle arcs from every station that can see the body, to the sub-point
  S.rows.forEach(r => {
    const Pst = twiwUnit(r.lat, r.lon), q = P2(Pst);
    if(r.up){
      const om = Math.acos(Math.max(-1, Math.min(1, azimDot(Pst, s))));
      if(om > 1e-6){
        ctx.strokeStyle = r.col; ctx.lineWidth = 1.7;
        let open = false; ctx.beginPath();
        for(let i = 0; i <= 48; i++){
          const f = i/48, w1 = Math.sin((1-f)*om)/Math.sin(om), w2 = Math.sin(f*om)/Math.sin(om);
          const P = [Pst[0]*w1 + s[0]*w2, Pst[1]*w1 + s[1]*w2, Pst[2]*w1 + s[2]*w2];
          const p = P2(P);
          if(p.front){ open ? ctx.lineTo(p.x, p.y) : (ctx.moveTo(p.x, p.y), open = true); }
          else open = false;
        }
        ctx.stroke();
      }
    }
    // ...and, from the station itself, the LINE OF SIGHT: a straight dashed line
    // leaving the observer in the direction of the body and running off into
    // space. This is the line an eye actually follows, and it is the answer to
    // the objection the arcs invite -- "nobody looks along a curve". Nobody does.
    // The arc is the ground track of the vertical plane, the sight line is the
    // look direction, and they leave the station in the same plane.
    // These sight lines are PARALLEL to each other and to the incoming rays, for
    // the same reason: one distant body, one direction in space. What differs
    // from station to station is not the direction but the LOCAL HORIZON it is
    // measured against -- which is the whole of why one Sun gives every observer
    // a different altitude and a different azimuth.
    if(r.up && q.front){
      // the true look direction from THIS station to the body, distance included
      const dv = azimNorm([BODY[0]-Pst[0], BODY[1]-Pst[1], BODY[2]-Pst[2]]);
      const tip = [Pst[0] + dv[0]*0.85, Pst[1] + dv[1]*0.85, Pst[2] + dv[2]*0.85];
      const T = P2(tip);
      ctx.save();
      ctx.strokeStyle = r.col; ctx.lineWidth = 1.2; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(T.x, T.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    if(!q.front) return;
    ctx.beginPath(); ctx.arc(q.x, q.y, 4, 0, 7);
    if(r.up){ ctx.fillStyle = r.col; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; }
    else { ctx.fillStyle = "#fdfdfc"; ctx.fill(); ctx.strokeStyle = r.col; ctx.lineWidth = 1.4; }
    ctx.stroke();
  });
  if(spq.front) azimGlyph(ctx, spq.x, spq.y, 5, S.moon);

  ctx.fillStyle = "#5b6470"; ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(t("glyph-globe"), 6, 15);
}

/* ---- panel B: the same instant on the flat map ---- */
export function drawAzimFlat(S, cv0){
  const cv = cv0 || $("azimFlat"); if(!cv || (!cv0 && $("tab-azim").hidden)) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const top = 28, bot = H - 10;
  const R = Math.max(18, Math.min((W - 30)/2, (bot - top)/2));
  const cx = W/2, cy = (top + bot)/2, sc = R/180;
  const M = p => ({ x: cx + p.x*sc, y: cy + p.y*sc });
  const MP = (lat, lon) => M(seisAE(lat, lon));
  // epic18 : la carte polaire du moteur commun avec ses terres (seisAE = makeAE tournée de 180° à l'écran)
  drawAEMap(ctx, AZIM_MAP, { cx, cy, Rpx: R, grid: 0, rim: false, colors: { coast: "rgba(21,26,33,.40)" } });
  if(S.tri){
    ctx.save();
    ctx.beginPath();
    S.tri.V.forEach((v, i) => { const q = M(v); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
    ctx.closePath();
    ctx.fillStyle = "rgba(180,83,9,.13)"; ctx.fill();
    ctx.strokeStyle = "rgba(180,83,9,.5)"; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
    ctx.stroke(); ctx.setLineDash([]);
    // ce que c'est, sur la figure même (propriétaire, 2026-09-27 : « j'ai du mal à comprendre la zone ») :
    // là où trois demi-droites se croisent ; sur une carte juste, un seul point
    const c = S.tri.V.reduce((acc, v) => ({ x: acc.x + v.x / 3, y: acc.y + v.y / 3 }), { x: 0, y: 0 });
    if(Math.hypot(c.x, c.y) < 170){
      const q = M(c), l1 = t("glyph-tri-1"), l2 = t("glyph-tri-2");
      ctx.font = "600 10px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 8;
      const x = Math.max(w / 2 + 2, Math.min(W - w / 2 - 2, q.x));
      ctx.fillStyle = "rgba(253,253,252,.85)"; ctx.fillRect(x - w / 2, q.y - 13, w, 26);
      ctx.fillStyle = "#9a3412"; ctx.fillText(l1, x, q.y - 6);
      ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillText(l2, x, q.y + 6);
    }
    ctx.restore();
  }
  // every station is drawn; only the ones that can see the body carry a half-line
  S.rows.forEach(r => {
    const P = seisAE(r.lat, r.lon), a = M(P);
    if(r.up){
      const d = azimMapDir(r.lat, r.lon, r.az);
      let cut = 400;
      for(let t = 0; t <= 400; t += 2){
        if(Math.hypot(P.x + t*d.x, P.y + t*d.y) > 180){ cut = t; break; }
      }
      const b = M({ x: P.x + cut*d.x, y: P.y + cut*d.y });
      const c = M({ x: P.x + 400*d.x, y: P.y + 400*d.y });
      ctx.strokeStyle = r.col; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.setLineDash([2,3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.beginPath(); ctx.arc(a.x, a.y, 4, 0, 7);
    if(r.up){ ctx.fillStyle = r.col; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; }
    else { ctx.fillStyle = "#fdfdfc"; ctx.fill(); ctx.strokeStyle = r.col; ctx.lineWidth = 1.4; }
    ctx.stroke();
  });
  const X = MP(S.sub.lat, S.sub.lon);
  azimGlyph(ctx, X.x, X.y, 6, S.moon);
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7);
  ctx.strokeStyle = "#8a7f63"; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = "#5b6470"; ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(t("glyph-flat"), 6, 15);
}

function azimReadsFill(S){
  const el = $("azimReads"); if(!el) return;
  const R = (dot, label, val, sub) =>
    `<span class="r">${dot ? `<span class="dot" style="background:${dot}"></span>` : ""}` +
    `<b>${label}</b> ${val}${sub ? ` <span class="sub">${sub}</span>` : ""}</span>`;
  const up = S.rows.filter(r => r.up);
  const body = t(S.moon ? "body-moon" : "body-sun");
  let out =
    R("", t("reads-instant"), S.label,
      S.running ? t("reads-running") : t("reads-fixed")) +
    R(S.moon ? "#64748b" : "#e0a52a", t("reads-overhead").replace("{body}", body),
      `${azimLat(S.sub.lat)} ${azimLon(S.sub.lon)}`,
      t(S.moon ? "reads-geo-moon" : "reads-geo-sun")) +
    R("", t("reads-stations"), `${up.length} of ${S.rows.length}`,
      t("reads-hollow"));
  if(S.tri)
    out += R("#b45309", t("reads-triangle"),
             t("reads-triangle-val").replace("{km}", azimKm(S.tri.max)),
             `${S.tri.T.map(tt => tt.r.c).join(", ")}${S.tri.offMap ? t("reads-offmap") : ""}`);
  out += up.map(r => R(r.col, r.c, `${r.bearing.toFixed(1)}\u00b0`,
                       t("reads-flat-sub").replace("{v}", r.flat.toFixed(1)))).join("");
  el.innerHTML = out;
}

function azimTables(S){
  const tb = $("azimTbl") && $("azimTbl").querySelector("tbody");
  if(tb) tb.innerHTML = S.rows.map(r => {
    const dim = r.up ? "" : ' style="opacity:.55"';
    return `<tr${dim}><td style="text-align:left"><b>${r.c}</b>&nbsp; ${r.n}</td>` +
      `<td>${r.alt.toFixed(1)}\u00b0${r.alt > 0 ? "" : t("tbl-below-horizon-suffix")}</td>` +
      `<td class="hot">${r.bearing.toFixed(2)}\u00b0</td>` +
      `<td class="cold">${r.flat.toFixed(2)}\u00b0</td>` +
      `<td><b>${r.diff > 0 ? "+" : "\u2212"}${Math.abs(r.diff).toFixed(2)}\u00b0</b></td></tr>`;
  }).join("");

  // Computed ONCE and cached. This table never follows the clock or the body
  // toggle: the published column exists for one instant and one body only.
  const et = $("azimEclTbl") && $("azimEclTbl").querySelector("tbody");
  if(et && !azimTables._ecl){
    const P = AZIM_ECL_PUB;
    const jd = OBS.jdFromUTC(P.Y, P.M, P.D, P.h, P.mi, P.s);
    const yr = 2000 + (jd - 2451545.0) / 365.25;
    const dT = OBS.deltaT(yr);
    const g = OBS.sun(jd + dT/86400), gm = OBS.moon(jd + dT/86400);
    const hz = OBS.altaz(g.ra, g.dec, P.lat, P.lon, jd);
    const sub = OBS.subPoint(g.ra, g.dec, jd), subM = OBS.subPoint(gm.ra, gm.dec, jd);
    const bear = OBS.greatCircle(P.lat, P.lon, sub.lat, sub.lon).az;
    const row = (q, pub, mine, dif) =>
      `<tr><td style="text-align:left">${q}</td><td>${pub}</td>` +
      `<td class="hot">${mine}</td><td>${dif}</td></tr>`;
    azimTables._ecl =
      row(t("ecl-row1"), `+${P.sunDec.toFixed(4)}\u00b0`, `+${g.dec.toFixed(4)}\u00b0`,
          `${Math.abs((g.dec - P.sunDec)*3600).toFixed(1)}\u2033`) +
      row(t("ecl-row2"), `+${P.moonDec.toFixed(4)}\u00b0`, `+${gm.dec.toFixed(4)}\u00b0`,
          `${Math.abs((gm.dec - P.moonDec)*3600).toFixed(1)}\u2033`) +
      row(t("ecl-row3"), `${P.alt.toFixed(1)}\u00b0`, `${hz.alt.toFixed(3)}\u00b0`,
          `${Math.abs(hz.alt - P.alt).toFixed(3)}\u00b0`) +
      row(t("ecl-row4"), `<b>${P.az.toFixed(1)}\u00b0</b>`, `<b>${hz.az.toFixed(3)}\u00b0</b>`,
          `<b>${Math.abs(hz.az - P.az).toFixed(3)}\u00b0</b>`) +
      row(t("ecl-row5"), t("ecl-notpub"),
          `${bear.toFixed(3)}\u00b0`,
          t("ecl-from-azimuth").replace("{v}", Math.abs(bear - hz.az).toFixed(4))) +
      row(t("ecl-row6"), t("ecl-notpub"),
          t("ecl-apart").replace("{km}", azimKm(OBS.greatCircle(sub.lat, sub.lon, subM.lat, subM.lon).d)),
          t("ecl-eclipse-note")) +
      row(t("ecl-row7"), `${P.dT.toFixed(1)} s`, `${dT.toFixed(1)} s`,
          t("ecl-dt-suffix").replace("{v}", Math.abs(dT - P.dT).toFixed(1)));
  }
  if(et && azimTables._ecl && !et.innerHTML) et.innerHTML = azimTables._ecl;

  // Every station, not only the ones with the Moon up: the parallax displacement
  // is a geometric quantity either way, and hiding the rows where the Moon has set
  // would make the residue in the third column look smaller by dropping cases.
  const mt = $("azimMoonTbl") && $("azimMoonTbl").querySelector("tbody");
  if(mt) mt.innerHTML = S.rows.map(r =>
      `<tr${r.mUp ? "" : ' style="opacity:.55"'}><td style="text-align:left"><b>${r.c}</b>&nbsp; ${r.n}` +
      `${r.mUp ? "" : t("tbl-moon-below")}</td>` +
      `<td class="cold">${r.mDAlt.toFixed(3)}\u00b0 = ${(r.mDAlt*60).toFixed(1)}\u2032</td>` +
      `<td class="hot">${r.mDAz > 0 ? "+" : "\u2212"}${Math.abs(r.mDAz*3600).toFixed(1)}\u2033</td>` +
      `<td>${r.mBear.toFixed(3)}\u00b0</td></tr>`).join("");
}

function azimExperiment(S){
  const out = $("azim9out"), v = $("azim9v");
  if(!out || !v) return;
  const body = t(S.moon ? "body-moon" : "body-sun");
  const up = S.rows.filter(r => r.up).slice().sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  if(!up.length){
    out.innerHTML = t("exp9-none").replace("{body}", body);
    v.innerHTML = ""; return;
  }
  const worst = up[0], best = up[up.length - 1];
  out.innerHTML = t("exp9-out")
    .replace("{label}", S.label).replace("{worstName}", worst.n).replace("{body}", body)
    .replace("{worstBearing}", worst.bearing.toFixed(1)).replace("{worstFlat}", worst.flat.toFixed(1))
    .replace("{worstDiff}", Math.abs(worst.diff).toFixed(1)).replace("{bestName}", best.n)
    .replace("{bestDiff}", Math.abs(best.diff).toFixed(1))
    .replace("{extra}", Math.abs(best.diff) < 5 ? t("exp9-extra") : "");
  v.innerHTML = Math.abs(worst.diff) > 90
    ? t("exp9-verd-big").replace("{worstC}", worst.c).replace("{v}", Math.abs(worst.diff).toFixed(0))
    : t("exp9-verd-small").replace("{v}", Math.abs(worst.diff).toFixed(1)).replace("{worstC}", worst.c);
}

/* ============================================================================
   PARALLAX AS A RULER -- added v79. The tab spends its first half explaining
   why parallax may be IGNORED (it is radial, so it leaves the bearing alone).
   This half stops ignoring it: the altitude it shifts is the oldest measurement
   of the Moon's distance there is.

   THE PAIR IS CHOSEN BY A RULE, NOT BY HAND, and the rule has a condition the
   plan for this section did not have: BOTH stations must have the body above
   the horizon. The plan proposed KONO <-> SUR at the eclipse instant, but SUR
   has the Moon 22 deg BELOW the horizon then. An angle between one station
   looking at the Moon and one looking at the ground is computable and is not a
   measurement, and this page must not print it as one. Among the pairs that
   both see it, the one whose sight lines open widest.

   THE RECONSTRUCTION IS d/R = b / (R sin theta), where b is the component of
   the baseline ACROSS the line of sight and theta the angle between the two
   topocentric directions. Checked against the ephemeris at the three documented
   instants: 57.60 vs 57.602 (eclipse), 60.65 vs 60.597 (June), 56.98 vs 57.193
   (December). December is the worst because the baseline there is badly
   foreshortened (b = 1.68 R out of a 1.81 R chord) and the Moon is 1.7 deg up at
   KONO, where the ellipsoid bites hardest. Nothing is fitted; the residue is the
   flattening, same as the arcsecond column above.

   THE 0.1 % BETWEEN THE TWO RECONSTRUCTIONS IS NOT NOISE AND MUST NOT BE
   "FIXED". 1/sin(pi) uses the EQUATORIAL radius 6378.14 (that is the definition
   of horizontal parallax, and it is what OBS.moon computes), while d/R is quoted
   in MEAN radii 6371. 6378.14/6371 = 1.00112, which is the whole gap. The page
   says so in az-p12.

   THE SUN IS THE NEGATIVE WITNESS and is computed here and nowhere else on the
   tab -- v75 deliberately kept the Sun geocentric because 8.8" is below anything
   the tab printed. This section prints it, on purpose, because a method that
   returned a distance for every body would be measuring itself.
   ========================================================================== */

const AZIM_LAMPS = [3000, 5000, 8000];        // km above the disc; swept, never fitted

const azimRD = (ra, dec) => { const c = Math.cos(SRAD(dec));
  return [c*Math.cos(SRAD(ra)), c*Math.sin(SRAD(ra)), Math.sin(SRAD(dec))]; };
// A station's position vector in EARTH RADII, in the same equatorial frame as
// azimRD: the zenith's "right ascension" is the local sidereal time.
const azimStVec = (lat, lon, jd) => azimRD(OBS.gmst(jd) + lon, lat);

function azimPairFor(S, body){
  const jd = S.jd, g = body === "moon" ? S.gm : S.gs;
  const par = body === "moon" ? g.parallax
            : Math.asin(6378.14 / (g.distAU * 149597870.7)) * 180 / Math.PI;
  const s = azimRD(g.ra, g.dec);
  const V = SEIS_STATIONS.map(st => {
    const t = OBS.topocentric(g.ra, g.dec, par, st.lat, st.lon, jd, 0);
    return { st, u: azimRD(t.ra, t.dec), P: azimStVec(st.lat, st.lon, jd),
             alt: OBS.altaz(t.ra, t.dec, st.lat, st.lon, jd).alt };
  });
  let best = null;
  for(let i = 0; i < V.length; i++)
    for(let j = i + 1; j < V.length; j++){
      const A = V[i], B = V[j];
      if(A.alt <= 0 || B.alt <= 0) continue;            // both must SEE it
      const th = Math.acos(Math.min(1, Math.max(-1, azimDot(A.u, B.u)))) * 180 / Math.PI;
      if(best && th <= best.th) continue;
      const b = [B.P[0]-A.P[0], B.P[1]-A.P[1], B.P[2]-A.P[2]];
      const al = azimDot(b, s);
      best = { A: A.st, B: B.st, th, par,
               bperp: Math.hypot(b[0]-al*s[0], b[1]-al*s[1], b[2]-al*s[2]),
               base: OBS.greatCircle(A.st.lat, A.st.lon, B.st.lat, B.st.lon).d };
    }
  if(best) best.dR = best.bperp / Math.sin(SRAD(best.th));
  return best;
}

function azimParTables(S){
  const m = azimPairFor(S, "moon"), sn = azimPairFor(S, "sun");
  const tb = $("azimParTbl") && $("azimParTbl").querySelector("tbody");
  if(tb){
    const row = (q, v, w) =>
      `<tr><td style="text-align:left">${q}</td><td class="hot">${v}</td>` +
      `<td style="text-align:left">${w}</td></tr>`;
    tb.innerHTML = !m
      ? `<tr><td colspan="3" style="text-align:left">${t("par-none")}</td></tr>`
      : row(t("par-row-pair"),
            `${m.A.c} \u2194 ${m.B.c}`,
            t("par-row-pair-note")) +
        row(t("par-row-dist"), t("par-dist-val").replace("{km}", azimKm(m.base)),
            t("par-row-dist-note")) +
        row(t("par-row-baseline"), m.bperp.toFixed(3) + " R",
            t("par-row-baseline-note")) +
        row(t("par-row-shift"),
            `${(m.th*60).toFixed(1)}\u2032 = ${m.th.toFixed(3)}\u00b0`,
            t("par-row-shift-note")) +
        row(t("par-row-recon"), t("par-row-recon-val").replace("{v}", m.dR.toFixed(2)),
            t("par-row-recon-note")) +
        row(t("par-row-horiz"),
            `${(1/Math.sin(SRAD(m.par))).toFixed(2)} R`,
            t("par-row-horiz-note").replace("{v}", (m.par*60).toFixed(1))) +
        row(t("par-row-ephem"),
            `${azimKm(S.gm.distKM)} = ${(S.gm.distKM/6371).toFixed(2)} R`,
            t("par-row-ephem-note")) +
        (sn ? row(t("par-row-sun"),
                  t("par-row-sun-val").replace("{v}", (sn.th*3600).toFixed(1)).replace("{km}", azimKm(sn.base)),
                  t("par-row-sun-note")) : "");
  }

  // The lamp table sweeps H rather than picking one: rule 2, and a swept
  // parameter cannot be accused of having been fitted.
  const lt = $("azimLampTbl") && $("azimLampTbl").querySelector("tbody");
  if(lt) lt.innerHTML = S.rows.map(r => {
    const cells = AZIM_LAMPS.map(H =>
      `<td class="cold">${OBS.flatAltitude(r.lat, r.lon, S.subM.lat, S.subM.lon, H).toFixed(1)}\u00b0</td>`).join("");
    return `<tr${r.mUp ? "" : ' style="opacity:.55"'}><td style="text-align:left"><b>${r.c}</b>&nbsp; ${r.n}</td>` +
           cells +
           `<td class="hot">${r.mAlt.toFixed(1)}\u00b0${r.mUp ? "" : t("lamp-set")}</td></tr>`;
  }).join("");
}

function azimExperiment9b(S){
  const out = $("azim9bout"), v = $("azim9bv");
  if(!out || !v) return;
  const m = azimPairFor(S, "moon"), sn = azimPairFor(S, "sun");
  if(!m){
    out.innerHTML = t("exp9b-none");
    v.innerHTML = ""; return;
  }
  const diam = 2 * S.gm.sd, down = S.rows.filter(r => !r.mUp).length;
  out.innerHTML = t("exp9b-out")
    .replace("{label}", S.label).replace("{An}", m.A.n).replace("{Bn}", m.B.n)
    .replace("{km}", azimKm(m.base)).replace("{th}", (m.th*60).toFixed(1))
    .replace("{ratio}", (m.th/diam).toFixed(1)).replace("{dR}", m.dR.toFixed(2))
    .replace("{ephemR}", (S.gm.distKM/6371).toFixed(2)) +
    (sn ? t("exp9b-sun-note").replace("{v}", (sn.th*3600).toFixed(1)) : "");
  const lamp = AZIM_LAMPS.map(H => ({ H, err: S.rows.reduce((a, r) =>
      Math.max(a, Math.abs(OBS.flatAltitude(r.lat, r.lon, S.subM.lat, S.subM.lon, H) - r.mAlt)), 0) }))
    .sort((a, b) => a.err - b.err)[0];
  v.innerHTML = t("exp9b-verd").replace("{H}", lamp.H.toLocaleString("en-US")).replace("{err}", lamp.err.toFixed(1)) +
    (down ? t("exp9b-verd-down").replace("{down}", down).replace("{total}", S.rows.length) : ".");
}

function azimPaint(S){
  azimReadsFill(S); drawAzimGlobe(S); drawAzimFlat(S); azimTables(S); azimExperiment(S);
  azimParTables(S); azimExperiment9b(S);
}
function drawAzim(){
  if($("tab-azim").hidden) return;
  azimSyncButtons();
  azimPaint(azimState());
  // the loop dies when the tab is hidden; clear the stale stamp and restart it
  if(azimRAF === null){ AZIM.last = 0; azimRAF = requestAnimationFrame(azimLoop); }
}

// ---- the loop. Same shape as twiLoop, and for the same reasons: a rAF callback
// left running behind a hidden tab draws into zero-width canvases, and one that
// resumes on a stale timestamp jumps by however long the reader was away.
let azimRAF = null;
/* CADENCE (2026-09-24) : ~30 images/s pour les deux canvas, tableaux et
   expériences 4 fois par seconde seulement -- le legacy réécrivait six blocs
   HTML à chaque image, ce qui pesait plus que le dessin. */
let azimTablesAt = 0;
function azimLoop(ts){
  if($("tab-azim").hidden){ azimRAF = null; return; }
  if(AZIM.playing){
    if(AZIM.last && ts - AZIM.last < 32){ azimRAF = requestAnimationFrame(azimLoop); return; }
    if(AZIM.last) AZIM.t += (ts - AZIM.last)/1000;      // one day in 24 s
    AZIM.last = ts;
    const S = azimState();
    azimReadsFill(S); drawAzimGlobe(S); drawAzimFlat(S);
    if(ts - azimTablesAt > 250){ azimTablesAt = ts; azimTables(S); azimExperiment(S); azimParTables(S); azimExperiment9b(S); }
  } else AZIM.last = 0;
  azimRAF = requestAnimationFrame(azimLoop);
}

function azimSyncButtons(){
  Object.entries(AZIM_CASES).forEach(([k, c]) =>
    $(c.btn) && $(c.btn).setAttribute("aria-pressed", String(AZIM.case === k)));
  [["azimBodySun","sun"], ["azimBodyMoon","moon"]].forEach(([id, b]) =>
    $(id) && $(id).setAttribute("aria-pressed", String(AZIM.body === b)));
  const p = $("azimPlay");
  if(p){ p.textContent = AZIM.playing ? "\u258d\u258d" : "\u25b6";
         p.setAttribute("aria-pressed", String(AZIM.playing)); }
}
// These controls live outside <form id="form">, so they carry their own listeners.

export function wire(){
  t = makeT(document.documentElement.lang || "en", "azim");
  // export (epic10/UC02) : un jour complet (24 h en 24 s) depuis l'instant affiché,
  // globe et carte plate ensemble ; readout : les lectures de la page
  let saved = null;
  const anim = {
    duration: 24,
    begin(){ saved = { ...AZIM }; if(azimRAF !== null){ cancelAnimationFrame(azimRAF); azimRAF = null; } },
    frameAt(tt){ AZIM.t = saved.t + tt; azimPaint(azimState()); },
    end(){ if(saved) Object.assign(AZIM, saved, { last: 0 }); saved = null; drawAzim(); },
    readout(){ return ($("azimReads")?.textContent || "").replace(/\s+/g, " ").trim(); },
  };
  for(const id of ["azimGlobe", "azimFlat"]) if($(id)) $(id).__anim = anim;
  Object.entries(AZIM_CASES).forEach(([k, c]) => {
    const b = $(c.btn); if(!b) return;
    b.addEventListener("click", () => {
      AZIM.case = k; AZIM.t = 0; AZIM.playing = false; AZIM.last = 0; drawAzim();
    });
  });
  [["azimBodySun","sun"], ["azimBodyMoon","moon"]].forEach(([id, b]) =>
    $(id) && $(id).addEventListener("click", () => { AZIM.body = b; drawAzim(); }));
  $("azimPlay") && $("azimPlay").addEventListener("click", () => {
    AZIM.playing = !AZIM.playing; AZIM.last = 0; azimSyncButtons();
    if(azimRAF === null && !$("tab-azim").hidden) azimRAF = requestAnimationFrame(azimLoop);
  });
  $("azimReset") && $("azimReset").addEventListener("click", () => {
    AZIM.t = 0; AZIM.playing = false; AZIM.last = 0; drawAzim();
  });
}
export function draw(){ drawAzim(); }
export function stop(){ if(azimRAF){ cancelAnimationFrame(azimRAF); azimRAF = null; } }
