// Scènes Three.js de l'onglet GPS (tasks/epic03/UC02.org). La géométrie
// vient EXCLUSIVEMENT de src/tabs/gps/logic.js (testée) -- ici on ne fait
// qu'afficher. Unités : rayons terrestres (Terre = sphère de rayon 1,
// satellites à 4,17 R, échelle vraie), y = axe polaire comme dans logic.js.
import * as THREE from "three";
import { createScene, cssColor, globeMesh, polyline, marker, label } from "./shared/scene.js";
import {
  GPS_A_RE, observerVector, allSatellites, pickTriSatellites, reflectAcrossPlane,
  sphereIntersectionCircle, circlePoint,
} from "../tabs/gps/logic.js";
import { GPS_PLANE_COUNT, GPS_INCLINATION_DEG } from "../data/orbits/gps.js";

const D2R = Math.PI / 180;

function orbitRing(k, segments = 128) {
  const O = (k * 360 / GPS_PLANE_COUNT) * D2R, inc = GPS_INCLINATION_DEG * D2R;
  const a = [Math.cos(O), 0, Math.sin(O)], b = [-Math.sin(O) * Math.cos(inc), Math.sin(inc), Math.cos(O) * Math.cos(inc)];
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const th = (2 * Math.PI * i) / segments;
    pts.push([0, 1, 2].map((j) => GPS_A_RE * (a[j] * Math.cos(th) + b[j] * Math.sin(th))));
  }
  return pts;
}

/**
 * Constellation : 24 satellites sur 6 plans, observateur, lignes de visée
 * vers les satellites au-dessus du masque. `getState()` renvoie
 * { lat, time } à chaque image ; `onCount(n)` reçoit le compte visible.
 */
export function mountGpsSky(canvas, getState, onCount) {
  const S = createScene(canvas, { frustum: 4.6, position: [6, 3.5, 7] });
  S.scene.add(globeMesh(1));
  for (let k = 0; k < GPS_PLANE_COUNT; k++) S.scene.add(polyline(orbitRing(k), { color: "--ink-soft", opacity: 0.35 }));
  const satMat = new THREE.MeshLambertMaterial({ color: cssColor("--obj1", "#1d4ed8") });
  const dimMat = new THREE.MeshLambertMaterial({ color: cssColor("--ink-soft", "#5b6470") });
  const sats = [];
  for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), dimMat); S.scene.add(m); sats.push(m); }
  const obs = marker([1, 0, 0], 0.05, "--ink");
  S.scene.add(obs);
  const linesGeo = new THREE.BufferGeometry();
  const lines = new THREE.LineSegments(linesGeo, new THREE.LineBasicMaterial({ color: cssColor("--obj1", "#1d4ed8"), transparent: true, opacity: 0.6 }));
  S.scene.add(lines);
  S.hud("true scale · a = 4.17 R", { corner: "bl" });
  S.hud("drag to orbit", { corner: "br", color: "#5b6470" });

  S.onTick(() => {
    const { lat, time } = getState();
    const P = observerVector(lat);
    obs.position.set(...P);
    const all = allSatellites(lat, time);
    const seg = [];
    let count = 0;
    all.forEach((s, i) => {
      sats[i].position.set(...s.S);
      sats[i].material = s.visible ? satMat : dimMat;
      sats[i].scale.setScalar(s.visible ? 1.3 : 1);
      if (s.visible) { count++; seg.push(...P, ...s.S); }
    });
    linesGeo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    linesGeo.computeBoundingSphere();
    onCount?.(count);
  });
  return S;
}

/**
 * Trilatération : trois sphères de portée SEMI-TRANSPARENTES (le volume
 * remplace les coquilles filaires du 2.5D, qui compensaient l'absence de
 * vrai rendu de profondeur), Terre solide, satellites, lignes de portée,
 * cercles d'intersection violets, les deux points triples (vous / miroir
 * rejeté). Statique : construit une fois pour une latitude.
 */
export function mountGpsTri(canvas, lat, t = 0.7) {
  const S = createScene(canvas, { frustum: 5.5, position: [7, 4, 9] });
  const picks = pickTriSatellites(lat, t);
  S.scene.add(globeMesh(1));
  if (picks.length === 3) {
    const shellMat = new THREE.MeshLambertMaterial({ color: cssColor("--obj1", "#1d4ed8"), transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    const P = observerVector(lat);
    for (const { S: sat, r } of picks) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), shellMat);
      sh.position.set(...sat);
      S.scene.add(sh);
      S.scene.add(marker(sat, 0.09, "--obj1"));
      S.scene.add(polyline([P, sat], { color: "--obj1" }));
    }
    for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) {
      const c = sphereIntersectionCircle(picks[i].S, picks[i].r, picks[j].S, picks[j].r);
      const pts = []; for (let k = 0; k <= 128; k++) pts.push(circlePoint(c, (2 * Math.PI * k) / 128));
      S.scene.add(polyline(pts, { color: "--obj3" }));
    }
    const mirror = reflectAcrossPlane(P, picks[0].S, picks[1].S, picks[2].S);
    S.scene.add(marker(P, 0.08, "--ink"));
    S.scene.add(label("you", [P[0] + 0.15, P[1] + 0.1, P[2]], { size: 0.4 }));
    S.scene.add(marker(mirror, 0.08, "--ink-soft"));
    S.scene.add(label("mirror, rejected", [mirror[0] + 0.15, mirror[1], mirror[2]], { size: 0.4, color: "#5b6470" }));
  }
  S.hud("true scale · drag to orbit", { corner: "bl" });
  return S;
}
