// Prose de l'onglet atmo (epic29, 2026-10-17), en anglais (source). Valeurs : span.cv[data-v] remplis par index.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "k": "atmo-eyebrow",
  "html": "Atmosphere · pressure, eruptions, radio waves, heat"
 },
 {
  "t": "h1",
  "k": "atmo-h1",
  "html": "The air above us: why it stays, how it bends radio waves, why satellites do not melt"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "atmo-lead",
  "html": "Three questions often asked as objections. How can the air sit next to the vacuum of space with no container? How can a radio amateur talk to someone beyond the horizon? How can a satellite survive in a layer of air at a thousand degrees? Each has a measured answer, and the same physics works on any shape of Earth: the shape shows up only in the details, which this page points out. The air also carries a measurement of its own: the pressure waves of two volcanic eruptions, Hunga Tonga in 2022 and Krakatoa in 1883, timed on ordinary barometers, give the Earth's radius."
 },
 {
  "t": "h2",
  "k": "atmo-h2press",
  "html": "Why the air stays without a lid: the pressure gradient"
 },
 {
  "t": "notes",
  "k": "atmo-press1",
  "html": "<b>Gravity is the container.</b> Every molecule is pulled down; molecules collide and push on each other; each layer of air carries the weight of all the air above it. So the pressure falls with height, smoothly, with no edge: half the sea-level pressure at <span class=\"cv\" data-v=\"h50\">…</span> km, a tenth at <span class=\"cv\" data-v=\"h10\">…</span> km, a hundredth at <span class=\"cv\" data-v=\"h1\">…</span> km, a millionth near 100 km<sup class=\"ref\"><a href=\"#s-atmo-n1\">[1]</a></sup>. At the top, molecules move at about a kilometre per second, far below the 11 km/s needed to leave the Earth; thrown up, they fall back like a ball."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"atmoAnimColumn\" style=\"height:clamp(420px,calc(700px - 30vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "atmoAnimColumn-cap",
  "html": "<b>No lid, and the air still stays.</b> Seven hundred molecules thrown about with the speeds of a gas at a given temperature, pulled down by gravity, bouncing off the ground; there is no ceiling, and the ones that leave the frame come back. On the right, how many are found in each slice of height (bars), against the exponential law e<sup>−h/H</sup> (orange): the profile holds by itself. The left axis gives the true scale for air at 15 °C, one scale height H = 8.4 km; the pressures on the right are those of the 1976 standard atmosphere at those heights. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "atmo-fx-hydro",
  "fig": "atmoFxHydro",
  "lines": [
   {
    "tex": "\\frac{dp}{dh} = -\\rho\\,g,\\qquad p = n\\,k\\,T",
    "fallback": "dp/dh = −ρ g, p = n k T"
   },
   {
    "tex": "\\g{p(h) = p_0\\,e^{-h/H}},\\qquad H = \\frac{k\\,T}{m\\,g}",
    "fallback": "p(h) = p₀ e^(−h/H), H = kT/(mg)"
   }
  ],
  "gloss": "p is the pressure, ρ the density and n the number of molecules per m³, g the acceleration of gravity, k Boltzmann's constant, T the temperature and m the mass of a molecule. The first line says that a thin layer of air is held up by the difference of pressure between its bottom and its top; with a constant temperature, it gives the exponential of the second line. H, the scale height, is <span class=\"cv\" data-v=\"H\">…</span> km for air at 15 °C: every <span class=\"cv\" data-v=\"H\">…</span> km up, the pressure is divided by e = 2.718."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:atmo-profile-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"atmoFigProfile\"></div> <div class=\"fcap\">The 1976 standard atmosphere from the ground to 500 km: the pressure on a logarithmic axis (blue), falling smoothly over a dozen powers of ten with no edge, and the temperature (orange), which falls in the troposphere, rises in the stratosphere, falls again in the mesosphere and climbs to about 1,000 K in the thermosphere.</div> </div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "atmo-press2",
  "html": "<b>The objection</b> says that a gas next to a vacuum must spread out, so the air needs a wall, and a dome. It would, without gravity. With it, the same molecules form a column whose pressure falls exponentially and never meets a wall: that is what barometers carried up mountains, weather balloons and rockets have measured since the seventeenth century. <b>What would vindicate a container:</b> an atmosphere whose pressure stays nearly constant with height and then drops to zero at a definite altitude, where a wall would be."
 },
 {
  "t": "h2",
  "html": "The air rang too: Hunga Tonga's pressure wave on 102 barometers",
  "k": "tg-h1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"atmoReel\" class=\"atmo-reel\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "atmoReel-cap",
  "html": "<b>Three explosions in under a minute.</b> The Hunga Tonga pressure wave lighting 102 barometers at their recorded times; their traces side by side, the pulse passing twice; the short way and the long way adding up to one lap, and the radius from each barometer with no distance and no map; the best flat-map predictions against the same traces; the Krakatoa barographs of 1883 lighting at each pass; the three wave trains of the 1961 Novaya Zemlya explosion in Japan, a lap from the first to the third; every lap of the three events on one ruler, and the radius from all of them. Every number is the page's own. Click to pause."
 },
 {
  "t": "lead",
  "html": "On 15 January 2022 at 04:14:45 UTC the Hunga Tonga–Hunga Ha'apai volcano exploded.<sup class=\"ref\"><a href=\"#s-atmo-n11\">[11]</a></sup> The blast sent a pressure pulse through the whole depth of the atmosphere, a Lamb wave, which instruments all over the world recorded circling the planet four times.<sup class=\"ref\"><a href=\"#s-atmo-n14\">[14]</a></sup> Every US airport weather station (ASOS) logs its barometer once a minute, and the logs are open.<sup class=\"ref\"><a href=\"#s-atmo-n10\">[10]</a></sup> This section uses 102 of them: two per state, plus Alaska, Hawaii and Puerto Rico. The pulse is typically 0.6–0.75 hPa high. The background before it is about 0.1 hPa.",
  "opener": false,
  "k": "tg-p1"
 },
 {
  "t": "lead",
  "html": "Each record is filtered (a 5-minute mean minus a 2-hour mean). Then two arrivals are picked without any model of the Earth. t₁ is the largest pulse between 2 and 20 hours after the eruption, and t₂ the largest between t₁ + 6 h and 40 h. The windows are wide on purpose, so they cannot carry the answer. Each station's angle θ from the volcano is computed from its coordinates only afterwards.",
  "opener": false,
  "k": "tg-p2"
 },
 {
  "t": "formula",
  "fig": "seisFxTonga",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "t_1 = \\dfrac{R\\,\\theta}{v}, \\qquad t_2 = \\dfrac{R\\,(2\\pi - \\theta)}{v}",
    "fallback": "t₁ = Rθ / v,   t₂ = R(2π − θ) / v"
   },
   {
    "tex": "t_1 + t_2 = \\dfrac{2\\pi R}{v} \\quad\\Rightarrow\\quad R = \\dfrac{v\\,(t_1 + t_2)}{2\\pi}",
    "fallback": "t₁ + t₂ = 2πR / v   ⇒   R = v(t₁ + t₂) / 2π"
   },
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"v \\approx 310\\ \\text{m}/\\text{s}\">v ≈ 310 m/s</span> <span style=\"color:var(--ink-soft);font-weight:400\">(the Lamb-wave speed computed from the temperature of the air, fixed in advance<sup class=\"ref\"><a href=\"#s-atmo-n12\">[12]</a></sup><sup class=\"ref\"><a href=\"#s-atmo-n13\">[13]</a></sup>; times counted from the measured eruption, not fitted)</span>"
   }
  ],
  "gloss": "On a sphere the wave reaches every station twice, once each way round, and the two paths add up to one circumference. So t₁ + t₂ is the same at every station, whatever its θ. On a plane the pulse is a circle growing from the volcano: it crosses each station once, and nothing comes back from the other side. To produce a second arrival the flat model needs an extra ingredient: an echo off a rim, or a bounce off a dome overhead. Both are tried below, in its favour.",
  "k": "tg-m1"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "tongaRead",
  "html": "<p class=\"reads\" id=\"tongaRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig tg-result",
  "id": "",
  "html": "<div class=\"fig tg-result\"><div id=\"tongaResult\"></div><div class=\"figsym\" id=\"tongaResFig\"></div> <div class=\"fcap\"><b>The radius found, and how sure it is.</b> The dot is the median of the 64 stations that saw both passages. The dark bar is the statistical uncertainty alone, a few kilometres. The pale bands are the total uncertainty, at one standard deviation and at 95%. Almost all of it is systematic: it is measured by redoing the calculation with each of the other reductions this section shows (each passage alone, the start time left free) and with the speed the 1883 eruption needs, 1.1% lower (the small ticks). The speed measured during this event is not used: it was measured with globe distances. The mean radius, 6,371 km, falls inside the band. This is the value carried to the home page's table of radii.</div> </div>",
  "k": "tg-res"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"tongaVFig\"></div> <div class=\"fcap\"><b>The V: 102 barometers, sorted by their angle from the volcano.</b> Each thin line is one station's filtered pressure. The first band of pulses arrives later the farther away the station. The second band arrives <em>earlier</em> the farther away the station, because the stations farthest from Tonga are the closest to it the long way round. The blue dashes are the globe with nothing fitted (R = 6,371 km, v = 310 m/s, start at the eruption). The orange dots are the plane's best fit to the first band, with its speed and start time both free. There is no orange second band: an expanding circle does not come back. The orange open circles are the second flat model, a bounce off a dome at its best height. At that height the bounced path is almost the same length everywhere, so they barely slope at all, and the little slope they have goes the wrong way: later the farther the station.</div> </div>",
  "k": "tg-m2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"tongaRFig\"></div> <div class=\"fcap\"><b>One radius per station.</b> Open circles: R = v t₁ / θ, from the first passage. Dots: R = v t₂ / (2π − θ), from the second. Grey: excluded, more than 3 standard deviations from the others. The second passage, the cleaner of the two, puts every kept station within a few tens of kilometres of 6,371 km. Both sets drift slightly downward with θ, by about 1.3 km per degree (some 100 km across the United States). That drift is real and is left in; it is explained below.</div> </div>",
  "k": "tg-m3"
 },
 {
  "t": "table",
  "id": "tongaTab1",
  "tbody": "tongaRows",
  "caption": "The radius three ways from the same picks, then with the start time left free",
  "head": [
   "Reduction",
   "Stations kept",
   "Mean R",
   "Spread",
   "Off 6,371 km"
  ],
  "k": "tg-m4"
 },
 {
  "t": "formula",
  "fig": "seisFxDome",
  "flat": true,
  "style": "",
  "lines": [
   {
    "tex": "L = \\sqrt{d^2 + 4h^2}, \\qquad \\dfrac{\\mathrm{d}L}{\\mathrm{d}d} = \\dfrac{d}{\\sqrt{d^2 + 4h^2}} > 0",
    "fallback": "L = √(d² + 4h²),   dL/dd = d / √(d² + 4h²) > 0"
   }
  ],
  "gloss": "The second flat model. The pulse goes up, bounces off a dome and comes down. Over the region the vault is taken as a ceiling at height h, and in a mirror the bounce becomes a straight line from the volcano's image, 2h up. Whatever h, that path grows with distance, so the echo would reach the farther stations <em>later</em>. The real second passage reaches them <em>earlier</em>, by 0.76 h per 1,000 km of map. That is a sign, not a size, and no height flips it. A dome posed on the map's edge adds nothing new: its shortest path runs along its foot, which is the rim echo in the table below.",
  "k": "tg-m6"
 },
 {
  "t": "table",
  "id": "tongaTab2",
  "tbody": "tongaFlatRows",
  "caption": "How closely each model's best line follows all 186 picks",
  "head": [
   "Model",
   "Free parameters",
   "Speed",
   "Start",
   "Scatter"
  ],
  "k": "tg-m5"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The flat model, tuned in its favour, still misses by hours.</b> With its own speed and start time, the plane fits the first band with a scatter of 27 minutes. On the same band the globe, with nothing fitted at all, scatters by 8 minutes. The plane's fit also needs the wave to travel at 427 m/s, 38% faster than the 310 m/s the air's temperature allows.<sup class=\"ref\"><a href=\"#s-atmo-n12\">[12]</a></sup> For the second band the plane has no path at all. It was offered an echo off a rim, at any radius from the map's edge (20,015 km) out to 100,000 km. Its best line then scatters by 80 to 111 minutes. It also has to start the wave between three hours before and almost nine hours after the eruption, whose time is measured. That echo comes off the nearest stretch of the rim, so it arrives later the farther the station, roughly parallel to the first band. An echo off the far side of the rim would slope the right way, but every station would first have heard the near-rim echo, and no trace shows it. The dome does a little better and still fails: at its best height, 22,111 km, it scatters by 65 minutes, needs 581 m/s, and starts the wave 3.8 h after the eruption.",
  "k": "tg-call1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What this measurement cannot do.</b> R is proportional to v. The 310 m/s comes from the physics of the air.<sup class=\"ref\"><a href=\"#s-atmo-n12\">[12]</a></sup><sup class=\"ref\"><a href=\"#s-atmo-n13\">[13]</a></sup> But the speed measured during this very event was 318 ± 6 m/s,<sup class=\"ref\"><a href=\"#s-atmo-n15\">[15]</a></sup> and with it every radius here would be 2.6% larger (about 6,550 km). That speed was itself measured with globe distances, so using it to compute R, or even to size the uncertainty, would be circular: it is quoted and nothing more. The uncertainty takes instead the speed the Krakatoa wave of 1883 needs, 1.1% lower, a ratio of lap times with no radius in it. That is about 70 km, far more than the spread between stations. A second limit: all the stations are in the United States, between 45° and 116° from Tonga. That is too short a lever to fit the start time and the radius together. Left free, the first band alone gives 6,193 km and the second alone 6,691 km, with a start 1.3 h before the eruption. The two disagree, and only the measured eruption time reconciles them. The slow drift of R with θ is the same problem seen another way. A speed that differs slightly from one path to another, or an effective start slightly off the explosion, would each produce it, and US stations alone cannot tell the two apart. What survives all of this needs no speed at all: two bands sloping opposite ways, the V.",
  "k": "tg-call2"
 },
 {
  "t": "h2",
  "html": "Before any of it: Krakatoa, 1883, on the barographs of the Victorian world",
  "k": "kr-h1"
 },
 {
  "t": "lead",
  "html": "On 27 August 1883 Krakatoa, a volcano in the Sunda Strait between Java and Sumatra, blew itself apart. Its pressure wave was traced by the self-recording barometers of observatories from Melbourne to Toronto, and the Royal Society's Krakatoa committee gathered the traces. Lieutenant-General Strachey, of the Meteorological Office, read up to seven passages of the same wave on them, and printed the times station by station in Greenwich Mean Time.<sup class=\"ref\"><a href=\"#s-atmo-n16\">[16]</a></sup> This section uses nothing else: 47 stations, typed in from the scanned tables. They were also checked against the report's own table of intervals between passages: all 175 agree to the minute.",
  "opener": false,
  "k": "kr-p1"
 },
 {
  "t": "lead",
  "html": "The method needs even less than Tonga's. At any one station, passage III is passage I one full turn of the Earth later, and IV is II one turn later in the other direction. Subtracting two readings of the same barograph's clock gives the time of one lap. That needs neither the station's position nor the moment of the explosion, which nobody measured: Strachey had to work it out from the waves themselves. The wind speeds up the wave one way round and slows it the other (Strachey's own explanation<sup class=\"ref\"><a href=\"#s-atmo-n16\">[16]</a></sup>), so one lap in each direction is averaged.",
  "opener": false,
  "k": "kr-p2"
 },
 {
  "t": "formula",
  "fig": "seisFxKrak",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "T_{\\to} = t_{\\text{III}} - t_{\\text{I}}, \\qquad T_{\\leftarrow} = t_{\\text{IV}} - t_{\\text{II}}",
    "fallback": "T→ = t_III − t_I,   T← = t_IV − t_II"
   },
   {
    "tex": "R = \\dfrac{v\\,(T_{\\to} + T_{\\leftarrow})}{4\\pi}",
    "fallback": "R = v (T→ + T←) / 4π"
   },
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"v \\approx 310\\ \\text{m}/\\text{s}\">v ≈ 310 m/s</span> <span style=\"color:var(--ink-soft);font-weight:400\">(the same Lamb-wave speed as for Tonga, from the temperature of the air, fixed in advance<sup class=\"ref\"><a href=\"#s-atmo-n12\">[12]</a></sup><sup class=\"ref\"><a href=\"#s-atmo-n13\">[13]</a></sup>)</span>"
   }
  ],
  "gloss": "Each lap is the difference between two readings of one clock, so a clock set wrong cancels out, and so does the station's position. On a plane there is no lap. A circle growing from the volcano crosses each station once; to get later passages the plane needs echoes, off a rim or off a dome, and their delays depend on where the station sits. The real laps do not: from Calcutta, 33° from Krakatoa, to Washington, 147°, they take about 36 hours one way round and 35 the other.",
  "k": "kr-m1"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "krakRead",
  "html": "<p class=\"reads\" id=\"krakRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig tg-result",
  "id": "",
  "html": "<div class=\"fig tg-result\"><div id=\"krakResult\"></div><div class=\"figsym\" id=\"krakResFig\"></div> <div class=\"fcap\"><b>The radius from 1883, and how sure it is.</b> The dot is the median of the 29 stations with a clean lap in each direction (times Strachey marked with a “?” left out). The dark bar is the statistical uncertainty alone. The pale bands are the total uncertainty, at one standard deviation and at 95%. As for Tonga, almost all of it is systematic: the small ticks redo the calculation with every lap, with the queried times kept, from the interval between the first two passages, and with the speed the 2022 eruption needs, 1.1% higher. The speed measured in 2022 is not used: it was measured with globe distances. The mean radius, 6,371 km, falls inside the band. This value is carried to the home page's table of radii.</div> </div>",
  "k": "kr-res"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"krakLapFig\"></div> <div class=\"fcap\"><b>One lap of the Earth, at every station.</b> Each point is the time between two passages of the same wave over one barograph, spread out by the station's angle from Krakatoa, which is not used to compute it. Dots: laps towards the antipodes (III − I, V − III, VII − V), about 36.2 h. Open circles: laps coming back (IV − II, VI − IV), about 34.7 h. The gap between the two is the wind Strachey described. The dashed line is the globe with nothing fitted, 6,371 km at 310 m/s: 35.9 h. The North American stations (θ ≈ 142–147°) split the most, both ways. Their waves passed close to the poles, and Strachey called their speeds “peculiar”. They are kept.</div> </div>",
  "k": "kr-m2"
 },
 {
  "t": "table",
  "id": "krakTab1",
  "tbody": "krakRows",
  "caption": "The radius from the same printed times, six ways",
  "head": [
   "Reduction",
   "Stations kept",
   "Median R",
   "Spread",
   "Off 6,371 km"
  ],
  "k": "kr-m3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"krakGapFig\"></div> <div class=\"fcap\"><b>The first interval, passage I to passage II, against the angle from the volcano.</b> On a globe it is the time to go on to the antipodes and come back, (2π − 2θ) R / v: a straight line, 28 h near Krakatoa, 7 h near its antipodes. Black dots: the 40 stations with both times unqueried. Blue dashes: the globe with nothing fitted. Orange: the plane at its best, with its own speed. The dots are a single echo off a rim at the map's edge. The open circles are a bounce off a dome at the best height. Neither follows the measured points.</div> </div>",
  "k": "kr-m4"
 },
 {
  "t": "table",
  "id": "krakTab2",
  "tbody": "krakFlatRows",
  "caption": "How closely each model follows the 40 intervals I → II",
  "head": [
   "Model",
   "Free parameters",
   "Speed",
   "Scatter"
  ],
  "k": "kr-m5"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The flat model, tuned in its favour.</b> The test uses only the interval between the first two passages, which a plane can at least attempt: the wave goes out once, and an echo comes back once. The intervals need no explosion time, so the only free parameter is the plane's speed. With an echo off a rim, at any radius from the map's edge (20,015 km) out to 100,000 km, its best line scatters by 5.6 to 7.4 hours, and it needs 295 to 2,941 m/s. The globe, with nothing fitted, scatters by 50 minutes. With a bounce off a dome, the best height is 5,012 km: the scatter is 3.3 hours and the wave would have to travel at 62 m/s, a fifth of the speed of sound. The later passages, five more at many stations, are not modelled for the plane: each would need yet another echo. <b>What would have vindicated the plane:</b> laps that change with the station's position, as any echo would make them, or no regular passages after the first two.",
  "k": "kr-call1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What this measurement cannot do.</b> As with Tonga, R is proportional to the speed v. With the speed measured in 2022 (318 m/s<sup class=\"ref\"><a href=\"#s-atmo-n15\">[15]</a></sup>), the radius would become 6,477 km, but that speed was measured with globe distances and is quoted only, never used in the uncertainty. The two eruptions also differ from each other at equal speed. 1883 gives 6,310 km and 2022 gives 6,382 km, 1.1% apart: one wave crossed an August atmosphere, the other a January one, and the Lamb wave's speed depends on the air's temperature. Strachey had to choose which wiggle of each trace counts as “the” passage. He states his reading errors to be well within thirty minutes,<sup class=\"ref\"><a href=\"#s-atmo-n16\">[16]</a></sup> which is 1.4% of a lap. One direction alone gives 6,468 km (out) or 6,187 km (back): the wind is not small, and only the average cancels it. The North American and Australian stations sit low (6,202–6,252 km) and are kept. The interval I → II, fitted against θ, gives 6,173 km: it mixes the two directions unevenly, and it needs the station's position. None of these limits touches the shape of the result: a lap of the same length wherever the barograph stood.",
  "k": "kr-call2"
 },
 {
  "t": "h2",
  "html": "Every lap together: two eruptions and a bomb, one size",
  "k": "lp-h1"
 },
 {
  "t": "lead",
  "html": "The same pressure wave has now been timed three times, by three generations of instruments: Krakatoa in 1883 on paper barographs, the Soviet test of 30 October 1961 at Novaya Zemlya (the \"Tsar Bomba\") on Japanese microbarographs, and Hunga Tonga in 2022 on airport barometers. Each lap timed at one station gives R = vT/2π on its own, with no position, no map and no distance. Here every lap goes into one measurement, as the earthquakes do in the seismology tab: <span class=\"cv\" data-v=\"lpN\">…</span> laps from four sets give <b><span class=\"cv\" data-v=\"lpR\">…</span> ± <span class=\"cv\" data-v=\"lpS\">…</span></b>.",
  "opener": false,
  "k": "lp-p1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig tg-result",
  "id": "",
  "html": "<div class=\"fig tg-result\"><div id=\"lambPoolResult\"></div><div class=\"figsym\" id=\"lambPoolFig\"></div> <div class=\"fcap\"><b>Every lap, one ruler.</b> Each dot is one station's lap turned into a radius at 310 m/s; the black tick is the set's median. Blue sets time the wave both ways round, which cancels the wind; violet sets time one way only. Each set is tight, and the sets sit within <span class=\"cv\" data-v=\"lpSpread\">…</span> of each other: the wave's speed changes with each route's wind and temperature. Combined other ways (each set weighing the same, one set left out at a time, only the sets timed both ways), the result moves by at most <span class=\"cv\" data-v=\"lpSys\">…</span>: that is its systematic uncertainty, and it dominates. The bottom row is all the laps together, with its bands at one standard deviation and at 95%. This value is carried to the home page's table of radii.</div> </div>",
  "k": "lp-res"
 },
 {
  "t": "table",
  "id": "lambPoolTab",
  "tbody": "lambPoolRows",
  "caption": "The four sets of laps and the result",
  "head": [
   "Set",
   "Lap",
   "Directions",
   "Laps kept",
   "Median R",
   "Off 6,371 km"
  ],
  "k": "lp-tab"
 },
 {
  "t": "lead",
  "html": "<b>Novaya Zemlya, 1961.</b> N. Murayama of the Japan Meteorological Agency tabulated three passages of the wave at eight microbarographs: the first by the short way, the second by the antipodal way, and the third, the first one back after a full circuit.<sup class=\"ref\"><a href=\"#s-atmo-n17\">[17]</a></sup> The third minus the first, at one station, is a lap: <span class=\"cv\" data-v=\"lpTsarT\">…</span> at <span class=\"cv\" data-v=\"lpTsarN\">…</span> of the <span class=\"cv\" data-v=\"lpTsarRows\">…</span> stations whose times he did not mark as uncertain (the fifth, 9 minutes shorter, falls more than three standard deviations from the others and is set aside by the rule used everywhere on this site). To check our transcription, each velocity he printed is found again from his distance and his time; his distances used the radius of 1962, so they serve only that check. <b>Hunga Tonga, seven days.</b> The wave went round four times one way and three the other.<sup class=\"ref\"><a href=\"#s-atmo-n14\">[14]</a></sup> With the same barometers over seven days, each passage's return was looked for 24 to 48 hours later, a window as wide as a sphere of 4,260 to 8,520 km. The long-way passage came back after <span class=\"cv\" data-v=\"lpTlapT\">…</span> at <span class=\"cv\" data-v=\"lpTlapN\">…</span> of <span class=\"cv\" data-v=\"lpTlapOf\">…</span> stations, within <span class=\"cv\" data-v=\"lpTlapSd\">…</span> of each other. The other returns did not stand out of the weather: their picks spread over the whole window (<span class=\"cv\" data-v=\"lpOddSd\">…</span> of scatter), so they are left out rather than forced.",
  "opener": false,
  "k": "lp-p2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What this measurement cannot do.</b> All four sets share the speed of 310 m/s, computed from the air's temperature and fixed in advance.<sup class=\"ref\"><a href=\"#s-atmo-n12\">[12]</a></sup> A different speed scales the result in proportion. The sets disagree with each other by more than their own scatter: the 1961 lap and the 2022 long-way lap were timed one way round only, so the wind along their route stays in them, and Krakatoa shows how much that can be. Pooling does not hide that disagreement: the systematic uncertainty is how far the answer moves when the sets are combined differently, and it is most of the total. Pooling only stops one event from deciding the answer alone. What the pooling does show is the shape: whatever the year, the instrument and the route, a lap at one station lasts the same 35 to 36 hours.",
  "k": "lp-call1"
 },
 {
  "t": "h2",
  "k": "atmo-h2radio",
  "html": "Radio waves and the ionosphere"
 },
 {
  "t": "notes",
  "k": "atmo-radio1",
  "html": "<b>Above 60 km, sunlight strips electrons off the air.</b> The free electrons form layers: D (60–90 km, by day only), E (around 110 km) and F (150–500 km, densest near 300 km). A radio wave entering this electron gas is turned back where its frequency equals the local plasma frequency, which grows with the number of electrons<sup class=\"ref\"><a href=\"#s-atmo-n3\">[3]</a></sup>. Long waves (below 1 MHz) mostly creep along the ground and, by day, are absorbed by the D layer. Short waves (3–30 MHz) are bent back to the ground, beyond the horizon, and can go round the world in several hops; between the ground wave and the first return lies a skip zone where nothing is heard<sup class=\"ref\"><a href=\"#s-atmo-n4\">[4]</a></sup>. Above 30–50 MHz the waves go through: FM radio and television reach only to the horizon, and satellites, GPS among them at 1.2–1.6 GHz, use frequencies the ionosphere cannot stop. At night the D layer vanishes and the F layer thins: lower frequencies travel far, which is why distant medium-wave stations come in after dark."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"atmoAnimRadio\" style=\"height:clamp(400px,calc(680px - 30vw),580px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "atmoAnimRadio-cap",
  "html": "<b>Which waves the ionosphere sends back.</b> A section of the Earth at true scale, a transmitter on the left, the D, E and F layers at their heights with their critical frequencies, by day then by night. Every few seconds another frequency: 500 kHz follows the ground and fades; 3.5 MHz is absorbed by day and bounces at night; 7 to 28 MHz bounce in hops beyond the horizon, leaving a skip zone (orange dots); 144 MHz goes straight through to space. Each ray leaves at a different elevation and is reflected only if its frequency is below the critical frequency times the secant of its angle on the layer. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "atmo-fx-plasma",
  "fig": "atmoFxPlasma",
  "lines": [
   {
    "tex": "f_p = 8.98\\,\\sqrt{N_e}\\ \\text{Hz}",
    "fallback": "f_p = 8.98 √N_e Hz"
   },
   {
    "tex": "\\g{f \\le f_{oF2}\\,\\sec\\varphi}\\ \\Rightarrow\\ \\text{reflected}",
    "fallback": "f ≤ f_oF2 sec φ ⇒ reflected"
   }
  ],
  "gloss": "N<sub>e</sub> is the number of free electrons per m³, f<sub>p</sub> the plasma frequency, f<sub>oF2</sub> the critical frequency at the peak of the F layer and φ the angle at which the wave meets the layer. With 10¹² electrons per m³ (a sunny day), f<sub>oF2</sub> = <span class=\"cv\" data-v=\"foDay\">…</span> MHz: a wave sent straight up at 14 MHz goes through, but the same wave sent low over the horizon meets the layer at a grazing angle and comes back<sup class=\"ref\"><a href=\"#s-atmo-n3\">[3]</a></sup>."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "atmo-fx-hop",
  "fig": "atmoFxHop",
  "lines": [
   {
    "tex": "\\g{d_{\\max} = 2R\\,\\arccos\\frac{R}{R+h}}",
    "fallback": "d_max = 2R arccos(R/(R+h))"
   }
  ],
  "gloss": "R is the Earth's radius and h the height of the reflecting layer. The longest single hop is the one that leaves and returns grazing the ground: for the F layer at 300 km, d<sub>max</sub> = <span class=\"cv\" data-v=\"dmax\">…</span> km, which is why HF predictions count F2 hops of up to about 4,000 km and longer paths in several hops<sup class=\"ref\"><a href=\"#s-atmo-n4\">[4]</a></sup>. A flat ground under a flat mirror would put no limit on the length of one hop."
 },
 {
  "t": "table",
  "id": "atmo-tabBands",
  "tbody": "atmo-tbBands",
  "k": "x:atmo-cap-bands",
  "caption": "The radio bands and what the ionosphere does to them<sup class=\"ref\"><a href=\"#s-atmo-n3\">[3]</a></sup><sup class=\"ref\"><a href=\"#s-atmo-n4\">[4]</a></sup>.",
  "head": [
   "Band",
   "Frequencies",
   "What happens",
   "Used for"
  ]
 },
 {
  "t": "callout",
  "flat": true,
  "k": "atmo-radio2",
  "html": "<b>The objection</b> says that radio contacts thousands of kilometres away, beyond the horizon, prove a flat Earth. They happen at short wave, not at VHF or microwave frequencies, and their reach changes with the hour, the season and the Sun's activity exactly as the ionosphere does: they are reflections. <b>What would vindicate the flat model here:</b> VHF and microwave links routinely working far beyond the line of sight with no satellite and no relay, or single short-wave hops much longer than 4,000 km."
 },
 {
  "t": "h2",
  "k": "atmo-h2heat",
  "html": "Why satellites do not melt in the thermosphere"
 },
 {
  "t": "notes",
  "k": "atmo-heat1",
  "html": "<b>Temperature is not heat.</b> The two words answer two different questions. <b>Temperature</b> says how hard <em>each</em> molecule hits: it measures the energy of one molecule, that is how fast it moves, whatever their number. <b>Heat</b> says how much energy <em>reaches</em> a body each second: the energy of one hit times the number of hits. A gas can therefore be very hot and bring almost no heat, if its molecules are few."
 },
 {
  "t": "notes",
  "k": "atmo-heatdiff",
  "html": "<b>An everyday example.</b> In a sauna the air is at 90 °C and one sits in it for minutes; water at 90 °C scalds in a second. Same temperature, so each molecule hits just as hard; but the same volume of water holds over a thousand times more molecules, so a thousand times more hits. In the same way the hand stands the air of an oven at 200 °C for a moment, not its metal tray, and a sparkler's sparks are over a thousand degrees but so small that they do not burn the hand. The thermosphere is the extreme case: a very high temperature, and almost nothing there to bring it."
 },
 {
  "t": "notes",
  "k": "atmo-heat1b",
  "html": "<b>The numbers at 400 km.</b> The temperature there is about <span class=\"cv\" data-v=\"T400\">…</span> K: each molecule is very fast<sup class=\"ref\"><a href=\"#s-atmo-n1\">[1]</a></sup>. But at that height, where the International Space Station flies<sup class=\"ref\"><a href=\"#s-atmo-n7\">[7]</a></sup>, there are <span class=\"cv\" data-v=\"n400\">…</span> molecules per cubic metre, <span class=\"cv\" data-v=\"nRatio\">…</span> times fewer than at sea level. Their impacts on a surface at room temperature bring <span class=\"cv\" data-v=\"q400\">…</span> per square metre<sup class=\"ref\"><a href=\"#s-atmo-n2\">[2]</a></sup>. The same gas at sea-level density would bring <span class=\"cv\" data-v=\"qSea\">…</span> per square metre and melt anything."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"atmoAnimHeat\" style=\"height:clamp(440px,calc(720px - 30vw),620px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "atmoAnimHeat-cap",
  "html": "<b>The same 1,000 K, two very different heats.</b> The same box on both sides, a cube of one micrometre resting on one square micrometre of wall at 300 K, watched for the same 100 microseconds. Left: a gas at 1,000 K as dense as the air at sea level: 25 million molecules in the cube, far too many to draw, and some 5 × 10¹¹ impacts on the wall in 100 µs. Right: the thermosphere at 400 km, also at 1,000 K: one molecule for every 9,500 such cubes; the three molecules that strike the wall in those 100 µs are drawn one by one, at the times a random draw at the true rate gives. The counters of impacts and energy follow the true rates. Below, on a logarithmic scale, what reaches or leaves a square metre of satellite: sunlight dominates, the gas of the thermosphere is two million times weaker. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "atmo-fx-heat",
  "fig": "atmoFxHeat",
  "lines": [
   {
    "tex": "\\Phi = \\frac{n\\,\\bar v}{4},\\qquad \\g{q = \\Phi\\cdot 2k\\,(T_{\\text{gas}} - T_{\\text{wall}})}",
    "fallback": "Φ = n v̄/4, q = Φ · 2k (T_gas − T_wall)"
   },
   {
    "tex": "q_{\\text{ram}} = \\tfrac12\\,\\rho\\,v^3",
    "fallback": "q_ram = ½ ρ v³"
   }
  ],
  "gloss": "Φ is the number of molecules striking a square metre each second, v̄ their mean speed, n their number per m³; each brings 2kT of energy on average and leaves with the wall's temperature. At 400 km, Φ = <span class=\"cv\" data-v=\"phi400\">…</span> per m² per second and q = <span class=\"cv\" data-v=\"q400\">…</span>. The satellite's own speed, 7.7 km/s, makes the molecules strike its front much harder: ½ρv³ = <span class=\"cv\" data-v=\"qRam\">…</span>, still two thousand times less than sunlight."
 },
 {
  "t": "notes",
  "k": "atmo-heat2",
  "html": "<b>What sets a satellite's temperature is sunlight, and how well it radiates.</b> In the Sun, a surface absorbs up to <span class=\"cv\" data-v=\"S\">…</span> W/m²<sup class=\"ref\"><a href=\"#s-atmo-n5\">[5]</a></sup>; it gets rid of heat only by radiating, as σT⁴. A black ball in sunlight at the Earth's distance settles where the two balance: <span class=\"cv\" data-v=\"Teq\">…</span> K, about <span class=\"cv\" data-v=\"TeqC\">…</span> °C. Satellites are painted, insulated and fitted with radiators to stay in a comfortable range; the thousand degrees of the thin gas around them hardly enter the budget."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "atmo-fx-bal",
  "fig": "atmoFxBal",
  "lines": [
   {
    "tex": "\\alpha\\,S\\,\\pi r^2 = \\varepsilon\\,\\sigma\\,T^4\\,4\\pi r^2\\ \\Rightarrow\\ \\g{T = \\left(\\frac{\\alpha\\,S}{4\\,\\varepsilon\\,\\sigma}\\right)^{1/4}}",
    "fallback": "α S πr² = ε σ T⁴ 4πr² ⇒ T = (αS/(4εσ))^(1/4)"
   }
  ],
  "gloss": "S is the sunlight per square metre, α the fraction absorbed, ε how well the surface radiates (both 1 for a black body), σ the Stefan–Boltzmann constant and r the ball's radius: it catches sunlight on πr² and radiates from 4πr². T = <span class=\"cv\" data-v=\"Teq\">…</span> K<sup class=\"ref\"><a href=\"#s-atmo-n5\">[5]</a></sup><sup class=\"ref\"><a href=\"#s-atmo-n6\">[6]</a></sup>."
 },
 {
  "t": "notes",
  "k": "atmo-heat4",
  "html": "<b>From radiation to energy to temperature.</b> Light carries energy: <span class=\"cv\" data-v=\"S\">…</span> W on every square metre facing the Sun<sup class=\"ref\"><a href=\"#s-atmo-n5\">[5]</a></sup>. A body that absorbs it does not jump to its final temperature: the energy piles up in its matter, and the temperature is that stored energy divided by the body's heat capacity C, its mass times its specific heat. Take a black aluminium plate of 1 m² and 2 mm, facing the Sun at 400 km: 5.4 kg, C = <span class=\"cv\" data-v=\"radC\">…</span> J/K<sup class=\"ref\"><a href=\"#s-atmo-n8\">[8]</a></sup>. Cold, it gains <span class=\"cv\" data-v=\"S\">…</span> joules each second and warms by <span class=\"cv\" data-v=\"radRate\">…</span> K a minute. The warmer it gets, the more it radiates, as σT⁴ from each of its two faces<sup class=\"ref\"><a href=\"#s-atmo-n6\">[6]</a></sup>, so the rise slows and stops at <span class=\"cv\" data-v=\"radEq\">…</span> K (<span class=\"cv\" data-v=\"radEqC\">…</span> °C), where what comes in equals what goes out. An orbit at 400 km lasts <span class=\"cv\" data-v=\"radP\">…</span> minutes<sup class=\"ref\"><a href=\"#s-atmo-n9\">[9]</a></sup>, of which up to <span class=\"cv\" data-v=\"radSh\">…</span> in the Earth's shadow: there nothing comes in, the plate keeps radiating and cools, to <span class=\"cv\" data-v=\"radMin\">…</span> K (<span class=\"cv\" data-v=\"radMinC\">…</span> °C) before sunrise. That swing, not the thermosphere, is what satellite designers fight."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"atmoAnimRad\" style=\"height:clamp(440px,calc(700px - 30vw),560px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "atmoAnimRad-cap",
  "html": "<b>Radiation in, energy stored, temperature, radiation out.</b> The black plate of 1 m² × 2 mm on an orbit at 400 km, the Sun in the plane of the orbit. Top: the four steps with their values at each moment (the energy gained is counted from the coldest moment, just before sunrise), and the balance C dT/dt = P<sub>in</sub> − P<sub>out</sub>. Left: where the plate is (the Earth's shadow in grey), its colour following its temperature, the yellow arrows (sunlight absorbed) and the red ones (heat radiated from each face) drawn in proportion to their power. Right: the temperature over one orbit of <span class=\"cv\" data-v=\"radP\">…</span> minutes, from <span class=\"cv\" data-v=\"radMin\">…</span> K to <span class=\"cv\" data-v=\"radMax\">…</span> K, and the balance it reaches in sunlight. One orbit is played in 24 seconds. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "atmo-fx-ode",
  "fig": "atmoFxRad",
  "lines": [
   {
    "tex": "C\\,\\frac{dT}{dt} = P_{\\text{in}} - P_{\\text{out}} = \\alpha\\,S\\,A - 2\\,\\varepsilon\\,\\sigma\\,A\\,T^4",
    "fallback": "C dT/dt = α S A − 2 ε σ A T⁴"
   },
   {
    "tex": "\\g{T_{\\text{eq}} = \\left(\\frac{\\alpha\\,S}{2\\,\\varepsilon\\,\\sigma}\\right)^{1/4}}",
    "fallback": "T_eq = (αS/(2εσ))^(1/4)"
   }
  ],
  "gloss": "C is the heat capacity (mass × specific heat, <span class=\"cv\" data-v=\"radC\">…</span> J/K for the plate), A its area, facing the Sun on one side and radiating from both; α and ε are 1 for a black surface. The left side is the energy stored each second; when it is zero, the temperature no longer moves: T<sub>eq</sub> = <span class=\"cv\" data-v=\"radEq\">…</span> K. The animation integrates this equation step by step over the orbit, with P<sub>in</sub> = 0 in the shadow. The 2 mm of aluminium carry heat across so fast that both faces are taken at the same temperature; the Earth's own reflected light and infrared, which add a little, are left out."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "atmo-heat3",
  "html": "<b>The objection</b> says that satellites cannot exist, since the thermosphere at 1,000–2,000 °C would melt them. It takes the temperature of a gas for the heat it delivers. <b>What would vindicate it:</b> a thermosphere dense enough to bring watts per square centimetre; but such a gas would also brake every satellite to the ground within days, and satellites stay up for years at these heights."
 },
 {
  "t": "xrefs",
  "keys": [
   "sat",
   "gps",
   "ref",
   "seis"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
