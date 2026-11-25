/*
  laz2pts -- FlatOrGlobe (epic24): stream the points of a LAS/LAZ file to
  stdout for `fog`, through the LASzip API (vendored, unchanged, beside this
  file). Only the fields fog uses are decompressed (LASzip's selective
  decompression of LAS 1.4 layered chunks).

  usage: laz2pts FILE.laz > points

  Output, little-endian:
    header  "LZP1", u64 point count, f64 x/y/z scale, f64 x/y/z offset (60 bytes)
    records i32 X, i32 Y, i32 Z (unscaled), u8 classification, f64 GPS time (21 bytes)
  The classification is the full byte of point formats 6-10 (extended) and
  the 5-bit field of formats 0-5, as laspy reads them.
*/
#include <cstdio>
#include <cstdint>
#include <cstring>
#include <vector>

#include "dll/laszip_api.h"

#define SELECTIVE (0x00000001u /* Z */ | 0x00000002u /* CLASSIFICATION */ | 0x00000080u /* GPS_TIME */)

static int fail(laszip_POINTER z, const char* what) {
  laszip_CHAR* msg = 0;
  if (z) laszip_get_error(z, &msg);
  fprintf(stderr, "laz2pts: %s%s%s\n", what, msg ? ": " : "", msg ? msg : "");
  return 1;
}

int main(int argc, char** argv) {
  if (argc != 2) {
    fprintf(stderr, "usage: laz2pts FILE.laz > points\n");
    return 2;
  }
  laszip_POINTER z = 0;
  if (laszip_create(&z)) return fail(0, "laszip_create");
  if (laszip_decompress_selective(z, SELECTIVE)) return fail(z, "selective");
  laszip_BOOL compressed = 0;
  if (laszip_open_reader(z, argv[1], &compressed)) return fail(z, argv[1]);
  laszip_header* h = 0;
  if (laszip_get_header_pointer(z, &h)) return fail(z, "header");
  laszip_point* p = 0;
  if (laszip_get_point_pointer(z, &p)) return fail(z, "point");
  uint64_t n = h->number_of_point_records ? h->number_of_point_records : h->extended_number_of_point_records;
  bool ext = h->point_data_format >= 6;

  std::vector<unsigned char> buf;
  buf.reserve(1 << 20);
  auto put = [&](const void* v, size_t k) {
    const unsigned char* c = static_cast<const unsigned char*>(v);
    buf.insert(buf.end(), c, c + k);
  };
  put("LZP1", 4);
  put(&n, 8);
  double sc[6] = {h->x_scale_factor, h->y_scale_factor, h->z_scale_factor, h->x_offset, h->y_offset, h->z_offset};
  put(sc, sizeof sc);
  for (uint64_t i = 0; i < n; i++) {
    if (laszip_read_point(z)) return fail(z, "read");
    unsigned char cls = ext ? p->extended_classification : p->classification;
    put(&p->X, 4);
    put(&p->Y, 4);
    put(&p->Z, 4);
    put(&cls, 1);
    put(&p->gps_time, 8);
    if (buf.size() >= (1 << 20) - 64) {
      if (fwrite(buf.data(), 1, buf.size(), stdout) != buf.size()) return fail(0, "write");
      buf.clear();
    }
  }
  if (fwrite(buf.data(), 1, buf.size(), stdout) != buf.size()) return fail(0, "write");
  laszip_close_reader(z);
  laszip_destroy(z);
  return fflush(stdout) ? 1 : 0;
}
