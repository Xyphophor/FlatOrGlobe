# The air above us: why it stays, how it bends radio waves, why satellites do not melt

> Tab "Atmosphere" of *Flat plane or Globe?*. Web page: /#tab-atmo. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Atmosphere · pressure, eruptions, radio waves, heat*

Three questions often asked as objections. How can the air sit next to the vacuum of space with no container? How can a radio amateur talk to someone beyond the horizon? How can a satellite survive in a layer of air at a thousand degrees? Each has a measured answer, and the same physics works on any shape of Earth: the shape shows up only in the details, which this page points out. The air also carries a measurement of its own: the pressure waves of two volcanic eruptions, Hunga Tonga in 2022 and Krakatoa in 1883, timed on ordinary barometers, give the Earth's radius.

## Why the air stays without a lid: the pressure gradient

**Gravity is the container.** Every molecule is pulled down; molecules collide and push on each other; each layer of air carries the weight of all the air above it. So the pressure falls with height, smoothly, with no edge: half the sea-level pressure at 5.5 km, a tenth at 16 km, a hundredth at 31 km, a millionth near 100 km[1]. At the top, molecules move at about a kilometre per second, far below the 11 km/s needed to leave the Earth; thrown up, they fall back like a ball.

*Figure caption:* **No lid, and the air still stays.** Seven hundred molecules thrown about with the speeds of a gas at a given temperature, pulled down by gravity, bouncing off the ground; there is no ceiling, and the ones that leave the frame come back. On the right, how many are found in each slice of height (bars), against the exponential law e^−h/H (orange): the profile holds by itself. The left axis gives the true scale for air at 15 °C, one scale height H = 8.4 km; the pressures on the right are those of the 1976 standard atmosphere at those heights. Click to pause.

$$\frac{dp}{dh} = -\rho\,g,\qquad p = n\,k\,T$$
$${p(h) = p_0\,e^{-h/H}},\qquad H = \frac{k\,T}{m\,g}$$

p is the pressure, ρ the density and n the number of molecules per m³, g the acceleration of gravity, k Boltzmann's constant, T the temperature and m the mass of a molecule. The first line says that a thin layer of air is held up by the difference of pressure between its bottom and its top; with a constant temperature, it gives the exponential of the second line. H, the scale height, is 8.4 km for air at 15 °C: every 8.4 km up, the pressure is divided by e = 2.718.

*Figure caption:* The 1976 standard atmosphere from the ground to 500 km: the pressure on a logarithmic axis (blue), falling smoothly over a dozen powers of ten with no edge, and the temperature (orange), which falls in the troposphere, rises in the stratosphere, falls again in the mesosphere and climbs to about 1,000 K in the thermosphere.

> **The objection** says that a gas next to a vacuum must spread out, so the air needs a wall, and a dome. It would, without gravity. With it, the same molecules form a column whose pressure falls exponentially and never meets a wall: that is what barometers carried up mountains, weather balloons and rockets have measured since the seventeenth century. **What would vindicate a container:** an atmosphere whose pressure stays nearly constant with height and then drops to zero at a definite altitude, where a wall would be.

## The air rang too: Hunga Tonga's pressure wave on 102 barometers [evidence: measurement]

*[Figure: Animation: the Hunga Tonga pressure wave lighting 102 US barometers at their recorded times; their band-passed traces side by side, two bands of pulses crossing; the short way and the long way around the globe adding up to one lap, and the radius from each barometer; the best flat-map predictions against the same traces; the Krakatoa barographs of 1883 lighting at each of up to seven passes; the three wave trains of the 1961 explosion at eight Japanese microbarographs, with the lap between the first and the third; every lap of the three events on one ruler and the radius from all of them; a summary]*

*Figure caption:* **Three explosions in under a minute.** The Hunga Tonga pressure wave lighting 102 barometers at their recorded times; their traces side by side, the pulse passing twice; the short way and the long way adding up to one lap, and the radius from each barometer with no distance and no map; the best flat-map predictions against the same traces; the Krakatoa barographs of 1883 lighting at each pass; the three wave trains of the 1961 Novaya Zemlya explosion in Japan, a lap from the first to the third; every lap of the three events on one ruler, and the radius from all of them. Every number is the page's own. Click to pause.

On 15 January 2022 at 04:14:45 UTC the Hunga Tonga–Hunga Ha'apai volcano exploded.[11] The blast sent a pressure pulse through the whole depth of the atmosphere, a Lamb wave, which instruments all over the world recorded circling the planet four times.[14] Every US airport weather station (ASOS) logs its barometer once a minute, and the logs are open.[10] This section uses 102 of them: two per state, plus Alaska, Hawaii and Puerto Rico. The pulse is typically 0.6–0.75 hPa high. The background before it is about 0.1 hPa.

Each record is filtered (a 5-minute mean minus a 2-hour mean). Then two arrivals are picked without any model of the Earth. t₁ is the largest pulse between 2 and 20 hours after the eruption, and t₂ the largest between t₁ + 6 h and 40 h. The windows are wide on purpose, so they cannot carry the answer. Each station's angle θ from the volcano is computed from its coordinates only afterwards.

$$t_1 = \dfrac{R\,\theta}{v}, \qquad t_2 = \dfrac{R\,(2\pi - \theta)}{v}$$
$$t_1 + t_2 = \dfrac{2\pi R}{v} \quad\Rightarrow\quad R = \dfrac{v\,(t_1 + t_2)}{2\pi}$$
$$v \approx 310\ \text{m}/\text{s}$$

On a sphere the wave reaches every station twice, once each way round, and the two paths add up to one circumference. So t₁ + t₂ is the same at every station, whatever its θ. On a plane the pulse is a circle growing from the volcano: it crosses each station once, and nothing comes back from the other side. To produce a second arrival the flat model needs an extra ingredient: an echo off a rim, or a bounce off a dome overhead. Both are tried below, in its favour.

- 102 barometers, 90 with both passagesbest plane, first passage: 3.2× the globe's scatter

R = 6,382 ± 73 km

95% confidence: 6,240 – 6,525 km · the mean radius, 6,371 km, lies 0.16 σ away

statistical ± 5 km (64 stations) · systematic ± 73 km, mostly the wave's speed (the two eruptions differ by 1.1 %)

flat models, tuned in their favour: no radius, and a scatter 9× the globe's (best: a dome 22,111 km high)

*Figure caption:* **The radius found, and how sure it is.** The dot is the median of the 64 stations that saw both passages. The dark bar is the statistical uncertainty alone, a few kilometres. The pale bands are the total uncertainty, at one standard deviation and at 95%. Almost all of it is systematic: it is measured by redoing the calculation with each of the other reductions this section shows (each passage alone, the start time left free) and with the speed the 1883 eruption needs, 1.1% lower (the small ticks). The speed measured during this event is not used: it was measured with globe distances. The mean radius, 6,371 km, falls inside the band. This is the value carried to the home page's table of radii.

*Figure caption:* **The V: 102 barometers, sorted by their angle from the volcano.** Each thin line is one station's filtered pressure. The first band of pulses arrives later the farther away the station. The second band arrives *earlier* the farther away the station, because the stations farthest from Tonga are the closest to it the long way round. The blue dashes are the globe with nothing fitted (R = 6,371 km, v = 310 m/s, start at the eruption). The orange dots are the plane's best fit to the first band, with its speed and start time both free. There is no orange second band: an expanding circle does not come back. The orange open circles are the second flat model, a bounce off a dome at its best height. At that height the bounced path is almost the same length everywhere, so they barely slope at all, and the little slope they have goes the wrong way: later the farther the station.

*Figure caption:* **One radius per station.** Open circles: R = v t₁ / θ, from the first passage. Dots: R = v t₂ / (2π − θ), from the second. Grey: excluded, more than 3 standard deviations from the others. The second passage, the cleaner of the two, puts every kept station within a few tens of kilometres of 6,371 km. Both sets drift slightly downward with θ, by about 1.3 km per degree (some 100 km across the United States). That drift is real and is left in; it is explained below.

**The radius three ways from the same picks, then with the start time left free**

| Reduction | Stations kept | Mean R | Spread | Off 6,371 km |
| --- | --- | --- | --- | --- |
| first passage, R = v t₁ / θ | 80 / 96 | 6,392 km | ± 89 km | +0.3 % |
| second passage, R = v t₂ / (2π − θ) | 76 / 90 | 6,380 km | ± 21 km | +0.1 % |
| both, R = v (t₁ + t₂) / 2π | 64 / 90 | 6,383 km | ± 33 km | +0.2 % |
| both on one line, t₀ left free | 157 / 186 | 6,373 km | ± 7 km (fit) | +0.0 % |

$$L = \sqrt{d^2 + 4h^2}, \qquad \dfrac{\mathrm{d}L}{\mathrm{d}d} = \dfrac{d}{\sqrt{d^2 + 4h^2}} > 0$$

The second flat model. The pulse goes up, bounces off a dome and comes down. Over the region the vault is taken as a ceiling at height h, and in a mirror the bounce becomes a straight line from the volcano's image, 2h up. Whatever h, that path grows with distance, so the echo would reach the farther stations *later*. The real second passage reaches them *earlier*, by 0.76 h per 1,000 km of map. That is a sign, not a size, and no height flips it. A dome posed on the map's edge adds nothing new: its shortest path runs along its foot, which is the rim echo in the table below.

**How closely each model's best line follows all 186 picks**

| Model | Free parameters | Speed | Start | Scatter |
| --- | --- | --- | --- | --- |
| globe, nothing fitted (R = 6,371 km, v = 310 m/s) | 0 | 310 m/s | 0 h | 7 min |
| globe, v and t₀ free | 2 | 310 m/s | +0.0 h | 7 min |
| plane, first passage only | 2 | 427 m/s | +1.5 h | 27 min |
| plane, second passage as an echo off a rim at 20,015 km (the map's edge) | 3 | 270 m/s | −3.0 h | 111 min |
| plane, second passage as an echo off a rim at 25,000 km | 3 | 435 m/s | +1.8 h | 89 min |
| plane, second passage as an echo off a rim at 40,000 km | 3 | 937 m/s | +6.1 h | 88 min |
| plane, second passage as an echo off a rim at 60,000 km | 3 | 1,620 m/s | +7.7 h | 89 min |
| plane, second passage as an echo off a rim at 100,000 km | 3 | 3,002 m/s | +8.8 h | 80 min |
| plane, second passage bounced off a dome 22,111 km high (best height) | 3 | 581 m/s | +3.8 h | 65 min |

> **The flat model, tuned in its favour, still misses by hours.** With its own speed and start time, the plane fits the first band with a scatter of 27 minutes. On the same band the globe, with nothing fitted at all, scatters by 8 minutes. The plane's fit also needs the wave to travel at 427 m/s, 38% faster than the 310 m/s the air's temperature allows.[12] For the second band the plane has no path at all. It was offered an echo off a rim, at any radius from the map's edge (20,015 km) out to 100,000 km. Its best line then scatters by 80 to 111 minutes. It also has to start the wave between three hours before and almost nine hours after the eruption, whose time is measured. That echo comes off the nearest stretch of the rim, so it arrives later the farther the station, roughly parallel to the first band. An echo off the far side of the rim would slope the right way, but every station would first have heard the near-rim echo, and no trace shows it. The dome does a little better and still fails: at its best height, 22,111 km, it scatters by 65 minutes, needs 581 m/s, and starts the wave 3.8 h after the eruption.

> **What this measurement cannot do.** R is proportional to v. The 310 m/s comes from the physics of the air.[12][13] But the speed measured during this very event was 318 ± 6 m/s,[15] and with it every radius here would be 2.6% larger (about 6,550 km). That speed was itself measured with globe distances, so using it to compute R, or even to size the uncertainty, would be circular: it is quoted and nothing more. The uncertainty takes instead the speed the Krakatoa wave of 1883 needs, 1.1% lower, a ratio of lap times with no radius in it. That is about 70 km, far more than the spread between stations. A second limit: all the stations are in the United States, between 45° and 116° from Tonga. That is too short a lever to fit the start time and the radius together. Left free, the first band alone gives 6,193 km and the second alone 6,691 km, with a start 1.3 h before the eruption. The two disagree, and only the measured eruption time reconciles them. The slow drift of R with θ is the same problem seen another way. A speed that differs slightly from one path to another, or an effective start slightly off the explosion, would each produce it, and US stations alone cannot tell the two apart. What survives all of this needs no speed at all: two bands sloping opposite ways, the V.

## Before any of it: Krakatoa, 1883, on the barographs of the Victorian world [evidence: measurement]

On 27 August 1883 Krakatoa, a volcano in the Sunda Strait between Java and Sumatra, blew itself apart. Its pressure wave was traced by the self-recording barometers of observatories from Melbourne to Toronto, and the Royal Society's Krakatoa committee gathered the traces. Lieutenant-General Strachey, of the Meteorological Office, read up to seven passages of the same wave on them, and printed the times station by station in Greenwich Mean Time.[16] This section uses nothing else: 47 stations, typed in from the scanned tables. They were also checked against the report's own table of intervals between passages: all 175 agree to the minute.

The method needs even less than Tonga's. At any one station, passage III is passage I one full turn of the Earth later, and IV is II one turn later in the other direction. Subtracting two readings of the same barograph's clock gives the time of one lap. That needs neither the station's position nor the moment of the explosion, which nobody measured: Strachey had to work it out from the waves themselves. The wind speeds up the wave one way round and slows it the other (Strachey's own explanation[16]), so one lap in each direction is averaged.

$$T_{\to} = t_{\text{III}} - t_{\text{I}}, \qquad T_{\leftarrow} = t_{\text{IV}} - t_{\text{II}}$$
$$R = \dfrac{v\,(T_{\to} + T_{\leftarrow})}{4\pi}$$
$$v \approx 310\ \text{m}/\text{s}$$

Each lap is the difference between two readings of one clock, so a clock set wrong cancels out, and so does the station's position. On a plane there is no lap. A circle growing from the volcano crosses each station once; to get later passages the plane needs echoes, off a rim or off a dome, and their delays depend on where the station sits. The real laps do not: from Calcutta, 33° from Krakatoa, to Washington, 147°, they take about 36 hours one way round and 35 the other.

- 47 barographs of 1883, 29 with a lap each waylaps: 36.2 h towards the antipodes, 34.7 h coming back

R = 6,310 ± 137 km

95% confidence: 6,042 – 6,578 km · the mean radius, 6,371 km, lies 0.45 σ away

statistical ± 8 km (29 stations) · systematic ± 136 km: the gap fit and the wave's speed (the two eruptions differ by 1.1 %)

flat models, tuned in their favour: no lap at all, and on the first interval a scatter 4× the globe's

*Figure caption:* **The radius from 1883, and how sure it is.** The dot is the median of the 29 stations with a clean lap in each direction (times Strachey marked with a “?” left out). The dark bar is the statistical uncertainty alone. The pale bands are the total uncertainty, at one standard deviation and at 95%. As for Tonga, almost all of it is systematic: the small ticks redo the calculation with every lap, with the queried times kept, from the interval between the first two passages, and with the speed the 2022 eruption needs, 1.1% higher. The speed measured in 2022 is not used: it was measured with globe distances. The mean radius, 6,371 km, falls inside the band. This value is carried to the home page's table of radii.

*Figure caption:* **One lap of the Earth, at every station.** Each point is the time between two passages of the same wave over one barograph, spread out by the station's angle from Krakatoa, which is not used to compute it. Dots: laps towards the antipodes (III − I, V − III, VII − V), about 36.2 h. Open circles: laps coming back (IV − II, VI − IV), about 34.7 h. The gap between the two is the wind Strachey described. The dashed line is the globe with nothing fitted, 6,371 km at 310 m/s: 35.9 h. The North American stations (θ ≈ 142–147°) split the most, both ways. Their waves passed close to the poles, and Strachey called their speeds “peculiar”. They are kept.

**The radius from the same printed times, six ways**

| Reduction | Stations kept | Median R | Spread | Off 6,371 km |
| --- | --- | --- | --- | --- |
| first lap each way, (III − I + IV − II) / 2 | 29 / 29 | 6,310 km | ± 48 km | −1.0 % |
| every lap each way, averaged | 29 / 29 | 6,332 km | ± 59 km | −0.6 % |
| first laps, queried times kept | 36 / 37 | 6,308 km | ± 49 km | −1.0 % |
| towards the antipodes only (wind not cancelled) | 35 / 36 | 6,468 km | ± 131 km | +1.5 % |
| coming back only (wind not cancelled) | 26 / 29 | 6,187 km | ± 87 km | −2.9 % |
| interval I → II against θ, R/v fitted | 40 / 40 | 6,173 km | ± 37 min (fit) | −3.1 % |

*Figure caption:* **The first interval, passage I to passage II, against the angle from the volcano.** On a globe it is the time to go on to the antipodes and come back, (2π − 2θ) R / v: a straight line, 28 h near Krakatoa, 7 h near its antipodes. Black dots: the 40 stations with both times unqueried. Blue dashes: the globe with nothing fitted. Orange: the plane at its best, with its own speed. The dots are a single echo off a rim at the map's edge. The open circles are a bounce off a dome at the best height. Neither follows the measured points.

**How closely each model follows the 40 intervals I → II**

| Model | Free parameters | Speed | Scatter |
| --- | --- | --- | --- |
| globe, nothing fitted (R = 6,371 km, v = 310 m/s) | 0 | 310 m/s | 50 min |
| globe, R/v free | 1 | 320 m/s | 37 min |
| plane, II as an echo off a rim at 20,015 km (the map's edge) | 1 | 295 m/s | 446 min |
| plane, II as an echo off a rim at 25,000 km | 1 | 454 m/s | 403 min |
| plane, II as an echo off a rim at 40,000 km | 1 | 946 m/s | 362 min |
| plane, II as an echo off a rim at 60,000 km | 1 | 1,609 m/s | 347 min |
| plane, II as an echo off a rim at 100,000 km | 1 | 2,941 m/s | 338 min |
| plane, II bounced off a dome 5,012 km high (best height) | 2 | 62 m/s | 200 min |

> **The flat model, tuned in its favour.** The test uses only the interval between the first two passages, which a plane can at least attempt: the wave goes out once, and an echo comes back once. The intervals need no explosion time, so the only free parameter is the plane's speed. With an echo off a rim, at any radius from the map's edge (20,015 km) out to 100,000 km, its best line scatters by 5.6 to 7.4 hours, and it needs 295 to 2,941 m/s. The globe, with nothing fitted, scatters by 50 minutes. With a bounce off a dome, the best height is 5,012 km: the scatter is 3.3 hours and the wave would have to travel at 62 m/s, a fifth of the speed of sound. The later passages, five more at many stations, are not modelled for the plane: each would need yet another echo. **What would have vindicated the plane:** laps that change with the station's position, as any echo would make them, or no regular passages after the first two.

> **What this measurement cannot do.** As with Tonga, R is proportional to the speed v. With the speed measured in 2022 (318 m/s[15]), the radius would become 6,477 km, but that speed was measured with globe distances and is quoted only, never used in the uncertainty. The two eruptions also differ from each other at equal speed. 1883 gives 6,310 km and 2022 gives 6,382 km, 1.1% apart: one wave crossed an August atmosphere, the other a January one, and the Lamb wave's speed depends on the air's temperature. Strachey had to choose which wiggle of each trace counts as “the” passage. He states his reading errors to be well within thirty minutes,[16] which is 1.4% of a lap. One direction alone gives 6,468 km (out) or 6,187 km (back): the wind is not small, and only the average cancels it. The North American and Australian stations sit low (6,202–6,252 km) and are kept. The interval I → II, fitted against θ, gives 6,173 km: it mixes the two directions unevenly, and it needs the station's position. None of these limits touches the shape of the result: a lap of the same length wherever the barograph stood.

## Every lap together: two eruptions and a bomb, one size [evidence: measurement]

The same pressure wave has now been timed three times, by three generations of instruments: Krakatoa in 1883 on paper barographs, the Soviet test of 30 October 1961 at Novaya Zemlya (the "Tsar Bomba") on Japanese microbarographs, and Hunga Tonga in 2022 on airport barometers. Each lap timed at one station gives R = vT/2π on its own, with no position, no map and no distance. Here every lap goes into one measurement, as the earthquakes do in the seismology tab: 147 laps from four sets give **6,388 km ± 43 km**.

R = 6,388 ± 43 km

95% confidence: 6,305 – 6,472 km · the mean radius, 6,371 km, lies 0.41 σ away

statistical ± 6 km (147 laps) · systematic ± 42 km: how far the result moves when the sets are combined other ways

*Figure caption:* **Every lap, one ruler.** Each dot is one station's lap turned into a radius at 310 m/s; the black tick is the set's median. Blue sets time the wave both ways round, which cancels the wind; violet sets time one way only. Each set is tight, and the sets sit within 2.9 % of each other: the wave's speed changes with each route's wind and temperature. Combined other ways (each set weighing the same, one set left out at a time, only the sets timed both ways), the result moves by at most 42 km: that is its systematic uncertainty, and it dominates. The bottom row is all the laps together, with its bands at one standard deviation and at 95%. This value is carried to the home page's table of radii.

**The four sets of laps and the result**

| Set | Lap | Directions | Laps kept | Median R | Off 6,371 km |
| --- | --- | --- | --- | --- | --- |
| Hunga Tonga 2022, t₁ + t₂ | t₁ + t₂ (eruption time measured) | both ways | 64 | 6,382 km | +0.2 % |
| Hunga Tonga 2022, lap A4 − A2 | A4 − A2, same station | one way | 50 | 6,418 km | +0.7 % |
| Krakatoa 1883, laps both ways | (III − I + IV − II) / 2, same station | both ways | 29 | 6,310 km | −1.0 % |
| Novaya Zemlya 1961, lap III − I | III − I, same station | one way | 4 | 6,234 km | −2.1 % |
| **all together** | median of every lap |  | 147 | **6,388 km** | +0.3 % |

**Novaya Zemlya, 1961.** N. Murayama of the Japan Meteorological Agency tabulated three passages of the wave at eight microbarographs: the first by the short way, the second by the antipodal way, and the third, the first one back after a full circuit.[17] The third minus the first, at one station, is a lap: 35.08–35.13 h at 4 of the 5 stations whose times he did not mark as uncertain (the fifth, 9 minutes shorter, falls more than three standard deviations from the others and is set aside by the rule used everywhere on this site). To check our transcription, each velocity he printed is found again from his distance and his time; his distances used the radius of 1962, so they serve only that check. **Hunga Tonga, seven days.** The wave went round four times one way and three the other.[14] With the same barometers over seven days, each passage's return was looked for 24 to 48 hours later, a window as wide as a sphere of 4,260 to 8,520 km. The long-way passage came back after 36.13 h at 50 of 86 stations, within 4 min of each other. The other returns did not stand out of the weather: their picks spread over the whole window (5–7 h of scatter), so they are left out rather than forced.

> **What this measurement cannot do.** All four sets share the speed of 310 m/s, computed from the air's temperature and fixed in advance.[12] A different speed scales the result in proportion. The sets disagree with each other by more than their own scatter: the 1961 lap and the 2022 long-way lap were timed one way round only, so the wind along their route stays in them, and Krakatoa shows how much that can be. Pooling does not hide that disagreement: the systematic uncertainty is how far the answer moves when the sets are combined differently, and it is most of the total. Pooling only stops one event from deciding the answer alone. What the pooling does show is the shape: whatever the year, the instrument and the route, a lap at one station lasts the same 35 to 36 hours.

## Radio waves and the ionosphere

**Above 60 km, sunlight strips electrons off the air.** The free electrons form layers: D (60–90 km, by day only), E (around 110 km) and F (150–500 km, densest near 300 km). A radio wave entering this electron gas is turned back where its frequency equals the local plasma frequency, which grows with the number of electrons[3]. Long waves (below 1 MHz) mostly creep along the ground and, by day, are absorbed by the D layer. Short waves (3–30 MHz) are bent back to the ground, beyond the horizon, and can go round the world in several hops; between the ground wave and the first return lies a skip zone where nothing is heard[4]. Above 30–50 MHz the waves go through: FM radio and television reach only to the horizon, and satellites, GPS among them at 1.2–1.6 GHz, use frequencies the ionosphere cannot stop. At night the D layer vanishes and the F layer thins: lower frequencies travel far, which is why distant medium-wave stations come in after dark.

*Figure caption:* **Which waves the ionosphere sends back.** A section of the Earth at true scale, a transmitter on the left, the D, E and F layers at their heights with their critical frequencies, by day then by night. Every few seconds another frequency: 500 kHz follows the ground and fades; 3.5 MHz is absorbed by day and bounces at night; 7 to 28 MHz bounce in hops beyond the horizon, leaving a skip zone (orange dots); 144 MHz goes straight through to space. Each ray leaves at a different elevation and is reflected only if its frequency is below the critical frequency times the secant of its angle on the layer. Click to pause.

$$f_p = 8.98\,\sqrt{N_e}\ \text{Hz}$$
$${f \le f_{oF2}\,\sec\varphi}\ \Rightarrow\ \text{reflected}$$

N_e is the number of free electrons per m³, f_p the plasma frequency, f_oF2 the critical frequency at the peak of the F layer and φ the angle at which the wave meets the layer. With 10¹² electrons per m³ (a sunny day), f_oF2 = 9.0 MHz: a wave sent straight up at 14 MHz goes through, but the same wave sent low over the horizon meets the layer at a grazing angle and comes back[3].

$${d_{\max} = 2R\,\arccos\frac{R}{R+h}}$$

R is the Earth's radius and h the height of the reflecting layer. The longest single hop is the one that leaves and returns grazing the ground: for the F layer at 300 km, d_max = 3,836 km, which is why HF predictions count F2 hops of up to about 4,000 km and longer paths in several hops[4]. A flat ground under a flat mirror would put no limit on the length of one hop.

**The radio bands and what the ionosphere does to them[3][4].**

| Band | Frequencies | What happens | Used for |
| --- | --- | --- | --- |
| LF / MF | 30 kHz – 3 MHz | ground wave; absorbed by the D layer in daytime, reflected at night | long and medium-wave broadcasting, navigation beacons |
| HF | 3 – 30 MHz | reflected by the E and F layers, in hops beyond the horizon; skip zone | short-wave broadcasting, radio amateurs, aircraft over oceans |
| VHF | 30 – 300 MHz | goes through (except rare E-layer clouds): line of sight | FM radio, aircraft and marine radio |
| UHF / SHF | 300 MHz – 30 GHz | goes straight through: line of sight and space | television, mobile phones, GPS, satellite links |

> **The objection** says that radio contacts thousands of kilometres away, beyond the horizon, prove a flat Earth. They happen at short wave, not at VHF or microwave frequencies, and their reach changes with the hour, the season and the Sun's activity exactly as the ionosphere does: they are reflections. **What would vindicate the flat model here:** VHF and microwave links routinely working far beyond the line of sight with no satellite and no relay, or single short-wave hops much longer than 4,000 km.

## Why satellites do not melt in the thermosphere

**Temperature is not heat.** The two words answer two different questions. **Temperature** says how hard *each* molecule hits: it measures the energy of one molecule, that is how fast it moves, whatever their number. **Heat** says how much energy *reaches* a body each second: the energy of one hit times the number of hits. A gas can therefore be very hot and bring almost no heat, if its molecules are few.

**An everyday example.** In a sauna the air is at 90 °C and one sits in it for minutes; water at 90 °C scalds in a second. Same temperature, so each molecule hits just as hard; but the same volume of water holds over a thousand times more molecules, so a thousand times more hits. In the same way the hand stands the air of an oven at 200 °C for a moment, not its metal tray, and a sparkler's sparks are over a thousand degrees but so small that they do not burn the hand. The thermosphere is the extreme case: a very high temperature, and almost nothing there to bring it.

**The numbers at 400 km.** The temperature there is about 996 K: each molecule is very fast[1]. But at that height, where the International Space Station flies[7], there are 1.06 × 10¹⁴ molecules per cubic metre, 241 billion times fewer than at sea level. Their impacts on a surface at room temperature bring 0.58 mW per square metre[2]. The same gas at sea-level density would bring 105 MW per square metre and melt anything.

*Figure caption:* **The same 1,000 K, two very different heats.** The same box on both sides, a cube of one micrometre resting on one square micrometre of wall at 300 K, watched for the same 100 microseconds. Left: a gas at 1,000 K as dense as the air at sea level: 25 million molecules in the cube, far too many to draw, and some 5 × 10¹¹ impacts on the wall in 100 µs. Right: the thermosphere at 400 km, also at 1,000 K: one molecule for every 9,500 such cubes; the three molecules that strike the wall in those 100 µs are drawn one by one, at the times a random draw at the true rate gives. The counters of impacts and energy follow the true rates. Below, on a logarithmic scale, what reaches or leaves a square metre of satellite: sunlight dominates, the gas of the thermosphere is two million times weaker. Click to pause.

$$\Phi = \frac{n\,\bar v}{4},\qquad {q = \Phi\cdot 2k\,(T_{\text{gas}} - T_{\text{wall}})}$$
$$q_{\text{ram}} = \tfrac12\,\rho\,v^3$$

Φ is the number of molecules striking a square metre each second, v̄ their mean speed, n their number per m³; each brings 2kT of energy on average and leaves with the wall's temperature. At 400 km, Φ = 3.03 × 10¹⁶ per m² per second and q = 0.58 mW. The satellite's own speed, 7.7 km/s, makes the molecules strike its front much harder: ½ρv³ = 0.63 W/m², still two thousand times less than sunlight.

**What sets a satellite's temperature is sunlight, and how well it radiates.** In the Sun, a surface absorbs up to 1,361 W/m²[5]; it gets rid of heat only by radiating, as σT⁴. A black ball in sunlight at the Earth's distance settles where the two balance: 278 K, about 5 °C. Satellites are painted, insulated and fitted with radiators to stay in a comfortable range; the thousand degrees of the thin gas around them hardly enter the budget.

$$\alpha\,S\,\pi r^2 = \varepsilon\,\sigma\,T^4\,4\pi r^2\ \Rightarrow\ {T = \left(\frac{\alpha\,S}{4\,\varepsilon\,\sigma}\right)^{1/4}}$$

S is the sunlight per square metre, α the fraction absorbed, ε how well the surface radiates (both 1 for a black body), σ the Stefan–Boltzmann constant and r the ball's radius: it catches sunlight on πr² and radiates from 4πr². T = 278 K[5][6].

**From radiation to energy to temperature.** Light carries energy: 1,361 W on every square metre facing the Sun[5]. A body that absorbs it does not jump to its final temperature: the energy piles up in its matter, and the temperature is that stored energy divided by the body's heat capacity C, its mass times its specific heat. Take a black aluminium plate of 1 m² and 2 mm, facing the Sun at 400 km: 5.4 kg, C = 4,844 J/K[8]. Cold, it gains 1,361 joules each second and warms by 17 K a minute. The warmer it gets, the more it radiates, as σT⁴ from each of its two faces[6], so the rise slows and stops at 331 K (58 °C), where what comes in equals what goes out. An orbit at 400 km lasts 92.4 minutes[9], of which up to 36 in the Earth's shadow: there nothing comes in, the plate keeps radiating and cools, to 177 K (-96 °C) before sunrise. That swing, not the thermosphere, is what satellite designers fight.

*Figure caption:* **Radiation in, energy stored, temperature, radiation out.** The black plate of 1 m² × 2 mm on an orbit at 400 km, the Sun in the plane of the orbit. Top: the four steps with their values at each moment (the energy gained is counted from the coldest moment, just before sunrise), and the balance C dT/dt = P_in − P_out. Left: where the plate is (the Earth's shadow in grey), its colour following its temperature, the yellow arrows (sunlight absorbed) and the red ones (heat radiated from each face) drawn in proportion to their power. Right: the temperature over one orbit of 92.4 minutes, from 177 K to 331 K, and the balance it reaches in sunlight. One orbit is played in 24 seconds. Click to pause.

$$C\,\frac{dT}{dt} = P_{\text{in}} - P_{\text{out}} = \alpha\,S\,A - 2\,\varepsilon\,\sigma\,A\,T^4$$
$${T_{\text{eq}} = \left(\frac{\alpha\,S}{2\,\varepsilon\,\sigma}\right)^{1/4}}$$

C is the heat capacity (mass × specific heat, 4,844 J/K for the plate), A its area, facing the Sun on one side and radiating from both; α and ε are 1 for a black surface. The left side is the energy stored each second; when it is zero, the temperature no longer moves: T_eq = 331 K. The animation integrates this equation step by step over the orbit, with P_in = 0 in the shadow. The 2 mm of aluminium carry heat across so fast that both faces are taken at the same temperature; the Earth's own reflected light and infrared, which add a little, are left out.

> **The objection** says that satellites cannot exist, since the thermosphere at 1,000–2,000 °C would melt them. It takes the temperature of a gas for the heat it delivers. **What would vindicate it:** a thermosphere dense enough to bring watts per square centimetre; but such a gas would also brake every satellite to the ground within days, and satellites stay up for years at these heights.

**See also**[Satellites](/ai/sat.md)[GPS](/ai/gps.md)[Refraction](/ai/ref.md)[Seismology](/ai/seis.md)

## Sources for this tab

1. [1] NOAA, NASA, USAF, *U.S. Standard Atmosphere, 1976* (NOAA-S/T 76-1562, Washington, 1976): temperature, pressure, density, number density and mean particle speed from 0 to 1,000 km; SI tables as published by [Public Domain Aeronautical Software](https://www.pdas.com/bigtables.html), read 2026-10-17.
2. [2] F. Reif, *Fundamentals of Statistical and Thermal Physics* (McGraw-Hill, 1965), chapters 6–7: the barometric distribution of a gas in a gravitational field, and the flux n v̄/4 of molecules striking a wall (effusion), each bringing 2kT of kinetic energy on average.
3. [3] K. Davies, *Ionospheric Radio* (Peter Peregrinus / IEE, 1990): the plasma frequency f_p = 8.98 √N_e, reflection where the wave frequency meets it, the secant law for oblique paths, the D, E and F layers and their typical densities by day and by night.
4. [4] International Telecommunication Union, [Recommendation ITU-R P.533](https://www.itu.int/rec/R-REC-P.533/en), *Method for the prediction of the performance of HF circuits*: sky-wave modes by hops of up to about 4,000 km via the F2 layer; and the ITU Radio Regulations, article 2, for the names of the bands (LF 30–300 kHz, MF, HF 3–30 MHz, VHF 30–300 MHz, UHF).
5. [5] G. Kopp, J. L. Lean, “A new, lower value of total solar irradiance: Evidence and climate significance”, *Geophys. Res. Lett.* 38 (2011) L01706: 1,360.8 ± 0.5 W/m² at the Earth's mean distance.
6. [6] E. Tiesinga et al., [CODATA recommended values of the fundamental physical constants: 2018](https://physics.nist.gov/cuu/Constants/), *Rev. Mod. Phys.* 93 (2021) 025010: Boltzmann and Stefan–Boltzmann constants.
7. [7] NASA, [International Space Station facts and figures](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/): an orbit about 400 km up, at about 28,000 km/h (7.7 km/s).
8. [8] J. R. Rumble (ed.), *CRC Handbook of Chemistry and Physics*, 103rd ed. (CRC Press, 2022), “Properties of the elements” and “Heat capacity of the elements at 25 °C”: aluminium, density 2.70 g/cm³, heat capacity 24.20 J/(mol·K), i.e. 897 J/(kg·K).
9. [9] G. Petit, B. Luzum (eds.), [*IERS Conventions (2010)*](https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html), IERS Technical Note 36 (Frankfurt, 2010), table 1.1: GM of the Earth = 3.986004418 × 10¹⁴ m³/s², which with Kepler's third law gives the period of an orbit at 400 km.
10. [10] [Iowa Environmental Mesonet (Iowa State University), *ASOS one-minute data download*](https://mesonet.agron.iastate.edu/request/asos/1min.phtml) — the station pressure, once a minute, of the 102 US weather stations used in the Hunga Tonga section (15–18 January 2022); open, no account. Rebuilt by `fog build seis-tonga`.
11. [11] [USGS, *M 5.8 Volcanic Eruption — 68 km NNW of Nuku‘alofa, Tonga* (event us7000gc8r)](https://earthquake.usgs.gov/earthquakes/eventpage/us7000gc8r) — the time (2022-01-15 04:14:45 UTC) and position (20.546° S, 175.390° W) of the eruption used as the start and the source of the pressure wave.
12. [12] [R. S. Lindzen & D. Blake, "Lamb waves in the presence of realistic distributions of temperature and dissipation", *Journal of Geophysical Research* 77(12), 2166–2176 (1972)](https://doi.org/10.1029/JC077i012p02166) — the speed of the atmosphere's Lamb wave computed from its temperature profile, about 310 m/s: a property of the air, not of the planet's size.
13. [13] [K. Nishida, N. Kobayashi & Y. Fukao, "Background Lamb waves in the Earth's atmosphere", *Geophysical Journal International* 196(1), 312–316 (2014)](https://doi.org/10.1093/gji/ggt413) — Lamb waves travel without dispersion at a sound speed of about 310 m/s (citing Lindzen & Blake), confirmed on the USArray barometers.
14. [14] [R. S. Matoza *et al.*, "Atmospheric waves and global seismoacoustic observations of the January 2022 Hunga eruption, Tonga", *Science* 377(6601), 95–100 (2022)](https://doi.org/10.1126/science.abo7063) — the Lamb wave of this eruption observed worldwide for four passages round the Earth, plus three through the antipode, over six days.
15. [15] [C. J. Wright *et al.*, "Surface-to-space atmospheric waves from Hunga Tonga–Hunga Ha’apai eruption", *Nature* 609, 741–746 (2022)](https://doi.org/10.1038/s41586-022-05012-5) — the Lamb wave measured at 318.2 ± 6 m/s at the surface during this event. That speed was measured with globe distances, so it is not used to compute the radius here, only to size the uncertainty.
16. [16] [G. J. Symons (ed.), *The Eruption of Krakatoa and Subsequent Phenomena*, Report of the Krakatoa Committee of the Royal Society (London: Trübner, 1888), Part II: R. Strachey, "On the air waves and sounds caused by the eruption of Krakatoa in August, 1883", pp. 57–88](https://archive.org/details/eruptionofkrakat00roya) — Tables II–IV (positions and GMT times of passages I–VII at some fifty barographs) and VIII (intervals between passages), typed into `data/seis/krakatoa/` and checked against each other by `fog build krakatoa` (`tools/internal/build/krakatoa`); the wind explanation of the two lap times (pp. 73–74), the "peculiar" North American velocities (p. 74) and the reading errors "well within thirty minutes" (p. 72). Public domain, scan on archive.org.
17. [17] [N. Murayama, "Pressure Waves Produced by the Nuclear Explosion on October 30, 1961 — Preliminary Report"](https://doi.org/10.2151/jmsj1923.40.4_222), *J. Meteor. Soc. Japan*, Ser. II, 40 (1962) 222–231, Table 1 (pp. 226–227): passage times of three wave trains at eight JMA microbarographs and the Showa Base barograph; transcribed by hand in `data/atmo/tsar/`, checked against the velocities he printed.
