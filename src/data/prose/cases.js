// Prose de l'onglet cases (études de cas, 2026-10-31), en anglais (source). Les nombres (span.cv[data-v]) viennent de
// src/tabs/cases/logic.js (p2pValues) ; le tableau des essais (#p2pTrials) est rempli par index.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "k": "cs-eyebrow",
  "html": "Case studies · claims examined with their own data"
 },
 {
  "t": "h1",
  "k": "cs-h1",
  "html": "Case studies"
 },
 {
  "t": "lead",
  "k": "cs-lead",
  "opener": true,
  "html": "Each section takes one published observation offered as evidence for a flat Earth, finds where and when it was made, and redoes it with the operators' own numbers and the open data of that day. Both models get the same inputs. The question is not whether the observers saw what they say, but what their own measurements allow anyone to conclude."
 },
 {
  "t": "h2",
  "k": "p2p-h",
  "html": "Worthing–Brighton, February 2019: a laser across 15 km of sea"
 },
 {
  "t": "notes",
  "k": "p2p-claim",
  "html": "<b>The claim.</b> On the evening of 23 February 2019 a group set up lasers and cameras on the beach at the end of Worthing Pier and at the foot of the West Pier ruins in Brighton, <span class=\"cv\" data-v=\"pD\">…</span> km apart across the sea, each about 1 m above the water at low tide.<sup class=\"ref\"><a href=\"#s-cases-n1\">[1]</a></sup> Each side saw the other's laser, blocked and released on command over a livestream; then the green laser at Worthing was lowered to about 0.5 m and 0.15 m above the water, and still seen from a camera 0.7 m up at Brighton. Their presentation concludes that no refraction occurred, since no mirage could be seen, and that no curvature lies between the piers. It also records an earlier attempt, on 2 February, when the laser could not be seen; that failure was put down to a \"refraction zone\" above the sea.<sup class=\"ref\"><a href=\"#s-cases-n1\">[1]</a></sup>"
 },
 {
  "t": "notes",
  "k": "p2p-where",
  "html": "<b>Where and when.</b> The slides give the piers and a map. On OpenStreetMap<sup class=\"ref\"><a href=\"#s-cases-n7\">[7]</a></sup> the laser and camera at Worthing sit on the sand off the south end of the pier, about 50.807° N 0.369° W, and those at Brighton on the beach north-west of the West Pier ruin, about 50.820° N 0.153° W: <span class=\"cv\" data-v=\"pD\">…</span> km apart (they give 15.3), all of it over the sea, half a kilometre to two kilometres off the coast. The tide was near its low; the Newhaven gauge<sup class=\"ref\"><a href=\"#s-cases-n5\">[5]</a></sup> confirms the low water just after 20:00 UTC. That evening Shoreham Airport, halfway along the line, reported a clear sky and 3 to 4 knots of wind,<sup class=\"ref\"><a href=\"#s-cases-n4\">[4]</a></sup> and ERA5 gives <span class=\"cv\" data-v=\"p23P\">…</span> hPa.<sup class=\"ref\"><a href=\"#s-cases-n3\">[3]</a></sup>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "p2p-fx1",
  "fig": "p2pFxGeom",
  "lines": [
   {
    "tex": "H = \\frac{\\left(d - \\sqrt{2Rh_c}\\right)^2}{2R},\\qquad R_{\\text{eff}} = \\frac{R}{1-k} \\ge \\frac{d^2}{2\\left(\\sqrt{h_s} + \\sqrt{h_c}\\right)^2}",
    "fallback": "H = (d − √(2Rh_c))²/2R, R_eff = R/(1 − k) ≥ d²/2(√h_s + √h_c)²"
   }
  ],
  "gloss": "d is the distance, h_c the camera's height and h_s the laser's above the water, R the Earth's radius. H is the height hidden behind the bulge for straight light: <span class=\"cv\" data-v=\"pHid\">…</span> m for their first trial, <span class=\"cv\" data-v=\"pHidStd\">…</span> m with the usual refraction k = 0.13, so their slides are right that a 1 m laser should be hidden from 1 m. It is seen if the air bends light enough to stretch the effective radius past d²/2(√h_s + √h_c)²: a uniform k of <span class=\"cv\" data-v=\"pK\">…</span> for 1 m to 1 m, <span class=\"cv\" data-v=\"pKlow\">…</span> for 0.15 m to 0.7 m. The bulge between the piers is <span class=\"cv\" data-v=\"pBulge\">…</span> m."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:p2p-anim",
  "html": "<div class=\"fig\"><canvas id=\"p2pAnim\" class=\"p2p-anim\" role=\"img\" aria-label=\"Animation: the laser 1 m above the sea at Worthing seen from a camera 1 m up at Brighton, 15.2 km away, on a globe (top) and on a plane (bottom) in the same air, through four airs. On 2 February, in the cold air estimated from ERA5, the beam passes far above the camera on both. On 23 February, in the air measured at Worthing, the globe shows it directly and the plane by reflection; in the air measured at Brighton, the globe hides it and the plane shows it; in the weakest uniform air the globe needs, the globe shows it directly.\"></canvas> <p class=\"reads\" id=\"p2pReads\"></p></div>"
 },
 {
  "t": "fcap",
  "k": "p2p-anim-cap",
  "html": "<b>The same test, ray by ray, in four airs.</b> 81 rays of a 1 mrad beam fired level 1 m above the water, traced to a camera 1 m up, over the globe (top; the sea bulges 4.5 m between them) and over a plane (bottom), in the same air. 2 February, the air estimated from ERA5 and OISST, cold over a warm sea: the beam is thrown upward and passes far above the camera on both, as the laser was not seen. 23 February, the air measured at Worthing: the globe shows the beam directly, the plane only by reflection off the water (dashed after a first bounce). The air measured at Brighton: the globe hides it, the plane shows it. Last, the weakest uniform air in which the globe shows the laser: +0.17 °C over 2 m, less than their thermometers could resolve. The method is the Refraction tab's laser section. Click to pause."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:p2p-table",
  "html": "<div class=\"tablewrap\"><table class=\"p2p-table\"><thead><tr><th scope=\"col\">Trial</th><th scope=\"col\">Laser → camera</th><th scope=\"col\">Seen</th><th scope=\"col\">Hidden, straight light</th><th scope=\"col\">k needed</th><th scope=\"col\">Warming needed over 2 m</th><th scope=\"col\">In the air measured at Worthing: globe / plane</th><th scope=\"col\">At Brighton: globe / plane</th></tr></thead><tbody id=\"p2pTrials\"></tbody></table></div>"
 },
 {
  "t": "fcap",
  "k": "p2p-table-cap",
  "html": "<b>The five trials of the presentation.</b> Hidden height for straight light over a globe of 6,371 km; the uniform refraction coefficient that would let the camera see the laser; the same as a warming of the air with height at that evening's pressure and temperature. The last two columns trace 81 rays of a 1 mrad beam through the air measured at each end (thermometer A; B gives the same), over the globe and over a plane: <em>direct</em>, a ray reaches the camera without touching the water; <em>by reflection</em>, only rays that bounced off calm water arrive; <em>hidden</em>, none arrives. For 2 February, with no readings, the air is estimated from ERA5 and OISST with the usual logarithmic profile of the surface layer. The method is the Refraction tab's laser section."
 },
 {
  "t": "notes",
  "k": "p2p-air",
  "html": "<b>What their thermometers could see.</b> They read the air at several heights at both ends, with two thermometers good to ±0.25 °C, read to the half degree.<sup class=\"ref\"><a href=\"#s-cases-n1\">[1]</a></sup> The refraction coefficient follows the vertical temperature gradient,<sup class=\"ref\"><a href=\"#s-cases-n8\">[8]</a></sup> and the globe needs only <span class=\"cv\" data-v=\"pG2\">…</span> °C of warming between the water and 2 m for the first trial (<span class=\"cv\" data-v=\"pGlow2\">…</span> °C for the lowest). At Worthing both thermometers show the air warming by <span class=\"cv\" data-v=\"pWdT\">…</span> °C over 2 m, <span class=\"cv\" data-v=\"pWg\">…</span> °C per metre: <span class=\"cv\" data-v=\"pRatio\">…</span> times what is needed, and at least <span class=\"cv\" data-v=\"pWlo\">…</span> °C per metre within their stated precision. At Brighton the readings are flat between the water and <span class=\"cv\" data-v=\"pBdh\">…</span> m, which their precision cannot tell from any gradient between <span class=\"cv\" data-v=\"pBlo\">…</span> and <span class=\"cv\" data-v=\"pBhi\">…</span> °C per metre, the needed one included. Their own conclusion, that the readings were \"indistinguishable within the precision\", is exactly why they cannot rule refraction out."
 },
 {
  "t": "formula",
  "flat": false,
  "k": "p2p-fx2",
  "fig": "p2pFxTherm",
  "lines": [
   {
    "tex": "k = 503\\cdot\\frac{P}{T^2}\\left(0.0342 + \\frac{dT}{dh}\\right)",
    "fallback": "k = 503 · (P/T²) · (0.0342 + dT/dh)"
   }
  ],
  "gloss": "P in hPa, T in K, dT/dh in K per metre: with that evening's 1,034 hPa and 8 °C, every 0.1 °C per metre of warming adds 0.66 to k. Air whose temperature does not change with height gives k ≈ 0.22; the standard atmosphere 0.13–0.17."
 },
 {
  "t": "notes",
  "k": "p2p-two",
  "html": "<b>Two evenings, two answers.</b> On 2 February, when the laser was not seen, ERA5 puts the air 2 m above the sea at <span class=\"cv\" data-v=\"p2T\">…</span> °C over a sea at <span class=\"cv\" data-v=\"p2S\">…</span> °C, with a wind of <span class=\"cv\" data-v=\"p2W\">…</span> km/h off the land.<sup class=\"ref\"><a href=\"#s-cases-n3\">[3]</a></sup><sup class=\"ref\"><a href=\"#s-cases-n6\">[6]</a></sup> Cold air over warmer water bends low rays upward, the hot-road mirage the slides describe; estimated with the usual logarithmic profile of the surface layer, it hides the laser on the globe and on the plane alike. On 23 February the air offshore was as warm as the sea (<span class=\"cv\" data-v=\"p23T\">…</span> against <span class=\"cv\" data-v=\"p23S\">…</span> °C) under a light wind, and the water at Brighton, 7.0 °C, was no warmer than the air above it: the warm-over-cold layer their Worthing thermometers measured, in which the traced beam reaches the camera on the globe directly. The presentation accepts refraction when the laser disappears and rejects it when the laser appears. Both evenings follow the air; neither tests the shape."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:p2p-ev-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"p2pFigEvenings\"></div> <div class=\"fcap\">The two evenings from ERA5 (air 2 m above the sea, sea cell 50.75° N 0.25° W) and OISST (the sea), 17 to 22 h UTC. 2 February: air 6 °C colder than the sea, wind 34 km/h from the north-north-west; the laser was not seen. 23 February: air as warm as the sea offshore, light wind; the laser was seen. The water at the beaches was colder than OISST's offshore cells: they measured 7.0 °C at Brighton.</div> </div>"
 },
 {
  "t": "notes",
  "k": "p2p-night",
  "html": "<b>What the night pictures show.</b> The stills from Worthing show the laser at Brighton just below the lamps of King's Road and well below the British Airways i360, 162 m tall.<sup class=\"ref\"><a href=\"#s-cases-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-cases-n7\">[7]</a></sup> These cannot decide anything: the i360, the lamps and the laser are at the same distance, so the angle between them is the same whatever bends the light, <span class=\"cv\" data-v=\"pI360\">…</span> mrad between the i360's top light and the laser in straight air, <span class=\"cv\" data-v=\"pI360b\">…</span> mrad with k = 0.78. And with the air it takes to see the laser at all, only about a metre stays hidden on the globe: the lamps 12 to 13 m above the water are seen in both models. \"No mirage\" proves no more: a steady gradient bends light without doubling any image; a mirage needs the gradient to change sharply with height.<sup class=\"ref\"><a href=\"#s-cases-n9\">[9]</a></sup>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "p2p-flat",
  "html": "<b>The flat model at its best, and the symmetric verdict.</b> In ordinary air the plane predicts the laser seen every time, from any height; the globe predicts it hidden by about 11 m. That is a clean test, but only if the air is ordinary, and nothing on these evenings showed that it was: on 2 February the laser vanished as it would over a globe in cold air, and on 23 February it appeared in air measured to be warming with height. <b>What would vindicate the plane:</b> a narrow beam seen again and again from 1 m at 15 km, by day and by night, while thermometers good to 0.05 °C at 0.25, 0.5, 1 and 2 m, at both ends and on a boat halfway, show the air not warming with height. <b>What would vindicate the globe:</b> the same beam hidden, under the same thermometers."
 },
 {
  "t": "notes",
  "k": "p2p-next",
  "html": "<b>How to make it decisive.</b> Their own list of improvements points the right way: measure at the same heights at both ends, and away from the body heat of the people taking the readings. Add the missing pieces: thermometers ten times finer, a reading halfway along the line, and the angle of the laser above or below the true level at the camera, read with a theodolite or a levelled camera. That is where the two models part by a sign: in the air it takes to see the laser, the globe puts it <span class=\"cv\" data-v=\"pElG\">…</span> mrad below the camera's horizontal, the plane <span class=\"cv\" data-v=\"pElF\">…</span> mrad above it (<span class=\"cv\" data-v=\"pElF13\">…</span> in ordinary air); a good theodolite reads a hundredth of that. Repeat from several heights, as the lasers were lowered here, and by day."
 },
 {
  "t": "callout",
  "flat": false,
  "k": "p2p-lim",
  "html": "<b>Limits.</b> The thermometer readings are the operators' own, at the beach, at low tide; nobody measured the air over the 15 km between. Each traced verdict applies one end's air to the whole path, which is why the lowest trial, 0.15 m, comes out hidden in Worthing's air for both models while it was seen: the air along the line was not Worthing's. The sites are placed from the slides' map to about 50 m; the distance from their coordinates uses the globe's radius, so the case is a check, not a measurement. The 2 February profile is estimated from ERA5 and OISST, not measured, and the time of that attempt is not given."
 },
 {
  "t": "xrefs",
  "keys": [
   "ref",
   "surv",
   "contrib"
  ]
 },
 {
  "t": "sources"
 }
];
