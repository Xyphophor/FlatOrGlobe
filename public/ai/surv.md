# Surveyors don't assume the curve — their instruments keep finding it

> Tab "Surveying" of *Flat plane or Globe?*. Web page: /#tab-surv. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Geodetic surveying · how professionals measure a planet*

*Figure caption:* **The correction, and what it would be on a plane.** The line of sight is level in both. On a plane the ground stays under it and the staff needs no correction at all; on a globe the ground falls away by d²/2R and every sight does. Curvature is exaggerated.

Professional surveying is two centuries of procedures that exist *only because* raw measurements kept disagreeing with flat geometry by exactly the amount a sphere predicts. No knobs to turn here: every number below is a documented case — a wager, a survey, a tunnel, an accelerator — with the source linked at the bottom.

## 01 · Levelling: the correction applied a thousand times a day [evidence: check — Where the radius enters: documented cases compared with d²/8R.]

A surveyor's level defines a *horizontal* line of sight — tangent to the level surface at the instrument. But "level" (equal height, equal gravity potential) *curves with the planet*: the tangent climbs away from the level surface[3] as the square of the distance. Three documented situations, three scales:

$$\operatorname{drop} = \frac{d^2}{2R} \approx {7.85\,\text{cm}\times d^2[\text{km}]}$$
$${\frac{d^2}{8R}}$$
with refraction (k = 0.13): × 0.87

Field procedure encodes the first formula twice over: sights are kept short *and* balanced — equal back-sight and fore-sight — precisely so the curvature term cancels between the two staff readings. A correction that cancels by symmetry is still a correction: on a flat earth the whole ritual would be pointless.

*Figure caption:* **Standard geodetic levelling (NGS-style): 60 m balanced sights.** At 60 m the curvature correction is a mere 0.3 mm per sight — and because back-sight and fore-sight distances are kept equal, it cancels exactly between the two staff readings. The procedure is DESIGNED around the curve: short sights, balanced setups, thousands of times per line. On a flat earth none of this discipline would buy anything.

### The Bedford Level wager, 1870 — surveying settles a bet

Rowbotham sighted eight inches above the water, deep in the refraction layer; Wallace raised the line to about 4 m, set a marker mid-way, and won — and the numbers in the table above are his, documented, not computed here

> Flat-earth author Samuel Rowbotham had sighted along the Old Bedford River with a telescope eight inches above the water — deep in the strong-refraction layer — and declared the six-mile stretch flat. When his follower John Hampden staked £500 that no scientist could show curvature there, the naturalist **Alfred Russel Wallace** — a trained surveyor — accepted, raised the sight line to ~4 m to escape the worst refraction, and set a marker mid-way between two end markers at equal height. Through the telescope the middle marker stood clearly proud of the line joining the ends — the ~1.6 m the sphere predicts (1.85 m before refraction) — and the referee, editor of *The Field*, awarded Wallace the wager[4]. Hampden's response was years of libel and lawsuits, but the measurement has been repeated on that canal ever since, always with the same result. The design — three markers, one sight line — is the cleanest curvature experiment ever devised, and it needs no input from you: the numbers above are the documented ones.

## 02 · Triangulation: the angles confess [evidence: check — Where the radius enters: the spherical excess compared with the globe's prediction.]

Historic mapping was built from chains of triangles between hilltop stations — theodolite angles plus one measured baseline. On a plane, every triangle's angles sum to exactly 180°. On a sphere they sum to more, by the **spherical excess**, proportional to the triangle's area — and surveyors do not debate this, they *budget* for it, triangle by triangle. Pick a documented network:

*Figure caption:* **Gauss 1823 · Brocken–Hohehagen–Inselsberg.** Each angle 60.0014°; the sum exceeds 180° by **14.9″** — and Gauss *measured* 14.85″: the area law and the theodolite agree to a hundredth of an arcsecond. equal-area equilateral shown; real sides 69 / 85 / 107 km. The triangle rotates with the sphere; drag to orbit.

**Documented networks and the excess their theodolites had to swallow**

| Network | Sides | Excess ε per triangle |
| --- | --- | --- |
| Snellius 1615 (first chain) | ~30 km | 2.0″ |
| Gauss Hanover 1821–25 | ~82.2 km | 14.9″ · measured 14.85″ |
| Struve Arc 1816–55 | ~40 km | 3.5″ |
| OSGB retriangulation 1936–62 | ~60 km | 7.9″ |
| GTS India 1802–71 | ~75 km | 12.4″ |
| Continental 1,000 km (illustrative) | ~1000 km | 0.61° |

Snellius' pioneering 1615 chain (Alkmaar–Bergen op Zoom, the first triangulation) carried ~2″ per triangle — below his instruments'[11] precision, which is why the excess only *emerged* as networks and theodolites grew. From Gauss onward it was measured routinely; the Struve chain's 258 triangles, Britain's 6,500-pillar retriangulation and India's Great Trigonometrical Survey all closed only because ε was carried in the books. No flat arrangement of the same stations can close at all.

$$\varepsilon = \frac{\text{Area}}{R^2} \implies \varepsilon'' \approx {\frac{\text{Area}[\text{km}^2]}{197}}$$
$${\varepsilon = 0}$$

The benchmark case: Gauss's great triangle **Brocken–Hohehagen–Inselsberg** (sides 69, 85 and 107 km), measured in his 1820s Hanover survey with an excess of about **14.85″** — dozens of times the resolution of his theodolite. The equal-area triangle drawn below carries the same excess; the area-law and the measurement agree to a hundredth of an arcsecond.

## 03 · The great arcs: surveying the size — and the flattening

Measure a long north–south chain of triangles, fix its ends astronomically, and you get the length of one degree of latitude. Do it at different latitudes and you get not just the size of the planet but its *shape*: a degree is longer near the poles — the signature of the oblate spheroid Newton predicted from rotation.

$$M(\varphi) = \frac{\pi}{180}\,\frac{a(1-e^2)}{(1-e^2\sin^2\varphi)^{3/2}}$$
$$e^2 = 1 - \left(\frac{M_0}{M_{90}}\right)^{2/3},\qquad a = \frac{180}{\pi}\,\frac{M_0}{1 - e^2},\qquad f \approx \frac{e^2}{2}$$
$$M_0 = 110.574\ \text{km},\ M_{90} = 111.694\ \text{km} \;\Rightarrow\; a = 6378\ \text{km},\ f = 1/298$$

M(φ): length of one degree of latitude at latitude φ, measured along the meridian · a: equatorial radius · e: eccentricity · f: flattening · on a sphere M is the same everywhere (111.2 km); on a plane the astronomical latitude would not change at all along a straight chain

**The classic arc measurements (simplified) · one degree of meridian: 110.57 km at the equator → 111.69 km at the poles**

| Years | Arc | What it established |
| --- | --- | --- |
| 1615 | Snellius, Alkmaar–Bergen op Zoom — the first triangulation chain | The method itself: a degree from 33 triangles and one baseline |
| 1669–70 | Picard's Paris arc | The degree Newton used to check universal gravitation |
| 1736–44 | Lapland (Maupertuis) & Peru (La Condamine) — Paris Academy expeditions | A polar degree is longer: Earth is flattened, settling Newton vs Cassini[12] |
| 1792–98 | Dunkirk–Barcelona (Delambre & Méchain), through revolutionary France | The quarter-meridian whose ten-millionth part **defined the metre** |
| 1816–55 | Struve Geodetic Arc — 2,820 km, Hammerfest to the Black Sea, 258 triangles, 10 modern countries | First accurate long meridian segment; UNESCO World Heritage since 2005[8] |
| 1802–71 | Great Trigonometrical Survey of India (Lambton, then Everest) — ~2,400 km arc | Sub-continental network; incidentally measured the Himalaya, including Peak XV |
| 1936–62 | Retriangulation of Great Britain — 6,500+ concrete trig pillars[9] | A national datum (OSGB36); every triangle carrying its excess |

> **The metre in your ruler is a piece of the curve.** The 1791 definition — one ten-millionth of the pole-to-equator meridian[10] through Paris — means the original metre *is* a surveyed measurement of Earth's curvature, fought for over seven years of triangulation through a revolution. Every later redefinition (prototype bar, krypton wavelength, light-second fraction) was chosen to preserve that length.

## 04 · Curvature as an engineering constraint

When the stakes are measured in billions, nobody gets to "assume" a shape. Three projects that had to *build against* R:

**Engineering projects where Earth's curvature entered the blueprints**

| Project | Scale | The curvature fact |
| --- | --- | --- |
| **Peak XV (Everest), 1852** · Great Trigonometrical Survey | stations 160–240 km away | Vertical angles from six distant stations, corrected for curvature, refraction (minutes of arc!) and plumb-line deflection, computed by Radhanath Sikdar's team to 29,002 ft — within 0.1% of today's 29,032 ft, without anyone climbing anything |
| **SLAC linear accelerator, 1962** · Stanford / U.S. DOE | 3.2 km, dead straight | Laser-aligned straight to ~0.5 mm over two miles — while a straight 3.2 km line departs from the *level* surface by ~20 cm end-to-middle. "Straight" and "level" split apart at accelerator tolerances; the builders had to choose straight, on purpose[5] |
| **LIGO gravitational-wave detectors, 1990s** · Caltech / MIT / NSF | two 4 km straight arms | LIGO's own fact sheet: over each 4 km arm "the Earth curves away by nearly a meter", so the slab was earth-moved[2] and precision-poured to keep the laser straight while the level ground fell away; the published alignment paper computed every design height on the WGS-84 ellipsoid — a straight line varies ~1.25 m in ellipsoidal height over the 4 km baseline |
| **Gotthard Base Tunnel, 1999–2016** · AlpTransit / ETH Zürich | 57 km through the Alps | GPS fixed the portals; gyrotheodolites (north to 0.001°) steered underground; gravity anomalies and deflections of the vertical were corrected explicitly. Final breakthrough error: **8 cm horizontal, 1 cm vertical**[6] — impossible arithmetic on any flat model |

**And the professional version of this page's first tab:** in trigonometric levelling, two stations observe each other's zenith angle simultaneously. On a plane the two angles must sum to exactly 180°; on the sphere they sum to 180° + the arc between the stations — for 30 km, an excess of **16.2′**, enormous by theodolite standards, measured in every reciprocal campaign since the 1800s and the standard way refraction itself is calibrated (Gauss's k ≈ 0.13 comes from exactly such data[7] in his Hanover network). The Elevation-angles tab computes this same number from the amateur side.

## 05 · A field guide to the methods — written for the skeptical reader

If you doubt the globe, the best reading list is not debate videos — it is the **training manuals**. They are not persuasion documents; they are instructions for getting jobs done by people who are liable when heights and boundaries come out wrong, and every one of them contains steps that exist only because of R. Here is the map of where to look. For each method: what the manual instructs, and whether the step **accounts for** the curvature (builds it in) or outright **measures** it. The test is always the same — delete the curve from the procedure and the numbers stop closing.

**Professional methods, and exactly where the curve enters — every source is a training or reference document**

| Method | What the manual instructs | Accounts / measures |
| --- | --- | --- |
| **Differential levelling, · balanced sights** | NOAA Manual NOS NGS 3 (*Geodetic Leveling*), Figure 3-8, states it verbatim: curvature error *c* "cancels if s_B = s_F[1]" — keep back-sight equal to fore-sight and the curve subtracts itself out of every setup | **Accounts** — by designed cancellation, thousands of times per line |
| **River & valley crossings · (unbalanced sights)** | When sights can't be balanced, NGS's supplement to the same manual prescribes an observing routine that corrects "atmospheric refraction, Earth's curvature, pointing and collimation" explicitly — the correction that usually cancels is applied by formula instead | **Accounts** — explicit c&r correction |
| **Reciprocal zenith angles · (trigonometric levelling)** | Two stations observe each other simultaneously; the angle sum exceeds 180° by the arc between them (16.2′ per 30 km) and the leftover scatter calibrates the refraction coefficient k ≈ 0.13 — Gauss did exactly this in Hanover | **Measures** — the excess IS the curvature |
| **Triangulation adjustment · (spherical excess)** | Every large triangle's angles are checked against 180° + Area/R²; Legendre's classical rule — subtract one third of the excess from each measured angle, then solve as a plane triangle — has been the standard workflow since the 1800s | **Both** — measured per triangle, then budgeted out |
| **Distance reduction: · "grid vs ground"** | Every EDM or GNSS distance is multiplied by an *elevation factor* R/(R+h) — reducing the measurement down to the ellipsoid — and a *grid scale factor* onto the map projection; open surveying course texts and provincial technical bulletins walk licensure candidates through the arithmetic, with R = 6,371,000 m sitting in the denominator of every job | **Accounts** — R is in the formula on every project |
| **Map projections & · State Plane zones** | Snyder's USGS *Map Projections — A Working Manual* (PP 1395) is the standard reference: a curved surface cannot be flattened without distortion, so projections manage it and zones are sized to cap the error — the very existence of projection zones is curvature bookkeeping | **Accounts** — the whole discipline exists because of it |
| **GNSS heights: · ellipsoid vs geoid** | Every GPS fix returns height above the WGS-84 *ellipsoid*; NGS procedure requires applying a geoid model to obtain the orthometric height a level would give — two different "heights" that only both exist on a curved, rotating planet with a gravity field | **Measures** — in every RTK fix, everywhere, daily |

A fair challenge for any flat model: reproduce one row. Write the flat-earth levelling manual in which balancing sight distances buys nothing, the flat reduction formula with no R in it that still matches every EDM baseline, or the flat projection with no distortion to manage — and explain why the actual manuals, written by people with no stake in cosmology, all contain the curve.

## 06 · Modern practice, same curve

Today the National Geodetic Survey and its counterparts maintain the reference frame with GNSS networks, and heights still come from geodetic levelling tied to the geoid — the level surface itself. Datums are defined on an ellipsoid because centimetre-level measurements leave no other option; "ellipsoid height" vs "orthometric height" is a distinction that only exists on a curved, rotating planet with a gravity field. Surveyors are, in a precise sense, the profession that measures the flat-earth question every working day — and files the answer as routine paperwork.

[**Experiment 7 · levelling across water** — to do yourself, with every experiment of the site, in “What would refute each model” →](/ai/falsify.md#xp-surv-7)

## The laser, considered as an instrument [evidence: check — Where the radius enters: the 1900 triangulation sides were reduced to sea level on the spheroid, and the corrected radius uses k = 0.13, a coefficient measured with the radius known. The 1977 EDM distances are raw slope distances; without k they give the measured section below.]

**A laser fails on beam width before it fails on refraction, and that part is arithmetic.** A hand-held pointer diverges by one to two milliradians, a surveyor's rotary laser ten times less. At divergence θ the beam is θd wide at range d, so the reading is uncertain by half that either way, while the drop being looked for is d²/2R. Their ratio is **d / θR**, independent of the beam's width at the muzzle. With a 1 mrad pointer the drop does not even equal the beam's half-width until **6.4 km**, and at 10 km, where the drop is 7.9 m, the beam is 10 m across: the instrument's own blur is the size of the effect.

**And the spreading is not symmetric in its consequences.** A beam aimed level from 1.5 m above water is 5 m tall at 5 km, so its lower edge is skimming the surface — the one layer where the temperature gradient is steepest and where ducting occurs. Whatever the centre of the beam does, some ray in it always takes the most strongly bent path available, and that is the ray that arrives. The Brighton test over the sea is the documented case: at the Worthing end its own operators logged the air just above the water half a degree cooler than at 0.5 to 1.5 m, and another degree warmer at 2 m, and still read the beam's arrival as geometry (worked through in the Refraction tab)[13].

> **The remedy is not a better laser.** The question these tests ask — does a horizontal line of sight stay the same height above the surface — needs no beam at all. Three marks at equal height above still water answer it, which is Wallace's 1870 design, and Rainy Lake answered it again in 2018 with targets on ice and a licensed surveyor's differential GPS. A target has no divergence, sits where it is put, and can be measured by someone else afterwards. *Adding a laser adds two failure modes and no information*[14].

> **The correction is not a historical curiosity; it is a checkbox in the firmware of every instrument sold.** Sokkia, Topcon, Leica, Nikon and Trimble all ship total stations whose manuals carry the same pair of terms and the same switch to enable them: subtract d²/2R for the curve, add back k·d²/2R for refraction[15]. A surveyor turning that setting on is not endorsing a cosmology. They are stopping their instrument from being wrong by 8 cm at a kilometre, which is the whole of the argument on this page, sold as a menu item.

**And the reciprocal-angle measurement has been made at ninety kilometres, by a federal agency, on purpose.** In 1977 a crew surveyed seven lines radiating from station BALDY on Mount Livermore, Texas — 70 to 92.8 km — measuring distances by EDM and observing *simultaneous* reciprocal zenith distances at both ends, day and night. The sum of a reciprocal pair measures how far the two plumb lines have splayed apart: γ, and nothing else. The scheme is a NOAA technical report; the crew's own account was put online by the surveyor Jesse Kozlowski[16]. It is the quantity the celestial-theodolite tab reads from a star, measured forty years earlier with a Wild T-3.

**A worked case, with both ends read at the same instant.** In 1977 the National Geodetic Survey observed seven lines around the McDonald Observatory in Texas, 32 to 93 km long, with the two theodolites reading *simultaneously* and the line of sight everywhere more than 30 m above the ground — out of the layer where refraction goes wild. On a plane the two verticals are parallel, so the two zenith angles must sum to **exactly 180°**, with no parameter to adjust. They do not. The sum exceeds 180° in every line, by 16′ at 32 km and by 45′ at 93 km, and it grows with distance.

**The published zenith angles are the only input; every column after the second is recomputed here and agrees to the third decimal with Walter Bislin's independent evaluation[17]. Globe k is the refraction coefficient needed to explain the excess if the verticals diverge by s/R; plane k is what it takes if they do not, and the last column is the temperature gradient that plane k demands.**

| line | ζ₁ + ζ₂ − 180° | globe k | plane k | plane dT/dh |
| --- | --- | --- | --- | --- |
| 32.1 km | +15.9′ | 0.084 | -0.916 | -211 °C/km |
| 39.5 km | +19.3′ | 0.094 | -0.906 | -208 °C/km |
| 52.5 km | +25.2′ | 0.110 | -0.890 | -206 °C/km |
| 66.1 km | +31.6′ | 0.115 | -0.885 | -202 °C/km |
| 74.4 km | +35.5′ | 0.115 | -0.885 | -204 °C/km |
| 77.0 km | +37.1′ | 0.106 | -0.894 | -208 °C/km |
| 92.9 km | +44.6′ | 0.111 | -0.889 | -208 °C/km |

> **Read the last two columns together.** On a globe the excess is the divergence of the verticals minus a small refraction term, and solving for that term gives k between 0.084 and 0.115 — ordinary standard refraction, the same value the refraction tab derives from a lapse rate of a few degrees per kilometre. On a plane the whole excess has to be refraction, and refraction of the wrong sign: light bending *upward*, k ≈ −0.89, which needs air that gets denser with height. The temperature gradient required is about −205 °C per kilometre. Starting from 15 °C at the ground, that reaches absolute zero **1.4 km up**, and it would have to hold at every altitude and over every one of the seven lines at once.

**Every reciprocal pair returns a radius, so ask all of them at once.** The relation needs no extra assumption: ζ₁ + ζ₂ − 180° = (1 − k)·d/R. Divide the distance by the excess and you have the *apparent* radius, the one an instrument reads before any correction; multiply by 1 − k and you have the geometric one. Thirty-two pairs are on file here — the seven NGS lines above and twenty-five from the transcontinental triangulation of 1900, spanning 18 to 157 km[18]. **A plane predicts no radius at all:** it needs the sum to be 180° exactly, which puts R at infinity.

- 32 reciprocal pairs, 18 to 157 kmuncorrected **7156 km** · +12.3 %at k = 0.13 **6226 km** · -2.3 %a plane requires infinity

*Figure caption:* The same thirty-two pairs, read twice. Uncorrected they cluster near 7,150 km, about 12 % high — and that excess is not noise, it is refraction: R/(1 − k) is the effective radius the refraction tab derives from a temperature gradient, arrived at here from theodolites instead. Apply the page's one standard coefficient and the median lands within a few per cent of 6,371 km. Neither box goes anywhere near infinity, which is the only value a plane allows.

## The radius from the instruments alone: no map, no k [evidence: measurement]

**Two theodolites and a distance meter are enough, provided one gives up correcting for the air.** The radius above divides the excess into distances that, for the 1900 lines, had been reduced to sea level on the spheroid, then multiplies by a k that was itself measured with the radius known. Remove both. For the seven McDonald lines, the surveyor Jesse Kozlowski's compilation lists the distance the laser rangefinder actually measured beside the straight chord between the stations' published coordinates. The two agree within 7 cm on every line, where a reduction to sea level would have shortened the measured value by 11 to 35 m: these are raw slope distances[19]. What remains is a length measured on the ground, two angles each read from a local plumb line, and the heights of the stations. The radius enters nowhere.

$$\varepsilon = \zeta_1 + \zeta_2 - 180^\circ$$
$${\rho = \frac{s}{\varepsilon} - \bar h}$$
$$R = (1-k)\,\rho \le \rho \quad\text{if } k \ge 0$$

ε is the angle between the two plumb lines, read directly as the excess of the two zenith angles over 180°; s is the EDM distance; h̄ the mean height of the stations (the radius is solved exactly from the chord, both heights included, which differs from s/ε − h̄ by under 1 km). ρ is the radius of the sphere on which those two plumb lines and that chord fit: the *apparent* radius. It is not R. Refraction lifts each far station, lowers both zenith angles and removes kε from the excess, so ρ = R/(1 − k). Leaving k out cannot create a curvature that is not there; it can only misstate its size.

**The seven McDonald lines, without k. EDM − chord compares the measured distance with the straight line between the stations' coordinates; the coordinates serve that comparison only, never the radius.**

| BALDY → | EDM distance | EDM − chord | ε | Apparent radius ρ |
| --- | --- | --- | --- | --- |
| McElroy | 32.139 km | 2.7 cm | 15.9′ | **6,953 km** |
| Star RM 3 | 39.476 km | 6.8 cm | 19.3′ | **7,028 km** |
| Vieja Reset | 52.518 km | 2.7 cm | 25.2′ | **7,152 km** |
| Beard 2 | 66.128 km | 6.0 cm | 31.6′ | **7,195 km** |
| Dipper | 74.362 km | 4.2 cm | 35.5′ | **7,199 km** |
| Ord 2 RM 3 | 76.957 km | 2.7 cm | 37.1′ | **7,122 km** |
| Eagle 3 | 92.882 km | −5.1 cm | 44.6′ | **7,165 km** |

- 45 of 45 sums above 180°McDonald, > 30 m up: ρ = 6,953 – 7,199 km1.5 m above the ground: median 4,419 km (38 lines)plane: ρ = ∞

*Figure caption:* Forty-five pairs, no correction. The seven McDonald lines, 32 to 93 km long and everywhere more than 30 m above the ground, give 6,953 to 7,199 km: about 12 % above 6,371, the size a k near 0.1 produces. Kozlowski's thirty-eight total-station lines, 70 m to 1.6 km long and read 1.5 m above the ground, scatter from 1,200 to 7,800 km around a median of 4,400: there k is often negative and the apparent globe is smaller[19]. Every one of the 45 sums exceeds 180°.

> **What follows without knowing k.** Refraction raises the far station only while the air thins with height, that is while the temperature falls by less than 34 °C per kilometre, the rate beyond which air is denser above than below and overturns on its own. Then k ≥ 0 and R = (1 − k)ρ cannot exceed ρ. Steeper gradients exist in the first metres over sun-warmed ground, which is where Kozlowski's lines run and why they bound nothing. Along the McDonald lines, more than 30 m up and 32 to 93 km long, they cannot hold from end to end. So the theodolites alone, backed only by a measured length and measured heights, say: **the surface is convex, with a radius of at most about 7,000 km**. A bigger globe than the real one, if one refuses every correction, but a globe.

> **The plane, given its best chance.** Its free parameter is the air. To return these sums it needs light bending upward along all seven lines at once, k ≈ −0.9: air denser at height, the temperature falling by about 205 °C per kilometre (table above). **What would vindicate it:** a long line, well above the ground, read from both ends at once, whose sum stays at 180° or below. None is on file here: of 45 pairs, 45 exceed 180°.

**What this does not do.** It gives ρ, not R: without the temperature gradient along each line, which nobody recorded, k stays unknown and only the bound survives. The theodolites read the plumb lines, which in mountains lean by up to some tens of arcseconds toward the masses; a 20″ difference between the two ends of the 32 km line would move its ρ by 2 %. Whether the 1977 distances received the “second velocity correction” cannot be read from the scan: it uses k and R, and at 93 km it amounts to at most 0.2 m, two parts per million. The 1977 angles and distances are Kozlowski's transcription of a scanned report. On the short lines, rounding each angle to 1″ is a third of a 5″ excess, and much of their spread is that.

## Sixteen hundred triangles on three continents: the curvature from their angles alone [evidence: measurement]

**Gauss's test, run on whole surveys.** Section 02 draws one triangle and computes its excess. Here the excess is read, in the angles as the observers wrote them down: the U.S. Coast and Geodetic Survey's arc along the 39th parallel and its Eastern Oblique Arc[18][20], Delambre and Méchain's meridian from Dunkirk to Barcelona[22], Maclear's arc at the Cape of Good Hope[23], Roy's chain from Greenwich towards Paris[24] and the southern half of Struve's arc, from the Gulf of Finland to the Danube[25]. We transcribed every triangle from the scans, page by page: 1,601 of them. Every printed check had to hold on what we read (sums, corrections, logarithms of the sides, the sine rule), or the triangle is a misprint, verified on the page image and set aside, about twenty of them; triangles with a concluded angle, whose sum is forced, never count. On a sphere of radius R the three angles of a triangle add up to 180° plus its area divided by R²[21]; on a plane they add up to 180° whatever its size.

$$\varepsilon = \alpha_1 + \alpha_2 + \alpha_3 - 180^\circ$$
$${\varepsilon = \frac{A}{R^2}}$$
$$\frac{1}{R^2} = \frac{\sum \varepsilon A}{\sum A^2}$$

α₁, α₂, α₃ are the angles observed at the three stations and ε their excess over 180° (in radians in the second line); A is the triangle's area. The least-squares line through zero gives 1/R². The areas use no radius: each length is carried from a measured base line through the triangles with the observed angles alone, as plane triangles, then Heron's formula. Where a concluded or misprinted angle breaks the chain, 180° minus the two sound angles carries the length on; that triangle never enters the fit.

- 1,458 triangles, 21 misprints set aside, 31 beyond 3σ**R = 6,383 km (16–84 %: 6,375 – 6,393)**with a constant offset of −0.06″: 6,373 kmplane, best offset +3.9″: residuals 8.0″ against 1.30″

**The radius survey by survey. Range: 16 to 84 % of a bootstrap over printed pages (∞: a flat surface is not excluded). Plane: how much larger the flat model's residuals are (χ² ratio), with its best constant offset.**

| Survey | Triangles | R | Range | Plane |
| --- | --- | --- | --- | --- |
| ● 39th parallel, USA (Schott 1900) | 679 | **6,380 km** | 6,372 – 6,389 | × 75.7 |
| ● Eastern Oblique Arc, USA (Schott 1902) | 433 | **6,461 km** | 6,413 – 6,513 | × 8.2 |
| ● Dunkirk–Barcelona (Delambre & Méchain) | 94 | **5,364 km** | 5,123 – 5,596 | × 1.3 |
| ● Cape of Good Hope (Maclear 1866) | 83 | **6,352 km** | 6,295 – 6,421 | × 7.3 |
| ● Greenwich–Paris (Roy 1790) | 12 | **24,471 km** | 7,401 – ∞ | × 1.0 |
| ● Struve arc, Baltic to Danube (1860) | 171 | **6,502 km** | 6,306 – 6,724 | × 1.4 |
| **all together** | 1,458 | **6,383 km** | 6,375 – 6,393 | × 37.5 |

*Figure caption:* Each dot is a triangle, coloured by survey: its observed excess against the square root of its area, roughly its side. The globe's curve is the fitted ε = A/R²; the dashed line is the flat model's best case, a constant offset added to every triangle, which cannot follow the size. The largest triangle, Mount Nebo – Tushar – Wheeler Peak in Utah and Nevada, covers 14,524 km² and exceeds 180° by 75.3″.

*Figure caption:* The same triangles where the surveys' printed positions put them (Roy and Struve print none; where Delambre's printed positions contradict his own sides, the triangle is left out), on the globe and on the azimuthal map centred on the North Pole that flat-Earth maps use. The positions only draw the figure; they enter no number above. On the flat map, with its one scale set as favourably as possible, each side is coloured by its length on the map divided by its measured length: north–south sides come out about 11 % short everywhere, east–west sides up to 7 % long in the United States and more than twice their length at the Cape.

> **What the angles say.** The excess grows with the area, as on a sphere: 0.3″ on average for triangles of about 50 km², 1″ around 200 km², 2.5″ around 500 km², 8″ around 1,700 km², 35″ for the mountain-top triangles of about 7,000 km² in the American West. One line through zero fits them all, in Maine and in California, at the Cape and in Livonia, and its slope gives the radius above. Nothing in the data told the triangles how big the Earth is: the angles were read on the instruments, the lengths come from base lines measured with rods and bars on the ground.

> **The plane, given its best chance.** A plane has no curvature to adjust, but the observers could have had a habit: a constant error in every sum. Fitted as favourably as possible, that offset comes to about +4″ for every triangle, small and large alike; it gives the small triangles too much and the large ones far too little, and leaves residuals about six times larger than the globe's line (reading above). A flat map does no better with the lengths: whatever its scale, it cannot lay the measured sides of the United States and of the Cape on one sheet (figure above). **What would vindicate it:** angle sums that stay at 180° whatever the size of the triangle, or an excess that does not grow with the area.

**What this does not do.** The surveys do not weigh the same. Schott's large western triangles fix the radius; Struve's and Maclear's agree within their spread; Delambre's, small (280 km² on average) and whose sums scatter by about 1.8″ around the line, come out low, 5,364 km; Roy's twelve usable triangles of the 1780s are too small for his angles, read to the second, and only bound the radius from below. The observed angles were first balanced at each station, which uses no figure of the Earth; the corrections that close each triangle on a spheroid are not used. The base lines are printed reduced to sea level, a correction of about one part in a million that uses the radius: the one place it enters, worth a few metres on R. Triangles that share stations are not independent, so each range is a bootstrap that resamples whole printed pages. Plumb lines leaning toward mountains, and the observers' habits, leave a small constant offset, −0.06″ when fitted on all the surveys; with it the radius comes to 6,373 km instead of 6,383. For comparison only, the mean radius of curvature of the ellipsoid is 6,371 to 6,376 km between 35° and 42° N, 6,367 to 6,370 km at the Cape and 6,387 km at 58° N.

**See also**[Distances](/ai/dist.md)[Dip](/ai/dip.md)[Gravity](/ai/grav.md)[GPS](/ai/gps.md)[Azimuth](/ai/azim.md)[Elevation angles](/ai/elev.md)

## Sources for this tab

1. [1] **Training materials:** [NOAA Manual NOS NGS 3, *Geodetic Leveling* (PDF)](https://www.ngs.noaa.gov/PUBS_LIB/GeodeticLeveling_Manual_NOS_NGS_3.pdf) — the U.S. levelling manual; Figure 3-8 is the curvature-cancellation rule quoted above — with the [NGS river/valley crossing supplement (PDF)](https://geodesy.noaa.gov/PUBS_LIB/SupplementToChapter4OfNOAAManualNOSNGS3.pdf) correcting curvature and refraction explicitly for unbalanced sights; [Snyder, *Map Projections — A Working Manual*, USGS Professional Paper 1395 (PDF)](https://pubs.usgs.gov/pp/1395/report.pdf); [the Open Access Surveying Library, "Ground to Grid Conversion"](https://www.jerrymahun.com/index.php/home/open-access/64-xiii-horizontal-coordinate-systems/296-chapter-h-ground-to-grid-conversion) (elevation factor with R in the denominator, as taught to licensure candidates); and a [provincial technical bulletin on scale factors (Nova Scotia, PDF)](https://geonova.novascotia.ca/sites/default/files/resource-library/NSCRSTechSupport%200006_ScaleFactors_Sept2016_v1.1.pdf).
2. [2] [LIGO Lab — Facts](https://www.ligo.caltech.edu/page/facts) ("over the 4 km length of each arm, the Earth curves away by nearly a meter"), the [vacuum-system page](https://www.ligo.caltech.edu/page/vacuum) (GPS-assisted earth-moving to counter the curvature), and the published [precision-alignment paper (LIGO DCC, PDF)](https://dcc.ligo.org/public/0072/P000006/000/P000006-A.pdf) with every design height computed on WGS-84.
3. [3] [NOAA National Geodetic Survey — Geodetic Leveling](https://geodesy.noaa.gov/leveling/); [NGS, "What is geodesy?"](https://www.ngs.noaa.gov/INFO/facts/geodesy.shtml); [NGS Datums & Reference Frames](https://geodesy.noaa.gov/datums/index.shtml); and NOAA's [tutorial on the vertical datum and differential levelling](https://oceanservice.noaa.gov/education/tutorial_geodesy/geo06_vert.html).
4. [4] [Historic UK — the Bedford Level wager](https://www.historic-uk.com/CultureUK/Bedford-Levels-Wager-Flat-Earth/) and [Scientific American on Wallace's experiment](https://www.scientificamerican.com/blog/rosetta-stones/wallace-8217-s-woeful-wager-how-a-founder-of-modern-biology-got-suckered-by-flat-earthers/) — including why Rowbotham's 8-inch sight line measured refraction, not flatness.
5. [5] [IEEE Engineering & Technology History — SLAC milestone](https://ethw.org/Milestones:Stanford_Linear_Accelerator_Center,_1962): laser-aligning the two-mile accelerator straight to twenty-thousandths of an inch.
6. [6] [ETH Zürich — geodesy of the Gotthard Base Tunnel](https://ethz.ch/en/news-and-events/eth-news/news/2016/05/the-role-of-eth-in-the-gotthard-base-tunnel.html): gyrotheodolites, vertical-deflection corrections, and the 8 cm / 1 cm breakthrough.
7. [7] [Hirt et al. (2010), *J. Geophys. Res.*](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067) — the refraction coefficient k ≈ 0.13, from Gauss's Hanover reciprocal observations to modern data.
8. [8] [UNESCO — Struve Geodetic Arc](https://whc.unesco.org/en/list/1187/), with the [National Land Survey of Finland](https://www.maanmittauslaitos.fi/en/struvegeodeticarc) and [Estonia's Land Board on the Arc and degree lengths](https://maaruum.ee/en/maps-geodata-and-addresses/good-know/struve-meridian).
9. [9] [Ordnance Survey — history of the trig pillar](https://www.ordnancesurvey.co.uk/blog/a-history-of-the-trig-pillar), [the retriangulation of Great Britain](https://www.ordnancesurvey.co.uk/blog/trig-pillars-we-salute-you), and the [station archive with the full retriangulation history (PDF)](https://www.ordnancesurvey.co.uk/geodesy-positioning/legacy-data/trig-search).
10. [10] [LNE (French national metrology) — the metre from the Dunkirk–Barcelona meridian](https://metrologie-francaise.lne.fr/en/metrology/history-units).
11. [11] [MacTutor — Willebrord Snell](https://mathshistory.st-andrews.ac.uk/Biographies/Snell/) (the 1615 triangulation) and [MacTutor — Carl Friedrich Gauss](https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/) (the Hanover survey years).
12. [12] ["Observatories" (arXiv history review)](https://arxiv.org/pdf/astro-ph/9902030) — the Paris Observatory's meridian of France and the Peru & Lapland expeditions; and, for the navigation-side view of the same geometry, [Bowditch, *The American Practical Navigator* (NGA)](https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf).
13. [13] [Metabunk — why flat-earth laser tests are misleading](https://www.metabunk.org/threads/why-flat-earth-laser-tests-are-misleading.10625/), the working thread on the Brighton over-sea test, including the operators' own logged temperature difference between 0.5 m and 1.0 m above the water and the reason a level beam always puts light into the strongest-gradient layer. A discussion forum rather than a journal, cited because it documents a specific test and quotes that test's own readings.
14. [14] [New Zealand Space Centre — do laser tests prove the Earth is flat?](https://www.spacecentre.nz/resources/faq/solar-system/earth/flat/laser-test.html) — states the divergence problem plainly and draws the conclusion used above: the easiest way to remove it is to stop using a laser, because the experiment only ever needed an object at a known height.
15. [15] [Surveying instruments — curvature and refraction corrections](https://jessekozlowski.wordpress.com/2020/07/08/surveying-instruments-curvature-refraction-corrections/), a compilation by the surveyor Jesse Kozlowski reproducing the relevant page of five manufacturers' manuals and linking each original: Sokkia iX, Topcon GTS-220, Leica TPS1100, Nikon NPL-322 and the Trimble S series with its Trimble Access calculation notes. The compilation is a blog; the manuals it links are the manufacturers' own documents, and those are what the claim rests on.
16. [16] NOAA Technical Report [NOS 74 NGS 9](https://geodesy.noaa.gov/PUBS_LIB/TRNOS74NGS9.pdf), *Survey of the McDonald Observatory Radial Line Scheme by Relative Lateration Techniques* (June 1978) — the published scheme for the seven long lines described above. Read here only as far as its existence and title: the file is a scan without machine-readable text, so nothing in the paragraph above is quoted from its pages. The operational account — 70 to 92.8 km, simultaneous reciprocal zenith distances, Wild T-3 and helicopter — is Charlie Glover's first-hand recollection as published by Kozlowski at [Very long line EDM and reciprocal zenith angle observations](https://jessekozlowski.wordpress.com/2020/03/24/very-long-line-edm-measurements-reciprocal-zenith-angle-observations/), and is cited as a recollection rather than as a record.
17. [17] W. Bislin, [Determining the shape of the Earth with zenith angle measurements](https://walter.bislins.ch/bloge/index.asp?page=Determining+the+Shape+of+the+Earth+with+Zenith+Angle+Measurements) — the method worked through for both models, and the table this one is built from. The zenith angles themselves are transcribed in the [NGS zenith angle extract](https://walter.bislins.ch/blog/media/2004-04%20Zenith%20Angle%20Measurements%20NGS.pdf) he hosts, which is what makes the 1978 report usable here at all: the report itself is a scan without machine-readable text. His derived coefficients were reproduced independently before anything was published from them.
18. [18] The 1900 set: [USC&GS Special Publication No. 4, *The Transcontinental Triangulation and the American Arc of the Parallel*](https://geodesy.noaa.gov/library/pdfs/Special_Publication_No_4.pdf) (1900), whose reciprocal zenith observations were transcribed and tabulated by W. Bislin at [Refraction at the transcontinental triangulation](https://walter.bislins.ch/bloge/index.asp?page=Refraction+at+the+Transcontinental+Triangulation+of+the+American+Arc+of+Parallel); the twenty-five lines used here are read from that transcription. Recomputing the apparent radii from his zenith angles reproduces his published column to within 0.06 %, the residual being the reduction of distances to sea level, which is not repeated here.
19. [19] J. Kozlowski, [Zenith Angle Projects](https://walter.bislins.ch/blog/media/2004-04%20Zenith%20Angle%20Projects%20Jesse%20Kozlowski.pdf) (PDF, four pages, hosted by W. Bislin; listed on Kozlowski's [Reciprocal zenith angle projects](https://jessekozlowski.wordpress.com/2020/06/09/reciprocal-zenith-angle-projects/)) — one row per observed direction: zenith angle, instrument and target heights, the chord computed from the coordinates (“DELTA XYZ”) and, in its own column, the slope distance measured by EDM. The 1977 McDonald rows give the EDM distance to the millimetre; the 2016–2018 rows are his own total-station observations (Trimble S7 and S8) on NGS calibration baselines and other short lines. Only the measured distances and the angles are used on this page.
20. [20] C. A. Schott, [USC&GS Special Publication No. 7, *The Eastern Oblique Arc of the United States and Osculating Spheroid*](https://geodesy.noaa.gov/library/pdfs/Special_Publication_No_7.pdf) (1902): the observed angles and the sides of every triangle from Maine to the Gulf of Mexico, the six base lines (p. 100) and the positions of the stations. Our transcription, page by page from the scan, with the 1900 volume's triangles [18], is in the project's repository (`data/surv/excess/`), each row checked against the printed corrections, logarithms and sines.
21. [21] C. F. Gauss, [*General Investigations of Curved Surfaces*](https://archive.org/details/generalinvestiga00gaus) (1827; trans. J. C. Morehead and A. M. Hiltebeitel, Princeton, 1902), art. 20: the excess of a geodesic triangle over 180° equals the curvature integrated over its area, A/R² on a sphere. Gauss built the theorem while running the survey of Hanover.
22. [22] J.-B. Delambre and P. Méchain, [*Base du système métrique décimal*](https://doi.org/10.3931/e-rara-11803) (Paris, 1806-1810; ETH-Bibliothek Zürich scan): t. 1 pp. 513-542, the "Tableau général des triangles" with the observed angles; t. 2 p. 56, the bases of Melun (6,075.90 toises) and Perpignan (6,006.25 toises); pp. 800-841, the sides. Our transcription is in the project's repository (`data/surv/excess/delambre/`).
23. [23] T. Maclear, [*Verification and Extension of La Caille's Arc of Meridian at the Cape of Good Hope*](https://archive.org/details/cu31924012313437) (London, 1866): pp. 533-558, the principal and secondary triangles with their observed angles and sums; the Zwartland base, 42,819.065 feet (p. 534); p. 589, the positions of the stations.
24. [24] W. Roy, ["An account of the trigonometrical operation whereby the distance between the meridians of the Royal Observatories of Greenwich and Paris has been determined"](https://archive.org/details/b28763324), *Phil. Trans.* 80 (1790): the calculation of the triangles with their observed angles, the base of Hounslow Heath (27,404.7 feet) and that of Romney Marsh.
25. [25] F. G. W. Struve, [*Arc du méridien de 25° 20′ entre le Danube et la mer Glaciale*](https://archive.org/details/dli.pahar.0518), vol. 1 (St Petersburg, 1860): the six bases (p. 76), tables A, C, D and E of the triangles with their observed angles, sums and excesses (pp. 96-143).

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [The Himalayan Journal — "Mount Everest: its name and height"](https://www.himalayanclub.org/hj/17/14/mount-everest-its-name-and-height): the 1849–50 observations, the 1852 computation, and the refraction and plumb-line-deflection corrections behind 29,002 ft.
- [Reciprocal zenith angle projects](https://jessekozlowski.wordpress.com/2020/06/09/reciprocal-zenith-angle-projects/) — sixteen of them, with the raw sets of direct and reverse readings tabulated, several evaluated independently by Walter Bislin in [Determining the shape of the Earth with zenith angle measurements](http://walter.bislins.ch/bloge/index.asp?page=Determining+the+Shape+of+the+Earth+with+Zenith+Angle+Measurements). Amateur and professional observations mixed, published with their numbers rather than their conclusions, which is the rarest thing in this whole argument.
- [The Rainy Lake experiment (2018)](https://walter.bislins.ch/bloge/index.asp?page=Proof+of+Earth+Curvature%3A+The+Rainy+Lake+Experiment) — Wallace's three-marker design repeated on a frozen lake with every target position fixed to centimetres by differential GPS by a licensed surveyor; the measured surface radius comes out near 6,400 km. The modern answer to “your telescope was miscalibrated”.
- [Suez Canal Authority — canal characteristics](https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalCharacteristics.aspx) — the lock-free length routinely cited as proof of a flat sea. It is the opposite: a canal is dug to a *level*, and a level surface is an equipotential, not a plane. A straight chord between the ends would run hundreds of metres below the water at the midpoint.
- [J. Palmieri on Helbronner's Corsica junction (2010)](http://www.helbronner.org/IMG/pdf/BSSHNC_730-733_Art-_Palmieri_cle8a7d81.pdf) — the source for the two longest triangle sides in the list above: the 1879 Spain–Algeria junction of Perrier and Ibáñez, and Helbronner's own 1925 Coudon–Monte Cinto side of 255.6 km. Both are worked through from the observer's end in tab 1.
- **IGN — RGF93 and the NGF-IGN69 levelling network.** The French equivalents of the NOAA and Ordnance Survey references above: a national horizontal datum computed on an ellipsoid, and a national height system referred to a geoid. For a French reader, the nearest place to check that their own country's survey works the way this tab says surveys work.
- [NOAA NGS — CORS data and products](https://geodesy.noaa.gov/CORS/data.shtml). Continuously operating reference stations, with the raw observation files public. The modern successor to the triangulation networks in the table above, and still solving the same geometry.
