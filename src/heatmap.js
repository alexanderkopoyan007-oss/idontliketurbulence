"use strict";
/* ══════════ DEPARTURE HEATMAP ═══════════════════════════════════════════
   "Which departure has the smoothest ride this week?" — the question that
   belongs before you book, not after.

   The naive implementation is 56 full briefings, which would be both very slow
   and far past Open-Meteo's rate limit. It is also unnecessary: the forecast
   fields do not change with your departure time, only the moment at which you
   sample them. So the pressure-level series is fetched ONCE across the whole
   seven-day window for a coarse set of waypoints, and every departure slot is
   evaluated by walking that same cached series with different timings.

   That turns 56 fetch rounds into one, and the cost is roughly a dozen ordinary
   briefings rather than fifty-six.

   Deliberate reductions, all stated in the UI:
     - one model (GFS), not two. The grid compares slots against each other, so
       a consistent bias matters far less than it would in an absolute forecast,
       and the saving is a straight halving.
     - one model, as above.

   What is NOT reduced any further is along-track resolution. A first cut sampled
   every 199 nm to save requests; that walked straight past a sharp shear band,
   reporting a peak EDR of 0.20 where the full briefing found 0.77, and since the
   peak term carries a 74x weight in the score the same departure read 84 on the
   grid and 42 in the briefing. A grid whose numbers do not mean what the briefing
   means is worse than no grid, so the spacing now matches the briefing's default
   and the cost is ~26x one briefing instead of ~13x — still one round of requests
   against 56 briefings.

   What is NOT reduced is the physics. The first version scored only the nearest
   layer's clear-air value, which ignored mountain wave and convection: it called
   a slot the smoothest of the week at 93 when the full briefing scored the same
   departure 42. The grid now runs the same blendColumn/columnAt the briefing
   does, which needs CAPE and terrain — CAPE for the week is two variables rather
   than forty, and terrain is time-invariant so it is fetched once. */

const HEAT_STEP_H = 3;          // one column every three hours
const HEAT_DAYS   = 7;

/* What this will cost, worked out before anything is fetched so the user can
   decide. Open-Meteo meters by variables x locations x hours. */
function heatmapPlan(dep, arr, opts){
  /* Same spacing and same stencil as a default briefing, so a grid score means
     what a briefing score means. The saving comes from fetching the week once,
     not from sampling it worse. */
  const route  = buildRoute(dep, arr, new Date(), { ...opts, scaleKm: 90, stencilKm: 90 }, null);
  const nWpt   = route.wp.length;
  const points = nWpt * 3;                       // centre + both stencil points
  const chunks = Math.ceil(points / 12);         // 12 locations per request
  const surf   = Math.ceil((nWpt*2) / 20);       // CAPE/precip, 20 locations per request
  const hours  = HEAT_DAYS*24 + 12;
  const slots  = Math.floor(HEAT_DAYS*24 / HEAT_STEP_H);
  return { route, nWpt, points, requests: chunks + surf + 1, plChunks: chunks,
           surfChunks: surf, hours, slots,
           /* a normal briefing is ~4 pressure chunks over ~14 hours; the surface
              and terrain calls are a rounding error against forty variables */
           relativeCost: (chunks*hours) / (4*14) };
}

/* Fetch once, across the whole window. */
async function heatmapFetch(plan, progress){
  const wp = plan.route.wp;
  const pts = [];
  wp.forEach(w => { pts.push({lat:w.lat, lon:w.lon}); pts.push(w.left); pts.push(w.right); });
  const t0 = new Date(Date.now() - 2*3600e3);
  const t1 = new Date(Date.now() + (HEAT_DAYS*24 + 10)*3600e3);
  const h0 = hourISO(t0), h1 = hourISO(t1);

  progress && progress(18, `Fetching one week of upper-air data — ${plan.plChunks} requests…`);
  const recs = await fetchModel(pts, "gfs_seamless", h0, h1);
  if (recs.length !== pts.length) throw new Error("The weather service returned an incomplete week. Try again in a minute.");

  progress && progress(48, "Fetching convective fields for the week…");
  const surface = await fetchSurface(wp.map(w=>({lat:w.lat,lon:w.lon})).concat(wp.map(w=>w.left)), h0, h1)
                        .catch(() => null);

  progress && progress(58, "Sampling terrain along the track…");
  const elev = await fetchTerrain(f => {
    if (plan.route.filed && plan.route.filed.path) return plan.route.filed.path.at(plan.route.distM * f);
    return interp(plan.route.dep, plan.route.arr, f);
  }, 90).catch(() => null);

  return { recs, surface, elev };
}

/* Evaluate one departure slot against the cached series. Mirrors the cruise-level
   part of analyse(), reusing the same layerCAT physics and the same rideScore, so
   a cell cannot disagree with the briefing it opens. */
function heatmapSlot(plan, data, departAt){
  const { recs, surface, elev } = data;
  const route = plan.route, wp = route.wp;
  const tas = route.tas;
  let t = departAt.getTime() + 8*60000;
  const edrs = [], mins = [];
  let prevNm = 0;

  for (let i=0;i<wp.length;i++){
    const w = wp[i];
    if (i > 0){
      const segNM = w.nm - prevNm;
      const ph = w.phase;
      const gs = ph === "cruise" ? tas : (ph === "climb" || ph === "takeoff") ? tas*0.62 : tas*0.74;
      t += segNM/gs*3600e3;
      mins.push(segNM/gs*60);
    } else mins.push(0);
    prevNm = w.nm;

    const tSec = t/1000;
    const C = profileAt(recs[i*3],   tSec);
    const L = profileAt(recs[i*3+1], tSec);
    const R = profileAt(recs[i*3+2], tSec);
    if (!C){ edrs.push(null); continue; }
    const dsAlong = (i>0 && i<wp.length-1) ? (wp[i+1].distM - wp[i-1].distM)
                  : i===0 ? (wp[1].distM - wp[0].distM) : (wp[i].distM - wp[i-1].distM);
    /* Full stencil width = 2 x the half-width the route actually used, so the
       finite difference is divided by the distance it was measured over. */
    const layers = layerCAT(C, L, R,
                            i>0 ? profileAt(recs[(i-1)*3], tSec) : null,
                            i<wp.length-1 ? profileAt(recs[(i+1)*3], tSec) : null,
                            dsAlong, route.offM*2, w.brg);

    const trop = tropopause(C);
    const ts = elev ? terrainStats(elev, route.distM, w.frac, 90000) : null;
    const low = C.find(l => l && l.p >= 700) || C[0];
    const b = rad(w.brg);
    const alongWind = low ? (low.u*Math.sin(b) + low.v*Math.cos(b)) : 0;
    const mw = mountainWave(C, ts, alongWind, trop && trop.ft);

    let cape = 0, prcp = 0;
    if (surface){
      for (const r of [surface[i], surface[wp.length+i]].filter(Boolean)){
        const c = atTime(r.hourly && r.hourly.cape, r.hourly && r.hourly.time, tSec);
        const p = atTime(r.hourly && r.hourly.precipitation, r.hourly && r.hourly.time, tSec);
        if (c !== null) cape = Math.max(cape, c);
        if (p !== null) prcp = Math.max(prcp, p);
      }
    }
    const cv = convective(cape, prcp, trop && trop.ft);

    const column = blendColumn(layers, mw, cv, HEAT_GRID_FL, null);
    const here = columnAt(column, w.altFt);
    edrs.push(clamp(here.edr * lowLevelTaper(w.altFt), 0, 1));
  }

  const good = edrs.map((e,i) => [e, mins[i]]).filter(([e]) => e !== null);
  if (good.length < wp.length*0.6) return null;      // too much missing to judge
  const total = good.reduce((s,[,m]) => s+m, 0) || 1;
  const mean  = good.reduce((s,[e,m]) => s+e*m, 0)/total;
  const peak  = Math.max(...good.map(([e]) => e));
  const rough = good.reduce((s,[e,m]) => s + (e >= 0.16 ? m : 0), 0)/total;
  return { score: rideScore(mean, peak, rough), mean, peak, roughFrac: rough,
           depart: new Date(departAt), arrive: new Date(t), durMin: total };
}

/* The whole grid. */
/* Mid-layer flight levels, matching the grid analyse() builds. */
const HEAT_GRID_FL = [];
for (let k=0;k<LEVELS.length-1;k++) HEAT_GRID_FL.push((LEVELS[k].fl + LEVELS[k+1].fl)/2);

async function buildHeatmap(dep, arr, opts, progress){
  const plan = heatmapPlan(dep, arr, opts);
  const data = await heatmapFetch(plan, progress);
  progress && progress(70, "Scoring every departure slot…");

  /* Start at the next whole HEAT_STEP_H boundary in the origin's local time, so
     the columns line up with hours a person would actually book. */
  const now = new Date(Date.now() + 3600e3);
  const start = new Date(Math.ceil(now.getTime()/(HEAT_STEP_H*3600e3))*(HEAT_STEP_H*3600e3));

  const cells = [];
  for (let k=0;k<plan.slots;k++){
    const depart = new Date(start.getTime() + k*HEAT_STEP_H*3600e3);
    let cell = null;
    try { cell = heatmapSlot(plan, data, depart); } catch { cell = null; }
    if (cell) cells.push(cell);
  }
  if (!cells.length) throw new Error("No departure slot could be scored from the returned data.");
  return { plan, cells, dep, arr, opts,
           best: cells.reduce((a,c) => c.score > a.score ? c : a, cells[0]),
           worst: cells.reduce((a,c) => c.score < a.score ? c : a, cells[0]) };
}
