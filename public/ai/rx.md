# Find where you are from the satellites' raw signals, then measure the Earth's radius with people far away

> Tab "Your own GPS" of *Flat plane or Globe?*. Web page: /#tab-rx. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Your own GPS · raw signals, solved in your browser*

The [GPS tab](/ai/gps.md) solved 80 reference stations from their raw signals and found a sphere of radius 6,371.2 ± 0.9 km through them. This tab does the same with **your** phone. Most Android phones since 2016 give applications the raw times of the satellite signals;[1] the page turns them into distances, solves your position from the centre of the coordinates with no shape assumed, and shows how far the result is from the surface the stations define. One phone is one point, and a sphere needs at least four: so each participant can share a short code, and a group spread over thousands of kilometres fits its own sphere. The tool comes first, then what the code contains and what it protects, then every equation with the same step written in Python, C or Go. **Everything is computed in this page. The files are not sent anywhere, nothing is stored, and the result is gone when the page is closed.**

**What you need.** An Android phone, outdoors, and an app that logs raw measurements: GPSTest or Google's GnssLogger[1] (raw logging on; the .txt log or a RINEX observation file both work). A few minutes are enough. Then the broadcast navigation file of the same day, from the open IGS archive:[7] the page tells you which folder once your log is read.

## ① Try it with your phone

Choose your log and the navigation file, together or one after the other; compressed `.gz` files can be chosen as they are. The page reads them, tells you which navigation file it needs if it is missing, solves every instant, then puts your phone among the 80 stations of the GPS tab. Your position is shown rounded to 0.1°. How each step is computed is in section ④.

*Figure caption:* **Your phone among the stations.** Left: where it solved itself, on a flat map (only to locate it). Right: its distance to the sphere fitted through the stations, against latitude, with the flattening curve the stations draw. Tiles: your distance to the centre of the coordinates, the sphere refitted with you added, your pseudorange residuals and the gap to the fix the phone computed itself (its GNSS fix only, never the network one). A phone on one frequency is good to a few metres or tens of metres; the stations' surface only to about a kilometre, because their heights differ. Limit: the orbits are written in the Earth-centred WGS84 frame,[6] so your distance to its centre is a consistency check, not a radius found from nothing; what can fail is the residuals, metres if the geometry is right, kilometres if it is not. *Would favour the flat plane: a phone whose pseudoranges only solve with kilometre residuals, or that lands kilometres away from the surface the stations define.*

## ② Your code, and the codes of the others

Once your log is solved, the page writes your code below. Copy it and send it yourself to the people you choose — a message, a forum, an e-mail; the site has no server and never sees it. Paste the codes of the others in the second box: a whole message is fine, the page finds the codes in it. With four participants or more it fits a sphere through the group alone, centre and radius free, with the same formula as for the stations, and the best plane beside it. Every page given the same codes finds the same numbers, since your own point enters by its rounded position too.

Solve your own log above to get your code.

*Figure caption:* **The group's own sphere.** Tiles: the radius of the sphere through the participants alone, with its uncertainty; what the best plane through the same points leaves; the largest distance in the group and the bulge the sphere predicts over it. Left: where the participants are, as their codes say (a flat map, only to locate them; you in orange). Right: each participant's height above the best plane through the group, against the distance from the sphere's axis; the curve is the fitted sphere, the dashed line the plane. A chart with its own scales, not a drawing. *Would favour the flat plane: participants lying on a plane, with no bulge, or groups in different places finding radii that disagree beyond their uncertainties and beyond what the flattening allows.*

## ③ What the code contains, and what it protects

The code is plain text, readable by anyone; nothing in it is hidden or encrypted. Its fields, with an example:

| Field | Example | Meaning |
| --- | --- | --- |
| 1 | `FOG1` | format and version |
| 2 | `Oslo` | a name, optional (20 characters at most) |
| 3 | `20261003` | the day of the log |
| 4 | `1000` | the rounding step q, in metres (1000, 10000, or 1 for exact) |
| 5–7 | `3150\|598\|5495` | x, y, z: the position in Earth-centred coordinates, divided by q and rounded (here 3,150 km, 598 km, 5,495 km) |
| 8 | `65` | rms of the pseudorange residuals, in decimetres (6.5 m) |
| 9 | `60` | number of instants solved |
| 10 | `GE` | systems used: G for GPS, E for Galileo |
| 11 | `brpax3` | check digits: FNV-1a hash of fields 1–10 in base 36; a copying error changes them |

**What stays with you, and what does not.** Your log, your exact position, the times of your measurements and your phone's model never leave this page. The code is the only thing that does, and only if you copy it. It is **not** just a radius or a centre: it carries your position, rounded to the step you chose, so whoever reads it knows where you were to within about a kilometre with the 1 km step (a district), about ten with 10 km (a town and its surroundings). The page writes the latitude and longitude it reveals before you copy it. Why not share less? A radius or a distance to the centre alone would hide more but measure nothing: every phone's distance is to the centre of the frame in which the orbits are written,[6] so it repeats the frame instead of measuring the bulge between people. The group's centre and radius are found *from* the points, so the points must be shared. What you control: whom you send it to, the rounding (10 km if 1 km is too precise; the figure in section 4.6 shows what it costs in precision), and the name, which can stay empty.

## ④ The calculation, equation by equation

Each formula below comes with its figure and the same step as code, in the language you choose. The pieces build on each other: the satellite's position serves the equation, which serves the solution. They are short versions of the page's own code (`src/tabs/rx/userlogic.js` and `grouplogic.js`), with the same numbers and constants; each was run, and gives the page's results on the same inputs to the millimetre.

## 4.1 What your phone records

A GPS satellite does not send a distance. It sends its own clock: every signal carries the time at which it left the satellite. Your phone notes when the signal arrived, on its own clock. The difference is the flight time, and times the speed of light it is a distance — a *pseudo*range, because the phone's clock is off by an unknown amount, which the calculation solves as one more unknown. Android gives the pieces separately: a hardware counter, its offset to GPS time, and the time read in the signal.[1]

$$t_{rx} = \text{TimeNanos} - (\text{FullBiasNanos} + \text{BiasNanos}) \quad \text{(modulo one week)}$$
$$\rho = c\cdot(t_{rx} - t_{tx})$$

TimeNanos: the phone's hardware counter · FullBiasNanos, BiasNanos: its offset to GPS time (about −1.5×10¹⁸ ns, too large for ordinary floating point: the page uses 64-bit integers) · t_tx = ReceivedSvTimeNanos: the emission time read in the signal · c = 299,792,458 m/s. A measurement is kept only if the phone has decoded the full time of week from the signal (otherwise t_tx is known modulo 1 ms or 100 ms), on the L1/E1 frequency, for GPS and Galileo.[1] The result lies between 20,189 km and 25,784 km for a satellite overhead or on the horizon.

## 4.2 Where the satellites were [evidence: check — Where the radius enters: satellite orbits broadcast in the WGS84 frame, whose scale was fixed by stations on the ellipsoid.]

Distances alone place you nowhere: you must know where each satellite was when it sent its signal, and how wrong its clock was. Every satellite broadcasts both, as a few dozen numbers — the elements of its orbit and a clock polynomial — refreshed every two hours or so.[2][3] Your phone decodes them for its own fix but does not hand them to applications; the IGS stations record and archive them, one file per day: the *navigation file* you add. Prefer `BRDC00IGS_R_…`, published the next day, which also carries the ionosphere coefficients; on the day itself, `BRDC00WRD_S_…` has the same orbits without them.[7] The page turns the elements into a position with the algorithm of the GPS specification, line by line:[2]

$$M = M_0 + \left(\sqrt{\mu/a^3} + \Delta n\right) t_k, \qquad E - e\sin E = M$$
$$r = a(1 - e\cos E), \qquad \Omega = \Omega_0 + (\text{Ω̇} - \Omega_E)\,t_k - \Omega_E\,t_{oe}$$

t_k: time since the reference epoch t_oe of the elements · M: mean anomaly, growing evenly with time · E: eccentric anomaly, from Kepler's equation · e, a: eccentricity and semi-major axis · μ: the Earth's GM as the message defines it · Ω: longitude of the node, turned by the Earth's rotation Ω_E so that the result is in the Earth-fixed frame. Six small harmonic terms correct the argument, the radius and the inclination. Galileo uses the same form with its own μ.[3] The elements chosen are those of the same satellite with the nearest t_oe, within four hours, and only if the satellite declares itself healthy.

## 4.3 The equation, every term

The [GPS tab](/ai/gps.md) writes the pseudorange as a distance plus the receiver's clock. A real calculation adds the satellite's clock, the Earth's turn while the signal flies,[8] and two delays in the atmosphere. The figure gives the size of each term: the corrections are metres on a distance of twenty thousand kilometres, and leaving one out shows up directly in the residuals.

$$\rho_i = \left\lvert R_z(\Omega_E\tau_i)\,\mathbf{s}_i(t - \tau_i) - \mathbf{x} \right\rvert + c\,\delta t_{sys} - c\,\delta t_i + T_i + I_i$$
$$\delta t_i = a_{f0} + a_{f1}\Delta t + a_{f2}\Delta t^2 - \frac{2\sqrt{\mu a}}{c^2}\,e\sin E - T_{GD}$$

x: your position (three unknowns) · δt_sys: your phone's clock, one unknown per system (GPS, Galileo) · τ_i: flight time; the satellite is taken where it was at emission, then turned by Ω_Eτ_i about the axis because the Earth turned meanwhile (up to 41 m)[8] · δt_i: the satellite's clock, broadcast polynomial (up to 300 km of range), relativistic term (14 m for e = 0.02) and group delay T_GD for a single frequency[2] (Galileo: its E1/E5b delay[3]) · T_i: troposphere, Saastamoinen[5] · I_i: ionosphere, Klobuchar's model when the navigation file has its coefficients;[4] otherwise left in, a few metres. Unlike the stations, a phone receives one frequency, so the ionosphere cannot be cancelled by combining two.

## 4.4 Solving from the centre of the Earth [evidence: check — Where the radius enters: satellite orbits broadcast in the WGS84 frame, whose scale was fixed by stations on the ellipsoid.]

The equation is not linear in x, so it is solved in steps. Start from the origin of the coordinates — the centre of the Earth, with no idea where the phone is — compute what each pseudorange should be, compare with the measured one, and move x and the clocks by the least-squares correction. The troposphere, the ionosphere and the 10° elevation mask enter from the fourth step, once x is close enough to have a local horizon. Each instant of your log is solved alone, from the origin again; instants whose residuals exceed 100 m rms are dropped, with no limit on where the position may land; the rest are averaged.

$$\mathbf{H}\,\delta\mathbf{x} = \mathbf{y}, \qquad \delta\mathbf{x} = (\mathbf{H}^{T}\mathbf{H})^{-1}\mathbf{H}^{T}\mathbf{y}, \qquad \mathbf{x}_0 = (0,\ 0,\ 0)$$

y: measured minus computed pseudoranges · one row of H per satellite: the unit vector from the satellite towards x (changed sign), then 1 in the column of that satellite's system clock · δx: the move of x, y, z and the clocks · repeated until the move is below a millimetre. At least one satellite more than unknowns is required, so that the residuals say something. The figure runs the page's own code on a synthetic sky built from a real broadcast record: from the centre to the surface in a handful of steps.

## 4.5 Rounding your position

$$\hat{x} = q\cdot\text{round}(x/q), \qquad \sigma = q/\sqrt{12}$$

x: one coordinate of your solved position · q: the step you chose · x̂: what the code carries · σ: the standard deviation of a rounding error spread evenly over ±q/2, used to weight each participant in the group's fit. The check digits[9] catch a mistyped code; they do not stop anyone from inventing one.

## 4.6 The group's sphere [evidence: check — Where the radius enters: satellite orbits broadcast in the WGS84 frame, whose scale was fixed by stations on the ellipsoid.]

What makes the radius measurable is the bulge: over the distance L the surface rises above the straight line by s, at true scale in the figure. The sphere through the group is found in two steps — a linear first guess, then least squares on the true distances to the surface — and its uncertainty from the rounding and from the real scatter.

$$s = R - \sqrt{R^2 - (L/2)^2} \approx \frac{L^2}{8R}$$

L: the distance between the farthest participants · s: the height of the arc above its chord: 20 km over 1,000 km, 179 km over 3,000 km. A rounding error of q shifts a point by about q/√12; the radius is measured to roughly R·σ/s, so the farther apart the participants, the tighter it gets.

$$\text{Cov}(\mathbf{c}, R) = (\mathbf{J}^{T}\mathbf{W}\mathbf{J})^{-1}, \qquad w_j = 1/(q_j^2/12 + \sigma_{fix}^2)$$
$$s^2 = \sum_j \text{res}_j^2/(n - 4) \quad (n > 4)$$

J: one row per participant, the derivatives of its distance to the sphere with respect to the centre c and the radius R · w_j: its weight, from its rounding step q_j and a fix good to σ_fix ≈ 20 m · the first line gives the uncertainty the rounding alone would cause; with more than four participants the second uses the real residuals (different heights, the flattening). The page shows the larger of the two. With exactly four the sphere passes through every point and nothing measures the scatter: the page says so.

## 4.7 Which radius to expect [evidence: prediction]

$$M(\varphi) = \frac{a(1 - e^2)}{(1 - e^2\sin^2\varphi)^{3/2}}, \qquad N(\varphi) = \frac{a}{\sqrt{1 - e^2\sin^2\varphi}}$$

The Earth is slightly flattened, so a group spread over a few thousand kilometres measures the local curvature, which depends on where it is and in which direction it spreads: north–south M, from 6,335.4 km at the equator, east–west N, up to 6,399.6 km at the poles[6] (a, e: the WGS84 semi-major axis and eccentricity, a published model, compared and never fitted). “The same radius” means within this range and within the group's uncertainty. A group spanning continents measures something close to the stations' 6,371.2 ± 0.9 km.

## The flat model at its best

A flat model cannot use the broadcast orbits, which are written around a centre; it would need its own positions for the transmitters, and with a free height for each it could be tuned to match any one receiver. What it cannot do with one set of transmitters is to make phones everywhere solve to metres *and* make a group of them lie on a plane: the group's points come out of their own signals, and the bulge between them is either there or not.

> **Verdict rule, stated in advance.** *Globe:* each phone solves with residuals of metres, lands within about a kilometre of the stations' surface, and a group spread over thousands of kilometres finds a radius between 6,335.4 km and 6,399.6 km within its uncertainty, with the plane far behind. *Flat plane:* residuals of kilometres, or a group whose points lie on a plane, or groups whose radii disagree beyond their uncertainties.

**Limits of this tab.** The orbits are expressed in WGS84, so a single phone checks consistency rather than measuring the size from nothing; the independent part is the residuals and, for a group, the bulge between its own points. Without the ionosphere coefficients a few metres of error remain. A code can be invented, and the page cannot tell. Heights differ between participants by up to a kilometre or more, which the uncertainty of the group includes only from five participants on. GLONASS and BeiDou are not used, nor Hatanaka-compressed (.crx) or RINEX 2 observation files, nor the navigation messages some phones log themselves.

**See also**[GPS](/ai/gps.md)[Surveying](/ai/surv.md)[Distances](/ai/dist.md)

## Sources for this tab

1. [1] [Android API reference, `GnssMeasurement`](https://developer.android.com/reference/android/location/GnssMeasurement) (TimeNanos, FullBiasNanos, BiasNanos, TimeOffsetNanos, ReceivedSvTimeNanos, State) and the European GNSS Agency's white paper [*Using GNSS Raw Measurements on Android Devices* (GSA, 2017)](https://www.euspa.europa.eu/system/files/reports/gnss_raw_measurement_web_0.pdf): how a pseudorange is rebuilt from the clock fields a phone logs. The logs come from [GPSTest](https://github.com/barbeau/gpstest) or Google's [GnssLogger](https://github.com/google/gps-measurement-tools).
2. [2] [IS-GPS-200, *Navstar GPS Space Segment / Navigation User Interfaces*](https://www.navcen.uscg.gov/gps-technical-references): Tables 20-III and 20-IV (the broadcast orbital elements and the algorithm that turns them into a satellite position in the Earth-fixed frame, with μ and the Earth rotation rate), §20.3.3.3.3.1 (satellite clock polynomial and relativistic term), §20.3.3.3.3.2 (group delay T_GD for single-frequency users), §20.3.3.5.2.5 (the ionosphere model).
3. [3] [European GNSS (Galileo) Open Service Signal-in-Space Interface Control Document](https://www.gsc-europa.eu/electronic-library/programme-reference-documents), issue 2.1 (2023): the Galileo broadcast elements, the same Keplerian form as GPS with μ = 3.986004418×10¹⁴ m³/s², the satellite clock correction and the E1/E5b broadcast group delay.
4. [4] J. A. Klobuchar, “Ionospheric time-delay algorithm for single-frequency GPS users”, *IEEE Transactions on Aerospace and Electronic Systems* AES-23 (1987), 325–331: the eight broadcast coefficients and the cosine model of the delay, about half of the real delay removed.
5. [5] J. Saastamoinen, “Atmospheric correction for the troposphere and stratosphere in radio ranging of satellites”, in *The Use of Artificial Satellites for Geodesy*, Geophysical Monograph 15, AGU (1972), 247–251: the zenith delay (about 2.3 m at sea level) from pressure and humidity, here for a standard atmosphere with a 1/sin(elevation) mapping.
6. [6] NIMA TR8350.2, *Department of Defense World Geodetic System 1984*, 3rd ed. (2000): a = 6,378.137 km, 1/f = 298.257 223 563, the conversion between latitude, longitude, height and Earth-centred coordinates, and the two principal radii of curvature M (north–south) and N (east–west).
7. [7] [BKG GNSS Data Center — the IGS broadcast navigation archive](https://igs.bkg.bund.de/root_ftp/IGS/BRDC/) (open, no account): one folder per day, `BRDC00IGS_R_…_MN.rnx.gz` (merged by the IGS, published the next day, with the ionosphere coefficients) and `BRDC00WRD_S_…`/`_R_…` (BKG, updated during the day). The format is [RINEX](https://igs.org/formats-and-standards/), versions 2 to 4.
8. [8] N. Ashby, [“Relativity in the Global Positioning System”](https://doi.org/10.12942/lrr-2003-1), *Living Reviews in Relativity* 6 (2003), 1: the Sagnac correction (the Earth turns while the signal flies, up to about 133 ns for a receiver at rest) and the relativistic clock terms.
9. [9] G. Fowler, L. C. Noll, K.-P. Vo, D. Eastlake, T. Hansen, [*The FNV Non-Cryptographic Hash Algorithm*](https://datatracker.ietf.org/doc/draft-eastlake-fnv/), IETF Internet-Draft: the 32-bit FNV-1a hash used for the check digits of the code; it detects copying errors and is not meant to resist forgery.
