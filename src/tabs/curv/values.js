// Nombres du texte de l'onglet curv (epic13), tous calculés depuis logic.js :
// index.js les pose dans les <span class="cv" data-v>, logic.test.js les garde.
import { makeT } from "../../core/i18n.js";
import { LYNCH_PHOTO, DEPTH, TORSO, FT } from "../../data/presets/curv.js";
import { K_STD, R_EARTH, dip, hiddenBoth, kToMatch, sagittaAt, sagitta, makeCamera, pitchForHorizonAt, surfaceDrop, flatEdgeFit, flatEdgeDip } from "./logic.js";
import { fmtAng, fmtPx, fmtPct, fmtLen, num } from "./fmt.js";
import { TRI_POS } from "./tri.js";
import { camera, gopro7Check, dfovFromEq } from "./cameras.js";
import { lensBend } from "./calc.js";
import { lynchFrac } from "./calc.js";

const D2R = Math.PI / 180;

/** Valeurs des <span class="cv" data-v> du texte, toutes calculées. */
export function proseValues(tr = (k, fb) => fb) {
  const refr = tr("refr-s", "refr.");
  const beach = sagittaAt(2, { fovH: 60, W: 4000, k: K_STD });
  const jet = sagittaAt(LYNCH_PHOTO.h, { fovH: 60, W: 4000, k: K_STD });
  const lg = sagittaAt(LYNCH_PHOTO.h, { fovH: LYNCH_PHOTO.fovH }).rad / D2R;
  const lr = sagittaAt(LYNCH_PHOTO.h, { fovH: LYNCH_PHOTO.fovH, k: K_STD }).rad / D2R;
  const tilts = [-20, -10, 0, 10, 20].map((p) => sagitta(makeCamera({ W: 4000, H: 4000 * 2 / 3, fovH: LYNCH_PHOTO.fovH, pitch: p * D2R }), dip(LYNCH_PHOTO.h, K_STD)).px);
  const D = flatEdgeFit(LYNCH_PHOTO.h);
  // figure des distorsions, réglages par défaut : 14 mm, 100°, depuis 2 m, horizon près du haut
  const W = 4000, H = W * 2 / 3, d2 = dip(2, K_STD);
  const c0 = makeCamera({ W, H, fovH: 100, lens: "r14" });
  const r14Top = sagitta(makeCamera({ W, H, fovH: 100, lens: "r14", pitch: pitchForHorizonAt(c0, d2, TRI_POS[0] * H / 2) }), 0);
  const jetC100 = sagittaAt(LYNCH_PHOTO.h, { fovH: 100, W, k: K_STD });
  // calculateur : le pilote à l'iPhone 1×, la GoPro d'un ballon (caractéristiques publiées, cameras.js)
  const ip = camera("ip16p-1x"), gp = camera("gp7-w43"), chk = gopro7Check();
  const pilot = sagittaAt(LYNCH_PHOTO.h, { fovH: ip.fov, W: ip.W, aspect: ip.aspect, lens: ip.lens, k: K_STD });
  const balloon = sagittaAt(30000, { fovH: gp.fov, W: gp.W, aspect: gp.aspect, lens: gp.lens, k: K_STD });
  const bend = lensBend(gp, gp.W);
  // animation « en profondeur » (UC05) : Turning Torso, prises de Mathias Kp ; flèche sur 90°, horizon centré
  const s90 = (h) => fmtPx(sagittaAt(h, { fovH: 90, W: 4000 }).px);
  const F = TORSO.shots.find((q) => q.id === "F"), F2 = TORSO.shots.find((q) => q.id === "F2");
  const ks = TORSO.shots.map((q) => kToMatch(q.h, q.d, q.hid));
  const back = R_EARTH * (1 / Math.cos(F.d / R_EARTH) - 1);               // horizon à 47,9 km : toute la tour revient
  const both = (h) => `${fmtAng(dip(h))} (${fmtAng(dip(h, K_STD))} ${refr})`;
  return {
    drop1: fmtLen(surfaceDrop(1000)), drop10: fmtLen(surfaceDrop(10000)), drop100: fmtLen(surfaceDrop(100000)),
    beachPct: fmtPct(beach.frac), beachPx: fmtPx(beach.px), jetPct: fmtPct(jet.frac),
    dipBeach: both(2), dipJet: both(LYNCH_PHOTO.h), dipExp: both(22066),
    lynchGeo: `${num(lg, 2)}°`, lynchMeas: `${num(LYNCH_PHOTO.sagDeg, 2)}°`, lynchRef: `${num(lr, 2)}°`, lynchDiff: `${num(lr - LYNCH_PHOTO.sagDeg, 2)}°`,
    lynchFrac: fmtPct(lynchFrac()),
    tiltRange: `${num(Math.min(...tilts), 1)}–${num(Math.max(...tilts), 1)} px ${tr("on-4000", "on a 4,000-px frame")}`,
    r14Top: fmtPct(r14Top.frac), jetC100: fmtPct(jetC100.frac),
    ip13diag: `${num(dfovFromEq(13), 1)}°`, ip120diag: `${num(dfovFromEq(120), 1)}°`,
    pilotFov: `${num(ip.fov, 1)}°`, pilotPx: fmtPx(pilot.px), pilotPct: fmtPct(pilot.frac),
    goproK: num(chk.k, 3), gopro169: `${num(chk.d169, 1)}°`, balloonPct: fmtPct(balloon.frac),
    goproBend: `${fmtPx(bend.px)} (${fmtPct(bend.frac)})`,
    tHidF: `${num(F.hid)} m`, tGeoF: `${num(hiddenBoth(F.h, F.d).geo)} m`, tBackF2: `${num(F.hid - F2.hid)} m`,
    kMin: num(Math.min(...ks), 2), kMax: num(Math.max(...ks), 2), dpBack: `${num(back)} m`,
    s90eye: s90(F.h), s90back: s90(back), s90jet: s90(LYNCH_PHOTO.h), s90iss: s90(DEPTH.hMax),
    dip80: fmtAng(dip(80 * FT)), dip400: fmtAng(dip(400 * FT)),
    flatD: `${num(D / 1000)} km`, flatBeach: fmtAng(flatEdgeDip(2, D)), flatExp: fmtAng(flatEdgeDip(22066, D)),
  };
}


// Chiffres des cartes d'export (epic11) : les mêmes que le texte, dans la langue de la carte.
const cardMemo = new Map();
export function cardValueLookup(lang) {
  if (!cardMemo.has(lang)) {
    let t = (k, fb) => fb;
    try { t = ((T) => (k, fb) => { const v = T(k); return v && v !== k ? v : fb; })(makeT(lang, "curv")); } catch { /* hors Vite */ }
    cardMemo.set(lang, proseValues(t));
  }
  const vals = cardMemo.get(lang);
  return (k) => vals[k] ?? "?";
}

/** Lignes du tableau des prises de la Turning Torso (mesuré, globe, plan, k qui fait coïncider). */
export function torsoRows() {
  return TORSO.shots.map((q) => ({ ...q, ...hiddenBoth(q.h, q.d), k: kToMatch(q.h, q.d, q.hid) }));
}
