"use strict";
/* ══════════ DELAY AND CONNECTION RISK ═══════════════════════════════════
   What this is, stated first because it governs everything below:

   THIS IS A PHYSICALLY-MOTIVATED HEURISTIC, NOT A TRAINED MODEL. There is no
   labelled historical dataset behind it. Every weight below is a judgement
   about how much a given hazard tends to cost, not a fitted coefficient, and
   the UI says so. Presenting it as a model would be exactly the confident-wrong
   failure this project refuses.

   WHAT IS MISSING, AND WHY. The single strongest delay signal is aircraft
   rotation: whether the jet flying your flight is already running late inbound.
   Most consumer tools ignore it. This one would like to use it and cannot,
   because no free ADS-B source is reachable from a static browser page:

     OpenSky        anonymous queries work, but it returns
                    access-control-allow-origin: https://opensky-network.org,
                    so a browser on any other origin is refused
     adsb.lol       serves data but sends no CORS header at all
     airplanes.live answers a cross-origin request with 403

   All three are usable from a server. None from a page. So rotation is absent,
   the UI says it is absent, and the estimate is explicitly a weather-and-winds
   picture rather than a complete one. Adding a proxy would fix this and is a
   hosting decision, not a code one. */

const RUNWAYS = new Map();
RWY_RAW.split("\n").forEach(l => {
  const p = l.split("|");
  /* Normalise here rather than trusting the table: a source heading of 359.7
     rounds to 360 in the data build, and 360 is not a heading. */
  if (p.length === 3) RUNWAYS.set(p[0], { hdg: ((+p[1] % 360) + 360) % 360, len:+p[2] });
});

/* Crosswind and headwind components against a runway, in knots. A runway serves
   both directions, so the crosswind magnitude is what matters, not its sign. */
function windComponents(windFromDeg, windKt, rwyHdg){
  const off = rad(((windFromDeg - rwyHdg) % 360 + 360) % 360);
  return { cross: Math.abs(windKt*Math.sin(off)), head: windKt*Math.cos(off) };
}

/* Typical limits: a narrowbody is certified near 35 kt of crosswind dry, and
   operations get slow well before that. Below 15 kt nothing happens; by 35 kt
   the airport is losing capacity to go-arounds and increased spacing. */
function crosswindPenalty(crossKt){
  if (crossKt <= 15) return 0;
  return clamp((crossKt - 15)/20, 0, 1);
}
/* Visibility in metres. CAT I minima are around 550 m RVR; below ~1500 m
   airports move to low-visibility procedures, which cut arrival rate sharply. */
function visibilityPenalty(visM){
  if (visM === null || visM === undefined) return 0;
  if (visM >= 5000) return 0;
  return clamp((5000 - visM)/4500, 0, 1);
}
/* Convection near an airport is the classic afternoon-thunderstorm delay. */
function convectivePenalty(cape, precip){
  const c = clamp(((cape||0) - 300)/2200, 0, 1);
  const p = clamp((precip||0)/4, 0, 1);
  return clamp(0.75*c + 0.25*p, 0, 1);
}

/* Minutes the forecast winds add or remove against still air. The engine already
   computes wind-corrected timings and then throws the comparison away; this is
   simply that difference surfaced. */
function windDelayMinutes(R){
  const rt = R.route, wp = R.live;
  if (!wp || wp.length < 2) return 0;
  let still = 0, actual = 0;
  for (let i=1;i<wp.length;i++){
    const segNM = wp[i].nm - wp[i-1].nm;
    const ph = wp[i].phase;
    const tas = ph === "cruise" ? rt.tas : (ph === "climb" || ph === "takeoff") ? rt.tas*0.62 : rt.tas*0.74;
    const gs  = Math.max(180, tas + (wp[i].windComp || 0));
    still  += segNM/tas*60;
    actual += segNM/gs*60;
  }
  return actual - still;
}

/* Surface conditions at one end, from the surface record the analysis already
   fetched for that waypoint. */
function endConditions(R, which){
  const w = which === "dep" ? R.live[0] : R.live[R.live.length-1];
  const ap = which === "dep" ? R.route.dep : R.route.arr;
  const rwy = ap.icao ? RUNWAYS.get(ap.icao) : null;
  const s = w && w.surfaceWx;
  if (!s) return { ap, rwy, missing:true };
  const kt = s.windMs === null ? null : s.windMs*1.94384;
  const comp = (rwy && kt !== null && s.windDir !== null)
             ? windComponents(s.windDir, kt, rwy.hdg) : null;
  return {
    ap, rwy, missing:false, windKt:kt, windDir:s.windDir, vis:s.vis,
    cape:s.cape, precip:s.precip, cloudLow:s.cloudLow, comp,
    crosswind: comp ? comp.cross : null,
  };
}

/* Combine into an expected-minutes figure and a probability.

   The logistic below maps accumulated "hazard minutes" onto P(delay > 30 min).
   Its midpoint sits at 30 minutes of accumulated hazard by construction, and its
   width is a judgement, not a fit. A base rate is included because flights are
   late for reasons no weather model sees — crewing, slots, knock-on from
   earlier in the day — and pretending a calm day means an on-time arrival would
   be its own kind of dishonesty. */
const DELAY_BASE_RATE = 0.18;        // roughly the industry's >30 min share

function delayEstimate(R, connectionMin){
  const dep = endConditions(R, "dep"), arr = endConditions(R, "arr");
  const factors = [];
  const add = (label, minutes, detail) => {
    if (minutes >= 0.5) factors.push({ label, minutes, detail });
  };

  if (!dep.missing && dep.crosswind !== null)
    add("Crosswind at " + dep.ap.iata, 26*crosswindPenalty(dep.crosswind),
        `${Math.round(dep.crosswind)} kt across runway ${String(Math.round(dep.rwy.hdg/10)).padStart(2,"0")}`);
  if (!arr.missing && arr.crosswind !== null)
    add("Crosswind at " + arr.ap.iata, 30*crosswindPenalty(arr.crosswind),
        `${Math.round(arr.crosswind)} kt across runway ${String(Math.round(arr.rwy.hdg/10)).padStart(2,"0")}`);
  if (!arr.missing)
    add("Low visibility at " + arr.ap.iata, 34*visibilityPenalty(arr.vis),
        arr.vis !== null ? `${(arr.vis/1000).toFixed(1)} km forecast` : "");
  if (!dep.missing)
    add("Convection at " + dep.ap.iata, 30*convectivePenalty(dep.cape, dep.precip),
        `${Math.round(dep.cape||0)} J/kg CAPE`);
  if (!arr.missing)
    add("Convection at " + arr.ap.iata, 26*convectivePenalty(arr.cape, arr.precip),
        `${Math.round(arr.cape||0)} J/kg CAPE`);

  const windMin = windDelayMinutes(R);
  if (windMin >= 0.5) add("Headwind en route", windMin, `${Math.round(windMin)} min against still air`);

  const hazard = factors.reduce((s,f) => s + f.minutes, 0);
  /* logistic centred on 30 minutes of hazard */
  const p = clamp(DELAY_BASE_RATE + (1 - DELAY_BASE_RATE)/(1 + Math.exp(-(hazard - 30)/12)), 0, 0.97);

  /* Expected arrival delay: the hazard total, plus a tail for the causes we
     cannot see, minus any tailwind benefit already counted above. */
  const expected = hazard + DELAY_BASE_RATE*22;

  let connection = null;
  if (connectionMin && connectionMin > 0){
    /* A connection is missed when the arrival delay eats the buffer. The spread
       is wide because the underlying distribution is heavy-tailed, so this uses
       the same logistic shifted to the buffer rather than a point estimate. */
    const pMiss = clamp(1/(1 + Math.exp(-(expected - connectionMin + 8)/14)), 0.01, 0.97);
    connection = { minutes: connectionMin, pMiss,
                   verdict: pMiss < 0.15 ? "comfortable" : pMiss < 0.35 ? "tight" : "risky" };
  }

  return {
    factors: factors.sort((a,b) => b.minutes - a.minutes),
    hazardMin: hazard, expectedMin: expected, pDelay30: p,
    dep, arr, windMin, connection,
    rotationKnown: false,          // see the header: no browser-reachable source
  };
}
