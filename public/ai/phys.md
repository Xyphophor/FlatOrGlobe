# The physics: units, motion, frames of reference, Newton's laws, waves and the constants

> Tab "Physics" of *Flat plane or Globe?*. Web page: /#tab-phys. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Physics · the physics the other tabs use*

The other tabs use words like *inertial frame*, *angular velocity*, *GM* or *Coriolis* without stopping to define them. This tab gathers those definitions in one place, each with its formula and a figure, and says where on the site it is used. The mathematics they rest on, angles, vectors, derivatives, uncertainties and fitting, is in the [Math](/ai/math.md) tab. Nothing here is a measurement, and nothing here takes sides: Newton's laws and the units are the same tools for both models, and any model of the Earth has to obey them.

## Quantities, units and orders of magnitude

**A quantity is a number times a unit.** “6,371 km” says how many times the kilometre fits in the Earth's radius; the number alone means nothing. Since 20 May 2019 the seven base units of the International System (SI) are no longer defined by objects (the platinum kilogram in Sèvres) but by fixing the value of seven constants of nature[1]: the second by the frequency of the caesium atom, the metre by the speed of light, the kilogram by Planck's constant, and so on. Large and small numbers are written in scientific notation: 6.371 × 10⁶ m, 7.29 × 10⁻⁵ rad/s. The exponent counts the places the decimal point moves, so its *order of magnitude* is read at a glance.

**The seven SI base units and the constant that fixes each one since 2019[1]; and the prefixes the site uses.**

| Quantity | Unit | Fixed by |
| --- | --- | --- |
| time | second (s) | caesium-133 frequency Δν_Cs = 9 192 631 770 Hz |
| length | metre (m) | speed of light c = 299 792 458 m/s |
| mass | kilogram (kg) | Planck's constant h |
| electric current | ampere (A) | elementary charge e |
| temperature | kelvin (K) | Boltzmann's constant k_B |
| amount of substance | mole (mol) | Avogadro's number N_A |
| luminous intensity | candela (cd) | luminous efficacy K_cd = 683 lm/W |
| **Prefixes: n (nano) 10⁻⁹ · µ (micro) 10⁻⁶ · m (milli) 10⁻³ · k (kilo) 10³ · M (mega) 10⁶ · G (giga) 10⁹** | | |

## Position, velocity, acceleration

**Kinematics describes motion without asking what causes it.** A body's position x is measured from an origin chosen by the observer; its velocity v is how fast x changes, its acceleration a how fast v changes. All three are *vectors*: they have a size and a direction, and adding two of them means putting them end to end ([Math](/ai/math.md#math-h2vec), vectors). A speed of 900 km/h going east and the same speed going west are two different velocities.

$${\bar v = \frac{\Delta x}{\Delta t} = \frac{x_2 - x_1}{t_2 - t_1}},\qquad \bar a = \frac{\Delta v}{\Delta t}$$

Δ (delta) means “the change in”: Δx is the distance covered between two instants, Δt the time between them. Their ratio is the *mean* velocity over that interval: on a graph of x against t, the slope of the straight chord joining the two points.

$${\vec v = (v_x,\ v_y)},\qquad |\vec v| = \sqrt{v_x^2 + v_y^2},\qquad \vec v_{\text{total}} = \vec v_1 + \vec v_2$$

An arrow over a letter marks a vector. It splits into components along the axes, and its length, the *magnitude*, follows from Pythagoras. An airliner's ground speed is its airspeed plus the wind, added as arrows: that is the [Aviation](/ai/avia.md) tab's triangle of velocities.

## Frames of reference

**A frame of reference is an observer with axes and a clock.** Positions, velocities and accelerations only have a value relative to one. A frame is *inertial* when a body on which no force acts moves in a straight line at constant speed, or stays at rest: Newton's laws hold there as written. Galileo noticed in 1632 that, in the closed cabin of a ship sailing smoothly, flies, fish in a bowl and dripping water behave exactly as on land: no experiment inside can tell a uniform motion from rest[3]. Any frame moving at constant velocity relative to an inertial frame is itself inertial.

*Figure caption:* **Galileo Galilei** 1564–1642
[Justus Sustermans, c. 1640 (National Maritime Museum, London)](https://commons.wikimedia.org/wiki/File:Galileo.arp.300pix.jpg)

$${x\prime = x - V t},\qquad v\prime = v - V,\qquad a\prime = a$$

**Galilean change of frame.** A train moves at constant speed V along the platform. Positions and velocities measured on board (primed) differ from those measured on the platform, but accelerations are the same: V is constant, so it vanishes when differentiated. Forces, which give accelerations, are therefore the same in every inertial frame. That is why a smooth motion cannot be felt, and why “I would feel the Earth move” is not an argument: what is felt is acceleration, not speed.

**A rotating frame is not inertial.** On a merry-go-round, a ball rolled straight across seems to curve, and a passenger feels pushed outwards, although no one pushes. Written in the turning frame, Newton's second law only works if *inertial forces* are added: they are not caused by another body, they come from the frame's own acceleration[5]. The ground under our feet turns once a sidereal day, so it is a rotating frame; its rotation is slow enough that these forces are small, but instruments measure them.

$${\vec a\prime = \vec a - 2\,\vec\Omega\times\vec v\prime - \vec\Omega\times(\vec\Omega\times\vec r)}$$
$$a_\text{Coriolis} = 2\,\Omega\,v\,\sin\varphi,\qquad a_\text{centrifugal} = \Omega^2\,r$$

Ω is the frame's angular velocity, v′ and r the body's velocity and position in that frame, × the vector (cross) product, φ the latitude. The middle term is the Coriolis acceleration: it deviates anything that moves, to the right in the northern hemisphere; for an airliner at 250 m/s at 45° it is 0.0258 m/s², 0.26 % of gravity. The last term is the centrifugal acceleration, outward from the axis: 0.0339 m/s² at the equator. The figure shows the same ball seen from outside (straight line) and from the turning disc (curved).

**The inertial forces of a turning Earth, their size, and the tabs that measure them[5][8].**

| Force | Per unit mass | On the Earth | On this site |
| --- | --- | --- | --- |
| centrifugal | Ω² r cos φ, away from the axis | 0.0339 m/s² at the equator, 0 at the poles | [Gravity](/ai/grav.md) |
| Coriolis | 2 Ω × v, across the motion | ~10⁻⁴ m/s² per m/s of speed | [Foucault](/ai/fou.md), [Aviation](/ai/avia.md), [Rotation](/ai/rot.md) |
| Eötvös (vertical part of Coriolis) | 2 Ω v cos φ, up for eastward motion | a ship going east is lighter | [Aviation](/ai/avia.md), [Gravity](/ai/grav.md) |
| Euler | −(dΩ/dt) × r | negligible: Ω barely changes | — |

## Newton's three laws and universal gravitation

**The three laws (Principia, 1687)[4].** First: a body stays at rest or in uniform straight motion unless a force acts on it; this is what defines an inertial frame. Second: the force equals the mass times the acceleration. Third: when a body pushes another, the other pushes back with an equal and opposite force. **Mass is not weight.** Mass (kg) measures how hard a body is to accelerate and is the same everywhere; weight is the force of gravity on it, m g, in newtons (N = kg·m/s²), and changes with g. A bathroom scale measures a force and displays it divided by a standard g.

$${\sum \vec F = m\,\vec a = m\,\frac{d\vec v}{dt}}\qquad (\sum \vec F = 0\ \Leftrightarrow\ \vec v\ \text{constant})$$

Σ F is the sum of all forces on the body, added as arrows. If they cancel, the acceleration is zero and the first law follows: the first law is the second with no net force. On a book lying on a table, its weight and the table's push cancel.

$${\vec F_{A\to B} = -\vec F_{B\to A}}$$

The apple pulls the Earth up exactly as hard as the Earth pulls the apple down. The Earth's acceleration is far too small to see because its mass is 10²⁴ times larger. The two forces act on different bodies, so they never cancel each other.

$${F = \frac{G\,m_1\,m_2}{r^2}},\qquad g = \frac{G M}{R^2}$$

Every pair of masses attracts along the line joining them, with a force that falls as the square of the distance r between their centres; for a sphere, the attraction outside is as if all its mass were at the centre. G is the gravitational constant, first measured in the laboratory by Cavendish in 1798 with lead balls[7]. At the surface of a sphere of mass M and radius R, the acceleration is g = GM/R²: 9.820 m/s² for the Earth's GM and a radius of 6,371 km. The [Gravity](/ai/grav.md) tab compares measured g with this.

*Figure caption:* **Henry Cavendish** 1731–1810
[After the only likeness, sketched by William Alexander without his knowledge (G. Wilson, 1851)](https://commons.wikimedia.org/wiki/File:Cavendish_Henry_signature.jpg)

$${a_\text{Moon} = \frac{4\pi^2 r}{T^2} \approx g\,\left(\frac{R}{r}\right)^2}$$

**Newton's Moon test.** The Moon, at r = 60 Earth radii, goes round in T = 27.32 days: to bend its path into that circle it must fall towards the Earth by 2.723 mm/s². Gravity at the surface, weakened by (R/r)² = 1/3,600, gives 2.698 mm/s²[4][13]. The two agree to 1.0 %; counting the Moon's own mass (the Earth and the Moon both turn about their common centre, so G(M+m) in place of GM) gives 2.731 mm/s². The same force makes apples fall and keeps the Moon in orbit.

## Adding forces

**A force is an arrow: a size in newtons and a direction.** Several forces on one body act as a single force, their sum, found by putting the arrows end to end (the parallelogram rule, known to Stevin in 1586 and stated by Newton as the first corollary of his laws[15][4]). In practice, one adds them by components: choose two perpendicular axes, project every force on each, and add the numbers. Then the second law applies to the sum: a body whose forces add up to zero stays at rest or keeps its velocity, whatever the individual forces are. Drawing every force acting on a body, and only those, is called a free-body diagram; it is the first step of every mechanics problem.

*Figure caption:* **A force table, seen from above.** A ring is tied to three ropes that run over pulleys at the rim and carry 3, 4 and 5 kg: each rope pulls the ring towards its pulley with the weight it carries, m g. Starting from the centre, the ring slides along the sum of the three forces (black arrow) until that sum is zero; a little friction is added so that it stops. On the right the same three arrows end to end: the gap between start and finish is the sum, and at equilibrium the polygon closes. Click to pause.

$${\sum F_x = 0,\qquad \sum F_y = 0}\qquad F_x = F\cos\theta,\ \ F_y = F\sin\theta$$

**Equilibrium by components.** θ is the angle of each force from the x axis. A force of 10 N at 30° counts as 8.66 N along x and 5 N along y. A body is in equilibrium when both sums vanish, which is two equations for a flat problem and three in space. With 3, 4 and 5 kg the forces are 29.4, 39.2 and 49.1 N; three forces in the ratio 3 : 4 : 5 close a right triangle, so at equilibrium the two smaller ropes are at 90° to each other.

## Ropes and pulleys

**A rope only pulls, along itself, and with the same tension all along** when its mass and the pulleys' friction can be neglected. A pulley turns that pull in another direction without changing it. Two classic set-ups follow. In Atwood's machine (1784), two masses hang on either side of a pulley: the heavier goes down, the lighter up, both with the same acceleration, smaller than g[16]. In a block and tackle, the load hangs on several strands of the same rope: each strand carries the same tension, so n strands share the weight n ways, and the rope must be pulled n times as far as the load rises. The work done, force times distance, is the same either way: pulleys trade force for distance, they do not create energy.

*Figure caption:* **Two pulley systems, in real time.** Left, Atwood's machine with 3 kg against 2 kg, released from rest: on each block, its weight (amber) and the tension of the rope (blue), the same on both sides; their sum (black) is the block's mass times its acceleration, 1.96 m/s² for both. Right, a block and tackle with four strands lifts 40 kg (392 N) with a pull of 98 N; the hand draws four metres of rope for each metre the load rises. Rope and pulleys without mass or friction. Click to pause.

$${a = \frac{m_1 - m_2}{m_1 + m_2}\,g},\qquad T = \frac{2\,m_1 m_2}{m_1 + m_2}\,g$$

**Two free-body diagrams, two equations.** On the heavy block, m₁ a = m₁ g − T; on the light one, m₂ a = T − m₂ g. Adding them removes T and gives a; putting a back gives T. With 3 and 2 kg: a = g/5 = 1.96 m/s² and T = 23.5 N, between the two weights (19.6 and 29.4 N). Atwood built it to slow free fall down enough to time it by hand[16].

$${F = \frac{m\,g}{n}},\qquad d_{\text{rope}} = n\,h$$

**n strands, n times less force, n times more rope.** n is the number of strands that hold the moving block, h the height the load rises. With four strands, 40 kg are held by 98 N, a quarter of their 392 N; raising them by 1 m takes 4 m of rope. F × d_rope = m g × h: the work is the same.

## Inertia, kicks and collisions at an angle

**A moving body needs no force to keep moving.** A puck on ice keeps its speed and direction; only a force changes them (Newton's first law[4]). A short, hard blow is best described by its impulse J, the force multiplied by the time it lasts, in newton-seconds: it changes the velocity by J/m, as an arrow, in the direction of the blow. The new velocity is the old one plus that arrow, which is why a ball struck sideways does not go where it was struck but somewhere between. In a collision, the two bodies give each other equal and opposite impulses (the third law), so their total momentum, mass times velocity added as arrows, is the same before and after.

*[Figure: Animation: a billiard ball moving slightly diagonally hits another at rest; its velocity is split into components; the contact force changes only the component along the line of centres; momentum and energy are conserved; the same collision seen from two moving inertial frames shows the same acceleration]*

*Figure caption:* **A collision, then two changes of frame.** A 170 g ball moving at 2.00 m/s, slightly on a slant, keeps its velocity while nothing pushes it (first law); near the impact its velocity is split along the line of centres and across it; at the impact, the push between the balls acts along the line of their centres, equal and opposite on each (third law), and changes only the component along that line (second law: J = m v_n); momentum is unchanged and kinetic energy comes back after the squeeze; the push peaks near 1,403 N during the 0.3 ms of contact[24]; then the viewpoint glides, the grid showing it, to a frame that moves with the ball's horizontal speed, and later to one that moves with the ball itself (every image is seen from an inertial frame, so the paths stay straight); the three frames side by side show the same acceleration, 8,252 m/s² at the peak, the same curve three times; and a frame that kept following the ball through the impact would need a fictitious force. Slowed down; the contact, a fraction of a millisecond, is stretched; balls at true scale. Click to pause.

*Figure caption:* **Velocities add as arrows.** Left, a 170 g puck sliding at 2 m/s receives a blow of 0.255 N·s at 60° to its path: Δv = J/m = 1.5 m/s in that direction. It leaves at 3.04 m/s, 25.3° from its old path, the sum of the two arrows. Right, a ball A (170 g, 2.00 m/s, slightly on a slant) hits an identical ball B at rest. At the impact its velocity splits along the line joining the centres (violet, v_n = 1.58 m/s) and across it (grey, v_t = 1.23 m/s). The contact force (green) acts along that line only, equal and opposite on the two balls: it removes A's v_n and gives it to B, J = m v_n = 0.268 N·s, and leaves v_t alone, so the balls part at 90°. Billiard balls stay in contact for about 0.3 ms[24]: the push averages 893 N and peaks near 1,403 N, an acceleration of 841 g. Below, the total momentum, unchanged throughout, and the energy: the kinetic part dips during the contact while the balls are squeezed (light green), then comes back. Seen from above, no friction or spin; the contact, a fraction of a millisecond, is stretched. Click to pause.

$${\vec J = \vec F\,\Delta t = m\,\Delta\vec v}\quad\Rightarrow\quad \vec v^{\prime} = \vec v + \frac{\vec J}{m}$$

**The second law over a short time.** F is the force of the blow, Δt its duration, J their product. The kick of the animation, 0.255 N·s on 170 g, adds 1.5 m/s at 60° to 2 m/s: by components, (2 + 1.5 cos 60°, 1.5 sin 60°) = (2.75, 1.30) m/s, that is 3.04 m/s at 25.3°.

*Figure caption:* **One collision, three inertial frames.** The collision of the panel above, watched at once from the table, from a frame that moves with A's horizontal speed (1.95 m/s: there A only goes straight up before the impact), and from a frame that moves with A's whole velocity before the impact (there A is at rest and B comes at it). The table's dots slide by in the moving frames. Velocities, paths and the total momentum differ from one frame to the next; during the contact the acceleration of A (green) is the same arrow in all three, and the same number, up to 8,252 m/s² (841 g); so is its change of velocity. Each frame finds the total momentum and the energy conserved. (The total kinetic energy happens to be the same in these three frames: with two equal balls, one at rest, ½m|v − u|² + ½m|u|² = ½m|v|² for both of these u. In a frame moving another way it would differ.) None of the frames follows A once it is deflected: each keeps its speed, which is what keeps it inertial. Click to pause.

$${\vec v^{\prime} = \vec v - \vec u}\quad\Rightarrow\quad \Delta\vec v^{\prime} = \Delta\vec v,\qquad \vec F^{\prime} = m\,\frac{\Delta\vec v^{\prime}}{\Delta t} = \vec F$$

**Velocities depend on the frame, accelerations and forces do not.** u is the velocity of one inertial frame relative to the other: here A's horizontal speed, (1.95, 0) m/s, or its whole velocity before the impact, (1.95, 0.43) m/s. Every velocity measured in the moving frame is the one measured from the table minus u. Subtracting the same u before and after the impact leaves the change of velocity untouched, so all three observers measure the same acceleration and, with the same mass, the same force: the contact force is a property of the two balls, not of the observer. Momentum and kinetic energy are conserved in each frame; the momentum takes a different value in each. This is Galileo's relativity (Frames of reference, above): no experiment on the balls can tell which frame is “at rest”. A frame that kept following A through the impact would not be inertial: A would never move in it, and a fictitious force equal and opposite to the contact force would be needed to explain that.

*Figure caption:* **The same total push, three ways.** Three 170 g balls roll at 2 m/s into a headwind. The first is slowed by a steady wind of 0.068 N for 2.5 s; the second by two blows of 0.085 N·s; the third by a single blow of 0.17 N·s. Under each lane, the force against time: a long low strip or tall narrow spikes, but the same grey area, 0.17 N·s. On the right, the velocity and the running sum ∫F dt of the three: different paths, the same end, 1.0 m/s and −0.17 N·s. The balls do not end at the same place: the velocity changed at different moments. Slowed down; the blows are lengthened to be seen; the wind is taken as steady, while real drag grows with speed. Click to pause.

$${\vec J = \int \vec F\,dt = \sum_i \vec J_i}\quad\Rightarrow\quad \Delta\vec v = \frac{\vec J}{m}$$

**Only the area counts.** The integral ∫F dt is the area under the curve of the force against time, and the J_i are the impulses of separate blows. A small force for a long time, a big one for an instant, or several blows in a row change the velocity by the same amount if their areas add up to the same total: here 0.17 N·s on 0.17 kg, 1 m/s. The second law in this form, m Δv = ∫F dt, is how a contact force too short to measure is found from the velocities before and after. When the change happens matters for where the body goes, not for its final velocity.

$${m\vec v = m\vec v_1^{\prime} + m\vec v_2^{\prime}},\quad \tfrac12 m v^2 = \tfrac12 m v_1^{\prime 2} + \tfrac12 m v_2^{\prime 2}\ \Rightarrow\ \vec v_1^{\prime} \perp \vec v_2^{\prime}$$

**Why equal balls leave at right angles.** Momentum says the three velocity arrows close a triangle; energy (an elastic collision loses none) says v² = v₁′² + v₂′², Pythagoras: the triangle has a right angle between v₁′ and v₂′. Hit off-centre by one radius, the target leaves at 30° with 1.73 m/s and the striker at 1.00 m/s, from 2 m/s. Real billiard balls also spin and slide on the cloth, which bends these paths a little.

## Magnetic forces

**A magnetic field pushes on moving charges, sideways.** In 1820 Ørsted saw a compass needle turn when a current flowed in a wire beside it: currents make magnetic fields[17]. Lorentz wrote in 1895 the force on a charge q moving at v in a field B: q v × B, perpendicular to both[18]. Because it is always across the motion, it never changes the charge's speed, only its direction: in a uniform field the charge goes round a circle. Fields add as arrows too: a compass needle points along the sum of all the fields at its place, the Earth's and any other. The Earth's field and its direction everywhere are the subject of the Magnetism tab.

*Figure caption:* **Two magnetic forces.** Left, a positive charge in a field that points into the screen: the force (amber) stays at right angles to the velocity (blue) and points to the centre, so the charge circles at constant speed. A proton at 1 km/s in 50 µT, the order of the Earth's field, circles on 21 cm; an electron at the same speed on 0.11 mm. Right, a compass seen from above, with a vertical wire just north of it: when 5 A flow upward in the wire, at 5 cm it adds 20 µT pointing east to the 20 µT of the Earth's horizontal field, and the needle turns by 45° to point along the sum; the current cut, it comes back. Not to scale. Click to pause.

$${\vec F = q\,\vec v \times \vec B},\qquad r = \frac{m\,v}{|q|\,B}$$

**The cross product** v × B is an arrow perpendicular to both v and B, of size v B sin(angle between them); its direction follows the right hand (fingers from v to B, the thumb gives the force for a positive charge). For a velocity across the field the force is q v B, and setting it equal to m v²/r, the centripetal force, gives the radius. The masses and the charge of the proton and of the electron are those of CODATA[2].

$${B_{\text{wire}} = \frac{\mu_0\,I}{2\pi d}},\qquad \tan\delta = \frac{B_{\text{wire}}}{B_H}$$

**The field of a straight wire, and the compass.** I is the current, d the distance from the wire, μ₀ = 1.256 6 × 10⁻⁶ N/A² the magnetic constant[2]. 5 A at 5 cm give 20 µT. The needle settles along the sum of the wire's field and the horizontal part B_H of the Earth's, about 20 µT at mid-latitudes[19]; at right angles to each other, the angle δ from north has tan δ = 20/20, δ = 45°.

## Worked example: how far does a pushed ball go?

**The problem.** A steel ball 10 cm across is pushed from the ground by a force of 1,000 N pointing 30° above the horizontal, for 0.1 s. Where does it land? Every step uses only the rules above: find the mass, add the forces during the push, get the velocity it leaves with, then follow the flight under its weight alone, and then with the air as well. Steel weighs 7,850 kg per cubic metre[20]; the parabola of a thrown body goes back to Galileo[21].

**The ball, step by step. g = 9.81 m/s².**

| Step | Rule | Numbers | Result |
| --- | --- | --- | --- |
| 1. Mass | m = ρ · (4/3) π r³ | 7,850 × 4.19 × 0.05³ | m = 4.11 kg, weight W = m g = 40.3 N |
| 2. The push, by components | F_x = F cos 30°, F_y = F sin 30° | 1,000 × 0.866 ; 1,000 × 0.5 | F_x = 866 N, F_y = 500 N |
| 3. Sum of the forces during the push | ΣF = F + W (W points down) | (866, 500 − 40.3) N | a = ΣF/m = 239 m/s² at 28.0° |
| 4. Velocity at the end of the push | v = a Δt | 239 × 0.1 | v₀ = 23.85 m/s at 28.0°, from (1.05 m, 0.56 m) |
| 5. Flight in a vacuum | x = x₀ + v₀ cos α t, y = y₀ + v₀ sin α t − ½ g t² | y = 0 when t = 2.33 s | lands at 50.1 m; highest point 6.93 m |
| 6. With the air | drag ½ ρ C_D A v², against the velocity | ½ × 1.225 × 0.47 × 78.5 cm² × v² | 1.29 N at launch (3.2 % of the weight); lands at 49.2 m |
| Check: forgetting the weight during the push | v = F Δt / m, range v² sin 60° / g | 24.33 m/s at 30° | 52.3 m: 2 m too far |

*Figure caption:* **The ball, at true scale.** Horizontal and vertical distances are drawn at the same scale; only the ball is enlarged. First the push, slowed twenty times: the force F at 30° (blue) and the weight (amber) add to a push at 28.0° (black), which is why the ball leaves lower than 30°. Then the flight, slowed three times: in a vacuum (dashed) and in air (solid), with the weight, the velocity and the drag of the air (green), a tiny arrow at the same scale, 3.2 % of the weight at launch. The air costs 0.9 m: 49.2 m instead of 50.1 m. Click to pause.

$${x = v_0\cos\alpha\;t,\qquad y = v_0\sin\alpha\;t - \tfrac12 g t^2},\qquad R = \frac{v_0^2\sin 2\alpha}{g}$$

**Two independent motions.** With only the weight acting, nothing pushes sideways, so the horizontal velocity v₀ cos α never changes; vertically, the velocity falls by g every second, as for a dropped stone. The path is a parabola. From ground level the range is R = v₀² sin 2α / g, largest at 45°; our ball leaves from 0.56 m up at 28.0°, so the table solves y = 0 for t instead: 2.33 s, 50.1 m.

$${\vec F_D = -\tfrac12\,\rho\,C_D\,A\,|\vec v|\,\vec v},\qquad m\,\frac{d\vec v}{dt} = m\vec g + \vec F_D$$

**Air resistance.** ρ = 1.225 kg/m³ is the density of air at sea level[22], A = π r² the ball's cross-section, C_D ≈ 0.47 the drag coefficient of a smooth sphere at these speeds[23]. The drag points against the velocity and grows with its square. With it the equations have no simple solution: the computer adds the two forces at each millisecond and steps the velocity and the position forward (Runge–Kutta method). For a dense ball the drag is small; for a hollow 50 g ball of the same size it passes the weight above 15 m/s.

**What the example leaves out, said plainly:** the air during the 0.1 s of the push, the ball's spin (which, through the Magnus effect, lifts or drops a spinning ball), wind, and the slight change of C_D with speed. A thrown ball also starts from the hand, about 2 m above the ground, which adds several metres. Each of these is one more force to add to the sum, by the same rule.

## Circular motion and angular velocity

$${\omega = \frac{d\theta}{dt} = \frac{2\pi}{T}},\qquad v = \omega\,r$$

**Angular velocity.** ω (omega) is how fast an angle turns, in radians per second; T is the time for one turn. Every point of a turning body has the same ω, but its speed v grows with its distance r from the axis. For the Earth, ω = 7.292 × 10⁻⁵ rad/s[8]: one turn in 86,164 s. The [Rotation](/ai/rot.md) tab measures ω with ring lasers and gyroscopes, the [Scale](/ai/scale.md) tab shows it as a clock hand.

$${a_c = \frac{v^2}{r} = \omega^2 r},\ \text{towards the centre}$$

**Turning at constant speed is accelerating.** The speed keeps its size but not its direction: between two instants, the difference Δv of the velocity arrows points to the centre. Seen from the inertial frame that is a centripetal acceleration, provided by a force (the string of a sling, gravity for the Moon)[14]; seen from the turning frame it appears as the centrifugal force of the previous section, the same size and the opposite way. At the equator, ω²R = 0.0339 m/s², 0.35 % of g.

$${\frac{1}{T_\text{sid}} = \frac{1}{T_\text{sol}} + \frac{1}{T_\text{year}}}\ \Rightarrow\ T_\text{sid} \approx 86\,164\ \text{s}$$

**Two kinds of day.** The solar day (86,400 s, noon to noon) is a turn relative to the Sun; the sidereal day is a turn relative to the stars. Because the Earth also moves along its orbit, it has to turn a little more than once to face the Sun again: in a year it turns 366.24 times relative to the stars for 365.24 noons. With T_sol = 86,400 s and T_year = 365.2422 days, T_sid = 86,164.1 s. This is why the stars rise four minutes earlier every night ([Star trails](/ai/star.md)).

## Energy, momentum and angular momentum

**Three quantities that do not change.** In an isolated system, three totals stay constant whatever happens inside: the energy, the momentum (mass times velocity) and the angular momentum (the “amount of turning”). They follow from Newton's laws and save solving the motion step by step: knowing what is conserved often gives the answer directly.

$${E = \tfrac12\,m v^2 + m g h = \text{constant}},\qquad E_p = -\frac{G M m}{r}$$

The kinetic energy ½mv² is the energy of motion, the potential energy mgh that of height near the ground (in joules, J = kg·m²/s²). A ball dropped from h trades one for the other and reaches the ground at v = √(2gh), whatever its mass. Far from the ground, where g is no longer constant, the potential energy is −GMm/r: zero at infinity, negative when bound.

$${\vec p = m\,\vec v},\qquad \vec p_1 + \vec p_2 = \text{constant}\ \Rightarrow\ m_1 v_1 = -m_2 v_2$$

Two skaters at rest push each other apart: the total momentum was zero and stays zero, so the lighter one goes faster, the opposite way. A rocket works the same way with its exhaust gases, which is why it needs no air to push against.

$${L = m\,r^2\,\dot\theta = \text{constant}}\ \Leftrightarrow\ \frac{dA}{dt} = \frac{r^2\dot\theta}{2} = \text{constant}$$

**Kepler's second law** (1609): the line from the Sun to a planet sweeps equal areas in equal times[6]. It is the conservation of angular momentum L under a force aimed at the Sun: close in (small r), the planet turns faster (large θ̇). The Earth is fastest in early January, at perihelion, which is one reason the seasons do not have the same length ([Orbit](/ai/orb.md)).

$${T^2 = \frac{4\pi^2}{G(M+m)}\,a^3}$$

**Kepler's third law** (1619), as Newton derived it: the square of the period grows as the cube of the orbit's size a (half the long axis of the ellipse)[6][4]. With the Earth's GM, a GPS satellite at a = 26,560 km goes round in 11.97 h, half a sidereal day ([Satellites](/ai/sat.md)); the Moon, with GM alone, in 27.45 days, and with G(M+m) in 27.28 days, against 27.32 observed.

*Figure caption:* **Johannes Kepler** 1571–1630
[August Köhler, 1910, after an older portrait (Kepler Museum, Weil der Stadt)](https://commons.wikimedia.org/wiki/File:JKepler.jpg)

## Waves and light

**A wave carries energy without carrying matter.** The sea swell, sound, the seismic waves of the [Seismology](/ai/seis.md) tab, the pressure wave of Hunga Tonga ([Atmosphere](/ai/atmo.md)), radio and light are all waves: a disturbance that travels while each point only oscillates about its place. Light needs no medium and goes at c in vacuum, slower in air, water or glass.

$${v = \lambda\,f = \frac{\lambda}{T}},\qquad t = \frac{d}{v}$$

λ (lambda) is the wavelength, the distance between two crests; f the frequency, the number of crests passing per second (hertz, Hz), and T = 1/f the period. In one period the wave advances one wavelength. The travel time over a distance d is d/v: the seismology and Tonga tabs read distances from such times.

$${n_1 \sin\theta_1 = n_2 \sin\theta_2},\qquad n = \frac{c}{v}$$

**Refraction.** When light passes into a medium where it is slower (higher index n), it bends towards the perpendicular[11]. Air gets thinner with height, so its index slowly decreases upwards and a ray going nearly level bends gently downward, following the Earth's curve a little: that is atmospheric refraction, the subject of the [Refraction](/ai/ref.md) tab. The site always shows it beside the unrefracted value.

$${\frac{\Delta f}{f} \approx -\frac{v_r}{c}}\quad (v_r \ll c)$$

**The Doppler effect** (1842)[10]. A source moving away (v_r > 0) stretches its waves, so its frequency drops; one coming closer squeezes them, so it rises. That is the change in pitch of a passing siren. Only the speed along the line of sight, v_r, counts. Measured on starlight it gives the Earth's orbital speed ([Orbit](/ai/orb.md)); on satellite radio signals, their orbits ([Satellites](/ai/sat.md)).

## Constants: defined, measured, and local

**Not every “constant” is the same kind of number.** The seven constants of the SI are exact *by definition*: since 2019 the metre is the distance light travels in 1/299,792,458 s, so c cannot be measured any more, only used[1]. The gravitational constant G is a universal constant that is *measured*, and is the least well known of all (2 parts in 100,000)[2]. The Earth's GM, its rotation ω, its radius and the local g are *properties of one planet*, not universal constants: g changes from place to place, and the “standard” g_n = 9.80665 m/s² is a convention adopted in 1901 for weighing, not a value found anywhere in particular[12]. That last distinction is the site's purity rule: a measurement of the radius may never have used the radius ([Results](/ai/results.md)).

**The constants the site uses, and what kind each one is[1][2][8][9][12].**

| Symbol | Name | Value | Unit | Kind |
| --- | --- | --- | --- | --- |
| c | speed of light in vacuum[1] | 299 792 458 | m/s | exact, defines a unit |
| h | Planck constant[1] | 6.626 070 15 × 10⁻³⁴ | J·s | exact, defines a unit |
| e | elementary charge[1] | 1.602 176 634 × 10⁻¹⁹ | C | exact, defines a unit |
| k_B | Boltzmann constant[1] | 1.380 649 × 10⁻²³ | J/K | exact, defines a unit |
| N_A | Avogadro constant[1] | 6.022 140 76 × 10²³ | mol⁻¹ | exact, defines a unit |
| Δν_Cs | caesium-133 hyperfine frequency[1] | 9 192 631 770 | Hz | exact, defines a unit |
| K_cd | luminous efficacy of 540 THz light[1] | 683 | lm/W | exact, defines a unit |
| G | Newtonian constant of gravitation[2] | 6.674 30(15) × 10⁻¹¹ | m³ kg⁻¹ s⁻² | universal, measured |
| GM⊕ | Earth's gravitational parameter[8] | 3.986 004 418 × 10¹⁴ | m³/s² | property of the Earth |
| ω⊕ | Earth's mean angular velocity[8] | 7.292 115 × 10⁻⁵ | rad/s | property of the Earth |
| R_eq | Earth's equatorial radius (GRS80)[9] | 6 378 137 | m | property of the Earth |
| g_eq | normal gravity at the equator[9] | 9.780 33 | m/s² | property of the Earth |
| g_pole | normal gravity at the poles[9] | 9.832 19 | m/s² | property of the Earth |
| g_n | standard gravity[12] | 9.806 65 | m/s² | convention |

$${1\ \text{m} = c \times \frac{1}{299\,792\,458}\ \text{s}},\qquad 1\ \text{s} = \frac{9\,192\,631\,770}{\Delta\nu_\text{Cs}}$$

**A constant defines a unit.** The second is the duration of 9,192,631,770 oscillations of the radiation of the caesium-133 atom, the metre the distance light travels in 1/299,792,458 of that second. Any laboratory can rebuild them without a reference object. GPS clocks count these oscillations ([GPS](/ai/gps.md)).

$${g(\varphi) \approx \frac{G M}{R^2} - \omega^2 R \cos^2\varphi}\quad \text{(sphere, no flattening)}$$

**g is local.** On a turning sphere of radius 6,371 km, the centrifugal term lowers gravity from 9.820 m/s² at the poles to 9.786 m/s² at the equator. Measured, it goes from 9.832 to 9.780 m/s²[9]: the difference is larger because the Earth is also flattened, the equator being 21 km farther from the centre than the poles. Height, the rocks below and the tides change it further, in the fourth decimal and beyond ([Gravity](/ai/grav.md)).

**See also**[Math](/ai/math.md)[Curvature](/ai/kappa.md)[Rotation](/ai/rot.md)[Gravity](/ai/grav.md)[Foucault](/ai/fou.md)[Orbit](/ai/orb.md)[Satellites](/ai/sat.md)[Refraction](/ai/ref.md)[Results](/ai/results.md)

## Sources for this tab

1. [1] Bureau International des Poids et Mesures, [*The International System of Units (SI)*](https://www.bipm.org/en/publications/si-brochure), 9th edition (2019, updated 2022): the seven defining constants (Δν_Cs, c, h, e, k, N_A, K_cd) and the base units they fix, in force since 20 May 2019 (26th CGPM, Resolution 1).
2. [2] NIST, [CODATA Internationally recommended 2022 values of the fundamental physical constants](https://physics.nist.gov/cuu/Constants/): Newtonian constant of gravitation G = 6.674 30(15) × 10⁻¹¹ m³ kg⁻¹ s⁻², relative standard uncertainty 2.2 × 10⁻⁵.
3. [3] G. Galilei, *Dialogo sopra i due massimi sistemi del mondo* (Florence, 1632), Second Day: Salviati's cabin below decks of a ship moving uniformly, where no experiment shows whether the ship moves or stands still.
4. [4] I. Newton, *Philosophiæ Naturalis Principia Mathematica* (London, 1687): “Axiomata, sive leges motus” (the three laws); Book III, Proposition IV (the Moon is kept in its orbit by the force of gravity, compared with the fall of bodies at the surface) and Propositions XIII–XV (Kepler's laws from the inverse square).
5. [5] G. Coriolis, “Mémoire sur les équations du mouvement relatif des systèmes de corps”, *Journal de l'École polytechnique* 15 (1835) 142–154: the compound centrifugal force, now called the Coriolis force, in a rotating frame.
6. [6] J. Kepler, *Astronomia nova* (Prague, 1609): elliptical orbits and the law of areas; *Harmonices mundi* (Linz, 1619), Book V: the squares of the periods as the cubes of the mean distances.
7. [7] H. Cavendish, “Experiments to determine the Density of the Earth”, *Philosophical Transactions of the Royal Society* 88 (1798) 469–526: the torsion balance with lead spheres, from which G follows.
8. [8] G. Petit, B. Luzum (eds.), [*IERS Conventions (2010)*, IERS Technical Note 36](https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html), table 1.1: GM⊕ = 3.986 004 418 × 10¹⁴ m³/s², nominal mean angular velocity ω = 7.292 115 × 10⁻⁵ rad/s.
9. [9] H. Moritz, “Geodetic Reference System 1980”, *Journal of Geodesy* 74 (2000) 128–133: equatorial radius 6 378 137 m, polar radius 6 356 752 m, normal gravity 9.780 326 7715 m/s² at the equator and 9.832 186 3685 m/s² at the poles; mean radius 6 371.0088 km.
10. [10] C. Doppler, “Über das farbige Licht der Doppelsterne und einiger anderer Gestirne des Himmels”, *Abhandlungen der königlich böhmischen Gesellschaft der Wissenschaften* 2 (1842) 465–482.
11. [11] R. Descartes, *La Dioptrique* (Leiden, 1637), Discours second: the law of refraction in sines, found earlier by W. Snellius (about 1621, unpublished) and by Ibn Sahl (984) for lenses.
12. [12] 3rd Conférence Générale des Poids et Mesures (1901), Declaration on the unit of mass and the definition of weight: standard acceleration of gravity g_n = 980.665 cm/s², “the value already stated in the laws of some countries”.
13. [13] D. R. Williams, [Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html), NASA Goddard (NSSDCA): semi-major axis 384 400 km, sidereal orbit period 27.3217 days, Earth/Moon mass ratio 81.3.
14. [14] C. Huygens, *Horologium oscillatorium* (Paris, 1673): the period of a pendulum and its relation to the fall of bodies, T = 2π√(L/g) for small swings, and (Part V) the theorems on centrifugal force, v²/r, worked out in *De vi centrifuga* (1659, published 1703).
15. [15] S. Stevin, *De Beghinselen der Weeghconst* (Leiden, 1586): equilibrium of forces on an inclined plane (the “wreath of spheres”), and the triangle of forces.
16. [16] G. Atwood, *A Treatise on the Rectilinear Motion and Rotation of Bodies* (Cambridge, 1784): the machine of two masses over a pulley, to slow down and time uniformly accelerated motion.
17. [17] H. C. Ørsted, *Experimenta circa effectum conflictus electrici in acum magneticam* (Copenhagen, 1820): a current in a wire turns a compass needle.
18. [18] H. A. Lorentz, *Versuch einer Theorie der electrischen und optischen Erscheinungen in bewegten Körpern* (Leiden, 1895): the force on a charge moving in electric and magnetic fields.
19. [19] P. Alken et al., “International Geomagnetic Reference Field: the thirteenth generation”, *Earth, Planets and Space* 73 (2021) 49: the horizontal intensity of the field, about 15 to 25 µT at mid-latitudes.
20. [20] EN 1993-1-1 (Eurocode 3), Design of steel structures, § 3.2.6: density of structural steel ρ = 7,850 kg/m³.
21. [21] G. Galilei, *Discorsi e dimostrazioni matematiche intorno a due nuove scienze* (Leiden, 1638), Fourth Day: a projectile thrown horizontally describes a semi-parabola; the range is largest at 45°.
22. [22] *U.S. Standard Atmosphere, 1976* (NOAA, NASA, USAF, Washington, 1976): density of air at sea level 1.2250 kg/m³.
23. [23] S. F. Hoerner, *Fluid-Dynamic Drag* (Hoerner, 1965), chapter 3: drag coefficient of a smooth sphere about 0.47 below the critical Reynolds number (≈ 3 × 10⁵; our ball: 1.6 × 10⁵).
24. [24] W. C. Marlow, *The Physics of Pocket Billiards* (Marlow Advanced Systems Technologies, 1995): ball-ball contact lasts between 0.1 and 0.6 ms, less at higher speed; measurements of 0.25 to 0.3 ms by Sorokin, quoted by D. Alciatore, [“Ball contact time”](https://drdavepoolinfo.com/FAQ/ball/contact-time/) (Dr. Dave Pool Info).
