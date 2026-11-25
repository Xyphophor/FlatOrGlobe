# An airliner flies around a ball, and its instruments are built to know it.

> Tab "Aviation" of *Flat plane or Globe?*. Web page: /#tab-avia. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Aviation · flying on a curved Earth*

Three objections come from the cockpit: *pilots would have to keep dipping the nose*; *a gyroscope would show the curve*; *nobody flies the southern routes*. Each can be computed. The nose does turn, by 0.135° per minute, lost among the autopilot's own corrections. The gyroscopes do sense the Earth: every airliner measures its rotation before leaving the gate, and every inertial unit carries its radius. And 6,686 real flights on 127 routes take the time the globe's distances need.[10]

*[Figure: Animation: the 85 measured routes appearing on a globe; airborne time against distance, on one line for the globe and scattered for the North Pole map; Sydney to Santiago flown on the globe and on the flat map; the southern ring of scheduled flights on both; the Earth's radius from flight times, route by route; three gyroscopes drifting at Tromsø, Singapore and Sydney; a passenger weighed flying east and west; a summary]*

*Figure caption:* **The whole tab in under a minute.** The measured routes on the globe; airborne time against distance, on one line for the globe and scattered on the North Pole map; Sydney to Santiago and the southern ring of scheduled flights, flown on both; the Earth's radius from a stopwatch and a flight plan; gyroscopes drifting with the sign of the latitude; a passenger weighed flying east and west. Every number is the page's own. Click to pause.

## What “flying level” means

The altimeter measures air pressure, and a surface of constant pressure follows the Earth: holding an altitude *is* following the curve. Over an arc d the local vertical turns by θ = d/(R + h), so the nose turns against the stars at a steady rate:

*Figure caption:* **Level flight around a globe, and a stone on a rope.** Right, teal: altitude held; gravity (amber, the rope) pulls towards the centre; the attitude indicator stays level while the nose turns with the arc flown. Grey: nose locked to the stars; it leaves along the tangent, climbing, and restarts every two hours. Left: a stone swung on a rope; the grey stones show where it goes when the rope is cut. The Earth is drawn smaller than the altitude, at uniform scale, with the factor printed; the numbers are the real ones. 30 minutes of flight per second.

$$\omega = \frac{v}{R + h}$$
$$\Delta h \approx \frac{d^2}{2(R + h)}, \qquad a = \frac{v^2}{R + h}$$

ω: rate at which the nose turns against the stars · v: speed · R: Earth's radius · h: altitude · Δh: height gained over a distance d if the nose stays locked to the stars · a: centripetal acceleration of level flight

At 900 km/h: ω = 0.135° per minute, 8.1° per hour. The dot between the wings of the attitude indicator stands for about 2° of pitch[1], that is 15 minutes of curvature, less than the altitude hold corrects all the time for turbulence and fuel burn. With the nose locked to the stars instead, the aircraft would be 18 m too high after one minute and climbing at 1,157 ft/min after ten. The attitude indicator does not hide the turn: its gyro is pulled back to the plumb line by an erection mechanism “actuated by the force of gravity”[1], and in an airliner the attitude is computed from the inertial unit's position on the Earth[9].

The aircraft is not fighting to stay down. A stone swung on a rope goes round because the rope pulls it towards the hand; cut the rope and it leaves in a straight line. For the aircraft the rope is gravity, and it pulls far harder than needed: bending the path round the Earth takes 0.10 % of g, and the wings hold up the rest. An airliner at constant altitude therefore weighs a little less than on the ground, which gravimeters on board measure (next section). The straight line is the one that would take effort: a climb, steeper every minute.

*Figure caption:* **Two level aircraft, and the forces on each from its own seat.** Left: surfaces of constant pressure of the standard atmosphere[25] at flight level 350 (238 hPa) and 100 (697 hPa), with an aircraft on each, among real constellations (Orion, the Big Dipper, Cassiopeia, the Southern Cross, each drawn upright and facing us for legibility, placed around the globe by its real direction, not to scale); amber: weight, towards the centre; teal: lift; dashed: velocity. Right: the forces in each aircraft's frame, drawn to scale (weight = 1, lift-to-drag ratio 18 assumed): the stars turn above it and the ground slides by below, the vectors do not (the sky and the ground distance are not to scale). Weight minus lift is v²/(R + h), 0.100 % of the weight at flight level 350 and 0.027 % at 100, too small to draw, so it is written. The Earth is drawn smaller than the altitude, at uniform scale, with the factor printed.

$$T = \frac{m v^2}{r}$$
$$m g - L = \frac{m v^2}{R + h} \quad\Rightarrow\quad L = m g \left(1 - \frac{v^2}{g\,(R + h)}\right)$$

T: pull of the rope on a stone of mass m going round at speed v on a circle of radius r · m g: the aircraft's weight, the pull of gravity · L: lift of the wings · their difference, m v²/(R + h), is the part of gravity that bends the path

**From the aircraft's seat, nothing moves.** Its weight points to the centre of the Earth, which for it is always straight down; lift, thrust and drag stay the same minute after minute. Only the ground below slides by and the stars turn above. There is nothing to correct: the autopilot holds one air pressure, a surface that follows the Earth,[25] and a second aircraft lower down holds another, on a smaller circle, with other numbers (697 hPa, 464 km/h) that are just as constant.

## Weighing an aircraft flying east and west [evidence: check — Where the radius enters: NOAA removed the Eötvös effect with the GRS80 radii; putting it back needs those radii.]

Flying east, an aircraft circles the Earth's axis faster than the ground below it; flying west, slower. It needs a little less lift in the first case and a little more in the second: the Eötvös effect, demonstrated by Loránd Eötvös in 1919.[14][15] Airborne gravimeters must correct every reading for it, and the correction is the globe's:[16][17]

*Figure caption:* **The same scale, flown east and flown west.** One bar per line of NOAA's block EN02[18], south to north: how much more (up) or less (down) a 70 kg passenger weighs than the average of all the lines, from the meter readings (NGS's published gravity with its correction undone, reduced to a common height and latitude). Blue: flown east; purple: flown west. Black ticks: the globe's formula for that line's speed. Orange dashes: a flat Earth, the same on every line. The readings are NOAA's published values with the globe's correction added back; since the published eastbound and westbound lines agree, this difference is what the meter actually felt.

*Figure caption:* **Real airborne gravity, three corrections.** Each curve is one line of NOAA's block EN02[18] against longitude, blue flown east, purple west, reduced to a common height and latitude. Uncorrected, the two directions sit thousands of mGal apart; the rotation term brings them within tens; with the v²/R term as well they lie on top of each other. Inset: the rms gap between neighbouring lines against the radius R put in the correction; dashed, 6,371 km.

$$\Delta g = 2\Omega\, v_E \cos\varphi + \frac{v^2}{R + h}$$

Δg: apparent loss of weight per unit mass · Ω: Earth's rotation rate · v_E: eastward speed · φ: latitude · v: ground speed · on a plane, still or turning about a vertical axis, Δg = 0 in every direction

At 900 km/h and 45°N: +3,558 mGal flying east, −1,599 mGal flying west, +979 mGal flying north (1 mGal = 10⁻⁵ m/s²). NOAA's survey block EN02, over Lake Erie in 2011, was flown at 20,000 ft along east–west lines 10 km apart, alternately each way:[18] 28 lines (13 east, 15 west, 3,743 samples), published after NGS's globe correction.[17][18] Undo that correction to get back the meter readings, then compare neighbouring lines flown in opposite directions. With the globe correction they differ by 4.3 mGal rms, close to the survey's own 2.4 mGal. With none, as a flat Earth requires: 2,678 mGal, 627 times more. With the rotation term alone: 88 mGal.

Put simply: a 70 kg passenger standing on a bathroom scale in that aircraft. On the eastbound lines the scale reads 69.90 kg on average, on the westbound lines 70.09 kg: 189 g apart, line after line, 10 km from each other in the same air. The globe's formula, from each line's own speed, predicts 189 g. A flat Earth, still or turning, predicts the same reading on every line.

**Testing the correction NOAA injected.** The published lines already have the globe's correction subtracted, with its Ω and WGS84 shape.[17] That is no circle: subtracting a value cannot make eastbound and westbound lines agree. Keep only a fraction k of it, k from 0 to 2: for k = 0, a flat Earth that stands still, there is nothing to correct and the lines split by 2,676 mGal rms; if NGS's Ω or size were wrong, the best k would be far from 1. Nothing is adjusted line by line afterwards.[17]

*Figure caption:* **How much of the globe's correction do the lines want?** Blue: rms gap between neighbouring lines of block EN02[18] flown in opposite directions, against the fraction k of the Eötvös correction[16] kept (logarithmic scale). Dashed orange: k = 0, flat and still. Dot: the minimum, k = 1.0007 ± 0.0002 (jackknife over pairs of lines), 3.8 mGal rms; at k = 1, 4.3 mGal. *Would favour the flat plane: a minimum at 0, or no clear minimum at all.* Limit: the speeds are not published; they come from the published coordinates, hence from WGS84, so this tests rotation and size together.

Let the data choose R: the lines agree best for R = 6,224 km (3.8 mGal rms); pair by pair, 5,835 km to 6,629 km, median 6,209 km. Two limits: the raw readings are rebuilt with a spherical formula where NGS uses Harlan's ellipsoidal one[16], a few percent on R; and NGS reports an unexplained bias on every line of this block.[18] Neither comes near the 2,678 mGal the flat model leaves.

**Where WGS84 enters, and how much it weighs.** Three steps lean on GRS80, the reference ellipsoid WGS84 is a twin of.[26] First, the correction NGS added must be taken off with the radii NGS used.[16] The radius found then obeys 1/R_found = 1/R_felt − 1/R_NGS + 1/R_taken off: when the last two are the same, they cancel and only what the meter felt remains. That is bookkeeping about NGS's processing, not an assumption about the Earth. But any error in rebuilding NGS's correction passes straight into 1/R: rebuilt on a sphere, 6,224 km; on the ellipsoid, as NGS does, 6,239 km. Second, the lines are brought to a common height with GRS80's free-air gradient, 0.3086 mGal/m, which itself hides a radius (about 2g/R). Third, they are brought to a common latitude with GRS80's normal gravity. Both can be measured on the same pairs instead. The data give a height gradient of 0.313 ± 0.014 mGal/m and a north–south gradient of 0.78 ± 0.05 mGal/km (GRS80: 0.81 mGal/km). With them, R = 6,232 ± 42 km, against 6,224 ± 33 km with GRS80's values: the data find the ellipsoid's gradients on their own, and the radius hardly moves. The speeds, converted from WGS84 coordinates to metres, do not matter: scaling them all by the same factor leaves R unchanged to within a kilometre.

The rotation can be left free too. The gap between two neighbouring lines is linear in both unknowns, so one least-squares fit gives both:

*Figure caption:* **The Earth's rotation and radius from the same flights.** Each circle is one pair of neighbouring lines of block EN02[18] fitted alone; they line up along the trade-off between Ω and R. The dot is the fit over all pairs, with its jackknife ellipse at 1 σ, drawn at the scale of the axes (hence tiny). Dashed: the true values. Orange, off the top: R = ∞, the globe's rotation term kept on a plane.

$$d = \Delta m + 2\Omega\,\Delta(v_E \cos\varphi) + \frac{\Delta(v^2)}{R + h}, \qquad \langle d^2 \rangle \to \min$$
$$\Delta g_E - \Delta g_W \approx 4a\left(\Omega \cos\varphi + \frac{w}{R}\right)$$

d: gap between two neighbouring lines flown in opposite directions, after correction · Δm: gap between their meter readings · Ω, R: the two unknowns, chosen to make the gaps smallest · a: airspeed · w: tailwind towards the east · with a steady wind only Ω cos φ + w/R would show

Over the 18 pairs of lines: Ω = 1.0003 ± 0.0004 Ω₀, one turn in 23.93 ± 0.01 h (the sidereal day: 23.93 h), and R = 6,273 ± 71 km, 3.7 mGal rms. The uncertainties come from leaving out each pair of lines in turn (jackknife): the residuals are correlated along a line, so the textbook error would be too small. The two unknowns are tied (correlation 0.92). The rotation term splits the two directions by 2,590 mGal, the curvature term only by the 80 mGal that the speed differences add: Ω is pinned tightly, R less so, and R comes out 1.4 standard errors below 6,371 km, for the reasons above. Pair by pair the fits slide along that trade-off: Ω from 0.994–1.011 Ω₀, R from 5,325–9,135 km.

**What this fit cannot show.** The meter readings are NOAA's published values with the globe's correction added back, and NGS corrected with WGS84 and the true Ω. The fit cannot move away from them further than the published lines disagree, and they agree, line after line (see the test above: no line is adjusted afterwards). The numbers say how tightly that agreement pins Ω and R, and the speeds still come from WGS84 coordinates. For the flat model there is nothing to fit: on a plane, still or turning about a vertical axis, level flight changes nothing vertically. Keeping the globe's rotation term on a plane (R = ∞, Ω free), a hybrid no flat model proposes, gives Ω = 1.031 Ω₀ and leaves 34 mGal rms, against 3.7 mGal.

## Gyroscopes sense the Earth's rotation [evidence: prediction]

A gyroscope keeps its direction in space, so on a rotating Earth it senses Ω = 15.04°/h. At latitude φ that rotation splits into a vertical part, which turns a heading indicator, and a horizontal part that points to true north:[3][4]

*Figure caption:* **Three free heading indicators set to 000 together,** on aircraft parked facing true north. Globe: Tromsø loses 14.1° in an hour, Singapore almost nothing, Sydney gains 8.4°. Motionless plane: no drift anywhere. Plane turning once a day under the sky: the full 15.04°/h, the same way everywhere. Friction, real in real instruments, is left out. 10 minutes per second.

51.5°N

horizontal component (points to true north): **9.36°/h**

vertical component: **11.77°/h** · total 15.04°/h

latitude read from the two: atan(11.77/9.36) = **51.5°** · north found from the horizontal part

*Figure caption:* **What three gyros at rest read.** Globe: Ω, parallel to the axis, splits at the airport into a vertical part and a part towards true north. Motionless plane: no rotation, no alignment possible. Disc turning under the sky: the rotation is vertical everywhere, so no north, and the same “latitude”, 90°, at London, Singapore and Sydney.

$$\omega_{\text{drift}} = -\Omega \sin\varphi$$
$$\Omega_N = \Omega \cos\varphi, \qquad \tan\varphi = \frac{\Omega \sin\varphi}{\Omega \cos\varphi}$$

ω_drift: drift of a free heading indicator (negative: it turns anticlockwise north of the equator, clockwise south of it) · Ω_N: horizontal part, towards true north · the ratio of the two parts gives the latitude

**Heading indicator.** The FAA warns it “may indicate as much as 15° error per every hour of operation” and tells pilots to reset it against the compass about every 15 minutes[2]; some instruments carry a “latitude nut” to cancel the Earth-rate part[3]. Drift: Tromsø (70°N) −14.1°/h, Singapore (1°N) −0.4°/h, Sydney (34°S) +8.4°/h. The sign flips at the equator and the size is fixed by the latitude alone: nothing to adjust.

**Inertial reference system.** Parked at the gate before the first flight, its three ring-laser gyros measure Ω.[5][9] The horizontal part gives true north without a compass; the ratio gives the latitude: at London, 9.36°/h north and 11.77°/h vertical, tan φ = 11.77°/h ÷ 9.36°/h, φ = 51.5°. Honeywell specifies 5 minutes to align at the equator, 10 at 70°, longer up to 82.5°, where Ω cos φ is too small to find north.[5]

## An inertial unit carries the Earth's radius [evidence: prediction]

Once aligned, the unit integrates its accelerations. To keep “down” pointing down it turns its own level by v/R as it travels[6], and its errors then swing instead of growing, with the period of a pendulum as long as the Earth's radius (Schuler, 1923):[6][7]

*Figure caption:* **A globe inertial unit over a plane.** The black airliner flies straight at 900 km/h. The unit's computed position (orange ring) swings near the departure airport with the Schuler period; below, its error against the 2 NM per hour allowed (teal). Computed from the equations, not recorded. 5 minutes per second.

$$T = 2\pi \sqrt{\frac{R}{g}}, \qquad \omega_s = \sqrt{\frac{g}{R}}$$
$$\text{on a plane: } x_c(t) = \frac{v}{\omega_s}\sin(\omega_s t)$$

T: Schuler period, 84.4 min · g: gravity · x_c: position computed by a globe-programmed unit carried in a straight line over a plane at speed v, while the true position is v·t

That bounded error is what lets airliners cross oceans on inertial navigation: the regulation allows 2 NM per hour on flights up to ten hours.[8] Over a plane the same unit would tilt its level for a curve that is not there, and its computed position would swing within ±202 km of the departure airport: 1,095 km out after one hour, against 3.7 km allowed. A flat Earth needs units built without R; the certified ones have it.

## When an inertial unit lost its place: EI-GJT, 9 October 2018

Between Porto and Edinburgh, one accelerometer of a Boeing 737-800's left inertial unit failed, reporting about 1.6 g along the track. The unit's position raced away, “passing east of the north pole”, at up to some 14,000 m/s. Because its “inertially-generated positional data in relation to the Earth is used to generate the attitude indication”, the captain's pitch display rose “to 90°” over about twenty minutes, until the unit declared its attitude invalid.[9] The unit draws the horizon of the place where it thinks it is:

*Figure caption:* **EI-GJT, 20:39 to 21:01 UTC.** Black: the aircraft, flying north at about 240 m/s. Orange: where its left inertial unit placed it, from the AAIB's groundspeeds, along the same great circle. Right: the captain's attitude display with the pitch error Δσ, capped at the 90° reported. The track is schematic; the report's figure 4 shows the real one.[9]

$$\Delta\sigma = \frac{1}{R}\, \Sigma\, (v_{\text{IRS}} - v)\, \Delta t$$
$$\text{horizon tilt} = \Delta\sigma$$

Δσ: angle at the Earth's centre between the true and the computed positions · v_IRS: groundspeed of the faulty unit (AAIB figure 3, read by eye) · v: true groundspeed, about 240 m/s

Δσ = 43° around 20:53, when the AAIB's figure 4 shows the false position near the pole, and 84° (9,374 km) at 20:59, when the attitude was declared invalid: a horizon tilted by 84°, close to the report's 90° given groundspeeds read by eye. On a flat Earth a wrong position tilts nothing; “down” is the same everywhere.

## Long-haul flights: the times fit the globe's distances [evidence: check — Where the radius enters: route lengths in km computed from the airports' coordinates.]

Every flight between 127 pairs of airports listed on FlightAware on 2026-09-28, 2026-11-06, 2026-11-25: about two weeks of each service, 6,686 flights, timed from wheels off to wheels on, with the cruise speed filed in the flight plan.[10] Winds help one way and slow the other (Sydney–Johannesburg: 13.9 h and 11.5 h), so both directions are averaged. The two models only differ in the distance between two airports of known latitude φ and longitude λ:[11]

46 flights · Sydney → Santiago 11.91 h · Santiago → Sydney 13.84 h

measured airborne time: **12.9 h** · cruise speed filed in the flight plan 895 km/h

globe: 11,340 km → **881 km/h**

flat map: 25,679 km → **1,994 km/h** (×2.26)

*Figure caption:* **Same flight, same measured time, two maps.** Left the globe, right the flat disc. Both aircraft take off and land together; what differs is how far each must go, and so how fast. Dots: the turning points of a filed flight plan; on the disc, dashed teal is the globe's great circle carried over, orange the disc's straight line.

$$\color{globe}{d_G = R \arccos(\sin\varphi_1 \sin\varphi_2 + \cos\varphi_1 \cos\varphi_2 \cos\Delta\lambda)}$$
$$\color{flat}{d_F = \sqrt{r_1^2 + r_2^2 - 2 r_1 r_2 \cos\Delta\lambda}, \quad r = R\,(90° - \varphi)}$$
$$t = t_0 + \frac{d}{v}$$

d_G: great-circle distance on the globe · d_F: straight line on the usual flat map, the azimuthal-equidistant disc centred on the North Pole (90° − φ in radians) · t: airborne time · t_0: climb and descent · v: one speed for every route

Globe, airports at their surveyed coordinates: one line, t = 33 min + d ÷ 906 km/h, fits all 127 routes to 3.5 %, and the speeds each route implies, 713–910 km/h, match the filed cruise speeds, 763–957 km/h. Disc: the long southern routes come out about twice as long and would need 1,716–2,158 km/h over the ground, both ways, from aircraft that filed a median 902 km/h; its best single speed still misses by 39 %. A second check needs no clock: from Sydney the globe's route to Santiago leaves heading 145° and dips to 62°S (the filed route reaches 45°S)[10]; the disc's leaves heading 21° and passes 46°N, over the North Pacific.

Download every timed flight (CSV): one row per flight kept, wheels off to wheels on, with its route's median each way, the distance on the globe and on the flat disc, and the cruise speed filed. To see one route, pick it in the figure above: its numbers are written under it.

## The flat map at its best

The disc is only one flat map. To give the flat Earth its best chance, place the 32 airports *anywhere* on a plane so that the straight distances fit the flight times as well as possible, with the globe's timing rule:

*Figure caption:* **Springs cut to the flight times.** Left: the airports slide on a plane until the springs are as relaxed as they can get. They never go slack: orange springs are stretched beyond what their flights allow, blue ones squeezed; the worst are marked with how far off they are. Right: every route once more, its length on that plane (open circles) or on the globe (dots) against the distance its flight time allows. On the dashed line a route fits exactly. The globe's dots, with nothing fitted, stay on it; the best plane's circles, with every airport free, scatter around it. The fit is replayed from the start that leads to the best arrangement.

$$\min_{x}\; \Sigma_{ij} \left(\frac{\lvert x_i - x_j \rvert - \delta_{ij}}{\delta_{ij}}\right)^2, \qquad \delta_{ij} = v\,(t_{ij} - t_0)$$

x_i: position of airport i on the plane, free · δ_ij: the distance route ij's airborne time allows · each route is a spring cut to δ_ij

That is 61 free numbers against 127 routes. The best arrangement, the same from every start tried, still misses by 9.3 %, 2.6 times the globe's 3.5 %, which has no free number; its worst route is SCL–LAX (−37 %). A sphere's distances cannot be laid flat without stretching some. The globe's own worst routes are HND–LHR (+15 %), whose filed route goes round by the Arctic, and JNB–CPT (−16 %), a short hop where the fixed 33 min weighs most.

*Figure caption:* **Headings on the best flat map.** Left: the same airports sliding on the plane, the four routes the final map gets most wrong in colour. Right: each route's heading at its first airport, on a compass. Outer ring: the real heading, that of the great circle (the globe's, nothing fitted). Inner ring: the heading the plane gives it at this step of the fit. A radial line means the two agree; the more it slants, the bigger the error. The map has no north of its own: it is laid on the compass the way that suits it best, and that position is kept at every step.

The same map also fixes *directions*, which no distance was asked to respect. Placed on the disc as favourably as possible (its north point and its handedness chosen to help it), its routes' headings differ from the real great-circle headings by 62° rms, and 40 / 254 of them by more than 90°. Two striking cases (real heading → heading on this map, at the first airport): JNB→SIN: 82° → 257°, a 175° error; JNB→MRU: 84° → 270°, a 174° error. A pilot following the map's heading would fly away from the destination. Distances alone leave the airports' arrangement loose; headings, which a compass and a heading indicator do measure, expose it. A third-party experiment runs the same idea with many more flights and no coordinates at all, and lets the airports settle into a shape you can turn around: [Flight-Time Globe](https://flight-time-globe.surge.sh/) [27].

## A shape from the flight times alone [evidence: measurement]

Forget the coordinates. Keep only the 127 round trips and their airborne times, as the [Seismology](/ai/seis.md) tab does with earthquakes: one unit of length is the distance flown in one hour, and every route obeys one rule, h = c₀ + d. The earthquakes' recipe lets every point float freely in space; here that cannot work, and the page says why: 127 times cannot fix 32 points in space (90 unknowns), fewer times than unknowns, so nothing forces a shape there; the search (twenty starts) stops at 52.3 min with a cloud that is not round (21 % radial scatter). So both surfaces get two numbers per airport and differ by *one* number: the plane, or a sphere whose radius R is free (a huge sphere is the plane again). Both are built the same way, airport by airport, the best-connected first, each placed where its times put it, then polished; both are also fitted from 100 random starts, and the better result is kept.

*[Figure: Animation: airports placed from airborne times alone, one by one, first on a plane, which stalls; then by the same steps on a sphere of free size, which fits; the routes then drawn as great-circle arcs; the size in kilometres from the filed airspeed; finally the cloud turned onto the real map, with a red dashed arc from each airport to its real position]*

- plane: 0.0 min rms of the time residuals · airports placed: 4 / 32

*Figure caption:* **The shape comes out of the timetable.** One animation in six steps. 1–2: the airports laid one by one on a plane, which stalls. 3: the same steps on a sphere of free size. 4: only then are the routes drawn as arcs and the sphere shown. 5: the size in kilometres from the airspeed the airlines file. 6: the check, the cloud turned (rotation only) onto the real map; a red dashed arc from each airport to its real place. Colour: the airport's real latitude, never read by the fit. Hollow: an airport whose place the times do not fix (another place fits almost as well).

$$h_{ab} = c_0 + d_{ab}$$
$$\color{flat}{d_{ab} = \lvert x_a - x_b \rvert} \qquad \color{globe}{d_{ab} = R\,\omega_{ab}}$$
$$R_{\text{km}} = R \times v_{\text{TAS}} \times 1\,\text{h}$$

h_ab: airborne time of route ab, both directions averaged · c_0: climb and descent, free · d_ab: length of the route in hours of flight · x: an airport's place on the plane, free · ω_ab: angle between two airports seen from the sphere's centre, free · R: the sphere's radius, free · v_TAS: median filed true airspeed

The plane stalls at 56.2 min rms; the sphere settles at 11.2 min, 5 times better with one number more, and picks R = 6.98 hours of flight. Times alone give no kilometre; the true airspeed filed in 90 flight plans, 902 km/h, measured through the air, gives R = **6,293 km**. Only after the fit, the airports' real coordinates. The times cannot tell a map from its mirror image, so the mirror is allowed too (this cloud came out mirrored); turned onto them, the 28 airports whose place the times fix sit 3.0° rms from their real place (median 2.1°, largest 9.4°). The others are hollow on the drawing (IPC, PPT, AUH, EZE): another place, more than 20° away, fits their routes within 2 times the mesh's own misfit; with one route an airport can swing round its neighbour, and Buenos Aires, whose Frankfurt and Amsterdam are almost one direction, folds across. The routes the sphere explains worst are HND–SYD +40 min, HKG–LHR +37 min, DXB–LAX +30 min. Some times measure a detour rather than a distance: since 2022, flights from Europe to Japan and Hong Kong go round Russian airspace (HKG–LHR, HND–LHR, CDG–HND), and the extra length pulls Tokyo and Hong Kong out of place, which then shows on their other routes too. Every route is kept. Set aside by the site's three-standard-deviation rule, each surface on its own residuals, the plane would drop to 26.7 min (6 routes out: SYD–JNB, PER–JNB, SIN–JNB, SCL–LAX, HND–SYD, HKG–JNB, the routes it fits worst), the sphere to 7.2 min (5 out: DXB–LAX, HND–SYD, DXB–HND, HKG–LHR, SFO–DXB) with R = 6,284 km: a rule that removes what a model fits worst would flatter both, so it is a check of R only. The search has local minima on both surfaces: of 100 random starts, the best reach the same values as the airport-by-airport construction only once each.

## The radius of the Earth from a stopwatch and a flight plan [evidence: measurement]

Times alone give a speed, not a size: on a globe twice as large, aircraft twice as fast would keep the same timetable. The [Seismology](/ai/seis.md) tab solves this with a known wave speed; aircraft carry their own. The cruise speed filed in each flight plan is a *true airspeed*, measured through the air, independent of the ground's shape.[10] So fit R:

*Figure caption:* **One radius per route.** Each dot is the radius implied by one route's round-trip time and filed airspeed, against the route's length; teal, the fit over all of them; dashed, the Earth's mean radius. Shortest route first.

$$t = t_0 + \frac{R\,\theta}{v_{\text{TAS}}}$$
$$\langle t \rangle = \frac{d}{v} \cdot \frac{1}{1 - w^2/v^2} > \frac{d}{v}$$

θ: angle between the two airports at the Earth's centre, from their coordinates · v_TAS: filed true airspeed · ⟨t⟩: mean of the two directions with a wind w along the route, always longer than with no wind

On the 90 round-trip routes with a filed plan: **R = 6,513 km ± 83 km**, t_0 = 17 min, 2.2 % above the Earth's mean radius. Route by route, the long flights give 6,181 km (BNE–SIN) to 7,507 km (CDG–HND), median 6,460 km; Tokyo–London, round by the Arctic, 8,135 km. High, as it should be: every known bias pushes up. Detours from the great circle read as a bigger Earth; the wind does not cancel (about 1% for 100 km/h, the formula above); crosswinds lengthen both legs; a filed airspeed is a plan, not a measurement. On a plane the fit has no radius to find: with the disc's distances, the southern routes would need twice the airspeed.

## Around the world: east–west and north–south [evidence: prediction]

Flying east until you come back works on both maps: on the disc it is a circle around the North Pole. What differs is the length. North–south, the globe has a second pole to fly over; the disc has only a rim.

Sydney → Santiago → São Paulo → Johannesburg → Perth → Sydney

measured airborne time, mean of the two directions: **39.7 h** (eastbound 36.1 h, westbound 43.3 h) · filed cruise speeds 843–895 km/h

globe: 32,981 km → **831 km/h**

flat map: 73,444 km → **1,850 km/h** (×2.23) — **faster than the aircraft can fly**

*Figure caption:* **Four trips around the world, on both maps.** The same time on both, measured or published; the two aircraft start and finish together, so only the speed differs. Left the globe, whose view follows the aircraft; right the flat disc, with the globe's route dashed in teal. Over the South Pole, the flat route touches the rim at the point that suits it best.

$$L_{\text{globe}}(\varphi) = 2\pi R\cos\varphi$$
$$L_{\text{disc}}(\varphi) = 2\pi R\left(\frac{\pi}{2} - \varphi\right)$$

L: length of the parallel at latitude φ (negative south, in radians in the second line) · on the disc, the parallel is a circle of radius R(π/2 − φ) around the North Pole · the two agree only at the North Pole

The disc stretches the parallel of 45°N by 11 %, the equator by 57 %, and 35°S, where Sydney, Santiago and Cape Town lie, by 166 %. Four documented circuits, summed leg by leg with the distance formulas of the long-haul section:

**Around the world: the time each circuit took, and the average speed each map needs**

| Circuit | Time | Globe | Flat map | Aircraft |
| --- | --- | --- | --- | --- |
| **Southern ring of scheduled flights** · East–west · Sydney → Santiago → São Paulo → Johannesburg → Perth → Sydney | 39.7 h in the air | 32,981 km · 831 km/h | 73,444 km · **1,850 km/h** | 843–895 filed km/h |
| **Concorde AF1995, 1995** · East–west · New York → Toulouse → Dubai → Bangkok → Guam → Honolulu → Acapulco → New York | 31.5 h elapsed | 36,737 km · 1,168 km/h | 44,382 km · 1,411 km/h | 2,150 cruise km/h |
| **Pan Am 50, 1977** · North–south, over both poles · San Francisco → North Pole → London → Cape Town → South Pole → Auckland → San Francisco | 54.1 h elapsed | 42,422 km · 784 km/h | 71,369 km · **1,319 km/h** | 980 max km/h |
| **One More Orbit, 2019** · North–south, over both poles · Kennedy Space Center → North Pole → Astana → Mauritius → South Pole → Punta Arenas → Kennedy Space Center | 46.7 h elapsed | 40,194 km · 861 km/h | 61,625 km · **1,321 km/h** | 983 max km/h |

The globe's sums land on the published distances: −0.06 % for Pan Am 50[19][20], +0.05 % for One More Orbit[12][13]. On the disc both polar trips, and the southern ring of scheduled flights[10], need average speeds the aircraft cannot fly[23][24]. Concorde's northern loop[21] settles nothing: the disc stretches it by only 21 %, well within Mach 2[22]. Its published distance, 40,638 km, lies between the two maps' shortest lines, as any real track would.

> **Verdict rule, stated in advance.** *Globe:* free heading indicators drift by −15.04°·sin φ per hour, opposite ways in the two hemispheres; inertial units find north and their latitude from the Earth's rotation below about 82°; round-trip times grow with great-circle distance at one speed near the filed cruise speeds; Sydney–Santiago leaves south-east; circuits of the Earth take the time of the globe's lengths; a gravimeter reads less flying east than west, and needs the v²/R term too, and the lines agree best when all of the globe's correction is kept (k = 1). *Plane:* no Earth-rate drift (still) or the same everywhere (turning); no alignment; times proportional to flat-map distances; Sydney–Santiago leaving north-east; gravity the same in every direction of flight. The flat model is vindicated if free gyros drift the same way in both hemispheres, if inertial units fail to find north or report wrong latitudes, if southern round trips take twice as long as equally long northern ones, or if the best fraction of the globe's correction is 0 rather than 1, or if uncorrected airborne gravity agrees between eastbound and westbound lines, or if flights over both poles or around the southern hemisphere take the time the disc's lengths need. The globe is refuted by any of the opposites.

**Limits of this tab.** Flight times are FlightAware's, over about two weeks; some may be estimates. A flight more than 3 standard deviations from the other flights of its route and direction (their standard deviation, computed without it) is set aside: 68 of 6,754. Averaging the two directions removes the wind only to first order. Airliners fly wind-optimal tracks and avoid closed airspace, and one rule “fixed time plus distance over speed” ignores climb, descent and taxiing differences, so short hops fit worst. The Eötvös test uses one survey block and rebuilds the meter readings. EI-GJT's groundspeeds are read by eye, a few percent at best, and its drawn track is schematic. The Schuler figure is computed, not flown: there is no plane to fly over. The heading-indicator figures leave out friction, often larger than Earth rate in an old instrument. The springs test every flat map at once, but only with these 127 routes.

**See also**[Distances](/ai/dist.md)[Foucault](/ai/fou.md)[GPS](/ai/gps.md)[Azimuth](/ai/azim.md)

## Sources for this tab

1. [1] Federal Aviation Administration, [*Instrument Flying Handbook*, FAA-H-8083-15B](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/FAA-H-8083-15B.pdf), ch. 5, “Attitude Indicators” — the dot and wings of the symbolic aircraft “represent a pitch change of approximately 2°”; “an erection mechanism inside the instrument case applies a force any time the gyro tilts from its vertical position”; at start-up “a self-erecting mechanism inside the instrument actuated by the force of gravity” brings the gyro upright, which “can take as long as 5 minutes, but is normally done within 2 to 3 minutes”.
2. [2] Federal Aviation Administration, [*Pilot's Handbook of Aeronautical Knowledge*, FAA-H-8083-25C](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/faa-h-8083-25c.pdf), ch. 8, “Heading Indicator” — “the gyro is oriented in space, and the Earth rotates in space at a rate of 15° in 1 hour. Thus, discounting precession caused by friction, the heading indicator may indicate as much as 15° error per every hour of operation”; free gyros must be checked “approximately every 15 minutes” and reset to the magnetic compass.
3. [3] Wikipedia, [*Heading indicator*](https://en.wikipedia.org/wiki/Heading_indicator) — Earth-rate apparent drift “predicted by ω sin Latitude and will thus be greatest over the poles”, of opposite sign in the northern and southern hemispheres; the “latitude nut” that induces an equal and opposite real wander; transport wander from the convergence of the meridians. Consulted 2026-09-28.
4. [4] VectorNav, [*Inertial Navigation Primer — Theory of Operation: Gyroscopes*](https://www.vectornav.com/resources/inertial-navigation-primer/theory-of-operation/theory-gyros) — gyrocompassing: the Earth's rotation, about 15°/h, decomposed into a horizontal component pointing due north, 15°/h × cos(latitude), and a vertical component; the heading is found from the horizontal one, which is why gyrocompassing needs low-noise, bias-stable gyros. Consulted 2026-09-28.
5. [5] Honeywell, [*Laseref V Micro Inertial Reference System (Special Missions) — Product Description*](http://www.repairfaq.org/sam/laser/LASEREF_V-1.pdf) (March 2004) — “three force rebalance accelerometers and three laser gyros”; the system “requires system initialization (entry of latitude and longitude)”; “The standard alignment time varies from 5 minutes at the Equator to 10 minutes at 70 degrees North or South Latitude. It is automatically extended for alignments up to 82.5 Degrees Latitude.”
6. [6] Wikipedia, [*Schuler tuning*](https://en.wikipedia.org/wiki/Schuler_tuning) — M. Schuler, “Die Störung von Pendel- und Kreiselapparaten durch die Beschleunigung des Fahrzeuges”, *Physikalische Zeitschrift* 24 (1923); the period 2π√(R/g) ≈ 84.4 minutes; an inertial platform kept level by turning it at v/R, the vehicle's speed over the Earth's radius. Consulted 2026-09-28.
7. [7] J. R. Carpenter and I. Y. Bar-Itzhack, [“Schuler period in LEO satellites”](https://ntrs.nasa.gov/api/citations/20040040118/downloads/20040040118.pdf), NASA Goddard Space Flight Center (NTRS 20040040118) — the Schuler pendulum, of length equal to the Earth's radius, whose period is the period of the errors of terrestrial inertial navigation systems, and why it equals the orbital period of a low satellite.
8. [8] [14 CFR Part 121, Appendix G — Doppler Radar and Inertial Navigation System (INS)](https://www.law.cornell.edu/cfr/text/14/appendix-G_to_part_121) — “For flights up to 10 hours' duration, no greater than 2 nautical miles per hour of circular error on 95 percent of system flights completed is permitted.”
9. [9] Air Accidents Investigation Branch, [*AAIB Bulletin 12/2019*, Boeing 737-8AS EI-GJT, EW/C2018/10/01](https://assets.publishing.service.gov.uk/media/5f58dab2d3bf7f7232e7e631/Boeing_737-8AS_EI-GJT_12-19.pdf) — serious incident of 9 October 2018 en route from Porto to Edinburgh: a longitudinal acceleration offset of about 1.6 g in the left IRS; its position “passed east of the north pole” (figure 4); left IRS groundspeed, track, heading and drift from 20:36 to 21:04 UTC (figure 3); “This inertially-generated positional data in relation to the Earth is used to generate the attitude indication on the PFD”; the pitch attitude shown increasing to 90° and the heading changing by nearly 180° over about 20 minutes, until attitude information was declared invalid; ring laser gyros and X, Y, Z accelerometers in each ADIRU.
10. [10] [FlightAware](https://www.flightaware.com/), public flight pages of the callsigns listed in `data/avia/flights/routes.json`, read on 2026-09-28 (raw pages kept in `data/avia/flights/raw/`; about two weeks of flights for each) — actual wheels-off and wheels-on times, the cruise speed, route and latitude/longitude waypoints of the filed flight plans, and the airport reference coordinates. Flights cancelled or diverted, and legs more than 3 standard deviations from the mean of the other legs of their direction (the others' standard deviation), are left out and counted.
11. [11] J. P. Snyder, [*Map Projections — A Working Manual*](https://doi.org/10.3133/pp1395), U.S. Geological Survey Professional Paper 1395 (1987) — the azimuthal equidistant projection, which keeps true distances only along straight lines through its centre; centred on the North Pole it is the usual flat-Earth map (see the Distances tab).
12. [12] Fédération Aéronautique Internationale, [“One More Orbit team circle the globe in under 47 hours”](https://web.archive.org/web/20250913100415/https://www.fai.org/news/one-more-orbit-team-circle-globe-under-47-hours) (Internet Archive copy of 2025-09-13) — Gulfstream G650ER, landed at the Kennedy Space Center on 11 July 2019 “after a round trip that took in both the North and South Poles and took 46 hours, 39 minutes and 38 seconds”.
13. [13] One More Orbit, [*Mission Statistics*](https://www.onemoreorbit.com/mission-statistics) — four legs: Kennedy Space Center → Nur-Sultan (over the North Pole), Nur-Sultan → Mauritius, Mauritius → Punta Arenas (over the South Pole), Punta Arenas → Kennedy Space Center; total distance 40,172 km; average speed 465 kt (861 km/h). (The same page also gives “22,422 NM”, which does not match its own kilometres or average speed; this page uses the kilometres.) Consulted 2026-09-28.
14. [14] L. Eötvös, [“Experimenteller Nachweis der Schwereänderung, die ein auf normal geformter Erdoberfläche in östlicher oder westlicher Richtung bewegter Körper durch diese Bewegung erleidet”](https://doi.org/10.1002/andp.19193641604), *Annalen der Physik* **364**(16), 743–752 (1919) ([open copy](https://zenodo.org/records/2447259)) — the change in weight of a body moving east or west on the rotating Earth, and the laboratory apparatus that demonstrated it.
15. [15] É. Kilényi (ed.), [*The Eötvös experiment in its historical context*](https://real-eod.mtak.hu/8266/13/Internetes%20v%C3%A1ltozat%20angol%20bemutat%C3%B3.pdf) (Hungarian Academy of Sciences repository) — Eötvös's last paper, dictated to his assistants and sent to *Annalen der Physik* on 13 March 1919, arose from O. Hecker's gravity observations on board ships; the effect and the correction bear his name since.
16. [16] R. B. Harlan, [“Eötvös corrections for airborne gravimetry”](https://doi.org/10.1029/JB073i014p04675), *Journal of Geophysical Research* **73**(14), 4675–4679 (1968) — the correction for an aircraft on the rotating reference ellipsoid, accurate enough for jet speeds; the difference from the simpler spherical formulas is first order in the flattening, up to 11.2 mGal for a 450-knot aircraft at mid-latitudes.
17. [17] NOAA National Geodetic Survey, [*GRAV-D General Airborne Gravity Data User Manual*](https://www.ngs.noaa.gov/GRAV-D/data/NGS_GRAV-D_General_Airborne_Gravity_Data_User_Manual_v2.1.pdf), v2.1, T. M. Damiani, M. Youngman and J. Johnson (eds.) (2017) — nominal surveys at 20,000 ft and 250 knots; “corrections for aircraft motion (Eötvös and vertical acceleration corrections)” computed from the GPS positions “following Harlan (1968)”; the gravimeter “measures to approximately 1 mGal accuracy”; “no leveling (also called crossover adjustments) or bias corrections of any kind are applied to the airborne data that is released”.
18. [18] NOAA National Geodetic Survey, GRAV-D Team, [*Block EN02 (Eastern North 02) — Airborne Gravity Data and User Manual*](https://www.ngs.noaa.gov/GRAV-D/data_en02.shtml), release BETA #2, M. A. Youngman and C. A. Weil (eds.) (2013) — the data file used here (line, time, latitude, longitude, ellipsoidal height, full-field gravity at altitude); surveys NY11 and IN11, 8 August – 21 November 2011, King Air E90A and Pilatus PC-12, 20,000 ft; “all data lines are East-West”, 10 km apart; an “unidentified bias in all flight lines” adjusted for the crossover analysis, whose residuals are 2.39 mGal rms. Read on 2026-09-29 by `fog build avia-gravd`.
19. [19] Fédération Aéronautique Internationale, [record 3796, Walter H. Mullikin (USA)](https://web.archive.org/web/20240717160806/https://www.fai.org/record/3796) (Internet Archive copy of 2024-07-17; the live page refuses automated reading) — status “ratified - current record”, class C-1t, type of record “Speed around the world over both the Earth's poles”, performance 784.31 km/h, date 28 Oct 1977, course “San Francisco, CA (USA) and return (via Geographical North Pole, London, Cape Town, South Geographic Pole, Auckland)”, Boeing 747 SP, Pratt & Whitney JT9D.
20. [20] [“10/28/1977: Pan Am's Polar Flight Around the World”](https://www.airwaysmag.com/new-post/pan-am-polar-flight-around-the-world), *Airways Magazine* — Pan Am Flight 50, Boeing 747SP “Clipper New Horizons” (N533PA), from San Francisco on 28–30 October 1977 over the North Pole to London, Cape Town, over the South Pole to Auckland and back; total time 54 hours, 7 minutes, 12 seconds; cruise at 43,000 ft; average 487 mph (784 km/h).
21. [21] [“Concorde lands, breaking speed record”](https://www.upi.com/Archives/1995/08/16/Concorde-lands-breaking-speed-record/1533808545600/), UPI, 16 August 1995 — Air France Concorde from Kennedy Airport eastbound with stops in France (Toulouse), Dubai, Bangkok, Guam, Honolulu and Acapulco; 31 hours, 27 minutes and 49 seconds; 25,252 statute miles (40,638 km); previous record 32 h 49 min 3 s, also by Concorde, 12–13 October 1992.
22. [22] Wikipedia, [*Concorde*](https://en.wikipedia.org/wiki/Concorde) — “an average cruise speed of Mach 2.02 (2,150 km/h)”; maximum speed reached in test, 2,370 km/h (Mach 2.23).
23. [23] Wikipedia, [*Boeing 747SP*](https://en.wikipedia.org/wiki/Boeing_747SP) — specifications: maximum speed Mach 0.92 (about 980 km/h at 11 km, where sound travels at 295 m/s); Pan Am Flight 50, 28–30 October 1977, 54 h 7 min 12 s, stopovers at Heathrow, Cape Town and Auckland, over both poles.
24. [24] Wikipedia, [*Gulfstream G650*](https://en.wikipedia.org/wiki/Gulfstream_G650) — specifications (G650 and G650ER): maximum operating speed Mach 0.925 (983 km/h); cruise Mach 0.85–0.90 (903–956 km/h).
25. [25] International Standard Atmosphere (ICAO Doc 7488; ISO 2533:1975) — sea-level pressure 1,013.25 hPa and a fall of 6.5 K per km below 11 km, so a given pressure sits at a given height: about 697 hPa at flight level 100 (3,048 m) and 238 hPa at flight level 350 (10,668 m); the aircraft's altimeter reads this pressure and nothing else.
26. [26] H. Moritz, [“Geodetic Reference System 1980”](https://doi.org/10.1007/BF02521480), *Bulletin Géodésique* **54**, 395–405 (1980) — the reference ellipsoid of which WGS84 is a near twin, its normal gravity formula, and the normal vertical gradient of gravity, 0.30877 (1 − 0.00142 sin²φ) mGal/m, that is 0.3086 mGal/m near 42° N: the two reductions the Eötvös section uses to bring two lines to a common height and latitude.
27. [27] [“Flight-Time Globe”](https://flight-time-globe.surge.sh/) (author not named on the page; read 2026-11-23) — the same idea with many more flights: airline durations only (OpenSky, adsb.lol, US BTS, Flightradar24; airport names from OurAirports), no coordinates; airports start scattered and move until the times fit, first on a plane, then as free points in 3D, then on one shared quadric surface, and the page reports a closed surface curving inward everywhere. Code and the route table are published on the page. A third-party experiment: we have not re-run it and quote none of its numbers.
