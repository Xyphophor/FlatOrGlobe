// Prose de l'onglet dist, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Map ≠ territory · the azimuthal equidistant trap"
 },
 {
  "t": "h1",
  "html": "Two equal segments — until you flatten the Earth"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\" id=\"distOpenerFig\" style=\"margin:18px 0\">\n      <svg viewBox=\"0 0 900 340\" role=\"img\" aria-label=\"Where each of the three distance formulas comes from: central angle on a sphere, right triangle on a plate carree grid, planar law of cosines on the polar disk\">\n      <text x=\"16\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#0f766e\">A · GLOBE</text>\n      <text x=\"316\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\">B · CARTESIAN MAP</text>\n      <line x1=\"300\" y1=\"30\" x2=\"300\" y2=\"328\" stroke=\"#9aa1ab\" stroke-width=\"1\" stroke-dasharray=\"3 4\" opacity=\"0.5\"/>\n      <text x=\"616\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\">C · POLAR MAP (AE)</text>\n      <line x1=\"600\" y1=\"30\" x2=\"600\" y2=\"328\" stroke=\"#9aa1ab\" stroke-width=\"1\" stroke-dasharray=\"3 4\" opacity=\"0.5\"/>\n      <circle cx=\"150\" cy=\"175\" r=\"88\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.6\"/>\n      <circle cx=\"150\" cy=\"175\" r=\"88\" fill=\"#0f766e\" stroke=\"#0f766e\" stroke-width=\"0\" opacity=\"0.05\"/>\n      <line x1=\"150\" y1=\"175\" x2=\"89.9841\" y2=\"110.641\" stroke=\"#0f766e\" stroke-width=\"1.1\" stroke-dasharray=\"4 3\" opacity=\"0.8\"/>\n      <line x1=\"150\" y1=\"175\" x2=\"210.016\" y2=\"110.641\" stroke=\"#0f766e\" stroke-width=\"1.1\" stroke-dasharray=\"4 3\" opacity=\"0.8\"/>\n      <path d=\"M 89.9841 110.641 A 88 88 0 0 1 210.016 110.641\" fill=\"none\" stroke=\"#1d4ed8\" stroke-width=\"3.4\"/>\n      <path d=\"M 126.812 150.134 A 34 34 0 0 1 173.188 150.134\" fill=\"none\" stroke=\"#151a21\" stroke-width=\"1.2\"/>\n      <circle cx=\"150\" cy=\"175\" r=\"3\" fill=\"#151a21\"/>\n      <circle cx=\"89.9841\" cy=\"110.641\" r=\"3.5\" fill=\"#1d4ed8\"/>\n      <circle cx=\"210.016\" cy=\"110.641\" r=\"3.5\" fill=\"#1d4ed8\"/>\n      <text x=\"138\" y=\"189\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#151a21\" font-style=\"italic\" data-tex=\"O\">O</text>\n      <text x=\"150\" y=\"133\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"12\" fill=\"#151a21\" text-anchor=\"middle\" data-tex=\"\\sigma\">σ</text>\n      <text x=\"81.9841\" y=\"102.641\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#1d4ed8\" text-anchor=\"end\" data-tex=\"P_1\">P₁</text>\n      <text x=\"218.016\" y=\"102.641\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#1d4ed8\" data-tex=\"P_2\">P₂</text>\n      <text x=\"150\" y=\"78\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"12\" fill=\"#1d4ed8\" text-anchor=\"middle\" data-tex=\"\\text{arc} = R\\sigma\">arc = R σ</text>\n      <text x=\"150\" y=\"288\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#151a21\" text-anchor=\"middle\" data-tex=\"\\cos\\sigma = \\sin\\varphi_1\\sin\\varphi_2 + \\cos\\varphi_1\\cos\\varphi_2\\cos\\Delta\\lambda\">cos σ = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos Δλ</text>\n      <text x=\"150\" y=\"306\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">spherical law of cosines — no free parameter</text>\n      <text x=\"150\" y=\"324\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">the same R as every other tab on this page</text>\n      <line x1=\"330\" y1=\"96\" x2=\"330\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"1\" opacity=\"0.35\"/>\n      <line x1=\"370\" y1=\"96\" x2=\"370\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"410\" y1=\"96\" x2=\"410\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"450\" y1=\"96\" x2=\"450\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"490\" y1=\"96\" x2=\"490\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"530\" y1=\"96\" x2=\"530\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"570\" y1=\"96\" x2=\"570\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"1\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"96\" x2=\"570\" y2=\"96\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"133.5\" x2=\"570\" y2=\"133.5\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"171\" x2=\"570\" y2=\"171\" stroke=\"#b45309\" stroke-width=\"1\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"208.5\" x2=\"570\" y2=\"208.5\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"246\" x2=\"570\" y2=\"246\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <text x=\"564\" y=\"166\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#b45309\" text-anchor=\"end\">equator</text>\n      <line x1=\"373.2\" y1=\"129\" x2=\"517.2\" y2=\"129\" stroke=\"#5b6470\" stroke-width=\"1\" stroke-dasharray=\"4 3\"/>\n      <line x1=\"373.2\" y1=\"204\" x2=\"373.2\" y2=\"129\" stroke=\"#5b6470\" stroke-width=\"1\" stroke-dasharray=\"4 3\"/>\n      <polyline points=\"373.2,204 517.2,129\" fill=\"none\" stroke=\"#c2410c\" stroke-width=\"3.4\" stroke-linejoin=\"round\"/>\n      <circle cx=\"373.2\" cy=\"204\" r=\"3.5\" fill=\"#c2410c\"/>\n      <circle cx=\"517.2\" cy=\"129\" r=\"3.5\" fill=\"#c2410c\"/>\n      <path d=\"M 383.2 129 L 383.2 139 L 373.2 139\" fill=\"none\" stroke=\"#5b6470\" stroke-width=\"1\"/>\n      <text x=\"367.2\" y=\"170.5\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"end\" data-tex=\"R\\Delta\\varphi\">R Δφ</text>\n      <text x=\"445.2\" y=\"121\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"middle\" data-tex=\"R\\Delta\\lambda\">R Δλ</text>\n      <text x=\"450\" y=\"288\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#c2410c\" text-anchor=\"middle\" data-tex=\"d = R\\sqrt{\\Delta\\varphi^2 + \\Delta\\lambda^2}\">d = R √( Δφ² + Δλ² )</text>\n      <text x=\"450\" y=\"306\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">Pythagoras on the grid — every east–west degree</text>\n      <text x=\"450\" y=\"324\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">priced at its equatorial length, at every latitude</text>\n      <circle cx=\"750\" cy=\"175\" r=\"30.6667\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"0.6\" opacity=\"0.35\"/>\n      <circle cx=\"750\" cy=\"175\" r=\"61.3333\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"0.6\" opacity=\"0.35\"/>\n      <circle cx=\"750\" cy=\"175\" r=\"92\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"1.4\" opacity=\"0.8\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"842\" y2=\"175\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"829.674\" y2=\"129\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"796\" y2=\"95.3257\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"750\" y2=\"83\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"704\" y2=\"95.3257\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"670.326\" y2=\"129\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"658\" y2=\"175\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"670.326\" y2=\"221\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"704\" y2=\"254.674\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"750\" y2=\"267\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"796\" y2=\"254.674\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"829.674\" y2=\"221\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"718.848\" y2=\"135.127\" stroke=\"#151a21\" stroke-width=\"1.4\"/>\n      <line x1=\"750\" y1=\"175\" x2=\"816.697\" y2=\"122.89\" stroke=\"#151a21\" stroke-width=\"1.4\"/>\n      <polyline points=\"718.848,135.127 816.697,122.89\" fill=\"none\" stroke=\"#c2410c\" stroke-width=\"3.4\" stroke-linejoin=\"round\"/>\n      <path d=\"M 731.53 151.36 A 30 30 0 0 1 773.64 156.53\" fill=\"none\" stroke=\"#151a21\" stroke-width=\"1.2\"/>\n      <circle cx=\"750\" cy=\"175\" r=\"3.5\" fill=\"#151a21\"/>\n      <circle cx=\"718.848\" cy=\"135.127\" r=\"3.5\" fill=\"#c2410c\"/>\n      <circle cx=\"816.697\" cy=\"122.89\" r=\"3.5\" fill=\"#c2410c\"/>\n      <text x=\"750\" y=\"193\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#151a21\" text-anchor=\"middle\">N pole</text>\n      <text x=\"746\" y=\"135\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#151a21\" text-anchor=\"end\" data-tex=\"\\Delta\\lambda\">Δλ</text>\n      <text x=\"712.848\" y=\"129.127\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#151a21\" text-anchor=\"end\" data-tex=\"r_1\">r₁</text>\n      <text x=\"824.697\" y=\"118.89\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#151a21\" data-tex=\"r_2\">r₂</text>\n      <text x=\"750\" y=\"78\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\" text-anchor=\"middle\" data-tex=\"r = R(\\pi/2 - \\varphi)\">r = R (π/2 − φ)</text>\n      <text x=\"750\" y=\"288\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#c2410c\" text-anchor=\"middle\" data-tex=\"d = \\sqrt{r_1^2 + r_2^2 - 2r_1r_2\\cos\\Delta\\lambda}\">d = √( r₁² + r₂² − 2 r₁ r₂ cos Δλ )</text>\n      <text x=\"750\" y=\"306\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">plane law of cosines — the ruler line on the disk,</text>\n      <text x=\"750\" y=\"324\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">which is how anyone measures a flat map</text>\n      </svg>\n        <div class=\"fcap\"><b>The same two points, three geometries.</b> Schematics of the\n          algebra, not scale drawings: no distance in them is to scale, and none is used for any number on this\n          page.</div>\n    </div>",
  "k": "x:dist-cap1"
 },
 {
  "t": "lead",
  "html": "Take a diagonal segment in the northern hemisphere — one that cuts across parallels and meridians — and its exact mirror image across the equator. On the globe the two are <em>identical in length</em> by symmetry. Now flatten the Earth, keep the coordinates, and measure with a ruler: the mirror twins stop agreeing, and how they disagree depends on which flat map you chose. Two pairs are shown, in different directions and regions.",
  "opener": true,
  "k": "f3e2f13c"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--obj1)",
  "lines": [
   {
    "tex": null,
    "fallback": "Globe: great‑circle arc"
   },
   {
    "tex": null,
    "fallback": "Cartesian map: straight line in <span class=\"tex\" data-tex=\"(\\lambda,\\ \\varphi)\">(λ, φ)</span>"
   },
   {
    "tex": null,
    "fallback": "Polar map (AE): straight chord on the disk"
   }
  ],
  "fig": "distfig0",
  "gloss": "One pair of endpoints, three rulers — each model measured <em>its own way</em>: the sphere's shortest path on the globe, and honest straight ruler lines on both flat maps. Only the globe's answer matches odometers, flight times, and surveyed distances; the polar disk is the azimuthal equidistant <em>projection</em> of the globe, centred on the north pole.",
  "k": "x:85c90bff"
 },
 {
  "t": "h2",
  "html": "The three rulers, written out",
  "k": "dist-h2a"
 },
 {
  "t": "lead",
  "html": "Each model is asked the same question — how far apart are these two coordinate pairs? — and each answers in its own geometry. These are the three formulas the page actually evaluates for the table above, with nothing hidden inside a function name.",
  "opener": false,
  "k": "dist-p1"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\cos\\sigma = \\sin\\varphi_1\\sin\\varphi_2 + \\cos\\varphi_1\\cos\\varphi_2\\cos\\Delta\\lambda",
    "fallback": "cos σ = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos Δλ"
   },
   {
    "tex": "\\g{d_{\\text{globe}} = R\\,\\sigma}",
    "fallback": "<b>d = R σ</b>"
   }
  ],
  "fig": "distfig1",
  "gloss": "The spherical law of cosines, the oldest formula on this page.<sup class=\"ref\"><a href=\"#s-dist-n1\">[1]</a></sup> σ is the angle the two points subtend at the Earth's centre, so the distance is nothing but R times an angle. The code evaluates the equivalent dot product of two unit vectors. For legs of a few kilometres the arccosine is ill-conditioned and the haversine form is the right one to use;<sup class=\"ref\"><a href=\"#s-dist-n4\">[4]</a></sup> at the thousands of kilometres compared here it makes no visible difference.",
  "k": "x:dist-g1"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "x = R\\lambda,\\quad y = R\\varphi",
    "fallback": "x = R λ, &nbsp; y = R φ"
   },
   {
    "tex": "\\f{d_{\\text{cart}} = R\\sqrt{\\Delta\\varphi^2 + \\Delta\\lambda^2}}",
    "fallback": "<b style=\"color:var(--flat)\">d = R √(Δφ² + Δλ²)</b>"
   }
  ],
  "fig": "distfig2",
  "gloss": "The plate carrée, or equidistant cylindrical projection: latitude and longitude read straight off as y and x.<sup class=\"ref\"><a href=\"#s-dist-n3\">[3]</a></sup> Pythagoras then prices every degree of longitude at its equatorial length wherever you happen to be, inflating the answer by roughly 1/cos φ. It stays symmetric across the equator, which is exactly why this map hides the asymmetry while still disagreeing with every odometer.",
  "k": "x:dist-g2"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "r = R\\left(\\pi/2 - \\varphi\\right),\\quad \\theta = \\lambda",
    "fallback": "r = R (π/2 − φ), &nbsp; θ = λ"
   },
   {
    "tex": "\\f{d_{\\text{AE}} = \\sqrt{r_1^2 + r_2^2 - 2r_1r_2\\cos\\Delta\\lambda}}",
    "fallback": "<b style=\"color:var(--flat)\">d = √(r₁² + r₂² − 2 r₁ r₂ cos Δλ)</b>"
   }
  ],
  "fig": "distfig3",
  "gloss": "The azimuthal equidistant projection centred on the north pole, with a straight ruler line laid across it.<sup class=\"ref\"><a href=\"#s-dist-n3\">[3]</a></sup> This is the flat-earth disk, and the record is explicit: the Boston Public Library catalogues Gleason's 1892 original as the globe flattened into a circular plane, and his own patent claim is filed on a projection.<sup class=\"ref\"><a href=\"#s-dist-n5\">[5]</a></sup> Distances on it are true along the radii — any line through the pole — and along nothing else.",
  "k": "x:dist-g3"
 },
 {
  "t": "h2",
  "html": "Why the mirror test works, and where the disk's error comes from",
  "k": "dist-h2b"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--obj1)",
  "lines": [
   {
    "tex": "\\text{globe: }\\cos\\sigma(-\\varphi_1, -\\varphi_2, \\Delta\\lambda) = \\cos\\sigma(\\varphi_1, \\varphi_2, \\Delta\\lambda)",
    "fallback": "globe: cos σ(−φ₁, −φ₂, Δλ) = cos σ(φ₁, φ₂, Δλ)"
   },
   {
    "tex": "\\text{disk: }r(-\\varphi) = R(\\pi/2 + \\varphi) \\neq r(\\varphi)",
    "fallback": "disk: r(−φ) = R (π/2 + φ) ≠ r(φ)"
   }
  ],
  "fig": "distfig4",
  "gloss": "This is the whole tab in two lines. Flip both latitudes and the spherical formula is unchanged: sin(−φ) appears twice so the two minus signs cancel, and cos(−φ) = cos φ. Mirror-image segments are therefore exactly equal on a globe — not approximately, exactly, and for every value of R. The disk's radius is simply not an even function of latitude, so its answer has to change. No choice of disk size, scale or centring repairs that, because the disagreement is about shape, not size.",
  "k": "x:dist-g4"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "\\text{along a parallel} \\quad\\text{globe: } d = R\\cos\\varphi\\,\\Delta\\lambda",
    "fallback": "along a parallel &nbsp;·&nbsp; globe: d = R cos φ Δλ"
   },
   {
    "tex": "\\text{disk: } d = R(\\pi/2 - \\varphi)\\,\\Delta\\lambda",
    "fallback": "disk: d = R (π/2 − φ) Δλ"
   },
   {
    "tex": "\\f{\\text{ratio} = \\frac{\\pi/2 - \\varphi}{\\cos\\varphi}}",
    "fallback": "<b style=\"color:var(--flat)\">ratio = (π/2 − φ) / cos φ</b>"
   }
  ],
  "fig": "distfig5",
  "gloss": "Take the simplest leg there is, due east along a parallel, and both models close into elementary form. R divides out of the ratio, which makes this a radius-free test like the magnetism tab: it constrains the shape alone, whatever the size. The ratio equals 1 only at the pole and rises without bound going south — 1.11 at 45° N, 1.57 at the equator, 3.33 at 45° S, 17.1 at 80° S.",
  "k": "x:dist-g5"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" id=\"distStretchFig\" style=\"margin:18px 0\">\n      <svg viewBox=\"0 0 900 330\" role=\"img\" aria-label=\"Ratio of the polar-disk east-west distance to the measured distance, against latitude\">\n      <text x=\"84\" y=\"24\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\">HOW MUCH THE POLAR DISK STRETCHES AN EAST–WEST LEG</text>\n      <line x1=\"92\" y1=\"250\" x2=\"640\" y2=\"250\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.45\"/>\n      <text x=\"84\" y=\"254\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\">×1</text>\n      <line x1=\"92\" y1=\"202.799\" x2=\"640\" y2=\"202.799\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.45\"/>\n      <text x=\"84\" y=\"206.799\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\">×2</text>\n      <line x1=\"92\" y1=\"140.402\" x2=\"640\" y2=\"140.402\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.45\"/>\n      <text x=\"84\" y=\"144.402\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\">×5</text>\n      <line x1=\"92\" y1=\"93.2012\" x2=\"640\" y2=\"93.2012\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.45\"/>\n      <text x=\"84\" y=\"97.2012\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\">×10</text>\n      <line x1=\"92\" y1=\"46\" x2=\"640\" y2=\"46\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.45\"/>\n      <text x=\"84\" y=\"50\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\">×20</text>\n      <line x1=\"92\" y1=\"46\" x2=\"92\" y2=\"250\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.3\"/>\n      <text x=\"92\" y=\"266\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">80°N</text>\n      <line x1=\"211.875\" y1=\"46\" x2=\"211.875\" y2=\"250\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.3\"/>\n      <text x=\"211.875\" y=\"266\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">45°N</text>\n      <line x1=\"366\" y1=\"46\" x2=\"366\" y2=\"250\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.3\"/>\n      <text x=\"366\" y=\"266\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">0°</text>\n      <line x1=\"520.125\" y1=\"46\" x2=\"520.125\" y2=\"250\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.3\"/>\n      <text x=\"520.125\" y=\"266\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">45°S</text>\n      <line x1=\"640\" y1=\"46\" x2=\"640\" y2=\"250\" stroke=\"#9aa1ab\" stroke-width=\"0.6\" stroke-dasharray=\"3 4\" opacity=\"0.3\"/>\n      <text x=\"640\" y=\"266\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">80°S</text>\n      <line x1=\"92\" y1=\"250\" x2=\"640\" y2=\"250\" stroke=\"#151a21\" stroke-width=\"1.2\"/>\n      <line x1=\"92\" y1=\"46\" x2=\"92\" y2=\"250\" stroke=\"#151a21\" stroke-width=\"1.2\"/>\n      <text x=\"366\" y=\"284\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"middle\">latitude of the leg · travelling south →</text>\n      <line x1=\"92\" y1=\"250\" x2=\"640\" y2=\"250\" stroke=\"#0f766e\" stroke-width=\"2\"/>\n      <text x=\"636\" y=\"242\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#0f766e\" text-anchor=\"end\">×1 — what the ground measures (globe)</text>\n      <polyline points=\"92,249.654 93.7125,249.618 95.425,249.581 97.1375,249.542 98.85,249.501 100.562,249.459 102.275,249.415 103.987,249.369 105.7,249.321 107.412,249.272 109.125,249.22 110.838,249.167 112.55,249.113 114.263,249.056 115.975,248.998 117.688,248.938 119.4,248.876 121.112,248.813 122.825,248.747 124.537,248.68 126.25,248.611 127.963,248.541 129.675,248.468 131.387,248.394 133.1,248.318 134.812,248.241 136.525,248.161 138.238,248.08 139.95,247.997 141.662,247.912 143.375,247.825 145.088,247.737 146.8,247.647 148.512,247.555 150.225,247.461 151.938,247.365 153.65,247.268 155.363,247.168 157.075,247.067 158.787,246.964 160.5,246.86 162.212,246.753 163.925,246.645 165.637,246.534 167.35,246.422 169.062,246.308 170.775,246.193 172.488,246.075 174.2,245.955 175.913,245.834 177.625,245.711 179.337,245.586 181.05,245.459 182.762,245.33 184.475,245.199 186.188,245.067 187.9,244.932 189.613,244.796 191.325,244.658 193.038,244.518 194.75,244.376 196.462,244.232 198.175,244.086 199.887,243.938 201.6,243.788 203.312,243.637 205.025,243.483 206.738,243.328 208.45,243.17 210.163,243.011 211.875,242.849 213.587,242.686 215.3,242.521 217.012,242.353 218.725,242.184 220.438,242.013 222.15,241.839 223.863,241.664 225.575,241.487 227.287,241.308 229,241.126 230.713,240.943 232.425,240.758 234.138,240.57 235.85,240.381 237.562,240.189 239.275,239.996 240.987,239.8 242.7,239.602 244.412,239.402 246.125,239.2 247.838,238.996 249.55,238.79 251.263,238.582 252.975,238.372 254.688,238.159 256.4,237.945 258.112,237.728 259.825,237.509 261.538,237.288 263.25,237.064 264.962,236.839 266.675,236.611 268.388,236.381 270.1,236.149 271.812,235.915 273.525,235.678 275.237,235.44 276.95,235.199 278.663,234.955 280.375,234.71 282.087,234.462 283.8,234.212 285.513,233.959 287.225,233.705 288.938,233.447 290.65,233.188 292.362,232.926 294.075,232.662 295.788,232.395 297.5,232.127 299.212,231.855 300.925,231.582 302.638,231.305 304.35,231.027 306.062,230.746 307.775,230.462 309.487,230.176 311.2,229.888 312.913,229.597 314.625,229.303 316.337,229.007 318.05,228.709 319.763,228.408 321.475,228.104 323.188,227.798 324.9,227.489 326.612,227.177 328.325,226.863 330.038,226.546 331.75,226.227 333.462,225.905 335.175,225.58 336.888,225.252 338.6,224.922 340.312,224.589 342.025,224.253 343.737,223.914 345.45,223.573 347.163,223.228 348.875,222.881 350.587,222.531 352.3,222.178 354.012,221.823 355.725,221.464 357.438,221.102 359.15,220.737 360.863,220.37 362.575,219.999 364.288,219.625 366,219.249 367.713,218.869 369.425,218.486 371.137,218.1 372.85,217.71 374.562,217.318 376.275,216.922 377.988,216.523 379.7,216.121 381.412,215.716 383.125,215.307 384.838,214.895 386.55,214.48 388.262,214.061 389.975,213.639 391.688,213.213 393.4,212.784 395.113,212.351 396.825,211.915 398.537,211.475 400.25,211.031 401.963,210.584 403.675,210.134 405.387,209.679 407.1,209.221 408.812,208.759 410.525,208.293 412.238,207.823 413.95,207.35 415.662,206.872 417.375,206.391 419.088,205.905 420.8,205.416 422.512,204.922 424.225,204.424 425.938,203.922 427.65,203.416 429.363,202.905 431.075,202.391 432.787,201.871 434.5,201.348 436.213,200.82 437.925,200.287 439.637,199.75 441.35,199.208 443.062,198.662 444.775,198.111 446.488,197.555 448.2,196.994 449.912,196.428 451.625,195.857 453.338,195.282 455.05,194.701 456.762,194.115 458.475,193.524 460.188,192.927 461.9,192.326 463.613,191.718 465.325,191.106 467.037,190.487 468.75,189.863 470.463,189.234 472.175,188.598 473.887,187.957 475.6,187.309 477.312,186.656 479.025,185.996 480.738,185.33 482.45,184.658 484.162,183.979 485.875,183.294 487.588,182.602 489.3,181.904 491.012,181.198 492.725,180.486 494.438,179.767 496.15,179.04 497.863,178.306 499.575,177.565 501.287,176.816 503,176.059 504.713,175.294 506.425,174.522 508.137,173.741 509.85,172.953 511.562,172.155 513.275,171.349 514.987,170.535 516.7,169.711 518.412,168.879 520.125,168.037 521.838,167.186 523.55,166.325 525.263,165.454 526.975,164.574 528.688,163.683 530.4,162.781 532.112,161.869 533.825,160.946 535.537,160.012 537.25,159.066 538.963,158.109 540.675,157.14 542.388,156.158 544.1,155.164 545.812,154.157 547.525,153.137 549.237,152.104 550.95,151.057 552.662,149.995 554.375,148.919 556.088,147.828 557.8,146.722 559.513,145.599 561.225,144.461 562.938,143.306 564.65,142.133 566.362,140.943 568.075,139.735 569.787,138.508 571.5,137.262 573.213,135.995 574.925,134.708 576.638,133.4 578.35,132.07 580.062,130.717 581.775,129.34 583.487,127.939 585.2,126.512 586.912,125.059 588.625,123.579 590.338,122.071 592.05,120.533 593.763,118.964 595.475,117.364 597.188,115.73 598.9,114.062 600.612,112.357 602.325,110.614 604.038,108.832 605.75,107.008 607.462,105.14 609.175,103.227 610.888,101.265 612.6,99.252 614.312,97.1856 616.025,95.0624 617.737,92.8792 619.45,90.6323 621.163,88.3177 622.875,85.9312 624.587,83.4678 626.3,80.9222 628.013,78.2886 629.725,75.5604 631.438,72.7302 633.15,69.7899 634.862,66.7301 636.575,63.5403 638.288,60.2085 640,56.721\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n      <circle cx=\"211.875\" cy=\"242.849\" r=\"4\" fill=\"#b45309\"/>\n      <text x=\"202.875\" y=\"231.849\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\" text-anchor=\"end\">×1.11</text>\n      <circle cx=\"366\" cy=\"219.249\" r=\"4\" fill=\"#b45309\"/>\n      <text x=\"357\" y=\"208.249\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\" text-anchor=\"end\">×1.57</text>\n      <circle cx=\"520.125\" cy=\"168.037\" r=\"4\" fill=\"#b45309\"/>\n      <text x=\"511.125\" y=\"157.037\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\" text-anchor=\"end\">×3.33</text>\n      <circle cx=\"640\" cy=\"56.721\" r=\"4\" fill=\"#b45309\"/>\n      <text x=\"631\" y=\"45.721\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\" text-anchor=\"end\">×17.09</text>\n      <text x=\"662\" y=\"60\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\" data-tex=\"\\frac{\\pi/2 - \\varphi}{\\cos\\varphi}\">ratio  =  (π/2 − φ) / cos φ</text>\n      <text x=\"662\" y=\"88\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">φ in radians. The disk plots a parallel as a</text>\n      <text x=\"662\" y=\"103\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">circle of radius R(π/2 − φ); the sphere gives</text>\n      <text x=\"662\" y=\"118\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">it R cos φ. Divide, and R cancels: the shape</text>\n      <text x=\"662\" y=\"133\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">of this curve does not depend on the size of</text>\n      <text x=\"662\" y=\"148\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">the Earth at all.</text>\n      <text x=\"662\" y=\"163\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\"></text>\n      <text x=\"662\" y=\"178\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">It is ×1 only at the pole, and never below.</text>\n      <text x=\"662\" y=\"193\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">The disk can only ever overstate an east–west</text>\n      <text x=\"662\" y=\"208\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">leg, and it overstates the south catastrophically.</text>\n      <text x=\"84\" y=\"316\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#151a21\">Mirror pair at ±45°: the globe says the two legs are equal; the disk says the southern one is 3.33/1.11 = 3.0× the northern one.</text>\n      </svg>\n      <div class=\"fcap\"><b>The stretch factor, plotted.</b> The curve is the ratio above; the teal line at ×1 is what vehicles actually log. The disk never reads short, and never reads true except at the pole. At ±45° the two halves of a mirror pair differ by a factor of three, which is the discrepancy the experiment below asks you to go and settle.</div>\n    </div>",
  "k": "x:dist-cap2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>One honesty note about that last pair.</b> A leg flown due east along a parallel is a rhumb line, not the shortest path: between 45° N 0° and 45° N 60° E the parallel measures 4,718 km and the great circle 4,605 km, 2.4% shorter. That approximation is real, and it is not what is being tested — both models are asked for the same parallel-following leg, so the ratio between them is unaffected. The table at the top of this tab avoids the issue entirely by giving the globe its true great-circle answer and the flat maps their own straight ruler lines, and it reaches the same verdict.",
  "k": "dist-note"
 },
 {
  "t": "h2",
  "html": "Two legs the globe calls equal — and each flat map breaks a different one",
  "k": "dist-h2c"
 },
 {
  "t": "lead",
  "html": "The mirror pairs above leave the cartesian map a way out: its grid is symmetric across the equator, so it keeps mirror twins equal and only inflates them both. This pair closes that door. Two legs, each exactly 60° of arc, chosen so the sphere makes them identical to the kilometre. Neither flat map can hold them equal, and — this is the part worth sitting with — they fail in opposite directions.",
  "opener": false,
  "k": "dist-p2"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--obj1)",
  "lines": [
   {
    "tex": "\\text{polar leg: } 60\\deg\\text{N } 0\\deg \\to 60\\deg\\text{N } 180\\deg",
    "fallback": "polar leg: &nbsp; 60°N 0° → 60°N 180°"
   },
   {
    "tex": "\\text{equator leg: } 0\\deg\\ 30\\deg\\text{W} \\to 0\\deg\\ 30\\deg\\text{E}",
    "fallback": "equator leg: &nbsp; 0° 30°W → 0° 30°E"
   },
   {
    "tex": "\\g{\\sigma = 60\\deg \\text{ for both} \\implies d = 6,672\\,\\text{km}}",
    "fallback": "<b>σ = 60° for both &nbsp;⇒&nbsp; d = 6,672 km</b>"
   }
  ],
  "fig": "distfig6",
  "gloss": "Both equalities are exact, not fitted. For the polar leg, cos σ = sin²60° + cos²60°·cos 180° = 0.75 − 0.25 = 0.5, so σ = 60°: the great circle runs straight over the pole, 30° down each side. For the equator leg cos σ = cos 60° directly. Same central angle, therefore the same distance, and R does not need to be known for the two to be equal — only for the 6,672 km. Any route planner returns both numbers.<sup class=\"ref\"><a href=\"#s-dist-n2\">[2]</a></sup>",
  "k": "x:dist-g6"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" id=\"distLegsFig\" style=\"margin:18px 0\">\n      <svg viewBox=\"0 0 900 350\" role=\"img\" aria-label=\"Two legs of equal great-circle length: the cartesian map triples one of them, the polar disk stretches the other by half\">\n      <text x=\"16\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#0f766e\">A · GLOBE — both are 60° of arc</text>\n      <text x=\"316\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\">B · CARTESIAN MAP</text>\n      <line x1=\"300\" y1=\"30\" x2=\"300\" y2=\"338\" stroke=\"#9aa1ab\" stroke-width=\"1\" stroke-dasharray=\"3 4\" opacity=\"0.5\"/>\n      <text x=\"616\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\">C · POLAR MAP (AE)</text>\n      <line x1=\"600\" y1=\"30\" x2=\"600\" y2=\"338\" stroke=\"#9aa1ab\" stroke-width=\"1\" stroke-dasharray=\"3 4\" opacity=\"0.5\"/>\n      <circle cx=\"88\" cy=\"150\" r=\"52\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.4\"/>\n      <circle cx=\"88\" cy=\"150\" r=\"52\" fill=\"#0f766e\" stroke=\"#0f766e\" stroke-width=\"0\" opacity=\"0.05\"/>\n      <path d=\"M 114 104.967 A 52 52 0 0 0 62 104.967\" fill=\"none\" stroke=\"#c2410c\" stroke-width=\"3.6\"/>\n      <circle cx=\"114\" cy=\"104.967\" r=\"3.4\" fill=\"#c2410c\"/>\n      <circle cx=\"62\" cy=\"104.967\" r=\"3.4\" fill=\"#c2410c\"/>\n      <line x1=\"88\" y1=\"150\" x2=\"114\" y2=\"104.967\" stroke=\"#0f766e\" stroke-width=\"1\" stroke-dasharray=\"3 3\" opacity=\"0.7\"/>\n      <line x1=\"88\" y1=\"150\" x2=\"62\" y2=\"104.967\" stroke=\"#0f766e\" stroke-width=\"1\" stroke-dasharray=\"3 3\" opacity=\"0.7\"/>\n      <path d=\"M 97 134.412 A 18 18 0 0 0 79 134.412\" fill=\"none\" stroke=\"#151a21\" stroke-width=\"1.1\"/>\n      <text x=\"88\" y=\"122\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#151a21\" text-anchor=\"middle\">60°</text>\n      <text x=\"88\" y=\"218\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">over the pole</text>\n      <text x=\"88\" y=\"232\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#c2410c\" text-anchor=\"middle\">60°N 0° → 60°N 180°</text>\n      <circle cx=\"218\" cy=\"150\" r=\"52\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.4\"/>\n      <circle cx=\"218\" cy=\"150\" r=\"52\" fill=\"#0f766e\" stroke=\"#0f766e\" stroke-width=\"0\" opacity=\"0.05\"/>\n      <path d=\"M 244 104.967 A 52 52 0 0 0 192 104.967\" fill=\"none\" stroke=\"#1d4ed8\" stroke-width=\"3.6\"/>\n      <circle cx=\"244\" cy=\"104.967\" r=\"3.4\" fill=\"#1d4ed8\"/>\n      <circle cx=\"192\" cy=\"104.967\" r=\"3.4\" fill=\"#1d4ed8\"/>\n      <line x1=\"218\" y1=\"150\" x2=\"244\" y2=\"104.967\" stroke=\"#0f766e\" stroke-width=\"1\" stroke-dasharray=\"3 3\" opacity=\"0.7\"/>\n      <line x1=\"218\" y1=\"150\" x2=\"192\" y2=\"104.967\" stroke=\"#0f766e\" stroke-width=\"1\" stroke-dasharray=\"3 3\" opacity=\"0.7\"/>\n      <path d=\"M 227 134.412 A 18 18 0 0 0 209 134.412\" fill=\"none\" stroke=\"#151a21\" stroke-width=\"1.1\"/>\n      <text x=\"218\" y=\"122\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#151a21\" text-anchor=\"middle\">60°</text>\n      <text x=\"218\" y=\"218\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">along the equator</text>\n      <text x=\"218\" y=\"232\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#1d4ed8\" text-anchor=\"middle\">0° 30°W → 0° 30°E</text>\n      <text x=\"150\" y=\"262\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"13\" fill=\"#151a21\" text-anchor=\"middle\">6,672 km</text>\n      <text x=\"150\" y=\"280\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">both, exactly</text>\n      <text x=\"150\" y=\"306\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">The sphere cannot tell these two apart:</text>\n      <text x=\"150\" y=\"320\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">same central angle, same distance.</text>\n      <line x1=\"330\" y1=\"92\" x2=\"330\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"1\" opacity=\"0.35\"/>\n      <line x1=\"370\" y1=\"92\" x2=\"370\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"410\" y1=\"92\" x2=\"410\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"450\" y1=\"92\" x2=\"450\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"490\" y1=\"92\" x2=\"490\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"530\" y1=\"92\" x2=\"530\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"570\" y1=\"92\" x2=\"570\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"1\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"212\" x2=\"570\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"192\" x2=\"570\" y2=\"192\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"172\" x2=\"570\" y2=\"172\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"152\" x2=\"570\" y2=\"152\" stroke=\"#b45309\" stroke-width=\"1\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"132\" x2=\"570\" y2=\"132\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"112\" x2=\"570\" y2=\"112\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"330\" y1=\"92\" x2=\"570\" y2=\"92\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.35\"/>\n      <line x1=\"450\" y1=\"112\" x2=\"570\" y2=\"112\" stroke=\"#c2410c\" stroke-width=\"4\"/>\n      <circle cx=\"450\" cy=\"112\" r=\"3.6\" fill=\"#c2410c\"/>\n      <circle cx=\"570\" cy=\"112\" r=\"3.6\" fill=\"#c2410c\"/>\n      <line x1=\"430\" y1=\"152\" x2=\"470\" y2=\"152\" stroke=\"#1d4ed8\" stroke-width=\"4\"/>\n      <circle cx=\"430\" cy=\"152\" r=\"3.6\" fill=\"#1d4ed8\"/>\n      <circle cx=\"470\" cy=\"152\" r=\"3.6\" fill=\"#1d4ed8\"/>\n      <text x=\"510\" y=\"103\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#c2410c\" text-anchor=\"middle\">20,015 km</text>\n      <text x=\"450\" y=\"172\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#1d4ed8\" text-anchor=\"middle\">6,672 km</text>\n      <text x=\"450\" y=\"250\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#c2410c\" text-anchor=\"middle\">one leg comes out 3× the other</text>\n      <text x=\"450\" y=\"280\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">the equator leg is exactly right;</text>\n      <text x=\"450\" y=\"294\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">the polar leg is wrong by +200%,</text>\n      <text x=\"450\" y=\"308\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">because a ruler on this grid cannot</text>\n      <text x=\"450\" y=\"322\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">go over the top.</text>\n      <circle cx=\"750\" cy=\"152\" r=\"14.6667\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"0.6\" opacity=\"0.3\"/>\n      <circle cx=\"750\" cy=\"152\" r=\"44\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"0.6\" opacity=\"0.3\"/>\n      <circle cx=\"750\" cy=\"152\" r=\"88\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"1.4\" opacity=\"0.8\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"838\" y2=\"152\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"826.21\" y2=\"108\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"794\" y2=\"75.7898\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"750\" y2=\"64\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"706\" y2=\"75.7898\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"673.79\" y2=\"108\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"662\" y2=\"152\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"673.79\" y2=\"196\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"706\" y2=\"228.21\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"750\" y2=\"240\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"794\" y2=\"228.21\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <line x1=\"750\" y1=\"152\" x2=\"826.21\" y2=\"196\" stroke=\"#b45309\" stroke-width=\"0.5\" opacity=\"0.25\"/>\n      <polyline points=\"728,113.895 772,113.895\" fill=\"none\" stroke=\"#1d4ed8\" stroke-width=\"4\" stroke-linejoin=\"round\"/>\n      <circle cx=\"728\" cy=\"113.895\" r=\"3.6\" fill=\"#1d4ed8\"/>\n      <circle cx=\"772\" cy=\"113.895\" r=\"3.6\" fill=\"#1d4ed8\"/>\n      <polyline points=\"750,137.333 750,166.667\" fill=\"none\" stroke=\"#c2410c\" stroke-width=\"4\" stroke-linejoin=\"round\"/>\n      <circle cx=\"750\" cy=\"137.333\" r=\"3.6\" fill=\"#c2410c\"/>\n      <circle cx=\"750\" cy=\"166.667\" r=\"3.6\" fill=\"#c2410c\"/>\n      <circle cx=\"750\" cy=\"152\" r=\"2.6\" fill=\"#151a21\"/>\n      <text x=\"764\" y=\"156\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#c2410c\">6,672 km</text>\n      <text x=\"750\" y=\"100\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#1d4ed8\" text-anchor=\"middle\">10,007 km</text>\n      <text x=\"750\" y=\"250\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#1d4ed8\" text-anchor=\"middle\">the other leg comes out 1.5×</text>\n      <text x=\"750\" y=\"280\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">the polar leg is exactly right — it runs</text>\n      <text x=\"750\" y=\"294\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">through the centre, the one direction</text>\n      <text x=\"750\" y=\"308\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">this map keeps true. The equator leg</text>\n      <text x=\"750\" y=\"322\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">is wrong by +50%.</text>\n      </svg>\n      <div class=\"fcap\"><b>The same pair under three rulers.</b> Panel A shows each leg on the great circle that carries it, seen face-on: two identical 60° arcs, which is the whole point — the sphere has no way to distinguish them. Panels B and C are drawn to scale within themselves, so the lengths you see are the lengths each model claims; there is no exaggeration factor anywhere in this figure, and none is needed.</div>\n    </div>",
  "k": "x:dist-cap3"
 },
 {
  "t": "raw",
  "html": "<table class=\"cnav-table\"> <caption>Equal on the globe by construction; each flat map preserves one leg exactly and breaks the other</caption> <thead><tr><th>Segment (endpoints)</th><th>Globe great‑circle</th><th>Flat cartesian ruler</th><th>Flat polar (AE) ruler</th></tr></thead> <tbody> <tr><td><span class=\"obj-key\" style=\"background:var(--obj2)\"></span>polar &nbsp;<span style='color:var(--ink-soft);font-size:11px'>60°N 0° → 60°N 180°</span></td><td class=\"hot\">6,672 km</td><td class=\"hot\">20,015 km <span style=\"color:var(--ink-soft)\">(+200%)</span></td><td class=\"cold\">6,672 km <span style=\"color:var(--ink-soft)\">(0%)</span></td></tr> <tr><td><span class=\"obj-key\" style=\"background:var(--obj1)\"></span>equator &nbsp;<span style='color:var(--ink-soft);font-size:11px'>0° 30°W → 0° 30°E</span></td><td class=\"hot\">6,672 km</td><td class=\"cold\">6,672 km <span style=\"color:var(--ink-soft)\">(0%)</span></td><td class=\"hot\">10,007 km <span style=\"color:var(--ink-soft)\">(+50%)</span></td></tr> </tbody> </table>",
  "k": "x:dist-tcap"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Verdict rule, stated in advance.</b> Go and measure both legs — flight time × ground speed, a GPS track, or published great-circle tables. If they come out equal, the sphere survives and both flat maps are refuted, each by a different leg. If the polar leg really is three times the equator leg, the cartesian map survives and the sphere is refuted. If the equator leg really is one and a half times the polar one, the polar disk survives instead. The three models make three different predictions here, so this single measurement can eliminate at least two of them — and note that no flat map can be rescued by rescaling, since each is already exactly right on one of the two legs.",
  "k": "dist-verdict"
 },
 {
  "t": "h2",
  "html": "See it in 3D <span class=\"drag-hint\">· click &amp; drag to orbit</span>",
  "k": "115dab3c"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"dg3d\"></canvas> <div class=\"fcap\"><b>Globe.</b> Pair A (blue / orange) and pair B (teal / violet): each southern segment is the mirror of its northern twin, so within each pair the great‑circle lengths are <b>exactly equal</b>. The arcs look curved because on a sphere the shortest path <em>is</em> an arc.</div> </div> <div class=\"fig\"> <button type=\"button\" class=\"swapbtn\" id=\"distSwap\" style=\"margin:2px 0 8px\">⇄ swap flat map: polar (AE) / cartesian</button> <canvas id=\"df3d\"></canvas> <div class=\"fcap\" id=\"distFlatCap\"></div> </div> </div>",
  "k": "x:fb712448"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "distRows",
  "caption": "Same endpoints, three rulers — flat maps measured with straight lines, as a ruler would",
  "head": [
   "Segment (endpoints)",
   "Globe great‑circle",
   "Flat cartesian ruler",
   "Flat polar (AE) ruler"
  ],
  "k": "x:c464baaa"
 },
 {
  "away": "xp-dist-3",
  "t": "exp",
  "h": "Experiment 3 · distances",
  "title": "The same east–west trip, north and south",
  "lead": "Pick an east–west leg spanning a fixed number of degrees of longitude, and measure how long it really is. Then do the mirror-image leg in the other hemisphere. Book the flights, or read the published great-circle distances and flight times.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the <b>latitude</b> of the leg — try +45°, then −45°. You choose which parallel to travel along.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>ground distance actually covered</b> — odometer, GPS track, or flight time × cruising speed.",
  "meta": [],
  "inputs": [
   [
    "exp3lat",
    "IV — latitude of the leg <span class=\"unit\">(° , negative = south)</span>",
    " type=\"number\" id=\"exp3lat\" value=\"45\" min=\"-80\" max=\"80\" step=\"5\""
   ],
   [
    "exp3dl",
    "Controlled — longitude span Δλ <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"exp3dl\" value=\"60\" min=\"1\" max=\"180\" step=\"5\""
   ]
  ],
  "out": "exp3out",
  "verdict": "exp3v",
  "k": "x:d47237f3"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The confusion, named.</b> The flat‑earth disk (the “Gleason map”) is the azimuthal equidistant projection of the globe. It preserves distances <em>only along straight lines through the pole</em>; every east–west distance is stretched by (90°−φ)/cos φ — a factor of 1.11 at 45° N but <b>3.33 at 45° S</b>. Treating that projection as the territory forces the southern hemisphere to be three times wider than it measures. Real ships and aircraft cross it anyway: Sydney–Santiago is ~11,400 km and is flown non‑stop in ~12½ hours; on the disk it would be ~25,000 km, longer than any airliner's range.",
  "k": "bec68fcf"
 },
 {
  "t": "notes-block",
  "paras": [
   "<span class=\"k\">Why the cartesian ruler also fails.</span> Reading latitude/longitude as x‑y coordinates (a plate‑carrée grid) at least keeps north and south symmetric — but it prices every east–west degree at its equatorial length, inflating both segments by 1/cos φ (+41% at 45°). It hides the asymmetry while still disagreeing with every odometer. Coordinates are <em>addresses on a sphere</em>, not distances; the only ruler that returns what vehicles actually log is R·cos φ·Δλ — spherical geometry.",
   "<span class=\"k\">The through‑line.</span> This is the third appearance of the same R: it curves the sightlines in the Simulator, sets k = 1/R in Celestial navigation, and here converts coordinate differences into the distances the world actually measures. One sphere explains all three; each flat model must fail at least one."
  ],
  "k": "ds-x1"
 },
 {
  "t": "xrefs",
  "keys": [
   "cnav",
   "surv",
   "gps",
   "seis",
   "azim"
  ],
  "wide": false
 },
 {
  "t": "sources"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "srcs reading",
  "id": "",
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li id=\"s3-r1\"><a href=\"https://earth-info.nga.mil/index.php?dir=wgs84&amp;action=wgs84\">NGA Office of Geomatics — <em>Department of Defense World Geodetic System 1984</em> (NGA.STND.0036, v1.0.0, 2014)</a> — where the reference figures used throughout this page are actually defined, rather than merely quoted: semi-major axis a = 6,378,137 m exactly, flattening 1/f = 298.257223563, arithmetic mean radius R<sub>1</sub> = 6,371.0088 km. The standard states that it supplements <a href=\"https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html\">IERS Technical Note 36, <em>IERS Conventions (2010)</em></a>, which is the civilian side of the same constants. Two defence and scientific standards agreeing on one figure is a stronger check than any single agency; and any flight-booking site's city-pair distances give the same geodesics an independent everyday test.</li> <li><b>T. Vincenty, \"Direct and inverse solutions of geodesics on the ellipsoid with application of nested equations\", <em>Survey Review</em> 23 (1975), 88–93.</b> The formula geodetic agencies actually use. This page deliberately works on a sphere; Vincenty is how you check what that simplification costs, which for the legs here is a few kilometres in eleven thousand.</li> <li><b>Published airline timetables and manufacturer range figures</b> — for example the Santiago–Sydney and Perth–London services, against the published range of the aircraft flying them. A commercial timetable is a harder thing to wave away than a great-circle calculator: an airline that has mis-stated a flight time by four hours is an airline that has run out of fuel.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
