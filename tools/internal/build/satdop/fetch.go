package satdop

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"time"

	"flatorglobe/tools/internal/build/gpsraw"
	"flatorglobe/tools/internal/fetch"
)

// Fetch makes raw/ available: a link to data/gps/raw when gps-raw already
// has the files (the same day, the same stations), else the observation
// files are downloaded from the BKG archive (the broadcast file is a plain
// input with a URL).
func Fetch(ctx context.Context, root string, c *fetch.Client, log io.Writer) error {
	raw := filepath.Join(root, RawDir)
	if _, err := os.Lstat(raw); os.IsNotExist(err) {
		if st, err := os.Stat(filepath.Join(root, gpsraw.RawDir)); err == nil && st.IsDir() {
			if err := os.Symlink("../gps/raw", raw); err != nil {
				return err
			}
			io.WriteString(log, "  raw/ -> ../gps/raw\n")
			return nil
		}
	}
	list, err := readStations(root)
	if err != nil {
		return err
	}
	if c == nil {
		c = &fetch.Client{Pause: 2 * time.Second, UserAgent: "FlatOrGlobe-fog/1 (data compiler)"}
	}
	for _, st := range list {
		if _, err := c.Get(ctx, gpsraw.ObsBase+st[1], filepath.Join(raw, st[1]), ""); err != nil {
			return err
		}
	}
	io.WriteString(log, "  observation files present\n")
	return nil
}
