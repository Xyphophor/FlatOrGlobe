// Animation « deux horloges, deux couchers » (2026-10-03) : Mauna Loa (3 397 m,
// mesuré) et Keahole Point (4 m, calculé), sur la même horloge, le soir de
// MLO_FEATURED. Trois panneaux :
//   1. la coupe orthographique dans l'azimut du coucher. Règle 1 : la Terre est
//      dessinée PLUS PETITE (Rₑ/ex), les distances au sol ÷ √ex et les hauteurs
//      vraies -- une maquette où le rayon rasant et le point de tangence tombent
//      au même endroit que sur la vraie Terre ; ex est imprimé. Réfraction
//      standard (Rₑ = R/(1 − k), k = 0,13, plus 34′ au-delà du point de tangence).
//   2. le ciel vers l'ouest à chaque site, à l'échelle angulaire vraie : niveau
//      des yeux, horizon de mer, Soleil.
//   3. le pyrhéliomètre de Mauna Loa (W/m²) sur la même horloge.
// Les instants viennent de mlo.js (éphémérides) et de la mesure ; le dessin ne
// sert qu'à montrer, aucun angle n'y est lu.
import { figColor } from "../../core/theme.js";
import { setupCanvas } from "../../core/canvas.js";
import { reducedMotion, frameStep, exportBusy } from "../../core/motion.js";
import { refrArcmin } from "../../core/ephemeris.js";
import { MLO_FEATURED, MLO_SITE } from "../../data/presets/dip-mlo.js";
import { MLO_PROFILE } from "../../data/presets/dip-mlo-profile.js";
import { MLO, KEAHOLE, K_STD, R_KM, sunAt, seaDip, tangentArc, sunsetMin, keaholeFromMlo, mloStats } from "./mlo.js";

const DUR = 16, RUN = 13;       // s : 13 s de défilement, 3 s d'arrêt sur la fin
const D = 180 / Math.PI;
const css = (el, n, fb) => figColor(n, fb);

/** Minutes UTC → « 19:04:12 » en heure d'Hawaï (UTC − 10). */
function hst(m) { const s = Math.round(((m - 600) % 1440 + 1440) % 1440 * 60); const p = (x) => String(x).padStart(2, "0"); return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`; }

/** Hauteur apparente d'un rayon pour un œil à h m, réfraction ρ(e) : 0 → ρ au niveau de l'œil, −dip → ρ₀ + k·φ (le rayon rasant). */
function apparent(trueAlt, h) {
  const phi = tangentArc(h, K_STD), dip = seaDip(h, K_STD);              // dip apparent = φ − k·φ
  const p = Math.exp(-h / 8400);                                         // pression relative à l'œil (échelle de hauteur 8,4 km)
  const r0 = refrArcmin(0) / 60, rEye = r0 * p, rGraze = r0 + K_STD * phi;
  const rho = (e) => (e >= 0 ? (refrArcmin(Math.max(e - rEye, 0)) / 60) * p : rEye + (rGraze - rEye) * Math.min(1, -e / dip));
  let e = trueAlt; for (let i = 0; i < 30; i++) e = trueAlt + rho(e);
  return { e, dip };
}

export function mountMlo(canvas, readsEl, t, lang = "en") {
  const F = MLO_FEATURED, date = F.date;
  const kea = sunsetMin(KEAHOLE, date, true), kea0 = sunsetMin(KEAHOLE, date, false);
  const mlo = sunsetMin(MLO, date, true), mlo0 = sunsetMin(MLO, date, false), meas = F.t;
  const m0 = Math.floor(Math.min(kea, kea0) - 6), m1 = Math.ceil(Math.max(mlo, mlo0) + 3);
  const kf = keaholeFromMlo(), sunAz = sunAt(MLO, date, meas).az;
  const sAlong = kf.km * Math.cos((kf.az - sunAz) / D);                    // Keahole projeté sur l'azimut du coucher
  const st = mloStats();
  const num = (x, d = 0) => x.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const an = { t: 0, last: 0, raf: null, vis: true, playing: !reducedMotion() };
  // la date locale du soir : la veille de la date UTC
  const [yy, mm, dd] = date.split("-").map(Number), loc = new Date(Date.UTC(yy, mm - 1, dd - 1));
  const dayTxt = loc.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const clockAt = (s) => m0 + (m1 - m0) * Math.min(1, s / RUN);
  const dniAt = (m) => { const c = F.curve; for (let i = 0; i + 1 < c.length; i++) if (c[i][0] <= m && m <= c[i + 1][0]) { const [a, va] = c[i], [b, vb] = c[i + 1]; return va + (vb - va) * (m - a) / (b - a); } return null; };

  function draw() {
    const { ctx, W, H } = setupCanvas(canvas); if (!W) return;
    const globe = css(canvas, "--globe", "#2457d6"), flat = css(canvas, "--flat", "#b45309"), ink = "#151a21", soft = "#5b6472";
    const m = clockAt(an.t), sun = "#f2a900", small = W < 500;
    const fs = (px) => `${px}px system-ui, sans-serif`;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    // ---- en-tête : l'horloge commune
    ctx.fillStyle = ink; ctx.font = `700 ${small ? 20 : 24}px ui-monospace, monospace`; ctx.textAlign = "left";
    ctx.fillText(`${hst(m)} HST`, 10, small ? 24 : 28);
    ctx.font = fs(11); ctx.fillStyle = soft;
    ctx.fillText(`${dayTxt} · ${t("ml-clock", "one clock for both places")}`, 10, small ? 40 : 46);

    // ---- 1. la coupe
    const yA0 = small ? 50 : 56, yA1 = Math.round(H * 0.47), hA = yA1 - yA0;
    const h = MLO.h / 1000, s = (hA * 0.34) / h;                            // px par km, uniforme
    const Re = R_KM / (1 - K_STD), dT = Math.sqrt(2 * h * Re);             // km : distance du point de tangence (réfraction standard)
    const rex = Math.max(1, (dT * s) / (0.62 * W)), ex = rex * rex;        // √ex : distances ÷ √ex
    const Rd = Re / ex;                                                    // km (dessinés)
    const ox = W * 0.80, oy = yA1 - hA * 0.12 - h * s;                     // MLO à l'écran
    const P = (X, Y) => [ox - X * s, oy - Y * s];                          // X vers le Soleil (l'ouest, à gauche), Y vers le haut
    const C = [0, -Rd - h];                                                // centre de la Terre dessinée (MLO à h au-dessus de la surface)
    const onSurf = (x, z = 0) => { const th = x / rex / Rd; return [C[0] + (Rd + z) * Math.sin(th), C[1] + (Rd + z) * Math.cos(th)]; };
    const thK = sAlong / rex / Rd;
    // angle dessiné du rayon rasant, calé pour passer par Keahole à son coucher et par MLO au sien
    const AK = -thK - Math.acos(Rd / (Rd + KEAHOLE.h / 1000)), AM = -Math.acos(Rd / (Rd + h));
    const A = AK + (AM - AK) * (m - kea) / (mlo - kea);
    const u = [Math.cos(A), Math.sin(A)], n = [-Math.sin(A), Math.cos(A)];
    ctx.save(); ctx.beginPath(); ctx.rect(0, yA0, W, hA); ctx.clip();
    ctx.fillStyle = "#fbf3dc"; ctx.fillRect(0, yA0, W, hA);                // ciel éclairé
    // l'ombre de la Terre : la bande derrière le disque, du côté opposé au Soleil
    const L = 4 * Rd + 400 / s;
    const sh = [[C[0] + Rd * n[0], C[1] + Rd * n[1]], [C[0] + Rd * n[0] - L * u[0], C[1] + Rd * n[1] - L * u[1]],
      [C[0] - Rd * n[0] - L * u[0], C[1] - Rd * n[1] - L * u[1]], [C[0] - Rd * n[0], C[1] - Rd * n[1]]];
    ctx.beginPath(); sh.forEach((q, i) => { const [x, y] = P(...q); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
    ctx.fillStyle = "rgba(40,48,70,0.22)"; ctx.fill();
    // la Terre (mer) et le relief réel entre les deux sites (USGS, hauteurs vraies, distances ÷ √ex)
    const [cx, cy] = P(...C);
    ctx.beginPath(); ctx.arc(cx, cy, Rd * s, 0, 2 * Math.PI); ctx.fillStyle = "#cfe6ef"; ctx.fill(); ctx.strokeStyle = "#3d7f99"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath();
    MLO_PROFILE.forEach(([d, z], i) => { const [x, y] = P(...onSurf(d, Math.max(0, z) / 1000)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    for (const d of [MLO_PROFILE[MLO_PROFILE.length - 1][0], MLO_PROFILE[0][0]]) { const [x, y] = P(...onSurf(d, 0)); ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fillStyle = "#b9ab8f"; ctx.fill(); ctx.strokeStyle = "#7d6f55"; ctx.lineWidth = 1; ctx.stroke();
    // le rayon rasant (réfraction standard) et quelques rayons parallèles au-dessus
    const T = [C[0] + Rd * n[0], C[1] + Rd * n[1]];
    const ray = (off, w, col, dash) => { const a = [T[0] + n[0] * off + u[0] * L, T[1] + n[1] * off + u[1] * L], b = [T[0] + n[0] * off - u[0] * L, T[1] + n[1] * off - u[1] * L];
      ctx.beginPath(); ctx.moveTo(...P(...a)); ctx.lineTo(...P(...b)); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); };
    for (const k of [1, 2, 3]) ray((k * hA * 0.22) / s, 1, "rgba(242,169,0,0.45)");
    ray(0, 2, sun);
    { const [tx, ty] = P(...T); ctx.beginPath(); ctx.arc(tx, ty, 3, 0, 2 * Math.PI); ctx.fillStyle = sun; ctx.fill(); }
    ctx.restore();
    // les deux sites, éclairés ou non (instants calculés)
    const site = (q, lit, lab, sub, right) => {
      const [x, y] = P(...q);
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 2 * Math.PI); ctx.fillStyle = lit ? sun : "#4a5160"; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = fs(10); const wSub = ctx.measureText(sub).width;
      ctx.font = `600 ${fs(11)}`; const wLab = ctx.measureText(lab).width;
      // à droite du point s'il y a la place, sinon au-dessus, aligné à droite sur le bord
      const fits = x + 9 + Math.max(wSub, wLab) < W - 4, rx = right && fits;
      const tx = right && !fits ? W - 6 : x + (rx ? 9 : -9), ty = right && !fits ? y - 30 : y - 8;
      ctx.fillStyle = ink; ctx.textAlign = rx ? "left" : "right"; ctx.fillText(lab, tx, ty);
      ctx.font = fs(10); ctx.fillStyle = soft; ctx.fillText(sub, tx, ty + 12);
    };
    site(onSurf(sAlong, KEAHOLE.h / 1000), m < kea, "Keahole", t("ml-kea-sub", "4 m · computed"), false);
    site([0, 0], m < mlo, "Mauna Loa", t("ml-mlo-sub", "3,397 m · measured"), true);
    ctx.strokeStyle = sun; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, yA0 + 27); ctx.lineTo(24, yA0 + 27); ctx.stroke();
    ctx.font = fs(10); ctx.fillStyle = "#9a6b00"; ctx.textAlign = "left";
    ctx.fillText(t("ml-ray", "the last ray, grazing the sea"), 28, yA0 + 30);
    ctx.fillStyle = flat; ctx.textAlign = "right";
    ctx.fillText(t("ml-ex", "Earth drawn ×{ex} smaller, distances ÷{r}, heights true", { ex: num(ex), r: num(rex, 1) }), W - 6, yA0 + 12);

    // ---- 2. le ciel vers l'ouest, à chaque site, échelle angulaire vraie
    const yB0 = yA1 + 10, yB1 = Math.round(H * 0.74), hB = yB1 - yB0 - 16, gap = 8, wB = (W - 3 * gap) / 2;
    const top = 1.3, bot = -2.6, k = hB / (top - bot);                       // px par degré, mêmes deux axes
    const sky = (x0, who, label, lit) => {
      const y0 = yB0 + 14, Y = (a) => y0 + (top - a) * k;
      const sa = sunAt(who, date, m), ap = apparent(sa.alt, who.h), azs = (sa.az - sunAz) * Math.cos(sa.alt / D);
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, wB, hB); ctx.clip();
      ctx.fillStyle = lit ? "#f6e7c4" : "#cfd4e2"; ctx.fillRect(x0, y0, wB, hB);
      const sx = x0 + wB / 2 + azs * k, sy = Y(ap.e), r = Math.max(2, sa.sd * k);
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, 2 * Math.PI); ctx.fillStyle = sun; ctx.fill();
      ctx.fillStyle = "#7fb3c8"; ctx.fillRect(x0, Y(-ap.dip), wB, y0 + hB - Y(-ap.dip));   // la mer devant
      ctx.strokeStyle = ink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + wB, Y(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = fs(9.5); ctx.fillStyle = ink; ctx.textAlign = "left"; ctx.fillText(t("ml-eye", "eye level"), x0 + 4, Y(0) - 3);
      ctx.fillText(t("ml-hor", "sea horizon, {d}° below", { d: num(ap.dip, 2) }), x0 + 4, Y(-ap.dip) + 11);
      ctx.restore();
      ctx.strokeStyle = "#c9c4b8"; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, wB - 1, hB - 1);
      ctx.font = `600 ${fs(10.5)}`; ctx.fillStyle = ink; ctx.textAlign = "left"; ctx.fillText(label, x0, yB0 + 9);
    };
    sky(gap, KEAHOLE, t("ml-sky-kea", "Keahole Point, looking west"), m < kea);
    sky(2 * gap + wB, MLO, t("ml-sky-mlo", "Mauna Loa, looking west"), m < mlo);
    ctx.font = fs(9.5); ctx.fillStyle = soft; ctx.textAlign = "right";
    ctx.fillText(t("ml-sky-s", "true angular scale · standard refraction"), W - gap, yB1 + 1);

    // ---- 3. le pyrhéliomètre, même horloge ; légende sous l'axe (pas d'étiquettes sur les traits)
    const marks = [[kea, "#3d7f99", [], t("ml-m-kea", "Keahole sunset (computed)")], [meas, ink, [], t("ml-m-meas", "Mauna Loa, last direct light (measured)")],
      [mlo, globe, [4, 3], t("ml-m-mlo", "Mauna Loa, last edge (computed)")], [m, "#d33", [], t("ml-m-now", "now")]];
    // légende en flux : chaque entrée va à la ligne si elle ne tient plus
    ctx.font = fs(9.5);
    const lay = []; { let lx = 10, row = 0; for (const mk of marks) { const w = 18 + ctx.measureText(mk[3]).width + 14; if (lx + w > W - 6 && lx > 10) { lx = 10; row++; } lay.push([lx, row]); lx += w; } }
    const legRows = lay[lay.length - 1][1] + 1, yC0 = yB1 + 22, yC1 = H - 18 - legRows * 12 - 6, hC = yC1 - yC0, xl = 34, xr = W - 10;
    const X = (mm) => xl + (mm - m0) / (m1 - m0) * (xr - xl);
    const vmax = Math.max(50, ...F.curve.filter(([q]) => q >= m0 && q <= m1).map(([, v]) => v || 0)) * 1.1;
    const Yc = (v) => yC1 - (v / vmax) * hC;
    ctx.strokeStyle = "#c9c4b8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xl, yC0); ctx.lineTo(xl, yC1); ctx.lineTo(xr, yC1); ctx.stroke();
    ctx.font = fs(9.5); ctx.fillStyle = soft; ctx.textAlign = "right";
    for (const v of [0, 100, 200, 300, 400, 500].filter((q) => q < vmax)) ctx.fillText(String(v), xl - 4, Yc(v) + 3);
    ctx.textAlign = "center";
    for (let q = Math.ceil(m0 / 5) * 5; q <= m1; q += 5) ctx.fillText(hst(q).slice(0, 5), X(q), yC1 + 11);
    ctx.textAlign = "left"; ctx.fillText(t("ml-dni", "direct sunlight at Mauna Loa, W/m² (NOAA GML)"), 6, yC0 - 6);
    ctx.beginPath(); let pen = false;
    for (const [q, v] of F.curve) { if (q < m0 || q > m1 || v == null) { pen = false; continue; } const p = [X(q), Yc(Math.max(0, v))]; pen ? ctx.lineTo(...p) : ctx.moveTo(...p); pen = true; }
    ctx.strokeStyle = ink; ctx.lineWidth = 1.6; ctx.stroke();
    marks.forEach(([mm, col, dash], i) => { ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.lineWidth = i === 3 ? 1.6 : 1.3; ctx.beginPath(); ctx.moveTo(X(mm), yC0 + 12); ctx.lineTo(X(mm), yC1); ctx.stroke(); ctx.setLineDash([]); });
    const ly0 = H - legRows * 12 - 4;
    marks.forEach(([, col, dash, lab], i) => {
      const lx = lay[i][0], ly = ly0 + lay[i][1] * 12;
      ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(lx, ly - 3); ctx.lineTo(lx + 14, ly - 3); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = fs(9.5); ctx.fillStyle = col === ink ? ink : col; ctx.textAlign = "left"; ctx.fillText(lab, lx + 18, ly);
    });
  }

  // lectures fixes de la soirée montrée et de toute l'année
  if (readsEl) {
    const mins = (x) => num(x, 1);
    readsEl.innerHTML =
      `<span>${t("ml-r-kea", "Keahole sunset, computed: {a} ({b} without refraction)", { a: hst(kea), b: hst(kea0) })}</span>` +
      `<span>${t("ml-r-mlo", "Mauna Loa, last edge computed: {a} ({b} without refraction)", { a: hst(mlo), b: hst(mlo0) })}</span>` +
      `<span>${t("ml-r-meas", "Mauna Loa, last direct light measured: {a}, Sun's centre {d}° below the horizontal", { a: hst(meas), d: num(-sunAt(MLO, date, meas).alt, 2) })}</span>` +
      `<span>${t("ml-r-year", "{y}: {n} clear evenings with a sea horizon; last light with the Sun's centre {d}° below the horizontal (median), {a} min after Keahole's computed sunset", { y: MLO_SITE.year, n: st.n, d: num(-st.altMed, 2), a: mins(st.leadMed) })}</span>`;
  }

  function loop() {
    if (an.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      an.raf = null;
      if (!an.playing || !an.vis || canvas.closest("[hidden]")) { an.last = 0; return; }
      const k = frameStep(an, ts);
      if (k) { an.t = (an.t + k / 60) % DUR; draw(); }
      an.raf = requestAnimationFrame(step);
    };
    an.raf = requestAnimationFrame(step);
  }
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => { an.playing = !an.playing; an.last = 0; if (an.playing) loop(); else draw(); });
  canvas.setAttribute("tabindex", "0");
  canvas.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); canvas.click(); } });
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { an.vis = es.some((e) => e.isIntersecting); if (an.vis && !exportBusy()) loop(); }).observe(canvas);
  let saved = null;
  canvas.__anim = {
    duration: DUR,
    begin() { saved = { ...an }; if (an.raf) cancelAnimationFrame(an.raf); an.raf = null; },
    frameAt(s) { an.t = s; draw(); },
    end() { if (saved) Object.assign(an, saved, { raf: null, last: 0 }); saved = null; draw(); if (an.playing) loop(); },
    readout: () => "",
  };
  return {
    start() { draw(); if (an.playing) loop(); },
    stop() { if (an.raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(an.raf); an.raf = null; an.last = 0; },
    draw,
    times: { kea, kea0, mlo, mlo0, meas, m0, m1 },
  };
}
