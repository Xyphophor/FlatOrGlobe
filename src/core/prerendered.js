// Cartes animées déjà rendues (epic25/UC03) : le MP4 d'une carte dont l'animation n'a pas de contrôle ne dépend pas de
// l'état de la page ; scripts/prerender-cards.mjs l'a calculé une fois (wasm Rust + ffmpeg) et il est servi sous /video/
// (Garage). Seulement des MP4 en anglais ; le reste (PNG, autres langues, animations à contrôles) se fait dans le
// navigateur comme avant. Pas de manifeste ou pas de fichier (serveur de dev, hors ligne) : on retombe sur le calcul.
export const DIR = "/video/cards/";
let manifest = null;

/** Clé du fichier dans le manifeste et dans le stockage : <onglet>/<carte>-<longueur>-<format>-<langue>.mp4 */
export function cardVideoKey(tabKey, cardId, len, format, lang = "en") { return `${tabKey}/${cardId}-${len}-${format}-${lang}.mp4`; }

/** Le manifeste (une seule demande par page ; {} s'il manque). En développement il est redemandé à chaque export : le serveur le
 *  recalcule d'après le code d'aujourd'hui (vite.config.js), une animation modifiée ne sert plus son ancienne vidéo. */
export function loadManifest(fetchFn = globalThis.fetch) {
  if (import.meta.env?.DEV) manifest = null;
  manifest ??= Promise.resolve().then(() => fetchFn(DIR + "manifest.json")).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return manifest;
}

/**
 * Adresse du MP4 prêt de cette carte, ou null (autre type, autre langue, absent du manifeste, ou contrôles modifiés).
 * `ctl` = signature des contrôles de la carte à l'instant de l'export (core/ctl-signature.js) ; une vidéo rendue avec des
 * contrôles ne sert que s'ils sont encore à leur valeur initiale. Les contributions non publiées sont rangées sous _unpublished/.
 */
export async function prerenderedUrl({ tabKey, cardId, len, format, lang, kind, ctl = "" }, fetchFn) {
  const why = (msg) => { if (import.meta.env?.DEV) console.debug(`vidéo prête non utilisée (${tabKey}/${cardId} ${len} ${format}) : ${msg}`); return null; };   // en dev, dit pourquoi on calcule
  if (kind !== "mp4") return why(`le type est ${kind}, seuls les MP4 sont pré-rendus`);
  if ((lang || "en") !== "en") return why(`la langue est ${lang}, seul l'anglais est pré-rendu`);
  const m = await loadManifest(fetchFn);
  // une carte à liste a une vidéo par option (« <carte>~<n> », scripts/prerender-cards.mjs) : celle dont la signature des
  // contrôles est l'état présent de la page
  const tail = `-${len}-${format}-en.mp4`, heads = [`${tabKey}/${cardId}`, `_unpublished/${tabKey}/${cardId}`];
  const cands = Object.keys(m).filter((k) => k.endsWith(tail) && heads.some((h) => k === h + tail || (k.startsWith(h + "~") && /^~\d+$/.test(k.slice(h.length, -tail.length)))));
  if (!cands.length) return why(`absente du manifeste (code modifié depuis le rendu, ou format non rendu : seul « hd » est pré-rendu)`);
  const hit = cands.find((k) => (m[k].ctl || "") === ctl);
  if (!hit) return why(`contrôles différents des états rendus (${ctl || "aucun"} ∉ ${cands.map((k) => m[k].ctl || "aucun").join(", ")})`);
  return DIR + hit;
}

/** Télécharge le fichier prêt (blob), ou null s'il ne vient pas : l'appelant calcule alors lui-même. */
export async function fetchPrerendered(spec, fetchFn = globalThis.fetch) {
  const url = await prerenderedUrl(spec, fetchFn); if (!url) return null;
  try { const r = await fetchFn(url); return r.ok ? await r.blob() : null; } catch { return null; }
}

/** Pour les tests. */
export function _resetManifest() { manifest = null; }
