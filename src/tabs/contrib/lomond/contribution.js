// Contribution « Bass Rock vu d'East Lomond Hill » (photo de KenRDKAB, 9 août 2023 ; onglet contrib, 2026-10-14), en un
// module (voir ../adelaide/contribution.js). Données : src/data/presets/contrib-lomond.js (fog build contrib-lomond).
import { FIG } from "../../../core/fig.js";
import { stamp, axesStamp, drawFormulaFigs } from "../../../core/formfigs.js";
import { BLOCKS } from "./prose.js";
import { lomNumbers } from "./logic.js";
import en from "./i18n/en.json" with { type: "json" };
import fr from "./i18n/fr.json" with { type: "json" };


const C = FIG.C;
const pts = (a) => a.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
/* Bass Rock (2026-10-14) : l'œil haut sur la colline, le rocher plus près que l'horizon ; le rayon qui rase la mer à
 * l'horizon passe devant le rocher à la hauteur f·H. Surface et rayon tracés comme ci-dessus (hauteur du rayon au-dessus
 * de la surface e·(1 − x/d₀)², tangente en d₀). */
function figFrac(tr) {
  const f = FIG.make({ w: 380, h: 230, alt: tr("lm-fx-alt", "A cross-section: a camera high on a hill at the left, a rock standing in the sea in the middle, the curved sea beyond it. The ray from the camera that grazes the sea at the horizon, beyond the rock, passes in front of the rock at a height f times the rock's height: from the camera, that part of the rock is below the horizon.") });
  const x0 = 24, L = 330, base = 170, sx = (x) => x0 + x * L, surf = (x) => 60 * x * x, e = 92, d0 = 0.78, d = 0.46, H = 46;
  const sea = []; for (let i = 0; i <= 40; i++) { const x = (1.05 * i) / 40; sea.push([sx(x), base + surf(x)]); }
  f.path(pts(sea) + `L${sx(1.05)} ${base + 70}L${sx(0)} ${base + 70}Z`, { c: C.sea, w: 1.6, fill: "#dcebf2" });
  f.path(`M${sx(0) - 14} ${base + 2}L${sx(0)} ${base - e}L${sx(0.2)} ${base + surf(0.2)}Z`, { c: C.ground, w: 1.4, fill: "#e9e2d2" });
  const hr = (x) => e * (1 - x / d0) ** 2, ray = [];
  for (let i = 0; i <= 40; i++) { const x = (1.0 * i) / 40; ray.push([sx(x), base + surf(x) - hr(x)]); }
  f.path(pts(ray), { c: C.sea, w: 1.8, dash: "0" });
  f.dot(sx(0), base - e, { r: 3, c: C.ink }); f.dot(sx(d0), base + surf(d0), { r: 2.6, c: C.sea });
  const yb = base + surf(d), fH = hr(d);
  f.line(sx(d), yb, sx(d), yb - H, { c: C.ink, w: 5 });
  f.line(sx(d), yb, sx(d), yb - fH, { c: C.flat, w: 5.4 });
  f.note(sx(d) + 7, yb - H + 4, "H", { size: 11, c: C.ink });
  f.note(sx(d) + 7, yb - fH / 2 + 4, "f·H", { size: 11, c: C.flat });
  f.note(sx(0) + 6, base - e - 6, "e", { size: 10.5, c: C.ink });
  f.note(sx(d), yb + 16, "d", { size: 10.5, anchor: "middle", c: C.ink });
  f.note(sx(d0), base + surf(d0) + 16, "d₀", { size: 10, anchor: "middle", c: C.sea });
  f.note(190, 36, tr("lm-fx-t", "the ray that grazes the sea passes the rock at f·H"), { size: 10.5, anchor: "middle", c: C.ink });
  stamp(f, tr, tr("ad-fx-st", "curvatures exaggerated"));
  return f;
}

/* k = 503 P/T² (0,0343 + dT/dz) : une droite, à l'échelle de ses axes (P = 1010 hPa, T = 282 K, l'air de ce matin-là) ;
 * k = 0 au gradient autoconvectif. Les k qu'exige la photo (vals.kG, vals.kF) s'y posent une fois les données chargées. */
function figK(tr, vals = {}) {
  const f = FIG.make({ w: 380, h: 240, alt: tr("lm-fk-alt", "A straight line: the refraction coefficient k against the temperature gradient, in kelvin per 100 m. k is zero at −3.4 K per 100 m, about 0.17 in the standard atmosphere at −0.65, and negative to the left. The globe's k for the photograph sits near the standard atmosphere; the plane's lies far to the left, beyond the autoconvective gradient.") });
  const P = vals.P ?? 1010, T = vals.T ?? 282, kOf = (g) => (503 * P) / (T * T) * (0.0343 + g / 100);
  const gx0 = -20, gx1 = 4, k0 = -1.1, k1 = 0.5, ox = 44, oy = 200, W = 310, Hh = 160;
  const X = (g) => ox + ((g - gx0) / (gx1 - gx0)) * W, Y = (k) => oy - ((k - k0) / (k1 - k0)) * Hh;
  f.axes(ox, Y(k0), W + 10, Hh + 8, { x: "dT/dz, K/100 m", y: "k" });
  for (let g = -20; g <= 4; g += 4) { f.line(X(g), Y(k0), X(g), Y(k0) + 4, { c: C.faint, w: 1 }); f.note(X(g), Y(k0) + 15, String(g).replace("-", "−"), { size: 9.5, anchor: "middle" }); }
  for (const k of [-1, -0.5, 0, 0.5]) { f.line(ox - 4, Y(k), ox, Y(k), { c: C.faint, w: 1 }); f.note(ox - 6, Y(k) + 3, String(k).replace("-", "−"), { size: 9.5, anchor: "end" }); }
  f.dash(ox, Y(0), ox + W, Y(0), { c: C.faint, w: 1 });
  f.line(X(gx0), Y(kOf(gx0)), X(gx1), Y(kOf(gx1)), { c: C.ink, w: 1.8 });
  f.dash(X(-3.43), Y(k0), X(-3.43), Y(k1), { c: C.faint, w: 1 });
  f.note(X(-3.43) - 3, Y(k1) + 10, tr("lm-fk-auto", "autoconvective"), { size: 9.5, anchor: "end" });
  f.dot(X(-0.65), Y(kOf(-0.65)), { r: 3, c: C.ink }); f.note(X(-0.65) - 4, Y(kOf(-0.65)) - 7, tr("lm-fk-std", "standard air"), { size: 9.5, anchor: "end" });
  if (vals.kG != null) {
    const gG = ((vals.kG * T * T) / (503 * P) - 0.0343) * 100, gF = ((vals.kF * T * T) / (503 * P) - 0.0343) * 100;
    f.dot(X(gG), Y(vals.kG), { r: 4, c: C.globe }); f.note(X(gG) + 6, Y(vals.kG) + 14, tr("lm-fk-g", "globe, this photo"), { size: 10, c: C.globe });
    f.dot(X(gF), Y(vals.kF), { r: 4, c: C.flat }); f.note(X(gF) + 7, Y(vals.kF) + 4, tr("lm-fk-f", "plane, this photo"), { size: 10, c: C.flat });
  }
  axesStamp(f, tr, "P = 1010 hPa, T = 282 K");
  return f;
}

function values(lang, D) {
  const S = D.LOM_SITE, PH = D.LOM_PHOTO, A = D.LOM_AIR, n = lomNumbers(S, PH, A, D.LOM_TRACED, D.LOM_SEAAIR, D.LOM_TRACED_AS);
  const nf = (x, d = 1) => (x == null ? "—" : (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));
  const sg = (x, d = 1) => (x == null ? "—" : Math.abs(x) < 0.5 * 10 ** -d ? nf(0, d) : (x < 0 ? "−" : "+") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));
  const g = (x) => sg(x == null ? null : x * 100, 1);                                  // K/m -> K par 100 m
  const rg = (r) => `${g(r.mid)} (${g(r.lo)} … ${g(r.hi)})`;
  const fs = (x) => (x == null ? "—" : x > 1.5 ? `> ${nf(1.5, 1)}` : nf(x, 2));
  const e = S.e, missF = Math.abs(PH.f - A.fGlobe), missE = Math.abs(PH.f - A.fGlobeEra);
  return {
    lmMis: nf(S.given.misfit, 0), lmPos: `${nf(S.cam.lat, 4)}° N, ${nf(-S.cam.lon, 4)}° W`,
    lmPerM: nf(S.parallax.perM, 0), lmPar0: nf(S.parallax.delta0, 1), lmParPx: nf(S.parallax.delta0 / 1000 * PH.pxRad, 0), lmParRms: nf(S.parallax.rms0, 1),
    lmScale: nf(S.parallax.scale, 0), lmScaleH: nf(PH.pxRad, 0), lmCamG: nf(S.cam.ground, 0), lmSide: nf(S.cam.side, 0), lmEyeH: nf(S.cam.h, 0),
    lmParEnd: nf(Math.abs(S.parallax.delta), 2), lmBelow: nf(S.e - S.Hw, 0),
    lmD: nf(S.rock.d / 1000, 1), lmDA: nf(S.abbs.d / 1000, 1), lmH: nf(S.rock.H, 0), lmHg: nf(S.given.rockH, 0), lmHc: nf(S.rock.Hcop, 0),
    lmHp: `${nf(S.rock.Hphoto, 0)} ± ${nf(S.rock.HphotoSd, 0)}`, lmGap: `${D.LOM_TIDE.gap[0]}–${D.LOM_TIDE.gap[1]}`, lmTchk: nf(D.LOM_TIDE.checkCm, 0),
    lmW: sg(S.water, 2), lmE: nf(e, 0), lmF: `${nf(PH.f, 3)} ± ${nf(PH.fSd, 3)}`, lmTilt: nf(Math.abs(Math.atan(PH.horB) * 180 / Math.PI), 2),
    lmBands: String(PH.horPts.length), lmHsd: nf(PH.horSd, 1), lmC: nf(n.c, 2),
    lmFg1: fs(n.fStraight), lmFf1: fs(n.fFlatStraight), lmFg13: fs(n.fStd), lmFf13: fs(n.fFlatStd),
    lmFgD: `${fs(A.fGlobe)}, ${fs(A.fGlobeEra)}`, lmFfD: `${fs(A.fFlat)}, ${fs(A.fFlatEra)}`,
    lmKG: sg(n.kG, 2), lmKF: sg(n.kF, 2), lmGG: n.symG ? `${g(n.needG.mid)} (${g(n.symG.lo)} … ${g(n.symG.hi)})` : rg(n.needG),
    lmGF: n.symF ? `${g(n.needF.mid)} (${g(n.symF.lo)} … ${g(n.symF.hi)})` : rg(n.needF),
    lmGFbest: g(n.symF?.best), lmGGbest: g(n.symG?.best), lmAsBest: sg(D.LOM_TRACED_AS.airSea[0], 0),
    lmDTg: sg(n.needG.mid == null ? null : n.needG.mid * (e - 2), 0), lmDTf: sg(n.needF.mid == null ? null : n.needF.mid * (e - 2), 0),
    lmSaG: `${sg(n.saG.mid, 1)} (${sg(n.saG.lo, 1)} … ${sg(n.saG.hi, 1)})`, lmSaGmid: sg(n.saG.mid, 1),
    lmSaDay: sg(A.airSea, 1), lmSaEra: sg(A.airSeaEra, 1), lmSaRange: `${sg(A.airSeaLo, 1)} … ${sg(A.airSeaHi, 1)}`,
    lmFgSa0: fs((D.LOM_SEAAIR.find((r) => r.dT === 0) || {}).globe),
    lmFfSa: `${fs(Math.min(...D.LOM_SEAAIR.map((r) => r.flat)))}–${fs(Math.max(...D.LOM_SEAAIR.map((r) => r.flat)))}`,
    lmGD: `${g(A.grad)} (${g(A.gradLo)} … ${g(A.gradHi)})`, lmGuG: g(n.gradUniformG), lmGuF: g(n.gradUniformF),
    lmT2: nf(A.t2, 1), lmSST: nf(A.sst, 1), lmDip: nf(A.dipDay * 180 / Math.PI * 60, 1),
    lmMiss: `${nf(Math.min(missF, missE), 2)}–${nf(Math.max(missF, missE), 2)}`,
    lmMissPx: `${nf(Math.min(missF, missE) * (PH.base - PH.summitRow), 0)}–${nf(Math.max(missF, missE) * (PH.base - PH.summitRow), 0)}`,
  };
}

export default {
  key: "lomond",
  // ses textes traduits, enregistrés par le registre seulement si elle est publiée
  i18n: { en, fr },
  h2: "lm-h2", enters: "lom",
  blocks: BLOCKS,
  sources: ["era5", "marine", "hirt", "copernicus", "gazetteer", "ioc", "gfs", "stabbs"],
  ownSources: {
    copernicus: "European Space Agency, <a href=\"https://doi.org/10.5270/ESA-c5d3d65\">Copernicus DEM GLO-30</a> (2022), 30 m digital surface model, open bucket <code>copernicus-dem-30m</code>: © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA. Tiles N55–N56, W002–W004.",
    gazetteer: "Gazetteer for Scotland, <a href=\"https://www.scottish-places.info/features/featurefirst3875.html\">Bass Rock</a>: 107 m (350 ft). Older surveys differ: about 420 ft in the Ordnance Survey Name Book of 1853–54, 313 ft in the Ordnance Gazetteer.",
    ioc: "IOC Sea Level Station Monitoring Facility, <a href=\"https://www.ioc-sealevelmonitoring.org/station.php?code=leit\">Leith (leit)</a>, 15-minute readings of the UK National Tide Gauge Network gauge operated by the National Oceanography Centre, 26 July to 23 August 2023.",
    gfs: "NOAA/NCEP Global Forecast System, temperatures and geopotential heights at 1000, 975, 950 and 925 hPa, read through the <a href=\"https://open-meteo.com/en/docs/historical-forecast-api\">Open-Meteo historical forecast API</a>.",
    stabbs: "St Abb's Head, 55° 54′ 57.9″ N, 2° 08′ 19.0″ W (<a href=\"https://en.wikipedia.org/wiki/St_Abb%27s_Head\">Wikipedia</a>), with its lighthouse on the tip.",
  },
  cards: [
    // où l'horizon coupe le rocher, globe et plan côte à côte, les jauges de gradient
    { id: "lom", figs: ["lmAnim"], fx: ["lmFxFrac"], reads: ["lmReads"], src: ["cop", "leith", "gfs", "mo"] },
  ],
  cardSources: {
    cop: "Copernicus DEM GLO-30, ESA (2022): the camera's place and the relief; Bass Rock 107 m (Gazetteer for Scotland).",
    leith: "IOC Sea Level Station Monitoring Facility, Leith tide gauge (National Oceanography Centre), July–August 2023.",
    gfs: "NOAA/NCEP GFS levels and ERA5 surface through Open-Meteo, 9 August 2023, 04:28 UTC; Open-Meteo marine sea temperature.",
    mo: "T. Foken, \"50 years of the Monin–Obukhov similarity theory\", Boundary-Layer Meteorol. 119 (2006): the air profile above the sea.",
  },
  figs: { lmFxFrac: figFrac, lmFxK: figK },
  // sa ligne et son paragraphe dans la statistique de l'air de l'onglet ref (2026-11-13), chargés à la demande
  air: () => import("./air.js"),
  canaries: ["East Lomond", "Bass Rock", "KenRDKAB", "contrib-lomond", "lmAnim", "LOM_SITE"],
  photos: ["photos/contrib-lomond-"],
  start(container, tv, lang) {
    return Promise.all([import("../../../data/presets/contrib-lomond.js"), import("./anim.js")]).then(([D, { mountLomond }]) => {
      const vals = values(lang, D), nL = lomNumbers(D.LOM_SITE, D.LOM_PHOTO, D.LOM_AIR, D.LOM_TRACED);
      // la figure de k ↔ dT/dz reçoit les k de la photo une fois les données là
      drawFormulaFigs(container, { lmFxK: figK }, tv, { kG: nL.kG, kF: nL.kF, P: D.LOM_SITE.P, T: D.LOM_SITE.Tmid }, "contrib");
      container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
      const cv = container.querySelector("#lmAnim"), op = container.querySelector("#lmOp");
      if (!cv) return null;
      const anim = mountLomond(cv, container.querySelector("#lmReads"), tv, lang, { site: D.LOM_SITE, photo: D.LOM_PHOTO, air: D.LOM_AIR, traced: D.LOM_TRACED, seaAir: D.LOM_SEAAIR, tracedAS: D.LOM_TRACED_AS, fan: D.LOM_FAN, tide: D.LOM_TIDE }, { op: op ? +op.value / 100 : 0.7, prog: container.querySelector("#lmProg") });
      op?.addEventListener("input", () => anim.setOpacity(+op.value / 100));
      return anim;
    });
  },
};
