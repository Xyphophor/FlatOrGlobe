// Animations de l'onglet aether (2026-10-25, propriétaire : « il faut des cartes et quelques animations »). Quatre
// expériences de pensée dessinées dans le bon référentiel, chacune avec sa vitesse exagérée annoncée (règle 1) :
// la lunette sous la lumière d'une étoile (Bradley), les deux bras de Michelson dans un vent d'éther, l'horloge de
// lumière, la boucle de Sagnac. Les temps sont ceux des formules de la page (logic.js), pas des approximations.
import { anim2d, arrow, text, disc, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";

const LIGHT = "#d97706";   // l'impulsion de lumière
/** Deux cadres côte à côte, ou l'un sous l'autre sur un écran étroit : [x, y, w, h]. */
function panels(W, H, top = 22, bottom = 30) {
  const side = W >= 520, h = H - top - bottom;
  return side ? [[0, top, W / 2, h], [W / 2, top, W / 2, h]] : [[0, top, W, h / 2], [0, top + h / 2, W, h / 2]];
}
const title = (ctx, P, s, c) => text(ctx, s, P[0] + 10, P[1] + 15, { size: 13, bold: true, c, maxW: P[2] - 20 });
const wrap = (x, a, b) => a + ((((x - a) % (b - a)) + (b - a)) % (b - a));

/** Bradley : la lumière tombe à c ; la lunette avance à v ; droite, la lumière tape la paroi ; penchée de v/c, elle arrive à l'œil. */
export function mountAberration(canvas, tr) {
  const beta = 0.35, cyc = 3.4, fall = 2.2, t0 = 0.4;   // t0 : la lumière entre dans le tube
  return anim2d(canvas, { span: cyc * 3, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = (u * cyc * 3) % cyc, P = panels(W, H);
    P.forEach((p, i) => {
      const tilt = i === 1, L = Math.min(p[3] * 0.62, 190), tw = Math.max(16, L * 0.13);
      const yTop = p[1] + (p[3] - L) / 2 + 8, yBot = yTop + L, c = L / fall, v = beta * c;
      const X = p[0] + p[2] * 0.5;   // la verticale de la lumière (référentiel de l'étoile)
      // pied du tube à t = 0 : la lumière, entrée au haut à t0, doit sortir au pied à t0 + fall (penché) ; le haut est en avance de L v/c
      const dx = tilt ? L * beta : 0, bot0 = tilt ? X - v * (t0 + fall) : X - v * t0;
      const bx = bot0 + v * Math.min(t, t0 + fall + 0.5), tx = bx + dx, nx = tw / 2;
      ctx.strokeStyle = INK; ctx.lineWidth = 2.4;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(tx + s * nx, yTop); ctx.lineTo(bx + s * nx, yBot); ctx.stroke(); }
      disc(ctx, bx, yBot + 9, 5, null, SOFT, 1.4);   // l'œil
      arrow(ctx, bx - 22, yBot + 24, bx + 22, yBot + 24, FLAT, 1.8, 7); text(ctx, "v", bx + 26, yBot + 28, { size: 12.5, c: FLAT });
      // la lumière : verticale ; perdue contre la paroi arrière du tube droit
      const yp = yTop + c * (t - t0), tHit = t0 + (tw / 2) / v, yHit = yTop + c * (tHit - t0);   // tube droit : la paroi arrière atteint la verticale de la lumière
      ctx.strokeStyle = "rgba(217,119,6,.35)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(X, p[1] + 22); ctx.lineTo(X, Math.min(yp, tilt ? yBot : yHit)); ctx.stroke(); ctx.setLineDash([]);
      if (!tilt) {
        if (t < tHit) disc(ctx, X, yp, 4.5, LIGHT);
        else { const xh = bx - nx; disc(ctx, xh, yHit, 6, null, FLAT, 2); text(ctx, tr("an-ab-lost", "hits the wall"), xh - 10, yHit + 4, { size: 12, c: FLAT, align: "right" }); }   // la marque suit la paroi
      } else if (yp < yBot) disc(ctx, X, yp, 4.5, LIGHT);
      else { disc(ctx, bx, yBot + 9, 7, null, GLOBE, 2.2); text(ctx, tr("an-ab-eye", "reaches the eye"), bx + 12, yBot + 12, { size: 12, c: GLOBE }); }
      if (tilt) text(ctx, "α", tx - 16, yTop + 18, { size: 12, c: GLOBE });
      title(ctx, p, tilt ? tr("an-ab-t2", "Tipped forward by α, tan α = v/c") : tr("an-ab-t1", "Pointed straight at the star"), tilt ? GLOBE : FLAT);
    });
    text(ctx, tr("an-ab-star", "starlight, falling at c"), 8, H - 10, { size: 12, c: LIGHT });
    stamp2d(ctx, W, tr("an-ab-st", "Earth's speed exaggerated 3,500×: v = 0.35 c"));
  } });
}

/** Michelson et Morley : dans le référentiel de l'appareil, un vent d'éther v le long d'un bras. Retour : 2L/c/(1−β²) contre 2L/c/√(1−β²). */
export function mountMM(canvas, tr, lang = "en") {
  const beta = 0.5, Lc = 1.1, hold = 1.6;
  const tPar = 2 * Lc / (1 - beta * beta), tPerp = 2 * Lc / Math.sqrt(1 - beta * beta), span = tPar + hold;
  const nf = (x) => x.toLocaleString(lang, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  return anim2d(canvas, { span, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * span, P = panels(W, H);
    P.forEach((p, i) => {
      const wind = i === 0, L = Math.min(p[2] * 0.52, p[3] * 0.56), sx = p[0] + p[2] * 0.2, sy = p[1] + p[3] * 0.78;
      const cpx = L / Lc;                                   // px par s : la lumière parcourt L en Lc
      const up = wind ? cpx * (1 - beta) : cpx, down = wind ? cpx * (1 + beta) : cpx, perp = wind ? cpx * Math.sqrt(1 - beta * beta) : cpx;
      const T1 = L / up + L / down, T2 = 2 * L / perp;
      // les bras, les miroirs, la lame
      ctx.strokeStyle = FAINT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + L, sy); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - L); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(sx + L, sy - 12); ctx.lineTo(sx + L, sy + 12); ctx.moveTo(sx - 12, sy - L); ctx.lineTo(sx + 12, sy - L); ctx.moveTo(sx - 9, sy + 9); ctx.lineTo(sx + 9, sy - 9); ctx.stroke();
      // l'impulsion de chaque bras
      const a = t < L / up ? sx + up * t : t < T1 ? sx + L - down * (t - L / up) : sx;
      const b = t < L / perp ? sy - perp * t : t < T2 ? sy - L + perp * (t - L / perp) : sy;
      if (t < T1) disc(ctx, a, sy, 5, GLOBE); if (t < T2) disc(ctx, sx, b, 5, SEA);
      text(ctx, "L", sx + L / 2, sy + 16, { size: 12.5, c: SOFT, align: "center" }); text(ctx, "L", sx - 10, sy - L / 2, { size: 12.5, c: SOFT, align: "right" });
      if (wind) for (let k = 0; k < 3; k++) { const y = p[1] + 34 + k * 12, x = wrap(p[0] + p[2] - (t * cpx * beta * 0.6) - k * 40, p[0] + p[2] * 0.45, p[0] + p[2] - 8); arrow(ctx, x, y, x - 22, y, "rgba(180,83,9,.6)", 1.4, 5); }
      // les retours : quand, et l'écart
      const yy = p[1] + p[3] - 6;
      const back = (T, col, lab, dy) => { if (t >= T) text(ctx, `${lab} ${nf(T / Lc)} L/c`, p[0] + p[2] - 10, yy - dy, { size: 12, c: col, align: "right", bold: true }); };
      back(T1, GLOBE, tr("an-mm-par", "along: back at"), 14); back(T2, SEA, tr("an-mm-perp", "across: back at"), 0);
      if (t >= Math.max(T1, T2)) {
        const same = Math.abs(T1 - T2) < 1e-9;
        text(ctx, same ? tr("an-mm-same", "together: no fringe moves") : tr("an-mm-late", "the along beam is late: fringes shift"), sx + 14, sy - L * 0.55, { size: 12.5, bold: true, c: same ? GLOBE : FLAT, maxW: p[2] * 0.62 });
      }
      title(ctx, p, wind ? tr("an-mm-t1", "If the Earth moved through the aether") : tr("an-mm-t2", "What Michelson and Morley measured (1887)"), wind ? FLAT : GLOBE);
    });
    stamp2d(ctx, W, tr("an-mm-st", "wind exaggerated 5,000×: v = c/2"));
  } });
}

/** L'horloge de lumière : au repos, un tic toutes les 2L/c ; à 0,6 c, toutes les γ 2L/c, γ = 1,25. Dix tics contre huit. */
export function mountClock(canvas, tr) {
  const beta = 0.6, g = 1 / Math.sqrt(1 - beta * beta), tick = 1, run = 10, span = run + 1.2;   // 10 s de marche, puis l'arrêt sur 10 contre 8
  return anim2d(canvas, { span, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = Math.min(u * span, run), P = panels(W, H);
    P.forEach((p, i) => {
      const moving = i === 1, L = Math.min(p[3] * 0.5, 140), yT = p[1] + (p[3] - L) / 2 + 6, yB = yT + L;
      const c = 2 * L / tick, v = beta * c, half = moving ? g * tick / 2 : tick / 2;   // durée d'un trajet de miroir à miroir
      const n = Math.floor(t / (2 * half) + 1e-9), s = t - n * 2 * half, goingUp = s < half, f = (goingUp ? s : s - half) / half;
      const x0 = p[0] + p[2] * 0.2, track = p[2] * 0.62, x = moving ? wrap(x0 + v * t, x0, x0 + track) : p[0] + p[2] * 0.5;
      const y = goingUp ? yB - f * L : yT + f * L;
      ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 18, yT); ctx.lineTo(x + 18, yT); ctx.moveTo(x - 18, yB); ctx.lineTo(x + 18, yB); ctx.stroke();
      if (moving) {   // la diagonale parcourue depuis le dernier miroir
        const back = (goingUp ? s : s - half) * v, x1 = x - back;
        if (x1 >= x0 - 1) { ctx.strokeStyle = "rgba(217,119,6,.55)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x1, goingUp ? yB : yT); ctx.lineTo(x, y); ctx.stroke(); }
        arrow(ctx, x - 18, yB + 20, x + 18, yB + 20, FLAT, 1.8, 7); text(ctx, "0.6 c", x + 22, yB + 24, { size: 12, c: FLAT });
      } else { ctx.strokeStyle = "rgba(217,119,6,.55)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, goingUp ? yB : yT); ctx.lineTo(x, y); ctx.stroke(); }
      disc(ctx, x, y, 4.5, LIGHT);
      text(ctx, `${tr("an-lc-ticks", "ticks")}: ${n}`, p[0] + p[2] - 10, p[1] + p[3] - 8, { size: 13, bold: true, c: moving ? FLAT : GLOBE, align: "right" });
      title(ctx, p, moving ? tr("an-lc-t2", "The same clock passing at 0.6 c: γ = 1.25") : tr("an-lc-t1", "A clock at rest"), moving ? FLAT : GLOBE);
    });
    text(ctx, tr("an-lc-foot", "same light speed c, longer zigzag: 10 ticks against 8"), 8, H - 10, { size: 12, c: SOFT, maxW: W - 16 });
    stamp2d(ctx, W, tr("an-lc-st", "speed exaggerated: 0.6 c"));
  } });
}

/** Sagnac : deux impulsions en sens opposés autour d'une boucle ; la lame est emportée à ωR. Retours 2πR/(c ∓ ωR). */
export function mountSagnac(canvas, tr, lang = "en") {
  const beta = 0.25, loop = 1.6, hold = 1.4, span = loop / (1 - beta) + hold;
  const nf = (x) => x.toLocaleString(lang, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  return anim2d(canvas, { span, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * span, P = panels(W, H);
    P.forEach((p, i) => {
      const turning = i === 1, R = Math.min(p[2], p[3]) * 0.3, cx = p[0] + p[2] / 2, cy = p[1] + p[3] / 2 + 8;
      const w = turning ? beta * 2 * Math.PI / loop : 0, c = 2 * Math.PI / loop;   // rad/s : la lumière fait un tour en `loop`
      const tCo = 2 * Math.PI / (c - w), tCt = 2 * Math.PI / (c + w), a0 = -Math.PI / 2;
      ctx.strokeStyle = FAINT; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
      const sAng = a0 + w * Math.min(t, tCo);    // la lame, emportée par la rotation (sens trigonométrique à l'écran : y vers le haut)
      const pt = (a, r = R) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
      if (turning) {   // le sens de rotation : un arc sous le centre, de gauche à droite (sens trigonométrique)
        ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath();
        for (let a = 3.6; a <= 5.8; a += 0.1) { const q = pt(a, R * 0.34); a === 3.6 ? ctx.moveTo(...q) : ctx.lineTo(...q); }
        ctx.stroke(); arrow(ctx, ...pt(5.55, R * 0.34), ...pt(5.95, R * 0.34), INK, 1.6, 7);
        text(ctx, "Ω", cx, cy + 5, { size: 13, align: "center", bold: true });
      }
      if (t < tCo) disc(ctx, ...pt(a0 + c * t, R + 5), 4.5, FLAT);
      if (t < tCt) disc(ctx, ...pt(a0 - c * t, R - 5), 4.5, GLOBE);
      const sp = pt(sAng); disc(ctx, sp[0], sp[1], 6, INK);
      const yy = p[1] + p[3] - 6;
      if (t >= tCt) text(ctx, `${tr("an-sg-ct", "against the turn")}: ${nf(tCt / loop)}`, p[0] + 10, yy - 14, { size: 12, c: GLOBE, bold: true });
      if (t >= tCo) text(ctx, `${tr("an-sg-co", "with the turn")}: ${nf(tCo / loop)}`, p[0] + 10, yy, { size: 12, c: FLAT, bold: true });
      title(ctx, p, turning ? tr("an-sg-t2", "Turning loop: one beam is late") : tr("an-sg-t1", "Loop at rest: back together"), turning ? FLAT : GLOBE);
    });
    text(ctx, tr("an-sg-unit", "times in light-laps of the loop at rest"), W - 8, H - 10, { size: 10, c: SOFT, align: "right" });
    stamp2d(ctx, W, tr("an-sg-st", "rim speed exaggerated: c/4"));
  } });
}
