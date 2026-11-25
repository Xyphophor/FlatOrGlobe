// Vignette d'accueil de l'onglet obs (demande du propriétaire, 2026-09-26 :
// la carte d'obs n'avait pas d'image). Pas un schéma : le VRAI rendez-vous
// du 24 novembre 2026, à mi-coucher, à l'échelle angulaire vraie sur les
// deux axes -- le Soleil des éphémérides (réfraction standard, comme la
// page) derrière la crête LiDAR du globe (k = 0,13), et la crête que le
// plan prédit à sa place, en pointillé. Mêmes fonctions que la grille du
// 10 janvier (jan10.js), donc mêmes heures de contact que la page.
// Chargée à la demande par l'accueil (comme la vignette de ct).
import { FIG, C } from "../../core/fig.js";
import { sunAt, contactTimes, ridgeAt } from "./jan10.js";
import { OBS } from "../../core/ephemeris.js";
import { OBS_REFR_F } from "../../data/presets/obs.js";
import { GLOBESPOT } from "../../data/dem/globespot.js";
import { refineProfile } from "../../core/horizon.js";

const HP = refineProfile(GLOBESPOT);
const NOV24 = { date: "2026-11-24", t0: "16:50:00", span: 900, lampKM: 5000 };
const clock = (s) => [s / 3600, (s / 60) % 60, s % 60].map((x) => String(Math.floor(x)).padStart(2, "0")).join(":");

/** Instant de la vignette : mi-chemin entre premier contact et disparition, sur la crête du globe. */
export function obsHomeMoment() {
  const { first, gone } = contactTimes(HP.globeK, NOV24);
  const s = Math.round((first + gone) / 2);
  return { s, first, gone, B: sunAt(s, NOV24), at: clock(16 * 3600 + 50 * 60 + s) };
}

export function drawObsHome() {
  const W = 380, H = 180, FOV = 1.5;                  // degrés de large
  const { B, at } = obsHomeMoment();
  const S = W / FOV, ca = Math.cos(B.altApp * Math.PI / 180);           // px par degré, les deux axes
  const eyeY = 128;                                    // le niveau de l'œil (0°) placé bas : le plan est au-dessus
  const px = (az) => W / 2 + (az - B.az) * ca * S, py = (al) => eyeY - al * S;
  const f = FIG.make({ w: W, h: H, alt: `The Sun setting behind Le Grand Mourre on 24 November 2026 at ${at} CET, at true angular scale: the ridge where a globe puts it, and higher up, where a plane would` });
  const pts = (arr) => {
    const out = [];
    for (let j = 0; j < arr.length; j++) { const az = HP.az0 + j * HP.step, X = px(az); if (X >= -4 && X <= W + 4) out.push([X, py(arr[j] / 60)]); }
    return out;
  };
  const d = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const lo = OBS.limbAlt(B.altTrue, -B.sd, OBS_REFR_F), up = OBS.limbAlt(B.altTrue, B.sd, OBS_REFR_F);   // le disque aplati
  f.ellipse(px(B.az), py((lo + up) / 2), B.sd * S, (up - lo) / 2 * S, { c: "none", w: 0, fill: "#f7b733" });
  const g = pts(HP.globeK), fl = pts(HP.flat);
  f.path(`${d(g)} L${g[g.length - 1][0].toFixed(1)} ${H} L${g[0][0].toFixed(1)} ${H} Z`, { c: "none", w: 0, fill: "#d9d4c7" });
  f.path(d(g), { c: C.globe, w: 1.8 });
  f.path(d(fl), { c: C.flat, w: 1.6, dash: "5 4" });
  f.dash(0, eyeY, W, eyeY);
  f.note(6, eyeY + 12, "eye level", { size: 10 });
  const yF = py(ridgeAt(HP.flat, B.az + 0.55)), yG = py(ridgeAt(HP.globeK, B.az + 0.55));
  f.note(W - 6, yF - 6, "plane", { anchor: "end", c: C.flat });
  f.note(W - 6, Math.max(yG + 16, eyeY + 16), "globe", { anchor: "end", c: C.globe });
  f.note(6, H - 8, `24 Nov 2026, ${at} CET · ${FOV}° wide`, { size: 10 });
  f.trueScale();
  f.mountIn(document.getElementById("obsHomeFig"));
}
