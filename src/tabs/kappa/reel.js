// Vitrine de l'onglet kappa (propriétaire, 2026-11-27 : « une animation vitrine pour kappa, en tête de l'onglet ») : six
// scènes dessinées par les mêmes fonctions que les animations de la page (anims.js drawDef, methods.js drawMethod), dans un
// cadre virtuel de 600 px de large mis à l'échelle de la boîte (les textes gardent leur taille relative). Cadre : core/reel.js.
import { makeReel } from "../../core/reel.js";
import { drawDef } from "./anims.js";
import { drawMethod, methodData, drawFail, failData } from "./methods.js";

const EN = {
  "ka-schem": "curves and plots to scale; schematics not to scale",
  "ka-turn-k": "Curvature",
  "ka-turn-a": "Walk along a curve: over a few metres your direction turns by an angle.",
  "ka-turn-b": "Turn divided by distance is the curvature, κ = dθ/ds. No globe enters the definition.",
  "ka-close-k": "Line and circle",
  "ka-close-a": "A straight line never turns: κ = 0. A circle turns by the same angle every metre: κ = 1/R.",
  "ka-close-b": "The radius is what the turn per metre gives back.",
  "ka-rise-k": "Surfaces",
  "ka-rise-a": "Spin the line about a vertical axis: a plane. Spin the circle: a sphere.",
  "ka-rise-b": "Two directions at each point; Gauss's K = κ₁κ₂ is 0 on the plane, 1/R² on the sphere.",
  "ka-dip-k": "“It assumes the globe”",
  "ka-dip-a": "Run the same radius calculation on dips simulated on a plane and on a sphere.",
  "ka-dip-b": "One reading always gives a number. Hundreds give {{dipSphR}} km on the sphere, and no radius at all on the plane.",
  "ka-tri-k": "Triangles",
  "ka-tri-a": "Add the three angles of triangles of every size, on both surfaces, with the same instrument.",
  "ka-tri-b": "The plane's first two give {{trianglePl1}} and {{trianglePl2}} km. Three hundred: correlation {{trianglePlRr}}, slope zero; the sphere's, {{triangleSphR}} km.",
  "ka-erat-k": "Eratosthenes",
  "ka-erat-a": "Under the flat model's Sun, 5,000 km up, two shadows give a plausible radius: {{eratPl1}} km.",
  "ka-erat-b": "Further from that Sun the radius grows: the readings fit no single line (χ²/ν = {{eratPlChi}}). The sphere's: one line, {{eratSphR}} km.",
  "ka-travel-k": "Speed × time",
  "ka-travel-a": "A seismic wave or an airliner of known speed: distance travelled divided by the angle between the two places.",
  "ka-travel-b": "On the flat-earth map the first trip gives {{travelPl1}} km; in the south, {{travPlSouth}} km. The globe's: {{travelSphR}} km everywhere.",
  "ka-fail-k": "Two ways to fail",
  "ka-fail-a": "On a plane, the radius calculation fails in one of two ways, reading after reading.",
  "ka-fail-b": "Either the correlation falls to zero while the scatter stays at 1, or the correlation stays while the scatter climbs into the hundreds. On the sphere, r = 1 and χ²/ν ≈ 1.",
  "ka-alt": "Animation: a point rolls along a curve with its tangent, the angle between two tangents divided by the distance between them giving the curvature; the curve becomes a line and a circle, then a plane and a sphere; then simulated dips, triangles, Eratosthenes' shadows and trips of known speed on a plane and on a sphere, where only the sphere's readings line up and give a radius; last, the correlation and the scatter as readings are added: on the plane one falls or the other climbs",
};

const tr2 = (T) => (k, fb) => { const v = T(k); return v && v !== k ? v : fb; };
const VW = 600;
/** Dessine f(ctx, W, H) dans la boîte b, à partir d'un cadre virtuel de vw px de large, découpé à la boîte. La définition prend
 *  520 px (ses deux cadres empilés, plus grands dans une boîte presque carrée), les méthodes 600. */
function inBox(ctx, b, f, vw = VW, minH = 470) {
  const k = Math.min(b.w / Math.min(vw, Math.max(b.w, 360)), b.h / minH), H = b.h / k;   // téléphone : pas de réduction sous 360 px de large ; boîte basse : au moins minH de haut   // petite boîte (téléphone) : pas de réduction sous 360 px
  ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip(); ctx.translate(b.x, b.y); ctx.scale(k, k); f(ctx, b.w / k, H); ctx.restore();
}
/** Temps de l'animation de la définition (40 s) pour u ∈ [0, d] de la scène : de t0 à t1. */
const defScene = (t0, t1) => (ctx, b, u, d, T) => inBox(ctx, b, (c, W, H) => drawDef(c, W, H, (t0 + (t1 - t0) * Math.min(1, u / d)) / 40, tr2(T), T.lang), 520, 380);
/** Une méthode : un relevé (1,5 s), deux (1,5 s), puis la montée jusqu'à tous. */
const DATA = {};
const methodScene = (id) => (ctx, b, u, d, T) => {
  const um = u < 1.6 ? 0.05 : u < 3.2 ? 0.2 : Math.min(0.9, 0.34 + ((u - 3.2) / (d - 3.8)) * 0.5);
  DATA[id] ??= methodData(id);
  inBox(ctx, b, (c, W, H) => drawMethod(c, W, H, um, id, tr2(T), T.lang, DATA[id], { evo: false }));
};

/** Les deux façons d'échouer (2026-11-27, propriétaire : « l'un à côté de l'autre les deux types de comportement des
 *  courbes ») : r et χ²/ν des triangles (r s'effondre, χ²/ν reste à 1) au-dessus de ceux d'Ératosthène (r reste, χ²/ν monte). */
const failScene = (ctx, b, u, d, T) => inBox(ctx, b, (c, W, H) => drawFail(c, W, H, Math.min(1, u / (d - 1.2)), tr2(T), T.lang, failData()), 600, 470);

export const KAPPA_SCENES = [{ key: "turn", d: 6 }, { key: "close", d: 6 }, { key: "rise", d: 7 }, { key: "dip", d: 6 }, { key: "tri", d: 6 }, { key: "erat", d: 6 }, { key: "travel", d: 6 }, { key: "fail", d: 6 }];
export const KAPPA_DRAW = { turn: defScene(0.5, 9.5), close: defScene(10, 22), rise: defScene(24, 39.5), dip: methodScene("dip"), tri: methodScene("triangle"), erat: methodScene("erat"), travel: methodScene("travel"), fail: failScene };
// à l'arrêt : la sphère et le plan, avec K
const REEL = makeReel({ scenes: KAPPA_SCENES, draw: KAPPA_DRAW, prefix: "ka", still: 6 + 6 + 6 });
export const KAPPA_REEL_T = REEL.total;
export const drawKappaReel = REEL.drawReel;
export const KAPPA_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet, repli anglais ici ; {{clé}} = kappaValues. */
export function mountKappaReel(canvas, tr, lang, vals = {}) {
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("ka-alt"));
  return REEL.mountReel(canvas, T);
}
