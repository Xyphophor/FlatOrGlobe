// Animations de l'onglet orb (2026-10-04, demande du propriétaire : « on parle de détecter un
// mouvement »). Chaque animation fait tourner la Terre sur son orbite (positions et distances du
// Soleil par l'éphéméride de Meeus) et montre, à côté, ce que l'instrument enregistre au même
// instant : la position apparente d'une étoile (aberration, parallaxe), le diamètre du Soleil
// (SDO), la vitesse du Soleil (HARPS-N) ou d'une étoile (HARPS). Les tracés de données sont les
// mesures publiées ; les agrandissements sont imprimés (règle 1).
import { anim2d, arrow, text, disc, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { sun, gmst } from "../../core/ephemeris.js";
import { orbData, SDO_RSUN, TAU_CETI } from "./data.js";
import { globeSunRV, flatSunRV, TNG, orbitRV } from "./logic.js";

const D2R = Math.PI / 180, EPS = 23.4393 * D2R;
const jdOfMs = (ms) => ms / 864e5 + 2440587.5;
/** Direction d'une étoile (α, δ en degrés) en coordonnées écliptiques cartésiennes, et (λ, β). */
function starVec(ra, dec) {
  const a = ra * D2R, d = dec * D2R;
  const lam = Math.atan2(Math.sin(a) * Math.cos(EPS) + Math.tan(d) * Math.sin(EPS), Math.cos(a));
  const beta = Math.asin(Math.sin(d) * Math.cos(EPS) - Math.cos(d) * Math.sin(EPS) * Math.sin(a));
  return { v: [Math.cos(beta) * Math.cos(lam), Math.cos(beta) * Math.sin(lam), Math.sin(beta)], lam, beta };
}
/** La Terre vue du Soleil à la date jd : longitude héliocentrique (rad), distance (UA). */
function earthAt(jd) { const s = sun(jd); return { lam: (s.lon + 180) * D2R, r: s.distAU }; }
/** Écart apparent d'une étoile ŝ vers un vecteur unitaire ê (aberration : ê = v̂ ; parallaxe : ê = −r̂), projeté sur l'écliptique. */
const offset = (e, s, k) => { const d = e[0] * s[0] + e[1] * s[1] + e[2] * s[2]; return [k * (e[0] - d * s[0]), k * (e[1] - d * s[1])]; };
const MONTHS = { en: ["Jan", "Apr", "Jul", "Oct"], fr: ["janv.", "avr.", "juil.", "oct."] };

/** Vue de dessus de l'orbite (depuis le nord de l'écliptique, sens direct) ; renvoie la position écran de la Terre. */
function orbitView(ctx, cx, cy, R, jd0, jd, year, lang, o = {}) {
  ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = 0; k <= 96; k++) { const e = earthAt(jd0 + (k / 96) * 365.25), r = R * (o.trueR ? e.r : 1); const x = cx + r * Math.cos(e.lam), y = cy - r * Math.sin(e.lam); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  (MONTHS[lang] || MONTHS.en).forEach((m, i) => { const e = earthAt(jdOfMs(Date.UTC(year, 3 * i, 1))); text(ctx, m, cx + (R + 14) * Math.cos(e.lam), cy - (R + 14) * Math.sin(e.lam) + 4, { size: 10, c: SOFT, align: "center" }); });
  disc(ctx, cx, cy, o.sunR || 9, "#fde68a", FLAT, 1.4);
  const e = earthAt(jd), r = R * (o.trueR ? e.r : 1), ex = cx + r * Math.cos(e.lam), ey = cy - r * Math.sin(e.lam);
  disc(ctx, ex, ey, 6, "#dbeafe", GLOBE, 1.6);
  return { ex, ey, e, vx: -Math.sin(e.lam), vy: Math.cos(e.lam) };       // vitesse : sens direct (écran : y vers le bas)
}
const dateStr = (jd, lang) => new Date((jd - 2440587.5) * 864e5).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const split = (W, H) => { const narrow = W < 560; return narrow ? { narrow, L: [0, 0, W, H * 0.5], Rp: [0, H * 0.5, W, H * 0.5] } : { narrow, L: [0, 0, W * 0.48, H], Rp: [W * 0.5, 0, W * 0.5, H] }; };

/* ---- 1. aberration : γ Draconis ------------------------------------------------------- */
// 2026-10-07 (propriétaire : « on ne comprend pas la partie à droite ; animer la lumière qui entre
// dans le télescope ») : l'oculaire a un titre et une légende à symboles, la parallaxe n'y est plus
// agrandie que ×500 (×1000 la rendait aussi grande que l'aberration), et une bande en dessous montre,
// de côté, la lumière qui tombe dans deux tubes qui avancent : l'un pointé droit sur l'étoile (la
// lumière frappe la paroi), l'autre penché vers v (elle atteint l'oculaire). v/c y est agrandi, et
// le facteur est imprimé (règle 1).
export function mountAberration(canvas, tr, lang = "en") {
  const D = orbData(), kap = D.bradley.kappa, S = starVec(269.152, 51.489), P_GDRA = 0.0214, PX = 500;
  const J0 = jdOfMs(Date.UTC(2025, 0, 1)), SPAN = 16, BETA = 0.3, LIGHT = "#ca8a04";
  const xf = Math.round(BETA / (kap / 206264.8) / 100) * 100;                 // agrandissement de v/c dans les tubes
  const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  /** Un tube qui avance vers la droite dans la lumière qui tombe ; tilt : penché de v/c vers l'avant. */
  function tube(ctx, B, title, tilt, col, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(B[0], B[1], B[2], B[3]); ctx.clip();
    const lh = 13 * text(ctx, title, B[0] + B[2] / 2, B[1] + 14, { size: 10.5, c: col, align: "center", maxW: B[2] - 12 });
    const y0 = B[1] + lh + 8, bot = B[1] + B[3] - 18, ya = y0 + (bot - y0) * 0.3, Dp = bot - ya;
    const w = Math.max(14, Math.min(26, B[2] * 0.12)), range = B[2] + 2 * w + 40 + BETA * Dp;
    const n = Math.max(1, Math.round(range / (SPAN * BETA * Dp / 1.1)));     // la boucle de 16 s retombe juste
    const v = n * range / SPAN, c = v / BETA, s = tilt ? BETA : 0;
    const xa = (tt) => B[0] - w - 20 + BETA * Dp * (tilt ? 1 : 0) + (((v * tt) % range) + range) % range;
    const xNow = xa(t), m = Math.max(1, Math.round(SPAN * c / 30)), Pp = SPAN / m;   // un photon tous les ~30 px
    // le tube : parois parallèles, ouvert en haut, l'oculaire en bas
    ctx.fillStyle = "rgba(29,78,216,.06)"; ctx.beginPath();
    ctx.moveTo(xNow - w / 2, ya); ctx.lineTo(xNow + w / 2, ya); ctx.lineTo(xNow + w / 2 - s * Dp, ya + Dp); ctx.lineTo(xNow - w / 2 - s * Dp, ya + Dp); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath();
    ctx.moveTo(xNow - w / 2, ya); ctx.lineTo(xNow - w / 2 - s * Dp, ya + Dp); ctx.lineTo(xNow + w / 2 - s * Dp, ya + Dp); ctx.lineTo(xNow + w / 2, ya); ctx.stroke();
    arrow(ctx, xNow + w / 2 + 6, ya + Dp * 0.55, xNow + w / 2 + 30, ya + Dp * 0.55, GLOBE, 1.6, 6);
    text(ctx, "v", xNow + w / 2 + 18, ya + Dp * 0.55 - 5, { size: 11, c: GLOBE, align: "center" });
    if (tilt) {   // la direction de l'étoile (verticale) et l'angle κ du tube
      ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xNow - s * Dp, ya + Dp); ctx.lineTo(xNow - s * Dp, ya - 6); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "κ", xNow - s * Dp + 4 + s * Dp * 0.25, ya + Dp * 0.25 + 4, { size: 11, c: GLOBE, bold: true });
    }
    // la lumière de l'étoile tombe verticalement (repère du Soleil) ; chaque photon est suivi depuis l'ouverture
    for (let x = B[0] + 5; x < B[0] + B[2]; x += 10) {
      const ph = hash(x - B[0]) * Pp, kmax = Math.floor((t - ph) / Pp), kmin = kmax - Math.ceil((bot - y0 + 20) / (c * Pp)) - 1;
      for (let k = kmin; k <= kmax; k++) {
        const y = y0 + c * (t - ph - k * Pp);
        if (y < y0) continue;
        if (y < ya) { ctx.strokeStyle = LIGHT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, Math.max(y0, y - 7)); ctx.lineTo(x, y); ctx.stroke(); continue; }
        const d = y - ya, xe = xa(t - d / c);
        if (xe > xNow) continue;                                             // le tube est revenu à gauche entre-temps
        const off0 = x - xe; if (Math.abs(off0) > w / 2 - 1.5) continue;     // passé à côté de l'ouverture
        const g = s - BETA, dHit = g ? (Math.sign(g) * (w / 2 - 1.5) - off0) / g : Infinity;
        if (dHit < Math.min(d, Dp)) { if (d - dHit < c * 0.3) disc(ctx, x + BETA * (d - dHit), ya + dHit, 2.6, "#dc2626"); continue; }   // resté sur la paroi, qui avance
        if (d <= Dp) { ctx.strokeStyle = LIGHT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, Math.max(ya, y - 7)); ctx.lineTo(x, y); ctx.stroke(); }
        else if (d - Dp < c * 0.25) disc(ctx, x, ya + Dp, 3.2, LIGHT);         // arrivé à l'oculaire
      }
    }
    ctx.restore();
  }
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const jd = J0 + u * 365.25, narrow = W < 560;
    const L = narrow ? [0, 0, W, H * 0.34] : [0, 0, W * 0.48, H * 0.58];
    const Rp = narrow ? [0, H * 0.34, W, H * 0.31] : [W * 0.5, 0, W * 0.5, H * 0.58];
    const B = narrow ? [0, H * 0.65, W, H * 0.35] : [0, H * 0.58, W, H * 0.42];
    // l'orbite
    const R = Math.min(L[2], L[3]) * 0.32, cx = L[0] + L[2] / 2, cy = L[1] + L[3] / 2 + 8;
    const o = orbitView(ctx, cx, cy, R, J0, jd, 2025, lang);
    arrow(ctx, o.ex, o.ey, o.ex + 40 * o.vx, o.ey - 40 * o.vy, GLOBE, 2);
    text(ctx, "v", o.ex + 46 * o.vx, o.ey - 46 * o.vy + 4, { size: 12, c: GLOBE, align: "center" });
    const tl = text(ctx, tr("an-ab-star", "γ Draconis: almost above the orbit's pole"), L[0] + 8, L[1] + 16, { size: 10.5, c: SOFT, maxW: L[2] - 16 });
    text(ctx, tr("an-ab-st", "orbit not to scale"), L[0] + 8, L[1] + 16 + 13 * tl, { size: 10, c: FLAT });
    text(ctx, dateStr(jd, lang), L[0] + 8, L[1] + L[3] - 8, { size: 11, bold: true });
    // l'oculaire : titre, légende à symboles, puis le champ (même orientation que la vue de l'orbite)
    const ext = Math.max(kap, P_GDRA * PX) + 3;
    let ly = Rp[1] + 16 + 14 * text(ctx, tr("an-ab-eye-t", "In the telescope (same orientation as the orbit)"), Rp[0] + 8, Rp[1] + 16, { size: 11, bold: true, maxW: Rp[2] - 16 });
    const lw = narrow ? Math.round(Rp[2] * 0.52) : Rp[2] - 16, items = [
      ["dot", GLOBE, tr("an-ab-l1", "γ Draconis, displaced {k}″ toward v").replace("{k}", kap.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))],
      ["cross", FLAT, tr("an-ab-l2", "where it would be if the Earth stood still")],
      ["line", GLOBE, tr("an-ab-l3", "its path since 1 January")],
      ["dash", SOFT, tr("an-ab-l4", "its parallax ×{x}: away from the Sun, ¼ year behind").replace("{x}", PX)],
    ];
    for (const [sym, col, s] of items) {
      const x0 = Rp[0] + 14, yy = ly - 4;
      if (sym === "dot") disc(ctx, x0, yy, 4, GLOBE);
      else if (sym === "cross") { ctx.strokeStyle = FLAT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0 - 5, yy); ctx.lineTo(x0 + 5, yy); ctx.moveTo(x0, yy - 5); ctx.lineTo(x0, yy + 5); ctx.stroke(); }
      else { ctx.strokeStyle = sym === "line" ? "rgba(29,78,216,.6)" : FAINT; ctx.lineWidth = 1.4; ctx.setLineDash(sym === "dash" ? [2, 3] : []); ctx.beginPath(); ctx.moveTo(x0 - 6, yy); ctx.lineTo(x0 + 6, yy); ctx.stroke(); ctx.setLineDash([]); }
      ly += 13 * text(ctx, s, x0 + 12, ly, { size: 10, c: col === FLAT ? FLAT : col === GLOBE ? GLOBE : SOFT, maxW: lw - 26 }) + 2;
    }
    const fbot = Rp[1] + Rp[3] - 22;
    const area = narrow ? { x: Rp[0] + lw, y: Rp[1] + 22, w: Rp[2] - lw, h: fbot - Rp[1] - 22 } : { x: Rp[0], y: ly, w: Rp[2], h: fbot - ly };
    const fr = Math.max(30, Math.min(area.w / 2 - 8, area.h / 2 - 2)), fx = area.x + area.w / 2, fy = area.y + area.h / 2, sc = (fr - 6) / ext;   // px par ″
    disc(ctx, fx, fy, fr, "#eef2f8", FAINT, 1.2);
    const ab = offset([o.vx, o.vy, 0], S.v, kap), r = [Math.cos(o.e.lam), Math.sin(o.e.lam), 0], pa = offset(r.map((x) => -x), S.v, P_GDRA * PX);
    const trace = []; for (let j = J0; j <= jd; j += 3) { const e = earthAt(j); trace.push(offset([-Math.sin(e.lam), Math.cos(e.lam), 0], S.v, kap)); } trace.push(ab);
    ctx.strokeStyle = "rgba(29,78,216,.45)"; ctx.lineWidth = 1.4; ctx.beginPath(); trace.forEach((p, i) => (i ? ctx.lineTo(fx + p[0] * sc, fy - p[1] * sc) : ctx.moveTo(fx + p[0] * sc, fy - p[1] * sc))); ctx.stroke();
    ctx.strokeStyle = FAINT; ctx.setLineDash([2, 3]); ctx.beginPath();
    for (let k = 0; k <= 60; k++) { const e = earthAt(J0 + (k / 60) * 365.25), q = offset([-Math.cos(e.lam), -Math.sin(e.lam), 0], S.v, P_GDRA * PX); k ? ctx.lineTo(fx + q[0] * sc, fy - q[1] * sc) : ctx.moveTo(fx + q[0] * sc, fy - q[1] * sc); }
    ctx.stroke(); ctx.setLineDash([]);
    disc(ctx, fx + pa[0] * sc, fy - pa[1] * sc, 3, FAINT);
    ctx.strokeStyle = FLAT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx - 7, fy); ctx.lineTo(fx + 7, fy); ctx.moveTo(fx, fy - 7); ctx.lineTo(fx, fy + 7); ctx.stroke();
    arrow(ctx, fx, fy, fx + ab[0] * sc, fy - ab[1] * sc, GLOBE, 1.2, 6);
    disc(ctx, fx + ab[0] * sc, fy - ab[1] * sc, 5, GLOBE);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(Rp[0] + 10, Rp[1] + Rp[3] - 12); ctx.lineTo(Rp[0] + 10 + 10 * sc, Rp[1] + Rp[3] - 12); ctx.stroke();
    text(ctx, tr("an-ab-bar", "10″ in the eyepiece"), Rp[0] + 14 + 10 * sc, Rp[1] + Rp[3] - 8, { size: 10.5 });
    // la bande du dessous : pourquoi le tube doit pencher
    ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8, B[1] + 2); ctx.lineTo(W - 8, B[1] + 2); ctx.stroke();
    const bl = text(ctx, tr("an-ab-tube-t", "Seen from the side: the starlight falls while the telescope moves at v"), 8, B[1] + 18, { size: 11, bold: true, maxW: W - 16 });
    const t = u * SPAN, by = B[1] + 18 + 13 * bl - 6, half = (W - 24) / 2, bh = B[1] + B[3] - by - 16;
    tube(ctx, [8, by, half, bh], tr("an-ab-tube-a", "pointed straight at the star: the light hits the wall"), false, SOFT, t);
    tube(ctx, [16 + half, by, half, bh], tr("an-ab-tube-b", "tilted by κ toward v: the light reaches the eyepiece"), true, GLOBE, t);
    stamp2d(ctx, W, tr("an-ab-tube-st", "in the tubes v/c is drawn {b}, the real value is 0.0001: tilt ×{x}").replace("{b}", BETA.toLocaleString(lang)).replace("{x}", xf.toLocaleString(lang)), true, H);
  } });
}

/* ---- 2. la taille du Soleil sur l'année (SDO 2023) -------------------------------------- */
export function mountSunSize(canvas, tr, lang = "en") {
  const J0 = jdOfMs(Date.UTC(2023, 0, 1)), pts = SDO_RSUN.map(([d, r]) => [jdOfMs(Date.parse(d + "T00:00:00Z")), r]);
  const rmax = Math.max(...pts.map((p) => p[1])), rmin = Math.min(...pts.map((p) => p[1]));
  const at = (jd) => { let i = pts.findIndex((p) => p[0] > jd); if (i <= 0) return pts[i < 0 ? pts.length - 1 : 0][1]; const [a, b] = [pts[i - 1], pts[i]]; return a[1] + (b[1] - a[1]) * (jd - a[0]) / (b[0] - a[0]); };
  return anim2d(canvas, { span: 16, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const jd = J0 + u * 365, { L, Rp } = split(W, H);
    const R = Math.min(L[2], L[3]) * 0.34, cx = L[0] + L[2] / 2, cy = L[1] + L[3] / 2 + 8;
    const o = orbitView(ctx, cx, cy, R, J0, jd, 2023, lang, { trueR: true });
    ctx.strokeStyle = "rgba(180,83,9,.5)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(o.ex, o.ey); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `${tr("an-sun-dist", "distance")} ${o.e.r.toFixed(4)} ${tr("an-sun-au", "AU")}`, L[0] + 8, L[1] + 16, { size: 10.5, c: SOFT });
    text(ctx, dateStr(jd, lang), L[0] + 8, L[1] + L[3] - 8, { size: 11, bold: true });
    // le Soleil vu de la Terre, au rayon mesuré par SDO, avec les rayons extrêmes de l'année
    const th = at(jd), ry = Rp[3] * 0.58, k = Math.min(Rp[2] * 0.28, ry * 0.42) / rmax, sx = Rp[0] + Rp[2] * 0.32, sy = Rp[1] + ry * 0.55 + 10;
    disc(ctx, sx, sy, th * k, "#fde68a");
    disc(ctx, sx, sy, rmax * k, null, INK, 1); ctx.setLineDash([2, 3]); disc(ctx, sx, sy, rmin * k, null, INK, 1); ctx.setLineDash([]);
    text(ctx, `${th.toFixed(1)}″`, sx + rmax * k + 10, sy - 6, { size: 13, bold: true, mono: true });
    text(ctx, tr("an-sun-ring", "rings: 2023 max and min"), sx + rmax * k + 10, sy + 10, { size: 10, c: SOFT, maxW: Rp[0] + Rp[2] - 16 - sx - rmax * k });
    // la courbe SDO et le curseur
    const X0 = Rp[0] + 40, X1 = Rp[0] + Rp[2] - 10, Y0 = Rp[1] + Rp[3] - 18, Y1 = Rp[1] + ry + 18;
    const x = (j) => X0 + (j - J0) / 365 * (X1 - X0), y = (r) => Y0 - (r - (rmin - 2)) / (rmax - rmin + 4) * (Y0 - Y1);
    for (const v of [950, 970]) { ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(v)); ctx.lineTo(X1, y(v)); ctx.stroke(); text(ctx, `${v}″`, X0 - 4, y(v) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    for (const [j, r] of pts) disc(ctx, x(j), y(r), 1.8, j <= jd ? GLOBE : FAINT);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(jd), Y1 - 4); ctx.lineTo(x(jd), Y0); ctx.stroke();
    text(ctx, tr("an-sun-sdo", "SDO, 2023, every 7 days"), X1, Y1 - 6, { size: 10, c: SOFT, align: "right" });
    stamp2d(ctx, W, tr("an-sun-st", "orbit to scale (e = 0.017) · Sun's disc to scale with its rings"), false, H);
  } });
}

/* ---- 3. la vitesse du Soleil sur une journée (HARPS-N) ----------------------------------- */
export function mountDopDay(canvas, tr, lang = "en") {
  const D = orbData(), day = D.shown, t0 = Date.parse(day.t0), T = day.pts.at(-1)[0];
  const g = day.pts.map(([s]) => globeSunRV(new Date(t0 + s * 1000))), fl = day.pts.map(([s]) => flatSunRV(new Date(t0 + s * 1000), D.Hflat));
  const off = (m) => day.pts.reduce((a, p, i) => a + p[1] - m[i], 0) / day.pts.length, og = off(g), of = off(fl);
  const all = [...day.pts.map((p) => p[1]), ...g.map((v) => v + og), ...fl.map((v) => v + of)], lo = Math.min(...all), hi = Math.max(...all);
  const lat = TNG.lat * D2R;
  return anim2d(canvas, { span: 14, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const s = u * T, ms = t0 + s * 1000, { L, Rp } = split(W, H);
    // la Terre vue du pôle Nord, le Soleil à droite ; La Palma sur son parallèle
    const re = Math.min(L[2], L[3]) * 0.3, cx = L[0] + L[2] * 0.4, cy = L[1] + L[3] / 2 + 6, rv = globeSunRV(new Date(ms));
    disc(ctx, cx, cy, re, "#dbeafe", GLOBE, 1.4);
    ctx.fillStyle = "rgba(21,26,33,.16)"; ctx.beginPath(); ctx.arc(cx, cy, re, Math.PI / 2, Math.PI * 1.5); ctx.fill();
    ctx.setLineDash([2, 3]); disc(ctx, cx, cy, re * Math.cos(lat), null, SOFT, 1); ctx.setLineDash([]);
    disc(ctx, L[0] + L[2] - 14, cy, 10, "#fde68a", FLAT, 1.4); arrow(ctx, cx + re + 10, cy, L[0] + L[2] - 30, cy, FAINT, 1);
    // angle horaire du Soleil, le même que dans globeSunRV : 0 à midi vrai, négatif le matin
    const jd = jdOfMs(ms), Ha = (gmst(jd) + TNG.lon - sun(jd).ra) * D2R;
    const ox = cx + re * Math.cos(lat) * Math.cos(Ha), oy = cy - re * Math.cos(lat) * Math.sin(Ha);
    const vx = -Math.sin(Ha), vy = Math.cos(Ha), L1 = 46;
    disc(ctx, ox, oy, 4, INK);
    arrow(ctx, ox, oy, ox + L1 * vx, oy - L1 * vy, GLOBE, 1.8);
    arrow(ctx, ox, oy + 16, ox + L1 * vx, oy + 16, GLOBE, 2.6);
    text(ctx, rv < 0 ? tr("an-dop-app", "toward the Sun") : tr("an-dop-rec", "away from the Sun"), ox + (vx > 0 ? 6 : -6), oy + 32, { size: 10.5, c: GLOBE, align: vx > 0 ? "left" : "right" });
    text(ctx, tr("an-dop-pole", "seen from above the North Pole · La Palma"), L[0] + 8, L[1] + 16, { size: 10.5, c: SOFT });
    text(ctx, new Date(ms).toISOString().slice(0, 16).replace("T", " ") + " UTC", L[0] + 8, L[1] + L[3] - 8, { size: 11, bold: true, mono: true });
    // la journée mesurée, le globe sans paramètre de forme, la meilleure lampe
    const X0 = Rp[0] + 44, X1 = Rp[0] + Rp[2] - 10, Y0 = Rp[1] + Rp[3] - 22, Y1 = Rp[1] + 40;
    const x = (t) => X0 + (t / T) * (X1 - X0), y = (v) => Y0 - (v - lo) / (hi - lo) * (Y0 - Y1);
    for (let v = Math.ceil(lo / 200) * 200; v <= hi; v += 200) { ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(v)); ctx.lineTo(X1, y(v)); ctx.stroke(); text(ctx, String(v), X0 - 4, y(v) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    const line = (arr, add, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); day.pts.forEach(([t], i) => (i ? ctx.lineTo(x(t), y(arr[i] + add)) : ctx.moveTo(x(t), y(arr[i] + add)))); ctx.stroke(); };
    line(fl, of, FLAT); line(g, og, GLOBE);
    for (const [t, v] of day.pts) disc(ctx, x(t), y(v), 1.7, t <= s ? INK : FAINT);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(s), Y1 - 6); ctx.lineTo(x(s), Y0); ctx.stroke();
    text(ctx, tr("an-dop-plot", "the Sun's velocity, m/s (HARPS-N)"), Rp[0] + 8, Rp[1] + 16, { size: 10.5, c: SOFT });
    text(ctx, tr("an-dop-key", "dots measured · blue globe · orange best lamp"), Rp[0] + 8, Rp[1] + 30, { size: 10.5, c: SOFT });
    stamp2d(ctx, W, tr("an-dop-st", "not to scale — Earth and Sun"), true, H);
  } });
}

/* ---- 4. τ Ceti : la vitesse de l'observateur vers l'étoile, sur un an ---------------------- */
export function mountStarYear(canvas, tr, lang = "en") {
  const D = orbData().star, S = starVec(TAU_CETI.ra, TAU_CETI.dec), P = 365.25636, V = 29.78;
  const J0 = jdOfMs(Date.UTC(2010, 0, 1)), N = TAU_CETI.nights;
  const model = (jd) => orbitRV(jd, TAU_CETI.ra, TAU_CETI.dec, V);                 // km/s, positif = s'éloigne
  const gam = N.reduce((a, [t, v]) => a + v / 1000 - model(t), 0) / N.length;
  const ph = (t) => (((t % P) + P) % P) / P;
  return anim2d(canvas, { span: 16, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const jd = J0 + u * P, { L, Rp } = split(W, H);
    const R = Math.min(L[2], L[3]) * 0.32, cx = L[0] + L[2] / 2, cy = L[1] + L[3] / 2 + 8;
    const o = orbitView(ctx, cx, cy, R, J0, jd, 2010, lang);
    const sxv = Math.cos(S.lam), syv = Math.sin(S.lam);
    arrow(ctx, cx + (R + 30) * sxv, cy - (R + 30) * syv, cx + (R + 58) * sxv, cy - (R + 58) * syv, SOFT, 1.2);
    { ctx.font = "11px system-ui, sans-serif"; const tw = ctx.measureText("τ Cet ★").width, tx = cx + (R + 62) * sxv;   // gardée dans le panneau
      const x = sxv > 0 ? Math.min(tx, L[0] + L[2] - 4 - tw) : Math.max(tx, L[0] + 4 + tw);
      text(ctx, "τ Cet ★", x, cy - (R + 62) * syv + 4, { size: 11, c: SOFT, align: sxv > 0 ? "left" : "right" }); }
    arrow(ctx, o.ex, o.ey, o.ex + 40 * o.vx, o.ey - 40 * o.vy, GLOBE, 1.6);
    const pr = (o.vx * sxv + o.vy * syv) * Math.cos(S.beta), rv = model(jd);
    arrow(ctx, o.ex, o.ey, o.ex + 40 * pr * sxv, o.ey - 40 * pr * syv, GLOBE, 3);
    text(ctx, dateStr(jd, lang), L[0] + 8, L[1] + L[3] - 8, { size: 11, bold: true });
    text(ctx, tr("an-st-proj", "thick arrow: the Earth's speed toward the star"), L[0] + 8, L[1] + 16, { size: 10.5, c: SOFT });
    // les 561 nuits repliées sur un an, la courbe tirée de l'orbite, le curseur
    const X0 = Rp[0] + 40, X1 = Rp[0] + Rp[2] - 10, Y0 = Rp[1] + Rp[3] - 22, Y1 = Rp[1] + 40, lo = -46, hi = 12;
    const x = (p) => X0 + p * (X1 - X0), y = (v) => Y0 - (v - lo) / (hi - lo) * (Y0 - Y1);
    for (const v of [-40, -20, 0]) { ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(v)); ctx.lineTo(X1, y(v)); ctx.stroke(); text(ctx, String(v), X0 - 4, y(v) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    for (const [t, v] of N) disc(ctx, x(ph(t)), y(v / 1000), 1.4, INK);
    ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let k = 0; k <= 120; k++) { const j = J0 + (k / 120) * P, p = ph(j), q = [x(p), y(gam + model(j))]; k && p > ph(J0 + ((k - 1) / 120) * P) ? ctx.lineTo(...q) : ctx.moveTo(...q); } ctx.stroke();
    ctx.strokeStyle = FLAT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(gam)); ctx.lineTo(X1, y(gam)); ctx.stroke();
    text(ctx, tr("an-st-self", "the star itself"), X1, y(gam) - 4, { size: 10, c: FLAT, align: "right" });
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(ph(jd)), Y1 - 6); ctx.lineTo(x(ph(jd)), Y0); ctx.stroke();
    disc(ctx, x(ph(jd)), y(gam + rv), 4.5, GLOBE);
    text(ctx, tr("an-st-plot", "τ Ceti, km/s · {n} nights, 2003–2019").replace("{n}", D.n), Rp[0] + 8, Rp[1] + 16, { size: 10.5, c: SOFT });
    text(ctx, tr("an-st-key", "blue: from the Earth's orbit; only the mean is fitted"), Rp[0] + 8, Rp[1] + 30, { size: 10.5, c: GLOBE, maxW: Rp[2] - 16 });
    stamp2d(ctx, W, tr("an-st-st", "orbit not to scale"), true, H);
  } });
}

/* ---- 5. parallaxe : 61 Cygni contre les étoiles du fond ---------------------------------- */
export function mountParallax(canvas, tr, lang = "en") {
  const S = starVec(316.725, 38.749), p = 0.314, J0 = jdOfMs(Date.UTC(1838, 0, 1));
  const bg = [[-0.42, 0.31], [0.38, 0.4], [0.5, -0.33], [-0.3, -0.45], [0.05, 0.52], [-0.55, -0.05]];
  return anim2d(canvas, { span: 16, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const jd = J0 + u * 365.25, { L, Rp } = split(W, H);
    const R = Math.min(L[2], L[3]) * 0.26, cx = L[0] + L[2] * 0.42, cy = L[1] + L[3] * 0.62;
    const o = orbitView(ctx, cx, cy, R, J0, jd, 1838, lang);
    // l'étoile proche, dessinée beaucoup trop près, et les deux visées depuis les points opposés
    const sx = cx + R * 2.3 * S.v[0] / Math.hypot(S.v[0], S.v[1]), sy = cy - R * 2.3 * S.v[1] / Math.hypot(S.v[0], S.v[1]);
    ctx.strokeStyle = "rgba(29,78,216,.6)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(o.ex, o.ey); ctx.lineTo(sx, sy); ctx.stroke();
    text(ctx, "★ 61 Cyg", sx, sy - 6, { size: 11, c: INK, align: "center" });
    text(ctx, dateStr(jd, lang), L[0] + 8, L[1] + L[3] - 8, { size: 11, bold: true });
    // le champ : étoiles du fond fixes, 61 Cygni sur son ellipse
    const fx = Rp[0] + Rp[2] / 2, fy = Rp[1] + Rp[3] / 2 + 8, sc = Math.min(Rp[2], Rp[3]) * 0.36 / 0.55;
    for (const [a, b] of bg) disc(ctx, fx + a * sc, fy - b * sc, 2.2, FAINT);
    const q = offset([-Math.cos(o.e.lam), -Math.sin(o.e.lam), 0], S.v, p);
    const trace = []; for (let j = J0; j <= jd; j += 3) { const e = earthAt(j); trace.push(offset([-Math.cos(e.lam), -Math.sin(e.lam), 0], S.v, p)); } trace.push(q);
    ctx.strokeStyle = "rgba(29,78,216,.45)"; ctx.lineWidth = 1.4; ctx.beginPath(); trace.forEach((t, i) => (i ? ctx.lineTo(fx + t[0] * sc, fy - t[1] * sc) : ctx.moveTo(fx + t[0] * sc, fy - t[1] * sc))); ctx.stroke();
    ctx.strokeStyle = FLAT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx - 7, fy); ctx.lineTo(fx + 7, fy); ctx.moveTo(fx, fy - 7); ctx.lineTo(fx, fy + 7); ctx.stroke();
    disc(ctx, fx + q[0] * sc, fy - q[1] * sc, 5, GLOBE);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(Rp[0] + 10, Rp[1] + Rp[3] - 12); ctx.lineTo(Rp[0] + 10 + 0.2 * sc, Rp[1] + Rp[3] - 12); ctx.stroke();
    text(ctx, "0.2″", Rp[0] + 14 + 0.2 * sc, Rp[1] + Rp[3] - 8, { size: 10.5 });
    const ly = Rp[1] + 16 + 14 * text(ctx, tr("an-par-eye", "61 Cygni against fainter stars: ±{p}″").replace("{p}", p), Rp[0] + 8, Rp[1] + 16, { size: 10.5, c: GLOBE, maxW: Rp[2] - 16 });
    text(ctx, tr("an-par-flat", "+ Earth at rest: no shift"), Rp[0] + 8, ly, { size: 10.5, c: FLAT, maxW: Rp[2] - 16 });
    stamp2d(ctx, W, tr("an-par-st", "orbit and star not to scale · shifts to the 0.2″ bar"), true, H, Rp[0] + 44 + 0.2 * sc);
  } });
}

/* Bande de formules sous une animation (2026-10-17, propriétaire : « les maths et l'animation dans la carte ») :
   les équations, avec les valeurs de l'instant montré, font partie du dessin -- donc de la carte et de sa vidéo. */
const bandH = (W) => (W < 560 ? 104 : 70);
function formulaBand(ctx, W, H, lines) {
  const B = bandH(W), y0 = H - B, fs = W < 560 ? 10.5 : 11.5, lh = Math.round(fs * 1.45);
  ctx.fillStyle = "#f2f0ea"; ctx.fillRect(0, y0, W, B);
  ctx.strokeStyle = "#d7d3c8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y0 + 0.5); ctx.lineTo(W, y0 + 0.5); ctx.stroke();
  // une équation peut passer à la ligne (téléphone) : les suivantes descendent d'autant
  let y = y0 + 8 + fs;
  for (const [s, c] of lines) y += lh * text(ctx, s, 10, y, { size: fs, mono: true, c: c || INK, maxW: W - 20 }) + (W < 560 ? 2 : 4);
}

/* ---- 6. Kepler : aires égales, et T² ∝ a³ (2026-10-16, propriétaire : carte des explications des orbites) ---- */
// À gauche une ellipse d'excentricité 0,6 (celle de la Terre, 0,017, ne se verrait pas : imprimé) parcourue selon
// l'équation de Kepler ; l'orbite est découpée en 12 durées égales, chacune laisse son secteur : 12 aires égales.
// À droite deux orbites de rayons a et 4a, à l'échelle entre elles : l'intérieure fait 8 tours pendant que
// l'extérieure en fait un (4^1,5 = 8).
export function mountKepler(canvas, tr, lang = "en") {
  const e = 0.6, N = 12;
  const kep = (M) => { let E = M; for (let k = 0; k < 40; k++) E = M + e * Math.sin(E); return E; };
  return anim2d(canvas, { span: 16, u0: 0, draw(ctx, W, H0, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H0);
    const H = H0 - bandH(W), { narrow, L, Rp } = split(W, H);
    // --- gauche : l'ellipse, le Soleil au foyer (gauche), le périhélie à gauche
    const a = Math.min(L[2] * 0.4, L[3] * 0.48 / Math.sqrt(1 - e * e)), b = a * Math.sqrt(1 - e * e);
    const cx = L[0] + L[2] / 2 + a * e * 0.5, cy = L[1] + L[3] / 2 + 6, fx = cx - a * e;
    const P = (M) => { const E = kep(M); return [cx - a * Math.cos(E), cy - b * Math.sin(E)]; };
    const M = 2 * Math.PI * u, done = Math.floor(u * N);
    for (let k = 0; k <= done; k++) {
      const m0 = 2 * Math.PI * k / N, m1 = Math.min(M, 2 * Math.PI * (k + 1) / N);
      ctx.fillStyle = k === done ? "rgba(29,78,216,.28)" : k % 2 ? "rgba(29,78,216,.10)" : "rgba(15,118,110,.12)";
      ctx.beginPath(); ctx.moveTo(fx, cy);
      for (let s = 0; s <= 20; s++) { const p = P(m0 + (m1 - m0) * s / 20); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = SEA; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(cx, cy, a, b, 0, 0, 2 * Math.PI); ctx.stroke();
    disc(ctx, fx, cy, 7, "#fde68a", FLAT, 1.4);
    const [px, py] = P(M), r = Math.hypot(px - fx, py - cy) / a, v = Math.sqrt(2 / r - 1); // vis viva, GM = a = 1
    const E = kep(M), tx = -a * -Math.sin(E), ty = -b * Math.cos(E), tl = Math.hypot(tx, ty);
    arrow(ctx, px, py, px + tx / tl * 34 * v, py + ty / tl * 34 * v, GLOBE, 1.8);
    disc(ctx, px, py, 5, "#dbeafe", GLOBE, 1.6);
    text(ctx, tr("an-kep-1", "12 equal times → 12 equal areas"), L[0] + 8, L[1] + (narrow ? 42 : 16), { size: 10.5, c: SOFT, maxW: L[2] - 16 });
    text(ctx, `${tr("an-kep-v", "speed")} ${v.toFixed(2)} × 2πa/T`, L[0] + 8, L[1] + L[3] - 10, { size: 11, bold: true, mono: true });
    // --- droite : a et 4a, à l'échelle entre elles
    const R2 = Math.min(Rp[2] * 0.4, Rp[3] * 0.4), R1 = R2 / 4, ox = Rp[0] + Rp[2] / 2, oy = Rp[1] + Rp[3] / 2 + 6;
    ctx.strokeStyle = SEA; ctx.lineWidth = 1.2; disc(ctx, ox, oy, R2, null, SEA, 1.2); disc(ctx, ox, oy, R1, null, SEA, 1.2);
    disc(ctx, ox, oy, 5, "#fde68a", FLAT, 1.2);
    const t1 = 2 * Math.PI * 8 * u, t2 = 2 * Math.PI * u;
    disc(ctx, ox + R1 * Math.cos(t1), oy - R1 * Math.sin(t1), 4, "#dbeafe", GLOBE, 1.4);
    disc(ctx, ox + R2 * Math.cos(t2), oy - R2 * Math.sin(t2), 5, "#dbeafe", GLOBE, 1.4);
    text(ctx, "a", ox + R1 + 4, oy + 12, { size: 10.5, c: SOFT });
    text(ctx, "4a", ox + R2 + 4, oy + 14, { size: 10.5, c: SOFT });
    text(ctx, tr("an-kep-3", "4× farther: 8× longer (4³ = 8²)"), Rp[0] + 8, Rp[1] + (narrow ? 16 : 30), { size: 10.5, c: SOFT, maxW: Rp[2] - 16 });
    text(ctx, `${tr("an-kep-laps", "inner laps")} ${Math.min(8, Math.floor(8 * u) + 1)}/8`, Rp[0] + 8, Rp[1] + Rp[3] - 10, { size: 11, bold: true, mono: true });
    stamp2d(ctx, W, tr("an-kep-st", "left: eccentricity 0.6 (Earth's: 0.017) · right: radii to scale"), true);
    // les trois lois avec les valeurs de l'instant (a = 1, n = 2π/T = 1) : ½ r² θ̇ reste √(1−e²)/2 = 0,40 partout
    const ra = 1 - e * Math.cos(E), th = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2)), thd = Math.sqrt(1 - e * e) / (ra * ra);
    const deg = ((th * 180 / Math.PI) + 360) % 360, f2 = (x, d = 2) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    formulaBand(ctx, W, H0, [
      [`r = a(1 − e²)/(1 + e cos θ) = ${f2(ra)} a   (θ = ${f2(deg, 0)}°)`],
      [`½ r² θ̇ = ½ × ${f2(ra)}² × ${f2(thd)} n = ${f2(0.5 * ra * ra * thd, 3)} a²n = πab/T`, GLOBE],
      [`T² = 4π²a³/GM :  (8T)²/(4a)³ = 64T²/64a³ = T²/a³`, SEA],
    ]);
  } });
}

/* ---- 7. tomber sans jamais retomber : le canon de Newton (2026-10-16, propriétaire : « comment on arrive à une
   orbite alors que la gravité fait chuter ») ---- */
// À gauche le canon de Newton (montagne de 0,12 R : pas à l'échelle, imprimé), quatre tirs de plus en plus rapides,
// intégrés avec GM/r² (saute-mouton). À droite, À L'ÉCHELLE VRAIE, les 200 premières secondes d'une orbite rasante :
// la tangente (sans pesanteur), le sol (R = 6 371 km) et le boulet ; il est tombé de ½gt² sous la tangente, exactement
// ce dont le sol s'est incurvé, (vt)²/2R : il garde sa hauteur. v = √(gR).
export const FALL = { g: 9.81, R: 6371e3 };
export const fallSpeed = (g = FALL.g, R = FALL.R) => Math.sqrt(g * R);
export function mountFall(canvas, tr, lang = "en") {
  const H0 = 0.12, r0 = 1 + H0, ks = [0.6, 0.8, 0.92, 1.0];
  const shots = ks.map((k) => {
    let x = 0, y = r0, vx = k * Math.sqrt(1 / r0), vy = 0, swept = 0, prev = 0, t = 0; const pts = [[0, y, 0]]; const h = 0.004;
    for (let s = 0; s < 40000; s++) {
      const r = Math.hypot(x, y), g = 1 / (r * r * r);
      vx -= g * x * h; vy -= g * y * h; x += vx * h; y += vy * h; t += h;
      const ang = Math.atan2(x, y); let d = ang - prev; if (d < -Math.PI) d += 2 * Math.PI; swept += d; prev = ang;
      if (s % 10 === 0) pts.push([x, y, t]);
      if (Math.hypot(x, y) < 1 || swept > 2 * Math.PI) { pts.push([x, y, t]); break; }
    }
    return { k, pts, T: t, orbit: swept > 2 * Math.PI };
  });
  // part de la boucle de chaque tir : les trois courts se partagent 40 %, l'orbite 60 %
  const share = [0.13, 0.13, 0.14, 0.6], starts = share.map((_, i) => share.slice(0, i).reduce((s, v) => s + v, 0));
  const v1 = fallSpeed(), nf = (x, d) => x.toLocaleString(lang, { maximumFractionDigits: d, minimumFractionDigits: d });
  return anim2d(canvas, { span: 18, u0: 0, draw(ctx, W, H0, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H0);
    const H = H0 - bandH(W), { narrow, L, Rp } = split(W, H);
    // --- gauche : le canon
    const Re = Math.min(L[2], L[3]) * 0.3, cx = L[0] + L[2] / 2, cy = L[1] + L[3] / 2 + 10, S = Re; // 1 unité = Re px
    disc(ctx, cx, cy, Re, "#f6ecdc", "#7a6a4f", 2);
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - 9, cy - Re + 1); ctx.lineTo(cx, cy - r0 * S); ctx.lineTo(cx + 9, cy - Re + 1); ctx.stroke();
    let cur = 0; for (let i = 0; i < ks.length; i++) if (u >= starts[i]) cur = i;
    for (let i = 0; i <= cur; i++) {
      const sh = shots[i], f = i < cur ? 1 : Math.min(1, (u - starts[i]) / share[i]), tEnd = f * sh.T;
      ctx.strokeStyle = sh.orbit ? GLOBE : FLAT; ctx.lineWidth = sh.orbit ? 2 : 1.4; ctx.setLineDash(sh.orbit ? [] : [4, 3]);
      ctx.beginPath(); let last = sh.pts[0];
      for (const p of sh.pts) { if (p[2] > tEnd) break; const X = cx + p[0] * S, Y = cy - p[1] * S; p === sh.pts[0] ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); last = p; }
      ctx.stroke(); ctx.setLineDash([]);
      if (i === cur) disc(ctx, cx + last[0] * S, cy - last[1] * S, 4, INK);
    }
    arrow(ctx, cx + 3, cy - r0 * S, cx + 34, cy - r0 * S, INK, 1.4);
    text(ctx, `v = ${nf(ks[cur], 2)} v₁`, L[0] + 8, L[1] + 16, { size: 12, bold: true, mono: true });
    text(ctx, shots[cur].orbit ? tr("an-fall-orbit", "falls all the way round: an orbit") : tr("an-fall-lands", "falls back to the ground"), L[0] + 8, L[1] + 32, { size: 10.5, c: shots[cur].orbit ? GLOBE : FLAT, maxW: L[2] - 16 });
    text(ctx, tr("an-fall-st1", "mountain 0.12 R high: not to scale"), L[0] + 8, L[1] + L[3] - 10, { size: 10, c: FLAT, maxW: L[2] - 16, up: true });
    // --- droite : les 200 premières secondes, à l'échelle vraie
    const span = 1700e3, X0 = Rp[0] + 14, k = (Rp[2] - 28) / span, top = Rp[1] + (narrow ? 44 : 64), alt = 30e3;
    const tS = Math.min(200, ((u * 18) % 18) / 16 * 200), vh = Math.sqrt(FALL.g * FALL.R * FALL.R / (FALL.R + alt));
    const toXY = (s, z) => { const th = s / FALL.R, rr = FALL.R + z; return [X0 + rr * Math.sin(th) * k, top + (FALL.R + alt - rr * Math.cos(th)) * k]; };
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2; ctx.beginPath();
    for (let s = 0; s <= span * 1.02; s += span / 60) { const [x, y] = toXY(s, 0); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = FAINT; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X0, top); ctx.lineTo(X0 + span * k, top); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let t = 0; t <= tS; t += 2) { const [x, y] = toXY(vh * t * FALL.R / (FALL.R + alt), alt); t ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    const [bx, by] = toXY(vh * tS * FALL.R / (FALL.R + alt), alt), ahead = vh * tS, fallen = 0.5 * FALL.g * tS * tS;
    ctx.strokeStyle = FLAT; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx, top); ctx.lineTo(bx, by); ctx.stroke();
    disc(ctx, bx, by, 4, INK);
    text(ctx, tr("an-fall-tan", "straight on, without gravity"), X0 + 4, top - 6, { size: 10, c: SOFT, maxW: Rp[2] - 28 });
    text(ctx, `t = ${nf(tS, 0)} s`, Rp[0] + 8, Rp[1] + (narrow ? 18 : 24), { size: 12, bold: true, mono: true });
    text(ctx, `${tr("an-fall-ahead", "ahead")} vt = ${nf(ahead / 1e3, 0)} km`, Rp[0] + 8, Rp[1] + Rp[3] - 12, { size: 10.5, mono: true });
    stamp2d(ctx, W, `${tr("an-fall-st", "right: true scale")} · v₁ = √(gR) = ${nf(v1 / 1e3, 1)} km/s`, false);
    // la condition d'orbite, avec les valeurs de l'instant
    const kc = ks[cur], acc = kc * kc;   // v²/r en unités de GM/r² au départ
    formulaBand(ctx, W, H0, [
      [`v²/r = ${nf(acc, 2)} × GM/r²  ${shots[cur].orbit ? "= GM/r² : " + tr("an-fall-f1", "the pull only bends the path, it falls around") : "< GM/r² : " + tr("an-fall-f2", "the pull wins, it lands")}`, shots[cur].orbit ? GLOBE : FLAT],
      [`½gt² = ${nf(fallen / 1e3, 1)} km ≈ (vt)²/2R = ${nf(ahead * ahead / 2 / FALL.R / 1e3, 1)} km  ⇒  v = √(gR) = ${nf(v1 / 1e3, 2)} km/s`],
      [`T = 2πR/v = 2π√(R/g) = ${nf(2 * Math.PI * FALL.R / v1 / 60, 0)} min`, SEA],
    ]);
  } });
}
