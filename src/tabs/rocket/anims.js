// Animations de l'onglet rocket (2026-10-27, propriétaire : « des animations pour montrer la pression dans une chambre
// fermée, comment l'atmosphère n'a aucun rôle… le même système de billes qu'avec l'atmosphère »). Six animations, chacune
// un gaz de billes (balls.js, scenes.js) dont TOUTES les forces affichées sont mesurées : la somme des coups 2 m vₙ des
// billes sur chaque paroi, moyennée sur 1,5 à 3 s. Rien n'est tracé d'après une formule, sauf la courbe de Tsiolkovski
// posée à côté de la vitesse obtenue jet par jet. Billes grossies, gaz bien plus raréfié qu'un vrai : dit sur chaque cadre.
import { anim2d, text, stamp2d, INK, SOFT, FAINT, PAPER } from "../../core/anim2d.js";
import { boxGas, holeGas, rocketGas, freeFlight, fit, balls, walls, flame, rocketFill, push, ballR, P0, BOX, HOLE, RATE, P_AIR, FREE,
  GAS_C, AIR_C, PUSH_C, ROCKET, ROCKET_BODY } from "./scenes.js";

const nf = (lang, x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
/** Deux cadres côte à côte (large) ou l'un sous l'autre (étroit) : { a, b } en { x, y, w, h }. */
function split(W, H, top, bottom, ra = 0.5) {
  const side = W >= 560, h = H - top - bottom;
  return side ? { side, a: { x: 0, y: top, w: W * ra, h }, b: { x: W * ra, y: top, w: W * (1 - ra), h } }
    : { side, a: { x: 0, y: top, w: W, h: h * ra }, b: { x: 0, y: top + h * ra, w: W, h: h * (1 - ra) } };
}
const pct = (F) => (100 * F) / P0;

/* ---- A. la pression d'une boîte fermée : des coups, qui s'annulent ---------------------------------------------------- */
// 220 billes dans une boîte de côté 1, vitesses de Maxwell (σ = 1). Chaque paroi reçoit P₀ = N σ² (gaz 2D), affiché 100. À
// 8 s, chaque bille va √2 fois plus vite (la température double) : chaque coup est √2 fois plus fort et √2 fois plus
// fréquent, la pression double. Les quatre poussées s'annulent toujours : une boîte fermée ne va nulle part.
export function mountBox(canvas, tr, lang = "en") {
  const SPAN = 16, HEAT = 8, g = boxGas({ heatAt: HEAT });
  const grp = ["top", "bottom", "left", "right"], lab = { top: tr("an-w-top", "top"), bottom: tr("an-w-bottom", "bottom"), left: tr("an-w-left", "left"), right: tr("an-w-right", "right") };
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN; g.at(t);
    const hot = t >= HEAT;
    const TT = 8 + 17 * text(ctx, hot ? tr("an-box-t2", "Heated: every ball √2 times faster") : tr("an-box-t1", "A closed box of gas"), 10, 16, { size: W < 560 ? 12 : 13, bold: true, maxW: W - 20 });
    const P = split(W, H, TT, 26, 0.56);
    // la boîte
    const V = fit(P.a, { x0: -0.42, x1: 1.42, y0: -0.42, y1: 1.42 }), r = ballR(V);
    ctx.fillStyle = "#fff7ed"; ctx.fillRect(V.X(0), V.Y(1), V.s, V.s);
    balls(ctx, g.balls, V, r); walls(ctx, g.wallsAt(t), V);
    const k = (0.2 * V.s) / P0, F = Object.fromEntries(grp.map((q) => [q, g.force(q, 1.5)]));   // 100 = 0,2 côté
    const mid = { top: [0.5, 1], bottom: [0.5, 0], left: [0, 0.5], right: [1, 0.5] };
    for (const q of grp) { const [x, y] = mid[q]; push(ctx, V.X(x), V.Y(y), F[q].x * k, -F[q].y * k); }
    // les relevés
    const x0 = P.b.x + (P.side ? 10 : 12), lh = P.side ? 21 : 17, yh = P.b.y + (P.side ? 22 : 14);
    const y0 = yh + 4 + 14 * text(ctx, tr("an-box-push", "push on each wall (closed box at the start = 100)"), x0, yh, { size: 10.5, c: SOFT, maxW: P.b.w - 20 }) - (P.side ? 0 : lh);
    grp.forEach((q, i) => { const f = Math.hypot(F[q].x, F[q].y); text(ctx, `${lab[q]}: ${nf(lang, pct(f))}`, x0 + (P.side ? 0 : (i % 2) * (P.b.w / 2)), y0 + lh * (P.side ? i + 1 : 1 + Math.floor(i / 2)), { size: 12.5, mono: true, c: PUSH_C }); });
    const sx = F.top.x + F.bottom.x + F.left.x + F.right.x, sy = F.top.y + F.bottom.y + F.left.y + F.right.y;
    const yS = y0 + lh * (P.side ? 5.3 : 3.2);
    text(ctx, `${tr("an-box-sum", "sum of the four")}: ${nf(lang, pct(Math.hypot(sx, sy)))}`, x0, yS, { size: 13, bold: true, mono: true });
    text(ctx, `${tr("an-box-hits", "hits on the right wall per second")}: ${nf(lang, rateHits(g, "right"))}`, x0, yS + lh, { size: 10.5, c: SOFT, maxW: P.b.w - 20 });
    text(ctx, hot ? tr("an-box-n2", "√2 harder × √2 more often = pressure × 2; still no net push") : tr("an-box-n1", "the four pushes cancel: a closed box goes nowhere"), x0, yS + 2 * lh, { size: 11, c: INK, maxW: P.b.w - 20 });
    stamp2d(ctx, W, tr("an-box-st", "balls enlarged; no collisions between them; pushes measured from the hits (2 m v per hit)"), false, H);
  } });
}
// coups par seconde sur une paroi (moyenne 1,5 s), lus dans l'historique du gaz
function rateHits(g, q, w = 1.5) { const H = g.hist, b = H.at(-1), a = H[Math.max(0, H.length - 1 - Math.round(w / g.dt))]; return b.t > a.t ? (b["gn:" + q] - a["gn:" + q]) / (b.t - a.t) : 0; }

/* ---- B. un trou : la paroi d'en face n'a plus de partenaire --------------------------------------------------------- */
// La même boîte, dans le vide. À 2,5 s, 30 % du fond disparaît. Les billes qui auraient frappé ce morceau s'en vont ; le
// haut, lui, est toujours frappé : la boîte est poussée vers le haut. Mais elle se vide, et la poussée s'éteint avec elle.
export function mountHole(canvas, tr, lang = "en") {
  const SPAN = 14, g = holeGas();
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN; g.at(t);
    const open = t >= HOLE.t;
    const TT = 8 + 17 * text(ctx, open ? tr("an-hole-t2", "A hole in the bottom") : tr("an-hole-t1", "Closed: the pushes cancel"), 10, 16, { size: W < 560 ? 12 : 13, bold: true, maxW: W - 20 });
    const P = split(W, H, TT, 26, 0.56);
    const V = fit(P.a, { x0: -0.45, x1: 1.45, y0: -0.75, y1: 1.4 }), r = ballR(V);
    ctx.fillStyle = "#fff7ed"; ctx.fillRect(V.X(0), V.Y(1), V.s, V.s);
    balls(ctx, g.balls, V, r, { x0: -0.45, x1: 1.45, y0: -0.75, y1: 1.4 }); walls(ctx, g.wallsAt(t), V);
    if (open) { ctx.setLineDash([3, 3]); ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(V.X(HOLE.a), V.Y(0)); ctx.lineTo(V.X(HOLE.b), V.Y(0)); ctx.stroke(); ctx.setLineDash([]); }
    const k = (0.36 * V.s) / P0, w = 2, Ft = g.force("top", w), Fb = g.force("bottom", w), Fh = g.force("hole", w), Fn = g.bodyForce(w);
    push(ctx, V.X(0.5), V.Y(1), 0, -Ft.y * k);
    push(ctx, V.X(0.18), V.Y(0), 0, -Fb.y * k * 0.5); push(ctx, V.X(0.82), V.Y(0), 0, -Fb.y * k * 0.5);
    if (!open) push(ctx, V.X(0.5), V.Y(0), 0, -Fh.y * k);
    // la poussée nette, à la même échelle, à droite de la boîte
    const nx = V.X(1.25), ny = V.Y(0.5); push(ctx, nx, ny, 0, -Fn.y * k, INK, 3.4);
    text(ctx, tr("an-net", "net"), nx, ny + 16, { size: 10.5, bold: true, align: "center" });
    const x0 = P.b.x + 12, lh = P.side ? 21 : 17, yh = P.b.y + (P.side ? 22 : 14);
    const y0 = yh + 4 + 14 * text(ctx, tr("an-box-push2", "pushes (closed box at the start = 100)"), x0, yh, { size: 10.5, c: SOFT, maxW: P.b.w - 24 }) - lh;
    text(ctx, `${tr("an-w-top", "top")}: ${nf(lang, pct(Ft.y))}   ${tr("an-w-bottom", "bottom")}: ${nf(lang, pct(-Fb.y - Fh.y))}`, x0, y0 + lh, { size: 12.5, mono: true, c: PUSH_C, maxW: P.b.w - 24 });
    text(ctx, `${tr("an-net-up", "net push upward")}: ${nf(lang, pct(Fn.y))}`, x0, y0 + 2 * lh, { size: 13, bold: true, mono: true });
    text(ctx, `${tr("an-hole-left", "balls left in the box")}: ${nf(lang, g.count())} / ${nf(lang, BOX.N)}`, x0, y0 + 3 * lh, { size: 11, c: GAS_C });
    // le bilan exact depuis le départ : le coup total reçu par la boîte, la quantité de mouvement des billes parties
    const L = g.ledger();
    text(ctx, `${tr("an-hole-kick", "total kick received by the box")}: ${sgn(lang, L.body.y)}`, x0, y0 + 4.2 * lh, { size: 11, mono: true, maxW: P.b.w - 24 });
    text(ctx, `${tr("an-hole-gone", "carried off by the balls that left")}: ${sgn(lang, L.gone.y)}`, x0, y0 + 5.2 * lh, { size: 11, mono: true, c: GAS_C, maxW: P.b.w - 24 });
    text(ctx, open ? tr("an-hole-n2", "the top is still hit, the missing piece of bottom is not: an upward push, until the box is empty") : tr("an-hole-n1", "the bottom is hit as hard as the top"), x0, y0 + 6.4 * lh, { size: 11, c: INK, maxW: P.b.w - 24 });
    stamp2d(ctx, W, tr("an-hole-st", "in empty space; balls enlarged; pushes measured from the hits"), false, H);
  } });
}

/* ---- C. le feu entretient la pression -------------------------------------------------------------------------------- */
// Une chambre vide dans le vide. La flamme crée 60 billes par seconde (par paires de vitesses opposées : le carburant
// n'apporte aucune poussée). Elles ne sortent que quand l'une d'elles passe par le col : plus il y en a, plus il en sort.
// Le nombre monte jusqu'à ce que la sortie égale l'entrée, puis reste là. À 18 s la flamme s'éteint : la chambre se vide.
export function mountFill(canvas, tr, lang = "en") {
  const SPAN = 26, OFF = 18, g = rocketGas({ prefill: false, fireUntil: OFF });
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN; g.at(t);
    const on = t < OFF;
    const TT = 8 + 17 * text(ctx, on ? tr("an-fill-t1", "The fire makes gas faster than the throat lets it out") : tr("an-fill-t2", "Fire out: the chamber empties"), 10, 16, { size: W < 560 ? 12 : 13, bold: true, maxW: W - 20 });
    const P = split(W, H, TT, W < 560 ? 40 : 26, 0.45);
    const MB = { x0: -0.55, x1: 0.55, y0: -0.55, y1: 1.05 }, V = fit(P.a, MB), r = ballR(V);
    rocketFill(ctx, V); flame(ctx, V, on, t); balls(ctx, g.balls, V, r, MB); walls(ctx, g.wallsAt(t), V);
    if (V.s > 220) text(ctx, tr("an-fill-flame", "fire"), V.X(0), V.Y(0.95) - 5, { size: 10, c: "#92400e", align: "center" });
    // la courbe N(t) et les deux débits
    const b = P.b, X0 = b.x + 40, X1 = b.x + b.w - 12, Y0 = b.y + b.h - 58, Y1 = b.y + 26, nMax = 400;
    const x = (s) => X0 + (s / SPAN) * (X1 - X0), y = (n) => Y0 - (n / nMax) * (Y0 - Y1);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (const n of [0, 100, 200, 300, 400]) { ctx.beginPath(); ctx.moveTo(X0, y(n)); ctx.lineTo(X1, y(n)); ctx.stroke(); text(ctx, nf(lang, n), X0 - 5, y(n) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    ctx.fillStyle = "rgba(245,158,11,.10)"; ctx.fillRect(X0, Y1, x(OFF) - X0, Y0 - Y1);
    ctx.strokeStyle = GAS_C; ctx.lineWidth = 2; ctx.beginPath();
    const Hh = g.hist, step = Math.max(1, Math.round(0.1 / g.dt));
    for (let i = 0; i < Hh.length; i += step) { const p = Hh[i]; i ? ctx.lineTo(x(p.t), y(p.n)) : ctx.moveTo(x(p.t), y(p.n)); }
    ctx.stroke();
    text(ctx, tr("an-fill-n", "balls in the chamber"), X0, Y1 - 8, { size: 10, c: GAS_C, maxW: X1 - X0 });
    text(ctx, `0 → ${nf(lang, SPAN)} s`, X1, Y0 + 13, { size: 9.5, c: SOFT, align: "right" });
    const inR = on ? RATE : 0, outR = Math.max(0, g.outRate(2));
    text(ctx, `${tr("an-fill-in", "made per second")}: ${nf(lang, inR)}   ${tr("an-fill-out", "leaving per second")}: ${nf(lang, outR)}`, b.x + 10, Y0 + 30, { size: 11, mono: true, maxW: b.w - 20 });
    const verdict = !on ? tr("an-fill-v3", "nothing made, still leaving: the pressure falls") : outR < inR * 0.85 ? tr("an-fill-v1", "more made than leaving: the pressure rises") : tr("an-fill-v2", "as many leave as are made: steady pressure");
    text(ctx, verdict, b.x + 10, Y0 + 46, { size: 11, bold: true, c: on ? INK : SOFT, maxW: b.w - 20 });
    stamp2d(ctx, W, tr("an-fill-st", "in empty space; balls enlarged; rough chamber walls stand for the collisions between molecules"), false, H);
  } });
}

/* ---- D. la poussée : ce que reçoit la fusée, le jet l'emporte ---------------------------------------------------------- */
// Régime établi, dans le vide, la fusée tenue par son banc. Les flèches : la force moyenne sur chaque paroi (haut de la
// chambre vers le haut, convergent vers le bas, flancs vers l'extérieur, tuyère), et leur somme, à la même échelle. À
// droite, la poussée mesurée et la quantité de mouvement que le jet emporte chaque seconde : les deux mêmes nombres. En bas,
// le bilan exact depuis le départ : coups reçus par la fusée + billes présentes + billes parties = 0.
export function mountThrust(canvas, tr, lang = "en") {
  const SPAN = 20, g = rocketGas({ prefill: true });
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN; g.at(t);
    const TT = 8 + 17 * text(ctx, tr("an-thr-t", "Where the push comes from"), 10, 16, { size: W < 560 ? 12 : 13, bold: true, maxW: W - 20 });
    const P = split(W, H, TT, 26, 0.5);
    const MB = { x0: -0.78, x1: 0.78, y0: -0.5, y1: 1.32 }, V = fit(P.a, MB), r = ballR(V);
    rocketFill(ctx, V); flame(ctx, V, true, t); balls(ctx, g.balls, V, r, MB); walls(ctx, g.wallsAt(t), V);
    const w = Math.max(1, t - 0.2), F = Object.fromEntries(ROCKET_BODY.map((q) => [q, g.force(q, w)])), Fn = g.bodyForce(w), k = (0.3 * V.s) / 600;   // moyenne depuis le départ
    const R = ROCKET;
    push(ctx, V.X(0), V.Y(R.top), 0, -F.top.y * k);
    push(ctx, V.X(-R.w), V.Y(0.68), F.left.x * k, 0); push(ctx, V.X(R.w), V.Y(0.68), F.right.x * k, 0);
    for (const sx of [-1, 1]) push(ctx, V.X(sx * (R.w + R.hT) / 2), V.Y((R.yConv + R.yThroat) / 2), 0, (-F.conv.y * k) / 2);   // chaque convergent, la moitié
    if (Math.abs(F.bell.y * k) > 2) push(ctx, V.X(R.hE + 0.05), V.Y(0.05), 0, -F.bell.y * k);
    const nx = V.X(0.62), ny = V.Y(0.55); push(ctx, nx, ny, 0, -Fn.y * k, INK, 3.4);
    text(ctx, tr("an-net", "net"), nx, ny + 16, { size: 10.5, bold: true, align: "center" });
    text(ctx, tr("an-same", "same scale"), nx, ny + 29, { size: 9.5, c: SOFT, align: "center" });
    // relevés
    const b = P.b, x0 = b.x + 12, lh = P.side ? 20 : 16; let y = b.y + (P.side ? 22 : 14);
    text(ctx, tr("an-thr-avg", "averages since the start, same units"), x0, y, { size: 10.5, c: SOFT, maxW: b.w - 24 }); y += lh;
    y += lh * text(ctx, `${tr("an-thr-top", "top of the chamber, up")}: ${nf(lang, F.top.y)}`, x0, y, { size: 11.5, mono: true, c: PUSH_C, maxW: b.w - 24 });
    y += lh * text(ctx, `${tr("an-thr-conv", "converging walls, down")}: ${nf(lang, -F.conv.y)}`, x0, y, { size: 11.5, mono: true, c: PUSH_C, maxW: b.w - 24 });
    y += lh * text(ctx, `${tr("an-thr-rocket", "push on the rocket")}: ${nf(lang, Fn.y)}`, x0, y, { size: 13, bold: true, mono: true, maxW: b.w - 24 });
    y += lh * text(ctx, `${tr("an-thr-jet", "momentum the jet carries off each second")}: ${nf(lang, -g.flowOut(w) || 0)}`, x0, y, { size: 13, bold: true, mono: true, c: GAS_C, maxW: b.w - 24 }) + lh * 0.4;
    const L = g.ledger(), sum = L.body.y + L.gas.y + L.gone.y;
    text(ctx, tr("an-thr-ledger", "since the start, exactly:"), x0, y, { size: 10.5, c: SOFT }); y += lh * 0.9;
    text(ctx, `${tr("an-thr-l1", "rocket")} ${sgn(lang, L.body.y)} · ${tr("an-thr-l2", "gas inside")} ${sgn(lang, L.gas.y)} · ${tr("an-thr-l3", "gas gone")} ${sgn(lang, L.gone.y)} = ${nf(lang, Math.abs(sum) < 1e-6 ? 0 : sum, 0)}`, x0, y, { size: 11, mono: true, maxW: b.w - 24 });
    stamp2d(ctx, W, tr("an-thr-st", "in empty space, rocket held on a stand; balls enlarged; forces measured from the hits"), false, H);
  } });
}
const sgn = (lang, x) => `${x >= 0 ? "+" : "−"}${nf(lang, Math.abs(x))}`;

/* ---- E. l'air ne pousse pas la fusée : il la retient ------------------------------------------------------------------ */
// Deux fois la même fusée, même flamme. À gauche dans le vide, à droite dans l'air (billes grises, plus froides). L'air
// frappe la peau extérieure : de partout, sauf sur la sortie de la tuyère, que le jet occupe ; il pousse donc la fusée vers
// le BAS de pₐ × largeur de sortie. Mesuré, et comparé à cette prédiction. Pression de l'air choisie pour une perte comme
// celle du RS-25 (19 %).
export function mountAir(canvas, tr, lang = "en") {
  const SPAN = 24, gv = rocketGas({ prefill: true, seed: 3 }), ga = rocketGas({ prefill: true, air: true, seed: 3 });
  const AE = 2 * ROCKET.hE;
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN; gv.at(t); ga.at(t);
    const foot = W < 560 ? 60 : 24, barsH = (W < 560 ? 104 : 74) + foot;
    const TT = 8 + 17 * text(ctx, tr("an-air-t", "Same rocket, same fire: in empty space and in air"), 10, 16, { size: W < 560 ? 12 : 13, bold: true, maxW: W - 20 });
    const P = split(W, H - barsH, TT, 0, 0.5);
    const MB = { x0: -0.6, x1: 0.6, y0: -0.6, y1: 1.15 }, w = Math.max(1, t - 0.5);   // moyenne depuis le départ (sur 4 s, le bruit des coups égale l'effet)
    const Fv = gv.bodyForce(w).y, Fa = ga.bodyForce(w).y;
    for (const [box, g, lab, F] of [[P.a, gv, tr("an-air-vac", "empty space"), Fv], [P.b, ga, tr("an-air-air", "air"), Fa]]) {
      const V = fit({ x: box.x, y: box.y + 16, w: box.w, h: box.h - 16 }, MB, 4), r = ballR(V);
      if (g === ga) { ctx.fillStyle = "rgba(100,116,139,.07)"; ctx.fillRect(V.X(MB.x0), V.Y(MB.y1), V.s * (MB.x1 - MB.x0), V.s * (MB.y1 - MB.y0)); }
      rocketFill(ctx, V); flame(ctx, V, true, t); balls(ctx, g.balls, V, r, MB); walls(ctx, g.wallsAt(t), V);
      if (g === ga) { ctx.setLineDash([2, 3]); ctx.strokeStyle = GAS_C; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(V.X(-ROCKET.hE), V.Y(ROCKET.yExit)); ctx.lineTo(V.X(ROCKET.hE), V.Y(ROCKET.yExit)); ctx.stroke(); ctx.setLineDash([]); }
      text(ctx, `${lab}: ${tr("an-air-push", "push")} ${nf(lang, F)}`, box.x + box.w / 2, box.y + 12, { size: 11.5, bold: true, align: "center", c: g === ga ? AIR_C : INK, maxW: box.w - 10 });
    }
    // les barres : vide, air mesuré, air prédit F_vide − pₐ Aₑ
    const by = H - barsH + 8, bx0 = 10, bx1 = W - 10, max = Math.max(Fv, 1) * 1.15, X = (f) => bx0 + (Math.max(0, f) / max) * (bx1 - bx0) * 0.62;
    const rows = [[tr("an-air-b1", "in empty space, measured"), Fv, INK], [tr("an-air-b2", "in air, measured"), Fa, AIR_C], [tr("an-air-b3", "predicted: empty-space push − air pressure × nozzle exit"), Fv - P_AIR * AE, PUSH_C]];
    const lh = W < 560 ? 30 : 19;
    rows.forEach(([lab, f, c], i) => { const yy = by + i * lh; ctx.fillStyle = c; ctx.fillRect(bx0, yy, Math.max(2, X(f) - bx0), 9); text(ctx, `${nf(lang, f)} · ${lab}`, W < 560 ? bx0 : X(f) + 6, W < 560 ? yy + 21 : yy + 9, { size: 10, c, maxW: W < 560 ? bx1 - bx0 : bx1 - X(f) - 6 }); });
    stamp2d(ctx, W, tr("an-air-st", "dashed line: the jet, which keeps the air out of the nozzle · air pressure 1/37 of the chamber's (RS-25: 1/204)"), false, H);
  } });
}

/* ---- F. dans l'espace : rien sur quoi s'appuyer, et rien à quoi s'appuyer ------------------------------------------------ */
// Une fusée de masse 1 jette 48 boulettes (0,75 en tout) à la vitesse relative u, puis vole libre. Chaque jet conserve la
// quantité de mouvement (logic.js, pellets). Référentiel du départ : la croix, le centre de masse de la fusée et de toutes
// les boulettes, ne bouge jamais. À droite, sa vitesse jet par jet et la courbe u ln(m₀/m) de Tsiolkovski : la même.
export function mountFree(canvas, tr, lang = "en") {
  const SPAN = 15, at = freeFlight(), end = at(SPAN), xMax = end.xr + 0.6, xMin = Math.min(...end.pel.map((p) => p.x)) - 0.4;
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, s = at(t);
    const TT = 8 + 17 * text(ctx, t < FREE.burn ? tr("an-free-t1", "In empty space: the rocket throws its fuel backwards") : tr("an-free-t2", "Fuel gone: it coasts"), 10, 16, { size: W < 560 ? 12 : 13, bold: true, maxW: W - 20 });
    const P = split(W, H, TT, W < 560 ? 40 : 26, 0.46);
    // l'axe du vol, vertical ; la croix du centre de masse
    const a = P.a, cx = a.x + a.w * 0.42, Y = (x) => a.y + a.h - 10 - ((x - xMin) / (xMax - xMin)) * (a.h - 20);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, a.y + 6); ctx.lineTo(cx, a.y + a.h - 6); ctx.stroke();
    for (const p of s.pel) { const off = ((p.i * 37) % 11 - 5) * 2.2; ctx.fillStyle = p.v > 0 ? "#9a3412" : GAS_C; ctx.beginPath(); ctx.arc(cx + off, Y(p.x), 2.6, 0, 2 * Math.PI); ctx.fill(); }
    const yr = Y(s.xr), rw = 9, rh = 30;
    ctx.fillStyle = "#e5e7eb"; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx, yr - rh); ctx.lineTo(cx + rw, yr - rh + 12); ctx.lineTo(cx + rw, yr); ctx.lineTo(cx - rw, yr); ctx.lineTo(cx - rw, yr - rh + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    const fuel = (s.M - (FREE.M0 - FREE.prop)) / FREE.prop; ctx.fillStyle = "rgba(245,158,11,.7)"; ctx.fillRect(cx - rw + 2, yr - 2 - (rh - 14) * fuel, 2 * rw - 4, (rh - 14) * fuel);
    const yc = Y(s.com); ctx.strokeStyle = PUSH_C; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 9, yc - 9); ctx.lineTo(cx + 9, yc + 9); ctx.moveTo(cx + 9, yc - 9); ctx.lineTo(cx - 9, yc + 9); ctx.stroke();
    text(ctx, tr("an-free-com", "centre of mass of rocket + fuel: never moves"), cx + 14, yc + 4, { size: 10, c: PUSH_C, maxW: a.x + a.w - cx - 18 });
    // la vitesse : jet par jet, et Tsiolkovski
    const b = P.b, X0 = b.x + 42, X1 = b.x + b.w - 12, Y0 = b.y + b.h - 52, Y1 = b.y + 24, vMax = 1.6;
    const xx = (q) => X0 + (q / SPAN) * (X1 - X0), yy = (v) => Y0 - (v / vMax) * (Y0 - Y1);
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (const v of [0, 0.5, 1, 1.5]) { ctx.beginPath(); ctx.moveTo(X0, yy(v)); ctx.lineTo(X1, yy(v)); ctx.stroke(); text(ctx, `${nf(lang, v, 1)} u`, X0 - 5, yy(v) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    ctx.strokeStyle = FAINT; ctx.lineWidth = 3; ctx.beginPath();
    for (let q = 0; q <= SPAN; q += 0.05) { const m = FREE.M0 - FREE.prop * Math.min(1, q / FREE.burn), v = FREE.u * Math.log(FREE.M0 / m); q ? ctx.lineTo(xx(q), yy(v)) : ctx.moveTo(xx(q), yy(v)); }
    ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(xx(0), yy(0));
    let vPrev = 0;
    for (const j of s.jets) { if (j.t > t) break; ctx.lineTo(xx(j.t), yy(vPrev)); ctx.lineTo(xx(j.t), yy(j.v)); vPrev = j.v; }
    ctx.lineTo(xx(t), yy(s.v)); ctx.stroke();
    text(ctx, tr("an-free-v", "rocket speed, jet by jet"), X0 + 4, Y1 - 8, { size: 10, c: INK, maxW: X1 - X0 });
    text(ctx, "u ln(m₀/m)", xx(FREE.burn * 0.55), yy(0.62), { size: 11, c: SOFT, mono: true });
    text(ctx, `v = ${nf(lang, s.v, 2)} u · m = ${nf(lang, s.M, 2)} · ${tr("an-free-k", "jets")} ${s.k}/${FREE.K}`, b.x + 10, Y0 + 30, { size: 11, mono: true, maxW: b.w - 20 });
    text(ctx, tr("an-free-n", "darker balls: thrown after the rocket passed u, they too move up, slower than it"), b.x + 10, Y0 + 45, { size: 10, c: "#9a3412", maxW: b.w - 20 });
    stamp2d(ctx, W, tr("an-free-st", "frame of the launch; rocket and balls not to scale; distances and speeds exact for 48 throws"), false, H);
  } });
}
