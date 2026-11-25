# How fast, how far: a clock of the Earth's motions, and the distance scale

> Tab "Scale" of *Flat plane or Globe?*. Web page: /#tab-scale. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Scale · the Earth's motions on one clock, and the distances*

The Earth turns, goes round the Sun, its axis and its orbit slowly swing, and the Sun itself goes round the Galaxy. The clock below shows all five at once, each hand at its true angle now and turning at its true speed: nothing is sped up. Then the distances, from the Earth's radius to the next galaxy, each measured with the step before it.

## A clock of the Earth's motions

**Five hands, five periods.** The first is the Earth's rotation relative to the stars, one turn in 23 h 56 min 4.1 s: the Earth Rotation Angle of the IERS, the same angle the ring lasers and the satellites measure in the Rotation and Satellites tabs[1]. The second is the Earth going round the Sun, one turn in 365.256 days[2]. The third is the slow turn of the Earth's axis, the precession of the equinoxes that Hipparchus found by comparing star positions, one turn in 25,770 years[3]. The fourth is the slow turn of the orbit itself, its long axis swinging round in 111,360 years[2]. The fifth is the Sun going round the centre of the Galaxy: the radio source Sgr A*, at the centre, seems to slide along the Milky Way by 6.411 thousandths of an arcsecond a year, the reflection of our own motion, one turn in 202 million years[4].

*Figure caption:* **The Earth's motions, at their true speeds.** Left: each hand at its true angle at this moment, on the computer's clock, counted counterclockwise as seen from the north. Even the fastest hand, the rotation, turns only a quarter of a degree a minute, so the dial seems still. Right: for each hand, its angle now, with enough decimals that the last ones change as you watch; how far it has turned since the page opened; and a tape graduated in the hand's own angle (arcseconds, or millionths of an arcsecond for the slow ones), sliding at the hand's true rate. The graduation and its rate are printed: nothing is sped up. Click to show one frame a second.

$${\theta(t) = \theta_0 + 360^\circ\,\frac{t - t_0}{T}},\qquad \omega = \frac{360^\circ}{T}$$

θ is a hand's angle, θ₀ its angle at t₀ = 1 January 2000 at noon (J2000), T its period and t the time on your computer. That is the whole program: each hand is a straight line in time. Its code is a few lines in `src/tabs/scale/logic.js` (function `armAngle`), with the five values of T and θ₀ and their sources. Open the page twice an hour apart: the rotation hand has turned 15.04°, the orbit hand 0.041°.

**The five hands: their period, how fast their angle changes, and the speed of travel it means where it applies (v = ω r: at the equator, on the Earth's orbit, around the Galaxy)[5][6][7].**

| Hand | One turn | Angular speed | Speed of travel |
| --- | --- | --- | --- |
| The Earth's rotation | 23 h 56 min 4.1 s | 15.04″/s | 0.465 km/s |
| The Earth around the Sun | 365.256 days | 0.0411″/s | 29.78 km/s |
| Precession of the axis | 25,770 years | 1.594 µas/s | — |
| Precession of the orbit | 111,360 years | 0.369 µas/s | — |
| The Sun around the Galaxy | 202 million years | 0.203 nas/s | ~251 km/s |

$${v = \omega\,r = \frac{2\pi r}{T}}$$
$$v_\text{orbit} = \frac{2\pi\,(1\ \text{AU})}{1\ \text{year}},\qquad v_\odot = 4.74\,\mu\,R_0$$

r is the radius of the circle: the Earth's equatorial radius, the astronomical unit, or the Sun's distance from the Galactic centre R₀ = 8.275 kpc[7]. μ is Sgr A*'s apparent motion in milliarcseconds per year and 4.74 converts mas/yr × kpc into km/s. You are moving at 0.465 km/s around the axis (at the equator), 29.78 km/s around the Sun and about 251 km/s around the Galaxy.

**In one minute** you are carried 1,787 km around the Sun and about 15,100 km around the Galaxy. None of it is felt, because the motions are almost perfectly smooth: what the body feels is acceleration, and the largest here, toward the Earth's axis at the equator, is 0.034 m/s², a third of a percent of gravity.

> **On a flat model,** the first hand belongs to the sky, which turns over a ground at rest, and the other four have no counterpart: the Sun circles above the disc every day, and nothing goes round anything over a year. The ring lasers of the Rotation tab, which feel a rotation without looking at the sky, and the satellites, which see the receivers turn under their orbits, are where the two pictures part.

## The distance scale

**Each step is measured with the one before it.** The Earth's radius comes from angles and lengths on the ground (Results tab). The Moon's distance follows from its parallax seen from opposite sides of the Earth, and now from laser echoes timed to a fraction of a nanosecond (Moon tab). The Sun's distance, the astronomical unit, comes from light time, aberration and Doppler shifts (Orbit tab), and radar echoes from the planets[6]. With the Earth's orbit as a baseline, the nearest stars shift back and forth each year: their parallax gives their distance, Proxima Centauri's 0.768″ puts it at 4.25 light-years[9]. The orbits of the stars around the Galactic centre, followed in position and in Doppler velocity, give its distance[7]; and stars whose brightness is known from their pulsation period, calibrated on parallaxes, give the distance of the next galaxy[10].

*Figure caption:* The distance scale on a logarithmic axis, each tick ten times the one before. Blue: the distances measured, each from the step before it. Orange: where the flat models put the Sun, a few thousand kilometres up (the best flat lamp of the Orbit tab, fitted to the Sun's Doppler shift); the measured Sun is fifteen thousand times farther.

**The steps of the scale, the time light takes to cross them, and how they are measured[6][7][8][9][10].**

| Object | Distance | Light time | Measured by | Tab |
| --- | --- | --- | --- | --- |
| Earth (radius) | 6,371 km | 0.02 s | angles and lengths on the ground | [Results](/ai/results.md) |
| Moon | 384,400 km | 1.28 s | parallax; laser echoes | [Moon](/ai/moon.md) |
| Sun | 149.6 million km | 8 min 19 s | light time, aberration, Doppler; radar | [Orbit](/ai/orb.md) |
| Neptune | 4,515.0 million km | 4.2 h | Kepler's third law with its period; spacecraft | [Orbit](/ai/orb.md) |
| Proxima Centauri | 4.25 light-years | 4.25 light-years | parallax (Gaia) | [Orbit](/ai/orb.md) |
| Galactic centre | 26,990 light-years | 26,989.64 light-years | orbits of the stars around Sgr A* | [Satellites](/ai/sat.md) |
| Andromeda galaxy | 2,482,076 light-years | 2,482,068 light-years | Cepheids calibrated on parallaxes | [Results](/ai/results.md) |

*Figure caption:* **Powers of ten, from the Earth to Andromeda.** The Earth stays at the centre; the field of view widens tenfold about every second and a half, from 20,000 km to four million light-years. Each object sits at its true distance from us, in its own direction, with its distance circle drawn once it can be seen; every frame has its scale bar, and the bottom of the frame names the last object passed and the next one: the empty frames are empty because space is. Objects too small to see at the scale of the frame are drawn as dots. Click to pause.

$${d = \frac{1\ \text{AU}}{\tan p}},\qquad 1\ \text{pc} = \frac{1\ \text{AU}}{\tan 1\text{″}} = 206\,265\ \text{AU}$$

p is the star's parallax, half its yearly back-and-forth shift against more distant stars, and the parsec the distance at which p = 1″. Proxima Centauri: p = 0.768″, d = 1.302 pc = 4.25 light-years.

$${d = c\,t},\qquad c = 299\,792.458\ \text{km/s}$$

t is the one-way light time: the laser echo from the Moon comes back after 2.56 s, the Sun's light is 8 min 19 s old when it arrives, Proxima's 4.25 light-years, Andromeda's 2.48 million years.

> **The flat models' distances.** On a plane, two observers far apart see the Sun at different heights only if it is close: triangulated from a plane, the Sun comes out a few thousand kilometres up, and so does the Moon. Those distances are not measured from the Sun or the Moon themselves: the Sun's Doppler shift, its unchanging size through the day and the Moon's laser echoes all give the large ones. **What would vindicate the flat model here:** a laser echo from the Moon after a few hundredths of a second instead of 2.56 s, or a Sun whose apparent size grows by a large factor between sunset and noon.

**See also**[Rotation](/ai/rot.md)[Orbit](/ai/orb.md)[Satellites](/ai/sat.md)[Moon](/ai/moon.md)[Results](/ai/results.md)

## Sources for this tab

1. [1] G. Petit, B. Luzum (eds.), [*IERS Conventions (2010)*, IERS Technical Note 36](https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html), eq. (5.15): the Earth Rotation Angle θ = 2π (0.7790572732640 + 1.00273781191135448 D_U), D_U days of UT1 since J2000; one turn relative to the stars in 86,164.0989 s.
2. [2] E. M. Standish, [Keplerian Elements for Approximate Positions of the Major Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html), JPL Solar System Dynamics, table 1 (1800–2050), Earth–Moon barycentre: mean longitude 100.46457166° + 35,999.37244981° per century, longitude of perihelion 102.93768193° + 0.32327364° per century (J2000 ecliptic and equinox).
3. [3] N. Capitaine, P. T. Wallace, J. Chapront, “Expressions for IAU 2000 precession quantities”, *A&A* 412 (2003) 567 (the IAU 2006 precession): general precession in longitude 5,028.796195″ per Julian century, one turn of the axis in about 25,772 years. Discovered by Hipparchus about 130 BC from star positions.
4. [4] M. J. Reid, A. Brunthaler, “The Proper Motion of Sagittarius A*. III. The Case for a Supermassive Black Hole”, *ApJ* 892 (2020) 39 — 18 years of VLBA positions: Sgr A* moves along the Galactic plane by 6.411 ± 0.008 mas per year, the reflection of the Sun's orbit around it.
5. [5] National Imagery and Mapping Agency, *World Geodetic System 1984*, TR8350.2 (2000): equatorial radius 6,378.137 km.
6. [6] International Astronomical Union, Resolution B2 (2012): the astronomical unit defined as 149,597,870,700 m, the value the radar and spacecraft ranging of the planets had measured (the Orbit tab measures it from light time, aberration and Doppler).
7. [7] GRAVITY Collaboration, “Mass distribution in the Galactic Center based on interferometric astrometry of multiple stellar orbits”, *A&A* 647 (2021) A59: R₀ = 8.275 ± 0.034 kpc, from the orbits of the stars around Sgr A* (positions and Doppler velocities).
8. [8] D. R. Williams, [Planetary Fact Sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), NASA Goddard (NSSDCA): the Moon's semi-major axis 384,400 km, Neptune's 4,514.953 × 10⁶ km.
9. [9] Gaia Collaboration, “Gaia Data Release 3: Summary of the content and survey properties”, *A&A* 674 (2023) A1; Proxima Centauri (Gaia DR3 5853498713190525696): parallax 768.0665 ± 0.0499 mas.
10. [10] S. Li, A. G. Riess et al., “A Sub-2% Distance to M31 from Photometrically Homogeneous Near-infrared Cepheid Period–Luminosity Relations Measured with the Hubble Space Telescope”, *ApJ* 920 (2021) 84: 761 ± 11 kpc.
