// Prose de l'onglet ct, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Celestial theodolite · someone else's experiment, taken seriously"
 },
 {
  "t": "h1",
  "html": "They swapped the theodolite for a clock. That part works."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "figopen opener",
  "id": "ct-figOpen",
  "html": "<div class=\"figopen opener\" id=\"ct-figOpen\"></div>"
 },
 {
  "t": "fcap",
  "html": "The instant that makes the measurement. The observer, the crest and the star lie on <b>one straight line</b>, so the star's altitude at that second is also the elevation angle of the crest. Nothing is measured with an instrument: the clock says <em>when</em>, and an almanac turns the when into an angle. The two angles marked at the ends of that one line are what the method turns on — on a plane they are equal. Elevation enlarged.",
  "k": "ct-fcap0"
 },
 {
  "t": "lead",
  "html": "A flat-earth project called the <b>Celestial Theodolite</b> films a star being occulted by a mountain. The occultation puts the observer, the crest and the star on <b>one straight line</b>, and the claim is that on a plane, where every horizontal is parallel to every other, that one line must make the <em>same</em> angle at both ends. The clock supplies the angle: a star's altitude at a stated second is known to arcseconds. The published target list runs from 8.8 to 130.7 km and pays a bounty for recordings<sup class=\"ref\"><a href=\"#s-ct-n1\">[1]</a></sup>; the method is argued in a recorded debate<sup class=\"ref\"><a href=\"#s-ct-n2\">[2]</a></sup> and, as of the last check, in no methodology paper<sup class=\"ref\"><a href=\"#s-ct-n3\">[3]</a></sup>.",
  "opener": true,
  "k": "ct-p1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The idea is a good one, and this page has a rule about saying so.</b> Every reciprocal-angle test here levels an instrument with a bubble, and a bubble is gravity — the very thing under dispute. A star has no bubble. At 45° a star setting due west drops <b>10.6″ every second</b>, so a GPS-synchronised phone reads an angle to better than 0.2′. That is an order of magnitude finer than the difference between the two models over these distances. <em>The timing is not the weak part of this experiment.</em>",
  "k": "ct-callout1"
 },
 {
  "t": "h2",
  "html": "1 · What the clock buys",
  "k": "ct-h2a"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\frac{d\\alpha}{dt} = 15.041″\\,\\mathrm{s}^{-1} \\times \\cos\\varphi \\times \\sin A",
    "fallback": "dα/dt = 15.041″/s × cos φ × sin A"
   }
  ],
  "fig": "ctfig1",
  "gloss": "How fast a star loses altitude. φ is your latitude, A is the star's azimuth counted from north, and the rate is fastest due east and due west and zero due north and due south. The sidereal rate 15.041° per hour is 15.041 arcseconds per second of clock<sup class=\"ref\"><a href=\"#s-ct-n5\">[5]</a></sup>, which is the coincidence that makes this method cheap: one second of clock error is a tenth of the effect at the shortest range on that list, and under a hundredth of it at the longest.",
  "k": "x:ct-g1"
 },
 {
  "t": "table",
  "id": "ct-tabRate",
  "tbody": "",
  "caption": "Seconds of clock worth one arcminute of altitude. Read it as the timing precision you need: anywhere below about 60° of latitude, and on a star setting anywhere near west, a clock good to one second is already ten times better than the angle in dispute.",
  "head": [],
  "k": "x:ct-cap1"
 },
 {
  "t": "h2",
  "html": "2 · What the two models predict",
  "k": "ct-h2b"
 },
 {
  "t": "notes",
  "html": "Take the two ends of that line — the observer, and the crest the star is grazing — and ask each for the star's altitude at the same second. On a plane the two horizontals are parallel, so the difference is <b>0.000°, with no free parameter at all</b>. On a globe the two local verticals diverge by the central angle γ, so the same straight line makes two different angles, and the difference is γ. It is the surveying tab's reciprocal-angle test from the other direction: a prediction of exactly zero against one that grows with distance. A federal survey crew observed the same quantity over 70 to 93 km lines in 1977, though the report is a scan whose readings could not be recovered here<sup class=\"ref\"><a href=\"#s-ct-n9\">[9]</a></sup>.",
  "k": "ct-p2"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "\\theta_{2} - \\theta_{1} = 0 \\quad \\text{(plane, exactly)}",
    "fallback": "θ₂ − θ₁ = 0 (plane, exactly)"
   },
   {
    "tex": "\\theta_{2} - \\theta_{1} = \\gamma = s/R \\quad \\text{(globe)}",
    "fallback": "θ₂ − θ₁ = γ = s / R (globe)"
   }
  ],
  "fig": "ctfig2",
  "gloss": "θ₁ is the star's altitude above the observer's horizontal, θ₂ its altitude above the crest's horizontal at the same instant, s the distance between them and R the radius. Neither height appears: the two heights cancel out of the difference, which is what makes this worth measuring. With refraction the globe's figure becomes γ(1 − k)<sup class=\"ref\"><a href=\"#s-ct-n7\">[7]</a></sup>; the plane's stays exactly zero, because a plane has nothing to correct.",
  "k": "x:ct-g2"
 },
 {
  "t": "table",
  "id": "ct-tabSep",
  "tbody": "",
  "caption": "Distances are the ones published on the project's target list<sup class=\"ref\"><a href=\"#s-ct-n1\">[1]</a></sup>; γ is computed here, and the last column says how many seconds of star motion that angle is worth at latitude 45° due west. At 50.8 km γ is 27.4′ — the same 0°27′ the project's spreadsheet prints as the globe's slant, so this is not a disputed number. There is no measured column because no recording has been checked on this page, and a column headed <em>measured</em> stays empty until it can be filled from something published.",
  "head": [],
  "k": "x:ct-cap2"
 },
 {
  "t": "fold",
  "q": false,
  "k": "ct-fold1",
  "summary": "<b>How the clock column is worked out</b><span class=\"fold-teaser\">Three lines of arithmetic, so the table above can be recomputed by hand for any peak and any latitude</span>",
  "html": "<p class=\"notes\">Take γ from the column beside it, in arcminutes, and multiply by 60 to get arcseconds. Divide by the rate at which the star is losing altitude, 15.041 cos φ sin A arcseconds per second of clock — 10.635 at latitude 45° on a star setting due west, which is what the column assumes. The result is how much clock time that angle is worth: the size of the timing error that would be needed to fake it. Nothing else enters, and in particular no height, since the heights cancel out of a difference between two vantages.</p>"
 },
 {
  "t": "h2",
  "html": "3 · Where the execution decides the result",
  "k": "ct-h2c"
 },
 {
  "t": "notes",
  "html": "<b>The star is occulted by the skyline, not by the summit.</b> It comes down at an angle and vanishes wherever its path crosses the silhouette — a point on the ridge with its own height and distance. The instructions themselves say to aim for the summit where possible and to send daytime reference photographs<sup class=\"ref\"><a href=\"#s-ct-n1\">[1]</a></sup>. In numbers: at 50 km, a crest height wrong by 30 m moves the angle by 2.1′, a thirteenth of the 27′ at stake — not fatal, but the crest must be identified before the arithmetic starts, not after.",
  "k": "ct-p3"
 },
 {
  "t": "notes",
  "html": "<b>The refraction correction is switched off, and that is presented as the answer to refraction.</b> The method's own diagrams specify Stellarium with the refraction correction function <em>off at both vantages</em><sup class=\"ref\"><a href=\"#s-ct-n2\">[2]</a></sup>. But a checkbox in a program does not reach the air. Turning the correction off does not remove the bending; it removes it from the number, and leaves the observation uncorrected rather than unaffected. At the altitude in the worked case, 2°31′, astronomical refraction is 15.1′<sup class=\"ref\"><a href=\"#s-ct-n6\">[6]</a></sup> — which is the 15 arcminutes printed in the same spreadsheet, so the size of the thing being switched off is not in dispute either.",
  "k": "ct-p4"
 },
 {
  "t": "notes",
  "html": "<b>A switch with two positions and two places to apply it is a free parameter.</b> Off at both ends, off at one, on at one: those are four settings, and they move the answer by up to 15′ against a disagreement of 27′. This page allows itself exactly one refraction coefficient, announced in advance, applied to the globe only, with the uncorrected value printed beside the corrected one — and the reason for that rule is visible here. Whichever setting is chosen, it has to be chosen <em>before</em> the two angles are compared, and stated.",
  "k": "ct-p5"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>And refraction lifts a distant object; it does not lower it.</b> A ray through the lower atmosphere bends downward, toward the surface, so a summit is seen <em>higher</em> than bare geometry puts it and less of it is hidden — that is exactly what R_eff = R/(1 − k) means, an effective radius <em>larger</em> than the real one, curvature partly cancelled<sup class=\"ref\"><a href=\"#s-ct-n7\">[7]</a></sup>. Any argument that reads the refraction literature as showing that summits sit <em>lower</em> has the sign backwards, and it matters: with the sign the right way round, refraction is a term that helps the flat model's numbers look closer, not a defect of the globe.",
  "k": "ct-callout4"
 },
 {
  "t": "notes",
  "html": "<b>And the second vantage is often not there at all.</b> The call for recordings asks for a single video from a single place<sup class=\"ref\"><a href=\"#s-ct-n1\">[1]</a></sup>. With one end only, there is no pair of angles to difference, and the zero the plane predicts has nothing to be tested against: what remains is one measured altitude compared with a number the same software computed, which is where the next section starts.",
  "k": "ct-p6b"
 },
 {
  "t": "h2",
  "html": "4 · The simplest objection, and it is built from the method's own instrument",
  "k": "ct-h2d"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figPole\"></div> <div class=\"fcap\"><b>Figure 1 — the rule.</b> One line of sight, three stations lying on it. On a plane every horizontal is parallel to every other, so the one line makes the same angle a at each of them.</div> </div>",
  "k": "x:ct-fcap1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figZero\"></div> <div class=\"fcap\"><b>Figure 2 — the same rule, one direction later.</b> Same construction, one change: the line of sight is horizontal. That is the fixed point of the sky as an observer on the equator sees it, on the horizon, at 0°.</div> </div>",
  "k": "x:ct-fcap2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "The method carries an angle from one station to the next, and figure 1 is that rule. So carry it, in a direction whose angle is already known somewhere: the <b>fixed point of the sky</b>, which an observer on the equator sees at 0°. A direction horizontal at one station is horizontal at the next, the horizontals being parallel; apply it again and again — figure 2 — and the fixed point sits at 0° everywhere on Earth. <b>From Paris it is at 48.9°</b>, and Polaris marks it to 0.6°. No instrument, no second observer, no clock, no software — and the 2,930′ to explain is 86 times the biggest nuisance term the horizon has to offer.",
  "k": "ct-callout2"
 },
 {
  "t": "raw",
  "html": "<table id=\"ct-tabDilemma\"> <caption>The two ways out, and there is no third: the instrument that supplies the measured angle assumes the very thing the conclusion has to deny.</caption> <tr><th>If they keep</th><th>Then they lose</th></tr> <tr><td>The distant sky of the ephemeris software — stars far enough away that their rays arrive parallel, which is what lets an altitude be tabulated at all.</td> <td>The premise that horizontals are parallel, refuted by any observation of the pole from a mid-latitude.</td></tr> <tr><td>A near sky — a dome a few thousand kilometres up, whose rays are not parallel, so the same direction can make different angles in different places.</td> <td>The software, which computes altitudes on a globe with the stars at infinity. Without it there is no measured angle at all, and the method has nothing left to read.</td></tr> </table>",
  "k": "x:ct-cap3"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What this objection does not do.</b> It does not show that any recording is wrong, or that a timing is sloppy. It shows that the number the method calls <em>the measured angle</em> is defined by the globe, so a result cannot be read as evidence for a plane until someone publishes a flat star ephemeris — a dome height and a ground track per star — and recomputes the same occultations in it. That would be a real test, and this page would have to take it seriously. Nobody has published one.",
  "k": "ct-callout3"
 },
 {
  "t": "h2",
  "html": "5 · Which model fits the published readings",
  "k": "ct-h2g"
 },
 {
  "t": "notes",
  "html": "One number is measured: the second at which the star is cut by the crest. Everything else is computed. From that second an almanac gives the star's altitude; from the published coordinates, trigonometry gives the crest's elevation angle — <b>a different one for each model</b>. Subtract, and the leftover is the residual. This answers the obvious worry that the comparison must be circular: the star's altitude comes from the clock and does not know which model you hold, while the two crest angles differ by s/2R, which is 35′ at 131 km. The star altitude cannot sit on both.",
  "k": "ct-p8"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--ink)",
  "lines": [
   {
    "tex": "\\Delta = \\theta_{\\text{star}}(T) - \\theta_{\\text{crest}}",
    "fallback": "Δ = θ_star(T) − θ_crest"
   },
   {
    "tex": "\\theta_{\\text{flat}} = \\arctan\\left(\\frac{H - h}{s}\\right)",
    "fallback": "θ_flat = arctan((H − h) / s)"
   },
   {
    "tex": "\\theta_{\\text{globe}} = \\arctan\\left(\\frac{H - h}{s}\\right) - \\frac{s}{2R}",
    "fallback": "θ_globe = arctan((H − h) / s) − s / 2R"
   },
   {
    "tex": "\\theta_{\\text{flat}} - \\theta_{\\text{globe}} = \\frac{s}{2R} = \\frac{\\gamma}{2}",
    "fallback": "θ_flat − θ_globe = s / 2R = γ / 2"
   }
  ],
  "fig": "ctfig3",
  "gloss": "<b>Why the half, when section 2 used the whole γ.</b> The chord joining observer and crest makes an angle γ/2 with the local horizontal at <em>each</em> end — that is the angle between a chord and the tangent. One end taken alone therefore sees half the central angle, and the pair sees all of it: γ/2 separates the two <em>models</em> at one vantage, γ separates the two <em>vantages</em> along one line. The calculator prints both under those names, <em>Central Angle (γ)</em> and <em>θGeo,Terrestrial,Drop (γ/2)</em>, in a ratio of exactly two<sup class=\"ref\"><a href=\"#s-ct-n8\">[8]</a></sup>. H and h are the crest and observer heights, s the ground distance, R the radius, T the occultation second; θ_star(T) is the almanac's altitude, geometric when the software's refraction correction is off and apparent when it is on, and the crest angle must be taken the same way.",
  "k": "x:ct-g3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "row",
  "id": "",
  "html": "<div class=\"row\" style=\"margin:10px 0 4px\"> <label for=\"ct-case\">Case from their calculator</label> <select id=\"ct-case\"></select> </div>",
  "k": "x:ct-lab1"
 },
 {
  "t": "table",
  "id": "ct-tabNP",
  "tbody": "",
  "caption": "One worked case from the project's published calculator, the North Peak sheet<sup class=\"ref\"><a href=\"#s-ct-n8\">[8]</a></sup>. The heights, the distance and the four star altitudes are read from it; every angle below them is recomputed here and agrees with its cells to the arcsecond. The last three rows are the two-vantage test of section 2, run on those numbers.",
  "head": [],
  "k": "x:ct-cap4"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figBars\"></div> <ul class=\"figkey\" id=\"ct-keyResid\"></ul> <div class=\"fcap\">The same case asked four ways: each model, with and without the almanac's refraction correction, and in each the crest angle reduced the same way as the star altitude. The bars are absolute residuals, so shorter is better, and the arithmetic is entirely from the sheet — only the subtraction is done here.</div> </div>",
  "k": "x:ct-fcap3"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What the dataset returns.</b> Two questions can be put to it. The first compares the crest angle, worked out from maps and heights, against the almanac's star altitude — and that is the one that carries weight, because only one of its two terms comes from the software. The second is the two-vantage test the method itself advertises, where the plane predicts exactly zero. The figures below run both over every case, and the table under them gives the numbers. <b>The caveat travels with the result:</b> those star altitudes are Stellarium's, computed on a globe, so the second question is close to a check on the transcription rather than a measurement.",
  "k": "ct-callout6"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Why the sheet reports the plane as the closer of the two — worth following carefully.</b> The comparison it prints sets the star's altitude <em>at the crest</em> beside the flat crest angle <em>seen from the observer</em>: two different vantages. The gap comes out small — on the North Peak case the +13′35″ the sheet shows. But that subtraction contains the plane's residual at one vantage, <b>−56.5′</b>, plus the measured difference between the vantages, <b>+70.1′</b> — and that second term is γ, the quantity the flat model says is exactly zero. <b>The plane only comes close because it is credited with the globe's own measured curvature.</b> Hold the flat premise honestly — the star at the same altitude from both ends — and the flat residual is its worst score of the four.",
  "k": "ct-callout8"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figBoxKey\"></div> <ul class=\"figkey\"> <li>1 — lowest value within reach</li> <li>2 — first quartile</li> <li>3 — the median</li> <li>4 — the mean</li> <li>5 — third quartile</li> <li>6 — highest value within reach</li> <li>7 — a case beyond it</li> </ul> </div>",
  "k": "x:ct-bk1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figBox\"></div> <div class=\"fcap\">Both studies over every case on file: the one-vantage residual at the top, the two-vantage residual below, each split between the models and each with refraction applied at both ends. The dots beyond the whiskers matter — they are the cases where both models miss together, which is the signature of a misidentified crest rather than of a curved or a flat Earth.</div> </div>",
  "k": "x:ct-fcap4"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "ct-readBox",
  "html": "<p class=\"reads\" id=\"ct-readBox\"></p>"
 },
 {
  "t": "table",
  "id": "ct-tabBox",
  "tbody": "",
  "caption": "The same four series as numbers. Residuals are absolute, so smaller is closer to what was measured, and the median is the column to read first — one badly identified crest moves a mean and leaves a median alone.",
  "head": [],
  "k": "x:ct-cap5"
 },
 {
  "t": "notes",
  "html": "Which rows are in: every row of the <em>data_table</em> sheet carrying the seven numbers, less four kinds set aside <b>before the residuals were looked at</b> — rows the sheet labels <em>Test</em>, rows where the occulting body is the Moon, the four rows aimed at aircraft, and one row whose apparent altitude is below its true altitude, which cannot happen. Nothing else is dropped. Cases where <b>both</b> models miss stay in: at 1 and 7 km the two predictions are indistinguishable, so a joint miss is a misidentified crest, not a verdict, and removing them would flatter both. Adding the four aircraft rows would not change the direction — the globe wins all four, by more.",
  "k": "ct-p9"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The short version.</b> Of the four ways of putting the question to the dataset, the globe with refraction at both ends sits closest to the recorded second, and not marginally; no arrangement of the flat model gets nearer. It comes with the limit that has followed this section from the start: the star altitudes come from software that computes on a globe, so this is the method's arithmetic checked against itself, not an independent measurement. <b>The independent version is old:</b> Canigou has been photographed from Allauch, 263 km off, cut out against the setting Sun since 1808, and the hidden-height tab shows what each model puts on the disc — a black mass taller than the Sun, or a notch an eighth of its width.",
  "k": "ct-callout7"
 },
 {
  "t": "h2",
  "html": "6 · The radius, recovered from the same data",
  "k": "ct-h2h"
 },
 {
  "t": "notes",
  "html": "Every case can be run backwards. Instead of asking whether a radius of 6,371 km fits, solve for the radius each observation implies and see where they land. This is the page's unifying claim applied to flat-earth data: one R has to satisfy everything, and here it is being asked to emerge from a flat-earth dataset. <b>Only cases beyond 20 km are used</b>, and the threshold is geometric rather than chosen after the fact: below it the two models differ by under 5′, the denominator is the size of the crest error, and the division returns noise or a negative radius.",
  "k": "ct-p10"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "R_{\\gamma} = \\frac{s}{\\theta_{\\text{crest}} - \\theta_{\\text{obs}}}",
    "fallback": "R_γ = s / (θ_crest − θ_obs)"
   },
   {
    "tex": "R_{\\text{raw}} = \\frac{s}{2\\left(G - \\theta_{\\text{obs}}\\right)}",
    "fallback": "R_raw = s / 2(G − θ_obs)"
   },
   {
    "tex": "R_{\\text{red}} = \\frac{(1 - k)\\,s}{2\\left(G - \\theta_{\\text{obs,app}}\\right)}",
    "fallback": "R_red = (1 − k) s / 2(G − θ_obs,app)"
   }
  ],
  "fig": "ctfig4",
  "gloss": "<b>Every symbol is a row of the case table above.</b> s is <em>ground distance s</em>; Δh is the difference of the two heights on the <em>crest and observer heights</em> row; G is <em>crest angle, plane — arctan(Δh/s)</em>, the only quantity here that comes from maps rather than from software. θ_obs is <em>star altitude at the observer, geometric</em> and θ_obs,app the <em>apparent</em> row beneath it; θ_crest is <em>star altitude at the crest</em>. Angles go in radians, so R comes out in the units of s. k is the terrestrial refraction coefficient implied by the sheet, 0.148 — that correction is written s/1,500,000 in degrees<sup class=\"ref\"><a href=\"#s-ct-n8\">[8]</a></sup>, which is that k and not the 0.13 the rest of this page uses. The three lines produce the three rows of the table below, in the same order.",
  "k": "x:ct-g4"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "ct-readR",
  "html": "<p class=\"reads\" id=\"ct-readR\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figR\"></div> <div class=\"fcap\">Three reductions, three answers. Same box plot as before — box between the quartiles, bar the median, whiskers to 1.5 interquartile ranges, dots past them — with the accepted radius drawn as a vertical line so the deviation is the distance to it.</div> </div>",
  "k": "x:ct-fcap5"
 },
 {
  "t": "table",
  "id": "ct-tabR",
  "tbody": "",
  "caption": "The same three as numbers, with the median's departure from 6,371 km in the last column.",
  "head": [],
  "k": "x:ct-cap6"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Read the three lines in order; only the third means anything.</b> The first solves R from γ, the difference of two altitudes the software computed on a globe of 6,371 km — it lands on 6,371 by construction and only checks the transcription. The second uses the crest angle from maps and heights, genuinely independent of the software, but pairs it with a geometric star altitude when the occultation happened in the <em>apparent</em> direction; that mismatch, the method's default, returns a radius near 3,000 km — <b>not a plane and not the Earth, but a globe of the wrong size</b>. The third fixes the mismatch and nothing else. It is the one to argue with.",
  "k": "ct-callout9"
 },
 {
  "t": "h2",
  "html": "7 · What this page is doing about it",
  "k": "ct-h2f"
 },
 {
  "t": "notes",
  "html": "Criticising somebody else's observation is cheap unless you make one. The <b>observation</b> tab attempts the same experiment, pre-registered here, with three changes. The Sun stands in for the star, so the frame <b>carries its own angular scale</b> — the disc is 32.4′ wide — and no software turns a time into an angle. There are <b>two ridges</b>: a near crest at 16 km where the models barely differ, a control on the method, and a far one at 54 km where they differ in sign. And the prediction sits at <b>0°</b>, eye level, the one angle you can check without knowing where level is: the far ridge is either above the Sun's centre or below it, and the photograph says which.",
  "k": "ct-p7"
 },
 {
  "t": "notes",
  "html": "The shot can be placed on these axes before it is taken, and that is worth doing because it uses <b>a different instrument</b>: a solar disc as the ruler, no clock, no star altitude read out of software. Beyond 20 km the plane's miss tracks (1 − k)s/2R — the curvature term itself, not a fitted line — with a correlation of 0.97, while the globe's misses stay flat with no trend at all. So the two boxes below are not just a summary: they are a prediction. The 24 November geometry, 208 m of height over 54.1 km, says where one more point has to fall on each of them, and arithmetic alone fixes it",
  "k": "ct-p11"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "ct-readTrend",
  "html": "<p class=\"reads\" id=\"ct-readTrend\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figTrend\"></div> <div class=\"fcap\">The same two boxes as section 6, restricted to the 28 cases beyond 20 km, with the 24 November shot marked on each. The mark on the orange box is the 12.4′ the plane will have to be out by; the mark on the teal box is the zero the globe will have to show. <b>If the plane is right instead, the two marks swap places</b> — that is the whole prediction, and the photograph puts the point on one row or the other.</div> </div>",
  "k": "x:ct-fcap6"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"ct-figShoot\"></div> <div class=\"fcap\">What a dense solar filter will show, minute by minute, from the viewpoint on 24 November — the disc, and the terrain only where it cuts into it, at true angular scale. The blue band is the extra ridge the plane requires; the black is the globe's silhouette. The profile is sampled every 0.1° of azimuth, which is the resolution of the terrain read and not a smoothing, so the facets are the data. Each frame is centred on the disc: it is the ridge that climbs through it.</div> </div>",
  "k": "x:ct-fcap7"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Stated before the shot, which is the whole point.</b> Le Grand Mourre, 54.1 km away and 208 m taller than the viewpoint, must sit <b>13.2′ above</b> eye level on a plane, <b>1.4′ below</b> on a sphere with straight rays, and <b>0.5′ above</b> with k = 0.13. The spread is 12.7′, 39 % of the solar disc, and the Sun crosses that window on <b>24 November 2026 between 16:54:48 and 16:58:17 CET</b> (standard atmosphere at the viewpoint, 826 hPa; see the observation tab). Those numbers are computed, not observed: at the time of writing <b>no photograph exists</b>, and if it comes out against the globe this tab will say so — a verdict rule announced in advance binds whoever announced it.",
  "k": "ct-callout5"
 },
 {
  "t": "notes",
  "html": "<b>A first shot, 10 January 2026.</b> Before that date the same method was tried from the same viewpoint on a winter sunset, filmed by a camera aimed in advance with a network clock photographed beside its screen. At 17:11:06 the Sun's lower left edge touched the shoulder of the ridge, where the globe puts it at 17:11:05; the plane, with the same Sun over its higher ridge, puts it at 17:10:38, the Sun already three quarters hidden. Used like Eratosthenes' shadow, that single contact gives the Earth's radius: about 5,900 km, 5,000 to 6,500 km across the uncertainties. The last light came about 30 s before the globe's prediction, a gap stated rather than tuned away. The video, the photographs and the calculation are in the <a href=\"#tab-obs\" data-xref=\"obs\">observation tab</a>.",
  "k": "ct-jan10"
 },
 {
  "away": "xp-ct-11",
  "t": "h2",
  "html": "Experiment 11 · time a star onto a ridge",
  "k": "ct-h2e"
 },
 {
  "away": "xp-ct-11",
  "t": "raw",
  "tag": "div",
  "class": "exp",
  "id": "",
  "html": "<div class=\"exp\"><p class=\"exp-meta\"><b>Independent variable:</b> the distance to the peak — the same summit recorded from several places, or several peaks at different ranges. <b>Dependent:</b> the second at which the star is cut by the skyline. <b>Held constant:</b> one clock discipline (GPS-synchronised), one star, the summit itself as the target rather than a shoulder. <b>Kit:</b> a camera that records a timestamp, published coordinates for both ends, and a published altitude for the star<sup class=\"ref\"><a href=\"#s-ct-n4\">[4]</a></sup>.</p> <p class=\"exp-meta\"><b>Verdict rule, announced in advance and symmetric.</b> The globe fails if the two ends of the same line of sight return the same altitude — difference zero within your error, repeatably, at 9 km and at 131 km alike. The flat model fails if the difference grows in proportion to s, returning one radius near 6,371 km from peaks at three different ranges at once. Either way the refraction setting is stated before the recording and applied the same way at both ends, because a switch worth 15′ cannot be chosen after seeing a 27′ disagreement.</p></div>",
  "k": "x:ct-exp1"
 },
 {
  "away": "xp-ct-11",
  "t": "notes",
  "html": "Deliberately left out: any claim about what the recordings show, since none has been checked here; the ellipsoid, which is orders of magnitude below the effect; and terrain models, since the argument is about the angle to a named point, not about a silhouette.",
  "k": "ct-p6"
 },
 {
  "t": "xrefs",
  "keys": [
   "elev",
   "ref",
   "star",
   "cnav",
   "surv",
   "obs"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
