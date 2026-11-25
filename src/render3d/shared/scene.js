// Base Three.js partagée (tasks/epic03/UC01.org). Une scène = un renderer
// dans un <canvas>, une caméra ORTHOGRAPHIQUE par défaut, des lumières
// douces, OrbitControls, et une boucle rAF que l'onglet arrête dans
// teardown(). Les couleurs viennent des variables CSS partagées
// (src/core/theme.css), jamais d'une palette 3D dupliquée.
//
// DÉCISION (règle 1, "jamais d'exagération non étiquetée") : la caméra
// est ORTHOGRAPHIQUE par défaut. Une perspective déforme les proportions
// selon la distance, ce qui rendrait invisible le "true scale" que ces
// scènes revendiquent (GPS : a = 4,17 R). Une scène qui veut la
// perspective doit la demander explicitement ({ perspective: true }) et
// l'étiqueter sur le canvas.
//
// REPÈRE (2026-09-24). Three.js est MAIN DROITE, y vers le haut ; le 2.5D
// du legacy (magRot, camera3d) projetait en main gauche. Un point de
// latitude φ, longitude λ est donc en [cos φ cos λ, sin φ, −cos φ sin λ] :
// l'est est −z au méridien 0, et une rotation vers l'est est une rotation
// POSITIVE autour de +y. latLon() ci-dessous est la seule définition ; le
// cadran solaire tournait à l'envers faute de l'avoir (voir scene-sundial).
//
// RENDU DE REPLI ET PERFORMANCE. Un renderer par canvas, réutilisé si
// l'onglet reconstruit sa scène (un canvas ne donne qu'UN contexte WebGL ;
// en recréer un à chaque changement de latitude les empilait). Rien n'est
// dessiné quand le canvas est hors écran ou l'onglet masqué : la boucle
// reste armée mais ne coûte presque rien -- la machine du propriétaire est
// ancienne.
import { figColor } from "../../core/theme.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { COASTS } from "../../data/coasts.js";
import { reducedMotion } from "../../core/motion.js";

const D2R = Math.PI / 180;
const renderers = new WeakMap();

export function cssColor(name, fallback) {
  return new THREE.Color(figColor(name, fallback));
}

/** Vecteur unitaire (×r) d'un point de latitude/longitude en degrés -- repère ci-dessus. */
export function latLon(latDeg, lonDeg, r = 1) {
  const p = latDeg * D2R, l = lonDeg * D2R;
  return [r * Math.cos(p) * Math.cos(l), r * Math.sin(p), -r * Math.cos(p) * Math.sin(l)];
}

/* ---------------------------------------------------------------- texte */
/** Texture de texte à la taille exacte du texte (plus de troncature à 256 px), rendue au DPR. */
function textCanvas(text, { px = 13, color = "#151a21", weight = 600, bg = null } = {}) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const font = `${weight} ${px * dpr}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.font = font;
  const padX = 4 * dpr, padY = 3 * dpr;
  c.width = Math.max(2, Math.ceil(ctx.measureText(text).width + 2 * padX));
  c.height = Math.ceil(px * dpr * 1.35 + 2 * padY);
  ctx.font = font;
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.fillStyle = color; ctx.textBaseline = "middle";
  ctx.fillText(text, padX, c.height / 2);
  return { c, w: c.width / dpr, h: c.height / dpr };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} [opt]
 * @param {number} [opt.frustum=6] demi-hauteur visible en unités monde (ortho)
 * @param {boolean} [opt.perspective=false]
 * @param {[number,number,number]} [opt.position=[6,4,8]]
 * @param {boolean} [opt.autoRotate=false]
 */
export function createScene(canvas, opt = {}) {
  let renderer = renderers.get(canvas);
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderers.set(canvas, renderer);
  }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.autoClear = false;
  renderer.shadowMap.enabled = false;
  const scene = new THREE.Scene();
  const frustum = opt.frustum ?? 6;
  const aspect = () => (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
  const camera = opt.perspective
    ? new THREE.PerspectiveCamera(40, aspect(), 0.01, 1000)
    : new THREE.OrthographicCamera(-frustum * aspect(), frustum * aspect(), frustum, -frustum, 0.01, 1000);
  camera.position.set(...(opt.position ?? [6, 4, 8]));
  camera.lookAt(0, 0, 0);

  // Ciel clair au-dessus, sol plus sombre dessous : le relief se lit sans
  // que la face « nuit » devienne noire (les scènes à vrai soleil baissent
  // ces deux lumières, cf. scene-sundial).
  const ambient = new THREE.HemisphereLight(0xffffff, 0xb8c2cc, 1.0);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(5, 8, 6);
  scene.add(key);

  // HUD : texte fixé à l'ÉCRAN (tampons d'échelle, légendes), dans une
  // seconde scène en pixels CSS. Un sprite dans le monde tourne avec la
  // caméra et sortait du cadre dès qu'on orbitait.
  const hudScene = new THREE.Scene();
  const hudCam = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
  const huds = [];

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  // prefers-reduced-motion (epic06/UC04) : pas de rotation ni d'animation d'office ; le bouton reste
  const still = reducedMotion();
  controls.autoRotate = !!opt.autoRotate && !still;
  controls.autoRotateSpeed = 0.6;
  if (camera.isOrthographicCamera) { controls.minZoom = 0.6; controls.maxZoom = 6; }

  let W = 0, H = 0;
  function layoutHud() {
    hudCam.right = W; hudCam.top = H; hudCam.updateProjectionMatrix();
    for (const h of huds) {
      const { w, h: hh } = h.size, m = 6;
      const x = h.corner[1] === "l" ? m + w / 2 : W - m - w / 2;
      const y = h.corner[0] === "t" ? H - m - hh / 2 - h.row * (hh + 2) : m + hh / 2 + h.row * (hh + 2);
      h.sprite.position.set(x, y, 0);
      h.sprite.scale.set(w, hh, 1);
    }
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    if (w === W && h === H) return true;
    W = w; H = h;
    renderer.setSize(w, h, false);
    if (camera.isOrthographicCamera) {
      camera.left = -frustum * (w / h); camera.right = frustum * (w / h);
      camera.top = frustum; camera.bottom = -frustum;
    } else camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layoutHud();
    return true;
  }

  // visible à l'écran ? (IntersectionObserver ; sans lui, toujours vrai)
  let onScreen = true;
  const io = typeof IntersectionObserver === "function"
    ? new IntersectionObserver((e) => { onScreen = e[e.length - 1].isIntersecting; })
    : null;
  io?.observe(canvas);

  let raf = null;
  const tick = [];
  function frame() {
    if (!resize()) return;
    if (!still) for (const f of tick) f();
    controls.update();
    renderer.clear();
    renderer.render(scene, camera);
    if (huds.length) { renderer.clearDepth(); renderer.render(hudScene, hudCam); }
  }
  function start() {
    if (raf != null) return;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!onScreen || document.hidden) return;
      frame();
    };
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    if (raf != null) { cancelAnimationFrame(raf); raf = null; }
  }
  function dispose() {
    stop();
    io?.disconnect();
    controls.dispose();
    for (const s of [scene, hudScene]) s.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose?.(); m.dispose?.(); });
    });
    // le renderer reste attaché au canvas (WeakMap) : une nouvelle scène
    // sur ce canvas le reprend au lieu d'ouvrir un second contexte.
    renderer.clear();
  }
  /** Bouton « ⏸ pause / ▶ spin » du legacy : bascule l'auto-rotation, renvoie le nouvel état. */
  function toggleSpin() { controls.autoRotate = !controls.autoRotate; return controls.autoRotate; }

  /**
   * Texte fixé à l'écran. corner : "tl" | "tr" | "bl" | "br" ; row : rang
   * depuis ce coin. Renvoie { set(text, color?) }.
   */
  function hud(text, { corner = "bl", row = 0, color = "#151a21", px = 11 } = {}) {
    const mat = new THREE.SpriteMaterial({ transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    const h = { sprite, corner, row, size: { w: 1, h: 1 }, text: null };
    h.set = (t, col = color) => {
      if (t === h.text && col === h.color) return;
      h.text = t; h.color = col;
      const { c, w, h: hh } = textCanvas(t, { px, color: col, bg: "rgba(253,253,252,0.78)" });
      mat.map?.dispose();
      mat.map = new THREE.CanvasTexture(c);
      mat.map.colorSpace = THREE.SRGBColorSpace;
      mat.needsUpdate = true;
      h.size = { w, h: hh };
      if (W) layoutHud();
    };
    h.set(text);
    huds.push(h);
    hudScene.add(sprite);
    return h;
  }

  return { THREE, renderer, scene, camera, controls, ambient, key, resize, start, stop, dispose, toggleSpin, hud, frame, onTick: (f) => tick.push(f) };
}

/* ---------------------------------------------------------------- globe */
let coastGeo = null;
/** Côtes Natural Earth 1:110m (src/data/coasts.js, décoratives) en segments sur la sphère unité. */
function coastGeometry() {
  if (coastGeo) return coastGeo;
  const pos = [];
  for (const line of COASTS) {
    let lon = line[0], lat = line[1], prev = latLon(lat / 10, lon / 10);
    for (let i = 2; i < line.length; i += 2) {
      lon += line[i]; lat += line[i + 1];
      const p = latLon(lat / 10, lon / 10);
      // les lignes qui franchissent l'antiméridien sautent de 360° : pas de corde à travers le globe
      if (Math.abs(line[i]) < 1800) pos.push(...prev, ...p);
      prev = p;
    }
  }
  coastGeo = new THREE.BufferGeometry();
  coastGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return coastGeo;
}

function graticule(step = 30, n = 96) {
  const pos = [];
  for (let lat = -90 + step; lat < 90; lat += step) {
    for (let i = 0; i < n; i++) pos.push(...latLon(lat, (360 * i) / n), ...latLon(lat, (360 * (i + 1)) / n));
  }
  for (let lon = 0; lon < 360; lon += step) {
    for (let i = 0; i < n / 2; i++) pos.push(...latLon(-90 + (180 * i) / (n / 2), lon), ...latLon(-90 + (180 * (i + 1)) / (n / 2), lon));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

/**
 * Globe : sphère ombrée (children[0], qui peut recevoir des ombres),
 * côtes, graticule 30° (équateur appuyé), liseré d'atmosphère. Tout est
 * décoratif -- aucun nombre de la page ne se lit sur ce dessin.
 */
export function globeMesh(radius = 1, { color = "--globe-tint", wire = "--globe", segments = 64, coasts = true, grid = true, atmosphere = true } = {}) {
  const g = new THREE.Group();
  const ocean = cssColor(color, "#dcefec");
  const body = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments / 2),
    new THREE.MeshPhongMaterial({ color: ocean, shininess: 18, specular: 0x223333 }));
  g.add(body);
  const ink = cssColor(wire, "#0f766e");
  if (grid) {
    const gr = new THREE.LineSegments(graticule(), new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.16, depthWrite: false }));
    gr.scale.setScalar(radius * 1.0015);
    g.add(gr);
    const eq = []; for (let i = 0; i <= 128; i++) eq.push(latLon(0, (360 * i) / 128, radius * 1.002));
    g.add(polyline(eq, { color: wire, opacity: 0.4 }));
  }
  if (coasts) {
    const c = new THREE.LineSegments(coastGeometry(), new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.75 }));
    c.scale.setScalar(radius * 1.002);
    g.add(c);
  }
  if (atmosphere) {
    // liseré : opacité croissante vers le bord apparent (fresnel en espace vue)
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { tint: { value: new THREE.Color(0x6aa9d8) } },
      vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 tint; varying vec3 vN; void main(){ float f = pow(1.0 - abs(vN.z), 3.0); gl_FragColor = vec4(tint, 0.55 * f); }",
    });
    g.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.025, segments, segments / 2), mat));
  }
  return g;
}

/** Polyligne 3D depuis une liste de [x,y,z]. */
export function polyline(points, { color = "--ink", opacity = 1, dashed = false } = {}) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  const mat = dashed
    ? new THREE.LineDashedMaterial({ color: cssColor(color, "#151a21"), dashSize: 0.08, gapSize: 0.05, transparent: opacity < 1, opacity })
    : new THREE.LineBasicMaterial({ color: cssColor(color, "#151a21"), transparent: opacity < 1, opacity });
  const line = new THREE.Line(geo, mat);
  if (dashed) line.computeLineDistances();
  return line;
}

/** Petite sphère marqueur. */
export function marker(p, r = 0.06, color = "--obj1") {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshPhongMaterial({ color: cssColor(color, "#1d4ed8"), shininess: 40 }));
  m.position.set(...p);
  return m;
}

/**
 * Étiquette texte dans le MONDE, toujours face caméra (sprite). `size` est
 * la hauteur en unités monde ; la largeur suit le texte (elle était fixée à
 * 4× la hauteur et coupait toute chaîne de plus de ~15 caractères).
 * Pour un tampon qui doit rester lisible quand on orbite : S.hud().
 */
export function label(text, p, { color = "#151a21", size = 0.5 } = {}) {
  const mat = new THREE.SpriteMaterial({ transparent: true, depthTest: false });
  const s = new THREE.Sprite(mat);
  s.center.set(0, 0.5);
  s.position.set(...p);
  s.renderOrder = 10;
  s.userData.setText = (t, col = color) => {
    const { c, w, h } = textCanvas(t, { px: 28, color: col });
    mat.map?.dispose();
    mat.map = new THREE.CanvasTexture(c);
    mat.map.colorSpace = THREE.SRGBColorSpace;
    mat.needsUpdate = true;
    // même hauteur de lettre qu'avant (28 px de texte dans une texture de 64 px = size)
    const hh = size * (h / 64);
    s.scale.set(hh * (w / h), hh, 1);
  };
  s.userData.setText(text);
  return s;
}
