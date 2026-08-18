"use strict";
/* ══════════ MOUNTAIN WAVE & CONVECTION ═════════════════════════════════ */

/* Terrain statistics in a window either side of a waypoint. */
function terrainStats(elev, distM, frac, windowM = 90000){
  if (!elev) return null;
  const n = elev.length, step = distM/(n-1);
  const c = frac*(n-1), w = Math.max(2, windowM/step);
  const lo = Math.max(0, Math.round(c-w)), hi = Math.min(n-1, Math.round(c+w));
  let mx=-1e9, mn=1e9, slope=0;
  for (let i=lo;i<=hi;i++){ const e = Math.max(0, elev[i]); if (e>mx) mx=e; if (e<mn) mn=e; }
  for (let i=Math.max(1,lo);i<=hi;i++) slope = Math.max(slope, Math.abs(elev[i]-elev[i-1])/step);
  return { peak:mx, floor:mn, relief:mx-mn, slope, terrainFt:mx/FT };
}

/* Mountain-wave turbulence proxy: cross-barrier flow over relief in a stable
   layer, propagating upward and amplifying near the tropopause. */
function mountainWave(C, ts, alongWindComp, tropFt){
  if (!ts || ts.relief < 350) return { edrAt: () => 0, amp: 0, ts };
  const low = C.find(l => l && l.p === 700) || C.find(l => l && l.p === 850);
  const upr = C.find(l => l && l.p === 500);
  if (!low) return { edrAt: () => 0, amp: 0, ts };
  const Ucross = Math.abs(alongWindComp);                                     // m/s across the ridge line
  let N = 0.011;
  if (low && upr && upr.z > low.z) N = Math.sqrt(Math.max(1e-6, (G/((low.theta+upr.theta)/2))*(upr.theta-low.theta)/(upr.z-low.z)));
  const critical = upr && low && (low.u*upr.u + low.v*upr.v) < 0;             // wind reversal blocks propagation
  const amp = clamp((ts.relief/900) * (Ucross/14) * (N/0.011) * (critical ? 0.25 : 1), 0, 3.2);
  const base = clamp(0.40 * Math.pow(amp, 0.8), 0, 0.85);
  const topFt = ts.terrainFt;
  return {
    amp, ts, Ucross, N, critical,
    edrAt(ft){
      if (amp < 0.12) return 0;
      if (ft < topFt + 1500) return base*0.5;
      const dTrop = tropFt ? (ft - tropFt)/8000 : 1.6;
      const shape = 0.32 + 0.68*Math.exp(-dTrop*dTrop);                       // peaks at the tropopause
      const decay = Math.exp(-Math.max(0, ft - topFt - 30000)/26000);
      return clamp(base*shape*decay, 0, 0.9);
    }
  };
}

/* Convective turbulence proxy from CAPE and precipitation. */
function convective(cape, precip, tropFt){
  const cp = Math.max(0, cape || 0);
  if (cp < 250) return { edrAt: () => 0, cape: cp, topFt: 0 };
  const strength = clamp(0.34*Math.sqrt(cp/1400) + (precip > 0.4 ? 0.06 : 0), 0, 0.85);
  const topFt = (tropFt || 38000) * clamp(0.62 + 0.38*(cp/2500), 0.62, 1.0);
  return {
    cape: cp, topFt, strength,
    edrAt(ft){
      if (ft <= topFt) return strength * clamp(0.45 + 0.55*(ft/Math.max(1,topFt)), 0, 1);
      const over = (ft - topFt)/6000;                                        // gravity waves above the anvil
      return strength * Math.exp(-over*over) * 0.75;
    }
  };
}

/* ══════════ PLACE LABELS ═══════════════════════════════════════════════ */
const COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
/* Rough bounding boxes, checked most specific first, so open-water waypoints
   get a name a passenger recognises instead of a distance to a small airfield. */
const SEAS = [
  ["the Mediterranean",  30, 46, -6, 36],   ["the Black Sea",      40, 48, 27, 42],
  ["the Red Sea",        12, 30, 32, 44],   ["the Persian Gulf",   23, 31, 47, 58],
  ["the Baltic",         53, 66, 9, 30],    ["the North Sea",      51, 62, -5, 10],
  ["the Norwegian Sea",  62, 76, -12, 20],  ["the Labrador Sea",   52, 67, -64, -43],
  ["the Gulf of Mexico", 18, 31, -98, -80], ["the Caribbean",       8, 23, -88, -59],
  ["the Bay of Bengal",   5, 23, 79, 95],   ["the Arabian Sea",     5, 25, 52, 78],
  ["the South China Sea", 2, 24, 105, 121], ["the Sea of Japan",   34, 52, 127, 142],
  ["the Bering Sea",     52, 66, 162, 200], ["the Gulf of Alaska", 52, 62, -160, -134],
  ["the Coral Sea",     -25, -9, 145, 165], ["the Tasman Sea",    -45,-30, 150, 175],
  ["the Barents Sea",    68, 80, 18, 60],   ["the Sea of Okhotsk", 45, 62, 138, 162],
  ["the North Atlantic",  8, 68, -80, -5],  ["the South Atlantic",-58,  8, -60, 20],
  ["the North Pacific",  10, 62, 120, 250], ["the South Pacific", -58, 10, 130, 290],
  ["the Indian Ocean",  -58, 25, 20, 120],  ["the Arctic Ocean",   72, 90, -180, 180],
  ["the Southern Ocean",-90,-56, -180, 180]
];
function seaName(lat, lon){
  const l2 = lon < 0 ? lon + 360 : lon;
  for (const [n, s, nth, w, e] of SEAS){
    if (lat < s || lat > nth) continue;
    if (w > 180 || e > 180){ const a = w<0?w+360:w, b = e<0?e+360:e; if (l2 >= a && l2 <= b) return n; }
    else if (lon >= w && lon <= e) return n;
  }
  return "open water";
}
function nearestPlace(pt, groundM){
  let near = null, nd = Infinity, big = null, bg = Infinity;
  for (const a of APORTS){
    if (a.rank > 1) continue;
    const d = distance(pt, a);
    if (d < nd){ nd = d; near = a; }
    if (a.rank === 0 && d < bg){ bg = d; big = a; }
  }
  if (!near) return { text:"En route", short:"En route" };
  /* close in, any airport names the place; far out, only a city worth knowing does */
  const useBig = nd/1000 >= 230 && big;
  const best = useBig ? big : near, bd = useBig ? bg : nd;
  const km = bd/1000, city = best.city || best.name;
  if (km < 55)  return { text:`Over ${city}`, short:city, ap:best, km };
  if (km < 230) return { text:`Near ${city}, ${cName(best.cc)}`, short:city, ap:best, km };
  const brg = bearing(best, pt), c = COMPASS[Math.round(brg/22.5)%16];
  if (groundM !== null && groundM !== undefined && groundM <= 2){
    const sea = seaName(pt.lat, pt.lon);
    return { text:`Over ${sea} — ${Math.round(km)} km ${c} of ${city}`, short:sea.replace(/^the /,""), ap:best, km, sea };
  }
  return { text:`${Math.round(km)} km ${c} of ${city}`, short:`${c} of ${city}`, ap:best, km };
}

/* ══════════ MAIN ANALYSIS ══════════════════════════════════════════════ */

async function analyse(route, progress){
  const { dep, arr, wp } = route;
  const say = (pct, msg) => progress && progress(pct, msg);

  /* sample points: centre, left, right for every waypoint */
  const points = [];
  wp.forEach(w => { points.push({lat:w.lat, lon:w.lon}); points.push(w.left); points.push(w.right); });

  const t0 = wp[0].time, t1 = wp[wp.length-1].time;
  /* Margins either side: the wind-corrected timing pass can push the arrival
     later than this first estimate, and the series must still bracket it. */
  const d0 = hourISO(new Date(t0.getTime() - 2*3600e3));
  const d1 = hourISO(new Date(t1.getTime() + 4*3600e3));
  const lead = (t0 - Date.now())/3600e3;
  if (lead > 175) throw new Error("That departure is beyond the 7-day forecast window. Pick a date within the next week.");
  if (lead < -6)  throw new Error("That departure is in the past. Pick a future date and time.");

  say(10, "Requesting GFS pressure-level data…");
  FETCH_DEADLINE = Date.now() + 75000;
  const models = [], used = [];
  const tryModel = async (id, label) => {
    try { const r = await fetchModel(points, id, d0, d1); if (r.length === points.length){ models.push(r); used.push(label); } }
    catch(e){ console.warn(label, e.message); }
  };
  await tryModel("gfs_seamless", "NOAA GFS 0.25°");
  /* Only reach for a second model if there is time left in the budget — the
     ensemble is a confidence refinement, not a prerequisite. */
  if (!outOfTime()){
    say(40, "Requesting ECMWF pressure-level data…");
    await tryModel("ecmwf_ifs025", "ECMWF IFS 0.25°");
  } else if (models.length){
    say(55, "Rate limit reached — continuing with one model…");
  }
  if (!models.length){
    FETCH_DEADLINE = Date.now() + 40000;                  // fresh budget for the fallback
    say(45, "Falling back to the default model blend…");
    await tryModel("", "Open-Meteo best match");
  }
  if (!models.length) throw new Error("The weather service is rate-limiting or unreachable. It allows a limited number of requests per minute — wait a minute and try again, or move the analysis-scale slider right to ask for fewer sample points.");
  FETCH_DEADLINE = Date.now() + 45000;                    // budget for terrain and surface

  say(62, "Reading terrain and convective fields…");
  const [surface, elev, sigmets] = await Promise.all([
    fetchSurface(wp.map(w=>({lat:w.lat,lon:w.lon})).concat(wp.map(w=>w.left)), d0, d1).catch(()=>null),
    fetchTerrain(f => {
      if (route.filed && route.filed.path) return route.filed.path.at(route.distM * f);
      return interp(dep, arr, f);
    }, 90).catch(()=>null),
    fetchSigmets()
  ]);

  /* ── wind-corrected timing: second pass over the ETAs ── */
  say(72, "Correcting timings for forecast winds…");
  const m0 = models[0];
  const cruiseFt = route.topFt;
  const windAt = (idx, ft, tSec) => {
    const prof = profileAt(m0[idx*3], tSec);
    if (!prof) return null;
    let best = null, bd = Infinity;
    for (const l of prof){ if (!l) continue; const d = Math.abs(l.ft - ft); if (d < bd){ bd = d; best = l; } }
    return best;
  };
  let tAcc = wp[0].time.getTime();
  for (let i=1;i<wp.length;i++){
    const segNM = wp[i].nm - wp[i-1].nm;
    const ph = wp[i].phase;
    const tasSeg = ph==="cruise" ? route.tas : (ph==="climb"||ph==="takeoff") ? route.tas*0.62 : route.tas*0.74;
    const w = windAt(i, wp[i].altFt, tAcc/1000);
    let comp = 0;
    if (w){ const b = rad(wp[i].brg); comp = (w.u*Math.sin(b) + w.v*Math.cos(b))*1.94384; }  // + = tailwind, kt
    const gs = Math.max(180, tasSeg + comp);
    tAcc += segNM/gs*3600e3;
    wp[i].time = new Date(tAcc);
    wp[i].gs = Math.round(gs); wp[i].windComp = Math.round(comp);
  }
  wp[0].gs = 0; wp[0].windComp = wp[1] ? wp[1].windComp : 0;

  /* ── per-waypoint diagnostics ── */
  say(82, "Computing shear, deformation and stability…");
  const gridFL = [];
  for (let k=0;k<LEVELS.length-1;k++) gridFL.push((LEVELS[k].fl + LEVELS[k+1].fl)/2);

  wp.forEach((w, i) => {
    const tSec = w.time.getTime()/1000;
    const perModel = [];
    for (const M of models){
      const C = profileAt(M[i*3],   tSec);
      const L = profileAt(M[i*3+1], tSec);
      const R = profileAt(M[i*3+2], tSec);
      if (!C) continue;
      const P = i>0            ? profileAt(M[(i-1)*3], tSec) : null;
      const N = i<wp.length-1  ? profileAt(M[(i+1)*3], tSec) : null;
      const dsAlong = (i>0 && i<wp.length-1) ? (wp[i+1].distM - wp[i-1].distM)
                    : i===0 ? (wp[1].distM - wp[0].distM) : (wp[i].distM - wp[i-1].distM);
      perModel.push({ C, layers: layerCAT(C, L, R, P, N, dsAlong, 180000, w.brg),
                      trop: tropopause(C), jet: jetCore(C) });
    }
    if (!perModel.length){ w.dead = true; return; }

    /* ensemble mean and spread over the models we actually got */
    const nk = LEVELS.length-1, col = [], spread = [];
    for (let k=0;k<nk;k++){
      const vals = perModel.map(m => m.layers[k]).filter(Boolean);
      if (!vals.length){ col.push(null); spread.push(0); continue; }
      const e = vals.map(v => v.edr);
      const mean = e.reduce((a,b)=>a+b,0)/e.length;
      spread.push(e.length>1 ? Math.max(...e)-Math.min(...e) : 0.06);
      const pick = vals[0];
      col.push({ ...pick, edr: mean, ft: vals.reduce((a,v)=>a+v.ft,0)/vals.length });
    }
    w.trop = perModel[0].trop; w.jet = perModel[0].jet;
    w.C = perModel[0].C;

    /* terrain + convection modifiers */
    /* Terrain window is deliberately NOT tied to the analysis scale. Relief measured over a
       wider window is always larger, so letting the slider widen it would inflate the wave term
       instead of resolving it. Ridges that launch waves reaching cruise height have their own
       scale, ~90 km, so that is held fixed. */
    const ts = terrainStats(elev, route.distM, w.frac, 90000);
    const low = w.C.find(l => l && l.p===700) || w.C.find(l => l && l.p===850);
    const b = rad(w.brg);
    const alongWind = low ? (low.u*Math.sin(b) + low.v*Math.cos(b)) : 0;
    const mw = mountainWave(w.C, ts, alongWind, w.trop && w.trop.ft);
    let cape = 0, prcp = 0;
    /* Cloud cover is not a turbulence input — it is what decides whether there
       is anything to see out of the window. Averaged, not maxed, because the
       question is how much of the view is blocked. */
    let cLow = null, cMid = null, cHigh = null;
    if (surface){
      const rd = [surface[i], surface[wp.length+i]].filter(Boolean);
      const cl = [], cm = [], ch = [];
      for (const r of rd){
        const H = r.hourly, T = H && H.time;
        const c = atTime(H && H.cape, T, tSec);
        const p = atTime(H && H.precipitation, T, tSec);
        if (c !== null) cape = Math.max(cape, c);
        if (p !== null) prcp = Math.max(prcp, p);
        const lo = atTime(H && H.cloud_cover_low,  T, tSec);
        const mi = atTime(H && H.cloud_cover_mid,  T, tSec);
        const hi = atTime(H && H.cloud_cover_high, T, tSec);
        if (lo !== null) cl.push(lo);
        if (mi !== null) cm.push(mi);
        if (hi !== null) ch.push(hi);
      }
      const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
      cLow = avg(cl); cMid = avg(cm); cHigh = avg(ch);
    }
    const cv = convective(cape, prcp, w.trop && w.trop.ft);

    /* combine sources on every level of the column */
    w.column = col.map((c, k) => {
      const ft = c ? c.ft : gridFL[k]*100;
      const cat = c ? c.edr : 0;
      const mwt = mw.edrAt(ft), con = cv.edrAt(ft);
      const parts = [cat, mwt, con].sort((a,b)=>b-a);
      const total = clamp(parts[0] + 0.35*parts[1] + 0.2*parts[2], 0, 1);
      return { ft, fl: ft/100, cat, mwt, con, edr: total, d: c, spread: spread[k] };
    });

    /* value at the actual flight level */
    const at = ftQuery => {
      const cs = w.column.filter(c => c.d || c.edr > 0);
      if (!cs.length) return w.column[0];
      let lo = null, hi = null;
      for (const c of w.column){ if (c.ft <= ftQuery && (!lo || c.ft > lo.ft)) lo = c; if (c.ft >= ftQuery && (!hi || c.ft < hi.ft)) hi = c; }
      if (lo && hi && hi.ft > lo.ft){ const f = (ftQuery-lo.ft)/(hi.ft-lo.ft);
        return { ...lo, edr: lerp(lo.edr, hi.edr, f), cat: lerp(lo.cat, hi.cat, f),
                 mwt: lerp(lo.mwt, hi.mwt, f), con: lerp(lo.con, hi.con, f),
                 spread: lerp(lo.spread, hi.spread, f), d: (f<0.5?lo.d:hi.d) };
      }
      return lo || hi || w.column[0];
    };
    const here = at(w.altFt);
    /* below ~8000 ft the low-level layers are poorly represented — taper */
    const lowTaper = w.altFt < 8000 ? clamp(0.45 + w.altFt/16000, 0.45, 1) : 1;
    w.edr  = clamp(here.edr * lowTaper, 0, 1);
    w.cat  = here.cat*lowTaper; w.mwt = here.mwt*lowTaper; w.con = here.con*lowTaper;
    w.spread = here.spread; w.diag = here.d || null;
    w.mw = mw; w.cv = cv; w.ts = ts; w.cape = cape; w.precip = prcp;
    w.cloud = { low:cLow, mid:cMid, high:cHigh };
    w.band = band(w.edr);
    w.place = (i===0 || i===wp.length-1)
      ? (ap => ({ text:`${ap.name}${ap.city?", "+ap.city:""} (${ap.iata})`, short:ap.iata, ap, km:0 }))(i===0?dep:arr)
      : nearestPlace(w, elev ? elev[clamp(Math.round(w.frac*(elev.length-1)),0,elev.length-1)] : null);
  });

  /* ── cruise-level comparison ── */
  say(92, "Scoring alternative flight levels…");
  let cruiseWp = wp.filter(w => w.phase === "cruise" && w.column);
  if (cruiseWp.length < 3) cruiseWp = wp.filter(w => w.column).sort((a,b)=>b.altFt-a.altFt).slice(0,4);
  const levelScores = [];
  for (let fl=180; fl<=430; fl+=10){
    const ft = fl*100, vals = [];
    for (const w of cruiseWp){
      let lo=null, hi=null;
      for (const c of w.column){ if (c.ft<=ft && (!lo||c.ft>lo.ft)) lo=c; if (c.ft>=ft && (!hi||c.ft<hi.ft)) hi=c; }
      if (lo && hi && hi.ft>lo.ft) vals.push(lerp(lo.edr, hi.edr, (ft-lo.ft)/(hi.ft-lo.ft)));
      else if (lo||hi) vals.push((lo||hi).edr);
    }
    if (vals.length) levelScores.push({ fl, mean: vals.reduce((a,b)=>a+b,0)/vals.length, max: Math.max(...vals) });
  }
  /* A level change is a step of a few thousand feet, not a different plan.
     Only levels the aircraft could realistically be given are considered. */
  const cruiseNow = route.topFt/100;
  const usable = levelScores.filter(l => Math.abs(l.fl - cruiseNow) <= 40 && l.fl >= 200 && l.fl <= 410);
  const bestFL = usable.length ? usable.reduce((a,b) => (b.mean*0.65+b.max*0.35) < (a.mean*0.65+a.max*0.35) ? b : a) : null;
  const showLo = clamp(Math.round((cruiseNow-60)/10)*10, 180, 380);
  const showHi = clamp(showLo+120, 240, 430);

  /* ── overall verdict ── */
  const live = wp.filter(w => !w.dead && w.edr !== undefined);
  const edrs = live.map(w => w.edr);
  const peak = Math.max(...edrs, 0);
  const timeW = live.map((w,i) => i===0?0:(w.time-live[i-1].time)/60000);
  const totalMin = timeW.reduce((a,b)=>a+b,0) || 1;
  const meanEdr = live.reduce((s,w,i) => s + w.edr*(timeW[i]||0), 0)/totalMin;
  const roughMin = live.reduce((s,w,i) => s + ((w.edr >= 0.16) ? (timeW[i]||0) : 0), 0);
  const bumpyMin = live.reduce((s,w,i) => s + ((w.edr >= 0.26) ? (timeW[i]||0) : 0), 0);

  const aFactor = (ACFT[route.opts.acft] || ACFT.narrow).f;
  const felt = clamp(peak*aFactor, 0, 1);
  const pen = 145*Math.max(0, meanEdr-0.04) + 74*Math.max(0, peak-0.10) + 22*(roughMin/totalMin);
  const score = Math.round(clamp(100 - pen, 0, 100));

  /* confidence: forecast age, model agreement, sample density */
  const meanSpread = live.reduce((s,w)=>s+(w.spread||0),0)/Math.max(1,live.length);
  const leadPen  = clamp(1 - Math.max(0, lead-12)/190, 0.3, 1);
  const agree    = clamp(1 - meanSpread/0.22, 0.25, 1);
  const modelBonus = models.length > 1 ? 1 : 0.86;
  const confidence = Math.round(clamp(100*(0.34 + 0.36*leadPen + 0.30*agree)*modelBonus, 18, 94));

  /* SIGMET intersection, if the service answered */
  let sigHit = null;
  if (sigmets && sigmets.length){
    const hits = sigmets.filter(s => {
      const c = (s.coords || []).map(p => ({lat:+p.lat, lon:+p.lon}));
      if (c.length < 3) return false;
      return live.some(w => pointInPoly(w, c));
    });
    if (hits.length) sigHit = hits.slice(0,3);
  }

  /* How far the filed track wanders from the straight line — the honest measure
     of what routing on the real path actually bought us. */
  let maxOffNM = 0;
  if (route.filed){
    const gcTot = distance(dep, arr);
    live.forEach(w => {
      const f = clamp(distance(dep, w)/gcTot, 0, 1);
      maxOffNM = Math.max(maxOffNM, distance(interp(dep, arr, f), w)/NM);
    });
  }

  return {
    route, wp, live, gridFL, levelScores, bestFL, showLo, showHi,
    peak, meanEdr, felt, score, roughMin, bumpyMin, totalMin, confidence, meanSpread,
    lead, models: used, elev, sigHit, maxOffNM,
    worst: live.reduce((a,w)=> w.edr > a.edr ? w : a, live[0]),
    trop: (live.find(w=>w.trop)||{}).trop || null,
    jet: live.map(w=>w.jet).filter(Boolean).sort((a,b)=>b.spd-a.spd)[0] || null,
    aFactor
  };
}

function pointInPoly(p, poly){
  let inside = false;
  for (let i=0,j=poly.length-1;i<poly.length;j=i++){
    const xi=poly[i].lon, yi=poly[i].lat, xj=poly[j].lon, yj=poly[j].lat;
    if (((yi>p.lat)!==(yj>p.lat)) && (p.lon < (xj-xi)*(p.lat-yi)/((yj-yi)||1e-9)+xi)) inside = !inside;
  }
  return inside;
}
