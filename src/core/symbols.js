// Schémas symboliques et figures d'ouverture de TOUS les onglets, portés
// VERBATIM du legacy (flat-or-globe-2.20.0.html L30002-32092) : les
// fonctions drawXxxSymbols()/drawXxxPair() y étaient appelées une fois au
// chargement, sur la page entière. Ici chaque onglet appelle
// drawSymbols(key) à la fin de son mount() ; chaque fonction cherche ses
// hôtes (.figsym / .figkey .sw[data-sw]) par id dans le document et ne
// dessine rien si l'hôte n'existe pas -- appeler une fonction pour un
// hôte absent est donc sans effet. Les libellés data-tex sont convertis en
// MathML par l'observateur de src/core/tex-mathml.js. Ne pas retoucher
// les coordonnées à la main : « edit the generator, never the
// coordinates » (en-tête FIG du legacy).
import { FIG } from "./fig.js";
import { AZIM_COL } from "../tabs/azim/logic.js";
import SIM_VIE from "../data/dem/vieriou.json" with { type: "json" };
import HH_CAN from "../data/dem/canigou.json" with { type: "json" };

export function drawKeySwatches(){
  var C = FIG.C, col = AZIM_COL;
  var TERM = "#8a7f63", RAY = "#e0a52a", TEAL = "#0f766e", AMBER = "#b45309", WARN = "#b91c1c";
  var kinds = {
    ray:  function(f){ f.line(1,11,33,4,{c:RAY,w:1.4}); f.line(1,15,33,8,{c:RAY,w:1.4}); },
    arc:  function(f){ f.path("M2 13 Q17 1 32 9",{c:col[0],w:2}); },
    look: function(f){ f.line(2,12,32,4,{c:col[1]||col[0],w:1.6,dash:"3 3"}); },
    term: function(f){ f.path("M3 14 Q17 -2 31 14",{c:TERM,w:1.5,dash:"5 4"}); },
    hollow:function(f){ f.circle(9,8,4,{c:col[0],w:1.6,fill:"#fdfdfc"});
                        f.dot(25,8,{r:4.5,c:col[0]}); },
    past: function(f){ f.line(1,8,15,8,{c:col[0],w:1.8});
                       f.line(15,8,33,8,{c:col[0],w:1.2,dash:"2 3"}); },
    tri:  function(f){ f.path("M4 14 L18 2 L31 12 Z",
                              {c:"rgba(180,83,9,.6)",w:1.2,dash:"4 3",fill:"rgba(180,83,9,.13)"}); },
    /* twi: the same teal, the same amber, the same dash pattern the canvas uses */
    twterm:function(f){ f.path("M2 13 Q17 1 32 9",{c:TEAL,w:1.8,dash:"5 4"}); },
    twtick:function(f){ f.path("M2 11 Q17 -1 32 7",{c:TEAL,w:1.5,dash:"5 4"});
                        f.line(9,7.2,10.5,12,{c:"rgba(15,118,110,.75)",w:1.2});
                        f.line(17,4.4,18,9.2,{c:"rgba(15,118,110,.75)",w:1.2});
                        f.line(25,4.4,26.5,9.2,{c:"rgba(15,118,110,.75)",w:1.2}); },
    twhollow:function(f){ f.circle(17,8,5,{c:AMBER,w:2,fill:"#fdfdfc"}); },
    twsolid:function(f){ f.dot(17,8,{r:5.5,c:AMBER}); },
    twsolidc:function(f){ f.path("M2 14 Q12 6 32 3",{c:"#0369a1",w:1.7});
                          f.path("M2 15 Q14 10 32 7",{c:"#6d28d9",w:1.7});
                          f.path("M2 16 Q16 13 32 11",{c:TEAL,w:1.7}); },
    twvert:  function(f){ f.line(11,1,11,15,{c:"#6d28d9",w:1.5,dash:"4 3"});
                          f.line(23,1,23,15,{c:"#0369a1",w:1.5,dash:"4 3"}); },
    twequi:  function(f){ f.path("M2 13 Q17 9 32 5",{c:"#1d4ed8",w:1.7,dash:"5 4"}); },
    twring:  function(f){ f.circle(17,8,5,{c:"#0369a1",w:2,fill:"#fdfdfc"}); },
    /* hh */
    hhray:  function(f){ f.path("M1 13 Q16 11 33 4",{c:TEAL,w:2}); },
    hhslab: function(f){ f.line(17,2,17,14,{c:WARN,w:5}); },
    hhout:  function(f){ f.line(1,5,33,5,{c:"#151a21",w:1.8});
                         f.line(1,12,33,12,{c:"#151a21",w:1.6,dash:"5 3"}); },
    hhband: function(f){ f.path("M1 5 H33 V14 H1 Z",{c:"rgba(15,118,110,.35)",w:1,
                                fill:"rgba(15,118,110,.16)"}); },
    /* sun */
    sundash:function(f){ f.line(3,14,13,2,{c:"#151a21",w:2});
                         f.line(13,2,21,-3,{c:"#151a21",w:1.2,dash:"4 3"});
                         f.line(19,14,29,2,{c:"#151a21",w:2}); },
    sunviolet:function(f){ f.line(9,15,25,1,{c:"#6d28d9",w:2.4}); },
    sunterm:function(f){ f.path("M3 14 Q17 -2 31 14",{c:"#9aa1ab",w:1.5,dash:"5 4"}); },
    sunface:function(f){ f.circle(17,9,7,{c:"#5b6470",w:1.3});
                         f.line(17,9,17,2,{c:"#5b6470",w:1});
                         f.line(17,9,23.5,6,{c:"#5b6470",w:1});
                         f.line(17,9,10.5,6,{c:"#5b6470",w:1}); },
    /* obs, the Gleason disc */
    obsteal:function(f){ f.line(2,12,32,4,{c:TEAL,w:2}); },
    obsamber:function(f){ f.line(2,12,32,4,{c:AMBER,w:2,dash:"5 3"}); },
    obsgc:  function(f){ f.path("M2 13 Q17 3 32 7",{c:"rgba(21,26,33,.45)",w:1.2,dash:"2 3"}); },
    /* seis */
    seisteal:function(f){ f.path("M3 14 Q13 2 31 6",{c:TEAL,w:2}); },
    seisorange:function(f){ f.circle(17,8,6.5,{c:AMBER,w:1.6}); },
    /* seis, the P shadow zone (2026-10-25): the cross-section's rays and the shadow map's marks, same colours */
    shP:     function(f){ f.path("M2 3 Q17 18 32 3",{c:TEAL,w:1.8}); },
    shPdif:  function(f){ f.path("M2 3 Q8 12 17 12 Q26 12 32 3",{c:"#5b6470",w:1.6,dash:"3 2"}); },
    shPKP:   function(f){ f.path("M2 3 Q17 22 32 3",{c:"#6d28d9",w:1.8}); },
    shS:     function(f){ f.line(3,3,17,13,{c:AMBER,w:1.8,dash:"5 3"}); f.line(15,15,19,11,{c:AMBER,w:2}); },
    shband:  function(f){ f.path("M2 4 H32 V13 H2 Z",{c:"none",w:0,fill:"rgba(180,83,9,.22)"}); },
    shzoneP: function(f){ f.path("M2 3 H32 V13 H2 Z",{c:"#0f766e",w:0.8,fill:"rgb(196,226,220)"}); },
    shzoneS: function(f){ f.path("M2 3 H32 V13 H2 Z",{c:"#b45309",w:0.8,fill:"rgb(240,205,170)"}); },
    shzoneK: function(f){ f.path("M2 3 H32 V13 H2 Z",{c:"#6d28d9",w:0.8,fill:"rgb(214,200,240)"}); },
    shdirect:function(f){ f.dot(17,8,{r:3.2,c:TEAL}); },
    shdif:   function(f){ f.dot(17,8,{r:3.6,c:"#5b6470"}); },
    shcore:  function(f){ f.dot(17,8,{r:3.6,c:"#6d28d9"}); },
    shglobe: function(f){ f.path("M2 12 Q17 2 32 12",{c:TEAL,w:2.2}); },
    shflat:  function(f){ f.path("M2 12 Q17 2 32 12",{c:AMBER,w:2.2,dash:"6 4"}); },
    shcommon:function(f){ f.path("M2 12 Q17 2 32 12",{c:AMBER,w:1.6,dash:"2 3"}); },
    shbad:   function(f){ f.line(12,3,22,13,{c:AMBER,w:1.6}); f.line(22,3,12,13,{c:AMBER,w:1.6}); },
    shepi:   function(f){ f.path("M17 2 L23 13 L11 13 Z",{c:"none",w:0,fill:"#151a21"}); },
    /* seis, telling the waves apart (2026-10-30): the motion classes of the bands (wavesfig.js WAVE_COL) */
    wvp:     function(f){ f.path("M2 3 H32 V13 H2 Z",{c:"none",w:0,fill:"#1d4ed8"}); },
    wvt:     function(f){ f.path("M2 3 H32 V13 H2 Z",{c:"none",w:0,fill:"#7c3aed"}); },
    wvr:     function(f){ f.path("M2 3 H32 V13 H2 Z",{c:"none",w:0,fill:"#be185d"}); },
    wvm:     function(f){ f.path("M2 3 H32 V13 H2 Z",{c:"#9aa1ab",w:0.6,fill:"#d6dae0"}); },
    seisdotink:function(f){ f.dot(17,8,{r:4,c:"#151a21"}); },
    seisdotflat:function(f){ f.dot(17,8,{r:4,c:"#b45309"}); },
    seisfitink:function(f){ f.line(2,14,32,2,{c:"#151a21",w:2.4}); },
    /* seis regression: a straight dashed speed line (t = km/v, matching
       seisRegFig's own C.globe blue exactly -- NOT seisteal above, the
       wavefront animation's curved-front icon) and a thin grey connector
       between one real arrival's two distance positions. */
    seisreglineglobe:function(f){ f.line(2,13,32,3,{c:"#1d4ed8",w:2,dash:"5 3"}); },
    seisconn:function(f){ f.line(4,8,30,8,{c:"rgba(21,26,33,.35)",w:1.4}); },
    /* seis lateness-by-colatitude: solid lines (NOT the regression chart's
       dashed speed line -- this figure has no theoretical line, only two
       measured series), each with one dot, matching seisLatenessFig exactly. */
    seislatglobe:function(f){ f.line(2,10,32,6,{c:"#1d4ed8",w:2}); f.dot(17,8,{r:2.6,c:"#1d4ed8"}); },
    seislatflat:function(f){ f.line(2,13,32,2,{c:"#b45309",w:2}); f.dot(17,7,{r:2.6,c:"#b45309"}); },
    /* hh, les deux panneaux et le rayon refracte */
    hhA:    function(f){ f.line(2,12,32,12,{c:"#151a21",w:1.8});
                         f.line(3,10,31,3,{c:TEAL,w:1.5}); },
    hhB:    function(f){ f.path("M2 14 Q17 8 32 14",{c:"#151a21",w:1.8});
                         f.line(4,11,30,3,{c:TEAL,w:1.5}); },
    hhrefr: function(f){ f.path("M2 14 Q17 9 32 14",{c:"#151a21",w:1.4});
                         f.path("M4 11 Q18 4 30 6",{c:"#6d28d9",w:1.6,dash:"4 3"}); },
    /* fou : deux reperes, l'un fixe l'autre tournant */
    foufloor:function(f){ f.path("M3 2 H31 V15 H3 Z",{c:"#9aa1ab",w:1.3});
                          f.line(8,13,26,4,{c:"#151a21",w:1.8}); },
    fouswing:function(f){ f.path("M6 1 L31 6 L28 16 L3 11 Z",{c:"#9aa1ab",w:1.3});
                          f.line(8,13,26,4,{c:"#151a21",w:1.8}); },
    /* twi, seconde serie */
    twxs:    function(f){ f.path("M2 15 Q17 5 32 15",{c:"#151a21",w:1.8}); },
    twgraze: function(f){ f.path("M2 15 Q17 6 32 15",{c:"#151a21",w:1.3});
                          f.line(2,6,32,6,{c:"#e0a52a",w:1.6});
                          f.line(17,6,17,9,{c:"#5b6470",w:1,dash:"2 2"}); },
    twshadow:function(f){ f.path("M2 7 H32 V15 H2 Z",{c:"none",w:0,
                                 fill:"rgba(21,26,33,.18)"});
                          f.line(2,7,32,7,{c:"#151a21",w:1.3}); },
    twaxis:  function(f){ f.line(4,15,4,1,{c:"#9aa1ab",w:1.3});
                          f.line(4,4,30,4,{c:"#0369a1",w:1.4});
                          f.line(4,9,30,9,{c:"#6d28d9",w:1.4});
                          f.line(4,13,30,13,{c:TEAL,w:1.4}); },
    twamber: function(f){ f.path("M2 3 Q10 6 32 9",{c:AMBER,w:1.7}); },
    twnight: function(f){ f.path("M2 10 H32 V15 H2 Z",{c:"rgba(15,118,110,.5)",w:1,
                                 fill:"rgba(15,118,110,.22)"}); },
    /* mag */
    magneedle:function(f){ f.line(4,12,17,8,{c:"#151a21",w:2.4});
                           f.line(17,8,30,4,{c:WARN,w:2.4}); },
    magviolet:function(f){ f.line(4,12,30,4,{c:"#6d28d9",w:2.4}); },
    magequator:function(f){ f.line(2,8,32,8,{c:WARN,w:1.5,dash:"5 3"}); },
    magaxis: function(f){ f.line(17,1,17,15,{c:"#9aa1ab",w:1.5,dash:"5 3"}); },
    /* gps */
    gpsshell:function(f){ f.circle(11,8,6.5,{c:AMBER,w:1.4});
                          f.circle(23,8,6.5,{c:"#1d4ed8",w:1.4}); },
    gpsearth:function(f){ f.dot(17,8,{r:5.5,c:"#5b6470"}); },
    gpscircle:function(f){ f.ellipse(17,8,4,7,{c:"#6d28d9",w:1.6,dash:null}); },
    gpsyou:  function(f){ f.circle(17,9,6,{c:"#5b6470",w:1.3});
                          f.dot(17,3,{r:3.5,c:"#6d28d9"}); }
  };
  var hosts = document.querySelectorAll(".figkey .sw[data-sw]");
  for(var i=0;i<hosts.length;i++){
    var k = hosts[i].getAttribute("data-sw");
    if(!kinds[k]) continue;
    var f = FIG.make({ w:34, h:16 });
    kinds[k](f);
    f.trueScale();                       // stamp, then remove: a 34x16 swatch has
    f.svg.removeChild(f.svg.lastChild);  // no scale to declare and no room to say so
    hosts[i].textContent = "";
    hosts[i].appendChild(f.svg);
  }
}

/* ----------------------------------------------------------------------------
   Symbol schematics for sim and hh. Same rule as azim: what each letter of the
   formula points at, and nothing else. No case, no numbers, no verdict.
   -------------------------------------------------------------------------- */
export function drawSimHhSymbols(){
  var C = FIG.C, f;

  /* --- sim 1 : H = b / (cot a_far - cot a_near) --------------------------- */
  f = FIG.make({ w:380, h:150, alt:"Two elevation angles from one baseline give the far summit's height" });
  var gy = 116, O = 30, N = 150, T = 320;
  f.ground(gy, 12, 368);
  f.dot(O, gy, { r:4, c:C.ink });  f.txt(O, gy + 17, "O", { anchor:"middle", c:C.soft });
  f.dot(N, gy, { r:4, c:C.ink });  f.txt(N, gy + 17, "N", { anchor:"middle", c:C.soft });
  f.line(N, gy, N, 74, { c:C.ink, w:2 });                       // the near summit
  f.line(T, gy, T, 30, { c:C.ink, w:2 });                       // the far summit
  f.line(O, gy, N, 74, { c:C.soft, w:1.4 });
  f.line(O, gy, T, 30, { c:C.globe, w:1.6 });
  f.angleAt(O, gy, 62, [368, gy], [N, 74], { label:"\u03b1n", tex:"\\alpha_{\\text{near}}", c:C.soft, pad:11 });
  f.angleAt(O, gy, 96, [368, gy], [T, 30],  { label:"\u03b1f", tex:"\\alpha_{\\text{far}}",  c:C.globe, pad:12 });
  f.seg(O, gy + 24, N, gy + 24, { label:"b", tex:"b", c:C.soft, side:-12 });
  f.seg(T + 16, gy, T + 16, 30, { label:"H", tex:"H", c:C.globe, side:-13 });
  f.trueScale();
  f.mountIn(document.getElementById("simfig1"));

  /* --- sim 2 : z_A + z_B = 180 deg (+ d/R) -------------------------------- */
  f = FIG.make({ w:380, h:186, alt:"Reciprocal zenith angles: the two verticals and the line joining the stations" });
  var cx = 190, cy = 320, R = 210;                              // a very shallow arc
  f.path("M20 130 A" + R + " " + R + " 0 0 1 360 130", { c:C.ink, w:1.8 });
  var A = [96, 141], B = [284, 141];
  f.dot(A[0], A[1], { r:4.5, c:C.ink }); f.txt(A[0] - 8, A[1] + 4, "A", { c:C.soft, anchor:"end" });
  f.dot(B[0], B[1], { r:4.5, c:C.ink }); f.txt(B[0] + 8, B[1] + 4, "B", { c:C.soft });
  f.line(A[0], A[1], cx, cy, { c:C.faint, w:1.1, dash:"5 4" });  // A's vertical, toward the centre
  f.line(B[0], B[1], cx, cy, { c:C.faint, w:1.1, dash:"5 4" });
  var Au = [A[0] + (A[0] - cx) * 0.34, A[1] + (A[1] - cy) * 0.34];
  var Bu = [B[0] + (B[0] - cx) * 0.34, B[1] + (B[1] - cy) * 0.34];
  f.line(A[0], A[1], Au[0], Au[1], { c:C.ink, w:2 });            // the local vertical, up
  f.line(B[0], B[1], Bu[0], Bu[1], { c:C.ink, w:2 });
  f.line(A[0], A[1], B[0], B[1], { c:C.globe, w:1.7 });          // the transversal
  f.angleAt(A[0], A[1], 34, Au, B, { label:"zA", tex:"z_A", c:C.globe, pad:12 });
  f.angleAt(B[0], B[1], 34, A, Bu, { label:"zB", tex:"z_B", c:C.globe, pad:12 });
  f.seg(A[0], A[1] + 26, B[0], B[1] + 26, { label:"d", tex:"d", c:C.soft, side:-12 });
  f.notToScale("curvature shown with a small planet");
  f.mountIn(document.getElementById("simfig2"));

  /* --- sim 3 : beta = elev(top) - elev(base) ------------------------------ */
  f = FIG.make({ w:380, h:160, alt:"Angular size: the angle between the sightline to the base and to the summit" });
  gy = 120; var E = 46, X = 300;
  f.ground(gy, 12, 368);
  f.vertical(E, gy, 30, { c:C.ink, w:2.2 });
  f.dot(E, gy - 34, { r:4.5, c:C.ink });
  f.txt(E - 8, gy - 30, "eye", { sans:true, c:C.ink, anchor:"end" });
  f.seg(E - 22, gy, E - 22, gy - 34, { label:"e", tex:"e", c:C.soft, side:10 });
  f.line(X, gy, X, 34, { c:C.ink, w:2.4 });
  f.txt(X + 10, gy - 2, "base", { sans:true, c:C.soft });
  f.txt(X + 10, 38, "top", { sans:true, c:C.soft });
  f.seg(X + 44, 34, X + 44, gy, { label:"h", tex:"h", c:C.soft, side:-13 });
  f.line(E, gy - 34, X, gy, { c:C.soft, w:1.4 });
  f.line(E, gy - 34, X, 34, { c:C.globe, w:1.6 });
  f.angleAt(E, gy - 34, 74, [X, gy], [X, 34], { label:"\u03b2", tex:"\\beta", c:C.globe, pad:13 });
  f.seg(E, gy + 20, X, gy + 20, { label:"d", tex:"d", c:C.soft, side:-12 });
  f.trueScale();
  f.mountIn(document.getElementById("simfig3"));

  /* Le schema de symboles de hh a ete SUPPRIME en v97, et il faut dire
     pourquoi. Il etait faux : le pied de l'observateur, le point de tangence
     et le pied de la cible etaient poses a des y ecrits a la main, donc a
     cote du cercle, et le "rayon rasant" n'etait tangent a rien. C'est le
     bug de la v85a une seconde fois -- des coordonnees tapees au lieu d'etre
     calculees -- et cette fois dans une figure ou toute la geometrie EST le
     propos. Il etait de surcroit redondant : la page possede deja un
     diagramme correct de cette formule, dessine a la main, qui distingue les
     trois longueurs. Il a ete remonte en tete d'onglet a la place.
     LECON : ne pas redessiner une figure qui existe deja plus bas. Chercher
     d'abord. */
}

/* ----------------------------------------------------------------------------
   sim's DEM silhouette (legacy simFigSil(), L28478), rattrapage UC11 : la
   ligne de crête réelle depuis le Viériou, balayée sur le MNT LiDAR HD de l'IGN (research/lidar_horizon.py, 2026-09-24 ; MNT 3″ avant) plutôt
   que dessinée, échelle angulaire VRAIE sur les deux axes (règle 1). Un
   seul terrain read, deux modèles (le remplissage sombre = ce qu'un globe
   laisse voir à k = 0.13, le pointillé = le même relief sans courbure) --
   src/tabs/elev/elev-legacy.js l'appelle au montage et à chaque fois que le
   preset chargé possède un profil cuit (SIM_PROFILES).
   -------------------------------------------------------------------------- */
export function drawSimFigSil() {
  var C = FIG.C, P = SIM_VIE;
  var MM = 344 / (P.step * (P.flat.length - 1) * 60);
  var X0 = 20, X1 = X0 + 344;
  var vTop = 34, vBot = -24, TOP = 44;
  var BASE = TOP + (vTop - vBot) * MM;
  var f = FIG.make({ w: 380, h: Math.round(BASE) + 62,
    alt: "The real skyline from Viériou in both models, at true angular scale on both axes" });
  var px = function (i) { return X0 + (i / (P.flat.length - 1)) * (X1 - X0); };
  var py = function (v) { return TOP + (vTop - v) * MM; };
  var line = function (arr) {
    var d = "";
    for (var i = 0; i < arr.length; i++) d += (i ? "L" : "M") + px(i).toFixed(1) + " " + py(arr[i]).toFixed(1);
    return d;
  };
  f.path(line(P.globeK) + "L" + X1 + " " + BASE + " L" + X0 + " " + BASE + " Z", { c: "none", w: 0, fill: "#2b3138" });
  f.path(line(P.flat), { c: C.flat, w: 1.6, dash: "5 4" });
  f.path(line(P.globeK), { c: "#e9edf2", w: 1.2 });
  f.dash(X0, py(0), X1, py(0), { c: C.faint });
  f.note(X1, py(0) - 5, "eye level", { anchor: "end" });
  var mark = function (az, txt, dy) {
    var i = Math.round((az - P.az0) / P.step);
    var x = px(i), tx = Math.max(X0 + txt.length * 3.1, Math.min(X1 - txt.length * 3.1, x));
    f.line(x, TOP, x, BASE + dy - 10, { c: "#c9ced6", w: 1, dash: "3 3" });
    f.note(tx, BASE + dy, txt, { anchor: "middle" });
  };
  mark(265.46, "Ubac 22 km", 15);
  mark(266.04, "Bauroux 23 km", 29);
  mark(267.33, "Castellaras 18 km", 15);
  mark(268.19, "Barbin 60 km", 29);
  f.note(X0, 26, "dashed: the same ridge on a plane");
  f.note(X0, 38, "filled: what a globe leaves, k = 0.13");
  f.trueScale();
  f.mountIn(document.getElementById("sim-figSil"));
}

/* ----------------------------------------------------------------------------
   hh's DEM silhouette (legacy hhFigSil(), L28558) : la crête réelle du
   Canigou vue d'Allauch, MNT LiDAR HD de l'IGN (2026-09-24, MNT 3″ avant), échelle angulaire VRAIE sur les deux axes
   -- y compris le disque solaire, posé où la photographie le montre (sur
   le point le plus haut du profil réfracté). Rattrapage UC11.
   -------------------------------------------------------------------------- */
export function drawHhFigSil() {
  var C = FIG.C, P = HH_CAN;
  var f = FIG.make({ w: 380, h: 250,
    alt: "The real Canigou skyline from Allauch in both models, on the same true angular scale, with the solar disc" });
  var SD = 32.5, MM = 2.34;
  var X0 = 20, TOP = 40, BOT = 218;
  var vTop = 40, vBot = -46;
  var px = function (i) { return X0 + i * P.step * 60 * MM; };
  var py = function (v) { return TOP + ((vTop - v) / (vTop - vBot)) * (BOT - TOP); };
  var path = function (arr) {
    var d = "";
    for (var i = 0; i < arr.length; i++) d += (i ? "L" : "M") + px(i).toFixed(1) + " " + py(arr[i]).toFixed(1);
    return d + "L" + px(arr.length - 1).toFixed(1) + " " + BOT + " L" + X0 + " " + BOT + " Z";
  };
  var im = 0;
  for (var i = 1; i < P.globeK.length; i++) if (P.globeK[i] > P.globeK[im]) im = i;
  f.circle(px(im), py(P.globeK[im]), (SD / 2) * MM, { c: "none", w: 0, fill: "#f0a81a" });
  f.circle(px(im), py(P.globeK[im]), (SD / 2) * MM, { c: "#c98410", w: 1 });
  f.path(path(P.globeK), { c: "none", w: 0, fill: "#14181d" });
  f.path(path(P.flat), { c: "#1d4ed8", w: 2 });
  f.dash(X0, py(0), 360, py(0), { c: C.faint });
  f.note(362, py(0) - 5, "eye level", { anchor: "end" });
  f.note(X0, 24, "blue: the same ridge, no curvature");
  f.note(X0, 36, "— 32′ up, two solar diameters higher");
  f.note(X0, 240, "black: what the globe leaves above the sea, k = 0.13");
  f.trueScale();
  f.mountIn(document.getElementById("hh-figSil"));
}

/* ----------------------------------------------------------------------------
   sim's opener: ONE figure, two panels, side by side at 380 px.

   WHY ONE FIGURE AND NOT TWO. The pair used to be two 560-wide drawings in a
   .cnav-grid, which stacks below 720 px -- so on a phone the reader met them one
   under the other and could not compare the two alphas without scrolling. Forced
   side by side at that width they would be 186 px each, and their 11 px labels
   would render at about four pixels.
   The only way to have both halves visible at once on a phone is to draw them in
   ONE viewBox sized for a phone, with the labels cut down to what a drawing can
   carry at that size: the panel names and alpha. Everything the old labels said
   -- e, h - e, d, the rectangle, the drop -- moves into the caption underneath,
   which was rewritten for the purpose.

   The two halves share a construction: same observer, same eye height, same
   ground distance, same target height. Exactly one assumption differs, and the
   two alpha arcs are drawn at the same radius in the same place, so the reader
   compares them by looking. That is the entire point of the figure.
   -------------------------------------------------------------------------- */
export function drawSimPair(){
  var host = document.getElementById("simPairFig");
  if(!host) return;
  var C = FIG.C;
  var f = FIG.make({ w:380, h:208,
    alt:"The same observer and the same target, on a flat plane and on a globe: the elevation angle is smaller on the globe" });

  var GY = 150, EY = 112, OX = 22, D = 132, H = 88, DROP = 15;
  var half = function(x0, globe){
    var ox = x0 + OX, tx = x0 + OX + D;
    var R = globe ? (DROP*DROP + D*D) / (2*DROP) : 0;
    var cy = GY + R;
    var surf = function(x){ return globe ? cy - Math.sqrt(R*R - (x-ox)*(x-ox)) : GY; };

    /* ground */
    if(globe){
      var d = "M" + (x0+6) + " " + surf(x0+6).toFixed(1);
      for(var x = x0+16; x <= x0+172; x += 8) d += "L" + x + " " + surf(x).toFixed(1);
      f.path(d, { c:C.ground, w:2 });
    } else {
      f.line(x0+6, GY, x0+172, GY, { c:C.ground, w:2 });
    }

    /* observer, his vertical, his eye */
    f.line(ox, GY, ox, EY, { c:C.ink, w:2 });
    f.dot(ox, EY, { r:3.5, c:C.ink });

    /* target: vertical on the plane, radial on the globe */
    var tf, u, tt;
    if(globe){
      tf = [tx, surf(tx)];
      u  = [(tf[0]-ox)/R, (tf[1]-cy)/R];
      tt = [tf[0] + u[0]*H, tf[1] + u[1]*H];
    } else {
      tf = [tx, GY]; u = [0, -1]; tt = [tx, GY - H];
    }
    f.line(tf[0], tf[1], tt[0], tt[1], { c:C.globe, w:2.4 });

    /* eye level: horizontal in both, because on the globe he stands at the top */
    f.dash(ox, EY, x0+174, EY, { c:C.faint, dash:"5 4" });
    f.txt(x0+174, EY - 5, "0\u00b0", { anchor:"end", c:C.soft, size:9 });

    /* on the globe, the gap the flat rectangle does not have */
    if(globe){
      var t = (EY - tf[1]) / u[1];
      f.line(tf[0] + u[0]*t + 8, EY, tf[0] + 8, tf[1], { c:"#b91c1c", w:2.4 });
    }

    /* the sight line and the angle, same radius in both panels */
    f.line(ox, EY, tt[0], tt[1], { c:C.globe, w:1.4, dash:"4 3" });
    f.angleAt(ox, EY, 34, [x0+174, EY], tt, { label:"\u03b1", tex:"\\alpha", c:C.globe, pad:10 });
  };

  half(0, false);
  f.line(190, 18, 190, 190, { c:C.faint, w:1 });
  half(196, true);
  f.txt(8, 30, "A \u00b7 flat plane", { sans:true, c:C.flat, size:11 });
  f.txt(204, 30, "B \u00b7 globe", { sans:true, c:C.globe, size:11 });
  f.notToScale("curvature shown with a small planet");
  f.mountIn(host);
}

/* ----------------------------------------------------------------------------
   grav's opener: where "down" points, in each model, side by side at 380 px.

   THE FLAT HALF IS THE STEEL-MAN AND ONLY THE STEEL-MAN. Every vertical exactly
   perpendicular to the plane, every bubble centred -- the infinite slab, which is
   the version of the flat model that WORKS for this measurement. The finite disc,
   whose verticals lean toward its centre, is not in this figure at all: it is
   section 02's business, and putting it here would let a reader think the flat
   model is being shown at its weakest before it has been shown at its best.
   -------------------------------------------------------------------------- */
export function drawGravPair(){
  var host = document.getElementById("gravPairFig");
  if(!host) return;
  var C = FIG.C, INK = "#151a21", AMB = "#b45309";
  var f = FIG.make({ w:380, h:196,
    alt:"Where down points: on a globe every vertical is a radius, on an infinite plane every vertical is parallel" });

  /* ---- A, the globe ---- */
  var cx = 92, cy = 116, R = 60;
  f.circle(cx, cy, R, { c:C.sea, w:2, fill:"rgba(15,118,110,0.06)" });
  var angs = [148, 116, 84, 52, 20];
  angs.forEach(function(a, i){
    var p = FIG.polar(cx, cy, R, a), q = FIG.polar(cx, cy, R + 22, a);
    f.line(q[0], q[1], p[0], p[1], { c:INK, w:1.6 });        // the plumb line, along the radius
    f.dot(q[0], q[1], { r:2.6, c:INK });
    if(i === 0 || i === 3){                                   // two of them carried on inward
      var m = FIG.polar(cx, cy, 0, a);
      f.dash(p[0], p[1], m[0], m[1], { c:"rgba(21,26,33,0.30)", dash:"3 4" });
    }
    var t = FIG.polar(cx, cy, R + 3, a), rad = a * Math.PI / 180;
    var tx = -Math.sin(rad), ty = -Math.cos(rad);             // tangent unit, screen coords
    f.line(t[0] - tx*13, t[1] - ty*13, t[0] + tx*13, t[1] + ty*13, { c:AMB, w:3 });
  });
  f.dot(cx, cy, { r:2.6, c:INK });
  f.txt(8, 186, "every vertical is a radius", { sans:true, c:C.soft, size:9 });

  /* ---- B, the infinite slab ---- */
  var gy = 140, x0 = 204, x1 = 372;
  f.ground(gy, x0, x1);
  for(var k = 0; k < 5; k++){
    var px = x0 + (x1 - x0) * (0.06 + 0.22*k);
    f.line(px, gy - 22, px, gy, { c:INK, w:1.6 });            // exactly perpendicular
    f.dot(px, gy - 22, { r:2.6, c:INK });
    f.line(px - 13, gy - 3, px + 13, gy - 3, { c:AMB, w:3 }); // and every bubble centred
  }
  f.txt(204, 186, "every vertical is parallel", { sans:true, c:C.soft, size:9 });

  f.line(190, 22, 190, 168, { c:C.faint, w:1 });
  f.txt(8, 34, "A \u00b7 globe", { sans:true, c:C.sea, size:11 });
  f.txt(204, 34, "B \u00b7 flat, at its strongest", { sans:true, c:C.flat, size:11 });
  f.notToScale("directions exact, bob heights schematic");
  f.mountIn(host);
}

/* ----------------------------------------------------------------------------
   surv's opener: the correction a surveyor applies a thousand times a day, and
   the number it would have on a plane. Drawn, because surv's two canvases carry
   no captions and neither is an A/B.

   Observer at the TOP of the arc in panel B -- the v104 rule -- so the line of
   sight is horizontal on screen and the gap that opens under it is the whole
   point. Both halves use the same instrument height, the same sight length and
   the same staff, so only the ground differs.
   -------------------------------------------------------------------------- */
export function drawSurvPair(){
  var host = document.getElementById("survPairFig");
  if(!host) return;
  var C = FIG.C, INK = "#151a21";
  var f = FIG.make({ w:380, h:196,
    alt:"Levelling: on a plane the staff reading needs no correction, on a globe the ground falls away by d squared over 2R" });

  var draw = function(x0, globe){
    var gy = 132, ix = x0 + 18, sx = x0 + 150, ih = 34;
    var drop = globe ? 26 : 0;
    var R = globe ? (drop*drop + (sx-ix)*(sx-ix)) / (2*drop) : 0;
    var cy = gy + R;
    var surf = function(x){ return globe ? cy - Math.sqrt(R*R - (x-ix)*(x-ix)) : gy; };

    if(globe){
      var d = "M" + (x0+8) + " " + surf(x0+8).toFixed(1);
      for(var x = x0+16; x <= x0+164; x += 8) d += "L" + x + " " + surf(x).toFixed(1);
      f.path(d, { c:C.ground, w:2 });
    } else {
      f.line(x0+8, gy, x0+164, gy, { c:C.ground, w:2 });
    }

    /* the instrument, and its line of sight -- horizontal in both */
    f.line(ix, gy, ix, gy - ih, { c:INK, w:2 });
    f.dot(ix, gy - ih, { r:3.2, c:INK });
    f.dash(ix, gy - ih, x0 + 166, gy - ih, { c:C.faint, dash:"5 4" });

    /* the staff */
    var sy = surf(sx);
    f.line(sx, sy, sx, sy - 62, { c:C.sea, w:3 });

    /* what the staff reads against the level line */
    if(globe){
      f.line(sx + 11, gy - ih, sx + 11, sy, { c:"#b91c1c", w:3 });
      f.txt(sx + 6, sy + 13, "d\u00b2/2R", { c:"#b91c1c", tex:"d^2/2R", size:10, anchor:"middle" });
    } else {
      f.txt(sx + 11, gy - ih + 4, "0", { c:C.soft, size:10 });
    }
  };

  draw(0, false);
  f.line(190, 22, 190, 172, { c:C.faint, w:1 });
  draw(196, true);
  f.txt(8, 34, "A \u00b7 flat plane", { sans:true, c:C.flat, size:11 });
  f.txt(204, 34, "B \u00b7 globe", { sans:true, c:C.sea, size:11 });
  f.txt(8, 188, "correction needed: none", { sans:true, c:C.soft, size:9 });
  f.txt(204, 188, "correction needed: every sight", { sans:true, c:C.soft, size:9 });
  f.notToScale("curvature shown with a small planet");
  f.mountIn(host);
}

/* ----------------------------------------------------------------------------
   cnav's opener, rebuilt as ONE figure so the two models sit side by side at
   380 px. The two hand-written SVGs it replaces were 380 wide EACH, so the grid
   stacked them on a phone and the comparison -- one constant rate against a
   changing one -- could not be seen without scrolling.
   The refraction groups keep their ids: the tab's ☼ switch shows and hides
   #svgRefr1 and #svgRefr2 by id, and it must keep working.
   -------------------------------------------------------------------------- */
export function drawCnavPair(){
  var host = document.getElementById("cnavPairFig");
  if(!host) return;
  var C = FIG.C, INK = "#151a21", ORA = "#c2410c";
  var f = FIG.make({ w:380, h:218,
    alt:"Globe: the zenith distance equals the central angle d over R. Flat plane: the altitude of a body at finite height changes at a rate that keeps changing." });

  /* ---- A, the globe ----------------------------------------------------
     THE STARLIGHT ARROWS POINTED INTO THE EARTH in v112. Each was drawn from
     pt - dir*54 to pt with dir pointing up-right, so the tail landed BELOW AND
     LEFT of its target -- inside the globe -- and the light appeared to come out
     of the planet. One sign, and the sort no audit can see: the arrows were the
     right length, the right colour, and inside the viewBox. Reported by the
     owner from the rendered page.
     The circle was also taller than the box, so it was clipped and the footer
     label ran across it. Both now derived from the box instead of guessed. */
  var cx = 92, cy = 148, R = 48;
  f.circle(cx, cy, R, { c:C.sea, w:2, fill:"#dcefec" });
  var O = [cx, cy - R];
  f.dash(O[0], O[1], O[0], O[1] - 34, { c:INK, dash:"5 4" });
  var gp = FIG.polar(cx, cy, R, 46);
  f.line(cx, cy, gp[0], gp[1], { c:INK, w:1.3 });
  f.line(cx, cy, O[0], O[1], { c:INK, w:1.3, dash:"5 4" });
  f.angleAt(cx, cy, 26, O, gp, { label:"\u03b8", tex:"\\theta = d/R", c:C.sea, pad:12 });
  f.dot(cx, cy, { r:3, c:INK });
  f.dot(O[0], O[1], { r:4, c:INK });
  f.dot(gp[0], gp[1], { r:4, c:C.sea });
  f.txt(gp[0] + 7, gp[1] + 13, "GP", { sans:true, c:C.sea, size:10 });
  /* the light TRAVELS down-left, so each arrow starts up-right of its target,
     outside the globe, and ends on it. */
  var up = [0.62, -0.78];
  [O, gp].forEach(function(pt){
    f.arrow(pt[0] + up[0]*34, pt[1] + up[1]*34, pt[0], pt[1],
            { c:ORA, w:1.3, dash:"4 3", head:5 });
  });
  f.txt(168, 44, "\u2605", { anchor:"end", c:INK, size:15 });
  f.txt(8, 30, "A \u00b7 globe", { sans:true, c:C.sea, size:11 });
  f.txt(8, 212, "one rate: 1\u2032 per nautical mile", { sans:true, c:C.soft, size:9 });
  var g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g1.setAttribute("id", "svgRefr1"); g1.setAttribute("style", "display:none");
  f.svg.appendChild(g1);
  var save = f.svg; f.svg = g1;
  f.line(O[0] + up[0]*34, O[1] + up[1]*34 - 9, O[0], O[1], { c:ORA, w:1.6 });
  f.svg = save;

  /* ---- B, the flat plane ---- */
  f.line(190, 26, 190, 196, { c:C.faint, w:1 });
  var gy = 168, x0 = 206, x1 = 372, H = 96;
  f.ground(gy, x0, x1);
  var bx = x1 - 8, by = gy - H;
  f.dash(bx, gy, bx, by, { c:INK, dash:"4 3" });
  f.txt(bx, by - 8, "\u2605", { anchor:"middle", c:INK, size:15 });
  f.txt(bx - 6, gy - H/2, "H", { tex:"H", c:C.soft, anchor:"end", size:11 });
  [0.06, 0.34, 0.62].forEach(function(t){
    var ox = x0 + (bx - x0) * t;
    f.dot(ox, gy, { r:3.4, c:INK });
    f.line(ox, gy, bx, by, { c:ORA, w:1.3 });
    f.angleAt(ox, gy, 20, [bx, gy], [bx, by], { c:C.flat, w:1.2 });
  });
  f.txt(204, 30, "B \u00b7 flat plane", { sans:true, c:C.flat, size:11 });
  f.txt(204, 210, "equal steps, unequal angles", { sans:true, c:C.soft, size:9 });
  var g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g2.setAttribute("id", "svgRefr2"); g2.setAttribute("style", "display:none");
  f.svg.appendChild(g2);
  save = f.svg; f.svg = g2;
  f.line(x0 + 10, gy, bx - 10, by + 12, { c:ORA, w:1.6 });
  f.svg = save;

  f.notToScale("distances schematic; the star is at infinity");
  f.mountIn(host);
}

/* ----------------------------------------------------------------------------
   dip's opener. NEW, not promoted: the pair that used to open this tab is driven
   by the height input underneath it, and a tab should not open on a figure whose
   state depends on a control the reader has not reached yet. That pair goes back
   below, where its input is. This one is static and says the one thing dip is
   about: on a plane the sea meets eye level and there is nothing to measure; on
   a globe the horizon sits an angle delta BELOW eye level, and delta grows with
   height.
   -------------------------------------------------------------------------- */
/* ============================================================================
   SYMBOL SCHEMATICS for fou, seis, mag, surv, hh and cnav. The letters, and
   nothing else. With these the campaign closes at 50/53; only obs is left.
   ========================================================================= */
export function drawFouFormulaSymbols(){
  var C=FIG.C, f;

  /* --- fou 0 : where phi is ------------------------------------------------ */
  f=FIG.make({w:380,h:210,alt:"One station on the globe: the angle between the spin axis and the station's own vertical is its latitude"});
  var O=[186,116], R=76, la=38*Math.PI/180;
  f.circle(O[0],O[1],R,{c:C.ground,w:2});
  f.dot(O[0],O[1],{r:3,c:C.ink});
  f.dash(O[0],O[1]-R-24,O[0],O[1]+R+24,{c:C.faint,w:1.2,dash:"4 4"});
  f.txt(O[0]-2,O[1]+R+34,"the axis",{c:C.soft,anchor:"middle",size:10});
  var P=[O[0]+R*Math.cos(la),O[1]-R*Math.sin(la)];
  f.dot(P[0],P[1],{r:4.2,c:C.ink});
  f.line(O[0],O[1],P[0],P[1],{c:C.soft,w:1.3});
  f.line(P[0],P[1],P[0]+Math.cos(la)*44,P[1]-Math.sin(la)*44,{c:C.ink,w:2});
  f.txt(P[0]+Math.cos(la)*58,P[1]-Math.sin(la)*58,"your vertical",{c:C.ink,anchor:"middle",size:10});
  f.angleAt(O[0],O[1],42,[O[0]+R,O[1]],P,{label:"\u03c6",tex:"\\varphi",c:C.globe,pad:13});
  f.ellipse(O[0],O[1],R,17,{c:C.faint,w:1.1});
  f.arrow(O[0],O[1]-R-10,O[0],O[1]-R-30,{c:C.flat,w:2,head:8});
  f.txt(O[0]+20,O[1]-R-16,"\u03a9",{tex:"\\Omega",c:C.flat,anchor:"middle",size:13});
  f.note(190,200,"the axis is one direction; your vertical is another",{size:9,anchor:"middle"});
  f.notToScale("the mast is drawn large");
  f.mountIn(document.getElementById("foufig0"));

  /* --- fou 1 : the two components ------------------------------------------ */
  f=FIG.make({w:380,h:206,alt:"At one station the rotation vector splits into a part along the local vertical and a part along the local horizontal"});
  var S=[130,150], la1=40*Math.PI/180, Lv=110;
  f.ground(S[1],40,340);
  f.txt(300,S[1]+18,"your floor",{c:C.ground,anchor:"middle",size:10});
  var ux=Math.cos(la1), uy=-Math.sin(la1);
  var A=[S[0]+ux*Lv,S[1]+uy*Lv];
  f.arrow(S[0],S[1],A[0],A[1],{c:C.flat,w:2.2,head:9});
  f.txt(A[0]+14,A[1]-4,"\u03a9",{tex:"\\Omega",c:C.flat,anchor:"middle",size:13});
  f.arrow(S[0],S[1],S[0],S[1]-Lv*Math.sin(la1),{c:C.sea,w:3,head:9});
  f.txt(S[0]-30,S[1]-Lv*Math.sin(la1)/2,"\u03a9 sin\u03c6",{tex:"\\Omega\\sin\\varphi",c:C.sea,anchor:"middle",size:11});
  f.arrow(S[0],S[1],S[0]+Lv*Math.cos(la1),S[1],{c:C.soft,w:2.4,head:9});
  f.txt(S[0]+Lv*Math.cos(la1)/2,S[1]+18,"\u03a9 cos\u03c6",{tex:"\\Omega\\cos\\varphi",c:C.soft,anchor:"middle",size:11});
  f.dash(S[0]+Lv*Math.cos(la1),S[1],A[0],A[1],{c:C.faint,w:1,dash:"3 3"});
  f.dash(S[0],S[1]-Lv*Math.sin(la1),A[0],A[1],{c:C.faint,w:1,dash:"3 3"});
  f.angleAt(S[0],S[1],46,[340,S[1]],A,{label:"\u03c6",tex:"\\varphi",c:C.globe,pad:13});
  f.dot(S[0],S[1],{r:4,c:C.ink});
  f.note(190,196,"only the part square to your floor turns a swing plane",{size:9,anchor:"middle"});
  f.notToScale("the arrow length carries no units");
  f.mountIn(document.getElementById("foufig1"));

  /* --- fou 2 : Airy's ellipse ----------------------------------------------- */
  f=FIG.make({w:380,h:214,alt:"A pendulum of length L whose bob traces a thin ellipse with semi-axes a and b"});
  var piv=[104,36], L=124;
  f.line(70,piv[1],138,piv[1],{c:C.ground,w:2.4});
  f.dot(piv[0],piv[1],{r:3.4,c:C.ink});
  f.line(piv[0],piv[1],piv[0],piv[1]+L,{c:C.ink,w:1.6});
  f.seg(piv[0]-22,piv[1],piv[0]-22,piv[1]+L,{label:"L",tex:"L",c:C.soft,side:-13});
  f.circle(piv[0],piv[1]+L,7,{c:C.ink,w:2});
  f.dash(piv[0]-46,piv[1]+L,piv[0]+46,piv[1]+L,{c:C.faint,w:1,dash:"3 4"});
  var Ec=[282,132];
  f.ellipse(Ec[0],Ec[1],74,20,{c:C.globe,w:2.2});
  f.dot(Ec[0],Ec[1],{r:2.6,c:C.ink});
  f.seg(Ec[0],Ec[1],Ec[0]+74,Ec[1],{label:"a",tex:"a",c:C.soft,side:-16});
  f.seg(Ec[0]-30,Ec[1],Ec[0]-30,Ec[1]-20,{label:"b",tex:"b",c:C.soft,side:14});
  f.note(282,176,"the bob's path, seen from above",{size:9,anchor:"middle"});
  f.note(190,204,"b is tiny beside a: an ellipse, not a circle",{size:9,anchor:"middle"});
  f.notToScale("the ellipse's width b is greatly exaggerated");
  f.mountIn(document.getElementById("foufig2"));
}

export function drawSeisSymbols(){
  var C=FIG.C, f;

  /* --- seis 0 : arc over speed ---------------------------------------------- */
  f=FIG.make({w:380,h:206,alt:"An epicentre and a station on one sphere: the arc between them is the radius times the angle, and the arrival time is that arc over the wave speed"});
  var O=[190,120], R=82;
  f.circle(O[0],O[1],R,{c:C.ground,w:1.6});
  f.dot(O[0],O[1],{r:3,c:C.ink});
  var E=FIG.polar(O[0],O[1],R,150), S=FIG.polar(O[0],O[1],R,34);
  f.path("M"+E[0]+" "+E[1]+"A"+R+" "+R+" 0 0 1 "+S[0]+" "+S[1],{c:C.globe,w:3.2});
  f.dot(E[0],E[1],{r:4.4,c:C.flat}); f.dot(S[0],S[1],{r:4.4,c:C.ink});
  f.txt(E[0]-14,E[1]-12,"quake",{c:C.flat,anchor:"middle",size:10});
  f.txt(S[0]+22,S[1]-10,"station",{c:C.ink,anchor:"middle",size:10});
  f.line(O[0],O[1],E[0],E[1],{c:C.faint,w:1});
  f.seg(O[0],O[1],S[0],S[1],{label:"R",tex:"R",c:C.soft,side:12});
  f.angle(O[0],O[1],32,34,150,{label:"\u0394",tex:"\\Delta",c:C.globe,pad:13});
  var M=FIG.polar(O[0],O[1],R-20,92);
  f.txt(M[0],M[1]+4,"R\u0394",{tex:"R\\Delta",c:C.globe,anchor:"middle",size:11});
  f.note(190,196,"one arc, one speed v: the arrival time is R\u0394 / v",{size:9,anchor:"middle"});
  f.notToScale("the sphere is drawn small");
  f.mountIn(document.getElementById("seisfig0"));

  /* --- seis 1 : one extra lap ----------------------------------------------- */
  f=FIG.make({w:380,h:216,alt:"Two arrivals of the same wave train at one station: the later one has gone once more all the way round, so the gap between them measures the circumference"});
  var O2=[190,112], R2=66;
  f.circle(O2[0],O2[1],R2,{c:C.ground,w:1.6});
  var E2=FIG.polar(O2[0],O2[1],R2,152), S2=FIG.polar(O2[0],O2[1],R2,28);
  f.path("M"+E2[0]+" "+E2[1]+"A"+R2+" "+R2+" 0 0 1 "+S2[0]+" "+S2[1],{c:C.globe,w:3});
  f.circle(O2[0],O2[1],R2+16,{c:C.flat,w:2.2,dash:"7 5"});
  f.dot(E2[0],E2[1],{r:4.4,c:C.flat}); f.dot(S2[0],S2[1],{r:4.4,c:C.ink});
  f.txt(E2[0]-24,E2[1]-8,"quake",{c:C.flat,anchor:"middle",size:10});
  f.txt(S2[0]+26,S2[1]-8,"station",{c:C.ink,anchor:"middle",size:10});
  f.txt(O2[0],O2[1]-R2+18,"R\u2081",{tex:"R_1",c:C.globe,anchor:"middle",size:11});
  f.txt(14,O2[1]+6,"R\u2083 : one lap more",{c:C.flat,anchor:"start",size:11});
  f.note(190,208,"the gap between them is 2\u03c0R over v, and nothing else",{size:9,anchor:"middle"});
  f.notToScale("the extra lap is drawn as an outer ring");
  f.mountIn(document.getElementById("seisfig1"));
}

export function drawMagFormulaSymbols(){
  var C=FIG.C, f, RED="#b91c1c";

  /* --- mag 0 : dip and strength against magnetic latitude ------------------- */
  f=FIG.make({w:380,h:214,alt:"Magnetic latitude measured from the magnetic equator, the dip read from the local horizontal, and the field twice as strong at the pole as at the equator"});
  var O=[150,124], R=74, la=40*Math.PI/180;
  f.circle(O[0],O[1],R,{c:C.ground,w:1.8});
  f.dot(O[0],O[1],{r:3,c:C.ink});
  f.line(O[0]-R,O[1],O[0]+R,O[1],{c:C.faint,w:1.2});
  f.txt(O[0]-R-2,O[1]+16,"magnetic equator",{c:C.soft,anchor:"start",size:9});
  var P=[O[0]+R*Math.cos(la),O[1]-R*Math.sin(la)];
  f.dot(P[0],P[1],{r:4,c:C.ink});
  f.line(O[0],O[1],P[0],P[1],{c:C.faint,w:1});
  f.angleAt(O[0],O[1],40,[O[0]+R,O[1]],P,{label:"\u03bb",tex:"\\lambda",c:C.globe,pad:12});
  var hx=-Math.sin(la), hy=-Math.cos(la);
  f.dash(P[0]-hx*10,P[1]-hy*10,P[0]+hx*36,P[1]+hy*36,{c:C.faint,w:1.1,dash:"4 3"});
  var st=Math.sin(Math.PI/2-la), ct=Math.cos(Math.PI/2-la);
  var bx=-3*st*ct, by=2*ct*ct-st*st, bn=Math.hypot(bx,by);
  f.arrow(P[0],P[1],P[0]+bx/bn*34,P[1]+by/bn*34,{c:RED,w:2.4,head:8});
  f.angleAt(P[0],P[1],22,[P[0]+hx*36,P[1]+hy*36],[P[0]+bx/bn*34,P[1]+by/bn*34],{label:"I",tex:"I",c:C.ink,pad:11});
  var bx2=282;
  f.arrow(bx2,190,bx2,190-22,{c:C.globe,w:3,head:8});
  f.txt(bx2-20,176,"B\u2080",{tex:"B_0",c:C.globe,anchor:"middle",size:11});
  f.arrow(bx2+52,190,bx2+52,190-44,{c:C.globe,w:3,head:8});
  f.txt(bx2+52,138,"2B\u2080",{tex:"2B_0",c:C.globe,anchor:"middle",size:11});
  f.txt(bx2,204,"equator",{c:C.soft,anchor:"middle",size:9});
  f.txt(bx2+52,204,"pole",{c:C.soft,anchor:"middle",size:9});
  f.notToScale("arrow lengths are in true ratio to each other only");
  f.mountIn(document.getElementById("magfig0"));

  /* --- mag 1 : what a baseplate compass can feel ---------------------------- */
  f=FIG.make({w:380,h:214,alt:"The field points down at the dip angle; a needle on a vertical pivot can only answer to its horizontal part"});
  var Q=[104,108];
  f.dash(Q[0]-30,Q[1],Q[0]+150,Q[1],{c:C.faint,w:1.2,dash:"5 4"});
  f.txt(Q[0]+164,Q[1]-8,"horizontal",{c:C.soft,anchor:"end",size:10});
  var I=38*Math.PI/180, LB=132;
  f.arrow(Q[0],Q[1],Q[0]+LB*Math.cos(I),Q[1]+LB*Math.sin(I),{c:RED,w:2.6,head:9});
  f.txt(Q[0]+LB*Math.cos(I)+14,Q[1]+LB*Math.sin(I)+6,"B",{tex:"B",c:RED,anchor:"middle",size:12});
  f.arrow(Q[0],Q[1],Q[0]+LB*Math.cos(I),Q[1],{c:C.sea,w:3,head:9});
  f.txt(Q[0]+LB*Math.cos(I)/2,Q[1]-12,"H = B cos I",{tex:"H = B\\cos I",c:C.sea,anchor:"middle",size:11});
  f.dash(Q[0]+LB*Math.cos(I),Q[1],Q[0]+LB*Math.cos(I),Q[1]+LB*Math.sin(I),{c:C.faint,w:1,dash:"3 3"});
  f.angleAt(Q[0],Q[1],52,[Q[0]+150,Q[1]],[Q[0]+LB*Math.cos(I),Q[1]+LB*Math.sin(I)],{label:"I",tex:"I",c:C.ink,pad:12});
  f.dot(Q[0],Q[1],{r:4,c:C.ink});
  f.note(190,206,"a needle on a vertical pivot can answer to H alone",{size:9,anchor:"middle"});
  f.notToScale("the arrow length carries no units");
  f.mountIn(document.getElementById("magfig1"));
}

/* ----------------------------------------------------------------------------
   The five star symbol schematics. Same doctrine as the azim set: a schematic
   says what each letter DENOTES and nothing else. No cases, no numbers, no
   verdict -- those live in the tables. NO SENTENCES ON THE DRAWING: the reading
   goes in the .gloss under the figure, inside the same .formula box.
   -------------------------------------------------------------------------- */
export function drawStarSymbols(){
  var C = FIG.C, f, RED = "#b3261e";

  /* --- star 0 : the sense of a rotation is the sign of omega . u ------------ */
  f = FIG.make({w:380, h:206, alt:"The rotation vector, two lines of sight, and the plane that separates the two senses"});
  /* LA FLECHE DU BAS SORTAIT DU CADRE. L'audit ne mesure que les libelles ; un
     trait qui deborde ne se voit qu'en regardant le rendu. Centre remonte,
     rayon et fleches raccourcis. */
  /* Scene descendue de douze pixels : le « û » de la visee haute montait dans la
     bande du tampon d'echelle. Raccourcir le tampon aurait ete corriger le mot
     plutot que le dessin. */
  var Ox = 190, Oy = 116, R = 56;
  f.circle(Ox, Oy, R, {c:C.faint, w:1.2});
  f.dash(Ox - 118, Oy, Ox + 118, Oy, {c:C.faint, w:1.1, dash:"5 4"});
  f.txt(Ox + 122, Oy + 4, "\u03c9 \u00b7 \u00fb = 0", {tex:"\\omega\\cdot\\,\u00fb = 0", c:C.soft, anchor:"start", size:10});
  f.arrow(Ox, Oy, Ox, Oy - 82, {c:C.ink, w:2.6, head:9});
  f.txt(Ox - 12, Oy - 78, "\u03c9", {tex:"\\omega", c:C.ink, anchor:"end", size:13});
  var Ax = Ox + R*Math.cos(-0.9), Ay = Oy + R*Math.sin(-0.9);
  var Bx = Ox + R*Math.cos(0.9),  By = Oy + R*Math.sin(0.9);
  f.dot(Ax, Ay, {r:4, c:C.globe});
  f.dot(Bx, By, {r:4, c:C.flat});
  f.arrow(Ax, Ay, Ax + 40, Ay - 34, {c:C.globe, w:2.2, head:8});
  f.txt(Ax + 47, Ay - 40, "\u00fb", {tex:"\u00fb", c:C.globe, anchor:"start", size:12});
  f.arrow(Bx, By, Bx + 40, By + 34, {c:C.flat, w:2.2, head:8});
  f.txt(Bx + 47, By + 42, "\u00fb", {tex:"\u00fb", c:C.flat, anchor:"start", size:12});
  f.txt(Ox - 92, Oy - 28, "\u03c9 \u00b7 \u00fb > 0", {tex:"\\omega\\cdot\\,\u00fb > 0", c:C.globe, anchor:"middle", size:11});
  f.txt(Ox - 92, Oy + 36, "\u03c9 \u00b7 \u00fb < 0", {tex:"\\omega\\cdot\\,\u00fb < 0", c:C.flat, anchor:"middle", size:11});
  f.notToScale("the sphere stands for any rotating body");
  f.mountIn(document.getElementById("stfig0"));

  /* --- star 1 : the flat dome, in profile and from above -------------------- */
  f = FIG.make({w:380, h:220, alt:"The dome seen edge-on and from above: h, r, rho and the hour angle theta"});
  var gy = 128, cx = 66;                                   // profile: disc centre at cx
  f.ground(gy, 14, 196, {c:C.ink});
  f.vertical(cx, gy, 74, {c:C.faint, w:1.1});
  var sx = 158, sy = gy - 74;                              // the star on the dome
  f.dot(sx, sy, {r:4, c:C.flat});
  f.dash(cx, sy, sx, sy, {c:C.faint, w:1, dash:"3 3"});
  /* h ETIQUETTE LA VERTICALE, PAS L'HORIZONTALE. Le premier jet posait « h » sur
     le trait pointille qui va du mat jusqu'a l'etoile : le lecteur lisait une
     hauteur sur une distance horizontale. Le pointille reste, il sert a reporter
     l'altitude de l'etoile sur le mat ; l'etiquette est sur le mat. */
  f.txt(cx - 8, gy - 40, "h", {tex:"h", c:C.soft, anchor:"end", size:11});
  var ox = 112;                                            // the observer
  f.dot(ox, gy, {r:4, c:C.ink});
  f.line(ox, gy, sx, sy, {c:C.flat, w:2});
  f.dash(cx, gy, ox, gy, {c:C.globe, w:1.6, dash:"4 3"});
  f.txt((cx + ox)/2, gy + 13, "r", {tex:"r", c:C.globe, anchor:"middle", size:11});
  f.line(ox, gy, sx, gy, {c:C.soft, w:1.4});
  f.txt((ox + sx)/2, gy + 13, "d", {tex:"d", c:C.soft, anchor:"middle", size:11});
  f.angleAt(ox, gy, 30, [sx, gy], [sx, sy], {label:"a", tex:"a", c:C.ink, pad:11});
  f.txt(105, 208, "edge-on", {c:C.soft, anchor:"middle", size:9});

  var px = 292, py = 118, PR = 62;                         // plan view
  f.dash(214, 18, 214, 208, {c:C.faint, w:1, dash:"4 4"});
  f.circle(px, py, PR, {c:C.faint, w:1.2});
  f.dot(px, py, {r:3.5, c:C.ink});
  var qx = px + 34, qy = py;                               // observer, at r from centre
  f.dot(qx, qy, {r:4, c:C.ink});
  f.line(px, py, qx, qy, {c:C.globe, w:1.6});
  f.txt((px + qx)/2, py + 13, "r", {tex:"r", c:C.globe, anchor:"middle", size:11});
  var th = -0.95, tx = px + PR*Math.cos(th), ty = py + PR*Math.sin(th);
  f.dot(tx, ty, {r:4, c:C.flat});
  f.line(px, py, tx, ty, {c:C.flat, w:1.6});
  f.txt(px + PR*0.62*Math.cos(th) - 12, py + PR*0.62*Math.sin(th), "\u03c1", {tex:"\\rho", c:C.flat, anchor:"end", size:11});
  f.line(qx, qy, tx, ty, {c:C.soft, w:1.6});
  f.angleAt(px, py, 24, [qx, qy], [tx, ty], {label:"\u03b8", tex:"\\theta", c:C.ink, pad:10});
  f.txt(px, 208, "from above", {c:C.soft, anchor:"middle", size:9});
  f.notToScale("the dome is drawn far lower than any flat model claims");
  f.mountIn(document.getElementById("stfig1"));

  /* --- star 2 : the spherical triangle behind sin a -------------------------
     Le premier jet posait les trois sommets a la main avec des cosinus : ils se
     retrouvaient tasses dans le quart superieur, « 90°-φ » ecrit par-dessus P et
     « 90°-δ » couche sur son propre cote. On place maintenant les sommets en
     POLAIRE, bien ecartes, et chaque etiquette de cote part du milieu du cote
     vers l'exterieur. L'ellipse de l'equateur celeste a saute : elle n'est dans
     aucune des trois lettres de la formule et elle passait sous une etiquette. */
  f = FIG.make({w:380, h:212, alt:"Pole, zenith and star on the celestial sphere: the three sides of the altitude formula"});
  var Sx = 190, Sy = 124, SR = 84;
  f.circle(Sx, Sy, SR, {c:C.faint, w:1.2});
  var Zp = FIG.polar(Sx, Sy, SR, 78), Pp = FIG.polar(Sx, Sy, SR, 162), Tp = FIG.polar(Sx, Sy, SR, 335);
  f.line(Zp[0], Zp[1], Pp[0], Pp[1], {c:C.soft, w:1.6});
  f.line(Pp[0], Pp[1], Tp[0], Tp[1], {c:C.soft, w:1.6});
  f.line(Zp[0], Zp[1], Tp[0], Tp[1], {c:C.soft, w:1.6});
  f.dot(Zp[0], Zp[1], {r:4.5, c:C.ink});
  f.dot(Pp[0], Pp[1], {r:4.5, c:C.globe});
  f.dot(Tp[0], Tp[1], {r:4.5, c:C.flat});
  f.txt(Zp[0], Zp[1] - 10, "Z", {tex:"Z", c:C.ink, anchor:"middle", size:12});
  f.txt(Pp[0] - 10, Pp[1] - 2, "P", {tex:"P", c:C.globe, anchor:"end", size:12});
  f.txt(Tp[0] + 11, Tp[1] + 6, "\u2605", {c:C.flat, anchor:"start", size:12});
  f.txt((Zp[0] + Pp[0])/2 - 6, (Zp[1] + Pp[1])/2 - 9, "90\u00b0\u2212\u03c6", {tex:"90\u00b0-\\varphi", c:C.soft, anchor:"end", size:10});
  f.txt((Pp[0] + Tp[0])/2, (Pp[1] + Tp[1])/2 + 17, "90\u00b0\u2212\u03b4", {tex:"90\u00b0-\\delta", c:C.soft, anchor:"middle", size:10});
  f.txt((Zp[0] + Tp[0])/2 + 12, (Zp[1] + Tp[1])/2 - 4, "90\u00b0\u2212a", {tex:"90\u00b0-a", c:C.ink, anchor:"start", size:10});
  f.angleAt(Pp[0], Pp[1], 30, Zp, Tp, {label:"H", tex:"H", c:C.ink, pad:12});
  f.notToScale("a sphere of directions, not of distances");
  f.mountIn(document.getElementById("stfig2"));

  /* --- star 3 : the two culminations, on the meridian ----------------------- */
  f = FIG.make({w:380, h:212, alt:"The meridian: the pole at phi, the star at plus and minus p from it"});
  var my = 176, mx = 190, MR = 132;
  f.ground(my, 24, 356, {c:C.ink});
  f.txt(30, my + 14, "N", {c:C.soft, anchor:"start", size:9});
  f.txt(350, my + 14, "S", {c:C.soft, anchor:"end", size:9});
  var phi = 46*Math.PI/180;
  var Kx = mx - MR*Math.cos(phi), Ky = my - MR*Math.sin(phi);
  f.line(mx, my, Kx, Ky, {c:C.globe, w:1.8});
  f.dot(Kx, Ky, {r:4.5, c:C.globe});
  f.txt(Kx - 8, Ky - 6, "P", {tex:"P", c:C.globe, anchor:"end", size:11});
  f.angleAt(mx, my, 46, [30, my], [Kx, Ky], {label:"\u03c6", tex:"\\varphi", c:C.globe, pad:12});
  var p = 30*Math.PI/180;
  var Ux = mx - MR*Math.cos(phi + p), Uy = my - MR*Math.sin(phi + p);
  var Lx = mx - MR*Math.cos(phi - p), Ly = my - MR*Math.sin(phi - p);
  f.dot(Ux, Uy, {r:4, c:C.flat}); f.dot(Lx, Ly, {r:4, c:C.flat});
  f.line(mx, my, Ux, Uy, {c:C.faint, w:1.1});
  f.line(mx, my, Lx, Ly, {c:C.faint, w:1.1});
  f.angleAt(mx, my, 84, [Kx, Ky], [Ux, Uy], {label:"p", tex:"p", c:C.flat, pad:11});
  f.angleAt(mx, my, 108, [Lx, Ly], [Kx, Ky], {label:"p", tex:"p", c:C.flat, pad:11});
  f.dot(mx, my, {r:4, c:C.ink});
  f.trueScale();
  f.mountIn(document.getElementById("stfig3"));

  /* --- star 4 : equal times, equal angles ---------------------------------- */
  f = FIG.make({w:380, h:196, alt:"Equal intervals of time sweep equal angles about the fixed point"});
  var Fx = 190, Fy = 100, FR = 74;
  f.circle(Fx, Fy, FR, {c:C.faint, w:1.2});
  f.dot(Fx, Fy, {r:4, c:C.ink});
  f.txt(Fx, Fy + 15, "F", {tex:"F", c:C.ink, anchor:"middle", size:11});
  for (var i = 0; i < 12; i++){
    /* FIG.polar rend un TABLEAU [x, y], pas un objet {x, y} -- et il compte les
       degres vers l'EST puis dans le sens antihoraire, y etant deja retourne.
       Ecrit e.x, le schema levait un TypeError et la figure ne sortait pas. */
    var e = FIG.polar(Fx, Fy, FR, i*30), g = FIG.polar(Fx, Fy, FR, i*30 + 16);
    f.path("M" + e[0].toFixed(1) + " " + e[1].toFixed(1) +
           "A" + FR + " " + FR + " 0 0 0 " + g[0].toFixed(1) + " " + g[1].toFixed(1),
           {c:C.globe, w:3});
  }
  var A = FIG.polar(Fx, Fy, FR, 0), B = FIG.polar(Fx, Fy, FR, 30);
  f.line(Fx, Fy, A[0], A[1], {c:C.faint, w:1});
  f.line(Fx, Fy, B[0], B[1], {c:C.faint, w:1});
  f.angleAt(Fx, Fy, 34, A, B, {label:"\u0394\u03c8", tex:"\\Delta\\psi", c:C.ink, pad:12});
  f.trueScale();
  f.mountIn(document.getElementById("stfig4"));
}

export function drawSurvSymbols(){
  var C=FIG.C, f;

  /* --- surv 0 : two different sags ------------------------------------------ */
  f=FIG.make({w:380,h:210,alt:"From one end the ground falls away below the tangent; a chord stretched between the two ends stands above the ground only at the middle. Two different numbers"});
  var O=[190,760], R=690;
  function gy(x){return O[1]-Math.sqrt(R*R-(x-O[0])*(x-O[0]));}
  var xa=60, xb=320;
  var d="M"+xa+" "+gy(xa).toFixed(1);
  for(var x=xa+4;x<=xb;x+=4) d+="L"+x+" "+gy(x).toFixed(1);
  f.path(d,{c:C.ground,w:2.4});
  var A=[xa,gy(xa)], B=[xb,gy(xb)];
  f.dot(A[0],A[1],{r:4,c:C.ink}); f.dot(B[0],B[1],{r:4,c:C.ink});
  /* the tangent at A, produced */
  var tx=-(A[1]-O[1]), ty=(A[0]-O[0]), tn=Math.hypot(tx,ty);
  var far=[A[0]+tx/tn*300, A[1]+ty/tn*300];
  f.dash(A[0],A[1],far[0],far[1],{c:C.soft,w:1.3,dash:"5 4"});
  var ty2=A[1]+(ty/tn)*((xb-A[0])/(tx/tn));
  f.seg(xb+14,ty2,xb+14,B[1],{label:"d\u00b2/2R",tex:"d^2/2R",c:C.globe,side:17});
  /* the chord, and the ground standing above its middle */
  f.line(A[0],A[1],B[0],B[1],{c:C.flat,w:1.8});
  var mid=(A[0]+B[0])/2, chordY=(A[1]+B[1])/2;
  f.line(mid,chordY,mid,gy(mid),{c:C.flat,w:2.4});
  f.txt(mid-6,gy(mid)-12,"d\u00b2/8R",{tex:"d^2/8R",c:C.flat,anchor:"middle",size:11});
  f.txt(A[0]+74,A[1]-48,"the tangent, produced",{c:C.soft,anchor:"middle",size:10});
  f.note(190,200,"the drop from the tangent and the bulge of the chord differ",{size:9,anchor:"middle"});
  f.notToScale("the curvature is greatly exaggerated");
  f.mountIn(document.getElementById("survfig0"));

  /* --- surv 1 : the spherical excess ---------------------------------------- */
  f=FIG.make({w:380,h:216,alt:"A triangle drawn on a sphere: its three angles add to more than a straight angle, by its area over the radius squared"});
  var O2=[190,116], R2=82;
  f.circle(O2[0],O2[1],R2,{c:C.ground,w:1.6});
  var V=[FIG.polar(O2[0],O2[1],R2,108),FIG.polar(O2[0],O2[1],R2,-8),FIG.polar(O2[0],O2[1],R2,220)];
  function bow(p,q,bend){
    var mx=(p[0]+q[0])/2, my=(p[1]+q[1])/2;
    var vx=mx-O2[0], vy=my-O2[1], vn=Math.hypot(vx,vy);
    return "M"+p[0]+" "+p[1]+" Q"+(mx+vx/vn*bend)+" "+(my+vy/vn*bend)+" "+q[0]+" "+q[1];
  }
  f.path(bow(V[0],V[1],16),{c:C.globe,w:2.6});
  f.path(bow(V[1],V[2],16),{c:C.globe,w:2.6});
  f.path(bow(V[2],V[0],16),{c:C.globe,w:2.6});
  V.forEach(function(p){f.dot(p[0],p[1],{r:4,c:C.ink});});
  f.txt(O2[0]-6,O2[1]+30,"Area",{c:C.soft,anchor:"middle",size:11});
  f.seg(O2[0],O2[1],V[1][0],V[1][1],{label:"R",tex:"R",c:C.soft,side:-13});
  f.dot(O2[0],O2[1],{r:3,c:C.ink});
  f.note(190,208,"the three angles overshoot 180\u00b0 by Area over R squared",{size:9,anchor:"middle"});
  f.notToScale("the triangle is drawn large so its bulge shows");
  f.mountIn(document.getElementById("survfig1"));
}

export function drawHhCnavSymbols(){
  var C=FIG.C, f;

  /* --- hh 0 : the horizon, and what stands above it -------------------------
     v125. The first version put the target 33 px past the horizon on a 690 px
     sphere, so H came out ONE PIXEL and the figure's whole subject was
     invisible. The sphere is smaller now and the target far past the horizon:
     if a figure exists to show a quantity, choose the geometry that shows it. */
  f=FIG.make({w:380,h:214,alt:"The sightline grazes the surface at the horizon and carries straight on, so by the time it reaches the target it stands a height above the water"});
  var O=[190,490], R=420, ex=44, epx=26;
  function sy(x){return O[1]-Math.sqrt(R*R-(x-O[0])*(x-O[0]));}
  var d="M20 "+sy(20).toFixed(1);
  for(var x=24;x<=356;x+=4) d+="L"+x+" "+sy(x).toFixed(1);
  f.path(d,{c:C.ground,w:2.4});
  var eye=[ex,sy(ex)-epx];
  f.line(ex,sy(ex),eye[0],eye[1],{c:C.ink,w:2});
  f.seg(ex-16,sy(ex),ex-16,eye[1],{label:"e",tex:"e",c:C.soft,side:-13});
  f.dot(eye[0],eye[1],{r:4,c:C.ink});
  var Re=Math.hypot(eye[0]-O[0],eye[1]-O[1]), al=Math.acos(R/Re);
  var b0=Math.atan2(eye[1]-O[1],eye[0]-O[0]);
  var T=[O[0]+R*Math.cos(b0+al),O[1]+R*Math.sin(b0+al)];
  var tgtx=336, dx=T[0]-eye[0], dy=T[1]-eye[1], t=(tgtx-eye[0])/dx;
  var Hy=eye[1]+dy*t, gyT=sy(tgtx);
  f.line(eye[0],eye[1],tgtx,Hy,{c:C.globe,w:2.2});
  f.dot(T[0],T[1],{r:3.8,c:C.globe});
  f.line(tgtx,gyT,tgtx,Hy,{c:C.flat,w:3});
  f.txt(tgtx+16,(gyT+Hy)/2+4,"H",{tex:"H",c:C.flat,anchor:"middle",size:12});
  f.seg(ex,sy(ex)+30,T[0],sy(ex)+30,{label:"d\u2080",tex:"d_0",c:C.soft,side:-12});
  f.seg(ex,sy(ex)+56,tgtx,sy(ex)+56,{label:"d",tex:"d",c:C.soft,side:-12});
  f.note(190,204,"everything below H is behind the bulge",{size:9,anchor:"middle"});
  f.notToScale("the eye height and H are greatly exaggerated");
  f.mountIn(document.getElementById("hhfig0"));

  /* --- cnav 0 : move d, gain a ---------------------------------------------- */
  f=FIG.make({w:380,h:216,alt:"Walk a distance over the ground toward a star's sub-point and its altitude rises by the angle you have turned through at the centre"});
  var O2=[190,300], R3=190;
  var A=FIG.polar(O2[0],O2[1],R3,102), B=FIG.polar(O2[0],O2[1],R3,74);
  var e1=FIG.polar(O2[0],O2[1],R3,124), e2=FIG.polar(O2[0],O2[1],R3,56);
  f.path("M"+e1[0]+" "+e1[1]+"A"+R3+" "+R3+" 0 0 1 "+e2[0]+" "+e2[1],{c:C.ground,w:2.4});
  /* v128. THE STARLIGHT CAME OUT OF THE GROUND. The arrows ran from p - ray*86
     to p - ray*18 with ray pointing UP-left, which puts both tails BELOW the
     surface: the two beams rose out of the Earth and struck the stations from
     underneath. Correct code, impossible picture, and it shipped.
     The star is now up to the RIGHT, so that walking left to right is walking
     TOWARDS its sub-point and the altitude gained reads in the direction the
     eye travels: alt at A, alt + a at B. The arrows come down out of the sky. */
  var ray=[0.60,-0.80];                  /* unit vector from the station TO the star */
  [A,B].forEach(function(p){
    var ux=(p[0]-O2[0])/R3, uy=(p[1]-O2[1])/R3;
    var hx=-uy, hy=ux;                   /* local horizontal, star side is +h here */
    f.dash(p[0]-hx*30,p[1]-hy*30,p[0]+hx*70,p[1]+hy*70,{c:C.soft,w:1.3,dash:"5 4"});
    f.arrow(p[0]+ray[0]*86,p[1]+ray[1]*86,p[0]+ray[0]*18,p[1]+ray[1]*18,{c:C.flat,w:1.5,head:7});
    f.angleAt(p[0],p[1],36,[p[0]+hx*70,p[1]+hy*70],[p[0]+ray[0]*40,p[1]+ray[1]*40],
              {label:(p===A?"alt":"alt + a"),c:C.globe,w:1.6,pad:16});
    f.dot(p[0],p[1],{r:4.2,c:C.ink});
  });
  f.seg(A[0],A[1]+46,B[0],B[1]+46,{label:"d",tex:"d",c:C.soft,side:-14});
  f.txt(190,34,"the same star, its rays parallel",{c:C.flat,anchor:"middle",size:10});
  f.note(190,206,"the turn at the centre is d/R, and that is the altitude gained",{size:9,anchor:"middle"});
  f.notToScale("the separation is greatly exaggerated");
  f.mountIn(document.getElementById("cnavfig0"));
}

/* ============================================================================
   SYMBOL SCHEMATICS for gps, sun and grav. The letters, and nothing else.
   ========================================================================= */
export function drawGpsSymbols(){
  var C=FIG.C, f;

  /* --- gps 0 : four ranges, four unknowns ------------------------------------
     v123a. c.delta-t was drawn three ways before it was drawn none. A bar
     floating beside the receiver measured nothing; a stub collinear with one
     range measured the wrong thing; four equal overshoots were CORRECT -- a
     clock bias does make all four pseudoranges too long by the same amount --
     but from a receiver on top of the sphere all four overshoots point into
     the ground, and the picture reads as an error rather than as the point.
     So it is not drawn. delta-t is a TIME, and a symbol schematic that cannot
     show a quantity honestly should name it and say why, which the note does.
     Better a letter admitted missing than a letter drawn as something else. */
  f=FIG.make({w:380,h:206,alt:"Four satellites and one receiver: each measured range is one equation, and the fourth of them buys the receiver's clock error"});
  var O=[190,132], R=40;
  f.circle(O[0],O[1],R,{c:C.ground,w:2});
  var P=[O[0]+R*Math.cos(-1.15),O[1]+R*Math.sin(-1.15)];
  var sats=[[54,58],[150,40],[280,50],[344,124]];
  for(var i=0;i<4;i++){
    f.line(sats[i][0],sats[i][1],P[0],P[1],{c:C.globe,w:1.5});
    f.dot(sats[i][0],sats[i][1],{r:4,c:C.globe});
    f.txt(sats[i][0]-14,sats[i][1]-6,"s"+(i+1),{tex:"s_"+(i+1),c:C.globe,anchor:"middle",size:10});
  }
  f.dot(P[0],P[1],{r:4.5,c:C.ink});
  f.txt(P[0]-16,P[1]-10,"x",{tex:"x",c:C.ink,anchor:"middle",size:12});
  f.txt(120,94,"\u03c1\u1d62",{tex:"\\rho_i",c:C.globe,anchor:"middle",size:12});
  f.note(190,184,"four ranges, four unknowns: three of place and one of time",{size:9,anchor:"middle"});
  f.note(190,196,"\u03b4t is a clock error, so it is not a length on this picture",{size:9,anchor:"middle"});
  f.notToScale("orbit heights are compressed");
  f.mountIn(document.getElementById("gpsfig0"));

  /* --- gps 1 : each range is a sphere; two of them leave two points --------- */
  f=FIG.make({w:380,h:208,alt:"Each measured range puts you on a sphere around its satellite; two spheres leave two points, and the next range decides which"});
  var A=[44,96], B=[336,96], X=[190,158], Y=[190,34];
  var rA=Math.hypot(A[0]-X[0],A[1]-X[1]), rB=Math.hypot(B[0]-X[0],B[1]-X[1]);
  f.circle(A[0],A[1],rA,{c:C.globe,w:1.3});
  f.circle(B[0],B[1],rB,{c:C.flat,w:1.3});
  f.dot(A[0],A[1],{r:4.2,c:C.globe}); f.dot(B[0],B[1],{r:4.2,c:C.flat});
  f.dot(X[0],X[1],{r:5,c:C.ink});
  f.txt(X[0]+2,X[1]+20,"you",{c:C.ink,anchor:"middle",size:10});
  f.dot(Y[0],Y[1],{r:4.5,c:C.soft});
  f.txt(Y[0]+64,Y[1]+2,"the other point",{c:C.soft,anchor:"middle",size:10});
  f.seg(A[0],A[1],X[0],X[1],{label:"r\u2081",tex:"r_1",c:C.globe,side:-13});
  f.seg(B[0],B[1],X[0],X[1],{label:"r\u2082",tex:"r_2",c:C.flat,side:13});
  f.note(190,196,"the next range decides between them",{size:9,anchor:"middle"});
  f.notToScale("circles stand in for spheres");
  f.mountIn(document.getElementById("gpsfig1"));

  /* --- gps 2 : Kepler's third law ------------------------------------------ */
  f=FIG.make({w:380,h:200,alt:"One orbit radius and the Earth's measured gravitational parameter give the period, with nothing left to adjust"});
  var O2=[190,104], RE=30, a=76;
  f.circle(O2[0],O2[1],RE,{c:C.ground,w:2});
  f.circle(O2[0],O2[1],a,{c:C.globe,w:1.4,dash:"6 4"});
  f.dot(O2[0],O2[1],{r:3,c:C.ink});
  f.txt(O2[0]-2,O2[1]+16,"GM",{tex:"GM",c:C.ground,anchor:"middle",size:10});
  var S=FIG.polar(O2[0],O2[1],a,38);
  f.dot(S[0],S[1],{r:4.2,c:C.globe});
  f.seg(O2[0],O2[1],S[0],S[1],{label:"a",tex:"a",c:C.soft,side:12});
  var S2=FIG.polar(O2[0],O2[1],a,20);
  f.arrow(S[0],S[1],S2[0],S2[1],{c:C.globe,w:1.6,head:7});
  f.txt(O2[0]+a+26,O2[1]+40,"T",{tex:"T",c:C.globe,anchor:"middle",size:12});
  f.note(190,190,"one radius and one measured GM fix the timetable",{size:9,anchor:"middle"});
  f.notToScale("the orbit is drawn close in");
  f.mountIn(document.getElementById("gpsfig2"));

  /* --- gps 3 : the two clock terms -----------------------------------------
     v123a. TWO SEGMENTS HERE WERE FALSE and the owner spotted them in the
     rendered page. (1) r was drawn from a point 14 px to the RIGHT of the
     centre, so the thing labelled r was not the orbital radius; a dimension
     whose endpoint is not the centre is not a radius. (2) a vertical bar
     floating 16 px off the axis was labelled Delta-U -- a LENGTH labelled with
     a POTENTIAL, and its two ends touched neither circle. A schematic may
     compress a distance; it may not label one quantity with the name of a
     different one. Both segments now run between the real points they measure,
     and the potential is named in the note as what R and r set, not drawn. */
  f=FIG.make({w:380,h:218,alt:"A clock on the ground and a clock in orbit: the two radii set the potential gap, and the orbital speed is tangent to the orbit"});
  var O3=[190,122], R3=32, ao=68;
  f.circle(O3[0],O3[1],R3,{c:C.ground,w:2});
  f.circle(O3[0],O3[1],ao,{c:C.faint,w:1.2,dash:"6 4"});
  f.dot(O3[0],O3[1],{r:3,c:C.ink});
  var G=[O3[0],O3[1]-R3], Otop=[O3[0],O3[1]-ao], Sc=FIG.polar(O3[0],O3[1],ao,52);
  f.dot(G[0],G[1],{r:4,c:C.ink});
  f.dot(Sc[0],Sc[1],{r:4.2,c:C.globe});
  f.line(O3[0],O3[1],G[0],G[1],{c:C.soft,w:1.3});
  f.txt(O3[0]-14,(O3[1]+G[1])/2+4,"R",{tex:"R",c:C.soft,anchor:"middle",size:11});
  f.line(O3[0],O3[1],Sc[0],Sc[1],{c:C.soft,w:1.3});
  f.txt((O3[0]+Sc[0])/2+14,(O3[1]+Sc[1])/2+14,"r",{tex:"r",c:C.soft,anchor:"middle",size:11});
  f.seg(G[0],G[1],Otop[0],Otop[1],{label:"r \u2212 R",tex:"r-R",c:C.flat,side:16});
  var ur=[(Sc[0]-O3[0])/ao,(Sc[1]-O3[1])/ao], tg=[-ur[1],ur[0]];
  f.arrow(Sc[0],Sc[1],Sc[0]+tg[0]*34,Sc[1]+tg[1]*34,{c:C.globe,w:1.8,head:8});
  f.txt(Sc[0]+tg[0]*34+14,Sc[1]+tg[1]*34+6,"v",{tex:"v",c:C.globe,anchor:"middle",size:12});
  f.txt(O3[0]-2,O3[1]+16,"GM",{tex:"GM",c:C.ground,anchor:"middle",size:10});
  f.note(190,200,"\u0394U is the potential gap from R to r; v is tangent",{size:9,anchor:"middle"});
  f.note(190,212,"both terms are GM and r, and nothing else",{size:9,anchor:"middle"});
  f.notToScale("the orbit is drawn close in");
  f.mountIn(document.getElementById("gpsfig3"));
}

export function drawSunSymbols(){
  var C=FIG.C, f;

  /* --- sun 0 : light time across the orbit --------------------------------- */
  f=FIG.make({w:380,h:200,alt:"The Earth's orbit is a baseline: the same clockwork moon is seen late by the time light needs to cross it"});
  var S=[130,104], a=64;
  f.dot(S[0],S[1],{r:7,c:C.flat});
  f.txt(S[0],S[1]-18,"Sun",{c:C.flat,anchor:"middle",size:10});
  f.circle(S[0],S[1],a,{c:C.faint,w:1.2,dash:"6 4"});
  var E1=[S[0]-a,S[1]], E2=[S[0]+a,S[1]];
  f.dot(E1[0],E1[1],{r:4,c:C.globe}); f.dot(E2[0],E2[1],{r:4,c:C.globe});
  f.seg(E1[0],S[1]+46,E2[0],S[1]+46,{label:"2 au",tex:"2\\,\\text{au}",c:C.soft,side:-13});
  var J=[350,80];
  f.dot(J[0],J[1],{r:5,c:C.ground});
  f.txt(J[0],J[1]-16,"the clock out there",{c:C.ground,anchor:"end",size:10});
  f.line(E1[0],E1[1],J[0],J[1],{c:C.globe,w:1.4});
  f.line(E2[0],E2[1],J[0],J[1],{c:C.globe,w:1.4});
  f.txt(250,150,"the extra path is \u0394t \u00d7 c",{tex:"\\Delta t\\times c",c:C.globe,anchor:"middle",size:10});
  f.note(190,190,"the difference of the two paths is what the clock runs late by",{size:9,anchor:"middle"});
  f.notToScale("the outer distance is compressed");
  f.mountIn(document.getElementById("sunfig0"));

  /* --- sun 1 : the bearing, and its rate ------------------------------------ */
  f=FIG.make({w:380,h:196,alt:"The Sun's bearing measured round the horizon from north, and the rate at which that bearing turns"});
  var Cc=[190,112], RX=126, RY=38;
  f.ellipse(Cc[0],Cc[1],RX,RY,{c:C.ground,w:1.8});
  f.dot(Cc[0],Cc[1],{r:4,c:C.ink});
  f.txt(Cc[0],Cc[1]+16,"you",{c:C.ink,anchor:"middle",size:10});
  f.dash(Cc[0],Cc[1],Cc[0],Cc[1]-RY,{c:C.faint,w:1,dash:"3 4"});
  f.txt(Cc[0],Cc[1]-RY-8,"north",{c:C.soft,anchor:"middle",size:10});
  var e=function(d){var a=d*Math.PI/180;return [Cc[0]+RX*Math.cos(a),Cc[1]-RY*Math.sin(a)];};
  var P1=e(-24), P2=e(16);
  f.line(Cc[0],Cc[1],P1[0],P1[1],{c:C.soft,w:1.4});
  f.dot(P1[0],P1[1],{r:6,c:C.flat});
  f.dot(P2[0],P2[1],{r:6,c:C.flat});
  f.angleFlat(Cc[0],Cc[1],62,19,-24,90,{label:"\u03c8",tex:"\\psi",c:C.globe,pad:13});
  f.arrow(e(10)[0],e(10)[1]+16,e(-18)[0],e(-18)[1]+16,{c:C.flat,w:1.6,head:7});
  f.txt(e(-4)[0]+6,e(-4)[1]+38,"d\u03c8/dt",{tex:"d\\psi/dt",c:C.flat,anchor:"middle",size:11});
  f.note(190,186,"one bearing, and how fast it turns",{size:9,anchor:"middle"});
  f.notToScale("the horizon circle is drawn in perspective");
  f.mountIn(document.getElementById("sunfig1"));

  /* --- sun 2 : the dial ---------------------------------------------------- */
  f=FIG.make({w:380,h:196,alt:"A gnomon tilted at the latitude points along the axis; on the plate the hour lines open by an angle set by that latitude"});
  var gy=124, x0=34;
  f.ground(gy,x0-8,178);
  var phi=36*Math.PI/180, L=110;
  f.line(x0,gy,x0+L*Math.cos(phi),gy-L*Math.sin(phi),{c:C.ink,w:2.6});
  f.angleAt(x0,gy,44,[178,gy],[x0+L*Math.cos(phi),gy-L*Math.sin(phi)],{label:"\u03c6",tex:"\\varphi",c:C.soft,pad:12});
  f.note(96,150,"side on: parallel to the axis",{size:9,anchor:"middle"});
  var Pc=[288,132], RP=72;
  f.path("M"+(Pc[0]-RP)+" "+Pc[1]+"A"+RP+" "+RP+" 0 0 1 "+(Pc[0]+RP)+" "+Pc[1],{c:C.ground,w:1.8});
  f.line(Pc[0]-RP,Pc[1],Pc[0]+RP,Pc[1],{c:C.ground,w:1.8});
  f.dot(Pc[0],Pc[1],{r:3.4,c:C.ink});
  [90,66,42,114,138].forEach(function(d){
    var e=FIG.polar(Pc[0],Pc[1],RP,d);
    f.line(Pc[0],Pc[1],e[0],e[1],{c:C.faint,w:1});
  });
  var e1=FIG.polar(Pc[0],Pc[1],RP,90), e2=FIG.polar(Pc[0],Pc[1],RP,58);
  f.line(Pc[0],Pc[1],e1[0],e1[1],{c:C.soft,w:1.6,dash:"4 3"});
  f.line(Pc[0],Pc[1],e2[0],e2[1],{c:C.flat,w:2});
  f.angle(Pc[0],Pc[1],40,58,90,{label:"\u03b8",tex:"\\theta",c:C.flat,pad:13});
  f.note(288,150,"from above: the hour lines",{size:9,anchor:"middle"});
  f.notToScale("the plate is drawn without its shadow");
  f.mountIn(document.getElementById("sunfig2"));
}

export function drawGravSymbols(){
  var C=FIG.C, f;

  /* --- grav 0 : two verticals, one distant light ---------------------------- */
  f=FIG.make({w:380,h:200,alt:"Two verticals a measured distance apart, produced downward, meet at the centre; the angle they make there is that distance over the radius"});
  var O=[190,164], R=78;
  var A=FIG.polar(O[0],O[1],R,116), B=FIG.polar(O[0],O[1],R,64);
  var e1=FIG.polar(O[0],O[1],R,132), e2=FIG.polar(O[0],O[1],R,48);
  f.path("M"+e1[0]+" "+e1[1]+"A"+R+" "+R+" 0 0 1 "+e2[0]+" "+e2[1],{c:C.ground,w:2.2});
  f.dot(O[0],O[1],{r:3.2,c:C.ink});
  [A,B].forEach(function(q){
    f.dot(q[0],q[1],{r:4,c:C.ink});
    f.line(q[0],q[1],q[0]+(q[0]-O[0])*0.30,q[1]+(q[1]-O[1])*0.30,{c:C.ink,w:2.2});
    f.dash(q[0],q[1],O[0],O[1],{c:C.faint,w:1,dash:"3 4"});
  });
  f.arrow(A[0]-16,A[1]-52,A[0]-3,A[1]-16,{c:C.flat,w:1.5,head:7});
  f.arrow(B[0]-16,B[1]-52,B[0]-3,B[1]-16,{c:C.flat,w:1.5,head:7});
  f.txt(190,36,"the same distant light",{c:C.flat,anchor:"middle",size:10});
  f.angleAt(O[0],O[1],32,A,B,{label:"d/R",tex:"d/R",c:C.globe,pad:15});
  f.note(190,190,"the two verticals are not parallel, and the gap is d over R",{size:9,anchor:"middle"});
  f.notToScale("the separation is greatly exaggerated");
  f.mountIn(document.getElementById("gravfig0"));

  /* --- grav 1 : the slab and its surface density --------------------------- */
  f=FIG.make({w:380,h:180,alt:"An infinite slab: to pull at nine point eight you need a fixed mass under every square metre, spread out with no edge anywhere"});
  var gy=86, th=40;
  f.line(0,gy,380,gy,{c:C.ground,w:2.2});
  f.line(0,gy+th,380,gy+th,{c:C.ground,w:2.2});
  for(var i=0;i<19;i++) f.line(i*20+6,gy,i*20+14,gy+th,{c:C.faint,w:0.9});
  f.dot(190,gy-8,{r:4.5,c:C.ink});
  f.arrow(190,gy-8,190,gy-8+34,{c:C.globe,w:2,head:8});
  f.txt(206,gy+16,"g",{tex:"g",c:C.globe,anchor:"middle",size:12});
  f.line(150,gy-4,150,gy+th+4,{c:C.flat,w:1.4,dash:"3 3"});
  f.line(230,gy-4,230,gy+th+4,{c:C.flat,w:1.4,dash:"3 3"});
  f.txt(190,gy+th+22,"\u03c3 = mass under one square metre",{c:C.flat,anchor:"middle",size:10});
  f.arrow(40,gy+th+44,4,gy+th+44,{c:C.soft,w:1.3,head:7});
  f.arrow(340,gy+th+44,376,gy+th+44,{c:C.soft,w:1.3,head:7});
  f.txt(190,gy+th+48,"and no edge, in any direction",{c:C.soft,anchor:"middle",size:10});
  f.notToScale("thickness is arbitrary; only \u03c3 enters");
  f.mountIn(document.getElementById("gravfig1"));

  /* --- grav 2 : the free-air gradient --------------------------------------- */
  f=FIG.make({w:380,h:204,alt:"Gravity weakens with height at a rate the radius sets, so the measured rate inverts and gives the radius back"});
  var O2=[190,178], R2=86;
  var q1=FIG.polar(O2[0],O2[1],R2,150), q2=FIG.polar(O2[0],O2[1],R2,30);
  f.path("M"+q1[0]+" "+q1[1]+"A"+R2+" "+R2+" 0 0 1 "+q2[0]+" "+q2[1],{c:C.ground,w:2.2});
  f.dot(O2[0],O2[1],{r:3.2,c:C.ink});
  var top=[O2[0],O2[1]-R2];
  f.dot(top[0],top[1],{r:4,c:C.ink});
  f.arrow(top[0],top[1],top[0],top[1]+34,{c:C.globe,w:2.2,head:8});
  f.txt(top[0]+14,top[1]+26,"g",{tex:"g",c:C.globe,anchor:"middle",size:12});
  var up=[O2[0],top[1]-52];
  f.dot(up[0],up[1],{r:4,c:C.ink});
  f.arrow(up[0],up[1],up[0],up[1]+26,{c:C.globe,w:2.2,head:8});
  f.txt(up[0]-44,up[1]+20,"g \u2212 \u0394g",{tex:"g-\\Delta g",c:C.globe,anchor:"middle",size:11});
  f.seg(up[0]+30,top[1],up[0]+30,up[1],{label:"\u0394h",tex:"\\Delta h",c:C.soft,side:-17});
  f.seg(O2[0]-74,O2[1],O2[0]-74,top[1],{label:"R",tex:"R",c:C.flat,side:-14});
  f.note(190,194,"the rate it weakens at is set by R, so the rate gives R back",{size:9,anchor:"middle"});
  f.notToScale("the height is greatly exaggerated");
  f.mountIn(document.getElementById("gravfig2"));
}

/* ============================================================================
   SYMBOL SCHEMATICS for dip and twi. The letters, and nothing else.
   ========================================================================= */
export function drawDipSymbols(){
  var C=FIG.C, f;

  /* --- dip 0 : the dip angle and the horizon distance --------------------- */
  f=FIG.make({w:380,h:204,alt:"An eye a height h above a sphere of radius R: the tangent sightline leaves the eye level by the dip angle and touches the surface at the horizon distance"});
  var O=[190,470], R=330, ex=110;
  var top=[ex, O[1]-Math.sqrt(R*R-(ex-O[0])*(ex-O[0]))];
  f.path("M20 "+(O[1]-Math.sqrt(R*R-170*170))+" A"+R+" "+R+" 0 0 1 360 "+(O[1]-Math.sqrt(R*R-170*170)),{c:C.ground,w:2.2});
  var hpx=52, eye=[top[0], top[1]-hpx];
  f.line(top[0],top[1],eye[0],eye[1],{c:C.ink,w:2});
  f.seg(eye[0]-16,top[1],eye[0]-16,eye[1],{label:"h",tex:"h",c:C.soft,side:-13});
  f.dot(eye[0],eye[1],{r:3.6,c:C.ink});
  /* the eye-level horizontal: perpendicular to the radius through the eye */
  var ux=(eye[0]-O[0]), uy=(eye[1]-O[1]), un=Math.hypot(ux,uy);
  var tx=-uy/un, ty=ux/un;
  f.dash(eye[0]-tx*40, eye[1]-ty*40, eye[0]+tx*200, eye[1]+ty*200,{c:C.soft,w:1.2,dash:"5 4"});
  /* the tangent point */
  var Re=Math.hypot(eye[0]-O[0],eye[1]-O[1]);
  var alpha=Math.acos(R/Re), base=Math.atan2(eye[1]-O[1],eye[0]-O[0]);
  var T=[O[0]+R*Math.cos(base+alpha), O[1]+R*Math.sin(base+alpha)];
  f.line(eye[0],eye[1],T[0],T[1],{c:C.globe,w:2.4});
  f.line(O[0],O[1],T[0],T[1],{c:C.faint,w:1});
  f.dot(T[0],T[1],{r:3.4,c:C.globe});
  f.angleAt(eye[0],eye[1],54,[eye[0]+tx*200,eye[1]+ty*200],T,{label:"\u03b4",tex:"\\delta",c:C.globe,pad:13});
  f.rightAngle(T[0],T[1],[eye[0],eye[1]],[O[0],O[1]],7);
  f.note(190,196,"the sightline touches, it does not cross",{size:9,anchor:"middle"});
  f.notToScale("the eye height is greatly exaggerated");
  f.mountIn(document.getElementById("dipfig0"));

  /* --- dip 1 : the same angle read on a plane ----------------------------- */
  f=FIG.make({w:380,h:180,alt:"On a plane the same dip angle makes the sightline strike the ground at a finite distance, and the ground simply carries on beyond it"});
  var gy=132, ex1=44, h1=56;
  f.ground(gy,18,362);
  f.line(ex1,gy,ex1,gy-h1,{c:C.ink,w:2});
  f.seg(ex1-16,gy,ex1-16,gy-h1,{label:"h",tex:"h",c:C.soft,side:-13});
  f.dot(ex1,gy-h1,{r:3.6,c:C.ink});
  f.dash(ex1,gy-h1,352,gy-h1,{c:C.soft,w:1.2,dash:"5 4"});
  var hitx=ex1+180;
  f.line(ex1,gy-h1,hitx,gy,{c:C.flat,w:2.4});
  f.dot(hitx,gy,{r:3.4,c:C.flat});
  f.angleAt(ex1,gy-h1,52,[352,gy-h1],[hitx,gy],{label:"\u03b4",tex:"\\delta",c:C.flat,pad:12});
  f.seg(ex1,gy+18,hitx,gy+18,{label:"d",tex:"d",c:C.soft,side:-12});
  f.txt(300,gy-14,"the ground carries on",{c:C.soft,anchor:"middle",size:10});
  f.notToScale("the height is drawn large enough to see the angle");
  f.mountIn(document.getElementById("dipfig1"));

  /* --- dip 2 : the same picture read backwards, for R --------------------- */
  f=FIG.make({w:380,h:218,alt:"Measure the eye height and the dip angle and the centre is fixed: R is whatever radius makes that sightline tangent"});
  var O2=[190,126], R2=70;
  f.circle(O2[0],O2[1],R2,{c:C.ground,w:2});
  f.dot(O2[0],O2[1],{r:3.2,c:C.ink});
  var foot=[O2[0],O2[1]-R2], h2=34, eye2=[O2[0],foot[1]-h2];
  f.line(foot[0],foot[1],eye2[0],eye2[1],{c:C.ink,w:2});
  f.seg(eye2[0]-16,foot[1],eye2[0]-16,eye2[1],{label:"h",tex:"h",c:C.soft,side:-13});
  f.dot(eye2[0],eye2[1],{r:3.6,c:C.ink});
  f.dash(eye2[0]-40,eye2[1],eye2[0]+150,eye2[1],{c:C.soft,w:1.2,dash:"5 4"});
  var Re2=R2+h2, a2=Math.acos(R2/Re2);
  var T2=[O2[0]+R2*Math.sin(a2), O2[1]-R2*Math.cos(a2)];
  var far=[eye2[0]+(T2[0]-eye2[0])*1.9, eye2[1]+(T2[1]-eye2[1])*1.9];
  f.line(eye2[0],eye2[1],far[0],far[1],{c:C.globe,w:2.4});
  f.dot(T2[0],T2[1],{r:3.4,c:C.globe});
  f.angleAt(eye2[0],eye2[1],52,[eye2[0]+150,eye2[1]],T2,{label:"\u03b4",tex:"\\delta",c:C.globe,pad:13});
  f.seg(O2[0],O2[1],T2[0],T2[1],{label:"R",tex:"R",c:C.flat,side:-13});
  f.rightAngle(T2[0],T2[1],[eye2[0],eye2[1]],[O2[0],O2[1]],8);
  f.note(190,208,"h and \u03b4 fix the centre, and the centre is R",{size:9,anchor:"middle"});
  f.notToScale("the eye height is greatly exaggerated");
  f.mountIn(document.getElementById("dipfig2"));

  /* --- dip 3 : the window between eye level and the horizon ---------------- */
  f=FIG.make({w:380,h:206,alt:"Three rays from the eye: eye level, the horizon at the dip angle, and between them a Sun that has to fit"});
  var E=[36,54], L=300;
  var aSun=0.20, aHor=0.44;          /* radians of drawn opening, exaggerated */
  f.dot(E[0],E[1],{r:4,c:C.ink});
  f.dash(E[0],E[1],E[0]+L,E[1],{c:C.soft,w:1.3,dash:"5 4"});
  f.txt(E[0]+L-40,E[1]-10,"eye level",{c:C.soft,anchor:"middle",size:10});
  var s1=[E[0]+L*Math.cos(aSun), E[1]+L*Math.sin(aSun)];
  var s2=[E[0]+L*Math.cos(aHor), E[1]+L*Math.sin(aHor)];
  f.line(E[0],E[1],s1[0],s1[1],{c:C.flat,w:1.4,dash:"4 3"});
  f.line(E[0],E[1],s2[0],s2[1],{c:C.ground,w:2.2});
  f.txt(s2[0]-46,s2[1]-8,"horizon",{c:C.ground,anchor:"middle",size:10});
  /* the Sun, inscribed between eye level and the lower dashed ray */
  var dc=200, rad=dc*Math.sin(aSun/2);
  f.circle(E[0]+dc*Math.cos(aSun/2), E[1]+dc*Math.sin(aSun/2), rad,{c:C.flat,w:2});
  f.angleAt(E[0],E[1],96,[E[0]+L,E[1]],s1,{label:"32\u2032",c:C.flat,pad:13});
  f.angleAt(E[0],E[1],150,s1,s2,{label:"window",c:C.ground,pad:16});
  f.note(190,198,"the window is the dip less one Sun\u2011width",{size:9,anchor:"middle"});
  f.notToScale("the angles are greatly exaggerated");
  f.mountIn(document.getElementById("dipfig3"));

}

export function drawTwiSymbols(){
  var C=FIG.C, f;

  /* --- twi 0 : the shadow height ------------------------------------------- */
  f=FIG.make({w:380,h:236,alt:"The last ray that grazes the surface at the terminator passes over an observer further round at a height h, set by the radius and the Sun's depression"});
  var O=[190,144], R=66, th=40*Math.PI/180;
  f.circle(O[0],O[1],R,{c:C.ground,w:2});
  f.dot(O[0],O[1],{r:3,c:C.ink});
  var P=[O[0],O[1]-R];
  var T=[O[0]+R*Math.cos(Math.PI/2+th), O[1]-R*Math.sin(Math.PI/2+th)];
  var dir=[Math.cos(th),-Math.sin(th)];          /* tangent at T, up to the right */
  f.line(T[0]-dir[0]*46,T[1]-dir[1]*46, T[0]+dir[0]*186, T[1]+dir[1]*186,{c:C.flat,w:2.2});
  f.dot(T[0],T[1],{r:3.6,c:C.flat});
  f.dot(P[0],P[1],{r:3.8,c:C.ink});
  f.line(O[0],O[1],T[0],T[1],{c:C.faint,w:1});
  f.dash(O[0],O[1],P[0],P[1]-40,{c:C.faint,w:1,dash:"3 4"});
  f.angleAt(O[0],O[1],34,[P[0],P[1]],T,{label:"\u03b8",tex:"\\theta",c:C.globe,pad:13});
  var hy=P[1]-(R/Math.cos(th)-R);
  f.seg(P[0]+14,P[1],P[0]+14,hy,{label:"h",tex:"h",c:C.globe,side:-13});
  f.txt(T[0]-30,T[1]+26,"terminator",{c:C.flat,anchor:"middle",size:10});
  f.note(190,226,"below h you are in the shadow; above it the air is still lit",{size:9,anchor:"middle"});
  f.notToScale("the depression angle is exaggerated");
  f.mountIn(document.getElementById("twifig0"));

  /* --- twi 1 : the flat model's own two formulas -------------------------- */
  f=FIG.make({w:380,h:190,alt:"A lamp of diameter D at height H above a plane: the light falling on the ground at distance d and the angle the lamp subtends there"});
  var gy=150, S=[92,50];
  f.ground(gy,18,362);
  f.circle(S[0],S[1],17,{c:C.flat,w:2});
  f.seg(S[0]-30,S[1]-17,S[0]-30,S[1]+17,{label:"D",tex:"D",c:C.flat,side:-15});
  f.dash(S[0],S[1],S[0],gy,{c:C.faint,w:1,dash:"3 4"});
  f.seg(S[0]+14,S[1],S[0]+14,gy,{label:"H",tex:"H",c:C.soft,side:-13});
  var P=[300,gy];
  f.dot(P[0],P[1],{r:3.8,c:C.ink});
  f.line(S[0],S[1],P[0],P[1],{c:C.globe,w:2.2});
  f.txt(210,80,"r = \u221a(H\u00b2+d\u00b2)",{tex:"r=\\sqrt{H^2+d^2}",c:C.globe,anchor:"middle",size:10});
  f.seg(S[0],gy+18,P[0],gy+18,{label:"d",tex:"d",c:C.soft,side:-12});
  f.angleAt(P[0],P[1],26,[18,gy],[S[0],S[1]],{label:"\u03d1",tex:"\\vartheta",c:C.soft,pad:12});
  f.notToScale("the lamp is drawn large enough to have a diameter");
  f.mountIn(document.getElementById("twifig1"));

  /* --- twi 2 : the two stations, and the locked ratio ---------------------- */
  f=FIG.make({w:380,h:224,alt:"Directly under the lamp and far from it: the light falls off exactly as fast as the lamp shrinks, because one slant range sets both"});
  var gy2=138, S2=[104,40];
  f.ground(gy2,18,362);
  f.circle(S2[0],S2[1],16,{c:C.flat,w:2});
  f.dash(S2[0],S2[1],S2[0],gy2,{c:C.faint,w:1,dash:"3 4"});
  f.seg(S2[0]-18,S2[1],S2[0]-18,gy2,{label:"r\u2080 = H",tex:"r_0=H",c:C.soft,side:-19});
  var A2=[S2[0],gy2], B2=[316,gy2];
  f.dot(A2[0],A2[1],{r:3.8,c:C.ink}); f.dot(B2[0],B2[1],{r:3.8,c:C.ink});
  f.line(S2[0],S2[1],B2[0],B2[1],{c:C.globe,w:2.2});
  f.txt(232,80,"r",{tex:"r",c:C.globe,anchor:"middle",size:12});
  /* what each of them sees */
  f.circle(A2[0],gy2+32,13,{c:C.flat,w:1.8});
  f.txt(A2[0],gy2+60,"\u03d1(0)",{tex:"\\vartheta(0)",c:C.flat,anchor:"middle",size:10});
  f.circle(B2[0],gy2+32,5,{c:C.flat,w:1.8});
  f.txt(B2[0],gy2+60,"\u03d1(d)",{tex:"\\vartheta(d)",c:C.flat,anchor:"middle",size:10});
  f.note(190,214,"how much dimmer and how much smaller are one number, cubed",{size:9,anchor:"middle"});
  f.notToScale("the two apparent sizes are schematic");
  f.mountIn(document.getElementById("twifig2"));

  /* --- twi 3 : the Sun's lowest point of the night ------------------------ */
  f=FIG.make({w:380,h:216,alt:"In the plane of the meridian: the pole stands at the latitude, the Sun's daily circle is tilted with it, and its lowest point is the altitude that decides whether night arrives"});
  var Cc=[190,116], RR=80;
  f.circle(Cc[0],Cc[1],RR,{c:C.faint,w:1.2});
  f.line(Cc[0]-RR-14,Cc[1],Cc[0]+RR+14,Cc[1],{c:C.ground,w:2.2});
  f.txt(Cc[0]+RR+8,Cc[1]+18,"horizon",{c:C.ground,anchor:"end",size:10});
  f.dash(Cc[0],Cc[1],Cc[0],Cc[1]-RR-12,{c:C.faint,w:1,dash:"3 4"});
  var phi=44*Math.PI/180;
  var Pl=[Cc[0]-RR*Math.cos(phi),Cc[1]-RR*Math.sin(phi)];
  f.line(Cc[0],Cc[1],Pl[0],Pl[1],{c:C.soft,w:1.4});
  f.dot(Pl[0],Pl[1],{r:3.4,c:C.soft});
  f.angleAt(Cc[0],Cc[1],44,[Cc[0]-RR,Cc[1]],Pl,{label:"\u03c6",tex:"\\varphi",c:C.soft,pad:12});
  /* the Sun's daily circle, seen edge-on: a chord perpendicular to the polar axis */
  var ax=[Math.cos(Math.PI-phi),-Math.sin(Math.PI-phi)];
  var off=26, mid=[Cc[0]+ax[0]*off, Cc[1]+ax[1]*off];
  var per=[-ax[1],ax[0]];
  f.line(mid[0]-per[0]*74, mid[1]-per[1]*74, mid[0]+per[0]*74, mid[1]+per[1]*74,{c:C.globe,w:2.4});
  var up =[mid[0]+per[0]*74, mid[1]+per[1]*74];   /* upper culmination */
  var low=[mid[0]-per[0]*74, mid[1]-per[1]*74];   /* lower: the one that matters */
  f.dot(low[0],low[1],{r:3.6,c:C.globe}); f.dot(up[0],up[1],{r:3.2,c:C.globe});
  var bl=f.bearing(Cc[0],Cc[1],low[0],low[1]);
  f.angle(Cc[0],Cc[1],54,180,bl,{label:"h\u2098\u1d62\u2099",tex:"h_{\\min}",c:C.globe,pad:16});
  f.txt(up[0]+16,up[1]-12,"daily circle",{c:C.globe,anchor:"middle",size:10});
  f.note(190,206,"if that lowest point never reaches \u221218\u00b0, night never comes",{size:9,anchor:"middle"});
  f.notToScale("one meridian slice; the declination is drawn large");
  f.mountIn(document.getElementById("twifig3"));
}

/* ============================================================================
   SYMBOL SCHEMATICS for ref. The letters of each formula, and nothing else.
   ========================================================================= */
export function drawRefSymbols(){
  var C = FIG.C, f;

  /* --- 0 : rho against R, and the sphere that replaces both ---------------- */
  f = FIG.make({ w:380, h:182, alt:"The ray's arc has radius rho and the Earth's has radius R; k is their ratio, and a straight ray over a sphere of R over one minus k does the same job" });
  var K = 0.13, ay = 116, RA = 22;
  f.circle(96, ay + RA, RA, { c:C.ground, w:1.8 });
  var rho = RA / K;
  f.path("M34 " + (ay + 12) + " A" + rho + " " + rho + " 0 0 1 158 " + (ay + 12), { c:C.globe, w:2.4 });
  f.seg(96, ay + RA, 96, ay, { label:"R", tex:"R", c:C.soft, side:12 });
  f.txt(96, ay - 28, "\u03c1 = R/k", { tex:"\\rho = R/k", c:C.globe, anchor:"middle", size:11 });
  f.note(96, 172, "the two curvatures", { size:9, anchor:"middle" });
  var by = 116, RB = 22 / (1 - K);
  f.circle(284, by + RB, RB, { c:C.ground, w:1.8, dash:"5 4" });
  f.line(222, by, 346, by, { c:C.globe, w:2.4 });
  f.seg(284, by + RB, 284, by, { label:"R\u2091", tex:"R_{\\text{eff}}", c:C.ground, side:17 });
  f.note(284, 172, "straight ray, one bigger sphere", { size:9, anchor:"middle" });
  f.txt(190, ay + 2, "\u21d4", { c:C.soft, anchor:"middle", size:16 });
  f.trueScale();
  f.mountIn(document.getElementById("reffig0"));

  /* --- 1 : dn/dh ---------------------------------------------------------- */
  f = FIG.make({ w:380, h:198, alt:"The one physical input: how fast the refractive index of air falls with height, set by pressure, temperature and the temperature gradient" });
  var X = 74, Y = 46, W = 88, H = 104;
  for(var i=0;i<=4;i++) f.line(X, Y + i*H/4, X + W, Y + i*H/4, { c:C.faint, w:1 });
  f.arrow(X - 18, Y + H, X - 18, Y - 4, { c:C.soft, w:1.3, head:6 });
  f.txt(X - 30, Y + H/2, "h", { tex:"h", c:C.soft, anchor:"middle", size:11 });
      f.txt(X + W/2, Y - 14, "n small", { tex:"n\\ \\text{small}", c:C.globe, anchor:"middle", size:10 });
  f.txt(X + W/2, Y + H + 20, "n large", { tex:"n\\ \\text{large}", c:C.globe, anchor:"middle", size:10 });
  /* the profile that sets it */
  var PX = 250, PY = 46, PW = 96, PH = 104;
  f.axes(PX, PY + PH, PW, PH, { c:C.faint });
  f.line(PX + 80, PY + PH - 4, PX + 26, PY + 6, { c:C.flat, w:2.4 });
  f.txt(PX + PW/2, PY + PH + 22, "T", { tex:"T", c:C.soft, anchor:"middle", size:11 });
  f.txt(PX + 78, PY + 40, "dT/dh", { tex:"dT/dh", c:C.flat, anchor:"middle", size:10 });
  f.txt(PX - 16, PY + PH/2, "h", { tex:"h", c:C.soft, anchor:"middle", size:11 });
  f.note(190, 186, "P and T set the size of dn/dh; dT/dh sets its sign", { size:9, anchor:"middle" });
  f.notToScale("an illustrative profile, not a measured one");
  f.mountIn(document.getElementById("reffig1"));

  /* --- 2 : cos beta -------------------------------------------------------- */
  f = FIG.make({ w:380, h:184, alt:"Only the part of the gradient a ray crosses can bend it, so a near-level ray bends and a steep one hardly does" });
  var gy2 = 148, ox = 40;
  for(var i2=0;i2<6;i2++) f.line(18, gy2 - 16 - i2*20, 362, gy2 - 16 - i2*20, { c:C.faint, w:0.9 });
  f.ground(gy2, 18, 362);
  f.path("M" + ox + " " + gy2 + " Q210 " + (gy2 - 26) + " 352 " + (gy2 - 10), { c:C.globe, w:2.6 });
  f.path("M" + ox + " " + gy2 + " Q108 " + (gy2 - 74) + " 168 44", { c:C.soft, w:2.2 });
  f.dot(ox, gy2, { r:3.6, c:C.ink });
  f.angleAt(ox, gy2, 54, [362, gy2], [168, 44], { label:"\u03b2", tex:"\\beta", c:C.soft, pad:12 });
  f.txt(300, gy2 - 42, "near level: bends", { c:C.globe, anchor:"middle", size:10 });
  f.txt(228, 50, "steep: hardly", { c:C.soft, anchor:"middle", size:10 });
  f.notToScale("the bending is greatly exaggerated");
  f.mountIn(document.getElementById("reffig2"));

  /* --- 3 : two drops below one tangent, and the gap ------------------------ */
  f = FIG.make({ w:380, h:190, alt:"Below the same tangent line the ground drops by one amount and the ray by a smaller one; only the difference between them is ever visible" });
  var O = 34, ty = 52, dd = 268, drop = 96, dropL = 96 * 0.13;
  f.dash(O, ty, O + dd + 10, ty, { c:C.soft, w:1.2, dash:"5 4" });
  f.txt(O + 120, ty - 12, "tangent at the eye", { c:C.soft, anchor:"middle", size:10 });
  f.path("M" + O + " " + ty + " Q" + (O + dd/2) + " " + ty + " " + (O + dd) + " " + (ty + drop),  { c:C.ground, w:2.4 });
  f.path("M" + O + " " + ty + " Q" + (O + dd/2) + " " + ty + " " + (O + dd) + " " + (ty + dropL), { c:C.globe,  w:2.4 });
  f.dot(O, ty, { r:3.6, c:C.ink });
  f.seg(O + dd + 20, ty, O + dd + 20, ty + dropL, { label:"x\u029f", tex:"x_L", c:C.globe,  side:19 });
  f.seg(O + dd + 64, ty, O + dd + 64, ty + drop,  { label:"x\u1d07", tex:"x_E", c:C.ground, side:16 });
  f.seg(O + dd - 4, ty + dropL, O + dd - 4, ty + drop, { label:"seen", c:C.flat, side:-24 });
  f.notToScale("both drops are greatly exaggerated");
  f.mountIn(document.getElementById("reffig3"));

  /* --- 4 : k is linear in the temperature gradient ------------------------- */
  f = FIG.make({ w:380, h:204, alt:"k runs straight across zero as the temperature gradient changes; pressure and temperature only tilt the line, they cannot move the crossing" });
  var QX = 78, QY = 46, QW = 226, QH = 104, zy = QY + QH*0.44;
  f.axes(QX, QY + QH, QW, QH, { c:C.faint });
  f.dash(QX, zy, QX + QW + 8, zy, { c:C.faint, w:1.2, dash:"5 4" });
  var x1 = QX + 10, y1 = QY + 10, x2 = QX + QW - 10, y2 = QY + QH - 8;
  f.line(x1, y1, x2, y2, { c:C.flat, w:2.6 });
  var zx = x1 + (x2 - x1) * (zy - y1) / (y2 - y1);
  f.dot(zx, zy, { r:4, c:C.flat });
  f.txt(zx + 30, zy - 10, "k = 0", { tex:"k = 0", c:C.flat, anchor:"middle", size:10 });
  f.txt(QX - 26, QY + QH/2, "k", { tex:"k", c:C.soft, anchor:"middle", size:11 });
  f.txt(QX + QW/2, QY + QH + 26, "dT/dh", { tex:"dT/dh", c:C.soft, anchor:"middle", size:11 });
  f.note(QX + 46, QY + 4, "cool ground", { size:9, anchor:"middle" });
  f.note(QX + QW - 34, QY + QH + 8, "hot ground", { size:9, anchor:"middle" });
  f.note(190, 194, "P and T tilt this line; they cannot move where it crosses", { size:9, anchor:"middle" });
  f.notToScale("the axes carry no units");
  f.mountIn(document.getElementById("reffig4"));

  /* --- 5 : reciprocal zenith angles ---------------------------------------- */
  f = FIG.make({ w:380, h:204, alt:"Two stations on towers sight each other at the same moment; each zenith angle is read from its own vertical, and both bent rays share one atmosphere" });
  var R5 = 420, gx = 190;
  f.path("M20 176 A" + R5 + " " + R5 + " 0 0 1 360 176", { c:C.ground, w:2.2 });
  var Ax = 40, Ay = 172, Bx = 340, By = 172, hT = 56;
  var At = [Ax + 5, Ay - hT], Bt = [Bx - 5, By - hT];
  f.line(Ax, Ay, At[0], At[1], { c:C.ink, w:2 });
  f.line(Bx, By, Bt[0], Bt[1], { c:C.ink, w:2 });
  var vA = [At[0] + (At[0] - gx) * 0.30, At[1] - 56], vB = [Bt[0] + (Bt[0] - gx) * 0.30, Bt[1] - 56];
  f.dash(At[0], At[1], vA[0], vA[1], { c:C.soft, w:1.2, dash:"4 3" });
  f.dash(Bt[0], Bt[1], vB[0], vB[1], { c:C.soft, w:1.2, dash:"4 3" });
  f.dash(At[0], At[1], Bt[0], Bt[1], { c:C.soft, w:1.1, dash:"3 4" });
  f.path("M" + At[0] + " " + At[1] + " Q190 " + (At[1] + 26) + " " + Bt[0] + " " + Bt[1], { c:C.globe, w:2.4 });
  f.dot(At[0], At[1], { r:3.6, c:C.ink }); f.dot(Bt[0], Bt[1], { r:3.6, c:C.ink });
  f.angleAt(At[0], At[1], 38, vA, [190, At[1] + 14], { label:"zA", tex:"z_A", c:C.globe, pad:13 });
  f.angleAt(Bt[0], Bt[1], 38, vB, [190, Bt[1] + 14], { label:"zB", tex:"z_B", c:C.globe, pad:13 });
  f.txt(190, At[1] + 46, "one atmosphere, both ways", { c:C.globe, anchor:"middle", size:10 });
  f.note(190, 194, "the two verticals meet at the centre: that angle is \u03b3", { size:9, anchor:"middle" });
  f.notToScale("arc, towers and bend all exaggerated");
  f.mountIn(document.getElementById("reffig5"));
}

/* ============================================================================
   SYMBOL SCHEMATICS for dist. Same rule as azim and sim: what each letter of
   the formula points at, and nothing else. No case, no numbers, no verdict.
   ========================================================================= */
export function drawDistSymbols(){
  var C = FIG.C, f;

  /* --- 0 : one pair of endpoints, three rulers --------------------------- */
  f = FIG.make({ w:380, h:158, alt:"The same two endpoints measured three ways: an arc on the globe, a straight line on a lat-long grid, a straight chord on the polar disc" });
  var gy = 92, R0 = 34;
  /* globe */
  f.circle(62, gy, R0, { c:C.ground, w:1.8 });
  f.ellipse(62, gy, R0, 12, { c:C.faint, w:1 });
  var A = FIG.polar(62, gy, R0, 152), B = FIG.polar(62, gy, R0, 44);
  f.path("M"+A[0]+" "+A[1]+"A"+R0+" "+R0+" 0 0 1 "+B[0]+" "+B[1], { c:C.globe, w:2.6 });
  f.dot(A[0], A[1], { r:3.4, c:C.ink }); f.dot(B[0], B[1], { r:3.4, c:C.ink });
  /* cartesian grid */
  var gx0 = 138, gw = 104, gh = 62, gy0 = gy - 31;
  for(var i=0;i<=4;i++) f.line(gx0+i*gw/4, gy0, gx0+i*gw/4, gy0+gh, { c:C.faint, w:1 });
  for(var j=0;j<=3;j++) f.line(gx0, gy0+j*gh/3, gx0+gw, gy0+j*gh/3, { c:C.faint, w:1 });
  f.line(gx0+13, gy0+50, gx0+88, gy0+13, { c:C.flat, w:2.6 });
  f.dot(gx0+13, gy0+50, { r:3.4, c:C.ink }); f.dot(gx0+88, gy0+13, { r:3.4, c:C.ink });
  /* polar disc */
  var px = 318;
  for(var k=1;k<=3;k++) f.circle(px, gy, R0*k/3, { c:C.faint, w:1 });
  f.circle(px, gy, R0, { c:C.ground, w:1.8 });
  for(var m=0;m<8;m++){ var e=FIG.polar(px, gy, R0, m*45); f.line(px, gy, e[0], e[1], { c:C.faint, w:0.8 }); }
  var P1 = FIG.polar(px, gy, 22, 128), P2 = FIG.polar(px, gy, 30, 20);
  f.line(P1[0], P1[1], P2[0], P2[1], { c:C.flat, w:2.6 });
  f.dot(P1[0], P1[1], { r:3.4, c:C.ink }); f.dot(P2[0], P2[1], { r:3.4, c:C.ink });
  f.note(62,  28, "globe",         { size:10, anchor:"middle" });
  f.note(190, 28, "cartesian map", { size:10, anchor:"middle" });
  f.note(318, 28, "polar map",     { size:10, anchor:"middle" });
  f.note(62,  146, "arc",             { size:9, anchor:"middle" });
  f.note(190, 146, "straight line",   { size:9, anchor:"middle" });
  f.note(318, 146, "straight chord",  { size:9, anchor:"middle" });
  f.notToScale("shapes not at a common size");
  f.mountIn(document.getElementById("distfig0"));

  /* --- 1 : cos sigma = ... , d = R sigma --------------------------------- */
  f = FIG.make({ w:380, h:200, alt:"The central angle sigma and the radius R give the arc; latitude and longitude difference are the angles that set sigma" });
  var ox = 96, oy = 104, RR = 62;
  f.circle(ox, oy, RR, { c:C.ground, w:1.8 });
  var Q1 = FIG.polar(ox, oy, RR, 118), Q2 = FIG.polar(ox, oy, RR, 32);
  f.line(ox, oy, Q1[0], Q1[1], { c:C.soft, w:1.4 });
  f.seg(ox, oy, Q2[0], Q2[1], { label:"R", tex:"R", c:C.soft, side:11 });
  f.path("M"+Q1[0]+" "+Q1[1]+"A"+RR+" "+RR+" 0 0 1 "+Q2[0]+" "+Q2[1], { c:C.globe, w:3 });
  f.dot(ox, oy, { r:3.2, c:C.ink });
  f.dot(Q1[0], Q1[1], { r:3.4, c:C.ink }); f.dot(Q2[0], Q2[1], { r:3.4, c:C.ink });
  f.angle(ox, oy, 26, 32, 118, { label:"\u03c3", tex:"\\sigma", c:C.globe, pad:12 });
  f.txt(ox - 4, oy + RR + 22, "d = R\u03c3", { tex:"d = R\\sigma", c:C.globe, anchor:"middle", size:11 });
  /* the inputs, seen from above the pole: two meridians and the angle between */
  var bx = 292, by = 116, RB = 52;
  f.circle(bx, by, RB, { c:C.ground, w:1.6 });
  for(var t=0;t<12;t++){ var g=FIG.polar(bx,by,RB,t*30); f.line(bx,by,g[0],g[1],{ c:C.faint, w:0.7 }); }
  var S1 = FIG.polar(bx, by, 30, 132), S2 = FIG.polar(bx, by, 44, 34);
  f.line(bx, by, S1[0], S1[1], { c:C.soft, w:1.2 });
  f.txt(bx - 58, by + 40, "90\u00b0\u2212\u03c6", { tex:"90\\deg-\\varphi", c:C.soft, anchor:"middle", size:10 });
  f.line(bx, by, S2[0], S2[1], { c:C.soft, w:1.2 });
  f.dot(S1[0], S1[1], { r:3.4, c:C.ink }); f.dot(S2[0], S2[1], { r:3.4, c:C.ink });
  f.dot(bx, by, { r:3, c:C.ink });
  f.angle(bx, by, 18, 34, 132, { label:"\u0394\u03bb", tex:"\\Delta\\lambda", c:C.flat, pad:11 });
  f.note(96,  30, "the angle at the centre", { size:9, anchor:"middle" });
  f.note(292, 30, "seen from above the pole", { size:9, anchor:"middle" });
  f.notToScale("directions only, no projection");
  f.mountIn(document.getElementById("distfig1"));

  /* --- 2 : plate carree --------------------------------------------------- */
  f = FIG.make({ w:380, h:190, alt:"On an equidistant cylindrical grid, x is R lambda and y is R phi, and the ruler is Pythagoras on the two differences" });
  var X0 = 58, Y0 = 40, W = 250, H = 96;
  for(var i=0;i<=5;i++) f.line(X0+i*W/5, Y0, X0+i*W/5, Y0+H, { c:C.faint, w:1 });
  for(var j=0;j<=3;j++) f.line(X0, Y0+j*H/3, X0+W, Y0+j*H/3, { c:C.faint, w:1 });
  var a = [X0 + W*0.2, Y0 + H*0.78], b = [X0 + W*0.8, Y0 + H*0.22];
  f.dash(a[0], a[1], b[0], a[1], { c:C.soft, w:1.1, dash:"4 3" });
  f.dash(b[0], a[1], b[0], b[1], { c:C.soft, w:1.1, dash:"4 3" });
  f.line(a[0], a[1], b[0], b[1], { c:C.flat, w:2.8 });
  f.dot(a[0], a[1], { r:3.6, c:C.ink }); f.dot(b[0], b[1], { r:3.6, c:C.ink });
  f.seg(a[0], a[1] + 16, b[0], a[1] + 16, { label:"\u0394\u03bb", tex:"\\Delta\\lambda", c:C.soft, side:-11 });
  f.seg(b[0] + 16, a[1], b[0] + 16, b[1], { label:"\u0394\u03c6", tex:"\\Delta\\varphi", c:C.soft, side:-13 });
  f.txt(X0 - 26, Y0 + H/2, "y = R\u03c6", { tex:"y = R\\varphi", c:C.soft, anchor:"middle", size:10 });
  f.txt(X0 + W/2, Y0 + H + 40, "x = R\u03bb", { tex:"x = R\\lambda", c:C.soft, anchor:"middle", size:10 });
  f.note(190, 26, "every degree of longitude drawn the same width", { size:9, anchor:"middle" });
  f.notToScale("equal squares are the projection itself");
  f.mountIn(document.getElementById("distfig2"));

  /* --- 3 : the azimuthal-equidistant disc --------------------------------- */
  f = FIG.make({ w:380, h:196, alt:"On the polar disc a point's radius is R times its colatitude and its bearing is its longitude; the ruler is the law of cosines on that triangle" });
  var dx = 172, dy = 108, RD = 78;
  for(var k=1;k<=4;k++) f.circle(dx, dy, RD*k/4, { c:C.faint, w:1 });
  f.circle(dx, dy, RD, { c:C.ground, w:1.8 });
  for(var m=0;m<12;m++){ var q = FIG.polar(dx, dy, RD, m*30); f.line(dx, dy, q[0], q[1], { c:C.faint, w:0.7 }); }
  var T1 = FIG.polar(dx, dy, 40, 140), T2 = FIG.polar(dx, dy, 66, 28);
  f.seg(dx, dy, T1[0], T1[1], { label:"r\u2081", tex:"r_1", c:C.soft, side:-11 });
  f.seg(dx, dy, T2[0], T2[1], { label:"r\u2082", tex:"r_2", c:C.soft, side:11 });
  f.line(T1[0], T1[1], T2[0], T2[1], { c:C.flat, w:2.8 });
  f.dot(dx, dy, { r:3.2, c:C.ink });
  f.dot(T1[0], T1[1], { r:3.6, c:C.ink }); f.dot(T2[0], T2[1], { r:3.6, c:C.ink });
  f.angle(dx, dy, 22, 28, 140, { label:"\u0394\u03bb", tex:"\\Delta\\lambda", c:C.flat, pad:12 });
  f.note(dx, dy + RD + 20, "pole at the centre", { size:9, anchor:"middle" });
  f.txt(300, 70, "r = R(\u03c0/2 \u2212 \u03c6)", { tex:"r = R(\\pi/2-\\varphi)", c:C.soft, anchor:"middle", size:10 });
  f.txt(300, 92, "\u03b8 = \u03bb", { tex:"\\theta = \\lambda", c:C.soft, anchor:"middle", size:10 });
  f.notToScale("only the ring spacing is meaningful");
  f.mountIn(document.getElementById("distfig3"));

  /* --- 4 : is r an even function of latitude? ----------------------------- */
  f = FIG.make({ w:380, h:204, alt:"Plus and minus the same latitude: mirror parallels on a globe, two different radii on the disc" });
  var ex = 92, ey = 108, RE = 60;
  f.circle(ex, ey, RE, { c:C.ground, w:1.8 });
  f.ellipse(ex, ey, RE, 16, { c:C.ink, w:1.4 });
  f.ellipse(ex, ey - 30, 47, 11, { c:C.globe, w:1.6 });
  f.ellipse(ex, ey + 30, 47, 11, { c:C.globe, w:1.6 });
  f.txt(ex + RE + 10, ey - 30, "\u03c6",  { tex:"\\varphi",  c:C.globe, size:11 });
  f.txt(ex + RE + 10, ey + 34, "\u2212\u03c6", { tex:"-\\varphi", c:C.globe, size:11 });
  f.note(ex, ey + RE + 22, "mirror parallels", { size:9, anchor:"middle" });
  var fx = 280, fy = 108, RF = 66;
  f.circle(fx, fy, RF, { c:C.ground, w:1.8 });
  f.circle(fx, fy, RF*0.30, { c:C.globe, w:1.6 });
  f.circle(fx, fy, RF*0.78, { c:C.globe, w:1.6 });
  f.dot(fx, fy, { r:3, c:C.ink });
  f.seg(fx, fy, fx + RF*0.30*0.71, fy - RF*0.30*0.71, { label:"r(\u03c6)", tex:"r(\\varphi)", c:C.soft, side:-15 });
  f.seg(fx, fy, fx - RF*0.78*0.71, fy + RF*0.78*0.71, { label:"r(\u2212\u03c6)", tex:"r(-\\varphi)", c:C.soft, side:-15 });
  f.note(fx, fy + RF + 22, "two different rings", { size:9, anchor:"middle" });
  f.note(92,  30, "globe", { size:10, anchor:"middle" });
  f.note(280, 30, "disc",  { size:10, anchor:"middle" });
  f.notToScale("shapes not at a common size");
  f.mountIn(document.getElementById("distfig4"));

  /* --- 5 : the radius of one parallel, in each model ---------------------- */
  f = FIG.make({ w:380, h:196, alt:"The same parallel: on a globe its radius is R cos phi, on the disc it is R times the colatitude" });
  var ax = 94, ay = 110, RA = 62;
  f.circle(ax, ay, RA, { c:C.ground, w:1.8 });
  f.dash(ax, ay - RA - 16, ax, ay + RA + 16, { c:C.faint, w:1, dash:"3 4" });
  f.ellipse(ax, ay, RA, 16, { c:C.faint, w:1.1 });
  var py = ay - 36, pr = Math.sqrt(RA*RA - 36*36);
  f.ellipse(ax, py, pr, 12, { c:C.globe, w:2 });
  f.line(ax, py, ax + pr, py, { c:C.globe, w:2 });
  f.dot(ax + pr, py, { r:3, c:C.globe });
  f.txt(ax + pr/2, py - 16, "R cos\u03c6", { tex:"R\\cos\\varphi", c:C.globe, anchor:"middle", size:10 });
  f.line(ax, ay, ax + pr, py, { c:C.soft, w:1.1 });
  f.angleAt(ax, ay, 30, [ax + RA, ay], [ax + pr, py], { label:"\u03c6", tex:"\\varphi", c:C.soft, pad:10 });
  var cx2 = 284, cy2 = 110, RC = 70;
  f.circle(cx2, cy2, RC, { c:C.ground, w:1.8 });
  f.circle(cx2, cy2, RC*0.46, { c:C.flat, w:2 });
  f.dot(cx2, cy2, { r:3, c:C.ink });
  f.seg(cx2, cy2, cx2 + RC*0.46*0.71, cy2 - RC*0.46*0.71, { c:C.flat });
  f.txt(cx2, cy2 - RC*0.46 - 12, "R(\u03c0/2\u2212\u03c6)", { tex:"R(\\pi/2-\\varphi)", c:C.flat, anchor:"middle", size:10 });
  f.note(94,  30, "globe: the parallel's own radius", { size:9, anchor:"middle" });
  f.note(284, 30, "disc: the same parallel",          { size:9, anchor:"middle" });
  f.notToScale("shapes not at a common size");
  f.mountIn(document.getElementById("distfig5"));

  /* --- 6 : two legs, one central angle ------------------------------------ */
  f = FIG.make({ w:380, h:186, alt:"A leg over the pole and a leg along the equator, drawn in their own planes, each subtending the same angle at the centre" });
  var mx = 96, my = 100, RM = 62;
  f.circle(mx, my, RM, { c:C.ground, w:1.8 });
  f.dash(mx - RM - 10, my, mx + RM + 10, my, { c:C.faint, w:1, dash:"3 4" });
  var L1 = FIG.polar(mx, my, RM, 120), L2 = FIG.polar(mx, my, RM, 60);
  f.path("M"+L1[0]+" "+L1[1]+"A"+RM+" "+RM+" 0 0 1 "+L2[0]+" "+L2[1], { c:C.globe, w:3 });
  f.line(mx, my, L1[0], L1[1], { c:C.soft, w:1.2 });
  f.line(mx, my, L2[0], L2[1], { c:C.soft, w:1.2 });
  f.dot(L1[0], L1[1], { r:3.4, c:C.ink }); f.dot(L2[0], L2[1], { r:3.4, c:C.ink });
  f.dot(mx, my - RM, { r:3, c:C.soft });
  f.angle(mx, my, 24, 60, 120, { label:"\u03c3", tex:"\\sigma", c:C.globe, pad:12 });
  var nx = 284, ny = 100, RN = 62;
  f.circle(nx, ny, RN, { c:C.ground, w:1.8 });
  var M1 = FIG.polar(nx, ny, RN, 30), M2 = FIG.polar(nx, ny, RN, -30);
  f.path("M"+M1[0]+" "+M1[1]+"A"+RN+" "+RN+" 0 0 1 "+M2[0]+" "+M2[1], { c:C.globe, w:3 });
  f.line(nx, ny, M1[0], M1[1], { c:C.soft, w:1.2 });
  f.line(nx, ny, M2[0], M2[1], { c:C.soft, w:1.2 });
  f.dot(M1[0], M1[1], { r:3.4, c:C.ink }); f.dot(M2[0], M2[1], { r:3.4, c:C.ink });
  f.angle(nx, ny, 24, -30, 30, { label:"\u03c3", tex:"\\sigma", c:C.globe, pad:12 });
  f.note(96,  30, "the meridian plane",  { size:9, anchor:"middle" });
  f.note(284, 30, "the equatorial plane", { size:9, anchor:"middle" });
  f.note(96,  174, "a leg over the pole",     { size:9, anchor:"middle" });
  f.note(284, 174, "a leg along the equator", { size:9, anchor:"middle" });
  f.notToScale("two slices of one sphere, side by side");
  f.mountIn(document.getElementById("distfig6"));
}

/* ----------------------------------------------------------------------------
   THE OPENING PAIR of fou (v115). Last of the openers.

   THE PLAN CALLED THIS TAB BLOCKED, AND IT WAS BLOCKED FOR THE OTHER OPTION.
   The only opener anyone had considered was PROMOTING the latitude curve
   (fouLatCanvas) to the top, and its caption says "the table below" -- which
   stops being true the moment the figure moves. Drawing a new one moves
   nothing, so the block does not apply. Both of fou's positional references
   ("the table below" in fp-fcap3, "three sections below" in fp-fcap2) were
   re-checked after this went in and are still correct.

   WHAT IT SHOWS. One rotation arrow, Omega -- same direction and the SAME
   LENGTH at every station, because there is one axis and it turns once a day
   whatever the shape of the ground. It is set down at four stations on the same
   20 000 km walk out from the pole. Only the part of it perpendicular to the
   local floor can turn a swing plane, and that part is drawn in teal, signed.
   Flat: every floor is square to the axis, so the teal arrow is the whole of
   Omega at all four, centre to rim. Globe: the floor tilts as you walk, the
   teal arrow shrinks to a ring at the equator -- zero, drawn as nothing -- and
   past it points the OTHER SIDE of the floor. Dashed = below the floor.

   THE FLAT MODEL IS AT ITS STRONGEST (rule 2). The spinning disc, not the
   stationary one. The stationary flat Earth predicts zero precession
   everywhere and dies on its first afternoon in Paris; opening on it would be
   presenting the flat model at its weakest. It keeps its column in the model
   table, where the reader can see it lose on its own terms.

   trueScale() AGAIN, for the same reason as the mag opener and by the same
   construction: centre->rim on the disc = pole->pole ALONG the globe = 20 000
   km, so the globe's radius is 20000/pi km and both shapes share one
   km-per-pixel. The two openers are deliberately built on the same skeleton --
   same radius, same walk, same four stations -- so that a reader who has seen
   one recognises the other.

   WHAT THE ARROWS DO NOT CLAIM. Their absolute length is arbitrary: Omega is
   an angular rate, not a distance, and nothing on this page fixes how many
   pixels an arcsecond per second is worth. What IS exact is the RATIO of teal
   to black at each station, which is sin(phi), and the caption says so rather
   than letting the stamp imply more than it means.

   TWO THINGS THE RENDER CAUGHT. Both invisible to every audit:
     1. THE FLOOR SEGMENTS RAN TOGETHER. At 16 px half-length the four tangents
        touched and read as one continuous brown polygon hugging the globe --
        a second surface, floating outside the first. 11 px separates them and
        the tilt becomes the thing you see.
     2. THE "spin axis" LABELS SAT ON THE TITLES. Both axes were labelled at the
        top; on the flat half the label landed inside "A - flat disc, 1 turn/
        day". Both axis lines now run below their shape and are labelled there.
   -------------------------------------------------------------------------- */
export function drawFouPair(){
  var host = document.getElementById("fouPairFig");
  if(!host) return;
  var C = FIG.C, TEAL = C.sea;
  var f = FIG.make({ w:380, h:214,
    alt:"One rotation arrow, four floors: on a spinning disc every floor is square to the axis, on a globe the floor tilts until the axis lies flat in it" });

  var RG = 40;                              // globe radius, px
  var KMPX = (20000 / Math.PI) / RG;        // one km-per-pixel for both shapes
  var DISC = 20000 / KMPX;                  // = pi * RG
  var OM = 26;                              // the rotation arrow, one length everywhere

  /* one station: the floor, the axis arrow, and the part of it that is
     perpendicular to that floor. nx,ny = the outward local vertical. */
  var station = function(px, py, nx, ny, sinphi, inside){
    var tx = -ny, ty = nx;                                        // the floor, tangent
    f.line(px - tx*11, py - ty*11, px + tx*11, py + ty*11, { c:C.ground, w:3 });
    /* the part that turns the swing plane: along the local vertical, signed */
    var L = OM * sinphi;
    if(Math.abs(L) > 0.8)
      f.arrow(px, py, px + nx*L, py + ny*L,
              { c:TEAL, w:4.5, head:9, dash: L < 0 ? "3 3" : null });
    else
      f.circle(px, py, 3, { c:TEAL, w:1.8, fill:C.paper });
    /* Omega itself: same direction, same length, at every station */
    f.arrow(px, py, px, py - OM, { c:C.ink, w:1.5, head:6, dash: inside ? "3 3" : null });
  };

  /* ================= A - the spinning disc ================================= */
  var x0 = 22, ys = 95;
  f.line(x0 - 10, ys, x0 + DISC, ys, { c:C.faint, w:1.4 });
  f.line(x0 + DISC, ys, x0 + DISC, ys + 7, { c:C.faint, w:1.4 });
  f.dash(x0, ys - 62, x0, ys + 46, { c:C.faint, dash:"2 4", w:1 });   // the spin axis
  f.note(x0 + 5, ys + 50, "spin axis", { size:9 });

  var walk = [0, 5000, 10000, 15000];
  for(var i = 0; i < walk.length; i++)
    station(x0 + walk[i]/KMPX, ys, 0, -1, 1, false);
  f.txt(x0 + 6, ys - OM - 6, "\u03a9", { tex:"\\Omega", c:C.ink });

  /* ================= B - the globe ========================================= */
  var cx = 256, cy = 108;
  f.circle(cx, cy, RG, { c:C.faint, w:1.4 });
  f.dash(cx, cy + RG + 26, cx, cy - RG - 34, { c:C.faint, dash:"2 4", w:1 });
  f.note(cx + 5, cy + RG + 30, "spin axis", { size:9 });

  var lats = [90, 45, 0, -45];
  for(var j = 0; j < lats.length; j++){
    var th = (90 - lats[j]) * Math.PI/180, st = Math.sin(th), ct = Math.cos(th);
    var gx = cx + RG*st, gy = cy - RG*ct;
    station(gx, gy, st, -ct, Math.sin(lats[j]*Math.PI/180), lats[j] < 0);
    if(lats[j] === 45){
      f.txt(gx + 20, gy - 4, "\u03a9 sin \u03c6", { tex:"\\Omega\\sin\\varphi", c:TEAL, size:11 });
    }
  }
  f.txt(cx + 5, cy - RG - OM - 6, "\u03a9", { tex:"\\Omega", c:C.ink });

  /* ---- frame ------------------------------------------------------------- */
  f.line(190, 22, 190, 180, { c:C.faint, w:1 });
  f.txt(8,   30, "A \u00b7 flat disc, 1 turn/day", { sans:true, c:C.flat,  size:11 });
  f.txt(198, 30, "B \u00b7 globe",                  { sans:true, c:C.globe, size:11 });
  f.note(8,   194, "same rate at every station",        { size:9 });
  f.note(198, 194, "zero at the equator, then reversed", { size:9 });
  f.note(190, 209, "the same walk out from the pole", { size:9, anchor:"middle" });
  f.trueScale();
  f.mountIn(host);
}

/* ----------------------------------------------------------------------------
   THE OPENING PAIR of mag (v114). The same 20 000 km walk out from the north
   magnetic pole, drawn in each shape, with a free needle set down at four
   points along it. Nothing measured is on the drawing: each row of needles is
   its own model's forced prediction, and the reader cannot tell from the
   picture which one is right -- that is what makes it a divergence figure and
   not an argument.

   WHY IT MAY SAY "true scale", WHICH ALMOST NOTHING ELSE ON THIS PAGE MAY.
   MAG.RKM already equates centre->rim on the disc with pole->pole ALONG the
   globe, so the globe's radius is 20000/pi km = the real 6371 km to within a
   percent, and the two shapes share one km-per-pixel. The disc is pi times
   wider than the globe's radius because the model says so, not because it
   looked better. Do not rescale either half independently.

   THE FLAT MODEL IS AT ITS STRONGEST HERE (rule 2). Layout (1), and its buried
   magnet is at d = 10000/sqrt(2) km, the depth that puts its dip-zero circle
   exactly on the measured magnetic equator -- the flat model's one free
   parameter, spent in its favour. It still stalls: tan I = (2d^2 - r^2)/(3dr)
   is monotonically decreasing in r, so the extreme dip anywhere on the disc is
   at the rim, and it is -35.3 deg. That is the whole figure.

   THE ANGLE ARC IS ON THE POLEWARD SIDE in both halves, deliberately: the dip
   is the angle between the local horizontal and the needle's RED (north-
   seeking) end, and drawing it on the other side gives the same number by
   vertical angles while quietly teaching the wrong convention. The two arcs
   are at the same station -- one third of the way along the walk -- so their
   very different openings are the divergence, read off the drawing.
   -------------------------------------------------------------------------- */
export function drawMagPair(){
  var host = document.getElementById("magPairFig");
  if(!host) return;
  var C = FIG.C, RED = "#b91c1c";
  var f = FIG.make({ w:380, h:214,
    alt:"The same 20,000 km walk from the north magnetic pole: a free needle on a flat disc with a buried magnet, and on a globe with a central dipole" });

  /* ---- true scale, and this is what makes it true -----------------------
     MAG.RKM: pole -> rim on the disc equals pole -> pole ALONG the globe, so
     the globe's radius is 20000/pi km and both shapes are drawn at one
     km-per-pixel.  Nothing here is a chosen size. */
  var RG = 40;                                  // globe radius, px
  var KMPX = (20000 / Math.PI) / RG;            // km per px, the ONE scale
  var DISC = 20000 / KMPX;                      // = pi * RG
  var DPX  = (10000 / Math.SQRT2) / KMPX;       // flat (1): the calibrated depth

  var STAND = 12, HALF = 11;                    // the needle's stalk and half-length

  /* a free needle: red half = north-seeking end, along dir (a screen vector) */
  var needle = function(px, py, ux, uy, nx, ny, mark){
    var L = Math.hypot(ux, uy); ux /= L; uy /= L;          // field direction
    var cx = px + nx * STAND, cy = py + ny * STAND;        // pivot, on its stalk
    f.line(px, py, cx, cy, { c:C.faint, w:1.1 });
    f.line(cx, cy, cx - ux*HALF, cy - uy*HALF, { c:C.ink, w:2.6 });
    f.line(cx, cy, cx + ux*HALF, cy + uy*HALF, { c:RED,   w:2.6 });
    f.circle(cx, cy, 2, { c:C.ink, w:1, fill:C.paper });
    return [cx, cy, ux, uy];
  };

  /* ================= A - the flat disc, magnet under the centre ============ */
  var x0 = 22, ys = 95, my = ys + DPX;         // centre, surface, magnet

  /* field of a vertical dipole at (x0,my), moment pointing DOWN. Screen y is
     already down, so no sign gymnastics: m = (0,+1). */
  var flatB = function(px, py){
    var dx = px - x0, dy = py - my, r = Math.hypot(dx, dy);
    var mr = dy / r;                                   // m.rhat
    return [3*mr*dx/r, 3*mr*dy/r - 1];
  };
  /* its field lines: r = r0 sin^2(theta), theta from the DOWN axis */
  var flatLine = function(r0, above){
    var pts = [], seg = [];
    for(var t = 1; t <= 179; t += 1){
      var a = t * Math.PI/180, r = r0 * Math.sin(a)*Math.sin(a);
      var px = x0 + r*Math.sin(a), py = my + r*Math.cos(a);
      var ok = (above ? py <= ys : py >= ys) && px <= 184 && py >= 40 && py <= 182;
      if(ok) seg.push([px, py]);
      else if(seg.length){ pts.push(seg); seg = []; }
    }
    if(seg.length) pts.push(seg);
    pts.forEach(function(s){
      if(s.length < 2) return;
      var d = "M" + s[0][0].toFixed(1) + " " + s[0][1].toFixed(1);
      for(var i = 1; i < s.length; i++) d += "L" + s[i][0].toFixed(1) + " " + s[i][1].toFixed(1);
      f.path(d, { c:C.flat, w:0.8, dash: above ? null : "2 3" });
    });
  };
  flatLine(163.2, true);   // the loop that clears the ground and comes back on the disc

  f.line(x0 - 10, ys, x0 + DISC, ys, { c:C.ground, w:2.2 });
  f.line(x0 + DISC, ys, x0 + DISC, ys + 7, { c:C.ground, w:2.2 });   // the rim

  /* the buried magnet: north pole downwards, which is what puts the needle
     nose-down over the centre, as it is in the Arctic */
  f.line(x0, my - 8, x0, my, { c:C.ink, w:5 });
  f.line(x0, my, x0, my + 8, { c:RED,  w:5 });
  f.dash(x0, ys + 3, x0, my - 9, { c:C.faint, dash:"2 4", w:1 });
  f.note(x0 + 9, my + 4, "buried magnet", { size:9 });

  var flatR = [0, 6666.7, 13333.3, 20000];
  for(var i = 0; i < flatR.length; i++){
    var px = x0 + flatR[i]/KMPX, py = ys;
    var b = flatB(px, py - 0.001);
    f.line(px, ys - 3, px, ys + 3, { c:C.ground, w:1 });
    var n = needle(px, py, b[0], b[1], 0, -1, i === 1);
    if(i === 1){
      /* the dip is measured from the local horizontal ON THE POLEWARD SIDE:
         that is the side the red end leans to, and the side the arc must be on */
      f.dash(n[0] + 6, n[1], n[0] - 30, n[1], { c:C.faint, dash:"4 3" });
      f.angleAt(n[0], n[1], 20, [n[0] - 30, n[1]], [n[0] + n[2]*24, n[1] + n[3]*24],
                { label:"I", tex:"I", c:C.ink, w:1.6, pad:11 });
    }
  }

  /* ================= B - the globe, dipole at the centre =================== */
  var cx = 264, cy = 110;

  var globeLine = function(th0){
    var r0 = RG / (Math.sin(th0*Math.PI/180)*Math.sin(th0*Math.PI/180));
    var d = "";
    for(var t = th0; t <= 180 - th0 + 0.01; t += 1){
      var a = t*Math.PI/180, r = r0*Math.sin(a)*Math.sin(a);
      var px = cx + r*Math.sin(a), py = cy - r*Math.cos(a);
      d += (d ? "L" : "M") + px.toFixed(1) + " " + py.toFixed(1);
    }
    f.path(d, { c:C.globe, w:0.8 });
  };
  globeLine(50); globeLine(62);

  f.circle(cx, cy, RG, { c:C.ground, w:2.2 });
  f.line(cx, cy - 8, cx, cy, { c:C.ink, w:5 });
  f.line(cx, cy, cx, cy + 8, { c:RED,  w:5 });
  f.note(cx + 9, cy + 4, "dipole", { size:9 });

  var lats = [90, 30, -30, -90];
  for(var j = 0; j < lats.length; j++){
    var th = (90 - lats[j]) * Math.PI/180;
    var st = Math.sin(th), ct = Math.cos(th);
    var gx = cx + RG*st, gy = cy - RG*ct;
    var bx = -3*st*ct, by = 2*ct*ct - st*st;     // Earth's sense: nose down in the north
    var g = needle(gx, gy, bx, by, st, -ct, j === 1);
    if(j === 1){
      /* h = the local horizontal towards the pole, i.e. decreasing colatitude */
      var hx = -ct, hy = -st;
      f.dash(g[0] - hx*6, g[1] - hy*6, g[0] + hx*30, g[1] + hy*30, { c:C.faint, dash:"4 3" });
      f.angleAt(g[0], g[1], 20, [g[0] + hx*30, g[1] + hy*30], [g[0] + g[2]*24, g[1] + g[3]*24],
                { label:"I", tex:"I", c:C.ink, w:1.6, pad:11 });
    }
  }

  /* ---- frame ------------------------------------------------------------- */
  f.line(190, 22, 190, 180, { c:C.faint, w:1 });
  f.txt(8,   30, "A \u00b7 flat \u2460", { sans:true, c:C.flat,  size:11 });
  f.txt(198, 30, "B \u00b7 globe",       { sans:true, c:C.globe, size:11 });
  f.note(8,   194, "far edge: the turn is unfinished", { size:9 });
  f.note(198, 194, "far pole: the turn is complete",   { size:9 });
  f.note(190, 209, "the same 20,000 km out from the north magnetic pole",
         { size:9, anchor:"middle" });
  f.trueScale();
  f.mountIn(host);
}

export function drawDipPair(){
  var host = document.getElementById("dipPairFig");
  if(!host) return;
  var C = FIG.C, INK = "#151a21";
  var f = FIG.make({ w:380, h:186,
    alt:"On a plane the sea horizon stays at eye level; on a globe it sits below eye level by the dip angle" });

  var draw = function(x0, globe){
    var ey = 74, gy = 128, ox = x0 + 26, xr = x0 + 168;
    if(globe){
      var drop = 30, R = (drop*drop + (xr-ox)*(xr-ox)) / (2*drop), cy = gy + R;
      var surf = function(x){ return cy - Math.sqrt(R*R - (x-ox)*(x-ox)); };
      var d = "M" + (x0+10) + " " + surf(x0+10).toFixed(1);
      for(var x = x0+18; x <= x0+172; x += 8) d += "L" + x + " " + surf(x).toFixed(1);
      f.path(d, { c:C.sea, w:2 });
      /* the tangent from the eye: touch point computed, not chosen */
      var e = gy - ey, L = Math.sqrt((R+e)*(R+e) - R*R);
      var phi = Math.acos(R / (R + e));
      var T = [ox + R*Math.sin(phi), cy - R*Math.cos(phi)];
      f.line(ox, ey, T[0], T[1], { c:C.sea, w:1.7 });
      f.dot(T[0], T[1], { r:3, c:C.sea });
      f.angleAt(ox, ey, 62, [x0+174, ey], T, { label:"\u03b4", tex:"\\delta", c:C.sea, pad:12 });
      f.txt(x0 + 8, 178, "horizon below eye level", { sans:true, c:C.soft, size:9 });
    } else {
      f.line(x0+10, gy, x0+174, gy, { c:C.sea, w:2 });
      f.line(ox, ey, x0+174, ey, { c:C.sea, w:1.7 });
      f.txt(x0 + 168, ey - 6, "\u03b4 = 0", { anchor:"end", c:C.soft, size:10 });
      f.txt(x0 + 8, 178, "sea meets eye level: nothing to measure", { sans:true, c:C.soft, size:9 });
    }
    f.line(ox, gy, ox, ey, { c:INK, w:2 });
    f.txt(ox - 8, (gy + ey)/2 + 4, "h", { tex:"h", c:INK, anchor:"end" });
    f.dot(ox, ey, { r:4, c:INK });
    f.dash(ox, ey, x0 + 174, ey, { c:C.faint, dash:"5 4" });
  };

  draw(0, false);
  f.line(190, 20, 190, 160, { c:C.faint, w:1 });
  draw(196, true);
  f.txt(8, 30, "A \u00b7 flat plane", { sans:true, c:C.flat, size:11 });
  f.txt(204, 30, "B \u00b7 globe", { sans:true, c:C.sea, size:11 });
  f.notToScale("curvature shown with a small planet");
  f.mountIn(host);
}

export function drawAzimOpening(){
  var C = FIG.C;
  var f = FIG.make({ w:380, h:206,
    alt:"What you measure: the compass bearing of a body and its height above the horizontal" });
  var gy = 158, ox = 132;                       // the plane, and where you stand on it

  /* THE COMPASS DISC IS AN INSTRUMENT, NOT TERRAIN. It is drawn small and local,
     with no ground line running across the scene, because a long flat ground was
     read -- correctly, by a real reader -- as the figure conceding a flat Earth.
     It is named, so it cannot be mistaken for the surface. */
  f.ellipse(ox, gy, 66, 17, { c:C.faint, dash:"4 4", w:1.2 });
  var card = [[0,"E"],[90,"N"],[180,"W"],[270,"S"]];
  for(var i=0;i<card.length;i++){
    var a = card[i][0] * Math.PI/180;
    var px = ox + 66*Math.cos(a), py = gy - 17*Math.sin(a);
    f.line(ox + 59*Math.cos(a), gy - 15*Math.sin(a), px, py, { c:C.faint, w:1.2 });
    f.txt(px + (card[i][1]==="W" ? -5 : card[i][1]==="E" ? 5 : 0),
          py + (card[i][1]==="S" ? 12 : card[i][1]==="N" ? -5 : 4),
          card[i][1], { c:C.soft,
          anchor: card[i][1]==="W" ? "end" : card[i][1]==="E" ? "start" : "middle" });
  }
  f.txt(ox, gy + 44, "your horizontal plane", { anchor:"middle", sans:true, c:C.soft });

  /* you */
  f.vertical(ox, gy, 30, { c:C.ink, w:2.4 });
  f.dot(ox, gy - 36, { r:5, c:C.ink });
  f.txt(ox - 11, gy - 22, "you", { sans:true, c:C.ink, anchor:"end" });

  /* the body, the line you look along, and that line's shadow on the plane */
  var B = [306, 52], t = -28*Math.PI/180;
  var Fh = [ox + 66*Math.cos(t), gy - 17*Math.sin(t)];
  f.dot(B[0], B[1], { r:7, c:C.flat });
  f.txt(B[0] + 11, B[1] - 6, "body", { sans:true, c:C.flat });
  f.line(ox, gy - 36, B[0], B[1], { c:C.flat, w:1.7 });
  f.dash(ox, gy - 36, Fh[0], Fh[1], { c:C.faint });
  f.dash(B[0], B[1], Fh[0], Fh[1], { c:C.faint });

  /* A lies IN the plane, so it is an arc of that same ellipse. Parametric
     angles: -28 is the body's direction, 90 is north -- the very numbers that
     placed the cardinal marks. h lives in a vertical plane seen edge-on, where a
     circular arc is the right one. */
  f.angleFlat(ox, gy, 30, 8, -28, 90, { label:"A", tex:"A", c:C.globe, pad:13 });
  f.angleAt(ox, gy - 36, 40, Fh, B, { label:"h", tex:"h", c:C.globe, pad:13 });

  f.notToScale("angles shown are arbitrary");
  f.mountIn(document.getElementById("azfig0"));
}

export function drawAzimSymbols(){
  var C = FIG.C, P = FIG.polar, f, cx, cy, R;

  /* --- 1. phi_sub = delta, lambda_sub = alpha - GMST : the sub-body point --- */
  f = FIG.make({ w:380, h:186, alt:"The sub-body point: the one place on Earth where the body is straight overhead" });
  cx = 172; cy = 104; R = 70;
  f.circle(cx, cy, R, { c:C.ink, w:1.8 });
  f.ellipse(cx, cy, R, 19, { dash:"4 4" });
  f.line(cx, cy - R - 15, cx, cy - R, { c:C.faint, w:1.2 });
  f.txt(cx, cy - R - 20, "N", { anchor:"middle", c:C.soft });
  var Psub = P(cx, cy, R, 38);
  f.line(cx, cy, Psub[0], Psub[1], { c:C.globe, w:1.7 });
  f.dot(Psub[0], Psub[1], { r:4.5, c:C.globe });
  f.angle(cx, cy, 36, 0, 38, { label:"\u03c6", tex:"\\phi_{\\text{sub}}", c:C.globe, pad:11 });
  f.dot(cx, cy, { r:3, c:C.ink });
  f.txt(cx - 7, cy + 15, "O", { c:C.soft, anchor:"end" });
  /* the foot of the sub-point on the equator, and the longitude arc to it */
  var Fx = cx + R * Math.cos(38 * Math.PI / 180), Fy = cy + 19 * Math.sin(38 * Math.PI / 180) * 0.6;
  f.dash(Psub[0], Psub[1], Fx, Fy, { c:C.globe });
  f.dot(Fx, Fy, { r:3, c:C.globe });
  f.txt(Fx + 6, Fy + 15, "\u03bb", { c:C.globe, tex:"\\lambda_{\\text{sub}}" });
  var S = P(cx, cy, R + 54, 38);
  f.dot(S[0], S[1], { r:6, c:C.flat });
  f.txt(S[0] + 9, S[1] - 7, "body", { sans:true, c:C.flat });
  f.arrow(S[0] - 8, S[1] + 7, Psub[0] + 7, Psub[1] - 6, { c:C.flat, w:1.4, dash:"4 3" });
  f.notToScale();
  f.mountIn(document.getElementById("azfig1"));

  /* --- 2. A = atan2(...) : the bearing along a great circle ---------------- */
  f = FIG.make({ w:380, h:206, alt:"Bearing A: the angle at the observer between the meridian and the great circle to the sub-point" });
  cx = 190; cy = 112; R = 84;
  f.circle(cx, cy, R, { c:C.ink, w:1.8 });
  var N = P(cx, cy, R, 90), p1 = P(cx, cy, R, 158), p2 = P(cx, cy, R, 14);
  f.dot(N[0], N[1], { r:4, c:C.soft });
  f.txt(N[0] - 8, N[1] + 15, "N", { anchor:"end", c:C.soft });
  f.path("M" + p1[0] + " " + p1[1] + "A104 104 0 0 1 " + N[0] + " " + N[1], { c:C.faint, w:1.4, dash:"5 4" });
  f.path("M" + p1[0] + " " + p1[1] + "A128 128 0 0 0 " + p2[0] + " " + p2[1], { c:C.globe, w:1.9 });
  f.dot(p1[0], p1[1], { r:4.5, c:C.ink });
  f.txt(p1[0] - 8, p1[1] + 2, "you", { sans:true, c:C.ink, anchor:"end" });
  f.dot(p2[0], p2[1], { r:4.5, c:C.globe });
  f.txt(p2[0] + 8, p2[1] + 3, "sub-point", { sans:true, c:C.globe });
  f.angle(p1[0], p1[1], 28, 30, 74, { label:"A", tex:"A", c:C.globe, pad:11 });
  f.txt(cx, 202, "\u03c6\u2081 you  \u00b7  \u03c6\u2082 sub-point  \u00b7  \u0394\u03bb their longitude gap",
        { anchor:"middle", sans:true, c:C.soft });
  f.notToScale("arcs drawn on the disc");
  f.mountIn(document.getElementById("azfig2"));

  /* --- 3. rho = 90 - phi, theta = lambda : the flat map's own coordinates -- */
  f = FIG.make({ w:380, h:196, alt:"The azimuthal-equidistant disc: radius stands for co-latitude, angle for longitude" });
  cx = 190; cy = 98; R = 82;
  f.circle(cx, cy, R, { c:C.flat, w:2 });
  f.circle(cx, cy, R * 0.5, { c:C.faint, w:1, dash:"4 4" });
  f.dot(cx, cy, { r:4, c:C.flat });
  f.txt(cx - 6, cy - 8, "N", { c:C.flat, anchor:"end" });
  f.line(cx, cy, cx + R, cy, { c:C.faint, w:1.2, dash:"5 4" });
  f.txt(cx + R - 4, cy + 15, "\u03bb = 0", { c:C.soft, anchor:"end" });
  var q = P(cx, cy, R * 0.74, 62);
  f.seg(cx, cy, q[0], q[1], { label:"\u03c1", tex:"\\rho", c:C.flat, side:13 });
  f.dot(q[0], q[1], { r:4.5, c:C.flat });
  f.angle(cx, cy, 42, 0, 62, { label:"\u03b8", tex:"\\theta", c:C.flat, pad:12 });
  f.txt(cx, 192, "centre = north pole  \u00b7  rim = the far south",
        { anchor:"middle", sans:true, c:C.soft });
  f.trueScale();
  f.mountIn(document.getElementById("azfig3"));

  /* --- 4. sin(pi) = R / d : horizontal parallax ---------------------------
     WHAT THIS FIGURE HAS TO SURVIVE, and the v85 version did not. A reader
     without astronomy reads "sin \pi" as sin(3.14159) = 0 and stops. pi here is
     the ASTRONOMER'S NAME FOR AN ANGLE -- the one the Earth's radius subtends at
     the body -- and the figure's whole job is to show it as an angle in a
     triangle. Two consequences:
       * the right angle at T is drawn. It is not decoration: the tangent is
         perpendicular to the radius, and that perpendicularity is exactly what
         makes sin pi = R/d legal rather than approximate.
       * the arc is built with angleAt() from the two points its sides run to.
         The v85 version typed bearings 180 and 191 by hand; the second side
         actually runs at 170, so the arc was drawn mirrored below the axis,
         attached to nothing. That was the "endroit etrange" the owner saw, and
         it was a real bug, not a misreading. ------------------------------- */
  f = FIG.make({ w:380, h:168, alt:"Horizontal parallax: the angle the Earth's radius subtends at the body, with the right angle at the point of tangency" });
  cx = 78; cy = 88; R = 44;
  f.circle(cx, cy, R, { c:C.ink, w:1.8 });
  f.dot(cx, cy, { r:3, c:C.ink });
  f.txt(cx - 6, cy + 17, "O", { c:C.soft, anchor:"end" });
  var M = [330, 88];
  f.dot(M[0], M[1], { r:6, c:C.globe });
  f.txt(M[0], M[1] - 14, "body", { sans:true, c:C.globe, anchor:"middle" });
  var L = M[0] - cx, T = [cx + R * R / L, cy - R * Math.sqrt(L * L - R * R) / L];
  f.line(cx, cy, M[0], M[1], { c:C.faint, w:1.2, dash:"5 4" });   // O -- body
  f.line(cx, cy, T[0], T[1], { c:C.ink, w:1.7 });                 // the radius
  f.line(T[0], T[1], M[0], M[1], { c:C.globe, w:1.7 });           // the tangent
  f.rightAngle(T[0], T[1], [cx, cy], M);                          // why sin is legal
  f.dot(T[0], T[1], { r:3.5, c:C.ink });
  f.txt(T[0] - 4, T[1] - 8, "T", { c:C.soft, anchor:"end" });
  f.seg(cx, cy, T[0], T[1], { label:"R", tex:"R", c:C.soft, side:16 });
  f.seg(cx, cy + R + 20, M[0], cy + R + 20, { label:"d", tex:"d", c:C.soft, side:-13 });
  f.angleAt(M[0], M[1], 54, [cx, cy], T, { label:"\u03c0", tex:"\\pi", c:C.globe, pad:14 });
  f.txt(190, 160, "\u03c0 names this angle \u2014 it is not 3.14\u2026",
        { anchor:"middle", sans:true, c:C.soft });
  f.notToScale("d far shorter than it is");
  f.mountIn(document.getElementById("azfig4"));

  /* --- 5. d/R = b / (R sin theta) : the two-observer form ----------------- */
  f = FIG.make({ w:380, h:178, alt:"Two observers a baseline apart; the opening between their sight lines gives the distance" });
  cx = 74; cy = 92; R = 46;
  f.circle(cx, cy, R, { c:C.ink, w:1.8 });
  var A = P(cx, cy, R, 62), B = P(cx, cy, R, -62);
  f.dot(A[0], A[1], { r:4.5, c:C.ink });
  f.txt(A[0] - 7, A[1] - 5, "A", { c:C.ink, anchor:"end" });
  f.dot(B[0], B[1], { r:4.5, c:C.ink });
  f.txt(B[0] - 7, B[1] + 13, "B", { c:C.ink, anchor:"end" });
  f.seg(A[0], A[1], B[0], B[1], { label:"b", tex:"b", c:C.soft, side:-13 });
  var M2 = [322, 92];
  f.dot(M2[0], M2[1], { r:6, c:C.globe });
  f.txt(M2[0], M2[1] - 13, "body", { sans:true, c:C.globe, anchor:"middle" });
  f.line(A[0], A[1], M2[0], M2[1], { c:C.globe, w:1.5 });
  f.line(B[0], B[1], M2[0], M2[1], { c:C.globe, w:1.5 });
  f.seg(cx, cy + R + 22, M2[0], cy + R + 22, { label:"d", tex:"d", c:C.soft, side:-13 });
  f.angleAt(M2[0], M2[1], 52, A, B, { label:"\u03b8", tex:"\\theta", c:C.globe, pad:14 });
  f.notToScale("d far shorter than it is");
  f.mountIn(document.getElementById("azfig5"));
}

/* Quelles fonctions concernent quel onglet (les hôtes sont cherchés par id,
   une fonction listée deux fois -- drawSimHhSymbols, drawHhCnavSymbols --
   monte ce qu'elle trouve et ignore le reste). drawKeySwatches est
   appelée pour tout onglet portant une légende .figkey. */
export const SYMBOLS_BY_TAB = {
  elev: [drawSimPair, drawSimHhSymbols, drawSimFigSil],
  hh: [drawSimHhSymbols, drawHhCnavSymbols, drawHhFigSil],
  ref: [drawRefSymbols],
  cnav: [drawCnavPair, drawHhCnavSymbols],
  star: [drawStarSymbols],
  dist: [drawDistSymbols],
  dip: [drawDipPair, drawDipSymbols],
  grav: [drawGravPair, drawGravSymbols],
  fou: [drawFouPair, drawFouFormulaSymbols],
  seis: [drawSeisSymbols],
  mag: [drawMagPair, drawMagFormulaSymbols],
  sun: [drawSunSymbols],
  twi: [drawTwiSymbols],
  azim: [drawAzimOpening, drawAzimSymbols],
  surv: [drawSurvPair, drawSurvSymbols],
  gps: [drawGpsSymbols],
};

/** Monte tous les schémas d'un onglet (à appeler après que son DOM existe). */
export function drawSymbols(key) {
  for (const fn of SYMBOLS_BY_TAB[key] || []) {
    try { fn(); } catch (e) { console.warn(`[${key}] symbol figure skipped: ${e.message}`); }
  }
  try { drawKeySwatches(); } catch (e) { console.warn(`[${key}] key swatches skipped: ${e.message}`); }
}

/* Vignettes de l'accueil (buildHome du legacy, L24520 sq.). Le legacy clonait
   le <svg> déjà dessiné dans l'onglet cible ; ici les onglets sont montés
   à la demande, donc la vignette est DESSINÉE par le même générateur, dans
   un hôte qui porte l'id de la figure le temps de l'appel puis le rend
   (pas deux ids identiques dans le document). Les ouvertures en canvas
   (seis, twi, obs) retombent sur leur schéma symbolique, comme le
   data-fallback du legacy. */
/* Vignette d'accueil de l'onglet ecl (epic09) : Soleil, Lune, cône d'ombre
   qui touche la Terre, et l'orbite lunaire inclinée qui explique pourquoi
   pas chaque mois. Schématique -- mountIn() tamponne « not to scale ». */
function drawEclHome() {
  const f = FIG.make({ w: 380, h: 180, alt: "The Moon's shadow reaching the Earth only when the Moon crosses the plane of the Earth's orbit" });
  f.circle(40, 90, 26, { c: "none", w: 0, fill: "#f7b733" });
  f.path("M150 83 L286 77 L286 103 L150 97 Z", { c: "none", w: 0, fill: "rgba(21,26,33,0.18)" });
  f.path("M150 86 L268 88 L268 92 L150 94 Z", { c: "none", w: 0, fill: "rgba(21,26,33,0.45)" });
  f.circle(150, 90, 7, { c: "#5b6470", w: 1, fill: "#d9dde3" });
  f.circle(268, 90, 26, { c: "#0f766e", w: 1.4, fill: "#dcefec" });
  f.ellipse(268, 90, 118, 22, { c: "#8b93a0", w: 1, dash: "4 3" });
  f.line(122, 72, 372, 106, { c: "#e0a52a", w: 1.2 });
  f.note(64, 150, "new moon at a node: an eclipse");
  f.mountIn(document.getElementById("eclHomeFig"));
}

/* Vignette d'accueil de l'onglet curv (epic13) : un cadre photo, l'horizon
   en légère arche sous la corde droite, le niveau de l'œil (horizon d'un
   plan) en pointillés. Schématique -- la flèche est agrandie, mountIn()
   tamponne « not to scale ». */
function drawCurvHome() {
  const f = FIG.make({ w: 380, h: 180, alt: "A photo frame: the globe's horizon arches slightly below the straight chord joining its ends; a plane's horizon would be the straight eye-level line" });
  f.path("M70 20 L310 20 L310 150 L70 150 Z", { c: "#5b6470", w: 1.2, fill: "#eef3f7" });
  f.path("M70 104 Q190 80 310 104 L310 150 L70 150 Z", { c: "none", w: 0, fill: "#9fb6c8" });
  f.path("M70 104 Q190 80 310 104", { c: "#0f766e", w: 1.8, fill: "none" });
  f.line(70, 104, 310, 104, { c: "#151a21", w: 0.8, dash: "2 3" });
  f.line(70, 60, 310, 60, { c: "#b45309", w: 1.2, dash: "6 4" });
  f.line(190, 92, 190, 104, { c: "#151a21", w: 1 });
  f.note(196, 100, "sagitta");
  f.note(76, 54, "eye level: a plane's horizon");
  f.note(70, 170, "from 35,000 ft: about 0.5° across 60°");
  f.mountIn(document.getElementById("curvHomeFig"));
}

/* Vignette d'accueil de l'onglet avia (epic14, refaite 2026-10-02 avec les forces
   vues de l'avion) : à gauche un avion à niveau sur une isobare autour du globe,
   avec son poids (vers le centre) et sa portance ; à droite le diagramme des
   forces dans son repère (poids, portance, poussée, traînée, vitesse) au-dessus
   du sol -- le même à toute heure. Schématique : mountIn() tamponne
   « not to scale » ; poids − portance (~0,1 %) est trop petit pour être dessiné. */
function drawAviaHome() {
  const f = FIG.make({ w: 380, h: 180, alt: "An aircraft in level flight on a surface of constant pressure around the globe, and the forces on it in its own frame: weight and lift balancing, thrust and drag balancing, the same at every hour" });
  const W = "#e0a52a", L = "#0f766e", T = "#2563eb", D = "#c2410c";
  f.circle(78, 98, 40, { c: "#0f766e", w: 1.4, fill: "#dcefec" });
  f.circle(78, 98, 52, { c: "#8b93a0", w: 1, dash: "3 3" });
  f.ellipse(78, 42, 9, 2.6, { c: "#151a21", w: 1, fill: "#151a21" });
  f.path("M71 41 L68 35 L72 35 L75 40 Z", { c: "#151a21", w: 1, fill: "#151a21" });
  f.arrow(78, 46, 78, 62, { c: W, w: 1.6, head: 5 });
  f.arrow(78, 38, 78, 22, { c: L, w: 1.6, head: 5 });
  f.note(12, 168, "level flight on a pressure surface", { size: 10 });
  f.line(150, 12, 150, 150, { c: "#d9dde3", w: 1 });
  f.ellipse(268, 74, 32, 6.5, { c: "#151a21", w: 1, fill: "#151a21" });
  f.path("M243 72 L234 54 L246 54 L256 70 Z", { c: "#151a21", w: 1, fill: "#151a21" });
  f.path("M276 78 L254 78 L262 92 L270 92 Z", { c: "#151a21", w: 1, fill: "#151a21" });
  f.arrow(268, 80, 268, 128, { c: W, w: 2, head: 7 });
  f.arrow(268, 68, 268, 20, { c: L, w: 2, head: 7 });
  f.arrow(302, 74, 326, 74, { c: T, w: 2, head: 7 });
  f.arrow(234, 78, 210, 78, { c: D, w: 2, head: 7 });
  f.arrow(300, 44, 356, 44, { c: "#5b6470", w: 1.2, head: 6, dash: "3 3" });
  f.note(274, 124, "weight", { size: 10, c: W }); f.note(274, 28, "lift", { size: 10, c: L });
  f.note(312, 66, "thrust", { size: 10, c: T }); f.note(186, 70, "drag", { size: 10, c: D });
  f.note(330, 38, "speed", { size: 10 });
  f.path("M156 140 L376 140 L376 160 L156 160 Z", { c: "none", w: 0, fill: "#dcefec" });
  f.ground(140, 156, 376, { w: 2 });
  f.note(160, 172, "from the aircraft: the same forces, hour after hour", { size: 10 });
  f.mountIn(document.getElementById("aviaHomeFig"));
}

/* Vignette d'accueil de l'onglet seis (refaite 2026-10-03 à la demande du
   propriétaire, qui n'aimait pas l'ancienne -- seisfig0, qui reste dans l'onglet) :
   à gauche le globe, un séisme et une station, l'onde par le chemin court et par
   le chemin long ; à droite l'enregistrement de la station, les deux arrivées.
   Schématique -- mountIn() tamponne « not to scale ». */
function drawSeisHome() {
  const f = FIG.make({ w: 380, h: 180, alt: "A quake and a station on the globe: the wave reaches the station the short way, then the long way round; the station's record shows the same pulse twice" });
  const B = "#1d4ed8", Q = "#b45309", INK = "#151a21";
  const cx = 94, cy = 90, r = 58, aq = 160, as = 30;
  const P = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  const q = P(aq), st = P(as);
  f.circle(cx, cy, r, { c: "#0f766e", w: 1.4, fill: "#dcefec" });
  f.path(`M${q[0]} ${q[1]}A${r} ${r} 0 0 1 ${st[0]} ${st[1]}`, { c: B, w: 3 });
  f.path(`M${q[0]} ${q[1]}A${r} ${r} 0 1 0 ${st[0]} ${st[1]}`, { c: B, w: 1.8, dash: "5 3" });
  f.dot(q[0], q[1], { r: 4.5, c: Q }); f.dot(st[0], st[1], { r: 4, c: INK });
  f.note(q[0] - 7, q[1] + 4, "quake", { size: 10, c: Q, anchor: "end" });
  f.note(st[0] + 6, st[1] - 8, "station", { size: 10, c: INK });
  f.note(cx, cy - r - 8, "short way", { size: 9.5, c: B, anchor: "middle" });
  f.note(cx, cy + r + 14, "long way", { size: 9.5, c: B, anchor: "middle" });
  // l'enregistrement de la station
  const x0 = 196, x1 = 372, y0 = 88;
  f.line(186, 14, 186, 160, { c: "#d9dde3", w: 1 });
  let d = `M${x0} ${y0}`;
  for (let x = x0; x <= x1; x += 1.5) {
    const p = (c, a) => a * Math.exp(-((x - c) ** 2) / 40) * Math.sin((x - c) / 2.2);
    d += `L${x.toFixed(1)} ${(y0 - p(236, 20) - p(326, 13)).toFixed(1)}`;
  }
  f.path(d, { c: INK, w: 1.2 });
  f.arrow(x0, y0 + 34, x1, y0 + 34, { c: "#8b93a0", w: 1, head: 5 });
  f.note(x1, y0 + 48, "time", { size: 9.5, anchor: "end" });
  f.note(236, y0 - 30, "short way", { size: 9.5, c: B, anchor: "middle" });
  f.note(326, y0 - 30, "long way", { size: 9.5, c: B, anchor: "middle" });
  f.note(196, 166, "one station, the same wave twice", { size: 10 });
  f.mountIn(document.getElementById("seisHomeFig"));
}

/* Vignette d'accueil de l'onglet rx (2026-10-03) : à gauche un téléphone qui
   reçoit quatre satellites (quatre distances, quatre inconnues : x, y, z et
   l'horloge) ; à droite plusieurs téléphones éloignés, posés sur une même
   sphère dont on mesure le rayon. Schématique -- mountIn() tamponne « not to scale ». */
/** Vignette de l'onglet results (2026-10-04) : des boîtes de rayons autour de 6 371 km, et le plan hors échelle. Schéma. */
function drawResultsHome() {
  const f = FIG.make({ w: 380, h: 180, alt: "Schematic of the results tab: one box per method of measuring the Earth's radius, all clustered around 6,371 km on one kilometre scale, and the plane's answer, an infinite radius, off the scale to the right" });
  const X0 = 30, X1 = 300, x = (km) => X0 + (km - 5000) / 3000 * (X1 - X0);
  f.dash(x(6371), 20, x(6371), 150, { c: "#151a21" });
  f.note(x(6371), 166, "6 371 km", { anchor: "middle", size: 10 });
  const rows = [[6382, 70], [6310, 140], [6505, 95], [6366, 8], [6362, 12], [6226, 330], [6380, 250], [6320, 800]];
  rows.forEach(([m, s], i) => {
    const y = 30 + i * 15, c = i < 3 ? "#1d4ed8" : "#5b6470";
    f.line(x(m - s), y, x(m + s), y, { c, w: 1 });
    f.path(`M${x(m - s / 2)} ${y - 4} H${x(m + s / 2)} V${y + 4} H${x(m - s / 2)} Z`, { c, w: 1.2, fill: "none" });
    f.line(x(m), y - 5, x(m), y + 5, { c, w: 2.4 });
  });
  f.arrow(310, 90, 370, 90, { c: "#b45309", w: 1.6 }); f.note(372, 82, "plane: ∞", { anchor: "end", size: 10, c: "#b45309" });
  f.notToScale("schematic");
  f.mountIn(document.getElementById("resultsHomeFig"));
}

function drawRxHome() {
  const f = FIG.make({ w: 380, h: 180, alt: "Left: a phone on the ground receiving four satellites, one distance each, enough to solve its position and its clock. Right: several phones far apart lying on one sphere, whose radius they measure together" });
  const SAT = "#2563eb", PH = "#151a21";
  f.path("M10 150 Q85 128 160 150", { c: "#0f766e", w: 1.8, fill: "none" });
  const P = [85, 138];
  const sats = [[22, 34], [64, 18], [112, 24], [150, 46]];
  for (const [x, y] of sats) {
    f.line(x, y, P[0], P[1], { c: SAT, w: 1, dash: "3 3" });
    f.path(`M${x - 6} ${y - 2}H${x + 6}V${y + 2}H${x - 6}Z`, { c: "none", w: 0, fill: SAT });
    f.dot(x, y, { r: 3, c: SAT });
  }
  f.path(`M${P[0] - 3} ${P[1] - 6}H${P[0] + 3}V${P[1] + 2}H${P[0] - 3}Z`, { c: PH, w: 1, fill: PH });
  f.note(10, 172, "4 satellites: x, y, z and the clock", { size: 10 });
  f.line(190, 12, 190, 160, { c: "#d9dde3", w: 1 });
  const cx = 288, cy = 150, r = 92;
  f.path(`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`, { c: "#0f766e", w: 1.8, fill: "#dcefec" });
  for (const a of [150, 115, 80, 45]) {
    const x = cx + r * Math.cos(a * Math.PI / 180), y = cy - r * Math.sin(a * Math.PI / 180);
    f.path(`M${x - 3} ${y - 6}H${x + 3}V${y + 2}H${x - 3}Z`, { c: PH, w: 1, fill: PH });
  }
  f.line(cx, cy, cx + r * Math.cos(Math.PI * 62 / 180), cy - r * Math.sin(Math.PI * 62 / 180), { c: "#5b6470", w: 1.2 });
  f.note(cx + 18, cy - 46, "R", { size: 11 });
  f.note(198, 172, "far apart: one sphere, one R", { size: 10 });
  f.mountIn(document.getElementById("rxHomeFig"));
}

export const HOME_FIGS = {
  elev: ["simPairFig", drawSimPair], hh: ["hhfig0", drawHhCnavSymbols], cnav: ["cnavPairFig", drawCnavPair],
  star: ["stfig0", drawStarSymbols], dist: ["distfig0", drawDistSymbols], dip: ["dipPairFig", drawDipPair],
  grav: ["gravPairFig", drawGravPair], fou: ["fouPairFig", drawFouPair], seis: ["seisHomeFig", drawSeisHome],
  mag: ["magPairFig", drawMagPair], sun: ["sunfig0", drawSunSymbols], twi: ["twifig0", drawTwiSymbols],
  azim: ["azfig0", drawAzimOpening], gps: ["gpsfig0", drawGpsSymbols], ref: ["reffig0", drawRefSymbols],
  surv: ["survPairFig", drawSurvPair], obs: ["obsHomeFig", null], ct: ["ct-figOpen", null],
  ecl: ["eclHomeFig", drawEclHome], curv: ["curvHomeFig", drawCurvHome], avia: ["aviaHomeFig", drawAviaHome],
  rx: ["rxHomeFig", drawRxHome], results: ["resultsHomeFig", drawResultsHome],
  rot: ["rotHomeFig", null], orb: ["orbHomeFig", null], sat: ["satHomeFig", null], scale: ["scaleHomeFig", null], atmo: ["atmoHomeFig", null], moon: ["moonHomeFig", null], map: ["mapHomeFig", null], phys: ["physHomeFig", null], aether: ["aetherHomeFig", null], rocket: ["rocketHomeFig", null], persp: ["perspHomeFig", null], kappa: ["kappaHomeFig", null], math: ["mathHomeFig", null], rules: ["rulesHomeFig", null], cases: ["casesHomeFig", null],   // epic19 (+ map 2026-10-08) : figures de leur onglet, chargées par l'accueil
};
export function drawHomeFig(key, host, extra = {}) {
  const spec = HOME_FIGS[key]; if (!spec || !host) return false;
  const [id, fn0] = spec, fn = fn0 || extra[key];
  if (!fn) return false;
  const clash = document.getElementById(id);
  if (clash && clash !== host) clash.removeAttribute("data-fig-tmp"), clash.id = "";   // libère l'id le temps du dessin
  host.id = id;
  try { fn(); } catch (e) { console.warn(`[home] vignette ${key} skipped: ${e.message}`); }
  finally {
    host.removeAttribute("id"); if (clash && clash !== host) clash.id = id;
    // une vignette ne garde aucun id : sinon les groupes #svgRefr1/#svgRefr2
    // du générateur de cnav existaient deux fois dans la page (epic06/UC03)
    host.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  }
  return !!host.querySelector("svg");
}
