// Animations de la mécanique de l'onglet phys (2026-10-27) : additionner des forces. La table de forces (un anneau et trois
// masses sur des poulies), la machine d'Atwood et le palan, un palet frappé en biais et un choc de billes, la force
// magnétique (une charge qui tourne, une boussole près d'un fil), et l'exemple balistique. Nombres : mechanics.js. Les flèches
// d'une même animation sont à la même échelle (dit sur le cadre) ; les objets sont grossis là où il le faut, et c'est dit.
import { anim2d, arrow, text, disc, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { CL, drawColl, drawLedger, drawImpulse, accelReal, C_A, C_B, C_F, C_N } from "./collanim.js";
import { TABLE, tableForces, tableRelax, sumF, G, atwood, ATWOOD, tackle, TACKLE, kickResult, KICK, billiard, BILLIARD,
  lorentzR, LORENTZ, M_P, Q_E, wireB, OERSTED, compassDeflection, ballistic, BALL, ISUM, impulseCases } from "./mechanics.js";

const AMBER = "#d97706", NET = INK, DEG = Math.PI / 180;
const nf = (lang, x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
/** Deux cadres côte à côte (large) ou l'un sous l'autre (étroit) ; top = hauteur du titre. */
function panels(W, H, top, bottom = 26, ra = 0.5) {
  const side = W >= 560, h = H - top - bottom;
  return side ? { side, a: { x: 0, y: top, w: W * ra, h }, b: { x: W * ra, y: top, w: W * (1 - ra), h } }
    : { side, a: { x: 0, y: top, w: W, h: h * ra }, b: { x: 0, y: top + h * ra, w: W, h: h * (1 - ra) } };
}
const title = (ctx, s, W) => 8 + 17 * text(ctx, s, 10, 16, { size: W < 560 ? 12 : 13, bold: true, maxW: W - 20 });
const sub = (ctx, s, p, c = SOFT) => text(ctx, s, p.x + 10, p.y + 14, { size: 11, bold: true, c, maxW: p.w - 20 });

/* ---- A. la table de forces ------------------------------------------------------------------------------------------- */
// Vue de dessus : l'anneau part du centre, les trois cordes le tirent vers leurs poulies avec 3 g, 4 g et 5 g ; il glisse
// (frottement ajouté pour qu'il s'arrête) jusqu'à la position où la somme est nulle. À droite, les trois forces mises bout à
// bout : l'écart entre le départ et l'arrivée est la somme ; à l'équilibre, le polygone se ferme.
export function mountTable(canvas, tr, lang = "en") {
  const path = tableRelax(), SPAN = 11, COL = [GLOBE, SEA, AMBER];
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, i = Math.min(path.length - 1, Math.round(Math.max(0, t - 1) / 0.01)), p = path[i];
    const F = tableForces(p), S = sumF(F), Sn = Math.hypot(...S);
    const P = panels(W, H, title(ctx, tr("an-tb-t", "Three ropes pull a ring: it stops where the forces add up to zero"), W));
    // la table
    const a = P.a, cx = a.x + a.w / 2, cy = a.y + a.h / 2 + 6, R = Math.min(a.w, a.h) * 0.36, k = R / TABLE.R;
    disc(ctx, cx, cy, R, "#f6f3ec", FAINT, 1.2);
    const kF = (R * 0.8) / (5 * G);   // px par newton (la même échelle sur la table et dans le polygone)
    const ring = [cx + p[0] * k, cy - p[1] * k];
    TABLE.angles.forEach((ang, j) => {
      const q = [cx + R * Math.cos(ang * DEG), cy - R * Math.sin(ang * DEG)];
      ctx.strokeStyle = SOFT; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(...ring); ctx.lineTo(...q); ctx.stroke();
      disc(ctx, q[0], q[1], 7, PAPER, INK, 1.6);
      const lab = [q[0] + 18 * Math.cos(ang * DEG), q[1] - 18 * Math.sin(ang * DEG) + 4];
      text(ctx, `${TABLE.masses[j]} kg`, lab[0], lab[1], { size: 11, bold: true, c: COL[j], align: "center" });
      arrow(ctx, ...ring, ring[0] + F[j][0] * kF, ring[1] - F[j][1] * kF, COL[j], 2.2, 8);
    });
    if (Sn * kF > 3) arrow(ctx, ...ring, ring[0] + S[0] * kF, ring[1] - S[1] * kF, NET, 3, 9);
    disc(ctx, ...ring, 5, PAPER, INK, 2);
    // le polygone des forces
    const b = P.b, ox = b.x + b.w * 0.3, oy = b.y + b.h * 0.62;
    let x = ox, y = oy;
    sub(ctx, tr("an-tb-poly", "the same forces, end to end"), b);
    F.forEach((f, j) => { const nx = x + f[0] * kF, ny = y - f[1] * kF; arrow(ctx, x, y, nx, ny, COL[j], 2.2, 8); x = nx; y = ny; });
    if (Sn * kF > 3) arrow(ctx, ox, oy, x, y, NET, 3, 9);
    disc(ctx, ox, oy, 3, INK);
    const yr = b.y + b.h - 34;
    text(ctx, `ΣFx = ${nf(lang, S[0], 1)} N   ΣFy = ${nf(lang, S[1], 1)} N`, b.x + 10, yr, { size: 12, mono: true, maxW: b.w - 20 });
    text(ctx, Sn < 0.5 ? tr("an-tb-eq", "the polygon closes: no net force, the ring stays put") : tr("an-tb-move", "black arrow: the sum, the ring moves along it"), b.x + 10, yr + 18, { size: 11, c: Sn < 0.5 ? SEA : INK, maxW: b.w - 20 });
    stamp2d(ctx, W, tr("an-tb-st", "seen from above; all force arrows at one scale; friction added so the ring settles"), false, H);
  } });
}

/* ---- B. les poulies -------------------------------------------------------------------------------------------------- */
// À gauche, Atwood : 3 kg contre 2 kg, partis du repos, a = g/5, la corde tendue de 23,5 N ; chaque bloc porte son poids et
// la tension, et leur somme (noire) est sa masse fois a. À droite, un palan à 4 brins lève 40 kg avec 98 N : la main tire
// 4 m de corde pour 1 m de montée. Temps réel ; la machine d'Atwood repart toutes les 1,6 s.
export function mountPulley(canvas, tr, lang = "en") {
  const A = atwood(ATWOOD.m1, ATWOOD.m2), K = tackle(TACKLE.m, TACKLE.n), SPAN = 8, CYC = 1.6;
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, P = panels(W, H, title(ctx, tr("an-pu-t", "Pulleys: a rope passes the same tension along"), W), W < 560 ? 40 : 26);
    // Atwood
    { const a = P.a; sub(ctx, `${tr("an-pu-atw", "Atwood machine")}: a = ${nf(lang, A.a, 2)} m/s², T = ${nf(lang, A.T, 1)} N`, a);
      const cx = a.x + a.w / 2, top = a.y + 52, r = Math.min(26, a.w * 0.08), s = (a.h - 130) / 3.5;   // px par mètre
      // le bloc lourd part en haut (0,4 m sous la poulie), le léger en bas (2,9 m) ; 2,5 m parcourus en 1,6 s
      const tc = t % CYC, d = 0.5 * A.a * tc * tc, yL = top + r + s * (0.3 + d), yR = top + r + s * (2.8 - d), bw = 34;
      ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx - 40, a.y + 30); ctx.lineTo(cx + 40, a.y + 30); ctx.stroke();
      disc(ctx, cx, top, r, "#e5e7eb", INK, 1.6);
      ctx.beginPath(); ctx.moveTo(cx - r, top); ctx.lineTo(cx - r, yL); ctx.moveTo(cx + r, top); ctx.lineTo(cx + r, yR); ctx.stroke();
      const kN = 1.6;   // px par newton
      for (const [x, y, m, w] of [[cx - r, yL, ATWOOD.m1, A.w1], [cx + r, yR, ATWOOD.m2, A.w2]]) {
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(x - bw / 2, y, bw, bw * (0.7 + 0.1 * m)); ctx.strokeRect(x - bw / 2, y, bw, bw * (0.7 + 0.1 * m));
        text(ctx, `${m} kg`, x, y + bw * 0.45, { size: 10.5, bold: true, align: "center" });
        const yb = y + bw * (0.7 + 0.1 * m), side = x < cx ? -1 : 1, ax = x + side * (bw / 2 + 10);
        arrow(ctx, ax, yb, ax, yb + w * kN, FLAT, 2, 7);
        arrow(ctx, ax + side * 10, y, ax + side * 10, y - A.T * kN, GLOBE, 2, 7);
        const net = w - A.T; arrow(ctx, ax + side * 22, y + bw * 0.4, ax + side * 22, y + bw * 0.4 + net * kN, NET, 2.6, 8);
      }
      text(ctx, tr("an-pu-key", "amber: weight · blue: tension · black: sum = m a"), a.x + 10, a.y + a.h - 6, { size: 10, c: SOFT, maxW: a.w - 20, up: true }); }
    // le palan
    { const b = P.b; sub(ctx, `${tr("an-pu-tk", "Block and tackle, 4 strands")}: ${TACKLE.m} kg ${tr("an-pu-with", "lifted with")} ${nf(lang, K.F, 0)} N`, b);
      const cx = b.x + b.w * 0.42, top = b.y + 46, lift = (t / SPAN) * 0.5, s = (b.h - 120) / 1.2, yLoad = b.y + b.h - 50 - lift * s, gap = 9;
      ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx - 50, b.y + 32); ctx.lineTo(cx + 50, b.y + 32); ctx.stroke();
      ctx.fillStyle = "#e5e7eb"; ctx.fillRect(cx - 2 * gap - 4, top - 10, 4 * gap + 8, 20); ctx.strokeRect(cx - 2 * gap - 4, top - 10, 4 * gap + 8, 20);
      ctx.fillRect(cx - 2 * gap - 4, yLoad - 30, 4 * gap + 8, 20); ctx.strokeRect(cx - 2 * gap - 4, yLoad - 30, 4 * gap + 8, 20);
      ctx.strokeStyle = GLOBE; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let j = 0; j < 4; j++) { const x = cx - 1.5 * gap + j * gap; ctx.moveTo(x, top + 10); ctx.lineTo(x, yLoad - 30); }
      // le brin tiré par la main, qui descend 4 fois plus vite
      const xh = cx + 2 * gap + 22, yHand = top + 30 + lift * 4 * s * 0.25;
      ctx.moveTo(cx + 1.5 * gap, top); ctx.lineTo(xh, top); ctx.lineTo(xh, yHand); ctx.stroke();
      arrow(ctx, xh, yHand, xh, yHand + K.F * 0.35, GLOBE, 2.2, 8); text(ctx, `${nf(lang, K.F, 0)} N`, xh + 8, yHand + 20, { size: 10.5, c: GLOBE });
      ctx.fillStyle = "#cbd5e1"; ctx.fillRect(cx - 26, yLoad - 10, 52, 40); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.strokeRect(cx - 26, yLoad - 10, 52, 40);
      text(ctx, `${TACKLE.m} kg`, cx, yLoad + 14, { size: 10.5, bold: true, align: "center" });
      text(ctx, `4 × ${nf(lang, K.F, 0)} N = ${nf(lang, TACKLE.m * G, 0)} N · ${tr("an-pu-rope", "rope pulled")} ${nf(lang, lift * 4, 2)} m, ${tr("an-pu-up", "load up")} ${nf(lang, lift, 2)} m`, b.x + 10, b.y + b.h - 6, { size: 10.5, mono: true, maxW: b.w - 20, up: true }); }
    stamp2d(ctx, W, tr("an-pu-st", "real time; massless rope and pulleys, no friction; tackle drawn not to scale"), false, H);
  } });
}

/* ---- C. l'inertie et les chocs en biais -------------------------------------------------------------------------------- */
// À gauche, un palet glisse tout droit (rien ne le pousse) ; un coup bref en biais ajoute Δv = J/m, à 60° : la nouvelle
// vitesse est la somme des deux flèches. À droite, une bille en frappe une autre, au repos, décalée d'un rayon : la cible
// part à 30°, la bille qui frappe à 90° d'elle ; leurs quantités de mouvement s'additionnent à celle d'avant.
export function mountKick(canvas, tr, lang = "en") {
  const KR = kickResult(), BL = billiard(BILLIARD.v, BILLIARD.offset), SPAN = 8, CYC = 4;
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, tc = t % CYC, P = panels(W, H, title(ctx, tr("an-ki-t", "Velocities add like forces: a kick, then a collision"), W), W < 560 ? 44 : 26);
    // le palet
    { const a = P.a; sub(ctx, `${tr("an-ki-puck", "Puck kicked at 60°")}: v′ = v + J/m`, a);
      const s = (a.w - 40) / 6.5, x0 = a.x + 20, y0 = a.y + a.h * 0.68, tk = 1.2;
      const pos = tc < tk ? [KICK.v[0] * tc, 0] : [KICK.v[0] * tk + KR.v1[0] * (tc - tk), KR.v1[1] * (tc - tk)];
      ctx.setLineDash([3, 4]); ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + KICK.v[0] * tk * s, y0); ctx.lineTo(x0 + (KICK.v[0] * tk + KR.v1[0] * 2.8) * s, y0 - KR.v1[1] * 2.8 * s); ctx.stroke(); ctx.setLineDash([]);
      const kv = s * 0.55, hx = x0 + KICK.v[0] * tk * s, hy = y0;   // le triangle des vitesses au point du coup
      if (tc >= tk) {
        arrow(ctx, hx, hy, hx + KICK.v[0] * kv, hy, GLOBE, 2.2, 8);
        arrow(ctx, hx + KICK.v[0] * kv, hy, hx + KICK.v[0] * kv + KR.dv[0] * kv, hy - KR.dv[1] * kv, AMBER, 2.2, 8);
        arrow(ctx, hx, hy, hx + KR.v1[0] * kv, hy - KR.v1[1] * kv, NET, 2.8, 9);
        text(ctx, "v", hx + KICK.v[0] * kv * 0.5, hy + 14, { size: 11, c: GLOBE }); text(ctx, "Δv = J/m", hx + KICK.v[0] * kv + KR.dv[0] * kv + 6, hy - KR.dv[1] * kv * 0.5, { size: 11, c: AMBER });
      }
      disc(ctx, x0 + pos[0] * s, y0 - pos[1] * s, 8, "#475569", INK, 1.2);
      text(ctx, `v = ${nf(lang, 2, 1)} m/s → v′ = ${nf(lang, KR.speed, 2)} m/s ${tr("an-ki-at", "at")} ${nf(lang, KR.angle, 1)}°`, a.x + 10, a.y + a.h - 6, { size: 10.5, mono: true, maxW: a.w - 20, up: true }); }
    // le billard (2026-10-27) : le choc détaillé de collanim.js, dans le référentiel de la table ; la vitesse de A décomposée le
    // long de la ligne des centres (elle seule change) et en travers (elle ne change pas) ; la force de contact sur chaque bille
    // (égale et opposée) ; la quantité de mouvement et l'énergie, avant et maintenant
    { const b = P.b; sub(ctx, `${tr("an-ki-bil", "Equal balls, one at rest")}: ${tr("an-ki-90", "they leave at 90°")}`, b);
      const led = 40, box = { x: b.x + 6, y: b.y + 22, w: b.w - 12, h: b.h - 26 - led };
      drawColl(ctx, box, tc, [0, 0], { span: 2.2, nt: true, ntFrom: 0.85, line: true, force: true, forceLabel: true, trail: true, fs: 10.5 });
      drawLedger(ctx, { x: b.x + 10, y: b.y + b.h - led, w: b.w - 20 }, tc, [0, 0], tr, lang, 10); }
    stamp2d(ctx, W, tr("an-ki-st", "seen from above, no friction or spin; balls and distances to scale; the contact (a fraction of a millisecond) stretched"), false, H);
  } });
}

/* ---- C2. le même choc vu de trois référentiels inertiels (2026-10-27, propriétaire) ------------------------------------ */
// Le choc de billes de collanim.js, trois fois en même temps : depuis la table ; depuis un référentiel qui va à la vitesse
// horizontale de A (vₓ = 1,6 m/s : A y monte tout droit avant le choc) ; depuis un référentiel qui va à toute la vitesse de A
// avant le choc (A y est au repos, B arrive sur elle). Les vitesses, les trajectoires et l'énergie diffèrent ; pendant le
// contact, l'accélération de A (verte) est la même flèche dans les trois, et chacun y voit la quantité de mouvement et
// l'énergie conservées. Les référentiels gardent leur vitesse : aucun ne suit A une fois déviée (il ne serait plus inertiel).
export function mountFrames(canvas, tr, lang = "en") {
  const SPAN = 3.2, V0 = CL.C.v, FR = [[[0, 0], tr("an-fr-g", "Frame of the table"), GLOBE], [[V0[0], 0], tr("an-fr-x", "Moving with A's horizontal speed"), SEA], [V0, tr("an-fr-b", "Moving with A before the impact"), FLAT]];
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, TT = title(ctx, tr("an-fr-t", "One collision, three inertial frames: different velocities, the same acceleration"), W);
    const side = W >= 640, n = FR.length, foot = side ? 26 : 54, led = side ? 58 : 44, h = (H - TT - foot) / (side ? 1 : n), w = side ? W / n : W;
    FR.forEach(([uF, name, col], i) => {
      const p = side ? { x: i * w, y: TT, w, h } : { x: 0, y: TT + i * h, w, h };
      const lines = sub(ctx, name, p, col);
      const ih = side ? 34 : 28;   // la bande de la somme des forces, sous la vue
      const box = { x: p.x + 6, y: p.y + 10 + 14 * lines, w: p.w - 12, h: p.h - 14 - 14 * lines - led - ih };
      const D = drawColl(ctx, box, t, uF, { span: 2.4, grid: true, trail: true, fs: 10, xy: !side ? false : true });
      // l'accélération de A pendant le contact : la même flèche partout (échelle commune)
      if (D.st.contact) { const k = (Math.hypot(...D.st.aA) / Math.hypot(...CL.at(CL.C.t0 + CL.C.tau / 2).aA)) * D.s * 0.4, a = D.st.aA, L = Math.hypot(...a);
        arrow(ctx, D.A[0], D.A[1], D.A[0] + (a[0] / L) * k, D.A[1] - (a[1] / L) * k, C_F, 3, 9); }
      drawImpulse(ctx, { x: p.x + 10, y: box.y + box.h + 2, w: p.w - 20 }, D.st, tr, lang, side ? 9.5 : 8.5);   // la somme des forces, persistante
      const v = D.st.vA, nf2 = (x) => x.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const ly = p.y + p.h - led + 4;
      text(ctx, `v_A = (${nf2(v[0])} ; ${nf2(v[1])}) m/s · a_A = ${Math.round(accelReal(D.st)).toLocaleString(lang)} m/s²`, p.x + 10, ly + 8, { size: 9.5, mono: true, maxW: p.w - 20, c: D.st.contact ? C_F : INK });
      drawLedger(ctx, { x: p.x + 10, y: ly + 14, w: p.w - 20 }, t, uF, tr, lang, 9);
    });
    stamp2d(ctx, W, tr("an-fr-st", "seen from above; green: A's acceleration during the contact, the same arrow in all three; the frames keep their speed"), false, H);
  } });
}

/* ---- C3. la même impulsion : un vent continu, deux coups, un coup (2026-10-28, propriétaire) ---------------------------- */
// Trois couloirs, trois billes de 170 g lancées à 2 m/s ; chacune perd la même impulsion, 0,17 N·s : un vent de face constant
// (0,068 N pendant 2,5 s), deux coups de 0,085 N·s, un coup de 0,17 N·s. Sous chaque couloir, F(t) et son aire grisée, la
// somme ∫F dt qui court. À droite, la vitesse et ∫F dt des trois : ils finissent au même point (1 m/s, −0,17 N·s), par des
// chemins différents ; les billes, elles, n'arrivent pas au même endroit (la vitesse a changé à d'autres moments). Ralenti 2 fois.
export function mountImpulseSum(canvas, tr, lang = "en") {
  const C = impulseCases(), SLOW = 2, SPAN = ISUM.T * SLOW + 1.5, COLS = [SEA, GLOBE, FLAT];
  const KEYS = [["wind", tr("an-is-wind", "steady headwind")], ["two", tr("an-is-two", "two blows")], ["one", tr("an-is-one", "one blow")]];
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const rowAt = (rows, t) => rows[Math.min(rows.length - 1, Math.max(0, Math.round(t / 0.002)))];
  const Fmax = Math.abs(ISUM.J) / ISUM.dt;
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = Math.min(ISUM.T, (u * SPAN) / SLOW), TT = title(ctx, tr("an-is-t", "The same total push, three ways: the velocity ends the same"), W);
    const side = W >= 640, foot = side ? 26 : 40, L = side ? { x: 0, y: TT, w: W * 0.56, h: H - TT - foot } : { x: 0, y: TT, w: W, h: (H - TT - foot) * 0.55 };
    const R = side ? { x: W * 0.56, y: TT, w: W * 0.44, h: H - TT - foot } : { x: 0, y: L.y + L.h, w: W, h: (H - TT - foot) * 0.45 };
    const lh = L.h / 3, xs = (L.w - 30) / 7.6;
    KEYS.forEach(([k, name], i) => {
      const rows = C.cases[k], r = rowAt(rows, t), y0 = L.y + i * lh, track = y0 + lh * 0.38, col = COLS[i];
      text(ctx, name, L.x + 10, y0 + 13, { size: 10.5, bold: true, c: col, maxW: L.w * 0.5 });
      text(ctx, `∫F dt = ${nf(r.J, 3)} N·s · v = ${nf(r.v, 2)} m/s`, L.x + L.w - 8, y0 + 13, { size: 9.5, mono: true, c: col, align: "right" });
      ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L.x + 14, track + 8); ctx.lineTo(L.x + L.w - 10, track + 8); ctx.stroke();
      if (k === "wind" && r.F !== 0) {   // le vent : des traits qui filent vers la gauche
        ctx.strokeStyle = "rgba(15,118,110,.35)"; ctx.lineWidth = 1.2;
        for (let j = 0; j < 10; j++) { const x = L.x + 14 + ((j * 53 - t * 160) % (L.w - 30) + (L.w - 30)) % (L.w - 30), yy = track - 6 + (j % 3) * 6; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 18, yy); ctx.stroke(); }
      }
      const bx = L.x + 18 + r.x * xs;
      if (r.F !== 0) arrow(ctx, bx, track, bx + (r.F / Fmax) * 40 - (k === "wind" ? 10 : 0), track, col, 2.4, 8);
      disc(ctx, bx, track, 7, "#f1f5f9", INK, 1.2);
      // F(t) sous le couloir : son aire grisée jusqu'à l'instant présent (la même aire pour les trois)
      const gy0 = y0 + lh - 6, gh = lh * 0.42, gx0 = L.x + 14, gx1 = L.x + L.w - 10, X = (q) => gx0 + (q / ISUM.T) * (gx1 - gx0), Y = (f) => gy0 - (Math.min(Math.abs(f), Fmax) / Fmax) * gh;
      ctx.strokeStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
      ctx.fillStyle = col + "33"; ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(0), gy0);
      for (let q = 0; q <= t; q += 0.01) ctx.lineTo(X(q), Y(rowAt(rows, q).F));
      ctx.lineTo(X(t), gy0); ctx.closePath(); ctx.fill(); ctx.stroke();
      text(ctx, "|F|", gx0 + 2, gy0 - gh - 2, { size: 9, c: SOFT });
    });
    // à droite : v(t) et ∫F dt des trois
    const plots = [[tr("an-is-v", "velocity (m/s)"), "v", 0.8, 2.1], [tr("an-is-j", "∫F dt (N·s)"), "J", -0.19, 0.01]];
    plots.forEach(([name, key, lo, hi], j) => {
      const ph = R.h / 2, x0 = R.x + 40, x1 = R.x + R.w - 10, y1 = R.y + j * ph + 22, y0 = R.y + (j + 1) * ph - 18;
      const X = (q) => x0 + (q / ISUM.T) * (x1 - x0), Y = (v) => y0 - ((v - lo) / (hi - lo)) * (y0 - y1);
      text(ctx, name, x0, y1 - 8, { size: 10, c: SOFT });
      ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      const end = key === "v" ? C.vEnd : ISUM.J;
      ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(end)); ctx.lineTo(x1, Y(end)); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, nf(end, key === "v" ? 1 : 2), x0 - 4, Y(end) + 3, { size: 9, c: SOFT, align: "right" });
      text(ctx, nf(key === "v" ? ISUM.v0 : 0, key === "v" ? 1 : 0), x0 - 4, Y(key === "v" ? ISUM.v0 : 0) + 3, { size: 9, c: SOFT, align: "right" });
      KEYS.forEach(([k], i) => {
        ctx.strokeStyle = COLS[i]; ctx.lineWidth = 2; ctx.setLineDash([[], [6, 4], [2, 3]][i]); ctx.beginPath();
        for (let q = 0; q <= t; q += 0.01) { const r = rowAt(C.cases[k], q); q ? ctx.lineTo(X(q), Y(r[key])) : ctx.moveTo(X(q), Y(r[key])); }
        ctx.stroke(); ctx.setLineDash([]);
      });
    });
    stamp2d(ctx, W, tr("an-is-st", "slowed 2×; blows lengthened to 0.25 s; the wind taken as steady (real drag grows with speed); balls of 170 g from 2 m/s"), false, H);
  } });
}

/* ---- D. le magnétisme ------------------------------------------------------------------------------------------------ */
// À gauche, une charge positive dans un champ B qui entre dans l'écran : la force q v × B est toujours perpendiculaire à la
// vitesse, vers le centre ; la charge tourne à vitesse constante sur un cercle de rayon m v / (q B). À droite, une boussole vue
// de dessus près d'un fil vertical : le courant de 5 A à 5 cm ajoute 20 µT vers l'est aux 20 µT du champ terrestre horizontal,
// l'aiguille tourne de 45° vers la somme ; le courant coupé, elle revient.
export function mountMag(canvas, tr, lang = "en") {
  const SPAN = 10, Bw = wireB(OERSTED.I, OERSTED.d), rP = lorentzR(M_P, LORENTZ.v, Q_E, LORENTZ.B);
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, P = panels(W, H, title(ctx, tr("an-mg-t", "Magnetic forces: always across the motion"), W));
    { const a = P.a; sub(ctx, `${tr("an-mg-lor", "Charge in a field")}: F = q v × B`, a);
      for (let x = a.x + 22; x < a.x + a.w - 10; x += 28) for (let y = a.y + 34; y < a.y + a.h - 24; y += 28) text(ctx, "×", x, y, { size: 11, c: FAINT, align: "center" });
      const cx = a.x + a.w / 2, cy = a.y + a.h / 2 + 8, R = Math.min(a.w, a.h) * 0.3, th = (t / SPAN) * 4 * Math.PI;
      ctx.strokeStyle = FAINT; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
      const px = cx + R * Math.cos(th), py = cy - R * Math.sin(th), tx = -Math.sin(th), ty = -Math.cos(th);   // sens direct à l'écran
      arrow(ctx, px, py, px + tx * R * 0.55, py + ty * R * 0.55, GLOBE, 2.2, 8); text(ctx, "v", px + tx * R * 0.62, py + ty * R * 0.62, { size: 12, c: GLOBE });
      arrow(ctx, px, py, px + (cx - px) * 0.45, py + (cy - py) * 0.45, AMBER, 2.4, 8); text(ctx, "F", px + (cx - px) * 0.52, py + (cy - py) * 0.52 - 4, { size: 12, c: AMBER });
      disc(ctx, px, py, 7, "#fee2e2", FLAT, 1.6); text(ctx, "+", px, py + 4, { size: 11, bold: true, c: FLAT, align: "center" });
      text(ctx, `${tr("an-mg-pr", "proton at 1 km/s in 50 µT")}: r = ${nf(lang, rP * 100, 0)} cm · ${tr("an-mg-in", "× : B into the screen")}`, a.x + 10, a.y + a.h - 6, { size: 10.5, maxW: a.w - 20, up: true }); }
    { const b = P.b; sub(ctx, `${tr("an-mg-oer", "Compass beside a wire (Ørsted)")}: B = B_H + B_${tr("an-mg-wire", "wire")}`, b);
      const on = t > 2 && t < 7.5, ramp = on ? Math.min(1, (t - 2) / 0.6) : t >= 7.5 ? Math.max(0, 1 - (t - 7.5) / 0.6) : 0, Bx = Bw * ramp, By = OERSTED.BH;
      const cx = b.x + b.w * 0.5, cy = b.y + b.h * 0.5, R = Math.min(b.w, b.h) * 0.2, kB = R / 25e-6, ang = Math.atan2(Bx, By);
      disc(ctx, cx, cy, R, "#f8fafc", INK, 1.4);
      // le fil, au nord de la boussole, le courant sortant de l'écran : son champ tourne dans le sens direct, vers l'est ici
      const wx = cx, wy = cy - R - 26; disc(ctx, wx, wy, 7, on ? "#fde68a" : PAPER, INK, 1.4); text(ctx, "•", wx, wy + 4, { size: 12, align: "center" });
      text(ctx, `${on ? nf(lang, OERSTED.I, 0) : 0} A`, wx + 12, wy + 4, { size: 10.5, c: on ? AMBER : SOFT });
      arrow(ctx, cx, cy + R + 30, cx, cy + R + 30 - By * kB * 0.6, GLOBE, 2, 7); text(ctx, "B_H", cx - 6, cy + R + 22, { size: 10.5, c: GLOBE, align: "right" });
      if (Bx > 0) { arrow(ctx, cx, cy + R + 30 - By * kB * 0.6, cx + Bx * kB * 0.6, cy + R + 30 - By * kB * 0.6, AMBER, 2, 7); arrow(ctx, cx, cy + R + 30, cx + Bx * kB * 0.6, cy + R + 30 - By * kB * 0.6, NET, 2.4, 8); }
      const nx = Math.sin(ang), ny = -Math.cos(ang);
      ctx.fillStyle = FLAT; ctx.beginPath(); ctx.moveTo(cx + nx * R * 0.85, cy + ny * R * 0.85); ctx.lineTo(cx - ny * 6, cy + nx * 6); ctx.lineTo(cx + ny * 6, cy - nx * 6); ctx.fill();
      ctx.fillStyle = SOFT; ctx.beginPath(); ctx.moveTo(cx - nx * R * 0.85, cy - ny * R * 0.85); ctx.lineTo(cx - ny * 6, cy + nx * 6); ctx.lineTo(cx + ny * 6, cy - nx * 6); ctx.fill();
      text(ctx, `N ↑`, cx - R - 8, cy - R + 8, { size: 10.5, c: SOFT, align: "right" });
      text(ctx, `${tr("an-mg-dev", "needle turned by")} ${nf(lang, ang / DEG, 0)}° (tan δ = ${nf(lang, Bx * 1e6, 0)} µT / ${nf(lang, By * 1e6, 0)} µT)`, b.x + 10, b.y + b.h - 6, { size: 10.5, mono: true, maxW: b.w - 20, up: true }); }
    stamp2d(ctx, W, tr("an-mg-st", "not to scale; the charge's speed slowed down; compass seen from above, north up"), true, H);
  } });
}

/* ---- E. l'exemple balistique ----------------------------------------------------------------------------------------- */
// À l'échelle vraie (même échelle en x et en y ; la boule, 10 cm, est grossie). La poussée (0,1 s, ralentie 20 fois) : la
// force F à 30° et le poids, leur somme à 28°. Puis le vol, ralenti 3 fois : dans le vide (tirets) et dans l'air (trait) ;
// sur la boule, le poids, la traînée (3 % du poids au départ, une flèche minuscule à la même échelle) et la vitesse.
export function mountBallistic(canvas, tr, lang = "en") {
  const B = ballistic(), PUSH = 2, SLOW = 3, FLY = B.air[B.air.length - 1].t * SLOW, HOLD = 2.5, SPAN = PUSH + FLY + HOLD;
  const xMax = 54, yMax = 8;
  const at = (P, tt) => { let lo = 0, hi = P.length - 1; if (tt >= P[hi].t) return P[hi]; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].t <= tt) lo = m; else hi = m; } return P[lo]; };
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const t = u * SPAN, TT = title(ctx, tr("an-bl-t", "A 4.1 kg steel ball pushed with 1,000 N at 30° for 0.1 s"), W);
    const narrow = W < 560, foot = narrow ? 128 : 80, x0 = 30, x1 = W - 16, s = Math.min((x1 - x0) / xMax, (H - TT - foot - 40) / yMax);
    const gy = Math.round(TT + 30 + (H - TT - foot - 30 + yMax * s) / 2), X = (x) => x0 + x * s, Y = (y) => gy - y * s;
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 10, gy); ctx.lineTo(x1, gy); ctx.stroke();
    for (let m = 0; m <= 50; m += 10) { ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(m), gy); ctx.lineTo(X(m), gy + 5); ctx.stroke(); text(ctx, `${m} m`, X(m), gy + 17, { size: 9.5, c: SOFT, align: "center" }); }
    const tf = t < PUSH ? -1 : Math.min((t - PUSH) / SLOW, B.air[B.air.length - 1].t + 1);
    // les deux trajectoires jusqu'à l'instant présent
    for (const [P, dash, col] of [[B.vac, [5, 4], FAINT], [B.air, [], INK]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(B.pEnd[0]), Y(B.pEnd[1]));
      if (tf >= 0) for (const q of P) { if (q.t > tf) break; ctx.lineTo(X(q.x), Y(q.y)); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    const kN = 2.2;   // px par newton pour le poids et la traînée
    let ball, readout;
    if (t < PUSH) {   // la poussée, ralentie
      const f = Math.min(1, t / PUSH), q = [B.pEnd[0] * f * f, B.pEnd[1] * f * f], bx = X(q[0]), by = Y(q[1]);
      const kF = 0.09;   // px par newton pour la poussée (1 000 N)
      arrow(ctx, bx, by, bx + B.Fx * kF, by - B.Fy * kF, GLOBE, 2.2, 8); text(ctx, "F", bx + B.Fx * kF + 4, by - B.Fy * kF, { size: 11, c: GLOBE });
      arrow(ctx, bx, by, bx, by + B.W * kF, FLAT, 2.2, 7); text(ctx, "W", bx + 6, by + B.W * kF + 4, { size: 11, c: FLAT });
      arrow(ctx, bx, by, bx + B.Fx * kF, by - (B.Fy - B.W) * kF, NET, 2.8, 9); text(ctx, `F + W: ${nf(lang, B.aPushAng, 1)}°`, bx + B.Fx * kF + 4, by - (B.Fy - B.W) * kF + 14, { size: 11, bold: true });
      ball = [bx, by]; readout = `${tr("an-bl-push", "push")}: t = ${nf(lang, f * BALL.dt, 2)} s · ΣF = ${nf(lang, B.m * B.aPushN, 0)} N ${tr("an-bl-at", "at")} ${nf(lang, B.aPushAng, 1)}° → v = ${nf(lang, B.v0 * f, 1)} m/s`;
    } else {
      const q = at(B.air, tf), v = Math.hypot(q.vx, q.vy), D = B.k * v * v, bx = X(q.x), by = Y(q.y), landed = q === B.air[B.air.length - 1];
      if (!landed) {
        arrow(ctx, bx, by, bx + q.vx * 3, by - q.vy * 3, GLOBE, 2, 8);
        arrow(ctx, bx, by, bx, by + B.W * kN, FLAT, 2.2, 7);
        if (D * kN > 1) arrow(ctx, bx, by, bx - (q.vx / v) * D * kN, by + (q.vy / v) * D * kN, SEA, 2, 6);
      }
      ball = [bx, by];
      readout = `t = ${nf(lang, q.t, 2)} s · x = ${nf(lang, q.x, 1)} m · y = ${nf(lang, q.y, 2)} m · v = ${nf(lang, v, 1)} m/s · ${tr("an-bl-drag", "drag")} ${nf(lang, D, 2)} N / ${tr("an-bl-weight", "weight")} ${nf(lang, B.W, 1)} N`;
      if (landed) {
        const xv = B.vac[B.vac.length - 1].x;
        text(ctx, `${tr("an-bl-air", "air")} ${nf(lang, q.x, 1)} m · ${tr("an-bl-vac", "vacuum")} ${nf(lang, xv, 1)} m`, X(xv), gy - 3.2 * s - 8, { size: 11, bold: true, align: "right" });
      }
    }
    disc(ctx, ...ball, 5, "#94a3b8", INK, 1.2);
    text(ctx, readout, 10, H - foot + 22, { size: 11, mono: true, maxW: W - 20 });
    text(ctx, tr("an-bl-key", "blue: force F, then velocity · amber: weight · green: air drag · black: sum during the push · dashed: in a vacuum"), 10, H - foot + (narrow ? 52 : 40), { size: 10, c: SOFT, maxW: W - 20 });
    stamp2d(ctx, W, tr("an-bl-st", "true scale, x and y alike; ball enlarged; push slowed 20×, flight 3×"), false, H);
  } });
}
