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
  ui.js               typeahead, flight-number lookup, run orchestration, event wiring
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
| [CARTO](https://carto.com/attributions) + [OpenStreetMap](https://www.openstreetmap.org/copyright) | basemap tiles | CC BY, ODbL |
| [Leaflet](https://leafletjs.com/) | map rendering | BSD-2 |

Filed routes are matched **by flight number first**, then by city pair. A plan filed for a
city pair is not the plan filed for a specific flight on a specific day — oceanic tracks
are rebuilt daily around the jet. Say so wherever the route is presented.

---

## Commands

```bash
./build.sh              # src/ → www/index.html
./build.sh --check      # verify www/index.html matches a fresh build
npm test                # vitest, 61 tests over geodesy / EDR / CAT physics
./start.sh              # serve www/ on :8080 (macOS ruby, no installs)
./stop.sh
```

Node lives at `~/.local/node` and is only needed for the tests. The app itself and
`build.sh` need neither node nor npm.
