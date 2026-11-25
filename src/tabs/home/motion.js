// Cumuls de la rotation et de l'orbite (epic19/UC15) : chaque valeur vient de la logique de SON
// onglet (import dynamique), rien n'est recopié. Mesures pures et validations jamais mélangées
// (règle 10 élargie : la grandeur mesurée -- Ω, unité astronomique -- n'est jamais entrée).

export const OMEGA_SOURCES = [
  { tab: "rot", key: "om-rings", purity: "pure", load: async () => { const m = await import("../rot/logic.js"); const v = m.ringRows().map((r) => r.omega); return { n: v.length, v }; } },
  { tab: "rot", key: "om-falls", purity: "pure", load: async () => { const m = await import("../rot/logic.js"); const s = m.fallStats(); return { n: s.q.n, v: m.fallRows().filter((r) => s.kept.includes(r.who)).map((r) => r.omega) }; } },
];
OMEGA_SOURCES.push({ tab: "sat", key: "om-sat", purity: "pure", load: async () => { const m = await import("../../data/presets/sat-doppler.js"); return { n: 1, v: [m.SAT_DOPPLER.om * 1e-5] }; } });
export const AU_SOURCES = [
  { tab: "orb", key: "au-bradley", purity: "pure", load: async () => { const m = await import("../orb/logic.js"); return { n: 1, v: [m.fromLightTime(492).a] }; } },
  { tab: "orb", key: "au-delambre", purity: "pure", load: async () => { const m = await import("../orb/logic.js"); return { n: 1, v: [m.fromLightTime(492).a] }; } },
  // Rømer à rebours : 8 822 éclipses d'Io 1652-1983 (Lieske), six époques, c de laboratoire, orbites d'angles (2026-11-25)
  { tab: "sun", key: "au-romer", purity: "pure", load: async () => { const m = await import("../sun/romer-data.js"); const r = m.romerAU(); return { n: r.n, v: [r.au] }; } },
  { tab: "orb", key: "au-sun", purity: "check", enters: "enters-orb-dop", load: async () => { const d = await import("../orb/data.js"); const D = d.orbData(); return { n: D.days.length, v: [D.au] }; } },
  { tab: "orb", key: "au-star", purity: "check", enters: "enters-orb-star", load: async () => { const d = await import("../orb/data.js"); const D = d.orbData(); return { n: D.star.n, v: [D.star.a] }; } },
  // l'écho radar de Vénus, Millstone 1961, réduit avec DE440 (2026-11-18) : la médiane des 25 échos
  { tab: "orb", key: "au-radar", purity: "check", enters: "enters-orb-radar", load: async () => { const m = await import("../orb/radar-logic.js"); return { n: m.echoes().length, v: [m.stats().ours[2]] }; } },
  // le passage de Vénus de 1769, recueil de Newcomb réduit avec DE440 (2026-11-18)
  { tab: "orb", key: "au-transit1761", purity: "check", enters: "enters-orb-transit", load: async () => { const m = await import("../orb/transit-logic.js"); return { n: m.fit("1761").used, v: [m.fit("1761").a] }; } },
  { tab: "orb", key: "au-transit", purity: "check", enters: "enters-orb-transit", load: async () => { const m = await import("../orb/transit-logic.js"); return { n: m.fit().used, v: [m.fit().a] }; } },
  // 2012 : le seul contact III des amateurs (venus2012.de), 6 % trop loin, gardé (2026-11-19)
  { tab: "orb", key: "au-transit2012", purity: "check", enters: "enters-orb-transit", load: async () => { const m = await import("../orb/transit-logic.js"); return { n: m.fit("2012").used, v: [m.fit("2012").a] }; } },
  // huit pulsars millisecondes : EPTA DR2 contre VLBI MSPSRπ (2026-11-18), médiane
  { tab: "orb", key: "au-psr", purity: "check", enters: "enters-orb-psr", load: async () => { const m = await import("../orb/pulsar-logic.js"); return { n: m.pulsars().length, v: [m.summary().median] }; } },
];

const med = (v) => { const s = v.slice().sort((a, b) => a - b), n = s.length; return n % 2 ? s[n >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2; };

/** Charge une liste ; chaque ligne reçoit sa médiane. */
export async function loadMotion(list, exists = () => true) {
  const out = [];
  for (const s of list) {
    if (!exists(s.tab)) continue;
    try { const r = await s.load(); out.push({ ...s, ...r, med: med(r.v) }); } catch (e) { console.warn(`motion: ${s.key}`, e); }
  }
  return out;
}
/** Médiane des médianes, par classe (jamais mélangées). */
export function motionSplit(rows) {
  const g = (p) => { const r = rows.filter((x) => (p === "pure" ? x.purity === "pure" : x.purity !== "pure")); return { rows: r, med: r.length ? med(r.map((x) => x.med)) : null }; };
  return { pure: g("pure"), check: g("check") };
}
