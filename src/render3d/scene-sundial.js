// Scène Three.js du cadran solaire (tasks/epic03/UC05.org). Mécanique
// IDENTIQUE au legacy et à src/tabs/sun/logic.js : le SOLEIL EST FIXE DANS
// L'ESPACE MONDE (SUN_DIR, azimut SUN_AZ, équinoxe), c'est la PLANÈTE qui
// tourne (angle `the` = SUND.earth, fourni par l'onglet) ; les gnomons sont
// ±[0,1,0] (parallèles à l'axe) et restent parallèles entre eux à travers
// la rotation -- ce parallélisme EST le point. Ombres : vraie lumière
// directionnelle avec castShadow/receiveShadow sur de petites plaques
// tangentes ; le clamp legacy à 0,30 pour soleil bas est reproduit par la
// taille finie de la plaque. La caméra par défaut cadre le soleil à gauche
// (SUND_YAW), comme le legacy. Perspective NON utilisée (orthographique).
import * as THREE from "three";
import { createScene, cssColor, globeMesh, polyline } from "./shared/scene.js";
import { SUN_DIR, SUN_AZ, SUND_STATIONS, sunDialHour } from "../tabs/sun/logic.js";

const D2R = Math.PI / 180;

export function mountSundial(canvas, getState) {
  const S = createScene(canvas, { frustum: 1.7, position: [Math.cos(-0.55) * 3, 1.2, Math.sin(-0.55) * 3] });
  S.renderer.shadowMap.enabled = true;
  // vrai soleil : jour et nuit doivent se lire, donc lumière de ciel basse et pas de lampe « clé »
  S.ambient.intensity = 0.35;
  S.key.intensity = 0;
  S.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const earth = new THREE.Group();
  const globe = globeMesh(1, { segments: 64 });
  globe.children[0].receiveShadow = true;
  earth.add(globe);
  earth.add(polyline([[0, -1.25, 0], [0, 1.25, 0]], { color: "--globe" }));

  // soleil fixe monde : lumière directionnelle depuis SUN_DIR, plus un disque marqueur
  const sun = new THREE.DirectionalLight(0xfff2d0, 2.4);
  sun.position.set(SUN_DIR[0] * 6, SUN_DIR[1] * 6 + 0.001, SUN_DIR[2] * 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 1, far: 12 });
  S.scene.add(sun);
  const disc = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
  disc.position.set(SUN_DIR[0] * 1.7, 0, SUN_DIR[2] * 1.7);
  S.scene.add(disc);
  // terminateur fixe (grand cercle perpendiculaire au soleil)
  const u = [-Math.sin(SUN_AZ), 0, Math.cos(SUN_AZ)], term = [];
  for (let i = 0; i <= 120; i++) { const t = (2 * Math.PI * i) / 120; term.push([u[0] * Math.cos(t) * 1.003, -Math.sin(t) * 1.003, u[2] * Math.cos(t) * 1.003]); }
  S.scene.add(polyline(term, { color: "--ink-soft", dashed: true, opacity: 0.7 }));

  // stations : plaque tangente + gnomon parallèle à l'axe
  const plateMat = new THREE.MeshLambertMaterial({ color: cssColor("--paper", "#fbfaf7"), side: THREE.DoubleSide });
  const gnoMat = new THREE.MeshLambertMaterial({ color: cssColor("--ink", "#151a21") });
  for (const lat of SUND_STATIONS) {
    const l = lat * D2R, lon = 0;
    const n = new THREE.Vector3(Math.cos(l) * Math.cos(lon), Math.sin(l), Math.cos(l) * Math.sin(lon));
    const plate = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), plateMat);
    plate.position.copy(n.clone().multiplyScalar(1.005));
    plate.lookAt(n.clone().multiplyScalar(2));
    plate.receiveShadow = true;
    earth.add(plate);
    const g = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), gnoMat);
    g.castShadow = true;
    g.position.copy(n.clone().multiplyScalar(1.005 + 0.07 * Math.sin(Math.abs(l))));
    // gnomon parallèle à l'axe : ±y monde (signe de la latitude) -- la géométrie Cylinder est déjà le long de y
    if (lat < 0) g.rotation.z = Math.PI;
    g.position.copy(n.clone().multiplyScalar(1.005).add(new THREE.Vector3(0, (lat >= 0 ? 1 : -1) * 0.07, 0)));
    earth.add(g);
  }
  S.scene.add(earth);
  S.hud("sun fixed in world space · the planet turns", { corner: "tl", color: "#5b6470" });
  S.hud("gnomons parallel to the axis", { corner: "tl", row: 1, color: "#5b6470" });
  const hourLbl = S.hud("", { corner: "bl" });
  let lastThe = null;
  S.onTick(() => {
    const { the } = getState();
    // la planète tourne VERS L'EST, la lumière ne bouge pas. Le port direct
    // du 2.5D (main gauche) écrivait rotation.y = −the : en Three.js (main
    // droite) c'était une rotation vers l'OUEST, et les ombres des cadrans de
    // l'hémisphère nord tournaient à l'envers. Ici rotation.y croît avec the,
    // et le méridien 0 fait face au soleil quand the = SUN_AZ (midi,
    // sunDialHour = 0) : 0° → (cos a, 0, −sin a) = SUN_DIR pour a = −SUN_AZ.
    earth.rotation.y = the - 2 * SUN_AZ;
    if (the !== lastThe) {
      lastThe = the;
      const hh = sunDialHour(the), h = Math.floor(Math.abs(hh)), m = Math.round((Math.abs(hh) - h) * 60);
      const txt = `solar time at 0° meridian: ${hh < 0 ? "−" : "+"}${h} h ${String(m).padStart(2, "0")} from noon`;
      hourLbl.set(txt);
    }
  });
  return S;
}
