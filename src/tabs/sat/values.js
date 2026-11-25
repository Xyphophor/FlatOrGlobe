// Les nombres de l'onglet sat, mis en forme pour la page et pour les cartes ({{clé}}, src/data/cards/sat.js).
// Module sans CSS : les cartes sont aussi chargées par les tests sous Node.
import { SAT_DOPPLER as D } from "../../data/presets/sat-doppler.js";
import { keptStations, ellipse, clairaut, dGMppm, dOmppb, turn, keplerStats, maxRate, worked, GM_IERS, OM_IERS, WGS84 } from "./logic.js";

export function satValues(lang = "en") {
  const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const sg = (x, d) => (x > 0 ? "+" : x < 0 ? "−" : "") + nf(Math.abs(x), d);
  const K = keptStations(D), E = ellipse(K), Cl = clairaut(D, E.a), ks = keplerStats(D);
  const rs = K.map((s) => s.r), dc = K.map((s) => s.dcat).sort((a, b) => a - b), T = turn(D.om);
  const hms = `${Math.floor(T / 3600)} h ${Math.floor((T % 3600) / 60)} min ${nf(T % 60, 2)} s`;
  const nSat = D.sats.filter((s) => !s.drop).length, nPar = 3 + 3 * D.stations.length - 1 + 6 * D.sats.length + D.stations.length + D.sats.length - 1;
  const wk = worked(D), Tw = wk.T;
  return {
    vG: nf(wk.v / 1000, 3), TG: `${Math.floor(Tw / 3600)} h ${Math.round((Tw % 3600) / 60)} min`, nG: nf(wk.n * 1e4, 4), aGm: nf(wk.a / 1e3, 0),
    gmBack: nf(wk.gmBack / 1e14, 4), vEq: nf(wk.vEq, 0), vW: nf(wk.vW, 0), latW: nf(wk.latW, 1),
    nSta: String(K.length), nStaAll: String(D.stations.length), nStaKept: String(K.length), nSat: String(nSat), nPar: nf(nPar, 0), n: nf(D.n, 0),
    maxRate: nf(maxRate(D), 0), rms: nf(D.rms, 1), gm: nf(D.gm, 6), dGM: `${sg(dGMppm(D), 1)} ppm`, om: nf(D.om, 6), dOm: `${sg(dOmppb(D), 0)} ppb`, day: hms,
    sgmPpb: nf(D.sgm, 0), somPpb: nf(D.som, 0), omSig: nf(Math.abs(dOmppb(D)) / D.som, 0), dcat: nf(dc[dc.length >> 1], 0),
    rMin: nf(Math.min(...rs), 1), rMax: nf(Math.max(...rs), 1), ellA: nf(E.a, 1), ellInvF: nf(E.invF, 0), ellRms: nf(E.rms, 2), planeRms: nf(D.planeRms, 0),
    muj: nf(D.muj, 4), j2: nf(Cl.J2 * 1e3, 4), q: nf(Cl.q * 1e3, 3), fInv: nf(Cl.invF, 0),
    aR: nf(ks.by.R.a, 0), aG: nf(ks.by.G.a, 0), aE: nf(ks.by.E.a, 0), nKep: String(ks.n), kepSpread: nf(ks.sdPpm, 0), kepSys: nf(ks.sysPpm, 1),
    flatRms: nf(D.flatRms, 0), flatRatio: nf(Math.round(D.flatRms / (D.rms / 1000) / 1000) * 1000, 0), flatQ50: nf(D.flatQ[0], 0), flatQ99: nf(D.flatQ[2], 0), flatTilt: nf(D.flatTilt, 0),
    gmSig: nf(Math.abs(dGMppm(D)) * 1000 / D.sgm, 0),
    dropStaTxt: plural(lang, D.dropSta.length, ["receiver", "receivers"], ["récepteur", "récepteurs"]),
    dropSatTxt: plural(lang, D.dropSat.length, ["satellite", "satellites"], ["satellite", "satellites"]),
    dropStaN: String(D.dropSta.length), dropSta: D.dropSta.join(", "), dropSatN: String(D.dropSat.length), dropSat: D.dropSat.join(", "),
    rejected: nf(D.rejected, 0), rejPct: nf(100 * D.rejected / D.nStart, 1),
  };
}


// « 1 récepteur », « 2 satellites » : le nombre et son nom accordé (anglais, français ; les autres langues prennent l'anglais)
function plural(lang, n, en, fr) { const w = lang.startsWith("fr") ? fr : en; return `${n} ${n === 1 ? w[0] : w[1]}`; }

/** Pour les cartes : clé -> texte (core/cards.js remplace {{clé}}). */
export function satValueLookup(lang) { const v = satValues(lang); return (k) => v[k] ?? k; }
