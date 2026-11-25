// Vitrine de l'onglet persp (propriétaire, 2026-11-21 : « une animation vitrine au début ») : six scènes, dessinées par
// les mêmes fonctions que les animations de la page (anims.js, persp3d.js), en perspective vraie. Cadre : core/reel.js.
import { makeReel, label, REEL_COL } from "../../core/reel.js";
import { cubesView, cubeDist, sunsetState, sunDistLabel, skyView, raysFrame, antiState, antiView } from "./anims.js";
import { drawRaysView, drawRaysSection } from "./persp3d.js";
import { flatElevation } from "./logic.js";
import { FLAT_D_MAX } from "./logic.js";

const EN = {
  "pe-schem": "true perspective; the Sun's disc enlarged",
  "pe-cubes-k": "Farther is smaller",
  "pe-cubes-a": "Four cubes move away: the gap between them shrinks, and never reaches zero.",
  "pe-cubes-b": "A zoom by the ratio of the distances gives back the same square, gap included.",
  "pe-sunset-k": "The sunset",
  "pe-sunset-a": "A Sun 5,000 km above a flat Earth always stays above eye level.",
  "pe-sunset-b": "It would shrink {{deltaRatio}}× and stop {{alphaMin}}° up. The real Sun keeps its size and goes under the horizon.",
  "pe-fan-k": "Sunbeams",
  "pe-fan-a": "Shafts of light through gaps in a cloud fan out from the Sun.",
  "pe-fan-b": "They are parallel lines going away from us: they meet at their vanishing point, the Sun.",
  "pe-turn-k": "Turn round",
  "pe-turn-a": "Side-on, the same beams are parallel.",
  "pe-turn-b": "With your back to the Sun, they close up again towards the antisolar point.",
  "pe-plan-k": "From above",
  "pe-plan-a": "Seen from above, without perspective, every beam is parallel.",
  "pe-plan-b": "Each patch of light on the ground is its gap, moved, not enlarged.",
  "pe-anti-k": "The Belt of Venus",
  "pe-anti-a": "Anticrepuscular rays meet opposite the Sun, as low as the Sun is high.",
  "pe-anti-b": "A Sun receding over a plane keeps their meeting point {{alphaMin}}° under the horizon; a setting Sun lifts it into the Earth's shadow, under the Belt of Venus.",
  "pe-near-k": "The best fit",
  "pe-near-a": "Read the fan as if it lay flat in the clouds: the Sun comes out {{nearD}} km away, {{nearAbove}} m above them.",
  "pe-near-b": "Its beams make a pyramid under it, the same fan from here, and patches of light {{patchK}}× the gaps on the ground. Real ground shows none of that.",
  "pe-alt": "Animation: four cubes moving away whose gap shrinks without reaching zero; a flat-earth Sun that cannot set; sunbeams through a cloud seen facing the Sun, side-on and from behind; the same beams from above, parallel; where anticrepuscular rays meet as the Sun recedes over a plane or sets on a globe; and a nearby Sun giving the same picture but a different pattern on the ground",
};

const tr2 = (T) => (k, fb) => { const v = T(k); return v && v !== k ? v : fb; };
const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const halves = (b, gap = 6) => b.w >= b.h * 1.2 ? [{ x: b.x, y: b.y, w: b.w / 2 - gap / 2, h: b.h }, { x: b.x + b.w / 2 + gap / 2, y: b.y, w: b.w / 2 - gap / 2, h: b.h }] : [{ x: b.x, y: b.y, w: b.w, h: b.h / 2 - gap / 2 }, { x: b.x, y: b.y + b.h / 2 + gap / 2, w: b.w, h: b.h / 2 - gap / 2 }];

function sceneCubes(ctx, b, u, d, T, fs) { cubesView(ctx, b, cubeDist(u, d - 1), tr2(T), T.lang, { size: Math.max(11, fs * 0.55) }); }
function sceneSunset(ctx, b, u, d, T, fs) {
  const st = sunsetState(Math.min(1, u / (d - 1))), [A, B] = halves(b), tr = tr2(T), size = Math.max(11, fs * 0.5);
  skyView(ctx, A, st.aFlat, st.dFlat, { dist: sunDistLabel(st, true, tr, T.lang), floor: flatElevation(FLAT_D_MAX), label: tr("an-ss-flat", "A Sun 5,000 km above a flat Earth"), col: REEL_COL.flat, tr, lang: T.lang, size });
  skyView(ctx, B, st.aGlobe, st.dGlobe, { dist: sunDistLabel(st, false, tr, T.lang), label: tr("an-ss-globe", "A distant Sun, a turning globe"), col: REEL_COL.globe, tr, lang: T.lang, size });
}
function sceneFan(ctx, b, u, d, T, fs) { raysFrame(ctx, b, { near: false, yaw: 0, k: "sun", tr: tr2(T), captions: false, mini: false, lang: T.lang }); }
function sceneTurn(ctx, b, u, d, T, fs) {
  const yaw = 90 * ease((u - 0.4) / 2) + 90 * ease((u - 3.9) / 2);
  raysFrame(ctx, b, { near: false, yaw, k: "turn", tr: tr2(T), captions: false, mini: false, lang: T.lang });
  label(ctx, `${Math.round(yaw)}°`, b.x + b.w - fs * 1.2, b.y + b.h - fs * 0.8, { size: fs * 0.6, col: REEL_COL.soft, weight: 700 });
}
function scenePlan(ctx, b, u, d, T, fs) { raysFrame(ctx, b, { near: false, yaw: 180, plan: 1, k: "plan", tr: tr2(T), captions: false, mini: false, lang: T.lang }); }
function sceneAnti(ctx, b, u, d, T, fs) {
  const st = antiState((u / (d - 0.8)) * 12), [A, B] = halves(b), tr = tr2(T), size = Math.max(11, fs * 0.5);
  antiView(ctx, A, st.aFlat, false, tr, T.lang, size, `${tr("an-an-pl", "Plane")} · `); antiView(ctx, B, st.aGlobe, true, tr, T.lang, size, `${tr("an-an-gl", "Globe")} · `);
}
function sceneNear(ctx, b, u, d, T, fs) {
  const [A, B] = halves(b), tr = tr2(T);
  drawRaysView(ctx, A, { near: true, yaw: 0, ghost: true, labels: { sun: tr("an-ry-sun", "the Sun") } });
  const k = ease((u - 2.5) / 1.5); ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * k;
  drawRaysSection(ctx, B, { near: true, labels: { sun: tr("an-ry-sun", "the Sun"), eye: tr("an-ry-eye", "you"), scale: tr("an-ry-true", "side view, true scale") } }); ctx.restore();
}

export const PERSP_SCENES = [{ key: "cubes", d: 6.4 }, { key: "sunset", d: 6.4 }, { key: "fan", d: 6.4 }, { key: "turn", d: 6.4 }, { key: "plan", d: 6.4 }, { key: "anti", d: 6.4 }, { key: "near", d: 6.4 }];
export const PERSP_DRAW = { cubes: sceneCubes, sunset: sceneSunset, fan: sceneFan, turn: sceneTurn, plan: scenePlan, anti: sceneAnti, near: sceneNear };
// à l'arrêt : l'éventail des rayons
const REEL = makeReel({ scenes: PERSP_SCENES, draw: PERSP_DRAW, prefix: "pe", still: 2 * 6.4 + 4.5 });
export const PERSP_REEL_T = REEL.total;
export const drawPerspReel = REEL.drawReel;
export const PERSP_REEL_EN = EN;

/** Monte la vitrine ; tr(clé, repli) = textes de l'onglet, repli anglais ici ; {{clé}} = perspValues. */
export function mountPerspReel(canvas, tr, lang, vals = {}) {
  const T = Object.assign((k) => String(tr(k, EN[k] ?? k)).replace(/\{\{(\w+)\}\}/g, (_, v) => vals[v] ?? v), { lang });
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", T("pe-alt"));
  return REEL.mountReel(canvas, T);
}
