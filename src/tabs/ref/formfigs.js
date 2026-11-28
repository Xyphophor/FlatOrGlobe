// Schémas des formules de l'onglet ref (2026-10-01, revue de toute la page,
// epic15/UC03). Montés par index.js après drawSymbols, avant renderTexIn.
// Schématiques, tamponnés « not to scale » (règle 1).
import { figFitBox, fbNum } from "../../core/fitbox.js";
import { zenFit } from "./values.js";
import { FIG, polar } from "../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { r206Rows } from "./logic.js";
import { ZEN_PAIRS, ZEN_HOURLY, ZEN_HOURLY_DAYS, ZEN_METEO } from "../../data/presets/ref-zenith.js";
import { REF_IGRA, REF_IGRA_ST } from "../../data/presets/ref-igra.js";
import { R206, R206_MARKS } from "../../data/presets/surv-recip.js";
import { LAS, LAS_AIRS, lasK, lasEdgeDist, lasKNeed } from "./laser.js";

const C = FIG.C;

/** La dérivation (1)-(8) : sol y = −x²/2R, rayon y = βx − x²/2ρ, hauteur H(x) du rayon au-dessus du sol. */
function figRay(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-ray-alt", "Local frame at the observer: the ground falls away as minus x squared over 2R; the light ray leaves at a small angle β and bends down with its own radius ρ, much larger than R; the height H of the ray above the ground at distance x is the difference of the two curves") });
  const ox = 26, oy = 70, Rp = 495, rho = 1414, beta = 0.08, X = (x) => ox + x;
  const ground = [], ray = [];
  for (let x = 0; x <= 340; x += 10) { ground.push([X(x), oy + x * x / (2 * Rp)]); ray.push([X(x), oy - (beta * x - x * x / (2 * rho))]); }
  const d = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  f.path(d(ground), { c: C.ground, w: 2.4 });
  f.path(d(ray), { c: C.globe, w: 2 });
  f.dash(ox, oy, X(340), oy, { c: C.faint });
  f.dot(ox, oy, { r: 4 });
  f.angle(ox, oy, 70, 0, beta * 180 / Math.PI * 1.6, { label: "β", tex: "\\beta", c: C.globe, pad: 10 });
  const x1 = 250, yg = oy + x1 * x1 / (2 * Rp), yr = oy - (beta * x1 - x1 * x1 / (2 * rho));
  f.seg(X(x1), yr, X(x1), yg, { label: "H(x)", tex: "H(x)", c: C.flat, side: -24 });
  f.txt(X(150), oy + 150 * 150 / (2 * Rp) + 22, "y = −x²/2R", { tex: "y = -x^2/2R", c: C.ground, size: 11 });
  f.txt(X(150), oy - 26, "y = βx − x²/2ρ", { tex: "y = \\beta x - x^2/2\\rho", c: C.globe, size: 11 });
  f.note(ox + 6, oy + 18, tr("fx-ray-1", "observer"), { size: 9.5 });
  f.note(10, 196, tr("fx-ray-2", "the air thins upward, n falls, and the ray bends down"), { size: 9.5 });
  f.note(10, 209, tr("fx-ray-3", "with radius ρ = R/k: the ground falls away faster"), { size: 9.5 });
  f.note(10, 222, tr("fx-ray-4", "H(x) = βx + x²(1 − k)/2R: the same as a straight ray over R/(1 − k)"), { size: 9.5 });
  stamp(f, tr, tr("fx-ray-s", "curvatures enlarged, k drawn ≈ 0.35"));
  return f;
}

/** Observations réciproques : angles zénithaux mesurés z, droits ζ, réfraction δ, angle au centre γ. */
function figRecip(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-rec-alt", "Two stations A and B on a curved Earth; their verticals meet at the centre at the angle γ. The straight line from A to B makes the zenith angle ζ with each vertical; the refracted ray, bowed upward, arrives from slightly higher, so each instrument reads z = ζ − δ") });
  const cx = 190, cy = 360, R = 240, aA = 106, aB = 74, hs = 30, bow = 45;
  f.path(`M${polar(cx, cy, R, 122).join(" ")}A${R} ${R} 0 0 1 ${polar(cx, cy, R, 58).join(" ")}`, { c: C.ground, w: 2.4 });
  const A = polar(cx, cy, R + hs, aA), B = polar(cx, cy, R + hs, aB);
  // verticales, jusqu'au bord bas (elles se coupent au centre, hors cadre)
  for (const [P, a] of [[A, aA], [B, aB]]) {
    f.dash(...polar(P[0], P[1], 170, a + 180), ...polar(P[0], P[1], 48, a), { c: C.faint });
    f.line(...P, ...polar(P[0], P[1], hs, a + 180), { c: C.ink, w: 1.6 });            // le pied de l'instrument
  }
  f.note(cx, 244, tr("fx-rec-1", "the verticals meet at the centre, at the angle γ = s/R"), { size: 9.5, anchor: "middle" });
  // corde droite et rayon courbé vers le haut
  f.line(...A, ...B, { c: C.soft, w: 1.2, dash: "4 3" });
  f.path(`M${A[0]} ${A[1]}Q${cx} ${A[1] - bow} ${B[0]} ${B[1]}`, { c: C.globe, w: 2 });
  f.dot(...A, { r: 4 }); f.dot(...B, { r: 4 });
  f.txt(A[0] - 14, A[1] + 16, "A", { c: C.ink }); f.txt(B[0] + 6, B[1] + 16, "B", { c: C.ink });
  // angles en A : ζ (verticale -> corde), z (verticale -> rayon), δ entre les deux
  const tRay = Math.atan2(bow, cx - A[0]) * 180 / Math.PI;   // tangente au départ (Bézier : vers le point de contrôle)
  f.angle(A[0], A[1], 24, tRay, aA, { label: "z", tex: "z", c: C.globe, pad: 9 });
  f.angle(A[0], A[1], 60, 0, aA, { label: "ζ", tex: "\\zeta", c: C.soft, pad: 10 });
  f.angle(A[0], A[1], 38, 0, tRay, { label: "δ", tex: "\\delta", c: C.flat, pad: 9 });
  f.angle(B[0], B[1], 38, 180 - tRay, 180, { label: "δ", tex: "\\delta", c: C.flat, pad: 9 });
  const Z = polar(A[0], A[1], 48, aA);
  f.note(Z[0] + 6, Z[1] + 4, tr("fx-rec-2", "zenith"), { size: 9.5 });
  f.note(10, 16, tr("fx-rec-3", "dashed: the straight line A–B (angle ζ)"), { size: 9.5 });
  f.note(10, 29, tr("fx-rec-4", "blue: the light, bowed up; read: z = ζ − δ"), { size: 9.5, c: C.globe });
  stamp(f, tr, tr("fx-rec-s", "angles enlarged"));
  return f;
}

/** Route 206 MP 27-28 (2026-10-04) : k de chaque session, même ligne, mêmes repères. */
function figR206(tr) {
  const rows = r206Rows(R206, R206_MARKS);
  const f = FIG.make({ w: 380, h: 90 + rows.length * 17, alt: tr("fx-r206-alt", "The refraction coefficient k measured ten times on the same 1.5 km line along Route 206 in New Jersey, sight line 1.5 to 1.7 m above the ground. Eight sessions, six of them between 10:05 and 14:28, give k between minus 0.48 and minus 0.21, light bending upward over ground warmer than the air; two other days give plus 0.48 and plus 0.94. The standard value 0.13 lies in between and was never observed") });
  const X0 = 112, X1 = 366, K0 = -0.6, K1 = 1.0, Y0 = 34;
  const kx = (k) => X0 + (k - K0) / (K1 - K0) * (X1 - X0);
  const yb = Y0 + rows.length * 17;
  for (const k of [-0.5, 0, 0.5, 1]) { f.dash(kx(k), Y0 - 8, kx(k), yb, { c: "#e7e3da", dash: "3 3" }); f.note(kx(k), yb + 14, k.toFixed(1).replace("-", "−"), { anchor: "middle" }); }
  f.line(kx(0), Y0 - 8, kx(0), yb, { c: C.faint, w: 1.2 });
  f.dash(kx(0.13), Y0 - 8, kx(0.13), yb, { c: C.globe, dash: "5 3" });
  f.note(kx(0.13) + 4, Y0 - 12, "k = 0.13", { c: C.globe, size: 9.5 });
  rows.forEach((r, i) => {
    const y = Y0 + 8 + i * 17;
    f.note(X0 - 8, y + 4, r.date + (r.time ? " " + r.time : ""), { anchor: "end", size: 9.5 });
    f.dot(kx(r.k), y, { r: 3.4, c: r.k < 0 ? C.flat : C.globe });
  });
  f.note(4, yb + 30, tr("fx-r206-1", "k = 1 − ε/γ, γ = 49.9″ from the GNSS coordinates (52.1″ in 2018)"), { size: 9.5 });
  f.note(4, yb + 43, tr("fx-r206-2", "below 0: light bending up, over ground warmer than the air"), { size: 9.5, c: C.flat });
  axesStamp(f, tr, tr("fx-r206-st", "k axis"));
  return f;
}

/** Route 206 (2026-10-07) : le dispositif de Kozlowski, vu de côté -- deux stations, deux verticales, deux visées simultanées. */
function figR206Setup(tr) {
  const f = FIG.make({ w: 380, h: 290, alt: tr("fx-r206s-alt", "Side view of the Route 206 line: two total stations about 1.6 m above the road, at mile posts 27 and 28, 1.54 km apart. Each measures at the same moment the zenith angle of the other, from its own vertical. The two verticals are 49.9 arcseconds apart, the angle between the two GNSS positions seen from the Earth's centre. The light either arches up (k above zero, cool ground) or sags toward the road (k below zero, road warmer than the air)") });
  const cx = 190, cy = 1485, R = 1300, aA = 90 + 6.2, aB = 90 - 6.2, hs = 44;
  f.path(`M${polar(cx, cy, R, 98).join(" ")}A${R} ${R} 0 0 1 ${polar(cx, cy, R, 82).join(" ")}`, { c: C.ground, w: 3 });
  f.note(cx, polar(cx, cy, R, 90)[1] + 16, tr("fx-r206s-road", "Route 206, asphalt"), { anchor: "middle", size: 9.5, c: C.ground });
  const gA = polar(cx, cy, R, aA), gB = polar(cx, cy, R, aB), A = polar(cx, cy, R + hs, aA), B = polar(cx, cy, R + hs, aB);
  for (const [P, G, a] of [[A, gA, aA], [B, gB, aB]]) {
    f.dash(...polar(P[0], P[1], 92, a), ...polar(G[0], G[1], 8, a + 180), { c: C.faint });   // la verticale locale (normale GNSS)
    f.line(...G, ...P, { c: C.ink, w: 1.6 });                                                   // l'instrument sur son trépied
    f.line(...polar(G[0], G[1], 9, a + 180 - 90), ...P, { c: C.soft, w: 1 }); f.line(...polar(G[0], G[1], 9, a + 180 + 90), ...P, { c: C.soft, w: 1 });
  }
  f.note(gA[0], gA[1] + 16, "MP 27", { anchor: "middle", size: 9.5 }); f.note(gB[0], gB[1] + 16, "MP 28", { anchor: "middle", size: 9.5 });
  f.seg(...polar(cx, cy, R - 46, aA), ...polar(cx, cy, R - 46, aB), { label: tr("fx-r206s-len", "s = 1.54 km") });
  f.note(gA[0], gA[1] + 29, "h ≈ 1.6 m", { anchor: "middle", size: 9 }); f.note(gB[0], gB[1] + 29, "h ≈ 1.6 m", { anchor: "middle", size: 9 });
  // les deux visées : arquée (k > 0) et creusée vers la route (k < 0)
  const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], up = 26, dn = 20;
  f.path(`M${A[0]} ${A[1]}Q${mid[0]} ${mid[1] - up} ${B[0]} ${B[1]}`, { c: C.globe, w: 1.8 });
  f.path(`M${A[0]} ${A[1]}Q${mid[0]} ${mid[1] + dn} ${B[0]} ${B[1]}`, { c: C.flat, w: 1.8, dash: "5 3" });
  f.note(mid[0], mid[1] - up / 2 - 6, tr("fx-r206s-up", "k > 0: cool ground, light arched"), { anchor: "middle", size: 9.5, c: C.globe });
  f.note(mid[0], mid[1] + dn / 2 + 14, tr("fx-r206s-dn", "k < 0: road warmer than the air"), { anchor: "middle", size: 9.5, c: C.flat });
  f.dot(...A, { r: 3.6 }); f.dot(...B, { r: 3.6 });
  // les angles zénithaux, chacun depuis sa verticale, le long de la visée arquée
  const tA = f.bearing(A[0], A[1], mid[0], mid[1] - up), tB = f.bearing(B[0], B[1], mid[0], mid[1] - up);
  f.angle(A[0], A[1], 30, tA, aA, { label: "z₁", tex: "z_1", c: C.globe, pad: 10 });
  f.angle(B[0], B[1], 30, aB, tB, { label: "z₂", tex: "z_2", c: C.globe, pad: 10 });
  f.note(polar(A[0], A[1], 92, aA)[0] + 4, polar(A[0], A[1], 92, aA)[1] + 4, tr("fx-r206s-v", "vertical"), { size: 9 });
  f.note(10, 30, tr("fx-r206s-1", "the two stations sight each other at the same moment"), { size: 9.5 });
  f.note(10, 252, tr("fx-r206s-2", "the verticals are γ = 49.9″ apart (two GNSS positions)"), { size: 9.5 });
  f.note(10, 266, tr("fx-r206s-3", "excess ε = z₁ + z₂ − 180°, refraction k = 1 − ε/γ"), { size: 9.5 });
  f.note(10, 280, tr("fx-r206s-4", "the instrument heights cancel in the sum"), { size: 9.5 });
  stamp(f, tr, tr("fx-r206s-s", "heights, curvature and angles enlarged"));
  return f;
}


/* L'air stratifié (2026-10-09) : le profil de température près de la surface (à gauche) et trois rayons partis du même œil
 * (à droite) ; le bas se courbe vers le haut dans la couche froide, le haut presque droit : k dépend de la hauteur. */
function figLayer(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-nu-alt", "Left, air temperature against height above warm water: it drops fast in the lowest metres and slowly above. Right, three rays from the same eye toward a distant object: the lowest bends strongly upward in the cold layer, the middle one a little, the highest almost not at all, so the bottom of the object is pushed down and squeezed while its top is drawn almost normally.") });
  const base = 196, top = 40;
  // profil T(h) : logarithmique près de la surface
  f.line(30, base, 30, top, { c: C.faint, w: 1 }); f.line(30, base, 120, base, { c: C.faint, w: 1 });
  const prof = []; for (let i = 0; i <= 40; i++) { const h = i / 40, y = base - h * (base - top); prof.push([30 + 80 - 62 * Math.log(1 + 30 * h) / Math.log(31) - 6 * h, y]); }
  f.path(prof.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(""), { c: C.flat, w: 2 });
  f.note(34, top - 6, tr("fx-nu-1", "height"), { size: 9.5 }); f.note(122, base + 12, "T", { size: 10, anchor: "end" });
  f.note(36, base - 6, tr("fx-nu-2", "sea, warmer"), { size: 9, c: C.sea });
  // la mer et les rayons
  f.line(140, base, 372, base, { c: C.sea, w: 2.2 });
  const ex = 150, ey = 120, tx = 352;
  f.line(tx, base, tx, 62, { c: C.ink, w: 3 });
  // rayons simulés : courbure vers le haut κ(h) = κ₀·e^(−h/8 px), forte près de la mer, presque nulle plus haut
  for (const [s0, col] of [[0.5, C.flat], [0.25, C.sea], [0.06, C.globe]]) {
    let x = ex, y = ey, sl = s0; const pts = [[x, y]];
    while (x < tx) { const h = base - y; sl -= 0.05 * Math.exp(-h / 8) * 2; y += sl * 2; x += 2; if (y > base - 1) break; pts.push([x, y]); }
    f.path(pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(""), { c: col, w: 1.8 });
  }
  f.dot(ex, ey, { r: 3.5 });
  f.note(10, 222, tr("fx-nu-3", "low rays bend most: the foot sinks, squeezed"), { size: 9.5 });
  f.note(10, 235, tr("fx-nu-4", "high rays nearly straight (k ≈ 0.13)"), { size: 9.5 });
  stamp(f, tr, tr("fx-nu-st", "schematic"));
  return f;
}


// Les lignes réciproques de Schott (2026-10-28, epic34/UC02) : l'excès E = ζ₁ + ζ₂ − 180° contre la longueur s, une couleur
// par région ; la droite du globe vue à travers l'air (s/7 323 km, le R/(1 − k) du site), celle sans air (s/6 371 km) et le
// zéro du plan (au plus 0 : plan et lumière droite ou courbée vers le sol).
const ZEN_COL = { Colorado: "#b45309", California: "#1d4ed8", Hamilton: "#0f766e" };
function figZen(tr) {
  const f = FIG.make({ w: 380, h: 342, alt: tr("fx-zen-alt", "The excess of the two zenith angles over 180 degrees against the length of the line, for 97 lines in Colorado and California: every point lies above zero and they rise with the distance, along the line of a sphere seen through the air; the flat model's zero runs along the bottom") });
  const X0 = 50, X1 = 368, Y0 = 210, Y1 = 26, sMax = 130, eMax = 3600;
  const x = (s) => X0 + s / sMax * (X1 - X0), y = (e) => Y0 - e / eMax * (Y0 - Y1);
  for (const e of [0, 1200, 2400, 3600]) { f.dash(X0, y(e), X1, y(e), { c: "#e7e3da" }); f.note(X0 - 4, y(e) + 4, `${e / 60}′`, { anchor: "end", size: 9 }); }
  for (const s of [0, 40, 80, 120]) f.note(x(s), Y0 + 13, String(s), { anchor: "middle", size: 9.5 });
  const AS = 206264.806;
  f.line(x(0), y(0), x(sMax), y(sMax / 6371 * AS), { c: C.soft, w: 1.2, dash: "4 3" });
  f.line(x(0), y(0), x(sMax), y(sMax / 7323 * AS), { c: C.globe, w: 1.6 });
  f.line(X0, y(0), X1, y(0), { c: C.flat, w: 2 });
  for (const p of ZEN_PAIRS) f.dot(x(p[3]), y(p[4]), { r: 2.6, c: ZEN_COL[p[0]] || C.ink });
  f.note(x(96), y(96 / 6371 * AS) - 8, tr("fx-zen-1", "sphere, no air"), { size: 9, c: C.soft, anchor: "end" });
  f.note(x(124), y(124 / 7323 * AS) + 14, "R/(1−k)", { size: 9.5, c: C.globe, anchor: "end" });
  f.note(X1, y(0) - 6, tr("fx-zen-2", "plane: at most 0"), { size: 9.5, c: C.flat, anchor: "end" });
  f.note(X0 + 4, Y1 + 4, tr("fx-zen-3", "Colorado"), { size: 9.5, c: ZEN_COL.Colorado });
  f.note(X0 + 64, Y1 + 4, tr("fx-zen-4", "California"), { size: 9.5, c: ZEN_COL.California });
  f.note(X0 + 132, Y1 + 4, "Mt Hamilton", { size: 9.5, c: ZEN_COL.Hamilton });
  f.note(X1, 250, tr("fx-zen-5", "length of the line s (km) · excess E = ζ₁ + ζ₂ − 180°"), { size: 9.5, anchor: "end" });
  // l'encadré de l'ajustement (core/fitbox.js), sous le graphe : la droite par zéro donne R/(1 − k) ; pas de χ²/ν (aucune erreur
  // de lecture par ligne à part de la compensation)
  const Z = zenFit();
  figFitBox(f, X1, 262, { R: Z.reff, r: Z.r, scatter: `${fbNum(Z.scatter)}″`, chi2nu: null, title: `${fbNum(ZEN_PAIRS.length)} ${tr("fx-zen-6", "lines")} · R/(1−k)`, col: C.globe, align: "right" });
  axesStamp(f, tr, tr("fx-zen-st", "97 lines, Schott 1900"));
  return f;
}

// Round Top – Jackson Butte, 1879 : k heure par heure (chaque paire simultanée, la moyenne), et le k prédit par les seules
// températures moyennes des deux bouts (P ≈ 703 et 937 hPa, Δh = 2 459 m).
export function zenPredicted(tRT, tJB) {
  const K = (F) => (F - 32) / 1.8 + 273.15, T = (K(tRT) + K(tJB)) / 2, P = (703 + 937) / 2;
  return 503 * P / (T * T) * (0.0342 + (K(tRT) - K(tJB)) / 2459);
}
function figZenHour(tr) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("fx-zenh-alt", "The refraction coefficient k on the 72-kilometre line from Round Top to Jackson Butte, hour by hour over fourteen days in 1879: about 0.145 at night, falling to 0.113 between noon and four in the afternoon and rising again at dusk. The value predicted from the temperatures at the two ends stays near 0.14 all day") });
  const X0 = 46, X1 = 368, Y0 = 196, Y1 = 26, k0 = 0.095, k1 = 0.17;
  const x = (h) => X0 + (h - 1) / 23 * (X1 - X0), y = (k) => Y0 - (k - k0) / (k1 - k0) * (Y0 - Y1);
  for (const k of [0.10, 0.12, 0.14, 0.16]) { f.dash(X0, y(k), X1, y(k), { c: "#e7e3da" }); f.note(X0 - 4, y(k) + 4, k.toFixed(2), { anchor: "end", size: 9 }); }
  for (const h of [1, 6, 12, 18, 24]) f.note(x(h), Y0 + 13, h === 12 ? tr("fx-zenh-noon", "noon") : `${h} h`, { anchor: "middle", size: 9.5 });
  for (const d of ZEN_HOURLY_DAYS) f.dot(x(d[1]), y(d[2]), { r: 1.8, c: "#93b4f0" });
  f.path(ZEN_HOURLY.map((h, i) => `${i ? "L" : "M"}${x(h[0]).toFixed(1)} ${y(h[2]).toFixed(1)}`).join(""), { c: C.globe, w: 2.2 });
  f.path(ZEN_METEO.map((m, i) => `${i ? "L" : "M"}${x(m[0]).toFixed(1)} ${y(zenPredicted(m[1], m[2])).toFixed(1)}`).join(""), { c: C.ink, w: 1.4, dash: "5 3" });
  f.note(X0 + 4, Y1 + 4, tr("fx-zenh-1", "measured: each dot a simultaneous pair, line the mean"), { size: 9.5, c: C.globe });
  f.note(X0 + 4, Y1 + 18, tr("fx-zenh-2", "dashed: predicted from the two ends' air"), { size: 9.5 });
  f.note(X1, 232, tr("fx-zenh-3", "local hour · Round Top–Jackson Butte, 72.4 km, 1879"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("fx-zenh-st", "k axis from 0.095"));
  return f;
}

// Les radiosondages de 2026 (IGRA 2) : la fréquence de chaque k dans la couche basse, de jour et de nuit (cases de 0,05 de
// k = −1 à +2, la première et la dernière ramassent le reste) ; en bas, la médiane des stations par bande de latitude.
function figIgra(tr) {
  const f = FIG.make({ w: 380, h: 300, alt: tr("fx-igra-alt", "Two distributions of the refraction coefficient k measured by radiosondes in 2026, in the lowest layer of air: by day peaked near 0.13, by night broader and centred near 0.23; almost nothing reaches k equal to one. Below, station medians by latitude band, rising towards the poles, higher by night") });
  const X0 = 46, X1 = 368, Y0 = 170, Y1 = 30, k0 = -0.3, k1 = 1.1;
  const x = (k) => X0 + (k - k0) / (k1 - k0) * (X1 - X0);
  const H = (o) => o.hist.map((n) => n / o.n / 0.05);
  const hd = H(REF_IGRA.lowDay), hn = H(REF_IGRA.lowNight), top = Math.max(...hd, ...hn) * 1.08;
  const y = (v) => Y0 - v / top * (Y0 - Y1);
  for (const k of [0, 0.5, 1]) f.note(x(k), Y0 + 13, String(k), { anchor: "middle", size: 9.5 });
  f.line(X0, Y0, X1, Y0, { c: C.faint, w: 1 });
  f.line(x(0.13), Y0, x(0.13), Y1, { c: C.soft, w: 1.2, dash: "4 3" });
  f.line(x(1), Y0, x(1), Y1, { c: C.flat, w: 2 });
  const curve = (h, col) => { const p = []; h.forEach((v, i) => { const kc = -1 + (i + 0.5) * 0.05; if (kc >= k0 && kc <= k1) p.push(`${p.length ? "L" : "M"}${x(kc).toFixed(1)} ${y(v).toFixed(1)}`); }); f.path(p.join(""), { c: col, w: 2 }); };
  curve(hd, "#d97706"); curve(hn, "#1e3a8a");
  f.note(x(0.13) + 4, Y1 + 8, "0.13", { size: 9.5, c: C.soft });
  f.note(x(1) - 4, Y1 + 8, tr("fx-igra-1", "k = 1: looks flat"), { anchor: "end", size: 9.5, c: C.flat });
  f.note(x(-0.04), y(Math.max(...hd) * 0.55), tr("fx-igra-2", "day"), { anchor: "end", size: 10, c: "#d97706" });
  f.note(x(0.55), y(Math.max(...hn) * 0.55), tr("fx-igra-3", "night"), { size: 10, c: "#1e3a8a" });
  f.note(X1, Y0 + 26, tr("fx-igra-4", "k in the lowest layer · {n} soundings").replace("{n}", (REF_IGRA.lowDay.n + REF_IGRA.lowNight.n).toLocaleString(document.documentElement.lang || "en")), { anchor: "end", size: 9.5 });
  // bandes de latitude
  const bands = [[0, 15], [15, 30], [30, 45], [45, 60], [60, 90]], med = (a) => { a = a.filter((v) => v != null).sort((p, q) => p - q); return a[a.length >> 1]; };
  const B0 = 286, bw = (X1 - X0) / bands.length, by = (k) => B0 - k / 0.35 * 64;
  bands.forEach(([a, b], i) => {
    const st = REF_IGRA_ST.filter((s) => Math.abs(s[2]) >= a && Math.abs(s[2]) < b), d = med(st.map((s) => s[6])), n = med(st.map((s) => s[7]));
    const cx = X0 + bw * (i + 0.5);
    const bar = (x0, v, col) => f.path(`M${x0 - 4} ${B0}V${by(v).toFixed(1)}H${x0 + 4}V${B0}Z`, { c: col, w: 0.01, fill: col });
    bar(cx - 6, d, "#d97706"); bar(cx + 6, n, "#1e3a8a");
    f.note(cx, B0 + 12, `${a}–${b}°`, { anchor: "middle", size: 9 });
  });
  f.note(X0 - 4, by(0.3) + 4, "0.3", { anchor: "end", size: 9 }); f.dash(X0, by(0.3), X1, by(0.3), { c: "#e7e3da" });
  f.line(X0, B0, X1, B0, { c: C.faint, w: 1 }); f.note(X0 - 4, B0 + 4, "0", { anchor: "end", size: 9 });
  f.note(X0, by(0.3) - 8, tr("fx-igra-5", "station medians by latitude, day and night"), { size: 9, c: C.soft });
  axesStamp(f, tr, tr("fx-igra-st", "IGRA 2, NOAA, 2026"));
  return f;
}

// Section laser (2026-10-31) : le faisceau qui s'élargit (largeur θd, bord bas sur l'eau à 2h/θ sur un plan, lumière droite).
function figLaser(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fx-las-alt", "A laser on a post at height h above water fires a level beam that widens with distance at the angle θ. Its lower edge reaches the water at the distance 2h over θ, 2 km for 1 m and one milliradian; at 15.3 km the beam is 15 m tall, so an eye anywhere in that height can catch it") });
  const base = 160, ox = 30, h = 34, x1 = 360, half = 0.16;
  f.line(14, base, 370, base, { c: C.sea, w: 2.2 });
  f.line(ox, base, ox, base - h, { c: C.ink, w: 2.4 });
  const yUp = (x) => base - h - (x - ox) * half, xw = ox + h / half;
  f.path(`M${ox} ${base - h}L${x1} ${yUp(x1).toFixed(1)}L${x1} ${base}L${xw.toFixed(1)} ${base}Z`, { c: "#dc2626", w: 0.8, fill: "rgba(220,38,38,.12)" });
  f.dash(ox, base - h, x1, base - h, { c: "#dc2626" });
  f.seg(ox - 10, base, ox - 10, base - h, { label: "h", tex: "h", c: C.ink, side: -12 });
  f.angle(ox, base - h, 120, -half * 180 / Math.PI, half * 180 / Math.PI, { label: "θ", tex: "\\theta", c: "#dc2626", pad: 10 });
  f.seg(ox, base + 16, xw, base + 16, { label: "2h/θ", tex: "2h/\\theta", c: C.flat, side: 14 });
  f.seg(x1 + 6, yUp(x1), x1 + 6, base, { label: "θd", tex: "\\theta d", c: "#dc2626", side: -18 });
  f.note(xw + 4, base - 6, tr("fx-las-1", "lower edge on the water"), { size: 9.5, c: C.sea });
  f.note(10, 200, tr("fx-las-2", "1 mrad, h = 1 m: the edge touches the water at {d} km").replace("{d}", (lasEdgeDist() / 1000).toFixed(0)), { size: 9.5 });
  f.note(10, 213, tr("fx-las-3", "at 15.3 km the beam is 15 m tall: the eye can be anywhere in it"), { size: 9.5 });
  stamp(f, tr, tr("fx-las-st", "angles enlarged"));
  return f;
}

// k selon la hauteur dans les quatre airs de la figure animée : lumière droite, air standard, et les deux profils mesurés le
// 23 février 2019 (k = 503·P/T²·(0,0342 + dT/dh) par segment de leurs relevés) ; en pointillé, le k uniforme qu'il faut au globe.
function figLasK(tr) {
  const f = FIG.make({ w: 380, h: 250, alt: tr("fx-lask-alt", "The refraction coefficient k against height above the water, from the surface to 2.5 metres, in four airs: zero for straight light, 0.13 for the site's standard air, about 0.22 in the air measured at the Brighton end, and in the air measured at the Worthing end about 8 in the first half metre, 0.22 up to 1.5 metres and 13 between 1.5 and 2 metres. A dashed line marks 0.78, the uniform k the globe needs for the laser to be seen") });
  const X0 = 46, X1 = 368, Y0 = 200, Y1 = 26, k0 = -1, k1 = 15, h1 = 2.5;
  const x = (k) => X0 + (Math.max(k0, Math.min(k1, k)) - k0) / (k1 - k0) * (X1 - X0), y = (h) => Y0 - h / h1 * (Y0 - Y1);
  for (const h of [0.5, 1, 1.5, 2]) { f.dash(X0, y(h), X1, y(h), { c: "#e7e3da" }); f.note(X0 - 4, y(h) + 4, `${String(h).replace(".", tr("fx-dec", "."))} m`, { anchor: "end", size: 9 }); }
  for (const k of [0, 1, 5, 10, 15]) f.note(x(k), Y0 + 13, String(k), { anchor: "middle", size: 9.5 });
  f.line(X0, Y0, X1, Y0, { c: C.faint, w: 1 });
  f.line(x(lasKNeed()), Y0, x(lasKNeed()), Y1, { c: C.globe, w: 1.2, dash: "4 3" });
  f.line(X0, y(LAS.hL), X1, y(LAS.hL), { c: "#dc2626", w: 1, dash: "2 3" });
  const col = { vac: C.faint, std: C.soft, worthing: "#1e3a8a", brighton: "#d97706" };
  for (const a of LAS_AIRS) {
    const p = []; for (let i = 0; i <= 250; i++) { const h = 0.01 + (h1 - 0.01) * i / 250; p.push(`${i ? "L" : "M"}${x(lasK(a, h)).toFixed(1)} ${y(h).toFixed(1)}`); }
    f.path(p.join(""), { c: col[a.key], w: a.prof ? 2.2 : 1.4 });
  }
  f.note(x(lasKNeed()) + 4, Y1 + 6, tr("fx-lask-1", "k the globe needs: {k}").replace("{k}", lasKNeed().toFixed(2).replace(".", tr("fx-dec", "."))), { size: 9.5, c: C.globe });
  f.note(x(8.5), y(0.28), tr("fx-lask-2", "Worthing end"), { size: 9.5, c: "#1e3a8a" });
  f.note(x(2), y(1.05), tr("fx-lask-3", "Brighton end"), { size: 9.5, c: "#d97706" });
  f.note(X1, y(LAS.hL) - 4, tr("fx-lask-4", "laser and eye, 1 m"), { size: 9, c: "#dc2626", anchor: "end" });
  f.note(X1, 240, tr("fx-lask-5", "k · their thermometers, 23 Feb 2019 (±0.25 °C, read to 0.5 °C)"), { size: 9.5, anchor: "end" });
  axesStamp(f, tr, tr("fx-lask-st", "k axis cut at 15"));
  return f;
}

export const FORMULA_FIGS = { refFxRay: figRay, refFxLayer: figLayer, refFxRecip: figRecip, refFigR206: figR206, refFigR206Setup: figR206Setup, refFxZen: figZen, refFigZenHour: figZenHour, refFigIgra: figIgra, refFxLaser: figLaser, refFxLasK: figLasK };
export function drawFormulaFigs(root, tr, vals = {}) { return drawAll(root, FORMULA_FIGS, tr, vals, "ref"); }
