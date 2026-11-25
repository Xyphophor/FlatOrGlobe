// Onglet "orb" (epic19, 2026-10-04) : l'orbite de la Terre -- aberration et temps de lumière
// (Bradley, Delambre : mesures), taille du Soleil (SDO : validation), Doppler du Soleil (HARPS-N,
// validation, demandé par le propriétaire) et d'une étoile (τ Ceti), parallaxe (Bessel).
import { registerSources } from "../../core/citations.js";
import { renderProse } from "../../core/prose.js";
import { getProseDict, makeT } from "../../core/i18n.js";
import { drawSymbols } from "../../core/symbols.js";
import { PROSE } from "../../data/prose/orb.js";
import { SOURCES } from "../../data/sources/orb.js";
import { orbData } from "./data.js";
import { gnomon, gmFromOrbit, EARTH_SATS, MOON_MASS_RATIO } from "./logic.js";
import { drawFormulaFigs } from "./formfigs.js";
import { mountAberration, mountSunSize, mountDopDay, mountStarYear, mountParallax, mountKepler, mountFall, fallSpeed } from "./anims.js";
import { mountTunnel } from "./tunnel.js";
import { mountCannon, drawCannonFig, fillCannonTable } from "./cannon.js";
import { GM as GM_CAN, vCirc, vMiss, period } from "./cannon-logic.js";
import { mountRadar } from "./radar.js";
import { mountPulsar } from "./pulsar.js";
import { mountTransit } from "./transit.js";
import { rows as trRows, fit as trFit, fits as trFits, slopeFor as trSlopeFor, AU_IAU as TR_AU, ESO_2004 } from "./transit-logic.js";
import { pulsars as psrRows, distinct as psrDistinct, summary as psrSummary, shiftFor1000km } from "./pulsar-logic.js";
import { echoes as rdEchoes, stats as rdStats, teams as rdTeams, shortest as rdShortest, auBackOfEnvelope, flatEcho, echoDistance, AU_IAU } from "./radar-logic.js";
import "./style.css";

const KEY = "orb";

export function orbValues(lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const D = orbData();
  const gmSun = gmFromOrbit(149.598e6, 365.256), gmGps = gmFromOrbit(EARTH_SATS[1][1] * 1e6, EARTH_SATS[1][2]);
  const gmMoon = gmFromOrbit(EARTH_SATS[0][1] * 1e6, EARTH_SATS[0][2]) / (1 + MOON_MASS_RATIO);
  const sci = (x) => { const e = Math.floor(Math.log10(x)); return `${nf(x / 10 ** e, 3)} × 10${String(e).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]).join("")}`; };
  return { vRatio: nf(((1 + D.sdo.e) / (1 - D.sdo.e) - 1) * 100, 1), v1: nf(Math.sqrt(gmGps / 6371e3) / 1000, 2), gmSun: sci(gmSun),
    gmRatio: nf(Math.round(gmSun / gmGps / 1000) * 1000, 0), gmMoon: sci(gmMoon), gmGps: sci(gmGps), tSkim: nf(2 * Math.PI * 6371e3 / fallSpeed() / 60, 0), kappa: nf(D.bradley.kappa, 1), auB: nf(D.bradley.a / 1e6, 1), rmin: nf(D.sdo.min, 1), rmax: nf(D.sdo.max, 1), e: nf(D.sdo.e, 4),
    amp: nf(D.days.map((d) => d.amp).sort((a, b) => b - a)[0], 0), K: nf(D.year.K, 0), Hflat: nf(D.Hflat, 0), rmsFlat: nf(D.rmsFlat, 1), rmsGlobe: nf(D.rmsGlobe, 2),
    ...radarValues(nf), ...pulsarValues(nf), ...transitValues(nf),
    nStar: String(D.star.n), Kstar: nf(D.star.K / 1000, 2), beta: nf(Math.abs(D.star.beta), 1), vStar: nf(D.star.v, 2), aStar: nf(D.star.a / 1e6, 1), parAU: nf(D.parAU, 0) };
}

/** L'écho radar de Vénus (2026-11-18) : les nombres de la prose. */
function radarValues(nf) {
  const S = rdStats(), E = rdEchoes(), m = rdShortest(), b = auBackOfEnvelope(m.tau), nw = E.map((e) => e.newcomb);
  return { rdDmin: nf(echoDistance(m.tau) / 1e6, 2), rdTauMin: nf(m.tau, 4), rdBack: nf(b.au / 1e6, 1), rdBackPct: nf((b.au / AU_IAU - 1) * 100, 1),
    rdMed: nf(S.ours[2], 0), rdMean: nf(S.ours[0], 0), rdSig: nf(S.ours[1], 0), rdRms: nf(S.ours[3], 0), rdDiff: nf(Math.abs(S.ours[2] - AU_IAU), 0),
    rdNewSpan: nf(Math.round((Math.max(...nw) - Math.min(...nw)) / 100) * 100, 0), rdFlat: nf(flatEcho(5000), 3),
    rdTeamsPct: nf(Math.ceil(Math.max(...rdTeams().map((t) => Math.abs(t.au / AU_IAU - 1))) * 1e5) / 1e3, 3),
    rdPhase: nf(Math.max(...E.map((e) => e.phase)), 0), rdSta: nf(Math.round(Math.max(...E.map((e) => Math.abs(e.station))) / 100) * 100, 0) };
}
/** Le passage de Vénus de 1769 (2026-11-18) : les nombres de la prose. */
function transitValues(nf) {
  const R = trRows("1769"), F = trFit("1769"), U = R.filter((r) => r.used), FS = trFits(), M = (x) => nf(x / 1e6, 2);
  return { trN: nf(R.length, 0), trN69: nf(R.length, 0), trN61: nf(trRows("1761").length, 0), trN12: nf(trRows("2012").length, 0), trN04: nf(ESO_2004.n, 0),
    trStations: nf(new Set(R.map((r) => r.station)).size, 0), trA: M(F.a), trSA: nf(F.sa / 1e6, 1), trPar: nf(F.parallax, 3),
    trA61: M(FS["1761"].a), trSA61: nf(FS["1761"].sa / 1e6, 1), trA12: M(FS["2012"].a), trSA12: nf(FS["2012"].sa / 1e6, 1), trPct12: nf((FS["2012"].a / TR_AU - 1) * 100, 0),
    trAall: M(FS.all.a), trSAall: nf(FS.all.sa / 1e6, 1),
    trPct: nf(Math.abs(F.a / TR_AU - 1) * 100, 2), trPmax: nf(Math.max(...U.map((r) => Math.abs(r.P))) / 60, 0), trRms: nf(F.rms, 0),
    trG: nf(R.filter((r) => r.why === "phase G").length, 0), trClip: nf(R.filter((r) => !r.used && r.why !== "phase G").length, 0),
    trSlope5000: nf(Math.round(trSlopeFor(5000) / 1000) * 1000, 0), trRe: nf(Math.round(F.a / F.aEarth / 10) * 10, 0) };
}
/** Les pulsars (2026-11-18) : les nombres de la prose. */
function pulsarValues(nf) {
  const P = psrRows(), S = psrSummary(), med = (v) => { const a = v.slice().sort((x, y) => x - y), n = a.length; return n % 2 ? a[n >> 1] : (a[n / 2 - 1] + a[n / 2]) / 2; };
  const others = P, e1730 = P.find((p) => p.name === "J1730-2304" && p.array === "EPTA"), n1730 = P.find((p) => p.name === "J1730-2304" && p.array === "NANOGrav"), j0610 = P.find((p) => p.name === "J0610-2100");
  return { psN: String(psrDistinct().length), psModels: String(P.length), psDb1730n: nf(Math.abs(n1730?.db ?? 0), 0), ps0610: nf(Math.abs((j0610?.au ?? 0) - S.de), 0), ps0610s: nf(j0610?.sau ?? 0, 0), psToa: nf(P.reduce((a, p) => a + p.ntoa, 0), 0), psYears: nf(Math.max(...P.map((p) => p.years)), 0), psMaxDelay: nf(149597870.7 / 299792.458, 1),
    psTypDb: nf(med(others.map((p) => Math.abs(p.db))), 1), psShift: nf(Math.min(...P.filter((p) => Math.abs(p.bv) > 5).map((p) => Math.abs(shiftFor1000km(p.bv)))) / 1000, 1),
    psMed: nf(S.median, 1), psMin: nf(S.min, 1), psMax: nf(S.max, 1), psDiff: nf(Math.abs(S.median - S.de), 1), psDb1730: nf(Math.abs(e1730?.db ?? 0), 0) };
}
/** Les deux tableaux du pli : les 25 échos, les cinq radars. */
function fillRadarTables(container, tr, nf) {
  const t1 = container.querySelector("#orbRadarTable"), t2 = container.querySelector("#orbRadarTeams");
  if (t1) t1.innerHTML = `<caption>${tr("rd-tab-cap", "Millstone, 1961: flight times and the astronomical unit (km)")}</caption><thead><tr><th>${tr("rd-th-date", "Date, UT")}</th><th>${tr("rd-th-tau", "flight time (s)")}</th><th>${tr("rd-th-newc", "Newcomb, 1962")}</th><th>${tr("rd-th-ours", "DE440, ours")}</th><th>±</th></tr></thead><tbody>` +
    rdEchoes().map((e) => `<tr><td>${e.date} ${e.ut.slice(0, 5)}</td><td>${nf(e.tau, 4)}</td><td>${nf(e.newcomb, 0)}</td><td class="hot">${nf(e.ours, 0)}</td><td>${nf(e.err, 0)}</td></tr>`).join("") + "</tbody>";
  if (t2) t2.innerHTML = `<caption>${tr("rd-teams-cap", "The 1961 radar determinations (Table III of the 1962 article)")}</caption><thead><tr><th>${tr("rd-th-fac", "Radar")}</th><th>MHz</th><th>${tr("rd-th-au", "astronomical unit (km)")}</th></tr></thead><tbody>` +
    rdTeams().map((t) => `<tr><td>${t.facility}</td><td>${t.mhz ?? "–"}</td><td>${nf(t.au, 0)}${t.err != null ? ` ± ${nf(t.err, 0)}` : ""}</td></tr>`).join("") + "</tbody>";
}

export default {
  key: KEY,
  label: "Orbit",

  mount(container) {
    const lang = document.documentElement.lang || "en";
    const t = makeT(lang, KEY), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
    const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    registerSources(KEY, SOURCES);
    container.innerHTML = renderProse(KEY, PROSE, { dict: getProseDict(lang, KEY) });
    const vals = orbValues(lang), D = orbData();
    container.querySelectorAll("span.cv[data-v]").forEach((s) => { const v = vals[s.dataset.v]; if (v != null) s.textContent = v; });
    const rd = container.querySelector("#orb-readDop");
    if (rd) rd.innerHTML = `<span>${tr("orb-read-days", "{n} days").replace("{n}", D.days.length)}</span>` +
      `<span class="g">${tr("orb-read-R", "rotation → R = {v} km (quartiles {a}–{b})").replace("{v}", nf(D.Rq.med, 0)).replace("{a}", nf(D.Rq.q1, 0)).replace("{b}", nf(D.Rq.q3, 0))}</span>` +
      `<span class="g">${tr("orb-read-au", "year → a = {v} million km").replace("{v}", nf(D.au / 1e6, 1))}</span>` +
      `<span class="f">${tr("orb-read-flat", "best lamp: {v} m/s off").replace("{v}", nf(D.rmsFlat, 1))}</span>`;
    const q = (id) => container.querySelector("#" + id);
    const upd = () => {
      const out = q("orbGnoOut"), v = q("orbGnoV"); if (!out) return;
      const L = +q("orbGnoL").value, a = +q("orbGnoS").value, b = +q("orbGnoW").value;
      if (!(L > 0 && a > 0 && b > a)) { out.textContent = ""; v.textContent = ""; return; }
      const g = gnomon(L, a, b);
      out.innerHTML = tr("orb-gno-out", "Noon altitudes {a}° and {b}° · tilt <b>ε = {e}°</b>").replace("{a}", nf(g.hj, 2)).replace("{b}", nf(g.hd, 2)).replace("{e}", nf(g.eps, 2));
      v.innerHTML = tr("orb-gno-v", "latitude φ = {p}° (accepted tilt: 23.44°)").replace("{p}", nf(g.lat, 2));
    };
    for (const id of ["orbGnoL", "orbGnoS", "orbGnoW"]) q(id)?.addEventListener("input", upd);
    upd();
    drawFormulaFigs(container, tr, vals);
    fillRadarTables(container, tr, nf);
    // le canon à 400 km (2026-11-11) : schéma, tableau et valeurs de sa glose
    drawCannonFig(container, tr); fillCannonTable(container, tr, lang);
    { const nfc = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
      const cv = { gmCan: `${nfc(GM_CAN / 1e14, 3)} × 10¹⁴`, vMiss: nfc(vMiss()), vCan: nfc(vCirc()), vCanKmh: nfc(vCirc() * 3.6 / 100) + "00", tCan: nfc(period() / 60, 1) };
      container.querySelectorAll("span.cv[data-v]").forEach((e) => { if (cv[e.dataset.v] != null) e.textContent = cv[e.dataset.v]; }); }
    drawSymbols(KEY);
    // animations : détecter le mouvement (2026-10-04)
    this._anims = [];
    { const cv = container.querySelector("#orbAnimAb"); if (cv) this._anims.push(mountAberration(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimTransit"); if (cv) this._anims.push(mountTransit(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimRadar"); if (cv) this._anims.push(mountRadar(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimPsr"); if (cv) this._anims.push(mountPulsar(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimSun"); if (cv) this._anims.push(mountSunSize(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimDop"); if (cv) this._anims.push(mountDopDay(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimStar"); if (cv) this._anims.push(mountStarYear(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimPar"); if (cv) this._anims.push(mountParallax(cv, tr, lang)); }
    // Kepler et Newton (2026-10-16)
    { const cv = container.querySelector("#orbAnimKep"); if (cv) this._anims.push(mountKepler(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimFall"); if (cv) this._anims.push(mountFall(cv, tr, lang)); }
    { const cv = container.querySelector("#orbAnimCannon"); if (cv) this._anims.push(mountCannon(cv, tr, lang)); }
    // le tunnel à travers la Terre, en vitrine (2026-10-25)
    { const cv = container.querySelector("#orbReelTunnel"); if (cv) this._anims.push(mountTunnel(cv, tr, lang)); }
  },
  render() { for (const a of this._anims || []) a.start(); },
  teardown() { for (const a of this._anims || []) a.stop(); },
};
