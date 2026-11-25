// Scènes Three.js de l'onglet magnétisme (tasks/epic03/UC03.org) : le
// globe avec son dipôle central (lignes de champ r = L cos²λ, méridiens
// multiples), et le disque plat avec sa disposition ① (aimant sous le
// centre) ou ② (pôle central + anneau au bord, lignes tracées par
// magTrace2). Une aiguille (segment rouge/blanc) est posée à la latitude /
// distance de l'observateur, alignée sur le champ calculé par logic.js --
// la calibration steel-man n'est jamais recalculée ici, seulement affichée.
import * as THREE from "three";
import { createScene, cssColor, globeMesh, polyline, marker } from "./shared/scene.js";
import { MAG_RKM, MAG_D1, MAG_D2, globeMag, flatMag, magTrace2 } from "../tabs/mag/logic.js";
import { magLat2r } from "../tabs/mag/shared.js";

const D2R = Math.PI / 180;

/** Ligne de champ dipolaire dans le plan méridien d'azimut phiDeg, coquille L (en rayons). */
function dipoleLine(L, phiDeg, sign = 1) {
  const pts = [];
  for (let a = -89; a <= 89; a += 2) {
    const r = L * Math.cos(a * D2R) ** 2;
    if (r < 1) continue;
    const x = r * Math.cos(a * D2R) * sign, y = r * Math.sin(a * D2R);
    pts.push([x * Math.cos(phiDeg * D2R), y, x * Math.sin(phiDeg * D2R)]);
  }
  return pts;
}

function needle(p, dir, len = 0.5) {
  const g = new THREE.Group();
  const d = new THREE.Vector3(...dir).normalize();
  const a = new THREE.Vector3(...p).sub(d.clone().multiplyScalar(len / 2));
  const b = new THREE.Vector3(...p).add(d.clone().multiplyScalar(len / 2));
  const mid = new THREE.Vector3(...p);
  g.add(polyline([[a.x, a.y, a.z], [mid.x, mid.y, mid.z]], { color: "--ink-soft" }));
  const red = new THREE.Line(new THREE.BufferGeometry().setFromPoints([mid, b]), new THREE.LineBasicMaterial({ color: 0xd32f2f, linewidth: 2 }));
  g.add(red);
  g.add(marker(p, 0.05, "--obj3"));
  return g;
}

/** Globe dipôle : Terre + lignes de champ + aiguille à la latitude magnétique lat. */
export function mountMagGlobe(canvas, getLat) {
  const S = createScene(canvas, { frustum: 3.2, position: [4, 2.5, 6], autoRotate: true });
  S.scene.add(globeMesh(1));
  const axis = polyline([[0, -1.6, 0], [0, 1.6, 0]], { color: "--ink-soft", opacity: 0.6, dashed: true });
  S.scene.add(axis);
  for (const phi of [0, 45, 90, 135]) for (const L of [1.4, 2.0, 2.8]) for (const sg of [1, -1]) {
    S.scene.add(polyline(dipoleLine(L, phi, sg), { color: "--ink-soft", opacity: 0.45 }));
  }
  // équateur magnétique (tirets rouges dans le legacy)
  const eq = []; for (let i = 0; i <= 96; i++) { const a = (2 * Math.PI * i) / 96; eq.push([1.005 * Math.cos(a), 0, 1.005 * Math.sin(a)]); }
  S.scene.add(polyline(eq, { color: "--warn", dashed: true }));
  let nd = null;
  S.onTick(() => {
    const lat = getLat();
    if (nd && nd.userData.lat === lat) return;
    if (nd) S.scene.remove(nd);
    const l = lat * D2R, g = globeMag(lat), I = g.I * D2R;
    const p = [Math.cos(l), Math.sin(l), 0];
    const north = [-Math.sin(l), Math.cos(l), 0], down = [-Math.cos(l), -Math.sin(l), 0];
    const dir = [0, 1, 2].map((i) => north[i] * Math.cos(I) + down[i] * Math.sin(I));
    nd = needle(p, dir, 0.45); nd.userData.lat = lat;
    S.scene.add(nd);
  });
  S.hud("true scale · needle along B", { corner: "bl" });
  return S;
}

/** Disque plat : surface, source(s) enfouie(s), lignes de champ, aiguille à la distance r (km) du centre. */
export function mountMagFlat(canvas, ver, getR) {
  const S = createScene(canvas, { frustum: 1.6, position: [2, 1.6, 3], autoRotate: true });
  const K = 1 / MAG_RKM; // km -> unités monde (rayon du disque = 1)
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshLambertMaterial({ color: cssColor("--flat-tint", "#f6ecdc"), side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  disc.rotation.x = -Math.PI / 2;
  S.scene.add(disc);
  const rim = []; for (let i = 0; i <= 128; i++) { const a = (2 * Math.PI * i) / 128; rim.push([Math.cos(a), 0, Math.sin(a)]); }
  S.scene.add(polyline(rim, { color: "--flat" }));
  if (ver === 1) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 12), new THREE.MeshLambertMaterial({ color: cssColor("--ink", "#151a21") }));
    bar.position.set(0, -MAG_D1 * K, 0);
    S.scene.add(bar);
    for (const phi of [0, 60, 120]) for (const L of [0.6, 1.0, 1.5]) for (const sg of [1, -1]) {
      const pts = dipoleLine(L, phi, sg).map(([x, y, z]) => [x * MAG_D1 * K, y * MAG_D1 * K - MAG_D1 * K, z * MAG_D1 * K]);
      S.scene.add(polyline(pts, { color: "--ink-soft", opacity: 0.45 }));
    }
  } else {
    S.scene.add(marker([0, -MAG_D2 * K, 0], 0.04, "--ink"));
    const ring = []; for (let i = 0; i <= 128; i++) { const a = (2 * Math.PI * i) / 128; ring.push([Math.cos(a), -MAG_D2 * K, Math.sin(a)]); }
    S.scene.add(polyline(ring, { color: "--ink" }));
    // boucles fermées (charge nette nulle) : lignes raccordées au pôle central et à l'anneau,
    // puis retour du centre vers le bord dans le disque aimanté enterré (rayons au plan -D2)
    for (const phi of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const c = Math.cos(phi * D2R), s = Math.sin(phi * D2R);
      for (const trace of magTrace2()) {
        const full = [[0, -MAG_D2], ...trace, [MAG_RKM, -MAG_D2]];
        S.scene.add(polyline(full.map(([r, z]) => [r * K * c, z * K, r * K * s]), { color: "--ink-soft", opacity: 0.4 }));
      }
      S.scene.add(polyline([[0, -MAG_D2 * K, 0], [c, -MAG_D2 * K, s]], { color: "--ink" }));
    }
  }
  const eq = []; for (let i = 0; i <= 96; i++) { const a = (2 * Math.PI * i) / 96; eq.push([0.5 * Math.cos(a), 0.002, 0.5 * Math.sin(a)]); }
  S.scene.add(polyline(eq, { color: "--warn", dashed: true }));
  let nd = null;
  S.onTick(() => {
    const r = getR();
    if (nd && nd.userData.r === r) return;
    if (nd) S.scene.remove(nd);
    const f = flatMag(ver, r), I = f.I * D2R, hs = f.H >= 0 ? -1 : 1; // H>0 = vers le centre
    const p = [r * K, 0, 0];
    const dir = [hs * Math.cos(I), -Math.sin(I), 0];
    nd = needle(p, dir, 0.22); nd.userData.r = r;
    S.scene.add(nd);
  });
  S.hud(`flat layout ${ver === 1 ? "①" : "②"} · true scale`, { corner: "bl" });
  return S;
}

export { magLat2r };
