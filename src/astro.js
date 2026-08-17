"use strict";
/* ══════════ ASTRONOMY ═══════════════════════════════════════════════════
   Sun and Moon positions, rise/set, twilight and lunar phase. No API, no data
   files: these are closed-form series and the sky is not a forecast.

   Accuracy is Meeus's low-precision solar/lunar theory — around 0.01° for the
   Sun and 0.1–0.3° for the Moon over the years this app cares about. That is
   far better than needed for "is it dark" and "where is the Moon", and it is
   the same maths the window-seat and seeing pages both need, so it lives here
   rather than in either of them.

   Reference: Meeus, "Astronomical Algorithms", 2nd ed., chapters 12, 13, 22,
   25 and 47. Refraction at the horizon follows the conventional −0.833°
   standard altitude for the Sun's upper limb. */

const DEG = Math.PI/180;
const J2000 = 2451545.0;

const toJulian  = d => d.getTime()/86400000 + 2440587.5;
const fromJulian = j => new Date((j - 2440587.5) * 86400000);
const centuries = j => (j - J2000)/36525;
const norm360 = a => ((a % 360) + 360) % 360;

/* ── obliquity and sidereal time ─────────────────────────────────────── */
function obliquity(T){
  return 23.439291 - 0.0130042*T - 1.64e-7*T*T + 5.04e-7*T*T*T;   // degrees
}
function gmst(j){
  const T = centuries(j);
  return norm360(280.46061837 + 360.98564736629*(j - J2000) + 0.000387933*T*T - T*T*T/38710000);
}

/* ── Sun ─────────────────────────────────────────────────────────────── */
function sunPosition(j){
  const T = centuries(j);
  const L0 = norm360(280.46646 + 36000.76983*T + 0.0003032*T*T);       // mean longitude
  const M  = norm360(357.52911 + 35999.05029*T - 0.0001537*T*T);       // mean anomaly
  const Mr = M*DEG;
  const C  = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(Mr)
           + (0.019993 - 0.000101*T)*Math.sin(2*Mr)
           + 0.000289*Math.sin(3*Mr);
  const trueLon = L0 + C;
  const lambda  = trueLon - 0.00569 - 0.00478*Math.sin((125.04 - 1934.136*T)*DEG);
  const eps = obliquity(T)*DEG;
  const lr  = lambda*DEG;
  return {
    ra:  norm360(Math.atan2(Math.cos(eps)*Math.sin(lr), Math.cos(lr))/DEG),
    dec: Math.asin(Math.sin(eps)*Math.sin(lr))/DEG,
    lambda: norm360(lambda),
    /* distance in AU, for the Moon's illuminated-fraction geometry */
    R: 1.000001018*(1 - 0.016708634*0.016708634 - 0.000042037*T*0.000042037)
       / (1 + 0.016708634*Math.cos(Mr + C*DEG)),
  };
}

/* ── Moon ────────────────────────────────────────────────────────────── */
function moonPosition(j){
  const T = centuries(j);
  const Lp = norm360(218.3164477 + 481267.88123421*T - 0.0015786*T*T);   // mean longitude
  const D  = norm360(297.8501921 + 445267.1114034*T - 0.0018819*T*T)*DEG; // mean elongation
  const M  = norm360(357.5291092 + 35999.0502909*T)*DEG;                  // Sun's mean anomaly
  const Mp = norm360(134.9633964 + 477198.8675055*T + 0.0087414*T*T)*DEG; // Moon's mean anomaly
  const F  = norm360(93.2720950 + 483202.0175233*T - 0.0036539*T*T)*DEG;  // argument of latitude

  /* Principal periodic terms — enough for a few arcminutes. */
  const lon = Lp
    + 6.289*Math.sin(Mp)     - 1.274*Math.sin(2*D - Mp) + 0.658*Math.sin(2*D)
    + 0.214*Math.sin(2*Mp)   - 0.186*Math.sin(M)        - 0.114*Math.sin(2*F)
    + 0.059*Math.sin(2*D - 2*Mp) + 0.057*Math.sin(2*D - M - Mp)
    + 0.053*Math.sin(2*D + Mp)   + 0.046*Math.sin(2*D - M)
    - 0.041*Math.sin(M - Mp);
  const lat = 5.128*Math.sin(F)
    + 0.281*Math.sin(Mp + F) - 0.278*Math.sin(F - Mp) + 0.176*Math.sin(2*D - F)
    + 0.115*Math.sin(2*D - Mp + F) - 0.055*Math.sin(2*D - Mp - F);
  const dist = 385000.56 - 20905.355*Math.cos(Mp) - 3699.111*Math.cos(2*D - Mp)
             - 2955.968*Math.cos(2*D) - 569.925*Math.cos(2*Mp);   // km

  const eps = obliquity(T)*DEG, lr = lon*DEG, br = lat*DEG;
  return {
    ra: norm360(Math.atan2(Math.sin(lr)*Math.cos(eps) - Math.tan(br)*Math.sin(eps), Math.cos(lr))/DEG),
    dec: Math.asin(Math.sin(br)*Math.cos(eps) + Math.cos(br)*Math.sin(eps)*Math.sin(lr))/DEG,
    dist, lambda: norm360(lon), beta: lat,
  };
}

/* Illuminated fraction and phase angle. 0 = new, 0.5 = full. */
function moonPhase(j){
  const s = sunPosition(j), m = moonPosition(j);
  const sunDistKm = s.R * 149597870.7;
  /* Geocentric elongation of the Moon from the Sun. */
  const psi = Math.acos(
    Math.sin(s.dec*DEG)*Math.sin(m.dec*DEG) +
    Math.cos(s.dec*DEG)*Math.cos(m.dec*DEG)*Math.cos((s.ra - m.ra)*DEG));
  /* Phase angle at the Moon, from the triangle Sun–Moon–Earth. */
  const i = Math.atan2(sunDistKm*Math.sin(psi), m.dist - sunDistKm*Math.cos(psi));
  const illum = (1 + Math.cos(i))/2;
  /* Waxing or waning, from the difference in ecliptic longitude. */
  const d = norm360(m.lambda - s.lambda);
  return {
    illum,
    waxing: d < 180,
    age: d/360 * 29.530588853,                 // days since new moon
    name: phaseName(d, illum),
  };
}
function phaseName(elongDeg, illum){
  if (illum < 0.02) return "New";
  if (illum > 0.98) return "Full";
  const waxing = elongDeg < 180;
  if (Math.abs(illum - 0.5) < 0.06) return waxing ? "First quarter" : "Last quarter";
  if (illum < 0.5) return waxing ? "Waxing crescent" : "Waning crescent";
  return waxing ? "Waxing gibbous" : "Waning gibbous";
}

/* ── horizontal coordinates ──────────────────────────────────────────── */
function altAz(ra, dec, j, lat, lon){
  const H = (gmst(j) + lon - ra)*DEG;      // local hour angle, east longitude positive
  const p = lat*DEG, d = dec*DEG;
  const alt = Math.asin(Math.sin(p)*Math.sin(d) + Math.cos(p)*Math.cos(d)*Math.cos(H));
  const az  = Math.atan2(Math.sin(H), Math.cos(H)*Math.sin(p) - Math.tan(d)*Math.cos(p));
  return { alt: alt/DEG, az: norm360(az/DEG + 180) };   // az from north, clockwise
}
const sunAltAz  = (date, lat, lon) => { const j = toJulian(date); return altAz(sunPosition(j).ra,  sunPosition(j).dec,  j, lat, lon); };
const moonAltAz = (date, lat, lon) => { const j = toJulian(date); const m = moonPosition(j); return altAz(m.ra, m.dec, j, lat, lon); };

/* ── rise / set / twilight ───────────────────────────────────────────── */
/* Scan the day in coarse steps and bisect any crossing of the target altitude.
   Robust at high latitude, where a closed-form solution has no answer at all:
   this simply returns null when the body never crosses, which is the truth. */
function crossings(date, lat, lon, targetAlt, bodyFn, stepMin = 10){
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const out = { rise: null, set: null };
  let prevT = start, prevA = bodyFn(start, lat, lon).alt - targetAlt;
  for (let m = stepMin; m <= 1440; m += stepMin){
    const t = new Date(start.getTime() + m*60000);
    const a = bodyFn(t, lat, lon).alt - targetAlt;
    if (prevA <= 0 && a > 0 && !out.rise) out.rise = bisect(prevT, t, lat, lon, targetAlt, bodyFn);
    if (prevA >= 0 && a < 0 && !out.set)  out.set  = bisect(prevT, t, lat, lon, targetAlt, bodyFn);
    prevT = t; prevA = a;
  }
  return out;
}
function bisect(t0, t1, lat, lon, target, bodyFn){
  let a = t0.getTime(), b = t1.getTime();
  for (let i = 0; i < 24; i++){
    const mid = (a + b)/2, v = bodyFn(new Date(mid), lat, lon).alt - target;
    const va = bodyFn(new Date(a), lat, lon).alt - target;
    if ((va <= 0) === (v <= 0)) a = mid; else b = mid;
  }
  return new Date((a + b)/2);
}

const SUN_ALT = { rise:-0.833, civil:-6, nautical:-12, astronomical:-18 };

function sunTimes(date, lat, lon){
  const r = {};
  for (const [k, alt] of Object.entries(SUN_ALT)){
    const c = crossings(date, lat, lon, alt, sunAltAz);
    r[k] = c;
  }
  return {
    sunrise: r.rise.rise, sunset: r.rise.set,
    civilDawn: r.civil.rise, civilDusk: r.civil.set,
    nauticalDawn: r.nautical.rise, nauticalDusk: r.nautical.set,
    astroDawn: r.astronomical.rise, astroDusk: r.astronomical.set,
  };
}
const moonTimes = (date, lat, lon) => crossings(date, lat, lon, 0.125, moonAltAz);
