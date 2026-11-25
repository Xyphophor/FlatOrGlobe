// Onglet star : le ciel de nuit des deux figures à étoiles (2026-11-11, demande du propriétaire : « les autres
// illustrations font pâle figure ») -- la figure d'ouverture (st-figOpen) et la figure des traînées (st-figSky),
// redessinées en canvas avec les étoiles d'Hipparcos plus brillantes que V = 4 au lieu des 35 du catalogue de
// l'onglet, à leur couleur, en grand format. La PHYSIQUE est celle du moteur porté du legacy, inchangée : mêmes
// lieux, dates, dômes et visées (STAR.api), même précession (OBS.precess), mêmes deux modèles (OBS.altaz pour le
// globe ; OBS.subPoint + OBS.flatGeom pour le disque sous son dôme), même caméra gnomonique. Seul le rendu change.
// Les positions sont calculées une fois par réglage (table de vecteurs locaux est-nord-haut), puis projetées.
import { anim2d, text } from "../../core/anim2d.js";
import { OBS } from "../../core/ephemeris.js";
import { reducedMotion } from "../../core/motion.js";
import * as L from "./radec-logic.js";

const D2R = Math.PI / 180, TAU = 2 * Math.PI;
export const VMAX = 4.0;
export const SKY_STARS = L.BRIGHT.filter((s) => s.v < VMAX);
const MODEL = { g: "#5eead4", f: "#fcd34d" }, INK = "#e6ecf7", SOFT = "#9fb0cc", HORIZON = "rgba(170,190,220,0.75)";
const COLS = ["#b9ccff", "#dfe6ff", "#fff6e8", "#ffe2b0", "#ffc487"];
const colClass = (bv) => (bv == null ? 2 : bv < 0 ? 0 : bv < 0.3 ? 1 : bv < 0.6 ? 2 : bv < 1 ? 3 : 4);
const magClass = (v) => (v < 1.5 ? 0 : v < 3 ? 1 : 2);
const enu = (alt, az) => { const a = alt * D2R, z = az * D2R, c = Math.cos(a); return [c * Math.sin(z), c * Math.cos(z), Math.sin(a)]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

/**
 * Table des directions locales (est, nord, haut) de chaque étoile, de jd0 à jd0 + hours, en steps pas, dans les
 * deux modèles. Le globe : hauteur et azimut du triangle sphérique (OBS.altaz). Le disque : l'étoile est à la
 * hauteur dome au-dessus de son point substellaire porté sur la carte azimutale équidistante (OBS.flatGeom).
 */
export function buildPaths(spot, jd0, hours, steps, dome, stars = SKY_STARS) {
  const n = steps + 1, G = new Float32Array(stars.length * n * 3), F = new Float32Array(stars.length * n * 3);
  const year = 2000 + (jd0 - 2451545) / 365.25;
  stars.forEach((s, si) => {
    const c = L.radec(L.moved(s, year)), p = OBS.precess(c.ra, c.dec, jd0);
    for (let i = 0; i < n; i++) {
      const jd = jd0 + (i / steps) * hours / 24, o = (si * n + i) * 3;
      const g = OBS.altaz(p.ra, p.dec, spot.lat, spot.lon, jd), sub = OBS.subPoint(p.ra, p.dec, jd), f = OBS.flatGeom(spot.lat, spot.lon, sub.lat, sub.lon, dome);
      G.set(enu(g.alt, g.az), o); F.set(enu(f.alt, f.az), o);
    }
  });
  return { n, steps, G, F, stars };
}
/** Caméra gnomonique visant {alt, az}, haut = vers le zénith (r = c × u : l'image qu'un appareil enregistre). */
export function camera(aim) {
  const c = enu(aim.alt, aim.az), z = [0, 0, 1], k = dot(z, c);
  const u = unit([z[0] - c[0] * k, z[1] - c[1] * k, z[2] - c[2] * k]);
  return { c, u, r: cross(c, u) };
}
const proj = (cam, x, y, z) => { const d = x * cam.c[0] + y * cam.c[1] + z * cam.c[2]; return d < 0.14 ? null : [(x * cam.r[0] + y * cam.r[1] + z * cam.r[2]) / d, (x * cam.u[0] + y * cam.u[1] + z * cam.u[2]) / d]; };

/** Le décor d'un panneau : ciel, lueur, sol sous l'horizon, points cardinaux, point fixe. Laisse le clip posé. */
function backdrop(ctx, B, cam, K, fp, col, tr, fixLabel) {
  const cx = B.x + B.w / 2, cy = B.y + B.h / 2, XY = (p) => [cx + p[0] * K, cy - p[1] * K];
  ctx.save(); ctx.beginPath(); ctx.rect(B.x, B.y, B.w, B.h); ctx.clip();
  const sky = ctx.createLinearGradient(0, B.y, 0, B.y + B.h); sky.addColorStop(0, "#04071a"); sky.addColorStop(0.6, "#0c1634"); sky.addColorStop(1, "#1b2a55");
  ctx.fillStyle = sky; ctx.fillRect(B.x, B.y, B.w, B.h);
  // l'horizon est un grand cercle : en gnomonique, une DROITE. Deux de ses points suffisent, prolongés sur tout le panneau.
  let best = [];
  { const hz = []; for (let a = 0; a < 360; a += 2) { const v = enu(0, a), p = proj(cam, v[0], v[1], v[2]); if (p && Math.hypot(p[0], p[1]) < 3) hz.push(XY(p)); }
    if (hz.length > 1) { hz.sort((p, q) => p[0] - q[0]); const A = hz[0], Z = hz[hz.length - 1];
      if (Z[0] - A[0] > 1) { const y = (x) => A[1] + (Z[1] - A[1]) * (x - A[0]) / (Z[0] - A[0]); best = [[B.x - 2, y(B.x - 2)], [B.x + B.w + 2, y(B.x + B.w + 2)]]; } } }
  if (best.length > 1) {
    const top = Math.min(...best.map((p) => p[1])), glowH = B.h * 0.22;
    const glow = ctx.createLinearGradient(0, top - glowH, 0, top + 6); glow.addColorStop(0, "rgba(96,130,190,0)"); glow.addColorStop(1, "rgba(96,130,190,0.42)");
    ctx.beginPath(); ctx.moveTo(best[0][0] - 60, best[0][1] - glowH); for (const p of best) ctx.lineTo(p[0], p[1] - glowH); ctx.lineTo(best[best.length - 1][0] + 60, best[best.length - 1][1] - glowH);
    ctx.lineTo(best[best.length - 1][0] + 60, best[best.length - 1][1]); for (let i = best.length - 1; i >= 0; i--) ctx.lineTo(best[i][0], best[i][1]); ctx.lineTo(best[0][0] - 60, best[0][1]); ctx.closePath(); ctx.fillStyle = glow; ctx.fill();
  }
  const ground = () => {
    if (best.length < 2) return;
    ctx.beginPath(); ctx.moveTo(best[0][0] - 60, best[0][1]); for (const p of best) ctx.lineTo(p[0], p[1]); ctx.lineTo(best[best.length - 1][0] + 60, best[best.length - 1][1]);
    ctx.lineTo(B.x + B.w + 60, B.y + B.h + 60); ctx.lineTo(B.x - 60, B.y + B.h + 60); ctx.closePath(); ctx.fillStyle = "#03050a"; ctx.fill();
    ctx.beginPath(); best.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.strokeStyle = HORIZON; ctx.lineWidth = 1; ctx.stroke();
    for (const [lab, az] of [["N", 0], ["E", 90], ["S", 180], ["W", 270]]) {
      const v = enu(0, az), p = proj(cam, v[0], v[1], v[2]); if (!p) continue; const q = XY(p); if (q[0] < B.x + 10 || q[0] > B.x + B.w - 10 || q[1] > B.y + B.h - 4) continue;
      ctx.strokeStyle = HORIZON; ctx.beginPath(); ctx.moveTo(q[0], q[1] - 5); ctx.lineTo(q[0], q[1]); ctx.stroke();
      text(ctx, tr("az-" + lab, lab), q[0], q[1] - 8, { c: INK, size: 11, align: "center", bold: true });
    }
  };
  const fix = () => {
    const v = enu(fp.alt, fp.az), p = proj(cam, v[0], v[1], v[2]); if (!p) return;
    const q = XY(p); if (q[0] < B.x || q[0] > B.x + B.w || q[1] < B.y || q[1] > B.y + B.h) return;
    const rg = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 22); rg.addColorStop(0, col + "55"); rg.addColorStop(1, col + "00");
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(q[0], q[1], 22, 0, TAU); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(q[0] - 7, q[1]); ctx.lineTo(q[0] + 7, q[1]); ctx.moveTo(q[0], q[1] - 7); ctx.lineTo(q[0], q[1] + 7); ctx.stroke();
    if (fixLabel) text(ctx, fixLabel, q[0] + 10, q[1] + 16, { c: col, size: 10.5 });
  };
  return { XY, ground, fix, end(title) {
    ctx.restore();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.rect(B.x, B.y, B.w, B.h); ctx.stroke(); ctx.globalAlpha = 1;
    text(ctx, title, B.x + 10, B.y + 18, { c: col, size: 12.5, bold: true, maxW: B.w - 20 });
  } };
}
function head(ctx, x, y, s, a = 1) {
  const r = Math.max(0.7, 2.7 - 0.5 * s.v);
  if (s.v < 2.2) { const rg = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4); rg.addColorStop(0, "rgba(255,255,255,0.55)"); rg.addColorStop(1, "rgba(160,190,255,0)"); ctx.globalAlpha = a; ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, r * 3.4, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = a; ctx.fillStyle = COLS[colClass(s.bv)]; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
}
/** Deux panneaux : côte à côte si l'image est large, l'un sous l'autre sinon. */
function boxes(W, H, top, bot) {
  const g = 10, m = 8;
  return W >= 560 ? [{ x: m, y: top, w: (W - 2 * m - g) / 2, h: H - top - bot }, { x: m + (W - 2 * m - g) / 2 + g, y: top, w: (W - 2 * m - g) / 2, h: H - top - bot }]
    : [{ x: m, y: top, w: W - 2 * m, h: (H - top - bot - g) / 2 }, { x: m, y: top + (H - top - bot - g) / 2 + g, w: W - 2 * m, h: (H - top - bot - g) / 2 }];
}
function makeCanvas(host, label, id) {
  host.innerHTML = "";
  const cv = document.createElement("canvas"); cv.id = id; cv.className = "st-night"; cv.setAttribute("role", "img"); cv.setAttribute("aria-label", label);
  host.appendChild(cv); return cv;
}
const paper = (ctx, W, H) => { ctx.fillStyle = "#070b1a"; ctx.fillRect(0, 0, W, H); };

/* ---- figure d'ouverture : un lieu, un jour sidéral, les deux modèles --------------------------- */
export function mountOpen(host, tr, api) {
  const sp = api.SPOTS[api.OPEN_SPOT], d = api.DATES[3], dome = api.DOMES[0];
  const g = api.fixedGlobe(sp.lat), f = api.fixedFlat(sp.lat, dome), DAY = 23.9345, STEPS = 144, FOV = 46;
  const jd0 = OBS.jdFromUTC(d.Y, d.M, d.D, 0, 0, 0) - sp.lon / 360;
  let T = null; const cams = { g: camera(g), f: camera(f) };
  const tailMin = reducedMotion() ? 60 : 30;
  const reads = host.ownerDocument.getElementById("st-openReads");
  if (reads) reads.innerHTML = `<span><b>${sp.n}</b> ${Math.abs(sp.lat).toFixed(2)}° ${tr("az-S", "S")} · ${tr(d.n, d.n)}</span>` +
    `<span class="g">${tr("open-read-fixed-s", "fixed point {alt}° due south, clockwise").replace("{alt}", g.alt.toFixed(1))}</span>` +
    `<span class="f">${tr("open-read-fixed-n", "fixed point {alt}° due north, counter-clockwise").replace("{alt}", f.alt.toFixed(1))}</span>` +
    `<span>${tr("open-read-tail", "{tailMin} min tail").replace("{tailMin}", tailMin)}</span>`;
  const cv = makeCanvas(host, tr("open-alt", "Star motion at one place, globe and flat disc"), "stNightOpen");
  const a = anim2d(cv, { span: 44, u0: 0.1, draw(ctx, W, H, u) {
    if (!T) T = buildPaths(sp, jd0, DAY, STEPS, dome);
    paper(ctx, W, H);
    const pos = u * STEPS, TAILN = 6, tail = tailMin / (DAY * 60) * STEPS, bx = boxes(W, H, 6, 20);
    [["g", g, tr("open-panel-globe", "globe · facing south")], ["f", f, tr("open-panel-flat", "flat disc · facing north")]].forEach(([m, fp, title], pi) => {
      const B = bx[pi], cam = cams[m], K = (B.h / 2) / Math.tan(FOV * D2R), A = m === "g" ? T.G : T.F, bd = backdrop(ctx, B, cam, K, fp, MODEL[m], tr, tr("view-fixed", "the fixed point"));
      bd.fix(); ctx.lineCap = "round";
      const at = (si, x) => { x = ((x % STEPS) + STEPS) % STEPS; const i = Math.floor(x), k = x - i, o = (si * T.n + i) * 3, o2 = o + 3;
        const X = A[o] + (A[o2] - A[o]) * k, Y = A[o + 1] + (A[o2 + 1] - A[o + 1]) * k, Z = A[o + 2] + (A[o2 + 2] - A[o + 2]) * k; return Z <= 0 ? null : proj(cam, X, Y, Z); };
      T.stars.forEach((s, si) => {
        const p = at(si, pos); if (!p) return; const q = bd.XY(p); if (q[0] < B.x - 30 || q[0] > B.x + B.w + 30 || q[1] < B.y - 30 || q[1] > B.y + B.h + 30) return;
        const w0 = Math.max(0.7, 2.3 - 0.4 * s.v), col = COLS[colClass(s.bv)]; let prev = null;
        for (let i = TAILN; i >= 0; i--) { const pi2 = i ? at(si, pos - tail * i / TAILN) : p, qi = pi2 ? bd.XY(pi2) : null;
          if (prev && qi) { const k = 1 - (i + 0.5) / TAILN; ctx.strokeStyle = col; ctx.globalAlpha = 0.06 + 0.6 * k * k; ctx.lineWidth = w0 * (0.4 + 0.6 * k); ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(qi[0], qi[1]); ctx.stroke(); }
          prev = qi; }
        ctx.globalAlpha = 1; head(ctx, q[0], q[1], s);
      });
      bd.ground(); bd.end(title);
    });
    text(ctx, tr("open-nts", "not to scale — gnomonic, one place, both models"), W - 10, H - 6, { c: "#fbbf24", size: 10, align: "right", maxW: W - 20 });
  } });
  host.__anim = cv.__anim;
  return a;
}

/* ---- figure des traînées : pose de quatre heures, lieu / date / dôme / visée de la page -------- */
export function mountSky(host, tr, api, lang = "en") {
  const HOURS = 4, STEPS = 24, FOV = 52;
  let key = "", T = null;
  const cv = makeCanvas(host, tr("sky-trails-alt", "Star trails from one place, globe and flat disc"), "stNightSky");
  const a = anim2d(cv, { span: 14, u0: 0.75, draw(ctx, W, H, u) {
    const S = api.S, sp = api.SPOTS[S.spot], dome = api.DOMES[S.dome], vw = api.VIEWS[S.view], jd0 = api.jdOf(), k2 = `${S.spot}|${S.date}|${S.dome}`;
    if (k2 !== key) { T = buildPaths(sp, jd0, HOURS, STEPS, dome); key = k2; }
    paper(ctx, W, H);
    const p = Math.min(1, u / 0.72), last = p * STEPS, bx = boxes(W, H, 6, 22);
    const g = api.fixedGlobe(sp.lat), f = api.fixedFlat(sp.lat, dome);
    [["g", g, tr("panel-globe", "globe")], ["f", f, tr("panel-flat-disc", "flat disc")]].forEach(([m, fp, title], pi) => {
      const B = bx[pi], aim = vw.k === "fix" ? fp : { alt: vw.alt, az: vw.az }, cam = camera(aim), K = (B.h / 2) / Math.tan(FOV * D2R), A = m === "g" ? T.G : T.F;
      const bd = backdrop(ctx, B, cam, K, fp, MODEL[m], tr, tr("view-fixed", "the fixed point"));
      // les traînées, regroupées par couleur et par éclat : un tracé par groupe
      const groups = Array.from({ length: 15 }, () => []), heads = [], start = new Map();
      T.stars.forEach((s, si) => {
        let line = null; const gi = colClass(s.bv) * 3 + magClass(s.v), n = Math.floor(last);
        const pt = (o, k = 0) => { const X = A[o] + (k ? (A[o + 3] - A[o]) * k : 0), Y = A[o + 1] + (k ? (A[o + 4] - A[o + 1]) * k : 0), Z = A[o + 2] + (k ? (A[o + 5] - A[o + 2]) * k : 0); if (Z <= 0) return null; const q = proj(cam, X, Y, Z); return q ? bd.XY(q) : null; };
        let end = null;
        for (let i = 0; i <= n; i++) { const q = pt((si * T.n + i) * 3); if (i === 0 && q) start.set(s.hip, q); if (q) { if (!line) { line = []; groups[gi].push(line); } line.push(q); end = q; } else { line = null; end = null; } }
        if (last > n && n < STEPS) { const q = pt((si * T.n + n) * 3, last - n); if (q) { if (!line) { line = []; groups[gi].push(line); } line.push(q); end = q; } else end = null; }
        if (end && end[0] > B.x - 20 && end[0] < B.x + B.w + 20 && end[1] > B.y - 20 && end[1] < B.y + B.h + 20) heads.push([end, s]);
      });
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      groups.forEach((lines, gi) => {
        if (!lines.length) return; const mc = gi % 3;
        ctx.beginPath(); for (const l of lines) { if (l.length < 2) continue; ctx.moveTo(l[0][0], l[0][1]); for (let i = 1; i < l.length; i++) ctx.lineTo(l[i][0], l[i][1]); }
        ctx.strokeStyle = COLS[Math.floor(gi / 3)];
        if (mc === 0) { ctx.globalAlpha = 0.16; ctx.lineWidth = 5; ctx.stroke(); }
        ctx.globalAlpha = [0.95, 0.72, 0.42][mc]; ctx.lineWidth = [2.1, 1.3, 0.8][mc]; ctx.stroke();
      });
      ctx.globalAlpha = 1;
      for (const [q, s] of heads) head(ctx, q[0], q[1], s);
      // astérismes au début de la pose, pour s'y retrouver
      ctx.setLineDash([3, 3]); ctx.strokeStyle = "#cfe0ff"; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.9;
      for (const [name, segs] of Object.entries(L.ASTERISMS)) {
        let n = 0, sx = 0, sy = 0, lo = -1e9;
        for (const [h1, h2] of segs) { const q1 = start.get(h1), q2 = start.get(h2); if (q1 && q2) { ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); n++; sx += (q1[0] + q2[0]) / 2; sy += (q1[1] + q2[1]) / 2; lo = Math.max(lo, q1[1], q2[1]); } }
        if (n >= 2 && n >= segs.length - 1 && sx / n > B.x + 40 && sx / n < B.x + B.w - 40 && lo + 14 < B.y + B.h) { ctx.setLineDash([]); ctx.globalAlpha = 0.9; text(ctx, tr("sky-a-" + name, { dipper: "Big Dipper", orion: "Orion", crux: "Southern Cross", cassiopeia: "Cassiopeia" }[name]), sx / n, lo + 14, { c: "#cfe0ff", size: 10, align: "center" }); ctx.setLineDash([3, 3]); ctx.globalAlpha = 0.55; }
      }
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      bd.fix(); bd.ground(); bd.end(title);
    });
    const mins = Math.round(p * HOURS * 60);
    text(ctx, tr("sky-trails-expo", "exposure {h} h {m} min of {H} h").replace("{h}", Math.floor(mins / 60)).replace("{m}", String(mins % 60).padStart(2, "0")).replace("{H}", HOURS), 10, H - 7, { c: SOFT, size: 10.5 });
    if (W >= 480) text(ctx, tr("sky-trails-nts", "not to scale — gnomonic camera, same lens in both panels"), W - 10, H - 7, { c: "#fbbf24", size: 10, align: "right" });
  } });
  host.__anim = cv.__anim;
  return a;
}
