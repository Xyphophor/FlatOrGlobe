// Prose de l'onglet azim, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Azimuth · the bearing that forgets how far away the Sun is",
  "k": "azim-m1"
 },
 {
  "t": "h1",
  "html": "Point at the Sun. You are pointing at a place on Earth."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "figopen opener",
  "id": "azfig0",
  "html": "<div class=\"figopen opener\" id=\"azfig0\"></div>"
 },
 {
  "t": "fcap",
  "k": "az-fcap0",
  "html": "<b>The two angles of a direction.</b> From where you stand, a body in the sky has an altitude h above your horizontal plane and an azimuth A, counted clockwise from north. This tab tests the azimuth alone, and the azimuth does not depend on how far away the body is. Angles drawn arbitrary."
 },
 {
  "t": "lead",
  "html": "Every other solar panel on this page argues from a <em>time</em> — sunrise, the length of twilight, where a shadow falls. This one argues from a <b>direction</b>, which is cheaper to measure: a stick, its shadow, and a way of finding true north. The claim tested is not that the Sun is far or near, large or small. It is that the bearing you turn to when you face the Sun is the bearing of a particular <em>place</em> — the place with the Sun straight overhead at that instant — whatever the Sun's distance turns out to be.",
  "opener": true,
  "k": "az-p1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The result the whole tab rests on.</b> The azimuth of any celestial body, measured from true north, is exactly the initial great-circle bearing to its <b>sub-body point</b>: the point on Earth that has the body at the zenith. Not approximately, and with no dependence whatever on how far away the body is. Two lines of proof: the sub-body point, the Earth's centre and the body are collinear, by the definition of the sub-body point. The observer's vertical also passes through the centre. So the vertical plane that contains the observer and the body contains the centre, therefore contains the whole line centre-to-body, therefore contains the sub-body point. Same vertical plane, same azimuth.",
  "k": "az-callout1"
 },
 {
  "t": "notes",
  "html": "Two consequences are worth stating before anything is drawn, because both of them close doors that would otherwise be argued through. <b>First, the distance cancels completely.</b> This is the kind of quantity rule 5 of this page's own method asks for: the Sun at 150 million kilometres and the Moon at 384,000 obey the same rule, and so would a lamp at 5,000 km. Arguing about the Sun's distance cannot touch the azimuth.",
  "k": "az-p2"
 },
 {
  "t": "notes",
  "html": "<b>Second, parallax moves a body along the vertical circle</b>, toward the zenith — it changes the altitude and not the bearing. That is the objection an informed reader will make about the Moon, whose parallax reaches a whole degree, so it is answered here and not in a footnote; the numbers are further down.",
  "k": "az-p2b"
 },
 {
  "t": "h2",
  "html": "Three formulas, no free parameters",
  "k": "az-h2a"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "\\phi_{\\text{sub}} = \\delta \\qquad \\lambda_{\\text{sub}} = \\alpha - \\text{GMST}",
    "fallback": "φ_sub = δ &nbsp;&nbsp; λ_sub = α − GMST"
   }
  ],
  "fig": "azfig1",
  "gloss": "The sub-body point, from an almanac and a clock. Its latitude is the body's declination; its longitude is the right ascension minus Greenwich mean sidereal time, which is the same statement as &minus;GHA. The USNO publishes GHA and declination for the Sun, the Moon and the navigational stars for any instant you ask for<sup class=\"ref\"><a href=\"#s-azim-n2\">[2]</a></sup>, so this line needs nothing from this page. Both quantities here are <em>geocentric</em>, and that matters for the Moon: the theorem points at the geocentric sub-point, which is why parallax leaves the bearing alone.",
  "k": "azim-m2"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "A = \\text{atan2}\\left( \\sin\\Delta\\lambda \\cos\\phi_2 ,\\ \\cos\\phi_1 \\sin\\phi_2 - \\sin\\phi_1 \\cos\\phi_2 \\cos\\Delta\\lambda \\right)",
    "fallback": "A = atan2( sin Δλ · cos φ₂ , &nbsp; cos φ₁ · sin φ₂ − sin φ₁ · cos φ₂ · cos Δλ )"
   }
  ],
  "fig": "azfig2",
  "gloss": "The sphere's prediction: the initial great-circle bearing from the observer (φ₁, λ₁) to the sub-body point (φ₂, λ₂). Standard spherical trigonometry, the same formula the distances tab uses, with nothing adjustable in it. Feed it a place, an instant and an almanac and it returns one number.",
  "k": "x:az-g2"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "\\rho = 90\\deg - \\phi \\qquad \\theta = \\lambda \\qquad \\text{north} = \\text{toward the centre}",
    "fallback": "ρ = 90° − φ &nbsp;&nbsp; θ = λ &nbsp;&nbsp; north = toward the centre"
   }
  ],
  "fig": "azfig3",
  "gloss": "The flat model's prediction, and it needs the map to be <em>named</em> before it can have one at all. &ldquo;The flat Earth&rdquo; has no azimuths; a projection does. The one used here is the north-polar azimuthal equidistant map<sup class=\"ref\"><a href=\"#s-azim-n6\">[6]</a></sup> — the standard flat-Earth map, the one Gleason patented in 1892<sup class=\"ref\"><a href=\"#s-azim-n5\">[5]</a></sup>, and the same map the distances and seismology tabs already run the flat model on. A point sits at radius 90&deg;&nbsp;&minus;&nbsp;φ from the centre at polar angle λ, and an observer's local north is the direction of the map's centre. That is a complete model: given a place and a sub-solar point it returns a bearing, with no height, no lamp size and no fitted constant anywhere in it.",
  "k": "azim-m3"
 },
 {
  "t": "notes",
  "html": "A different projection would give different bearings, and that has to be stated, or the tab would be testing a straw man. What it does not buy is an escape, and the reason is the thesis of the whole page rather than of this tab: a projection that repaired the bearings would have to break the distances, which the distances tab measures, or the shadow zone, which the seismology tab measures. The claim is never &ldquo;no flat map gets this right&rdquo;; it is that no single flat map gets two of these right at once.",
  "k": "az-p3"
 },
 {
  "t": "h2",
  "html": "One instant, seven observatories, two predictions",
  "k": "az-h2b"
 },
 {
  "t": "lead",
  "html": "The seven places below are Global Seismographic Network stations. Their coordinates are already published<sup class=\"ref\"><a href=\"#s-azim-n4\">[4]</a></sup> and this page already uses them in the seismology tab — no new list, and no place picked to flatter an answer. Three instants are offered, all fixed in advance, and nothing here is adjustable; the play button is there to show there is no favourable moment, not to find one. Every row in the table can be checked without trusting this page, against the USNO's altitude and azimuth table<sup class=\"ref\"><a href=\"#s-azim-n1\">[1]</a></sup> or NOAA's solar calculator<sup class=\"ref\"><a href=\"#s-azim-n8\">[8]</a></sup>.",
  "opener": false,
  "k": "az-p4"
 },
 {
  "t": "fold",
  "q": true,
  "k": "azim-fold1",
  "summary": "<b class=\"faq-q\">Where the seven places and the three instants come from</b>",
  "html": "<p class=\"cnav-lead\">The three instants are two round solstice-week times and the moment of greatest eclipse on 12 August 2026, published to a tenth of a second<sup class=\"ref\"><a href=\"#s-azim-n3\">[3]</a></sup>. At every one of them the sphere's bearing is the bearing to the sub-solar point exactly, and the flat map's is whatever its geometry forces. The play button runs the clock on from whichever instant you picked, for the same reason the magnetism tab has a latitude slider. Every frame satisfies the theorem on the sphere, and every frame leaves the flat map's lines missing each other. The <b>Moon</b> button does the whole thing again for the Moon, which is the interesting case.</p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "preset-row",
  "id": "",
  "html": "<div class=\"preset-row\"> <span class=\"preset-lbl\">Instant (UTC)</span> <button class=\"presetbtn\" id=\"azimCaseDec\" aria-pressed=\"true\">21 Dec 2026 · 12:00</button> <button class=\"presetbtn\" id=\"azimCaseJun\" aria-pressed=\"false\">21 Jun 2026 · 12:00</button> <button class=\"presetbtn\" id=\"azimCaseEcl\" aria-pressed=\"false\">12 Aug 2026 · 17:45:53 · eclipse</button> <span style=\"flex:1 1 auto\"></span> <button class=\"presetbtn\" id=\"azimBodySun\" aria-pressed=\"true\">Sun</button> <button class=\"presetbtn\" id=\"azimBodyMoon\" aria-pressed=\"false\">Moon</button> <button class=\"presetbtn\" id=\"azimPlay\" aria-pressed=\"false\" aria-label=\"Play or pause\">&#9654;</button> <button class=\"presetbtn\" id=\"azimReset\" aria-label=\"Restart\">&#8634;</button> </div>",
  "k": "x:az-anlbl"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "reads",
  "id": "azimReads",
  "html": "<div class=\"reads\" id=\"azimReads\"></div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"azimGlobe\" style=\"cursor:default\"></canvas> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"ray\"></span><span>rays arriving from the body, one per station</span></li> <li><span class=\"sw\" data-sw=\"arc\"></span><span>each station's great-circle bearing to the sub-point</span></li> <li><span class=\"sw\" data-sw=\"look\"></span><span>the direction that station actually looks</span></li> <li><span class=\"sw\" data-sw=\"term\"></span><span>the terminator, where day meets night</span></li> <li><span class=\"sw\" data-sw=\"hollow\"></span><span>a hollow dot cannot see the body; a filled one can</span></li> </ul> <div class=\"fcap\"><b>The globe from the side, rays drawn.</b> The rays are parallel because they are computed from the body's real distance, not drawn that way. A side view shows only the near face, so a station round the limb is missing here; the strip above and the map beside carry all seven.</div> <details class=\"fold q\"> <summary><b class=\"faq-q\">Parallel to within how much</b></summary> <p class=\"fcap\">Every ray and sight line in this panel is computed from the body's real distance — about 23,000 Earth radii for the Sun, 60 for the Moon. Across the whole planet the Sun's sight lines close on each other by at most about 18″ (0.005°), far below one pixel. The Moon's close by up to about 2°, and at the tips you can see them converge. Switch bodies and watch: that visible difference is the distance, drawn to scale.</p> </details> </div> <div class=\"fig\"> <canvas id=\"azimFlat\" style=\"cursor:default\"></canvas> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"arc\"></span><span>the bearing at which the body really is, laid off from each station</span></li> <li><span class=\"sw\" data-sw=\"past\"></span><span>beyond the rim of the map, where it has no world left to show</span></li> <li><span class=\"sw\" data-sw=\"tri\"></span><span>the error triangle the half-lines leave instead of meeting</span></li> </ul> <div class=\"fcap\"><b>The same instant on the flat map.</b> North-polar azimuthal equidistant, north pole at the centre, in the orientation flat maps are always printed in. Each half-line uses this map's own definition of north — the direction of its centre — at a bearing anyone can check against the USNO. On a correct map they would all run into the body. Press play: the disagreement moves, it does not resolve.</div> </div> </div>",
  "k": "x:az-k1"
 },
 {
  "t": "notes",
  "html": "The picture carries the whole theorem. Rays arriving from the body are parallel, and orthographic projection preserves parallelism exactly — so they are parallel on your screen for the same reason they are parallel in space, not because they were drawn that way. Follow them in. At exactly one point the ray runs straight down the radius, and the dashed line continues it through the centre: ray, sub-point and centre are one line.",
  "k": "az-p4b"
 },
 {
  "t": "notes",
  "html": "Nobody looks along a curve, and nobody is being asked to. Each coloured arc is where a station's vertical plane meets the ground; the dotted line leaving that station is the look direction inside the same plane. Every dotted line is parallel to every other, because there is one body and one direction in space. What changes from station to station is the local horizon that direction is measured against, and that alone is why one Sun hands every observer a different bearing.",
  "k": "az-p4c"
 },
 {
  "t": "table",
  "id": "azimTbl",
  "tbody": "",
  "caption": "Bearing to the Sun at the selected instant: what the sphere predicts, what the flat map predicts",
  "head": [
   "Station",
   "Sun's altitude",
   "Globe",
   "Flat map",
   "Disagreement"
  ],
  "k": "x:03e00429"
 },
 {
  "t": "notes",
  "html": "Read the last column rather than the first four. In the far north the two models very nearly agree — the flat map is least wrong near its own centre, which is exactly where its makers live and exactly where the objection &ldquo;it works fine&rdquo; comes from. Go south and the disagreement does not merely grow: it <b>changes sign</b>, and then passes 90&deg;, and at the December instant a station on the Ross Ice Shelf is told to look almost due north for a Sun that is almost due south. That is not a three-per-cent discrepancy anyone can wave at refraction. It is the difference between turning left and turning right.",
  "k": "az-p5"
 },
 {
  "t": "h2",
  "html": "The eclipse: a published bearing, and nobody's word for it",
  "k": "az-h2c"
 },
 {
  "t": "lead",
  "html": "Everything above is this page computing its own answers, which is worth exactly as much as your trust in this page. So here is one row this page did not compute. For the total solar eclipse of 12 August 2026, Fred Espenak publishes the instant of greatest eclipse, the place on Earth it happens, and the Sun's altitude and azimuth there — computed independently, from the JPL DE405 ephemeris<sup class=\"ref\"><a href=\"#s-azim-n3\">[3]</a></sup>. The table below sets that published azimuth beside this page's own, and beside the great-circle bearing to the sub-solar point, which is the quantity the theorem says must equal it.",
  "opener": false,
  "k": "az-p6"
 },
 {
  "t": "table",
  "id": "azimEclTbl",
  "tbody": "",
  "caption": "Greatest eclipse, 12 August 2026, 17:45:53.3 UT1, at 65&deg;&nbsp;13.4&prime;&nbsp;N 25&deg;&nbsp;13.7&prime;&nbsp;W",
  "head": [
   "Quantity",
   "Published",
   "This page",
   "Difference"
  ],
  "k": "x:b16f1f66"
 },
 {
  "t": "notes",
  "html": "The agreement is not the interesting part — two correct calculations of the same sphere ought to agree. The interesting part is the third row: the bearing to the sub-solar point comes out equal to the azimuth to every decimal the page prints, which is the theorem being obeyed rather than assumed.",
  "k": "az-p7"
 },
 {
  "t": "notes",
  "html": "And the eclipse itself is the theorem at its most literal. An eclipse is the moment the Sun's sub-point and the Moon's sub-point nearly coincide; at greatest eclipse these two places are under a hundred kilometres apart on a planet forty thousand kilometres around, which is why one small patch of Iceland has the Moon exactly in front of the Sun. Two bodies, one at 384,000 km and one at 150 million, produce the same bearing from the same spot because their sub-points are in the same place. <em>Distance does not enter.</em>",
  "k": "az-p7b"
 },
 {
  "t": "notes",
  "html": "The next total eclipse visible from Europe, on 2 August 2027, has a tab of its own: <a class=\"xref\" href=\"#tab-ecl\" data-xref=\"ecl\">Eclipses</a> computes its path, its local times and durations from NASA's Besselian elements, and asks a flat model to do the same.",
  "k": "azim-m4"
 },
 {
  "t": "notes",
  "html": "One honest note on the arithmetic: this page's own &Delta;T model gives 75.5 s where the eclipse prediction uses 72.4 s, a three-second disagreement about the Earth's rotation rate that moves the Sun by well under an arcsecond and the Moon by under two.",
  "k": "az-p7c"
 },
 {
  "t": "h2",
  "html": "The Moon, and why being close does not rescue anything",
  "k": "az-h2d"
 },
 {
  "t": "lead",
  "html": "The Moon is the one body where a reader can reasonably expect the distance to matter, because its parallax is not a rounding error: seen from the surface rather than from the centre of the Earth, the Moon shifts by up to a degree — twice its own diameter. The shift is <b>radial</b>, along the line from the zenith through the body, so it takes the Moon down the vertical circle it is already on. Altitude changes. Bearing does not. The table puts numbers on both, at the same instant and at the same seven stations.",
  "opener": false,
  "k": "az-p8"
 },
 {
  "t": "table",
  "id": "azimMoonTbl",
  "tbody": "",
  "caption": "The Moon at the selected instant: what parallax does to the altitude, and what it does to the bearing",
  "head": [
   "Station",
   "Altitude shift",
   "Bearing shift",
   "Bearing to sub-lunar point"
  ],
  "k": "x:sq-th1"
 },
 {
  "t": "notes",
  "html": "The bearing shifts are arcseconds against a degree of altitude shift, and this page owes you an account of why they are not exactly zero. On a sphere they would be. They are not zero here because the topocentric correction used for the Moon is the standard one<sup class=\"ref\"><a href=\"#s-azim-n9\">[9]</a></sup>, which places the observer on an <em>ellipsoid</em>: the local vertical of a geodetic latitude does not quite pass through the centre, missing it by up to about 11.5&prime; of latitude, and the theorem's one hypothesis fails by exactly that much.",
  "k": "az-p9"
 },
 {
  "t": "notes",
  "html": "So the residue in the third column is the Earth's flattening, not the Moon's proximity — which is a strange thing to have to admit on a page that elsewhere declares the ellipsoid out of scope, and it is admitted rather than rounded away.",
  "k": "az-p9b"
 },
 {
  "t": "h2",
  "html": "Parallax as a ruler",
  "k": "az-h2f"
 },
 {
  "t": "lead",
  "html": "Up to here parallax has been set aside: it is radial, so it slides the Moon along the vertical circle it is already on, so the bearing does not care and this tab may set it aside. All of that is true, and it throws away the best thing in the section. The altitude that parallax shifts is the oldest measurement of the Moon's distance there is. So the same two observations yield two independent results, and they are not in competition: the bearing is the quantity the distance <b>vanishes from</b>, and the difference in altitude is the quantity that is <b>nothing but</b> the distance.",
  "opener": false,
  "k": "az-p11"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What parallax measures, and what it does not.</b> Two observers a known distance apart see the Moon in front of different stars. The angle between their two sight lines gives the Moon's distance <b>in Earth radii</b>, and in nothing else. Turning that into kilometres needs R, and R does not come from the sky: it comes from the surveying, distances and horizon-dip tabs, and from every other radius measurement on this page. This is the thesis of the whole page applied to a single body — the measurement constrains <em>d/R</em>, never <em>d</em> on its own.",
  "k": "az-callout2"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "\\sin \\pi = \\frac{R}{d} \\qquad \\frac{d}{R} = \\frac{1}{\\sin \\pi}",
    "fallback": "sin π = R / d &nbsp;&nbsp; d / R = 1 / sin π"
   }
  ],
  "fig": "azfig4",
  "gloss": "The classical form. π is the <em>horizontal parallax</em>: the angle the Earth's radius subtends as seen from the body, which is the same thing as how far the body shifts between being seen overhead and being seen on the horizon. It is published for the Moon every day<sup class=\"ref\"><a href=\"#s-azim-n2\">[2]</a></sup>. One published number, and the distance in Earth radii follows with no other input whatever. The symbol is the astronomer's, not the circle constant: here π is the name of an angle — about 57′ (0.95°) for the Moon — so sin π ≈ 0.0166, and d ≈ 60 R.",
  "k": "x:az-g4"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "\\frac{d}{R} = \\frac{b}{R \\sin \\theta}",
    "fallback": "d / R = b / (R · sin θ)"
   }
  ],
  "fig": "azfig5",
  "gloss": "The two-observer form, which is the one you could actually carry out. <em>b</em> is the part of the line joining the two observers that lies <em>across</em> the direction of the Moon, and θ is the angle between their two sight lines — which is exactly how far the Moon appears to move against the background stars between the two places. Nothing else enters it: no horizon, no height above sea level, no clock beyond agreeing on the instant.",
  "k": "x:az-g5"
 },
 {
  "t": "table",
  "id": "azimParTbl",
  "tbody": "",
  "caption": "Measuring the Moon's distance from two of the stations above, at the selected instant",
  "head": [
   "Quantity",
   "At this instant",
   "Where the number comes from"
  ],
  "k": "x:44f6af69"
 },
 {
  "t": "notes",
  "html": "Two things in that table are better said out loud than left for a careful reader to catch. <b>The two reconstructions do not agree exactly</b>, and they are not meant to. Part of the gap is fixed and exactly known: horizontal parallax is defined against the Earth's <em>equatorial</em> radius of 6,378.14 km, while the row below it is quoted in mean radii of 6,371 km, so those two lines differ by that ratio &mdash; 0.112 per cent &mdash; before anything else has happened.",
  "k": "az-p12"
 },
 {
  "t": "notes",
  "html": "The rest of the gap moves with the geometry, and it is the flattening again, exactly as in the bearing column further up: it is smallest when the two stations lie squarely across the line of sight, and largest when the baseline is badly foreshortened or the Moon is low in one of the two skies. On a sphere both parts would be zero. Watch it change as the clock runs, because a page that had quietly fitted something would not let you.",
  "k": "az-p12b"
 },
 {
  "t": "notes",
  "html": "<b>And the same measurement fails on the Sun</b>, which is why the last row is there. Across the whole width of the planet the Sun shifts by some sixteen arcseconds — under a hundredth of the Moon's shift, and far below anything the equipment this experiment asks for could see. That failure is what shows the method is not manufacturing its answer: an instrument that returned a distance for everything you pointed it at would be measuring itself.",
  "k": "az-p12c"
 },
 {
  "t": "table",
  "id": "azimLampTbl",
  "tbody": "",
  "caption": "The flat model given its best chance: a lamp at a fixed height above the disc, and the altitudes it would require",
  "head": [
   "Station",
   "Lamp 3,000 km up",
   "5,000 km up",
   "8,000 km up",
   "The Moon, really"
  ],
  "k": "x:sq-th1~2"
 },
 {
  "t": "notes",
  "html": "The lamp's height is the flat model's one free parameter here, and rule 2 of this page's method says to spend it in the flat model's favour rather than to caricature it — so the table sweeps it instead of picking one. Choose whichever column comes closest at one station and it is wrong at the next; there is no height, inside that range or outside it, that produces the last column.",
  "k": "az-p13"
 },
 {
  "t": "notes",
  "html": "Then notice what happens at the places where the Moon has set. A lamp hanging over a plane is above the horizon from <em>everywhere</em> on that plane, always, at every height — its altitude is the arctangent of a positive number and cannot be anything else. The Moon is below the horizon at several of these places at the same moment. That is not a disagreement of a few degrees to be haggled over: it is a change of sign, and no choice of height touches it.",
  "k": "az-p13b"
 },
 {
  "t": "h2",
  "html": "Who did this before you",
  "k": "az-h2g"
 },
 {
  "t": "notes",
  "html": "None of this is a modern measurement, and pretending otherwise would sell it short. Hipparchus, in the second century BC, got the Moon's distance out of a solar eclipse that was total at the Hellespont and about four fifths covered at Alexandria — two places, one instant, one angle. The figure usually reconstructed for him is around 67 Earth radii, with a spread of roughly 62 to 73<sup class=\"ref\"><a href=\"#s-azim-n10\">[10]</a></sup>, and the eclipse is most probably the one astronomers label &minus;189, which is 190 BC<sup class=\"ref\"><a href=\"#s-azim-n11\">[11]</a></sup>. Those are reconstructions from later summaries and they differ between scholars, so a range is the only honest form to give them in.",
  "k": "az-p14"
 },
 {
  "t": "notes",
  "html": "Ptolemy, three centuries after that, measured the parallax <em>directly</em>, with an instrument built for the purpose, in Book V of the <em>Almagest</em><sup class=\"ref\"><a href=\"#s-azim-n12\">[12]</a></sup> — a different geometry from the eclipse method, and the two are routinely run together by people retelling the story. His lunar model was also badly wrong about how much the distance varies, implying a swing from about 34 to 64 Earth radii<sup class=\"ref\"><a href=\"#s-azim-n10\">[10]</a></sup> where the truth is about 56 to 64: a useful reminder that having the right order of magnitude is not the same as being right.",
  "k": "az-p14b"
 },
 {
  "t": "notes",
  "html": "And in 1751 the thing was finally done properly. Lacaille observed the Moon from the Cape of Good Hope while Lalande, nineteen years old and sent in his teacher's place, observed it from Berlin on very nearly the same meridian<sup class=\"ref\"><a href=\"#s-azim-n13\">[13]</a></sup>: two people ten thousand kilometres apart, agreeing on a minute. What the young Lalande then argued about with that teacher, in front of a commission of the Paris Academy, was how much to allow for the Earth not being a perfect sphere — which is the same correction that puts the tenth of a per cent into the table above.",
  "k": "az-p14c"
 },
 {
  "t": "h2",
  "html": "What could spoil your measurement",
  "k": "az-h2e"
 },
 {
  "t": "notes",
  "html": "<b>Magnetic north is not north.</b> This is the one that will ruin the experiment if it is not taken seriously, because the error is the same size as the effect: the declination runs to 10&ndash;20&deg; across western Europe and much more elsewhere, and it drifts. Either correct it with the official model<sup class=\"ref\"><a href=\"#s-azim-n7\">[7]</a></sup> or, better, avoid the compass entirely — at true solar noon the shadow of a vertical stick is at its shortest and lies exactly along the north&ndash;south line, so one observation removes magnetic declination from the problem altogether.",
  "k": "az-p10"
 },
 {
  "t": "notes",
  "html": "<b>The clock matters more than it looks.</b> The sub-solar point travels 15&deg; of longitude per hour; an hour of error is an hour of wrong answer, and everything on this tab is stated in UTC for that reason.",
  "k": "az-p10b"
 },
 {
  "t": "notes",
  "html": "<b>Refraction is almost innocent here</b>, and that is not luck: like parallax, atmospheric refraction lifts a body along its vertical circle, so in a spherically stratified atmosphere it changes the altitude by up to 34&prime; near the horizon and the azimuth by nothing at all. Only a horizontally structured atmosphere bends a bearing, and by arcminutes.",
  "k": "az-p10c"
 },
 {
  "t": "notes",
  "html": "<b>And the projection is a choice</b>, restated once more because it is the honest weak point: the numbers in the flat column are the azimuthal equidistant map's numbers, not a proof about every conceivable flat map.",
  "k": "az-p10d"
 },
 {
  "away": "xp-azim-9",
  "t": "exp",
  "h": "Experiment 9 · where is the Sun for you?",
  "title": "A stick, its shadow, and one agreed minute — with a friend far away, if you can",
  "lead": "Stand a stick vertically on level ground. At an agreed UTC minute, mark the shadow. The Sun's azimuth is the shadow's direction plus 180&deg;. Measure that angle from <b>true</b> north — see above for why the compass will not do — with a printed protractor and a piece of string, or by taking a second mark at local solar noon to establish the north&ndash;south line first.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> your <b>place</b>. The sharp version needs two observers far apart in latitude, ideally one in each hemisphere, at the same UTC minute; the weaker but still decisive version is one observer and the published bearing for their own coordinates.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the Sun's <b>azimuth</b> in degrees from true north. One angle. Not a duration, not a brightness, not a horizon.",
  "meta": [],
  "inputs": [],
  "out": "azim9out",
  "verdict": "azim9v",
  "k": "x:az-exph"
 },
 {
  "away": "xp-azim-9b",
  "t": "exp",
  "h": "Experiment 9b · the Moon against the stars",
  "title": "One photograph each, two places, one agreed second — and the sky is the ruler",
  "lead": "Agree an instant, to the second, with someone far away from you in latitude. At that instant each of you photographs the Moon with a star close beside it in the same frame. Then measure how far the Moon sits from that star, in arcminutes, in each photograph, and take the difference. That difference is the parallax. You are deliberately <em>not</em> measuring a height above a horizon: an angle inside a single frame needs no level, no horizon and no calibration, and refraction lifts the Moon and the star beside it by almost the same amount, so most of it cancels instead of having to be modelled.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> your <b>place</b>, at a fixed instant. Two observers as far apart in latitude as you can arrange; a few thousand kilometres is already plenty. Without a second observer, the published topocentric position for your own coordinates does the same job rather less convincingly.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the Moon's <b>angular distance from a nearby star</b>, in arcminutes. One angle inside one photograph. Not an altitude, not a time, not a horizon.",
  "meta": [],
  "inputs": [],
  "out": "azim9bout",
  "verdict": "azim9bv",
  "k": "x:az-exph2"
 },
 {
  "t": "xrefs",
  "keys": [
   "sun",
   "twi",
   "mag",
   "cnav",
   "dist",
   "surv",
   "obs"
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
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li><a href=\"https://science.nasa.gov/eclipses/future-eclipses/total-solar-eclipse-on-august-12-2026/\">NASA — <em>Total Solar Eclipse on August 12, 2026</em></a>, with the Scientific Visualization Studio's shadow-path map. Not needed for any claim here, but it is the same event drawn as a picture, and the umbral track is the sub-lunar point's path across the surface.</li> <li><a href=\"https://www.imcce.fr/\">IMCCE, Observatoire de Paris</a> — a third independent ephemeris service, and in French. Worth having because &ldquo;check it somewhere else&rdquo; is a weaker instruction when all the somewhere-elses are in one country.</li> <li><b>Bowditch, <em>The American Practical Navigator</em></b>, the chapters on azimuth and on the sight reduction of the Sun. The theorem on this tab is, in navigator's language, the statement that the azimuth of a body equals the bearing of its geographical position — a working tool for two centuries before it was an argument about anything.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
