# Makefile -- local CI and data chain (epic24).
#
# `make ci` is what the future CI will run; it respects the owner's machine
# rules (CLAUDE.md): no browser, no `vite build`, heavy steps under nice.
# `fog` (tools/, Go) is the data compiler: data/ -> src/data/, no network.

NICE ?= nice -n 10
GO   ?= go
FOG  := tools/bin/fog
SMOKE := node --import ./scripts/smoke-register.mjs

GO_SRC := $(shell find tools -name '*.go' -not -path '*/testdata/*') tools/go.mod

.PHONY: help public-sync ci ci-full videos-check audit audit-tex fog crx2rnx laz2pts doc test test-go test-go-full test-js validate data data-check data-check-full smoke ai-check doctor clean run-dev

help:
	@echo "make ci          everything below except data/doctor (the local CI, fast targets)"
	@echo "make public-sync rewrite the clone of the public repository ($(PUBLIC)), then commit and push there"
	@echo "make ci-full     the same with the slow targets and tests (seis-relocate: ~7 min)"
	@echo "make test        Go + JS unit tests"
	@echo "make test-go     gofmt, go vet, go test (tools/)"
	@echo "make test-js     node --test (= npm test)"
	@echo "make validate    fog validate: every data/**/dataset.json, its files, its lock"
	@echo "make data        fog build all: regenerate src/data/ from data/"
	@echo "make data-check  fail if a generated file is stale"
	@echo "make smoke       mount every tab in linkedom"
	@echo "make ai-check    fail if public/llms*.txt, public/ai/ are stale"
	@echo "make videos-check fail if the pre-rendered card videos are older than the code (src/data/video-cards.json)"
	@echo "make audit       fog audit: sources/anchors/i18n, TeX commands, prose fidelity"
	@echo "make doc         the Go documentation of fog (methods and their sources)"
	@echo "make doctor      outside tools the repository uses"
	@echo "make run-dev     dev server on every interface (phone on the same network: http://<this PC's IP>:$(PORT))"

ci: test-go validate data-check audit-tex test-js smoke ai-check videos-check
	@echo "ci: all green"

ci-full: test-go-full validate data-check-full audit-tex test-js smoke ai-check videos-check
	@echo "ci-full: all green"

# Dev server reachable from the LAN (phone): vite listens on 0.0.0.0.
PORT ?= 5173
run-dev:
	@echo "Dev server on port $(PORT); from the phone (same Wi-Fi or Tailscale):"
	@for ip in $$(hostname -I); do case $$ip in *:*) ;; *) echo "  http://$$ip:$(PORT)/";; esac; done
	npx vite --host 0.0.0.0 --port $(PORT) --strictPort

$(FOG): $(GO_SRC)
	cd tools && CGO_ENABLED=0 $(GO) build -trimpath -o bin/fog ./cmd/fog

fog: $(FOG)

# RNXCMP's crx2rnx (GSI, vendored C, never rewritten): fog build gps-raw runs it
CRX2RNX := tools/bin/crx2rnx
$(CRX2RNX): tools/third_party/rnxcmp/crx2rnx.c
	mkdir -p tools/bin && $(CC) -O2 -o $@ $<

crx2rnx: $(CRX2RNX)

# LASzip (rapidlasso, Apache 2.0, vendored unchanged) behind laz2pts: the build of a LiDAR contribution runs it
LAZ2PTS := tools/bin/laz2pts
LASZIP_SRC := $(wildcard tools/third_party/laszip/src/*.cpp)
$(LAZ2PTS): tools/third_party/laszip/laz2pts.cpp $(LASZIP_SRC)
	mkdir -p tools/bin && $(CXX) -O2 -w -DLASZIPDLL_EXPORTS -DUNORDERED -DHAVE_UNORDERED_MAP=1 -Itools/third_party/laszip -Itools/third_party/laszip/include -o $@ $^

laz2pts: $(LAZ2PTS)

test: test-go test-js

test-go:
	@cd tools && fmt=$$(gofmt -l .) && if [ -n "$$fmt" ]; then echo "gofmt needed: $$fmt"; exit 1; fi
	cd tools && $(GO) vet ./...
	cd tools && $(NICE) $(GO) test -short ./...

test-go-full: $(CRX2RNX) $(LAZ2PTS)
	cd tools && $(NICE) $(GO) test -timeout 60m ./...

test-js:
	$(NICE) npm test --silent

validate: $(FOG)
	$(FOG) validate

data: $(FOG) $(CRX2RNX) $(LAZ2PTS)
	$(NICE) $(FOG) build --slow all

data-check: $(FOG) $(CRX2RNX)
	$(FOG) build --check all

data-check-full: $(FOG) $(CRX2RNX) $(LAZ2PTS)
	$(NICE) $(FOG) build --check --slow all

smoke:
	$(NICE) $(SMOKE) scripts/mount-smoke.mjs

ai-check:
	$(NICE) $(SMOKE) scripts/build_ai.mjs --check

# pre-rendered card videos (epic25): compares src/data/video-cards.json with the code's fingerprints, renders nothing.
# STALE => `node --import ./scripts/smoke-register.mjs scripts/prerender-cards.mjs --tabs <tab> --out prerender --site-url <url>`
# STALE layer => `node --import ./scripts/smoke-register.mjs scripts/prerender-layers.mjs --ids <id> --out prerender` (in-page video layers)
videos-check:
	node scripts/prerender-cards.mjs --check
	node scripts/prerender-layers.mjs --check

# the Go documentation: every package's doc comments (methods, formulas, references)
doc:
	@cd tools && for p in $$($(GO) list ./...); do $(GO) doc -all $$p; echo; done

# the TeX audit is clean and stays so; structure and prose fidelity report
# known gaps (translations, tabs in progress): run them with make audit
audit-tex: $(FOG)
	$(FOG) audit tex

audit: $(FOG)
	$(FOG) audit

doctor: $(FOG)
	$(FOG) doctor

clean:
	rm -rf tools/bin

# Le dépôt public (2026-11-25, github.com/Xyphophor/FlatOrGlobe) : un clone à côté de celui-ci, réécrit par fog public
# (tools/internal/public, public.json : sans les fichiers non republiables, la contribution non publiée, les notes de
# travail ; refuse sur un canari ou une chaîne privée). Commit et push se font ensuite dans $(PUBLIC).
PUBLIC ?= ../FlatOrGlobe-public
public-sync: fog
	$(FOG) public --into $(PUBLIC)
	git -C $(PUBLIC) status --short | wc -l | xargs echo "changed files in $(PUBLIC):"
