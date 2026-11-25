# How much of it is hidden?

> Tab "Hidden height" of *Flat plane or Globe?*. Web page: /#tab-hh. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Hidden by the curve · the argument people actually have*

## Diagram: the same target, the two models

*Figure caption:* **One picture, one assumption changed.** Everything under the mark in B is behind the planet. The curvature is drawn far larger than life so the two rays separate on screen, and the violet arc's k is exaggerated to 0.35 for legibility; every number printed by the calculator below is computed from true, un-exaggerated geometry.

Angles are the sharper test, but the argument people actually have on the shore of a lake is blunter: *can you see the bottom of that far building, or not?* The two models answer differently, and not by a few percent. A plane hides **nothing, ever** — a distant object shrinks until your lens or the haze gives up, but its waterline stays in the geometric line of sight at any distance. A globe puts a bulge in the way, and that bulge covers a definite number of metres that you can write down *before* you look — and that shrinks in a definite way when you raise the camera.

*[Figure: Animation: the same scene as the Earth's curvature goes from 100 % to a flat plane, seen from the side and from the observer's eye]*

- hidden on Willis Tower now **180 m**
- globe 180 m k = 0.13 : 155 m
- plane 0 m
- click: pause

*Figure caption:* **Flatten the Earth, and watch the tower come back.** The Willis Tower, 447 m from the lake to the roof, seen from Indiana Dunes beach, eye 2 m above Lake Michigan, 53 km away[12]. On the globe the grazing ray meets it **180 m** up (155 m with standard refraction, k = 0.13): the base is behind the water. As the curvature goes to zero the hidden part shrinks to nothing; on a plane the whole tower stands on the water. The coloured bands are fixed heights 100 m apart: the tower never shrinks, its lower bands simply come back into view. In between, the surface is a larger sphere, never a stretched drawing; the side view's exaggeration is printed.

$$d_0 = R\arccos\left(\frac{R}{R+e}\right) \approx \sqrt{2Re}$$
$$H = R\left(\sec\frac{d-d_0}{R} - 1\right)$$
$$H = 0$$

**e** is your eye height above the water, **d** the distance to the target, **R** the Earth's radius. Light leaves your eye, grazes the surface at the horizon distance **d₀**, and carries on straight; by the time it reaches the target it has climbed **H** above the water there. Everything below H is behind the bulge. On a plane there is no bulge and no horizon: `H = 0` for every e and every d, with no free parameter to tune. That is a sign difference, not a magnitude difference.

## Diagram: three quantities that get confused for each other

*Figure caption:* **Three different lengths.** The **drop** (amber) is how far the surface falls away from the tangent line at your feet — `d²/2R`, the number in every “curvature chart”. The **horizon** (teal) is where a ray from your *eye* touches the water; it exists only because your eye is above the surface. The **hidden height** (red) is measured from the water at the far end up to where that same ray arrives. Only the third one answers “what can't I see?”. They coincide in exactly one case: `e = 0`, an eye lying on the water, which is also the one case in which you see nothing at all.

> **The arithmetic trap that ruins most of these arguments — on both sides.** The famous “eight inches per mile squared”, `d²/2R`, is *not* the hidden height: it is the drop of the surface below the tangent at your feet, and it assumes your eye is *on* the water. At 2 m up and 14.4 km it predicts 16.3 m hidden; the correct answer is 6.9 m. Used as a hidden height, it overstates the effect and is easy to refute. The horizon term `d₀` carries your own height into the answer — it is why a taller observer sees more.

## Calculator — what the curve takes away [evidence: prediction]

Type your own numbers, or load one of the documented sightlines. The radius R comes from the Elevation-angles tab, so you can also ask what radius *would* have hidden what you saw. Refraction is never hidden from you: the geometric and refracted answers are printed side by side.

INPUT e = 2 m · d = 37.00 km · h = 47 m · R = 6371 km
FLAT hidden 0.0 m — all 47 m in view, at any distance · elevation +0.070°
GLOBE horizon 5.05 km · hidden **80.1 m** · 0.0 m of 47 m still showing · elevation −0.097°
with refraction k = 0.13: horizon 5.41 km · hidden **68.1 m** · 0.0 m showing
for comparison, the “8 in / mile²” drop d²/2R = 107.4 m — *not* the hidden height

The globe hides **more than the whole target** (80.1 m of 47 m), so on a sphere nothing at all should show here on straight rays; with k = 0.13 refraction still does not lift it clear. A plane says the full 47 m is in view, base included, on any clear day. **Verdict rule:** photograph the base and the sphere is in serious trouble; photograph a summit floating free of its own coastline and the plane is.

## The same case, drawn three ways [evidence: prediction]

Two cross-sections seen from the side, then the view from the observer's eye. The flat panel is not very interesting — a straight ground line and a sightline that always reaches the foot of the target — and that *is* the flat model's whole content here. Everything below follows the calculator above, the Earth radius set in the Elevation-angles tab, and the refraction controls just below (the page's single k slider).

Each worked example below loads the refraction coefficient appropriate to it, and says where that number comes from. Where the original observers state one, theirs is used; where they do not, the page uses a documented standard and labels it as an assumption — never a value tuned to make the answer come out right. Over water at eye level the standard-atmosphere value is k ≈ 0.17[1]; for geodesists working from high summits on warm afternoons the long-run average is about k ≈ 0.14[2]; the k ≈ 0.13 default elsewhere on this page is Gauss's value from the Hanover survey[3].

Model AFlat plane — side view

straight ground · nothing hidden at any d

Model BGlobe — side view

R_eff ≈ 7323 km · k = 0.13 · apparent

1× (true scale)

ViewObserver's perspective — solid = globe, dashed = flat

auto-framed · 0.1° × 0.29° field · equal angular scale

1× (equal scale)

The direction is the whole point. Refraction can only ever uncover *more* of the target, never less, so it cannot rescue a flat prediction that needs the base visible in the first place.

*Figure caption:* **The band is the part that misleads.** It does *not* mean everything below the line is hidden. A target nearer than the horizon drops below that line once you are high up and is drawn over the band, because it stands in front of the water and you see all of it — the cable-car case. Only a target beyond the horizon is buried, and there the dashed flat outline carries on down through the band: that is the disagreement. At 1× the side views are true scale; the exaggeration slider draws the planet with radius R/ex and heights ×ex, so curvature, drop and verticals stretch together. Every printed angle and distance comes from the true geometry.

## Documented sightlines, run through both models [evidence: check — Where the radius enters: distances and heights read on maps and terrain models.]

**Each row is a real observation someone has published; the two right-hand columns are what each model says should have been invisible**

| Sightline | Eye e | Distance d | Globe hides | Plane hides | What was reported |
| --- | --- | --- | --- | --- | --- |
| Garda · Bardolino → Gardone Riviera beach | 2 m | 14.40 km | **6.9 m**with k = 0.13: 5.5 m | 0.0 m | “beach clearly visible” |
| Garda · Desenzano → harbour at Garda | 2 m | 17.00 km | **11.2 m**with k = 0.13: 9.2 m | 0.0 m | “harbour clearly visible” |
| Garda · Desenzano → shore at Gargnano | 2 m | 26.00 km | **34.5 m**with k = 0.13: 28.9 m | 0.0 m | “profile recognisable” |
| Garda · Malcesine shore → Sirmione | 2 m | 37.00 km | **80.1 m**with k = 0.13: 68.1 m | 0.0 m | proposed test — castle keep ~47 m |
| Garda · same line, cable car mid-station | 515 m | 37.00 km | **0.0 m**with k = 0.13: 0.0 m | 0.0 m | proposed control at 515 m |
| Corsica · Mont Coudon → Monte Cinto | 702 m | 255.58 km | **2.04 km**with k = 0.13: 1.62 km | 0.0 m | beam held 8 h, 1925 |
| Corsica · Mont Agel → Monte Cinto | 1149 m | 198.28 km | **468.9 m**with k = 0.13: 321.0 m | 0.0 m | beam observed, 1925 |
| Corsica · Nice seafront → Monte Cinto | 5 m | 198.00 km | **2.83 km**with k = 0.13: 2.45 km | 0.0 m | summit only, in clear air |
| Karagöl → Shkhara · Guinness record 2024 | 3275 m | 493.07 km | **6.55 km**with k = 0.13: 5.13 km | 0.0 m | a thin line above the horizon |
| Cerro Champaquí → Aconcagua, 2023 | 2790 m | 483.50 km | **6.84 km**with k = 0.13: 5.41 km | 0.0 m | the previous record |
| Pic de Finestrelles → Pic Gaspard, 2016 | 2826 m | 443.00 km | **5.04 km**with k = 0.13: 3.92 km | 0.0 m | the record before that |
| Rainy Lake · observer → target 7 | 3.91 m | 9.46 km | **0.5 m**with k = 0.13: 0.2 m | 0.0 m | target at eye level, DGPS |

Computed live from the radius in the Elevation-angles tab (R = 6371 km) and k = 0.13. The “plane hides” column is not an approximation or a rounded value — it is exactly zero for every row, at every distance, for every observer height, because a plane has no bulge to hide anything behind. That column is the flat model's entire prediction, and it is the one column that cannot be adjusted.

**Chicago from across Lake Michigan is the most-cited long-distance claim, and the easiest to check.** A building of published height, on a lake whose surface is the datum, photographed from a shore with nothing in between — no crest to identify, no ground profile to model. Four viewpoints are listed above, 53 to 93 km out. At each, the globe hides a definite fraction of the tower and a plane hides **nothing, at any distance**. The photographs show crowns without bases[12]. *The measured column stays empty:* how much of the tower was visible is exactly what these pictures rarely state, and it is the number that would settle each case.

**Canigou from Allauch is the measurement this page is about to attempt, made since 1808.** The peak stands 263 km from Marseille and is seen only when the setting Sun is directly behind it, around 9 February and 1 November — the two dates when the sunset azimuth from Allauch points at the summit[13]. That rhythm is often offered as proof that refraction is invoked selectively. It is the opposite: **the dates are set by where the Sun sets, not by the air.** Standard refraction is there every day; the backlight is not.

> **And the photograph carries its own verdict.** What appears is the top of the mountain and nothing else — local observers put the cut near 2,450 m of a 2,785 m summit, which needs k ≈ 0.22, strong but ordinary for a warm sea in February. On a plane *nothing is hidden at any distance*, so the whole 2,785 m would stand against the sky every clear evening. It does not: the point is not that the mountain is visible, but that **nine tenths of it are missing**.

*Figure caption:* Not a sketch: the ridge line is swept off the IGN's LiDAR HD terrain model (about 1 m, RGE ALTI where the LiDAR has a gap), one terrain read, both models. True angular scale on **both** axes — 2.4′ of azimuth per sample, the same scale vertically — so the solar disc is drawn at the size it subtends. Through a filter everything that is not the Sun is black, sea included, and the black outline is what the globe leaves above the sea at k = 0.13. **The blue line is the same terrain with the curvature removed:** the massif would stand 32′ above eye level instead of 29′ below it — a gap of 62′, close to two solar diameters. The terrain model reads the summit at 2,784 m against its published 2,785; the 3-arcsecond model used before read 2,686 m and put the black curve a whole arcminute too low. One caveat kept in view: the viewpoint's exact coordinates were never recorded, so the profile is swept from a point at 290 m on the Notre-Dame-du-Château hill above the village — a few hundred metres either way shifts the skyline by a few hundredths of a degree and changes nothing else.

### The world record, and the argument built on it

493.07 km, certified — the flat arithmetic granted first, then answered with numbers

The claim, stated fairly. On 15 December 2024 Richard Jezik photographed Shkhara, on the Georgia–Russia border, from a subpeak near the Karagöl summit above Giresun in Turkey; Guinness World Records certified the line at **493.07 km**, the longest ever photographed[4]. The flat-earth argument: observer at 3,275 m, summit at 5,203 m, so on a sphere the peak should be buried about 1,340 m below the line of sight — yet there it is. **Their arithmetic is right.** With refraction off, the calculator above returns 6,553 m hidden, the summit 1,350 m under the geometric ray.

What the sum leaves out is the standard correction, not a rescue. Light does not travel straight through 493 km of stratified air, and how much it bends is not a free parameter: it is tabulated in every nautical almanac, and Helbronner corrected for it in 1925 over lines this long. So the question is *how much* is needed, and whether that is normal. Sweep k for this case: the summit reaches the horizon at **k = 0.123**, against a standard sea-level value of **0.17**[1] and Gauss's continental 0.13. The record needs *slightly less than average* refraction — and at 0.17 it clears by 491 m, **9.4% of the mountain**.

And 9.4% is what the photograph shows. Here the argument turns: the flat model predicts far more than visibility, all checkable in the same frame. On a plane the summit stands **+0.224° above eye level**; on a globe **1.616° below** — 110 arcminutes apart, three and a half full moons. A plane also puts all 5,203 m in view: the Bezengi Wall to its base, the Svaneti valleys, Ushguli, the Black Sea coast at Batumi. The photograph shows none of it — a thin serrated line of summits on the horizon, everything beneath gone.

The record's own difficulty is the evidence. Jezik tracked the weather for months, hiked ten hours through snow to 3,275 m, waited out a night at −12 °C and shot before sunrise[4]. Each of those choices is a curvature correction. On a plane altitude buys nothing — there is no horizon — so the same photograph would be available from the beach at Giresun on any clear day. Nobody has ever taken it from the beach; every entry on the record list is from one mountain to another.

Which gives the sphere a hard ceiling — and a way to be killed. Two peaks see each other only if their two horizon distances cover the gap: `d ≤ √(2R′h₁) + √(2R′h₂)`, with R′ the refracted radius. With k fixed at its standard value, nothing in it is adjustable, and it forbids things. The table below runs it against the record list: every record falls *inside* its ceiling, the top three at 91–98%, pressed against the limit and never over. A plane sets no ceiling and predicts nothing here. **One photograph past the ceiling — one confirmed shot beyond that sum, between two known summits in ordinary air — refutes this page.** A century of trying has not produced one.

**Every certified long-distance observation, against the maximum the globe allows for that pair of summits**

| Observation | Observer | Target | Distance | Globe's ceiling | Used up |
| --- | --- | --- | --- | --- | --- |
| Karagöl → Shkhara (Guinness, 15 Dec 2024) | Karagöl subpeak 3 275 m | Shkhara 5 203 m | 493.1 km | 494.9 km | **100%** |
| Cerro Champaquí → Aconcagua (13 Jun 2023) | Cerro Champaquí 2 790 m | Aconcagua 6 961 m | 483.5 km | 521.3 km | **93%** |
| Pic de Finestrelles → Pic Gaspard (2016) | Finestrelles 2 826 m | Pic Gaspard 3 883 m | 443.0 km | 441.8 km | **100%** — OVER |
| Mount Sanford → Denali | Mount Sanford 4 949 m | Denali 6 190 m | 365.3 km | 570.1 km | **64%** |
| Mount Ruapehu → Tapuae-o-Uenuku | Ruapehu 2 797 m | Tapuae-o-Uenuku 2 885 m | 343.1 km | 407.9 km | **84%** |
| Kilimanjaro → Mount Kenya | Kilimanjaro 5 895 m | Mount Kenya 5 199 m | 321.9 km | 569.6 km | **57%** |
| Darjeeling → Everest | Darjeeling 2 100 m | Everest 8 849 m | 175.4 km | 535.2 km | **33%** |

Ceiling = √(2R′h₁) + √(2R′h₂) with R′ = 7323 km (R = 6371 km, k = 0.13). The closest any record has come is **100%** of its own ceiling, and 1 row is currently over it. Untick refraction above and the top rows go past 100% — which is precisely the flat-earth calculation of this case, and precisely why omitting refraction is the error rather than the discovery. Nothing here is fitted: k is the value set by the refraction controls, the heights are the published ones, and the ceiling has no adjustable term.

### Lake Garda — is there an official measurement?

No survey authority has ever measured it. What exists, and what would settle it

The honest answer: not a published one. No survey authority has run a dedicated curvature experiment on Lake Garda. What *is* official is the reference surface the lake is administered against: a hydrometric zero at **64.027 m above mean sea level**, published by the Comunità del Garda[5] and used to run the regulating works at Salionze. “Above sea level” means an equipotential surface that closes on itself around the planet; every lake gauge in Italy, and the levelling network tying them together, rests on it and would drift out of agreement if the reference were a plane.

The lake does have a history here. Italian flat-earth groups have published their own photographic tests: Bardolino → Gardone Riviera at 14.40 km, Desenzano → Garda harbour at 17 km, Desenzano → Gargnano at 26 km, each “clearly visible”[6]. Their arithmetic is roughly right — the table above has the globe hiding about 7, 11 and 34 m on those lines. What fails is the *observation*: recognising a village or a hillside says nothing about whether its **waterline** was in view, and Gardone, Garda and Gargnano all rise tens to hundreds of metres behind their quays. A test that cannot tell “I see the town” from “I see the bottom of the town” discriminates nothing, and both sides should stop citing it.

The nearest thing to a proper measurement on water was made on Rainy Lake, on the Minnesota–Ontario border, in spring 2018: seven targets on the lake ice out to 9.5 km, each fixed by differential GPS to centimetres, the line of sight compared with both models. The surface came out curved with a radius of about 6,400 km[7]. That is the template Garda deserves — longer, warmer, easier to reach, and where the argument is actually being had.

### The ideal spot on Garda, and how to use it

Malcesine: 25 / 515 / 1,695 m of eye height on one cable-car ticket, aimed 37 km down the lake

Malcesine, and the Monte Baldo cable car. Garda offers about 50 km of open water from Riva to Peschiera, with a lift running from the shore to 1,760 m. The three stations of the Funivia Malcesine – Monte Baldo are at **90 m**, **580 m** and **1,760 m**[8]; with the lake at about 65 m, one ticket puts the same camera at roughly **25 m**, **515 m** and **1,695 m** above the water, aimed at the same target through the same air. Sirmione, about 37 km down the lake, has a Scaligero keep whose storeys make a vertical scale bar.

What each model says before you go. From the Malcesine waterfront at about 2 m the globe hides roughly **80 m** of Sirmione — the whole castle and part of its hill. From the 25 m terrace, about **29 m**. From the mid-station, 515 m up, **nothing**: the horizon is past 80 km and the far shore is complete, waterline included. A plane predicts the same framing at all three heights, with the waterline never missing, so there is nothing for the climb to restore.

Protocol, so the result means something. Shoot at dawn or in a cold, well-mixed airstream, when refraction is closest to standard; take every frame the same morning with the same lens; aim at a waterline you can identify without ambiguity — a buoy, an anchored boat, a measured pole, a quay with countable courses — not “a village”; and record the water level from the public gauge, which moves by more than a metre through the year. Refraction is the only knob, and it is one-sided: over a lake it lifts the far shore and *reduces* the hidden height by a fifth or so. No value of it brings 80 m of missing castle back to zero.

### Corsica from the mainland — the case that was measured officially

Helbronner, 1925: curvature named as the obstacle, four stations above 700 m, ±0.57″ closure

Helbronner's junction, 1925. Tying Corsica, about 180 km off the Côte d'Azur, to the French mainland had been attempted and abandoned since the eighteenth century; the obstacle was **the curvature of the Earth's surface**, which caps how far one station can see another[9]. Paul Helbronner's answer, in 1925–26, was to climb: mainland stations at Fort du Coudon 702 m, La Sauvette 779 m, Mont Chauve d'Aspremont 840 m and Mont Agel 1,149 m; Corsican ones on Monte Stello 1,307 m, Monte Rotondo 2,622 m and Monte Cinto 2,709 m. On the night of 25–26 August 1925, from Monte Cinto, he held five projector beams for eight hours — Stello at 60 km, Agel 198 km, Chauve 206 km, Sauvette 236 km, Coudon 256 km — and the adjustment closed to about ±0.6″ per angle.

Now put two numbers into both models. Helbronner's own distance from the Coudon to Monte Cinto is **255,582.75 m**[10]; summit 2,706 m, station 702 m. On a plane the peak stands 2,004 m *above* eye level, at **+0.449°**, its shoreline in plain view. On a globe 2,035 m of it is under the bulge, only the top ~670 m shows, and the summit sits **−0.700° below** eye level: the instrument must aim *down* at a mountain two kilometres taller than the observer — 69 arcminutes of swing, in the one direction an instrument error cannot fake. Helbronner's 1,492 pages of angles were reduced on the second assumption and closed to arcseconds.

And the amateur version agrees. Riviera photographers catch Monte Cinto from sea level at about 198 km: from an eye 5 m up, geometry alone hides 2,835 m — more than the mountain — so the sightings need refraction, which is what the observers themselves conclude. Working back, the minimum eye height for a purely geometric sighting of Cinto is about **12 m**, and for the 2,305 m Cima Statoghia at 194 km about **40 m** — the figures an independent observer computed from his own photographs[11]. On a plane there is no minimum eye height for anything, and the whole Corsican coast would be photographable from the beach at Nice on any clear day. It never has been.

Experiment 1b · the height sweep

One target, one morning, three camera heights

Pick a target across water whose waterline you can identify — a buoy, an anchored boat, a marked pole, a quay. Photograph it from as close to the water as you can stand. Then raise the camera, without moving sideways, and photograph it again. Then again, higher. Count how much of the base reappears at each step.

Independent variable
**What you change:** the eye height **e**. You choose it — a beach, a first-floor window, a hill, a cable car — and you can measure it with a tape or a phone barometer.

Dependent variable
**What you measure:** the height **H** of the target that is cut off at the bottom, read against the known scale on the target itself. The target tells you; you do not get to choose it.

IV e = 2 m, at d = 37.00 km
DV flat prediction: 0.0 m hidden — at every height on this list, for ever
DV globe prediction at your height: 80.1 m hidden (68.1 m with k = 0.13)
the sweep: 0.5 m → 93.3 m · **2 m → 80.1 m** · 25 m → 28.8 m · 100 m → 0.1 m · 515 m → 0.0 m · 1695 m → 0.0 m
climbing the whole ladder uncovers **93.3 m** of the far base

**Verdict rule:** the flat model predicts that climbing changes the target's apparent *size and position* and nothing else — the same fraction of the base is visible from the sand and from 1,700 m, namely all of it. The globe predicts a specific slab returning at each step, set by `d₀ = √(2Re)` alone. If the base of a distant target looks identical from three well-separated heights on the same morning, the sphere is dead. If a measurable slab comes back each time you climb, and the amounts match the row above, the plane is — and R falls out of the numbers.

Why zoom is the cleanest sub-test. The commonest rescue for a vanished hull is “it is too small to resolve — zoom in and it comes back”. That is testable in the same photograph. What is lost to angular size returns under magnification, top and bottom together. What is behind the bulge does not: the top sharpens and the bottom stays cut at the same waterline, clean and horizontal, whatever the focal length. One frame at 24 mm and one at 600 mm from the same tripod separate the two explanations without arithmetic.

What would refute the globe here. A target of known height, at a measured distance, photographed from a measured eye height, with its waterline visible when the table above says H metres of it should be missing — reproducibly, in still cold air, at several distances, the missing height staying at zero as d grows. That would kill the sphere on this page's own terms. Symmetrically: if the hidden height grows as `R(sec((d−d₀)/R) − 1)` and shrinks as you climb, exactly as tabulated, the flat model is finished — and the one number fitted, R, comes out the same 6,371 km every other panel returns.

## Bordighera from a balcony near Antibes, 49 km across the sea [evidence: check — Where the radius enters: the 49 km from the balcony to Bordighera, computed from coordinates on a sphere of radius R.]

A photograph taken by [Xyphophor](https://x.com/Xyphophor) on purpose for this page, with a Nikon P900 at long zoom, from a third-floor balcony near Antibes. The camera points at the hillside town of Bordighera, in Italy, between Villa Regina Margherita (Via Romana 34/36) and the Servizi Medici Hesperia clinic (Via Romana 40). The town's buildings stand on the slope with their lowest rows missing, as if they rose out of the sea. The eye: the ground under the building is at 28.1 m on IGN's LiDAR HD terrain model[14], and a GPS reading on the third-floor balcony puts the camera at 41.6 m above the sea (three floors of 3 m would have given 38.6 m). The buildings: their outlines come from OpenStreetMap[15]. In the lower town, their roofs and the ground at their corners are measured on the 1 m LiDAR survey of Liguria.[17] The hills behind come from TINITALY, a 10 m terrain model of Italy without buildings.[16] Every point is reduced to a direction and a distance from the eye. The distance, 49.0 km to the aim point, is computed from coordinates on a sphere, which is where the radius enters. The plane is given exactly the same distances.

*[Figure: An animated view of the Bordighera hillside from a balcony near Antibes, 49 km away. On a plane the whole town is visible down to the waterline. As the Earth is curved to its radius the sea horizon rises over the lower town and hides Villa Regina Margherita and the Hesperia clinic, outlined in dashes. With standard refraction the horizon drops back a little. Below, a cross-section along the line of sight.]*

- hidden at Villa Regina Margherita now **0 m**
- globe 53 m k = 0.13 : 41 m
- plane 0 m
- eye 42 m · sea horizon —
- Villa roof above the sea: photo 11 m · this model 56 m · buildings match 0.01
- click: pause

opacity

*Figure caption:* **The same town on a plane, on the globe, and on the globe with refraction.** Top: the view from the balcony at true angular scale in both directions, 0.6° wide, the photograph covering 0.35° of it. The terrain is drawn ring by ring from far to near, paler with distance. The buildings are the OpenStreetMap outlines raised to their height. Then the sea is drawn over everything: its upper edge is the horizon on the globe, the coastline on the plane. The two named buildings keep a dashed outline where the sea hides them. The scale on the right gives heights above the sea at the distance of the aim point. Bottom: a cross-section along the line of sight. Rule 1: to show a 300 m slope beside 49 km of sea, the Earth is drawn smaller by the printed factor and the heights are raised by the same factor, so the grazing ray touches the sea where it would on the real Earth. Refraction is drawn as it is computed: straight rays over an Earth of radius R/(1 − k), k = 0.13. Over it, [Xyphophor](https://x.com/Xyphophor)'s photograph (dashed frame), 0.35° wide at the scale given by the camera's focal length, with its sea line laid on each model's sea, as explained below. It stays hidden while the model changes. Once the refracted globe is in place it fades in, then blinks fully on and off to show how well it lands on the drawing. The slider sets its opacity. Click to pause.

**What each model predicts at Via Romana.** On the globe, from 41.6 m, the sea horizon is 23.0 km away. Behind it, at 49 km, the lowest 53 m are hidden on straight rays and 41 m with standard refraction. Villa Regina Margherita stands on ground at 32 m and its roof is at 55.5 m on the LiDAR. On straight rays the globe hides all but its top 2 m; with refraction its top 15 m show above the sea. The Hesperia building stands on ground at 23 m with its roof at 49 m: hidden on straight rays, with its top 9 m showing with refraction. On a plane, nothing is hidden at any distance. Both buildings would be seen down to their doors, with the strip of sea in front of the town 2.9′ below eye level.

**The photograph over the scene, set on the horizon.** The original file (DSCN7496, 28 March 2026, 17:34) gives the camera's focal length: 999.6 mm, that is 357 mm of optical zoom times 2.8 of digital zoom, on a sensor 6.18 mm wide. So the photograph is 0.354° wide, 745,500 pixels per radian, whatever the shape of the Earth: the scale is read, not fitted, and it is the same for every model. The picture is levelled on its sea horizon (0.37° of roll), which is level in every model. Its sea line is then laid on each model's sea: the horizon on the globe, the coastline on the plane. Only the direction is left free. For each state, a search finds the direction that lays the model's buildings best over those of the photograph, and each model gets its own best, the plane included. With the eye at its GPS height, this match no longer tells the globe's refractions apart: 0.032 to 0.043 from straight light to k = 0.5, 0.033 at k = 0.13. The plane stays lowest, 0.010 to 0.017. The drawing keeps one direction for every state, the one found when k = 0.13 matched best (eye at 38.6 m), because a direction does not depend on the shape. Then one measurement. The roof of Villa Regina Margherita stands 162 pixels above the sea line: 0.22 mrad, or 10.7 m at its distance. The globe with k = 0.13 predicts 14.9 m, the globe without refraction 2.2 m, and the plane 56 m. This roof gives the refraction of that evening: k ≈ 0.09. The Hesperia building should show its top 9 m with k = 0.13. It does not show as a building, as [Xyphophor](https://x.com/Xyphophor) noted: at most a pale strip a few metres high lies on the sea line. What shows clearly starts just above it: the building behind it on the slope, with its roof at 54.7 m. The contrast of the photograph is corrected, because over 49 km the haze turns everything blue. The correction is levels per colour channel, then local contrast, the same over the whole picture. No pixel is moved.

> **What is not measured yet, and what is assumed.** The photograph's scale comes from the nominal focal length recorded in the file. A real lens can differ from its nominal value by a percent or two, which changes the measured 10.7 m by about as much. The eye height of 41.6 m is a GPS reading on the balcony; a phone's GPS altitude is good to a few metres. Each metre of error on it moves the measured k by 0.011 (with 38.6 m, from three floors of 3 m, k came out at 0.12). 621 building heights are measured: the LiDAR roof (75th percentile inside the outline) minus the ground. The survey was flown in 2008–2010, so a building put up since is missing and one pulled down is still there. The 321 others, higher up the slope or at the edge of the view, are estimates: 80 from the number of floors in OpenStreetMap (3.2 m per floor), 159 from a 30 m surface model minus the ground, and 82 given three floors. Where an estimate and the LiDAR both exist, the floors estimate comes out 2 m lower than the LiDAR (median) and the surface model 2.5 m lower, sometimes 9 m lower. Over 49 km of sea the day's refraction can be well away from k = 0.13, either way. The shimmer at the foot of the buildings in the photograph may be a mirage.

> **What would have vindicated the plane.** The ground floor of the Via Romana buildings, 20 to 25 m above the sea, seen from this balcony in clear air, with the waterline of Bordighera below them. On a plane, nothing can sit in front of that strip, because the sea there is lower in the view than the coast. The steel-man: the plane gets the same distances, the same eye and the same buildings, and refraction is not used against it. Refraction belongs to the globe only (rule 3).

**See also**[Refraction](/ai/ref.md)[Elevation angles](/ai/elev.md)[Dip](/ai/dip.md)[Observation](/ai/obs.md)

## Sources for this tab

1. [1] L. Dettwiller, *Phénomènes de réfraction atmosphérique terrestre*, [C. R. Physique 23 (2022) S1, 103–132](https://comptes-rendus.academie-sciences.fr/physique/item/10.5802/crphys.114.pdf) (Académie des sciences) — derives the refraction coefficient from the vertical temperature gradient and gives κ ≈ 0.17 for the US 1976 standard atmosphere at sea level, the value this page assumes for sightlines close to a water surface. Also the reference for what happens when κ goes large or negative (mirages, hillingar).
2. [2] L. Dettwiller, *Panorama historique de l'étude de la réfraction astronomique*, [C. R. Physique 23 (2022) S1, 13–62](https://comptes-rendus.academie-sciences.fr/physique/articles/10.5802/crphys.110/) — notes the long-run working average of about 0.14 for geodesists, whose observations are typically made from relatively high stations on warm sunny afternoons; used here for the Corsica junction, where no coefficient was published for the observations themselves.
3. [3] [Hirt et al. (2010), J. Geophys. Res. — terrestrial refraction coefficient](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067) — the k ≈ 0.13 "Gaussian" value used here (Gauss derived it in 1826 from his Hanover survey network), and field measurements showing k varies with weather and can even go negative over hot ground — exactly why this page treats variable-k models as unfalsifiable and keeps k fixed and visible.
4. [4] [Guinness World Records — longest line of sight on earth photographed](https://www.guinnessworldrecords.com/world-records/66661-longest-line-of-sight-on-earth) — **493.07 km (306.37 mi)**, Richard Jezik (Slovakia), Giresun, Turkey, **15 December 2024**. The citation also records the conditions, which matter more than the distance: months of watching the forecast, a ten-hour hike through snow to the summit, a night at −12 °C with the wind rising to 20–25 m/s, and the frame taken before sunrise. Cited here because the flat-earth argument rests on it — so it is quoted from the certifying body rather than from a repost.
5. [5] [Comunità del Garda — lake level measurement](https://www.comunitadelgarda.it/misura-del-livello-del-lago-di-garda/118.html) — the institutional gauge for Lake Garda, read against a hydrometric zero of 64.027 m above mean sea level, together with the discharge from the Salionze regulating works. The reference surface is an equipotential, not a plane.
6. [6] [La Voce del Trentino (2019) — the Lake Garda flat-earth observations](https://www.lavocedeltrentino.it/2019/07/14/il-lago-di-garda-non-curva-leonardo-da-vinci-e-terrapiattisti-a-confronto/) — the distances and claims used in the table above (Bardolino → Gardone Riviera 14.40 km, Desenzano → Garda 17 km, Desenzano → Gargnano 26 km), reported from the group's own account. Cited so their numbers are used, not a paraphrase of them.
7. [7] [The Rainy Lake experiment (2018), reported by W. Bislin](https://walter.bislins.ch/bloge/index.asp?page=Proof+of+Earth+Curvature%3A+The+Rainy+Lake+Experiment) — seven targets on lake ice out to 9.5 km, positions fixed by differential GPS to centimetres by a licensed surveyor; the water surface measures curved at roughly 6,400 km radius. The modern successor to the Bedford Level test.
8. [8] [Funivia Malcesine – Monte Baldo (operator)](https://www.funiviedelbaldo.it/en/funivia-malcesine-monte-baldo) — the three station altitudes (90 m, 580 m at San Michele, 1,760 m at Tratto Spino) that make the height sweep described above a single-ticket experiment.
9. [9] J. Palmieri, *Paul Helbronner (1871–1938) et la géodésie de la Corse*, [Bull. Soc. Sci. Hist. Nat. Corse 730–733 (2010)](http://www.helbronner.org/IMG/pdf/BSSHNC_730-733_Art-_Palmieri_cle8a7d81.pdf) — the scholarly account of the 1925–26 direct geodetic junction of Corsica to the French mainland: curvature named as the obstacle that had defeated every earlier attempt, the station heights, the five simultaneous beams observed from Monte Cinto on 25–26 August 1925, and the ±0.57″ closure.
10. [10] Ovalp — [*La Corse vue du continent*](https://www.ovalp.com/fr/comprendre/corse-vue-du-continent) — Helbronner's own computed sightline lengths (Mont Agel → Monte Cinto 198,282.67 m; Mont Coudon → Monte Cinto 255,582.75 m), the history of the junction, and modern high-resolution photographs of the island from the Alpes-Maritimes.
11. [11] [E. Varoquaux — La Corse vue du continent](http://emmanuel.varoquaux.free.fr/corse/) — photographs from the Côte d'Azur with the minimum observer height computed for each summit (about 12 m for Monte Cinto at 198 km, about 40 m for the 2,305 m Cima Statoghia at 194 km), which this page reproduces independently from its own formula.
12. [12] Chicago across Lake Michigan. Distances and viewpoints from [ABC57, Skyline skepticism: the Lake Michigan mirage](https://www.abc57.com/news/skyline-skepticism-the-lake-michigan-mirage) (Warren Dunes, Tower Hill 250 ft) and [ABC57 on Joshua Nowicki's Grand Mere photograph](https://www.abc57.com/news/mirage-of-chicago-skyline-seen-from-michigan-shoreline) of April 2015, reported there as a superior mirage. Willis Tower heights are the published 442.1 m to roof and 527.3 m to tip, taken here above the lake datum. Every hidden height in the list is computed on this page from those figures; none is quoted from any of the sources.
13. [13] Canigou from Allauch. The observation is old — von Zach recorded it from Notre-Dame de la Garde in 1808 — and the modern discussion, including the alignment dates checked against sunset azimuths and an overlay of the photograph on a terrain model, is at [Metabunk, Observations of Canigou, curvature of the Earth and atmospheric refraction](https://www.metabunk.org/threads/explained-observations-of-canigou-curvature-of-the-earth-atmospheric-refraction.8688/) (2017). The height of the visible cut, near 2,450 m, is from the local observers' own page, canigou.allauch.free.fr.
14. [14] IGN, LiDAR HD terrain model (MNT), Géoplateforme WMS-Raster ([geoservices.ign.fr/lidarhd](https://geoservices.ign.fr/lidarhd)), Licence Ouverte 2.0: the ground under the balcony near Antibes, read at 1 m (research/build_bordighera.py, via research/lidar_horizon.py).
15. [15] OpenStreetMap contributors, building outlines and `building:levels` around Via Romana, Bordighera, read through the OSM API on 6 October 2026 ([ODbL](https://www.openstreetmap.org/copyright)). Where a building has no number of floors, its height is the Copernicus GLO-30 surface model minus the TINITALY ground (ESA, Copernicus licence), or three floors.
16. [16] Tarquini S., Isola I., Favalli M., Battistini A., Dotta G. (2023), TINITALY, a digital elevation model of Italy with a 10 meters cell size (version 1.1), Istituto Nazionale di Geofisica e Vulcanologia (INGV), [doi:10.13127/tinitaly/1.1](https://doi.org/10.13127/tinitaly/1.1), CC BY 4.0, read through its WCS: the ground of Bordighera and the hills behind it.
17. [17] Ministero dell'Ambiente, Geoportale Nazionale, Piano Straordinario di Telerilevamento Ambientale: LiDAR 1 m of Liguria, digital surface model (first return) and terrain model, flights 2008–2010, WMS `LIDAR_LIGURIA` at wms.pcn.minambiente.it, read one pixel at a time (GetFeatureInfo): roofs and ground of 621 buildings of the lower town of Bordighera.

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- **Andrew T. Young — *Sunsets, mirages and the green flash* (San Diego State University).** The reference pages on how much a real atmosphere can and cannot hide, by the author of the refraction work already cited elsewhere on this page. The right place to go before deciding that any particular hidden-height claim is refraction.
