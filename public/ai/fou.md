# A weight on a wire measures the angle between your floor and the axis of the world

> Tab "Foucault" of *Flat plane or Globe?*. Web page: /#tab-fou. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Foucault · the sine that gives away the sphere*

*Figure caption:* **Only the part of Ω square to your floor can turn a swing plane.** All of it at every station on a spinning disc; none at the equator on a globe, reversed past it. Dashed: below the floor. The disc is lent a daily spin here — the flat model as usually held has none, and predicts no precession anywhere.

In February 1851 Léon Foucault hung a 67 m wire from the dome of the Panthéon, tied a 28 kg brass bob to the end, burned the cord holding it aside, and let Paris watch its own floor turn. The demonstration is famous for proving that the Earth rotates. That is the smaller half of what it does.

The plane of swing turns at **15.041°/h × sin(latitude)** — and that sine is not about rotation at all. It is a statement about the angle between the local vertical and the axis of spin, measured separately at every latitude, and it is the sharpest shape test on this page that needs no distant object, no clear air and no horizon.

*Figure caption:* **Watch it first.** A real Foucault pendulum, filmed: the slow turning of the plane of swing that the rest of this page puts into numbers. Chosen by [Xyphophor](https://x.com/Xyphophor). [Foucault's Pendulum: Watch the world turn.](https://www.youtube.com/watch?v=M8rrWUUlZ_U), [The Gentleman Physicist](https://www.youtube.com/@TheGentlemanPhysicis) on YouTube.

$$\omega = \Omega\sin\varphi$$
$$T = \frac{23^{\mathrm{h}}56^{\mathrm{m}}04^{\mathrm{s}}}{\sin\varphi}$$
$${\Omega = 15.041\ ^\circ/\text{h}}$$

Ω is one turn per *sidereal* day — relative to the stars, not the Sun. φ is your latitude, signed: positive north, negative south. Read the formula as a prediction machine rather than a result. It says the swing plane turns clockwise in the northern hemisphere, anticlockwise in the southern, and *not at all* on the equator. A flat Earth spinning once a day predicts the same rate everywhere with the same sense; a flat Earth that does not spin predicts zero everywhere. All three are testable in an afternoon with a stairwell.

## What a pendulum on a turning floor actually does

A pendulum hung so that its pivot cannot transmit twist has nothing to tell it which way to swing. Once it is moving in a plane, the only forces on it are gravity, which acts along the wire and in the plane, and the wire's tension, likewise. Nothing pushes it sideways. In an inertial frame the plane therefore stays put — and the floor, the building and the city underneath rotate past it. What the visitor sees as the pendulum turning is the room turning.

Foucault said exactly this in four pages to the Académie des sciences on 3 February 1851, presented by Arago. His point was not the physics, which was old, but that the effect could be *seen*: the swing plane, he wrote, moves gradually from east to west, giving a perceptible sign of the diurnal motion of the terrestrial globe.[1] He had already built a 2 m version in his cellar in January and an 11 m one at the Paris Observatory in February; the Panthéon wire was the third and the one that made the newspapers.

> **Concede this immediately.** A single Foucault pendulum, observed at one place, does *not* prove the Earth is a sphere. It proves that the frame you are standing in is rotating — nothing more. A flat disc spinning once a day would also make a pendulum precess. Anyone who tells you one pendulum settles the shape of the world is overselling, and the overselling is what gives the objection its bite. The shape argument lives entirely in the *sine*: in how the rate changes when you carry the pendulum somewhere else. That is what the rest of this tab is about.

- φ = **48.85°**
- Ω sin φ = **11.325 °/h** clockwise
- elapsed **0.00 h** simulated
- plane has turned **0.0°**
- drawing: floor held still

*Figure caption:* **The same motion, drawn twice.** Looking straight down at the floor. Nothing about the pendulum changes between the two buttons; only the choice of what to nail to the screen. Set the latitude to 0° and both pictures go inert, because sin 0 = 0. One honest caveat on the naming: at the pole the swing frame really is the frame of the stars, but at any other latitude it is the frame the plane is *parallel-transported* in. Swing rate and time are both scaled, the factors are printed on the figure, and the angle the plane sweeps is real.

## Where the sine comes from

The Earth turns about a single axis, at a single rate. Stand anywhere on it and that rotation vector **Ω** can be split into two pieces relative to *your* local vertical: a component along the vertical, of size Ω sin φ, and a component along the local horizontal pointing north, of size Ω cos φ. Only the vertical component can turn a horizontal swing plane. The horizontal component tries to tip the plane out of horizontal, and gravity and the wire will not let it — to first order it does nothing at all.[2]

$$\Omega_{\text{vertical}} = \Omega\sin\varphi$$
$$\Omega_{\text{horizontal}} = \Omega\cos\varphi$$

At the pole the axis *is* the local vertical: sin φ = 1, and the floor turns a full circle under the pendulum in one sidereal day. At the equator the axis is horizontal: sin φ = 0, and the swing plane does not turn even though the Earth is rotating as fast there as anywhere — faster, in fact, measured in kilometres per hour. In between you get the sine, and its sign flips when you cross the equator because the local vertical flips relative to the axis.

*Figure caption:* **One rotation vector, three floors.** Ω is the same arrow everywhere — same direction, same length, parallel to the axis. What changes from place to place is your floor. Near the pole the arrow is almost straight up out of the floor and nearly all of it counts; near the equator it lies almost flat in the floor and almost none of it does. The vertical piece, drawn in teal, is Ω sin φ, and it is the whole of the precession rate.

*Figure caption:* **What you actually watch.** The bob's track over six hours at the latitude of Paris, drawn in the frame of the floor. The swing plane creeps round at 11.3° per hour, so the star pattern closes up after about 32 hours. The narrow ellipse is exaggerated here to make successive swings distinguishable; in a well-started pendulum it is the thing you spend all your effort making smaller, for reasons three sections below.

## Why the sine is a statement about a sphere, not about spinning

Here is the part that turns a rotation demo into a geometry measurement. Forget forces and watch the swing direction as a little arrow lying flat on the ground, carried once around a circle of latitude as the day passes. The arrow is never twisted about the vertical — there is nothing to twist it. In differential geometry that is exactly the definition of **parallel transport**, and the striking fact about parallel transport on a curved surface is that an arrow carried around a closed loop comes back *rotated*.

The amount it comes back rotated is the solid angle enclosed by the loop. For a circle of latitude φ on a sphere that solid angle is 2π(1 − sin φ), so after one full day the arrow has slipped by 2π sin φ relative to the ground — which is the Foucault rate, obtained with no dynamics whatsoever.[3] It is the same mathematical creature as Berry's phase in quantum mechanics, and the pendulum is its oldest instrument.[5]

> **The sentence that matters.** Parallel transport around a closed loop produces a mismatch only if the surface is *curved*; on a flat surface the arrow comes home pointing exactly where it started. So the Foucault mismatch is not only evidence of rotation — it measures the Gaussian curvature enclosed by the pendulum's daily path. One review of the geometry puts it plainly: the conventional reading is that the pendulum shows the Earth rotates, the geometric reading that it shows the Earth is a sphere.[4] Another derives the result as a special case of Gauss–Bonnet: the pendulum shows that the planet turns and that it is curved.[3]

There is a homelier way to say it. A pendulum measures the angle between your floor and the axis of the world. Carry it around and you are mapping the direction of the local vertical over the whole surface. If the verticals all point the same way, the surface is flat and every pendulum agrees. If the verticals fan out as sin φ, the surface is a sphere and every pendulum disagrees with its neighbour by precisely the amount the sphere requires. Two centuries of pendulums have disagreed in exactly that pattern.

## Three models, three different predictions [evidence: prediction]

The flat model is not one claim but two, and both are on the table in flat-earth discussion, so both get a column. Either the Earth does not rotate — in which case a free pendulum has no reason to precess anywhere — or it is a disc spinning once a day about the pole at its centre. On such a disc the local vertical is parallel to the spin axis at every single point, so sin φ is effectively 1 everywhere: every pendulum, from the middle to the rim, precesses at the full 15.041°/h, all turning the same way.

**Predicted precession of the swing plane — every number computed from the three models, none fitted**

| Latitude | Globe: Ω sin φ | Globe: full turn | Flat, not rotating | Flat disc, 1 turn/day |
| --- | --- | --- | --- | --- |
| **90°** · geographic North Pole | **15.041 °/h** · clockwise | 23 h 56 m | 0.000 °/h · never | 15.041 °/h · 23 h 56 m · same sense |
| **60°** · Oslo, St Petersburg, Anchorage | **13.026 °/h** · clockwise | 27 h 38 m | 0.000 °/h · never | 15.041 °/h · 23 h 56 m · same sense |
| **48.8462°** · Paris — the Panthéon | **11.325 °/h** · clockwise | 31 h 47 m | 0.000 °/h · never | 15.041 °/h · 23 h 56 m · same sense |
| **30°** · Cairo, New Orleans | **7.521 °/h** · clockwise | 47 h 52 m | 0.000 °/h · never | 15.041 °/h · 23 h 56 m · same sense |
| **0°** · the equator | **0.000 °/h** · — | never | 0.000 °/h · never | 15.041 °/h · 23 h 56 m · same sense |
| **−37.8100°** · Melbourne | **−9.221 °/h** · anticlockwise | 39 h 03 m | 0.000 °/h · never | 15.041 °/h · 23 h 56 m · same sense |
| **−90°** · geographic South Pole | **−15.041 °/h** · anticlockwise | 23 h 56 m | 0.000 °/h · never | 15.041 °/h · 23 h 56 m · same sense |

> **Three predictions, and the data picks one.** A pendulum at Paris precesses at all, which finishes the non-rotating flat model on its first afternoon. The pendulum run at the geographic South Pole in 2001 precessed the *other way* from every northern installation — which finishes the spinning disc, since a disc turning one way cannot make a swing plane turn the other way anywhere on it. The disc also owes an explanation for the equator, where the globe says the rate falls to exactly zero. This is a **sign and zero-crossing** test: no adjustable parameter puts a zero at the equator and a reversal south of it, except being on a sphere.

*Figure caption:* **The whole argument in one curve.** Precession rate against latitude for the three models. The globe's sine crosses zero at the equator and changes sign; the spinning disc is a horizontal line at the full rotation rate; the stationary flat Earth is the axis itself. Dots mark installations whose latitude is listed in the table below. Any single pendulum sits on one dot and cannot distinguish the models on its own — the argument is the shape of the curve those dots lie on.

## Installations, and what they were measured to do [evidence: check — Where the radius enters: published rates set against sin φ; fine as a test, no radius comes out of it.]

Below are five installations at widely separated latitudes, with the rate the globe model predicts from the latitude alone. Two of them carry a measured value from a published account. The most useful of those is the one taken as close to a pole as anyone has managed: in the winter of 2001 four researchers hung a 33 m wire with a 25 kg bob down a six-storey stairwell of the station then under construction at the geographic South Pole, at −68 °C, and marked the apex of the swing on the floor every twenty minutes for a day.

**Documented Foucault installations — predicted rate computed from latitude, measured values as published**

| Site | Latitude | Wire | Predicted rate | Predicted full turn | Measured |
| --- | --- | --- | --- | --- | --- |
| Panthéon, Paris (France) | 48.8462° | 67 m | **11.33 °/h** clockwise | 31 h 47 m | ≈ 11 °/h (Foucault, 1851) |
| Museum of Science and Industry, Chicago | 41.7912° | — | **10.02 °/h** clockwise | 35 h 55 m | — |
| United Nations Headquarters, New York | 40.7489° | ≈ 23 m | **9.82 °/h** clockwise | 36 h 40 m | — |
| Griffith Observatory, Los Angeles | 34.1184° | ≈ 12 m | **8.44 °/h** clockwise | 42 h 40 m | — |
| Amundsen–Scott Station, South Pole | −90.0000° | 33 m | **−15.04 °/h** anticlockwise | 23 h 56 m | 24 h ± 50 m for a full turn, sense reversed |

They found the plane turning 5° every twenty minutes, giving a full turn in **24 hours ± 50 minutes** against a prediction of 23 h 56 m, and — the detail that matters more than the number — turning *reversed* with respect to every northern installation — exactly the sign change the sine demands once φ goes negative.[6] They also got a bonus: timing the swing gave g = 9.85 ± 0.03 m/s², which is the polar value, and which nobody was trying to fit.

## The experiment is genuinely hard, and pretending otherwise helps nobody

A real pendulum has a systematic error that can swamp the effect, and it is worth knowing about before someone presents it to you as a scandal. If the bob traces even a very thin *ellipse* rather than a straight line, the ellipse itself precesses, for reasons that have nothing to do with the Earth. George Airy worked out the rate in 1851, and it is proportional to the area of the ellipse:

$$\omega_{\text{Airy}} = \frac{3}{8}\cdot\frac{a\,b}{L^2}\cdot\sqrt{\frac{g}{L}}$$

a and b are the semi-axes of the ellipse, L the wire length. The precession runs in whichever direction the bob is going round its ellipse. Put in the Panthéon's numbers — L = 67 m, a 3 m swing, and an ellipse just **1 cm** wide — and you get 0.198°/h, about 1.7% of Foucault's 11.3. Now shorten the wire to 5 m with a 0.5 m swing and the same 1 cm of ellipse: 21.7°/h, roughly twice the real signal and pointing wherever your release happened to point. The rate falls off as L^−5/2. That, and not showmanship, is why Foucault wanted 67 metres of it.[7]

This is why the ritual matters: the bob is drawn aside with a thread, allowed to settle completely, and the thread is *burned* rather than cut, so that no sideways impulse is given at release. Museums that must run unattended for years add a **Charron ring** — a small ring below the pivot that the wire brushes near the end of each swing, bleeding away the elliptical component while leaving the planar one alone. Both are corrections for a known, calculable, signed error. Neither is a thumb on the scale, and the reason lies in the last line of this section.

> **The error has a tell, and it is a good one.** The Airy precession follows the direction the bob circulates its ellipse — start it the other way round and it reverses. The Coriolis precession does not care how you released it: at a given latitude it is the same rate in the same direction every time. So anyone can separate them in an afternoon: release the bob a dozen times with deliberately opposite ellipses and average; whatever survives is the Earth. A modern study measuring both on a 4.8 m pendulum finds exactly the interplay the formulas predict, down to amplitudes at which the two cancel and the precession stops.[7]

## Six objections, answered with numbers

### 1. "It only shows rotation, so it says nothing about shape."

Correct for one pendulum, as the first callout of this tab states. Wrong for two. The rate depends on latitude as sin φ, which is the projection of a fixed axis onto a local vertical that changes direction from place to place — and a vertical that changes direction from place to place is what a curved surface *is*. On a flat surface, however it moves, every local vertical is parallel to every other, so every pendulum must run at the same rate. They do not.

### 2. "Museum pendulums are driven by an electromagnet, so the museum sets the rate."

The drive is a ring or coil mounted on the vertical axis, directly under the pivot point, and it is *axially symmetric*: it pulls the bob along the line it is already travelling, replacing energy lost to air, and by symmetry it exerts no torque about the vertical. It cannot set a direction it does not know. And the claim is testable rather than arguable: if drives set the rate, driven pendulums would show a rate characteristic of their drives rather than of their latitudes. Instead they show sin φ. Foucault's own pendulum had no drive at all, and neither did the South Pole one — it was restarted by hand every couple of hours as the swing died.[6]

### 3. "Even Airy called it a fraud."

He did, in private correspondence, before attending a single demonstration — and his stated objection was that starting a pendulum swinging in a true plane is extremely difficult. On that narrow point he was *right*, which is the whole of the previous section. What he was wrong about is whether the difficulty is insuperable, and that was settled by burning threads, Charron rings, longer wires and averaging over opposite releases. An 1851 objection to experimental technique is not an outstanding objection to a result reproduced for 175 years on every continent including Antarctica.

### 4. "The South Pole team kept adjusting until they got the answer they wanted."

They did rebuild the apparatus twice, and they say so themselves, in print, in the same account that reports the result — which is already a strange way to run a fraud.[6] Look at what the two failures were. First, they hung the bob with its long axis vertical, and air resistance on it spun the whole pendulum; second, they got a rate twice the expected one. Both are recognised apparatus faults with recognised fixes, and both were diagnosed before the final run rather than explained afterwards. Set against that: the same apparatus returned g = 9.85 ± 0.03 m/s², a quantity nobody was steering, and it landed on the polar value. Debugging an instrument until it stops lying is what experimental work consists of; the question to ask is whether the diagnosis was independent of the wanted answer, and here it demonstrably was.

### 5. "Coriolis is a fictitious force, so it cannot do anything."

"Fictitious" is a technical term meaning "an artefact of describing motion in an accelerating frame", not "imaginary". The pendulum is the instrument that detects that your frame is accelerating. Complaining that the force is fictitious is complaining that the experiment worked. In the frame of the stars there is no Coriolis force and no puzzle: the plane sits still and the building turns.

### 6. "Air currents, building sway, a twisting wire."

All real, all present, and none of them latitude-aware. A draught in Chicago does not know it should produce 10.02°/h while an identical draught in Melbourne produces −9.22°/h and one in Quito produces zero. Systematic errors that happen to reproduce sin φ across a hundred independent buildings, built by people who never met, are not systematic errors. They are the signal.

Experiment 1d · Foucault pendulum

Find a stairwell, and measure the angle between your floor and the axis of the world

This is the rare shape test you can run indoors, alone, at night, with hardware from a builders' merchant. Hang the heaviest compact mass you can from the longest wire your building allows, on a pivot that cannot transmit twist. Draw the bob aside with a thread, wait until it is dead still, burn the thread. Mark the apex of the swing on the floor every twenty minutes. The calculator below tells you before you start whether your stairwell is tall enough for the answer to mean anything.

Independent variable
**What you change:** your **latitude** — ideally by persuading someone at a very different one to repeat it. A second site is what converts a rotation demo into a shape measurement.

Dependent variable
**What you measure:** the **angle the swing plane turns** in a measured time, and its **sense**. The sense alone already separates the three models if you can get south of the equator.

Pendulum period T₀ = 2π√(L/g) = **6.95 s** · 1,554 swings in 3 h
Globe predicts: **11.325 °/h** clockwise · full turn in 31 h 47 m · **34.0°** in 3 h
Flat disc predicts: 15.041 °/h · **45.1°** in 3 h
Flat, not rotating: 0.0° in 3 h, and in any other number of hours
Airy ellipse precession = **2.428 °/h** — 21% of the globe signal
Ellipse you can tolerate for a 10% error: **0.47 cm** half-width

**This is a viable site.** Airy's term sits at 21% of the signal, so after 3 h the globe says the plane has turned 34.0° clockwise while a disc spinning once a day says 45.1° — a gap of 11°, far larger than anything a chalk mark can blur. Run it twice with opposite ellipses and average, and the residue is the Earth.

A caveat this page owes you. The sin φ law is first-order. A full treatment carries small corrections — the pendulum's own amplitude, the fact that the precession is not perfectly uniform through a single swing, the ellipticity of the Earth changing the direction of the local vertical by up to about 11′ between geodetic and geocentric latitude, and, at the level of parts in 10^9, frame dragging. None of them approaches the size of the effect being argued about here: the difference between the globe and the spinning-disc prediction at Paris is 3.7°/h, roughly a quarter of the whole rotation rate, while every correction just listed is smaller than the width of a chalk mark.

The through-line. Every other tab on this page tests the shape of the Earth by looking at something far away — a mountain, a horizon, a star, a satellite — and therefore has to argue about the air in between. This one does not. There is no sightline, no refraction, no atmosphere in the argument at all; the instrument is a weight on a string in a stairwell, and the quantity it reports is the orientation of your own floor. That is why it belongs beside the optical tabs rather than among them: it is the same conclusion reached with none of the same assumptions.

**See also**[Cel. nav.](/ai/cnav.md)[Sun](/ai/sun.md)[Gravity](/ai/grav.md)

## Sources for this tab

1. [1] [1][L. Foucault, "Démonstration physique du mouvement de rotation de la Terre au moyen du pendule", *Comptes rendus de l'Académie des sciences* 32, 135–138 (1851)](https://fr.wikisource.org/wiki/D%C3%A9monstration_physique_du_mouvement_de_rotation_de_la_Terre_au_moyen_du_pendule) — the original four-page note, read for Foucault by Arago on 3 February 1851; full text, in French, on Wikisource.
2. [2] [2][J. Wolfe, *The Foucault pendulum — the physics and maths involved* (Physclips, University of New South Wales)](https://www.phys.unsw.edu.au/~jw/pendulumdetails.html) — the full derivation from the rotating-frame equations of motion, including why only the vertical component of Ω turns the swing plane and why the precession is not perfectly uniform within one swing.
3. [3] [3][O. Stoytchev, "From Foucault's Pendulum to the Gauss–Bonnet Theorem", arXiv:1701.01666](https://arxiv.org/pdf/1701.01666) — derives the 2π(1 − sin φ) solid angle by the tangent-cone construction and states plainly that the pendulum reports not only that the Earth rotates but that it is curved.
4. [4] [4][J. E. Avron, "Topological quantum numbers in the Hall effect", arXiv:math-ph/0303055](https://arxiv.org/pdf/math-ph/0303055) — treats the pendulum as parallel transport round a latitude circle and notes that the geometric reading of the 2π sin φ mismatch is a demonstration that the Earth is a sphere.
5. [5] [5][M. von Bergmann & H. von Bergmann, "Foucault pendulum through basic geometry", *American Journal of Physics* 75, 888 (2007)](https://doi.org/10.1119/1.2757623) — the same geometry without calculus, and the link from the pendulum to Berry's phase.
6. [6] [6][J. Bird, J. McCallum, M. Town & R. A. Baker, *South Pole Foucault Pendulum*, Amundsen–Scott Station, winter 2001](https://www.southpolestation.com/trivia/00s/southpolefoucault.html) — the participants' own account: 33 m wire, 25 kg bob, −68 °C, 5° per 20 minutes, a full turn in 24 h ± 50 min, a sense of rotation reversed from northern installations, g = 9.85 ± 0.03 m/s², and a frank description of the two rebuilds.
7. [7] [7][N. N. Salva & H. R. Salva, "Interplay between Airy and Coriolis precessions in a real Foucault pendulum", arXiv:2502.12230](https://arxiv.org/pdf/2502.12230) — Airy's elliptical precession and the Coriolis precession computed together and measured on a 4.8 m test pendulum, including the amplitudes at which the two cancel and precession stops altogether.

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [B. F. Bayman & others, "An Alternative Treatment of the Foucault Pendulum", arXiv:2207.04135](https://arxiv.org/pdf/2207.04135) — a derivation that avoids the usual rotating-frame machinery, with a bibliography of the standard textbook treatments (Goldstein, Landau & Lifshitz, Fetter & Walecka) for anyone who wants the classical route.
- [P. Lauginie, "Le pendule de Foucault", *CultureSciences-Physique* (ENS de Lyon)](https://culturesciencesphysique.ens-lyon.fr/ressource/Pendule-Foucault-4_Lauginie.xml) — a detailed French-language treatment of the experiment, its history and its analysis, with the Foucault bibliography including the 1878 *Recueil des travaux scientifiques*.
- [A. Venaille & P. Delplace, "From the geometry of Foucault pendulum to the topology of planetary waves", arXiv:2006.08488](https://arxiv.org/pdf/2006.08488) — the parallel-transport picture set out carefully, then carried over to atmospheric and oceanic waves; useful for seeing that the pendulum's geometry is not an isolated curiosity.
- **Musée des Arts et Métiers, Paris.** The original 1851 bob hangs there and a pendulum runs in the former priory church. Foucault's experiment is one of the few on this page you can watch in person for the price of a museum ticket, in the building where it was repeated for the public in 1851.
