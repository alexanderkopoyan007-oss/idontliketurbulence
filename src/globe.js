"use strict";
/* ══════════ AREA TURBULENCE FIELD ═══════════════════════════════════════
   The same EDR physics evaluated on a grid instead of along a route.

   Scope, stated honestly: this is the VISIBLE AREA on demand, not a live global
   field. A global grid is not affordable on Open-Meteo's free tier — a single
   32-point route already brushes the per-minute limit, and the whole planet at
   any useful resolution is orders of magnitude more. Fetching what you are
   looking at, when you ask for it, is what the free tier supports, and the cost
   is shown before anything is requested.

   One thing gets cheaper on a grid rather than more expensive. Along a route the
   engine spends two extra samples per waypoint on the cross-track stencil that
   Ellrod's deformation term needs. On a regular grid those neighbours already
   exist — every cell's horizontal gradients come from the cells beside it, free.

   Levels are limited to the four that bracket normal cruise (400/300/250/200 hPa,
   about FL235 to FL385). The altitude scrubber is clamped to that range rather
   than pretending to cover FL180-FL450 with data that does not reach. */

const GLOBE_LEVELS = [400, 300, 250, 200];
const GLOBE_VARS = GLOBE_LEVELS.flatMap(p =>
  [`temperature_${p}hPa`, `wind_speed_${p}hPa`, `wind_direction_${p}hPa`, `geopotential_height_${p}hPa`]);
const GLOBE_CACHE = new Map();          // key -> { t, field }
const GLOBE_TTL = 45*60*1000;           // forecast fields are valid for hours

/* Grid spacing by zoom: coarse when zoomed out, finer when zoomed in, always
   bounded so one request set covers the view. */
function globeStep(zoom){
  if (zoom <= 3) return 4;
  if (zoom <= 4) return 3;
  if (zoom <= 5) return 2;
  if (zoom <= 6) return 1.5;
  return 1;
}

function globePlan(bounds, zoom){
  const step = globeStep(zoom);
  const s = Math.floor(bounds.south/step)*step, n = Math.ceil(bounds.north/step)*step;
  const w = Math.floor(bounds.west/step)*step,  e = Math.ceil(bounds.east/step)*step;
  const lats = [], lons = [];
  for (let y = s; y <= n + 1e-9; y += step) lats.push(+y.toFixed(3));
  for (let x = w; x <= e + 1e-9; x += step) lons.push(+x.toFixed(3));
  /* Hard cap: past this the request set stops being one round trip. */
  const MAX = 240;
  let ny = lats.length, nx = lons.length;
  while (nx*ny > MAX){ if (nx >= ny) { lons.splice(1, 1); nx--; } else { lats.splice(1, 1); ny--; } }
  const points = ny*nx;
  return { lats, lons, step, points, chunks: Math.ceil(points/25),
           key: `${lats[0]},${lats[ny-1]},${lons[0]},${lons[nx-1]},${step}` };
}

async function globeFetch(plan, when, progress){
  const cached = GLOBE_CACHE.get(plan.key);
  if (cached && Date.now() - cached.t < GLOBE_TTL) return cached.field;

  const pts = [];
  for (const la of plan.lats) for (const lo of plan.lons) pts.push({ lat: la, lon: lo });

  const h0 = hourISO(new Date(when.getTime() - 2*3600e3));
  const h1 = hourISO(new Date(when.getTime() + 74*3600e3));
  const recs = [];
  const groups = chunk(pts, 25);
  for (let g = 0; g < groups.length; g++){
    progress && progress(10 + 70*g/groups.length, `Fetching area data — ${g+1} of ${groups.length}…`);
    const q = new URLSearchParams({
      latitude:  groups[g].map(p => p.lat.toFixed(3)).join(","),
      longitude: groups[g].map(p => p.lon.toFixed(3)).join(","),
      hourly: GLOBE_VARS.join(","),
      start_hour: h0, end_hour: h1,
      models: "gfs_seamless",
      wind_speed_unit: "ms", timeformat: "unixtime", timezone: "UTC", cell_selection: "nearest",
    });
    const j = await getJSON(`${OM}?${q}`);
    (Array.isArray(j) ? j : [j]).forEach(r => recs.push(r));
    if (g < groups.length-1) await new Promise(s => setTimeout(s, 120));
  }
  if (recs.length !== pts.length) throw new Error("The weather service returned an incomplete grid.");
  const field = { plan, recs, ny: plan.lats.length, nx: plan.lons.length };
  GLOBE_CACHE.set(plan.key, { t: Date.now(), field });
  return field;
}

/* Read one grid cell's profile at a time. */
function globeProfile(field, iy, ix, tSec){
  const rec = field.recs[iy*field.nx + ix];
  if (!rec || !rec.hourly) return null;
  const H = rec.hourly, T = H.time, out = [];
  for (const p of GLOBE_LEVELS){
    const t = atTime(H[`temperature_${p}hPa`], T, tSec);
    const ws = atTime(H[`wind_speed_${p}hPa`], T, tSec);
    const wd = atTime(H[`wind_direction_${p}hPa`], T, tSec);
    let z = atTime(H[`geopotential_height_${p}hPa`], T, tSec);
    if (t === null || ws === null || wd === null){ out.push(null); continue; }
    if (z === null) z = 0;
    const th = rad(wd);
    out.push({ p, z, ft: z/FT, T: t+273.15,
               theta: (t+273.15)*Math.pow(1000/p, KAPPA),
               spd: ws, u: -ws*Math.sin(th), v: -ws*Math.cos(th) });
  }
  return out;
}

/* EDR across the whole grid at one flight level and one time.

   Gradients come from the four neighbouring cells, so the deformation term is
   computed the same way as along a route — just with neighbours that were going
   to be fetched regardless. Edge cells have no neighbour on one side and are
   left null rather than one-sided-differenced into a misleading value. */
function globeField(field, flightLevelFt, when){
  const tSec = when.getTime()/1000;
  const { nx, ny, plan } = field;
  const out = new Float32Array(nx*ny).fill(NaN);
  const R_earth = 6371008.8;

  for (let iy = 1; iy < ny-1; iy++){
    for (let ix = 1; ix < nx-1; ix++){
      const C = globeProfile(field, iy, ix, tSec);
      if (!C) continue;
      const W = globeProfile(field, iy, ix-1, tSec);
      const E = globeProfile(field, iy, ix+1, tSec);
      const S = globeProfile(field, iy-1, ix, tSec);
      const N = globeProfile(field, iy+1, ix, tSec);
      if (!W || !E || !S || !N) continue;

      const lat = plan.lats[iy];
      const dLon = (plan.lons[ix+1] - plan.lons[ix-1]) * Math.PI/180;
      const dLat = (plan.lats[iy+1] - plan.lats[iy-1]) * Math.PI/180;
      const dx = R_earth*Math.cos(rad(lat))*dLon;
      const dy = R_earth*dLat;

      /* layerCAT wants a track bearing; on a grid there is no track, so use
         due north and let the rotation be the identity. Deformation is a
         rotational invariant, which is why this is legitimate. */
      const layers = layerCAT(C, W, E, S, N, dy, dx, 0);
      const col = blendColumn(layers, null, null, GLOBE_LEVELS.map(() => 0), null);
      const here = columnAt(col, flightLevelFt);
      out[iy*nx + ix] = here ? clamp(here.edr, 0, 1) : NaN;
    }
  }
  return { values: out, nx, ny, lats: plan.lats, lons: plan.lons };
}
