// Moteur de l'onglet grav, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html L23028-23495) par research/port_legacy_js.py :
// figures canvas, tables, expérience, écouteurs. Il cherche ses hôtes par
// id dans le document (flux verbatim src/data/prose/grav.js) et n'expose
// que wire()/draw()/stop(). Le legacy lisait #radius/#kcoef/#refr (le
// formulaire global de l'onglet sim) : ici ces lectures retombent sur les
// valeurs par défaut de la page (R = 6371 km, k = 0.13) quand l'élément
// n'existe pas -- voir legacy-helpers.js.
import { setupCanvas, niceLen } from "../../core/canvas.js";
import { makeT } from "../../core/i18n.js";
import { $, DEG, RAD, fillPresetSelect, fmtAngle, fmtDist, fmtDiff, expNum, dipSetRate, dipHm } from "../../core/legacy-helpers.js";


// ---- Gravity & level (key "grav") ----
// The one tab where the measured quantity is the FIELD, not a sightline. Three tests:
// (1) does the local vertical rotate with position, (2) does g fall with height,
// (3) does g depend on latitude. The flat steel-man is an INFINITE uniform slab, which
// passes (1) outright -- said so in the page -- and fails (2) and (3) by predicting
// exactly zero. Nothing here is drawn with vertical exaggeration; the only schematic
// element is the globe figure, which says so on the canvas.
const GRV_BIGG = 6.67430e-11;        // CODATA
const GRV_R    = 6371000;            // m, the page's mean radius
const GRV_G0   = 9.80665;            // m/s^2, standard gravity
const GRV_RHO  = 5514;               // kg/m^3, Earth's mean density (NASA fact sheet)
const GRV_OM   = 7.2921150e-5;       // rad/s
const GRV_DISC_A = 20000e3;          // flat-map pole -> rim, the same 20,000 km the magnetism tab uses

// GRS80 / IGF 1980 series. Used as the reference "what is actually measured" curve; it is
// a fit to worldwide gravimetry, not a prediction of this page's sphere -- see the callout,
// which owns the fact that a sphere only explains two thirds of the pole-equator difference.
const grvIGF = phi => {
  const s = Math.pow(Math.sin(phi * Math.PI / 180), 2);
  return 9.7803267715 * (1 + 0.0052790414*s + 0.0000232718*s*s + 0.0000001262*s*s*s + 0.0000000007*s*s*s*s);
};
const grvSphere  = h => GRV_G0 * Math.pow(GRV_R / (GRV_R + h), 2);      // globe: inverse square
const grvMGal    = a => a * 1e5;                                        // m/s^2 -> mGal
const grvGrad0   = 2 * GRV_G0 / GRV_R;                                  // |dg/dh| at the surface
const grvSigma   = GRV_G0 / (2 * Math.PI * GRV_BIGG);                   // kg/m^2 for an infinite slab
const grvDeg     = r => r * 180 / Math.PI;
// mass and mean density fall straight out of g, R and G -- Cavendish's loop, closed
const grvMass    = GRV_G0 * GRV_R * GRV_R / GRV_BIGG;
const grvDensity = grvMass / (4/3 * Math.PI * Math.pow(GRV_R, 3));

// Thickness of a disc of Earth's mean density that produces 9.80665 at the centre of its
// top face. On-axis closed form for a cylinder: g = 2*pi*G*rho*(t + a - sqrt(a^2+t^2)).
const grvDiscT = (() => {
  const f = t => 2*Math.PI*GRV_BIGG*GRV_RHO*(t + GRV_DISC_A - Math.hypot(GRV_DISC_A, t)) - GRV_G0;
  let lo = 1e3, hi = 4e7;
  for(let i = 0; i < 90; i++){ const m = 0.5*(lo + hi); if(f(m) < 0) lo = m; else hi = m; }
  return 0.5*(lo + hi);
})();

// Gravity on the top face of that disc, at distance s from the axis.
// METHOD, and why it is not a plain volume integral: the field point sits ON the body, so
// 1/r^2 diverges there and a direct grid is hopeless. Instead compute
//        disc = infinite slab  -  everything outside radius a
// The slab term is exact (2*pi*G*rho*t, straight down) and the exterior term has its nearest
// matter at (a - s), so it is smooth. Radial grid is log-spaced out to 10^4 a; the tail
// beyond that contributes below the printed precision.
// The DEPTH integral is done in closed form, which removes a whole loop and most of the error:
//   integral over z of  z/(u^2+z^2)^1.5  = 1/u - 1/sqrt(u^2+t^2)
//   integral over z of  1/(u^2+z^2)^1.5  = t/(u^2 sqrt(u^2+t^2))
// so only radius and azimuth are summed, and half the azimuth at that (mirror symmetry).
// GRID CHECK, do not shrink without repeating it: this 200 x 480 grid returns 7.347 deg at
// s = 0.2286a and 26.411 deg at 0.6884a, against 7.351 / 26.432 from a brute-force
// 600 x 100 x 1200 volume integral. The page prints 0.01 deg. An earlier version summed the
// depth numerically and took 2 s on first paint, which froze the tab; do not go back to it.
function grvDiscField(s){
  const a = GRV_DISC_A, t = grvDiscT, rho = GRV_RHO;
  const NR = 200, NP = 480, RMAX = a * 1e4;              // NP covers HALF the circle; doubled below
  const gzSlab = -2 * Math.PI * GRV_BIGG * rho * t;
  const lr0 = Math.log(a), dlr = (Math.log(RMAX) - lr0) / NR, dph = Math.PI / NP;
  if(!grvDiscField.trig){                                 // hoisted: the same 480 angles every time
    const cp = new Float64Array(NP), sp = new Float64Array(NP);
    for(let j = 0; j < NP; j++){ const ph = (j + 0.5) * dph; cp[j] = Math.cos(ph); sp[j] = Math.sin(ph); }
    grvDiscField.trig = { cp, sp };
  }
  const { cp, sp } = grvDiscField.trig;
  const t2 = t*t;
  let gx = 0, gz = 0;
  for(let i = 0; i < NR; i++){
    const rA = Math.exp(lr0 + i*dlr), rB = Math.exp(lr0 + (i+1)*dlr);
    const r = 0.5*(rA + rB), w = 2 * GRV_BIGG * rho * r * (rB - rA) * dph;
    for(let j = 0; j < NP; j++){
      const x = r*cp[j] - s, y = r*sp[j];
      const u2 = x*x + y*y, u = Math.sqrt(u2), q = Math.sqrt(u2 + t2);
      gx += w * x * t / (u2*q);                           // horizontal
      gz -= w * (1/u - 1/q);                              // vertical, pointing down
    }
  }
  return { gx: -gx, gz: gzSlab - gz };                    // total = slab - exterior
}
// ~0.1 M terms per point; still cached, since the curve wants about thirty of them.
const GRV_TILT = new Map();
function grvTilt(s){
  const key = Math.round(s);
  if(!GRV_TILT.has(key)){
    const f = grvDiscField(s);
    GRV_TILT.set(key, { tilt: Math.atan2(Math.abs(f.gx), Math.abs(f.gz)), g: Math.hypot(f.gx, f.gz) });
  }
  return GRV_TILT.get(key);
}
// Distance from the centre of the flat map to the ring that carries a given latitude:
// the azimuthal-equidistant convention the flat model publishes, 20,000 km for 180 degrees.
const grvMapR = lat => (90 - lat) * GRV_DISC_A / 180;
const GRV_STATIONS = [
  { n: "North Pole",  s: "Pole",    lat:  90   },
  { n: "Reykjavík",   s: "Reykj",   lat:  64.1 },
  { n: "Paris",       s: "Paris",   lat:  48.85 },
  { n: "Cairo",       s: "Cairo",   lat:  30   },
  { n: "Equator",     s: "Equator", lat:   0   },
  { n: "Sydney",      s: "Sydney",  lat: -33.9 },
  { n: "Ushuaia",     s: "Ushuaia", lat: -54.8 },
];

// ---------- 01: where is down ----------
function drawGravGlobe(){
  const cv = $("gravDG"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0,0,W,H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0,0,W,H);
  const narrow = W < 420;
  const cx = W/2, cy = H*0.55, Rp = Math.min(W*0.34, H*0.36);

  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2;
  ctx.fillStyle = "rgba(15,118,110,0.06)";
  ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 2*Math.PI); ctx.fill(); ctx.stroke();

  const angs = [-75, -40, -8, 26, 62, 100].map(d => d*Math.PI/180);   // from the top, clockwise
  angs.forEach((A, i) => {
    const ux = Math.sin(A), uy = -Math.cos(A);                        // outward unit
    const px = cx + Rp*ux, py = cy + Rp*uy;
    // plumb line: from a little above the surface, down the radius, dashed on to the centre
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.6; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(px + ux*Rp*0.20, py + uy*Rp*0.20); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = "#151a21";
    ctx.beginPath(); ctx.arc(px + ux*Rp*0.20, py + uy*Rp*0.20, 2.6, 0, 2*Math.PI); ctx.fill();
    if(i === 0 || i === 3){
      ctx.strokeStyle = "rgba(21,26,33,0.32)"; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, cy); ctx.stroke(); ctx.setLineDash([]);
    }
    // bubble level: a bar tangent to the surface, sitting on it
    const tx = -uy, ty = ux, L = Rp*0.20;
    const bx = px + ux*3, by = py + uy*3;
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(bx - tx*L, by - ty*L); ctx.lineTo(bx + tx*L, by + ty*L); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx + ux*1.5, by + uy*1.5, 2.4, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
  });
  ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 2*Math.PI); ctx.fill();
  ctx.font = "11px " + getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText(narrow ? t("gv-cv-bubble-narrow") : t("gv-cv-bubble-wide"), cx, 18);
  ctx.textAlign = "left";
  ctx.fillText("R", cx + 6, cy + 14);
  // OPENER CAPTION, v108: what the figure is, plus the one thing the tab never
  // repeats -- that the directions are exact and only the heights are schematic.
  // Everything else this caption used to say, section 01 says three lines below.
  $("gravDGCap").textContent = "Globe. Six plumb lines, six bubble levels, each perpendicular to its own radius. "
    + "Directions are exact; the observers' heights are schematic.";
}

function drawGravFlat(){
  const cv = $("gravDF"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0,0,W,H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0,0,W,H);
  const narrow = W < 460;
  const PADL = 14, PADR = 14, gy = H*0.70;
  const x0 = PADL, x1 = W - PADR;
  ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();
  ctx.fillStyle = "rgba(122,106,79,0.08)"; ctx.fillRect(x0, gy, x1-x0, H-gy);

  const fr = narrow ? [0, 0.35, 0.62, 0.86] : [0, 0.23, 0.42, 0.62, 0.78, 0.92];
  const L = Math.min(H*0.36, 64);
  ctx.font = "10px " + getComputedStyle(document.body).fontFamily;
  fr.forEach(f => {
    const px = x0 + (x1 - x0)*f;
    const th = grvTilt(f * GRV_DISC_A).tilt;                       // leans back toward the centre
    // EMPHASIS REVERSED, v109. The infinite plane is the STEEL-MAN, so it is the
    // one drawn solid: its verticals are exactly perpendicular, which is the whole
    // strength of that version. Until now it was a faint grey dash while the
    // finite disc's LEANING plumb line was drawn bold in amber -- so the panel
    // read as "the flat model's plumb bobs are not perpendicular", which is the
    // opposite of what the steel-man claims and what rule 2 requires be shown
    // first. Reported by the owner, who read exactly that off the picture.
    ctx.strokeStyle = "#151a21"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(px, gy - L); ctx.lineTo(px, gy); ctx.stroke();
    ctx.fillStyle = "#151a21"; ctx.beginPath(); ctx.arc(px, gy - L, 2.8, 0, 2*Math.PI); ctx.fill();
    // finite disc: tilted toward the centre (to the left), now the secondary line
    const tx = px + L*Math.sin(th), ty = gy - L*Math.cos(th);
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.6; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(px, gy); ctx.stroke(); ctx.setLineDash([]);
    // the level that goes with it
    const bx = -Math.cos(th), by = -Math.sin(th), BL = 15;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px - bx*BL, gy - 3 - by*BL); ctx.lineTo(px + bx*BL, gy - 3 + by*BL); ctx.stroke();
    ctx.fillStyle = "#b45309"; ctx.textAlign = "center";
    ctx.fillText(grvDeg(th).toFixed(1) + "\u00B0", px, gy + 15);
  });
  ctx.textAlign = "left"; ctx.fillStyle = "#5b6470";
  ctx.fillText(t("gv-cv-centre-disc"), x0, gy + 30);
  ctx.textAlign = "right";
  ctx.fillText(t("gv-cv-rim"), x1, gy + 30);
  ctx.textAlign = "left"; ctx.font = "11px " + getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#5b6470";
  ctx.fillText(narrow ? t("gv-cv-black-narrow") : t("gv-cv-black-wide"), x0, 18);
  ctx.fillStyle = "#b45309";
  ctx.fillText(narrow ? t("gv-cv-amber-narrow") : t("gv-cv-amber-wide"), x0, 33);
  // The steel-man stays: the strongest flat case is the one drawn. Rule 2 has to
  // be read WITH the figure, not after it, so it cannot go down into the prose.
  $("gravDFCap").textContent = "Flat, at its strongest. An infinite slab holds every vertical perpendicular; "
    + "a disc with a rim cannot, and section 02 weighs it.";
}

function drawGravDisc(){
  const cv = $("gravDisc"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0,0,W,H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0,0,W,H);
  const PADL = 52, PADR = 16, PADT = 22, PADB = 34;
  const xw = W - PADL - PADR, yh = H - PADT - PADB;
  const maxT = 40;
  const X = f => PADL + xw*f, Y = d => PADT + yh*(1 - d/maxT);
  ctx.strokeStyle = "#d7d3c8"; ctx.lineWidth = 1; ctx.font = "10px " + getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#5b6470";
  for(let d = 0; d <= maxT; d += 10){
    ctx.beginPath(); ctx.moveTo(PADL, Y(d)); ctx.lineTo(W-PADR, Y(d)); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(d + "\u00B0", PADL - 6, Y(d) + 3);
  }
  for(let f = 0; f <= 1.001; f += 0.25){
    ctx.beginPath(); ctx.moveTo(X(f), PADT); ctx.lineTo(X(f), H-PADB); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillText((f*20000).toFixed(0), X(f), H - PADB + 14);
  }
  // flat, infinite plane: exactly zero everywhere
  ctx.strokeStyle = "#151a21"; ctx.lineWidth = 2; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(1), Y(0)); ctx.stroke(); ctx.setLineDash([]);
  // the disc
  ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.4; ctx.beginPath();
  for(let i = 0; i <= 19; i++){
    const f = i/20;                                    // stop short of the rim: the integral is stiff there
    const p = [X(f), Y(grvDeg(grvTilt(f*GRV_DISC_A).tilt))];
    i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
  }
  ctx.stroke();
  ctx.fillStyle = "#b45309"; ctx.textAlign = "left"; ctx.font = "11px " + getComputedStyle(document.body).fontFamily;
  ctx.fillText(t("gv-cv-disc-radius"), X(0.06), Y(30));
  ctx.fillStyle = "#151a21";
  ctx.fillText(t("gv-cv-infinite-plane-meas"), X(0.30), Y(2.6));
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText(t("gv-cv-dist-from-centre"), PADL + xw/2, H - 4);
  ctx.save(); ctx.translate(12, PADT + yh/2); ctx.rotate(-Math.PI/2); ctx.textAlign = "center";
  ctx.fillText(t("gv-cv-tilt-vertical"), 0, 0); ctx.restore();
  $("gravDiscCap").textContent = "Tilt of the local vertical across a disc of radius 20,000 km and Earth's mean density, computed by integrating the "
    + "disc's own gravity. It is zero at exactly one point — the centre. A spirit level is level nowhere else on it.";
}

// ---------- 03: the gradient ----------
function drawGravGrad(){
  const cv = $("gravGrad"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0,0,W,H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0,0,W,H);
  const narrow = W < 480;
  const PADL = 58, PADR = 16, PADT = 22, PADB = 34;
  const xw = W - PADL - PADR, yh = H - PADT - PADB;
  const hMax = 12000, dMax = 3800;                                     // m, mGal
  const X = h => PADL + xw*(h/hMax), Y = d => PADT + yh*(d/dMax);
  ctx.strokeStyle = "#d7d3c8"; ctx.lineWidth = 1;
  ctx.font = "10px " + getComputedStyle(document.body).fontFamily; ctx.fillStyle = "#5b6470";
  for(let d = 0; d <= dMax; d += 1000){
    ctx.beginPath(); ctx.moveTo(PADL, Y(d)); ctx.lineTo(W-PADR, Y(d)); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText("\u2212" + d, PADL - 6, Y(d) + 3);
  }
  for(let h = 0; h <= hMax; h += 3000){
    ctx.beginPath(); ctx.moveTo(X(h), PADT); ctx.lineTo(X(h), H-PADB); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillText((h/1000) + " km", X(h), H - PADB + 14);
  }
  ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.4; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(hMax), Y(0)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.4; ctx.beginPath();
  for(let i = 0; i <= 80; i++){
    const h = hMax*i/80, d = grvMGal(GRV_G0 - grvSphere(h));
    i ? ctx.lineTo(X(h), Y(d)) : ctx.moveTo(X(h), Y(d));
  }
  ctx.stroke();
  [[276, "Eiffel"], [4808, "Mt Blanc"], [11000, "cruise"]].forEach(([h, n]) => {
    const d = grvMGal(GRV_G0 - grvSphere(h));
    ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(X(h), Y(d), 3.2, 0, 2*Math.PI); ctx.fill();
    if(!narrow){ ctx.textAlign = "left"; ctx.font = "10px " + getComputedStyle(document.body).fontFamily;
      ctx.fillText(n, X(h) + 6, Y(d) + 3); }
  });
  ctx.font = "11px " + getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#b45309"; ctx.textAlign = "left";
  ctx.fillText(narrow ? t("gv-cv-flat-narrow") : t("gv-cv-flat-wide"), PADL + 8, Y(0) - 8);
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText(t("gv-cv-height-above"), PADL + xw/2, H - 4);
  ctx.save(); ctx.translate(13, PADT + yh/2); ctx.rotate(-Math.PI/2); ctx.textAlign = "center";
  ctx.fillText(t("gv-cv-change-g"), 0, 0); ctx.restore();
  $("gravGradCap").textContent = "Loss of gravity with height. True scale, no exaggeration. The teal curve is g\u2080R\u00B2/(R+h)\u00B2; the amber line is "
    + "Gauss's law for an infinite slab, which is height-independent exactly. A field gravimeter resolves 0.01 mGal, so the gap is measurable inside a building.";
}

// ---------- 04: latitude ----------
function drawGravLat(){
  const cv = $("gravLat"); if(!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  ctx.clearRect(0,0,W,H); ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0,0,W,H);
  const narrow = W < 480;
  const PADL = 60, PADR = 16, PADT = 22, PADB = 34;
  const xw = W - PADL - PADR, yh = H - PADT - PADB;
  const gLo = 9.772, gHi = 9.836;
  const X = p => PADL + xw*((p + 90)/180), Y = g => PADT + yh*(1 - (g - gLo)/(gHi - gLo));
  ctx.strokeStyle = "#d7d3c8"; ctx.lineWidth = 1;
  ctx.font = "10px " + getComputedStyle(document.body).fontFamily; ctx.fillStyle = "#5b6470";
  for(let g = 9.775; g <= gHi; g += 0.015){
    ctx.beginPath(); ctx.moveTo(PADL, Y(g)); ctx.lineTo(W-PADR, Y(g)); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(g.toFixed(3), PADL - 6, Y(g) + 3);
  }
  [-90,-45,0,45,90].forEach(p => {
    ctx.beginPath(); ctx.moveTo(X(p), PADT); ctx.lineTo(X(p), H-PADB); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillText(p + "\u00B0", X(p), H - PADB + 14);
  });
  // rotation alone on a sphere, anchored at the pole
  const gPole = grvIGF(90);
  ctx.strokeStyle = "rgba(21,26,33,0.45)"; ctx.lineWidth = 1.6; ctx.setLineDash([4,4]); ctx.beginPath();
  for(let i = 0; i <= 90; i++){
    const p = -90 + 180*i/90;
    const g = gPole - GRV_OM*GRV_OM*GRV_R*Math.pow(Math.cos(p*Math.PI/180), 2);
    i ? ctx.lineTo(X(p), Y(g)) : ctx.moveTo(X(p), Y(g));
  }
  ctx.stroke(); ctx.setLineDash([]);
  // measured reference curve
  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.6; ctx.beginPath();
  for(let i = 0; i <= 90; i++){ const p = -90 + 180*i/90;
    i ? ctx.lineTo(X(p), Y(grvIGF(p))) : ctx.moveTo(X(p), Y(grvIGF(p))); }
  ctx.stroke();
  // any flat model: one value everywhere
  ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.4; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(X(-90), Y(GRV_G0)); ctx.lineTo(X(90), Y(GRV_G0)); ctx.stroke(); ctx.setLineDash([]);
  // Richer's Cayenne value, inferred from the clock rate -- the one observed point on the plot
  const gPar = grvIGF(48.85), gRich = gPar*Math.pow(1 - 148/86400, 2);
  ctx.fillStyle = "#151a21";
  ctx.beginPath(); ctx.arc(X(4.94), Y(gRich), 4, 0, 2*Math.PI); ctx.fill();
  ctx.font = "10px " + getComputedStyle(document.body).fontFamily; ctx.textAlign = "left";
  ctx.fillText(narrow ? t("gv-cv-richer-narrow") : t("gv-cv-richer-wide"), X(4.94) + 7, Y(gRich) + 3);
  ctx.font = "11px " + getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#b45309"; ctx.textAlign = "left";
  ctx.fillText(narrow ? t("gv-cv-any-flat-narrow") : t("gv-cv-any-flat-wide"), PADL + 8, Y(GRV_G0) - 7);
  ctx.fillStyle = "#0f766e";
  ctx.fillText(narrow ? t("gv-cv-measured-narrow") : t("gv-cv-measured-wide"), PADL + 8, Y(grvIGF(70)) - 7);
  ctx.fillStyle = "#5b6470"; ctx.textAlign = "center";
  ctx.fillText(t("gv-cv-latitude"), PADL + xw/2, H - 4);
  ctx.save(); ctx.translate(13, PADT + yh/2); ctx.rotate(-Math.PI/2); ctx.textAlign = "center";
  ctx.fillText(t("gv-cv-g-unit"), 0, 0); ctx.restore();
  $("gravLatCap").textContent = "Gravity against latitude. Teal: the international reference formula, fitted to worldwide gravimetry. Grey dashed: what "
    + "rotation alone would do to a sphere — about two thirds of the observed spread; the rest is the equatorial bulge. Amber: every flat model, which "
    + "predicts one number everywhere. The black dot is Richer's 1672 clock rate converted to g, the only observation plotted.";
}

// ---------- tables ----------
function gvVertTable(){
  const tb = $("gvVertRows"); if(!tb) return;
  const rows = [1e3, 1e4, 111200, 5e5, 1e6, 4.572e6];
  tb.innerHTML = rows.map(d => {
    const globe = grvDeg(d/GRV_R);
    const disc = grvDeg(grvTilt(Math.min(d, 0.95*GRV_DISC_A)).tilt);
    const fmt = a => a < 1 ? (a*60).toFixed(1) + "\u2032" : a.toFixed(2) + "\u00B0";
    return `<tr><td>${fmtDist(d)}</td><td class="hot">${fmt(globe)}</td>` +
      `<td class="cold">0.000\u00B0</td><td class="cold">${fmt(disc)}</td><td><b>${fmt(globe)}</b></td></tr>`;
  }).join("");
}

function gvDiscTable(){
  const tb = $("gvDiscRows"); if(!tb) return;
  tb.innerHTML = GRV_STATIONS.map(st => {
    const r = grvMapR(st.lat), T = grvTilt(Math.min(r, 0.95*GRV_DISC_A));
    const deg = grvDeg(T.tilt);
    return `<tr><td>${st.n}</td><td>${(r/1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km</td>` +
      `<td class="cold">${deg.toFixed(2)}\u00B0</td><td class="cold">${(100*Math.tan(T.tilt)).toFixed(0)}%</td>` +
      `<td class="hot">0%</td></tr>`;
  }).join("");
  $("gvDiscNote").innerHTML =
    `Computed, not asserted: the disc is 20,000 km in radius and <b>${(grvDiscT/1000).toFixed(0)} km</b> thick at Earth's mean
     density of ${GRV_RHO} kg/m\u00B3, which is what it takes to feel 9.807 m/s\u00B2 at its centre. Making it thinner and denser
     barely helps — the tilt at the latitude of Paris only moves between about 7\u00B0 and 9\u00B0 across every thickness from
     1,000 km to 40,000 km, because it is set by the position of the <em>rim</em>, not by how the mass is stacked. The last
     column is the slope a bubble level actually shows, which is zero to within a few arcseconds everywhere on Earth.`;
}

function gvHeightTable(){
  const tb = $("gvHRows"); if(!tb) return;
  const rows = [[3, "one floor of a building"], [276, "Eiffel Tower, top platform"], [828, "Burj Khalifa"],
    [4808, "Mont Blanc"], [11000, "airliner at cruise"]];
  tb.innerHTML = rows.map(([h, n]) => {
    const d = grvMGal(GRV_G0 - grvSphere(h));
    return `<tr><td>${dipHm(h)} <span class="vac">${n}</span></td><td class="hot">\u2212${d.toFixed(d < 10 ? 2 : 1)} mGal</td>` +
      `<td class="cold">0.00 mGal</td><td><b>${(d/0.01).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\u00D7</b></td></tr>`;
  }).join("");
}

function gvLatTable(){
  const tb = $("gvLatRows"); if(!tb) return;
  const gPar = grvIGF(48.85), gPole = grvIGF(90);
  const rows = [90, 60, 48.85, 30, 4.94, 0];
  tb.innerHTML = rows.map(p => {
    const g = grvIGF(p);
    const rate = 86400*(1 - Math.sqrt(g/gPar));                    // s/day a Paris-set clock loses
    const nm = p === 4.94 ? "4.94\u00B0 Cayenne" : p === 48.85 ? "48.85\u00B0 Paris" : p + "\u00B0";
    return `<tr><td>${nm}</td><td class="hot">${g.toFixed(5)}</td><td>${((g-gPole)*1000).toFixed(1)} mm/s\u00B2</td>` +
      `<td>${rate >= 0 ? "\u2212" : "+"}${Math.abs(rate).toFixed(0)} s</td><td class="cold">no change</td></tr>`;
  }).join("");
  const gCay = grvIGF(4.94), pred = 86400*(1 - Math.sqrt(gCay/gPar));
  $("gvLatNote").innerHTML =
    `Richer's clock lost <b>2 min 28 s</b> = 148 s per day at Cayenne. The formula above predicts <b>${pred.toFixed(0)} s</b>
     for that pair of latitudes, so he was ${(100*(148/pred - 1)).toFixed(0)}% high — an overshoot his contemporaries already
     blamed on the tropical heat lengthening the pendulum rod, since brass expands about 19 parts per million per degree.
     The direction, the size and the sign are right, from an instrument built in 1671. Every flat model on offer predicts
     that the clock keeps perfect time in Cayenne.`;
}

function gvModelTable(){
  const tb = $("gvModelRows"); if(!tb) return;
  const yes = '<td class="hot">yes \u2713</td>', no = '<td class="cold">no \u2717</td>';
  const rows = [
    ["Globe, radius 6,371 km", '<td class="hot">yes, d/R \u2713</td>', '<td class="hot">yes, 2g/R \u2713</td>', '<td class="hot">yes, sin\u00B2\u03C6 \u2713</td>'],
    ["Flat: infinite slab of matter", '<td class="cold">no \u2717</td>', no, no],
    ["Flat: disc, rim at 20,000 km", '<td class="cold">yes, but wrong way \u2717</td>', '<td class="cold">weakly, wrong sign \u2717</td>', no],
    ["Flat: disc accelerating at 9.8 m/s\u00B2", '<td class="cold">no \u2717</td>', no, no],
    ["Density and buoyancy only", '<td class="cold">no prediction</td>', '<td class="cold">no prediction</td>', '<td class="cold">no prediction</td>'],
  ];
  tb.innerHTML = rows.map(r => `<tr><td>${r[0]}</td>${r[1]}${r[2]}${r[3]}</tr>`).join("");
}

function gvStatics(){
  const set = (id, v) => { const el = $(id); if(el) el.textContent = v; };
  set("gvSigma", (grvSigma/1e9).toFixed(1) + " \u00D7 10\u2079 kg/m\u00B2");
  set("gvSlabT", (grvSigma/GRV_RHO/1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " km");
  set("gvGrad", "\u2212" + (grvGrad0*1e5).toFixed(4) + " mGal/m");
  set("gvRfromG", (2*GRV_G0/3.086e-6/1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " km");
  // NOTE: these two live inside a TAGGED paragraph, so they are EMPTY in the markup --
  // the i18n walker only records text nodes that are non-empty when it snapshots, which is
  // what stops a language change from overwriting a computed number. Same trick as .objname.
  set("gvMass", " " + (grvMass/1e24).toFixed(2) + " \u00D7 10\u00B2\u2074 kg");
  set("gvDens", " " + grvDensity.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " kg/m\u00B3");
}

function updateExpGv(){
  const out = $("expGvOut"); if(!out) return;
  const a = expNum("expGvA", 43.3), b = expNum("expGvB", 50.6);
  const L = Math.max(0.1, expNum("expGvL", 2)), M = Math.max(0.1, expNum("expGvM", 10));
  const gA = grvIGF(a), gB = grvIGF(b), dg = gB - gA;
  const rel = dg/gA;
  const TA = 2*Math.PI*Math.sqrt(L/gA), TB = 2*Math.PI*Math.sqrt(L/gB);
  const n100 = 100*Math.abs(TA - TB);
  const dm = 1000*M*Math.abs(rel);                                     // grams read on a force-reading balance
  out.innerHTML =
    `<div>Globe: g = <span class="g">${gA.toFixed(5)}</span> at ${a.toFixed(1)}\u00B0 and <span class="g">${gB.toFixed(5)} m/s\u00B2</span>
       at ${b.toFixed(1)}\u00B0 &nbsp;\u2192&nbsp; \u0394g = <b>${(Math.abs(dg)*1e5).toFixed(1)} mGal</b> (${(Math.abs(rel)*100).toFixed(4)}%)</div>
     <div>Every flat model: \u0394g = <span class="f">0.0 mGal</span>, at both places, exactly</div>
     <div>Pendulum of ${L.toFixed(2)} m: period ${TA.toFixed(5)} s vs ${TB.toFixed(5)} s &nbsp;\u2192&nbsp;
       <b>${n100.toFixed(2)} s</b> apart over 100 swings</div>
     <div>${M.toFixed(1)} kg on a force-reading balance: <b>${dm.toFixed(1)} g</b> difference</div>`;
  const ok = n100 > 0.05 || dm > 0.5;
  $("expGvV").innerHTML = ok
    ? `<b>Verdict rule.</b> If the two places really do differ, you will see it: ${n100.toFixed(2)} s over 100 swings is
       within reach of a phone timing the swings, and ${dm.toFixed(1)} g is readable on a 0.1 g balance. Measure a
       <em>difference of zero</em>, repeatably, with an instrument that can resolve this much, and the flat models win this
       test outright — no amount of curvature elsewhere would save the prediction.`
    : `<b>Verdict rule.</b> This pair is too close together to be diagnostic: ${n100.toFixed(2)} s over 100 swings and
       ${dm.toFixed(1)} g on the balance are below what ordinary kit resolves. Finding no difference here would prove
       nothing. Move the two latitudes apart, or lengthen the pendulum, until the numbers above clear your instrument.`;
}

function drawGrav(){
  updateExpGv();
  if($("tab-grav").hidden) return;
  gvStatics();
  drawGravGlobe(); drawGravFlat(); drawGravDisc(); drawGravGrad(); drawGravLat();
  gvVertTable(); gvDiscTable(); gvHeightTable(); gvLatTable(); gvModelTable();
}
// the four calculator inputs live outside <form id="form">, so they carry their own listener

let t = (k) => k;

export function wire(){
  t = makeT(document.documentElement.lang || "en", "grav");
  ["expGvA","expGvB","expGvL","expGvM"].forEach(id => $(id)?.addEventListener("input", updateExpGv));
}
export function draw(){ drawGrav(); }
export function stop(){}
