// Registre des cartes autonomes par onglet (epic11). Un onglet sans entrée
// n'a pas de carte : le menu d'export ne la propose pas.
import * as cnav from "./cnav.js";
import * as star from "./star.js";
import * as dist from "./dist.js";
import * as dip from "./dip.js";
import * as grav from "./grav.js";
import * as fou from "./fou.js";
import * as mag from "./mag.js";
import * as sun from "./sun.js";
import * as twi from "./twi.js";
import * as azim from "./azim.js";
import * as ecl from "./ecl.js";
import * as surv from "./surv.js";
import * as ct from "./ct.js";
import * as gps from "./gps.js";
import * as obs from "./obs.js";
import * as seis from "./seis.js";
import * as elev from "./elev.js";
import * as hh from "./hh.js";
import * as ref from "./ref.js";
import * as home from "./home.js";
import * as avia from "./avia.js";
import * as curv from "./curv.js";
import * as rot from "./rot.js";
import * as orb from "./orb.js";
import * as sat from "./sat.js";
import * as scale from "./scale.js";
import * as atmo from "./atmo.js";
import * as map from "./map.js";
import * as contrib from "./contrib.js";
import * as phys from "./phys.js";
import * as aether from "./aether.js";
import * as rocket from "./rocket.js";
import * as cases from "./cases.js";
import * as persp from "./persp.js";
import * as rules from "./rules.js";

export const CARD_TABS = { results: home, elev, hh, ref, cnav, star, dist, dip, grav, fou, seis, mag, sun, twi, azim, ecl, surv, ct, gps, avia, curv, obs, rot, orb, sat, scale, atmo, map, contrib, phys, aether, rocket, cases, persp, rules };
