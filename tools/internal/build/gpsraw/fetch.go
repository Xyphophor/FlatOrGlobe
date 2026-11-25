package gpsraw

import (
	"context"
	"io"
	"path/filepath"
	"time"

	"flatorglobe/tools/internal/fetch"
)

// ObsBase is the BKG directory of the day's observation files.
var ObsBase = "https://igs.bkg.bund.de/root_ftp/IGS/obs/2025/100/"

// Fetch downloads the listed stations' observation files that are missing
// (the broadcast ephemeris is a plain input with a URL).
func Fetch(ctx context.Context, root string, c *fetch.Client, log io.Writer) error {
	list, err := ReadStations(root)
	if err != nil {
		return err
	}
	if c == nil {
		c = &fetch.Client{Pause: 2 * time.Second, UserAgent: "FlatOrGlobe-fog/1 (data compiler)"}
	}
	for _, st := range list {
		if _, err := c.Get(ctx, ObsBase+st[1], filepath.Join(root, RawDir, st[1]), ""); err != nil {
			return err
		}
	}
	io.WriteString(log, "  observation files present\n")
	return nil
}
