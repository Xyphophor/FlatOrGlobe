// Extraits de code de l'onglet rx (« ⑤ The calculation, with code ») : sources ici, une
// par formule et par langage (fxN.py / fxN.c / fxN.go).
//   node scripts/rx-snippets/check.mjs          -> vérifie, puis réécrit src/tabs/rx/snippets.js
//   node scripts/rx-snippets/check.mjs --check  -> vérifie seulement
// Vérifier = assembler les huit extraits de chaque langage avec un petit programme de
// test, les exécuter (python3 + numpy, gcc, go) et comparer leurs nombres à ceux que le
// code de la page donne pour les mêmes entrées (ref.mjs). Un extrait affiché qui ne
// redonne pas le calcul de la page ne doit pas être publié.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { REF, pyData, cData, goData } from "./ref.mjs";

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, "../..");
const FX = [1, 2, 3, 4, 5, 6, 7, 8], LANGS = ["py", "c", "go"];
const src = (n, l) => readFileSync(join(HERE, `fx${n}.${l}`), "utf8");
const work = mkdtempSync(join(tmpdir(), "rx-snip-"));

const PY_TEST = `
import json
pr = pseudorange(ANDROID["time_nanos"], ANDROID["full_bias_nanos"], ANDROID["bias_nanos"], ANDROID["time_offset_nanos"], ANDROID["received_sv_time_nanos"])
s, E = sat_pos(G27, T)
x, b, rms = solve_epoch([(o["e"], o["pr"]) for o in SATS], SOW)
c, R = fit_sphere(P)
print(json.dumps({"pr": pr, "sat": s, "clk": sat_clock(G27, T, E), "x": list(x), "b": b, "rms": rms,
  "code": make_code(CODE["name"], CODE["date"], CODE["x"], CODE["q"], CODE["rms"], CODE["n"], CODE["systems"]),
  "sag1000": sagitta(6371e3, 1000e3), "R": R, "sigmaR": sigma_R(P, [1000] * len(P), c, R),
  "M0": radius_M(0), "N45": radius_N(45), "usable": usable(16399, 17, 1575420000), "tropo": tropo(30, 300)}))
`;
const C_TEST = `
#include <stdio.h>
int main(void) {
  double s[3], x[3], b, c[3], R, q[16], code_x[3] = {CODE_X[0], CODE_X[1], CODE_X[2]};
  char code[128];
  double pr = pseudorange(A_TIME, A_FULLBIAS, A_BIAS, A_OFFSET, A_SVTIME);
  double E = sat_pos(&G27, T_G27, MU_GPS, s);
  double clk = sat_clock(&G27, T_G27, E, MU_GPS);
  double rms = solve_epoch(SAT_EPH, SAT_PR, NSAT, SOW, x, &b);
  make_code("Ana", "20261002", code_x, 1000, 6.34, 25, "GE", code, sizeof code);
  fit_sphere(PTS, NP, c, &R);
  for (int i = 0; i < NP; i++) q[i] = 1000;
  printf("{\\"pr\\": %.17g, \\"sat\\": [%.17g, %.17g, %.17g], \\"clk\\": %.17g, \\"x\\": [%.17g, %.17g, %.17g], \\"b\\": %.17g, \\"rms\\": %.17g, \\"code\\": \\"%s\\", \\"sag1000\\": %.17g, \\"R\\": %.17g, \\"sigmaR\\": %.17g, \\"M0\\": %.17g, \\"N45\\": %.17g, \\"usable\\": %s, \\"tropo\\": %.17g}\\n",
    pr, s[0], s[1], s[2], clk, x[0], x[1], x[2], b, rms, code, sagitta(6371e3, 1000e3), R, sigma_R(PTS, q, NP, c, R), radius_M(0), radius_N(45),
    usable(16399, 17, 1575420000) ? "true" : "false", tropo(30, 300));
  return 0;
}
`;
const GO_TEST = `
func main() {
	pr := pseudorange(aTime, aFullBias, aBias, aOffset, aSvTime)
	s, E := satPos(g27, tG27, muGPS)
	x, b, rms := solveEpoch(satEph, satPr, sow)
	c, R := fitSphere(pts)
	q := make([]float64, len(pts))
	for i := range q {
		q[i] = 1000
	}
	out, _ := json.Marshal(map[string]any{"pr": pr, "sat": s, "clk": satClock(g27, tG27, E, muGPS), "x": x, "b": b, "rms": rms,
		"code": makeCode("Ana", "20261002", codeX, 1000, 6.34, 25, "GE"), "sag1000": sagitta(6371e3, 1000e3),
		"R": R, "sigmaR": sigmaR(pts, q, c, R), "M0": radiusM(0), "N45": radiusN(45), "usable": usable(16399, 17, 1575420000), "tropo": tropo(30, 300)})
	fmt.Println(string(out))
}
`;

function run(lang) {
  const all = FX.map((n) => src(n, lang)).join("\n");
  if (lang === "py") {
    const f = join(work, "t.py");
    writeFileSync(f, `${pyData()}\n${all}\n${PY_TEST}`);
    return execFileSync("python3", [f], { encoding: "utf8" });
  }
  if (lang === "c") {
    // les données utilisent Eph (fx2) : on les insère juste après
    const parts = FX.map((n) => src(n, "c"));
    const f = join(work, "t.c"), exe = join(work, "t");
    writeFileSync(f, `#define _GNU_SOURCE\n${parts.slice(0, 2).join("\n")}\n${cData()}\n${parts.slice(2).join("\n")}\n${C_TEST}`);
    execFileSync("gcc", ["-std=c99", "-D_DEFAULT_SOURCE", "-Wall", "-Wextra", "-Werror", "-Wno-unused-function", "-O2", "-o", exe, f, "-lm"], { encoding: "utf8" });
    return execFileSync(exe, { encoding: "utf8" });
  }
  const dir = join(work, "go");
  execFileSync("mkdir", ["-p", dir]);
  writeFileSync(join(dir, "main.go"), `package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\t"math"\n\t"strconv"\n)\n\n${all.replace(/^\/\/ import .*\n/gm, "")}\n${goData()}\n${GO_TEST}`);
  execFileSync("go", ["vet", "main.go"], { cwd: dir, encoding: "utf8", env: { ...process.env, GOFLAGS: "-mod=mod", GO111MODULE: "off" } });
  return execFileSync("go", ["run", "main.go"], { cwd: dir, encoding: "utf8", env: { ...process.env, GO111MODULE: "off" } });
}

// tolérances : relatives aux grandeurs (les langages font les mêmes opérations en double)
const close = (a, b, tol) => Math.abs(a - b) <= tol;
let bad = 0;
for (const lang of LANGS) {
  let o;
  try { o = JSON.parse(run(lang)); } catch (e) { console.log(`${lang}: FAILED to run\n${e.stdout || ""}${e.stderr || e.message}`); bad++; continue; }
  const checks = [
    ["pseudorange", close(o.pr, REF.pr, 1e-6)],
    ["satellite position", o.sat.every((v, k) => close(v, REF.sat[k], 1e-6))],
    ["satellite clock", close(o.clk, REF.clk, 1e-18)],
    // 5 cm : τ = (ρ − b)/c contient encore l'horloge du satellite (~10 µs × 4 km/s), comme dans la page
    ["solve from the origin", o.x.every((v, k) => close(v, REF.truth[k], 0.05)) && close(o.b, REF.bias, 0.05) && o.rms < 0.01],
    ["code", o.code === REF.code],
    ["sagitta", close(o.sag1000, REF.sag1000, 1e-6)],
    ["group sphere R", close(o.R, REF.R, 1e-3)],
    ["sigma R", close(o.sigmaR, REF.sigmaR, 1e-3 * REF.sigmaR)],
    ["M, N", close(o.M0, REF.M0, 1e-6) && close(o.N45, REF.N45, 1e-6)],
    ["usable", o.usable === true],
  ];
  const fails = checks.filter(([, ok]) => !ok).map(([k]) => k);
  console.log(`${lang}: ${fails.length ? `FAIL ${fails.join(", ")}` : "ok"}  (x off by ${o.x.map((v, k) => (v - REF.truth[k]).toExponential(1)).join(" ")} m, R ${o.R.toFixed(1)} vs ${REF.R.toFixed(1)}, σR ${o.sigmaR.toFixed(1)} vs ${REF.sigmaR.toFixed(1)}, tropo ${o.tropo.toFixed(3)})`);
  if (fails.length) { bad++; console.log(JSON.stringify(o)); }
}
if (bad) { console.log(`\n${bad} language(s) failed: snippets.js NOT written`); process.exit(1); }

if (!process.argv.includes("--check")) {
  const snip = Object.fromEntries(FX.map((n) => [`fx${n}`, Object.fromEntries(LANGS.map((l) => [l, src(n, l).trimEnd()]))]));
  writeFileSync(join(ROOT, "src/tabs/rx/snippets.js"),
    "// GÉNÉRÉ par scripts/rx-snippets/check.mjs depuis scripts/rx-snippets/fxN.{py,c,go} -- ne pas éditer ici.\n" +
    "// Chaque extrait a été exécuté et redonne les nombres du code de la page (userlogic.js, grouplogic.js).\n" +
    `export const SNIPPETS = ${JSON.stringify(snip, null, 1)};\n`);
  console.log("src/tabs/rx/snippets.js written");
}
