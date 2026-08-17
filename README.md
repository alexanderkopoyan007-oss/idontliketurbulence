# Ride Report

A turbulence briefing for a specific flight, built before you fly. Enter a departure and
arrival airport, or a flight number, and it produces a forecast of how the air will feel
along the route — with a map, a vertical cross-section, per-segment reasoning, and advice
on smoother flight levels.

Everything lives in one file: `www/index.html` (~384 KB). No build step, no backend, no
API keys. Open it and it works.

---

## Running it

**As a website.** Serve the `www/` folder over http(s) — any static host will do
(Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3). Opening the file directly from disk
also works, but the service worker and install prompt need a real origin.

```bash
./start.sh                           # opens http://localhost:8080
```

`start.sh` serves `www/` with `serve.rb`, using the ruby that ships with macOS — nothing to
install. It falls back to python3, then to `npx http-server`, if ruby is ever missing.

`./stop.sh` shuts the server down again. Double-clicking **Ride Report.app** in this folder
does the same thing as `./start.sh` — it is a launcher, not a bundled copy of the app.

**As an installed app.** Once served, browsers offer "Install" / "Add to Home Screen"
(in Safari: File → Add to Dock). It then runs full-screen with an offline shell.

**As a native iOS app.** See `APP-STORE.md`.

---

## What it actually does

Turbulence forecasting is not a solved problem, and this is not a wrapper around someone
else's turbulence product — there isn't a free one. It computes the standard operational
diagnostics itself, from raw numerical weather prediction data.

### The route it forecasts along

Airliners do not fly the great circle, so forecasting along one samples air the aircraft
never flies through. The app looks up a real filed-style plan from
[Flight Plan Database](https://flightplandatabase.com/) — matched by **flight number**
first, falling back to the city pair — and uses its named waypoints as the ground track:
SIDs, airways, oceanic entry points, the STAR. A transatlantic routing typically runs 2–3%
longer than the straight line and departs from it by **150–250 nm** in the middle, which is
exactly where the jet and its shear zone live.

Plans are sanity-checked before use (cruise level, waypoint count, and total distance
within 0.97–1.55× the great circle) because a public plan database inevitably holds junk.
If nothing plausible exists for the pair, it falls back to the great circle and says so.

The honest limit: this is a plan filed for *this city pair*, not the plan filed for *your
flight on your day*. Oceanic track structure is rebuilt daily around the jet, and dispatch
re-routes for weather up to pushback. It is the right shape, not the exact string — and it
is far closer than a straight line.

### The diagnostics

For each of the 16–56 waypoints it fetches wind, temperature and geopotential height at ten
pressure levels (850 hPa down to 100 hPa, roughly FL050 to FL530), from both **NOAA GFS
0.25°** and **ECMWF IFS 0.25°**. It also samples two extra points either side of track,
which is what makes horizontal wind gradients computable rather than guessed. From that it
derives:

| Diagnostic | What it captures |
|---|---|
| Vertical wind shear | The basic ingredient — wind changing with height |
| Gradient Richardson number | Whether stability is strong enough to suppress that shear |
| **Ellrod's TI1 / TI2** | Shear × horizontal deformation. The standard operational clear-air-turbulence index |
| Mountain-wave term | Terrain relief within 90 km, cross-barrier flow, low-level stability; amplified near the tropopause |
| Convective term | CAPE and precipitation, with an estimated storm-top height and a gravity-wave tail above the anvil |

Each is mapped onto **EDR** (eddy dissipation rate, the ICAO turbulence metric, in
m^(2/3)/s) using power laws anchored on the conventional light/moderate/severe thresholds,
then blended. The whole calculation runs once per model and the disagreement between them
becomes the stated confidence figure.

Timings begin from a standard climb/descent profile and are then corrected using the
forecast head- and tailwind component along each segment, so the ETAs shift when the jet
does. Cruise level comes from the filed plan when one was found, and from distance plus the
semicircular rule when it was not.

### How the ride is described

Every intensity band carries three things: the EDR range, what the motion *feels* like, and
what it means for the cabin. The headline verdict names the roughest span with its start and
end times, its length, the phase of flight it falls in, the level and the nearest named
waypoint; then the further patches; then the totals and how much of the flight is genuinely
quiet; then what is causing it. A long smooth opening is called out explicitly, because
"the first three hours are fine" is the thing worth knowing.

### The analysis-scale slider

The slider sets how far either side of track the wind field is sampled, and how closely
waypoints are spaced. Tightening it resolves narrower features — a single ridge, the sharp
edge of a jet — at the cost of more requests and a longer wait. Sample count runs from 16
(the floor, so even a short hop gets a real profile) to 56, about 30 on a transatlantic leg
at the default setting. Each sample point carries a full vertical profile plus two
cross-track ones, so 30 points means 90 profiles per model.

Because Open-Meteo's free tier limits requests per minute and weights them by
variables × locations × hours, requests are bounded to the hours around the flight rather
than to whole calendar days, and a 429 backs off and retries rather than dropping a model.

Two honest limits:

- **It cannot manufacture detail the models do not hold.** The source grids are about 25 km
  across. Below roughly 25–30 km you are interpolating, not learning something new.
- **The EDR calibration is anchored at the 90 km default.** Ellrod's index is inherently
  scale-dependent, so moving far from the default shifts the diagnostic the calibration was
  fitted to. The app says so when you do.

The terrain window feeding the mountain-wave term is deliberately *not* tied to the slider
and stays at 90 km. Relief measured over a wider window is automatically larger, so linking
them would have inflated the wave term instead of sharpening it.

---

## What it cannot know

Stated plainly, because a forecast that oversells itself is worse than none:

- A model grid box is about 25 km. The eddies that actually move an aircraft are metres to
  hundreds of metres. Everything here is inferred from the large-scale flow.
- It follows a filed route for your city pair, but not *your* filed route on the day, and
  it does not know your assigned levels or your step climbs.
- It does not know that the crew will deviate around the weather — which they will.
- Convective turbulence is the least reliable part. Individual storms are not resolved.
- Clear-air turbulence forecasting skill is genuinely limited. Getting the general character
  of a flight right is realistic. Predicting a specific 30-second bump is not.

**This is a planning aid, not an operational product.** It is not a substitute for a
briefing, a SIGMET, or the flight deck. If a captain says sit down, sit down.

---

## Data sources

| Source | Used for | Licence |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | Pressure-level and surface forecast, terrain elevation | CC BY 4.0, free for non-commercial use |
| [NOAA GFS](https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast) | Global model | Public domain |
| [ECMWF IFS](https://www.ecmwf.int/) via Open-Meteo | Global model | CC BY 4.0 |
| [Copernicus DEM](https://dataspace.copernicus.eu/) via Open-Meteo | 90 m terrain | Free, attribution |
| [OurAirports](https://ourairports.com/data/) | 4,054 airports | Public domain |
| [OpenFlights](https://openflights.org/data.html) | 987 airline codes | ODbL |
| [adsbdb](https://www.adsbdb.com/) | Flight number → airport pair | Free, no key |
| [Flight Plan Database](https://flightplandatabase.com/) | Filed route waypoints, by flight number or city pair | Free, no key, 100 req/IP |
| [NOAA Aviation Weather Center](https://aviationweather.gov/) | International SIGMETs (best effort) | Public domain |
| [CARTO](https://carto.com/attributions) + [OpenStreetMap](https://www.openstreetmap.org/copyright) | Basemap tiles | CC BY, ODbL |
| [Leaflet](https://leafletjs.com/) | Map rendering | BSD-2 |

**Check the licences before charging money for this.** Open-Meteo's free tier is
non-commercial; commercial use needs their paid plan. OpenFlights data is ODbL, which has
share-alike obligations. CARTO's free basemap tier has limits. None of this blocks a
personal or free app, but a paid App Store listing needs the licensing settled first.

---

## Project layout

```
ride-report/
├── www/
│   ├── index.html            the entire app
│   ├── manifest.webmanifest  PWA metadata
│   ├── sw.js                 shell cache; never caches forecast data
│   └── icon-192.png, icon-512.png
├── resources/                icon.png (1024), splash.png for Capacitor
├── capacitor.config.json     native iOS wrapper config
├── package.json
├── PrivacyInfo.xcprivacy     Apple privacy manifest — collects nothing
├── APP-STORE.md              iOS build and submission guide
└── README.md
```

The app is assembled from eleven source parts during development and concatenated into the
single file. Editing `www/index.html` directly is fine; it is plain HTML, CSS and
JavaScript with no transpilation.

---

## Verification

Nine route archetypes are exercised against a synthetic baroclinic-jet atmosphere with
terrain ridges and CAPE fields: transatlantic, antimeridian crossing (NRT–LAX), equator
crossing, Alpine, Rockies, Andes, and two hops under 300 nm. All produce plausible
durations, correct source attribution, no NaNs, and a tropopause detected in the right
place. Testing caught a score curve that was far too harsh, flight-level advice
recommending FL360 for a 162 nm hop, and a canvas measured while hidden that left the ride
tape blank.
