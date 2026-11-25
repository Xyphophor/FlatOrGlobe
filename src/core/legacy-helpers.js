// Petits helpers globaux du legacy (flat-or-globe-2.20.0.html L14130-14160,
// L15837 expNum, L22902-22905 dipSetRate/dipHm), portés VERBATIM pour les
// moteurs d'onglet portés tels quels (src/tabs/<clé>/<clé>-legacy.js).
export const $ = (id) => document.getElementById(id);
export const DEG = (r) => (r * 180) / Math.PI;
export const RAD = (d) => (d * Math.PI) / 180;
export function fillPresetSelect(id, presets, placeholder, labelOf) {
  const sel = $(id); if (!sel) return;
  const entries = Array.isArray(presets) ? presets.map((v, i) => [String(i), v]) : Object.entries(presets);
  sel.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : "") +
    entries.map(([k, v]) => `<option value="${k}">${labelOf ? labelOf(v) : v.label}</option>`).join("");
}
export function fmtAngle(rad) {
  const d = DEG(rad), arcmin = d * 60, sign = d < 0 ? "−" : "";
  return `${sign}${Math.abs(d).toFixed(4)}°  (${sign}${Math.abs(arcmin).toFixed(1)}′)`;
}
export function fmtDist(m) { return m >= 1000 ? (m / 1000).toFixed(m >= 10000 ? 0 : 1) + " km" : m.toFixed(0) + " m"; }
export function fmtDiff(rad) {
  const d = DEG(rad), am = d * 60, sign = d < 0 ? "−" : "+";
  return `${sign}${Math.abs(d).toFixed(4)}°  (${sign}${Math.abs(am).toFixed(1)}′)`;
}
export function expNum(id, def) { const v = parseFloat($(id)?.value); return Number.isFinite(v) ? v : def; }
export const DIP_SUNRATE = 15.041; // deg/h
export const dipSetRate = (latDeg) => DIP_SUNRATE * Math.cos((latDeg * Math.PI) / 180);
export const dipHm = (h) => (h < 10 ? h.toFixed(1) : Math.round(h).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + " m";
