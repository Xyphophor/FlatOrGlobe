// FIG -- le helper de figures partagé, porté VERBATIM du legacy
// (flat-or-globe-2.20.0.html L29775-29959) en module ES. Voir le long
// commentaire d'en-tête du legacy (L29749) : chaque schéma symbolique du
// site est un appel à ces primitives et rien d'autre -- « edit the
// generator, never the coordinates ». Ce qu'il impose (règle 1) : une
// figure est à l'échelle sauf déclaration contraire ; exag()/notToScale()
// tamponnent le dessin lui-même, et mountIn() tamponne « not to scale »
// tout dessin resté muet. Les libellés passent par txt()/tex (data-tex),
// que src/core/tex-mathml.js convertit en MathML (renderSvgMath).
const NS = "http://www.w3.org/2000/svg";
export const C = {
  ink: "#151a21", soft: "#5b6470", faint: "#9aa1ab", globe: "#1d4ed8",
  flat: "#b45309", ground: "#7a6a4f", sea: "#0f766e", paper: "#fdfdfc",
  wash: "#f6ecdc", coolwash: "#eef2ff",
};
const SANS = "ui-sans-serif,system-ui", MONO = "ui-monospace,Menlo,monospace";

function mk(name, attrs) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, String(attrs[k]));
  return e;
}
/** 0° = est, sens trigonométrique. */
export function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

class Fig {
  constructor(opt = {}) {
    this.w = opt.w || 380; this.h = opt.h || 200;
    this.svg = mk("svg", { viewBox: "0 0 " + this.w + " " + this.h, role: "img", "aria-label": opt.alt || "" });
    this.stamped = false;
  }
  add(e) { this.svg.appendChild(e); return e; }

  /* ---- traits ---------------------------------------------------------- */
  line(x1, y1, x2, y2, o = {}) {
    return this.add(mk("line", { x1, y1, x2, y2, stroke: o.c || C.ink, "stroke-width": o.w || 1.6, "stroke-dasharray": o.dash, "stroke-linecap": "round" }));
  }
  dash(x1, y1, x2, y2, o = {}) {
    o.dash = o.dash || "5 4"; o.c = o.c || C.faint; o.w = o.w || 1.3;
    return this.line(x1, y1, x2, y2, o);
  }
  path(d, o = {}) {
    return this.add(mk("path", { d, fill: o.fill || "none", stroke: o.c || C.ink, "stroke-width": o.w || 1.6, "stroke-dasharray": o.dash }));
  }
  circle(cx, cy, r, o = {}) {
    return this.add(mk("circle", { cx, cy, r, fill: o.fill || "none", stroke: o.c || C.ink, "stroke-width": o.w || 1.6, "stroke-dasharray": o.dash }));
  }
  ellipse(cx, cy, rx, ry, o = {}) {
    return this.add(mk("ellipse", { cx, cy, rx, ry, fill: o.fill || "none", stroke: o.c || C.faint, "stroke-width": o.w || 1.2, "stroke-dasharray": o.dash }));
  }

  /* ---- le sol et la verticale locale ----------------------------------- */
  ground(y, x1, x2, o = {}) { return this.line(x1, y, x2, y, { c: o.c || C.ground, w: o.w || 2.4 }); }
  vertical(x, yBase, len, o = {}) { return this.line(x, yBase, x, yBase - len, { c: o.c || C.ink, w: o.w || 2.2 }); }
  /* la verticale locale sur une sphère : vers l'extérieur le long du rayon */
  radial(cx, cy, r, deg, len, o) {
    const a = polar(cx, cy, r, deg), b = polar(cx, cy, r + len, deg);
    return this.line(a[0], a[1], b[0], b[1], o);
  }
  /* un repère 2D nu ; les graduations sont des chaînes déjà formatées --
     un schéma qui formate ses propres nombres est un schéma qui contient
     des données. */
  axes(ox, oy, w, h, o = {}) {
    this.arrow(ox, oy, ox + w, oy, { c: o.c || C.faint, w: 1.3, head: 6 });
    this.arrow(ox, oy, ox, oy - h, { c: o.c || C.faint, w: 1.3, head: 6 });
    if (o.x) this.note(ox + w, oy + 15, o.x, { anchor: "end" });
    if (o.y) this.note(ox - 4, oy - h - 4, o.y, { anchor: "end" });
    return this;
  }

  /* ---- points, flèches, angles ----------------------------------------- */
  dot(x, y, o = {}) {
    const d = this.add(mk("circle", { cx: x, cy: y, r: o.r || 4, fill: o.c || C.ink }));
    if (o.label) this.txt(x + (o.dx === undefined ? 7 : o.dx), y + (o.dy === undefined ? -7 : o.dy), o.label, { c: o.c, tex: o.tex, anchor: o.anchor });
    return d;
  }
  arrow(x1, y1, x2, y2, o = {}) {
    const c = o.c || C.ink, ang = Math.atan2(y2 - y1, x2 - x1), L = o.head || 7;
    this.line(x1, y1, x2, y2, { c, w: o.w || 1.6, dash: o.dash });
    const p1 = [x2 - L * Math.cos(ang - 0.42), y2 - L * Math.sin(ang - 0.42)];
    const p2 = [x2 - L * Math.cos(ang + 0.42), y2 - L * Math.sin(ang + 0.42)];
    return this.path("M" + p1[0] + " " + p1[1] + "L" + x2 + " " + y2 + "L" + p2[0] + " " + p2[1], { c, w: o.w || 1.6 });
  }
  /* arc d'angle en (x,y) entre deux azimuts, libellé sur la bissectrice ;
     balayage ET libellé utilisent la différence normalisée (le cas qui
     chevauche ±180 mettait le libellé hors cadre). */
  angle(x, y, r, deg1, deg2, o = {}) {
    const a = polar(x, y, r, deg1), b = polar(x, y, r, deg2);
    const d = (((deg2 - deg1) % 360) + 360) % 360;
    this.path("M" + a[0] + " " + a[1] + "A" + r + " " + r + " 0 " + (d > 180 ? 1 : 0) + " 0 " + b[0] + " " + b[1], { c: o.c || C.ink, w: o.w || 1.4 });
    if (o.label) {
      const m = polar(x, y, r + (o.pad || 13), deg1 + d / 2);
      this.txt(m[0], m[1], o.label, { c: o.c, tex: o.tex, anchor: "middle" });
    }
  }
  /* un angle dont les deux côtés sont des POINTS, pas des azimuts tapés à
     la main (bug v85) : il ne peut pas être du mauvais côté. */
  bearing(x, y, px, py) { return (Math.atan2(y - py, px - x) * 180) / Math.PI; }
  angleAt(vx, vy, r, pA, pB, o) {
    let a = this.bearing(vx, vy, pA[0], pA[1]), b = this.bearing(vx, vy, pB[0], pB[1]);
    if ((((b - a) % 360) + 360) % 360 > 180) { const t = a; a = b; b = t; }
    return this.angle(vx, vy, r, a, b, o);
  }
  /* le carré de l'angle droit : jamais décoratif ici, c'est la
     perpendicularité qui rend un sinus légitime. */
  rightAngle(vx, vy, pA, pB, size) {
    const s = size || 9;
    let u = [pA[0] - vx, pA[1] - vy], v = [pB[0] - vx, pB[1] - vy];
    const lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
    u = [(u[0] / lu) * s, (u[1] / lu) * s]; v = [(v[0] / lv) * s, (v[1] / lv) * s];
    return this.path("M" + (vx + u[0]) + " " + (vy + u[1]) + "L" + (vx + u[0] + v[0]) + " " + (vy + u[1] + v[1]) + "L" + (vx + v[0]) + " " + (vy + v[1]), { c: C.soft, w: 1.2 });
  }
  /* un angle COUCHÉ dans un plan dessiné en perspective (rose des vents en
     ellipse) ; angles PARAMÉTRIQUES, pas des azimuts écran. */
  angleFlat(cx, cy, rx, ry, deg1, deg2, o = {}) {
    const e = (d) => { const a = (d * Math.PI) / 180; return [cx + rx * Math.cos(a), cy - ry * Math.sin(a)]; };
    const d = (((deg2 - deg1) % 360) + 360) % 360;
    const a = e(deg1), b = e(deg2);
    this.path("M" + a[0] + " " + a[1] + "A" + rx + " " + ry + " 0 " + (d > 180 ? 1 : 0) + " 0 " + b[0] + " " + b[1], { c: o.c || C.ink, w: o.w || 1.4 });
    if (o.label) {
      const pad = o.pad || 13, m = deg1 + d / 2, ang = (m * Math.PI) / 180;
      this.txt(cx + (rx + pad) * Math.cos(ang), cy - (ry + pad * 0.45) * Math.sin(ang) + 4, o.label, { c: o.c, tex: o.tex, anchor: "middle" });
    }
  }

  /* ---- segment coté ----------------------------------------------------- */
  seg(x1, y1, x2, y2, o = {}) {
    const c = o.c || C.soft, ang = Math.atan2(y2 - y1, x2 - x1), t = 4.5;
    const nx = -Math.sin(ang) * t, ny = Math.cos(ang) * t;
    this.line(x1, y1, x2, y2, { c, w: o.w || 1.2 });
    this.line(x1 - nx, y1 - ny, x1 + nx, y1 + ny, { c, w: 1.2 });
    this.line(x2 - nx, y2 - ny, x2 + nx, y2 + ny, { c, w: 1.2 });
    if (o.label) {
      const mx = (x1 + x2) / 2 - Math.sin(ang) * (o.side || -11), my = (y1 + y2) / 2 + Math.cos(ang) * (o.side || -11);
      this.txt(mx, my, o.label, { c, tex: o.tex, anchor: "middle" });
    }
  }

  /* ---- texte ------------------------------------------------------------ */
  txt(x, y, s, o = {}) {
    const e = mk("text", { x, y, "font-family": o.sans ? SANS : MONO, "font-size": o.size || (o.sans ? 11 : 12), fill: o.c || C.ink, "text-anchor": o.anchor || "start" });
    if (o.tex) e.setAttribute("data-tex", o.tex);
    e.textContent = s;
    return this.add(e);
  }
  note(x, y, s, o = {}) { o.sans = true; o.c = o.c || C.soft; return this.txt(x, y, s, o); }

  /* ---- les tampons d'honnêteté (règle 1). Pas une décoration. ---------- */
  exag(n, what) {
    this.stamped = true;
    return this.note(this.w - 4, 12, (what || "vertical") + " exaggeration ×" + n, { anchor: "end", c: C.flat, size: 10 });
  }
  /* le tampon DIT toujours « not to scale » ; l'argument ajoute seulement ce
     qui est déformé. */
  notToScale(s) {
    this.stamped = true;
    return this.note(this.w - 4, 12, "not to scale" + (s ? " — " + s : ""), { anchor: "end", c: C.flat, size: 10 });
  }
  trueScale() {
    this.stamped = true;
    return this.note(this.w - 4, 12, "true scale", { anchor: "end", c: C.soft, size: 10 });
  }

  /* ---- montage ---------------------------------------------------------- */
  mountIn(host) {
    if (!host) return null;
    if (!this.stamped) this.notToScale(); // le silence n'est pas une option (règle 1)
    host.textContent = "";
    host.appendChild(this.svg);
    return this.svg;
  }
}

export const FIG = { make: (o) => new Fig(o), C, polar };
export default FIG;
