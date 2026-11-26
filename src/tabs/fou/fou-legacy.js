// Moteur de l'onglet fou, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html : bloc "Tab: fou"), y compris ses figures
// canvas animées et ses tables. Il cherche ses hôtes par id dans le
// document (flux verbatim src/data/prose/fou.js) ; n'expose que
// wire()/draw()/stop(). Les fonctions pures sont dupliquées, testées,
// dans src/tabs/fou/logic.js.
import { setupCanvas } from "../../core/canvas.js";
const $ = (id) => document.getElementById(id);
const DEG = (r) => r * 180 / Math.PI;

// ---- Tab: Foucault pendulum (key "fou") ---------------------------------
// WHY THIS TAB EXISTS. Every other tab on this page looks at something far away
// and therefore has to argue about the air in between. This one has no sightline
// at all: the instrument is a weight on a wire and the quantity it reports is the
// orientation of the observer's own floor. It is the page's only shape test that
// is completely immune to the refraction argument.
//
// THE ARGUMENT IS THE SINE, NOT THE PRECESSION. One pendulum shows rotation and
// nothing else -- the tab concedes that in its first callout, on purpose, because
// overselling it is what gives the objection its bite. The shape claim lives in
// how the rate changes with latitude, so BOTH flat variants get a real column:
// a non-rotating plane (0 everywhere) and a disc spinning once a day (Omega
// everywhere, one sense). Do not quietly drop the second: it is the steelman.
const FOU_OMEGA = 15.0410686;        // deg/h, one turn per sidereal day
const FOU_SIDEREAL = 23.9344696;     // h, 23h56m04.09s
const FOU_G = 9.81;
const FRAD = d => d * Math.PI / 180;                                 // no global RAD on this page
const fouRate   = phi => FOU_OMEGA * Math.sin(FRAD(phi));            // signed deg/h
const fouPeriod = phi => {                                          // h for a full turn
  const s = Math.abs(Math.sin(FRAD(phi)));
  return s < 1e-9 ? Infinity : FOU_SIDEREAL / s;
};
// Airy's 1851 precession of an elliptical orbit: (3/8)(a*b/L^2)*sqrt(g/L), rad/s.
const fouAiry = (a, b, L) => 0.375 * (a * b / (L * L)) * Math.sqrt(FOU_G / L) * (180 / Math.PI) * 3600;
const fouSense = phi => Math.abs(Math.sin(FRAD(phi))) < 1e-9 ? "—"
  : (phi > 0 ? "clockwise" : "anticlockwise");
const fouHrs = h => !isFinite(h) ? "never" : (h >= 100 ? h.toFixed(0) + " h"
  : Math.floor(h) + " h " + String(Math.round((h % 1) * 60)).padStart(2, "0") + " m");

// ---- table 1: the three models side by side ----
// Rows are latitudes, not sites: this table is pure prediction, so no observation
// can be mis-read out of it. Every cell is computed from the model in its heading.
const FOU_LATS = [
  { p:  90,      t: "geographic North Pole" },
  { p:  60,      t: "Oslo, St Petersburg, Anchorage" },
  { p:  48.8462, t: "Paris — the Panthéon" },
  { p:  30,      t: "Cairo, New Orleans" },
  { p:   0,      t: "the equator" },
  { p: -37.81,   t: "Melbourne" },
  { p: -90,      t: "geographic South Pole" },
];
function fouModelTable(){
  const tb = $("fouModelRows"); if(!tb) return;
  const disc = `${FOU_OMEGA.toFixed(3)} °/h · ${fouHrs(FOU_SIDEREAL)} · same sense`;
  tb.innerHTML = FOU_LATS.map(r => {
    const rate = fouRate(r.p), per = fouPeriod(r.p);
    const cls = r.p === 0 ? "hot" : (r.p < 0 ? "cold" : "");
    return `<tr><td><b>${r.p.toFixed(r.p % 1 ? 4 : 0).replace("-", "−")}°</b> ` +
      `<span style="color:var(--ink-soft)">· ${r.t}</span></td>` +
      `<td class="${cls}"><b>${rate.toFixed(3).replace("-", "−")} °/h</b><br>` +
      `<span style="color:var(--ink-soft)">${fouSense(r.p)}</span></td>` +
      `<td>${fouHrs(per)}</td>` +
      `<td>0.000 °/h · never</td><td>${disc}</td></tr>`;
  }).join("");
}

// ---- table 2: documented installations ----
// ONLY installations the page can point at. The "measured" column is left blank
// unless a published account gives a number -- predicted values are computed from
// latitude alone and must never be presented as if they had been observed.
const FOU_SITES = [
  { n: "Panthéon, Paris (France)",              p:  48.8462, L: "67 m",  m: "≈ 11 °/h (Foucault, 1851)" },
  { n: "Museum of Science and Industry, Chicago", p: 41.7912, L: "—",    m: "—" },
  { n: "United Nations Headquarters, New York", p:  40.7489, L: "≈ 23 m", m: "—" },
  { n: "Griffith Observatory, Los Angeles",     p:  34.1184, L: "≈ 12 m", m: "—" },
  { n: "Amundsen–Scott Station, South Pole",    p: -90,      L: "33 m",  m: "24 h ± 50 m for a full turn, sense reversed" },
];
function fouSiteTable(){
  const tb = $("fouSiteRows"); if(!tb) return;
  tb.innerHTML = FOU_SITES.map(r => {
    const rate = fouRate(r.p);
    const cls = r.p < 0 ? "cold" : "";
    return `<tr><td>${r.n}</td><td class="${cls}">${r.p.toFixed(4).replace("-", "−")}°</td><td>${r.L}</td>` +
      `<td><b>${rate.toFixed(2).replace("-", "−")} °/h</b> ${fouSense(r.p)}</td>` +
      `<td>${fouHrs(fouPeriod(r.p))}</td><td>${r.m}</td></tr>`;
  }).join("");
}

// ---- figure 1: one rotation vector, three floors ----
// The point of the drawing is that the BLACK arrow never changes -- same length,
// same direction, at all three sites. Only the floor turns underneath it, and the
// teal projection onto the local vertical is the entire precession rate.
function drawFouOmega(){
  const cv = $("fouOmegaCanvas"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  const cx = W * 0.40, cy = H / 2, R = Math.min(H * 0.40, W * 0.30);
  // the planet
  ctx.fillStyle = "rgba(122,106,79,.10)"; ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill(); ctx.stroke();
  // spin axis
  ctx.setLineDash([6, 4]); ctx.strokeStyle = "#8b93a0"; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(cx, cy - R * 1.32); ctx.lineTo(cx, cy + R * 1.32); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.fillStyle = "#8b93a0"; ctx.textAlign = "center";
  ctx.fillText("axis", cx, cy - R * 1.32 - 6);
  // equator
  ctx.strokeStyle = "rgba(21,26,33,.16)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
  const arrow = (x, y, dx, dy, col, w) => {
    const L = Math.hypot(dx, dy); if(L < 0.5) return;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke();
    const ux = dx / L, uy = dy / L, hs = 5.5;
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - ux * hs - uy * hs * 0.6, y + dy - uy * hs + ux * hs * 0.6);
    ctx.lineTo(x + dx - ux * hs + uy * hs * 0.6, y + dy - uy * hs - ux * hs * 0.6);
    ctx.closePath(); ctx.fill();
  };
  const OL = R * 0.62;                      // drawn length of Omega, identical everywhere
  [78, 48, 18].forEach(phi => {
    const r = FRAD(phi), ux = Math.cos(r), uy = -Math.sin(r);     // local vertical, screen coords
    const px = cx + R * ux, py = cy + R * uy;
    // the floor: a short tangent segment
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + uy * R * 0.20, py - ux * R * 0.20);
    ctx.lineTo(px - uy * R * 0.20, py + ux * R * 0.20);
    ctx.stroke();
    // Omega: same arrow at every site, parallel to the axis
    arrow(px, py, 0, -OL, "#151a21", 2);
    // its projection on the local vertical = Omega sin(phi)
    const proj = OL * Math.sin(r);
    arrow(px, py, ux * proj, uy * proj, "#0f766e", 3);
    ctx.fillStyle = "#5b6470"; ctx.textAlign = "left";
    ctx.fillText(`φ = ${phi}°`, px + 10, py + 14);
    ctx.fillStyle = "#0f766e";
    ctx.fillText(`Ω sin φ = ${(FOU_OMEGA * Math.sin(r)).toFixed(1)} °/h`, px + 10, py + 27);
  });
  ctx.fillStyle = "#151a21"; ctx.textAlign = "left";
  ctx.fillText("black = Ω, identical at every site", 10, H - 24);
  ctx.fillStyle = "#0f766e";
  ctx.fillText("teal = the part along your floor's vertical", 10, H - 10);
}

// ---- figure 2: the rosette ----
// Swing count is thinned by ~30x and the ellipse blown up, or the figure would be a
// solid disc. Both distortions are printed on the canvas -- the ANGLE swept is real.
function drawFouRose(){
  const cv = $("fouRoseCanvas"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 + 4, R = Math.min(W, H) * 0.38;
  const hours = 6, phi = 48.8462;
  const sweep = FRAD(Math.abs(fouRate(phi)) * hours);    // real angle swept in 6 h
  const swings = 46, ecc = 0.075;
  ctx.strokeStyle = "rgba(21,26,33,.14)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  const N = swings * 60;
  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.1; ctx.beginPath();
  for(let i = 0; i <= N; i++){
    const u = i / N;                       // 0..1 across the whole watch
    const ph = u * swings * 2 * Math.PI;   // swing phase
    const th = -u * sweep;                 // plane orientation, clockwise for phi > 0
    const X = R * Math.cos(ph), Y = R * ecc * Math.sin(ph);
    const x = cx + X * Math.cos(th) - Y * Math.sin(th);
    const y = cy + X * Math.sin(th) + Y * Math.cos(th);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  // start and end of the swing plane
  const mark = (th, col, lbl) => {
    ctx.strokeStyle = col; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx + R * 1.06 * Math.cos(th), cy + R * 1.06 * Math.sin(th));
    ctx.lineTo(cx + R * 1.18 * Math.cos(th), cy + R * 1.18 * Math.sin(th));
    ctx.stroke();
    ctx.fillStyle = col; ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = Math.cos(th) < 0 ? "right" : "left";
    ctx.fillText(lbl, cx + R * 1.22 * Math.cos(th), cy + R * 1.22 * Math.sin(th) + 4);
  };
  mark(0, "#8b93a0", "start");
  mark(-sweep, "#b45309", `+${hours} h`);
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center"; ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.fillText(`φ = 48.85°  ·  ${Math.abs(fouRate(phi)).toFixed(2)} °/h  ·  ${DEG(sweep).toFixed(1)}° in ${hours} h`, cx, 16);
  ctx.fillStyle = "#8b93a0";
  ctx.fillText("swings thinned ~30× · ellipse exaggerated · swept angle exact", cx, H - 8);
}

// ---- figure 3: rate against latitude, all three models ----
function drawFouLat(){
  const cv = $("fouLatCanvas"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  const narrow = W < 560;
  const padL = narrow ? 40 : 56, padR = narrow ? 14 : 130, padT = 18, padB = 34;
  const Wd = W - padL - padR, Hd = H - padT - padB;
  const X = phi => padL + (phi + 90) / 180 * Wd;
  const Y = r => padT + (FOU_OMEGA - r) / (2 * FOU_OMEGA) * Hd;
  ctx.font = "11px ui-monospace, Menlo, monospace";
  // grid
  ctx.strokeStyle = "rgba(21,26,33,.10)"; ctx.lineWidth = 1;
  [-90, -45, 0, 45, 90].forEach(p => {
    ctx.beginPath(); ctx.moveTo(X(p), padT); ctx.lineTo(X(p), padT + Hd); ctx.stroke();
    ctx.fillStyle = "#8b93a0"; ctx.textAlign = "center";
    ctx.fillText((p > 0 ? "+" : "") + p + "°", X(p), H - 18);
  });
  [-15, -10, -5, 0, 5, 10, 15].forEach(r => {
    ctx.beginPath(); ctx.moveTo(padL, Y(r)); ctx.lineTo(padL + Wd, Y(r)); ctx.stroke();
    ctx.fillStyle = "#8b93a0"; ctx.textAlign = "right";
    ctx.fillText(String(r), padL - 6, Y(r) + 4);
  });
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText("latitude", padL + Wd / 2, H - 4);
  // model 2: flat, not rotating -- the axis itself
  ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + Wd, Y(0)); ctx.stroke();
  // model 3: flat disc, one turn per day
  ctx.setLineDash([7, 4]); ctx.strokeStyle = "#6d28d9"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(padL, Y(FOU_OMEGA)); ctx.lineTo(padL + Wd, Y(FOU_OMEGA)); ctx.stroke();
  ctx.setLineDash([]);
  // model 1: the globe
  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.8; ctx.beginPath();
  for(let i = 0; i <= 240; i++){
    const p = -90 + 180 * i / 240;
    i ? ctx.lineTo(X(p), Y(fouRate(p))) : ctx.moveTo(X(p), Y(fouRate(p)));
  }
  ctx.stroke();
  // the sites
  FOU_SITES.forEach(s => {
    ctx.fillStyle = "#0f766e";
    ctx.beginPath(); ctx.arc(X(s.p), Y(fouRate(s.p)), 4, 0, 7); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; ctx.stroke();
  });
  if(!narrow){
    const key = [
      ["#0f766e", "globe: Ω sin φ"],
      ["#6d28d9", "flat disc, 1 turn/day"],
      ["#b45309", "flat, not rotating"],
    ];
    ctx.textAlign = "left";
    key.forEach((k, i) => {
      ctx.strokeStyle = k[0]; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(padL + Wd + 10, padT + 14 + i * 18);
      ctx.lineTo(padL + Wd + 30, padT + 14 + i * 18); ctx.stroke();
      ctx.fillStyle = "#5b6470"; ctx.fillText(k[1], padL + Wd + 35, padT + 18 + i * 18);
    });
  }
  ctx.save(); ctx.translate(12, padT + Hd / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText("precession, °/h", 0, 0); ctx.restore();
}

// ---- experiment 1d: is your stairwell tall enough? ----
// Answers the question a would-be replicator actually has, which is not "what is
// the rate" but "will Airy's ellipse swamp it in the building I have access to".

// ---- the two-frame animation --------------------------------------------
// ONE state, TWO renderings. This is the whole pedagogical point, so the code is
// built that way on purpose: the physics lives in fouAnim.plane (the accumulated
// rotation of the swing plane in FLOOR coordinates) and the mode only decides how
// much to counter-rotate the canvas before drawing. If you ever find yourself
// writing a second physics branch for the second mode, you have broken the figure.
//
// A NAMING CAVEAT THAT MATTERS. "Swing frame" is not "star frame" except at the
// pole. Away from the pole the swing plane is parallel-transported, not inertially
// fixed, and that gap IS the geometric-phase content of section 3. The caption says
// so. Do not relabel the button "inertial frame" -- it would be wrong at 47 of the
// 48 latitudes anyone will click.
const fouAnim = {
  phi: 48.8462,        // deg
  mode: "floor",       // "floor" | "swing"
  running: true,
  t: 0,                // simulated hours
  plane: 0,            // rad, clockwise-positive on screen, floor coordinates
  swing: 0,            // rad, drawn swing phase (NOT to scale, see below)
  last: 0,
  trail: [],           // {x, y} in floor coordinates, unit disc
  raf: 0,
  readAt: 0,
};
const FOU_TIMEX = 1800;        // simulated seconds per real second (0.5 h/s)
const FOU_SWING_HZ = 0.75;     // drawn swings per real second

function fouAnimReset(){
  fouAnim.t = 0; fouAnim.plane = 0; fouAnim.swing = 0; fouAnim.trail.length = 0;
  fouAnim.last = 0; fouAnim.readAt = 0;
}
function fouSetPhi(p){
  fouAnim.phi = p;
  ["fouLat90", "fouLatPar", "fouLat0", "fouLatMel"].forEach(id => {
    const el = $(id); if(el) el.setAttribute("aria-pressed", String(parseFloat(el.dataset.fouphi) === p));
  });
  fouAnimReset();
}
function fouSetMode(m){
  fouAnim.mode = m;
  const a = $("fouFrFloor"), b = $("fouFrSwing");
  if(a) a.setAttribute("aria-pressed", String(m === "floor"));
  if(b) b.setAttribute("aria-pressed", String(m === "swing"));
}
function fouSetRunning(r){
  fouAnim.running = r;
  const el = $("fouPlay");
  if(el){ el.setAttribute("aria-pressed", String(r)); el.innerHTML = r ? "&#10073;&#10073;" : "&#9654;"; }
  if(r) fouAnimStart();
}

function fouAnimReads(){
  const el = $("fouAnimReads"); if(!el) return;
  const rate = fouRate(fouAnim.phi);
  const turned = DEG(fouAnim.plane) * Math.sign(rate || 1);
  const frame = fouAnim.mode === "floor" ? "floor held still" : "swing plane held still";
  el.innerHTML =
    `<span class="r"><span class="dot" style="background:#0f766e"></span>φ = <b>${fouAnim.phi.toFixed(2).replace("-", "−")}°</b></span>` +
    `<span class="r">Ω sin φ = <b>${rate.toFixed(3).replace("-", "−")} °/h</b> <span class="sub">${fouSense(fouAnim.phi)}</span></span>` +
    `<span class="r">elapsed <b>${fouAnim.t.toFixed(2)} h</b> <span class="sub">simulated</span></span>` +
    `<span class="r">plane has turned <b>${Math.abs(turned).toFixed(1)}°</b></span>` +
    `<span class="r"><span class="sub">drawing: ${frame}</span></span>`;
}

// un pas de simulation (dt en secondes réelles) : la boucle et l'export (epic10) le partagent
function fouStep(dt){
  fouAnim.t += dt * FOU_TIMEX / 3600;
  fouAnim.plane += FRAD(fouRate(fouAnim.phi)) * dt * FOU_TIMEX / 3600;
  fouAnim.swing += 2 * Math.PI * FOU_SWING_HZ * dt;
  // the chalk mark, recorded in FLOOR coordinates so both modes read the same list
  const rr = Math.cos(fouAnim.swing) * 0.88;
  fouAnim.trail.push({ x: rr * Math.cos(fouAnim.plane), y: rr * Math.sin(fouAnim.plane) });
  if(fouAnim.trail.length > 900) fouAnim.trail.shift();
}

function fouAnimFrame(ts){
  fouAnim.raf = 0;
  const cv = $("fouAnimCanvas");
  if(!cv || $("tab-fou").hidden){ return; }               // tab closed: let the loop die
  const now = ts / 1000;
  const dt = (fouAnim.last && fouAnim.running) ? Math.min(0.1, now - fouAnim.last) : 0;
  fouAnim.last = now;
  if(dt > 0) fouStep(dt);
  fouDrawAnim();
  if(now - fouAnim.readAt > 0.2){ fouAnimReads(); fouAnim.readAt = now; }
  if(fouAnim.running) fouAnimStart();
}
function fouAnimStart(){
  if(fouAnim.raf || !fouAnim.running) return;
  const cv = $("fouAnimCanvas");
  if(!cv || $("tab-fou").hidden) return;
  fouAnim.raf = requestAnimationFrame(fouAnimFrame);
}

/* VUE OBLIQUE ET QUILLES (2026-09-24, « les animations sont un peu faibles »).
   Même état, mêmes deux modes que le legacy (fouAnim.plane, floorRot) -- seul
   le dessin change : le sol vu de biais (ellipse), la masse au bout de son fil
   depuis un pivot au-dessus du centre, son ombre, et un cercle de QUILLES au
   bord, comme dans les vraies démonstrations. Une quille tombe quand le plan
   d'oscillation passe sur elle, à l'un OU l'autre bout : c'est exact, et c'est
   la rotation du plan rendue visible sans lire un chiffre. En vue oblique les
   angles au sol sont raccourcis : dit sur la figure ; la lecture chiffrée,
   elle, reste exacte. */
const FOU_PINS = 36;
function fouDrawAnim(){
  const cv = $("fouAnimCanvas"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
  const R = Math.min(W * 0.42, H * 0.5), K = 0.5;           // K : écrasement vertical du sol vu de biais
  const cx = W / 2, cy = H * 0.58, pivotY = 10;               // sol + lettre « S » au-dessus des deux lignes du bas
  const floorRot = fouAnim.mode === "swing" ? -fouAnim.plane : 0;
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  // point du sol (coordonnées SOL, disque unité) → écran ; z en hauteur (unités R)
  const S = (x, y, z = 0) => { const [u, v] = rot(x, y, floorRot); return [cx + u * R, cy + v * R * K - z * R]; };

  // ---- le sol : ellipse ombrée, graduations, points cardinaux (peints SUR le sol)
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * K * 0.4, R * 0.1, cx, cy, R);
  g.addColorStop(0, "#f4efe4"); g.addColorStop(1, "#ddd3bf");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * K, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2; ctx.stroke();
  for(let d = 0; d < 360; d += 5){
    const a = FRAD(d - 90), big = d % 30 === 0, r0 = big ? 0.9 : 0.945;
    const [x0, y0] = S(Math.cos(a) * r0, Math.sin(a) * r0), [x1, y1] = S(Math.cos(a), Math.sin(a));
    ctx.strokeStyle = big ? "rgba(21,26,33,.42)" : "rgba(21,26,33,.16)"; ctx.lineWidth = big ? 1.5 : 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  ctx.font = "bold 12px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#7a6a4f";
  ["N", "E", "S", "W"].forEach((c, k) => { const a = FRAD(k * 90 - 90), [x, y] = S(Math.cos(a) * 1.1, Math.sin(a) * 1.1); ctx.fillText(c, x, y + 4); });
  // la trace à la craie, en coordonnées sol
  if(fouAnim.trail.length > 1){
    ctx.lineWidth = 1.1;
    for(let k = 1; k < fouAnim.trail.length; k++){
      const p = fouAnim.trail[k - 1], q = fouAnim.trail[k];
      const [x0, y0] = S(p.x, p.y), [x1, y1] = S(q.x, q.y);
      ctx.strokeStyle = `rgba(15,118,110,${(0.06 + 0.5 * k / fouAnim.trail.length).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }

  // ---- la masse : position au sol (coordonnées sol), petite remontée aux extrémités
  const th = fouAnim.plane, c = Math.cos(fouAnim.swing), amp = 0.88;
  const bxF = c * amp * Math.cos(th), byF = c * amp * Math.sin(th);
  const lift = 0.09 + 0.12 * (1 - Math.sqrt(Math.max(0, 1 - (c * amp) ** 2)));
  const [bx, by] = S(bxF, byF, lift), [sx, sy] = S(bxF, byF, 0);

  // ---- les quilles : tombées si le plan (qui tourne toujours dans le même sens) les a déjà balayées
  const sgn = Math.sign(fouRate(fouAnim.phi)) || 1, swept = Math.abs(fouAnim.plane);
  const pins = [];
  for(let k = 0; k < FOU_PINS; k++){
    const a = (2 * Math.PI * k) / FOU_PINS;
    let d = ((sgn * a) % Math.PI + Math.PI) % Math.PI;       // angle à balayer avant de l'atteindre
    if(d < 1e-6) d = Math.PI;                                // la quille sous le plan de départ reste debout jusqu'au demi-tour
    const down = swept >= d;
    const [px, py] = S(Math.cos(a) * 0.97, Math.sin(a) * 0.97);
    pins.push({ a, down, px, py });
  }
  const drawPin = (p) => {
    if(p.down){
      const [ox, oy] = S(Math.cos(p.a) * 1.06, Math.sin(p.a) * 1.06);   // couchée vers l'extérieur
      ctx.strokeStyle = "#b8ab92"; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(ox, oy); ctx.stroke(); ctx.lineCap = "butt";
    } else {
      ctx.strokeStyle = "#8a5a2b"; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.px, p.py - R * 0.09); ctx.stroke(); ctx.lineCap = "butt";
      ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.arc(p.px, p.py - R * 0.09, 2.2, 0, 7); ctx.fill();
    }
  };
  pins.filter(p => p.py <= sy).forEach(drawPin);                  // derrière la masse

  // ombre, fil, masse
  ctx.fillStyle = "rgba(21,26,33,.22)"; ctx.beginPath(); ctx.ellipse(sx, sy, 9, 9 * K, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = "rgba(21,26,33,.55)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(cx, pivotY); ctx.lineTo(bx, by); ctx.stroke();
  ctx.fillStyle = "#5b6470"; ctx.fillRect(cx - 14, pivotY - 4, 28, 4);             // la fixation au plafond
  const bg = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, 9);
  bg.addColorStop(0, "#e9f5f3"); bg.addColorStop(0.5, "#14937f"); bg.addColorStop(1, "#0b4f47");
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, 9, 0, 7); ctx.fill();

  pins.filter(p => p.py > sy).forEach(drawPin);                   // devant la masse

  // ---- bandeau d'honnêteté : les distorsions, dites sur la figure
  ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.fillStyle = "#8b93a0";
  ctx.fillText(`time ×${FOU_TIMEX} · swing rate not to scale`, 8, H - 22);
  ctx.fillText("oblique view: floor angles foreshortened, reading exact", 8, H - 8);
  const down = pins.filter(p => p.down).length;
  ctx.textAlign = "right"; ctx.fillStyle = "#8a5a2b";
  ctx.fillText(`pins down ${down}/${FOU_PINS}`, W - 8, 16);
  if(Math.abs(fouRate(fouAnim.phi)) < 1e-6){
    ctx.textAlign = "center"; ctx.fillStyle = "#b45309";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.fillText("sin 0 = 0 — nothing turns, in either frame", cx, 30);
  }
}

// controls. These live outside <form id="form">, so they wire themselves.
function wireFouAnim(){
  const on = (id, fn) => { const el = $(id); if(el) el.addEventListener("click", fn); };
  on("fouFrFloor", () => { fouSetMode("floor"); fouDrawAnim(); fouAnimReads(); });
  on("fouFrSwing", () => { fouSetMode("swing"); fouDrawAnim(); fouAnimReads(); });
  ["fouLat90", "fouLatPar", "fouLat0", "fouLatMel"].forEach(id =>
    on(id, () => { fouSetPhi(parseFloat($(id).dataset.fouphi)); fouDrawAnim(); fouAnimReads(); }));
  on("fouPlay", () => fouSetRunning(!fouAnim.running));
  on("fouReset", () => { fouAnimReset(); fouDrawAnim(); fouAnimReads(); });
  // start paused for anyone who has asked the OS for less motion
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    fouAnim.running = false;
    const el = $("fouPlay");
    if(el){ el.setAttribute("aria-pressed", "false"); el.innerHTML = "&#9654;"; }
  }
}

function drawFou(){
  fouModelTable(); fouSiteTable();
  if($("tab-fou").hidden) return;             // canvases have zero width when hidden
  drawFouOmega(); drawFouRose(); drawFouLat();
  fouAnim.last = 0;                           // drop the stale timestamp across a tab switch
  fouDrawAnim(); fouAnimReads(); fouAnimStart();
}

// export (epic10/UC02) : l'état s'accumule (trace, plan, quilles), donc l'instant t
// est REJOUÉ par pas de 1/60 s depuis l'état affiché -- la même physique que la boucle.
// 30 s exportées = 15 h simulées (≈ 170° de rotation du plan à Paris).
function fouExportAnim(){
  const snap = () => ({ ...fouAnim, trail: fouAnim.trail.map(p => ({ ...p })) });
  let saved = null, simT = 0;
  return {
    duration: 30,
    begin(){ saved = snap(); simT = 0; if(fouAnim.raf){ cancelAnimationFrame(fouAnim.raf); fouAnim.raf = 0; } },
    frameAt(tt){
      if(tt < simT){ Object.assign(fouAnim, { ...saved, trail: saved.trail.map(p => ({ ...p })) }); simT = 0; }
      while(simT < tt - 1e-9){ const dt = Math.min(1 / 60, tt - simT); fouStep(dt); simT += dt; }
      fouDrawAnim(); fouAnimReads();
    },
    end(){ if(saved) Object.assign(fouAnim, saved, { raf: 0, last: 0 }); saved = null; fouDrawAnim(); fouAnimReads(); if(fouAnim.running) fouAnimStart(); },
    // sans le « drawing: … » : une carte montre les DEUX repères côte à côte (2026-09-27)
    readout(){ return [...($("fouAnimReads")?.children || [])].filter(c => !/drawing:/.test(c.textContent)).map(c => c.textContent.replace(/\s+/g, " ").trim()).join(" · "); },
  };
}

export function wire(){
  wireFouAnim();
  if($("fouAnimCanvas")){
    $("fouAnimCanvas").__anim = fouExportAnim();
    // les deux repères au choix : une carte exportée (epic11) les montre côte à côte, au même instant
    $("fouAnimCanvas").__variant = { get: () => fouAnim.mode, set: (m) => { fouSetMode(m); fouDrawAnim(); fouAnimReads(); } };
  }
  // l'expérience 1d est dans falsify (exp.js, 2026-11-26)
}
export function draw(){ drawFou(); }
/** teardown() du contrat d'onglet : coupe la boucle rAF sans attendre le prochain cadre. */
export function stop(){
  if(fouAnim.raf){ cancelAnimationFrame(fouAnim.raf); fouAnim.raf = 0; }
  fouAnim.last = 0;
}
