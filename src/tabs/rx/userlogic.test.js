import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRinexNav, parseGnssLog, satState, solveEpoch, solveLog, gpsTime, gpsDate, ecef, geodetic } from "./userlogic.js";

// un vrai enregistrement GPS (BRDC du 2 octobre 2026, BKG), RINEX 3.05
const NAV = `     3.05           N: GNSS NAV DATA    M: MIXED            RINEX VERSION / TYPE
                                                            END OF HEADER
G27 2026 10 02 02 00 00 3.641471266747e-07 0.000000000000e+00 0.000000000000e+00
     9.000000000000e+00 1.221562500000e+02 4.809128890950e-09 1.690141931253e+00
     6.202608346939e-06 1.448556734249e-02 8.825212717056e-06 5.153680339813e+03
     4.392000000000e+05-4.172325134277e-07-1.764856242855e+00-6.705522537231e-08
     9.497023637612e-01 2.044687500000e+02 9.050624367633e-01-8.194269895661e-09
    -1.185763677531e-10 1.000000000000e+00 2.438000000000e+03 0.000000000000e+00
     2.000000000000e+00 0.000000000000e+00 2.328306436539e-09 9.000000000000e+00
     9.999000000000e+08
`;

test("RINEX 3 nav: one healthy GPS record, TGD read from the right field", () => {
  const n = parseRinexNav(NAV), e = n.eph.G27[0];
  assert.equal(n.n, 1);
  assert.equal(e.toe, 439200);
  assert.equal(e.toc, gpsTime(2026, 10, 2, 2, 0, 0).sow);
  assert.equal(e.tgd, 2.328306436539e-9);
  assert.ok(Math.abs(e.sqa ** 2 - 26560e3) < 200e3);
  const r = Math.hypot(...satState(e, e.toe).p);
  assert.ok(r > 26.0e6 && r < 27.0e6, `orbit radius ${r}`);
});

test("GnssLogger Raw line: pseudorange from the clock fields (64-bit FullBiasNanos)", () => {
  const head = "#   Raw,utcTimeMillis,TimeNanos,LeapSecond,TimeUncertaintyNanos,FullBiasNanos,BiasNanos,BiasUncertaintyNanos,DriftNanosPerSecond,DriftUncertaintyNanosPerSecond,HardwareClockDiscontinuityCount,Svid,TimeOffsetNanos,State,ReceivedSvTimeNanos,ReceivedSvTimeUncertaintyNanos,Cn0DbHz,PseudorangeRateMetersPerSecond,PseudorangeRateUncertaintyMetersPerSecond,AccumulatedDeltaRangeState,AccumulatedDeltaRangeMeters,AccumulatedDeltaRangeUncertaintyMeters,CarrierFrequencyHz,CarrierCycles,CarrierPhase,CarrierPhaseUncertainty,MultipathIndicator,SnrInDb,ConstellationType,AgcDb,BasebandCn0DbHz,FullInterSignalBiasNanos,FullInterSignalBiasUncertaintyNanos,SatelliteInterSignalBiasNanos,SatelliteInterSignalBiasUncertaintyNanos,CodeType,ChipsetElapsedRealtimeNanos";
  const raw = "Raw,114821879,101119150000000,18,0.0,-1474908359259552101,0.9674320220947266,27.05604856600985,-45.56644863375659,11.039387960148584,6,18,0.0,16399,507078338363312,17,31.7,-414.9222717285156,0.0322943739593029,16,0.0,0.0,1575420000,,,,0,0.0,1,-53.6,28.099999999999998,0.0,0.0,,,C,114821879717027";
  const L = parseGnssLog(`# Version: x, Manufacturer: Acme, Model: P1, GNSS HW Year: 2016\n${head}\n${raw}\n`);
  assert.equal(L.device, "Acme P1");
  assert.equal(L.epochs.length, 1);
  const o = L.epochs[0].obs[0];
  assert.equal(o.sys, "G"); assert.equal(o.prn, 18);
  assert.ok(o.pr > 2.0e7 && o.pr < 2.6e7, `pr ${o.pr}`);
  assert.equal(gpsDate(L.epochs[0].week, L.epochs[0].sow).iso, "2026-10-02");
});

test("synthetic sky: a receiver is found again from the origin, a few metres off (troposphere not simulated)", async () => {
  const { syntheticSky, G27 } = await import("./synth.js");
  assert.deepEqual(parseRinexNav(NAV).eph.G27[0], G27);   // synth.js recopie bien le vrai G27
  const { nav, ep, truth } = syntheticSky();
  assert.ok(ep.obs.length >= 5, `${ep.obs.length} satellites in view`);
  const trace = [], s = solveEpoch(nav, ep, trace);
  assert.ok(s);
  const err = Math.hypot(s.x[0] - truth[0], s.x[1] - truth[1], s.x[2] - truth[2]);
  assert.ok(err < 40, `error ${err} m`);
  assert.equal(Math.hypot(...trace[0].x) > 0, true);
  const L = solveLog(nav, { epochs: [ep], fixes: [{ lat: 45.2, lon: 5.7, h: 300, src: "GPS" }, { lat: 45.3, lon: 5.7, h: 300, src: "NLP" }] });
  assert.ok(L.fixGap < 40);
  assert.ok(Math.abs(geodetic(L.x).lat - 45.2) < 0.001);
});
test("Klobuchar: 5 ns at night at the zenith, more by day, more when the satellite is low", async () => {
  const { klobuchar } = await import("./userlogic.js");
  const iono = { a: [3.2596e-8, 1.4901e-8, -1.7881e-7, -5.9605e-8], b: [137220, 16384, -327680, 327680] };  // en-tête du BRDC IGS du 10 avril 2025
  const night = klobuchar(iono, 45, 0, 0, 90, 3 * 3600), day = klobuchar(iono, 45, 0, 0, 90, 14 * 3600), low = klobuchar(iono, 45, 0, 0, 15, 14 * 3600);
  assert.ok(Math.abs(night - 5e-9 * 299792458) < 0.05, `night ${night}`);  // le plancher du modèle, F = 1 au zénith
  assert.ok(day > 3 && day < 30, `day ${day}`);
  assert.ok(low > 1.5 * day, `low ${low}`);
});
