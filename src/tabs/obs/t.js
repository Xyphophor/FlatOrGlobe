// Traduction des textes que le JS de l'onglet obs dessine ou écrit lui-même
// (lectures, étiquettes de canvas, libellés des contrôles ajoutés par script).
// epic15/UC06 (2026-10-01) : avant, tout cela était en anglais dans toutes les
// langues. Clés dans src/i18n/<langue>/obs.json ; {x} = une valeur insérée.
let _t = (k, fb) => fb;
export const setT = (fn) => { _t = fn; };
export const T = (k, fb, vars) => {
  let s = _t(k, fb);
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(b);
  return s;
};
