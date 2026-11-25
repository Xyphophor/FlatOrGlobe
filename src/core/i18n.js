// i18n en JSON par (langue, onglet). Remplace le walker DOM du legacy
// (data-i18n + hash de contenu) par des dictionnaires plats chargés au
// build par Vite. L'anglais n'est jamais dupliqué dans les autres langues :
// une clé absente d'une langue retombe sur l'anglais, résolu ici, jamais
// stocké en double. Voir tasks/epic01/UC05.org.

const PATTERN = /\/src\/i18n\/([a-zA-Z-]+)\/([A-Za-z0-9_-]+)\.json$/;

/**
 * Logique pure, testable sans Vite : transforme une map "chemin -> objet
 * JSON" (la forme que rend import.meta.glob) en DICTS[lang][tab].
 * Exportée pour src/core/i18n.test.js -- import.meta.glob n'existe qu'à
 * l'intérieur du pipeline Vite, donc la construction elle-même ne peut pas
 * être testée sous `node --test`, mais cette fonction le peut.
 */
export function buildDicts(moduleMap) {
  const dicts = {};
  for (const path in moduleMap) {
    const m = PATTERN.exec(path);
    if (!m) continue;
    const [, lang, tab] = m;
    dicts[lang] ??= {};
    dicts[lang][tab] = moduleMap[path];
  }
  return dicts;
}

// import.meta.glob est une fonctionnalité Vite : au build, chaque fichier
// JSON sous src/i18n/<lang>/<tab>.json devient une entrée statique. Vite
// remplace l'APPEL par un objet littéral, mais ne définit pas la propriété
// import.meta.glob elle-même dans le navigateur : un garde `import.meta.glob
// ? ... : {}` était donc toujours faux en dev/build (toutes les clés
// s'affichaient brutes) et vrai seulement sous ssrLoadModule (npm run
// check), ce qui masquait le bug. Le try/catch sert uniquement à
// `node --test` (pas de Vite : l'appel lève, DICTS reste vide).
let DICTS = {};
try {
  DICTS = buildDicts(import.meta.glob("/src/i18n/*/*.json", { eager: true, import: "default" }));
} catch {
  DICTS = {};
}

export const DEFAULT_LANG = "en";

/** Réservé aux harnais hors Vite (scripts/mount-smoke.mjs) : injecte les dictionnaires. */
export function _setDicts(dicts) { DICTS = dicts; }

// Clés ajoutées par du code chargé à part (2026-10-15) : chaque contribution de l'onglet contrib apporte ses textes
// (src/tabs/contrib/<clé>/i18n/<langue>.json) quand elle est importée, et seulement si elle est publiée -- une
// contribution non publiée n'est pas dans le build, ses textes non plus. Gardées à part de DICTS pour survivre à
// _setDicts (harnais Node) et fusionnées par getDict.
const EXTRA = {};
/** Ajoute des clés au dictionnaire (langue, onglet). */
export function addDict(lang, tab, obj) { Object.assign(((EXTRA[lang] ??= {})[tab] ??= {}), obj); }
/** Les clés ajoutées (copie), pour les tests qui lisent les fichiers eux-mêmes. */
export function dictExtras() { return JSON.parse(JSON.stringify(EXTRA)); }

/** Langues pour lesquelles au moins un fichier existe. */
export function availableLangs() {
  return Object.keys(DICTS);
}

// Un `dicts` injectable (par défaut le registre Vite réel) permet de tester
// getDict/makeT/missingKeys avec des fixtures, sans passer par import.meta.glob.
export function getDict(lang, tab, dicts = DICTS) {
  const base = dicts[lang]?.[tab], ex = dicts === DICTS ? EXTRA[lang]?.[tab] : undefined;
  return ex ? { ...(base || {}), ...ex } : base || {};
}

/**
 * Construit une fonction t(key, {narrow}) pour un onglet donné, dans une
 * langue donnée. Une clé absente de la langue retombe sur l'anglais ;
 * une clé absente des deux renvoie la clé elle-même (visible en dev,
 * jamais une chaîne vide silencieuse).
 *
 * {narrow: true} sert aux libellés dessinés au canvas (epic04/UC06) :
 * le legacy notait déjà que cette couche a besoin "d'un T() dans les
 * fonctions de dessin, plus une variante étroite par chaîne" -- un
 * canvas ne réplie ni ne coupe son texte, contrairement au HTML. On
 * réutilise le même dictionnaire plutôt qu'un mécanisme séparé : une
 * variante étroite est juste une clé de plus, suffixée "::narrow"
 * (NARROW_SUFFIX ci-dessous), présente seulement pour les chaînes qui en
 * ont réellement besoin. Absente, `t(key, {narrow:true})` retombe
 * silencieusement sur la clé normale -- jamais d'erreur pour un onglet
 * qui n'a encore aucune variante étroite.
 */
const NARROW_SUFFIX = "::narrow";

export function makeT(lang, tab, dicts = DICTS) {
  const en = getDict(DEFAULT_LANG, tab, dicts);
  const cur = lang === DEFAULT_LANG ? en : getDict(lang, tab, dicts);
  return function t(key, { narrow = false } = {}) {
    // Ordre : variante étroite de LA LANGUE COURANTE d'abord (calibrée pour
    // sa propre longueur de mot), puis sa forme normale -- jamais la
    // variante étroite anglaise avant d'avoir épuisé la langue demandée,
    // sinon une traduction complète mais sans variante étroite se ferait
    // co-opter par un texte anglais plus court au lieu du sien.
    if (narrow && cur[key + NARROW_SUFFIX] != null) return cur[key + NARROW_SUFFIX];
    if (cur[key] != null) return cur[key];
    if (narrow && en[key + NARROW_SUFFIX] != null) return en[key + NARROW_SUFFIX];
    if (en[key] != null) return en[key];
    return key;
  };
}

/**
 * Liste, pour une langue et un onglet donnés, les clés de l'anglais qui
 * manquent dans cette langue -- base de l'audit de complétude i18n
 * (tasks/epic07/UC01.org, version stricte en Python ; ceci est le
 * fondement partagé côté runtime/dev).
 */
export function missingKeys(lang, tab, dicts = DICTS) {
  const en = getDict(DEFAULT_LANG, tab, dicts);
  const cur = getDict(lang, tab, dicts);
  return Object.keys(en).filter((k) => cur[k] == null);
}

// ---- Sélecteur de langue (epic04/UC01) ----------------------------------
// Le legacy changeait la langue EN PLACE, dans un seul document qui portait
// déjà tous les onglets (un marcheur de nœuds texte). Ici chaque onglet
// monte son DOM une seule fois à la demande (src/main.js) : changer de
// langue après coup ne peut pas retraverser un DOM déjà injecté sans
// dupliquer toute la logique de montage. Choix le plus simple et le plus
// sûr avec le contrat d'onglet actuel : persister le choix puis recharger
// la page, plutôt que d'inventer un remontage à chaud de chaque onglet.
const LANG_STORAGE_KEY = "fog-lang";

/** Langue mémorisée (localStorage), ou null si jamais choisie / stockage indisponible. */
export function getStoredLang() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Mémorise la langue choisie ; "en" efface la préférence (c'est déjà le défaut). */
export function setStoredLang(lang) {
  try {
    if (lang === DEFAULT_LANG) localStorage.removeItem(LANG_STORAGE_KEY);
    else localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* stockage indisponible (navigation privée, quota) -- la langue reste en/session courante */
  }
}

/**
 * Dictionnaire de traduction de la PROSE verbatim d'un onglet (par bloc,
 * clé = b.k -- voir src/core/prose.js). Réutilise tel quel le mécanisme de
 * dictionnaires ci-dessus : src/i18n/<lang>/<tab>-prose.json est chargé
 * par le même import.meta.glob que les fichiers de chaînes JS, "-prose"
 * n'est qu'un nom de "tab" de plus pour lui. Renvoie null en anglais (pas
 * de traduction à appliquer) au lieu d'un objet vide, pour que
 * renderProse() distingue "aucun dictionnaire" de "dictionnaire vide".
 */
export function getProseDict(lang, tab, dicts = DICTS) {
  if (lang === DEFAULT_LANG) return null;
  const d = getDict(lang, `${tab}-prose`, dicts);
  return Object.keys(d).length ? d : null;
}
