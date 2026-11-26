// Moteur de l'onglet hh (hauteur cachée), porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html) : hhWorld() ~L15609, renderHH()/updateHidden()
// ~L15626-15703, hhSyncRefrFromGlobal()/hhBuildState() ~L15711-15742,
// hhOverlay()/drawHiddenViews() ~L15745-15820, updateHiddenSweep()
// ~L15822, updateHiddenRecords() ~L15575, hhApplyPreset() ~L15851.
// drawPanel()/drawPerspective()/scales()/boundingBox()/globeDisp()/PADX/
// PADY sont RÉUTILISÉES depuis sim/sim-legacy.js -- le legacy dit "These
// reuse drawPanel()/drawPerspective() unchanged" (L15706).
//
// R/k/refr : hh N'A PAS de rayon/coefficient à lui -- hhWorld()/
// hhBuildState() lisaient #radius/#kcoef/#refr, le formulaire de sim,
// directement (pas une copie). Ici c'est src/core/settings.js. hhK/hhRefr
// sont des REMOTE CONTROLS de ce réglage partagé (hhSyncRefrFromGlobal) :
// les éditer écrit dans settings.js, exactement comme éditer #kcoef sur
// sim -- il n'y a qu'un seul k sur la page.
import { $, DEG, fillPresetSelect, fmtDist, expNum } from "../../core/legacy-helpers.js";
import { globeElev, horizonDist, hiddenHeight } from "../../core/math.js";
import { computeAngles } from "../elev/logic.js";
import { ceilingKm } from "./logic.js";
import { drawPanel, drawPerspective, scales, boundingBox, globeDisp, PADX, PADY } from "../elev/elev-legacy.js";
import { HH_PRESETS, HH_CASES, HH_RECORDS } from "../../data/presets/hh.js";
import { getSettings, setK, setRefr } from "../../core/settings.js";
import { makeT } from "../../core/i18n.js";

let t = (k) => k;

const hhM = (x) => (x >= 1000 ? (x / 1000).toFixed(2) + " km" : x.toFixed(1) + " m");
const hhKm = (x) => (x / 1000).toFixed(x < 20000 ? 2 : 1) + " km";

/* le monde de hh : PAS de rayon/k à lui, il lit le réglage partagé (settings.js,
   remplace #radius/#kcoef/#refr du legacy). */
function hhWorld() {
  const { R: Rkm, k, refr } = getSettings();
  const R = Rkm * 1000;
  const kk = Number.isFinite(k) && k >= 0 && k < 1 ? k : 0.13;
  return { R, k: kk, on: refr, Rg: refr ? R / (1 - kk) : R };
}

export function render() {
  const p = $("tab-hh");
  if (p && p.hidden) return;
  updateHidden();
}

function updateHidden() {
  if (!$("hhOut")) return;
  const { R, k } = hhWorld();
  const Rr = R / (1 - k);
  const e = Math.max(0, expNum("hhEye", 2));
  const d = Math.max(1, expNum("hhD", 37) * 1000);
  const h = Math.max(0, expNum("hhH", 47));

  const d0 = horizonDist(R, e), d0r = horizonDist(Rr, e);
  const H = hiddenHeight(R, e, d), Hr = hiddenHeight(Rr, e, d);
  const drop = R * (1 / Math.cos(d / R) - 1);
  const visG = Math.max(0, h - H), visR = Math.max(0, h - Hr);
  const flatEl = DEG(Math.atan2(h - e, d));
  const globeEl = DEG(globeElev(R, e, d, h));

  $("hhOut").innerHTML =
    t("out-input").replace("{e}", e).replace("{d}", (d / 1000).toFixed(2)).replace("{h}", h).replace("{R}", (R / 1000).toFixed(0)) + "<br>" +
    `<span class="f">` + t("out-flat").replace("{h}", h).replace("{flatEl}", (flatEl >= 0 ? "+" : "−") + Math.abs(flatEl).toFixed(3)) + `</span><br>` +
    `<span class="g">` + t("out-globe").replace("{d0}", hhKm(d0)).replace("{H}", hhM(H)).replace("{visG}", hhM(visG)).replace("{h}", h).replace("{globeEl}", (globeEl >= 0 ? "+" : "−") + Math.abs(globeEl).toFixed(3)) + `</span><br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ` + t("out-refr").replace("{k}", k.toFixed(2)).replace("{d0r}", hhKm(d0r)).replace("{Hr}", hhM(Hr)).replace("{visR}", hhM(visR)) + `<br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ` + t("out-drop").replace("{drop}", hhM(drop));

  let verdict;
  if (H === 0) {
    verdict = t("verdict-inside").replace("{d0}", hhKm(d0));
  } else if (H >= h) {
    const refrClause = Hr >= h
      ? t("verdict-whole-still").replace("{k}", k.toFixed(2))
      : t("verdict-whole-lifts").replace("{k}", k.toFixed(2)).replace("{visR}", hhM(visR));
    verdict = t("verdict-whole").replace("{H}", hhM(H)).replace("{h}", h).replace("{refrClause}", refrClause).replace("{h}", h);
  } else {
    verdict = t("verdict-partial").replace("{H}", hhM(H)).replace("{e}", e).replace("{Hr}", hhM(Hr));
  }
  $("hhVerdict").innerHTML = verdict;

  const tb = $("hhRows");
  if (tb) {
    tb.innerHTML = HH_CASES.map((c) => {
      const Hc = hiddenHeight(R, c.e, c.d * 1000), Hcr = hiddenHeight(Rr, c.e, c.d * 1000);
      return `<tr><td>${c.n}</td><td>${c.e} m</td><td>${c.d.toFixed(2)} km</td>` +
        `<td class="ang-globe"><b>${hhM(Hc)}</b><span class="vac">with k = ${k.toFixed(2)}: ${hhM(Hcr)}</span></td>` +
        `<td class="ang-flat">0.0 m</td><td class="status">${c.r}</td></tr>`;
    }).join("");
  }
  const tn = $("hhTabNote");
  if (tn) tn.innerHTML = t("tab-note").replace("{R}", (R / 1000).toFixed(0)).replace("{k}", k.toFixed(2));

  updateHiddenRecords();
  drawHiddenViews();
}

/* ---- section 04 : deux coupes + une perspective. Remote control du réglage
   partagé -- hhK/hhRefr écrivent dans settings.js quand on les édite
   (wire()), et se resynchronisent depuis lui à chaque rendu. ---- */
function hhSyncRefrFromGlobal() {
  const { k, refr } = getSettings();
  if ($("hhRefr")) $("hhRefr").checked = refr;
  if ($("hhK")) { $("hhK").value = k; $("hhK").disabled = !refr; }
  if ($("hhKRead")) {
    $("hhKRead").textContent = refr ? t("k-readout").replace("{k}", k.toFixed(2)).replace("{ratio}", (1 / (1 - k)).toFixed(2)) : t("k-readout-off");
    $("hhKRead").style.opacity = refr ? 1 : 0.45;
  }
}

function hhBuildState() {
  const { R: Rkm, k, refr } = getSettings();
  const R = Rkm * 1000;
  const kk = Number.isFinite(k) && k >= 0 && k < 1 ? k : 0.13;
  const eye = Math.max(0, expNum("hhEye", 2));
  const d = Math.max(1, expNum("hhD", 37) * 1000);
  const h = Math.max(0, expNum("hhH", 47));
  const exMax = Math.max(1, Math.floor(R / d));
  const exReq = Math.max(1, parseFloat($("hhExagg")?.value) || 1);
  const exagg = Math.min(exReq, exMax);
  return {
    exReq, exMax, eye, R, Rg: refr ? R / (1 - kk) : R, refr, k: kk, exagg, valid: true, msg: "",
    objs: [{ d, h, az: 0, color: "#1d4ed8", key: "◆" }],
  };
}

function hhOverlay(canvas, mode, s, box) {
  const rect = canvas.getBoundingClientRect(), W = rect.width, H = rect.height;
  if (!W || !H) return;
  const ctx = canvas.getContext("2d");
  const { sx, sy } = scales(box, W, H, s.exagg);
  const T = (x, y) => [PADX + (x - box.minX) * sx, H - PADY - (y - box.minY) * sy];
  const o = s.objs[0], ex = s.exagg;
  const [ox, oy] = T(0, 0);
  ctx.setLineDash([]); ctx.textBaseline = "bottom";

  if (mode === "flat") {
    const base = T(o.d, -s.eye * ex);
    ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.9;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(base[0], base[1]); ctx.stroke();
    ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(base[0], base[1], 4, 0, 7); ctx.fill();
    ctx.font = "600 10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right"; ctx.fillText(t("cv-hidden-zero"), base[0] - 8, base[1] - 6);
    return;
  }

  const { Rd, eyeD } = globeDisp(s);
  const d0 = Rd * Math.acos(Rd / (Rd + eyeD));
  const t0 = d0 / Rd, tt = o.d / Rd;
  const P0 = T(Rd * Math.sin(t0), Rd * Math.cos(t0) - (Rd + eyeD));
  const Hd = o.d > d0 ? Rd * (1 / Math.cos((o.d - d0) / Rd) - 1) : 0;
  const Hdraw = Math.min(Hd, o.h * ex);
  const hit = T((Rd + Hdraw) * Math.sin(tt), (Rd + Hdraw) * Math.cos(tt) - (Rd + eyeD));
  const base = T(Rd * Math.sin(tt), Rd * Math.cos(tt) - (Rd + eyeD));

  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 1.9;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(P0[0], P0[1]); ctx.lineTo(hit[0], hit[1]); ctx.stroke();
  if (d0 < o.d) {
    ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(P0[0], P0[1], 4, 0, 7); ctx.fill();
    ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(t("cv-horizon").replace("{d}", fmtDist(d0)), P0[0], P0[1] - 8);
  }
  if (Hd > 0) {
    ctx.strokeStyle = "#b91c1c"; ctx.lineWidth = 6; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(hit[0], hit[1]); ctx.stroke();
    ctx.fillStyle = "#b91c1c"; ctx.font = "600 10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right";
    const lbl = Hd >= o.h * ex ? t("cv-hidden-whole").replace("{H}", fmtDist(Hd / ex)) : t("cv-hidden").replace("{H}", fmtDist(Hd / ex));
    ctx.fillText(lbl, base[0] - 9, (base[1] + hit[1]) / 2 + 4);
  }
}

function drawHiddenViews() {
  if (!$("hhFlatCanvas")) return;
  const hhPanel = $("tab-hh");
  if (hhPanel && hhPanel.hidden) return;
  hhSyncRefrFromGlobal();
  const s = hhBuildState();
  const ang = computeAngles(s);
  const box = boundingBox(s);
  drawPanel($("hhFlatCanvas"), "flat", s, ang, box); hhOverlay($("hhFlatCanvas"), "flat", s, box);
  drawPanel($("hhGlobeCanvas"), "globe", s, ang, box); hhOverlay($("hhGlobeCanvas"), "globe", s, box);
  drawPerspective($("hhPerspCanvas"), s, ang, { zoomId: "hhPzoom", nameId: "hhPerspName", metaId: "hhMetaPersp", readId: "hhPzoomRead", solid: "globe", clipHorizon: true });
  if ($("hhMetaFlat")) $("hhMetaFlat").textContent = t("meta-flat");
  if ($("hhMetaGlobe")) $("hhMetaGlobe").textContent = s.refr
    ? t("meta-globe-refr").replace("{Rg}", (s.Rg / 1000).toFixed(0)).replace("{k}", s.k.toFixed(2))
    : t("meta-globe-geo").replace("{R}", (s.R / 1000).toLocaleString());
  const ex = s.exagg;
  if ($("hhExaggRead")) $("hhExaggRead").textContent = ex === 1 ? t("exagg-true") : t("exagg-x").replace("{ex}", ex);
  if ($("hhExaggNote")) $("hhExaggNote").textContent = ex > 1
    ? t("exagg-note").replace("{ex}", ex).replace("{ex}", ex) +
      (s.exReq > s.exMax ? t("exagg-capped").replace("{exReq}", s.exReq).replace("{exMax}", s.exMax) : "")
    : "";
}


function updateHiddenRecords() {
  const tb = $("hhRecRows"); if (!tb) return;
  const { R, k, Rg } = hhWorld();
  let worst = 0, over = 0;
  tb.innerHTML = HH_RECORDS.map((r) => {
    const ceil = ceilingKm(Rg, r.h1, r.h2);
    const used = (r.d / ceil) * 100;
    worst = Math.max(worst, used);
    const isOver = used > 100; if (isOver) over++;
    return `<tr><td>${r.n}</td>` +
      `<td>${r.a} <span style="color:var(--ink-soft)">${r.h1.toLocaleString()} m</span></td>` +
      `<td>${r.b} <span style="color:var(--ink-soft)">${r.h2.toLocaleString()} m</span></td>` +
      `<td>${r.d.toFixed(1)} km</td><td class="ang-globe">${ceil.toFixed(1)} km</td>` +
      `<td class="${isOver ? "ang-flat" : "status"}"><b>${used.toFixed(0)}%</b>${isOver ? t("rec-over") : ""}</td></tr>`;
  }).join("");
  const note = $("hhRecNote"); if (!note) return;
  const { on } = hhWorld();
  note.innerHTML =
    t("rec-note-lead").replace("{Rg}", (Rg / 1000).toFixed(0)).replace("{R}", (R / 1000).toFixed(0)).replace("{k}", k.toFixed(2)).replace("{worst}", worst.toFixed(0)) +
    (over ? t(over > 1 ? "rec-note-over-plur" : "rec-note-over-sing").replace("{over}", over) : t("rec-note-none")) +
    (k > 0 && on ? t("rec-note-refr-on") : t("rec-note-refr-off")) +
    t("rec-note-tail");
}

function hhApplyPreset(key) {
  const p = HH_PRESETS[key]; if (!p) return;
  if ($("hhSel")) $("hhSel").value = key;
  $("hhEye").value = p.e; $("hhD").value = p.d; $("hhH").value = p.h;
  if ($("hhExagg")) $("hhExagg").value = p.ex;
  setRefr(true); setK(p.k); // le k unique de la page (settings.js), pas une copie locale
  const n = $("hhNote"); if (n) n.textContent = p.note || "";
  render();
  const fc = $("hhFlatCanvas");
  if (fc && fc.scrollIntoView) fc.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export function wire() {
  t = makeT(document.documentElement.lang || "en", "hh");
  fillPresetSelect("hhSel", HH_PRESETS, "— choose a documented sightline —", (p) => p.label);
  $("hhSel")?.addEventListener("change", (e) => { if (e.target.value) hhApplyPreset(e.target.value); });
  for (const id of ["hhEye", "hhD", "hhH"]) $(id)?.addEventListener("input", () => { if ($("hhSel")) $("hhSel").value = ""; render(); });
  $("hhExagg")?.addEventListener("input", render);
  $("hhPzoom")?.addEventListener("input", render);
  $("hhRefr")?.addEventListener("change", () => { setRefr($("hhRefr").checked); render(); });
  $("hhK")?.addEventListener("input", () => { setK(parseFloat($("hhK").value)); render(); });
  render();
}

export function stop() {}
