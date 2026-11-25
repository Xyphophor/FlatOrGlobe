//! Canvas 2D rasterizer for the site's figures and cards.
//!
//! The figures stay JavaScript: they call the Canvas 2D API on a recording
//! context (`src/core/ctx-record.js`) that writes every call as a few numbers
//! into a stream, plus a string table (colours, fonts, texts) and a buffer of
//! RGBA images. `render` replays that stream with tiny-skia and returns the
//! pixels. One call per image, so the wasm boundary is crossed once, not once
//! per `lineTo`. The module exports a plain C ABI (no wasm-bindgen): the same
//! `.wasm` loads in a browser, in Node and in Go (wazero).
//!
//! Method and references: the drawing model is the HTML Living Standard's
//! "The 2D rendering context" (state, transform, path, dash, clip, text
//! alignment and baseline); rasterisation, antialiasing and gradients are
//! tiny-skia's (Skia's CPU pipeline); glyph outlines come from ttf-parser, so
//! text is filled as paths and obeys the transform, clip and alpha like any
//! other shape. Fonts are embedded (DejaVu, free licence): the CSS families
//! the figures name (`system-ui`, `ui-monospace`, `Menlo`, `serif`) do not
//! exist inside wasm, so they map onto three families.
use std::cell::RefCell;
use std::collections::HashMap;
use tiny_skia::*;
use ttf_parser::{Face, OutlineBuilder};

static FONT_BYTES: [&[u8]; 5] = [
    include_bytes!("../fonts/DejaVuSans.ttf"),
    include_bytes!("../fonts/DejaVuSans-Bold.ttf"),
    include_bytes!("../fonts/DejaVuSansMono.ttf"),
    include_bytes!("../fonts/DejaVuSansMono-Bold.ttf"),
    include_bytes!("../fonts/DejaVuSerif.ttf"),
];

thread_local! {
    static FACES: Vec<Face<'static>> = FONT_BYTES.iter().map(|b| Face::parse(b, 0).expect("embedded font")).collect();
    static OUT: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}

#[derive(Clone)]
struct FontSpec { face: usize, size: f32, italic: bool }

/// "italic 600 11px ui-monospace, Menlo, monospace" -> embedded face + size.
fn parse_font(s: &str) -> FontSpec {
    let low = s.to_ascii_lowercase();
    let mut size = 10.0;
    let mut tail = "";
    let toks: Vec<&str> = low.split_whitespace().collect();
    let mut pos = 0usize;
    for t in &toks {
        pos = low[pos..].find(t).map(|i| i + pos).unwrap_or(pos) + t.len();
        if let Some(n) = t.strip_suffix("px") { if let Ok(v) = n.parse::<f32>() { size = v; tail = &low[pos..]; break; } }
    }
    let bold = toks.iter().any(|t| matches!(*t, "bold" | "600" | "700" | "800" | "900"));
    let italic = toks.iter().any(|t| *t == "italic" || *t == "oblique");
    let mono = tail.contains("mono") || tail.contains("menlo") || tail.contains("courier");
    let serif = !mono && (tail.trim_start().starts_with("serif") || tail.contains("georgia") || tail.contains("times")) && !tail.contains("sans");
    let face = if mono { if bold { 3 } else { 2 } } else if serif { 4 } else if bold { 1 } else { 0 };
    FontSpec { face, size, italic }
}

fn text_width(f: &FontSpec, text: &str) -> f32 {
    FACES.with(|fs| {
        let face = &fs[f.face];
        let k = f.size / face.units_per_em() as f32;
        text.chars().map(|c| face.glyph_index(c).and_then(|g| face.glyph_hor_advance(g)).unwrap_or(0) as f32 * k).sum()
    })
}

struct Outline<'a>(&'a mut PathBuilder);
impl OutlineBuilder for Outline<'_> {
    fn move_to(&mut self, x: f32, y: f32) { self.0.move_to(x, y); }
    fn line_to(&mut self, x: f32, y: f32) { self.0.line_to(x, y); }
    fn quad_to(&mut self, x1: f32, y1: f32, x: f32, y: f32) { self.0.quad_to(x1, y1, x, y); }
    fn curve_to(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, x: f32, y: f32) { self.0.cubic_to(x1, y1, x2, y2, x, y); }
    fn close(&mut self) { self.0.close(); }
}

#[derive(Clone)]
enum Style { Color(Color), Grad(usize) }

#[derive(Clone)]
struct State {
    ctm: Transform, origin: Transform, fill: Style, stroke: Style, lw: f32, dash: Vec<f32>, alpha: f32,
    font: FontSpec, align: u8, base: u8, clip: Option<Mask>, cap: LineCap, join: LineJoin,
}

struct Grad { radial: bool, p: [f32; 6], stops: Vec<(f32, Color)> }

struct Img { w: u32, h: u32, off: usize }

fn color(s: &str) -> Option<Color> {
    let c = csscolorparser::parse(s).ok()?;
    Color::from_rgba(c.r.clamp(0.0, 1.0), c.g.clamp(0.0, 1.0), c.b.clamp(0.0, 1.0), c.a.clamp(0.0, 1.0))
}

fn with_alpha(c: Color, a: f32) -> Color { Color::from_rgba(c.red(), c.green(), c.blue(), c.alpha() * a).unwrap_or(c) }

struct Rd<'a> { v: &'a [f64], i: usize }
impl Rd<'_> {
    fn f(&mut self) -> f32 { let x = self.v[self.i]; self.i += 1; x as f32 }
    fn u(&mut self) -> usize { let x = self.v[self.i]; self.i += 1; x as usize }
}

struct Ctx<'a> {
    pm: Pixmap, st: State, stack: Vec<State>, pb: PathBuilder, start: Option<(f32, f32)>, cur: Option<(f32, f32)>,
    strs: Vec<&'a str>, grads: Vec<Grad>, imgs: HashMap<usize, Img>, img_buf: &'a [u8],
    /// Canvases being drawn off-screen (see `BEGIN_LAYER`): the parent's pixmap, state and state stack.
    layers: Vec<(Pixmap, State, Vec<State>)>,
}

impl<'a> Ctx<'a> {
    fn shader(&self, s: &Style) -> Option<Shader<'static>> {
        let a = self.st.alpha;
        match s {
            Style::Color(c) => Some(Shader::SolidColor(with_alpha(*c, a))),
            Style::Grad(id) => {
                let g = self.grads.get(*id)?;
                let mut stops: Vec<GradientStop> = g.stops.iter().map(|(o, c)| GradientStop::new(*o, with_alpha(*c, a))).collect();
                if stops.is_empty() { return None; }
                if stops.len() == 1 { let c0 = with_alpha(g.stops[0].1, a); stops.push(GradientStop::new(1.0, c0)); }
                let p = g.p;
                if g.radial {
                    // two-point conical with a start radius is not in tiny-skia 0.11: the inner circle's radius is ignored
                    RadialGradient::new(Point::from_xy(p[0], p[1]), Point::from_xy(p[3], p[4]), p[5].max(0.01), stops, SpreadMode::Pad, Transform::identity())
                } else {
                    LinearGradient::new(Point::from_xy(p[0], p[1]), Point::from_xy(p[2], p[3]), stops, SpreadMode::Pad, Transform::identity())
                }
            }
        }
    }
    fn paint(&self, s: &Style) -> Paint<'static> {
        let mut p = Paint::default();
        p.anti_alias = true;
        p.shader = self.shader(s).unwrap_or(Shader::SolidColor(Color::TRANSPARENT));
        p
    }
    fn add_pt(&mut self, x: f32, y: f32, line: bool) {
        if !x.is_finite() || !y.is_finite() { return; }
        if line && self.cur.is_some() { self.pb.line_to(x, y); } else { self.pb.move_to(x, y); self.start = Some((x, y)); }
        self.cur = Some((x, y));
    }
    fn arc(&mut self, cx: f32, cy: f32, rx: f32, ry: f32, rot: f32, a0: f32, a1: f32, ccw: bool) {
        use std::f32::consts::TAU;
        let mut sweep = a1 - a0;
        if sweep.abs() >= TAU { sweep = if ccw { -TAU } else { TAU }; }
        else if ccw { sweep = -((a0 - a1).rem_euclid(TAU)); } else { sweep = sweep.rem_euclid(TAU); }
        let (sr, cr) = rot.sin_cos();
        let pt = |a: f32| { let (s, c) = a.sin_cos(); let (x, y) = (rx * c, ry * s); (cx + x * cr - y * sr, cy + x * sr + y * cr) };
        let dv = |a: f32| { let (s, c) = a.sin_cos(); let (x, y) = (-rx * s, ry * c); (x * cr - y * sr, x * sr + y * cr) };
        let (sx, sy) = pt(a0);
        self.add_pt(sx, sy, true);
        let n = ((sweep.abs() / std::f32::consts::FRAC_PI_2).ceil() as usize).max(1);
        let d = sweep / n as f32;
        let k = 4.0 / 3.0 * (d / 4.0).tan();
        for i in 0..n {
            let (b0, b1) = (a0 + d * i as f32, a0 + d * (i + 1) as f32);
            let (p0, p3, t0, t3) = (pt(b0), pt(b1), dv(b0), dv(b1));
            self.pb.cubic_to(p0.0 + k * t0.0, p0.1 + k * t0.1, p3.0 - k * t3.0, p3.1 - k * t3.1, p3.0, p3.1);
        }
        self.cur = Some(pt(a1));
    }
    fn take_path(&mut self) -> Option<Path> { self.pb.clone().finish() }
    fn rect_path(x: f32, y: f32, w: f32, h: f32) -> Option<Path> {
        let mut b = PathBuilder::new();
        b.move_to(x, y); b.line_to(x + w, y); b.line_to(x + w, y + h); b.line_to(x, y + h); b.close();
        b.finish()
    }
    fn fill_path(&mut self, path: &Path) {
        let p = self.paint(&self.st.fill.clone());
        self.pm.fill_path(path, &p, FillRule::Winding, self.st.ctm, self.st.clip.as_ref());
    }
    fn stroke_path(&mut self, path: &Path) {
        let p = self.paint(&self.st.stroke.clone());
        let mut s = Stroke { width: self.st.lw, line_cap: self.st.cap, line_join: self.st.join, ..Stroke::default() };
        let mut d = self.st.dash.clone();
        if !d.is_empty() && d.iter().all(|x| x.is_finite() && *x >= 0.0) && d.iter().sum::<f32>() > 0.0 {
            if d.len() % 2 == 1 { d.extend(d.clone()); }
            s.dash = StrokeDash::new(d, 0.0);
        }
        self.pm.stroke_path(path, &p, &s, self.st.ctm, self.st.clip.as_ref());
    }
    fn text(&mut self, si: usize, x: f32, y: f32, maxw: f32, stroke: bool) {
        let text = self.strs.get(si).copied().unwrap_or("");
        let f = self.st.font.clone();
        let w = text_width(&f, text);
        let sx = if maxw > 0.0 && w > maxw { maxw / w } else { 1.0 };
        let x0 = x - sx * match self.st.align { 1 => w / 2.0, 2 => w, _ => 0.0 };
        let path = FACES.with(|fs| {
            let face = &fs[f.face];
            let (asc, desc) = (face.ascender() as f32, face.descender() as f32);
            let k = f.size / face.units_per_em() as f32;
            let by = y + match self.st.base { 1 => (asc + desc) / 2.0 * k, 2 => asc * k, 3 => desc * k, _ => 0.0 };   // middle, top/hanging, bottom
            let mut pb = PathBuilder::new();
            let mut pen = 0.0f32;
            for c in text.chars() {
                let Some(g) = face.glyph_index(c) else { continue };
                let mut gb = PathBuilder::new();
                if face.outline_glyph(g, &mut Outline(&mut gb)).is_some() {
                    if let Some(gp) = gb.finish() {
                        let skew = if f.italic { 0.2 } else { 0.0 };
                        // glyph units (y up) -> user space: shear for italic, flip y, scale, then move to the pen
                        let t = Transform::from_row(k * sx, 0.0, k * skew * sx, -k, x0 + pen * sx, by);
                        if let Some(p) = gp.transform(t) { pb.push_path(&p); }
                    }
                }
                pen += face.glyph_hor_advance(g).unwrap_or(0) as f32 * k;
            }
            pb.finish()
        });
        if let Some(p) = path { if stroke { self.stroke_path(&p); } else { self.fill_path(&p); } }
    }
    fn draw_image(&mut self, id: usize, r: [f32; 8]) {
        let Some(im) = self.imgs.get(&id) else { return };
        let n = (im.w * im.h * 4) as usize;
        let Some(src) = self.img_buf.get(im.off..im.off + n) else { return };
        let Some(mut pix) = Pixmap::new(im.w, im.h) else { return };
        for (d, s) in pix.data_mut().chunks_exact_mut(4).zip(src.chunks_exact(4)) {   // ImageData is straight alpha, Pixmap premultiplied
            let a = s[3] as u32;
            d[0] = ((s[0] as u32 * a + 127) / 255) as u8; d[1] = ((s[1] as u32 * a + 127) / 255) as u8; d[2] = ((s[2] as u32 * a + 127) / 255) as u8; d[3] = s[3];
        }
        let [sx, sy, sw, sh, dx, dy, dw, dh] = r;
        if sw <= 0.0 || sh <= 0.0 { return; }
        let local = Transform::from_row(dw / sw, 0.0, 0.0, dh / sh, dx - sx * dw / sw, dy - sy * dh / sh);
        let mut p = Paint::default();
        p.anti_alias = true;
        p.shader = Pattern::new(pix.as_ref(), SpreadMode::Pad, FilterQuality::Bilinear, self.st.alpha, local);
        if let Some(path) = Self::rect_path(dx, dy, dw, dh) { self.pm.fill_path(&path, &p, FillRule::Winding, self.st.ctm, self.st.clip.as_ref()); }
    }
}

fn default_state() -> State {
    State {
        ctm: Transform::identity(), origin: Transform::identity(), fill: Style::Color(Color::BLACK), stroke: Style::Color(Color::BLACK), lw: 1.0, dash: vec![], alpha: 1.0,
        font: parse_font("10px sans-serif"), align: 0, base: 0, clip: None, cap: LineCap::Butt, join: LineJoin::Miter,
    }
}

fn run(ops: &[f64], strs: Vec<&str>, imgs: HashMap<usize, Img>, img_buf: &[u8], w: u32, h: u32, bg: Color) -> Option<Pixmap> {
    let mut pm = Pixmap::new(w, h)?;
    pm.fill(bg);
    let st = default_state();
    let mut c = Ctx { pm, st, stack: vec![], pb: PathBuilder::new(), start: None, cur: None, strs, grads: vec![], imgs, img_buf, layers: vec![] };
    let mut r = Rd { v: ops, i: 0 };
    while r.i < ops.len() {
        let op = r.u();
        match op {
            0 => c.stack.push(c.st.clone()),
            1 => if let Some(s) = c.stack.pop() { c.st = s; },
            2 => { let (a, b, cc, d, e, f) = (r.f(), r.f(), r.f(), r.f(), r.f(), r.f()); c.st.ctm = c.st.origin.pre_concat(Transform::from_row(a, b, cc, d, e, f)); }
            3 => { let (a, b, cc, d, e, f) = (r.f(), r.f(), r.f(), r.f(), r.f(), r.f()); c.st.ctm = c.st.ctm.pre_concat(Transform::from_row(a, b, cc, d, e, f)); }
            4 => { let (x, y) = (r.f(), r.f()); c.st.ctm = c.st.ctm.pre_translate(x, y); }
            5 => { let (x, y) = (r.f(), r.f()); c.st.ctm = c.st.ctm.pre_scale(x, y); }
            6 => { let (s, co) = (r.f() as f64).sin_cos(); c.st.ctm = c.st.ctm.pre_concat(Transform::from_row(co as f32, s as f32, -s as f32, co as f32, 0.0, 0.0)); }
            7 => { c.pb = PathBuilder::new(); c.start = None; c.cur = None; }
            8 => { let (x, y) = (r.f(), r.f()); c.add_pt(x, y, false); }
            9 => { let (x, y) = (r.f(), r.f()); c.add_pt(x, y, true); }
            10 => if let Some((x, y)) = c.start { c.pb.close(); c.cur = Some((x, y)); },
            11 => { let (x, y, w, h) = (r.f(), r.f(), r.f(), r.f()); c.pb.move_to(x, y); c.pb.line_to(x + w, y); c.pb.line_to(x + w, y + h); c.pb.line_to(x, y + h); c.pb.close(); c.start = Some((x, y)); c.cur = Some((x, y)); }
            12 => { let (x, y, rad, a0, a1, ccw) = (r.f(), r.f(), r.f(), r.f(), r.f(), r.f()); if rad >= 0.0 { c.arc(x, y, rad, rad, 0.0, a0, a1, ccw != 0.0); } }
            13 => { let (x, y, rx, ry, rot, a0, a1, ccw) = (r.f(), r.f(), r.f(), r.f(), r.f(), r.f(), r.f(), r.f()); c.arc(x, y, rx, ry, rot, a0, a1, ccw != 0.0); }
            14 => { let (a, b, x, y) = (r.f(), r.f(), r.f(), r.f()); if c.cur.is_none() { c.add_pt(a, b, false); } c.pb.quad_to(a, b, x, y); c.cur = Some((x, y)); }
            15 => { let (a, b, cc, d, x, y) = (r.f(), r.f(), r.f(), r.f(), r.f(), r.f()); if c.cur.is_none() { c.add_pt(a, b, false); } c.pb.cubic_to(a, b, cc, d, x, y); c.cur = Some((x, y)); }
            16 => if let Some(p) = c.take_path() { c.fill_path(&p); },
            17 => if let Some(p) = c.take_path() { c.stroke_path(&p); },
            18 => if let Some(p) = c.take_path() {
                let mut m = c.st.clip.take().map(|m| (m, false)).unwrap_or_else(|| (Mask::new(c.pm.width(), c.pm.height()).unwrap(), true));
                if m.1 { m.0.fill_path(&p, FillRule::Winding, true, c.st.ctm); } else { m.0.intersect_path(&p, FillRule::Winding, true, c.st.ctm); }
                c.st.clip = Some(m.0);
            },
            19 => { let (x, y, w, h) = (r.f(), r.f(), r.f(), r.f()); if let Some(p) = Ctx::rect_path(x, y, w, h) { c.fill_path(&p); } }
            20 => { let (x, y, w, h) = (r.f(), r.f(), r.f(), r.f()); if let Some(p) = Ctx::rect_path(x, y, w, h) { c.stroke_path(&p); } }
            21 => { let (x, y, w, h) = (r.f(), r.f(), r.f(), r.f()); if let Some(p) = Ctx::rect_path(x, y, w, h) { let mut pt = Paint::default(); pt.blend_mode = BlendMode::Clear; c.pm.fill_path(&p, &pt, FillRule::Winding, c.st.ctm, c.st.clip.as_ref()); } }
            22 => { let i = r.u(); if let Some(col) = c.strs.get(i).and_then(|s| color(s)) { c.st.fill = Style::Color(col); } }
            23 => { let i = r.u(); if let Some(col) = c.strs.get(i).and_then(|s| color(s)) { c.st.stroke = Style::Color(col); } }
            24 => { c.st.fill = Style::Grad(r.u()); }
            25 => { c.st.stroke = Style::Grad(r.u()); }
            26 => { let v = r.f(); if v > 0.0 && v.is_finite() { c.st.lw = v; } }
            27 => { let n = r.u(); c.st.dash = (0..n).map(|_| r.f()).collect(); }
            28 => { c.st.alpha = r.f().clamp(0.0, 1.0); }
            29 => { let i = r.u(); if let Some(s) = c.strs.get(i) { c.st.font = parse_font(s); } }
            30 => { c.st.align = r.u() as u8; }
            31 => { c.st.base = r.u() as u8; }
            32 => { let (i, x, y, mw) = (r.u(), r.f(), r.f(), r.f()); c.text(i, x, y, mw, false); }
            33 => { let (i, x, y, mw) = (r.u(), r.f(), r.f(), r.f()); c.text(i, x, y, mw, true); }
            34 => { let id = r.u(); let p = [r.f(), r.f(), r.f(), r.f(), 0.0, 0.0]; while c.grads.len() <= id { c.grads.push(Grad { radial: false, p: [0.0; 6], stops: vec![] }); } c.grads[id] = Grad { radial: false, p, stops: vec![] }; }
            35 => { let id = r.u(); let p = [r.f(), r.f(), r.f(), r.f(), r.f(), r.f()]; while c.grads.len() <= id { c.grads.push(Grad { radial: false, p: [0.0; 6], stops: vec![] }); } c.grads[id] = Grad { radial: true, p: [p[0], p[1], p[2], p[3], p[4], p[5]], stops: vec![] }; }
            36 => { let (id, o, si) = (r.u(), r.f(), r.u()); if let (Some(g), Some(col)) = (c.grads.get_mut(id), c.strs.get(si).and_then(|s| color(s))) { g.stops.push((o.clamp(0.0, 1.0), col)); } }
            37 => { let id = r.u(); let q = [r.f(), r.f(), r.f(), r.f(), r.f(), r.f(), r.f(), r.f()]; c.draw_image(id, q); }
            38 => { let (id, w, h, off) = (r.u(), r.u(), r.u(), r.u()); c.imgs.insert(id, Img { w: w as u32, h: h as u32, off }); }   // images normally come from the table passed to render
            39 => { c.st.cap = match r.u() { 1 => LineCap::Round, 2 => LineCap::Square, _ => LineCap::Butt }; }
            43 => {   // BEGIN_LAYER w h: the following ops draw a nested canvas on its own transparent pixmap (a figure's clearRect must not punch the card)
                let (lw, lh) = (r.u() as u32, r.u() as u32);
                if let Some(np) = Pixmap::new(lw.max(1), lh.max(1)) {
                    let parent = std::mem::replace(&mut c.pm, np);
                    c.layers.push((parent, c.st.clone(), std::mem::take(&mut c.stack)));
                    c.st = default_state(); c.pb = PathBuilder::new(); c.start = None; c.cur = None;
                }
            }
            44 => {   // END_LAYER: composite the layer onto the parent with the parent's transform, clip and alpha
                if let Some((ppm, pst, pstack)) = c.layers.pop() {
                    let layer = std::mem::replace(&mut c.pm, ppm);
                    c.st = pst; c.stack = pstack; c.pb = PathBuilder::new(); c.start = None; c.cur = None;
                    let (lw, lh) = (layer.width() as f32, layer.height() as f32);
                    let mut p = Paint::default();
                    let t = c.st.ctm;
                    let unit = (t.sx - 1.0).abs() < 1e-3 && (t.sy - 1.0).abs() < 1e-3 && t.kx.abs() < 1e-3 && t.ky.abs() < 1e-3;   // 1:1 copy stays crisp
                    p.shader = Pattern::new(layer.as_ref(), SpreadMode::Pad, if unit { FilterQuality::Nearest } else { FilterQuality::Bilinear }, c.st.alpha, Transform::identity());
                    if let Some(path) = Ctx::rect_path(0.0, 0.0, lw, lh) { c.pm.fill_path(&path, &p, FillRule::Winding, c.st.ctm, c.st.clip.as_ref()); }
                }
            }
            41 => { c.st.origin = c.st.ctm; }   // a nested canvas's setTransform/resetTransform are relative to where it was drawn
            42 => { c.st.ctm = c.st.origin; }
            40 => { c.st.join = match r.u() { 1 => LineJoin::Round, 2 => LineJoin::Bevel, _ => LineJoin::Miter }; }
            _ => break,   // unknown op: the stream is out of step, stop rather than draw garbage
        }
    }
    Some(c.pm)
}

// ---- C ABI ----------------------------------------------------------------

/// Buffer of `n` bytes, 8-aligned (the op stream is read as f64).
#[no_mangle]
pub extern "C" fn alloc(n: usize) -> *mut u8 {
    let mut v = Vec::<u64>::with_capacity(n.div_ceil(8).max(1));
    let p = v.as_mut_ptr() as *mut u8;
    std::mem::forget(v);
    p
}
/// # Safety
/// `p` and `n` must come from one `alloc(n)` call.
#[no_mangle]
pub unsafe extern "C" fn dealloc(p: *mut u8, n: usize) { drop(Vec::<u64>::from_raw_parts(p as *mut u64, 0, n.div_ceil(8).max(1))); }

/// Width in px of `text` set in the CSS font `font` (what `measureText().width` answers).
/// # Safety
/// Both pointers must address valid UTF-8 of the given lengths.
#[no_mangle]
pub unsafe extern "C" fn measure(font: *const u8, flen: usize, text: *const u8, tlen: usize) -> f64 {
    let (f, t) = (std::slice::from_raw_parts(font, flen), std::slice::from_raw_parts(text, tlen));
    text_width(&parse_font(std::str::from_utf8(f).unwrap_or("")), std::str::from_utf8(t).unwrap_or("")) as f64
}

/// Replays `nops` f64 words of ops with the string table (`u32 length` + bytes, repeated), the RGBA image
/// bytes and the image table (`ntab` entries of 4 f64: id, width, height, byte offset); returns a pointer to w*h*4 premultiplied RGBA bytes (opaque once `bg` is), valid until
/// the next call, or null on failure. `bg` = 0xRRGGBBAA.
/// # Safety
/// The pointers must address buffers of the stated sizes; `ops` must be 8-aligned.
#[no_mangle]
pub unsafe extern "C" fn render(ops: *const f64, nops: usize, strs: *const u8, slen: usize, imgs_ptr: *const u8, ilen: usize, itab: *const f64, ntab: usize, w: u32, h: u32, bg: u32) -> *const u8 {
    let ops = std::slice::from_raw_parts(ops, nops);
    let sb = std::slice::from_raw_parts(strs, slen);
    let mut table = Vec::new();
    let mut i = 0;
    while i + 4 <= sb.len() {
        let n = u32::from_le_bytes([sb[i], sb[i + 1], sb[i + 2], sb[i + 3]]) as usize;
        i += 4;
        table.push(std::str::from_utf8(sb.get(i..i + n).unwrap_or(&[])).unwrap_or(""));
        i += n;
    }
    let tab = std::slice::from_raw_parts(itab, ntab * 4);
    let imgs: HashMap<usize, Img> = tab.chunks_exact(4).map(|t| (t[0] as usize, Img { w: t[1] as u32, h: t[2] as u32, off: t[3] as usize })).collect();
    let bgc = Color::from_rgba8((bg >> 24) as u8, (bg >> 16) as u8, (bg >> 8) as u8, bg as u8);
    match run(ops, table, imgs, std::slice::from_raw_parts(imgs_ptr, ilen), w, h, bgc) {
        Some(pm) => OUT.with(|o| { *o.borrow_mut() = pm.take(); o.borrow().as_ptr() }),
        None => std::ptr::null(),
    }
}
