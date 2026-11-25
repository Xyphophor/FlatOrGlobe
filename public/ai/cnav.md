# Why celestial navigation only closes on a globe

> Tab "Cel. nav." of *Flat plane or Globe?*. Web page: /#tab-cnav. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Sight reduction · the 1′ = 1 nm rule*

*Figure caption:* **One rate, or a rate that keeps changing.** On the globe the zenith distance to a star equals the central angle θ = d/R, so sailing 60 nm toward the ground position changes the altitude by exactly 1°, anywhere. On a plane a body at finite height gives altitude = atan(H/x): equal steps in distance give unequal steps in angle. Distances are schematic; the star is at infinity.

A sextant sight measures one thing: the *altitude* of a body — its angle above the sea horizon. Everything else in navigation is built on how that altitude changes as you move over the surface. That rate is the whole game, and only one shape of Earth produces the rate ships actually measure.

applies to every figure in this tab

$${a} = d\times k \iff d = \frac{{a}}{k} \iff d = {a}\times R$$

**a** = change in a body's altitude · **d** = distance moved over the ground toward or away from its sub‑point · **k** = the rate linking them. The last two forms can both be true only if **k = 1 / R** — the signature of a sphere of radius R.

Point a body straight up and you are standing on its **geographic position** (GP) — the spot where it sits at the zenith. Because the stars are so far away, their light arrives parallel across the whole Earth, so a body's *zenith distance* (90° − altitude) equals your angular distance from its GP. Move toward the GP and the altitude climbs; move away and it falls. On a sphere the arc you walk and the angle you turn are locked together by `arc = R × angle` — that is `d = a × R` — so **k = 1/R is identical everywhere, in every direction, for every body.**

> **The measured constant.** Navigators find that **1 arcminute of altitude change = 1 nautical mile** of travel toward the GP — which is how the nautical mile was defined. Feed that into d = a/k: with k = 1′/nm, R = 1/k = 3438 nm ≈ 6371 km. The radius drops out of star sights alone, and it matches the Earth's independently‑known size. It is the *same R* that curves the terrestrial sightlines over in the Simulator tab.

## See it in 3D: four sights, one fix · click & drag to orbit [evidence: prediction]

Each star stands above its ground position (GP); the observer measures its altitude and computes a distance `d = a/k`, which draws a *circle of position* on the surface around that GP. The flat model gets every advantage: its star height H is calibrated so that sight ① works perfectly. The other three sights follow.

*Figure caption:* **Globe.** With k = 1/R, all four circles `d = a/k` pass through the observer — one point satisfies every sight simultaneously. This is a celestial fix, performed at sea every day.

*Figure caption:* **Flat plane.** Stars at height H over the same GPs. Even with H tuned so circle ① hits the observer exactly, circles ②–④ fall short (red gaps) — because atan(r/H) isn't proportional to r. No single H fixes all four; on a plane the sights contradict each other.

**The four sights: measured altitude → d = a/k, versus what the flat model's circles actually do**

| Star | Measured altitude | d = a/k (globe circle) | Flat circle radius | Flat miss at the observer |
| --- | --- | --- | --- | --- |
| Star ① | 69.9° | 2 230 km | 2 230 km | 0 (calibrated) |
| Star ② | 58.5° | 3 504 km | 3 318 km | 186 km |
| Star ③ | 47.0° | 4 778 km | 4 229 km | 549 km |
| Star ④ | 35.6° | 6 052 km | 4 974 km | 1 078 km |

## Test it yourself: is k constant? [evidence: prediction]

A body sits directly over its sub‑point. The globe drops its altitude at a fixed rate; the flat‑plane model (body at height H) does not. Watch the two rate columns.

**Altitude of a body above its sub‑point, with the local rate of altitude change (arcminutes per nautical mile)**

| Distance from sub‑point | Globe altitude | Globe rate k | Flat altitude | Flat rate k |
| --- | --- | --- | --- | --- |
| 0 km | 90.00° | 0.999 ′/nm | 90.00° | 1.273 ′/nm |
| 1 000 km | 81.01° | 0.999 ′/nm | 78.69° | 1.224 ′/nm |
| 2 500 km | 67.52° | 0.999 ′/nm | 63.43° | 1.019 ′/nm |
| 5 000 km | 45.03° | 0.999 ′/nm | 45.00° | 0.637 ′/nm |
| 7 500 km | 22.55° | 0.999 ′/nm | 33.69° | 0.392 ′/nm |
| 10 000 km | 0.07° | 0.999 ′/nm | 26.57° | 0.255 ′/nm |

The globe rate holds flat at **0.999 ′/nm** — that is k = 1/R, giving R = 1/k ≈ **3 440 nm ≈ 6 371 km**. The flat-model rate slides from steep near the sub-point to shallow far away, so there is no single k.

Experiment 2 · celestial navigation

Drive north and watch Polaris climb

Measure the altitude of Polaris (or any star) above the horizon. Drive a known distance due north along a straight road. Measure it again. The star has climbed — the question is by how much.

Independent variable
**What you change:** the distance **d** you travel due north. You choose it — 100 km, 300 km, 500 km.

Dependent variable
**What you measure:** the **change in the star's altitude**, in degrees. The sky decides this, not you.

IV d = 300 km north, starting at 45°N. Flat prediction: Polaris rises 1.770°. Globe prediction: Polaris rises 2.698°. They differ by 0.928° (56′).

**Verdict rule:** the globe says the rise is always **2.698°** for 300 km — the same everywhere. The flat model cannot hold that: from 15°N it predicts 0.934°, from 60°N 2.445°.

> **Why the plane fails, in one line.** On a flat plane a body at finite height can never reach the horizon (atan(H/x) stays positive), so the Sun would never set; different bodies would need different heights H and return contradictory fixes; and k would change with where you stand. The globe uses a single radius R and one k = 1/R for the Sun, the Moon and every star at once — and from that same geometry it predicts sunset, the “Polaris altitude equals your latitude” rule, and the southern stars a disk cannot show.

The through‑line. The two tabs are the same geometry seen twice. The curvature term `d² / 2R` that lowers a distant tower's elevation angle in the Simulator is produced by the very same R that makes `k = 1/R` here. Flatten the Earth and you break both at once — and no single flat layout reproduces the terrestrial dips *and* the constant one‑arcminute‑per‑mile star rate that ships have logged for three centuries.

**See also**[Distances](/ai/dist.md)[Sun](/ai/sun.md)[GPS](/ai/gps.md)[Foucault](/ai/fou.md)[Azimuth](/ai/azim.md)

## Sources and further reading for this tab

Nothing on this tab carries an inline [n] marker yet: these are the works it was built from, listed in full rather than pinned to individual sentences.

- [Bowditch, *The American Practical Navigator*, Vol. 2 (NGA, 2019; PDF hosted by the US Coast Guard)](https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf) — celestial navigation in full: a corrected sextant altitude places you on a circle around the body's ground point, the 1′ = 1 nautical mile relation, sight reduction, and the running fix. Everything this tab computes is the working method described there.
- [Hirt et al. (2010), *J. Geophys. Res.* — terrestrial refraction coefficient](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067) — background on the refraction physics behind the astronomical-refraction toggle (the drawn bend is exaggerated ×300 and labelled as such; the printed corrections are real).
- [U.S. Naval Observatory — Celestial Navigation Data for Assumed Position and Time](https://aa.usno.navy.mil/data/celnav). Fill in a position and a time and it returns Greenwich hour angle, declination, computed altitude and computed azimuth for every body above your horizon, plus the altitude corrections. **This is the single most useful link on this tab**: the stars drawn here are synthetic, chosen for legibility, but this service will give you real ones, from the organisation that publishes the almanac, and you can run the whole argument again on numbers this page had no hand in.
- [The Nautical Almanac](https://aa.usno.navy.mil/publications/na) (U.S. Naval Almanac Office with HM Nautical Almanac Office). Published every year for over 150 years, tabulating hour angle and declination hourly to 0.1 arcminute. Every line of it is computed on a rotating sphere.
- [Sight Reduction Tables for Air Navigation](https://msi.nga.mil/Publications/SRTAir) (Pub. 249 / AP 3270), and Pub. 229 for marine use. Prepared jointly by the U.S. Naval Observatory and the UK Hydrographic Office. These tables cannot be generated by any other geometry: they are spherical trigonometry, printed by two governments, for operational use.
- [USNO — Celestial Navigation Algorithms](https://aa.usno.navy.mil/publications/celnav). The modern least-squares formulation, which solves for course and speed as well as position. Useful here because it shows the sphere is not a legacy assumption kept for tradition: it is still the model when the method is rebuilt from scratch.
- **T. H. Sumner, *A New and Accurate Method of Finding a Ship's Position at Sea* (Boston, 1843).** The origin of the line of position. Sumner found it by accident in December 1837 approaching the Irish coast in bad weather: working three different assumed latitudes, he noticed the three results fell on one straight line, and that line ran through Small's Light. Digitised and out of copyright; search the title.
- **Marcq de Blond de Saint-Hilaire, « Calcul du point observé », *Revue Maritime et Coloniale* (1875).** The intercept method — the procedure this tab models — in the original French.
- **IMO, International Convention on Standards of Training, Certification and Watchkeeping for Seafarers (STCW), tables A-II/1 and A-II/2.** Celestial navigation is a competence required by international treaty of officers in charge of a navigational watch. Whatever else it is, it is not a belief anyone is free to hold or not hold.
