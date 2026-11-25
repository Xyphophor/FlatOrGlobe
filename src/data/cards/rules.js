// Cartes autonomes de l'onglet rules (2026-11-25) : une par formule. Textes : src/i18n/<langue>/rules-cards.json.
export const SOURCES = {
  hirt: "C. Hirt et al., J. Geophys. Res. 115 (2010) D21102: the refraction coefficient k ≈ 0.13 on average, strongly variable near the ground.",
  gum: "JCGM 100:2008, Guide to the expression of uncertainty in measurement (GUM): 99.7 % of a normal distribution within ±3σ.",
  birge: "R. T. Birge, Phys. Rev. 40 (1932) 207: the ratio √(χ²/(N − 1)).",
};

export const CARDS = [
  { id: "refr", figs: ["rulesFxRefr"], fx: ["rules-fx-refr"], fxFigs: false, src: ["hirt"] },
  { id: "excl", figs: ["rulesFxExcl"], fx: ["rules-fx-excl"], fxFigs: false, src: ["gum"] },
  { id: "wmean", figs: ["rulesFxWmean"], fx: ["rules-fx-wmean"], fxFigs: false, src: ["gum", "birge"] },
];
