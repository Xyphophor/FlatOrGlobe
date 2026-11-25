// Vidéos de démonstration intégrées aux onglets (2026-10-06, demande de Xyphophor : « on a l'impression d'être
// purement théorique alors qu'on est beaucoup empirique »). Bloc de prose { t: "video", yt, title, author,
// authorUrl, start?, html (légende), k } ; la légende se traduit par sa clé comme un bloc "notes".
// Rien n'est demandé à YouTube avant le clic : la façade montre le titre et la chaîne ; le clic la remplace par
// le lecteur de youtube-nocookie.com. Pas de vignette i.ytimg.com non plus (ce serait déjà une requête).
const L = {
  en: { play: "Play", note: "loads YouTube on click", on: "on YouTube" },
  fr: { play: "Lire", note: "YouTube ne se charge qu'au clic", on: "sur YouTube" },
  es: { play: "Reproducir", note: "YouTube solo se carga al hacer clic", on: "en YouTube" },
  pt: { play: "Reproduzir", note: "o YouTube só carrega ao clicar", on: "no YouTube" },
  nl: { play: "Afspelen", note: "YouTube laadt pas na een klik", on: "op YouTube" },
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const lang = () => (typeof document !== "undefined" && L[document.documentElement.lang]) ? document.documentElement.lang : "en";

/** HTML d'une vidéo (façade + légende). */
export function videoHTML(b, capHtml) {
  const T = L[lang()], id = esc(b.yt), start = b.start ? `&t=${b.start}s` : "";
  const watch = `https://www.youtube.com/watch?v=${id}${start}`;
  return `<figure class="demo-video">`
    + `<button type="button" class="demo-play" data-yt="${id}" data-start="${b.start || 0}" data-title="${esc(b.title)}" aria-label="${esc(`${T.play} : ${b.title} — ${b.author} (${T.note})`)}">`
    + `<span class="demo-icon" aria-hidden="true"></span><span class="demo-title">${esc(b.title)}</span>`
    + `<span class="demo-by">${esc(b.author)} · ${T.note}</span></button>`
    + `<figcaption>${capHtml ? capHtml + " " : ""}<a href="${watch}" target="_blank" rel="noopener">${esc(b.title)}</a>, `
    + `<a href="${esc(b.authorUrl)}" target="_blank" rel="noopener">${esc(b.author)}</a> ${T.on}.</figcaption></figure>`;
}

/** Un seul écouteur délégué pour toute la page (main.js). */
export function wireVideos(root = document) {
  root.addEventListener("click", (e) => {
    const btn = e.target.closest?.("button.demo-play");
    if (!btn) return;
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.yt)}?autoplay=1&rel=0${+btn.dataset.start ? `&start=${+btn.dataset.start}` : ""}`;
    f.title = btn.dataset.title;
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true; f.referrerPolicy = "strict-origin-when-cross-origin"; f.className = "demo-frame";
    btn.replaceWith(f);
  });
}
