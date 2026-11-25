// Le moteur de l'onglet star, porté VERBATIM de l'IIFE `STAR` du legacy
// (flat-or-globe-2.20.0.html L26907-28155) : catalogue (Yale BSC, J2000),
// deux modèles de ciel (globe / disque à dôme), figure d'ouverture animée,
// ciel gnomonique, projection photographique à travers huit objectifs,
// diagramme des permanentes/saisonnières, rythme des pauses, et les cinq
// tables (spots, shape, dome, season, dump). Le module n'expose que
// draw/wire/setPhase (+ stop, ajouté pour teardown). Il cherche ses hôtes
// par id dans le document (st-*) : ils viennent du flux verbatim
// src/data/prose/star.js. Ses fonctions pures sont dupliquées, testées,
// dans src/tabs/star/logic.js (mêmes nombres : voir logic.test.js).
import { OBS } from "../../core/ephemeris.js";
import { makeT } from "../../core/i18n.js";
import { pixelRatio } from "../../core/canvas.js";
import { LENSES } from "../../core/lenses.js";

export const STAR = (function(){
'use strict';

let t = (k) => k;
/* 2026-11-11 : la figure d'ouverture et la figure des traînées sont dessinées par src/tabs/star/trails.js
   (ciel de nuit, étoiles d'Hipparcos). L'onglet pose EXT.open / EXT.sky / EXT.play ; sans eux, le rendu
   d'origine ci-dessous sert toujours (tests, repli). */
const EXT = {};

/* ===================================================================
   0. DONNEES
   =================================================================== */

/* 35 etoiles, Yale Bright Star Catalogue 5e ed., J2000, telles que publiees.
   Mouvement propre NON applique : 26 ans en donnent au plus ~30", sous tout ce
   que cet onglet affirme. Precession, elle, atteint 0,36° et EST appliquee. */
const STARS = [
  {hr:424,n:"Polaris",b:"α UMi",ra:37.9529,de:89.2642,v:2.02},
  {hr:5563,n:"Kochab",b:"β UMi",ra:222.6763,de:74.1556,v:2.08},
  {hr:168,n:"Schedar",b:"α Cas",ra:10.1271,de:56.5372,v:2.23},
  {hr:21,n:"Caph",b:"β Cas",ra:2.2946,de:59.1497,v:2.27},
  {hr:264,n:"Gamma Cassiopeiae",b:"γ Cas",ra:14.1771,de:60.7167,v:2.47},
  {hr:403,n:"Ruchbah",b:"δ Cas",ra:21.4542,de:60.2353,v:2.68},
  {hr:542,n:"ε Cas",b:"ε Cas",ra:28.5987,de:63.6700,v:3.38},
  {hr:3982,n:"Regulus",b:"α Leo",ra:152.0929,de:11.9672,v:1.35},
  {hr:2891,n:"Castor",b:"α Gem",ra:113.6500,de:31.8883,v:1.98},
  {hr:2990,n:"Pollux",b:"β Gem",ra:116.3287,de:28.0261,v:1.14},
  {hr:8781,n:"Markab",b:"α Peg",ra:346.1904,de:15.2053,v:2.49},
  {hr:5735,n:"γ UMi",b:"γ UMi",ra:230.1821,de:71.8339,v:3.05},
  {hr:6789,n:"δ UMi",b:"δ UMi",ra:263.0538,de:86.5864,v:4.36},
  {hr:6322,n:"ε UMi",b:"ε UMi",ra:251.4921,de:82.0372,v:4.23},
  {hr:5903,n:"ζ UMi",b:"ζ UMi",ra:236.0146,de:77.7944,v:4.32},
  {hr:6116,n:"η UMi",b:"η UMi",ra:244.3762,de:75.7553,v:4.95},
  {hr:4301,n:"Dubhe",b:"α UMa",ra:165.9321,de:61.7508,v:1.79},
  {hr:4295,n:"Merak",b:"β UMa",ra:165.4604,de:56.3825,v:2.37},
  {hr:4554,n:"Phecda",b:"γ UMa",ra:178.4575,de:53.6947,v:2.44},
  {hr:4660,n:"Megrez",b:"δ UMa",ra:183.8567,de:57.0325,v:3.31},
  {hr:4905,n:"Alioth",b:"ε UMa",ra:193.5071,de:55.9597,v:1.77},
  {hr:5054,n:"Mizar",b:"ζ UMa",ra:200.9812,de:54.9253,v:2.27},
  {hr:5191,n:"Alkaid",b:"η UMa",ra:206.8850,de:49.3133,v:1.86},
  {hr:2061,n:"Betelgeuse",b:"α Ori",ra:88.7929,de:7.4069,v:0.50},
  {hr:1713,n:"Rigel",b:"β Ori",ra:78.6346,de:-8.2017,v:0.12},
  {hr:1790,n:"Bellatrix",b:"γ Ori",ra:81.2829,de:6.3497,v:1.64},
  {hr:1852,n:"Mintaka",b:"δ Ori",ra:83.0017,de:-0.2992,v:2.23},
  {hr:1903,n:"Alnilam",b:"ε Ori",ra:84.0533,de:-1.2019,v:1.70},
  {hr:1948,n:"Alnitak",b:"ζ Ori",ra:85.1896,de:-1.9428,v:2.05},
  {hr:2004,n:"Saiph",b:"κ Ori",ra:86.9392,de:-9.6697,v:2.06},
  {hr:4730,n:"Acrux",b:"α¹ Cru",ra:186.6496,de:-63.0992,v:1.33},
  {hr:4853,n:"Mimosa",b:"β Cru",ra:191.9300,de:-59.6886,v:1.25},
  {hr:4763,n:"Gacrux",b:"γ Cru",ra:187.7913,de:-57.1133,v:1.63},
  {hr:4656,n:"δ Cru",b:"δ Cru",ra:183.7862,de:-58.7489,v:2.80},
  {hr:7228,n:"Sigma Octantis",b:"σ Oct",ra:317.1925,de:-88.9564,v:5.47},
  {hr:5459,n:"Rigil Kentaurus",b:"α¹ Cen",ra:219.8996,de:-60.8353,v:-0.01},
  {hr:5267,n:"Hadar",b:"β Cen",ra:210.9558,de:-60.3731,v:0.61},
  {hr:2491,n:"Sirius",b:"α CMa",ra:101.2871,de:-16.7161,v:-1.46},
  {hr:2326,n:"Canopus",b:"α Car",ra:95.9879,de:-52.6958,v:-0.72},
  {hr:7001,n:"Vega",b:"α Lyr",ra:279.2346,de:38.7836,v:0.03},
  {hr:5340,n:"Arcturus",b:"α Boo",ra:213.9154,de:19.1825,v:-0.04},
  {hr:1708,n:"Capella",b:"α Aur",ra:79.1725,de:45.9981,v:0.08},
  {hr:7557,n:"Altair",b:"α Aql",ra:297.6958,de:8.8683,v:0.77},
  {hr:7924,n:"Deneb",b:"α Cyg",ra:310.3579,de:45.2803,v:1.25},
  {hr:472,n:"Achernar",b:"α Eri",ra:24.4288,de:-57.2367,v:0.46},
  {hr:8728,n:"Fomalhaut",b:"α PsA",ra:344.4129,de:-29.6222,v:1.16},
  {hr:5056,n:"Spica",b:"α Vir",ra:201.2983,de:-11.1614,v:0.98},
  {hr:6134,n:"Antares",b:"α Sco",ra:247.3517,de:-26.4319,v:0.96},
  {hr:1457,n:"Aldebaran",b:"α Tau",ra:68.9800,de:16.5092,v:0.85},
];

/* DOUZE VILLES, reparties sur toute la plage de latitudes, des deux cotes.
   Coordonnees : Natural Earth 1:10m « populated places », domaine public — le
   MEME jeu de donnees que les traits de cote de l'onglet obs, deja cite dans la
   page. Aucune coordonnee tapee de memoire ; aucun lieu choisi pour arranger une
   reponse : c'est la plage de latitudes qui commande, du 78e nord au 55e sud. */
const STAR_SPOTS = [
  {n:"Longyearbyen, Svalbard",  lat: 78.2167, lon:  15.5500},
  {n:"Troms\u00f8, Norway",         lat: 69.6351, lon:  18.9920},
  {n:"Paris, France",           lat: 48.8686, lon:   2.3314},
  {n:"New York, USA",    lat: 40.7519, lon: -73.9820},
  {n:"Cairo, Egypt",        lat: 30.0519, lon:  31.2480},
  {n:"Mexico City, Mexico",         lat: 19.4444, lon: -99.1329},
  {n:"Quito, Ecuador",         lat: -0.2130, lon: -78.5020},
  {n:"Lima, Peru",             lat:-12.0461, lon: -77.0520},
  {n:"Rio de Janeiro, Brazil",  lat:-22.9231, lon: -43.2270},
  {n:"Santiago, Chile",         lat:-33.4481, lon: -70.6690},
  {n:"Melbourne, Australia",    lat:-37.8181, lon: 144.9731},
  {n:"Ushuaia, Argentina",      lat:-54.7900, lon: -68.3100},
];

/* Quatre dates. L'heure retenue est le MINUIT MOYEN LOCAL du lieu, pas une
   heure UTC fixe : a longitude egale ce serait le plein jour pour la moitie des
   stations, et l'onglet demande au lecteur de sortir regarder. */
const STAR_DATES = [
  {n:"date-mar-eq",     Y:2026, M:3,  D:20},
  {n:"date-jun-sol",     Y:2026, M:6,  D:21},
  {n:"date-sep-eq",Y:2026, M:9,  D:23},
  {n:"date-dec-sol", Y:2026, M:12, D:21},
];

/* Balaye, jamais ajuste — meme regle que AZIM_LAMPS dans la page.
   5004 km n'est PAS un choix : c'est la valeur qui pose le point fixe a 45,00°
   pour un observateur a 45° N, donc la plus favorable au modele plat. */
const STAR_DOMES = [5004, 10000, 25000, 100000];

/* Les deux asterismes que le lecteur doit reconnaitre, chacun autour du pole de
   son hemisphere. Reperes par leur numero HR, pas par leur rang dans le tableau :
   inserer une etoile ne doit pas pouvoir redessiner un asterisme en silence. */
/* Les constellations dont on parle dans la section « permanentes ou saisonnieres ».
   Chacune est reperee par ses etoiles PRESENTES dans la table — pas par un
   centroide de frontieres IAU qu'on n'a pas — et la figure le dit : la position
   affichee est celle du groupe d'etoiles cite, pas le centre officiel de la
   constellation. La difference se compte en quelques degres et ne change aucune
   des trois categories, sauf a etre pile sur une limite ; le cas echeant la
   table imprime la limite et le lecteur voit qu'on y est. */
const STAR_CONS = [
  {n:"Ursa Minor",   hr:[424,5563,5735,6789,6322,5903,6116]},
  {n:"Cassiopeia",      hr:[168,21,264,403,542]},
  {n:"Ursa Major",   hr:[4301,4295,4554,4660,4905,5054,5191]},
  {n:"Auriga",         hr:[1708]},
  {n:"Cygnus",          hr:[7924]},
  {n:"Lyra",           hr:[7001]},
  {n:"Gemini",        hr:[2891,2990]},
  {n:"Bo\u00f6tes",        hr:[5340]},
  {n:"Leo",           hr:[3982]},
  {n:"Taurus",        hr:[1457]},
  {n:"Pegasus",         hr:[8781]},
  {n:"Aquila",          hr:[7557]},
  {n:"Orion",          hr:[2061,1713,1790,2004,1948,1903,2004]},
  {n:"Virgo",         hr:[5056]},
  {n:"Canis Major",    hr:[2491]},
  {n:"Scorpius",       hr:[6134]},
  {n:"Piscis Austrinus",hr:[8728]},
  {n:"Carina",         hr:[2326]},
  {n:"Eridanus",         hr:[472]},
  {n:"Centaurus",       hr:[5459,5267]},
  {n:"Southern Cross",   hr:[4730,4853,4763,4656]},
  {n:"Octans",         hr:[7228]},
];
const ASTER = {
  "Ursa Minor": [424, 6789, 6322, 5903, 6116, 5735, 5563, 5903],
  "Southern Cross": [4730, 4763, null, 4853, 4656],   // null = lever le crayon
};

/* Trois visees. Ce ne sont PAS des reglages des modeles compares : la scene est
   la meme, seule la direction de l'appareil change. Regarder l'ouest ou le sud
   depuis l'hemisphere nord est justement ce qui separe « les etoiles se
   couchent » de « rien ne se couche jamais ». */
const STAR_VIEWS = [
  {k:"fix", n:"view-fixed"},
  {k:"N",   n:"view-north",  alt:28, az:  0},
  {k:"E",   n:"view-east",    alt:28, az: 90},
  {k:"S",   n:"view-south",   alt:28, az:180},
  {k:"W",   n:"view-west",  alt:28, az:270},
];

const EXPO_H = 4;          // duree de pose des figures, heures
const FOV    = 52;         // demi-champ gnomonique, degres

/* ===================================================================
   1. ASTRONOMIE — copie verbatim d'OBS, plus la precession
   =================================================================== */
const D2R = Math.PI/180, R2D = 180/Math.PI;
const sin = a => Math.sin(a*D2R), cos = a => Math.cos(a*D2R), tan = a => Math.tan(a*D2R);
const norm360 = a => ((a%360)+360)%360;
const norm180 = a => norm360(a+180)-180;

/* ON NE REDECLARE RIEN. jdFromUTC, gmst, altaz, subPoint, flatAzimuth et
   flatGeom existent depuis longtemps dans OBS et sont deja sources, testes et
   utilises par cnav, azim, seis et obs. Les recopier ici aurait cree un second
   jeu d'ephemerides dans une page qui argumente qu'il n'y a qu'un seul k :
   deux GMST valent exactement le meme reproche que deux coefficients de
   refraction. precess() est la seule fonction neuve, et elle est allee dans
   OBS avec les autres, pas ici. */
const jdFromUTC = OBS.jdFromUTC, gmst = OBS.gmst, altaz = OBS.altaz,
      subPoint = OBS.subPoint, flatGeom = OBS.flatGeom, precess = OBS.precess;

const RKM = 6371, KM_PER_DEG = 111.19492664;

// distance de l'observateur au centre du disque, sur la carte AE
const discR = phi => (90-phi)*KM_PER_DEG;

// point fixe de chaque modele : {alt, az, sense} -- sense est une CLE i18n, pas le mot affiche
function fixedGlobe(phi){
  return phi>=0 ? {alt:phi, az:0, sense:"sense-ccw"}
                : {alt:-phi, az:180, sense:"sense-cw"};
}
function fixedFlat(phi,h){
  return {alt:Math.atan2(h,discR(phi))*R2D, az:0, sense:"sense-ccw"};
}

// position d'une etoile a un instant, dans les deux modeles
function posGlobe(st,spot,jd){
  const p=precess(st.ra,st.de,jd);
  return altaz(p.ra,p.dec,spot.lat,spot.lon,jd);
}
function posFlat(st,spot,jd,h){
  const p=precess(st.ra,st.de,jd);
  const s=subPoint(p.ra,p.dec,jd);
  return flatGeom(spot.lat,spot.lon,s.lat,s.lon,h);
}

// vecteur unitaire local ENU depuis alt/az
function enu(alt,az){ return [cos(alt)*sin(az), cos(alt)*cos(az), sin(alt)]; }
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
function unit(v){const L=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/L,v[1]/L,v[2]/L];}
const sepDeg=(a1,A1,a2,A2)=>Math.acos(Math.max(-1,Math.min(1,
  sin(a1)*sin(a2)+cos(a1)*cos(a2)*cos(A1-A2))))*R2D;

/* Camera gnomonique visant un point fixe, « haut » = vers le zenith.
   r = c x u donne l'est quand on regarde le nord : l'image est celle qu'un
   appareil enregistre, pas son miroir. */
function camera(fp){
  const c=unit(enu(fp.alt,fp.az));
  const z=[0,0,1];
  const u=unit([z[0]-c[0]*dot(z,c), z[1]-c[1]*dot(z,c), z[2]-c[2]*dot(z,c)]);
  const r=cross(c,u);
  return {c,u,r};
}
function project(cam,alt,az){
  const v=enu(alt,az), d=dot(v,cam.c);
  if(d<=0.08) return null;                       // derriere ou trop rasant
  const x=dot(v,cam.r)/d, y=dot(v,cam.u)/d;
  if(Math.hypot(x,y)>tan(FOV)) return null;      // hors champ
  return [x,y];
}

/* ===================================================================
   3. ETAT + RENDU
   =================================================================== */
const $=id=>document.getElementById(id);
const S={spot:2, date:3, dome:0, view:0, model:'g', lens:'r35', aim:'off'};

function jdOf(){
  const d=STAR_DATES[S.date], sp=STAR_SPOTS[S.spot];
  // minuit moyen local : 00:00 locale = 00:00 UTC - lon/15
  return jdFromUTC(d.Y,d.M,d.D,0,0,0) - sp.lon/360;
}
/* POINT DECIMAL, PAS VIRGULE. Les valeurs numeriques calculees restent au format
   anglais (point decimal) dans TOUTES les langues -- seuls les mots autour
   d'elles sont traduits via t() (UC06, rattrapage 2026-09-17). */
const fmt=(v,n=2)=>v.toFixed(n);
const azName=a=>{const k=["N","NE","E","SE","S","SW","W","NW"];return t("az-"+k[Math.round(norm360(a)/45)%8]);};

function fillSelects(){
  $("st-selSpot").innerHTML=STAR_SPOTS.map((s,i)=>
    `<option value="${i}">${s.n} (${fmt(Math.abs(s.lat))}° ${t(s.lat<0?"az-S":"az-N")})</option>`).join("");
  $("st-selDate").innerHTML=STAR_DATES.map((d,i)=>
    `<option value="${i}">${t(d.n)} ${d.Y}</option>`).join("");
  $("st-selDome").innerHTML=STAR_DOMES.map((h,i)=>
    `<option value="${i}">${h.toLocaleString("en-US")} km</option>`).join("");
  $("st-selLens").innerHTML=PROJ_LENSES.map(L=>`<option value="${L.k}">${t(L.n)}</option>`).join("");
  $("st-selView").innerHTML=STAR_VIEWS.map((v,i)=>
    `<option value="${i}">${t(v.n)}</option>`).join("");
  $("st-selSpot").value=S.spot; $("st-selDate").value=S.date;
  $("st-selDome").value=S.dome; $("st-selView").value=S.view;
  /* LA CLE D'ETAT EST ECRITE, PAS DEDUITE DE L'IDENTIFIANT. Au banc les selects
     s'appelaient "selSpot" et la boucle faisait id.slice(3).toLowerCase() —
     "spot". En prefixant les ids par "st-" pour eviter toute collision dans la
     page, slice(3) est devenu "elSpot" : S["elspot"] etait ecrit, S.spot ne
     bougeait plus, et AUCUN selecteur ne faisait quoi que ce soit. Rien ne
     plantait, rien n'apparaissait dans la console, et les cinq audits
     passaient — le seul symptome etait une bande de lecture qui restait sur
     Paris pendant que le menu affichait Mexico. Un nom de variable derive d'un
     nom d'element est un couplage qu'aucun outil ne verifie. */
  [["st-selSpot","spot"],["st-selDate","date"],["st-selDome","dome"],["st-selView","view"]]
    .forEach(([id,key])=>$(id).addEventListener("change",e=>{
      S[key]=+e.target.value; render();
    }));
  // ces deux-la portent des CHAINES, pas des index : hors de la boucle ci-dessus
  $("st-selModel").addEventListener("change",e=>{ S.model=e.target.value; render(); });
  $("st-selLens").addEventListener("change",e=>{ S.lens=e.target.value; render(); });
  $("st-selAim").addEventListener("change",e=>{ S.aim=e.target.value; render(); });
}

/* ---- figure d'ouverture : Charters Towers, deux modeles ---- */
/* ---- OUVERTURE : LA ROTATION, EN PERSPECTIVE ET EN MOUVEMENT ------------
   Decision du proprietaire : l'ouverture montre la rotation elle-meme, meme
   lieu des deux cotes, le globe regarde vers le SUD et le disque vers le NORD —
   c'est-a-dire chacun vers son propre point fixe, et ces deux directions sont
   opposees. C'est la these de l'onglet en une image.

   ELLE NE DOUBLE PAS figSky (plan §2.4) : celle-ci montre le MOUVEMENT et ne
   trace qu'une queue de quelques minutes ; figSky montre la TRACE accumulee et
   ne bouge pas. Motion contre trace.

   Trois contraintes tenues :
   - les declinations sont precessees UNE FOIS par date, pas par image ;
   - prefers-reduced-motion : la queue passe a une heure et rien ne bouge ;
   - la boucle s'arrete des que la figure est masquee, et le timestamp est remis
     a zero au retour (sinon le premier delta vaut plusieurs minutes). */
const OPEN_SPOT = 10;                 // Melbourne, 37,82 S : les deux points fixes sont opposes
/* 30 min, pas 14. Une etoile proche du point fixe parcourt un angle
   proportionnel a son distance from the pole : a 14 minutes, les etoiles de la Croix
   n'avaient pas de queue du tout et une image fixe ne disait plus dans quel
   sens ca tourne. La queue est de plus tracee en cinq points le long du VRAI
   chemin, avec une pointe : une corde droite ne montre aucune courbure, et
   c'est la courbure qui se lit quand l'animation est desactivee. */
const OPEN_TAIL_MIN = 30;             // longueur de queue, en minutes
let openRAF=null, openT=0, openPre=null, openPlay=true;

function openPrecomputed(jd){
  if(openPre && openPre.jd===jd) return openPre;
  openPre={jd, st:STARS.map(st=>{ const p=precess(st.ra,st.de,jd); return {v:st.v,hr:st.hr,ra:p.ra,de:p.dec}; })};
  return openPre;
}
/* ---- RENDU NOCTURNE (2026-09-24, demande du proprietaire : « les animations
   des etoiles sont un peu faibles »). L'ouverture passe du SVG au CANVAS : le
   SVG etait reconstruit en entier a chaque image (innerHTML de ~200 elements,
   soixante fois par seconde), ce qui coutait cher sur la machine du
   proprietaire et interdisait halos et degrades. La physique ne bouge pas :
   memes 35 etoiles, meme precession, meme queue de 30 min, meme camera
   gnomonique, memes points fixes. Ce qui change est le rendu : ciel de nuit
   en degrade, sol sous l'horizon, etoiles a halo proportionnel a l'eclat,
   queue lissee (16 points le long du VRAI chemin, au lieu de 5) qui
   s'estompe vers l'arriere. Les couleurs des modeles sont eclaircies pour se
   lire sur le noir : sarcelle claire = globe, ambre clair = disque. */
const NIGHT = { top:"#070b1a", mid:"#101a36", low:"#1f2d52", ground:"#07090d",
  horizon:"rgba(170,190,220,0.75)", ink:"#c9d3e3", halo:"#0b1226",
  globe:"#5eead4", flat:"#fcd34d" };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
let openCv = null, openW = 0, openCtx = null, openReadsHTML = "";
function openCanvas(){
  const host = $("st-figOpen"); if(!host) return null;
  if(!openCv || !host.contains(openCv)){
    host.innerHTML = "";
    openCv = document.createElement("canvas");
    openCv.setAttribute("role","img");
    openCv.setAttribute("aria-label","Star motion at one place, globe and flat disc");
    openCv.style.cssText = "display:block;width:100%;max-width:520px;aspect-ratio:380/202;margin:0 auto";
    host.appendChild(openCv); openW = 0;
  }
  const r = openCv.getBoundingClientRect();
  if(!r.width) return null;                       // onglet masque : rien a dessiner
  if(Math.round(r.width) !== openW){               // redimensionne seulement si la taille change
    const dpr = pixelRatio(2);
    openCv.width = Math.round(r.width * dpr); openCv.height = Math.round(r.width * 202/380 * dpr);
    openW = Math.round(r.width); openCtx = openCv.getContext("2d");
  }
  const k = openCv.width / 380;
  openCtx.setTransform(k, 0, 0, k, 0, 0);
  return openCtx;
}
function drawOpen(){
  const sp=STAR_SPOTS[OPEN_SPOT], h=STAR_DOMES[0];
  const g=fixedGlobe(sp.lat), f=fixedFlat(sp.lat,h);
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tailMin = reduce ? 60 : OPEN_TAIL_MIN;
  const jdBase = jdFromUTC(STAR_DATES[3].Y,STAR_DATES[3].M,STAR_DATES[3].D,0,0,0) - sp.lon/360;
  const jd = jdBase + openT/24;
  const pre = openPrecomputed(jdBase);
  const half=186, top=20, size=164, FOV2=46, TAILN=16;
  const K=(size/2)/tan(FOV2);
  const ctx = openCanvas();
  const reads = `<span><b>${sp.n}</b> ${fmt(Math.abs(sp.lat))}° ${t("az-S")} · ${t(STAR_DATES[3].n)}</span>`+
    `<span class="g">${t("open-read-fixed-s").replace("{alt}", fmt(g.alt,1))}</span>`+
    `<span class="f">${t("open-read-fixed-n").replace("{alt}", fmt(f.alt,1))}</span>`+
    `<span>${t("open-read-tail").replace("{tailMin}", tailMin)}${reduce?t("open-read-tail-off"):""}</span>`;
  if(reads !== openReadsHTML && $("st-openReads")){ $("st-openReads").innerHTML = reads; openReadsHTML = reads; }
  if(!ctx) return;
  ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, 380, 202);
  const panel=(x0,title,fp,col,flat)=>{
    const cam=camera(fp), cx=x0+half/2, cy=top+size/2;
    const L=x0+8, R=x0+half-8, T=top, B=top+size;
    const proj=(alt,az)=>{
      const v=enu(alt,az), d=dot(v,cam.c);
      if(d<=0.12) return null;
      const x=dot(v,cam.r)/d, y=dot(v,cam.u)/d;
      if(Math.hypot(x,y)>tan(FOV2)) return null;
      return [cx+x*K, cy-y*K];
    };
    const at=(st,tt)=>{
      if(!flat) return altaz(st.ra,st.de,sp.lat,sp.lon,tt);
      const s2=subPoint(st.ra,st.de,tt);
      return flatGeom(sp.lat,sp.lon,s2.lat,s2.lon,h);
    };
    ctx.fillStyle = "#151a21"; ctx.font = "600 11px ui-sans-serif,system-ui,sans-serif"; ctx.textAlign = "center";
    ctx.fillText(title, cx, top-6);
    ctx.save();
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(L, T, R-L, B-T, 5) : ctx.rect(L, T, R-L, B-T); ctx.clip();
    // ciel
    const sky = ctx.createLinearGradient(0, T, 0, B);
    sky.addColorStop(0, NIGHT.top); sky.addColorStop(0.55, NIGHT.mid); sky.addColorStop(1, NIGHT.low);
    ctx.fillStyle = sky; ctx.fillRect(L, T, R-L, B-T);
    // horizon : la plus longue portion visible, et le sol dessous
    let run=[], best=[];
    for(let a=0;a<=360;a+=1){ const p=proj(0,a); if(p) run.push(p); else { if(run.length>best.length) best=run; run=[]; } }
    if(run.length>best.length) best=run;
    if(best.length>1){
      best.sort((p,q)=>p[0]-q[0]);
      const glow = ctx.createLinearGradient(0, Math.min(...best.map(p=>p[1]))-22, 0, Math.max(...best.map(p=>p[1])));
      glow.addColorStop(0, "rgba(90,120,170,0)"); glow.addColorStop(1, "rgba(90,120,170,0.35)");
      ctx.beginPath(); ctx.moveTo(best[0][0], best[0][1]-22);
      for(const p of best) ctx.lineTo(p[0], p[1]-22);
      for(let i=best.length-1;i>=0;i--) ctx.lineTo(best[i][0], best[i][1]);
      ctx.closePath(); ctx.fillStyle = glow; ctx.fill();
      ctx.beginPath(); ctx.moveTo(best[0][0]-40, best[0][1]);
      for(const p of best) ctx.lineTo(p[0], p[1]);
      ctx.lineTo(best[best.length-1][0]+40, best[best.length-1][1]);
      ctx.lineTo(R+40, B+40); ctx.lineTo(L-40, B+40); ctx.closePath();
      ctx.fillStyle = NIGHT.ground; ctx.fill();
      ctx.beginPath(); best.forEach((p,i)=> i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));
      ctx.strokeStyle = NIGHT.horizon; ctx.lineWidth = 1; ctx.stroke();
    }
    const pc=proj(0,fp.az);
    if(pc){ ctx.fillStyle = NIGHT.ink; ctx.font = "8.5px ui-sans-serif,system-ui,sans-serif"; ctx.fillText(azName(fp.az), pc[0], pc[1]-7); }
    // le point fixe, sous les etoiles
    const pf=proj(fp.alt,fp.az);
    if(pf){
      const rg = ctx.createRadialGradient(pf[0],pf[1],0,pf[0],pf[1],14);
      rg.addColorStop(0, rgba(col,0.28)); rg.addColorStop(1, rgba(col,0));
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(pf[0],pf[1],14,0,2*Math.PI); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(pf[0]-5,pf[1]); ctx.lineTo(pf[0]+5,pf[1]); ctx.moveTo(pf[0],pf[1]-5); ctx.lineTo(pf[0],pf[1]+5); ctx.stroke();
    }
    ctx.lineCap = "round";
    pre.st.forEach(st=>{
      const q=at(st,jd); if(q.alt<=0) return;
      const p=proj(q.alt,q.az); if(!p) return;
      // queue : du plus ancien (transparent, fin) au plus recent (opaque, epais)
      const pts=[];
      for(let i=TAILN;i>=1;i--){
        const qi=at(st,jd-(i/TAILN)*tailMin/1440);
        const pi=(qi.alt>0)?proj(qi.alt,qi.az):null;
        if(pi) pts.push(pi); else pts.length=0;
      }
      pts.push(p);
      const w0 = Math.max(0.6, 2.0-0.3*st.v);
      for(let i=1;i<pts.length;i++){
        const u=i/(pts.length-1);
        ctx.strokeStyle = rgba(col, 0.08+0.62*u*u);
        ctx.lineWidth = w0*(0.35+0.65*u);
        ctx.beginPath(); ctx.moveTo(pts[i-1][0],pts[i-1][1]); ctx.lineTo(pts[i][0],pts[i][1]); ctx.stroke();
      }
      // l'etoile : halo proportionnel a l'eclat, coeur blanc
      const r = Math.max(0.9, 2.6-0.36*st.v);
      const rg = ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r*3.2);
      rg.addColorStop(0, "rgba(255,255,255,0.95)"); rg.addColorStop(0.3, rgba(col,0.55)); rg.addColorStop(1, rgba(col,0));
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(p[0],p[1],r*3.2,0,2*Math.PI); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p[0],p[1],r*0.75,0,2*Math.PI); ctx.fill();
    });
    ctx.restore();
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(L, T, R-L, B-T, 5) : ctx.rect(L, T, R-L, B-T); ctx.stroke();
  };
  panel(0,   t("open-panel-globe"), g, NIGHT.globe, false);
  panel(194, t("open-panel-flat"),  f, NIGHT.flat,  true);
  ctx.strokeStyle = "#d9dde3"; ctx.beginPath(); ctx.moveTo(190,14); ctx.lineTo(190,top+size); ctx.stroke();
  ctx.textAlign = "end"; ctx.fillStyle = "#b45309"; ctx.font = "10px ui-sans-serif,system-ui,sans-serif";
  ctx.fillText(t("open-nts") !== "open-nts" ? t("open-nts") : "not to scale — gnomonic, one place, both models", 376, 197);   // 2026-10-01 : traduit
  ctx.textAlign = "start";
}
function openLoop(ts){
  openRAF=null;
  if($("st-figOpen").closest("[hidden]")){ openLast=0; return; }   // masque : la boucle meurt
  if(!openLast) openLast=ts;
  const dt=Math.min(0.4,(ts-openLast)/1000); openLast=ts;
  openT=(openT + dt*0.35) % 23.9345;                            // 0,35 h de ciel par seconde
  drawOpen();
  if(openPlay && hasRAF) openRAF=requestAnimationFrame(openLoop);
}
let openLast=0;
/* requestAnimationFrame N'EXISTE PAS DANS jsdom SANS pretendToBeVisual, et c'est
   dans jsdom que tournent les audits de figures. Le premier jet plantait le banc
   entier sur un ReferenceError avant meme d'avoir dessine une table. Absence de
   rAF = meme traitement que prefers-reduced-motion : on dessine une image et on
   s'arrete. Une figure animee ne doit jamais pouvoir empecher le reste de la
   page de se rendre. */
const hasRAF = typeof requestAnimationFrame === "function";
// export (epic10/UC02) : le ciel d'ouverture sur un jour sidéral complet (23,93 h, en 34 s,
// 2 × le repos) et la figure du rythme (SVG) sur un tour (12,5 s) ; état rendu à la fin
const openExportAnim = {
  duration: 23.9345 / 0.7,
  begin(){ this.s = { t: openT, play: openPlay }; openPlay = false; if(openRAF){ cancelAnimationFrame(openRAF); openRAF = null; } },
  frameAt(tt){ openT = (this.s.t + tt * 0.7) % 23.9345; drawOpen(); },
  end(){ openT = this.s.t; openPlay = this.s.play; drawOpen(); if(openPlay && hasRAF && !openRAF){ openLast = 0; openRAF = requestAnimationFrame(openLoop); } },
};
const rateExportAnim = {
  duration: 12.5,
  begin(){ this.s = { t: rateT, play: ratePlay }; ratePlay = false; if(rateRAF){ cancelAnimationFrame(rateRAF); rateRAF = null; } },
  frameAt(tt){ rateT = (this.s.t + tt / 12.5) % 1; rateTick(); },
  end(){ rateT = this.s.t; ratePlay = this.s.play; rateTick(); if(ratePlay && hasRAF && !rateRAF){ rateLast = 0; rateRAF = requestAnimationFrame(rateLoop); } },
};
function openStart(){
  const oc = $("st-figOpen")?.querySelector("canvas"); if(oc) oc.__anim = openExportAnim;
  const reduce = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || !hasRAF;
  drawOpen();
  if(reduce){ openPlay=false; return; }
  if(!openRAF) { openLast=0; openRAF=requestAnimationFrame(openLoop); }
}

/* ---- figure des trainees ---- */
function skySvg(){
  const sp=STAR_SPOTS[S.spot], h=STAR_DOMES[S.dome], jd0=jdOf(), vw=STAR_VIEWS[S.view];
  const half=186, top=18, size=170;
  const K=(size/2)/tan(FOV);
  const N=49;
  const byHR={}; STARS.forEach((st,i)=>byHR[st.hr]=st);

  const panel=(x0,title,fp,col,posFn)=>{
    const aim = vw.k==="fix" ? fp : {alt:vw.alt, az:vw.az};
    const cam=camera(aim), cx=x0+half/2, cy=top+size/2;
    const XY=p=>[cx+p[0]*K, cy-p[1]*K];
    let s=`<text x="${cx}" y="${top-5}" text-anchor="middle" font-size="11" font-weight="600">${title}</text>`;
    s+=`<clipPath id="st-cp${x0}"><rect x="${x0+8}" y="${top}" width="${half-16}" height="${size}"/></clipPath>`;
    s+=`<g clip-path="url(#st-cp${x0})">`;
    // NUIT (2026-09-24) : meme ciel que l'ouverture, degrade + sol sous l'horizon
    s+=`<rect x="${x0+8}" y="${top}" width="${half-16}" height="${size}" fill="url(#st-skyGrad)" stroke="var(--line)"/>`;
    // horizon
    let run=[]; const hz=[];
    const flushHz=()=>{ if(run.length>1) s+=`<polyline points="${run.join(" ")}" fill="none" stroke="var(--horizon)" stroke-width="1.2"/>`; run=[]; };
    for(let a=0;a<=360;a+=1){
      const p=project(cam,0,a);
      if(p){ const q=XY(p); hz.push(q); run.push(`${q[0].toFixed(1)},${q[1].toFixed(1)}`); } else flushHz();
    }
    flushHz();
    { // sol : sous la plus longue portion d'horizon visible
      let r2=[], b2=[];
      for(let a=0;a<=360;a+=1){ const p=project(cam,0,a); if(p) r2.push(XY(p)); else { if(r2.length>b2.length) b2=r2; r2=[]; } }
      if(r2.length>b2.length) b2=r2;
      if(b2.length>1){
        b2.sort((p,q)=>p[0]-q[0]);
        const pts=[[b2[0][0]-40,b2[0][1]],...b2,[b2[b2.length-1][0]+40,b2[b2.length-1][1]],[x0+half+40,top+size+40],[x0-40,top+size+40]];
        s+=`<polygon points="${pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ")}" fill="${NIGHT.ground}"/>`;
        s+=`<polyline points="${b2.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ")}" fill="none" stroke="${NIGHT.horizon}" stroke-width="1"/>`;
      }
    }
    // points cardinaux, sur l'horizon
    [["N",0],["E",90],["S",180],["W",270]].forEach(([lab,az])=>{
      const p=project(cam,0,az); if(!p) return;
      const q=XY(p);
      s+=`<line x1="${q[0].toFixed(1)}" y1="${(q[1]-5).toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${NIGHT.horizon}"/>`;
      // L'ETIQUETTE VA AU-DESSUS DE L'HORIZON. En dessous, elle sortait du cadre
      // des que l'horizon touchait le bas du panneau — visee sur le point fixe.
      s+=`<text x="${q[0].toFixed(1)}" y="${(q[1]-8).toFixed(1)}" font-size="8.5" text-anchor="middle" fill="${NIGHT.ink}"
        stroke="${NIGHT.halo}" stroke-width="2.4" paint-order="stroke">${t("az-"+lab)}</text>`;
    });
    // trainees
    const pos0={};                       // position de depart, pour les points
    STARS.forEach(st=>{
      let seg=[];
      const flush=()=>{ if(seg.length>1){
        s+=`<polyline points="${seg.join(" ")}" fill="none" stroke="${col}"
             stroke-width="${Math.max(0.55, 1.75-0.26*st.v)}" stroke-linecap="round" opacity="0.85"/>`;
      } seg=[]; };
      for(let i=0;i<N;i++){
        const jd=jd0+(i/(N-1))*EXPO_H/24;
        const q=posFn(st,sp,jd,h);
        const p=(q.alt>0)?project(cam,q.alt,q.az):null;
        if(p){ const t=XY(p); seg.push(`${t[0].toFixed(1)},${t[1].toFixed(1)}`); if(i===0) pos0[st.hr]=t; }
        else flush();
      }
      flush();
    });
    // les deux asterismes : segments et points, a l'instant du DEBUT de pose
    Object.entries(ASTER).forEach(([nom,hrs])=>{
      let seg=[];
      const flush=()=>{ if(seg.length>1) s+=`<polyline points="${seg.join(" ")}" fill="none" stroke="${col}" stroke-width="0.7" stroke-dasharray="3 2.5" opacity="0.75"/>`; seg=[]; };
      hrs.forEach(hr=>{
        if(hr===null){ flush(); return; }
        const t=pos0[hr]; if(!t){ flush(); return; }
        seg.push(`${t[0].toFixed(1)},${t[1].toFixed(1)}`);
      });
      flush();
      hrs.forEach(hr=>{ const t=pos0[hr]; if(hr!==null&&t)
        s+=`<circle cx="${t[0].toFixed(1)}" cy="${t[1].toFixed(1)}" r="${Math.max(1.2,2.6-0.3*byHR[hr].v).toFixed(1)}" fill="${col}"/>`; });
      // etiquette au barycentre des points visibles
      const pts=hrs.filter(hr=>hr!==null&&pos0[hr]).map(hr=>pos0[hr]);
      if(pts.length>=3){
        const mx=pts.reduce((a,p)=>a+p[0],0)/pts.length, my=pts.reduce((a,p)=>a+p[1],0)/pts.length;
        // SOUS le groupe : au-dessus, l'etiquette de la Petite Ourse tombait
        // exactement sur la croix du point fixe, Polaris etant a 0,6° du pole.
        /* L'etiquette va SOUS le groupe, sauf si le groupe est deja dans la
           moitie basse du panneau : la, elle tombait sur la lettre cardinale de
           l'horizon — « Croix du Sud » a cheval sur le « E », visee est depuis
           Paris. Dans ce cas elle passe au-dessus. */
        const lo=Math.max(...pts.map(p=>p[1])), hi=Math.min(...pts.map(p=>p[1]));
        /* On regarde OU EST REELLEMENT L'HORIZON a l'abscisse de l'etiquette, au
           lieu de deviner avec un seuil sur la hauteur du panneau. Le seuil « moitie
           basse » laissait passer « Croix du Sud » a cheval sur le « E » : le
           barycentre tombait a un pixel du seuil. Ici il n'y a plus de reglage a
           deviner — on mesure. */
        let hy=Infinity;
        for(const q of hz) if(Math.abs(q[0]-mx)<14) hy=Math.min(hy,q[1]);
        const bas = (lo+11) > hy-14;
        s+=`<text x="${mx.toFixed(1)}" y="${(bas ? hi-7 : lo+11).toFixed(1)}" font-size="8" text-anchor="middle" fill="${col}"
             stroke="${NIGHT.halo}" stroke-width="2.4" paint-order="stroke" opacity="0.95">${nom}</text>`;
      }
    });
    // le point fixe, s'il est dans le champ
    const pf=project(cam,fp.alt,fp.az);
    if(pf){ const t=XY(pf);
      s+=`<path d="M${(t[0]-5).toFixed(1)} ${t[1].toFixed(1)}h10M${t[0].toFixed(1)} ${(t[1]-5).toFixed(1)}v10" stroke="${col}" stroke-width="1.7"/>`; }
    s+=`</g>`;
    /* RIEN D'AUTRE SUR LE CANVAS. Les deux lignes de legende qui etaient ici —
       altitude of the fixed point, lieu, date, pose, dome — debordaient des 380 px
       des que le nom du lieu depassait « Paris ». Elles sont dans .reads, ou
       leur longueur n'a aucune importance. */
    return s;
  };
  const g=fixedGlobe(sp.lat), f=fixedFlat(sp.lat,h);
  return `<defs><linearGradient id="st-skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NIGHT.top}"/><stop offset="0.55" stop-color="${NIGHT.mid}"/><stop offset="1" stop-color="${NIGHT.low}"/></linearGradient></defs>`
       + panel(0,t("panel-globe"),g,NIGHT.globe,(st,s,jd)=>posGlobe(st,s,jd))
       + panel(194,t("panel-flat-disc"),f,NIGHT.flat,(st,s,jd,hh)=>posFlat(st,s,jd,hh))
       + `<line x1="190" y1="12" x2="190" y2="${top+size}" stroke="var(--line)"/>`;
}

/* ---- L'OBJECTION DE L'OVALE, EN IMAGE -----------------------------------
   Le premier jet tracait une COURBE d'ovalisation contre l'erreur de visee.
   Verdict du proprietaire, et il est juste : on n'y comprend rien. Un rapport
   de rayons porte sur un objet que le lecteur n'a jamais vu dessine ; on lui
   demandait de croire un nombre a propos d'une forme.

   Ici il voit la forme. Une seule vue, en perspective, depuis la ville choisie,
   vers le nord — et l'appareil ne vise PAS le point fixe : il est en bas a
   droite du cadre, comme sur une vraie photo mal cadree. Deux boutons : le
   modele, l'objectif. Et un trait discontinu qui est l'image d'un CERCLE
   PARFAIT centre sur le point fixe, vu par ce meme objectif depuis ce meme
   cadrage.

   Ce que la figure montre alors sans un mot :
   - globe : la trainee est ovale, et elle est ovale EXACTEMENT COMME le trait
     discontinu. L'ovale est celui de l'objectif, il est partage.
   - disque plat : la trainee quitte le trait discontinu d'un cote et pas de
     l'autre. La deformation optique est symetrique autour du centre de l'image ;
     celle du modele plat ne l'est pas. Ce n'est pas une question de combien,
     c'est une question de forme.

   Un objectif ne fait que deplacer un point le long du rayon qui le joint au
   centre de l'image : c'est une application RADIALE, jamais lineaire (voir la
   legende). Elle ne peut donc pas rendre asymetrique ce qui etait symetrique,
   ni l'inverse. */
const PROJ_FOV = 62;                     // demi-champ, en degres
/* Le point fixe part en bas, legerement a droite. Premier essai : alt +20,
   az -24 — la boucle se retrouvait entierement dans la moitie droite du cadre
   et la moitie gauche etait vide. On decale surtout en HAUTEUR : la boucle
   descend sous l'axe optique et s'etale alors sur toute la largeur. */
/* Compromis assume. Plus l'appareil est desaxe, plus l'objectif ovalise — donc
   plus la demonstration est franche — mais plus la boucle s'etire vers le bas
   dans l'image (tan), et plus le haut du cadre se vide une fois le centre de
   l'image remis au centre du cadre. A 22° hors axe le dessin n'occupait plus
   que 55 % de la hauteur ; a 14° il en occupe 64 % et l'objectif ovalise encore
   de 14 %. C'est la que le reglage est pose, et pour cette raison. */
const PROJ_OFF = {alt: 13, az: -9};

/* SEPT OBJECTIFS, ET UNE MISE EN GARDE QUI COMPTE AUTANT QU'EUX.
   La distance focale ne deforme RIEN : sur un objectif rectilineaire ideal,
   r = f·tan θ, et changer f multiplie toute l'image par un facteur constant —
   c'est un zoom, pas une deformation. Ce qui change les formes, c'est la LOI DE
   PROJECTION (rectilineaire, stereographique, equisolide, equidistante,
   orthographique) et la distorsion residuelle du dessin optique. Les focales
   ci-dessous ne sont donc que des reperes : elles disent au lecteur a quoi
   ressemble le materiel qui se comporte comme ca, elles ne sont pas le
   parametre. Les coefficients de barillet sont des ordres de grandeur typiques
   pour ces classes d'objectifs, pas la mesure d'un modele precis — c'est dit
   dans la legende, et aucun chiffre de la page n'en depend.

   Le point commun des sept, et c'est tout l'argument : ce sont TOUTES des
   applications RADIALES. Chacune deplace un point le long du rayon qui le joint
   au centre de l'image, sans jamais changer son angle polaire. Aucune ne peut
   donc rendre asymetrique autour du centre ce qui etait symetrique, ni
   l'inverse. */
/* Les huit lois vivent désormais dans src/core/lenses.js (epic13 : curv les
   montre sur l'horizon) ; mêmes formules, en radians -- d'où l'adaptateur. */
const PROJ_LENSES = LENSES.map((L) => ({ k: L.k, n: "lens-" + L.k, f: (th) => L.r(th * D2R) }));
function projRadius(thDeg, lens){
  const L=PROJ_LENSES.find(x=>x.k===lens) || PROJ_LENSES[0];
  return L.f(thDeg);
}
function projSvg(){
  const sp=STAR_SPOTS[S.spot], h=STAR_DOMES[S.dome], jd0=jdOf();
  const flat = S.model==="f";
  const lens = S.lens;
  const fp = flat ? fixedFlat(sp.lat,h) : fixedGlobe(sp.lat);
  const col = flat ? "var(--flat)" : "var(--globe)";
  /* « Cadrage : point fixe vise » remet l'ecart a zero. C'est le CONTROLE de la
     figure, et il repond a la question qu'on nous a posee — « rectilineaire et
     fisheye ne sont-ils pas inverses ? ». Non : un objectif rectilineaire
     conserve les DROITES, pas les cercles. L'image gnomonique d'un cercle du
     ciel est une conique, donc une ellipse des que l'axe optique n'est pas
     perpendiculaire au plan du cercle. Vise juste, les deux objectifs rendent
     le cercle exactement rond (1,0000) ; decentre de 25°, le rectilineaire
     ovalise a 1,33 et le fisheye a 1,08 seulement. C'est bien le rectilineaire
     qui deforme le plus, et le lecteur peut le verifier ici en un clic. */
  const OFF = S.aim==="on" ? {alt:0, az:0} : PROJ_OFF;
  const cam = camera({alt: fp.alt+OFF.alt, az: fp.az+OFF.az});
  /* Cadre presque carre (380 x 294) et non 16:9. Une fois le centre de l'image
     remis au centre du cadre — c'est le sujet meme de cette figure — un cadre
     large laisse forcement deux grandes bandes vides a gauche et a droite,
     puisque ce qu'on dessine est a peu pres rond. */
  const W=380, HH=294, cx=W/2, cy=HH/2;
  const K=(Math.min(W,HH)/2-8)/projRadius(PROJ_FOV,lens);
  const put=v=>{                          // direction -> pixel, ou null
    const d=dot(v,cam.c);
    const th=Math.acos(Math.max(-1,Math.min(1,d)))*R2D;
    if(th>PROJ_FOV) return null;
    const x=dot(v,cam.r), y=dot(v,cam.u), L=Math.hypot(x,y)||1e-12;
    const R=projRadius(th,lens)*K;
    return [cx+R*x/L, cy-R*y/L];
  };
  const poly=(pts,attr)=>{
    let out="",run=[];
    const flush=()=>{ if(run.length>1) out+=`<polyline points="${run.join(" ")}" ${attr}/>`; run=[]; };
    for(const p of pts){ if(p) run.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`); else flush(); }
    flush(); return out;
  };
  /* On CADRE ensuite. Sans recadrage, la boucle occupait le quart du dessin au
     milieu d'un cadre vide : le champ necessaire pour la contenir (53° hors axe)
     est bien plus large qu'elle. Recadrer, c'est-a-dire translater et zoomer
     d'un facteur UNIFORME, ne change aucune forme — c'est exactement ce que
     fait un recadrage de photo. Le rapport des rayons, l'ovalisation, la
     symetrie : rien de ce qu'on compare ici n'y est sensible. L'axe optique
     reste dans le cadre, il fait partie de la demonstration. */
  let s=`<rect x="0" y="0" width="${W}" height="${HH}" fill="#fbfbfd" stroke="var(--line)"/>`
       +`<clipPath id="st-cpProj"><rect x="1" y="1" width="${W-2}" height="${HH-2}"/></clipPath>`;
  let body="", BB=null;
  const seen=p=>{ if(!p) return; if(!BB) BB=[p[0],p[1],p[0],p[1]];
    else { BB[0]=Math.min(BB[0],p[0]); BB[1]=Math.min(BB[1],p[1]); BB[2]=Math.max(BB[2],p[0]); BB[3]=Math.max(BB[3],p[1]); } };
  // horizon
  /* UNE GRILLE DE DROITES REELLES. Chaque ligne est construite dans le plan
     tangent gnomonique de l'appareil : l'ensemble des directions
     normalize(c + u·r + v·h) a u fixe est un GRAND CERCLE du ciel, c'est-a-dire
     l'image d'une droite de l'espace — un fil a plomb, l'arete d'un mur, une
     ligne d'horizon. Un objectif rectilineaire les rend droites : c'est sa
     definition, et c'est de la qu'il tient son nom. Les six autres les courbent,
     et le lecteur voit alors de ses yeux que l'objectif deforme violemment la
     scene — pendant que la trainee du globe, elle, reste collee au cercle
     parfait. C'est ce contraste qui repond a l'objection de l'ovale, bien mieux
     qu'un chiffre.
     La grille est HORS du calcul de cadrage : elle deborde volontiers, elle est
     coupee par le cadre, et c'est ce que fait une grille dans une photo. */
  const G=[-1.2,-0.8,-0.4,0,0.4,0.8,1.2];
  const dir=(u,v)=>{
    const x=cam.c[0]+u*cam.r[0]+v*cam.u[0], y=cam.c[1]+u*cam.r[1]+v*cam.u[1], z2=cam.c[2]+u*cam.r[2]+v*cam.u[2];
    const L=Math.hypot(x,y,z2)||1; return [x/L,y/L,z2/L];
  };
  G.forEach(u=>{ const seg=[]; for(let t=-1.4;t<=1.4001;t+=0.05) seg.push(put(dir(u,t)));
    body+=poly(seg,`fill="none" stroke="var(--line)" stroke-width="0.8"`); });
  G.forEach(v=>{ const seg=[]; for(let t=-1.4;t<=1.4001;t+=0.05) seg.push(put(dir(t,v)));
    body+=poly(seg,`fill="none" stroke="var(--line)" stroke-width="0.8"`); });
  const hz=[]; for(let a=0;a<=360;a+=1) hz.push(put(enu(0,a)));
  body+=poly(hz,`fill="none" stroke="var(--horizon)" stroke-width="1.1"`);
  // le cercle de reference : un cercle PARFAIT autour du point fixe, meme objectif
  const st=pickProjStar(sp);
  if(!st){
    $("st-projKey").innerHTML=`<li>${t("proj-no-star").replace("{place}", sp.n)}</li>`;
    $("st-projReads").innerHTML=`<span>${sp.n}</span><span>${t("proj-no-star-read")}</span>`;
    return s+`<text x="${cx}" y="${cy}" text-anchor="middle" font-size="10" fill="var(--mute)">${t("proj-no-star-canvas")}</text>`;
  }
  const pTrue = 90-Math.abs(precess(st.ra,st.de,jd0).dec);
  const fpv=enu(fp.alt,fp.az);
  let e1=[-fpv[1],fpv[0],0]; const n1=Math.hypot(e1[0],e1[1])||1; e1=[e1[0]/n1,e1[1]/n1,0];
  const e2=cross(fpv,e1);
  const ring=[];
  for(let t=0;t<=360;t+=2){
    const ct=cos(t), st2=sin(t), cp=cos(pTrue), sp2=sin(pTrue);
    ring.push(put([fpv[0]*cp+ (e1[0]*ct+e2[0]*st2)*sp2,
                   fpv[1]*cp+ (e1[1]*ct+e2[1]*st2)*sp2,
                   fpv[2]*cp+ (e1[2]*ct+e2[2]*st2)*sp2]));
  }
  // (le cercle de reference est dessine PLUS BAS, par-dessus la trainee)
  // la trainee reelle de l'etoile, sur un tour complet
  const tr=[];
  for(let i=0;i<=360;i++){
    const jd=jd0+i/360*0.99727;
    const q = flat ? posFlat(st,sp,jd,h) : posGlobe(st,sp,jd);
    tr.push(q.alt>0 ? put(enu(q.alt,q.az)) : null);
  }
  tr.forEach(seen);
  /* Les autres etoiles de l'asterisme polaire, en trait fin et sur un tour
     complet. Elles ne comptent PAS dans le cadrage : leurs boucles sortent du
     champ pour les plus eloignees du pole, et c'est tres bien — une trajectoire
     coupee montre quand meme sa forme, alors qu'un cadre qui recule pour tout
     contenir rend la boucle principale minuscule. */
  const famHR = sp.lat>=0 ? ASTER["Ursa Minor"] : ASTER["Southern Cross"];
  const fam=[...new Set(famHR.filter(x=>x!==null))].map(hr=>STARS.find(x=>x.hr===hr)).filter(x=>x&&x.hr!==st.hr);
  fam.forEach(fs=>{
    const seg=[];
    for(let i=0;i<=360;i++){
      const jd=jd0+i/360*0.99727;
      const q = flat ? posFlat(fs,sp,jd,h) : posGlobe(fs,sp,jd);
      seg.push(q.alt>0 ? put(enu(q.alt,q.az)) : null);
    }
    body+=poly(seg,`fill="none" stroke="${col}" stroke-width="0.9" opacity="0.55"`);
  });
  body+=poly(tr,`fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"`);
  /* LE TRAIT DISCONTINU PASSE AU-DESSUS. Dessine avant, il etait entierement
     recouvert par la trainee dans le cas du globe — c'est-a-dire precisement
     quand les deux coincident, le seul cas ou le lecteur DOIT voir qu'il y a
     bien deux traces superposees. Par-dessus, les tirets se detachent sur la
     couleur du modele et la coincidence devient visible. */
  ring.forEach(seen);
  body+=poly(ring,`fill="none" stroke="#111827" stroke-width="1.2" stroke-dasharray="5 5"`);
  // le point fixe
  const pf=put(fpv); seen(pf); seen([cx,cy]);
  if(pf) body+=`<path d="M${(pf[0]-6).toFixed(1)} ${pf[1].toFixed(1)}h12M${pf[0].toFixed(1)} ${(pf[1]-6).toFixed(1)}v12" stroke="${col}" stroke-width="1.9"/>`;
  // centre de l'image : l'axe optique
  /* L'AXE OPTIQUE N'EST PLUS UNE CROIX. Il en portait une, comme le point fixe,
     et on nous a signale — a juste titre — qu'on ne savait pas a quoi
     correspondait « la petite croix ». Deux reperes differents doivent avoir
     deux formes differentes : croix pleine coloree pour le point fixe, cercle
     gris creux a point central pour l'axe optique. */
  body+=`<circle cx="${cx}" cy="${cy}" r="4" fill="none" stroke="var(--mute)" stroke-width="1.1"/>`;
  body+=`<circle cx="${cx}" cy="${cy}" r="1.1" fill="var(--mute)"/>`;
  /* LE CADRE EST CENTRE SUR L'AXE OPTIQUE, PAS SUR LE CONTENU. La version
     precedente recadrait sur la boite englobante du dessin, ce qui deplacait le
     centre de l'image hors du centre du cadre — et c'est absurde : sur une
     photo, le centre de l'image EST l'axe optique, par definition. C'est le
     RESTE qui doit etre decentre. On garde donc (cx,cy) au milieu du cadre et
     on choisit le zoom pour que le point dessine le plus lointain tienne dedans.
     Le vide qui reste d'un cote n'est pas un defaut de mise en page : c'est ce
     que donne une photo dont le sujet n'est pas au centre. */
  const M=14;
  let dmx=1, dmy=1;
  const far=p=>{ if(!p) return; dmx=Math.max(dmx,Math.abs(p[0]-cx)); dmy=Math.max(dmy,Math.abs(p[1]-cy)); };
  tr.forEach(far); ring.forEach(far); far(pf);
  const z=Math.min((W/2-M)/dmx,(HH/2-M)/dmy);
  const tx=W/2-z*cx, ty=HH/2-z*cy;
  s+=`<g clip-path="url(#st-cpProj)" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${z.toFixed(3)})"
        vector-effect="non-scaling-stroke">${body}</g>`;
  // ecart maximal entre la trainee et le cercle de reference, en pixels
  /* L'ECART EST EN POURCENTAGE DU RAYON DU CERCLE DE REFERENCE, pas en pixels :
     une mesure en pixels change des qu'on rezoome le cadre, donc elle ne veut
     rien dire hors de cette figure-ci. En pourcentage elle survit au recadrage,
     et le lecteur peut la refaire sur sa propre photo. */
  let dev=0, rsum=0, rn=0;
  if(pf) for(const q of ring){ if(!q) continue; rsum+=Math.hypot(q[0]-pf[0],q[1]-pf[1]); rn++; }
  const rmean=rn?rsum/rn:1;
  for(const p of tr){ if(!p) continue; let best=1e9;
    for(const q of ring){ if(!q) continue; const d=Math.hypot(p[0]-q[0],p[1]-q[1]); if(d<best) best=d; }
    if(best>dev) dev=best; }
  const devPct=100*dev/rmean;
  /* LEGENDE COURTE. Elle avait enfle a six lignes de phrases : sous une figure
     de 214 px, une legende plus haute que le dessin cesse d'etre une legende.
     Un glyphe et deux mots par entree. */
  const C=flat?"#c2410c":"#1d4ed8";
  const gl=g=>`<svg width="20" height="12" viewBox="0 0 20 12" style="width:20px;height:12px;vertical-align:-2px">${g}</svg>`;
  $("st-projKey").innerHTML=
    `<li>${gl(`<line x1="0" y1="6" x2="20" y2="6" stroke="${C}" stroke-width="2.6"/>`)} ${st.n}`+
    `&nbsp; ${gl(`<line x1="0" y1="6" x2="20" y2="6" stroke="${C}" stroke-width="1" opacity="0.55"/>`)} ${t("proj-key-neighbours")}`+
    `&nbsp; ${gl(`<line x1="0" y1="6" x2="20" y2="6" stroke="#111827" stroke-width="1.6" stroke-dasharray="4 4"/>`)} ${t("proj-key-perfect-circle").replace("{deg}", fmt(pTrue,1))}</li>`+
    `<li>${gl(`<path d="M4 6h12M10 0v12" stroke="${C}" stroke-width="1.9"/>`)} ${t("proj-key-fixed-point")}`+
    `&nbsp; ${gl(`<circle cx="10" cy="6" r="4" fill="none" stroke="#6b7280" stroke-width="1.1"/><circle cx="10" cy="6" r="1.1" fill="#6b7280"/>`)} ${t("proj-key-optical-axis")}</li>`+
    `<li>${gl(`<path d="M0 2h20M0 6h20M0 10h20M4 0v12M10 0v12M16 0v12" stroke="#c8ccd6" stroke-width="0.9"/>`)} ${t("proj-key-straight-lines")}</li>`+
    `<li>${t("proj-key-gap").replace("{pct}", fmt(devPct,0))}</li>`;
  $("st-projReads").innerHTML=
    `<span><b>${sp.n}</b></span>`+
    `<span class="${flat?"f":"g"}">${flat?t("panel-flat-disc"):t("panel-globe")} · ${t((PROJ_LENSES.find(x=>x.k===lens)||PROJ_LENSES[0]).n)}</span>`+
    /* L'ECART HORS AXE EST UN ANGLE SUR LE CIEL, PAS hypot(dAlt, dAz). Un ecart
       d'azimut se contracte en cos(altitude) : a 49° de hauteur, 12° d'azimut n'en
       font que 7,9 sur le ciel. La premiere version annoncait 31° la ou il y en
       avait 25. */
    `<span>${t("proj-read-off-axis").replace("{alt}", fmt(fp.alt,1)).replace("{compass}", azName(fp.az)).replace("{deg}", fmt(Math.acos(Math.max(-1,Math.min(1,dot(fpv,cam.c))))*R2D,0))}</span>`;
  return s;
}
/* Pour CETTE figure on ne veut pas le plus grand rayon possible : une boucle de
   41° debordait du champ des que le point fixe etait decentre, et une courbe
   coupee ne se compare a rien. On prend le rayon le plus proche de 25°. */
function pickProjStar(sp){
  const p=90-Math.abs(sp.lat), la=Math.abs(sp.lat);
  const ok=STARS.filter(s=>{ const d=sp.lat>=0?s.de:-s.de; return d>p && d>=la && s.v<=3.2; });
  if(!ok.length) return null;
  return ok.sort((a,b)=>Math.abs(90-Math.abs(a.de)-25)-Math.abs(90-Math.abs(b.de)-25))[0];
}

/* ---- le rythme le long de la trainee ----------------------------------
   L'observable est l'ANGLE DE POSITION autour du point fixe, pas la longueur du
   tiret sur l'image. C'est ce qui rend le test immune a l'objectif : vise sur le
   point fixe, celui-ci est le centre de l'image, et une application radiale —
   les huit de la liste en sont — deplace les points le long des rayons sans
   toucher a leur angle polaire. Le lecteur peut donc mesurer au rapporteur sur
   un tirage, quel que soit son materiel.
   Sur un globe l'etoile tourne a vitesse angulaire constante autour du pole :
   chaque intervalle de meme duree balaie le meme angle, exactement, pour toute
   etoile et toute latitude. Aucun parametre libre nulle part. */
function posAngle(v, fpv, e1, e2){
  const x=dot(v,e1), y=dot(v,e2);
  return Math.atan2(y,x)*R2D;
}
function rateSeries(sp, st, h, jd0, flat, N){
  const fp = flat ? fixedFlat(sp.lat,h) : fixedGlobe(sp.lat);
  const fpv=enu(fp.alt,fp.az);
  let e1=[-fpv[1],fpv[0],0]; const n1=Math.hypot(e1[0],e1[1])||1; e1=[e1[0]/n1,e1[1]/n1,0];
  const e2=cross(fpv,e1);
  const a=[];
  for(let i=0;i<=N;i++){
    const jd=jd0+(i/N)*0.99727;
    const q = flat ? posFlat(st,sp,jd,h) : posGlobe(st,sp,jd);
    a.push(posAngle(enu(q.alt,q.az), fpv, e1, e2));
  }
  const d=[];
  for(let i=0;i<N;i++){ let x=a[i+1]-a[i]; while(x>180)x-=360; while(x<-180)x+=360; d.push(Math.abs(x)); }
  return d;
}
let rateGeom={}, rateRAF=null, rateT=0, rateLast=0, ratePlay=true;
function rateSvg(){
  const sp=STAR_SPOTS[S.spot], h=STAR_DOMES[S.dome], jd0=jdOf(), st=pickProjStar(sp);
  rateGeom={sp,h,jd0,st};
  if(!st){ $("st-rateKey").innerHTML=`<li>${t("rate-no-star").replace("{place}", sp.n)}</li>`;
    return `<text x="190" y="100" text-anchor="middle" font-size="10" fill="var(--mute)">${t("proj-no-star-canvas")}</text>`; }
  const N=24;                                   // 24 tirets sur un tour : 59 min 44 s chacun
  const G=rateSeries(sp,st,h,jd0,false,N), F=rateSeries(sp,st,h,jd0,true,N);
  /* LES TIRETS EUX-MEMES, EN HAUT. Le graphique dit combien ; le dessin dit a
     quoi ca ressemble sur un tirage. Vise sur le point fixe des deux cotes —
     c'est le cadrage qui rend la mesure insensible a l'objectif — et meme
     echelle angulaire dans les deux panneaux, sinon on comparerait des zooms. */
  const dashPanel=(x0,flat2,col)=>{
    const fp = flat2 ? fixedFlat(sp.lat,h) : fixedGlobe(sp.lat);
    const cam=camera(fp), cx=x0+93, cy=72, half=93, size=108;   // cy descendu : la boucle plate touchait le titre
    const pmax=Math.max(...[...Array(97)].map((_,k)=>{
      const jd=jd0+(k/96)*0.99727;
      const q=flat2?posFlat(st,sp,jd,h):posGlobe(st,sp,jd);
      const v=enu(q.alt,q.az), dd=dot(v,cam.c);
      return q.alt>0 ? Math.acos(Math.max(-1,Math.min(1,dd)))*R2D : 0;
    }));
    /* PROJECTION EQUIDISTANTE (r ∝ θ) POUR CES DEUX VIGNETTES, et une echelle
       propre a chaque panneau. En gnomonique, la boucle plate monte a 81° du
       point fixe, tan(81°) = 6,3, et tout le reste s'ecrasait sur un point : le
       panneau plat devenait illisible au moment ou il avait quelque chose a
       montrer. Ce qui se compare ici est la REGULARITE des tirets, pas leur
       taille — deux echelles differentes ne coutent donc rien, et la legende
       le dit. */
    const K=(size/2-6)/Math.max(1e-6,pmax);
    /* On MEMORISE la geometrie du panneau. L'animation ne redessine pas la
       figure : elle deplace trois elements par leurs attributs. Regenerer le SVG
       a chaque image couterait 24 tirets x 8 points x 2 panneaux plus la serie
       du graphique, soixante fois par seconde, pour bouger deux points. */
    rateGeom[flat2?"f":"g"]={cam,cx,cy,K,flat:flat2};
    let o=`<text x="${cx}" y="12" text-anchor="middle" font-size="10" font-weight="600">${flat2?t("panel-flat-disc"):t("panel-globe")}</text>`;
    const M=8*N;                                   // 8 points par tiret
    let run=[];
    const flush=(on)=>{ if(run.length>1&&on) o+=`<polyline points="${run.join(" ")}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round"/>`; run=[]; };
    for(let k=0;k<=M;k++){
      const jd=jd0+(k/M)*0.99727;
      const q=flat2?posFlat(st,sp,jd,h):posGlobe(st,sp,jd);
      const on=Math.floor(k/(M/N/2))%2===0;         // un intervalle sur deux
      const v=enu(q.alt,q.az), dd=dot(v,cam.c);
      const th=Math.acos(Math.max(-1,Math.min(1,dd)))*R2D;
      if(th>110||q.alt<=0){ flush(on); continue; }
      const px=dot(v,cam.r), py=dot(v,cam.u), Lp=Math.hypot(px,py)||1e-12;
      const rr=th*K;
      run.push(`${(cx+rr*px/Lp).toFixed(1)},${(cy-rr*py/Lp).toFixed(1)}`);
      if(k>0 && Math.floor((k-1)/(M/N/2))%2!==Math.floor(k/(M/N/2))%2) flush(!on);
    }
    flush(true);
    o+=`<circle cx="${cx}" cy="${cy}" r="3.4" fill="none" stroke="var(--mute)" stroke-width="1"/>`;
    o+=`<circle cx="${cx}" cy="${cy}" r="1" fill="var(--mute)"/>`;
    /* TRAINE DE FANTOMES (2026-09-24) : six positions passees, a intervalles de
       temps EGAUX. Sur le globe elles restent regulierement espacees ; sur le
       disque elles se tassent puis s'etirent -- la these de la figure, visible
       sans lire le graphique. */
    for(let k=RATE_GHOSTS;k>=1;k--)
      o+=`<circle id="st-rateDot${flat2?"F":"G"}${k}" cx="${cx}" cy="${cy}" r="${(3.4-0.35*k).toFixed(2)}" fill="${col}" opacity="0"/>`;
    o+=`<circle id="st-rateDot${flat2?"F":"G"}" cx="${cx}" cy="${cy}" r="3.6" fill="${col}"/>`;
    return o;
  };
  const L=44,R=368,T=146,B=308;
  const ymax=Math.max(12, Math.ceil(Math.max(...F,...G)/2)*2+2);
  const X=i=>L+(i/N)*(R-L), Y=v=>B-(v/ymax)*(B-T);
  let s=dashPanel(0,false,"var(--globe)")+dashPanel(194,true,"var(--flat)")
       +`<line x1="190" y1="6" x2="190" y2="130" stroke="var(--line)"/>`
       +`<rect x="${L}" y="${T}" width="${R-L}" height="${B-T}" fill="#fbfbfd" stroke="var(--line)"/>`;
  /* PAS DE GRADUATION ADAPTATIF. A 2° fixes et un maximum a 50°, l'axe portait
     vingt-six etiquettes qui se chevauchaient. */
  const step=[1,2,5,10,20,25,50].find(x=>ymax/x<=7) || 100;
  for(let v=0;v<=ymax;v+=step){
    s+=`<line x1="${L}" y1="${Y(v).toFixed(1)}" x2="${R}" y2="${Y(v).toFixed(1)}" stroke="var(--line)" stroke-width="0.6"/>`;
    s+=`<text x="${L-5}" y="${(Y(v)+3).toFixed(1)}" font-size="8.5" text-anchor="end" fill="var(--mute)">${v}°</text>`;
  }
  [0,6,12,18,24].forEach(hh=>{
    const i=hh/24*N;
    s+=`<line x1="${X(i).toFixed(1)}" y1="${B}" x2="${X(i).toFixed(1)}" y2="${B+4}" stroke="var(--mute)"/>`;
    s+=`<text x="${X(i).toFixed(1)}" y="${B+15}" font-size="8.5" text-anchor="middle" fill="var(--mute)">${hh} h</text>`;
  });
/* PLUS DE TEXTE PIVOTE, ET PLUS DE LIBELLE D'AXE CENTRE.
     Deux raisons, et la seconde compte plus que la premiere. audit-figures
     estime la boite d'un libelle a partir de son x et ne connait pas
     transform="rotate(-90 ...)" : il voyait « declination » deborder a gauche
     (-15..37) et chevaucher le « 0° » de l'axe. On pourrait apprendre la
     rotation a l'audit ; on prefere ne plus pivoter de texte, parce qu'a 380 px
     un libelle vertical se lit mal de toute facon. Il passe donc a l'horizontale,
     au-dessus du cadre. Et le libelle d'abscisse est cale a GAUCHE : centre, il
     tombait sur le tampon d'echelle pose en bas a droite. */
  s+=`<text x="${L}" y="${B+30}" font-size="9" fill="var(--mute)">${t("rate-axis-time")}</text>`;
  s+=`<text x="${L-2}" y="${T-4}" font-size="9" fill="var(--mute)">${t("rate-axis-angle")}</text>`;
  const line=(d,col,w)=>`<polyline points="${d.map((v,i)=>`${X(i+0.5).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  s+=line(G,"var(--globe)",2.2)+line(F,"var(--flat)",2.2);
  s+=`<line id="st-rateCur" x1="${X(0).toFixed(1)}" y1="${T}" x2="${X(0).toFixed(1)}" y2="${B}" stroke="var(--horizon)" stroke-width="1.2"/>`;
  rateGeom.chart={L,R,T,B,N};
  const mm=d=>[Math.min(...d),Math.max(...d)];
  const [g0,g1]=mm(G), [f0,f1]=mm(F);
  $("st-rateKey").innerHTML=
    `<li>${t("rate-key-intro")}</li>`+
    `<li><span style="display:inline-block;width:20px;border-top:2.6px solid #1d4ed8"></span> ${t("rate-key-globe").replace("{g0}", fmt(g0,3)).replace("{g1}", fmt(g1,3)).replace("{ratio}", fmt(g1/g0,3))}</li>`+
    `<li><span style="display:inline-block;width:20px;border-top:2.6px solid #c2410c"></span> ${t("rate-key-flat").replace("{f0}", fmt(f0,2)).replace("{f1}", fmt(f1,2)).replace("{ratio}", fmt(f1/f0,2))}</li>`+
    `<li>${t("rate-key-expected").replace("{star}", st.n).replace(/\{N\}/g, N).replace("{deg}", fmt(360/N,3))}</li>`;
  return s;
}

/* Le point qui tourne et la barre qui glisse sont LE MEME instant : c'est tout
   l'interet. Le lecteur voit le point ralentir dans le panneau plat pendant que
   la barre passe sous un creux du graphique, et sprinter sous une bosse. Le lien
   entre les deux moities de la figure cesse d'etre a demontrer.
   Memes garde-fous que l'ouverture : pas de requestAnimationFrame (jsdom, ou les
   audits tournent) ou prefers-reduced-motion, on dessine une image et on s'arrete. */
const RATE_GHOSTS = 6, RATE_GHOST_DT = 0.012;   // 6 fantomes, 17 min de ciel entre deux
function rateTick(){
  const g=rateGeom; if(!g||!g.st||!g.chart) return;
  const place=(P, el, tt, op)=>{
    if(!el) return;
    const jd=g.jd0+tt*0.99727;
    const q = P.flat ? posFlat(g.st,g.sp,jd,g.h) : posGlobe(g.st,g.sp,jd);
    if(q.alt<=0){ el.setAttribute("opacity","0"); return; }
    const v=enu(q.alt,q.az), dd=dot(v,P.cam.c);
    const th=Math.acos(Math.max(-1,Math.min(1,dd)))*R2D;
    const px=dot(v,P.cam.r), py=dot(v,P.cam.u), L=Math.hypot(px,py)||1e-12;
    const rr=th*P.K;
    el.setAttribute("opacity",op);
    el.setAttribute("cx",(P.cx+rr*px/L).toFixed(1));
    el.setAttribute("cy",(P.cy-rr*py/L).toFixed(1));
  };
  ["g","f"].forEach(k=>{
    const P=g[k]; if(!P) return;
    place(P, $("st-rateDot"+k.toUpperCase()), rateT, "1");
    for(let i=1;i<=RATE_GHOSTS;i++)
      place(P, $("st-rateDot"+k.toUpperCase()+i), rateT-i*RATE_GHOST_DT, (0.55*(1-i/(RATE_GHOSTS+1))).toFixed(2));
  });
  const c=$("st-rateCur"); if(c){
    const x=g.chart.L+rateT*(g.chart.R-g.chart.L);
    c.setAttribute("x1",x.toFixed(1)); c.setAttribute("x2",x.toFixed(1));
  }
}
/* Poignee de test. Une variable declaree par « let » au premier niveau d'un
   script n'est PAS une propriete de window : le banc jsdom ne pouvait pas fixer
   la phase pour photographier un instant precis, et croyait piloter l'animation
   alors qu'il regardait defiler la sienne. Deux lignes pour rendre la figure
   inspectable — c'est le protocole de la page qui l'exige, pas un caprice. */
const setPhase = v => { rateT = ((v%1)+1)%1; rateTick(); };
function rateLoop(ts){
  rateRAF=null;
  if(!$("st-figRate")||$("st-figRate").closest("[hidden]")){ rateLast=0; return; }
  if(!rateLast) rateLast=ts;
  const dt=Math.min(0.4,(ts-rateLast)/1000); rateLast=ts;
  rateT=(rateT+dt*0.08)%1;                     // un tour complet en 12,5 s
  rateTick();
  if(ratePlay && hasRAF) rateRAF=requestAnimationFrame(rateLoop);
}
function rateStart(){
  const rf = $("st-figRate"); if(rf){ rf.__anim = rateExportAnim; const blk = rf.closest(".fig"); if(blk) blk.__anim = rateExportAnim; }
  const reduce=(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || !hasRAF;
  rateTick();
  if(reduce){ ratePlay=false; return; }
  if(!rateRAF){ rateLast=0; rateRAF=requestAnimationFrame(rateLoop); }
}

/* ---- permanentes / saisonnieres ---------------------------------------
   Trois classes, une seule regle : on compare δ a 90° − |φ|. Circumpolaire si
   |δ| > 90° − |φ| ET du meme signe que φ ; jamais levee si |δ| > 90° − |φ| et de
   signe oppose ; saisonniere entre les deux.
   Le mois de passage au meridien vers minuit se lit dans le temps sideral : on
   prend le 15 de chaque mois, on calcule le TSL a minuit local, et on garde le
   mois dont le TSL est le plus proche de l'ascension droite du groupe. Aucune
   ephemeride nouvelle — gmst() etait deja la. */
const MOIS=["mo-jan","mo-feb","mo-mar","mo-apr","mo-may","mo-jun","mo-jul","mo-aug","mo-sep","mo-oct","mo-nov","mo-dec"];
function consPos(c, jd){
  let x=0,y=0,z=0,n=0;
  c.hr.forEach(hr=>{ const st=STARS.find(a=>a.hr===hr); if(!st) return;
    const p=precess(st.ra,st.de,jd);
    x+=cos(p.dec)*cos(p.ra); y+=cos(p.dec)*sin(p.ra); z+=sin(p.dec); n++; });
  if(!n) return null;
  const L=Math.hypot(x,y,z)||1;
  return {ra:norm360(Math.atan2(y,x)*R2D), dec:Math.asin(z/L)*R2D, n};
}
function consClass(dec, lat){
  const lim=90-Math.abs(lat);
  if(Math.abs(dec)>lim) return (dec>0)===(lat>=0) ? "cls-always-up" : "cls-never-rises";
  return "cls-seasonal";
}
function bestMonth(ra, sp){
  let best=0, bd=999;
  for(let m=0;m<12;m++){
    const jd=jdFromUTC(STAR_DATES[S.date].Y,m+1,15,0,0,0)-sp.lon/360;
    let d=Math.abs(norm180(norm360(gmst(jd)+sp.lon)-ra));
    if(d<bd){ bd=d; best=m; }
  }
  return MOIS[best];
}
function seasonSvg(){
  const sp=STAR_SPOTS[S.spot], jd0=jdOf(), lim=90-Math.abs(sp.lat);
  const L=44,R=280,T=16,B=252;                      // le cadre du graphique
  const X=φ=>L+((φ+90)/180)*(R-L), Y=d=>B-((d+90)/180)*(B-T);
  let s=`<rect x="${L}" y="${T}" width="${R-L}" height="${B-T}" fill="#fbfbfd" stroke="var(--line)"/>`;
  // les trois zones du globe
  s+=`<path d="M${X(0)} ${Y(90)} L${X(90)} ${Y(0)} L${X(90)} ${Y(90)} Z" fill="var(--globe)" opacity="0.10"/>`;
  s+=`<path d="M${X(0)} ${Y(-90)} L${X(-90)} ${Y(0)} L${X(-90)} ${Y(-90)} Z" fill="var(--globe)" opacity="0.10"/>`;
  s+=`<path d="M${X(0)} ${Y(90)} L${X(-90)} ${Y(0)} L${X(-90)} ${Y(90)} Z" fill="#111827" opacity="0.10"/>`;
  s+=`<path d="M${X(0)} ${Y(-90)} L${X(90)} ${Y(0)} L${X(90)} ${Y(-90)} Z" fill="#111827" opacity="0.10"/>`;
  s+=`<line x1="${X(-90)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(90)}" stroke="var(--horizon)" stroke-width="1.1"/>`;
  s+=`<line x1="${X(90)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(90)}" stroke="var(--horizon)" stroke-width="1.1"/>`;
  s+=`<line x1="${X(-90)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(-90)}" stroke="var(--horizon)" stroke-width="1.1"/>`;
  s+=`<line x1="${X(90)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(-90)}" stroke="var(--horizon)" stroke-width="1.1"/>`;
  // graduations
  [-90,-45,0,45,90].forEach(v=>{
    s+=`<text x="${X(v).toFixed(1)}" y="${B+13}" font-size="8.5" text-anchor="middle" fill="var(--mute)">${v}°</text>`;
    s+=`<text x="${L-5}" y="${(Y(v)+3).toFixed(1)}" font-size="8.5" text-anchor="end" fill="var(--mute)">${v>0?"+":""}${v}°</text>`;
  });
  s+=`<text x="${L}" y="${B+27}" font-size="9" fill="var(--mute)">${t("season-axis-lat")}</text>`;
  s+=`<text x="${L-2}" y="${T-4}" font-size="9" fill="var(--mute)">${t("season-axis-dec")}</text>`;
  // la ville choisie
  s+=`<line x1="${X(sp.lat).toFixed(1)}" y1="${T}" x2="${X(sp.lat).toFixed(1)}" y2="${B}" stroke="var(--flat)" stroke-width="1.4" stroke-dasharray="4 3"/>`;
  // les constellations, en traits horizontaux, etiquetees a droite sans chevauchement
  const rows=STAR_CONS.map(c=>({c, p:consPos(c,jd0)})).filter(r=>r.p)
    .sort((a,b)=>b.p.dec-a.p.dec);
  let lastY=-99;
  rows.forEach(r=>{
    const y=Y(r.p.dec);
    s+=`<line x1="${L}" y1="${y.toFixed(1)}" x2="${R}" y2="${y.toFixed(1)}" stroke="var(--mute)" stroke-width="0.5" opacity="0.5"/>`;
    /* UN TRAIT DE RAPPEL. Les etiquettes sont ecartees pour ne pas se recouvrir,
       donc elles ne sont plus a la hauteur de leur declination : sans rappel, le
       lecteur associe « Lion » a la ligne du Bouvier. Le trait va de la vraie
       ordonnee a celle de l'etiquette. */
    const ly=Math.max(y, lastY+8.4);
    if(ly<B+6){
      if(Math.abs(ly-y)>1.2)
        s+=`<path d="M${R} ${y.toFixed(1)} L${(R+3).toFixed(1)} ${ly.toFixed(1)}" fill="none" stroke="var(--mute)" stroke-width="0.5" opacity="0.6"/>`;
      s+=`<text x="${R+5}" y="${(ly+3).toFixed(1)}" font-size="7.6" fill="var(--mute)">${r.c.n}</text>`;
      lastY=ly;
    }
  });
  /* ABSORBE L'ANCIENNE SECTION « Ce qui n'est visible que d'un cote ». Elle
     disait la meme chose que cette figure avec un tableau de moins bonne
     qualite : meme regle, meme conclusion, un cran plus abstrait. Deux faits
     lui restaient en propre et sont repris ici — le DECOMPTE, et l'altitude a
     laquelle le disque plat maintient une constellation que le globe declare
     invisible. Le reste est parti sans laisser de trou. */
  const nev=rows.filter(r=>consClass(r.p.dec, sp.lat)==="cls-never-rises");
  /* Le « 0 » du modele plat n'est PAS un literal. Il est vrai — l'altitude vaut
     atan(h/d) > 0 partout — mais la page calcule ce qu'elle affirme, sinon la
     colonne plate n'est plus une prediction, c'est une assertion. */
  let nevFlat=0, worst=null, worstAlt=90;
  rows.forEach(r=>{
    let mn=90;
    r.c.hr.forEach(hr=>{ const st=STARS.find(a=>a.hr===hr); if(!st) return;
      for(let i=0;i<72;i++) mn=Math.min(mn, posFlat(st,sp,jd0+i/72*0.99727,STAR_DOMES[S.dome]).alt); });
    if(mn<=0) nevFlat++;
    if(consClass(r.p.dec,sp.lat)==="cls-never-rises" && mn<worstAlt){ worstAlt=mn; worst=r.c.n; }
  });
  const put=(cl,n)=>`<li><span style="display:inline-block;width:12px;height:9px;background:${cl};opacity:0.35"></span> ${n}</li>`;
  $("st-seasonKey").innerHTML =
    put("#1d4ed8",t("season-key-always"))+
    put("#111827",t("season-key-never"))+
    `<li>${t("season-key-seasonal").replace("{place}", sp.n).replace("{lim}", fmt(lim,1))}</li>`+
    `<li>${t("season-key-flat-none").replace("{a}", nev.length).replace(/\{total\}/g, rows.length).replace("{b}", nevFlat)}`+
    (worst ? t("season-key-worst").replace("{name}", worst).replace("{alt}", fmt(worstAlt,1)) : "")+`</li>`;
  return s;
}
function tabSeason(){
  const sp=STAR_SPOTS[S.spot], jd0=jdOf(), lim=90-Math.abs(sp.lat);
  const rows=STAR_CONS.map(c=>({c,p:consPos(c,jd0)})).filter(r=>r.p).sort((a,b)=>b.p.dec-a.p.dec);
  let r=`<tr><th>${t("ts-th-cons")}</th><th>δ</th><th>${t("ts-th-globe-at").replace("{place}", sp.n)}</th><th>${t("ts-th-meridian")}</th><th>${t("panel-flat-disc")}</th></tr>`;
  rows.forEach(x=>{
    const cl=consClass(x.p.dec, sp.lat);
    /* φ ET δ SIGNES. Avec Math.abs(sp.lat) la formule donnait « -25° au plus
       haut » pour la Croix du Sud vue d'Ushuaia — une altitude negative pour une
       constellation annoncee permanente dans la colonne d'a cote. Le defaut ne
       se voyait pas a Paris, ou les deux signes sont positifs : encore une
       affirmation vraie a un endroit et fausse a un autre. */
    const alt=90-Math.abs(sp.lat-x.p.dec);
    const vis = cl==="cls-never-rises" ? "—" : t("ts-vis").replace("{month}", t(bestMonth(x.p.ra,sp))).replace("{alt}", fmt(Math.min(90,alt),0));
    r+=`<tr><td>${x.c.n}</td><td>${fmt(x.p.dec,1)}°</td>`+
       `<td class="g">${t(cl)}</td><td>${vis}</td><td class="f">${t("cls-always-up")}</td></tr>`;
  });
  $("st-tabSeason").innerHTML=r;
}

/* ---- tables ---- *//* ---- tables ---- */
function tabSpots(){
  const h=STAR_DOMES[S.dome];
  let r=`<tr><th>${t("tsp-th-place")}</th><th>φ</th><th class="g">${t("tsp-th-galt")}</th><th class="g">${t("tsp-th-az")}</th>
         <th class="g">${t("tsp-th-sense")}</th><th class="f">${t("tsp-th-falt")}</th><th class="f">${t("tsp-th-az")}</th><th class="f">${t("tsp-th-sense")}</th></tr>`;
  STAR_SPOTS.forEach(sp=>{
    const g=fixedGlobe(sp.lat), f=fixedFlat(sp.lat,h);
    const eq=false;   // le lieu equatorial a une latitude REELLE de 0,2376 :
    // imprimer « 0.00 » etait un nombre rond fabrique. Le cas des deux poles se
    // dit dans la prose, avec la refraction nommee, pas par un cas special ici.
    r+=`<tr><td>${sp.n}</td><td>${fmt(Math.abs(sp.lat))}° ${t(sp.lat<0?"az-S":"az-N")}</td>`+
       `<td class="g">${eq?"0.00":fmt(g.alt)}°</td><td class="g">${eq?"N and S":azName(g.az)}</td>`+
       `<td class="g">${eq?"both":t(g.sense)}</td>`+
       `<td class="f">${fmt(f.alt)}°</td><td class="f">${azName(f.az)}</td><td class="f">${t(f.sense)}</td></tr>`;
  });
  $("st-tabSpots").innerHTML=r+$("st-tabSpots").querySelector("caption").outerHTML;
}

/* LA MOYENNE DES DEUX CULMINATIONS NE VAUT φ QUE SI L'ETOILE NE PASSE PAS
   DE L'AUTRE COTE DU ZENITH. En general a_haute + a_basse = 2·min(φ, δ) : des
   que δ < φ, l'etoile culmine au-dela du zenith, son altitude redescend de
   l'autre bord du meridien et la moyenne vaut δ, pas φ.
   Trouve en changeant de ville : a Paris, la routine choisissait Capella
   (δ = 46,00° < φ = 48,87°) et la colonne globe affichait 46,01 la ou l'onglet
   promet la latitude. L'affirmation etait vraie a Harvard et fausse a Paris —
   exactement le defaut qu'aucun audit ne voit, parce que chaque calcul est juste.
   On exige donc δ ≥ |φ| : l'etoile est entre le pole et le zenith. */
function pickStar(sp){
  const p=90-Math.abs(sp.lat), la=Math.abs(sp.lat);
  const ok=STARS.filter(s=>{
    const d=sp.lat>=0 ? s.de : -s.de;
    return d>p && d>=la;
  });
  /* ET ON PREND LE PLUS GRAND RAYON DE TRAINEE, PAS LA PLUS BRILLANTE. Prendre
     la plus brillante donnait Polaris a Longyearbyen, a Tromso et a Mexico : son
     rayon vaut 0,63°, une trainee de cette taille est presque symetrique DANS LES
     DEUX MODELES, et la table affichait alors une asymetrie plate de 0,00° — le
     modele plat passait le test parce que le test ne mesurait rien. On garde donc
     les etoiles visibles a l'oeil nu (V ≤ 3,2) et on maximise p = 90° − |δ|. */
  const vis=ok.filter(s=>s.v<=3.2);
  const p90=s=>90-Math.abs(s.de);
  return (vis.length?vis:ok).sort((a,b)=>p90(b)-p90(a)||a.v-b.v)[0]||null;
}
function tabShape(){
  const sp=STAR_SPOTS[S.spot], h=STAR_DOMES[S.dome], st=pickStar(sp);
  const cap=$("st-tabShape").querySelector("caption").outerHTML;
  if(!st){ $("st-tabShape").innerHTML=`<tr><td>${t("tsh-none").replace("{n}", STARS.length).replace("{place}", sp.n)}</td></tr>`+cap; return; }
  const jd0=jdOf(), gfp=fixedGlobe(sp.lat), ffp=fixedFlat(sp.lat,h);
  let gA=[],fA=[],gR=[],fR=[];
  for(let i=0;i<240;i++){
    const jd=jd0+i/240*0.99727;
    const G=posGlobe(st,sp,jd), F=posFlat(st,sp,jd,h);
    gA.push(G.alt); fA.push(F.alt);
    gR.push(sepDeg(G.alt,G.az,gfp.alt,gfp.az));
    fR.push(sepDeg(F.alt,F.az,ffp.alt,ffp.az));
  }
  const mm=a=>[Math.min(...a),Math.max(...a)];
  const [gl,gh_]=mm(gA), [fl,fh]=mm(fA), [grl,grh]=mm(gR), [frl,frh]=mm(fR);
  const p=90-Math.abs(precess(st.ra,st.de,jd0).dec);   // PRECESSEE : la colonne
  // globe est calculee sur la position de la date, l'attendu doit l'etre aussi.
  // Premier jet : 34,0 (J2000) contre 34,2 (date) dans la meme table.
  let r=`<tr><th>${st.n} (${st.b}, δ = ${fmt(st.de)}°)</th><th class="g">${t("panel-globe")}</th><th class="f">${t("tsh-th-flat")}</th></tr>`;
  r+=`<tr><td>${t("tsh-upper")}</td><td class="g">${fmt(gh_)}°</td><td class="f">${fmt(fh)}°</td></tr>`;
  r+=`<tr><td>${t("tsh-lower")}</td><td class="g">${fmt(gl)}°</td><td class="f">${fmt(fl)}°</td></tr>`;
  r+=`<tr><td><b>${t("tsh-mean")}</b></td><td class="g"><b>${fmt((gl+gh_)/2)}°</b></td><td class="f"><b>${fmt((fl+fh)/2)}°</b></td></tr>`;
  r+=`<tr><td>${t("tsh-fixed-alt")}</td><td class="g">${fmt(gfp.alt)}°</td><td class="f">${fmt(ffp.alt)}°</td></tr>`;
  r+=`<tr><td>${t("tsh-mean-minus-fixed")}</td><td class="g">${fmt((gl+gh_)/2-gfp.alt)}°</td><td class="f">${fmt((fl+fh)/2-ffp.alt)}°</td></tr>`;
  r+=`<tr><td>${t("tsh-radius")}</td><td class="g">${fmt(grl,1)}° … ${fmt(grh,1)}°</td><td class="f">${fmt(frl,1)}° … ${fmt(frh,1)}°</td></tr>`;
  r+=`<tr><td>${t("tsh-expected")}</td><td class="g">${fmt(p,1)}°</td><td class="f">—</td></tr>`;
  $("st-tabShape").innerHTML=r+cap;
}

function tabDome(){
  const sp=STAR_SPOTS[S.spot], st=pickStar(sp), jd0=jdOf();
  const cap=$("st-tabDome").querySelector("caption").outerHTML;
  if(!st){ $("st-tabDome").innerHTML=`<tr><td>${t("tdo-none")}</td></tr>`+cap; return; }
  let r=`<tr><th>${t("tdo-th-dome")}</th><th>${t("tdo-th-fp-alt")}</th><th>${t("tdo-th-err")}</th><th>${t("tdo-th-asym").replace("{star}", st.n)}</th></tr>`;
  STAR_DOMES.forEach(h=>{
    const f=fixedFlat(sp.lat,h);
    let A=[];
    for(let i=0;i<240;i++) A.push(posFlat(st,sp,jd0+i/240*0.99727,h).alt);
    const mid=(Math.min(...A)+Math.max(...A))/2;
    r+=`<tr><td>${h.toLocaleString("en-US")} km</td><td>${fmt(f.alt)}°</td>`+
       `<td>${fmt(f.alt-Math.abs(sp.lat))>0?"+":""}${fmt(f.alt-Math.abs(sp.lat))}°</td>`+
       `<td>${(mid-f.alt)>0?"+":""}${fmt(mid-f.alt)}°</td></tr>`;
  });
  $("st-tabDome").innerHTML=r+cap;
}

function reads(){
  const sp=STAR_SPOTS[S.spot], h=STAR_DOMES[S.dome];
  const g=fixedGlobe(sp.lat), f=fixedFlat(sp.lat,h);
  const d=STAR_DATES[S.date], vw=STAR_VIEWS[S.view];
  $("st-reads").innerHTML=
    `<span><b>${sp.n}</b> ${fmt(Math.abs(sp.lat))}° ${t(sp.lat<0?"az-S":"az-N")}</span>`+
    `<span>${t("reads-exposure").replace("{Y}", d.Y).replace("{M}", String(d.M).padStart(2,'0')).replace("{D}", String(d.D).padStart(2,'0')).replace("{H}", EXPO_H).replace("{view}", t(vw.n))}</span>`+
    `<span class="g">${t("reads-globe").replace("{alt}", fmt(g.alt)).replace("{compass}", azName(g.az)).replace("{sense}", t(g.sense))}</span>`+
    `<span class="f">${t("reads-flat").replace("{alt}", fmt(f.alt)).replace("{compass}", azName(f.az)).replace("{sense}", t(f.sense)).replace("{h}", h.toLocaleString("en-US"))}</span>`;
}

/* LE DUMP EST UN TABLEAU, PAS UN <pre>. Six lignes de texte brut alignees a la
   main tiennent tant que les valeurs sont courtes ; « Longyearbyen, Svalbard »
   et une declinaison negative les cassent, et a 380 px un <pre> deborde
   lateralement au lieu de se replier. Un tableau a deux colonnes, quantite et
   valeur, se comporte a toutes les largeurs et se lit mieux. Le libelle de
   chaque ligne dit d'ou vient la quantite, pas seulement son nom : le lecteur
   doit pouvoir refaire le calcul, pas seulement le constater. */
function dump(){
  const sp=STAR_SPOTS[S.spot], st=pickStar(sp), jd=jdOf();
  const pol0=STARS.find(x=>x.hr===424), pol=precess(pol0.ra,pol0.de,jd);
  const rows=[
    [t("dump-jd"), jd.toFixed(5)],
    [t("dump-gmst"),     gmst(jd).toFixed(4)+"\u00b0"],
    [t("dump-pol-j2000"), pol0.de.toFixed(4)+"\u00b0"+t("dump-from-pole").replace("{deg}", (90-pol0.de).toFixed(3))],
    [t("dump-pol-precessed"), pol.dec.toFixed(4)+"\u00b0"+t("dump-from-pole").replace("{deg}", (90-pol.dec).toFixed(3))],
    [t("dump-r-phi"), discR(sp.lat).toFixed(0)+" km"],
    [t("dump-dome"),               STAR_DOMES[S.dome].toLocaleString("en-US")+" km"],
    [t("dump-star"),  st ? st.n+"  (\u03b4 = "+st.de.toFixed(2)+"\u00b0, p = "+(90-Math.abs(st.de)).toFixed(2)+"\u00b0)" : t("dump-none")],
  ];
  $("st-dump").innerHTML = rows.map(([k,v])=>
    `<tr><td>${k}</td><td class="num">${v}</td></tr>`).join("");
}

function render(){
  if(!EXT.open) openStart();
  const s=EXT.sky ? "" : skySvg();
  const skyW=`<svg viewBox="0 0 380 200" role="img" aria-label="Star trails from one place, globe and flat disc">`+(s)+`<text x="376" y="195" text-anchor="end" font-size="10" fill="#b45309" font-family="ui-sans-serif,system-ui">not to scale \u2014 gnomonic, both panels identical</text></svg>`;
  /* UNE SEULE FOIS. Le banc affichait la meme figure deux fois, la seconde dans
     un conteneur « narrowonly », pour la relire cote a cote a deux largeurs
     pendant la mise au point. C'est un outil d'atelier, pas du contenu : la
     classe n'existe meme pas dans la feuille de style de la page, donc le
     doublon s'affichait purement et simplement en double. */
  if(EXT.sky) EXT.sky(); else $("st-figSky").innerHTML=skyW;
  $("st-figProj").innerHTML=`<svg viewBox="0 0 380 300" role="img" aria-label="A trail photographed off axis, against a perfect circle">`+(projSvg())+`<text x="376" y="295" text-anchor="end" font-size="10" fill="#b45309" font-family="ui-sans-serif,system-ui">not to scale \u2014 cropped and zoomed uniformly</text></svg>`;
  $("st-figSeason").innerHTML=`<svg viewBox="0 0 380 300" role="img" aria-label="Which constellations are always up, seasonal or never seen">`+(seasonSvg())+`<text x="376" y="295" text-anchor="end" font-size="10" fill="#b45309" font-family="ui-sans-serif,system-ui">not to scale \u2014 axes in degrees</text></svg>`; tabSeason();
  $("st-figRate").innerHTML=`<svg viewBox="0 0 380 348" role="img" aria-label="Equal time intervals along one trail">`+(rateSvg())+`<text x="376" y="140" text-anchor="end" font-size="10" fill="#b45309" font-family="ui-sans-serif,system-ui">not to scale \u2014 insets at own scale</text></svg>`; rateStart();
  reads(); tabSpots(); tabShape(); tabDome(); dump();
}
/* PAS DE render() A LA DEFINITION. Le panneau est masque au chargement, et un
   onglet masque a une largeur nulle : dessiner tout de suite produirait des
   figures de 0 px que rien ne redessinerait ensuite. La page appelle
   drawStar() depuis activateTab, load et resize, comme les seize autres. */
function wireStar(){
  t = makeT(document.documentElement.lang || "en", "star");
  fillSelects();
  /* UN SEUL BOUTON POUR LES DEUX ANIMATIONS. Deux commandes « pause » dans un
     meme onglet, chacune agissant sur une figure differente, ne se comprennent
     pas : le lecteur en actionne une et l'autre continue de tourner.
     ON N'EN GARDE PAS ZERO POUR AUTANT. La page honore prefers-reduced-motion,
     ce qui couvre le lecteur qui a regle son systeme ; le WCAG 2.2.2 demande en
     plus un moyen d'arreter tout contenu qui bouge seul plus de cinq secondes,
     pour celui qui ne l'a pas regle. Le bouton n'est donc pas un confort, c'est
     la condition pour avoir le droit d'animer. */
  $("st-openBtn").addEventListener("click",()=>{
    const on = !openPlay;
    openPlay = on; ratePlay = on;
    $("st-openBtn").textContent = on ? t("openBtn-pause") : t("openBtn-resume");
    if(EXT.play) EXT.play(on);
    if(on && hasRAF){
      if(!openRAF && !EXT.open){ openLast=0; openRAF=requestAnimationFrame(openLoop); }
      if(!rateRAF){ rateLast=0; rateRAF=requestAnimationFrame(rateLoop); }
    }
  });
}


/* Une seule chose sort du module : le moteur de rendu, plus la poignee de test
   de l'animation. Tout le reste est prive — la page a deja des sin, cos, fmt,
   $ et S au premier niveau, et un module de 1 200 lignes qui les redeclare est
   une SyntaxError, pas un bug subtil. */
/* stop() : ajouté au port -- teardown() du contrat d'onglet (src/main.js)
   doit pouvoir arrêter les deux boucles sans attendre qu'elles constatent
   elles-mêmes que le panneau est masqué. */
function stopStar(){
  if(openRAF){ cancelAnimationFrame(openRAF); openRAF=null; }
  if(rateRAF){ cancelAnimationFrame(rateRAF); rateRAF=null; }
  openLast=0; rateLast=0;
}
return { draw: render, wire: wireStar, setPhase: setPhase, stop: stopStar, ext: EXT,
  api: { S, SPOTS: STAR_SPOTS, DATES: STAR_DATES, DOMES: STAR_DOMES, VIEWS: STAR_VIEWS, OPEN_SPOT, jdOf, fixedGlobe, fixedFlat } };
})();
