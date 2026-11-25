# Grasse fires a laser at the Moon, and the Earth's radius comes back

> Tab "Moon" of *Flat plane or Globe?*. Web page: /#tab-moon. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*The Moon as a ruler · lasers, parallax and shadow*

Seventy kilometres from Marseille, on the Calern plateau, a telescope fires laser pulses at a reflector left on the Moon by Apollo 15 and times their return to a fraction of a nanosecond. Over a night the time of flight changes by tens of milliseconds, and most of that change is the observatory itself being carried around the Earth's axis. The size of that circle is the Earth's radius.

## Laser ranges from Grasse: the radius from times of flight [evidence: check — Where the radius enters: the Moon's direction (declination, hour angle) comes from a lunar theory, and the station's geocentric latitude uses the ellipsoid's flattening.]

**Each point is a time of flight, about 2.5 s there and back,** and the archive gives 55 passes of six hours or more from Grasse between 2015 and 2025[1][2]. The distance from the Earth's centre to the reflector changes smoothly over a night. The distance from the observatory does not: it carries the observatory's own circle around the axis. For a trial radius R, subtract the observatory's part and see how smooth what is left is. One value makes it smooth to a metre.

$$\rho = \tfrac12\,c\,\tau,\qquad \rho^2 = D^2 - 2DR\cos Z + R^2$$
$$\cos Z = \sin\psi\sin\delta + \cos\psi\cos\delta\cos H,\qquad {R:\ D(t)\ \text{smoothest}}$$

τ is the measured time of flight, ρ the distance from the observatory to the reflector, D the distance from the Earth's centre, Z the angle between the observatory's direction from the centre and the Moon's. ψ is the observatory's geocentric latitude, δ and H the Moon's declination and hour angle, from a lunar theory[3]: that is where a model enters, so this section is a check. For each pass, R is the value that makes D(t) closest to a cubic.

- 55 passes, GrasseR = 6,365.8 km (quartiles 6,364.5–6,368.0)station at rest: 10.0 km off

*Figure caption:* Top: for the first pass in the archive, how smooth the Moon's distance from the centre comes out for each trial radius (residual from a cubic, log scale). Bottom: the radius from each of the passes. The geocentric radius of the observatory on the reference ellipsoid, 6,369.3 km, is drawn for comparison.

> **The flat model, at its best.** On a plane the observatory does not move, so the range is the distance from a fixed point to a Moon that may follow any smooth path: set R = 0 and let the cubic do everything. The residual is then 10.0 km in the median pass, against 0.55 m with the observatory carried on a circle of radius R. **What would vindicate it:** passes whose ranges are as smooth with R = 0 as with any other value.

**Limits.** The radius found is the distance from the Earth's centre to the observatory, 6,365.8 km in the median, 3.4 km below the reference ellipsoid's value there, and the quartiles span 3.5 km. The Moon's direction comes from an abridged lunar theory good to about 10″; its errors and the observatory's latitude are the main source of the spread.

## The Moon's parallax, Kepler and a pendulum [evidence: prediction]

**A measurement to make with a camera.** Through a night the Moon shifts against the stars by up to a degree more than its orbit alone would carry it, because the observer is carried around the axis: the horizontal parallax π, about 57′, the angle the Earth's radius subtends from the Moon. Kepler's third law with g = GM/R² then gives R itself, with no distance on the ground.

$$\sin\pi = \frac{R}{D},\qquad n^2 D^3 = gR^2\left(1+\frac{m}{M}\right)$$
$${R = \frac{g\,\sin^3\pi\,(1+m/M)}{n^2}}$$

g is measured with a pendulum, n = 2π / (27.32 days) is the Moon's motion against the stars, m/M ≈ 1/81 the Moon-to-Earth mass ratio. With π = 57.04′ and g = 9.80 m/s², R ≈ 6,395 km. An error of 1 % in π is 3 % in R.

Experiment · the Moon against the stars

Photograph the Moon among the same stars at moonrise, transit and moonset

A camera on a tripod, a fixed focal length, the same stars in every frame.

**You measure** the Moon's position among catalogue stars at three times

**You get** its parallax π, then R from g and the month

Separate the parallax from the orbital motion with a second night, or by fitting the motion as a straight line across the night.

Prediction: π between 54′ and 61′ depending on the Moon's distance that week.

R = **6,399 km**

1 % on π moves R by 3 %: 6,209–6,593 km for ±1 %

## The Earth's shadow on the Moon (Aristarchus) [evidence: check — Where the radius enters: the distances of the Moon and the Sun in km come from an ephemeris (DE440), and the catalogue kept only the timings whose layer height, computed from the Earth's radius, lies between −50 and +250 km.]

**During a lunar eclipse the Earth's shadow crosses the Moon, and its edge is an arc of a circle about 2.6 Moon-widths across.** A crater timing is the instant that edge crosses a crater. It is the same for every observer, wherever they stand, so one timing puts one point on the edge of the shadow. Observers with small telescopes timed 22,539 of them at 94 eclipses between 1842 and 2011[4][5]. We reduced the 12,729 that mark the middle of a crater or a contact with the Moon's limb ourselves: the instant at the Moon, the crater placed on the Moon by its selenographic latitude and longitude[6] and the Moon's orientation[8], the shadow's axis from the Sun through the Earth's centre[7]. σ, the shadow's angular radius, is the angle between the two seen from the Earth's centre. Our reduction agrees with the catalogue authors' own, timing by timing (correlation 0.96).

$${\sigma + s_\odot = \pi_M + \pi_\odot}$$
$${R_s = \frac{\sigma + s_\odot}{1/D_M + 1/D_\odot}}$$

σ is the shadow's angular radius at the Moon, measured at each eclipse (41′ to 46′ as the Moon's distance changes), s☉ the Sun's angular radius, π = R/D the parallaxes, D☾ and D☉ the distances of that instant[7]. Aristarchus' relation holds for a ball without air; R_s is then the radius of whatever casts the edge of the umbra: **6,473 ± 1 km** over the 69 eclipses with 20 timings or more, 2.3 % more than an airless Earth would give. The Earth plus the lowest, opaque layer of its air, about 100 km thick[4].

*Figure caption:* The radius of the body that casts the umbra's edge, from the median σ of each eclipse with 20 timings or more, 1842-2011. Every eclipse lands above the Earth's mean radius: the shadow is cast by the Earth and the bottom of its air, and how thick that bottom is changes from one eclipse to the next.

**Limits, and where the radius enters.** A visual timing is good to 25 or 30 seconds, a few tenths of a percent of σ, and the enlargement changes from one eclipse to the next with the air along the Earth's edge. Julius Schmidt's clocks of 1842-1879 were corrected by the catalogue's compilers against modern ephemerides[5]. The catalogue kept only the timings whose layer height, which its authors computed from the Earth's radius, lies between −50 and +250 km: a selection that touched the radius, and the distances come from an ephemeris. That makes this radius a check, not a measurement. The parallax experiment of the previous section has not been done yet and stays a prediction.

## The shadow is round from every side: 12,700 timings [evidence: measurement]

**Aristotle's argument, with numbers.** The Earth's shadow on the Moon is always an arc of a circle; only a ball casts a round shadow whichever way it is lit[9]. Divide each timing's σ by the median σ of its own eclipse: no radius and no distance enter, only angles. The latitude β on the shadow says which side of the Earth cast that piece of the edge: ±90° the polar regions, 0° the equator. A round shadow gives 1 at every β.

$${\frac{\sigma(\beta)}{\sigma_0} \approx 1 - f_s \sin^2\beta}$$
$${\frac{\sigma(\beta)}{\sigma_0} = \frac{1}{\sqrt{\cos^2\beta + \sin^2\beta / \sin^2\delta_\odot}}}$$

Top line, a ball: f_s is the flattening of its shadow, fitted to the 12,729 timings: **0.0029 ± 0.0002**, against 0.0034 for the Earth's own shape. Bottom line, a flat disc with the Earth's axis as its normal: lit from the Sun's direction, its shadow is an ellipse whose height is sin δ☉ of its width, δ☉ the Sun's declination at the eclipse, between −23.4° and +23.4°.

*Figure caption:* Every timing's σ divided by its eclipse's median, against the latitude on the shadow. Top, the whole scale: the timings, counted in cells of 2° by 0.5 %, form one thin band at 1; the dashed curves are the best flat disc's shadow for the Sun at 3°, 12° and 23° of declination. Bottom, the band magnified a hundred times: ten-degree averages with two standard errors, the fitted flattening and the Earth's.

> **The flat model, at its best.** A flat Earth that casts a shadow on the Moon at all already borrows the globe's geometry; give it that, with the Earth's axis as the disc's normal and the best radius at each eclipse. The timings then scatter 27 % around the best disc's ellipse, in the median eclipse, against 0.67 % around a circle. Only a disc turned to face the Sun at every eclipse, whatever the season, would cast a round shadow every time, and a body whose shadow is round from every direction is a ball. **What would vindicate it:** a shadow whose radius changes with β the way a disc's does, or a shadow stretched along the equator.

**Limits.** The latitudes on the shadow are not evenly covered: the craters are on the near side, and the Moon crosses the shadow north or south of its centre depending on the eclipse. One eclipse's own flattening is uncertain by a few thousandths; it is the 12,729 timings together that fix it. The fitted flattening is a little below the Earth's: the air that enlarges the shadow is not the same over the poles and over the equator. Timings more than three standard deviations from the rest of their eclipse are set aside, the site's usual rule.

**See also**[Eclipses](/ai/ecl.md)[Azimuth](/ai/azim.md)[Gravity](/ai/grav.md)[Rotation](/ai/rot.md)

## Sources for this tab

1. [1] ILRS normal points, Apollo 15 reflector, 2015–2025, in the open CRD archive of [EDC/DGFI (TU Munich)](https://edc.dgfi.tum.de/pub/slr/data/npt_crd/apollo15/): epoch and two-way time of flight of each normal point, station of each session. Read by `fog build moon-llr`.
2. [2] ILRS station GRSM 7845: the MéO lunar laser station of the Observatoire de la Côte d'Azur on the Calern plateau near Grasse (43.7546° N, 6.9215° E, 1,323 m, the coordinates published by the ILRS), the station of every pass used here.
3. [3] J. Meeus, *Astronomical Algorithms*, 2nd ed. (Willmann-Bell, 1998), ch. 47 — the abridged lunar theory (ELP-2000/82) the page uses for the Moon's direction, about 10″ accurate.
4. [4] D. Herald & R. W. Sinnott, [Analysis of lunar crater timings, 1842–2011](https://britastro.org/?p=213568), *J. Brit. Astron. Assoc.* 124 (2014), no. 5 — 22,539 timings at 94 eclipses: the umbra is the Earth's shadow enlarged by an occulting layer about 87 km thick. The timings are catalogued at VizieR (VI/140).
5. [5] D. Herald & R. Sinnott, *Catalogue of Lunar Eclipse Crater Timings* (2014), [VizieR VI/140](https://vizier.cfa.harvard.edu/ftp/cats/6/140/): 22,539 visual timings at 94 eclipses, 1842–2011, each with its eclipse, feature, event, UT and observers; the compilers' notes (doc.txt) give the corrections applied, among them Julius Schmidt's clocks of 1842–1879. Reduced by `fog build moon-eclcraters`.
6. [6] IAU Working Group for Planetary System Nomenclature, [Gazetteer of Planetary Nomenclature](https://planetarynames.wr.usgs.gov/) (USGS Astrogeology), Moon: centre latitude and longitude of each named feature, mean-Earth frame.
7. [7] R. S. Park, W. M. Folkner, J. G. Williams & D. H. Boggs, “The JPL Planetary and Lunar Ephemerides DE440 and DE441”, *Astron. J.* 161 (2021) 105; file [de440.bsp](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/) (NAIF), read directly: positions of the Sun, the Earth and the Moon.
8. [8] B. A. Archinal et al., “Report of the IAU Working Group on Cartographic Coordinates and Rotational Elements: 2009”, *Celest. Mech. Dyn. Astr.* 109 (2011) 101–135, Table 2: the Moon's orientation (pole and prime meridian), about 150 m from the mean-Earth frame. Time: ΔT from F. Espenak & J. Meeus, *Five Millennium Canon of Solar Eclipses*, NASA/TP-2006-214141.
9. [9] Aristotle, *On the Heavens* II.14, 297b: in eclipses of the Moon the Earth's shadow is always convex, so the Earth is a sphere.
