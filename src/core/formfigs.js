// Schémas de formules, commun à tous les onglets (2026-10-01, revue de toute la
// page ; règle du propriétaire depuis le 2026-09-30 : « chaque formule doit avoir
// sa figure qui l'accompagne »). Un onglet déclare { idHôte: (tr, vals) => FIG }
// et appelle drawFormulaFigs au montage, AVANT renderTexIn (main.js) : les
// libellés data-tex des schémas deviennent du MathML avec le reste. Le bloc
// formule de la prose pose l'hôte (b.fig -> <div class="figsym" id>).
// Premier usage : src/tabs/avia/formfigs.js (epic14/UC04), généralisé ici.
import { FIG } from "./fig.js";

/** Tampon « not to scale » (règle 1) dans la langue de la page -- celui de FIG est anglais. */
export function stamp(f, tr, what) {
  f.stamped = true;
  f.note(f.w - 4, 12, `${tr("fx-nts", "not to scale")} — ${what}`, { anchor: "end", c: FIG.C.flat, size: 10 });
}

/** Tracé de données, à l'échelle de ses axes : tampon neutre (le « not to scale » automatique y serait faux). */
export function axesStamp(f, tr, what) {
  f.stamped = true;
  f.note(f.w - 4, 12, `${tr("fx-axes", "to scale of its axes")} — ${what}`, { anchor: "end", c: FIG.C.soft, size: 10 });
}

/** Dessine chaque schéma dans son hôte (s'il existe) ; renvoie le nombre de schémas montés. */
export function drawFormulaFigs(root, figs, tr = (k, fb) => fb, vals = {}, tag = "") {
  let n = 0;
  for (const [id, make] of Object.entries(figs)) {
    const host = root.querySelector(`#${id}`);
    if (host) { try { make(tr, vals).mountIn(host); n++; } catch (e) { console.warn(`[${tag}] ${id} skipped: ${e.message}`); } }
  }
  return n;
}
