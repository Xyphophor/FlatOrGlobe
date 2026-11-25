// Paysage « fidèle » vu d'un point de vue (2026-09-25, demande du
// propriétaire pour elev, sur le modèle de la vue caméra d'obs) : le relief
// LiDAR HD peint en couches de distance, du lointain au proche (perspective
// aérienne), chaque couche plafonnée au profil exact de la crête ; les
// cibles nommées à leur angle CALCULÉ ; l'œil, les azimuts, l'échelle.
// Projection gnomonique (celle d'un appareil photo), même échelle angulaire
// dans les deux directions au centre. Trois modèles : globe à k, globe à
// rayons droits, plan -- les lectures donnent toujours les trois (règle 3).
// Le paysage est un DÉCOR : le test, ce sont les sommets nommés.
import { setupCanvas } from "./canvas.js";
import { makeT } from "./i18n.js";
import { globeElev, flatElev } from "./math.js";
import { reducedMotion, frameStep, revealAlpha, REVEAL_T, exportBusy } from "./motion.js";

const D2R = Math.PI / 180;
const MODELS = ["globeK", "globe", "flat"];
const am = (deg) => { const m = deg * 60; return `${m >= 0 ? "+" : "−"}${Math.abs(m).toFixed(1)}′`; };

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} o
 *   profile : { az0, step, flat[], globe[], globeK[] } (minutes d'arc)
 *   layers  : { az0, step, bandsKm, flat[][], globe[][], globeK[][] } (0,1′, null = vide)
 *   eye (m), R (m), k ; targets : [{ name, d (m), h (m), az (°), color, clearance? }]
 *     clearance : lire aussi de combien le sommet dépasse le relief PLUS PROCHE
 *     (couches dont la tranche finit avant lui), dans chaque modèle
 *   view : { az, alt, fovDeg } ; buttons : { globeK, globe, flat } (éléments) ; reads : élément
 *   photo (facultatif), calée par research/align_photo.py, sous l'une de deux formes :
 *     { src, w, h, azCenter, pxPerDeg, models: { m: { eyeRow, rmsPx } } }  (cadrage commun)
 *     { src, w, h, anchorX, anchorAz, models: { m: { pxPerDeg, eyeRow, slope, rmsPx } } }
 *       (azimut ancré sur un repère ; échelle, basculement et hauteur propres à chaque modèle)
 *     { src, w, h, f, models: { m: { yaw, pitch, roll, rmsPx } } }  (APPAREIL, Caussols
 *       2026-09-27 : image rectiligne entière, focale f en px (EXIF) ; cap, inclinaison et
 *       rotation de l'appareil calés pour chaque modèle. Exact si la vue est centrée sur
 *       l'appareil du modèle affiché et de même champ ; à quelques dixièmes de degré près sinon)
 *   sea (facultatif, Caussols 2026-09-27) : la mer peinte jusqu'à l'horizon du MODÈLE --
 *     globe : l'horizon géométrique, −acos(R/(R+œil)) (rayon effectif pour k) ; plan : le
 *     niveau de l'œil, limite d'une mer plane infinie. Une cible marquée `horizon` est lue
 *     par rapport à cet horizon (au-dessus / au-dessous : un signe, règle 4).
 *   stamp, stampShort (facultatifs) : la source du relief, si ce n'est pas le LiDAR HD de l'IGN
 *   morph (facultatif, dip 2026-09-27) : pas de boutons ; l'animation courbe la scène --
 *     le plan, la courbure jusqu'à R, la réfraction (rayon effectif R/(1−k) : le lointain
 *     REMONTE un peu), puis la photo (cadrage du globe k) en fondu, puis clignotante (0 ↔ 100 %). Couches et crête, cuites
 *     pour les trois modèles seulement, sont interpolées entre eux (extrémités exactes) ;
 *     horizon marin, sa distance et angles des cibles sont calculés au rayon effectif courant.
 *   opacity : <input type=range> (0-100)
 *     -- la photo passe en fondu sur le rendu, en boucle (clic : pause)
 */
export function mountLandscape(canvas, o) {
  const t = makeT(document.documentElement.lang || "en", "landscape");
  const st = { model: "globeK" };
  const Rg = o.R / (1 - o.k);
  const ang = (q, m) => (m === "flat" ? flatElev(o.eye, q.d, q.h) : globeElev(m === "globeK" ? Rg : o.R, o.eye, q.d, q.h)) / D2R;
  const ReOf = (m) => (m === "flat" ? Infinity : m === "globeK" ? Rg : o.R);
  /* ÉTAT DE VUE : des poids sur les trois jeux cuits, et le rayon effectif (∞ = plan).
     Un modèle = un poids 1 ; l'animation de dip glisse de l'un à l'autre. */
  const viewOf = (m) => ({ w: { flat: +(m === "flat"), globe: +(m === "globe"), globeK: +(m === "globeK") }, Re: ReOf(m), model: m });
  const mix = (S, get) => { let v = 0; for (const k of MODELS) { const wk = S.w[k]; if (!wk) continue; const x = get(k); if (x == null || !Number.isFinite(x)) return null; v += wk * x; } return v; };
  const angS = (q, S) => (Number.isFinite(S.Re) ? globeElev(S.Re, o.eye, q.d, q.h) : flatElev(o.eye, q.d, q.h)) / D2R;
  const seaHzS = (S) => Number.isFinite(S.Re) ? -Math.acos(S.Re / (S.Re + o.eye)) / D2R : 0;
  const P0 = o.profile, L = o.layers;
  // horizon marin (degrés) de chaque modèle ; le plan : la limite, le niveau de l'œil
  const seaHz = (m) => m === "flat" ? 0 : -Math.acos((m === "globeK" ? Rg : o.R) / ((m === "globeK" ? Rg : o.R) + o.eye)) / D2R;
  // distance de l'horizon marin (m) : au-delà, un relief plus bas que l'horizon est caché par la mer
  const seaHzD = (m) => m === "flat" ? Infinity : Math.sqrt(2 * (m === "globeK" ? Rg : o.R) * o.eye);
  // le plus haut relief (hors mer) des couches à l'azimut a, en degrés (−∞ : que de la mer)
  const landTop = (m, a) => { if (!L?.[m]) return Infinity; const j = Math.round((a - L.az0) / L.step); let v = -Infinity;
    for (const row of L[m]) if (row[j] != null) v = Math.max(v, row[j] / 600); return v; };
  // dégagement d'une cible au-dessus du relief plus proche qu'elle (degrés), dans le modèle m
  const clearance = (q, m) => {
    if (!L?.[m]) return NaN;
    const j = Math.round((q.az - L.az0) / L.step); let occ = -Infinity;
    L[m].forEach((row, b) => { if (L.bandsKm[b + 1] * 1000 <= q.d * 0.97 && row[j] != null) occ = Math.max(occ, row[j] / 600); });
    return ang(q, m) - occ;
  };
  const profAt = (m, a) => { const x = (a - P0.az0) / P0.step, i = Math.floor(x), f = x - i, arr = P0[m];
    if (i < 0 || i + 1 >= arr.length) return NaN; return (arr[i] * (1 - f) + arr[i + 1] * f) / 60; };
  const profAtS = (S, a) => mix(S, (k) => profAt(k, a)) ?? NaN;
  const layerS = (S, b, j) => mix(S, (k) => L[k][b][j]);
  const landTopS = (S, a) => { if (!L) return Infinity; const j = Math.round((a - L.az0) / L.step); let v = -Infinity;
    for (let b = 0; b < L.flat.length; b++) { const x = layerS(S, b, j); if (x != null) v = Math.max(v, x / 600); } return v; };

  /* L'ANIMATION DE DIP (morph) : t en secondes -> état de vue, alpha de la photo, étape.
     plan 1,5 s · courbure 4 s · pause 1 s · réfraction 2,5 s · pause 1 s · photo : fondu puis clignotement
     tout-ou-rien (core/motion.js, REVEAL_T) ; la photo n'apparaît jamais pendant un changement de modèle. */
  const MORPH = o.photo ? [1.5, 4, 1, 2.5, 1, REVEAL_T] : [1.5, 4, 1, 2.5, 2.5], MORPH_T = MORPH.reduce((a, b) => a + b, 0);   // sans photo : pas de fondu
  const ease = (x) => x * x * (3 - 2 * x);
  function morphAt(t) {
    let u = ((t % MORPH_T) + MORPH_T) % MORPH_T, i = 0;
    while (i < MORPH.length - 1 && u >= MORPH[i]) u -= MORPH[i++];
    const x = ease(Math.min(1, u / MORPH[i]));
    // c = fraction de courbure : 0 plan, 1 globe (R), 1 − k globe réfracté (R/(1−k))
    let wf = 0, wg = 0, wk = 0, c, stage, alpha = 0;
    if (i === 0) { wf = 1; c = 0; stage = "flat"; }
    else if (i === 1) { wf = 1 - x; wg = x; c = x; stage = "curve"; }
    else if (i === 2) { wg = 1; c = 1; stage = "globe"; }
    else if (i === 3) { wg = 1 - x; wk = x; c = 1 - o.k * x; stage = "refr"; }
    else { wk = 1; c = 1 - o.k; stage = i >= 5 ? "photo" : "globeK"; alpha = i === 5 ? revealAlpha(u) : 0; }
    return { S: { w: { flat: wf, globe: wg, globeK: wk }, Re: c > 1e-6 ? o.R / c : Infinity, model: stage === "flat" ? "flat" : stage === "globe" ? "globe" : "globeK", stage }, alpha };
  }

  for (const m of MODELS) o.buttons?.[m]?.addEventListener("click", () => { st.model = m; draw(); });
  st.morphT = 0;
  // les trois modèles au choix : une carte exportée (epic11) les montre tous, redessinés au même instant
  canvas.__variant = { get: () => st.model, set: (m) => { st.model = m; draw(); } };

  // la photo en fondu : opacité en boucle 0 → 1 → 0 (3 s de fondu, 1,2 s de pause à chaque bout)
  const ph = o.photo && typeof Image === "function" ? { img: new Image(), ok: false } : null;
  const animated = !!ph || !!o.morph;
  const an = { t: 0, last: 0, raf: null, vis: true, playing: animated && !reducedMotion(), alpha: o.morph ? 0 : 0.5 };
  if (o.morph) {
    canvas.style.cursor = "pointer";
    canvas.addEventListener("click", () => { an.playing = !an.playing; an.last = 0; if (an.playing) loop(); else draw(); });
    if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { an.vis = es.some((e) => e.isIntersecting); if (an.vis && !exportBusy()) loop(); }).observe(canvas);
    if (ph) { ph.img.onload = () => { ph.ok = true; draw(); }; ph.img.src = o.photo.src; }
  } else if (ph) {
    ph.img.onload = () => { ph.ok = true; draw(); };
    ph.img.src = o.photo.src;
    canvas.style.cursor = "pointer";
    canvas.addEventListener("click", () => { an.playing = !an.playing; an.last = 0; if (an.playing) loop(); else draw(); });
    o.opacity?.addEventListener("input", () => { an.playing = false; an.alpha = o.opacity.value / 100; draw(); });
    if (typeof IntersectionObserver === "function") new IntersectionObserver((es) => { an.vis = es.some((e) => e.isIntersecting); if (an.vis && !exportBusy()) loop(); }).observe(canvas);
  }
  // export (epic10/UC02) : le fondu de la photo rejoué à l'instant t ; en mode morph, toute la courbure
  if (o.morph) {
    let saved = null;
    canvas.__anim = {
      duration: MORPH_T,
      begin() { saved = { ...an }; if (an.raf) cancelAnimationFrame(an.raf); an.raf = null; },
      frameAt(t) { an.t = t; draw(); },
      end() { if (saved) Object.assign(an, saved, { raf: null, last: 0 }); saved = null; draw(); if (an.playing) loop(); },
      readout: () => "",
    };
  } else if (ph) {
    let saved = null;
    canvas.__anim = {
      duration: 8.4,
      begin() { saved = { ...an }; if (an.raf) cancelAnimationFrame(an.raf); an.raf = null; },
      frameAt(t) { an.alpha = alphaAt(t); draw(); },
      end() { if (saved) Object.assign(an, saved, { raf: null, last: 0 }); saved = null; draw(); if (an.playing) loop(); },
      // pas de bandeau de lectures dans l'export : celles de la page sont fixes (rien ne
      // bouge pendant le fondu) et ne valent que pour le modèle affiché (propriétaire, 2026-09-26)
      readout: () => "",
    };
  }
  const alphaAt = (t) => { const u = t % 8.4; return u < 1.2 ? 0 : u < 4.2 ? (u - 1.2) / 3 : u < 5.4 ? 1 : u < 8.4 ? 1 - (u - 5.4) / 3 : 0; };
  function loop() {
    if (!animated || an.raf || typeof requestAnimationFrame !== "function") return;
    const step = (ts) => {
      an.raf = null;
      if (!an.playing || !an.vis || canvas.closest("[hidden]")) { an.last = 0; return; }
      const n = frameStep(an, ts);
      if (n) { an.t += n / 60; if (!o.morph) an.alpha = alphaAt(an.t); draw(); }
      an.raf = requestAnimationFrame(step);
    };
    an.raf = requestAnimationFrame(step);
  }

  function draw() {
    const { ctx, W, H } = setupCanvas(canvas); if (!W) return;
    const { az: azC, alt: altC, fovDeg: fov } = o.view;
    const v = (az, al) => [Math.cos(al * D2R) * Math.cos(az * D2R), Math.cos(al * D2R) * Math.sin(az * D2R), Math.sin(al * D2R)];
    const f = v(azC, altC), r = [-Math.sin(azC * D2R), Math.cos(azC * D2R), 0];
    const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
    const sc = (W / 2) / Math.tan(fov / 2 * D2R);
    const P = (az, al) => { const p = v(az, al), Z = p[0] * f[0] + p[1] * f[1] + p[2] * f[2];
      return [W / 2 + (p[0] * r[0] + p[1] * r[1] + p[2] * r[2]) / Z * sc, H / 2 - (p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) / Z * sc]; };
    const inView = (a) => Math.abs(((a - azC + 540) % 360) - 180) <= fov * 0.62;
    const M = o.morph ? morphAt(an.t) : null;
    const S = M ? M.S : viewOf(st.model), m = S.model;      // m : le modèle nommé (tampon, photo)
    const alphaPh = M ? M.alpha : an.alpha;

    // ciel
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#c9dcec"); sky.addColorStop(0.55, "#e9eef1"); sky.addColorStop(1, "#f4efe4");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // la mer, jusqu'à l'horizon du modèle (sous le relief, peint ensuite par-dessus)
    if (o.sea) {
      const hz = seaHzS(S), n = 64, pts = [];
      for (let i = 0; i <= n; i++) pts.push(P(azC - fov * 0.62 + (i / n) * fov * 1.24, hz));
      const g = ctx.createLinearGradient(0, pts[0][1], 0, H);
      g.addColorStop(0, "#9db8cf"); g.addColorStop(1, "#5d86a8");
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.lineTo(pts[n][0], H + 2); ctx.lineTo(pts[0][0], H + 2); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.strokeStyle = "rgba(29,58,90,.7)"; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#1d3a5a"; ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText(t(!Number.isFinite(S.Re) ? "sea-horizon-flat" : "sea-horizon").replace("{v}", am(hz)), W - 8, P(azC + fov * 0.4, hz)[1] + 3);
    }

    // couches, du lointain au proche, plafonnées au profil exact du modèle
    if (L?.flat) {
      const nb = L.flat.length, far = [174, 190, 210], near = [58, 70, 54], ncol = L.flat[0].length;
      for (let b = nb - 1; b >= 0; b--) {
        const w = b / (nb - 1);
        const col = near.map((c, q) => Math.round(c + (far[q] - c) * Math.pow(w, 0.7)));
        ctx.beginPath(); let open = false, x0 = 0, x1 = 0;
        const hidden = o.sea && L.bandsKm[b] * 1000 >= Math.sqrt(2 * S.Re * o.eye), hz = seaHzS(S);   // derrière l'horizon marin
        // un segment par suite de cellules pleines : un trou (la mer, 2026-09-27) coupe la tranche
        const flush = () => {
          if (!open) return;
          ctx.lineTo(x1, H + 2); ctx.lineTo(x0, H + 2); ctx.closePath();
          ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; ctx.fill();
          ctx.strokeStyle = `rgba(255,255,255,${(0.10 + 0.25 * w).toFixed(2)})`; ctx.lineWidth = 0.8; ctx.stroke();
          open = false; ctx.beginPath();
        };
        for (let j = 0; j < ncol; j++) {
          const a = L.az0 + j * L.step;
          if (!inView(a)) continue;
          const rv = layerS(S, b, j);
          if (rv === null || (hidden && rv / 600 < hz)) { flush(); continue; }
          const cap = profAtS(S, a), val = Number.isFinite(cap) ? Math.min(rv / 600, cap) : rv / 600;
          const p = P(a, val);
          open ? ctx.lineTo(p[0], p[1]) : (ctx.moveTo(p[0], p[1]), (x0 = p[0]), (open = true)); x1 = p[0];
        }
        flush();
      }
    }
    // la crête exacte (profil affiné à 1 m), un trait fin par-dessus
    ctx.beginPath(); let open = false, lx = -1e9;
    for (let i = 0; i < P0.flat.length; i++) {
      const a = P0.az0 + i * P0.step; if (!inView(a)) { open = false; continue; }
      const pv = mix(S, (k) => P0[k][i]); if (pv == null) { open = false; continue; }
      // au-dessus de la mer, la « crête » n'est que la mer lointaine : pas de trait
      if (o.sea && !(pv / 60 <= landTopS(S, a) + 0.5 / 60)) { open = false; continue; }
      const p = P(a, pv / 60);
      if (open && Math.abs(p[0] - lx) < 0.7) continue; lx = p[0];
      open ? ctx.lineTo(p[0], p[1]) : (ctx.moveTo(p[0], p[1]), (open = true));
    }
    ctx.strokeStyle = "rgba(21,26,33,.55)"; ctx.lineWidth = 1; ctx.stroke();

    // niveau de l'œil et azimuts
    const e0 = P(azC - fov, 0), e1 = P(azC + fov, 0);
    ctx.setLineDash([6, 5]); ctx.strokeStyle = "rgba(21,26,33,.45)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#39414c"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText(t("eye-level"), 8, P(azC - fov * 0.5, 0)[1] - 3);
    const stp = [0.25, 0.5, 1, 2, 5].find((s) => fov / s <= 12) || 10;
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = "rgba(255,255,255,.85)";
    for (let a = Math.ceil((azC - fov / 2) / stp) * stp; a <= azC + fov / 2; a += stp) {
      const p = P(a, altC); ctx.fillRect(p[0] - 0.5, 0, 1, 6);
      if (p[0] > 18 && p[0] < W - 18) ctx.fillText(`${(((a % 360) + 360) % 360).toFixed(stp < 1 ? 2 : 0)}°`, p[0], 8);
    }

    // les cibles nommées, à leur angle calculé dans CE modèle
    // la photo, calée : chaque colonne à son azimut, chaque ligne à sa hauteur (en bandes étroites)
    if (ph?.ok && alphaPh > 0.005 && o.photo.f != null) {
      // appareil : le centre de l'image sur la direction visée, rotation défaite, échelle sc/f
      const F = o.photo, E = F.models[m], c = P(E.yaw, E.pitch), k = sc / F.f;
      ctx.save(); ctx.globalAlpha = alphaPh;
      ctx.translate(c[0], c[1]); ctx.rotate(-E.roll * D2R); ctx.scale(k, k);
      ctx.drawImage(ph.img, -(F.w - 1) / 2, -(F.h - 1) / 2);
      ctx.restore();
    } else if (ph?.ok && alphaPh > 0.005 && o.photo.anchorAz != null) {
      // ancrée : le point (repère, ligne de l'œil) de la photo sur (azimut du repère, 0°),
      // basculement défait, échelle du modèle ramenée à celle de la vue (champ de quelques degrés :
      // l'écart gnomonique/linéaire y est négligeable)
      const F = o.photo, E = F.models[m], c = P(F.anchorAz, 0), k = sc * D2R;
      ctx.save(); ctx.globalAlpha = alphaPh;
      ctx.translate(c[0], c[1]); ctx.rotate(-Math.atan(E.slope)); ctx.scale(k / E.pxPerDeg, k / E.pxPerDeg);
      ctx.drawImage(ph.img, -(F.anchorX + 0.5), -(E.eyeRow + 0.5));
      ctx.restore();
    } else if (ph?.ok && alphaPh > 0.005) {
      const F = o.photo, E = F.models[m], xc = (F.w - 1) / 2, N = 48;
      ctx.save(); ctx.globalAlpha = alphaPh;
      for (let i = 0; i < N; i++) {
        const sx0 = (i / N) * F.w, sx1 = ((i + 1) / N) * F.w;
        const a0 = F.azCenter + (sx0 - 0.5 - xc) / F.pxPerDeg, a1 = F.azCenter + (sx1 - 0.5 - xc) / F.pxPerDeg, am_ = (a0 + a1) / 2;
        const top = (E.eyeRow + 0.5) / F.pxPerDeg, bot = (E.eyeRow + 0.5 - F.h) / F.pxPerDeg;
        const pt = P(am_, top), pb = P(am_, bot), x0 = P(a0, 0)[0], x1 = P(a1, 0)[0];
        ctx.drawImage(ph.img, sx0, 0, sx1 - sx0, F.h, x0, pt[1], x1 - x0 + 0.6, pb[1] - pt[1]);
      }
      ctx.restore();
    }

    // étiquettes étagées : Castellaras et Barbin ne sont qu'à 0,86° l'un de l'autre
    ctx.textBaseline = "bottom"; ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
    const placed = [];
    for (const q of [...o.targets].sort((x, y) => x.az - y.az)) {
      const al = angS(q, S), p = P(q.az, al);
      const lab = `${q.name} ${am(al)}`, w = ctx.measureText(lab).width;
      const cx = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, p[0]));
      let lift = 26;
      while (placed.some((b) => Math.abs(b.x - cx) < (b.w + w) / 2 + 6 && Math.abs(b.y - (p[1] - lift)) < 16)) lift += 17;
      placed.push({ x: cx, y: p[1] - lift, w });
      ctx.strokeStyle = q.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p[0], p[1] - 4); ctx.lineTo(p[0], p[1] - lift); ctx.stroke();
      ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(cx - w / 2 - 3, p[1] - lift - 16, w + 6, 14);
      ctx.fillStyle = q.color; ctx.fillText(lab, cx, p[1] - lift - 3);
    }

    // tampons
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textBaseline = "bottom";
    const km = (x) => Math.round(x / 1000).toLocaleString("en-US");
    const name = !M ? (m === "flat" ? t("m-flat") : m === "globe" ? t("m-globe") : t("m-globeK").replace("{k}", o.k))
      : M.S.stage === "flat" ? t("mo-flat") : M.S.stage === "curve" ? t("mo-curve").replace("{R}", km(S.Re))
      : M.S.stage === "globe" ? t("mo-globe").replace("{R}", km(o.R)) : M.S.stage === "refr" ? t("mo-refr").replace("{R}", km(S.Re))
      : M.S.stage === "photo" ? t("mo-photo") : t("mo-globeK").replace("{k}", o.k).replace("{R}", km(Rg));
    // deux lignes ; la version courte du tampon sous 700 px (la phrase entière est dans la légende)
    ctx.textAlign = "left"; ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.fillText(name, 8, H - 20);
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillText(W < 700 ? (o.stampShort || t("stamp-short")) : (o.stamp || t("stamp")), 8, H - 6);
    ctx.textAlign = "right"; ctx.fillText(t("fov").replace("{f}", fov.toFixed(1)), W - 8, H - 20);

    for (const k of MODELS) o.buttons?.[k]?.setAttribute("aria-pressed", String(k === m));
    if (o.opacity && document.activeElement !== o.opacity) o.opacity.value = Math.round(an.alpha * 100);
    if (o.reads) {
      const html = o.targets.map((q) => `<span class="r"><span class="dot" style="background:${q.color}"></span><b>${q.name}</b> ` +
        `${t("m-globeK-s")} ${am(ang(q, "globeK"))} · ${t("m-globe-s")} ${am(ang(q, "globe"))} · ${t("m-flat-s")} ${am(ang(q, "flat"))}</span>`).join("");
      const clr = o.targets.filter((q) => q.clearance).map((q) => {
        const f = (m) => { const c = clearance(q, m); return `${am(c)} (≈ ${Math.round(Math.tan(c * D2R) * q.d).toLocaleString("en-US")} m)`; };
        return `<span class="r"><b>${t("clear").replace("{name}", q.name)}</b> ${t("m-globeK-s")} ${f("globeK")} · ${t("m-globe-s")} ${f("globe")} · ${t("m-flat-s")} ${f("flat")}</span>`;
      }).join("");
      const vs = o.sea ? o.targets.filter((q) => q.horizon).map((q) => {
        const f = (mm) => am(ang(q, mm) - seaHz(mm));
        return `<span class="r"><b>${t("vs-horizon").replace("{name}", q.name)}</b> ${t("m-globeK-s")} ${f("globeK")} · ${t("m-globe-s")} ${f("globe")} · ${t("m-flat-s")} ${f("flat")}</span>`;
      }).join("") : "";
      const F = o.photo, ppdOf = (mm) => F.models[mm].pxPerDeg ?? F.pxPerDeg ?? F.f * D2R, amin = (mm) => `${(F.models[mm].rmsPx / ppdOf(mm) * 60).toFixed(1)}′`;
      const phHtml = F ? `<span class="r"><b>${t("photo")}</b> ${F.f != null ? t("photo-fit-cam") : F.anchorAz != null ? t(F.scaleFrom === "exif" ? "photo-fit-anchor-exif" : "photo-fit-anchor").replace("{name}", F.anchorName).replace("{az}", F.anchorAz.toFixed(2)) : t("photo-fit").replace("{az}", F.azCenter.toFixed(2)).replace("{w}", (F.w / F.pxPerDeg).toFixed(1)).replace("{px}", (60 / F.pxPerDeg).toFixed(1))}</span>` +
        `<span class="r"><span class="sub">${t("photo-rms")} ${t("m-globeK-s")} ${amin("globeK")} · ${t("m-globe-s")} ${amin("globe")} · ${t("m-flat-s")} ${amin("flat")}</span></span>` : "";
      const all = html + clr + vs + phHtml;
      if (o.reads._last !== all) { o.reads.innerHTML = all; o.reads._last = all; }
    }
  }
  return { draw, start() { draw(); loop(); }, stop() { if (an.raf) cancelAnimationFrame(an.raf); an.raf = null; an.last = 0; } };
}
