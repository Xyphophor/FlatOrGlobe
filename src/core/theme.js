// Thème de la page (2026-10-16) : « auto » (prefers-color-scheme), « light » ou « dark », mémorisé dans le navigateur.
// Le choix pose html[data-theme] ; les palettes sont dans theme.css (Solarized à contraste élevé). Les figures restent claires
// dans les deux thèmes (voir theme.css). Un petit script en ligne dans index.html applique le choix AVANT le premier affichage
// (pas d'éclair clair avant le sombre) ; ce module fait de même au chargement et construit le sélecteur.
const KEY = "fog-theme";
export const THEMES = ["auto", "light", "dark"];

export function getTheme() {
  try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : "auto"; } catch { return "auto"; }
}
export function applyTheme(v) {
  const r = document.documentElement;
  if (v === "light" || v === "dark") r.setAttribute("data-theme", v); else r.removeAttribute("data-theme");
}
export function setTheme(v) {
  try { if (v === "light" || v === "dark") localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch { /* navigation privée : le choix vaut pour cette page */ }
  applyTheme(v);
}

/** Remplit <select id="themesel"> (options traduites par t) et le relie au thème. */
export function mountThemeSelect(sel, t) {
  if (!sel) return;
  const label = (v) => { const k = `theme-${v}`, s = t(k); return s && s !== k ? s : { auto: "Auto", light: "Light", dark: "Dark" }[v]; };
  sel.innerHTML = THEMES.map((v) => `<option value="${v}">${label(v)}</option>`).join("");
  sel.value = getTheme();
  const name = t("theme"); sel.setAttribute("aria-label", name && name !== "theme" ? name : "Theme");
  sel.addEventListener("change", () => setTheme(sel.value));
}

if (typeof document !== "undefined") applyTheme(getTheme());

/**
 * La palette des figures, en dur (2026-10-16, propriétaire : « tous les exports en mode clair quoi qu'il
 * arrive »). Les canvas qui lisaient une variable CSS sur <html> recevaient la palette SOMBRE en thème
 * sombre, à l'écran comme dans les exports (cartes, animations, images) ; ils passent tous par figColor,
 * qui ne lit pas le DOM. Mêmes valeurs que le bloc « palette des figures » de theme.css (theme.test.js).
 */
export const FIG_PALETTE = {
  "--paper": "#fbfaf7", "--surface": "#fff", "--muted-bg": "#f2f0ea",
  "--ink": "#151a21", "--ink-2": "#39414c", "--ink-soft": "#5b6470", "--ink-3": "#697381", "--on-ink": "#fff",
  "--line": "#d7d3c8", "--line-strong": "#b7b1a2",
  "--flat": "#b45309", "--flat-tint": "#f6ecdc", "--globe": "#0f766e", "--globe-tint": "#dcefec",
  "--obj1": "#1d4ed8", "--obj2": "#c2410c", "--obj3": "#6d28d9", "--ground": "#7a6a4f", "--warn": "#b91c1c",
  "--amber-bg": "#fdf0e6", "--amber-line": "#f0dcc4", "--blue-bg": "#eef2ff", "--blue-line": "#c9d4f7", "--hl-bg": "#fff7dc", "--hl-line": "#e3c96e",
};
/** Couleur d'une variable de la palette des figures, quel que soit le thème de la page. */
export const figColor = (name, fallback) => FIG_PALETTE[name] || fallback;
