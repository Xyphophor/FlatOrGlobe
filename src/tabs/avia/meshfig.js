// Vitrine « une forme sort des seuls temps de vol » (2026-11-25, propriétaire : appliquer à avia la méthode de la figure
// des séismes, seis/meshfig.js, devenue la méthode standard : core/shape-reel.js). Tout vient de avia-mesh (fog build
// avia-mesh, go doc ./internal/build/aviamesh) :
//   1. les aéroports posés un à un sur un PLAN, les plus reliés d'abord, chacun là où ses temps le mettent ;
//   2. le plan poli : il cale (et le meilleur de 100 départs au hasard ne fait guère mieux) ;
//   3. la même construction sur une sphère de taille LIBRE (un seul nombre de plus que le plan : R ; R → ∞ redonne le plan) ;
//   4. seulement alors les cordes deviennent des arcs et la sphère se montre ;
//   5. la vitesse : l'unité est la distance volée en une heure ; avec la vitesse propre déposée (TAS), R en km ;
//   6. la vérification : le nuage tourné (rotation seule) sur la vraie carte, un arc rouge pointillé par aéroport.
// Pourquoi pas l'espace libre comme pour les séismes : 85 routes ne fixent pas 32 points dans l'espace (dit dans la page).
// Les couleurs sont les vraies latitudes ; un aéroport à une ou deux routes n'est pas fixé par les temps : dessiné creux.
import { makeShapeReel, earthFrame, frameAt, asPts, camera, earthCam, mmul, viewTo, vec, norm, dot3, latCol, angErrors, lerp, ease, clamp, sceneOf, D2R, TEAL, AMBER, RED, REEL_COL } from "../../core/shape-reel.js";
import { AVIA_MESH as M } from "../../data/presets/avia-mesh.js";
import { num } from "../curv/fmt.js";

export const EARTH_KM = 6371;   // pour comparer seulement : jamais lu par l'ajustement
const N = M.airports.length, PL = M.plane, SP = M.sphere, PF = PL.frames, SF = SP.frames;
const PF_GROW = PF.filter((f) => f.it <= N), PF_POL = PF.filter((f) => f.it >= N), SF_GROW = SF.filter((f) => f.it <= N), SF_POL = SF.filter((f) => f.it >= N);
const LINES = Array.from({ length: M.routes.length / 2 }, (_, i) => [M.routes[2 * i], M.routes[2 * i + 1]]);
const FIXED = (j) => M.fixed[j], NFIX = M.fixed.filter(Boolean).length;
const R = SP.R, KM = R * M.tas;

const SCENES = [
  { key: "grow", d: 8 }, { key: "plane", d: 4, join: true }, { key: "curve", d: 9, join: true }, { key: "arcs", d: 4, join: true },
  { key: "speed", d: 5, join: true }, { key: "map", d: 10, join: true },
];
const START = {}; { let a = 0; for (const s of SCENES) { START[s.key] = a; a += s.d; } }
export const DURATION = SCENES.reduce((a, s) => a + s.d, 0);

const EN = {
  "amr-schem": "real airborne times only · colour = the airport's real latitude, never read by the fit · hollow = place not fixed by the times",
  "amr-grow-k": "The plane",
  "amr-grow-a": "Airports laid one by one on a plane.",
  "amr-grow-b": "{{routes}} round trips, no coordinate: one unit = one hour of flight. The best-connected airports first, each put where its flight times say.",
  "amr-plane-k": "It stalls",
  "amr-plane-a": "The plane cannot make the times fit.",
  "amr-plane-b": "Polished with every freedom, it still misses by {{ps}} rms; the best of {{starts}} random starts, {{pr}}.",
  "amr-curve-k": "One number more",
  "amr-curve-a": "Same steps, on a sphere of any size.",
  "amr-curve-b": "Its radius R is free: a huge sphere is the plane again. The times choose R = {{R}} units, and the misfit drops to {{ss}}.",
  "amr-arcs-k": "A sphere",
  "amr-arcs-a": "Only now, the routes as arcs on it.",
  "amr-arcs-b": "{{ratio}} times better than the plane, with one number more. The straight lines become great circles.",
  "amr-speed-k": "The speed",
  "amr-speed-a": "One unit is one hour of flight.",
  "amr-speed-b": "At the true airspeed the airlines file, {{tas}}, R = {{km}}. Another speed only changes the size.",
  "amr-map-k": "The check",
  "amr-map-a": "Only now, the real map.",
  "amr-map-b": "Turned to fit best (rotation only), the {{nfix}} airports whose place the times fix sit {{vs}} rms from their real place. Red dashes: each airport's error.",
  "amr-plane": "plane", "amr-sphere": "sphere", "amr-rms": "rms of the time residuals", "amr-placed": "airports placed", "amr-random": "best of {{starts}} random starts",
  "amr-R": "radius", "amr-units": "units", "amr-tas": "speed", "amr-err": "error after rotation", "amr-median": "median", "amr-max": "largest",
  "amr-loose": "hollow: another place fits its routes almost as well", "amr-ring": "the Earth's size, 6,371 km (reference only)",
  "amr-alt": "Animation: airports placed from airborne times alone, one by one, first on a plane, which stalls; then by the same steps on a sphere of free size, which fits; the routes then drawn as great-circle arcs; the size in kilometres from the filed airspeed; finally the cloud turned onto the real map, with a red dashed arc from each airport to its real position",
};

// ---- le repère Terre et la vérification
const EF = earthFrame(SP.rot), ET = EF.ET;
const TRUE = Array.from({ length: N }, (_, j) => EF.toFit(M.lat[j], M.lon[j]));
const FIN = asPts(SF[SF.length - 1].st, N);
export const ERR = angErrors(FIN, TRUE, FIXED);
const LAT0 = 0, LON0 = (() => { const v = Array.from({ length: N }, (_, j) => vec(M.lat[j], M.lon[j])).reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]); return Math.atan2(v[1], v[0]) / D2R; })();
const COLS = M.lat.map(latCol);
// les routes que la sphère explique le moins (résidus de temps sur la sphère finale, minutes) : des détours, pas des distances
const WORST = LINES.map(([a, b], i) => [`${M.airports[a]}–${M.airports[b]}`, (M.hours[i] - SP.c0 - R * Math.acos(clamp(dot3(norm(FIN[a]), norm(FIN[b])), -1, 1))) * 60])
  .sort((p, q) => Math.abs(q[1]) - Math.abs(p[1])).slice(0, 3);
const LOOSE = M.airports.filter((_, j) => !M.fixed[j]).join(", ");

const placedIn = (order, n) => { const m = new Set(order.slice(0, n)); return (j) => m.has(j); };
const PEXT = Math.max(...asPts(PF[PF.length - 1].st, N).map((p) => Math.hypot(p[0], p[1])));
const B_PLANE = PEXT * 1.12, B_SPH = R * 1.3, PHI0 = 0.4, SPIN = 0.14, E_TOP = 70 * D2R, E_SIDE = 18 * D2R;

/** L'état du dessin à l'instant t (0..DURATION). */
export function stateAt(t) {
  const { key, u, d } = sceneOf(SCENES, START, t);
  const s = { key, u, arc: 0, sph: 0, map: 0, err: 0, lines: 1, k: 1, bound: B_SPH, ring: 0, pts: 1, read: {}, hub: [], names: 0 };
  let e = E_SIDE, spin = SPIN * t, o = [0, 0, 0];
  if (key === "grow" || key === "plane") {
    const grow = key === "grow", F = grow ? PF_GROW : PF_POL, f = frameAt(F, grow ? ease((u - 0.4) / (d - 1.2)) : ease((u - 0.2) / (d - 1.4)), N);
    const n = grow ? Math.round(lerp(f.a.n, f.b.n, f.u)) : N;
    s.st = f.st; s.show = placedIn(PL.order, n); s.sheet = { z0: R, fade: 1 }; s.bound = B_PLANE; e = E_TOP; o = [0, 0, R];
    s.pts = grow ? ease(u / 0.6) : 1;
    s.read = { plane: f.stress, n, rand: !grow && u > d * 0.45 };
  } else if (key === "curve") {
    // le plan s'efface, puis la même construction sur une sphère de taille libre
    if (u < 1.0) {
      s.st = asPts(PF[PF.length - 1].st, N); s.sheet = { z0: R, fade: 1 - ease(u / 0.9) }; s.pts = 1 - ease(u / 0.9);
      s.bound = B_PLANE; e = E_TOP; o = [0, 0, R]; s.read = { planeBest: PL.stress };
    } else {
      const g = ease((u - 1.0) / (d - 3.2)), useGrow = u < d - 2.0;
      const f = useGrow ? frameAt(SF_GROW, g, N) : frameAt(SF_POL, ease((u - (d - 2.0)) / 1.8), N);
      const n = useGrow ? Math.round(lerp(f.a.n, f.b.n, f.u)) : N, Rf = lerp(f.a.R, f.b.R, f.u);
      s.st = f.st; s.show = placedIn(SP.order, n); s.pts = ease((u - 1.0) / 0.6);
      s.bound = Math.max(B_SPH, Rf * 1.3); e = lerp(E_TOP, E_SIDE, ease((u - 1.0) / 2.0));
      s.read = { planeBest: PL.stress, sphere: f.stress, R: Rf, n };
    }
  } else if (key === "arcs") {
    s.st = FIN; s.arc = ease((u - 0.3) / 2.0); s.sph = ease((u - 0.8) / 1.6);
    s.read = { planeBest: PL.stress, sphere: SP.stress, R };
  } else if (key === "speed") {
    s.st = FIN; s.arc = 1; s.sph = 1; s.ring = ease(u / 0.8); s.ringR = EARTH_KM / M.tas;
    s.k = u < 0.6 || u > d - 0.4 ? 1 : 1 + 0.25 * Math.sin((2 * Math.PI * (u - 0.6)) / (d - 1.0));
    s.read = { v: M.tas * s.k };
  } else {   // map
    s.st = FIN; s.arc = 1; s.sph = 1;
    s.slerp = ease((u - 0.2) / 2.6); s.map = ease((u - 1.4) / 2.0); s.lines = 1 - 0.7 * ease((u - 1.0) / 1.2); s.err = ease((u - 3.4) / 1.6);
    s.names = ease((u - 5.0) / 1.0);
    s.spinE = (clamp(u, 2.8, 9.5) - 2.8) * 6;
    spin = SPIN * START.map;
    s.read = { err: s.err };
  }
  s.V = camera(PHI0 + spin, e);
  if (key === "map") s.V = viewTo(s.V, mmul(earthCam(LAT0, LON0 - 20 - s.spinE), EF.E), s.slerp);
  s.o = o;
  return s;
}

function readLines(s, T) {
  const r = s.read, mn = (x) => `${num(x, 1)} min`, out = [];
  if (r.plane != null) {
    out.push([`${T("amr-plane")}: ${mn(r.plane)} ${T("amr-rms")}`, AMBER, true]);
    out.push([`${T("amr-placed")}: ${r.n} / ${N}`, REEL_COL.soft, false]);
    if (r.rand) out.push([`${T("amr-random")}: ${mn(PL.random)}`, AMBER, false]);
  }
  if (r.planeBest != null) out.push([`${T("amr-plane")}: ${mn(Math.min(PL.stress, PL.random))}`, AMBER, r.sphere == null]);
  if (r.sphere != null) {
    out.push([`${T("amr-sphere")}: ${mn(r.sphere)} ${T("amr-rms")}`, TEAL, true]);
    out.push([`${T("amr-R")} ${num(r.R, 2)} ${T("amr-units")}${r.n != null ? ` · ${T("amr-placed")}: ${r.n} / ${N}` : ""}`, TEAL, false]);
  }
  if (r.v != null) {
    out.push([`${T("amr-tas")}: ${num(r.v)} km/h → R = ${num(R * r.v)} km`, REEL_COL.ink, true]);
    out.push([`${T("amr-sphere")} ${mn(SP.stress)} · ${T("amr-R")} ${num(R, 2)} ${T("amr-units")}`, TEAL, false]);
  }
  if (r.err != null) {
    out.push([`${T("amr-err")}: ${num(ERR.rms, 1)}° rms (${NFIX})`, RED, true]);
    if (r.err > 0) out.push([`${T("amr-median")} ${num(ERR.med, 1)}° · ${T("amr-max")} ${num(ERR.max, 1)}°`, REEL_COL.soft, false]);
    if (r.err > 0) out.push([T("amr-loose"), REEL_COL.faint, false]);
  }
  return out;
}

function reelVals() {
  return { routes: num(LINES.length), ps: `${num(PL.stress, 1)} min`, pr: `${num(PL.random, 1)} min`, starts: num(M.starts), R: num(R, 2),
    ss: `${num(SP.stress, 1)} min`, ratio: num(Math.min(PL.stress, PL.random) / SP.stress, 0), tas: `${num(M.tas)} km/h`, km: `${num(KM)} km`,
    nfix: num(NFIX), vs: `${num(ERR.rms, 1)}°` };
}

const REEL = makeShapeReel({
  prefix: "amr", still: START.map + 9, scenes: SCENES, stateAt, readLines, EN, alt: "amr-alt",
  cfg: { key: "avia", R, ET, TRUE, cols: COLS, fixed: FIXED, lines: LINES, names: M.airports, ringLabel: "amr-ring", lineWidth: 1.1, lineAlpha: 2.2, dotScale: 1.25 },
});

export function mountAviaMesh(root, tv) {
  return REEL.mount(root.querySelector("#aviaMesh"), tv, reelVals(), root.querySelector("#aviaMeshReads"));
}

/** Les nombres du texte (<span class="cv" data-amesh>), tous venus du fichier calculé. */
export function aviaMeshValues() {
  const v = reelVals();
  return { ...v, airports: num(N), fixedN: num(NFIX), ambK: num(M.ambK), loose: LOOSE,
    worst: WORST.map(([k, r]) => `${k} ${r > 0 ? "+" : "−"}${num(Math.abs(r))} min`).join(", "),
    outP: PL.out.map((i) => `${M.airports[LINES[i][0]]}–${M.airports[LINES[i][1]]}`).join(", "), outS: SP.out.map((i) => `${M.airports[LINES[i][0]]}–${M.airports[LINES[i][1]]}`).join(", "),
    clipP: `${num(PL.clip, 1)} min`, clipS: `${num(SP.clip, 1)} min`, clipKm: `${num(SP.clipR * M.tas)} km`, nOutP: num(PL.out.length), nOutS: num(SP.out.length), nTas: num(M.nTas), planeBest: `${num(Math.min(PL.stress, PL.random), 1)} min`,
    near: num(SP.near), free3: `${num(M.free3.stress, 1)} min`, free3rel: `${num(M.free3.rel * 100, 0)} %`, errMed: `${num(ERR.med, 1)}°`, errMax: `${num(ERR.max, 1)}°`,
    dof: num(3 * N - 6), planeGrow: `${num(PL.stress, 1)} min`, dofS: num(2 * N - 3 + 1), sphRand: `${num(SP.random, 1)} min` };
}
