import { test } from "node:test";
import assert from "node:assert/strict";
import { subRuns, hasSub } from "./subscript.js";

const show = (s) => subRuns(s).map((r) => (r.sub ? `[${r.t}]` : r.t)).join("");

test("indices d'une lettre : prose, formules en clair, lettres grecques", () => {
  assert.equal(show("z_A + z_B = 180°"), "z[A] + z[B] = 180°");
  assert.equal(show("R_eff = R/(1 − k)"), "R[eff] = R/(1 − k)");
  assert.equal(show("d²/2R_eff"), "d²/2R[eff]");
  assert.equal(show("±v/ω_s"), "±v/ω[s]");
  assert.equal(show("½ρC_D A v²"), "½ρC[D] A v²");
  assert.equal(show("ρ̇_k et δṫ_k"), "ρ̇[k] et δṫ[k]");
  assert.equal(show("F_A→B = −F_B→A"), "F[A→B] = −F[B→A]");
  assert.equal(show("θ_obs,app la"), "θ[obs,app] la");
  assert.equal(show("T_{sol} + 1"), "T[sol] + 1");
});

test("les identifiants restent tels quels", () => {
  for (const s of ["data_table", "rv_raw − berv", "research/cop_dem.py", "hmi.Ic_720s", "SA_TP017", "BRDC00IGS_R", "GM_j"]) {
    assert.equal(hasSub(s), false, s);
    assert.equal(show(s), s);
  }
});
