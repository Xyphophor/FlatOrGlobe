// La page ne se croit pas elle-même : elle recalcule depuis les éléments
// besséliens PUBLIÉS les ~100 points de la ligne centrale PUBLIÉE (NASA,
// Espenak), et doit tomber dessus.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ECL_2027, ECL_PATHS, SAROS136, LUNAR_MONTHS } from "../../data/presets/ecl.js";
import { centralPoint, hhmm } from "./logic.js";

test("the published central line of 2 August 2027 is reproduced from the Besselian elements", () => {
  let worst = 0, n = 0;
  for (const row of ECL_PATHS["2027"]) {
    if (row.t === "Limits") continue;
    const c = centralPoint(ECL_2027, hhmm(row.t));
    assert.ok(c, `${row.t}: shadow axis on the Earth`);
    const dLat = Math.abs(c.lat - row.c[0]), dLon = Math.abs(((c.lon - row.c[1] + 540) % 360) - 180);
    worst = Math.max(worst, dLat, dLon * Math.cos(row.c[0] * Math.PI / 180)); n++;
  }
  assert.ok(n > 90, `${n} points`);
  assert.ok(worst < 0.003, `worst ${worst}°`);   // la table est arrondie au dixième de minute d'arc
});

test("saros arithmetic: 223 synodic ≈ 242 draconic ≈ 239 anomalistic months", () => {
  const { synodic, draconic, anomalistic } = LUNAR_MONTHS;
  assert.ok(Math.abs(223 * synodic - 242 * draconic) * 24 < 1.0);      // < 1 h
  assert.ok(Math.abs(223 * synodic - 239 * anomalistic) * 24 < 6);     // quelques heures
  assert.ok(Math.abs((223 * synodic) % 1 - 0.3223) < 0.001);           // le tiers de jour : 7 h 43 min
});

test("saros 136: each member's greatest eclipse lands ~110° further west", () => {
  const byRel = Object.fromEntries(SAROS136.map((r) => [r.rel, r]));
  for (const [a, b] of [[1, 2], [2, 3]]) {
    let d = byRel[b].lon - byRel[a].lon; d = ((d + 540) % 360) - 180;
    assert.ok(d < -100 && d > -125, `${byRel[a].date} → ${byRel[b].date}: ${d}°`);
  }
  assert.equal(byRel[2].date, "2027 Aug 02");
});

import { syzygies, jdOf, dateOf } from "./logic.js";
test("mean-element model finds the two solar-eclipse seasons of 2027: 6 Feb and 2 Aug", () => {
  const ss = syzygies(jdOf(2027, 1, 1), jdOf(2028, 1, 1));
  const solar = ss.filter((s) => s.kind === "new" && s.eclipse).map((s) => { const d = dateOf(s.jd); return `${d.m}-${d.d}`; });
  assert.deepEqual(solar, ["2-6", "8-2"]);
  // lunaires : 20/21 févr., 18 juil., 17 août -- plus UN quasi-accident, le 22 janvier
  // (|sin F| = 0,34 < 0,36) que la NASA ne compte pas : limite du modèle moyen, dite sur la figure
  const lunar = ss.filter((s) => s.kind === "full" && s.eclipse).map((s) => dateOf(s.jd).m);
  assert.deepEqual(lunar, [1, 2, 7, 8]);
});

import { localCircumstances } from "./logic.js";
test("local circumstances on the published centre line: time, duration, Sun altitude and azimuth", () => {
  let wT = 0, wD = 0, wAlt = 0, wAz = 0, n = 0;
  for (const row of ECL_PATHS["2027"]) {
    if (row.t === "Limits" || row.alt < 5) continue;
    const lc = localCircumstances(ECL_2027, row.c[0], row.c[1]);
    assert.equal(lc.central, "total", row.t);
    wT = Math.max(wT, Math.abs(lc.max - hhmm(row.t)) * 3600);
    wD = Math.max(wD, Math.abs(lc.duration - row.dur));
    wAlt = Math.max(wAlt, Math.abs(lc.alt - row.alt));
    if (row.az != null && row.alt < 85) wAz = Math.max(wAz, Math.abs(((lc.az - row.az + 540) % 360) - 180));
    n++;
  }
  assert.ok(n > 90);
  // la table donne l'heure à la minute paire, la durée au dixième de seconde,
  // hauteur et azimut au degré : c'est la précision contre laquelle on juge
  assert.ok(wT < 15, `max time off by ${wT.toFixed(1)} s`);
  assert.ok(wD < 1.0, `duration off by ${wD.toFixed(2)} s`);
  assert.ok(wAlt < 1.0, `altitude off by ${wAlt.toFixed(2)}°`);
  assert.ok(wAz < 1.5, `azimuth off by ${wAz.toFixed(2)}°`);
});

import { flatFit, flatShadow, aeLL, aeXY, subPoints2027 } from "./logic.js";
test("flat model, steel-manned: best-fit shadow still misses the published path by thousands of km, and drifts the wrong way", () => {
  const F = flatFit(ECL_PATHS["2027"]);
  assert.ok(F.rms > 2000, `rms ${F.rms.toFixed(0)} km`);
  const lon0 = aeLL(...flatShadow(F.pts[0].g, F.f))[1], lon1 = aeLL(...flatShadow(F.pts.at(-1).g, F.f))[1];
  assert.ok(lon1 < lon0, "the flat shadow drifts WEST");
  assert.ok(F.pts.at(-1).r.c[1] > F.pts[0].r.c[1] + 100, "the published path runs EAST over 100°");
  // En moyenne le long de la bande la lampe plate, Hs ajusté, ne fait « que »
  // ~6° d'erreur ; l'échec est aux bouts : la bande publiée commence au LEVER
  // et finit au COUCHER (Soleil à 0°), la lampe plate y est haute.
  assert.ok(F.altRms > 3 && F.altRms < 10, `Sun altitude rms ${F.altRms.toFixed(1)}° (honest mid-size number)`);
  const ends = ECL_PATHS["2027"].filter((r) => r.t === "Limits");
  assert.equal(ends.length, 2);
  for (const r of ends) {
    assert.equal(r.alt, 0);
    const t = r === ends[0] ? F.pts[0].t - 1 / 30 : F.pts.at(-1).t + 1 / 30;      // ~2 min avant/après le premier/dernier point
    const g = subPoints2027(t), c = aeXY(r.c[0], r.c[1]);
    const alt = Math.atan2(F.Hs, Math.hypot(c[0] - g.s[0], c[1] - g.s[1])) * 180 / Math.PI;
    assert.ok(alt > 15, `flat lamp at ${alt.toFixed(1)}° where the published Sun is rising or setting`);
  }
});

test("the verdict rule quotes what the page computes (Tarifa, Luxor, Marseille, and the flat shadow)", () => {
  const hms = (h) => { const s = Math.round(h * 3600); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, "0")).join(":"); };
  const ta = localCircumstances(ECL_2027, 36.0128, -5.6048, 10), lu = localCircumstances(ECL_2027, 25.6872, 32.6396, 76), ma = localCircumstances(ECL_2027, 43.2965, 5.3698, 20);
  assert.equal(hms(ta.c2), "08:45:05");
  assert.equal(`${Math.floor(ta.duration / 60)} min ${Math.round(ta.duration % 60)} s`, "4 min 39 s");
  assert.ok(hms(lu.c2) >= "10:02:00" && hms(lu.c3) <= "10:08:59");
  assert.equal(`${Math.floor(lu.duration / 60)} min ${Math.round(lu.duration % 60)} s`, "6 min 20 s");
  assert.ok(!ma.central && Math.abs(ma.mag - 0.77) < 0.01 && hms(ma.max) === "09:02:56");
  const F = flatFit(ECL_PATHS["2027"]);
  const closest = (la, lo) => { const p = aeXY(la, lo); let b = { d: 1e9 }; for (let t = 6; t <= 14; t += 1 / 120) { const c = flatShadow(subPoints2027(t), F.f); const d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d < b.d) b = { d, t }; } return b; };
  assert.ok(closest(36.0128, -5.6048).d > 4000, "flat shadow never near Tarifa");
  const L = closest(25.6872, 32.6396);
  assert.ok(L.d < 130 && Math.abs(L.t - (6 + 9 / 60)) < 0.1, `flat shadow at Luxor ${L.d.toFixed(0)} km at ${L.t.toFixed(2)} h`);
});

import { pathLimits } from "./logic.js";
test("the northern and southern limits of totality, computed, fall on the published ones", () => {
  const rows = ECL_PATHS["2027"].filter((q) => q.t !== "Limits");
  // distance (km) d'un point à une polyligne publiée, en projection locale équirectangulaire
  const toLine = (p, key) => {
    let best = 1e9;
    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i][key], b = rows[i + 1][key], k = Math.cos(p[0] * Math.PI / 180) * 111.195;
      const ax = (a[1] - p[1]) * k, ay = (a[0] - p[0]) * 111.195, bx = (b[1] - p[1]) * k, by = (b[0] - p[0]) * 111.195;
      const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
    }
    return best;
  };
  let worst = 0, n = 0;
  // aux deux bouts (Soleil < 15°) la perpendiculaire sort de la ligne publiée,
  // qui s'arrête avec la table : distance sans objet, pas une erreur du calcul
  for (const r of rows) {
    if (r.alt < 15) continue;
    const L = pathLimits(ECL_2027, hhmm(r.t)); assert.ok(L);
    const [north, south] = L.left[0] > L.right[0] ? [L.left, L.right] : [L.right, L.left];
    worst = Math.max(worst, toLine(north, "n"), toLine(south, "s")); n++;
  }
  assert.ok(n > 80);
  assert.ok(worst < 2, `worst ${worst.toFixed(2)} km from the published limit lines`);
});

import { umbraRatio } from "./lunar.js";
test("the Earth's shadow at the Moon's distance is ~2.7 Moon radii (the prose says 'about 2.7')", () => {
  const u = umbraRatio();
  assert.ok(Math.abs(u.ratio - 2.7) < 0.05, `${u.ratio}`);
});

// Séléniélie (2026-10-04) : l'ombre de la Terre recalculée doit retrouver la totalité
// publiée par la NASA (LEdecade2021 : instant du maximum en TD, durée de la totalité).
import { SELEN_CASES, selenAt, selenWindow, selenBudget, heightWithoutAir, shadowSide } from "./logic.js";
test("lunar totality of 2025 Mar 14 and 2028 Dec 31 matches NASA's catalogue to a minute", () => {
  for (const [c, maxTD, dur, dT] of [[{ y: 2025, m: 3, d: 14, lat: 0, lon: 0 }, hhmm("06:59:56"), 65, 69], [{ y: 2028, m: 12, d: 31, lat: 0, lon: 0 }, hhmm("16:53:15"), 71, 72]]) {
    const tot = [];
    for (let t = maxTD - 1.5; t <= maxTD + 1.5; t += 1 / 120) if (selenAt(c, t).phase === "total") tot.push(t);
    const mid = (tot[0] + tot.at(-1)) / 2, len = (tot.at(-1) - tot[0]) * 60;
    assert.ok(Math.abs(mid - (maxTD - dT / 3600)) * 60 < 1.5, `${c.y} : milieu ${mid}`);
    assert.ok(Math.abs(len - dur) < 2, `${c.y} : ${len.toFixed(1)} min de totalité, NASA ${dur}`);
  }
});
test("selenelion at Brest, 31 Dec 2028: with air 16:25-16:33 UT, total; without air 2' short at sea level", () => {
  const c = SELEN_CASES.brest2028, w = selenWindow(c, true), n = selenWindow(c, false);
  assert.ok(Math.abs(w.first - hhmm("16:25:15")) < 1 / 60 && Math.abs(w.last - hhmm("16:33:00")) < 1 / 60, `${w.first} ${w.last}`);
  assert.equal(selenAt(c, (w.first + w.last) / 2).phase, "total");
  assert.equal(n.first, null);
  assert.ok(Math.abs(n.best * 60 + 2.1) < 0.3, `sans air ${n.best * 60}′`);
  assert.ok(Math.abs(heightWithoutAir(c) - 1.2) < 0.2);
  const b = selenBudget(c), r = (x) => Math.round(x * 60);
  assert.deepEqual([r(b.pi), r(b.delta), r(b.sdS + b.sdM), r(b.noAir), r(b.rhoS + b.rhoM), r(b.air)], [58, 22, 32, -4, 59, 54]);
  const s = selenAt(c, 16.48);
  assert.ok(Math.abs(s.sun.az - 234) < 1 && Math.abs(s.moon.az - 54) < 1.5);
});
test("selenelion at Minneapolis, 8 Oct 2014: 12:20-12:29 UT, possible even without air", () => {
  const c = SELEN_CASES.mpls2014, w = selenWindow(c, true);
  assert.ok(Math.abs(w.first - hhmm("12:20")) < 1 / 60 && Math.abs(w.last - hhmm("12:29")) < 1 / 60, `${w.first} ${w.last}`);
  assert.ok(selenWindow(c, false).first != null);
  assert.ok(selenBudget(c).air < 2, "sous la borne de 2° de la page");
});
test("the shadow's 'wrong side': at the same instant Brest/Minneapolis see it below the Moon, Adelaide above, one position angle from celestial north", () => {
  for (const c of Object.values(SELEN_CASES)) for (let i = 0; i <= 4; i++) {
    const t = c.t0 + (c.t1 - c.t0) * i / 4, a = selenAt(c, t), b = selenAt({ ...c, ...c.far }, t);
    const A = shadowSide(a), B = shadowSide(b);
    assert.ok(Math.abs(A.up) > 120, `${c.place} ${t} : ${A.up}`);
    assert.ok(Math.abs(B.up) < 35, `${c.far.place} ${t} : ${B.up}`);
    assert.ok(b.moon.alt > 20 && b.sun.alt < -20 && a.phase === b.phase, `${b.moon.alt} ${b.sun.alt}`);
    assert.ok(Math.abs(((A.pa - B.pa + 540) % 360) - 180) < 1, `angle de position ${A.pa} / ${B.pa}`);
  }
});
