# Ride Report — working notes

A pre-flight turbulence briefing. Enter a route or a flight number and it forecasts how the
air will feel along the way, from raw numerical weather prediction output.

No build step is needed to *run* it. `www/index.html` is the whole app.

---

## Hard rules

These are not style preferences. Breaking one changes what the product claims about itself.

1. **No fabricated data, ever.** If a source fails, the UI says so. A confident wrong
   forecast is worse than no forecast. Never substitute a plausible default for a missing
   measurement, never interpolate across a failed model fetch, never let a partial result
   render as if it were complete.
2. **Forecast data is never cached by the service worker.** Only the app shell. A stale
   turbulence forecast is actively dangerous in a way a stale web page is not. `sw.js`
   explicitly excludes `api.open-meteo.com`, `api.adsbdb.com` and `aviationweather.gov`,
   and its `SHELL` constant must be bumped whenever `www/index.html` changes, because the
   fetch handler is cache-first for same-origin requests.
3. **Single-file output stays.** `www/index.html` must remain deployable to any static
   host by copying one file. `src/` exists for editing; `build.sh` puts it back together.
4. **State uncertainty in the product, not just the docs.** The methodology panel and the
   disclaimers are features. When you add a diagnostic, add its limitations to the panel in
   the same change.
5. **Licences constrain monetisation.** Open-Meteo's free tier is non-commercial — any paid
   listing needs their paid plan first. OpenFlights data is ODbL, which carries share-alike
   obligations. Settle this before charging money.

---

## Project layout

```
src/
  shell/head.html     <head>, meta, manifest link — everything before <style>
  styles.css          the entire stylesheet
  shell/body.html     the static markup
  data/airports.js    OurAirports table, 4,054 rows, pipe-delimited in a template literal
  data/airlines.js    OpenFlights IATA→ICAO table, 987 rows
  core.js             table parsing, geodesy, standard atmosphere, EDR scale, formatting
  engine.js           route construction, filed-route lookup, Open-Meteo fetching, CAT physics
  analyse.js          mountain wave, convection, place labels, the main analysis pass
  render.js           verdict copy, ride tape, map
  xsection.js         vertical cross-section canvas
  panels.js           segment log, side blocks, methodology panel
  astro.js            Sun/Moon position, rise/set, twilight, lunar phase (Meeus)
  seeing.js           Cn² via Hufnagel-Valley, Fried parameter, transparency
  ui.js               typeahead, flight-number lookup, run orchestration, event wiring
  share.js            URL hash state, Open Graph rewriting, copy-link
  calm.js             anxious-flyer mode — reframes copy, never changes numbers
  jetlag.js           circadian plan + the view router
  seeingview.js       seeing page fetch and render
  data/features.js    Natural Earth physical features, bbox + centroid, 499 rows
  window.js           what-is-out-the-window geometry: features, terminator, aurora
  windowview.js       the window timeline panel, synced to the ride scrubber
  heatmap.js          departure-time grid: one week fetched once, re-sampled per slot
  heatmapview.js      the grid, its cost estimate and click-through
  motion.js           FFT, Welch PSD, -5/3 slope fit, window quality gates
  motionview.js       the recorder: permissions, wake lock, binning, local store
  data/runways.js     longest runway heading per airport, 3,597 rows (OurAirports)
  delay.js            delay heuristic: crosswind, visibility, convection, wind delta
  delayview.js        the delay panel and the local prediction log
  volume.js           WebGL2 raymarch of the route's computed field
  globe.js            the same EDR physics on a grid, for an area rather than a route
  globeview.js        the area map, raster overlay, altitude and time scrubbers
server/               Cloudflare Worker + D1 schema for the observation network
                      (deploy-ready, not deployed — needs an account)
  native.js           Capacitor bridge, service-worker registration
  shell/foot.html     Leaflet tag and closing tags
build.sh              concatenates src/ → www/index.html
test/                 vitest suites, loaded via node:vm against the real sources
www/index.html        the build output — generated, do not hand-edit
```

**`www/index.html` is generated.** Edit `src/` and run `./build.sh`. `./build.sh --check`
rebuilds to a temp file and diffs, so CI or a pre-commit hook can catch a hand-edited
output.

### Why the script blocks matter

The app is classic scripts, not ES modules. Top-level `const` and `let` in a classic script
live in the *global lexical environment*, shared across every `<script>` on the page — so
modules can see each other's constants without exports, but a duplicate top-level `const`
across two files is a `SyntaxError` at load.

`build.sh` therefore groups files into blocks deliberately. `"use strict"` is a
per-block directive: it appears once at the top of each block, which is why
`data/airports.js` and `data/airlines.js` ship inside a *single* block. Splitting them would
drop the airline table into sloppy mode. Same for `ui.js` + `native.js`.

### Testing generated-from-source code

`test/harness.js` evaluates the real `src/` files in a `node:vm` context and lifts the
requested globals out. There is no parallel testable copy of the physics to drift out of
sync — the tests exercise exactly what ships. Because top-level `const` is invisible from
outside the context, the harness runs one extra snippet inside it to copy names onto
`globalThis`.

---

## Design tokens

Defined as CSS custom properties at the top of `src/styles.css`. Use the token, never the
literal.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#070B14` | page background, also the PWA theme colour |
| `--ink-2` | `#0A0F1A` | secondary ground |
| `--panel` | `#0F1725` | panel background |
| `--panel-2` / `--panel-3` | `#152030` / `#1B2739` | raised panel steps |
| `--rule` / `--rule-2` | `#1E2B3F` / `#2B3B54` | hairlines |
| `--vellum` | `#E9EFF7` | body text |
| `--dim` / `--dim-2` | `#8DA0B8` / `#607289` | secondary and tertiary text |
| `--amber` | `#FFB03A` | primary action, highlight |
| `--amber-2` / `--amber-ink` | `#FFD089` / `#3A2708` | amber variants |

Type: **Barlow Condensed** (display, `--disp`), **Barlow** (body, `--body`),
**JetBrains Mono** (all data and numerals, `--mono`). Numbers are monospaced everywhere —
a figure that shifts width as it updates reads as unstable.

The page sits on a faint chart graticule (`body::before`) — the visual conceit is a
meteorological chart, not a dashboard.

---

## The EDR scale

Eddy dissipation rate, m^(2/3)·s^-1 — the metric ICAO adopted for turbulence reporting,
chosen because unlike "moderate chop" it does not depend on who is describing it. EDR
describes *the air*; what a passenger feels also depends on the aircraft, which is what
`ACFT[].f` adjusts for in the banner verdict only.

| Band | EDR ≥ | Colour | Feels like |
|---|---|---|---|
| Smooth | 0.00 | `#1FC8B4` | nothing you would notice |
| Light chop | 0.08 | `#9BD93F` | continuous fine vibration |
| Light | 0.16 | `#FFC93C` | distinct bumps, quiet air between |
| Moderate | 0.26 | `#FF8A3D` | firm jolts, pushed into the belt |
| Strong | 0.40 | `#F04A63` | sharp changes, objects leave the tray |
| Severe | 0.58 | `#C766FF` | violent; genuinely rare |

Each band carries `say` (short gloss for tables), `feel` (what the body registers) and
`cabin` (what you would see happening). `rampCol()` is the continuous version for the tape
and cross-section; `band()`/`bandCol()` are the discrete version.

---

## Physics conventions

Getting these wrong produces plausible numbers that are quietly meaningless.

- **Wind vectors.** Meteorological direction is where the wind blows *from*. The code
  converts once, in `profileAt()`: `u = -ws·sin(θ)`, `v = -ws·cos(θ)`. Everything
  downstream is in `u`/`v` components. Never reintroduce a bearing mid-calculation.
- **Units.** SI internally. Metres, m/s, seconds, kelvin. Conversion happens at the
  display edge only. `vws` is stored in s⁻¹ but *reported* in m/s per km (×1000); `DEF` and
  `CVG` are reported ×1e5; `TI1`/`TI2` ×1e7. The multipliers are part of the conventional
  scaling of Ellrod's index — do not "tidy" them away.
- **Potential temperature** `θ = T·(1000/p)^κ`, κ = 0.2857. Stability is computed on θ, not
  T; using T would get the sign of the stratification wrong.
- **Richardson number** `Ri = N²/S²` where `N² = (g/θ̄)·(Δθ/Δz)` and `S` is the vertical
  wind shear. Ri < 1 on a ~25 km grid means the layer is prone to breaking down. Ri is
  clamped to a sentinel `999` when shear is negligible, and goes negative for statically
  unstable layers — both are meaningful, neither is an error.
- **Ellrod's index** `TI1 = S · DEF`, `TI2 = S · (DEF + max(0, CVG))`. Deformation combines
  shearing and stretching terms; convergence *adds*, divergence never subtracts. The
  horizontal gradients come from a 4-point stencil around each waypoint, rotated from
  track-relative into earth coordinates by the track bearing.
- **Ellrod is scale-dependent.** The EDR calibration is anchored at the 90 km default
  stencil. Moving far from it shifts the diagnostic the calibration was fitted to, and the
  app says so in the UI when you do. The terrain window for the mountain-wave term is
  deliberately *not* tied to the slider and stays at 90 km, because relief measured over a
  wider window is automatically larger and would inflate the term rather than sharpen it.
- **Sample counts are an API budget, not a resolution choice.** 16 minimum, 44 maximum.
  Each waypoint costs three profiles per model. Open-Meteo meters per minute weighted by
  variables × locations × hours, which is why requests are bounded with `start_hour`/
  `end_hour` rather than whole days, and why `FETCH_DEADLINE` exists — one model with
  stated lower confidence beats a spinner that never ends.
- **Model grid ≈ 25 km.** The eddies that actually move an aircraft are metres to hundreds
  of metres. Everything here is an inference from the large-scale flow to the small-scale
  ride. Below ~25–30 km the slider is interpolating, not resolving.

### Live traffic, and where the proxy has to live

No free ADS-B source sends CORS headers, so live traffic needs a server-side hop.
The Cloudflare Worker was the obvious home and **does not work**: the CORS problem is
solved, but every source then refuses Cloudflare's shared egress addresses.

| Source | From Cloudflare | From an ordinary machine |
|---|---|---|
| OpenSky | 522, timed out after ~20s | 200 in 0.25s |
| adsb.lol | 429 | 200 in 0.5s |
| airplanes.live | 403 | 403 (their access policy — email them) |

adsb.lol returns 200 even with an empty User-Agent, so it is not header-sniffing; it is
purely the source address. The proxy therefore lives in `serve.rb`, which runs on a normal
residential address. Live traffic works when the site is served locally and says why it does
not on a static host, rather than showing an empty sky.

### The area field

The same EDR physics on a grid. Scoped to the **visible view on demand**, not a live global
field, because a global grid is not affordable on the free tier — a 32-point route already
brushes the per-minute limit. The cost is shown before anything is fetched and the grid is
capped at 240 points so one view stays one round trip.

One thing gets *cheaper* on a grid. Along a route the engine spends two extra samples per
waypoint on the cross-track stencil Ellrod's deformation term needs; on a regular grid those
neighbours already exist, so the gradients come free. Edge cells have no neighbour on one
side and are left null rather than one-sided-differenced into a misleading value.

Only four levels are fetched (400/300/250/200 hPa, ~FL235-FL385) and the altitude scrubber is
clamped to that range rather than pretending to cover FL180-FL450 with data that does not
reach.

Live traffic is absent for the same CORS reason as aircraft rotation — see below. The Worker
in `server/` carries the proxy that unblocks both.

### Delay and connection risk

**A physically-motivated heuristic, not a trained model**, and the UI says so. There is no
labelled historical dataset behind it: every weight is a judgement about what a hazard tends
to cost, not a fitted coefficient. Predictions are logged to localStorage so the thing can be
checked against reality later — without that there is no path from "guess" to anything better.

**Aircraft rotation is missing and it is the strongest signal.** Whether the jet operating
your flight is already late inbound beats any weather field, and most consumer tools ignore
it. It is not reachable from a static page. Measured directly:

| Source | Cross-origin result |
|---|---|
| OpenSky | 200, but `access-control-allow-origin: https://opensky-network.org` — browsers on other origins refused |
| adsb.lol | 200, no CORS header at all |
| airplanes.live | 403 |

All three work server-side. None from a page. The same finding blocks live traffic on any
map view. A proxy fixes it and is a hosting decision, not a code one.

Crosswind is computed against the longest runway, since the runway in use is unknowable and
the longest is both the most-used and bidirectional (the component is taken as a magnitude).
Headings are normalised at parse time, not trusted from the table — a source value of 359.7
rounds to 360 in the data build, and 360 is not a heading.

### The in-cabin recorder

Estimates roughness from the phone's accelerometer by fitting Kolmogorov's -5/3 slope over
0.3-8 Hz, the standard approach for in-situ EDR from aircraft accelerometers. Validated
against synthetic signals: the fit recovers -5/3 from a generated Kolmogorov spectrum, and
-1/-2/-3 from those, so it is fitting rather than pattern-matching. White noise scores low
on Kolmogorov confidence even when loud.

**It reports an index, never an EDR, and the UI says so at length.** A phone on a tray table
measures the cabin's response: between the eddies outside and the glass under your palm sit
the wing, the fuselage, the seat rails and the tray hinge, an unknown transfer function that
differs by aircraft type and seat position. Converting back to atmospheric EDR needs that
response. We do not have it and must not guess it.

Quality gates discard rather than down-weight, because a contaminated sample is worse than a
missing one: gravity-direction change catches pickups, crest factor catches taps, a narrow
1.4-2.6 Hz peak catches footsteps. The amplitude gate sits at 1.5 g — a first cut used 0.6 g
and silently threw away a synthetic severe window as "handled", which would have discarded
precisely the observations the feature exists to collect.

Phones sample near 60 Hz against the 100 Hz-plus of aircraft instrumentation. The fit band
stops at 8 Hz, well under the ~30 Hz Nyquist, but energy above Nyquist aliases down into the
band rather than vanishing — one more reason the level is indicative and the slope is the
informative part.

### The departure heatmap

Scoring 56 departure slots the obvious way means 56 briefings, which is both slow and far
past the rate limit. It is also unnecessary: **the forecast fields do not change with your
departure time, only the moment at which you sample them.** So the week is fetched once for
a coarse waypoint set and every slot walks that same cached series with different timings —
about 13x one briefing instead of 56x, in a single round of requests.

**Only one thing is reduced: the model count.** One model instead of two halves the cost, and
a consistent bias matters far less when ranking slots against each other. Spacing, stencil and
physics all match a normal briefing.

That was learned the hard way. Cutting resolution as well looked like free savings and was not:
sampling every 199 nm walked past a sharp shear band, reporting a peak EDR of 0.20 where the
briefing found 0.77. Since the peak term carries a 74x weight, the same departure read 84 on the
grid and 42 in the briefing. A grid whose numbers do not mean what the briefing means is worse
than no grid. At matched resolution the same slot reads 45 against the briefing's 42.

Two other bugs surfaced on the way, both worth keeping in mind:
- The first cut scored only the nearest layer's clear-air value, ignoring mountain wave and
  convection entirely. That is why `blendColumn`/`columnAt` are shared out of engine.js.
- `analyse()` divided its cross-track finite difference by a hardcoded 180 km whatever the
  slider said. That is right only at the default 90 km half-width; at the 20 km end the sample
  points sit 40 km apart while the divisor still claimed 180, under-reporting shear by 4.5x.
  The analysis-scale slider was quietly corrupting the diagnostic it advertises sharpening.
  `stencilKm` is now separate from `scaleKm`: spacing is a cost knob, stencil width is a
  calibration constant.

`rideScore()` lives in core.js and is shared with `analyse()` on purpose. A cell that says
82 has to mean the same thing as the briefing it opens; two copies of that formula would
drift and the grid would start lying about what it links to.

Grid rows are the local hours that actually occur, never an assumed 0/3/6 set. Slots align
to UTC boundaries, so at UTC+1 the local hours are 22:00, 01:00, 04:00 — a fixed row set
matched none of them and rendered every cell empty. Deriving them also handles half-hour
zones like IST.

### The window view

Geometry only — it adds no model requests. Two things are load-bearing:

- **Sunrise and sunset are computed for the moving aircraft**, not for either airport.
  At cruise speed those differ enormously: an eastbound Atlantic crossing can compress
  sunrise into twenty minutes, a westbound one can hold the sun on the horizon for hours.
  The code finds terminator *crossings* along the track, never airport sun times.
- **Aurora uses geomagnetic latitude, not geographic.** The oval follows the field, which
  is why Edinburgh sees aurora far more often than Moscow at the same latitude. A centred
  dipole at 80.7 N, 72.7 W (IGRF-13, 2025 epoch) is close enough for a likelihood
  statement. The equatorward boundary by Kp is NOAA's published table, interpolated.

The Natural Earth gazetteer is filtered on two rules that both matter. Features straddling
the antimeridian get their bounding box computed in both signed and 0-360 frames, with the
tighter one kept and a `wrap` flag set *from the resulting geometry* — deriving it from
which branch ran produced 63 falsely-wrapped boxes instead of 7, and a falsely-wrapped box
matches almost every longitude. Sparse classes (island groups, vague geoareas) are dropped
above 20 degrees in both axes because their box is mostly open ocean; contiguous landforms
are kept at any size, which is why the Sahara survives and Polynesia does not.

---

## Data sources and licences

| Source | Used for | Licence |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | pressure-level and surface forecast, elevation | CC BY 4.0, **free tier is non-commercial** |
| [NOAA GFS](https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast) | global model | public domain |
| [ECMWF IFS](https://www.ecmwf.int/) via Open-Meteo | global model | CC BY 4.0 |
| [Copernicus DEM](https://dataspace.copernicus.eu/) via Open-Meteo | 90 m terrain | free, attribution |
| [OurAirports](https://ourairports.com/data/) | 4,054 airports | public domain |
| [OpenFlights](https://openflights.org/data.html) | 987 airline codes | **ODbL — share-alike** |
| [adsbdb](https://www.adsbdb.com/) | flight number → airport pair | free, no key |
| [Flight Plan Database](https://flightplandatabase.com/) | filed route waypoints | free, no key, 100 req/IP |
| [NOAA AWC](https://aviationweather.gov/) | international SIGMETs (best effort, CORS-blocked from some origins) | public domain |
| [Natural Earth](https://www.naturalearthdata.com/) | physical feature gazetteer (50m regions) | public domain (CC0) |
| [NOAA SWPC](https://services.swpc.noaa.gov/) | planetary K index forecast, for aurora | public domain |
| [CARTO](https://carto.com/attributions) + [OpenStreetMap](https://www.openstreetmap.org/copyright) | basemap tiles | CC BY, ODbL |
| [Leaflet](https://leafletjs.com/) | map rendering | BSD-2 |

Filed routes are matched **by flight number first**, then by city pair. A plan filed for a
city pair is not the plan filed for a specific flight on a specific day — oceanic tracks
are rebuilt daily around the jet. Say so wherever the route is presented.

---

## Views

One file, three views, routed on the hash. The ride briefing is the default entry point.

| Route | View | Notes |
|---|---|---|
| *(none)* or `#r=…` / `#f=…` | Ride briefing | the query state hash |
| `#/jetlag` | Jet lag planner | no API — pure computation |
| `#/seeing` | Seeing forecast | one location, far cheaper than a route |

Route hashes start with `/`; query-state hashes do not. `restoreFromHash()` splits on that,
and `HASH_SELF_WRITE` guards against the write→hashchange→restore feedback loop.

## Rate limits are the binding constraint

Open-Meteo's free tier meters **600/min, 5,000/hour, 10,000/day**, weighted by
variables × locations × hours. This is the single biggest constraint on anything new:

- One 32-point route briefing at default scale brushes the per-minute limit.
- Sustained development against the live API hits the **hourly** limit, which does not
  clear for an hour — budget for that when testing, and prefer the seeing view (1 location)
  or a short hop (16 points) when you just need a smoke test.
- Any feature that multiplies request count — a global grid, a 3D sample volume, a
  departure-time sweep across 7 days — **needs its caching story settled before any
  rendering work**, not after. Server-side caching of forecast fields is fine (they are
  valid for hours); caching a route briefing is not (see hard rule 2).

## Commands

```bash
./build.sh              # src/ → www/index.html
./build.sh --check      # verify www/index.html matches a fresh build
npm test                # vitest, 137 tests: geodesy, EDR, CAT, astro, seeing, jetlag, share, calm
./start.sh              # serve www/ on :8080 (macOS ruby, no installs)
./stop.sh
```

Node lives at `~/.local/node` and is only needed for the tests. The app itself and
`build.sh` need neither node nor npm.
