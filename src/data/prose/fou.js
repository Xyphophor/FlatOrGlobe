// Prose de l'onglet fou, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Foucault · the sine that gives away the sphere",
  "k": "fou-m1"
 },
 {
  "t": "h1",
  "html": "A weight on a wire measures the angle between your floor and the axis of the world"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\"> <div class=\"figsym\" id=\"fouPairFig\"></div> <div class=\"fcap\"><b>Only the part of Ω square to your floor can turn a swing plane.</b> All of it at every station on a spinning disc; none at the equator on a globe, reversed past it. Dashed: below the floor. The disc is lent a daily spin here — the flat model as usually held has none, and predicts no precession anywhere.</div> </div>",
  "k": "x:fp-pair"
 },
 {
  "t": "lead",
  "html": "In February 1851 Léon Foucault hung a 67 m wire from the dome of the Panthéon, tied a 28 kg brass bob to the end, burned the cord holding it aside, and let Paris watch its own floor turn. The demonstration is famous for proving that the Earth rotates. That is the smaller half of what it does.",
  "opener": true,
  "k": "fp-lead"
 },
 {
  "t": "lead",
  "html": "The plane of swing turns at <b>15.041°/h × sin(latitude)</b> — and that sine is not about rotation at all. It is a statement about the angle between the local vertical and the axis of spin, measured separately at every latitude, and it is the sharpest shape test on this page that needs no distant object, no clear air and no horizon.",
  "opener": true,
  "k": "fp-lead2"
 },
 {
  "t": "video",
  "yt": "M8rrWUUlZ_U",
  "title": "Foucault's Pendulum: Watch the world turn.",
  "author": "The Gentleman Physicist",
  "authorUrl": "https://www.youtube.com/@TheGentlemanPhysicis",
  "html": "<b>Watch it first.</b> A real Foucault pendulum, filmed: the slow turning of the plane of swing that the rest of this page puts into numbers. Chosen by <a href=\"https://x.com/Xyphophor\" target=\"_blank\" rel=\"noopener\">Xyphophor</a>.",
  "k": "fp-video1"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "\\omega = \\Omega\\sin\\varphi",
    "fallback": "ω = Ω sin φ"
   },
   {
    "tex": "T = \\frac{23^{\\mathrm{h}}56^{\\mathrm{m}}04^{\\mathrm{s}}}{\\sin\\varphi}",
    "fallback": "T = 23<sup>h</sup>56<sup>m</sup>04<sup>s</sup> / sin φ"
   },
   {
    "tex": "\\g{\\Omega = 15.041\\ \\deg/\\text{h}}",
    "fallback": "<b>Ω = 15.041 °/h</b>"
   }
  ],
  "fig": "foufig0",
  "gloss": "Ω is one turn per <em>sidereal</em> day — relative to the stars, not the Sun. φ is your latitude, signed: positive north, negative south. Read the formula as a prediction machine rather than a result. It says the swing plane turns clockwise in the northern hemisphere, anticlockwise in the southern, and <em>not at all</em> on the equator. A flat Earth spinning once a day predicts the same rate everywhere with the same sense; a flat Earth that does not spin predicts zero everywhere. All three are testable in an afternoon with a stairwell.",
  "k": "x:fp-gloss"
 },
 {
  "t": "h2",
  "html": "What a pendulum on a turning floor actually does",
  "k": "fp-h1"
 },
 {
  "t": "lead",
  "html": "A pendulum hung so that its pivot cannot transmit twist has nothing to tell it which way to swing. Once it is moving in a plane, the only forces on it are gravity, which acts along the wire and in the plane, and the wire's tension, likewise. Nothing pushes it sideways. In an inertial frame the plane therefore stays put — and the floor, the building and the city underneath rotate past it. What the visitor sees as the pendulum turning is the room turning.",
  "opener": false,
  "k": "fp-p1"
 },
 {
  "t": "lead",
  "html": "Foucault said exactly this in four pages to the Académie des sciences on 3 February 1851, presented by Arago. His point was not the physics, which was old, but that the effect could be <em>seen</em>: the swing plane, he wrote, moves gradually from east to west, giving a perceptible sign of the diurnal motion of the terrestrial globe.<sup class=\"ref\"><a href=\"#s-fou-n1\">[1]</a></sup> He had already built a 2 m version in his cellar in January and an 11 m one at the Paris Observatory in February; the Panthéon wire was the third and the one that made the newspapers.",
  "opener": false,
  "k": "fp-p2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Concede this immediately.</b> A single Foucault pendulum, observed at one place, does <em>not</em> prove the Earth is a sphere. It proves that the frame you are standing in is rotating — nothing more. A flat disc spinning once a day would also make a pendulum precess. Anyone who tells you one pendulum settles the shape of the world is overselling, and the overselling is what gives the objection its bite. The shape argument lives entirely in the <em>sine</em>: in how the rate changes when you carry the pendulum somewhere else. That is what the rest of this tab is about.",
  "k": "fp-call1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:18px 0\"> <div class=\"preset-row\" style=\"margin-bottom:6px\"> <span class=\"preset-lbl\">Draw it in</span> <button class=\"presetbtn\" id=\"fouFrFloor\" aria-pressed=\"true\">Floor frame — what you see</button> <button class=\"presetbtn\" id=\"fouFrSwing\" aria-pressed=\"false\">Swing frame — plane held still</button> </div> <div class=\"preset-row\" style=\"margin-bottom:6px\"> <span class=\"preset-lbl\">Latitude</span> <button class=\"presetbtn\" id=\"fouLat90\" data-fouphi=\"90\" aria-pressed=\"false\">90° pole</button> <button class=\"presetbtn\" id=\"fouLatPar\" data-fouphi=\"48.8462\" aria-pressed=\"true\">48.8° Paris</button> <button class=\"presetbtn\" id=\"fouLat0\" data-fouphi=\"0\" aria-pressed=\"false\">0° equator</button> <button class=\"presetbtn\" id=\"fouLatMel\" data-fouphi=\"-37.81\" aria-pressed=\"false\">−37.8° Melbourne</button> <span style=\"flex:1 1 auto\"></span> <button class=\"presetbtn\" id=\"fouPlay\" aria-pressed=\"true\" aria-label=\"Play or pause\">&#10073;&#10073;</button> <button class=\"presetbtn\" id=\"fouReset\" aria-label=\"Restart\">&#8634;</button> </div> <div class=\"reads\" id=\"fouAnimReads\"></div> <canvas id=\"fouAnimCanvas\"></canvas> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"foufloor\"></span><span>floor frame: the room is held still and the swing plane creeps round it — what a visitor sees</span></li> <li><span class=\"sw\" data-sw=\"fouswing\"></span><span>swing frame: the plane is held still and the floor turns underneath — what is physically happening</span></li> </ul> <div class=\"fcap\"><b>The same motion, drawn twice.</b> Looking straight down at the floor. Nothing about the pendulum changes between the two buttons; only the choice of what to nail to the screen. Set the latitude to 0° and both pictures go inert, because sin 0 = 0. One honest caveat on the naming: at the pole the swing frame really is the frame of the stars, but at any other latitude it is the frame the plane is <em>parallel-transported</em> in. Swing rate and time are both scaled, the factors are printed on the figure, and the angle the plane sweeps is real.</div> </div>",
  "k": "x:gv-t4a"
 },
 {
  "t": "h2",
  "html": "Where the sine comes from",
  "k": "fp-h2"
 },
 {
  "t": "lead",
  "html": "The Earth turns about a single axis, at a single rate. Stand anywhere on it and that rotation vector <b>Ω</b> can be split into two pieces relative to <em>your</em> local vertical: a component along the vertical, of size Ω sin φ, and a component along the local horizontal pointing north, of size Ω cos φ. Only the vertical component can turn a horizontal swing plane. The horizontal component tries to tip the plane out of horizontal, and gravity and the wire will not let it — to first order it does nothing at all.<sup class=\"ref\"><a href=\"#s-fou-n2\">[2]</a></sup>",
  "opener": false,
  "k": "fp-p3"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\Omega_{\\text{vertical}} = \\Omega\\sin\\varphi",
    "fallback": "Ω<sub>vertical</sub> = Ω sin φ"
   },
   {
    "tex": "\\Omega_{\\text{horizontal}} = \\Omega\\cos\\varphi",
    "fallback": "Ω<sub>horizontal</sub> = Ω cos φ"
   }
  ],
  "fig": "foufig1",
  "gloss": "At the pole the axis <em>is</em> the local vertical: sin φ = 1, and the floor turns a full circle under the pendulum in one sidereal day. At the equator the axis is horizontal: sin φ = 0, and the swing plane does not turn even though the Earth is rotating as fast there as anywhere — faster, in fact, measured in kilometres per hour. In between you get the sine, and its sign flips when you cross the equator because the local vertical flips relative to the axis.",
  "k": "x:fp-gloss2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"fouOmegaCanvas\"></canvas> <div class=\"fcap\"><b>One rotation vector, three floors.</b> Ω is the same arrow everywhere — same direction, same length, parallel to the axis. What changes from place to place is your floor. Near the pole the arrow is almost straight up out of the floor and nearly all of it counts; near the equator it lies almost flat in the floor and almost none of it does. The vertical piece, drawn in teal, is Ω sin φ, and it is the whole of the precession rate.</div> </div> <div class=\"fig\"> <canvas id=\"fouRoseCanvas\"></canvas> <div class=\"fcap\"><b>What you actually watch.</b> The bob's track over six hours at the latitude of Paris, drawn in the frame of the floor. The swing plane creeps round at 11.3° per hour, so the star pattern closes up after about 32 hours. The narrow ellipse is exaggerated here to make successive swings distinguishable; in a well-started pendulum it is the thing you spend all your effort making smaller, for reasons three sections below.</div> </div> </div>",
  "k": "x:fp-fcap1"
 },
 {
  "t": "h2",
  "html": "Why the sine is a statement about a sphere, not about spinning",
  "k": "fp-h3"
 },
 {
  "t": "lead",
  "html": "Here is the part that turns a rotation demo into a geometry measurement. Forget forces and watch the swing direction as a little arrow lying flat on the ground, carried once around a circle of latitude as the day passes. The arrow is never twisted about the vertical — there is nothing to twist it. In differential geometry that is exactly the definition of <b>parallel transport</b>, and the striking fact about parallel transport on a curved surface is that an arrow carried around a closed loop comes back <em>rotated</em>.",
  "opener": false,
  "k": "fp-p4"
 },
 {
  "t": "lead",
  "html": "The amount it comes back rotated is the solid angle enclosed by the loop. For a circle of latitude φ on a sphere that solid angle is 2π(1 − sin φ), so after one full day the arrow has slipped by 2π sin φ relative to the ground — which is the Foucault rate, obtained with no dynamics whatsoever.<sup class=\"ref\"><a href=\"#s-fou-n3\">[3]</a></sup> It is the same mathematical creature as Berry's phase in quantum mechanics, and the pendulum is its oldest instrument.<sup class=\"ref\"><a href=\"#s-fou-n5\">[5]</a></sup>",
  "opener": false,
  "k": "fp-p5"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The sentence that matters.</b> Parallel transport around a closed loop produces a mismatch only if the surface is <em>curved</em>; on a flat surface the arrow comes home pointing exactly where it started. So the Foucault mismatch is not only evidence of rotation — it measures the Gaussian curvature enclosed by the pendulum's daily path. One review of the geometry puts it plainly: the conventional reading is that the pendulum shows the Earth rotates, the geometric reading that it shows the Earth is a sphere.<sup class=\"ref\"><a href=\"#s-fou-n4\">[4]</a></sup> Another derives the result as a special case of Gauss–Bonnet: the pendulum shows that the planet turns and that it is curved.<sup class=\"ref\"><a href=\"#s-fou-n3\">[3]</a></sup>",
  "k": "fp-call2"
 },
 {
  "t": "lead",
  "html": "There is a homelier way to say it. A pendulum measures the angle between your floor and the axis of the world. Carry it around and you are mapping the direction of the local vertical over the whole surface. If the verticals all point the same way, the surface is flat and every pendulum agrees. If the verticals fan out as sin φ, the surface is a sphere and every pendulum disagrees with its neighbour by precisely the amount the sphere requires. Two centuries of pendulums have disagreed in exactly that pattern.",
  "opener": false,
  "k": "fp-p6"
 },
 {
  "t": "h2",
  "html": "Three models, three different predictions",
  "k": "fp-h4"
 },
 {
  "t": "lead",
  "html": "The flat model is not one claim but two, and both are on the table in flat-earth discussion, so both get a column. Either the Earth does not rotate — in which case a free pendulum has no reason to precess anywhere — or it is a disc spinning once a day about the pole at its centre. On such a disc the local vertical is parallel to the spin axis at every single point, so sin φ is effectively 1 everywhere: every pendulum, from the middle to the rim, precesses at the full 15.041°/h, all turning the same way.",
  "opener": false,
  "k": "fp-p7"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "fouModelRows",
  "caption": "Predicted precession of the swing plane — every number computed from the three models, none fitted",
  "head": [
   "Latitude",
   "Globe: Ω sin φ",
   "Globe: full turn",
   "Flat, not rotating",
   "Flat disc, 1 turn/day"
  ],
  "k": "x:gv-t4a~2"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>Three predictions, and the data picks one.</b> A pendulum at Paris precesses at all, which finishes the non-rotating flat model on its first afternoon. The pendulum run at the geographic South Pole in 2001 precessed the <em>other way</em> from every northern installation — which finishes the spinning disc, since a disc turning one way cannot make a swing plane turn the other way anywhere on it. The disc also owes an explanation for the equator, where the globe says the rate falls to exactly zero. This is a <b>sign and zero-crossing</b> test: no adjustable parameter puts a zero at the equator and a reversal south of it, except being on a sphere.",
  "k": "fp-call3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:18px 0\"> <canvas id=\"fouLatCanvas\"></canvas> <div class=\"fcap\"><b>The whole argument in one curve.</b> Precession rate against latitude for the three models. The globe's sine crosses zero at the equator and changes sign; the spinning disc is a horizontal line at the full rotation rate; the stationary flat Earth is the axis itself. Dots mark installations whose latitude is listed in the table below. Any single pendulum sits on one dot and cannot distinguish the models on its own — the argument is the shape of the curve those dots lie on.</div> </div>",
  "k": "x:fp-fcap3"
 },
 {
  "t": "h2",
  "html": "Installations, and what they were measured to do",
  "k": "fp-h5"
 },
 {
  "t": "lead",
  "html": "Below are five installations at widely separated latitudes, with the rate the globe model predicts from the latitude alone. Two of them carry a measured value from a published account. The most useful of those is the one taken as close to a pole as anyone has managed: in the winter of 2001 four researchers hung a 33 m wire with a 25 kg bob down a six-storey stairwell of the station then under construction at the geographic South Pole, at −68 °C, and marked the apex of the swing on the floor every twenty minutes for a day.",
  "opener": false,
  "k": "fp-p8"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "fouSiteRows",
  "caption": "Documented Foucault installations — predicted rate computed from latitude, measured values as published",
  "head": [
   "Site",
   "Latitude",
   "Wire",
   "Predicted rate",
   "Predicted full turn",
   "Measured"
  ],
  "k": "x:gv-t4a~3"
 },
 {
  "t": "lead",
  "html": "They found the plane turning 5° every twenty minutes, giving a full turn in <b>24 hours ± 50 minutes</b> against a prediction of 23 h 56 m, and — the detail that matters more than the number — turning <em>reversed</em> with respect to every northern installation — exactly the sign change the sine demands once φ goes negative.<sup class=\"ref\"><a href=\"#s-fou-n6\">[6]</a></sup> They also got a bonus: timing the swing gave g = 9.85 ± 0.03 m/s², which is the polar value, and which nobody was trying to fit.",
  "opener": false,
  "k": "fp-p9"
 },
 {
  "t": "h2",
  "html": "The experiment is genuinely hard, and pretending otherwise helps nobody",
  "k": "fp-h6"
 },
 {
  "t": "lead",
  "html": "A real pendulum has a systematic error that can swamp the effect, and it is worth knowing about before someone presents it to you as a scandal. If the bob traces even a very thin <em>ellipse</em> rather than a straight line, the ellipse itself precesses, for reasons that have nothing to do with the Earth. George Airy worked out the rate in 1851, and it is proportional to the area of the ellipse:",
  "opener": false,
  "k": "fp-p10"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "\\omega_{\\text{Airy}} = \\frac{3}{8}\\cdot\\frac{a\\,b}{L^2}\\cdot\\sqrt{\\frac{g}{L}}",
    "fallback": "ω<sub>Airy</sub> = (3/8) · (a·b / L²) · √(g/L)"
   }
  ],
  "fig": "foufig2",
  "gloss": "a and b are the semi-axes of the ellipse, L the wire length. The precession runs in whichever direction the bob is going round its ellipse. Put in the Panthéon's numbers — L = 67 m, a 3 m swing, and an ellipse just <b>1 cm</b> wide — and you get 0.198°/h, about 1.7% of Foucault's 11.3. Now shorten the wire to 5 m with a 0.5 m swing and the same 1 cm of ellipse: 21.7°/h, roughly twice the real signal and pointing wherever your release happened to point. The rate falls off as L<sup>−5/2</sup>. That, and not showmanship, is why Foucault wanted 67 metres of it.<sup class=\"ref\"><a href=\"#s-fou-n7\">[7]</a></sup>",
  "k": "x:fp-gloss3"
 },
 {
  "t": "lead",
  "html": "This is why the ritual matters: the bob is drawn aside with a thread, allowed to settle completely, and the thread is <em>burned</em> rather than cut, so that no sideways impulse is given at release. Museums that must run unattended for years add a <b>Charron ring</b> — a small ring below the pivot that the wire brushes near the end of each swing, bleeding away the elliptical component while leaving the planar one alone. Both are corrections for a known, calculable, signed error. Neither is a thumb on the scale, and the reason lies in the last line of this section.",
  "opener": false,
  "k": "fp-p11"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The error has a tell, and it is a good one.</b> The Airy precession follows the direction the bob circulates its ellipse — start it the other way round and it reverses. The Coriolis precession does not care how you released it: at a given latitude it is the same rate in the same direction every time. So anyone can separate them in an afternoon: release the bob a dozen times with deliberately opposite ellipses and average; whatever survives is the Earth. A modern study measuring both on a 4.8 m pendulum finds exactly the interplay the formulas predict, down to amplitudes at which the two cancel and the precession stops.<sup class=\"ref\"><a href=\"#s-fou-n7\">[7]</a></sup>",
  "k": "fp-call4"
 },
 {
  "t": "h2",
  "html": "Six objections, answered with numbers",
  "k": "fp-h7"
 },
 {
  "t": "fold",
  "q": true,
  "k": "fou-fold1",
  "summary": "<b class=\"faq-q\">1. \"It only shows rotation, so it says nothing about shape.\"</b>",
  "html": "<p class=\"cnav-lead\">Correct for one pendulum, as the first callout of this tab states. Wrong for two. The rate depends on latitude as sin φ, which is the projection of a fixed axis onto a local vertical that changes direction from place to place — and a vertical that changes direction from place to place is what a curved surface <em>is</em>. On a flat surface, however it moves, every local vertical is parallel to every other, so every pendulum must run at the same rate. They do not.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "fou-fold2",
  "summary": "<b class=\"faq-q\">2. \"Museum pendulums are driven by an electromagnet, so the museum sets the rate.\"</b>",
  "html": "<p class=\"cnav-lead\">The drive is a ring or coil mounted on the vertical axis, directly under the pivot point, and it is <em>axially symmetric</em>: it pulls the bob along the line it is already travelling, replacing energy lost to air, and by symmetry it exerts no torque about the vertical. It cannot set a direction it does not know. And the claim is testable rather than arguable: if drives set the rate, driven pendulums would show a rate characteristic of their drives rather than of their latitudes. Instead they show sin φ. Foucault's own pendulum had no drive at all, and neither did the South Pole one — it was restarted by hand every couple of hours as the swing died.<sup class=\"ref\"><a href=\"#s-fou-n6\">[6]</a></sup></p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "fou-fold3",
  "summary": "<b class=\"faq-q\">3. \"Even Airy called it a fraud.\"</b>",
  "html": "<p class=\"cnav-lead\">He did, in private correspondence, before attending a single demonstration — and his stated objection was that starting a pendulum swinging in a true plane is extremely difficult. On that narrow point he was <em>right</em>, which is the whole of the previous section. What he was wrong about is whether the difficulty is insuperable, and that was settled by burning threads, Charron rings, longer wires and averaging over opposite releases. An 1851 objection to experimental technique is not an outstanding objection to a result reproduced for 175 years on every continent including Antarctica.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "fou-fold4",
  "summary": "<b class=\"faq-q\">4. \"The South Pole team kept adjusting until they got the answer they wanted.\"</b>",
  "html": "<p class=\"cnav-lead\">They did rebuild the apparatus twice, and they say so themselves, in print, in the same account that reports the result — which is already a strange way to run a fraud.<sup class=\"ref\"><a href=\"#s-fou-n6\">[6]</a></sup> Look at what the two failures were. First, they hung the bob with its long axis vertical, and air resistance on it spun the whole pendulum; second, they got a rate twice the expected one. Both are recognised apparatus faults with recognised fixes, and both were diagnosed before the final run rather than explained afterwards. Set against that: the same apparatus returned g = 9.85 ± 0.03 m/s², a quantity nobody was steering, and it landed on the polar value. Debugging an instrument until it stops lying is what experimental work consists of; the question to ask is whether the diagnosis was independent of the wanted answer, and here it demonstrably was.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "fou-fold5",
  "summary": "<b class=\"faq-q\">5. \"Coriolis is a fictitious force, so it cannot do anything.\"</b>",
  "html": "<p class=\"cnav-lead\">\"Fictitious\" is a technical term meaning \"an artefact of describing motion in an accelerating frame\", not \"imaginary\". The pendulum is the instrument that detects that your frame is accelerating. Complaining that the force is fictitious is complaining that the experiment worked. In the frame of the stars there is no Coriolis force and no puzzle: the plane sits still and the building turns.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "fou-fold6",
  "summary": "<b class=\"faq-q\">6. \"Air currents, building sway, a twisting wire.\"</b>",
  "html": "<p class=\"cnav-lead\">All real, all present, and none of them latitude-aware. A draught in Chicago does not know it should produce 10.02°/h while an identical draught in Melbourne produces −9.22°/h and one in Quito produces zero. Systematic errors that happen to reproduce sin φ across a hundred independent buildings, built by people who never met, are not systematic errors. They are the signal.</p>"
 },
 {
  "away": "xp-fou-1d",
  "t": "exp",
  "h": "Experiment 1d · Foucault pendulum",
  "title": "Find a stairwell, and measure the angle between your floor and the axis of the world",
  "lead": "This is the rare shape test you can run indoors, alone, at night, with hardware from a builders' merchant. Hang the heaviest compact mass you can from the longest wire your building allows, on a pivot that cannot transmit twist. Draw the bob aside with a thread, wait until it is dead still, burn the thread. Mark the apex of the swing on the floor every twenty minutes. The calculator below tells you before you start whether your stairwell is tall enough for the answer to mean anything.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> your <b>latitude</b> — ideally by persuading someone at a very different one to repeat it. A second site is what converts a rotation demo into a shape measurement.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>angle the swing plane turns</b> in a measured time, and its <b>sense</b>. The sense alone already separates the three models if you can get south of the equator.",
  "meta": [],
  "inputs": [
   [
    "expFlat",
    "Your latitude <span class=\"unit\">(°, − for south)</span>",
    " type=\"number\" id=\"expFlat\" value=\"48.8462\" min=\"-90\" max=\"90\" step=\"0.0001\""
   ],
   [
    "expFL",
    "Wire length L <span class=\"unit\">(m)</span>",
    " type=\"number\" id=\"expFL\" value=\"12\" min=\"0.5\" max=\"120\" step=\"0.5\""
   ],
   [
    "expFa",
    "Swing half-amplitude a <span class=\"unit\">(m)</span>",
    " type=\"number\" id=\"expFa\" value=\"0.5\" min=\"0.02\" max=\"10\" step=\"0.05\""
   ],
   [
    "expFb",
    "Ellipse half-width b <span class=\"unit\">(cm)</span>",
    " type=\"number\" id=\"expFb\" value=\"1\" min=\"0\" max=\"100\" step=\"0.1\""
   ],
   [
    "expFt",
    "Watch for <span class=\"unit\">(h)</span>",
    " type=\"number\" id=\"expFt\" value=\"3\" min=\"0.25\" max=\"48\" step=\"0.25\""
   ]
  ],
  "out": "expFout",
  "verdict": "expFv",
  "k": "x:fp-exph"
 },
 {
  "t": "notes-block",
  "paras": [
   "<p><span class=\"k\">A caveat this page owes you.</span> The sin φ law is first-order. A full treatment carries small corrections — the pendulum's own amplitude, the fact that the precession is not perfectly uniform through a single swing, the ellipticity of the Earth changing the direction of the local vertical by up to about 11′ between geodetic and geocentric latitude, and, at the level of parts in 10<sup>9</sup>, frame dragging. None of them approaches the size of the effect being argued about here: the difference between the globe and the spinning-disc prediction at Paris is 3.7°/h, roughly a quarter of the whole rotation rate, while every correction just listed is smaller than the width of a chalk mark.</p> <p><span class=\"k\">The through-line.</span> Every other tab on this page tests the shape of the Earth by looking at something far away — a mountain, a horizon, a star, a satellite — and therefore has to argue about the air in between. This one does not. There is no sightline, no refraction, no atmosphere in the argument at all; the instrument is a weight on a string in a stairwell, and the quantity it reports is the orientation of your own floor. That is why it belongs beside the optical tabs rather than among them: it is the same conclusion reached with none of the same assumptions.</p>"
  ],
  "k": "x:fp-n1"
 },
 {
  "t": "xrefs",
  "keys": [
   "cnav",
   "sun",
   "grav"
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
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li id=\"sfou-r1\"><a href=\"https://arxiv.org/pdf/2207.04135\">B. F. Bayman &amp; others, \"An Alternative Treatment of the Foucault Pendulum\", arXiv:2207.04135</a> — a derivation that avoids the usual rotating-frame machinery, with a bibliography of the standard textbook treatments (Goldstein, Landau &amp; Lifshitz, Fetter &amp; Walecka) for anyone who wants the classical route.</li> <li id=\"sfou-r2\"><a href=\"https://culturesciencesphysique.ens-lyon.fr/ressource/Pendule-Foucault-4_Lauginie.xml\">P. Lauginie, \"Le pendule de Foucault\", <em>CultureSciences-Physique</em> (ENS de Lyon)</a> — a detailed French-language treatment of the experiment, its history and its analysis, with the Foucault bibliography including the 1878 <em>Recueil des travaux scientifiques</em>.</li> <li id=\"sfou-r3\"><a href=\"https://arxiv.org/pdf/2006.08488\">A. Venaille &amp; P. Delplace, \"From the geometry of Foucault pendulum to the topology of planetary waves\", arXiv:2006.08488</a> — the parallel-transport picture set out carefully, then carried over to atmospheric and oceanic waves; useful for seeing that the pendulum's geometry is not an isolated curiosity.</li> <li><b>Musée des Arts et Métiers, Paris.</b> The original 1851 bob hangs there and a pendulum runs in the former priory church. Foucault's experiment is one of the few on this page you can watch in person for the price of a museum ticket, in the building where it was repeated for the public in 1851.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
