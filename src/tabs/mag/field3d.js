// Lignes de champ des trois modèles de l'onglet mag EN 3D (2026-09-30) :
// boucles FERMÉES, calculées par la même physique que logic.js, puis
// projetées orthographiquement (règle 1 : une seule échelle par vue, rien
// d'étiré). Pur (aucun DOM) : draw3D() dessine sur n'importe quel contexte
// Canvas 2D -- la page, ou le rastériseur de scripts/.mag3d.mjs.
//
// Monde : x, y horizontaux, z vers le haut, en km.
//   globe -- dipôle centré (moment vers le sud géographique), sphère de
//            6 371 km, noyau liquide sous 2 891 km ; lignes r = L cos²λ,
//            fermées en passant par le dipôle.
//   flat1 -- dipôle vertical enterré à MAG_D1 sous le centre du disque.
//   flat2 -- pôle −1 au centre et anneau +1 au bord, à MAG_D2 ; les lignes
//            tracées numériquement vont de l'anneau au centre, au-dessus
//            ET au-dessous du plan des pôles (symétrie), et reviennent au
//            bord dans le disque aimanté (M radial, ∝ 1/r).
// Chaque boucle est orientée : l'ordre des points suit le sens de B.
import { MAG_RKM, MAG_D1, MAG_D2, flat2RawZ } from "./logic.js";
import { niceLen } from "../../core/canvas.js";

const R_EARTH = 6371, R_CORE = 3480;
const RAD = Math.PI / 180;
const AZ = [0, 90, 180, 270];

/** Fait tourner une courbe méridienne [[r, z], ...] autour de l'axe z. */
const revolve = (rz, phi) => rz.map(([r, z]) => [r * Math.cos(phi * RAD), r * Math.sin(phi * RAD), z]);

/** Boucle dipolaire r = L cos²λ autour de (0, 0, z0), moment vers −z : B suit λ croissant. */
function dipoleLoop(L, z0) {
  const rz = [[0, z0]];
  for (let l = -89; l <= 89; l += 1) { const r = L * Math.cos(l * RAD) ** 2; rz.push([r * Math.cos(l * RAD), z0 + r * Math.sin(l * RAD)]); }
  rz.push([0, z0]);
  return rz;
}

/** Trace ② de l'anneau au pôle central (sens de B), départ au pôle à l'angle `ang` au-dessus du plan. */
function flat2Trace(ang) {
  const a = ang * RAD, d2 = MAG_D2;
  let r = 650 * Math.cos(a), z = -d2 + 650 * Math.sin(a);
  const pts = [[r, z]];
  for (let i = 0; i < 8000; i++) {
    const b = flat2RawZ(r, z, d2), m = Math.hypot(b.Bx, b.Bz);
    if (m < 1e-15) break;
    r -= (b.Bx / m) * 60; z -= (b.Bz / m) * 60; // contre B : du puits vers la source
    pts.push([r, z]);
    if (Math.hypot(r - MAG_RKM, z + d2) < 500) break;
  }
  return [[MAG_RKM, -d2], ...pts.reverse(), [0, -d2]]; // anneau -> centre, dans le sens de B
}

const _loops = {};
/** Boucles 3D fermées d'un modèle : [[[x,y,z]...], ...], orientées dans le sens de B. Géométrie fixe -> mémoïsée. */
export function loops3D(model) {
  if (_loops[model]) return _loops[model];
  const out = (_loops[model] = []);
  if (model === "globe") {
    for (const phi of AZ) for (const L of [1.6, 2.3, 3.2]) out.push(revolve(dipoleLoop(L * R_EARTH, 0), phi));
  } else if (model === "flat1") {
    for (const phi of AZ) for (const L of [2.8, 3.4, 4.5]) out.push(revolve(dipoleLoop(L * MAG_D1, -MAG_D1), phi));
  } else {
    const back = []; // retour dans le disque aimanté : du centre vers l'anneau
    for (let k = 1; k <= 20; k++) back.push([(k / 20) * MAG_RKM, -MAG_D2]);
    for (const ang of [22, 45, 62]) {
      const up = flat2Trace(ang);
      const down = up.map(([r, z]) => [r, -2 * MAG_D2 - z]); // symétrique sous le plan des pôles
      for (const half of [up, down]) for (const phi of AZ) out.push(revolve([...half, ...back], phi));
    }
  }
  return out;
}

/** Projection orthographique : lacet autour de z, puis tangage (vue plongeante si pitch > 0). */
export function projector(yaw, pitch) {
  const cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD), cp = Math.cos(pitch * RAD), sp = Math.sin(pitch * RAD);
  return ([x, y, z]) => {
    const u = x * cy - y * sy, d = x * sy + y * cy; // d : profondeur horizontale (vers l'arrière)
    return { u, v: z * cp + d * sp, depth: d * cp - z * sp }; // depth > 0 : derrière le plan passant par l'origine
  };
}

const COL = {
  globe: { air: "rgba(15,118,110,0.95)", in: "rgba(15,118,110,0.45)", arrow: "#0f766e" },
  flat: { air: "rgba(180,83,9,0.95)", in: "rgba(180,83,9,0.40)", arrow: "#b45309" },
};

/**
 * Dessine un modèle dans le rectangle (x0, y0, w, h) du contexte. Ordre du
 * peintre en trois couches : ce qui est derrière / sous la surface, la
 * surface translucide, puis le reste. Flèches = sens de B, deux par boucle.
 */
export function draw3D(ctx, model, x0, y0, w, h, { yaw = -35, pitch = 22, lang = "en" } = {}) {
  const P = projector(yaw, pitch), loops = loops3D(model);
  const flat = model !== "globe", col = flat ? COL.flat : COL.globe;
  // échelle unique, indépendante du lacet (la figure ne « zoome » pas quand on la tourne) :
  // cylindre englobant de rayon rmax, de zmin à zmax
  let rmax = flat ? MAG_RKM : 0, zmin = 0, zmax = 0;
  for (const l of loops) for (const [x, y, z] of l) { rmax = Math.max(rmax, Math.hypot(x, y)); zmin = Math.min(zmin, z); zmax = Math.max(zmax, z); }
  const cp = Math.cos(pitch * RAD), sp = Math.abs(Math.sin(pitch * RAD));
  const vmin = zmin * cp - rmax * sp, vmax = zmax * cp + rmax * sp;
  const sc = Math.min((w * 0.94) / (2 * rmax), ((h - 22) * 0.94) / (vmax - vmin));
  const cx = x0 + w / 2, cyy = y0 + (h - 22) / 2 + ((vmin + vmax) / 2) * sc;
  const S = (p) => { const q = P(p); return [cx + q.u * sc, cyy - q.v * sc, q.depth]; };

  // couche d'un segment : 0 = derrière/dessous, 1 = entre (② : entre le disque aimanté et le sol), 2 = devant/dessus
  const inside = (p) => (flat ? p[2] < 0 : Math.hypot(...p) < R_EARTH);
  const layer = (a, b) => {
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    if (!flat) return P(m).depth > 0 ? 0 : 2;
    if (m[2] >= 0) return 2;
    return model === "flat2" && m[2] >= -MAG_D2 ? 1 : 0;
  };
  const segs = [[], [], []];
  for (const l of loops) for (let i = 1; i < l.length; i++) segs[layer(l[i - 1], l[i])].push([l[i - 1], l[i]]);
  // ② : le retour dans le disque aimanté (plan des pôles, z = −D2 exactement) en encre
  const isBack = (a, b) => model === "flat2" && a[2] === -MAG_D2 && b[2] === -MAG_D2;
  // un chemin par style (quelques milliers de segments : un stroke() chacun serait lent)
  const strokeSegs = (list) => {
    const groups = new Map();
    for (const [a, b] of list) {
      const k = isBack(a, b) ? "back" : inside(a) && inside(b) ? "in" : "air";
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push([a, b]);
    }
    for (const [k, g] of groups) {
      ctx.strokeStyle = k === "back" ? "rgba(21,26,33,0.9)" : col[k];
      ctx.lineWidth = k === "back" ? 2.2 : 1.3;
      ctx.beginPath();
      let last = null;
      for (const [a, b] of g) {
        const A = S(a), B = S(b);
        if (a !== last) ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]); last = b;
      }
      ctx.stroke();
    }
  };
  const ellipse = (r, z, fill, stroke, lw = 1.2) => {
    ctx.beginPath();
    for (let a = 0; a <= 360; a += 4) { const q = S([r * Math.cos(a * RAD), r * Math.sin(a * RAD), z]); a === 0 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  const disk = (r, fill, stroke) => { // sphère vue en projection orthographique : un disque
    const c = S([0, 0, 0]);
    ctx.beginPath(); ctx.arc(c[0], c[1], r * sc, 0, 2 * Math.PI); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
  };

  strokeSegs(segs[0]);
  if (!flat) {
    disk(R_EARTH, "rgba(220,239,236,0.55)", "rgba(15,118,110,0.9)");
    disk(R_CORE, "rgba(234,160,90,0.35)", "rgba(180,83,9,0.6)");
    ellipse(R_EARTH, 0, null, "rgba(15,118,110,0.5)", 1);
  } else if (model === "flat2") {
    ellipse(MAG_RKM, -MAG_D2, "rgba(21,26,33,0.16)", "rgba(21,26,33,0.85)", 1.6);
  } else {
    const a = S([0, 0, -MAG_D1 - 900]), b = S([0, 0, -MAG_D1 + 900]); // l'aimant
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  strokeSegs(segs[1]);
  if (flat) ellipse(MAG_RKM, 0, "rgba(246,236,220,0.55)", "rgba(180,83,9,0.9)", 1.6);
  strokeSegs(segs[2]);

  // flèches : sens de B (ordre des points), à 30 % et 70 % de la longueur de chaque boucle
  for (const l of loops) {
    const cum = [0];
    for (let i = 1; i < l.length; i++) cum.push(cum[i - 1] + Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1], l[i][2] - l[i - 1][2]));
    // ② : une flèche sur l'arc (anneau -> centre), une sur le retour dans le disque (centre -> anneau)
    const spots = model === "flat2" ? [0.25 * cum[l.length - 22], cum[l.length - 11]] : [0.3, 0.7].map((f) => f * cum[cum.length - 1]);
    for (const t of spots) {
      let i = 1; while (i < l.length - 1 && cum[i] < t) i++;
      const A = S(l[i - 1]), B = S(l[i]);
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
      if (L < 1e-6) continue;
      const ux = dx / L, uy = dy / L, s = 5;
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      ctx.fillStyle = isBack(l[i - 1], l[i]) ? "#151a21" : inside(l[i - 1]) && inside(l[i]) ? col.in : col.arrow;
      ctx.beginPath();
      ctx.moveTo(mx + ux * s, my + uy * s);
      ctx.lineTo(mx - ux * s - uy * s * 0.7, my - uy * s + ux * s * 0.7);
      ctx.lineTo(mx - ux * s + uy * s * 0.7, my - uy * s - ux * s * 0.7);
      ctx.closePath(); ctx.fill();
    }
  }
  // pôles de ② par-dessus
  if (model === "flat2") {
    const c = S([0, 0, -MAG_D2]);
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(c[0], c[1], 3.5, 0, 2 * Math.PI); ctx.closePath(); ctx.fill();
  }
  // barre d'échelle (longueurs parallèles à l'écran : projection orthographique)
  const km = niceLen((w * 0.28) / sc), px = km * sc, bx = x0 + 10, by = y0 + h - 10;
  ctx.strokeStyle = "#5b6470"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + px, by); ctx.lineTo(bx + px, by - 4); ctx.stroke();
  if (ctx.fillText) {
    ctx.fillStyle = "#5b6470"; ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(`${km.toLocaleString(lang)} km`, bx + px + 6, by);
  }
  return { sc };
}
