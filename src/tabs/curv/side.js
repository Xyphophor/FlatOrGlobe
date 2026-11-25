// Schéma de profil (epic13) : les deux courbures dans un seul dessin.
// Règle 1 : pour voir la hauteur à côté de la planète, la Terre est dessinée
// PLUS PETITE (R/ex, échelle uniforme, jamais d'axe étiré) et ex est imprimé ;
// les angles écrits sont les vrais (logic.js), pas lus sur le dessin.
import { figColor } from "../../core/theme.js";
import { setupCanvas } from "../../core/canvas.js";
import { R_EARTH, K_STD, dip, horizonRadius, surfaceDrop } from "./logic.js";
import { fmtH, fmtLen, fmtAng, num } from "./fmt.js";

const TARGET = 25 * Math.PI / 180;   // dip DESSINÉ visé : lisible sans sortir du cadre

function cssVar(el, name, fb) { return figColor(name, fb); }

export function drawSide(cv, h, tr) {
  const { ctx, W, H } = setupCanvas(cv);
  if (!W) return;
  const globe = cssVar(cv, "--globe", "#0f766e"), flat = cssVar(cv, "--flat", "#b45309"), ink = "#151a21";
  // facteur de rétrécissement : le dip de la Terre rétrécie vaut TARGET, ou la vraie Terre si h est déjà grand
  const exRaw = (1 / Math.cos(TARGET) - 1) * R_EARTH / h;
  const ex = Math.max(1, exRaw), Rs = R_EARTH / ex;
  const dD = Math.acos(Rs / (Rs + h));               // dip de la Terre dessinée (sert au tracé seulement)
  const Rd = Math.min((0.36 * W) / Math.sin(dD), 4 * W);
  const s = Rd / Rs, hd = h * s;
  const eye = [W / 2, Math.max(34, 0.16 * H)];
  const cx = W / 2, cy = eye[1] + hd + Rd;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  // Terre
  ctx.beginPath(); ctx.arc(cx, cy, Rd, 0, 2 * Math.PI); ctx.fillStyle = "#dcefec"; ctx.fill();
  ctx.strokeStyle = globe; ctx.lineWidth = 1.4; ctx.stroke();
  // niveau de l'œil (horizon d'un plan infini)
  ctx.save(); ctx.strokeStyle = flat; ctx.setLineDash([7, 5]); ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(8, eye[1]); ctx.lineTo(W - 8, eye[1]); ctx.stroke(); ctx.restore();
  // plan tangent au sol sous l'œil : la courbure de la TERRE, c'est la chute sous lui
  const gy = cy - Rd;
  ctx.save(); ctx.strokeStyle = "#8b93a0"; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W * 0.08, gy); ctx.lineTo(W * 0.92, gy); ctx.stroke(); ctx.restore();
  const xa = W * 0.2, ya = cy - Math.sqrt(Math.max(0, Rd * Rd - (xa - cx) ** 2));
  ctx.strokeStyle = ink; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(xa, gy); ctx.lineTo(xa, ya); ctx.moveTo(xa - 4, gy); ctx.lineTo(xa + 4, gy); ctx.moveTo(xa - 4, ya); ctx.lineTo(xa + 4, ya); ctx.stroke();
  // lignes de visée tangentes, points d'horizon, anneau vu par la tranche
  const tp = (sg) => [cx + sg * Rd * Math.sin(dD), cy - Rd * Math.cos(dD)];
  ctx.strokeStyle = globe; ctx.lineWidth = 1.3;
  for (const sg of [-1, 1]) { const p = tp(sg); ctx.beginPath(); ctx.moveTo(eye[0], eye[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); }
  const [pL, pR] = [tp(-1), tp(1)];
  ctx.save(); ctx.strokeStyle = globe; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.ellipse(cx, pR[1], pR[0] - cx, Math.max(2, (pR[0] - cx) * 0.06), 0, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
  ctx.fillStyle = globe; for (const p of [pL, pR]) { ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 2 * Math.PI); ctx.fill(); }
  // arc du dip à l'œil
  ctx.strokeStyle = ink; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(eye[0], eye[1], 42, 0, dD); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, 2 * Math.PI); ctx.fill();
  ctx.beginPath(); ctx.moveTo(eye[0], eye[1]); ctx.lineTo(eye[0], gy); ctx.strokeStyle = "#5b6470"; ctx.stroke();

  const lab = (t, x, y, al = "left", col = ink) => { ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = al; ctx.textBaseline = "middle"; ctx.fillStyle = col; ctx.fillText(t, x, y); };
  const dR = dip(h, K_STD), dG = dip(h);
  lab(`δ = ${fmtAng(dG)} (${fmtAng(dR)} ${tr("refr-s", "refr.")})`, eye[0] + 48, eye[1] + 16);
  lab(tr("s-eye", "eye level: a plane's horizon"), 10, eye[1] - 9, "left", flat);
  lab(`h = ${fmtH(h)}`, eye[0] - 8, (eye[1] + gy) / 2, "right");
  lab(`${tr("s-ring", "horizon ring, radius")} ${fmtH(horizonRadius(h))}`, pR[0], pR[1] + 16, "right", globe);
  lab(tr("s-drop", "ground below the level: d²/2R"), xa + 8, (gy + ya) / 2 + 12, "left");
  lab(`${fmtLen(surfaceDrop(10000))} @ 10 km · ${fmtLen(surfaceDrop(100000))} @ 100 km`, xa + 8, (gy + ya) / 2 + 26, "left", "#5b6470");
  ctx.font = "10.5px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillStyle = "#5b6470";
  ctx.fillText(ex > 1.001 ? `${tr("s-shrunk", "Earth drawn")} ×${num(ex, ex >= 100 ? 0 : 1)} ${tr("s-shrunk2", "smaller (R/ex), uniform scale; angles are the real ones")}`
    : tr("s-true", "true scale; angles are the real ones"), 8, H - 6);
}
