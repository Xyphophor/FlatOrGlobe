// Formats des nombres de l'onglet curv, dans la langue de la page (0,51° en
// français), anglais hors navigateur (tests).
const D2R = Math.PI / 180;
const lang = () => (typeof document !== "undefined" && document.documentElement?.lang) || "en";
export const num = (x, d = 0) => x.toLocaleString(lang(), { minimumFractionDigits: d, maximumFractionDigits: d });
const sig = (x, n) => { const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(x)))); return num(+x.toPrecision(n), Math.min(d, 6)); };
export const fmtH = (h) => h >= 100000 ? `${num(h / 1000)} km` : h >= 10 ? `${num(h)} m` : `${sig(h, 2)} m`;
export const fmtLen = (m) => m < 1 ? `${sig(m * 100, 2)} cm` : m < 1000 ? `${sig(m, 3)} m` : `${sig(m / 1000, 3)} km`;
export const fmtAng = (rad) => { const d = Math.abs(rad) / D2R, s = rad < 0 ? "−" : "";
  return d >= 1 ? `${s}${num(d, 2)}°` : d * 60 >= 1 ? `${s}${num(d * 60, 1)}′` : `${s}${num(d * 3600, 1)}″`; };
export const fmtPx = (px) => { const a = Math.abs(px); if (a < 0.005) return `${num(0, 1)} px`;
  return `${px < 0 ? "−" : ""}${num(a, a >= 10 ? 0 : a >= 0.1 ? 1 : 2)} px`; };
export const fmtPct = (f) => `${f < 0 ? "−" : ""}${num(Math.abs(f) * 100, Math.abs(f) >= 0.01 ? 2 : 3)} %`;
