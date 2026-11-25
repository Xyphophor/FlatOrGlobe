// Onglet "results" (propriétaire, 2026-10-04) : les cumuls, sortis de l'accueil qu'ils
// chargeaient trop. Le rayon de la Terre mesuré de toutes les façons du site (radii.js), puis
// la rotation Ω et l'unité astronomique (motion.js) ; mesures pures et validations jamais
// mélangées (règle 10). Les modules de calcul restent dans src/tabs/home/ (d'autres onglets et
// la carte d'export les importent) ; les ids homeRadii* sont gardés (carte d'export « radii »).
import { makeT } from "../../core/i18n.js";
import { tabLabel, tabExists } from "../../core/tabs.js";
import { loadRadii, splitStats } from "../home/radii.js";
import { OMEGA_SOURCES, AU_SOURCES, loadMotion, motionSplit } from "../home/motion.js";
import { evChip } from "../../core/evidence.js";
import { drawRadii } from "../home/radii-fig.js";
import { drawMotion } from "../home/motion-fig.js";
import { mountReel } from "./reel.js";
import "./style.css";

const KEY = "results";

export default {
  key: KEY,
  label: "Results",

  mount(container) {
    const t = makeT(document.documentElement.lang || "en", KEY);
    this._t = t;
    const fold = (h, body) => `<details class="fold"><summary><b>${t(h)}</b></summary><div class="fold-body">${body}</div></details>`;
    container.innerHTML = `
      <p class="eyebrow">${t("eyebrow")}</p>
      <h1>${t("h1")}</h1>
      <p class="cnav-lead">${t("lead")}</p>
      <div class="fig"><canvas id="resReel" class="res-reel" role="img" aria-label="${t("reel-alt")}"></canvas></div>
      <div class="fcap">${t("reel-cap")}</div>
      <h2 class="cnav-h2" data-sec="radius"><span id="homeRadiiH2">${t("rad-h2").replace("{k}", "…")}</span></h2>
      <p class="notes">${t("rad-lead")}</p>
      <div class="home-verdict" id="homeRadiiVerdict"></div>
      <div class="fig"><canvas id="homeRadii" class="home-radii" role="img" aria-label="${t("rad-alt")}"></canvas></div>
      <div class="fcap">${t("rad-cap")}</div>
      <div class="tablewrap"><table class="cnav-table home-radii-tab"><thead><tr><th>${t("rad-th-tab")}</th><th>${t("rad-th-what")}</th><th>${t("rad-th-n")}</th><th>${t("rad-th-med")}</th><th>${t("rad-th-iqr")}</th><th>${t("rad-th-sig")}</th><th>${t("rad-th-w")}</th><th>${t("rad-th-z")}</th></tr></thead><tbody id="homeRadiiTb"></tbody></table></div>
      ${fold("rad-f-stats-h", `<p class="notes" id="homeRadiiSum"></p><p class="notes" id="homeRadiiSumCheck"></p>`)}
      ${fold("rad-f-nc-h", `<p class="notes" id="rad-f-nc"></p>`)}
      ${fold("rad-f-method-h", `<p class="notes">${t("rad-method")}</p>`)}
      ${fold("rad-f-spread-h", `<p class="notes">${t("rad-note")}</p>`)}
      <h2 class="cnav-h2" data-sec="motion">${t("mo-h2")}</h2>
      <p class="notes">${t("mo-lead")}</p>
      <div class="home-verdict" id="homeMotionSum"></div>
      <div class="fig"><canvas id="homeMotion" class="home-motion" role="img" aria-label="${t("mo-alt")}"></canvas></div>
      <div class="fcap">${t("mo-cap")}</div>
      <div class="tablewrap"><table class="cnav-table home-motion-tab"><thead><tr><th>${t("rad-th-tab")}</th><th>${t("rad-th-what")}</th><th>${t("rad-th-n")}</th><th>${t("mo-th-v")}</th></tr></thead><tbody id="homeMotionTb"></tbody></table></div>
      ${fold("mo-f-tycho-h", `<p class="notes">${t("mo-f-tycho-p")}</p>`)}
    `;
    // la vitrine (2026-10-25) : un enchaînement de petites animations qui montrent la démarche de cinq méthodes
    const reel = container.querySelector("#resReel");
    if (reel) this._reel = mountReel(reel, Object.assign((k) => t(k), { lang: document.documentElement.lang || "en" }));
  },

  render() {
    // ready : la promesse des chargements (build_ai l'attend au lieu d'un délai fixe, 2026-10-17)
    const p = [];
    this._reel?.start();
    if (this._radii) this._drawRadii();
    if (this._motion) this._drawMotion();
    else p.push(loadRadii(tabExists).then((r) => { this._radii = r; this._fillRadii(); this._drawRadii(); }));
    if (!this._motion) p.push(Promise.all([loadMotion(OMEGA_SOURCES, tabExists), loadMotion(AU_SOURCES, tabExists)]).then(([om, au]) => { this._motion = { om, au }; this._fillMotion(); this._drawMotion(); }));
    this.ready = Promise.all(p);
  },

  /** Les deux groupes du cumul (epic17) : mesures pures, puis validations, chacun avec sa statistique. */
  _groups() {
    const S = splitStats(this._radii);
    return [{ cls: "measure", label: this._t("rad-g-pure"), ...S.pure }, { cls: "check", label: this._t("rad-g-check"), ...S.check }];
  },

  /** Cumul des rayons (radii.js) : chargé une fois, à la première visite de l'onglet. */
  _drawRadii() {
    const cv = document.getElementById("homeRadii"); if (!cv || !this._radii) return;
    const lang = document.documentElement.lang || "en", fmt = (x) => Math.round(x).toLocaleString(lang);
    drawRadii(cv, this._groups(), this._t, fmt);
  },
  _fillRadii() {
    const t = this._t, R = this._radii, lang = document.documentElement.lang || "en", fmt = (x) => Math.round(x).toLocaleString(lang);
    const te = makeT(lang, "evidence"), groups = this._groups();
    const f1 = (x) => x.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const f2 = (x) => x.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const tb = document.getElementById("homeRadiiTb");
    const row = (r, i, G) => `<tr><td><a class="xref" href="#tab-${r.tab}" data-xref="${r.tab}">${tabLabel(r.tab)}</a></td>` +
      `<td>${t(`rad-${r.key}`)}${r.enters ? `<br><span class="sub">${te("where")} ${te(r.enters)}</span>` : ""}</td><td class="num">${t(`rad-${r.key}-n`).replace("{n}", fmt(r.n))}</td>` +
      `<td class="num">${fmt(r.med)} km</td><td class="num">${r.q3 > r.q1 ? `${fmt(r.q1)}–${fmt(r.q3)} km` : "—"}</td>` +
      `<td class="num">± ${fmt(r.sigma)} km <span class="sub">(${fmt(r.stat)} ⊕ ${fmt(r.sys)})</span></td><td class="num">${r.counted === false ? t("rad-nc-tag") : `${f1(G.weights[i] * 100)} %`}</td>` +
      `<td class="num">${Math.abs(G.zs[i]) < 0.05 ? "" : G.zs[i] > 0 ? "+" : "−"}${f1(Math.abs(G.zs[i]))} σ</td></tr>`;
    if (tb) tb.innerHTML = groups.map((g) => `<tr class="grp"><th colspan="8">${evChip(g.cls, lang).trim()} ${g.label}</th></tr>` + g.rows.map((r, i) => row(r, i, g.G)).join("")).join("");
    const h2 = document.getElementById("homeRadiiH2");   // un span dans le titre : le badge et le lien « # » restent
    if (h2) h2.textContent = t("rad-h2").replace("{k}", fmt(R.length));
    const names = (keys) => (keys.length ? keys.map((k) => t(`rad-${k}`)).join(" ; ") : t("rad-none"));
    const sumOf = (g, key) => {
      const G = g.G, top = g.rows.map((r, i) => [r, G.weights[i]]).sort((a, b) => b[1] - a[1])[0];
      return t(key).replace("{k}", fmt(g.rows.length)).replace("{n}", fmt(G.n)).replace("{mean}", fmt(G.mean)).replace("{se}", fmt(G.seScaled))
        .replace("{chi2}", f1(G.chi2)).replace("{dof}", fmt(G.dof)).replace("{birge}", f2(G.birge)).replace("{z}", f1(Math.abs(G.z)))
        .replace("{ks}", fmt(G.kSigma)).replace("{excl}", names(G.excluded)).replace("{nc}", names(G.notCounted)).replace("{plain}", fmt(G.plain))
        .replace("{top}", top ? t(`rad-${top[0].key}`) : "—").replace("{topw}", top ? fmt(top[1] * 100) : "—");
    };
    const sum = document.getElementById("homeRadiiSum"), sc = document.getElementById("homeRadiiSumCheck");
    if (sum) sum.innerHTML = sumOf(groups[0], "rad-sum-pure");
    if (sc) sc.innerHTML = sumOf(groups[1], "rad-sum-check");
    const v = document.getElementById("homeRadiiVerdict");
    if (v) v.innerHTML = `<p>${evChip("measure", lang).trim()} ${sumOf(groups[0], "rad-v-pure")}</p><p>${evChip("check", lang).trim()} ${sumOf(groups[1], "rad-v-check")}</p><p class="f">${t("rad-v-flat")}</p>`;
    const nc = document.getElementById("rad-f-nc"); if (nc) nc.innerHTML = t("rad-f-nc-p").replace("{nc}", names(groups[1].G.notCounted));
  },

  /** Rotation et orbite (epic19/UC15) : Ω et l'unité astronomique, pures et validations séparées. */
  _drawMotion() {
    const cv = document.getElementById("homeMotion"); if (!cv || !this._motion) return;
    drawMotion(cv, this._motion, this._t, document.documentElement.lang || "en");
  },
  _fillMotion() {
    const t = this._t, lang = document.documentElement.lang || "en", te = makeT(lang, "evidence");
    const nf = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
    const fOm = (x) => `${nf(x * 1e5, 3)} × 10⁻⁵ rad/s`, fAu = (x) => `${nf(x / 1e6, 1)} ${t("mo-mkm")}`;
    const row = (r, f) => `<tr><td><a class="xref" href="#tab-${r.tab}" data-xref="${r.tab}">${tabLabel(r.tab)}</a></td><td>${evChip(r.purity === "pure" ? "measure" : "check", lang).trim()} ${t(`mo-${r.key}`)}` +
      `${r.enters ? `<br><span class="sub">${te("where")} ${te(r.enters)}</span>` : ""}</td><td class="num">${nf(r.n, 0)}</td><td class="num">${f(r.med)}</td></tr>`;
    const tb = document.getElementById("homeMotionTb"), M = this._motion;
    if (tb) tb.innerHTML = `<tr class="grp"><th colspan="4">Ω</th></tr>` + M.om.map((r) => row(r, fOm)).join("") + `<tr class="grp"><th colspan="4">${t("mo-au")}</th></tr>` + M.au.map((r) => row(r, fAu)).join("");
    const O = motionSplit(M.om), A = motionSplit(M.au), sum = document.getElementById("homeMotionSum");
    if (sum) sum.innerHTML = t("mo-sum").replace("{om}", O.pure.med != null ? fOm(O.pure.med) : "—").replace("{aup}", A.pure.med != null ? fAu(A.pure.med) : "—").replace("{auc}", A.check.med != null ? fAu(A.check.med) : "—");
  },

  teardown() { this._reel?.stop(); },
};
