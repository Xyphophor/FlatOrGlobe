// Prose de l'onglet mag, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Magnetism &amp; the compass · the needle is a 3-D instrument",
  "k": "mag-m1"
 },
 {
  "t": "h1",
  "html": "The needle doesn't just point north — it tilts"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\"> <div class=\"figsym\" id=\"magPairFig\"></div> <div class=\"fcap\"><b>How far the needle turns over, along the same 20,000 km.</b> On the globe the turn completes — nose down, level, nose up. On flat ①, with the buried magnet’s depth already set in the flat model’s own favour, it stalls short: nothing on the disc gets past about 35° up. Red end is north-seeking.</div> </div>",
  "k": "x:mg-pair"
 },
 {
  "t": "lead",
  "html": "A compass needle is a freely-pivoting magnet: it settles <em>along</em> the local magnetic field vector, in three dimensions. The familiar hiking compass hides this by clamping the needle to a horizontal card; free the other axis and the needle <b>dips</b> — down in the northern hemisphere, level at the magnetic equator, <b>up</b> in the southern hemisphere. That tilt pattern is measured daily, and the two shapes below predict very different versions of it. Drag either scene to orbit it.",
  "opener": true,
  "k": "bcf0bb03"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "mini-form",
  "id": "",
  "html": "<div class=\"mini-form\"> <div class=\"field\" style=\"flex:1;min-width:230px\"> <label>Your compass — magnetic latitude λ <span id=\"magLatRead\" class=\"unit\">+45°</span></label> <input type=\"range\" id=\"magLat\" min=\"-89\" max=\"89\" step=\"1\" value=\"45\" style=\"accent-color:var(--obj3)\"> </div> <button type=\"button\" class=\"swapbtn\" id=\"magWalkBtn\">⏸ pause</button> </div>",
  "k": "x:45a1d371"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "mag-wrap",
  "id": "",
  "html": "<div class=\"mag-wrap\"><div class=\"mag-trio\"><div class=\"fig\"><div class=\"mag-h\"><b><span style=\"color:var(--globe)\">Globe</span> — central dipole</b></div><canvas id=\"magG\"></canvas><div class=\"fcap\" id=\"magGCap\"><b>One magnet, in the middle of a sphere.</b> Field lines leave near the south magnetic pole, arc over, and re-enter near the north one. Notice how fast the needle steepens: the factor 2 in tan I = 2 tan λ puts the dip past 45° only 27° from the magnetic equator, so the field is near-parallel to the ground in that narrow band only — Paris already tilts 64°. True scale.</div></div><div class=\"fig\"><div class=\"mag-h\"><b><span style=\"color:var(--flat)\">Flat disc ①</span> — magnet under the centre</b></div><canvas id=\"magF1\"></canvas><div class=\"fcap\" id=\"magF1Cap\"></div></div><div class=\"fig\"><div class=\"mag-h\"><b><span style=\"color:var(--flat)\">Flat disc ②</span> — centre pole + rim ring</b></div><canvas id=\"magF2\"></canvas><div class=\"fcap\" id=\"magF2Cap\"></div></div></div><div class=\"fig mag-dials-fig\"><canvas id=\"magDials\"></canvas><div class=\"fcap\">The same three compasses side by side, each a dip circle seen edge-on: the grey line is the local horizontal, north is to the right, and the red end of the needle is the north-seeking one. One observer, one latitude, three predictions.</div></div><ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"magneedle\"></span><span>each needle lies along the local field; its red end is the north-seeking one</span></li> <li><span class=\"sw\" data-sw=\"magviolet\"></span><span>the violet needle is yours — move the λ slider</span></li> <li><span class=\"sw\" data-sw=\"magequator\"></span><span>red dashed: the magnetic equator</span></li> <li><span class=\"sw\" data-sw=\"magaxis\"></span><span>grey dashed: the spin axis, which the magnetic axis misses by about 10°</span></li> </ul><p class=\"notes\">That 10° offset is why a compass needs a declination correction at all, and why the correction is different in every place and drifts from decade to decade.</p></div>",
  "k": "x:03e00429"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\tan I = 2\\cdot\\tan\\lambda",
    "fallback": "tan I = 2·tan λ"
   },
   {
    "tex": "B = B_0\\sqrt{1 + 3\\sin^2\\lambda}",
    "fallback": "B = B₀·√(1 + 3·sin²λ)"
   },
   {
    "tex": "\\g{B_0 \\approx 30\\ \\text{μT}}",
    "fallback": "<b>B₀ ≈ 30 μT</b>"
   }
  ],
  "fig": "magfig0",
  "gloss": "The centred-dipole field of a sphere. I = inclination (dip, + downward), λ = magnetic latitude. Two clean consequences: the dip <b>changes sign</b> at the magnetic equator, and the total field at the poles is exactly <b>twice</b> the equatorial value — 30 → 60 μT, never more, never less. Real Earth adds an ~10° tilt of the magnetic axis and non-dipole wrinkles of ±20% or so; neither ever flips the hemisphere pattern.",
  "k": "x:13b29739"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "magRows",
  "caption": "What each model predicts for <b>your</b> compass at the slider's latitude / map position",
  "head": [
   "Model",
   "Dip I",
   "Horizontal pull H",
   "Total field B",
   "North end points…"
  ],
  "k": "x:68c2cc7f"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "magNote",
  "html": "<p class=\"rate-note\" id=\"magNote\"></p>"
 },
 {
  "t": "h2",
  "html": "The dip profile: one curve, ten cities, no free parameters left",
  "k": "28e313cb"
 },
 {
  "t": "notes",
  "html": "Both flat layouts have been tuned <em>in their own favour</em>, each with the one adjustable quantity it has. The magnet depth (①) is chosen so that its dip-zero circle lands exactly on the observed magnetic equator, ~10,000 km from the pole. Layout ② cannot do that. Its rim ring must be exactly as strong as its centre pole: the two poles of a magnet are always equal, because field lines have no ends (∇·B = 0).<sup class=\"ref\"><a href=\"#s5-r16\">[16]</a></sup> Such a layout is a real magnet, not a fiction: a thin disc buried under the plane and magnetised radially outward, with a strength falling as 1/r, carries exactly these two poles, one at its centre and one along its edge.<sup class=\"ref\"><a href=\"#s5-r17\">[17]</a></sup> Its field lines leave the edge, arc over the surface, plunge into the centre and run back to the edge inside the disc, so none of them ends. With equal poles, no burial depth brings the dip-zero circle closer than ~13,200 km from the pole, so its depth (~4,100 km) is fitted instead to the ten measured dips below. An earlier version of this tab let the ring be four times stronger than the centre pole, which put the circle at 10,000 km but left the disc with a net magnetic charge that physics forbids; a physicist pointed it out, and it is corrected here. Both layouts are normalised to 30 μT at 10,000 km. Everything else on the curve is now a forced prediction.",
  "k": "58f0800a"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:16px 0\"> <canvas id=\"magProfile\" style=\"height:300px;cursor:default\"></canvas> <div class=\"fcap\"><b>Inclination vs distance from the north magnetic pole.</b> Teal band: the globe dipole — the width is the ±10° axis tilt, mapped through tan I = 2 tan λ; a few extra degrees of non-dipole scatter are expected and stated below. Amber: flat ① (solid) and flat ② (dashed), after tuning. Dots: measured values. The measured points ride the teal band all the way to −90° and never come near either amber curve south of the magnetic equator.</div> </div>",
  "k": "mag-m2"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "magCityIRows",
  "caption": "Dip angle I, measured (IGRF, rounded) vs each model's forced prediction",
  "head": [
   "Place",
   "λ (magnetic)",
   "Measured I",
   "Globe",
   "Flat ①",
   "Flat ②"
  ],
  "k": "x:03e00429~2"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "magCityBRows",
  "caption": "Total field strength |B| in μT — a smartphone can read this column",
  "head": [
   "Place",
   "Measured B",
   "Globe",
   "Flat ①",
   "Flat ②"
  ],
  "k": "x:03e00429~3"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "magCityNote",
  "html": "<p class=\"rate-note\" id=\"magCityNote\"></p>"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>Where both flat layouts break, in plain words.</b> <b>①</b> A magnet under the centre does produce a dip-zero circle — but beyond it the field dies as 1/r³ and the dip goes <em>shallow</em>, not steep: at Melbourne's position the needle should pull ~5× weaker than it measurably does and dip only −19° instead of the measured −69°, and no point on the entire disc can dip past −35° — yet Dunedin measures −72° and one Antarctic point −90°.",
  "k": "7b60bdc2"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>② The rim-ring version, and what it trades.</b> Feeding the field back in through a rim ring only trades failures. Its dip-zero circle falls ~13,600 km from the pole, 3,600 km beyond the real magnetic equator, so Singapore and São Paulo get a needle pointing <em>down</em> (+13°, +9°) where it measurably points up (−16°, −40°) — a wrong sign, not a wrong size. The far south stays nearly level (Cape Town −1°, Melbourne −9°, against measured −66° and −69°), no point on the disc dips past −69°, and the centre pole makes the Arctic read about 190 μT where instruments find 57.",
  "k": "mg-call1c"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>And where the one real pole is.</b> Measurement instead finds exactly <b>one</b> point with I = −90°, off the coast of Adélie Land, Antarctica — claimed overland by David, Mawson and Mackay in 1909 — modern reassessment puts their flag within ~130 km of the wandering pole — and pinned down repeatedly since, most precisely by Barton in 2000, within ~2 km. A point is not a ring, and a working Australian compass is not a spinning one.",
  "k": "mg-call1b"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>A limit this page does not hold against either flat layout.</b> Both draw the field from a permanent magnet buried thousands of kilometres down: ① at about 7,100 km, ② at about 4,100 km. Real rock cannot stay magnetised that deep. Magnetite, the main magnetic mineral of the crust, loses its magnetisation above 580 °C, its Curie temperature, and the rock reaches that temperature on average about 20 km down under the oceans and 20 to 35 km under the continents; deeper rock carries no permanent magnetisation at all.<sup class=\"ref\"><a href=\"#s5-r18\">[18]</a></sup> A flat Earth has no stated interior, so both layouts are given the benefit of the doubt and scored on their field alone. But the magnet they need is one no known material can be at that depth.",
  "k": "mg-curie"
 },
 {
  "t": "fold",
  "q": true,
  "k": "mg-dynamo",
  "summary": "<b class=\"faq-q\">So how does the Earth have a magnetic field, if its core is molten?</b>",
  "html": "<p class=\"cnav-lead\">Because it is molten. Below 2,890 km the Earth's core is liquid, mostly iron: shear waves from earthquakes do not cross it.<sup class=\"ref\"><a href=\"#s5-r19\">[19]</a></sup> (The <a href=\"#tab-seis\" data-xref=\"seis\">seismology tab</a> shows how that was found.) At its base, where it freezes onto the solid inner core, it is close to 6,000 °C,<sup class=\"ref\"><a href=\"#s5-r20\">[20]</a></sup> about ten times the Curie temperature of magnetite.<sup class=\"ref\"><a href=\"#s5-r18\">[18]</a></sup> It is not a magnet; what it is, is a conductor in motion. The liquid iron moves slowly, and electric currents flowing in it generate the magnetic field, which in turn keeps the currents going: a self-sustaining dynamo.<sup class=\"ref\"><a href=\"#s5-r21\">[21]</a></sup> This is the other source of magnetic field that Maxwell's equations allow, currents rather than magnetised matter (∇×B = μ₀J), the same source as in an electromagnet.<sup class=\"ref\"><a href=\"#s5-r16\">[16]</a></sup> Computer simulations that solve the equations of this dynamo for a rotating, convecting core produce a field dominated by a dipole, as the Earth's is, which maintains itself for tens of thousands of years and then reverses.<sup class=\"ref\"><a href=\"#s5-r22\">[22]</a></sup> The real field has reversed many times: the lavas of the ocean floor froze its direction in, in stripes of alternating polarity on both sides of the mid-ocean ridges.<sup class=\"ref\"><a href=\"#s5-r23\">[23]</a></sup> And the process has been run in the laboratory: around the turn of 2000, in Riga and in Karlsruhe, liquid sodium driven through a vessel generated a magnetic field of its own.<sup class=\"ref\"><a href=\"#s5-r24\">[24]</a></sup></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig mag-f3d",
  "id": "",
  "html": "<div class=\"fig mag-f3d\"><div class=\"mag-trio mag-f3d-grid\"><div><div class=\"mag-h\" id=\"magF3dHG\"></div><canvas id=\"magF3dG\"></canvas></div><div><div class=\"mag-h\" id=\"magF3dHF1\"></div><canvas id=\"magF3dF1\"></canvas></div><div><div class=\"mag-h\" id=\"magF3dHF2\"></div><canvas id=\"magF3dF2\"></canvas></div></div><div class=\"fcap\" id=\"magF3dCap\"></div></div>"
 },
 {
  "t": "h2",
  "k": "mg-obs-h",
  "html": "<span data-obsv=\"n\"></span> measured sites: the dip against every model"
 },
 {
  "t": "lead",
  "k": "mg-obs-p1",
  "html": "The ten cities above carry rounded model values. Here are measurements instead, from two kinds of site. Magnetic observatories record the field around the clock and tie their instruments, week after week, to absolute measurements made by hand with a non-magnetic theodolite;<sup class=\"ref\"><a href=\"#s5-r7\">[7]</a></sup> <span data-obsv=\"src.obs.n\"></span> of them published a usable annual mean between <span data-obsv=\"src.obs.from\"></span> and <span data-obsv=\"src.obs.to\"></span>.<sup class=\"ref\"><a href=\"#s5-r12\">[12]</a></sup> Repeat stations are marked points — a pillar, a buried marker — that national survey institutes revisit every few years with the same kind of instrument to keep their magnetic charts up to date; <span data-obsv=\"src.survey.n\"></span> repeat and one-off survey stations were measured between <span data-obsv=\"src.survey.from\"></span> and <span data-obsv=\"src.survey.to\"></span>.<sup class=\"ref\"><a href=\"#s5-r15\">[15]</a></sup> Both come from the World Data Centre for Geomagnetism in Edinburgh. Each site counts once, with its latest measurement: <span data-obsv=\"n\"></span> sites, from magnetic latitude <span data-obsv=\"mlatMax\"></span>° to <span data-obsv=\"mlatMin\"></span>°, <span data-obsv=\"southM\"></span> of them south of the magnetic equator. For every site the <em>residual</em> is the measured I minus the I a model predicts there, with the magnetic axis taken at the year of that measurement. Six models are scored. Two are the globe, both taken as published, nothing adjusted here: the centred dipole of the reference field model, and the off-centre dipole computed from the same model's coefficients by the classical method.<sup class=\"ref\"><a href=\"#s5-r13\">[13]</a></sup><sup class=\"ref\"><a href=\"#s5-r14\">[14]</a></sup> Four are the flat disc: the two layouts exactly as calibrated above, and the same two with their free parameter fitted to these measurements — magnet depth for ①, burial depth for ② — the best a flat disc of either kind can do on this data. Only the flat layouts are fitted, and on the inclinations only."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "mg-obs-call0",
  "html": "<b>What would vindicate the flat disc here.</b> A flat box centred on zero and as narrow as the globe's, with the same median north and south of the magnetic equator. Or, the other way round, a centred-dipole box that sits well off zero, or whose residuals climb steadily from one pole to the other. Either result would count against the sphere; neither needs a large sample to show."
 },
 {
  "t": "notes",
  "k": "mg-obs-meth",
  "html": "<b>The method, to redo it from the table at the bottom of this section.</b> For each site, its magnetic latitude λ<sub>m</sub> is computed from the IGRF dipole pole of the year of the measurement; each model then predicts a dip, and the residual is the measured dip minus that prediction.<sup class=\"ref\"><a href=\"#s5-r13\">[13]</a></sup> On the flat disc the site stands at the distance r its magnetic latitude would have on the globe, a choice that favours the flat model."
 },
 {
  "t": "formula",
  "k": "mg-fx-meth",
  "fig": "magFxMethod",
  "lines": [
   {
    "tex": "\\sin\\lambda_m = \\sin\\varphi\\sin\\varphi_B + \\cos\\varphi\\cos\\varphi_B\\cos(\\lambda - \\lambda_B)",
    "fallback": "sin λm = sin φ sin φB + cos φ cos φB cos(λ − λB)"
   },
   {
    "tex": "\\text{globe: } \\tan I = 2\\tan\\lambda_m \\qquad \\text{flat ①: } \\tan I = \\frac{2D^2 - r^2}{3rD},\\ r = R\\left(\\frac{\\pi}{2} - \\lambda_m\\right)",
    "fallback": "globe: tan I = 2 tan λm   flat ①: tan I = (2D² − r²)/3rD, r = R(π/2 − λm)"
   },
   {
    "tex": "\\text{flat ②: } B = \\sum_q q\\,\\frac{x - x_q}{|x - x_q|^3},\\quad \\Delta I = I_{\\text{measured}} - I_{\\text{model}}",
    "fallback": "flat ②: B = Σ q (x − x_q)/|x − x_q|³,  ΔI = I_measured − I_model"
   }
  ],
  "gloss": "φ, λ: the site's geocentric latitude and longitude · φ<sub>B</sub>, λ<sub>B</sub>: the geomagnetic north pole of the IGRF that year, from its first three coefficients · I: dip, positive downward · D: depth of the flat model's magnet under the centre · flat ②: a pole of strength −1 under the centre and +1 spread along the rim, both at the fitted depth · the off-centre dipole is the same dipole shifted by the published offset"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "mag-obs-filter",
  "id": "",
  "k": "mg-obs-sel",
  "html": "<div class=\"mag-obs-filter\"><label for=\"magObsSrc\">Figures and tables below show:</label> <select id=\"magObsSrc\"></select></div>"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "magObsRead",
  "html": "<p class=\"reads\" id=\"magObsRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "mg-obs-fig1",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"magObsBox\"></div> <div class=\"fcap\"><b>Six box plots, one per model.</b> Same convention as the seismology and surveying tabs — box between the quartiles, bar at the median, whiskers to 1.5 interquartile ranges, dots past them. The vertical line is a perfect prediction. The centred dipole's box straddles it with nothing tuned; the published off-centre dipole's sits a few degrees to its right; the calibrated flat boxes sit tens of degrees off; fitting the flat parameters to the answers pulls their medians in, but their boxes stay several times wider than the globe's. The figures and tables follow the selector above.</div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "magObsRows",
  "caption": "The same six boxes as numbers — median residual, quartiles, share of sites within ±5°, and the median north / south of the magnetic equator",
  "head": [
   "Model",
   "What was fitted",
   "Median",
   "Quartiles",
   "Within ±5°",
   "North / south"
  ],
  "k": "x:68c2cc7f~2"
 },
 {
  "t": "lead",
  "k": "mg-obs-p2",
  "html": "A box plot pools every site together; the telling part is <em>where</em> each model misses. Plotting the residual against magnetic latitude separates the two kinds of error: scatter that comes and goes from region to region, and a trend that one geometry cannot escape."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "mg-obs-fig2",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"magObsLat\"></div> <div class=\"fcap\"><b>Residual against magnetic latitude, one dot per site.</b> Above, the centred dipole; below, flat disc ② with its burial depth fitted. The black line joins the medians of 15° bands. The globe's line hugs zero from pole to pole, with a scatter of a few degrees and a handful of large misses gathered in one region. The flat line sits above zero across the north and below it across the south: the fitted disc reads too shallow in <em>both</em> hemispheres, and no burial depth fixes one side without breaking the other.</div> </div>"
 },
 {
  "t": "callout",
  "flat": false,
  "k": "mg-obs-call1",
  "html": "<b>The globe's misses are real, and they are left in.</b> Its worst residuals — <span data-obsv=\"worst\"></span> — all lie around the South Atlantic, under the South Atlantic weak patch, the largest departure of Earth's field from a pure dipole.<sup class=\"ref\"><a href=\"#s5-r6\">[6]</a></sup> A centred dipole is only the first term of the real field. The published off-centre dipole — about 590 km from the centre towards 23° N 137° E in 2020, computed from the reference model's coefficients<sup class=\"ref\"><a href=\"#s5-r13\">[13]</a></sup><sup class=\"ref\"><a href=\"#s5-r14\">[14]</a></sup> — does not remove those misses, and on inclination it scores below the centred dipole: median <span data-obsv=\"eMed\"></span>°, <span data-obsv=\"eW5\"></span> % of sites within ±5°, against <span data-obsv=\"gMed\"></span>° and <span data-obsv=\"gW5\"></span> %. It is shown as published, not tuned. The full IGRF model, with its 195 coefficients, is fitted to data that include these same sites, so it is not used here as a test. Even with those misses, the scale-free law of this tab holds on the raw measurements: over the <span data-obsv=\"ratioN\"></span> sites more than 10° from the magnetic equator, the median of tan I ÷ tan λm is <b><span data-obsv=\"ratio\"></span></b> (quartiles <span data-obsv=\"ratioQ1\"></span>–<span data-obsv=\"ratioQ3\"></span>), against the 2 a dipole in a sphere predicts."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "mg-obs-call2",
  "html": "<b>Why fitting does not save the flat disc.</b> The fitted layout ② buries its central pole about <span data-obsv=\"f2d\"></span> km under a disc 20,000 km in radius, and still misses by a median <span data-obsv=\"fN\"></span>° north of the magnetic equator and <span data-obsv=\"fS\"></span>° south of it — too shallow on both sides. The least-squares fit weights the north more because the north has more sites (<span data-obsv=\"north\"></span> against <span data-obsv=\"southM\"></span>); weighting the two hemispheres equally only moves the miss around — <span data-obsv=\"fbN\"></span>° north, <span data-obsv=\"fbS\"></span>° south. Layout ① fitted (magnet <span data-obsv=\"f1d\"></span> km deep instead of 7,100) gains little. The flat disc has one centre and one rim; a sphere has two poles, and the measured dip steepens toward both."
 },
 {
  "t": "h2",
  "k": "mg-obs-hF",
  "html": "Field strength: the same sites, the same verdict"
 },
 {
  "t": "lead",
  "k": "mg-obs-pF",
  "html": "The same measurements also give the total field strength F at <span data-obsv=\"nWithF\"></span> of the <span data-obsv=\"n\"></span> sites. The flat layouts were fitted on the inclinations only, so F is a check none of them has seen; each also gets a free overall scale factor, since a flat disc has no published field strength. The globe gets nothing: its field strength is the one published with the reference model's dipole term, 29.8 μT at the magnetic equator.<sup class=\"ref\"><a href=\"#s5-r13\">[13]</a></sup> The residual is the measured F divided by the predicted F, minus one."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "mg-obs-callF0",
  "html": "<b>What would vindicate the flat disc here.</b> A flat box narrower than every globe box. That result would stand on its own, whatever the inclinations say."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "mg-obs-figF",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"magObsBoxF\"></div> <div class=\"fcap\"><b>Six box plots of the field-strength residual, same convention.</b> Residuals past +100 % are counted at the right edge. The calibrated flat layouts miss by tens of percent to several times over. The fitted flat ②, even with a scale factor of its own, stays far wider than the globe's dipoles, whichever sites are selected above.</div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "magObsRowsF",
  "caption": "The field-strength boxes as numbers — quartiles, share of sites within ±10 %, and the full range",
  "head": [
   "Model",
   "What was fitted",
   "Quartiles",
   "Within ±10 %",
   "Range"
  ],
  "k": "x:68c2cc7f~3"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "mg-obs-callF",
  "html": "<b>Said plainly: on field strength too, both globe dipoles do better.</b> Over all <span data-obsv=\"n\"></span> sites, the centred dipole puts <span data-obsv=\"gFw10\"></span> % of them within ±10 %, the published off-centre dipole <span data-obsv=\"eFw10\"></span> %, the fitted flat disc <span data-obsv=\"fFw10\"></span> %. On the <span data-obsv=\"src.obs.n\"></span> observatories alone: <span data-obsv=\"obs.gFw10\"></span> %, <span data-obsv=\"obs.eFw10\"></span> % and <span data-obsv=\"obs.fFw10\"></span> %. The published off-centre dipole's box is also narrower than the flat one (<span data-obsv=\"eFiqr\"></span> points against <span data-obsv=\"fFiqr\"></span> over all sites, <span data-obsv=\"obs.eFiqr\"></span> against <span data-obsv=\"obs.fFiqr\"></span> for the observatories). The globe's own misses are real: a dipole describes the field's strength poorly — the real field is markedly stronger than a centred dipole predicts over Asia and Australia, and weaker around the South Atlantic, where it is weakest on Earth<sup class=\"ref\"><a href=\"#s5-r6\">[6]</a></sup>. An earlier version of this tab found the fitted flat disc <em>first</em> on the observatories alone. It owed that to the strength of its rim ring, a free parameter that left the disc with a net magnetic charge (see the calibration above); with the ring as strong as the centre pole and no stronger, that lead is gone. Field strength needs a scale and is the weaker test of the two; the inclination, which needs none, is the one this tab rests on."
 },
 {
  "t": "notes",
  "k": "mg-obs-lim",
  "html": "Limits of this test, and how the sites were chosen. Observatories: of the <span data-obsv=\"src.obs.listed\"></span> in the World Data Centre list, <span data-obsv=\"src.obs.no_mean_in_window\"></span> have no annual mean in the period, <span data-obsv=\"src.obs.unusable\"></span> have only preliminary or incomplete years or field strength alone, <span data-obsv=\"src.obs.fetch_failed\"></span> did not answer when the data were collected, and <span data-obsv=\"src.obs.merged_same_site\"></span> are the same site under another code. Each keeps its latest mean based on all days, on quiet days, or on hand measurements only (codes 1, 2 and 4). Survey stations: of <span data-obsv=\"src.survey.records\"></span> measurements, <span data-obsv=\"src.survey.without_I\"></span> have no inclination; the rest include revisits, and each site — its position to about a kilometre — keeps its latest. The sites lean north (<span data-obsv=\"north\"></span> against <span data-obsv=\"southM\"></span>) and toward Europe, because that is where the instruments are. Everything on the globe side comes from published coefficients (IGRF-14)<sup class=\"ref\"><a href=\"#s5-r13\">[13]</a></sup> and nothing there is fitted here; only the flat side is. Magnetic latitude λm is measured from the IGRF dipole axis<sup class=\"ref\"><a href=\"#s5-r1\">[1]</a></sup> at the year of each measurement — coefficients fitted by the model's authors to worldwide data that include these sites; the flat models are placed on the same axis, so it helps them as much as the globe. Their distance from the pole is the globe's great-circle distance, not the distance on any particular flat map — again a choice that favours the flat models. The list below, and the file it offers, give every row and every model's prediction."
 },
 {
  "t": "raw",
  "tag": "details",
  "class": "fold mag-obs-all",
  "id": "",
  "k": "mg-obs-all",
  "html": "<details class=\"fold mag-obs-all\"><summary><b>All <span data-obsv=\"n\"></span> sites</b><span class=\"fold-teaser\">Source, code, year and kind of measurement (observatories: 1 all days, 2 quiet days, 4 hand measurements only; R repeat station, O one-off station), magnetic latitude, measured I and F, and what three of the models predict — sorted north to south. The list follows the selector above.</span></summary><p class=\"mag-obs-dl\"><a id=\"magObsCsv\" href=\"#\">Download every site and every model's prediction (CSV)</a></p><div class=\"mag-obs-scroll\"><table class=\"cnav-table\"><thead><tr><th>Source</th><th>Code</th><th>Site</th><th>Year</th><th>Kind</th><th>λm</th><th>Measured I</th><th>Measured F (μT)</th><th>Globe</th><th>Globe off-centre (IGRF)</th><th>Flat ② refitted</th></tr></thead><tbody id=\"magObsAll\"></tbody></table></div></details>"
 },
 {
  "t": "h2",
  "html": "Why the needle aligns — and how the dip is actually read",
  "k": "35feff0c"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"\\tau = \\mathbf{m}\\times\\mathbf{B}\">τ = m × B</span> &nbsp;⇒&nbsp; needle rests along <b>B</b>"
   },
   {
    "tex": null,
    "fallback": "hiking compass reads only <span class=\"tex\" data-tex=\"\\g{H = B\\cos I}\"><b>H = B·cos I</b></span>"
   }
  ],
  "fig": "magfig1",
  "gloss": "A needle with magnetic moment m feels a torque m×B that is zero only when it lies along the field, north-seeking end pointing the way B points. A baseplate compass pivots about a <em>vertical</em> axis only, so it can respond to nothing but the horizontal component H — the dip is still there, expressed as the needle's urge to drag its nose down. That is why manufacturers balance needles differently per hemisphere (counterweighting the south end in the north, and vice versa) and why \"global needle\" compasses exist at all: an engineering industry quietly built around the very tilt the flat models cannot produce.",
  "k": "x:d64af24f"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\">\n      <div class=\"fig\" id=\"magDipCircleFig\">\n        <svg viewBox=\"0 0 340 268\" role=\"img\" aria-label=\"Dip circle diagram\">\n          <rect x=\"130\" y=\"238\" width=\"80\" height=\"12\" rx=\"3\" fill=\"#fff\" stroke=\"#b7b1a2\"/>\n          <circle cx=\"170\" cy=\"244\" r=\"3.5\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.5\"/>\n          <circle cx=\"170\" cy=\"244\" r=\"1.4\" fill=\"#0f766e\"/>\n          <line x1=\"170\" y1=\"238\" x2=\"170\" y2=\"206\" stroke=\"#b7b1a2\" stroke-width=\"3\"/>\n          <circle cx=\"170\" cy=\"120\" r=\"86\" fill=\"#fff\" stroke=\"#151a21\" stroke-width=\"1.6\"/>\n          <g stroke=\"#151a21\" stroke-width=\"1\">\n            <line x1=\"84\" y1=\"120\" x2=\"256\" y2=\"120\" stroke-dasharray=\"4 4\" stroke-width=\"1.1\"/>\n            <line x1=\"170\" y1=\"34\" x2=\"170\" y2=\"206\" stroke-dasharray=\"2 5\" stroke-width=\".8\" opacity=\".6\"/>\n          </g>\n          <g font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\">\n            <text x=\"94\" y=\"116\">0°</text><text x=\"246\" y=\"116\">0°</text>\n            <text x=\"170\" y=\"216\">90°</text><text x=\"170\" y=\"46\">90°</text>\n            <text data-tex=\"I\" x=\"232\" y=\"176\">I</text>\n          </g>\n          <g stroke=\"#5b6470\" stroke-width=\"1\">\n            <line x1=\"256\" y1=\"120\" x2=\"248\" y2=\"120\"/><line x1=\"84\" y1=\"120\" x2=\"92\" y2=\"120\"/>\n            <line x1=\"170\" y1=\"206\" x2=\"170\" y2=\"198\"/><line x1=\"170\" y1=\"34\" x2=\"170\" y2=\"42\"/>\n            <line x1=\"244.5\" y1=\"163\" x2=\"237.5\" y2=\"159\"/><line x1=\"244.5\" y1=\"77\" x2=\"237.5\" y2=\"81\"/>\n            <line x1=\"213\" y1=\"194.5\" x2=\"209\" y2=\"187.5\"/><line x1=\"213\" y1=\"45.5\" x2=\"209\" y2=\"52.5\"/>\n            <line x1=\"95.5\" y1=\"163\" x2=\"102.5\" y2=\"159\"/><line x1=\"95.5\" y1=\"77\" x2=\"102.5\" y2=\"81\"/>\n            <line x1=\"127\" y1=\"194.5\" x2=\"131\" y2=\"187.5\"/><line x1=\"127\" y1=\"45.5\" x2=\"131\" y2=\"52.5\"/>\n          </g>\n          <path d=\"M 204 120 A 34 34 0 0 1 185 150\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.4\"/>\n          <line x1=\"170\" y1=\"120\" x2=\"205\" y2=\"192\" stroke=\"#b91c1c\" stroke-width=\"3.4\" stroke-linecap=\"round\"/>\n          <line x1=\"170\" y1=\"120\" x2=\"135\" y2=\"48\" stroke=\"#151a21\" stroke-width=\"3.4\" stroke-linecap=\"round\"/>\n          <circle cx=\"170\" cy=\"120\" r=\"4.6\" fill=\"#fff\" stroke=\"#151a21\" stroke-width=\"1.6\"/>\n          <text data-tex=\"\\text{N end, }I = +64\\deg\" x=\"216\" y=\"206\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b91c1c\">N end, I = +64°</text>\n          <text x=\"60\" y=\"252\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\">bubble level</text>\n        </svg>\n        <div class=\"fcap\"><b>A dip circle</b> (Robert Norman's instrument, 1581): a needle balanced on a\n          <em>horizontal</em> axle at the centre of a vertical graduated circle, the whole thing free to turn about a\n          vertical stand. Shown reading I = +64° — roughly Paris.</div>\n      </div>\n      <div class=\"fig\">\n        <div style=\"font-size:13.5px;line-height:1.6;padding:4px 6px\">\n          <b>Reading it properly (the null trick):</b>\n          <ol style=\"margin:8px 0 10px 18px;padding:0\">\n            <li style=\"margin:6px 0\"><b>Level</b> the base with the bubble — everything is referenced to true horizontal.</li>\n            <li style=\"margin:6px 0\"><b>Turn about the vertical axis until the needle stands exactly vertical.</b> In that\n              orientation the needle's plane is <em>perpendicular</em> to the magnetic meridian: only the vertical part\n              of B can act on it. No reading is taken — this is a null alignment, insensitive to scale errors.</li>\n            <li style=\"margin:6px 0\"><b>Rotate exactly 90°.</b> The circle now lies <em>in</em> the magnetic meridian; the\n              needle swings freely under the full field and settles along B. Read I off the circle.</li>\n            <li style=\"margin:6px 0\"><b>Cancel instrument error:</b> read both needle ends, reverse the circle face\n              east↔west, re-magnetise the needle reversed, and average — the classical four-fold reversal that removes\n              pivot friction and balance bias.</li>\n          </ol>\n          Before that instrument, dip was a nuisance: compass makers were already gluing tiny counterweights to needles\n          in the 1500s to keep them level. Norman asked <em>why</em> the needle wanted to tilt — and measured it.\n        </div>\n      </div>\n    </div>",
  "k": "x:f645fc9f"
 },
 {
  "t": "fold",
  "q": false,
  "k": "mag-fold1",
  "summary": "<b>The tabletop version: Gilbert’s terrella, 1600</b><span class=\"fold-teaser\">A lodestone machined into a small sphere reproduced the whole dip-against-latitude pattern — and you can repeat it tonight with a sphere magnet and a button compass, then try to match it with any magnet under a flat plate</span>",
  "html": "<div class=\"callout\">William Gilbert machined a lodestone into a small sphere — a <em>terrella</em>, \"little Earth\" — and walked a short compass needle across its surface. The needle stood upright at two opposite points, lay flat along the mid-circle between them, and tilted by the dipole rule everywhere else: the exact dip-vs-latitude pattern navigators were reporting. His conclusion opens the modern subject: <em>the Earth itself is a great magnet</em>. You can repeat this tonight with a sphere magnet and a cheap button compass — then try to reproduce the same needle behaviour with any magnet arrangement under a flat plate. The sphere takes one magnet; the plate has no arrangement that works, because the failure is in the shape, not the magnet.</div>"
 },
 {
  "away": "xp-mag-5",
  "t": "exp",
  "h": "Experiment 5 · the field in your pocket",
  "title": "Read inclination and field strength wherever you are — the sensor is already in your phone",
  "lead": "Every smartphone carries a 3-axis magnetometer. A free sensor app reports the total field |B| in μT directly; add a level surface (or the phone's accelerometer, which sensor apps use automatically) and it reports the inclination I too. A ~15€ dip needle, or a magnetised sewing needle floated on a cork disc and then re-balanced on a horizontal pin, does the same with no electronics.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> your <b>position</b> — magnetic latitude λ, or on the flat map, distance r from the centre. Travel, or recruit friends and relatives by latitude; the further apart, the sharper the test. Set it with the λ slider above.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> two numbers per location — the <b>dip I</b> (sign included!) and the <b>total field |B| in μT</b>. The world decides both.",
  "meta": [],
  "inputs": [],
  "out": "exp5out",
  "verdict": "exp5v",
  "k": "x:20a66af7"
 },
 {
  "t": "fold",
  "q": true,
  "k": "mg-x1",
  "summary": "<b class=\"faq-q\">The escape hatches, pre-empted.</b>",
  "html": "<p class=\"cnav-lead\">Crustal rocks bend the local field (ore bodies, volcanic terrain) and the whole pattern drifts by ~0.1°/yr — both real, both mapped, and both small: a few degrees and ±20% in |B|, the largest being the South Atlantic weak patch (São Paulo's low 23 μT above). None of it ever flips the sign of I across a hemisphere, moves the dip-zero line to a different circle, or makes a compass fail in Patagonia. Corrections shrink residuals; they never rescue a wrong shape. <span class=\"k\">One honest subtlety.</span> The table's λ is <em>dipole-frame</em> magnetic latitude (approximate), not geographic latitude — the axis tilt makes them differ by up to ~10°. Also, the point where a dip needle reads exactly ±90° (the dip pole) sits a few degrees from the ideal dipole axis because of the non-dipole part; that is why the South-magnetic-pole row shows the dipole predicting −81° where the measured value is by definition −90°. A 9° residual against a 60–90° signal, with the correct sign everywhere, versus flat errors of 30–70° with impossible geometry — that is the comparison. <span class=\"k\">The through-line.</span> The other four tabs share one radius R. This tab needs no radius at all: tan I = 2 tan λ and the pole/equator factor of exactly 2 are properties of a dipole centred in a <em>sphere</em>, whatever its size. The compass tests the shape alone — and it is the oldest instrument on this page, telling the same story since sailors first noticed their needles leaning in the 1500s.</p>"
 },
 {
  "t": "xrefs",
  "keys": [
   "grav",
   "gps",
   "cnav",
   "azim"
  ],
  "wide": false
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "srcs reading",
  "id": "",
  "html": "<div class=\"srcs reading\"><b class=\"h\">Sources and further reading for this tab</b> <div class=\"note\">The observatory section, the calibration of the flat layouts and the origin of the Earth’s field carry inline [n] markers: the rest are the works this tab was built from, listed in full rather than pinned to individual sentences.</div> <ol> <li id=\"s5-r1\"><a href=\"https://www.ncei.noaa.gov/products/international-geomagnetic-reference-field\">NOAA NCEI — International Geomagnetic Reference Field (IGRF)</a> — the standard model behind the \"measured\" columns; <a href=\"https://www.ngdc.noaa.gov/geomag/models.shtml\">NOAA's geomagnetic models &amp; calculators</a> let you compute I and |B| for your own coordinates and check every number in the tables.</li> <li id=\"s5-r2\"><a href=\"https://geomag.bgs.ac.uk/education/poles.html\">British Geological Survey — Magnetic Poles</a> — dip poles vs geomagnetic (dipole) poles, why they differ and move, and the dipole axis tilt of about 10°; the BGS <a href=\"https://geomag.bgs.ac.uk/education/home.html\">education pages</a> also cover smartphone magnetometers, the sensor Experiment 5 relies on.</li> <li id=\"s5-r3\"><a href=\"https://www.suunto.com/en-us/Support/Compasses-feature-index/Understanding-balancing-zones/\">Suunto — Understanding balancing zones</a> — the manufacturer's own explanation of hemisphere-balanced needles and the global needle: the compass industry engineering built around the dip.</li> <li id=\"s5-r4\"><a href=\"https://www.gutenberg.org/ebooks/33810\">William Gilbert, <em>De Magnete</em> (1600), full English translation at Project Gutenberg</a> — the terrella experiments and the conclusion that the Earth itself is a great magnet.</li> <li id=\"s5-r5\"><a href=\"https://www.antarctica.gov.au/magazine/issue-22-2012/science/a-timeline-of-scientific-highlights/\">Australian Antarctic Program</a> and <a href=\"https://recollections.nma.gov.au/issues/vol_6_no_1/exhibition_reviews/quest_for_the_south_magnetic_pole\">National Museum of Australia</a> — the 1909 David–Mawson–Mackay journey toward the South Magnetic Pole, the modern reassessment of how close they came, and Barton's 2000 fix within ~2 km of the drifting pole.</li> <li id=\"s5-r6\"><a href=\"https://www.esa.int/Applications/Observing_the_Earth/FutureEO/Swarm/Swarm_reveals_growing_weak_spot_in_Earth_s_magnetic_field\">ESA Swarm</a> and <a href=\"https://svs.gsfc.nasa.gov/4840/\">NASA SVS</a> — the South Atlantic weak patch: the largest non-dipole anomaly, flagged with * in the tables above.</li> <li id=\"s5-r7\"><a href=\"https://intermagnet.org/\">INTERMAGNET</a>, with data served through the <a href=\"https://imag-data.bgs.ac.uk/\">BGS data portal</a>. Around 150 magnetic observatories worldwide, publishing definitive one-minute and one-second data, free to download. <b>This is the check this tab most needs and has been missing.</b> Everything in the tables above is read off a model; here are the measurements the models are fitted to. Take the observatories' latitudes, take their inclinations, plot one against the other, and see whether tan I = 2 tan λ falls out of data that nobody assembled to make this argument.</li> <li id=\"s5-r8\"><a href=\"https://www.ncei.noaa.gov/products/world-magnetic-model\">NOAA NCEI / BGS — World Magnetic Model</a>. The operational model rather than the research one: the WMM is what runs in the compass app on your phone and in aviation and defence navigation systems, and it is rebuilt every five years because the field moves. A model that had the shape of the Earth wrong would be noticed by its users within weeks.</li> <li id=\"s5-r9\"><b>Robert Norman, <em>The Newe Attractive</em> (London, 1581).</b> The discovery of magnetic dip, by a London compass-maker who found that a needle he had balanced perfectly before magnetising it would afterwards tip downward, and had to trim it to make it lie level again. Nineteen years before Gilbert, and the more concrete of the two: it starts from a workshop annoyance.</li> <li id=\"s5-r10\"><b>Edmond Halley, <em>A New and Correct Chart Shewing the Variations of the Compass</em> (1701).</b> The first isogonic chart, drawn from measurements Halley made himself on two Atlantic voyages. The field's structure has been mapped continuously for over three centuries.</li> <li id=\"s5-r11\"><a href=\"https://vires.services/\">ESA — VirES for Swarm</a>. Interactive access to the Swarm satellite magnetic measurements. The same verification as INTERMAGNET, from orbit instead of the ground, and again free.</li> <li id=\"s5-r12\"><a href=\"https://geomag.bgs.ac.uk/data_service/data/annual_means.shtml\">BGS World Data Centre for Geomagnetism (Edinburgh) — Worldwide Observatory Annual Means</a>. Annual mean D, H, I, Z and F for some 600 observatories, as supplied by their operators; the observatory section uses each observatory's latest all-days, quiet-days or absolute-observations-only mean from 2015–2025.</li> <li id=\"s5-r13\"><a href=\"https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/igrf14coeffs.txt\">IAGA Working Group V-MOD — IGRF-14 coefficients</a> (NOAA NCEI copy). The Gauss coefficients of the 14th International Geomagnetic Reference Field, 1900–2030. The observatory section takes every globe number from them: the dipole axis and its field strength at the equator (degree 1), and the off-centre dipole (degrees 1 and 2).</li> <li id=\"s5-r14\">A. C. Fraser-Smith, “Centered and eccentric geomagnetic dipoles and their poles, 1600–1985”, <em>Reviews of Geophysics</em> 25, 1–16 (1987), <a href=\"https://doi.org/10.1029/RG025i001p00001\">doi:10.1029/RG025i001p00001</a>; and M. Koochak &amp; A. C. Fraser-Smith, “An update on the centered and eccentric geomagnetic dipoles and their poles for the years 1980–2015”, <em>Earth and Space Science</em> 4, 626–636 (2017), <a href=\"https://doi.org/10.1002/2017EA000280\">doi:10.1002/2017EA000280</a>. The classical method for the off-centre dipole, applied here to the IGRF-14 coefficients.</li> <li id=\"s5-r15\"><a href=\"https://wdcapi.bgs.ac.uk/\">BGS World Data Centre for Geomagnetism (Edinburgh) — Global Survey Data</a>, served by the WDC API (service <code>global-geomagnetic-survey</code>). Repeat-station and one-off survey measurements of D, I and F supplied by national survey institutes; the observatory section keeps each site's latest inclination from 1990–2025.</li> <li id=\"s5-r16\">R. P. Feynman, R. B. Leighton &amp; M. Sands, <em>The Feynman Lectures on Physics</em>, vol. II, <a href=\"https://www.feynmanlectures.caltech.edu/II_13.html\">chapter 13, “Magnetostatics”</a> (Caltech online edition). The divergence of B is zero everywhere: there are no magnetic charges, and field lines never end. The reason the flat layout ② must carry a rim ring exactly as strong as its centre pole.</li> <li id=\"s5-r17\">R. Fitzpatrick, <a href=\"https://farside.ph.utexas.edu/teaching/jk1/Electromagnetism/node60.html\">“Permanent ferromagnets”</a>, in his graduate lecture notes on classical electromagnetism (University of Texas at Austin); the same treatment in J. D. Jackson, <em>Classical Electrodynamics</em>, 3rd ed. (Wiley, 1999), §5.9 C. The field of a permanent magnet follows exactly from effective magnetic charges: −∇·M inside the material and n·M on its surface. A disc magnetised radially with M ∝ 1/r has no charge in its bulk, one pole at its centre and an equal and opposite one along its edge: the flat layout ②.</li> <li id=\"s5-r18\">C.-F. Li, Y. Lu &amp; J. Wang, “A global reference model of Curie-point depths based on EMAG2”, <em>Scientific Reports</em> 7, 45129 (2017), <a href=\"https://doi.org/10.1038/srep45129\">doi:10.1038/srep45129</a>. The depth below which rock is too hot to stay magnetised — the Curie temperature of magnetite, 580 °C — mapped worldwide from magnetic anomaly data: about 20 km on average under the oceans, 20 to 35 km under the continents.</li> <li id=\"s5-r19\">A. M. Dziewonski &amp; D. L. Anderson, “Preliminary reference Earth model”, <em>Physics of the Earth and Planetary Interiors</em> 25, 297–356 (1981), <a href=\"https://doi.org/10.1016/0031-9201(81)90046-7\">doi:10.1016/0031-9201(81)90046-7</a>. PREM: the liquid outer core between 2,891 and 5,150 km depth, where the shear-wave speed is zero.</li> <li id=\"s5-r20\">S. Anzellini, A. Dewaele, M. Mezouar, P. Loubeyre &amp; G. Morard, “Melting of iron at Earth’s inner core boundary based on fast X-ray diffraction”, <em>Science</em> 340, 464–466 (2013), <a href=\"https://doi.org/10.1126/science.1233514\">doi:10.1126/science.1233514</a>. Iron melts at 6,230 ± 500 K at the pressure of the inner-core boundary, which sets the temperature there.</li> <li id=\"s5-r21\"><a href=\"https://geomag.bgs.ac.uk/education/earthmag.html\">British Geological Survey — The Earth’s magnetic field: an overview</a>. “The Earth’s magnetic field is generated in the fluid outer core by a self-exciting dynamo process. Electrical currents flowing in the slowly moving molten iron generate the magnetic field.”</li> <li id=\"s5-r22\">G. A. Glatzmaier &amp; P. H. Roberts, “A three-dimensional self-consistent computer simulation of a geomagnetic field reversal”, <em>Nature</em> 377, 203–209 (1995), <a href=\"https://doi.org/10.1038/377203a0\">doi:10.1038/377203a0</a>. The first simulated geodynamo to maintain its field for tens of thousands of years and reverse it.</li> <li id=\"s5-r23\">F. J. Vine &amp; D. H. Matthews, “Magnetic anomalies over oceanic ridges”, <em>Nature</em> 199, 947–949 (1963), <a href=\"https://doi.org/10.1038/199947a0\">doi:10.1038/199947a0</a>. The magnetic stripes of the sea floor, symmetric about the ridges, read as reversals of the field recorded by lava as it cooled.</li> <li id=\"s5-r24\">A. Gailitis et al., “Detection of a flow induced magnetic field eigenmode in the Riga dynamo facility”, <em>Physical Review Letters</em> 84, 4365–4368 (2000), <a href=\"https://doi.org/10.1103/PhysRevLett.84.4365\">doi:10.1103/PhysRevLett.84.4365</a>; and R. Stieglitz &amp; U. Müller, “Experimental demonstration of a homogeneous two-scale dynamo”, <em>Physics of Fluids</em> 13, 561–564 (2001), <a href=\"https://doi.org/10.1063/1.1331315\">doi:10.1063/1.1331315</a>. Liquid sodium that generates its own magnetic field: the dynamo, in the laboratory.</li> </ol> </div>",
  "k": "x:rd-both"
 }
];
