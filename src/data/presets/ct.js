// Données de l'onglet ct (théodolite céleste), portées VERBATIM du legacy
// (CT_PEAKS ~L28185, CT_LATS ~L28193, CT_CASES ~L28727 : toutes les lignes
// de la feuille data_table du projet Celestial Theodolite qui portent les
// sept nombres -- hauteurs, distance, altitudes d'étoile géométriques et
// apparentes aux deux bouts). Rien n'est ajusté ici.
export const CT_PEAKS = [
  { n:"Hound's Tooth",       s:8.804  },
  { n:"Varley SE2, Squamish",s:16.726 },
  { n:"Blodgett Peak",       s:35.910 },
  { n:"Cheyenne Mountain",   s:42.630 },
  { n:"Pike's Peak",         s:50.778 },
  { n:"North Peak",          s:130.700 },
];

export const CT_LATS = [0, 20, 45, 60, 70];
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
  let r = `<tr><th>latitude \u03c6</th><th>star due E or W</th><th>star 45\u00b0 off E\u2013W</th>`
        + `<th>clock worth 1\u2032, due E or W</th></tr>`;
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
  let r = `<tr><th>peak</th><th>s</th><th class="f">plane</th>`
        + `<th class="g">globe, \u03b3 = s/R</th><th class="g">\u03b3(1 \u2212 k)</th>`
        + `<th>worth, in clock</th><th>measured</th></tr>`;
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

/* ---- CANIGOU DANS LE DISQUE, LES DEUX MODELES ------------------------------
   Meme rendu que la vue « filtre solaire » de l'onglet obs : le disque, et le
   relief seulement la ou il y mord. Rien d'autre n'est visible a travers un
   filtre dense, donc rien d'autre n'est dessine.
   LES DEUX SILHOUETTES SONT A L'ECHELLE ANGULAIRE VRAIE, et c'est tout
   l'interet : depuis Allauch, 2 541 m de denivele a 263 km sous-tendent 33,2',
   soit un peu PLUS que le diametre du Soleil. Le modele plat ne cache rien,
   donc il fait passer devant le disque une masse noire plus haute que lui. Le
   globe a k = 0,22 n'en laisse depasser que 335 m, soit 4,4' -- un huitieme du
   diametre. Aucune exageration n'est necessaire ici et il n'y en a pas. */
/* ---- LE PROFIL REEL DU VIERIOU, CUIT DEPUIS LE MEME MNT --------------------
   Balayage de 265,4 a 271,6 degres depuis le Sommet de Vieriou : le Castellaras
   a 17,8 km et la Cime de Barbin a 60 km sont dans ce champ, avec le creux qui
   les separe. Un seul balayage de terrain, deux modeles.
   CE QUE LA SILHOUETTE AJOUTE A LA FICHE. Le tableau compare deux SOMMETS
   NOMMES ; le profil est le MAXIMUM le long de chaque rayon, c'est-a-dire ce
   qu'une photographie montre. Sur un plan le Barbin ressort de 8,6' au-dessus
   de tout le champ ; sur un globe il tombe a -0,5' et se confond avec les
   cretes proches -- ce que montre la photographie du sommet.
   LE BUG QUI RENDAIT LA SILHOUETTE FAUSSE. Le balayage partait a 100 m du
   point de vue : depuis un sommet, ce premier echantillon est le sol sur
   lequel on se tient, son angle domine tous les reliefs lointains, et le
   « profil » obtenu etait la calotte du Vieriou. Diagnostic : a l'azimut 268
   le maximum tombait a 100 m. dem.py ecarte desormais le premier kilometre et
   demi, valeur declaree dans le code. Le milieu du champ a retrouve son
   relief -- creux a 267,8 et 269,9, bosse du Barbin a 268,4.

   TROIS REGLAGES ONT ETE CORRIGES APRES COUP, sur retour du proprietaire :
   champ elargi de 2 a 6,2 degres, en deux fois pour retrouver le cadrage de la photo,
   panneau porte de 212 a 300 px de haut, et exageration verticale ramenee a x4 apres correction du dmin. Le fond sous la courbe du globe est peint en
   sombre : une silhouette se regarde comme une silhouette, pas comme un graphe. */
const SIM_VIE = { az0:264.23, step:0.020, ex:1,
  flat:[16.65,16.74,16.83,16.92,17.0,17.09,16.93,16.65,16.38,16.1,15.82,15.55,15.27,15.0,14.71,14.43,14.15,13.87,13.59,13.64,14.13,14.31,14.35,14.38,14.41,14.45,14.66,15.11,15.55,15.99,16.43,16.87,17.31,17.74,18.17,18.59,19.26,19.95,20.64,21.21,21.62,21.57,21.68,21.83,21.98,22.12,22.26,22.4,22.53,22.66,22.78,22.86,22.66,22.46,22.26,22.06,21.99,22.05,22.11,22.16,22.21,22.25,22.26,21.92,21.58,21.24,20.9,20.6,20.37,20.14,19.9,19.67,19.43,19.87,20.81,21.74,22.66,23.58,24.5,25.42,26.33,27.24,28.14,28.5,28.81,29.13,29.43,29.73,30.02,30.32,30.61,30.89,30.95,30.48,30.01,29.54,29.07,28.6,28.13,27.66,27.19,26.72,26.06,25.29,24.53,23.77,23.0,22.24,21.47,20.71,19.95,19.18,18.27,17.36,16.45,15.54,14.62,13.71,12.8,11.88,10.97,10.05,9.12,8.34,7.66,6.97,6.28,5.58,4.89,4.13,3.32,2.52,1.71,0.89,0.08,-0.74,-1.47,-1.79,-2.1,-2.41,-2.72,-3.03,-2.83,-2.68,-2.51,-2.34,-2.17,-2.01,-1.85,-1.69,-1.54,-1.39,-1.24,-1.09,-0.94,-0.8,-0.66,-0.52,-1.08,-1.78,-2.47,-3.16,-3.85,-4.54,-5.23,-5.91,-6.6,-7.28,-7.96,-7.66,-7.05,-6.44,-5.83,-5.21,-4.59,-3.97,-3.35,-2.73,-2.14,-1.54,-0.95,-0.35,0.26,0.88,1.51,2.14,2.78,3.34,3.89,4.44,4.99,5.56,6.15,6.73,7.32,7.9,8.36,8.83,9.29,9.75,9.95,10.0,10.04,10.09,10.06,9.73,9.39,9.06,8.72,8.38,8.04,7.7,7.36,7.09,6.94,6.8,6.66,6.52,6.45,6.4,6.35,6.29,6.25,6.22,6.19,6.17,6.13,6.0,5.88,5.75,5.63,5.4,5.12,4.83,4.54,4.26,3.96,3.66,3.36,3.06,2.7,2.36,2.13,1.9,1.56,1.11,0.67,0.22,-0.23,-0.73,-1.23,-1.73,-2.23,-2.68,-3.11,-3.53,-3.96,-4.39,-4.88,-5.36,-5.84,-6.32,-6.75,-7.16,-7.28,-7.33,-7.38,-7.43,-7.48,-7.55,-7.62,-7.7,-7.77,-7.75,-7.72,-7.68,-7.64,-7.62,-7.67,-7.73,-7.78,-7.83,-7.85,-7.87,-7.89,-7.91,-7.9,-7.89,-7.73,-7.54,-7.49,-7.53,-7.56,-7.6,-7.51,-7.5,-7.48,-7.46,-7.46,-7.53,-7.6,-7.68,-7.75,-7.96,-8.17,-8.37,-8.58,-8.76,-8.58,-8.4,-8.22],
  globeK:[11.86,11.95,12.04,12.13,12.22,12.3,12.14,11.87,11.59,11.31,11.04,10.76,10.49,10.21,9.93,9.64,9.36,9.08,8.8,8.6,9.08,9.26,9.3,9.33,9.37,9.4,9.52,9.97,10.41,10.85,11.29,11.73,12.17,12.6,13.03,13.45,14.09,14.78,15.47,16.04,16.43,16.38,16.52,16.67,16.81,16.96,17.1,17.23,17.36,17.49,17.62,17.7,17.5,17.3,17.1,16.9,16.85,16.91,16.97,17.02,17.07,17.11,17.12,16.78,16.44,16.1,15.76,15.49,15.25,15.02,14.79,14.55,14.31,14.07,14.33,15.26,16.18,17.11,18.03,18.94,19.85,20.76,21.67,22.02,22.33,22.65,22.96,23.25,23.55,23.84,24.13,24.42,24.48,24.01,23.54,23.07,22.59,22.12,21.65,21.18,20.71,20.24,19.58,18.82,18.05,17.29,16.52,15.76,15.0,14.23,13.47,12.7,11.79,10.88,9.97,9.06,8.14,7.23,6.32,5.41,4.49,3.57,2.66,1.94,1.25,0.56,-0.13,-0.82,-1.52,-2.28,-3.08,-3.89,-4.7,-5.46,-5.58,-5.68,-5.86,-6.17,-6.49,-6.8,-7.11,-7.21,-6.99,-6.85,-6.68,-6.52,-6.35,-6.19,-6.03,-5.87,-5.72,-5.56,-5.41,-5.27,-5.12,-4.98,-4.83,-4.69,-5.26,-5.96,-6.65,-7.34,-8.03,-8.72,-9.41,-10.09,-10.78,-11.46,-12.14,-12.82,-13.5,-14.17,-14.85,-15.62,-16.4,-17.19,-17.41,-16.79,-16.22,-15.63,-15.03,-14.43,-13.82,-13.2,-12.58,-11.94,-11.3,-10.74,-10.19,-9.64,-9.09,-8.53,-7.94,-7.35,-6.76,-6.18,-5.72,-5.26,-4.8,-4.33,-4.13,-4.09,-4.04,-4.0,-4.03,-4.36,-4.69,-5.02,-5.36,-5.7,-6.04,-6.38,-6.72,-7.0,-7.14,-7.28,-7.43,-7.57,-7.63,-7.68,-7.74,-7.78,-7.83,-7.86,-7.89,-7.92,-7.95,-8.08,-8.2,-8.33,-8.46,-8.68,-8.97,-9.25,-9.54,-9.83,-10.13,-10.43,-10.72,-11.02,-11.38,-11.7,-11.93,-12.16,-12.5,-12.95,-13.39,-13.84,-14.29,-14.79,-15.29,-15.79,-16.29,-16.74,-17.17,-17.59,-18.02,-18.45,-18.94,-19.42,-19.9,-20.16,-19.91,-19.65,-19.4,-19.3,-19.2,-19.1,-19.0,-18.9,-18.89,-19.07,-19.25,-19.44,-19.62,-19.78,-19.81,-19.87,-19.93,-19.99,-20.05,-20.11,-20.06,-20.02,-19.97,-19.92,-19.87,-19.85,-19.91,-19.96,-20.02,-20.08,-20.14,-20.19,-19.97,-19.63,-19.37,-19.11,-18.85,-18.57,-18.29,-18.0,-17.71,-17.43,-17.41,-17.53,-17.08,-16.62,-16.17,-15.7,-15.15] };
function simFigSil(){
  const C = FIG.C, P = SIM_VIE;
  /* ECHELLE VRAIE SUR LES DEUX AXES, ex = 1, et c'est le but : 6,2 degres
     d'azimut font 372 minutes d'arc, l'amplitude du relief en fait 51. Le
     panorama est donc une bande basse -- ce que montre une photographie prise
     au telephone depuis un sommet, et ce qu'aucune exageration ne peut rendre
     sans mentir. Le cadre est centre sur le Castellaras, a 267,33.
     LA HAUTEUR DU PANNEAU SE DEDUIT DE L'ECHELLE, elle ne se choisit pas : a
     0,925 px par minute, 51 minutes font 47 px de relief. Toute retouche de la
     largeur doit donc recalculer MM et la hauteur ensemble. */
  const MM = 344 / (P.step * (P.flat.length - 1) * 60);      /* px par minute */
  const X0 = 20, X1 = X0 + 344;
  const vTop = 34, vBot = -24, TOP = 44;
  const BASE = TOP + (vTop - vBot) * MM;
  const f = FIG.make({ w:380, h:Math.round(BASE) + 62,
    alt:"The real skyline from Viériou in both models, at true angular scale on both axes" });
  const px = i => X0 + i / (P.flat.length - 1) * (X1 - X0);
  const py = v => TOP + (vTop - v) * MM;
  const line = arr => { let d = "";
    for(let i = 0; i < arr.length; i++) d += (i ? "L" : "M") + px(i).toFixed(1) + " " + py(arr[i]).toFixed(1);
    return d; };
  f.path(line(P.globeK) + `L${X1} ${BASE} L${X0} ${BASE} Z`, { c:"none", w:0, fill:"#2b3138" });
  f.path(line(P.flat), { c:C.flat, w:1.6, dash:"5 4" });
  f.path(line(P.globeK), { c:"#e9edf2", w:1.2 });
  f.dash(X0, py(0), X1, py(0), { c:C.faint });
  f.note(X1, py(0) - 5, "eye level", { anchor:"end" });
  const mark = (az, txt, dy) => { const i = Math.round((az - P.az0) / P.step);
    const x = px(i), tx = Math.max(X0 + txt.length * 3.1, Math.min(X1 - txt.length * 3.1, x));
    f.line(x, TOP, x, BASE + dy - 10, { c:"#c9ced6", w:1, dash:"3 3" });
    f.note(tx, BASE + dy, txt, { anchor:"middle" }); };
  mark(265.46, "Ubac 22 km", 15);
  mark(266.04, "Bauroux 23 km", 29);
  mark(267.33, "Castellaras 18 km", 15);
  mark(268.19, "Barbin 60 km", 29);
  f.note(X0, 26, "dashed: the same ridge on a plane");
  f.note(X0, 38, "filled: what a globe leaves, k = 0.13");
  f.trueScale("both axes");
  f.mountIn($("sim-figSil"));
}

/* ---- UNE SEULE VUE A LA FOIS -----------------------------------------------
   L'onglet montrait deux vues du meme regard : le panneau perspective, qui
   dessine les cibles en triangles idealises, et la silhouette MNT tout en bas.
   Deux panneaux pour une seule question. On n'en affiche donc qu'un : la
   silhouette quand l'exemple charge possede un profil cuit, les triangles
   sinon.
   AUJOURD'HUI UN SEUL EXEMPLE EN A UN, le Vieriou. Les autres gardent les
   triangles, et c'est pour cela que le titre du bloc change AVEC la vue : un
   lecteur qui passe d'un exemple a l'autre doit voir que la page a change
   d'instrument, pas d'avis. Ajouter un profil = ajouter une cle a SIM_PROFILES.
   Le panneau perspective n'est pas modifie : drawPerspective est partagee avec
   l'onglet des hauteurs cachees et on ne la touche pas pour un affichage. */
const SIM_PROFILES = { vieriou:1 };
function simSwapView(){
  const sel = $("presetSel"), fig = $("sim-figSil");
  if(!fig) return;
  const has = !!(sel && SIM_PROFILES[sel.value]);
  const persp = $("perspCanvas") && $("perspCanvas").closest(".panel");
  const wrap = fig.closest(".fig");
  if(persp) persp.hidden = has;
  if(wrap) wrap.hidden = !has;
  const h2 = wrap && wrap.previousElementSibling;
  if(has) simFigSil();
}

/* ---- LE PROFIL REEL DU CANIGOU, CUIT DEPUIS UN MNT ------------------------
   Plus de triangle d'illustration : ces deux tableaux sont la ligne de crete
   VRAIE vue d'Allauch, obtenue en balayant l'azimut sur un modele numerique de
   terrain France a 3 secondes d'arc (~90 m) et en gardant, pour chaque rayon,
   l'angle d'elevation maximal rencontre jusqu'a 285 km. Un seul balayage de
   terrain, trois modeles -- la difference entre les courbes est donc de la
   geometrie et jamais de l'echantillonnage, comme pour HORIZONS.
   RESERVE HONNETE : un MNT a 90 m arrondit les sommets pointus. Il lit le
   Canigou a 2 686 m au lieu de 2 785, ce qui coute environ 1,3' sur la courbe
   du globe. La conclusion ne bouge pas ; le chiffre exact, si.
   ECHELLE ANGULAIRE VRAIE SUR LES DEUX AXES : 0,04 degre d'azimut par point,
   soit 2,4 arcmin, et la meme echelle en hauteur. Rien n'est etire. */
const HH_CAN = { az0:249.40, step:0.040,
  flat:[25.1,25.4,25.77,25.59,25.59,26.68,27.08,26.79,26.31,27.08,26.85,27.25,27.22,27.92,28.57,29.41,30.4,30.88,31.45,31.15,31.41,30.94,31.19,30.41,29.88,30.35,30.49,29.69,29.93,29.87,29.37,29.71,30.21,31.26,31.41,31.07,30.85,30.11,29.77,29.43,28.85,28.0,27.63,27.0,27.97,28.6,28.1,27.07,25.82,27.09,27.92,27.13,26.28,25.27,24.08,23.69,22.84,21.85,20.97,20.52,20.57,19.86,18.6,18.01,16.74,15.86,15.02,13.71,13.57,13.19,12.36],
  globeK:[-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.34,-30.61,-30.44,-30.61,-30.36,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.41,-30.21,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61,-30.61] };
function hhFigSil(){
  const C = FIG.C, P = HH_CAN;
  const f = FIG.make({ w:380, h:250,
    alt:"The real Canigou skyline from Allauch in both models, on the same true angular scale, with the solar disc" });
  const SD = 32.5, MM = 2.34;                       /* px par minute d'arc */
  const X0 = 20, TOP = 40, BOT = 218;
  const vTop = 40, vBot = -46;                      /* minutes au-dessus/dessous du niveau de l'oeil */
  const px = i => X0 + i * P.step * 60 * MM;
  const py = v => TOP + (vTop - v) / (vTop - vBot) * (BOT - TOP);
  const path = arr => {
    let d = "";
    for(let i = 0; i < arr.length; i++) d += (i ? "L" : "M") + px(i).toFixed(1) + " " + py(arr[i]).toFixed(1);
    return d + `L${px(arr.length-1).toFixed(1)} ${BOT} L${X0} ${BOT} Z`;
  };
  /* le disque, pose la ou la photographie le montre : sur le sommet visible */
  let im = 0; for(let i = 1; i < P.globeK.length; i++) if(P.globeK[i] > P.globeK[im]) im = i;
  f.circle(px(im), py(P.globeK[im]), SD/2 * MM, { c:"none", w:0, fill:"#f0a81a" });
  f.circle(px(im), py(P.globeK[im]), SD/2 * MM, { c:"#c98410", w:1 });
  f.path(path(P.globeK), { c:"none", w:0, fill:"#14181d" });     /* ce qui est vu */
  f.path(path(P.flat), { c:"#1d4ed8", w:2 });                    /* ce que le plan exige */
  f.dash(X0, py(0), 360, py(0), { c:C.faint });
  f.note(362, py(0) - 5, "eye level", { anchor:"end" });
  f.note(X0, 24, "blue: the same ridge, no curvature");
  f.note(X0, 36, "\u2014 31\u2032 up, two solar diameters higher");
  f.note(X0, 240, "black: what the globe leaves above the sea, k = 0.13");
  f.trueScale("both axes \u00b7 disc 32.5\u2032");
  f.mountIn($("hh-figSil"));
}

/* ---- LE CAS CONCRET D'ANGLES ZENITHAUX RECIPROQUES SIMULTANES --------------
   Sept lignes levees en 1977 autour du McDonald Observatory, 32 a 93 km, les
   deux bouts vises AU MEME INSTANT, ligne de visee a plus de 30 m du sol donc
   hors de la couche ou la refraction s'affole. Les angles publies sont les
   entrees ; tout le reste est recalcule ici et concorde a la troisieme
   decimale avec l'evaluation independante de Walter Bislin.

   POURQUOI CE CAS ET PAS UN AUTRE. C'est le seul du dossier qui reunisse les
   trois conditions : simultaneite aux deux bouts, longueur suffisante pour que
   le signal depasse le bruit, et hauteur suffisante pour sortir du sol. Les
   mesures courtes et basses du meme recueil sont explicitement rangees par
   Bislin sous « observations problematiques » -- et cette page les laisse la. */
const SV_ZEN = [
  { z1:"91 08 09", z2:"89 07 44", d:32139, h:2273 },
  { z1:"91 03 44", z2:"89 15 34", d:39476, h:2188 },
  { z1:"90 50 01", z2:"89 35 13", d:52518, h:2269 },
  { z1:"91 09 00", z2:"89 22 35", d:66128, h:2043 },
  { z1:"90 49 49", z2:"89 45 41", d:74362, h:2209 },
  { z1:"90 40 36", z2:"89 56 32", d:76957, h:2308 },
  { z1:"90 32 21", z2:"90 12 12", d:92882, h:2421 },
];

export const CT_CASES = [
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
