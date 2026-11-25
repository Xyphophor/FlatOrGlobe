// Mouvement : préférence « réduire les animations » de l'utilisateur
// (epic06/UC04). Un onglet dont l'animation démarre toute seule la laisse
// à l'arrêt quand cette préférence est active ; le bouton lecture reste là.
export const reducedMotion = () => !!(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

// Export vidéo en cours (2026-10-07) : les boucles des animations ne redémarrent pas pendant ce temps
// (l'IntersectionObserver les relançait, elles se disputaient le canvas avec l'export, image saccadée).
let exportBusyFlag = false;
export const exportBusy = () => exportBusyFlag;
export function setExportBusy(v) { exportBusyFlag = !!v; }

// Pas d'une boucle à ~30 images/s dont la vitesse ne dépend pas de la
// cadence : renvoie le nombre de « cadres à 60 Hz » écoulés depuis le
// dernier dessin (0 = trop tôt, ne rien dessiner), plafonné à 5 pour
// qu'un onglet qui revient ne saute pas d'un coup.
export function frameStep(st, ts) {
  if (st.last && ts - st.last < 32) return 0;
  const n = st.last ? Math.min(5, (ts - st.last) / (1000 / 60)) : 1;
  st.last = ts;
  return n;
}

// Révélation d'une photo sur un modèle (propriétaire, 2026-10-06 : hh Bordighera, dip Caussols) : rien
// pendant que le modèle change ; une fois le dernier modèle posé, la photo arrive en fondu jusqu'à son
// opacité, reste, puis CLIGNOTE en tout-ou-rien (0 ↔ 100 %, sans transition) pour montrer à quel point
// elle tombe sur le dessin, et reste enfin à son opacité. u : secondes depuis le début de la révélation.
export const REVEAL = { fade: 2, hold: 1, blink: 0.4, blinks: 3, rest: 1.6 };
export const REVEAL_T = REVEAL.fade + REVEAL.hold + 2 * REVEAL.blinks * REVEAL.blink + REVEAL.rest;
export function revealAlpha(u, peak = 1) {
  const R = REVEAL;
  if (!(u > 0)) return 0;
  if (u < R.fade) { const x = u / R.fade; return peak * x * x * (3 - 2 * x); }
  const b = u - R.fade - R.hold;
  if (b < 0) return peak;
  if (b < 2 * R.blinks * R.blink) return Math.floor(b / R.blink) % 2 === 0 ? 0 : 1;   // éteinte, pleine, éteinte…
  return peak;
}
