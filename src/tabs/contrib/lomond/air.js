// Bass Rock dans la statistique « l'air qu'il faut à chaque modèle » de l'onglet ref (2026-11-13). Ce fichier
// appartient à la contribution : l'onglet ref le charge par le registre et ne nomme jamais la photo, pour que retirer
// la contribution retire aussi sa ligne et son texte.
import * as LOM from "../../../data/presets/contrib-lomond.js";
import { lomNumbers } from "./logic.js";
import { airRow, signed } from "../../../core/air-need.js";

/** Une seule photo : un test indépendant. */
export const series = false;

/** La ligne : le gradient moyen de 2 m à l'appareil, celui de GFS (fourchette des points et de la réanalyse), et ce
 * qu'il faut à chaque modèle (fourchette : les air − mer des modèles et f ± σ, la même marge aux deux). */
export function rows() {
  const L = lomNumbers(LOM.LOM_SITE, LOM.LOM_PHOTO, LOM.LOM_AIR, LOM.LOM_TRACED, LOM.LOM_SEAAIR, LOM.LOM_TRACED_AS), A = LOM.LOM_AIR, e = LOM.LOM_SITE.e;
  return [airRow({ id: "lom", kind: "hidden", h: e, dz: e - 2,
    day: { grad: A.grad, gLo: Math.min(A.gradLo, A.grad), gHi: Math.max(A.gradHi, A.grad) },
    globe: { grad: L.needG.mid, gLo: Math.min(L.symG.lo, L.needG.mid), gHi: Math.max(L.symG.hi, L.needG.mid) },
    flat: { grad: L.needF.mid, gLo: Math.min(L.symF.lo, L.needF.mid), gHi: Math.max(L.symF.hi, L.needF.mid) } })];
}

export const label = () => "Bass Rock";

/** Le nom dans la liste des photos du texte de ref. */
export const name = (lang) => (lang === "fr" ? "Bass Rock vu d'East Lomond (photo de KenRDKAB)" : "Bass Rock seen from East Lomond (KenRDKAB's photograph)");

/** Son paragraphe dans la section de ref. */
export function notes(lang, part) {
  const r = part.raw[0], g = (x) => signed(x * 100, 1, lang), z = (x) => signed(x, 1, lang);
  return lang === "fr"
    ? `<b>Bass Rock</b> (onglet des contributions). Le matin du 9 août 2023, GFS donne à la colonne ${g(r.day.grad)} K par 100 m entre 2 m et l'appareil. Il faut au globe ${g(r.globe.grad)}, z = ${z(r.globe.z)} ; au plan ${g(r.flat.grad)}, z = ${z(r.flat.z)}. Ici la hauteur cachée repose sur une famille d'airs : la colonne de GFS changée uniformément, avec pour marge les différences air − mer des modèles météo, les mêmes pour les deux modèles. Avec la différence air − mer la plus favorable au plan, il lui faut encore plus de 11 K par 100 m de chute.`
    : `<b>Bass Rock</b> (contributions tab). On the morning of 9 August 2023 GFS has the column at ${g(r.day.grad)} K per 100 m between 2 m and the camera. The globe needs ${g(r.globe.grad)}, z = ${z(r.globe.z)}; the plane ${g(r.flat.grad)}, z = ${z(r.flat.z)}. Here the hidden height rests on one family of airs: the GFS column changed uniformly, with the air − sea differences of the weather models as the margin, the same for both models. With the air − sea difference most favourable to it, the plane still needs a fall of more than 11 K per 100 m.`;
}
