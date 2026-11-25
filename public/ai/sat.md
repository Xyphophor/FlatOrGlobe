# Satellites in the Doppler: their orbits, the Earth's mass and the shape of the ground

> Tab "Satellites" of *Flat plane or Globe?*. Web page: /#tab-sat. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Satellites · one day of Doppler from 80 receivers*

A navigation receiver counts the carrier cycles of every satellite it hears; the rate of the count is the Doppler shift, the speed at which the satellite comes closer or moves away. On 10 April 2025, 79 receivers of the International GNSS Service, on every continent, recorded it for 78 GPS, Galileo and GLONASS satellites[1]. This tab fits the orbits, the receivers' positions, the Earth's GM and its rotation to those speeds and to nothing else, starting with the receivers laid out on a flat map.

## What one day of satellite Doppler gives [evidence: measurement]

**Every number in the second column comes from the measured speeds, clocks and carrier frequencies alone, with the receivers started on a flat map. The third column is for comparison only and was never used[8][9]. How each is obtained is explained in the next sections.**

| Quantity | From the Doppler alone | Accepted value | Difference |
| --- | --- | --- | --- |
| Earth's GM (×10¹⁴ m³/s²) | **3.9860157** | 3.986004418 | +2.83 ppm |
| Rotation Ω (×10⁻⁵ rad/s) | **7.2921155** | 7.292115 | +0.07 ppm |
| One turn (sidereal day) | **23 h 56 min 4.09 s** | 23 h 56 min 4.10 s | −0.006 s |
| Equatorial radius (km) | **6,378.8** | 6,378.137 | +0.6 km |
| Flattening, from the receivers' positions | **1/291** | 1/298.26 |  |
| Flattening, from the orbits (J₂ and Clairaut) | **1/299** | 1/298.26 |  |
| J₂ (×10⁻³) | **1.0773** | 1.08263 | −0.49 % |
| Kepler III: GM from GLONASS, GPS, Galileo | **agree to 10.5 ppm** | one GM |  |
| Speeds left unexplained: receivers free / held on a plane | **2.6 mm/s / 131 m/s** | — | × 50,000 |

**How to read it.** GM is the Earth's mass times the constant of gravitation: what sets the satellites' periods. Ω is how fast the ground turns with respect to the orbits; one turn is the sidereal day. The radius and the flattening describe the surface on which the receivers end up; the flattening is found twice, from where the receivers sit and from how the satellites move. The last row is the test: the receivers left free explain the speeds to millimetres per second, held on a plane they miss by more than a hundred metres per second.

## The Doppler shift of a passing satellite

**A GPS satellite broadcasts on 1575.42 MHz, a wavelength of 19.03 cm.** Coming closer at 800 m/s it is heard 4.2 kHz higher; moving away, 4.2 kHz lower[3]. The receiver does not only measure the shift: it counts the cycles of the carrier, and the count changes by one each time the satellite's distance changes by one wavelength[2]. Here the count is read every 5 minutes over one minute, on two carrier frequencies so that the ionosphere, which slows the two differently, drops out[3][4][5]. At Wettzell, in Bavaria, the satellites approach and recede at up to 682 m/s: each rises closing in, passes its nearest point, and sets moving away.

*Figure caption:* **A satellite's Doppler shift records its motion.** Left: a GPS satellite on its orbit passing over a receiver, the line of sight and the satellite's velocity, with its part along the line of sight (thick arrow): toward the receiver while it rises, away while it sets. The Earth and the orbit are to scale with each other; the receiver is carried round by the rotation. Right: one day of measurements at Wettzell for the six satellites tracked longest, each point the speed over one minute every five minutes, and the curve of the fitted solution. Click to pause.

$$\dot\rho = -\lambda\,D = \lambda\,\frac{L(t+30\,\text{s}) - L(t-30\,\text{s})}{60\,\text{s}}$$
$${\dot\rho_{\text{IF}} = \frac{f_1^2\,\dot\rho_1 - f_2^2\,\dot\rho_2}{f_1^2 - f_2^2}}$$

ρ̇ is the range rate (how fast the distance to the satellite changes), λ = c/f the carrier's wavelength, D the Doppler shift and L the count of carrier cycles. The ionosphere delays a carrier by an amount proportional to 1/f², so the combination of two frequencies f₁ and f₂ in the second line cancels it. Nothing in this uses a position or a distance on the ground.

**This is how satellite navigation began.** In October 1957 William Guier and George Weiffenbach, at the Applied Physics Laboratory of Johns Hopkins, recorded the Doppler shift of Sputnik's 20 MHz beacon and found that one pass, from one station, was enough to work out its orbit. Their colleague Frank McClure turned the problem round: if the orbit is known, the Doppler gives the station's position. That became Transit, the US Navy's satellite navigation system from 1964[7]. This tab does both at once, with no orbit and no station known in advance.

## How speeds give the Earth's mass and its rotation

**Step 1: one satellite gives GM from its speed and its period.** The Doppler gives speeds, in metres per second, and the clocks give times. Watched through the day, a GPS satellite goes round in 11 h 58 min: its angular rate is n = 2π/T = 1.4586 × 10⁻⁴ rad/s. Its speed along the orbit is v = 3.874 km/s. A body going round at speed v with angular rate n is on a circle of radius a = v/n = 26,560 km: the size of the orbit, in kilometres, without any ruler. Newton's law for a circular orbit, v²/a = GM/a², then gives GM = v²a = v³/n = 3.9860 × 10¹⁴ m³/s². That is all GM is here: how fast a satellite must go to keep falling around at the distance its period implies (Orbit tab).

$$a = \frac{v}{n},\qquad \frac{v^2}{a} = \frac{GM}{a^2}$$
$${GM = v^2 a = \frac{v^3}{n}}$$

v is the satellite's speed, n = 2π/T its angular rate and T its period, a the radius of its orbit. For GPS: v = 3.874 km/s and T = 11 h 58 min give a = 26,560 km and GM = 3.9860 × 10¹⁴ m³/s². The real orbits are slightly elliptical and pulled by the Earth's bulge, the Sun and the Moon; the fit uses the full motion, but the idea is this one.

**Step 2: many receivers give each satellite's whole velocity.** A receiver measures only the part of the satellite's velocity along its line of sight, like a radar. Three receivers looking from different directions at the same moment measure three different parts, and together they fix the velocity in space; with dozens of receivers through the day, each satellite's whole orbit is pinned down, and each receiver's position with it, since a line of sight starts at the receiver. Each receiver's clock adds the same small error to every satellite it hears at that moment; comparing the satellites it hears removes it.

$$\dot\rho_k = \mathbf{u}_k\cdot\mathbf{v}_s - \mathbf{u}_k\cdot\mathbf{v}_k + \delta\dot t_k,\qquad k = 1, 2, 3, \ldots$$
$${\text{three directions } \mathbf{u}_k \Rightarrow \mathbf{v}_s}$$

ρ̇_k is the speed measured by receiver k, u_k the direction from it to the satellite, v_s the satellite's velocity, v_k the receiver's own velocity and δṫ_k its clock error, the same for every satellite it hears at that moment. One equation per receiver and satellite every five minutes: 467,192 of them for a few hundred unknowns.

**Step 3: the rotation shows in the receivers' own speed.** Every receiver is carried around the axis: at the equator at 465 m/s, at Wettzell (49.0° N) at 305 m/s. That velocity enters every speed the receiver measures, and its direction turns through the day, coming back after one turn. The satellites, meanwhile, follow Newton's laws in a frame that does not turn. The fit therefore needs one axis and one rate Ω that turn every receiver's position consistently against the orbits; it finds Ω = 7.292116 × 10⁻⁵ rad/s, one turn in 23 h 56 min 4.09 s, the sidereal day a clock and a star give (Rotation tab). A ground at rest would be Ω = 0; free to take any value, the fit settles on this one.

$$\mathbf{v}_k = \Omega\,\hat{\mathbf{z}}\times\mathbf{p}_k,\qquad |\mathbf{v}_k| = \Omega\,r_k\cos\varphi_k$$
$${T_\text{turn} = \frac{2\pi}{\Omega}}$$

p_k is receiver k's position from the centre, r_k its distance and φ_k its latitude, ẑ the axis. The receiver's speed is Ω times its distance from the axis, r cos φ. With Ω = 7.292116 × 10⁻⁵ rad/s, T_turn = 23 h 56 min 4.09 s.

**Step 4: everything at once.** The steps above are how the numbers can be read; the fit does them all together, because each unknown leans on the others: the orbits need the receivers' positions, the positions need the orbits, and both need GM and Ω. Least squares adjusts the few hundred unknowns until the 467,192 predicted speeds match the measured ones; the next section gives the full model and how it starts.

## Orbits, the Earth's mass and its rotation from the Doppler alone [evidence: measurement]

**Everything is unknown at the start except the clocks and the carrier frequencies.** Each satellite gets a position and a velocity at noon, moved by Newton's gravity: a point mass GM, a term for a flattened body, and the pull of the Sun and the Moon, which enters through their periods and a mass ratio, not their distances in kilometres[6]. Each receiver gets a position fixed on a body turning at a rate Ω about an axis. GM, Ω, the flattening term, 874 unknowns in all, are adjusted until the predicted speeds match the 467,192 measured ones. Each receiver's own clock rate is a free unknown at every epoch. **The receivers start on a flat map**, an azimuthal projection through the North Pole with GM 25 % too small; each receiver is placed on that map by its latitude and longitude, taken as angles from its file; the satellites start from the orbits they broadcast, the one input a globe model made. The restarts in the table below show what the start decides and what it does not.

*Figure caption:* **From a flat map to a ball, by the Doppler alone.** Left: the 80 receivers, iteration by iteration of the fit, in a tilted view that turns about the rotation axis (dashed), with the centre the orbits go round (cross). They start on a flat azimuthal map 6,371 km above the centre (orange disc); each iteration moves them to where the measured speeds put them, and they end on a ball. The wire sphere is drawn at 6,371 km for reference, not fitted; the view zooms as the network shrinks (scale bar). Right: each receiver's distance from the centre against its latitude: spread over thousands of kilometres at the start, all in the band 6,357–6,381 km at the end. Blue north, orange south. Click to pause.

$$\ddot{\mathbf{r}} = -\frac{GM}{r^3}\,\mathbf{r} + \mathbf{a}_{J_2} + \mathbf{a}_\odot + \mathbf{a}_{\text{Moon}},\qquad \mathbf{p}(t) = R_z(\Omega t)\,\mathbf{p}_0$$
$${\dot\rho\,\left(1 + \frac{\mathbf{u}\cdot\mathbf{v}_s}{c}\right) = \mathbf{u}\cdot(\mathbf{v}_s - \mathbf{v}_p)} + \delta\dot t_k$$

r is a satellite's position from the centre of attraction, p a receiver's, turned by the rotation R_z(Ωt) about the axis; u is the unit vector from receiver to satellite along the line of sight, v_s and v_p their velocities, the satellite's taken one light time earlier; δṫ_k is receiver k's clock rate at that epoch. The fit also carries the slant air delay's rate (one zenith delay per receiver, a flat layer), each satellite clock's offset and its relativistic drift −2 r·v/c².

*Figure caption:* The fit from its flat start: the speeds left unexplained (logarithmic, m/s) and the spread of the receivers' distances from the centre of the orbits, at each accepted iteration, before any point is rejected.

**The same points fitted from other starts. Δ is the difference with the main solution: GM and Ω in parts per billion, the largest displacement of any receiver in metres.**

| Start | rms (mm/s) | ΔGM (ppb) | ΔΩ (ppb) | Largest receiver shift |
| --- | --- | --- | --- | --- |
| receivers at their catalogue positions, GM and J₂ accepted | 2.6 | -27.0 | -0.0 | 0.01 m |
| every receiver on a 3,000 km ball, GM 25 % low | 2.6 | -8.6 | -0.0 | 0.00 m |
| every satellite 5 % too high, receivers on the flat map | 2.6 | -9.5 | 0.0 | 0.00 m |
| every satellite 5 % too high, receivers at their catalogue positions | 2.6 | -7.0 | -0.0 | 0.00 m |
| every receiver at a random place on the flat map | 42,078.3 | — | — | another minimum |
| the Moon 10 % farther (GM/d³ kept) | 2.6 | -980.9 | 13.5 | 3.57 m |

- 467,192 speedsGM 3.986016 × 10¹⁴ m³/s² (+2.8 ppm)Ω 7.292116 × 10⁻⁵ rad/s (+71 ppb)rms 2.6 mm/sbest plane: 131 m/s

**The result.** The speeds are reproduced to 2.6 mm/s rms over 467,192 points, out of a signal of hundreds of m/s. The Earth's GM comes out at 3.986016 × 10¹⁴ m³/s², +2.8 ppm from the value adopted by the IERS, 3.986004418 × 10¹⁴[8]; the rotation at Ω = 7.292116 × 10⁻⁵ rad/s, one turn in 23 h 56 min 4.09 s, +71 ppb from the IERS value 7.292115 × 10⁻⁵[8]. The formal uncertainties are ±542 parts per billion on GM and ±17 on Ω; they assume independent errors. GM departs from the adopted value by 5 of them and Ω by 4: more than the formal uncertainties allow, a measure of what one day and the truncated forces leave out (see Limits). The receivers end 29 m from the positions in their files (median), positions this fit never read.

## The receivers sit on a ball, flattened at the poles [evidence: measurement]

**Every receiver ends between 6,357.6 and 6,380.6 km from the point the satellites orbit.** The nearest are in Antarctica and the Arctic, the farthest near the equator and on the high plateaus of the Andes and of Ethiopia. Laid on an ellipse, the distances give an equatorial radius of 6,378.8 km and a flattening of 1/291[9]; what is left, 0.70 km rms, is mostly the receivers' heights above sea level. The best plane through the same receivers misses them by 3,417 km rms.

$${r(\varphi) \approx a\,(1 - f\,\sin^2\varphi)},\qquad f = \frac{a-b}{a}$$

r is a receiver's distance from the centre, φ its geocentric latitude (the angle at the centre, from the fitted position), a and b the equatorial and polar radii. Fitted on the 79 receivers: a = 6,378.8 km, 1/f = 291.

*Figure caption:* Each receiver's distance from the centre of the orbits against its latitude (dots), and the fitted ellipse (line). Excluded receivers in grey. The vertical axis starts at 6,350 km; the best plane through the receivers would put them thousands of kilometres off this axis.

$$J_2 = \frac{\mu_J}{GM\,a^2},\qquad q = \frac{\Omega^2 a^3}{GM}$$
$${f \approx \tfrac32 J_2 + \tfrac12 q}$$

μ_J is the oblateness term of the satellites' force, fitted with the rest (1.7473 × 10²⁵ m⁵/s²); J₂ = 1.0773 × 10⁻³ and q = 3.462 × 10⁻³, the ratio of the spin's push to gravity at the equator. Clairaut's relation for a fluid body in equilibrium[10] turns them into a flattening of 1/299: the same flattening seen a second way, in the satellites' motion rather than in the receivers' positions.

## Kepler's third law at three heights [evidence: measurement]

**Above, one GM was shared by every satellite: Kepler's third law was assumed.** Given its own GM, each satellite tests it: from its period and the size of its orbit, n²a³. GLONASS orbits at 25,507 km, GPS at 26,560 km, Galileo at 29,600 km, with periods from 11 h 16 min to 14 h 05 min. The 78 satellites give the same GM to 21 parts per million (standard deviation), and the three constellations' medians agree to 10.5 ppm. The Moon, 15 times farther out (Orbit tab), gives the same law.

*Figure caption:* **Three orbits, one GM, and how an orbit is checked.** Left, to scale: the Earth and the median orbits of GLONASS, GPS and Galileo found by the fit. Each satellite turns at the period its own constellation's GM gives, T = 2π√(a³/GM): the higher orbit is the slower, and n²a³ comes out the same for the three. Right, validating an orbit: from the fitted orbit of GPS satellite G32 and the receiver's place, the speed of the satellite toward Wettzell is computed for every five minutes of the day (blue line, drawn in advance); the measured speeds arrive as the day goes by (dots). Below, their difference in millimetres per second, against speeds of several hundred metres per second: an orbit is accepted when it predicts the next measurements this closely, at every receiver that sees the satellite. One day is played in 24 seconds. Click to pause.

$${GM_j = n_j^2\,a_j^3},\qquad n_j = \frac{2\pi}{T_j}$$

n_j is satellite j's mean motion, T_j its period and a_j its semi-major axis, all fitted to its own Doppler; the J₂ and Sun–Moon terms are kept in the motion, so GM_j is the point mass that each orbit needs.

*Figure caption:* GM from each satellite's own orbit, against its semi-major axis: GLONASS, GPS and Galileo. The vertical axis is in parts per million around the shared solution. A failure of the third law would tilt the three groups or separate them.

## The flat model, steel-manned

**The same points, the same satellites, the same freedoms, and one constraint: every receiver on one plane.** The plane's tilt and height and each receiver's position on it are free; the satellites keep Newtonian orbits around a centre that the fit may put anywhere above or below the plane; GM, Ω, the clocks and the air are as free as on the globe. It is generous: a flat model has no orbits to offer, and is given these. The fit is started twice, from the plane that best fits the globe's receivers and from the classic disc, the receivers on an azimuthal map perpendicular to the axis, and the better result is kept.

> **The best plane leaves 131 m/s unexplained**, against 2.6 mm/s for the receivers left free: 50,000 times more. Half of its residuals exceed 69 m/s and one in a hundred 407 m/s; the plane it settles on is tilted 92° from the rotation axis. **What would vindicate the flat model:** receivers held on a plane fitting the Doppler as well as free ones, to a few millimetres per second; or satellites needing different GM for their periods.

*Figure caption:* One satellite over Wettzell through the day: the measured speeds (dots), the globe solution (blue) and the best flat solution (orange). The receiver's clock rate is taken out of the points as each model estimates it.

## Limits

**One day, 80 receivers, every five minutes.** 1 receiver (BRMG) and 1 satellite (E04) are left out because their residuals lie more than 3 standard deviations from the others', and 14,057 single points (2.5 %) for the same reason, the rule of this site. The forces are truncated: no higher terms of the Earth's field and no pressure of sunlight, which is why 2.6 mm/s remains instead of a millimetre. The Doppler cannot tell north from south, since the mirror image of the whole solution fits as well; the first receiver's longitude, an angle, only turns the drawing. The satellites' first guess is the broadcast orbit, made with a globe model; the restarts show it does not decide the answer: every satellite started 5 % too high still lands on the same solution when the receivers start from their catalogue positions, but not when they also start on the flat map, where the fit ends in another minimum, at 49 m/s. With every receiver dropped at a random place on the flat map, it also ends in another minimum, at 117 m/s: the fit needs the receivers' rough directions to find its way, and the solution it then finds is the one with by far the smallest residual. Changing the Moon's distance in kilometres by 10 %, with GM/d³ kept as its period gives it, moves GM by 0.8 ppm and the receivers by 3.5 m.

**See also**[Orbit](/ai/orb.md)[GPS](/ai/gps.md)[Rotation](/ai/rot.md)[Moon](/ai/moon.md)[Gravity](/ai/grav.md)

## Sources for this tab

1. [1] International GNSS Service, daily RINEX 3 observation files (30 s) of 80 stations for 2025-04-10 (day 100), and the merged broadcast navigation file BRDC00IGS, from the [BKG open archive](https://igs.bkg.bund.de/root_ftp/IGS/); G. Johnston, A. Riddell, G. Hausler, “The International GNSS Service”, in *Springer Handbook of Global Navigation Satellite Systems* (2017) 967–982. Decompressed with RNXCMP (Y. Hatanaka, *Bulletin of the GSI of Japan* 55 (2008) 21–30).
2. [2] IGS RINEX Working Group, [*RINEX: The Receiver Independent Exchange Format*, version 3.04](https://files.igs.org/pub/data/format/rinex304.pdf) (2018) — the carrier phase in cycles, growing with the range, and the Doppler counted positive for an approaching satellite.
3. [3] [IS-GPS-200, *Navstar GPS Space Segment / Navigation User Interfaces*](https://www.navcen.uscg.gov/gps-technical-references) — the L1 (1575.42 MHz) and L2 (1227.60 MHz) carriers, the dual-frequency ionospheric correction and the satellite clock's relativistic term (§20.3.3.3.3).
4. [4] European Union, [*Galileo Open Service Signal-In-Space Interface Control Document*](https://www.gsc-europa.eu/electronic-library/programme-reference-documents), issue 2.1 (2023) — the E1 (1575.42 MHz) and E5a (1176.45 MHz) carriers.
5. [5] *GLONASS Interface Control Document*, edition 5.1 (Russian Institute of Space Device Engineering, 2008) — the FDMA carriers 1602 + 0.5625 k MHz and 1246 + 0.4375 k MHz, k the satellite's channel (given in each RINEX header).
6. [6] O. Montenbruck, E. Gill, *Satellite Orbits: Models, Methods and Applications* (Springer, 2000), §3.2 (the J₂ term), §3.3 (the Sun's and Moon's pull and their low-precision positions) and §4.1 (Runge–Kutta integration).
7. [7] W. H. Guier, G. C. Weiffenbach, “Genesis of Satellite Navigation”, *Johns Hopkins APL Technical Digest* 19, no. 1 (1998) — Sputnik's Doppler in October 1957, the orbit from one pass, and Transit.
8. [8] G. Petit, B. Luzum (eds.), [*IERS Conventions (2010)*, IERS Technical Note 36](https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html), table 1.1 — GM⊕ = 3.986004418 × 10¹⁴ m³/s² and the nominal Ω = 7.292115 × 10⁻⁵ rad/s, used here only for comparison.
9. [9] National Imagery and Mapping Agency, *Department of Defense World Geodetic System 1984*, TR8350.2, 3rd ed. (2000) — a = 6,378.137 km, 1/f = 298.257223563 and J₂ = 1.08263 × 10⁻³ (from its C̄₂₀), used here only for comparison.
10. [10] W. A. Heiskanen, H. Moritz, *Physical Geodesy* (Freeman, 1967), chapter 2 — Clairaut's theorem to first order, f = (3/2) J₂ + q/2 for a body in hydrostatic equilibrium; the Earth's actual flattening, 1/298, is close to it.
