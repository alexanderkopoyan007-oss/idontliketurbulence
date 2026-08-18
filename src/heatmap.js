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
     - the coarse analysis scale, so 16 waypoints rather than up to 44.
     - cruise level only. Climb and descent are much the same whenever you go. */

const HEAT_STEP_H = 3;          // one column every three hours
const HEAT_DAYS   = 7;

/* What this will cost, worked out before anything is fetched so the user can
   decide. Open-Meteo meters by variables x locations x hours. */
function heatmapPlan(dep, arr, opts){
  const route  = buildRoute(dep, arr, new Date(), { ...opts, scaleKm: 200 }, null);
  const nWpt   = route.wp.length;
  const points = nWpt * 3;                       // centre + both stencil points
  const chunks = Math.ceil(points / 12);         // 12 locations per request
  const hours  = HEAT_DAYS*24 + 12;
  const slots  = Math.floor(HEAT_DAYS*24 / HEAT_STEP_H);
  return { route, nWpt, points, requests: chunks, hours, slots,
           /* a normal briefing is ~4 chunks over ~14 hours */
           relativeCost: (chunks*hours) / (4*14) };
}

/* Fetch once, across the whole window. */
async function heatmapFetch(plan, progress){
  const pts = [];
  plan.route.wp.forEach(w => { pts.push({lat:w.lat, lon:w.lon}); pts.push(w.left); pts.push(w.right); });
  const t0 = new Date(Date.now() - 2*3600e3);
  const t1 = new Date(Date.now() + (HEAT_DAYS*24 + 10)*3600e3);
  progress && progress(20, `Fetching one week of model data — ${plan.requests} requests…`);
  const recs = await fetchModel(pts, "gfs_seamless", hourISO(t0), hourISO(t1));
  if (recs.length !== pts.length) throw new Error("The weather service returned an incomplete week. Try again in a minute.");
  return recs;
}

/* Evaluate one departure slot against the cached series. Mirrors the cruise-level
   part of analyse(), reusing the same layerCAT physics and the same rideScore, so
   a cell cannot disagree with the briefing it opens. */
function heatmapSlot(plan, recs, departAt){
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
    const layers = layerCAT(C, L, R,
                            i>0 ? profileAt(recs[(i-1)*3], tSec) : null,
                            i<wp.length-1 ? profileAt(recs[(i+1)*3], tSec) : null,
                            dsAlong, route.offM*2, w.brg);
    /* the layer nearest this waypoint's altitude */
    let best = null, bd = Infinity;
    for (const l of layers){
      if (!l) continue;
      const d = Math.abs(l.ft - w.altFt);
      if (d < bd){ bd = d; best = l; }
    }
    edrs.push(best ? best.edr : null);
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
async function buildHeatmap(dep, arr, opts, progress){
  const plan = heatmapPlan(dep, arr, opts);
  const recs = await heatmapFetch(plan, progress);
  progress && progress(70, "Scoring every departure slot…");

  /* Start at the next whole HEAT_STEP_H boundary in the origin's local time, so
     the columns line up with hours a person would actually book. */
  const now = new Date(Date.now() + 3600e3);
  const start = new Date(Math.ceil(now.getTime()/(HEAT_STEP_H*3600e3))*(HEAT_STEP_H*3600e3));

  const cells = [];
  for (let k=0;k<plan.slots;k++){
    const depart = new Date(start.getTime() + k*HEAT_STEP_H*3600e3);
    let cell = null;
    try { cell = heatmapSlot(plan, recs, depart); } catch { cell = null; }
    if (cell) cells.push(cell);
  }
  if (!cells.length) throw new Error("No departure slot could be scored from the returned data.");
  return { plan, cells, dep, arr, opts,
           best: cells.reduce((a,c) => c.score > a.score ? c : a, cells[0]),
           worst: cells.reduce((a,c) => c.score < a.score ? c : a, cells[0]) };
}
