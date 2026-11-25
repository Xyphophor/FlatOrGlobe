# Rockets: what pushes a rocket when there is nothing to push against

> Tab "Rockets" of *Flat plane or Globe?*. Web page: /#tab-rocket. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Rockets · what pushes in empty space*

“A rocket cannot work in space: there is nothing to push against.” “A gas next to a vacuum has no pressure, it just flies apart.” “Free expansion does no work, so the exhaust cannot push anything.” These are the usual reasons given for saying that nothing has ever reached orbit, which would also mean that the satellites of the [Satellites](/ai/sat.md) and [GPS](/ai/gps.md) tabs are not there. This tab answers them with the same balls as the [Atmosphere](/ai/atmo.md) tab: molecules flying about and hitting walls. Every push in the animations below is *measured*, by adding up the hits of the balls on each wall; nothing is drawn from a formula. Nothing here is about the shape of the Earth. It is about whether a rocket can push itself, and the answer, measured since 1916, is that the air only gets in the way.

*[Figure: Animation: gas balls hitting the walls of a closed box, then of a box with a hole, then of a rocket chamber kept full by a fire; the push on the rocket equals the momentum of the jet; the same rocket loses thrust in air; in empty space the centre of mass of rocket and fuel never moves]*

*Figure caption:* **The whole tab in forty-five seconds.** A closed box of gas, whose pushes cancel; the same box with a hole, pushed until it is empty; a chamber kept full by a fire; the push on the rocket, equal to the momentum the jet carries off; the same rocket in air, which pushes less; and a rocket free in space, whose centre of mass, with all its fuel, never moves. The balls are enlarged and much fewer than real molecules. Click to pause.

## Pressure is molecules hitting the walls

**A gas is not a fog that fills space; it is a crowd of molecules flying in straight lines.** Each one bounces off a wall like a ball, and each bounce gives the wall a small kick. Daniel Bernoulli explained pressure this way in 1738, and Maxwell worked out the speeds in 1860[4][5]. At sea level, about 2.9 × 10²³ molecules of air hit each square centimetre every second, each at a few hundred metres per second[6]. The kicks are so many that they add up to a steady push: 10 tonnes on every square metre. In a closed box, every wall is kicked as hard as the wall opposite, so the pushes cancel and the box goes nowhere, however high the pressure. Heat the gas and every molecule goes faster: each kick is harder, and kicks come more often, but they still cancel.

*Figure caption:* **A closed box of gas.** 400 balls fly in straight lines and bounce off the walls. The green arrows are the pushes *measured* on each wall, the total of 2 m v per hit, averaged over a second and a half: 100 on each wall at the start. Halfway, every ball is made √2 times faster, which doubles the temperature: each hit is √2 times harder and √2 times more frequent, and every push doubles. The sum of the four stays at zero, give or take the randomness of the hits. Click to pause.

$${\Delta p = 2 m v_\perp},\qquad p = n\,k\,T = \tfrac{1}{3}\,\rho\,\langle v^2 \rangle$$

**One hit, then billions.** A molecule of mass m hitting a wall at speed v⊥ across it comes back at −v⊥: its momentum changes by 2 m v⊥, and the wall gets the opposite, by Newton's third law[3]. Add up the hits on a square metre for a second and you get the pressure p: n molecules per cubic metre, at temperature T, give p = n k T, with k Boltzmann's constant[15]; ρ is the density and ⟨v²⟩ the mean squared speed. In the RS-25, the main engine of the Space Shuttle, the gas in the chamber is at 206 bar, 204 times the air's pressure, and up to about 3,300 °C[8][10]: 4.2 × 10²⁶ molecules per cubic metre, 16 times as many as in the air we breathe, each much faster. (In the animations the gas is two-dimensional: p = n m ⟨v²⟩/2, a force per unit length.)

## A hole: one wall loses its partner

**Now cut a hole in the bottom.** The molecules that would have hit that piece of the bottom fly out instead. The top is still hit as often as before, but the patch of bottom opposite it is gone. The pushes no longer cancel: the box is pushed upwards, with a force of the order of the pressure times the area of the hole. Nothing outside the box takes part, so there is no difference between a hole in air and a hole in empty space, except that in air some outside molecules come in through the hole and push back. This is a balloon let go: the push lasts as long as there is gas inside. A rocket keeps the gas coming.

*Figure caption:* **The same box, in empty space, with a hole.** After two and a half seconds, the middle 36 % of the bottom is removed. The bottom's measured push drops, the top's does not, and the net push (black arrow, same scale) points up. The balls that leave take that much momentum downward with them: the total kick received by the box and what the balls that left carry off come together. With every ball that leaves, the box empties and the push fades. Click to pause.

$${\vec F = \oint p\,\vec n\,dA}\quad\Rightarrow\quad F = C_F\,p\,A$$

**Add up the pushes all round.** n is the outward direction of each piece of wall dA, and p the pressure on it. Over a closed box the sum is zero: each piece has an opposite piece. Take away a piece of area A at the bottom and the piece of top opposite it is left unbalanced: the box is pushed up by C_F p A, where the factor C_F depends on how the gas flows out. It is ½ for a gas as thin as the animation's, because fewer molecules are left near the hole; about 1.3 for a dense gas leaving at the speed of sound; and up to about 2 with a well-shaped nozzle in a vacuum[7]. That is what nozzles are for.

## Keeping the pressure: fire in, throat out

> **What the videos say.** “Pressure cannot exist next to a vacuum. The vacuum of space would suck the gas out of the chamber at once, so there is never any pressure to push with.”

**A vacuum does not suck.** Empty space has no molecules, so it cannot pull on anything; it only fails to push back. A molecule leaves the chamber when its own flight happens to take it through the opening, and not before. How many leave each second depends on how many there are inside, how fast they go and how large the opening is, never on what lies outside. So the fire makes new gas, the narrow throat lets some out, and the amount inside rises until as much leaves as is made. Then the pressure holds, as the level of a bath holds when the tap fills it as fast as the drain empties it. In a real engine the gas goes through the throat at the speed of sound; nothing that happens downstream can then travel back up to change the chamber at all[7].

*Figure caption:* **A rocket chamber in empty space, starting empty.** The fire (orange band) makes 60 balls a second, in pairs flying in opposite directions, so that burning the fuel adds no push of its own. The curve is the number of balls in the chamber. At first more are made than leave, and it rises; once as many leave as are made, it stays put. After 18 seconds the fire goes out and the chamber empties. The chamber walls are rough: a ball bounces off them in a random direction, which is what collisions with other molecules do in a real gas; the nozzle is smooth. Click to pause.

$${\frac{dN}{dt} = \dot N_{\text{in}} - \frac{N}{\tau}}\quad\Rightarrow\quad N \to \dot N_{\text{in}}\,\tau,\qquad p_c = \frac{\dot m\,c^*}{A_t}$$

**A bath with the tap on.** N is the number of molecules in the chamber, Ṅ_in the number the fire makes each second, and N/τ the number leaving: each molecule has a chance 1/τ per second of finding the opening. N rises until the two match, at Ṅ_in τ. For a real engine the same balance reads p_c = ṁ c*/A_t: the chamber pressure p_c is the mass flow ṁ times a speed c* set by the propellants, divided by the throat area A_t[7]. For the RS-25, 206 bar, 514 kg/s and a throat 0.26 m across give c* ≈ 2.2 km/s[10]. Double the flow and the pressure doubles; the outside pressure appears nowhere.

## The push: Newton's third law, one hit at a time

> **What the videos say.** “Newton's third law needs something to push against. On the ground the exhaust pushes on the air, or on the launch pad. In space there is nothing, so a rocket can do nothing.”

**The rocket pushes on its own gas, and its gas pushes back on the rocket.** That is the pair of forces of the third law[3]: every hit of a molecule on the top of the chamber is a push up on the rocket and an equal push down on the molecule, which then flies down and out. The rocket does not need to push on anything else, any more than a gun needs air to recoil, or a person on a skateboard needs a wall to roll back when they throw a heavy ball. Each second, the rocket gains as much upward momentum as its jet takes downward. The animation adds up both, exactly, from the start.

*Figure caption:* **Where the push comes from.** A rocket held on a stand in empty space, its chamber kept full by the fire. Green arrows: the push measured on each part of the wall, averaged since the start; the top of the chamber is pushed up, the converging walls are pushed down, the two sides push outwards and cancel. Their sum, the black arrow, points up. On the right, that push and the momentum the jet carries off each second through the nozzle exit: the same number, within the scatter of the hits. Below, the exact account since the start: what the rocket received, plus what the balls inside carry, plus what the balls that left carry, is zero, to the last digit, because every bounce gives the wall exactly what it takes from the ball. Click to pause.

$${F = \dot m\,v_e + (p_e - p_a)\,A_e}$$

**The thrust equation of every engine data sheet.** ṁ is the mass of gas leaving each second, vₑ its speed at the nozzle exit, pₑ its pressure there, Aₑ the exit area and pₐ the pressure of the air outside[7]. The first term is the momentum the jet carries off each second; the second is the pressure left over at the exit. The air appears in one place only, with a minus sign: pₐ Aₑ is the air pushing on the outside of the rocket, everywhere except over the exit, where the jet is. In empty space pₐ = 0 and the thrust is largest.

## The air only gets in the way

**If rockets pushed on the air, they would push harder in thicker air.** They do the opposite. Robert Goddard tested it in 1915–1916 at Clark University: he burnt smokeless powder in a small steel chamber with a nozzle, first in air, then inside a tank pumped down to between 1/100 and 1/1,520 of an atmosphere, and read the speed of the gas from the recoil of the chamber[11]. He found “a general tendency for the velocities in vacuo to be larger than those in air”, up to 22 % larger, and concluded that the push “is really a jet of gas having an extremely high velocity, and is not merely an effect of reaction against the air”. When he published in 1919, the *New York Times* wrote that he did not know “the need to have something better than a vacuum against which to react”[1]. The paper printed its correction on 17 July 1969, the day after Apollo 11 left for the Moon: “The Times regrets the error”[2].

*Figure caption:* **The same rocket, the same fire, twice.** Left, in empty space; right, in air (grey balls, cooler and thinner than the gas in the chamber). The air hits the outside of the rocket from every side except over the nozzle exit, where the jet keeps it out, so on balance it pushes the rocket down. The bars give the measured pushes, averaged since the start (over a few seconds the randomness of the hits is as large as the effect), and the prediction of the thrust equation, the push in empty space minus the air pressure times the width of the exit. Because these balls do not collide with each other, the dashed line across the exit stands for the jet: it turns the air back, and what it receives is not counted on the rocket. The air's pressure is 1/37 of the chamber's, chosen so that the loss is like the RS-25's; in the RS-25 it is 1/204. Click to pause.

$${F_{\text{vac}} - F_{\text{sea}} = p_a\,A_e}$$

**The check on a real engine.** NASA gives the RS-25 at full power 2,279 kN of thrust in a vacuum and 1,852 kN at sea level[8]: 23 % more where there is no air. The thrust equation says the difference is only the air's push on the exit area. 427 kN divided by the sea-level pressure, 101.3 kPa, is 4.21 m², a circle 2.32 m across; the nozzle exit of the RS-25 is 2.30 m across[10]. The specific impulses tell the same story: 4.44 km/s of effective exhaust speed in vacuum, 3.59 km/s at sea level[9]. The same engines have run for more than a million seconds on test stands and in flight[8], and upper stages are fired in vacuum chambers built for the purpose, such as NASA's 38-foot In-Space Propulsion Facility in Ohio[14].

**What would have vindicated the objection, stated in advance:** a rocket that gives less push, or none, when the air is pumped away. Every test since Goddard's gives more. The animations are honest about their own limits too: their gas is so thin that the balls never meet, which is why a rough chamber wall and a line across the exit stand in for collisions; a real jet leaves faster and better aligned than these balls do. What does not depend on collisions is the bookkeeping, hit by hit, and that is exact.

## “Free expansion does no work”

> **What the videos say.** “A gas expanding into a vacuum does no work: this is Joule's free expansion, in every thermodynamics textbook. The exhaust leaving a rocket in space is a free expansion, so it can do no work, and the rocket cannot gain any energy from it.”

**Joule's experiment is real, and it says something else.** In 1845 Joule connected a vessel of compressed air to an empty one and opened the tap: the air spread into both, and since nothing outside moved, no work was done on anything outside[12]. Work is a force times a distance moved by the thing pushed. In a free expansion there is no piston, nothing for the gas to push on that moves. A rocket is exactly the piston that free expansion lacks: the gas pushes on the top of the chamber, and the chamber moves. The gas gives the rocket energy before it leaves; once it has left, it does expand freely into space, and that last part indeed pushes nothing. Even at rest on a test stand, where it does no work at all, the rocket still feels its thrust, measured on the stand: force needs no work, only momentum.

$${W = \int p\,dV_{\text{moving}}}:\quad W_{\text{Joule}} = 0,\qquad W_{\text{rocket}} = F\,\Delta x$$

**Work counts only the walls that move.** dV_moving is the volume swept by a wall that moves while the gas pushes on it. Joule's vessels are fixed, so W = 0. The top of a rocket chamber is pushed by the gas with the force F and moves by Δx: the gas does the work F Δx on the rocket. The second law of thermodynamics is not involved: the hot gas becomes a fast, cold jet in the nozzle, which is how every engine turns heat into motion.

## In empty space: the centre of mass never moves

**Throwing mass backwards is enough.** Free in space, a rocket and its fuel start at rest together. Each throw of fuel backwards gives the rocket the opposite momentum: their common centre of mass stays where it was, forever, as Newton showed for any bodies that act only on one another[3]. The rocket goes forward because its fuel goes back, and nothing else is needed. Since the rocket gets lighter with every throw, each throw speeds it up a little more than the last. Tsiolkovsky worked out the total in 1903[13].

*Figure caption:* **A rocket free in space.** It weighs 1 and throws 0.75 of fuel backwards, in 48 throws, each at the same speed u relative to the rocket; then it coasts. The frame is that of the launch. The green cross, the centre of mass of the rocket and of every ball thrown, stays where it was. The speed, computed throw by throw, follows Tsiolkovsky's curve. The last balls, thrown once the rocket goes faster than u, move forward too in this frame, more slowly than the rocket: the rocket does not push on them from behind, it pushes them backward from its own speed. Click to pause.

$${\Delta v = u\,\ln\frac{m_0}{m_1}}$$

**Tsiolkovsky's rocket equation.** u is the exhaust speed relative to the rocket, m₀ its mass full and m₁ its mass empty. Each small throw dm at speed u gives the rocket dv = u dm/m; adding them up gives the logarithm. A rocket with three quarters of its mass as fuel reaches ln 4 = 1.39 u; in 48 separate throws, as in the animation, a little less, 1.36 u. At the RS-25's 4.44 km/s, the 7.9 km/s of a low orbit ([Orbit](/ai/orb.md)) needs m₀/m₁ = 5.9: a rocket 83 % fuel, before counting the air and the climb against gravity, which is why rockets are built in stages that drop their empty tanks.

## The recurring arguments, one by one

**Each argument, the physics that answers it, and what was measured.**

| The argument | The answer | Measured |
| --- | --- | --- |
| Nothing to push against in space | The rocket pushes on its own gas, the gas on the rocket: the third law[3] | Goddard's chamber recoils faster in a vacuum[11] |
| Rockets push on the air | The air pushes the rocket back by pₐ Aₑ[7] | RS-25: 2,279 kN in vacuum, 1,852 kN at sea level[8] |
| No pressure next to a vacuum | A vacuum does not pull; the gas leaves through the throat only as fast as it reaches it | Engines hold 206 bar in their chambers[10] |
| Free expansion does no work | Work needs a moving wall: the rocket is that wall[12] | A thrust is felt even on a fixed test stand[8] |
| So nothing reaches orbit | Δv = u ln(m₀/m₁)[13]: about 83 % fuel for 7.9 km/s | Upper stages fired in vacuum chambers[14] |

**In one sentence:** pressure is molecules hitting walls; a closed chamber cancels its pushes, an opening leaves one push unbalanced, a fire keeps it going, and the gas carries off backwards exactly the momentum the rocket gains forwards. The air adds nothing but a push the wrong way. What rockets have put into orbit is measured in the [Satellites](/ai/sat.md) tab, from the Doppler shift of their signals.

**See also**[Basics](/ai/phys.md)[Atmosphere](/ai/atmo.md)[Orbit](/ai/orb.md)[Satellites](/ai/sat.md)[GPS](/ai/gps.md)[Results](/ai/results.md)

## Sources for this tab

1. [1] “Topics of the Times: A Severe Strain on Credulity”, *The New York Times*, 13 January 1920, p. 12: Goddard “does not know the relation of action to reaction, and of the need to have something better than a vacuum against which to react”.
2. [2] “A Correction”, *The New York Times*, 17 July 1969, p. 43: “it is now definitely established that a rocket can function in a vacuum as well as in an atmosphere. The Times regrets the error.”
3. [3] I. Newton, *Philosophiæ Naturalis Principia Mathematica* (London, 1687), Axioms, Law III: “To every action there is always opposed an equal reaction”, and Corollary IV: the common centre of gravity of bodies acting only on one another does not change its state of motion.
4. [4] D. Bernoulli, *Hydrodynamica* (Strasbourg, 1738), section X: the pressure of an “elastic fluid” as the impacts of its particles on the walls, proportional to their number and to the square of their speed.
5. [5] J. C. Maxwell, “Illustrations of the dynamical theory of gases”, *Philosophical Magazine* 19 (1860) 19–32: the distribution of molecular speeds, and the pressure as the momentum the molecules deliver to a surface.
6. [6] *U.S. Standard Atmosphere, 1976* (NOAA, NASA, USAF, Washington, 1976), table at 0 km: number density 2.547 × 10²⁵ m⁻³, mean molecular speed 458.9 m/s.
7. [7] G. P. Sutton, O. Biblarz, *Rocket Propulsion Elements*, 9th edition (Wiley, 2017), chapters 2–3: the thrust F = ṁ vₑ + (pₑ − pₐ) Aₑ, the choked throat, the characteristic velocity c* = p_c A_t / ṁ.
8. [8] NASA Marshall Space Flight Center, “Space Launch System RS-25 Core Stage Engine”, NASA Facts FS-2020-10-42-MSFC (2020): thrust 512,300 lbf in vacuum and 416,300 lbf at sea level at 109 % power; operating temperatures up to +6,000 °F; more than 3,000 starts and 1 million seconds of test and flight firing.
9. [9] Aerojet Rocketdyne (L3Harris), RS-25 engine specification sheet (2023): specific impulse 452.3 s in vacuum and 366 s at sea level at 109 % power.
10. [10] “RS-25”, *Wikipedia* (consulted 27 October 2026): chamber pressure 20.64 MPa (2,994 psi), mass flow 514.49 kg/s; nozzle throat 10.3 in (0.26 m) and exit 90.7 in (2.30 m) in diameter.
11. [11] R. H. Goddard, “A Method of Reaching Extreme Altitudes”, *Smithsonian Miscellaneous Collections* 71, no. 2 (1919): smokeless powder burnt in steel chambers with De Laval nozzles, at Clark University in 1915–1916, in air and in a tank pumped down to between 7.6 and 0.5 mm of mercury, the speed of the gas read from the recoil of the chamber; “a general tendency for the velocities in vacuo to be larger than those in air”, 22 % larger for one powder and nozzle; best reliable speed in vacuo 2.34 km/s; “the phenomenon is really a jet of gas having an extremely high velocity, and is not merely an effect of reaction against the air”.
12. [12] J. P. Joule, “On the changes of temperature produced by the rarefaction and condensation of air”, *Philosophical Magazine* 26 (1845) 369–383: air let into an evacuated vessel does no external work and its temperature, taken as a whole, does not change.
13. [13] K. E. Tsiolkovsky, “Исследование мировых пространств реактивными приборами” (Exploration of outer space by means of reaction devices), *Научное обозрение* 5 (1903): the speed of a rocket from its exhaust speed and the ratio of its masses, Δv = u ln(m₀/m₁).
14. [14] NASA Glenn Research Center, “In-Space Propulsion Facility” (Neil Armstrong Test Facility, Sandusky, Ohio; formerly B-2, built 1968): a vacuum chamber 38 ft across and 62 ft high for hot-firing full-scale upper stages and engines in simulated space conditions; more than 100 firings of RL10 engines for Centaur, 80 of the RL10 for Delta III.
15. [15] E. Tiesinga et al., “CODATA recommended values of the fundamental physical constants: 2018”, *Reviews of Modern Physics* 93 (2021) 025010: the Boltzmann constant k = 1.380649 × 10⁻²³ J/K (exact).
