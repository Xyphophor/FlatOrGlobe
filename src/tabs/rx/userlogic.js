// Logique pure du bloc « votre propre récepteur » (panneau GPS brut, epic16/UC04).
//
// Le visiteur charge un journal brut de son téléphone (GnssLogger / GPSTest, ou un
// RINEX 3 d'observation) et l'éphéméride diffusée du jour (RINEX nav 2/3/4). On résout
// sa position DEPUIS L'ORIGINE du repère, sans aucune position de départ ni forme
// supposée, avec LES MÊMES MATHÉMATIQUES que la page affiche plus haut et que
// le build gps-raw (tools/internal/build/gpsraw, ex-build_gps_raw.py) applique aux stations IGS :
//
//   équation de la pseudo-distance (formule de la section « The equation your phone
//   actually solves ») :   ρᵢ = |x − sᵢ(t − τᵢ)| + c·δt_récepteur − c·δt_satᵢ + T + I
//     x        : la position cherchée (3 inconnues) ;
//     δt_réc.  : l'horloge du téléphone (1 inconnue PAR SYSTÈME : GPS, Galileo) ;
//     sᵢ(t)    : la position du satellite tirée des éléments diffusés [7] (IS-GPS-200,
//                table 20-IV) et [10] (Galileo OS SIS ICD, même algorithme) ;
//     τᵢ       : le temps de vol, et la rotation de la Terre pendant ce vol (Sagnac) ;
//     δt_sat   : l'horloge du satellite, polynôme diffusé + terme relativiste [7]
//                (§20.3.3.3.3.1) − retard de groupe TGD (GPS, §20.3.3.3.3.2) ou BGD
//                (Galileo [10]) ;
//     T        : la troposphère, Saastamoinen [8] ;
//     I        : l'ionosphère, modèle de Klobuchar [10] si le fichier en donne les
//                coefficients (sinon laissée : quelques mètres, dit dans la page).
//   résolu par moindres carrés itérés (Gauss-Newton), comme pour les stations.
//
// Différences avec les stations, toutes dues au téléphone : UNE fréquence (L1 C/A et
// E1) au lieu de la combinaison L1/L2 sans ionosphère, d'où TGD/BGD et Klobuchar ;
// Galileo en plus de GPS (un téléphone voit 5-7 GPS seulement), donc une horloge de
// plus ; les époques ratées sont écartées sur leurs RÉSIDUS (> 100 m rms), pas sur un
// « rayon plausible » : aucune contrainte de forme n'entre dans le calcul.
//
// La pseudo-distance d'un téléphone n'est pas dans le journal : elle se reconstruit
// depuis les champs d'horloge de l'API Android GnssMeasurement [9] (voir parseGnssLog).
//
// Les numéros [n] sont ceux des sources de l'onglet gps (src/data/sources/gps.js).
// Tout reste dans la page : rien n'est envoyé, rien n'est stocké.
import { solveLin } from "../gps/rawlogic.js";

// Constantes : celles que les messages diffusés eux-mêmes imposent (on ne les choisit pas).
const C = 299792458;                                 // vitesse de la lumière (m/s), valeur de [7]
const OMEGA_E = 7.2921151467e-5;                     // rotation de la Terre (rad/s) des éléments diffusés, [7] table 20-IV
const WEEK = 604800;                                 // une semaine GPS (s) : les temps sont en « secondes de la semaine »
const MU = { G: 3.986005e14, E: 3.986004418e14 };   // GM (m³/s²) : GPS [7] table 20-IV ; Galileo [10]
// WGS84 [8] : SEULEMENT pour afficher latitude/longitude/hauteur et pour orienter
// l'horizon local (élévation des satellites, masque de 10°, troposphère). La position
// x elle-même ne dépend pas de ces deux nombres.
const A_WGS = 6378137, F_WGS = 1 / 298.257223563, D2R = Math.PI / 180;
const L1 = 1575.42e6;                                // fréquence L1 / E1 (Hz) : on ne garde que celle-ci
const MASK = 10;                                     // masque d'élévation (°), le même que pour les stations
const WEEK_NS = 604800000000000n;                    // une semaine en nanosecondes, en entier long (BigInt)

/** Nombre au format FORTRAN des RINEX (« 1.23D-05 ») ; champ vide = 0. */
const dfloat = (s) => { s = (s || "").trim(); return s ? Number(s.replace(/[Dd]/, "E")) : 0; };
/** Ramène un écart de temps dans [−½ semaine, +½ semaine] : passage de semaine, comme tk dans [7] table 20-IV. */
const wrapWeek = (dt) => ((dt + WEEK / 2) % WEEK + WEEK) % WEEK - WEEK / 2;

/** Temps GPS (semaine, secondes de la semaine) d'une date calendaire (en temps GPS). */
export function gpsTime(y, mo, d, h, mi, s) {
  const sec = (Date.UTC(y, mo - 1, d, h, mi, 0) - Date.UTC(1980, 0, 6)) / 1000 + s;
  return { week: Math.floor(sec / WEEK), sow: sec - Math.floor(sec / WEEK) * WEEK };
}

/** Date calendaire (UTC ≈ temps GPS à 18 s près) et jour de l'année d'un temps GPS : pour nommer le fichier BRDC à chercher. */
export function gpsDate(week, sow) {
  const t = new Date(Date.UTC(1980, 0, 6) + (week * WEEK + sow) * 1000);
  const doy = Math.floor((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000) + 1;
  return { iso: t.toISOString().slice(0, 10), year: t.getUTCFullYear(), doy };
}

// ------------------------------------------------------------------ journaux
/**
 * Journal CSV de GnssLogger / GPSTest (lignes « Raw », « Fix », NMEA « GGA »).
 *
 * Reconstruction de la pseudo-distance, d'après l'API Android GnssMeasurement et le
 * livre blanc de la GSA [9] :
 *   temps GPS de réception (ns) = TimeNanos − (FullBiasNanos + BiasNanos)
 *     TimeNanos     : l'horloge matérielle du téléphone ;
 *     FullBiasNanos : son écart (≈ −1,5·10¹⁸ ns) au temps GPS depuis le 6 janvier 1980 ;
 *                     trop grand pour un double sans perte : calcul en BigInt ;
 *     BiasNanos     : la partie fractionnaire de cet écart (sous la nanoseconde).
 *   t_rx = ce temps modulo une semaine (+ TimeOffsetNanos, le décalage de la mesure)
 *   t_tx = ReceivedSvTimeNanos : l'heure d'émission lue dans le signal du satellite
 *   pseudo-distance = (t_rx − t_tx) · c
 * C'est une « pseudo » distance : elle contient l'erreur de l'horloge du téléphone, que
 * le calcul résout comme une inconnue de plus.
 *
 * Filtres : GPS (ConstellationType 1) et Galileo (6) ; porteuse L1/E1 seulement ; temps
 * de la semaine décodé (bits State TOW_DECODED = 8 ou TOW_KNOWN = 16384, sinon t_tx n'est
 * connu qu'à 1 ms ou 100 ms près) ; incertitude < 500 ns ; distance entre 15 000 et
 * 32 000 km (une mesure hors de cette fenêtre est un défaut de décodage, pas une
 * géométrie : la fenêtre couvre tout satellite GPS/Galileo vu de n'importe où).
 * Les lignes « Fix » / GGA (position calculée par le téléphone lui-même) ne servent
 * QU'À la comparaison finale ; elles n'entrent jamais dans le calcul.
 *
 * Renvoie { format, device, epochs: [{week, sow, obs: [{sys, prn, pr, cn0}]}],
 * fixes: [{lat, lon, h}], nav: nombre de lignes « Nav » (non décodées) }.
 */
export function parseGnssLog(text) {
  const lines = text.split(/\r?\n/);
  let head = null, device = "", navLines = 0;
  const byT = new Map(), fixes = [];
  for (const ln of lines) {
    if (ln.startsWith("#")) {
      const m = ln.match(/^#\s+Raw,(.*)$/);
      if (m) head = Object.fromEntries(m[1].split(",").map((k, i) => [k.trim(), i + 1]));
      const d = ln.match(/Manufacturer:\s*([^,]+),\s*Model:\s*([^,]+)/);
      if (d) device = `${d[1].trim()} ${d[2].trim()}`;
      continue;
    }
    if (ln.startsWith("Nav,")) { navLines++; continue; }
    if (ln.startsWith("Fix,")) {
      const f = ln.split(","), lat = Number(f[2]), lon = Number(f[3]), h = Number(f[4]);
      // f[1] = fournisseur : GPS (la puce seule), FLP (fusion avec Wi-Fi/capteurs), NLP (réseau, jusqu'à des centaines de m)
      if (Number.isFinite(lat) && Number.isFinite(lon) && f[2] !== "") fixes.push({ lat, lon, h: Number.isFinite(h) ? h : 0, src: f[1] });
      continue;
    }
    if (ln.startsWith("NMEA,$") && /^NMEA,\$..GGA/.test(ln)) {
      const f = ln.split(",");   // NMEA,$xxGGA,hhmmss,lat,N,lon,E,q,n,hdop,alt,M,sep,M,...
      if (+f[7] > 0 && f[3] && f[5]) {
        const dm = (s, deg) => Number(s.slice(0, deg)) + Number(s.slice(deg)) / 60;
        const lat = dm(f[3], 2) * (f[4] === "S" ? -1 : 1), lon = dm(f[5], 3) * (f[6] === "W" ? -1 : 1);
        fixes.push({ lat, lon, h: Number(f[10]) + (Number(f[12]) || 0), src: "GGA" });   // GGA : altitude = au-dessus du géoïde + séparation géoïde
      }
      continue;
    }
    if (!ln.startsWith("Raw,") || !head) continue;
    const f = ln.split(","), g = (k) => f[head[k]];
    const sys = { 1: "G", 6: "E" }[g("ConstellationType")];
    if (!sys) continue;
    const fc = Number(g("CarrierFrequencyHz"));
    if (fc && Math.abs(fc - L1) > 1e6) continue;          // L1/E1 seulement (pas L5/E5a)
    const state = Number(g("State"));
    if (!(state & 8) && !(state & 16384)) continue;        // temps de la semaine décodé (TOW_DECODED / TOW_KNOWN)
    if (Number(g("ReceivedSvTimeUncertaintyNanos")) > 500) continue;
    let gt;
    try { gt = BigInt(g("TimeNanos")) - BigInt(g("FullBiasNanos")); } catch { continue; }
    const week = Number(gt / WEEK_NS), rxNs = Number(gt % WEEK_NS) - Number(g("BiasNanos") || 0) + Number(g("TimeOffsetNanos") || 0);
    let dtNs = rxNs - Number(g("ReceivedSvTimeNanos"));
    if (dtNs < -WEEK * 5e8) dtNs += WEEK * 1e9;            // passage de semaine
    const pr = dtNs * 1e-9 * C;
    if (!(pr > 1.5e7 && pr < 3.2e7)) continue;
    const key = g("TimeNanos");
    if (!byT.has(key)) byT.set(key, { week, sow: rxNs * 1e-9, obs: [] });
    byT.get(key).obs.push({ sys, prn: Number(g("Svid")), pr, cn0: Number(g("Cn0DbHz")) });
  }
  return { format: "gnsslogger", device, epochs: [...byT.values()].sort((a, b) => a.week - b.week || a.sow - b.sow), fixes, nav: navLines };
}

/** Fichier RINEX 3 d'observation (GnssLogger, Geo++, etc.) : pseudo-distances C1C (GPS) et C1C/C1X/C1B (Galileo). Même sortie que parseGnssLog. */
export function parseRinexObs(text) {
  const lines = text.split(/\r?\n/);
  const types = {}, epochs = [];
  let i = 0, ver = 3, sysCur = null;
  for (; i < lines.length; i++) {
    const ln = lines[i], lab = ln.slice(60).trim();
    if (lab === "RINEX VERSION / TYPE") ver = Number(ln.slice(0, 9));
    else if (lab === "SYS / # / OBS TYPES") {
      if (ln[0] !== " ") { sysCur = ln[0]; types[sysCur] = []; }
      if (sysCur) types[sysCur].push(...ln.slice(7, 60).trim().split(/\s+/).filter(Boolean));
    } else if (lab === "END OF HEADER") { i++; break; }
  }
  if (ver < 3) throw new Error("RINEX 2 observation files are not supported (use RINEX 3)");
  const col = { G: (types.G || []).indexOf("C1C"), E: ["C1C", "C1X", "C1B"].map((t) => (types.E || []).indexOf(t)).find((k) => k >= 0) ?? -1 };
  let cur = null;
  for (; i < lines.length; i++) {
    const ln = lines[i];
    if (ln[0] === ">") {
      const p = ln.slice(1).trim().split(/\s+/), flag = Number(p[6] || 0);
      if (flag > 1) { i += Number(p[7] || 0); cur = null; continue; }
      const t = gpsTime(+p[0], +p[1], +p[2], +p[3], +p[4], +p[5]);
      cur = { ...t, obs: [] }; epochs.push(cur);
      continue;
    }
    if (!cur) continue;
    const sys = ln[0], k = col[sys];
    if (k == null || k < 0) continue;
    const v = Number(ln.slice(3 + 16 * k, 3 + 16 * k + 14));
    if (v > 1.5e7 && v < 3.2e7) cur.obs.push({ sys, prn: Number(ln.slice(1, 3)), pr: v, cn0: NaN });
  }
  return { format: "rinex-obs", device: "", epochs: epochs.filter((e) => e.obs.length), fixes: [], nav: 0 };
}

/** Lit l'un ou l'autre selon le contenu. */
export function parseObservations(text) {
  if (/RINEX VERSION \/ TYPE/.test(text.slice(0, 4000)) && /OBSERVATION DATA/.test(text.slice(0, 4000))) return parseRinexObs(text);
  if (/^Raw,/m.test(text)) return parseGnssLog(text);
  throw new Error("not a GnssLogger/GPSTest log nor a RINEX 3 observation file");
}

// ------------------------------------------------------------------ éphémérides
/**
 * Fichier de navigation RINEX 2 (GPS), 3 ou 4 (mixte), le format de l'IGS (lecture,
 * [6]) : les éléments d'orbite et d'horloge que chaque satellite DIFFUSE lui-même,
 * recopiés par les stations. Un enregistrement = 8 lignes, 29 nombres :
 *   ligne 0 : satellite, époque toc, af0 af1 af2 (polynôme d'horloge)
 *   1 : IODE  Crs  Δn  M0          2 : Cuc  e  Cus  √a
 *   3 : toe  Cic  Ω0  Cis          4 : i0  Crc  ω  Ω̇
 *   5 : IDOT  codes/sources  semaine  …
 *   6 : GPS : précision  santé  TGD  IODC  ·  Galileo : SISA  santé  BGD E5a/E1  BGD E5b/E1
 * (IS-GPS-200 [7] table 20-III ; Galileo [10] ; ordre fixé par le format RINEX, le même pour les deux).
 * En RINEX 4, chaque bloc est précédé d'une ligne « > EPH G05 LNAV » : on ne garde que
 * les blocs EPH GPS LNAV / Galileo INAV (les blocs STO, EOP, ION sont sautés).
 * Les coefficients de Klobuchar (α₀..α₃, β₀..β₃) sont dans l'en-tête : « ION ALPHA/BETA »
 * en RINEX 2, « GPSA/GPSB … IONOSPHERIC CORR » en RINEX 3 ; absents de certains fichiers
 * (les BRDC00WRD de BKG), présents dans le BRDC00IGS publié le lendemain.
 *
 * Renvoie { eph: {"G05": [..], "E11": [..]}, iono: {a, b} | null, n, version }.
 */
export function parseRinexNav(text) {
  const lines = text.split(/\r?\n/);
  let ver = 3, i = 0, iono = null;
  const ia = [], ib = [];
  for (; i < lines.length; i++) {
    const ln = lines[i], lab = ln.slice(60).trim();
    if (lab === "RINEX VERSION / TYPE") ver = Number(ln.slice(0, 9));
    else if (lab === "ION ALPHA") ia.push(...[0, 1, 2, 3].map((k) => dfloat(ln.slice(2 + 12 * k, 14 + 12 * k))));
    else if (lab === "ION BETA") ib.push(...[0, 1, 2, 3].map((k) => dfloat(ln.slice(2 + 12 * k, 14 + 12 * k))));
    else if (lab === "IONOSPHERIC CORR" && ln.startsWith("GPSA")) ia.push(...[0, 1, 2, 3].map((k) => dfloat(ln.slice(5 + 12 * k, 17 + 12 * k))));
    else if (lab === "IONOSPHERIC CORR" && ln.startsWith("GPSB")) ib.push(...[0, 1, 2, 3].map((k) => dfloat(ln.slice(5 + 12 * k, 17 + 12 * k))));
    else if (lab === "END OF HEADER") { i++; break; }
  }
  if (!lines.slice(0, i).some((l) => /NAV/.test(l.slice(20, 40)) && l.includes("RINEX VERSION"))) throw new Error("not a RINEX navigation file");
  if (ia.length === 4 && ib.length === 4) iono = { a: ia, b: ib };
  const recs = [];
  if (ver < 3) {
    // RINEX 2 (GPS seul) : 8 lignes par enregistrement, champs D19.12 à partir des colonnes 22 / 3
    for (; i + 7 < lines.length; i += 8) {
      const l0 = lines[i];
      if (!l0.trim()) break;
      const yy = Number(l0.slice(3, 5));
      recs.push({ sys: "G", prn: Number(l0.slice(0, 2)), t: [yy < 80 ? 2000 + yy : 1900 + yy, +l0.slice(6, 8), +l0.slice(9, 11), +l0.slice(12, 14), +l0.slice(15, 17), Number(l0.slice(17, 22))],
        v: [0, 1, 2].map((k) => dfloat(l0.slice(22 + 19 * k, 41 + 19 * k))).concat(...lines.slice(i + 1, i + 8).map((l) => [0, 1, 2, 3].map((k) => dfloat(l.slice(3 + 19 * k, 22 + 19 * k))))) });
    }
  } else {
    let keep = ver < 4;
    for (; i < lines.length; i++) {
      const l0 = lines[i];
      if (l0[0] === ">") { keep = /^> EPH [GE]\d\d (LNAV|INAV)/.test(l0); continue; }
      if (!keep || !/^[GE]\d\d /.test(l0) || i + 7 >= lines.length) continue;
      recs.push({ sys: l0[0], prn: Number(l0.slice(1, 3)), t: [+l0.slice(4, 8), +l0.slice(9, 11), +l0.slice(12, 14), +l0.slice(15, 17), +l0.slice(18, 20), +l0.slice(21, 23)],
        v: [0, 1, 2].map((k) => dfloat(l0.slice(23 + 19 * k, 42 + 19 * k))).concat(...lines.slice(i + 1, i + 8).map((l) => [0, 1, 2, 3].map((k) => dfloat(l.slice(4 + 19 * k, 23 + 19 * k))))) });
      i += 7;
    }
  }
  const eph = {};
  let n = 0;
  for (const { sys, prn, t, v } of recs) {
    if (v[24] !== 0) continue;                                      // santé ≠ 0 : le satellite se déclare lui-même inutilisable
    // Galileo diffuse deux messages (I/NAV sur E1-B/E5b, F/NAV sur E5a) ; le téléphone reçoit
    // E1, donc I/NAV (bit 0 ou 2 du champ « sources » défini par le format RINEX 3), avec BGD E5b/E1.
    if (sys === "E" && !(v[20] & 5)) continue;
    const toc = gpsTime(...t).sow;
    // v : af0 af1 af2 | IODE crs Δn M0 | cuc e cus √a | toe cic Ω0 cis | i0 crc ω Ω̇ | IDOT … | acc santé TGD(GPS)/BGD E5a(Gal) BGD E5b(Gal)
    const e = { sys, prn, toc, af0: v[0], af1: v[1], af2: v[2], crs: v[4], dn: v[5], m0: v[6], cuc: v[7], ecc: v[8], cus: v[9], sqa: v[10],
      toe: v[11], cic: v[12], om0: v[13], cis: v[14], i0: v[15], crc: v[16], w: v[17], omd: v[18], idot: v[19],
      tgd: sys === "G" ? v[25] : v[26] };
    (eph[`${sys}${String(prn).padStart(2, "0")}`] ??= []).push(e);
    n++;
  }
  return { eph, iono, n, version: ver };
}

/** L'enregistrement du satellite dont l'époque de référence toe est la plus proche de t (moins de 4 h, comme pick() de build_gps_raw.py : un jeu d'éléments est prévu pour quelques heures autour de toe). */
function pickEph(nav, sys, prn, t) {
  let best = null;
  for (const e of nav.eph[`${sys}${String(prn).padStart(2, "0")}`] || []) {
    const d = Math.abs(wrapWeek(t - e.toe));
    if (!best || d < best.d) best = { d, e };
  }
  return best && best.d < 4 * 3600 ? best.e : null;
}

/**
 * Position ECEF (m) et décalage d'horloge (s) d'un satellite au temps t (s de la semaine) :
 * l'algorithme de l'IS-GPS-200 [7], table 20-IV, ligne par ligne (Galileo [10] :
 * identique, avec son propre GM). Le même que sat_state() de scripts/build_gps_raw.py.
 */
export function satState(e, t) {
  const mu = MU[e.sys] ?? MU.G;
  const a = e.sqa ** 2;                                  // demi-grand axe (m) : le message diffuse √a
  const tk = wrapWeek(t - e.toe);                        // temps écoulé depuis l'époque de référence
  const M = e.m0 + (Math.sqrt(mu / a ** 3) + e.dn) * tk; // anomalie moyenne : mouvement moyen n₀ = √(μ/a³), corrigé de Δn
  let E = M;                                             // équation de Kepler M = E − e·sin E, par itération
  for (let k = 0; k < 12; k++) E = M + e.ecc * Math.sin(E);
  const nu = Math.atan2(Math.sqrt(1 - e.ecc ** 2) * Math.sin(E), Math.cos(E) - e.ecc);  // anomalie vraie
  const phi = nu + e.w;                                  // argument de latitude
  // corrections harmoniques du second ordre (Cus/Cuc sur l'argument, Crs/Crc sur le rayon, Cis/Cic sur l'inclinaison)
  const s2 = Math.sin(2 * phi), c2 = Math.cos(2 * phi);
  const u = phi + e.cus * s2 + e.cuc * c2;
  const r = a * (1 - e.ecc * Math.cos(E)) + e.crs * s2 + e.crc * c2;
  const inc = e.i0 + e.idot * tk + e.cis * s2 + e.cic * c2;
  const xp = r * Math.cos(u), yp = r * Math.sin(u);      // position dans le plan de l'orbite
  // longitude du nœud ascendant, corrigée de la rotation de la Terre : le résultat est
  // dans le repère TERRESTRE (qui tourne avec la Terre) à l'instant t
  const om = e.om0 + (e.omd - OMEGA_E) * tk - OMEGA_E * e.toe;
  // horloge du satellite (§20.3.3.3.3.1) : polynôme af0 + af1·Δt + af2·Δt², terme
  // relativiste −2·√(μa)·e·sin E / c² (l'orbite excentrique fait varier sa vitesse et son
  // potentiel : la ligne de l'IS-GPS-200 que la page cite dans les lectures), puis le
  // retard de groupe : un utilisateur L1 seul retranche TGD (§20.3.3.3.3.2) ; Galileo E1
  // retranche BGD(E5b/E1) ([10])
  const dtc = wrapWeek(t - e.toc);
  const clk = e.af0 + e.af1 * dtc + e.af2 * dtc ** 2 - 2 * Math.sqrt(mu * a) * e.ecc * Math.sin(E) / C ** 2 - e.tgd;
  return { p: [xp * Math.cos(om) - yp * Math.cos(inc) * Math.sin(om), xp * Math.sin(om) + yp * Math.cos(inc) * Math.cos(om), yp * Math.sin(inc)], clk };
}

// ------------------------------------------------------------------ géométrie
/** Latitude, longitude géodésiques WGS84 (degrés) et hauteur (m), par itération (NIMA TR8350.2, [8]) : seulement pour l'affichage et l'élévation des satellites. */
export function geodetic(x) {
  const e2 = F_WGS * (2 - F_WGS), lon = Math.atan2(x[1], x[0]), p = Math.hypot(x[0], x[1]);
  let lat = Math.atan2(x[2], p * (1 - e2)), h = 0;
  for (let k = 0; k < 6; k++) {
    const N = A_WGS / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
    h = Math.abs(lat) < 1.4 ? p / Math.cos(lat) - N : x[2] / Math.sin(lat) - N * (1 - e2);
    lat = Math.atan2(x[2], p * (1 - e2 * N / (N + h)));
  }
  return { lat: lat / D2R, lon: lon / D2R, h };
}

/** L'inverse, (φ, λ, h) → ECEF (NIMA TR8350.2 [8]) : pour comparer à la position que le téléphone a lui-même calculée. */
export function ecef(lat, lon, h) {
  const e2 = F_WGS * (2 - F_WGS), la = lat * D2R, lo = lon * D2R, N = A_WGS / Math.sqrt(1 - e2 * Math.sin(la) ** 2);
  return [(N + h) * Math.cos(la) * Math.cos(lo), (N + h) * Math.cos(la) * Math.sin(lo), (N * (1 - e2) + h) * Math.sin(la)];
}

/** Azimut (rad) et élévation (°) du satellite s vu de x : le vecteur x→s projeté sur les axes est, nord, haut du lieu. */
function azEl(x, s) {
  const { lat, lon } = geodetic(x), la = lat * D2R, lo = lon * D2R, d = [s[0] - x[0], s[1] - x[1], s[2] - x[2]];
  const e = -Math.sin(lo) * d[0] + Math.cos(lo) * d[1];
  const n = -Math.sin(la) * Math.cos(lo) * d[0] - Math.sin(la) * Math.sin(lo) * d[1] + Math.cos(la) * d[2];
  const u = Math.cos(la) * Math.cos(lo) * d[0] + Math.cos(la) * Math.sin(lo) * d[1] + Math.sin(la) * d[2];
  return { az: Math.atan2(e, n), el: Math.asin(u / Math.hypot(e, n, u)) / D2R };
}

/**
 * Retard troposphérique (m), Saastamoinen [8] : retard au zénith tiré de la pression p
 * et de la vapeur d'eau e d'une atmosphère standard à l'altitude h, allongé en
 * 1/cos(z) quand le satellite est bas (z = distance zénithale, plafonnée à 85°).
 * Environ 2,3 m au zénith au niveau de la mer. Copie de tropo() de build_gps_raw.py.
 */
function tropo(el, h) {
  h = Math.max(-100, Math.min(h, 8000));
  const p = 1013.25 * (1 - 2.2557e-5 * h) ** 5.2568, T = 15 - 6.5e-3 * h + 273.16, e = 6.108 * 0.5 * Math.exp((17.15 * T - 4684) / (T - 38.45));
  const z = (90 - Math.max(el, 5)) * D2R;
  return 0.002277 / Math.cos(z) * (p + (1255 / T + 0.05) * e - Math.tan(z) ** 2);
}

/**
 * Retard ionosphérique sur L1 (m), modèle de Klobuchar [10] tel qu'écrit dans l'IS-GPS-200
 * [7] §20.3.3.5.2.5 (figure 20-4), étape par étape. Les angles du modèle sont en
 * demi-cercles. On calcule le point où le trajet traverse l'ionosphère (350 km),
 * sa latitude géomagnétique, l'heure locale en ce point ; le retard est un cosinus
 * centré sur 14 h locales (amplitude Σαₙφⁿ, période Σβₙφⁿ, 8 coefficients diffusés),
 * 5 ns la nuit, multiplié par le facteur d'obliquité F. Corrige environ la moitié
 * du retard réel ; Galileo E1 est sur la même fréquence, donc même retard.
 */
export function klobuchar(iono, latDeg, lonDeg, az, elDeg, sow) {
  const el = elDeg / 180, phiU = latDeg / 180, lamU = lonDeg / 180;      // demi-cercles
  const psi = 0.0137 / (el + 0.11) - 0.022;
  const phiI = Math.max(-0.416, Math.min(0.416, phiU + psi * Math.cos(az)));
  const lamI = lamU + psi * Math.sin(az) / Math.cos(phiI * Math.PI);
  const phiM = phiI + 0.064 * Math.cos((lamI - 1.617) * Math.PI);
  let t = (43200 * lamI + sow) % 86400; if (t < 0) t += 86400;
  const F = 1 + 16 * (0.53 - el) ** 3;
  const amp = Math.max(0, iono.a.reduce((q, a, k) => q + a * phiM ** k, 0)), per = Math.max(72000, iono.b.reduce((q, b, k) => q + b * phiM ** k, 0));
  const x = 2 * Math.PI * (t - 50400) / per;
  return C * F * (Math.abs(x) < 1.57 ? 5e-9 + amp * (1 - x * x / 2 + x ** 4 / 24) : 5e-9);
}

/**
 * Une époque, par Gauss-Newton DEPUIS L'ORIGINE (x = 0, le centre du repère) : inconnues
 * x, y, z et une horloge par système (GPS, Galileo). Même schéma que solve_epoch() de
 * build_gps_raw.py. À chaque itération, pour chaque satellite :
 *   1. temps de vol τ = (pseudo-distance − horloge du récepteur) / c ;
 *   2. position du satellite à l'ÉMISSION, t − τ (satState) ;
 *   3. Sagnac : pendant τ la Terre a tourné de Ω·τ ; on exprime la position du satellite
 *      dans le repère terrestre de l'instant de RÉCEPTION (rotation d'angle Ω·τ autour de z) ;
 *   4. résidu y = mesure corrigée − modèle, avec mesure corrigée = pseudo-distance
 *      + c·δt_sat − troposphère − ionosphère, et modèle = |s − x| + c·δt_récepteur ;
 *   5. ligne de la matrice H = dérivées du modèle : −(s − x)/|s − x| (vecteur unitaire
 *      vers le satellite, changé de signe) et 1 pour l'horloge de son système.
 * Puis équations normales HᵀH·dx = Hᵀy (rawlogic.solveLin), x += dx, jusqu'à |dx| < 1 mm.
 * Troposphère, ionosphère et masque de 10° n'entrent qu'à partir de la 4ᵉ itération,
 * quand x est assez près pour avoir un horizon local. Il faut au moins une mesure de
 * plus que d'inconnues (3 + nombre de systèmes + 1), pour que les résidus disent
 * quelque chose. Renvoie { x, res: [m], n, sys, sats } ou null. `trace` (facultatif) reçoit
 * à chaque itération { x, rms } : la figure de convergence de la page (ownfigs.js) le lit.
 */
export function solveEpoch(nav, ep, trace = null) {
  let sats = [];
  for (const o of ep.obs) { const e = pickEph(nav, o.sys, o.prn, ep.sow - o.pr / C); if (e) sats.push({ ...o, e }); }
  const systems = () => [...new Set(sats.map((s) => s.sys))];
  let sy = systems();
  if (sats.length < 3 + sy.length + 1) return null;
  let x = [0, 0, 0], b = Object.fromEntries(sy.map((s) => [s, 0])), res = [];
  for (let it = 0; it < 15; it++) {
    const H = [], y = [], geo = it >= 3 ? geodetic(x) : null;
    for (const s of sats) {
      const tau = (s.pr - b[s.sys]) / C, st = satState(s.e, ep.sow - tau), th = OMEGA_E * tau;
      const sp = [st.p[0] * Math.cos(th) + st.p[1] * Math.sin(th), -st.p[0] * Math.sin(th) + st.p[1] * Math.cos(th), st.p[2]];
      const d = [sp[0] - x[0], sp[1] - x[1], sp[2] - x[2]], rho = Math.hypot(...d);
      let corr = 0;
      if (geo) { const ae = azEl(x, sp); corr = tropo(ae.el, geo.h) + (nav.iono ? klobuchar(nav.iono, geo.lat, geo.lon, ae.az, Math.max(ae.el, 0), ep.sow) : 0); s.el = ae.el; }
      y.push(s.pr + C * st.clk - corr - (rho + b[s.sys]));
      H.push([-d[0] / rho, -d[1] / rho, -d[2] / rho, ...sy.map((q) => (q === s.sys ? 1 : 0))]);
    }
    const m = H[0].length, N = Array.from({ length: m }, () => new Array(m).fill(0)), r = new Array(m).fill(0);
    H.forEach((h, k) => { for (let p = 0; p < m; p++) { r[p] += h[p] * y[k]; for (let q = 0; q < m; q++) N[p][q] += h[p] * h[q]; } });
    const dx = solveLin(N, r);
    if (dx.some((v) => !Number.isFinite(v))) return null;
    x = [x[0] + dx[0], x[1] + dx[1], x[2] + dx[2]]; sy.forEach((q, k) => { b[q] += dx[3 + k]; });
    res = y.map((v, k) => v - H[k].reduce((q, h, p) => q + h * dx[p], 0));
    trace?.push({ x: [...x], rms: Math.sqrt(y.reduce((q, v) => q + v * v, 0) / y.length) });   // rms AVANT ce pas
    if (it === 3) {                                    // première position utilisable : masque d'élévation
      sats = sats.filter((s) => s.el >= MASK);
      const s2 = systems();
      if (sats.length < 3 + s2.length + 1) return null;
      if (s2.length !== sy.length) { sy = s2; b = Object.fromEntries(sy.map((q) => [q, b[q]])); }
    }
    if (it > 4 && Math.hypot(dx[0], dx[1], dx[2]) < 1e-3) break;
  }
  return { x, res, n: sats.length, sys: sy, sats: sats.map((s) => `${s.sys}${String(s.prn).padStart(2, "0")}`) };
}

/**
 * Tout le journal : une solution par époque, chacune DEPUIS L'ORIGINE (aucune ne reprend la
 * précédente) ; on écarte les époques dont les résidus dépassent 100 m rms (aucune
 * contrainte sur la forme : pas de « rayon plausible », contrairement à la fenêtre
 * 6 000-6 500 km de build_gps_raw.py), puis on moyenne les positions (écart type par axe =
 * la dispersion d'une époque à l'autre). Les résidus mesurent l'accord entre les
 * pseudo-distances et la géométrie : quelques mètres si elle est juste, des kilomètres
 * si les satellites n'étaient pas là où leurs éléments les mettent. Renvoie null ou { x, sd: [m], n (époques gardées), tried,
 * rejected, resid: { rms, p95, n }, sats (moyenne par époque), systems, dist (|x|, m),
 * geo: {lat, lon, h}, fixGap (m, écart à la position calculée par le téléphone) }.
 */
export function solveLog(nav, log) {
  const sols = [];
  let tried = 0, rejected = 0;
  for (const ep of log.epochs) {
    tried++;
    const s = solveEpoch(nav, ep);
    if (!s) { rejected++; continue; }
    const rms = Math.sqrt(s.res.reduce((q, v) => q + v * v, 0) / s.res.length);
    if (!(rms < 100)) { rejected++; continue; }
    sols.push(s);
  }
  if (!sols.length) return null;
  const n = sols.length, x = [0, 1, 2].map((k) => sols.reduce((q, s) => q + s.x[k], 0) / n);
  const sd = [0, 1, 2].map((k) => Math.sqrt(sols.reduce((q, s) => q + (s.x[k] - x[k]) ** 2, 0) / Math.max(1, n - 1)));
  const all = sols.flatMap((s) => s.res.map(Math.abs)).sort((a, b) => a - b);
  const resid = { n: all.length, rms: Math.sqrt(all.reduce((q, v) => q + v * v, 0) / all.length), p95: all[Math.floor(0.95 * (all.length - 1))] };
  const systems = [...new Set(sols.flatMap((s) => s.sys))];
  let fixGap = null;
  // comparaison au fix de la PUCE GNSS du téléphone (GPS / GGA) ; à défaut, la position fusionnée ;
  // jamais la position réseau (NLP : antennes et Wi-Fi, pas un calcul GNSS)
  const gnssFix = log.fixes.filter((f) => f.src === "GPS" || f.src === "GGA"), fx = gnssFix.length ? gnssFix : log.fixes.filter((f) => f.src === "FLP");
  if (fx.length) {
    const F = [0, 1, 2].map((k) => fx.reduce((q, f) => q + ecef(f.lat, f.lon, f.h)[k], 0) / fx.length);
    fixGap = Math.hypot(F[0] - x[0], F[1] - x[1], F[2] - x[2]);
  }
  return { x, sd, n, tried, rejected, resid, sats: sols.reduce((q, s) => q + s.n, 0) / n, systems, dist: Math.hypot(...x), geo: geodetic(x), fixGap };
}

/**
 * Le point du visiteur face aux stations, avec les ajustements du panneau (formule de la
 * sphère |xⱼ − c| = R, rawlogic.earthFromStations) : rayon de la sphère avec et sans lui,
 * et sa distance (m) à la surface que les stations dessinent, c.-à-d. la sphère plus
 * l'aplatissement lu dans leurs résidus, R + a − Δ·sin²φ (φ géocentrique). Rien n'est
 * ajusté sur le visiteur : il est comparé à ce que les stations ont donné seules.
 * `earth` = earthFromStations(stations), `withYou` = idem stations + lui, `centre` = c.
 */
export function youVsStations(you, earth, withYou, centre) {
  const d = Math.hypot(you.x[0] - centre[0], you.x[1] - centre[1], you.x[2] - centre[2]);
  const lat = Math.atan2(you.x[2], Math.hypot(you.x[0], you.x[1]));
  const surf = earth.R + (earth.a - earth.delta * Math.sin(lat) ** 2) * 1000;
  return { toCentre: d, aboveSurface: d - surf, latc: lat / D2R, R: earth.R, Rwith: withYou.R, seWith: withYou.seR };
}
