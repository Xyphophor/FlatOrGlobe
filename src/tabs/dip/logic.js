// Logique pure de l'onglet dip (dépression d'horizon), portée à l'identique
// du legacy (flat-or-globe-2.20.0.html, ~L16116-16630 et ~L22898-23026).
// Séparée de index.js pour rester testable sous node:test sans DOM/canvas
// (voir tasks/epic02/UC03.org).
import { effectiveRadius, dipAngle, tangentDistance } from "../../core/math.js";
import { niceLen } from "../../core/canvas.js";
import { DIP_HEIGHT_MIN, DIP_HEIGHT_MAX } from "../../data/presets/dip.js";

export const DIP_K = 0.13;
export const DIP_R0 = 6371000;
export const DIP_SUN_SD = (16.0 / 60) * (Math.PI / 180); // demi-diamètre solaire, 16'
export const DIP_SUNRATE = 15.041; // deg/h, un tour par jour sidéral

/** Rayon effectif selon l'état de réfraction de l'onglet. */
export function dipR(refr) {
  return refr ? effectiveRadius(DIP_R0, DIP_K) : DIP_R0;
}

/** Plafonne h à [DIP_HEIGHT_MIN, DIP_HEIGHT_MAX] -- piège documenté (UC03) :
 * ne jamais laisser passer une valeur au-delà de 20 000 m, comme le legacy
 * le fait aux trois points d'entrée (preset, saisie, glisser-déposer). */
export function clampHeight(h) {
  if (!Number.isFinite(h)) return DIP_HEIGHT_MIN;
  return Math.max(DIP_HEIGHT_MIN, Math.min(DIP_HEIGHT_MAX, h));
}

/**
 * Cadrage collant ("sticky frame") de l'onglet dip -- PIÈGE DOCUMENTÉ
 * (CLAUDE.md "STICKY FRAME IN THE DIP TAB", tasks/epic02/UC03.org) : un
 * cadrage automatique à CHAQUE rendu rendrait la scène auto-similaire (la
 * ligne d'horizon resterait plantée au même pixel et la sphère semblerait
 * changer de courbure en faisant glisser l'observateur). On ne recadre
 * que lorsque l'observateur QUITTE la bande courante [10%, 80%] de
 * `prevFrameH`. Pure et testable : mêmes entrées (h, bande), même sortie.
 *
 * @param {number} h hauteur d'œil courante (m)
 * @param {number} prevFrameH dernier cadrage retenu (m)
 * @returns {number} le cadrage à utiliser pour ce rendu
 */
export function dipFrame(h, prevFrameH) {
  if (!(h < prevFrameH * 0.8 && h > prevFrameH * 0.1)) return niceLen(h * 2.2);
  return prevFrameH;
}

/**
 * Échelles partagées des deux panneaux dip (globe / plat). L'exagération
 * verticale est réalisée par une planète PLUS PETITE (rayon R/ex) dessinée
 * à l'échelle uniforme -- jamais par un étirement d'axe (CLAUDE.md).
 */
export function dipScales(W, H, F, exSlider, R) {
  const PADL = 46, PADR = 14, PADT = 26, PADB = 40;
  const Xf = Math.sqrt(2 * DIP_R0 * F) * 1.15; // largeur du cadre (mètres monde)
  const availW = W - PADL - PADR, availH = H - PADT - PADB;
  const s = availW / Xf; // px par mètre, uniforme sur les deux axes
  let ex = ((0.3 * availH) / F / s) * exSlider; // exagération qui remplit le cadre
  ex = Math.max(1, Math.min(ex, R / (Xf * 1.02))); // garder la planète plus large que le cadre
  const Rd = R / ex; // rayon de la planète affichée
  return { PADL, PADR, PADT, PADB, Xf, s, ex, Rd, gy: PADT + availH * 0.46 };
}

/** Formule de dip / distance d'horizon, réexportées pour usage local. */
export { dipAngle, tangentDistance as dipDist };

// ---- Expérience 4 : dip mesuré vs plat ----
export function exp4(h) {
  const R = DIP_R0;
  const geo = (Math.acos(R / (R + h)) * 180) / Math.PI;
  const Rr = effectiveRadius(R, DIP_K);
  const ref = (Math.acos(Rr / (Rr + h)) * 180) / Math.PI;
  return { geo, ref };
}

// ---- Bande sous le niveau des yeux (drawDipBand / fillBandTable) ----
export const dipSetRate = (latDeg) => DIP_SUNRATE * Math.cos((latDeg * Math.PI) / 180);

export function bandRow(h, R) {
  const d = dipAngle(R, h);
  const am = ((d * 180) / Math.PI) * 60;
  const w = am - 32; // largeur de la bande au-delà d'un diamètre solaire (32')
  const rate = dipSetRate(45);
  const secs = w > 0 ? ((w / 60) / rate) * 3600 : 0;
  return { d, am, w, secs };
}

// ---- Expérience 4b : le coucher de soleil doublé ----
export function expDb(h1, h2, latDeg, tObsSec) {
  const Rr = effectiveRadius(DIP_R0, DIP_K);
  const rate = dipSetRate(latDeg); // deg/h
  const dd = ((dipAngle(Rr, h2) - dipAngle(Rr, h1)) * 180) / Math.PI; // deg, réfracté
  const pred = (dd / rate) * 3600; // s
  // Inversion : le délai mesuré redonne directement le rayon effectif.
  const ddObs = ((rate * (tObsSec / 3600)) * Math.PI) / 180; // rad
  const Reff = (2 * Math.pow(Math.sqrt(h2) - Math.sqrt(h1), 2)) / (ddObs * ddObs);
  return { dd, pred, Reff, R: Reff * (1 - DIP_K) };
}

// ---- Solve for R from the current dip (fillRadTable) ----
export function solveRadius(h, dip) {
  return (h * Math.cos(dip)) / (1 - Math.cos(dip));
}
