// Animations de l'onglet atmo (epic29, 2026-10-17).
import { anim2d, text, disc, arrow, stamp2d, INK, SOFT, FAINT, GLOBE, FLAT, PAPER, SEA } from "../../core/anim2d.js";
import { ussa, scaleHeight, LAYERS, plasmaFreq, reflects, incidence, hopKm, R_EARTH_KM, impactFlux, netGasHeat, ramHeat, SIGMA, S_SUN, plateOrbit, plateEq } from "./logic.js";

// petit générateur pseudo-aléatoire déterministe (les exports vidéo redonnent les mêmes images)
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
const split = (W, H) => { const narrow = W < 560; return narrow ? { narrow, L: [0, 0, W, H * 0.5], Rp: [0, H * 0.5, W, H * 0.5] } : { narrow, L: [0, 0, W * 0.5, H], Rp: [W * 0.5, 0, W * 0.5, H] }; };

/* ---- A. une colonne d'air sans couvercle : la pesanteur suffit ---------------------------------------------------- */
// N particules, vitesses tirées d'une loi de Maxwell (écart-type σ par composante), pesanteur g vers le bas, rebond sur le sol,
// AUCUN plafond, bords latéraux périodiques. Dans ces unités la hauteur d'échelle est H = σ²/g. L'histogramme des hauteurs suit
// la loi exponentielle n ∝ e^(−h/H) sans qu'aucune paroi la tienne. À gauche, l'échelle vraie : 1 H = 8,4 km (air à 288 K).
export function mountColumn(canvas, tr, lang = "en") {
  const N = 700, r = rng(7), Hm = 1, g = 1, sig = Math.sqrt(g * Hm);       // unités : H = 1
  const P = Array.from({ length: N }, () => ({ x: r(), y: -Math.log(1 - r()) * Hm, vx: gauss(r) * sig * 0.3, vy: gauss(r) * sig }));
  let tPrev = 0;
  const Hkm = scaleHeight(288.15) / 1000, nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  // les étiquettes ne changent pas : formatées une fois (toLocaleString à chaque image coûte cher dans Firefox)
  const KM = Array.from({ length: 6 }, (_, k) => `${nf(k * Hkm, 0)} km`), HPA = Array.from({ length: 4 }, (_, k) => `${nf(ussa(k * Hkm).p / 100, 0)} hPa`);
  return anim2d(canvas, { span: 30, u0: 0, fps: 60, draw(ctx, W, Hc, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, Hc);
    // avance la simulation jusqu'à u (pas fixe ; un saut en arrière -- boucle, export -- repart de l'état présent)
    const t = u * 30 * 1.5; let dt = t - tPrev; if (dt < 0 || dt > 2) dt = 0.03; tPrev = t;
    for (let s = 0, n = Math.ceil(dt / 0.01); s < n; s++) { const h = dt / n; for (const p of P) { p.vy -= g * h; p.y += p.vy * h; p.x += p.vx * h * 0.2; if (p.y < 0) { p.y = -p.y; p.vy = -p.vy; } p.x -= Math.floor(p.x); } }
    const narrow = W < 560, colW = narrow ? W * 0.55 : W * 0.42, x0 = narrow ? 44 : 60, top = 40, bot = Hc - 34, hMax = 5, py = (h) => bot - (h / hMax) * (bot - top);
    // la colonne
    ctx.fillStyle = "#f2f6fb"; ctx.fillRect(x0, top, colW, bot - top);
    ctx.strokeStyle = "#7a6a4f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 4, bot + 1.5); ctx.lineTo(x0 + colW + 4, bot + 1.5); ctx.stroke();
    // les molécules : UN tracé, UN remplissage (700 remplissages séparés coûtaient l'essentiel de l'image)
    let above = 0;
    ctx.fillStyle = GLOBE; ctx.beginPath();
    for (const p of P) { if (p.y > hMax) { above++; continue; } const X = x0 + p.x * colW, Y = py(p.y); ctx.moveTo(X + 1.8, Y); ctx.arc(X, Y, 1.8, 0, 2 * Math.PI); }
    ctx.fill();
    // l'échelle vraie : hauteurs en H et en km, pression de la table 1976
    for (let k = 0; k <= hMax; k++) {
      ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, py(k)); ctx.lineTo(x0 + colW, py(k)); ctx.stroke();
      text(ctx, KM[k], x0 - 6, py(k) + 4, { size: 9.5, c: SOFT, align: "right" });
    }
    text(ctx, `↑ ${above} ${tr("an-col-above", "above the frame, coming back down")}`, x0, top - 8, { size: 10, c: SOFT, maxW: colW });
    text(ctx, tr("an-col-nolid", "no lid"), x0 + colW / 2, top + 14, { size: 11, bold: true, c: FLAT, align: "center" });
    // l'histogramme et la loi exponentielle
    const hx0 = x0 + colW + 24, hx1 = W - 12, bins = 20, cnt = new Array(bins).fill(0);
    for (const p of P) { const b = Math.floor((p.y / hMax) * bins); if (b >= 0 && b < bins) cnt[b]++; }
    const dh = hMax / bins, scale = (hx1 - hx0) / (N * (1 - Math.exp(-dh)) * 1.1);
    cnt.forEach((c, b) => { ctx.fillStyle = "rgba(29,78,216,.25)"; ctx.fillRect(hx0, py((b + 1) * dh), c * scale, py(b * dh) - py((b + 1) * dh) - 1); });
    ctx.strokeStyle = FLAT; ctx.lineWidth = 2; ctx.beginPath();
    for (let h = 0; h <= hMax; h += 0.05) { const v = N * (Math.exp(-h) - Math.exp(-(h + dh))) * scale; h ? ctx.lineTo(hx0 + v, py(h + dh / 2)) : ctx.moveTo(hx0 + v, py(h + dh / 2)); }
    ctx.stroke();
    text(ctx, tr("an-col-hist", "molecules per slice"), hx0, top - 8, { size: 10, c: SOFT, maxW: hx1 - hx0 });
    text(ctx, "∝ e^(−h/H)", hx0 + 6, py(0.9), { size: 11, c: FLAT, mono: true });
    for (let k = 0; k <= 3; k++) text(ctx, HPA[k], hx1, py(k) - 3, { size: 9, c: SOFT, align: "right" });
    stamp2d(ctx, W, tr("an-col-st", "H = σ²/g; left axis: 1 H = 8.4 km (air at 288 K); pressures from the 1976 standard atmosphere"), false, Hc);
  } });
}

/* ---- B. les ondes radio et l'ionosphère ---------------------------------------------------------------------------- */
// Une coupe de la Terre À L'ÉCHELLE VRAIE (rayon 6 371 km, couches à leurs hauteurs), un émetteur à gauche. Toutes les 2,6 s
// une autre fréquence ; la première moitié de jour, la seconde de nuit. Pour chaque élévation de départ, l'onde se réfléchit sur
// la couche F si f ≤ foF2/cos φ (logic.js, reflects), sinon elle la traverse vers l'espace. Le sol rond limite un bond à
// 2 R arccos(R/(R+h)). De jour, la couche D absorbe les ondes sous ~5 MHz (traits pâles) ; les ondes kilométriques suivent le sol.
export const FREQS = [0.5e6, 3.5e6, 7e6, 14e6, 21e6, 28e6, 144e6];
export function mountRadio(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const SPAN = FREQS.length * 2 * 2.6;
  return anim2d(canvas, { span: SPAN, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const step = Math.floor(u * FREQS.length * 2), night = step >= FREQS.length, f = FREQS[step % FREQS.length], L = night ? LAYERS.night : LAYERS.day;
    const fo = plasmaFreq(L.F.Ne), hF = L.F.h, phase = (u * FREQS.length * 2) % 1;
    // la Terre : arc de 0 à ~110° d'angle au centre sur la largeur ; centre sous le cadre
    const arcDeg = 100, R = R_EARTH_KM, k = (W - 40) / (2 * R * Math.sin((arcDeg / 2) * Math.PI / 180)), cx = W / 2, cy = H - 40 + R * k * Math.cos((arcDeg / 2) * Math.PI / 180) - 10;
    const P = (th, hKm) => { const a = ((90 + arcDeg / 2 - th) * Math.PI) / 180; return [cx + (R + hKm) * k * Math.cos(a), cy - (R + hKm) * k * Math.sin(a)]; };
    const arcPath = (hKm, col, w, fill) => { ctx.beginPath(); for (let th = -2; th <= arcDeg + 2; th += 0.5) { const [x, y] = P(th, hKm); th > -2 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } if (fill) { ctx.fillStyle = fill; ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill(); } else { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); } };
    // couches : bande de ±40 km autour du pic, teinte selon Nₑ
    for (const [name, lay] of Object.entries(L)) {
      if (!lay) continue;
      ctx.fillStyle = name === "F" ? "rgba(109,40,217,.16)" : name === "E" ? "rgba(109,40,217,.10)" : "rgba(180,83,9,.12)";
      ctx.beginPath(); for (let th = -2; th <= arcDeg + 2; th += 1) { const [x, y] = P(th, lay.h + (name === "F" ? 60 : 15)); th > -2 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      for (let th = arcDeg + 2; th >= -2; th -= 1) { const [x, y] = P(th, lay.h - (name === "F" ? 60 : 15)); ctx.lineTo(x, y); } ctx.fill();
      const [lx, ly] = P(arcDeg * (name === "D" ? 0.84 : name === "E" ? 0.6 : 0.52), lay.h + (name === "F" ? 70 : name === "E" ? 24 : 18)); text(ctx, `${name} · ${nf(lay.h)} km · ${nf(plasmaFreq(lay.Ne) / 1e6, 1)} MHz`, lx, ly, { size: 9.5, c: name === "D" ? FLAT : "#6d28d9", align: "center" });
    }
    arcPath(0, null, 0, "#f6ecdc"); arcPath(0, "#7a6a4f", 2);
    const tx = P(4, 0); disc(ctx, tx[0], tx[1], 4, INK);
    // les rayons
    const col = f >= 50e6 ? GLOBE : f < 1e6 ? SOFT : FLAT, absorbed = !night && f < 5e6 && f >= 1e6;
    ctx.lineWidth = 1.4;
    if (f < 1e6) {   // onde de sol : elle suit la surface, s'affaiblit
      for (let th = 4; th < 4 + 9; th += 0.25) { const a = 1 - (th - 4) / 9; ctx.strokeStyle = `rgba(91,100,112,${a})`; const p0 = P(th, 3), p1 = P(th + 0.25, 3); ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke(); }
    }
    let firstLand = null;
    for (let e = 4; e <= 76; e += 9) {
      if (f < 1e6) break;
      ctx.strokeStyle = col; ctx.globalAlpha = absorbed ? 0.18 : 0.85;
      const refl = reflects(f, fo, e, hF), phi = incidence(e, hF), half = (90 - e - phi);   // demi-angle au centre d'un bond (degrés)
      ctx.beginPath(); ctx.moveTo(...tx);
      if (refl) {
        let th = 4;
        for (let hop = 0; hop < 4 && th + 2 * half <= arcDeg; hop++) { ctx.lineTo(...P(th + half, hF)); th += 2 * half; ctx.lineTo(...P(th, 0)); }
        if (firstLand == null || 2 * half < firstLand) firstLand = 2 * half;
      } else {
        // traverse : tout droit, à l'élévation e, jusqu'au bord du cadre
        const a = ((90 + arcDeg / 2 - 4) * Math.PI) / 180, up = [Math.cos(a), -Math.sin(a)], east = [Math.sin(a), Math.cos(a)];
        const el = (e * Math.PI) / 180, d = [east[0] * Math.cos(el) + up[0] * Math.sin(el), east[1] * Math.cos(el) + up[1] * Math.sin(el)];
        ctx.lineTo(tx[0] + d[0] * W, tx[1] + d[1] * W);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    // le saut (zone sans réception entre l'onde de sol et le premier retour)
    // le saut n'existe que si l'onde verticale traverse (f > foF2) ; sinon toutes les élévations reviennent, même tout près
    if (firstLand && !absorbed && f > fo) { const a = P(4 + Math.max(0.6, firstLand * 0.04), 0), b = P(4 + firstLand, 0); ctx.strokeStyle = FLAT; ctx.lineWidth = 3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.setLineDash([]); text(ctx, `${tr("an-rad-skip", "skip zone")} ~${nf(Math.round(firstLand * Math.PI / 180 * R / 100) * 100, 0)} km`, b[0], b[1] + 16, { size: 10, c: FLAT, align: "center" }); }
    // la légende
    const fTxt = f >= 1e6 ? `${nf(f / 1e6, f < 10e6 ? 1 : 0)} MHz` : `${nf(f / 1e3)} kHz`;
    const what = f < 1e6 ? tr("an-rad-ground", "ground wave: follows the surface, fades") : absorbed ? tr("an-rad-dabs", "absorbed by the D layer in daytime") : f > fo / Math.cos((incidence(4, hF) * Math.PI) / 180) ? tr("an-rad-through", "goes through the ionosphere: to the satellites") : tr("an-rad-bounce", "bounces: beyond the horizon, in hops");
    text(ctx, `${fTxt} · ${night ? tr("an-rad-night", "night") : tr("an-rad-day", "day")} · foF2 = ${nf(fo / 1e6, 1)} MHz`, 10, 20, { size: 13, bold: true });
    text(ctx, what, 10, 38, { size: 11, c: col === SOFT ? SOFT : col, maxW: W - 20 });
    stamp2d(ctx, W, tr("an-rad-st", "true scale: Earth radius 6,371 km, layers at their heights"), false, H);
  } });
}

/* ---- C. pourquoi les satellites ne fondent pas -------------------------------------------------------------------- */
// 2026-10-18 (propriétaire : « l'animation est fausse, il faut moins de molécules ») : MÊME boîte, MÊME durée des deux côtés. La
// boîte est un cube de 1 µm posé sur 1 µm² de paroi à 300 K ; on la regarde pendant 100 µs, jouées en 10 s. À gauche, le gaz à
// 1 000 K à la densité de l'air au niveau de la mer : 25 millions de molécules dans le cube, bien trop pour les dessiner
// (la boîte est saturée), environ 5 × 10¹¹ chocs en 100 µs. À droite, la thermosphère à 400 km, 1 000 K : une molécule pour
// 10 000 cubes ; on voit, une par une, les ~3 molécules qui frappent ce micromètre carré pendant les 100 µs (instants tirés d'une
// loi de Poisson au vrai taux, fixés pour que les exports redonnent les mêmes images). Les compteurs de chocs et d'énergie suivent
// les vrais taux (logic.js), et la barre du bas compare les puissances par m² au Soleil.
export function mountHeat(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const sea = ussa(0), top = ussa(400), Tg = 1000, Tw = 300, vbarSea = sea.v * Math.sqrt(Tg / sea.T);
  const qSea = netGasHeat(sea.n, vbarSea, Tg, Tw), qTop = netGasHeat(top.n, top.v, top.T, Tw), qRam = ramHeat(top.rho, 7660), qRad = SIGMA * Tw ** 4;
  const A = 1e-12, WIN = 100e-6, rateSea = impactFlux(sea.n, vbarSea) * A, rateTop = impactFlux(top.n, top.v) * A;   // chocs par seconde sur 1 µm²
  const inCubeSea = sea.n * 1e-18, cubesPerTop = 1 / (top.n * 1e-18);
  // instants des chocs à droite : processus de Poisson au vrai taux sur la fenêtre (graine fixe)
  // graine 4 : trois chocs, à 9, 43 et 70 µs (le taux vrai en donne 3,03 en moyenne) ; les instants d'abord, les positions ensuite
  const r = rng(4), times = [];
  for (let t = -Math.log(1 - r()) / rateTop; t < WIN; t += -Math.log(1 - r()) / rateTop) times.push(t);
  const hits = times.map((t) => ({ t, x: 0.15 + 0.7 * r(), a: (r() - 0.5) * 0.5 })), perHit = 2 * 1.380649e-23 * (top.T - Tw);   // J par choc
  const swarm = Array.from({ length: 520 }, () => ({ x: r(), y: r(), vx: (r() - 0.5), vy: (r() - 0.5) }));
  const pow = (q) => (q >= 1e4 ? `${nf(q / 1e6, 0)} MW/m²` : q >= 1 ? `${nf(q, 0)} W/m²` : q >= 0.01 ? `${nf(q, 2)} W/m²` : `${nf(q * 1000, 2)} mW/m²`);
  const sci = (x) => { if (x < 1e4) return nf(x, x < 10 ? 1 : 0); const e = Math.floor(Math.log10(x)); return `${nf(x / 10 ** e, 1)} × 10${String(e).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]).join("")}`; };
  const energy = (J) => (J >= 1e-9 ? `${sci(J * 1e9)} nJ` : J >= 1e-15 ? `${nf(J * 1e15, 2)} fJ` : `${nf(J * 1e18, 2)} aJ`);
  return anim2d(canvas, { span: 10, u0: 0, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const narrow = W < 560, topLine = 22, barsH = narrow ? 150 : 116, tReal = u * WIN;
    const { L, Rp } = split(W, H - barsH - topLine); L[1] += topLine; Rp[1] += topLine;
    text(ctx, `${tr("an-heat-same", "same box, same time on both sides")} · t = ${nf(tReal * 1e6, 0)} µs / 100 µs`, W / 2, 15, { size: 11, bold: true, align: "center", maxW: W - 20 });
    const frame = (R0, title, sub) => {
      const x0 = R0[0] + 10, x1 = R0[0] + R0[2] - 10;
      const n1 = text(ctx, title, x0, R0[1] + 16, { size: 12, bold: true, maxW: x1 - x0 });
      const n2 = text(ctx, sub, x0, R0[1] + 18 + 15 * n1, { size: 10, c: SOFT, maxW: x1 - x0 });
      const y0 = R0[1] + 26 + 15 * n1 + 13 * n2, yPlate = R0[1] + R0[3] - 46;
      ctx.fillStyle = "#9aa1ab"; ctx.fillRect(x0, yPlate, x1 - x0, 8);
      return { x0, x1, y0, yPlate };
    };
    // à gauche : la boîte pleine
    { const b = frame(L, tr("an-heat-l", "Gas at 1,000 K, as dense as air at sea level"), `${tr("an-heat-cube", "in the 1 µm cube")}: ${sci(inCubeSea)} ${tr("an-heat-mol", "molecules")} — ${tr("an-heat-toomany", "far too many to draw")}`);
      ctx.fillStyle = "rgba(180,83,9,.18)"; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.yPlate - b.y0);
      for (const p of swarm) { const x = b.x0 + (((p.x + p.vx * u * 40) % 1) + 1) % 1 * (b.x1 - b.x0), y = b.y0 + (((p.y + p.vy * u * 40) % 1) + 1) % 1 * (b.yPlate - b.y0); disc(ctx, x, y, 1.6, FLAT); }
      ctx.fillStyle = "rgba(202,138,4,.55)"; ctx.fillRect(b.x0, b.yPlate - 3, b.x1 - b.x0, 3);
      text(ctx, `${tr("an-heat-hits", "impacts")}: ${sci(rateSea * tReal)} · ${tr("an-heat-energy", "energy received")}: ${energy(qSea * A * tReal)}`, b.x0, b.yPlate + 22, { size: 10.5, c: INK, maxW: b.x1 - b.x0 });
      text(ctx, pow(qSea), b.x1, b.yPlate + 40, { size: 12, bold: true, mono: true, c: FLAT, align: "right" }); }
    // à droite : la boîte presque vide, les vrais chocs un par un
    { const b = frame(Rp, tr("an-heat-r", "The thermosphere at 400 km: 1,000 K"), `${tr("an-heat-cube", "in the 1 µm cube")}: ${tr("an-heat-one", "one molecule per")} ${nf(cubesPerTop, 0)} ${tr("an-heat-cubes", "such cubes")}`);
      ctx.fillStyle = "rgba(29,78,216,.04)"; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.yPlate - b.y0);
      const fly = WIN * 0.06;   // chaque molécule apparaît un peu avant son choc et traverse la boîte
      let n = 0;
      for (const h of hits) {
        if (tReal >= h.t) n++;
        const s = (tReal - (h.t - fly)) / fly;
        if (s >= 0 && s <= 1) disc(ctx, b.x0 + (h.x + h.a * (1 - s)) * (b.x1 - b.x0), b.y0 + s * (b.yPlate - b.y0), 3.2, FLAT);
        if (tReal >= h.t && tReal < h.t + fly * 0.5) disc(ctx, b.x0 + h.x * (b.x1 - b.x0), b.yPlate, 7, null, "#ca8a04", 2);
      }
      text(ctx, `${tr("an-heat-hits", "impacts")}: ${n} · ${tr("an-heat-energy", "energy received")}: ${energy(n * perHit)}`, b.x0, b.yPlate + 22, { size: 10.5, c: INK, maxW: b.x1 - b.x0 });
      text(ctx, pow(qTop), b.x1, b.yPlate + 40, { size: 12, bold: true, mono: true, c: GLOBE, align: "right" }); }
    // les puissances par m², échelle logarithmique
    const by = H - barsH + (narrow ? 26 : 14), bx0 = 10, bx1 = W - 10, lo = -4, hi = 8, X = (q) => bx0 + (Math.log10(q) - lo) / (hi - lo) * (bx1 - bx0);
    const rows = [[tr("an-heat-b1", "sunlight"), S_SUN, "#ca8a04"], [tr("an-heat-b2", "radiated by a 300 K surface"), qRad, SEA], [tr("an-heat-b3", "speed through the gas (7.66 km/s)"), qRam, SOFT], [tr("an-heat-b4", "thermosphere gas at 1,000 K"), qTop, GLOBE], [tr("an-heat-b5", "same gas at sea-level density"), qSea, FLAT]];
    text(ctx, tr("an-heat-st", "per square metre, true powers, logarithmic scale from 10⁻⁴ to 10⁸ W/m²"), bx0, by - 4, { size: 9.5, c: SOFT, maxW: bx1 - bx0 });
    // en étroit, chaque étiquette au-dessus de sa barre ; en large, au bout de la barre (ou dedans si elle touche le bord)
    rows.forEach(([lab, q, c], i) => {
      if (narrow) { const y = by + 14 + i * 26; text(ctx, `${lab}: ${pow(q)}`, bx0, y, { size: 9.5, c: INK, maxW: bx1 - bx0 }); ctx.fillStyle = c; ctx.fillRect(bx0, y + 3, Math.max(2, X(q) - bx0), 7); }
      else { const y = by + 4 + i * 18; ctx.fillStyle = c; ctx.fillRect(bx0, y, Math.max(2, X(q) - bx0), 10); text(ctx, `${lab}: ${pow(q)}`, Math.min(X(q) + 6, bx1 - 4), y + 9, { size: 9.5, c: INK, align: X(q) + 200 > bx1 ? "right" : "left" }); }
    });
  } });
}

/* ---- D. rayonnement -> énergie -> température (2026-10-18, propriétaire) ------------------------------------------- */
// Une plaque d'aluminium noire de 1 m² × 2 mm sur une orbite à 400 km (logic.js, plateOrbit : C dT/dt = S A − 2σA T⁴, régime
// établi). Une orbite de 92,4 min est jouée en 24 s (temps × 231, imprimé). Le petit schéma montre où est la plaque et l'ombre
// de la Terre ; la plaque prend la couleur de sa température ; les flèches entrantes et sortantes ont une longueur
// proportionnelle à leur puissance ; la chaîne du haut donne les quatre étapes avec leurs valeurs ; la courbe, T sur l'orbite.
export function mountRad(canvas, tr, lang = "en") {
  const nf = (x, d = 0) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  const O = plateOrbit(), rows = O.rows, Tmin = Math.min(...rows.map((r) => r.T)), Tmax = Math.max(...rows.map((r) => r.T)), SPAN = 24;
  const col = (T) => { const f = Math.max(0, Math.min(1, (T - 170) / 170)); return `rgb(${Math.round(60 + 190 * f)},${Math.round(90 + 40 * f)},${Math.round(200 - 170 * f)})`; };
  return anim2d(canvas, { span: SPAN, u0: 0.05, draw(ctx, W, H, u) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const narrow = W < 620, k = Math.min(rows.length - 1, Math.floor(u * rows.length)), r = rows[k], E = O.C * (r.T - Tmin);
    // la chaîne des quatre étapes
    const steps = [[tr("an-rad-in", "radiation in"), `${nf(r.pin)} W`, "#ca8a04"], [tr("an-rad-store", "energy gained"), `+${nf(E / 1000)} kJ`, INK], [tr("an-rad-temp", "temperature"), narrow ? `${nf(r.T)} K` : `${nf(r.T)} K · ${nf(r.T - 273.15)} °C`, col(r.T)], [tr("an-rad-out", "radiation out"), `${nf(r.pout)} W`, FLAT]];
    const bw = (W - 20) / 4, by = 10;
    steps.forEach(([lab, val, c], i) => {
      const x = 10 + i * bw; ctx.fillStyle = "#f2f0ea"; ctx.fillRect(x + 2, by, bw - 14, narrow ? 58 : 40);
      text(ctx, lab, x + 8, by + 15, { size: narrow ? 9.5 : 10.5, c: SOFT, maxW: bw - 22 }); text(ctx, val, x + 8, by + (narrow ? 50 : 33), { size: narrow ? 10.5 : 12, bold: true, c, maxW: bw - 22 });
      if (i < 3) arrow(ctx, x + bw - 11, by + 20, x + bw + 1, by + 20, SOFT, 1.4, 5);
    });
    const net = r.pin - r.pout, dTdt = (net / O.C) * 60;
    text(ctx, `C dT/dt = P_in − P_out = ${net < 0 ? "−" : ""}${nf(Math.abs(net))} W  →  ${dTdt >= 0 ? "+" : "−"}${nf(Math.abs(dTdt), 1)} K/min   (C = ${nf(O.C)} J/K)`, 10, by + (narrow ? 82 : 64), { size: narrow ? 10 : 11.5, mono: true, maxW: W - 20 });
    const top = by + (narrow ? 96 : 78);
    // panneaux : schéma d'orbite + plaque | courbe
    const PA = narrow ? [0, top, W, (H - top) * 0.55] : [0, top, W * 0.5, H - top], PB = narrow ? [0, top + (H - top) * 0.55, W, (H - top) * 0.45] : [W * 0.5, top, W * 0.5, H - top];
    // le petit schéma d'orbite : Soleil à gauche, ombre de la Terre à droite
    const ocx = PA[0] + PA[2] * 0.26, ocy = PA[1] + PA[3] * 0.48, oR = Math.min(PA[2] * 0.18, PA[3] * 0.32), eR = oR * 6371 / 6771;
    ctx.fillStyle = "rgba(21,26,33,.10)"; ctx.fillRect(ocx, ocy - eR, PA[2] * 0.26, 2 * eR);
    disc(ctx, ocx, ocy, eR, "#dbeafe", GLOBE, 1.2); ctx.setLineDash([3, 3]); disc(ctx, ocx, ocy, oR, null, SOFT, 1); ctx.setLineDash([]);
    const ang = Math.PI - 2 * Math.PI * (r.t / O.P);   // milieu de l'orbite = au fond de l'ombre (à droite)
    const sx = ocx + oR * Math.cos(ang), sy = ocy - oR * Math.sin(ang);
    disc(ctx, sx, sy, 4, col(r.T), INK, 1);
    text(ctx, r.sun ? tr("an-rad-sunlit", "in sunlight") : tr("an-rad-shadow", "in the Earth's shadow"), ocx, ocy + oR + 18, { size: 10.5, bold: true, c: r.sun ? "#ca8a04" : SOFT, align: "center" });
    text(ctx, `☀ ${tr("an-rad-sun", "Sun")} →`, PA[0] + 8, ocy - oR - 8, { size: 10.5, c: "#ca8a04" });
    // la plaque, vue de côté, face au Soleil (à gauche)
    const px = PA[0] + PA[2] * 0.72, py0 = PA[1] + PA[3] * 0.18, py1 = PA[1] + PA[3] * 0.78;
    ctx.fillStyle = col(r.T); ctx.fillRect(px - 5, py0, 10, py1 - py0);
    const L = (P) => Math.min(PA[2] * 0.2, 6 + P / 1361 * PA[2] * 0.16);
    for (let j = 0; j < 5; j++) {
      const y = py0 + (j + 0.5) / 5 * (py1 - py0);
      if (r.pin > 0) arrow(ctx, px - 8 - L(r.pin), y, px - 8, y, "#ca8a04", 1.8);
      const lo = L(r.pout / 2); arrow(ctx, px + 7, y + 6, px + 7 + lo, y + 6, FLAT, 1.4); arrow(ctx, px - 7, y + 12, px - 7 - lo, y + 12, FLAT, 1.4);
    }
    text(ctx, tr("an-rad-plate", "black aluminium plate, 1 m² × 2 mm"), px, py1 + 16, { size: 9.5, c: SOFT, align: "center", maxW: PA[2] * 0.5 });
    // la courbe T(t) sur l'orbite
    const X0 = PB[0] + 44, X1 = PB[0] + PB[2] - 12, Y0 = PB[1] + PB[3] - (narrow ? 44 : 38), Y1 = PB[1] + 14, lo = 150, hi = 350;
    const x = (t) => X0 + t / O.P * (X1 - X0), y = (T) => Y0 - (T - lo) / (hi - lo) * (Y0 - Y1);
    ctx.fillStyle = "rgba(21,26,33,.07)"; ctx.fillRect(x(O.P * (0.5 - O.shadow / 2)), Y1, x(O.P * (0.5 + O.shadow / 2)) - x(O.P * (0.5 - O.shadow / 2)), Y0 - Y1);
    for (const T of [150, 200, 250, 300, 350]) { ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y(T)); ctx.lineTo(X1, y(T)); ctx.stroke(); text(ctx, `${T} K`, X0 - 4, y(T) + 4, { size: 9.5, c: SOFT, align: "right" }); }
    ctx.setLineDash([4, 3]); ctx.strokeStyle = FLAT; ctx.beginPath(); ctx.moveTo(X0, y(plateEq())); ctx.lineTo(X1, y(plateEq())); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `${tr("an-rad-eq", "balance in sunlight")} ${nf(plateEq())} K`, X1, y(plateEq()) - 5, { size: 9.5, c: FLAT, align: "right" });
    ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.beginPath(); rows.forEach((q, i) => { i ? ctx.lineTo(x(q.t), y(q.T)) : ctx.moveTo(x(q.t), y(q.T)); }); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(r.t), Y1); ctx.lineTo(x(r.t), Y0); ctx.stroke(); disc(ctx, x(r.t), y(r.T), 4, col(r.T), INK, 1);
    text(ctx, tr("an-rad-shadowband", "shadow"), x(O.P / 2), Y1 + 12, { size: 9.5, c: SOFT, align: "center" });
    text(ctx, `0 → ${nf(O.P / 60, 1)} min`, X1, Y0 + 13, { size: 9.5, c: SOFT, align: "right" });
    stamp2d(ctx, W, `${tr("an-rad-st", "one orbit in 24 s: time")} ×${nf(O.P / SPAN, 0)} · ${tr("an-rad-st2", "Earth's light and infrared left out")}`, false, H);
  } });
}
