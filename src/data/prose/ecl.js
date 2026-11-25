// Onglet ecl (epic09) -- anglais SOURCE (pas un port du legacy : onglet nouveau).
// Blocs rendus par src/core/prose.js ; traductions fr/es/pt/nl dans
// src/i18n/<lang>/ecl-prose.json (epic09/UC08). Les blocs raw qui portent une
// clé (tableaux, libellés du calculateur) sont traduits en entier.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Eclipses · predicted to the second, on a sphere",
  "k": "ecl-eyebrow1"
 },
 {
  "t": "h1",
  "html": "An eclipse is an appointment published years in advance",
  "k": "ecl-h11"
 },
 {
  "t": "lead",
  "opener": true,
  "html": "The total solar eclipse of <b>2 August 2027</b> is already on the calendar. Totality touches down over the Atlantic at sunrise, crosses southern Spain, Gibraltar and northern Morocco, runs the length of North Africa, and is longest — <b>6 min 23.2 s</b> — near Luxor at <b>10:00:21 UT</b>, with the Sun 81° high.<sup class=\"ref\"><a href=\"#s-ecl-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-ecl-n2\">[2]</a></sup> The path table gives the edges of the shadow every two minutes, to a tenth of an arcminute, together with the Sun's altitude, its azimuth and how long totality lasts on the centre line.<sup class=\"ref\"><a href=\"#s-ecl-n1\">[1]</a></sup> None of it is observed yet. All of it is computed.",
  "k": "ecl-lead1"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The objection this tab answers.</b> “Eclipses are predicted from the saros cycle, a pattern the Babylonians found in tables — nobody needs a globe to predict them.” The saros is real and this tab shows it: after 223 lunations, 18 years 11 days and about 8 hours, the Sun, the Moon and the Moon's node line up again almost exactly.<sup class=\"ref\"><a href=\"#s-ecl-n3\">[3]</a></sup> But a repeating pattern says <em>when</em> a similar eclipse comes back. It does not say <em>where</em> its shadow falls, at what time it reaches a given town, how high the Sun stands there or how long totality lasts — and the saros itself puts the next member of the series a third of the world further west<sup class=\"ref\"><a href=\"#s-ecl-n4\">[4]</a></sup>, which is a statement about a turning planet.",
  "k": "ecl-call1"
 },
 {
  "t": "notes",
  "html": "Those numbers come from the <b>Besselian elements</b>: six short polynomials in time that describe the Moon's shadow on a <em>fundamental plane through the centre of the Earth</em>, perpendicular to the shadow's axis.<sup class=\"ref\"><a href=\"#s-ecl-n2\">[2]</a></sup><sup class=\"ref\"><a href=\"#s-ecl-n5\">[5]</a></sup> To turn them into a time and a place, the method needs the observer's position <em>as seen from the Earth's centre</em> — the quantities ρ sin φ′ and ρ cos φ′ of a point on an ellipsoid of 6,378 km equatorial radius and 1/298 flattening. There is no version of the calculation without that ellipsoid. This tab recomputes the published centre line of 2027 from the published elements and lands on it to the thousandth of a degree; that check runs every time the page's tests do.",
  "k": "ecl-p1"
 },
 {
  "t": "formula",
  "k": "ecl-fx1",
  "lines": [
   {
    "tex": "H = \\mu + \\lambda",
    "fallback": "H = μ + λ"
   },
   {
    "tex": "\\xi = \\rho\\cos\\varphi\\prime\\sin H,\\quad \\eta = \\rho\\sin\\varphi\\prime\\cos d - \\rho\\cos\\varphi\\prime\\cos H\\sin d,\\quad \\zeta = \\rho\\sin\\varphi\\prime\\sin d + \\rho\\cos\\varphi\\prime\\cos H\\cos d",
    "fallback": "ξ = ρcos φ′ sin H,  η = ρsin φ′ cos d − ρcos φ′ cos H sin d,  ζ = ρsin φ′ sin d + ρcos φ′ cos H cos d"
   },
   {
    "tex": "\\text{total} \\iff \\sqrt{(x-\\xi)^2 + (y-\\eta)^2} < |l_2 - \\zeta\\tan f_2|",
    "fallback": "total ⇔ √((x − ξ)² + (y − η)²) < |l₂ − ζ tan f₂|"
   }
  ],
  "gloss": "x, y, d, μ, l<sub>1</sub>, l<sub>2</sub>: NASA's six polynomials in time (tan f<sub>1</sub>, tan f<sub>2</sub>: two constants) · λ: the observer's longitude, east positive · ρ sin φ′, ρ cos φ′: the observer's position on the ellipsoid, seen from the Earth's centre · ξ, η, ζ: the observer projected onto the fundamental plane · partial when the distance is below l<sub>1</sub> − ζ tan f<sub>1</sub>; each contact is an instant when the distance equals one of the two radii"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"eclBessel\" style=\"height:clamp(220px,46vw,300px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>What the Besselian elements describe.</b> The Moon's shadow — the wide penumbra and the narrow umbra — crosses a plane through the <em>centre</em> of the Earth, perpendicular to the shadow's axis. x and y place the axis on that plane, l₁ and l₂ are the radii of the two shadows there, and six polynomials in time give all of them<sup class=\"ref\"><a href=\"#s-ecl-n2\">[2]</a></sup>. To know whether one place is in the shadow, the method projects that place onto the plane — ξ, η, and its height ζ above it — from its position on the ellipsoid<sup class=\"ref\"><a href=\"#s-ecl-n5\">[5]</a></sup>. Schematic, not to scale.",
  "k": "ecl-cap1"
 },
 {
  "t": "h2",
  "html": "Why an eclipse does not happen every month",
  "k": "ecl-h21"
 },
 {
  "t": "notes",
  "html": "Every month the Moon passes between the Earth and the Sun. If its orbit lay in the Earth's plane, every new moon would be a solar eclipse and every full moon a lunar one. It is tilted by <b>5.145°</b><sup class=\"ref\"><a href=\"#s-ecl-n6\">[6]</a></sup>, so most months the shadow passes above or below the Earth. The tilted orbit crosses the Earth's plane at two <b>nodes</b>; an eclipse needs a new or full moon close to one — in Meeus's test, |sin F| under 0.36, F being the Moon's distance along its orbit from the ascending node<sup class=\"ref\"><a href=\"#s-ecl-n7\">[7]</a></sup>. The node line points at the Sun only twice a year: the two <b>eclipse seasons</b>. It also turns backwards once in 18.6 years<sup class=\"ref\"><a href=\"#s-ecl-n6\">[6]</a></sup>, so the seasons come about 19 days earlier each year.",
  "k": "ecl-p2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"reads\" id=\"eclNodesReads\"></div><canvas id=\"eclNodes\" style=\"height:clamp(320px,56vw,460px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>2027, day by day, not to scale.</b> Sun, Earth and the Moon's tilted orbit, with the node line in amber; sizes and distances squeezed to fit, the Moon's tilt drawn three times too steep — the stamp says so. The dates, phases, distance from the node and the node's backward turn come from Meeus's mean elements<sup class=\"ref\"><a href=\"#s-ecl-n6\">[6]</a></sup>; the verdict at each new and full moon is Meeus's test with the true 5.145°<sup class=\"ref\"><a href=\"#s-ecl-n7\">[7]</a></sup>. In the strip below (rings: new moons, dots: full moons, coloured: eclipses) it finds the annular eclipse of 6 February and the total of 2 August, and the lunar eclipses of 20 February, 18 July and 17 August — all in NASA's catalogue<sup class=\"ref\"><a href=\"#s-ecl-n10\">[10]</a></sup>. It also flags 22 January (|sin F| = 0.34, just inside the limit), where NASA lists none: a mean-element model may err at the edge, which is why the local circumstances further down are computed properly.",
  "k": "ecl-cap2"
 },
 {
  "t": "formula",
  "k": "ecl-fx2",
  "lines": [
   {
    "tex": "|\\sin F| < 0.36 \\text{ at new or full moon} \\;\\Rightarrow\\; \\text{eclipse possible}",
    "fallback": "|sin F| < 0.36 at new or full moon ⇒ eclipse possible"
   },
   {
    "tex": "F = 93.272\\deg + 483\\,202.0175\\deg\\,T,\\qquad \\Omega = 125.045\\deg - 1934.136\\deg\\,T",
    "fallback": "F = 93.272° + 483 202.0175° T,  Ω = 125.045° − 1934.136° T"
   }
  ],
  "gloss": "F: the Moon's angle along its orbit from the ascending node · Ω: the longitude of that node, which turns backwards once in 18.6 years · T: Julian centuries from 1 January 2000 · Meeus's mean elements and test"
 },
 {
  "t": "h2",
  "html": "The saros: why eclipses repeat, and why somewhere else",
  "k": "ecl-h22"
 },
 {
  "t": "notes",
  "html": "Three of the Moon's rhythms happen to fall into step. A new moon comes back every synodic month; the Moon returns to the same node every draconic month; it returns to its closest point to the Earth every anomalistic month. Wait 223 synodic months and the other two have almost exactly caught up:<sup class=\"ref\"><a href=\"#s-ecl-n3\">[3]</a></sup>",
  "k": "ecl-p3"
 },
 {
  "t": "raw",
  "tag": "table",
  "class": "cnav-table",
  "id": "",
  "html": "<table class=\"cnav-table\"><thead><tr><th>Cycle</th><th>Length</th><th>vs 223 lunations</th></tr></thead><tbody><tr><td>223 synodic months (new moon → new moon)</td><td>6,585.3223 d</td><td>—</td></tr><tr><td>242 draconic months (node → node)</td><td>6,585.3575 d</td><td>+0.8 h</td></tr><tr><td>239 anomalistic months (perigee → perigee)</td><td>6,585.5375 d</td><td>+5.2 h</td></tr></tbody></table>",
  "k": "ecl-table1"
 },
 {
  "t": "notes",
  "html": "After one <b>saros</b> — 18 years, 11 days and <b>7 h 43 min</b> — Sun, Moon and node line up again at nearly the same distance, and an eclipse of nearly the same kind comes back. That is about orbits, and it gives the <em>date</em> whatever shape the ground has. It does not put the shadow in the same place: in those extra 7 h 43 min the Earth turns about 116°, so the next eclipse of the series lands that much further west. NASA rounds it to “~120° westward”<sup class=\"ref\"><a href=\"#s-ecl-n3\">[3]</a></sup>; the series catalogue gives <b>about 111°</b> from one member to the next<sup class=\"ref\"><a href=\"#s-ecl-n4\">[4]</a></sup>. The eclipse of 2 August 2027 is member 38 of 71 of saros 136; the previous one crossed India and China on 22 July 2009<sup class=\"ref\"><a href=\"#s-ecl-n8\">[8]</a></sup>, the next will cross the United States on 12 August 2045<sup class=\"ref\"><a href=\"#s-ecl-n9\">[9]</a></sup>.",
  "k": "ecl-p4"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"reads\" id=\"eclSarosReads\"></div><canvas id=\"eclSaros\" style=\"height:clamp(300px,52vw,440px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>Three members of one series, as published.</b> Each band is NASA's path of totality<sup class=\"ref\"><a href=\"#s-ecl-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-ecl-n8\">[8]</a></sup><sup class=\"ref\"><a href=\"#s-ecl-n9\">[9]</a></sup>; the grey dots are the points of greatest eclipse of all 71 members of saros 136, pale for the oldest<sup class=\"ref\"><a href=\"#s-ecl-n4\">[4]</a></sup>. The camera follows the point of greatest eclipse from one member to the next, and that westward turn — about 111° — is the extra 7 h 43 min of rotation. The page computes nothing here; it only turns a globe. Three saroses later (an <em>exeligmos</em>, 54 years 34 days) the extra time is 23 h 09 min, nearly a whole turn, and the series comes back close to where it was: 5.6° E on 30 June 1973, 33.2° E on 2 August 2027, 53.6° E on 3 September 2081<sup class=\"ref\"><a href=\"#s-ecl-n4\">[4]</a></sup>.",
  "k": "ecl-cap3"
 },
 {
  "t": "formula",
  "k": "ecl-fx3",
  "lines": [
   {
    "tex": "223 \\times 29.530589\\ \\text{d} = 6585.32\\ \\text{d} \\approx 242 \\times 27.212221\\ \\text{d} \\approx 239 \\times 27.554550\\ \\text{d}",
    "fallback": "223 × 29.530589 d = 6,585.32 d ≈ 242 × 27.212221 d ≈ 239 × 27.554550 d"
   },
   {
    "tex": "0.3213\\ \\text{d} \\times 360\\deg \\approx 116\\deg \\text{ westward}",
    "fallback": "0.3213 d × 360° ≈ 116° westward"
   }
  ],
  "gloss": "synodic, draconic and anomalistic months · 0.3213 d: the 7 h 43 min left over beyond whole days, during which the Earth turns under the Sun at 15° per hour"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What the saros settles, and what it cannot.</b> A flat-earth reading can use the saros too: it is a calendar of the Sun and the Moon, and the date comes out the same on any ground. It cannot use the shift. A cycle that leaves every eclipse a third of the way round the world further west, by the amount of rotation the extra hours imply, is the calendar of a spinning body — and to draw the band itself, town by town, one needs the Besselian elements and the ellipsoid of the first section. The next sections compute that band and ask a flat model to draw the same one.",
  "k": "ecl-call2"
 },
 {
  "t": "h2",
  "html": "Where and when: the eclipse at any place",
  "k": "ecl-h23"
 },
 {
  "t": "notes",
  "html": "Pick a place and the page computes what it will see on 2 August 2027: when the Moon first bites the Sun, when totality begins and ends, how long it lasts, how deep the partial phase gets and where the Sun stands. It does it the way the published predictions are made — from NASA's Besselian elements<sup class=\"ref\"><a href=\"#s-ecl-n2\">[2]</a></sup> with Meeus's method<sup class=\"ref\"><a href=\"#s-ecl-n5\">[5]</a></sup>, the observer placed on the ellipsoid by ρ sin φ′ and ρ cos φ′. The first line under the controls is not a claim: it is the same calculation run, as the page loads, on every point of NASA's published centre line<sup class=\"ref\"><a href=\"#s-ecl-n1\">[1]</a></sup>, and it reports how far from the published time, duration, altitude and azimuth it lands.",
  "k": "ecl-p5"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig ecl-local\"><div class=\"mini-form\"><div class=\"preset-row\" id=\"eclPlaces\"></div><label>lat <input type=\"number\" id=\"eclLat\" step=\"0.001\" style=\"width:7em\"></label><label>lon <input type=\"number\" id=\"eclLon\" step=\"0.001\" style=\"width:7em\"></label><label>alt (m) <input type=\"number\" id=\"eclAlt\" step=\"1\" style=\"width:5em\"></label></div><div class=\"reads\" id=\"eclCheck\"></div><canvas id=\"eclMap\" style=\"height:clamp(220px,40vw,340px)\"></canvas><table class=\"cnav-table\"><tbody id=\"eclLocalOut\"></tbody></table><div class=\"reads\" id=\"eclOwn\"></div></div>",
  "k": "ecl-table2"
 },
 {
  "t": "fcap",
  "html": "<b>Two routes, both on a globe.</b> The table comes from the published Besselian elements. The last line redoes the same place with nothing from NASA: the site's own Sun and Moon<sup class=\"ref\"><a href=\"#s-ecl-n6\">[6]</a></sup>, seen from that exact place, and the moment their centres come closest. The two agree on the time of maximum to a few seconds. The duration agrees only once the Moon is drawn at its size <em>from that place</em>: near the zenith the observer is some 6,000 km closer to it than the Earth's centre, the Moon looks about 1.6 % larger, and at Luxor that is worth over a minute of totality. The remaining few seconds are this simpler Moon's own error. On a plane there is no centre of the Earth to be closer to.",
  "k": "ecl-cap4"
 },
 {
  "t": "h2",
  "html": "The same shadow on a flat Earth, given every advantage",
  "k": "ecl-h24"
 },
 {
  "t": "notes",
  "html": "A flat model gets the best terms this page can offer. Its map is the usual azimuthal equidistant one, North Pole at the centre. Its Sun and Moon are local lamps, each hanging over the <em>real</em> point beneath the real Sun and Moon at every minute, from the same ephemeris as the globe<sup class=\"ref\"><a href=\"#s-ecl-n6\">[6]</a></sup>. The Moon at height H☾ is lit by the Sun at height H☉, and its shadow falls along the line from the lamp through the Moon. Only the ratio of the two heights moves that shadow, so it is tuned by least squares to follow NASA's published centre line as closely as possible<sup class=\"ref\"><a href=\"#s-ecl-n1\">[1]</a></sup>; the Sun's height is then tuned, separately, to the Sun's published altitudes along the path. Two free parameters, each set in the flat model's favour.",
  "k": "ecl-p6"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"reads\" id=\"eclFlatReads\"></div><canvas id=\"eclFlat\" style=\"height:clamp(320px,60vw,480px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>The flat model's own map, 08:26 to 11:46 UT.</b> Teal: NASA's path of totality, carried over onto this map as it falls, with the published position of the shadow's centre<sup class=\"ref\"><a href=\"#s-ecl-n1\">[1]</a></sup>. Amber: the flat model's shadow, on the best-fitting heights, with its lamp and the Moon's point beneath. The band as drawn here is stretched and bent — that is this map's distortion, not the shadow's; the published path is a smooth arc on the globe.",
  "k": "ecl-cap5"
 },
 {
  "t": "formula",
  "k": "ecl-fx5",
  "lines": [
   {
    "tex": "P = S + f\\,(M - S),\\qquad f = \\frac{H_{\\text{☉}}}{H_{\\text{☉}} - H_{\\text{Moon}}}",
    "fallback": "P = S + f (M − S),  f = H☉ / (H☉ − H_Moon)"
   },
   {
    "tex": "f \\text{ chosen to minimise } \\sum_t |P(t) - C(t)|^2",
    "fallback": "f chosen to minimise Σ |P(t) − C(t)|²"
   }
  ],
  "gloss": "S, M: the points beneath the Sun and Moon lamps on the flat map · H<sub>☉</sub>, H<sub>Moon</sub>: their heights · P: where the line from the Sun lamp through the Moon meets the ground · C(t): NASA's published centre line · only the ratio of the heights moves P, so it is fitted, in the flat model's favour"
 },
 {
  "t": "notes",
  "html": "The result, computed on this page: the best-fitting flat shadow stays on average <b>3,950 km</b> from the published centre line, <b>8,400 km</b> at worst. It moves the wrong way — ten degrees of longitude <em>westward</em>, following its lamp, while the published shadow sweeps over a hundred degrees <em>eastward</em>, from the Atlantic at sunrise to the Indian Ocean at sunset. Tuned to the published altitudes, its Sun is off by only about 6° on average, but at the two ends, where NASA's Sun is rising and setting, the flat lamp stands 28° and 24° high. And given the published width of the shadow for free, at its own speed totality would last 376 to 880 seconds along the path, against the published 255 to 383.",
  "k": "ecl-p7"
 },
 {
  "t": "h2",
  "html": "The Earth's own shadow: eclipses of the Moon",
  "k": "ecl-h25"
 },
 {
  "t": "notes",
  "html": "The oldest argument on this page is an eclipse of the Moon. Aristotle, fourth century BC: “in eclipses the outline is always curved: and, since it is the interposition of the earth that makes the eclipse, the form of this line will be caused by the form of the earth's surface, which is therefore spherical.”<sup class=\"ref\"><a href=\"#s-ecl-n11\">[11]</a></sup> It can be sharpened. The Earth's shadow on the Moon is an arc of the <em>same</em> circle whether the Moon is rising, high or setting — a disc casts a round shadow only when lit square on, and a straight-edged one when lit along its edge. And its size is not free: from the published sizes and distances of the Sun, the Earth and the Moon, the page computes the Earth's shadow at the Moon's distance as about 2.7 times the Moon's radius, the value the photographs show.",
  "k": "ecl-p8"
 },
 {
  "t": "formula",
  "k": "ecl-fx4",
  "lines": [
   {
    "tex": "r_{\\text{shadow}} = 1.02\\left[R_{\\text{⊕}} - d_{\\text{Moon}}\\,\\frac{R_{\\text{☉}} - R_{\\text{⊕}}}{d_{\\text{☉}}}\\right]",
    "fallback": "r_shadow = 1.02 · [R⊕ − d_Moon (R☉ − R⊕)/d☉]"
   }
  ],
  "gloss": "R<sub>⊕</sub>, R<sub>☉</sub>: radii of the Earth and the Sun · d<sub>Moon</sub>, d<sub>☉</sub>: distances of the Moon and the Sun · the Earth's shadow is a cone that narrows as it recedes; at the Moon it is about 2.7 Moon radii · 1.02: the customary enlargement for the atmosphere"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"eclLunar\" style=\"height:clamp(170px,30vw,230px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>One circle, three moments, and what a disc would give.</b> The partial phase of a lunar eclipse seen at moonrise, at its highest and at moonset: the dark edge is an arc of the same circle each time, only turned with respect to the horizon. The last panel is the shadow of a disc lit along its edge. Schematic; the shadow's radius is computed from the Sun's, Earth's and Moon's radii and distances, with the customary 2 % enlargement for the Earth's atmosphere.",
  "k": "ecl-cap6"
 },
 {
  "t": "notes",
  "html": "A flat model has no Earth to put between the Sun and the Moon: both hang above the disc. Flat-earth writers who address lunar eclipses invoke another, unseen body; none gives its size, its distance or its path, so none says when the next eclipse will come or who will see it. The published calendar does. The three lunar eclipses of 2027 are all penumbral — the Moon only grazes the Earth's outer shadow — and the next total ones visible from Europe fall on <b>31 December 2028</b>, <b>26 June 2029</b> and <b>20 December 2029</b><sup class=\"ref\"><a href=\"#s-ecl-n10\">[10]</a></sup>. Each was computed decades ago, from the same kind of elements as the solar eclipse above.",
  "k": "ecl-p9"
 },
{
  "t": "h2",
  "html": "The Sun setting while the eclipsed Moon rises, and the shadow on the “wrong side”",
  "k": "ecl-h2sel"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The objection.</b> “In an eclipse of the Moon the Earth stands between the Sun and the Moon. Yet the eclipsed Moon has been seen above the horizon while the Sun was still up on the other side. With the Earth in between, that is impossible — so it is not the Earth's shadow.” And its more common form: “On photographs of the eclipsed Moon the dark part is often on top, while the Sun that casts the shadow is below the horizon. The Earth's shadow would come from below.”",
  "k": "ecl-sel-call1"
 },
 {
  "t": "notes",
  "html": "The “impossible” eclipse has a name, the <b>selenelion</b> or horizontal eclipse, and it is old news: Cleomedes reported it nearly two thousand years ago and put it down to the air.<sup class=\"ref\"><a href=\\\"#s-ecl-n12\\\">[12]</a></sup> It has been photographed, at sunrise over Minneapolis on 8 October 2014 for one.<sup class=\"ref\"><a href=\\\"#s-ecl-n13\\\">[13]</a></sup> On a globe it is a matter of a few arcminutes. Standing on the line between day and night, you are on the edge of the Earth as seen from the Sun: your horizon plane points straight at the Sun on one side and straight down the Earth's shadow on the other. The Sun and the centre of the shadow are both on your horizon, 180° apart. Three things move them by less than a degree. The Moon, 60 Earth radii away, seen from the surface instead of the centre, sits about 1° lower: its parallax π. Inside the shadow, 0.7° in radius, it may sit above or below the centre: δ. And a body is in sight as soon as its upper edge is, half a disc, s, above its centre. The air then lifts both edges by about half a degree each: ρ.",
  "k": "ecl-sel-p1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"preset-row\" role=\"group\" aria-label=\"Case\"><button type=\"button\" class=\"presetbtn\" data-case=\"brest2028\" aria-pressed=\"true\">Brest · 31 Dec 2028</button><button type=\"button\" class=\"presetbtn\" data-case=\"mpls2014\" aria-pressed=\"false\">Minneapolis · 8 Oct 2014</button></div><canvas id=\"eclSelen\" style=\"height:clamp(440px,74vw,640px)\"></canvas><div class=\"reads\" id=\"eclSelenReads\"></div></div>",
  "k": "ecl-sel-fig"
 },
 {
  "t": "fcap",
  "html": "<b>One instant, two places.</b> Top: the Sun's rays, the Earth, its shadow and the Moon at one true scale, in the plane through the Sun, the Earth's centre and the first observer (white dot, on the line between day and night); Adelaide, which is not in that plane, is projected onto it (blue dot), with its line of sight to the Moon (blue dots); the box enlarges the Moon's surroundings uniformly, by the factor printed. Dashed: the observer's horizon plane; orange: the lowest ray that still reaches the eye through the standard atmosphere. Bottom: the eclipsed Moon at the same instant from two places, zenith up: on the left the place of the selenelion, the Moon on its sea horizon (1° bar); on the right Adelaide, a wider field so that its horizon is in the picture (10° bar), the Moon high in a night sky and shown again in a box enlarged uniformly to the scale of the left view (factor printed). The red arrow points from the Moon's centre to the centre of the Earth's shadow, the side the shadow comes from; the disc at the bottom right is the shadow as each place sees it, with the Moon's path during the animation. In each small yellow frame, the Sun for that place at that instant, looking towards it, horizon across the middle, at its own uniform scale (bar): above the horizon at the selenelion, far below it at Adelaide. Filled discs: with standard refraction, each point of the edge lifted by its own amount; dashed outlines: the same discs without air. The Moon's colouring is the Earth's umbra and penumbra, computed. Sea-level observers. Click to pause.",
  "k": "ecl-sel-cap"
 },
 {
  "t": "formula",
  "k": "ecl-fx-sel",
  "fig": "eclFxSel",
  "lines": [
   {
    "tex": "(h_{\\text{☉}} + s_{\\text{☉}} + \\rho_{\\text{☉}}) + (h_{\\text{☾}} + s_{\\text{☾}} + \\rho_{\\text{☾}}) = -\\pi + \\delta + s_{\\text{☉}} + s_{\\text{☾}} + \\rho_{\\text{☉}} + \\rho_{\\text{☾}}",
    "fallback": "(h☉ + s☉ + ρ☉) + (h☾ + s☾ + ρ☾) = −π + δ + s☉ + s☾ + ρ☉ + ρ☾"
   }
  ],
  "gloss": "the heights of the two upper edges above a sea horizon, added at the moment they are equal · h: height of each centre · π: the Moon's parallax in height, about 58′ · δ: how far the Moon, seen from the Earth's centre, stands above the shadow's axis · s: half-diameters, about 16′ each · ρ: refraction at the horizon, about 29′ each · the two can be seen together only if the sum is above zero; from a height, add twice the dip of the horizon"
 },
 {
  "t": "notes",
  "html": "Computed on this page for <b>Brest</b> (48.39° N, 4.49° W) on <b>31 December 2028</b>: the Moon is totally eclipsed from 16:16 to 17:28 UT — NASA lists 1 h 11 min of totality<sup class=\"ref\"><a href=\\\"#s-ecl-n10\\\">[10]</a></sup> — and from a sea horizon the setting Sun and the rising, totally eclipsed Moon are both above it from <b>16:25 to 16:33 UT</b>, the Sun in the south-west at azimuth 234°, the Moon in the north-east at 54°. Without air, the same two edges would each miss the horizon by 2′: at sea level this selenelion needs the atmosphere, but only just. An eye 1.2 m above a sea horizon gains 2′ of dip on each side and would see both without any air. Refraction is the margin, not the explanation; the explanation is that the horizon of someone standing on the edge of a ball points at both. For Minneapolis on 8 October 2014, with the Moon partly eclipsed and high in the shadow, the page finds both above the horizon from 12:20 to 12:29 UT, possible even without air: the morning of the photograph.<sup class=\"ref\"><a href=\\\"#s-ecl-n13\\\">[13]</a></sup> Near the horizon refraction changes from one evening to the next by several arcminutes, with the temperature of the air near the ground, so the ends of each window are uncertain by a minute or two; a hill on the horizon shuts it.",
  "k": "ecl-sel-p2"
 },
 {
  "t": "notes",
  "html": "<b>The shadow on the “wrong side”.</b> The second form of the objection is not about the selenelion: it is about which way is up. Seen from the Moon, the centre of the Earth's shadow lies in one direction among the stars, the same for everyone at a given instant. “Up” is each observer's zenith, and it turns from one place to the next. The figure shows one instant from two places 16,600 km apart. At Brest the Moon is on the horizon and the shadow comes from below. At <b>Adelaide</b> (34.93° S, 138.60° E) the same Moon is 26° high in the north-north-west, the Sun 27° below the opposite horizon, and the shadow comes from above: south of the equator the Moon is seen upside down compared with Brest. Measured from the celestial north instead of the zenith, the two directions agree to within 0.4°, and that small difference is the parallax between the two places. In the Minneapolis case Adelaide sees it from above as well, the Moon 37° high, to within 0.2°. A dark part on top while the Sun is below the horizon is what a ball predicts wherever the Moon is high and the observer's zenith lies on the shadow's side of the Moon.",
  "k": "ecl-sel-p3"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The globe is sunk</b> if, on 31 December 2028, from a sea horizon at Brest, the Moon that appears in the north-east around 16:25 UT is not totally eclipsed; or if, anywhere and at any eclipse, the Sun and the eclipsed Moon are seen together with their upper edges adding up to more than <b>2°</b> above a sea horizon. Parallax, the shadow's size and the two half-discs allow at most about half a degree, standard refraction about one more, and the 2° leaves room for unusual air. It is also sunk if two observers, photographing the same eclipse at the same minute, find the shadow's centre at directions from the celestial north that differ by more than 5°: the parallax between any two places moves it by less than half a degree in both cases on this page.",
  "k": "ecl-sel-call2"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>A flat model</b> has both bodies above the plane at all times, so a selenelion costs it nothing — and explains nothing: with no Earth between them it has no shadow, no reason for the Moon to darken only when it stands opposite the Sun, and no time for the Brest window. A flat model that names its shadow-casting body, with a size, a height and a path, is welcome to state its own Brest time before the day.",
  "k": "ecl-sel-call3"
 },
 {
  "t": "h2",
  "html": "What would refute each model, stated before 2 August 2027",
  "k": "ecl-h26"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The globe is sunk</b> if, at <b>Tarifa</b> (36.013° N, 5.605° W, at the shore), totality does not begin within 15 s of <b>08:45:05 UT</b> or does not last <b>4 min 39 s</b> to within 10 s, with the Sun 38° high in the east; if <b>Luxor</b> sees totality at any time other than <b>10:02–10:08 UT</b>, lasting 6 min 20 s to within 10 s; or if <b>Marseille</b> sees totality at all — the globe gives it a partial eclipse, magnitude 0.77, deepest at 09:02:56 UT. These are the figures of the “Where and when” section, computed on this page from NASA's elements<sup class=\"ref\"><a href=\"#s-ecl-n2\">[2]</a></sup>, which reproduce NASA's own centre line to within a second. The tolerances cover what the predictions leave out: the Moon's mountains and valleys at its edge, which move the contacts by a few seconds<sup class=\"ref\"><a href=\"#s-ecl-n2\">[2]</a></sup>.",
  "k": "ecl-call3"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The flat model above is sunk</b> — on the heights that suit it best — if Tarifa sees a total eclipse at all: its shadow never comes closer than about 4,300 km. And it is sunk if Luxor's totality comes near 10:05 UT: its shadow passes 80 km from Luxor at about <b>06:09 UT</b>, four hours earlier, under a lamp that would then be high in Luxor's morning sky. A different flat model is welcome to state its own Tarifa and Luxor numbers before the day; this page will run it through the same test.",
  "k": "ecl-call4"
 },
 {
  "t": "sources"
 }
];
