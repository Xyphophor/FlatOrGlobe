// Onglet gabarit pour le contrat mount/render/teardown (tasks/epic01/UC03).
// Sert de référence aux migrations de l'epic02 : mount() construit le DOM
// une seule fois et branche ses propres écouteurs (chaque onglet est
// désormais responsable de son propre re-rendu -- il n'y a plus de <form>
// global unique comme dans le legacy) ; render() est l'entrée appelée par
// le registre à l'activation ; teardown() arrête tout rAF/minuteur en
// quittant l'onglet, plus strict que le legacy (qui se contentait d'un
// garde sur la visibilité, cf. CLAUDE.md et ARCHITECTURE.md §6).
import { makeT } from "../../core/i18n.js";
import { registerSources, cite, renderSources } from "../../core/citations.js";
import "./style.css";

const SOURCES = [
  { id: "wikipedia-demo", html: "Exemple de source institutionnelle (placeholder, à remplacer par une vraie référence lors d'une vraie migration)." },
];

export default {
  key: "_example",
  label: "Example",

  mount(container) {
    const t = makeT(document.documentElement.lang || "en", "_example");
    registerSources(this.key, SOURCES);

    container.innerHTML = `
      <h1>${t("title")}</h1>
      <p class="cnav-lead">${t("lead")} ${cite(this.key, "wikipedia-demo")}</p>
      <p>
        <label>
          ${t("counter-label")}
          <input type="number" id="ex-count" value="0" step="1" />
        </label>
      </p>
      <p id="ex-out"></p>
      <p id="ex-spin">0.00 rad</p>
      ${renderSources(this.key)}
    `;

    this._out = container.querySelector("#ex-out");
    this._spin = container.querySelector("#ex-spin");
    this._input = container.querySelector("#ex-count");
    this._input.addEventListener("input", () => this.render());

    // Boucle rAF de démonstration -- doit être arrêtée par teardown().
    this._angle = 0;
    this._raf = null;
    const spin = () => {
      this._angle += 0.02;
      this._spin.textContent = `${this._angle.toFixed(2)} rad`;
      this._raf = requestAnimationFrame(spin);
    };
    this._startSpin = spin;
  },

  render() {
    const n = Number(this._input.value) || 0;
    this._out.textContent = `n × 2 = ${n * 2}`;
    if (this._raf == null) this._startSpin();
  },

  teardown() {
    if (this._raf != null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  },
};
