// Bloc « votre propre récepteur » (panneau GPS brut, epic16/UC04) : le visiteur choisit
// le journal brut de son téléphone et l'éphéméride diffusée du jour ; la page le résout
// (userlogic.js) et le place parmi les stations. RIEN n'est envoyé ni stocké : les
// fichiers sont lus par FileReader, le résultat vit dans cette fermeture et disparaît
// avec la page. La figure n'est pas une carte d'export (la position resterait dans l'image).
import { drawFitBox, fitBoxHeight } from "../../core/fitbox.js";
import { heightCorr } from "./grouplogic.js";
import { setupCanvas } from "../../core/canvas.js";
import { coastLines } from "../../core/globe25d.js";
import { GPS_RAW } from "../../data/presets/gps-raw.js";
import { earthFromStations, geocentricLat } from "../gps/rawlogic.js";
import { parseObservations, parseRinexNav, solveLog, youVsStations, gpsDate } from "./userlogic.js";
import { rawData } from "../gps/rawfig.js";
import { colors, label, wrapLabel, dot, SOFT } from "../avia/draw.js";
import { num } from "../curv/fmt.js";

const FONT = "10px system-ui, sans-serif";

/** Texte d'un fichier, décompressé s'il est en gzip (DecompressionStream du navigateur). */
async function readText(file) {
  const head = new Uint8Array(await file.slice(0, 2).arrayBuffer());
  if (head[0] === 0x1f && head[1] === 0x8b) return new Response(file.stream().pipeThrough(new DecompressionStream("gzip"))).text();
  if (head[0] === 0x1f && head[1] === 0x9d) throw new Error("unix-compress");
  return file.text();
}

/** onSolved(res | null) : prévient le bloc « à plusieurs » (groupfig.js) quand la position change. */
export function mountGpsYou(root, tr, onSolved = () => {}) {
  const input = root.querySelector("#rxFiles"), status = root.querySelector("#rxStatus"), fig = root.querySelector("#rxYouFig"), cv = root.querySelector("#rxYouCanvas");
  if (!input || !cv) return { draw() {} };
  let log = null, nav = null, res = null;
  const say = (html) => { status.innerHTML = html; };

  const solve = () => {
    res = null; fig.hidden = true; onSolved(null);
    if (!log) { say(tr("gu-need-log", "Now the phone log (GnssLogger / GPSTest .txt, or a RINEX 3 observation file).")); return; }
    const d = gpsDate(log.epochs[0].week, log.epochs[0].sow), folder = `https://igs.bkg.bund.de/root_ftp/IGS/BRDC/${d.year}/${String(d.doy).padStart(3, "0")}/`;
    if (!nav) {
      // quel BRDC : celui de l'IGS (publié le lendemain) porte les coefficients de l'ionosphère
      // (Klobuchar) ; ceux de BKG (WRD), disponibles le jour même, non -- les orbites sont les mêmes
      const day = `${d.year}${String(d.doy).padStart(3, "0")}0000_01D_MN.rnx.gz`;
      say(`${num(log.epochs.length)} ${tr("gu-epochs", "epochs read")} (${d.iso}). ${tr("gu-need-nav", "Now the navigation file of that day, from")} <a href="${folder}" target="_blank" rel="noopener">${folder}</a>. `
        + `${tr("gu-pref1", "Best:")} <code>BRDC00IGS_R_${day}</code>, ${tr("gu-pref2", "published the next day, which carries the ionosphere coefficients. On the day itself:")} <code>BRDC00WRD_S_${day}</code> ${tr("gu-pref3", "(updated every 15 minutes; or the lighter _R one), same orbits but no ionosphere correction. It can be chosen as it is, compressed.")}`);
      return;
    }
    const r = solveLog(nav, log);
    if (!r) { say(`${tr("gu-none", "No epoch could be solved. Is the navigation file of the same day")} (${d.iso}, ${tr("gu-day", "day")} ${d.doy})? <a href="${folder}" target="_blank" rel="noopener">${folder}</a>`); return; }
    const S = GPS_RAW.stations, E = rawData().earth, W = earthFromStations([...S, { id: "you", xyz: r.x }]);
    // r de l'encadré : hauteurs au-dessus du meilleur plan contre la flèche de la sphère des stations et vous
    res = { r, v: youVsStations(r, E, W, E.c), d, rB: heightCorr([...S.map((s) => s.xyz), r.x], W.c, W.R) };
    const g = r.geo, ns = g.lat >= 0 ? "N" : "S", ew = g.lon >= 0 ? "E" : "W";
    say(`${tr("gu-solved", "Solved")}: ${num(r.n)}/${num(r.tried)} ${tr("gu-epochs2", "epochs")} (${r.systems.map((s) => (s === "G" ? "GPS" : "Galileo")).join(" + ")}, ${num(r.sats, 1)} ${tr("gu-sats", "satellites on average")}), `
      + `${num(Math.abs(g.lat), 1)}° ${ns}, ${num(Math.abs(g.lon), 1)}° ${ew} ${tr("gu-rounded", "(rounded to 0.1°)")}. `
      + (nav.iono ? "" : tr("gu-noiono", "This navigation file has no ionosphere coefficients: the ionosphere is left in (a few metres to tens of metres); the IGS file (BRDC00IGS_R…, published the next day) has them. "))
      + tr("gu-private", "Nothing has left this page."));
    fig.hidden = false;
    draw();
    onSolved(res);
  };

  input.addEventListener("change", async () => {
    for (const f of input.files) {
      try {
        const text = await readText(f), top = text.slice(0, 4000);
        if (/CRINEX/.test(top.slice(0, 200))) throw new Error("hatanaka");
        if (/RINEX VERSION \/ TYPE/.test(top) && /NAV/.test(top.split("\n").find((l) => l.includes("RINEX VERSION")) || "")) nav = parseRinexNav(text);
        else log = parseObservations(text);
        if (log && !log.epochs.length) { log = null; throw new Error("no-raw"); }
      } catch (e) {
        const why = { hatanaka: tr("gu-crx", "Hatanaka-compressed files (.crx) are not read here: take the .rnx one."), "unix-compress": tr("gu-z", "Unix-compressed files (.Z) are not read here: take the .gz one."), "no-raw": tr("gu-noraw", "No usable raw GPS L1 / Galileo E1 measurement in this log (is raw logging on?).") }[e.message];
        say(`${f.name}: ${why ?? `${tr("gu-unread", "could not be read")} (${e.message}).`}`);
        input.value = "";
        return;
      }
    }
    input.value = "";
    solve();
  });

  const draw = () => {
    if (!res || fig.hidden) return;
    const { ctx, W, H } = setupCanvas(cv);
    if (!W) return;
    const { globe, flat } = colors(cv), { r, v } = res, E = rawData().earth, S = GPS_RAW.stations, wide = W > 560, you = flat;
    ctx.fillStyle = "#fdfdfc"; ctx.fillRect(0, 0, W, H);
    // tuiles
    const tiles = [
      [`${num(r.dist / 1000, 1)} km`, tr("gu-t1", "your distance to the centre of the coordinates (the origin the solution started from)"), you],
      [null, null, globe, { R: `${num(v.Rwith / 1000, 1)} km`, r: res.rB, rOf: tr("gq-rof", "height, sphere"), scatter: `${tr("gu-t2b", "without you")} ${num(v.R / 1000, 1)} km`, chi2nu: null, title: tr("gu-t2t", "sphere through the stations and you") }],
      [`${num(r.resid.rms, 1)} m rms`, `${tr("gu-t3", "your pseudorange residuals")}${r.fixGap != null ? `; ${num(r.fixGap, 1)} m ${tr("gu-t3b", "from the phone's own fix")}` : ""}`, globe],
    ];
    const cols = wide ? 3 : 1, tw = (W - 8 - 8 * cols) / cols, bsz = wide ? 10 : 9.5, th = Math.max(wide ? 52 : 40, ...tiles.filter((t) => t[3]).map((t) => fitBoxHeight({ ...t[3], size: bsz })));   // l'encadré de la sphère (core/fitbox.js)
    tiles.forEach(([big, small, col, box], k) => {
      const x = 8 + (k % cols) * (tw + 8), y = 8 + Math.floor(k / cols) * (th + 6);
      if (box) { drawFitBox(ctx, x, y, { ...box, col, size: bsz, maxW: tw }); return; }
      ctx.fillStyle = "#f3f5f7"; ctx.fillRect(x, y, tw, th);
      label(ctx, big, x + 8, y + 15, { col, font: "600 15px system-ui, sans-serif" });
      wrapLabel(ctx, small, x + 8, y + 30, tw - 12, { col: SOFT, font: FONT, lh: 11 });
    });
    const top = 8 + Math.ceil(tiles.length / cols) * (th + 6) + 14;
    // carte (seulement pour situer)
    const m = wide ? { x0: 8, x1: W * 0.46, y0: top + 6, y1: H - 22 } : { x0: 8, x1: W - 8, y0: top + 6, y1: top + 6 + (W - 16) / 2 };
    const X = (lon) => m.x0 + (lon + 180) / 360 * (m.x1 - m.x0), Y = (lat) => m.y1 - (lat + 90) / 180 * (m.y1 - m.y0);
    ctx.fillStyle = "#eef3f7"; ctx.fillRect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0);
    ctx.strokeStyle = "#c3ccd6"; ctx.lineWidth = 0.7;
    for (const line of coastLines()) {
      ctx.beginPath(); let pen = false;
      for (const q of line) { if (!q) { pen = false; continue; } const x = X(q[1]), y = Y(q[0]); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; }
      ctx.stroke();
    }
    for (const s of S) dot(ctx, X(s.lon), Y(s.lat), 2.6, globe);
    const px = X(r.geo.lon), py = Y(r.geo.lat);
    ctx.strokeStyle = you; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 6, 0, 2 * Math.PI); ctx.stroke(); dot(ctx, px, py, 2.6, you);
    label(ctx, tr("gu-you", "you"), px + 9, py - 7, { col: you, font: "600 10.5px system-ui, sans-serif", halo: true, al: px > m.x1 - 40 ? "right" : "left" });
    // distance à la sphère des stations, selon la latitude
    const p = wide ? { x0: W * 0.46 + 46, x1: W - 12, y0: top + 14, y1: H - 34 } : { x0: 44, x1: W - 12, y0: m.y1 + 30, y1: H - 34 };
    const span = 16, PX = (lat) => p.x0 + (lat + 90) / 180 * (p.x1 - p.x0), PY = (km) => (p.y0 + p.y1) / 2 - km / span * (p.y1 - p.y0) / 2;
    ctx.strokeStyle = "#e3e7ec"; ctx.lineWidth = 1;
    for (const k of [-15, -10, -5, 0, 5, 10, 15]) { ctx.beginPath(); ctx.moveTo(p.x0, PY(k)); ctx.lineTo(p.x1, PY(k)); ctx.stroke(); label(ctx, num(k), p.x0 - 4, PY(k), { al: "right", col: SOFT, font: FONT }); }
    for (const l of [-90, -45, 0, 45, 90]) label(ctx, `${num(l)}°`, PX(l), p.y1 + 11, { al: "center", col: SOFT, font: FONT });
    label(ctx, tr("gr-yk", "distance to the fitted sphere (km)"), p.x0, p.y0 - 8, { col: SOFT, font: FONT });
    label(ctx, tr("gr-xl", "latitude of the station"), p.x1, p.y1 + 24, { al: "right", col: SOFT, font: FONT });
    ctx.strokeStyle = globe; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let l = -90; l <= 90; l += 3) { const y = PY(E.a - E.delta * Math.sin(l * Math.PI / 180) ** 2); l === -90 ? ctx.moveTo(PX(l), y) : ctx.lineTo(PX(l), y); }
    ctx.stroke();
    for (const s of E.stations) dot(ctx, PX(s.lat), PY(s.res), 3, globe);
    const yr = (v.toCentre - v.R) / 1000, yx = PX(geocentricLat(r.x)), yy = PY(yr);
    ctx.strokeStyle = you; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(yx, yy, 6, 0, 2 * Math.PI); ctx.stroke(); dot(ctx, yx, yy, 2.6, you);
    wrapLabel(ctx, `${tr("gu-you", "you")}: ${num(Math.abs(v.aboveSurface))} m ${v.aboveSurface >= 0 ? tr("gu-above", "above") : tr("gu-below", "below")} ${tr("gu-surf", "the surface the stations draw")}`, yx < (p.x0 + p.x1) / 2 ? yx + 10 : yx - 10, yy - 22, (p.x1 - p.x0) * 0.5, { al: yx < (p.x0 + p.x1) / 2 ? "left" : "right", col: you, font: "600 10.5px system-ui, sans-serif", lh: 12, bl: "bottom" });
  };

  return { draw };
}
