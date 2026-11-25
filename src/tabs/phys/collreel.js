// Vitrine du choc de billes (propriétaire, 2026-10-27) : une bille en inertie, légèrement en biais, frappe une bille au repos.
// On décompose sa vitesse, on montre ce que la force de contact fait à ce vecteur (seule la composante le long de la ligne des
// centres change), où interviennent les trois lois de Newton, la conservation de la quantité de mouvement et de l'énergie, puis
// le même choc dans un référentiel qui va à la vitesse horizontale de la bille et dans un autre qui va à toute sa vitesse :
// l'accélération y est la même. Dernière scène : un référentiel qui suivrait la bille pendant le choc n'est plus inertiel.
// Même moteur que les autres vitrines (core/reel.js) ; le choc et son dessin : collanim.js. Ralenti 2 fois, contact étiré.
import { makeReel, label, REEL_COL } from "../../core/reel.js";
import { arrow } from "../../core/anim2d.js";
import { CL, drawColl, drawLedger, drawImpulse, blendU, accelReal, C_A, C_F } from "./collanim.js";
import { SEA, FLAT, FAINT } from "../../core/anim2d.js";

const EN = {
  "cr-schem": "slowed, contact stretched; balls to scale",
  "cr-in-k": "Inertia",
  "cr-in-a": "No force acts on ball A: its velocity, and each of its components, stays the same.",
  "cr-in-b": "Newton's first law. Near the impact, split it along the line joining the centres and across it: only the first will change.",
  "cr-imp-k": "The impact",
  "cr-imp-a": "B pushes A back along the line of centres; A pushes B forward just as hard.",
  "cr-imp-b": "Third law: equal and opposite, up to {{clF}} N for {{clTc}} ms. Second law: J = m v_n = {{clJ}} N·s removes A's component along the line.",
  "cr-con-k": "Conservation",
  "cr-con-a": "The total momentum never changes: the forces are inside the pair.",
  "cr-con-b": "Kinetic energy dips while the balls squeeze, then comes back: elastic. The two balls leave at 90°.",
  "cr-fx-k": "A moving frame",
  "cr-fx-a": "Same collision; the viewpoint glides to a frame that moves with A's horizontal speed.",
  "cr-fx-b": "There A only goes straight up before the impact, and its acceleration during the contact is the same: {{clA}} m/s² at the peak.",
  "cr-fv-k": "A's own frame",
  "cr-fv-a": "Then the viewpoint glides to a frame that moves with A's whole velocity: A is at rest, B comes at it.",
  "cr-fv-b": "Same push, same change of velocity, same acceleration. Momentum and energy are conserved here too.",
  "cr-fo-k": "Not inertial",
  "cr-fo-a": "A frame that kept following A through the impact would see it never move.",
  "cr-fo-b": "It would need a fictitious force to cancel the real push: Newton's laws hold in inertial frames.",
  "cr-same": "same acceleration", "cr-fict": "fictitious force", "cr-real": "real push", "cr-ramp": "changing viewpoint: each image is seen from an inertial frame",
  "cl-sumF": "sum of F over the contact, ∫F dt",
  "cr-c1": "table", "cr-c2": "frame at vₓ", "cr-c3": "frame of A", "cr-graph": "A's acceleration (m/s²) in the three frames: one curve",
  "cr-cmp-k": "Three frames",
  "cr-cmp-a": "The three views side by side, at the same instants: the velocities differ, the acceleration is the same number.",
  "cr-cmp-b": "a = F/m reaches {{clA}} m/s², {{clAg}} times g, in all three. Forces and accelerations do not depend on the inertial frame.",
  "cr-alt": "Animation: a billiard ball moving slightly diagonally hits another at rest; its velocity is split into components; the contact force changes only the component along the line of centres; momentum and energy are conserved; the same collision seen from two moving inertial frames shows the same acceleration",
};

const DUR = 7.5;   // s d'écran par scène

// map : [t₀, k] -- le temps du choc (collanim) vaut t₀ + k u à l'instant u de la scène (k < 1 : ralenti, le contact s'y voit)
function scene(opts, [t0, k]) {
  return (ctx, b, u, d, T, fs) => {
    const t = t0 + k * u, art = { x: b.x, y: b.y, w: b.w, h: b.h * (opts.impulse ? 0.66 : 0.78) };
    // le référentiel : fixe (opts.u) ou un passage progressif d'un référentiel inertiel à un autre (opts.blend), une vitesse
    // intermédiaire constante par image : les tracés restent droits
    const B = opts.blend ? blendU(...opts.blend.slice(0, 2), t, ...opts.blend.slice(2)) : null, fr = B ? B.u : opts.u ?? [0, 0];
    const D = opts.follow ? null : drawColl(ctx, art, t, fr, { span: 1.8, fs: fs * 0.62, kv: Math.min(art.w, art.h) * 0.18, ...opts });
    if (opts.impulse && D) drawImpulse(ctx, { x: b.x + b.w * 0.04, y: art.y + art.h + fs * 0.1, w: b.w * 0.92 }, D.st, T, T.lang, fs * 0.5);
    if (B?.moving) label(ctx, T("cr-ramp"), art.x + art.w / 2, art.y + fs * 0.6, { size: fs * 0.55, col: REEL_COL.flat, weight: 700 });
    if (opts.accel && D.st.contact) {
      const a = D.st.aA, L = Math.hypot(...a), k = (L / Math.hypot(...CL.at(CL.C.t0 + CL.C.tau / 2).aA)) * D.s * 0.35;
      arrow(ctx, D.A[0], D.A[1], D.A[0] + (a[0] / L) * k, D.A[1] - (a[1] / L) * k, C_F, Math.max(2.5, fs * 0.2), 10);
      label(ctx, `a = ${Math.round(accelReal(D.st)).toLocaleString(T.lang)} m/s²`, D.A[0] + (a[0] / L) * k, D.A[1] - (a[1] / L) * k - fs * 0.6, { size: fs * 0.55, col: C_F, weight: 700 });
    }
    if (opts.ledger && !(B?.moving) && (!B || B.k >= 1)) drawLedger(ctx, { x: b.x + b.w * 0.04, y: b.y + b.h * 0.8, w: b.w * 0.92 }, t, fr, T, T.lang, fs * 0.5);
    if (opts.follow) {   // la bille A fixée au centre : la force réelle et la force fictive, égales et opposées
      const st = CL.at(t), cx = b.x + b.w / 2, cy = b.y + b.h * 0.4, n = CL.n, k = (st.F / CL.Fmax) * Math.min(b.w, b.h) * 0.3;
      ctx.fillStyle = "#f1f5f9"; ctx.strokeStyle = REEL_COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, fs * 0.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
      if (k > 2) {
        arrow(ctx, cx, cy, cx - n[0] * k, cy + n[1] * k, C_F, Math.max(2.5, fs * 0.2), 10);
        arrow(ctx, cx, cy, cx + n[0] * k, cy - n[1] * k, REEL_COL.flat, Math.max(2.5, fs * 0.2), 10);
        label(ctx, T("cr-real"), cx - n[0] * k, cy + n[1] * k - fs * 0.8, { size: fs * 0.55, col: C_F, weight: 700 });
        label(ctx, T("cr-fict"), cx + n[0] * k, cy - n[1] * k + fs * 0.9, { size: fs * 0.55, col: REEL_COL.flat, weight: 700 });
      }
      label(ctx, "a = 0 ?", cx, cy + fs * 2.2, { size: fs * 0.6, col: REEL_COL.ink, weight: 800 });
    }
  };
}

/** Les trois référentiels côte à côte, synchronisés, et la courbe de l'accélération de A dans chacun : les trois se superposent. */
function sceneCompare(ctx, b, u, d, T, fs) {
  const t = 0.95 + (1.05 / d) * u, land = b.w > b.h, FR = [[[0, 0], T("cr-c1"), C_A], [[CL.C.v[0], 0], T("cr-c2"), SEA], [CL.C.v, T("cr-c3"), FLAT]];
  const gh = b.h * 0.3, ph = b.h - gh - fs * 0.6, pw = b.w / 3;
  FR.forEach(([uF, name, col], i) => {
    const box = { x: b.x + i * pw + 3, y: b.y + fs * 1.1, w: pw - 6, h: ph - fs * 1.1 - fs * 1.8 };
    label(ctx, name, box.x + box.w / 2, b.y + fs * 0.45, { size: fs * 0.5, col, weight: 700 });
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1; ctx.strokeRect(box.x, box.y, box.w, box.h);
    const D = drawColl(ctx, box, t, uF, { span: 1.2, grid: true, trail: true, trailFrom: 0.6, fs: fs * 0.45, kv: box.w * 0.18 });
    if (D.st.contact) {
      const a = D.st.aA, L = Math.hypot(...a), k = (L / Math.hypot(...CL.at(CL.C.t0 + CL.C.tau / 2).aA)) * box.w * 0.3;
      arrow(ctx, D.A[0], D.A[1], D.A[0] + (a[0] / L) * k, D.A[1] - (a[1] / L) * k, C_F, Math.max(2, fs * 0.15), 8);
    }
    drawImpulse(ctx, { x: box.x + 2, y: box.y + box.h + 2, w: box.w - 4 }, D.st, T, T.lang, fs * 0.4);   // la somme des forces, persistante
    label(ctx, `a = ${Math.round(accelReal(D.st)).toLocaleString(T.lang)} m/s²`, box.x + box.w / 2, box.y + box.h - fs * 0.35, { size: fs * 0.5, col: C_F, weight: 700 });
  });
  // la courbe |a|(t) des trois : la même, tracée trois fois (trait, tirets, pointillés)
  const gx0 = b.x + fs * 2.2, gx1 = b.x + b.w - fs * 0.4, gy0 = b.y + b.h - fs * 0.5, gy1 = gy0 - gh + fs, tA = 0.95, tB = 2.0;
  const X = (q) => gx0 + ((q - tA) / (tB - tA)) * (gx1 - gx0), Y = (a) => gy0 - (a / CL.aMax) * (gy0 - gy1);
  ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
  label(ctx, `${Math.round(CL.aMax).toLocaleString(T.lang)}`, gx0 - fs * 0.2, gy1, { size: fs * 0.42, col: REEL_COL.soft, align: "right", weight: 500 });
  FR.forEach(([uF, , col], i) => {
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, fs * 0.1); ctx.setLineDash([[], [6, 4], [2, 3]][i]); ctx.beginPath();
    for (let q = tA; q <= Math.min(t, tB); q += 0.005) { const a = accelReal(CL.at(q, uF)); q > tA ? ctx.lineTo(X(q), Y(a)) : ctx.moveTo(X(q), Y(a)); }
    ctx.stroke(); ctx.setLineDash([]);
  });
  label(ctx, T("cr-graph"), (gx0 + gx1) / 2, gy1 - fs * 0.35, { size: fs * 0.45, col: REEL_COL.soft, weight: 600 });
}

// les trois premières scènes : un seul mouvement continu (join : ni fondu ni zoom entre elles, le temps du choc se poursuit)
export const COLL_SCENES = [{ key: "in", d: DUR }, { key: "imp", d: DUR, join: true }, { key: "con", d: DUR, join: true }, { key: "fx", d: 8 }, { key: "fv", d: 8 }, { key: "cmp", d: 8 }, { key: "fo", d: 6 }];
const V0 = CL.C.v, VX = [V0[0], 0];
export const COLL_DRAW = {
  in: scene({ impulse: true, xy: true, nt: true, ntFrom: 0.85, line: true, trail: true, grid: true, span: 3.6 }, [0.05, 1.1 / DUR]),   // jusqu'au contact (1,2 s)
  imp: scene({ impulse: true, nt: true, line: true, force: true, forceLabel: true, trail: true, grid: true, span: 3.6 }, [1.15, 0.8 / DUR]),
  con: scene({ impulse: true, ledger: true, trail: true, grid: true, span: 3.6 }, [1.95, 0.75 / DUR]),   // la bille reste dans le cadre
  // passage progressif de la table au référentiel à vₓ (puis de vₓ à toute la vitesse de A) avant le contact ; la grille le montre
  fx: scene({ blend: [[0, 0], VX, 0.1, 0.8], impulse: true, xy: true, trail: true, grid: true, accel: true, ledger: true, span: 2.6 }, [0, 2.6 / 8]),
  fv: scene({ blend: [VX, V0, 0.1, 0.8], impulse: true, trail: true, grid: true, accel: true, ledger: true, span: 2.6 }, [0, 2.6 / 8]),
  cmp: sceneCompare,
  fo: scene({ follow: true }, [0.9, 0.15]),   // seulement la bille fixée et les deux forces ; le temps passe par le contact
};
const REEL = makeReel({ scenes: COLL_SCENES, draw: COLL_DRAW, prefix: "cr", still: DUR + 4 });
export const COLL_REEL_T = REEL.total;
export const drawCollReel = REEL.drawReel;
export const COLL_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet (fr/phys.json), repli anglais ici. */
export function mountCollReel(canvas, tr, lang, vals = {}) {
  const T = Object.assign((k, fb) => String(tr(k, EN[k] ?? fb ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("cr-alt"));
  return REEL.mountReel(canvas, T);
}
