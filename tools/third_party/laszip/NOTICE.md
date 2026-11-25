# LASzip — vendored

`src/`, `dll/laszip_api.h`, `COPYING`, `README.md` and `AUTHORS` are copied unchanged from the
LASzip 3.4.4 release (`laszip-src-3.4.4.tar.gz`, https://github.com/LASzip/LASzip/releases/tag/3.4.4,
sha256 41f826848ff106f471b134224f58075ac8e36a62b6ba0ad75be8a8c191bdba4b, downloaded 2026-10-14; its
CMakeLists.txt says 3.5.1), (c) rapidlasso GmbH, Apache License 2.0 (`COPYING`).
`include/laszip/laszip_api_version.h` is the release's `laszip_api_version.h.in` with the values its
CMake would write (3.5.1, unordered_map available).

`laz2pts.cpp` is ours (FlatOrGlobe, epic24): it streams a LAS/LAZ file's points to `fog`.
`make laz2pts` builds `tools/bin/laz2pts` with the definitions of LASzip's CMake
(`-DLASZIPDLL_EXPORTS -DUNORDERED -DHAVE_UNORDERED_MAP=1`); the build of a LiDAR contribution runs it.
