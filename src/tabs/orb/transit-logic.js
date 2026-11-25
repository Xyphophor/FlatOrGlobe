// Onglet orb : les passages de Vénus (epic37/UC04 ; 1769 le 2026-11-18, 1761 et 2012 le 2026-11-19). Calculs purs, testés
// (transit-logic.test.js). Les nombres : fog build orb-transit (src/data/presets/orb-transit.js) — le résumé de Newcomb (1891)
// pour 1761 et 1769, le fichier du contact III de venus2012.de pour 2012, chaque contact recalculé avec DE440.
import { TRANSIT_ROWS, TRANSIT_FITS } from "../../data/presets/orb-transit.js";

export const AU_IAU = 149597870.7;
export const YEARS = ["1761", "1769", "2012"];
// VT-2004 (ESO) : le résultat publié, les chronométrages n'étant plus en ligne (comparaison seulement)
export const ESO_2004 = { a: 149608708, sa: 11835, n: 4367 };
// le projet venus2012.de lui-même, pour le contact 3 (sa page de résultats) : notre réduction le retrouve
export const V2012_OWN_C3 = 158480000;

export function rows(year) {
  const R = TRANSIT_ROWS.map((r) => ({ contact: r[0], station: r[1], observer: r[2], gmt: r[3], lat: r[4], lon: r[5], phase: r[6], cls: r[7], res: r[8], shift: r[9],
    used: !!r[10], why: r[11], P: r[12], D: r[13], x: r[14], y: r[15], year: r[16] }));
  return year ? R.filter((r) => r.year === year) : R;
}
export const fits = () => TRANSIT_FITS;
export const fit = (year = "1769") => TRANSIT_FITS[year];
/** La pente du diagramme de Delisle : D = P·A_DE/A ; une pente 1 = l'unité de DE440. */
export const slope = (year = "1769") => AU_IAU / TRANSIT_FITS[year].a;
/** La pente qu'imposerait un Soleil à H km (la parallaxe grandit comme 1/H). */
export const slopeFor = (Hkm) => AU_IAU / Hkm;
/** Les stations d'un passage : une ligne par station, avec ses contacts. */
export function stations(year) {
  const m = new Map();
  for (const r of rows(year)) { const s = m.get(r.station) || { name: r.station, lat: r.lat, lon: r.lon, x: r.x, y: r.y, n: 0, contacts: new Set() }; s.n++; s.contacts.add(r.contact); m.set(r.station, s); }
  return [...m.values()];
}
