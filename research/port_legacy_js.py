#!/usr/bin/env python3
"""Porte un bloc JS du legacy (flat-or-globe-2.20.0.html) en module ES
src/tabs/<clé>/<clé>-legacy.js, VERBATIM : les déclarations restent telles
quelles ; les instructions de premier niveau (câblage d'écouteurs,
IIFE `(function wireX(){...})();`, `fillPresetSelect(...)`, lancement de
boucles rAF) sont déplacées dans une fonction exportée wire() -- le legacy
les exécutait au chargement de la page, l'onglet les exécute à mount().
Exporte aussi draw() (= <drawFn>) et stop() (annule <anim>.raf si donné).
Outil de migration (epic02/UC11).

Usage : python3 research/port_legacy_js.py <clé> <l1> <l2> <drawFn> [--anim OBJ] [--rafvar NAME]
        [--imports "import ...;"]   (chaînes d'import supplémentaires, une ligne)
"""
import re, sys
key, l1, l2, draw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
anim = sys.argv[sys.argv.index("--anim") + 1] if "--anim" in sys.argv else None
rafvar = sys.argv[sys.argv.index("--rafvar") + 1] if "--rafvar" in sys.argv else None
extra = sys.argv[sys.argv.index("--imports") + 1] if "--imports" in sys.argv else ""
lines = open("legacy/flat-or-globe-2.20.0.html", encoding="utf-8").read().split("\n")[l1 - 1:l2]

STMT = re.compile(r'^(\$\(|\[|Object\.|fillPresetSelect\(|orbit\(|magOrbitInit\(|requestAnimationFrame\(|\(function|document\.|window\.|drawKeySwatches\(|[a-zA-Z_]\w*\(.*\);\s*(//.*)?$)')
DECL = re.compile(r'^(const|let|var|function|class|/\*|//|\s*$|\})')
out, wire = [], []
i = 0
while i < len(lines):
    l = lines[i]
    if STMT.match(l) and not DECL.match(l):
        # instruction de premier niveau : on avale jusqu'à l'équilibre des parenthèses/accolades
        depth = 0; j = i; buf = []
        while True:
            s = lines[j]; buf.append(s)
            depth += s.count("(") + s.count("{") + s.count("[") - s.count(")") - s.count("}") - s.count("]")
            if depth <= 0 and (s.rstrip().endswith(";") or s.rstrip().endswith("}") or s.rstrip().endswith(")")): break
            j += 1
            if j >= len(lines): break
        blk = "\n".join(buf)
        m = re.match(r'^\(function (\w+)\(\)\{', blk)
        if m:  # IIFE nommée -> déclaration + appel dans wire()
            blk = re.sub(r'^\(function (\w+)\(\)\{', r'function \1(){', blk)
            blk = re.sub(r'\}\)\(\);\s*$', '}', blk)
            out.append(blk); wire.append(f"  {m.group(1)}();")
        else:
            wire.append("  " + blk.replace("\n", "\n  "))
        i = j + 1
        continue
    out.append(l); i += 1
body = "\n".join(out).rstrip()
head = f'''// Moteur de l'onglet {key}, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html L{l1}-{l2}) par research/port_legacy_js.py :
// figures canvas, tables, expérience, écouteurs. Il cherche ses hôtes par
// id dans le document (flux verbatim src/data/prose/{key}.js) et n'expose
// que wire()/draw()/stop(). Le legacy lisait #radius/#kcoef/#refr (le
// formulaire global de l'onglet sim) : ici ces lectures retombent sur les
// valeurs par défaut de la page (R = 6371 km, k = 0.13) quand l'élément
// n'existe pas -- voir legacy-helpers.js.
import {{ setupCanvas, niceLen }} from "../../core/canvas.js";
import {{ $, DEG, RAD, fillPresetSelect, fmtAngle, fmtDist, fmtDiff, expNum, dipSetRate, dipHm }} from "../../core/legacy-helpers.js";
{extra}

'''
tail = "\n\nexport function wire(){\n" + "\n".join(wire) + "\n}\n" + f"export function draw(){{ {draw}(); }}\n"
if anim:
    tail += f"export function stop(){{ if({anim}.raf){{ cancelAnimationFrame({anim}.raf); {anim}.raf = 0; }} {anim}.last = 0; }}\n"
elif rafvar:
    tail += f"export function stop(){{ if({rafvar}){{ cancelAnimationFrame({rafvar}); {rafvar} = null; }} }}\n"
else:
    tail += "export function stop(){}\n"
open(f"src/tabs/{key}/{key}-legacy.js", "w", encoding="utf-8").write(head + body + tail)
print(f"{key}: {len(out)} lines kept, {len(wire)} top-level statements moved into wire()")
for w in wire: print("   ", w.split("\n")[0][:100])
