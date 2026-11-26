# The horizon drops as you rise — by a measured amount

> Tab "Dip" of *Flat plane or Globe?*. Web page: /#tab-dip. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Dip of the horizon · the navigator's daily correction*

*Figure caption:* **Where the sea horizon sits, relative to eye level.** Same eye height in both. On a plane the sea runs out to meet eye level and there is no angle to measure; on a globe the horizon is the tangent from the eye, an angle δ below level. Curvature is exaggerated.

Climb, and the sea horizon sinks *below* your eye level. Every sextant sight is corrected for it before anything else. The globe predicts exactly how much; a flat plane predicts exactly zero, at every height, forever. Drag the observer up and down and compare.

*[Figure: Animation: the same scene as the Earth's curvature goes from 100 % to a flat plane, seen from the side and from the observer's eye]*

- dip now **1.20°**
- globe 1.20° k = 0.13 : 1.12°
- plane 0′
- click: pause

*Figure caption:* **Flatten the Earth, and watch the horizon climb.** The same eye, 1,395 m up on the Sommet de Viériou, while the curvature goes from the real Earth to a plane and back. On the globe the sea horizon sits **1.20°** below eye level (1.12° with standard refraction, k = 0.13)[1]; as the surface flattens it climbs, and on a plane it never leaves eye level. In between, the surface is a larger sphere, never a stretched drawing; the side view's exaggeration is printed, and the angles come from the geometry, not from the drawing.

*[Figure: The view east from the plateau de Caussols, bent from a plane to the measured Earth and then refracted: the sea horizon falls below eye level and Mont Agel rises clear of it]*

- **Monte Ceppo** globe k +3.8′ · straight +1.3′ · plane +20.2′
- **Mont Agel** globe k −16.0′ · straight −17.3′ · plane −6.7′
- **Cap Corse** globe k −50.4′ · straight −58.2′ · plane +1.6′
- **Monte Ceppo against the sea horizon:** globe k +66.2′ · straight +68.3′ · plane +20.2′
- **Mont Agel against the sea horizon:** globe k +46.5′ · straight +49.7′ · plane −6.7′
- **Cap Corse against the sea horizon:** globe k +12.1′ · straight +8.8′ · plane +1.6′
- **photograph** the camera's own focal length (EXIF); heading, tilt and roll fitted on the near summits only, for each model
- skyline residual, photo placed as each model prefers: globe k 2.9′ · straight 1.8′ · plane 2.2′

*Figure caption:* **From the plateau de Caussols, bend the Earth and watch the sea horizon fall.** The view east from 1,210 m, drawn from the IGN's LiDAR and, beyond 45 km, the Copernicus model: the Riviera, Mont Agel, Monte Ceppo in Italy, Corsica 222 km out to sea. It starts on a plane, where the sea rises towards eye level and Mont Agel, 77 m lower than the eye, sits 7′ below the horizon. Its height here is the terrain model's, 1,133 m, not the published 1,148 m: the IGN's LiDAR has no data on the summit, a military site, and the models that fill the gap differ by up to 30 m around it ([Basics](/ai/phys.md#phys-h2dem), terrain models). With 1,148 m it would sit 5′ below the plane's horizon instead of 7′, and 48′ above the refracted globe's instead of 47′. The Earth is then curved to its measured radius, 6,371 km: the horizon falls to 67′ below eye level and Mont Agel rises clear of it. Refraction comes last, and it works the other way: bending light along the curve, it acts as a larger radius, R/(1−k) with k = 0.13, and lifts the far scene back by a few arcminutes (horizon 62′ below). The terrain between the three computed models is interpolated for the animation; the horizon and the named summits are computed at every step. Last, once the model has stopped changing, [Xyphophor](https://x.com/Xyphophor)'s photograph from this spot fades in, then blinks fully on and off to show how well it lands on the drawing. It is framed as the refracted globe prefers (focal length from the camera, heading, tilt and roll fitted on the near summits): its sea horizon lies within 0.1° of that model's and about 45′ below a plane's, and Mont Agel stands 42′ above it.

*Figure caption:* **Globe.** The surface keeps its shape; only the observer moves. Raise the eye and the tangent point slides outward as √h while the sightline tips further below horizontal: **840.4′ = 14.007°** down, horizon at **36 km**. Everything in the red band beyond it is geometrically hidden.

*Figure caption:* **Flat plane.** Same frame, same scales. The observer rises but nothing else changes: no tangent point ever forms, the surface runs straight to the frame edge, and the only "horizon" is the eye‑level line itself — reached at infinity, dip 0.0′ = 0.000°. At 36 km, where the globe's horizon sits, the plane still shows open ground 9.6′ (0.161°) below eye level.

$$\operatorname{Dip} = \arccos\frac{R}{R+h} \approx {1.76'\times\sqrt{h}}$$
$$\operatorname{Horizon} = \sqrt{2Rh + h^2} \approx {3.86\,\text{km}\times\sqrt{h}}$$

h in metres. The bold constants are the *refracted* values printed in every nautical almanac and dip table (geometric: 1.93′√h and 3.57 km·√h). On a flat plane both formulas collapse: **dip = 0 at every height**, and the ground never reaches a horizon at all.

**What each model predicts at the current eye height**

| Model | Dip below eye level | Distance to horizon | Sharp edge? |
| --- | --- | --- | --- |
| Globe — geometric | 19.3′ = 0.321° | 36 km | yes, sharp |
| Globe + refraction (k=0.13) | 18.0′ = 0.299° | 38 km | yes, sharp |
| Flat plane — any height | 0.0′ = 0.000° | ∞ (no tangent) | no — haze only |

At h = **100 m** the geometric dip is **19.3′ = 0.321°** — the √h rule gives 1.93′×√100 = **19.3′ = 0.322°**, matching the exact arccos formula to within a whisker. The flat prediction is 0.0′ = 0.000° at this and every other height.

## Solve the triangle: the flat model contradicts itself [evidence: prediction]

Suppose the flat model is granted the *measured* dip angle δ — the one a dip meter actually reads. On a flat plane the eye, the point straight below it, and the point where the sightline meets the ground form a **right triangle**: height h, horizontal run d, right angle at the foot. That triangle is solvable, and it fixes where the ground must be:

$$\tan\delta = \frac{h}{d} \implies {d = \frac{h}{\tan\delta}}$$

Feed the measured dip into flat geometry and it says the sightline strikes the ground at distance d. But δ ≈ √(2h/R), so d ≈ h/√(2h/R) = √(hR/2) = **½·√(2Rh)** — exactly **half** the measured horizon distance, at every height. And on a plane nothing ends there: the ground simply continues, seen at ever‑smaller angles.

*Figure caption:* Granting the measured dip **δ = 19.3′ = 0.321°**, flat trigonometry puts the ground contact at **18 km**. The horizon actually ranged sits at **36 km** — a factor of **2.00**. On the plane the surface neither ends at the first distance nor at the second; on the globe both numbers are the same tangent point.

**Grant the measured dip, then solve the flat triangle — and compare with the horizon that can actually be ranged**

| Eye height | Measured dip δ | Flat: d = h / tan δ | Measured horizon | Ratio |
| --- | --- | --- | --- | --- |
| 2 m | 2.7′ · 0.045° | 2.5 km | 5.0 km | **2.00×** |
| 10 m | 6.1′ · 0.102° | 5.6 km | 11 km | **2.00×** |
| 100 m | 19.3′ · 0.321° | 18 km | 36 km | **2.00×** |
| 1.4 km | 71.9′ · 1.199° | 67 km | 133 km | **2.00×** |
| 10 km | 192.5′ · 3.208° | 178 km | 357 km | **2.00×** |

> **Three statements, no consistent flat answer.** (1) The dip is real and measured — so the flat triangle puts the ground at h/tan δ. (2) The horizon is real and ranged — radar, known landmarks and ship disappearance all put it twice as far. (3) On a plane the surface has no edge at either distance. The globe satisfies all three at once with a single number: the tangent point of a sphere of radius R sits at √(2Rh), and the angle to it *is* the dip. The factor of 2 isn't a fudge — it's the signature of a tangent line on a circle versus a chord to a plane.

## The surface you never drew [evidence: prediction]

Here is the same measurement with **no ground drawn at all**. Every line is one sightline to the horizon, taken from a real vantage point on the *same vertical* — a beach, a ship's bridge, a lighthouse, a cliff, a summit, an airliner — each tipped below horizontal by its own measured dip δ(h). Nothing else is plotted: no circle, no arc, no Earth. Yet the lines cannot enter a certain region, and that forbidden region has a shape. The dip angles alone carve the planet out of the negative space. **Click any sightline** to see which altitude it came from.

Click any sightline in the figure to see the height it was taken from, the dip it produces, and how far its horizon lies.

*Figure caption:* Seven real vantage points on one vertical, from a beach to an airliner, each line tipped by its own dip. Notice the wedge below them that none of the lines enters, and how its upper boundary curves. **Click any line** for its numbers, or press **reveal the surface** to see what fills the void.

This is what a mathematician calls an **envelope**: a family of straight lines whose boundary traces a curve that none of them crosses. Because a tangent to a circle touches at one point and lies outside it everywhere else, the sightlines can only be tangents of one specific circle — the one whose radius satisfies cos δ = R/(R+h) at *every* height simultaneously. A flat plane produces no envelope at all: with δ = 0 at all heights, every line is horizontal, they never fan, and the empty region is an unbounded half‑plane with no curve anywhere in it.

## Measuring the Earth from one dip angle [evidence: measurement]

Turn the formula around. If you can measure your height h and the dip δ, you can solve for R — no satellites, no travel, no second observer:

$$\cos\delta = \frac{R}{R+h} \implies {R = \frac{h\cos\delta}{1-\cos\delta}} \approx {\frac{2h}{\delta^2}}$$

δ in radians for the approximation. One hill, one angle, one number — and it must come out the same from a sea cliff, a mountain, or an aircraft window. That consistency is the test; a single value would prove nothing on its own.

**Solving for R from the current height, and what refraction does to the answer**

| Dip used | Value at current h | R = h·cos δ/(1−cos δ) | Compared with 6,371 km |
| --- | --- | --- | --- |
| Geometric dip (vacuum) | 19.26′ = 0.321° | 6,371 km | +0.0% |
| Refracted dip, used as-is | 17.97′ = 0.299° | 7,323 km | +14.9% |
| Refracted dip, corrected by (1−k), k=0.13 | 17.97′ = 0.299° | 6,371 km | -0.0% |

From h = **100 m** the geometric dip returns R exactly. Feed in the *refracted* dip — which is what any real instrument reads — and the naive answer is about **15% too large**, because light bending makes the Earth look flatter than it is. Correcting by the refraction coefficient recovers the right value. This is the one systematic error that dogged the method for nine centuries.

### Who did it first: al‑Bīrūnī, around 1018

An astrolabe, a hill in the Salt Range, and an answer within a fraction of a percent — partly by luck, since he had no way to correct for refraction

> **Who did it first: al‑Bīrūnī, around 1018.** The Persian scholar Abū Rayḥān al‑Bīrūnī carried out exactly this measurement from a hill at Nandana, in the Salt Range of what is now Pakistan. He first obtained the hill's height by triangulating it from the plain below, then used an astrolabe to measure the dip of the horizon — reporting roughly 34 arcminutes — and applied the same relation R = h·cos δ/(1 − cos δ). Depending on which cubit he used, his answer corresponds to an Earth radius of about 6,300–6,340 km, within a fraction of a percent of the modern 6,371 km[10]. Eratosthenes had measured the Earth some 1,250 years earlier, but by a completely different route — comparing midday shadow angles at two latitudes — so the *dip method* is credited to al‑Bīrūnī. His accuracy involved some luck: as the table above shows, refraction biases this method by more than 10%, and he had no way to correct for it.

## Your own dip, measured on a photograph — and the radius it gives [evidence: check — Where the radius enters: the camera's level is set by summits whose angles need their distances in km.]

The page's author photographed the sea from the plateau de Caussols on 13 June 2026 at 15:23, the eye 1,210 m above it — the photograph used in the Caussols figure above. It can measure the dip itself, without assuming a globe. The sea horizon lies at the same depression all the way round, on a globe and on a plane alike (where that depression is zero), so its slope in the picture gives the camera's roll, and its height is left free. The level is fixed by the two nearby summits, the dome of the Puy de Tourrettes and the Pic de Courmettes, about 7 km off, whose elevation angles come from the LiDAR terrain with flat trigonometry — no curvature at all, the choice most favourable to a plane (with the globe's own geometry they move by under 2′). The scale is the camera's EXIF focal length: one pixel is 1.27′. The horizon is found in 1,350 columns of open sea, scattering 0.9 px about a straight line; the summits are matched to 2.6 px rms. Result: the sea horizon lies **65.0′** below the level. A plane says 0′.

Turning a dip into a radius needs the bending of the light, and the standard coefficient k = 0.13 is an average for sightlines near the ground. From 1,210 m what counts is the air at the two ends of the grazing ray: the dip depends almost only on the difference between the air at eye level and the air at the apparent horizon, whatever lies in between.[2] For an atmosphere in spherical layers this is exact: n·r·cos α keeps the same value all along a ray (Bouguer's invariant), so the ray that grazes the sea, where the index is n_sea, reaches the eye with n_sea·R = n_eye·(R + h)·cos δ. The reanalysis for that afternoon gives 22.2 °C and 889 hPa at the eye, 21.9 °C and 1,021 hPa over the sea where the ray grazes it[6]; with the refractive index of air for visible light[5], a globe of 6,371 km predicts a dip of 60.4′ that day — more bending than standard, as if k were 0.19, because the air at 1,210 m was almost as warm as the air over the sea. Solved for R, the photograph's 65.0′ gives **R = 5,645 km**. With the standard k instead: 5,888 km; with no refraction at all: 6,768 km.

$$R = \frac{n_{\text{eye}}\,h\cos\delta}{n_{\text{sea}} - n_{\text{eye}}\cos\delta}$$

h = height of the eye above the sea · δ = measured dip · n = refractive index of the air at the eye and where the ray grazes the sea, n − 1 = 79.01·10⁻⁶·P/T (P in hPa, T in K) · with n_sea = n_eye it is the formula of the table above

**Each decision of the measurement changed alone: the dip, and the radius under three assumptions about the air**

| Variant | Dip | R, no refraction | R, k = 0.13 | R, the day's air | Fit (summits / horizon) |
| --- | --- | --- | --- | --- | --- |
| central measurement | 65.0′ | 6,768 km | 5,888 km | 5,645 km | 2.6 / 0.9 px |
| horizon taken at the top edge of the sea | 62.3′ | 7,379 km | 6,420 km | 6,064 km | 2.5 / 0.7 px |
| skyline threshold 25 (more sensitive) | 66.4′ | 6,490 km | 5,646 km | 5,450 km | 2.2 / 0.9 px |
| skyline threshold 60 (less sensitive) | 63.1′ | 7,180 km | 6,246 km | 5,929 km | 4.1 / 0.9 px |
| summits given the globe's geometry | 67.0′ | 6,368 km | 5,540 km | 5,364 km | 2.7 / 0.9 px |
| 5 m of scrub on the summits | 62.2′ | 7,394 km | 6,433 km | 6,074 km | 2.5 / 0.9 px |

*Figure caption:* **The photograph, and the lines measured on it.** Top: the strip of the photograph from the two summits to the open sea, at uniform scale. Yellow dots: the skyline found on the summits; white line: the LiDAR relief projected by the fitted camera; orange dashes: the level (eye level, where a plane puts the horizon); white: the sea horizon measured. Bottom: a magnified piece of the horizon, with the measured points, and for comparison only the globe's horizon for that day's air and for no refraction. No axis is stretched.

The measurement is imprecise, and the table shows how much. Changing each decision alone — where the hazy horizon is taken, how the skyline is found, whether the summits are given the globe's geometry, a few metres of scrub on them — moves the dip between 62.2′ and 67.0′; with three states of the air, R runs from 5,355 km to 6,139 km. One pixel is 1.27′, and one minute of dip is 3.1 % of the radius. The central dip lies 4.6′ (3.6 px) deeper than the globe predicts for that day's air. The air cannot explain that — it bent the light more than standard, which raises the horizon — so the difference points at the camera: scrub on the summits, residual lens distortion away from the centre of the frame, or where exactly the hazy horizon lies. Taking the free air above the sea at eye height (19.1 °C) instead of the air of the sunny plateau gives 5,702 km. A plane gives no radius at all: its horizon would lie on the level line, 65.0′ above the one photographed.

[**Experiment 4 · horizon dip** — to do yourself, with every experiment of the site, in “What would refute each model” →](/ai/falsify.md#xp-dip-4)

## Below eye level and still in the sky — the band the Sun has to cross [evidence: prediction]

Everything above treats the dip as a correction. Turn it round and it becomes something you can *watch*. If the horizon sits δ below your eye level, then there is a strip of sky, δ tall, that is **below the level line and above the horizon at the same time**. Anything in that strip — the Sun, the Moon, a planet, a distant aircraft — is seen whole, against sky, with nothing in front of it, while a bubble level says it is beneath you. From a mountain or an airliner the strip is several Sun‑widths tall and it takes the Sun a quarter of an hour to cross it.

On a flat plane that strip cannot exist, and not by a little. The ground's depression angle is atan(h/x), which shrinks toward zero as the ground recedes: eye level *is* the vanishing line, and the surface fills every direction below it out to the limit of visibility. An object seen below your own eye level would have to be seen through the ground. The flat model does not predict a thin strip, or a strip that needs good conditions. It predicts a strip of width **zero**, at every height, which is rule 4 again: an absence against a presence.

$${\delta(h) \gt 32'}$$
$${\delta - 32'}$$
$${\frac{\delta - 32'}{15.04^\circ/\text{h}\times\cos\varphi}}$$

The Sun spans about 32′[4], so its whole disc is under your eye level once its centre is 16′ below, and it is still wholly clear of the horizon until its centre reaches 16′ above the horizon line. Subtract: the window opens at a dip of one Sun‑width, which is an eye height of about 330 m. The rate is the equinox rate at latitude φ; away from the equinox it is slower still, which only lengthens the window.

*Figure caption:* Eye height 100 m: the horizon lies 19.3′ (0.321°) below eye level, so the shaded band is 0.60 Sun-widths tall. At this height the band is narrower than the Sun itself, so the disc cannot fit inside it — climb above about 330 m and it can. On a flat plane the two lines coincide and the band has zero height at every altitude.

**The band below eye level, at documented heights, and how long the Sun spends inside it**

| Eye height | Dip δ | Band, in Sun‑widths | Whole disc below level and clear | Time to cross, φ = 45° | Flat plane |
| --- | --- | --- | --- | --- | --- |
| 1.7 m standing at the waterline | 2.5′ · 0.042° | 0.08× | — too low | — | 0.0′ · 0 s |
| 276 m Eiffel Tower, top platform | 32.0′ · 0.533° | 1.00× | — too low | — | 0.0′ · 0 s |
| 555 m Burj Khalifa, At the Top SKY | 45.4′ · 0.756° | 1.42× | 13.4′ = 0.42× | 75 s | 0.0′ · 0 s |
| 1,395 m Sommet de Viériou | 71.9′ · 1.199° | 2.25× | 39.9′ = 1.25× | 3.8 min | 0.0′ · 0 s |
| 3,275 m Karagöl subpeak | 110.2′ · 1.837° | 3.44× | 78.2′ = 2.44× | 7.4 min | 0.0′ · 0 s |
| 11,000 m airliner at cruise | 201.9′ · 3.364° | 6.31× | 169.9′ = 5.31× | 16.0 min | 0.0′ · 0 s |

Times are for the equinox at 45°, where the Sun descends at 10.64° per hour; nearer the solstices, or nearer the poles, it descends more slowly and every figure above gets longer. Sunset from an airliner is also **later** than at sea level by the whole band: 19 minutes at this latitude, for the 202′ of dip alone. A plane predicts the same instant from the beach and from 11 km.

> **This is not the Sun setting, and that is the whole point.** Occultation is a separate event that happens later, when the disc finally reaches the horizon line. The claim here is about the interval *before* it: the Sun entire, nothing covering any part of it, sky visible underneath it, and a levelled instrument reading it as below the horizontal. You can photograph the state directly — one frame containing the Sun, the sea horizon under it, and a plumb line or a levelled bar in the same field of view. There is no version of a flat plane in which that frame exists.

> **Three things that can spoil it, stated in advance.** First, the level has to be a real level: in an aircraft the apparent vertical follows the resultant of gravity and acceleration, so a bank or a climb tilts it — take the reading in steady cruise, and prefer the angle from the Sun *to the horizon*, which no instrument error can manufacture. Second, refraction lifts objects near the horizon by roughly 34′[1] and shrinks the dip by about 8%[2]; both are already in the numbers above, and both work *against* the effect rather than creating it. Third, over land the horizon is terrain, not the geometric horizon, so this is a sea‑horizon measurement. None of the three turns a zero into 3°.

[**Experiment 4b · the doubled sunset** — to do yourself, with every experiment of the site, in “What would refute each model” →](/ai/falsify.md#xp-dip-4b)

> **It is measured, not inferred.** A dip meter (or a theodolite levelled with a bubble, or a sextant's artificial horizon) reads the angle between the true horizontal and the sea horizon directly. From a 10 m bridge it is about 5.6′ (0.093°); from a 100 m cliff about 17.6′ (0.293°); from an airliner at 10 km about 3.0°. Those numbers are tabulated, reproducible with hardware costing a few hundred euros, and they track √h exactly as arccos(R/(R+h)) requires. A plane predicts 0.0′ = 0.000° at every one of those heights.

## The doubled sunset, on an instrument: Mauna Loa and the coast below it [evidence: check — Where the radius enters: the Sun's altitude from an ephemeris, the observatory's horizon from a terrain model; the coast's sunset is computed.]

Experiment 4b asks for a stopwatch. NOAA's observatory on Mauna Loa, 3,397 m up on the island of Hawaii, runs something better: a pyrheliometer, a tube that follows the Sun and records its direct light every minute. The record is open to anyone.[7] It says, to the minute, when sunlight stops reaching the mountain each evening. 55 km away towards the summer sunset, at Keahole Point on the coast (4 m), there is also a station.[8] It measures only the light of the whole sky, which does not mark the sunset, so its sunset is computed. Both are put on one clock.

*[Figure: An animated cross-section through the Earth in the direction of the sunset, with Mauna Loa Observatory on its mountain and Keahole Point on the coast 55 km closer to the Sun. As the clock runs, the last ray of sunlight, grazing the sea, sweeps upward: Keahole falls into the Earth's shadow first, the mountain minutes later. Below, the western sky from each place, and the direct sunlight measured at Mauna Loa on the same clock.]*

- Keahole sunset, computed: 18:51:16 (18:49:07 without refraction)Mauna Loa, last edge computed: 18:57:37 (18:54:54 without refraction)Mauna Loa, last direct light measured: 18:53:51, Sun's centre 1.89° below the horizontal2016: 104 clear evenings with a sea horizon; last light with the Sun's centre 1.72° below the horizontal (median), 1.9 min after Keahole's computed sunset

*Figure caption:* **One clock, two sunsets.** Top: a cross-section through the Earth in the direction of the setting Sun on a typical evening, chosen by a rule fixed in advance: of the year's clear evenings, the one whose last light came closest to the median. The Sun is to the left. The yellow line is the last ray that still reaches the ground, grazing the sea. The grey band behind the Earth is its shadow. Rule 1: to show a 3.4 km mountain beside the curve of the sea, the Earth is drawn smaller and the distances along the ground shortened, by the factors printed on the figure. The heights are true, and the ray and its tangent point land where they would on the real Earth. The terrain between the two places is the Copernicus surface model. Middle: the western sky from each place, at true angular scale, with eye level dashed. From the mountain the sea horizon lies 1.7° below eye level, and the Sun sinks into that gap before it sets. Bottom: the direct sunlight measured at Mauna Loa that evening (black), with the computed sunsets. Click to pause.

$$a_{\odot} = -(\varphi + \rho_0 + s)$$
$$\varphi = \dfrac{1}{1-k}\arccos\dfrac{R_e}{R_e + h}, \qquad R_e = \dfrac{R}{1-k}$$
Keahole (h = 4 m): a = −0.81° · Mauna Loa (h = 3,397 m): a = −2.75° (−2.13° without refraction)

a is the true altitude of the Sun's centre at the moment its upper edge disappears. The last ray that reaches the eye grazes the sea at a tangent point, an arc φ away. Beyond that point it bends a further ρ₀ ≈ 34′ in the air[1], and the centre of the Sun is s ≈ 16′ below its edge.[4] Refraction near the ground enters through Rₑ = R/(1 − k), k = 0.13.[2] The mountain keeps the Sun until it is almost 2° lower than at the coast, about 9 minutes of the Sun's motion on a summer evening there. Keahole lies 55 km further west, which alone gives it about 2 minutes more, so the mountain's lead is 6 to 7 minutes.

One evening proves little, so here is the whole of 2016. The direct light ended on 331 evenings, 286 of them clear. On 104 of those, the Sun set where the observatory's horizon is the sea: April to August. In the other months it sets further south, behind the slopes of Mauna Loa itself (the Copernicus terrain model[9]). Those evenings are left out by that rule alone. On the 104, the light stopped with the Sun's centre 1.72° below the horizontal (median), and below it on 90 evenings. It stopped a median 1.9 minutes after Keahole's computed sunset, and later than that sunset on 70 evenings. The geometry predicts more: the last edge at −2.75°, 6.6 minutes after Keahole (6.0 without refraction). The instrument loses the beam about a degree early, because a ray grazing the sea crosses hundreds of kilometres of low air and arrives too dim for the 5 W/m² threshold. That loss works against the effect, not for it.

> **What the plane predicts, and what would have vindicated it.** On a plane, nothing is ever seen below eye level. And a lamp at height H and distance D is seen at atan((H − h)/D): lower from a mountain than from the shore. If anything, the mountain would lose the Sun *first*. On a globe the mountain loses it minutes *later*, and the record agrees on most evenings. What would vindicate the plane: on the same clear evening, the mountain's last direct light coming no later than the coast's, measured by the same kind of instrument at both places. That second instrument is what this section lacks. Keahole's sunset is computed, so the comparison is between a measurement and a prediction, not between two measurements.

> **Limits, stated in advance.** The tracker is aimed by the same astronomical calculation used here, and it sees a patch of sky several degrees wide. On its own, then, it cannot place the Sun to a fraction of a degree. What it fixes is the *time* the light stops, and the Sun's position at that time is ordinary astronomy, the same that predicts every sunset at sea level. The threshold makes the measured last light come early, by about a degree, and the amount varies with the haze. Near azimuth 300° the summit of Hualālai, 35 km away, rises just above the sea horizon. No evening of 2016 set there, and the rule would have left it out. This is one year of one observatory; the build script redoes any other year.

Why a plane has no horizon at all. On an infinite plane the ground's depression angle below eye level is atan(h/x), which shrinks toward zero as x grows but never reaches it. The surface would fade into haze at a distance set by air clarity — blurry, weather‑dependent, and different for every camera. What is actually seen is a *sharp, hard edge* at a definite distance that sharpens with better optics, sits lower the higher you climb, and hides ships hull‑first. The right panel shows the flat model's depression at the same distance where the globe places its horizon: a number that is not zero, but is far too small and in the wrong place.

Refraction, again. Air bends light downward, pushing the horizon farther away and reducing the dip by roughly 8%. That is why the almanac constant is 1.76′√h rather than the geometric 1.93′√h. Toggle it above: it changes the numbers by a few percent, never the sign, and never rescues zero.

The through‑line. Same R again — the dip is simply the elevation angle of the tangent sightline, the limiting case of the Simulator's geometry when the target's height goes to zero. It is the horizon whose dip the perspective panel already draws, and the same R that fixes k = 1/R and converts Δλ into kilometres.

**See also**[Refraction](/ai/ref.md)[Hidden height](/ai/hh.md)[Elevation angles](/ai/elev.md)[Observation](/ai/obs.md)

## Sources for this tab

1. [1] [Bowditch, *The American Practical Navigator*, Vol. 2 (NGA, 2019; PDF hosted by the US Coast Guard)](https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf) — the dip correction itself: the almanac constant 1.76′·√h (refracted) against the geometric 1.93′·√h, applied before every sextant sight, with the tables reproduced.
2. [2] [Andrew T. Young, *Dip of the Horizon* (San Diego State University)](https://aty.sdsu.edu/explain/atmos_refr/dip.html) — the derivation of the dip and of the R/(1 − k) substitution, the sensitivity of the dip to the temperature difference between eye and horizon, and the historical accounts of the doubled sunset: Minnaert running up a six-metre dyke for twenty more seconds of green flash, and Captain Havinga seeing it earlier from the lower bridge than his officer on the upper.
3. [3] D. Rawlins, "Doubling your sunsets or how anyone can measure the earth's size with wristwatch and meter stick", *American Journal of Physics* **47**(2), 126–128 (1979). Left unlinked on purpose: the journal text is paywalled and the copies that circulate are scans of uncertain provenance. The method is described in full in [6].
4. [4] [NASA NSSDCA, *Sun Fact Sheet*](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) — the Sun's apparent angular diameter, 31.6′ to 32.7′ over the year, which sets the 32′ used throughout this section.
5. [5] P. E. Ciddor, [“Refractive index of air: new equations for the visible and near infrared”](https://doi.org/10.1364/AO.35.001566), *Applied Optics* **35**(9), 1566–1573 (1996) — the refractive index of standard dry air in the visible, n − 1 = 2.778·10⁻⁴ at 550 nm, 15 °C and 1,013.25 hPa (its dispersion formula), proportional to density; used here as n − 1 = 79.01·10⁻⁶·P/T.
6. [6] H. Hersbach et al., [“The ERA5 global reanalysis”](https://doi.org/10.1002/qj.3803), *Q. J. R. Meteorol. Soc.* **146**, 1999–2049 (2020), read through the [Open-Meteo historical weather API](https://open-meteo.com/en/docs/historical-weather-api) on 2026-09-29 by `fog build dip-atmos` — air temperature and pressure at 2 m at Caussols and over the Ligurian Sea (43.5° N, 8.5° E), and the sea-surface temperature, on 13 June 2026 at 15:00 and 16:00, interpolated to 15:23; the free air at 1,210 m over the sea from Météo-France's AROME model (900 and 850 hPa levels, Open-Meteo historical forecast).
7. [7] [NOAA Global Monitoring Laboratory, *Baseline surface radiation, Mauna Loa Observatory (MLO)*, one-minute data](https://gml.noaa.gov/aftp/data/radiation/baseline/mlo/) — the direct normal irradiance of the tracking pyrheliometer at 19.536° N, 155.576° W, 3,397 m, every minute of 2016 (instruments: [MLO solar radiation programme](https://gml.noaa.gov/obop/mlo/programs/esrl/solar/solar.html)). Open, no account. The evenings are extracted by `fog build dip-mlo`.
8. [8] [NREL (now NLR) Measurement and Instrumentation Data Center, *Natural Energy Laboratory of Hawaii Authority (NELHA)*](https://midcdmz.nlr.gov/apps/sitehome.pl?site=NELHA) — the Keahole Point station: 19.728144° N, 156.058936° W, 4 m. It records global horizontal irradiance only, which does not mark the moment of sunset; its sunset on this page is computed.
9. [9] [ESA / Airbus, *Copernicus DEM GLO-30*](https://doi.org/10.5270/ESA-c5d3d65) — the 1-arc-second surface model used to find the observatory's horizon at every azimuth from 230° to 310° (`fog build dip-mlo`): the sea from 281° to 310°, the slopes of Mauna Loa itself further south.
10. [10] A. C. Sparavigna, [“The Science of al-Biruni”](https://arxiv.org/abs/1312.7288), *International Journal of Sciences* 2(12), 52–60 (2013) — al-Bīrūnī's method: the hill's height from two sightings a known distance apart, then the dip of the horizon from its top, at the fort of Nandana; his radius, 3,928.77 English miles (about 6,323 km), after C. K. Raju (2007).

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [Sparavigna (2013), "The Science of al-Biruni" (arXiv)](https://arxiv.org/pdf/1312.7288) — al-Bīrūnī's height-plus-dip measurement at the Fort of Nandana and the resulting Earth radius, within about 2% of the modern reference value.
- [MacTutor History of Mathematics: al-Biruni](https://mathshistory.st-andrews.ac.uk/Biographies/Al-Biruni/) — biography and his geodesic work in context.
- [Hirt et al. (2010), *J. Geophys. Res.* — terrestrial refraction coefficient](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067) — why refraction biases the one-hill method by ~10% and why k is weather-dependent, as the table above shows.
- [Bowditch, *The American Practical Navigator*, Vol. 2 — dip tables](https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf) — the published dip and horizon-distance tables against which every entry in the vantage-point list above can be checked. The heights themselves are the operators' own published figures (basilica esplanade 142 m, Eiffel Tower top platform 276 m, Burj Khalifa SKY 555 m); the summits are from the sources in tab 1.
- **Explanatory Supplement to the Astronomical Almanac**, 3rd edition (2013), chapter 7 — the conventions behind the dip and refraction corrections that the almanacs tabulate.
- **Jamil Ali (trans.), *The Determination of the Coordinates of Positions for the Correction of Distances between Cities* (American University of Beirut, 1967).** The standard English translation of al-Bīrūnī's *Taḥdīd*, in which the mountain-dip method is set out by the man who used it around 1018. The sources above discuss it; this is the text itself.
