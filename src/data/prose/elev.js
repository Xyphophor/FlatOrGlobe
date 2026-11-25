// Prose de l'onglet sim, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\"> <div class=\"figsym\" id=\"simPairFig\"></div> <div class=\"fcap\"><b>The same observer, the same target, one assumption changed.</b> One eye height, one ground distance, one target height, in both. The dashed line is eye level and α is the elevation angle, drawn at the same radius in both panels so the two can be compared by looking.</div> </div>",
  "k": "x:sim-pair"
 },
 {
  "t": "section",
  "id": "sim-01",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">01</span><h2>Inputs</h2><span class=\"rule\"></span></div>"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "preset-row",
    "id": "",
    "html": "<div class=\"preset-row\"> <span class=\"preset-lbl\">Examples</span> <select id=\"presetSel\" aria-label=\"Worked examples\"></select> <span class=\"preset-note\" id=\"presetNote\"></span> </div>"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "why",
    "id": "whyBox",
    "html": "<div class=\"why\" id=\"whyBox\" hidden> <div class=\"why-h\"><span class=\"why-tag\">Why this case decides it</span><span id=\"whyTitle\"></span></div> <div class=\"why-body\" id=\"whyBody\"></div> <div class=\"why-num\" id=\"whyNum\"></div> </div>",
    "k": "x:why-tag"
   },
   {
    "t": "raw",
    "tag": "form",
    "class": "",
    "id": "form",
    "html": "<form id=\"form\"> <fieldset class=\"obj1\"> <legend><span class=\"dot\" style=\"background:var(--obj1)\"></span>Target ①<span class=\"objname\" id=\"objName1\"></span></legend> <div class=\"two\"> <div class=\"field\"><label>Distance <span class=\"unit\">(km)</span></label> <input type=\"number\" id=\"d1\" value=\"17.8\" min=\"0.001\" step=\"0.1\"></div> <div class=\"field\"><label>Height <span class=\"unit\">(m)</span></label> <input type=\"number\" id=\"h1\" value=\"1400\" min=\"0\" step=\"10\"></div> <div class=\"field\" style=\"grid-column:1/-1\"><label>Azimuth offset <span class=\"unit\">(° from view centre)</span></label> <input type=\"number\" id=\"az1\" value=\"0\" step=\"0.1\"></div> </div> </fieldset> <fieldset class=\"obj2\"> <legend><span class=\"dot\" style=\"background:var(--obj2)\"></span>Target ②<span class=\"objname\" id=\"objName2\"></span></legend> <div class=\"two\"> <div class=\"field\"><label>Distance <span class=\"unit\">(km)</span></label> <input type=\"number\" id=\"d2\" value=\"60.2\" min=\"0.001\" step=\"0.1\"></div> <div class=\"field\"><label>Height <span class=\"unit\">(m)</span></label> <input type=\"number\" id=\"h2\" value=\"1560\" min=\"0\" step=\"10\"></div> <div class=\"field\" style=\"grid-column:1/-1\"><label>Azimuth offset <span class=\"unit\">(° from view centre)</span></label> <input type=\"number\" id=\"az2\" value=\"2\" step=\"0.1\"></div> </div> </fieldset> <fieldset class=\"obj3\"> <legend><span class=\"dot\" style=\"background:var(--obj3)\"></span>Target ③<span class=\"objname\" id=\"objName3\"></span> <label class=\"chk\" style=\"margin-left:6px\"><input type=\"checkbox\" id=\"o3on\" checked> enabled</label></legend> <div class=\"two\" id=\"o3fields\"> <div class=\"field\"><label>Distance <span class=\"unit\">(km)</span></label> <input type=\"number\" id=\"d3\" value=\"22.8\" min=\"0.001\" step=\"0.1\"></div> <div class=\"field\"><label>Height <span class=\"unit\">(m)</span></label> <input type=\"number\" id=\"h3\" value=\"1530\" min=\"0\" step=\"10\"></div> <div class=\"field\" style=\"grid-column:1/-1\"><label>Azimuth offset <span class=\"unit\">(° from view centre)</span></label> <input type=\"number\" id=\"az3\" value=\"3.5\" step=\"0.1\"></div> </div> </fieldset> <fieldset class=\"world\"> <legend>Observer &amp; world</legend><span class=\"objname\" id=\"obsName\" style=\"display:block;margin:-4px 0 8px\"></span> <div class=\"two\"> <div class=\"field\"> <label>Observer eye height <span class=\"unit\">(m)</span></label> <input type=\"number\" id=\"eye\" value=\"1395\" min=\"0\" step=\"1\"> </div> <div class=\"field\"> <label>Earth radius <span class=\"unit\">(km)</span></label> <input type=\"number\" id=\"radius\" value=\"6371\" min=\"1\" step=\"1\"> </div> </div> </fieldset> <fieldset class=\"atmos\"> <legend>Atmosphere</legend> <div class=\"view-inner\"> <label class=\"chk\"><input type=\"checkbox\" id=\"refr\"> Include atmospheric refraction</label> <input type=\"range\" id=\"kcoef\" min=\"0\" max=\"0.3\" value=\"0.13\" step=\"0.01\" disabled> <span class=\"exagg-read\" id=\"kRead\">k = 0.13 · R_eff = 1.15 × R</span> </div> <div class=\"exagg-note\" id=\"refrHint\" style=\"color:var(--ink-soft)\">Standard terrestrial value k ≈ 0.13; the surveyor's “7/6 earth” rule is k ≈ 0.143. Refraction bends light down toward the surface, lifting distant targets and reducing the dip. Modeled with an effective radius R_eff = R / (1 − k); applies to the globe only.<a class=\"xref\" data-xref=\"ref\"></a></div> </fieldset> <fieldset class=\"view\"> <legend>Drawing scale</legend> <div class=\"view-inner\"> <label for=\"exagg\" style=\"font-size:12px;color:var(--ink-soft)\">Vertical exaggeration</label> <input type=\"range\" id=\"exagg\" min=\"1\" max=\"60\" value=\"1\" step=\"1\"> <span class=\"exagg-read\" id=\"exaggRead\">1× (true scale)</span> </div> <div class=\"exagg-note\" id=\"exaggNote\"></div> </fieldset> </form>",
    "k": "x:665aaaf5"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "err",
    "id": "err",
    "html": "<div class=\"err\" id=\"err\"></div>"
   }
  ]
 },
 {
  "t": "section",
  "id": "sim-02",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">02</span><h2>Orthographic side view</h2><span class=\"rule\"></span></div>",
    "k": "x:1454b0d5"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "panel flat",
    "id": "",
    "html": "<div class=\"panel flat\"> <div class=\"cap\"> <div class=\"name\"><span class=\"tag\">Model A</span>Flat plane</div> <div class=\"meta\" id=\"metaFlat\"></div> </div> <div class=\"reads\" id=\"readFlat\"></div> <canvas id=\"flatCanvas\"></canvas> </div>"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "panel globe",
    "id": "",
    "html": "<div class=\"panel globe\"> <div class=\"cap\"> <div class=\"name\"><span class=\"tag\">Model B</span>Globe</div> <div class=\"meta\" id=\"metaGlobe\"></div> </div> <div class=\"reads\" id=\"readGlobe\"></div> <canvas id=\"globeCanvas\"></canvas> </div>"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "panel globe",
    "id": "",
    "html": "<div class=\"panel globe\" style=\"margin-top:16px\"> <div class=\"cap\"> <div class=\"name\"><span class=\"tag\" style=\"background:#eee9f9;color:var(--obj3)\">View</span><span id=\"perspName\">Observer's perspective — solid = globe, dashed = flat</span></div> <button type=\"button\" class=\"swapbtn\" id=\"perspSwap\">⇄ swap solid model</button> <div class=\"meta\" id=\"metaPersp\"></div> </div> <div class=\"reads\" id=\"readPersp\"></div> <canvas id=\"perspCanvas\"></canvas> <p class=\"horizon-note\" id=\"perspNote\" style=\"margin:0;padding:8px 12px 0\"></p> <div class=\"persp-zoom\"> <label for=\"pzoom\">Vertical zoom</label> <input type=\"range\" id=\"pzoom\" min=\"1\" max=\"25\" step=\"1\" value=\"1\"> <span class=\"exagg-read\" id=\"pzoomRead\">1× (equal scale)</span> </div> </div>",
    "k": "x:674ff8f4"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig elev-land\"><div class=\"preset-row elev-land-models\" role=\"group\" aria-label=\"Model\"><button type=\"button\" class=\"presetbtn\" id=\"elevLandGlobeK\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevLandGlobe\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevLandFlat\"></button><label class=\"elev-land-op\"><span id=\"elevLandOpLbl\"></span> <input type=\"range\" id=\"elevLandOpacity\" min=\"0\" max=\"100\" value=\"50\"></label></div><canvas id=\"elevLand\"></canvas><div class=\"reads\" id=\"elevLandReads\"></div><div class=\"elev-land-photo\" id=\"elevLandPhoto\"><p><b>The photograph from the Sommet de Viériou</b><br>It will sit here, at the same width and framing as the view above, so that each summit can be compared straight down.</p></div></div>"
   },
   {
    "t": "fcap",
    "html": "<b>The landscape from the Sommet de Viériou, drawn from the IGN's LiDAR HD.</b> Each band of colour is the highest ridge within one range of distance, 0.5 to 120 km, pale far off and dark close by, never above the skyline computed to the metre. The Castellaras<sup class=\"ref\"><a href=\"#s-elev-n4\">[4]</a></sup> and the Cime de Barbin sit at the angles each model gives them<sup class=\"ref\"><a href=\"#s-elev-n3\">[3]</a></sup>; switch the model and the whole landscape moves. <a href=\"https://x.com/Xyphophor\" target=\"_blank\" rel=\"noopener\">Xyphophor</a>'s photograph fades in and out. It was aligned by computation, not by hand: centre azimuth and scale from a search against the LiDAR skyline, height — the camera's unrecorded tilt — set for each model at its most favourable value; the residuals are printed below. The landscape is decor; the test is the named summits.",
    "k": "elev-land-cap"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig elev-land\"><div class=\"preset-row elev-land-models\" role=\"group\" aria-label=\"Model\"><button type=\"button\" class=\"presetbtn\" id=\"elevArgGlobeK\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevArgGlobe\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevArgFlat\"></button><label class=\"elev-land-op\"><span id=\"elevArgOpLbl\"></span> <input type=\"range\" id=\"elevArgOpacity\" min=\"0\" max=\"100\" value=\"50\"></label></div><canvas id=\"elevArg\"></canvas><div class=\"reads\" id=\"elevArgReads\"></div><div class=\"elev-land-photo\" id=\"elevArgPhoto\"><p></p></div></div>"
   },
   {
    "t": "fcap",
    "html": "<b><a href=\"https://x.com/Xyphophor\" target=\"_blank\" rel=\"noopener\">Xyphophor</a>'s viewpoint: the Argentera beside the Riourun.</b> From a roadside at 105 m (43.62258° N, 7.07217° E), a camera aimed at 17.6° sees the Argentera, highest summit of the Maritime Alps<sup class=\"ref\"><a href=\"#s-elev-n10\">[10]</a></sup>, 64 km away in Italy, just left of the Riourun, 17 km away. The photograph (Nikon P900, 800 mm equivalent) takes its scale from the camera's focal length, the same for every model. Its azimuth is anchored on the Argentera's summit, which every model puts at the same bearing. Tilt and height are then fitted for each model, in its favour. Its skyline matches the globe's to <b>0.65′</b> and the plane's to <b>4.1′</b>. It also settles the order of the two summits: the Riourun stands <b>3.2′ above</b> the Argentera (tilt removed). The globe predicts +1.3′ to +5.7′; the plane <b>−7.2′ to −9.9′</b> — the Argentera on top, and a row of Alps above the ridge that the photograph does not show. On the Italian side the terrain is the IGN's RGE ALTI, not the LiDAR: 3,246 m at the summit against 3,297 m published; the ranges above include that gap. The eye, 1.7 m above the ground, is assumed. The viewpoint is known to a few tens of metres: that moves the summits sideways in the view, hardly up or down.",
    "k": "elev-arg-cap"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig elev-land\"><div class=\"preset-row elev-land-models\" role=\"group\" aria-label=\"Model\"><button type=\"button\" class=\"presetbtn\" id=\"elevSchneeGlobeK\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevSchneeGlobe\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevSchneeFlat\"></button></div><canvas id=\"elevSchnee\"></canvas><div class=\"reads\" id=\"elevSchneeReads\"></div><div class=\"elev-land-photo\" id=\"elevSchneePhoto\"><p></p></div></div>"
   },
   {
    "t": "fcap",
    "html": "<b><a href=\"https://x.com/deprojected\" target=\"_blank\" rel=\"noopener\">deprojected</a>'s viewpoint in Vienna: the Schneeberg behind the Anninger.</b> From 164 m in Vienna (48.211995° N, 16.48885° E, as given by deprojected), the Schneeberg, highest summit of Lower Austria<sup class=\"ref\"><a href=\"#s-elev-n11\">[11]</a></sup>, 71 km away, rises behind the wooded ridge of the Anninger, 26 km away. The terrain is the Austrian BEV's 1 m laser-scan model<sup class=\"ref\"><a href=\"#s-elev-n12\">[12]</a></sup>, read the same way as the IGN's LiDAR in France. A plane puts the Schneeberg <b>27′</b> above the ridge in front of it; a globe <b>16′</b> (15′ with straight rays). A plane also lifts the Alps beyond 75 km above that ridge, where a globe hides them. The photograph, used with deprojected's permission, was fitted to this skyline by computation, anchored on the summit, each model given its own best scale, tilt and height: the dark ridge then falls <b>1′ to 2.5′</b> from the globe and <b>13′</b> from the plane, which would put it below the bottom of the frame. deprojected's measured bearing, 248.7°, is supported neither by the coordinates he gave nor by the photograph: both give 226°. The ground model has no trees: the forest on the ridge lifts it by up to about 3′.",
    "k": "elev-schnee-cap"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig elev-land\"><div class=\"preset-row elev-land-models\" role=\"group\" aria-label=\"Model\"><button type=\"button\" class=\"presetbtn\" id=\"elevCausGlobeK\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevCausGlobe\"></button><button type=\"button\" class=\"presetbtn\" id=\"elevCausFlat\"></button><label class=\"elev-land-op\"><span id=\"elevCausOpLbl\"></span> <input type=\"range\" id=\"elevCausOpacity\" min=\"0\" max=\"100\" value=\"50\"></label></div><canvas id=\"elevCaus\"></canvas><div class=\"reads\" id=\"elevCausReads\"></div><div class=\"elev-land-photo\" id=\"elevCausPhoto\"><p></p></div></div>"
   },
   {
    "t": "fcap",
    "html": "<b>The plateau de Caussols: Mont Agel over the sea horizon.</b> From 1,210 m (43.72218° N, 6.93849° E), looking east over the Riviera: Mont Agel<sup class=\"ref\"><a href=\"#s-elev-n13\">[13]</a></sup>, 39 km away and 77 m lower than the eye (1,133 m in the terrain model, 1,148 m published: the IGN's LiDAR has no data on the summit, a military site, and the models that fill the gap differ; <a class=\"xref\" href=\"#tab-phys/phys-h2dem\" data-xref=\"phys\" data-sec=\"phys-h2dem\">Basics</a>), Monte Ceppo, 70 km away in Italy, and Cap Corse, 222 km out to sea. The terrain is the IGN's LiDAR HD to 45 km and the Copernicus 30 m model beyond<sup class=\"ref\"><a href=\"#s-elev-n14\">[14]</a></sup>, a surface model with forests and buildings included. The test is the sea horizon. On a globe it lies <b>62′ below</b> eye level at this height, with standard refraction, and Mont Agel stands <b>47′ above</b> it. On a plane the sea rises towards eye level with distance, so anything lower than the eye must sit below the horizon: Mont Agel <b>7′ below</b> it. <a href=\"https://x.com/Xyphophor\" target=\"_blank\" rel=\"noopener\">Xyphophor</a>'s photograph from this point shows Mont Agel above the sea horizon. Fitted with the camera's own focal length on the near summits alone, it puts the sea horizon within 0.1° of the globe's and about 45′ below the plane's, and Mont Agel 42′ above that horizon (globe 47′, plane 7′ below). Cap Corse would sit on the horizon of a plane and stands 12′ above the globe's.",
    "k": "elev-caus-cap"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig\"><div class=\"figsym\" id=\"sim-figSil\"></div> <div class=\"fcap\">The sightline as a silhouette, swept off the IGN's LiDAR HD terrain (about 1 m), not drawn: one terrain read, two models, 6.2° of azimuth centred on the Castellaras. <b>True angular scale on both axes, no exaggeration</b> — 372′ wide against 52′ of relief, so the panorama is a low band, as a photograph from the summit shows it. The filled outline is the globe at k = 0.13; the dashed line is the same terrain with the curvature taken out. <b>Read the Cime de Barbin, at 60 km:</b> a plane puts it at <b>+9.5′, above eye level</b>; a globe at <b>−4.6′, below it</b> — fourteen arcminutes and a change of sign. Its prominence over the dips beside it (about 16′) is the same in both models, because those dips are distant too: the test is height above the horizontal, not above a neighbour. The terrain model reads the three summits within 1.5 m of their published heights (Viériou 1,394.9 m, Castellaras 1,400.3 m, Barbin 1,560.0 m).</div> </div>",
    "k": "elev-m1"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "legend-chips",
    "id": "",
    "html": "<div class=\"legend-chips\"> <span class=\"chip\"><span class=\"swatch\" style=\"border-color:var(--ground)\"></span>ground</span> <span class=\"chip\"><span class=\"swatch\" style=\"border-color:#9aa1ab;border-top-style:dashed\"></span>eye level (0°)</span> <span class=\"chip\"><span class=\"swatch\" style=\"border-color:var(--obj1)\"></span>target ①<span class=\"objname\" id=\"chipName1\"></span> &amp; sightline</span> <span class=\"chip\"><span class=\"swatch\" style=\"border-color:var(--obj2)\"></span>target ②<span class=\"objname\" id=\"chipName2\"></span> &amp; sightline</span> <span class=\"chip\" id=\"chip3\"><span class=\"swatch\" style=\"border-color:var(--obj3)\"></span>target ③<span class=\"objname\" id=\"chipName3\"></span> &amp; sightline</span> </div>"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig flatten-fig\"><canvas id=\"simFlatten\" style=\"height:340px\"></canvas><div class=\"reads\" id=\"simFlattenReads\"></div></div>"
   },
   {
    "t": "fcap",
    "html": "<b>Flatten the Earth, and watch the two summits swap.</b> From the Sommet de Viériou (1,395 m)<sup class=\"ref\"><a href=\"#s-elev-n3\">[3]</a></sup>, the Castellaras (17.7 km, 1,400 m)<sup class=\"ref\"><a href=\"#s-elev-n4\">[4]</a></sup> and the Cime de Barbin (60.0 km, 1,561 m) stand almost in line. On the globe the far Barbin sits <b>2.8′ below</b> the Castellaras with straight rays (1.4′ with standard refraction, k = 0.13); on a plane it rides <b>8.5′ above</b>. The two tops are level at <b>75 %</b> of the real curvature, a sphere of about 8,500 km radius: the sign flip needs no plane, only an Earth a third larger. True angles in the eye view; only the spacing of the peaks is schematic.",
    "k": "sim-flatten-cap"
   }
  ]
 },
 {
  "t": "section",
  "id": "sim-03",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">03</span><h2>Predicted elevation angles</h2><span class=\"rule\"></span></div>",
    "k": "x:8bfb0205"
   },
   {
    "t": "table",
    "id": "",
    "tbody": "results",
    "caption": "Angle of the line of sight above the observer's eye‑level (positive = above, negative = below)",
    "head": [
     "Target",
     "Distance",
     "Height",
     "Flat plane",
     "Globe",
     "Difference",
     "On the globe"
    ],
    "k": "x:8a106605"
   },
   {
    "t": "raw",
    "tag": "p",
    "class": "horizon-note",
    "id": "horizonNote",
    "html": "<p class=\"horizon-note\" id=\"horizonNote\"></p>"
   }
  ]
 },
 {
  "t": "section",
  "id": "sim-04",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">04</span><h2>Reverse-engineering the furthest target from two angles</h2><span class=\"rule\"></span></div>",
    "k": "x:0abc54fe"
   },
   {
    "t": "notes",
    "html": "A classic surveyor's trick — the “inaccessible height” — recovers an object's height from two elevation angles taken a known distance apart, without ever reaching it. The reconstruction places the observer and a second station at the distance of the <em>nearest</em> example object (both close to eye height, which is why the nearest summit being about as high as the observer matters). Then the angles the <b id=\"reTarget\">furthest target</b> <em>actually</em> produces are fed back in, and it is reconstructed two ways.",
    "k": "3df75290"
   },
   {
    "t": "formula",
    "flat": false,
    "style": "border-left-color:var(--obj2)",
    "lines": [
     {
      "tex": null,
      "fallback": "Tangent: <span class=\"tex\" data-tex=\"H = \\frac{b}{\\cot\\alpha_{\\text{far}} - \\cot\\alpha_{\\text{near}}}\">H = b / (cot α_far − cot α_near)</span>"
     },
     {
      "tex": null,
      "fallback": "Law of sines: intersect the two real sightlines in the triangle O–N–T"
     }
    ],
    "fig": "simfig1",
    "gloss": "b = baseline (nearest object's distance), α_far and α_near the elevation angles to the furthest summit from the two stations. The <b>tangent</b> method assumes the two “level” lines are parallel — flat‑Earth trigonometry. The <b>law‑of‑sines</b> method solves the real triangle of observer O, near station N and target T, allowing for the fact that “level” tilts by b/R between the stations. On a plane the two are the same formula; on a globe they part ways.",
    "k": "x:ead003b1"
   },
   {
    "t": "h2",
    "html": "Diagram: what each method assumes",
    "k": "3e969c47"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig\" id=\"simFramesFig\" style=\"margin:10px 0 4px\">\n      <svg viewBox=\"0 0 900 300\" role=\"img\" aria-label=\"Tangent method, law of sines on a plane, and law of sines on a globe\">\n        \n        <text x=\"16\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\">A · TANGENT METHOD (assumes flat)</text>\n        <line x1=\"16\" y1=\"222\" x2=\"282\" y2=\"222\" stroke=\"#7a6a4f\" stroke-width=\"2\"/>\n        \n        <line x1=\"40\" y1=\"180\" x2=\"282\" y2=\"180\" stroke=\"#9aa1ab\" stroke-width=\"1.2\" stroke-dasharray=\"5 4\"/>\n        <line x1=\"150\" y1=\"180\" x2=\"282\" y2=\"180\" stroke=\"#9aa1ab\" stroke-width=\"1.2\" stroke-dasharray=\"5 4\"/>\n        <text x=\"196\" y=\"174\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#7d848f\">level lines stay parallel</text>\n        \n        <line x1=\"40\" y1=\"180\" x2=\"250\" y2=\"96\" stroke=\"#1d4ed8\" stroke-width=\"1.8\"/>\n        <line x1=\"150\" y1=\"180\" x2=\"250\" y2=\"96\" stroke=\"#0f766e\" stroke-width=\"1.8\"/>\n        \n        <line x1=\"250\" y1=\"96\" x2=\"250\" y2=\"222\" stroke=\"#151a21\" stroke-width=\"2\"/>\n        <circle cx=\"250\" cy=\"96\" r=\"4\" fill=\"#151a21\"/>\n        \n        <circle cx=\"40\" cy=\"180\" r=\"4\" fill=\"#1d4ed8\"/><circle cx=\"150\" cy=\"180\" r=\"4\" fill=\"#0f766e\"/>\n        <text data-tex=\"O\" x=\"26\" y=\"198\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#1d4ed8\">O</text>\n        <text data-tex=\"N\" x=\"146\" y=\"198\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#0f766e\">N</text>\n        \n        <path d=\"M68 180 A28 28 0 0 0 66.5 169\" fill=\"none\" stroke=\"#1d4ed8\" stroke-width=\"1.4\"/>\n        <text data-tex=\"\\alpha_{\\text{far}}\" x=\"74\" y=\"170\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#1d4ed8\">α_far</text>\n        <path d=\"M178 180 A28 28 0 0 0 174 166\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.4\"/>\n        <text data-tex=\"\\alpha_{\\text{near}}\" x=\"186\" y=\"168\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#0f766e\">α_near</text>\n        \n        <line x1=\"40\" y1=\"236\" x2=\"150\" y2=\"236\" stroke=\"#b45309\" stroke-width=\"1.6\"/>\n        <line x1=\"40\" y1=\"231\" x2=\"40\" y2=\"241\" stroke=\"#b45309\" stroke-width=\"1.6\"/>\n        <line x1=\"150\" y1=\"231\" x2=\"150\" y2=\"241\" stroke=\"#b45309\" stroke-width=\"1.6\"/>\n        <text data-tex=\"b\" x=\"95\" y=\"252\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\" text-anchor=\"middle\">b</text>\n        <text data-tex=\"H\" x=\"256\" y=\"150\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#151a21\">H</text>\n        <text x=\"16\" y=\"278\" font-family=\"ui-sans-serif,system-ui\" font-size=\"11\" fill=\"#5b6470\">Two right triangles share H.</text>\n        <text data-tex=\"H = b/(\\cot\\alpha_{\\text{far}} - \\cot\\alpha_{\\text{near}})\" x=\"16\" y=\"292\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\">H = b / (cot α_far − cot α_near)</text>\n\n        \n        <text x=\"316\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#0f766e\">B · LAW OF SINES (same flat case)</text>\n        <line x1=\"316\" y1=\"222\" x2=\"582\" y2=\"222\" stroke=\"#7a6a4f\" stroke-width=\"2\"/>\n        \n        <line x1=\"340\" y1=\"180\" x2=\"550\" y2=\"96\" stroke=\"#1d4ed8\" stroke-width=\"1.8\"/>\n        <line x1=\"450\" y1=\"180\" x2=\"550\" y2=\"96\" stroke=\"#0f766e\" stroke-width=\"1.8\"/>\n        <line x1=\"340\" y1=\"180\" x2=\"450\" y2=\"180\" stroke=\"#b45309\" stroke-width=\"2.4\"/>\n        <circle cx=\"340\" cy=\"180\" r=\"4\" fill=\"#1d4ed8\"/><circle cx=\"450\" cy=\"180\" r=\"4\" fill=\"#0f766e\"/>\n        <circle cx=\"550\" cy=\"96\" r=\"4\" fill=\"#151a21\"/>\n        <text data-tex=\"O\" x=\"326\" y=\"198\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#1d4ed8\">O</text>\n        <text data-tex=\"N\" x=\"446\" y=\"198\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#0f766e\">N</text>\n        <text data-tex=\"T\" x=\"558\" y=\"92\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#151a21\">T</text>\n        <text data-tex=\"b\" x=\"392\" y=\"196\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\">b</text>\n        <text data-tex=\"a\" x=\"512\" y=\"128\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#0f766e\">a</text>\n        <path d=\"M368 180 A28 28 0 0 0 366 169\" fill=\"none\" stroke=\"#1d4ed8\" stroke-width=\"1.4\"/>\n        <path d=\"M424 180 A26 26 0 0 0 428 166\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.4\"/>\n        <text x=\"316\" y=\"278\" font-family=\"ui-sans-serif,system-ui\" font-size=\"11\" fill=\"#5b6470\">Same triangle, solved by ratios.</text>\n        <text data-tex=\"a/\\sin\\alpha_{\\text{far}} = b/\\sin(\\alpha_{\\text{near}} - \\alpha_{\\text{far}})\" x=\"316\" y=\"292\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#0f766e\">a / sin α_far = b / sin(α_near − α_far)</text>\n\n        \n        <text x=\"616\" y=\"20\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b91c1c\">C · ON A GLOBE — SAME TRIANGLE</text>\n        <path d=\"M612 268 A320 320 0 0 1 892 244\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"2\"/>\n        \n        <line x1=\"668\" y1=\"258\" x2=\"655\" y2=\"176\" stroke=\"#1d4ed8\" stroke-width=\"1\" stroke-dasharray=\"3 3\" opacity=\".55\"/>\n        <line x1=\"770\" y1=\"250\" x2=\"774\" y2=\"168\" stroke=\"#0f766e\" stroke-width=\"1\" stroke-dasharray=\"3 3\" opacity=\".55\"/>\n        \n        <line x1=\"640\" y1=\"264\" x2=\"742\" y2=\"243\" stroke=\"#9aa1ab\" stroke-width=\"1.3\" stroke-dasharray=\"5 4\"/>\n        <line x1=\"752\" y1=\"256\" x2=\"868\" y2=\"248\" stroke=\"#9aa1ab\" stroke-width=\"1.3\" stroke-dasharray=\"5 4\"/>\n        \n        <line x1=\"668\" y1=\"258\" x2=\"860\" y2=\"150\" stroke=\"#1d4ed8\" stroke-width=\"1.8\"/>\n        <line x1=\"770\" y1=\"250\" x2=\"860\" y2=\"150\" stroke=\"#0f766e\" stroke-width=\"1.8\"/>\n        <line x1=\"668\" y1=\"258\" x2=\"770\" y2=\"250\" stroke=\"#b45309\" stroke-width=\"2.4\"/>\n        <circle cx=\"668\" cy=\"258\" r=\"4\" fill=\"#1d4ed8\"/><circle cx=\"770\" cy=\"250\" r=\"4\" fill=\"#0f766e\"/>\n        <circle cx=\"860\" cy=\"150\" r=\"4\" fill=\"#151a21\"/>\n        <text data-tex=\"O\" x=\"656\" y=\"276\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#1d4ed8\">O</text>\n        <text data-tex=\"N\" x=\"764\" y=\"270\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#0f766e\">N</text>\n        <text data-tex=\"T\" x=\"866\" y=\"146\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#151a21\">T</text>\n        <text data-tex=\"b\" x=\"712\" y=\"240\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#b45309\">b</text>\n        \n        <path d=\"M742 243 L742 214\" stroke=\"#b91c1c\" stroke-width=\"1\" stroke-dasharray=\"2 2\"/>\n        <text x=\"700\" y=\"208\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#b91c1c\">the two “level” lines</text>\n        <text data-tex=\"\\text{differ by }b/R\" x=\"700\" y=\"197\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#b91c1c\">differ by b/R</text>\n        <text data-tex=\"\\text{same }a/\\sin\\alpha_{\\text{far}} = b/\\sin(\\alpha_{\\text{near}} - \\alpha_{\\text{far}})\" x=\"616\" y=\"292\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#0f766e\">same a / sin α_far = b / sin(α_near − α_far)</text>\n        <text x=\"616\" y=\"278\" font-family=\"ui-sans-serif,system-ui\" font-size=\"11\" fill=\"#5b6470\">Triangle unchanged; only α_near is re-referenced.</text>\n      </svg>\n      <div class=\"fcap\"><b>Panels B and C: the same triangle, two reference frames.</b>\n        The three points O, N and T are the same in both; what differs is the direction each angle is measured\n        from.</div>\n    </div>",
    "k": "x:bbba0285"
   },
   {
    "t": "notes",
    "html": "Does the globe need a different formula? Not a different <em>theorem</em> — only a different reference frame. The sine rule is a statement about <em>triangles</em>, not about flat ground: any three points define a plane, and O, N and T are three points, so <code>a / sin α_far = b / sin(α_near − α_far)</code> is equally valid in panel B and panel C. What curvature changes is where each angle is measured from — the local horizontal at N is rotated from the one at O by the arc <code>b/R</code>, here about 9′ (0.15°).",
    "k": "sim-p-frame"
   },
   {
    "t": "notes",
    "html": "So the globe procedure is: re-reference the second angle by that rotation, solve the ordinary triangle, then convert the resulting point back to a distance from the Earth's centre. The tangent method cannot do step one at all — parallel levels are baked into <code>cot</code>, so it has nowhere to put the <code>b/R</code> term. That missing rotation <em>is</em> the curvature, and the tables below measure what it costs.",
    "k": "sim-p-frame2"
   },
   {
    "t": "h2",
    "html": "<span>Result 1 — elevation angle of the furthest target</span><span class=\"objname\" id=\"reName1\"></span>",
    "k": "x:2c10dc42"
   },
   {
    "t": "table",
    "id": "",
    "tbody": "reAngRows",
    "caption": "The angle the two stations actually read, versus what each model predicts",
    "head": [
     "Quantity",
     "Value",
     "Agrees with"
    ],
    "k": "x:26066b02"
   },
   {
    "t": "h2",
    "html": "Result 2 — reconstructed elevation (height above sea level)",
    "k": "bb6b4bd0"
   },
   {
    "t": "table",
    "id": "",
    "tbody": "reHtRows",
    "caption": "Both methods fed the same measured angles; only one returns the true height",
    "head": [
     "Method",
     "Recovered height",
     "Error vs true",
     "Implied distance",
     "Verdict"
    ],
    "k": "x:26a9c154"
   },
   {
    "t": "h2",
    "html": "Result 3 — what the flat surveyor actually concludes",
    "k": "2f1430f7"
   },
   {
    "t": "notes",
    "html": "This is the decisive number. The frame rotation <code>b/R</code> is not a small refinement here — it is <em>larger than the whole angular difference being measured</em>. Drop it and you don't get a slightly wrong answer; you get an answer that can be falsified by driving to the spot.",
    "k": "6365774d"
   },
   {
    "t": "table",
    "id": "",
    "tbody": "reFlatRows",
    "caption": "The reference rotation compared with the signal it corrects",
    "head": [
     "Quantity",
     "Value",
     "Meaning"
    ],
    "k": "x:44f6af69"
   },
   {
    "t": "raw",
    "tag": "p",
    "class": "horizon-note",
    "id": "reFlatNote",
    "html": "<p class=\"horizon-note\" id=\"reFlatNote\"></p>"
   },
   {
    "t": "raw",
    "tag": "p",
    "class": "horizon-note",
    "id": "reNote",
    "html": "<p class=\"horizon-note\" id=\"reNote\"></p>"
   },
   {
    "t": "notes",
    "html": "<b>A caveat worth stating.</b> With both stations at the same eye height the two sightlines are nearly parallel, so this particular baseline is a poorly‑conditioned way to pin down a height — small angle errors move the intersection a long way. That is a limitation of the <em>configuration</em>, not of the geometry: the reconstruction above is computed by intersecting the two true rays in the Earth‑centred frame, which is exact. In real surveying the two stations are deliberately placed at clearly different heights, or the baseline is made long relative to the range, precisely to avoid this. The robust result here is the <b>angle</b> comparison in Result 1, which needs no intersection at all.",
    "k": "a30c866e"
   }
  ]
 },
 {
  "t": "section",
  "id": "sim-05",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">05</span><h2>Measuring an angle on a sphere</h2><span class=\"rule\"></span></div>",
    "k": "x:cb258ad3"
   },
   {
    "t": "notes",
    "html": "A common objection: “angles only mean anything on a flat plane — you can't measure elevation on a ball.” But an angle is measured against a <em>reference direction</em>, and every point on a sphere has one: the direction a bubble level settles into. That local horizontal is the tangent at your feet, and it exists everywhere. Below, two protractors sit on a rotating globe — one at the observer, one on the summit — each with <b>0° along its own tangent</b>. No plane is drawn anywhere.",
    "k": "c1cf72c6"
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "fig",
    "id": "",
    "html": "<div class=\"fig\" style=\"margin:14px 0\"> <button type=\"button\" class=\"swapbtn\" id=\"tanSpinBtn\" style=\"margin:2px 0 8px\">⏸ pause rotation</button> <span class=\"drag-hint\" style=\"margin-left:8px\">· drag to turn it yourself</span> <canvas id=\"tan3d\" style=\"height:440px;cursor:grab;touch-action:none\"></canvas> <div class=\"fcap\"><b>Two instruments, two horizons, one sphere.</b> The blue protractor stands at the observer; its 0° mark lies along the tangent there. The violet protractor stands on the summit with 0° along <em>its</em> tangent. Both are ordinary protractors reading ordinary angles — nothing about the curved ground stops either from working. What the curvature does is tilt the two 0° lines relative to each other, by exactly the central angle between the two locations. The mountain is drawn absurdly large (30% of the planet's radius) so the angles are legible; on the real Earth the same tilt is the tiny <code>b/R</code> term from section 04.</div> </div>",
    "k": "x:929d105c"
   },
   {
    "t": "h2",
    "html": "Reciprocal zenith angles — the parameter-free test",
    "k": "2a51c10f"
   },
   {
    "t": "notes",
    "html": "Point each protractor at the other station and read the <b>zenith angle</b> — the angle down from straight up, which is just 90° minus the elevation. Do it from both ends at once. The sum of those two readings is the single most decisive number in this whole page, because the flat prediction contains <em>no adjustable quantities at all</em>.",
    "k": "7c6a388b"
   },
   {
    "t": "formula",
    "flat": true,
    "style": "border-left-color:var(--flat)",
    "lines": [
     {
      "tex": null,
      "fallback": "Flat: <span class=\"tex\" data-tex=\"z_A + z_B = \\g{180\\deg}\">z<sub>A</sub> + z<sub>B</sub> = <b>180°</b></span> exactly"
     },
     {
      "tex": null,
      "fallback": "Globe: <span class=\"tex\" data-tex=\"z_A + z_B = \\g{180\\deg + d/R}\">z<sub>A</sub> + z<sub>B</sub> = <b>180° + d/R</b></span>"
     }
    ],
    "fig": "simfig2",
    "gloss": "If verticals are parallel, the line joining the two stations is a transversal cutting two parallel lines, so the two zenith angles are co‑interior and <em>must</em> sum to 180° — a theorem of plane geometry, independent of the distance, of either height, and of how much taller one station is than the other. On a sphere the two verticals meet at the centre, forming a triangle whose angles sum to 180°; the central angle d/R appears as an <b>excess</b> over 180°. Measure the excess and you have measured the Earth: <code>R = d / (z_A + z_B − 180°)</code>.",
    "k": "x:d0e59886"
   },
   {
    "t": "table",
    "id": "",
    "tbody": "recipRows",
    "caption": "<span>Reciprocal zenith angles between the observer and the furthest target of the current example</span><span class=\"objname\" id=\"reName2\"></span>",
    "head": [
     "Quantity",
     "Value",
     "What it means"
    ],
    "k": "x:44f6af69~2"
   },
   {
    "t": "raw",
    "tag": "p",
    "class": "horizon-note",
    "id": "recipNote",
    "html": "<p class=\"horizon-note\" id=\"recipNote\"></p>"
   },
   {
    "t": "notes",
    "k": "elev-recip-sp4",
    "html": "<b>Surveyors ran this test on whole networks.</b> Between 1859 and 1895 the US Coast and Geodetic Survey read both zenith angles of 97 lines in Colorado and California, from 12 to 126 km long: every sum is above 180°, by 6′ to 56′, and the excess grows with the length of the line, as d/R does. The lines, and what they give for refraction, are in the <a data-xref=\"ref\" data-sec=\"rf-hsp4\" href=\"#tab-ref/rf-hsp4\">refraction tab</a>."
   },
   {
    "t": "raw",
    "tag": "div",
    "class": "ivdv-key",
    "id": "",
    "html": "<div class=\"ivdv-key\"><b>How to read these experiment boxes.</b> An experiment changes one thing and watches what happens to another. The thing <b>you</b> deliberately change is the <b>independent variable (IV)</b>. The thing you then <b>measure</b>, and do not control, is the <b>dependent variable (DV)</b>. Everything else must be held constant, or you cannot tell what caused what. A model is testable when it predicts a specific DV for each IV — and it is <em>refuted</em> when the measured DV does not match. Both models below make definite predictions, so whichever fails, fails honestly.</div>"
   },
   {
    "t": "exp",
    "h": "Experiment 1 · elevation angles",
    "title": "Two levelled instruments, pointed at each other",
    "lead": "Two people stand where they can see each other. Each levels a theodolite with its bubble and measures the zenith angle to the other — the angle down from straight up. Add the two readings together.",
    "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the distance <b>d</b> between the two stations. Do it at 1 km, then 10 km, then 50 km. You pick these — that is what makes it the IV.",
    "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the sum of the two zenith angles, <b>z_A + z_B</b>. You do not get to choose this — the instruments tell you.",
    "meta": [],
    "inputs": [
     [
      "exp1d",
      "IV — distance between stations <span class=\"unit\">(km)</span>",
      " type=\"number\" id=\"exp1d\" value=\"10\" min=\"0.1\" step=\"1\""
     ]
    ],
    "out": "exp1out",
    "verdict": "exp1v",
    "k": "x:6aeb28a9"
   },
   {
    "t": "notes-block",
    "paras": [
     "<span class=\"k\">Why this one is hard to argue with.</span> Most curvature tests can be met with “your instrument was off” or “that's refraction” or “your height was wrong.” This one cannot be met with a wrong height: the heights <em>cancel</em>. Put a 5 m station and a 3,000 m station 200 km apart and the sum still comes out at 180° + d/R to the last decimal. The flat model does not predict “about 180°” — it predicts 180.000°, always. Any reproducible excess falsifies it, and the size of that excess hands you R."
    ],
    "k": "sim-n1"
   },
   {
    "t": "notes-block",
    "paras": [
     "<span class=\"k\">Refraction, honestly.</span> Bending reduces the excess by roughly the refraction coefficient, so the observed sum is about 180° + (d/R)(1−k). Reading R straight off an uncorrected excess therefore overestimates it by ~15%, exactly as in the dip method. Geodesists have exploited this since the 1800s: because <em>simultaneous</em> reciprocal observations experience nearly the same air, the technique is the standard way to measure k itself — and no value of k brings a curved excess back to zero."
    ],
    "k": "sim-n2"
   },
   {
    "t": "notes-block",
    "paras": [
     "<span class=\"k\">What the demo shows.</span> Rotate it and watch the two 0° tangents: they never become parallel, and their disagreement is the central angle, not an instrument error. This is why a theodolite works perfectly well on a globe — you level it, read an angle against the local horizontal, and get a number. It is also why two such readings taken far apart cannot be combined <em>as if</em> their zeros pointed the same way: that, and only that, is the mistake the flat method makes."
    ],
    "k": "sim-n3"
   }
  ]
 },
 {
  "t": "section",
  "id": "sim-06",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">06</span><h2>Why you subtract the observer's height</h2><span class=\"rule\"></span></div>",
    "k": "x:441f8e10"
   },
   {
    "t": "notes",
    "html": "A frequent objection: “why <em>(h − e)</em> and not just h? You're smuggling in the globe.” No — this step is derived <b>inside the flat model, using its own assumptions</b>. If the Earth is a plane, then every vertical is parallel to every other vertical and the ground is one straight horizontal line. That is exactly what builds a rectangle:",
    "k": "c8eef1d8"
   },
   {
    "t": "notes-block",
    "paras": [
     "<span class=\"k\">Only the difference of the two heights ever enters the flat formula.</span> That is why this page asks for heights above mean sea level for both observer and target: not to sneak in a curve, but because any constant added to both cancels out. The globe formula, by contrast, genuinely needs the absolute heights, because R + h and R + e are radii from the centre."
    ],
    "k": "sim-n4"
   },
   {
    "t": "fold",
    "q": false,
    "k": "elev-fold1",
    "summary": "<b>Where tan α = (h − e)/d comes from</b><span class=\"fold-teaser\">Two lines of right-angle trigonometry, and why the choice of datum drops out of them</span>",
    "html": "<div class=\"notes\" style=\"max-width:74ch\"> <p><span class=\"k\">Read the pair at the top of this tab again and the flat formula is forced, not chosen.</span> The rectangle's far side is e tall, so the part of the target <em>above</em> your eye-level line is (h − e): a right triangle with opposite side (h − e) and adjacent side d, so <code>tan α = (h − e)/d</code>. Using h alone would measure from the observer's <em>feet</em>, not the eye.</p> <p><span class=\"k\">And the reference level cancels.</span> Above sea level, the ellipsoid or the valley floor — it makes no difference if both heights use the <em>same</em> datum: <code>(h + c) − (e + c) = h − e</code>. Only the <em>difference</em> enters the flat calculation. The globe formula genuinely needs absolute heights, because R + h and R + e are radii from the centre.</p> </div>"
   }
  ]
 },
 {
  "t": "section",
  "id": "sim-07",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">07</span><h2>Angular size: nearly identical, and that's the point</h2><span class=\"rule\"></span></div>",
    "k": "x:0077c130"
   },
   {
    "t": "notes",
    "html": "A fair follow‑up: “if the globe changed the geometry, wouldn't mountains look obviously wrong in photos?” No — and the numbers show why. The two models disagree about <em>where</em> a peak sits in your view, but almost not at all about <em>how big</em> it looks.",
    "k": "2a609171"
   },
   {
    "t": "formula",
    "flat": false,
    "style": "border-left-color:var(--obj1)",
    "lines": [
     {
      "tex": null,
      "fallback": "Flat: <span class=\"tex\" data-tex=\"\\beta = \\atan\\left(\\frac{h-e}{d}\\right) + \\atan\\left(\\frac{e}{d}\\right)\">β = atan((h−e)/d) + atan(e/d)</span>"
     },
     {
      "tex": null,
      "fallback": "Globe: <span class=\"tex\" data-tex=\"\\beta = \\operatorname{elev}(\\text{top}) - \\operatorname{elev}(\\text{base})\">β = elev(top) − elev(base)</span>"
     }
    ],
    "fig": "simfig3",
    "gloss": "Angular size β is the angle between the sightline to the base and the sightline to the summit. On the plane it is just the two right‑triangle angles either side of eye level. On the globe both ends are computed with the arctan2 formula and subtracted — the peak leans away from you by θ = d/R, so it is very slightly foreshortened.",
    "k": "x:35ca144c"
   },
   {
    "t": "table",
    "id": "",
    "tbody": "sizeRows",
    "caption": "Apparent size versus apparent position, from the current inputs",
    "head": [
     "Target",
     "Flat size β",
     "Globe size β",
     "Size difference",
     "Position difference"
    ],
    "k": "x:61ad50a9"
   },
   {
    "t": "raw",
    "tag": "p",
    "class": "horizon-note",
    "id": "sizeNote",
    "html": "<p class=\"horizon-note\" id=\"sizeNote\"></p>"
   }
  ]
 },
 {
  "t": "section",
  "id": "sim-08",
  "class": "",
  "blocks": [
   {
    "t": "raw",
    "tag": "div",
    "class": "label-row",
    "id": "",
    "html": "<div class=\"label-row\"><span class=\"n\">08</span><h2>How each number is found</h2><span class=\"rule\"></span></div>",
    "k": "x:8d386956"
   },
   {
    "t": "notes-block",
    "paras": [
     "<span class=\"k\">What is exact, and what is only drawn.</span> The angle numbers are always computed from the true, un‑exaggerated geometry. The vertical‑exaggeration slider stretches the drawing's vertical axis and nothing else; above 1× the drawn slopes no longer match the printed angles, and a warning on the canvas says so.",
     "<span class=\"k\">Refraction here is a representative average, not a constant.</span> <code>k ≈ 0.13</code> is typical daytime air. Real refraction varies with the weather and can even go negative over hot ground, which is a mirage — so the table keeps the un‑refracted figure beside the refracted one, and you can read off exactly how much lift <code>k</code> buys."
    ],
    "k": "sim-n7"
   },
   {
    "t": "fold",
    "q": false,
    "k": "elev-fold2",
    "summary": "<b>How each model computes the angle</b><span class=\"fold-teaser\">Flat plane, globe, and the refracted globe — the three formulas above, written out in words</span>",
    "html": "<div class=\"notes\"> <p><span class=\"k\">Flat plane.</span> The ground is a straight line, so this is right-angle trigonometry: with eye height <code>e</code>, target height <code>h</code> and distance <code>d</code>, the elevation is <code>atan( (h − e) / d )</code>. A target taller than you is always above eye level; the angle shrinks with distance but never dips below 0°.</p> <p><span class=\"k\">Globe.</span> Put the eye at the top of a circle of radius <code>R</code> and the target at arc-distance <code>d</code> (central angle <code>θ = d/R</code>). Against the eye-level line the elevation is <code>atan2( (R+h)·cosθ − (R+e), (R+h)·sinθ )</code>. Curvature, about <code>d² / 2R</code>, pulls every target below the flat answer; far or low targets fall below eye level, and past the horizon distance <code>≈ √(2Re)</code> the base is hidden by the bulge.</p> <p><span class=\"k\">Atmospheric refraction.</span> Denser air near the ground bends light gently downward, so distant targets sit a little higher than geometry says. The surveyor's shortcut keeps rays straight and uses an <em>effective</em> radius <code>R_eff = R / (1 − k)</code>, with <code>k ≈ 0.13</code> in typical daytime air (<code>k ≈ 0.143</code> gives the “7/6 earth” rule). It raises every globe angle toward the flat value and pushes the horizon out.</p> <p><span class=\"k\">Why the picture looks nearly flat.</span> At true scale the drop is a fraction of a percent of the distance, so both panels look almost alike — honestly so. The difference lives in the angles, which a theodolite reads directly.</p> </div>"
   }
  ]
 },
 {
  "t": "xrefs",
  "keys": [
   "ref",
   "hh",
   "dip",
   "surv",
   "obs"
  ],
  "wide": false
 },
 {
  "t": "sources"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "srcs reading",
  "id": "",
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li id=\"s1-r1\"><a href=\"https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf\">Bowditch, <em>The American Practical Navigator</em>, Vol.&nbsp;2 (NGA, 2019; PDF hosted by the US Coast Guard)</a> — the standard reference for sightline geometry over a curved sea: visibility of distant objects, dip and refraction corrections, and the tables navigators actually use.</li> <li id=\"s1-r2\"><a href=\"https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067\">Hirt et al. (2010), <em>J. Geophys. Res.</em> — terrestrial refraction coefficient</a> — the k ≈ 0.13 \"Gaussian\" value used here (Gauss derived it in 1826 from his Hanover survey network), and field measurements showing k varies with weather and can even go negative over hot ground — exactly why this page treats variable-k models as unfalsifiable and keeps k fixed and visible.</li> <li id=\"s1-r3\"><a href=\"https://www.nga.mil/resources/Maritime_Safety_Products_and_Services.html\">NGA Maritime Safety Information</a> — the official, free access point for Bowditch and related publications.</li> <li id=\"s1-r4\"><a href=\"https://comptes-rendus.academie-sciences.fr/physique/item/10.5802/crphys.114.pdf\">L. Dettwiller, <em>Phénomènes de réfraction atmosphérique terrestre</em>, C. R. Physique <b>23</b> (2022) S1, 103–132 (Académie des sciences)</a> — derives the refraction coefficient from the vertical temperature gradient and gives κ ≈ 0.17 for the US 1976 standard atmosphere at sea level, the value this page assumes for sightlines close to a water surface. Also the reference for what happens when κ goes large or negative (mirages, hillingar).</li> <li id=\"s1-r5\"><a href=\"https://comptes-rendus.academie-sciences.fr/physique/articles/10.5802/crphys.110/\">L. Dettwiller, <em>Panorama historique de l'étude de la réfraction astronomique</em>, C. R. Physique <b>23</b> (2022) S1, 13–62</a> — notes the long-run working average of about 0.14 for geodesists, whose observations are typically made from relatively high stations on warm sunny afternoons; used here for the Corsica junction, where no coefficient was published for the observations themselves.</li> <li><b>IGN — Géoportail and the RGE ALTI elevation model.</b> The French national mapping agency's own coordinates and heights for every summit used on this page. The cases here currently rest on Wikipedia for the observer and target heights; the IGN is the authority those articles are quoting, and it is worth going to it directly. Search \"Géoportail\" plus the summit name.</li> <li><a href=\"https://aa.usno.navy.mil/data/index\">U.S. Naval Observatory — Astronomical Applications data services</a>. Rise, set and transit times, and altitude/azimuth for any body from any position. If you want to check an elevation angle in this tab against an independent official calculation rather than against this page's own arithmetic, this is where to do it.</li> <li><b>Marc Bret — <em>Beyond Range</em>.</b> The observer who photographed Pic Gaspard from Pic de Finestrelles in July 2016 at 443 km, then the Pyrenees from the Vosges at 580 km, publishing the predicted panorama beside the photograph each time. First-hand material for the long-distance sightings this tab treats second-hand.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
