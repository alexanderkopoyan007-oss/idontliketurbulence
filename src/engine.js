"use strict";
/* ══════════ ROUTE CONSTRUCTION ══════════════════════════════════════════ */

const TAS = { jumbo:490, wide:480, narrow:450, regional:415, bizjet:440 };   // knots true airspeed at cruise

/* Semicircular cruising levels (RVSM): easterly tracks take odd levels,
   westerly tracks take even. Chosen from the band that suits the distance. */
function autoCruiseFL(distNM, trackDeg){
  let target;
  if (distNM < 200)        target = 240;
  else if (distNM < 450)   target = 300;
  else if (distNM < 900)   target = 340;
  else if (distNM < 2200)  target = 360;
  else if (distNM < 4000)  target = 370;
  else                     target = 380;
  const east = trackDeg >= 0 && trackDeg < 180;
  const opts = east ? [230,250,270,290,310,330,350,370,390,410] : [240,260,280,300,320,340,360,380,400];
  return opts.reduce((b,x) => Math.abs(x-target) < Math.abs(b-target) ? x : b, opts[0]);
}

/* ══════════ FILED ROUTE ═════════════════════════════════════════════════
   Airliners do not fly the great circle. They fly standard departures, airways,
   and over the ocean the day's organised track structure — which is why the
   real thing is longer than the straight line and bends, sometimes a long way.

   Flight Plan Database carries real filed-style plans with named waypoints and
   coordinates, keyed by city pair and sometimes by flight number, so we use one
   of those as the ground track whenever a plausible one exists.

   The honest limit, stated in the UI as well: this is a route filed for this
   city pair, not the route filed for your specific flight on your specific day.
   Oceanic tracks move daily with the jet. It is the right shape, not the exact
   string — and it is much closer than a straight line. */

const FPDB = "https://api.flightplandatabase.com";

/* Reject the junk that a public plan database inevitably holds: cruise levels
   of 300 ft, six-waypoint stubs, and routes that wander 60% past the great
   circle. Prefer plans with real structure and a believable length. */
function planUsable(p, gcNM){
  if (!p || !p.id) return false;
  if (!(p.maxAltitude >= 10000 && p.maxAltitude <= 51000)) return false;
  if (!(p.waypoints >= 5)) return false;
  const d = +p.distance || 0;
  return d > gcNM*0.97 && d < gcNM*1.55;
}
function planRank(p, gcNM){
  const detour = Math.abs((+p.distance/gcNM) - 1.03);   // ~3% over great circle is typical
  return p.waypoints*1.6 - detour*140 + Math.min(20, (p.popularity||0));
}

async function fetchFiledRoute(dep, arr, flightNo){
  if (!dep.icao || !arr.icao) return null;
  const gcNM = distance(dep, arr)/NM;
  const queries = [];
  /* A plan tagged with the actual flight number is the closest thing to "your"
     route that exists without a paid feed, so it is tried first. */
  if (flightNo) queries.push([`flightNumber=${encodeURIComponent(flightNo)}&limit=20`, "flight number"]);
  queries.push([`fromICAO=${encodeURIComponent(dep.icao)}&toICAO=${encodeURIComponent(arr.icao)}&limit=20&sort=popularity`, "city pair"]);

  for (const [q, how] of queries){
    let list;
    try { list = await getJSON(`${FPDB}/search/plans?${q}`, 1); }
    catch(e){ continue; }
    if (!Array.isArray(list)) continue;
    const cands = list
      .filter(p => p.fromICAO === dep.icao && p.toICAO === arr.icao && planUsable(p, gcNM))
      .sort((a,b) => planRank(b, gcNM) - planRank(a, gcNM));
    for (const c of cands.slice(0, 3)){
      try{
        const full = await getJSON(`${FPDB}/plan/${c.id}`, 1);
        const nodes = full && full.route && full.route.nodes;
        if (!Array.isArray(nodes) || nodes.length < 5) continue;
        const path = buildPath(nodes, dep, arr);
        if (!path) continue;
        return { path, id:c.id, how, cruiseFt: c.maxAltitude,
                 flightNumber: c.flightNumber || null, nWpt: path.nodes.length };
      }catch(e){ /* try the next candidate */ }
    }
  }
  return null;
}

/* Turn the waypoint list into something we can sample at any distance along it. */
function buildPath(nodes, dep, arr){
  const clean = [];
  for (const n of nodes){
    const lat = +n.lat, lon = +n.lon;
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90) continue;
    if (clean.length && distance(clean[clean.length-1], {lat,lon}) < 400) continue;
    clean.push({ lat, lon, ident:(n.ident||"").trim(), type:n.type||"", alt:+n.alt||0 });
  }
  if (clean.length < 4) return null;
  /* The plan should actually start and end at the airports we asked about. */
  if (distance(clean[0], dep) > 150000) clean.unshift({lat:dep.lat, lon:dep.lon, ident:dep.iata, type:"APT", alt:0});
  if (distance(clean[clean.length-1], arr) > 150000) clean.push({lat:arr.lat, lon:arr.lon, ident:arr.iata, type:"APT", alt:0});

  const cum = [0];
  for (let i=1;i<clean.length;i++) cum.push(cum[i-1] + distance(clean[i-1], clean[i]));
  const total = cum[cum.length-1];
  if (!(total > 0)) return null;

  return {
    nodes: clean, cum, total,
    /* point at distance d along the polyline, with the bearing of its leg */
    at(d){
      const x = clamp(d, 0, total);
      let i = 1;
      while (i < cum.length-1 && cum[i] < x) i++;
      const span = Math.max(1, cum[i] - cum[i-1]);
      const f = clamp((x - cum[i-1]) / span, 0, 1);
      const p = interp(clean[i-1], clean[i], f);
      return { lat:p.lat, lon:p.lon, brg: bearing(clean[i-1], clean[i]), leg:i };
    },
    /* the named waypoint nearest a distance along track — used in the log */
    identAt(d){
      let best = null, bd = Infinity;
      for (let i=0;i<clean.length;i++){
        const gap = Math.abs(cum[i] - d);
        if (gap < bd && clean[i].ident && /FIX|VOR|NDB|LATLON/.test(clean[i].type)){ bd = gap; best = clean[i]; }
      }
      return best && bd < 140000 ? best : null;
    }
  };
}

function buildRoute(dep, arr, depDate, opts, filed){
  const path   = filed && filed.path;
  const gcM    = distance(dep, arr);
  const distM  = path ? path.total : gcM;
  const distNM = distM/NM;
  const trk    = bearing(dep, arr);
  /* If the filed plan carries a believable cruise level, it beats our guess. */
  const filedFL = filed && filed.cruiseFt >= 10000 ? Math.round(filed.cruiseFt/1000)*10 : null;
  const cruise = opts.fl === "auto" ? (filedFL || autoCruiseFL(distNM, trk)) : +opts.fl;
  const cruiseFt = cruise*100;
  const tas    = TAS[opts.acft] || 450;

  /* Climb and descent geometry — roughly 320 ft/nm up, 300 ft/nm down,
     squeezed proportionally if the leg is too short to reach cruise. */
  let climbNM = cruiseFt/320, descNM = cruiseFt/300;
  let topFt = cruiseFt;
  if (climbNM + descNM > distNM*0.92){
    const k = distNM*0.92/(climbNM+descNM);
    climbNM *= k; descNM *= k;
    topFt = Math.round(climbNM*320/500)*500;
  }
  const floorFt = Math.max(1200, (dep.elev + arr.elev)/2 + 900);
  const altAt = nm => {
    if (nm <= climbNM)          return Math.max(floorFt, topFt * Math.pow(nm/climbNM, 0.72));
    if (nm >= distNM - descNM)  return Math.max(floorFt, topFt * Math.pow((distNM-nm)/descNM, 0.85));
    return topFt;
  };

  /* one resolution knob: the cross-track stencil half-width, in km.
     Along-track spacing is tied to it so the sampled grid stays roughly isotropic. */
  const scaleKm = clamp(+opts.scaleKm || 90, 20, 200);
  const OFF     = scaleKm * 1000;                 // ± cross-track finite-difference stencil
  /* Along-track spacing. Roughly one sample per half the stencil width, with a
     floor high enough that even a short hop gets a real profile rather than a
     handful of points joined by straight lines.

     The ceiling is a budget, not a resolution choice: every sample point costs
     three model profiles per model, and Open-Meteo's free tier is metered per
     minute. Past ~44 the extra points buy little on an ultra-long-haul leg —
     they are already 130 nm apart — but they reliably trip the rate limit. */
  const n = clamp(Math.round(distNM / Math.max(20, scaleKm * 1.05)), 16, 44);

  /* Position along the route at fraction f — the filed path if we have one,
     otherwise the great circle. Bearing comes from the local leg either way. */
  const posAt = f => {
    if (path) return path.at(distM * f);
    const pt = interp(dep, arr, f);
    const b  = bearing(interp(dep, arr, Math.max(0, f-0.004)), interp(dep, arr, Math.min(1, f+0.004)));
    return { lat:pt.lat, lon:pt.lon, brg:b };
  };

  const wp = [];
  for (let i=0; i<n; i++){
    const f  = i/(n-1);
    const pt = posAt(f);
    const nm = distNM * f;
    const b  = pt.brg;
    const named = path ? path.identAt(distM*f) : null;
    wp.push({
      i, frac:f, lat:pt.lat, lon:pt.lon, nm, distM: distM*f, brg:b,
      fix: named ? named.ident : null,
      altFt: Math.round(altAt(nm)),
      left:  destPoint(pt, (b+270)%360, OFF),
      right: destPoint(pt, (b+90)%360,  OFF),
      phase: i===0 ? "takeoff" : i===n-1 ? "landing"
           : nm <= climbNM ? "climb" : nm >= distNM-descNM ? "descent" : "cruise"
    });
  }
  /* first-pass timing with still air, refined later using forecast winds */
  let t = depDate.getTime() + 8*60000;             // ~8 min taxi + takeoff roll
  for (let i=0;i<n;i++){
    if (i>0){
      const segNM = wp[i].nm - wp[i-1].nm;
      const ph = wp[i].phase, gs = ph==="cruise" ? tas : ph==="climb"||ph==="takeoff" ? tas*0.62 : tas*0.74;
      t += segNM/gs*3600e3;
    }
    wp[i].time = new Date(t);
  }
  return { dep, arr, distM, distNM, trk, cruiseFL:Math.round(topFt/100), topFt, tas, wp,
           climbNM, descNM, scaleKm, offM:OFF, opts,
           filed: filed || null, gcNM: gcM/NM,
           extraNM: path ? Math.max(0, distNM - gcM/NM) : 0 };
}

/* ══════════ MODEL DATA ══════════════════════════════════════════════════ */

const OM = "https://api.open-meteo.com/v1/forecast";
const PLVARS = LEVELS.flatMap(l => [`temperature_${l.p}hPa`,`wind_speed_${l.p}hPa`,`wind_direction_${l.p}hPa`,`geopotential_height_${l.p}hPa`]);

/* A wall-clock budget for the whole fetch phase. Retrying through a saturated
   rate-limit window can otherwise take minutes; one model and a stated lower
   confidence beats a spinner that will not end. */
let FETCH_DEADLINE = Infinity;
const outOfTime = () => Date.now() > FETCH_DEADLINE;

async function getJSON(url, tries=3){
  let last;
  for (let k=0;k<tries;k++){
    try{
      const r = await fetch(url, {headers:{Accept:"application/json"}});
      if (!r.ok){
        last = new Error(`${r.status} ${(await r.text()).slice(0,180)}`);
        /* Open-Meteo's free tier limits requests per minute, and a dense route
           can brush it. The window is a minute wide, so a couple of seconds of
           backoff is useless — wait long enough to actually clear it, which is
           the difference between two models and one. */
        if (r.status === 429 || r.status >= 500){
          if (outOfTime()) break;
          await new Promise(s => setTimeout(s, r.status === 429 ? 9000*(k+1) : 1200*(k+1)));
          continue;
        }
        continue;
      }
      return await r.json();
    }catch(e){ last = e; }
    await new Promise(s => setTimeout(s, 450));
  }
  throw last || new Error("network");
}
const chunk = (a,n) => { const o=[]; for(let i=0;i<a.length;i+=n) o.push(a.slice(i,i+n)); return o; };

/* Pull pressure-level profiles for every sample point from one model.

   Bounded by hour rather than by whole days. Open-Meteo's free-tier limit is
   weighted by variables × locations × hours, and a dense route is exactly the
   thing that trips it; asking for the 14 hours around the flight instead of two
   full calendar days is what keeps a second model affordable. */
async function fetchModel(points, model, h0, h1){
  const out = [];
  const groups = chunk(points, 12);
  for (let g=0; g<groups.length; g++){
    const q = new URLSearchParams({
      latitude:  groups[g].map(p => p.lat.toFixed(4)).join(","),
      longitude: groups[g].map(p => p.lon.toFixed(4)).join(","),
      hourly: PLVARS.join(","),
      start_hour: h0, end_hour: h1,
      wind_speed_unit: "ms", timeformat: "unixtime", timezone: "UTC", cell_selection: "nearest"
    });
    if (model) q.set("models", model);
    const j = await getJSON(`${OM}?${q}`);
    (Array.isArray(j) ? j : [j]).forEach(r => out.push(r));
    if (g < groups.length-1) await new Promise(s => setTimeout(s, 120));  // smooth the burst
  }
  return out;
}

/* Surface fields: convective available potential energy and precipitation. */
async function fetchSurface(points, h0, h1){
  const out = [];
  for (const grp of chunk(points, 20)){
    const q = new URLSearchParams({
      latitude:  grp.map(p => p.lat.toFixed(4)).join(","),
      longitude: grp.map(p => p.lon.toFixed(4)).join(","),
      hourly: "cape,precipitation,cloud_cover_low,cloud_cover_mid,cloud_cover_high", start_hour: h0, end_hour: h1,
      timeformat: "unixtime", timezone: "UTC", cell_selection: "nearest"
    });
    const j = await getJSON(`${OM}?${q}`);
    (Array.isArray(j) ? j : [j]).forEach(r => out.push(r));
  }
  return out;
}

/* 90 m terrain along the ground track, for the mountain-wave check.
   `sampleAt(f)` follows the filed route when there is one, so the ridges we
   measure are the ridges actually overflown. */
async function fetchTerrain(sampleAt, count=90){
  const pts = Array.from({length:count}, (_,i) => sampleAt(i/(count-1)));
  const out = [];
  for (const grp of chunk(pts, 90)){
    const q = new URLSearchParams({
      latitude: grp.map(p=>p.lat.toFixed(4)).join(","),
      longitude: grp.map(p=>p.lon.toFixed(4)).join(",")
    });
    const j = await getJSON(`https://api.open-meteo.com/v1/elevation?${q}`, 1);
    (j.elevation || []).forEach(e => out.push(e));
  }
  return out.length === count ? out : null;
}

/* Live international SIGMETs — best effort, silently skipped if unreachable. */
async function fetchSigmets(){
  try{
    const c = new AbortController(); setTimeout(()=>c.abort(), 6000);
    const r = await fetch("https://aviationweather.gov/api/data/isigmet?format=json", {signal:c.signal});
    if (!r.ok) return null;
    const j = await r.json();
    return Array.isArray(j) ? j.filter(s => /TURB|CAT|MTW/i.test(s.hazard || "")) : null;
  }catch{ return null; }
}

/* ══════════ SAMPLING HELPERS ═══════════════════════════════════════════ */

/* Linear-in-time read of an hourly series at an arbitrary instant. */
function atTime(series, times, tSec){
  if (!series || !times || !times.length) return null;
  if (tSec <= times[0]) return num(series[0]);
  const last = times.length-1;
  if (tSec >= times[last]) return num(series[last]);
  let lo = 0, hi = last;
  while (hi - lo > 1){ const m = (lo+hi)>>1; if (times[m] <= tSec) lo = m; else hi = m; }
  const a = num(series[lo]), b = num(series[hi]);
  if (a === null) return b; if (b === null) return a;
  const f = (tSec - times[lo]) / (times[hi] - times[lo] || 1);
  return a + (b-a)*f;
}
const num = v => (v === null || v === undefined || Number.isNaN(v)) ? null : +v;

/* Vertical profile at one sample point and one instant. */
function profileAt(rec, tSec){
  if (!rec || !rec.hourly) return null;
  const H = rec.hourly, T = H.time;
  const lv = [];
  for (const L of LEVELS){
    const t  = atTime(H[`temperature_${L.p}hPa`], T, tSec);
    const ws = atTime(H[`wind_speed_${L.p}hPa`], T, tSec);
    const wd = atTime(H[`wind_direction_${L.p}hPa`], T, tSec);
    let   z  = atTime(H[`geopotential_height_${L.p}hPa`], T, tSec);
    if (t === null || ws === null || wd === null) { lv.push(null); continue; }
    if (z === null) z = L.fl*100*FT;
    const th = rad(wd);
    lv.push({
      p:L.p, z, ft:z/FT,
      T: t + 273.15,
      theta: (t + 273.15) * Math.pow(1000/L.p, KAPPA),
      spd: ws,
      u: -ws*Math.sin(th),      // meteorological direction is where wind comes FROM
      v: -ws*Math.cos(th)
    });
  }
  return lv;
}

/* ══════════ TURBULENCE DIAGNOSTICS ═════════════════════════════════════ */

/* Each diagnostic is remapped onto the EDR scale with a power law anchored on
   the conventional light / moderate / severe thresholds for that quantity. */
const edrFromTI1 = ti1e7 => ti1e7 <= 0 ? 0 : clamp(0.0473 * Math.pow(ti1e7, 0.729), 0, 1);      // 10^-7 s^-2
const edrFromVWS = vwsKm => vwsKm <= 0 ? 0 : clamp(0.0214 * Math.pow(vwsKm, 1.28), 0, 1);       // m/s per km
const edrFromRi  = ri => ri === null ? 0 : ri < 0 ? 0.52 : clamp(0.50/Math.pow(1+ri, 0.9), 0, 1);

/* Layer-by-layer clear-air diagnostics for one waypoint, one model. */
function layerCAT(C, L, R, P, N, dsAlong, dnCross, brg){
  const out = [];
  const sb = Math.sin(rad(brg)), cb = Math.cos(rad(brg));
  for (let k=0; k<LEVELS.length-1; k++){
    const a = C[k], b = C[k+1];
    if (!a || !b) { out.push(null); continue; }
    const dz = b.z - a.z;
    if (!(dz > 50)) { out.push(null); continue; }

    /* vertical wind shear and static stability */
    const du = b.u - a.u, dv = b.v - a.v;
    const vws  = Math.hypot(du, dv) / dz;                        // s^-1
    const thm  = (a.theta + b.theta)/2;
    const N2   = (G/thm) * (b.theta - a.theta) / dz;             // s^-2
    const Ri   = vws > 1e-6 ? N2/(vws*vws) : 999;

    /* horizontal gradients of the layer-mean wind, from the 4-point stencil */
    const um = (a.u+b.u)/2, vm = (a.v+b.v)/2;
    const mean = (X) => (X && X[k] && X[k+1]) ? [ (X[k].u+X[k+1].u)/2, (X[k].v+X[k+1].v)/2 ] : null;
    const mL = mean(L), mR = mean(R), mP = mean(P), mN = mean(N);
    let DEF = 0, CVG = 0, ok = false;
    if (mL && mR && dnCross > 0){
      const du_dn = (mR[0]-mL[0])/dnCross, dv_dn = (mR[1]-mL[1])/dnCross;
      let du_ds = 0, dv_ds = 0;
      if (mP && mN && dsAlong > 0){ du_ds = (mN[0]-mP[0])/dsAlong; dv_ds = (mN[1]-mP[1])/dsAlong; }
      else if (mN && dsAlong > 0){ du_ds = (mN[0]-um)/dsAlong; dv_ds = (mN[1]-vm)/dsAlong; }
      else if (mP && dsAlong > 0){ du_ds = (um-mP[0])/dsAlong; dv_ds = (vm-mP[1])/dsAlong; }
      /* rotate track-relative gradients into earth coordinates */
      const du_dx = sb*du_ds + cb*du_dn, du_dy = cb*du_ds - sb*du_dn;
      const dv_dx = sb*dv_ds + cb*dv_dn, dv_dy = cb*dv_ds - sb*dv_dn;
      const DSH = dv_dx + du_dy, DST = du_dx - dv_dy;
      DEF = Math.hypot(DSH, DST);
      CVG = -(du_dx + dv_dy);
      ok = true;
    }
    const TI1 = ok ? vws*DEF*1e7 : 0;
    const TI2 = ok ? vws*(DEF + Math.max(0,CVG))*1e7 : 0;

    const eT = edrFromTI1(Math.max(TI1, TI2*0.85));
    const eS = edrFromVWS(vws*1000);
    const eR = edrFromRi(Ri);
    const mean3 = 0.40*eT + 0.25*eS + 0.35*eR;
    const peak  = Math.max(eT, eS, eR);
    out.push({
      ft: (a.ft + b.ft)/2, z:(a.z+b.z)/2,
      edr: clamp(0.70*mean3 + 0.30*peak, 0, 1),
      vws: vws*1000, Ri, N2, TI1, DEF: DEF*1e5, CVG: CVG*1e5,
      spd: (a.spd+b.spd)/2, dir: (deg(Math.atan2(-(a.u+b.u), -(a.v+b.v)))+360)%360
    });
  }
  return out;
}

/* Tropopause: the coldest level in the upper troposphere is a good proxy. */
function tropopause(C){
  let best = null;
  for (let k=0;k<LEVELS.length;k++){
    const l = C[k]; if (!l || l.p > 400 || l.p < 80) continue;
    if (!best || l.T < best.T) best = l;
  }
  if (!best) return null;
  const fl = best.ft/100;
  return (fl > 220 && fl < 600) ? { ft: best.ft, p: best.p } : null;
}
function jetCore(C){
  let best = null;
  for (const l of C){ if (!l || l.p > 450 || l.p < 120) continue; if (!best || l.spd > best.spd) best = l; }
  return best && best.spd >= 35 ? { ft:best.ft, spd:best.spd, p:best.p } : null;
}
