# The year in the light: aberration, light time and Doppler

> Tab "Orbit" of *Flat plane or Globe?*. Web page: /#tab-orb. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Earth's orbit · light, Doppler and the Sun's size*

These measurements separate a moving Earth from one at rest more than a globe from a plane, and the page says so where it matters. They give the size of the orbit, the astronomical unit, from angles, clocks and wavelengths. The flat model's Sun, a lamp circling a few thousand kilometres up, is tested against the Doppler data below with its height left free.

## Kepler and Newton: what an orbit is

**Kepler found three rules in Tycho Brahe's observations of the planets; Newton found the single force behind them.** The first two laws (1609, from the orbit of Mars): each planet moves on an ellipse with the Sun at one focus, and the line from the Sun to the planet sweeps out equal areas in equal times, so the planet goes fastest at perihelion and slowest at aphelion[7]. The third (1619): the square of the period is proportional to the cube of the orbit's size, with the same constant for every planet[8]. Kepler's sizes were relative ones, in units of the Earth's orbit, obtained from angles alone as Copernicus had done; no distance in kilometres entered.

*Figure caption:* **Kepler's laws, moving.** Left: a planet on an ellipse, the Sun at one focus, its period cut into twelve equal times; each leaves its sector, and the twelve sectors have the same area, long and thin far from the Sun, short and wide near it, where the planet goes fastest (its speed is printed as a multiple of 2πa/T, the speed on a circle of the same period). Right: two orbits around the same body, one four times wider than the other, drawn to scale between them: the inner one goes round eight times while the outer one goes round once, because T² ∝ a³ and 4³ = 8². The ellipse is far more eccentric than the Earth's (0.6 against 0.017). In the band below, the three laws with the values of the moment shown: ½r²θ̇ stays at 0.400 whether the planet is near or far. Click to pause.

$$r(\theta) = \frac{a\,(1-e^2)}{1+e\cos\theta},\qquad r_{\min} = a(1-e),\quad r_{\max} = a(1+e)$$
$${\frac{dA}{dt} = \tfrac12\,r^2\,\dot\theta = \frac{\pi a b}{T}},\qquad b = a\sqrt{1-e^2}$$

r is the distance from the Sun, θ the angle from perihelion, a the semi-major axis, e the eccentricity, b the semi-minor axis, A the area swept and T the period. At both ends of the ellipse the velocity is perpendicular to r, so equal areas give r_min v_max = r_max v_min: the Earth moves (1 + e)/(1 − e) = 3.4 % faster in early January than in early July, the same ratio as the Sun's width further down.

**Newton showed in 1687 that the three laws follow from one attraction**, toward the Sun, proportional to the two masses and weakening as the inverse square of the distance[9]. Any force aimed at one centre keeps the swept area constant (the second law: angular momentum is conserved); only the inverse square closes the path into a fixed ellipse (the first); and the third law's constant becomes 4π²/GM, where GM belongs to the attracting body alone. His own picture is a cannonball fired horizontally from a high mountain: the faster it leaves, the farther it lands; fast enough, the ground curves away beneath it as fast as it falls, and it never lands. Near the ground that speed is 7.91 km/s.

$$F = \frac{G\,M\,m}{r^2},\qquad \frac{v^2}{r} = \frac{GM}{r^2}\ \text{on a circle}$$
$${v^2 = GM\left(\frac{2}{r} - \frac{1}{a}\right)}$$

G is the constant of gravitation, M and m the two masses, r their distance, v the speed and a the semi-major axis. On a circle the pull per unit mass, GM/r², is exactly the acceleration v²/r that bends the path into the circle; the second line (vis-viva) holds anywhere on an ellipse. With the Earth's GM and r = 6,371 km, v = 7.91 km/s.

**How falling makes an orbit.** Everything near the ground falls 4.9 m in its first second, whatever its sideways speed. A ball thrown sideways at 7.9 km/s has covered 7.9 km in that second, and over 7.9 km the Earth's surface curves down by (7.9 km)²/2R = 4.9 m, the same drop this site uses for hidden heights and horizons. So the ball has fallen 4.9 m and the ground beneath it has fallen away by 4.9 m: it is as high as when it started, and the same is true the next second, and the next. It never stops falling, and it never comes closer to the ground. Slower, it falls faster than the ground curves and lands; faster, it climbs away on an ellipse. Without air, such a ground-skimming orbit takes 2πR/v = 84 minutes.

*Figure caption:* **Falling without ever landing.** Left: Newton's cannon on a mountain far too high to be to scale; four balls fired sideways, faster each time, under the pull GM/r² alone. The slower ones fall back (orange); at the right speed the ball falls all the way round and comes back to the mountain (blue): an orbit. Right, at true scale: the first 200 seconds of an orbit 30 km up. The dashed line is where the ball would go without gravity; the orange line is how far it has fallen below it, ½gt², which is exactly how far the Earth's surface (brown, radius 6,371 km) has curved down below the same line, (vt)²/2R: the ball stays at the same height. In the band below, the equations with the values of the moment shown: v²/r against GM/r² for the shot in flight, ½gt² against (vt)²/2R, and the period. Click to pause.

$$\tfrac12\,g\,t^2 = \frac{(v\,t)^2}{2R}\quad\Rightarrow\quad {v = \sqrt{g\,R}}$$
$$T = \frac{2\pi R}{v} = 2\pi\sqrt{\frac{R}{g}}$$

g = 9.81 m/s² is the fall of any body at the surface, t the time, v the sideways speed and R the Earth's radius. The left side is how far the ball has fallen, the right side how far the ground has curved away below a straight line in the same time; equal, the ball keeps its height. With R = 6,371 km, v = 7.91 km/s and T = 84 min. It is the circle of the vis-viva line above, with g = GM/R².

**The same cannon, shot by shot.** Put the cannon 400 km up, the height at which the International Space Station flies[13], and ask each time for a range on the ground: 0 m, 100 m, 100 km, 500 km, 1,000 km, 5,000 km, 15,000 km. Every shot is level; only the speed changes. The camera rides with the ball.

*Figure caption:* **Eight shots from 400 km, each harder than the last.** Main view: the camera follows the ball and keeps its vertical upright, so the ball stays in the middle and the ground comes up to meet it; the ground is graduated in distance from the foot of the cannon, the pale band is the first 100 km of air. Yellow: the path flown; dashes: the straight line the ball would follow without gravity; green arrow: its speed; red arrow: the pull, 8.7 m/s² at 400 km against 9.8 on the ground. Small frame: the whole Earth with every shot so far. Both views are at true scale. The path is computed under the pull GM/r² alone: no air (a real ball would be slowed below 100 km and land shorter) and no rotation of the Earth. The eighth shot, at the speed of a circle, falls all the way round without coming any closer. Click to pause.

$$p = \frac{(r_0 v)^2}{GM},\qquad e = 1 - \frac{r_0 v^2}{GM}$$
$$\cos\theta = \frac{1 - p/R}{e},\qquad s = R\,\theta$$
$${v_c = \sqrt{GM/r_0}}$$

r₀ = 6,771 km is the cannon's distance from the Earth's centre, R = 6,371 km the Earth's radius, v the launch speed and GM = 3.985 × 10¹⁴ m³/s² the pull this page reads from the orbit of the GPS satellites[11]. Fired level and too slowly to stay up, the ball starts from the farthest point of an ellipse (p and e fix its size and shape[12]); it meets the ground at the angle θ from the cannon, seen from the Earth's centre, and s is the range. The range grows with v up to half a turn; past 7,554 m/s the ellipse no longer reaches the ground, and at v_c = 7,672 m/s it is a circle.

| Range on the globe | Launch speed | Flight | Speed at impact | Same shot over a plane, uniform g |
| --- | --- | --- | --- | --- |
| 0 m | 0.00 m/s | 5 min 00 s | 2.72 km/s | lands at 0 m |
| 100 m | 0.34 m/s | 5 min 00 s | 2.72 km/s | lands at 97 m |
| 100 km | 339 m/s | 5 min 01 s | 2.74 km/s | lands at 97 km |
| 500 km | 1,659 m/s | 5 min 08 s | 3.18 km/s | lands at 473 km |
| 1,000 km | 3,104 m/s | 5 min 29 s | 4.13 km/s | lands at 886 km |
| 5,000 km | 6,961 m/s | 12 min 13 s | 7.47 km/s | lands at 1,987 km |
| 15,000 km | 7,534 m/s | 33 min 33 s | 8.01 km/s | lands at 2,151 km |
| first shot that misses the ground (grazes it half a turn away) | 7,554 m/s | — | — | lands at 2,156 km |
| **circular orbit: never lands** | 7,672 m/s | 92.4 min a turn | — | lands at 2,190 km |

*Figure caption:* The first 100 km of range cost almost nothing: the ball falls for five minutes whatever is done, so 0.34 m/s, a slow walk, is enough for 100 m. The last steps cost almost nothing either: from 15,000 km to never landing there are 137 m/s. Computed for the circle at 400 km: 27600 km/h and 92.4 minutes a turn. The space agency gives 92 minutes and a round 28,800 km/h for the station[13]. Last column: over a plane with the same pull everywhere there is no such speed. The ball lands after 4 min 45 s whatever the shot, only farther away; nothing fired level stays up. What would count for the flat model: a satellite whose period does not follow from its height by these formulas.

**The same 84 minutes through a tunnel.** Drop a ball into a hole bored straight through a uniform Earth, with no air. Inside, only the matter closer to the centre than the ball pulls it, so gravity weakens in a straight line, g r/R, like a spring: the ball swings from one side to the other and back in 2π√(R/g), the period above, and crosses the centre at √(gR), the orbital speed. A second ball in a tunnel at right angles, a quarter of a swing behind, swings the same way. Take the point that follows one ball left–right and the other up–down: it goes round a circle just above the ground, at constant speed, pulled towards the centre by g. That point is a satellite skimming the Earth, and each ball is its shadow on one axis.

*[Figure: Animation: a ball swings through a tunnel across the Earth, a second one in a perpendicular tunnel a quarter of a swing behind; together they trace a circular orbit just above the ground, with the same 84-minute period]*

*Figure caption:* **An orbit made of two falls.** One ball through a tunnel, its position, speed and pull; a second ball at right angles; both together; the satellite that results; and the two clocks side by side. Schematic, balls enlarged. The two balls can be added because inside a uniform Earth the pull is proportional to the distance from the centre; outside the Earth it falls off as 1/r², and an orbit, still an ellipse, is no longer exactly the sum of two waves. The real Earth, denser at its core, would take about 38 minutes for one crossing instead of 42. Click to pause.

$${T^2 = \frac{4\pi^2}{GM}\,a^3}$$
$$GM_\odot = \frac{4\pi^2\,(1\ \text{AU})^3}{(1\ \text{yr})^2},\qquad GM_\oplus = \frac{4\pi^2 a_{\text{Moon}}^3}{T_{\text{Moon}}^2}\,\frac{1}{1+m/M}$$

In units of the Earth's orbit and the year, T² = a³ for every planet. In kilometres it needs the astronomical unit, which this tab measures below: with a = 149.6 million km, GM☉ = 1.327 × 10²⁰ m³/s². Around the Earth the same law holds with a constant 333,000 times smaller: the Moon (384,400 km, 27.32 days, its own mass m/M = 1/81 removed) gives GM⊕ = 3.975 × 10¹⁴ m³/s², the GPS satellites (26,560 km, 11 h 58 min) 3.985 × 10¹⁴.

*Figure caption:* Kepler's third law on logarithmic axes. The eight planets (period against semi-major axis) lie on one line of slope 3/2, T ∝ a^3/2, Uranus and Neptune included although Kepler never knew them. T²/a³ is the same to 1.2 %; Saturn and Neptune depart most, because the giant planets perturb one another and one set of elements does not give their mean orbit exactly. the Moon and the GPS satellites lie on a parallel line far below, because the Earth's GM is 333,000 times smaller than the Sun's. Planets and Moon from NASA's fact sheets[10], GPS from ESA[11].

**What the rest of this tab measures with these laws.** The first: the Sun's apparent size through the year gives the eccentricity e of the ellipse. The first two together: the distance to the Sun changes along the ellipse, at a rate that peaks at K = 2πae/(T√(1−e²)), the yearly swing of the Sun's Doppler shift; and the changing speed puts 7.7 minutes into the equation of time (the stick section). The third is not needed by any of them: light time, aberration and Doppler give the astronomical unit with the year alone. What it adds is mass: the size of an orbit and its period give GM of the body it goes around, the Sun's here, the Earth's in the Moon and Satellites tabs.

> **The flat model's Sun.** A Sun circling a few thousand kilometres above the disc, its circuit widening from the Tropic of Cancer to the Tropic of Capricorn and back each year, has no force named to hold it on that path, so its speed and its height are whatever the year requires: Kepler's laws are not wrong for it, they are absent from it. Gravitation is tested where it predicts with nothing left to adjust: everything circling the Earth must give one and the same GM, whatever its distance and its period. **What would vindicate the flat model here:** bodies circling the Earth whose periods do not follow T² ∝ a³ with a single constant.

## Aberration and light time: the orbit from an angle and a clock [evidence: measurement]

**Bradley was looking for parallax and found something else.** γ Draconis, observed at the zenith of Kew in 1725–1728, moved through an annual cycle about 40″ wide, a quarter of a year out of step with what parallax would give: the direction of starlight tilts with the observer's velocity, as rain tilts for a runner. The half-width κ is the ratio v/c. From it Bradley gave the light time from the Sun: 8 min 12 s[1]. Delambre reached the same 8 min 12 s in 1809 from the eclipses of Jupiter's moons, which come early when the Earth is on Jupiter's side of its orbit and late when it is on the far side[2]. Rømer's 1676 figure, about 22 minutes across the orbit, was a third too large.

*Figure caption:* **Aberration: the telescope detects the Earth's speed.** Top left: the Earth on its orbit through one year, with its velocity v. Top right: the view in the telescope, in the same orientation. The orange cross is where γ Draconis would sit if the Earth were at rest; the blue dot is where it is seen, always displaced toward the direction the Earth is moving, by κ = v/c, so that in a year it traces a near-circle of radius 20.2″. Dotted: its parallax, enlarged five hundred times; it points away from the Sun, a quarter of a year out of step with the aberration, which is how Bradley could tell the two apart. Below: why. Seen from the side, the starlight falls straight down while the telescope moves at v. A tube pointed straight at the star moves under the light, which hits its trailing wall (red dots); a tube tilted forward by κ keeps the light on its axis down to the eyepiece, as an umbrella is tilted forward when running in the rain. So the star is seen tilted toward v. In the tubes v/c is enlarged about three thousand times; offsets in the eyepiece to the 10″ bar; the orbit is not to scale. Click to pause.

$$\tan\kappa = \frac{v}{c},\qquad a = \frac{v\,T}{2\pi}$$
$${a = c\,t_\odot},\qquad t_\odot = \frac{\kappa\,T}{2\pi}$$

κ is half the annual swing of a star (radians), v the Earth's orbital speed, T the year, a the radius of the orbit and t☉ the light time from the Sun. Bradley's 8 min 12 s gives κ = 20.2″ and a = 147.5 million km; the modern value is 149.6. Nothing in this enters a radius of the Earth or a map.

> **What this does and does not separate.** A yearly swing common to every star in the same direction is the signature of the observer moving, not of the stars. An Earth at rest under stars that all swing yearly in step reproduces the angles exactly (Tycho's system is kinematically the same); only the dynamics, why the stars would do that, chooses. A flat model with a fixed sky predicts no swing at all. **What would vindicate it:** a zenith star that stays put through the year to better than a second of arc.

## Transits of Venus, 1761, 1769 and 2012: the Sun's distance from where you stand [evidence: check — Where the radius enters: the baseline between the stations is in Earth radii, so the distance comes out in Earth radii and is turned into kilometres with that radius; the orbits' shape comes from an ephemeris.]

**Three times since 1761 Venus has crossed the face of the Sun with observers spread over the Earth to time the moments when its edge touched the Sun's.** Halley had shown in 1716 how to use them: two observers far apart see Venus against the Sun along different lines, so the same contact happens for them minutes apart, by an amount set by the size of the Earth against the distance of the Sun[23]. In 1761 and 1769 Cook and Green observed at Tahiti, Hell at Vardø, Chappe in Siberia and then in Baja California, Mason and Dixon at the Cape, and dozens of others; in 1891 Newcomb gathered every one of their timings, 229 for 1761 and 278 for 1769, with the positions of their stations[22]. In 2012 amateurs sent their timings to an open project; only the file of the third contact survives, 22 timings[24]. We transcribed them all and computed each contact again for each station, for a trial distance of the Sun.

*Figure caption:* **Nine contacts, one after the other: the four of 1761, the four of 1769, the third of 2012.** Left: the Earth as the Sun saw it at that moment, and the stations that timed the contact, blue where the Earth's size makes it come earlier, red where later. Right: for every timing, the observed time minus the time it would have had with the Sun infinitely far (vertical), against the shift that the Earth's size gives with the Sun at 149.6 million km (horizontal), the shifts computed from the orbits[15] and the stations' places[22]. The timings follow a line of slope close to 1; the dashed line is what a Sun 5,000 km away would demand. Click to pause.

$$t_{\text{obs}} = t_\infty + P\,\frac{A_{\text{DE}}}{A} + \delta_k$$
$${\pi_\odot = \frac{a_\oplus}{A}}$$

t∞ is the instant of the contact for an observer at the Earth's centre, P the shift the station's place on the Earth gives it when the Sun is at A_DE = 149.6 million km (proportional to the Earth's radius over the Sun's distance), A the distance sought and δ_k one offset per contact, which takes up the black drop, the definition of the Sun's edge and the observers' habits. The fit gives A, or the solar parallax π☉, the angle the Earth's equatorial radius a⊕ subtends from the Sun.

**The 1769 timings give 149.57 million km** (± 1.9, from re-drawing the stations at random), a solar parallax of 8.796″. Those of 1761 give 152.98 ± 3.9 million km, farther off and less sure, as the observers of the time found: fewer stations far apart, longitudes worse known. The amateurs of 2012 give 158.83 ± 2.5 million km from one contact alone, the very value the project drew from it (158.5)[24], 6 % too much: with a single contact, a small bias between the European and the Pacific timings goes straight into the distance. The three together: 151.01 ± 1.8 million km. In 2004, ESO gathered 4,367 timings and published 149.61 ± 0.01 million km[25]; those timings are no longer online, so that value is quoted, not recomputed. Left out of the fits: the observations of the "G" phase at the inner contacts (an earlier appearance than the thread of light, which Newcomb kept apart), and those more than three standard deviations from the fit of the others.

*Figure caption:* The astronomical unit from each transit, with the error of re-drawing its stations at random: 1761, 1769 and 2012 reduced here from the observers' timings, 2004 as ESO published it (hollow: its timings are no longer online), and the three reduced here together. The vertical line is today's value.

> **The flat model's best case.** A Sun and a Venus a few thousand kilometres up could be placed so that a transit happens; but then the observers' lines of sight would differ by tens of degrees, not by seconds of arc: a contact would come hours apart, or not at all, from one continent to the next, and in the diagram the timings would have to lie on a line some 30,000 times steeper. **What would vindicate the flat model here:** contact times that do not depend on where on the Earth they were taken, or that depend on it far more than a Sun at 150 million km allows.

**Limits.** This section is a check: the baseline between the stations is in units of the Earth's radius, so a transit measures the Sun's distance in Earth radii (23,450 of them in 1769), and its value in kilometres uses that radius. The orbits come from a modern ephemeris, used for their shape alone. The clocks of 1761 and 1769 were set by the stations' own longitudes, often uncertain by seconds; the black drop blurred the inner contacts by tens of seconds: hence a result to a percent and not better. Seven printed residuals of 1761 disagree with Newcomb's own times (Madras, Tornea, Stockholm at the last contact); his times are used. The 2012 file gives no heights, and one line has its latitude and longitude swapped; nothing was corrected.

## Radar echoes from Venus: the astronomical unit by a clock, 1961 [evidence: check — Where the radius enters: the antenna's place on the Earth, on the ellipsoid, moves each distance by up to 5,800 km, and today's orbits rest in part on the radar ranging of later decades.]

**In the spring of 1961 several radars sent pulses to Venus and timed the echoes.** At Millstone Hill, Massachusetts, MIT's Lincoln Laboratory transmitted for as long as the round trip would last, then listened: the echo came back after 283 to 449 seconds, four and three-quarter minutes at the closest approach on 10 April, seven and a half by mid-May[14]. In half the shortest of those times light covers 42.43 million km. The orbits give the Earth–Venus distance in astronomical units, from centuries of angles and Kepler's third law; the echo gives it in kilometres; their ratio is the astronomical unit.

*Figure caption:* **Twenty-five echoes, one after the other.** Left: the orbits of the Earth and Venus seen from the north, to scale, from 6 March to 18 May 1961; the pulse leaves the Earth, reaches Venus and comes back, and its flight time is the one the Millstone team printed, to a ten-thousandth of a second[14]. Right: the astronomical unit each echo gives. Grey rings: as printed in 1962, reduced with Newcomb's orbits; they drift by some 2,000 km over the two months. Blue dots: the same flight times reduced by us with today's orbits (JPL DE440[15]), with the team's printed error bars; they lie along today's value. The drawn positions of Venus come from approximate orbital elements[16]; every number written comes from the 1962 table. Click to pause.

$$c\,\tau = |V - S_1| + |V - S_2| - 2R_V$$
$${A = \frac{c\,\tau/2 + R_V}{d_{\text{AU}}}}$$
$$\sin\varepsilon = \frac{r_V}{r_E},\qquad d_{\text{conj}} = (1 - \sin\varepsilon)\,A$$

τ is the flight time, V the centre of Venus at the instant of reflection, S₁ and S₂ the antenna when the pulse left and when it came back, R_V the radius of Venus, d_AU the Earth–Venus distance in astronomical units given by the orbits and A the unit in kilometres (the first line, solved for A, is the second when the antenna sits at the Earth's centre). With one angle instead of the orbits: Venus never strays more than about ε = 46.3° from the Sun, so the two orbits are in the ratio sin ε = 0.723, the ratio of NASA's semi-major axes, 108.2 and 149.6 million km[10]. At conjunction, τ = 283.0845 s then gives A ≈ 153.2 million km, 2.4 % too much, because the orbits are not quite circles. With the full orbits, each echo is solved for A.

**The 1961 echoes, reduced with today's orbits, give 149,597,863 km** (median of the 25; weighted mean 149,597,927 ± 26 km, scatter 193 km about it, within the team's own error bars). The value adopted today, 149,597,870.7 km[17], is 8 km away. In 1962 the team found that their values drifted with the date, by 2,200 km from March to May with Newcomb's orbits and still by some hundreds with Duncombe's corrections, and wrote that perfectly known orbits should yield a horizontal straight line[14]: with today's orbits the line is horizontal to 193 km. Their published value, 149,597,850 ± 400 km, and those of the other four radars of 1961 (table below) all lie within 0.003 % of today's.

### The 25 echoes of the 1962 table, and the five radars of 1961

**Millstone, 1961: flight times and the astronomical unit (km)**

| Date, UT | flight time (s) | Newcomb, 1962 | DE440, ours | ± |
| --- | --- | --- | --- | --- |
| 1961-03-06 21:34 | 425.2230 | 149,597,037 | 149,597,903 | 280 |
| 1961-03-07 18:47 | 419.4121 | 149,596,713 | 149,597,583 | 285 |
| 1961-03-14 16:25 | 376.3695 | 149,597,283 | 149,598,088 | 320 |
| 1961-03-16 17:40 | 364.4973 | 149,597,488 | 149,598,221 | 330 |
| 1961-03-22 18:12 | 332.9159 | 149,597,148 | 149,597,879 | 225 |
| 1961-03-23 21:00 | 327.6940 | 149,596,963 | 149,597,691 | 230 |
| 1961-03-24 00:33 | 327.0435 | 149,597,283 | 149,598,025 | 230 |
| 1961-03-27 19:24 | 311.1564 | 149,596,850 | 149,597,481 | 240 |
| 1961-03-31 19:37 | 297.7762 | 149,597,333 | 149,597,719 | 250 |
| 1961-04-03 19:43 | 290.3877 | 149,597,386 | 149,597,649 | 260 |
| 1961-04-03 21:30 | 290.2464 | 149,597,438 | 149,597,691 | 260 |
| 1961-04-05 23:39 | 286.6264 | 149,597,440 | 149,597,601 | 260 |
| 1961-04-08 18:16 | 283.7176 | 149,597,918 | 149,597,863 | 100 |
| 1961-04-10 21:24 | 283.0845 | 149,598,128 | 149,597,938 | 100 |
| 1961-04-12 17:29 | 283.5996 | 149,598,393 | 149,598,050 | 100 |
| 1961-04-12 22:03 | 283.7396 | 149,598,503 | 149,598,156 | 100 |
| 1961-04-18 20:17 | 292.5937 | 149,598,513 | 149,597,984 | 100 |
| 1961-04-20 18:03 | 297.5433 | 149,598,443 | 149,597,859 | 100 |
| 1961-04-21 17:07 | 300.4085 | 149,598,478 | 149,597,871 | 100 |
| 1961-04-24 19:08 | 311.1873 | 149,598,483 | 149,597,859 | 100 |
| 1961-04-26 17:32 | 319.0662 | 149,598,548 | 149,597,858 | 90 |
| 1961-04-28 17:32 | 328.0724 | 149,598,603 | 149,597,860 | 90 |
| 1961-05-03 14:17 | 353.1356 | 149,598,683 | 149,597,861 | 125 |
| 1961-05-16 14:21 | 436.1257 | 149,598,863 | 149,598,087 | 100 |
| 1961-05-18 09:45 | 448.9659 | 149,598,883 | 149,598,085 | 100 |

**The 1961 radar determinations (Table III of the 1962 article)**

| Radar | MHz | astronomical unit (km) |
| --- | --- | --- |
| Millstone (MIT) | 440 | 149,597,850 ± 400 |
| Goldstone (JPL) | 2388 | 149,598,500 ± 500 |
| Jodrell Bank (U. of Man.) | 408 | 149,601,000 ± 5,000 |
| Moorestown (RCA) | – | 149,596,000 |
| U.S.S.R. | 700 | 149,599,500 ± 800 |

> **The flat model's best case.** The radar measures the distance to Venus and nothing else, and a flat model may put Venus wherever it likes. Near a Sun a few thousand kilometres up, at H = 5,000 km, the echo would come back after 2H/c = 0.033 s; Millstone waited 283 to 449 s, which puts Venus 42 to 67 million km away whatever the shape of the ground. Then the Sun: in those weeks Venus was a thin crescent, its Sun–Venus–Earth angle reaching 170°, lit from behind, so the Sun lay beyond it, farther than 42 million km. **What would vindicate the flat model here:** echoes from Venus coming back in a fraction of a second, or flight times that no single astronomical unit fits from March to May.

**Limits.** This section is a check. The flight times are a clock, but turning them into a distance from the Earth's centre needs the antenna's place on the Earth, up to 5,800 km along the line of sight, computed on the ellipsoid; and today's orbits rest in part on the radar ranging of the decades that followed, these echoes among the first. The team's own reduction, with Newcomb's orbits built from angles alone, is shown beside ours. The early March echoes carry timing errors of up to 500 µs, as the team says, and their 1958 result, announced in 1959, was found to be wrong by these 1961 echoes, with no cause found[14].

## Pulsars: the orbit timed by clocks in the sky [evidence: check — Where the radius enters: the timing model places each telescope by its coordinates on the Earth, and takes the shape of the Earth's orbit from an ephemeris whose scale rests partly on radar ranging.]

**A millisecond pulsar is a clock that keeps time to a fraction of a microsecond over decades.** Two networks of radio telescopes time dozens of them: the European Pulsar Timing Array[18] and the North American NANOGrav[21], 183,903 pulse arrival times for the 12 pulsars used here, over up to 24 years. Through each year the pulses come early when the Earth is on the pulsar's side of its orbit and late when it is on the other side, by up to (A/c)·cos β, where A is the radius of the orbit and β the pulsar's latitude above the plane of the orbit: 499.0 s for a pulsar in that plane[20]. It is Rømer's method, with Jupiter's moon replaced by a clock steady to the microsecond.

*Figure caption:* **The same pulses, early or late with the Earth's place.** Left: the Earth's orbit seen from the north, to scale, and the wave fronts of one pulsar arriving from its direction; the purple segment is the Earth's distance along that direction, which light takes (A/c)·cos β·cos(λ⊕ − λ) seconds to cover. Right: that delay through one year for the twelve pulsars, the one shown on the left in bold. Each year shown is a different pulsar; their directions are the timing positions[18]. Click to pause.

$$\Delta t = -\frac{A}{c}\,r\cos\beta\,\cos(\lambda_\oplus - \lambda)$$
$${A = A_{\text{DE}}\,\frac{\cos\beta_{\text{timing}}}{\cos\beta_{\text{VLBI}}}}$$

Δt is the arrival time minus that of a steady clock, r the Earth's distance from the Sun in astronomical units and λ⊕ its longitude, λ and β the pulsar's ecliptic longitude and latitude, A the unit in kilometres. The delay fixes only the product A·cos β: a timing fit that takes the Earth's orbit from an ephemeris with the unit A_DE puts the pulsar at the latitude β_timing for which A_DE·cos β_timing is the true A·cos β. An independent latitude separates the two.

**The latitude from quasars.** Antennas spread across a continent, linked as one telescope, measured the direction of eighteen of these pulsars against quasars billions of light years away: an angle, with no orbit and no delay in it[19]. Twelve are timed by one array or both, 20 timing models in all. Carried to the timing epoch with their own measured proper motions, the two positions agree to 1.0 milliarcseconds in latitude (median). Had the unit been 1,000 km larger than the one the timing assumed, the timing latitudes would sit at least 1.4″ away from the interferometric ones.

*Figure caption:* The astronomical unit from each pulsar, A_DE·cos β_timing/cos β_VLBI, with the error that the two positions carry. Blue: EPTA, green: NANOGrav. The two pulsars near the plane of the orbit (β ≈ 1° and 0.2°) have errors of a few metres: there cos β is 1 whatever the latitude, and the timing amplitude is the unit itself. J0610−2100's bar runs off the left edge (± 11 km).

**Twelve pulsars, 20 timing models, give 149,597,870.7 km** (median), from 149,597,860.9 to 149,597,871.3 km, the farthest, J0610−2100, 10 km off with an error of 11 km (its quasar reference is poorly placed). Two clocks, one in the sky and one at the telescope, and an angle measured against quasars agree on the radius of the Earth's orbit to a few parts in a billion, and two independent arrays agree with each other pulsar by pulsar.

> **The flat model's best case.** On a fixed Earth the pulses would arrive like the ticks of a steady clock, with no yearly delay; a flat model can keep a moving Earth out only by letting every pulsar swing back and forth in the sky once a year, each in step with its own ecliptic longitude, by an amount that falls as cos β, and all in exactly the same proportion: the motion of an observer, attributed to the sources. **What would vindicate the flat model here:** pulsars with no annual delay, or delays whose sizes do not follow cos β, or timing and interferometric latitudes that disagree in the same sense for every pulsar.

**Limits.** This section is a check: the timing models place each telescope by its coordinates on the Earth (a daily delay of up to 21 ms) and take the shape of the Earth's orbit from an ephemeris, whose scale owes much to radar ranging. The interferometric positions' absolute errors are, in their authors' words, only indicative. For J1730−2304 the EPTA latitude differs from the interferometric one by 32 mas, eight times the stated errors, and NANOGrav's by 4 mas: the gap lies in one timing solution, not in the interferometry; it does not change the unit, the pulsar lying 0.2° from the plane of the orbit.

## The Sun's size over the year [evidence: check — Where the radius enters: the apparent radius is computed by the SDO pipeline from the spacecraft–Sun distance, an ephemeris.]

**The Sun is 3.4 % wider in early January than in early July.** SDO's apparent radius, every seven days of 2023, runs from 944.0″ to 976.1″[4]. The ratio gives the eccentricity of the distance, e = 0.0167. It is computed by the spacecraft's pipeline from an ephemeris, so this is a check; a camera with a fixed lens and a solar filter measures the same ratio in pixels in January and July, and that would be a measurement.

*Figure caption:* **The Sun's size detects the changing distance.** Left: the orbit to scale, eccentricity 0.017, the Earth placed by the ephemeris, its distance to the Sun in astronomical units. Right: the Sun's disc at the radius SDO measured that week, between the largest (solid ring, early January) and smallest (dotted ring, early July) of 2023; below, the year of SDO measurements with the cursor. Click to pause.

$$\frac{r_{\max}}{r_{\min}} = \frac{\theta_{\max}}{\theta_{\min}} = \frac{1+e}{1-e}\;\Rightarrow\; {e = \frac{\theta_{\max}-\theta_{\min}}{\theta_{\max}+\theta_{\min}}}$$

θ is the apparent radius, inversely proportional to the distance r. The Sun is widest in early January (perihelion) and narrowest in early July.

*Figure caption:* The Sun's apparent radius through 2023 (SDO). A lamp circling above a plane would change size within each day by a large factor between noon and sunset; the real Sun changes by 3.4 % over a year and not measurably within a day.

## The Sun's Doppler shift: rotation in a day, orbit in a year [evidence: check — Where the radius enters: the observed velocity is rebuilt by adding back a barycentric correction computed from ephemerides, and the Sun's declination comes from one.]

**Since 2015 a small telescope on La Palma has fed the whole Sun into the HARPS-N spectrograph every five minutes of every clear day.** The release gives the Sun's velocity in the solar system's frame and the correction that was subtracted to get there; adding it back gives what the spectrograph actually saw[3]. In the morning the Sun approaches, in the afternoon it recedes, by 411 m/s at most: the speed of La Palma around the Earth's axis, projected toward the Sun. Over the year the daily mean swings by ±494 m/s: the Earth closing in on the Sun toward January and moving away toward July.

*Figure caption:* **The Sun's Doppler shift detects the ground's motion through the day.** Left: the Earth seen from above the North Pole, La Palma carried around on its parallel, the Sun far to the right. Blue arrow: La Palma's velocity; thick arrow: its part along the line to the Sun, toward the Sun in the morning, away in the afternoon. Right: the same day of HARPS-N measurements, the globe's curve with no free shape and the best flat lamp, with the cursor at the time shown. Click to pause.

$$v(t) = v_0 + \Omega R\cos\varphi\cos\delta\,\sin H(t)$$
$${R = \frac{|A|}{\Omega\cos\varphi\cos\delta}},\qquad a = \frac{K\,T\sqrt{1-e^2}}{2\pi e}$$

A is the fitted daily amplitude, H the Sun's hour angle, φ = 28.75° the latitude, δ the Sun's declination (from an ephemeris: a check), Ω the rotation measured in the Rotation tab. K is the yearly amplitude of the daily mean v₀; with e from the Sun's size it gives the orbit's semi-major axis a.

- 462 daysrotation → R = 6,362 km (quartiles 6,351–6,371)year → a = 148.6 million kmbest lamp: 27.4 m/s off

*Figure caption:* One day of HARPS-N (dots), the globe's curve with no free shape (blue, R = 6,371 km, the Sun's position from an ephemeris) and the best flat lamp (orange, its height fitted over all days). Each model gets one free constant per day.

*Figure caption:* The daily mean velocity over three years: the Earth approaches the Sun from July to January and recedes from January to July. The amplitude K, with the eccentricity from the Sun's size, gives the astronomical unit.

> **The flat lamp, at its best.** Its free parameter is its height. Over the 462 days the best height is 9,666 km, and it leaves residuals of 27.4 m/s. The globe, with no free shape at all (R = 6,371 km, the Sun where the ephemeris puts it), leaves 1.05 m/s. **What would vindicate the lamp:** residuals at the level of the instrument, about 1 m/s, for some height.

**Limits.** The velocity is rebuilt by adding back a correction computed from ephemerides, the declination comes from one, and the Earth's radius enters both: this section is a check. The radius scatters by ±10 km from day to day around its median, 6,362 km, which is the station's distance from the axis divided by cos φ. Over a few hours around noon the yearly drift, up to 8.5 m/s a day, looks like the daily term: it is estimated over the year first and removed from each day. The Moon's pull on the Earth, 12.5 m/s over 27 days, is not removed.

## A star's Doppler shift: τ Ceti over sixteen years [evidence: check — Where the radius enters: the observed velocity is rebuilt by adding back the barycentric correction, computed from ephemerides.]

**τ Ceti barely moves; the observer does.** HARPS at La Silla observed it on 561 nights between 2003 and 2019[5]. Its observed velocity swings by ±27.24 km/s with a period of one year. τ Ceti lies 24.8° from the ecliptic, so the Earth's full orbital speed is 30.01 km/s and the orbit's radius 150.7 million km.

*Figure caption:* **A star's Doppler shift detects the Earth's orbital speed.** Left: the Earth through a year, its velocity (thin arrow) and the part of it directed at τ Ceti (thick arrow). Right: the HARPS nights folded on one year, the curve computed from the Earth's orbit alone, with only the star's own mean velocity adjusted, and the cursor at the date shown. Click to pause.

$$v_{\text{obs}}(t) = \gamma + K\sin(2\pi t/T + \varphi_0),\qquad {v = \frac{K}{\cos\beta}},\quad a = \frac{vT}{2\pi}$$

γ is the star's own velocity, K the annual amplitude, β the star's ecliptic latitude (from its catalogue position) and T the sidereal year.

*Figure caption:* τ Ceti's observed velocity folded on one year (dots) and the fitted sinusoid. The star's own velocity, −16.5 km/s, is the mean; the swing is the observer.

## Parallax: the orbit as a baseline [evidence: measurement]

**In 1838 Bessel measured 61 Cygni shifting back and forth by 0.314″ against fainter stars over a year**[6]: the near star seen from opposite sides of the orbit. Read as a triangle whose base is the orbit, it puts 61 Cygni 656,894 astronomical units away. Like aberration, it shows the observer moving each year; unlike aberration, its size depends on each star's distance.

*Figure caption:* **Parallax detects the Earth's change of place.** Left: the Earth through 1838 and its line of sight to 61 Cygni, drawn far too close. Right: 61 Cygni against fainter, more distant stars, tracing a small ellipse of half-width 0.314″ (Bessel's value), always on the side opposite the Earth's position. The whole field also swings by about 20″ through aberration, and 61 Cygni drifts 5.2″ a year on its own; both are removed here, as Bessel removed them. Shifts to the 0.2″ bar. Click to pause.

$${d = \frac{a}{\tan p}}$$

p is the parallax (half the annual shift), a the radius of the orbit and d the star's distance.

## A stick in the ground: the tilt and the eccentricity from noon shadows [evidence: prediction]

**A vertical stick, a level and a clock give the obliquity and the eccentricity without any other instrument.** At the solstices the noon Sun stands highest and lowest; half the difference of the two noon altitudes is the tilt of the axis, ε, and their mean gives the latitude. Through the year the clock time of the shortest shadow wanders by up to a quarter of an hour around noon, the equation of time: about 7.7 minutes of it come from the eccentricity and 9.9 from the tilt, with different periods, so a year of noon timings separates them.

$$\tan h = \frac{L}{s},\qquad \varepsilon = \frac{h_{\text{June}} - h_{\text{Dec}}}{2},\qquad \varphi = 90^\circ - \frac{h_{\text{June}} + h_{\text{Dec}}}{2}$$
$${E(t) \approx 2e\,\sin M - \tan^2(\varepsilon/2)\,\sin 2\lambda}$$

L is the stick's height and s the noon shadow's length, h the Sun's noon altitude; E is the equation of time in radians of rotation (× 229.2 for minutes), M the Sun's mean anomaly and λ its longitude. The first term has a period of a year and gives e, the second half a year and gives ε.

[**Experiment · the noon shadow** — to do yourself, with every experiment of the site, in “What would refute each model” →](/ai/falsify.md#xp-orb-gno)

**See also**[Sun](/ai/sun.md)[Rotation](/ai/rot.md)[Satellites](/ai/sat.md)[Star trails](/ai/star.md)[Azimuth](/ai/azim.md)

## Sources for this tab

1. [1] J. Bradley, “A letter … giving an account of a new discovered motion of the fix'd stars”, *Philosophical Transactions* 35 (1728) 637–661; his light time of 8 min 12 s from the Sun is quoted in [James Bradley](https://en.wikipedia.org/wiki/James_Bradley) (Wikipedia).
2. [2] [Rømer's determination of the speed of light](https://en.wikipedia.org/wiki/R%C3%B8mer%27s_determination_of_the_speed_of_light) (Wikipedia) — Rømer's and Huygens' “about 22 minutes” across the orbit's diameter, and Delambre's 1809 value from Jupiter's satellites, 8 min 12 s from the Sun to the Earth.
3. [3] X. Dumusque et al., “Three years of HARPS-N high-resolution spectroscopy and precise radial velocity data for the Sun”, *A&A* 648 (2021) A103; the time series (34 550 spectra, 2015–2018) from [DACE](https://dace.unige.ch/), University of Geneva: `rv_raw` (barycentric) and `berv`, the correction it subtracted. The observed velocity is rebuilt as rv_raw − berv.
4. [4] [JSOC, Stanford](http://jsoc.stanford.edu/) — SDO/HMI series hmi.Ic_720s, keyword RSUN_OBS (apparent solar radius, arcseconds) every seven days of 2023. The pipeline computes it from the spacecraft–Sun distance, an ephemeris.
5. [5] T. Trifonov et al., “A public HARPS radial velocity database corrected for systematic errors”, *A&A* 636 (2020) A74 ([VizieR J/A+A/636/A74](https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=J/A%2BA/636/A74)) — τ Ceti (HD 10700): RVdrs and BERV for every exposure 2003–2019.
6. [6] F. W. Bessel, “Bestimmung der Entfernung des 61sten Sterns des Schwans”, *Astronomische Nachrichten* 16 (1838) 65 — the parallax of 61 Cygni, 0.314″.
7. [7] J. Kepler, *Astronomia nova* (Prague, 1609) — the elliptical orbit of Mars with the Sun at a focus, and the law of equal areas; see [Kepler's laws of planetary motion](https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion) (Wikipedia) for the history.
8. [8] J. Kepler, *Harmonices mundi*, book V, chapter 3 (Linz, 1619) — the third law, the periods' squares proportional to the cubes of the mean distances.
9. [9] I. Newton, *Philosophiæ naturalis principia mathematica* (London, 1687), book I §§2–3 and book III; the cannonball fired from a mountain is in his *A Treatise of the System of the World* (London, 1728).
10. [10] D. R. Williams, [Planetary Fact Sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), NASA Goddard (NSSDCA) — semi-major axes (10⁶ km) and *sidereal* orbit periods (days) of each planet's page, read 2026-10-16: Mercury 57.909 / 87.969, Venus 108.210 / 224.701, Earth 149.598 / 365.256, Mars 227.956 / 686.980, Jupiter 778.479 / 4,332.589, Saturn 1,432.041 / 10,755.699, Uranus 2,867.043 / 30,685.400, Neptune 4,514.953 / 60,189.018; the Moon 0.3844 / 27.3217.
11. [11] [ESA Navipedia — GPS Space Segment](https://gssc.esa.int/navipedia/index.php/GPS_Space_Segment): semi-major axis 26,560 km, period half a sidereal day (11 h 58 min).
12. [12] R. R. Bate, D. D. Mueller & J. E. White, *Fundamentals of Astrodynamics* (Dover, 1971), §§1.5–1.7 — the conic r = p/(1 + e cos ν), its parameter and eccentricity from the launch speed, used for the ranges of the cannon at 400 km.
13. [13] [European Space Agency, *Where is the International Space Station?*](https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/International_Space_Station/Where_is_the_International_Space_Station) — the station flies 400 km high, at 28,800 km/h, one circuit of the Earth in 92 minutes.
14. [14] G. H. Pettengill, H. W. Briscoe, J. V. Evans, E. Gehrels, G. M. Hyde, L. G. Kraft, R. Price & W. B. Smith, “A radar investigation of Venus”, *Astronomical Journal* 67 (1962) 181–190 ([NASA ADS](https://adsabs.harvard.edu/full/1962AJ.....67..181P)) — Table I (the Millstone site), Table II (25 echo flight times, 6 March–18 May 1961, and the astronomical unit reduced with Newcomb's and Duncombe's orbits), Table III (the five radar determinations of 1961), the timing errors of the early echoes and the 1958 result found in error; our transcription in `data/orb/radar/`.
15. [15] R. S. Park, W. M. Folkner, J. G. Williams & D. H. Boggs, “The JPL planetary and lunar ephemerides DE440 and DE441”, *Astronomical Journal* 161 (2021) 105 ([NAIF](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/)) — the positions of the Earth and Venus used to reduce the 1961 echoes again (`fog build orb-radar`).
16. [16] E. M. Standish, [Keplerian Elements for Approximate Positions of the Major Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html), JPL Solar System Dynamics, Table 1 (1800–2050) — the drawn positions of Venus only.
17. [17] International Astronomical Union, [Resolution B2 (2012)](https://www.iau.org/static/resolutions/IAU2012_English.pdf): the astronomical unit is 149,597,870,700 m exactly.
18. [18] J. Antoniadis et al. (EPTA collaboration), “The second data release from the European Pulsar Timing Array I. The dataset and timing analysis”, *Astronomy & Astrophysics* 678 (2023) A48; timing models and arrival times on [Zenodo (record 8300645)](https://zenodo.org/records/8300645), version DR2full — the positions fitted with DE440, used here as published (`fog build orb-pulsar`).
19. [19] H. Ding et al., “The MSPSRπ catalogue: VLBA astrometry of 18 millisecond pulsars”, *Monthly Notices of the Royal Astronomical Society* 519 (2023) 4982–5007 ([arXiv:2212.06351](https://arxiv.org/abs/2212.06351)), Table 5: positions, error budgets and proper motions inferred without timing priors; our transcription in `data/orb/pulsar/`.
20. [20] D. R. Lorimer & M. Kramer, *Handbook of Pulsar Astronomy* (Cambridge University Press, 2005), §8.2 — the Rømer delay −r·n̂/c of the solar system and the timing model.
21. [21] G. Agazie et al. (NANOGrav collaboration), “The NANOGrav 15 yr data set: observations and timing of 68 millisecond pulsars”, *Astrophysical Journal Letters* 951 (2023) L9; timing models on [Zenodo (record 16051178, v2.1.0)](https://zenodo.org/records/16051178), narrowband — the positions fitted with DE440, used as published.
22. [22] S. Newcomb, “Discussion of observations of the transits of Venus in 1761 and 1769”, *Astronomical Papers prepared for the use of the American Ephemeris and Nautical Almanac*, vol. II, part V (Washington, 1891), chapter IV (adopted positions of the stations, pp. 343–345) and chapter VI (tabular summary of the observations, pp. 364–371) ([archive.org](https://archive.org/details/02aAstronomicalPapersPreparedForTheUse)); our transcription in `data/orb/transits/`.
23. [23] E. Halley, “Methodus singularis quâ Solis parallaxis sive distantia à Terra, ope Veneris intra Solem conspiciendæ, tuto determinari poterit”, *Philosophical Transactions* 29 (1716) 454–464 — the method of timing a transit of Venus from distant stations.
24. [24] U. Backhaus (Universität Duisburg-Essen), *Transit of Venus 2012*, project “Contact times” (www.venus2012.de): the contact III timings sent by the participants, file `participants/daten3.txt` as kept by the [Internet Archive](http://web.archive.org/web/20240519220217/http://www.venus2012.de/participants/daten3.txt) (19 May 2024), and the project's own results per contact (contact 3: 158,480,000 km); the files of the other contacts are not archived.
25. [25] European Southern Observatory, [VT-2004 Observing Campaign: the astronomical unit](https://www.eso.org/public/outreach/eduoff/vt-2004/auresults/) — 4,367 contact timings by 1,440 observers on 8 June 2004, giving 149,608,708 ± 11,835 km; the timing databases (IMCCE) are no longer online.
