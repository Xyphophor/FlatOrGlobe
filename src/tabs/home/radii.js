// Cumul des rayons de la Terre reconstruits sur le site (accueil, bas de
// page ; demande du propriétaire du 2026-09-29). Chaque entrée va chercher
// ses nombres dans la logique de SON onglet (import dynamique : rien n'est
// chargé tant que l'accueil n'est pas affiché) -- aucun rayon n'est recopié
// ici, sauf al-Bīrūnī, historique, cité par l'onglet dip et marqué comme tel.
//
// Règle de choix : pour chaque onglet, la reconstruction que l'onglet
// lui-même présente comme la bonne (ct : la troisième réduction, les deux
// autres sont dites circulaire / fausse par l'onglet ; seis : la vitesse
// pondérée océan/continent ; surv : corrigée de la réfraction). Ajouter une
// mesure = une entrée de RADIUS_SOURCES.

/** Quartiles et médiane (interpolation linéaire, comme ctStats). */
export function quart(values) {
  const v = values.slice().sort((a, b) => a - b), n = v.length;
  const q = (p) => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return v[lo] + (v[hi] - v[lo]) * (i - lo); };
  return { n, q1: q(0.25), med: q(0.5), q3: q(0.75), min: v[0], max: v[n - 1] };
}

/**
 * Incertitude statistique de la médiane de n valeurs : 1,2533 · s/√n, avec s l'écart-type estimé
 * par l'écart interquartile (s = IQR/1,349) -- robuste aux valeurs extrêmes.
 */
export function statSE(values) {
  const q = quart(values);
  return values.length > 1 ? 1.2533 * ((q.q3 - q.q1) / 1.349) / Math.sqrt(values.length) : 0;
}

/**
 * Chaque entrée renvoie : med (valeur centrale, la réduction que l'onglet défend), la
 * dispersion de ses valeurs (quartiles, extrêmes), n, stat (incertitude statistique de med),
 * et alts : le MÊME rayon recalculé avec les autres choix de réduction que l'onglet lui-même
 * présente ou documente (demande du propriétaire du 2026-09-29 : l'incertitude systématique
 * « mesurée par onglet »). sys = le plus grand écart d'une alternative à med ; σ = √(stat² + sys²)
 * (loadRadii). Une alternative que l'onglet déclare fausse ou circulaire n'est pas une alternative
 * (ct : les réductions 1 et 2).
 */
export const RADIUS_SOURCES = [
  // epic17 (règle 10) : purity "pure" = le rayon n'est jamais entré dans les données ; "check" = il y est
  // entré un jour (enters : clé de src/i18n/<lang>/evidence.json). Deux cumuls séparés, jamais mélangés.
  { tab: "seis", key: "seis", purity: "check", enters: "enters-seis-v", load: async () => {
    const m = await import("../seis/logic.js");
    const v = m.seisRadiusCorrectedGroups().at(-1)[1];
    return { ...quart(v), stat: statSE(v),
      // vitesse uniforme 3,5 km/s (la norme IASPEI) au lieu de la vitesse pondérée océan / continent
      alts: [{ k: "v-uniform", R: quart(m.seisRadiusGroups().at(-1)[1]).med }] };
  } },
  // 2026-11-21 (propriétaire : « réunir toutes ces mesures en une, comme pour les séismes ») : toutes les ondes de Lamb,
  // un seul résultat -- Hunga Tonga (t1 + t2, et le tour A4 − A2 sur sept jours), Krakatoa 1883, Nouvelle-Zemble 1961
  // (lambPool : médiane de tous les tours ; alternatives = les lots réunis autrement)
  { tab: "atmo", key: "atmo-lamb", purity: "pure", load: async () => {
    const r = (await import("../atmo/lambpool.js")).lambPool();
    return { n: r.n, q1: r.q1, med: r.med, q3: r.q3, min: r.min, max: r.max, stat: r.stat, alts: r.alts };
  } },
  { tab: "surv", key: "surv", purity: "check", enters: "enters-surv-red", load: async () => {
    const [m, p] = await Promise.all([import("../surv/logic.js"), import("../../data/presets/surv.js")]);
    const r = m.radiiFromPairs(p.SV_TRI, p.SV_ZEN), raw = quart(r.raw).med;
    // k : 0,13 (le standard du site) contre 0,084 et 0,115, les bornes que ces mêmes paires donnent (texte de l'onglet)
    return { ...quart(r.corrected), stat: statSE(r.corrected), alts: [0.084, 0.115].map((k) => ({ k: `k${k}`, R: raw * (1 - k) })) };
  } },
  // epic33 (2026-10-28) : 1 150 triangles de Schott (USC&GS SP 4 et SP 7), l'excès des angles observés contre l'aire sans
  // rayon (fog surv-excess). Un rayon par triangle n'a pas de sens (les petits ont un excès nul ou négatif) : la boîte est le
  // bootstrap par page imprimée (quartiles ; moustaches 2,5-97,5 %), stat = la moitié de l'intervalle 16-84 %. Alternatives :
  // un décalage constant par triangle ; les aires de Héron sur les côtés imprimés (passés par un excès calculé).
  { tab: "surv", key: "surv-tri", purity: "pure", load: async () => {
    const X = (await import("../../data/presets/surv-excess.js")).SURV_EXCESS, f = X.fit;
    return { n: f.n, med: f.R, q1: f.q[1], q3: f.q[2], min: f.q[0], max: f.q[3], stat: (f.hi - f.lo) / 2,
      alts: [{ k: "bias", R: f.Rbias }, { k: "printed", R: X.Rprinted }] };
  } },
  { tab: "ct", key: "ct", purity: "check", enters: "enters-ct-crest", load: async () => {
    const m = await import("../ct/logic.js");
    const v = m.ctRadii()[2][1];
    // k du tableur des observateurs (0,148, défendu par l'onglet) contre le k standard du site, 0,13
    return { ...quart(v), stat: statSE(v), alts: [{ k: "k0.13", R: quart(v).med * (1 - 0.13) / (1 - m.CT_KTHEIR) }] };
  } },
  // montrée, NON comptée (propriétaire, 2026-10-03) : retirer la correction publiée exige les rayons du GRS80 que
  // le NGS a utilisés -- le rayon trouvé reste ancré à ce traitement (onglet avia, « Where WGS84 enters »)
  { tab: "avia", key: "avia-eot", purity: "check", enters: "enters-avia-eot", counted: false, load: async () => {
    const [m, p] = await Promise.all([import("../avia/logic.js"), import("../../data/presets/avia-gravd.js")]);
    const D = m.gravdPairs(p.GRAVD[0].lines), v = m.fitRadiusByPair(D.pairs).map((x) => x.km);
    // ajustement global au lieu de la médiane des paires ; lectures reconstituées sur l'ellipsoïde au lieu de la sphère ;
    // gradients en hauteur et en latitude MESURÉS sur les paires au lieu de ceux du GRS80 (2026-10-03)
    const G = m.fitGradients(D.pairs);
    return { ...quart(v), stat: statSE(v), alts: [{ k: "global", R: m.fitRadius(D.pairs).km }, { k: "ellipsoid", R: m.fitRadius(D.pairs, { ellipsoid: true }).km },
      { k: "fa-fit", R: G.fa.km }, { k: "lat-fit", R: G.lat.km }, { k: "grad-fit", R: G.both.km }] };
  } },
  { tab: "avia", key: "avia-fl", purity: "pure", load: async () => {
    const [m, p] = await Promise.all([import("../avia/logic.js"), import("../../data/presets/avia-flights.js")]);
    const S = p.ROUTES.map((r) => m.routeStats(r, p.AIRPORTS));
    const f = m.radiusFromFlights(S), v = f.per.map((x) => x.R);
    // ajustement global (t0 et R ensemble) ; ajustement sur les seuls longs vols (> 6 000 km, où t0 pèse peu)
    const long = m.radiusFromFlights(S.filter((s) => s.gc > 6000));
    // 2026-11-25 : le maillage (avia-mesh), les MÊMES temps et la même TAS, sans les coordonnées des aéroports : une autre
    // réduction des mêmes données, donc une alternative (incertitude systématique), pas une mesure de plus dans le cumul
    const { AVIA_MESH: AM } = await import("../../data/presets/avia-mesh.js");
    return { ...quart(v), stat: statSE(v), alts: [{ k: "global", R: f.R }, { k: "long", R: long.R }, { k: "mesh", R: AM.sphere.R * AM.tas }] };
  } },
  // epic27 (2026-10-16) : la distance de chaque récepteur IGS au centre que décrivent les orbites, tirée du seul
  // Doppler (départ sur une carte plate) ; l'étendue est l'aplatissement et l'altitude, pas une erreur
  { tab: "sat", key: "sat", purity: "pure", load: async () => {
    const [m, L] = await Promise.all([import("../../data/presets/sat-doppler.js"), import("../sat/logic.js")]);
    const K = L.keptStations(m.SAT_DOPPLER), v = K.map((s) => s.r), E = L.ellipse(K);
    // alternative : le rayon moyen (2a + b)/3 de l'ellipse ajustée sur les mêmes récepteurs
    return { ...quart(v), stat: statSE(v), alts: [{ k: "mean-ellipsoid", R: (2 * E.a + E.a * (1 - E.f)) / 3 }] };
  } },
  // les deux mesures du propriétaire (2026-09-29), comptées comme les autres
  { tab: "dip", key: "dip-own", purity: "check", enters: "enters-dip-own", load: async () => {
    const m = await import("../dip/own.js");
    // alternatives : chaque décision de la mesure changée seule, sous trois états de l'air (ownSpread)
    const sp = m.ownSpread();
    return { ...quart(sp), med: m.ownRows()[0].Rair, n: m.ownRows().length, stat: 0, alts: sp.map((R, i) => ({ k: `v${i}`, R })) };
  } },
  { tab: "obs", key: "obs-jan10", purity: "check", enters: "enters-obs-lidar", load: async () => {
    const m = await import("../obs/jan10.js");
    const r = m.jan10Radius(), early = m.jan10Radius(-2);
    // alternatives : le bas et le haut du bord du Soleil avec k de 0,17 à 0,09 ; statistique : l'horloge à ±2 s
    // (seul le sens −2 s se calcule : au-delà, le bord quitte l'azimut de l'épaulement -- écart supposé symétrique)
    return { n: 1, med: r.mid, q1: r.lo, q3: r.hi, min: r.lo, max: r.hi, stat: Math.abs(early.mid - r.mid), alts: [{ k: "lo", R: r.lo }, { k: "hi", R: r.hi }] };
  } },
  // epic19 : le laser lunaire de Grasse (moon) -- R par passage ; alternative : D(t) quadratique au lieu de cubique.
  // Montré, NON compté (comme avia-eot) : il mesure la distance de LA station au centre, qui sur une Terre
  // aplatie dépend de la latitude (6 357 à 6 378 km), avec un σ de quelques km plus petit que cet écart.
  { tab: "moon", key: "moon-llr", purity: "check", enters: "enters-moon-llr", counted: false, load: async () => {
    const [m, p] = await Promise.all([import("../moon/logic.js"), import("../../data/presets/moon-llr.js")]);
    const v = m.llrRadii(p.LLR_PASSES).rows.map((r) => r.R);
    return { ...quart(v), stat: statSE(v), alts: [{ k: "deg2", R: m.llrRadii(p.LLR_PASSES, 2).q.med }] };
  } },
  // epic19 : la rotation lue sur le Doppler du Soleil (orb, HARPS-N) ; alternative : jours de plus de 6 h seulement.
  // Montré, non compté, pour la même raison que moon-llr (rayon local à 28,75° N).
  { tab: "orb", key: "orb-sun", purity: "check", enters: "enters-orb-dop", counted: false, load: async () => {
    const [m, p] = await Promise.all([import("../orb/logic.js"), import("../../data/presets/orb-sun.js")]);
    const v = m.sunDays(p.SUN_DAYS).map((r) => r.R);
    const long = m.sunDays(p.SUN_DAYS.filter((d) => d.pts.at(-1)[0] >= 6 * 3600)).map((r) => r.R);
    return { ...quart(v), stat: statSE(v), alts: [{ k: "long", R: quart(long).med }] };
  } },
  // cité, pas recalculé : l'onglet dip donne 6 300-6 340 km selon la coudée retenue (source dans l'onglet) ;
  // alternative : la réfraction qu'il ne pouvait pas corriger (l'onglet dip : « about 15% too large »), k = 0,13
  { tab: "dip", key: "dip", purity: "pure", quoted: true, load: async () => ({ n: 1, q1: 6300, med: 6320, q3: 6340, min: 6300, max: 6340, stat: 0,
    alts: [{ k: "cubit-lo", R: 6300 }, { k: "cubit-hi", R: 6340 }, { k: "refraction", R: 6320 * (1 - 0.13) }] }) },
];

/** Dernier cumul chargé (lu par la carte d'export de l'accueil, qui est synchrone). */
let last = null;

/** Toutes les entrées chargées (celles dont l'onglet manque sont ignorées). */
export async function loadRadii(exists = () => true) {
  const out = [];
  for (const s of RADIUS_SOURCES) {
    if (!exists(s.tab)) continue;
    try {
      const r = { ...s, ...(await s.load()) };
      // règle 10 : une alternative polluée (polluted) ne fixe jamais l'incertitude
      r.alts = r.alts.filter((x) => !x.polluted);
      r.sys = Math.max(0, ...r.alts.map((x) => Math.abs(x.R - r.med)));
      r.sigma = Math.hypot(r.stat, r.sys);
      out.push(r);
    } catch (e) { console.warn(`radii: ${s.key}`, e); } // un onglet cassé ne casse pas l'accueil
  }
  last = out;
  return out;
}

/**
 * Statistique globale (demande du propriétaire du 2026-09-29 : « le plus statistiquement
 * rigoureux ») : moyenne pondérée par l'inverse de la variance, chaque mesure avec son
 * incertitude totale σ (statistique ⊕ systématique mesurée par onglet). Cohérence : χ² sur
 * N − 1 degrés de liberté et rapport de Birge B = √(χ²/(N − 1)) ; si B > 1, les mesures se
 * dispersent plus que leurs σ ne le disent, et l'erreur type est multipliée par B (le « facteur
 * d'échelle » du Particle Data Group). Exclusion en écarts-types : une mesure est mise de côté
 * si elle est à plus de kSigma écarts-types de la moyenne pondérée des AUTRES, l'écart-type
 * combinant son σ et l'erreur type (mise à l'échelle) de cette moyenne -- calculée sans elle.
 * Pour comparaison : la moyenne simple, une voix par mesure.
 */
function wmean(rows) {
  const w = rows.map((r) => 1 / r.sigma ** 2), W = w.reduce((a, b) => a + b, 0);
  const mean = rows.reduce((a, r, i) => a + w[i] * r.med, 0) / W;
  const chi2 = rows.reduce((a, r) => a + ((r.med - mean) / r.sigma) ** 2, 0), dof = rows.length - 1;
  const birge = dof > 0 ? Math.sqrt(chi2 / dof) : 1;
  return { mean, se: Math.sqrt(1 / W), seScaled: Math.sqrt(1 / W) * Math.max(1, birge), chi2, dof, birge, w: w.map((x) => x / W) };
}

export function globalStats(rows, kSigma = 3) {
  // une mesure marquée counted: false est montrée (et sa distance aux autres calculée) mais n'entre jamais
  // dans la moyenne, le χ² ni l'exclusion
  const pool = rows.filter((r) => r.counted !== false);
  const zs = rows.map((r) => {
    const o = wmean(pool.filter((x) => x !== r));
    return (r.med - o.mean) / Math.hypot(r.sigma, o.seScaled);
  });
  const kept = pool.filter((r) => Math.abs(zs[rows.indexOf(r)]) <= kSigma);
  const W = wmean(kept);
  const plain = kept.reduce((a, r) => a + r.med, 0) / kept.length;
  return { n: kept.length, ...W, kSigma, zs, weights: rows.map((r) => (kept.includes(r) ? W.w[kept.indexOf(r)] : 0)),
    excluded: pool.filter((r) => !kept.includes(r)).map((r) => r.key), notCounted: rows.filter((r) => r.counted === false).map((r) => r.key),
    z: (6371 - W.mean) / W.seScaled, plain };
}

/** Les deux cumuls (epic17) : mesures pures et validations, chacun sur ses seules lignes. */
export function splitStats(rows, kSigma = 3) {
  const pure = rows.filter((r) => r.purity === "pure"), check = rows.filter((r) => r.purity !== "pure");
  return { pure: { rows: pure, G: globalStats(pure, kSigma) }, check: { rows: check, G: globalStats(check, kSigma) } };
}

/**
 * Chiffres de la carte d'export ({{clé}}, src/data/cards/home.js), calculés sur le dernier
 * cumul chargé : ils suivent les données, rien n'est recopié dans les textes. `names` donne
 * le nom d'une mesure (clé « rad-<key> » du dictionnaire de l'accueil) pour excl/top.
 */
export function radiiValueLookup(lang, names = (k) => k, rows = last) {
  if (!rows?.length) return () => "?";
  // epic17 : clés sans préfixe = les mesures pures ; préfixe c = les validations (jamais mélangées)
  const S = splitStats(rows), P = S.pure, C = S.check, G = P.G, H = C.G;
  const nf = (d) => (x) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const f0 = nf(0), f1 = nf(1), f2 = nf(2);
  const top = P.rows.map((r, i) => [r, G.weights[i]]).sort((a, b) => b[1] - a[1])[0];
  const V = {
    all: f0(rows.length), k: f0(P.rows.length), n: f0(G.n), tot: f0(P.rows.reduce((a, r) => a + r.n, 0)),
    mean: f0(G.mean), se: f0(G.seScaled), z: f1(Math.abs(G.z)), chi2: f1(G.chi2), dof: f0(G.dof), birge: f2(G.birge),
    ks: f0(G.kSigma), plain: f0(G.plain), top: names(top[0].key), topw: f0(top[1] * 100),
    excl: G.excluded.length ? G.excluded.map(names).join(" ; ") : names("none"),
    ck: f0(C.rows.length), cn: f0(H.n), cmean: f0(H.mean), cse: f0(H.seScaled), cz: f1(Math.abs(H.z)), cchi2: f1(H.chi2), cdof: f0(H.dof),
    cexcl: H.excluded.length ? H.excluded.map(names).join(" ; ") : names("none"),
    nc: H.notCounted.length ? H.notCounted.map(names).join(" ; ") : names("none"),
  };
  return (k) => V[k] ?? "?";
}
