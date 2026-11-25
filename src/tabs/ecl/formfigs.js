// Schéma de formule de l'onglet ecl : le bilan de la séléniélie (2026-10-04).
// Barres en minutes d'arc, calculées (selenBudget) pour Brest, 31 décembre 2028.
import { FIG } from "../../core/fig.js";
import { axesStamp, drawFormulaFigs as drawAll } from "../../core/formfigs.js";
import { SELEN_CASES, selenBudget } from "./logic.js";

const C = FIG.C;
let memo = null;
export const selenBudgetMemo = () => (memo ||= selenBudget(SELEN_CASES.brest2028));

function figBudget(tr) {
  const b = selenBudgetMemo(), am = (d) => d * 60;
  const f = FIG.make({ w: 380, h: 230, alt: tr("fx-sel-alt", "A running total in arcminutes. The Moon's parallax takes about 58 off; the Moon sitting high in the shadow gives back about 22; the two half-discs give back 32. Without air the total stays 4 arcminutes short of zero. Refraction adds about 59 and the total ends 54 above zero") });
  const steps = [
    [tr("fx-sel-pi", "−π (parallax)"), -am(b.pi), C.flat],
    [tr("fx-sel-d", "+δ (place in shadow)"), am(b.delta), C.globe],
    [tr("fx-sel-s", "+s☉ + s☾ (half-discs)"), am(b.sdS + b.sdM), C.globe],
    [tr("fx-sel-na", "= without air"), null, C.ink],
    [tr("fx-sel-r", "+ρ☉ + ρ☾ (refraction)"), am(b.rhoS + b.rhoM), C.sea],
    [tr("fx-sel-a", "= with air"), null, C.ink],
  ];
  const X0 = 150, X1 = 372, lo = -70, hi = 70, X = (v) => X0 + (v - lo) / (hi - lo) * (X1 - X0);
  for (const v of [-60, -30, 0, 30, 60]) { f.dash(X(v), 22, X(v), 196, { c: v ? "#e7e3da" : C.soft, w: v ? 1 : 1.4 }); f.note(X(v), 210, `${v > 0 ? "+" : ""}${v}′`, { anchor: "middle", size: 9.5 }); }
  let run = 0;
  steps.forEach(([lab, v, col], i) => {
    const y = 34 + i * 29, from = v == null ? 0 : run, to = v == null ? run : run + v;
    f.path(`M${X(Math.min(from, to))} ${y - 8} H${X(Math.max(from, to))} V${y + 8} H${X(Math.min(from, to))} Z`, { c: col, w: 1, fill: v == null ? (run > 0 ? "#c7e6cf" : "#f3c9bd") : "#f4efe4" });
    f.note(X0 - 6, y + 4, lab, { anchor: "end", size: 10, c: v == null ? C.ink : C.soft });
    f.note(X(to) + (to >= from ? 4 : -4), y + 4, `${(v ?? run) >= 0 ? "+" : "−"}${Math.abs(v ?? run).toFixed(0)}′`, { anchor: to >= from ? "start" : "end", size: 9.5, c: col });
    if (v != null) run = to;
  });
  f.note(4, 226, tr("fx-sel-1", "sum of the two upper limbs' heights; both visible only above 0"), { size: 9.5 });
  axesStamp(f, tr, tr("fx-sel-st", "Brest, 31 Dec 2028"));
  return f;
}

export const FORMULA_FIGS = { eclFxSel: figBudget };
export function drawFormulaFigs(root, tr) { return drawAll(root, FORMULA_FIGS, tr, {}, "ecl"); }
