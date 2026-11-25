# Your phone solves a globe equation several times a second

> Tab "GPS" of *Flat plane or Globe?*. Web page: /#tab-gps. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*GPS · the arithmetic inside every fix*

*Figure caption:* **Three range spheres, drawn at true scale.** Drag to orbit: the handshake holds from every angle.

GPS does not measure position — it measures **time**. A receiver listens to at least four satellites, notes how long each signal took to arrive, multiplies by the speed of light, and solves four equations for four unknowns: where you are (x, y, z) and what time it really is. Every symbol in that math is globe-shaped: the satellite positions are broadcast as coordinates on a rotating ellipsoid, the orbits repeat with the stars rather than the sun, and the clocks are built fast-or-slow on purpose to survive curved spacetime above a round planet.

## The equation your phone actually solves [evidence: prediction]

$$\rho_i = \left| \mathbf{x} - \mathbf{s}_i(t) \right| + c\cdot\delta t$$
$$(x,\ y,\ z,\ \delta t)$$
$${300\,\text{m}}$$

The satellite positions sᵢ(t) come from the broadcast ephemeris — orbital elements[4] the receiver evaluates in Earth-centred WGS-84 coordinates, the same ellipsoid the surveying tab runs on. Note what the receiver does *not* carry: an accurate clock. The fourth satellite buys the time δt, which is why a $10 receiver chip can use atomic-clock timing. The solution point where the four ranges close exists because the geometry is what the ephemeris says it is; feed the same signals into any other geometry and the ranges simply fail to meet.

$$\rho_i = \sqrt{(x-x_i)^2 + (y-y_i)^2 + (z-z_i)^2} + c\cdot\delta t,\quad i = 1\ldots 4$$

Written out, each measurement says: *you lie on a sphere* of radius rᵢ = ρᵢ − c·δt centred on satellite i. One sphere pins you to a surface; two intersect in a circle; three meet in exactly **two points** — and the second point lands thousands of kilometres out in space, so it is rejected (or resolved automatically once the fourth satellite fixes δt). The receiver solves this by Newton iteration in milliseconds; the model below draws it.

The three circles are not independent. They all pass through the same **two points**: you, on the surface, and a mirror point in deep space on the far side of the satellite plane. That second point is rejected as a receiver location, and eliminated outright once the fourth satellite fixes δt. There is no third place the ranges could put you.

*Figure caption:* **The constellation, to scale.** 24 baseline satellites in six orbital planes[1] inclined 55°, at 4.17 Earth radii from the centre (20,200 km up), each circling twice a day. From any point on the sphere, 8–12 are above your horizon at once — highlighted, with sight lines — and the set constantly changes as satellites *rise and set*, exactly as the satellite-status screen of any phone GPS app shows. Drag to orbit; the count updates live as the constellation wheels.

*Figure caption:* **Why four satellites.** With a perfect clock, three ranges (solid) intersect at your position. A cheap receiver's clock is off by some unknown δt, inflating every measured range by the same c·δt (dashed) — the circles miss. Solving for δt alongside position shrinks them back until they close: the fix and the time fall out together. This closure is a strict geometric test, passed millions of times a second, everywhere on Earth, only by the broadcast globe geometry.

$$T = 2\pi\sqrt{\frac{a^3}{GM}} = 2\pi\sqrt{\frac{26,560^3}{398,600}}\ \text{s} = {11\,\text{h}\ 58\,\text{min}}$$

A bonus equation with nowhere to hide: Kepler's third law, with the broadcast semi-major axis a = 26,560 km and the Earth's measured gravitational parameter GM, reproduces the broadcast orbital period to the minute[3]. The constellation's timetable is the equation of motion around a spherical mass — there is no version of this arithmetic over a plane.

## Three globe fingerprints inside the signal [evidence: prediction]

**How long a satellite can stay up, exactly.** A satellite at a = 26,560 km is above a true horizon while the angle at the Earth's centre between it and you is less than arccos(R/a) = 76.12°. That is 152.2° of an 11 h 58 min orbit, so **no GPS satellite is ever visible for more than 5 h 04 min** — and above the 5° elevation mask most receivers apply, no more than 4 h 44 min. One radius, one orbit, nothing fitted. Fixed emitters on a plane have no such ceiling: once up, they never set.

**① The sidereal repeat.** The orbital period is 11 h 58 min — half a[2] *sidereal* day, not half a solar day. Each satellite's ground track repeats not every 24 hours but every 23 h 56 min: the constellation keeps time with the **stars**, and the ground slides 4 minutes eastward beneath it daily. That 4-minute slip is the rotation of the Earth, written into the almanac your phone downloads.

**② The relativity ledger.** Orbital speed (3.9 km/s)[3] makes the satellite clocks run *slow* by ~7 μs/day; sitting higher in Earth's gravity well makes them run *fast* by ~45 μs/day. Net: **+38 μs/day**[5], which at 300 m/μs would smear positions by ~11 km per day. So the clocks are manufactured deliberately slow — offset before launch so they tick correctly once in orbit. The hardware is pre-distorted for curved spacetime around a spherical mass; the fact that the fix stays put is a daily test of both relativity and the geometry it was computed for.

**③ The relativity ledger, as an equation.**

$$\frac{\Delta f}{f} = \frac{\Delta U}{c^2} - \frac{v^2}{2c^2} \implies +45.7 - 7.1 \approx {+38.6\ \text{μs}/\text{day}}$$

Gravitational blueshift from sitting higher in the potential of a spherical mass, minus time dilation from the 3.9 km/s orbit — both terms are functions of GM and r around a globe, and the satellites' clocks are factory-offset by exactly this amount[5]. The fix holding steady for decades is a daily audit of the arithmetic.

**④ The range window.** Every pseudorange your receiver logs falls between ~20,200 km (satellite overhead) and ~25,800 km (satellite on the horizon) — precisely √((R+h)² − R²) for a sphere of radius R. That narrow window, identical for receivers on every continent, is the sphere's signature in raw data anyone can record.

## Solve it yourself, from raw signals [evidence: check — Where the radius enters: satellite orbits broadcast in the WGS84 frame, whose scale was fixed by stations on the ellipsoid.]

Everything above computes what a receiver should see. Here is what real receivers did see. On one day, 80 stations of the International GNSS Service, spread over every continent, recorded the raw pseudoranges of the GPS satellites; the data are public.[6] Each station is solved *alone*, every five minutes, from the origin of the coordinate system and with no position taken from the file: four unknowns (x, y, z and the receiver clock) from the satellites above 10°, using the broadcast orbits and clocks,[7] the light time, the Earth's turn during the flight, and a standard troposphere.[8] The day's fixes are averaged. Limit: the broadcast orbits are written in the WGS84 frame, so this is a test that can fail, not a measurement from nothing: with a wrong geometry the stations would not solve to a metre, they would leave kilometres of residual.

*Figure caption:* **Real receivers, solved from the raw signals.** Left: the stations (a flat map, only to locate them). Right: what is left of each pseudorange once the fix is made, all stations and epochs together: 1.0 m rms, 95 % below 1.9 m. Receiver noise, multipath and broadcast-orbit error make up these metres. *Would favour the flat plane: station positions that only solve with kilometre residuals, or that fit a plane better than a sphere.*

The stations come out as points in space, with no shape assumed. Fit a sphere through them (centre and radius free), or the best plane:

$$\lvert \mathbf{x}_j - \mathbf{c} \rvert = R \quad\Leftrightarrow\quad \lvert \mathbf{x}_j \rvert^2 = 2\,\mathbf{c}\cdot\mathbf{x}_j + \left(R^2 - \lvert \mathbf{c} \rvert^2\right)$$

x_j: the position of station j, solved from its own pseudoranges · c: centre of the sphere · R: its radius · the right-hand form is linear in c and in R² − |c|², one least-squares solve gives both; a plane would be n·x = d

*Figure caption:* **The Earth's radius from receivers that solved themselves.** The sphere has R = 6,371 ± 0.9 km (leaving one station out in turn), centred 2.0 km from the origin of the coordinates; the best plane through the same points leaves 3,406 km rms. What the sphere leaves, 7.0 km rms, is the Earth's flattening, not noise: the equator stands 21.4 km farther from the centre than the poles (the WGS84 ellipsoid, a published model, has 21.4 km); remove it and 1.4 km remain, the scatter of one-day fixes and of the stations' heights. *Would favour the flat plane: a plane fitting better than the sphere.*

**With your own phone.** The same calculation, run on the raw log of an Android phone, in your browser, and a way to fit a sphere with other people far away: the tab [Your own GPS](/ai/rx.md).

One more check uses no orbit at all. A receiver can only track a satellite that is above its own horizon, and the files say which ones it tracked. Take two stations on opposite sides of the equator:

*Figure caption:* **The two stations do not see the same sky.** One row per satellite, one column per five minutes: blue, seen only from NLIB; purple, only from ALIC; teal, from both. 138° (15,373 km) apart, they track 0.0 satellites in common on average, while 9.0 are seen only from the first and 10.2 only from the second, and the two lists are never identical. Nothing here comes from an orbit or from WGS84, only from the files. On a plane with the transmitters above it, every station would see the same satellites at the same time. *Would favour the flat plane: every station seeing the same satellites at the same time.*

Do this for all 3,160 pairs of stations. A satellite at the distance a = 26,560 km from the centre can be above the horizon of two points on a sphere of radius R only if they are less than 2·arccos(R/a) apart, whatever the satellite does: 152.2° with the radius fitted above and the broadcast orbit radius.

*Figure caption:* **How many satellites two stations share, by how far apart they are.** One dot per pair of stations: the number of satellites tracked by both at the same time, averaged over the day. The count falls with the separation and the farthest pair that ever tracked the same satellite is 151.8° apart; none of the pairs beyond 132° ever did. Dashed: the geometric limit 152.2°, which has no free parameter. A flat model has a free height for each transmitter and would have to be tuned to land on such a limit. *Would favour the flat plane: pairs of stations that share satellites well beyond that separation.*

## Now try to build it on a flat plane

Steel-man the disc: forget that nothing orbits a plane (orbits are free fall around a central mass) and simply mount the 31 transmitters on towers or hovering platforms, at any heights you like, anywhere over the disc. The public, decodable signal itself now convicts the model:

**What receivers measure vs what fixed flat-plane emitters must produce**

| Measured (log it yourself) | Globe | Flat emitters |
| --- | --- | --- |
| Satellites **rise and set**; the in-view set turns over completely in hours | predicted | impossible — anything above the plane stays above every horizon forever, alt = atan(h/d) > 0 |
| 8–12 in view, roughly the same count **everywhere** — Alaska, Ecuador, New Zealand | predicted | count collapses with distance from the array; the far side of the disc sees a low cluster near one horizon |
| Pseudoranges confined to **20,200–25,800 km** | predicted | ranges to never-setting distant emitters run to 40,000 km and beyond — never observed |
| Southern receivers watch satellites wheel around the **southern** sky | predicted | no south to wheel around on a pole-centred disc |
| One broadcast ephemeris closes the four-range equation for **every** receiver at once | predicted | no emitter arrangement over a plane reproduces sphere-consistent ranges at all receivers simultaneously |
| Clocks pre-offset by +38 μs/day hold the fix steady for decades | predicted | no account — the offset is computed from orbital speed and gravitational potential around a spherical mass |

> **The deepest point is the simplest.** GPS is not a picture of the Earth that could be faked; it is a *live geometry proof* re-run by billions of independent receivers, using public equations, public ephemerides, and raw observables anyone can log. The four ranges close on a point — your point — only if the transmitters are where the globe math says they are. A navigation system is the one kind of evidence that cannot humor a wrong shape and keep working: get the geometry wrong by a kilometre and every landing, harvest and package delivery drifts with it.

Experiment 8 · read the sky with a free app

Any GNSS status app shows the raw constellation — no account, no cost

Install a satellite-status app (most phones expose GPS, Galileo, GLONASS and BeiDou). The sky plot shows each satellite's azimuth and elevation, live.

Independent variable
**What you change:** the **time** — screenshot the sky plot now and again in 1–2 hours; and if you can, compare with a friend at a different latitude at the same moment.

Dependent variable
**What you measure:** each satellite's **elevation over time** (rising or setting?), the **count in view**, and where the tracks wheel (north or south).

globe → right now at φ = +45°: 8 satellites above your horizon, every one rising or setting, ranges pinned to the 20,200–25,800 km window, tomorrow's sky 4 min early
flat towers → a frozen constellation: fixed azimuths and elevations forever, no sidereal slip, range window broken open

**Verdict rule:** if two screenshots an hour apart show the same satellites parked at the same spots, fixed emitters win. If the sky has turned over — new birds risen, old ones set, the whole pattern shifted along tracks the almanac predicted days ago — you are watching orbital mechanics around a rotating sphere, measured with a free app on a device that proves it by knowing where you are.

**See also**[Distances](/ai/dist.md)[Gravity](/ai/grav.md)[Cel. nav.](/ai/cnav.md)[Surveying](/ai/surv.md)

## Sources for this tab

1. [1] [GPS.gov — the Space Segment](https://www.gps.gov/space-segment): the official constellation description — 24 baseline slots, six equally-spaced orbital planes, ~20,200 km altitude, two orbits per day, at least four satellites in view from virtually any point on the planet.
2. [2] [U.S. Coast Guard Navigation Center — GPS overview](https://www.navcen.uscg.gov/global-positioning-system-overview): six circular orbits at 55° inclination with an **11 h 58 min** period, and a minimum of six satellites in view worldwide.
3. [3] [ESA Navipedia — GPS Space Segment](https://gssc.esa.int/navipedia/index.php/GPS_Space_Segment): semi-major axis 26,560 km, orbital speed 3.9 km/s, and the nominal 12-hour *sidereal* period that repeats the geometry each sidereal day.
4. [4] [Penn State GEOG 862, "GPS and GNSS for Geospatial Professionals"](https://www.e-education.psu.edu/geog862/node/1770) — an actual training course for the people who use this for a living: constellation design, ephemerides, and the coordinate systems the fixes land in.
5. [5] [Neil Ashby, "Relativity in the Global Positioning System", *Living Reviews in Relativity* (2003)](https://pubmed.ncbi.nlm.nih.gov/28163638/) — the standard reference for the relativistic clock corrections; a readable walk-through of the +45/−7 = +38 μs/day ledger is [Prof. R. Pogge's Ohio State lecture, "Real-World Relativity"](https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps.html).
6. [6] [BKG GNSS Data Center — the IGS archive](https://igs.bkg.bund.de/) (open, no account): the daily 30-second RINEX 3 observation files of the International GNSS Service's stations (pseudoranges, carrier phase, Doppler) and the day's merged broadcast navigation message, read here for 10 April 2025, day 100 ([IGS network](https://igs.org/network/)); decompressed with RNXCMP (Hatanaka). Read by `fog build gps-raw`.
7. [7] [IS-GPS-200, *Navstar GPS Space Segment / Navigation User Interfaces*](https://www.navcen.uscg.gov/gps-technical-references), Tables 20-III and 20-IV and §20.3.3.3.3.1: the broadcast orbital elements and clock polynomial, the algorithm that turns them into a satellite position, the relativistic clock term, and the Earth rotation rate used in the Earth-fixed frame.
8. [8] J. Saastamoinen, “Atmospheric correction for the troposphere and stratosphere in radio ranging of satellites”, in *The Use of Artificial Satellites for Geodesy*, Geophysical Monograph 15, AGU (1972), 247–251 — the zenith delay (about 2.3 m at sea level) from pressure and humidity, here for a standard atmosphere with a 1/sin(elevation) mapping. The WGS84 values (a = 6,378.137 km, 1/f = 298.257 223 563) are from NIMA TR8350.2, *Department of Defense World Geodetic System 1984*, 3rd ed. (2000).

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [IS-GPS-200, *Navstar GPS Space Segment / Navigation User Interfaces*](https://www.navcen.uscg.gov/gps-technical-references) — the interface specification itself, published by the U.S. Coast Guard Navigation Center. **This is the strongest document on the tab.** Ashby's review, cited above, explains why the relativistic correction is needed; IS-GPS-200 is where it is *written into the standard*, as the term −2√(μa)·e·sin E / c² that every receiver is required to apply, alongside the broadcast Keplerian elements. Not an argument about the Earth — a signal specification that will not work unless the Earth is the shape and size stated here.
- [International GNSS Service — formats and standards (RINEX)](https://igs.org/formats-and-standards/), with the [guide to using IGS products](https://files.igs.org/pub/resource/pubs/UsingIGSProductsVer21_cor.pdf). Over 300 permanent tracking stations in more than 80 countries, publishing precise orbits and clocks free of charge. Download a day of broadcast ephemerides and do the four-satellite closure yourself, on real data.
- **B. Hofmann-Wellenhof, H. Lichtenegger & E. Wasle, *GNSS — Global Navigation Satellite Systems: GPS, GLONASS, Galileo, and more* (Springer, 2008).** The standard graduate text, for the reader who wants the trilateration worked through completely rather than sketched.
- **BIPM — *Circular T*.** International atomic time is maintained by comparing clocks in dozens of national laboratories, largely over GPS links. The same relativistic corrections appear there, in metrology rather than navigation, and disagreements would show up as nanoseconds of mismatch between laboratories.
