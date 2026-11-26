// Les deux expériences de l'onglet obs, dans l'onglet falsify depuis le 2026-11-26 (src/core/experiments.js).
//  - « photographier le changement de signe » : la sortie était écrite par _reads de obs/index.js à l'état de l'onglet
//    (astre, date, réfraction) ; ici l'état de départ de l'onglet : le premier sommet d'OBS_TARGETS, le k et la réfraction
//    du réglage commun de la page (core/settings.js),
//    et le Soleil de demi-diamètre moyen (16,0′) pour la part de disque.
//  - « le Grand Mourre, mesuré » : le calcul était dans obs/index.js (rApp, predicted de theo.js).
import { proseExp } from "../../core/experiments.js";
import { makeT } from "../../core/i18n.js";
import { OBS } from "../../core/ephemeris.js";
import { getSettings } from "../../core/settings.js";
import { PROSE } from "../../data/prose/obs.js";
import { OBS_SITE, OBS_TARGETS } from "../../data/presets/obs.js";
import { rApp, predicted } from "./theo.js";

const obsAm = (d) => (d * 60).toFixed(2) + "′";
const SUN_SD = 16.0 / 60;   // demi-diamètre moyen du Soleil, degrés
const mkT = (lang) => { const t = makeT(lang, "obs"); return (k, fb, vars) => { let s = t(k); if (!s || s === k) s = fb; if (vars) for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(b); return s; }; };

export const EXP = {
  "xp-obs-sign": {
    html: (lang) => proseExp("obs", PROSE, "xp-obs-sign", lang),
    wire(host, lang) {
      const T = mkT(lang), { k, refr } = getSettings(), t0 = OBS_TARGETS[0];
      const A = { ...t0, flat: OBS.flatAngle(OBS_SITE.h, t0.h, t0.d), globe: OBS.targetAngle(OBS_SITE.h, t0.h, t0.d, 6371, refr ? k : 0) };
      const disc = Math.abs(A.flat - A.globe) / (2 * SUN_SD) * 100;
      const xv = { diff: obsAm(A.flat - A.globe), pct: disc.toFixed(0) };
      host.querySelector("#obsExpOut").innerHTML = T("x-out", "<b>{name}</b>, {d} km out and {dh} m above eye height: a plane puts it <b style=\"color:var(--flat)\">{flat}</b> above the horizontal, a globe <b style=\"color:var(--globe)\">{globe}</b>{how}. The two differ by <b>{diff}</b>, which is <b>{pct}%</b> of the {body}'s disc as drawn.",
        { name: A.name, d: A.d.toFixed(2), dh: A.h - OBS_SITE.h, flat: obsAm(A.flat), globe: obsAm(A.globe), how: refr ? T("x-atk", " at k = {k}", { k: k.toFixed(2) }) : T("x-straight", " with straight rays"), ...xv, body: T("x-sun", "Sun") });
      host.querySelector("#obsExpV").innerHTML = (A.flat > 0 && A.globe < 0)
        ? T("x-v1", "<b>Verdict rule.</b> The models disagree about the <b>sign</b> here, not the size: above eye level on a plane, below it on a globe. Photograph the summit against the disc. Above &rarr; the plane prediction holds and the globe's is refuted. Level or below &rarr; no k on a plane can produce that.")
        : T("x-v2", "<b>Verdict rule.</b> Both models put this summit on the same side of eye level; the test is the <b>{diff}</b> gap, {pct}% of a disc. The far ridge carries the same gap along 3&deg; of skyline, azimuth 238.1&deg; to 241.2&deg;, and the crossing at 241.29&deg; is where the sign argument lives.", xv);
    },
  },
  "xp-obs-th": {
    html: (lang) => proseExp("obs", PROSE, "xp-obs-th", lang),
    wire(host, lang) {
      const t = makeT(lang, "obs"), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
      const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
      const q = (id) => host.querySelector("#" + id), out = q("obsThOut"), v = q("obsThV");
      const upd = () => {
        const a = +q("obsThA").value, s = +q("obsThS").value, h = +q("obsThH").value;
        if (!(s > 0 && h > 0) || !isFinite(a)) { out.textContent = ""; v.textContent = ""; return; }
        const R = rApp(a, s, h), p = predicted({ s, dh: h, k: 0.13, R: 6371 });
        out.innerHTML = isFinite(R) ? tr("obs-theo-out", "R/(1 − k) = <b>{R} km</b>").replace("{R}", nf(R, 0)) : tr("obs-theo-inf", "α ≥ Δh/s: no curvature, the plane's answer");
        v.innerHTML = tr("obs-theo-v", "plane α = {p}′ · globe α (k = 0.13) = {g}′").replace("{p}", nf(p.plane, 1)).replace("{g}", nf(p.globeK, 2));
      };
      for (const id of ["obsThA", "obsThS", "obsThH"]) q(id).addEventListener("input", upd);
      upd();
    },
  },
};
