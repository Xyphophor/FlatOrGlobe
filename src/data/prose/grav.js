// Prose de l'onglet grav, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Gravity and level · what a bubble is really finding",
  "k": "grav-m1"
 },
 {
  "t": "h1",
  "html": "A spirit level does not find a plane — and a gravimeter in a lift measures the radius of the Earth"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\"> <div class=\"figsym\" id=\"gravPairFig\"></div> <div class=\"fcap\"><b>Where \"down\" points, in each model.</b> On the globe every vertical is a radius, so no two are parallel. On an infinite slab — the flat model at its strongest for this measurement — every vertical is perpendicular and every bubble is centred. Directions are exact; the bobs' heights are schematic.</div> </div>",
  "k": "x:gv-pair"
 },
 {
  "t": "lead",
  "html": "“Water always finds its level” is the oldest argument there is, and it is <em>true</em>. It is also empty until someone says what <b>level</b> means. Level is not a geometrical idea: it is whatever a plumb line and a bubble say it is, and both of them are instruments that measure <b>gravity</b>.<sup class=\"ref\"><a href=\"#s-grav-n1\">[1]</a></sup> So the question is not whether water is level — it is — but what shape a surface has when it is everywhere perpendicular to the local vertical. That is a question with an answer you can measure, in three separate ways, without ever looking at the horizon.",
  "opener": true,
  "k": "gv-lead"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What both models agree on, stated first.</b> Still water sits perpendicular to gravity. A bubble level shows no slope on it. A plumb line hangs at right angles to it. None of that is in dispute here, and nothing on this page contradicts it. The disagreement is about three measurable consequences: whether the local vertical points the <em>same way</em> in two places, whether gravity gets <em>weaker</em> as you climb, and whether it has the <em>same strength</em> at every latitude. A flat world and a round one give different answers to all three, and the instruments are cheap.",
  "k": "gv-c0"
 },
 {
  "t": "h2",
  "html": "01 · Down is a direction, and it is not the same direction twice",
  "k": "gv-h1"
 },
 {
  "t": "notes",
  "html": "Hang a plumb bob in Marseille and another in Lille and ask the only question that matters: are the two strings <b>parallel</b>? On a plane they must be — “down” is one fixed direction for the whole world, so every vertical is a copy of every other. On a sphere they cannot be: each one points at the centre, so two of them separated by <b>d</b> along the ground make an angle <b>d/R</b> between them, which is 1° for every 111.2 km you travel. Both statements are testable, because the direction of a plumb line can be compared with the stars, and that comparison is exactly what <em>astronomic latitude</em> is.",
  "k": "gv-p1"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": null,
    "fallback": "Angle between two verticals &nbsp;=&nbsp; <span class=\"tex\" data-tex=\"\\g{\\frac{d}{R}}\"><b>d / R</b></span>"
   },
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"1\\deg\">1°</span> per <span class=\"tex\" data-tex=\"\\g{111.2\\,\\text{km}}\"><b>111.2 km</b></span>"
   },
   {
    "tex": null,
    "fallback": "flat plane: <b style=\"color:var(--flat)\"><span class=\"tex\" data-tex=\"\\f{0.000\\deg}\">0.000°</span>, always</b>"
   }
  ],
  "fig": "gravfig0",
  "gloss": "This is Eratosthenes' measurement stated in modern words. He compared two shadows, which is the same as comparing two verticals against the same distant light. Every ship's noon sight, every star transit recorded by a zenith telescope, and every levelling network re-measures it.",
  "k": "x:gv-f1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"gravDG\"></canvas> <div class=\"fcap\" id=\"gravDGCap\"></div> </div> <div class=\"fig\"> <canvas id=\"gravDF\"></canvas> <div class=\"fcap\" id=\"gravDFCap\"></div> </div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "gvVertRows",
  "caption": "Angle between two plumb lines, as a function of how far apart they hang",
  "head": [
   "Separation along the ground",
   "Globe, R = 6,371 km",
   "Flat: infinite plane",
   "Flat: disc, from its centre",
   "Measured (1° per 111.2 km)"
  ],
  "k": "x:gv-t1cap"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "",
  "html": "<p class=\"rate-note\">The last column is not a model output: it is the measured rate at which astronomic latitude changes with northward travel, which is how every degree of every meridian arc has been surveyed since Picard in 1670. The fourth column is computed below, by integrating the gravity of the disc itself.</p>",
  "k": "x:gv-n1"
 },
 {
  "t": "h2",
  "html": "02 · Give the flat model the best gravity it can have",
  "k": "gv-h2"
 },
 {
  "t": "notes",
  "html": "A flat earth is not obliged to have no gravity. Take the strongest version available and it is a good one: an <b>infinite uniform slab</b> of matter. By Gauss's law the field above such a slab is <b>2πGσ</b> — perpendicular to the surface, and exactly the same everywhere on it, forever. Water is level, plumb lines are parallel, nothing tilts. That model passes section 01 outright, and this page will not pretend otherwise. What it cannot do is survive being weighed.",
  "k": "gv-p2"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": null,
    "fallback": "Infinite slab: &nbsp;<span class=\"tex\" data-tex=\"g = \\f{2\\pi G\\sigma}\">g = <b style=\"color:var(--flat)\">2πGσ</b></span> &nbsp;⇒&nbsp; σ = <b id=\"gvSigma\">—</b>"
   },
   {
    "tex": null,
    "fallback": "at Earth's mean density that is <b id=\"gvSlabT\">—</b> of matter under every square metre, and no edge"
   }
  ],
  "fig": "gravfig1",
  "gloss": "σ is mass per square metre of surface. The number is forced: to feel 9.81 m/s² you need that much matter under every square metre, spread out to infinity in every direction. Give the slab an edge and the argument collapses — the missing matter beyond the rim stops pulling sideways, and everything near the rim tilts.",
  "k": "x:gv-f2"
 },
 {
  "t": "notes",
  "html": "So take the map the flat model actually publishes: a disc with the north pole at the centre and the rim 20,000 km out, the same disc the magnetism tab uses. Give it Earth's own mean density and make it thick enough to produce 9.81 m/s² at the pole. Now integrate its gravity at points across its face. The vertical component stays near 9.8 — but a <b>horizontal</b> component appears and grows with distance from the centre, because there is more disc on one side of you than the other. The local vertical tilts inward, and so does every level surface.",
  "k": "gv-p3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:16px 0\"> <canvas id=\"gravDisc\"></canvas> <div class=\"fcap\" id=\"gravDiscCap\"></div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "gvDiscRows",
  "caption": "The disc weighed against itself: tilt of the local vertical, computed by integrating the disc's own gravity",
  "head": [
   "Place on the flat map",
   "Distance from the centre",
   "Tilt of the vertical",
   "Slope water would run down",
   "Observed slope"
  ],
  "k": "x:gv-t2cap"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "gvDiscNote",
  "html": "<p class=\"rate-note\" id=\"gvDiscNote\"></p>"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The flat model cannot have it both ways.</b> To keep water level everywhere it needs a field perpendicular to the disc everywhere, which requires the disc to be infinite — no rim, no ice wall, no edge, and infinite mass. To keep its own map it needs a rim at 20,000 km, and then the field tilts by the amounts in the table above: about 7° at the latitude of Paris and 26° at the latitude of Sydney. A 7° slope is a 12% grade. Rivers would all run north, seas would pile against the pole, and a bubble level would be visibly off in every building in Europe. Nobody measures that, on either side of the argument.",
  "k": "gv-c2"
 },
 {
  "t": "h2",
  "html": "03 · Gravity weakens as you climb — and the rate <em>is</em> the radius",
  "k": "gv-h3"
 },
 {
  "t": "notes",
  "html": "Here is the measurement that separates the two models with no map, no horizon and no sightline. Above a sphere, g falls off as <b>1/(R+h)²</b>. Above an infinite slab it does not fall off at all: Gauss's law makes the field of an infinite plane independent of height, exactly, at every altitude. So one model predicts a definite gradient and the other predicts <b>zero</b>. This is a rule‑4 test: not a small difference, a presence against an absence.",
  "k": "gv-p4"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"\\frac{dg}{dh} = \\g{-\\frac{2g}{R}}\">dg/dh = <b>−2g/R</b></span> = <b id=\"gvGrad\">—</b> &nbsp;⇒&nbsp; <span class=\"tex\" data-tex=\"\\g{R = \\frac{2g}{\\left|dg/dh\\right|}}\"><b>R = 2g / |dg/dh|</b></span> = <b id=\"gvRfromG\">—</b>"
   }
  ],
  "fig": "gravfig2",
  "gloss": "Read it right to left and it stops being a correction and becomes an instrument. Every gravity survey on Earth applies the <b>free‑air correction</b>, 0.3086 mGal per metre of elevation<sup class=\"ref\"><a href=\"#s-grav-n2\">[2]</a></sup>, before anything else — and that constant, inverted, hands back the radius of the planet to a fraction of a percent. Geophysicists are not measuring the Earth's size when they apply it; they are using it, every day, and it works.",
  "k": "x:gv-f3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:16px 0\"> <canvas id=\"gravGrad\"></canvas> <div class=\"fcap\" id=\"gravGradCap\"></div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "gvHRows",
  "caption": "How much gravity you lose by climbing, and whether an instrument can see it",
  "head": [
   "Height above the surface",
   "Globe: change in g",
   "Infinite plane: change in g",
   "Times the noise of a field gravimeter"
  ],
  "k": "x:gv-t3cap"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "",
  "html": "<p class=\"rate-note\">A relative gravimeter reads to about 0.01 mGal in the field and a laboratory absolute meter to a few microgal, so the difference between the pavement and the first floor of a building is already dozens of times the noise. The effect has been mapped up a real hillside with a portable atom interferometer<sup class=\"ref\"><a href=\"#s-grav-n4\">[4]</a></sup>, and airborne surveys apply it routinely at 11 km<sup class=\"ref\"><a href=\"#s-grav-n3\">[3]</a></sup>.</p>",
  "k": "x:gv-n3"
 },
 {
  "t": "h2",
  "k": "gv-h3b",
  "html": "03b · Gravity measured up a 562 m tower"
 },
 {
  "t": "notes",
  "k": "gv-tow1",
  "html": "<b>In the late 1980s a gravimeter was carried up a television tower in North Carolina and read at twelve heights.</b> Going up 562 m, gravity fell by about 173 mGal, 0.018 % of g: what a globe's free-air gradient of 0.3086 mGal per metre predicts. The test was of Newton's law at the scale of hundreds of metres, so the prediction for each height was built from 77 gravity stations on the ground around the tower and data to 220 km; the observed values stayed within 0.55 mGal of it all the way up<sup class=\"ref\"><a href=\"#s-grav-n10\">[10]</a></sup>. A plane of any thickness, infinitely wide, predicts no change at all with height."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "gv-fx-tow",
  "fig": "gravFigTower",
  "lines": [
   {
    "tex": "\\Delta g(h) \\approx -\\frac{2g}{R}\\,h = -0.3086\\ \\text{mGal/m} \\times h",
    "fallback": "Δg(h) ≈ −(2g/R) h = −0.3086 mGal/m × h"
   },
   {
    "tex": "\\g{\\Delta g(562\\ \\text{m}) \\approx -173.5\\ \\text{mGal}},\\qquad \\text{observed} - \\text{predicted} = -0.55\\ \\text{mGal}",
    "fallback": "Δg(562 m) ≈ −173.5 mGal; observed − predicted = −0.55 mGal"
   }
  ],
  "gloss": "The first line is the globe's normal gradient; the second, the drop it predicts over the tower and how far the measurement departed from the full prediction, which also carried the local terrain. The paper gives only the departures, not the readings, and its prediction used a normal gravity field built with the Earth's radius: a check."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "gv-tow2",
  "html": "<b>The flat model's only escape is a gradient of its own.</b> An infinite slab has none; a finite disc has one only near its edge or its centre of mass, and none of the order of 2g/R under North Carolina. <b>What would vindicate it:</b> a gravimeter carried up a tall structure that reads the same at the top as at the bottom."
 },
 {
  "t": "h2",
  "html": "04 · Richer's clock, 1672: g is not the same at every latitude",
  "k": "gv-h4"
 },
 {
  "t": "notes",
  "html": "Jean Richer took a pendulum clock to Cayenne, 5° from the equator, and found it running <b>2 min 28 s per day slow</b><sup class=\"ref\"><a href=\"#s-grav-n5\">[5]</a></sup> against the stars, having kept perfect time in Paris. A pendulum's period depends only on its length and on g, so the clock was a gravimeter: gravity is weaker near the equator. Newton and Huygens both seized on it, for different reasons, and the modern reference formula<sup class=\"ref\"><a href=\"#s-grav-n3\">[3]</a></sup> reproduces it. An infinite slab predicts one value of g everywhere; a disc accelerating upward predicts one value of g everywhere; a rotating sphere predicts a systematic <b>sin²φ</b> pattern of about half a percent, pole to equator.",
  "k": "gv-p5"
 },
 {
  "t": "formula",
  "k": "gv-fx4",
  "fig": "gravFxPendulum",
  "lines": [
   {
    "tex": "T = 2\\pi\\sqrt{L/g} \\;\\Rightarrow\\; g_{\\text{Cayenne}} = g_{\\text{Paris}}\\left(1 - \\frac{\\Delta t}{86\\,400\\ \\text{s}}\\right)^2",
    "fallback": "T = 2π√(L/g) ⇒ g_Cayenne = g_Paris · (1 − Δt / 86,400 s)²"
   },
   {
    "tex": "g(\\varphi) = 9.7803\\,\\frac{1 + 0.001932\\sin^2\\varphi}{\\sqrt{1 - 0.006694\\sin^2\\varphi}}\\ \\text{m/s}^2",
    "fallback": "g(φ) = 9.7803 · (1 + 0.001932 sin²φ) / √(1 − 0.006694 sin²φ) m/s²"
   }
  ],
  "gloss": "T: period of a pendulum of length L · Δt: time the clock loses per day, 148 s for Richer, so g is 0.34 % weaker at Cayenne than in Paris · g(φ): the reference formula for a rotating, flattened Earth, which gives 0.30 % between the two · on a slab or an accelerating disc, g is the same everywhere and Δt = 0"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:16px 0\"> <canvas id=\"gravLat\"></canvas> <div class=\"fcap\" id=\"gravLatCap\"></div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "gvLatRows",
  "caption": "Standard gravity by latitude, and what a pendulum clock does about it",
  "head": [
   "Latitude",
   "g, international formula",
   "Difference from the pole",
   "Clock rate vs Paris",
   "Any flat model"
  ],
  "k": "x:gv-t4cap"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "gvLatNote",
  "html": "<p class=\"rate-note\" id=\"gvLatNote\"></p>"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The limit of a sphere, admitted.</b> Rotation alone accounts for about two thirds of the pole‑to‑equator difference: ω²R at the equator is 0.0339 m/s² against a measured 0.0519<sup class=\"ref\"><a href=\"#s-grav-n3\">[3]</a></sup>. The missing third comes from the equatorial bulge, which this page does not model — everywhere else the sphere is good enough, and here it is not. That residual is not an embarrassment, it is Newton's prediction: a rotating self‑gravitating fluid must flatten, by roughly 1 part in 300, and the Lapland and Peru arc expeditions of the 1730s went out to measure precisely that. A flat model has no residual to explain because it predicts no variation at all.",
  "k": "gv-c4"
 },
 {
  "t": "h2",
  "html": "05 · Mass attracts mass, and you can watch a mountain prove it",
  "k": "gv-h5"
 },
 {
  "t": "notes",
  "html": "In 1774 Nevil Maskelyne parked two observatories on the north and south flanks of Schiehallion and measured the vertical against the stars from each. The plumb lines leaned <em>toward the mountain</em>, by a total of <b>11.6″</b><sup class=\"ref\"><a href=\"#s-grav-n6\">[6]</a></sup>. That single number does three jobs at once. It shows gravity is not a fixed downward direction but an attraction toward matter. It gave Charles Hutton the Earth's mean density, about 4.5 times water, later refined to <b>5.51</b><sup class=\"ref\"><a href=\"#s-grav-n8\">[8]</a></sup>. And it is why the flat model's field has to be produced by something: a field that simply <em>points down</em>, with no matter making it, is not a physical theory, and the moment matter makes it, a disc's rim starts pulling sideways<sup class=\"ref\"><a href=\"#s-grav-n7\">[7]</a></sup>.",
  "k": "gv-p6"
 },
 {
  "t": "notes",
  "html": "Cavendish closed the loop in 1798<sup class=\"ref\"><a href=\"#s-grav-n9\">[9]</a></sup> by measuring the attraction between lead balls in a room, which fixes <b>G</b>. With G in hand, g and R give the mass of the planet directly:<b id=\"gvMass\"></b>, and a mean density of<b id=\"gvDens\"></b> — twice the density of surface rock. Something denser is inside. The seismology tab finds that same something independently, from the shadow zone of P waves, and puts its boundary at 2,891 km. Two completely unrelated measurements, one object.",
  "k": "gv-p7"
 },
 {
  "t": "formula",
  "k": "gv-fx5",
  "fig": "gravFxCavendish",
  "lines": [
   {
    "tex": "m g = \\frac{G M m}{R^2} \\;\\Rightarrow\\; M = \\frac{g R^2}{G},\\qquad \\bar\\rho = \\frac{M}{\\frac{4}{3}\\pi R^3} = \\frac{3g}{4\\pi G R}",
    "fallback": "m g = G M m / R² ⇒ M = g R² / G,  ρ̄ = M / (4/3 π R³) = 3g / (4π G R)"
   }
  ],
  "gloss": "G: the gravitational constant, measured by Cavendish in a room · g: gravity at the surface · R: the Earth's radius, from the surveyors · with g = 9.81 m/s², R = 6,371 km and G = 6.674 × 10<sup>−11</sup>: M = 5.97 × 10<sup>24</sup> kg and ρ̄ = 5.5 g/cm³, twice surface rock"
 },
 {
  "t": "h2",
  "html": "06 · “Things fall because of density, not gravity”",
  "k": "gv-h6"
 },
 {
  "t": "notes",
  "html": "This is the usual alternative and it deserves a straight answer. Buoyancy is real and it is Archimedes' law: the upward force on a body in a fluid is <b>ρ<sub>fluid</sub> V g</b>. The g is inside the formula. Density decides which way a thing moves <em>through</em> a fluid; it cannot supply the field that defines “down”, and it says nothing at all in a vacuum, where a feather and a hammer fall together. The serious flat proposal is the other one — the disc accelerating upward at 9.8 m/s² — and it is a real theory, so it can be priced.",
  "k": "gv-p8"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "gvModelRows",
  "caption": "Three flat proposals against three measurements. A cross is a prediction the measurement contradicts",
  "head": [
   "Model",
   "Vertical tilts with position?",
   "g falls with height?",
   "g varies with latitude?"
  ],
  "k": "x:68c2cc7f"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>Where the accelerating disc dies.</b> Constant proper acceleration reproduces free fall perfectly — that is Einstein's equivalence principle and it is not a joke. But an accelerating floor accelerates <em>all</em> of itself equally: the same 9.8 m/s² at the pole and at the rim, in the cellar and at the top of the Burj Khalifa. It therefore predicts a free‑air gradient of exactly zero and a latitude variation of exactly zero, and both are measured, daily, by people whose surveys would not close if they ignored them. It also has to explain why the whole disc has been accelerating for the age of the universe without arriving anywhere.",
  "k": "gv-c6"
 },
 {
  "t": "exp",
  "h": "Experiment 1f · gravity and level",
  "title": "Weigh the same object in two cities, or time a pendulum in both",
  "lead": "Every flat model on the table predicts that g is one number, the same everywhere. The globe predicts a specific difference between any two latitudes, set by rotation and the bulge. Two ways to see it: a pendulum, whose period goes as 1/√g, or a good spring‑type balance carrying a heavy mass. Pick your two places, and the calculator tells you in advance how big the effect is and whether your kit can resolve it.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the <b>latitude</b> at which you make the measurement. Nothing else — same instrument, same mass, same pendulum, carried between the two places.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>period</b> of the pendulum, or the <b>reading</b> of the balance. Both are proxies for g and the world decides them.",
  "meta": [],
  "inputs": [
   [
    "expGvA",
    "Latitude A <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expGvA\" value=\"43.3\" min=\"-90\" max=\"90\" step=\"0.1\""
   ],
   [
    "expGvB",
    "Latitude B <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expGvB\" value=\"50.6\" min=\"-90\" max=\"90\" step=\"0.1\""
   ],
   [
    "expGvL",
    "Pendulum length <span class=\"unit\">(m)</span>",
    " type=\"number\" id=\"expGvL\" value=\"2\" min=\"0.1\" max=\"20\" step=\"0.1\""
   ],
   [
    "expGvM",
    "Mass on the balance <span class=\"unit\">(kg)</span>",
    " type=\"number\" id=\"expGvM\" value=\"10\" min=\"0.1\" max=\"200\" step=\"0.5\""
   ]
  ],
  "out": "expGvOut",
  "verdict": "expGvV",
  "k": "x:gv-exph"
 },
 {
  "t": "h2",
  "html": "07 · Two tides a day: what the Moon's pull does to a ball",
  "k": "gv-h7"
 },
 {
  "t": "notes",
  "k": "gv-td1",
  "html": "The usual flat answer for the tide is that the Moon pulls the water up under it. That gives <b>one</b> high water a day, while the Moon is overhead. Most coasts have <b>two</b>, 12 h 25 min apart, and the second comes when the Moon is on the other side of the Earth, under your feet. The far side bulges too, and the reason takes one idea: the whole Earth is falling towards the Moon, so what moves the water is not the Moon's pull but how much that pull <em>differs</em> from the pull at the Earth's centre."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"gravAnimTide\" style=\"height:clamp(460px,62vw,580px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "gravAnimTide-cap",
  "html": "<b>Six steps, from one fall to two tides.</b> 1: the Earth and the Moon at true scale, each falling round their common centre, which lies inside the Earth. 2: the Moon's pull at twelve points (black), then each minus the pull at the centre (blue, drawn 20 times longer): outward on both sides along the line to the Moon, inward across it. 3: the water those differences pile up, seen from above the North Pole, and a port carried round by the Earth's turn: two high waters every 24 h 50 min. 4: the Sun's pair of bulges, 0.46 times as strong, turns once a month against the Moon's: spring tides at new and full moon, neap tides at the quarters. 5: with the Moon 28° from the equator the bulges are tilted and a port at 45° N gets one big and one small tide a day. 6: the flat model's best case, a Moon 5,000 km above a plane: one hump, one tide a day. The water heights are drawn millions of times higher than they are, and the factor is written on each picture. This is the <em>equilibrium</em> tide, the shape the water would take if it had time to follow; real seas answer it with delays and resonances (next section). Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "gv-fx-td",
  "fig": "gravFxTide",
  "lines": [
   {
    "tex": "a_{\\text{axis}} = \\frac{GM}{(d-r)^2} - \\frac{GM}{d^2} \\approx +\\frac{2GMr}{d^3},\\qquad a_{\\text{across}} \\approx -\\frac{GMr}{d^3}",
    "fallback": "a∥ = GM/(d−r)² − GM/d² ≈ +2GMr/d³, a⊥ ≈ −GMr/d³"
   },
   {
    "tex": "\\g{h(\\theta) = \\frac{M_\\mathrm{L}}{M_\\mathrm{T}}\\left(\\frac{R}{d}\\right)^{3} R\\,\\frac{3\\cos^2\\theta - 1}{2}}",
    "fallback": "<b>h(θ) = (M_L/M_T)(R/d)³ R (3cos²θ − 1)/2</b>"
   }
  ],
  "gloss": "M is the Moon's mass, d its distance, r the distance of a point from the Earth's centre along the line to the Moon. The near side is pulled harder than the centre and the far side less hard; both differences point away from the centre, with the same size, 2GMr/d³. Across the line the pull converges and squeezes inward, half as hard. The height h the water would take is the potential of that difference divided by g: θ is the angle from the point under the Moon, M_L/M_T = 1/81.3 the Moon's mass over the Earth's, R the Earth's radius. With d = 60.3 R it is 0.36 m at θ = 0 and at θ = 180°, two bulges; −0.18 m round the ring between them.<sup class=\"ref\"><a href=\"#s-grav-n12\">[12]</a></sup>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "gv-fx-tdk",
  "fig": "gravFxTideKep",
  "lines": [
   {
    "tex": "\\frac{GM}{d^3} = \\left(\\frac{2\\pi}{T}\\right)^2",
    "fallback": "GM/d³ = (2π/T)²"
   },
   {
    "tex": "\\g{\\frac\\mathrm{Sun}\\mathrm{Moon} = \\left(\\frac{T_\\mathrm{L}}{T_{\\odot}}\\right)^{2}\\left(1 + \\frac{M_\\mathrm{T}}{M_\\mathrm{L}}\\right) = \\left(\\frac{27.32}{365.26}\\right)^{2} \\times 82.3 = 0.46}",
    "fallback": "<b>Sun/Moon = (T_L/T_☉)² (1 + M_T/M_L) = (27.32/365.26)² × 82.3 = 0.46</b>"
   },
   {
    "tex": "\\frac{N_2}{M_2} = \\frac{7e}{2} = 0.19",
    "fallback": "N₂/M₂ = 7e/2 = 0.19"
   }
  ],
  "gloss": "Both tides go as GM/d³, and Kepler's third law gives exactly that quantity from a period: the year for the Sun, the sidereal month for the Moon, of which the Moon's own share is M_L/(M_T + M_L), 1 part in 82.3<sup class=\"ref\"><a href=\"#s-grav-n13\">[13]</a></sup>. No distance in kilometres is needed: the Sun's tide is 0.46 of the Moon's, a little under half. The potential's own coefficients give S2/M2 = 0.465<sup class=\"ref\"><a href=\"#s-grav-n12\">[12]</a></sup>. Kepler's first law gives another line: the Moon's orbit is an ellipse of eccentricity e = 0.0549<sup class=\"ref\"><a href=\"#s-grav-n13\">[13]</a></sup>, so its pull swells at perigee every 27.55 days; the tide it raises splits off a line called N2, 7e/2 = 0.19 of the main one, M2."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "gv-td-c",
  "html": "<b>The flat model at its best.</b> Give it the most favourable Moon there is: as heavy and as low as it likes, circling over the disc once every 24 h 50 min. Water climbs towards a pull, and on a plane every point is on the same side of the Moon, so the water gathers in one hump under it and the level only falls as one moves away (last scene, <em>h</em> ∝ 1/√(<em>x</em>² + <em>H</em>²) for a Moon at height <em>H</em>). That is one high water a day. A second hump on the far side needs the ground itself to fall towards the Moon faster than the far water does, which is what a free body in orbit does and a plane held still does not. A flat model can still decree two humps, by choosing a rule for the water as a function of the Moon's direction; then it also has to choose the 14.77-day spring tides, the Sun's 0.46 and the 13.66-day cycle of the diurnal tides one by one, where the globe gets all three from the periods above."
 },
 {
  "t": "h2",
  "html": "07b · What the tide gauges record",
  "k": "gv-h7b"
 },
 {
  "t": "notes",
  "k": "gv-td2",
  "html": "Five gauges, one year each, a reading every hour: the research-quality records of the University of Hawaii Sea Level Center for 2018<sup class=\"ref\"><a href=\"#s-grav-n11\">[11]</a></sup>. They were chosen for their differences: Brest has big tides twice a day; Marseille has almost none; Pensacola, in the Gulf of Mexico, has one a day; Manila mixes both; Fremantle, in the southern hemisphere, has small daily ones. Each record is read three ways. Two use nothing but the gauge's clock: the strongest periods in the record, and the period at which the daily range swells and shrinks. The third, the harmonic analysis that tide tables are made from, takes the frequency of each line from the motions of the Moon and the Sun and fits its height and its delay<sup class=\"ref\"><a href=\"#s-grav-n15\">[15]</a></sup>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"gravFigTideSpec\"></div></div>"
 },
 {
  "t": "fcap",
  "k": "gravFigTideSpec-cap",
  "html": "<b>The lines in a year of sea level.</b> The amplitude of the best sine wave at each frequency (the periodogram), each gauge scaled to its own highest line, whose height is written on the left. Dashes: the frequencies of the five largest lines of the tide-generating potential. Every record has its energy at those frequencies and nowhere else in the band. Read off the records themselves, the strongest twice-daily line is at <b><span class=\"cv\" data-v=\"pSemi\">…</span> h</b> at all five gauges; the Moon's half-day is 12.4206 h. Brest's M2 is <span class=\"cv\" data-v=\"brM2\">…</span> m; Pensacola's twice-daily lines almost vanish under its daily ones."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"gravFigTideMonth\"></div></div>"
 },
 {
  "t": "fcap",
  "k": "gravFigTideMonth-cap",
  "html": "<b>March 2018, hour by hour.</b> Top: Brest, two tides a day whose range swells after each new and full moon (blue dashes) and shrinks after the quarters. Middle: Pensacola, one tide a day, largest when the Moon is farthest from the equator (bottom curve, its declination) and almost gone when it crosses it. The Moon's phases and declination are computed with the page's ephemeris (Meeus); the sea level is the gauge's, less its running 25-hour mean (the weather's slow part)."
 },
 {
  "t": "raw",
  "tag": "table",
  "class": "cnav-table",
  "id": "gravTabTides",
  "html": "<table class=\"cnav-table\" id=\"gravTabTides\"></table>"
 },
 {
  "t": "fcap",
  "k": "gravTabTides-cap",
  "html": "<b>Five gauges against the globe and Kepler.</b> Kind: the form factor F = (K1 + O1)/(M2 + S2) of the harmonic analysis<sup class=\"ref\"><a href=\"#s-grav-n14\">[14]</a></sup>. Line: the strongest twice-daily period read off the record. Range beats: the period at which the range of each lunar day swells and shrinks, also read off the record: 14.77 days where the twice-daily tide leads (the Moon's and Sun's bulges falling in and out of step), 13.66 days where the daily tide leads (the Moon's declination, twice a month). Ratios: heights of the lines from the harmonic analysis; last row, what the globe and Kepler give (N2/M2 = 7e/2, S2/M2 from the periods, K1/O1 from the potential<sup class=\"ref\"><a href=\"#s-grav-n12\">[12]</a></sup>)."
 },
 {
  "t": "callout",
  "flat": false,
  "k": "gv-td-lim",
  "html": "<b>What fits and what does not.</b> The periods fit everywhere, to the second, and the beats to a few hours: those come from the sky alone. The heights do not follow the equilibrium tide, and should not: the sea needs hours to move and each basin rings at its own periods, so the tide turns around points where it vanishes and reaches several metres in funnels like the Channel<sup class=\"ref\"><a href=\"#s-grav-n14\">[14]</a></sup>. Neighbouring lines are answered alike, so their ratios survive best: N2/M2, the trace of the Moon's ellipse, is <span class=\"cv\" data-v=\"brN2\">…</span> at Brest against 0.19. Lines further apart fare worse: S2/M2 is <span class=\"cv\" data-v=\"brS2\">…</span> at Brest, not 0.46, and <span class=\"cv\" data-v=\"frS2\">…</span> at Fremantle, where the twice-daily tide is small and the local response odd. Spring tides come <span class=\"cv\" data-v=\"brAge\">…</span> days after new and full moon at Brest (the age of the tide). At Marseille the fit explains only <span class=\"cv\" data-v=\"mrExp\">…</span> % of the variance: the tide is a few centimetres and the weather moves the sea more."
 },
 {
  "t": "notes",
  "k": "gv-td-v",
  "html": "<b>What would count for the flat model.</b> A gauge with one high water per lunar day and no line at 12 h 25 min anywhere along a coast, or a spring-neap cycle that does not follow the phases of the Moon. Pensacola has one high water a day, but its record still has the 12 h 25 min line, and its range follows the Moon's declination at 13.66 days, as the tilted bulges of the fifth scene predict."
 },
 {
  "t": "h2",
  "html": "07c · The tide globe: the pull and the real tides together",
  "k": "gv-h7c"
 },
 {
  "t": "notes",
  "k": "gv-tg1",
  "html": "The two sections above take the pull and the gauges apart. This one puts them together: the surface the Moon and the Sun would give a still ocean, and the tide that more than six hundred gauges actually measure, on one turning Earth, at the same instant and the same scale. Each gauge's tide is computed from the constants TICON-3 fitted to its own record<sup class=\"ref\"><a href=\"#s-grav-n16\">[16]</a></sup>, eight lines that carry most of the tide; on our five gauges they agree with our own analysis above, once a quarter-cycle difference of convention in the daily lines is taken out."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"gravAnimTideGlobe\" style=\"height:clamp(480px,66vw,620px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "gravAnimTideGlobe-cap",
  "html": "<b>The pull and the real tides on one globe.</b> Shading and blue outline: the surface the Moon's and the Sun's pull would give a still ocean at that instant (the equilibrium tide, their positions from the page's ephemeris). Spikes: <span class=\"cv\" data-v=\"nGlobe\">…</span> tide gauges of TICON-3, one per 2° cell<sup class=\"ref\"><a href=\"#s-grav-n16\">[16]</a></sup>; each spike is the tide that gauge's own measured constants give for that instant, blue above its mean, red below, at the same scale as the outline. The camera follows the Moon, 90° from it, so its two bulges sit on the left and right edges and the Earth turns under them. Scene 1: two days from the new moon of 17 March 2018. Scene 2: the Moon's twice-daily line M2 alone (and the Moon held on the equator). Scene 3: a month seen once every lunar day, 24 h 50 min, so the twice-daily rhythm stands still and only spring and neap remain. What to look at: the spikes rise and fall with the bulges' clock, but not under them; the North Atlantic is high while the Indian Ocean is low, and some gauges hardly move. That is the ocean's answer to the pull, set by its basins, not a failure of the pull: the periods are the same everywhere. Spikes longer than <span class=\"cv\" data-v=\"clipM\">…</span> m are cut and ringed. Click to pause."
 },
 {
  "t": "h2",
  "html": "07d · Why small seas have almost no tide",
  "k": "gv-h7d"
 },
 {
  "t": "notes",
  "k": "gv-ss1",
  "html": "The tide is not water lifted where it stands. Over the open ocean the bulges travel round the Earth once every 24 h 50 min, and the water rises because it is carried in from far away. A closed lake cannot be fed: the pull can only tilt its surface, raising one end as the other falls, and the tilt is the slope of the equilibrium surface over the lake's length. That slope is A/R at most per unit length, with A = 0.24 m the Moon's twice-daily equilibrium tide at the equator<sup class=\"ref\"><a href=\"#s-grav-n14\">[14]</a></sup>, so a basin of length L can have a tide of at most A·L/R: under a millimetre for a lake of 20 km, a few centimetres for a sea a thousand kilometres long."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "gv-fx-ss",
  "fig": "gravFxBay",
  "lines": [
   {
    "tex": "\\eta \\le A\\,\\frac{L}{R},\\qquad A = 0.24\\ \\text{m}",
    "fallback": "η ≲ A·L/R, A = 0.24 m"
   },
   {
    "tex": "\\g{T_{\\text{bay}} = \\frac{4L}{\\sqrt{gh}}}",
    "fallback": "<b>T_bay = 4L/√(gh)</b>"
   }
  ],
  "gloss": "η: the tide of a closed basin of length L; R the Earth's radius. Lake Geneva, 73 km: 3 mm at most. Lake Superior, 560 km: 2 cm at most, and the NOAA gives under 5 cm for its spring tide, all lines together<sup class=\"ref\"><a href=\"#s-grav-n17\">[17]</a></sup>. The Black Sea, 1,150 km: 4 cm at most, 2 cm measured. T_bay: the natural period of a bay open at one end, of length L and depth h (Merian's formula, the wave goes in and back twice); when it is near 12 h 25 min, each tide adds to the last. The Bay of Fundy with the Gulf of Maine rings at about 13 hours<sup class=\"ref\"><a href=\"#s-grav-n18\">[18]</a></sup>, which is why M2 alone reaches <span class=\"cv\" data-v=\"fundyMax\">…</span> m at the head of the bay<sup class=\"ref\"><a href=\"#s-grav-n16\">[16]</a></sup>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"gravFigSmallSeas\"></div></div>"
 },
 {
  "t": "fcap",
  "k": "gravFigSmallSeas-cap",
  "html": "<b>The twice-daily tide, sea by sea.</b> The M2 amplitude of every coastal gauge of TICON-3 inside a box round each sea<sup class=\"ref\"><a href=\"#s-grav-n16\">[16]</a></sup> (number of gauges in brackets): the bar covers the middle half, the dot is the median, on a logarithmic scale. Rings: the most a closed basin of that length could have, A·L/R (lengths rounded, along each sea's main axis). The enclosed seas all sit below their ring; the Baltic far below, since it has its own points of no tide. The Mediterranean is not closed: Gibraltar lets in a little of the Atlantic tide, and resonant corners (the gulf of Gabès, the north Adriatic) reach <span class=\"cv\" data-v=\"medMax\">…</span> cm. The open coasts are a hundred times higher, and Fundy higher still, by resonance."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "gv-ss-c",
  "html": "<b>The flat model and the lakes.</b> A Moon a few thousand kilometres up lifting the water beneath it would lift a lake as surely as an ocean: the pull on each litre does not depend on how much water is around it. The lakes of the world should then have tides like the coasts. They have millimetres to centimetres, in proportion to their length, as the tilt of a globe's equilibrium surface predicts; and the seas behind narrow straits have less than the ocean outside. What would count for the flat model: a closed lake with a tide of the same size as the open coast nearby."
 },
 {
  "t": "notes-block",
  "paras": [
   "<p><span class=\"k\">The through‑line.</span> “Level” is the hinge this whole page turns on. The horizon‑dip tab measures how far the horizon sits below level; the surveying tab shows the curvature correction that a levelled sightline needs; the hidden‑height tab counts what a level surface hides. All three assume that level means perpendicular to gravity — and this tab is where that assumption is cashed out and measured. The same R comes back a fourth way here, out of a gravimeter, with no light involved at all.</p>"
  ],
  "k": "x:gv-n9"
 },
 {
  "t": "xrefs",
  "keys": [
   "seis",
   "gps",
   "surv",
   "fou"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
