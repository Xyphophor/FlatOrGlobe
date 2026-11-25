# Earthquakes measure the distance between every pair of points on Earth, and no flat map survives the result

> Tab "Seismology" of *Flat plane or Globe?*. Web page: /#tab-seis. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Seismology · the planet is scanned a hundred times a day*

*Figure caption:* **The travel-time curve, the way a seismologist checks it.** Arrival time against distance, every station plotted twice: once at its great-circle distance, once at its flat-map distance. This is the plot the experiment card asks you to reproduce from real traces.

Somewhere on Earth a magnitude-5 earthquake happens roughly every hour. Each one sends a pulse across the surface and through the interior, and a few thousand instruments write down when it arrives. That is a distance measurement between two points on the planet — thousands of them a day, over every pair of continents, made by institutions in dozens of countries that give the raw traces away for free. This tab is about what that pile of arrival times says about the shape of the surface, and then about what the *missing* arrivals say about what is underneath it.

*[Figure: Animation: the P wave of the 2011 Tōhoku earthquake lighting real stations on a globe; a trial centre sliding until the arrival times fall on one curve; the residuals of every large shallow earthquake under one curve, narrow for the globe and wide for the best flat map; one dot per earthquake above the line of equality; a map of every flat-map centre tried; the share of stations with a direct P wave against distance; the radius from every surface-wave arrival; a summary]*

*Figure caption:* **The whole tab in under a minute.** The P wave of the 2011 Tōhoku earthquake lighting real stations at their recorded times; the four kinds of waves told apart by how they move the ground; our own centre, found from the times alone; all 261 large shallow earthquakes under one curve, globe against the best flat map; the same, earthquake by earthquake; every flat-map centre tried; the shadow of the core at 368,987 stations; the radius from 13,586 surface-wave arrivals. Every number is the page's own. Click to pause.

$$t = \frac{R\Delta}{v}$$
Δ = great-circle angle
$$v \approx 3.8\ \text{km}/\text{s}$$

A surface-wave arrival time is the great-circle distance divided by the group velocity — one function of the angular separation Δ, the same in every azimuth and on every continent. That is a strong claim, and it is the one the flat model cannot match: on a plane the distance between two points is whatever the map says, and no flat map can reproduce the distances a sphere has. Not "no flat map yet" — no flat map ever, as a theorem.

## Why this is a shape measurement and not a geology lesson

Gauss proved in 1827 that a surface's curvature is fixed by distances measured *within* the surface alone — the *Theorema Egregium*. Its brutal corollary is that a sphere cannot be flattened onto a plane without changing distances. Every world map you have ever seen is therefore lying about something; the only question is which distances it wrecks and by how much. A seismic network measures exactly the quantity the theorem is about: surface distance between pairs of points, tens of thousands of pairs, continuously, for over a century.

So the test does not require believing any particular story about the Earth's interior. Take the arrival times, ask what surface geometry makes them consistent, and the answer comes back a sphere of radius 6,371 km — the same radius the other tabs get from horizons, from star altitudes and from satellites. Then, as a bonus no flat model has any analogue for, the pattern of the arrivals that are *absent* hands you a map of the inside.

> **How to read the figures below.** A page cannot ship a hundred megabytes of seismograms, so the arrival times drawn here are *computed* from the spherical model. What they show needs no data at all: for ordinary station pairs the two models' distances disagree by tens of minutes to over an hour of travel time. Whether real traces follow the globe column or the flat one is yours to settle — the experiment card at the bottom does it with free public data and about twenty lines of Python. Take this tab's word for the geometry, not for the arrivals.

- Sumatra 2004
- t = **0 min**
- front at **0 km** = **0°**
- reached **0/19** real stations, real recorded time
- reached **0/19** flat map, computed

*[Figure: The same seismic wave on a globe: a circle that grows from the epicentre and closes on the antipode]*

*Figure caption:* **Real epicentres, real stations, real recorded arrival times.** The background is the north-polar azimuthal equidistant projection — the standard flat-earth map, on which distance from the north pole is correct and nothing else is. The two wavefronts are still computed geometry, exactly like the rest of this tab's animation; what is new is that each dot switches on at that station's *own recorded* arrival time from the ISC bulletin, not a computed one. Pick any of the nine real earthquakes used further below.

## Telling the waves apart: by how they move, not only by when they arrive [evidence: check — Where the radius enters: the kinds of waves and the direction each P wave came from are read off the records alone, with each sensor's orientation; the epicentres the directions are compared with are the ISC's, located with travel-time tables built for a spherical Earth.]

The sections below use readings the ISC names P, Pdif or PKP, and say each time that this is where a globe model enters: the ISC gives these names by comparing each arrival time with tables built for a spherical Earth.[5] But a seismometer records more than a time. It records the ground's motion in three directions, up, north and east, and each kind of wave moves the ground its own way.[20] That can be read off the record with no Earth model at all.

- **P**, the first to arrive: a push and pull *along* the ray. At a distant station the ray comes up steeply, so the motion is mostly vertical, with a small horizontal part pointing straight away from the earthquake.
- **S**: a shear *across* the ray, either horizontal and transverse to the path (SH) or in the vertical plane of the path (SV).
- **Love**: horizontal and transverse, like SH, but at long periods and after S.
- **Rayleigh**, the slowest and largest: the ground rolls on an ellipse in the vertical plane of the path, backwards at the top (retrograde).
- And the period: P and S shake at a few seconds, surface waves at tens of seconds, and surface waves are dispersed, their long periods arriving first.[15]

$$C = \frac{1}{N}\sum_i (\mathbf{x}_i - \bar{\mathbf{x}})(\mathbf{x}_i - \bar{\mathbf{x}})^{T}, \qquad L = 1 - \frac{\lambda_2}{\lambda_1}$$
λ₁ ≥ λ₂ ≥ λ₃ and u₁, u₂, u₃: the eigenvalues and directions of C. L near 1: the ground moves on a line (P, S, Love), along u₁. L small and λ₃ small: an ellipse in the plane normal to u₃ (Rayleigh).

Over a window of a few seconds to two minutes, the three components give a cloud of ground positions. Its covariance says how the cloud is spread: along one line, in one plane, or in every direction.[21][22] For the P wave, u₁ also says where the wave came from: its horizontal part points away from the source when its vertical part points up. Here the P onset is found by the ratio of a short to a long running mean of the energy,[23] the P direction is read from the first seconds after it, and the two horizontals are turned into R, away from the source along that measured direction, and T, across it. No travel time, no origin time and no Earth model is used.

- ANMO: the P wave came from 306° (measured from its motion)great circle to the epicentre: 312°straight line on the North Pole map: 327°period: P 10 s, Rayleigh 40 s

Station

*[Figure: The three components of ground motion at one station during the 2011 Tōhoku earthquake, vertical, radial and transverse, with two coloured bands underneath classifying each window by the shape of the motion]*

*Figure caption:* **Tōhoku 2011, three components at one station.** Real records from the Global Seismograph Network[24], ground velocity, 2 to 100 s, the horizontals turned to R and T with the direction the P wave itself gave. The coloured bands underneath classify each window from the motion alone: blue, a line in the vertical plane of the path (P, SV); violet, a line across the path (SH, Love); magenta, a retrograde ellipse in the vertical plane of the path (Rayleigh); grey, mixed. Top band: 20 s windows at 2–20 s periods; bottom band: 2 min windows at 25–100 s. The boxes mark the four windows of the next figure, found from the records alone: the P onset, the first strong transverse onset two minutes or more later, and the strongest minute of long-period transverse, then vertical, motion.

*[Figure: The path of the ground in four windows: a nearly vertical line for P, a line across the path for S and for Love, a retrograde ellipse in the vertical plane for Rayleigh]*

*Figure caption:* **The ground's path in the four windows.** P and Rayleigh in the vertical plane of the path (R across, Z up); S and Love seen from above (R across, T up). The arrow shows the sense of motion halfway through the window.

At the 4 stations shown, the P motion is a line (L from 0.96 to 1.00), in the vertical plane of the path, 20–29° from the vertical, at periods of 8–10 s. The first strong onset on the transverse component comes 7–10 minutes later at periods of 8–20 s. Then the long-period transverse motion (Love, transverse share 0.84 or more, 40–80 s), and after it the Rayleigh ellipse (24–48 s), retrograde at every station. The order and the shapes are exactly what the list above says, read off the records without a single travel time.

The P wave also says where it came from, and that is a test of the shape. Directions on the ground are angles: the direction of the epicentre from a station follows from latitudes and longitudes alone. On the globe it is the start of the great circle; on a flat map, the straight line on the map. The same was done for three great earthquakes, Tōhoku 2011, Maule 2010 and Nias 2005, at the same fourteen stations wherever they recorded a clear P: 38 records (4 without data or without a clear onset).

*[Figure: For each record, the measured direction of the P wave minus the predicted direction of the epicentre: tight around zero for the globe, spread over tens of degrees for the flat maps]*

*Figure caption:* **Where the P wave came from, against where each model puts the epicentre.** One dot per record, coloured by earthquake: the direction measured from the P motion minus the predicted direction. Top: the globe, no parameter. Middle: the North Pole flat map. Bottom: the one flat map, out of every centre, whose straight lines fit all 38 measured directions best.

**The P wave's direction against the predicted direction of the epicentre (rms difference)**

| Earthquake | Records | Globe | Flat, North Pole map | Flat, one best map | Flat, that earthquake's own map |
| --- | --- | --- | --- | --- | --- |
| Tōhoku 2011 | 14 | 9.9° | 24.5° | 12.5° | 9.2° |
| Maule 2010 | 13 | 15.1° | 60.6° | 45.1° | 14.0° |
| Nias 2005 | 11 | 7.2° | 34.5° | 41.5° | 7.3° |
| all three (rms) | 38 | 11.3° | 42.7° | 35.4° |  |

On the globe the measured directions differ from the great circle by 11.3° rms, 3.6° median. On the North Pole map, by 42.7° rms (30.1° median). The flat model's best case is its best map: the centre near 30° N, 152° W fits all three earthquakes best, and it still misses by 35.4° rms (22.3° median), 3 times the globe. As in the relocation sections, a flat map centred near one earthquake does nearly as well as the globe for that earthquake (7–14° rms, last column), because an azimuthal equidistant map keeps the lines through its centre straight; a flat Earth is one map, not three. The globe's 11.3° is not zero, and the largest single miss is kept: Maule 2010 at SBA in Antarctica, where the P motion comes out almost horizontal (89° from the vertical) and its direction, 83°, against 127° on the globe, changes by over a hundred degrees with the window length.

> **The flat model, stated before the measurement.** What would vindicate the plane: a P wave arriving from the direction of the straight line to the epicentre on one flat map, at all stations and for all earthquakes, as well as from the great-circle direction, even with the map's centre left free, a parameter the globe does not get. The best single map misses 3 times as much as the globe.

> **What this does and does not use.** (1) The epicentres are the ISC's, located with travel-time tables built for a spherical Earth; the measured directions themselves use only the records and the orientation of each sensor from the station metadata. An orientation error would turn every direction at that station by the same angle, globe and flat alike. (2) The amplitudes are scaled by one gain per channel, not by the full instrument response; it is enough for the shapes, which compare components of the same sensor. (3) The classes are a rule of thumb: thresholds on L, on the transverse share and on the flatness of the ellipse. Windows where waves overlap come out grey, as they should.

## Seven stations, one earthquake, two geometries [evidence: prediction]

These are real instruments of the Global Seismographic Network at their published coordinates. For each one the table gives the great-circle distance from the Sumatra–Andaman epicentre and the flat map's distance between the same two dots, then turns both into a Rayleigh-wave arrival time. Nothing is fitted: the inputs are seven pairs of coordinates and one wave speed.

**Arrival of the 3.8 km/s surface wave — both distances computed from the same coordinates, neither fitted**

| Station | Δ great circle | Globe: distance | Globe: arrival | Flat map: distance | Flat map: arrival | Disagreement |
| --- | --- | --- | --- | --- | --- | --- |
| **CTAO** · Charters Towers, Australia | 54.7° | 6,083 km | 27 min | 9,609 km | 42 min | **+58%** +15 min |
| **SUR** · Sutherland, South Africa | 79.2° | 8,812 km | 39 min | 14,505 km | 1 h 04 m | **+65%** +25 min |
| **KONO** · Kongsberg, Norway | 85.2° | 9,479 km | 42 min | 10,002 km | 44 min | **+6%** +2 min |
| **SBA** · Scott Base, Antarctica | 89.3° | 9,930 km | 44 min | 17,988 km | 1 h 19 m | **+81%** +35 min |
| **PMSA** · Palmer Station, Antarctica | 116.9° | 12,995 km | 57 min | 26,470 km | 1 h 56 m | **+104%** +59 min |
| **HRV** · Harvard, Massachusetts | 132.8° | 14,764 km | 1 h 05 m | 14,837 km | 1 h 05 m | **+0%** +0 min |
| **ANMO** · Albuquerque, New Mexico | 136.4° | 15,164 km | 1 h 07 m | 15,477 km | 1 h 08 m | **+2%** +1 min |

> **Notice what the flat map gets right.** Some northern stations come out within a few percent — and that is the diagnosis, not a concession. An azimuthal equidistant map is *exact* along every line through its centre, so roughly radial paths are nearly right by construction. The error is zero at the centre and grows towards the rim, exactly as the projection's own distortion formula requires. A flat Earth would have to explain why arrival times are wrong by precisely the amount, and in precisely the pattern, that a projection of a sphere is wrong.

## The ring of silence, and what is inside it

Now the interior. In 1906 Richard Dixon Oldham noticed that past roughly 120° from an epicentre the S waves simply stopped arriving.[1] S waves are shear waves and shear does not propagate in a liquid, so something in the middle of the Earth is molten. In 1913 Beno Gutenberg pinned the top of it near 2,900 km depth using the fact that direct P waves are missing too — not everywhere, but in a band from about 103° to 143°, where the sharp velocity drop at the boundary refracts them downward and away.

The *shape* of that absence is the argument. It is a ring, at a fixed angular distance, in every azimuth, around every epicentre on the planet. A sphere with a concentric liquid ball inside produces exactly that, and produces it automatically. A disc has no mechanism that makes stations fall silent at 103° in every direction and start talking again at 143°, because on a disc there is no single angular distance that means the same thing in all directions.

And in 1936 Inge Lehmann found faint P arrivals *inside* the silent band and explained them with a solid ball at the centre of the molten one — the inner core, discovered by taking a shadow seriously.[10]

*[Figure: An ideal globe turning, with one epicentre fixed on it: every point coloured by its angle from the epicentre, green where direct P arrives (under 103 degrees), orange in the shadow (103 to 143 degrees), violet where PKP comes back through the core (beyond 143 degrees)]*

*Figure caption:* **Why the shadow has the width it has.** A cross-section with P-wave paths leaving one epicentre at a range of take-off angles. Rays that stay in the mantle bend back upward as velocity rises with depth and surface out to about 103°. Rays that reach the core are refracted sharply downward by the velocity drop and re-emerge only past about 143°. Between the two, nothing. S waves cannot enter the liquid at all, so their shadow runs from 103° all the way round to the antipode. Layer radii are PREM's and are drawn to scale: core–mantle boundary at 3,480 km radius, inner core at 1,221 km.[4] On the right, what that gives at the surface: an ideal globe with one epicentre, turning, each point coloured by the wave it receives. No data here; the same colours are filled with real stations further down. Click to pause.

**The interior, and the observation each boundary was read off — radii from PREM**

| Boundary | Depth | Radius | Fraction of R | What gave it away |
| --- | --- | --- | --- | --- |
| Mohorovičić discontinuity (crust → mantle) | 24.4 km | 6,346.6 km | 0.996 | A near P arrival that overtakes the direct one — Mohorovičić, 1909 |
| Transition zone top (410 km) | 410 km | 5,961 km | 0.936 | Reflected and converted phases at regional distance |
| Transition zone base (660 km) | 660 km | 5,711 km | 0.896 | The same, and the depth limit of ordinary earthquakes |
| Core–mantle boundary (Gutenberg) | 2,891 km | 3,480 km | 0.546 | No S beyond 103°, no direct P from 103° to 143° — Oldham 1906, Gutenberg 1913 |
| Inner core boundary (Lehmann) | 5,149.5 km | 1,221.5 km | 0.192 | Faint P arrivals inside the shadow zone — Lehmann, 1936 |
| Centre | 6,371 km | 0 km | 0.000 | Where the antipodal PKIKP paths all cross |

## The wave that keeps going round [evidence: prediction]

A large earthquake does not send its surface wave past you once. The pulse travels both ways round the great circle, so a single station records the short way (R1), then the long way (R2), then the short way again after one complete extra lap (R3), then R4, and for the very greatest earthquakes further still. Loma Prieta in 1989, a merely magnitude-6.9 event, produced clean R1, R2 and R3 across the global network.[2]

$$t(R_3) - t(R_1) = \frac{2\pi R}{v} \approx \frac{40,030\ \text{km}}{3.8\ \text{km}\,\text{s}^{-1}} \approx 2\,\text{h}\ 56\,\text{m}$$

R3 has covered one entire extra circumference relative to R1, so the gap between them at a single station measures the circumference of the Earth directly, assuming nothing about where anything is. Do it at a second station and you get the same number. Do it for an earthquake on the other side of the planet and you get it again. This may be the strongest single item on the tab, because it does not merely say the surface is curved — it says the surface is *closed*, with no edge for the wave to reflect from, and with the same circumference measured in every direction. A disc with a rim would return an echo whose delay depended on which way the wave set off. Nobody has ever recorded one.

Watch the northern stations agree almost exactly while the southern ones drift apart by the better part of an hour. That gradient — error growing with southern latitude rather than scattering at random — is the fingerprint of a projection, and it is the same gradient for every earthquake regardless of where it starts.

## And then the whole thing rings

Past about magnitude 8.5, the surface waves lap the planet often enough to interfere with themselves and the Earth begins to resonate as one body, like a struck bell. The gravest tones are ₀S₂, in which the planet alternates between a rugby ball and a doorstop with a period near 54 minutes, and ₀S₀, the breathing mode, in which the whole sphere expands and contracts together every 20.5 minutes. After the 2004 Sumatra–Andaman earthquake these were recorded on seismometers and superconducting gravimeters around the world.[3]

A resonance is the sharpest kind of shape measurement there is, because the tones of a body depend on its size, its shape and its density profile and on nothing else. The observed list of hundreds of mode frequencies is what pins down the radial density model in the first place[4] — and the fact that a *radial* model, a function of depth alone, reproduces them is a statement of spherical symmetry that nothing on a disc has a counterpart for.

A disc has no fundamental tone at 54 minutes. It has no fundamental tone at all until you say where its edge is, and then the tone tells you where the edge is, and no such tone has ever been recorded.

## Four objections, and what the data says back

### 1. "Seismologists assume a spherical Earth in their software, so of course they get one out."

The model is assumed and then *tested*, which is a different thing, and the test is unforgiving. A location computed from four stations predicts the arrival time at the fifth; a wrong Earth model shows up as residuals that will not go away. Reference models are fitted to millions of catalogued arrival times and their residuals sit at the level of seconds against travel times of twenty minutes.[5] If the surface metric were wrong by the 60–100% the flat map needs in the southern hemisphere, no such model could exist at all — and what you would notice first is earthquakes being located in the wrong place, which the ruptured ground and the tsunami arrival times would immediately contradict.

### 2. "The agencies could be coordinating."

Data centres in the United States, France, Germany, Japan, Switzerland, New Zealand, Turkey, Italy, Canada, Greece, Taiwan and Spain all serve raw traces through the same open FDSN protocol, and ObsPy will pull from any of them with a one-line change of hostname.[6] Add a few thousand hobbyist Raspberry Shake instruments in private houses streaming to a public archive that speaks the same protocol.[9] Coordination is not really the obstacle; the obstacle is that you can download a Norwegian trace and an Antarctic trace of the same earthquake in one script and compare them yourself in an afternoon.

### 3. "The waves could travel at different speeds in different directions."

They do vary a little — that variation is an entire discipline called seismic tomography, and it amounts to a few percent. To rescue the flat map you would need the surface wave to run at 3.8 km/s towards Norway and about 7.7 km/s towards the Antarctic Peninsula from the same earthquake, and then to change its mind about which direction is which as soon as the earthquake happens somewhere else, because the required factor depends on the epicentre. A speed field that has to be recomputed for every source is not a speed field. It is the distances that are wrong, and only one arrangement of the distances is consistent across all sources at once.

### 4. "Nobody can check any of this without a laboratory."

This is the objection the tab most wants to lose. Every trace referred to here is free, most of it available within minutes of the event, and the tooling is a Python package.[7] There is a point-and-click route for anyone who would rather not write code.[8] A hundred-euro seismometer in a spare room records earthquakes from the far side of the planet and joins the same open network you are downloading from. The experiment below is not a thought experiment.

Experiment 1e · seismology

Download one earthquake and plot the travel-time curve yourself

Pick any magnitude 7.5 or greater event from the last twenty years. Ask a data centre for the vertical component at ten or twelve stations spread between 20° and 160° away, band-pass between 100 and 200 seconds so that only the long-period surface wave survives, and read off the time of the peak of the wave packet at each. Plot that time against great-circle distance, then against flat-map distance. One of those two plots is a straight line through the origin and the other is a shotgun pattern. You will know which within a minute of the plot appearing, and you will not have taken anybody's word for anything.

Independent variable
**What you change:** the **station**, and therefore its distance from the epicentre. Spread them over as much of the range as you can, and make sure several are in the southern hemisphere — that is where the two models separate.

Dependent variable
**What you measure:** the **arrival time** of the filtered surface-wave peak, relative to the origin time in the event catalogue. Nothing else — no amplitudes, no instrument response, no modelling.

Great-circle separation Δ = **116.87°**
Globe: **12,995 km** → surface wave at **57 min** after origin time
Flat map: **26,470 km** → surface wave at **1 h 56 m**
Disagreement **+104%** in distance, **+59 min** in arrival time

**This pair is diagnostic.** The two models disagree by 59 min on a single arrival — far beyond any picking error, any dispersion correction and any plausible variation in wave speed. One trace from this station settles it, and the trace is free. Note which way it goes: the flat map puts the station further away than the sphere does, so it predicts an arrival late by that much.

Experiment 1e-b · the ring of silence

Ask whether a wave arrived at all — a yes/no test, in a browser, with no code

Experiment 1e above fits a line and reads its slope. This one asks a blunter question, and needs less: **did the wave arrive, or did it not?** Pick a single magnitude 7 or larger event from the catalogue[11] and request the vertical component at five stations spread across the distance range — say near 60°, 95°, 120°, 135° and 155° from the epicentre. Point-and-click will do it; the event-oriented request tool[8] picks the event on a map and the stations by distance band, and hands you the traces. Then look at each record at the time direct P is due. You are not measuring anything. You are answering five yes/no questions.

Independent variable
**What you change:** the station's **angular distance Δ** from the epicentre — nothing else. Then, for the version that matters most, keep Δ near 120° and change the **azimuth** instead: pick stations in that band on opposite sides of the epicentre, and ask the same question again.

Dependent variable
**What you measure:** the **presence or absence** of a sharp P onset at the predicted time. Not its amplitude, not its polarity, not a corrected magnitude. One bit per station, as in Experiment 6b on the solar tab, and for the same reason: a bit cannot be fudged by a calibration.

**Hold constant:** one event, one component, the same window relative to the catalogue origin time, and the same display gain — a shadow is easy to manufacture by turning the gain down. Prefer a shallow event; a deep one shifts the edges of the band by degrees.
**Kit:** a browser. Experiment 1e wants a Python install; this one does not, which is the only reason it is listed separately.
**The tells, stated in advance:** a crisp impulsive P out to about **103°**; between 103° and about **143°** no impulsive P at the time it is due; and beyond 143° P returns — but late, having been refracted down through the liquid core and back. The shape of the absence is the argument: it is a **ring**, at a fixed angular distance, in every azimuth, around every epicentre on the planet. Move the earthquake and the ring moves with it.
**What a flat model would need.** Not a shadow somewhere — a shadow at one fixed *angular* radius in all directions at once, recentring itself on each new epicentre, and letting the wave back in past a second fixed radius, later than a straight path allows. There is no arrangement of layers in a slab that does this; there is one arrangement of a sphere with a low-velocity core that does it without adjustment, and it is the arrangement Gutenberg published in 1913[12].

**The honest caveat, before the verdict.** The band is not literally silent, and this page will not pretend otherwise. Weak long-period energy diffracts around the core boundary, and faint arrivals do appear inside the band — that is precisely what Lehmann took seriously in 1936 when she deduced the inner core from them[10]. So the test is not "no signal at all"; it is **no sharp, impulsive, high-frequency P at the predicted arrival time**, against an unmistakable one at 95°.
**The verdict rule, symmetric.** The globe fails if a station at 120° records a crisp on-time P as sharp as the one at 95°, or if the quiet band sits at a fixed distance in kilometres rather than in degrees, or if it appears in some azimuths and not others. The flat model fails if the silence closes into a ring at one angular radius, recentres on every new epicentre, and gives the wave back late beyond 143°.

## The reverse-engineering, done for real [evidence: check — Where the radius enters: the wave speeds were established with distances measured on the globe.]

Experiment 1e above is a recipe for redoing this measurement yourself: download one earthquake, keep the surface wave, read off arrival times, and plot them against distance both ways. This section is that recipe already carried out — not on numbers this page computed, but on 479 real Rayleigh-wave (LR) arrivals picked by real seismograph networks for nine real earthquakes between 2004 and 2022, pulled from the same public bulletin Experiment 1e's tooling talks to.[13] Every row is one instrument's own reading of its own trace.

$$R = \dfrac{v\,t}{\Delta}$$
Δ = great-circle angle from the published coordinates (seisDelta) — never ISC's own printed distance, which could hide whatever radius its software already assumes
$$v \approx 3.5\ \text{km}/\text{s}$$

Nothing here is fitted to land near 6,371 km: t is a real clock-to-clock arrival time, Δ comes from coordinates the same way seisDelta() computes it everywhere else on this tab, and v is a round textbook figure for this wave band, fixed before looking at the answer.[14] Picking v from the result, or quietly dropping the earthquakes that disagree, would make the whole exercise circular — neither is done here.

- 479 real Rayleigh arrivals, 9 earthquakesmedian **6,910 km** · +8.5 %true radius 6,371 km

*Figure caption:* **Nine box plots: nine real earthquakes, then all 479 arrivals combined.** Same convention as the surveying tab's box plot — box between the quartiles, bar at the median, whiskers to 1.5 interquartile ranges, dots past them — with 6,371 km drawn as a vertical line. Every box lands within a few thousand kilometres of that line on the first try, with nothing fitted; none goes anywhere near the infinity a flat map would need.

**The same boxes as numbers — median radius, interquartile range, and departure from 6,371 km**

| Earthquake | n | Median R | Quartiles | Off 6,371 km |
| --- | --- | --- | --- | --- |
| Sumatra 2004 | 19 | **7,646 km** | 6,619–8,065 km | +20.0% |
| Nias 2005 | 37 | **7,280 km** | 6,700–7,838 km | +14.3% |
| Tōhoku 2011 | 81 | **7,342 km** | 6,619–7,789 km | +15.2% |
| Maule 2010 | 54 | **6,095 km** | 5,668–6,980 km | −4.3% |
| Illapel 2015 | 46 | **6,638 km** | 5,902–7,220 km | +4.2% |
| Solomon 2013 | 59 | **6,847 km** | 6,499–7,067 km | +7.5% |
| Alaska 2021 | 146 | **6,737 km** | 5,520–7,623 km | +5.7% |
| Kuril 2006 | 32 | **7,817 km** | 7,015–8,035 km | +22.7% |
| Tonga 2022 | 5 | **6,109 km** | 6,106–6,438 km | −4.1% |
| **all 9 combined** | 479 | **6,910 km** | 5,883–7,616 km | +8.5% |

> **This box is wider than the others on this page, and that is expected.** A few percent of median offset and about a quarter of the range in spread is real crustal heterogeneity: Rayleigh waves at 18–22 s run measurably faster under ocean basins than under continents, and these paths mix both.[15] Other agencies' picks, or purely teleseismic distances, do not tighten it — the spread is in the wave, not in the bookkeeping. It is far below the 60–100% a flat map would need. Real data with its honest scatter, landing in the right place without being tuned to, is worth more than a perfect line computed from the model under test.

## Correcting for where the wave actually travelled [evidence: check — Where the radius enters: the wave speeds were established with distances measured on the globe.]

The cause named above is testable, not just citable. A 20 s wave samples the top of the mantle under thin oceanic crust but stays inside the thicker, slower crust under a continent. For each of the 479 paths, the fraction of the great-circle route over open ocean can be measured from real coastlines, and one global oceanic and one global continental group velocity, both published independently from the same ISC data family as these arrivals,[16] blended by that fraction — *before* looking at any radius, so the correction stays as non-circular as the raw version.

$$v_{\text{path}} = f_{\text{ocean}}\,v_{\text{ocean}} + (1-f_{\text{ocean}})\,v_{\text{cont}}$$
$$v_{\text{ocean}} \approx 3.6\ \text{km}/\text{s}$$
f_ocean = share of the real great-circle path over open ocean, sampled every ~0.5° against real coastline polygons[17] — not the simplified map coastline drawn elsewhere on this site

Two numbers, not 479: v_ocean and v_continent are fixed once, from someone else's independent tomography of the same ISC dataset family, before any radius here is computed. What varies path by path is f_ocean, a purely geometric fact about where the great circle actually goes — it is not a free parameter tuned to this result any more than the coastlines themselves are.

- 479 real Rayleigh arrivals, 9 earthquakesmedian **6,675 km** · +4.8 %true radius 6,371 km

*Figure caption:* **The same 479 arrivals, same nine earthquakes, only the velocity now varies path by path.** Same convention: box between the quartiles, bar at the median, whiskers to 1.5 interquartile ranges, 6,371 km as a vertical line. Compare directly against the box plot above — every box should sit measurably closer to the line.

**The corrected boxes as numbers — compare each row against the same row in the uncorrected table above**

| Earthquake | n | Median R | Quartiles | Off 6,371 km |
| --- | --- | --- | --- | --- |
| Sumatra 2004 | 19 | **6,930 km** | 6,105–7,299 km | +8.8% |
| Nias 2005 | 37 | **6,922 km** | 6,608–7,300 km | +8.6% |
| Tōhoku 2011 | 81 | **6,795 km** | 6,379–7,040 km | +6.7% |
| Maule 2010 | 54 | **6,147 km** | 5,370–6,486 km | −3.5% |
| Illapel 2015 | 46 | **6,391 km** | 6,049–6,727 km | +0.3% |
| Solomon 2013 | 59 | **6,739 km** | 6,607–6,926 km | +5.8% |
| Alaska 2021 | 146 | **6,499 km** | 5,610–7,146 km | +2.0% |
| Kuril 2006 | 32 | **7,081 km** | 6,895–7,431 km | +11.1% |
| Tonga 2022 | 5 | **6,266 km** | 6,011–6,599 km | −1.7% |
| **all 9 combined** | 479 | **6,675 km** | 5,830–7,041 km | +4.8% |

The same reconstruction on every Rayleigh arrival of the large sample of the relocation section further down: 261 earthquakes, 13,586 arrivals. The epicentre and origin time come from the ISC as above, with the same 3.5 km/s and the same path correction. They are shown in a box of their own, apart from the nine above.

- 13,586 arrivals, 261 earthquakesmedian 6,989 km (+9.7 %), path-corrected 6,654 km (+4.4 %)true radius 6,371 km

*Figure caption:* **13,586 arrivals of 261 earthquakes, 2000–2023.** Same convention as above: box between the quartiles, bar at the median, whiskers to 1.5 interquartile ranges. The 11 arrivals beyond the whiskers are not drawn. Rows 1 and 2: every arrival, with 3.5 km/s, then with the ocean/continent speed. Rows 3 and 4: one median per earthquake with five arrivals or more, the same two ways.

Every arrival together gives a median of 6,989 km (+9.7 %), and 6,654 km (+4.4 %) once the path is corrected; the nine above gave 6,910 km (+8.5 %) and 6,675 km (+4.8 %). The medians of the 258 earthquakes give 6,939 km (+8.9 %) and 6,637 km (+4.2 %). The box is somewhat narrower than the nine's, quartiles 6,230–7,561 km against 5,883–7,616 km (6,200–6,985 against 5,830–7,041 corrected), but not 5 times narrower, as it would be if its width came from too few readings: most of it is the wave's own dispersion, which more data does not remove. The excess over 6,371 km is about the same with nine earthquakes or 261: it belongs to the method, one round speed (or two, once corrected) for a wave whose speed varies, not to the choice of earthquakes.

> **Narrower, not perfect — as a real correction should be.** An ocean/continent split is a coarse model: real crust varies with age, thickness and temperature, so dispersion is not fully removed. What the tightening shows is that the residual pointed at a real, independently measurable cause, not at a mistake: had it been a bug, a geometric fact unrelated to the data — how much of a path crosses ocean — would have had no reason to correlate with the error. It does.

## The opening argument again, one real earthquake at a time [evidence: check — Where the radius enters: the wave speeds were established with distances measured on the globe.]

The first figure on this tab makes one claim: arrival time and distance sit on one straight line through the origin, at the true wave speed. Here it is on real data, one earthquake at a time (selector below): each real arrival is plotted *twice* at its real recorded time — at its great-circle distance, and at the flat map's distance for the same two coordinates, joined by a thin line. A plain least-squares line is fitted through the great-circle cloud alone, with nothing assumed about the speed, and compared with the constant-speed line, distance ÷ 3.5 km/s. Nothing is tuned to land near that line; the fit only ever sees the cloud.

- Sumatra 2004fitted from the cloud alone: **3.06 km/s** · n=19speed line: 3.50 km/sits own flat map claims ~10 % more distance, on average

*Figure caption:* **The gap between each pair of dots is the whole argument.** The dark, great-circle dots should sit close to the speed line if 3.5 km/s is roughly right; the orange, flat-map dots sit wherever that earthquake's own map distortion puts them, with no line of their own to explain them away. The fitted black line ignores all of that — it only ever sees the dark dots' own cloud.

> **Switch to Tonga 2022 and the fit gets noisy — as it should.** With 5 real points a least-squares line has little to average, so its speed can land well off the line; with 146 (Alaska 2021) it sits almost on it. Pooled over all nine earthquakes (479 rows) it lands close to the speed line — the box plot above gives the number — and no single small earthquake is asked to carry that claim.

## The projection's fingerprint, confirmed on real clocks [evidence: check — Where the radius enters: the wave speeds were established with distances measured on the globe.]

The R1/R2/R3 section above noted that northern stations agree almost exactly with the globe while southern ones drift by the better part of an hour, and called that gradient the signature of a projection. Here it is measured on the same 479 real arrivals. For each, two residuals are computed against the SAME recorded time, never against each other: the globe's (great-circle distance ÷ 3.5 km/s, minus the real time) and the flat map's (its distance ÷ 3.5 km/s, minus the real time). Both are averaged in 15°-wide bands of station colatitude — degrees from the true North Pole, the flat map's centre — so the horizontal axis is literally the map's radius.

- 479 real arrivals, pooledglobe residual stays within ±6.4 min everywhereflat map reaches +68 min near the antipode (165°–180° colatitude)

*Figure caption:* **0° is the north pole, 180° is the south pole — literally where each station sits on the flat map, not just its latitude.** The dashed line at zero is "predicted the real time exactly." The blue line hugging it everywhere is the globe surviving contact with real seismograph clocks at every distance from the pole. The orange line peeling away with colatitude, reaching most of an hour late near the antipode, is the specific, falsifiable shape a flat map's own distortion has to produce — and does.

> **The globe's line is not exactly zero either — left visible on purpose.** Real Rayleigh dispersion keeps the blue line a few minutes off zero in places, with no trend across colatitude: the honest cost of one round velocity for every path. The orange line's residual is another kind of thing: it grows by a predictable amount with colatitude, in all nine earthquakes, because it is not noise — it is the map's own distortion formula.

## Doing it ourselves: no catalogue location, no radius [evidence: check — Where the radius enters: no radius and no travel-time table in the fits, but the readings used are those the ISC names "P", a name it gives by comparing each arrival with a travel-time table built on a spherical Earth. A label-free check (the first reported arrival at each station) gives the same verdict.]

Everything above takes each earthquake's epicentre and origin time from the ISC.[1] The ISC finds them with a model of seismic speeds inside a spherical Earth of known radius. None of that is used here. Only what a station records is kept: the time a wave arrived, and the station's latitude and longitude, taken as angles. The earthquake's centre is then found as the centre of a circle that grows at a speed that is not known in advance.

The P wave, the first to arrive, is read to about a second. Its travel time does not grow in proportion to distance, because it dives through the Earth. A travel-time table would fix that, but a table is a model of the Earth. So each geometry gets the same free curve instead: time as a polynomial of degree three in the distance. On the globe the distance is the great-circle angle from the centre. On the flat map it is the distance on the disc, in the map's own degrees. Each model has six free numbers: the centre (two) and the curve (four). Only stations between 25° and 95° from the fitted centre are used, and readings more than three standard deviations from the others are set aside, one at a time.

$$t_i = c_0 + c_1 u_i + c_2 u_i^2 + c_3 u_i^3, \qquad u_i = \dfrac{\delta_i}{100}$$
δᵢ: on the globe, the great-circle angle from the centre to station i; on the flat map, the straight distance on the disc (degrees). Centre and c₀…c₃ are fitted to the arrival times, nothing else.

If the Earth is a sphere, every arrival should depend on one number only, its station's angle from the centre, and fall on one smooth curve. If it is the flat-earth map, the same should be true of the straight distance on the disc. Both models get the same freedom. The question is which distance the real clocks agree with. The constant c₀ is not the origin time: the curve, fitted between 25° and 95°, does not extrapolate to zero distance, and its c₀ comes out about a minute late.

Nine earthquakes are few. So the same method is run on every earthquake that meets a rule fixed before looking: in the reviewed ISC Bulletin,[1] from 2000 to 2023, moment magnitude 7.0 or more (Global CMT) and no deeper than 70 km. That gives 262 earthquakes; the 261 with at least 50 P stations between 25° and 95° from our own centre are kept, 199,421 P arrivals in all. None of them is offered in the menus below: they are there for the totals. And with this many earthquakes the test can be made stricter, because a wave obeys one law, not one per earthquake.

$$t_{q,i} = c_{0,q} + c_1 u_{q,i} + c_2 u_{q,i}^2 + c_3 u_{q,i}^3$$
q: the earthquake, i: its station. Each earthquake keeps its own centre and its own c₀,q, its origin time, which is not known. c₁, c₂, c₃ are one set for all 261.

This is the stricter test. Above, each earthquake had its own cubic, and the flat model used that freedom to bend its curve the wrong way. Here each model gets one curve for every earthquake. It is fitted by turns: the centres and origin times with the curve held, then the curve with the centres held, until nothing moves. The depth limit is what makes one curve fair. Above 70 km, an earthquake's depth shifts its arrival times by about a constant, and c₀,q absorbs it.

- 261 earthquakes, 199,421 P stationsglobe: 1.3 s (one curve for all), 1.3 s (a curve each)best flat map: 19.0 s, 15.9 s · North Pole map: 24.5 s, 23.7 s

*[Figure: The share of every P station of every earthquake by how far its real time is from the common curve: a narrow peak for the globe, a wide spread for the flat maps]*

*Figure caption:* **Every station of every earthquake, one curve for all.** The share of the P stations by how far their real arrival time is from the curve's time, in one-second bins. Teal: the globe, distances along the great circle. Orange: the best single flat map found, distances on the disc; dashed: the North Pole map. The globe's stations pile up within a couple of seconds of zero. The flat maps' spread over tens of seconds. Readings set aside, more than three standard deviations from the others, are not counted.

*[Figure: The residuals of every station against its distance from each model's centre, as a density: the globe on top, the best flat map below]*

*Figure caption:* **The same residuals against distance.** Each cell is 2° by one second, darker where more stations fall. Top: the globe. Bottom: the best flat map. On the globe the band is narrow and level at every distance. On the flat map it is wide, and it bends: the map stretches some paths and squeezes others, and one curve cannot follow both.

*[Figure: One dot per earthquake: the globe's scatter against the best flat map's, on log scales, with the line where they would be equal]*

*Figure caption:* **Earthquake by earthquake.** One dot per earthquake. Across: the globe's scatter for it. Up: the best flat map's. Both use the common curve. A dot on the dashed line would be an earthquake the flat map describes as well as the globe. Black: the eight named earthquakes of this tab; the ninth, Hunga Tonga, was an eruption well below magnitude 7.

**All 261 earthquakes together: scatter of the P times**

| Model | A curve per earthquake | One curve for all | Stations kept | Set aside | Globe better (a curve each) | Globe better (one curve) |
| --- | --- | --- | --- | --- | --- | --- |
| Globe | 1.3 s | 1.3 s | 186,949 | 12,472 |  |  |
| Flat, North Pole map | 23.7 s | 24.5 s | 165,309 | 34,112 | 260 / 261 | 261 / 261 |
| Flat, best single map (53° N 178° E) | 15.9 s | 19.0 s | 167,257 | 32,164 | 259 / 261 | 261 / 261 |

The globe's scatter is 1.25 s with a curve per earthquake and 1.29 s with one curve for all 261. One law serves every earthquake as well as 261 separate curves do. The flat maps cannot say the same. On the North Pole map the scatter goes from 23.7 s to 24.5 s. On the best single map found, centred near 53° N, 178° E, it goes from 15.9 s to 19.0 s, 15 times the globe's. That map is the best of 235 centres scanned with a curve per earthquake, the criterion that favours the plane most. The common curve was then fitted on its five best centres and the best was kept. The globe does better for every one of the 261. The closest are the earthquakes next to the best map's centre, where an azimuthal map distorts least: Alaska 2021, 1.53 s against the globe's 1.48 s. The typical earthquake has a flat scatter 10 times the globe's.

Below, the nine named earthquakes one at a time, each with its own curve, as the method was first built.

Earthquake

*[Figure: For one earthquake, the difference between each station's real P arrival time and the time the fitted curve gives, against its distance from the fitted centre: in the top band for the globe, in the bottom band for the flat-earth map]*

*Figure caption:* **What is left over, station by station.** Each dot is one station's real P arrival time minus the time the fitted curve gives it. Top band: the globe, with distances along the great circle. Bottom band: the flat map centred on the North Pole, with distances on the disc. Each model has its own centre and its own curve, fitted in its favour. Grey: set aside, more than three standard deviations from the others. On the globe the dots lie in a band a few seconds wide. On the flat map they spread into tens of seconds, and they do so in patterns, not at random: the map stretches some directions and squeezes others.

**Nine earthquakes relocated from their arrival times alone**

| Earthquake | P stations kept | Globe: scatter | Relocated centre vs the ISC's | Flat, North Pole map | Flat, its own map | Flat, best single map | Label-free: globe / flat | Surface waves: one lap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sumatra 2004 | 830 | 2.1 s | 0.33° | 12.5 s | 2.1 s | 4.8 s | 2.1 / 10.1 s | 2.17 h |
| Nias 2005 | 813 | 3.0 s | 0.25° | 12.1 s | 3.0 s | 5.8 s | 4.9 / 6.2 s | 2.54 h |
| Tōhoku 2011 | 1630 | 1.8 s | 0.30° | 2.7 s | 1.8 s | 2.5 s | 1.8 / 3.6 s | 2.60 h |
| Maule 2010 | 770 | 0.6 s | 0.91° | 12.7 s | 0.6 s | 2.8 s | 0.6 / 6.3 s | 2.95 h |
| Illapel 2015 | 607 | 1.0 s | 0.45° | 11.5 s | 1.0 s | 20.4 s | 16.9 / 32.3 s | 3.43 h |
| Solomon 2013 | 656 | 1.8 s | 0.26° | 27.4 s | 1.8 s | 7.9 s | 1.9 / 28.1 s | 3.53 h |
| Alaska 2021 | 1585 | 1.5 s | 0.07° | 2.7 s | 1.5 s | 4.6 s | 5.2 / 7.6 s | 2.78 h |
| Kuril 2006 | 1244 | 1.0 s | 0.11° | 1.5 s | 1.0 s | 1.1 s | 1.0 / 1.8 s | 3.45 h |
| Tonga 2022 | 93 | 5.4 s | 0.22° | 47.5 s | 5.4 s | 21.2 s | 1,038.8 / 1,141.6 s | 2.91 h |
| all nine (rms) |  | 1.8 s |  | 12.0 s |  | 7.3 s |  |  |

The relocated centres land between 0.07° and 0.9° from the ISC's, although the ISC's was never used. The globe's scatter is 0.6 to 5.4 seconds, 1.8 seconds over all nine earthquakes. On the flat-earth map the same earthquakes scatter by 1.5 to 47 seconds, 12 seconds over all nine. The closest cases are the Kuril and Alaska earthquakes, close to the North Pole, where that map distorts least. And the plane only reaches its numbers by bending its curve the wrong way. For seven of the nine earthquakes on the North Pole map, and four of the nine on the best single map below, its fitted time falls as the distance grows: the wave would reach farther stations sooner. The globe's curve rises with distance for all nine. The plane is allowed this here, and it still loses. The last column is the surface wave's lap of the Earth in hours, from its angular speed, with no kilometre anywhere: 2.2 to 3.5 hours. Surface-wave readings are only good to a few minutes, so this column is shown, not used.

## One flat map for nine earthquakes [evidence: check — Where the radius enters: no radius and no travel-time table in the fits, but the readings used are those the ISC names "P", a name it gives by comparing each arrival with a travel-time table built on a spherical Earth. A label-free check (the first reported arrival at each station) gives the same verdict.]

The flat model's best case: let it choose its map. An azimuthal equidistant map[18] keeps every distance from its centre exact. On a map centred on an earthquake's epicentre, that earthquake's wave fronts are perfect circles, and the plane describes it exactly as well as the globe does. The table shows it: the column "its own map" matches the globe's. But a flat Earth is one map, not nine. On the map of one earthquake, the fronts of the others are no longer circles. So the plane is offered every centre, on a grid over the whole Earth. For each map, all nine earthquakes are fitted again, each with its own centre and its own curve.

Map Earthquake

*[Figure: An azimuthal equidistant map with a chosen centre, and one earthquake's P wave spreading over it: the true front from the globe, which is a circle only on the map centred on that earthquake, and the flat model's best circle on this map, with the stations lighting up at their real arrival times]*

- globe: 2.1 s for this earthquake, 1.8 s for all ninethis flat map: 12.5 s for this earthquake, 12.0 s for all nine

*Figure caption:* **Choose the flat model's map, then choose the earthquake.** Solid teal: the true front of the P wave. It is drawn from the globe fit, at a constant great-circle angle from the centre, and projected onto this map. Dashed orange: the flat model's best front on this map, around its own fitted centre. Sometimes there are two or three circles at once: on most maps the plane's best curve is not increasing, so the same instant falls at several distances. Stations light up at their real arrival time. On the map centred on the earthquake shown, the two fronts coincide. Choose another earthquake on the same map and they part: the true front is no longer a circle, and the stations stop lighting up on the orange line. The continents are Natural Earth's{ref(26)}. Click to pause.

*[Figure: A world map in plate carrée where each cell is coloured by the flat model's scatter for all nine earthquakes when the flat map is centred there; the best cell, in north-east Asia, is circled, and the nine epicentres are marked]*

*Figure caption:* **Where the flat map could be centred, and what each choice costs.** Each cell is one possible centre for the flat map, on a 20° grid with finer points around the best one. Its colour is the scatter of all nine earthquakes refitted on that map, from the globe's value (palest) to the worst (darkest). The best single map is centred near 58° N 141° E, by the Sea of Okhotsk, north of the Kuril and Japanese earthquakes. There it reaches 7.3 seconds, four times the globe's 1.8, and it gets there by sacrificing the Illapel and Tonga earthquakes, at about 20 seconds each. Maps centred on one of the nine epicentres are worse still for the other eight: 12 to 49 seconds.

> **The flat model, given every map, still fails, and the verdict was stated before the fit.** What would have vindicated the plane: one flat map fitting all nine earthquakes as well as the globe, with the same number of free parameters. The best map found misses by a factor of four. The North Pole map that flat-earth sources publish misses by a factor of almost seven. The globe needs no choice at all: one sphere, nine centres, nine curves, 1.8 seconds.

> **What this cannot do, and where a model still enters.** (1) No radius comes out. A speed in kilometres per second would need a distance in kilometres between stations, and that distance is taken from their coordinates with the Earth's radius. So the radius of this tab stays the check above. (2) The readings used are those the ISC names "P". The ISC gives that name by comparing each arrival with a travel-time table built on a spherical Earth, so the choice of readings, though not their times, leans on a model. Hence the label on this section. As a check, the last-but-one column of the table drops the names and keeps the first arrival reported at each station. That data is noisier, and for the Nias and Tonga earthquakes stray readings pull the centre far off. But the globe still beats the flat map for all nine. (3) The cubic curve is a convenience. It is the same for both models, which is what makes the comparison fair, but it is not physics.

## The ring of silence, station by station [evidence: check — Where the radius enters: the stations' coordinates come from maps, and the phase names (P, Pdif, PKP) are the ISC's, given by comparing each reading with the ak135 travel-time tables built for a spherical Earth.]

Experiment 1e-b above asks one bit per station: did a direct P wave arrive, or not? The bulletin already answers it for thousands of stations. For the same nine earthquakes, every station is put in one of three groups by the phases the ISC reports for it[13]: a direct P wave, the wave that went straight through the mantle; only P_dif, the weak wave bent along the core; or only PKP, the wave that came back through the core. That makes 12,822 stations: 9,573 with a direct P, 1,364 with P_dif only, 1,885 with PKP only.

On the globe the rule has no free number. Direct P is seen out to 103° from the epicentre and not beyond, because the core is in the way[1][12]. Here Δ is the great-circle angle between the published coordinates. On a flat map the steel-man is generous. The map is an azimuthal equidistant map[18] with any centre, the shadow is a disc around the epicentre, and its radius ρ is fitted to the stations, while the globe's 103° is not. A map centred on an earthquake gives that earthquake exactly the globe's distances, so it fits that earthquake perfectly. A flat Earth is one map, though, and its waves obey one law. So the real test is one map and one ring for all nine.

First, the same rule on every earthquake of the large sample of the relocation section: 261 earthquakes with at least 50 classed stations, 368,987 stations in all. Here it is clearest on one axis: the share of stations that reported a direct P, by distance from the epicentre. On the globe that share should drop to zero at one angle, the same for every earthquake. On a flat map it should drop at one distance on the disc.

- 261 earthquakes, 368,987 stationsglobe, 103° (no fit): 14,280 wrong · one ring for all (98.8°): 3,764best flat map, one ring: 24,575 wrong · North Pole map: 25,866 · one ring per earthquake: 14,833

*[Figure: The share of stations that reported a direct P by distance from the epicentre, for every station of every earthquake: the globe's angle on top, the distance on the best flat map below]*

*Figure caption:* **368,987 stations of 261 earthquakes on one axis.** Each bar is 2° wide. Its height is the share of the stations at that distance that reported a direct P, paler where there are fewer stations. Top: the globe's angle from the published epicentre. The share stays near 100 % out to about 97° and falls to almost nothing past 103°, for all the earthquakes at once. Bottom: the same stations on the best flat map for one ring, centred near 76° N, 166° E, with distances on the disc. The step is smeared: on that map the same edge falls at a different distance for each earthquake, and for each direction from it.

Counted as below, as stations on the wrong side of the ring. The globe's 103° gets 14,280 of 368,987 wrong, and one ring for all at 98.8° leaves 3,764. Between 97° and 103° the ISC names most arrivals P_dif, which is why the globe's best ring sits a few degrees inside the textbook 103°. The North Pole map with its best ring (110°) leaves 25,866. The best of all map centres, near 76° N, 166° E, leaves 24,575, 7 times the globe's best ring, although its ring is fitted too. With one ring per earthquake on one shared map, 261 free numbers against the globe's one, the best map (near 62° N, 160° E) leaves 14,833. That is still more than the globe's textbook 103°, which fits nothing.

Below, the nine named earthquakes, one at a time and on any map.

Map Earthquake

*[Figure: The globe seen from far away, turned towards the earthquake's shadow: every point coloured by its angle from the epicentre, green where direct P arrives (under 103 degrees), orange in the shadow (103 to 143 degrees), violet where PKP comes back through the core (beyond 143 degrees), with the earthquake's real stations on top]*

*[Figure: An azimuthal equidistant map with a chosen centre and one earthquake's stations, coloured by the P phases the bulletin gives them; the globe's shadow ring, 103 to 143 degrees from the epicentre, projected on the map; the flat model's best ring on this map, a circle around the epicentre; stations on the wrong side of the flat ring are crossed]*

- Globe, 103° (nothing fitted): 31 of 1,250 stations on the wrong side · this map, best ring for this quake (ρ = 109.5°): 45 · one ring for the nine on this map (ρ = 110.4°): 631 of 12,822 wrong

*Figure caption:* **Left, the globe; right, the map you choose.** The globe is seen from far away and turned towards this earthquake's shadow. Each point is coloured by its angle from the epicentre, and the stations sit on the band their reports put them in. On the right, the same stations on an azimuthal equidistant map. The globe's shadow is projected onto it, so it is a circle only on the map centred on that earthquake. The flat model draws its own best ring around the epicentre. The globe's errors are counted in the line above the key. Continents: Natural Earth[19].

**Stations on the wrong side of the ring: the globe, then flat maps**

| Earthquake | Stations | Direct P | Globe, 103° (no fit) | Globe, best ring | Flat, its own map | Flat, North Pole map | Flat, best single map |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sumatra 2004 | 1,250 | 979 | 31 | 10 (96.9°) | 10 | 45 | 34 |
| Nias 2005 | 1,254 | 930 | 48 | 8 (98.5°) | 8 | 76 | 54 |
| Tōhoku 2011 | 1,962 | 1,803 | 39 | 4 (96.9°) | 4 | 20 | 28 |
| Maule 2010 | 1,664 | 978 | 21 | 4 (97.6°) | 4 | 134 | 143 |
| Illapel 2015 | 1,394 | 753 | 30 | 0 (98.5°) | 0 | 132 | 138 |
| Solomon 2013 | 1,618 | 728 | 23 | 5 (99.0°) | 5 | 36 | 41 |
| Alaska 2021 | 2,087 | 1,901 | 66 | 8 (97.4°) | 8 | 30 | 38 |
| Kuril 2006 | 1,436 | 1,387 | 11 | 3 (94.9°) | 3 | 3 | 3 |
| Tonga 2022 | 157 | 114 | 0 | 0 (103.2°) | 0 | 2 | 5 |
| **All nine, one ring** | 12,822 | 9,573 | **269** | **53** (97.1°) | — | **631** | **606** |

Each column counts the stations a ring puts on the wrong side: a direct P outside the ring, or none inside. The globe's textbook 103° gets 269 of 12,822 wrong. Most of them sit between 97° and 103°, where the ISC already names the arrival P_dif; one ring at 97.1° for all nine leaves 53. Each earthquake on its own map does exactly as well as the globe, as it must. In the last row each flat map gets one ring for all nine. The North Pole map leaves 631 wrong, at ρ = 110.4°, and the best of all map centres (72° N, 100.5° E) leaves 606. Even allowing each earthquake its own ring on one shared map, the best map leaves 449. On the map of one earthquake, a single ring fails the others. On the Maule or Illapel map no ring does better than none: 3,249 wrong, every station without a direct P. The Kuril map, the best of the nine, still leaves 735.

> **The flat model, stated before the count.** What would vindicate the plane: one flat map on which one ring around each epicentre separates the stations that got a direct P from those that did not, as well as the globe's single angle does. The globe, with one number for all nine earthquakes (97.1°), misplaces 53 stations. The best flat map, with three numbers (its centre and its ring), misplaces 606, eleven times as many. With nine rings it still misplaces 449. The share of stations classed right looks close, 99.6 % against 95.3 %. That is only because most stations are far from any edge, and every model gets those right.

> **Where the globe enters, and what this does not show.** (1) The phase names are the ISC's. Its analysts and its locator name each reading by comparing it with the ak135 travel-time tables[5], which are built for a spherical Earth. A reading that would be called P on the globe could, in principle, be called something else on another model. The station coordinates come from maps. This section is therefore a check, not a measurement. (2) The groups are about what was reported, not what was recorded. A station that saw nothing usually reports nothing and is absent, so the shadow shows as a lack of P names, not as silent stations. (3) Inside the shadow there are faint arrivals, P_dif and the inner-core PKiKP. Lehmann found the inner core with them in 1936. Here they count as "no direct P". (4) Hunga Tonga 2022 has only 157 stations, too few to weigh much.

Caveats this page owes you. Three. The Earth is not a perfect sphere and seismologists know it: the ellipticity correction to travel times reaches a couple of seconds, and reference models carry it explicitly. Surface-wave group velocity is not one number but depends on period and on whether the path crosses ocean or continent, at the level of a few percent — which is why the experiment above insists on filtering to one narrow band. And the 3.8 km/s used throughout this tab is a round working value, not a measured constant for any particular path. None of the three comes near the size of what is being argued about here: a few percent against a disagreement that reaches beyond 100%.

The through-line. The Foucault tab measures the angle between your floor and the axis of the world without looking at anything. This one measures the distance between your floor and somebody else's, without looking at anything either — no sightline, no atmosphere, no refraction, nothing for the argument in the refraction tab to attach itself to. And it lands on the same 6,371 km. That is the shape of the whole page: not one decisive measurement, but a dozen unrelated instruments that would all have to be wrong in a mutually consistent way for the answer to be anything else.

**See also**[Gravity](/ai/grav.md)[Distances](/ai/dist.md)[Surveying](/ai/surv.md)[Atmosphere](/ai/atmo.md)

## Does a shape come out of the times alone? [evidence: check — Where the radius enters: what turns the mesh's unit into kilometres is the speed of the law, established with distances measured on the globe; and the readings kept are those the ISC names "P" (compared with a travel-time table built on a spherical Earth), 25–95° from our own relocation, a selection made with a globe fit. The times alone give the shape; this is where the size enters.]

The mesh of flight times in the Aviation tab, with another pure measure. Take the P arrivals of the 261 earthquakes above, at the 138 stations that read at least 120 of them: 19,813 readings, each one a time and nothing else. No epicentre, no station coordinate, no radius, no Earth model. Every earthquake and every station is a free point, on a plane (two numbers each) or in space (three), and the points move until the times fit one law, *t* = *c*_0 + *g*(*u*): *u* the distance between the two points, *c*_0 a free origin time for each earthquake, *g* one free curve for all of them, because deep paths are faster. The unit of length is the one the law starts with: a kilometre never enters.

*[Figure: Animation: stations placed from earthquake P times alone; first as straight-line distances on a plane, which stalls; then from the same start in space, where they settle on a sphere; the lines then drawn as great-circle arcs; the speed of propagation changed, which only changes the size; other speed laws, which keep a sphere; finally the cloud turned onto the real map, with a red dashed arc from each station to its published position]*

- plane (start): 158.1 s rms of the time residuals

*Figure caption:* **The shape comes out of the times, step by step.** One animation in seven steps. 1–2: each time is read as a straight-line distance and everything is forced onto a plane, which gets every freedom and stalls. 3: the same start with one number more per station: space settles. 4: only then are the lines drawn as great-circle arcs, on the sphere the cloud lies on. 5: the speed of propagation, the one input that touched the radius, is changed by ±25 %: the size follows, the shape does not. 6: other speed laws: still a sphere. 7: the check: the cloud is turned (rotation only) onto the real map, which fades in, and a red dashed arc joins each station to its published position; a zoom, at the same scale in every direction, makes those arcs visible. Each dot is a station, coloured by its real latitude, which the fit never reads; the × are the eight earthquakes that read the most stations. Until step 4 the lines are chords, the distance the fit uses. Click to pause.

The plane does not settle: 13.9 s rms of the time residuals, where space settles at 1.4 s, 10 times less. The cloud in space lies on a sphere: its stations stay within 0.4 % of the best sphere's radius. Laid on the real map afterwards (rotation and scale only), the 138 stations sit 0.7° from their published positions, which the fit never read. The shape was in the times. A random start does not find it (in space it stalls at 40 to 50 s); the start used, 104 s off, is the same in the plane and in space: shortest paths through the mesh, then classical MDS[25][26], with no coordinate. The plane is the first two coordinates of that start, space adds the third: that is why the animation goes back to the start before freeing the third dimension. Lifting the settled plane instead stalls between 3 and 6.5 s: the plane has folded the cloud over, and space does not unfold it. The earthquakes' own distance from the centre is not fixed by the times (it moves together with their origin time): they are drawn where the fit leaves them, then slid onto the sphere when the arcs appear. The best rotation onto the map uses the published coordinates: it is part of the check, and turning a cloud changes none of its distances.

Every reading, for the record: with all the 6,951 stations that read at least 5 of the quakes (193,453 readings), each placed by its own times, refitted together and the readings beyond three standard deviations set aside on each surface, space settles at 1.05 s and the plane at 11.8 s; the stations stay within 2.2 % of one radius and sit a median 1.0° from their published positions (1.3° for nine in ten). The shape does not change; the drawing keeps the best-read stations.

The one number that ties the mesh to kilometres is *v*_0, the speed the law starts with. Change it for every distance at once and the cloud keeps its shape and only grows or shrinks: *R* = 100 s × *v*_0 × 5.80 = 580 × *v*_0 km, so the Earth's 6,371 km asks for *v*_0 = 11.0 km/s. That speed was established with distances measured on the globe: it is where the radius enters. Changing the law itself is another matter. With its curvature shifted (faster or slower with distance), or held constant, the refitted cloud is still a sphere (radial scatter at most 5 %) but its radius runs from 3.7 to 8.7 units, and the fit worsens, from 1.4 s to as much as 49 s; a constant speed gives 6.5 s and 4.2 units. The times give the sphere; the speed gives its size. A flat model would be vindicated by a plane that fits these times as well as space does, or by a cloud in space that is not a sphere: neither happens. Limits: a cloud and its mirror image fit equally; stations are identified by their code, so two stations sharing one would be merged; the readings kept are those 25–95° from our own relocation, a selection made with a globe fit; and only the earthquakes above were tried.

## Sources for this tab

1. [1] [1][R. D. Oldham, "The Constitution of the Interior of the Earth, as revealed by Earthquakes", *Quarterly Journal of the Geological Society* 62, 456–475 (1906)](https://doi.org/10.1144/GSL.JGS.1906.062.01-04.21) — the paper that read a molten interior off the missing S arrivals; the first time anybody measured the inside of the planet.
2. [2] [2][L. Braile, *Surface Wave Propagation Around the Earth* (Purdue University)](https://web.ics.purdue.edu/~braile/edumod/surfwav/surfwav.htm) — a record section of the 1989 Loma Prieta earthquake with R1, R2 and R3 labelled and plotted against angular distance, plus the exercise of working out which paths produce them. The multi-orbit evidence in its rawest teaching form.
3. [3] [3][J. Park *et al.*, "Earth's free oscillations excited by the 26 December 2004 Sumatra–Andaman earthquake", *Science* 308, 1139–1144 (2005)](https://doi.org/10.1126/science.1112305) — the whole planet ringing, recorded on the Global Seismographic Network, on GEOSCOPE and on a set of superconducting gravimeters; seventeen authors across a dozen institutions on three continents.
4. [4] [4][A. M. Dziewonski & D. L. Anderson, "Preliminary reference Earth model", *Physics of the Earth and Planetary Interiors* 25, 297–356 (1981)](https://doi.org/10.1016/0031-9201(81)90046-7) — PREM: the radial velocity and density profile every layer radius on this tab is quoted from, derived jointly from body-wave travel times, surface-wave dispersion and free-oscillation frequencies.
5. [5] [5][B. L. N. Kennett, E. R. Engdahl & R. Buland, "Constraints on seismic velocities in the Earth from traveltimes", *Geophysical Journal International* 122, 108–124 (1995)](https://doi.org/10.1111/j.1365-246X.1995.tb03540.x) — the ak135 reference model, fitted to millions of catalogued arrival times, and the source of the residual figures quoted under objection 1.
6. [6] [6][ObsPy, *obspy.clients.fdsn* — FDSN web service client documentation](https://docs.obspy.org/packages/obspy.clients.fdsn.html) — the list of data centres speaking the common protocol, including EARTHSCOPE, GEOFON, INGV, IPGP, GEONET, KOERI, NCEDC, ORFEUS and RASPISHAKE. Switching which country's archive you query means changing one string.
7. [7] [7][EarthScope / NSF SAGE, *Clients and libraries for accessing seismic data*](https://service.iris.edu/clients/) — the entry point for the tooling the experiment card assumes, in Python, Julia, R, MATLAB and plain HTTP.
8. [8] [8][EarthScope, *Wilber 3* — event-oriented waveform request tool](https://ds.iris.edu/ds/nodes/dmc/manuals/wilber-3/) — the point-and-click route: pick an event on a map, pick stations by distance, download the traces.
9. [9] [9][Raspberry Shake](https://raspberryshake.org/) — the hobbyist seismometer whose worldwide network streams into the same open archive; its FDSN endpoint is in the list at source [7] and works with the same three lines of Python.
10. [10] [10]I. Lehmann, "P′", *Publications du Bureau Central Séismologique International*, Série A, Travaux Scientifiques 14, 87–115 (1936) — the discovery of the inner core, from faint P arrivals inside the shadow zone. Cited without a link because no stable open copy exists; the full reference is given so that it can be found in a library. The same applies to C. F. Gauss, *Disquisitiones generales circa superficies curvas* (1827), for the Theorema Egregium.
11. [11] [11][USGS ANSS Comprehensive Catalog (ComCat)](https://earthquake.usgs.gov/earthquakes/search/) and the [Global CMT Project](https://www.globalcmt.org/) — the event catalogues. The point of naming them here is that the earthquake in Experiment 1e-b is *yours*, not one this page picked: search by magnitude and date, take the origin time and epicentre from the catalogue rather than from this page, and the shadow is either there or it is not.
12. [12] [12]B. Gutenberg, "Über die Konstitution des Erdinnern, erschlossen aus Erdbebenbeobachtungen", *Physikalische Zeitschrift* 14, 1217–1218 (1913) — the paper that placed the core–mantle boundary near 2,900 km depth by taking the missing P waves seriously. Cited without a link for the same reason as [10]: no stable open copy exists, so the full reference is given instead.
13. [13] [13][International Seismological Centre, *On-line Bulletin*](https://doi.org/10.31905/D808B830) — the source of the 479 real Rayleigh-wave arrivals in the reverse-engineered radius below: nine real earthquakes, queried through the same ISF phase-data format the FDSN tooling at source [6]/[7] already assumes.
14. [14] [14][P. Bormann & J. W. Dewey (IASPEI Magnitude Working Group), *Summary of Magnitude Working Group Recommendations on Standard Procedures for Determining Earthquake Magnitudes from Digital Data* (2013)](http://www.iaspei.org/commissions/commission-on-seismological-observation-and-interpretation/Summary_WG_recommendations_20130327.pdf) — the Ms₂₀ standard: which phase picks count as a genuine 18–22 s surface-wave arrival and over what distance range (20°–160°), used below as the data-quality filter, not as a source of the velocity itself.
15. [15] [15][P. M. Shearer, *Introduction to Seismology*, ch. 8: Surface Waves and Normal Modes (PDF)](https://www.soest.hawaii.edu/earthsciences_archive/FACULTY/smithkonter/GG631/other/IntroSeis_Shearer_Ch8.pdf) — the dispersion curves behind the round 3.5 km/s used below, and the reason a mixed set of oceanic and continental paths spreads wider than a single path would: group velocity at 18–22 s period depends measurably on the crust it crosses.
16. [16] [16][T. M. Hearn, "Global Rayleigh Wave Attenuation and Group Velocity from International Seismological Centre Data", *Geosciences* 14(2), 50 (2024)](https://doi.org/10.3390/geosciences14020050) — the same ISC bulletin data family as the 479 arrivals above, tomographically imaged at ~20 s period: a global oceanic group velocity around 3.6 km/s, and a continental example (2.97 km/s, South America) the paper endorses as consistent with the same ISC tomography. The ocean/continent correction below uses these two published numbers, not a fit to this tab's own 479 rows.
17. [17] [17][Natural Earth, 1:50m Physical Vectors — Land](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-land/) (public domain) — the real coastline polygons each of the 479 great-circle paths is sampled against (every ~0.5°) to get its ocean fraction, used only for this correction. Not `src/data/coasts.js`, the site's decorative, heavily simplified map coastline, which its own header comment says no claim on this site relies on.
18. [18] [18][J. P. Snyder, *Map Projections — A Working Manual*, USGS Professional Paper 1395 (1987)](https://doi.org/10.3133/pp1395), §25 — the azimuthal equidistant projection for any centre, forward and inverse, used for every flat map on this page (`src/core/aeproj.js`): distances from the centre are true, all others are not.
19. [19] [19][Natural Earth, *1:110m Physical Vectors — Land*](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/) (public domain) — the continents filled on the maps, rasterised on a 0.5° grid (`fog build land`). Decorative: no number depends on it.
20. [20] [20]K. Aki & P. G. Richards, *Quantitative Seismology*, 2nd ed., University Science Books (2002), ch. 4–7 — P and S waves as longitudinal and transverse motions, SV and SH, Love and Rayleigh waves; at the free surface a Rayleigh wave moves the ground on a retrograde ellipse in the vertical plane of the path.
21. [21] [21][E. A. Flinn, "Signal analysis using rectilinearity and direction of particle motion", *Proceedings of the IEEE* 53(12), 1874–1876 (1965)](https://doi.org/10.1109/PROC.1965.4462) — the covariance of the three components over a window, its eigenvalues, the rectilinearity 1 − λ₂/λ₁ and the direction of motion.
22. [22] [22]A. Jurkevics, "Polarization analysis of three-component array data", *Bulletin of the Seismological Society of America* 78(5), 1725–1743 (1988) — the same eigen-analysis applied in sliding windows to tell P, S and surface waves apart and to read the direction of arrival.
23. [23] [23]R. V. Allen, "Automatic earthquake recognition and timing from single traces", *Bulletin of the Seismological Society of America* 68(5), 1521–1532 (1978) — the short-term over long-term average (STA/LTA) used here to find the P onset without any travel time.
24. [24] [24][Albuquerque Seismological Laboratory / USGS, *Global Seismograph Network (GSN – IRIS/USGS)*, network IU](https://doi.org/10.7914/SN/IU), records and channel metadata (orientation and gain of each sensor) from the [EarthScope FDSN web services](https://service.earthscope.org/fdsnws/) — the three-component records of the wave section (`fog fetch|build seis-waves`).
25. [25] [25][J. B. Tenenbaum, V. de Silva & J. C. Langford, “A global geometric framework for nonlinear dimensionality reduction”, *Science* **290**, 2319–2323 (2000)](https://doi.org/10.1126/science.290.5500.2319) — distances between points never measured together taken as shortest paths through a graph of the measured ones (Isomap), the start of the mesh fit.
26. [26] [26]W. S. Torgerson, “Multidimensional scaling: I. Theory and method”, *Psychometrika* **17**, 401–419 (1952) — classical scaling: points in *k* dimensions from a full matrix of distances; and D. P. Kingma & J. Ba, [“Adam: a method for stochastic optimization”](https://arxiv.org/abs/1412.6980), arXiv:1412.6980 (2014), the descent that follows.

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [J. R. Kayal, *Seismic Waves and Earthquake Location* (USGS-hosted lecture notes, PDF)](https://escweb.wr.usgs.gov/share/mooney/SriL.II2.pdf) — P, S, Love and Rayleigh phases, the ray-parameter argument for why rays curve back upward in the mantle, and the standard station-network location procedure referred to under objection 1.
- [USGS — W. D. Mooney, seismology training course materials](https://escweb.wr.usgs.gov/share/mooney/). The full set of lecture notes from which the earthquake-location document cited above is taken, including the travel-time and Earth-structure sessions. Written for training national seismic networks, so it assumes no prior background.
