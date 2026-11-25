// Rayon apparent sans k (2026-10-04) : tableau des sept lignes McDonald (distance
// EDM, écart à la corde des coordonnées, excès, ρ) et lecture des 45 paires.
// Les nombres viennent de logic.js ; ici, seulement l'affichage.
import { mcdRows, kozRows, stats } from "./logic.js";
import { MCD, KOZ, BALDY_H_FT, FT } from "../../data/presets/surv-recip.js";

export function fillRapp(root, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const M = mcdRows(MCD, BALDY_H_FT, FT), K = kozRows(KOZ);
  const tb = root.querySelector("#sv-tbRapp");
  if (tb) tb.innerHTML = M.map((r) => `<tr><td>${r.to}</td><td>${nf(r.sKm, 3)} km</td><td>${(r.dEdm * 100).toFixed(1).replace("-", "−")} cm</td>` +
    `<td>${nf(r.epsArcsec / 60, 1)}′</td><td class="g"><b>${nf(r.R)} km</b></td></tr>`).join("");
  const host = root.querySelector("#sv-readRapp");
  if (!host) return;
  const m = M.map((r) => r.R), k = stats(K.map((r) => r.R)), all = M.length + K.length;
  const pos = [...M, ...K].filter((r) => r.epsArcsec > 0).length;
  host.innerHTML =
    `<span>${tr("sv-rapp-read-n", "{p} of {n} sums above 180°").replace("{p}", pos).replace("{n}", all)}</span>` +
    `<span class="g">${tr("sv-rapp-read-mcd", "McDonald, > 30 m up: ρ = {lo} – {hi} km").replace("{lo}", nf(Math.min(...m))).replace("{hi}", nf(Math.max(...m)))}</span>` +
    `<span>${tr("sv-rapp-read-koz", "1.5 m above the ground: median {v} km ({n} lines)").replace("{v}", nf(k.med)).replace("{n}", K.length)}</span>` +
    `<span class="f">${tr("sv-rapp-read-plane", "plane: ρ = ∞")}</span>`;
}
