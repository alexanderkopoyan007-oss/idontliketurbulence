"use strict";
/* ══════════ WHAT'S OUT THE WINDOW ═══════════════════════════════════════
   The ride tape says how the flight will feel. This says what there is to look
   at, and — the part people actually want — which side to sit on.

   Everything here is geometry against the route the engine already built, so it
   costs no extra model requests. The one added fetch is the planetary K index,
   for aurora, and cloud-cover fields folded into the surface call that was
   happening anyway. */

/* ─── the gazetteer ─── */
/* Cells are a 1-degree grid; see src/data/features.js for the encoding and for
   why this is a mask rather than a bounding box. */
const CELL_DEG = 1, CELL_COLS = Math.round(360/CELL_DEG);
function cellId(lon, lat){
  const x = Math.floor((((lon + 180) % 360) + 360) % 360 / CELL_DEG);
  const y = Math.floor((clamp(lat, -90, 89.999) + 90) / CELL_DEG);
  return y*CELL_COLS + x;
}
function cellCentre(id){
  const y = Math.floor(id / CELL_COLS), x = id % CELL_COLS;
  return { lat: y*CELL_DEG - 90 + CELL_DEG/2, lon: x*CELL_DEG - 180 + CELL_DEG/2 };
}

const FEATURES = [];
const CELL_INDEX = new Map();          // cell id -> feature indices
FEAT_RAW.split("\n").forEach(l => {
  const p = l.split("|");
  if (p.length < 7) return;
  let prev = 0;
  const cells = p[6].split(",").map(d => (prev += parseInt(d, 36)));
  const idx = FEATURES.length;
  FEATURES.push({ name:p[0], cls:p[1], lon:+p[2], lat:+p[3], rank:+p[4], cells });
  for (const c of cells){
    let a = CELL_INDEX.get(c);
    if (!a) CELL_INDEX.set(c, a = []);
    a.push(idx);
  }
});

/* How far you can actually see. The geometric horizon from height h is
   d ≈ √(2Rh); with standard refraction the usual engineering form is
   3.57·√h_metres kilometres. From FL350 that is about 370 km — but haze and
   the shallow viewing angle mean anything past ~300 km is a smudge, so the
   labelled range is capped below the geometric limit rather than above it. */
function horizonKm(altFt){
  const h = Math.max(0, altFt*FT);
  return 3.57*Math.sqrt(h);
}

/* Everything whose mask covers this exact point — i.e. directly below. */
function featuresAt(pt){
  const ids = CELL_INDEX.get(cellId(pt.lon, pt.lat)) || [];
  return ids.map(i => FEATURES[i]);
}

function sideOf(relBrg){
  const r = ((relBrg % 360) + 360) % 360;
  if (r < 12 || r > 348) return { side:"ahead",  seats:"any window" };
  if (r > 168 && r < 192) return { side:"behind", seats:"any window" };
  return r < 180
    ? { side:"right", seats:"the right-hand side" }
    : { side:"left",  seats:"the left-hand side" };
}

/* Seat letters depend on the cabin, so the app states the ones that are almost
   always right and says which side in plain words alongside. */
const SEAT_LETTERS = { left:"A (and F on a widebody)", right:"F, J or K depending on the cabin" };

/* Features within sight, with the distance to the nearest ground they actually
   occupy — not to a centroid, and not to a rectangle that may be mostly sea. */
function featuresNear(pt, brg, altFt, maxKm){
  const lim = Math.min(maxKm || 300, horizonKm(altFt));
  const dLat = lim/111.32;
  const cosL = Math.max(0.05, Math.cos(rad(pt.lat)));
  const dLon = Math.min(180, lim/(111.32*cosL));
  const best = new Map();                       // feature index -> nearest km

  for (let la = pt.lat - dLat; la <= pt.lat + dLat + CELL_DEG; la += CELL_DEG){
    if (la < -90 || la > 90) continue;
    for (let lo = pt.lon - dLon; lo <= pt.lon + dLon + CELL_DEG; lo += CELL_DEG){
      const id = cellId(lo, la);
      const ids = CELL_INDEX.get(id);
      if (!ids) continue;
      const c = cellCentre(id);
      const km = distance(pt, c)/1000;
      if (km > lim) continue;
      for (const i of ids){
        const cur = best.get(i);
        if (cur === undefined || km < cur) best.set(i, km);
      }
    }
  }

  const out = [];
  for (const [i, km] of best){
    const f = FEATURES[i];
    /* Small, far, low-ranked things are not worth naming; anything overhead is. */
    if (km > 140 && f.rank > 3 && f.cells.length < 6) continue;
    const b = bearing(pt, cellCentre(nearestCellOf(f, pt)));
    const rel = (b - brg + 360) % 360;
    out.push({ ...f, km, brg:b, rel, overhead: km < CELL_DEG*60, ...sideOf(rel) });
  }
  out.sort((a,b) => (a.km - b.km) || (b.cells.length - a.cells.length));
  return out;
}

/* The occupied cell of this feature closest to the aircraft — used so the
   reported bearing points at the near edge, not at a distant centroid. */
function nearestCellOf(f, pt){
  let best = f.cells[0], bd = Infinity;
  for (const c of f.cells){
    const d = distance(pt, cellCentre(c));
    if (d < bd){ bd = d; best = c; }
  }
  return best;
}

/* ─── solar and lunar geometry along the track ─── */

/* Sample the whole flight at a fixed cadence, interpolating position and time
   between the engine's waypoints. */
function windowTimeline(R, stepMin = 2){
  const live = R.live;
  if (!live || live.length < 2) return [];
  const t0 = live[0].time.getTime(), t1 = live[live.length-1].time.getTime();
  const out = [];
  for (let t = t0; t <= t1; t += stepMin*60000){
    /* find the bracketing waypoints */
    let i = 1;
    while (i < live.length-1 && live[i].time.getTime() < t) i++;
    const a = live[i-1], b = live[i];
    const span = b.time.getTime() - a.time.getTime();
    const f = span > 0 ? clamp((t - a.time.getTime())/span, 0, 1) : 0;
    const p = interp(a, b, f);
    const when = new Date(t);
    const sun  = sunAltAz(when, p.lat, p.lon);
    const moon = moonAltAz(when, p.lat, p.lon);
    const ph   = moonPhase(toJulian(when));
    const brg  = bearing(a, b);
    out.push({
      time: when, lat:p.lat, lon:p.lon, brg,
      altFt: lerp(a.altFt, b.altFt, f),
      edr:   lerp(a.edr, b.edr, f),
      sunAlt: sun.alt, sunAz: sun.az,
      moonAlt: moon.alt, moonAz: moon.az,
      moonIllum: ph.illum,
      sunSide:  sideOf((sun.az  - brg + 360) % 360),
      moonSide: sideOf((moon.az - brg + 360) % 360),
      dark: sun.alt < -6,          // civil twilight or darker: stars start showing
      night: sun.alt < -18,        // astronomical night
    });
  }
  return out;
}

/* Sunrise and sunset as *experienced on board* — the aircraft is moving, often
   fast enough to change the answer. An eastbound transatlantic overnight can
   compress a sunrise into 20 minutes; a westbound one can hold the sun on the
   horizon for hours. Crossing the terminator is what matters, not the sunset
   time at either airport. */
function terminatorEvents(tl){
  const ev = [];
  for (let i=1;i<tl.length;i++){
    const p = tl[i-1], c = tl[i];
    for (const [name, alt] of [["sunset",-0.833],["sunrise",-0.833],
                               ["civil dusk",-6],["civil dawn",-6]]){
      const falling = name === "sunset" || name === "civil dusk";
      const crossed = falling ? (p.sunAlt >= alt && c.sunAlt < alt)
                              : (p.sunAlt <  alt && c.sunAlt >= alt);
      if (!crossed) continue;
      const f = (alt - p.sunAlt)/((c.sunAlt - p.sunAlt) || 1);
      const t = new Date(p.time.getTime() + f*(c.time - p.time));
      ev.push({ kind:name, time:t, az:c.sunAz, side:c.sunSide,
                minsIn: (t - tl[0].time)/60000, lat:c.lat, lon:c.lon });
    }
  }
  return ev;
}

/* ─── aurora ─── */

/* Geomagnetic latitude from a centred-dipole approximation. The auroral oval
   follows the geomagnetic field, not the geographic grid — which is why
   Edinburgh sees aurora far more often than Moscow at the same latitude.
   Pole position is the IGRF-13 dipole for the 2025 epoch. */
const GM_POLE = { lat: 80.7, lon: -72.7 };
function geomagLat(lat, lon){
  const p = rad(lat), pp = rad(GM_POLE.lat), dl = rad(lon - GM_POLE.lon);
  return deg(Math.asin(clamp(Math.sin(p)*Math.sin(pp) + Math.cos(p)*Math.cos(pp)*Math.cos(dl), -1, 1)));
}

/* NOAA's published equatorward boundary of the auroral oval, in corrected
   geomagnetic latitude, by Kp. Interpolated between the tabulated integers. */
const KP_BOUNDARY = [66.5, 64.5, 62.4, 60.4, 58.3, 56.3, 54.2, 52.2, 50.1, 48.0];
function auroraBoundary(kp){
  const k = clamp(kp, 0, 9), i = Math.floor(k);
  return i >= 9 ? KP_BOUNDARY[9] : lerp(KP_BOUNDARY[i], KP_BOUNDARY[i+1], k - i);
}

async function fetchKp(){
  try{
    const j = await getJSON("https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json", 1);
    if (!Array.isArray(j)) return null;
    return j.map(r => ({ t: Date.parse((r.time_tag || "") + "Z"), kp: +r.kp }))
            .filter(r => isFinite(r.t) && isFinite(r.kp));
  }catch{ return null; }
}
function kpAt(series, when){
  if (!series || !series.length) return null;
  const t = when.getTime();
  let best = null, bd = Infinity;
  for (const r of series){ const d = Math.abs(r.t - t); if (d < bd){ bd = d; best = r; } }
  /* Kp is a 3-hour index; beyond about 4 hours from a sample it is a guess. */
  return best && bd <= 4*3600e3 ? best.kp : null;
}

/* Aurora needs three things at once: dark sky, a high enough geomagnetic
   latitude for the oval to reach you, and a Kp that puts it there. */
function auroraAlong(tl, kpSeries){
  let best = null;
  const hits = [];
  for (const p of tl){
    if (!p.dark) continue;
    const kp = kpAt(kpSeries, p.time);
    if (kp === null) continue;
    const gm = Math.abs(geomagLat(p.lat, p.lon));
    const bound = auroraBoundary(kp);
    const margin = gm - bound;              // degrees poleward of the oval edge
    if (margin < -6) continue;              // too far south to bother mentioning
    const rec = { ...p, kp, gm, bound, margin,
                  chance: margin >= 4 ? "likely" : margin >= 0 ? "possible" : "marginal",
                  side: sideOf((p.lat > 0 ? 0 : 180) - p.brg + 360) };
    hits.push(rec);
    if (!best || margin > best.margin) best = rec;
  }
  return { best, hits, minutes: hits.length ? (hits.length * (tl[1] ? (tl[1].time - tl[0].time)/60000 : 2)) : 0 };
}
