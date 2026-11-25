package csvx

import "testing"

func TestParse(t *testing.T) {
	src := "# comment, with a comma\nstation,a,b\n# another\nX,1,\"2, quoted\"\n\nY,3\n"
	tb, err := Parse([]byte(src))
	if err != nil {
		t.Fatal(err)
	}
	if len(tb.Header) != 3 || tb.Header[2] != "b" {
		t.Fatalf("header %v", tb.Header)
	}
	if len(tb.Rows) != 2 {
		t.Fatalf("%d rows, blank line must be skipped", len(tb.Rows))
	}
	if v, _ := tb.Rows[0].Get("b"); v != "2, quoted" {
		t.Errorf("quoted cell %q", v)
	}
	if tb.Rows[0].Line != 4 || tb.Rows[1].Line != 6 {
		t.Errorf("line numbers %d %d, want file lines 4 and 6", tb.Rows[0].Line, tb.Rows[1].Line)
	}
	if _, ok := tb.Rows[1].Get("b"); ok {
		t.Error("short row: missing column must be absent")
	}
	if _, err := tb.Rows[1].Must("b"); err == nil {
		t.Error("Must on a missing column must fail")
	}
}

func TestParseErrors(t *testing.T) {
	if _, err := Parse([]byte("a,b\n1,2,3\n")); err == nil {
		t.Error("too many fields accepted")
	}
	if _, err := Parse([]byte("# only comments\n")); err == nil {
		t.Error("file without header accepted")
	}
}
