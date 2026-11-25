// « Aplatir la Terre » (epic06/UC04, demande du propriétaire 2026-09-24) :
// une figure animée à deux vues, partagée par dip, hh et sim. La courbure
// passe de 100 % (sphère de rayon R) à 0 % (plan) : entre les deux, la
// surface est une sphère de rayon R/c, jamais un axe étiré.
//
//  - vue de côté (orthographique) : échelle UNIFORME ; l'exagération
//    verticale est obtenue en multipliant les hauteurs par ex ET en divisant
//    le rayon de la planète par ex (règle 1), et le facteur est écrit ;
//  - vue de l'œil : angles VRAIS, calculés par les fonctions pures
//    ci-dessous sur la vraie géométrie (jamais lus sur le dessin), à la même
//    échelle angulaire en hauteur et en largeur.
//
// Géométrique : pas de réfraction dans le dessin ; les lectures donnent la
// valeur réfractée (k = 0,13, globe seulement) À CÔTÉ de la valeur brute
// (règle 3).
import { setupCanvas } from "./canvas.js";
import { reducedMotion, frameStep, exportBusy } from "./motion.js";
import { makeT } from "./i18n.js";
import { keyClickable } from "./a11y.js";

// ---- géométrie pure, courbure c (1 = globe de rayon R, 0 = plan) ----
// Formes stables quand R/c est immense (1 − cos → 2 sin²).

/** Dip de l'horizon (rad) pour un œil à h mètres, courbure c. */
export function dipC(R, c, h) {
  if (c <= 0) return 0;
  const Rc = R / c;
  return Math.atan2(Math.sqrt(h * (2 * Rc + h)), Rc);
}

/** Élévation (rad) du point de hauteur h à distance d (arc), œil à e. */
export function elevC(R, c, e, d, h) {
  if (c <= 0) return Math.atan2(h - e, d);
  const Rc = R / c, t = d / Rc;
  return Math.atan2(h * Math.cos(t) - 2 * Rc * Math.sin(t / 2) ** 2 - e, (Rc + h) * Math.sin(t));
}

/** Hauteur cachée (m) d'une cible à distance d, œil à e (0 sur le plan). */
export function hiddenC(R, c, e, d) {
  if (c <= 0) return 0;
  const Rc = R / c, dl = d / Rc - dipC(R, c, e);
  if (dl <= 0) return 0;
  return (2 * Rc * Math.sin(dl / 2) ** 2) / Math.cos(dl);
}

/** Courbure au temps t (s) d'un cycle : globe 2 s, aplatir 3,5 s, plan 2 s, recourber 3,5 s. */
export const CYCLE = 11;
export function curvAt(t) {
  const u = ((t % CYCLE) + CYCLE) % CYCLE;
  const ease = (x) => x * x * (3 - 2 * x);
  if (u < 2) return 1;
  if (u < 5.5) return 1 - ease((u - 2) / 3.5);
  if (u < 7.5) return 0;
  return ease((u - 7.5) / 3.5);
}

// ---- formats ----
const arcmin = (rad) => {
  const m = (rad * 180 / Math.PI) * 60;
  if (Math.abs(m) >= 60) return `${(m / 60).toFixed(2)}°`;
  return `${m >= 0 ? "+" : "−"}${Math.abs(m).toFixed(1)}′`;
};
const niceEx = (x) => { const p = 10 ** Math.floor(Math.log10(x)); const f = x / p; return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p; };
const km = (m) => `${Math.round(m / 1000).toLocaleString("en-US")} km`;

// tranches d'une tour (mode "hide") : mêmes couleurs dans les deux vues, pour
// voir le bas passer derrière l'eau au lieu d'une tour qui rapetisse
const BANDS = ["#2563eb", "#059669", "#7c3aed", "#db2777", "#475569", "#0891b2"];
const COL = {
  skyTop: "#dfeaf5", skyBot: "#f5f2ea", sea: "#9fb9c9", seaDeep: "#7f9fb3", soil: "#d8ccb2", soilDeep: "#b9a987",
  ground: "#7a6a4f", ray: "#0f766e", hidden: "#b45309", ink: "#151a21", mute: "#5b6470", faint: "#697381", eye: "#c9ced6",
  // faint : 4,6:1 sur blanc (WCAG AA) -- c'est lui qui porte le facteur d'exagération (epic06/UC03)
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement|null} readsEl
 * @param {object} cfg
 *   mode: "dip" | "hide" | "elev" ; R (m) ; k (réfraction des lectures) ;
 *   e : hauteur d'œil (m) ; surface : "sea" | "land" ;
 *   targets : [{ name, d (m), h (m), w (m, largeur réelle, "hide"), color }]
 *   (pour "elev", les deux premières cibles font la comparaison lue).
 */
export function mountFlatten(canvas, readsEl, cfg) {
  const t = makeT(document.documentElement.lang || "en", "flatten");
  const { R, e, mode } = cfg;
  const Rg = R / (1 - cfg.k);
  const T = cfg.targets || [];
  const st = { time: 0, last: 0, raf: null, vis: true, playing: !reducedMotion() };
  canvas.style.cursor = "pointer";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", t("aria"));
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); else draw(); });
  keyClickable(canvas);

  // étendue de la vue de côté et champ de la vue de l'œil : fixés sur le
  // GLOBE et gardés pendant toute l'animation (même cadre, comparaison honnête)
  const d0 = Math.sqrt(2 * R * e);
  const span = mode === "dip" ? 1.25 * d0 : 1.08 * Math.max(...T.map((q) => q.d));
  const topTrue = Math.max(e, ...T.map((q) => q.h));
  let angMin, angMax;
  if (mode === "dip") { const dp = dipC(R, 1, e); angMin = -1.7 * dp; angMax = 0.35 * dp; }
  else {
    const a = [0];
    for (const c of [1, 0]) for (const q of T) { a.push(elevC(R, c, e, q.d, q.h)); if (mode === "hide") a.push(c ? -dipC(R, 1, e) : elevC(R, 0, e, q.d, 0)); }
    const lo = Math.min(...a), hi = Math.max(...a), pad = 0.22 * (hi - lo);
    angMin = lo - pad; angMax = hi + pad;
  }

  function panels(W, H) {
    if (W >= 600) { const w = (W - 12) / 2; return [{ x: 0, y: 24, w, h: H - 24 }, { x: w + 12, y: 24, w, h: H - 24 }]; }
    const h = (H - 24 - 10) / 2;
    return [{ x: 0, y: 24, w: W, h }, { x: 0, y: 24 + h + 10, w: W, h }];
  }

  function txt(ctx, s, x, y, col = COL.mute, al = "left", f = "10px") {
    ctx.font = `${f} ui-monospace, Menlo, monospace`; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(s, x, y);
  }
  // étiquette gardée entière dans son panneau (sinon le clip la coupe)
  function label(ctx, P, s, x, y, col, al = "left", f = "10px") {
    ctx.font = `${f} ui-monospace, Menlo, monospace`;
    const w = ctx.measureText(s).width, x0 = al === "left" ? x : al === "right" ? x - w : x - w / 2;
    const dx = Math.max(P.x + 3 - x0, 0) + Math.min(P.x + P.w - 3 - (x0 + w), 0);
    txt(ctx, s, x + dx, y, col, al, f);
  }

  // ---- vue de côté ----
  function drawSide(ctx, P, c) {
    const padL = 14, padR = 14, padT = 16, padB = 30;
    const s = (P.w - padL - padR) / span;                       // px par mètre, les deux axes
    const Vpx = P.h - padT - padB;
    // ex : la scène du GLOBE (plus haut sommet + chute au bout) tient dans 85 % de la hauteur
    const ex = niceEx((0.85 * Vpx / s) / (topTrue + span * span / (2 * R)));
    const yb = P.y + padT + topTrue * ex * s + 8;                // surface sous l'observateur
    const x0 = P.x + padL;
    const cc = Math.max(c, 1e-7), Rd = R / (cc * ex);           // planète rétrécie, même échelle
    const S = (X, Y) => [x0 + X * s, yb - Y * s];               // monde dessiné -> écran
    const surf = (x) => { const th = x / Rd; return S(Rd * Math.sin(th), -2 * Rd * Math.sin(th / 2) ** 2); };

    ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    const sky = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); sky.addColorStop(0, COL.skyTop); sky.addColorStop(1, COL.skyBot);
    ctx.fillStyle = sky; ctx.fillRect(P.x, P.y, P.w, P.h);
    // surface
    const N = 160, xs = [];
    for (let i = 0; i <= N; i++) xs.push(surf(span * 1.1 * i / N));
    ctx.beginPath(); xs.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.lineTo(P.x + P.w, P.y + P.h); ctx.lineTo(P.x, P.y + P.h); ctx.lineTo(x0, yb); ctx.closePath();
    const g = ctx.createLinearGradient(0, yb, 0, P.y + P.h);
    if (cfg.surface === "sea") { g.addColorStop(0, COL.sea); g.addColorStop(1, COL.seaDeep); } else { g.addColorStop(0, COL.soil); g.addColorStop(1, COL.soilDeep); }
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = cfg.surface === "sea" ? "#5f7f93" : COL.ground; ctx.lineWidth = 1.8;
    ctx.beginPath(); xs.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    // observateur : un pilier/relief sous l'œil
    const eyeD = e * ex, E = S(0, eyeD);
    ctx.fillStyle = cfg.surface === "sea" ? "#a89878" : "#b3a17c";
    ctx.beginPath(); ctx.moveTo(x0 - 10, yb + 2); ctx.lineTo(E[0] - 2, E[1] + 3); ctx.lineTo(E[0] + 2, E[1] + 3); ctx.lineTo(x0 + 10, yb + 2); ctx.closePath(); ctx.fill();
    // ligne de l'œil (horizontale locale)
    ctx.setLineDash([5, 4]); ctx.strokeStyle = COL.eye; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(P.x + P.w, E[1]); ctx.stroke(); ctx.setLineDash([]);
    // rayon rasant : tangente de l'œil à la surface (monde dessiné)
    const th0 = Math.atan2(Math.sqrt(eyeD * (2 * Rd + eyeD)), Rd);
    const Tp = S(Rd * Math.sin(th0), -2 * Rd * Math.sin(th0 / 2) ** 2);
    const dir = [Tp[0] - E[0], Tp[1] - E[1]], L = Math.hypot(...dir) || 1;

    if (mode === "dip") {
      const far = 3 * Math.max(P.w, P.h);
      ctx.strokeStyle = COL.ray; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(E[0] + dir[0] / L * far, E[1] + dir[1] / L * far); ctx.stroke();
      const inside = Tp[0] < P.x + P.w - 8;
      if (inside) { ctx.fillStyle = COL.ray; ctx.beginPath(); ctx.arc(Tp[0], Tp[1], 3.5, 0, 7); ctx.fill(); label(ctx, P, t("horizon"), Tp[0], Tp[1] - 8, COL.ray, "center"); }
      else txt(ctx, t("horizon-far"), P.x + P.w - 6, E[1] - 6, COL.ray, "right");
      // l'angle, marqué à l'œil ; sa VALEUR vient de dipC (vraie géométrie)
      const a = Math.atan2(dir[1], dir[0]);
      ctx.strokeStyle = COL.hidden; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(E[0], E[1], 34, 0, a); ctx.stroke();
      label(ctx, P, `${t("dip")} ${arcmin(dipC(R, c, e)).replace("+", "")}`, E[0] + 40, E[1] + 16, COL.hidden, "left", "600 11px");
    }
    if (mode === "hide" || mode === "elev") {
      for (const q of T) {
        const th = q.d / Rd;
        const B = S(Rd * Math.sin(th), -2 * Rd * Math.sin(th / 2) ** 2);
        const up = [Math.sin(th), Math.cos(th)];                  // radiale (monde), y vers le haut
        const Top = [B[0] + up[0] * q.h * ex * s, B[1] - up[1] * q.h * ex * s];
        if (mode === "hide") {
          // hauteur cachée DANS LE MONDE DESSINÉ (cohérente avec le trait) ; la lecture chiffrée est la vraie
          const dl = th - th0, hidD = dl > 0 ? (2 * Rd * Math.sin(dl / 2) ** 2) / Math.cos(dl) : 0;
          const hidPx = Math.min(q.h * ex, hidD) * s;
          const Hh = [B[0] + up[0] * hidPx, B[1] - up[1] * hidPx];
          const at = (m) => { const px = m * ex * s; return [B[0] + up[0] * px, B[1] - up[1] * px]; };
          const hidM = hidPx / (ex * s), cuts = [0, ...(q.bands || []), q.h];
          ctx.lineCap = "butt"; ctx.lineWidth = 7;
          for (let i = 0; i < cuts.length - 1; i++) {
            const lo = cuts[i], hi = cuts[i + 1], col = BANDS[i % BANDS.length];
            if (hidM > lo) { ctx.globalAlpha = 0.3; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(...at(lo)); ctx.lineTo(...at(Math.min(hi, hidM))); ctx.stroke(); ctx.globalAlpha = 1; }
            if (hi > hidM) { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(...at(Math.max(lo, hidM))); ctx.lineTo(...at(hi)); ctx.stroke(); }
          }
          // la partie cachée, soulignée en ambre à côté de la tour
          if (hidPx > 0.5) { const o = [-up[1] * 6, -up[0] * 6]; ctx.strokeStyle = COL.hidden; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B[0] + o[0], B[1] + o[1]); ctx.lineTo(Hh[0] + o[0], Hh[1] + o[1]); ctx.stroke(); }
          // globe : le rayon rasant jusqu'au premier point vu ; plan : la visée du pied, rien ne le cache
          ctx.strokeStyle = COL.ray; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(E[0], E[1]);
          const tEnd = hidD > 0 ? Hh : B;
          ctx.lineTo(tEnd[0], tEnd[1]); ctx.stroke();
          label(ctx, P, q.name, Top[0] - 4, Top[1] - 6, COL.ink, "right");
        } else {
          ctx.fillStyle = q.color + "cc";
          const bw = 7 + 0.06 * P.w * (q.d / span) * 0.5;
          ctx.beginPath(); ctx.moveTo(B[0] - bw, B[1] + 1); ctx.lineTo(Top[0], Top[1]); ctx.lineTo(B[0] + bw, B[1] + 1); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = q.color; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(Top[0], Top[1]); ctx.stroke();
          label(ctx, P, q.name, Top[0], Top[1] - 7, q.color, "center");
        }
      }
    }
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(E[0], E[1], 3.5, 0, 7); ctx.fill();
    txt(ctx, t("eye"), E[0] + 6, E[1] - 6, COL.mute);
    ctx.restore();
    txt(ctx, t("side-stamp").replaceAll("{ex}", ex.toLocaleString("en-US")), P.x + 6, P.y + P.h - 17, COL.faint);
    txt(ctx, t("side-stamp2").replace("{km}", km(span)), P.x + 6, P.y + P.h - 5, COL.faint);
    ctx.strokeStyle = "rgba(21,26,33,.12)"; ctx.lineWidth = 1; ctx.strokeRect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1);
  }

  // ---- vue de l'œil ----
  function drawEye(ctx, P, c) {
    const padT = 8, padB = 30, padL = 40;
    const k = (P.h - padT - padB) / (angMax - angMin);            // px par radian, les deux axes
    const Y = (a) => P.y + padT + (angMax - a) * k;
    const cx = P.x + padL + (P.w - padL) / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    const sky = ctx.createLinearGradient(0, P.y, 0, P.y + P.h); sky.addColorStop(0, COL.skyTop); sky.addColorStop(1, COL.skyBot);
    ctx.fillStyle = sky; ctx.fillRect(P.x, P.y, P.w, P.h);
    const hz = -dipC(R, c, e), yH = Y(hz);
    if (cfg.surface === "sea") {
      const g = ctx.createLinearGradient(0, yH, 0, P.y + P.h); g.addColorStop(0, COL.sea); g.addColorStop(1, COL.seaDeep);
      ctx.fillStyle = g; ctx.fillRect(P.x, yH, P.w, P.y + P.h - yH);
      ctx.strokeStyle = "#5f7f93"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.x, yH); ctx.lineTo(P.x + P.w, yH); ctx.stroke();
      txt(ctx, t("horizon"), P.x + P.w - 6, yH + 13, "#35566a", "right");
    }
    if (mode === "hide") {
      for (const q of T) {
        const top = elevC(R, c, e, q.d, q.h);
        const base = c > 0 && hiddenC(R, c, e, q.d) > 0 ? hz : elevC(R, c, e, q.d, 0);
        const hw = Math.atan2(q.w / 2, q.d) * k, cuts = [0, ...(q.bands || []), q.h];
        const aH = (m) => elevC(R, c, e, q.d, m);
        for (let i = 0; i < cuts.length - 1; i++) {                // chaque tranche à SA hauteur vraie
          const y0 = Math.max(aH(cuts[i]), base), y1 = aH(cuts[i + 1]);
          if (y1 > y0) { ctx.fillStyle = BANDS[i % BANDS.length]; ctx.fillRect(cx - hw, Y(y1), 2 * hw, Y(y0) - Y(y1)); }
        }
        for (const m of q.bands || []) if (aH(m) > base) {             // repères de hauteur, côté gauche
          ctx.strokeStyle = COL.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - hw - 5, Y(aH(m))); ctx.lineTo(cx - hw, Y(aH(m))); ctx.stroke();
          label(ctx, P, `${m} m`, cx - hw - 7, Y(aH(m)) + 3, COL.mute, "right", "9px");
        }
        label(ctx, P, q.name, cx + hw + 6, Y(top) + 10, COL.ink);
      }
    }
    if (mode === "elev") {
      const n = T.length;
      [...T].map((q, i) => ({ q, i })).sort((a, b) => b.q.d - a.q.d).forEach(({ q, i }) => {
        const a = elevC(R, c, e, q.d, q.h), x = P.x + padL + (P.w - padL) * (i + 1) / (n + 1), bw = 0.28 * (P.w - padL) / (n + 1);
        ctx.fillStyle = q.color + (q.d > 30000 ? "88" : "cc");
        ctx.beginPath(); ctx.moveTo(x - bw * 2.2, P.y + P.h); ctx.lineTo(x, Y(a)); ctx.lineTo(x + bw * 2.2, P.y + P.h); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = q.color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 16, Y(a)); ctx.lineTo(x + 16, Y(a)); ctx.stroke();
        label(ctx, P, `${q.name} ${arcmin(a)}`, x, Y(a) - 6, COL.ink, "center");
      });
    }
    // ligne de l'œil et échelle angulaire
    ctx.setLineDash([5, 4]); ctx.strokeStyle = "#8b93a0"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(P.x + padL, Y(0)); ctx.lineTo(P.x + P.w, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    txt(ctx, t("eye-level"), P.x + padL + 4, Y(0) - 5, COL.mute);
    const spanMin = (angMax - angMin) * 180 / Math.PI * 60;
    const stepMin = [1, 2, 5, 10, 15, 30, 60, 120][[1, 2, 5, 10, 15, 30, 60, 120].findIndex((v) => spanMin / v <= 7)] || 240;
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(P.x, P.y, padL - 4, P.h - padB + 4);
    for (let m = Math.ceil(angMin * 10800 / Math.PI / stepMin) * stepMin; m <= angMax * 10800 / Math.PI; m += stepMin) {
      const y = Y(m * Math.PI / 10800);
      ctx.strokeStyle = COL.faint; ctx.beginPath(); ctx.moveTo(P.x + padL - 8, y); ctx.lineTo(P.x + padL - 4, y); ctx.stroke();
      txt(ctx, (Math.abs(m) >= 60 && m % 60 === 0 ? `${m / 60}°` : `${m}′`).replace("-", "−"), P.x + padL - 10, y + 3, COL.faint, "right", "9px");
    }
    ctx.restore();
    txt(ctx, t("eye-stamp").replace("{f}", arcmin(angMax - angMin).replace("+", "")), P.x + 6, P.y + P.h - 17, COL.faint);
    txt(ctx, t(mode === "elev" ? "eye-stamp2-elev" : "eye-stamp2"), P.x + 6, P.y + P.h - 5, COL.faint);
    ctx.strokeStyle = "rgba(21,26,33,.12)"; ctx.lineWidth = 1; ctx.strokeRect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1);
  }

  // lectures : des pastilles courtes (.reads .r ne passe pas à la ligne, 380 px)
  function reads(c) {
    if (!readsEl) return;
    const r = (x) => `<span class="r">${x}</span>`;
    let now, globe, plane;
    if (mode === "dip") {
      const f = (x) => arcmin(x).replace("+", "");
      now = `${t("r-dip")} <b>${f(dipC(R, c, e))}</b>`;
      globe = `${t("globe")} ${f(dipC(R, 1, e))} <span class="sub">k = ${cfg.k} : ${f(dipC(Rg, 1, e))}</span>`;
      plane = `${t("plane-w")} 0′`;
    } else if (mode === "hide") {
      const q = T[0], f = (m) => `${Math.round(m).toLocaleString("en-US")} m`;
      now = `${t("r-hidden").replace("{name}", q.name)} <b>${f(hiddenC(R, c, e, q.d))}</b>`;
      globe = `${t("globe")} ${f(hiddenC(R, 1, e, q.d))} <span class="sub">k = ${cfg.k} : ${f(hiddenC(Rg, 1, e, q.d))}</span>`;
      plane = `${t("plane-w")} 0 m`;
    } else {
      const [a, b] = T, diff = (RR, cc) => elevC(RR, cc, e, b.d, b.h) - elevC(RR, cc, e, a.d, a.h);
      now = `${t("r-diff").replace("{b}", b.name).replace("{a}", a.name)} <b>${arcmin(diff(R, c))}</b>`;
      globe = `${t("globe")} ${arcmin(diff(R, 1))} <span class="sub">k = ${cfg.k} : ${arcmin(diff(Rg, 1))}</span>`;
      plane = `${t("plane-w")} ${arcmin(diff(R, 0))}`;
    }
    const html = r(now) + r(globe) + r(plane) + r(`<span class="sub">${st.playing ? t("click-pause") : t("click-play")}</span>`);
    if (readsEl._last !== html) { readsEl.innerHTML = html; readsEl._last = html; }
  }

  function draw() {
    const w = canvas.getBoundingClientRect().width;
    if (!w) return;
    const want = w >= 600 ? Math.round(Math.min(380, w * 0.42)) : Math.round(Math.min(660, w * 1.3));
    if (canvas._h !== want) { canvas.style.height = want + "px"; canvas._h = want; }
    const { ctx, W, H } = setupCanvas(canvas);
    if (!W) return;
    const c = curvAt(st.time);
    ctx.clearRect(0, 0, W, H);
    const [A, B] = panels(W, H);
    txt(ctx, c <= 0 ? t("plane") : t("curv").replace("{pct}", Math.round(c * 100)).replace("{R}", km(R / c)), 4, 15, COL.ink, "left", "600 12px");
    drawSide(ctx, A, c); drawEye(ctx, B, c);
    reads(c);
  }

  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      const n = frameStep(st, ts);
      if (n) { st.time += n / 60; draw(); }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  // export (epic10/UC02) : l'animation rejouée à l'instant t, puis remise en état
  let saved = null;
  canvas.__anim = {
    duration: CYCLE,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(t) { st.time = t; draw(); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(); if (st.playing) loop(); },
  };
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((x) => x.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);
  return {
    start() { draw(); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
    draw,
    seek(s) { st.time = s; draw(); },         // vérifications hors navigateur
  };
}
