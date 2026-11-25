// Les réglages partagés de la page, ex-#radius/#kcoef/#refr du formulaire
// global de l'onglet sim (legacy L7054-7063). Dans le legacy, un seul
// document DOM contenait tous les onglets à la fois, donc `$("radius")`
// depuis n'importe quel onglet retombait sur le même <input> : R était
// "shared by tabs 1 [sim] and 2 [hh], and read from tab 1's #radius like
// every other tab [that reads it]" ; k/refr de même, mais seulement pour
// sim/hh/obs (voir plus bas). Ici chaque onglet monte SON PROPRE DOM à la
// demande (src/main.js), donc `document.getElementById("radius")` ne
// retrouve plus rien si sim n'a jamais été ouvert -- ce module est le
// remplaçant : un état en mémoire, indépendant du montage, que sim écrit
// et que les autres onglets concernés lisent.
//
// CE QUI EST VRAIMENT PARTAGÉ (vérifié contre le legacy, pas supposé) :
// - R (rayon, km) : sim (tab 1, écrit), hh (tab 2, lit/écrit), twi
//   (aube/crépuscule, lit -- `function twiR(){ ... $("radius") ... }`,
//   L23527). Aucun autre onglet ne lit #radius.
// - k (coefficient de réfraction) + refr (case à cocher) : sim (écrit),
//   hh (lit/écrit, "remote control" du legacy -- hhSyncRefrFromGlobal(),
//   L15707), obs (lit, ANDed avec sa propre case #obsRefr -- L1142-1145 :
//   "#obsRefr is ANDed with #refr, it does not replace it").
// - ct, twi (k), azim, grav, mag : leur k et/ou leur R sont des CONSTANTES
//   fixes dans le legacy lui-même, PAS lues depuis #kcoef/#radius --
//   documenté explicitement pour ct ("WHY k IS 0.13 IN THIS FILE AND NOT
//   #kcoef", L28171, "Same decision ... as the twi and mag tabs") et
//   vérifié pour azim/grav (leurs constantes 6371/0.13 sont des littéraux
//   dans le legacy, jamais un `$("radius")`/`$("kcoef")`). Ne PAS les
//   raccorder ici : ce serait s'écarter du legacy, pas le suivre.
// refr: TRUE (2026-09-24). Dans le legacy la case #refr était décochée dans le
// HTML, mais sim appliquait son preset d'ouverture (Viériou : refr, k = 0,13)
// AU CHARGEMENT de la page -- tout le site démarrait donc réfraction active.
// Depuis la migration, sim n'est monté qu'à sa première ouverture : ouvrir
// obs directement laissait refr à false, et obs dessinait Soleil et crête
// SANS réfraction -- ~un demi-degré de désaccord avec ct au même instant, et
// les heures de contact de la prose ne tombaient plus. L'état par défaut est
// désormais celui que le legacy avait effectivement au démarrage.
const state = { R: 6371, k: 0.13, refr: true };
const subs = new Set();

export function getSettings() {
  return { ...state };
}
export function setR(km) {
  if (!Number.isFinite(km) || km <= 0) return;
  state.R = km;
  notify();
}
export function setK(k) {
  if (!Number.isFinite(k) || k < 0 || k >= 1) return;
  state.k = k;
  notify();
}
export function setRefr(on) {
  state.refr = !!on;
  notify();
}
/** S'abonner aux changements (sim écrit, hh/obs peuvent se redessiner sans être remontés). Retourne une fonction de désabonnement. */
export function subscribeSettings(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
function notify() {
  const snap = getSettings();
  for (const fn of subs) fn(snap);
}
