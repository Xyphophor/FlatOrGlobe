package lomond

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"flatorglobe/tools/internal/dem"
	"flatorglobe/tools/internal/fetch"
)

// IOCURL is the IOC Sea Level Station Monitoring Facility's data service
// (Leith, 15-minute bubbler readings, metres, UTC).
const IOCURL = "https://www.ioc-sealevelmonitoring.org/service.php?query=data&code=leit&timestart=%s&timestop=%s&format=json"

// Fetch downloads what is missing: the Copernicus GLO-30 tiles of the view
// (CopTiles; a cell without a tile gets an empty .none marker), four weeks
// of the Leith tide gauge around the photograph (leith.json), and the air
// of the photograph's morning at three points along the line of sight
// (weather.json: [{"era5": hourly, "marine": hourly, "gfs": hourly}, ...]).
// refresh re-reads the gauge and the weather.
func Fetch(ctx context.Context, root string, refresh bool, c *fetch.Client, log io.Writer) error {
	if c == nil {
		c = &fetch.Client{}
	}
	for _, t := range CopTiles {
		n := dem.CopName(t[0], t[1])
		dest := filepath.Join(root, CopDir, n+".tif")
		if _, err := os.Stat(dest + ".none"); err == nil {
			continue
		}
		if _, err := c.Get(ctx, dem.CopURL(t[0], t[1]), dest, ""); err != nil {
			var he *fetch.HTTPError
			if errors.As(err, &he) && (he.Status == 403 || he.Status == 404) {
				if err := os.WriteFile(dest+".none", nil, 0o644); err != nil {
					return err
				}
				continue
			}
			return err
		}
	}
	fmt.Fprintf(log, "  Copernicus GLO-30: %d tiles\n", len(CopTiles))

	gauge := filepath.Join(root, RawDir, "leith.json")
	if refresh {
		os.Remove(gauge)
	}
	if _, err := c.Get(ctx, fmt.Sprintf(IOCURL, GaugeFrom, GaugeTo), gauge, ""); err != nil {
		return err
	}
	fmt.Fprintf(log, "  Leith gauge %s .. %s\n", GaugeFrom, GaugeTo)

	dest := filepath.Join(root, RawDir, "weather.json")
	if _, err := os.Stat(dest); err == nil && !refresh {
		return nil
	}
	day := Day
	q := "&start_date=" + day + "&end_date=" + day
	gfs := []string{"temperature_2m", "dew_point_2m", "surface_pressure", "wind_speed_10m"}
	for _, p := range Levels {
		gfs = append(gfs, fmt.Sprintf("temperature_%dhPa", p), fmt.Sprintf("geopotential_height_%dhPa", p))
	}
	var rows []map[string]json.RawMessage
	for _, p := range WeatherPts {
		at := fmt.Sprintf("latitude=%v&longitude=%v", p[0], p[1])
		row := map[string]json.RawMessage{}
		for _, s := range []struct{ key, url string }{
			{"era5", "https://archive-api.open-meteo.com/v1/archive?" + at +
				"&hourly=temperature_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_direction_10m&models=era5" + q},
			{"marine", "https://marine-api.open-meteo.com/v1/marine?" + at +
				"&hourly=sea_surface_temperature,wave_height" + q},
			{"gfs", "https://historical-forecast-api.open-meteo.com/v1/forecast?" + at +
				"&hourly=" + strings.Join(gfs, ",") + "&models=gfs_seamless" + q},
		} {
			tmp := dest + ".part-" + s.key
			os.Remove(tmp)
			if _, err := c.Get(ctx, s.url, tmp, ""); err != nil {
				return err
			}
			b, err := os.ReadFile(tmp)
			os.Remove(tmp)
			if err != nil {
				return err
			}
			var ans struct {
				Hourly json.RawMessage `json:"hourly"`
			}
			if err := json.Unmarshal(b, &ans); err != nil || ans.Hourly == nil {
				return fmt.Errorf("%s: no hourly block", s.url)
			}
			row[s.key] = ans.Hourly
		}
		rows = append(rows, row)
	}
	b, err := json.Marshal(rows)
	if err != nil {
		return err
	}
	if err := os.WriteFile(dest, b, 0o644); err != nil {
		return err
	}
	fmt.Fprintf(log, "  weather %s, %d points\n", day, len(rows))
	return nil
}
