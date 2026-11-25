// Découpe d'un texte de carte en paragraphes (epic25) : « \n\n » est respecté ; sinon un texte long est coupé entre deux phrases,
// par groupes d'environ 250 à 330 caractères, sans laisser un dernier paragraphe minuscule. Une carte exportée se lit sans la page
// autour : des blocs aérés, pas un mur de texte. Pas de coupure après une initiale (« J. Meeus »), une abréviation (« St. », « et al. »,
// « e.g. ») ni dans un nombre décimal (« 2.5 K » n'a pas d'espace après le point).
const ABBR = /(?:\b[A-Z]|\b(?:St|Dr|Mr|Mrs|Ms|Prof|vs|etc|et al|e\.g|i\.e|c|ca|No|Fig|ed|eds|vol|pp|approx|Jr|Sr|Mt))\.$/;

/** Phrases d'un paragraphe (coupe sur « . », « ! » ou « ? » suivi d'une espace et d'une majuscule, d'un chiffre, d'un guillemet ou d'une parenthèse). */
export function sentences(text) {
  const out = []; let start = 0;
  const re = /([.!?])(["”)\]]?)\s+(?=[A-Z0-9“"(\[])/g; let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[1].length + m[2].length, head = text.slice(start, end);
    if (ABBR.test(head.trimEnd())) continue;
    out.push(head.trim()); start = m.index + m[0].length;
  }
  const rest = text.slice(start).trim(); if (rest) out.push(rest);
  return out;
}

/** Paragraphes d'un texte de carte. `target` = taille visée d'un paragraphe en caractères. */
export function paragraphs(text, target = 280) {
  const out = [];
  for (const block of String(text || "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    if (block.length <= target * 1.25) { out.push(block); continue; }
    const groups = []; let cur = "";
    for (const s of sentences(block)) {
      if (cur && (cur + " " + s).length > target * 1.2 && cur.length >= target * 0.6) { groups.push(cur); cur = s; } else cur = cur ? cur + " " + s : s;
    }
    if (cur) groups.push(cur);
    if (groups.length > 1 && groups[groups.length - 1].length < 90) { const last = groups.pop(); groups[groups.length - 1] += " " + last; }   // pas de dernier paragraphe minuscule
    out.push(...groups);
  }
  return out;
}
