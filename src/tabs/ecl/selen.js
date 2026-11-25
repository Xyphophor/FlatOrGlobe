// La séléniélie (2026-10-04, demande du propriétaire) : Soleil couchant et Lune
// éclipsée levante en même temps. Canvas 2D, trois vues d'un même instant :
//  - en haut, vue ORTHOGRAPHIQUE à l'échelle vraie (une seule échelle pour la Terre,
//    la Lune, leurs distances et l'ombre), dans le plan qui contient le Soleil, le
//    centre de la Terre et l'observateur ; encart agrandi uniformément autour de la
//    Lune, facteur imprimé (règle 1) ;
//  - en bas, deux vues PERSPECTIVES de la Lune au MÊME instant, depuis deux lieux
//    (2026-10-04, demande du propriétaire) : celui de la séléniélie, où l'ombre vient
//    d'en bas, et Adélaïde, où la Lune est haute et l'ombre vient d'en haut — le
//    « mauvais côté » des auteurs platistes. Dans chaque vue, un petit cadre montre le
//    Soleil pour ce lieu (sous l'horizon à Adélaïde). Disques pleins = avec la
//    réfraction standard ; contours pointillés = sans air (règle 3).
// Tous les angles viennent de logic.js (selenAt : éphémérides de Meeus, Lune
// topocentrique) ; rien n'est lu sur le dessin.
import { exportBusy } from "../../core/motion.js";
import { SELEN_CASES, selenAt, refrDeg, shadowSide } from "./logic.js";
import { gmst } from "../../core/ephemeris.js";
import { keyClickable } from "../../core/a11y.js";
import { pixelRatio } from "../../core/canvas.js";

const D = Math.PI / 180, RE = 6371, RM = 1737.4, RS = 696000, AU = 149597871;
const MONO = "ui-monospace, Menlo, monospace";
const unit = (ra, dec) => [Math.cos(dec * D) * Math.cos(ra * D), Math.cos(dec * D) * Math.sin(ra * D), Math.sin(dec * D)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const am = (deg) => `${deg >= 0 ? "+" : "−"}${Math.abs(deg * 60).toFixed(0)}′`;
const hm = (h) => { const s = Math.round(h * 3600); return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}`; };
// hauteur VRAIE du rayon le plus bas qui atteint l'œil (hauteur apparente 0) : h + ρ(h) = 0
const RHO0 = (() => { let h = -0.5; for (let i = 0; i < 30; i++) h = -refrDeg(h); return -h; })();

// la Lune par rapport au centre de l'ombre, en degrés, vue de l'observateur : x vers la droite, y vers le zénith
const inShadow = (s) => ({ x: ((((s.moon.az - s.shadow.az) % 360) + 540) % 360 - 180) * Math.cos(s.moon.alt * D), y: s.moon.alt - s.shadow.alt });

export function mountSelen(canvas, readsEl, buttons, tr) {
  const st = { t: 0.35, playing: true, last: 0, raf: null, vis: true, key: "brest2028" };
  const SPAN = 30;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { st.playing = false; st.t = 0.5; }
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => { st.playing = !st.playing; st.last = 0; if (st.playing) loop(); else draw(); });
  keyClickable(canvas);
  const setCase = (k) => { st.key = k; st.t = 0.3; for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.case === k)); draw(); };
  for (const b of buttons) b.addEventListener("click", () => setCase(b.dataset.case));
  // trajet de la Lune dans l'ombre (vu de l'observateur, zénith en haut), pour le petit schéma
  const tracks = {};
  const trackOf = (k) => (tracks[k] ??= (() => { const [ck, far] = k.split("@"), c0 = SELEN_CASES[ck], c = far ? { ...c0, ...c0.far } : c0, pts = [];
    for (let i = 0; i <= 40; i++) { const s = selenAt(c, c0.t0 + (c0.t1 - c0.t0) * i / 40); pts.push(inShadow(s)); }
    return pts; })());

  function ortho(ctx, x0, y0, W, H, c, s, ut, f) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip();
    ctx.fillStyle = "#121a30"; ctx.fillRect(x0, y0, W, H);
    // repère : e1 = direction antisolaire, e2 = verticale de l'observateur ôtée de sa part selon e1
    const e1 = unit(s.sun.ra, s.sun.dec).map((v) => -v);
    const lst = gmst(s.jd) + c.lon, Z = unit(lst, c.lat);
    const z1 = dot(Z, e1), e2 = Z.map((v, i) => v - z1 * e1[i]), n2 = Math.hypot(...e2); e2.forEach((v, i) => (e2[i] = v / n2));
    const Mv = unit(s.moon.ra, s.moon.dec).map((v) => v * s.moon.distKM / RE);
    const obs = [z1, dot(Z, e2)], mo = [dot(Mv, e1), dot(Mv, e2)];
    // le second lieu n'est pas dans ce plan : projeté orthogonalement dessus, comme sa ligne de visée vers la Lune
    const Za = unit(gmst(s.jd) + f.lon, f.lat), farP = [dot(Za, e1), dot(Za, e2)];
    const FAR = "#7fd0ff";
    const dS = AU / RE * s.sun.distAU;                                          // distance du Soleil en R⊕
    const sc = (W * 0.86) / 63, cx = x0 + W * 0.075, cy = y0 + H * 0.74;
    const P = (x, y, k = sc, ox = cx, oy = cy) => [ox + x * k, oy - y * k];
    const scene = (k, ox, oy, thin) => {
      const p = (x, y) => P(x, y, k, ox, oy), far = mo[0] + (W / k) * 1.2;   // au-delà de la Lune, même dans l'encadré
      const x0s = thin ? 0 : mo[0] - W / k;                                    // l'encadré ne trace que les abords de la Lune
      // ombres (rayon ×1,02 : atmosphère, convention de la figure précédente)
      const pen = (x) => 1.02 * (1 + x * (RS + RE) / RE / dS), umb = (x) => 1.02 * (1 - x * (RS - RE) / RE / dS);
      ctx.fillStyle = "rgba(80,92,130,.55)"; ctx.beginPath(); ctx.moveTo(...p(x0s, pen(x0s))); ctx.lineTo(...p(far, pen(far))); ctx.lineTo(...p(far, -pen(far))); ctx.lineTo(...p(x0s, -pen(x0s))); ctx.fill();
      ctx.fillStyle = "#04060b"; ctx.beginPath(); ctx.moveTo(...p(x0s, umb(x0s))); ctx.lineTo(...p(far, umb(far))); ctx.lineTo(...p(far, -umb(far))); ctx.lineTo(...p(x0s, -umb(x0s))); ctx.fill();
      // la Terre : moitié de jour vers le Soleil (à gauche)
      const [ex, ey] = p(0, 0);
      if (thin) {   // dans l'encadré la Terre est hors champ, à 60 R⊕ à gauche
        ctx.fillStyle = "#1e3a5f"; ctx.beginPath(); ctx.arc(ex, ey, k, 0, 7); ctx.fill();
        ctx.fillStyle = "#5b8fc9"; ctx.beginPath(); ctx.arc(ex, ey, k, Math.PI / 2, Math.PI * 1.5); ctx.fill();
      }
      // la Lune
      const [mx, my] = p(...mo), mr = Math.max(RM / RE * k, 1.2);
      ctx.fillStyle = s.phase === "total" ? "#9a3b22" : s.phase === "partial" ? "#c9a58a" : "#ddd6c4";
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill();
      // plan de l'horizon (droit) et rayon le plus bas qui arrive à l'œil avec l'air, des deux côtés
      const [ox1, oy1] = p(...obs), tdir = [obs[1], -obs[0]];
      const ray = (sgn, dip, col, dash, w) => {
        if (!thin && sgn < 0) return;
        const a = Math.atan2(tdir[1] * sgn, tdir[0] * sgn) - sgn * dip * D;
        const u = thin ? 0 : Math.max(0, (p(x0s, 0)[0] - ox1) / Math.cos(a));   // départ à l'entrée de l'encadré
        ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ox1 + Math.cos(a) * u, oy1 - Math.sin(a) * u);
        ctx.lineTo(ox1 + Math.cos(a) * far * k, oy1 - Math.sin(a) * far * k); ctx.stroke(); ctx.setLineDash([]);
      };
      ray(1, 0, "rgba(220,225,235,.7)", [5, 4], thin ? 1 : 1.2); ray(-1, 0, "rgba(220,225,235,.7)", [5, 4], thin ? 1 : 1.2);
      ray(1, RHO0, "#f5b942", [], thin ? 1.2 : 1.6); ray(-1, RHO0, "#f5b942", [], thin ? 1.2 : 1.6);
      ctx.strokeStyle = FAR; ctx.lineWidth = thin ? 1 : 1.2; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(...p(...farP)); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);
      if (thin) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ox1, oy1, 2, 0, 7); ctx.fill(); ctx.fillStyle = FAR; ctx.beginPath(); ctx.arc(...p(...farP), 2, 0, 7); ctx.fill(); }
      return { mx, my, mr };
    };
    // rayons du Soleil, venus de la gauche
    ctx.strokeStyle = "rgba(247,183,51,.25)"; ctx.lineWidth = 1;
    for (const y of [-1.6, -0.8, 0.8, 1.6]) { const a = P(-5, y), b = P(-1.2, y); ctx.beginPath(); ctx.moveTo(x0, a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    const m = scene(sc, cx, cy, true);
    ctx.font = `10px ${MONO}`; ctx.fillStyle = "#f5b942"; ctx.textAlign = "left";
    ctx.fillText(`☉ ← ${Math.round(dS).toLocaleString("en-US")} R⊕`, x0 + 6, cy - sc * 1.8 - 8);
    ctx.fillStyle = "#c9d3e3"; ctx.textAlign = "right";
    ctx.fillText(tr("sel-umbra", "Earth's shadow"), x0 + W - 6, cy + sc * 1.4 + 12); ctx.textAlign = "left";
    // encart : même dessin, agrandi uniformément autour de la Lune
    const iw = Math.min(W * 0.42, 340), ih = H * 0.5, ix = x0 + W * 0.4, iy = y0 + 22;
    const zoom = Math.max(2, Math.round(iw / (7 * sc)));
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip(); ctx.fillStyle = "#121a30"; ctx.fillRect(ix, iy, iw, ih);
    const k2 = sc * zoom, ocx = ix + iw / 2 - mo[0] * k2, ocy = iy + ih / 2 + (mo[1] + 0.5) * k2;   // entre la Lune et l'horizon
    scene(k2, ocx, ocy, false);
    ctx.restore();
    ctx.strokeStyle = "rgba(200,210,230,.5)"; ctx.lineWidth = 1; ctx.strokeRect(ix, iy, iw, ih);
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(m.mx, m.my); ctx.lineTo(ix + iw / 2, iy + ih); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#c9d3e3"; ctx.font = `10px ${MONO}`; ctx.textAlign = "left";
    ctx.fillText(`×${zoom}`, ix + 5, iy + 13);
    // légendes sur fond plein : les traits passent dessous
    const lab = (t, y, col) => { const w = ctx.measureText(t).width; ctx.fillStyle = "rgba(18,26,48,.9)"; ctx.fillRect(ix + iw - w - 8, y - 10, w + 6, 13); ctx.fillStyle = col; ctx.fillText(t, ix + iw - 5, y); };
    ctx.textAlign = "right";
    lab(tr("sel-low", "lowest ray with air"), iy + ih - 18, "#f5b942"); lab(tr("sel-hz", "horizon plane"), iy + ih - 5, "rgba(220,225,235,.9)");
    // titres
    ctx.textAlign = "left"; ctx.fillStyle = "#f4f1e8"; ctx.font = `600 12px ${MONO}`;
    ctx.fillText(`${tr(`sel-${st.key}`, st.key)} · ${hm(ut)} UT`, x0 + 6, y0 + 15);
    // qui est qui : le premier lieu (blanc, dans le plan), le second (projeté)
    ctx.font = `10px ${MONO}`; let lx = x0 + 6; const ly = y0 + H - 22;
    for (const [col, txt] of [["#fff", tr(`sel-pl-${c.place}`, c.place)], [FAR, `${tr(`sel-pl-${f.place}`, f.place)} (${tr("sel-proj", "projected")})`]]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx + 3, ly - 3, 2.5, 0, 7); ctx.fill(); ctx.fillText(txt, lx + 9, ly); lx += 9 + ctx.measureText(txt).width + 14;
    }
    ctx.fillStyle = "#e0a52a";
    ctx.fillText(tr("sel-stamp", "true scale · box enlarged uniformly"), x0 + 6, y0 + H - 7);
    ctx.restore();
  }

  // Vue de la LUNE depuis un lieu, zénith en haut. Échelle de base kL (1° = kL px), la même
  // pour toutes les vues basses.
  // Lune basse (≤ 2,5°) : l'horizon reste fixe aux deux tiers, la vue suit l'astre en azimut, 1° = kL.
  // Lune haute : champ ÉLARGI pour que l'horizon soit dans l'image (échelle uniforme propre, barre
  // imprimée) ; la Lune y est minuscule, donc un cadre la montre agrandie à l'échelle kL (facteur imprimé).
  // Dans un petit cadre, le Soleil au même instant pour ce lieu (sunBox).
  function persp(ctx, x0, y0, W, H, s, place, key) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip();
    const b = s.moon, az0 = b.az, low = b.alt < 2.5;
    const kL = Math.min(W / 3.4, H * 0.6 / 3.2);
    const xm = low ? x0 + W / 2 : x0 + W * 0.3, yh = low ? y0 + H * 0.66 : y0 + H * 0.8;   // yh : horizon
    const k = low ? kL : (H * 0.4) / b.alt;                                                 // Lune haute : à 0,4 H au-dessus de l'horizon
    const proj = (kk, ox, oy, a0) => (alt, az) => [ox + ((((az - az0) % 360) + 540) % 360 - 180) * Math.cos(alt * D) * kk, oy - (alt - a0) * kk];
    const XY = proj(k, xm, yh, 0);
    const sky = ctx.createLinearGradient(0, y0, 0, yh);
    if (low) { sky.addColorStop(0, "#2a3c63"); sky.addColorStop(0.6, "#7d6a8c"); sky.addColorStop(0.85, "#c79aa6"); sky.addColorStop(1, "#5a6585"); }
    else { sky.addColorStop(0, "#070b1c"); sky.addColorStop(1, "#1a2448"); }   // le Soleil est loin sous l'horizon : la nuit
    ctx.fillStyle = sky; ctx.fillRect(x0, y0, W, yh - y0);
    const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
    // la Lune et l'ombre selon une projection P, 1° = kk px ; chaque point du bord relevé de SA réfraction
    const moonAt = (P, kk) => {
      const disc = (c, r, air) => { const pts = []; for (let i = 0; i < 64; i++) { const t = i / 64 * 2 * Math.PI; const a = c.alt + r * Math.sin(t); pts.push(P(a + (air ? refrDeg(a) : 0), c.az + r * Math.cos(t) / Math.cos(c.alt * D))); } return pts; };
      poly(disc(b, b.sd, true)); ctx.fillStyle = "#e6dfcc"; ctx.fill();
      ctx.save(); ctx.clip();
      poly(disc(s.shadow, s.shadow.penumbra, true)); ctx.fillStyle = "rgba(60,50,60,.35)"; ctx.fill();
      // l'ombre plus sombre vers son centre : la Lune s'y enfonce même pendant la totalité
      const [scx, scy] = P(s.shadow.alt + refrDeg(s.shadow.alt), s.shadow.az), ug = ctx.createRadialGradient?.(scx, scy, 0, scx, scy, s.shadow.umbra * kk);
      if (ug) { ug.addColorStop(0, "rgba(52,16,10,.97)"); ug.addColorStop(0.7, "rgba(110,36,20,.95)"); ug.addColorStop(1, "rgba(176,82,44,.9)"); }
      poly(disc(s.shadow, s.shadow.umbra, true)); ctx.fillStyle = ug || "rgba(122,42,24,.93)"; ctx.fill();
      ctx.restore();
      return disc;
    };
    // flèche : du centre de la Lune vers le centre de l'ombre (de quel côté vient l'ombre, pour CE lieu)
    const side = shadowSide(s);
    const arrow = (P, kk) => { const [mx, my] = P(b.alt + refrDeg(b.alt), b.az), u = side.up * D, r0 = b.sd * kk + 4, r1 = r0 + 14;
      const ax = (r) => [mx + Math.sin(u) * r, my - Math.cos(u) * r];
      ctx.strokeStyle = "#f3b4a6"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(...ax(r0)); ctx.lineTo(...ax(r1)); ctx.stroke();
      const [tx, ty] = ax(r1), w = 0.45; ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.lineTo(tx - Math.sin(u - w) * 6, ty + Math.cos(u - w) * 6); ctx.moveTo(tx, ty); ctx.lineTo(tx - Math.sin(u + w) * 6, ty + Math.cos(u + w) * 6); ctx.stroke(); };
    const disc = moonAt(XY, k);
    // la mer, horizon à 0° (observateur au niveau de la mer)
    ctx.fillStyle = "#1b2433"; ctx.fillRect(x0, yh, W, y0 + H - yh);
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yh); ctx.lineTo(x0 + W, yh); ctx.stroke();
    if (low) {
      // sans air : contour pointillé, par-dessus la mer
      poly(disc(b, b.sd, false)); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
      arrow(XY, k);
    } else {
      // la Lune minuscule : un anneau pour la repérer, et le cadre agrandi à l'échelle des vues basses
      const [mx, my] = XY(b.alt, b.az), zoom = Math.max(2, Math.round(kL / k)), kz = k * zoom;
      ctx.strokeStyle = "rgba(244,241,232,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(mx, my, 6, 0, 7); ctx.stroke();
      const bw = Math.round(Math.min(W * 0.5, 170, (yh - y0) * 0.62)), bx = x0 + W - bw - 6, by = Math.max(y0 + 64, my - bw / 2);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bw); ctx.clip();
      ctx.fillStyle = "#0d1430"; ctx.fillRect(bx, by, bw, bw);
      const Pz = proj(kz, bx + bw / 2, by + bw / 2, b.alt); moonAt(Pz, kz);
      arrow(Pz, kz);
      ctx.restore();
      ctx.strokeStyle = "rgba(200,210,230,.6)"; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bw - 1);
      ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(mx + 6, my); ctx.lineTo(bx, by + bw / 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#c9d3e3"; ctx.font = `10px ${MONO}`; ctx.textAlign = "left"; ctx.fillText(`×${zoom}`, bx + 4, by + 12);
    }
    shadowMap(ctx, x0, y0, W, H, s, key);
    const sb = sunBox(ctx, x0 + 6, y0 + H - 22, W, s);
    // échelle, au milieu en bas : 1° dans les vues basses, 10° dans la vue élargie
    const bar = low ? 1 : 10, cxb = x0 + W / 2;
    ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cxb - bar * k / 2, y0 + H - 8); ctx.lineTo(cxb + bar * k / 2, y0 + H - 8); ctx.stroke();
    ctx.fillStyle = "#c9d3e3"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center"; ctx.fillText(`${bar}°`, cxb, y0 + H - 12);
    // lecture : lieu, bord supérieur avec air (sans air)
    const up = b.alt + b.sd, upA = up + refrDeg(up);
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.font = `600 11px ${MONO}`; ctx.fillText(`${tr(`sel-pl-${place}`, place)} · ${Math.round(b.az)}°`, x0 + 6, y0 + 15);
    ctx.font = `10px ${MONO}`; ctx.fillStyle = upA > 0 ? "#c7f0d0" : "#f3b4a6";
    ctx.fillText(`${tr("sel-limb", "upper edge")} ${low ? am(upA) : `+${Math.round(upA)}°`}`, x0 + 6, y0 + 29);
    ctx.fillStyle = "#c9d3e3";
    if (low) ctx.fillText(`${tr("sel-noair", "without air")} ${am(up)}`, x0 + 6, y0 + 42);
    ctx.fillStyle = "#f3b4a6"; ctx.fillText(`${tr("sel-from", "shadow")} ${sideWord(side.up)}`, x0 + 6, y0 + (low ? 55 : 42));
    ctx.fillStyle = "#c9d3e3"; ctx.fillText(`${tr("sel-mag", "mag.")} ${Math.max(0, s.umag).toFixed(2)}`, x0 + 6, y0 + (low ? 68 : 55));
    ctx.restore();
    return { upA, sunUp: sb, side };
  }
  const SIDE_EN = { "sel-above": "from above", "sel-below": "from below", "sel-right": "from the right", "sel-left": "from the left" };
  const sideKey = (u) => (Math.abs(u) <= 45 ? "sel-above" : Math.abs(u) >= 135 ? "sel-below" : u > 0 ? "sel-right" : "sel-left");
  const sideWord = (u) => tr(sideKey(u), SIDE_EN[sideKey(u)]);

  // Le Soleil au même instant, dans un petit cadre posé en bas à gauche de la vue : regard vers
  // son azimut, horizon au milieu, échelle uniforme choisie pour qu'il tienne (barre imprimée).
  // Sous l'horizon il est dessiné en pointillés à travers le sol : caché, mais à sa place.
  function sunBox(ctx, bx, by, W, s) {
    const S = s.sun, iw = Math.round(Math.min(W * 0.36, 112)), ih = Math.round(iw * 0.72), x = bx, y = by - ih;
    const span = Math.max(1.2, Math.abs(S.alt) + 1.2 * S.sd + 0.6), q = (ih / 2 - 4) / span, hy = y + ih / 2, cx = x + iw / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, iw, ih); ctx.clip();
    const up = S.alt + S.sd, upA = up + refrDeg(up);
    const day = upA > -0.5, g = ctx.createLinearGradient(0, y, 0, hy);
    if (day) { g.addColorStop(0, "#3d5f8f"); g.addColorStop(0.7, "#d98a4e"); g.addColorStop(1, "#f2c27a"); } else { g.addColorStop(0, "#070b1c"); g.addColorStop(1, "#1a2448"); }
    ctx.fillStyle = g; ctx.fillRect(x, y, iw, hy - y);
    const P = (alt, az) => [cx + ((((az - S.az) % 360) + 540) % 360 - 180) * Math.cos(alt * D) * q, hy - alt * q];
    const disc = (r, air) => { ctx.beginPath(); for (let i = 0; i < 48; i++) { const t = i / 48 * 2 * Math.PI, a = S.alt + r * Math.sin(t), p = P(a + (air ? refrDeg(a) : 0), S.az + r * Math.cos(t) / Math.cos(S.alt * D)); i ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.closePath(); };
    const r = Math.max(S.sd, 2 / q);   // au moins 2 px : sinon il disparaît à petite échelle
    disc(r, true); ctx.fillStyle = "#fff1c9"; ctx.fill();
    ctx.fillStyle = "rgba(27,36,51,.82)"; ctx.fillRect(x, hy, iw, y + ih - hy);   // le sol, un peu transparent
    ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x + iw, hy); ctx.stroke();
    disc(r, upA < 0); ctx.strokeStyle = "rgba(255,241,201,.9)"; ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]);
    // barre d'échelle : 1° ou 10°, dans le sol à droite
    const bar = span < 6 ? 1 : 10;
    ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.moveTo(x + iw - 4 - bar * q, y + ih - 4); ctx.lineTo(x + iw - 4, y + ih - 4); ctx.stroke();
    ctx.font = `9px ${MONO}`; ctx.fillStyle = "#c9d3e3"; ctx.textAlign = "right"; ctx.fillText(`${bar}°`, x + iw - 4, y + ih - 7);
    ctx.textAlign = "left"; ctx.fillStyle = "#f5b942"; ctx.fillText(`☉ ${Math.round(S.az)}°`, x + 3, y + 10);
    ctx.fillText(Math.abs(upA) < 2 ? am(upA) : `${upA > 0 ? "+" : "−"}${Math.abs(Math.round(upA))}°`, x + 3, y + ih - 4);
    ctx.restore();
    ctx.strokeStyle = "rgba(245,185,66,.7)"; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, iw - 1, ih - 1);
    return upA;
  }

  // petit schéma en bas à droite : ombre et pénombre, la Lune et son trajet pendant l'animation, zénith du lieu en haut
  function shadowMap(ctx, x0, y0, W, H, s, key) {
    const R = Math.min(H * 0.13, W * 0.15), q = R / s.shadow.penumbra;
    const cx = x0 + W - R - 6, cy = y0 + H - R - 6;
    ctx.fillStyle = "rgba(90,95,120,.45)"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(110,36,20,.95)"; ctx.beginPath(); ctx.arc(cx, cy, s.shadow.umbra * q, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.setLineDash([2, 2]); ctx.lineWidth = 1; ctx.beginPath();
    trackOf(key).forEach((p, i) => (i ? ctx.lineTo(cx + p.x * q, cy - p.y * q) : ctx.moveTo(cx + p.x * q, cy - p.y * q))); ctx.stroke(); ctx.setLineDash([]);
    const m = inShadow(s);
    ctx.strokeStyle = "#f4f1e8"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(cx + m.x * q, cy - m.y * q, s.moon.sd * q, 0, 7); ctx.stroke();
  }

  function draw() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dpr = pixelRatio(2);
    if (canvas.width !== Math.round(r.width * dpr) || canvas.height !== Math.round(r.height * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = r.width, H = r.height, c = SELEN_CASES[st.key], f = { ...c, ...c.far }, ut = c.t0 + st.t * (c.t1 - c.t0);
    const s = selenAt(c, ut), sf = selenAt(f, ut);
    ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, W, H);
    const Ho = Math.round(H * 0.4), g = 4, pw = (W - g) / 2, py = Ho + g, ph = H - py;
    ortho(ctx, 0, 0, W, Ho, c, s, ut, f);
    const A = persp(ctx, 0, py, pw, ph, s, c.place, st.key);
    const B = persp(ctx, pw + g, py, pw, ph, sf, f.place, st.key + "@far");
    if (readsEl) {
      const both = A.sunUp > 0 && A.upA > 0 && (s.phase === "total" || s.phase === "partial");
      const pl = (p) => tr(`sel-pl-${p}`, p), side = (x) => sideWord(x.side.up);
      const html = `<span class="r"><b>${hm(ut)} UT</b> · ${tr(`sel-ph-${s.phase}`, s.phase)}</span>` +
        `<span class="r"><span class="dot" style="background:#f5b942"></span>${pl(c.place)}, ${tr("sel-r-sun", "Sun, upper edge")}: <b>${am(A.sunUp)}</b> <span class="sub">(${tr("sel-noair", "without air")} ${am(s.sun.alt + s.sun.sd)})</span></span>` +
        `<span class="r"><span class="dot" style="background:#9a3b22"></span>${pl(c.place)}, ${tr("sel-r-moon", "Moon, upper edge")}: <b>${am(A.upA)}</b> <span class="sub">(${tr("sel-noair", "without air")} ${am(s.moon.alt + s.moon.sd)})</span></span>` +
        `<span class="r"><b>${both ? tr("sel-r-both", "both in the sky, the Moon in the Earth's shadow") : tr("sel-r-not", "not both in the sky")}</b></span>` +
        `<span class="r">${pl(f.place)}: ${tr("sel-r-moonalt", "Moon")} <b>+${Math.round(sf.moon.alt)}°</b>, ${tr("sel-r-sunalt", "Sun")} <b>${Math.round(sf.sun.alt)}°</b></span>` +
        `<span class="r">${tr("sel-r-side", "shadow seen")}: ${pl(c.place)} <b>${side(A)}</b>, ${pl(f.place)} <b>${side(B)}</b></span>` +
        `<span class="r">${tr("sel-r-pa", "same angle from celestial north")}: <b>${Math.round(A.side.pa)}°</b> · <b>${Math.round(B.side.pa)}°</b></span>`;
      if (readsEl._last !== html) { readsEl.innerHTML = html; readsEl._last = html; }
    }
  }
  function loop() {
    if (st.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      st.raf = null;
      if (!st.playing || !st.vis || canvas.closest("[hidden]")) { st.last = 0; return; }
      if (st.last && ts - st.last < 40) { st.raf = requestAnimationFrame(step); return; }
      if (st.last) st.t = (st.t + (ts - st.last) / 1000 / SPAN) % 1;
      st.last = ts; draw();
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }
  if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { st.vis = es.some((e) => e.isIntersecting); if (st.vis && !exportBusy()) loop(); }).observe(canvas);
  let saved = null;
  canvas.__anim = {
    duration: SPAN,
    begin() { saved = { ...st }; if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; },
    frameAt(t) { st.t = (t / SPAN) % 1; draw(); },
    end() { if (saved) Object.assign(st, saved, { raf: null, last: 0 }); saved = null; draw(); if (st.playing) loop(); },
  };
  return {
    start() { draw(); if (st.playing) loop(); },
    stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = null; st.last = 0; },
  };
}
