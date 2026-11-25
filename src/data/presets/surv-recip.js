// Angles zénithaux réciproques ET distances EDM, telles que J. Kozlowski les
// tabule dans « Zenith Angle Projects » (PDF hébergé par W. Bislin,
// 2004-04 Zenith Angle Projects Jesse Kozlowski.pdf, 4 pages ; saisie
// 2026-10-04). Colonnes du PDF : DELTA XYZ (corde tirée des coordonnées)
// puis EDM SLOPE (distance inclinée MESURÉE par l'instrument) ; on ne garde
// que la seconde -- la première a vu l'ellipsoïde.
//
// MCD : les sept lignes NGS de 1977 autour de l'observatoire McDonald
// (station BALDY, 8 380,889 ft), les mêmes que SV_ZEN, avec la distance EDM
// au millimètre, la corde des coordonnées (pour montrer qu'elle n'est pas
// réduite au niveau de la mer : les deux concordent au centimètre) et
// l'altitude orthométrique de l'autre extrémité (pieds).
//
// KOZ : les lignes de Kozlowski où l'instrument a MESURÉ la distance
// (stations totales Trimble S7/S8 ; bases d'étalonnage EDM du NGS, Crows
// Woods, Route 206 au quart de mille, N40 W75). Visées à 1,4-1,8 m du sol.
// u = 1 (mètres) ou FT (pied US). Les projets sans distance EDM (Route 206
// 2015-2016, Hainesport, Union Lake, Cooper River : distance GNSS seulement)
// ne sont pas ici.
//
// R206 : la ligne Route 206 MP 27-28 (1,54 km), sessions répétées sur les
// mêmes repères ; coordonnées GNSS ajustées (NAD83) du billet « One mile
// level line » (2016) ; moyennes à 0,01″ du tableau image du billet pour
// 2015-11-09 et 2016-11-17, PDF ailleurs. 2018 : repères refaits, autres
// coordonnées, distance EDM 5 270,409 ft.
export const FT = 1200 / 3937;
export const BALDY_H_FT = 8380.889;

export const MCD = [
  { to: "McElroy",     s: 32138.985, xyz: 32138.958, z1: "91 08 09", z2: "89 07 44", hFt: 6530.827 },
  { to: "Star RM 3",   s: 39476.328, xyz: 39476.260, z1: "91 03 44", z2: "89 15 34", hFt: 5980.033 },
  { to: "Vieja Reset", s: 52518.345, xyz: 52518.318, z1: "90 50 01", z2: "89 35 13", hFt: 6504.580 },
  { to: "Beard 2",     s: 66128.136, xyz: 66128.076, z1: "91 09 00", z2: "89 22 35", hFt: 5025.909 },
  { to: "Dipper",      s: 74361.946, xyz: 74361.904, z1: "90 49 49", z2: "89 45 41", hFt: 6110.880 },
  { to: "Ord 2 RM 3",  s: 76957.129, xyz: 76957.102, z1: "90 40 36", z2: "89 56 32", hFt: 6762.126 },
  { to: "Eagle 3",     s: 92882.032, xyz: 92882.083, z1: "90 32 21", z2: "90 12 12", hFt: 7505.891 },
];

export const KOZ = [
  { p: "Clarksville EDM CBL", date: "2016-03-08", lines: [
    [1099.996, 1, "89 40 31", "90 19 58"], [149.989, 1, "90 22 18", "89 37 51"], [275.008, 1, "89 43 56", "90 16 18"]] },
  { p: "Folsom EDM CBL (S8)", date: "2016-10-07", lines: [
    [149.981, 1, "90 21 16", "89 38 48"], [1000.220, 1, "90 35 41", "89 25 27"], [250.152, 1, "90 59 21", "89 00 47"],
    [500.121, 1, "90 33 15", "89 27 04"], [600.098, 1, "90 27 37", "89 32 47"], [99.983, 1, "89 59 04", "90 01 03"]] },
  { p: "Crows Woods", date: "2017-09-17", lines: [
    [359.472, FT, "89 43 01", "90 17 03"], [237.776, FT, "89 41 29", "90 18 33"], [418.447, FT, "90 25 11", "89 34 54"],
    [647.106, FT, "89 14 13", "90 45 55"], [779.105, FT, "89 29 51", "90 30 18"], [588.052, FT, "89 27 30", "90 32 36"]] },
  { p: "Folsom EDM CBL (S7)", date: "2017-10-26", lines: [
    [149.982, 1, "90 21 36", "89 38 31"], [400.128, 1, "90 46 43", "89 13 46"], [900.245, 1, "90 38 02", "89 22 35"],
    [1000.225, 1, "90 35 36", "89 24 59"], [850.245, 1, "90 37 59", "89 22 30"], [500.122, 1, "90 30 51", "89 29 28"],
    [99.983, 1, "90 13 58", "89 46 07"]] },
  { p: "Route 206, quarter-mile marks", date: "2018-09-30", lines: [
    [1317.618, FT, "90 11 36", "89 48 57"], [2635.006, FT, "90 05 18", "89 55 36"], [5270.409, FT, "89 55 31", "90 05 44"],
    [1317.399, FT, "89 58 44", "90 01 53"], [1318.202, FT, "89 56 41", "90 03 51"], [2635.430, FT, "89 44 55", "90 15 51"],
    [1317.247, FT, "89 33 01", "90 27 28"]] },
  { p: "Folsom EDM CBL", date: "2018-10-03", lines: [
    [149.979, 1, "90 20 38", "89 39 38"], [400.118, 1, "90 46 18", "89 14 50"], [1000.210, 1, "90 35 56", "89 25 06"],
    [250.153, 1, "91 01 29", "88 58 44"], [500.113, 1, "90 30 22", "89 29 54"], [600.096, 1, "90 28 36", "89 31 50"],
    [99.980, 1, "90 15 46", "89 44 19"]] },
  { p: "N40 W75 L-shape", date: "2018-10-30", lines: [
    [389.186, FT, "88 18 00", "91 42 06"], [505.744, FT, "89 45 41", "90 14 25"]] },
];

// repères 27 et 28 (2015-2016) puis ceux de 2018 : latitude, longitude géodésiques (° ′ ″, ouest négatif)
export const R206_MARKS = {
  y2016: [[40, 1, 16.23439, -74, 43, 56.02264], [40, 2, 5.37152, -74, 43, 44.87455]],
  y2018: [[40, 1, 18.37232, -74, 43, 55.54467], [40, 2, 9.67881, -74, 43, 43.88452]],
};
// z1 : de 27 vers 28 ; z2 : de 28 vers 27 ; hi : hauteurs d'instrument (m) aux deux bouts
export const R206 = [
  { date: "2015-11-09", z1: "90 00 10.67", z2: "90 01 00.17", hi: [1.687, 1.652], marks: "y2016", note: "6 × 2" },
  { date: "2016-11-06", z1: "90 00 22", z2: "90 00 04", hi: [5.66 * FT, 4.96 * FT], marks: "y2016" },
  { date: "2016-11-14", z1: "90 00 09", z2: "89 59 54", hi: [5.51 * FT, 4.78 * FT], marks: "y2016" },
  { date: "2016-11-17 A", time: "10:05", z1: "90 00 36.25", z2: "90 00 29.75", hi: [1.679, 1.457], marks: "y2016" },
  { date: "2016-11-17 B", time: "10:56", z1: "90 00 39.25", z2: "90 00 34.75", hi: [1.679, 1.457], marks: "y2016" },
  { date: "2016-11-17 C", time: "12:07", z1: "90 00 38.75", z2: "90 00 35.25", hi: [1.679, 1.457], marks: "y2016" },
  { date: "2016-11-17 D", time: "12:50", z1: "90 00 36.25", z2: "90 00 37.25", hi: [1.679, 1.457], marks: "y2016" },
  { date: "2016-11-17 E", time: "13:24", z1: "90 00 34.50", z2: "90 00 34.25", hi: [1.679, 1.457], marks: "y2016" },
  { date: "2016-11-17 F", time: "14:02", z1: "90 00 30.00", z2: "90 00 30.25", hi: [1.679, 1.457], marks: "y2016" },
  { date: "2018-09-30", z1: "89 55 31", z2: "90 05 44", hi: [5.325 * FT, 5.154 * FT], marks: "y2018" },
];
