// Sources de l'onglet contrib (2026-10-08 ; par contribution depuis le 2026-10-15). Chaque contribution liste les
// siennes dans l'ordre de leur premier renvoi (src/tabs/contrib/<clé>/contribution.js) ; ici, le fonds commun à
// plusieurs, et la liste numérotée [n] assemblée pour les contributions publiées (src/tabs/contrib/registry.js).
import { assembleSources } from "../../tabs/contrib/registry.js";

export const SHARED = {
  era5: "H. Hersbach et al., “The ERA5 global reanalysis”, <em>Quarterly Journal of the Royal Meteorological Society</em> 146 (2020) 1999–2049, read through the <a href=\"https://open-meteo.com/en/docs/historical-weather-api\">Open-Meteo historical weather API</a>: 2 m temperature and dew point, 10 m wind, surface pressure.",
  marine: "Open-Meteo, <a href=\"https://open-meteo.com/en/docs/marine-weather-api\">marine weather API</a>: sea surface temperature and significant wave height, hourly.",
  foken: "T. Foken, “50 years of the Monin–Obukhov similarity theory”, <em>Boundary-Layer Meteorology</em> 119 (2006) 431–447: the flux–profile relations (Businger–Dyer) used to build the temperature and humidity profile above the sea.",
  hirt: "C. Hirt, S. Guillaume, A. Wisbar, B. Bürki &amp; H. Sternberg, “Monitoring of the refraction coefficient in the lower atmosphere using a controlled setup of simultaneous reciprocal vertical angle measurements”, <em>Journal of Geophysical Research</em> 115 (2010) D21102: the refraction coefficient from the vertical temperature gradient, and how far it strays from 0.13 near the ground.",
};

export const SOURCES = assembleSources(SHARED);
