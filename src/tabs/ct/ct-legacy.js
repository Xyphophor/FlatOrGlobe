// Moteur de l'onglet ct, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html L28160-29290) par research/port_legacy_js.py :
// figures canvas, tables, expérience, écouteurs. Il cherche ses hôtes par
// id dans le document (flux verbatim src/data/prose/ct.js) et n'expose
// que wire()/draw()/stop(). Le legacy lisait #radius/#kcoef/#refr (le
// formulaire global de l'onglet sim) : ici ces lectures retombent sur les
// valeurs par défaut de la page (R = 6371 km, k = 0.13) quand l'élément
// n'existe pas -- voir legacy-helpers.js.
import { exportBusy } from "../../core/motion.js";
import { setupCanvas, niceLen } from "../../core/canvas.js";
import { $, DEG, RAD, fillPresetSelect, fmtAngle, fmtDist, fmtDiff, expNum, dipSetRate, dipHm } from "../../core/legacy-helpers.js";
import { FIG } from "../../core/fig.js";
import { OBS } from "../../core/ephemeris.js";
import { OBS_SITE, OBS_REFR_F } from "../../data/presets/obs.js";
import { GLOBESPOT } from "../../data/dem/globespot.js";
import { refineProfile } from "../../core/horizon.js";
import { drawStarSymbols } from "../../core/symbols.js";
import { makeT } from "../../core/i18n.js";
import { keyClickable } from "../../core/a11y.js";
const HORIZONS = { globespot: refineProfile(GLOBESPOT) };   // détail LiDAR à 0,01° sur la bande des couchers
// epic04/UC06 : libellés dynamiques (tables, légendes de figures FIG) --
// calculé une fois au chargement du module, cohérent avec le choix
// "changer de langue recharge la page" (voir src/core/i18n.js).
const t = makeT(document.documentElement.lang || "en", "ct");

/* ============================================================================
   TAB ct -- THE CELESTIAL THEODOLITE (v148).

   WHAT IT IS. An experiment built by flat-earth researchers: film a star being
   occulted by a mountain, and convert the TIME of the occultation into the
   elevation angle of that mountain. The sky is the vertical circle, the clock
   is the index. It is the only tab on this page that examines somebody else's
   experiment rather than a published measurement, so rule 2 (steel-man) does
   most of the work here: the timing really is good enough, and the tab says so
   before it says anything else.

   WHY k IS 0.13 IN THIS FILE AND NOT #kcoef. The page has ONE refraction
   coefficient and it lives in #kcoef -- but #kcoef is written by the elevation
   tab's PRESETS (applyPreset sets it to 0.13, 0.14, 0.17 depending on the case
   file). Wiring this tab to it would make these numbers move when someone
   picks an unrelated mountain three tabs away, which is worse than a second
   constant. Same decision, same reason, as the twi and mag tabs: the comment
   at #kcoef says "do not add a control here that writes to it", and this tab
   adds none. The value is printed in the caption so nothing is hidden.

   NO CANVAS HERE ON PURPOSE. Four SVG schematics, two computed tables, no
   pixel drawing: recurring bug nº 1 is canvas text collision at 380 px, and
   nothing on this tab needs a canvas.
   ========================================================================== */
const CT_R = 6371, CT_K = 0.13, CT_SID = 15.041;   /* km, -, arcsec per second */
const CT_PEAKS = [
  { n:"Hound's Tooth",       s:8.804  },
  { n:"Varley SE2, Squamish",s:16.726 },
  { n:"Blodgett Peak",       s:35.910 },
  { n:"Cheyenne Mountain",   s:42.630 },
  { n:"Pike's Peak",         s:50.778 },
  { n:"North Peak",          s:130.700 },
];
const CT_LATS = [0, 20, 45, 60, 70];
/* LA GRANDEUR EST gamma = s/R, PAS s/2R, et la distinction a failli passer.
   s/2R est l'ecart entre les deux MODELES sur l'angle d'un sommet vu d'un seul
   poste. Ce que la methode revendique est autre chose : le MEME rayon droit vu
   des deux bouts, donc l'angle entre les deux verticales locales, qui vaut
   l'angle au centre gamma = s/R. Verification croisee : leur propre tableur
   imprime 0deg27' de « globe slant » a 50,7 km, et s/R y vaut 27,40'. */
function ctGamma(sKm, k){ return sKm / CT_R * (1 - k) * (180 / Math.PI) * 60; }
/* how fast a star loses altitude, arcseconds per second of clock */
function ctRate(latDeg, azDeg){
  return CT_SID * Math.cos(latDeg * Math.PI / 180) * Math.sin(azDeg * Math.PI / 180);
}
function ctArcmin(a){ return a.toFixed(2) + "\u2032 (" + (a / 60).toFixed(3) + "\u00b0)"; }

function ctTabRate(){
  const cap = $("ct-tabRate").querySelector("caption").outerHTML;
  let r = `<tr><th>${t("rate-th-lat")}</th><th>${t("rate-th-ew")}</th><th>${t("rate-th-45")}</th>`
        + `<th>${t("rate-th-clock")}</th></tr>`;
  CT_LATS.forEach(la => {
    const a = ctRate(la, 90), b = ctRate(la, 45);
    r += `<tr><td>${la}\u00b0</td><td>${a.toFixed(2)}\u2033/s</td>`
       + `<td>${b.toFixed(2)}\u2033/s</td><td>${(60 / a).toFixed(1)} s</td></tr>`;
  });
  $("ct-tabRate").innerHTML = r + cap;
}

function ctTabSep(){
  const cap = $("ct-tabSep").querySelector("caption").outerHTML;
  const rate = ctRate(45, 90);
  let r = `<tr><th>${t("sep-th-peak")}</th><th>${t("sep-th-s")}</th><th class="f">${t("sep-th-plane")}</th>`
        + `<th class="g">${t("sep-th-globe-gamma")}</th><th class="g">${t("sep-th-gamma-k")}</th>`
        + `<th>${t("sep-th-worth-clock")}</th><th>${t("sep-th-measured")}</th></tr>`;
  CT_PEAKS.forEach(p => {
    const g0 = ctGamma(p.s, 0), gk = ctGamma(p.s, CT_K);
    r += `<tr><td>${p.n}</td><td>${p.s.toFixed(1)} km</td>`
       + `<td class="f">0.00\u2032 (0.000\u00b0)</td>`
       + `<td class="g">${ctArcmin(g0)}</td><td class="g">${ctArcmin(gk)}</td>`
       + `<td>${(g0 * 60 / rate).toFixed(0)} s</td><td>\u2014</td></tr>`;
  });
  $("ct-tabSep").innerHTML = r + cap;
}

/* ---- the four schematics. EDIT THE GENERATOR, NEVER THE COORDINATES. ---- */
function ctFigOpen(){
  const C = FIG.C;
  const f = FIG.make({ w:380, h:200,
    alt:"Observer, crest and star on one straight line: the star's altitude at that second is the crest's elevation angle" });
  /* LA MISE EN PAGE SUIT CELLE DE LEUR PROPRE SCHEMA : observateur a DROITE au
     sol, sommet a GAUCHE, une seule droite qui va de l'oeil a la crete et se
     prolonge vers l'etoile. Le premier jet inversait les cotes et faisait
     descendre l'etoile DERRIERE le versant oppose, ce qui dessinait autre chose
     que l'occultation. Les deux angles sont marques aux deux bouts de la meme
     droite : c'est le sujet de la section 2, et l'ouverture doit le poser. */
  const eye = [330,164], crest = [100,66], star = [76,56];
  f.ground(170, 16, 364);
  f.path("M58 170 L100 66 L142 170", { c:C.ground, w:2 });
  f.line(eye[0], eye[1], star[0], star[1], { c:C.globe, w:1.5 });   /* the one line */
  f.dot(eye[0], eye[1], { r:3.4 });
  f.dot(crest[0], crest[1], { r:3, c:C.flat });
  f.dot(star[0], star[1], { r:3, c:C.globe });
  f.arrow(star[0] + 4, star[1] + 2, crest[0] - 6, crest[1] - 3, { c:C.globe, w:1.2, head:5 });
  f.dash(eye[0], eye[1], 104, eye[1]);                              /* observer level */
  f.dash(crest[0], crest[1], 30, crest[1]);                         /* crest level */
  f.seg(crest[0], eye[1], crest[0], crest[1], { c:C.ground, label:"H \u2212 h", side:-14 });
  f.angleAt(eye[0], eye[1], 46, [260, eye[1]], crest, { label:"\u03b8\u2081", c:C.globe });
  f.angleAt(crest[0], crest[1], 24, [30, crest[1]], star, { label:"\u03b8\u2082", c:C.globe, pad:11 });
  f.note(216, 158, "distance", { anchor:"middle" });
  f.note(96, 36, "star at time T", { c:C.globe });
  f.note(300, 190, "observer", { anchor:"middle" });
  f.notToScale("elevation enlarged; in the real cases 2\u20133\u00b0");
  f.mountIn($("ct-figOpen"));
}

function ctFig1(){
  const C = FIG.C;
  const f = FIG.make({ w:380, h:200,
    alt:"The star's daily circle tilted by the latitude, its azimuth on the ground, and the rate at which it loses altitude" });
  f.ground(165, 20, 360);
  f.dot(110, 165, { r:3.5 });
  f.ellipse(110, 165, 80, 22);                                  /* the compass rose */
  f.note(110, 152, "N", { anchor:"middle" });
  f.note(194, 168, "E");
  f.arrow(110, 165, 58, 122, { c:C.globe, w:1.5 });             /* toward the pole */
  f.txt(40, 116, "P", { c:C.globe });
  f.angleAt(110, 165, 34, [30,165], [58,122], { label:"\u03c6", tex:"\\varphi", c:C.globe });
  f.angleFlat(110, 165, 80, 22, 0, 90, { label:"A", tex:"A", c:C.soft });
  f.dash(110, 165, 190, 165);
  f.line(190, 165, 190, 108, { c:C.faint, w:1.1, dash:"4 3" });
  f.dot(190, 108, { r:3, c:C.flat });
  /* Rayon 34 et non 52 : a 52 le libelle « a » tombait sur le « A » de
     l'azimut, que angleFlat pose sur la bissectrice de la rose. */
  f.angleAt(110, 165, 34, [190,165], [190,108], { label:"a", c:C.flat });
  f.arrow(196, 114, 224, 150, { c:C.flat, w:1.4, head:6 });
  f.note(230, 146, "d\u03b1/dt", { c:C.flat });
  f.notToScale("one star, one instant");
  f.mountIn($("ctfig1"));
}

function ctFig2(){
  const C = FIG.C;
  const f = FIG.make({ w:380, h:210,
    alt:"The same line of sight seen from both ends, on a plane and on a globe: the two horizontals are parallel on one and diverge by gamma on the other" });

  /* ---- A, the plane: the two horizontals are parallel, so one line makes one
     angle. The difference is zero and there is nothing to tune. ---- */
  f.ground(178, 12, 178);
  f.path("M52 178 L85 112 L118 178", { c:C.ground, w:2 });
  const a1 = [160,170], ap = [85,112], as = [48,84];
  f.dot(a1[0], a1[1], { r:3.2 });
  f.dot(ap[0], ap[1], { r:2.8, c:C.flat });
  f.line(a1[0], a1[1], as[0], as[1], { c:C.globe, w:1.4 });
  f.dot(as[0], as[1], { r:2.6, c:C.globe });
  f.dash(a1[0], a1[1], 122, a1[1]);
  f.dash(ap[0], ap[1], 36, ap[1]);
  f.angleAt(a1[0], a1[1], 28, [122,a1[1]], as, { label:"\u03b8\u2081", c:C.globe });
  f.angleAt(ap[0], ap[1], 22, [36,ap[1]], as, { label:"\u03b8\u2082", c:C.globe });
  f.note(10, 22, "plane \u00b7 no curvature");
  f.note(10, 202, "\u03b8\u2082 \u2212 \u03b8\u2081 = 0", { c:C.flat });

  /* ---- B, the globe: same straight line, but the local verticals diverge by
     the central angle, so the two ends read two angles. ---- */
  const cx = 288, cy = 700, R = 560;
  const P = (deg, up) => FIG.polar(cx, cy, R + (up || 0), deg);
  f.path("M" + P(82)[0] + " " + P(82)[1] + "A" + R + " " + R + " 0 0 0 " +
         P(99)[0] + " " + P(99)[1], { c:C.ground, w:2.2 });
  const b1 = P(86), bp = P(94, 55), bf = P(94);
  f.line(bf[0], bf[1], bp[0], bp[1], { c:C.ground, w:2 });
  f.radial(cx, cy, R, 86, 58, { c:C.faint, w:1.1, dash:"4 3" });
  f.radial(cx, cy, R + 55, 94, 40, { c:C.faint, w:1.1, dash:"4 3" });
  const bs = [b1[0] + (bp[0]-b1[0])*1.35, b1[1] + (bp[1]-b1[1])*1.35];
  f.dot(b1[0], b1[1], { r:3.2 });
  f.dot(bp[0], bp[1], { r:2.8, c:C.flat });
  f.line(b1[0], b1[1], bs[0], bs[1], { c:C.globe, w:1.4 });
  f.dot(bs[0], bs[1], { r:2.6, c:C.globe });
  const bh1 = FIG.polar(b1[0], b1[1], 55, 176), bh2 = FIG.polar(bp[0], bp[1], 44, 184);
  f.dash(b1[0], b1[1], bh1[0], bh1[1]);
  f.dash(bp[0], bp[1], bh2[0], bh2[1]);
  f.angleAt(b1[0], b1[1], 62, bh1, bs, { label:"\u03b8\u2081", c:C.globe });
  f.angleAt(bp[0], bp[1], 28, bh2, bs, { label:"\u03b8\u2082", c:C.globe });
  /* gamma se lit entre la verticale de la station et une PARALLELE a celle de la
     crete : le centre du cercle est hors du cadre, donc l'angle au centre se
     transporte ici plutot que de se dessiner la-bas. */
  f.dash(b1[0], b1[1], b1[0] + 58*Math.cos(94*Math.PI/180), b1[1] - 58*Math.sin(94*Math.PI/180), { c:C.soft });
  f.angleAt(b1[0], b1[1], 30,
            [b1[0] + 58*Math.cos(94*Math.PI/180), b1[1] - 58*Math.sin(94*Math.PI/180)],
            [b1[0] + 58*Math.cos(86*Math.PI/180), b1[1] - 58*Math.sin(86*Math.PI/180)],
            { label:"\u03b3", c:C.ink, pad:9 });
  f.note(200, 22, "globe \u00b7 same straight line");
  f.note(200, 202, "\u03b8\u2082 \u2212 \u03b8\u2081 = \u03b3 = s/R", { c:C.globe });

  f.line(190, 30, 190, 194, { c:C.faint, w:1 });
  f.exag(26, "central angle");
  f.mountIn($("ctfig2"));
}

function ctFigPole(){
  const C = FIG.C;
  const f = FIG.make({ w:380, h:200,
    alt:"One line of sight and three stations lying on it: on a plane it makes the same angle with each station's horizontal" });
  /* CE QUI SE PROPAGE EST UN ANGLE MESURE SUR UNE SEULE LIGNE DE VISEE, et le
     premier jet dessinait trois rayons paralleles distincts -- ce qui illustre
     une autre affirmation, plus faible. L'occultation ne donne pas trois
     rayons : elle en donne UN, sur lequel les stations sont alignees. Chaque
     station y porte sa propre horizontale, et la revendication plate est que
     l'angle entre la ligne et l'horizontale est le meme partout. */
  f.ground(186, 16, 364, { c:C.faint, w:1.4 });
  const A = [348,152], B = [239,120], D = [130,88], star = [46,64];
  f.line(A[0], A[1], star[0], star[1], { c:C.globe, w:1.6 });
  f.dot(star[0], star[1], { r:3, c:C.globe });
  [[A,"A",34,52],[B,"B",30,50],[D,"C",26,48]].forEach(q => {
    const s = q[0], h = [s[0] - q[3], s[1]];
    f.dash(s[0], s[1], h[0], h[1]);
    f.dot(s[0], s[1], { r:3.2 });
    f.angleAt(s[0], s[1], q[2], h, star, { label:"a", c:C.flat, pad:10 });
    f.note(s[0] + 6, s[1] + 14, q[1]);
  });
  f.note(16, 26, "one line of sight, three stations on it");
  f.notToScale("the flat model's own premise, drawn as claimed");
  f.mountIn($("ct-figPole"));
}

/* ---- LA RECURRENCE, appliquee a la direction dont la valeur est connue ----
   Meme construction que ctFigPole, une seule difference : la ligne de visee est
   HORIZONTALE. C'est le point fixe du ciel vu de l'equateur. La regle plate dit
   alors 0 degre a chaque station, indefiniment. La figure ne dessine que cette
   consequence ; la valeur observee est dans la legende, pas sur le dessin. */
function ctFigZero(){
  const C = FIG.C;
  const f = FIG.make({ w:380, h:180,
    alt:"The same line of sight, now horizontal: the flat rule gives zero degrees at every station in the chain" });
  f.ground(152, 16, 364, { c:C.faint, w:1.4 });
  const y = 108;
  f.line(30, y, 364, y, { c:C.globe, w:1.6 });
  f.dot(36, y, { r:3.4, c:C.globe });
  f.note(30, y + 20, "fixed point of the sky", { c:C.globe });
  [110, 200, 290].forEach((x, n) => {
    f.line(x, 152, x, y, { c:C.faint, w:1.1 });
    f.dot(x, y, { r:3.2 });
    f.dash(x, y, x + 44, y, { c:C.flat });
    f.txt(x + 10, y - 8, "0\u00b0", { c:C.flat });
    f.note(x - 4, 172, "ABC"[n]);
  });
  f.note(16, 26, "horizontal here, horizontal at the next station");
  f.note(16, 42, "\u2014 and at every station after it");
  f.notToScale("the flat rule carried along the chain");
  f.mountIn($("ct-figZero"));
}

/* LES QUATRE SCHEMAS SONT DESSINES UNE FOIS, HORS DU GARDE « hidden », et c'est
   la lecon de la v148. Le premier jet les appelait depuis drawCt(), qui sort tot
   quand le panneau est masque -- ce qui est juste pour tout ce qui se mesure en
   pixels, et faux pour un SVG a viewBox, qui n'a pas de largeur a mesurer. Sous
   audit-figures.js tous les panneaux sont masques : les quatre figures
   remontaient « aucun <svg> genere » alors qu'elles marchent en navigateur.
   Une figure que l'audit ne peut pas voir n'est pas auditee. Meme traitement,
   meme raison, que drawStarSymbols(). */

/* ---- POURQUOI gamma/2 A UN BOUT ET gamma SUR LA PAIRE ----------------------
   La figure de la formule de la section 5. Elle ne montre PAS les hauteurs :
   le terme arctan(dh/s) est commun aux deux modeles et n'a rien a faire ici.
   Ce qui se joue est l'angle entre la CORDE et la TANGENTE locale, qui vaut
   gamma/2 a chaque extremite -- d'ou gamma/2 entre les deux modeles vus d'un
   seul bout, et gamma entre les deux bouts d'une meme droite. */
function ctFig3(){
  const C = FIG.C;
  const f = FIG.make({ w:380, h:200,
    alt:"Chord and tangent: the chord makes half the central angle with the local horizontal at each end" });
  const cx = 190, cy = 700, R = 560;
  const P = (deg, up) => FIG.polar(cx, cy, R + (up || 0), deg);
  f.path("M" + P(74)[0] + " " + P(74)[1] + "A" + R + " " + R + " 0 0 0 " +
         P(106)[0] + " " + P(106)[1], { c:C.ground, w:2.2 });
  const A = P(78), B = P(102);
  const tA = FIG.polar(A[0], A[1], 110, 168);      /* tangente en A, vers B */
  const tB = FIG.polar(B[0], B[1], 110, 12);       /* tangente en B, vers A */
  f.radial(cx, cy, R, 78, 50, { c:C.faint, w:1.1, dash:"4 3" });
  f.radial(cx, cy, R, 102, 50, { c:C.faint, w:1.1, dash:"4 3" });
  f.dash(A[0], A[1], tA[0], tA[1]);
  f.dash(B[0], B[1], tB[0], tB[1]);
  f.line(A[0], A[1], B[0], B[1], { c:C.globe, w:1.8 });      /* LA corde */
  f.dot(A[0], A[1], { r:3.4 });
  f.dot(B[0], B[1], { r:3.4 });
  f.angleAt(A[0], A[1], 34, B, tA, { label:"\u03b3/2", c:C.ink });
  f.angleAt(B[0], B[1], 34, A, tB, { label:"\u03b3/2", c:C.ink });
  f.note(A[0] + 4, A[1] + 22, "A");
  f.note(B[0] - 12, B[1] + 22, "B");
  f.note(10, 24, "dashed: each end\u2019s own horizontal");
  f.note(10, 40, "solid: the one line joining them");
  f.exag(30, "central angle");
  f.mountIn($("ctfig3"));
}

/* (silhouettes sim/hh et angles zénithaux réciproques : legacy L28444-28700,
   portés dans src/tabs/elev, src/tabs/hh et src/tabs/surv/surv-legacy.js) */

/* ---- LES CAS TIRES DE LEUR CALCULATEUR PUBLIE ------------------------------
   UNE ENTREE PAR ONGLET DE LEUR FEUILLE [8]. Sept champs suffisent : les deux
   hauteurs, la distance, et les quatre hauteurs d'etoile (vraie et apparente,
   a l'observateur et au sommet). Tout le reste est recalcule. AJOUTER UN CAS =
   AJOUTER UNE LIGNE ICI : le menu, le tableau, les barres et la boite a
   moustaches se remplissent tout seuls, et le paragraphe qui les entoure ne
   cite aucun chiffre en dur pour cette raison.

   REGLE D'INCLUSION, ARRETEE AVANT DE REGARDER LES RESULTATS, et c'est la
   seule protection contre le tri au jugé. Sont prises toutes les lignes de
   data_table qui ont les sept nombres, PLUS :
     - hors lignes dont le nom contient « Test » : ce sont les decalages
       synthetiques de la feuille elle-meme, pas des observations ;
     - hors lignes ou l'objet occulte est la Lune : parallaxe, autre geometrie ;
     - hors lignes ou la cible est un avion (quatre lignes AstroLive) : cible
       au-dessus de l'essentiel de l'atmosphere, altitude barometrique. LEUR
       EXCLUSION NE CHANGE PAS LE SENS DU RESULTAT -- sur ces quatre lignes le
       globe l'emporte aussi, et de plus loin ; c'est dit dans la page ;
     - hors une ligne dont la hauteur apparente est INFERIEURE a la vraie aux
       deux bouts, ce qui est impossible et signale une erreur de saisie.
   RIEN D'AUTRE N'EST ECARTE. En particulier les cas ou LES DEUX modeles ratent
   ensemble restent dedans : Archie Mountain a 7,2 km rate de ~34' des deux
   cotes, Lucky Ridge a 1,1 km de ~126'. C'est la signature d'une crete mal
   identifiee, exactement le defaut de la section 3, et l'effacer embellirait
   les deux distributions a la fois. */
const CT_CASES = [
  { n:"Pikes Peak", star:"39 Aquarii", date:"2025-01-27", t:"18:43:07", hP:4300, hO:2073, s:50550.76339, sPT:2.5562, sPA:2.7486, sOT:2.1024, sOA:2.32556 },
  { n:"Blodgett Peak", star:"LP Aquarii", date:"2025-02-07", t:"19:06:56", hP:2870, hO:2073, s:35729.02237, sPT:1.1925, sPA:1.4572, sOT:0.8712, sOA:1.16361 },
  { n:"Cheyenne Mtn", star:"Mu Fornacis", date:"2025-03-09", t:"19:01:14", hP:2883, hO:2073, s:42550.75428, sPT:1.00108, sPA:1.2796, sOT:0.61842, sOA:0.93556 },
  { n:"Blue Mtn", star:"HD 32515", date:"2025-03-12", t:"21:32:54", hP:3001, hO:2073, s:49703.97636, sPT:1.00514, sPA:1.2833, sOT:0.55817, sOA:0.885 },
  { n:"Mount Rosa", star:"HD 17320", date:"2025-03-10", t:"19:51:26", hP:3506, hO:2073, s:47627.64597, sPT:1.71133, sPA:1.9435, sOT:1.283, sOA:1.54694 },
  { n:"Green Mtn", star:"HD 28388", date:"2025-03-14", t:"22:02:58", hP:3084.9, hO:2073, s:52619.93582, sPT:1.08078, sPA:1.43033, sOT:0.60758, sOA:0.93528 },
  { n:"North Peak", star:"HD55892 (I Puppis)", date:"2025-03-23", t:"21:08:21", hP:3765, hO:2073, s:130710.204, sPT:0.968, sPA:1.3293, sOT:-0.2, sOA:0.20667 },
  { n:"North Peak", star:"HD56455 (PR Puppis)", date:"2025-03-23", t:"21:09:11", hP:3765, hO:2073, s:130710.204, sPT:0.9819, sPA:1.3409, sOT:-0.1935, sOA:0.215 },
  { n:"North Peak", star:"HD56813", date:"2025-03-23", t:"21:11:40", hP:3765, hO:2073, s:130710.204, sPT:0.9788, sPA:1.3381, sOT:-0.1996, sOA:0.21528 },
  { n:"Getaway Mtn", star:"HD 102928", date:"2025-07-01", t:"00:36:25", hP:1642, hO:890, s:48973.17765, sPT:0.75772, sPA:1.0979, sOT:0.3143, sOA:0.69583 },
  { n:"Hounds Tooth", star:"HD199828", date:"2025-06-27", t:"22:47:52", hP:3067, hO:1411, s:8788.676086, sPT:10.6174, sPA:10.6883, sOT:10.5383, sOA:10.60694 },
  { n:"Old-Blyn Mtn", star:"HD206088", date:"2025-05-28", t:"01:54:46", hP:650, hO:43, s:22053.24965, sPT:1.363, sPA:1.6854, sOT:1.16394, sOA:1.51056 },
  { n:"Old-Blyn Mtn", star:"HD207098", date:"2025-05-28", t:"01:58:38", hP:636, hO:43, s:22050.42849, sPT:1.325, sPA:1.648056, sOT:1.12322, sOA:1.47361 },
  { n:"Ediz-Blyn Mtn", star:"HD187663", date:"2025-05-27", t:"23:42:17", hP:650, hO:6, s:40857.35926, sPT:0.7, sPA:1.095, sOT:0.34, sOA:0.76389 },
  { n:"Ediz-Blyn Mtn", star:"3 Cap", date:"2025-05-28", t:"00:05:07", hP:631, hO:6, s:40859.39435, sPT:0.63969, sPA:1.03436, sOT:0.27228, sOA:0.71417 },
  { n:"Varley SE2 Squamish", star:"Regulus", date:"2025-06-11", t:"00:30:21", hP:1424, hO:4, s:16677.59727, sPT:4.78581, sPA:4.95, sOT:4.6358, sOA:4.80194 },
  { n:"Puhitempi Kuaikatete", star:"EZ Cet", date:"2025-12-31", t:"01:11:53", hP:2000, hO:890, s:54512.36656, sPT:0.963056, sPA:1.30694, sOT:0.526111, sOA:0.91472 },
  { n:"Puhitempi Kuaikatete", star:"53 Cet", date:"2025-12-31", t:"01:12:17", hP:2000, hO:890, s:54512.36656, sPT:0.937528, sPA:1.28528, sOT:0.500611, sOA:0.89333 },
  { n:"Puhitempi Kuaikatete", star:"Baten Kaitos", date:"2025-12-31", t:"01:15:50", hP:1877, hO:890, s:51918.99463, sPT:0.88825, sPA:1.24167, sOT:0.451917, sOA:0.85028 },
  { n:"Getaway Mtn", star:"Al Naymat I", date:"2025-12-31", t:"00:56:52", hP:1765, hO:890, s:47723.75069, sPT:0.908917, sPA:1.238139, sOT:0.469417, sOA:0.842222 },
  { n:"Getaway Mtn", star:"44 Cet", date:"2025-12-31", t:"00:57:27", hP:1848, hO:890, s:51230.70886, sPT:0.932611, sPA:1.259694, sOT:0.49325, sOA:0.863056 },
  { n:"Unknown", star:"HD 505", date:"2025-12-31", t:"00:35:03", hP:1680, hO:890, s:51947.41242, sPT:0.852722, sPA:1.189722, sOT:0.418, sOA:0.766417 },
  { n:"Lucky Ridge", star:"Unamed", date:"2026-01-26", t:"00:58:47", hP:969, hO:865, s:1077.430832, sPT:7.523917, sPA:7.632917, sOT:7.509833, sOA:7.619 },
  { n:"Pikes Peak", star:"HD 217533", date:"2025-01-27", t:"19:31:40", hP:4299.8, hO:2073.68, s:50550.76339, sPT:2.57662, sPA:2.7675, sOT:2.10861, sOA:2.334167 },
  { n:"Pikes Peak", star:"HD 217533 (2)", date:"2025-01-31", t:"19:15:57", hP:4299.8, hO:2073.68, s:50550.76339, sPT:2.574791, sPA:2.76556, sOT:2.10667, sOA:2.33222 },
  { n:"Lucky Peak", star:"HD 76600", date:"2026-02-05", t:"19:09:46", hP:1506, hO:899, s:5589.863372, sPT:6.03889, sPA:6.184778, sOT:5.988833, sOA:6.114972 },
  { n:"Lucky Peak", star:"HD 76525", date:"2026-02-05", t:"19:09:59", hP:1506, hO:899, s:5589.863372, sPT:6.083999, sPA:6.208556, sOT:6.013, sOA:6.13875 },
  { n:"Lucky Peak", star:"SAO 117309", date:"2026-02-05", t:"19:11:35", hP:1506, hO:899, s:5589.863372, sPT:6.038583, sPA:6.163889, sOT:5.988306, sOA:6.114472 },
  { n:"Lucky Peak", star:"HD 77039", date:"2026-02-05", t:"19:12:16", hP:1506, hO:899, s:5589.863372, sPT:6.030306, sPA:6.155778, sOT:5.980056, sOA:6.106333 },
  { n:"Lucky Peak", star:"HD 78282", date:"2026-02-05", t:"19:19:33", hP:1506, hO:899, s:5589.863372, sPT:6.021583, sPA:6.147167, sOT:5.971306, sOA:6.09775 },
  { n:"Lucky Peak", star:"SAO 117493", date:"2026-02-05", t:"19:24:56", hP:1506, hO:899, s:5589.863372, sPT:6.057333, sPA:6.182333, sOT:6.007056, sOA:6.132917 },
  { n:"Lucky Peak", star:"HIP 45114", date:"2026-02-05", t:"19:24:57", hP:1506, hO:899, s:5589.863372, sPT:6.040222, sPA:6.165528, sOT:5.989944, sOA:6.116083 },
  { n:"Lucky Peak", star:"HIP 45592", date:"2026-02-05", t:"19:30:01", hP:1506, hO:899, s:5589.863372, sPT:6.044056, sPA:6.169278, sOT:5.993778, sOA:6.119833 },
  { n:"Lucky Peak", star:"SOA 117565", date:"2026-02-05", t:"19:30:24", hP:1506, hO:899, s:5589.863372, sPT:6.062389, sPA:6.187306, sOT:6.012139, sOA:6.137889 },
  { n:"Lucky Peak", star:"HD 80537", date:"2026-02-05", t:"19:33:57", hP:1506, hO:899, s:5589.863372, sPT:6.045722, sPA:6.170917, sOT:5.995444, sOA:6.1215 },
  { n:"Pikes Peak", star:"39 Aquarii (3)", date:"2025-01-31", t:"18:27:25", hP:4300, hO:2073, s:50550.76339, sPT:2.566379, sPA:2.7486, sOT:2.111771, sOA:2.32556 },
  { n:"Mount Bolton", star:"Mintaka", date:"2026-03-02", t:"01:22:42", hP:2706, hO:1010, s:77639.40064, sPT:1.26361, sPA:1.596667, sOT:0.56528, sOA:0.946778 },
  { n:"Plateau Mountain", star:"Rigel", date:"2026-03-02", t:"00:24:58", hP:2496, hO:1010, s:59585.32469, sPT:1.361944, sPA:1.667778, sOT:0.826111, sOA:1.178889 },
  { n:"Burke", star:"48 Ori", date:"2026-03-02", t:"01:16:41", hP:2349, hO:1010, s:58447.1622, sPT:1.299028, sPA:1.611944, sOT:0.773389, sOA:1.13375 },
  { n:"Mount Aldridge North Peak", star:"Alnilam", date:"2026-03-02", t:"01:21:59", hP:2828, hO:1010, s:77880.82229, sPT:1.351389, sPA:1.660111, sOT:0.650972, sOA:1.023944 },
  { n:"Baril Peak", star:"Alnitak", date:"2026-03-02", t:"01:22:00", hP:2374, hO:1010, s:60377.62871, sPT:1.468944, sPA:1.768583, sOT:0.798, sOA:1.155889 },
  { n:"Archie Mountain", star:"HD 144519", date:"2026-04-04", t:"00:28:32", hP:2279, hO:1220, s:7192.046696, sPT:7.748444, sPA:7.848028, sOT:7.687139, sOA:7.787417 },
  { n:"Archie Mountain", star:"HD 144429", date:"2026-04-04", t:"00:28:34", hP:2279, hO:1220, s:7192.046696, sPT:7.753306, sPA:7.852833, sOT:7.692, sOA:7.792194 },
  { n:"Archie Mountain", star:"HD 144392", date:"2026-04-04", t:"00:28:43", hP:2279, hO:1220, s:7192.046696, sPT:7.764778, sPA:7.864194, sOT:7.703472, sOA:7.803528 },
  { n:"Archie Mountain", star:"β 949", date:"2026-04-04", t:"00:30:47", hP:2279, hO:1220, s:7192.046696, sPT:7.747667, sPA:7.84725, sOT:7.686361, sOA:7.786639 },
  { n:"Archie Mountain", star:"Ψ Sco", date:"2026-04-04", t:"00:34:07", hP:2279, hO:1220, s:7192.046696, sPT:7.744111, sPA:7.84375, sOT:7.682806, sOA:7.783111 },
]; 
const CT_RE = 6371000;
const CTd = x => x * 60;                         /* degres -> minutes d'arc */

/* Tout ce qui se deduit d'un cas. La refraction terrestre est prise avec LEUR
   formule, s/1.5e6 degre, pour rester dans leur cadre quand on juge leur
   feuille ; le k = 0.13 du reste de la page sert ailleurs. */
function ctCase(c){
  const deg = 180 / Math.PI;
  const G    = Math.atan((c.hP - c.hO) / c.s) * deg;
  const drop = c.s / (2 * CT_RE) * deg;
  const gam  = c.s / CT_RE * deg;
  const t    = c.s / 1.5e6;
  return { c:c, G:G, drop:drop, gam:gam, t:t,
    flatOff : c.sOT - G,
    globOff : c.sOT - (G - drop),
    flatOn  : c.sOA - (G + t),
    globOn  : c.sOA - (G - drop + t),
    pairT   : c.sPT - c.sOT,
    pairFlat: c.sPT - c.sOT,                     /* le plan predit 0 */
    pairGlobe: (c.sPT - c.sOT) - gam,
    /* LA COMPARAISON DE LEUR FEUILLE : hauteur d'etoile AU SOMMET moins angle
       plat de la crete vu de L'OBSERVATEUR. Les deux bouts sont melanges, et
       l'identite ci-dessous montre ce que cela ajoute en douce. */
    mixed: c.sPT - G };
}
function ctCurrent(){
  const sel = $("ct-case"), i = sel ? (+sel.value || 0) : 0;
  return ctCase(CT_CASES[Math.min(i, CT_CASES.length - 1)]);
}

function ctTabNP(){
  const n = ctCurrent(), D = n.c, cap = $("ct-tabNP").querySelector("caption").outerHTML;
  const row = (a, b) => `<tr><td>${a}</td><td>${b}</td></tr>`;
  const am = v => (v >= 0 ? "+" : "\u2212") + Math.abs(CTd(v)).toFixed(2) + "\u2032";
  $("ct-tabNP").innerHTML =
    `<tr><th>${D.n}, ${D.star}, ${D.date} ${D.t}</th><th>${t("np-th-value")}</th></tr>` +
    row(t("np-heights"), `${D.hP} m, ${D.hO} m`) +
    row(t("np-ground-s"), (D.s / 1000).toFixed(2) + " km") +
    row(t("np-crest-plane"), n.G.toFixed(4) + "\u00b0") +
    row(t("np-crest-globe"), (n.G - n.drop).toFixed(4) + "\u00b0") +
    row(t("np-star-obs-geo"), D.sOT.toFixed(4) + "\u00b0") +
    row(t("np-star-obs-app"), D.sOA.toFixed(4) + "\u00b0") +
    row(t("np-star-crest-geo"), D.sPT.toFixed(4) + "\u00b0") +
    row(`<b>${t("np-diff-measured")}</b>`, `<b>${n.pairT.toFixed(4)}\u00b0</b>`) +
    row(`<b>${t("np-predicted")}</b>`,
        `<b class="g">${n.gam.toFixed(4)}\u00b0</b> \u00b7 <b class="f">0.0000\u00b0</b>`) +
    row(t("np-residual"), `<b class="g">${am(n.pairGlobe)}</b> \u00b7 <b class="f">${am(n.pairFlat)}</b>`) +
    row(`<b>${t("np-their-comparison")}</b>`, `<b class="f">${am(n.mixed)}</b>`) +
    row(t("np-which-is"),
        `${am(n.flatOff)} ${t("word-plus")} ${am(n.pairFlat)}`) +
    cap;
}

function ctFigBars(){
  const C = FIG.C, n = ctCurrent();
  const f = FIG.make({ w:380, h:196,
    alt:"Residual for each model and each refraction setting on the selected case" });
  const rows = [
    [t("series-plane-off"), Math.abs(CTd(n.flatOff)), C.flat],
    [t("series-plane-on"),  Math.abs(CTd(n.flatOn)),  C.flat],
    [t("series-globe-off"), Math.abs(CTd(n.globOff)), C.globe],
    [t("series-globe-on"),  Math.abs(CTd(n.globOn)),  C.globe]];
  const VMAX = Math.max(60, Math.ceil(Math.max.apply(null, rows.map(q => q[1])) / 20) * 20);
  const X0 = 104, X1 = 330, H = 20;
  const bx = v => X0 + v / VMAX * (X1 - X0);
  for(let v = 0; v <= VMAX; v += VMAX / 3){
    f.dash(bx(v), 30, bx(v), 168, { c:"#e7e3da", dash:"3 3" });
    f.note(bx(v), 184, v.toFixed(0), { anchor:"middle" });
  }
  rows.forEach((q, i) => {
    const y = 38 + i * 33, xe = Math.max(X0 + 2, bx(q[1]));
    f.note(X0 - 8, y + 14, q[0], { anchor:"end" });
    f.path(`M${X0} ${y} H${xe.toFixed(1)} V${y + H} H${X0} Z`, { c:"none", w:0, fill:q[2] });
    f.note(xe + 6, y + 14, q[1].toFixed(1) + "\u2032");
  });
  f.note(4, 20, t("bars-note"));
  f.mountIn($("ct-figBars"));
}

/* ---- LA SYNTHESE : UNE SEULE IMAGE POUR LES DEUX ETUDES ---------------------
   Quatre series : un bout / deux bouts, croisees plan / globe. Chaque serie est
   la distribution des residus ABSOLUS sur tous les cas de CT_CASES. Boite a
   moustaches classique : moustaches min-max, boite Q1-Q3, trait median, losange
   pour la moyenne.
   AVEC UN SEUL CAS IL N'Y A PAS DE DISTRIBUTION, et la figure ne fait pas
   semblant : elle trace une marque unique et le tampon le dit. Des que
   CT_CASES en contient trois, les boites apparaissent d'elles-memes. */
/* Les quatre series de la synthese : une etude x un modele. La refraction est
   appliquee aux deux bouts dans les deux etudes, c'est la reduction equitable. */
function ctSeries(){
  const a = CT_CASES.map(ctCase);
  return [
    [t("series-one-plane"), a.map(x => Math.abs(CTd(x.flatOn))),   "flat"],
    [t("series-one-globe"), a.map(x => Math.abs(CTd(x.globOn))),   "globe"],
    [t("series-two-plane"), a.map(x => Math.abs(CTd(x.pairFlat))), "flat"],
    [t("series-two-globe"), a.map(x => Math.abs(CTd(x.pairGlobe))),"globe"]];
}

function ctStats(a){
  const v = a.slice().sort((x, y) => x - y), n = v.length;
  const q = p => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
                   return v[lo] + (v[hi] - v[lo]) * (i - lo); };
  const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
  /* MOUSTACHES DE TUKEY, 1,5 IQR, et les points au-dela dessines un par un.
     Sans cela un seul cas rate a 126' etirerait l'axe et ecraserait les quatre
     boites : on ne verrait plus rien, et surtout pas les aberrants, qui sont
     la partie interessante. */
  const lo = v.find(x => x >= q1 - 1.5 * iqr), hi = v.filter(x => x <= q3 + 1.5 * iqr).pop();
  return { n:n, q1:q1, q3:q3, med:q(0.5), lo:lo, hi:hi,
           out:v.filter(x => x < lo || x > hi),
           mean:v.reduce((s, x) => s + x, 0) / n };
}
/* ---- LA LEGENDE DE LA BOITE, DESSINEE PLUTOT QU'EXPLIQUEE ------------------
   Un exemple generique, sans donnees, avec des reperes numerotes poses SUR le
   schema ; la liste sous la figure ne fait que nommer les numeros en trois
   mots. Le paragraphe qui decrivait Tukey en six lignes disait la meme chose et
   se lisait moins bien : une legende de figure doit se regarder, pas se lire.
   Les numeros vont de gauche a droite, ce qui est la seule facon de ne pas
   avoir a les chercher. */
function ctFigBoxKey(){
  const C = FIG.C, y = 86;
  const f = FIG.make({ w:380, h:150, alt:"How to read the box plot: numbered marks on a generic example" });
  const LO = 70, Q1 = 140, MED = 180, MEAN = 208, Q3 = 250, HI = 318, OUT = 352;
  f.line(LO, y, HI, y, { c:C.ink, w:1.2 });
  f.line(LO, y - 7, LO, y + 7, { c:C.ink, w:1.2 });
  f.line(HI, y - 7, HI, y + 7, { c:C.ink, w:1.2 });
  f.path(`M${Q1} ${y-11} H${Q3} V${y+11} H${Q1} Z`, { c:C.ink, w:1.5, fill:"none" });
  f.line(MED, y - 11, MED, y + 11, { c:C.ink, w:2.8 });
  f.path(`M${MEAN} ${y-6} L${MEAN+6} ${y} L${MEAN} ${y+6} L${MEAN-6} ${y} Z`,
         { c:C.ink, w:1.2, fill:"#ffffff" });
  f.dot(OUT, y, { r:2.6, c:C.ink });
  /* reperes : au-dessus et au-dessous en alternance, sinon ils se touchent */
  [[1, LO, -1], [2, Q1, 1], [3, MED, -1], [4, MEAN, 1], [5, Q3, -1], [6, HI, 1], [7, OUT, -1]]
    .forEach(q => {
      const n = q[0], x = q[1], up = q[2] < 0;
      const ty = up ? 40 : 132, ay = up ? 48 : 124, ey = up ? y - 14 : y + 14;
      f.txt(x, ty, String(n), { anchor:"middle", c:C.soft });
      f.arrow(x, ay, x, ey, { c:C.faint, w:1, head:5 });
    });
  f.notToScale(t("boxkey-generic"));
  f.mountIn($("ct-figBoxKey"));
}

function ctFigBox(){
  const C = FIG.C, S = ctSeries();
  const f = FIG.make({ w:380, h:214,
    alt:"Box plot of the absolute residual of each model, one vantage and two vantages, over every case on file" });
  const ST = S.map(q => ctStats(q[1]));
  const VMAX = Math.max(10, Math.ceil(Math.max.apply(null, ST.map(s => s.hi)) / 10) * 10);
  const X0 = 116, X1 = 336;
  const bx = v => Math.min(X1 + 12, X0 + v / VMAX * (X1 - X0));
  for(let v = 0; v <= VMAX; v += VMAX / 4){
    f.dash(bx(v), 26, bx(v), 176, { c:"#e7e3da", dash:"3 3" });
    f.note(bx(v), 194, v.toFixed(0), { anchor:"middle" });
  }
  S.forEach((q, i) => {
    const y = 44 + i * 34, col = q[2] === "flat" ? C.flat : C.globe, s = ST[i];
    f.note(X0 - 8, y + 4, q[0], { anchor:"end" });
    if(s.n < 3){ f.line(bx(s.med), y - 8, bx(s.med), y + 8, { c:col, w:2.6 }); }
    else {
      f.line(bx(s.lo), y, bx(s.hi), y, { c:col, w:1.2 });
      f.line(bx(s.lo), y - 6, bx(s.lo), y + 6, { c:col, w:1.2 });
      f.line(bx(s.hi), y - 6, bx(s.hi), y + 6, { c:col, w:1.2 });
      f.path(`M${bx(s.q1)} ${y-9} H${bx(s.q3)} V${y+9} H${bx(s.q1)} Z`, { c:col, w:1.4, fill:"none" });
      f.line(bx(s.med), y - 9, bx(s.med), y + 9, { c:col, w:2.6 });
      s.out.forEach(o => f.dot(bx(o), y, { r:2.2, c:col }));
    }
    f.path(`M${bx(s.mean)} ${y-5} L${bx(s.mean)+5} ${y} L${bx(s.mean)} ${y+5} L${bx(s.mean)-5} ${y} Z`,
           { c:col, w:1, fill:"#ffffff" });
  });
  f.note(4, 208, t("box-note"));
  f.notToScale(CT_CASES.length < 3
    ? t("box-mark-single")
    : t("box-mark-many").replace("{n}", CT_CASES.length));
  f.mountIn($("ct-figBox"));
}

function ctKeyResid(){
  const n = ctCurrent();
  const sw = inner => '<span class="sw"><svg viewBox="0 0 34 16">' + inner + '</svg></span>';
  const bar = c => sw('<rect x="2" y="4" width="30" height="9" fill="' + c + '"/>');
  const F = "var(--flat)", G = "var(--globe)";
  $("ct-keyResid").innerHTML =
    '<li>' + bar(F) + `<b>${t("resid-plane-label")}</b> ` + t("resid-plane-text")
      .replace("{a}", Math.abs(CTd(n.flatOff)).toFixed(1))
      .replace("{b}", Math.abs(CTd(n.flatOn)).toFixed(1)) + '</li>' +
    '<li>' + bar(G) + `<b>${t("resid-globe-label")}</b> ` + t("resid-globe-text")
      .replace("{a}", Math.abs(CTd(n.globOff)).toFixed(1))
      .replace("{b}′", `<b>${Math.abs(CTd(n.globOn)).toFixed(1)}′</b>`) + '</li>' +
    '<li>' + t("resid-note") + '</li>';
}
/* LES CHIFFRES VONT DANS UN TABLEAU, PAS DANS LA LEGENDE DE LA FIGURE. La
   version 2.2.1 empilait mediane, moyenne, quartiles et aberrants dans des
   <li> de .figkey : cette classe met le libelle en colonne etroite et le reste
   en flex, ce qui a 380 px disloque quatre chiffres en quatre lignes bancales.
   Une legende nomme ce qu'on voit ; un tableau porte des nombres. */
function ctTabBox(){
  const S = ctSeries(), cap = $("ct-tabBox").querySelector("caption").outerHTML;
  let r = `<tr><th>${t("tabbox-th-series")}</th><th>${t("tabbox-th-median")}</th><th>${t("tabbox-th-mean")}</th><th>${t("tabbox-th-quartiles")}</th><th>${t("tabbox-th-beyond")}</th></tr>`;
  S.forEach(q => {
    const s = ctStats(q[1]), cl = q[2] === "flat" ? "f" : "g";
    r += `<tr><td class="${cl}">${q[0]}</td><td><b>${s.med.toFixed(2)}\u2032</b></td>`
       + `<td>${s.mean.toFixed(2)}\u2032</td>`
       + `<td>${s.q1.toFixed(2)}\u2013${s.q3.toFixed(2)}\u2032</td>`
       + `<td>${s.out.length}</td></tr>`;
  });
  $("ct-tabBox").innerHTML = r + cap;
}

/* La conclusion est ECRITE PAR LE CODE et non redigee, pour la meme raison que
   les tableaux : elle classe les quatre facons de poser la question et nomme la
   plus proche. Ajouter un cas la met a jour ; aucune phrase figee ne peut donc
   devenir fausse dans le dos du lecteur. */
function ctReadBox(){
  const a = CT_CASES.map(ctCase), med = v => ctStats(v).med;
  const one = [
    [t("readbox-opt-plane-off"), med(a.map(x => Math.abs(CTd(x.flatOff))))],
    [t("readbox-opt-globe-off"), med(a.map(x => Math.abs(CTd(x.globOff))))],
    [t("readbox-opt-plane-on"),  med(a.map(x => Math.abs(CTd(x.flatOn))))],
    [t("readbox-opt-globe-on"),  med(a.map(x => Math.abs(CTd(x.globOn))))]];
  one.sort((p, q) => p[1] - q[1]);
  $("ct-readBox").innerHTML =
    `<span>${t("readbox-closest")}</span>` +
    `<span class="g"><b>${one[0][0]}</b> \u00b7 ${t("readbox-median-val").replace("{v}", one[0][1].toFixed(2))}</span>` +
    `<span>${t("readbox-next").replace("{name}", one[1][0]).replace("{v}", one[1][1].toFixed(2))}</span>` +
    `<span>${t("readbox-cases").replace("{n}", CT_CASES.length)}</span>`;
}

/* ---- LES TROIS ESTIMATIONS DE R, EN UNE FIGURE -----------------------------
   Redondante avec ctfig2 et ctfig3, et c'est voulu : une formule doit pouvoir
   se lire sans remonter deux sections. Ce que la figure ajoute, c'est de poser
   G, theta et gamma/2 AU MEME SOMMET, sur les memes rayons, pour qu'on voie
   que ce sont trois angles du meme point et non trois grandeurs sans rapport.
   Les trois labels sont sur des bissectrices presque confondues : ils tiennent
   par leurs RAYONS tres differents, 100 / 55 / 30. Ne pas les rapprocher. */
function ctFig4(){
  const C = FIG.C;
  const f = FIG.make({ w:380, h:210,
    alt:"One vantage, three angles: the flat angle G, the measured star altitude, and the half central angle between them" });
  const cx = 190, cy = 700, R = 560;
  const P = (deg, up) => FIG.polar(cx, cy, R + (up || 0), deg);
  f.path("M" + P(76)[0] + " " + P(76)[1] + "A" + R + " " + R + " 0 0 0 " +
         P(104)[0] + " " + P(104)[1], { c:C.ground, w:2.2 });
  const O = P(84), F = P(96), K = P(96, 55);
  f.line(F[0], F[1], K[0], K[1], { c:C.ground, w:2 });
  f.seg(F[0] - 16, F[1], K[0] - 16, K[1], { label:"\u0394h" });
  f.dash(O[0], O[1], F[0], F[1], { c:C.faint });                 /* la corde */
  const h = FIG.polar(O[0], O[1], 92, 174);
  f.dash(O[0], O[1], h[0], h[1]);                                /* l'horizontale locale */
  f.line(O[0], O[1], K[0], K[1], { c:C.globe, w:1.6 });          /* la visee */
  f.dot(O[0], O[1], { r:3.4 });
  f.dot(K[0], K[1], { r:3, c:C.flat });
  f.angleAt(O[0], O[1], 100, F, K, { label:"G", c:C.flat });
  f.angleAt(O[0], O[1], 55, h, K, { label:"\u03b8", c:C.globe });
  f.angleAt(O[0], O[1], 30, h, F, { label:"\u03b3/2", c:C.ink });
  f.seg(O[0], 186, F[0], 186, { label:"s" });
  f.exag(30, "central angle");
  f.mountIn($("ctfig4"));
}

/* ---- LE RAYON, REMONTE DEPUIS LEURS PROPRES RELEVES ------------------------
   Chaque cas donne une estimation de R. Trois facons de la tirer, et elles ne
   valent pas la meme chose :

   (a) DEPUIS gamma, deux vantages : R = s / gamma. Circulaire, et la page le
       dit : gamma est la difference de deux hauteurs que Stellarium calcule
       sur un globe de 6371 km. La mediane tombe donc sur 6371 par
       construction. Cela ne prouve rien -- c'est un controle de transcription,
       et il est utile a ce titre uniquement.
   (b) DEPUIS UN SEUL POSTE, sans reduction : R = s / (2 (G - theta_vraie)).
       G vient des cartes et des altitudes, pas du logiciel : c'est donc la
       version informative. Mais elle melange une hauteur d'etoile GEOMETRIQUE
       avec une occultation qui s'est produite dans la direction APPARENTE.
   (c) DEPUIS UN SEUL POSTE, reduction coherente : la refraction terrestre
       relevant la crete de k*s/2R, R = (1-k) s / (2 (G - theta_apparente)).
       C'est la seule des trois qui soit a la fois semi-independante et
       reduite proprement.

   SEUIL DE DISTANCE, ANNONCE D'AVANCE ET NON CHOISI APRES COUP : on ne garde
   que les cas ou les deux modeles s'ecartent de plus de 5 minutes d'arc, soit
   s/2R > 5', soit s >= 20 km. En dessous, le denominateur est de l'ordre de
   l'erreur de crete et R part a l'infini ou devient negatif -- ce n'est pas du
   bruit qu'on cache, c'est une division par presque zero. */
const CT_SMIN = 20000, CT_KTHEIR = 0.1483;   /* metres ; leur k implicite, s/1.5e6 */
function ctRadii(){
  const deg = 180 / Math.PI, out = [[], [], []];
  CT_CASES.forEach(c => {
    if(c.s < CT_SMIN) return;
    const G = Math.atan((c.hP - c.hO) / c.s) * deg;
    const g = (c.sPT - c.sOT) / deg, a = (G - c.sOT) / deg, b = (G - c.sOA) / deg;
    if(g > 0) out[0].push(c.s / g / 1000);
    if(a > 0) out[1].push(c.s / (2 * a) / 1000);
    if(b > 0) out[2].push((1 - CT_KTHEIR) * c.s / (2 * b) / 1000);
  });
  return [["\u03b3 \u00b7 two ends", out[0], "globe"],
          ["one end \u00b7 raw",      out[1], "flat"],
          ["one end \u00b7 reduced",  out[2], "globe"]];
}
function ctFigR(){
  const C = FIG.C, S = ctRadii();
  const f = FIG.make({ w:380, h:196,
    alt:"Earth radius recovered from each case, three reductions, against the accepted value" });
  const ST = S.map(q => ctStats(q[1]));
  const VMAX = 12000, X0 = 120, X1 = 340;
  const bx = v => Math.max(X0 - 6, Math.min(X1 + 10, X0 + v / VMAX * (X1 - X0)));
  [0, 4000, 8000, 12000].forEach(v => {
    f.dash(bx(v), 26, bx(v), 150, { c:"#e7e3da", dash:"3 3" });
    f.note(bx(v), 168, (v / 1000).toFixed(0), { anchor:"middle" });
  });
  f.line(bx(6371), 30, bx(6371), 152, { c:C.globe, w:1.6 });
  f.note(bx(6371) + 5, 188, "6371 km", { c:C.globe });
  S.forEach((q, i) => {
    const y = 46 + i * 34, col = q[2] === "flat" ? C.flat : C.globe, s = ST[i];
    f.note(X0 - 10, y + 4, q[0], { anchor:"end" });
    f.line(bx(s.lo), y, bx(s.hi), y, { c:col, w:1.2 });
    f.line(bx(s.lo), y - 6, bx(s.lo), y + 6, { c:col, w:1.2 });
    f.line(bx(s.hi), y - 6, bx(s.hi), y + 6, { c:col, w:1.2 });
    f.path(`M${bx(s.q1)} ${y-9} H${bx(s.q3)} V${y+9} H${bx(s.q1)} Z`, { c:col, w:1.4, fill:"none" });
    f.line(bx(s.med), y - 9, bx(s.med), y + 9, { c:col, w:2.6 });
    s.out.forEach(o => f.dot(bx(o), y, { r:2.2, c:col }));
  });
  f.note(4, 190, "recovered radius, thousands of km");
  f.notToScale(ST[0].n + " cases beyond 20 km");
  f.mountIn($("ct-figR"));
}
function ctTabR(){
  const S = ctRadii(), cap = $("ct-tabR").querySelector("caption").outerHTML;
  let r = `<tr><th>reduction</th><th>cases</th><th>median R</th><th>quartiles</th><th>off 6371</th></tr>`;
  S.forEach(q => {
    const s = ctStats(q[1]), cl = q[2] === "flat" ? "f" : "g";
    r += `<tr><td class="${cl}">${q[0]}</td><td>${s.n}</td>`
       + `<td><b>${s.med.toFixed(0)} km</b></td>`
       + `<td>${s.q1.toFixed(0)}\u2013${s.q3.toFixed(0)} km</td>`
       + `<td>${((s.med - 6371) / 6371 * 100).toFixed(1)} %</td></tr>`;
  });
  $("ct-tabR").innerHTML = r + cap;
}
function ctReadR(){
  const S = ctRadii(), s = ctStats(S[2][1]);
  $("ct-readR").innerHTML =
    `<span>Radius from their data, reduced consistently</span>` +
    `<span class="g"><b>${s.med.toFixed(0)} km</b> \u00b7 median of ${s.n}</span>` +
    `<span>accepted value 6371 km</span>`;
}

/* ---- LA PRISE DE VUE DU 24 NOVEMBRE, POSEE SUR LES MEMES AXES --------------
   L'onglet obs mesure la meme grandeur que celui-ci avec un instrument
   entierement different : un disque solaire comme regle, pas d'horloge, pas de
   hauteur d'etoile lue dans un logiciel. Sa prediction est donc un POINT que
   l'on peut placer a l'avance sur la droite que le jeu de donnees trace deja.
   Si elle y tombe, deux instruments independants concordent ; sinon l'un des
   deux est faux, et c'est dit avant la prise de vue.
   Seuil de 20 km, le meme qu'a la section 6 et pour la meme raison. */
const CT_OBS = { s:54100, dh:208, name:"24 Nov 2026 shot" };
function ctTrend(){
  const deg = 180 / Math.PI, pts = [];
  CT_CASES.forEach(c => {
    if(c.s < CT_SMIN) return;
    const G = Math.atan((c.hP - c.hO) / c.s) * deg, t = c.s / 1.5e6;
    pts.push({ s:c.s/1000,
               flat: Math.abs(c.sOA - (G + t)) * 60,
               globe: Math.abs(c.sOA - (G - c.s/(2*CT_RE)*deg + t)) * 60 });
  });
  const th = km => (1 - CT_KTHEIR) * km*1000 / (2*CT_RE) * deg * 60;
  let n=0, sx=0, sy=0, sxx=0, syy=0, sxy=0;
  pts.forEach(p => { const x = th(p.s), y = p.flat;
    n++; sx+=x; sy+=y; sxx+=x*x; syy+=y*y; sxy+=x*y; });
  const slope = (n*sxy - sx*sy) / (n*sxx - sx*sx);
  const rho = (n*sxy - sx*sy) / Math.sqrt((n*sxx - sx*sx)*(n*syy - sy*sy));
  return { pts:pts, th:th, n:n, slope:slope, r:rho,
           obs: th(CT_OBS.s/1000) };
}
function ctFigTrend(){
  const C = FIG.C, T = ctTrend();
  const f = FIG.make({ w:380, h:190,
    alt:"Box plot of each model's absolute residual beyond 20 km, with the 24 November prediction marked on both" });
  /* MEME GRAMMAIRE QUE LA SECTION 6, et c'est tout l'interet du changement : le
     nuage de points precedent demandait au lecteur d'apprendre une seconde
     facon de lire une figure au milieu d'un raisonnement. Deux boites, une
     marque par boite. Les statistiques du nuage -- la correlation, la pente --
     restent dans la bande de lecture, ou elles se lisent comme des nombres. */
  const S = [["plane", T.pts.map(p => p.flat),  "flat"],
             ["globe", T.pts.map(p => p.globe), "globe"]];
  const ST = S.map(q => ctStats(q[1]));
  const VMAX = Math.max(20, Math.ceil(Math.max(T.obs, Math.max.apply(null, ST.map(s => s.hi))) / 5) * 5);
  const X0 = 104, X1 = 336;
  const bx = v => Math.max(X0 - 6, Math.min(X1 + 12, X0 + v / VMAX * (X1 - X0)));
  for(let v = 0; v <= VMAX; v += VMAX/4){
    f.dash(bx(v), 30, bx(v), 132, { c:"#e7e3da", dash:"3 3" });
    f.note(bx(v), 150, v.toFixed(0), { anchor:"middle" });
  }
  S.forEach((q, i) => {
    const y = 52 + i * 46, col = q[2] === "flat" ? C.flat : C.globe, s = ST[i];
    f.note(X0 - 10, y + 4, q[0], { anchor:"end" });
    f.line(bx(s.lo), y, bx(s.hi), y, { c:col, w:1.2 });
    f.line(bx(s.lo), y-6, bx(s.lo), y+6, { c:col, w:1.2 });
    f.line(bx(s.hi), y-6, bx(s.hi), y+6, { c:col, w:1.2 });
    f.path(`M${bx(s.q1)} ${y-9} H${bx(s.q3)} V${y+9} H${bx(s.q1)} Z`, { c:col, w:1.4, fill:"none" });
    f.line(bx(s.med), y-9, bx(s.med), y+9, { c:col, w:2.6 });
    s.out.forEach(o => f.dot(bx(o), y, { r:2.2, c:col }));
    /* la marque du 24 novembre : sur la boite du plan, l'ecart qu'il devra
       montrer ; sur celle du globe, le zero qu'il devra montrer. */
    const v = i === 0 ? T.obs : 0;
    f.line(bx(v), y-15, bx(v), y+15, { c:C.ink, w:2 });
    f.note(bx(v) + 6, y - 18, "24 Nov");
  });
  f.note(4, 168, "absolute residual, arcminutes");
  f.notToScale(T.n + " cases beyond 20 km");
  f.mountIn($("ct-figTrend"));
}

function ctReadTrend(){
  const T = ctTrend();
  $("ct-readTrend").innerHTML =
    `<span>Flat residual against the curvature term</span>` +
    `<span class="g">r = ${T.r.toFixed(3)} over ${T.n} cases</span>` +
    `<span>slope ${T.slope.toFixed(2)} against a predicted 1.00</span>` +
    `<span class="f">the 24 November shot must land at ${T.obs.toFixed(1)}\u2032</span>`;
}

/* ---- LES QUATRE MINUTES DU 24 NOVEMBRE, EN VUE FILTREE ---------------------
   Quatre vignettes fixes, une par minute a partir de l'heure par defaut de
   l'onglet obs. Elles montrent ce qu'un filtre solaire dense montrera : le
   disque, et le relief seulement la ou il y mord.
   PAS DE CANVAS. Le reste de cet onglet n'en a pas, et une vignette de 176 px
   n'a aucune raison d'en introduire un. Le decoupage par le disque se fait donc
   sans clipPath : on peint le fond, le disque, les deux silhouettes, puis on
   REPEINT tout ce qui est hors du disque avec un rectangle perce d'un trou --
   le trou vient du sens de parcours inverse du cercle, la regle de remplissage
   nonzero de SVG faisant le reste.
   Le profil est echantillonne tous les 0,1 degre : c'est la resolution du
   releve de terrain embarque, pas un lissage. Les facettes sont donc la donnee.
   Le disque est centre dans chaque vignette : c'est le relief qui monte a
   travers lui, ce qui est la comparaison utile avec une photographie. */
const CT_SHOOT = { date:"2026-11-24", t0:"16:56:33", n:4, stepMin:1 };
function ctFigShoot(){
  const C = FIG.C, HP = (typeof HORIZONS !== "undefined") && HORIZONS[OBS_SITE.key];
  if(!HP || typeof OBS === "undefined") return;
  /* HAUTEUR 322 ET NON 306 : les libelles de la rangee du bas se posent a
     y = 178 + 122 + 13 = 313. A 306 ils etaient dessines HORS DU CADRE et donc
     invisibles. audit-figures verifie le debordement horizontal, pas le
     vertical -- il n'a rien vu. Toute rangee ajoutee ici doit refaire ce calcul
     a la main. */
  const f = FIG.make({ w:380, h:322,
    alt:"Four solar-filter frames, one a minute, showing the ridge crossing the Sun on 24 November 2026" });
  const [Y,M,D] = CT_SHOOT.date.split("-").map(Number);
  const [h0,m0,s0] = CT_SHOOT.t0.split(":").map(Number);
  const CW = 176, CH = 122, GX = [8, 196], GY = [34, 178], S = 176;   /* px par degre */
  for(let i = 0; i < CT_SHOOT.n; i++){
    const x0 = GX[i % 2], y0 = GY[i >> 1];
    const jd = OBS.jdFromUTC(Y, M, D, h0 - OBS_SITE.tz, m0 + i*CT_SHOOT.stepMin, s0);
    const B = OBS.bodyAt("sun", jd, OBS_SITE.lat, OBS_SITE.lon, OBS_SITE.h,
                         { refraction:true, lampKM:5000 });
    // atmosphère standard AU POINT DE VUE, la même que obs (presets/obs.js, 2026-09-24)
    B.altApp = B.altTrue + B.refrArcmin * OBS_REFR_F / 60;
    const cx = x0 + CW/2, cy = y0 + CH/2, rad = B.sd * S;
    const ca = Math.cos(B.altApp * Math.PI/180);
    const px = az => cx + ((((az - B.az + 540) % 360) - 180)) * ca * S;
    const py = al => cy - (al - B.altApp) * S;
    f.path(`M${x0} ${y0} H${x0+CW} V${y0+CH} H${x0} Z`, { c:"none", w:0, fill:"#f2f0ea" });
    // le disque aplati par la réfraction, chaque bord à sa hauteur (ephemeris.js, limbAlt, 2026-09-27)
    const lo = OBS.limbAlt(B.altTrue, -B.sd, OBS_REFR_F), up = OBS.limbAlt(B.altTrue, B.sd, OBS_REFR_F);
    f.ellipse(cx, py((lo + up)/2), rad, (up - lo)/2*S, { c:"none", w:0, fill:"#f0a81a" });
    const poly = (arr, colour) => {
      let d = "", open = false, first = null, last = null;
      for(let j = 0; j < arr.length; j++){
        const a = HP.az0 + j*HP.step, X = px(a);
        if(X < x0 - 20 || X > x0 + CW + 20) continue;
        const Yp = py(arr[j]/60);
        d += (open ? "L" : "M") + X.toFixed(1) + " " + Yp.toFixed(1);
        if(!open){ first = X; open = true; }
        last = X;
      }
      if(!open) return;
      d += `L${last.toFixed(1)} ${y0+CH} L${first.toFixed(1)} ${y0+CH} Z`;
      f.path(d, { c:"none", w:0, fill:colour });
    };
    poly(HP.flat, "#1d4ed8");
    poly(HP.globeK, "#14181d");
    /* le rectangle perce : le cercle est parcouru en sens inverse, donc il
       creuse un trou au lieu de se remplir. */
    f.path(`M${x0} ${y0} H${x0+CW} V${y0+CH} H${x0} Z ` +
           `M${(cx+rad).toFixed(1)} ${cy} A${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(cx-rad).toFixed(1)} ${cy} ` +
           `A${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(cx+rad).toFixed(1)} ${cy} Z`,
           { c:"none", w:0, fill:"#f2f0ea" });
    f.circle(cx, cy, rad, { c:"#c98410", w:1 });
    const p = n => String(n).padStart(2,"0");
    f.note(cx, y0 + CH + 13, `${p(h0)}:${p(m0 + i*CT_SHOOT.stepMin)}:${p(s0)}`, { anchor:"middle" });
  }
  f.note(8, 22, "blue: the plane\u2019s ridge \u00b7 black: the globe\u2019s");
  f.notToScale("true angular scale \u00b7 disc 32.4\u2032");
  f.mountIn($("ct-figShoot"));
}


/* ---- LE MÊME PASSAGE, EN VIDÉO (2026-09-24) --------------------------------
   Demande du propriétaire : des animations moins faibles. Les quatre vignettes
   ci-dessus restent (elles s'impriment) ; au-dessus, la même vue filtrée en
   mouvement, caméra FIXE visée sur Le Grand Mourre comme un vrai trépied :
   c'est le Soleil qui descend et la crête qui le mange. 16:52 → 17:02 CET,
   ×20. Mêmes données que les vignettes : OBS.bodyAt (réfraction comprise) et
   le profil LiDAR du point de vue (plan en bleu translucide, globe à k en
   noir). Échelle angulaire VRAIE sur les deux axes (le cos(h) en azimut),
   règle 1. Canvas 2D : pas de WebGL chez le propriétaire. */
const CT_LIVE = { t0: [16, 52, 0], span: 600, speed: 20 };
const ctLive = { raf: null, t: 0, last: 0, playing: true, vis: true, io: null, frame: null };
function ctLiveFrame(){
  const cv = $("ct-shootLive"); if(!cv) return;
  const HP = HORIZONS[OBS_SITE.key]; if(!HP) return;
  const { ctx, W, H } = setupCanvas(cv); if(!W) return;
  const [Y,M,D] = CT_SHOOT.date.split("-").map(Number);
  const [h0,m0,s0] = CT_LIVE.t0;
  const at = sec => { const b = OBS.bodyAt("sun", OBS.jdFromUTC(Y, M, D, h0 - OBS_SITE.tz, m0, s0 + sec), OBS_SITE.lat, OBS_SITE.lon, OBS_SITE.h, { refraction:true, lampKM:5000 });
    b.altApp = b.altTrue + b.refrArcmin * OBS_REFR_F / 60; return b; };   // même atmosphère que obs
  // cadre fixe : centré sur le Soleil au milieu du passage
  if(!ctLive.frame){ const mid = at(CT_LIVE.span/2); ctLive.frame = { az: mid.az, alt: mid.altApp }; }
  const F = ctLive.frame, B = at(ctLive.t);
  const S = Math.min(W / 2.4, H / 1.7);                        // px par degré : ±0,85° en hauteur, le passage en fait ~1,5
  const ca = Math.cos(F.alt * Math.PI/180);
  const px = az => W/2 + ((((az - F.az + 540) % 360) - 180)) * ca * S;
  const py = al => H/2 - (al - F.alt) * S;
  // ciel à travers un filtre dense : sombre
  ctx.fillStyle = "#1c1f24"; ctx.fillRect(0, 0, W, H);
  // le disque, assombri au bord comme sur une vraie photo filtrée
  // le disque aplati par la réfraction, chaque bord à sa hauteur (ephemeris.js, limbAlt, 2026-09-27)
  const lo = OBS.limbAlt(B.altTrue, -B.sd, OBS_REFR_F), up = OBS.limbAlt(B.altTrue, B.sd, OBS_REFR_F);
  const sx = px(B.az), sy = py((lo + up)/2), rad = B.sd * S;
  ctx.save(); ctx.translate(sx, sy); ctx.scale(1, (up - lo)/(2*B.sd));
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
  g.addColorStop(0, "#ffd36b"); g.addColorStop(0.75, "#f0a81a"); g.addColorStop(1, "#c46f0c");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, 7); ctx.fill(); ctx.restore();
  const ridge = (arr) => {
    ctx.beginPath(); let open = false, first = 0, last = 0;
    for(let j = 0; j < arr.length; j++){
      const X = px(HP.az0 + j*HP.step); if(X < -20 || X > W + 20) continue;
      const Yp = py(arr[j]/60);
      open ? ctx.lineTo(X, Yp) : (ctx.moveTo(X, Yp), first = X, open = true); last = X;
    }
    if(!open) return false;
    ctx.lineTo(last, H + 2); ctx.lineTo(first, H + 2); ctx.closePath(); return true;
  };
  if(ridge(HP.flat)){ ctx.fillStyle = "rgba(29,78,216,0.42)"; ctx.fill(); ctx.strokeStyle = "#5b8def"; ctx.lineWidth = 1.2; ctx.stroke(); }
  if(ridge(HP.globeK)){ ctx.fillStyle = "#000"; ctx.fill(); }
  // lectures
  const tt = h0*3600 + m0*60 + s0 + ctLive.t, p2 = n => String(Math.floor(n)).padStart(2, "0");
  ctx.fillStyle = "#e8e3d6"; ctx.font = "600 13px ui-monospace, Menlo, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText(`24 Nov 2026 · ${p2(tt/3600)}:${p2(tt/60%60)}:${p2(tt%60)} CET`, 8, 8);
  ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#9aa3ad";
  ctx.fillText("black: the globe’s ridge · blue: what the plane adds", 8, 26);
  ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillStyle = "#e0a52a";
  ctx.fillText(`true angular scale · disc ${(2*B.sd*60).toFixed(1)}′ · ×${CT_LIVE.speed}`, W - 8, H - 6);
}
function ctLiveStart(){
  const host = $("ct-figShoot"); if(!host) return;
  if(!$("ct-shootLive")){
    const cv = document.createElement("canvas"); cv.id = "ct-shootLive";
    cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "The Sun sinking behind the ridge on 24 November 2026, through a solar filter, fixed camera");
    cv.style.cssText = "display:block;width:100%;max-width:560px;height:230px;margin:0 auto 10px;border-radius:8px;cursor:pointer";
    cv.title = "click: pause / play";
    cv.addEventListener("click", () => { ctLive.playing = !ctLive.playing; ctLive.last = 0; if(ctLive.playing) ctLiveLoop(); });
    keyClickable(cv); // clavier : Entrée/Espace = pause (epic06/UC03)
    // export (epic10/UC02) : le passage rejoué à l'instant t (secondes de la vidéo exportée)
    let saved = null;
    cv.__anim = {
      duration: CT_LIVE.span / CT_LIVE.speed,
      begin(){ saved = { ...ctLive }; if(ctLive.raf){ cancelAnimationFrame(ctLive.raf); ctLive.raf = null; } },
      frameAt(t){ ctLive.t = (t * CT_LIVE.speed) % CT_LIVE.span; ctLiveFrame(); },
      end(){ if(saved) Object.assign(ctLive, saved, { raf: null, last: 0 }); saved = null; ctLiveFrame(); if(ctLive.playing) ctLiveLoop(); },
    };
    host.parentNode.insertBefore(cv, host);
    if(typeof IntersectionObserver === "function"){
      ctLive.io = new IntersectionObserver(es => { ctLive.vis = es.some(e => e.isIntersecting); if(ctLive.vis && !exportBusy()) ctLiveLoop(); });
      ctLive.io.observe(cv);
    }
  }
  ctLiveFrame();
  if(!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) ctLiveLoop();
}
function ctLiveLoop(){
  if(ctLive.raf || typeof requestAnimationFrame !== "function") return;
  const step = ts => {
    ctLive.raf = null;
    if($("tab-ct").hidden || !ctLive.vis || !ctLive.playing){ ctLive.last = 0; return; }
    if(ctLive.last && ts - ctLive.last < 32){ ctLive.raf = requestAnimationFrame(step); return; }
    if(ctLive.last) ctLive.t = (ctLive.t + (ts - ctLive.last)/1000 * CT_LIVE.speed) % CT_LIVE.span;
    ctLive.last = ts;
    ctLiveFrame();
    ctLive.raf = requestAnimationFrame(step);
  };
  ctLive.raf = requestAnimationFrame(step);
}

/* Les deux figures de donnees sont dessinees ICI AUSSI, hors du garde
   « hidden ». Elles dependent du cas choisi, pas de la largeur : drawCt() les
   redessine au changement de menu, mais si elles n'existaient que la, un
   panneau masque -- donc audit-figures.js -- ne les verrait jamais. */
function drawCtSymbols(){
  // (svTabZen/svFigR/svReadR : surv-legacy.js ; hhFigSil/simFigSil : sim et hh)
  ctFigOpen(); ctFig1(); ctFig2(); ctFigPole(); ctFigZero(); ctFig3();
  ctFigBars(); ctFigBoxKey(); ctFigBox(); ctFig4(); ctFigR(); ctFigTrend(); ctFigShoot();
}

function drawCt(){
  if($("tab-ct").hidden) return;
  ctTabRate(); ctTabSep(); ctTabNP(); ctFigBars(); ctKeyResid(); ctFigBox(); ctTabBox(); ctReadBox(); ctFigR(); ctTabR(); ctReadR(); ctFigTrend(); ctReadTrend();
}



/* ---- LE COUDE : OU LES DEUX CRETES SE CROISENT, DANS CHAQUE MODELE ---------
   La ligne de crete est le maximum de deux aretes : la lointaine, a 54 km,
   presque horizontale, et la proche, a 16 km, qui monte a ~20 minutes d'arc par
   degre d'azimut. Le modele plat releve la lointaine de ~15' et laisse la
   proche a peu pres ou elle est -- l'intersection GLISSE donc le long de la
   branche raide, d'a peu pres 15'/20' = 0,75 degre d'azimut. Le coude n'est pas
   au meme endroit dans les deux modeles, en azimut ET en hauteur.
   Les deux branches sont ajustees sur le profil deja embarque, jamais saisies a
   la main : changer de point de vue suffit a tout recalculer. */

export function wire(){
  fillPresetSelect("ct-case", CT_CASES, "", c => `${c.n} · ${c.star}`);
  $("ct-case").addEventListener("change", drawCt);
  drawCtSymbols();   // une fois, comme au chargement du legacy (les figures sans garde)
}
export function draw(){ drawCt(); ctLiveStart(); }
export { ctFigOpen };
export function stop(){ if(ctLive.raf){ cancelAnimationFrame(ctLive.raf); ctLive.raf = null; } ctLive.last = 0; }
