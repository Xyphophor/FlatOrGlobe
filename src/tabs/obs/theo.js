// Le 24 novembre en mesure (epic19/UC14) : le Grand Mourre au théodolite. Rien n'est encore
// mesuré ; ce module donne la prédiction, le budget d'incertitude et le calculateur.
// Entrées prévues, toutes mesurées par le propriétaire : angle de site α (théodolite, cercle
// gauche + cercle droit), distance s (triangulation sur une base mesurée à la roue ou au
// télémètre), dénivelé Δh (deux baromètres enregistreurs, formule hypsométrique).
import { FIG } from "../../core/fig.js";
import { stamp } from "../../core/formfigs.js";

const ARC = Math.PI / 180 / 60;
export const MOURRE = { s: 54.1, dh: 208, k: 0.13, R: 6371 }; // km, m : les valeurs de carte d'aujourd'hui (validation)

/** Rayon apparent R/(1 − k) = s² / 2(Δh − sα) ; α en minutes d'arc, s en km, Δh en m -> km. */
export function rApp(alphaArcmin, sKm, dhM) {
  const den = dhM - sKm * 1000 * alphaArcmin * ARC;
  return den > 0 ? (sKm * 1000) ** 2 / (2 * den) / 1000 : Infinity;
}
/** Angle prédit (′) : plan (Δh/s), globe sans réfraction, globe avec k. */
export function predicted({ s, dh, k, R } = MOURRE) {
  const a = dh / (s * 1000), c = (s * 1000) / (2 * R * 1000);
  return { plane: a / ARC, globe: (a - c) / ARC, globeK: (a - c * (1 - k)) / ARC };
}
/** Budget : α à ±10″, s à ±0,4 % (base de 1 km), Δh à ±5 m -> part de chacun sur R (%) et total. */
export function budget({ s, dh, k, R } = MOURRE, dAlpha = 10 / 60, dsRel = 0.004, dDh = 5) {
  const a = predicted({ s, dh, k, R }).globeK, R0 = rApp(a, s, dh);
  const rel = (x) => Math.abs(x / R0 - 1) * 100;
  const parts = { alpha: rel(rApp(a + dAlpha, s, dh)), s: rel(rApp(a, s * (1 + dsRel), dh)), dh: rel(rApp(a, s, dh + dDh)) };
  return { R0, parts, total: Math.hypot(parts.alpha, parts.s, parts.dh) };
}
/** Triangulation : base b (m) mesurée, angles aux deux bouts A, B (°) -> distance au sommet depuis A (km). */
export const triangulate = (b, A, B) => (b * Math.sin(B * Math.PI / 180)) / Math.sin((A + B) * Math.PI / 180) / 1000;

/** Schéma : la base mesurée, les deux visées horizontales, puis l'angle de site au théodolite. */
export function figTheo(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-theo-alt", "Left: a baseline b measured on the ground at the viewpoint, and the two horizontal angles from its ends to the summit, which fix the distance s by triangulation. Right: the theodolite's elevation angle alpha to the summit, a height difference delta h above, measured with two barometers") });
  f.line(30, 190, 110, 190, { c: C2.globe, w: 2.4 }); f.note(70, 206, "b", { anchor: "middle" });
  f.line(30, 190, 170, 40, { c: C2.soft }); f.line(110, 190, 170, 40, { c: C2.soft }); f.dot(170, 40, { r: 4 });
  f.angleAt(30, 190, 26, [110, 190], [170, 40], { label: "A", c: C2.ink, pad: 10 });
  f.angleAt(110, 190, 22, [170, 40], [30, 190], { label: "B", c: C2.ink, pad: 10 });
  f.note(176, 44, "s", { size: 11 });
  f.ground(190, 200, 370);
  f.line(210, 170, 360, 170, { c: C2.faint, dash: "4 3" });
  f.line(210, 170, 360, 110, { c: C2.globe, w: 1.6 }); f.dot(360, 110, { r: 4 });
  f.angle(210, 170, 50, 0, 21.8, { label: "α", tex: "\\alpha", c: C2.globe, pad: 10 });
  f.seg(368, 110, 368, 170, { label: "Δh", c: C2.soft, side: 14 });
  f.note(8, 224, tr("fx-theo-1", "R/(1 − k) = s² / 2(Δh − s·α) · plane: α = Δh/s"), { size: 9.5 });
  stamp(f, tr, tr("fx-theo-st", "angles enlarged"));
  return f;
}
const C2 = FIG.C;
