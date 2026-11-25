#!/usr/bin/env python3
"""Réécrit des blocs de prose (anglais source + fr/es/pt/nl) d'un coup, à
partir d'un fichier Python/JSON { onglet: { clé: { en, fr, es, pt, nl } } }
(2026-09-25, revue de la prose). Vérifie, pour chaque langue, que les appels
de source (#s-<onglet>-nN) et les ids sont EXACTEMENT ceux de l'anglais, dans
le même ordre -- sinon refuse d'écrire. « [[n]] » dans un texte est remplacé
par l'appel de source n de l'onglet.

Usage : python3 research/rewrite_prose.py <fichier.py>  (le fichier définit REWRITES)
"""
import json, re, sys, runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROSE = ROOT / "src/data/prose"
I18N = ROOT / "src/i18n"
LANGS = ("fr", "es", "pt", "nl")


def refs(tab, s):
    return re.sub(r"\[\[(\d+)\]\]", lambda m: f'<sup class="ref"><a href="#s-{tab}-n{m.group(1)}">[{m.group(1)}]</a></sup>', s)


def sig(h):
    return re.findall(r"#s-[a-z]+-n\d+", h), re.findall(r'id="[^"]+"', h)


def load(tab):
    p = PROSE / f"{tab}.js"; s = p.read_text()
    m = re.search(r"(export\s+const\s+PROSE\s*=\s*)(\[.*\])(\s*;?\s*)$", s, re.S)
    arr = json.loads(m.group(2))
    assert json.dumps(arr, ensure_ascii=False, indent=1) == m.group(2), f"{tab}: le fichier ne se relit pas à l'identique"
    return p, s, m, arr


def find(arr, key):
    for b in arr:
        if b.get("k") == key:
            return b
        if "blocks" in b:
            r = find(b["blocks"], key)
            if r:
                return r
    return None


def main():
    rw = runpy.run_path(sys.argv[1])["REWRITES"]
    for tab, blocks in rw.items():
        p, s, m, arr = load(tab)
        dicts = {l: json.loads((I18N / l / f"{tab}-prose.json").read_text()) for l in LANGS}
        before = after = 0
        for key, tr in blocks.items():
            b = find(arr, key)
            assert b, f"{tab}: clé {key} introuvable"
            en = refs(tab, tr["en"])
            want = sig(en)
            for l in LANGS:
                got = sig(refs(tab, tr[l]))
                assert got == want, f"{tab}/{key}/{l} : appels de source ou ids différents de l'anglais {want} ≠ {got}"
            if "paras" in b:
                raise SystemExit(f"{tab}/{key} : bloc à paragraphes, non géré")
            wc = lambda h: len(re.sub(r"<[^>]+>", " ", h).split())
            before += wc(b["html"]); after += wc(en)
            b["html"] = en
            for l in LANGS:
                dicts[l][key] = refs(tab, tr[l])
        p.write_text(s[:m.start(2)] + json.dumps(arr, ensure_ascii=False, indent=1) + s[m.end(2):])
        for l in LANGS:
            (I18N / l / f"{tab}-prose.json").write_text(json.dumps(dicts[l], ensure_ascii=False, indent=2) + "\n")
        print(f"{tab}: {len(blocks)} bloc(s), anglais {before} → {after} mots ({(after - before) / max(1, before):+.0%})")


if __name__ == "__main__":
    main()
