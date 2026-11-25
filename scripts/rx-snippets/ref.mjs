// Valeurs de référence des extraits de code de l'onglet rx, calculées par le code MÊME de
// la page (userlogic.js, grouplogic.js, values.js), et écrites en données Python, C et Go
// pour que check.mjs vérifie que chaque extrait (fxN.py / .c / .go) redonne les mêmes
// nombres. Aucune donnée du propriétaire : l'enregistrement G27 du BRDC public, la ligne
// Raw d'exemple des tests, un ciel synthétique, des villes. Lancé par check.mjs.
import { parseGnssLog, satState, ecef } from "../../src/tabs/rx/userlogic.js";
import { syntheticSky, G27 } from "../../src/tabs/rx/synth.js";
import { encodeCode, groupFit } from "../../src/tabs/rx/grouplogic.js";
import { sagitta, radiiM, radiiN } from "../../src/tabs/rx/values.js";

// noms lisibles des extraits ← noms courts de parseRinexNav
const MAP = { sqrt_a: "sqa", dn: "dn", M0: "m0", ecc: "ecc", omega: "w", cus: "cus", cuc: "cuc", crs: "crs", crc: "crc", cis: "cis", cic: "cic",
  i0: "i0", idot: "idot", Omega0: "om0", Omega_dot: "omd", toe: "toe", toc: "toc", af0: "af0", af1: "af1", af2: "af2", tgd: "tgd" };
const FIELDS = Object.keys(MAP);
const eph = (e) => Object.fromEntries(FIELDS.map((k) => [k, e[MAP[k]]]));

// ① la ligne Raw des tests de userlogic
const head = "#   Raw,utcTimeMillis,TimeNanos,LeapSecond,TimeUncertaintyNanos,FullBiasNanos,BiasNanos,BiasUncertaintyNanos,DriftNanosPerSecond,DriftUncertaintyNanosPerSecond,HardwareClockDiscontinuityCount,Svid,TimeOffsetNanos,State,ReceivedSvTimeNanos,ReceivedSvTimeUncertaintyNanos,Cn0DbHz,PseudorangeRateMetersPerSecond,PseudorangeRateUncertaintyMetersPerSecond,AccumulatedDeltaRangeState,AccumulatedDeltaRangeMeters,AccumulatedDeltaRangeUncertaintyMeters,CarrierFrequencyHz,CarrierCycles,CarrierPhase,CarrierPhaseUncertainty,MultipathIndicator,SnrInDb,ConstellationType,AgcDb,BasebandCn0DbHz,FullInterSignalBiasNanos,FullInterSignalBiasUncertaintyNanos,SatelliteInterSignalBiasNanos,SatelliteInterSignalBiasUncertaintyNanos,CodeType,ChipsetElapsedRealtimeNanos";
const raw = "Raw,114821879,101119150000000,18,0.0,-1474908359259552101,0.9674320220947266,27.05604856600985,-45.56644863375659,11.039387960148584,6,18,0.0,16399,507078338363312,17,31.7,-414.9222717285156,0.0322943739593029,16,0.0,0.0,1575420000,,,,0,0.0,1,-53.6,28.099999999999998,0.0,0.0,,,C,114821879717027";
const ANDROID = { time_nanos: "101119150000000", full_bias_nanos: "-1474908359259552101", bias_nanos: 0.9674320220947266, time_offset_nanos: 0, received_sv_time_nanos: "507078338363312" };
const pr = parseGnssLog(`${head}\n${raw}\n`).epochs[0].obs[0].pr;

// ② ③ G27 à toe + 600 s
const T = G27.toe + 600, st = satState(G27, T);

// ④ le ciel synthétique (sans atmosphère : les extraits non plus)
const sky = syntheticSky();
const sats = sky.ep.obs.map((o) => ({ e: eph(sky.nav.eph[`G${String(o.prn).padStart(2, "0")}`][0]), pr: o.pr }));

// ⑤ le code de l'exemple des tests
const CODE = { name: "Ana", date: "20261002", x: [4201234.6, 168765.4, 4780123.9], q: 1000, rms: 6.34, n: 25, systems: "GE" };
const code = encodeCode({ name: CODE.name, date: "2026-10-02", x: CODE.x, step: CODE.q, rms: CODE.rms, n: CODE.n, systems: CODE.systems.split("") });

// ⑦ huit villes arrondies à 1 km (le test de grouplogic)
const CITIES = [[48.86, 2.35, 35], [40.42, -3.70, 650], [52.52, 13.40, 34], [41.90, 12.50, 20], [59.91, 10.75, 10], [38.72, -9.14, 50], [50.08, 14.43, 200], [37.98, 23.73, 70]];
const P = CITIES.map(([la, lo, h]) => ecef(la, lo, h).map((v) => Math.round(v / 1000) * 1000));
const G = groupFit(P.map((x) => ({ x, step: 1000 })));

export const REF = {
  pr, sat: st.p, clk: st.clk, truth: sky.truth, bias: sky.bias, R: G.R, sigmaR: G.sigmaR, code,
  sag1000: sagitta(6371e3, 1000e3), M0: radiiM(0), N45: radiiN(45),
};
export const DATA = { ANDROID, G27: eph(G27), T, SOW: sky.ep.sow, SATS: sats, CODE, P };

// ---- écriture des données dans chaque langage
const pyVal = (v) => Array.isArray(v) ? `[${v.map(pyVal).join(", ")}]` : typeof v === "object" ? `{${Object.entries(v).map(([k, x]) => `"${k}": ${pyVal(x)}`).join(", ")}}` : typeof v === "string" ? (/^-?\d{12,}$/.test(v) ? v : JSON.stringify(v)) : String(v);
export function pyData() { return Object.entries(DATA).map(([k, v]) => `${k} = ${pyVal(v)}`).join("\n") + "\n"; }

const cEph = (e) => `{${FIELDS.map((k) => e[k]).join(", ")}}`;
export function cData() {
  return [
    `static const long long A_TIME = ${ANDROID.time_nanos}LL, A_FULLBIAS = ${ANDROID.full_bias_nanos}LL, A_SVTIME = ${ANDROID.received_sv_time_nanos}LL;`,
    `static const double A_BIAS = ${ANDROID.bias_nanos}, A_OFFSET = ${ANDROID.time_offset_nanos};`,
    `static const Eph G27 = ${cEph(DATA.G27)};`,
    `static const double T_G27 = ${T}, SOW = ${DATA.SOW};`,
    `static const int NSAT = ${sats.length};`,
    `static const Eph SAT_EPH[] = {${sats.map((s) => cEph(s.e)).join(",\n  ")}};`,
    `static const double SAT_PR[] = {${sats.map((s) => s.pr).join(", ")}};`,
    `static const int NP = ${P.length};`,
    `static const double PTS[][3] = {${P.map((p) => `{${p.join(", ")}}`).join(", ")}};`,
    `static const double CODE_X[3] = {${CODE.x.join(", ")}};`,
  ].join("\n") + "\n";
}
const goEph = (e) => `Eph{${FIELDS.map((k) => `${k}: ${e[k]}`).join(", ")}}`;
export function goData() {
  return [
    `var aTime, aFullBias, aSvTime int64 = ${ANDROID.time_nanos}, ${ANDROID.full_bias_nanos}, ${ANDROID.received_sv_time_nanos}`,
    `var aBias, aOffset = ${ANDROID.bias_nanos}, ${ANDROID.time_offset_nanos}.0`,
    `var g27 = ${goEph(DATA.G27)}`,
    `var tG27, sow = ${T}.0, ${DATA.SOW}.0`,
    `var satEph = []Eph{${sats.map((s) => goEph(s.e)).join(",\n  ")}}`,
    `var satPr = []float64{${sats.map((s) => s.pr).join(", ")}}`,
    `var pts = [][3]float64{${P.map((p) => `{${p.join(", ")}}`).join(", ")}}`,
    `var codeX = [3]float64{${CODE.x.join(", ")}}`,
  ].join("\n") + "\n";
}
