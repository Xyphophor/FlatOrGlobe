#!/usr/bin/env python3
"""Extrait, VERBATIM et dans l'ordre, un panneau du legacy
(flat-or-globe-2.20.0.html) vers src/data/prose/<tab>.js (flux de blocs)
et ses sources vers src/data/sources/<tab>.js. Outil de migration (epic02) ;
le flux est rendu par src/core/prose.js.

Usage : python3 research/extract_prose.py <tab> <next-tab> <src-prefix> [--no-sources]
  ex.   python3 research/extract_prose.py dist dip s3

v2 (2026-09-14) : parcours des éléments de PREMIER NIVEAU du panneau avec
html.parser ; tout élément non reconnu devient un bloc "raw" (HTML verbatim,
data-i18n retiré) -- plus rien n'est perdu (v1 sautait les SVG d'ouverture,
les grilles cnav-grid, les boutons, les figsym dans les formules...).

Blocs typés : eyebrow, h1, h2 (h2/h3.cnav-h2), lead (p.cnav-lead), notes
(p.notes), notes-block (div.notes), formula (lignes .ln avec ou sans
data-tex, hôte figsym éventuel, gloss), callout (+flat), fcap, figsym,
figkey (ul, swatches data-sw conservés), fold (details), exp (carte
d'expérience ; retombe en raw si sa forme n'est pas celle attendue),
table (typée quand le tbody est vide ou porte un id ; raw sinon), canvas,
xrefs (nav.xrefs -> clés data-xref), raw. Les <sup class="ref"> gardent
leur numéro ; les href #<prefix>-N deviennent #s-<tab>-nN (citations.js).
--no-sources : ne réécrit pas src/data/sources/<tab>.js (ids déjà curés).
"""
import json
import re
import sys
from html.parser import HTMLParser

tab, nxt, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
keep_sources = "--no-sources" in sys.argv
src = open("legacy/flat-or-globe-2.20.0.html", encoding="utf-8").read()
seg = src[src.index(f'id="tab-{tab}"'):src.index(f'id="tab-{nxt}"')]
seg = seg[seg.index(">") + 1:seg.rindex("</div>")]          # intérieur du panneau
seg = re.sub(r"<!--.*?-->", "", seg, flags=re.S)
seg = re.sub(r'href="#%s-(\d+)"' % re.escape(prefix), r'href="#s-%s-n\1"' % tab, seg)

# --- découpe en éléments de premier niveau (les blocs .srcs sont extraits
#     comme sources et retirés du flux, où qu'ils soient dans le panneau) ---
body = seg
VOID = {"input", "br", "img", "hr", "meta", "link", "wbr", "source", "col"}
class Top(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=False); s.depth = 0; s.items = []; s.start = None; s.tag = None; s.attrs = None
    def _off(s):
        l, c = s.getpos(); return s.lineoff[l - 1] + c
    def handle_starttag(s, tag, attrs):
        if tag in VOID:
            if s.depth == 0: s.items.append((tag, dict(attrs), s._off(), s._off() + len(s.get_starttag_text())))
            return
        if s.depth == 0: s.start, s.tag, s.attrs = s._off(), tag, dict(attrs)
        s.depth += 1
    def handle_startendtag(s, tag, attrs):
        if s.depth == 0: s.items.append((tag, dict(attrs), s._off(), s._off() + len(s.get_starttag_text())))
    def handle_endtag(s, tag):
        if tag in VOID: return
        s.depth -= 1
        if s.depth == 0:
            end = s._off() + len(tag) + 3
            s.items.append((s.tag, s.attrs, s.start, end))
def top_items(frag):
    p = Top(); p.lineoff = [0]
    for line in frag.split("\n"): p.lineoff.append(p.lineoff[-1] + len(line) + 1)
    p.feed(frag); p.close()
    return p.items

def clean(h):
    h = re.sub(r'\s+data-i18n="[^"]*"', "", h)      # les clés i18n du legacy ne sortent que dans "k"
    h = re.sub(r'<span class="refnum">.*?</span>', "", h)
    return re.sub(r"\s+", " ", h).strip()
def inner_of(outer):
    return outer[outer.index(">") + 1:outer.rindex("<")]
def inner(s, tagname, start=0):
    """contenu entre la balise ouvrante à `start` et sa fermante (imbrication du même tag gérée)."""
    depth = 0
    for m in re.finditer(r"<(/?)%s\b[^>]*>" % tagname, s[start:]):
        if m.group(1) == "":
            depth += 1
            if depth == 1: open_end = start + m.end()
        else:
            depth -= 1
            if depth == 0: return s[open_end:start + m.start()]
    return s[start:]

items = top_items(body)
srcs = "".join(body[a:b] for tag, attrs, a, b in items if tag == "div" and (attrs.get("class") or "").startswith("srcs"))
if not keep_sources:
    li_items = re.findall(r'<li(?: id="([^"]*)")?>(.*?)</li>', srcs, re.S)
    cited, reading = [], []
    for i, h in li_items:
        h = re.sub(r'<span class="refnum">.*?</span>', "", h)
        h = re.sub(r"\s+", " ", h).strip()
        if i and re.match(r"%s-\d+$" % re.escape(prefix), i):
            cited.append(("n" + i.split("-")[-1], h))
        else:
            reading.append(h)
    js = f"// Sources de l'onglet {tab}, portées VERBATIM du bloc .srcs du legacy\n// (ids n1..nN = numéros d'origine ; extrait par research/extract_prose.py).\nexport const SOURCES = [\n"
    for i, h in cited:
        js += f"  {{ id: {json.dumps(i)}, html: {json.dumps(h, ensure_ascii=False)} }},\n"
    js += "];\n\nexport const READING = [\n" + "".join(f"  {{ html: {json.dumps(h, ensure_ascii=False)} }},\n" for h in reading) + "];\n"
    open(f"src/data/sources/{tab}.js", "w", encoding="utf-8").write(js)
else:
    cited = reading = []

def parse(frag, items):
    blocks = []
    for tag, attrs, a, b in items:
      outer = frag[a:b]
      cl = attrs.get("class", "") or ""
      n0 = len(blocks)
      if tag == "div" and cl.startswith("srcs") and (not keep_sources or cl == "srcs"):
          # -> sources/<tab>.js ; un bloc-emplacement garde la POSITION du bloc dans le panneau
          blocks.append({"t": "reading" if "reading" in cl else "sources"}); continue
      bid = attrs.get("id", "") or ""
      c = inner_of(outer) if tag not in VOID else ""
      if tag == "div" and "eyebrow" in cl: blocks.append({"t": "eyebrow", "html": clean(c)})
      elif tag == "h1": blocks.append({"t": "h1", "html": clean(c)})
      elif tag == "h2" or (tag == "h3" and "cnav-h2" in cl): blocks.append({"t": "h2", "html": clean(c)})
      elif tag == "p" and "cnav-lead" in cl: blocks.append({"t": "lead", "html": clean(c), "opener": "opener" in cl})
      elif tag == "p" and cl == "notes": blocks.append({"t": "notes", "html": clean(c)})
      elif tag == "div" and cl.startswith("formula"):
          big = inner(c, "div", c.index('class="big"') - 5) if 'class="big"' in c else ""
          lns = re.findall(r'<div class="ln">(.*?)</div>', big, re.S) or [big]
          lines = []
          for ln in lns:
              texes = re.findall(r'<span class="tex" data-tex="([^"]*)"[^>]*>(.*?)</span>', ln, re.S)
              if len(texes) == 1 and clean(re.sub(r'<span class="tex".*?</span>', "", ln, flags=re.S)) == "":
                  lines.append({"tex": texes[0][0].replace("&quot;", '"'), "fallback": clean(texes[0][1])})
              else:
                  lines.append({"tex": None, "fallback": clean(ln)})   # ligne mixte / texte nu : rendue telle quelle
          # [^>]* : le legacy porte souvent data-i18n="..." après class="gloss"
          # (epic07/UC01, 2026-09-16 -- cette regex ratait alors TOUT gloss
          # avec un attribut en plus, soit 61 des 64 .formula du legacy :
          # seuls les 3 gloss "nus" de obs survivaient, voir tasks/epic07/UC01.org).
          gl = re.search(r'<div class="gloss"[^>]*>(.*?)</div>\s*$', c, re.S)
          fg = re.search(r'<div class="figsym" id="([^"]*)"', c)
          blocks.append({"t": "formula", "flat": "flat" in cl or "border-left-color:var(--flat)" in outer,
                         "style": (re.search(r'style="([^"]*)"', outer.split(">")[0]) or [None, ""])[1],
                         "lines": lines, "fig": fg.group(1) if fg else None, "gloss": clean(gl.group(1)) if gl else ""})
      elif tag == "div" and cl.startswith("callout"): blocks.append({"t": "callout", "flat": "flatc" in cl, "html": clean(c)})
      elif tag == "div" and cl == "notes":
          ps = re.findall(r"<p>(.*?)</p>", c, re.S)
          blocks.append({"t": "notes-block", "paras": [clean(x) for x in ps] or [clean(c)]})
      elif tag == "table":
          tb = re.search(r'<tbody([^>]*)>(.*?)</tbody>', c, re.S)
          body_rows = re.sub(r"<thead>.*?</thead>", "", c, flags=re.S)
          body_rows = re.sub(r"<tbody[^>]*>\s*</tbody>", "", body_rows, flags=re.S)
          static_rows = ("<tr" in body_rows) and not (tb and 'id="' in tb.group(1))
          if static_rows:
              blocks.append({"t": "raw", "html": clean(outer)})       # tableau statique : verbatim
          else:
              cap = re.search(r"<caption[^>]*>(.*?)</caption>", c, re.S); th = re.findall(r"<th(?:\s[^>]*)?>(.*?)</th>", c, re.S)
              tbid = re.search(r'id="([^"]*)"', tb.group(1)) if tb else None
              blocks.append({"t": "table", "id": bid, "tbody": tbid.group(1) if tbid else "", "caption": clean(cap.group(1)) if cap else "", "head": [clean(x) for x in th]})
      elif tag == "canvas": blocks.append({"t": "canvas", "id": bid})
      elif tag == "div" and "figsym" in cl: blocks.append({"t": "figsym", "id": bid})
      elif tag == "div" and "fcap" in cl: blocks.append({"t": "fcap", "html": clean(c)})
      elif tag == "ul" and "figkey" in cl:
          blocks.append({"t": "figkey", "items": [clean(x) for x in re.findall(r"<li[^>]*>(.*?)</li>", c, re.S)]})
      elif tag == "details":
          sm = re.search(r"<summary[^>]*>(.*?)</summary>", c, re.S)
          rest = c[sm.end():] if sm else c
          blocks.append({"t": "fold", "q": "q" in cl.split(), "summary": clean(sm.group(1)) if sm else "", "html": clean(rest)})   # intérieur verbatim (tables, p...)
      elif tag == "div" and cl == "exp" and 'class="exp-h"' in c and 'class="exp-out"' in c and "<select" not in c and "<button" not in c:
          g = lambda k: (re.search(r'class="%s"[^>]*>(.*?)</(?:div|p)>' % k, c, re.S) or [None, ""])[1]
          blocks.append({"t": "exp", "h": clean(g("exp-h")), "title": clean(g("exp-t")), "lead": clean(g("exp-lead")),
                         "iv": clean(g("exp-var iv")), "dv": clean(g("exp-var dv")),
                         "meta": [clean(x) for x in re.findall(r'<p class="exp-meta">(.*?)</p>', c, re.S)],
                         "inputs": [[i, clean(l), a] for i, l, a in re.findall(r'<label[^>]*for="([^"]*)"[^>]*>(.*?)</label>\s*<input([^>]*)>', c, re.S)]
                                   or [[re.search(r'id="([^"]*)"', a).group(1), clean(l), a] for l, a in re.findall(r'<label[^>]*>(.*?)</label>\s*<input([^>]*)>', c, re.S)],
                         "out": (re.search(r'class="exp-out" id="([^"]*)"', c) or re.search(r'id="([^"]*)" class="exp-out"', c) or [None, None])[1],
                         "verdict": (re.search(r'class="exp-verdict" id="([^"]*)"', c) or re.search(r'id="([^"]*)" class="exp-verdict"', c) or [None, None])[1]})
      elif tag == "nav" and "xrefs" in cl:
          blocks.append({"t": "xrefs", "keys": re.findall(r'data-xref="([^"]*)"', c), "wide": "xrefs-wide" in cl})
      elif tag == "section":
          inner_html = inner_of(outer)
          blocks.append({"t": "section", "id": bid, "class": cl, "blocks": parse(inner_html, top_items(inner_html))})
      else:
          blocks.append({"t": "raw", "tag": tag, "class": cl, "id": bid, "html": clean(outer) if "<svg" not in outer else re.sub(r'\s+data-i18n="[^"]*"', "", re.sub(r'<span class="refnum">.*?</span>', "", outer)).strip()})
      # clé data-i18n du legacy (hash ou id lisible) : le pont vers I18N.fr/de/it
      # du legacy pour l'epic04 -- jamais rendue, seulement conservée
      if len(blocks) > n0 and attrs.get("data-i18n") and blocks[-1]["t"] != "raw":
          blocks[-1]["k"] = attrs["data-i18n"]
    return blocks

blocks = parse(body, items)

open(f"src/data/prose/{tab}.js", "w", encoding="utf-8").write(
    f"// Prose de l'onglet {tab}, extraite VERBATIM et dans l'ordre du panneau\n// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.\n"
    f"export const PROSE = {json.dumps(blocks, ensure_ascii=False, indent=1)};\n")
print(tab, len(blocks), "blocks;", len(cited), "sources;", len(reading), "reading")
print([b["t"] + ("(" + (b.get("class") or b.get("tag") or "") + ")" if b["t"] == "raw" else "") for b in blocks])
