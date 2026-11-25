// « Ton dip » (2026-09-29, demande du propriétaire : « calcule R avec MON dip, à partir de la
// photo, pas du modèle ») : la dépression de l'horizon marin MESURÉE sur sa photo de Caussols
// (13 juin 2026) par research/measure_dip_caussols.py -> src/data/presets/dip-caussols.js.
// Ici : le rayon qu'en tire la formule de l'onglet (solveRadius, puis × (1 − k)), les nombres
// du texte, la table des variantes, et deux figures sur la photo elle-même (vue d'ensemble,
// loupe sur l'horizon) : le niveau fixé par les sommets proches, l'horizon mesuré, et, pour
// comparer seulement, ce que prédisent le globe (avec et sans réfraction) et un plan.
import { setupCanvas } from "../../core/canvas.js";
import { DIP_CAUS } from "../../data/presets/dip-caussols.js";
import { DIP_ATMOS } from "../../data/presets/dip-atmos.js";
import { ELEV_CAUS } from "../../data/presets/elev.js";
import { solveRadius, dipAngle, DIP_K, DIP_R0 } from "./logic.js";

const D = Math.PI / 180;

/** Rayon (km) tiré d'un dip (minutes d'arc) : h·cos δ/(1 − cos δ), × (1 − k) si k (réfraction standard). */
export function radiusFromDip(dipArcmin, k = 0, h = DIP_CAUS.h) {
  return solveRadius(h, (dipArcmin / 60) * D) * (1 - k) / 1000;
}

/**
 * Indice de l'air sec pour la lumière visible (550 nm) : n − 1 = 79,01·10⁻⁶ · P/T (P en hPa,
 * T en K) -- la réfractivité de l'air standard de Ciddor (1996), 2,778·10⁻⁴ à 15 °C et
 * 1 013,25 hPa, ramenée à P et T. La vapeur d'eau est laissée de côté.
 */
export const nAir = (Tc, P) => 1 + 79.01e-6 * P / (Tc + 273.15);

/**
 * Dip -> rayon avec la VRAIE réfraction du jour : dans une atmosphère en couches sphériques,
 * n·r·cos α se conserve le long du rayon (invariant de Bouguer) ; le rayon qui rase la mer
 * (α = 0, r = R, indice n0) arrive à l'œil (r = R + h, indice ne) sous la dépression δ :
 * n0·R = ne·(R + h)·cos δ, d'où R = ne·h·cos δ/(n0 − ne·cos δ). Seuls comptent l'air à
 * l'œil et l'air au ras de l'eau (Young : « presque uniquement la différence de température
 * entre l'œil et l'horizon apparent »). En km.
 */
export function radiusBouguer(dipArcmin, n0, ne, h = DIP_CAUS.h) {
  const c = Math.cos((dipArcmin / 60) * D);
  return ne * h * c / (n0 - ne * c) / 1000;
}
/** Le dip que prédit le globe (rayon R, m) avec ces deux indices. En minutes d'arc. */
export const dipBouguer = (R, n0, ne, h = DIP_CAUS.h) => Math.acos(n0 * R / (ne * (R + h))) / D * 60;

/** Les trois états de l'air retenus : ERA5 à l'œil et en mer (central), l'air libre à 1 210 m au-dessus de la mer, la mer elle-même. */
export function airCases() {
  const A = DIP_ATMOS;
  return [
    { key: "era5", n0: nAir(A.sea.T, A.sea.P), ne: nAir(A.eye.T, A.eye.P) },
    { key: "free", n0: nAir(A.sea.T, A.sea.P), ne: nAir(A.freeAir.T, A.freeAir.P) },
    { key: "sst", n0: nAir(A.sst, A.sea.P), ne: nAir(A.eye.T, A.eye.P) },
  ];
}

/** Les variantes de la mesure, chacune avec ses rayons : sans réfraction, k standard, air réel (ERA5). fits[0] = la mesure centrale. */
export function ownRows() {
  const [air] = airCases();
  return DIP_CAUS.fits.map((f) => ({ ...f, Rgeo: radiusFromDip(f.dipArcmin), Rk: radiusFromDip(f.dipArcmin, DIP_K), Rair: radiusBouguer(f.dipArcmin, air.n0, air.ne) }));
}

/** Toutes les combinaisons mesure × air : la fourchette honnête du rayon. */
export function ownSpread() {
  const out = [];
  for (const f of DIP_CAUS.fits) for (const a of airCases()) out.push(radiusBouguer(f.dipArcmin, a.n0, a.ne));
  return out;
}

/** Nombres des <span class="cv" data-v> de la section. */
export function ownValues(lang = "en") {
  const n = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const R = ownRows(), c = R[0], dips = R.map((r) => r.dipArcmin), sp = ownSpread();
  const h = DIP_CAUS.h, geo = dipAngle(DIP_R0, h) / D * 60, refr = dipAngle(DIP_R0 / (1 - DIP_K), h) / D * 60;
  const A = DIP_ATMOS, [air, free, sst] = airCases();
  const pred = dipBouguer(DIP_R0, air.n0, air.ne), predFree = dipBouguer(DIP_R0, free.n0, free.ne);
  // k équivalent de l'air du jour : le dip réel = celui d'une Terre de rayon R/(1 − k)
  const kEq = 1 - DIP_R0 / (solveRadius(h, pred / 60 * D));
  return {
    ownDip: `${n(c.dipArcmin, 1)}′`, ownRair: `${n(c.Rair)} km`, ownRk: `${n(c.Rk)} km`, ownRgeo: `${n(c.Rgeo)} km`,
    ownDipLo: `${n(Math.min(...dips), 1)}′`, ownDipHi: `${n(Math.max(...dips), 1)}′`,
    ownRLo: `${n(Math.min(...sp))} km`, ownRHi: `${n(Math.max(...sp))} km`,
    ownGeo: `${n(geo, 1)}′`, ownRefr: `${n(refr, 1)}′`, ownPred: `${n(pred, 1)}′`, ownPredFree: `${n(predFree, 1)}′`, ownKeq: n(kEq, 2),
    ownRfree: `${n(radiusBouguer(c.dipArcmin, free.n0, free.ne))} km`, ownRsst: `${n(radiusBouguer(c.dipArcmin, sst.n0, sst.ne))} km`,
    ownTeye: `${n(A.eye.T, 1)} °C`, ownPeye: `${n(A.eye.P)} hPa`, ownTsea: `${n(A.sea.T, 1)} °C`, ownPsea: `${n(A.sea.P)} hPa`, ownSst: `${n(A.sst, 1)} °C`, ownTfree: `${n(A.freeAir.T, 1)} °C`,
    ownN: n(DIP_CAUS.horizon.mid.n), ownSig: `${n(DIP_CAUS.horizon.mid.sigmaPx, 1)} px`, ownSum: `${n(c.rmsSummitPx, 1)} px`,
    ownPx: `${n(1 / DIP_CAUS.f / D * 60, 2)}′`, ownPct: `${n(2 / c.dipArcmin * 100, 1)} %`,
    ownGap: `${n(c.dipArcmin - pred, 1)}′`, ownGapPx: `${n((c.dipArcmin - pred) / 60 * D * DIP_CAUS.f, 1)} px`,
    ownH: `${n(h)} m`, ownK: n(DIP_K, 2),
  };
}

/** Appareil rectiligne (même formule que le script de mesure) : (az, alt) radians -> (x, y) pixels. */
function cam({ yaw, pitch, roll }) {
  const y = yaw * D, p = pitch * D, r = roll * D, F = DIP_CAUS.f, cx = (DIP_CAUS.w - 1) / 2, cy = (DIP_CAUS.hgt - 1) / 2;
  const f = [Math.cos(p) * Math.sin(y), Math.cos(p) * Math.cos(y), Math.sin(p)];
  const rr = [Math.cos(y), -Math.sin(y), 0];
  const u = [rr[1] * f[2] - rr[2] * f[1], rr[2] * f[0] - rr[0] * f[2], rr[0] * f[1] - rr[1] * f[0]];
  const cr = Math.cos(r), sr = Math.sin(r);
  const r2 = rr.map((v, i) => cr * v + sr * u[i]), u2 = rr.map((v, i) => -sr * v + cr * u[i]);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return (az, alt) => { const v = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)]; const Z = dot(v, f); return [cx + F * dot(v, r2) / Z, cy - F * dot(v, u2) / Z]; };
}

export function fillOwn(container, lang, t) {
  const v = ownValues(lang);
  container.querySelectorAll('span.cv[data-v^="own"]').forEach((s) => { if (v[s.dataset.v] != null) s.textContent = v[s.dataset.v]; });
  const tb = container.querySelector("#dipOwnTb");
  if (!tb) return;
  const n = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  tb.innerHTML = ownRows().map((r, i) => `<tr${i ? "" : ' class="hot"'}><td>${t(`own-v-${r.name.replace(/\s+/g, "-")}`)}</td>` +
    `<td class="num">${n(r.dipArcmin, 1)}′</td><td class="num">${n(r.Rgeo)} km</td><td class="num">${n(r.Rk)} km</td><td class="num">${n(r.Rair)} km</td>` +
    `<td class="num">${n(r.rmsSummitPx, 1)} / ${n(r.rmsHorizonPx, 1)} px</td></tr>`).join("");
}

/** Deux figures sur la photo : ensemble (colonnes 950-3 900) et loupe sur l'horizon. */
export function mountOwn(container, t) {
  const cvs = [container.querySelector("#dipOwnAll"), container.querySelector("#dipOwnZoom")];
  if (!cvs[0]) return null;
  const img = typeof Image !== "undefined" ? new Image() : null;
  let ok = false, prof = null;
  if (img) { img.onload = () => { ok = true; draw(); }; img.src = ELEV_CAUS.photo.src; }
  import("../../data/dem/caussols-view.json").then((p) => { prof = p.default || p; draw(); });
  const c = DIP_CAUS.fits[0], proj = cam(c);
  const geo = dipAngle(DIP_R0, DIP_CAUS.h), [air] = airCases(), refr = dipBouguer(DIP_R0, air.n0, air.ne) / 60 * D;
  const lineAt = (alt) => { const pts = []; for (let a = 60; a <= 130; a += 0.25) pts.push(proj(a * D, alt)); return pts; };
  const LINES = [
    { alt: 0, c: "#b45309", dash: [8, 5], w: 1.6, k: "own-l-level" },
    { alt: -refr, c: "#0f766e", dash: [2, 3], w: 1.2, k: "own-l-refr" },
    { alt: -geo, c: "#0f766e", dash: [6, 3], w: 1.2, k: "own-l-geo" },
    { alt: -(c.dipArcmin / 60) * D, c: "#151a21", dash: null, w: 1.6, k: "own-l-meas" },
  ];
  const draw = () => {
    const views = [{ x0: 950, x1: 3900, y0: 1330, y1: 1700 }, { x0: 3000, x1: 3500, y0: 1400, y1: 1640 }];
    cvs.forEach((cv, vi) => {
      if (!cv) return;
      const { ctx, W, H } = setupCanvas(cv);
      if (!W) return;
      const V = views[vi], s = Math.min(W / (V.x1 - V.x0), H / (V.y1 - V.y0));   // échelle UNIFORME (pas d'étirement)
      const ox = (W - s * (V.x1 - V.x0)) / 2, oy = (H - s * (V.y1 - V.y0)) / 2;
      const X = (x) => ox + (x - V.x0) * s, Y = (y) => oy + (y - V.y0) * s;
      ctx.fillStyle = "#28303a"; ctx.fillRect(0, 0, W, H);
      if (ok) {
        const kx = img.naturalWidth / DIP_CAUS.w, ky = img.naturalHeight / DIP_CAUS.hgt;
        ctx.drawImage(img, V.x0 * kx, V.y0 * ky, (V.x1 - V.x0) * kx, (V.y1 - V.y0) * ky, X(V.x0), Y(V.y0), (V.x1 - V.x0) * s, (V.y1 - V.y0) * s);
      }
      ctx.save(); ctx.beginPath(); ctx.rect(X(V.x0), Y(V.y0), (V.x1 - V.x0) * s, (V.y1 - V.y0) * s); ctx.clip();
      if (prof && vi === 0) {   // le relief LiDAR (profil sans courbure, celui du calage) projeté par l'appareil mesuré
        ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1; ctx.beginPath();
        prof.flat.forEach((a, i) => { const q = proj((prof.az0 + prof.step * i) * D, (a / 60) * D); i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])); });
        ctx.stroke();
        ctx.fillStyle = "#f5b301";
        for (const [x, y] of DIP_CAUS.pts.sky) { ctx.beginPath(); ctx.arc(X(x), Y(y), 1.6, 0, 2 * Math.PI); ctx.fill(); }
      }
      for (const L of LINES) {
        ctx.strokeStyle = L.c === "#151a21" ? "#ffffff" : L.c; ctx.lineWidth = L.w; ctx.setLineDash(L.dash || []);
        ctx.beginPath(); lineAt(L.alt).forEach((q, i) => (i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])))); ctx.stroke();
      }
      ctx.setLineDash([]);
      if (vi === 1) { ctx.fillStyle = "#ffffff"; for (const [x, y] of DIP_CAUS.pts.hor) { if (x >= V.x0 && x <= V.x1) { ctx.beginPath(); ctx.arc(X(x), Y(y), 2, 0, 2 * Math.PI); ctx.fill(); } } }
      ctx.restore();
      // légende
      ctx.font = "11px system-ui, sans-serif"; ctx.textBaseline = "top";
      let ly = 6;
      for (const L of vi === 1 ? LINES : LINES.slice(0, 1).concat(LINES.slice(3))) {
        ctx.fillStyle = "rgba(20,24,30,0.7)"; const txt = t(L.k); const w = ctx.measureText(txt).width + 26;
        ctx.fillRect(6, ly - 2, w, 16);
        ctx.strokeStyle = L.c === "#151a21" ? "#ffffff" : L.c; ctx.setLineDash(L.dash || []); ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(10, ly + 6); ctx.lineTo(28, ly + 6); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#fff"; ctx.fillText(txt, 32, ly); ly += 18;
      }
      if (!ok) { ctx.fillStyle = "#cfd6de"; ctx.textAlign = "center"; ctx.fillText(t("own-nophoto"), W / 2, H - 16); ctx.textAlign = "left"; }
    });
  };
  return { draw };
}
