package exif

import (
	"os"
	"testing"
)

// One of earthlyskeptic's Theodolite screenshots, if it is on this machine (fog fetch contrib-flightdip).
func TestTheodoliteScreenshot(t *testing.T) {
	b, err := os.ReadFile("../../../data/contrib/flightdip/raw/photos/Flight1 28395ft.JPG")
	if err != nil {
		t.Skip("raw photo not on this machine")
	}
	in, err := Read(b)
	if err != nil {
		t.Fatal(err)
	}
	if in.Description != "vert_angle_deg=-3.0 / horiz_angle_deg=0.3" || !in.HasGPS || in.DateTimeOriginal != "2025:09:05 07:35:50" || in.OffsetTimeOriginal != "-05:00" {
		t.Fatalf("%+v", in)
	}
	if d := in.Lat - (41 + 50.0/60 + 26.53/3600); d*d > 1e-14 || in.Lon > -89 || in.Alt < 8654 || in.Alt > 8655 || in.ImgDirRef != "T" {
		t.Fatalf("%+v", in)
	}
}
