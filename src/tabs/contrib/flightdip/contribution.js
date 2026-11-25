// Contribution « dips de l'horizon mesurés en avion » (earthlyskeptic, application Theodolite, deux vols, septembre
// 2025 ; onglet contrib, 2026-10-15), en un module (voir ../adelaide/contribution.js) : une étude statistique, le rayon
// tiré de onze lectures, et les deux figures cliquables (figs.js). Données : src/data/presets/contrib-flightdip.js
// (fog build contrib-flightdip : EXIF, traces ADS-B FlightAware, air GFS, relief GLO-90 le long de chaque cap, rayons
// tracés, accélérations, ajustements).
import { FIG } from "../../../core/fig.js";
import { stamp } from "../../../core/formfigs.js";
import { BLOCKS } from "./prose.js";
import { radiusFrom, hEff } from "./logic.js";
import en from "./i18n/en.json" with { type: "json" };
import fr from "./i18n/fr.json" with { type: "json" };

const C = FIG.C;
const pts = (a) => a.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

/* La formule : un avion au-dessus d'un relief, la ligne de visée tangente au relief de l'horizon ; h′ = la hauteur
 * au-dessus de ce relief, δ le dip sous l'horizontale de l'œil. */
function figDip(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fd-fx-alt", "A cross-section: an aircraft high above curved ground with low hills; the line of sight from the aircraft grazes the ground at the horizon, tilted below the horizontal by the dip; the height that counts is the aircraft's height above the ground where the line grazes it.") });
  const x0 = 20, L = 340, base = 190, sx = (x) => x0 + x * L, surf = (x) => 120 * x * x, bump = (x) => 8 * Math.sin(x * 23) ** 2;
  const g = []; for (let k = 0; k <= 60; k++) { const x = (1.05 * k) / 60; g.push([sx(x), base + surf(x) - bump(x)]); }
  f.path(pts(g) + `L${sx(1.05)} ${base + 40}L${sx(0)} ${base + 40}Z`, { c: C.ground, w: 1.4, fill: "#ece6d8" });
  const e = 120, d0 = 0.62, yT = base + surf(d0) - bump(d0);
  f.line(sx(0), base - e, sx(1.0), base - e, { c: C.faint, w: 1, dash: "4 3" });
  f.line(sx(0), base - e, sx(d0) + (sx(d0) - sx(0)) * 0.5, yT + (yT - base + e) * 0.5, { c: C.globe, w: 1.8 });
  f.dot(sx(0), base - e, { r: 3.5, c: C.ink }); f.dot(sx(d0), yT, { r: 3, c: C.sea });
  f.line(sx(d0) + 12, yT, sx(d0) + 12, base - e, { c: C.flat, w: 1.6 });
  f.note(sx(d0) + 16, (yT + base - e) / 2, "h′", { size: 12, c: C.flat });
  f.note(sx(0) + 70, base - e + 14, "δ", { size: 12, c: C.globe });
  f.note(sx(0) + 6, base - e - 8, tr("fd-fx-eye", "aircraft"), { size: 10, c: C.ink });
  f.note(sx(d0), yT + 16, tr("fd-fx-hz", "horizon (terrain)"), { size: 10, anchor: "middle", c: C.sea });
  f.note(sx(1.0), base - e - 6, tr("fd-fx-level", "level"), { size: 9.5, anchor: "end", c: C.faint });
  stamp(f, tr, tr("fd-fx-st", "curvature and heights exaggerated"));
  return f;
}

/* La seconde formule : l'accélération de l'avion incline la pesanteur apparente, donc le « niveau » du téléphone :
 * un avion qui ralentit, vu vers l'avant, fait lire l'horizon plus bas. */
function figTilt(tr) {
  const f = FIG.make({ w: 380, h: 220, alt: tr("fd-fa-alt", "An aircraft slowing down: gravity points straight down, the deceleration adds a forward pull, and the apparent gravity the phone feels leans forward by a/g. The phone's level, square to it, tips up ahead, so the horizon ahead reads deeper than it is.") });
  const ox = 120, oy = 92, L = 100, a = 0.32, len = 210;
  f.path("M30 98 L96 98 L104 92 L96 86 L40 86 Z", { c: C.ink, w: 1.4, fill: "#e5e7eb" });
  f.note(64, 114, tr("fd-fa-plane", "slowing down"), { size: 10, anchor: "middle" });
  f.arrow(104, 76, 56, 76, { c: C.flat, w: 1.6 });
  f.note(80, 70, "a", { size: 11, c: C.flat, anchor: "middle" });
  f.arrow(ox, oy, ox, oy + L, { c: C.faint, w: 1.6 });
  f.note(ox - 6, oy + L, "g", { size: 11, c: C.faint, anchor: "end" });
  f.arrow(ox, oy, ox + L * Math.sin(a), oy + L * Math.cos(a), { c: C.ink, w: 1.8 });
  f.note(ox + L * Math.sin(a) + 6, oy + L * Math.cos(a), tr("fd-fa-app", "apparent gravity"), { size: 10 });
  f.line(ox, oy, ox + len, oy, { c: C.faint, w: 1, dash: "4 3" });
  f.note(ox + len, oy + 14, tr("fd-fx-level", "level"), { size: 9.5, anchor: "end", c: C.faint });
  f.line(ox, oy, ox + len * Math.cos(a), oy - len * Math.sin(a), { c: C.globe, w: 1.6 });
  f.note(ox + len * Math.cos(a), oy - len * Math.sin(a) - 6, tr("fd-fa-phone", "the phone's level"), { size: 10, anchor: "end", c: C.globe });
  f.note(ox + 64, oy - 8, "a/g", { size: 11, c: C.globe });
  f.line(ox, oy, ox + len, oy + len * Math.tan(0.12), { c: C.sea, w: 1.4 });
  f.note(ox + len, oy + len * Math.tan(0.12) + 14, tr("fd-fa-hz", "horizon, read deeper"), { size: 10, anchor: "end", c: C.sea });
  stamp(f, tr, tr("fd-fa-st", "angles exaggerated"));
  return f;
}

/** Les nombres de la prose. */
function values(lang, D) {
  const P = D.FD_POINTS, F = D.FD_FITS, A = D.FD_ALTS;
  const nf = (x, d = 0) => (x == null ? "—" : (x < 0 ? "−" : "") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));
  const sg = (x, d = 2) => (Math.abs(x) < 0.5 * 10 ** -d ? nf(0, d) : (x < 0 ? "−" : "+") + Math.abs(x).toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }));
  const fl = (n) => P.filter((p) => p.flight === n);
  const fit = (f) => `${nf(f.R)} (${nf(f.lo)}–${nf(f.hi)})`;
  const span = (a, d = 0, sep = "–") => `${nf(Math.min(...a), d)}${sep}${nf(Math.max(...a), d)}`;
  const f = (name) => F.find((x) => x.name === name), al = (name) => A.find((x) => x.name === name);
  const fFace = f("screen, no refraction"), fAir = f("screen, air of the day"), fGps = f("screen, no refraction, the phone's GPS heights");
  const fAccOff = f("screen, air of the day, accelerations removed, constant offset"), fOff0 = f("screen, no refraction, constant offset");
  const gAcc = al("globe, R = 6,371 km, air of the day, accelerations removed, constant offset"), pAcc = al("plane, haze edge, air of the day, accelerations removed, constant offset");
  const p32 = P.find((p) => p.ft === 32173), stale = fl(2).map((p) => p.gpsLag / 60);
  const gaps = P.map((p) => p.dip - p.globeDipA).sort((a, b) => a - b);
  const v = {
    fdDlo: nf(Math.min(...P.map((p) => p.dip)), 1), fdDhi: nf(Math.max(...P.map((p) => p.dip)), 1),
    fdLagLo: nf(Math.min(...stale), 1), fdLagHi: nf(Math.max(...stale), 1),
    fd32ft: nf(Math.round(p32.altFt / 25) * 25), fd32h: nf(Math.round(p32.h / 10) * 10),
    fdGpsDiff: span(fl(1).map((p) => Math.abs(p.hGps - p.h))), fdHlo: nf(Math.min(...P.map((p) => p.h))), fdHhi: nf(Math.max(...P.map((p) => p.h))),
    fdZ1: span(fl(1).map((p) => p.zh)), fdZ2: span(fl(2).map((p) => p.zh)),
    fdNt: span(P.map((p) => p.nHz)), fdNe: span(P.map((p) => p.nEye)),
    fdRefr: span(P.map((p) => p.globeDip - p.globeDipA), 2, " " + (lang === "fr" ? "à" : "to") + " "), fdK: span(P.map((p) => p.kEff), 2),
    fdEsc: span(P.map((p) => p.flatEsc), 1),
    fdTiltLo: sg(Math.min(...P.map((p) => p.tilt))), fdTiltHi: sg(Math.max(...P.map((p) => p.tilt))),
    fdGapLo: nf(gaps[0], 1), fdGapHi: nf(gaps[gaps.length - 1], 1), fdGapMed: nf(gaps[(gaps.length - 1) >> 1], 1),
    fdR: fit(fFace), fdRa: fit(fAir), fdRgps: fit(fGps), fdRacc: fit(fAccOff), fdBacc: `${sg(fAccOff.b)} (${sg(fAccOff.bLo)} … ${sg(fAccOff.bHi)})`,
    fdPD: nf(pAcc.param), fdPb: sg(pAcc.b), fdPrms: nf(pAcc.rms, 2), fdGrms: nf(gAcc.rms, 2), fdBratio: nf(pAcc.b / gAcc.b, 0),
  };
  // le rayon que chaque lecture donne seule, telle quelle puis l'erreur de zéro (lumière droite) retirée
  const pair = (a) => `${nf(Math.min(...a))} ${lang === "fr" ? "et" : "and"} ${nf(Math.max(...a))}`;
  v.fdRr = pair(P.map((p) => radiusFrom(hEff(p), p.dip) / 1000));
  v.fdRo = pair(P.map((p) => radiusFrom(hEff(p), p.dip - fOff0.b) / 1000));
  const out = lang === "fr" ? "écartée" : "out";
  F.forEach((x, i) => Object.assign(v, { [`fdT${i}R`]: fit(x) + (x.out.length ? ` (${x.out.length} ${out})` : ""), [`fdT${i}b`]: x.b ? `${sg(x.b)}°` : "—", [`fdT${i}rms`]: `${nf(x.rms, 2)}°` }));
  A.forEach((a, i) => Object.assign(v, { [`fdA${i}p`]: `${a.name.startsWith("plane") ? "D = " : "R = "}${nf(a.param)}`, [`fdA${i}b`]: `${sg(a.b)}°`, [`fdA${i}rms`]: `${nf(a.rms, 2)}°` }));
  return v;
}

export default {
  key: "flightdip",
  i18n: { en, fr },
  h2: "fd-h2", enters: "fd",
  blocks: BLOCKS,
  sources: ["theodolite", "fa-tracks", "gfs-fd", "copernicus90", "bornwolf", "titterton"],
  ownSources: {
    theodolite: "Hunter Research &amp; Technology, <a href=\"https://apps.apple.com/us/app/theodolite/id339393884\">Theodolite</a> (iOS app): the reticle's elevation and azimuth from the phone's motion sensors, overlaid on the camera image with the GPS position and altitude; screenshots by <a href=\"https://x.com/earthlyskeptic\">earthlyskeptic</a>, two flights, 5 and 8 September 2025.",
    "fa-tracks": "FlightAware, ADS-B track logs of <a href=\"https://www.flightaware.com/live/flight/AAL6322/history/20250905/1210Z/KORD/KDSM/tracklog\">AA 6322</a> (Chicago O'Hare to Des Moines, 5 September 2025) and <a href=\"https://www.flightaware.com/live/flight/AAL5255/history/20250908/2100Z/KDSM/KDCA/tracklog\">AA 5255</a> (Des Moines to Washington National, 8 September 2025): time, position, course, ground speed and pressure altitude every 15 to 30 s. The flights were named by the contributor.",
    "gfs-fd": "NOAA/NCEP Global Forecast System, temperature, relative humidity and geopotential height at 21 pressure levels (1000 to 100 hPa), 2 m air and surface pressure, above each aircraft position and each horizon, read through the <a href=\"https://open-meteo.com/en/docs/historical-forecast-api\">Open-Meteo historical forecast API</a>.",
    copernicus90: "European Space Agency, <a href=\"https://doi.org/10.5270/ESA-c5d3d65\">Copernicus DEM GLO-90</a> (2022), 90 m digital surface model, open bucket <code>copernicus-dem-90m</code>: © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA.",
    bornwolf: "M. Born, E. Wolf, <i>Principles of Optics</i>, 7th ed., Cambridge University Press (1999), §3.2: rays in a medium whose index varies with height; in spherical layers n·r·cos θ is constant along a ray (Bouguer, 1729).",
    titterton: "D. H. Titterton, J. L. Weston, <i>Strapdown Inertial Navigation Technology</i>, 2nd ed., IET (2004), ch. 3: an accelerometer measures the specific force, acceleration minus gravity, in a rotating Earth frame with the Coriolis term.",
  },
  cards: [
    // le dip en fonction de la hauteur, les deux modèles, le rayon
    { id: "fd", figs: ["fdPlot"], src: ["theo", "track", "gfs", "glo90"] },
  ],
  cardSources: {
    theo: "earthlyskeptic, eleven Theodolite (iOS) readings of the horizon's dip from airliner windows, September 2025.",
    glo90: "Copernicus DEM GLO-90, ESA (2022): the terrain at the horizon along each heading.",
    track: "FlightAware ADS-B track logs, AA 6322 (5 Sept. 2025) and AA 5255 (8 Sept. 2025).",
    gfs: "NOAA GFS through Open-Meteo: the air above each aircraft and each horizon.",
  },
  figs: { fdFx: figDip, fdFxTilt: figTilt },
  // sa ligne et son paragraphe dans la statistique de l'air de l'onglet ref (2026-11-13), chargés à la demande
  air: () => import("./air.js"),
  canaries: ["earthlyskeptic", "contrib-flightdip", "fdEnv", "FD_POINTS", "Hunter Research", "AAL6322"],
  photos: ["photos/contrib-flightdip-"],
  start(container, tv, lang) {
    return Promise.all([import("../../../data/presets/contrib-flightdip.js"), import("./figs.js")]).then(([D, { mountFlightDip }]) => {
      const vals = values(lang, D);
      container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
      return mountFlightDip(container, tv, lang, D);
    });
  },
};
