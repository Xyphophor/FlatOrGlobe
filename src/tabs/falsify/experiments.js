// Toutes les expériences des onglets, pour l'onglet falsify (2026-11-26) : un module exp.js par onglet
// (src/core/experiments.js en dit le format). Importés statiquement : main.js importe déjà chaque onglet.
import { EXP as elev } from "../elev/exp.js";
import { EXP as hh } from "../hh/exp.js";
import { EXP as cnav } from "../cnav/exp.js";
import { EXP as dip } from "../dip/exp.js";
import { EXP as twi } from "../twi/exp.js";
import { EXP as azim } from "../azim/exp.js";
import { EXP as moon } from "../moon/exp.js";
import { EXP as dist } from "../dist/exp.js";
import { EXP as grav } from "../grav/exp.js";
import { EXP as seis } from "../seis/exp.js";
import { EXP as mag } from "../mag/exp.js";
import { EXP as gps } from "../gps/exp.js";
import { EXP as rot } from "../rot/exp.js";
import { EXP as orb } from "../orb/exp.js";
import { EXP as sun } from "../sun/exp.js";
import { EXP as star } from "../star/exp.js";
import { EXP as fou } from "../fou/exp.js";
import { EXP as ref } from "../ref/exp.js";
import { EXP as surv } from "../surv/exp.js";
import { EXP as obs } from "../obs/exp.js";
import { EXP as ct } from "../ct/exp.js";

export const EXP_ALL = { elev, hh, cnav, dip, twi, azim, moon, dist, grav, seis, mag, gps, rot, orb, sun, star, fou, ref, surv, obs, ct };
