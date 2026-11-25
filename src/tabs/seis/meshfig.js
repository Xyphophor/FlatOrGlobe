// Figure « la forme sort des temps » (2026-11-24, refaite le même jour à la demande du propriétaire : « on a l'impression
// qu'on force le globe parce que les arcs sont dessinés depuis le début »). UNE animation sans coupure, en étapes
// annoncées comme une vitrine (core/reel.js, scènes enchaînées) ; tout vient de seis-mesh (fog build seis-mesh) :
//   1. naïf : chaque temps devient une distance en ligne droite, posée sur un PLAN (le départ commun, MDS classique) ;
//   2. le plan a toutes ses libertés (positions, origines, loi) : il cale à 13,9 s ;
//   3. même départ, une coordonnée de plus (la troisième de la même MDS) : l'espace se pose à 1,4 s ;
//   4. seulement alors les droites deviennent des arcs de grand cercle et la sphère se montre ;
//   5. la vitesse (établie avec des distances du globe) varie de ±25 % : seule la taille suit ;
//   6. d'autres lois de vitesse : la taille change, la forme reste une sphère ;
//   7. la vérification : le nuage est tourné (rotation seule) sur la vraie carte, qui apparaît en fondu, et un arc rouge
//      pointillé relie chaque station placée à sa vraie position.
// Les couleurs sont les latitudes publiées des stations : une vérification, jamais lue par l'ajustement. Vue orthographique
// d'un vrai nuage 3D (règle 1 : rien n'est étiré) ; les droites sont des cordes, la distance que l'ajustement emploie.
import { makeShapeReel, earthFrame, frameAt, mix, asPts, centroid, camera, earthCam, mmul, viewTo, vec, norm, dot3, latCol, angErrors, lerp, ease, clamp, sceneOf, D2R, TEAL, AMBER, RED, REEL_COL } from "../../core/shape-reel.js";
import { SEIS_MESH as M } from "../../data/presets/seis-mesh.js";
import { num } from "../curv/fmt.js";

export const EARTH_KM = 6371;                       // pour comparer seulement : jamais lu par l'ajustement
export const V_NOMINAL = EARTH_KM / (100 * M.space.R);   // km/s du début de la loi qui rendrait 6 371 km : le contrôle, pas une entrée
const NS = M.stations, NH = M.hubs, A = M.all;
const PF = M.plane.frames, SF = M.space.frames, FIN = SF[SF.length - 1];

// ---- les scènes (durées en s ; total ≤ 45 s, la règle des vidéos de cartes)
const SCENES = [
  { key: "naive", d: 4.5 }, { key: "plane", d: 5.5, join: true }, { key: "lift", d: 7, join: true }, { key: "arcs", d: 5, join: true },
  { key: "speed", d: 6, join: true }, { key: "laws", d: 7, join: true }, { key: "map", d: 10, join: true },
];
const START = {}; { let a = 0; for (const s of SCENES) { START[s.key] = a; a += s.d; } }
export const DURATION = SCENES.reduce((a, s) => a + s.d, 0);
// les lois montrées, dans cet ordre, puis retour à la loi ajustée
const LAWS = ["-0.04", "+0.04", "linear"].map((t) => M.variants.find((v) => v.tag === t)).filter(Boolean);
const BOUND = 8.8, BOUND_LAW = Math.max(BOUND, ...LAWS.map((v) => v.R * 1.12));

const EN = {
  "msr-schem": "real P times only · colour = the station's real latitude, never read by the fit",
  "msr-naive-k": "Naive start",
  "msr-naive-a": "Each time becomes a straight-line distance.",
  "msr-naive-b": "{{n}} P readings, no coordinate: one unit = 100 s of travel. First, everything is forced onto a plane, two numbers per station.",
  "msr-plane-k": "The plane",
  "msr-plane-a": "The plane gets every freedom.",
  "msr-plane-b": "Positions, origin times and the speed law all move until the times fit. It stalls at {{ps}} s.",
  "msr-lift-k": "Space",
  "msr-lift-a": "Same start, one number more per station.",
  "msr-lift-b": "Let free in the third dimension, the stations settle at {{ss}} s: {{ratio}} times better than the plane.",
  "msr-arcs-k": "A sphere",
  "msr-arcs-a": "The cloud is hollow: it is a sphere.",
  "msr-arcs-b": "Every station within {{rel}} of one radius. Only now the straight lines are drawn as arcs on it.",
  "msr-speed-k": "The speed",
  "msr-speed-a": "The speed comes from globe distances.",
  "msr-speed-b": "So change it by ±25 %. The size follows, R = {{kmv}} × v₀ km; the shape does not move.",
  "msr-laws-k": "Other laws",
  "msr-laws-a": "Another speed law still gives a sphere.",
  "msr-laws-b": "Curvature shifted, or one constant speed: the radius runs from {{rmin}} to {{rmax}} units and the fit worsens, but the cloud stays round.",
  "msr-map-k": "The check",
  "msr-map-a": "Only now, the real map.",
  "msr-map-b": "Turned to fit best (rotation only), the stations sit {{vs}} rms from their published positions. Red dashes: each station's error, too small to see until we zoom in.",
  "msr-plane": "plane", "msr-space": "space", "msr-best": "best", "msr-rms": "rms of the time residuals", "msr-start": "start",
  "msr-same": "back to the same start", "msr-z": "third coordinate freed",
  "msr-radial": "radial scatter", "msr-v0": "speed at the start of the law", "msr-shape": "shape unchanged",
  "msr-law": "speed law", "msr-const": "constant speed", "msr-shift": "curvature shifted by", "msr-fitted": "the fitted law",
  "msr-ring": "the Earth's size, 6,371 km (reference only)", "msr-err": "error after rotation", "msr-median": "median", "msr-max": "largest",
  "msr-units": "units", "msr-zoom": "zoom", "msr-true": "same scale in every direction", "msr-quakes": "× = the 8 earthquakes that read the most stations",
  "msr-alt": "Animation: stations placed from earthquake P times alone; first as straight-line distances on a plane, which stalls; then from the same start in space, where they settle on a sphere; the lines then drawn as great-circle arcs; the speed of propagation changed, which only changes the size; other speed laws, which keep a sphere; finally the cloud turned onto the real map, with a red dashed arc from each station to its published position",
};

// ---- le repère Terre (la rotation de calage du fichier : un dessin seulement) et les vérifications
const EF = earthFrame(M.space.rot), ET = EF.ET;
const TRUE = Array.from({ length: NS }, (_, j) => EF.toFit(M.lat[j], M.lon[j]));   // vraie direction, dans le repère de l'ajustement
/** Les écarts angulaires (degrés) entre chaque station placée et sa vraie position, après la rotation : recalculés ici. */
const FIN0 = asPts(FIN.st, NS);
const E0 = angErrors(FIN0, TRUE);
export const ERR = E0.e;
export const ERR_STATS = { rms: E0.rms, med: E0.med, max: E0.max };
// le centre de la vue finale : la direction moyenne des vraies stations
const MEAN = norm(Array.from({ length: NS }, (_, j) => vec(M.lat[j], M.lon[j])).reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]));
const LAT0 = Math.asin(MEAN[2]) / D2R * 0.6, LON0 = Math.atan2(MEAN[1], MEAN[0]) / D2R;
// le zoom de la fin (les erreurs, 0,3° en médiane, ne se voient pas à l'échelle du globe) : la station qui a le plus de voisines à 8°
const ZOOM = 7, ZC = (() => { let best = 0, bj = 0; const V = M.lat.map((la, j) => vec(la, M.lon[j])), c8 = Math.cos(8 * D2R);
  V.forEach((p, j) => { const n = V.filter((q) => dot3(p, q) > c8).length; if (n > best) { best = n; bj = j; } }); return bj; })();

const COLS = M.lat.map(latCol);

const frame = (F, f) => frameAt(F, f, NS, NH);
const PLANE0 = frame(PF, 0), PLANE1 = frame(PF, 1), SPACE0 = frame(SF, 0);
const FIN_ST = asPts(FIN.st, NS), FIN_HUB = asPts(FIN.hub, NH), HUB_S = asPts(M.space.hubS, NH);
const PHI0 = 0.5, SPIN = 0.16, E_TOP = 72 * D2R, E_SIDE = 16 * D2R;

/**
 * L'état du dessin à l'instant global t (0..DURATION) : points, séismes pivots, vue, et ce qui est montré.
 * arc : 0 = cordes (ce que l'ajustement emploie), 1 = arcs de grand cercle ; sph : opacité de la sphère ; map : opacité de la carte ;
 * err : avancement des arcs rouges ; bound : demi-largeur du cadre en unités ; o : point du repère au centre de l'écran.
 */
export function stateAt(t) {
  const s = { arc: 0, sph: 0, map: 0, err: 0, lines: 1, k: 1, bound: BOUND, ring: 0, read: {} };
  let key = SCENES[SCENES.length - 1].key;
  for (const sc of SCENES) if (t >= START[sc.key] && t < START[sc.key] + sc.d) { key = sc.key; break; }
  const u = t - START[key], d = SCENES.find((x) => x.key === key).d;
  s.key = key; s.u = u;
  let e = E_TOP, spin = SPIN * t;
  if (key === "naive") {
    s.st = PLANE0.st; s.hub = PLANE0.hub; s.lines = ease((u - 0.6) / 1.6); s.pts = ease(u / 0.8);
    s.read = { plane: M.plane.start, tag: "start" };
  } else if (key === "plane") {
    const f = frame(PF, ease((u - 0.3) / (d - 1.2)));
    s.st = f.st; s.hub = f.hub; s.read = { plane: f.stress };
  } else if (key === "lift") {
    const r = ease(u / 1.0), z = ease((u - 1.1) / 1.3), g = ease((u - 2.6) / (d - 3.3));
    if (u < 1.1) { s.st = mix(PLANE1.st, PLANE0.st, r); s.hub = mix(PLANE1.hub, PLANE0.hub, r); s.read = { planeBest: M.plane.stress, tag: "same" }; }
    else if (u < 2.6) { s.st = mix(PLANE0.st, SPACE0.st, z); s.hub = mix(PLANE0.hub, SPACE0.hub, z); s.read = { planeBest: M.plane.stress, tag: "z" }; }
    else { const f = frame(SF, g); s.st = f.st; s.hub = f.hub; s.read = { planeBest: M.plane.stress, space: f.stress }; }
    e = lerp(E_TOP, E_SIDE, ease((u - 1.0) / 2.0));
    s.oF = ease((u - 2.6) / (d - 3.0));
  } else {
    e = E_SIDE; s.oF = 1;
    if (key === "arcs") {
      s.st = FIN_ST; s.hub = mix(FIN_HUB, HUB_S, ease((u - 0.3) / 1.6)); s.arc = ease((u - 0.6) / 2.2); s.sph = ease((u - 1.2) / 1.6);
      s.read = { planeBest: M.plane.stress, space: M.space.stress, rel: M.space.rel };
    } else if (key === "speed") {
      s.st = FIN_ST; s.hub = HUB_S; s.arc = 1; s.sph = 1; s.ring = ease(u / 0.8);
      s.k = u < 0.6 || u > d - 0.4 ? 1 : 1 + 0.25 * Math.sin((2 * Math.PI * (u - 0.6)) / (d - 1.0));
      s.read = { v: V_NOMINAL * s.k, rel: M.space.rel };
    } else if (key === "laws") {
      s.arc = 1; s.sph = 1; s.ring = 1;
      const seg = d / (LAWS.length + 1), i = Math.min(LAWS.length, Math.floor(u / seg)), f = ease((u - i * seg) / 0.9);
      const node = (n) => (n < 0 || n >= LAWS.length ? { st: FIN_ST, hub: HUB_S, R: M.space.R, stress: M.space.stress, rel: M.space.rel, tag: "fit" }
        : { st: asPts(LAWS[n].st, NS), hub: asPts(LAWS[n].hub, NH), R: LAWS[n].R, stress: LAWS[n].stress, rel: LAWS[n].rel, tag: LAWS[n].tag });
      const A = node(i - 1), B = node(i === LAWS.length ? -1 : i);
      s.st = mix(A.st, B.st, f); s.hub = mix(A.hub, B.hub, f);
      s.bound = lerp(BOUND, BOUND_LAW, Math.min(ease(u / 0.9), ease((d - u) / 0.9)));
      s.read = { law: f > 0.5 ? B : A, R: lerp(A.R, B.R, f) };
    } else {   // map
      s.st = FIN_ST; s.hub = HUB_S; s.arc = 1; s.sph = 1;
      s.slerp = ease((u - 0.2) / 2.6); s.map = ease((u - 1.4) / 2.0); s.lines = 1 - ease((u - 1.0) / 1.2); s.err = ease((u - 3.4) / 1.6);
      s.bound = lerp(BOUND, M.space.R * 1.16, ease((u - 0.2) / 2.6));
      s.spinE = (clamp(u, 2.8, 5.2) - 2.8) * 6;   // degrés de longitude : le globe tourne lentement une fois calé, puis s'arrête pour le zoom
      s.zoom = ease((u - 5.4) / 2.2);   // 0..1 : grossissement 1 → ZOOM, la région la plus dense ramenée au centre
      spin = SPIN * START.map;
      s.read = { err: s.err, zoom: s.zoom };
    }
  }
  s.V = camera(PHI0 + spin, e);
  if (key === "map") {
    s.V = viewTo(s.V, mmul(earthCam(LAT0, LON0 - 25 - s.spinE), EF.E), s.slerp);
  }
  // la feuille du plan (étapes 1-2, puis s'efface quand la troisième coordonnée est libérée)
  if (key === "naive" || key === "plane" || (key === "lift" && u < 2.6)) s.sheet = { z0: PLANE0.st[0][2], fade: key === "lift" ? 1 - ease((u - 1.1) / 1.0) : 1 };
  // le centre de l'écran : le centre de gravité du plan, puis glisse vers le centre de la sphère pendant la descente dans l'espace
  const g = centroid(s.st);
  s.o = s.oF == null ? g : g.map((x) => x * (1 - s.oF));
  if (s.pts == null) s.pts = 1;
  return s;
}

/** Les nombres des textes de la vitrine et du texte de la page. */
function reelVals() {
  const Rs = M.variants.filter((v) => v.tag !== "linear").map((v) => v.R).concat(M.variants.filter((v) => v.tag === "linear").map((v) => v.R));
  return { n: num(M.readings), ps: num(M.plane.stress, 1), ss: num(M.space.stress, 1), ratio: num(M.plane.stress / M.space.stress, 0),
    rel: `${num(M.space.rel * 100, 1)} %`, kmv: num(100 * M.space.R), rmin: num(Math.min(...Rs), 1), rmax: num(Math.max(...Rs), 1), vs: `${num(M.space.vs, 1)}°` };
}

/** Les lignes de lecture de l'étape en cours. */
function readLines(s, T) {
  const r = s.read, sec = (x) => `${num(x, 1)} s`, out = [];
  if (r.plane != null) out.push([`${T("msr-plane")}${r.tag === "start" ? ` (${T("msr-start")})` : ""}: ${sec(r.plane)} ${T("msr-rms")}`, AMBER, true]);
  if (r.planeBest != null) out.push([`${T("msr-plane")} (${T("msr-best")}): ${sec(r.planeBest)}`, AMBER, r.space == null]);
  if (r.tag === "same") out.push([T("msr-same"), REEL_COL.soft, false]);
  if (r.tag === "z") out.push([T("msr-z"), TEAL, false]);
  if (r.space != null) out.push([`${T("msr-space")}: ${sec(r.space)} ${T("msr-rms")}`, TEAL, true]);
  if (r.rel != null && r.v == null) out.push([`${T("msr-radial")}: ${num(r.rel * 100, 1)} %`, TEAL, false]);
  if (r.v != null) {
    out.push([`${T("msr-v0")}: ${num(r.v, 1)} km/s → R = ${num(100 * r.v * M.space.R)} km`, REEL_COL.ink, true]);
    out.push([`${T("msr-shape")} · ${T("msr-space")} ${sec(M.space.stress)} · ${T("msr-radial")} ${num(r.rel * 100, 1)} %`, TEAL, false]);
  }
  if (r.law) {
    const w = r.law, name = w.tag === "fit" ? T("msr-fitted") : w.tag === "linear" ? T("msr-const") : `${T("msr-shift")} ${w.tag.replace("-", "−")}`;
    out.push([`${T("msr-law")}: ${name} · ${sec(w.stress)}`, REEL_COL.ink, true]);
    out.push([`R = ${num(r.R, 1)} ${T("msr-units")} · ${T("msr-radial")} ${num(w.rel * 100, 1)} %`, TEAL, false]);
  }
  if (r.err != null) {
    out.push([`${T("msr-err")}: ${num(ERR_STATS.rms, 1)}° rms`, RED, true]);
    if (r.err > 0) out.push([`${T("msr-median")} ${num(ERR_STATS.med, 1)}° · ${T("msr-max")} ${num(ERR_STATS.max, 1)}°`, REEL_COL.soft, false]);
    if (r.zoom > 0.05) out.push([`${T("msr-zoom")} ×${ZOOM} (${T("msr-true")})`, REEL_COL.soft, false]);
  }
  return out;
}

const LINES = M.hubSt.flatMap((l, hi) => l.map((j) => [NS + hi, j]));
const REEL = makeShapeReel({
  prefix: "msr", still: START.map + 9.5, scenes: SCENES, stateAt, EN, alt: "msr-alt",
  cfg: { key: "seis", R: M.space.R, ET, TRUE, cols: COLS, lines: LINES, zoom: { factor: ZOOM, centre: ZC }, ringLabel: "msr-ring" },
  readLines: (s, T) => { const l = readLines(s, T); if (s.lines > 0.5 && s.key !== "map") l.push([T("msr-quakes"), REEL_COL.faint, false]); return l; },
});

export function mountMesh(root, tv) {
  return REEL.mount(root.querySelector("#seisMesh"), tv, reelVals(), root.querySelector("#seisMeshReads"));
}

/** Les nombres du texte (<span class="cv" data-mesh>), tous venus du fichier calculé. */
export function meshValues() {
  const Rs = M.variants.filter((v) => v.tag !== "linear").map((v) => v.R), W = M.variants.find((v) => v.tag === "linear");
  const rels = M.variants.map((v) => v.rel);
  return {
    quakes: num(M.quakes), stations: num(M.stations), edges: num(M.readings), minQ: num(M.minQuakes),
    planeStress: `${num(M.plane.stress, 1)} s`, spaceStress: `${num(M.space.stress, 1)} s`, ratio: num(M.plane.stress / M.space.stress, 0),
    rel: `${num(M.space.rel * 100, 1)} %`, vs: `${num(M.space.vs, 1)}°`, R: num(M.space.R, 2), v0: `${num(V_NOMINAL, 1)} km/s`,
    kmPerV: num(100 * M.space.R), rMin: num(Math.min(...Rs), 1), rMax: num(Math.max(...Rs), 1),
    relMax: `${num(Math.max(...rels) * 100, 0)} %`, stressMax: `${num(Math.max(...M.variants.map((v) => v.stress)), 0)} s`, linStress: `${num(W.stress, 1)} s`, linR: num(W.R, 1),
    allStations: num(A.stations), allMinQ: num(A.minQuakes), allReadings: num(A.readings), allKept3: num(A.space.kept), allKept2: num(A.plane.kept),
    allSpace: `${num(A.space.stress, 2)} s`, allPlane: `${num(A.plane.stress, 1)} s`, allRel: `${num(A.space.rel * 100, 1)} %`,
    allMed: `${num(A.space.med, 1)}°`, allP90: `${num(A.space.p90, 1)}°`,
    startStress: `${num(M.space.start, 0)} s`, errMed: `${num(ERR_STATS.med, 1)}°`, errMax: `${num(ERR_STATS.max, 1)}°`,
  };
}
